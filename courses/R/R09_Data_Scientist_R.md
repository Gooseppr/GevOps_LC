---
chapter: 3
course: R
difficulty: intermédiaire
duration: 90
layout: page
mermaid: true
section: 3
status: published
tags: R, probabilités, statistiques, distributions
theme: Spécialisation Data Scientist
title: Bloc 3 - R pour le Data Scientist
type: lesson
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
[← Module précédent](R05_Tronc_commun_Data_R.md) | [Module suivant →](R14_Data_Engineer_R.md)
---
