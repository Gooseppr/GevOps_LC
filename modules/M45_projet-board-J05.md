---
title: Projet J05
sujet: Projet
type: module
jour: 45
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
    "assignees" : 19
    "non assignees" : 14
```

### 1.2. Pourcentage d'issues en closed (label)
```mermaid
pie showData
    title Issues closed (label)
    "closed" : 14
    "non closed" : 19
```

## 2. Avancement (flux de travail & temps)
### 2.1. Repartition par colonne du board
```mermaid
pie showData
    title Colonnes du board
    "backlog" : 6
    "open" : 8
    "in-progress" : 5
    "closed" : 14
```

> Lecture :
> - **backlog** : 6 issues (18.2 %)
> - **open** : 8 issues (24.2 %)
> - **in-progress** : 5 issues (15.2 %)
> - **closed** : 14 issues (42.4 %)

### 2.2. Kanban (vue synthetique)
```mermaid
timeline
    title "Kanban (labels backlog/open/in-progress/closed)"
    backlog : Premiere mise en prod infra (checklist) : Creation d'un pipeline pour deployer l'infrastructure : Terraform - Creation du S3 pour les backups de les bases de donnees : Ansible - Playbook pour configurer la VM NAT : Ansible - Playbook pour deployer Grafana : Ansible - Playbook pour deployer les exporters generiques
    open : Ansible - Playbook pour configurer les VM Application : Ansible - Playbook pour configurer la VM Database : Ansible - Playbook pour configurer la VM du bastion : Ansible - Playbook pour configurer la VM Gateway : Ansible - Playbook pour deployer Traefik : Ansible - Playbook pour deployer fck-nat : Ansible - Playbook pour deployer Loki : Ansible - Playbook pour deployer Prometheus
    in-progress : Terraform - monitoring : Ansible - Playbook pour la tache CRON dediee au backup de la base de ... : Terraform - Creation de l'inventaire Ansible : Ansible - Playbook pour le SSH Hardening : Test du bastion
    closed : Test de Traefik : Reseau (IaC) - Definir et tester le VPC : Terraform - Deploiement des VM : Terraform - Deploiement du reseau et des subnets : Ansible - Playbook pour deployer Docker Swarm : Test API gateway : Ansible - Playbook pour deployer Postgres : Test de la creation des sous reseaux : Test de la stack : Test de fck-nat : Creation du pipeline de compilation de l'image de NocoDB : ... (+3 de plus)
```

### 2.3. Timeline des creations

| Date | Issues creees |
|------|---------------|
| 05-12-2025 | 30 |
| 10-12-2025 | 2 |
| 11-12-2025 | 1 |


### 2.4. Aging des issues (anciennete)

| Tranche | Nb issues |
|---------|-----------|
| 0-2j | 3 |
| 3-8j | 30 |
| 9-14j | 0 |
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
    "gregoireuesteban" : 5
    "jeagra" : 8
    "gregoire.elmacin" : 4
    "Philippe-BAHEUX" : 2
```

| Assigne | Nb issues | % du total |
|---------|-----------|------------|
| non assigne | 14 | 42.4% |
| jeagra | 8 | 24.2% |
| gregoireuesteban | 5 | 15.2% |
| gregoire.elmacin | 4 | 12.1% |
| Philippe-BAHEUX | 2 | 6.1% |

### 3.3. Distribution des labels (scopes fonctionnels)
```mermaid
pie showData
    title Labels
    "scope::infra" : 22
    "scope::monitoring" : 5
    "scope::backup" : 2
    "scope::image" : 4
```

### 3.4. Top labels par assigne (max 2, sans labels d'etat)

| Assigne | Label #1 | Label #2 |
|---------|----------|----------|
| Philippe-BAHEUX | scope::infra (2) |  |
| gregoire.elmacin | scope::infra (3) | scope::backup (1) |
| gregoireuesteban | scope::image (4) | scope::infra (1) |
| jeagra | scope::infra (7) |  |

### 3.5. Top labels globaux (fonctionnels, max 5)

| Label | Nb issues |
|-------|-----------|
| scope::infra | 22 |
| scope::monitoring | 5 |
| scope::image | 4 |
| scope::backup | 2 |

---
[← Module précédent](M45_ansible-backup.md)
---
