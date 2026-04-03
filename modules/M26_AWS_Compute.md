---
layout: page
title: AWS Compute
sujet: Hosting & Cloud
type: module
jour: 26
ordre: 2
tags: aws, cloud, devops
---

# 🟦 **Cours AWS Compute**

## 1. Pourquoi le “compute” (puissance de calcul) est central ?

Toutes les entreprises ont besoin de **capacité de calcul** (*compute capacity*) pour faire tourner :

- sites web
- API
- batchs de traitement
- applications métiers, bases de données, etc.

Avec AWS, au lieu d’acheter et gérer toi-même des serveurs, tu consommes du **Compute as a Service** :

| Problème traditionnel | En cloud (Compute as a Service) |
| --- | --- |
| Acheter du matériel (CAPEX) | Tu loues de la capacité (OPEX / pay-as-you-go) |
| Gérer l’électricité, la clim, le réseau | AWS gère l’infrastructure |
| Dimensionner pour le pic de charge | Tu peux **scaler** (scale up/down) |
| Besoin d’expertise système forte | Tu te concentres sur l’application |

---

## 2. Les grandes familles de compute sur AWS

Quand tu dois choisir comment exécuter ton application sur AWS, tu as 3 grandes options :

| Type | Idée générale | Services AWS typiques |
| --- | --- | --- |
| **Machines virtuelles (Virtual Machines / VMs)** | Tu gères un serveur (OS, packages, etc.). | Amazon EC2 |
| **Conteneurs (Containers)** | Tu empaquetes ton app avec ses dépendances. | ECS, EKS, Fargate |
| **Serverless Compute** | Tu fournis seulement le code ou la définition de tâche. | Lambda, Fargate (serverless containers) |

---

## 3. Amazon EC2 – Machines virtuelles dans le cloud

### 3.1. Principe

**Amazon EC2 (Elastic Compute Cloud)** = service qui permet de créer des **instances** (EC2 instances), c’est-à-dire des **machines virtuelles dans le cloud**.

Avec EC2, tu peux :

- **provisionner** (provision) et lancer des instances en quelques minutes ;
- **arrêter** (stop) ou **terminer** (terminate) une instance quand tu n’en as plus besoin ;
- payer **à l’heure ou à la seconde** (*per hour / per second* selon le type) → **pay-as-you-go**.

Exemples d’usages :

– serveurs web, backends applicatifs, bases de données autogérées, jobs batch…

---

### 3.2. Facturation “Pay as you go”

- Tu paies pour le temps où l’instance est **en fonctionnement** (running).
- Quand tu **stoppes** (stop) l’instance, tu ne paies plus la partie **compute**, mais les **volumes de stockage** (EBS) restent facturés.
- Quand tu **termines** (terminate), l’instance disparaît et son disque racine aussi (sauf configuration contraire).

---

### 3.3. AMI – Amazon Machine Image

Une **AMI (Amazon Machine Image)** est un **modèle d’instance** (template) qui contient :

- un système d’exploitation (Amazon Linux, Ubuntu, Windows, etc.)
- éventuellement des logiciels déjà installés
- la config de disques, partitions, etc.

**Relation AMI ↔ EC2 instance** :

```
        +----------------------+
        |      AMI (image)     |
        | OS + config + soft   |
        +----------+-----------+
                   |
            "Launch instance"
                   v
        +----------------------+
        |    EC2 Instance      |  <- VM active
        +----------------------+
                   |
                   v
        +----------------------+
        |    Root volume (EBS) |
        +----------------------+

```

👉 **Les instances EC2 sont des versions actives de ce qui est défini dans une AMI.**

---

### 3.4. Réutilisation d’AMI

Processus classique :

```
AMI #1  --launch-->  EC2 Instance #1  --create image-->  AMI #2  --launch--> EC2 Instance #2

```

Tu peux :

