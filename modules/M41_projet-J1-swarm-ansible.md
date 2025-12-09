---
title: Projet J1
sujet: Projet
type: module
jour: 41
ordre: 2
tags: projet, docker, docker swarm, stack, ansible
---

# 🚀 Récapitulatif complet : Automatisation du déploiement NocoDB + Postgres via Docker Swarm + Ansible

---

# 1️⃣ Objectif du projet

Automatiser entièrement un déploiement de production :

- 2 VMs sur AWS (manager + worker)
- Docker Swarm
- Un réseau overlay
- Un Postgres déployé sur le nœud `db`
- Un NocoDB déployé sur le nœud `app`
- Un système Ansible qui configure, installe, rejoint le cluster et déploie la stack automatiquement

---

# 2️⃣ Les problèmes rencontrés et comment tu les as résolus

Je te détaille **tous les blocages**, avec **ce qui n'allait pas**, **comment tu l’as compris**, et **la solution que tu as mise en place**.

---

## 🧩 Problème 1 — Le worker ne rejoignait pas le Swarm

### ❌ Symptômes

- `db-vm` avait plusieurs NodeID
- Le Swarm affichait plusieurs entrées “db-vm”, certaines en “Down”
- Le label ne s’appliquait pas

### 📌 Cause

Le worker rejoignait parfois, mais pas avec la bonne IP, ou alors il ne quittait pas correctement un ancien Swarm.

### ✅ Solution mise en place

Tu as renforcé l'étape Ansible de join :

- quitter proprement un Swarm existant
- vérifier l’état avant/après
- attendre que le nœud soit **Ready Active** côté manager
- fail si quelque chose ne va pas

👉 Résultat : join fiable à 100%.

---

## 🧩 Problème 2 — Les labels Swarm ne s’appliquaient pas

### ❌ Symptôme

Le rôle `app` et `db` n’était pas appliqué sur tous les nœuds.

### 📌 Cause

La tâche Ansible utilisait une mauvaise logique (run_once, mauvaise récupération NodeID).

### ✅ Solution

Tu as corrigé :

- récupération réelle du NodeID via `docker info`
- fail explicite si NodeID absent
- `delegate_to: manager` pour appliquer les labels depuis le bon nœud
- pas de `run_once`: exécution pour chaque nœud

👉 Résultat :

`app-vm` a bien `role=app`

`db-vm` a bien `role=db`

Et les placements fonctionnent 🎯

---

## 🧩 Problème 3 — Postgres ne démarrait pas

### ❌ Symptômes

- `postgres:16` en boucle FAILED
- code exit(1)
- pas plus de logs

### 📌 Cause

Le conteneur n’avait **pas accès à un réseau overlay valide** → impossible de résoudre son propre hostname.

### ✅ Solution

Tu as ajouté :

```yaml
networks:
  backend:
    driver: overlay

```

Et dans chaque service :

```yaml
networks:
  - backend

```

👉 Résultat :

`mystack_backend` créé automatiquement → Postgres démarre.

---

## 🧩 Problème 4 — NocoDB ne trouvait pas Postgres (ENOTFOUND root_db)

### ❌ Symptômes

```
Error: getaddrinfo ENOTFOUND root_db

```

### 📌 Cause

- Soit Postgres ne démarrait pas (problème 3)
- Soit la variable `NC_DB` était mal construite
- Soit le réseau overlay n’existait pas

### ✅ Solution

Tu as corrigé les variables :

### Avant (mauvais) :

```
NC_DB=pg://:5432?u=&p=&d=

```

### Après (bon) :

```
POSTGRES_HOST=root_db
POSTGRES_DB=nocodb_db
POSTGRES_USER=admin
POSTGRES_PASSWORD=passwordSécur1té
NC_DB=pg://root_db:5432?u=admin&p=passwordSécur1té&d=nocodb_db

```

👉 Résultat :

NocoDB démarre et se connecte à Postgres comme prévu 🎉

