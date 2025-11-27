---
layout: page
title: AWS Monitoring, Load Blancing & Scaling
sujet: Hosting & Cloud
type: module
jour: 28
ordre: 3
tags: aws, bdd, monitoring, cloud, devops
---

1. 🌩️ Bases de données dans le cloud (général + SQL vs NoSQL)
2. 🟦 Services AWS de base de données (RDS, Aurora, DynamoDB, etc.)
3. 📊 Monitoring, Auto Scaling & Load Balancing

Pour chaque thème, je vais regrouper les questions qui parlent de la même chose, expliquer **le concept**, puis montrer **en quoi il permet de comprendre la bonne réponse**.

---

# 1️⃣ Bases de données dans le cloud : concepts clés

## 1.1 On-premise vs base de données cloud

> Question :
> 
> 
> Limite principale d’une base de données on-premise ?
> 
> ✅ *« Elle peut entraîner des coûts opérationnels élevés et des difficultés de mise à l’échelle. »*
> 

Pourquoi ?

- **On-premise** = tu achètes toi-même :
    - serveurs, disques, licences, réseaux…
    - tu dimensionnes “large” pour les pics (et le reste du temps ça dort).
- Si tu as plus de charge → tu dois **racheter du matériel**, l’installer, le configurer.
    
    → mise à l’échelle lente, chère, rigide.
    

En cloud (RDS, DynamoDB, etc.) :

- tu peux augmenter la taille, le stockage, le nombre de réplicas **en quelques clics / API**,
- tu payes à l’usage,
- le fournisseur gère l’infra physique.

👉 Idée clé : le cloud **remplace la CAPEX lourde** par de l’**OPEX modulable**, mais il faut surveiller les coûts (voir plus bas).

---

## 1.2 SQL vs NoSQL : quand choisir quoi ?

> Question :
> 
> 
> Pourquoi opter pour une base NoSQL dans le cloud ?
> 
> ✅ *« Pour une grande flexibilité dans la gestion de données non structurées ou semi-structurées. »*
> 

> Question :
> 
> 
> Qu’est-ce qui distingue SQL / NoSQL ?
> 
> ✅ *« SQL = schéma strict avec relations, NoSQL = flexibilité + scalabilité horizontale. »*
> 

**SQL (relationnel)**

- Données très structurées : tables, colonnes, types, clés étrangères.
- Relations complexes (JOIN, contraintes).
- Idéal pour :
    - finance, commandes, stocks, CRM…
    - besoin fort en **intégrité** (ACID).

**NoSQL**

- Modèle flexible :
    - clé/valeur, document JSON, colonnes larges, graphes.
- Schéma souple : on peut ajouter des champs sans migration lourde.
- Scalabilité horizontale **native** sur plusieurs nœuds.

Idéal pour :

- gros volumes,
- données variées (logs, events, profils, documents),
- charges très variables / à grande échelle.

👉 DevOps / architecte : tu dois toujours te demander :

- **Données très structurées + contraintes fortes ?** → SQL (RDS, Aurora).
- **Données flexibles + gros volume + scalabilité horizontale ?** → NoSQL (DynamoDB, Firestore, etc.).

---

## 1.3 Sharding et multi-tenant

> Question :
> 
> 
> Objectif principal d’une architecture multi-tenant ?
> 
> ✅ *« Permettre l’exécution de multiples instances isolées pour chaque utilisateur. »*
> 

> Question :
> 
> 
> À quoi sert le partitionnement / sharding ?
> 
> ✅ *« À répartir la charge et améliorer performance et scalabilité. »*
> 

**Multi-tenant**

- Tu as une seule plateforme, mais **plusieurs clients / organisations**.
- Le système doit :
    - isoler les données et les accès,
    - mutualiser l’infra (coûts partagés).
- Ça peut être :
    - un schéma par client,
    - une base par client,
    - ou des colonnes d’identifiant de tenant.

**Sharding / partitionnement**

- Tu coupes ta base en **fragments** (par exemple par range d’ID, par région, par client).
- Chaque shard est sur un ou plusieurs nœuds → tu répartis :
    - **la charge de lecture/écriture**,
    - **le stockage**.

👉 Dans les services managés cloud, beaucoup de ces notions sont **prises en charge par le service** (DynamoDB, Aurora, etc.), mais conceptuellement, c’est ça qui permet de scaler.

---

## 1.4 Coûts & inconvénients du managé

> Question :
> 
> 
> Inconvénient potentiel d’un service de BDD managé ?
> 
> ✅ *« Les frais peuvent s’accumuler rapidement en fonction de l’usage et du volume de données. »*
> 

