---
layout: page
title: Bases de données AWS
sujet: Hosting & Cloud
type: module
jour: 28
ordre: 1
tags: bdd, infrastructure, stockage, cloud, devops,
---

# 🌐 Les bases de données sur AWS

## 1. Introduction : le rôle des bases de données dans AWS

Une **base de données** (Database) sert à **stocker**, **organiser**, et **interroger** des données de façon structurée.

AWS ne se contente pas d’héberger des bases : il **automatisent toute leur gestion** via des **services managés**.

Cela veut dire que tu n’as plus à :

- installer le moteur de base de données,
- gérer les mises à jour et correctifs (patchs),
- planifier les sauvegardes,
- configurer la haute disponibilité ou la réplication.

🎯 **Objectif d’AWS** : te laisser te concentrer sur la **donnée et les requêtes**, pas sur l’administration système.

---

## 2. Comprendre les types de bases sur AWS

### 🧩 A. Les bases **relationnelles** (SQL)

Ce sont les bases “classiques” : **PostgreSQL**, **MySQL**, **MariaDB**, **Oracle**, **SQL Server**.

Elles organisent les données en **tables**, avec :

- des **lignes** (enregistrements),
- des **colonnes** (attributs),
- et des **relations** entre les tables.

### Exemple simplifié

| Clients | Commandes |
| --- | --- |
| id_client | id_commande |
| nom | date |
| ville | montant |
| → | 🔗 id_client (clé étrangère) |

🧠 Le langage SQL (Structured Query Language) permet :

- d’insérer (`INSERT`),
- de lire (`SELECT`),
- de mettre à jour (`UPDATE`),
- et de supprimer (`DELETE`) des données.

➡️ Ces bases sont idéales quand tu veux :

- assurer la cohérence (transactions ACID),
- relier plusieurs entités,
- exécuter des requêtes complexes avec jointures.

---

### ⚙️ B. Les bases **non relationnelles** (NoSQL)

Elles n’utilisent **pas de schéma fixe** : les données peuvent varier d’un enregistrement à l’autre.

On parle ici de **modèles de données** différents : clé-valeur, document, graphe, colonne, temps.

### Exemple :

```json
{
  "id": 123,
  "nom": "Alice",
  "commandes": [
    { "produit": "PC", "prix": 900 },
    { "produit": "Souris", "prix": 25 }
  ]
}

```

Ces bases sacrifient une partie de la complexité SQL pour :

- être **plus rapides** (latence milliseconde),
- **scaler horizontalement** (ajout automatique de serveurs),
- et gérer **des volumes massifs**.

---

## 3. Les modes de gestion : gérée vs non gérée

C’est ici qu’AWS change tout.

Tu peux avoir trois façons d’exécuter une base :

| Hébergement | Qui fait quoi ? | Exemple |
| --- | --- | --- |
| **On-premises** (sur tes serveurs) | Tu gères **tout** : matériel, OS, DB, backup, patchs | Base MySQL locale |
| **Sur EC2** | AWS gère juste le matériel & OS ; tu gères la DB | MySQL installé à la main sur une VM |
| **Service managé** (RDS, DynamoDB, etc.) | AWS gère **tout sauf tes données et tes requêtes** | Amazon RDS |

💡 **C’est le modèle de responsabilité partagée** appliqué aux bases de données :

- **AWS** assure l’infrastructure, la sécurité physique, la maintenance logicielle, la disponibilité.
- **Toi** tu t’occupes de la logique applicative, du schéma, des données et des requêtes.

---

## 4. Amazon RDS (Relational Database Service)

### 🌱 Principe

Amazon RDS est un service **géré** pour exécuter facilement une base SQL sans t’occuper de l’administration.

Tu choisis simplement :

1. Le **moteur** (MySQL, PostgreSQL, Oracle…),
2. La **taille de l’instance** (CPU/RAM),
3. Le **stockage** (EBS gp3 ou io1),
4. Le **VPC** où elle vivra,
5. Les **options de sécurité** (accès, chiffrement, backup).

Et AWS s’occupe du reste.

---

### ⚙️ Fonctionnement interne

Une instance RDS est composée de deux briques :

- une **puissance de calcul** (EC2 “invisible”),
- un **volume de stockage** (EBS).

Ces volumes stockent :

- les **données**,
- les **journaux de transactions**,
- les **backups automatiques**.

Tu n’as pas accès à la machine, mais tu peux te connecter à la base via un **endpoint DNS** :

```
mypgdb.abcdefghijkl.eu-west-3.rds.amazonaws.com

```

---

### 🧠 Sauvegardes et restauration

- **Automated Backups** : RDS crée chaque jour un snapshot + journaux continus.
- **Manual Snapshots** : tu peux créer des sauvegardes manuelles à conserver sans limite.
- **Point-In-Time Recovery (PITR)** : tu peux restaurer la base à n’importe quelle seconde dans la période de rétention.

