---
layout: page
title: "Kafka en profondeur"

course: kafka
theme: "Streaming de données"
type: lesson

chapter: 1
section: 2

tags: kafka, partitions, replication, offsets, distributed-systems
difficulty: intermediate
duration: 90
mermaid: true

status: "En construction"
---

# Kafka en profondeur

Dans le module précédent, nous avons découvert :

- ce qu'est Apache Kafka
- le concept de streaming de données
- les notions de topic, partition, producer et consumer

Dans ce module, nous allons comprendre **comment Kafka fonctionne réellement en interne**.

L'objectif est de comprendre **pourquoi Kafka est capable de gérer des volumes massifs de données** tout en restant fiable.

---

# Objectifs pédagogiques

À la fin de ce module vous serez capable de :

- comprendre comment Kafka assure la **scalabilité**
- comprendre le rôle réel des **partitions**
- comprendre la **réplication**
- comprendre les **consumer groups**
- comprendre le **consumer lag**
- comprendre le **rebalance**
- comprendre comment Kafka stocke physiquement les données

---

# Kafka est un système distribué

Kafka fonctionne sous forme de **cluster**.

Exemple :

Kafka Cluster

Broker 1  
Broker 2  
Broker 3  

Chaque broker est un serveur Kafka.

Son rôle :

- stocker des partitions
- recevoir les messages des producers
- envoyer les messages aux consumers

---

# Les partitions : base de la scalabilité

Un topic n'est pas stocké dans un seul fichier.

Il est divisé en **partitions**.

Exemple :

Topic: orders

Partition 0  
Partition 1  
Partition 2  
Partition 3  

Pourquoi ?

Parce que les partitions permettent :

- le parallélisme
- la distribution sur plusieurs serveurs
- la scalabilité horizontale

---

# Mise en situation : plateforme e-commerce

Supposons un site e-commerce qui reçoit :

10 000 commandes par seconde.

Si toutes les données passent par un seul serveur :

→ saturation

Avec Kafka :

Topic orders

Partition 0  
Partition 1  
Partition 2  
Partition 3  
Partition 4  
Partition 5  

Chaque partition peut être traitée en parallèle.

---

# Comment Kafka choisit une partition

Kafka peut utiliser une **clé de partition**.

Exemples de clés :

order_id  
user_id  
customer_id  

Kafka applique la formule :

hash(key) % nombre_de_partitions

Cela garantit que :

même clé → même partition

Cela permet de conserver **l'ordre des événements**.

---

# Exemple concret

Events :

user 42 → login  
user 42 → view product  
user 42 → purchase  

Ces événements seront envoyés dans **la même partition**.

Donc l'ordre est conservé.

---

# Réplication des données

Kafka réplique les partitions pour éviter la perte de données.

Exemple :

Partition 0

Leader → Broker 1  
Follower → Broker 2  
Follower → Broker 3  

Le leader reçoit les écritures.

Les followers copient les données.

---

# Que se passe-t-il si un broker tombe

Si le leader disparaît :

Kafka élit automatiquement un nouveau leader parmi les followers.

Exemple :

Broker 2 devient leader.

Le système continue de fonctionner.

---

# ISR (In Sync Replicas)

ISR signifie :

In Sync Replicas

Ce sont les replicas qui sont synchronisées avec le leader.

Exemple :

Leader : Broker 1

ISR :
Broker 1  
Broker 2  
Broker 3  

Si un broker devient trop lent :

→ il sort de l'ISR.

---

# Consumer Groups

Un consumer group permet de répartir la lecture.

Exemple :

Topic orders  
Partitions : 3

Consumer group : order-service

Distribution :

Consumer 1 → Partition 0  
Consumer 2 → Partition 1  
Consumer 3 → Partition 2  

Chaque partition est lue par **un seul consumer du groupe**.

---

# Mise en situation : analytics temps réel

Topic :

click-events

Volume :

200 000 événements par seconde

Architecture :

click-events topic  
→ analytics service  
→ monitoring service  
→ machine learning pipeline  

Chaque service lit les mêmes données indépendamment.

---

# Consumer Lag

Le **consumer lag** mesure le retard d'un consumer.

Formule :

lag = latest offset - consumer offset

Exemple :

latest offset = 1000  
consumer offset = 900  

lag = 100

Si le lag augmente :

→ le consumer n'arrive plus à suivre.

---

# Rebalance

Quand un consumer rejoint ou quitte un groupe :

Kafka redistribue les partitions.

Exemple :

Avant :

Consumer 1 → partition 0  
Consumer 2 → partition 1  

Après l'arrivée d'un consumer :

Consumer 1 → partition 0  
Consumer 2 → partition 1  
Consumer 3 → partition 2  

Pendant ce processus :

→ la consommation peut être temporairement stoppée.

---

# Stockage interne de Kafka

Kafka stocke les messages dans des fichiers appelés **log segments**.

Structure :

partition-0/

000000.log  
000001.log  
000002.log  

Chaque fichier contient une partie des messages.

Cela permet :

- suppression facile des anciennes données
- bonnes performances disque
- gestion du stockage

---

# Log Compaction

Kafka peut fonctionner en mode **compaction**.

Exemple :

user_id → dernière valeur

Messages :

user 1 → email A  
user 1 → email B  
user 1 → email C  

Après compaction :

user 1 → email C

On garde uniquement la dernière valeur.

---

# Architecture typique

Applications  
     ↓
Kafka  
     ↓
Stream processing  
     ↓
Data Lake  
     ↓
Analytics / Machine Learning  

Kafka sert de **colonne vertébrale des données**.

---

# Problèmes courants

Mauvais nombre de partitions

Trop peu → manque de parallélisme  
Trop → surcharge

Mauvaise clé de partition

Exemple : clé = pays

Si 80 % des utilisateurs sont en France → surcharge d'une partition.

Consumer trop lent

→ accumulation du lag.

---

# Résumé

Kafka repose sur :

- partitions
- réplication
- offsets
- consumer groups

Ces mécanismes permettent :

- haute performance
- tolérance aux pannes
- traitement distribué
- streaming temps réel

Dans le prochain module nous verrons :

Kafka Streams.

---
[← Module précédent](kafka_intro_complete.md) | [Module suivant →](kafka_streams_complete.md)
---
