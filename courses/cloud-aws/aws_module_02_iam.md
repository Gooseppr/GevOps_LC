---
layout: page
title: "IAM — Gestion des identités AWS"

course: cloud-aws
chapter_title: "Fondations AWS"

chapter: 1
section: 2

tags: aws,iam,security,authentication,authorization
difficulty: beginner
duration: 60
mermaid: true

status: published
---

# IAM — Gestion des identités AWS

## Objectifs pédagogiques

- Comprendre le rôle de IAM dans AWS
- Distinguer user, group, role et policy
- Lire et comprendre une policy JSON
- Appliquer le principe du least privilege
- Diagnostiquer un problème de permissions

## Contexte et problématique

IAM existe pour répondre à un problème critique :

👉 Qui peut faire quoi dans ton infrastructure ?

Sans IAM :
- Accès total partout (catastrophique)
- Impossible de tracer les actions
- Failles de sécurité majeures

IAM est le socle de sécurité AWS.

## Architecture

| Composant | Rôle | Exemple |
|-----------|------|--------|
| User | Identité humaine | Admin, Dev |
| Group | Regroupe des users | DevOps team |
| Role | Identité temporaire | EC2 role |
| Policy | Règles d’accès | S3 read-only |

```mermaid
graph TD
A[User] --> B[Group]
B --> C[Policy]
D[Role] --> C
```

## Commandes essentielles

```bash
aws iam list-users
```
Liste les utilisateurs IAM.

```bash
aws iam list-roles
```
Liste les rôles IAM.

```bash
aws iam simulate-principal-policy --policy-source-arn <ARN>
```
Permet de tester une policy.

## Fonctionnement interne

IAM repose sur :

1. Authentification (qui es-tu)
2. Autorisation (que peux-tu faire)

🧠 Concept clé  
→ Une action AWS = vérification IAM systématique

💡 Astuce  
→ Toujours tester une policy avant prod

⚠️ Erreur fréquente  
→ Donner accès admin → risque sécurité énorme

## Cas réel en entreprise

Contexte :

Une équipe DevOps déploie des apps.

Solution :

- Créer un rôle EC2
- Attacher policy S3 read-only
- Supprimer accès root

Résultat :

- Sécurité renforcée
- Moins de risques

## Bonnes pratiques

- Activer MFA
- Ne jamais utiliser root
- Appliquer least privilege
- Utiliser des rôles plutôt que des users
- Auditer régulièrement les accès
- Versionner les policies

## Résumé

IAM contrôle l’accès à AWS.  
Users, roles et policies définissent les permissions.  
La sécurité repose sur une bonne gestion des identités.

---

## SNIPPETS DE RÉVISION

<!-- snippet
id: aws_iam_definition
type: concept
tech: aws
level: beginner
importance: high
format: knowledge
tags: aws,iam,security
title: IAM rôle principal
content: IAM permet de contrôler qui peut accéder à quelles ressources AWS et avec quelles permissions
description: Base de toute sécurité AWS
-->

<!-- snippet
id: aws_iam_least_privilege
type: concept
tech: aws
level: beginner
importance: high
format: knowledge
tags: aws,security,iam
title: Principe du least privilege
content: Donner uniquement les permissions strictement nécessaires réduit fortement les risques de sécurité
description: Principe fondamental IAM
-->

<!-- snippet
id: aws_iam_admin_warning
type: warning
tech: aws
level: beginner
importance: high
format: knowledge
tags: aws,security,error
title: Donner admin access
content: Donner des droits admin augmente le risque de compromission, utiliser des permissions minimales
description: Erreur critique en entreprise
-->

<!-- snippet
id: aws_iam_cli_list_users
type: command
tech: aws
level: beginner
importance: medium
format: knowledge
tags: aws,iam,cli
title: Lister les users IAM
command: aws iam list-users
description: Permet de voir tous les utilisateurs IAM configurés
-->

<!-- snippet
id: aws_iam_role_usage
type: concept
tech: aws
level: beginner
importance: medium
format: knowledge
tags: aws,iam,role
title: Utiliser les roles IAM
content: Utiliser des roles IAM au lieu de credentials statiques améliore la sécurité et la gestion des accès
description: Bonne pratique AWS
-->
