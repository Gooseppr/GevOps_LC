---
chapter: 4
course: R
difficulty: intermédiaire
duration: 90
layout: page
mermaid: true
section: 14
status: published
tags: R, big data, data.table, arrow, parquet
theme: Spécialisation Data Engineer
title: Module 14 --- Gestion de données volumineuses
type: lesson
prev_module: "/courses/R/R13_validation_feature_engineering_R.html"
prev_module_title: "Module 13 --- Validation et Feature Engineering"
next_module: "/courses/R/R15_bases_de_donnees_R.html"
next_module_title: "Module 15 --- Bases de données"
---

# Module 14 --- Gestion de données volumineuses

## Objectifs pédagogiques

À la fin de ce module vous serez capable de :

-   manipuler des **datasets volumineux**
-   utiliser **data.table** pour des opérations rapides
-   utiliser **Arrow** pour lire des données massives
-   travailler avec le format **Parquet**
-   comprendre les enjeux de **performance et mémoire**

------------------------------------------------------------------------

## Contexte

Dans de nombreux projets data, les datasets peuvent atteindre :

-   plusieurs **gigaoctets**
-   plusieurs **millions de lignes**
-   plusieurs **centaines de colonnes**

Les structures classiques comme **data.frame** peuvent devenir lentes.

Des outils spécialisés existent pour améliorer :

-   la vitesse
-   l'utilisation mémoire
-   la gestion des fichiers massifs

------------------------------------------------------------------------

## Concepts fondamentaux

### Performance

La performance correspond à :

-   la **vitesse de calcul**
-   la **rapidité de lecture des données**
-   la **gestion efficace de la mémoire**

------------------------------------------------------------------------

### Gestion mémoire

R charge normalement les données **en mémoire**.

Pour les datasets massifs, cela peut poser problème :

-   RAM saturée
-   calculs lents

Des outils permettent de traiter les données **plus efficacement**.

------------------------------------------------------------------------

### Formats optimisés

  Format    Avantage
  --------- ----------------------
  CSV       simple mais lent
  Parquet   compressé et rapide
  Arrow     accès colonne rapide

------------------------------------------------------------------------

## Architecture conceptuelle

  Composant        Rôle                  Exemple
  ---------------- --------------------- --------------------
  Dataset massif   grande table          millions de lignes
  data.table       manipulation rapide   filtrage rapide
  Arrow            accès colonnes        lecture rapide
  Parquet          stockage optimisé     compression

``` mermaid
flowchart LR

Raw_Data --> Storage
Storage --> Parquet
Parquet --> Arrow
Arrow --> Analysis
Analysis --> Results
```

------------------------------------------------------------------------

## Workflow

Workflow typique avec données massives :

``` mermaid
flowchart LR

Raw_Data --> Efficient_Format
Efficient_Format --> Fast_Load
Fast_Load --> Processing
Processing --> Aggregation
Aggregation --> Output
```

Étapes :

1.  stocker les données dans un format efficace
2.  charger uniquement les colonnes nécessaires
3.  traiter les données
4.  agréger les résultats

------------------------------------------------------------------------

## Mise en pratique

### data.table

Le package **data.table** est conçu pour la performance.

``` r
library(data.table)

dt <- data.table(
  id = 1:5,
  value = c(10,20,30,40,50)
)
```

Filtrage rapide :

``` r
dt[value > 20]
```

------------------------------------------------------------------------

### Lecture rapide

``` r
fread("data.csv")
```

`fread()` est beaucoup plus rapide que `read.csv()`.

------------------------------------------------------------------------

### Arrow

Le package **arrow** permet de manipuler des datasets massifs.

``` r
library(arrow)

data <- read_parquet("data.parquet")
```

------------------------------------------------------------------------

### Parquet

Parquet est un format **colonne compressé**.

Avantages :

-   très rapide
-   efficace pour les gros datasets
-   compatible avec Spark, Python, etc.

------------------------------------------------------------------------

### Écriture parquet

``` r
write_parquet(data, "dataset.parquet")
```

------------------------------------------------------------------------

## Code R expliqué

Exemple :

``` r
dt[value > 20]
```

Analyse :

    dt

table de données.

    [value > 20]

filtre rapide directement dans la structure.

Cette syntaxe est très efficace pour les gros datasets.

------------------------------------------------------------------------

## Cas réel

Supposons un dataset de **100 millions de lignes**.

Stratégie :

1.  stocker en **Parquet**
2.  lire avec **Arrow**
3.  manipuler avec **data.table**

Cela permet de traiter des volumes très importants.

------------------------------------------------------------------------

## Bonnes pratiques

Utiliser **data.table** pour les gros datasets.

Éviter les copies inutiles en mémoire.

Stocker les données dans un format optimisé.

Lire uniquement les colonnes nécessaires.

------------------------------------------------------------------------

## Erreurs fréquentes

Charger un dataset entier inutilement.

Utiliser `read.csv()` sur des fichiers massifs.

Créer des copies de données inutiles.

------------------------------------------------------------------------

## Résumé

Dans ce module nous avons étudié la gestion des **données volumineuses
en R**.

Packages importants :

``` r
data.table
arrow
```

Format clé :

    Parquet

Concepts essentiels :

-   performance
-   gestion mémoire
-   datasets massifs
