---
chapter: 2
course: R
difficulty: beginner
duration: 90
layout: page
mermaid: true
section: 7
status: published
tags: R, ggplot2, visualisation, dataviz
chapter_title: Tronc commun Data
title: Module 7 --- Visualisation de données avec ggplot2
prev_module: "/courses/R/R06_manipulation_donnees_R.html"
prev_module_title: "Module 6 --- Manipulation de données avec dplyr et tidyr"
next_module: "/courses/R/R08_EDA_R.html"
next_module_title: "Module 8 --- Analyse exploratoire de données (EDA)"
---

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
