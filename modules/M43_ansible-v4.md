---
title: Projet J3 - Ansible avancé
sujet: Projet
type: module
jour: 43
ordre: 1
tags: projet, docker, docker swarm, stack, ansible
---

# ✅ Synthèse de la journée – Stabilisation totale du cluster Docker Swarm & déploiement NocoDB

Aujourd’hui, l’équipe a réalisé un énorme bond en avant : elle est passée d’une version instable (v3), où Swarm ne fonctionnait qu’aléatoirement, à une **version v4 robuste, cohérente et totalement automatisée**, capable de déployer un cluster complet avec NocoDB et Postgres de manière fiable.

Cette synthèse décrit :

- ce qui posait problème dans la v3,
- ce qui a été corrigé,
- pourquoi cela a fonctionné,
- et les versions finales des fichiers.

---

# 1. 🚧 Ce qui n’allait pas dans la version v3

## 🔥 Problème 1 — Le manager Swarm n’était pas un vrai manager

L’inventaire v3 désignait **app-vm** comme “manager”, ce qui était incohérent :

- Le manager se retrouvait sur une VM applicative
- Les workers tentaient de rejoindre un faux manager
- Le cluster Swarm était détruit à chaque tentative de déploiement

➡️ Résultat : **aucune stabilité du cluster**.

---

## 🔥 Problème 2 — Les workers n’arrivaient jamais à quitter l’ancien Swarm

Lorsqu’un worker avait déjà un état Swarm :

- `docker swarm leave` générait `context deadline exceeded`
- `/var/lib/docker/swarm` restait verrouillé
- Le worker ne pouvait plus rejoindre le nouveau manager
- Le cluster devenait incohérent (nœuds fantômes)

➡️ **Impossible d’avoir un join propre**.

---

## 🔥 Problème 3 — Le réseau overlay ne fonctionnait pas

Swarm ne rattachait pas correctement les conteneurs au réseau overlay.

Conséquence :

- `root_db` était introuvable via DNS
- NocoDB crashait en boucle (`ENOTFOUND root_db`)
- Le réseau `mystack_backend` n’avait parfois aucun container attaché

➡️ **Aucune communication entre services**, donc aucun démarrage applicatif possible.

---

## 🔥 Problème 4 — Les labels et rôles n’étaient pas cohérents

Les fichiers v3 montraient :

- des labels incorrects
- des rôles non respectés
- Postgres qui pouvait finir sur un nœud applicatif
- plusieurs workers surnuméraires ou mal placés

➡️ Swarm ne savait pas différencier les VMs — donc pas de placement correct.

---

# 2. 🛠️ Ce qui a été corrigé aujourd’hui

## ✔ 2.1 — Création d’un vrai manager dédié

L’équipe a introduit une VM **master-vm** servant exclusivement à :

- initialiser le cluster Swarm
- stocker les tokens worker
- déployer la stack
- gérer les labels
- servir de point d’autorité

➡️ Un cluster enfin **stable et prévisible**.

---

## ✔ 2.2 — Implémentation d’un mécanisme propre de “reset Swarm”

L’équipe a introduit un système intelligent basé sur l’état réel du worker :

### 🔍 Détection

- le worker est-il dans un Swarm ?
- est-il reconnu par le manager ?
- existe-t-il une incohérence ?

### 🔧 Reset uniquement si nécessaire

- arrêt du daemon docker
- suppression de `/var/lib/docker/swarm/*`
- redémarrage docker
- join propre

➡️ Un worker **ne peut plus rester bloqué** dans un ancien cluster.

---

## ✔ 2.3 — Réparation complète du réseau overlay

Les améliorations :

- création correcte du réseau `mystack_backend`
- attachement automatique via la stack Swarm
- communication DNS fonctionnelle via `<stack>_<service>`

➡️ **NocoDB peut enfin joindre Postgres sans erreur DNS.**

---

## ✔ 2.4 — Réécriture de l’inventaire et des labels

Chaque rôle est désormais :

- lisible
- cohérent
- utilisé directement pour le placement des services

➡️ Postgres tourne uniquement sur les nœuds DB

➡️ NocoDB tourne uniquement sur les nœuds APP

