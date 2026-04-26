---
layout: page
title: "Cheat Sheet AWS — Référence rapide SAA-C03"
course: cloud-aws
chapter_title: "Références"
chapter: 0
section: 1
tags: aws,cheatsheet,reference,saa-c03,exam
difficulty: intermediate
duration: 30
mermaid: true
status: published
next_module: "/courses/cloud-aws/aws_glossaire_services.html"
next_module_title: "Glossaire des services AWS — Dictionnaire SAA-C03"
---

# Cheat Sheet AWS — Référence rapide SAA-C03

> Mémo condensé de tous les services, patterns et bonnes pratiques abordés dans ce cours.
> Chaque section renvoie vers le module détaillé pour approfondir.

---

## 1. Compute

### EC2 — Instances à la demande

| Élément | Détail |
|---------|--------|
| AMI | Image machine (Amazon Linux, Ubuntu, Windows…) |
| Type d'instance | Famille + taille : `t3.micro`, `m5.large`, `c6g.xlarge` |
| User Data | Script bash exécuté au 1er boot (bootstrap) |
| Security Group | Firewall stateful au niveau instance (règles inbound/outbound) |
| Key Pair | Clé SSH pour accès distant (ED25519 ou RSA) |
| ENI | Elastic Network Interface — carte réseau virtuelle |
| EIP | Elastic IP — IP publique statique |

**Options d'achat :**

| Option | Économie | Engagement | Cas d'usage |
|--------|----------|------------|-------------|
| On-Demand | 0 % | Aucun | Dev, test, workloads imprévisibles |
| Reserved (RI) | ~72 % | 1 ou 3 ans | Workloads stables et prévisibles |
| Savings Plans | ~72 % | $/h sur 1-3 ans | Flexibilité multi-instance/région |
| Spot | ~90 % | Aucun (interruptible) | Batch, CI, traitement tolérant aux pannes |
| Dedicated Host | Variable | 1-3 ans | Licences BYOL, compliance |

📖 [Module 03 — EC2](/courses/cloud-aws/aws_module_03_ec2.html)

### Auto Scaling

| Concept | Description |
|---------|-------------|
| Launch Template | Config d'instance réutilisable (AMI, type, SG, User Data) |
| ASG (Auto Scaling Group) | Groupe d'instances avec min/max/desired capacity |
| Scaling Policy — Target Tracking | Maintenir une métrique cible (ex : CPU à 50 %) |
| Scaling Policy — Step | Actions par paliers de seuil |
| Scaling Policy — Scheduled | Montée/descente à horaires fixes |
| Cooldown | Période d'attente entre deux actions de scaling |
| Health Check | EC2 (état instance) ou ELB (réponse HTTP) |

📖 [Module 09 — Load Balancing & Auto Scaling](/courses/cloud-aws/aws_module_09_load_balancing.html)

### Elastic Beanstalk

- PaaS (Platform as a Service) : déploiement web simplifié
- Gère automatiquement EC2, ASG, ELB, RDS
- Supporte Java, .NET, PHP, Node.js, Python, Docker
- Idéal pour les développeurs qui ne veulent pas gérer l'infra

📖 [Module 13 — IaC](/courses/cloud-aws/aws_module_13_iac.html)

---

## 2. Storage

### S3 — Object Storage

| Classe | Disponibilité | Cas d'usage | Coût stockage/Go/mois |
|--------|---------------|-------------|----------------------|
| S3 Standard | 99,99 % | Données fréquemment accédées | ~0,023 $ |
| S3 Standard-IA | 99,9 % | Accès peu fréquent, récupération rapide | ~0,0125 $ |
| S3 One Zone-IA | 99,5 % | Données reproductibles, accès rare | ~0,01 $ |
| S3 Glacier Instant | 99,9 % | Archive avec accès en millisecondes | ~0,004 $ |
| S3 Glacier Flexible | 99,99 % | Archive, récupération en minutes/heures | ~0,0036 $ |
| S3 Glacier Deep Archive | 99,99 % | Archive long terme (7-10 ans) | ~0,00099 $ |
| S3 Intelligent-Tiering | 99,9 % | Pattern d'accès imprévisible | Auto-optimisé |

