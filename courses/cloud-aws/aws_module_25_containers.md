---
layout: page
title: "Containers AWS — ECS, EKS, Fargate"
course: cloud-aws
chapter_title: "Les briques fondamentales"
chapter: 2
section: 3
tags: aws,ecs,eks,fargate,containers,docker,ecr
difficulty: beginner
duration: 65
mermaid: true
status: published
prev_module: "/courses/cloud-aws/aws_module_18_serverless.html"
prev_module_title: "Serverless AWS — Lambda & API Gateway"
next_module: "/courses/cloud-aws/aws_module_04_storage.html"
next_module_title: "Stockage AWS — S3 / EBS / EFS"
---

# Containers AWS — ECS, EKS, Fargate

## Objectifs pédagogiques

À l'issue de ce module, tu seras capable de :

1. **Expliquer** pourquoi les containers ont remplacé le déploiement direct sur EC2 pour la majorité des architectures modernes
2. **Distinguer** ECS, EKS et Fargate et choisir le bon service selon le contexte technique et organisationnel
3. **Décrire** l'architecture d'un service ECS (cluster, task definition, service, task) et le flux d'une requête
4. **Déployer et inspecter** un service conteneurisé via la CLI AWS
5. **Comparer** EC2, Lambda et ECS/Fargate pour choisir le bon modèle de compute

---

## Pourquoi les containers changent la donne

Déployer une application sur EC2, c'est gérer un système d'exploitation, des dépendances, des conflits de versions, et prier pour que ce qui fonctionne en local fonctionne aussi en production. Quand trois applications partagent le même serveur et que l'une d'elles a besoin de Python 3.11 alors que l'autre ne tourne qu'en 3.8, les ennuis commencent.

Un container résout ce problème à la racine. Il empaquette l'application **avec** ses dépendances dans une image immuable. Cette image tourne de façon identique sur un laptop, dans un pipeline CI/CD, ou sur un serveur AWS — parce qu'elle embarque tout ce dont elle a besoin, isolé du reste.

Docker a popularisé cette approche. AWS y a greffé trois services d'orchestration qui répondent à des profils différents : **ECS** pour la simplicité native AWS, **EKS** pour les équipes déjà investies dans Kubernetes, et **Fargate** pour ceux qui ne veulent gérer aucun serveur.

---

## Les trois services en perspective

> **SAA-C03** — Fargate = **pas un service autonome** (launch type pour ECS/EKS). ECS control plane = gratuit. EKS = ~74 $/mois par cluster.

| Service | Ce que c'est | Qui gère les serveurs | Quand le choisir |
|---------|-------------|----------------------|-----------------|
| **ECS** (Elastic Container Service) | Orchestrateur natif AWS | Toi (mode EC2) ou AWS (mode Fargate) | Cas standard, équipe AWS-native |
| **EKS** (Elastic Kubernetes Service) | Kubernetes managé par AWS | Toi (mode EC2) ou AWS (mode Fargate) | Équipe avec compétences K8s, multi-cloud |
| **Fargate** | Moteur d'exécution serverless | AWS (zéro serveur) | S'utilise **avec** ECS ou EKS |
| **ECR** (Elastic Container Registry) | Registre d'images Docker | AWS | Stocker et distribuer tes images |

Un point qui crée beaucoup de confusion : **Fargate n'est pas un service autonome**. C'est un mode de lancement disponible dans ECS et EKS. Tu choisis ECS *puis* tu choisis si les tasks tournent sur des instances EC2 que tu gères, ou sur Fargate où AWS gère l'infrastructure.

```mermaid
graph TD
    SVC["ECS Service"] --> T1["Task A\n(container API)"]
    SVC --> T2["Task B\n(container API)"]
    SVC --> T3["Task C\n(container API)"]
    T1 --> DB[(RDS)]
    T2 --> DB
    T3 --> DB
    ECR["ECR\n(registre d'images)"] -.->|"pull image"| SVC

    style SVC fill:#ff9900,color:#000
    style ECR fill:#232f3e,color:#fff
```