Tu gagnes :

- du temps (pas d’installation, de patch, de backup à script toi-même),
- de la fiabilité (clustering, HA, sauvegardes automatiques).

Mais tu dois :

- **surveiller la taille de l’instance**,
- **surveiller le stockage**,
- **surveiller les IOPS / RCU / WCU (DynamoDB)**,
- optimiser :
    - taille d’instance,
    - type de stockage (gp3 vs io2),
    - réservations (RDS reserved instances),
    - modèles à la demande vs provisionnés.

👉 Le managé enlève de la complexité technique, mais **ajoute un enjeu de finOps**.

---

## 1.5 Sécurité des données : chiffrement au repos

> Question :
> 
> 
> Quelle mesure protège les données stockées ?
> 
> ✅ *« Le chiffrement des données au repos (at rest). »*
> 

Chiffrement **at rest** = données chiffrées sur disque :

- EBS encrypté,
- RDS encrypté,
- DynamoDB avec KMS, etc.

Objectif :

- si on accède physiquement au disque,
- ou si un snapshot est copié,
    
    les données restent illisibles sans la clé.
    

👉 À combiner avec :

- chiffrement **in transit** (TLS/HTTPS),
- IAM pour contrôler **qui** a le droit de lire/écrire.

---

# 2️⃣ Services AWS de base de données

On va maintenant relier les questions aux **services concrets**.

## 2.1 DynamoDB : NoSQL managé clé/valeur / document

> Questions :
> 
> - *“Quelle offre AWS NoSQL ?”* → ✅ DynamoDB
> - *“Avantage majeur de DynamoDB ?”* → ✅ faible latence + scalabilité automatique
> - *“Service NoSQL rapide et fiable ?”* → ✅ DynamoDB
> - *“Quel service stocke des paires clé-valeur ?”* → ✅ DynamoDB

Caractéristiques importantes :

- Modèle **clé/valeur** (partition key + sort key) ou document (attributs JSON).
- **Scalabilité horizontale** automatique.
- Latence **en ms**, même à grande échelle.
- Multi-AZ par défaut.
- Parfait pour :
    - sessions utilisateur,
    - catalogues produits,
    - profils, logs, events,
    - métriques à haute fréquence.

Limites :

- Pas de JOIN complexes,
- Queries basées principalement sur la clé (ou indexes globaux/secondaires).

---

## 2.2 RDS : bases relationnelles managées

> Questions :
> 
> - *“Service SQL dans le cloud ?”* → ✅ Amazon RDS
> - *“RDS simplifie quoi ?”* → ✅ l’administration (patchs, backups, HA…)
> - *“Service pour remplacer un MySQL on-prem lourdingue à gérer ?”* → ✅ RDS
> - *“DB structurée on-prem migrée vers AWS ?”* → ✅ RDS
> - *“Responsabilité du client avec RDS ?”* → ✅ gérer les paramètres de la base (schémas, index, requêtes…)
> - *“Avantages de RDS par rapport à une DB tradi ?”* → ✅ AWS gère le système d’exploitation, les patchs DB, les backups auto…
> - *“Service adapté aux transactions ACID (app financière) ?”* → ✅ RDS
> - *“Service permettant des réplicas en lecture ?”* → ✅ RDS Read Replicas
> - *“Fonction de basculement auto ?”* → ✅ RDS Multi-AZ

**RDS** = PostgreSQL, MySQL, MariaDB, SQL Server, Oracle **managés**.

AWS gère :

- installation,
- patchs,
- sauvegardes,
- Multi-AZ,
- remplacement d’instance en cas de panne.

Toi tu gères :

- modèle de données,
- requêtes,
- index,
- tuning applicatif,
- gestion des utilisateurs au niveau de la DB.

**Multi-AZ** :

- une instance “primary”,
- une “standby” synchrone dans une autre AZ,
- en cas de panne → basculement automatique.

**Read Replicas** :

- copies asynchrones,
- servent uniquement aux lectures,
- permettent de décharger la primary pour les lectures intensives.

---

## 2.3 Aurora : le “super RDS” compatible MySQL/PostgreSQL

> Questions :
> 
> - *“Service rel. compatible MySQL qui scale automatiquement ?”* → ✅ Aurora
> - *“DB MySQL qui peut évoluer facilement ?”* → ✅ Aurora

Aurora = moteur relationnel cloud-native :

- compatible MySQL ou PostgreSQL,
- stockage distribué, multi-AZ,
- jusqu’à 15 read replicas,
- auto-scaling du stockage (jusqu’à plusieurs dizaines de To),
- meilleures perfs que MySQL “classique” sur RDS.

