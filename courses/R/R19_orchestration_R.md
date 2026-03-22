---
chapter: 4
course: R
difficulty: intermédiaire
duration: 75
layout: page
mermaid: true
section: 19
status: published
tags: R, orchestration, pipelines, airflow, dagster, cron
theme: Spécialisation Data Engineer
title: Module 19 --- Orchestration des pipelines
type: lesson
prev_module: "/courses/R/R18_pipelines_donnees_R.html"
prev_module_title: "Module 18 --- Pipelines de données"
next_module: "/courses/R/R20_production_R.html"
next_module_title: "Module 20 --- Production"
---

# Module 19 --- Orchestration

## Objectifs pédagogiques

À la fin de ce module vous serez capable de :

-   comprendre ce qu'est **l'orchestration de pipelines**
-   planifier des tâches avec **cron**
-   comprendre le rôle d'un orchestrateur
-   utiliser des outils comme **Airflow** ou **Dagster**
-   structurer un workflow data automatisé

------------------------------------------------------------------------

## Contexte

Dans un environnement data réel, les pipelines doivent être :

-   **automatisés**
-   **planifiés**
-   **monitorés**
-   **reproductibles**

Un simple script exécuté manuellement ne suffit pas.

Il faut un système qui gère :

-   l'ordre d'exécution
-   les dépendances entre tâches
-   la planification
-   les erreurs

C'est le rôle de **l'orchestration**.

------------------------------------------------------------------------

## Concepts fondamentaux

### Orchestration

L'orchestration consiste à **coordonner plusieurs étapes d'un
pipeline**.

Exemple :

    ingestion → transformation → dataset final → dashboard

Chaque étape dépend de la précédente.

------------------------------------------------------------------------

### Scheduling

Les pipelines sont souvent exécutés :

-   toutes les heures
-   chaque nuit
-   chaque semaine

Cela nécessite un **scheduler**.

------------------------------------------------------------------------

### Dépendances

Les workflows data contiennent souvent des dépendances :

  Tâche            Dépend de
  ---------------- ----------------
  Transformation   ingestion
  Dataset final    transformation
  Dashboard        dataset final

------------------------------------------------------------------------

## Architecture conceptuelle

  Composant       Rôle                   Exemple
  --------------- ---------------------- ------------
  Scheduler       planifie les tâches    cron
  Orchestrateur   coordonne workflows    Airflow
  Pipeline        suite de tâches        ETL
  Logs            suivi des exécutions   monitoring

``` mermaid
flowchart LR

Scheduler --> Pipeline
Pipeline --> Task1
Task1 --> Task2
Task2 --> Task3
Task3 --> Result
```

------------------------------------------------------------------------

## Workflow

Workflow typique orchestré :

``` mermaid
flowchart LR

Schedule --> Ingestion
Ingestion --> Transformation
Transformation --> Dataset
Dataset --> Reporting
```

Étapes :

1.  planifier le pipeline
2.  exécuter les tâches
3.  vérifier les résultats
4.  monitorer l'exécution

------------------------------------------------------------------------

## Mise en pratique

### Cron

`cron` est un planificateur Linux.

Exemple :

    0 2 * * * Rscript pipeline.R

Cela exécute le pipeline :

    tous les jours à 02h00

------------------------------------------------------------------------

### Airflow

Airflow est un orchestrateur très utilisé en data engineering.

Les workflows sont définis comme des **DAG (Directed Acyclic Graph)**.

Exemple simplifié :

``` python
task1 >> task2 >> task3
```

Chaque tâche dépend de la précédente.

------------------------------------------------------------------------

### Dagster

Dagster est un orchestrateur moderne orienté data pipelines.

Avantages :

-   gestion des dépendances
-   monitoring
-   gestion des assets data

------------------------------------------------------------------------

## Code R expliqué

Exemple d'appel pipeline :

``` bash
Rscript pipeline.R
```

Analyse :

    Rscript

exécute un script R.

    pipeline.R

script contenant le pipeline data.

Ce script peut être déclenché par :

-   cron
-   Airflow
-   Dagster

------------------------------------------------------------------------

## Cas réel

Pipeline data marketing quotidien :

1.  récupérer données API
2.  nettoyer les données
3.  générer dataset
4.  mettre à jour dashboard

Planification :

    cron → 02:00

------------------------------------------------------------------------

## Bonnes pratiques

Utiliser un orchestrateur pour les pipelines critiques.

Ajouter des logs.

Gérer les erreurs.

Séparer les tâches en étapes indépendantes.

------------------------------------------------------------------------

## Erreurs fréquentes

Pipeline monolithique dans un seul script.

Absence de monitoring.

Absence de retry automatique.

------------------------------------------------------------------------

## Résumé

Dans ce module nous avons étudié l'orchestration des pipelines.

Exemples d'outils :

-   cron
-   Airflow
-   Dagster

L'orchestration permet d'**automatiser, planifier et superviser les
pipelines data**.
