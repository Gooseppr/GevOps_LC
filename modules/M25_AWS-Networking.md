---
title: AWS - Introduction
sujet: Déploiement Continu (CD)
type: module
jour: 25
ordre: 1
tags: aws, cloud, devops
---

# 🟦 **AWS Networking – Masterclass complète (FR + EN)**

*Version longue, détaillée, pédagogique avec schémas et explications approfondies*

---

# 🔵 1. Vue d’ensemble – Comprendre AWS VPC (Virtual Private Cloud)

## 📘 Définition (FR / EN)

**FR :**

Un *VPC (Virtual Private Cloud)* est une section **isolée et entièrement personnalisable** du cloud AWS.

Dans ce VPC, tu construis ton propre réseau virtuel : adresses IP, sous-réseaux, routage, sécurité, passerelles, etc.

**EN :**

A VPC is an *isolated and customizable virtual network* within the AWS Cloud where you launch AWS resources.

---

## 🧠 Ce que **TU** contrôles dans un VPC

| Élément | Description FR | EN |
| --- | --- | --- |
| Range IP | Le CIDR de ton réseau | CIDR range |
| Sous-réseaux | Publics et privés | Subnets |
| Routage | Tables de route | Route tables |
| Passerelles | IGW, NAT, VPN, DX | Gateways |
| Sécurité | ACLs, SGs | Network ACLs, Security Groups |
| DNS interne | Optionnel | Internal DNS |
| DHCP options | Personnalisation DNS | DHCP options set |

➡️ Un VPC = ton **data center virtuel** dans AWS.

---

## 🌎 Schéma explicatif (très détaillé)

```
                      INTERNET
                          │
                          ▼
                  ┌────────────────┐
                  │  Internet GW   │ (IGW)
                  └───────┬────────┘
                          │
     ┌─────────────────────────────────────────────┐
     │        AWS Region (ex: eu-west-3)           │
     │                                             │
     │   ┌────────────── VPC (10.0.0.0/16) ─────────────┐
     │   │                                               │
     │   │   AZ A                     AZ B               │
     │   │   ┌──────────────┐        ┌──────────────┐    │
     │   │   │ Public Subnet│        │ Public Subnet│    │
     │   │   │ 10.0.1.0/24  │        │ 10.0.3.0/24  │    │
     │   │   └──────────────┘        └──────────────┘    │
     │   │         │                     │              │
     │   │   ┌──────────────┐        ┌──────────────┐    │
     │   │   │Private Subnet│        │Private Subnet│    │
     │   │   │10.0.2.0/24   │        │10.0.4.0/24   │    │
     │   │   └──────────────┘        └──────────────┘    │
     │   └───────────────────────────────────────────────┘
     │
     └────────────────────────────────────────────────────┘

```

---

# 🔵 2. Le VPC par défaut : comprendre exactement ce qu'il contient

## 📦 **Que contient un VPC par défaut ?**

AWS crée automatiquement :

- **1 VPC**
- **1 subnet public par AZ**
- **1 Internet Gateway**
- **1 main route table**
- **1 security group par défaut**
- **1 NACL par défaut**

## Attributs du SG par défaut

| Sens | Règle | Description |
| --- | --- | --- |
| Inbound | Allow nothing | Rien n’entre |
| Outbound | Allow all | Tout peut sortir |

## Objectif

➡️ Permet de lancer une instance EC2 **immédiatement** sans configuration réseau.

**EN** : Default VPCs simplify the onboarding of new AWS users.

---

# 🔵 3. Adresses IP – Explications techniques

## 📘 Rappel : IPv4

Une adresse IPv4 est composée de **32 bits** → 4 octets.

Exemple : `10.0.0.123`

### 🎯 Analogie

- Adresse postale : 8 rue Alpha
- Adresse IP : 10.0.0.123

Le **réseau** = la rue

La **machine** = la maison

---

# 🔵 4. CIDR (Classless Inter-Domain Routing)

## 📘 FR : Le CIDR définit une plage d’adresses utilisant une notation `<IP>/<masque>`

## 📘 EN : CIDR notation defines IP ranges via `<IP>/<prefix length>`

### Exemples

| CIDR | Nombre total d’IP | Utilisation typique |
| --- | --- | --- |
| /16 | 65 536 | VPC |
| /20 | 4 096 | grands subnets privés |
| /24 | 256 | subnets publics |

---

## 📐 Schéma du découpage CIDR

```
10.0.0.0/16 (VPC)
 ├── 10.0.1.0/24 (Subnet Public A)
 ├── 10.0.2.0/24 (Subnet Privé A)
 ├── 10.0.3.0/24 (Subnet Public B)
 └── 10.0.4.0/24 (Subnet Privé B)

```

---

# 🔵 5. VPC personnalisé – Explication massive comme demandé

Un VPC personnalisé est **ESSENTIEL** pour toute architecture sérieuse.

## 📘 Ce que tu dois définir :

| Élément | Exemple | Impact |
| --- | --- | --- |
| **CIDR principal** | 10.0.0.0/16 | Capacité totale d'IP |
| **Subnets** | /24, /20... | Segmentation réseau |
| **AZs utilisées** | eu-west-3a/b/c | Haute disponibilité |
| **Passerelles** | IGW, NAT, VPN | Accès Internet / On-prem |
| **Route tables** | RT-public, RT-private | Contrôle du trafic |
| **Sécurité** | SG, ACL | Niveau d’isolation |

## Avantages du VPC personnalisé

- Isolation complète
- Sécurité avancée
- Architecture multi-AZ
- Contrôle du trafic
- Possibilité d'hybride On-prem ↔ AWS
- Optimisation des coûts