1. Lancer une instance à partir d’une AMI de base (AMI #1).
2. Configurer l’OS, installer tes logiciels, ton app.
3. Créer une **nouvelle AMI personnalisée** (AMI #2).
4. Relancer à volonté des instances identiques à partir d’AMI #2.

C’est très utilisé en entreprise pour standardiser les serveurs.

---

### 3.5. D’où viennent les AMI ?

| Source | Description |
| --- | --- |
| **Quick Start AMIs** | Images fournies par AWS (ex : Amazon Linux). |
| **AWS Marketplace AMIs** | Images proposées par des éditeurs (payantes ou non). |
| **Mes AMI / My AMIs** | AMI personnalisées que tu crées toi-même. |
| **AMI communautaires / Community AMIs** | Images partagées par d’autres utilisateurs. |

---

## 4. Types d’instances et familles

### 4.1. Lecture d’un type d’instance : `c5n.xlarge`

```
c5n.xlarge
│ │ └───── Taille de l’instance (instance size)
│ └─────── Attribut (network optimised, etc.)
└───────── Famille + génération (family + generation)

```

- **Famille (family)** : `c` → **Compute optimised**
- **Génération (generation)** : `5` → 5e génération de la famille C
- **Attribut (attribute)** : `n` → optimisée réseau (network optimised)
- **Taille (size)** : `xlarge` → quantité de vCPU / RAM associée

---

### 4.2. Familles d’instances (Instance Families)

Chaque famille est optimisée pour un type de workload.

| Famille | Type FR / EN | Exemple de cas d’usage |
| --- | --- | --- |
| **M, T** | Généralistes (General purpose) | petites applis web, serveurs d’app, dev/test |
| **C** | Optimisées pour le calcul (Compute optimised) | traitement vidéo, calcul scientifique, micro-services très CPU |
| **R, X, Z** | Optimisées mémoire (Memory optimised) | bases de données en mémoire, caches, gros traitements analytics |
| **P, G, Trn, DL, F, VT** | Calcul accéléré (Accelerated computing, GPU / FPGA) | machine learning, rendu 3D, HPC, encodage vidéo |
| **I, Im, Is, D, H** | Optimisées stockage (Storage optimised) | bases de données NoSQL, data lakes, workload IO intensif |
| **Hpc** | Calcul haute performance (High Performance Computing) | simulations scientifiques, modélisation, CFD |

Tu peux t’en servir à l’oral : “**For CPU-bound workloads, we usually pick C-family instances like c5 or c6g**”.

---

### 4.3. Localisation des instances EC2

Par défaut, quand tu lances une instance :

- elle est déployée dans un **VPC (Virtual Private Cloud)**, souvent le **VPC par défaut** si tu n’en choisis pas ;
- tu peux choisir l’**Availability Zone** (ex : `eu-west-3a`) et les sous-réseaux (subnets).

---

### 4.4. Scalabilité (Scalability) avec EC2

**Scalabilité / Scalability** = capacité d’un système à **augmenter ou diminuer** sa capacité de traitement quand la charge varie.

Deux formes :

| Type | FR | EN | Exemple |
| --- | --- | --- | --- |
| Verticale | Modifier la taille de l’instance | Scale up / down | passer de `t3.small` à `t3.large` |
| Horizontale | Ajouter / retirer des instances | Scale out / in | passer de 2 à 6 serveurs web |

Avec EC2, tu peux :

- utiliser les **APIs** pour créer / détruire des instances ;
- utiliser **Auto Scaling Groups** pour scaler automatiquement selon CPU, nombre de requêtes, etc.

---

### 4.5. Cycle de vie d’une instance (Instance Lifecycle)

```
pending (lancement)
   ↓
running (en fonctionnement)
   ↓   ↘
stopping  rebooting
   ↓
stopped
   ↓
terminated

```

- **pending** : AWS prépare l’instance.
- **running** : l’instance tourne → facturation compute.
- **stopping/stopped** : arrêt, plus de compute facturé (mais stockage oui).
- **terminated** : instance détruite.

---

## 5. Conteneurs (Containers) sur AWS

### 5.1. Rappel VM vs Conteneurs

| Aspect | Virtual Machine (VM) | Container |
| --- | --- | --- |
| Contenu | OS complet + app | App + dépendances uniquement |
| Isolation | Niveau OS (hyperviseur) | Niveau processus (namespace, cgroups) |
| Démarrage | Plutôt lent (minutes) | Rapide (secondes) |
| Poids | Lourd (Go) | Léger (Mo) |
| Densité | Moins de VMs par serveur | Beaucoup de containers par serveur |
| Exemples AWS | EC2 | ECS, EKS, Fargate |

Une VM contient **l’application + un OS invité** (Guest OS).

Un container ne contient **que l’application et ses dépendances**, et partage le noyau (kernel) de l’OS hôte.

---

### 5.2. Services de conteneurs sur AWS

- **Amazon ECS (Elastic Container Service)** : orchestrateur de conteneurs “made in AWS”.
- **Amazon EKS (Elastic Kubernetes Service)** : Kubernetes managé par AWS.
- **AWS Fargate** : mode de compute **serverless pour conteneurs** (utilisé avec ECS ou EKS).

---

## 6. ECS – Amazon Elastic Container Service

ECS fournit une structure logique que tu peux schématiser ainsi :

```
Cluster
 └─ Service
     └─ Task
         └─ Container(s)
             └─ Image Docker

```

| Concept | Rôle FR / EN |
| --- | --- |
| **Cluster** | Groupe logique de ressources / services (cluster) dans une région. |
| **Service** | Maintient un nombre désiré de tâches (service) : remplace les tasks en échec. |
| **Task** | Unité d’exécution composées d’un ou plusieurs containers (task). |
| **Task definition** | Modèle JSON décrivant l’application (image, CPU, mémoire, ports…). |
| **Compute** | EC2, EC2 Spot, Fargate, Fargate Spot. |

---

### 6.1. Exemple de définition de tâche ECS

Tu avais :

```json
{
  "family": "webserver",
  "containerDefinitions": [
    {
      "name": "web",
      "image": "nginx",
      "memory": "100",
      "cpu": "99"
    }
  ],
  "requiresCompatibilities": ["FARGATE"],
  "networkMode": "awsvpc",
  "memory": "512",
  "cpu": "256"
}

```

Décryptage ligne par ligne :

| Champ | Explication FR | EN |
| --- | --- | --- |
| `family` | Nom logique de la famille de tâches, comme un “template name”. | Task family name |
| `containerDefinitions` | Liste des containers qui composent la tâche. | Container definitions |
| `name` | Nom du conteneur dans la tâche. | Container name |
| `image` | Image Docker à utiliser (ici `nginx`). | Docker image |
| `memory` (dans le container) | Mémoire réservée pour ce conteneur. | Container memory |
| `cpu` (dans le container) | Part de CPU allouée à ce conteneur. | Container CPU units |
| `requiresCompatibilities` | Mode d’exécution : ici **FARGATE** (serverless containers). | Launch type |
| `networkMode: "awsvpc"` | Chaque tâche obtient une **ENI** (carte réseau) dédiée. | Network mode |
| `memory` (au niveau tâche) | Mémoire totale pour la tâche. | Task memory |
| `cpu` (au niveau tâche) | CPU total pour la tâche. | Task CPU |

---

## 7. EKS – Amazon Elastic Kubernetes Service

Si tu utilises déjà **Kubernetes**, EKS est :

> Un service managé qui crée et gère le control plane Kubernetes pour toi.
> 
- Tu gardes les concepts Kubernetes : **pods, deployments, services, namespaces…**
- Tu n’administres pas l’ETCD, l’API server, etc.
- Tu peux exécuter les worker nodes sur **EC2** ou en **Fargate**.

Rappel important à l’oral :

> In Kubernetes, a pod is the smallest deployable unit. On EKS, a container runs inside a pod.
> 

---

## 8. Serverless Compute

“**Serverless**” = tu ne gères **pas les serveurs** : pas de gestion d’OS, de patch, de scaling manuel.

Tu fournis uniquement :

- du **code** (Lambda)
- ou une **définition de tâche** (Fargate)

AWS gère :

- l’infrastructure
- le provisioning
- la montée en charge
- la tolérance aux pannes

Avantages :

- facturation ultra granulaire (à la requête / à la seconde)
- zéro gestion de serveurs
- très adapté aux workloads **évènementiels** (event-driven).

---

### 8.1. AWS Fargate

**Fargate** = moteur de compute serverless pour conteneurs ECS/EKS.

Tu définis :

- l’image de container
- la mémoire / CPU
- le réseau et IAM

AWS gère :

- les serveurs sous-jacents
- la capacité
- le patching
- le scaling

Use cases typiques :

- microservices containerisés
- APIs en conteneurs
- traitements batch réguliers ou fréquents

---

### 8.2. AWS Lambda

**Lambda** = exécution de **fonctions** serverless.

Caractéristiques :

- Tu écris une **fonction** (Node, Python, Java, Go, etc.).
- Tu définis la **mémoire** et éventuellement le **timeout**.
- Tu relies la fonction à un **évènement** :
    - upload S3
    - message SQS
    - appel API Gateway
    - événement EventBridge, etc.

Tu paies pour :

- le **nombre d’appels** (requests)
- la **durée d’exécution** * temps mémoire (GB-seconds)

Typiquement utilisé pour :

- tâches ponctuelles
- automatisations d’infra
- ETL légers
- backends simples d’API

---

### 8.3. Fargate vs Lambda

| Critère | Fargate | Lambda |
| --- | --- | --- |
| Type de workload | Containers | Fonctions |
| Durée max | Longue (tâches longues) | Limite (quelques minutes) |
| Gestion du runtime | Tu gères via l’image Docker | AWS gère le runtime fonction |
| Démarrage | Plus lent (pull image) | Très rapide (surtout si warm) |
| Complexité | Orchestration ECS/EKS | Simpler units (functions) |
| Cas typiques | Microservices, jobs batch importants | Tâches ponctuelles, cron, glue autour des services |

---

## 9. Scénarios d’examen – Analyse détaillée

### 9.1. Scénario 1 – Chargement trimestriel d’articles (S3 → DB)

> Énoncé :
> 
> 
> Vous êtes développeur et devez automatiser le chargement d'articles dans une base de données d'une boutique en ligne hébergée sur EC2. L'objectif est de charger les données d'un fichier d'inventaire téléchargé sur Amazon S3 dans la base de données. La mise à jour de l'inventaire se fait une fois par trimestre. Quel service de calcul AWS utiliseriez-vous pour héberger la logique de traitement ?
> 
> Options : EC2, ECS, EKS, AWS Lambda.
> 
> **Bonne réponse : AWS Lambda.**
> 

**Pourquoi Lambda ?**

- La tâche est **évènementielle** : “quand un fichier arrive dans S3, lancer un traitement”.
- La fréquence est **très faible** : une fois par trimestre.
- On ne veut pas payer un serveur 24/7 pour quelques minutes de traitement par an.
- Lambda s’intègre **nativement** avec S3 (S3 event → Lambda trigger).
- Facturation à l’**exécution** uniquement → parfait pour ce cas.

**Pourquoi pas EC2 ?**

- Il faudrait garder une instance EC2 disponible, gérer l’OS, les patchs, etc.
- Même en la démarrant à la demande, c’est plus complexe (cron, scripts d’automatisation).
- Overkill pour un job trimestriel.

**Pourquoi pas ECS / EKS ?**

- ECS/EKS sont faits pour des workloads **containerisés**, souvent continus ou fréquents.
- Tu devrais gérer la définition de tâche, le cluster, etc., ce qui alourdit énormément pour un traitement très ponctuel.
- Lambda est la solution la plus simple et la moins chère pour un **ETL trimestriel**.

> Formulation orale possible :
> 
> 
> *“Because the job runs only once a quarter and is triggered by an S3 upload, AWS Lambda is the best fit: event-driven, fully managed and pay-per-execution. EC2, ECS and EKS would require managing long-lived infrastructure for a very low-frequency task.”*
> 

---

### 9.2. Scénario 2 – Migration d’une appli Linux on-prem vers AWS

> Énoncé :
> 
> 
> Vous devez migrer une application hébergée dans votre centre de données sur site vers AWS. Elle fonctionne actuellement sur des serveurs Linux et vous souhaitez minimiser le refactoring. L'application doit être élastique pour supporter une demande variable. Quelle option de calcul choisiriez-vous ?
> 
> Options : EC2, ECS, EKS, AWS Lambda.
> 
> **Bonne réponse : EC2.**
> 

**Pourquoi EC2 ?**

- Tu veux **minimiser le refactoring** :
    - ton app tourne déjà sur une **VM Linux** → EC2 est presque équivalent à ton serveur actuel.
    - tu peux quasiment **rejouer la même config** (packages, services systemd, etc.).
- Tu peux obtenir l’**élasticité** (elasticity) en :
    - plaçant ton app derrière un **load balancer**
    - utilisant un **Auto Scaling Group** pour ajouter / retirer des instances.

Donc **lift-and-shift** idéal : on déplace plus ou moins tel quel sur EC2.

**Pourquoi pas Lambda ?**

- Lambda est adapté à une app découpée en **fonctions stateless**.
- Migrer une app monolithique Linux en Lambda demanderait **énormément de refactoring** (découpe, adaptation des runtimes, limites de durée, etc.).
- L’énoncé dit explicitement “minimiser le refactoring” → Lambda ne convient pas.

**Pourquoi pas ECS/EKS ?**

- Les conteneurs sont une bonne cible long terme, mais :
    - il faudrait **containeriser** l’application (Dockerfile, configuration, etc.) ;
    - mettre en place un orchestrateur (ECS ou EKS).
- C’est très bien pour une modernisation, mais **plus complexe** qu’un simple lift-and-shift sur EC2.
- Donc pour une première étape rapide → EC2 est la meilleure option.

> Formulation orale :
> 
> 
> *“Since the application already runs on Linux servers and we want to minimize refactoring, EC2 is the most appropriate choice. It allows a lift-and-shift migration with elasticity via Auto Scaling, whereas Lambda or container orchestrators like ECS/EKS would require significant redesign and containerization work.”*
>



<!-- snippet
id: aws_ec2_concept
type: concept
tech: aws
level: beginner
importance: high
format: knowledge
tags: ec2,compute,vm,iaas
title: Amazon EC2 – Machines virtuelles dans le cloud
context: comprendre le service de compute de base sur AWS
content: EC2 permet de créer des VMs dans le cloud payées à la seconde (pay-as-you-go). Arrêter une instance stoppe la facturation compute, mais les volumes EBS restent facturés.
-->

<!-- snippet
id: aws_ami_concept
type: concept
tech: aws
level: beginner
importance: high
format: knowledge
tags: ami,ec2,image,template
title: AMI – Amazon Machine Image
context: standardiser et cloner des serveurs EC2
content: Une AMI est un template d'instance contenant l'OS, les logiciels et la configuration. On peut créer une AMI custom depuis une instance configurée et relancer des instances identiques à volonté.
-->

<!-- snippet
id: aws_ec2_instance_families
type: concept
tech: aws
level: intermediate
importance: high
format: knowledge
tags: ec2,instances,families,compute
title: Familles d'instances EC2
context: choisir le bon type d'instance EC2 selon le workload
content: Les familles EC2 : M/T = usage général, C = compute, R/X = mémoire, P/G = GPU/ML, I/D = stockage. La notation c5n.xlarge = famille C, génération 5, attribut réseau, taille xlarge.
-->

<!-- snippet
id: aws_lambda_concept
type: concept
tech: aws
level: beginner
importance: high
format: knowledge
tags: lambda,serverless,faas,event-driven
title: AWS Lambda – Compute serverless événementiel
context: exécuter du code sans gérer de serveur
content: Lambda exécute des fonctions sur événements (S3, SQS, API Gateway, EventBridge). Facturation au nombre d'appels et à la durée (GB-secondes). AWS gère toute l'infrastructure.
-->

<!-- snippet
id: aws_ecs_fargate_concept
type: concept
tech: aws
level: intermediate
importance: medium
format: knowledge
tags: ecs,fargate,containers,serverless
title: ECS et Fargate – Orchestration de conteneurs
context: déployer des conteneurs sans gérer les serveurs sous-jacents
content: ECS orchestre des conteneurs selon Cluster > Service > Task > Container. Fargate est le mode serverless : on définit image, mémoire et CPU, AWS gère les serveurs sous-jacents.
-->

<!-- snippet
id: aws_scaling_vertical_horizontal
type: concept
tech: aws
level: beginner
importance: high
format: knowledge
tags: scalability,ec2,auto-scaling
title: Scalabilité verticale vs horizontale
context: adapter la capacité d'une application AWS face à la charge
content: Scale vertical = changer la taille d'une instance (t3.small → t3.large). Scale horizontal = ajouter/retirer des instances identiques via un Auto Scaling Group. En prod, on privilégie l'horizontal.
-->

<!-- snippet
id: aws_ec2_create_instance
type: command
tech: aws
level: beginner
importance: high
format: knowledge
tags: ec2,cli,aws-cli
title: Créer une instance EC2 via AWS CLI
context: lancer rapidement une VM EC2 en ligne de commande
command: aws ec2 run-instances --image-id ami-0c55b159cbfafe1f0 --instance-type t3.micro --key-name my-key --security-group-ids sg-xxxxxxxx --subnet-id subnet-xxxxxxxx
description: Lance une instance EC2 avec l'AMI, le type, la clé SSH, le security group et le subnet spécifiés. Le résultat retourne l'InstanceId de la nouvelle instance. Remplacer les IDs par ceux de votre compte et région.
-->

<!-- snippet
id: aws_ec2_stop_start
type: command
tech: aws
level: beginner
importance: medium
format: knowledge
tags: ec2,cli,lifecycle
title: Arrêter et démarrer une instance EC2
context: gérer le cycle de vie d'une instance EC2 pour optimiser les coûts
command: aws ec2 stop-instances --instance-ids i-1234567890abcdef0
description: Arrête une instance EC2 (état stopped). La facturation compute s'arrête mais le volume EBS reste facturé. Pour redémarrer : aws ec2 start-instances --instance-ids i-xxxx. Pour détruire définitivement : aws ec2 terminate-instances --instance-ids i-xxxx.
-->

---
[← Module précédent](M26_AWS_intro.md) | [Module suivant →](M26_AWS_reponse-quizz.md)
---
