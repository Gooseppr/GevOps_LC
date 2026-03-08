---
chapter: 2
course: R
difficulty: beginner
duration: 75
layout: page
mermaid: true
section: 2
status: published
tags: R, import, export, csv, excel, json, api, database
theme: Tronc commun Data
title: Bloc 2 -- Tronc Commun R
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

# Module 6 --- Manipulation de données

## Objectifs pédagogiques

À la fin de ce module vous serez capable de :

-   filtrer des données
-   sélectionner des colonnes
-   créer de nouvelles variables
-   agréger des données
-   regrouper des observations
-   transformer la structure des données

------------------------------------------------------------------------

## Contexte

Dans la plupart des projets data, **la majorité du travail consiste à
préparer les données**.

Les opérations les plus fréquentes sont :

-   filtrer des lignes
-   sélectionner des colonnes
-   créer de nouvelles variables
-   agréger des données
-   restructurer des tables

L'écosystème **tidyverse** fournit des outils très puissants pour cela.

Les packages principaux sont :

-   **dplyr** → manipulation de données
-   **tidyr** → transformation de structure

------------------------------------------------------------------------

## Concepts fondamentaux

Les opérations de manipulation de données suivent souvent une logique :

  Opération   Description
  ----------- ----------------------------
  filter      filtrer des lignes
  select      choisir des colonnes
  mutate      créer une nouvelle colonne
  group_by    regrouper des observations
  summarise   calculer des agrégats

Ces fonctions sont généralement combinées avec l'opérateur :

    %>%

appelé **pipe**.

Le pipe permet d'enchaîner les transformations.

------------------------------------------------------------------------

## Architecture conceptuelle

  Composant   Rôle                 Exemple
  ----------- -------------------- ------------------------
  filter      filtrer les lignes   filter(points \> 10)
  select      choisir colonnes     select(team, points)
  mutate      créer variable       mutate(score = x\*2)
  group_by    regrouper            group_by(team)
  summarise   agrégation           summarise(mean_points)

``` mermaid
flowchart LR

Data --> Filter
Filter --> Select
Select --> Mutate
Mutate --> GroupBy
GroupBy --> Summarise
Summarise --> Result
```

------------------------------------------------------------------------

## Workflow

Workflow typique d'analyse :

``` mermaid
flowchart LR

Raw_Data --> Cleaning
Cleaning --> Transformation
Transformation --> Aggregation
Aggregation --> Analysis
```

Étapes :

1.  importer les données
2.  nettoyer les observations
3.  transformer les variables
4.  calculer des indicateurs

------------------------------------------------------------------------

## Mise en pratique

### Charger les packages

``` r
library(dplyr)
library(tidyr)
```

------------------------------------------------------------------------

### Exemple de dataset

``` r
df <- data.frame(
  team = c("A","A","B","B"),
  player = c("p1","p2","p3","p4"),
  points = c(10,15,20,18)
)
```

------------------------------------------------------------------------

### filter()

Filtrer des lignes.

``` r
df %>%
  filter(points > 12)
```

------------------------------------------------------------------------

### select()

Sélectionner des colonnes.

``` r
df %>%
  select(team, points)
```

------------------------------------------------------------------------

### mutate()

Créer une nouvelle variable.

``` r
df %>%
  mutate(points_double = points * 2)
```

------------------------------------------------------------------------

### group_by()

Regrouper des observations.

``` r
df %>%
  group_by(team)
```

------------------------------------------------------------------------

### summarise()

Calculer des agrégats.

``` r
df %>%
  group_by(team) %>%
  summarise(mean_points = mean(points))
```

------------------------------------------------------------------------

### Exemple complet

``` r
df %>%
 group_by(team) %>%
 summarise(points = mean(points))
```

Résultat :

    team mean_points
    A    12.5
    B    19

------------------------------------------------------------------------

## tidyr --- transformation de structure

`tidyr` permet de restructurer les données.

Fonctions importantes :

  Fonction       Rôle
  -------------- --------------------------------
  pivot_longer   transformer colonnes en lignes
  pivot_wider    transformer lignes en colonnes
  separate       séparer une colonne
  unite          fusionner colonnes

------------------------------------------------------------------------

### Exemple pivot_longer

``` r
pivot_longer(data, cols = c(score1, score2))
```

------------------------------------------------------------------------

## Code R expliqué

Exemple :

``` r
df %>%
 group_by(team) %>%
 summarise(points = mean(points))
```

Analyse :

    df

dataset de départ.

    group_by(team)

regroupement par équipe.

    summarise()

calcul d'un agrégat.

    mean(points)

calcul de la moyenne.

------------------------------------------------------------------------

## Cas réel

Supposons un dataset de ventes :

``` r
sales <- data.frame(
  store = c("Paris","Paris","Lyon","Lyon"),
  revenue = c(100,120,90,110)
)
```

Calcul du revenu moyen par ville :

``` r
sales %>%
 group_by(store) %>%
 summarise(mean_revenue = mean(revenue))
```

------------------------------------------------------------------------

