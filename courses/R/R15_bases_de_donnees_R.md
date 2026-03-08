---
chapter: 4
course: R
difficulty: intermédiaire
duration: 90
layout: page
mermaid: true
section: 15
status: published
tags: R, SQL, database, DBI, PostgreSQL, MySQL, SQLite
theme: Spécialisation Data Engineer
title: Module 15 --- Bases de données
type: lesson
---

# Module 15 --- Bases de données

## Objectifs pédagogiques

À la fin de ce module vous serez capable de :

-   connecter R à une **base de données**
-   exécuter des **requêtes SQL**
-   importer des tables dans R
-   écrire des données dans une base
-   utiliser les packages **DBI** et **RPostgres**

------------------------------------------------------------------------

## Contexte

Dans les environnements professionnels, les données sont rarement
stockées dans des fichiers.

Elles sont généralement stockées dans des **bases de données
relationnelles** :

-   PostgreSQL
-   MySQL
-   SQLite
-   SQL Server

Les bases de données permettent :

-   stocker de grandes quantités de données
-   effectuer des requêtes rapides
-   partager les données entre applications

R peut se connecter à ces bases pour :

-   analyser les données
-   récupérer des tables
-   écrire des résultats

------------------------------------------------------------------------

## Concepts fondamentaux

### Base de données relationnelle

Une base relationnelle contient :

  Élément        Description
  -------------- --------------------
  table          ensemble de lignes
  ligne          observation
  colonne        variable
  clé primaire   identifiant unique

------------------------------------------------------------------------

### SQL

SQL signifie :

    Structured Query Language

Il permet de :

-   sélectionner des données
-   filtrer des lignes
-   joindre des tables
-   modifier des données

Exemple :

``` sql
SELECT * FROM customers
```

------------------------------------------------------------------------

## Architecture conceptuelle

  Composant   Rôle                   Exemple
  ----------- ---------------------- ------------
  Database    stockage de données    PostgreSQL
  Driver      connexion R            RPostgres
  Query       récupération données   SELECT
  Result      données dans R         data.frame

``` mermaid
flowchart LR

Database --> Connection
Connection --> Query
Query --> Result
Result --> Analysis
```

------------------------------------------------------------------------

## Workflow

Workflow classique :

``` mermaid
flowchart LR

Database --> Connect
Connect --> Query
Query --> DataFrame
DataFrame --> Analysis
Analysis --> Export
```

Étapes :

1.  se connecter à la base
2.  exécuter une requête SQL
3.  importer les données dans R
4.  analyser les résultats

------------------------------------------------------------------------

## Mise en pratique

### Installation des packages

``` r
install.packages("DBI")
install.packages("RPostgres")
```

------------------------------------------------------------------------

### Charger les packages

``` r
library(DBI)
library(RPostgres)
```

------------------------------------------------------------------------

### Connexion PostgreSQL

``` r
con <- dbConnect(
  RPostgres::Postgres(),
  dbname = "my_database",
  host = "localhost",
  port = 5432,
  user = "user",
  password = "password"
)
```

------------------------------------------------------------------------

### Lire une table

``` r
data <- dbReadTable(con, "customers")
```

------------------------------------------------------------------------

### Exécuter une requête SQL

``` r
data <- dbGetQuery(con, "SELECT * FROM customers")
```

------------------------------------------------------------------------

### Écrire dans une table

``` r
dbWriteTable(con, "results", data)
```

------------------------------------------------------------------------

### Déconnexion

``` r
dbDisconnect(con)
```

------------------------------------------------------------------------

## SQLite

SQLite est une base **locale** stockée dans un fichier.

Connexion :

``` r
library(RSQLite)

con <- dbConnect(RSQLite::SQLite(), "database.sqlite")
```

------------------------------------------------------------------------

## Code R expliqué

Exemple :

``` r
dbGetQuery(con, "SELECT * FROM customers")
```

Analyse :

    dbGetQuery()

exécute une requête SQL.

    con

connexion à la base.

    SELECT * FROM customers

requête SQL.

Résultat :

un **data.frame dans R**.

------------------------------------------------------------------------

## Cas réel

Supposons une base PostgreSQL contenant les ventes.

``` sql
sales
customers
products
```

R peut récupérer les données :

``` r
sales <- dbGetQuery(con, "SELECT * FROM sales")
```

Puis analyser :

``` r
summary(sales)
```

------------------------------------------------------------------------

## Bonnes pratiques

Filtrer les données directement dans SQL.

Exemple :

``` sql
SELECT * FROM sales WHERE year = 2024
```

Ne pas importer toute la base inutilement.

Utiliser des index dans la base.

------------------------------------------------------------------------

## Erreurs fréquentes

Importer trop de données en mémoire.

Ne pas fermer les connexions.

Écrire des requêtes SQL inefficaces.

------------------------------------------------------------------------

## Résumé

Dans ce module nous avons vu comment connecter R à des bases de données.

Bases supportées :

-   PostgreSQL
-   MySQL
-   SQLite

Packages utilisés :

``` r
DBI
RPostgres
```

Fonctions importantes :

``` r
dbConnect()
dbGetQuery()
dbReadTable()
dbWriteTable()
dbDisconnect()
```

Ces outils permettent d'intégrer R dans des **pipelines data connectés
aux bases SQL**.

---
[← Module précédent](R14_donnees_volumineuses_R.md) | [Module suivant →](R16_API_ingestion_R.md)
---
