---
title: Projet J12 - Idempotence dans le déploiement ansible
sujet: Projet NocoDb
type: module
jour: 52
ordre: 0
tags: projet
---

# 🔁 Rendre notre déploiement Ansible idempotent (retour d’expérience)

## Contexte

Dans la continuité de notre infrastructure automatisée (Terraform + Ansible + Docker Swarm), nous avons reçu des retours indiquant que certaines parties de notre déploiement **n’étaient pas suffisamment idempotentes**.

L’objectif de cette phase de travail a donc été de :

- comprendre précisément ce qu’implique l’idempotence en automatisation,
- identifier les points non idempotents de nos rôles Ansible,
- refactoriser les rôles clés pour obtenir un déploiement **rejouable, stable et prévisible**.

---

## Qu’est-ce que l’idempotence en Ansible ?

Un déploiement est **idempotent** lorsque :

> L’exécution d’un playbook une ou plusieurs fois produit le même état final, sans provoquer d’actions inutiles ou destructrices.
> 

Concrètement :

- la **première exécution** met la machine dans l’état attendu,
- les **exécutions suivantes** ne font rien si l’état est déjà conforme,
- les tâches doivent principalement retourner `ok`, et non `changed`.

En pratique, Ansible doit **décrire un état**, pas rejouer une suite d’actions systématiquement.

---

## Problèmes identifiés dans notre déploiement initial

### 1. Swarm workers non idempotents

Dans notre première implémentation, les workers Docker Swarm suivaient cette logique :

- si le nœud était `active` → quitter le swarm,
- puis rejoindre à nouveau le manager.

👉 **Problème** :

À chaque exécution, même si le worker était déjà correctement rattaché au bon manager, il quittait puis rejoignait le cluster.

Cela entraînait :

- des changements inutiles à chaque run,
- un comportement instable,
- une violation claire du principe d’idempotence.

---

### 2. Dépendance implicite entre rôles manager / worker

Les workers dépendaient de variables (`swarm_worker_token`, `swarm_manager_ip`) générées dynamiquement par le rôle `swarm-manager`.

Ces variables :

- n’existent que **pendant l’exécution Ansible**,
- rendent impossible le lancement isolé du rôle worker,
- imposent un **ordre strict d’exécution**.

➡️ Nous avons donc décidé de **fusionner les playbooks manager + worker** afin de garantir :

- la génération des tokens,
- puis l’adhésion des workers dans le même run.

---

### 3. Connexion au registry Docker systématique

Le login au registry GitLab était exécuté à chaque déploiement avec :

```yaml
reauthorize:true

```

👉 Cela provoquait :

- un `changed` systématique,
- des connexions inutiles,
- un déploiement moins propre et plus bruyant.

---

## Actions mises en place pour améliorer l’idempotence

---

## 1️⃣ Rôle `swarm-manager` : init et réseaux overlay

### Améliorations apportées

- utilisation du module `community.docker.docker_swarm` (`state: present`)
    
    → initialisation **idempotente** du Swarm manager
    
- création des réseaux overlay (`backend`, `proxy`, `monitoring`) via :
    
    ```yaml
    community.docker.docker_network:
    state:present
    
    ```
    
- suppression des vérifications manuelles `docker network ls`
- centralisation de la création via une boucle

### Résultat

- le Swarm n’est initialisé qu’une seule fois,
- les réseaux overlay ne sont créés que s’ils sont absents,
- le rôle est totalement rejouable sans effets de bord.

---

## 2️⃣ Rôle `swarm-worker` : adhésion conditionnelle au Swarm

### Nouvelle logique mise en place

Le worker suit désormais le cycle suivant :

1. lecture de l’état réel du Swarm via :
    
    ```bash
    docker info --format'{{json .Swarm}}'
    
    ```
    
2. détermination :
    - du `LocalNodeState`,
    - du manager auquel le worker est rattaché (`RemoteManagers`)
3. décisions :
    - **ne rien faire** si le worker est déjà actif sur le bon manager,
    - **quitter le swarm** uniquement s’il est rattaché à un mauvais manager,
    - **rejoindre le swarm** uniquement s’il est inactif.

### Bénéfices

- plus de `leave/join` à chaque run,
- comportement déterministe,
- workers rejouables sans perturbation du cluster.

---

## 3️⃣ Rôle `swarm-labels` : labels Swarm réellement stables

### Problème initial

Le label `role` était dérivé de `group_names[0]`, ce qui :

- dépend de l’ordre interne des groupes,
- pouvait changer d’une exécution à l’autre.

### Solution

- définition d’une **priorité métier des groupes** (`application`, `database`, `monitoring`, `infra`)
- exclusion des groupes techniques (`workers`, `managers`, etc.)
- mapping optionnel vers des labels courts (`application → app`)
- lecture des labels existants avant modification
- application **uniquement si nécessaire**

### Résultat

- labels stables,
- aucune oscillation entre runs,
- rôle totalement idempotent.

---

## 4️⃣ Déploiement Docker & registry GitLab

### Amélioration clé

Avant de lancer un `docker_login`, le rôle :

1. vérifie l’existence de `~/.docker/config.json`,
2. vérifie si le registry GitLab est déjà présent dans `auths`,
3. ne déclenche le login **que si nécessaire**.

### Résultat

- plus de re-login systématique,
- moins de bruit dans les sorties Ansible,
- déploiement plus propre et plus professionnel.

---

## Bonnes pratiques retenues

Au terme de ce travail, nous avons retenu les principes suivants :

- toujours **observer l’état réel avant d’agir**,
- préférer les **modules Ansible** aux commandes shell,
- conditionner les actions coûteuses,
- éviter toute action destructive automatique,
- considérer l’idempotence comme un **critère de qualité du déploiement**, au même titre que la sécurité ou la lisibilité.

---

## Conclusion

Cette phase de refactorisation nous a permis de transformer un déploiement fonctionnel en un déploiement :

- **rejouable**
- **robuste**
- **prévisible**
- **professionnel**

Elle illustre parfaitement l’importance de l’idempotence dans une approche DevOps, en particulier dans des environnements distribués comme Docker Swarm.

---
[Module suivant →](M52_projet-board-J12.md)
---
