---
chapter: 4
course: R
difficulty: intermédiaire
duration: 90
layout: page
mermaid: true
section: 16
status: published
tags: R, API, ingestion, REST, httr, jsonlite
theme: Spécialisation Data Engineer
title: Module 16 --- API et ingestion de données
type: lesson
prev_module: "/courses/R/R15_bases_de_donnees_R.html"
prev_module_title: "Module 15 --- Bases de données"
next_module: "/courses/R/R17_parallelisation_R.html"
next_module_title: "Module 17 --- Parallélisation"
---

# Module 16 --- API et ingestion de données

## Objectifs pédagogiques

À la fin de ce module vous serez capable de :

-   comprendre le fonctionnement des **API REST**
-   récupérer des données via **HTTP**
-   parser des **réponses JSON**
-   automatiser l'ingestion de données dans R
-   construire un premier pipeline d'acquisition de données

------------------------------------------------------------------------

## Contexte

De nombreuses sources de données modernes ne sont pas stockées dans des
fichiers.

Elles sont accessibles via des **API (Application Programming
Interfaces)**.

Les APIs permettent :

-   d'accéder à des services distants
-   d'obtenir des données en temps réel
-   d'automatiser des pipelines de données

Exemples d'API :

-   API météo
-   API financières
-   API sport (NBA, football)
-   API réseaux sociaux

En R, deux packages principaux sont utilisés :

-   **httr** → requêtes HTTP
-   **jsonlite** → parsing JSON

------------------------------------------------------------------------

## Concepts fondamentaux

### API REST

Une API REST fonctionne via des requêtes HTTP.

  Méthode   Usage
  --------- -----------------------
  GET       récupérer des données
  POST      envoyer des données
  PUT       modifier
  DELETE    supprimer

La plupart des APIs renvoient les données en **JSON**.

------------------------------------------------------------------------

### JSON

JSON signifie :

    JavaScript Object Notation

C'est un format structuré très utilisé sur le web.

Exemple :

``` json
{
 "name": "Alice",
 "age": 30
}
```

------------------------------------------------------------------------

## Architecture conceptuelle

  Composant       Rôle                 Exemple
  --------------- -------------------- -----------------
  API             service distant      api.example.com
  HTTP request    appel au service     GET
  JSON response   données retournées   JSON
  Parser          transformation       jsonlite

``` mermaid
flowchart LR

Client_R --> HTTP_Request
HTTP_Request --> API_Server
API_Server --> JSON_Response
JSON_Response --> Parser
Parser --> DataFrame
```

------------------------------------------------------------------------

## Workflow

Workflow typique d'ingestion API :

``` mermaid
flowchart LR

API --> Request
Request --> Response
Response --> JSON_Parse
JSON_Parse --> DataFrame
DataFrame --> Analysis
```

Étapes :

1.  appeler l'API
2.  récupérer la réponse
3.  parser le JSON
4.  transformer en data.frame

------------------------------------------------------------------------

## Mise en pratique

### Installer les packages

``` r
install.packages("httr")
install.packages("jsonlite")
```

------------------------------------------------------------------------

### Charger les packages

``` r
library(httr)
library(jsonlite)
```

------------------------------------------------------------------------

### Requête GET

Exemple :

``` r
GET("https://api.example.com/data")
```

Cette commande envoie une requête HTTP.

------------------------------------------------------------------------

### Récupérer la réponse

``` r
response <- GET("https://api.example.com/data")
```

------------------------------------------------------------------------

### Lire le contenu JSON

``` r
data <- content(response)
```

------------------------------------------------------------------------

### Parser JSON

``` r
data <- fromJSON("data.json")
```

------------------------------------------------------------------------

### Exemple complet

``` r
response <- GET("https://api.example.com/data")

json <- content(response, "text")

data <- fromJSON(json)
```

Résultat :

un **data.frame exploitable dans R**.

------------------------------------------------------------------------

## Code R expliqué

Exemple :

``` r
GET("https://api.example.com/data")
```

Analyse :

    GET()

fonction du package **httr**.

    https://api.example.com/data

URL de l'API.

Résultat :

un **objet response HTTP**.

------------------------------------------------------------------------

## Cas réel

Supposons une API météo.

``` r
url <- "https://api.weather.com/data"

response <- GET(url)

data <- fromJSON(content(response, "text"))
```

On peut ensuite analyser :

``` r
summary(data)
```

------------------------------------------------------------------------

## Bonnes pratiques

Gérer les erreurs HTTP.

``` r
status_code(response)
```

Respecter les limites d'API.

Utiliser la pagination si nécessaire.

Sauvegarder les données localement.

------------------------------------------------------------------------

## Erreurs fréquentes

Ignorer les erreurs HTTP.

Ne pas vérifier le format JSON.

Effectuer trop d'appels API.

------------------------------------------------------------------------

## Résumé

Dans ce module nous avons appris à récupérer des données via des
**API**.

Packages utilisés :

``` r
httr
jsonlite
```

Exemple central :

``` r
GET("https://api.example.com/data")
```

Concepts clés :

-   API REST
-   requêtes HTTP
-   parsing JSON
-   ingestion automatisée
