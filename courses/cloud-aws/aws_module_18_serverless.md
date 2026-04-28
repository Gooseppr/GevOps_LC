---
layout: page
title: "Serverless AWS — Lambda & API Gateway"
course: cloud-aws
chapter_title: "Les briques fondamentales"
chapter: 2
section: 2
tags: aws,lambda,apigateway,serverless
difficulty: beginner
duration: 60
mermaid: true
status: published
prev_module: "/courses/cloud-aws/aws_module_03_ec2.html"
prev_module_title: "EC2 — Compute AWS (instances, réseau, bootstrap)"
next_module: "/courses/cloud-aws/aws_module_25_containers.html"
next_module_title: "Containers AWS — ECS, EKS, Fargate"
---

# Serverless AWS — Lambda & API Gateway

## Objectifs pédagogiques

À la fin de ce module, tu sauras :

- **Expliquer** le modèle d'exécution serverless et ce qu'il change concrètement par rapport à la gestion de serveurs EC2
- **Déployer et invoquer** une fonction Lambda via la CLI AWS
- **Exposer un endpoint HTTP** en connectant API Gateway à une fonction Lambda
- **Anticiper les contraintes** du serverless : cold start, timeouts, limites de concurrence

---

## Pourquoi le serverless existe

Avec EC2, tu viens de découvrir ce que signifie gérer un serveur : choisir un type d'instance, configurer un OS, anticiper la charge, payer l'instance 24h/24 même quand elle ne fait rien. L'essentiel du travail ne concerne pas ton code — il concerne l'infrastructure qui le fait tourner.

Le serverless renverse cette logique. Tu écris une fonction, tu la déploies, AWS se charge du reste : démarrage, scaling, haute disponibilité, maintenance. Tu ne paies que les millisecondes d'exécution consommées. Pour un workload irrégulier — un traitement de fichiers déclenché par des uploads S3, une API dont le trafic varie de 0 à 10 000 req/min en quelques secondes — c'est un changement radical.

Ce n'est pas une silver bullet. Les fonctions serverless ont des contraintes strictes : durée max 15 minutes, démarrage à froid, état non persistant entre invocations. Ces contraintes les rendent inadaptées à certains cas. L'enjeu de ce module est précisément de savoir quand les utiliser — et quand ne pas le faire.

### Quand utiliser Lambda vs EC2

| Critère | EC2 | Lambda |
|---------|-----|--------|
| Durée | Illimitée | Max 15 min |
| Scaling | Manuel (ASG) ou auto | Automatique |
| Coût à l'arrêt | Oui (instance tourne) | Non (0 requête = 0€) |
| Gestion serveur | Toi | AWS |
| Cas d'usage | Apps longue durée, GPU | APIs, events, traitements courts |

---

## Lambda : anatomie et cycle d'exécution

Une fonction Lambda, c'est quatre choses : du code (Python, Node.js, Java, Go…), un handler (le point d'entrée), un rôle IAM (ce qu'elle a le droit de faire), et une configuration (mémoire, timeout, variables d'environnement).

> **SAA-C03** — Lambda max **15 min** (au-delà → Fargate/EC2). **Execution role** = ce que Lambda peut faire ; **resource policy** = qui peut l'invoquer. **Provisioned Concurrency** = supprime les cold starts (pré-chauffage).

### Les commandes essentielles

```bash
# Lister les fonctions Lambda déployées dans la région courante
aws lambda list-functions
```

```bash
# Invoquer une fonction et récupérer la réponse dans un fichier
aws lambda invoke \
  --function-name <FUNCTION_NAME> \
  --payload '<JSON_PAYLOAD>' \
  --cli-binary-format raw-in-base64-out \
  <OUTPUT_FILE>
```

```bash
# Suivre les logs d'une fonction en quasi temps réel
aws logs tail /aws/lambda/<FUNCTION_NAME> --since 10m
```