> **Note** : les prix sont indicatifs (région us-east-1). Le coût de stockage baisse avec la classe, mais les frais de récupération (retrieval) augmentent — Deep Archive coûte très peu à stocker mais la récupération prend 12-48h et est facturée par Go récupéré. Les classes IA facturent aussi un minimum de 30 jours de stockage par objet.

**Fonctions clés :**

| Fonction | Rôle |
|----------|------|
| Versioning | Conserver toutes les versions d'un objet |
| Lifecycle Rules | Transition automatique entre classes / expiration |
| Bucket Policy | Permissions JSON au niveau bucket |
| ACL | Permissions objet/bucket (legacy, désactivé par défaut) |
| S3 Object Lock | WORM (Write Once Read Many) — compliance |
| MFA Delete | Suppression protégée par MFA |
| Cross-Region Replication (CRR) | Réplication inter-régions (DR, latence) |
| Same-Region Replication (SRR) | Réplication même région (logs, compliance) |
| Transfer Acceleration | Upload rapide via edge locations CloudFront |
| Presigned URL | Accès temporaire signé à un objet privé |
| Access Points | Points d'accès nommés avec policies dédiées |
| S3 Select / Glacier Select | Requêtes SQL sur objets (filtrage côté serveur) |

📖 [Module 04 — Stockage](/courses/cloud-aws/aws_module_04_storage.html) · [Module 26 — S3 avancé](/courses/cloud-aws/aws_module_26_s3_advanced.html)

### EBS — Block Storage

| Type | IOPS max | Débit max | Cas d'usage |
|------|----------|-----------|-------------|
| gp3 | 16 000 | 1 000 Mo/s | Usage général (défaut recommandé) |
| gp2 | 16 000 | 250 Mo/s | Usage général (burst basé sur crédit) |
| io2 Block Express | 256 000 | 4 000 Mo/s | BDD haute performance, IOPS intensif |
| io1 | 64 000 | 1 000 Mo/s | BDD haute performance |
| st1 | 500 | 500 Mo/s | Big data, logs (séquentiel) |
| sc1 | 250 | 250 Mo/s | Archive froide, accès rare |

> **Rappel** : EBS est attaché à une seule instance, dans une seule AZ. Snapshot pour copier entre AZ/régions.

### EFS — File Storage

- NFS managé, multi-AZ, élastique (taille auto)
- Modes : General Purpose vs Max I/O
- Classes : Standard / Infrequent Access (IA)
- Compatible Linux uniquement (pas Windows → utiliser FSx)

📖 [Module 04 — Stockage](/courses/cloud-aws/aws_module_04_storage.html)

### Autres stockages

| Service | Type | Cas d'usage |
|---------|------|-------------|
| FSx for Windows | SMB/NTFS managé | Workloads Windows, Active Directory |
| FSx for Lustre | HPC parallèle | Machine Learning, traitement massif |
| Storage Gateway | Hybride on-prem ↔ S3 | Extension stockage datacenter |
| AWS Backup | Sauvegarde centralisée | Backup multi-services (EBS, RDS, S3, EFS…) |
| Snow Family | Transfert physique | Migration massive de données (Snowball, Snowmobile) |

📖 [Module 32 — Migration](/courses/cloud-aws/aws_module_32_migration.html)

---

## 3. Database