---

## ECS — L'orchestrateur natif AWS

### Les quatre concepts fondamentaux

ECS s'articule autour de quatre objets dont la hiérarchie est stricte :

**1. Cluster** — L'enveloppe logique qui regroupe tes services. Un cluster par environnement est la convention recommandée (`api-prod`, `api-staging`). Le cluster lui-même ne contient pas de compute — il référence des capacity providers (EC2 ou Fargate).

**2. Task Definition** — Le blueprint de ton container. C'est l'équivalent d'un `docker-compose.yml` : quelle image utiliser, combien de CPU et de mémoire allouer, quelles variables d'environnement injecter, quel port exposer, quel rôle IAM attribuer. Chaque modification crée une nouvelle **révision** — les anciennes restent disponibles pour un rollback.

**3. Task** — Une instance en cours d'exécution d'une task definition. Si ta task definition décrit un container Nginx, une task est un container Nginx qui tourne réellement sur une infrastructure (EC2 ou Fargate).

**4. Service** — Le contrôleur qui maintient N tasks actives en permanence. Si tu demandes `desired_count=3` et qu'une task plante, le service en relance une automatiquement. Le service peut recevoir du trafic via un load balancer (détaillé dans un module ultérieur).

### EC2 launch type vs Fargate launch type

C'est le choix le plus structurant, et celui qui revient le plus en examen.

**EC2 launch type** — Tu provisionnes et gères un pool d'instances EC2 dans le cluster. Les tasks sont placées sur ces instances par l'ECS scheduler. Tu as un contrôle total sur le type d'instance, le stockage local, la configuration réseau. En contrepartie, tu gères les mises à jour OS, le monitoring des instances, et le capacity planning.

**Fargate launch type** — Tu ne vois aucun serveur. Tu définis les ressources (CPU, mémoire) dans la task definition, et AWS provisionne l'infrastructure à la volée. Chaque task tourne dans son propre environnement isolé. Le coût est plus élevé par unité de compute, mais tu élimines tout le travail opérationnel lié aux instances.

| Critère | EC2 launch type | Fargate launch type |
|---------|----------------|-------------------|
| Gestion serveurs | Toi (AMI, patchs, monitoring) | AWS (aucun accès) |
| Contrôle infra | Total (type instance, stockage, GPU) | Limité (CPU/mémoire prédéfinis) |
| Coût | Moins cher à charge stable | Plus cher, mais zéro overhead ops |
| Scaling | ASG sur les instances + service scaling | Service scaling uniquement |
| GPU / accès disque local | Oui | Non |
| Cas d'usage | Workloads intensifs, GPU, coût optimisé | APIs stateless, microservices, équipes réduites |

🧠 **Règle pratique pour l'examen** : si l'énoncé mentionne "sans gérer de serveurs" ou "serverless containers" → la réponse est **Fargate**. Si l'énoncé mentionne "GPU", "accès au disque local" ou "contrôle de l'instance" → la réponse est **EC2 launch type**.

---

## EKS — Quand Kubernetes est un prérequis

EKS déploie un control plane Kubernetes managé par AWS. AWS gère l'API server, etcd, et les composants du control plane. Toi, tu gères les worker nodes (ou tu utilises Fargate pour les pods).

Le point important : **EKS ne simplifie pas Kubernetes**. Il simplifie le déploiement et la maintenance du control plane, mais tu travailles toujours avec des manifests YAML, des deployments, des services K8s, et toute la complexité opérationnelle de l'écosystème Kubernetes.

Trois raisons légitimes de choisir EKS plutôt qu'ECS :

