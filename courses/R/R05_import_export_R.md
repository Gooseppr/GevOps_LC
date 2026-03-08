---
chapter: 2
course: R
difficulty: débutant
duration: 75
layout: page
mermaid: true
section: 5
status: published
tags: R, import, export, csv, excel, json, api, database
theme: Tronc commun Data
title: Module 5 --- Import et export de données
type: lesson
---

# Module 5 --- Import et export de données

## Objectifs pédagogiques

À la fin de ce module vous serez capable de :

-   importer des fichiers **CSV**
-   importer des fichiers **Excel**
-   lire des **JSON**
-   récupérer des données depuis une **API**
-   se connecter à une **base de données**
-   exporter des résultats

------------------------------------------------------------------------

## Contexte

Dans un projet Data, la première étape est presque toujours :

**récupérer des données**.

Ces données peuvent provenir de plusieurs sources :

-   fichiers CSV
-   fichiers Excel
-   APIs web
-   bases de données
-   fichiers JSON

R possède un écosystème riche de packages pour gérer ces formats.

------------------------------------------------------------------------

## Concepts fondamentaux

Formats de données les plus utilisés :

  Format     Usage                        Exemple
  ---------- ---------------------------- --------------
  CSV        données tabulaires simples   export Excel
  Excel      fichiers métier              rapports
  JSON       API et web                   services web
  API        accès distant                REST
  Database   stockage structuré           PostgreSQL

------------------------------------------------------------------------

Packages principaux utilisés dans R :

  Package    Utilisation
  ---------- ---------------------------
  readr      lecture rapide CSV
  readxl     lecture Excel
  jsonlite   manipulation JSON
  DBI        connexion base de données

------------------------------------------------------------------------

## Architecture conceptuelle

  Composant   Rôle                 Exemple
  ----------- -------------------- --------------
  CSV         fichier tabulaire    dataset.csv
  Excel       fichier tableur      data.xlsx
  JSON        données web          API response
  Database    stockage structuré   PostgreSQL
  API         service distant      REST API

``` mermaid
flowchart LR

Data_Source --> Import_R
Import_R --> Analyse
Analyse --> Transformation
Transformation --> Export
```

------------------------------------------------------------------------

## Workflow

Processus classique :

``` mermaid
flowchart LR

Source --> Import
Import --> Nettoyage
Nettoyage --> Analyse
Analyse --> Export
```

Étapes :

1.  récupérer les données
2.  importer dans R
3.  nettoyer les données
4.  analyser
5.  exporter les résultats

------------------------------------------------------------------------

## Mise en pratique

### Import CSV

``` r
library(readr)

data <- read_csv("data.csv")
```

Avantages :

-   rapide
-   typage automatique

------------------------------------------------------------------------

### Import Excel

``` r
library(readxl)

data <- read_excel("data.xlsx")
```

Lecture possible de feuilles spécifiques.

``` r
read_excel("data.xlsx", sheet = 2)
```

------------------------------------------------------------------------

### Import JSON

``` r
library(jsonlite)

data <- fromJSON("data.json")
```

------------------------------------------------------------------------

### Import depuis une API

``` r
library(jsonlite)

url <- "https://api.example.com/data"

data <- fromJSON(url)
```

------------------------------------------------------------------------

### Connexion base de données

``` r
library(DBI)

con <- dbConnect(
  RSQLite::SQLite(),
  "database.sqlite"
)
```

Lire une table :

``` r
dbReadTable(con, "customers")
```

------------------------------------------------------------------------

### Export CSV

``` r
write.csv(data, "result.csv")
```

------------------------------------------------------------------------

## Code R expliqué

Exemple :

``` r
data <- read_csv("data.csv")
```

Analyse :

    read_csv()

fonction du package **readr**.

    "data.csv"

chemin vers le fichier.

Résultat :

un **data frame / tibble**.

------------------------------------------------------------------------

## Cas réel

Exemple d'analyse de ventes.

Import des données :

``` r
sales <- read_csv("sales.csv")
```

Inspection :

``` r
summary(sales)
```

Export du résultat :

``` r
write.csv(sales, "sales_clean.csv")
```

------------------------------------------------------------------------

## Bonnes pratiques

Toujours vérifier la structure des données.

``` r
str(data)
summary(data)
```

Utiliser **readr** plutôt que `read.csv()`.

Stocker les chemins dans des variables.

------------------------------------------------------------------------

## Erreurs fréquentes

Problèmes d'encodage.

Colonnes mal typées.

Mauvais séparateur CSV.

Exemple :

    ; au lieu de ,

Utiliser :

``` r
read_csv2()
```

pour les fichiers européens.

------------------------------------------------------------------------

## Résumé

Dans ce module nous avons appris à importer des données depuis :

-   CSV
-   Excel
-   JSON
-   API
-   bases de données

Nous avons utilisé les packages :

-   **readr**
-   **readxl**
-   **jsonlite**
-   **DBI**

Ces outils constituent la base de tout workflow Data.

---
[← Module précédent](R04_programmation_R.md) | [Module suivant →](R06_manipulation_donnees_R.md)
---
