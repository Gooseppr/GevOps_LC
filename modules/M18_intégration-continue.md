---
layout: page
title: Intégration continue
sujet: Intégration continue (CI)
type: module
jour: 18
ordre: 1
tags: ci, yaml, gitlab, devops
---


# 🧩 **Cours : L’Intégration Continue (CI)**

## 🎯 Objectifs du module

- Comprendre ce qu’est l’intégration continue (CI)
- Identifier ses bénéfices dans une démarche DevOps
- Découvrir les outils CI les plus utilisés
- Savoir écrire et comprendre un fichier de configuration `.gitlab-ci.yml`
- Mettre en place un pipeline simple et évolutif

---

## 1️⃣ Qu’est-ce que l’intégration continue ?

### 📘 Définition

L’intégration continue (**Continuous Integration — CI**) est une **pratique DevOps** qui consiste à **intégrer fréquemment** le code produit par les développeurs dans une branche commune, puis à **automatiser une série de vérifications** (tests, builds, lint, etc.) à chaque modification du code.

> 💡 Objectif : détecter le plus tôt possible les erreurs d’intégration, de compatibilité ou de régression.
> 

### 🔄 Le principe

Chaque fois qu’un développeur **pousse** (`git push`) du code :

1. Une **pipeline CI** se déclenche automatiquement.
2. Le code est **téléchargé et analysé** sur un serveur d’intégration.
3. Des **tests automatisés** (lint, unitaires, sécurité, build) sont exécutés.
4. Si tout passe ✅, le code peut être fusionné ou déployé plus loin (phase CD).

---

## 2️⃣ Le cycle de vie d’une application

Une application suit généralement ce cycle :

```
Gestion de projet → Développement → Tests → Préproduction → Production → Maintenance

```

À chaque étape, des **risques de bugs** apparaissent.

Les tests automatisés dans la CI permettent d’en détecter **avant la mise en production.**

---

## 3️⃣ Pourquoi faire de la CI ?

| Objectif | Description |
| --- | --- |
| 🧪 Détection précoce | Identifier les bugs dès la phase de développement |
| 🔁 Automatisation | Exécuter les tests et vérifications sans intervention humaine |
| ⏱ Gain de temps | Réduire les délais de livraison |
| ✅ Qualité | Garantir la stabilité et la conformité du code |
| 📈 Itérations courtes | Déployer plus souvent, avec moins de risque |

---

## 4️⃣ Les environnements de travail

| Environnement | Objectif principal |
| --- | --- |
| **Développement** | Espace du développeur, modifications locales |
| **Test / QA** | Exécution de tests automatisés |
| **Staging / Pré-production** | Validation utilisateur / performance avant mise en prod |
| **Production** | Application en ligne, utilisée par les clients |

> ⚙️ L’intégration continue s’occupe principalement du code source, pas encore du déploiement sur les serveurs (c’est la partie CD).
> 

---

## 5️⃣ CI vs CD : ne pas confondre

| Concept | Signification | Cible principale |
| --- | --- | --- |
| **CI (Continuous Integration)** | Automatiser les tests, builds, vérifications du code source | 🧑‍💻 Le code |
| **CD (Continuous Deployment/Delivery)** | Automatiser le déploiement sur les serveurs ou environnements de prod | 🖥️ Le serveur |

> Dans ton image :
> 
> 
> 🔹 CI = automatisations liées **au code source**
> 
> 🔹 CD = automatisations liées **au serveur de production**
> 

---

## 6️⃣ Les outils d’intégration continue

| Outil | Particularités |
| --- | --- |
| **GitLab CI/CD** | Natif dans GitLab, configuration via `.gitlab-ci.yml` |
| **GitHub Actions** | Intégré à GitHub |
| **Jenkins** | Très flexible, écrit en Groovy |
| **CircleCI** | Rapide, cloud-based |
| **Azure DevOps** | Intégré à Microsoft |
| **AWS CodePipeline** | Pour projets hébergés sur AWS |

---

## 7️⃣ YAML : le langage de configuration

Les pipelines GitLab CI se définissent dans un fichier `.gitlab-ci.yml`.