**EN** : A custom VPC gives full control over networking, security and IP addressing.

---

# 🔵 6. Sous-réseaux : explications détaillées

Après la création du VPC, tu dois créer plusieurs **subnets**.

## Types de subnets

| Type | Description FR | EN |
| --- | --- | --- |
| **Public Subnet** 🌐 | Accessible depuis Internet via IGW | Public subnet |
| **Private Subnet** 🔐 | Pas d’accès direct Internet | Private subnet |
| **Isolated Subnet** | Aucune sortie | Isolated subnet |

### Règle fondamentale

➡️ **Un subnet ne peut être que dans 1 AZ.**

➡️ **Jamais 2 AZ dans le même subnet.**

---

### Pourquoi plusieurs subnets ?

- séparation des couches (web / app / db)
- sécurité
- haute disponibilité
- réseaux hybrides (VPN, Direct Connect)

---

# 🔵 7. Adresses IP réservées – explication complète

Dans chaque subnet, AWS réserve **5 adresses obligatoires**.

Exemple pour un /24 :

| IP | Usage FR | Usage EN |
| --- | --- | --- |
| `.0` | Adresse du réseau | Network address |
| `.1` | Routeur interne AWS | VPC router |
| `.2` | DNS AWS | AmazonProvidedDNS |
| `.3` | Réservée pour futur usage | Reserved |
| `.255` | Diffusion | Broadcast |

---

# 🔵 8. Gateways – Explication très détaillée

Les gateways permettent à ton VPC de communiquer :

- vers Internet
- vers d’autres VPC
- vers ton data center
- vers des services AWS privés

---

## Les 5 gateways importantes

### 1️⃣ **Internet Gateway (IGW)** – 🌐 Public access

- Permet aux subnets publics d’avoir accès Internet
- Nécessaire pour associer une **Elastic IP** à une EC2

---

### 2️⃣ **NAT Gateway** – 🔄 Private → Internet

Les instances privées font des requêtes Internet, MAIS :

- sans être accessibles depuis Internet
- IP publique masquée par la NAT

⚠️ **Uniquement trafic sortant**.

---

### 3️⃣ **VPC Peering** – 🔗 Relier deux VPC

- Communication privée
- Pas de transitive peering
- Idéal pour relier plusieurs environnements internes
    
    EX : VPC Prod ↔ VPC Dev
    

---

### 4️⃣ **VPN Gateway (VGW)** – 🔐 Tunnel vers On-prem

- Utilise IPsec
- Trafic chiffré
- Pour étendre ton réseau d’entreprise dans AWS

---

### 5️⃣ **Transit Gateway (TGW)** – 🛣️ Hub central

- Connecte plusieurs VPC entre eux
- Connecte aussi On-prem ↔ AWS
- Remplace les peering en étoile

---

# 🔵 9. AWS Direct Connect – explication enrichie

## 📘 FR

Direct Connect = une **liaison fibre dédiée et privée** entre ton data center et AWS.

## 📘 EN

Direct Connect is a *dedicated private link* to AWS.

## Avantages

| Avantage | Description |
| --- | --- |
| Sécurité | Pas d’Internet public |
| Latence | Très faible |
| Bande passante | Plus grande que VPN |
| Fiabilité | Connexion dédiée |

Très utilisé par :

— banques

— entreprises avec gros transferts

— data centers

---

# 🔵 10. Routage – explication avancée

Chaque subnet doit être associé à une **route table**.

## Fonction d’une route table

- Dire où va un paquet selon sa destination
- Ex : 0.0.0.0/0 → Internet Gateway
- Ex : 10.0.0.0/16 → local

---

## Exemple complet des 3 route tables d'un VPC pro

1. **Public Route Table**

| Destination | Target |
| --- | --- |
| 10.0.0.0/16 | local |
| 0.0.0.0/0 | igw-123 |
1. **Private Route Table**

| Destination | Target |
| --- | --- |
| 10.0.0.0/16 | local |
| 0.0.0.0/0 | nat-123 |
1. **Isolated Route Table**

| Destination | Target |
| --- | --- |
| 10.0.0.0/16 | local |

➡️ Aucun accès Internet.

---

# 🔵 11. Network ACL – explication très approfondie

Une **ACL** est un pare-feu **stateless** appliqué au subnet.

| Caractéristique | NACL |
| --- | --- |
| Niveau | Subnet |
| Stateful ? | ❌ Non |
| Règles | Ordonnées, numérotées |
| Sens | Inbound + Outbound |
| Refuse par défaut | ❗ Oui |

### Fonctionnement (IMPORTANT)

Si une règle inbound **autorise** le trafic, le retour devra être autorisé dans les règles outbound.

Sinon → DROP.

Exemple :

- inbound 443 → allow
- outbound ephemeral ports → allow

---

# 🔵 12. Security Groups – explications avancées

Un **Security Group (SG)** est un pare-feu **stateful** appliqué à une instance ou un service.

| Caractéristique | SG |
| --- | --- |
| Niveau | Instance |
| Stateful ? | ✅ Oui |
| Règles | Seulement inbound (outbound souvent “allow all”) |
| Refuse par défaut | Oui |

### Différence SG vs ACL

| Critère | SG | ACL |
| --- | --- | --- |
| Stateful | Oui | Non |
| Niveau | Instance | Subnet |
| Règles | Inbound + outbound | Inbound + outbound |
| Cas d’usage | Micro-sécurité | Filtrage global |

➡️ Résumé oral :

> “Security Groups are stateful, instance-level firewalls. Network ACLs are stateless, subnet-level firewalls.”
>

---
[Module suivant →](M25_AWS_intro.md)
---
