---
titre: Azure Virtual Machine
type: module
jour: 25
ordre: 6
tags: microsoft, azure, cloud, devops
---

# 🧩 **Cours complet : Azure Virtual Machines (Azure VM)**

*Niveau : Fondamentaux + Intermédiaire — Approche DevOps / Cloud Engineer*

---

# 1️⃣ Introduction & Contexte

Azure Virtual Machines (Azure VM) est le service **IaaS** de Microsoft Azure.

Il permet de créer et gérer des **machines virtuelles dans le cloud**, utilisées pour :

- héberger des applications web,
- exécuter des API,
- faire tourner des bases de données,
- héberger des pipelines CI/CD,
- monter des environnements complexes multi-VM,
- exécuter des workloads GPU / IA / Big Data.

👉 C’est l’équivalent **Azure EC2 (AWS)** ou **Azure GCE (Google)**.

---

# 2️⃣ Crédit Gratuit Azure

Microsoft propose :

🎁 **200$ de crédit pendant 30 jours** pour tester l'écosystème.

⚠️ Contrairement à GCP ou AWS, Azure **nécessite parfois un compte “pro” ou un compte correctement vérifié** pour accéder à l’intégralité du portail.

---

# 3️⃣ Fonctionnement Général d’Azure VM

Azure VM repose sur plusieurs briques fondamentales :

| Élément | Rôle |
| --- | --- |
| **VM** | La machine virtuelle |
| **Image** | Le système d’exploitation + configuration préinstallée |
| **Taille (SKU)** | CPU/RAM/Iops du disque |
| **Disques** | OS Disk + Data Disks |
| **VNet / Subnet** | Réseau virtuel |
| **NSG** | Groupes de sécurité (firewall) |
| **Public IP** | Adresse IP pour exposer la VM |
| **NIC** | Carte réseau virtuelle |
| **Identity** | Service principal / Managed Identity |
| **Availability Sets / Zones** | Haute disponibilité |

Azure est très modulaire : **une VM est l’assemblage de plusieurs ressources autonomes**.

---

# 4️⃣ Images Azure

Les images Azure sont l'équivalent des AMI AWS ou des images GCE.

Azure propose :

- Ubuntu 22.04 / 20.04
- Debian
- CentOS / Rocky Linux
- Red Hat Enterprise Linux
- Windows Server
- Windows 10 / 11 pour tests
- Marketplace :
    - Jenkins
    - GitLab
    - SQL Server
    - Docker Engine
    - NGINX
    - Kubernetes AKS BAREMETAL (préconfiguré)

## ⚠️ Coût supplémentaire des images Windows

La licence Windows Server n’est **pas gratuite**, ce qui ajoute :

- un coût de licence,
- un coût CPU légèrement majoré.

---

# 5️⃣ Tailles d’instances : Familles Azure VM

Azure utilise des **familles de tailles (VM Sizes)** adaptées à différents usages :

## 🔹 A-Series : Basique

- Environnements simples
- Serveurs de dev/test
- Prix faible

## 🔹 B-Series : Burstable (économie)

- CPU boost “crédité”
- Idéal pour serveurs web variables
- Très économique

## 🔹 D-Series : Usage général (standard)

- Le bon compromis
- API, microservices, workloads normaux

## 🔹 E-Series : Optimisées mémoire

- Bases de données
- Cache, services mémoire intensifs (Redis, In-Memory DB)

## 🔹 F-Series : Optimisées CPU

- CI/CD
- Calcul intensif
- Encodage vidéo

## 🔹 L-Series : Optimisées disque

- Très haute IOPS
- SQL, NoSQL, Cassandra

## 🔹 NC/ND/NP : GPU

- Machine Learning
- IA / Deep Learning
- Modèles LLM

---

# 6️⃣ Réseau dans Azure

Azure utilise le concept de **Virtual Network (VNet)**.

C'est l’équivalent :

- VPC chez AWS
- VPC chez Google Cloud

## Le réseau Azure comprend :

- Un **VNet** (réseau global au projet)
- Des **Subnets** (sous-réseaux)
- Des **Network Interface Cards (NIC)** attachées aux VM
- Des **Network Security Groups (NSG)** → firewall

### 🔥 NSG (Network Security Group)

Même rôle que les Security Groups AWS :

- filtrage des ports (L3/L4),
- règles INGRESS / EGRESS,
- appliqué aux NIC ou au Subnet.

---

# 7️⃣ Step-by-Step : Création d’une VM Azure

## 🧭 Étape 1 : Nom + Région

On choisit :

- le nom de la VM,
- la région (France Central, West Europe, East US…),
- le groupe de ressources (Resource Group).

> Un Resource Group = un “dossier logique” regroupant toutes les ressources.
> 

---

