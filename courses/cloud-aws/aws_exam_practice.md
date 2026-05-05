---
layout: page
title: "Entraînement SAA-C03 — Questions & explications"
course: cloud-aws
chapter_title: "Références"
chapter: 0
section: 5
tags: aws,saa-c03,exam,quiz,practice,questions
difficulty: intermediate
duration: 60
mermaid: false
status: published
prev_module: "/courses/cloud-aws/aws_guide_pratique.html"
prev_module_title: "Guide pratique — Concevoir une architecture AWS de A à Z"
next_module: "/courses/cloud-aws/aws_module_01_concepts_cloud.html"
next_module_title: "Concepts Cloud & Modèles AWS"
---

# Entraînement SAA-C03 — Questions & explications

> Questions de type examen avec réponses cachées.
> Clique sur **"Voir la réponse"** uniquement après avoir formulé ta propre réponse.
> Chaque question inclut le **piège à retenir** pour le jour de l'exam.

---

## Question 1 — Athena vs Redshift vs RDS

**Contexte** : Une entreprise change d'outil d'analytics tiers. L'export complet est un fichier CSV stocké dans un bucket S3. Le manager te demande de valider les données.

**Quel est le moyen le plus économique et le plus simple pour analyser ces données avec du SQL standard ?**

- A. Charger le CSV depuis S3 vers une instance MySQL RDS avec `mysqldump`, puis exécuter des requêtes SQL.
- B. Migrer le CSV depuis S3 vers un data warehouse OLAP (Redshift), puis exécuter des requêtes.
- C. Utiliser Amazon Athena pour analyser le fichier directement dans S3.
- D. Charger le CSV depuis S3 vers DynamoDB, puis exécuter des requêtes.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : C — Amazon Athena**

Athena est un service de requêtes SQL **serverless** qui analyse les données **directement dans S3** sans aucune infrastructure à déployer. Tu paies uniquement au volume de données scannées.

- Supporte CSV, JSON, Parquet, ORC
- Aucune base de données à provisionner
- Résultats en secondes

Les options A, B et D impliquent toutes de provisionner et gérer une base de données, ce qui est **inutile et coûteux** pour une simple validation ad hoc.

**Piège exam** : dès que la question mentionne "analyser des données dans S3 avec SQL" → penser Athena. Ne pas confondre avec Redshift (data warehouse permanent) ou RDS (base relationnelle).

📖 [Module 30 — Data Services](/courses/cloud-aws/aws_module_30_data_services.html)
</details>

---

## Question 2 — FSx for NetApp ONTAP vs FSx for Windows vs EFS

**Contexte** : Une société financière migre son application de trading depuis Windows Server on-prem vers AWS. La solution doit être hautement disponible sur plusieurs AZ et offrir un accès **block storage** à faible latence.

**Quelle solution répond à ces exigences ?**

- A. EC2 Windows multi-AZ + Amazon EFS avec réplication cross-region.
- B. EC2 Windows multi-AZ + Amazon S3 avec réplication cross-region.
- C. EC2 Windows multi-AZ + Amazon FSx for Windows File Server.
- D. EC2 Windows multi-AZ + Amazon FSx for NetApp ONTAP (Multi-AZ, protocole iSCSI).

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : D — FSx for NetApp ONTAP**

FSx for NetApp ONTAP supporte le **block storage via iSCSI**, le Multi-AZ natif, et des latences sub-milliseconde avec SSD. C'est le seul service de la liste qui combine file storage ET block storage.

Pourquoi les autres sont faux :
- **C (FSx for Windows)** : ne fournit que du **file storage** (SMB), pas du block storage
- **A (EFS)** : Linux uniquement, pas optimisé pour Windows, pas de block storage
- **B (S3)** : object storage, latence trop élevée pour du trading

**Piège exam** : "block storage" + "Windows" + "Multi-AZ" → FSx for NetApp ONTAP. Ne pas confondre avec FSx for Windows (file storage uniquement, pas de block).

📖 [Module 04 — Stockage](/courses/cloud-aws/aws_module_04_storage.html) · [Module 32 — Migration](/courses/cloud-aws/aws_module_32_migration.html)
</details>

---

## Question 3 — EFS vs EBS vs S3

**Contexte** : Un système de stockage doit être accessible simultanément par 1 000 serveurs Linux dans plusieurs AZ. Les serveurs utilisent NFSv4, les données changent rapidement, et le service doit être hautement disponible avec peu de gestion.

**Quel service est le plus adapté et le plus économique ?**

- A. Amazon EFS
- B. Amazon FSx for Windows File Server
- C. Amazon S3
- D. Amazon EBS

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : A — Amazon EFS**

Amazon EFS fournit un système de fichiers NFS managé, multi-AZ, avec accès concurrent pour des milliers d'instances EC2. Il supporte le verrouillage de fichiers et la forte cohérence — idéal pour des données qui changent rapidement.

Pourquoi les autres sont faux :
- **D (EBS)** : attaché à **une seule instance** dans **une seule AZ** — impossible de partager
- **C (S3)** : object storage, pas adapté aux données qui changent rapidement (pas de file locking, pas POSIX)
- **B (FSx for Windows)** : Windows uniquement (SMB), pas compatible Linux/NFS

**Piège exam** : "Linux" + "NFS" + "milliers d'instances" + "données changeantes" → EFS. Si c'était Windows/SMB → FSx for Windows.

📖 [Module 04 — Stockage](/courses/cloud-aws/aws_module_04_storage.html)
</details>

---

## Question 4 — Sticky Sessions ALB

**Contexte** : Une application stateless tourne sur 7 instances EC2 derrière un ALB dans plusieurs AZ. Le trafic est systématiquement routé vers une seule instance, causant des bottlenecks.

**Quelle est la solution la plus efficace ?**

- A. Modifier l'intervalle des health checks dans le target group.
- B. Utiliser un Gateway Load Balancer (GWLB) à la place de l'ALB.
- C. Désactiver les sticky sessions sur l'ALB.
- D. Terminer l'instance favorisée et redéployer les 6 autres uniformément.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : C — Désactiver les sticky sessions**

Les sticky sessions (session affinity) forcent le trafic d'un même client vers la même instance. Si activées sur une application **stateless**, elles créent une distribution inégale du trafic. Désactiver cette option permet à l'ALB de répartir le trafic équitablement.

