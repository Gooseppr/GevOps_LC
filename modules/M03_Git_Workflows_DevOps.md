---
layout: page
title: Git — Workflows collaboratifs et stratégies DevOps
sujet: Versionning
type: module
jour: 03
ordre: 3
tags: git, workflow, ci, cd
---

# 🧩 GIT — WORKFLOWS COLLABORATIFS ET STRATÉGIES DEVOPS

---

## 1. Introduction — Pourquoi un workflow est essentiel

Un **workflow Git** définit **comment une équipe s’organise autour de Git** :  
qui crée les branches, comment elles sont fusionnées, quand le code part en production.

> 🎯 En DevOps, un workflow bien pensé garantit :  
> - un historique clair et maîtrisé,  
> - une intégration continue fluide,  
> - et des déploiements sécurisés.

---

## 2. Les grands modèles de workflow

| Workflow | Principe | Avantages | Inconvénients | Adapté à |
|-----------|-----------|------------|----------------|----------|
| **Git Flow** | Branches `develop`, `release`, `hotfix` | Cycle structuré, versioning clair | Complexité, maintenance élevée | Équipes produit classiques |
| **Feature Branch** | Une branche par fonctionnalité | Simple, CI rapide | Multiplication des branches | Petites / moyennes équipes |
| **Trunk-Based** | Tout converge vers `main`, merges fréquents | Déploiement continu, feedback rapide | Demande tests automatiques robustes | Équipes DevOps matures |
| **GitHub Flow** | `main` + branches courtes + PR | Collaboration rapide, agile | Pas de gestion de versions formelle | Projets web et agiles |

---

## 3. Les branches typiques d’un projet professionnel

| Branche | Rôle | Fréquence d’usage |
|----------|------|------------------|
| `main` / `master` | Code de production stable | Continue |
| `develop` | Intégration / staging | Continue |
| `feature/x` | Nouvelle fonctionnalité | Temporaire |
| `hotfix/x` | Correctif urgent en production | Occasionnelle |
| `release/x` | Préparation d’une version stable | Régulière |

### Visualisation (Git Flow simplifié)

```mermaid
gitGraph
    commit id: "main"
    branch develop
    commit id: "dev-1"
    branch feature/login
    commit id: "feat-1"
    commit id: "feat-2"
    checkout develop
    merge feature/login
    branch release/v1.0
    commit id: "prep-release"
    checkout main
    merge release/v1.0
    branch hotfix/urgent
    commit id: "fix-bug"
    checkout main
    merge hotfix/urgent
```

---

## 4. Intégration du workflow à la CI/CD

Dans un pipeline GitLab ou GitHub Actions, le workflow détermine **quand et comment** les jobs s’exécutent.

### Exemple (GitLab CI)

```yaml
stages: [test, build, deploy]

test:
  stage: test
  script:
    - pytest
  rules:
    - if: '$CI_COMMIT_BRANCH == "develop"'

build:
  stage: build
  script:
    - npm run build
  only:
    - main

deploy_prod:
  stage: deploy
  script:
    - ./deploy.sh
  only:
    - tags
```

> 💡 **develop** → environnement de test  
> **main** → production  
> **tags** → release versionnée

---

## 5. Bonnes pratiques de collaboration

| Bonne pratique | Description |
|----------------|-------------|
| **Branches courtes** | Limite les conflits et facilite la revue |
| **Rebase avant merge** | Garde un historique propre |
| **Pull Request claire** | Message, screenshots, tests passés |
| **Protection des branches** | `main` et `develop` verrouillées (CI + review) |
| **Nom cohérent** | `feat/`, `fix/`, `hotfix/`, `release/` |
| **Conventional Commits** | Standardise les messages (`feat:`, `fix:`, etc.) |

---

## 6. Exemple concret d’un cycle complet (Git Flow + CI/CD)

### Étapes
1. Le développeur crée une branche :  
   ```bash
   git switch -c feature/login
   ```
2. Il code, commit et push :  
   ```bash
   git push -u origin feature/login
   ```
3. Une **Merge Request** déclenche la **pipeline CI** : tests, lint, build.  
4. Une fois validée, la branche est fusionnée dans `develop`.  
5. En fin de sprint : `develop` → `release/x` → `main`.  
6. Le pipeline `deploy` envoie automatiquement la release en production.

---

## 7. Cas d’usage selon le type d’entreprise

| Type d’équipe | Workflow conseillé | Pourquoi |
|----------------|--------------------|-----------|
| **Start-up agile** | GitHub Flow | Rapidité, déploiements fréquents |
| **Équipe produit stable** | Git Flow | Versioning clair et gestion de release |
| **Équipe DevOps CI/CD mature** | Trunk-Based | Intégration continue et déploiement en continu |
| **Projet open source** | Feature Branch + PR | Collaboration externe et revue ouverte |

---

## 8. Exemples de conventions de nommage

| Type | Exemple | Description |
|------|----------|-------------|
| **Feature** | `feat/auth-login` | Nouvelle fonctionnalité |
| **Fix** | `fix/header-overlap` | Correction de bug |
| **Hotfix** | `hotfix/payment-crash` | Urgence en production |
| **Release** | `release/v2.1.0` | Préparation d’une version |
| **Experiment** | `exp/ui-theme` | Prototype ou test interne |

---

## 9. Workflow et stratégie de déploiement

| Étape | Branche concernée | Action CI/CD |
|--------|------------------|--------------|
| Développement | `feature/*` | Tests unitaires + Lint |
| Intégration | `develop` | Tests d’intégration + Build staging |
| Préproduction | `release/*` | Tests QA + Validation |
| Production | `main` + tags | Déploiement automatisé + Release note |

