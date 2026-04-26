---
layout: page
title: "Glossaire des services AWS — Dictionnaire SAA-C03"
course: cloud-aws
chapter_title: "Références"
chapter: 0
section: 2
tags: aws,glossaire,dictionnaire,services,saa-c03,reference
difficulty: beginner
duration: 20
mermaid: false
status: published
prev_module: "/courses/cloud-aws/aws_cheatsheet.html"
prev_module_title: "Cheat Sheet AWS — Référence rapide SAA-C03"
next_module: "/courses/cloud-aws/aws_module_01_concepts_cloud.html"
next_module_title: "Concepts Cloud & Modèles AWS"
---

# Glossaire des services AWS — Dictionnaire SAA-C03

> Dictionnaire concis de tous les services AWS au programme de l'examen Solutions Architect Associate (SAA-C03).
> Chaque entrée donne une définition courte et renvoie vers le(s) module(s) du cours.
>
> Les services marqués *hors scope* sont listés dans le guide officiel comme exclus de l'examen.

---

## Analytique
{: #analytique}

**Amazon Athena** — Requêtes SQL serverless directement sur S3 (Presto). Facturé au volume scanné.
→ [Module 30](/courses/cloud-aws/aws_module_30_data_services.html)
{: #athena}

**AWS Data Exchange** — Marketplace de jeux de données tiers consommables dans AWS.
{: #data-exchange}

**AWS Data Pipeline** — Orchestration ETL planifié entre services AWS. Souvent remplacé par Glue.
{: #data-pipeline}

**Amazon EMR** — Clusters Hadoop/Spark managés pour le traitement Big Data.
→ [Module 30](/courses/cloud-aws/aws_module_30_data_services.html)
{: #emr}

**AWS Glue** — ETL serverless + Data Catalog avec crawlers pour découverte automatique de schémas.
→ [Module 30](/courses/cloud-aws/aws_module_30_data_services.html)
{: #glue}

**Amazon Kinesis** — Famille de services d'ingestion temps réel : Data Streams (consumers custom), Firehose (livraison vers S3/Redshift), Analytics (SQL/Flink sur flux), Video Streams.
→ [Module 30](/courses/cloud-aws/aws_module_30_data_services.html)
{: #kinesis}

**AWS Lake Formation** — Gouvernance de data lake sur S3 avec contrôle d'accès granulaire (row/column-level).
→ [Module 30](/courses/cloud-aws/aws_module_30_data_services.html)
{: #lake-formation}

**Amazon MSK** — Apache Kafka entièrement managé, compatible avec l'écosystème Kafka existant.
{: #msk}

**Amazon OpenSearch Service** — Recherche full-text et analytique de logs (successeur d'Elasticsearch Service).
→ [Module 30](/courses/cloud-aws/aws_module_30_data_services.html)
{: #opensearch}

**Amazon QuickSight** — BI serverless : dashboards interactifs, rapports, ML Insights (moteur SPICE).
→ [Module 30](/courses/cloud-aws/aws_module_30_data_services.html)
{: #quicksight}

**Amazon Redshift** — Data warehouse en colonnes (MPP) pour requêtes analytiques sur des pétaoctets.
→ [Module 30](/courses/cloud-aws/aws_module_30_data_services.html)
{: #redshift}

**Amazon CloudSearch** — Service de recherche managé. *Hors scope SAA-C03.*
{: #cloudsearch}

---

## Intégration d'applications
{: #integration}

**Amazon AppFlow** — Transfert no-code entre SaaS (Salesforce, Slack, SAP…) et AWS (S3, Redshift).
{: #appflow}

**AWS AppSync** — API GraphQL managée avec subscriptions temps réel et résolveurs multi-sources (DynamoDB, Lambda, RDS).
→ [Module 29](/courses/cloud-aws/aws_module_29_lambda_advanced.html)
{: #appsync}

**Amazon EventBridge** — Bus d'événements serverless avec règles de routage et pattern matching. Anciennement CloudWatch Events.
→ [Module 18](/courses/cloud-aws/aws_module_18_serverless.html) · [Module 22](/courses/cloud-aws/aws_module_22_distributed.html)
{: #eventbridge}

**Amazon MQ** — Message broker managé compatible ActiveMQ et RabbitMQ (protocoles AMQP, MQTT, STOMP).
→ [Module 22](/courses/cloud-aws/aws_module_22_distributed.html)
{: #amazon-mq}

**Amazon SNS** — Messagerie pub/sub : un topic distribue les messages à tous les abonnés (fan-out vers SQS, Lambda, email, HTTP, SMS).
→ [Module 22](/courses/cloud-aws/aws_module_22_distributed.html)
{: #sns}

**Amazon SQS** — File d'attente managée. Standard (débit illimité, best-effort ordering) ou FIFO (ordre garanti, exactly-once).
→ [Module 22](/courses/cloud-aws/aws_module_22_distributed.html)
{: #sqs}

**AWS Step Functions** — Orchestration de workflows serverless via state machines. Standard (longue durée) ou Express (haut débit).
→ [Module 29](/courses/cloud-aws/aws_module_29_lambda_advanced.html)
{: #step-functions}

**Amazon MWAA** — Apache Airflow managé. *Hors scope SAA-C03.*
{: #mwaa}

---

## Gestion des coûts AWS
{: #couts}

**AWS Budgets** — Alertes sur dépassement de budgets (coût, usage, RI, Savings Plans).
→ [Module 21](/courses/cloud-aws/aws_module_21_finops.html)
{: #budgets}

**AWS Cost and Usage Report (CUR)** — Rapport CSV détaillé de consommation, livré dans S3, analysable avec Athena/Redshift.
→ [Module 21](/courses/cloud-aws/aws_module_21_finops.html)
{: #cur}

**AWS Cost Explorer** — Interface visuelle d'analyse et prévision des coûts avec recommandations RI/Savings Plans.
→ [Module 21](/courses/cloud-aws/aws_module_21_finops.html)
{: #cost-explorer}

**Savings Plans** — Engagement $/heure sur 1 ou 3 ans pour EC2, Lambda, Fargate. Deux types : Compute (flexible) et EC2 Instance (spécifique).
→ [Module 21](/courses/cloud-aws/aws_module_21_finops.html)
{: #savings-plans}

---

## Compute
{: #compute}

**AWS Batch** — Traitement par lots managé, provisionne automatiquement EC2/Spot/Fargate selon les jobs.
{: #batch}

**Amazon EC2** — Machines virtuelles à la demande. Options d'achat : On-Demand, Reserved, Spot, Dedicated.
→ [Module 03](/courses/cloud-aws/aws_module_03_ec2.html) · [Module 09](/courses/cloud-aws/aws_module_09_load_balancing.html)
{: #ec2}

**Amazon EC2 Auto Scaling** — Ajustement automatique du nombre d'instances selon la demande (target tracking, step, scheduled).
→ [Module 09](/courses/cloud-aws/aws_module_09_load_balancing.html)
{: #ec2-auto-scaling}

**AWS Elastic Beanstalk** — PaaS : déploiement web simplifié (EC2, ASG, ELB, RDS gérés automatiquement).
→ [Module 13](/courses/cloud-aws/aws_module_13_iac.html)
{: #elastic-beanstalk}

**AWS Outposts** — Infrastructure AWS physiquement installée dans un datacenter on-prem (mêmes APIs).
{: #outposts}

**AWS Serverless Application Repository** — Catalogue d'applications serverless prêtes à déployer (CloudFormation/SAM).
{: #sar}

**VMware Cloud on AWS** — VMware SDDC sur bare metal AWS pour migrer des workloads VMware sans modification.
{: #vmware-cloud}

**AWS Wavelength** — Infrastructure AWS dans les réseaux 5G des opérateurs pour une latence ultra-faible.
{: #wavelength}

**Amazon Lightsail** — VPS simplifié à prix fixe. *Hors scope SAA-C03.*
{: #lightsail}

---

## Containers
{: #containers}

**Amazon ECS** — Orchestrateur de conteneurs Docker natif AWS. Launch types : EC2 ou Fargate.
→ [Module 25](/courses/cloud-aws/aws_module_25_containers.html)
{: #ecs}

**Amazon ECS Anywhere** — Extension d'ECS pour exécuter des tâches sur infrastructure on-prem/edge.
{: #ecs-anywhere}

**Amazon ECR** — Registry Docker privé managé avec scan de vulnérabilités et lifecycle des images.
→ [Module 25](/courses/cloud-aws/aws_module_25_containers.html)
{: #ecr}

**Amazon EKS** — Kubernetes managé (control plane géré par AWS). Supporte EC2 et Fargate.
→ [Module 25](/courses/cloud-aws/aws_module_25_containers.html)
{: #eks}

**Amazon EKS Anywhere** — Distribution Kubernetes pour clusters EKS sur infrastructure on-prem (VMware, bare metal).
{: #eks-anywhere}

**Amazon EKS Distro** — Distribution open-source Kubernetes identique à celle d'EKS.
{: #eks-distro}

---

## Base de données
{: #database}

**Amazon Aurora** — Relationnel haute performance compatible MySQL/PostgreSQL. Stockage distribué auto-scaling (128 To), 6 copies sur 3 AZ.
→ [Module 10](/courses/cloud-aws/aws_module_10_databases.html)
{: #aurora}

**Amazon Aurora Serverless** — Aurora avec capacité auto-ajustable (ACU). V2 : scaling instantané.
→ [Module 10](/courses/cloud-aws/aws_module_10_databases.html)
{: #aurora-serverless}

**Amazon DocumentDB** — Base de données document managée, compatible API MongoDB.
→ [Module 10](/courses/cloud-aws/aws_module_10_databases.html)
{: #documentdb}

**Amazon DynamoDB** — NoSQL clé-valeur/document, serverless, temps de réponse en millisecondes. Modes On-Demand ou Provisioned.
→ [Module 10](/courses/cloud-aws/aws_module_10_databases.html)
{: #dynamodb}

**Amazon ElastiCache** — Cache in-memory managé : Redis (persistance, réplication) ou Memcached (simple cache multi-thread).
→ [Module 19](/courses/cloud-aws/aws_module_19_performance.html)
{: #elasticache}

**Amazon Keyspaces** — Base compatible Apache Cassandra, serverless.
{: #keyspaces}

**Amazon Neptune** — Base de données graphe managée (Gremlin + SPARQL).
→ [Module 10](/courses/cloud-aws/aws_module_10_databases.html)
{: #neptune}

**Amazon QLDB** — Ledger immuable vérifiable cryptographiquement (pas de blockchain, centralisé).
{: #qldb}

**Amazon RDS** — Relationnel managé : MySQL, PostgreSQL, MariaDB, Oracle, SQL Server. Backups, Multi-AZ, Read Replicas inclus.
→ [Module 10](/courses/cloud-aws/aws_module_10_databases.html)
{: #rds}

**Amazon RDS on VMware** — RDS sur infrastructure VMware on-prem. *Hors scope SAA-C03.*
{: #rds-vmware}

---

## Outils pour développeur
{: #devtools}

**AWS X-Ray** — Tracing distribué : visualise les appels entre services, identifie les goulots d'étranglement.
→ [Module 15](/courses/cloud-aws/aws_module_15_observability.html)
{: #x-ray}

*Les autres outils développeur (Cloud9, CDK, CodeBuild, CodeDeploy, CodePipeline…) sont hors scope SAA-C03. Voir [Module 14 — CI/CD](/courses/cloud-aws/aws_module_14_cicd.html) pour les détails.*

---

## Frontend — Web et mobile
{: #frontend}

**AWS Amplify** — Plateforme full-stack pour apps web/mobile avec hosting, auth (Cognito), storage (S3), APIs.
{: #amplify}

**Amazon API Gateway** — APIs REST, HTTP et WebSocket managées avec throttling, cache, autorisation (IAM, Cognito, Lambda Authorizer).
→ [Module 18](/courses/cloud-aws/aws_module_18_serverless.html)
{: #api-gateway}

**AWS Device Farm** — Tests d'applications sur appareils réels (mobiles, tablettes, navigateurs) hébergés par AWS.
{: #device-farm}

**Amazon Pinpoint** — Communication multicanal (email, SMS, push, voix) avec segmentation et analytique.
{: #pinpoint}

---

## Machine Learning
{: #ml}

**Amazon Comprehend** — NLP : extraction de sentiments, entités, phrases clés, langue.
→ [Module 33](/courses/cloud-aws/aws_module_33_ml_overview.html)
{: #comprehend}

**Amazon Forecast** — Prévisions temporelles ML (mêmes algorithmes qu'Amazon.com).
→ [Module 33](/courses/cloud-aws/aws_module_33_ml_overview.html)
{: #forecast}

**Amazon Fraud Detector** — Détection de fraude en ligne basée sur ML, entraîné sur données historiques.
→ [Module 33](/courses/cloud-aws/aws_module_33_ml_overview.html)
{: #fraud-detector}

**Amazon Kendra** — Recherche intelligente (enterprise search) avec compréhension du langage naturel.
→ [Module 33](/courses/cloud-aws/aws_module_33_ml_overview.html)
{: #kendra}

**Amazon Lex** — Chatbots conversationnels avec reconnaissance vocale (même techno qu'Alexa).
→ [Module 33](/courses/cloud-aws/aws_module_33_ml_overview.html)
{: #lex}

**Amazon Polly** — Text-to-Speech en dizaines de langues et voix (standard + neural).
→ [Module 33](/courses/cloud-aws/aws_module_33_ml_overview.html)
{: #polly}

**Amazon Rekognition** — Analyse d'images et vidéos : détection d'objets, visages, texte, contenu inapproprié.
→ [Module 33](/courses/cloud-aws/aws_module_33_ml_overview.html)
{: #rekognition}

**Amazon SageMaker** — Plateforme ML complète : build, train, deploy à grande échelle.
→ [Module 33](/courses/cloud-aws/aws_module_33_ml_overview.html)
{: #sagemaker}

**Amazon Textract** — OCR intelligent : extraction de texte, formulaires et tableaux depuis documents scannés.
→ [Module 33](/courses/cloud-aws/aws_module_33_ml_overview.html)
{: #textract}

**Amazon Transcribe** — Speech-to-Text avec ponctuation automatique et vocabulaire personnalisé.
→ [Module 33](/courses/cloud-aws/aws_module_33_ml_overview.html)
{: #transcribe}

**Amazon Translate** — Traduction automatique neuronale multi-langues.
→ [Module 33](/courses/cloud-aws/aws_module_33_ml_overview.html)
{: #translate}

*Les autres services ML (Personalize, DeepRacer, Lookout, Panorama, SageMaker Ground Truth…) sont hors scope SAA-C03.*

---

## Management et gouvernance
{: #management}

**AWS Auto Scaling** — Scaling centralisé multi-ressources (EC2, ECS, DynamoDB, Aurora) via scaling plans.
→ [Module 09](/courses/cloud-aws/aws_module_09_load_balancing.html)
{: #auto-scaling}

**AWS CloudFormation** — IaC natif AWS : stacks de ressources via templates YAML/JSON déclaratifs.
→ [Module 13](/courses/cloud-aws/aws_module_13_iac.html)
{: #cloudformation}

**AWS CloudTrail** — Audit de tous les appels API dans un compte AWS. Événements stockés dans S3/CloudWatch Logs.
→ [Module 07](/courses/cloud-aws/aws_module_07_cloudwatch.html) · [Module 20](/courses/cloud-aws/aws_module_20_security_zero_trust.html)
{: #cloudtrail}

**Amazon CloudWatch** — Monitoring : métriques, logs, alarmes, dashboards, événements.
→ [Module 07](/courses/cloud-aws/aws_module_07_cloudwatch.html) · [Module 15](/courses/cloud-aws/aws_module_15_observability.html)
{: #cloudwatch}

**AWS CLI** — Interface en ligne de commande pour tous les services AWS (profiles, JMESPath, pagination).
→ [Module 06](/courses/cloud-aws/aws_module_06_cli.html)
{: #cli}

**AWS Compute Optimizer** — Recommandations de rightsizing basées sur l'analyse des métriques CloudWatch.
→ [Module 21](/courses/cloud-aws/aws_module_21_finops.html)
{: #compute-optimizer}

**AWS Config** — Conformité continue : évalue la configuration des ressources contre des rules, avec historique complet.
→ [Module 20](/courses/cloud-aws/aws_module_20_security_zero_trust.html) · [Module 24](/courses/cloud-aws/aws_module_24_governance.html)
{: #config}

**AWS Control Tower** — Landing Zone automatisée pour environnement multi-comptes avec guardrails préventifs et détectifs.
→ [Module 24](/courses/cloud-aws/aws_module_24_governance.html) · [Module 28](/courses/cloud-aws/aws_module_28_iam_advanced.html)
{: #control-tower}

**AWS Health Dashboard** — Santé des services AWS impactant vos ressources (alertes maintenance, incidents).
{: #health-dashboard}

**AWS License Manager** — Gestion et suivi des licences logicielles (BYOL) dans le cloud et on-prem.
{: #license-manager}

**Amazon Managed Grafana** — Grafana managé pour dashboards opérationnels (intégration CloudWatch, Prometheus, X-Ray).
→ [Module 15](/courses/cloud-aws/aws_module_15_observability.html)
{: #managed-grafana}

**Amazon Managed Service for Prometheus** — Prometheus managé pour monitoring de conteneurs (PromQL, EKS).
→ [Module 15](/courses/cloud-aws/aws_module_15_observability.html)
{: #managed-prometheus}

**AWS Management Console** — Interface web graphique pour gérer les services AWS.
{: #console}

**AWS Organizations** — Multi-comptes : facturation consolidée + SCP (Service Control Policies) par OU.
→ [Module 16](/courses/cloud-aws/aws_module_16_multi_env.html) · [Module 24](/courses/cloud-aws/aws_module_24_governance.html)
{: #organizations}

**AWS Proton** — Templates d'infrastructure standardisés pour le platform engineering.
{: #proton}

**AWS Service Catalog** — Catalogue de produits IT approuvés (templates CloudFormation) déployables en self-service.
→ [Module 24](/courses/cloud-aws/aws_module_24_governance.html)
{: #service-catalog}

**AWS Systems Manager** — Suite de gestion opérationnelle : Run Command, Patch Manager, Parameter Store, Session Manager.
→ [Module 24](/courses/cloud-aws/aws_module_24_governance.html)
{: #systems-manager}

**AWS Trusted Advisor** — Checks automatiques sur 5 axes : coût, performance, sécurité, tolérance aux pannes, limites.
→ [Module 21](/courses/cloud-aws/aws_module_21_finops.html)
{: #trusted-advisor}

**AWS Well-Architected Tool** — Auto-évaluation contre les 6 piliers du Well-Architected Framework.
→ [Module 24](/courses/cloud-aws/aws_module_24_governance.html)
{: #well-architected-tool}

---

## Services multimédias
{: #media}

**Amazon Elastic Transcoder** — Transcodage vidéo dans le cloud (S3 → formats multi-appareils).
{: #elastic-transcoder}

**Amazon Kinesis Video Streams** — Ingestion et stockage de flux vidéo pour analyse (intégration Rekognition).
{: #kinesis-video}

---

## Migration et transfert
{: #migration}

**AWS Application Discovery Service** — Inventaire et cartographie des dépendances des serveurs on-prem avant migration.
→ [Module 32](/courses/cloud-aws/aws_module_32_migration.html)
{: #discovery-service}

**AWS Application Migration Service (MGN)** — Migration lift-and-shift : réplication de serveurs on-prem vers EC2 avec temps d'arrêt minimal.
→ [Module 32](/courses/cloud-aws/aws_module_32_migration.html)
{: #mgn}

**AWS DMS** (Database Migration Service) — Migration de BDD homogène ou hétérogène (avec SCT pour conversion de schéma). Supporte la réplication continue.
→ [Module 32](/courses/cloud-aws/aws_module_32_migration.html)
{: #dms}

**AWS DataSync** — Transfert automatisé on-prem (NFS/SMB/HDFS) → AWS (S3/EFS/FSx). Chiffré et vérifié.
→ [Module 32](/courses/cloud-aws/aws_module_32_migration.html)
{: #datasync}

**AWS Migration Hub** — Console centralisée de suivi de l'avancement des migrations (MGN, DMS, Discovery).
→ [Module 32](/courses/cloud-aws/aws_module_32_migration.html)
{: #migration-hub}

**AWS Snow Family** — Appareils physiques pour transfert massif de données : Snowcone (8-14 To), Snowball Edge (42-80 To), Snowmobile (100 Po).
→ [Module 32](/courses/cloud-aws/aws_module_32_migration.html)
{: #snow-family}

**AWS Transfer Family** — SFTP/FTPS/FTP/AS2 managé avec stockage sur S3 ou EFS.
→ [Module 32](/courses/cloud-aws/aws_module_32_migration.html)
{: #transfer-family}

---

## Mise en réseau et diffusion de contenu
{: #networking}

**AWS Client VPN** — VPN client-to-site managé (OpenVPN) pour accès distant sécurisé au VPC.
→ [Module 27](/courses/cloud-aws/aws_module_27_vpc_advanced.html)
{: #client-vpn}

**Amazon CloudFront** — CDN global (400+ edge locations) avec cache, HTTPS, Lambda@Edge et CloudFront Functions.
→ [Module 11](/courses/cloud-aws/aws_module_11_dns_cdn.html) · [Module 19](/courses/cloud-aws/aws_module_19_performance.html)
{: #cloudfront}

**AWS Direct Connect** — Fibre dédiée entre datacenter on-prem et AWS. Latence prévisible, 1-100 Gbps, ne passe pas par Internet.
→ [Module 27](/courses/cloud-aws/aws_module_27_vpc_advanced.html)
{: #direct-connect}

**Elastic Load Balancing (ELB)** — Load balancers managés : ALB (Layer 7 / HTTP), NLB (Layer 4 / TCP), GLB (Layer 3 / appliances réseau).
→ [Module 09](/courses/cloud-aws/aws_module_09_load_balancing.html)
{: #elb}

**AWS Global Accelerator** — Routing via le backbone privé AWS avec 2 IP anycast statiques pour latence faible et failover rapide.
→ [Module 19](/courses/cloud-aws/aws_module_19_performance.html) · [Module 27](/courses/cloud-aws/aws_module_27_vpc_advanced.html)
{: #global-accelerator}

**AWS PrivateLink** — Connexion privée entre VPC via ENI, sans Internet ni peering.
→ [Module 27](/courses/cloud-aws/aws_module_27_vpc_advanced.html)
{: #privatelink}

**Amazon Route 53** — DNS managé avec health checks et routing policies (weighted, latency, failover, geolocation, geoproximity).
→ [Module 11](/courses/cloud-aws/aws_module_11_dns_cdn.html)
{: #route53}

**AWS Site-to-Site VPN** — Tunnel IPsec chiffré on-prem ↔ VPC via Internet (2 tunnels redondants).
→ [Module 27](/courses/cloud-aws/aws_module_27_vpc_advanced.html)
{: #site-to-site-vpn}

**AWS Transit Gateway** — Hub réseau centralisé pour interconnecter VPC, VPN et Direct Connect. Routage transitif.
→ [Module 27](/courses/cloud-aws/aws_module_27_vpc_advanced.html)
{: #transit-gateway}

**Amazon VPC** — Réseau virtuel isolé : subnets, route tables, IGW, NAT Gateway, NACL, Security Groups, VPC Endpoints.
→ [Module 05](/courses/cloud-aws/aws_module_05_vpc.html) · [Module 27](/courses/cloud-aws/aws_module_27_vpc_advanced.html)
{: #vpc}

---

## Sécurité, identité et conformité
{: #security}

**AWS Artifact** — Portail en libre-service pour rapports de conformité AWS (SOC, PCI, ISO) et accords (BAA, NDA).
{: #artifact}

**AWS Audit Manager** — Collecte automatisée de preuves d'audit, mappées sur des frameworks (PCI-DSS, GDPR, SOC 2).
{: #audit-manager}

**AWS Certificate Manager (ACM)** — Certificats TLS/SSL publics gratuits avec renouvellement automatique (ELB, CloudFront, API Gateway).
→ [Module 12](/courses/cloud-aws/aws_module_12_security_advanced.html)
{: #acm}

**AWS CloudHSM** — HSM dédié (FIPS 140-2 Level 3) : le client contrôle entièrement les clés de chiffrement.
→ [Module 12](/courses/cloud-aws/aws_module_12_security_advanced.html)
{: #cloudhsm}

**Amazon Cognito** — Auth pour apps web/mobile : User Pool (sign-up/sign-in, MFA) + Identity Pool (credentials AWS temporaires).
→ [Module 29](/courses/cloud-aws/aws_module_29_lambda_advanced.html)
{: #cognito}

**Amazon Detective** — Investigation de sécurité automatisée à partir de CloudTrail, VPC Flow Logs et GuardDuty.
→ [Module 20](/courses/cloud-aws/aws_module_20_security_zero_trust.html)
{: #detective}

**AWS Directory Service** — Active Directory managé : AWS Managed AD, AD Connector (proxy), Simple AD.
→ [Module 28](/courses/cloud-aws/aws_module_28_iam_advanced.html)
{: #directory-service}

**AWS Firewall Manager** — Gestion centralisée WAF/Shield/SG/Network Firewall sur plusieurs comptes (via Organizations).
→ [Module 12](/courses/cloud-aws/aws_module_12_security_advanced.html)
{: #firewall-manager}

**Amazon GuardDuty** — Détection de menaces intelligente (ML sur logs VPC/DNS/CloudTrail) : crypto-mining, accès inhabituels, reconnaissance.
→ [Module 12](/courses/cloud-aws/aws_module_12_security_advanced.html) · [Module 20](/courses/cloud-aws/aws_module_20_security_zero_trust.html)
{: #guardduty}

**AWS IAM Identity Center** — SSO centralisé pour accès multi-comptes AWS et applications SaaS. Anciennement AWS SSO.
→ [Module 28](/courses/cloud-aws/aws_module_28_iam_advanced.html)
{: #iam-identity-center}

**AWS IAM** (Identity and Access Management) — Gestion des identités et permissions : users, groups, roles, policies. Gratuit.
→ [Module 02](/courses/cloud-aws/aws_module_02_iam.html) · [Module 08](/courses/cloud-aws/aws_module_08_security.html) · [Module 28](/courses/cloud-aws/aws_module_28_iam_advanced.html)
{: #iam}

**Amazon Inspector** — Scan de vulnérabilités automatisé pour EC2, images ECR et Lambda (CVE, exposition réseau).
→ [Module 12](/courses/cloud-aws/aws_module_12_security_advanced.html) · [Module 20](/courses/cloud-aws/aws_module_20_security_zero_trust.html)
{: #inspector}

**AWS KMS** (Key Management Service) — Gestion de clés de chiffrement managé (CMK, AES-256). Intégré à la plupart des services AWS.
→ [Module 08](/courses/cloud-aws/aws_module_08_security.html) · [Module 12](/courses/cloud-aws/aws_module_12_security_advanced.html)
{: #kms}

**Amazon Macie** — Découverte de données sensibles (PII) dans S3 via ML.
→ [Module 12](/courses/cloud-aws/aws_module_12_security_advanced.html) · [Module 20](/courses/cloud-aws/aws_module_20_security_zero_trust.html)
{: #macie}

**AWS Network Firewall** — Firewall réseau managé (Layer 3-7) dans un VPC : inspection de paquets, IDS/IPS.
→ [Module 20](/courses/cloud-aws/aws_module_20_security_zero_trust.html)
{: #network-firewall}

**AWS RAM** (Resource Access Manager) — Partage de ressources entre comptes (subnets, Transit Gateways, Route 53 rules…).
→ [Module 24](/courses/cloud-aws/aws_module_24_governance.html) · [Module 27](/courses/cloud-aws/aws_module_27_vpc_advanced.html)
{: #ram}

**AWS Secrets Manager** — Stockage et rotation automatique de secrets (credentials BDD, clés API, tokens).
→ [Module 12](/courses/cloud-aws/aws_module_12_security_advanced.html)
{: #secrets-manager}

**AWS Security Hub** — Vue centralisée des findings de GuardDuty, Inspector, Macie, Config. Scoring contre CIS/PCI-DSS.
→ [Module 20](/courses/cloud-aws/aws_module_20_security_zero_trust.html)
{: #security-hub}

**AWS Shield** — Protection DDoS. Standard (gratuit, Layer 3/4, automatique) · Advanced (payant, Layer 3/4/7, support 24/7).
→ [Module 12](/courses/cloud-aws/aws_module_12_security_advanced.html)
{: #shield}

**AWS WAF** — Firewall applicatif (Layer 7) : règles HTTP contre injections SQL, XSS, bots, rate limiting.
→ [Module 12](/courses/cloud-aws/aws_module_12_security_advanced.html)
{: #waf}

---

## Serverless
{: #serverless}

**AWS Fargate** — Compute serverless pour conteneurs (ECS/EKS). Pas de gestion de serveurs, pricing au vCPU/RAM.
→ [Module 25](/courses/cloud-aws/aws_module_25_containers.html)
{: #fargate}

**AWS Lambda** — FaaS : exécution de code sur événement, facturation à la milliseconde. Limites : 15 min timeout, 10 Go RAM, 1 000 concurrence/région par défaut.
→ [Module 18](/courses/cloud-aws/aws_module_18_serverless.html) · [Module 29](/courses/cloud-aws/aws_module_29_lambda_advanced.html)
{: #lambda}

---

## Stockage
{: #storage}

**AWS Backup** — Sauvegarde centralisée multi-services (EBS, RDS, DynamoDB, EFS, S3, FSx, EC2).
→ [Module 32](/courses/cloud-aws/aws_module_32_migration.html)
{: #backup}

**Amazon EBS** (Elastic Block Store) — Stockage block persistant pour EC2, attaché dans une AZ. Types : gp3, io2, st1, sc1.
→ [Module 03](/courses/cloud-aws/aws_module_03_ec2.html) · [Module 04](/courses/cloud-aws/aws_module_04_storage.html)
{: #ebs}

**Amazon EFS** (Elastic File System) — NFS managé, multi-AZ, élastique. Linux uniquement.
→ [Module 04](/courses/cloud-aws/aws_module_04_storage.html)
{: #efs}

**Amazon FSx** — Systèmes de fichiers managés : FSx for Windows (SMB), FSx for Lustre (HPC), FSx for NetApp ONTAP, FSx for OpenZFS.
→ [Module 32](/courses/cloud-aws/aws_module_32_migration.html)
{: #fsx}

**Amazon S3** — Stockage objet serverless, durabilité 11 nines, stockage illimité, objets jusqu'à 5 To.
→ [Module 04](/courses/cloud-aws/aws_module_04_storage.html) · [Module 26](/courses/cloud-aws/aws_module_26_s3_advanced.html)
{: #s3}

**Amazon S3 Glacier** — Classes d'archivage long terme dans S3 : Instant Retrieval (ms), Flexible (min-h), Deep Archive (h).
→ [Module 04](/courses/cloud-aws/aws_module_04_storage.html) · [Module 26](/courses/cloud-aws/aws_module_26_s3_advanced.html)
{: #s3-glacier}

**AWS Storage Gateway** — Hybride on-prem ↔ AWS : File Gateway (NFS/SMB), Volume Gateway (iSCSI), Tape Gateway (VTL).
→ [Module 32](/courses/cloud-aws/aws_module_32_migration.html)
{: #storage-gateway}

---

## Index alphabétique

| Service | Catégorie | Module(s) |
|---------|-----------|-----------|
| [ACM](#acm) | Sécurité | [12](/courses/cloud-aws/aws_module_12_security_advanced.html) |
| [Amplify](#amplify) | Frontend | — |
| [API Gateway](#api-gateway) | Frontend | [18](/courses/cloud-aws/aws_module_18_serverless.html) |
| [AppFlow](#appflow) | Intégration | — |
| [AppSync](#appsync) | Intégration | [29](/courses/cloud-aws/aws_module_29_lambda_advanced.html) |
| [Athena](#athena) | Analytique | [30](/courses/cloud-aws/aws_module_30_data_services.html) |
| [Aurora](#aurora) | Database | [10](/courses/cloud-aws/aws_module_10_databases.html) |
| [Auto Scaling](#auto-scaling) | Management | [09](/courses/cloud-aws/aws_module_09_load_balancing.html) |
| [Backup](#backup) | Stockage | [32](/courses/cloud-aws/aws_module_32_migration.html) |
| [Batch](#batch) | Compute | — |
| [Budgets](#budgets) | Coûts | [21](/courses/cloud-aws/aws_module_21_finops.html) |
| [CloudFormation](#cloudformation) | Management | [13](/courses/cloud-aws/aws_module_13_iac.html) |
| [CloudFront](#cloudfront) | Réseau | [11](/courses/cloud-aws/aws_module_11_dns_cdn.html), [19](/courses/cloud-aws/aws_module_19_performance.html) |
| [CloudHSM](#cloudhsm) | Sécurité | [12](/courses/cloud-aws/aws_module_12_security_advanced.html) |
| [CloudTrail](#cloudtrail) | Management | [07](/courses/cloud-aws/aws_module_07_cloudwatch.html), [20](/courses/cloud-aws/aws_module_20_security_zero_trust.html) |
| [CloudWatch](#cloudwatch) | Management | [07](/courses/cloud-aws/aws_module_07_cloudwatch.html), [15](/courses/cloud-aws/aws_module_15_observability.html) |
| [Cognito](#cognito) | Sécurité | [29](/courses/cloud-aws/aws_module_29_lambda_advanced.html) |
| [Config](#config) | Management | [20](/courses/cloud-aws/aws_module_20_security_zero_trust.html), [24](/courses/cloud-aws/aws_module_24_governance.html) |
| [Control Tower](#control-tower) | Management | [24](/courses/cloud-aws/aws_module_24_governance.html), [28](/courses/cloud-aws/aws_module_28_iam_advanced.html) |
| [Cost Explorer](#cost-explorer) | Coûts | [21](/courses/cloud-aws/aws_module_21_finops.html) |
| [DataSync](#datasync) | Migration | [32](/courses/cloud-aws/aws_module_32_migration.html) |
| [Detective](#detective) | Sécurité | [20](/courses/cloud-aws/aws_module_20_security_zero_trust.html) |
| [Direct Connect](#direct-connect) | Réseau | [27](/courses/cloud-aws/aws_module_27_vpc_advanced.html) |
| [Directory Service](#directory-service) | Sécurité | [28](/courses/cloud-aws/aws_module_28_iam_advanced.html) |
| [DMS](#dms) | Migration | [32](/courses/cloud-aws/aws_module_32_migration.html) |
| [DocumentDB](#documentdb) | Database | [10](/courses/cloud-aws/aws_module_10_databases.html) |
| [DynamoDB](#dynamodb) | Database | [10](/courses/cloud-aws/aws_module_10_databases.html) |
| [EBS](#ebs) | Stockage | [03](/courses/cloud-aws/aws_module_03_ec2.html), [04](/courses/cloud-aws/aws_module_04_storage.html) |
| [EC2](#ec2) | Compute | [03](/courses/cloud-aws/aws_module_03_ec2.html), [09](/courses/cloud-aws/aws_module_09_load_balancing.html) |
| [ECR](#ecr) | Containers | [25](/courses/cloud-aws/aws_module_25_containers.html) |
| [ECS](#ecs) | Containers | [25](/courses/cloud-aws/aws_module_25_containers.html) |
| [EFS](#efs) | Stockage | [04](/courses/cloud-aws/aws_module_04_storage.html) |
| [EKS](#eks) | Containers | [25](/courses/cloud-aws/aws_module_25_containers.html) |
| [ElastiCache](#elasticache) | Database | [19](/courses/cloud-aws/aws_module_19_performance.html) |
| [ELB](#elb) | Réseau | [09](/courses/cloud-aws/aws_module_09_load_balancing.html) |
| [EMR](#emr) | Analytique | [30](/courses/cloud-aws/aws_module_30_data_services.html) |
| [EventBridge](#eventbridge) | Intégration | [18](/courses/cloud-aws/aws_module_18_serverless.html), [22](/courses/cloud-aws/aws_module_22_distributed.html) |
| [Fargate](#fargate) | Serverless | [25](/courses/cloud-aws/aws_module_25_containers.html) |
| [Firewall Manager](#firewall-manager) | Sécurité | [12](/courses/cloud-aws/aws_module_12_security_advanced.html) |
| [FSx](#fsx) | Stockage | [32](/courses/cloud-aws/aws_module_32_migration.html) |
| [Global Accelerator](#global-accelerator) | Réseau | [19](/courses/cloud-aws/aws_module_19_performance.html), [27](/courses/cloud-aws/aws_module_27_vpc_advanced.html) |
| [Glue](#glue) | Analytique | [30](/courses/cloud-aws/aws_module_30_data_services.html) |
| [GuardDuty](#guardduty) | Sécurité | [12](/courses/cloud-aws/aws_module_12_security_advanced.html), [20](/courses/cloud-aws/aws_module_20_security_zero_trust.html) |
| [IAM](#iam) | Sécurité | [02](/courses/cloud-aws/aws_module_02_iam.html), [08](/courses/cloud-aws/aws_module_08_security.html), [28](/courses/cloud-aws/aws_module_28_iam_advanced.html) |
| [IAM Identity Center](#iam-identity-center) | Sécurité | [28](/courses/cloud-aws/aws_module_28_iam_advanced.html) |
| [Inspector](#inspector) | Sécurité | [12](/courses/cloud-aws/aws_module_12_security_advanced.html), [20](/courses/cloud-aws/aws_module_20_security_zero_trust.html) |
| [Kendra](#kendra) | ML | [33](/courses/cloud-aws/aws_module_33_ml_overview.html) |
| [Keyspaces](#keyspaces) | Database | — |
| [Kinesis](#kinesis) | Analytique | [30](/courses/cloud-aws/aws_module_30_data_services.html) |
| [KMS](#kms) | Sécurité | [08](/courses/cloud-aws/aws_module_08_security.html), [12](/courses/cloud-aws/aws_module_12_security_advanced.html) |
| [Lake Formation](#lake-formation) | Analytique | [30](/courses/cloud-aws/aws_module_30_data_services.html) |
| [Lambda](#lambda) | Serverless | [18](/courses/cloud-aws/aws_module_18_serverless.html), [29](/courses/cloud-aws/aws_module_29_lambda_advanced.html) |
| [Lex](#lex) | ML | [33](/courses/cloud-aws/aws_module_33_ml_overview.html) |
| [Macie](#macie) | Sécurité | [12](/courses/cloud-aws/aws_module_12_security_advanced.html), [20](/courses/cloud-aws/aws_module_20_security_zero_trust.html) |
| [MGN](#mgn) | Migration | [32](/courses/cloud-aws/aws_module_32_migration.html) |
| [MQ](#amazon-mq) | Intégration | [22](/courses/cloud-aws/aws_module_22_distributed.html) |
| [MSK](#msk) | Analytique | — |
| [Neptune](#neptune) | Database | [10](/courses/cloud-aws/aws_module_10_databases.html) |
| [Network Firewall](#network-firewall) | Sécurité | [20](/courses/cloud-aws/aws_module_20_security_zero_trust.html) |
| [OpenSearch](#opensearch) | Analytique | [30](/courses/cloud-aws/aws_module_30_data_services.html) |
| [Organizations](#organizations) | Management | [16](/courses/cloud-aws/aws_module_16_multi_env.html), [24](/courses/cloud-aws/aws_module_24_governance.html) |
| [Polly](#polly) | ML | [33](/courses/cloud-aws/aws_module_33_ml_overview.html) |
| [PrivateLink](#privatelink) | Réseau | [27](/courses/cloud-aws/aws_module_27_vpc_advanced.html) |
| [QLDB](#qldb) | Database | — |
| [QuickSight](#quicksight) | Analytique | [30](/courses/cloud-aws/aws_module_30_data_services.html) |
| [RAM](#ram) | Sécurité | [24](/courses/cloud-aws/aws_module_24_governance.html), [27](/courses/cloud-aws/aws_module_27_vpc_advanced.html) |
| [RDS](#rds) | Database | [10](/courses/cloud-aws/aws_module_10_databases.html) |
| [Redshift](#redshift) | Analytique | [30](/courses/cloud-aws/aws_module_30_data_services.html) |
| [Rekognition](#rekognition) | ML | [33](/courses/cloud-aws/aws_module_33_ml_overview.html) |
| [Route 53](#route53) | Réseau | [11](/courses/cloud-aws/aws_module_11_dns_cdn.html) |
| [S3](#s3) | Stockage | [04](/courses/cloud-aws/aws_module_04_storage.html), [26](/courses/cloud-aws/aws_module_26_s3_advanced.html) |
| [S3 Glacier](#s3-glacier) | Stockage | [04](/courses/cloud-aws/aws_module_04_storage.html), [26](/courses/cloud-aws/aws_module_26_s3_advanced.html) |
| [SageMaker](#sagemaker) | ML | [33](/courses/cloud-aws/aws_module_33_ml_overview.html) |
| [Secrets Manager](#secrets-manager) | Sécurité | [12](/courses/cloud-aws/aws_module_12_security_advanced.html) |
| [Security Hub](#security-hub) | Sécurité | [20](/courses/cloud-aws/aws_module_20_security_zero_trust.html) |
| [Shield](#shield) | Sécurité | [12](/courses/cloud-aws/aws_module_12_security_advanced.html) |
| [Snow Family](#snow-family) | Migration | [32](/courses/cloud-aws/aws_module_32_migration.html) |
| [SNS](#sns) | Intégration | [22](/courses/cloud-aws/aws_module_22_distributed.html) |
| [SQS](#sqs) | Intégration | [22](/courses/cloud-aws/aws_module_22_distributed.html) |
| [Step Functions](#step-functions) | Intégration | [29](/courses/cloud-aws/aws_module_29_lambda_advanced.html) |
| [Storage Gateway](#storage-gateway) | Stockage | [32](/courses/cloud-aws/aws_module_32_migration.html) |
| [Systems Manager](#systems-manager) | Management | [24](/courses/cloud-aws/aws_module_24_governance.html) |
| [Textract](#textract) | ML | [33](/courses/cloud-aws/aws_module_33_ml_overview.html) |
| [Transcribe](#transcribe) | ML | [33](/courses/cloud-aws/aws_module_33_ml_overview.html) |
| [Transfer Family](#transfer-family) | Migration | [32](/courses/cloud-aws/aws_module_32_migration.html) |
| [Transit Gateway](#transit-gateway) | Réseau | [27](/courses/cloud-aws/aws_module_27_vpc_advanced.html) |
| [Translate](#translate) | ML | [33](/courses/cloud-aws/aws_module_33_ml_overview.html) |
| [Trusted Advisor](#trusted-advisor) | Management | [21](/courses/cloud-aws/aws_module_21_finops.html) |
| [VPC](#vpc) | Réseau | [05](/courses/cloud-aws/aws_module_05_vpc.html), [27](/courses/cloud-aws/aws_module_27_vpc_advanced.html) |
| [WAF](#waf) | Sécurité | [12](/courses/cloud-aws/aws_module_12_security_advanced.html) |
| [X-Ray](#x-ray) | Devtools | [15](/courses/cloud-aws/aws_module_15_observability.html) |

---

> **Dernière mise à jour** : Avril 2026 — Aligné sur le programme SAA-C03 et les 33 modules du cours Coursite Cloud & AWS.
