---
chapter: 1
course: R
difficulty: beginner-intermédiaire
duration: 75
layout: page
mermaid: true
section: 4
status: published
tags: R, fonctions, programmation, apply, functional programming
chapter_title: Fondations du langage R
title: Module 4 --- Programmation en R
prev_module: "/courses/R/R03_structures_donnees_R.html"
prev_module_title: "Module 3 --- Structures de données en R"
next_module: "/courses/R/R05_import_export_R.html"
next_module_title: "Module 5 --- Import et export de données"
---

# Module 4 --- Programmation en R

## Objectifs pédagogiques

À la fin de ce module vous serez capable de :

-   écrire des **fonctions**
-   comprendre la **portée des variables**
-   utiliser la **famille apply**
-   comprendre la **programmation fonctionnelle en R**
-   organiser du code réutilisable

------------------------------------------------------------------------

## Contexte

Dans les premiers modules nous avons appris :

-   la syntaxe
-   les structures de données

Mais pour construire des analyses complexes il faut :

-   **factoriser le code**
-   **réutiliser des traitements**
-   **automatiser les calculs**

C'est le rôle de la **programmation**.

R possède plusieurs outils puissants :

-   les **fonctions**
-   les **fonctions anonymes**
-   la **famille apply**
-   la **programmation fonctionnelle**

------------------------------------------------------------------------

## Concepts fondamentaux

### Les fonctions

Une fonction est un **bloc de code réutilisable**.

Syntaxe :

``` r
my_function <- function(x){
  x * 2
}
```

Utilisation :

``` r
my_function(5)
```

Résultat :

    10

------------------------------------------------------------------------

### Fonction avec plusieurs arguments

``` r
addition <- function(a, b){
  a + b
}
```

Utilisation :

``` r
addition(3,4)
```

Résultat :

    7

------------------------------------------------------------------------

### Valeur retournée

En R, la **dernière ligne est retournée automatiquement**.

``` r
square <- function(x){
  x^2
}
```

------------------------------------------------------------------------

### Portée des variables

La portée définit **où une variable est accessible**.

Deux types principaux :

  Type     Description
  -------- --------------------------------------
  local    variable dans une fonction
  global   variable dans l'environnement global

Exemple :

``` r
x <- 10

test <- function(){
  x <- 5
  print(x)
}

test()
```

Résultat :

    5

Mais :

``` r
print(x)
```

donnera :

    10

------------------------------------------------------------------------

## Architecture conceptuelle

  Composant                Rôle                       Exemple
  ------------------------ -------------------------- ---------------
  function                 encapsuler du code         function(x){}
  scope                    visibilité des variables   local/global
  apply                    appliquer une fonction     apply()
  functional programming   manipuler fonctions        lapply()

``` mermaid
flowchart LR

Data --> Function
Function --> Apply
Apply --> Resultats
```

------------------------------------------------------------------------

## Workflow

Workflow typique :

``` mermaid
flowchart LR

Data --> Function
Function --> Apply
Apply --> Analyse
Analyse --> Resultats
```

Étapes :

1.  créer une fonction
2.  appliquer la fonction aux données
3.  analyser les résultats

------------------------------------------------------------------------

## Mise en pratique

### Création d'une fonction

``` r
my_function <- function(x){
  x * 2
}

my_function(4)
```

------------------------------------------------------------------------

### Fonction avec condition

``` r
check_value <- function(x){
  if(x > 10){
    "grand"
  } else {
    "petit"
  }
}
```

------------------------------------------------------------------------

### Exemple avec vecteur

``` r
values <- c(1,2,3,4)

double <- function(x){
  x * 2
}

double(values)
```

------------------------------------------------------------------------

## La famille apply

La famille **apply** permet d'appliquer une fonction sur des données.

Fonctions principales :

  Fonction   Utilisation
  ---------- ----------------
  apply      matrices
  lapply     listes
  sapply     simplification
  tapply     groupes

------------------------------------------------------------------------

### Exemple apply

``` r
m <- matrix(1:9, nrow=3)

apply(m, 1, sum)
```

Ici :

    1 = lignes
    2 = colonnes

------------------------------------------------------------------------

### Exemple lapply

``` r
numbers <- list(1,2,3,4)

lapply(numbers, function(x) x*2)
```

------------------------------------------------------------------------

### Exemple sapply

``` r
sapply(numbers, function(x) x*2)
```

`sapply()` simplifie la sortie.

------------------------------------------------------------------------

## Programmation fonctionnelle

R supporte la **programmation fonctionnelle**.

Principe :

-   utiliser des fonctions comme **objets**
-   passer des fonctions comme arguments

Exemple :

``` r
square <- function(x) x^2

lapply(1:5, square)
```

------------------------------------------------------------------------

### Fonction anonyme

``` r
lapply(1:5, function(x) x^2)
```

La fonction est créée **à la volée**.

------------------------------------------------------------------------

## Code R expliqué

Exemple :

``` r
my_function <- function(x){
  x * 2
}
```

Analyse :

    my_function

Nom de la fonction.

    function(x)

Argument.

    x * 2

Traitement.

------------------------------------------------------------------------

## Cas réel

Supposons un dataset de ventes :

``` r
prices <- c(10,20,30,40)
```

On veut appliquer une taxe.

``` r
add_tax <- function(x){
  x * 1.2
}

lapply(prices, add_tax)
```

Résultat :

    12 24 36 48

------------------------------------------------------------------------

## Bonnes pratiques

Donner des **noms clairs aux fonctions**.

Exemple :

    calculate_tax()
    compute_mean()
    clean_data()

Limiter les **boucles**.

Privilégier **apply / vectorisation**.

Documenter les fonctions.

------------------------------------------------------------------------

## Erreurs fréquentes

Créer des fonctions trop longues.

Ne pas tester les fonctions.

Modifier des variables globales dans les fonctions.

Exemple dangereux :

``` r
x <- 10

test <- function(){
  x <<- 5
}
```

`<<-` modifie l'environnement global.

------------------------------------------------------------------------

## Résumé

Dans ce module nous avons appris :

-   écrire des **fonctions**
-   comprendre la **portée des variables**
-   utiliser la **famille apply**
-   appliquer la **programmation fonctionnelle**

Ces concepts permettent de créer du **code R propre et réutilisable**.
