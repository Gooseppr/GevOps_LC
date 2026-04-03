---
chapter: 1
course: R
difficulty: beginner
duration: 45
layout: page
mermaid: true
section: 1
status: published
tags: R, CRAN, RStudio, packages, environnement
chapter_title: Fondations du langage R
title: Module 1 --- Environnement et écosystème R
next_module: "/courses/R/R02_syntaxe_fondamentale_R.html"
next_module_title: "Module 2 --- Syntaxe fondamentale du langage R"
---

# Module 1 --- Environnement et écosystème R

## Objectifs pédagogiques

À la fin de ce module vous serez capable de :

-   Installer **R** sur votre machine.
-   Comprendre le rôle de **RStudio**.
-   Utiliser **CRAN** pour installer des packages.
-   Charger des bibliothèques dans une session R.
-   Comprendre la **structure d'un projet R**.
-   Utiliser les commandes essentielles :

``` r
install.packages()
library()
help()
```

------------------------------------------------------------------------

## Contexte

R est un langage conçu pour :

-   les **statistiques**
-   la **data science**
-   la **visualisation de données**
-   l'**analyse exploratoire**

Il est très utilisé dans :

-   la recherche scientifique
-   la finance
-   la biostatistique
-   la data science
-   l'analyse marketing

L'écosystème R repose sur plusieurs composants :

-   **R** → moteur du langage
-   **CRAN** → dépôt central de packages
-   **RStudio** → environnement de développement
-   **Packages** → extensions du langage

------------------------------------------------------------------------

## Concepts fondamentaux

### R

R est un **langage interprété**.

Cela signifie que le code est exécuté **ligne par ligne dans une
console**.

Exemple :

``` r
2 + 2
```

Résultat :

    [1] 4

------------------------------------------------------------------------

### RStudio

RStudio est un **IDE (Integrated Development Environment)**.

Il fournit :

-   un éditeur de code
-   une console
-   un explorateur de fichiers
-   un gestionnaire de packages
-   des outils de visualisation

Interface typique :

  Zone            Fonction
  --------------- ------------------------
  Script          écrire le code
  Console         exécuter le code
  Environment     variables chargées
  Files / Plots   fichiers et graphiques

------------------------------------------------------------------------

### CRAN

CRAN signifie :

**Comprehensive R Archive Network**

C'est le dépôt officiel contenant :

-   le langage R
-   des milliers de packages
-   la documentation

Site officiel :

https://cran.r-project.org

Aujourd'hui CRAN contient **plus de 18 000 packages**.

------------------------------------------------------------------------

### Packages

Les packages sont des **extensions du langage**.

Ils ajoutent :

-   des fonctions
-   des datasets
-   des algorithmes
-   des visualisations

Exemples célèbres :

  Package      Utilisation
  ------------ -------------------------
  ggplot2      visualisation
  dplyr        manipulation de données
  tidyr        transformation
  data.table   données volumineuses
  caret        machine learning

------------------------------------------------------------------------

## Architecture conceptuelle

  Composant   Rôle                              Exemple
  ----------- --------------------------------- -------------------------------
  R           moteur d'exécution                calcul statistique
  CRAN        dépôt de packages                 installation de bibliothèques
  RStudio     environnement de développement    écrire du code
  Packages    fonctionnalités supplémentaires   ggplot2

``` mermaid
flowchart LR

User --> RStudio
RStudio --> R
R --> CRAN
CRAN --> Packages
Packages --> R
R --> Resultats
```

------------------------------------------------------------------------

## Workflow

Processus classique dans un projet R :

``` mermaid
flowchart LR

Ecriture_Code --> Execution
Execution --> Installation_Package
Installation_Package --> Analyse
Analyse --> Visualisation
Visualisation --> Resultats
```

Étapes :

1.  écrire du code
2.  installer des packages
3.  charger les bibliothèques
4.  analyser les données
5.  produire des graphiques

------------------------------------------------------------------------

## Mise en pratique

### Installer un package

``` r
install.packages("ggplot2")
```

Cela télécharge le package depuis **CRAN**.

------------------------------------------------------------------------

### Charger un package

``` r
library(ggplot2)
```

Cette commande rend les fonctions du package disponibles.

------------------------------------------------------------------------

### Aide sur une fonction

``` r
help(mean)
```

ou

``` r
?mean
```

------------------------------------------------------------------------

### Exemple complet

``` r
install.packages("dplyr")
library(dplyr)

data <- c(1,2,3,4,5)

mean(data)
```

------------------------------------------------------------------------

## Code R expliqué

``` r
data <- c(1,2,3,4,5)
```

`c()` signifie **combine**.

On crée ici un **vecteur**.

------------------------------------------------------------------------

``` r
mean(data)
```

La fonction `mean()` calcule la **moyenne**.

Résultat :

    [1] 3

------------------------------------------------------------------------

## Cas réel

Dans un projet Data réel :

1.  on installe les packages nécessaires

```{=html}
<!-- -->
```
    dplyr
    ggplot2
    tidyr
    readr

2.  on crée un projet

3.  on charge les bibliothèques

``` r
library(dplyr)
library(ggplot2)
```

4.  on analyse les données.

------------------------------------------------------------------------

## Bonnes pratiques

Créer un **projet RStudio** pour chaque projet.

Utiliser un **script .R** pour chaque analyse.

Installer les packages **une seule fois**.

Utiliser `library()` uniquement dans les scripts.

Documenter le code.

------------------------------------------------------------------------

## Erreurs fréquentes

Installer un package à chaque exécution du script.

Confondre :

    install.packages()
    library()

`install.packages()` installe

`library()` charge le package.

Oublier les guillemets :

``` r
install.packages("ggplot2")
```

et non

``` r
install.packages(ggplot2)
```

------------------------------------------------------------------------

## Résumé

Dans ce module nous avons vu :

-   l'installation de **R**
-   l'utilisation de **RStudio**
-   le rôle de **CRAN**
-   les **packages**
-   les commandes essentielles :

``` r
install.packages()
library()
help()
```

Ce socle est indispensable pour commencer à travailler avec R.