| Service | Type | Cas d'usage | Scaling |
|---------|------|-------------|---------|
| RDS | Relationnel managé (MySQL, PostgreSQL, MariaDB, Oracle, SQL Server) | Applications web classiques | Vertical + Read Replicas |
| Aurora | Relationnel haute perf (MySQL/PostgreSQL compatible) | Workloads critiques, 5× perf MySQL | Auto-scaling storage (128 To), jusqu'à 15 replicas |
| Aurora Serverless | Relationnel serverless | Workloads intermittents/imprévisibles | Capacité auto (ACU) |
| DynamoDB | NoSQL clé-valeur/document | Temps de réponse < 10 ms, scale infini | Auto-scaling, à la demande ou provisionné |
| ElastiCache | Cache in-memory (Redis/Memcached) | Sessions, classements, résultats fréquents | Horizontal (cluster mode) |
| Redshift | Data warehouse | Analytique, BI, requêtes complexes | Nodes compute |
| Neptune | Graph DB | Réseaux sociaux, knowledge graphs | Read Replicas |
| DocumentDB | Compatible MongoDB | Migration MongoDB vers AWS | Auto-scaling |
| Keyspaces | Compatible Cassandra | Workloads Cassandra à scale | Serverless |
| QLDB | Ledger immuable | Audit, traçabilité, finance | Serverless |

**Choisir le bon moteur :**

```
Relationnel classique ? → RDS
  └─ Haute perf / Aurora compatible ? → Aurora
NoSQL clé-valeur ? → DynamoDB
Cache in-memory ? → ElastiCache
Analytique / BI ? → Redshift
Graph ? → Neptune
Ledger immuable ? → QLDB
Migration MongoDB ? → DocumentDB
Migration Cassandra ? → Keyspaces
```

📖 [Module 10 — Databases](/courses/cloud-aws/aws_module_10_databases.html) · [Module 19 — Performance](/courses/cloud-aws/aws_module_19_performance.html)

---

## 4. Networking

### VPC — Réseau privé virtuel