Pourquoi les autres sont faux :
- **A (health checks)** : détecte les instances malades, n'impacte pas la distribution du trafic
- **B (GWLB)** : conçu pour des appliances réseau (firewall, IDS), pas pour du load balancing applicatif
- **D (terminer l'instance)** : ne résout pas la cause racine — le trafic favorisera une autre instance

**Piège exam** : "trafic toujours vers la même instance" + "application stateless" → sticky sessions activées par erreur. Mot-clé à chercher dans les questions : "session affinity".

📖 [Module 09 — Load Balancing & Auto Scaling](/courses/cloud-aws/aws_module_09_load_balancing.html)
</details>

---

## Question 5 — Custom Metrics CloudWatch

**Contexte** : Une architecture multi-AZ avec EC2 + ASG doit monitorer une métrique spécifique qui n'est **pas disponible par défaut** dans CloudWatch.

**Laquelle de ces métriques nécessite une configuration manuelle (custom metric) ?**

- A. Memory Utilization
- B. Network packets out
- C. CPU Utilization
- D. Disk Read activity

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : A — Memory Utilization**

CloudWatch fournit par défaut des métriques sur le CPU, le réseau et les I/O disque. Mais la **mémoire RAM** et l'**espace disque** ne sont **pas** collectés par défaut — il faut installer le CloudWatch Agent ou utiliser des scripts custom.

**Métriques custom (nécessitent un agent) :**
- Memory utilization
- Disk space utilization
- Disk swap utilization
- Page file utilization

**Piège exam** : RAM et espace disque = **toujours** custom metric. CPU, réseau, disk I/O = métriques par défaut. C'est une question classique de l'examen.

📖 [Module 07 — CloudWatch](/courses/cloud-aws/aws_module_07_cloudwatch.html) · [Module 15 — Observabilité](/courses/cloud-aws/aws_module_15_observability.html)
</details>

---

## Question 6 — Athena + Parquet + Lake Formation

**Contexte** : Des centaines de documents JSON sont chargés chaque heure dans un bucket S3 enregistré dans AWS Lake Formation. L'équipe Data Analytics utilise Athena mais les requêtes sont lentes.

**Quel changement améliore les performances tout en assurant la sécurité des données ?**

- A. Compresser en GZIP + policy IAM avec `aws:SourceArn`.
- B. Convertir en Apache Parquet + permission IAM `lakeformation:GetDataAccess`.
- C. Convertir en CSV + contrôle d'accès nommé dans Lake Formation.
- D. Minifier le JSON + tag-based access control (LF-TBAC).

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : B — Apache Parquet + lakeformation:GetDataAccess**

Apache Parquet est un format **colonnaire** qui est 2× plus rapide à lire et prend 6× moins d'espace que les formats texte. Athena facture au volume scanné — Parquet réduit drastiquement ce volume grâce au predicate pushdown (lecture sélective de colonnes/blocs).

Pour que Lake Formation contrôle l'accès aux données sous-jacentes, les utilisateurs doivent avoir la permission IAM `lakeformation:GetDataAccess`.

Pourquoi les autres sont faux :
- **A (GZIP)** : la compression seule réduit le stockage mais n'améliore pas significativement les performances de requêtes
- **C (CSV)** : format row-based, plus lent que Parquet pour Athena
- **D (minification)** : gain marginal, LF-TBAC utilise des LF-Tags (pas des IAM Tags)

**Piège exam** : "Athena lent" → convertir en Parquet/ORC (format colonnaire). "Lake Formation accès" → `lakeformation:GetDataAccess`.

📖 [Module 30 — Data Services](/courses/cloud-aws/aws_module_30_data_services.html)
</details>

---

## Question 7 — DynamoDB Streams + Lambda + SNS

**Contexte** : Un modèle de détection de fraude est déployé dans Lambda. Il doit traiter les transactions de la table DynamoDB de production. L'équipe sécurité doit être notifiée immédiatement quand une transaction est frauduleuse.

**Comment satisfaire ces exigences en minimisant l'impact sur les performances de la base ?**

- A. Créer une Global Table pour Lambda + notifications via SQS.
- B. Créer un Local Secondary Index + Lambda schedulé + SNS.
- C. Utiliser DynamoDB Transactions + Lambda comme target + SNS.
- D. Activer DynamoDB Streams + Lambda comme trigger + SNS.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : D — DynamoDB Streams + Lambda trigger + SNS**

DynamoDB Streams capture une séquence chronologique des modifications d'items (inserts, updates, deletes) et les conserve 24h. En configurant Lambda comme trigger, chaque nouvelle transaction est automatiquement analysée par le modèle de fraude. Si frauduleuse → publication SNS → notification de l'équipe.

Pourquoi les autres sont faux :
- **A (Global Table + SQS)** : SQS est une queue, pas un service de notification — les membres ne reçoivent pas d'alerte
- **B (LSI)** : on ne peut **pas** créer un LSI sur une table existante (uniquement à la création)
- **C (DynamoDB Transactions)** : c'est un mécanisme ACID pour grouper des opérations, pas un déclencheur d'événements

**Piège exam** : "réagir aux changements DynamoDB en temps réel" → DynamoDB Streams. "Notifier une équipe" → SNS (pas SQS). SQS = queue pour découplage, SNS = notification fan-out.

📖 [Module 10 — Databases](/courses/cloud-aws/aws_module_10_databases.html) · [Module 22 — Architectures distribuées](/courses/cloud-aws/aws_module_22_distributed.html)
</details>

---

## Question 8 — Site-to-Site VPN — Customer Gateway

**Contexte** : Une entreprise doit connecter sa base SAP HANA on-prem à son VPC AWS via un VPN site-to-site.

**Que faut-il configurer en dehors du VPC pour établir la connexion ?**

- A. Une adresse IP publique statique routable sur Internet pour l'interface externe du Customer Gateway.
- B. Une EIP attachée au Virtual Private Gateway.
- C. Une instance NAT dédiée dans un subnet public.
- D. La route table principale du VPC pour router le trafic via une instance NAT.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : A — IP publique statique du Customer Gateway**

Pour créer un VPN site-to-site, il faut :
1. Un **Virtual Private Gateway** (côté AWS, dans le VPC)
2. Un **Customer Gateway** (côté on-prem) avec une **IP publique statique routable**
3. La connexion VPN entre les deux (2 tunnels IPsec redondants)

Le Customer Gateway est un appareil physique ou logiciel côté client. AWS a besoin de son IP publique pour établir le tunnel.

Pourquoi les autres sont faux :
- **B** : on n'attache **pas** d'EIP à un VPG
- **C et D** : un NAT n'est pas nécessaire pour un VPN site-to-site

**Piège exam** : "VPN site-to-site" → toujours besoin d'une IP publique statique côté client (Customer Gateway). Le Virtual Private Gateway est côté AWS.

📖 [Module 27 — VPC avancé](/courses/cloud-aws/aws_module_27_vpc_advanced.html)
</details>

---

## Question 9 — AWS Control Tower

**Contexte** : Une entreprise veut automatiser la création de multiples comptes AWS dans une Organization. Chaque OU doit pouvoir lancer des comptes avec des configurations pré-approuvées (baselines réseau et sécurité).

**Quelle solution demande le moins d'effort ?**

- A. AWS Systems Manager OpsCenter + AWS Security Hub.
- B. AWS Control Tower Landing Zone + guardrails pré-packagés.
- C. AWS RAM pour lancer les comptes et standardiser les configurations.
- D. AWS Config aggregator + conformance packs.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : B — AWS Control Tower**

AWS Control Tower automatise la mise en place d'un environnement multi-comptes avec :
- **Account Factory** pour créer des comptes standardisés
- **Guardrails** (préventifs via SCP, détectifs via Config Rules)
- **Landing Zone** avec les bonnes pratiques intégrées

Pourquoi les autres sont faux :
- **A (Systems Manager)** : gestion opérationnelle d'un compte, pas création/gouvernance multi-comptes
- **C (RAM)** : partage de ressources entre comptes, ne crée pas de comptes
- **D (Config)** : audit de conformité, ne provisionne pas de comptes

**Piège exam** : "créer des comptes automatiquement" + "guardrails" + "multi-comptes" → Control Tower. Ne pas confondre avec Organizations (structure) vs Control Tower (automatisation + gouvernance).

📖 [Module 24 — Governance](/courses/cloud-aws/aws_module_24_governance.html) · [Module 28 — IAM avancé](/courses/cloud-aws/aws_module_28_iam_advanced.html)
</details>

---

## Question 10 — S3 Storage Lens

**Contexte** : Une entreprise gère des milliers d'objets dans des buckets S3 répartis sur plusieurs régions. Elle doit identifier tous les buckets qui n'ont **pas** le versioning activé.

**Quelle approche satisfait ce besoin ?**

- A. Amazon S3 Storage Lens.
- B. AWS CloudTrail.
- C. Amazon S3 Multi-Region Access Point.
- D. IAM Access Analyzer.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : A — S3 Storage Lens**

S3 Storage Lens offre une vue analytique complète sur l'usage et la configuration du stockage S3 à l'échelle d'une organization. Il fournit des métriques sur le versioning, le chiffrement, la réplication, etc. — avec un dashboard interactif et des recommandations.

Pourquoi les autres sont faux :
- **B (CloudTrail)** : trace les appels API, ne monitore pas la configuration des buckets en continu
- **C (Multi-Region Access Point)** : optimise l'accès multi-régions, pas d'analyse de configuration
- **D (IAM Access Analyzer)** : identifie les ressources partagées avec l'extérieur, pas le statut du versioning

**Piège exam** : "état de configuration des buckets S3 à grande échelle" → S3 Storage Lens. "Qui a accédé à quoi" → CloudTrail. "Ressources exposées publiquement" → IAM Access Analyzer.

📖 [Module 26 — S3 avancé](/courses/cloud-aws/aws_module_26_s3_advanced.html)
</details>

---

## Question 11 — SSE-S3 vs SSE-KMS + Bucket Policy

**Contexte** : Un bucket S3 contient des fichiers confidentiels. L'audit révèle que certains fichiers ont été uploadés sans chiffrement AES-256. La clé doit être rotée automatiquement chaque année, avec un minimum de gestion.

**Quelle solution offre le moins d'overhead opérationnel ?**

- A. Bucket policy avec header `aws:kms` + S3 Object Lock en compliance mode.
- B. SCP + SSE-S3 avec rotation manuelle des clés.
- C. Customer-managed KMS key + rotation manuelle chaque année.
- D. Bucket policy avec header `AES256` + SSE-S3 avec rotation automatique intégrée.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : D — Bucket policy + SSE-S3**

SSE-S3 utilise des clés AES-256 **gérées entièrement par AWS** avec rotation automatique intégrée. Une bucket policy qui exige le header `s3:x-amz-server-side-encryption: AES256` empêche tout upload non chiffré.

Pourquoi les autres sont faux :
- **A** : `aws:kms` = SSE-KMS (pas AES-256 au sens SSE-S3), et S3 Object Lock empêche la suppression, pas le chiffrement
- **B** : on ne peut **pas** modifier la rotation intégrée de SSE-S3 (elle est automatique et non configurable), et un SCP n'est pas une bucket policy
- **C** : rotation **manuelle** = overhead opérationnel supplémentaire, et il manque la bucket policy pour bloquer les uploads non chiffrés

**Piège exam** : `AES256` dans le header = SSE-S3. `aws:kms` dans le header = SSE-KMS. SSE-S3 a une rotation automatique built-in sans rien à gérer. "Least operational overhead" + encryption → SSE-S3.

📖 [Module 08 — Sécurité](/courses/cloud-aws/aws_module_08_security.html) · [Module 12 — Sécurité avancée](/courses/cloud-aws/aws_module_12_security_advanced.html)
</details>

---

## Question 12 — CloudFront + Outposts

**Contexte** : Des serveurs AWS Outposts dans le monde entier téléchargent des mises à jour logicielles (multiples fichiers) depuis un bucket S3 en us-west-2. Les délais de distribution sont importants.

**Quelle solution réduit la latence avec un minimum de gestion ?**

- A. Distribution CloudFront avec le bucket S3 comme origin + signed URLs.
- B. AWS Global Accelerator vers l'edge location la plus proche + private VIF vers S3.
- C. Distribution CloudFront avec origin primaire + secondaire + CachingDisabled policy + signed URLs.
- D. S3 Transfer Acceleration.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : A — CloudFront + S3 origin + signed URLs**

CloudFront cache le contenu sur 400+ edge locations dans le monde. Les fichiers de mise à jour (téléchargés par tous les serveurs) bénéficient pleinement du cache. Les signed URLs sécurisent l'accès.

Pourquoi les autres sont faux :
- **C** : `CachingDisabled` annule tout l'intérêt de CloudFront — pas de cache = pas de gain de latence
- **B** : Global Accelerator optimise le routing réseau, mais ne cache pas les fichiers et n'intègre pas directement avec S3
- **D** : Transfer Acceleration accélère les **uploads** vers S3, pas les downloads, et ne fournit pas de cache

**Piège exam** : "distribuer des fichiers à travers le monde" + "réduire la latence" → CloudFront. "CachingDisabled" dans une réponse CloudFront est un red flag. Transfer Acceleration = uploads, CloudFront = downloads.

📖 [Module 11 — DNS & CDN](/courses/cloud-aws/aws_module_11_dns_cdn.html) · [Module 19 — Performance](/courses/cloud-aws/aws_module_19_performance.html)
</details>

---

## Question 13 — Auto Scaling multi-AZ

**Contexte** : 8 instances T3 EC2 derrière un ALB avec un trafic constant. L'application doit tourner en permanence.

**Comment configurer l'Auto Scaling Group ?**

- A. 4 instances dans une AZ + 4 dans une autre AZ, même région, derrière un ELB.
- B. 8 instances dans une seule AZ derrière un ELB.
- C. 2 instances dans 4 régions derrière un ELB.
- D. 4 instances dans une région + 4 dans une autre région derrière un ELB.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : A — 4 + 4 dans deux AZ de la même région**

Un ASG répartit les instances sur plusieurs AZ pour la haute disponibilité. Si une AZ tombe :
1. Les 4 instances restantes absorbent le trafic (les T3 ont le burst capability)
2. L'ASG lance automatiquement de nouvelles instances dans l'AZ survivante

Pourquoi les autres sont faux :
- **B** : une seule AZ = single point of failure
- **C et D** : un ELB ne peut **pas** répartir le trafic entre des régions différentes (il opère dans une seule région). Pour du multi-région → Route 53

**Piège exam** : un ELB/ASG = **une seule région, multi-AZ**. Pour du multi-région, il faut Route 53. Toujours répartir les instances sur au moins 2 AZ.

📖 [Module 09 — Load Balancing & Auto Scaling](/courses/cloud-aws/aws_module_09_load_balancing.html) · [Module 17 — Haute disponibilité](/courses/cloud-aws/aws_module_17_ha.html)
</details>

---

## Résumé des pièges clés

| Mot-clé dans la question | Piège fréquent | Bonne réponse |
|--------------------------|----------------|---------------|
| "Analyser des données dans S3 avec SQL" | Provisionner une BDD (RDS, Redshift) | **Athena** (serverless, direct sur S3) |
| "Block storage" + "Windows" + "Multi-AZ" | FSx for Windows (file seulement) | **FSx for NetApp ONTAP** (file + block via iSCSI) |
| "1 000 instances Linux" + "NFS" + "données changeantes" | S3 (pas POSIX, pas de file locking) | **EFS** (NFS managé, multi-AZ) |
| "Trafic toujours vers la même instance" | Changer les health checks | **Désactiver les sticky sessions** |
| "Métrique non disponible dans CloudWatch" | CPU ou Network (déjà par défaut) | **Memory** ou **Disk space** (custom) |
| "Athena lent sur JSON" | Compresser en GZIP | **Convertir en Parquet** (colonnaire) |
| "Réagir aux changements DynamoDB" | DynamoDB Transactions | **DynamoDB Streams** + Lambda trigger |
| "VPN site-to-site" côté on-prem | NAT instance ou EIP sur VPG | **IP publique statique du Customer Gateway** |
| "Créer des comptes AWS automatiquement" | AWS RAM ou Config | **AWS Control Tower** |
| "État configuration S3 à grande échelle" | CloudTrail ou IAM Access Analyzer | **S3 Storage Lens** |
| "Chiffrement AES-256" + "least overhead" | SSE-KMS + rotation manuelle | **SSE-S3** (rotation auto intégrée) |
| "Distribuer des fichiers globalement" | Transfer Acceleration (uploads) | **CloudFront** (cache + downloads) |
| "ELB + multi-région" | Mettre un ELB entre 2 régions | **ELB = 1 région**, multi-région = Route 53 |
| "NACL" + "règles numérotées" | Penser que toutes les règles s'appliquent | **First-match** : la règle au plus petit numéro gagne |
| "Distribuer le trafic uniformément entre AZ" | Path-based routing ou health checks | **Cross-zone load balancing** |
| "Nouvelles images S3 + CloudFront" + "garder les anciennes" | Invalidation (coûteux) | **Versioned objects** (moins cher, plus fiable) |
| "FSx Windows" + "RTO 10 min" + "backup cross-region" + "rétention 5 ans" | Single-AZ ou governance mode | **Multi-AZ + Vault Lock compliance mode** |
| "Accès fluctuant" + "coût optimisé" + "haute dispo" | S3 Standard-IA ou Glacier | **S3 Intelligent-Tiering** (auto-optimisé) |
| "Docker" + "auto load balancing/scaling/monitoring" | ECS (config manuelle) | **Elastic Beanstalk** (tout automatique) |
| "Lake Formation" + "column-level access" + "QuickSight" | Glue Studio + IAM policy | **LF blueprint + data filter + Athena** |
| "S3 objets publics" | CORS ou IAM role | **Bucket policy public-read** ou **permissions à l'upload** |
| "6 instances minimum" + "fault tolerance 1 AZ down" | 2+2+2 (reste 4 si 1 AZ down) | **3+3+3** ou **6+6+0** (reste >= 6) |
| "EC2 accès autres services AWS" | Access keys sur l'instance | **IAM Role** + **MFA** |
| "Streaming temps réel" + "proche des users" + "clickstream" | Route 53 (pas de compute) | **Lambda@Edge + Kinesis** |
| "Messages ordonnés" + "pas de duplicates" + "pas de perte" | SQS Standard (best-effort order) | **Kinesis Data Streams** (ordre garanti par shard) |

---

## Question 14 — NACL : ordre d'évaluation des règles

**Contexte** : Un subnet privé a les règles NACL inbound suivantes. La règle #100 autorise tout le trafic. La règle #101 refuse le trafic TCP port 4000 depuis l'IP 110.238.109.37. Un ordinateur avec cette IP envoie une requête.

**Que se passe-t-il ?**

- A. La requête est autorisée.
- B. La requête est refusée.
- C. D'abord refusée puis autorisée après un moment.
- D. D'abord autorisée puis refusée après un moment.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : A — La requête est autorisée**

Les NACL évaluent les règles **dans l'ordre croissant des numéros**. La première règle qui match est appliquée, les suivantes sont ignorées (first-match policy).

Ici, la règle **#100 (Allow All)** est évaluée **avant** la règle #101 (Deny). La requête match la règle #100 → autorisée. La règle #101 n'est jamais évaluée.

**Points clés NACL :**
- **Stateless** : chaque paquet est évalué indépendamment (pas de suivi de connexion)
- **First-match** : la première règle qui correspond s'applique
- Les règles Deny spécifiques doivent avoir un **numéro inférieur** aux règles Allow générales

**Piège exam** : si une règle Allow générale a un numéro plus bas qu'une règle Deny spécifique, le Deny ne s'appliquera jamais. Toujours placer les Deny AVANT les Allow dans la numérotation.

📖 [Module 05 — VPC](/courses/cloud-aws/aws_module_05_vpc.html)
</details>

---

## Question 15 — Cross-zone load balancing

**Contexte** : Une application hautement disponible avec un ASG multi-AZ et des NAT Gateways. Un load balancer doit distribuer les requêtes **uniformément** sur toutes les instances de toutes les AZ.

**Quelle fonctionnalité utiliser ?**

- A. Amazon VPC IP Address Manager (IPAM)
- B. Path-based Routing
- C. AWS Direct Connect SiteLink
- D. Cross-zone load balancing

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : D — Cross-zone load balancing**

Sans cross-zone load balancing, chaque noeud du LB distribue le trafic uniquement aux instances de **sa propre AZ**. Si AZ-A a 2 instances et AZ-B en a 8, chaque instance d'AZ-A reçoit 25 % du trafic tandis que chaque instance d'AZ-B ne reçoit que 6,25 %.

Avec cross-zone activé, chaque noeud distribue à **toutes les instances de toutes les AZ** → chaque instance reçoit 10 %.

**Important** :
- **ALB** : cross-zone activé par défaut (toujours)
- **NLB/GLB** : désactivé par défaut, à activer manuellement

Pourquoi les autres sont faux :
- **A (IPAM)** : gestion des adresses IP, pas de load balancing
- **B (Path-based)** : routing par URL path, pas de distribution uniforme
- **C (Direct Connect SiteLink)** : connexion on-prem, pas de load balancing

**Piège exam** : "distribuer uniformément entre AZ" → cross-zone load balancing. Attention : activé par défaut sur ALB mais PAS sur NLB.

📖 [Module 09 — Load Balancing & Auto Scaling](/courses/cloud-aws/aws_module_09_load_balancing.html)
</details>

---

## Question 16 — CloudFront : versioned objects vs invalidation

**Contexte** : Un système d'imagerie médicale héberge ses images dans S3 derrière CloudFront. Quand un nouveau lot est uploadé, il faut conserver les anciennes images (pas d'écrasement).

**Quelle solution ?**

