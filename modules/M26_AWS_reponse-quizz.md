---
layout: page
title: AWS - Réponse Quiz
sujet: Hosting & Cloud
type: module
jour: 26
ordre: 4
tags: aws, cloud, devops
---

# 1. Introduction AWS & Fondamentaux (Quiz 1)

## 1.1. Comment on interagit avec AWS ?

AWS expose **tous ses services via une API**.

Sur cette API, tu as trois grandes façons de travailler :

- **AWS Management Console**
    - Interface **web** (navigateur), graphique, cliquable.
    - Parfait pour débuter, explorer, tester.
- **AWS CLI**
    - Outil en **ligne de commande** (`aws ...`) qui envoie des appels API.
    - On l’utilise pour **automatiser**, faire des scripts, des rapports, etc.
- **AWS SDK**
    - Bibliothèques pour des langages (Python, Java, JS, etc.) pour appeler l’API **depuis ton code**.

👉 Donc :

**“Interface utilisateur basée sur le web” = AWS Management Console.**

---

## 1.2. Modèle de responsabilité partagée

Idée clé : **tout n’est ni 100 % AWS, ni 100 % toi.**

- AWS est responsable de la **sécurité du cloud** :
    - Data centers, régions, Availability Zones
    - Matériel, réseau physique, hyperviseurs
    - Composants managés (OS de certains services, chiffrement côté serveur pour S3, etc.)
- Le client est responsable de la **sécurité dans le cloud** :
    - Configuration des services (qui a accès à quoi ?)
    - Données (chiffrement, sauvegardes)
    - Gestion des identités et droits (IAM)
    - Politiques de mot de passe, MFA, etc.

➡️ **Les responsabilités varient selon le type de service** :

- Pour un service très managé (S3, Lambda), AWS prend en charge l’OS, les patchs, etc.
- Pour un service type IaaS (EC2), **toi** tu gères l’OS invité, les patchs, les pare-feu, etc.

Exemples de questions qui se cachent là-dedans :

- *“Qui configure les équipements d’infrastructure ?”* → AWS.
- *“Qui définit les règles de complexité des mots de passe ?”* → le client (via IAM).
- *“Qui sécurise régions et Edge Locations ?”* → AWS.

---

## 1.3. Architecture globale : Régions, AZ, Edge Locations

### Régions

- Une **Région AWS** = un **emplacement géographique** (ex : `eu-west-3` = Paris).
- Elle contient plusieurs **Availability Zones (AZ)**.
- **Définition importante pour le quiz** :
    
    > Une Région AWS est un emplacement géographique qui contient une collection d’Availability Zones.
    > 

Choisir une Région, c’est réfléchir à :

1. **Latence** (proximité des utilisateurs)
2. **Prix** (les tarifs varient d’une région à l’autre)
3. **Services disponibles**
4. **Contraintes légales / conformité** (où doivent résider les données)

Exemple quiz :

- Une entreprise japonaise a ses EC2 à Tokyo, les US ont de la latence →
    
    👉 on déploie des EC2 dans une **Région aux États-Unis** pour rapprocher l’appli des utilisateurs.
    

---

### Availability Zones (AZ)

- Une **AZ** = un ou plusieurs data centers, dans la **même région**, reliés par des liens rapides.
- Une Région contient **plusieurs AZ** (au moins 2, souvent 3 ou plus).
- Objectif : **tolérance aux pannes** (panne électrique, incendie, inondation…).

Pourquoi plusieurs AZ ?

- **Construire des architectures hautement disponibles et résilientes** :
    - Tu dupliques tes ressources (EC2, BDD, etc.) sur **plusieurs AZ**.
    - Si une AZ tombe, l’autre continue à servir l’application.

Donc :

- Déployer une appli sur **plusieurs AZ** → **plus de disponibilité**.
- Pour une **disponibilité encore plus forte**, on pense **multi-Région**, par exemple pour la reprise après sinistre (disaster recovery).

---

### Edge Locations (CloudFront)

- Les **Edge Locations** servent à **mettre en cache** du contenu (CDN).
- Utilisées par **Amazon CloudFront**.
- Tu déploies ton appli dans une Région, mais **les contenus statiques** (images, vidéos, fichiers) sont copiés au plus près des utilisateurs.

Exemple quiz :