## Bonnes pratiques

Toujours utiliser **le pipe** pour garder un code lisible.

Nommer clairement les colonnes créées.

Utiliser **group_by + summarise** plutôt que des boucles.

------------------------------------------------------------------------

## Erreurs fréquentes

Oublier `group_by()` avant `summarise()`.

Confondre `mutate()` et `summarise()`.

`mutate()` → ajoute une colonne

`summarise()` → réduit les lignes.

------------------------------------------------------------------------

## Résumé

Dans ce module nous avons appris à manipuler des données avec :

-   **dplyr**
-   **tidyr**

Fonctions essentielles :

``` r
filter()
select()
mutate()
group_by()
summarise()
```

Ces outils sont au cœur de la **data analysis en R**.

# Module 7 --- Visualisation de données

## Objectifs pédagogiques

À la fin de ce module vous serez capable de :

-   créer des graphiques avec **ggplot2**
-   comprendre la **Grammar of Graphics**
-   construire des graphiques étape par étape
-   utiliser différents types de visualisation :
    -   histogram
    -   bar chart
    -   scatter plot
    -   boxplot

------------------------------------------------------------------------

## Contexte

La visualisation est une étape essentielle dans tout projet data.

Elle permet de :

-   comprendre les données
-   détecter des anomalies
-   communiquer les résultats
-   explorer des tendances

Le package le plus utilisé en R est :

**ggplot2**

Il fait partie du **tidyverse**.

------------------------------------------------------------------------

## Concepts fondamentaux

Le principe de ggplot2 repose sur la **Grammar of Graphics**.

Un graphique est construit par couches.

Structure générale :

``` r
ggplot(data, aes(x, y)) +
  geom_*
```

Chaque graphique possède :

  Élément   Rôle
  --------- -----------------------
  data      dataset
  aes()     mapping des variables
  geom      type de graphique
  theme     style graphique

------------------------------------------------------------------------

## Architecture conceptuelle

  Composant   Rôle                Exemple
  ----------- ------------------- -----------------
  data        dataset utilisé     df
  aes         mapping variables   aes(x, y)
  geom        type de graphique   geom_point()
  theme       style graphique     theme_minimal()

``` mermaid
flowchart LR

Data --> Aesthetic
Aesthetic --> Geom
Geom --> Graph
Graph --> Interpretation
```

------------------------------------------------------------------------

## Workflow

Processus typique de visualisation :

``` mermaid
flowchart LR

Data --> Exploration
Exploration --> Visualisation
Visualisation --> Interpretation
Interpretation --> Communication
```

Étapes :

1.  importer les données
2.  explorer la distribution
3.  créer des graphiques
4.  interpréter les résultats

------------------------------------------------------------------------

## Mise en pratique

### Charger le package

``` r
library(ggplot2)
```

------------------------------------------------------------------------

### Dataset exemple

``` r
df <- data.frame(
  x = 1:10,
  y = c(2,4,3,6,7,8,9,10,9,11),
  group = c("A","A","A","A","B","B","B","B","B","B")
)
```

------------------------------------------------------------------------

### Scatter plot

``` r
ggplot(df, aes(x, y)) +
  geom_point()
```

Un **scatter plot** montre la relation entre deux variables.

------------------------------------------------------------------------

### Histogram

``` r
ggplot(df, aes(x)) +
  geom_histogram(bins = 5)
```

Permet d'observer la distribution d'une variable.

------------------------------------------------------------------------

### Bar chart

``` r
ggplot(df, aes(group)) +
  geom_bar()
```

Permet de compter les observations par catégorie.

------------------------------------------------------------------------

### Boxplot

``` r
ggplot(df, aes(group, y)) +
  geom_boxplot()
```

Permet d'analyser la distribution d'une variable par groupe.

------------------------------------------------------------------------

## Code R expliqué

Exemple :

``` r
ggplot(df, aes(x,y)) +
 geom_point()
```

Analyse :

    ggplot(df)

définit le dataset.

    aes(x,y)

mapping des variables.

    geom_point()

ajoute un nuage de points.

------------------------------------------------------------------------

## Cas réel

Supposons un dataset de ventes :

``` r
sales <- data.frame(
  month = 1:12,
  revenue = c(100,120,140,130,160,180,200,210,190,170,150,140)
)
```

Visualisation de la tendance :

``` r
ggplot(sales, aes(month, revenue)) +
  geom_line()
```

------------------------------------------------------------------------

## Bonnes pratiques

Toujours commencer par un graphique simple.

Ajouter progressivement les couches.

Utiliser des labels clairs :

``` r
labs(
  title = "Revenue par mois",
  x = "Mois",
  y = "Revenue"
)
```

------------------------------------------------------------------------

## Erreurs fréquentes

Confondre `data` et `aes`.

Exemple incorrect :

``` r
ggplot(aes(df, x, y))
```

Correct :

``` r
ggplot(df, aes(x,y))
```

Oublier le `+` entre les couches.

------------------------------------------------------------------------

## Résumé

