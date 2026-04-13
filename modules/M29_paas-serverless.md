---
layout: page
title: PaaS & Serverless
sujet: Cloud publique, Hosting & Cloud
type: module
jour: 29
ordre: 1
tags: aws, paas, ci, cd, devops
---

# 🎓 **PaaS & Serverless (Déploiement Cloud & CI/CD)**

## 1️⃣ Introduction : Pourquoi ces modèles existent ?

Les entreprises veulent :

- déployer plus vite,
- réduire les erreurs humaines,
- éviter de gérer des serveurs,
- absorber automatiquement les variations de charge,
- payer uniquement ce qu’elles consomment.

➡️ **PaaS** et **Serverless** sont apparus pour répondre à ces besoins.

---

# 2️⃣ IaaS vs PaaS vs Serverless

| Modèle | Description | Qui gère quoi ? | Quand l'utiliser ? |
| --- | --- | --- | --- |
| **IaaS** (Infrastructure as a Service) | Machines virtuelles, réseaux, stockage managés par le cloud mais configurés par toi | Le cloud : matériel / Toi : OS, runtime, déploiement | Applications complexes, besoin de personnalisation |
| **PaaS** (Platform as a Service) | Le cloud fournit un environnement pour exécuter ton application | Cloud : OS + runtime + scaling / Toi : le code | Applications web, APIs, microservices |
| **Serverless** (Functions-as-a-Service) | Tu fournis uniquement le code exécuté à la demande | Cloud : tout | Tâches événementielles, automatisation, ETL, traitement d’images |

---

## 3️⃣ Coûts : Pourquoi Serverless est plus économique ?

### Serveurs traditionnels :

- coûts initiaux élevés (serveurs, licences),
- coûts fixes (même si l’application dort),
- scaling manuel.

### Serverless :

- **aucun coût si rien ne s’exécute**,
- **scaling automatique**, sans serveur dédié,
- coût directement proportionnel à la charge.

👉 **Idéal pour les applications à trafic variable** (week-end, soldes, pics aléatoires).

---

# 4️⃣ Frontend vs Backend (rappel rapide)

- **Frontend** = interface visible (HTML, JS, mobile).
- **Backend** = logique, base de données, APIs, traitements.

PaaS et Serverless servent principalement à **héberger / exécuter le backend**, automatiser les traitements et faciliter les déploiements.

---

# 5️⃣ Cloud CI/CD Pipelines

Les pipelines CI/CD dans le cloud permettent :

- compilation et tests automatiques,
- déploiement sans intervention humaine,
- réduction des erreurs manuelles,
- déploiements cohérents.

### Tableau récapitulatif — CI/CD Cloud

| Service | Avantages | Désavantages |
| --- | --- | --- |
| **AWS CodePipeline** | Automatisation complète, excellente intégration AWS | Configuration parfois complexe, dépendance forte AWS |
| **Azure DevOps Pipelines** | Très intégré à l’écosystème Microsoft, supporte beaucoup de langages | Coûts pour grandes équipes, courbe d'apprentissage |
| **Google Cloud Build** | Très scalable, paiement à l’usage | Moins de plugins que AWS/Azure |

---

# 6️⃣ Serverless : Fonctionnement & plateformes

### Définition :

Le Serverless exécute du code **en réponse à un événement**, sans gestion de serveur.

### Exemples d’évènements :

- requête HTTP,
- fichier uploadé,
- message dans une queue,
- CRON.

### Avantages Serverless

- aucun serveur à gérer,
- pay-per-use,
- scalabilité automatique,
- sécurité intégrée,
- idéal pour automatiser des workflows.

### Inconvénients

- limité en durée d’exécution,
- contrôle très faible sur l’environnement,
- cold starts,
- coûteux si mal utilisé (fort volume, très long runtime).

### Tableau Serverless

| Service | Avantages | Désavantages |
| --- | --- | --- |
| **AWS Lambda** | Tarification à l’usage, scaling automatique | Durée limitée, cold start, environnements contrôlés |
| **Azure Functions** | Très bonne intégration Azure, multi-langages | Coûts variables, gestion des plans parfois opaque |
| **Google Cloud Functions** | Bonne intégration Firebase/GCP | Moins mature que Lambda |

