---
title: Projet J04 - Ansible avancé (rôles)
sujet: Projet
type: module
jour: 44
ordre: 0
tags: projet
---

# Évolution de mon Ansible Swarm — de v4 à v5

Aujourd’hui j’ai transformé mon vieux gros playbook “one-shot” en un **vrai projet Ansible structuré**, avec des rôles, des playbooks ciblés et une gestion propre de Docker Swarm et de NocoDB.

On résume ici **ce qu'on a changé**, **pourquoi on l’a fait**, et **ce que ça nous apporte**.

---

## 0. Contexte : ce que faisait mon ancien playbook (v4)

Avant, on avait un **seul gros `main.yml`** qui enchaînait :

- configuration des hostnames,
- installation de Docker avec `apt` et quelques `shell: docker ...`,
- initialisation du Swarm sur le manager,
- join des workers avec des commandes `docker swarm join`,
- ajout de labels via `docker node update`,
- login au registry GitLab avec `docker login` en shell,
- pull de l’image NocoDB,
- déploiement de la stack avec `docker stack deploy`,
- un check “maison” des réplicas via `docker service ls`.

Problèmes :

- peu **modulaire** (tout dans un seul fichier),
- beaucoup de `shell:` / `command:` pour des choses où Ansible a des **modules dédiés**,
- difficile d’ajouter une nouvelle VM ou un nouveau rôle sans toucher partout,
- gestion des tokens Swarm fragile (join/leave pas toujours propres),
- difficile à réutiliser dans un pipeline CI/CD.

---

## 1. Restructuration d'Ansible en rôles (architecture v5)

On est passé à une architecture **par rôles**, avec un playbook orchestrateur.

### 1.1. Les rôles principaux

On a maintenant :

- `roles/common`
    
    → gestion des **hostnames** et de `/etc/hosts`
    
- `roles/docker`
    
    → installation de Docker + Docker SDK Python + login au registry GitLab
    
- `roles/swarm-manager`
    
    → initialisation du Swarm et exposition des tokens
    
- `roles/swarm-worker`
    
    → join propre des workers au cluster Swarm
    
- `roles/swarm-labels`
    
    → ajout de labels `role=app`, `role=db`, etc. sur chaque nœud
    
- `roles/nocodb`
    
    → pull de l’image NocoDB, génération du `compose.yml` + `.env`, déploiement de la stack et vérification des réplicas
    

On les appelle depuis un **playbook principal** (par exemple `playbooks/run.yml`) qui ressemble grosso modo à :

```yaml
- name: Configurer la base commune sur toutes les VMs
  hosts: swarm_all
  become: true
  roles:
    - common

- name: Configurer le manager Swarm
  hosts: swarm_manager
  become: true
  collections:
    - community.docker
  roles:
    - docker
    - swarm-manager
    - nocodb     # déploiement de la stack sur le manager

- name: Configurer les workers Swarm
  hosts: swarm_workers
  become: true
  collections:
    - community.docker
  roles:
    - docker
    - swarm-worker

- name: Ajouter les labels Swarm
  hosts: swarm_all
  become: true
  roles:
    - swarm-labels

```

👉 Ça me permet de **relancer seulement une partie** facilement, et de faire évoluer chaque rôle indépendamment.

---

## 2. J’ai industrialisé la partie Docker (rôle `docker`)

### 2.1. Installation propre de Docker

Dans le rôle `docker`, on fait maintenant :

- installation des prérequis :
    
    ```yaml
    apt:
      name:
        - ca-certificates
        - curl
        - gnupg
      state: present
      update_cache: yes
    
    ```
    
- installation de Docker :
    
    ```yaml
    apt:
      name: docker.io
      state: present
    
    ```
    
- activation du service :
    
    ```yaml
    service:
      name: docker
      state: started
      enabled: true
    
    ```
    

### 2.2. Installation du SDK Docker pour Python

Les modules `community.docker` ont besoin du **SDK Docker Python** sur les machines distantes.

On l’installe dans le rôle :