---

## 🧩 Problème 5 — Ansible échouait lors du `docker stack deploy`

### ❌ Symptôme

```
service root_db: undefined network "backend"

```

### 📌 Cause

Le réseau overlay n’était pas déclaré.

### ✅ Solution

Tu as ajouté :

```yaml
networks:
  backend:
    driver: overlay

```

👉 Résultat : le `stack deploy` fonctionne sans erreur.

---

# 3️⃣ Ajustements du plan initial avant d’ajouter les workers

Avant de passer à l’étape « 3. Joindre les workers au Swarm », j’ai dû adapter plusieurs éléments de mon plan de départ pour que le déploiement soit réellement **reproductible** et **fiable** avec Ansible.

## Inventaire Ansible : séparation manager / worker + clé SSH

Dans `inventory.ini`, j’ai :

```
[swarm_managers]
app-vm ansible_host=35.181.155.123 ansible_user=admin swarm_role=app ansible_ssh_private_key_file=/workspaces/dev-env/key/web-server.pem

[swarm_workers]
db-vm ansible_host=15.188.14.104 ansible_user=admin swarm_role=db ansible_ssh_private_key_file=/workspaces/dev-env/key/web-server.pem

[swarm_all:children]
swarm_managers
swarm_workers

```

**Pourquoi :**

- Je distingue clairement :
    - `swarm_managers` → nœud qui initialise le Swarm et déploie la stack.
    - `swarm_workers` → nœuds qui rejoignent le Swarm et hébergent des services.
- J’ajoute une variable `swarm_role` (`app` ou `db`) qui sera utilisée plus tard pour appliquer les labels Swarm.
- J’utilise une **clé SSH** commune (`web-server.pem`) avec `ansible_ssh_private_key_file` pour éviter tout prompt de mot de passe.

Côté machine locale, j’ai aussi ajouté les hôtes dans `known_hosts` pour qu’Ansible ne bloque pas sur la demande de confirmation :

```bash
ssh-keyscan 35.181.155.123 >> ~/.ssh/known_hosts   # app-vm
ssh-keyscan 15.188.14.104 >> ~/.ssh/known_hosts   # db-vm

```

---

## Initialisation du Swarm : IP privée + stockage dans les facts

Dans le play `2. Initialiser le Swarm sur le manager` (`swarm.yml`), j’ai renforcé la logique :

```yaml
- name: 2. Initialiser le Swarm sur le manager
  hosts: swarm_managers
  become: true
  vars:
    # IP privée du manager (celle utilisée pour --advertise-addr)
    manager_ip: "{{ ansible_default_ipv4.address }}"
  tasks:
    - name: Vérifier l'état local du Swarm
      shell: docker info --format '{{ "{{ .Swarm.LocalNodeState }}" }}'
      register: swarm_state
      changed_when: false
      failed_when: false

    - name: Initialiser le Swarm (si pas encore actif)
      shell: docker swarm init --advertise-addr {{ manager_ip }}
      when: swarm_state.stdout is not defined or swarm_state.stdout | trim != "active"

    - name: Vérifier que le Swarm est bien actif (sécurité)
      shell: docker info --format '{{ "{{ .Swarm.LocalNodeState }}" }}'
      register: swarm_state_after
      changed_when: false

    - name: Échouer si le Swarm n'est pas actif sur le manager
      fail:
        msg: "Le Swarm n'est pas actif sur le manager (état={{ swarm_state_after.stdout | trim }})."
      when: swarm_state_after.stdout | trim != "active"

    - name: Récupérer le token worker
      shell: docker swarm join-token -q worker
      register: worker_token

    - name: Vérifier que le token worker n'est pas vide
      fail:
        msg: "Token worker vide : impossible de joindre les workers au Swarm."
      when: worker_token.stdout is not defined or worker_token.stdout | length == 0

    - name: Récupérer le token manager
      shell: docker swarm join-token -q manager
      register: manager_token

    - name: Sauver les tokens et l'IP du manager dans les hostvars
      set_fact:
        swarm_worker_token: "{{ worker_token.stdout }}"
        swarm_manager_token: "{{ manager_token.stdout }}"
        swarm_manager_ip: "{{ manager_ip }}"

```

