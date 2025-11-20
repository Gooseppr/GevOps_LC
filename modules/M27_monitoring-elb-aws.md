---
title: AWS Monitoring, Load Balancing & Scaling
type: module
jour: 27
ordre: 2
tags: aws, monitoring, load balancing, scaling, cloud, devops
---

# 🧠 AWS Monitoring, Load Balancing & Scaling

## 1. Introduction générale

Dans le cloud, **surveiller**, **équilibrer la charge** et **ajuster automatiquement la capacité** sont les trois piliers pour garantir la **disponibilité** et les **performances** de vos applications.

Ces trois notions forment le **cœur du modèle d’exploitation DevOps sur AWS** :

| Pilier | Outil principal AWS | Objectif |
| --- | --- | --- |
| **Monitoring** | **Amazon CloudWatch** | Observer et réagir aux métriques et logs |
| **Load Balancing** | **Elastic Load Balancer (ELB)** | Répartir intelligemment le trafic |
| **Auto Scaling** | **EC2 Auto Scaling** | Adapter la capacité aux besoins réels |

💬 **Objectif global :** maintenir une disponibilité élevée tout en optimisant les coûts, selon la fameuse règle des *“neufs”* de disponibilité (cf. image : 99.9%, 99.99%, etc.).

---

## 2. Monitoring — Amazon CloudWatch

### 2.1 Concept

**Amazon CloudWatch** est un service d’**observabilité unifiée**.

Il collecte, analyse et agit sur les données de vos ressources AWS (EC2, RDS, Lambda, etc.) et de vos applications personnalisées.

### 🔄 Cycle de fonctionnement

```
Collect → Monitor → Act → Analyze

```

| Étape | Description |
| --- | --- |
| **Collect** | Récupère les métriques (CPU, RAM, latence, erreurs HTTP, etc.) |
| **Monitor** | Visualise les tendances et détecte les anomalies |
| **Act** | Déclenche des alarmes ou actions automatiques (Auto Scaling, alertes e-mail/SMS, Lambda) |
| **Analyze** | Fournit des tableaux de bord et rapports pour optimisation |

---

### 2.2 Types de données collectées

| Type de donnée | Source | Exemple |
| --- | --- | --- |
| **Métriques** | EC2, RDS, S3, EBS… | CPUUtilization, DiskReadOps, NetworkIn |
| **Logs** | Applications, Lambda, CloudTrail | `/var/log/syslog`, `application.log` |
| **Événements** | AWS Services | Création d’instance, changement d’état |
| **Traces** | AWS X-Ray | Suivi des requêtes dans une application distribuée |

---

### 2.3 Métriques personnalisées

Tu peux publier tes **propres métriques** :

- depuis un script Python, Bash ou une appli métier,
- depuis des outils externes comme **Grafana**.

📘 Exemple (CLI) :

```bash
aws cloudwatch put-metric-data \
  --namespace "Application/Custom" \
  --metric-name "TransactionsParMinute" \
  --value 285

```

---

### 2.4 Tableaux de bord CloudWatch

Les **dashboards CloudWatch** permettent d’afficher en temps réel :

- l’état des serveurs EC2,
- le taux d’utilisation CPU,
- la latence réseau,
- ou le nombre de requêtes HTTP.

Ces tableaux peuvent être partagés à des équipes techniques ou métiers.

Ils aident à **anticiper les besoins de scaling** et à **réduire les coûts**.

🖼️ Exemple :

Un pic CPU de 90 % pendant 3 heures = signal pour déclencher **Auto Scaling**.

---

### 2.5 Logs et supervision applicative

**CloudWatch Logs** centralise et archive :

- les logs système (EC2),
- les logs applicatifs (Node.js, Python, etc.),
- les logs Lambda,
- et les logs de sécurité.

Tu peux :

- Rechercher un mot clé (`ERROR`, `Timeout`),
- Créer une **alerte** sur un pattern précis,
- Conserver les logs 7 jours, 30 jours ou illimité selon les besoins.

📘 Exemple :

> “Déclenche une alarme si le log contient 5 erreurs HTTP 500 en moins d’une minute.”
> 

---

### 2.6 Alarmes et alertes

**CloudWatch Alarms** te permettent de définir des seuils :

- “CPU > 85 % pendant 5 minutes”
- “Mémoire < 500 Mo”

Quand la condition est vraie :

- une **notification SNS** est envoyée (email/SMS),
- ou une **action automatique** est exécutée (lancement Auto Scaling, arrêt instance, exécution Lambda).

📘 Exemple :

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name "CPUHigh" \
  --metric-name "CPUUtilization" \
  --namespace "AWS/EC2" \
  --statistic Average \
  --period 60 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 3 \
  --alarm-actions arn:aws:sns:eu-west-3:123456789012:alertes-système