## 🖼️ Étape 2 : Choix de l’image et de la taille

- Ubuntu 22.04 (recommandé en DevOps)
- Debian (plus stable)
- Windows Server (licence payante)

Puis :

- B2s (économique)
- D2s_v3 (équilibrée)
- F4s_v2 (CPU)
- E4s_v3 (RAM)

---

## 🧑‍💻 Étape 3 : Compte utilisateur & Clé SSH

Tu peux :

- générer une nouvelle clé SSH
- importer une clé existante
- utiliser Azure AD login (IAM avancé)

Exemple clé SSH via Bash :

```bash
ssh-keygen -t rsa -b 4096 -f azurevm

```

---

## 🔥 Étape 4 : Ouverture des ports

À ce stade on peut ouvrir :

- SSH (22)
- HTTP (80)
- HTTPS (443)

Azure ajoute automatiquement un **NSG** à la VNet.

---

## 💾 Étape 5 : Stockage

Azure crée :

- 1 disque OS (SSD ou HDD)
- 1 disque temporaire NVMe (non persistant)

Option : ajouter un **data disk**.

---

## 🛰️ Étape 6 : Configuration Réseau (VNet + Subnet)

Tu définis :

- Le VNet (réseau virtuel)
- Le Subnet
- L’association au NSG
- L’IP publique (statique ou dynamique)

---

## ✨ Finalisation

Après déploiement de quelques secondes → VM opérationnelle.

---

# 8️⃣ Connexion à une VM Azure

Via SSH :

```bash
ssh -i my-first-vm_key.pem azureuser@<IP>

```

Si Azure AD login est activé :

```bash
az ssh vm -n my-vm -g my-resource-group

```

---

# 9️⃣ Azure CLI : Commandes Essentielles

## 🔐 Connexion

```bash
az login

```

## 🆕 Créer une VM

```bash
az vm create \
  --resource-group myRG \
  --name devVM \
  --image Ubuntu2204 \
  --size Standard_B2s \
  --admin-username azureuser \
  --ssh-key-values ~/.ssh/id_rsa.pub

```

## 🔥 Ouvrir un port

```bash
az vm open-port \
  --port 80 \
  --resource-group myRG \
  --name devVM

```

## 🗑️ Supprimer la VM

```bash
az vm delete -g myRG -n devVM --yes

```

## 💾 Ajouter un disque data

```bash
az vm disk attach \
  --resource-group myRG \
  --vm-name devVM \
  --name datadisk1 \
  --size-gb 128

```

---

# 1️⃣0️⃣ Sécurité : Bonnes pratiques DevOps

## 🔒 1. Toujours créer un NSG dédié

Ne jamais utiliser "NSG par défaut".

## 🔑 2. Forcer l’usage de SSH → Pas de mot de passe

## 🔏 3. Désactiver l’IP publique si possible

Utiliser :

- Bastion Host Azure
- Azure VPN Gateway
- Private Endpoint

## 🎭 4. Utiliser une Managed Identity (IAM)

Permet à une VM d’accéder à :

- Key Vault
- Storage Account
- Azure SQL
- Services internes Azure

→ Sans mot de passe ni clé API.

## 🎛️ 5. Monitorer la VM

- Azure Monitor
- Log Analytics
- Metrics (CPU, RAM, disque)

---

# 1️⃣1️⃣ Automatisation Terraform (optionnel)

Exemple minimal :

```hcl
resource "azurerm_linux_virtual_machine" "vm" {
  name                = "devvm"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  size                = "Standard_B2s"

  admin_username = "azureuser"

  network_interface_ids = [
    azurerm_network_interface.nic.id
  ]

  admin_ssh_key {
    username   = "azureuser"
    public_key = file("~/.ssh/id_rsa.pub")
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "UbuntuServer"
    sku       = "22_04-lts"
    version   = "latest"
  }
}

```

---

# 🏁 Conclusion

Azure Virtual Machines est un service **IaaS robuste**, souvent utilisé en environnement professionnel car :

- Intégration profonde avec Microsoft 365, Active Directory, Sentinel
- Très modulable
- Très adapté aux environnements hybrides (on-prem ↔ Azure)
- Supporte énormément de familles de VM (CPU, GPU, RAM, stockage)
- Sécurité et IAM très poussés

Pour un DevOps, Azure VM sert à :

- Héberger des serveurs web
- Installer des runners CI/CD
- Construire des environnements de formation
- Tester des déploiements Terraform
- Exécuter des workloads GPU IA

---
[← Module précédent](M25_Google_GCE.md)
---

---
[← Module précédent](M25_Google_GCE.md)
---

---
[← Module précédent](M25_Google_GCE.md)
---

---
[← Module précédent](M25_Google_GCE.md)
---