Le cluster est **logique et prévisible**.

---

## ✔ 2.5 — Version finale stable et reproductible

Après exécution du playbook :

- Le cluster est formé correctement
- Tous les workers rejoignent automatiquement
- Les labels sont appliqués proprement
- L’image NocoDB est pré-pullée
- Le réseau Swarm fonctionne
- NocoDB ↔ Postgres communiquent correctement

➡️ **Le déploiement est fiable.**

---

# 3. 📄 FICHIERS FINAUX (version propre et fonctionnelle)

---

## 🔹 **inventory.ini (version finale)**

```
[swarm_managers]
master-vm ansible_host=13.39.xx.xx node_labels="role=master"

[swarm_app]
app-vm ansible_host=13.39.xx.xx node_labels="role=app"
app-vm2 ansible_host=13.39.xx.xx node_labels="role=app"
app-vm3 ansible_host=13.39.xx.xx node_labels="role=app"

[swarm_db]
db-vm ansible_host=13.39.xx.xx node_labels="role=db"

[all:vars]
ansible_user=admin
ansible_python_interpreter=/usr/bin/python3

```

---

## 🔹 **compose.yml (version finale)**

```yaml
version: "3.8"

services:
  nocodb:
    image: registry.gitlab.com/quickdata-batch22-group/nocodb/quickdata/nocodb:0.1.0
    ports:
      - "8080:8080"
    environment:
      - NC_DB=${NC_DB}
      - POSTGRES_HOST=${POSTGRES_HOST}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
    networks:
      - backend
    deploy:
      replicas: 1
      placement:
        constraints:
          - node.labels.role == app

  root_db:
    image: postgres:16
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
    volumes:
      - db_data:/var/lib/postgresql/data
    networks:
      - backend
    deploy:
      placement:
        constraints:
          - node.labels.role == db

networks:
  backend:
    driver: overlay

volumes:
  db_data:

```

---

## 🔹 **swarm-pro.yml (extraits essentiels de la version finale)**

*(Seules les sections clés sont affichées pour la synthèse)*

```yaml
- name: 2. Initialiser le Swarm sur le manager
  hosts: swarm_managers
  tasks:
    - name: Vérifier état Swarm
      shell: docker info --format '{{ .Swarm.LocalNodeState }}'
      register: swarm_state
      changed_when: false

    - name: Initialiser Swarm si inactif
      shell: docker swarm init --advertise-addr {{ ansible_host }}
      when: swarm_state.stdout != "active"

    - name: Récupérer token worker
      shell: docker swarm join-token -q worker
      register: worker_token

- name: 3. Joindre les workers
  hosts: swarm_app,swarm_db
  tasks:
    - name: Quitter ancien swarm si nécessaire
      shell: docker swarm leave --force
      when: swarm_state.stdout == "active" and not connu_du_manager

    - name: Join Swarm
      shell: docker swarm join --token {{ hostvars[manager]['worker_token'].stdout }} {{ hostvars[manager]['ansible_host'] }}:2377
      when: worker_pas_membre

- name: 4. Appliquer les labels
  hosts: all
  tasks:
    - name: Ajouter labels
      shell: docker node update --label-add {{ item }} {{ inventory_hostname }}
      loop: "{{ node_labels }}"

- name: 5. Déployer stack
  hosts: swarm_managers
  tasks:
    - name: Copier compose.yml
      copy:
        src: compose.yml
        dest: /opt/nocodb/compose.yml

    - name: Lancer stack
      shell: docker stack deploy -c /opt/nocodb/compose.yml mystack

```

---

# 📝 **Synthèse finale**

> Aujourd’hui, l’équipe a transformé un cluster Swarm instable en une véritable plateforme DevOps fiable, auto-réparable et extensible.
> 
> 
> Elle a corrigé les rôles, les labels, le réseau overlay, l’initialisation Swarm, les mécanismes de reset et la logique de déploiement.
> 
> Résultat : un environnement capable d’ajouter ou remplacer une VM automatiquement, et de déployer NocoDB + Postgres de manière prédictible.

---
[← Module précédent](M43_projet-board-J03.md)
---
