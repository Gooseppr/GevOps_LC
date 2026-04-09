---
title: Projet J2 - Ansible avancé
sujet: Projet NocoDb
type: module
jour: 42
ordre: 1
tags: projet, docker, docker swarm, stack, ansible
---

# 🚀 Passage à Ansible “pro” pour le déploiement NocoDB + Postgres

Objectif de la journée :

partir du playbook **fonctionnel mais basique** (`swarm.yml`) pour arriver à une version **plus robuste, plus modulable et plus sécurisée** (`swarm-pro.yml`, `inventory-pro.ini`, `.env.j2`, `vault.yml`).

---

## 1. Rappel très rapide de la V1 “simple”

La V1 faisait déjà le job :

- configuration des hostnames,
- installation de Docker,
- init du Swarm sur le manager,
- join du worker,
- ajout des labels,
- copie de `compose.yml` + `.env`,
- `docker stack deploy …`.

Mais :

- le `.env` était en clair dans le repo,
- pas de **tags** → difficile de rejouer une partie seulement,
- pas de **gestion d’erreur structurée** (`block/rescue`),
- pas de génération dynamique de `.env`.

---

## 2. Ce qu'on a ajouté dans la V2 “pro”

### 2.1. Des tags pour piloter le playbook comme un pro

On a rajouté des **tags** sur chaque bloc du playbook : 
swarm-pro

```yaml
- name: 0) Configurer les hostnames Linux
  hosts: swarm_all
  become: true
  tags: [hostnames]

- name: 1. Installer Docker sur toutes les VMs
  hosts: swarm_all
  become: true
  tags: [docker]

- name: 2. Initialiser le Swarm sur le manager
  hosts: swarm_managers
  become: true
  tags: [swarm]

- name: 3. Joindre les workers au Swarm
  hosts: swarm_workers
  become: true
  tags: [swarm, swarm_join]

- name: 4) Ajouter les labels sur les nœuds (depuis le manager)
  hosts: swarm_all
  become: true
  tags: [swarm, labels]

- name: 5. Déployer la stack NocoDB + Postgres
  hosts: swarm_managers
  become: true
  tags: [deploy]

```

👉 Ce que ça t’apporte :

- Rejouer **uniquement ce qui t’intéresse**, par exemple :

```bash
ansible-playbook -i inventory-pro.ini swarm-pro.yml --tags deploy
ansible-playbook -i inventory-pro.ini swarm-pro.yml --tags swarm_join

```

- En prod, on pourra :
    - réinstaller Docker sans toucher au Swarm,
    - redéployer la stack sans casser les nœuds,
    - relancer seulement les labels si on ajoutes des workers.

---

### 2.2. Ajout de `block / rescue` pour un join & un deploy plus robustes

On a introduit des blocs **`block` / `rescue`** sur deux moments critiques :

1. le **join des workers au Swarm**,
2. le **déploiement de la stack**.

### a) Join des workers avec bloc de secours

