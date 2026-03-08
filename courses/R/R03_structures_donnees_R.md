---
chapter: 1
course: R
difficulty: débutant
duration: 75
layout: page
mermaid: true
section: 3
status: published
tags: R, data structures, vector, matrix, list, dataframe, tibble
theme: Fondations du langage R
title: Module 3 --- Structures de données en R
type: lesson
---

# Module 3 --- Structures de données en R

## Objectifs pédagogiques

À la fin de ce module vous serez capable de :

-   comprendre les **structures de données fondamentales de R**
-   créer des **vecteurs**
-   manipuler des **matrices**
-   utiliser des **listes**
-   comprendre les **data.frames**
-   utiliser les **tibbles**
-   inspecter des données avec :

``` r
str()
summary()
length()
```

------------------------------------------------------------------------

## Contexte

R est un langage **orienté analyse de données**.

Les structures de données sont donc **le cœur du langage**.

Toutes les analyses reposent sur quelques structures principales :

-   **vector**
-   **matrix**
-   **list**
-   **data.frame**
-   **tibble**

Comprendre ces structures permet de :

-   manipuler des datasets
-   faire des statistiques
-   produire des graphiques
-   entraîner des modèles de machine learning

------------------------------------------------------------------------

## Concepts fondamentaux

### Vector

Le **vecteur** est la structure la plus simple en R.

Un vecteur contient **plusieurs valeurs du même type**.

Exemple :

``` r
v <- c(1,2,3,4,5)
```

`c()` signifie **combine**.

------------------------------------------------------------------------

### Accès aux éléments

``` r
v[1]
v[3]
```

R commence l'indexation à **1**.

------------------------------------------------------------------------

### Fonctions utiles

``` r
length(v)
```

Donne le nombre d'éléments.

``` r
summary(v)
```

Statistiques de base.

------------------------------------------------------------------------

### Matrix

Une **matrix** est un tableau **2 dimensions**.

Toutes les valeurs doivent être du **même type**.

Exemple :

``` r
m <- matrix(1:9, nrow=3, ncol=3)
```

Résultat :

         [,1] [,2] [,3]
    [1,]   1    4    7
    [2,]   2    5    8
    [3,]   3    6    9

------------------------------------------------------------------------

### Accès dans une matrix

``` r
m[1,1]
m[2,3]
```

Format :

    [row, column]

------------------------------------------------------------------------

### List

Une **list** peut contenir **plusieurs types différents**.

Exemple :

``` r
person <- list(
  name = "Alice",
  age = 30,
  scores = c(10,15,18)
)
```

------------------------------------------------------------------------

Accès :

``` r
person$name
person$age
```

ou

``` r
person[[1]]
```

------------------------------------------------------------------------

### Data Frame

Le **data.frame** est la structure la plus utilisée.

C'est un tableau où :

-   les colonnes peuvent avoir **des types différents**
-   les lignes représentent des **observations**

Exemple :

``` r
df <- data.frame(
  nom = c("Alice","Bob","Claire"),
  age = c(25,30,28),
  ville = c("Paris","Lyon","Nice")
)
```

------------------------------------------------------------------------

Afficher les données :

``` r
df
```

------------------------------------------------------------------------

### Tibble

Le **tibble** est une version moderne du data.frame.

Il provient du package **tidyverse**.

``` r
library(tibble)

tb <- tibble(
  nom = c("Alice","Bob"),
  age = c(25,30)
)
```

Avantages :

-   affichage plus lisible
-   meilleure gestion des types
-   pas de conversion automatique étrange

------------------------------------------------------------------------

## Architecture conceptuelle

  Composant    Rôle                 Exemple
  ------------ -------------------- --------------------
  vector       stockage simple      c(1,2,3)
  matrix       tableau numérique    matrix(1:9)
  list         objets hétérogènes   list(name="Alice")
  data.frame   table de données     dataset
  tibble       data.frame moderne   tibble()

``` mermaid
flowchart LR

Vector --> Matrix
Vector --> List
List --> DataFrame
DataFrame --> Tibble
```

------------------------------------------------------------------------

## Workflow

Processus typique d'analyse :

``` mermaid
flowchart LR

Import_Data --> DataFrame
DataFrame --> Exploration
Exploration --> Transformation
Transformation --> Analyse
Analyse --> Visualisation
```

Étapes :

1.  importer les données
2.  stocker dans un **data.frame**
3.  explorer la structure
4.  transformer les données
5.  analyser

------------------------------------------------------------------------

## Mise en pratique

### Créer un vecteur

``` r
scores <- c(10,15,20,18)
```

------------------------------------------------------------------------

### Informations sur un objet

``` r
str(scores)
```

Résultat :

    num [1:4] 10 15 20 18

------------------------------------------------------------------------

### Résumé statistique

``` r
summary(scores)
```

------------------------------------------------------------------------

### Taille d'un objet

``` r
length(scores)
```

------------------------------------------------------------------------

### Créer une matrix

``` r
m <- matrix(1:6, nrow=2)
```

------------------------------------------------------------------------

### Créer une list

``` r
info <- list(
  id = 1,
  nom = "Alice",
  notes = c(15,18,17)
)
```

------------------------------------------------------------------------

### Créer un data frame

``` r
students <- data.frame(
  nom = c("Alice","Bob","Claire"),
  note = c(15,12,18)
)
```

------------------------------------------------------------------------

## Code R expliqué

Exemple :

``` r
students <- data.frame(
  nom = c("Alice","Bob","Claire"),
  note = c(15,12,18)
)
```

Analyse :

    data.frame()

Crée un tableau.

    nom
    note

Les colonnes.

    c()

Crée les vecteurs.

Chaque colonne doit avoir **le même nombre de lignes**.

------------------------------------------------------------------------

## Cas réel

Dans un projet Data :

Un dataset peut ressembler à :

``` r
sales <- data.frame(
  produit = c("A","B","C"),
  prix = c(10,20,15),
  quantite = c(100,150,80)
)
```

On peut ensuite calculer :

``` r
sales$revenu <- sales$prix * sales$quantite
```

------------------------------------------------------------------------

## Bonnes pratiques

Toujours inspecter un dataset avec :

``` r
str(df)
summary(df)
```

Utiliser **tibble** pour les projets modernes.

Nommer clairement les colonnes.

Éviter les espaces dans les noms de colonnes.

------------------------------------------------------------------------

## Erreurs fréquentes

Confondre **vector** et **list**.

Créer des colonnes avec des tailles différentes.

Exemple incorrect :

``` r
data.frame(
  a = c(1,2,3),
  b = c(4,5)
)
```

Les colonnes doivent avoir **la même longueur**.

------------------------------------------------------------------------

## Résumé

Dans ce module nous avons vu les structures fondamentales de R :

-   **vector**
-   **matrix**
-   **list**
-   **data.frame**
-   **tibble**

Nous avons également appris à inspecter les données avec :

``` r
str()
summary()
length()
```

Ces structures seront utilisées dans tous les modules suivants.

---
[← Module précédent](R02_syntaxe_fondamentale_R.md) | [Module suivant →](R04_programmation_R.md)
---
