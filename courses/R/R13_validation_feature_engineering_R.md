---
chapter: 3
course: R
difficulty: intermédiaire
duration: 90
layout: page
mermaid: true
section: 13
status: published
tags: R, machine learning, validation, cross validation, feature
  engineering
theme: Spécialisation Data Scientist
title: Module 13 --- Validation et Feature Engineering
type: lesson
---

# Module 13 --- Validation et Feature Engineering

## Objectifs pédagogiques

À la fin de ce module vous serez capable de :

-   comprendre la **validation de modèles**
-   utiliser la **cross validation**
-   sélectionner les variables pertinentes
-   normaliser les données
-   évaluer un modèle avec des **métriques**

------------------------------------------------------------------------

## Contexte

Après avoir entraîné un modèle de machine learning, il est indispensable
de :

-   vérifier qu'il **généralise correctement**
-   éviter le **sur‑apprentissage (overfitting)**
-   améliorer les variables utilisées

Deux concepts clés interviennent :

-   **Validation des modèles**
-   **Feature Engineering**

Le feature engineering consiste à **transformer ou créer des variables**
pour améliorer les performances du modèle.

------------------------------------------------------------------------

## Concepts fondamentaux

### Train / Test split

On sépare les données en deux parties.

  Dataset   Rôle
  --------- ---------------------
  Train     entraîner le modèle
  Test      évaluer le modèle

Exemple :

``` r
set.seed(123)

index <- sample(1:nrow(df), 0.8*nrow(df))

train <- df[index, ]
test <- df[-index, ]
```

------------------------------------------------------------------------

### Cross Validation

La **cross validation** permet de tester le modèle sur plusieurs
partitions des données.

Principe :

-   diviser les données en **k parties**
-   entraîner sur **k‑1**
-   tester sur la partie restante

Exemple courant :

    k = 5 ou k = 10

------------------------------------------------------------------------

## Architecture conceptuelle

  Composant             Rôle                       Exemple
  --------------------- -------------------------- ---------------
  Train set             apprentissage              dataset train
  Test set              évaluation                 dataset test
  Cross validation      validation robuste         k-fold
  Feature engineering   transformation variables   scaling

``` mermaid
flowchart LR

Data --> Split
Split --> Train
Split --> Test
Train --> Model
Model --> Validation
Validation --> Metrics
```

------------------------------------------------------------------------

## Workflow

Workflow classique en machine learning :

``` mermaid
flowchart LR

Data --> Cleaning
Cleaning --> FeatureEngineering
FeatureEngineering --> TrainTestSplit
TrainTestSplit --> Model
Model --> Evaluation
```

Étapes :

1.  nettoyer les données
2.  créer ou transformer des variables
3.  séparer train / test
4.  entraîner le modèle
5.  évaluer les performances

------------------------------------------------------------------------

## Mise en pratique

### Cross Validation avec caret

``` r
library(caret)

control <- trainControl(method="cv", number=5)
```

Cela crée une validation croisée **5-fold**.

------------------------------------------------------------------------

### Entraînement d'un modèle

``` r
model <- train(
  y ~ .,
  data = df,
  method = "lm",
  trControl = control
)
```

------------------------------------------------------------------------

### Normalisation des variables

Certaines méthodes nécessitent des données **normalisées**.

``` r
scale(df)
```

Cela transforme les variables pour avoir :

    mean = 0
    sd = 1

------------------------------------------------------------------------

### Sélection de variables

On peut sélectionner les variables importantes.

Exemple simple :

``` r
model <- lm(y ~ x1 + x2, data = df)
summary(model)
```

Les **p-values** permettent d'identifier les variables pertinentes.

------------------------------------------------------------------------

## Métriques d'évaluation

Les métriques permettent d'évaluer les performances d'un modèle.

  Métrique    Utilisation
  ----------- ----------------
  Accuracy    classification
  Precision   classification
  Recall      classification
  RMSE        régression
  R²          régression

------------------------------------------------------------------------

### Exemple RMSE

``` r
rmse <- sqrt(mean((pred - obs)^2))
```

------------------------------------------------------------------------

## Code R expliqué

Exemple :

``` r
scale(df)
```

Analyse :

    scale()

fonction de normalisation.

Elle centre les données :

    mean = 0

et les réduit :

    sd = 1

------------------------------------------------------------------------

## Cas réel

Supposons un modèle de prédiction du prix immobilier.

Variables :

-   surface
-   nombre de pièces
-   localisation

Avant la modélisation :

-   normaliser les variables
-   supprimer les variables inutiles
-   valider le modèle avec **cross validation**

------------------------------------------------------------------------

## Bonnes pratiques

Toujours utiliser une **validation croisée**.

Tester plusieurs modèles.

Vérifier les métriques sur les données de test.

Créer des variables pertinentes.

------------------------------------------------------------------------

## Erreurs fréquentes

Évaluer un modèle sur les données d'entraînement.

Ne pas normaliser les variables pour certains algorithmes.

Ignorer les métriques de performance.

------------------------------------------------------------------------

## Résumé

Dans ce module nous avons vu :

-   la **cross validation**
-   la **sélection de variables**
-   la **normalisation**
-   les **métriques d'évaluation**

Ces techniques permettent de construire des **modèles robustes et
fiables**.

---
[← Module précédent](R12_machine_learning_R.md) | [Module suivant →](R14_donnees_volumineuses_R.md)
---