Dans ce module nous avons appris :

-   la structure **ggplot()**
-   l'utilisation de **aes()**
-   les principaux graphiques :

``` r
geom_point()
geom_histogram()
geom_bar()
geom_boxplot()
```

La visualisation est essentielle pour **explorer et communiquer les
données**.

# Module 8 --- Analyse exploratoire de données (EDA)

## Objectifs pédagogiques

À la fin de ce module vous serez capable de :

-   comprendre le rôle de l'**analyse exploratoire**
-   calculer des **statistiques descriptives**
-   analyser la **distribution des données**
-   mesurer les **corrélations**
-   détecter des **outliers**

------------------------------------------------------------------------

## Contexte

L'EDA (Exploratory Data Analysis) est l'une des étapes les plus
importantes en data science.

Avant toute modélisation il faut :

-   comprendre les variables
-   analyser leur distribution
-   détecter les anomalies
-   identifier les relations entre variables

L'objectif est de **comprendre les données avant de construire des
modèles**.

------------------------------------------------------------------------

## Concepts fondamentaux

L'analyse exploratoire repose sur plusieurs types d'analyses.

  Type d'analyse              Objectif
  --------------------------- ---------------------------------
  statistiques descriptives   résumer les données
  distribution                comprendre la forme des données
  corrélation                 relation entre variables
  outliers                    détecter les valeurs aberrantes

------------------------------------------------------------------------

## Architecture conceptuelle

  Composant   Rôle                 Exemple
  ----------- -------------------- -------------
  mean        moyenne              mean(x)
  sd          écart type           sd(x)
  cor         corrélation          cor(x,y)
  summary     résumé statistique   summary(df)

``` mermaid
flowchart LR

Data --> Statistiques
Statistiques --> Distribution
Distribution --> Correlation
Correlation --> Outliers
Outliers --> Insights
```

------------------------------------------------------------------------

## Workflow

Processus classique d'EDA :

``` mermaid
flowchart LR

Dataset --> Description
Description --> Distribution
Distribution --> Relations
Relations --> Outliers
Outliers --> Interpretation
```

Étapes :

1.  examiner les statistiques descriptives
2.  analyser les distributions
3.  étudier les corrélations
4.  détecter les valeurs aberrantes

------------------------------------------------------------------------

## Mise en pratique

### Dataset exemple

``` r
df <- data.frame(
  age = c(22,25,30,35,40,45,100),
  salary = c(2000,2200,2500,2700,3000,3200,50000)
)
```

------------------------------------------------------------------------

### Statistiques descriptives

``` r
mean(df$age)
sd(df$age)
```

-   `mean()` calcule la moyenne
-   `sd()` calcule l'écart type

------------------------------------------------------------------------

### Résumé statistique

``` r
summary(df)
```

Résultat typique :

    Min.
    1st Qu.
    Median
    Mean
    3rd Qu.
    Max.

------------------------------------------------------------------------

### Distribution

On peut visualiser la distribution :

``` r
hist(df$age)
```

------------------------------------------------------------------------

### Corrélation

``` r
cor(df$age, df$salary)
```

La corrélation varie entre :

    -1 et 1

  Valeur   Signification
  -------- ---------------------------
  1        corrélation parfaite
  0        aucune relation
  -1       relation inverse parfaite

------------------------------------------------------------------------

### Détection d'outliers

Les outliers sont des valeurs **anormalement éloignées**.

Exemple simple :

``` r
boxplot(df$salary)
```

La valeur `50000` sera détectée comme outlier.

------------------------------------------------------------------------

## Code R expliqué

Exemple :

``` r
mean(df$age)
```

Analyse :

    df$age

sélection de la colonne.

    mean()

calcul de la moyenne.

------------------------------------------------------------------------

## Cas réel

Supposons un dataset clients :

``` r
customers <- data.frame(
  age = c(20,25,30,35,40),
  spending = c(100,150,200,250,300)
)
```

Analyse :

``` r
summary(customers)
cor(customers$age, customers$spending)
```

Cela permet de comprendre :

-   le profil des clients
-   la relation entre âge et dépenses

------------------------------------------------------------------------

## Bonnes pratiques

Toujours commencer par :

``` r
summary(data)
str(data)
```

Visualiser les distributions.

Examiner les corrélations.

Identifier les valeurs aberrantes avant toute modélisation.

------------------------------------------------------------------------

## Erreurs fréquentes

Ignorer les outliers.

Analyser des corrélations sur des variables non pertinentes.

Tirer des conclusions trop rapides.

Confondre corrélation et causalité.

------------------------------------------------------------------------

## Résumé

Dans ce module nous avons appris les bases de l'EDA :

-   statistiques descriptives
-   distributions
-   corrélations
-   détection d'outliers

Fonctions clés :

``` r
mean()
sd()
cor()
summary()
```

L'EDA permet de **comprendre les données avant toute analyse avancée**.

---
[← Module précédent](R01_Fondations_R.md) | [Module suivant →](R09_Data_Scientist_R.md)
---
