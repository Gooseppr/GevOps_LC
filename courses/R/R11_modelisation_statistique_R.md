---
chapter: 3
course: R
difficulty: intermédiaire
duration: 90
layout: page
mermaid: true
section: 11
status: published
tags: R, modélisation, régression, statistiques, glm
chapter_title: Spécialisation Data Scientist
title: Module 11 --- Modélisation statistique
prev_module: "/courses/R/R10_tests_statistiques_R.html"
prev_module_title: "Module 10 --- Tests statistiques"
next_module: "/courses/R/R12_machine_learning_R.html"
next_module_title: "Module 12 --- Machine Learning"
---

# Module 11 --- Modélisation statistique

## Objectifs pédagogiques

À la fin de ce module vous serez capable de :

-   comprendre le principe de la **modélisation statistique**
-   construire un **modèle de régression linéaire**
-   utiliser la **régression logistique**
-   comprendre les **modèles linéaires généralisés (GLM)**
-   interpréter les coefficients d'un modèle

------------------------------------------------------------------------

## Contexte

La modélisation statistique permet de :

-   expliquer une variable
-   prédire une valeur
-   comprendre l'influence de plusieurs facteurs

Elle est utilisée dans :

-   la finance
-   la biostatistique
-   le marketing
-   le machine learning

Les modèles les plus utilisés en R sont :

-   **régression linéaire**
-   **régression logistique**
-   **modèles linéaires généralisés**

------------------------------------------------------------------------

## Concepts fondamentaux

### Régression linéaire

La régression linéaire modélise la relation entre :

-   une **variable dépendante**
-   une ou plusieurs **variables explicatives**

Forme générale :

    y = β0 + β1x1 + β2x2 + ε

------------------------------------------------------------------------

### Régression logistique

La régression logistique est utilisée lorsque la variable cible est
**binaire**.

Exemple :

-   achat / non achat
-   fraude / non fraude
-   malade / sain

Le modèle prédit une **probabilité**.

------------------------------------------------------------------------

### Modèles linéaires généralisés (GLM)

Les GLM étendent les modèles linéaires classiques.

Ils permettent de modéliser :

  Type de variable   Modèle
  ------------------ -----------------------
  continue           régression linéaire
  binaire            régression logistique
  comptage           modèle de Poisson

------------------------------------------------------------------------

## Architecture conceptuelle

  Composant                Rôle                   Exemple
  ------------------------ ---------------------- -----------
  Variables explicatives   facteurs prédictifs    x1, x2
  Variable cible           variable à expliquer   y
  Modèle                   relation statistique   lm()
  Prédiction               estimation future      predict()

``` mermaid
flowchart LR

Data --> Model
Model --> Estimation
Estimation --> Prediction
Prediction --> Decision
```

------------------------------------------------------------------------

## Workflow

Processus classique de modélisation :

``` mermaid
flowchart LR

Data --> Preparation
Preparation --> Model
Model --> Evaluation
Evaluation --> Prediction
```

Étapes :

1.  préparer les données
2.  choisir un modèle
3.  estimer les paramètres
4.  évaluer le modèle
5.  produire des prédictions

------------------------------------------------------------------------

## Mise en pratique

### Dataset exemple

``` r
df <- data.frame(
  x1 = c(1,2,3,4,5),
  x2 = c(2,1,3,5,4),
  y = c(3,4,6,8,9)
)
```

------------------------------------------------------------------------

### Régression linéaire

``` r
model <- lm(y ~ x1 + x2, data = df)
```

Exemple demandé :

``` r
lm(y ~ x1 + x2)
```

------------------------------------------------------------------------

### Résumé du modèle

``` r
summary(model)
```

Le résultat contient :

-   coefficients
-   p-values
-   R²

------------------------------------------------------------------------

### Prédictions

``` r
predict(model)
```

------------------------------------------------------------------------

### Régression logistique

Exemple binaire :

``` r
df$class <- c(0,0,1,1,1)

log_model <- glm(class ~ x1 + x2,
                 data = df,
                 family = binomial)
```

------------------------------------------------------------------------

## Code R expliqué

Exemple :

``` r
lm(y ~ x1 + x2)
```

Analyse :

    lm()

fonction de régression linéaire.

    y ~ x1 + x2

formule statistique.

    y

variable dépendante.

    x1 + x2

variables explicatives.

------------------------------------------------------------------------

## Cas réel

Supposons un dataset immobilier.

``` r
house <- data.frame(
  surface = c(50,70,90,120),
  rooms = c(2,3,4,5),
  price = c(150,200,250,320)
)
```

Modèle :

``` r
model <- lm(price ~ surface + rooms, data = house)
```

On peut ensuite prédire :

``` r
predict(model)
```

------------------------------------------------------------------------

## Bonnes pratiques

Toujours explorer les données avant la modélisation.

Vérifier les hypothèses du modèle.

Examiner les résidus.

Éviter les variables fortement corrélées.

------------------------------------------------------------------------

## Erreurs fréquentes

Utiliser un modèle inadapté au type de variable.

Interpréter un modèle sans vérifier sa qualité.

Confondre corrélation et causalité.

------------------------------------------------------------------------

## Résumé

Dans ce module nous avons étudié :

-   la **régression linéaire**
-   la **régression logistique**
-   les **modèles linéaires généralisés**

Fonctions importantes :

``` r
lm()
glm()
summary()
predict()
```

Ces modèles permettent **d'expliquer et prédire les données**.
