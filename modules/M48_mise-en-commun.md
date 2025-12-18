---
title: Projet J08 - Mise en commun Terraform et Ansible
sujet: Projet NocoDb NocoDb
type: module
jour: 48
ordre: 0
tags: projet
---

# Compte rendu de journée – Mise en commun des environnements et convergence DevOps

## 1. Contexte initial : deux dépôts, deux périmètres

Au départ, nous avancions en parallèle sur **deux dépôts distincts**, chacun correspondant à un périmètre clair.

De mon côté, je travaillais sur le dépôt **`swarm-ansible`**, structuré autour d’**Ansible** et de l’exploitation, avec :

- un inventaire,
- des rôles dédiés (par exemple `deploy-nocodb`, `deploy-postgres`, `db-backup`, `swarm-manager`, `swarm-worker`),
- des playbooks découpés par responsabilité (`deploy-nocodb.yml`, `deploy-postgres.yml`, `deploy-db-backup.yml`),
- et une orchestration progressive du cluster **Docker Swarm**.

Mon collaborateur travaillait sur le dépôt **`infrastructure`**, centré sur **Terraform**, avec :

- la création des machines virtuelles,
- la configuration réseau (VPC, subnets, security groups),
- la gestion des clés SSH,
- les rôles et permissions IAM,
- et la génération d’un inventaire exploitable par Ansible (par exemple `exported_inventory.yml`).

À ce stade, chacun avançait correctement, mais nos travaux restaient **faiblement intégrés** : on évoluait en silo, avec des hypothèses parfois différentes sur l’architecture cible.

---

## 2. Décision de convergence : un dépôt commun

Nous avons décidé de **mettre en commun** nos environnements dans un dépôt unique.

L’objectif n’était pas de juxtaposer nos travaux, mais de :

- faire converger infrastructure et déploiement,
- réduire les écarts entre besoins applicatifs et réalité infra,
- éliminer les doublons,
- harmoniser la structure,
- et obtenir une chaîne DevOps cohérente, **de la VM jusqu’à l’application**.

Cette décision impliquait une phase de nettoyage et de refactorisation, autant technique que méthodologique.

---

## 3. Harmonisation et arbitrages : nettoyage, refonte et alignement

La fusion n’a pas été immédiate, car nous avions :

- des conventions différentes,
- des découpages de rôles Ansible parfois redondants,
- des logiques d’orchestration distinctes,
- et une façon différente de structurer l’exécution (ordre des playbooks, granularité, nommage).

On a donc pris le temps de :

- nettoyer du code redondant,
- supprimer certaines approches qui ne s’intégraient pas correctement,
- renommer et restructurer des rôles,
- revoir l’organisation des inventaires,
- et aligner la logique Swarm (manager / workers / labels / placement) avec les contraintes de l’infrastructure.

Même si cela a pris du temps, cette phase a été essentielle : elle nous a permis de faire converger deux philosophies vers une architecture commune, lisible et maintenable.

---

## 4. Répartition claire des responsabilités

Une fois la base convergente posée, la répartition des rôles est devenue plus nette.

Je me suis concentré sur la partie “exploitation” :

- déploiement applicatif (NocoDB),
- base PostgreSQL,
- logique de sauvegarde et restauration (backup / restore),
- adaptation des scripts bash,
- intégration dans des rôles Ansible propres et rejouables.

Mon collaborateur s’est concentré sur la partie “provisioning” :

- Terraform,
- VPC/subnets/security groups,
- création et exposition des VM,
- IAM (rôles/politiques),
- et préparation des artefacts nécessaires au déploiement (clés / inventaire).

Ce découpage nous a permis d’avancer efficacement tout en gardant une vision d’ensemble.

---

## 5. Organisation finale dans un nouveau répertoire.

Le dépôt final **`infrastructure`** reflète la convergence :

### `terraform/`

- repris et adapté à partir du dépôt `infrastructure`,
- responsable du provisioning (VM, réseau, SG, clés, outputs, IAM),
- produisant un inventaire exploitable par Ansible.

### `ansible/`

- issu de `swarm-ansible`,
- structuré de façon claire :
    - `roles/` pour les responsabilités techniques,
    - `playbooks/` pour l’orchestration,
    - `group_vars/` pour la configuration,
    - un playbook principal (`nocodb.yml`) comme point d’entrée.

Cette organisation sépare clairement :

- le **“quoi”** (Terraform provisionne l’infrastructure),
- du **“comment”** (Ansible installe, configure, déploie et opère).

---


## 6. Connexion Terraform ↔ Ansible et exécution validée

Pour relier proprement l’infrastructure et le déploiement, nous nous appuyons sur :

- les **outputs Terraform**,
- le mécanisme de **`terraform_remote_state`**,
- et des variables injectées proprement dans Ansible (plutôt que des valeurs en dur).

Le workflow validé est :

1. Terraform provisionne l’infrastructure et expose les informations utiles (VM, accès, inventaire, etc).
2. Ansible consomme ces informations pour :
    - installer Docker,
    - initialiser et étendre le Swarm,
    - appliquer les labels et le placement,
    - déployer PostgreSQL,
    - déployer NocoDB,
    - et ajouter des éléments d’observabilité (selon périmètre).

---

## 7. Validation fonctionnelle et réseau

Une partie importante a été de valider :

- la bonne répartition des services sur les bonnes VM,
- la communication inter-conteneurs via les réseaux overlay,
- le fonctionnement du gateway et de Traefik pour exposer les services,
- et l’intégration complète entre provisioning Terraform et exécution Ansible.

Cela a confirmé que l’infrastructure fournie par Terraform et la configuration réalisée via Ansible fonctionnaient ensemble dans un scénario réel.

---

## 8. Bilan

Cette journée a été particulièrement formatrice.

Sur le plan technique, elle m’a permis :

- de mieux comprendre les interactions Terraform / Ansible / AWS,
- de solidifier une architecture multi-VM réaliste,
- et d’industrialiser des briques critiques comme le stockage de backup.

Sur le plan méthodologique, elle m’a appris :

- l’importance d’une communication technique claire,
- la nécessité de faire des compromis structurants,
- et la valeur d’un code partagé, lisible et maintenable.

Au final, nous avons transformé deux projets indépendants en une architecture DevOps cohérente, collaborative et fonctionnelle, allant du provisioning infra jusqu’à l’exploitation applicative.