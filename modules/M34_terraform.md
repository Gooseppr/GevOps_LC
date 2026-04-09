---
layout: page
title: Terraform
sujet: Automatisation IaC
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

On est maintenant prêt pour passer à la suite…

## 11. 📚 Tableau des commandes Terraform essentielles

Ces commandes couvrent ce dont tu as besoin pour les **exercices de base** (partie 1).

| Commande | Rôle | Quand l’utiliser ? |
| --- | --- | --- |
| `terraform init` | Initialise le projet Terraform et télécharge les providers. | Au début d’un nouveau projet ou après modification des providers. |
| `terraform plan` | Affiche le plan des modifications (aperçu sans exécuter). | Avant chaque `apply`, pour vérifier ce que Terraform va faire. |
| `terraform apply` | Applique les changements et crée/modifie les ressources. | Quand le plan te convient et que tu veux déployer l’infra. |
| `terraform destroy` | Détruit toutes les ressources gérées par ce projet. | Pour nettoyer un environnement de test ou un exercice terminé. |
| `terraform fmt` | Reformate les fichiers `.tf` selon les conventions officielles. | Quand ton code est mal aligné / avant un commit ou un rendu. |
| `terraform validate` | Vérifie la validité syntaxique et logique de la configuration. | Avant `plan` / `apply`, pour vérifier que tu n’as pas fait d’erreur. |
| `terraform show` | Affiche l’état actuel de l’infra ou d’un plan. | Pour inspecter ce qui a été créé ou vérifier le contenu du state. |
| `terraform state list` | Liste toutes les ressources suivies dans l’état Terraform. | Pour voir ce que Terraform gère dans ce projet. |
| `terraform state show` | Affiche le détail d’une ressource suivie dans l’état. | Pour inspecter précisément les attributs d’une ressource. |
| `terraform output` | Affiche les valeurs des blocs `output`. | Après un `apply`, pour récupérer des infos utiles (IP, URL, IDs). |
| `terraform version` | Affiche la version de Terraform installée. | En cas de bug / incompatibilité ou pour documenter ton environnement. |
| `terraform providers` | Liste les providers utilisés par le projet. | Pour vérifier quels providers sont nécessaires / chargés. |

---

## 12. 🧩 Focus sur `terraform output`

`terraform output` est la commande prévue par Terraform pour **récupérer des informations “propres”** sur ton infrastructure, sans avoir à fouiller dans le state.

### 12.1. Principe de base

1. Tu déclares un **bloc `output`** dans ta configuration `.tf`.
2. Après `terraform apply`, Terraform calcule ces valeurs.
3. Tu utilises `terraform output` pour les afficher.

### 12.2. Déclaration d’un `output`

Exemple classique avec une IP publique d’instance :

```
resource "aws_instance" "<nom de l'instance>" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
}

output "instance_public_ip" {
  description = "Public IP of the web server"
  value       = aws_instance.web.public_ip
}

```

### 12.3. Utilisation de la commande

- **Afficher tous les outputs :**

```bash
terraform output

```

- **Afficher un output particulier :**

```bash
terraform output instance_public_ip

```

- **Obtenir la valeur “brute” (sans guillemets, sans texte autour) :**

```bash
terraform output -raw instance_public_ip

```

- **Obtenir les valeurs en json :**

```bash
terraform output -json 

```

C’est cette forme qui est idéale pour l’utiliser dans un script Bash, par exemple :

```bash
SERVER_IP=$(terraform output -raw instance_public_ip)
echo "Je me connecte à $SERVER_IP"

```

### 12.4. Déclaration d’un `output` sensible

Exemple classique avec une IP publique d’instance :

```
resource "aws_instance" "<nom de l'instance>" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
  sensitive     = true
}

output "instance_public_ip" {
  description = "Public IP of the web server"
  value       = aws_instance.web.public_ip
}

```

Avec ceci la sortie ne sort en clair que lorsque l'appel est identifié

```bash

terraform output # Réponse : instance_public_ip = <sensitive>

terraform output instance_public_ip # Réponse : "xx.xx.x.xx"

```


### 12.5. Bonnes pratiques avec `output`

- Exposer uniquement ce qui est **utile** : IP, URL, ID, noms de ressources.
- Ne pas exposer de **secrets** (mots de passe, clés privées) en clair.
- Utiliser `raw` quand tu veux intégrer la valeur directement dans une commande ou un script.

En résumé :

👉 Pour obtenir une info précise et propre : **`output` en premier, `grep` seulement en complément.**

---

## 13. 🔍 Associer Terraform et `grep` (cas simples et utiles)

Même si `terraform output` est la méthode propre, tu peux utiliser `grep` pour :

- explorer rapidement
- filtrer certaines lignes
- repérer des attributs dans les ressources

On reste ici sur des **combinaisons simples**, adaptées à la partie 1.

---

### 13.1. Filtrer une ressource dans l’état avec `terraform state show` + `grep`

Tu veux voir, par exemple, la ligne qui contient l’IP publique de ton instance :

