---
chapter: 3
course: R
difficulty: intermédiaire
duration: 90
layout: page
mermaid: true
section: 9
status: published
tags: R, probabilités, statistiques, distributions
chapter_title: Spécialisation Data Scientist
title: Module 9 --- Probabilités et statistiques
prev_module: "/courses/R/R08_EDA_R.html"
prev_module_title: "Module 8 --- Analyse exploratoire de données (EDA)"
next_module: "/courses/R/R10_tests_statistiques_R.html"
next_module_title: "Module 10 --- Tests statistiques"
---

# Module 9 --- Probabilités et statistiques

## Objectifs pédagogiques

À la fin de ce module vous serez capable de :

-   comprendre les **concepts de probabilités**
-   utiliser les **distributions statistiques**
-   calculer des **probabilités conditionnelles**
-   simuler des distributions avec R

------------------------------------------------------------------------

## Contexte

Les probabilités sont la base de :

-   la **statistique**
-   le **machine learning**
-   l'**analyse de données**
-   la **modélisation prédictive**

Elles permettent de modéliser :

-   l'incertitude
-   les phénomènes aléatoires
-   les distributions de données

R possède de nombreuses fonctions pour manipuler les **lois
statistiques**.

------------------------------------------------------------------------

## Concepts fondamentaux

### Probabilité

La probabilité mesure la **chance qu'un événement se produise**.

Elle est comprise entre :

    0 et 1

Exemple :

  Probabilité   Signification
  ------------- ---------------------
  0             impossible
  0.5           événement aléatoire
  1             certain

------------------------------------------------------------------------

### Variables aléatoires

Une variable aléatoire représente un **résultat numérique d'un phénomène
aléatoire**.

Exemple :

-   lancer de dé
-   nombre de clients
-   température

------------------------------------------------------------------------

### Distributions statistiques

Une distribution décrit **comment les valeurs d'une variable sont
réparties**.

Exemples courants :

  Distribution   Usage
  -------------- -----------------------
  normale        phénomènes naturels
  binomiale      succès / échec
  poisson        événements rares
  uniforme       valeurs équiprobables

------------------------------------------------------------------------

## Architecture conceptuelle

  Composant             Rôle                   Exemple
  --------------------- ---------------------- ---------
  Distribution          modèle statistique     normale
  Simulation            génération aléatoire   rnorm()
  Densité               probabilité            dnorm()
  Probabilité cumulée   P(X ≤ x)               pnorm()

``` mermaid
flowchart LR

Random_Variable --> Distribution
Distribution --> Simulation
Simulation --> Analyse
Analyse --> Decision
```

------------------------------------------------------------------------

## Workflow

Processus d'analyse probabiliste :

``` mermaid
flowchart LR

Data --> Distribution
Distribution --> Simulation
Simulation --> Probabilities
Probabilities --> Interpretation
```

Étapes :

1.  identifier la distribution
2.  calculer les probabilités
3.  simuler des données
4.  interpréter les résultats

------------------------------------------------------------------------

## Mise en pratique

### Distribution normale

La loi normale est très fréquente.

Simulation :

``` r
rnorm(10)
```

Génère 10 valeurs aléatoires.

------------------------------------------------------------------------

### Densité

``` r
dnorm(0)
```

Probabilité de la densité en 0.

------------------------------------------------------------------------

### Probabilité cumulée

``` r
pnorm(1.96)
```

Probabilité que la variable soit inférieure à 1.96.

------------------------------------------------------------------------

### Distribution binomiale

``` r
dbinom(5, size = 10, prob = 0.5)
```

Probabilité d'obtenir 5 succès sur 10 essais.

------------------------------------------------------------------------

### Simulation binomiale

``` r
rbinom(10, size = 10, prob = 0.5)
```

------------------------------------------------------------------------

## Probabilités conditionnelles

La probabilité conditionnelle correspond à :

    P(A | B)

Probabilité que **A se produise sachant que B est réalisé**.

Exemple :

-   probabilité d'achat sachant qu'un client est inscrit
-   probabilité de maladie sachant un test positif

------------------------------------------------------------------------

## Code R expliqué

Exemple :

``` r
rnorm(5, mean = 0, sd = 1)
```

Analyse :

    rnorm()

génère des valeurs aléatoires.

    mean

moyenne.

    sd

écart type.

------------------------------------------------------------------------

## Cas réel

Supposons une distribution des tailles :

``` r
heights <- rnorm(1000, mean = 170, sd = 10)
```

On peut analyser :

``` r
mean(heights)
sd(heights)
```

Visualisation :

``` r
hist(heights)
```

------------------------------------------------------------------------

## Bonnes pratiques

Toujours vérifier la distribution des données.

Utiliser la visualisation.

Comparer les statistiques avec la théorie.

------------------------------------------------------------------------

## Erreurs fréquentes

Confondre **probabilité** et **fréquence**.

Utiliser une mauvaise distribution.

Interpréter une corrélation comme une causalité.

------------------------------------------------------------------------

## Résumé

Dans ce module nous avons vu :

-   les **probabilités**
-   les **distributions statistiques**
-   les **probabilités conditionnelles**

Fonctions importantes :

``` r
rnorm()
dnorm()
pnorm()
dbinom()
rbinom()
```

Ces notions constituent la base de la **statistique et du machine
learning**.