---

## 10. Règles d’or DevOps pour un bon workflow Git

✅ **Automatise les contrôles** : lint, tests, build, déploiement  
✅ **Favorise la fréquence de merge** : petites PR, feedback rapide  
✅ **Ne garde pas les branches trop longtemps**  
✅ **Tag chaque release** (ex : `v1.2.0`)  
✅ **Utilise `--force-with-lease` si tu dois réécrire une branche privée**  
✅ **Documente la stratégie** dans un fichier `CONTRIBUTING.md`

---

## 11. Exemple de configuration GitLab pour branches protégées

Dans les **paramètres du dépôt GitLab** :  
- Protège `main` et `develop`  
- Active les règles :  
  - ✅ “Pipeline must succeed before merge”  
  - ✅ “Require approval from at least 1 reviewer”  
  - ✅ “No direct push to main”  

> Ces règles assurent la qualité du code avant mise en production.

---

## 12. En résumé — Workflow Git & DevOps : la clé de la fluidité

> “Un bon workflow, c’est une organisation claire, des branches maîtrisées, et une CI/CD qui automatise la confiance.”

### À retenir :
- Git Flow → structure stable, long cycle de release  
- Feature Branch → simple et efficace pour la plupart des équipes  
- Trunk-Based → pour les équipes CI/CD matures  
- Chaque workflow doit **servir la fréquence et la fiabilité des livraisons.**

---

🎉 **Félicitations !**  
Tu sais maintenant choisir, adapter et appliquer un **workflow Git professionnel** parfaitement intégré à une approche DevOps.



<!-- snippet
id: git_workflow_concept
type: concept
tech: git
level: beginner
importance: high
format: knowledge
tags: workflow,gitflow,trunk-based,feature-branch
title: Les grands modèles de workflow Git
context: choisir une stratégie de branches pour une équipe
content: Quatre modèles principaux : Git Flow (develop/release/hotfix), Feature Branch (branche par fonctionnalité), Trunk-Based (merges fréquents sur main), GitHub Flow (branches courtes + PR).
-->

<!-- snippet
id: git_branch_naming
type: tip
tech: git
level: beginner
importance: medium
format: knowledge
tags: branche,nommage,convention
title: Convention de nommage des branches
context: nommer une branche de manière cohérente en équipe
content: Préfixes standardisés : `feat/` (fonctionnalité), `fix/` (correction), `hotfix/` (urgence prod), `release/` (version), `exp/` (prototype). Ex : `feat/auth-login`.
-->

<!-- snippet
id: git_switch_feature_branch
type: command
tech: git
level: beginner
importance: high
format: knowledge
tags: branche,feature,switch,push
title: Créer et publier une branche de fonctionnalité
context: démarrer le développement d'une nouvelle fonctionnalité
command: git switch -c feature/login && git push -u origin feature/login
description: Crée une branche isolée pour une fonctionnalité et l'associe immédiatement au dépôt distant pour déclencher la CI
-->

<!-- snippet
id: git_trunk_based_warning
type: warning
tech: git
level: intermediate
importance: medium
format: knowledge
tags: trunk-based,CI,tests,merge-fréquent
title: Trunk-Based Development exige des tests automatiques solides
context: adopter le développement orienté tronc commun
content: Le Trunk-Based Development repose sur des merges fréquents vers main. Sans tests automatiques robustes, chaque push peut introduire une régression directement en production.
-->

<!-- snippet
id: git_trunk_based_warning_b
type: warning
tech: git
level: intermediate
importance: medium
format: knowledge
tags: trunk-based,CI,tests,merge-fréquent
title: Trunk-Based nécessite une CI complète (lint, tests, intégration)
context: mettre en place les prérequis du Trunk-Based Development
content: Ne pas adopter le Trunk-Based sans une CI fiable couvrant lint, tests unitaires et tests d'intégration. Sans ce filet, main devient instable en permanence.
-->

<!-- snippet
id: git_protected_branches_tip
type: tip
tech: git
level: intermediate
importance: medium
format: knowledge
tags: protection,main,CI,qualité,gitlab
title: Protéger les branches critiques dans GitLab/GitHub
context: empêcher les push directs sur main ou develop
content: Activer dans les paramètres : pipeline obligatoire avant merge, approbation d'au moins 1 reviewer, et blocage des push directs sur `main` et `develop`.
-->

<!-- snippet
id: git_conventional_commits_tip
type: tip
tech: git
level: beginner
importance: medium
format: knowledge
tags: commit,message,conventional-commits,CI
title: Utiliser les Conventional Commits pour les messages
context: standardiser les messages de commit en équipe
content: Format : `type(scope): description`. Types courants : `feat`, `fix`, `chore`, `docs`, `refactor`, `test`. Exemple : `feat(auth): ajouter la connexion OAuth`.
-->

<!-- snippet
id: git_merge_request_cycle
type: concept
tech: git
level: intermediate
importance: high
format: knowledge
tags: merge-request,pull-request,CI,workflow,cycle
title: Cycle complet d'une Merge Request avec CI/CD
context: comprendre le flux d'une fonctionnalité de la branche à la production
content: Créer `feature/*` depuis develop, pousser, ouvrir une MR → la CI se déclenche (tests, lint, build). Après revue et approbation, fusionner dans develop.
-->

---
[← Module précédent](M03_git-historique-avance.md)
---
