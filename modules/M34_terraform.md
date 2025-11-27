---
title: Terraform
sujet: Cloud publique, Hosting & Cloud
type: module
jour: 34
ordre: 1
tags: terraform, iaas, devops, aws, infrastructure
---

# 🎓 **Cours Terraform – Fondamentaux **

*Par ton formateur DevOps, Goose-ready 🧑‍🏫*

---

# 1. 🎯 Objectifs du chapitre

À la fin de cette première partie, tu seras capable de :

- Expliquer **ce qu’est Terraform** et pourquoi il est indispensable en DevOps.
- Comprendre l’approche **Infrastructure as Code (IaC)**.
- Créer et structurer des **fichiers .tf**.
- Utiliser les **commandes clés** (`init`, `plan`, `apply`, `destroy`).
- Maîtriser **tous les types de blocs Terraform** (terraform, provider, data, resource, variable, locals, output, module).
- Poser les bases pour aller ensuite vers **Terraform avancé** (backend, provisioners, etc.).

---

# 2. 🚀 Introduction : pourquoi Terraform ?

Terraform est un outil d’**Infrastructure as Code (IaC)** qui permet de :

- Automatiser la création de serveurs, réseaux, bases de données, VPC, etc.
- Garantir la **reproductibilité** (même fichier = même infra).
- Simplifier la maintenance (un fichier → toutes les modifs appliquées).
- Travailler indépendamment du fournisseur (AWS, Azure, GCP, VMware, Kubernetes…).
- Déployer en un seul **terraform apply**.

Terraform applique **une philosophie** :

> L’infrastructure se gère comme on gère du code.
> 

Ce qui signifie : versionning, reproductibilité, revue de code, pipelines, qualité, tests.

---

# 3. 🧠 Comprendre l’IaC (Infrastructure as Code)

Une infrastructure classique, configurée à la main :

- est lente
- dépend de compétences humaines
- rend les erreurs fréquentes
- est difficile à reproduire pour un autre client ou un autre environnement
- n’est pas auditable

Terraform apporte :

- 🚀 **automatisation**
- 🔁 **reproductibilité**
- 🛡️ **fiabilité**
- 📦 **standardisation**
- 🧪 **tests simplifiés**
- 📌 **versionning Git**

Tu décris *exactement* ce que tu veux dans des fichiers `.tf`.

Terraform lit ces fichiers, compare avec ce qui existe réellement et applique seulement ce qui doit changer.

---

# 4. 🗂️ Installation de Terraform

## 🔹 Installation sur **Debian / Ubuntu**

### 1. Ajouter la clé GPG HashiCorp

```bash
wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp.gpg

```

### 2. Ajouter le dépôt officiel

```bash
echo "deb [signed-by=/usr/share/keyrings/hashicorp.gpg] \
https://apt.releases.hashicorp.com $(lsb_release -cs) main" \
| sudo tee /etc/apt/sources.list.d/hashicorp.list

```

### 3. Installer Terraform

```bash
sudo apt update
sudo apt install terraform -y

```

### 4. Vérifier l’installation

```bash
terraform -version

```

---

## 🔹 Installation sur **Windows (PowerShell)**

### Option 1 – Via Chocolatey (recommandé)

```powershell
choco install terraform -y

```

### Option 2 – Via Scoop

```powershell
scoop install terraform

```

### Option 3 – Téléchargement manuel

- Télécharger le zip : https://developer.hashicorp.com/terraform/downloads
- Extraire dans `C:\terraform`
- Ajouter `C:\terraform` au **PATH**.

---

# 5. 📁 Structure d’un projet Terraform

Un projet Terraform contient généralement :

```
/project
  main.tf
  variables.tf
  outputs.tf
  provider.tf
  modules/

```

Les fichiers `.tf` contiennent des **blocs**.

Chaque bloc a :

- un **type**
- un ou plusieurs **labels**
- un **corps** entre `{ }`

Exemple générique :

```
<BLOCK_TYPE> "<LABEL_1>" "<LABEL_2>" {
  key = value
}

```

---

# 6. ⚙️ Le cycle de vie Terraform (provisionnement)

Terraform suit 4 étapes :

---

## 🔹 Étape 1 – Initialisation

Télécharge les providers, prépare l’environnement.

```bash
terraform init

```

---

## 🔹 Étape 2 – Planification

Analyse les fichiers `.tf` et génère un plan :

```bash
terraform plan

```

Objectif : *“Voici exactement ce que je vais changer.”*

---

## 🔹 Étape 3 – Application

Exécute le plan :

```bash
terraform apply

```

Demande confirmation.

Peut être automatisé :

```bash
terraform apply -auto-approve

```

---

## 🔹 Étape 4 – Destruction

Supprime toutes les ressources créées :

```bash
terraform destroy

```

---

# 7. 🧱 Les Types de Blocs Terraform (Vue complète, détaillée)

👉 **C’est LA partie essentielle de ce chapitre.**

Chaque bloc est expliqué **comme en formation**, avec :

- rôle
- syntaxe
- ce qu'il peut contenir
- bonnes pratiques
- exemples

---

# 🧩 7.1 Bloc `terraform`

Le bloc **terraform** configure Terraform lui-même.

On y définit :

- versions minimales
- providers utilisés (déclarés mais pas configurés)
- le backend (stockage de l’état – ⚠️ avancé, on le verra plus tard)

