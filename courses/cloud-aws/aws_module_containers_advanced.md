---
layout: page
title: "Containers avancé — Auto Scaling, ALB, Migration microservices"
course: cloud-aws
chapter_title: "Approfondissements par domaine"
chapter: 4
section: 10
tags: aws,ecs,containers,auto-scaling,alb,microservices,codepipeline
difficulty: intermediate
duration: 60
mermaid: true
status: published
prev_module: "/courses/cloud-aws/aws_module_29_lambda_advanced.html"
prev_module_title: "Serverless avancé — Lambda Limits, Concurrency, Step Functions, Cognito"
next_module: "/courses/cloud-aws/aws_module_16_multi_env.html"
next_module_title: "Multi-environnement AWS — dev, staging, prod & multi-account"
---

# Containers avancé — Auto Scaling, ALB, Migration microservices

## Objectifs pédagogiques

À l'issue de ce module, tu seras capable de :

1. **Configurer** le Service Auto Scaling et le Cluster Auto Scaling pour adapter la capacité ECS à la charge
2. **Intégrer** un service ECS avec un Application Load Balancer via les target groups
3. **Concevoir** un path-based routing ALB pour router vers plusieurs services ECS
4. **Planifier** une migration progressive d'un monolithe vers des microservices conteneurisés
5. **Appliquer** les bonnes pratiques de health checks applicatifs et de monitoring Container Insights

Ce module prolonge le module Containers (ECS, EKS, Fargate). On aborde ici le scaling automatique, l'intégration avec un Application Load Balancer, et les patterns de migration.

---

## ECS Auto Scaling — Adapter la capacité à la charge

ECS propose deux niveaux de scaling indépendants :

**Service Auto Scaling** — Ajuste le nombre de tasks dans un service selon des métriques CloudWatch. C'est l'équivalent de l'ASG pour les containers. Trois modes disponibles : Target Tracking (maintenir CPU moyen à 60%), Step Scaling (règles conditionnelles), et Scheduled Scaling (pics prévisibles).

**Cluster Auto Scaling** (EC2 launch type uniquement) — Ajuste le nombre d'instances EC2 dans le cluster pour accueillir les tasks demandées. Utilise un Capacity Provider qui coordonne le scaling du cluster avec le scaling des services.

Avec Fargate, seul le Service Auto Scaling existe — AWS gère la capacité infrastructure automatiquement.

🧠 En examen, si l'énoncé demande "scaling automatique des containers sans gérer de serveurs", la réponse combine **ECS + Fargate + Service Auto Scaling**.

---

## Intégration ALB — routing et health checks

Le service ECS s'enregistre auprès d'un target group ALB pour recevoir du trafic. L'ALB distribue les requêtes entre les tasks actives du service.

Avec le path-based routing, un même ALB peut router vers plusieurs services ECS selon le chemin de la requête : `/api/*` vers un service, `/payments/*` vers un autre. Chaque service a son propre target group.

Le target group doit pointer vers un endpoint applicatif (`/health`) qui vérifie les dépendances critiques (base de données, cache). Un container qui répond sur le port mais dont l'application est plantée doit être détecté.

```mermaid
graph TD
    User["👤 Utilisateur"] --> ALB["Application Load Balancer"]
    ALB --> SVC["ECS Service"]
    SVC --> T1["Task A\n(container API)"]
    SVC --> T2["Task B\n(container API)"]
    SVC --> T3["Task C\n(container API)"]
    T1 --> DB[(RDS)]
    T2 --> DB
    T3 --> DB
    ECR["ECR\n(registre d'images)"] -.->|"pull image"| SVC
    ASG["Auto Scaling"] -.->|"ajuste le nombre\nde tasks"| SVC

    style SVC fill:#ff9900,color:#000
    style ECR fill:#232f3e,color:#fff
```

---

## Commandes essentielles

### Auto Scaling

```bash
# Enregistrer un service ECS comme cible scalable
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/<CLUSTER_NAME>/<SERVICE_NAME> \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity <MIN> \
  --max-capacity <MAX>
```

