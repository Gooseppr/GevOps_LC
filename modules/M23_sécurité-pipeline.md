---
title: Sécurité des pipelines
type: module
jour: 23
ordre: 1
tags: ci, cd, test, trivy, hadolint, devsecops
---

# 🧱 Sécurité des pipelines CI/CD

---

## 🚀 Introduction

Les pipelines CI/CD (Continuous Integration / Continuous Delivery) automatisent :

1. Le **build** du code (compilation, packaging),
2. Les **tests**,
3. Le **déploiement**.

C’est le cœur du cycle de vie logiciel moderne.

Mais un pipeline est aussi un **maillon critique de confiance** :

il manipule du code, des dépendances, des secrets, et a accès à la production.

👉 Une faille à ce niveau = une compromission **totale** possible du système (code, serveurs, données).

---

## ⚠️ 1. Les menaces et risques concrets

### 🧠 Pourquoi c’est dangereux ?

Parce qu’un pipeline :

- s’exécute **automatiquement**, souvent sans surveillance,
- a des **droits étendus** (ex : déploiement, accès à des secrets),
- exécute du **code fourni par des utilisateurs** (pull requests externes).

### ⚔️ Exemples de menaces réelles

| Situation | Description | Conséquence |
| --- | --- | --- |
| **Pull Request malveillant** | Un contributeur injecte un script dangereux dans le code ou le `.gitlab-ci.yml` | Exfiltration de secrets, suppression de données |
| **Clé API exposée** | Une variable sensible est commitée dans le dépôt | Accès complet à AWS, GitLab, ou Docker Hub |
| **Image Docker falsifiée** | Une image “officielle” mais modifiée contient un malware | Exécution de code malveillant dans ton environnement |
| **Artefact non signé** | Un binaire modifié après le build | Déploiement d’un exécutable corrompu |
| **Dépendance vulnérable** | Une version de librairie compromise (ex: Log4j) | Exécution de code distant, fuite de données |

---

## 🧩 2. Le DevSecOps : intégrer la sécurité dans le cycle DevOps

### 🧠 Concept

**DevSecOps = Development + Security + Operations**

Ce n’est pas une étape en plus :

> c’est l’idée que chaque action automatisée doit être aussi sécurisée qu’elle est fiable.
> 

L’objectif :

- La **sécurité devient continue**,
- Elle est **testée, mesurée et auditée** comme n’importe quel code.

### ⚙️ En pratique

- Les pipelines lancent automatiquement :
    - des **scans de vulnérabilités**,
    - des **tests de sécurité (SAST, DAST)**,
    - des **vérifications de signature et d’intégrité**.
- Les résultats sont visibles dans les rapports CI/CD.

### 🧰 Outils typiques

- **SAST (Static Analysis Security Testing)** : Bandit, SonarQube, GitLab SAST
- **DAST (Dynamic Application Security Testing)** : OWASP ZAP
- **SCA (Software Composition Analysis)** : Dependency-Check, Trivy

---

## ⏪ 3. Le principe du “Shift Left”

### 🧠 Concept

Traditionnellement, on testait la sécurité **en fin de cycle**.

Résultat : les problèmes étaient découverts **trop tard**.

> Le “Shift Left” consiste à déplacer la sécurité vers le début du processus.
> 

### ⚠️ Risque si on ne le fait pas

Découvrir une faille après le déploiement signifie :

- Correction coûteuse (rollback, patch urgent),
- Image de marque dégradée,
- Exposition temporaire de données sensibles.

### 🔧 Application concrète

1. **Avant le commit** :
    - Linting, formattage, scan de secrets.
    - Hooks locaux (`pre-commit`, `pre-push`).
2. **Avant le merge** :
    - Scans automatiques CI/CD (SAST, SCA, Trivy).
    - Revue humaine obligatoire.
3. **Avant le déploiement** :
    - Vérification de signatures.
    - Validation de conformité.

### 🧰 Outils utiles

- **Husky** (NodeJS) ou **pre-commit** (Python)
- **Commitlint** pour normaliser les messages
- **TruffleHog / Gitleaks** pour détecter des secrets dans le code

---

## 🧱 4. Sécuriser les pipelines CI/CD

### 🧠 Pourquoi c’est crucial

Les pipelines sont des exécutants automatiques avec **des droits très élevés**.

Si un acteur malveillant modifie une étape, il peut :

- injecter du code dans les builds,
- détourner des credentials,
- redéployer des artefacts corrompus.