1. **L'équipe maîtrise déjà Kubernetes** — la courbe d'apprentissage est déjà payée
2. **Multi-cloud** — les workloads doivent tourner aussi sur GCP ou Azure, Kubernetes est le dénominateur commun
3. **Écosystème K8s** — besoin de service mesh (Istio), d'opérateurs custom, ou d'outils qui n'existent que dans l'écosystème Kubernetes

⚠️ **Piège SAA-C03** : si l'énoncé ne mentionne pas Kubernetes explicitement, EKS n'est presque jamais la bonne réponse. ECS + Fargate couvre la grande majorité des cas et est plus simple à opérer.

---

## ECR — Le registre d'images

ECR est le Docker Hub privé d'AWS. Il stocke tes images Docker de manière sécurisée. Chaque image poussée est chiffrée au repos, scannée pour les vulnérabilités connues, et accessible via les rôles IAM — pas de credentials Docker à gérer.

---

## Commandes essentielles

### Inspecter l'infrastructure existante

```bash
# Lister les clusters ECS du compte
aws ecs list-clusters

# Voir les services actifs dans un cluster
aws ecs list-services --cluster <CLUSTER_NAME>

# Détail d'un service (desired count, running count, events)
aws ecs describe-services --cluster <CLUSTER_NAME> --services <SERVICE_NAME>
```

### Inspecter les tasks

```bash
# Lister les tasks actives d'un service
aws ecs list-tasks --cluster <CLUSTER_NAME> --service-name <SERVICE_NAME>

# Détail d'une task (IP, statut, container, raison d'arrêt)
aws ecs describe-tasks --cluster <CLUSTER_NAME> --tasks <TASK_ARN>
```

### Opérations courantes

```bash
# Forcer un nouveau déploiement (pull la dernière image)
aws ecs update-service --cluster <CLUSTER_NAME> --service <SERVICE_NAME> --force-new-deployment

# Ajuster le nombre de tasks manuellement
aws ecs update-service --cluster <CLUSTER_NAME> --service <SERVICE_NAME> --desired-count <COUNT>
```

### ECR — Pousser une image

```bash
# S'authentifier auprès d'ECR
aws ecr get-login-password --region <REGION> | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com

# Taguer et pousser l'image
docker tag <IMAGE>:latest <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/<REPO>:latest
docker push <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/<REPO>:latest
```

---

## Cas réel : conteneurisation d'une API Python pour une équipe data

**Contexte** — Une équipe data de 3 ingénieurs maintient une API Flask qui sert des prédictions ML. Elle tourne sur une instance EC2 avec Python 3.10, scikit-learn, pandas et une douzaine de dépendances. À chaque changement de dépendance, le déploiement prend 2 heures de configuration manuelle et casse parfois l'environnement de production.

**Problème** — Conflits de dépendances, syndrome du "ça marche sur ma machine", déploiements risqués avec des étapes manuelles non reproductibles.

**Solution** — Conteneuriser l'API avec Docker, pousser l'image sur ECR, déployer sur ECS avec Fargate. La task definition spécifie Python 3.10, 1 vCPU, 2 Go de mémoire. Deux tasks tournent en permanence pour absorber la charge.

**Résultats** :

- **Déploiement** : de 2 heures à 10 minutes (`docker build` + push ECR + update service)
- **Zéro "ça marche sur ma machine"** — l'image est identique partout (laptop, CI, production)
- **Rollback** : revenir à la révision précédente de la task definition en 30 secondes
- **Coût** : ~45 €/mois (Fargate, 2 tasks) vs ~35 €/mois (EC2 t3.small) — légèrement plus cher mais zéro charge opérationnelle

L'investissement initial (écrire le `Dockerfile`, configurer ECR et la task definition ECS) a pris une journée. Le gain de temps se rentabilise dès le deuxième déploiement.

---

## EC2 vs Lambda vs ECS/Fargate — Les trois modèles de compute AWS

Maintenant que tu connais EC2, Lambda et ECS/Fargate, voici comment les comparer :