```bash
# Configurer une politique de Target Tracking sur le CPU moyen
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --resource-id service/<CLUSTER_NAME>/<SERVICE_NAME> \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-name <POLICY_NAME> \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration '{"TargetValue": 60.0, "PredefinedMetricSpecification": {"PredefinedMetricType": "ECSServiceAverageCPUUtilization"}}'
```

---

## Cas réel : migration d'un monolithe vers des microservices conteneurisés

**Contexte** : une plateforme SaaS B2B (30 développeurs, 150 000 utilisateurs actifs) tourne sur 6 instances EC2 derrière un ALB. Le déploiement prend 45 minutes avec 5 à 10 minutes de downtime à chaque release. Trois équipes travaillent sur le même codebase, et chaque merge crée des conflits de dépendances.

**Décision architecturale** : l'équipe choisit ECS avec Fargate — pas EKS, parce que personne dans l'équipe ne connaît Kubernetes et que l'infrastructure est 100% AWS. Le monolithe est découpé en 4 services : API publique, service de paiement, service de notification, worker de traitement asynchrone.

**Architecture mise en place** :
- 1 cluster ECS par environnement (`prod`, `staging`)
- 4 services ECS, chacun avec sa task definition et son repository ECR
- ALB avec path-based routing : `/api/*` → service API, `/payments/*` → service paiement
- Fargate launch type — zéro instance EC2 à gérer
- Service Auto Scaling sur CPU moyen (cible 60%) pour l'API et le worker
- Pipeline CodePipeline : push sur `main` → build image → push ECR → update service ECS (rolling deployment)

**Résultats après 3 mois** :
- Déploiement : de 45 minutes à **8 minutes**, zéro downtime (rolling update)
- Chaque équipe déploie son service indépendamment — de 1 release/semaine à **3-4 releases/jour**
- Coût compute : +12% par rapport aux EC2 (surcoût Fargate), mais -2 jours/mois d'ops économisés
- Incident isolation : une régression dans le service notification n'impacte plus l'API publique

L'erreur initiale de l'équipe : avoir voulu découper en 12 microservices dès le départ. Après 2 semaines de complexité réseau et de debugging distribué, ils sont revenus à 4 services — le bon niveau de granularité pour leur taille d'équipe.

---

## Bonnes pratiques

**Health checks ALB → container, pas juste TCP.** Le target group doit pointer vers un endpoint applicatif (`/health`) qui vérifie les dépendances critiques (base de données, cache). Un container qui répond sur le port mais dont l'application est plantée doit être détecté.

**Limiter le nombre de microservices à la taille de l'équipe.** Deux pizzas, deux services. Un service par développeur est un anti-pattern qui noie l'équipe dans la complexité opérationnelle. Mieux vaut 4 services bien découpés que 15 mal maintenus.

**Activer les Container Insights pour le monitoring.** CloudWatch Container Insights collecte les métriques CPU, mémoire et réseau au niveau task et service. Sans ça, diagnostiquer un problème de performance dans un cluster de 30 tasks revient à chercher une aiguille dans une botte de foin.

**Configurer le deregistration delay sur l'ALB.** Quand une task est remplacée (rolling update), l'ALB continue de lui envoyer du trafic pendant 300 secondes par défaut. Réduire ce délai à 30-60 secondes accélère les déploiements sans perte de requêtes — à condition que les connexions en cours aient le temps de se terminer.

**Utiliser le rolling update avec un minimum healthy percent de 100%.** Avec `minimumHealthyPercent=100` et `maximumPercent=200`, ECS démarre les nouvelles tasks AVANT de stopper les anciennes. Zéro downtime garanti, au prix d'un doublement temporaire de la capacité pendant le déploiement.

**Séparer les logs applicatifs avec awslogs driver.** Configurer le log driver `awslogs` dans la task definition pour envoyer stdout/stderr vers CloudWatch Logs. Un log group par service permet de filtrer et diagnostiquer les problèmes sans SSH dans un container.

---

## Résumé