---

### 🧰 Trois niveaux de protection

| Niveau | Objectif | Exemples |
| --- | --- | --- |
| **Politiques** | Définir qui peut faire quoi | “Seuls les mainteneurs peuvent lancer le déploiement” |
| **Scans** | Vérifier automatiquement le code et les dépendances | SAST, SCA, Trivy |
| **Barrières** | Empêcher la compromission | Signature, validation, blocage de MR |

---

## 🔐 5. Protection des branches

### ⚠️ Risque

Un push direct sur `main` ou `prod` peut déployer :

- du code non testé,
- du code malveillant,
- une suppression accidentelle.

### 🔧 Bonne pratique

Toujours imposer un **Merge Request** :

- Au moins une **revue humaine**,
- Validation automatique du pipeline.

**GitLab :**

- Paramètre → *Protected branches → Require merge request approval.*

**Blocage dans le pipeline :**

```yaml
only:
  - merge_requests

```

---

## 👀 6. Protection des Merge Requests

### 🧠 Pourquoi

Même un développeur interne peut introduire une erreur critique ou un code vulnérable.

### ⚙️ Comment faire

- Imposer **une approbation minimum** avant merge,
- Coupler à une **vérification automatique** :
    - SAST (analyse du code statique),
    - Lint,
    - Tests unitaires.

Exemple GitLab :

```yaml
stages:
  - lint
  - security

sast:
  stage: security
  script:
    - gitlab-sast scan
  allow_failure: false

```

---

## 🔒 7. Protection des secrets

### ⚠️ Risque

Un secret exposé = accès complet au système.

Et Git conserve **l’historique des commits**, donc même supprimé, le secret reste traçable.

### 🧰 Bonnes pratiques

- **Jamais dans le code** : utiliser les *variables CI/CD* (GitLab, GitHub Actions).
- **Variables masquées et protégées** :
    - `masked: true` empêche l’affichage dans les logs,
    - `protected: true` limite l’usage aux branches protégées.
- **Rotation régulière des clés** (tous les X jours),
- **Vault** pour centraliser et chiffrer les secrets.

### 🔧 Exemple

```yaml
variables:
  AWS_ACCESS_KEY_ID:
    value: "xxxx"
    masked: true
    protected: true

```

---

## 🧰 8. Sécuriser les accès CI/CD

### 🧠 Pourquoi

Les tokens CI/CD ont souvent un accès complet à ton dépôt ou ton infra cloud.

### ⚠️ Risques

- Token réutilisé dans un autre projet → fuite de code,
- Token non expiré → exploitable indéfiniment.

### 🔧 Contremesures

- Clés **spécifiques au pipeline**, jamais personnelles.
- Rotation régulière (tokens courts).
- Restreindre les permissions (“lecture seule” si possible).
- Filtrer par IP ou projet.

---

## 🧮 9. Sécurité des dépendances (SCA)

### 🧠 Pourquoi

Ton application dépend de dizaines (parfois centaines) de bibliothèques.

Une seule version compromise = porte d’entrée.

Exemple : Log4j, SolarWinds, left-pad, etc.

### ⚠️ Risques

- Vulnérabilité connue (CVE),
- Package falsifié (supply chain attack),
- Dépendance non maintenue.

### 🔧 Outil : OWASP Dependency-Check

Analyse les bibliothèques et détecte les versions vulnérables.

```bash
dependency-check.sh --project "mon-app" --scan . --format HTML --out report/

```

👉 Fait échouer le pipeline si faille critique :

```yaml
script:
  - dependency-check.sh ...
  - grep -q "CRITICAL" report/ || exit 1

```

---

## 🐳 10. Sécurité Docker

### 🧠 Pourquoi Docker est un point faible

Une image Docker exécute du code tiers avec des droits élevés.

Les risques :

- Image piratée (avec malware),
- Paquets vulnérables,
- Utilisation de `root` dans le conteneur.

---

### 🔧 Hadolint

Analyse ton `Dockerfile` :

- Interdit `FROM python:latest`,
- Vérifie les `RUN apt-get update && apt-get install`,
- Signale l’usage de `root`.

```bash
docker run --rm -i hadolint/hadolint < Dockerfile

```

---

### 🔧 Trivy

Scanne **l’image construite** :

- Vérifie les paquets,
- Détecte des secrets,
- Classe les vulnérabilités par gravité.

```bash
trivy image monimage:latest

```

💡 Tu peux faire échouer le job si vulnérabilité critique :