```bash
# Déployer une nouvelle version du code depuis un zip local
aws lambda update-function-code \
  --function-name <FUNCTION_NAME> \
  --zip-file fileb://<PACKAGE_ZIP>
```

```bash
# Mettre à jour les variables d'environnement sans redéployer le code
aws lambda update-function-configuration \
  --function-name <FUNCTION_NAME> \
  --environment "Variables={<KEY>=<VALUE>}"
```

### Ce qui se passe à chaque invocation

Quand Lambda reçoit une invocation, deux scénarios sont possibles.

**Warm start** — un container est déjà prêt (il a servi une invocation récente). La fonction démarre en quelques millisecondes.

**Cold start** — aucun container disponible. AWS doit en démarrer un, initialiser le runtime, charger ton code. Selon le runtime et la taille du package, ça peut prendre de 100ms à plusieurs secondes. C'est le principal défi opérationnel du serverless.

🧠 **Comment Lambda scale** : chaque invocation simultanée tourne dans un container séparé. Si 1 000 requêtes arrivent en même temps, Lambda démarre jusqu'à 1 000 containers en parallèle. La limite par défaut est 1 000 invocations concurrentes par région, augmentable via une demande AWS. Chaque compte dispose également d'une limite de burst initiale (500 à 3 000 selon la région).

💡 **Réduire le cold start** : choisir un runtime léger (Python ou Node.js plutôt que Java), minimiser les dépendances dans le package, initialiser les connexions (DB, clients SDK) dans le scope global du module plutôt que dans le handler — ces ressources sont réutilisées entre invocations warm. Pour Java et .NET, évaluer Lambda SnapStart. Pour les fonctions critiques, configurer une concurrence provisionnée pour garder des containers actifs en permanence.

⚠️ **Le piège du timeout** : le timeout par défaut est 3 secondes, le maximum est 15 minutes. Si ta fonction effectue un appel externe qui prend plus longtemps que prévu (base de données lente, API tierce), elle sera interrompue et l'invocation sera marquée en erreur. Analyse les durées p95/p99 via CloudWatch Metrics dès le début, et fixe le timeout à environ 2x le p99 observé — ni trop court (erreurs inutiles), ni trop long (ça masque les régressions de performance et augmente les coûts).

---

## API Gateway : exposer Lambda via HTTP

API Gateway est le frontal qui transforme une requête HTTP en événement Lambda. Il gère l'authentification, le rate limiting, les transformations de payload et les stages de déploiement.

```bash
# Lister les APIs REST existantes dans la région
aws apigateway get-rest-apis
```

```bash
# Lister les stages d'une API (dev, staging, prod...)
aws apigateway get-stages --rest-api-id <API_ID>
```

```bash
# Déployer une API sur un stage
aws apigateway create-deployment \
  --rest-api-id <API_ID> \
  --stage-name <STAGE_NAME>
```

Deux types d'API coexistent dans API Gateway :

**REST API** — le mode historique, très configurable. Il supporte les transformations de payload (mapping templates), l'intégration proxy ou non-proxy, les plans d'usage et les API keys. À privilégier quand tu as besoin d'un contrôle fin sur le routage ou les transformations.

**HTTP API** — plus récent, plus simple, environ 70% moins cher que la REST API. Suffisant pour la grande majorité des cas d'usage Lambda, notamment quand l'intégration proxy couvre tout ton besoin.

💡 **Intégration proxy** : c'est le mode le plus courant. API Gateway transmet l'intégralité de la requête HTTP à Lambda (headers, query params, body, méthode) dans un objet `event` standardisé. Lambda retourne un objet avec `statusCode`, `headers` et `body`. Pas de transformation, pas de mapping intermédiaire — simple et efficace. C'est le point de départ par défaut, et la plupart des projets n'ont jamais besoin d'aller plus loin.

---

## Bonnes pratiques

**Une fonction = une responsabilité.** Résiste à la tentation de faire une Lambda "god function" qui gère quinze routes. Une fonction doit faire une chose précise. Ça facilite le test unitaire, le déploiement indépendant et la gestion des permissions IAM.

