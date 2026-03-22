---
chapter: 2
course: R
difficulty: débutant
duration: 90
layout: page
mermaid: true
section: 8
status: published
tags: R, EDA, statistiques descriptives, corrélation, outliers
theme: Tronc commun Data
title: Module 8 --- Analyse exploratoire de données (EDA)
type: lesson
prev_module: "/courses/R/R07_visualisation_ggplot2.html"
prev_module_title: "Module 7 --- Visualisation de données avec ggplot2"
next_module: "/courses/R/R09_probabilites_statistiques_R.html"
next_module_title: "Module 9 --- Probabilités et statistiques"
---

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