**Ce que j’ai changé par rapport à mon idée initiale :**

1. **Utilisation de l’IP privée (`ansible_default_ipv4.address`)**
    
    Sur AWS, le Swarm doit communiquer via les IP privées, pas via les IP publiques.
    
    → Je force `--advertise-addr` à l’IP privée du manager.
    
2. **Vérifications explicites de l’état Swarm**
    - Je vérifie l’état avant (`swarm_state`) et après (`swarm_state_after`) l’init.
    - Si l’état n’est pas `active`, je fais **échouer le play** tout de suite.
        
        → Ça évite de continuer avec un Swarm à moitié initialisé.
        
3. **Stockage des tokens et de l’IP dans les facts (`set_fact`)**
    - `swarm_worker_token` et `swarm_manager_token`
    - `swarm_manager_ip`
        
        Ces valeurs sont ensuite réutilisées dans le play suivant pour joindre les workers, au lieu de recalculer ou hardcoder quoi que ce soit.
        

---

## Joindre les workers : logique robuste plutôt qu’un simple join

Dans le play `3. Joindre les workers au Swarm`, j’ai dû aller beaucoup plus loin que mon idée de base “faire un simple `docker swarm join`” :

```yaml
- name: 3. Joindre les workers au Swarm
  hosts: swarm_workers
  become: true
  vars:
    manager_name: "{{ groups['swarm_managers'][0] }}"
    # On réutilise l'IP privée du manager enregistrée à l'étape 2
    manager_ip: "{{ hostvars[manager_name].swarm_manager_ip | default(hostvars[manager_name].ansible_default_ipv4.address) }}"
    worker_token: "{{ hostvars[manager_name].swarm_worker_token }}"
  tasks:
    - name: Vérifier l'état local du Swarm sur le worker
      shell: docker info --format '{{ "{{ .Swarm.LocalNodeState }}" }}'
      register: worker_swarm_state
      changed_when: false
      failed_when: false

    - name: Quitter un Swarm existant sur le worker (si déjà actif)
      shell: docker swarm leave --force
      when: worker_swarm_state.stdout is defined and worker_swarm_state.stdout | trim == "active"

    - name: Rafraîchir l'état local du Swarm après éventuel leave
      shell: docker info --format '{{ "{{ .Swarm.LocalNodeState }}" }}'
      register: worker_swarm_state_after
      changed_when: false
      failed_when: false

    - name: Joindre le Swarm en tant que worker
      shell: docker swarm join --token {{ worker_token }} {{ manager_ip }}:2377
      register: join_result
      when: worker_swarm_state_after.stdout is not defined or worker_swarm_state_after.stdout | trim != "active"
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

```

**Évolutions importantes :**

1. **Leave forcé si le worker est déjà dans un Swarm**
    
    Certains tests précédents avaient laissé le worker dans un ancien cluster → il refusait de joindre le nouveau.
    
    Je force donc :
    
    ```yaml
    docker swarm leave --force
    
    ```
    
    si l’état n’est pas `inactive`.
    
2. **Re-vérification de l’état après le leave**
    
    Je re-lance `docker info` pour garantir que le worker est bien revenu en `inactive` avant de tenter un join.
    
3. **Join avec retry et gestion des erreurs**
    - `retries: 5`, `delay: 5` pour laisser le temps au manager de répondre.
    - `until:` pour réessayer tant que ça échoue.
    - `failed_when` pour ignorer proprement le message `already part of a swarm`.
4. **Double validation de l’adhésion au Swarm**
    - Côté worker : état `active`.
    - Côté manager : entrée dans `docker node ls` avec `Ready Active`.
    
    Cela évite le cas où le join est “lancé” mais jamais finalisé.
    

