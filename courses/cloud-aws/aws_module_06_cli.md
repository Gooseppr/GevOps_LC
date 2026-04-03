---
layout: page
title: "AWS CLI — Outils et automatisation"

course: cloud-aws
theme: "Fondations AWS"
type: lesson

chapter: 1
section: 6

tags: aws,cli,automation,devops,tools
difficulty: beginner
duration: 70
mermaid: false

theme_icon: "terminal"
theme_group: 1
theme_group_icon: "cloud"
theme_order: 6
status: "published"
---

# AWS CLI — Outils et automatisation

## Objectifs pédagogiques

- Installer et configurer AWS CLI
- Comprendre les profils et credentials
- Exécuter des commandes AWS efficacement
- Automatiser des tâches via CLI
- Diagnostiquer des erreurs AWS CLI

## Contexte et problématique

La console AWS :

- lente
- non scriptable
- non reproductible

Le CLI permet :

- automatisation
- reproductibilité
- intégration CI/CD

## Architecture

| Composant | Rôle | Exemple |
|-----------|------|---------|
| AWS CLI | Interface ligne de commande | aws ec2 |
| Credentials | Authentification | access key |
| Profile | Configuration multi-compte | dev/prod |
| API AWS | Backend réel | EC2 API |

## Commandes essentielles

```bash
aws configure
```
Configure credentials AWS.

```bash
aws configure list
```
Affiche la configuration active.

```bash
aws s3 ls
```
Liste les buckets.

```bash
aws ec2 describe-instances
```
Liste les instances.

```bash
aws --profile <PROFILE> s3 ls
```
Utilise un profil spécifique.

## Fonctionnement interne

1. CLI → appel API AWS
2. Auth via credentials
3. AWS traite la requête
4. Retour JSON

🧠 Concept clé  
→ CLI = wrapper des API AWS

💡 Astuce  
→ Toujours utiliser des profils (jamais hardcoder)

⚠️ Erreur fréquente  
→ Mauvais credentials → erreurs AccessDenied  
Correction : vérifier profile actif

## Cas réel en entreprise

Contexte :

Déploiement automatisé.

Solution :

- Scripts bash avec CLI
- Intégration CI/CD

Résultat :

- Déploiement rapide
- Réduction erreurs humaines

## Bonnes pratiques

- Utiliser profils AWS
- Ne jamais exposer clés
- Automatiser via scripts
- Utiliser output JSON
- Versionner scripts
- Utiliser variables d’environnement
- Logger les commandes

## Résumé

AWS CLI permet d’interagir avec AWS de manière scriptable.  
C’est un outil clé pour le DevOps et l’automatisation.  
Il remplace la console pour les usages professionnels.

---

## SNIPPETS DE RÉVISION

<!-- snippet
id: aws_cli_definition
type: concept
tech: aws
level: beginner
importance: high
format: knowledge
tags: aws,cli,devops
title: AWS CLI définition
content: AWS CLI est un outil permettant d'interagir avec les services AWS via ligne de commande
description: Outil central DevOps AWS
-->

<!-- snippet
id: aws_cli_configure_command
type: command
tech: aws
level: beginner
importance: high
format: knowledge
tags: aws,cli,setup
title: Configurer AWS CLI
command: aws configure
description: Permet de configurer les credentials AWS
-->

<!-- snippet
id: aws_cli_profile_usage
type: concept
tech: aws
level: beginner
importance: high
format: knowledge
tags: aws,cli,profile
title: Profil AWS CLI
content: Un profil permet de gérer plusieurs comptes AWS avec des configurations séparées
description: Indispensable en entreprise
-->

<!-- snippet
id: aws_cli_access_denied_error
type: error
tech: aws
level: beginner
importance: high
format: knowledge
tags: aws,cli,error
title: Erreur AccessDenied
content: Symptôme AccessDenied, cause credentials ou permissions IAM incorrectes, correction vérifier profil et policies
description: Erreur fréquente AWS CLI
-->

<!-- snippet
id: aws_cli_security_tip
type: tip
tech: aws
level: beginner
importance: medium
format: knowledge
tags: aws,security,cli
title: Sécuriser AWS CLI
content: Ne jamais stocker les credentials en clair, utiliser variables d'environnement ou roles IAM
description: Bonne pratique sécurité
-->
