---
layout: page
title: Google Compute Engine
sujet: Hosting & Cloud
type: module
jour: 26
ordre: 5
tags: google, gce, cloud, devops
---

# 🧩 **Cours complet : Google Compute Engine (GCE)**

*Niveau : Fondamentaux + Intermédiaire — Approche DevOps / Cloud Engineer*

---

# 1️⃣ Introduction & Contexte

Google Compute Engine (**GCE**) est le service **IaaS** (Infrastructure as a Service) de Google Cloud.

Il permet de **créer et gérer des machines virtuelles (VM)** qui tournent sur l’infrastructure mondiale de Google : la même qui supporte Google Search, YouTube, Gmail.

👉 En tant que DevOps, GCE te donne **un contrôle total sur la VM**, comme un serveur classique (contrairement à App Engine ou Cloud Run qui sont managés).

### 🎁 Crédit gratuit

Google Cloud offre un **crédit de 300 $ valable 90 jours** pour tester tous les services, dont GCE.

### 🔧 Activation des APIs

Pour utiliser GCE, certaines APIs doivent être activées :

- Compute Engine API
- Cloud Resource Manager
- IAM API
- Service Networking si VPC custom
- Cloud Logging / Monitoring (facultatif mais recommandé)

**Pourquoi ?**

→ Google fonctionne par “API activées”. Tant qu’une API n’est pas activée, les services associés sont inaccessibles (CLI + Terraform + Console).

---

# 2️⃣ Architecture et Fonctionnement Général

## 🔹 1. Ressources clés dans GCE

Quand tu crées une VM, tu manipules plusieurs ressources :

| Ressource | Rôle |
| --- | --- |
| **Instance** | La machine virtuelle elle-même |
| **Machine Type** | Le gabarit CPU/RAM |
| **Image** | Le système d’exploitation |
| **Disques** | Stockage persistant ou temporaire |
| **Network / Subnet** | L’emplacement du trafic |
| **Firewall rules** | Filtrage L3-L4 |
| **Service Account** | Identité de la VM |
| **Metadata** | Scripts de démarrage, clés SSH, variables |

GCE est extrêmement modulaire : **tout peut être changé ou automatisé**.

---

# 3️⃣ Types d’instances GCE (Machine Types)

Google propose des familles d’instances pour différents usages :

## 🔧 **1. General purpose (E2, N2, N2D, C3-standard)**

Usage : serveurs web, API, bases de données petites/moyennes.

- Bon rapport performance/prix
- Recommandé pour la majorité des workloads DevOps

## ⚙️ **2. Compute Optimized (C2, C3)**

Usage : calcul intensif, pipelines de CI, rendu 3D, compression vidéo…

- Fréquences CPU plus élevées
- Parfait pour les runners autoscalés

## 🧠 **3. Memory Optimized (M1, M2)**

Usage : gros Redis, bases NoSQL, Spark.

- Jusqu’à 1,4 To de RAM

## 🎮 **4. GPU Instances (A2, G2, L4)**

Usage : IA, Machine Learning, Deep Learning, entraînement de modèles.

- Support NVIDIA (TF, PyTorch, CUDA)

## 📦 **5. Storage Optimized (Hyperdisk / SSD local)**

Usage : bases à très haut IOPS (Postgres, Cassandra, MongoDB).

---

# 4️⃣ Images & Conteneurs

## 🖼️ **Images disponibles**

Google propose :

- Ubuntu
- Debian
- CentOS / Rocky Linux
- Windows Server
- Container-Optimized OS (COS)
- Images personnalisées (à importer depuis un VMDK, QCOW2)
- Images Marketplace (Traefik, Rancher, GitLab, Jenkins…)

## 🐳 **Instances basées conteneur**

GCE peut lancer :

- Une VM normale
- Une VM qui exécute **directement un conteneur Docker au démarrage**

Exemple : charger automatiquement une image Nginx :

```bash
gcloud compute instances create web1 \
  --machine-type=e2-small \
  --image-family=cos-stable \
  --image-project=cos-cloud \
  --metadata=google-container-manifest='
  {
    "version": "2",
    "containers": [{
      "image": "nginx:latest",
      "name": "nginx"
    }]
  }'

```

