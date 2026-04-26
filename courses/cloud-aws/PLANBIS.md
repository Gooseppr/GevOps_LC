---
published: false
---

# Cours : cloud-aws — Compléments SAA-C03

> Modules complémentaires pour couvrir l'intégralité du syllabus AWS Solutions Architect Associate.
> Ces modules viennent **enrichir** les modules 01-24 existants, pas les remplacer.
> Les numéros reprennent la suite (25+).

---

## Stratégie d'intégration

Certains sujets manquants sont des **extensions de modules existants** (marqués `enrichit: module_XX`).
D'autres sont des **modules entièrement nouveaux**.
Pour les extensions, deux options :
1. Ajouter des sections au module existant s'il reste raisonnable en taille
2. Créer un module satellite (ex: `aws_module_04b_s3_advanced`)

---

```yaml
# ============================================================
# EXTENSIONS DE MODULES EXISTANTS
# ============================================================

# --- S3 avancé (gros trou, forte pondération à l'examen) ---
- id: "aws_module_04b_s3_advanced"
  title: "S3 avancé — Réplication, Performance, Sécurité"
  enrichit: aws_module_04_storage
  level: 2
  template: data
  priority: critical
  status: planned
  contenu:
    - S3 Replication (CRR / SRR) et cas d'usage
    - S3 Event Notifications (vers SQS, SNS, Lambda)
    - S3 Performance (multipart upload, Transfer Acceleration, byte-range fetches)
    - S3 Pre-signed URLs
    - S3 CORS
    - S3 MFA Delete
    - S3 Access Logs
    - S3 Access Points et Object Lambda
    - S3 Object Lock et Glacier Vault Lock
    - S3 Storage Lens et Batch Operations
    - S3 Requester Pays
    - S3 Express One Zone

# --- ELB avancé ---
- id: "aws_module_09b_elb_advanced"
  title: "ELB avancé — GWLB, Sticky Sessions, SSL, Cross-Zone"
  enrichit: aws_module_09_load_balancing
  level: 2
  template: networking
  priority: high
  status: planned
  contenu:
    - Gateway Load Balancer (GWLB) — appliances réseau, inspection
    - Sticky Sessions (affinité de session)
    - Cross-Zone Load Balancing
    - SSL/TLS Certificates sur ELB (SNI, ACM)
    - Connection Draining / Deregistration Delay

# --- EC2 avancé ---
- id: "aws_module_03b_ec2_advanced"
  title: "EC2 avancé — Purchasing Options, Placement Groups, Hibernate"
  enrichit: aws_module_03_ec2
  level: 2
  template: concept
  priority: high
  status: planned
  contenu:
    - EC2 Purchasing Options (On-Demand, Reserved, Savings Plans, Spot, Dedicated)
    - Spot Instances & Spot Fleet en détail
    - Placement Groups (Cluster, Spread, Partition)
    - Elastic IPs (Private vs Public vs Elastic)
    - EC2 Hibernate
    - EC2 Instance Store vs EBS
    - EBS Multi-Attach
    - EBS Encryption en détail

# --- VPC avancé (gros trou, forte pondération) ---
- id: "aws_module_05b_vpc_advanced"
  title: "VPC avancé — Peering, VPN, Direct Connect, Transit Gateway"
  enrichit: aws_module_05_vpc
  level: 2
  template: networking
  priority: critical
  status: planned
  contenu:
    - VPC Peering (inter-VPC, cross-account, cross-region)
    - VPC Flow Logs (analyse avec Athena)
    - Bastion Hosts
    - NAT Instances vs NAT Gateway (comparaison détaillée)
    - Site-to-Site VPN + Virtual Private Gateway + Customer Gateway
    - Direct Connect + Direct Connect Gateway
    - Transit Gateway
    - VPC Traffic Mirroring
    - IPv6 pour VPC + Egress-only Internet Gateway
    - Networking Costs in AWS
    - AWS Network Firewall

# --- Databases avancé ---
- id: "aws_module_10b_databases_advanced"
  title: "Bases de données AWS avancé — RDS Proxy, DocumentDB, Neptune, Timestream"
  enrichit: aws_module_10_databases
  level: 2
  template: data
  priority: medium
  status: planned
  contenu:
    - RDS Proxy (pooling, failover, IAM auth)
    - RDS Custom (Oracle, SQL Server)
    - RDS & Aurora Backup et Monitoring (détail)
    - RDS Security (encryption, IAM auth, SSL)
    - DocumentDB (MongoDB compatible)
    - Amazon Neptune (graph database)
    - Amazon Keyspaces (Cassandra)
    - Amazon Timestream (time series)
    - ElastiCache pour Solutions Architects (stratégies de caching)

# --- Lambda avancé ---
- id: "aws_module_18b_serverless_advanced"
  title: "Serverless avancé — Limits, Concurrency, Lambda@Edge, Step Functions, Cognito"
  enrichit: aws_module_18_serverless
  level: 3
  template: devops
  priority: high
  status: planned
  contenu:
    - Lambda Limits (mémoire, timeout, package, /tmp)
    - Lambda Concurrency (reserved, provisioned)
    - Lambda SnapStart
    - Lambda@Edge & CloudFront Functions
    - Lambda in VPC (ENI, cold start impact)
    - RDS Invoking Lambda & Event Notifications
    - Step Functions (orchestration de workflows)
    - Amazon Cognito (User Pools, Identity Pools, auth flows)
    - DynamoDB Advanced (DAX, Streams, Global Tables, indexes)

# --- Security avancé ---
- id: "aws_module_12b_security_extra"
  title: "Sécurité AWS extra — GuardDuty, Inspector, Macie, CloudHSM, ACM"
  enrichit: aws_module_12_security_advanced
  level: 2
  template: devops
  priority: high
  status: planned
  contenu:
    - Amazon GuardDuty (détection de menaces, sources de données)
    - Amazon Inspector (vulnérabilités EC2, Lambda, ECR)
    - Amazon Macie (détection de données sensibles dans S3)
    - AWS CloudHSM (HSM dédié vs KMS)
    - AWS Certificate Manager (ACM) — provisionnement SSL/TLS
    - Firewall Manager (gestion centralisée WAF/SG/NACL)
    - DDoS Protection Best Practices (architecture complète)

# --- IAM avancé ---
- id: "aws_module_02b_iam_advanced"
  title: "IAM avancé — Identity Center, Directory Services, Control Tower, Policy Logic"
  enrichit: aws_module_02_iam
  level: 2
  template: devops
  priority: high
  status: planned
  contenu:
    - IAM Advanced Policies (conditions, variables, boundaries)
    - Resource-based Policies vs IAM Roles (cross-account)
    - IAM Policy Evaluation Logic (flux complet)
    - AWS IAM Identity Center (ex-SSO)
    - AWS Directory Services (AD Connector, Managed AD, Simple AD)
    - AWS Control Tower (landing zones, guardrails)

# --- CloudFront avancé ---
- id: "aws_module_11b_cloudfront_advanced"
  title: "CloudFront avancé — Origins, Geo Restriction, Global Accelerator"
  enrichit: aws_module_11_dns_cdn
  level: 2
  template: networking
  priority: medium
  status: planned
  contenu:
    - CloudFront avec ALB/EC2 comme Origin
    - CloudFront Geo Restriction
    - AWS Global Accelerator (Anycast IP, comparaison avec CloudFront)

# ============================================================
# MODULES ENTIÈREMENT NOUVEAUX
# ============================================================

# --- Containers ---
- id: "aws_module_25_containers"
  title: "Containers AWS — ECS, EKS, Fargate, ECR"
  level: 2
  template: devops
  priority: critical
  status: planned
  contenu:
    - Docker rappels (images, conteneurs, registries)
    - Amazon ECS (clusters, services, tasks, launch types EC2 vs Fargate)
    - ECS Auto Scaling
    - ECS Solutions Architectures (ALB + ECS, event-driven)
    - Amazon ECR (registre d'images)
    - Amazon EKS (overview, comparaison ECS vs EKS)
    - AWS App Runner (déploiement simplifié)
    - AWS App2Container

# --- Data & Analytics ---
- id: "aws_module_26_data_analytics"
  title: "Data & Analytics AWS — Athena, Redshift, Kinesis, Glue"
  level: 2
  template: data
  priority: critical
  status: planned
  contenu:
    - Amazon Athena (SQL sur S3, serverless)
    - Amazon Redshift (data warehouse, Spectrum, Serverless)
    - Amazon OpenSearch (ex-ElasticSearch)
    - Amazon EMR (Hadoop, Spark managé)
    - Amazon QuickSight (BI, dashboards)
    - AWS Glue (ETL, Data Catalog, crawlers)
    - AWS Lake Formation (data lake sécurisé)
    - Amazon Kinesis Data Streams & Data Firehose
    - Amazon MSK (Managed Kafka)
    - SQS vs SNS vs Kinesis (comparaison)
    - Big Data Ingestion Pipeline (architecture complète)
    - Apache Flink managé

# --- Storage extras ---
- id: "aws_module_27_storage_extras"
  title: "Storage AWS extras — Snow Family, FSx, Storage Gateway, DataSync"
  level: 2
  template: data
  priority: high
  status: planned
  contenu:
    - AWS Snow Family (Snowcone, Snowball Edge, Snowmobile)
    - Architecture Snowball into Glacier
    - Amazon FSx (Windows File Server, Lustre, NetApp ONTAP, OpenZFS)
    - AWS Storage Gateway (File, Volume, Tape)
    - AWS Transfer Family (SFTP, FTPS, FTP vers S3)
    - AWS DataSync (migration de données, scheduling)
    - Comparaison de toutes les options de stockage AWS

# --- Migration & Disaster Recovery ---
- id: "aws_module_28_migration"
  title: "Migration AWS — DMS, MGN, Backup, Snow, Transfer"
  enrichit: aws_module_17_ha
  level: 2
  template: devops
  priority: high
  status: planned
  contenu:
    - Database Migration Service (DMS) détaillé + hands-on
    - RDS & Aurora Migrations (stratégies)
    - Application Migration Service (MGN)
    - Elastic Disaster Recovery (DRS)
    - AWS Backup (policies, plans, vault)
    - On-Premises Strategies with AWS
    - Transferring Large Datasets into AWS
    - VMware Cloud on AWS

# --- Messaging avancé ---
- id: "aws_module_29_messaging"
  title: "Messaging avancé — Kinesis, Amazon MQ, SQS + ASG"
  enrichit: aws_module_22_distributed
  level: 2
  template: devops
  priority: medium
  status: planned
  contenu:
    - SQS + Auto Scaling Group (scaling sur queue depth)
    - Amazon Kinesis Data Streams (shards, consumers, enhanced fan-out)
    - Amazon Data Firehose (delivery vers S3, Redshift, OpenSearch)
    - Amazon MQ (ActiveMQ, RabbitMQ managé — migration on-prem)
    - SQS vs SNS vs Kinesis (tableau comparatif détaillé)

# --- Machine Learning (overview) ---
- id: "aws_module_30_ml_overview"
  title: "Machine Learning AWS — Services managés (overview SAA-C03)"
  level: 2
  template: concept
  priority: medium
  status: planned
  contenu:
    - Amazon Rekognition (analyse d'images/vidéos)
    - Amazon Transcribe (speech-to-text)
    - Amazon Polly (text-to-speech)
    - Amazon Translate
    - Amazon Lex + Amazon Connect (chatbots, call center)
    - Amazon Comprehend / Comprehend Medical (NLP)
    - Amazon SageMaker AI (ML custom, overview)
    - Amazon Kendra (recherche enterprise)
    - Amazon Personalize (recommandations)
    - Amazon Textract (extraction de documents)
  note: "Module overview — connaître le service et son cas d'usage, pas le configurer en profondeur"

# --- Solution Architecture Patterns ---
- id: "aws_module_31_architecture_patterns"
  title: "Patterns d'architecture AWS — Études de cas SAA-C03"
  level: 3
  template: concept
  priority: high
  status: planned
  contenu:
    - "WhatsTheTime.com — stateless web app multi-AZ"
    - "MyClothes.com — stateful web app avec sessions"
    - "MyWordPress.com — media storage S3"
    - "MyBlog.com — serverless website"
    - "MyTodoList — mobile app serverless"
    - "Microservices Architecture patterns"
    - "Software updates distribution (CloudFront + S3)"
    - "Event Processing patterns (EventBridge, S3, SQS, Lambda)"
    - "Caching strategies"
    - "Blocking an IP address (WAF, NACL, ALB, CloudFront)"
    - "High Performance Computing (HPC) on AWS"
    - "EC2 Instance High Availability patterns"
    - Instantiating applications quickly (AMI, User Data, RDS restore)
    - Elastic Beanstalk (overview, deploy)

# --- Well-Architected & Exam Prep ---
- id: "aws_module_32_well_architected"
  title: "Well-Architected Framework & Préparation examen SAA-C03"
  level: 3
  template: concept
  priority: high
  status: planned
  contenu:
    - "Les 6 piliers du Well-Architected Framework"
    - "Well-Architected Tool"
    - "AWS Trusted Advisor (checks, plans)"
    - "Choosing the right database (arbre de décision)"
    - "Choosing the right storage"
    - "Ports à connaître pour l'examen"
    - "Whitepapers recommandés"
    - "Stratégie d'examen et tips SAA-C03"

# --- Services divers (à connaître pour l'examen) ---
- id: "aws_module_33_other_services"
  title: "Autres services AWS — SES, Pinpoint, Batch, Outposts, Amplify"
  level: 2
  template: concept
  priority: low
  status: planned
  contenu:
    - Amazon SES (email)
    - Amazon Pinpoint (marketing multi-canal)
    - AWS Batch (jobs HPC)
    - AWS Outposts (AWS on-premises)
    - AWS Amplify (full-stack web/mobile)
    - AWS AppFlow (intégration SaaS)
    - SSM Session Manager (accès sans SSH)
    - SSM Patch Manager, Run Command, Inventory
    - AWS Cost Explorer & Cost Anomaly Detection
    - Instance Scheduler on AWS

```

