---
title: Intégration continue - GitLab Runner
sujet: Intégration continue (CI)
type: module
jour: 18
ordre: 3
tags: ci, yaml, gitlab, devops
---

# 🟦 1. Introduction : c’est quoi Azure DevOps ?

Azure DevOps est une **plateforme DevOps complète**, proposée par Microsoft, permettant de gérer **tout le cycle de vie logiciel** :

- versionner du code
- planifier les tâches
- suivre les bugs
- automatiser les tests
- construire et déployer les applications
- conserver les artefacts
- collaborer entre développeurs, ops, QA, PO…

👉 On parle d’un **écosystème tout-en-un**, comparable à GitLab, mais avec une intégration très forte dans l’environnement Microsoft.

---

# 🟦 2. Les modules d’Azure DevOps

Azure DevOps est composé de **5 briques principales**, chacune couvrant un domaine précis.

## 🔵 2.1. Azure Repos

**Service Git complet** intégrant :

- gestion de branches
- pull requests
- merge strategies
- policies (revues obligatoires, lint, build obligatoire, etc.)
- gestion fine des permissions

👉 Comparable à un **GitLab Repository** ou GitHub.


## 🔵 2.2. Azure Pipelines

C’est l’outil **CI/CD**.

Il permet :

- de lancer automatiquement des tests
- de compiler le code
- de créer des artefacts (builds, packages, images Docker…)
- de déployer vers Azure, Kubernetes, serveurs on-premise…

Deux modes :

| Mode | Description |
| --- | --- |
| **YAML** | standard moderne (recommandé) |
| **Classic (GUI)** | ancien, pratique pour débutants mais moins portable |


## 🔵 2.3. Azure Boards

Module Agile / gestion de projet :

- Kanban
- backlog
- epics / user stories / tasks
- vélocité
- sprints
- burndown chart

👉 Concurrent direct de Jira.


## 🔵 2.4. Test Plans

Pour les tests **manuels**, non automatisés :

- scénarios QA
- campagnes de tests
- suivi des résultats
- assignation des tests


## 🔵 2.5. Azure Artifacts

Un **registry** complet :

- NuGet
- npm
- Maven
- Python
- Universal packages

Utile pour les entreprises avec beaucoup de librairies internes.

---

# 🟦 3. Azure DevOps vs GitLab CI/CD

| Fonction | Azure DevOps | GitLab |
| --- | --- | --- |
| Hébergement | Cloud / hybride | Cloud / On-premise |
| CI/CD | Très puissant | Très puissant |
| Connexion Microsoft | ★★★★★ | ★★☆☆☆ |
| Boards | Équivalent Jira | Basique mais OK |
| Artifacts | Très complet | Registry Docker + Package Registry |
| YAML pipeline | azure-pipelines.yml | .gitlab-ci.yml |

👉 Azure DevOps est **excellent dans les environnements Microsoft / Azure**.

👉 GitLab est souvent préféré pour un **DevOps cloud-agnostic**.

---

# 🟦 4. Structure d’un pipeline Azure DevOps

Le pipeline est défini dans un fichier :

```
azure-pipelines.yml

```

Il repose sur **3 niveaux** :

```
stage
 └── job
      └── step

```


## 🔵 4.1. Les déclencheurs (trigger)

```yaml
trigger:
  - main

```

Signifie :

➡️ à chaque push sur `main`, le pipeline démarre.


## 🔵 4.2. Choix du type d’agent (pool)

```yaml
pool:
  vmImage: 'ubuntu-latest'

```

Agents disponibles :

- ubuntu-latest
- windows-latest
- macos-latest

👉 L’équivalent de `image: ...` dans GitLab CI.


## 🔵 4.3. Pipeline de base

```yaml
trigger:
  - main

pool:
  vmImage: 'ubuntu-latest'

steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '18.x'
    displayName: Install Node

  - script: |
      npm install
      npm test
    displayName: Build + Test

```

---

# 🟦 5. Décomposer la logique : Stages / Jobs / Steps

## 🔵 5.1. Steps

Les **actions élémentaires** :

- script shell
- script PowerShell
- tâche prédéfinie

Exemple :

```yaml
steps:
  - script: echo "Hello world"

```


## 🔵 5.2. Jobs

Un job regroupe plusieurs steps **sur un même agent**.

```yaml
jobs:
  - job: Tests
    steps:
      - script: npm test

```


## 🔵 5.3. Stages

Les grandes phases du pipeline.

```yaml
stages:
  - stage: Build
    jobs:
      - job: BuildJob
        steps:
          - script: echo Build

  - stage: Deploy
    jobs:
      - job: DeployJob
        steps:
          - script: echo Deploy

```

