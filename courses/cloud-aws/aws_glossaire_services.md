---
layout: page
title: "Glossaire des services AWS — Dictionnaire SAA-C03"
course: cloud-aws
chapter_title: "Références"
chapter: 5
section: 35
tags: aws,glossaire,dictionnaire,services,saa-c03,reference
difficulty: beginner
duration: 20
mermaid: false
status: published
prev_module: "/courses/cloud-aws/aws_cheatsheet.html"
prev_module_title: "Cheat Sheet AWS — Référence rapide SAA-C03"
---

# Glossaire des services AWS — Dictionnaire SAA-C03

> Dictionnaire de tous les services AWS au programme de l'examen Solutions Architect Associate (SAA-C03).
> Chaque entrée renvoie vers le(s) module(s) du cours où le service est étudié en détail.

**Légende :**
- 🟢 **Dans le champ de l'examen** SAA-C03
- 🔴 **Hors champ** de l'examen (listé pour culture générale)

---

## Analytique
{: #analytique}

### Amazon Athena 🟢
{: #athena}

Service de requêtes SQL interactif et serverless qui permet d'analyser directement des données stockées dans S3. Basé sur Presto. Facturation au volume de données scannées.

**Cas d'usage** : requêtes ad hoc sur des logs, analyses ponctuelles sans ETL, query sur des fichiers CSV/JSON/Parquet dans S3.

📖 [Module 30 — Data Services](/courses/cloud-aws/aws_module_30_data_services.html)

---

### AWS Data Exchange 🟢
{: #data-exchange}

Marketplace pour trouver, s'abonner et utiliser des jeux de données tiers directement dans AWS. Les données sont livrées sous forme de datasets versionnés.

**Cas d'usage** : acquisition de données météo, financières ou démographiques pour enrichir des analyses internes.

---

### AWS Data Pipeline 🟢
{: #data-pipeline}

Service d'orchestration pour déplacer et transformer des données entre services AWS et sources on-prem. Basé sur des pipelines de tâches planifiées.

**Cas d'usage** : ETL planifié entre S3, RDS et Redshift. Note : souvent remplacé par Glue ou Step Functions dans les architectures modernes.

---

### Amazon EMR (Elastic MapReduce) 🟢
{: #emr}

Cluster Hadoop/Spark managé pour le traitement de Big Data. Supporte Spark, Hive, HBase, Presto, Flink.

**Cas d'usage** : traitement de logs massifs, ETL à grande échelle, machine learning distribué.

📖 [Module 30 — Data Services](/courses/cloud-aws/aws_module_30_data_services.html)

---

### AWS Glue 🟢
{: #glue}

Service ETL (Extract, Transform, Load) serverless. Inclut un Data Catalog pour la découverte automatique de schémas via des crawlers.

**Cas d'usage** : transformation de données brutes en données exploitables, alimentation de Redshift/Athena, catalogage d'un data lake S3.

📖 [Module 30 — Data Services](/courses/cloud-aws/aws_module_30_data_services.html)

---

### Amazon Kinesis 🟢
{: #kinesis}

Famille de services pour l'ingestion et le traitement de données en temps réel.

| Sous-service | Rôle |
|--------------|------|
| **Kinesis Data Streams** | Ingestion temps réel, consumers personnalisés |
| **Kinesis Data Firehose** | Livraison vers S3/Redshift/OpenSearch (near real-time) |
| **Kinesis Data Analytics** | Analyse SQL/Flink sur des flux en temps réel |
| **Kinesis Video Streams** | Ingestion de flux vidéo |

**Cas d'usage** : logs applicatifs en streaming, IoT, clickstream analytics, monitoring temps réel.

📖 [Module 30 — Data Services](/courses/cloud-aws/aws_module_30_data_services.html)

---

### AWS Lake Formation 🟢
{: #lake-formation}

Service de gouvernance pour construire, sécuriser et gérer un data lake sur S3. Fournit un contrôle d'accès granulaire (row-level, column-level).

**Cas d'usage** : data lake centralisé avec fine-grained access control, compliance sur des données sensibles.

📖 [Module 30 — Data Services](/courses/cloud-aws/aws_module_30_data_services.html)

---

### Amazon MSK (Managed Streaming for Apache Kafka) 🟢
{: #msk}

Apache Kafka entièrement managé. Compatible avec l'écosystème Kafka existant (producers, consumers, Kafka Connect).

**Cas d'usage** : migration d'un cluster Kafka on-prem vers AWS, event streaming haute performance.

---

### Amazon OpenSearch Service 🟢
{: #opensearch}

Service de recherche et d'analytique managé (successeur d'Amazon Elasticsearch Service). Supporte la recherche full-text, l'analytique de logs, et les dashboards.

**Cas d'usage** : recherche dans des applications, analyse de logs CloudWatch/VPC Flow Logs, dashboards opérationnels.

📖 [Module 30 — Data Services](/courses/cloud-aws/aws_module_30_data_services.html)

---

### Amazon QuickSight 🟢
{: #quicksight}

Service de Business Intelligence (BI) serverless. Permet de créer des dashboards interactifs et des rapports avec ML Insights intégré (SPICE engine).

**Cas d'usage** : dashboards exécutifs, rapports de ventes, visualisation de données Redshift/Athena/S3.

📖 [Module 30 — Data Services](/courses/cloud-aws/aws_module_30_data_services.html)

---

### Amazon Redshift 🟢
{: #redshift}

Data warehouse (entrepôt de données) en colonnes, optimisé pour les requêtes analytiques complexes sur de gros volumes. Architecture MPP (Massive Parallel Processing).

**Cas d'usage** : BI et reporting, agrégation de données multi-sources, requêtes analytiques sur des pétaoctets.

📖 [Module 30 — Data Services](/courses/cloud-aws/aws_module_30_data_services.html)

---

### Amazon CloudSearch 🔴
{: #cloudsearch}

Service de recherche managé. Hors champ SAA-C03 — préférer OpenSearch.

---

## Intégration d'applications
{: #integration}

### Amazon AppFlow 🟢
{: #appflow}

Service d'intégration no-code pour transférer des données entre applications SaaS (Salesforce, Slack, SAP…) et services AWS (S3, Redshift).

**Cas d'usage** : synchronisation CRM → data lake, ingestion de données SaaS sans code.

---

### AWS AppSync 🟢
{: #appsync}

Service d'API GraphQL managé avec support temps réel (subscriptions WebSocket), cache intégré et résolveurs vers DynamoDB, Lambda, RDS.

**Cas d'usage** : applications mobiles/web temps réel, API GraphQL sur des données multi-sources.

📖 [Module 29 — Serverless avancé](/courses/cloud-aws/aws_module_29_lambda_advanced.html)

---

### Amazon EventBridge 🟢
{: #eventbridge}

Bus d'événements serverless (anciennement CloudWatch Events). Permet de router des événements AWS, SaaS ou custom vers des targets (Lambda, SQS, Step Functions…) via des règles et patterns.

**Cas d'usage** : automatisation événementielle, découplage inter-services, intégration SaaS.

📖 [Module 18 — Serverless](/courses/cloud-aws/aws_module_18_serverless.html) · [Module 22 — Architectures distribuées](/courses/cloud-aws/aws_module_22_distributed.html)

---

### Amazon MQ 🟢
{: #amazon-mq}

Service de message broker managé compatible ActiveMQ et RabbitMQ. Supporte les protocoles standards (AMQP, MQTT, STOMP, OpenWire).

**Cas d'usage** : migration d'applications on-prem utilisant un message broker existant sans réécriture de code.

📖 [Module 22 — Architectures distribuées](/courses/cloud-aws/aws_module_22_distributed.html)

---

### Amazon SNS (Simple Notification Service) 🟢
{: #sns}

Service de messagerie pub/sub managé. Un topic SNS distribue les messages à tous les abonnés (fan-out) : SQS, Lambda, email, HTTP, SMS.

**Cas d'usage** : notifications d'alarmes CloudWatch, fan-out vers plusieurs queues SQS, alertes multi-canal.

📖 [Module 22 — Architectures distribuées](/courses/cloud-aws/aws_module_22_distributed.html)

---

### Amazon SQS (Simple Queue Service) 🟢
{: #sqs}

Service de file d'attente (queue) managé et entièrement découplé. Deux modes : Standard (débit illimité, best-effort ordering) et FIFO (ordre garanti, exactly-once).

**Cas d'usage** : découplage producteur/consommateur, buffering de charge, traitement asynchrone.

📖 [Module 22 — Architectures distribuées](/courses/cloud-aws/aws_module_22_distributed.html)

---

### AWS Step Functions 🟢
{: #step-functions}

Service d'orchestration de workflows serverless basé sur des state machines. Deux modes : Standard (longue durée, exactly-once) et Express (haute fréquence, at-least-once).

**Cas d'usage** : orchestration de pipelines ETL, saga pattern pour microservices, workflows d'approbation.

📖 [Module 29 — Serverless avancé](/courses/cloud-aws/aws_module_29_lambda_advanced.html)

---

### Amazon MWAA (Managed Workflows for Apache Airflow) 🔴
{: #mwaa}

Apache Airflow managé. Hors champ SAA-C03.

---

## Gestion des coûts AWS
{: #couts}

### AWS Budgets 🟢
{: #budgets}

Service d'alertes budgétaires. Permet de définir des budgets (coût, usage, RI, Savings Plans) et de recevoir des notifications quand un seuil est atteint ou prévu.

**Cas d'usage** : alertes quand les dépenses dépassent un budget mensuel, suivi de l'utilisation des RI.

📖 [Module 21 — FinOps](/courses/cloud-aws/aws_module_21_finops.html)

---

### AWS Cost and Usage Report (CUR) 🟢
{: #cur}

Rapport le plus détaillé d'AWS sur la consommation. Livré en CSV dans S3, intégrable avec Athena/Redshift pour analyse approfondie.

**Cas d'usage** : analyse fine des coûts par service/compte/tag, chargeback inter-équipes.

📖 [Module 21 — FinOps](/courses/cloud-aws/aws_module_21_finops.html)

---

### AWS Cost Explorer 🟢
{: #cost-explorer}

Interface visuelle pour analyser, visualiser et prévoir les coûts AWS. Inclut des recommandations de RI/Savings Plans.

**Cas d'usage** : identification des services les plus coûteux, prévision de dépenses, analyse de tendances.

📖 [Module 21 — FinOps](/courses/cloud-aws/aws_module_21_finops.html)

---

### Savings Plans 🟢
{: #savings-plans}

Modèle de tarification flexible avec engagement sur un montant $/heure pendant 1 ou 3 ans. S'applique à EC2, Lambda et Fargate. Deux types : Compute (flexible) et EC2 Instance (spécifique).

**Cas d'usage** : réduction de coûts pour workloads stables sans s'engager sur un type d'instance précis.

📖 [Module 21 — FinOps](/courses/cloud-aws/aws_module_21_finops.html)

---

## Compute (Calcul)
{: #compute}

### AWS Batch 🟢
{: #batch}

Service de traitement par lots entièrement managé. Provisionne automatiquement la capacité compute optimale (EC2/Spot/Fargate) en fonction des jobs soumis.

**Cas d'usage** : traitement de données scientifiques, rendu vidéo, simulations financières, pipelines bioinformatiques.

---

### Amazon EC2 (Elastic Compute Cloud) 🟢
{: #ec2}

Service de machines virtuelles (instances) à la demande. Brique fondamentale du compute AWS. Options d'achat : On-Demand, Reserved, Spot, Dedicated.

**Cas d'usage** : serveurs web, applications, bases de données, environnements de développement.

📖 [Module 03 — EC2](/courses/cloud-aws/aws_module_03_ec2.html) · [Module 09 — Load Balancing](/courses/cloud-aws/aws_module_09_load_balancing.html)

---

### Amazon EC2 Auto Scaling 🟢
{: #ec2-auto-scaling}

Service qui ajuste automatiquement le nombre d'instances EC2 en fonction de la demande. Utilise des Launch Templates et des scaling policies (target tracking, step, scheduled).

**Cas d'usage** : absorber les pics de trafic, réduire les coûts pendant les creux, maintenir la haute disponibilité.

📖 [Module 09 — Load Balancing & Auto Scaling](/courses/cloud-aws/aws_module_09_load_balancing.html)

---

### AWS Elastic Beanstalk 🟢
{: #elastic-beanstalk}

PaaS (Platform as a Service) qui déploie et gère automatiquement l'infrastructure (EC2, ASG, ELB, RDS) pour des applications web. Supporte Java, .NET, PHP, Node.js, Python, Go, Docker.

**Cas d'usage** : déploiement rapide d'applications web sans gérer l'infrastructure sous-jacente.

📖 [Module 13 — IaC](/courses/cloud-aws/aws_module_13_iac.html)

---

### AWS Outposts 🟢
{: #outposts}

Infrastructure AWS installée physiquement dans un datacenter on-prem. Même APIs, outils et matériel qu'en région AWS.

**Cas d'usage** : workloads à faible latence nécessitant un traitement local, exigences de résidence des données.

---

### AWS Serverless Application Repository 🟢
{: #sar}

Catalogue d'applications serverless prêtes à l'emploi, publiées par AWS et la communauté. Déployables en un clic via CloudFormation/SAM.

**Cas d'usage** : réutilisation de composants serverless (ex : thumbnail generator, Slack bot).

---

### VMware Cloud on AWS 🟢
{: #vmware-cloud}

VMware SDDC (Software-Defined Data Center) exécuté sur du bare metal AWS. Permet de migrer des workloads VMware sans modification.

**Cas d'usage** : migration VMware vers le cloud, extension de datacenter, disaster recovery.

---

### AWS Wavelength 🟢
{: #wavelength}

Infrastructure AWS déployée dans les réseaux 5G des opérateurs télécom. Latence ultra-faible pour les applications mobiles.

**Cas d'usage** : gaming en temps réel, AR/VR, streaming vidéo sur mobile, IoT edge.

---

### Amazon Lightsail 🔴
{: #lightsail}

VPS simplifié (Virtual Private Server) avec prix fixe. Hors champ SAA-C03.

---

## Containers (Conteneurs)
{: #containers}

### Amazon ECS (Elastic Container Service) 🟢
{: #ecs}

Orchestrateur de conteneurs Docker natif AWS. Gère le déploiement, le scaling et le monitoring de conteneurs. Launch types : EC2 (auto-géré) ou Fargate (serverless).

**Cas d'usage** : microservices conteneurisés, migration d'applications Docker, workloads batch.

📖 [Module 25 — Containers](/courses/cloud-aws/aws_module_25_containers.html)

---

### Amazon ECS Anywhere 🟢
{: #ecs-anywhere}

Extension d'ECS pour exécuter des tâches sur une infrastructure on-prem ou edge, tout en étant orchestrées depuis le control plane ECS dans le cloud.

**Cas d'usage** : workloads hybrides nécessitant une orchestration cloud avec un runtime local.

---

### Amazon ECR (Elastic Container Registry) 🟢
{: #ecr}

Registry Docker privé et managé par AWS. Supporte le scan de vulnérabilités, la réplication cross-region et le lifecycle des images.

**Cas d'usage** : stockage et distribution d'images Docker pour ECS/EKS, intégration CI/CD.

📖 [Module 25 — Containers](/courses/cloud-aws/aws_module_25_containers.html)

---

### Amazon EKS (Elastic Kubernetes Service) 🟢
{: #eks}

Kubernetes managé. AWS gère le control plane (API server, etcd). Supporte EC2 et Fargate comme launch types.

**Cas d'usage** : applications Kubernetes, portabilité multi-cloud, équipes déjà familières avec K8s.

📖 [Module 25 — Containers](/courses/cloud-aws/aws_module_25_containers.html)

---

### Amazon EKS Anywhere 🟢
{: #eks-anywhere}

Distribution Kubernetes pour exécuter des clusters EKS sur infrastructure on-prem (VMware, bare metal).

**Cas d'usage** : environnements déconnectés, exigences de résidence des données, workloads hybrides.

---

### Amazon EKS Distro 🟢
{: #eks-distro}

Distribution open-source de Kubernetes utilisée par EKS. Même version et patches que le service managé.

**Cas d'usage** : exécution de Kubernetes on-prem avec les mêmes composants qu'EKS.

---

## Base de données
{: #database}

### Amazon Aurora 🟢
{: #aurora}

Base de données relationnelle haute performance, compatible MySQL et PostgreSQL. Stockage distribué auto-scaling jusqu'à 128 To, réplication 6 copies sur 3 AZ.

**Cas d'usage** : applications critiques nécessitant haute disponibilité et performance (5× MySQL, 3× PostgreSQL).

📖 [Module 10 — Databases](/courses/cloud-aws/aws_module_10_databases.html)

---

### Amazon Aurora Serverless 🟢
{: #aurora-serverless}

Version serverless d'Aurora. La capacité (ACU - Aurora Capacity Units) s'ajuste automatiquement selon la charge. V2 supporte le scaling instantané.

**Cas d'usage** : applications avec trafic intermittent ou imprévisible, environnements de dev/test.

📖 [Module 10 — Databases](/courses/cloud-aws/aws_module_10_databases.html)

---

### Amazon DocumentDB 🟢
{: #documentdb}

Base de données de documents managée, compatible avec l'API MongoDB. Stockage distribué similaire à Aurora.

**Cas d'usage** : migration d'applications MongoDB vers AWS, workloads document-oriented.

📖 [Module 10 — Databases](/courses/cloud-aws/aws_module_10_databases.html)

---

### Amazon DynamoDB 🟢
{: #dynamodb}

Base de données NoSQL clé-valeur et document, entièrement managée, serverless. Temps de réponse en millisecondes à n'importe quelle échelle. Supporte les modes On-Demand et Provisioned.

**Cas d'usage** : applications web/mobile à haute fréquence, gaming, IoT, sessions utilisateur, carts e-commerce.

📖 [Module 10 — Databases](/courses/cloud-aws/aws_module_10_databases.html)

---

### Amazon ElastiCache 🟢
{: #elasticache}

Service de cache in-memory managé. Deux moteurs : Redis (persistance, réplication, structures de données riches) et Memcached (multi-thread, simple cache).

**Cas d'usage** : cache de sessions, classements temps réel, résultats de requêtes fréquentes.

📖 [Module 19 — Performance](/courses/cloud-aws/aws_module_19_performance.html)

---

### Amazon Keyspaces 🟢
{: #keyspaces}

Base de données compatible Apache Cassandra, serverless et managée.

**Cas d'usage** : migration d'applications Cassandra vers AWS sans gestion de cluster.

---

### Amazon Neptune 🟢
{: #neptune}

Base de données graphe managée. Supporte les modèles Property Graph (Gremlin) et RDF (SPARQL).

**Cas d'usage** : réseaux sociaux, moteurs de recommandation, knowledge graphs, détection de fraude.

📖 [Module 10 — Databases](/courses/cloud-aws/aws_module_10_databases.html)

---

### Amazon QLDB (Quantum Ledger Database) 🟢
{: #qldb}

Base de données ledger avec un journal immuable, vérifiable cryptographiquement. Pas de décentralisation (contrairement à la blockchain).

**Cas d'usage** : audit trail, registre de transactions financières, traçabilité supply chain.

---

### Amazon RDS (Relational Database Service) 🟢
{: #rds}

Service de base de données relationnelle managé. Supporte MySQL, PostgreSQL, MariaDB, Oracle, SQL Server. Gère les backups, patches, Multi-AZ, Read Replicas.

**Cas d'usage** : applications web traditionnelles, ERP, CRM, tout workload relationnel standard.

📖 [Module 10 — Databases](/courses/cloud-aws/aws_module_10_databases.html)

---

## Outils pour développeur
{: #devtools}

### AWS X-Ray 🟢
{: #x-ray}

Service de tracing distribué pour analyser et débugger les applications distribuées. Visualise les appels entre services (service map), identifie les goulots d'étranglement.

**Cas d'usage** : debugging de latence dans les architectures microservices, analyse des erreurs entre Lambda/API Gateway/DynamoDB.

📖 [Module 15 — Observabilité](/courses/cloud-aws/aws_module_15_observability.html)

---

## Applications web et mobiles front-end
{: #frontend}

### AWS Amplify 🟢
{: #amplify}

Plateforme de développement full-stack pour applications web et mobiles. Gère l'hosting, l'authentification (Cognito), le stockage (S3), les APIs (AppSync/API Gateway).

**Cas d'usage** : déploiement rapide d'applications React/Vue/Angular avec backend serverless intégré.

---

### Amazon API Gateway 🟢
{: #api-gateway}

Service managé pour créer, publier et gérer des APIs REST, HTTP et WebSocket. Supporte le throttling, le caching, l'autorisation (IAM, Cognito, Lambda Authorizer).

**Cas d'usage** : exposer des Lambda comme APIs REST, proxy vers des backends EC2/ECS, API mobile/web.

📖 [Module 18 — Serverless](/courses/cloud-aws/aws_module_18_serverless.html)

---

### AWS Device Farm 🟢
{: #device-farm}

Service de test d'applications sur des appareils réels (mobiles, tablettes, navigateurs) hébergés par AWS.

**Cas d'usage** : tests automatisés cross-device, validation d'applications iOS/Android.

---

### Amazon Pinpoint 🟢
{: #pinpoint}

Service de communication multicanal (email, SMS, push, voix, in-app) avec segmentation d'audience et analytique de campagnes.

**Cas d'usage** : campagnes marketing ciblées, notifications transactionnelles, engagement utilisateur.

---

## Machine Learning
{: #ml}

### Amazon Comprehend 🟢
{: #comprehend}

Service NLP (Natural Language Processing) pour extraire des insights depuis du texte : sentiments, entités, phrases clés, langue.

**Cas d'usage** : analyse de sentiments sur des avis clients, extraction d'entités depuis des documents.

📖 [Module 33 — ML Overview](/courses/cloud-aws/aws_module_33_ml_overview.html)

---

### Amazon Forecast 🟢
{: #forecast}

Service de prévisions temporelles basé sur le ML. Utilise les mêmes algorithmes qu'Amazon.com pour prédire des séries chronologiques.

**Cas d'usage** : prévision de ventes, planification de la demande, estimation de trafic.

📖 [Module 33 — ML Overview](/courses/cloud-aws/aws_module_33_ml_overview.html)

---

### Amazon Fraud Detector 🟢
{: #fraud-detector}

Service de détection de fraude en ligne basé sur le ML. Entraîné automatiquement sur des données historiques de transactions.

**Cas d'usage** : détection de fraude sur des paiements en ligne, comptes frauduleux, abus de promotions.

📖 [Module 33 — ML Overview](/courses/cloud-aws/aws_module_33_ml_overview.html)

---

### Amazon Kendra 🟢
{: #kendra}

Service de recherche intelligent (enterprise search) alimenté par le ML. Comprend le langage naturel pour retourner des réponses précises.

**Cas d'usage** : recherche interne dans une base de connaissances, FAQ intelligente, portail self-service.

📖 [Module 33 — ML Overview](/courses/cloud-aws/aws_module_33_ml_overview.html)

---

### Amazon Lex 🟢
{: #lex}

Service de création de chatbots conversationnels avec reconnaissance vocale et compréhension du langage naturel. Même technologie qu'Alexa.

**Cas d'usage** : chatbot de support client, assistant vocal, automatisation d'interactions.

📖 [Module 33 — ML Overview](/courses/cloud-aws/aws_module_33_ml_overview.html)

---

### Amazon Polly 🟢
{: #polly}

Service Text-to-Speech (TTS) qui transforme du texte en parole naturelle. Supporte des dizaines de langues et voix (standard et neural).

**Cas d'usage** : accessibilité, narration automatique, assistants vocaux, e-learning.

📖 [Module 33 — ML Overview](/courses/cloud-aws/aws_module_33_ml_overview.html)

---

### Amazon Rekognition 🟢
{: #rekognition}

Service d'analyse d'images et de vidéos par ML. Détecte des objets, visages, texte, scènes, contenu inapproprié.

**Cas d'usage** : modération de contenu, vérification d'identité, recherche visuelle.

📖 [Module 33 — ML Overview](/courses/cloud-aws/aws_module_33_ml_overview.html)

---

### Amazon SageMaker 🟢
{: #sagemaker}

Plateforme ML complète pour construire, entraîner et déployer des modèles à grande échelle. Inclut des notebooks, des algorithmes intégrés, le tuning automatique et les endpoints d'inférence.

**Cas d'usage** : développement de modèles ML personnalisés, entraînement distribué, MLOps.

📖 [Module 33 — ML Overview](/courses/cloud-aws/aws_module_33_ml_overview.html)

---

### Amazon Textract 🟢
{: #textract}

Service d'OCR intelligent qui extrait du texte, des formulaires et des tableaux depuis des documents scannés (PDF, images).

**Cas d'usage** : extraction de données depuis des factures, contrats, formulaires administratifs.

📖 [Module 33 — ML Overview](/courses/cloud-aws/aws_module_33_ml_overview.html)

---

### Amazon Transcribe 🟢
{: #transcribe}

Service Speech-to-Text (STT) qui convertit la parole en texte. Supporte le temps réel et le batch, la ponctuation automatique, le vocabulaire personnalisé.

**Cas d'usage** : transcription d'appels, sous-titrage automatique, analyse de conversations.

📖 [Module 33 — ML Overview](/courses/cloud-aws/aws_module_33_ml_overview.html)

---

### Amazon Translate 🟢
{: #translate}

Service de traduction automatique neuronale. Supporte des dizaines de paires de langues avec personnalisation du vocabulaire.

**Cas d'usage** : localisation de contenu, traduction de communications, chat multilingue.

📖 [Module 33 — ML Overview](/courses/cloud-aws/aws_module_33_ml_overview.html)

---

## Management et gouvernance
{: #management}

### AWS Auto Scaling 🟢
{: #auto-scaling}

Service centralisé pour configurer le scaling automatique de plusieurs ressources AWS (EC2, ECS, DynamoDB, Aurora) via des scaling plans.

**Cas d'usage** : gestion du scaling à l'échelle de l'application (pas juste EC2).

📖 [Module 09 — Load Balancing & Auto Scaling](/courses/cloud-aws/aws_module_09_load_balancing.html)

---

### AWS CloudFormation 🟢
{: #cloudformation}

Service Infrastructure as Code (IaC) natif AWS. Déploie et gère des stacks de ressources via des templates YAML/JSON déclaratifs.

**Cas d'usage** : déploiement reproductible d'infrastructure, gestion multi-environnement, compliance as code.

📖 [Module 13 — IaC](/courses/cloud-aws/aws_module_13_iac.html)

---

### AWS CloudTrail 🟢
{: #cloudtrail}

Service d'audit qui enregistre tous les appels API effectués dans un compte AWS. Stocke les événements dans S3 et CloudWatch Logs.

**Cas d'usage** : audit de sécurité, investigation d'incidents, compliance, détection de changements non autorisés.

📖 [Module 07 — CloudWatch](/courses/cloud-aws/aws_module_07_cloudwatch.html) · [Module 20 — Zero Trust](/courses/cloud-aws/aws_module_20_security_zero_trust.html)

---

### Amazon CloudWatch 🟢
{: #cloudwatch}

Service de monitoring et observabilité AWS. Collecte des métriques, centralise les logs, déclenche des alarmes et crée des dashboards.

| Composant | Rôle |
|-----------|------|
| Metrics | Métriques de performance (CPU, réseau, custom) |
| Logs | Centralisation et analyse de logs |
| Alarms | Alertes sur dépassement de seuil |
| Dashboards | Visualisation en temps réel |
| Events/EventBridge | Réaction aux changements d'état |

📖 [Module 07 — CloudWatch](/courses/cloud-aws/aws_module_07_cloudwatch.html) · [Module 15 — Observabilité](/courses/cloud-aws/aws_module_15_observability.html)

---

### AWS CLI (Command Line Interface) 🟢
{: #cli}

Interface en ligne de commande pour interagir avec tous les services AWS. Supporte les profiles, la complétion, le filtrage JMESPath et la pagination.

📖 [Module 06 — AWS CLI](/courses/cloud-aws/aws_module_06_cli.html)

---

### AWS Compute Optimizer 🟢
{: #compute-optimizer}

Service de recommandations de rightsizing basé sur l'analyse des métriques CloudWatch. Couvre EC2, EBS, Lambda, ECS on Fargate.

**Cas d'usage** : identifier les instances sur/sous-dimensionnées pour optimiser les coûts.

📖 [Module 21 — FinOps](/courses/cloud-aws/aws_module_21_finops.html)

---

### AWS Config 🟢
{: #config}

Service de conformité continue qui évalue la configuration des ressources AWS par rapport à des règles définies. Historique complet des changements de configuration.

**Cas d'usage** : détection de non-conformité (SG ouvert, bucket public), remédiation automatique, audit.

📖 [Module 20 — Zero Trust](/courses/cloud-aws/aws_module_20_security_zero_trust.html) · [Module 24 — Governance](/courses/cloud-aws/aws_module_24_governance.html)

---

### AWS Control Tower 🟢
{: #control-tower}

Service de Landing Zone automatisée pour configurer et gouverner un environnement multi-comptes AWS selon les bonnes pratiques. Inclut des guardrails (préventifs et détectifs).

**Cas d'usage** : mise en place initiale d'un environnement multi-comptes sécurisé et conforme.

📖 [Module 24 — Governance](/courses/cloud-aws/aws_module_24_governance.html) · [Module 28 — IAM avancé](/courses/cloud-aws/aws_module_28_iam_advanced.html)

---

### AWS Health Dashboard 🟢
{: #health-dashboard}

Tableau de bord personnalisé montrant la santé des services AWS qui affectent vos ressources. Anciennement Personal Health Dashboard.

**Cas d'usage** : alertes proactives sur les maintenances et incidents impactant votre compte.

---

### AWS License Manager 🟢
{: #license-manager}

Service de gestion et suivi des licences logicielles (Oracle, Windows Server, SAP…) dans le cloud et on-prem.

**Cas d'usage** : conformité des licences BYOL, suivi de l'utilisation des licences.

---

### Amazon Managed Grafana 🟢
{: #managed-grafana}

Grafana entièrement managé pour la visualisation de métriques et logs. S'intègre avec CloudWatch, Prometheus, X-Ray.

**Cas d'usage** : dashboards opérationnels avancés, alternative à CloudWatch Dashboards.

📖 [Module 15 — Observabilité](/courses/cloud-aws/aws_module_15_observability.html)

---

### Amazon Managed Service for Prometheus 🟢
{: #managed-prometheus}

Service Prometheus managé pour le monitoring de conteneurs. Compatible avec les métriques PromQL et l'écosystème Prometheus.

**Cas d'usage** : monitoring Kubernetes (EKS), collecte de métriques de conteneurs.

📖 [Module 15 — Observabilité](/courses/cloud-aws/aws_module_15_observability.html)

---

### AWS Management Console 🟢
{: #console}

Interface web graphique pour gérer les services AWS. Point d'entrée principal pour les utilisateurs.

---

### AWS Organizations 🟢
{: #organizations}

Service de gestion multi-comptes AWS. Permet la facturation consolidée (consolidated billing) et les Service Control Policies (SCP) pour limiter les actions par OU (Organizational Unit).

**Cas d'usage** : gouvernance multi-comptes, séparation des environnements, consolidated billing.

📖 [Module 16 — Multi-environnement](/courses/cloud-aws/aws_module_16_multi_env.html) · [Module 24 — Governance](/courses/cloud-aws/aws_module_24_governance.html)

---

### AWS Proton 🟢
{: #proton}

Service de gestion de templates d'infrastructure pour les équipes platform engineering. Permet de créer des environnements et services standardisés.

**Cas d'usage** : self-service infrastructure pour les développeurs, standardisation des déploiements.

---

### AWS Service Catalog 🟢
{: #service-catalog}

Catalogue de produits IT approuvés (templates CloudFormation) que les utilisateurs peuvent déployer en self-service avec des guardrails.

**Cas d'usage** : gouvernance IT, self-service contrôlé, standardisation des ressources.

📖 [Module 24 — Governance](/courses/cloud-aws/aws_module_24_governance.html)

---

### AWS Systems Manager 🟢
{: #systems-manager}

Suite d'outils de gestion opérationnelle pour EC2 et on-prem. Inclut : Run Command, Patch Manager, Parameter Store, Session Manager, Automation.

| Composant | Rôle |
|-----------|------|
| SSM Agent | Agent installé sur les instances |
| Run Command | Exécution à distance sans SSH |
| Patch Manager | Automatisation du patching |
| Parameter Store | Stockage de config/secrets (gratuit) |
| Session Manager | Shell distant sans ouvrir de port |

📖 [Module 24 — Governance](/courses/cloud-aws/aws_module_24_governance.html)

---

### AWS Trusted Advisor 🟢
{: #trusted-advisor}

Service de recommandations automatiques sur 5 catégories : coût, performance, sécurité, tolérance aux pannes, limites de service. Plan Basic : 7 checks core. Plan Business/Enterprise : tous les checks.

**Cas d'usage** : audits automatiques de bonnes pratiques, détection de SG ouverts, rightsizing.

📖 [Module 21 — FinOps](/courses/cloud-aws/aws_module_21_finops.html)

---

### AWS Well-Architected Tool 🟢
{: #well-architected-tool}

Outil d'auto-évaluation basé sur le Well-Architected Framework (6 piliers). Génère un rapport avec des recommandations d'amélioration.

**Cas d'usage** : revue d'architecture, identification des risques, préparation d'audits.

📖 [Module 24 — Governance](/courses/cloud-aws/aws_module_24_governance.html)

---

## Services multimédias
{: #media}

### Amazon Elastic Transcoder 🟢
{: #elastic-transcoder}

Service de transcodage vidéo dans le cloud. Convertit des fichiers vidéo stockés dans S3 en formats adaptés aux différents appareils.

**Cas d'usage** : conversion de vidéos pour streaming adaptatif (HLS), création de thumbnails.

---

### Amazon Kinesis Video Streams 🟢
{: #kinesis-video}

Service d'ingestion et de stockage de flux vidéo pour analyse. S'intègre avec Rekognition pour l'analyse en temps réel.

**Cas d'usage** : vidéo-surveillance, analyse vidéo en temps réel, smart home.

---

## Migration et transfert
{: #migration}

### AWS Application Discovery Service 🟢
{: #discovery-service}

Service d'inventaire pour planifier une migration. Collecte des données sur les serveurs on-prem (config, utilisation, dépendances).

**Cas d'usage** : phase de découverte avant migration, cartographie des dépendances applicatives.

📖 [Module 32 — Migration](/courses/cloud-aws/aws_module_32_migration.html)

---

### AWS Application Migration Service (MGN) 🟢
{: #mgn}

Service de migration lift-and-shift (rehost). Réplique les serveurs on-prem vers AWS avec un temps d'arrêt minimal. Successeur de CloudEndure Migration.

**Cas d'usage** : migration de serveurs physiques ou VM vers EC2 sans modification.

📖 [Module 32 — Migration](/courses/cloud-aws/aws_module_32_migration.html)

---

### AWS DMS (Database Migration Service) 🟢
{: #dms}

Service de migration de bases de données. Supporte les migrations homogènes (MySQL → MySQL) et hétérogènes (Oracle → Aurora, avec SCT). Mode continu pour la réplication.

**Cas d'usage** : migration de BDD on-prem vers RDS/Aurora, synchronisation continue pendant la migration.

📖 [Module 32 — Migration](/courses/cloud-aws/aws_module_32_migration.html)

---

### AWS DataSync 🟢
{: #datasync}

Service de transfert de données automatisé entre systèmes de stockage on-prem (NFS, SMB, HDFS) et AWS (S3, EFS, FSx). Chiffré et vérifié.

**Cas d'usage** : migration de fichiers vers S3/EFS, synchronisation récurrente on-prem → cloud.

📖 [Module 32 — Migration](/courses/cloud-aws/aws_module_32_migration.html)

---

### AWS Migration Hub 🟢
{: #migration-hub}

Console centralisée pour suivre l'avancement des migrations depuis plusieurs outils AWS (MGN, DMS, Discovery Service).

**Cas d'usage** : vue d'ensemble du portefeuille de migration, suivi de progression multi-workloads.

📖 [Module 32 — Migration](/courses/cloud-aws/aws_module_32_migration.html)

---

### AWS Snow Family 🟢
{: #snow-family}

Appareils physiques pour le transfert de données à grande échelle et le edge computing.

| Appareil | Capacité | Cas d'usage |
|----------|----------|-------------|
| Snowcone | 8-14 To | Edge computing, petits transferts |
| Snowball Edge Storage | 80 To | Transfert massif, stockage temporaire |
| Snowball Edge Compute | 42 To + GPU | Edge computing, ML local |
| Snowmobile | 100 Po | Migration de datacenter entier |

📖 [Module 32 — Migration](/courses/cloud-aws/aws_module_32_migration.html)

---

### AWS Transfer Family 🟢
{: #transfer-family}

Service SFTP, FTPS, FTP et AS2 entièrement managé, avec stockage sur S3 ou EFS. Compatible avec les workflows de transfert existants.

**Cas d'usage** : migration de serveurs FTP on-prem vers AWS, échanges B2B via SFTP.

📖 [Module 32 — Migration](/courses/cloud-aws/aws_module_32_migration.html)

---

## Mise en réseau et diffusion de contenu
{: #networking}

### AWS Client VPN 🟢
{: #client-vpn}

VPN client-to-site managé basé sur OpenVPN. Permet aux utilisateurs distants de se connecter au VPC via un tunnel chiffré.

**Cas d'usage** : accès distant sécurisé des employés aux ressources AWS.

📖 [Module 27 — VPC avancé](/courses/cloud-aws/aws_module_27_vpc_advanced.html)

---

### Amazon CloudFront 🟢
{: #cloudfront}

CDN (Content Delivery Network) global avec plus de 400 edge locations. Cache le contenu au plus près des utilisateurs. Supporte le HTTPS, les Lambda@Edge et les CloudFront Functions.

**Cas d'usage** : accélération de sites web, streaming vidéo, distribution de fichiers S3, protection DDoS (couche 7).

📖 [Module 11 — DNS & CDN](/courses/cloud-aws/aws_module_11_dns_cdn.html) · [Module 19 — Performance](/courses/cloud-aws/aws_module_19_performance.html)

---

### AWS Direct Connect 🟢
{: #direct-connect}

Connexion réseau dédiée (fibre) entre un datacenter on-prem et AWS. Latence prévisible, bande passante élevée (1-100 Gbps), ne passe pas par Internet.

**Cas d'usage** : workloads sensibles à la latence, transferts de données massifs, compliance (données ne transitant pas par Internet).

📖 [Module 27 — VPC avancé](/courses/cloud-aws/aws_module_27_vpc_advanced.html)

---

### Elastic Load Balancing (ELB) 🟢
{: #elb}

Famille de load balancers managés qui distribuent le trafic sur plusieurs targets (EC2, ECS, Lambda, IP).

| Type | Couche | Usage principal |
|------|--------|-----------------|
| ALB | 7 (HTTP) | Routing par path/host, micro-services |
| NLB | 4 (TCP/UDP) | Ultra-haute perf, IP statique |
| GLB | 3 (IP) | Appliances réseau (firewall) |

📖 [Module 09 — Load Balancing](/courses/cloud-aws/aws_module_09_load_balancing.html)

---

### AWS Global Accelerator 🟢
{: #global-accelerator}

Service de networking qui route le trafic via le backbone privé AWS vers l'endpoint optimal. Fournit 2 IP anycast statiques.

**Cas d'usage** : applications globales nécessitant une latence faible et un failover rapide entre régions.

📖 [Module 19 — Performance](/courses/cloud-aws/aws_module_19_performance.html) · [Module 27 — VPC avancé](/courses/cloud-aws/aws_module_27_vpc_advanced.html)

---

### AWS PrivateLink 🟢
{: #privatelink}

Connexion privée entre VPC via le réseau AWS sans passer par Internet, VPN ou peering. Utilise des VPC Endpoint Interface (ENI).

**Cas d'usage** : accéder à des services AWS ou SaaS en privé, exposer un service à des clients sans Internet.

📖 [Module 27 — VPC avancé](/courses/cloud-aws/aws_module_27_vpc_advanced.html)

---

### Amazon Route 53 🟢
{: #route53}

Service DNS managé avec health checks et routing policies avancées (weighted, latency, failover, geolocation, geoproximity, multi-value).

**Cas d'usage** : enregistrement de domaines, résolution DNS, routing géographique, failover DNS.

📖 [Module 11 — DNS & CDN](/courses/cloud-aws/aws_module_11_dns_cdn.html)

---

### AWS Site-to-Site VPN 🟢
{: #site-to-site-vpn}

Tunnel IPsec chiffré entre un réseau on-prem et un VPC AWS, via Internet. Deux tunnels redondants par connexion.

**Cas d'usage** : connectivité hybride rapide à mettre en place (en attendant Direct Connect ou comme backup).

📖 [Module 27 — VPC avancé](/courses/cloud-aws/aws_module_27_vpc_advanced.html)

---

### AWS Transit Gateway 🟢
{: #transit-gateway}

Hub réseau centralisé pour interconnecter des VPC, des VPN et des connexions Direct Connect. Supporte le routage transitif et le peering inter-régions.

**Cas d'usage** : topologie hub-and-spoke pour des dizaines/centaines de VPC, simplification du réseau multi-comptes.

📖 [Module 27 — VPC avancé](/courses/cloud-aws/aws_module_27_vpc_advanced.html)

---

### Amazon VPC (Virtual Private Cloud) 🟢
{: #vpc}

Réseau virtuel isolé dans le cloud AWS. Composants : subnets, route tables, IGW, NAT Gateway, NACL, Security Groups, VPC Endpoints.

**Cas d'usage** : isolation réseau de toute architecture AWS, segmentation public/privé, contrôle du trafic.

📖 [Module 05 — VPC](/courses/cloud-aws/aws_module_05_vpc.html) · [Module 27 — VPC avancé](/courses/cloud-aws/aws_module_27_vpc_advanced.html)

---

## Sécurité, identité et conformité
{: #security}

### AWS Artifact 🟢
{: #artifact}

Portail en libre-service pour accéder aux rapports de conformité AWS (SOC, PCI, ISO) et accepter les accords (BAA, NDA).

**Cas d'usage** : obtenir des rapports d'audit AWS pour sa propre conformité.

---

### AWS Audit Manager 🟢
{: #audit-manager}

Service d'automatisation de la collecte de preuves pour les audits de conformité. Mappage automatique vers des frameworks (PCI-DSS, GDPR, SOC 2).

**Cas d'usage** : préparation d'audits, collecte continue de preuves de conformité.

---

### AWS Certificate Manager (ACM) 🟢
{: #acm}

Service de gestion de certificats TLS/SSL. Fournit des certificats publics gratuits, renouvellement automatique. S'intègre avec ELB, CloudFront, API Gateway.

**Cas d'usage** : HTTPS sur les load balancers et distributions CloudFront, gestion centralisée des certificats.

📖 [Module 12 — Sécurité avancée](/courses/cloud-aws/aws_module_12_security_advanced.html)

---

### AWS CloudHSM 🟢
{: #cloudhsm}

HSM (Hardware Security Module) dédié dans le cloud AWS. Contrôle total des clés de chiffrement (FIPS 140-2 Level 3). Contrairement à KMS, le client gère les clés.

**Cas d'usage** : conformité réglementaire stricte, chiffrement où le client doit contrôler le HSM.

📖 [Module 12 — Sécurité avancée](/courses/cloud-aws/aws_module_12_security_advanced.html)

---

### Amazon Cognito 🟢
{: #cognito}

Service d'authentification et d'autorisation pour applications web/mobile.

| Composant | Rôle |
|-----------|------|
| User Pool | Répertoire d'utilisateurs (sign-up, sign-in, MFA, social login) |
| Identity Pool | Fournit des credentials AWS temporaires aux utilisateurs authentifiés |

📖 [Module 29 — Serverless avancé](/courses/cloud-aws/aws_module_29_lambda_advanced.html)

---

### Amazon Detective 🟢
{: #detective}

Service d'investigation de sécurité qui analyse automatiquement les données de CloudTrail, VPC Flow Logs et GuardDuty pour identifier la cause racine d'un incident.

**Cas d'usage** : investigation après une alerte GuardDuty, analyse forensique.

📖 [Module 20 — Zero Trust](/courses/cloud-aws/aws_module_20_security_zero_trust.html)

---

### AWS Directory Service 🟢
{: #directory-service}

Service Active Directory managé dans le cloud AWS. Trois options : AWS Managed Microsoft AD, AD Connector (proxy vers AD on-prem), Simple AD.

**Cas d'usage** : intégration avec Active Directory existant, authentification Windows, jointure de domaine pour EC2.

📖 [Module 28 — IAM avancé](/courses/cloud-aws/aws_module_28_iam_advanced.html)

---

### AWS Firewall Manager 🟢
{: #firewall-manager}

Service de gestion centralisée des règles de sécurité (WAF, Shield Advanced, Security Groups, Network Firewall) sur plusieurs comptes via Organizations.

**Cas d'usage** : déploiement de règles WAF sur toutes les distributions CloudFront/ALB d'une organisation.

📖 [Module 12 — Sécurité avancée](/courses/cloud-aws/aws_module_12_security_advanced.html)

---

### Amazon GuardDuty 🟢
{: #guardduty}

Service de détection de menaces intelligent qui analyse en continu les logs AWS (CloudTrail, VPC Flow Logs, DNS) avec du ML pour identifier les comportements suspects.

**Cas d'usage** : détection de crypto-mining, accès inhabituels, reconnaissance réseau, compromission de credentials.

📖 [Module 12 — Sécurité avancée](/courses/cloud-aws/aws_module_12_security_advanced.html) · [Module 20 — Zero Trust](/courses/cloud-aws/aws_module_20_security_zero_trust.html)

---

### AWS IAM Identity Center (SSO) 🟢
{: #iam-identity-center}

Service de Single Sign-On centralisé pour accéder à plusieurs comptes AWS et applications SaaS avec une seule identité. Successeur d'AWS SSO.

**Cas d'usage** : accès SSO multi-comptes pour les équipes, intégration avec un Identity Provider externe (Okta, Azure AD).

📖 [Module 28 — IAM avancé](/courses/cloud-aws/aws_module_28_iam_advanced.html)

---

### AWS IAM (Identity and Access Management) 🟢
{: #iam}

Service fondamental de gestion des identités et des permissions dans AWS. Gratuit. Contrôle qui peut faire quoi sur quelles ressources.

📖 [Module 02 — IAM](/courses/cloud-aws/aws_module_02_iam.html) · [Module 08 — Sécurité](/courses/cloud-aws/aws_module_08_security.html) · [Module 28 — IAM avancé](/courses/cloud-aws/aws_module_28_iam_advanced.html)

---

### Amazon Inspector 🟢
{: #inspector}

Service de scan de vulnérabilités automatisé pour EC2, images ECR et fonctions Lambda. Détecte les CVE, les problèmes réseau et les configurations exposées.

**Cas d'usage** : audit de sécurité continu, scan de vulnérabilités dans un pipeline CI/CD.

📖 [Module 12 — Sécurité avancée](/courses/cloud-aws/aws_module_12_security_advanced.html) · [Module 20 — Zero Trust](/courses/cloud-aws/aws_module_20_security_zero_trust.html)

---

### AWS KMS (Key Management Service) 🟢
{: #kms}

Service de gestion de clés de chiffrement managé. Crée et contrôle des CMK (Customer Master Keys) pour chiffrer les données. Intégré avec la plupart des services AWS (S3, EBS, RDS, etc.).

**Cas d'usage** : chiffrement at-rest de toutes les données AWS, rotation automatique des clés, audit via CloudTrail.

📖 [Module 08 — Sécurité](/courses/cloud-aws/aws_module_08_security.html) · [Module 12 — Sécurité avancée](/courses/cloud-aws/aws_module_12_security_advanced.html)

---

### Amazon Macie 🟢
{: #macie}

Service de découverte et protection de données sensibles dans S3. Utilise le ML pour identifier les PII (Personally Identifiable Information), données financières, secrets.

**Cas d'usage** : audit de conformité GDPR/PCI, détection de données sensibles dans des buckets S3.

📖 [Module 12 — Sécurité avancée](/courses/cloud-aws/aws_module_12_security_advanced.html) · [Module 20 — Zero Trust](/courses/cloud-aws/aws_module_20_security_zero_trust.html)

---

### AWS Network Firewall 🟢
{: #network-firewall}

Firewall réseau managé (Layer 3-7) déployé dans un VPC. Inspection de paquets, filtrage par domaine, détection d'intrusion (IDS/IPS).

**Cas d'usage** : filtrage du trafic entrant/sortant d'un VPC, protection périmétrique avancée.

📖 [Module 20 — Zero Trust](/courses/cloud-aws/aws_module_20_security_zero_trust.html)

---

### AWS RAM (Resource Access Manager) 🟢
{: #ram}

Service de partage de ressources AWS entre comptes ou au sein d'une Organization. Ressources partageables : subnets, Transit Gateways, Route 53 Resolver rules, etc.

**Cas d'usage** : partager un Transit Gateway ou des subnets entre plusieurs comptes.

📖 [Module 24 — Governance](/courses/cloud-aws/aws_module_24_governance.html) · [Module 27 — VPC avancé](/courses/cloud-aws/aws_module_27_vpc_advanced.html)

---

### AWS Secrets Manager 🟢
{: #secrets-manager}

Service de stockage et de rotation automatique de secrets (mots de passe BDD, clés API, tokens). Intégration native avec RDS pour la rotation.

**Cas d'usage** : stockage sécurisé de credentials d'accès BDD, rotation automatique des mots de passe RDS.

📖 [Module 12 — Sécurité avancée](/courses/cloud-aws/aws_module_12_security_advanced.html)

---

### AWS Security Hub 🟢
{: #security-hub}

Tableau de bord centralisé qui agrège les findings de GuardDuty, Inspector, Macie, Firewall Manager et AWS Config. Évalue la posture de sécurité contre des standards (CIS, PCI-DSS).

**Cas d'usage** : vue centralisée de la sécurité multi-comptes, scoring de conformité, priorisation des risques.

📖 [Module 20 — Zero Trust](/courses/cloud-aws/aws_module_20_security_zero_trust.html)

---

### AWS Shield 🟢
{: #shield}

Protection DDoS managée. **Standard** : gratuit, Layer 3/4, activé automatiquement. **Advanced** : payant, Layer 3/4/7, support 24/7, protection financière.

**Cas d'usage** : protection contre les attaques DDoS sur les applications web (CloudFront, ALB, Route 53).

📖 [Module 12 — Sécurité avancée](/courses/cloud-aws/aws_module_12_security_advanced.html)

---

### AWS WAF (Web Application Firewall) 🟢
{: #waf}

Firewall applicatif (Layer 7) qui filtre le trafic HTTP/HTTPS selon des règles personnalisées. Protège contre les injections SQL, XSS, bots, rate limiting.

**Cas d'usage** : protection des applications web derrière CloudFront, ALB ou API Gateway.

📖 [Module 12 — Sécurité avancée](/courses/cloud-aws/aws_module_12_security_advanced.html)

---

## Serverless (Sans serveur)
{: #serverless}

### AWS AppSync 🟢
{: #appsync-serverless}

*(Voir [AppSync dans Intégration d'applications](#appsync))*

---

### AWS Fargate 🟢
{: #fargate}

Moteur de compute serverless pour conteneurs (ECS et EKS). Pas de gestion de serveurs — pricing au vCPU et à la mémoire utilisée.

**Cas d'usage** : exécution de conteneurs sans gérer d'instances EC2, workloads imprévisibles.

📖 [Module 25 — Containers](/courses/cloud-aws/aws_module_25_containers.html)

---

### AWS Lambda 🟢
{: #lambda}

Service de compute serverless (FaaS — Function as a Service). Exécute du code en réponse à des événements (S3, API Gateway, SQS, EventBridge…). Facturation à la milliseconde.

| Limite | Valeur |
|--------|--------|
| Timeout max | 15 minutes |
| Mémoire | 128 Mo – 10 Go |
| Package déploiement | 50 Mo (zippé) / 250 Mo (unzippé) |
| Concurrence par région | 1 000 (par défaut, extensible) |
| Taille payload synchrone | 6 Mo |
| /tmp storage | 512 Mo – 10 Go |

📖 [Module 18 — Serverless](/courses/cloud-aws/aws_module_18_serverless.html) · [Module 29 — Serverless avancé](/courses/cloud-aws/aws_module_29_lambda_advanced.html)

---

## Stockage
{: #storage}

### AWS Backup 🟢
{: #backup}

Service de sauvegarde centralisé pour automatiser et gérer les backups de multiples services AWS (EBS, RDS, DynamoDB, EFS, S3, FSx, EC2).

**Cas d'usage** : politique de backup unifiée, conservation multi-régions, compliance.

📖 [Module 32 — Migration](/courses/cloud-aws/aws_module_32_migration.html)

---

### Amazon EBS (Elastic Block Store) 🟢
{: #ebs}

Stockage block persistant pour EC2. Attaché à une instance dans une AZ. Types : gp3 (usage général), io2 (IOPS intensif), st1 (débit), sc1 (archive).

**Cas d'usage** : disque système EC2, bases de données, stockage applicatif.

📖 [Module 03 — EC2](/courses/cloud-aws/aws_module_03_ec2.html) · [Module 04 — Stockage](/courses/cloud-aws/aws_module_04_storage.html)

---

### Amazon EFS (Elastic File System) 🟢
{: #efs}

Système de fichiers NFS managé, élastique et multi-AZ. La taille s'ajuste automatiquement. Linux uniquement.

**Cas d'usage** : partage de fichiers entre instances EC2, CMS, CI/CD, conteneurs.

📖 [Module 04 — Stockage](/courses/cloud-aws/aws_module_04_storage.html)

---

### Amazon FSx 🟢
{: #fsx}

Famille de systèmes de fichiers managés haute performance.

| Type | Protocole | Cas d'usage |
|------|-----------|-------------|
| FSx for Windows File Server | SMB | Workloads Windows, Active Directory |
| FSx for Lustre | POSIX | HPC, Machine Learning, traitement parallèle |
| FSx for NetApp ONTAP | NFS/SMB/iSCSI | Migration NetApp vers AWS |
| FSx for OpenZFS | NFS | Workloads Linux haute perf |

📖 [Module 32 — Migration](/courses/cloud-aws/aws_module_32_migration.html)

---

### Amazon S3 (Simple Storage Service) 🟢
{: #s3}

Stockage objet serverless avec durabilité de 99,999999999 % (11 nines). Stockage illimité, objets jusqu'à 5 To. Fondation du data lake AWS.

**Cas d'usage** : hébergement de fichiers statiques, data lake, backup, distribution de contenu, stockage de logs.

📖 [Module 04 — Stockage](/courses/cloud-aws/aws_module_04_storage.html) · [Module 26 — S3 avancé](/courses/cloud-aws/aws_module_26_s3_advanced.html)

---

### Amazon S3 Glacier 🟢
{: #s3-glacier}

Classes de stockage d'archivage long terme dans S3. Trois tiers : Glacier Instant Retrieval (ms), Glacier Flexible Retrieval (min-h), Glacier Deep Archive (h).

**Cas d'usage** : archivage de données réglementaires, backups long terme, données rarement accédées.

📖 [Module 04 — Stockage](/courses/cloud-aws/aws_module_04_storage.html) · [Module 26 — S3 avancé](/courses/cloud-aws/aws_module_26_s3_advanced.html)

---

### AWS Storage Gateway 🟢
{: #storage-gateway}

Service hybride qui connecte un environnement on-prem à du stockage AWS (S3, S3 Glacier, EBS). Trois modes : File Gateway (NFS/SMB), Volume Gateway (iSCSI), Tape Gateway (VTL).

**Cas d'usage** : extension de stockage on-prem vers le cloud, backup vers S3, migration progressive.

📖 [Module 32 — Migration](/courses/cloud-aws/aws_module_32_migration.html)

---

## CI/CD (hors champ SAA-C03, dans le cours)
{: #cicd}

> Les outils CI/CD AWS (CodePipeline, CodeBuild, CodeDeploy, CodeCommit) sont **hors champ de l'examen SAA-C03** mais sont couverts dans le cours pour compléter les compétences DevOps.

📖 [Module 14 — CI/CD](/courses/cloud-aws/aws_module_14_cicd.html)

---

## Index alphabétique rapide

| Service | Catégorie | Module(s) |
|---------|-----------|-----------|
| [ACM](#acm) | Sécurité | [12](/courses/cloud-aws/aws_module_12_security_advanced.html) |
| [Amplify](#amplify) | Frontend | — |
| [API Gateway](#api-gateway) | Frontend / Serverless | [18](/courses/cloud-aws/aws_module_18_serverless.html) |
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
| [Redshift](#redshift) | Analytique / Database | [30](/courses/cloud-aws/aws_module_30_data_services.html) |
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
