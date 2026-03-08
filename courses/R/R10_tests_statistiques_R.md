---
chapter: 3
course: R
difficulty: intermédiaire
duration: 90
layout: page
mermaid: true
section: 10
status: published
tags: R, statistiques, tests, t-test, chi-square, ANOVA
theme: Spécialisation Data Scientist
title: Module 10 --- Tests statistiques
type: lesson
---

# Module 10 --- Tests statistiques

## Objectifs pédagogiques

À la fin de ce module vous serez capable de :

-   comprendre le principe d'un **test statistique**
-   formuler une **hypothèse nulle (H0)** et une **hypothèse alternative
    (H1)**
-   interpréter une **p-value**
-   utiliser les principaux tests statistiques en R :
    -   t-test
    -   chi-square
    -   ANOVA

------------------------------------------------------------------------

## Contexte

Les tests statistiques permettent de répondre à une question centrale en
data science :

**la différence observée dans les données est-elle significative ou due
au hasard ?**

Ils sont utilisés dans :

-   l'analyse scientifique
-   l'A/B testing
-   l'économie
-   le marketing
-   la médecine

Le principe consiste à tester une hypothèse à partir d'un échantillon de
données.

------------------------------------------------------------------------

## Concepts fondamentaux

### Hypothèse nulle

L'hypothèse nulle (H0) représente **l'absence d'effet ou de
différence**.

Exemple :

    H0 : la moyenne des deux groupes est identique

------------------------------------------------------------------------

### Hypothèse alternative

L'hypothèse alternative (H1) représente **l'effet que l'on cherche à
démontrer**.

Exemple :

    H1 : la moyenne des deux groupes est différente

------------------------------------------------------------------------

### p-value

La p-value mesure la probabilité d'obtenir les données observées si **H0
est vraie**.

Règle classique :

  p-value     interprétation
  ----------- ---------------------------
  p \< 0.05   résultat significatif
  p ≥ 0.05    résultat non significatif

------------------------------------------------------------------------

## Architecture conceptuelle

  Composant          Rôle                     Exemple
  ------------------ ------------------------ ------------
  Hypothèse nulle    absence d'effet          H0
  Test statistique   méthode d'analyse        t-test
  p-value            niveau de preuve         p \< 0.05
  Décision           accepter ou rejeter H0   conclusion

``` mermaid
flowchart LR

Data --> Hypothesis
Hypothesis --> Test
Test --> Pvalue
Pvalue --> Decision
```

------------------------------------------------------------------------

## Workflow

Processus classique :

``` mermaid
flowchart LR

Data --> Hypothesis
Hypothesis --> Statistical_Test
Statistical_Test --> Pvalue
Pvalue --> Interpretation
```

Étapes :

1.  définir les hypothèses
2.  choisir un test statistique
3.  calculer la p-value
4.  interpréter le résultat

------------------------------------------------------------------------

## Mise en pratique

### Dataset exemple

``` r
group1 <- c(10,12,11,13,12)
group2 <- c(14,15,16,14,17)
```

------------------------------------------------------------------------

### t-test

Le **t-test** compare les moyennes de deux groupes.

``` r
t.test(group1, group2)
```

Ce test répond à la question :

> les deux groupes ont-ils des moyennes différentes ?

------------------------------------------------------------------------

### Chi-square test

Le test **chi-square** analyse la relation entre variables
catégorielles.

``` r
data <- matrix(c(10,20,15,25), nrow=2)

chisq.test(data)
```

Il est souvent utilisé pour :

-   tests d'indépendance
-   analyse de tableaux de contingence

------------------------------------------------------------------------

### ANOVA

L'ANOVA compare les moyennes de **plus de deux groupes**.

``` r
group <- factor(c("A","A","B","B","C","C"))
value <- c(10,12,14,15,20,18)

model <- aov(value ~ group)

summary(model)
```

------------------------------------------------------------------------

## Code R expliqué

Exemple :

``` r
t.test(group1, group2)
```

Analyse :

    t.test()

fonction qui compare deux moyennes.

    group1
    group2

les deux échantillons comparés.

Résultat :

-   statistique t
-   p-value
-   intervalle de confiance

------------------------------------------------------------------------

## Cas réel

Supposons un test A/B marketing.

Objectif : comparer deux versions d'une page web.

``` r
versionA <- c(2,3,4,3,5)
versionB <- c(4,5,6,5,7)

t.test(versionA, versionB)
```

Si **p \< 0.05**, on conclut que les performances sont différentes.

------------------------------------------------------------------------

## Bonnes pratiques

Toujours vérifier les **conditions d'application des tests**.

Examiner la distribution des données.

Utiliser la visualisation en complément.

Interpréter les résultats dans leur contexte.

------------------------------------------------------------------------

## Erreurs fréquentes

Confondre corrélation et causalité.

Interpréter la p-value comme une probabilité que H0 soit vraie.

Appliquer un test sans vérifier les hypothèses statistiques.

------------------------------------------------------------------------

## Résumé

Dans ce module nous avons étudié les principaux tests statistiques :

-   **t-test**
-   **chi-square**
-   **ANOVA**

Fonctions importantes :

``` r
t.test()
chisq.test()
aov()
```

Ces tests permettent de **valider statistiquement les observations dans
les données**.

---
[← Module précédent](R09_probabilites_statistiques_R.md) | [Module suivant →](R11_modelisation_statistique_R.md)
---