```

---

## 3. Optimisation & Disponibilité

### 3.1 Définition

La **disponibilité** correspond à la **proportion de temps** où un système reste accessible et opérationnel.

| Disponibilité (%) | Downtime/an |  |
| --- | --- | --- |
| 90% | 36,5 jours | 🌧️ Service souvent indisponible |
| 99% | 3,65 jours | Acceptable pour tests internes |
| 99.9% | 8,7 h | Standard professionnel |
| 99.99% | 52 min | Haute dispo |
| 99.999% | 5 min | Niveau bancaire, médical, militaire |

🎯 **Objectif DevOps AWS :** viser au moins **99.9%** de disponibilité (3 neuf).

---

### 3.2 Améliorer la disponibilité avec AWS

### 🔸 Les Zones de Disponibilité (AZ)

- Une **région AWS** est composée de plusieurs **zones de disponibilité**.
- Chaque AZ = data center isolé, connecté aux autres via fibre optique à faible latence.
- Héberger des ressources dans plusieurs AZ = **protection contre les pannes physiques**.

### 🔸 Multi-Région

- Réplique les données et services sur plusieurs régions AWS.
- Idéal pour les **applications critiques mondiales**.
- Plus cher, mais garantit **résilience géographique**.

---

## 4. Load Balancing — Répartition de charge

### 4.1 Définition

Un **Load Balancer (équilibreur de charge)** est un composant réseau qui répartit les requêtes entrantes entre plusieurs serveurs (EC2).

Il empêche qu’un seul serveur soit surchargé.

📘 Exemple de flux :

```
Navigateur client → Elastic Load Balancer → Instance EC2 #1
                                         ↳ Instance EC2 #2

```

---

### 4.2 Fonctionnement général

Avant de rediriger une requête, l’ELB effectue un **bilan de santé** (Health Check) :

- si une instance ne répond pas → elle est retirée du pool,
- les requêtes suivantes sont envoyées vers les autres serveurs.

🎯 Objectif : **répartir la charge + garantir la disponibilité.**

---

### 4.3 Les composants ELB

| Élément | Rôle | Exemple |
| --- | --- | --- |
| **Listener** | Définit le protocole et le port d’écoute | `HTTP:80`, `HTTPS:443` |
| **Règles (Rules)** | Indiquent comment router le trafic selon l’URL, le header, le chemin | `/api/*` → cible backend API |
| **Target Groups** | Liste d’instances (ou Lambdas) recevant le trafic | Groupe EC2 “Web-App” |

💡 Le Load Balancer reçoit tout le trafic → applique les **listeners** et **règles** → envoie la requête vers le bon **target group**.

---

### 4.4 Les 3 types principaux d’ELB

| Type | Couche OSI | Description | Exemple d’usage |
| --- | --- | --- | --- |
| **Application Load Balancer (ALB)** | Couche 7 (HTTP/HTTPS) | Oriente selon contenu (URL, cookie, header) | Microservices, API |
| **Network Load Balancer (NLB)** | Couche 4 (TCP/UDP) | Très rapide, faible latence | Jeux en ligne, VoIP |
| **Gateway Load Balancer (GLB)** | Couche 3 (réseau) | Dirige le trafic vers des appliances (pare-feu, proxy) | Sécurité réseau, inspection |

🧠 **Couche 7 (ALB)** = logique applicative

**Couche 4 (NLB)** = logique réseau

**Couche 3 (GLB)** = logique routage/filtrage IP

---

## 5. Auto Scaling — Ajustement automatique

### 5.1 Principe général

**EC2 Auto Scaling** ajuste automatiquement le **nombre d’instances** en fonction de la charge.

| Type de scaling | Description |
| --- | --- |
| **Vertical scaling** | On augmente la taille de l’instance (ex. t3.micro → t3.large) |
| **Horizontal scaling** | On ajoute ou retire des instances (plusieurs serveurs identiques) |

💡 En production, c’est le **scaling horizontal** qui est utilisé car il permet de répartir la charge sans interruption.

---

### 5.2 Fonctionnement

1. Tu définis un **Auto Scaling Group (ASG)** :
    - Taille minimale, maximale et souhaitée.
2. Tu définis des **politiques de scaling** :
    - “ajoute une instance si CPU > 80% pendant 5 min”
    - “retire une instance si CPU < 30% pendant 10 min”
3. L’ASG surveille les métriques CloudWatch pour agir.

---

### 5.3 ELB + Auto Scaling : synergie parfaite

Quand une instance est :

- **ajoutée**, l’ELB l’intègre automatiquement au **target group**,
- **supprimée**, l’ELB la retire après la période de “drainage” (requests en cours terminées).

Ainsi, le trafic reste **fluide et sans interruption**.

---

### 5.4 Politiques de scaling

| Type | Description | Exemple |
| --- | --- | --- |
| **Manuel** | Changer soi-même la taille du groupe | “Je passe de 2 à 4 instances” |
| **Dynamique** | Basé sur métriques CloudWatch | “CPU > 80% → +1 instance” |
| **Prévisionnel (Predictive)** | Utilise IA/ML pour anticiper la charge | “Ajoute des instances avant le pic de midi” |

---

## 6. Conclusion : Monitoring, Load Balancing & Scaling = Disponibilité

| Pilier | Outil AWS | Impact direct sur la disponibilité |
| --- | --- | --- |
| **Monitoring** | CloudWatch | Détection rapide des anomalies |
| **Load Balancing** | ELB | Répartition intelligente des requêtes |
| **Auto Scaling** | EC2 Auto Scaling | Évite la saturation et l’indisponibilité |
| **AZ / Multi-Region** | Architecture AWS | Tolérance aux pannes |
| **Alarmes & Logs** | CloudWatch + SNS | Réaction proactive avant incident |

🔁 Ces trois services fonctionnent **en boucle** :

1. **CloudWatch** surveille et détecte,
2. **Auto Scaling** ajuste,
3. **ELB** répartit le trafic,
4. Et le tout garantit une **disponibilité proche de 99.99 %**.

---
[← Module précédent](M27_bdd_aws.md) | [Module suivant →](M27_quiz-reponse.md)
---
