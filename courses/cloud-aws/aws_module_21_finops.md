---
layout: page
title: "FinOps & optimisation des coûts AWS"

course: cloud-aws
chapter_title: "Architecture Avancée"

chapter: 3
section: 5

tags: aws,finops,cost,pricing,optimization
difficulty: advanced
duration: 100
mermaid: true

status: published
---

# FinOps & optimisation des coûts AWS

## Objectifs pédagogiques

- Comprendre les modèles de pricing AWS
- Identifier les principaux postes de coûts
- Mettre en place un suivi FinOps
- Optimiser les ressources et réduire la facture
- Diagnostiquer des dérives de coûts

## Contexte et problématique

Problème courant :

- Facture AWS incontrôlée
- Ressources inutilisées
- Mauvaise allocation

👉 FinOps permet :

- visibilité
- optimisation
- gouvernance des coûts

## Architecture

| Composant | Rôle | Exemple |
|-----------|------|---------|
| Cost Explorer | analyse coûts | dashboard |
| Budgets | alertes | seuil |
| Pricing models | facturation | on-demand |
| Tags | allocation coûts | projet |

```mermaid
graph TD
Resources --> Cost
Cost --> Explorer
Explorer --> Budget
Budget --> Alert
```

## Commandes essentielles

```bash
aws ce get-cost-and-usage
```

```bash
aws budgets describe-budgets --account-id <ID>
```

```bash
aws ec2 describe-instances
```

## Fonctionnement interne

### Modèles de pricing

- On-demand
- Reserved instances
- Spot instances

### Optimisation

- rightsizing
- arrêt ressources inutilisées
- utilisation cache

🧠 Concept clé  
→ Le coût AWS dépend de l’usage réel

💡 Astuce  
→ utiliser Spot pour workloads non critiques

⚠️ Erreur fréquente  
→ laisser ressources actives  
Correction : automatiser arrêt

## Cas réel en entreprise

Contexte :

Facture élevée.

Solution :

- analyse Cost Explorer
- suppression ressources inutilisées
- reserved instances

Résultat :

- réduction coût de 40%

## Bonnes pratiques

- tagger ressources
- monitorer coûts
- utiliser budgets
- automatiser arrêt
- optimiser stockage
- utiliser instances adaptées
- revoir régulièrement infra

## Résumé

FinOps permet de contrôler et optimiser les coûts AWS.  
Sans suivi, la facture peut exploser.  
C’est une compétence clé en entreprise.

---

## SNIPPETS DE RÉVISION

<!-- snippet
id: aws_finops_definition
type: concept
tech: aws
level: advanced
importance: high
format: knowledge
tags: aws,finops,cost
title: FinOps définition
content: FinOps est la pratique qui aligne ingénieurs, finance et business sur les coûts cloud en temps réel. Contrairement à un budget annuel figé, le cloud facture à la seconde : sans FinOps, les coûts dérivent silencieusement jusqu'à la facture de fin de mois.
description: Le premier réflexe FinOps : activer AWS Cost Explorer + des alertes de budget à 80% et 100% pour ne jamais être surpris.
-->

<!-- snippet
id: aws_pricing_models
type: concept
tech: aws
level: advanced
importance: high
format: knowledge
tags: aws,cost,pricing
title: Modèles pricing AWS
content: AWS propose on-demand, reserved et spot instances selon les besoins et coûts
description: Base pricing AWS
-->

<!-- snippet
id: aws_cost_warning
type: warning
tech: aws
level: advanced
importance: high
format: knowledge
tags: aws,cost,error
title: Ressources inutilisées
content: Laisser des ressources actives inutilement augmente fortement la facture, les supprimer ou arrêter
description: Piège fréquent
-->

<!-- snippet
id: aws_cost_command
type: command
tech: aws
level: advanced
importance: medium
format: knowledge
tags: aws,cli,cost
title: Voir coûts AWS
command: aws ce get-cost-and-usage
description: Permet d'analyser les coûts AWS
-->

<!-- snippet
id: aws_finops_tip
type: tip
tech: aws
level: advanced
importance: medium
format: knowledge
tags: aws,finops,bestpractice
title: Utiliser tags
content: Sans tags, AWS Cost Explorer montre une facture globale sans expliquer qui consomme quoi. Avec des tags `project`, `env` et `team` sur chaque ressource, on peut filtrer et voir que "projet-X en staging consomme 40% du budget" — et agir.
description: Les tags doivent être obligatoires dès la création (enforced via AWS Config) sinon les ressources non taguées rendent l'analyse impossible.
-->

<!-- snippet
id: aws_cost_incident
type: concept
tech: aws
level: advanced
importance: high
format: knowledge
tags: aws,incident,cost
title: Facture élevée
content: Symptôme coût élevé, cause ressources mal dimensionnées, correction rightsizing et optimisation
description: Incident courant
-->