---

# 7️⃣ PaaS (Platform as a Service) : Fonctionnement

Les plateformes PaaS fournissent un environnement complet :

- serveur web,
- runtime (Node, Python, .NET),
- scaling automatique,
- logs,
- monitoring,
- CI/CD intégré.

Tu n’as plus besoin :

- d’installer un OS,
- de configurer un serveur web,
- de gérer les patchs,
- d’assurer la scalabilité.

### Tableau PaaS

| Service | Avantages | Désavantages |
| --- | --- | --- |
| **AWS AppRunner** | Déploiement simplifié, auto-scaling, CI/CD intégré | Personnalisation très limitée |
| **Azure App Service** | Très complet, support Windows/Linux | Les config avancées peuvent devenir complexes |
| **Google App Engine** | Très simple, intégration Cloud | Environnement parfois trop restrictif |

---

# 8️⃣ PaaS vs Serverless — Comparaison complète

| Critère | PaaS | Serverless |
| --- | --- | --- |
| Gestion des serveurs | Abstraite | Aucune |
| Déploiement | Application complète | Fonctions déclenchées |
| Durée max | Illimitée | Limitée (1–15 mins) |
| Facturation | Ressources allouées | Exécution uniquement |
| Scalabilité | Auto, mais par conteneur | Auto + immédiate |
| Flexibilité | Forte | Moyenne |
| Cas d’usage | APIs, web apps | Automatisation, ETL, CRON, triggers |

---

# 9️⃣ Sécurité PaaS & Serverless

### Commun à PaaS & Serverless :

- isolation des runtimes,
- pare-feu cloud (Security Groups / Firewalls),
- validation automatique TLS,
- IAM intégré,
- logs d’accès + audit.

### PaaS

- le runtime est géré : **moins de CVE** pour toi,
- mais la plateforme entière est exposée (app complete).

### Serverless

- seulement la fonction est exposée,
- surface d’attaque minimale,
- excellente résistance DDoS (scaling + isolation).

---

# 🔟 Influence sur les Pipelines CI/CD

Grâce à **PaaS** :

- build → deploy vers App Service ou AppRunner,
- rollback automatique,
- staging slots.

Grâce au **Serverless** :

- build → upload → exécution (Lambda, Functions, Cloud Functions),
- packaging minimal (ZIP / container),
- déclenchements automatiques via événements.

---

# 1️⃣1️⃣ Scénarios réels pour t'entraîner (DevOps)

| Situation | Solution |
| --- | --- |
| Une API REST stable | **PaaS** |
| Un job CRON toutes les 10 minutes | **Serverless** |
| Traitement d’image à chaque upload | **Serverless** |
| Une application web avec backend + workers | **PaaS** |
| Une appli à trafic très variable | **Serverless** |
| Un backend métier complexe | **PaaS** |

---

# 1️⃣2️⃣ Conclusion pédagogique

🎯 **PaaS = plateforme pour déployer des applications sans gérer l’infrastructure**

🎯 **Serverless = exécution de fonctions sans serveur, payée à l’usage**

🎯 **Les pipelines CI/CD du cloud facilitent l’intégration de ces techniques en automatisant tout le cycle de vie**

Ces deux modèles simplifient :

- les déploiements,
- la sécurité,
- la scalabilité,
- les coûts,
- la maintenance.



<!-- snippet
id: cloud_paas_vs_serverless
type: concept
tech: aws
level: beginner
importance: high
format: knowledge
tags: paas,serverless,iaas,modèles,cloud
title: IaaS vs PaaS vs Serverless – Comparaison des modèles cloud
context: choisir le bon modèle d'exécution cloud selon le besoin
content: |
  - IaaS (EC2, GCE, Azure VM) : cloud gère le matériel, toi l'OS, le runtime et le déploiement
  - PaaS (AppRunner, App Service, App Engine) : cloud gère OS + runtime + scaling, toi uniquement le code
  - Serverless (Lambda, Azure Functions, Cloud Functions) : cloud gère tout, tu fournis le code déclenché par événements