---

### 🧱 Haute disponibilité et réplication

- **Multi-AZ** : copie synchrone dans une zone de disponibilité secondaire.
    - Si la zone primaire tombe, RDS bascule automatiquement.
- **Read replicas** : copies asynchrones pour lecture uniquement (scaling lecture ou reporting).

---

### 🔐 Sécurité RDS

| Protection | Description |
| --- | --- |
| **IAM** | Gère qui peut créer/supprimer une instance RDS |
| **Security Groups** | Contrôle réseau (ports et IP autorisés) |
| **KMS** | Chiffre le stockage et les sauvegardes |
| **TLS** | Chiffre les connexions entre client et base |
| **IAM DB Auth** | Authentifie les utilisateurs DB avec des tokens IAM plutôt que mots de passe |
| **Secrets Manager** | Stocke et fait tourner automatiquement les mots de passe de base |

---

### 🏗️ RDS dans un VPC

Quand tu crées une base RDS, elle est **hébergée dans ton VPC** :

- Tu peux la rendre **publique** (accessible depuis Internet) ou **privée** (accessible uniquement depuis ton réseau interne).
- Tu relies ta base à ton application via un **Security Group** (pare-feu virtuel AWS).

📘 Exemple typique :

```
[Application EC2 ou Lambda] → [Security Group App]
                     ↓
             (port 5432 autorisé)
                     ↓
          [Instance RDS dans VPC privé]

```

---

## 5. Bases de données “sur mesure” AWS

AWS a construit des moteurs spécialisés pour chaque besoin :

| Service | Type | Spécificité |
| --- | --- | --- |
| **DynamoDB** | NoSQL | Clé-valeur/document, performance prévisible, évolutivité automatique |
| **ElastiCache** | Mémoire | Cache Redis/Memcached ultra rapide |
| **MemoryDB** | Mémoire persistante | Redis durable avec journaux |
| **DocumentDB** | Document | Compatible API MongoDB |
| **Keyspaces** | Colonne | Compatible Cassandra (CQL) |
| **Neptune** | Graphe | Modélise des relations complexes |
| **Timestream** | Time-Series | Pour données chronologiques (IoT, métriques) |
| **QLDB** | Ledger | Journal immuable et vérifiable pour traçabilité |

---

## 6. Zoom sur DynamoDB

### 🪶 Concept

C’est une base NoSQL **entièrement managée**.

Tu n’as **aucun serveur** à gérer : pas de patch, pas de configuration, pas de scaling manuel.

Elle stocke des **éléments** (items) dans des **tables**.

Chaque élément a une **clé primaire** :

- `partition key` (obligatoire)
- `sort key` (optionnelle)

### Exemple

| user_id | date | message |
| --- | --- | --- |
| 42 | 2025-11-19 | "Bonjour AWS" |

### 🚀 Atouts

- **Scalabilité automatique** : AWS ajuste la capacité selon la charge.
- **Performance constante** : latence en millisecondes.
- **PITR** : restauration à un instant précis.
- **DynamoDB Streams** : événements temps réel vers Lambda.
- **Chiffrement, IAM, et audit intégrés.**

### 🔐 Sécurité DynamoDB

- Tout est **chiffré** (KMS).
- L’accès se fait via **IAM policies**, pas via des mots de passe.
- Compatible avec **VPC endpoints** pour garder le trafic interne à AWS.

---

## 7. Gestion et automatisation (le DevOps derrière)

AWS a conçu ses DB pour être **pilotables par code** :

| Action | Méthode |
| --- | --- |
| Créer une instance RDS | Console, AWS CLI, CloudFormation, Terraform |
| Créer une table DynamoDB | CLI, SDK, CloudFormation |
| Restaurer depuis un snapshot | Console ou CLI |
| Automatiser la maintenance | EventBridge + Lambda |
| Stocker les secrets | AWS Secrets Manager |
| Surveiller la charge | Amazon CloudWatch |

📦 **Exemple (CLI RDS)** :

```bash
aws rds create-db-instance \
  --db-instance-identifier demo-db \
  --engine postgres \
  --master-username admin \
  --master-user-password Secret123 \
  --allocated-storage 20 \
  --db-instance-class db.t3.micro

```

---

## 8. Sécurité et conformité dans la durée

| Niveau | Outil AWS | Rôle |
| --- | --- | --- |
| Réseau | **VPC / SG / NACL** | Cloisonne l’accès |
| Données | **KMS / TLS** | Chiffrement au repos et en transit |
| Identité | **IAM / Secrets Manager** | Gestion des permissions et des secrets |
| Audit | **CloudTrail / CloudWatch** | Journalisation et supervision |
| Maintenance | **RDS maintenance windows** | Application automatique des patchs |
| Conformité | **AWS Artifact / Config** | Suivi des politiques et rapports de conformité |