👉 Tu penses “**Aurora**” quand tu veux :

- du SQL,
- du **très performant**,
- fortement disponible,
- avec auto-scaling du stockage.

---

## 2.4 Stockage utilisé par RDS

> Question :
> 
> 
> Stockage principal pour les instances RDS ?
> 
> ✅ *« Amazon EBS »*
> 

RDS n’est “que” une **couche managée** par-dessus :

- EC2 (compute),
- EBS (disques).

Tu ne vois plus l’instance EC2 ni son disque, mais techniquement ce sont bien des volumes EBS derrière.

---

## 2.5 Coûts et optimisation RDS

> Questions :
> 
> - *“Minimiser les coûts RDS après migration ?”* → ✅ dimensionner correctement avant/après
> - *“DB RDS utilisée au moins 3 ans : option la plus rentable ?”* → ✅ Instances réservées avec paiement partiel upfront

Deux axes principaux :

1. **Taille de l’instance + stockage**
    - éviter surdimensionnement,
    - adapter la taille en fonction des métriques CloudWatch (CPU, IOPS, connexions).
2. **Modèle de facturation**
    - à la demande = flexible, plus cher,
    - reserved instances = engagement (1 ou 3 ans) → grosse réduction.

---

## 2.6 IAM & permissions sur les bases

> Questions :
> 
> - *“Nouveau user pour gérer DynamoDB longtemps : best practice ?”* → ✅ créer un utilisateur IAM avec policy DynamoDB (pas admin général)
> - *“Admin IAM incapable de créer snapshots EBS & buckets S3 ?”* → ✅ refus implicite : aucune permission tant qu’on ne les ajoute pas

Idées clés :

- IAM User / Role **n’a aucun droit par défaut** (deny implicite).
- Tu donnes :
    - **le minimum nécessaire** (principe du moindre privilège),
    - via des policies ciblées (`dynamodb:*`, `rds:*`, `ec2:CreateSnapshot`, `s3:PutObject`, etc.).
- Éviter de filer `AdministratorAccess` à tout le monde.

---

## 2.7 EC2 + DB custom

> Question :
> 
> 
> “Service permettant d’installer un moteur de DB personnalisé ?”
> 
> ✅ *« Amazon EC2 »*
> 

Quand utiliser EC2 au lieu de RDS ?

- moteur exotique non supporté (Sybase, DB2, Timescale, etc.),
- besoins très custom (extensions OS spécifiques…),
- tu acceptes de gérer **toi-même** :
    - patchs,
    - backups,
    - réplication,
    - monitoring.

---

# 3️⃣ Monitoring, Auto Scaling & Load Balancing

Ici on change de monde : on ne parle plus de “où stocker les données”, mais de **comment surveiller et adapter ton infra**.

---

## 3.1 CloudWatch vs CloudTrail vs les autres

> Questions :
> 
> - “Service pour surveiller CPU, métriques EC2, alarmes ?” → ✅ **CloudWatch**
> - “Service pour auditer les actions (qui a fait quoi) ?” → ✅ **CloudTrail**
> - “Service conseillé pour surveiller une appli en tant que SRE ?” → ✅ **CloudWatch**
> - “Alerte quand CPU > 60 % ?” → ✅ CloudWatch Alarm

**CloudWatch**

- métriques (CPU, RAM via agent, I/O, network, custom),
- logs (CloudWatch Logs),
- dashboards,
- alarms (envoi vers SNS, actions Auto Scaling, etc.).

**CloudTrail**

- journal des **appels API** :
    
    qui, quand, sur quoi, à partir d’où.
    
- outil d’audit / forensic.

👉 En gros :

- **CloudWatch = santé & performance**
- **CloudTrail = audit & sécurité**

---

## 3.2 Auto Scaling : adapter automatiquement la capacité

> Questions :
> 
> - “Var. imprévisibles de CPU/RAM → service pour adapter dynamiquement ?” → ✅ Auto Scaling
> - “Fonctionnalité qui ajuste automatiquement la capacité de calcul ?” → ✅ Auto Scaling
> - “Réduire la facture mensuelle ?” → ✅ utiliser Auto Scaling pour EC2
> - “Service pour ajouter/supprimer automatiquement des instances EC2 selon la demande ?” → ✅ EC2 Auto Scaling

**Auto Scaling Group (ASG)** :

- Tu définis :
    - min / max / desired capacity,
    - les métriques qui déclenchent scale-out / scale-in (CPU, nombre de requêtes ALB, SQS length…).
- AWS :
    - crée / détruit des instances selon les règles,
    - les remplace en cas de failure.

Avantages :

