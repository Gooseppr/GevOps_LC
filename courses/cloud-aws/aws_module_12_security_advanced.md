---
layout: page
title: "Sécurité avancée AWS — KMS, Secrets Manager, WAF, Shield"

course: cloud-aws
chapter_title: "Services & Architecture"

chapter: 2
section: 4

tags: aws,security,kms,secretsmanager,waf,shield
difficulty: intermediate
duration: 95
mermaid: true

status: published
---

# Sécurité avancée AWS — KMS, Secrets Manager, WAF, Shield

## Objectifs pédagogiques

- Comprendre le chiffrement dans AWS avec KMS
- Gérer les secrets de manière sécurisée
- Protéger une application web avec WAF
- Comprendre les protections DDoS avec Shield
- Concevoir une architecture sécurisée en production

## Contexte et problématique

En production, les risques évoluent :

- Fuite de données sensibles
- Attaques web (SQL injection, XSS)
- Attaques DDoS
- Mauvaise gestion des secrets

Les outils de base ne suffisent plus → sécurité avancée nécessaire.

## Architecture

| Composant | Rôle | Exemple |
|-----------|------|---------|
| KMS | Gestion des clés | chiffrement S3 |
| Secrets Manager | Stockage secrets | DB password |
| WAF | Firewall applicatif | HTTP filtering |
| Shield | Protection DDoS | attaque volumétrique |

```mermaid
graph TD
User --> WAF
WAF --> ALB
ALB --> EC2
EC2 --> Secrets
Secrets --> KMS
Shield --> ALB
```

## Commandes essentielles

```bash
aws kms list-keys
```

```bash
aws secretsmanager list-secrets
```

```bash
aws wafv2 list-web-acls
```

## Fonctionnement interne

### KMS
- Génère et gère les clés
- Chiffrement intégré AWS

### Secrets Manager
- Stockage sécurisé
- Rotation automatique

### WAF
- Filtrage HTTP
- règles custom

### Shield
- Protection DDoS automatique

🧠 Concept clé  
→ Ne jamais stocker de secrets en clair

💡 Astuce  
→ Utiliser Secrets Manager + IAM role

⚠️ Erreur fréquente  
→ Mettre credentials dans code  
Correction : utiliser Secrets Manager

## Cas réel en entreprise

Contexte :

Application exposée Internet.

Solution :

- WAF protège endpoints
- Secrets Manager pour credentials
- KMS pour chiffrement

Résultat :

- Réduction des attaques
- Sécurité renforcée

## Bonnes pratiques

- Utiliser KMS pour chiffrement
- Ne jamais hardcoder secrets
- Activer rotation secrets
- Configurer WAF règles
- Monitorer attaques
- Utiliser Shield
- Restreindre accès IAM

## Résumé

La sécurité avancée AWS repose sur plusieurs couches.  
KMS protège les données, Secrets Manager sécurise les accès.  
WAF et Shield protègent contre les attaques externes.

---

## SNIPPETS DE RÉVISION

<!-- snippet
id: aws_kms_role
type: concept
tech: aws
level: intermediate
importance: high
format: knowledge
tags: aws,kms,encryption
title: KMS rôle
content: KMS gère les clés de chiffrement utilisées pour sécuriser les données AWS
description: Base du chiffrement AWS
-->

<!-- snippet
id: aws_secrets_manager_definition
type: concept
tech: aws
level: intermediate
importance: high
format: knowledge
tags: aws,secrets,security
title: Secrets Manager rôle
content: Secrets Manager stocke les credentials chiffrés par KMS et peut les faire tourner automatiquement (ex. mot de passe RDS renouvelé toutes les 30 jours sans redéploiement). L'application récupère le secret à l'exécution via l'API, jamais au build.
description: La rotation automatique garantit que même un secret volé devient invalide rapidement, sans intervention manuelle.
-->

<!-- snippet
id: aws_waf_definition
type: concept
tech: aws
level: intermediate
importance: high
format: knowledge
tags: aws,waf,security
title: WAF rôle
content: WAF filtre les requêtes HTTP pour bloquer les attaques comme SQL injection ou XSS
description: Protection applicative
-->

<!-- snippet
id: aws_secret_warning
type: warning
tech: aws
level: intermediate
importance: high
format: knowledge
tags: aws,security,error
title: Secret en clair
content: Stocker un secret en clair expose à des fuites, utiliser Secrets Manager
description: Erreur critique sécurité
-->

<!-- snippet
id: aws_kms_command
type: command
tech: aws
level: intermediate
importance: medium
format: knowledge
tags: aws,kms,cli
title: Lister clés KMS
command: aws kms list-keys
description: Permet de voir les clés KMS disponibles
-->

<!-- snippet
id: aws_security_layer_tip
type: tip
tech: aws
level: intermediate
importance: medium
format: knowledge
tags: aws,security,architecture
title: Sécurité en couches
content: KMS chiffre les données au repos, WAF filtre les requêtes HTTP malveillantes à la périphérie, IAM contrôle les actions dans le compte. Un attaquant qui contourne WAF tombe sur IAM ; un token IAM volé ne donne pas accès aux données sans la clé KMS.
description: La défense en profondeur vaut parce que chaque couche protège contre un vecteur d'attaque différent : réseau, API, stockage.
-->

<!-- snippet
id: aws_ddos_error
type: warning
tech: aws
level: intermediate
importance: high
format: knowledge
tags: aws,security,incident
title: Attaque DDoS
content: Symptôme surcharge service, cause attaque DDoS, correction utiliser Shield et WAF
description: Incident critique production
-->