- 30 % du trafic vient d’Asie, appli déployée en Californie →
    
    La solution la plus simple/économique pour la latence :
    
    👉 **Créer un CDN avec CloudFront**, pour que le contenu soit caché dans des Edge Locations proches de l’Asie.
    

---

### Multi-AZ vs Multi-Région

- **Multi-AZ dans une seule Région**
    - Objectif : haute disponibilité locale (panne d’un data center).
    - Exemple : architecture applicative standard → 2 AZ.
- **Multi-Région**
    - Objectif : **catastrophe majeure** ou besoins métiers (proximité de plusieurs continents).
    - Exemple : **reprise après sinistre (DR)** : Active-Active ou Active-Passive entre deux Régions.

Exemple quiz :

- “Atteindre le plus haut niveau de disponibilité”
    
    👉 **Déployer l’application sur plusieurs Régions ET plusieurs AZ.**
    
- “Protection contre catastrophe naturelle imprévue”
    
    👉 **Déployer les ressources AWS dans une autre Région** avec une stratégie de DR **Active-Active**.
    

---

## 1.4. Architectures cloud & hybrides

- **Cloud-native** : tout est dans le cloud, architecture pensée pour les services cloud.
- **On-premises** : tout est dans le data center de l’entreprise.
- **Hybride** : une partie des systèmes est **on-premises**, une partie sur AWS, reliés par **VPN / Direct Connect**.

Exemple quiz :

- Des serveurs EC2 accèdent à une appli legacy dans le data center →
    
    👉 c’est une **architecture hybride**.
    

---

## 1.5. IAM, identités et sécurité d’accès

### IAM Users, Groups, Roles

- **IAM User**
    - Représente **une personne ou un service**.
    - Peut se connecter à la **console** (user + mot de passe) et/ou utiliser l’**AWS CLI / SDK** (access keys).
- **IAM User Group**
    - **Groupe de users**, pour leur donner **les mêmes permissions**.
    - Ex : groupe `Developers`, groupe `Admins`.
    - Tous les users d’un groupe héritent des mêmes politiques.
- **IAM Role**
    - Identité **sans login/mot de passe**, utilisée pour donner des **droits temporaires** :
        - À un service AWS (EC2 → accès S3)
        - À un autre compte AWS
        - À des utilisateurs fédérés (IdP)

👉 **Pour organiser un grand nombre d’employés techniques et leur attribuer les bons droits**, on utilise :

**IAM user groups + IAM policies.**

---

### Comment on se connecte ?

- **À la console (IAM user)**
    
    → **nom d’utilisateur + mot de passe**
    
- **À l’API / CLI**
    
    → **Access keys** =
    
    - access key ID
    - secret access key

---

### Root user & MFA

- **Root user** = compte créé à l’ouverture du compte AWS, avec **tous les droits**.
- Bonnes pratiques :
    - Ne jamais l’utiliser au quotidien
    - Mettre un **mot de passe fort**
    - Activer la **MFA**
    - Supprimer / ne pas créer d’**access keys** root
- **MFA (Multi-Factor Authentication)** :
    - Quelque chose que tu **sais** (mot de passe)
    - 
        - quelque chose que tu **as** (code d’une appli, clé physique…)
    - Protège l’accès au compte, surtout pour les **comptes privilégiés** (root, admins).

---

### Principe du moindre privilège

- Donner à chaque identité **uniquement les permissions nécessaires**, rien de plus.
- On commence toujours par le **minimum**, puis on ouvre si besoin.

---

## 1.6. Récap “Quiz 1 → où sont les réponses ?”