- ne pas surdimensionner en permanence,
- absorber les pics de charge,
- améliorer **disponibilité** (multi-AZ).

---

## 3.3 Load Balancing : répartir le trafic

> Questions :
> 
> - “Service pour répartir le trafic entre 3 instances EC2 ?” → ✅ Application Load Balancer (ALB)
> - “Service qui répartit le trafic sur plusieurs EC2 ?” → ✅ Elastic Load Balancing (ELB)
> - “Comment ELB améliore la fiabilité ?” → ✅ en n’envoyant du trafic qu’aux cibles saines (health checks)
> - “Service pour répartir uniformément HTTP sur plusieurs EC2 ?” → ✅ Application Load Balancer

**Elastic Load Balancing** :

- **ALB** : HTTP/HTTPS (layer 7),
    - routing par path (`/api`, `/static`),
    - routing par host (`api.monsite.com`),
    - intégration avec ECS/EKS.
- **NLB** : TCP/UDP (layer 4), très performant, IPs fixes.
- **CLB** (legacy) : ancien modèle.

Rôle du load balancer :

- distribuer la charge,
- faire des **health checks**,
- retirer les instances malades du pool,
- centraliser TLS (terminaison SSL côté LB).

---

## 3.4 Horizontal vs vertical scaling

> Question :
> 
> 
> Mise à l’échelle horizontale ?
> 
> ✅ *« Ajouter plusieurs instances EC2 de même taille pour gérer une augmentation de trafic. »*
> 

**Vertical scaling** :

- tu passes d’une `t3.medium` à une `t3.xlarge` par exemple,
- tu augmentes la “taille” d’une machine.

**Horizontal scaling** :

- tu gardes la même taille,
- tu ajoutes des copies supplémentaires derrière un load balancer.

Dans le cloud, on privilégie **l’horizontal** :

- plus résilient (si une instance tombe, les autres restent),
- plus aligné avec les architectures distribuées.

---

## 3.5 CloudWatch + Auto Scaling + ELB : combo complet

Scénario typique :

1. CloudWatch mesure :
    - CPU > 60% sur le groupe EC2,
    - latence ALB,
    - nombre de requêtes / cible.
2. CloudWatch Alarm → déclenche une **policy Auto Scaling**.
3. ASG → ajoute 1 ou N instances.
4. ELB → commence à leur envoyer du trafic si health checks OK.
5. Quand la charge redescend → scale-in (suppression d’instances).

👉 C’est ce mécanisme qu’on attend d’un DevOps en prod.

---

## 3.6 Fiabilité, disponibilité, coûts

> Questions liées :
> 
> - Avantages des ASG → répartir sur plusieurs AZ, meilleure tolérance aux pannes.
> - ELB + Auto Scaling pour adapter la capacité.
> - Bonne pratique coût → supprimer volumes EBS, ELB, Elastic IP inutiles (et non pas les config d’ASG).

Idées clés :

- **Haute disponibilité** → multi-AZ, load balancing, auto-healing.
- **Coût maîtrisé** :
    - Auto Scaling,
    - nettoyage des ressources orphelines,
    - réservations & plans d’économie,
    - monitoring des coûts (Cost Explorer, Budgets).

---

## 3.7 CloudWatch pour le troubleshooting

> Questions :
> 
> - “Clients qui n’accèdent pas parfois à l’appli → service pour voir les métriques EC2 ?” → ✅ CloudWatch
> - “SRE qui doit monitorer appli ?” → ✅ CloudWatch

Tu utilises CloudWatch pour :

- vérifier CPU, network, disque,
- corréler avec des pics de trafic,
- regarder les logs applicatifs,
- poser des alarmes sur des comportements anormaux.

---

# 🎯 Synthèse finale

Ce set de quizz mélange trois compétences que tu dois maîtriser :

1. **Choisir le bon type de base de données**
    - SQL vs NoSQL,
    - RDS vs Aurora vs DynamoDB vs EC2 custom,
    - sharding, multi-tenant, coût & sécurité.
2. **Maîtriser les services managés AWS**
    - DynamoDB pour NoSQL clé/valeur à grande échelle,
    - RDS pour relationnel ACID,
    - Aurora pour SQL haute performance,
    - EBS comme stockage block sous-jacent,
    - IAM pour la sécurité.
3. **Assurer performance et disponibilité**
    - CloudWatch pour métriques / alarms,
    - CloudTrail pour audit,
    - Auto Scaling pour adapter la capacité,
    - ELB/ALB pour répartir le trafic,
    - bonnes pratiques de coûts.

---
[← Module précédent](M28_monitoring-elb-aws.md)
---