| Composant | Rôle |
|-----------|------|
| VPC | Réseau isolé (CIDR block, ex : 10.0.0.0/16) |
| Subnet public | Sous-réseau avec route vers Internet Gateway |
| Subnet privé | Sous-réseau sans accès direct depuis Internet |
| Internet Gateway (IGW) | Passerelle Internet pour le VPC |
| NAT Gateway | Accès Internet sortant pour subnets privés |
| Route Table | Table de routage (destination → target) |
| NACL | Firewall stateless au niveau subnet (règles numérotées) |
| Security Group | Firewall stateful au niveau ENI/instance |
| VPC Endpoint Gateway | Accès privé à S3 / DynamoDB (pas d'Internet) |
| VPC Endpoint Interface | Accès privé via PrivateLink à d'autres services |

**SG vs NACL :**

| Critère | Security Group | NACL |
|---------|---------------|------|
| Niveau | Instance (ENI) | Subnet |
| État | Stateful | Stateless |
| Règles | Allow uniquement | Allow + Deny |
| Évaluation | Toutes les règles | Ordre numérique |
| Par défaut | Tout bloqué (inbound) | Tout autorisé |

📖 [Module 05 — VPC](/courses/cloud-aws/aws_module_05_vpc.html)

### Connectivité avancée

| Service | Description | Cas d'usage |
|---------|-------------|-------------|
| VPC Peering | Connexion privée entre 2 VPC (non transitif) | Communication inter-VPC |
| Transit Gateway | Hub central multi-VPC + on-prem | Architectures multi-VPC à grande échelle |
| Site-to-Site VPN | Tunnel IPsec vers on-prem via Internet | Connexion sécurisée rapide à déployer |
| AWS Client VPN | VPN client-to-site | Accès distant des employés |
| Direct Connect | Fibre dédiée AWS ↔ on-prem | Latence faible, débit élevé, compliance |
| Direct Connect Gateway | Direct Connect multi-régions | Un DX vers plusieurs VPC |
| PrivateLink | Exposer un service en privé entre VPC | SaaS privé, micro-services inter-comptes |

📖 [Module 27 — VPC avancé](/courses/cloud-aws/aws_module_27_vpc_advanced.html)

### DNS & CDN

| Service | Rôle |
|---------|------|
| Route 53 | DNS managé + health checks + routing policies |
| CloudFront | CDN — cache global via edge locations |
| Global Accelerator | Routing réseau optimisé via le backbone AWS |

**Route 53 — Routing Policies :**

| Policy | Comportement |
|--------|-------------|
| Simple | 1 enregistrement → 1 (ou plusieurs) valeurs |
| Weighted | Répartition par poids (ex : 70/30) |
| Latency | Route vers la région la plus proche |
| Failover | Active/passive avec health check |
| Geolocation | Route par pays/continent de l'utilisateur |
| Geoproximity | Route par proximité géographique (avec bias) |
| Multi-value | Comme Simple mais avec health checks |

📖 [Module 11 — DNS & CDN](/courses/cloud-aws/aws_module_11_dns_cdn.html)

### Load Balancing

| Type | Couche | Protocoles | Cas d'usage |
|------|--------|------------|-------------|
| ALB (Application) | 7 | HTTP/HTTPS, WebSocket | Micro-services, routing par path/host |
| NLB (Network) | 4 | TCP, UDP, TLS | Ultra-haute perf, IP statique |
| GLB (Gateway) | 3 | IP | Appliances réseau (firewall, IDS) |
| CLB (Classic) | 4/7 | HTTP/TCP | Legacy — ne plus utiliser |

📖 [Module 09 — Load Balancing](/courses/cloud-aws/aws_module_09_load_balancing.html)

---

## 5. Security & Identity

### IAM — Gestion des identités

| Concept | Description |
|---------|-------------|
| User | Identité humaine avec credentials permanents |
| Group | Regroupement d'users pour attacher des policies |
| Role | Identité assumable (EC2, Lambda, cross-account…) |
| Policy | Document JSON : Effect + Action + Resource + Condition |
| MFA | Authentification multi-facteur (virtual/hardware) |
| Access Key | Credentials programmatiques (CLI, SDK) |
| STS | Security Token Service — credentials temporaires |
| Permission Boundary | Limite maximale de permissions d'un user/role |
| SCP | Service Control Policy — limite au niveau Organizations |

**Évaluation des permissions :**

```
1. Deny explicite ?      → DENY (fin)
2. SCP autorise ?        → Continuer (sinon DENY)
3. Permission Boundary ? → Continuer (sinon DENY)
4. Policy autorise ?     → ALLOW
5. Sinon                 → DENY (implicit)
```

📖 [Module 02 — IAM](/courses/cloud-aws/aws_module_02_iam.html) · [Module 28 — IAM avancé](/courses/cloud-aws/aws_module_28_iam_advanced.html)

### Encryption & Key Management

| Service | Rôle |
|---------|------|
| KMS | Gestion clés de chiffrement (CMK) — AES-256 |
| CloudHSM | HSM dédié — contrôle total des clés |
| ACM | Certificats TLS/SSL gratuits (public) ou privés |
| Secrets Manager | Stockage et rotation automatique de secrets |
| SSM Parameter Store | Stockage de config/secrets (gratuit, moins de features) |

**Chiffrement at-rest vs in-transit :**

| Couche | Mécanisme |
|--------|-----------|
| At-rest (S3) | SSE-S3, SSE-KMS, SSE-C, client-side |
| At-rest (EBS) | Encryption KMS au niveau volume |
| At-rest (RDS) | Encryption KMS (activé à la création) |
| In-transit | TLS/SSL, HTTPS, VPN |

📖 [Module 08 — Sécurité](/courses/cloud-aws/aws_module_08_security.html) · [Module 12 — Sécurité avancée](/courses/cloud-aws/aws_module_12_security_advanced.html)

### Protection & Détection

| Service | Rôle |
|---------|------|
| WAF | Firewall applicatif (Layer 7) — règles HTTP |
| Shield Standard | Protection DDoS gratuite (Layer 3/4) |
| Shield Advanced | Protection DDoS premium + support 24/7 |
| GuardDuty | Détection de menaces (ML sur logs VPC/DNS/CloudTrail) |
| Inspector | Scan de vulnérabilités (EC2, ECR, Lambda) |
| Macie | Détection de données sensibles dans S3 (PII) |
| Detective | Investigation de sécurité (analyse de root cause) |
| Network Firewall | Firewall réseau managé (VPC, Layer 3-7) |
| Firewall Manager | Gestion centralisée WAF/Shield/SG multi-comptes |

📖 [Module 12 — Sécurité avancée](/courses/cloud-aws/aws_module_12_security_advanced.html) · [Module 20 — Zero Trust](/courses/cloud-aws/aws_module_20_security_zero_trust.html)

### Identity Federation

| Service | Rôle |
|---------|------|
| IAM Identity Center (SSO) | SSO centralisé pour accès multi-comptes AWS |
| Cognito User Pool | Authentification utilisateurs (sign-up/sign-in, MFA) |
| Cognito Identity Pool | Credentials AWS temporaires pour users authentifiés |
| Directory Service | AD managé / AD Connector vers on-prem |

📖 [Module 28 — IAM avancé](/courses/cloud-aws/aws_module_28_iam_advanced.html) · [Module 29 — Serverless avancé](/courses/cloud-aws/aws_module_29_lambda_advanced.html)

---

## 6. Serverless

| Service | Rôle | Limites clés |
|---------|------|--------------|
| Lambda | Exécution de code sans serveur | 15 min timeout, 10 Go RAM, 250 Mo deploy (500 Mo unzipped) |
| API Gateway | API REST/HTTP/WebSocket managée | 29 s timeout, 10 Mo payload |
| Step Functions | Orchestration de workflows (state machine) | Standard (1 an max) / Express (5 min, haut débit) |
| EventBridge | Bus d'événements serverless | Règles, patterns, targets multi-services |
| AppSync | API GraphQL managée | Temps réel via subscriptions |
| Fargate | Compute serverless pour conteneurs | Pas d'accès à l'hôte, pricing par vCPU/RAM |

**Lambda — Concurrency :**

| Type | Description |
|------|-------------|
| Unreserved | Pool partagé par défaut (1 000 par région) |
| Reserved | Concurrence réservée (garantie, pas de cold start garanti) |
| Provisioned | Instances pré-chauffées (pas de cold start) |

📖 [Module 18 — Serverless](/courses/cloud-aws/aws_module_18_serverless.html) · [Module 29 — Serverless avancé](/courses/cloud-aws/aws_module_29_lambda_advanced.html)

---

## 7. Containers

| Service | Description |
|---------|-------------|
| ECS | Orchestrateur de conteneurs AWS natif |
| EKS | Kubernetes managé |
| Fargate | Compute serverless pour ECS/EKS |
| ECR | Registry Docker privé |

**ECS vs EKS :**

| Critère | ECS | EKS |
|---------|-----|-----|
| Orchestrateur | Propriétaire AWS | Kubernetes |
| Complexité | Simple | Plus complexe |
| Portabilité | AWS uniquement | Multi-cloud/on-prem |
| Coût control plane | Gratuit | ~74 $/mois |
| Launch type | EC2 ou Fargate | EC2 ou Fargate |

📖 [Module 25 — Containers](/courses/cloud-aws/aws_module_25_containers.html)

---

## 8. Monitoring & Observability

| Service | Rôle |
|---------|------|
| CloudWatch Metrics | Métriques (CPU, réseau, custom…) |
| CloudWatch Logs | Centralisation des logs |
| CloudWatch Alarms | Alertes sur métriques (SNS, Auto Scaling) |
| CloudWatch Dashboards | Tableaux de bord visuels |
| CloudWatch Events / EventBridge | Réaction aux événements AWS |
| CloudTrail | Audit de tous les appels API AWS |
| X-Ray | Tracing distribué (latence, erreurs) |
| AWS Config | Historique de conformité des ressources |

**CloudWatch Alarms — États :** `OK` → `INSUFFICIENT_DATA` → `ALARM`

**CloudTrail — Types d'événements :**
- Management Events : actions sur les ressources AWS (activé par défaut)
- Data Events : actions sur les données (S3 GetObject, Lambda Invoke — à activer)
- Insights Events : détection d'activité anormale

📖 [Module 07 — CloudWatch](/courses/cloud-aws/aws_module_07_cloudwatch.html) · [Module 15 — Observabilité](/courses/cloud-aws/aws_module_15_observability.html)

---

## 9. Infrastructure as Code

| Service | Type | Langage | État |
|---------|------|---------|------|
| CloudFormation | AWS natif | YAML/JSON | Stack-based |
| Terraform | Multi-cloud | HCL | State file |
| CDK | AWS, haut niveau | TypeScript, Python… | Synthétise en CloudFormation |
| SAM | Serverless AWS | YAML (extension CF) | Stack-based |

**CloudFormation — Sections clés :**

```yaml
AWSTemplateFormatVersion: "2010-09-09"
Description: "Template description"
Parameters:     # Inputs dynamiques
Mappings:       # Lookup tables statiques
Conditions:     # Logique conditionnelle
Resources:      # ⚠ OBLIGATOIRE — ressources à créer
Outputs:        # Valeurs exportées (cross-stack)
```

📖 [Module 13 — IaC](/courses/cloud-aws/aws_module_13_iac.html)

---

## 10. Application Integration

| Service | Modèle | Cas d'usage |
|---------|--------|-------------|
| SQS | Queue (point-to-point) | Découplage, buffering, traitement asynchrone |
| SNS | Pub/Sub (fan-out) | Notifications, alertes, distribution multi-cibles |
| EventBridge | Event bus (rules + patterns) | Événements inter-services, SaaS |
| Amazon MQ | Message broker (ActiveMQ/RabbitMQ) | Migration d'applications on-prem |
| Step Functions | Orchestration de workflows | Pipelines complexes, saga pattern |
| AppFlow | Intégration SaaS ↔ AWS | Salesforce, Slack, SAP → S3/Redshift |

**SQS — Standard vs FIFO :**

| Critère | Standard | FIFO |
|---------|----------|------|
| Ordre | Best-effort | Garanti (FIFO) |
| Débit | Illimité | 300 msg/s (3 000 avec batching) |
| Duplicates | Possibles | Exactly-once |
| Nom | Libre | Doit finir par `.fifo` |

📖 [Module 22 — Architectures distribuées](/courses/cloud-aws/aws_module_22_distributed.html)

---

## 11. Data & Analytics

| Service | Rôle | Requêtes |
|---------|------|----------|
| Athena | Query S3 avec SQL (serverless) | SQL standard (Presto) |
| Redshift | Data warehouse (colonnes) | SQL, BI, joins massifs |
| Kinesis Data Streams | Ingestion temps réel | Consumers (Lambda, EC2) |
| Kinesis Data Firehose | Livraison temps réel vers S3/Redshift | Transformation + destination |
| Glue | ETL serverless + Catalog | Spark, crawlers |
| QuickSight | BI / Visualisation | Dashboards, ML insights |
| EMR | Hadoop/Spark managé | Big data, machine learning |
| Lake Formation | Gouvernance data lake | Fine-grained access control sur S3 |
| OpenSearch | Recherche et analytique (Elasticsearch) | Full-text search, logs |

📖 [Module 30 — Data Services](/courses/cloud-aws/aws_module_30_data_services.html)

---

## 12. Migration & Transfer

| Service | Cas d'usage |
|---------|-------------|
| DMS (Database Migration Service) | Migration BDD homogène ou hétérogène |
| SCT (Schema Conversion Tool) | Conversion de schéma BDD (Oracle → Aurora…) |
| MGN (Application Migration Service) | Lift-and-shift de serveurs (rehost) |
| Snowball / Snowball Edge | Transfert physique de données (To → Po) |
| Snowmobile | Transfert par camion (exaoctets) |
| DataSync | Transfert automatisé on-prem → AWS (NFS/SMB → S3/EFS) |
| Transfer Family | SFTP/FTPS/FTP managé vers S3/EFS |
| AWS Backup | Sauvegarde centralisée multi-services |

**Arbre de décision migration :**

```
Données < 10 To ? → DataSync / Transfer Family
Données 10-80 To ? → Snowball
Données > 80 To ? → Snowball Edge (x plusieurs)
Données > 10 Po ? → Snowmobile
BDD → BDD ? → DMS (+ SCT si hétérogène)
Serveurs entiers ? → MGN (lift-and-shift)
```

📖 [Module 32 — Migration](/courses/cloud-aws/aws_module_32_migration.html)

---

## 13. Cost Management

| Service | Rôle |
|---------|------|
| AWS Budgets | Alertes sur dépassement de budget |
| Cost Explorer | Analyse et prévision des coûts |
| Cost and Usage Report (CUR) | Rapport détaillé (CSV vers S3) |
| Savings Plans | Engagement $/h pour réduction (EC2, Lambda, Fargate) |
| Compute Optimizer | Recommandations de rightsizing |
| Trusted Advisor | Checks automatiques (coût, sécurité, perf, limits) |

**Leviers d'économie — par ordre d'impact :**

1. **Rightsizing** — adapter le type d'instance au besoin réel
2. **Reserved / Savings Plans** — engagement pour workloads stables
3. **Spot Instances** — workloads tolérants aux interruptions
4. **S3 Lifecycle** — archiver automatiquement les données froides
5. **Auto Scaling** — ajuster la capacité à la demande
6. **Nettoyage** — supprimer les EIP non attachées, EBS orphelins, snapshots inutiles

📖 [Module 21 — FinOps](/courses/cloud-aws/aws_module_21_finops.html)

---

## 14. Governance & Management

| Service | Rôle |
|---------|------|
| Organizations | Multi-comptes avec SCP et consolidated billing |
| Control Tower | Landing Zone automatisée + guardrails |
| Service Catalog | Catalogue de produits approuvés (CloudFormation) |
| Systems Manager | Gestion opérationnelle (patch, run command, parameter store) |
| AWS Config | Conformité continue (rules, remediation) |
| CloudFormation StackSets | Déploiement multi-comptes/régions |
| License Manager | Suivi des licences logicielles |
| Well-Architected Tool | Évaluation contre les 6 piliers |

**6 piliers Well-Architected :**

| Pilier | Focus |
|--------|-------|
| Operational Excellence | Automatisation, observabilité, amélioration continue |
| Security | IAM, encryption, détection, protection |
| Reliability | Résilience, failover, disaster recovery |
| Performance Efficiency | Bon service pour le bon besoin, scaling |
| Cost Optimization | Éliminer le gaspillage, rightsizing |
| Sustainability | Réduire l'empreinte environnementale |

📖 [Module 24 — Governance](/courses/cloud-aws/aws_module_24_governance.html) · [Module 16 — Multi-environnement](/courses/cloud-aws/aws_module_16_multi_env.html)

---

## 15. Haute disponibilité & Disaster Recovery

### Patterns HA

| Pattern | Description |
|---------|-------------|
| Multi-AZ | Déploiement sur 2+ AZ (ELB + ASG) |
| Multi-Region | Déploiement sur 2+ régions (Route 53 failover) |
| Active-Active | Trafic réparti sur toutes les régions |
| Active-Passive | Région standby activée en cas de panne |

### Stratégies DR (du moins cher au plus rapide)

| Stratégie | RTO | RPO | Coût |
|-----------|-----|-----|------|
| Backup & Restore | Heures | Heures | $ |
| Pilot Light | Minutes | Minutes | $$ |
| Warm Standby | Minutes | Secondes | $$$ |
| Multi-Site Active-Active | Temps réel | Temps réel | $$$$ |

📖 [Module 17 — Haute disponibilité](/courses/cloud-aws/aws_module_17_ha.html) · [Module 23 — Résilience](/courses/cloud-aws/aws_module_23_resilience.html)

---

## 16. Machine Learning (overview SAA-C03)

| Service | Fonction |
|---------|----------|
| SageMaker | Plateforme ML complète (build, train, deploy) |
| Rekognition | Analyse d'images et vidéos |
| Transcribe | Speech-to-text |
| Polly | Text-to-speech |
| Translate | Traduction automatique |
| Lex | Chatbots conversationnels (= Alexa) |
| Comprehend | NLP — analyse de sentiments, entités |
| Textract | Extraction de texte/données depuis documents |
| Forecast | Prévisions temporelles |
| Kendra | Recherche intelligente dans des documents |
| Fraud Detector | Détection de fraude en ligne |
| Personalize | Recommandations personnalisées |

📖 [Module 33 — ML Overview](/courses/cloud-aws/aws_module_33_ml_overview.html)

---

## 17. Patterns d'architecture clés (SAA-C03)

### Découplage

```
Synchrone :  Client → ALB → EC2
Asynchrone : Client → API GW → SQS → Lambda → DynamoDB
Fan-out :    SNS → SQS (queue 1) + SQS (queue 2) + Lambda
```

### Caching multi-niveaux

```
Client → CloudFront (edge cache)
       → API Gateway (cache intégré)
       → ElastiCache (application cache)
       → RDS / DynamoDB (source)
```

### Event-driven

```
S3 event → Lambda → DynamoDB
EventBridge rule → Step Functions → Lambda + SNS
DynamoDB Streams → Lambda → OpenSearch
```

### Serverless web app

```
Route 53 → CloudFront → S3 (static)
                       → API Gateway → Lambda → DynamoDB
                       → Cognito (auth)
```

### Hybrid connectivity

```
On-prem → Site-to-Site VPN (rapide) → VPC
On-prem → Direct Connect (performant) → VPC
Multi-VPC → Transit Gateway (hub)
```

📖 [Module 31 — Patterns d'architecture](/courses/cloud-aws/aws_module_31_architecture_patterns.html)

---

## 18. Aide-mémoire examen SAA-C03

### Réflexes par mot-clé dans l'énoncé

| Mot-clé dans la question | Penser à… |
|--------------------------|-----------|
| "highly available" | Multi-AZ, ELB, ASG, Route 53 failover |
| "fault tolerant" | Multi-AZ + auto-recovery, DR strategy |
| "cost-effective" / "minimize cost" | Spot, Reserved, S3 IA/Glacier, rightsizing |
| "decouple" / "loosely coupled" | SQS, SNS, EventBridge |
| "real-time" / "streaming" | Kinesis Data Streams |
| "near real-time" | Kinesis Firehose |
| "serverless" | Lambda, Fargate, DynamoDB, S3, API Gateway |
| "migrate database" | DMS (+SCT si hétérogène) |
| "migrate servers" | MGN (lift-and-shift) |
| "on-premises connectivity" | VPN (rapide) ou Direct Connect (performant) |
| "encrypt at rest" | KMS, SSE-S3, SSE-KMS |
| "encrypt in transit" | TLS/SSL, HTTPS, VPN |
| "compliance" / "audit" | CloudTrail, Config, Macie, GuardDuty |
| "least privilege" | IAM policies, SCP, Permission Boundary |
| "static website" | S3 + CloudFront + Route 53 |
| "session data" | ElastiCache Redis, DynamoDB |
| "temporary credentials" | STS AssumeRole, Cognito |
| "cross-account" | STS AssumeRole, Resource-based policy |
| "large file transfer" | S3 Transfer Acceleration, Snow Family |
| "FIFO ordering" | SQS FIFO |
| "fan-out" | SNS + SQS |
| "GraphQL" | AppSync |
| "search" | OpenSearch |
| "ETL" | Glue |
| "query S3 directly" | Athena |
| "machine learning" | SageMaker |

---

> **Dernière mise à jour** : Avril 2026 — Aligné sur le cours Coursite Cloud & AWS (33 modules).
