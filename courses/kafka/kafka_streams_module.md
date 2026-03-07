---
chapter: 1
course: Data Engineering
difficulty: intermediate
duration: 60 min
layout: page
mermaid: true
section: 3
status: En construction
tags: kafka, kafka-streams, streaming, data-engineering
theme: Streaming de données
theme_group: Data Streaming
theme_group_icon: ⚙️
theme_icon: 📡
theme_order: 3
title: Kafka Streams
type: lesson
---

# Kafka Streams

## Objectifs pédagogiques

À la fin de ce module vous serez capable de :

-   Comprendre ce qu'est **Kafka Streams**
-   Comprendre comment traiter les données **en temps réel**
-   Comprendre les concepts de **stream processing**
-   Comprendre les **topologies de traitement**
-   Implémenter un **pipeline de transformation simple**

------------------------------------------------------------------------

## Contexte

Dans de nombreuses architectures modernes, les données ne sont plus
traitées uniquement en **batch**.

Les entreprises veulent :

-   analyser les événements **en temps réel**
-   transformer les données **au moment où elles arrivent**
-   déclencher des actions immédiatement

C'est ce qu'on appelle le **stream processing**.

Kafka Streams est une bibliothèque Java permettant de **traiter les flux
Kafka directement dans les applications**.

------------------------------------------------------------------------

## Concepts fondamentaux

### Stream

Un **stream** est un flux continu d'événements.

Exemple :

    user-login-events
    payment-events
    sensor-data

Les données arrivent en permanence.

------------------------------------------------------------------------

### Table

Une **table** représente l'état actuel d'une donnée.

Exemple :

    user_id → dernier login
    product_id → stock actuel

La table est reconstruite à partir du stream.

------------------------------------------------------------------------

### Stream Processing

Le **stream processing** consiste à :

-   lire un flux
-   transformer les événements
-   produire un nouveau flux

Exemple :

    click-events → filtrer → click-valid-events

------------------------------------------------------------------------

## Architecture

  Composant          Rôle                        Exemple
  ------------------ --------------------------- ------------------
  Kafka Topic        Source des données          user-events
  Stream Processor   Application Kafka Streams   service Java
  State Store        Stockage local d'état       RocksDB
  Output Topic       Résultat du traitement      analytics-events

------------------------------------------------------------------------

## Diagramme

``` mermaid
flowchart LR

A[Input Topic]

A --> B[Kafka Streams Application]

B --> C[Transformations]

C --> D[Output Topic]
```

------------------------------------------------------------------------

## Workflow du système

Producer → Kafka Topic → Kafka Streams → Nouveau Topic → Consumers

Exemple :

    Application → Topic orders → Kafka Streams → Topic revenue → Dashboard

------------------------------------------------------------------------

## Transformations possibles

Kafka Streams permet de faire :

-   **filter**
-   **map**
-   **groupBy**
-   **aggregate**
-   **join**
-   **windowing**

Exemple :

    orders → groupBy product → count

------------------------------------------------------------------------

## Mise en pratique

### Exemple Java simple

``` java
StreamsBuilder builder = new StreamsBuilder();

KStream<String, String> source =
builder.stream("orders");

KStream<String, String> filtered =
source.filter((key, value) -> value.contains("PAID"));

filtered.to("paid-orders");
```

------------------------------------------------------------------------

### Lancer une application Kafka Streams

Compilation :

``` bash
mvn package
```

Exécution :

``` bash
java -jar app.jar
```

------------------------------------------------------------------------

## Cas réel

### Analyse temps réel

Exemple :

Détecter les transactions suspectes.

    transactions → Kafka → Kafka Streams → fraud-alerts

------------------------------------------------------------------------

### Analytics live

Exemple :

Compter les visiteurs d'un site.

    click-events → aggregation → visitor-count

------------------------------------------------------------------------

## Bonnes pratiques

### Utiliser des partitions suffisantes

Pour permettre le parallélisme.

------------------------------------------------------------------------

### Gérer l'état correctement

Kafka Streams utilise **RocksDB** pour stocker l'état local.

------------------------------------------------------------------------

### Surveiller les performances

Points importants :

-   latence
-   throughput
-   état local

------------------------------------------------------------------------

## Résumé

Kafka Streams permet de :

-   traiter les flux Kafka
-   transformer les événements
-   produire de nouveaux flux

Il permet de construire des systèmes :

-   **temps réel**
-   **scalables**
-   **distribués**

Kafka Streams est souvent utilisé pour :

-   analytics temps réel
-   détection d'anomalies
-   enrichissement de données
-   pipelines de transformation