| Question | Idée clé / Section qui répond |
| --- | --- |
| Q1 Console | 1.1 (AWS Management Console = interface web) |
| Q2 Shared Responsibility | 1.2 (responsabilités qui varient selon le service) |
| Q3 Haute dispo maximale | 1.3 (multi-Région + multi-AZ = plus haut niveau dispo) |
| Q4 Hybride | 1.4 (EC2 qui parle à on-prem = architecture hybride) |
| Q5 Latence US vs Tokyo | 1.3 (déployer EC2 dans une Région US) |
| Q6 IAM groups | 1.5 (organiser des équipes = IAM user groups) |
| Q7 “Design for failure” | 1.3 (utiliser plusieurs AZ) |
| Q8 CloudFront Asie | 1.3 (Edge Locations + CloudFront) |
| Q9 DR catastrophe | 1.3 (déployer dans une **autre Région** en Active-Active) |
| Q10 Rôle des AZ | 1.3 (AZ = architectures résilientes et HA) |
| Q11 Multi-AZ avantage | 1.3 (augmente dispo de l’appli) |
| Q12 Définition Région | 1.3 (emplacement géographique contenant des AZ) |
| Q13 Infra config | 1.2 (AWS configure l’infrastructure physique) |
| Q14 Règles de mot de passe | 1.2 (client configure IAM, politique de mots de passe) |
| Q15 Sécurisation régions/edges | 1.2 (sécurité du cloud = AWS) |
| Q16 Accès temporaire | 1.5 (IAM Roles) |
| Q17 Identifiants console IAM user | 1.5 (username + password) |
| Q18 Identifiants CLI | 1.5 (access keys) |
| Q19 Least privilege | 1.5 (principe du moindre privilège) |
| Q20 MFA | 1.5 (MFA pour les utilisateurs privilégiés) |

---

# 2. AWS Compute (Quiz 2)

## 2.1. EC2 = IaaS, non serverless

- **Amazon EC2** :
    - Tu loues des **machines virtuelles** dans le cloud → modèle **IaaS**.
    - Tu choisis l’AMI, l’instance type, stockage, réseau.
    - Tu gères :
        - l’OS invité,
        - les patchs,
        - les logiciels,
        - la config de sécurité.

👉 Ce n’est **pas** un service serverless, mais ça **évite d’acheter du matériel** et te donne une **capacité de calcul élastique**.

---

## 2.2. AMI & clonage de serveurs

Tu veux l’équivalent de “je prends un modèle de VM et j’en crée 100” :

- Une **AMI (Amazon Machine Image)** :
    - Image qui contient :
        - OS
        - configuration
        - logiciels préinstallés
    - Quand tu lances une instance EC2, tu choisis une AMI.
    - Tu peux **créer ta propre AMI** à partir d’une instance configurée.

👉 C’est l’équivalent de tes “templates” on-premises.

---

## 2.3. Options d’achat EC2

### On-Demand Instances

- Tu payes **à l’heure / à la seconde**, **sans engagement**.
- Idéale pour :
    - workloads courts, ponctuels,
    - environnements de test,
    - projets temporaires (ex. questionnaire d’une journée).

⚠️ **Il n’y a pas de frais de démarrage** à payer au lancement : c’est justement ça le modèle pay-as-you-go.

---

### Spot Instances

- Tu utilises la **capacité inutilisée** d’AWS avec une **réduction jusqu’à ~90 %**.
- Mais :
    - AWS peut **reprendre l’instance** quand il a besoin de la capacité.
    - Tu dois accepter que le traitement puisse être **interrompu**.

Idéal pour :

- Jobs **batch**, traitement d’images, rendu vidéo, data crunching…
- Ta question “vignettes pour des millions d’images” :
    
    👉 Spot = **parfait** : gros volume, interruption acceptable, besoin de coût minimal.
    

---

### Reserved Instances / Savings Plans

- Tu t’engages sur **1 ou 3 ans** pour une capacité (ou une dépense).
- En échange → **grosse réduction** par rapport à On-Demand.
- Adapté aux workloads **stables** (24/7, prévisibles).

---

### Dedicated Hosts

- Serveur physique **entièrement dédié** à ton compte.
- Intérêt :
    - Scénarios de **licences BYOL** (Windows, Oracle, etc.).
    - Conformité qui exige de la **tenance dédiée**.

👉 Si la question parle de “Bring Your Own License (BYOL)”

→ **Dedicated Hosts**.

---

## 2.4. Serverless vs non serverless

### AWS Lambda

- Service de **compute serverless** :
    - Tu fournis **du code** (Python, Node.js, Java, etc.),
    - AWS gère :
        - le provisioning,
        - le scaling,
        - l’infrastructure,
        - l’OS.
- Le code **s’exécute uniquement quand il est déclenché par un événement** :
    - Appel HTTP via API Gateway
    - Message dans une queue
    - Fichier déposé dans S3
    - Cron (CloudWatch Events / EventBridge)

Caractéristiques :

