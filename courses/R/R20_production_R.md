---
chapter: 4
course: R
difficulty: intermédiaire
duration: 90
layout: page
mermaid: true
section: 20
status: published
tags: R, production, deployment, reporting, shiny, rmarkdown
chapter_title: Spécialisation Data Engineer
title: Module 20 --- Production
prev_module: "/courses/R/R19_orchestration_R.html"
prev_module_title: "Module 19 --- Orchestration des pipelines"
---

# Module 20 --- Production

## Objectifs pédagogiques

À la fin de ce module vous serez capable de :

-   transformer un projet R en **outil de production**
-   automatiser l'exécution de scripts
-   générer des **rapports automatisés**
-   déployer des applications data simples
-   utiliser **R Markdown** et **Shiny**

------------------------------------------------------------------------

## Contexte

Dans un projet professionnel, l'objectif n'est pas seulement d'analyser
les données.

Il faut aussi :

-   automatiser les analyses
-   partager les résultats
-   déployer des outils utilisables par d'autres personnes

C'est ce que l'on appelle la **mise en production**.

Les outils R les plus utilisés pour cela sont :

-   **R Markdown** → génération de rapports automatisés
-   **Shiny** → création d'applications interactives

------------------------------------------------------------------------

## Concepts fondamentaux

### Packaging

Un projet data peut être transformé en **package R**.

Avantages :

-   réutilisation du code
-   organisation du projet
-   partage avec d'autres équipes

------------------------------------------------------------------------

### Automatisation

Les scripts peuvent être exécutés automatiquement via :

-   cron
-   scheduler
-   orchestrateurs de pipelines

Exemple :

``` bash
Rscript analysis.R
```

------------------------------------------------------------------------

### Génération de rapports

Les entreprises génèrent souvent :

-   rapports mensuels
-   dashboards
-   rapports d'analyse

R permet d'automatiser cela avec **R Markdown**.

------------------------------------------------------------------------

## Architecture conceptuelle

  Composant    Rôle                      Exemple
  ------------ ------------------------- ------------
  Script R     traitement des données    analysis.R
  R Markdown   génération de rapports    report.Rmd
  Shiny        application interactive   dashboard
  Scheduler    automatisation            cron

``` mermaid
flowchart LR

Data --> Script
Script --> Analysis
Analysis --> Report
Report --> Dashboard
Dashboard --> Users
```

------------------------------------------------------------------------

## Workflow

Workflow typique en production :

``` mermaid
flowchart LR

Data --> Pipeline
Pipeline --> Analysis
Analysis --> Report
Report --> Dashboard
Dashboard --> Users
```

Étapes :

1.  ingestion des données
2.  traitement automatisé
3.  génération de rapports
4.  mise à disposition des résultats

------------------------------------------------------------------------

## Mise en pratique

### Générer un rapport avec R Markdown

Un fichier **R Markdown** contient :

-   texte
-   code R
-   graphiques

Exemple :

``` r
---
title: "Rapport d'analyse"
output: html_document
---

```{r}
summary(data)
```


    ---

    ### Génération du rapport

    ```r
    rmarkdown::render("report.Rmd")

Cela produit un **rapport HTML ou PDF**.

------------------------------------------------------------------------

### Application Shiny

Shiny permet de créer des applications interactives.

Exemple simple :

``` r
library(shiny)

ui <- fluidPage(
  sliderInput("num", "Choisir un nombre", 1, 100, 50),
  plotOutput("hist")
)

server <- function(input, output) {
  output$hist <- renderPlot({
    hist(rnorm(input$num))
  })
}

shinyApp(ui, server)
```

------------------------------------------------------------------------

## Code R expliqué

Exemple :

``` r
rmarkdown::render("report.Rmd")
```

Analyse :

    rmarkdown::render()

fonction qui compile un fichier **R Markdown**.

    report.Rmd

document contenant texte + code.

Résultat :

un rapport **HTML/PDF**.

------------------------------------------------------------------------

## Cas réel

Un pipeline data peut produire chaque jour :

1.  récupération des données
2.  nettoyage et transformation
3.  génération d'un rapport
4.  mise à jour d'un dashboard Shiny

Cela permet aux équipes métier d'accéder aux résultats.

------------------------------------------------------------------------

## Bonnes pratiques

Automatiser les rapports.

Versionner le code avec Git.

Séparer les scripts de traitement et de visualisation.

Documenter les pipelines.

------------------------------------------------------------------------

## Erreurs fréquentes

Produire des analyses non reproductibles.

Mélanger code expérimental et code production.

Ne pas automatiser les rapports.

------------------------------------------------------------------------

## Résumé

Dans ce module nous avons étudié la **mise en production des projets
R**.

Outils importants :

    R Markdown
    Shiny

Concepts clés :

-   packaging
-   automatisation
-   génération de rapports
-   déploiement d'applications data
