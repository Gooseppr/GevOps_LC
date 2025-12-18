---
title: Projet J11
sujet: Projet
type: module
jour: 51
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
- Issues : **33**
- Milestones : **0**
- Projets couverts : **1**
- Labels uniques : **8**
- Issues sans label : **0**
- Issues prêtes (assignee + due_date) : **0**

### 1.1. Pourcentage d'issues assignees
```mermaid
pie showData
    title Issues assignees
    "assignees" : 26
    "non assignees" : 7
```

### 1.2. Pourcentage d'issues en closed (label)
```mermaid
pie showData
    title Issues closed (label)
    "closed" : 19
    "non closed" : 14
```

## 2. Avancement (flux de travail & temps)
### 2.1. Repartition par colonne du board
```mermaid
pie showData
    title Colonnes du board
    "backlog" : 2
    "open" : 5
    "in-progress" : 7
    "closed" : 19
```

> Lecture :
> - **backlog** : 2 issues (6.1 %)
> - **open** : 5 issues (15.2 %)
> - **in-progress** : 7 issues (21.2 %)
> - **closed** : 19 issues (57.6 %)

### 2.2. Kanban (vue synthetique)
```mermaid
timeline
    title "Kanban (labels backlog/open/in-progress/closed)"
    backlog : Premiere mise en prod infra (checklist) : Creation d'un pipeline pour deployer l'infrastructure
    open : Terraform - Creation du S3 pour les backups de les bases de donnees : Ansible - Playbook pour configurer la VM du bastion : Ansible - Playbook pour deployer Loki : Ansible - Playbook pour deployer Grafana : Ansible - Playbook pour deployer les exporters generiques
    in-progress : CI jobs pour le code Noco DB (tests) : Ansible - Playbook pour la tache CRON dediee au backup de la base de ... : Ansible - Playbook pour configurer les VM Application : Ansible - Playbook pour configurer la VM Database : Ansible - Playbook pour le SSH Hardening : Ansible - Playbook pour deployer Prometheus : Test du bastion
    closed : Terraform - monitoring : Test de Traefik : Terraform - Creation de l'inventaire Ansible : Reseau (IaC) - Definir et tester le VPC : Terraform - Deploiement des VM : Terraform - Deploiement du reseau et des subnets : Ansible - Playbook pour configurer la VM NAT : Ansible - Playbook pour deployer Docker Swarm : Ansible - Playbook pour deployer Traefik : Test API gateway : Ansible - Playbook pour deployer fck-nat : ... (+8 de plus)
```

### 2.3. Timeline des creations

| Date | Issues creees |
|------|---------------|
| 05-12-2025 | 29 |
| 10-12-2025 | 2 |
| 11-12-2025 | 1 |
| 15-12-2025 | 1 |


### 2.4. Aging des issues (anciennete)

| Tranche | Nb issues |
|---------|-----------|
| 0-2j | 0 |
| 3-8j | 4 |
| 9-14j | 29 |
| 15j+ | 0 |


## 3. Charge & focus

### 3.1. Repartition par projet
```mermaid
pie showData
    title Issues par projet
    "Management" : 33
```

### 3.2. Charge par assigne (pie hors non assigne)
```mermaid
pie showData
    title Assigne
    "gregoireuesteban" : 7
    "jeagra" : 12
    "gregoire.elmacin" : 5
    "Philippe-BAHEUX" : 2
```

| Assigne | Nb issues | % du total |
|---------|-----------|------------|
| jeagra | 12 | 36.4% |
| gregoireuesteban | 7 | 21.2% |
| non assigne | 7 | 21.2% |
| gregoire.elmacin | 5 | 15.2% |
| Philippe-BAHEUX | 2 | 6.1% |

### 3.3. Distribution des labels (scopes fonctionnels)
```mermaid
pie showData
    title Labels
    "scope::image" : 5
    "scope::infra" : 21
    "scope::monitoring" : 5
    "scope::backup" : 2
```

### 3.4. Top labels par assigne (max 2, sans labels d'etat)

| Assigne | Label #1 | Label #2 |
|---------|----------|----------|
| Philippe-BAHEUX | scope::infra (2) |  |
| gregoire.elmacin | scope::infra (4) | scope::backup (1) |
| gregoireuesteban | scope::image (5) | scope::monitoring (2) |
| jeagra | scope::infra (11) |  |

### 3.5. Top labels globaux (fonctionnels, max 5)

| Label | Nb issues |
|-------|-----------|
| scope::infra | 21 |
| scope::image | 5 |
| scope::monitoring | 5 |
| scope::backup | 2 |