---

## Ordre de rédaction recommandé

Par priorité pour la couverture examen :

| Priorité | Module | Raison |
|----------|--------|--------|
| 1 | 04b S3 avancé | ~15% des questions touchent S3 |
| 2 | 05b VPC avancé | ~10% des questions touchent le networking |
| 3 | 25 Containers | ECS/Fargate revient très souvent |
| 4 | 26 Data & Analytics | Athena, Kinesis, Glue — bloc entier dans l'examen |
| 5 | 09b ELB avancé | GWLB, SSL, sticky sessions = questions fréquentes |
| 6 | 03b EC2 avancé | Spot, placement groups = questions classiques |
| 7 | 31 Architecture Patterns | Prépare directement aux questions scénarios |
| 8 | 27 Storage extras | Snow Family, FSx = 2-3 questions garanties |
| 9 | 12b Security extra | GuardDuty, Inspector reviennent régulièrement |
| 10 | 02b IAM avancé | Identity Center, Policy Logic |
| 11 | 18b Serverless avancé | Cognito, Step Functions |
| 12 | 28 Migration | DMS, MGN = 3-4 questions |
| 13 | 32 Well-Architected | Piliers + exam tips |
| 14 | 10b Databases avancé | RDS Proxy, DocumentDB |
| 15 | 29 Messaging avancé | Kinesis vs SQS vs SNS |
| 16 | 30 ML overview | 2-3 questions "quel service pour quel besoin" |
| 17 | 11b CloudFront avancé | Global Accelerator |
| 18 | 33 Autres services | 1-2 questions chacun |

---

## Estimation

- **17 nouveaux modules/extensions** à rédiger
- Avec les 24 existants → **41 modules** au total
- Couverture estimée après complétion : **~95% du syllabus SAA-C03**