```yaml
- name: Installer le SDK Docker pour Python
  ansible.builtin.command:
    cmd: /usr/bin/pip3 install docker --break-system-packages
  changed_when: "'Successfully installed' in command_result.stdout"

```

👉 Ça évite l’erreur :

> No module named 'docker'
> 

et rend les modules `community.docker.*` utilisables partout.

### 2.3. Login GitLab Registry via `community.docker.docker_login`

Au lieu de faire un `shell: docker login ...`, j’utilise maintenant :

```yaml
- name: Login au registry GitLab avec community.docker
  community.docker.docker_login:
    registry_url: "{{ gitlab_registry_url }}"
    username: "{{ gitlab_registry_user }}"
    password: "{{ gitlab_registry_token }}"
    reauthorize: true
    state: present

```

Les valeurs viennent de mon **vault** : `group_vars/all/vault.yml` (chiffré), qui contient :

```yaml
gitlab_registry_url: "registry.gitlab.com"
gitlab_registry_user: "gregoire.elmacin"
gitlab_registry_token: "glpat-..."

```

J’ai vérifié que le token était bien disponible sur les hôtes avec :

```bash
ansible -i inventory/inventory.ini swarm_manager \
  -m debug -a "var=gitlab_registry_token" --ask-vault-pass

```

👉 Résultat : les workers et le manager sont authentifiés proprement auprès du registry GitLab, de façon déclarative.

---

## 3. On a fiabilisé le Swarm côté manager (rôle `swarm-manager`)

Avant, on faitais :

- `docker swarm init --advertise-addr ...` en `shell`
- puis `docker swarm join-token -q worker` et `manager` en `shell`
- avec de la logique manuelle pour vérifier si c’était déjà actif.

Maintenant, on fait ça en modules :

### 3.1. Initialisation idempotente du Swarm

```yaml
- name: Initialiser le Swarm en mode manager (idempotent)
  community.docker.docker_swarm:
    state: present
    advertise_addr: "{{ advertise_addr | default(ansible_default_ipv4.address) }}"
  register: swarm_init_result

```

👉 Si le Swarm existe déjà, la tâche est **idempotente**.

### 3.2. Récupération des infos Swarm et des tokens

```yaml
- name: Récupérer les informations Swarm du manager
  community.docker.docker_swarm_info:
  register: swarm_info
  changed_when: false

```

Puis on vérifie via `docker info` que le Swarm est bien actif :

```yaml
- name: Vérifier l'état local du Swarm via docker info
  command: docker info --format '{{ "{{ .Swarm.LocalNodeState }}" }}'
  register: manager_swarm_state
  changed_when: false

- name: Échouer si le Swarm n'est pas actif sur le manager
  fail:
    msg: >
      Le Swarm n'est pas actif sur {{ inventory_hostname }}.
      État retourné : {{ manager_swarm_state.stdout | default('N/A') | trim }}
  when: manager_swarm_state.stdout | default('') | trim != "active"

```

### 3.3. Exposition des tokens comme facts

Enfin, on expose les tokens et l’IP du manager :

```yaml
- name: Exposer les tokens Swarm (worker & manager) comme facts
  set_fact:
    swarm_worker_token: "{{ swarm_info.swarm_facts.JoinTokens.Worker }}"
    swarm_manager_token: "{{ swarm_info.swarm_facts.JoinTokens.Manager }}"
    swarm_manager_ip: "{{ advertise_addr | default(ansible_default_ipv4.address) }}"

```

👉 Ces facts sont ensuite utilisés par le rôle `swarm-worker` pour rejoindre proprement.

---

## 4. On a fiabilisé le join des workers (rôle `swarm-worker`)

Avant, j’avais un gros bloc avec :

- `docker info` en shell,
- `docker swarm leave --force`,
- `docker swarm join --token ...` en shell,
- beaucoup de conditions pour tenter de nettoyer un ancien Swarm.

Maintenant j’utilise **`community.docker.docker_swarm`** côté worker :

### 4.1. Vérifier l’état initial