description: Plus on monte vers Serverless, moins on gère d'infrastructure, mais moins on a de contrôle.
-->

<!-- snippet
id: aws_lambda_cold_start
type: warning
tech: aws
level: intermediate
importance: medium
format: knowledge
tags: lambda,cold-start,serverless,performance
title: Cold Start Lambda – Latence au premier appel
context: comprendre et atténuer les démarrages à froid des fonctions Lambda
content: |
  Au premier appel ou après inactivité, AWS initialise le runtime et charge le code — latence de quelques centaines de ms à quelques secondes selon le langage.
  Pour réduire les cold starts :
  - Utiliser des runtimes compilés (Go, Rust)
  - Réduire la taille du package de déploiement
  - Activer Provisioned Concurrency pour maintenir des instances chaudes
  - Éviter de charger des dépendances inutiles au démarrage
-->

<!-- snippet
id: cloud_serverless_use_cases
type: concept
tech: aws
level: beginner
importance: high
format: knowledge
tags: serverless,lambda,cas-usage,événements
title: Cas d'usage Serverless – Quand choisir Lambda
context: identifier les scénarios adaptés à une architecture serverless
content: Serverless est idéal pour : tâches événementielles (fichier uploadé sur S3, message SQS, appel API Gateway), jobs CRON ponctuels, traitements d'images ou de vidéos, ETL légers, automatisations d'infrastructure, applications à trafic très variable. Éviter Serverless pour : applications longues (durée max 15 min sur Lambda), besoin de contrôle fin de l'environnement d'exécution, forts volumes avec latence critique (cold starts).
-->

<!-- snippet
id: cloud_paas_services
type: concept
tech: aws
level: beginner
importance: medium
format: knowledge
tags: paas,apprunner,app-service,google-app-engine
title: Services PaaS AWS, Azure et GCP
context: déployer une application web sans gérer les serveurs
content: |
  - AWS AppRunner : déploiement simplifié containers/code source, auto-scaling, CI/CD intégré, personnalisation limitée
  - Azure App Service : très complet, Windows et Linux, staging slots, WebJobs
  - Google App Engine : simple, intégration Cloud, environnement parfois restrictif
description: En PaaS, l'application complète est déployée (≠ Serverless). Durée d'exécution illimitée, facturation par ressources allouées.
-->

<!-- snippet
id: aws_cicd_cloud_pipelines
type: concept
tech: aws
level: intermediate
importance: medium
format: knowledge
tags: ci-cd,codepipeline,azure-devops,cloud-build
title: Pipelines CI/CD cloud – AWS, Azure et GCP
context: automatiser le build, les tests et le déploiement d'une application
content: |
  - AWS CodePipeline : intégration native Lambda, ECS, AppRunner et EC2
  - Azure DevOps Pipelines : très intégré à l'écosystème Microsoft, support multi-langages
  - Google Cloud Build : scalable, paiement à l'usage, moins de plugins
description: Les pipelines CI/CD cloud éliminent les interventions manuelles, garantissent des déploiements cohérents et permettent le rollback automatique.
-->

<!-- snippet
id: cloud_serverless_security
type: tip
tech: aws
level: intermediate
importance: medium
format: knowledge
tags: serverless,sécurité,iam,surface-attaque
title: Sécurité Serverless – Surface d'attaque minimale
context: comprendre les avantages sécurité du modèle serverless
content: |
  - Surface d'attaque minimale : seule la fonction est exposée, pas un serveur entier
  - AWS gère les patchs du runtime (zéro CVE à gérer côté client)
  - Isolation en microVMs Firecracker entre chaque invocation Lambda
  - Résistance naturelle aux DDoS grâce au scaling automatique
description: Chaque fonction doit avoir son propre IAM Role au minimum de permissions. Utiliser AWS Secrets Manager pour les secrets, pas des variables d'environnement en clair.
-->

---
[Module suivant →](M29_apachebench.md)
---