- A. Invalider les fichiers dans la distribution CloudFront.
- B. Ajouter des directives Cache-Control no-cache sur le bucket S3.
- C. Ajouter un cache behavior séparé avec TTL minimum de 0.
- D. Utiliser des versioned objects (noms de fichiers versionnés).

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : D — Versioned objects**

Le versioning de fichiers (ex: `image_v1.jpg`, `image_v2.jpg`) est la méthode recommandée par AWS pour gérer les mises à jour de contenu derrière CloudFront. Avantages :

- Contrôle de la version servie même si l'ancienne est en cache
- Moins cher que l'invalidation (pas de frais)
- Facilite le rollback
- Logs CloudFront incluent le nom versionné

Pourquoi les autres sont faux :
- **A (Invalidation)** : fonctionne mais **coûte de l'argent** et ne garantit pas que les caches intermédiaires (proxys d'entreprise) soient purgés
- **B (Cache-Control)** : s'applique aux objets individuels, pas au bucket entier
- **C (TTL 0)** : ne résout pas le problème et désactive le cache

**Piège exam** : "mettre à jour des fichiers derrière CloudFront" → versioned objects (pas invalidation). L'invalidation est un dernier recours, pas la méthode par défaut.

📖 [Module 11 — DNS & CDN](/courses/cloud-aws/aws_module_11_dns_cdn.html)
</details>

---

## Question 17 — FSx Multi-AZ + Backup Vault Lock compliance

**Contexte** : FSx for Windows File Server en us-east-2, montage SMB sur EC2. RTO de 10 minutes. Backup cross-region vers us-west-1. Données immuables pendant 5 ans (compliance).

**Quelles solutions ? (2 réponses)**

- A. FSx Single-AZ 2 + AWS Backup daily vers us-west-1.
- B. FSx Multi-AZ + AWS Backup daily vers us-west-1.
- C. AWS Backup Vault Lock en **governance** mode, rétention 5 ans.
- D. AWS Backup Vault Lock en **compliance** mode, rétention 5 ans.
- E. FSx Multi-AZ + Lambda pour backup daily vers us-west-1.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponses : B + D**

- **B** : Multi-AZ garantit la haute disponibilité (RTO ~10 min via failover automatique). AWS Backup gère les backups cross-region nativement.
- **D** : Vault Lock en **compliance** mode rend les backups **immuables** — personne ne peut les supprimer ou modifier pendant la période de rétention, même un admin root.

Pourquoi les autres sont faux :
- **A (Single-AZ)** : ne respecte pas le RTO de 10 min en cas de panne AZ
- **C (governance mode)** : les utilisateurs privilégiés **peuvent** contourner les restrictions — ne garantit pas l'immuabilité pour la compliance
- **E (Lambda)** : complexité inutile quand AWS Backup fait le travail nativement

**Piège exam** : Vault Lock **compliance** = immuable, personne ne peut supprimer. Vault Lock **governance** = des users privilégiés peuvent contourner. Pour la compliance réglementaire → toujours compliance mode.

📖 [Module 32 — Migration](/courses/cloud-aws/aws_module_32_migration.html)
</details>

---

## Question 18 — S3 Intelligent-Tiering

**Contexte** : Données de transactions clients avec accès élevé pendant les soldes et fluctuant le reste de l'année. La solution doit être économique, durable et hautement disponible.

**Quelle classe de stockage S3 ?**

- A. S3 Intelligent-Tiering
- B. S3 Standard-Infrequent Access
- C. S3 Express One Zone
- D. S3 Glacier Instant Retrieval

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : A — S3 Intelligent-Tiering**

S3 Intelligent-Tiering déplace automatiquement les objets entre les tiers frequent/infrequent access selon les patterns d'accès réels. Pas d'intervention manuelle.

- Objet non accédé pendant 30 jours → déplacé en infrequent access (moins cher)
- Accès à nouveau → retour automatique en frequent access
- Durabilité 11 nines, haute disponibilité multi-AZ

Pourquoi les autres sont faux :
- **B (Standard-IA)** : adapté aux données rarement accédées, mais frais de récupération élevés pendant les soldes
- **C (Express One Zone)** : une seule AZ, pas haute disponibilité
- **D (Glacier Instant)** : archivage, récupération coûteuse en période de forte activité

**Piège exam** : "pattern d'accès imprévisible/fluctuant" → S3 Intelligent-Tiering (toujours). "Rarement accédé mais rapide quand nécessaire" → Standard-IA.

📖 [Module 04 — Stockage](/courses/cloud-aws/aws_module_04_storage.html) · [Module 26 — S3 avancé](/courses/cloud-aws/aws_module_26_s3_advanced.html)
</details>

---

## Question 19 — Elastic Beanstalk vs ECS

**Contexte** : Une app financière en Docker (stack MEAN). On veut la porter sur AWS avec gestion automatique du load balancing, auto-scaling, monitoring et placement des conteneurs.

**Quel service ?**

- A. AWS Compute Optimizer
- B. AWS CloudFormation
- C. AWS Elastic Beanstalk
- D. Amazon ECS

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : C — AWS Elastic Beanstalk**

Elastic Beanstalk supporte les déploiements Docker et gère **automatiquement** le load balancing, l'auto-scaling, le monitoring et le placement des conteneurs. Tu uploades ton code et Beanstalk fait le reste.

Pourquoi les autres sont faux :
- **D (ECS)** : offre ces fonctionnalités mais elles doivent être **configurées manuellement** (Service Auto Scaling, ELB, CloudWatch)
- **B (CloudFormation)** : IaC pour déployer l'infrastructure, mais tu dois câbler toi-même tous les composants
- **A (Compute Optimizer)** : recommandations de rightsizing, pas un service de déploiement

**Piège exam** : "automatiquement" + "load balancing, scaling, monitoring" → Elastic Beanstalk. Si la question mentionne un besoin de contrôle granulaire → ECS. Beanstalk = PaaS simple, ECS = orchestration fine.

📖 [Module 13 — IaC](/courses/cloud-aws/aws_module_13_iac.html) · [Module 25 — Containers](/courses/cloud-aws/aws_module_25_containers.html)
</details>

---

## Question 20 — Lake Formation blueprint + data filter

**Contexte** : Une entreprise a un data lake S3 (Lake Formation) avec des historiques d'achats et une base Aurora MySQL avec des données opérationnelles. L'objectif : visualiser les deux dans QuickSight avec un contrôle d'accès au niveau des colonnes pour l'équipe marketing.

**Quelle solution avec le moins d'overhead opérationnel ?**

- A. Lake Formation blueprint (ingestion incrémentale Aurora → S3) + data filter column-level + QuickSight via Athena.
- B. Amazon EMR pour ingérer Aurora directement dans le SPICE engine de QuickSight.
- C. AWS Glue Studio pour transférer Aurora → S3 + IAM policy pour column-level access.
- D. Glue Elastic Views pour créer une vue matérialisée + S3 bucket policy pour column-level access.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : A — Lake Formation blueprint + data filter + Athena**

Le blueprint "Incremental database" de Lake Formation automatise l'ingestion des nouvelles données Aurora vers le data lake S3. Les **data filters** de Lake Formation permettent un contrôle d'accès granulaire au niveau des colonnes. QuickSight utilise Athena qui respecte ces permissions.

Pourquoi les autres sont faux :
- **B (EMR → SPICE)** : n'exploite pas le data lake existant ni le column-level access de Lake Formation
- **C (Glue + IAM)** : les IAM policies n'offrent pas la même granularité colonne que les data filters Lake Formation
- **D (Glue Elastic Views + bucket policy)** : une S3 bucket policy ne peut pas contrôler l'accès au niveau des colonnes

**Piège exam** : "column-level access control" sur un data lake → **Lake Formation data filters** (pas IAM, pas bucket policies). "Ingestion incrémentale BDD → S3" → Lake Formation blueprint.

📖 [Module 30 — Data Services](/courses/cloud-aws/aws_module_30_data_services.html)
</details>

---

## Question 21 — S3 : rendre des objets publics

**Contexte** : Un bucket S3 doit servir des assets statiques pour un site web public. Comment s'assurer que tous les objets sont lisibles publiquement ?

**(2 réponses)**

- A. Configurer une bucket policy qui rend tous les objets public-read.
- B. Accorder l'accès public à l'objet lors de l'upload via la console S3.
- C. Configurer le CORS du bucket pour autoriser l'accès depuis tous les domaines.
- D. Ne rien faire — les objets S3 sont publics par défaut.
- E. Créer un IAM role pour rendre les objets publics.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponses : A + B**

Deux méthodes valides :
- **Bucket policy** : applique `public-read` à tous les objets du bucket (approche globale)
- **Permissions à l'upload** : accorde l'accès public objet par objet (approche granulaire)

Pourquoi les autres sont faux :
- **C (CORS)** : permet le chargement cross-origin (domain A → domain B), ne rend pas les objets publics
- **D** : **faux** — tous les objets S3 sont **privés par défaut**
- **E (IAM role)** : donne accès à des services/instances AWS, ne modifie pas les permissions publiques des objets

**Piège exam** : "S3 objets publics par défaut" = **toujours faux**. Par défaut tout est privé. CORS ≠ accès public.

📖 [Module 04 — Stockage](/courses/cloud-aws/aws_module_04_storage.html) · [Module 26 — S3 avancé](/courses/cloud-aws/aws_module_26_s3_advanced.html)
</details>

---

## Question 22 — Fault tolerance multi-AZ

**Contexte** : Une application nécessite strictement 6 instances EC2 en permanence. La région a 3 AZ. Quels déploiements garantissent 100 % de fault tolerance si une AZ tombe ?

**(2 réponses)**

- A. 2 + 2 + 2 (AZ-a, AZ-b, AZ-c)
- B. 6 + 6 + 0 (AZ-a, AZ-b, AZ-c)
- C. 2 + 4 + 2 (AZ-a, AZ-b, AZ-c)
- D. 4 + 2 + 2 (AZ-a, AZ-b, AZ-c)
- E. 3 + 3 + 3 (AZ-a, AZ-b, AZ-c)

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponses : B + E**

Il faut simuler la perte de chaque AZ et vérifier qu'il reste >= 6 instances :

| Déploiement | AZ-a down | AZ-b down | AZ-c down | OK ? |
|-------------|-----------|-----------|-----------|------|
| 2+2+2 | 4 | 4 | 4 | Non |
| 6+6+0 | **6** | **6** | **12** | Oui |
| 2+4+2 | 6 | **4** | 6 | Non |
| 4+2+2 | **4** | 6 | 6 | Non |
| 3+3+3 | **6** | **6** | **6** | Oui |

Seuls B (6+6+0) et E (3+3+3) garantissent >= 6 dans **tous** les scénarios de perte d'une AZ.

**Piège exam** : "fault tolerance" = le système doit fonctionner à pleine capacité APRÈS la perte d'une AZ. Tester chaque combinaison de perte. La formule : chaque sous-ensemble de N-1 AZ doit avoir >= le minimum requis.

📖 [Module 17 — Haute disponibilité](/courses/cloud-aws/aws_module_17_ha.html)
</details>

---

## Question 23 — IAM Role + MFA pour EC2

**Contexte** : Des instances EC2 doivent accéder à S3 et Redshift. Des admins système doivent aussi accéder pour déployer et tester.

**Comment sécuriser l'accès ? (2 réponses)**

- A. Assigner un IAM Role à l'instance EC2.
- B. Stocker les AWS Access Keys sur l'instance EC2.
- C. Stocker les AWS Access Keys dans ACM.
- D. Assigner un IAM User par instance EC2.
- E. Activer le Multi-Factor Authentication (MFA).

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponses : A + E**