```yaml
- name: 3. Joindre les workers au Swarm
  hosts: swarm_workers
  become: true
  tags: [swarm, swarm_join]
  vars:
    manager_name: "{{ groups['swarm_managers'][0] }}"
    manager_ip: "{{ hostvars[manager_name].swarm_manager_ip | default(hostvars[manager_name].ansible_default_ipv4.address) }}"
    worker_token: "{{ hostvars[manager_name].swarm_worker_token }}"
  tasks:
    - block:
        - name: Vérifier l'état local du Swarm sur le worker
          shell: docker info --format '{{ "{{ .Swarm.LocalNodeState }}" }}'
          register: worker_swarm_state
          changed_when: false
          failed_when: false

        - name: Quitter un Swarm existant sur le worker (si déjà actif)
          shell: docker swarm leave --force
          when: worker_swarm_state.stdout is defined and worker_swarm_state.stdout | trim == "active"

        - name: Joindre le Swarm en tant que worker
          shell: docker swarm join --token {{ worker_token }} {{ manager_ip }}:2377
          register: join_result
          when: worker_swarm_state.stdout is not defined or worker_swarm_state.stdout | trim != "active"
          retries: 5
          delay: 5
          until: join_result.rc == 0 or 'already part of a swarm' in join_result.stderr
          failed_when: >
            join_result.rc != 0 and
            'already part of a swarm' not in join_result.stderr

        - name: Vérifier côté worker que le Swarm est actif après join
          shell: docker info --format '{{ "{{ .Swarm.LocalNodeState }}" }}'
          register: worker_swarm_state_final
          changed_when: false

        - name: Échouer si le Swarm n'est toujours pas actif sur le worker
          fail:
            msg: "Le Swarm n'est pas actif sur le worker {{ inventory_hostname }} (état={{ worker_swarm_state_final.stdout | trim }})."
          when: worker_swarm_state_final.stdout | trim != "active"

        - name: Attendre que le nœud soit visible côté manager et Ready/Active
          delegate_to: "{{ manager_name }}"
          shell: docker node ls --format '{{ "{{ .Hostname }} {{ .Status }} {{ .Availability }}" }}'
          register: node_list
          retries: 12
          delay: 5
          until: node_list.stdout is search(inventory_hostname + " Ready Active")
          changed_when: false
          failed_when: node_list.stdout is not search(inventory_hostname + " Ready Active")

      rescue:
        - debug:
            msg: "Échec lors du join du worker {{ inventory_hostname }} au Swarm"
        - fail:
            msg: "Arrêt du playbook car le worker {{ inventory_hostname }} n'a pas pu rejoindre le Swarm."

```

**Problèmes rencontrés :**

- Plusieurs erreurs de type :
    - `unexpected parameter type in action`,
    - `no module/action detected in task`,
    - `conflicting action statements`.
- En réalité, c’était **uniquement de la syntaxe YAML / Ansible** :
    - `block:` doit être une tâche à part entière,
    - `rescue:` doit être aligné sous `block` (même indentation que les tâches du `block`),
    - chaque tâche dans `rescue` doit avoir un `name` + le module (`debug`, `fail`, …).

👉 Ce que ça t’apporte :

- Si un worker ne rejoint pas correctement le Swarm, on a maintenant :
    - un message clair (`debug`),
    - un `fail` explicite qui stoppe tout le playbook au lieu de continuer à demi-cassé.

### b) Déploiement de la stack avec rollback logique

Sur la partie déploiement : 
swarm-pro

```yaml
- name: 5. Déployer la stack NocoDB + Postgres
  hosts: swarm_managers
  become: true
  tags: [deploy]
  vars:
    stack_name: mystack
    deploy_path: /opt/nocodb
  tasks:
    - name: Créer le répertoire de déploiement
      file:
        path: "{{ deploy_path }}"
        state: directory
        mode: '0755'

    - name: Copier compose.yml sur le manager
      copy:
        src: files/compose.yml
        dest: "{{ deploy_path }}/compose.yml"
        mode: '0644'

    - name: Générer le .env depuis le template et les vars (dont Vault)
      template:
        src: files/.env.j2
        dest: "{{ deploy_path }}/.env"
        mode: '0640'

    - block:
        - name: Déployer la stack Docker Swarm
          shell: docker stack deploy -c {{ deploy_path }}/compose.yml {{ stack_name }}
          args:
            chdir: "{{ deploy_path }}"

        - name: Afficher les services de la stack
          shell: docker stack services {{ stack_name }}
          register: stack_services

        - name: Debug - services de la stack
          debug:
            var: stack_services.stdout

      rescue:
        - debug:
            msg: "Échec lors du déploiement de la stack {{ stack_name }} sur {{ inventory_hostname }}"
        - fail:
            msg: "Arrêt du playbook car le déploiement de la stack {{ stack_name }} a échoué."

```

👉 Résultat :

- Si `docker stack deploy` foire (erreur YAML, stack cassée, réseau inexistant…),
    
    on voit tout de suite **où** ça coince et le playbook s’arrête avec un message propre.
    

---

### 2.3. Passage du `.env` en clair au `.env.j2` + Vault

Avant, on avait un fichier `.env` **en dur** dans le repo : 
.env

```
POSTGRES_HOST=root_db
POSTGRES_DB=nocodb_db
POSTGRES_USER=admin
POSTGRES_PASSWORD=passwordSécur1té
NC_DB=pg://root_db:5432?u=admin&p=passwordSécur1té&d=nocodb_db

```

Maintenant on a :

