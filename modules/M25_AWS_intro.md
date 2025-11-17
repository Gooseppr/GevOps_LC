---
titre: AWS - Introduction
type: module
jour: 25
ordre: 1
tags: aws, cloud, devops
---

# 🟦 **Cours AWS – Français avec vocabulaire anglais**


# 🟦 1. Introduction au Cloud (Cloud Computing)

### 📘 Définition

L’informatique en nuage (Cloud Computing) = **mise à disposition à la demande** (*on-demand delivery*) de ressources informatiques via Internet, **payées à l’usage** (*pay-as-you-go*).

---

# 🟦 2. Modèles de déploiement (Deployment Models)

Voici les trois modèles fondamentaux :

| Modèle | Définition FR | Terme EN |
| --- | --- | --- |
| **On-premises** | Infrastructures hébergées physiquement dans l’entreprise. | On-premises / On-prem / Local Data Center |
| **Cloud** | Ressources hébergées par un fournisseur cloud. | Cloud |
| **Hybrid** | Combinaison On-premises + Cloud, souvent en transition. | Hybrid Cloud |

### 🔍 En détails

### 🔵 **On-premises**

- Tu es responsable de **tout** : serveurs, réseau, sécurité, refroidissement.
- Avantages : contrôle complet, sécurité physique maîtrisée.
- Désavantages : coûts élevés, faible scalabilité, maintenance.

### 🔵 **Cloud**

- Fourni par un **Cloud Provider** (AWS, Azure, GCP).
- Tu loues des ressources (compute, storage, databases…).
- Avantages : scalabilité, paiement à l’usage, haute disponibilité, réduction de maintenance.

### 🔵 **Hybrid**

- Permet une migration progressive.
- Exemples :
    - Applications critiques on-prem
    - Données / microservices dans le cloud

---

# 🟦 3. On-Premises vs Cloud : comparatif

| Critère | On-premises | Cloud |
| --- | --- | --- |
| Paiement | Investissement initial (CAPEX) | Paiement à l’usage (OPEX) |
| Scalabilité | Limitée | Illimitée |
| Maintenance | Équipe interne | Fournisseur Cloud |
| Temps de déploiement | Long | Quelques secondes |
| Sécurité | Physique + logique interne | Infra sécurisée par le provider |
| Disponibilité | Dépend des locaux | Multi-région, multi-AZ |

---

# 🟦 4. L’infrastructure globale AWS (AWS Global Infrastructure)

AWS possède une des infrastructures les plus grandes au monde.

### 📘 Composants clés

| Élément | Définition FR | Terme EN |
| --- | --- | --- |
| **Region** | Ensemble géographique regroupant plusieurs AZ. | AWS Region |
| **Availability Zone (AZ)** | Un ou plusieurs data centers isolés. | Availability Zone |
| **Edge Location** | Point de présence utilisé pour le CDN et les services de cache (CloudFront). | Edge Location |

---

## 🟩 Schéma de l’infrastructure AWS (simplifié)

```
Region (ex: eu-west-3)
│
├── AZ A (Data Center 1)
├── AZ B (Data Center 2)
└── AZ C (Data Center 3)
│
└── Edge Locations (CloudFront)

```

---

# 🟦 5. Regions AWS (AWS Regions)

### 📌 Pourquoi choisir une Region ?

| Critère FR | Terme EN |
| --- | --- |
| Conformité réglementaire | Compliance |
| Latence | Latency |
| Prix | Pricing |
| Disponibilité des services | Service Availability |

💡 Exemple :

Pour un utilisateur Français → **Région Dublin (eu-west-1)** est souvent la plus proche si Paris n’est pas disponible selon les services.

---

# 🟦 6. Availability Zones (AZ)

Une AZ est composée d’un ou plusieurs data centers isolés en :

- alimentation électrique
- réseau
- refroidissement

➡️ Objectif : assurer la **haute disponibilité**.

💡 Exemple :

Si ton application tourne en **AZ A** et que AZ A tombe :

AWS peut la relancer automatiquement sur **AZ B**.

---

# 🟦 7. Méthodes pour interagir avec AWS

| Méthode | Description FR | Terme EN |
| --- | --- | --- |
| **AWS Management Console** | Interface graphique dans le navigateur. | Web Console |
| **AWS CLI** | Outil en ligne de commande. | AWS Command Line Interface |
| **AWS SDK** | Bibliothèques pour coder avec AWS dans Python, JS, Go… | AWS Software Development Kit |

---

## 🔵 AWS Management Console

Chaise de débutant → très visuel.

## 🔵 AWS CLI

