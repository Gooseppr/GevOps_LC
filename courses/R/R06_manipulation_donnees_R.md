---
chapter: 2
course: R
difficulty: beginner-intermédiaire
duration: 90
layout: page
mermaid: true
section: 6
status: published
tags: R, dplyr, tidyr, data manipulation, tidyverse
chapter_title: Tronc commun Data
title: Module 6 --- Manipulation de données avec dplyr et tidyr
prev_module: "/courses/R/R05_import_export_R.html"
prev_module_title: "Module 5 --- Import et export de données"
next_module: "/courses/R/R07_visualisation_ggplot2.html"
next_module_title: "Module 7 --- Visualisation de données avec ggplot2"
---

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