- **IAM Role** : fournit des credentials temporaires automatiquement renouvelés à l'instance — aucun secret à stocker
- **MFA** : ajoute une couche de protection pour les admins (mot de passe + code d'authentification)

Pourquoi les autres sont faux :
- **B** : stocker des access keys sur une instance est un **anti-pattern de sécurité** (risque de compromission)
- **C (ACM)** : gère des certificats TLS/SSL, pas des credentials AWS
- **D** : un IAM User par instance est inutile et ingérable — les IAM Roles sont conçus exactement pour ce cas

**Piège exam** : "EC2 accède à d'autres services AWS" → **toujours IAM Role**, jamais access keys sur l'instance. C'est une best practice fondamentale.

📖 [Module 02 — IAM](/courses/cloud-aws/aws_module_02_iam.html) · [Module 08 — Sécurité](/courses/cloud-aws/aws_module_08_security.html)
</details>

---

## Question 24 — Lambda@Edge + Kinesis

**Contexte** : Tracker l'activité utilisateur globalement (clickstream) en temps réel. Les données doivent être traitées au plus proche des users avec une latence faible.

**Quelle solution ?**

- A. CloudFront + Lambda@Edge + Athena → S3.
- B. CloudFront + Route 53 Geoproximity + Kinesis → S3.
- C. CloudFront + Lambda@Edge + Kinesis → S3.
- D. CloudFront + Route 53 Latency-based + Kinesis → S3.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : C — Lambda@Edge + Kinesis**

- **Lambda@Edge** : exécute du code aux edge locations CloudFront, au plus proche des utilisateurs → traitement à faible latence
- **Kinesis** : ingestion et traitement de données en streaming temps réel

Pourquoi les autres sont faux :
- **A** : Athena est un service de requêtes ad hoc, pas de traitement temps réel
- **B et D** : Route 53 route du trafic DNS mais **n'exécute pas de code** — il ne peut pas traiter les données

**Piège exam** : "traitement au plus proche des users" → Lambda@Edge (pas Route 53). "Streaming temps réel" → Kinesis (pas Athena). Route 53 = routing DNS uniquement, zéro capacité de compute.

📖 [Module 18 — Serverless](/courses/cloud-aws/aws_module_18_serverless.html) · [Module 30 — Data Services](/courses/cloud-aws/aws_module_30_data_services.html)
</details>

---

## Question 25 — Kinesis Data Streams : ordre et durabilité

**Contexte** : Un service de messaging reçoit des milliers de messages/jour pour entraîner une IA. Les messages seront traités par Amazon EMR. Aucun message ne doit être perdu, pas de duplicates, et traitement dans l'ordre d'arrivée.

**Quel service ?**

- A. Amazon Kinesis Data Streams.
- B. Amazon SQS Standard + dead-letter queue.
- C. Amazon Data Firehose.
- D. Amazon SNS Topic.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : A — Kinesis Data Streams**

Kinesis Data Streams assigne un **sequence number unique** à chaque record, garantissant l'ordre dans un shard. Les données sont répliquées sur 3 AZ pour la durabilité. Les consumers (EMR via Spark) lisent les records dans l'ordre exact d'écriture.

Pourquoi les autres sont faux :
- **B (SQS Standard)** : at-least-once delivery (duplicates possibles) et best-effort ordering (pas d'ordre garanti)
- **C (Firehose)** : livraison vers des destinations (S3, Redshift), mais **pas de garantie d'ordre**
- **D (SNS)** : pub/sub, pas de stockage durable ni de garantie d'ordre

**Piège exam** : "ordre garanti" + "pas de duplicates" + "streaming" → Kinesis Data Streams. SQS Standard ne garantit ni l'ordre ni l'unicité. SQS FIFO garantit les deux mais à débit limité. Firehose = livraison, pas traitement ordonné.

📖 [Module 30 — Data Services](/courses/cloud-aws/aws_module_30_data_services.html)
</details>

---

## Question 26 — RDS Enhanced Monitoring vs CloudWatch

**Contexte** : Une plateforme crypto utilise ECS + RDS Multi-AZ. Il faut surveiller comment chaque processus/thread sur l'instance DB utilise le CPU, y compris le % de bande passante CPU et la mémoire totale par processus.

**Quelle solution ?**

- A. Activer Enhanced Monitoring dans RDS.
- B. Créer un script custom qui publie des métriques dans CloudWatch.
- C. Utiliser CloudWatch pour monitorer le CPU Utilization de la DB.
- D. Vérifier les métriques CPU% et MEM% disponibles dans la console RDS.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : A — Enhanced Monitoring**

Enhanced Monitoring collecte les métriques depuis un **agent installé sur l'instance** (pas depuis l'hyperviseur comme CloudWatch). Il fournit des métriques OS détaillées : CPU par processus, mémoire par processus, file system, I/O réseau — en temps réel.

Pourquoi les autres sont faux :
- **C (CloudWatch standard)** : fournit le CPU global depuis l'hyperviseur, pas le détail par processus
- **B (script custom)** : tu n'as **pas d'accès direct** à l'OS d'une instance RDS (contrairement à EC2)
- **D** : ces métriques ne sont **pas** disponibles par défaut dans la console RDS

**Piège exam** : "CPU par processus" ou "mémoire par processus" sur RDS → Enhanced Monitoring. CloudWatch standard = métriques hyperviseur (global). Enhanced Monitoring = métriques agent OS (par processus).

📖 [Module 07 — CloudWatch](/courses/cloud-aws/aws_module_07_cloudwatch.html) · [Module 10 — Databases](/courses/cloud-aws/aws_module_10_databases.html)
</details>

---

## Question 27 — RDS Multi-AZ : avantages réels

**Contexte** : Une app de transfert d'argent doit avoir une base de données hautement disponible dans plusieurs régions.

**Quels sont les avantages de RDS Multi-AZ ? (2 réponses)**

- A. Optimisation SQL.
- B. Augmentation significative des performances.
- C. Réplication synchrone vers une standby dans une AZ d'une **autre région**.
- D. Disponibilité accrue lors des upgrades système (patching OS, scaling).
- E. Durabilité accrue en cas de panne de composant ou d'AZ.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponses : D + E**

Multi-AZ crée une instance primaire et réplique **de manière synchrone** vers une standby dans une **autre AZ de la même région**. En cas de panne, failover automatique sans changement d'endpoint.

Pourquoi les autres sont faux :
- **C** : la réplication se fait dans la **même région**, pas cross-region (pour du cross-region → Read Replicas)
- **A et B** : Multi-AZ n'améliore **ni les performances ni le SQL** — c'est uniquement pour la haute disponibilité et la durabilité

**Piège exam** : Multi-AZ = **même région**, disponibilité + durabilité. Ne **pas** confondre avec Read Replicas (cross-region possible, performances en lecture). Multi-AZ ne booste pas les performances.

📖 [Module 10 — Databases](/courses/cloud-aws/aws_module_10_databases.html) · [Module 17 — Haute disponibilité](/courses/cloud-aws/aws_module_17_ha.html)
</details>

---

## Question 28 — ECS : Reserved + Spot instances

**Contexte** : Application batch Docker qui traite des données mission-critical ET des jobs non-essentiels. On cherche la solution la plus économique.

**Quelle combinaison ?**

- A. ECS + Reserved (mission-critical) + Spot (non-essential).
- B. ECS + Spot pour les deux types de workloads.
- C. ECS + Reserved pour les deux types de workloads.
- D. ECS + On-Demand pour les deux types de workloads.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : A — Reserved + Spot**

- **Reserved** pour le mission-critical : jusqu'à ~72 % de réduction, capacité garantie
- **Spot** pour le non-essentiel : jusqu'à ~90 % de réduction, mais interruptible

Pourquoi les autres sont faux :
- **B (tout Spot)** : Spot peut être interrompu à tout moment → inacceptable pour le mission-critical
- **C (tout Reserved)** : gaspille de l'argent sur les jobs non-essentiels qui tolèrent les interruptions
- **D (tout On-Demand)** : le plus cher de toutes les options

**Piège exam** : "mission-critical" → Reserved ou On-Demand (jamais Spot). "Non-essentiel/tolérant aux pannes" → Spot. "Cost-effective" → combiner les deux.

📖 [Module 03 — EC2](/courses/cloud-aws/aws_module_03_ec2.html) · [Module 25 — Containers](/courses/cloud-aws/aws_module_25_containers.html)
</details>

---

## Question 29 — S3 Lifecycle Policies vers Glacier

**Contexte** : Des vidéos haute qualité ne sont fréquemment accédées que pendant les 3 premiers mois. Il faut transférer automatiquement les données vers Glacier ensuite.

**Quelle solution ?**

- A. Script shell personnalisé.
- B. Amazon SWF.
- C. Amazon SQS.
- D. Lifecycle Policies.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : D — Lifecycle Policies**

Les S3 Lifecycle Policies permettent de définir des règles automatiques :
- **Transition actions** : déplacer vers une autre classe (ex : Standard → Glacier après 90 jours)
- **Expiration actions** : supprimer les objets après une durée définie

Pourquoi les autres sont faux :
- **A (script)** : complexité inutile, Lifecycle fait ça nativement
- **B (SWF)** : service d'orchestration de workflows, pas de gestion de stockage
- **C (SQS)** : file d'attente, aucun rapport avec la transition de stockage

**Piège exam** : "transférer automatiquement de S3 vers Glacier" → toujours Lifecycle Policy. Jamais besoin de script ou service tiers.

📖 [Module 04 — Stockage](/courses/cloud-aws/aws_module_04_storage.html) · [Module 26 — S3 avancé](/courses/cloud-aws/aws_module_26_s3_advanced.html)
</details>

---

## Question 30 — Glacier Vault Lock pour rétention d'audit

**Contexte** : Des logs d'audit doivent être conservés 5 ans avant suppression. Solution sécurisée et durable.

**Quelle solution ?**

- A. EFS avec file-locking NFSv4.
- B. Glacier Vault + Vault Lock.
- C. EBS + snapshots mensuels.
- D. S3 + MFA Delete.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : B — Glacier Vault + Vault Lock**

Vault Lock permet de verrouiller une policy qui **interdit la suppression** des archives avant l'expiration d'une période définie (ex : 5 ans). Une fois verrouillée, la policy est **immuable** — même un admin ne peut pas la modifier.

Pourquoi les autres sont faux :
- **D (MFA Delete)** : ajoute une couche de sécurité mais quelqu'un avec MFA peut toujours supprimer
- **A (EFS + NFSv4)** : le file lock peut être overridé, pas d'immuabilité garantie
- **C (EBS snapshots)** : les snapshots peuvent être supprimés par n'importe qui avec les permissions

**Piège exam** : "rétention obligatoire" + "compliance" + "immuable" → Glacier Vault Lock. MFA Delete ≠ immuabilité (un admin avec MFA peut quand même supprimer).

📖 [Module 04 — Stockage](/courses/cloud-aws/aws_module_04_storage.html)
</details>

---

## Question 31 — EBS : caractéristiques clés

**Contexte** : Migration vers EBS. Le CTO s'inquiète de la compliance, des downtime et des performances IOPS.

**Quels arguments valides pour EBS ? (2 réponses)**

- A. EBS peut être attaché à n'importe quelle instance dans n'importe quelle AZ.
- B. EBS supporte les changements de configuration en live (type, taille, IOPS) sans interruption.
- C. Les snapshots EBS sont envoyés vers Amazon RDS.
- D. Un volume EBS persiste indépendamment du cycle de vie de l'instance.
- E. Un volume EBS est automatiquement répliqué dans une autre région.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponses : B + D**

- **B** : on peut modifier le type, la taille et les IOPS d'un volume EBS en production sans interruption de service
- **D** : EBS est du stockage off-instance — il survit à l'arrêt/terminaison de l'instance (si configuré)

Pourquoi les autres sont faux :
- **A** : EBS ne peut être attaché qu'à une instance dans la **même AZ** (pas n'importe quelle AZ)
- **C** : les snapshots sont stockés dans **S3** (pas RDS)
- **E** : EBS est répliqué dans la **même AZ** (pas dans une autre région)

**Piège exam** : EBS = **même AZ uniquement**. Snapshots EBS → **S3** (pas RDS). Réplication EBS = intra-AZ (pas cross-region ni cross-AZ).

📖 [Module 03 — EC2](/courses/cloud-aws/aws_module_03_ec2.html) · [Module 04 — Stockage](/courses/cloud-aws/aws_module_04_storage.html)
</details>

---

## Question 32 — S3 Lifecycle vers Glacier (0 jours)

**Contexte** : 10 To de données financières rarement accédées, récupérées lors d'audits. Le temps de récupération ne doit pas dépasser 24h. Solution sécurisée, durable et économique.

**Quelle solution ?**

- A. S3 + Lifecycle vers S3-IA.
- B. S3 + Lifecycle vers S3 One Zone-IA.
- C. S3 + Lifecycle vers Glacier après 0 jours.
- D. Amazon FSx for Windows File Server via SMB.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : C — S3 + Lifecycle vers Glacier après 0 jours**

On peut définir une transition après **0 jours** : les données sont immédiatement archivées dans Glacier. Les bulk retrievals (5-12h) respectent le délai de 24h, et Glacier est de loin la solution la moins chère.

Pourquoi les autres sont faux :
- **A (S3-IA)** : plus cher que Glacier pour des données rarement accédées
- **B (One Zone-IA)** : une seule AZ → pas durable (single point of failure)
- **D (FSx)** : beaucoup plus cher que Glacier pour du stockage d'archive

**Piège exam** : "retrieval < 24h" + "cost-effective" → Glacier (bulk retrieval 5-12h). "Retrieval en millisecondes" → Glacier Instant. La transition à 0 jours est valide dans les lifecycle policies.

📖 [Module 04 — Stockage](/courses/cloud-aws/aws_module_04_storage.html)
</details>

---

## Question 33 — Reserved Instance Marketplace

**Contexte** : Des instances Reserved hébergent une application décommissionnée. Il faut arrêter de payer le plus vite possible.

**Quelles actions ? (2 réponses)**

- A. Vendre les RI sur Amazon.com.
- B. Contacter AWS pour annuler l'abonnement.
- C. Arrêter (stop) les instances.
- D. Vendre les RI sur le AWS Reserved Instance Marketplace.
- E. Terminer les instances pour éviter la facturation on-demand à l'expiration.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponses : D + E**

- **D** : le Reserved Instance Marketplace permet de revendre les RI non utilisées à des tiers
- **E** : terminer les instances évite d'être facturé au prix on-demand quand la réservation expire

Pourquoi les autres sont faux :
- **C (stop)** : une instance stoppée peut être redémarrée, et les EIP associées à des instances stoppées génèrent des frais
- **A (Amazon.com)** : c'est un site de e-commerce, pas une plateforme AWS
- **B** : inutile de fermer tout le compte AWS

**Piège exam** : "RI non utilisées" → les vendre sur le **Reserved Instance Marketplace** (pas Amazon.com). À l'expiration d'une RI, les instances passent en **on-demand** (beaucoup plus cher) → terminer si l'app est décommissionnée.

📖 [Module 03 — EC2](/courses/cloud-aws/aws_module_03_ec2.html) · [Module 21 — FinOps](/courses/cloud-aws/aws_module_21_finops.html)
</details>

---

## Question 34 — CloudFront Geo Restriction

**Contexte** : Un service de streaming musical doit empêcher l'accès à certains contenus selon le pays de l'auditeur (accords de licence). CloudFront avec OAC est utilisé. Il faut aussi des messages d'erreur personnalisés.

**Quelle solution ?**

- A. Custom error response + IAM access policy time-restricted.
- B. Custom error response + geographic restrictions (Allow list).
- C. Custom error response + signed URLs et signed cookies.
- D. Custom error response + CloudFront Function URL.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : B — Custom error response + Geo Restriction (Allow list)**

CloudFront offre une fonctionnalité native de **geo blocking** qui permet de restreindre l'accès par pays via une Allow list ou Deny list. Combinée avec les custom error responses, c'est la solution la plus directe.

Pourquoi les autres sont faux :
- **C (signed URLs/cookies)** : sécurise l'accès au contenu privé mais n'applique pas de restrictions géographiques
- **A (IAM time-restricted)** : IAM gère l'accès aux ressources AWS, pas le blocage géographique des utilisateurs finaux
- **D (CloudFront Function URL)** : pour modifier le comportement de livraison, pas pour le contrôle d'accès géographique

**Piège exam** : "bloquer par pays/région" → CloudFront Geo Restriction. "Accès privé sécurisé à du contenu" → signed URLs/cookies. Ce sont deux fonctionnalités différentes.