Exemple :

```
aws s3 ls
aws ec2 describe-instances

```

## 🔵 AWS SDK

Exemple Python :

```python
import boto3
s3 = boto3.client("s3")
s3.list_buckets()

```

---

# 🟦 8. Modèle de responsabilité partagée (Shared Responsibility Model)

C’est **ESSENTIEL** en entretien ou certification.

---

## 🟥 Sécurité **DU cloud** (Security **OF** the Cloud) — AWS

AWS gère :

| Élément | Terme EN |
| --- | --- |
| Matériel physique | Hardware |
| Data centers | Data Centers |
| Réseau global | Global Network |
| Hyperviseur | Hypervisor |
| Infrastructure | Infrastructure |
| Régions / AZ | Regions / Availability Zones |

➡️ AWS sécurise **l’infrastructure physique + globale**.

---

## 🟦 Sécurité **DANS le cloud** (Security **IN** the Cloud) — Client

Le client gère :

| Élément | Terme EN |
| --- | --- |
| Données | Customer Data |
| OS | Operating System |
| Applications | Applications |
| Identités et accès | IAM Access Management |
| Mise à jour | Patch Management |
| Config réseau | Network & Firewall Configuration |
| Encryption | Client-side / Server-side encryption |

➡️ Le client sécurise **ce qu'il déploie**.

---

# 🟦 9. Sécurisation du compte root (Root User Security)

### Pourquoi ?

Le compte root = **droits illimités**, accès total.

### Bonnes pratiques :

| Action FR | Terme EN |
| --- | --- |
| Ne jamais utiliser root au quotidien | Do not use root for daily tasks |
| Créer un utilisateur IAM admin | Create admin IAM user |
| Activer MFA sur root | Enable MFA on root account |
| Ne jamais partager les identifiants root | Never share root credentials |
| Supprimer les clés root | Delete root access keys |

---

# 🟦 10. Identity and Access Management (IAM)

IAM = service pour **gérer qui a accès à quoi** (*who can do what*).

Concepts principaux :

| Élément | Définition FR | Terme EN |
| --- | --- | --- |
| **IAM User** | Un utilisateur (humain ou service). | IAM User |
| **IAM Group** | Ensemble d’utilisateurs partageant des permissions. | IAM Group |
| **IAM Policy** | Document JSON définissant des permissions. | IAM Policy |
| **IAM Role** | Identité “sans mot de passe”, assumée temporairement. | IAM Role |

---

# 🟦 11. IAM Users (Utilisateurs IAM)

Représentent **des personnes ou services**.

Peuvent avoir :

- un mot de passe
- des clés d’accès (Access Keys)
- des permissions via **IAM Policies**

---

# 🟦 12. IAM Groups (Groupes IAM)

Un groupe = **ensemble de Users** partageant les mêmes permissions.

Exemples :

| Groupe | Permissions |
| --- | --- |
| Developers | accès S3 + Lambda |
| Ops | EC2 + CloudWatch |
| Finance | accès aux factures AWS |

---

# 🟦 13. IAM Policies (Politiques IAM)

Fichier JSON :

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "*"
    }
  ]
}

```

Champs importants :

| Champ | Description |
| --- | --- |
| Version | version du langage IAM |
| Effect | Allow / Deny |
| Action | ce que l'on peut faire |
| Resource | sur quelles ressources |

---

# 🟦 14. IAM Roles (Rôles IAM)

Un rôle est une identité **assumée temporairement** par :

- un utilisateur IAM
- un service AWS (ex : EC2 → accès S3)
- un service externe (ex : GitHub Actions → déployer sur AWS)

Contrairement aux Users :

| IAM User | IAM Role |
| --- | --- |
| a un mot de passe ou access-key | pas d'identifiants permanents |
| lié à une personne | lié à une fonctionnalité |
| permissions persistantes | sessions temporaires (STS) |

---

# 🟦 15. Résumé général (FR + EN)

## 🟦 Résumé bilingue

| Sujet | Résumé FR | Résumé EN |
| --- | --- | --- |
| Cloud | Fourniture à la demande. | On-demand computing. |
| Region | Zone géographique AWS. | AWS Region. |
| AZ | Data center isolé. | Availability Zone. |
| Shared Model | AWS gère l’infrastructure, client gère la config. | Shared Responsibility. |
| IAM | Gestion des identités et accès. | Identity and Access Management. |
| Root User | Accès illimité → sécuriser absolument. | Full-access root. |

---
[Module suivant →](M25_AWS_Compute.md)
---

---
[Module suivant →](M25_AWS_Compute.md)
---