---

## 9. Ce que tu retiens 🧭

| Concept | Résumé |
| --- | --- |
| **RDS** | Base relationnelle gérée (SQL) — tu gères la donnée, AWS gère tout le reste |
| **DynamoDB** | Base NoSQL clé-valeur ultra scalable, sans serveur |
| **Modèle managé** | Tu n’as pas à gérer l’infrastructure, juste les données |
| **Sécurité** | IAM, KMS, VPC et TLS garantissent la confidentialité |
| **Backups** | Automatisés, restauration point-in-time |
| **Spécialisation** | AWS fournit un moteur optimisé pour chaque type de donnée |

---

## 10. Pour aller plus loin 💡

- Crée une instance RDS dans ton **VPC privé** et connecte-toi via une **EC2 Bastion**.
- Teste une **table DynamoDB** en ajoutant des éléments et observe la **scalabilité automatique**.
- Surveille ta base avec **CloudWatch** et observe les métriques en temps réel.
- Découvre **Aurora Serverless** (mise à l’échelle automatique des ressources de base relationnelle).



<!-- snippet
id: aws_rds_concept
type: concept
tech: aws
level: beginner
importance: high
format: knowledge
tags: rds,sql,base-de-données,managé
title: Amazon RDS – Base de données relationnelle managée
context: déployer une base SQL sans gérer l'infrastructure
content: RDS est un service managé pour MySQL, PostgreSQL, MariaDB, Oracle ou SQL Server. AWS gère les patchs, backups et haute disponibilité. Le client gère le schéma, les requêtes et les index.
-->

<!-- snippet
id: aws_rds_create_instance
type: command
tech: aws
level: intermediate
importance: high
format: knowledge
tags: rds,cli,postgres,base-de-données
title: Créer une instance RDS PostgreSQL via AWS CLI
context: provisionner une base de données RDS en ligne de commande
command: aws rds create-db-instance --db-instance-identifier demo-db --engine postgres --master-username admin --master-user-password Secret123 --allocated-storage 20 --db-instance-class db.t3.micro
description: Crée une instance RDS PostgreSQL t3.micro avec 20 Go de stockage. Remplacer le mot de passe par un secret sécurisé (idéalement via AWS Secrets Manager). L'instance sera accessible via un endpoint DNS une fois en état "available". Par défaut elle est déployée dans le VPC par défaut.
-->

<!-- snippet
id: aws_rds_multi_az
type: concept
tech: aws
level: intermediate
importance: high
format: knowledge
tags: rds,multi-az,haute-disponibilité,failover
title: RDS Multi-AZ – Haute disponibilité automatique
context: garantir la continuité de service en cas de panne d'une AZ
content: RDS Multi-AZ crée une copie synchrone dans une AZ secondaire. En cas de panne, RDS bascule automatiquement (failover). Multi-AZ = haute disponibilité. Read Replicas = scaling en lecture.
-->

<!-- snippet
id: aws_dynamodb_concept
type: concept
tech: aws
level: beginner
importance: high
format: knowledge
tags: dynamodb,nosql,clé-valeur,serverless
title: Amazon DynamoDB – NoSQL clé-valeur entièrement managé
context: stocker des données non relationnelles avec une scalabilité automatique
content: DynamoDB est une base NoSQL entièrement managée : scalabilité automatique, latence en ms, multi-AZ, chiffrement KMS et accès via IAM. DynamoDB Streams permet de déclencher des Lambdas sur les changements.
description: DynamoDB facture en lecture/écriture (RCU/WCU), pas en stockage. Un accès mal optimisé (scan au lieu de query) peut multiplier la facture par 10.
-->

<!-- snippet
id: aws_rds_vs_ec2_db
type: concept
tech: aws
level: intermediate
importance: medium
format: knowledge
tags: rds,ec2,base-de-données,responsabilité-partagée
title: RDS managé vs base de données sur EC2
context: choisir entre RDS et une base installée manuellement sur EC2
content: Sur EC2 : contrôle total mais patchs, backups et réplication manuels. Sur RDS : AWS gère tout. Utiliser EC2 seulement pour des moteurs non supportés par RDS (Sybase, DB2, Timescale).
-->

<!-- snippet
id: aws_db_specialized_services
type: concept
tech: aws
level: intermediate
importance: medium
format: knowledge
tags: elasticache,neptune,timestream,documentdb,nosql
title: Services de bases de données spécialisés AWS
context: choisir le bon moteur AWS selon le type de données
content: AWS propose des bases spécialisées : ElastiCache (Redis/Memcached), DocumentDB (MongoDB), Neptune (graphes), Timestream (IoT/métriques), QLDB (journal immuable), Keyspaces (Cassandra), MemoryDB (Redis durable). Tous managés.
-->

---
[Module suivant →](M28_monitoring-elb-aws.md)
---
