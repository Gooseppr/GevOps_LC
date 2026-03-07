---
chapter: 1
course: kafka
difficulty: intermediate
duration: 60 min
layout: page
mermaid: true
section: 2
status: En construction
tags: kafka, partitions, replication, offsets, distributed-systems
theme: Streaming de données
theme_group: Data Streaming
theme_group_icon: ⚙️
theme_icon: 📡
theme_order: 2
title: Kafka en profondeur
type: lesson
---

# Kafka en profondeur

## Objectifs pédagogiques

À la fin de ce module vous serez capable de :

-   Comprendre comment Kafka garantit la **scalabilité**
-   Comprendre le rôle des **partitions**
-   Comprendre la **réplication des données**
-   Comprendre la gestion des **offsets**
-   Comprendre les **consumer groups**
-   Comprendre comment Kafka assure la **tolérance aux pannes**

------------------------------------------------------------------------

## Contexte

Dans un système distribué moderne, un flux de données peut représenter :

-   des millions d'événements par seconde
-   plusieurs services consommateurs
-   une infrastructure distribuée

Les enjeux principaux sont :

-   **scalabilité horizontale**
-   **tolérance aux pannes**
-   **consistance des données**
-   **performance en écriture et lecture**

Kafka répond à ces besoins grâce à plusieurs mécanismes internes.

------------------------------------------------------------------------

## Concepts fondamentaux

### Partitionnement

Un topic Kafka est découpé en **partitions**.

Chaque partition est :

-   un **log append-only**
-   ordonné
-   distribué sur plusieurs brokers

Exemple :

Topic: user-events

Partition 0\
Partition 1\
Partition 2

Les partitions permettent :

-   le **parallélisme**
-   la **distribution de charge**
-   la **scalabilité horizontale**

------------------------------------------------------------------------

### Clé de partition

Lorsqu'un producer envoie un message, il peut spécifier une **clé**.

Exemple :

{ "user_id": 123, "event": "login" }

Kafka utilise cette clé pour déterminer la partition.

Cela garantit que :

Tous les événements du même user_id arrivent dans la même partition.

Cela permet de conserver l'**ordre des événements**.

------------------------------------------------------------------------

### Offset

Chaque message dans une partition possède un **offset**.

Exemple :

partition 0

offset 0\
offset 1\
offset 2\
offset 3

Un consumer lit les messages en avançant dans les offsets.

Cela permet :

-   reprise après crash
-   lecture différée
-   reprocessing

------------------------------------------------------------------------

### Consumer Groups

Un **consumer group** est un ensemble de consommateurs.

Chaque partition est lue par **un seul consumer du groupe**.

Exemple :

Topic: orders\
Partitions: 3

Consumers: 3

Distribution :

Consumer 1 → Partition 0\
Consumer 2 → Partition 1\
Consumer 3 → Partition 2

Cela permet un **traitement parallèle**.

------------------------------------------------------------------------

## Architecture

  Composant   Rôle                                 Exemple
  ----------- ------------------------------------ -----------------
  Broker      Serveur Kafka stockant les données   node1, node2
  Topic       Flux logique de messages             payments
  Partition   Segment d'un topic                   partition-0
  Leader      Broker principal d'une partition     broker-1
  Follower    Réplication d'une partition          broker-2
  Producer    Envoie des événements                application web
  Consumer    Lit les événements                   pipeline data

------------------------------------------------------------------------

## Diagramme d'architecture

``` mermaid
flowchart LR

P[Producer]

P --> B1[Broker 1]
P --> B2[Broker 2]
P --> B3[Broker 3]

B1 --> T1[Partition Leader]
B2 --> T2[Partition Follower]
B3 --> T3[Partition Follower]

T1 --> C[Consumer Group]
T2 --> C
T3 --> C
```

------------------------------------------------------------------------

## Réplication des données

Kafka réplique les partitions.

Exemple :

Partition 0

Leader → Broker 1\
Follower → Broker 2\
Follower → Broker 3

Si le leader tombe :

un follower devient leader.

Cela permet la **tolérance aux pannes**.

------------------------------------------------------------------------

## ISR (In-Sync Replicas)

Les **ISR** sont les replicas synchronisées.

Exemple :

Leader : Broker1

ISR :\
Broker1\
Broker2\
Broker3

Si un broker est trop en retard :

il sort de l'ISR.

------------------------------------------------------------------------

## Workflow du système

Producer → Broker → Consumer

Étapes :

1.  Producer envoie un message
2.  Kafka détermine la partition
3.  Le message est écrit dans le leader
4.  Les followers répliquent les données
5.  Le consumer lit les messages

------------------------------------------------------------------------

## Mise en pratique

### Création d'un topic

``` bash
kafka-topics.sh --create --topic orders --bootstrap-server localhost:9092 --partitions 3 --replication-factor 2
```

### Voir les topics

``` bash
kafka-topics.sh --list --bootstrap-server localhost:9092
```

### Description d'un topic

``` bash
kafka-topics.sh --describe --topic orders --bootstrap-server localhost:9092
```

------------------------------------------------------------------------

## Cas réel

Kafka est souvent utilisé comme **bus central de données**.

Architecture typique :

Applications → Kafka → Data Lake\
                     → Analytics\
                     → Machine Learning\
                     → Monitoring

------------------------------------------------------------------------

## Bonnes pratiques

### Choisir un bon nombre de partitions

Trop peu → manque de parallélisme\
Trop → surcharge réseau

### Utiliser des clés pertinentes

user_id\
order_id\
device_id

### Configurer la rétention

Kafka peut conserver les données pendant :

heures\
jours\
semaines

### Monitorer le cluster

Indicateurs importants :

-   lag consumer
-   throughput
-   latency
-   utilisation disque

------------------------------------------------------------------------

## Résumé

Kafka est conçu pour traiter des **flux massifs de données en temps
réel**.

Ses piliers sont :

-   topics
-   partitions
-   offsets
-   replication
-   consumer groups

Grâce à ces mécanismes Kafka offre :

-   scalabilité horizontale
-   tolérance aux pannes
-   haute performance
-   streaming temps réel

Kafka est aujourd'hui une **technologie centrale du data engineering
moderne**.
