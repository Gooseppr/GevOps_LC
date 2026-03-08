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
theme: Fondations du langage R
title: Bloc 1 -- R les Fondations
type: lesson
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

---
[Module suivant →](R05_Tronc_commun_Data_R.md)
---