- un **template** `.env.j2` dans `files/`,
- des **variables sensibles** dans `group_vars/all/vault.yml` (chiffré),
- une tâche `template` qui génère le `.env` sur le manager. swarm-pro

Exemple logique de `.env.j2` (sans dévoiler les secrets) :

```
POSTGRES_HOST={{ postgres_host }}
POSTGRES_DB={{ postgres_db }}
POSTGRES_USER={{ postgres_user }}
POSTGRES_PASSWORD={{ postgres_password }}
NC_DB=pg://{{ postgres_host }}:5432?u={{ postgres_user }}&p={{ postgres_password }}&d={{ postgres_db }}

```

Et côté Vault (fichier chiffré) :

```yaml
postgres_host: root_db
postgres_db: nocodb_db
postgres_user: admin
postgres_password: "motDePasseSuperSecret"

```

**Commandes importantes qu'on a utilisées :**

```bash
# créer / éditer le Vault
ansible-vault create group_vars/all/vault.yml
ansible-vault edit group_vars/all/vault.yml

# lancer le playbook en utilisant le Vault
ansible-playbook -i inventory-pro.ini swarm-pro.yml --ask-vault-pass

```

👉 Ce que ça t’apporte :

- Plus de secrets en clair dans Git.
- Le mot de passe DB peut être modifié **sans toucher** au playbook ou au compose :
    - on modifie juste `vault.yml`,
    - on relance le playbook avec `-tags deploy`.

---

### 2.4. Réutilisation de l’inventaire et ajout de workers applicatifs

L'inventaire “pro” ressemble à ça : 
inventory-pro

```
[swarm_managers]
app-vm ansible_host=13.37.250.89 ansible_user=admin swarm_role=app ansible_ssh_private_key_file=/workspaces/dev-env/key/web-server.pem

[swarm_workers]
db-vm         ansible_host=35.180.42.29 ansible_user=admin swarm_role=db  ansible_ssh_private_key_file=/workspaces/dev-env/key/web-server.pem
app-replica   ansible_host=13.38.117.254 ansible_user=admin swarm_role=app ansible_ssh_private_key_file=/workspaces/dev-env/key/web-server.pem
app-replica2  ansible_host=35.180.41.200 ansible_user=admin swarm_role=app ansible_ssh_private_key_file=/workspaces/dev-env/key/web-server.pem

[swarm_all:children]
swarm_managers
swarm_workers

```

On a donc :

- 1 manager (`app-vm`, rôle `app`),
- 1 worker DB (`db-vm`, rôle `db`),
- 2 workers applicatifs (`app-replica`, `app-replica2`, rôle `app`).

Ces rôles sont utilisés par le **play des labels** et par le `placement.constraints` de le `compose.yml`.

Résultat :

- `root_db` ne sera déployé **que** sur les nœuds `role=db`,
- `nocodb` ne sera déployé **que** sur les nœuds `role=app`,
- et on voit maintenant clairement la répartition en faisant :

```bash
docker node ls
docker service ps mystack_nocodb
docker service ps mystack_root_db

```

---

### 2.5. Compose toujours simple, mais aligné avec l’Ansible “pro”

Le `compose.yml` reste relativement simple, mais il est maintenant **pensé pour Swarm + Ansible** : 
compose

```yaml
version: "3.9"

networks:
  backend:
    driver: overlay

services:
  root_db:
    image: postgres:16
    env_file:
      - .env
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \"$POSTGRES_USER\" -d \"$POSTGRES_DB\""]
      interval: 10s
      timeout: 2s
      retries: 10
    volumes:
      - db_data:/var/lib/postgresql/data
    networks:
      - backend
    deploy:
      placement:
        constraints:
          - node.labels.role == db

  nocodb:
    image: nocodb/nocodb:latest
    env_file:
      - .env
    ports:
      - "8080:8080"
    volumes:
      - nc_data:/usr/app/data
    networks:
      - backend
    deploy:
      replicas: 1
      restart_policy:
        condition: on-failure
      placement:
        constraints:
          - node.labels.role == app

volumes:
  db_data: {}
  nc_data: {}

```

Couplé à Ansible, cela donne :

