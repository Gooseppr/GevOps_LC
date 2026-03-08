---
chapter: 4
course: R
difficulty: intermédiaire
duration: 90
layout: page
mermaid: true
section: 17
status: published
tags: R, parallel computing, future, parallel
theme: Spécialisation Data Engineer
title: Module 17 --- Parallélisation
type: lesson
---

# Module 17 --- Parallélisation

## Objectifs pédagogiques

À la fin de ce module vous serez capable de :

-   comprendre le principe du **calcul parallèle**
-   utiliser plusieurs **cœurs CPU**
-   accélérer des traitements R
-   utiliser les packages :

``` r
future
parallel
```

------------------------------------------------------------------------

## Contexte

Lorsque les datasets deviennent volumineux ou que les calculs sont
lourds, les traitements peuvent devenir très lents.

Une solution consiste à utiliser **plusieurs cœurs du processeur en même
temps**.

C'est le principe de la **parallélisation**.

Au lieu d'exécuter les calculs **séquentiellement**, ils sont exécutés
**en parallèle**.

Cela permet :

-   d'accélérer les calculs
-   de traiter plus de données
-   d'optimiser les pipelines data

------------------------------------------------------------------------

## Concepts fondamentaux

### Calcul séquentiel

Un traitement classique est exécuté **étape par étape**.

Exemple :

    tâche 1 → tâche 2 → tâche 3

------------------------------------------------------------------------

### Calcul parallèle

Le calcul parallèle exécute plusieurs tâches **simultanément**.

    tâche 1
    tâche 2  → exécutées en même temps
    tâche 3

------------------------------------------------------------------------

### Multicore

Les processeurs modernes possèdent plusieurs **cœurs**.

Chaque cœur peut exécuter un calcul indépendant.

Exemple :

  CPU                Cœurs
  ------------------ -------
  Laptop classique   4
  Workstation        8-32
  Serveur            64+

------------------------------------------------------------------------

## Architecture conceptuelle

  Composant   Rôle                  Exemple
  ----------- --------------------- -----------
  CPU cores   exécution parallèle   multicore
  Worker      processus parallèle   tâche
  Scheduler   distribution tâches   future
  Résultat    agrégation            output

``` mermaid
flowchart LR

Task1 --> Worker1
Task2 --> Worker2
Task3 --> Worker3

Worker1 --> Result
Worker2 --> Result
Worker3 --> Result
```

------------------------------------------------------------------------

## Workflow

Workflow classique :

``` mermaid
flowchart LR

Data --> Split
Split --> Workers
Workers --> Processing
Processing --> Combine
Combine --> Result
```

Étapes :

1.  diviser les tâches
2.  exécuter en parallèle
3.  combiner les résultats

------------------------------------------------------------------------

## Mise en pratique

### Package parallel

Le package **parallel** est inclus dans R.

Exemple simple :

``` r
library(parallel)

cores <- detectCores()

cores
```

Cela affiche le nombre de cœurs disponibles.

------------------------------------------------------------------------

### Exemple avec mclapply

``` r
library(parallel)

result <- mclapply(
  1:5,
  function(x) x^2,
  mc.cores = 2
)
```

Cela exécute les calculs sur **2 cœurs**.

------------------------------------------------------------------------

### Package future

Le package **future** simplifie la parallélisation.

``` r
library(future)

plan(multisession)
```

------------------------------------------------------------------------

### Exécution parallèle

``` r
library(future.apply)

result <- future_lapply(
  1:5,
  function(x) x^2
)
```

------------------------------------------------------------------------

## Code R expliqué

Exemple :

``` r
mclapply(1:5, function(x) x^2, mc.cores = 2)
```

Analyse :

    1:5

liste des tâches.

    function(x) x^2

fonction appliquée.

    mc.cores = 2

nombre de cœurs utilisés.

------------------------------------------------------------------------

## Cas réel

Supposons un traitement sur **1 million de lignes**.

Au lieu de traiter séquentiellement :

    1 → 2 → 3 → 4

On peut répartir :

    core1 → lignes 1-250k
    core2 → lignes 250k-500k
    core3 → lignes 500k-750k
    core4 → lignes 750k-1M

Résultat :

temps de calcul fortement réduit.

------------------------------------------------------------------------

## Bonnes pratiques

Utiliser la parallélisation uniquement pour les tâches lourdes.

Éviter de paralléliser des tâches très rapides.

Limiter le nombre de cœurs pour éviter la saturation mémoire.

------------------------------------------------------------------------

## Erreurs fréquentes

Utiliser trop de cœurs.

Ne pas gérer les erreurs dans les workers.

Paralléliser des opérations dépendantes.

------------------------------------------------------------------------

## Résumé

Dans ce module nous avons appris à accélérer les traitements avec la
**parallélisation**.

Packages utilisés :

``` r
parallel
future
```

Fonctions importantes :

``` r
detectCores()
mclapply()
future_lapply()
```

La parallélisation permet d'**optimiser les pipelines data et réduire le
temps de calcul**.

---
[← Module précédent](R16_API_ingestion_R.md) | [Module suivant →](R18_pipelines_donnees_R.md)
---
