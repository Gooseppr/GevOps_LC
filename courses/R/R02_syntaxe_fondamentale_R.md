---
chapter: 1
course: R
difficulty: beginner
duration: 60
layout: page
mermaid: true
section: 2
status: published
tags: R, syntaxe, variables, types, conditions, boucles
chapter_title: Fondations du langage R
title: Module 2 --- Syntaxe fondamentale du langage R
prev_module: "/courses/R/R01_environnement_ecosysteme_R.html"
prev_module_title: "Module 1 --- Environnement et écosystème R"
next_module: "/courses/R/R03_structures_donnees_R.html"
next_module_title: "Module 3 --- Structures de données en R"
---

# Module 2 --- Syntaxe fondamentale du langage R

## Objectifs pédagogiques

À la fin de ce module vous serez capable de :

-   déclarer des **variables**
-   comprendre les **types de données**
-   utiliser les **opérateurs**
-   écrire des **conditions**
-   utiliser des **boucles**
-   comprendre la structure d'un programme R

------------------------------------------------------------------------

## Contexte

Comme tout langage de programmation, R possède :

-   une **syntaxe**
-   des **structures de contrôle**
-   des **types de données**
-   des **opérateurs logiques et mathématiques**

Ces éléments constituent la base pour :

-   manipuler des données
-   écrire des scripts
-   automatiser des analyses
-   construire des algorithmes

Maîtriser cette syntaxe est indispensable avant d'aborder :

-   la manipulation de données
-   la statistique
-   le machine learning

------------------------------------------------------------------------

## Concepts fondamentaux

### Variables

Une variable permet de **stocker une valeur**.

En R on utilise généralement :

    <-

Exemple :

``` r
x <- 10
```

On peut aussi écrire :

``` r
x = 10
```

Mais la convention R privilégie **`<-`**.

------------------------------------------------------------------------

### Types de données

R possède plusieurs types principaux.

  Type        Description         Exemple
  ----------- ------------------- --------------
  numeric     nombres             10, 3.14
  integer     entier              5L
  character   texte               "bonjour"
  logical     booléen             TRUE / FALSE
  complex     nombres complexes   1+2i

Exemple :

``` r
age <- 30
nom <- "Alice"
actif <- TRUE
```

------------------------------------------------------------------------

### Vérifier le type

On peut vérifier un type avec :

``` r
class(age)
```

ou

``` r
typeof(age)
```

------------------------------------------------------------------------

### Opérateurs

R possède des opérateurs mathématiques classiques.

  Opérateur   Signification
  ----------- ----------------
  \+          addition
  \-          soustraction
  \*          multiplication
  /           division
  \^          puissance
  %%          modulo

Exemple :

``` r
10 + 5
10 * 2
2 ^ 3
```

------------------------------------------------------------------------

### Opérateurs logiques

  Opérateur   Signification
  ----------- -------------------
  ==          égal
  !=          différent
  \>          supérieur
  \<          inférieur
  \>=         supérieur ou égal
  \<=         inférieur ou égal

Exemple :

``` r
x <- 10

x > 5
```

Résultat :

    TRUE

------------------------------------------------------------------------

## Architecture conceptuelle

  Composant               Rôle                            Exemple
  ----------------------- ------------------------------- ----------
  Variable                stocker une valeur              x \<- 10
  Type                    définir la nature des données   numeric
  Opérateur               effectuer un calcul             x + y
  Structure de contrôle   diriger le programme            if / for

``` mermaid
flowchart LR

Variables --> Operations
Operations --> Conditions
Conditions --> Boucles
Boucles --> Resultats
```

------------------------------------------------------------------------

## Workflow

Un script R suit généralement ce workflow :

``` mermaid
flowchart LR

Variables --> Calculs
Calculs --> Conditions
Conditions --> Boucles
Boucles --> Resultats
```

Étapes :

1.  définir les variables
2.  effectuer des calculs
3.  appliquer des conditions
4.  répéter certaines opérations avec des boucles

------------------------------------------------------------------------

## Mise en pratique

### Création de variables

``` r
x <- 10
y <- 5
```

------------------------------------------------------------------------

### Calculs

``` r
x + y
x * y
x / y
```

------------------------------------------------------------------------

### Conditions

``` r
x <- 10

if (x > 5) {
  print("ok")
}
```

Résultat :

    [1] "ok"

------------------------------------------------------------------------

### Condition avec else

``` r
x <- 3

if (x > 5) {
  print("grand")
} else {
  print("petit")
}
```

------------------------------------------------------------------------

### Boucle for

``` r
for (i in 1:5) {
  print(i)
}
```

Résultat :

    1
    2
    3
    4
    5

------------------------------------------------------------------------

### Boucle while

``` r
x <- 1

while (x < 5) {
  print(x)
  x <- x + 1
}
```

------------------------------------------------------------------------

## Code R expliqué

Exemple :

``` r
x <- 10

if (x > 5) {
  print("ok")
}
```

Analyse ligne par ligne.

    x <- 10

Création d'une variable.

    if (x > 5)

Test logique.

    print("ok")

Affiche un message.

------------------------------------------------------------------------

## Cas réel

Dans un projet Data :

On peut parcourir un ensemble de données.

Exemple :

``` r
scores <- c(12,15,18,10)

for (s in scores) {
  print(s * 2)
}
```

Cela permet :

-   d'appliquer un traitement
-   d'automatiser une analyse

------------------------------------------------------------------------

## Bonnes pratiques

Utiliser des **noms de variables explicites**.

Exemple :

``` r
age_client <- 30
revenu_annuel <- 50000
```

Éviter :

``` r
a <- 30
b <- 50000
```

Limiter l'utilisation excessive de **boucles**.

R est optimisé pour les **opérations vectorisées**.

------------------------------------------------------------------------

## Erreurs fréquentes

Oublier les **accolades** dans les conditions.

``` r
if (x > 5)
print("ok")
```

Toujours écrire :

``` r
if (x > 5) {
  print("ok")
}
```

Confondre `=` et `<-`.

Utiliser des variables non définies.

------------------------------------------------------------------------

## Résumé

Dans ce module nous avons appris :

-   les **variables**
-   les **types de données**
-   les **opérateurs**
-   les **conditions**
-   les **boucles**

Ces éléments constituent la **syntaxe fondamentale du langage R**.

Ils seront utilisés dans tous les modules suivants.
