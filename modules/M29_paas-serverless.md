---
title: PaaS & Serverless
sujet: Hosting & Cloud
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