📖 [Module 11 — DNS & CDN](/courses/cloud-aws/aws_module_11_dns_cdn.html)
</details>

---

## Question 35 — VPC IPv6-only subnet

**Contexte** : Un VPC dual-stack (IPv4 + IPv6) arrive à épuisement des adresses IPv4. Impossible de lancer de nouvelles instances EC2. Il faut résoudre le problème tout en permettant la scalabilité future.

**Quelle solution ?**

- A. Créer un nouveau subnet IPv4 avec un CIDR plus large.
- B. Créer un subnet IPv6-only avec un large CIDR.
- C. Supprimer tous les CIDRs IPv4 du VPC pour ne garder que IPv6.
- D. Désactiver le support IPv4 dans le VPC.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : B — Subnet IPv6-only**

Depuis 2021, AWS supporte les subnets **IPv6-only** dans un VPC dual-stack. Cela permet de lancer des instances sans consommer d'adresses IPv4. L'espace IPv6 est quasi-illimité (/56 = 4,7 sextillions d'adresses).

Pourquoi les autres sont faux :
- **A (nouveau subnet IPv4)** : solution temporaire, l'espace IPv4 s'épuisera à nouveau
- **C et D** : **impossible** — on ne peut pas supprimer IPv4 d'un VPC ni le désactiver. IPv4 est obligatoire dans un VPC.

**Piège exam** : "IPv4 épuisé" → créer un subnet IPv6-only (pas ajouter plus d'IPv4). On ne peut **jamais** supprimer IPv4 d'un VPC — c'est le système par défaut obligatoire.

📖 [Module 05 — VPC](/courses/cloud-aws/aws_module_05_vpc.html) · [Module 27 — VPC avancé](/courses/cloud-aws/aws_module_27_vpc_advanced.html)
</details>

---

## Question 36 — Cost Explorer API

**Contexte** : Une entreprise construit un outil d'automatisation pour générer des rapports sur les coûts AWS. Il faut accéder et prévoir les coûts de manière programmatique, avec un minimum d'overhead opérationnel.

**Quelle solution ?**

- A. AWS Budgets reports via SQS.
- B. Cost Explorer API avec pagination.
- C. AWS Budgets via SNS.
- D. Télécharger les CSV Cost Explorer + prévoir avec AWS Budgets.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : B — Cost Explorer API avec pagination**

L'API Cost Explorer permet de requêter programmatiquement les données de coûts et d'usage : agrégées (coût mensuel total) ou granulaires (opérations d'écriture DynamoDB par jour). La pagination gère les gros volumes de données.

Pourquoi les autres sont faux :
- **A et C (Budgets)** : Budgets envoie des **alertes** sur des seuils, mais ne fournit pas l'accès détaillé aux données de coûts
- **D (CSV)** : téléchargement **manuel** = overhead opérationnel élevé, pas programmatique

**Piège exam** : "accès programmatique aux coûts" → Cost Explorer API. "Alertes de dépassement de budget" → AWS Budgets. Ce sont deux services complémentaires mais différents.

📖 [Module 21 — FinOps](/courses/cloud-aws/aws_module_21_finops.html)
</details>

---

## Question 37 — IAM Policy : least privilege DynamoDB

**Contexte** : Une Lambda doit uniquement faire PutItem et DeleteItem sur la table DynamoDB `tutorialsdojo` en us-east-1. Pas d'accès aux autres tables.

**Quelle IAM policy respecte le least privilege ?**

- A. Allow PutItem+DeleteItem sur `table/tutorialsdojo` **ET** Allow `dynamodb:*` sur `table/tutorialsdojo`.
- B. Allow PutItem+DeleteItem sur `table/tutorialsdojo` **ET** Deny `dynamodb:*` sur `table/*`.
- C. Allow PutItem+DeleteItem sur `table/*`.
- D. Allow PutItem+DeleteItem sur `table/tutorialsdojo` uniquement.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : D — Allow uniquement PutItem+DeleteItem sur la table spécifique**

Le least privilege = uniquement les actions nécessaires, sur la ressource spécifique. L'ARN doit pointer vers la table exacte (`table/tutorialsdojo`), pas un wildcard.

Pourquoi les autres sont faux :
- **A** : le deuxième statement accorde `dynamodb:*` (full access) → bien trop permissif
- **B** : le Deny `dynamodb:*` sur `table/*` bloque TOUT y compris les PutItem/DeleteItem du premier statement (Deny explicite > Allow)
- **C** : `table/*` = accès à **toutes** les tables du compte

**Piège exam** : un Deny explicite l'emporte **toujours** sur un Allow. `table/*` = wildcard sur toutes les tables. Least privilege = actions précises + ARN de ressource précis.

📖 [Module 02 — IAM](/courses/cloud-aws/aws_module_02_iam.html) · [Module 28 — IAM avancé](/courses/cloud-aws/aws_module_28_iam_advanced.html)
</details>

---

## Question 38 — Lambda + KMS : execution role vs resource policy

**Contexte** : Une Lambda traite des documents chiffrés depuis FSx for NetApp ONTAP avec une clé KMS customer-managed. Elle doit pouvoir déchiffrer les fichiers.

**Quelle action ?**

- A. `kms:decrypt` sur la resource policy Lambda + KMS key policy → execution role.
- B. `kms:decrypt` sur la resource policy Lambda + KMS key policy → resource policy ARN.
- C. `kms:decrypt` sur l'execution role Lambda + KMS key policy → execution role.
- D. `kms:decrypt` sur l'execution role Lambda + KMS key policy → function ARN.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : C — kms:decrypt sur l'execution role + KMS key policy vers l'execution role**

Lambda interagit avec les services AWS via son **execution role** (pas sa resource policy). Pour KMS, il faut :
1. Que l'execution role ait la permission `kms:decrypt`
2. Que la KMS key policy autorise cet execution role

Pourquoi les autres sont faux :
- **A et B** : la resource policy Lambda contrôle **qui peut invoquer** la Lambda, pas ce qu'elle peut faire
- **D** : la KMS key policy doit référencer l'ARN de l'**execution role**, pas l'ARN de la fonction

**Piège exam** : Lambda a 2 types de policies — **execution role** (ce que Lambda peut faire) vs **resource policy** (qui peut invoquer Lambda). Pour accéder à KMS/S3/DynamoDB → toujours l'execution role.

📖 [Module 08 — Sécurité](/courses/cloud-aws/aws_module_08_security.html) · [Module 18 — Serverless](/courses/cloud-aws/aws_module_18_serverless.html)
</details>

---

## Question 39 — ASG : default termination policy

**Contexte** : Un ASG multi-AZ avec un ALB subit un scale-in (trafic faible). Quelle instance est terminée en premier (politique par défaut) ?

- A. Instance choisie aléatoirement.
- B. Instance lancée depuis le plus ancien launch template.
- C. Instance avec le moins de sessions utilisateur.
- D. Instance qui tourne depuis le plus longtemps.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : B — Instance avec le plus ancien launch template**

L'ordre de la default termination policy :
1. Choisir l'AZ avec le plus d'instances
2. Parmi celles-ci, trouver les instances avec le **plus ancien launch template**
3. En cas d'égalité, choisir celle la plus proche de la prochaine heure de facturation
4. En cas d'égalité, choix aléatoire

Pourquoi les autres sont faux :
- **C (sessions)** : l'ASG ne connaît pas le nombre de sessions utilisateur
- **D (plus longtemps)** : la durée de vie n'est pas le critère principal
- **A (aléatoire)** : l'aléatoire est le dernier recours, pas le premier critère

**Piège exam** : la default termination policy de l'ASG priorise d'abord l'**AZ la plus peuplée**, puis le **plus ancien launch template**. Ce n'est ni aléatoire ni basé sur l'âge de l'instance.

📖 [Module 09 — Load Balancing & Auto Scaling](/courses/cloud-aws/aws_module_09_load_balancing.html)
</details>

---

## Question 40 — DataSync vs Storage Gateway

**Contexte** : Des données historiques on-prem doivent être migrées vers AWS pour libérer de l'espace. Solution économique et facile à gérer.

- A. Storage Gateway → S3 Glacier + lifecycle vers Deep Archive après 30j.
- B. DataSync → S3 Glacier Deep Archive directement.
- C. Storage Gateway → S3 Glacier Deep Archive.
- D. DataSync → S3 Standard + lifecycle vers Deep Archive après 30j.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : B — DataSync directement vers Glacier Deep Archive**

DataSync est conçu pour les **migrations massives** de données on-prem → AWS (jusqu'à 10× plus rapide que les outils open-source). Il peut écrire directement dans S3 Glacier Deep Archive — pas besoin de passer par Standard puis lifecycle.

Pourquoi les autres sont faux :
- **A et C (Storage Gateway)** : conçu pour l'accès hybride en continu (cache local + cloud), pas pour la migration one-shot de gros volumes
- **D (Standard + lifecycle)** : étape intermédiaire inutile puisque DataSync peut cibler directement Deep Archive

**Piège exam** : "migration de données on-prem → AWS" → DataSync. "Accès hybride continu on-prem ↔ cloud" → Storage Gateway. DataSync peut écrire directement dans Glacier Deep Archive.

📖 [Module 32 — Migration](/courses/cloud-aws/aws_module_32_migration.html)
</details>

---

## Question 41 — Organizations + IAM Identity Center + SCP

**Contexte** : Une multinationale avec plusieurs comptes AWS veut une architecture consolidée multi-comptes avec un annuaire d'entreprise centralisé pour l'authentification.

**Quelles solutions ? (2 réponses)**

- A. AWS Organizations + AWS Directory Service directement pour l'auth.
- B. AWS Organizations pour la gestion multi-comptes centralisée.
- C. AWS CloudTrail pour le logging centralisé.
- D. AWS IAM Identity Center + annuaire d'entreprise + SCP.
- E. Amazon Cognito Identity Pool + IAM Identity Center.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponses : B + D**

- **B** : Organizations fournit la structure multi-comptes avec billing consolidé
- **D** : IAM Identity Center s'intègre avec l'annuaire d'entreprise (SSO centralisé) et les SCP contrôlent les permissions par OU

Pourquoi les autres sont faux :
- **A** : Directory Service gère des annuaires (AD), pas l'authentification multi-comptes AWS
- **C** : CloudTrail = audit/logging, pas gestion multi-comptes ni auth
- **E** : Cognito = authentification pour apps web/mobile (utilisateurs finaux), pas pour l'accès multi-comptes AWS interne

**Piège exam** : "auth centralisée multi-comptes" → IAM Identity Center (pas Cognito, pas Directory Service seul). "Contrôle des permissions par compte/OU" → SCP via Organizations.

📖 [Module 16 — Multi-environnement](/courses/cloud-aws/aws_module_16_multi_env.html) · [Module 24 — Governance](/courses/cloud-aws/aws_module_24_governance.html)
</details>

---

## Question 42 — CloudFormation : bénéfices

**Contexte** : Un ingénieur écrit des scripts YAML CloudFormation au lieu de provisionner les ressources immédiatement. Le manager veut comprendre l'intérêt.

**Quels sont les bénéfices de CloudFormation ? (2 réponses)**

- A. Stockage de données hautement durable et scalable.
- B. Modélisation, provisioning et version control de toute l'infrastructure.
- C. Stockage du code applicatif.
- D. CloudFormation est gratuit, y compris les ressources créées.
- E. Modéliser toute l'infrastructure dans un fichier texte.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponses : B + E**

CloudFormation permet de décrire toute l'infrastructure dans un template (YAML/JSON), de la provisionner automatiquement et de la versionner via Git. Le service lui-même est gratuit, mais **les ressources créées sont facturées**.

Pourquoi les autres sont faux :
- **A** : CloudFormation n'est pas un service de stockage
- **C** : ce n'est pas un repository de code (→ CodeCommit/GitHub)
- **D** : **partiellement faux** — CloudFormation est gratuit mais les ressources AWS créées sont payantes

**Piège exam** : "CloudFormation est gratuit" = vrai pour le service, faux pour les ressources. C'est un piège classique.

📖 [Module 13 — IaC](/courses/cloud-aws/aws_module_13_iac.html)
</details>

---

## Question 43 — SQS FIFO : exactly-once processing

**Contexte** : Un système de traitement de commandes utilise une queue SQS Standard. Des commandes sont traitées en double, causant des problèmes.

**Quelle solution ?**

- A. Modifier le visibility timeout.
- B. Utiliser une queue SQS FIFO.
- C. Changer la taille des messages.
- D. Modifier la retention period.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : B — SQS FIFO**

SQS Standard offre une livraison **at-least-once** (duplicates possibles). SQS FIFO garantit **exactly-once processing** grâce à la déduplication intégrée + l'ordre FIFO garanti.

Pourquoi les autres sont faux :
- **A (visibility timeout)** : empêche un message d'être traité par un autre consumer pendant un temps, mais ne garantit pas l'unicité
- **C (taille message)** : aucun rapport avec les duplicates
- **D (retention)** : durée de conservation en queue, pas de déduplication

**Piège exam** : "messages dupliqués" + SQS → passer de Standard à FIFO. Le visibility timeout réduit le risque mais ne l'élimine pas. Seul FIFO garantit exactly-once.

📖 [Module 22 — Architectures distribuées](/courses/cloud-aws/aws_module_22_distributed.html)
</details>

---

## Question 44 — Storage Gateway File Gateway

**Contexte** : Stocker des backups de BDD on-prem dans le cloud AWS. Le service doit permettre de stocker et récupérer des objets via des protocoles de fichiers standard (NFS/SMB).

**Quelle solution ?**

- A. Storage Gateway Volume Gateway + accès direct via S3 API.
- B. Amazon EBS attaché à une instance EC2.
- C. Storage Gateway File Gateway → Amazon S3.
- D. AWS Snowball Edge → S3 Glacier.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : C — File Gateway vers S3**

File Gateway expose S3 comme un partage réseau NFS/SMB. Les applications on-prem accèdent aux fichiers via des protocoles standard, et les données sont stockées durablement dans S3.

Pourquoi les autres sont faux :
- **A (Volume Gateway)** : présente un stockage block (iSCSI), pas file — et on ne peut pas accéder directement via l'API S3
- **B (EBS)** : pas durable comme S3, pas de protocoles fichiers standards
- **D (Snowball)** : transfert physique, pas de récupération rapide via protocoles fichiers

**Piège exam** : "protocoles fichiers standard (NFS/SMB)" + "stockage cloud" → File Gateway. Volume Gateway = block (iSCSI). Tape Gateway = VTL (backup).

📖 [Module 32 — Migration](/courses/cloud-aws/aws_module_32_migration.html)
</details>

---

## Question 45 — Gateway VPC Endpoint vs Interface Endpoint (S3)

**Contexte** : Une instance EC2 dans un subnet privé accède à S3 pour des données financières sensibles. L'équipe sécurité s'inquiète que la connexion passe par Internet. Solution la plus économique.

**Quelle solution ?**

- A. Gateway VPC Endpoint.
- B. Interface VPC Endpoint (PrivateLink).
- C. Custom VPC Endpoint Service.
- D. Connexion VPN.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : A — Gateway VPC Endpoint**

Un Gateway VPC Endpoint permet un accès privé à S3 (et DynamoDB) sans passer par Internet. Il est **gratuit** (pas de frais horaires ni de data processing).

Pourquoi les autres sont faux :
- **B (Interface Endpoint)** : fonctionne aussi pour S3, mais est **facturé** (usage horaire + data processing) → pas le plus économique
- **C (VPC Endpoint Service)** : sert à exposer **ton propre service** en PrivateLink, pas à accéder à S3
- **D (VPN)** : passe par **Internet public** (chiffré mais pas privé AWS)

**Piège exam** : S3 et DynamoDB supportent les **Gateway Endpoints** (gratuits). Les autres services → Interface Endpoints (payants). "Most cost-effective" + S3 → toujours Gateway Endpoint.

📖 [Module 05 — VPC](/courses/cloud-aws/aws_module_05_vpc.html) · [Module 27 — VPC avancé](/courses/cloud-aws/aws_module_27_vpc_advanced.html)
</details>

---

## Question 46 — EC2 stop/start : Instance Store + EIP

**Contexte** : Une instance EC2 EBS-backed avec des volumes Instance Store attachés et une EIP est stoppée puis redémarrée pour économiser.

**Que se passe-t-il ? (2 réponses)**

- A. L'EIP est dissociée.
- B. Toutes les données des volumes Instance Store sont perdues.
- C. L'ENI est détachée.
- D. L'hôte physique sous-jacent peut changer.
- E. Aucun changement.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponses : B + D**

- **B** : les volumes Instance Store sont **éphémères** — les données sont perdues à chaque stop/start (ou terminaison)
- **D** : AWS peut déplacer l'instance vers un autre hôte physique au redémarrage

Pourquoi les autres sont faux :
- **A** : dans un VPC, l'EIP **reste** associée après stop/start (dissociation uniquement en EC2-Classic, obsolète)
- **C** : l'ENI reste attachée
- **E** : il y a bien des changements (nouvelle IP publique possible, perte Instance Store, changement d'hôte)

**Piège exam** : Instance Store = éphémère, **toujours perdu** au stop. EIP dans un VPC = persiste après stop. L'hôte physique peut changer. Nouvelle IP publique (non-EIP) au redémarrage.

📖 [Module 03 — EC2](/courses/cloud-aws/aws_module_03_ec2.html) · [Module 04 — Stockage](/courses/cloud-aws/aws_module_04_storage.html)
</details>

---

## Question 47 — EC2 non accessible depuis Internet

**Contexte** : Un nouveau subnet dans un VPC avec Internet Gateway. L'instance EC2 lancée dedans n'est pas accessible depuis Internet.

**Quelles causes possibles ? (2 réponses)**

- A. L'instance n'a pas d'IP publique.
- B. L'instance n'est pas dans le même ASG.
- C. La route table n'a pas de route vers l'Internet Gateway.
- D. La route table n'est pas configurée vers le Customer Gateway.
- E. L'instance n'a pas d'Elastic Fabric Adapter (EFA).

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponses : A + C**

Pour qu'une instance soit accessible depuis Internet, il faut :
1. Une **IP publique** (ou EIP)
2. Une **route** dans la route table du subnet vers l'**Internet Gateway** (0.0.0.0/0 → igw-xxx)
3. Des **Security Groups** et **NACL** qui autorisent le trafic

Pourquoi les autres sont faux :
- **B (ASG)** : l'ASG n'affecte pas la connectivité Internet
- **D (Customer Gateway)** : le CGW est pour les VPN site-to-site, pas pour Internet
- **E (EFA)** : l'EFA accélère le HPC, pas nécessaire pour Internet

**Piège exam** : "instance non accessible depuis Internet" → vérifier 1) IP publique 2) route table → IGW 3) SG/NACL. Customer Gateway = VPN, pas Internet.

📖 [Module 05 — VPC](/courses/cloud-aws/aws_module_05_vpc.html)
</details>

---

## Question 48 — Direct Connect vs VPN

**Contexte** : Connexion dédiée entre un VPC et le réseau on-prem. Haut débit et expérience réseau plus cohérente qu'une connexion Internet.

**Quelle solution ?**

- A. AWS Site-to-Site VPN.
- B. Transit VPC.
- C. AWS Direct Connect.
- D. Transit Gateway avec ECMP.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : C — AWS Direct Connect**

Direct Connect = fibre dédiée entre le datacenter et AWS. Latence prévisible, bande passante élevée (1-100 Gbps), ne passe pas par Internet.

Pourquoi les autres sont faux :
- **A (VPN)** : passe par **Internet public** → latence variable, pas de bande passante garantie
- **B (Transit VPC)** : architecture pour connecter plusieurs VPC, pas un service de connexion dédiée
- **D (Transit Gateway + ECMP)** : hub pour interconnecter VPC/VPN, pas une connexion physique dédiée

**Piège exam** : "connexion dédiée" + "haut débit" + "pas Internet" → Direct Connect. "Rapide à déployer" + "chiffré" → VPN. Direct Connect n'est PAS chiffré par défaut (ajouter VPN over DX si besoin).

📖 [Module 27 — VPC avancé](/courses/cloud-aws/aws_module_27_vpc_advanced.html)
</details>

---

## Question 49 — STS : credentials temporaires cross-account

**Contexte** : Un développeur a accès au compte dev mais a besoin d'un accès temporaire en écriture (EC2 + S3) au compte prod.

**Quel service permet de générer des tokens d'accès temporaires ?**

- A. AWS Security Token Service (STS).
- B. Toutes les options ci-dessus.
- C. Amazon Cognito (JWT).
- D. AWS IAM Identity Center.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : A — AWS STS**

STS permet de générer des **credentials temporaires** via `AssumeRole`. Le dev du compte A assume un rôle dans le compte B → reçoit des credentials limités en durée et en permissions.

Pourquoi les autres sont faux :
- **C (Cognito + JWT)** : authentification pour utilisateurs d'applications web/mobile, pas pour l'accès cross-account AWS
- **D (Identity Center)** : SSO centralisé, ne génère pas directement de tokens temporaires pour du cross-account programmatique

**Piège exam** : "accès temporaire cross-account" → STS AssumeRole. "SSO multi-comptes pour des humains" → IAM Identity Center. "Auth utilisateurs d'apps" → Cognito.

📖 [Module 02 — IAM](/courses/cloud-aws/aws_module_02_iam.html) · [Module 28 — IAM avancé](/courses/cloud-aws/aws_module_28_iam_advanced.html)
</details>

---

## Question 50 — EC2 Hibernation

**Contexte** : Une instance Windows EC2 avec FSx est stoppée hors heures de bureau. L'application prend plusieurs minutes à redevenir opérationnelle au redémarrage. Comment accélérer sans augmenter les coûts ?

- A. Activer l'hibernation sur l'instance actuelle.
- B. Désactiver le Instance Metadata Service.
- C. Migrer vers une instance avec hibernation activée.
- D. Migrer vers une instance Linux.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : C — Migrer vers une instance avec hibernation**

L'hibernation sauvegarde le contenu de la RAM sur le volume EBS root. Au redémarrage, la RAM est restaurée → l'application reprend exactement là où elle s'était arrêtée, sans temps de chargement.

**Important** : l'hibernation doit être activée **au lancement** de l'instance. On ne peut pas l'activer sur une instance existante → il faut migrer.

Pourquoi les autres sont faux :
- **A** : on ne peut **pas** activer l'hibernation sur une instance déjà lancée
- **B** : le Metadata Service n'impacte pas le temps de démarrage des applications
- **D** : changer d'OS ne résout pas le problème de temps de chargement

**Piège exam** : "application lente au démarrage après stop/start" → hibernation. Mais l'hibernation doit être configurée **à la création** de l'instance, pas après.

📖 [Module 03 — EC2](/courses/cloud-aws/aws_module_03_ec2.html)
</details>

---

## Question 51 — S3 Versioning + MFA Delete

**Contexte** : Un ingénieur a accidentellement supprimé un fichier dans S3, causant une interruption de service. Comment empêcher que ça se reproduise ?

- A. Configurer des signed URLs pour tous les utilisateurs.
- B. Utiliser S3 Infrequent Access.
- C. Créer une bucket policy qui interdit l'opération delete.
- D. Activer S3 Versioning et MFA Delete.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : D — S3 Versioning + MFA Delete**

- **Versioning** : conserve toutes les versions d'un objet. Une "suppression" crée un delete marker, l'objet est récupérable.
- **MFA Delete** : exige une authentification MFA pour supprimer définitivement une version ou désactiver le versioning.

Pourquoi les autres sont faux :
- **C (bucket policy deny delete)** : empêche **toute** suppression, même légitime
- **A (signed URLs)** : contrôle l'accès au contenu, pas la suppression
- **B (S3-IA)** : classe de stockage, aucun impact sur la suppression

**Piège exam** : "suppression accidentelle S3" → Versioning + MFA Delete. Ne pas confondre avec Object Lock (compliance/rétention obligatoire).

📖 [Module 04 — Stockage](/courses/cloud-aws/aws_module_04_storage.html) · [Module 26 — S3 avancé](/courses/cloud-aws/aws_module_26_s3_advanced.html)
</details>

---

## Question 52 — EFS : Provisioned Throughput + Max I/O

**Contexte** : Un système HPC avec des centaines de tâches ECS accédant en permanence à un stockage partagé. Opérations lecture/écriture haute fréquence. Données ~10 Mo par tâche, stockage total < 10 To.

**Quelle solution ?**

- A. FSx for Windows File Server (SMB) comme mount point ECS.
- B. EFS Bursting Throughput, General Purpose comme mount point ECS.
- C. DynamoDB + DAX comme mount point ECS.
- D. EFS Provisioned Throughput, Max I/O comme mount point ECS.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : D — EFS Provisioned Throughput + Max I/O**

- **Provisioned Throughput** : débit garanti indépendant de la taille stockée (contrairement à Bursting qui dépend du volume de données)
- **Max I/O** : optimisé pour les workloads hautement parallèles (des centaines de clients simultanés)

Pourquoi les autres sont faux :
- **B (Bursting + GP)** : le débit dépend du volume stocké (10 To = limité), et General Purpose n'est pas optimisé pour des centaines de connexions simultanées
- **A (FSx Windows)** : conçu pour les workloads Windows, pas pour du HPC Linux haute fréquence
- **C (DynamoDB)** : c'est une BDD, pas un système de fichiers — on ne peut pas le monter comme volume

**Piège exam** : "haute fréquence I/O" + "centaines de clients" → EFS Max I/O. "Débit élevé avec peu de données stockées" → Provisioned Throughput. Bursting = adapté si beaucoup de données stockées (le burst dépend de la taille).

📖 [Module 04 — Stockage](/courses/cloud-aws/aws_module_04_storage.html)
</details>

---

## Question 53 — FSx for Windows + Active Directory

**Contexte** : Migration d'un SharePoint on-prem vers AWS. Stockage fichiers partagé Windows, intégré avec Active Directory pour le contrôle d'accès.

**Quelle solution ?**

- A. FSx for Windows File Server + jointure à un domaine AD.
- B. EFS + jointure AD.
- C. EC2 Windows + S3 monté comme volume.
- D. Storage Gateway NFS file share.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : A — FSx for Windows + AD**

FSx for Windows File Server supporte nativement le protocole SMB et l'intégration Active Directory (AWS Managed AD ou Self-managed AD). Quotas utilisateurs, permissions NTFS, et contrôle d'accès par identité AD.

Pourquoi les autres sont faux :
- **B (EFS)** : ne supporte **pas Windows** (Linux/NFS uniquement)
- **C (S3)** : S3 n'est pas un système de fichiers, pas d'intégration AD native
- **D (NFS)** : NFS est pour Linux, SharePoint nécessite SMB

**Piège exam** : "Windows" + "Active Directory" + "file share" → FSx for Windows. "Linux" + "NFS" → EFS. Ne jamais proposer EFS pour des workloads Windows.

📖 [Module 04 — Stockage](/courses/cloud-aws/aws_module_04_storage.html) · [Module 32 — Migration](/courses/cloud-aws/aws_module_32_migration.html)
</details>

---

## Question 54 — S3 + EMR pour traiter des logs

**Contexte** : Des serveurs Linux sur EC2 génèrent des logs applicatifs. L'équipe audit veut les collecter et les traiter pour un rapport.

**Quelle solution ?**

- A. S3 Glacier Deep Archive + AWS ParallelCluster.
- B. S3 Glacier + Spot EC2 instances.
- C. Un seul EC2 On-Demand pour stocker et traiter.
- D. Amazon S3 pour le stockage + Amazon EMR pour le traitement.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : D — S3 + EMR**

S3 est le stockage durable et économique pour les logs. EMR (Elastic MapReduce) est le service managé pour traiter de gros volumes de données avec Hadoop/Spark.

Pourquoi les autres sont faux :
- **A et B (Glacier)** : archivage avec temps de récupération lent — inadapté pour du traitement actif
- **C (un seul EC2)** : EC2 n'est pas un service de stockage recommandé et n'a pas de moteur de traitement big data intégré

**Piège exam** : "collecter + traiter des logs à grande échelle" → S3 (stockage) + EMR (traitement). Glacier = archivage uniquement, pas pour du traitement actif.

📖 [Module 30 — Data Services](/courses/cloud-aws/aws_module_30_data_services.html)
</details>

---

## Question 55 — Amazon Pinpoint + Kinesis

**Contexte** : Campagne SMS one-time vers tous les abonnés d'une app mobile. Les réponses SMS doivent être conservées 1 an et analysées en near-real-time. Minimum d'overhead opérationnel.

**Quelle solution ?**

- A. SQS pour envoyer les SMS + Step Functions + Lambda + S3 Glacier.
- B. SNS topic + Kinesis Data Stream (paramètres par défaut).
- C. Amazon Pinpoint journey + Kinesis Data Stream (rétention 365 jours).
- D. Amazon Connect + Lambda + S3 Glacier Flexible.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : C — Pinpoint + Kinesis (365 jours)**

Amazon Pinpoint est conçu pour les campagnes de communication multicanal (SMS, email, push). Il peut streamer ses événements directement vers Kinesis pour collecte et analyse near-real-time. La rétention Kinesis peut être configurée jusqu'à 365 jours.

Pourquoi les autres sont faux :
- **B (SNS + Kinesis défaut)** : SNS peut envoyer des SMS mais n'est pas conçu pour les campagnes marketing. La rétention par défaut de Kinesis = 24h (insuffisant pour 1 an)
- **A (SQS)** : SQS ne peut **pas** envoyer de SMS
- **D (Amazon Connect)** : centre d'appels, overhead opérationnel trop élevé pour un SMS one-time

**Piège exam** : "campagne SMS marketing" → Pinpoint (pas SNS). "Rétention 1 an streaming" → Kinesis avec rétention configurée à 365 jours. La rétention Kinesis par défaut = 24h !

📖 [Module 22 — Architectures distribuées](/courses/cloud-aws/aws_module_22_distributed.html)
</details>

---

## Question 56 — Instance Scheduler on AWS

**Contexte** : Une application interne ne tourne que pendant les heures de bureau en semaine. Il faut optimiser les coûts EC2 + RDS avec un minimum d'overhead opérationnel.

**Quelle solution ?**

- A. Déployer le template CloudFormation Instance Scheduler + configurer les horaires start/stop.
- B. Acheter des Reserved Instances pour EC2 et RDS.
- C. CloudWatch alarm sur CPU idle → Lambda pour stop EC2 + RDS.
- D. Acheter un Compute Savings Plan.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : A — Instance Scheduler on AWS**

C'est un template CloudFormation fourni par AWS qui automatise le start/stop d'instances EC2 et RDS selon un planning défini. Jusqu'à 70 % d'économies (168h/semaine → 50h).

Pourquoi les autres sont faux :
- **B et D (RI / Savings Plans)** : facturent pour une utilisation **continue** 24/7, pas adaptés à un usage intermittent
- **C (CloudWatch + Lambda)** : approche dynamique basée sur le CPU, risque de stopper RDS pendant les heures de travail si le CPU baisse temporairement

**Piège exam** : "usage uniquement en heures de bureau" → Instance Scheduler (pas RI ni Savings Plans). RI et Savings Plans = usage continu et prévisible. Instance Scheduler = usage intermittent et planifié.

📖 [Module 21 — FinOps](/courses/cloud-aws/aws_module_21_finops.html)
</details>

---

## Question 57 — Fault tolerance : 3+3+3 (cost-effective)

**Contexte** : 6 instances minimum à tout moment. 3 AZ disponibles. Fault tolerance si 1 AZ tombe. Solution la plus **économique**.

- A. 6+6+0
- B. 6+6+6
- C. 2+2+2
- D. 3+3+3

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : D — 3+3+3 (9 instances)**

Si une AZ tombe : 3+3 = 6 instances restantes = exigence satisfaite.

| Option | Total | AZ down → reste | Fault tolerant ? | Coût relatif |
|--------|-------|-----------------|------------------|--------------|
| 6+6+0 | 12 | 6 | Oui | $$$ |
| 6+6+6 | 18 | 12 | Oui | $$$$$ |
| 2+2+2 | 6 | 4 | Non | $ |
| **3+3+3** | **9** | **6** | **Oui** | **$$** |

3+3+3 est fault tolerant ET le plus économique parmi les options valides.

**Piège exam** : "fault tolerance" + "most cost-effective" → trouver le minimum d'instances où chaque combinaison de N-1 AZ >= minimum requis. La formule : `ceil(min_requis / (nb_AZ - 1))` par AZ.

📖 [Module 17 — Haute disponibilité](/courses/cloud-aws/aws_module_17_ha.html)
</details>

---

## Question 58 — Launch Template : nouvel AMI

**Contexte** : Un ASG utilise un launch template. Un nouvel AMI doit être utilisé pour les instances.

**Que faire ?**

- A. Créer un nouveau target group + launch template.
- B. Créer un nouveau launch template.
- C. Ne rien faire, utiliser le même launch template.
- D. Créer un nouveau target group.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : B — Nouveau launch template**

Un launch template **ne peut pas être modifié** après sa création. Pour changer l'AMI, il faut créer un nouveau launch template (ou une nouvelle version) et l'associer à l'ASG.

Pourquoi les autres sont faux :
- **C** : le launch template existant utilise l'ancien AMI — il faut le changer
- **A et D (target group)** : les target groups sont liés à l'ELB, pas à l'AMI. Pas besoin de les modifier.

**Piège exam** : "changer l'AMI d'un ASG" → nouveau launch template (ou nouvelle version). Les launch templates sont **immuables**. Les target groups sont pour le load balancing, pas pour l'AMI.

📖 [Module 09 — Load Balancing & Auto Scaling](/courses/cloud-aws/aws_module_09_load_balancing.html)
</details>

---

## Question 59 — Amazon Macie pour détecter les PII

**Contexte** : Un cabinet d'audit veut vérifier qu'un bucket S3 (data lake via Lake Formation) ne contient pas de données sensibles (PII, numéros de carte, passeport).

**Quelle solution la plus opérationnellement efficace ?**

- A. S3 Inventory + Athena pour requêter l'inventaire.
- B. AWS Audit Manager avec le framework PCI DSS.
- C. AWS Glue DataBrew pour identifier et nettoyer les données sensibles.
- D. Amazon Macie avec managed identifiers.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : D — Amazon Macie**

Macie utilise le ML et le pattern matching pour détecter automatiquement les données sensibles (PII, données financières, credentials) dans S3. Les managed identifiers couvrent des dizaines de types de données dans de nombreux pays.

Pourquoi les autres sont faux :
- **A (S3 Inventory + Athena)** : l'inventaire liste les objets (metadata), pas leur contenu — il ne détecte pas les PII
- **B (Audit Manager)** : évalue la conformité et collecte des preuves, mais ne scanne pas le contenu des fichiers
- **C (Glue DataBrew)** : préparation et nettoyage de données, pas de découverte automatisée de données sensibles

**Piège exam** : "détecter des PII dans S3" → Macie (toujours). "Audit de conformité" → Audit Manager. "Préparer/nettoyer des données" → Glue DataBrew.

📖 [Module 12 — Sécurité avancée](/courses/cloud-aws/aws_module_12_security_advanced.html) · [Module 20 — Zero Trust](/courses/cloud-aws/aws_module_20_security_zero_trust.html)
</details>

---

## Question 60 — CloudWatch Agent : SwapUtilization

**Contexte** : Des instances EC2 dans un ASG échouent par manque de swap. Il faut monitorer l'espace swap disponible de chaque instance.

**Quelle solution ?**

- A. Activer le detailed monitoring et surveiller SwapUtilization.
- B. Créer un trail CloudTrail + CloudWatch Logs.
- C. Installer le CloudWatch Agent et surveiller SwapUtilization.
- D. Créer un dashboard CloudWatch et surveiller SwapUsed.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : C — Installer le CloudWatch Agent**

SwapUtilization est une **custom metric** — elle n'est pas disponible par défaut dans CloudWatch. Il faut installer le CloudWatch Agent sur chaque instance pour la collecter.

Pourquoi les autres sont faux :
- **A (detailed monitoring)** : fournit des métriques par défaut à 1 min au lieu de 5 min, mais n'ajoute **pas** de nouvelles métriques comme le swap
- **D (dashboard)** : un dashboard affiche des métriques existantes, il ne les collecte pas
- **B (CloudTrail)** : trace les appels API, pas les métriques système

**Piège exam** : swap, mémoire, espace disque = **toujours** CloudWatch Agent (custom metrics). Le detailed monitoring améliore la fréquence, pas le périmètre des métriques.

📖 [Module 07 — CloudWatch](/courses/cloud-aws/aws_module_07_cloudwatch.html) · [Module 15 — Observabilité](/courses/cloud-aws/aws_module_15_observability.html)
</details>

---

## Question 61 — S3 Multipart Upload

**Contexte** : Une app d'animation uploade des vidéos de 5 Go vers S3. Les uploads sont lents et impactent les performances.

**Quelle méthode pour améliorer les performances ?**

- A. S3 Multipart Upload API.
- B. Enhanced Networking avec ENA.
- C. CloudFront avec HTTP POST.
- D. EBS Provisioned IOPS en LVM stripe.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : A — S3 Multipart Upload**

Multipart Upload découpe l'objet en parties uploadées en **parallèle**. Avantages :
- Débit amélioré (parallélisme)
- Reprise en cas d'échec (re-upload d'une seule partie)
- Pas d'expiration
- AWS recommande Multipart dès que l'objet dépasse **100 Mo**

Pourquoi les autres sont faux :
- **B (ENA)** : améliore le réseau mais le goulot est le processus d'upload vers S3, pas la carte réseau
- **C (CloudFront POST)** : CloudFront est un CDN pour la distribution, pas pour accélérer les uploads
- **D (EBS IOPS)** : améliore les I/O disque local, pas les uploads réseau vers S3

**Piège exam** : "upload lent vers S3" + "gros fichiers" → Multipart Upload. À partir de 100 Mo, toujours utiliser Multipart. Au-dessus de 5 Go, c'est **obligatoire**.

📖 [Module 04 — Stockage](/courses/cloud-aws/aws_module_04_storage.html) · [Module 26 — S3 avancé](/courses/cloud-aws/aws_module_26_s3_advanced.html)
</details>

---

## Question 62 — Aurora Serverless

**Contexte** : Workloads transactionnels intermittents, sporadiques et imprévisibles pour un site e-commerce. Il faut une BDD relationnelle qui auto-scale et redescend quand l'activité baisse.

**Quelle solution la plus économique ?**

- A. DynamoDB Global Table avec Auto Scaling.
- B. Aurora Serverless avec capacité min/max.
- C. Redshift avec Concurrency Scaling.
- D. Aurora Provisioned avec burstable instance types.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : B — Aurora Serverless**

Aurora Serverless démarre, s'arrête et scale automatiquement sa capacité compute selon la demande. Tu définis un min et max d'ACU (Aurora Capacity Units). Zéro activité → scale à zéro (tu ne paies que le stockage).

Pourquoi les autres sont faux :
- **A (DynamoDB)** : NoSQL, pas relationnel — la question exige explicitement du relationnel
- **C (Redshift)** : OLAP (analytique), pas OLTP (transactionnel)
- **D (Aurora Provisioned)** : capacité manuelle, pas adaptée aux workloads imprévisibles

**Piège exam** : "workload imprévisible/intermittent" + "relationnel" + "auto-scale" → Aurora Serverless. "Workload prévisible/stable" → Aurora Provisioned. "Analytique" → Redshift.

📖 [Module 10 — Databases](/courses/cloud-aws/aws_module_10_databases.html)
</details>

---

## Question 63 — Route 53 : Alias A record pour zone apex

**Contexte** : Un site web derrière un ALB utilise Route 53 pour le DNS. Comment configurer le record DNS du zone apex (ex: `example.com`) pour pointer vers le load balancer ?

- A. CNAME record vers le DNS name du LB.
- B. A record vers l'IP du LB.
- C. Alias CNAME vers le DNS name du LB.
- D. A record **aliased** vers le DNS name du LB.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : D — A record aliased vers le DNS name du LB**

Un Alias record de type A mappe le zone apex directement vers le DNS name du load balancer. Route 53 résout automatiquement vers les bonnes IPs (qui changent avec le scaling).

Pourquoi les autres sont faux :
- **A et C (CNAME)** : un CNAME **ne peut pas** être créé pour un zone apex (restriction DNS RFC)
- **B (A record vers IP)** : les IPs d'un ELB changent dynamiquement — un A record statique deviendrait obsolète

**Piège exam** : "zone apex" (ex: example.com sans www) → **Alias A record** (jamais CNAME). CNAME fonctionne uniquement pour les sous-domaines (www.example.com).

📖 [Module 11 — DNS & CDN](/courses/cloud-aws/aws_module_11_dns_cdn.html)
</details>

---

## Question 64 — Amazon Data Firehose

**Contexte** : Un magasin connecté utilise des capteurs pour collecter les articles pris par les clients. Il faut capturer, transformer et charger ces données streaming vers S3, OpenSearch et Splunk.

**Quel service ?**

- A. Amazon Data Firehose.
- B. Amazon DynamoDB Streams.
- C. Amazon Redshift.
- D. Amazon SQS.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : A — Amazon Data Firehose**

Firehose est le moyen le plus simple de charger des données streaming vers des destinations comme S3, Redshift, OpenSearch et Splunk. Il gère la capture, la transformation (via Lambda) et la livraison automatiquement.

Pourquoi les autres sont faux :
- **B (DynamoDB Streams)** : capture les changements d'une table DynamoDB, pas un outil de livraison de streaming
- **C (Redshift)** : data warehouse, pas un outil d'ingestion de streaming
- **D (SQS)** : file d'attente, pas de livraison vers S3/OpenSearch/Splunk

**Piège exam** : "capturer + transformer + charger du streaming vers S3/OpenSearch/Splunk" → Firehose. "Ingestion temps réel avec consumers custom" → Kinesis Data Streams. Firehose = livraison, Kinesis Streams = traitement.

📖 [Module 30 — Data Services](/courses/cloud-aws/aws_module_30_data_services.html)
</details>

---

## Question 65 — Cluster Placement Group (HPC)

**Contexte** : Un cluster HPC réparti sur plusieurs AZ traite des simulations de vent. L'application ralentit à cause de problèmes de latence réseau entre les nœuds.

**Quelle solution pour une communication node-to-node à faible latence ?**

- A. Spread placement group multi-AZ multi-régions.
- B. AWS Direct Connect multi-AZ.
- C. Cluster placement group dans une seule AZ, même région.
- D. EC2 Dedicated Instances avec elastic inference accelerator.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : C — Cluster placement group dans une seule AZ**

Un cluster placement group regroupe les instances physiquement proches dans la **même AZ** pour obtenir la latence réseau la plus basse possible et le débit le plus élevé (enhanced networking). C'est le choix standard pour les workloads HPC tightly-coupled.

**Les 3 types de placement groups :**

| Type | Comportement | Cas d'usage |
|------|-------------|-------------|
| **Cluster** | Instances proches, même AZ | HPC, faible latence node-to-node |
| **Partition** | Groupes sur des racks séparés | Hadoop, Cassandra, Kafka |
| **Spread** | Chaque instance sur un rack distinct (max 7/AZ) | Instances critiques isolées |

Pourquoi les autres sont faux :
- **A (Spread multi-région)** : un placement group est limité à **une seule région**, et Spread maximise la séparation (l'opposé de ce qu'on veut pour le HPC)
- **B (Direct Connect)** : connexion dédiée on-prem ↔ AWS, pas pour la latence intra-AWS
- **D (Dedicated + elastic inference)** : isolation matérielle par client + accélération GPU, aucun impact sur la latence réseau

**Piège exam** : "HPC" + "faible latence node-to-node" → **Cluster** placement group (une seule AZ). "Distributed workload" (Hadoop/Kafka) → Partition. "Instances critiques isolées" → Spread. Un placement group ne peut pas être multi-région.

📖 [Module 03 — EC2](/courses/cloud-aws/aws_module_03_ec2.html)
</details>

---

## Question 66 — SQS et priorité (premium vs free)

**Contexte** : Un site de traitement vidéo a deux types de comptes : free et premium. Tous les jobs passent par une seule queue SQS, traitée par un ASG d'EC2. Il faut garantir que les utilisateurs premium soient traités avant les free.

**Quelle re-conception adopter ?**

- A. Marquer les messages premium avec une priorité plus élevée dans la queue SQS.
- B. Créer deux queues SQS distinctes (premium et free). Les EC2 vident la queue premium en premier, puis la free quand la premium est vide.
- C. Utiliser Kinesis pour traiter les photos en temps réel.
- D. Stocker et traiter les photos directement dans S3.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : B — Deux queues distinctes, polling prioritaire**

SQS **ne supporte pas la priorité par message** — c'est le piège central. Aucune option `priority` ou `weight` n'existe sur les messages d'une queue, qu'elle soit Standard ou FIFO. Pour gérer des niveaux de priorité différents, le pattern AWS est :
1. Créer une queue par niveau de priorité (ex : `requests-premium`, `requests-free`)
2. Configurer les workers pour poller d'abord la queue prioritaire
3. Ne passer à la queue moins prioritaire que si la première est vide

Pourquoi les autres sont faux :
- **A** : la "priorité de message" n'existe pas dans SQS — c'est inventé
- **C (Kinesis)** : Kinesis = streaming temps réel, pas du traitement de jobs vidéo asynchrones
- **D (S3)** : S3 stocke, ne traite pas — pas de logique de priorité

**Piège exam** : si une question SQS parle de "priority", "premium vs free", "tiered processing" → la réponse est **plusieurs queues**, jamais "ajouter une priorité au message".

📖 [Module 22 — Architectures distribuées](/courses/cloud-aws/aws_module_22_distributed.html)
</details>

---

## Question 67 — Bastion host pour accès admin

**Contexte** : Une web app multi-tier dans un VPC sans connexion au réseau corporate. Les admins se connectent via Internet pour gérer les EC2 (publics et privés). Un bastion host avec RDP a été ajouté. Comment limiter l'accès admin de manière sécurisée ?

- A. Bastion Windows dans le réseau corporate avec RDP vers les EC2.
- B. Bastion Windows avec EIP dans un **subnet privé**, RDP restreint aux IPs corporate.
- C. Bastion Windows avec EIP dans un **subnet public**, RDP restreint aux IPs corporate.
- D. Bastion Windows avec EIP dans un subnet public, **SSH** autorisé depuis n'importe où.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : C — Bastion en subnet public, RDP restreint aux IPs corporate**

Un bastion host doit être :
1. **En subnet public** avec une Elastic IP — sinon il est inaccessible depuis Internet
2. **Avec un Security Group qui restreint SSH/RDP aux IPs publiques connues** (jamais `0.0.0.0/0`)
3. **Dans le VPC**, pas dans le réseau corporate

Les SG des instances privées autorisent ensuite SSH/RDP **uniquement depuis le SG du bastion** (référence par SG ID, pas par IP).

Pourquoi les autres sont faux :
- **A** : un bastion dans le réseau corporate n'est pas une architecture AWS — le bastion appartient au VPC
- **B** : en subnet privé, le bastion n'a pas de route vers Internet entrant → impossible d'y accéder depuis l'extérieur
- **D** : SSH (port 22) est pour Linux. Un bastion **Windows** utilise **RDP** (port 3389). Et `0.0.0.0/0` est un défaut de sécurité majeur.

**Piège exam** : ne jamais confondre SSH (Linux) et RDP (Windows). Bastion = toujours subnet public + SG restreint aux IPs admin. Alternative moderne : **Systems Manager Session Manager** (sans bastion, sans port ouvert).

📖 [Module 20 — Zero Trust](/courses/cloud-aws/aws_module_20_security_zero_trust.html)
</details>

---

## Question 68 — ASG ne scale pas sur la mémoire

**Contexte** : Un ASG d'EC2 Linux + FSx for OpenZFS, monitoring CloudWatch basique. L'app est lente et l'ASG ne lance pas de nouvelles instances **alors que la RAM est saturée**. Que faire ?

- A. Installer le CloudWatch Agent unifié sur les EC2. Stocker la config dans **SSM Parameter Store**. Scaler l'ASG sur la métrique custom de mémoire agrégée.
- B. Utiliser Comprehend pour tracker la RAM en temps réel + SageMaker pour déclencher le scaling.
- C. Activer le **detailed monitoring** sur les EC2. Scaler l'ASG sur la mémoire agrégée.
- D. Utiliser Rekognition pour identifier la cause + Well-Architected Tool pour déclencher le scaling.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : A — CloudWatch Agent + SSM Parameter Store**

La RAM n'est **pas** une métrique CloudWatch par défaut — AWS ne peut pas la mesurer depuis l'hyperviseur. Sans agent, aucune métrique mémoire n'arrive à CloudWatch, donc l'ASG ne peut pas scaler dessus. La solution complète :
1. Installer le **CloudWatch Agent unifié** sur chaque EC2
2. Stocker la config de l'agent dans **SSM Parameter Store** pour la déployer uniformément à toutes les instances de l'ASG
3. Créer une scaling policy sur la métrique custom de mémoire agrégée

Pourquoi les autres sont faux :
- **C (detailed monitoring)** : augmente la fréquence (5 min → 1 min) des métriques **existantes** uniquement. N'ajoute pas la mémoire.
- **B (Comprehend / SageMaker)** : Comprehend = NLP sur du texte. SageMaker = build de modèles ML. Aucun rapport avec le monitoring d'instances.
- **D (Rekognition / Well-Architected)** : Rekognition = analyse d'images. Well-Architected Tool = revue d'architecture, ne déclenche aucun scaling.

**Piège exam** : "ASG ne scale pas malgré une RAM saturée" → CloudWatch Agent (toujours). Detailed monitoring **n'ajoute pas** de nouvelles métriques. Comprehend / Rekognition / SageMaker dans une question d'infra sont des distracteurs grossiers.

📖 [Module 07 — CloudWatch](/courses/cloud-aws/aws_module_07_cloudwatch.html) · [Module 09 — Auto Scaling](/courses/cloud-aws/aws_module_09_load_balancing.html)
</details>

---

## Question 69 — Hub réseau multi-régions multi-VPC + on-prem

**Contexte** : Centaines de VPC, multiples connexions VPN vers les datacenters, 5 régions AWS. Il faut **un seul gateway** qui interconnecte tout (VPC + VPN + on-prem) avec support du peering inter-région.

- A. Un **Transit Gateway par région** + peering entre les TGW.
- B. Direct Connect Gateway + LAG + Virtual Private Gateway dans chaque VPC + **public VIF** pour chaque DX vers le DXG.
- C. Inter-region VPC peering en réseau full-mesh sur le backbone AWS.
- D. AWS VPN CloudHub pour les VPC + Direct Connect Gateway pour le on-prem + **private VIF** vers le DXG.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : A — Un TGW par région + TGW peering inter-région**

Transit Gateway est conçu exactement pour ce cas : un hub central qui interconnecte VPC, VPN et Direct Connect dans une région. Pour le multi-régions, on déploie **un TGW par région** et on les relie via du **TGW peering inter-région** (le trafic reste sur le backbone AWS).

Pourquoi les autres sont faux :
- **B (public VIF)** : on ne peut **pas** connecter un Direct Connect à un Direct Connect Gateway via une **public VIF**. Pour accéder à un VPC via un DXG, il faut une **private VIF** (ou une transit VIF). Le LAG est juste de l'agrégation de bande passante, sans rapport avec le problème.
- **C (inter-region VPC peering)** : techniquement possible mais le nombre de peerings explose à grande échelle (peering non-transitif). Ne couvre pas les connexions on-prem.
- **D (VPN CloudHub)** : VPN CloudHub interconnecte **des bureaux distants en VPN** entre eux via un Virtual Private Gateway, **pas des VPC**. Mauvais service pour le scénario.

**Piège exam** : "centaines de VPC" + "multi-régions" + "on-prem" + "single gateway" → **TGW par région + peering inter-région**. Public VIF ne se connecte **pas** à un Direct Connect Gateway pour accéder à un VPC. VPN CloudHub = pour des sites distants, pas pour des VPC à grande échelle.

📖 [Module 27 — VPC avancé](/courses/cloud-aws/aws_module_27_vpc_advanced.html)
</details>

---

## Question 70 — Docker serverless avec ephemeral storage

**Contexte** : Une app packagée comme **image Docker dans ECR** doit être déployée sur un **fully managed serverless compute service** avec **5 GB d'ephemeral storage** pour du traitement temporaire.

- A. Lambda avec **container image support**, storage configuré à **5 GB**.
- B. ECS sur **Fargate**.
- C. Lambda avec container image, attacher un volume **EFS**.
- D. ECS sur **EC2 worker nodes** + EBS de 5 GB.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : A — Lambda avec container image + 5 GB ephemeral**

Lambda supporte les **container images depuis ECR** (jusqu'à 10 GB d'image) et le **stockage `/tmp` configurable de 512 MB à 10 GB**. C'est la seule option entièrement "fully managed serverless" parmi les choix : pas de cluster, pas de task definition, pas de réseau à configurer.

Pourquoi les autres sont faux :
- **B (Fargate)** : serverless au niveau compute mais nécessite cluster ECS, task definitions, services. Pas considéré "fully managed serverless" au sens strict de la question (Lambda l'est).
- **C (Lambda + EFS)** : EFS est un stockage **persistant partagé** — sur-dimensionné pour de l'**ephemeral**. Le `/tmp` configurable suffit.
- **D (ECS sur EC2)** : EC2 = pas serverless (gestion d'instances).

**Piège exam** : "fully managed serverless" + "Docker image / ECR" + "ephemeral storage" → **Lambda container image avec `/tmp` configurable**. EFS = persistant, pas éphémère. Fargate ≠ "fully managed" au sens strict.

📖 [Module 29 — Serverless avancé](/courses/cloud-aws/aws_module_29_lambda_advanced.html)
</details>

---

## Question 71 — Migrer des APIs REST vers AWS (cost-effective + scalable)

**Contexte** : Une boîte de jeux VR/AR a des APIs REST hébergées on-prem derrière un CDN. Elle migre vers AWS pour scaler et minimiser les coûts.

- A. **Lambda + API Gateway**.
- B. ECS + ECR + Fargate (microservices).
- C. APIs hébergées en S3 static + CloudFront.
- D. Spot Fleet EC2 + **EFA** + ALB.

<details>
<summary><strong>Voir la réponse</strong></summary>

**Réponse : A — Lambda + API Gateway**

Pour des APIs REST avec trafic variable, Lambda + API Gateway est la combinaison la plus cost-effective : facturation **à la requête + à la milliseconde**, scaling automatique, pas de serveur à gérer. Une instance EC2 qui tourne 24/7 est gaspillée pendant les périodes creuses.

Pourquoi les autres sont faux :
- **C (S3 static)** : S3 ne fait **que servir du statique** — aucune capacité d'exécuter du code REST. CloudFront ne change rien à ça.
- **B (ECS Fargate)** : viable mais **plus cher** et **plus complexe** que Lambda pour des APIs irrégulières (les tasks Fargate facturent même quand peu de trafic).
- **D (Spot Fleet + EFA)** : **EFA = adaptateur réseau pour HPC**, aucun rapport avec des APIs REST. Et un Spot Fleet sans Auto Scaling n'est pas scalable.

**Piège exam** : "API REST" + "scalable" + "cost-effective" + "trafic variable / irrégulier" → **Lambda + API Gateway** quasi systématiquement. EFA = HPC, pas REST. S3 = static, pas dynamique.

📖 [Module 18 — Serverless](/courses/cloud-aws/aws_module_18_serverless.html)
</details>

---

> **Dernière mise à jour** : Avril 2026 — 71 questions alignées sur le programme SAA-C03.