**Least privilege sur le rôle IAM.** Chaque Lambda a un rôle d'exécution. Ce rôle doit contenir uniquement les permissions nécessaires — pas `s3:*`, mais `s3:GetObject` sur le bucket précis. Un rôle trop permissif transforme une faille applicative en vecteur d'attaque sur l'ensemble du compte.

**Externalise la configuration.** Ne hardcode jamais de valeurs sensibles (credentials, URLs, feature flags) dans le code. Utilise les variables d'environnement Lambda pour les valeurs non-sensibles, et Secrets Manager ou Parameter Store pour les secrets. Ça permet de changer la configuration sans redéployer.

**Calibre les timeouts sur les métriques réelles.** Le timeout par défaut (3s) est souvent trop court dès qu'une Lambda fait un appel réseau. Analyse les durées p50/p95/p99 en production via CloudWatch, et fixe le timeout à environ 2x le p99 observé. Mettre 15 minutes par défaut masque les régressions et augmente les coûts.

---

## Résumé

Le serverless ne supprime pas la complexité — il la déplace. Tu n'as plus à gérer des serveurs, mais tu dois maîtriser le cycle de vie des fonctions, les cold starts et la gestion des erreurs. Lambda + API Gateway couvre la majorité des patterns d'API REST. Comparé à EC2, Lambda brille pour les workloads courts, irréguliers et event-driven — mais ne convient pas aux traitements longs ou aux applications qui nécessitent un état persistant en mémoire.

Le module Serverless avancé (plus loin dans le parcours) approfondit les limites Lambda, la concurrence, Step Functions, et l'architecture event-driven avec SQS/SNS/EventBridge.

---

<!-- snippet
id: aws_lambda_concept
type: concept
tech: aws
level: beginner
importance: high
format: knowledge
tags: aws,lambda,serverless
title: Lambda — modèle d'exécution serverless
content: AWS Lambda exécute du code dans des containers éphémères démarrés à la demande. Chaque invocation simultanée tourne dans un container séparé (scaling horizontal automatique). L'état n'est pas persisté entre deux invocations — utiliser DynamoDB ou S3 pour la persistance.
description: Lambda scale horizontalement sans configuration : chaque invocation parallèle = un container distinct.
-->

<!-- snippet
id: aws_lambda_invoke_cli
type: command
tech: aws
level: beginner
importance: high
format: knowledge
tags: aws,lambda,cli
title: Invoquer une fonction Lambda via CLI
command: aws lambda invoke --function-name <FUNCTION_NAME> --payload '<JSON_PAYLOAD>' --cli-binary-format raw-in-base64-out <OUTPUT_FILE>
example: aws lambda invoke --function-name scoring-api --payload '{"userId": "42"}' --cli-binary-format raw-in-base64-out output.json
description: Invoque une Lambda directement depuis le terminal. La réponse est écrite dans le fichier de sortie spécifié.
-->

<!-- snippet
id: aws_lambda_update_code_cli
type: command
tech: aws
level: beginner
importance: high
format: knowledge
tags: aws,lambda,cli,déploiement
title: Mettre à jour le code d'une Lambda depuis un zip
command: aws lambda update-function-code --function-name <FUNCTION_NAME> --zip-file fileb://<PACKAGE_ZIP>
example: aws lambda update-function-code --function-name scoring-api --zip-file fileb://build/package.zip
description: Déploie une nouvelle version du code sans recréer la fonction. Utile pour un déploiement rapide en dehors d'un pipeline CI/CD.
-->

<!-- snippet
id: aws_lambda_env_vars_cli
type: command
tech: aws
level: beginner
importance: medium
format: knowledge
tags: aws,lambda,cli,configuration
title: Configurer les variables d'environnement d'une Lambda
command: aws lambda update-function-configuration --function-name <FUNCTION_NAME> --environment "Variables={<KEY>=<VALUE>}"
example: aws lambda update-function-configuration --function-name scoring-api --environment "Variables={ENV=production,DB_URL=https://db.internal}"
description: Met à jour les variables d'environnement sans redéployer le code. Les valeurs sensibles doivent passer par Secrets Manager plutôt que par cette commande.
-->