| Critère | EC2 | Lambda | ECS/Fargate |
|---------|-----|--------|-------------|
| Modèle | Serveur complet | Fonction | Container |
| Scaling | Manuel ou ASG | Automatique | Service Auto Scaling |
| Durée max | Illimitée | 15 min | Illimitée |
| Coût à l'arrêt | Oui | Non | Oui (tasks actives) |
| Gestion serveur | Toi | AWS | AWS (Fargate) ou toi (EC2) |
| Cas idéal | Apps monolithiques, GPU, contrôle total | APIs légères, events, traitements courts | Apps conteneurisées, microservices |

```mermaid
graph TD
    A[Besoin compute] --> B{Durée > 15 min ?}
    B -->|Non| C{Besoin d'un serveur complet ?}
    B -->|Oui| D{Application conteneurisée ?}
    C -->|Non| E[Lambda]
    C -->|Oui| F[EC2]
    D -->|Oui| G[ECS / Fargate]
    D -->|Non| F
```

---

## Bonnes pratiques

**Commencer par ECS + Fargate, pas par EKS.** EKS n'est justifié que si l'équipe maîtrise déjà Kubernetes ou si le workload doit tourner sur plusieurs clouds. Pour tout le reste, ECS + Fargate est plus simple, moins cher à opérer, et couvre 90% des besoins.

**Une task definition par service, pas par environnement.** La même task definition doit pouvoir tourner en dev, staging et prod — seules les variables d'environnement changent. Dupliquer les task definitions par environnement crée de la dérive.

**Rôle IAM par task, pas par cluster.** Chaque task definition a son propre `taskRoleArn` avec les permissions minimales nécessaires. Un rôle partagé entre tous les services du cluster est un vecteur de propagation en cas de compromission.

**Stocker les images dans ECR, pas sur Docker Hub.** ECR est intégré avec IAM (pas de credentials Docker à gérer), scanne les vulnérabilités automatiquement, et le pull est gratuit depuis les services AWS dans la même région.

**Versionner les images avec des tags explicites.** Ne pas utiliser uniquement le tag `latest` — utiliser un tag basé sur le commit SHA ou le numéro de build (`api:a3f2c1b`, `api:build-42`). Avec `latest`, impossible de savoir quelle version tourne réellement en production, et le rollback revient à deviner quelle image précédente relancer.

---

## Résumé

ECS est l'orchestrateur de containers natif AWS — simple, bien intégré, suffisant pour la grande majorité des architectures. EKS apporte Kubernetes managé pour les équipes qui en ont déjà l'expertise ou qui visent le multi-cloud. Fargate n'est pas un service autonome mais un mode de lancement qui élimine la gestion des serveurs, disponible dans ECS et EKS. ECR complète le tableau comme registre d'images privé intégré avec IAM.

Le choix se fait en deux questions : "Avons-nous besoin de Kubernetes ?" (non → ECS, oui → EKS) puis "Voulons-nous gérer des serveurs ?" (non → Fargate, oui → EC2 launch type). En examen SAA-C03, "sans gérer de serveurs" pointe systématiquement vers Fargate, et l'absence de mention de Kubernetes exclut EKS.

Le module Containers avancé (plus loin dans le parcours) couvre l'Auto Scaling des services, l'intégration avec un load balancer, et les patterns de migration vers les microservices.

---

<!-- snippet
id: aws_ecs_architecture_concept
type: concept
tech: aws
level: intermediate
importance: high
format: knowledge
tags: aws,ecs,containers,architecture
title: ECS — quatre composants fondamentaux
content: ECS s'articule autour de quatre objets : Cluster (enveloppe logique), Task Definition (blueprint du container — image, CPU, mémoire, IAM role), Task (instance en exécution), Service (maintient N tasks actives et s'enregistre auprès d'un ALB). Le Service relance automatiquement les tasks défaillantes.
description: La hiérarchie Cluster → Task Definition → Task → Service est la base de toute architecture ECS.
-->