### 🎯 Utilité

- Contrôler la compatibilité (éviter des versions incompatibles)
- Définir les providers nécessaires
- Charger des fonctionnalités expérimentales

### 🧩 Syntaxe

```
terraform {
  required_version = ">= 1.2.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }
}

```

---

# 🧩 7.2 Bloc `provider`

Terraform utilise des **providers** pour créer les ressources :

- AWS → `aws_*`
- Azure → `azurerm_*`
- Google → `google_*`
- Kubernetes → `kubernetes_*`
- VMware → `vsphere_*`
- GitLab → `gitlab_*`

### 🎯 Utilité

Indiquer :

- où créer les ressources
- comment s’authentifier
- dans quelle région
- paramètres spécifiques au fournisseur

### 🧩 Syntaxe

```
provider "aws" {
  region     = "us-west-2"
  access_key = var.aws_access_key
  secret_key = var.aws_secret_key
}

```

⚠️ Les secrets doivent être stockés dans :

- variables sécurisées
- fichiers `.tfvars`
- Vault
- AWS env vars

---

# 🧩 7.3 Bloc `resource`

C’est le **bloc le plus important**.

### 🎯 Utilité

Créer ou modifier un élément d’infrastructure :

- instance EC2
- VPC
- bucket S3
- base de données RDS
- VM Azure
- Pod Kubernetes

### 🧩 Syntaxe

```
resource "<TYPE>" "<NAME>" {
  key = value
}

```

### Exemple AWS

```
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
}

```

Terraform appliquera automatiquement :

- création
- mise à jour
- suppression si supprimé du code

---

# 🧩 7.4 Bloc `data`

Permet de **récupérer des ressources existantes**.

Il ne crée rien.

### 🎯 Utilité

- Lire des infos externes
- Obtenir une AMI récente
- Récupérer un VPC existant
- Lire un secret déjà créé

### 🧩 Syntaxe

```
data "<TYPE>" "<NAME>" {
  key = value
}

```

### Exemple

```
data "aws_vpc" "default" {
  default = true
}

```

---

# 🧩 7.5 Bloc `variable`

Permet de rendre la configuration dynamique.

### 🎯 Utilité

- Paramétrer la région
- Ajuster le nombre d’instances
- Gérer les tailles de disques
- Gestion multi-environnements (dev, staging, prod)

### 🧩 Syntaxe

```
variable "instance_count" {
  description = "Number of instances"
  type        = number
  default     = 2
}

```

### Utilisation

```
count = var.instance_count

```

---

# 🧩 7.6 Bloc `locals`

Variables **internes**, non modifiables par l’utilisateur.

Utiles pour :

- éviter les répétitions
- calculs intermédiaires
- nettoyer le code

### 🧩 Syntaxe

```
locals {
  project_name = "my-app"
  tags = {
    Name = local.project_name
  }
}

```

---

# 🧩 7.7 Bloc `output`

Affiche des informations **à la fin d’un apply** :

- IP publique
- URL d’un load balancer
- ID d’une instance

### 🧩 Syntaxe

```
output "instance_ip" {
  description = "Public IP"
  value       = aws_instance.web.public_ip
}

```

Affiché en clair après execution.

---

# 🧩 7.8 Bloc `module`

Les modules permettent :

- réutilisation
- standardisation
- organisation propre du code
- packaging de ressources complexes

### Structure d’un module

```
modules/
  vpc/
    main.tf
    variables.tf
    outputs.tf

```

### Utilisation d’un module

```
module "vpc" {
  source = "./modules/vpc"
  region = "eu-west-1"
}

```

---

# 8. 🎒 Exemple complet : petit projet Terraform simple

### `provider.tf`

```
provider "aws" {
  region = "us-east-1"
}

```

### `main.tf`

```
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
}

```

### `outputs.tf`

```
output "instance_ip" {
  value = aws_instance.web.public_ip
}

```

---

# 9. 🧪 Manipulation CLI (résumé pédagogique)

| Action | Commande | Description |
| --- | --- | --- |
| Initialiser | `terraform init` | Télécharge les providers |
| Planifier | `terraform plan` | Analyse ce qui doit changer |
| Appliquer | `terraform apply` | Crée ou modifie l’infra |
| Détruire | `terraform destroy` | Supprime toute l’infra |

---

# 10. 🧩 Résumé visuel des blocs Terraform

| Bloc | But | Crée quelque chose ? | Exemple |
| --- | --- | --- | --- |
| **terraform** | config globale | ❌ | version, providers |
| **provider** | accès au cloud | ❌ | AWS, Azure |
| **resource** | créer/modifier | ✅ | EC2, VPC |
| **data** | lire l'existant | ❌ | AMI existante |
| **variable** | paramètres | ❌ | région, count |
| **locals** | valeurs internes | ❌ | tags |
| **output** | résultat final | ❌ | IP |
| **module** | réutilisation | dépend | VPC, RDS |

---

# 11. 🎯 Conclusion

Tu connais maintenant **tous les fondamentaux Terraform**, et surtout :

- l’IaC
- les fichiers .tf
- les commandes essentielles
- les étapes du workflow Terraform
- tous les types de blocs (bien maîtrisés !)
- la logique modulaire

On est maintenant prêt pour passer à la suite…