- Tu **ne payes que quand le code tourne**.
- Facturation à la **milliseconde**.
- Supporte nativement plusieurs languages (Node.js, Python, Java, Go, C#, Ruby, etc.).

---

### Fargate

- **Moteur serverless** pour exécuter des **containers** (ECS ou EKS) **sans gérer les EC2**.
- AWS gère :
    - la capacité de cluster,
    - les serveurs,
    - le scaling.

---

### ECS / EKS : orchestration de containers

- **Amazon ECS (Elastic Container Service)** :
    - Service managé pour **orchestrer des containers**.
    - Deux modes :
        - **EC2 launch type** : tu gères le cluster EC2 (tu gardes le contrôle complet).
        - **Fargate launch type** : mode serverless, pas de gestion d’instances.
- **Amazon EKS** : pareil pour **Kubernetes**.

Exemple quiz :

- Besoin de **visibilité et contrôle complet sur le cluster sous-jacent** →
    
    👉 **ECS en launch type EC2** (pas Fargate).
    

---

## 2.5. Pourquoi le serverless est souvent moins cher ?

- Avec une archi **serverless** :
    - Pas de serveurs qui tournent **en permanence**.
    - Tu consommes du compute **uniquement pendant l’exécution du code**.
- Avec EC2 :
    - L’instance tourne même quand elle est **peu utilisée**,
    - Tu payes pendant toute la durée où elle est **running**.

👉 D’où la réponse :

les architectures serverless sont plus économiques parce que **les ressources ne tournent que quand ton code est exécuté**.

---

## 2.6. Récap “Quiz 2 → où sont les réponses ?”

| Question | Idée clé / Section qui répond |
| --- | --- |
| Q1 Appli questionnaire 1 jour | 2.3 (On-Demand pour besoin court, sans engagement) |
| Q2 Vignettes images & coût | 2.3 (Spot Instances pour traitement massif, flexible) |
| Q3 Frais de démarrage On-Demand | 2.3 (pas de frais de démarrage → l’affirmation est fausse) |
| Q4 Pentest EC2 | 2.3 / bon sens AWS : le client peut faire des pentests sur ses propres instances, sans autorisation préalable (dans les limites de la policy) |
| Q5 BYOL | 2.3 (Dedicated Hosts = BYOL) |
| Q6 Template de VM | 2.2 (AMI) |
| Q7 / Q15 Service serverless pour exécuter applis | 2.4 (AWS Lambda) |
| Q8 Migration EC2 → Lambda | 2.4 (AWS gère l’OS → maintenance OS par AWS) |
| Q9 “Code exécuté seulement à l’événement” | 2.4 (Lambda s’exécute sur events) |
| Q10 Langages Lambda | 2.4 (support natif de plusieurs langages) |
| Q11 Ressource non serverless | 2.1 / 2.4 (EC2 = non serverless) |
| Q12 Caractéristique NON Lambda | 2.4 (Lambda ne fournit pas une capacité redimensionnable type EC2, mais un compute à l’appel) |
| Q13 Service compute managé | 2.4 (Lambda = compute managé, EC2 non) |
| Q14 Service compute managé | 2.4 (Lambda) |
| Q16 Modèle cloud d’EC2 | 2.1 (EC2 = IaaS) |
| Q17 Modèles de cloud | 2.1 (IaaS, PaaS, SaaS – pas NaaS) |
| Q18 EC2 non serverless | 2.1 (affirmation “EC2 est serverless” est incorrecte) |
| Q19 TCO qui diminue | 2.3 / 2.5 (AWS baisse régulièrement ses prix) |
| Q20 Économie serverless | 2.5 (compute utilisé seulement à l’exécution) |
| Q21 Elastic computing | 2.1 / 2.3 (élasticité → réduction TCO) |

---

# 3. AWS Networking (Quiz 3)

## 3.1. VPC, Subnets, Isolation

- **Amazon VPC (Virtual Private Cloud)** :
    - Ton **réseau virtuel privé** dans AWS,
    - Isolé des autres clients,
    - Tu choisis plage IP (CIDR), subnets, routes, etc.

👉 “Un réseau virtuel dédié à ton compte AWS” = **Amazon VPC**.

- **Subnets** :
    - Sous-réseaux à l’intérieur du VPC,
    - Associés à une **Availability Zone**,
    - Servent à séparer ressources publiques / privées.

👉 Dans le tableau de bord VPC, tu peux créer : VPC, Subnets, route tables, gateways…

---

## 3.2. Contrôle du trafic : Security Groups vs Network ACL

- **Security Group** :
    - Attaché à une **instance EC2** (ou ENI).
    - Contrôle **le trafic entrant et sortant** au niveau de l’instance.
    - **Stateful** : si le trafic entrant est autorisé, la réponse sortante est automatiquement autorisée.
    - Par défaut : **tout inbound bloqué, tout outbound autorisé**.
- **Network ACL (NACL)** :
    - Attachée à un **subnet**.
    - Filtre le trafic **entrant et sortant** du subnet.
    - **Stateless** : il faut des règles pour l’aller ET le retour.
    - Par défaut : toutes les connexions sont autorisées.

Exemples quiz :

- “Fonction de sécurité associée à une instance EC2 pour filtrer le trafic entrant ?”
    
    👉 **Security Group.**
    
- “Composants à analyser pour auditer le trafic entrant/sortant de tes EC2 ?”
    
    👉 **Security Groups + Network ACLs.**
    
- “Protection contre DDoS ?”
    
    👉 Les **Network ACLs** peuvent aider à filtrer certaines attaques réseau (même si dans la vraie vie tu utilises aussi AWS Shield, WAF, etc.).
    

---

## 3.3. Connectivité hybride

Tu veux relier ton data center on-premises à ton VPC :

- **Site-to-Site VPN**
    - Utilise **IPSec** sur internet.
    - Connexion chiffrée, mais dépend de la qualité de ta connexion internet.
- **AWS Direct Connect**
    - **Lien physique dédié** (fibre) entre ton DC et AWS.
    - Plus stable, plus prévisible, souvent plus rapide.
    - Excellent pour transferts **gros volumes de données quotidiens**.

👉 Construire une architecture **hybride** :

**AWS VPN + Direct Connect** sont les options de connectivité.

---

## 3.4. Transit Gateway & VPC Peering

- **VPC Peering** :
    - Connecte **deux VPC** l’un à l’autre.
    - Devient complexe avec beaucoup de VPC (maillage full-mesh).
- **AWS Transit Gateway** :
    - Routeur centralisé pour **connecter des centaines de VPC** + on-prem.
    - Simplifie énormément les architectures multi-VPC.

👉 Si tu as **des centaines de VPC dans plusieurs Régions** et tu veux simplifier les connexions → **AWS Transit Gateway.**

---

## 3.5. Sauvegardes géographiques

Tu veux une sauvegarde dans “un autre emplacement géographique” :

- **Autre AZ** : même région, protection contre panne d’AZ.
- **Autre Région** : autre zone géographique → meilleure protection contre catastrophe majeure, exigence légale, etc.
- **Edge Location** : pas pour les sauvegardes, c’est pour du cache (CloudFront).

👉 Donc : pour “autre emplacement géographique” → **autre Région**.

---

## 3.6. Récap “Quiz 3 → où sont les réponses ?”

| Question | Idée clé / Section qui répond |
| --- | --- |
| Q1 Réseau virtuel dédié | 3.1 (Amazon VPC) |
| Q2 Sécurité attachée à EC2, filtrer inbound | 3.2 (Security Group) |
| Q3 Beaucoup de VPC dans plusieurs Régions | 3.4 (AWS Transit Gateway) |
| Q4 Sauvegarde autre emplacement géographique | 3.5 (autre Région) |
| Q5 / Q13 / Q16 Audit du trafic | 3.2 (Security Groups + Network ACLs) |
| Q6 Connecter VPC à DC on-prem | 3.3 (AWS Direct Connect – mais attention, quiz a aussi une question séparée sur VPN) |
| Q7 Dashboard VPC | 3.1 (Subnets configurables via VPC console) |
| Q8 Isolation réseau | 3.1 (Virtual Private Cloud) |
| Q9 IPSec entre on-prem et AWS | 3.3 (Site-to-Site VPN) |
| Q10 Connexion réseau privée dédiée | 3.3 (AWS Direct Connect) |
| Q11 Options pour cloud hybride | 3.3 (VPN + Direct Connect) |
| Q12 Gros transferts quotidiens, besoin de stabilité | 3.3 (Direct Connect) |
| Q14 Protection DDoS | 3.2 (Network ACLs) |
| Q15 Contrôle du trafic réseau | 3.2 (NACLs) |

---

# 4. Cloud Hosting & Web Hosting (Quiz 4)

Ici on est plus “général web / cloud” que spécifique AWS, mais on peut recoller avec ce que tu as vu.

## 4.1. Qu’est-ce que l’hébergement web ?

- Ton site/appli = **fichiers + base de données + code**.
- Pour qu’il soit accessible partout, tu dois stocker ces fichiers sur un **serveur distant** connecté à Internet.

👉 L’hébergement web, c’est **le stockage de fichiers sur un serveur distant** pour rendre un site **accessible en ligne**.

---

## 4.2. Types d’hébergement web

### Hébergement partagé

- Plusieurs sites partagent **le même serveur** (CPU, RAM, IP).
- Peu cher, mais :
    - performance variable,
    - moins de contrôle.

### Hébergement dédié

- Un **serveur entier pour un seul client / site**.
- Plus cher, mais :
    - meilleures perfs,
    - contrôle total (config, sécurité).

### Hébergement cloud

- Le site est hébergé non pas sur **un seul serveur**, mais sur un **réseau de serveurs distants**.
- Les données sont stockées sur **plusieurs serveurs**, ce qui permet :
    - **évolutivité** (scalabilité),
    - **redondance**,
    - meilleure **tolérance aux pannes**.

👉 Cloud = tu utilises l’infrastructure de ton **Cloud Provider** (AWS, Azure, GCP…).

---

## 4.3. Scalabilité & redondance dans le cloud

- **Évolutivité (scalabilité)** :
    - Capacité à **augmenter ou réduire les ressources** (CPU, RAM, stockage, nombre d’instances) selon la demande.
    - Ex : monter à 10 serveurs pour un pic de trafic, redescendre à 2 quand c’est calme.
- **Redondance** :
    - **Duplication des données** ou des ressources sur plusieurs serveurs ou zones.
    - Si un serveur tombe, un autre prend le relais.
    - Améliore la **fiabilité** et réduit les temps d’arrêt.

---

## 4.4. Types de cloud

- **Cloud public**
    - Infrastructure partagée entre **plusieurs clients** (multi-tenant).
    - Ex : AWS, Azure, GCP.
- **Cloud privé**
    - Infrastructure dédiée à **un seul client**.
    - Peut être on-prem ou hébergée chez un provider.
- **Cloud hybride**
    - Combinaison de **cloud public + cloud privé + on-prem**.

---

## 4.5. Cloud Provider et choix d’un provider

- **Cloud Provider** = fournisseur de services de **cloud / hébergement** :
    - Compute (VM, containers, serverless)
    - Stockage
    - Bases de données
    - Réseau, sécurité, etc.

Exemples principaux :

- **AWS**
- **Microsoft Azure**
- **Google Cloud Platform**

Pour choisir un provider on regarde :

- **Coût** (modèle pay-as-you-go, remises, TCO)
- **Performances**
- **Sécurité & conformité**

---

## 4.6. Tarification pay-as-you-go

- Tu payes **en fonction de ta consommation réelle** :
    - CPU utilisé,
    - stockage consommé,
    - bande passante, etc.
- Pas de coût fixe mensuel imposé **par ressource**, tu peux monter/descendre, démarrer/arrêter.

👉 C’est le modèle **“pay-as-you-go”**.

---

## 4.7. Récap “Quiz 4 → où sont les réponses ?”

| Question | Idée clé / Section qui répond |
| --- | --- |
| Q1 Définition hébergement web | 4.1 (stockage de fichiers sur un serveur distant) |
| Q2 Importance | 4.1 (rend le site accessible en ligne) |
| Q3 Types d’hébergement | 4.2 (partagé, dédié, cloud) |
| Q4 Partagé | 4.2 (plusieurs sites sur un même serveur) |
| Q5 Dédié | 4.2 (un seul site sur un serveur) |
| Q6 Hébergement cloud | 4.2 (hébergé sur un réseau de serveurs distants) |
| Q7 Importance hébergement cloud | 4.3 (grande évolutivité) |
| Q8 Avantages cloud vs traditionnel | 4.3 (évolutivité, sécurité, coûts) |
| Q9 Fonctionnement du cloud | 4.2 / 4.3 (données sur plusieurs serveurs distants) |
| Q10 Scalabilité | 4.3 (augmenter / réduire les ressources à la demande) |
| Q11 Redondance | 4.3 (duplication des données sur plusieurs serveurs) |
| Q12 Impact de la redondance | 4.3 (améliore la fiabilité, évite les temps d’arrêt) |
| Q13 Types de cloud | 4.4 (public, privé, hybride) |
| Q14 Cloud public | 4.4 (infrastructure partagée) |
| Q15 Cloud privé | 4.4 (infrastructure dédiée) |
| Q16 Cloud Provider | 4.5 (fournisseur de services d’hébergement en ligne) |
| Q17 Principaux providers | 4.5 (AWS, Azure, GCP) |
| Q18 Critères de choix | 4.5 (coût, performances, sécurité) |
| Q19 Pay-as-you-go | 4.6 (payer en fonction de la consommation) |



<!-- snippet
id: aws_ec2_pricing_models
type: concept
tech: aws
level: intermediate
importance: high
format: knowledge
tags: ec2,pricing,on-demand,spot,reserved
title: Modèles de facturation EC2
context: choisir le bon modèle tarifaire EC2 selon le cas d'usage
content: On-Demand : sans engagement, paiement à la seconde. Spot : capacité inutilisée AWS (-90%), interruptible. Reserved : engagement 1-3 ans avec grosses réductions. Dedicated Hosts : serveur physique dédié pour BYOL.
-->

<!-- snippet
id: aws_ec2_spot_instances
type: tip
tech: aws
level: intermediate
importance: medium
format: knowledge
tags: ec2,spot,coût,batch
title: Spot Instances – Réduire drastiquement les coûts de compute
context: optimiser les coûts pour des traitements batch ou de données
content: Les Spot Instances utilisent la capacité inutilisée d'AWS avec jusqu'à 90% de réduction. AWS peut récupérer l'instance avec 2 minutes de préavis. Idéal pour les traitements batch tolerants aux interruptions.
-->

<!-- snippet
id: aws_multi_az_vs_multi_region
type: concept
tech: aws
level: intermediate
importance: high
format: knowledge
tags: az,région,haute-disponibilité,disaster-recovery
title: Multi-AZ vs Multi-Région
context: concevoir une architecture hautement disponible sur AWS
content: Multi-AZ protège contre la panne d'un data center (haute disponibilité locale). Multi-Région protège contre une catastrophe majeure et réduit la latence mondiale. Le plus haut niveau : Multi-Région + Multi-AZ en Active-Active.
-->

<!-- snippet
id: aws_cloudfront_edge_locations
type: concept
tech: aws
level: beginner
importance: medium
format: knowledge
tags: cloudfront,cdn,edge-location,latence
title: CloudFront et Edge Locations – CDN AWS
context: réduire la latence pour des utilisateurs géographiquement éloignés
content: CloudFront est le CDN d'AWS qui met en cache les contenus dans des Edge Locations proches des utilisateurs. Il réduit la latence sans redéployer l'application dans chaque région.
-->

<!-- snippet
id: aws_iam_role_vs_user
type: concept
tech: aws
level: intermediate
importance: high
format: knowledge
tags: iam,role,user,accès-temporaire
title: IAM Role vs IAM User
context: choisir entre user et role pour attribuer des permissions AWS
content: IAM User = identifiants permanents (mot de passe ou access keys). IAM Role = identité temporaire assumée via STS, sans identifiants permanents. Utiliser les Roles pour les services AWS, comptes croisés et identités fédérées.
-->

<!-- snippet
id: aws_least_privilege
type: tip
tech: aws
level: beginner
importance: high
format: knowledge
tags: iam,sécurité,permissions,moindre-privilège
title: Principe du moindre privilège
context: sécuriser les accès AWS en limitant les permissions
content: Commencer avec 0 permission et n'ajouter que le strict nécessaire. Créer des policies ciblées (ex: dynamodb:GetItem plutôt que dynamodb:*). Réviser régulièrement avec IAM Access Analyzer.
-->

---
[← Module précédent](M26_AWS_Compute.md) | [Module suivant →](M26_Google_GCE.md)
---
