---
chapter: 3
course: R
difficulty: intermédiaire
duration: 120
layout: page
mermaid: true
section: 12
status: published
tags: R, machine learning, caret, tidymodels, random forest, clustering
theme: Spécialisation Data Scientist
title: Module 12 --- Machine Learning
type: lesson
---

# Module 12 --- Machine Learning

## Objectifs pédagogiques

À la fin de ce module vous serez capable de :

-   comprendre les bases du **machine learning**
-   utiliser les packages **caret** et **tidymodels**
-   entraîner des modèles de :
    -   arbres de décision
    -   random forest
    -   clustering
    -   K-means
-   évaluer un modèle prédictif

------------------------------------------------------------------------

## Contexte

Le machine learning permet de **construire des modèles capables
d'apprendre à partir des données**.

Contrairement à la statistique classique, l'objectif est souvent :

-   prédire
-   classifier
-   détecter des patterns

Le machine learning est utilisé dans :

-   la finance
-   la recommandation de produits
-   la détection de fraude
-   la vision par ordinateur
-   le marketing

En R, deux écosystèmes sont très utilisés :

-   **caret**
-   **tidymodels**

------------------------------------------------------------------------

## Concepts fondamentaux

Le machine learning se divise généralement en deux catégories.

  Type            Objectif
  --------------- --------------------------
  Supervisé       prédire une variable
  Non supervisé   découvrir des structures

Exemples :

  Algorithme          Type
  ------------------- ---------------
  Arbre de décision   supervisé
  Random forest       supervisé
  K-means             non supervisé
  Clustering          non supervisé

------------------------------------------------------------------------

## Architecture conceptuelle

  Composant    Rôle                     Exemple
  ------------ ------------------------ ---------------
  Dataset      données d'entrée         df
  Features     variables explicatives   x1, x2
  Model        algorithme ML            random forest
  Prediction   sortie du modèle         predict()

``` mermaid
flowchart LR

Data --> Features
Features --> Model
Model --> Training
Training --> Prediction
Prediction --> Evaluation
```

------------------------------------------------------------------------

## Workflow

Workflow classique en machine learning :

``` mermaid
flowchart LR

Data --> Preparation
Preparation --> Train
Train --> Model
Model --> Evaluation
Evaluation --> Deployment
```

Étapes :

1.  préparer les données
2.  séparer train/test
3.  entraîner le modèle
4.  évaluer les performances
5.  utiliser le modèle pour prédire

------------------------------------------------------------------------

## Mise en pratique

### Installation des packages

``` r
install.packages("caret")
install.packages("tidymodels")
```

------------------------------------------------------------------------

### Charger les packages

``` r
library(caret)
library(tidymodels)
```

------------------------------------------------------------------------

### Dataset exemple

``` r
df <- data.frame(
  x1 = c(1,2,3,4,5),
  x2 = c(2,1,3,5,4),
  y = c(0,0,1,1,1)
)
```

------------------------------------------------------------------------

## Arbre de décision

Les arbres de décision divisent les données en règles.

``` r
library(rpart)

model <- rpart(y ~ x1 + x2, data = df)
```

------------------------------------------------------------------------

## Random Forest

Random Forest combine plusieurs arbres.

``` r
library(randomForest)

model <- randomForest(y ~ x1 + x2, data = df)
```

Avantages :

-   robuste
-   performant
-   peu sensible au bruit

------------------------------------------------------------------------

## Clustering

Le clustering regroupe les observations similaires.

Exemple :

-   segmentation clients
-   regroupement d'images

------------------------------------------------------------------------

## K-means

Algorithme classique de clustering.

``` r
kmeans(df[,1:2], centers = 2)
```

Cela crée **2 groupes** dans les données.

------------------------------------------------------------------------

## Code R expliqué

Exemple :

``` r
kmeans(df[,1:2], centers = 2)
```

Analyse :

    df[,1:2]

sélection des variables.

    centers = 2

nombre de clusters.

Résultat :

-   centres des clusters
-   assignation des observations

------------------------------------------------------------------------

## Cas réel

Supposons un dataset clients :

``` r
customers <- data.frame(
  age = c(20,25,30,45,50),
  spending = c(100,150,200,400,500)
)
```

Clustering clients :

``` r
kmeans(customers, centers = 2)
```

Cela permet de créer des **segments marketing**.

------------------------------------------------------------------------

## Bonnes pratiques

Toujours séparer les données en :

-   train
-   test

Normaliser les variables si nécessaire.

Comparer plusieurs modèles.

------------------------------------------------------------------------

## Erreurs fréquentes

Sur-apprentissage (overfitting).

Dataset trop petit.

Variables non pertinentes.

------------------------------------------------------------------------

## Résumé

Dans ce module nous avons introduit le **machine learning en R**.

Packages principaux :

``` r
caret
tidymodels
```

Algorithmes étudiés :

-   arbres de décision
-   random forest
-   clustering
-   K-means

Ces outils permettent de **prédire et découvrir des patterns dans les
données**.

---
[← Module précédent](R11_modelisation_statistique_R.md) | [Module suivant →](R13_validation_feature_engineering_R.md)
---