C’est un fichier YAML — lisible, hiérarchique et simple à versionner.

### 🧱 Structure de base :

```yaml
stages:        # Étapes du pipeline
  - test
  - build
  - deploy

test_job:      # Nom du job
  stage: test  # À quelle étape il appartient
  script:      # Commandes à exécuter
    - echo "Exécution des tests"
    - pytest

build_job:
  stage: build
  script:
    - echo "Construction du projet"
    - npm run build

```

---

## 8️⃣ Exemple 1 – Pipeline minimal

```yaml
stages:
  - check

code_quality:
  stage: check
  script:
    - echo "Vérification du code"
    - pylint my_app/

```

➡️ Ce pipeline lance un seul job pour vérifier la qualité du code.

---

## 9️⃣ Exemple 2 – Pipeline multi-jobs (tests + build)

```yaml
stages:
  - test
  - build

unit_tests:
  stage: test
  script:
    - echo "Lancement des tests unitaires"
    - pytest

build_app:
  stage: build
  script:
    - echo "Construction de l’application"
    - npm run build
  needs: ["unit_tests"]  # Le job build dépend du job test

```

➡️ Ici, le **job `build_app`** ne s’exécute **que si les tests passent**.

---

## 🔟 Exemple 3 – Pipeline conditionnel (workflow)

```yaml
stages:
  - test
  - build
  - deploy

unit_tests:
  stage: test
  script:
    - pytest
  only:
    - merge_requests  # Exécuté uniquement sur les MR

build_app:
  stage: build
  script:
    - npm ci
    - npm run build
  only:
    - main

deploy_staging:
  stage: deploy
  script:
    - echo "Déploiement sur staging..."
    - ssh deploy@staging-server "docker-compose up -d"
  only:
    - tags

```

➡️ **Interprétation :**

- Tests à chaque merge request
- Build sur la branche principale
- Déploiement staging uniquement lors d’un tag (ex : `v1.0.0`)

---

## 11️⃣ Exemple 4 – Variables et cache

```yaml
variables:
  NODE_ENV: test
  APP_PATH: "src"

stages:
  - test
  - build

cache:
  paths:
    - node_modules/

test_app:
  stage: test
  script:
    - npm ci
    - npm test

build_app:
  stage: build
  script:
    - npm run build

```

➡️ L’utilisation du **cache** accélère le pipeline.

➡️ Les **variables** facilitent la maintenance du fichier.

---

## 12️⃣ Exemple 5 – Pipeline avec artefacts

```yaml
stages:
  - test
  - build

unit_tests:
  stage: test
  script:
    - pytest --junitxml=report.xml
  artifacts:
    paths:
      - report.xml
    expire_in: 1 week

```

➡️ Le rapport de test est sauvegardé et téléchargeable depuis GitLab.

---

## 13️⃣ Étapes typiques d’un pipeline CI

| Étape | Action typique |
| --- | --- |
| 🧹 **Lint / format** | Vérifie le style et la syntaxe du code |
| 🔧 **Build** | Compile ou assemble le projet |
| 🧪 **Tests unitaires** | Vérifie les fonctions internes |
| 🧭 **Tests d’intégration** | Vérifie les interactions entre modules |
| 📦 **Packaging / Artefacts** | Génère un build prêt à déployer |
| 🚦 **Validation** | Assure que tout est conforme avant CD |

---

## 14️⃣ Avantages concrets

| Aspect | Bénéfice |
| --- | --- |
| ⏰ Rapidité | Tests automatisés → moins de délais |
| 💡 Fiabilité | Détection précoce des erreurs |
| 👥 Collaboration | Intégration fluide entre développeurs |
| 🧩 Traçabilité | Historique clair des pipelines et builds |
| 💰 Économie | Moins d’incidents en production |

---

## 📘 En résumé

| CI | CD |
| --- | --- |
| Intègre, teste et valide le code | Déploie le code validé |
| Concerne les développeurs | Concerne les opérations |
| Utilise des outils comme GitLab CI, Jenkins, CircleCI | Utilise des outils comme ArgoCD, GitOps, Ansible |

---

## 🚀 À retenir

