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

### 1.1. % d'issues assignees
```mermaid
pie showData
    title Issues assignees
    "assignees" : 4
    "non assignees" : 31
```

### 1.2. % d'issues avec due_date
```mermaid
pie showData
    title Issues avec due_date
    "avec due_date" : 0
    "sans due_date" : 35
```

## 2. Avancement (flux de travail & temps)
### 2.1 Repartition par colonne du board
```mermaid
pie showData
    title Colonnes du board
    "backlog" : 26
    "open" : 5
    "in-progress" : 4
    "closed" : 0
```

Colonne | Description | Nb issues | % du total
|---------|-------------|--------|------------|
| backlog | Task to be picked up during sprint planning | 26 | 74.3% |
| open | Issues within a sprint, awating to be taken for development | 5 | 14.3% |
| in-progress | On-going work (must be assigned to somebody) | 4 | 11.4% |
| closed | Issue reached completion | 0 | 0.0% |

### 2.2 Kanban (vue synthetique)
```mermaid
timeline
    title "Kanban (labels backlog/open/in-progress/closed)"
    backlog : Creation d'un pipeline pour deployer l'infrastructure : Terraform - Creation du S3 pour les backups de les bases de donnees : Ansible - Playbook pour la tache CRON dediee au backup de la base de ... : Terraform - Creation de l'inventaire Ansible : Reseau (IaC) - Definir et tester le VPC : Terraform - Deploiement des VM : Terraform - Deploiement du reseau et des subnets : Ansible - Playbook pour configurer la VM NAT : Ansible - Playbook pour configurer la VM Application : Ansible - Playbook pour configurer la VM Database : Ansible - Playbook pour configurer la VM Prometheus / Loki : ... (+15 de plus)
    open : Test API gateway : Test de la creation des sous reseaux : Creation du pipeline de compilation de l'image de NocoDB : Test de l'image localement de NocoDB : Compilation de l'image localement de NocoDB
    in-progress : Test du bastion : Test de la stack : Test de fck-nat : Clone du code NocoDB
    closed : -
```

### 2.3 Timeline des creations

| Date | Issues creees |
|------|---------------|
| 05-12-2025 | 35 |


### 2.4 Aging des issues (anciennete)

| Tranche | Nb issues |
|---------|-----------|
| 0-7j | 35 |
| 8-14j | 0 |
| 15-30j | 0 |
| 30j+ | 0 |


### 2.5 Gantt des taches (approximatif)
Utilise start_date si renseignee, sinon created_at comme debut, et due_date/closed_at ou une duree par defaut.
```mermaid
gantt
    title Issues (start=created_at, end=due_date ou +7j)
    dateFormat  DD-MM-YYYY
    axisFormat  %d/%m
    Creation d'un pipeline pour deployer l'infras... : 05-12-2025, 7d
    Terraform - Creation du S3 pour les backups d... : 05-12-2025, 7d
    Ansible - Playbook pour la tache CRON dediee ... : 05-12-2025, 7d
    Terraform - Creation de l'inventaire Ansible : 05-12-2025, 7d
    Reseau (IaC) - Definir et tester le VPC : 05-12-2025, 7d
    Terraform - Deploiement des VM : 05-12-2025, 7d
    Terraform - Deploiement du reseau et des subnets : 05-12-2025, 7d
    Ansible - Playbook pour configurer la VM NAT : 05-12-2025, 7d
    Ansible - Playbook pour configurer la VM Appl... : 05-12-2025, 7d
    Ansible - Playbook pour configurer la VM Data... : 05-12-2025, 7d
    Ansible - Playbook pour configurer la VM Prom... : 05-12-2025, 7d
    Ansible - Playbook pour configurer la VM Grafana : 05-12-2025, 7d
    Ansible - Playbook pour configurer la VM du b... : 05-12-2025, 7d
    Ansible - Playbook pour configurer la VM Gateway : 05-12-2025, 7d
    Ansible - Playbook pour le SSH Hardening : 05-12-2025, 7d
    Ansible - Playbook pour deployer Docker Swarm : 05-12-2025, 7d
    Ansible - Playbook pour deployer Traefik : 05-12-2025, 7d
    Ansible - Playbook pour deployer Kong : 05-12-2025, 7d
    Test API gateway : 05-12-2025, 7d
    Ansible - Playbook pour deployer fck-nat : 05-12-2025, 7d
    Ansible - Playbook pour deployer Loki : 05-12-2025, 7d
    Ansible - Playbook pour deployer Prometheus : 05-12-2025, 7d
    Ansible - Playbook pour deployer Grafana : 05-12-2025, 7d
    Ansible - Playbook pour deployer Postgres : 05-12-2025, 7d
    Ansible - Playbook pour deployer les exporter... : 05-12-2025, 7d
    creation du script Terrafrom : 05-12-2025, 7d
    Test de la creation des sous reseaux : 05-12-2025, 7d
    Test du bastion : 05-12-2025, 7d
    Test de la stack : 05-12-2025, 7d
    Test de fck-nat : 05-12-2025, 7d
    Creation du pipeline de compilation de l'imag... : 05-12-2025, 7d
    Test de l'image localement de NocoDB : 05-12-2025, 7d
    Compilation de l'image localement de NocoDB : 05-12-2025, 7d
    Clone du code NocoDB : 05-12-2025, 7d
    script d'infra : 05-12-2025, 7d
```

## Charge & focus

### Repartition par projet
```mermaid
pie showData
    title Issues par projet
    "Management" : 34
    "inconnu" : 1
```

### Charge par assigne (pie hors non assigne)
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

### Distribution des labels
```mermaid
pie showData
    title Labels
    "backlog" : 26
    "scope::infra" : 24
    "scope::backup" : 2
    "open" : 5
    "scope::monitoring" : 4
    "in-progress" : 4
    "scope::image" : 4
```

### Top labels par assigne (3 premiers)
| Assigne | Top labels |
|---------|------------|
| Philippe-BAHEUX | in-progress:1, scope::infra:1 |
| gregoire.elmacin | in-progress:1, scope::infra:1 |
| gregoireuesteban | in-progress:1, scope::image:1 |
| jeagra | in-progress:1, scope::infra:1 |

### Top labels global (12)

| Label | Nb issues |
|-------|-----------|
| backlog | 26 |
| scope::infra | 24 |
| open | 5 |
| scope::monitoring | 4 |
| in-progress | 4 |
| scope::image | 4 |
| scope::backup | 2 |

## 4. Limites actuelles & pistes d'amelioration
- Assigner toutes les issues actives (open / in-progress) pour piloter la charge.
- Renseigner des due_date sur les taches critiques (infra, bastion, NAT, monitoring, etc.).
- Ajouter des milestones (MVP, demo, soutenance) avec start/end pour suivre les echeances.
- Enrichir les labels scopes pour mieux segmenter (scope::infra, scope::monitoring, etc.).