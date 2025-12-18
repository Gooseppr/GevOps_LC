---
title: Projet J02
sujet: Projet NocoDb
type: module
jour: 42
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
- Issues : **34**
- Milestones : **0**
- Projets couverts : **1**
- Labels uniques : **8**
- Issues sans label : **0**
- Issues prêtes (assignee + due_date) : **0**

### 1.1. Pourcentage d'issues assignees
```mermaid
pie showData
    title Issues assignees
    "assignees" : 9
    "non assignees" : 25
```

### 1.2. Pourcentage d'issues en closed (label)
```mermaid
pie showData
    title Issues closed (label)
    "closed" : 3
    "non closed" : 31
```

## 2. Avancement (flux de travail & temps)
### 2.1. Repartition par colonne du board
```mermaid
pie showData
    title Colonnes du board
    "backlog" : 22
    "open" : 3
    "in-progress" : 6
    "closed" : 3
```

> Lecture :
> - **backlog** : 22 issues (64.7 %)
> - **open** : 3 issues (8.8 %)
> - **in-progress** : 6 issues (17.6 %)
> - **closed** : 3 issues (8.8 %)

### 2.2. Kanban (vue synthetique)
```mermaid
timeline
    title "Kanban (labels backlog/open/in-progress/closed)"
    backlog : Creation d'un pipeline pour deployer l'infrastructure : Terraform - Creation du S3 pour les backups de les bases de donnees : Ansible - Playbook pour la tache CRON dediee au backup de la base de ... : Terraform - Creation de l'inventaire Ansible : Terraform - Deploiement des VM : Terraform - Deploiement du reseau et des subnets : Ansible - Playbook pour configurer la VM NAT : Ansible - Playbook pour configurer la VM Application : Ansible - Playbook pour configurer la VM Database : Ansible - Playbook pour configurer la VM Prometheus / Loki : Ansible - Playbook pour configurer la VM Grafana : ... (+11 de plus)
    open : Reseau (IaC) - Definir et tester le VPC : Test de la creation des sous reseaux : Test de l'image localement de NocoDB
    in-progress : Ansible - Playbook pour le SSH Hardening : Ansible - Playbook pour deployer Docker Swarm : Test API gateway : Test du bastion : Test de la stack : Creation du pipeline de compilation de l'image de NocoDB
    closed : Test de fck-nat : Compilation de l'image de NocoDB : Clone du code NocoDB
```

### 2.3. Timeline des creations

| Date | Issues creees |
|------|---------------|
| 05-12-2025 | 34 |


### 2.4. Aging des issues (anciennete)

| Tranche | Nb issues |
|---------|-----------|
| 0-2j | 0 |
| 3-8j | 34 |
| 9-14j | 0 |
| 15j+ | 0 |


## 3. Charge & focus

### 3.1. Repartition par projet
```mermaid
pie showData
    title Issues par projet
    "Management" : 34
```

### 3.2. Charge par assigne (pie hors non assigne)
```mermaid
pie showData
    title Assigne
    "Philippe-BAHEUX" : 2
    "gregoire.elmacin" : 2
    "jeagra" : 2
    "gregoireuesteban" : 3
```

| Assigne | Nb issues | % du total |
|---------|-----------|------------|
| non assigne | 25 | 73.5% |
| gregoireuesteban | 3 | 8.8% |
| Philippe-BAHEUX | 2 | 5.9% |
| gregoire.elmacin | 2 | 5.9% |
| jeagra | 2 | 5.9% |

### 3.3. Distribution des labels (scopes fonctionnels)
```mermaid
pie showData
    title Labels
    "scope::infra" : 24
    "scope::backup" : 2
    "scope::monitoring" : 4
    "scope::image" : 4
```

### 3.4. Top labels par assigne (max 2, sans labels d'etat)

| Assigne | Label #1 | Label #2 |
|---------|----------|----------|
| Philippe-BAHEUX | scope::infra (2) |  |
| gregoire.elmacin | scope::infra (2) |  |
| gregoireuesteban | scope::image (3) |  |
| jeagra | scope::infra (2) |  |

### 3.5. Top labels globaux (fonctionnels, max 5)

| Label | Nb issues |
|-------|-----------|
| scope::infra | 24 |
| scope::monitoring | 4 |
| scope::image | 4 |
| scope::backup | 2 |

---
[Module suivant →](M42_ansible-pro.md)
---
