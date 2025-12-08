---
title: Projet J01
sujet: Projet
type: module
jour: 41
ordre: 0
tags: projet
---
# Tableau de bord GitLab – Projet QuickData (v3)

> Objectif : en un coup d'œil, répondre à 3 questions :
> 1. Où en est le projet ?
> 2. Quelle est la qualité de nos données (backlog, assignees, due_date) ?
> 3. Qui fait quoi, sur quels scopes ?

---

## 1. Sante du projet (qualite des donnees)
Ces indicateurs servent à savoir si le board est pilotable : sans assignees, sans due_date, sans milestones, on ne peut pas parler de charge, de retard ou de priorites.

**KPIs globaux**
- Issues : **35**
- Milestones : **0**
- Projets couverts : **2**
- Labels uniques : **7**
- Issues sans label : **0**
- Issues prêtes (assignee + due_date) : **0**

### 1.1. Pourcentage d'issues assignees
```mermaid
pie showData
    title Issues assignees
    "assignees" : 4
    "non assignees" : 31
```

### 1.2. Pourcentage d'issues avec due_date
```mermaid
pie showData
    title Issues avec due_date
    "avec due_date" : 0
    "sans due_date" : 35
```

## 2. Avancement (flux de travail & temps)
### 2.1. Repartition par colonne du board
```mermaid
pie showData
    title Colonnes du board
    "backlog" : 26
    "open" : 5
    "in-progress" : 4
    "closed" : 0
```

> Lecture :
> - **backlog** : 26 issues (74.3 %)
> - **open** : 5 issues (14.3 %)
> - **in-progress** : 4 issues (11.4 %)

### 2.2. Kanban (vue synthetique)
```mermaid
timeline
    title "Kanban (labels backlog/open/in-progress/closed)"
    backlog : Creation d'un pipeline pour deployer l'infrastructure : Terraform - Creation du S3 pour les backups de les bases de donnees : Ansible - Playbook pour la tache CRON dediee au backup de la base de ... : Terraform - Creation de l'inventaire Ansible : Reseau (IaC) - Definir et tester le VPC : Terraform - Deploiement des VM : Terraform - Deploiement du reseau et des subnets : Ansible - Playbook pour configurer la VM NAT : Ansible - Playbook pour configurer la VM Application : Ansible - Playbook pour configurer la VM Database : Ansible - Playbook pour configurer la VM Prometheus / Loki : ... (+15 de plus)
    open : Test API gateway : Test de la creation des sous reseaux : Creation du pipeline de compilation de l'image de NocoDB : Test de l'image localement de NocoDB : Compilation de l'image localement de NocoDB
    in-progress : Test du bastion : Test de la stack : Test de fck-nat : Clone du code NocoDB
    closed : -
```

### 2.3. Timeline des creations

| Date | Issues creees |
|------|---------------|
| 05-12-2025 | 35 |


### 2.4. Aging des issues (anciennete)

| Tranche | Nb issues |
|---------|-----------|
| 0-1j | 0 |
| 2-3j | 35 |
| 4-7j | 0 |
| 8-14j | 0 |
| 15j+ | 0 |


## 3. Charge & focus

### 3.1. Repartition par projet
```mermaid
pie showData
    title Issues par projet
    "Management" : 34
    "inconnu" : 1
```

### 3.2. Charge par assigne (pie hors non assigne)
```mermaid
pie showData
    title Assigne
    "Philippe-BAHEUX" : 1
    "gregoire.elmacin" : 1
    "jeagra" : 1
    "gregoireuesteban" : 1
```

| Assigne | Nb issues | % du total |
|---------|-----------|------------|
| non assigne | 31 | 88.6% |
| Philippe-BAHEUX | 1 | 2.9% |
| gregoire.elmacin | 1 | 2.9% |
| gregoireuesteban | 1 | 2.9% |
| jeagra | 1 | 2.9% |

### 3.3. Distribution des labels (scopes fonctionnels)
```mermaid
pie showData
    title Labels
    "scope::infra" : 24
    "scope::backup" : 2
    "scope::monitoring" : 4
    "scope::image" : 4
```

### 3.4. Top labels par assigne (max 3)

| Assigne | Top labels (label:count) |
|---------|--------------------------|
| Philippe-BAHEUX | in-progress:1, scope::infra:1 |
| gregoire.elmacin | in-progress:1, scope::infra:1 |
| gregoireuesteban | in-progress:1, scope::image:1 |
| jeagra | in-progress:1, scope::infra:1 |

### 3.5. Top labels globaux (fonctionnels, max 12)

| Label | Nb issues |
|-------|-----------|
| scope::infra | 24 |
| scope::monitoring | 4 |
| scope::image | 4 |
| scope::backup | 2 |

## 4. Limites actuelles & pistes d'amelioration
- Assigner toutes les issues actives (open / in-progress) pour piloter la charge.
- Renseigner des due_date sur les taches critiques (infra, bastion, NAT, monitoring, etc.).
- Ajouter des milestones (MVP, demo, soutenance) avec start/end pour suivre les echeances.
- Enrichir et normaliser les labels scopes (scope::infra, scope::monitoring, scope::image, scope::backup, etc.).