Le scaling automatique des services ECS repose sur Service Auto Scaling (ajuste le nombre de tasks) et, pour le launch type EC2, sur Cluster Auto Scaling (ajuste le nombre d'instances). L'intégration avec un ALB permet le path-based routing entre microservices et des health checks applicatifs. La migration d'un monolithe vers des containers doit se faire progressivement — commencer par 3-4 services bien découpés, pas 15.

---

<!-- snippet
id: aws_ecs_microservices_warning
type: warning
tech: aws
level: intermediate
importance: medium
format: knowledge
tags: aws,ecs,microservices,architecture
title: Trop de microservices tue les microservices
content: Découper un monolithe en 15 microservices pour une équipe de 8 développeurs noie l'équipe dans la complexité opérationnelle (debugging distribué, latence inter-services, configuration réseau). Règle pratique : le nombre de services ne doit pas dépasser le nombre d'équipes autonomes. Mieux vaut 4 services bien découpés que 15 mal maintenus.
description: Le nombre de microservices doit refléter la taille de l'équipe, pas la granularité du domaine métier.
-->

<!-- snippet
id: aws_ecs_service_autoscaling
type: command
tech: aws
level: intermediate
importance: high
format: knowledge
tags: aws,ecs,auto-scaling,cli
title: Enregistrer un service ECS comme cible Auto Scaling
command: aws application-autoscaling register-scalable-target --service-namespace ecs --resource-id service/<CLUSTER_NAME>/<SERVICE_NAME> --scalable-dimension ecs:service:DesiredCount --min-capacity <MIN> --max-capacity <MAX>
example: aws application-autoscaling register-scalable-target --service-namespace ecs --resource-id service/api-prod/api-backend --scalable-dimension ecs:service:DesiredCount --min-capacity 2 --max-capacity 10
description: Définit les bornes de scaling pour un service ECS. Première étape avant de configurer une politique de scaling.
-->

<!-- snippet
id: aws_ecs_alb_health_check_tip
type: tip
tech: aws
level: intermediate
importance: high
format: knowledge
tags: aws,ecs,alb,health-check
title: Health check ALB — viser un endpoint applicatif
content: Le target group ALB doit pointer vers un endpoint applicatif (/health) qui vérifie les dépendances critiques (DB, cache), pas juste un TCP check sur le port. Un container qui répond sur le port mais dont l'app est plantée doit être détecté et remplacé automatiquement par le service ECS.
description: Un health check TCP ne détecte pas les pannes applicatives — toujours utiliser un endpoint /health.
-->

<!-- snippet
id: aws_ecs_rolling_update_concept
type: concept
tech: aws
level: intermediate
importance: high
format: knowledge
tags: aws,ecs,deploy,rolling-update
title: Rolling update ECS — zéro downtime
content: Avec minimumHealthyPercent=100 et maximumPercent=200, ECS démarre les nouvelles tasks avant de stopper les anciennes. Le service double temporairement sa capacité pendant le déploiement. L'ALB ne route vers les nouvelles tasks qu'après validation du health check. Résultat : zéro requête perdue pendant le déploiement.
description: Le rolling update ECS garantit zéro downtime en démarrant les nouvelles tasks avant de stopper les anciennes.
-->

<!-- snippet
id: aws_ecs_container_insights_tip
type: tip
tech: aws
level: intermediate
importance: medium
format: knowledge
tags: aws,ecs,monitoring,cloudwatch
title: Container Insights — monitoring CPU/mémoire par task
content: CloudWatch Container Insights collecte les métriques CPU, mémoire et réseau au niveau task et service. Sans Container Insights, diagnostiquer un problème de performance dans un cluster de 30 tasks revient à chercher une aiguille dans une botte de foin. Activation en un clic sur le cluster.
description: Container Insights donne la visibilité par task et par service — indispensable dès que le cluster dépasse 5 tasks.
-->

<!-- snippet
id: aws_ecs_path_routing_concept
type: concept
tech: aws
level: intermediate
importance: high
format: knowledge
tags: aws,ecs,alb,routing,microservices
title: Path-based routing ALB — un ALB pour plusieurs services ECS
content: Un même ALB peut router vers plusieurs services ECS selon le chemin de la requête (path-based routing). Chaque service a son propre target group. Exemple : /api/* vers le service API, /payments/* vers le service paiement. Cela évite de multiplier les ALB (coût) tout en isolant les services.
description: Le path-based routing permet de partager un ALB entre plusieurs microservices ECS — un target group par service.
-->