```bash
trivy image monimage:latest --exit-code 1 --severity CRITICAL

```

---

## 🧾 11. Signature et intégrité des artefacts

### ⚠️ Risque

Un binaire ou une image peut être remplacé **après le build**, avant déploiement.

C’est une attaque sur la **chaîne d’approvisionnement logicielle (supply chain)**.

### 🔧 Cosign (Sigstore)

Cosign signe ton artefact avec une clé privée et vérifie la signature avant déploiement.

```bash
cosign sign --key cosign.key monimage:latest
cosign verify --key cosign.pub monimage:latest

```

➡️ Tu bloques le déploiement si la signature ne correspond pas :

```yaml
script:
  - cosign verify --key cosign.pub monimage:latest || exit 1

```

---

## 📊 12. Lire un rapport de sécurité

Un rapport de scan doit t’aider à **prioriser** :

| Élément | Description |
| --- | --- |
| 📁 Localisation | fichier, dépendance |
| 🧩 Type | vulnérabilité, erreur logique |
| 🚦 Gravité | Low / Medium / High / Critical |
| 💡 Recommandation | mise à jour, suppression, patch |

> Dans GitLab : onglet Security & Compliance ou fichiers .json / .html d’analyse.
> 

---

## 🔔 13. Alertes et blocage automatique

### 🧠 Pourquoi

Laisser passer un build vulnérable, c’est repousser un problème.

### 🔧 Mise en place

- Utiliser les seuils de gravité :
    
    ```bash
    trivy image app:latest --exit-code 1 --severity CRITICAL
    
    ```
    
- Déclencher une **alerte Slack / Email** si faille critique :
    
    ```yaml
    script:
      - trivy image app:latest --format json --output report.json
      - python notify_if_critical.py
    
    ```
    

---

## ⚙️ 14. Sécurité locale : hooks et formatage

### 🧠 Pourquoi

La sécurité commence **avant le push**.

### 🔧 Git Hooks

Scripts automatiques locaux :

- `pre-commit` : scan, lint, formatage, détection de secrets, etc.
- `pre-push` : empêche les pushes directs sur branches sensibles.

Exemple :

```bash
#!/bin/bash
black .
flake8 .
trufflehog .

```

---

### 🧹 Linting et formatage

- **Linting** (ESLint, Flake8) : détecte des erreurs et des failles logiques.
- **Formatage** (Black, Prettier) : garantit un style uniforme.
- **Bénéfices :**
    - Moins de conflits Git,
    - Plus de lisibilité,
    - Moins de fautes humaines.

---

### 📝 Messages de commit normés

> Un historique propre = un projet traçable et lisible.
> 

Format standard :

```
<type>(<scope>): <subject>

```

Exemples :

```
feat(api): add new endpoint
fix(docker): correct port mapping
docs(readme): update usage examples

```

💡 Des outils comme **Commitlint** ou **Conventional Commits** valident ce format automatiquement.

---

### 🚫 Blocage des push directs

Même si GitLab bloque déjà les `push` directs sur `main`,

tu peux ajouter une **protection locale** :

```bash
#!/bin/bash
branch=$(git rev-parse --abbrev-ref HEAD)
if [[ "$branch" == "main" || "$branch" == "prod" ]]; then
  echo "Push direct interdit sur $branch"
  exit 1
fi

```

---

## 🧠 Résumé global

| Domaine | Risque | Contremesure | Outils |
| --- | --- | --- | --- |
| 🔒 Secrets | Fuite de clés/API | Variables protégées, Vault | GitLab CI, HashiCorp Vault |
| 🧾 Code | Failles dans le code | Scan statique, revue humaine | Bandit, SonarQube |
| 📦 Dépendances | CVE connues | Analyse SCA | OWASP Dependency-Check, Trivy |
| 🐳 Docker | Malware, vulnérabilité | Scan Dockerfile et images | Hadolint, Trivy |
| 🔏 Artefacts | Corruption | Signature | Cosign |
| 🔐 Accès | Token volé | Limiter durée et droits | GitLab policies |
| 🧰 Branches | Push accidentel | MR obligatoire | GitLab protected branches |
| 🔔 Alertes | Faille ignorée | Notifications | Slack, GitLab Notifier |

---

## 💬 À retenir

> Un pipeline non sécurisé est une autoroute pour les attaquants.
> 
> 
> La sécurité doit être visible, mesurable et intégrée **dès la première ligne de code**.
>