```bash
terraform state show aws_instance.web | grep public_ip

```

Tu obtiendras une ligne de ce type :

```
public_ip = "54.210.123.45"

```

C’est pratique pour :

- vérifier rapidement qu’une info existe
- repérer le nom exact d’un attribut (ex: `public_ip`, `private_dns`, etc.)

---

### 13.2. Chercher une info dans tout l’état avec `terraform show` + `grep`

Si tu n’es pas sûr du nom de la ressource ou que tu veux juste fouiller :

```bash
terraform show | grep aws_instance

```

ou pour chercher toutes les IP publiques :

```bash
terraform show | grep public_ip

```

Ça te permet de faire une **recherche textuelle rapide** dans la représentation de l’état.

---

### 13.3. Combiner `terraform output` + `grep` (exploration simple)

Parfois tu peux avoir plusieurs outputs, et tu veux juste filtrer certains :

```bash
terraform output | grep ip

```

Par exemple, si tu as :

- `instance_public_ip`
- `database_private_ip`
- `load_balancer_ip`

Ça te donne en un coup d’œil tous les outputs qui contiennent “ip”.

# 14. 🎯 Conclusion

Tu connais maintenant **tous les fondamentaux Terraform**, et surtout :

- l’IaC
- les fichiers .tf
- les commandes essentielles
- les étapes du workflow Terraform
- tous les types de blocs (bien maîtrisés !)
- la logique modulaire



---

<!-- snippet
id: terraform_init_plan_apply
type: command
tech: terraform
level: beginner
importance: high
format: knowledge
tags: terraform,init,plan,apply,workflow
title: Workflow de base Terraform : init → plan → apply
context: déployer une infrastructure pour la première fois ou après une modification
command: terraform init && terraform plan
description: Initialise le projet en téléchargeant les providers, puis génère le plan des changements. Lancer `terraform apply` après vérification du plan.
-->

<!-- snippet
id: terraform_destroy
type: command
tech: terraform
level: beginner
importance: high
format: knowledge
tags: terraform,destroy,cleanup
title: Détruire toutes les ressources Terraform gérées
context: nettoyer un environnement de test ou libérer des ressources cloud après un exercice
command: terraform destroy
description: Supprime toutes les ressources décrites dans les fichiers .tf du projet. Demande confirmation avant exécution. À utiliser avec précaution en production.
-->

<!-- snippet
id: terraform_output_raw
type: command
tech: terraform
level: beginner
importance: medium
format: knowledge
tags: terraform,output,ip,script
title: Récupérer une valeur d'output Terraform dans un script
context: utiliser l'IP d'une instance Terraform dans une commande Bash ou un inventaire Ansible
command: terraform output -raw instance_public_ip
description: Retourne la valeur brute sans guillemets ni JSON. Utiliser dans un script : `SERVER_IP=$(terraform output -raw instance_public_ip)` pour injecter une IP dans un inventaire Ansible.
-->

<!-- snippet
id: terraform_blocks_concept
type: concept
tech: terraform
level: beginner
importance: high
format: knowledge
tags: terraform,blocs,resource,variable,output,provider
title: Les 8 types de blocs Terraform et leurs rôles
context: comprendre la structure d'un projet Terraform et le rôle de chaque bloc
content: Les 8 blocs Terraform sont : terraform (configuration globale, version, providers requis), provider (accès au cloud : région, credentials), resource (créer/modifier une ressource : EC2, VPC, S3…), data (lire une ressource existante sans la créer), variable (paramètres configurables), locals (valeurs internes calculées), output (exposer une info après apply : IP, URL) et module (regrouper et réutiliser des ressources). Seul resource crée effectivement quelque chose.
-->

<!-- snippet
id: terraform_state_list
type: command
tech: terraform
level: intermediate
importance: medium
format: knowledge
tags: terraform,state,list,debug
title: Lister les ressources suivies par Terraform
command: terraform state list
description: Affiche toutes les ressources gérées dans le state. Point de départ pour auditer l'infra ou trouver le nom exact d'une ressource.
-->

<!-- snippet
id: terraform_state_show
type: command
tech: terraform
level: intermediate
importance: medium
format: knowledge
tags: terraform,state,show,debug
title: Détailler une ressource dans le state Terraform
command: terraform state show <RESSOURCE>
example: terraform state show aws_instance.web
description: Affiche tous les attributs d'une ressource précise (IP, AMI, tags…). Utile pour trouver l'attribut exact à référencer dans un output.
-->

<!-- snippet
id: terraform_validate_fmt
type: command
tech: terraform
level: beginner
importance: medium
format: knowledge
tags: terraform,validate,fmt,qualité,ci
title: Valider et formater le code Terraform avant un commit
context: intégrer Terraform dans un pipeline CI/CD ou garantir la qualité du code
command: terraform validate && terraform fmt
description: validate vérifie la syntaxe et la logique. fmt reformate selon les conventions officielles. À exécuter avant tout commit ou apply.
-->

---
[Module suivant →](M34_terraform-avancé.md)
---