---

# 5️⃣ Réseau dans GCE (VPC, Firewall, IP)

## 🌐 1. VPC

Google utilise un VPC global unique — très différent d’AWS.

- Un VPC peut couvrir **plusieurs régions**
- Les sous-réseaux sont régionaux
- Les IP internes sont globalement routables dans le VPC

## 🔥 2. Firewall

Les règles firewall GCE sont **attachées au VPC**, pas à la VM.

→ Comparable à un **Security Group à la AWS**, mais au niveau du réseau.

Exemple : ouvrir le port 22 depuis ton IP :

```bash
gcloud compute firewall-rules create allow-ssh \
  --direction=INGRESS \
  --priority=1000 \
  --network=default \
  --action=ALLOW \
  --rules=tcp:22 \
  --source-ranges=$(curl -s ifconfig.me)/32

```

## 🌍 3. IP Publiques et Privées

- IP publique = éphémère ou statique (réservée)
- IP privée = reste la même tant que l’instance existe
- NAT possible via Cloud NAT

---

# 6️⃣ Création d’une VM : Step-by-Step (Console & CLI)

## 🖥️ Étape 1 : Définir le nom et la région

Concepts importants :

- **Region** : zone géographique (europe-west1)
- **Zone** : datacenter (europe-west1-b)

---

## ⚙️ Étape 2 : Choisir le type de machine

- e2-micro → gratuit en Always Free
- e2-medium → bon équilbre
- n2-standard-4 → workloads sérieux
- c3 → CPU optimisé

---

## 🖼️ Étape 3 : Choisir l’image OS ou un conteneur

- Ubuntu 22.04 (classique pour DevOps)
- Debian (stable)
- COS pour conteneur Docker au boot

---

## 🔒 Étape 4 : Configurer Firewall

- HTTP (80)
- HTTPS (443)
- SSH (22)
- Ports custom : 8080, 3000…

---

## 🔑 Étape 5 : Connexion via SSH

Deux options :

### 1. Via la console (bouton SSH)

Ultra simple : un tunnel Google est créé automatiquement.

### 2. Via ton terminal

```bash
ssh -i mykey.pem user@PUBLIC_IP

```

Tu peux aussi récupérer ta clé via :

```
Compute Engine > Metadata > SSH Keys

```

---

# 7️⃣ Commandes GCE essentielles (gcloud CLI)

## 🔧 Créer une instance

```bash
gcloud compute instances create my-instance \
  --zone=europe-west1-b \
  --machine-type=e2-medium \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud

```

## 🗑️ Supprimer

```bash
gcloud compute instances delete my-instance

```

## 💾 Ajouter un disque

```bash
gcloud compute disks create data-disk \
  --size=200GB --type=pd-balanced

```

## 🔌 Attacher un disque

```bash
gcloud compute instances attach-disk my-instance \
  --disk=data-disk

```

## 🔥 Firewall

```bash
gcloud compute firewall-rules create allow-http \
  --allow=tcp:80

```

---

# 8️⃣ Sécurité & Bonnes Pratiques (Important DevOps)

## 1. Toujours utiliser un **Service Account minimal**

Ne jamais utiliser “Compute Engine default service account”.

## 2. Éviter les IP publiques quand possible

Préférer :

- Bastion host
- Identity-Aware Proxy
- Private Google Access

## 3. Utiliser OS Login pour les accès SSH

Plus sécurisé que les clés SSH stockées dans Metadata.

## 4. Activer :

- Cloud Monitoring
- Cloud Logging
- VPC Flow Logs

## 5. Toujours utiliser :

- Firewall restrictif
- IAM granulaire
- Disques chiffrés (par défaut, mais clé personnalisée possible)

---

# 9️⃣ Automatisation (Terraform + Startup Script + Metadata)

## Exemple : Script de démarrage (bash)

```
#! /bin/bash
apt update -y
apt install -y nginx
systemctl enable nginx

```

Appliquer sur une VM :

```bash
gcloud compute instances create web \
  --metadata=startup-script='#! /bin/bash
apt update -y
apt install -y nginx'

```

---