<!-- snippet
id: aws_lambda_logs_cli
type: command
tech: aws
level: beginner
importance: medium
format: knowledge
tags: aws,lambda,cli,logs,cloudwatch
title: Suivre les logs d'une Lambda en quasi temps réel
command: aws logs tail /aws/lambda/<FUNCTION_NAME> --since <DURATION>
example: aws logs tail /aws/lambda/scoring-api --since 10m
description: Affiche les logs CloudWatch de la Lambda depuis la durée spécifiée. Pratique pour diagnostiquer une invocation récente sans ouvrir la console.
-->

<!-- snippet
id: aws_apigateway_list_cli
type: command
tech: aws
level: beginner
importance: medium
format: knowledge
tags: aws,apigateway,cli
title: Lister les APIs REST API Gateway
command: aws apigateway get-rest-apis
example: aws apigateway get-rest-apis
description: Retourne la liste des APIs REST déployées dans la région courante avec leur ID, nom et date de création.
-->

<!-- snippet
id: aws_apigateway_deploy_cli
type: command
tech: aws
level: beginner
importance: medium
format: knowledge
tags: aws,apigateway,cli,déploiement
title: Déployer une API Gateway sur un stage
command: aws apigateway create-deployment --rest-api-id <API_ID> --stage-name <STAGE_NAME>
example: aws apigateway create-deployment --rest-api-id abc123xyz --stage-name production
description: Publie la configuration courante de l'API sur le stage cible. Nécessaire après chaque modification des routes ou intégrations.
-->

<!-- snippet
id: aws_lambda_cold_start_warning
type: warning
tech: aws
level: beginner
importance: high
format: knowledge
tags: aws,lambda,performance,cold-start
title: Cold start Lambda — impact et mitigation
content: Un cold start survient quand Lambda doit démarrer un nouveau container (aucun warm disponible). Durée : 100ms à 2s+ selon le runtime (Java >> Python/Node.js) et la taille du package. Mitigations : runtime léger, package minimal, connexions DB initialisées hors du handler (scope global), concurrence provisionnée pour les fonctions critiques.
description: Le cold start est le principal défaut de latence du serverless — à mesurer et traiter dès la mise en production.
-->

<!-- snippet
id: aws_lambda_timeout_warning
type: warning
tech: aws
level: beginner
importance: high
format: knowledge
tags: aws,lambda,timeout,erreur
title: Lambda timeout — diagnostic et configuration
content: Timeout par défaut : 3 secondes. Maximum : 15 minutes. Quand une Lambda dépasse son timeout, l'invocation échoue avec "Task timed out". Analyser les durées p95/p99 via CloudWatch Metrics, fixer le timeout à ~2x le p99 observé. Ne pas mettre 15 min par défaut : ça masque les régressions de performance et augmente les coûts.
description: Un timeout trop court provoque des erreurs, un timeout trop long masque les problèmes — calibrer sur les métriques réelles.
-->

<!-- snippet
id: aws_lambda_iam_tip
type: tip
tech: aws
level: beginner
importance: high
format: knowledge
tags: aws,lambda,iam,sécurité
title: Least privilege sur le rôle d'exécution Lambda
content: Chaque Lambda a un rôle IAM d'exécution. Appliquer le principe du moindre privilège : autoriser uniquement les actions nécessaires sur les ressources précises (ex: s3:GetObject sur arn:aws:s3:::mon-bucket/*, pas s3:*). Un rôle trop permissif transforme une vulnérabilité applicative en compromission du compte AWS.
description: Le rôle IAM d'une Lambda est sa surface d'attaque — le restreindre au strict nécessaire est non négociable.
-->