---

## Préparation des services : compose.yml + .env adaptés à Swarm

Avant de lancer `docker stack deploy`, j’ai aussi dû adapter ma stack pour qu’elle soit compatible avec Swarm **et** avec la résolution DNS entre services.

### Fichier `compose.yml` :

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

### Fichier `.env` :

```
POSTGRES_HOST=root_db
POSTGRES_DB=nocodb_db
POSTGRES_USER=admin
POSTGRES_PASSWORD=passwordSécur1té
NC_DB=pg://root_db:5432?u=admin&p=passwordSécur1té&d=nocodb_db

```

**Pourquoi ces changements :**

- Ajout d’un réseau overlay `backend` pour que :
    - `nocodb` puisse résoudre `root_db` via le DNS interne Swarm.
- Utilisation de `env_file: .env` pour centraliser :
    - la config Postgres (DB, user, password)
    - l’URL `NC_DB` utilisée par NocoDB.
- Correction de `NC_DB` : avant, elle était vide ou mal formée → `Invalid URL` puis `ENOTFOUND root_db`.
    
    Maintenant, elle pointe clairement vers `pg://root_db:5432` avec les bons paramètres.

---

# 4️⃣ Ce que ton playbook Ansible fait maintenant (de bout en bout)

Voici l’explication pédagogique complète de ton automatisation :

---

## 🏁 Étape 0 — Configuration des hostnames

Tu imposes une cohérence système :

- `app-vm` devient `app-vm`
- `db-vm` devient `db-vm`

C’est indispensable pour que Swarm ne duplique pas les nœuds.

---

## ⚙️ Étape 1 — Installation de Docker

- Mise à jour apt
- Installation de Docker
- Activation du service

Pré-requis absolu pour Swarm et les stacks.

---

## 🐳 Étape 2 — Initialisation du Manager

- Vérification de l’état Swarm
- Initialisation si nécessaire
- Sauvegarde :
    - token worker
    - token manager
    - IP privée → essentielle pour AWS

---

## 🧩 Étape 3 — Join des workers

Vérifications robustes :

- leave forcé si déjà dans un Swarm
- join avec retry
- vérification locale
- vérification côté manager via `docker node ls`

C’est une étape clé et tu l’as sécurisée au maximum.

---

## 🏷️ Étape 4 — Application des labels

Tu appliques :

- `role=app` sur app-vm
- `role=db` sur db-vm

Avec :

- contrôle du NodeID
- commande exécutée depuis le manager
- sécurité totale

---

## 🚀 Étape 5 — Déploiement de la stack

Tu déploies automatiquement :

- un réseau overlay (`backend`)
- Postgres sur le nœud `db`
- NocoDB sur le nœud `app`

Tu prends soin de :

- copier le compose.yml
- copier le .env
- exécuter le deploy
- afficher les services

Cette étape est maintenant **stable et reproductible**.

---

# 5️⃣ Résultat final

✔ Swarm fonctionnel

✔ Manager + Worker opérationnels

✔ Labels appliqués

✔ Réseau overlay créé

✔ Postgres Running

✔ NocoDB Running

✔ Déploiement entièrement automatisé via Ansible

✔ Plus aucune intervention manuelle requise

Tu peux désormais provisionner **n’importe quel cluster AWS**, lancer ton playbook et avoir un environnement complet en quelques secondes.

---

# 6️⃣ Conclusion pédagogique

🎯 **Ce que tu as réellement accompli :**

Tu as construit une chaîne DevOps complète :

- Infrastructure : AWS EC2
- Orchestration : Docker Swarm
- Configuration : Ansible
- Réseau : overlay distribué
- Application : NocoDB + Postgres
- Automatisation : playbook full-stack
- Résilience : vérifications strictes et safe guards
- CI mentale : tu as testé, loggé, diagnostiqué et corrigé comme en production

---
[← Module précédent](M41_projet-J1-swarm.md)
---