```yaml
- name: Vérifier l'état local du Swarm
  command: docker info --format '{{ "{{ .Swarm.LocalNodeState }}" }}'
  register: worker_swarm_state
  changed_when: false
  failed_when: false

```

### 4.2. Quitter un ancien Swarm si besoin

```yaml
- name: Quitter un Swarm existant si le nœud est déjà actif
  community.docker.docker_swarm:
    state: absent
    force: true
  when: worker_swarm_state.stdout | default('') | trim == "active"
  register: leave_result
  failed_when: false

```

### 4.3. Joindre le Swarm du manager avec le token exposé

```yaml
- name: Joindre le Swarm manager avec community.docker.docker_swarm
  community.docker.docker_swarm:
    state: join
    advertise_addr: "{{ advertise_addr | default(ansible_default_ipv4.address) }}"
    join_token: "{{ swarm_worker_token }}"
    remote_addrs:
      - "{{ swarm_manager_ip }}:2377"
  register: join_result
  retries: 3
  delay: 5
  until: join_result is succeeded

```

### 4.4. Vérification finale côté worker

```yaml
- name: Vérifier que le Swarm est actif côté worker
  command: docker info --format '{{ "{{ .Swarm.LocalNodeState }}" }}'
  register: worker_swarm_state_after
  changed_when: false

- name: Échouer si le worker n'est pas dans le Swarm
  fail:
    msg: >
      Le worker {{ inventory_hostname }} n'a pas pu rejoindre le Swarm
      (état final = {{ worker_swarm_state_after.stdout | default('N/A') | trim }}).
  when: worker_swarm_state_after.stdout | default('') | trim != "active"

```

👉 Résultat : le join des workers est **déclaratif, idempotent et robuste**.

---

## 5. On a mis les labels Swarm dans un rôle dédié (`swarm-labels`)

Plutôt que d’éparpiller la gestion des labels, j’ai un rôle `swarm-labels` qui :

1. Récupère le `NodeID` de chaque nœud :
    
    ```yaml
    - name: Récupérer l'ID du nœud local dans le Swarm
      command: docker info --format '{{ "{{ .Swarm.NodeID }}" }}'
      register: swarm_node
      changed_when: false
    
    ```
    
2. Applique le label depuis le manager (avec `delegate_to`) :
    
    ```yaml
    - name: Ajouter le label role={{ swarm_role }} sur le nœud (depuis le manager)
      command: docker node update --label-add role={{ swarm_role }} {{ swarm_node.stdout | trim }}
      delegate_to: "{{ groups['swarm_manager'][0] }}"
      when: swarm_role is defined
    
    ```
    

👉 Ça nous permet, depuis l’inventaire, de définir :

```
[swarm_managers]
master-vm swarm_role=manager ...

[swarm_app]
app-vm  swarm_role=app ...
app-vm2 swarm_role=app ...
app-vm3 swarm_role=app ...

[swarm_db]
db-vm   swarm_role=db ...

```

Et d’avoir des labels cohérents pour les contraintes Swarm.

---

## 6. On a professionnalisé le déploiement NocoDB (rôle `nocodb`)

### 6.1. Pull de l’image privée GitLab via `docker_image`

On utilise maintenant :

```yaml
- name: Pull l'image NocoDB depuis le registry GitLab (version figée)
  community.docker.docker_image:
    name: "registry.gitlab.com/quickdata-batch22-group/nocodb/quickdata/nocodb:0.1.0"
    source: pull
    state: present
    force_source: true
  register: pull_result

```

L’auth est gérée **dans le rôle `docker`** via `docker_login`, donc on n’a plus besoin de `username/password` ici.

### 6.2. Templates de déploiement

On génère :

- le répertoire cible :
    
    ```yaml
    file:
      path: /opt/nocodb
      state: directory
    
    ```
    
- le `compose.yml` :
    
    ```yaml
    template:
      src: compose.yml.j2
      dest: /opt/nocodb/compose.yml
    
    ```
    