<!-- snippet
id: aws_ecs_ec2_vs_fargate
type: concept
tech: aws
level: intermediate
importance: high
format: knowledge
tags: aws,ecs,fargate,ec2,serverless
title: EC2 launch type vs Fargate — critères de choix
content: EC2 launch type = contrôle total (GPU, stockage local, type d'instance), gestion serveurs à ta charge. Fargate = zéro serveur, AWS gère l'infrastructure, coût plus élevé mais zéro overhead ops. Fargate ne supporte pas les GPU ni l'accès disque local. En examen, "serverless containers" = Fargate.
description: Le choix EC2 vs Fargate détermine qui gère l'infrastructure sous les containers — toi ou AWS.
-->

<!-- snippet
id: aws_ecs_list_services
type: command
tech: aws
level: intermediate
importance: medium
format: knowledge
tags: aws,ecs,cli
title: Lister les services ECS actifs dans un cluster
command: aws ecs list-services --cluster <CLUSTER_NAME>
example: aws ecs list-services --cluster api-prod
description: Retourne les ARN de tous les services du cluster. Premier réflexe pour auditer ce qui tourne.
-->

<!-- snippet
id: aws_ecs_force_deploy
type: command
tech: aws
level: intermediate
importance: high
format: knowledge
tags: aws,ecs,cli,deploy
title: Forcer un nouveau déploiement ECS
context: Utile quand l'image ECR a été mise à jour avec le même tag (latest) et que le service doit re-pull
command: aws ecs update-service --cluster <CLUSTER_NAME> --service <SERVICE_NAME> --force-new-deployment
example: aws ecs update-service --cluster api-prod --service api-backend --force-new-deployment
description: Force le service à lancer de nouvelles tasks avec un pull frais de l'image depuis ECR, même si le tag n'a pas changé.
-->

<!-- snippet
id: aws_ecr_push_image
type: command
tech: aws
level: intermediate
importance: high
format: knowledge
tags: aws,ecr,docker,cli
title: Pousser une image Docker vers ECR
context: Nécessite Docker installé et une authentification préalable via aws ecr get-login-password
command: docker push <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/<REPO>:<TAG>
example: docker push 123456789012.dkr.ecr.eu-west-1.amazonaws.com/api-backend:latest
description: Pousse l'image taguée vers le repository ECR. L'image est chiffrée au repos et scannable pour les vulnérabilités.
-->

<!-- snippet
id: aws_eks_vs_ecs_choice
type: tip
tech: aws
level: intermediate
importance: high
format: knowledge
tags: aws,eks,ecs,architecture,decision
title: EKS vs ECS — quand choisir quoi
content: ECS pour 90% des cas : simple, intégré AWS, pas de Kubernetes à maîtriser. EKS uniquement si l'équipe connaît déjà Kubernetes, si le workload doit être multi-cloud, ou si des outils K8s spécifiques (Istio, opérateurs custom) sont nécessaires. En examen SAA, si Kubernetes n'est pas mentionné dans l'énoncé, la réponse n'est pas EKS.
description: ECS est le choix par défaut sur AWS. EKS ne se justifie que par un besoin Kubernetes explicite ou une contrainte multi-cloud.
-->

<!-- snippet
id: aws_fargate_not_standalone_warning
type: warning
tech: aws
level: intermediate
importance: high
format: knowledge
tags: aws,fargate,ecs,eks
title: Fargate n'est pas un service autonome
content: Fargate est un mode de lancement (launch type), pas un service indépendant. Il s'utilise au sein d'ECS ou d'EKS. Tu ne "déploies pas sur Fargate" — tu déploies sur ECS en choisissant Fargate comme launch type. Cette confusion est exploitée en examen.
description: Fargate = mode d'exécution serverless au sein d'ECS ou EKS, pas un service à part entière.
-->