> L’intégration continue (CI) est le socle de la qualité logicielle.
> Elle garantit que chaque changement de code est testé, validé et prêt à être déployé.



<!-- snippet
id: cicd_ci_definition
type: concept
tech: cicd
level: beginner
importance: high
format: knowledge
tags: ci,devops,integration-continue,definition
title: Qu'est-ce que l'intégration continue (CI) ?
context: comprendre le principe fondamental de la CI avant de configurer un pipeline
content: La CI intègre fréquemment le code dans une branche commune et déclenche automatiquement des vérifications (lint, tests, build) à chaque push. Objectif : détecter les erreurs le plus tôt possible.
-->

<!-- snippet
id: cicd_gitlab_ci_basic_structure
type: concept
tech: cicd
level: beginner
importance: high
format: knowledge
tags: gitlab,ci,yaml,stages,jobs
title: Structure de base d'un fichier .gitlab-ci.yml
context: écrire un premier pipeline GitLab CI fonctionnel
content: Un pipeline GitLab CI se compose de stages (ordre d'exécution) et de jobs (blocs nommés avec stage + script). Les jobs d'un même stage s'exécutent en parallèle, les stages en séquence.
-->

<!-- snippet
id: cicd_gitlab_needs_keyword
type: tip
tech: cicd
level: intermediate
importance: medium
format: knowledge
tags: gitlab,ci,needs,dépendances,jobs
title: Dépendances inter-jobs avec needs dans GitLab CI
context: faire démarrer un job build dès que les tests sont terminés, sans attendre le stage entier
content: Le mot-clé `needs` permet de définir des dépendances directes entre jobs. Un job peut démarrer dès que son job prérequis est terminé, sans attendre la fin de tout le stage.
description: Sans `needs`, les stages sont séquentiels et bloquants. Avec `needs`, le DAG des jobs est optimisé : le déploiement peut commencer pendant que les tests d'intégration tournent encore sur une autre branche.
-->

<!-- snippet
id: cicd_ci_vs_cd
type: concept
tech: cicd
level: beginner
importance: high
format: knowledge
tags: ci,cd,devops,differentiation
title: Différence entre CI et CD
context: clarifier les responsabilités de chaque pratique dans la chaîne DevOps
content: CI = automatiser les tests, builds et vérifications du code source. CD = automatiser la promotion et le déploiement de l'artefact validé vers les environnements cibles. La CI précède toujours le CD.
-->

<!-- snippet
id: cicd_gitlab_artifacts_cache
type: concept
tech: cicd
level: intermediate
importance: medium
format: knowledge
tags: gitlab,ci,artifacts,cache,optimisation
title: Artefacts et cache dans GitLab CI
context: partager des fichiers entre jobs et accélérer les pipelines
content: Les `artifacts` sauvegardent des fichiers produits par un job (rapport de test, binaire) pour les télécharger ou les transmettre à un job suivant.
-->

<!-- snippet
id: cicd_gitlab_cache_tip
type: tip
tech: cicd
level: intermediate
importance: medium
format: knowledge
tags: gitlab,ci,cache,node_modules,optimisation
title: Utiliser le cache pour accélérer les pipelines GitLab CI
context: éviter de retélécharger les dépendances npm ou pip à chaque run de pipeline
content: Le `cache` stocke des répertoires entre plusieurs exécutions de pipeline (ex. node_modules/). Il accélère les pipelines en évitant de retélécharger les dépendances à chaque run.
-->

<!-- snippet
id: cicd_gitlab_conditional_pipeline
type: concept
tech: cicd
level: intermediate
importance: medium
format: knowledge
tags: gitlab,ci,only,rules,conditions
title: Pipelines conditionnels avec only/rules dans GitLab CI
context: exécuter des jobs uniquement dans certains contextes (MR, tag, branche main)
content: `only: [merge_requests]` exécute le job sur les MR. `only: [main]` sur la branche principale. `only: [tags]` lors d'un tag. La syntaxe moderne `rules:` avec `if:` offre plus de flexibilité.
-->

---
[Module suivant →](M18_Cours_GitLab_Runner.md)
---