- le `.env` :
    
    ```yaml
    template:
      src: .env.j2
      dest: /opt/nocodb/.env
    no_log: true
    
    ```
    

Les valeurs sensibles (mot de passe Postgres, NC_DB, etc.) viennent de mon vault.

### 6.3. Déploiement Swarm avec `-with-registry-auth`

C’était un gros point : les workers refusaient de pull l’image (erreurs `No such image`), car ils n’avaient pas les credentials du manager.

On a corrigé le déploiement :

```yaml
- name: Déployer la stack Swarm (avec credentials registry)
  command: >
    docker stack deploy
    --with-registry-auth
    -c /opt/nocodb/compose.yml
    mystack
  register: deploy_result
  changed_when: >
    'Updating service' in deploy_result.stdout or
    'Creating service' in deploy_result.stdout

```

👉 Maintenant, les workers peuvent pull l’image privée GitLab.

### 6.4. Vérification intelligente des réplicas NocoDB

Au lieu de faire un check instantané, on fait un **wait avec retry** :

```yaml
- name: Attendre que le service NocoDB ait au moins 1 réplique active
  command: docker service ls --format '{{ "{{ .Name }} {{ .Replicas }}" }}'
  register: services
  changed_when: false
  retries: 12
  delay: 5
  until: services.stdout is search('mystack_nocodb [1-9][0-9]*/[1-9][0-9]*')

- name: Échouer si après attente NocoDB n'a toujours pas de réplique active
  fail:
    msg: >
      Le service NocoDB n'a pas de réplique active après timeout.
      docker service ls :
      {{ services.stdout_lines | default([]) }}
  when: services.stdout is not search('mystack_nocodb [1-9][0-9]*/[1-9][0-9]*')

```

👉 Si `mystack_nocodb` finit à `1/1`, Ansible est content.

👉 Si on reste bloqué à `0/1`, j’ai un vrai signal de problème applicatif.

---

## 7. On a ajouté un playbook de nettoyage Swarm

En debug, j’ai vu que mon cluster accumulait :

- des **nodes `Down`** (plusieurs IDs pour `app-vm`, `app-vm2`, `app-vm3`, `db-vm`),
- des services avec des réplicas bizarres (`mystack_root_db 5/1`, `mystack_nocodb 2/1`).

On a donc créé un **playbook spécial nettoyage** (par exemple `playbooks/cleanup-swarm.yml`) qui :

1. Liste les nœuds :
    
    ```yaml
    docker node ls --format '{{.ID}} {{.Hostname}} {{.Status}}'
    
    ```
    
2. Supprime les nœuds en statut `Down` :
    
    ```yaml
    - name: Supprimer les nœuds Swarm en statut Down
      command: docker node rm {{ item.split()[0] }}
      loop: "{{ swarm_nodes.stdout_lines }}"
      when: "'Down' in item"
      ignore_errors: true
    
    ```
    
3. Recale les services :
    
    ```yaml
    - name: S'assurer que les services mystack ont 1 réplique
      command: >
        docker service scale
        mystack_nocodb=1
        mystack_root_db=1
    
    ```
    

👉 Ça permet de repartir sur un cluster plus propre (moins de fantômes, réplicas alignés avec la config).

---

## 8. Ce que j’ai gagné avec cette évolution

En résumé, avec cette v5 :

- On a une **architecture Ansible modulaire** basée sur des rôles clairs.
- On utilise les **modules officiels `community.docker`** plutôt que des `shell` bruts.
- La gestion de Docker Swarm est **idempotente et fiable** :
    - init manager,
    - join des workers,
    - labels,
    - tokens.
- Le déploiement NocoDB est :
    - versionné (`0.1.0`),
    - sécurisé (registry privé + vault),
    - supervisé (check réplicas avec retry).
- On a des outils pour :
    - **débugger** (debug facts, swarm_info),
    - **nettoyer** (playbook cleanup-swarm),
    - **rejouer** facilement (playbooks ciblés).

---
[Module suivant →](M44_projet-board-J04.md)
---
