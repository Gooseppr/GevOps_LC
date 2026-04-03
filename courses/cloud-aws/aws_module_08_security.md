---
layout: page
title: "Sécurité AWS — IAM, MFA, Encryption"

course: cloud-aws
chapter_title: "Fondations AWS"

chapter: 1
section: 8

tags: aws,security,mfa,encryption,iam
difficulty: beginner
duration: 85
mermaid: true

status: published
---

# Sécurité AWS — IAM, MFA, Encryption

## Objectifs pédagogiques

- Comprendre les fondamentaux de la sécurité AWS
- Mettre en place MFA et sécuriser les comptes
- Comprendre les mécanismes de chiffrement
- Appliquer les bonnes pratiques de sécurité
- Identifier les risques critiques en production

## Contexte et problématique

Le cloud introduit de nouveaux risques :

- Accès à distance
- Mauvaise configuration
- Fuites de données

AWS fournit des outils puissants, mais mal utilisés → catastrophe.

## Architecture

| Composant | Rôle | Exemple |
|-----------|------|---------|
| IAM | Gestion accès | policies |
| MFA | Auth forte | OTP |
| KMS | Gestion clés | encryption |
| SG | Firewall | ports |
| CloudTrail | Audit | logs |

```mermaid
graph TD
User --> IAM
IAM --> MFA
IAM --> Resource
Resource --> Encryption
CloudTrail --> Audit
```

## Commandes essentielles

```bash
aws iam list-users
```

```bash
aws kms list-keys
```

```bash
aws cloudtrail describe-trails
```

## Fonctionnement interne

1. Authentification (IAM + MFA)
2. Autorisation (policies)
3. Chiffrement (KMS)
4. Audit (CloudTrail)

🧠 Concept clé  
→ Sécurité AWS = configuration utilisateur

💡 Astuce  
→ Activer MFA sur tous les comptes

⚠️ Erreur fréquente  
→ Laisser root actif sans MFA  
Correction : sécuriser root immédiatement

## Cas réel en entreprise

Contexte :

Fuite de credentials.

Solution :

- Rotation des clés
- MFA obligatoire
- Restriction IAM

Résultat :

- Réduction risques
- Meilleure traçabilité

## Bonnes pratiques

- Activer MFA partout
- Ne jamais utiliser root
- Chiffrer toutes les données
- Utiliser KMS
- Restreindre accès IAM
- Auditer régulièrement
- Monitorer via CloudTrail

## Résumé

La sécurité AWS repose sur IAM, MFA et encryption.  
Les erreurs humaines sont la principale cause d’incident.  
Une bonne configuration est essentielle.

---

## SNIPPETS DE RÉVISION

<!-- snippet
id: aws_security_definition
type: concept
tech: aws
level: beginner
importance: high
format: knowledge
tags: aws,security,cloud
title: Sécurité AWS principe
content: La sécurité AWS repose sur la configuration des accès et non sur AWS seul
description: Concept fondamental
-->

<!-- snippet
id: aws_mfa_importance
type: concept
tech: aws
level: beginner
importance: high
format: knowledge
tags: aws,mfa,security
title: MFA importance
content: Le MFA ajoute une couche de sécurité essentielle en plus du mot de passe
description: Protection critique
-->

<!-- snippet
id: aws_root_warning
type: warning
tech: aws
level: beginner
importance: high
format: knowledge
tags: aws,security,error
title: Utiliser root
content: Utiliser le compte root expose à des risques majeurs, utiliser IAM à la place
description: Erreur critique AWS
-->

<!-- snippet
id: aws_kms_definition
type: concept
tech: aws
level: beginner
importance: medium
format: knowledge
tags: aws,kms,encryption
title: KMS rôle
content: KMS permet de gérer les clés de chiffrement pour sécuriser les données AWS
description: Base encryption AWS
-->

<!-- snippet
id: aws_security_tip
type: tip
tech: aws
level: beginner
importance: medium
format: knowledge
tags: aws,security,bestpractice
title: Sécuriser AWS
content: Toujours combiner IAM, MFA et encryption pour une sécurité complète
description: Bonne pratique globale
-->

<!-- snippet
id: aws_security_error
type: warning
tech: aws
level: beginner
importance: high
format: knowledge
tags: aws,security,incident
title: Mauvaise config sécurité
content: Symptôme accès non autorisé, cause mauvaise policy IAM, correction appliquer least privilege
description: Incident fréquent
-->