- `.env` généré dynamiquement en amont,
- réseau `backend` automatiquement créé par `docker stack deploy`,
- bonne répartition des services via les labels appliqués par le playbook.

---

## 3. Résumé des gros problèmes rencontrés pendant la transformation

1. **Erreurs de syntaxe avec `block/rescue`**
    - Mauvaise indentation, `rescue` mal aligné, tâches sans module.
    - Corrigé en respectant strictement la structure :
        - `block:` (tâche),
        - liste de tâches,
        - `rescue:` au même niveau que les tâches du block,
        - `name` + module pour chaque tâche du `rescue`.
2. **Variable `worker_token` non définie dans les essais avec d’autres approches**
    - Finalement le choix a été de **rester sur du `shell`** pour le join (`docker swarm join …`) tout en conservant la logique robuste qu'on avait déjà.
3. **Copies de `.env` vs génération**
    - Au début, on recopie `.env` en dur.
    - Migration pas évidente vers `.env.j2` + Vault (chemin, droits, template).
    - Maintenant la génération est propre et centralisée.

---

## 4. Ce qu'on a gagné avec cette V2 “Ansible avancé”

En résumé, aujourd’hui on a :

- Un playbook **pilotable par tags** (`hostnames`, `docker`, `swarm`, `swarm_join`, `labels`, `deploy`).
- Une gestion d’erreurs claire sur les étapes critiques (**join** + **deploy**) grâce à `block/rescue`.
- Des **secrets sortis du Git** et gérés proprement via **Ansible Vault** + template `.env.j2`.
- Un inventaire prêt pour la **scalabilité** (plusieurs workers applicatifs).
- Un déploiement **reproductible, sécurisé et évolutif** pour NocoDB + Postgres sur Docker Swarm.

---
[← Module précédent](M42_projet-board-J02.md) | [Module suivant →](M42_ansible-image.md)

---

<!-- snippet
id: ansible_pro_tags_playbook
type: command
tech: ansible
level: intermediate
importance: high
format: knowledge
tags: ansible,tags,playbook,ciblage
title: Cibler une partie d'un playbook Ansible avec --tags
context: limiter l'exécution à une ou plusieurs étapes spécifiques
command: ansible-playbook -i inventory-pro.ini swarm-pro.yml --tags deploy
description: Exécute uniquement les tâches marquées avec le tag spécifié. Utiliser `--skip-tags` pour exclure. Utile en CI/CD pour redéployer la stack sans toucher au cluster.
-->

<!-- snippet
id: ansible_pro_block_rescue
type: concept
tech: ansible
level: intermediate
importance: high
format: knowledge
tags: ansible,block,rescue,gestion-erreur
title: Gestion d'erreurs structurée avec block/rescue dans Ansible
context: Intercepter les échecs sur des étapes critiques (join Swarm, deploy stack) et produire un message clair
content: Dans block/rescue, le bloc rescue doit être aligné avec les tâches du block. Chaque tâche rescue nécessite un name et un module (debug, fail), sinon Ansible lève "no module detected".
-->

<!-- snippet
id: ansible_pro_env_j2_vault
type: concept
tech: ansible
level: intermediate
importance: high
format: knowledge
tags: ansible,vault,template,env,secrets
title: Générer un fichier .env dynamiquement depuis un template Jinja2 et Ansible Vault
context: Remplacer un .env statique en clair par une génération sécurisée via template et Vault
content: Créer files/.env.j2 avec des variables Jinja2 et stocker les secrets dans vault.yml chiffré. Le module template génère le .env sur le serveur ; changer un secret nécessite juste --tags deploy.
-->

<!-- snippet
id: ansible_pro_inventory_scalable
type: concept
tech: ansible
level: intermediate
importance: medium
format: knowledge
tags: ansible,inventory,workers,scalabilite
title: Inventaire Ansible scalable avec plusieurs workers applicatifs
context: Ajouter des nœuds applicatifs supplémentaires sans modifier le playbook
content: Structurer l'inventaire avec [swarm_managers], [swarm_workers] et [swarm_all:children], chaque hôte portant un swarm_role. Ajouter un worker dans [swarm_workers] suffit : labels et contraintes s'appliquent automatiquement.
-->

---
[← Module précédent](M42_projet-board-J02.md) | [Module suivant →](M42_ansible-image.md)
---