👉 Les stages peuvent être séquentiels ou parallèles.

---

# 🟦 6. Variables, Conditions, Templates

### 🔵 Variables

```yaml
variables:
  NODE_ENV: production

```

Utilisation :

```yaml
script: echo $(NODE_ENV)

```

### 🔵 Conditions

```yaml
- script: echo "deploy"
  condition: eq(variables['Build.SourceBranch'], 'refs/heads/main')

```

### 🔵 Templates (réutilisation YAML)

```yaml
steps:
- template: steps/common-build.yml

```

---

# 🟦 7. Tâches prédéfinies (Tasks)

Azure fournit des centaines de tâches prêtes à l’emploi.

### 🔵 Installer Node.js

```yaml
- task: NodeTool@0
  inputs:
    versionSpec: '18.x'

```

### 🔵 Construire un conteneur Docker

```yaml
- task: Docker@2
  inputs:
    command: build
    Dockerfile: Dockerfile
    repository: myapp

```

### 🔵 Publier un artefact

```yaml
- task: PublishBuildArtifacts@1
  inputs:
    pathToPublish: 'dist'
    artifactName: 'build'

```

---

# 🟦 8. Comparaison pipeline YAML GitLab vs Azure

| Concept | GitLab | Azure DevOps |
| --- | --- | --- |
| Déclencheur | `only/except` ou `rules` | `trigger` |
| Agent | `image:` | `pool:` |
| Stages | `stages:` | `stages:` |
| Jobs | un job = un bloc | `jobs:` dans un stage |
| Artefacts | artefacts | PublishBuildArtifacts |
| Variables | variables: { ... } | variables: section |

👉 La logique est **quasi identique**.

---

# 🟦 9. Exemple complet d’un pipeline CI/CD moderne

```yaml
trigger:
  - main

variables:
  NODE_ENV: production

stages:
  - stage: Test
    displayName: 🔍 Tests
    jobs:
      - job: RunTests
        pool:
          vmImage: ubuntu-latest
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: '18.x'

          - script: |
              npm ci
              npm run test
            displayName: Run tests

  - stage: Build
    displayName: 🏗️ Build
    dependsOn: Test
    jobs:
      - job: BuildApp
        steps:
          - script: npm run build

  - stage: Deploy
    displayName: 🚀 Deploy to Azure
    dependsOn: Build
    jobs:
      - job: DeployWeb
        steps:
          - task: AzureWebApp@1
            inputs:
              appName: 'my-app'
              package: 'dist'

```

---

# 🟦 10. Bonnes pratiques CI/CD Azure DevOps

## 🔵 1. Toujours utiliser des pipelines YAML

→ versionné, traçable, réutilisable.

## 🔵 2. Séparer les stages : Test → Build → Deploy

→ indispensable pour l’intégration continue.

## 🔵 3. Utiliser des variables secrètes

Toutes les clés doivent être dans **Library > Variable Groups**.

## 🔵 4. Utiliser des environnements avec approbation

Azure permet :

- validations humaines
- verrous environnementaux
- politiques d’accès

## 🔵 5. Mutualiser avec des templates YAML

→ standardisation entreprise.

## 🔵 6. Utiliser les artefacts pour transmettre le build

→ pas refaire le build au moment du déploiement.

---

# 🟦 11. Commandes utiles CLI (Azure CLI)

### 🔵 Connexion

```bash
az login

```

### 🔵 Lister les organisations DevOps

```bash
az devops organization list

```

### 🔵 Lister les projets

```bash
az devops project list

```

### 🔵 Récupérer un pipeline

```bash
az pipelines show --name "PipelineName"

```

### 🔵 Lancer un pipeline

```bash
az pipelines run --name "PipelineName"

```

### 🔵 Lister les artefacts

```bash
az artifacts universal list --organization URL

```

👉 Très utile pour automatiser l’industrialisation.

---

# 🟦 12. Conclusion

Azure DevOps, c’est :

- une suite complète (Repos + Pipelines + Boards + Artifacts + Test Plans)
- une plateforme très mature pour les environnements Microsoft
- un système CI/CD basé sur YAML très puissant
- des pipelines modulaires (stages → jobs → steps)
- une compatibilité native avec Azure, Docker, Kubernetes, Terraform…

Tu as maintenant toutes les bases pour :

- créer tes pipelines
- comprendre comment ils s’organisent
- commencer à automatiser ton projet
- aller vers des pipelines avancés (multi-stages, CD, déploiements approuvés, templates…)

---
[← Module précédent](M18_Cours_GitLab_Runner.md) | [Module suivant →](M18_flake8.md)
---