# 🔟 Conclusion

Google Compute Engine est un service **IaaS puissant, rapide à déployer, flexible**, idéal pour les DevOps :

- Très rapide à créer
- Très intégrable à la CI/CD (GitLab, GitHub, Cloud Build)
- Excellente gestion des conteneurs
- Réseau global unique (gros avantage sur AWS)
- Bonnes performances CPU / GPU

Savoir maîtriser GCE, c’est aussi comprendre :

- IAM
- VPC
- Firewall
- Metadata
- Service Account
- Automatisation gcloud et Terraform



<!-- snippet
id: gcp_gce_create_instance
type: command
tech: gcp
level: beginner
importance: high
format: knowledge
tags: gce,gcloud,vm,compute
title: Créer une instance GCE avec gcloud CLI
context: déployer une VM Ubuntu sur Google Compute Engine
command: gcloud compute instances create my-instance --zone=europe-west1-b --machine-type=e2-medium --image-family=ubuntu-2204-lts --image-project=ubuntu-os-cloud
description: Crée une instance VM e2-medium avec Ubuntu 22.04 dans la zone europe-west1-b. Le type e2-medium offre un bon rapport performance/prix pour les workloads DevOps standards. Le e2-micro est disponible dans l'Always Free tier de GCP.
-->

<!-- snippet
id: gcp_firewall_create
type: command
tech: gcp
level: beginner
importance: high
format: knowledge
tags: gce,firewall,réseau,sécurité
title: Créer une règle de pare-feu GCE
context: ouvrir un port sur une instance GCE depuis son IP
command: gcloud compute firewall-rules create allow-ssh --direction=INGRESS --priority=1000 --network=default --action=ALLOW --rules=tcp:22 --source-ranges=$(curl -s ifconfig.me)/32
description: Crée une règle firewall pour autoriser SSH uniquement depuis l'IP courante. Les règles firewall GCE sont attachées au VPC (pas à la VM directement). Pour HTTP : --rules=tcp:80. Pour ouvrir à tous : --source-ranges=0.0.0.0/0 (déconseillé en production).
-->

<!-- snippet
id: gcp_gce_concept
type: concept
tech: gcp
level: beginner
importance: high
format: knowledge
tags: gce,iaas,vm,google-cloud
title: Google Compute Engine – Service IaaS de GCP
context: comprendre le service de machines virtuelles de Google Cloud
content: GCE est le service IaaS de Google Cloud. Familles : E2/N2 (général), C2/C3 (compute), M1/M2 (mémoire, jusqu'à 1,4 To RAM), A2/G2 (GPU/IA).
-->

<!-- snippet
id: gcp_vpc_global
type: concept
tech: gcp
level: intermediate
importance: high
format: knowledge
tags: gce,vpc,réseau,global
title: VPC GCP – Réseau global unique
context: comprendre la différence entre le réseau GCP et AWS/Azure
content: Le VPC GCP est global : un seul VPC couvre toutes les régions (contrairement à AWS où chaque VPC est régional). Les règles firewall s'appliquent au niveau du VPC.
-->

<!-- snippet
id: gcp_startup_script
type: tip
tech: gcp
level: intermediate
importance: medium
format: knowledge
tags: gce,metadata,startup-script,automatisation
title: Startup Script GCE – Automatiser la configuration au démarrage
context: provisionner automatiquement une VM GCE au premier démarrage
content: GCE exécute un script bash au démarrage via --metadata=startup-script='...'. Utile pour installer nginx, configurer l'application ou enregistrer la VM dans un monitoring.
-->

<!-- snippet
id: gcp_service_account
type: tip
tech: gcp
level: intermediate
importance: high
format: knowledge
tags: gce,iam,service-account,sécurité
title: Service Account GCE – Identité minimale pour les VMs
context: attribuer des permissions IAM à une instance GCE sans stocker de clés
content: Chaque VM GCE a un Service Account (équivalent IAM Role AWS). Ne jamais utiliser le default service account — créer un compte dédié avec le minimum de permissions.
-->

---
[← Module précédent](M26_AWS_reponse-quizz.md) | [Module suivant →](M26_Azure-VM.md)
---
