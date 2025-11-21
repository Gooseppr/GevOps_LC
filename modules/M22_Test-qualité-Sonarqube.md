---
title: Test de montée en charge - Locust & Artillery
sujet: Déploiement Continu (CD), Intégration continue (CI)
type: module
jour: 22
ordre: 1
tags: cd, test, sonarqube, java, devops
---

# 🧩 Cours : Tests de qualité et de sécurité du code – SonarQube & SonarCloud

## 🎯 Objectifs pédagogiques

À la fin de ce module, tu sauras :

- Comprendre les enjeux de la **qualité** et de la **sécurité** du code source.
- Identifier les **types de problèmes** détectés par une analyse statique.
- Installer et utiliser **SonarQube** localement (Linux, Windows, Docker).
- Intégrer SonarQube dans une **pipeline CI/CD** (ex : GitLab).
- Découvrir **SonarCloud**, la version SaaS de SonarQube, et ses cas d’usage.

---

## 1. 🌍 Introduction à la qualité et la sécurité du code

### Pourquoi analyser la qualité du code ?

Un bon code n’est pas seulement celui qui “fonctionne” :

il doit aussi être **fiable, maintenable, performant et sécurisé**.

### Problématiques courantes

| Catégorie | Description | Exemple |
| --- | --- | --- |
| 🪲 **Bugs cachés** | Erreurs de logique, fuites mémoire, exceptions non gérées | Une boucle infinie silencieuse, un mauvais appel d’API |
| 🧩 **Code smell** | Mauvaises pratiques de conception qui rendent le code difficile à maintenir | Fonctions trop longues, duplication de logique |
| 🔐 **Vulnérabilités** | Failles de sécurité exploitables par des attaquants | Injection SQL, XSS, dépendances non sécurisées |
| 🧠 **Dette technique** | Ensemble des problèmes accumulés dans le temps | Code non documenté, tests manquants |

### But des outils d’analyse statique

- **Anticiper les problèmes avant la mise en production.**
- **Standardiser les pratiques de développement.**
- **Mesurer la qualité du projet dans le temps.**

---

## 2. ⚙️ Qu’est-ce que SonarQube ?

**SonarQube** est un outil open source d’analyse **statique** du code.

Il scanne le code source sans l’exécuter pour détecter des anomalies selon des **règles prédéfinies**.

### 🔍 Principales fonctionnalités

- **Analyse multi-langages** : +30 langages (Python, Java, JS, C#, etc.)
- **Indicateurs clés** :
    - **Bugs** : erreurs logiques susceptibles de provoquer un dysfonctionnement.
    - **Vulnerabilities** : failles de sécurité connues.
    - **Code smells** : mauvaises pratiques de conception.
    - **Coverage** : pourcentage de code couvert par les tests unitaires.
    - **Duplications** : portions de code identiques.
- **Tableaux de bord visuels** (Quality Gates, tendances, graphiques).
- **Intégration continue** : compatible avec GitLab, GitHub, Jenkins, Azure DevOps, etc.

---

## 3. 🧱 Architecture et fonctionnement

1. **Scanner** (client)
    
    → Envoie le code et les métadonnées à SonarQube.
    
2. **Serveur SonarQube**
    
    → Analyse les résultats et calcule les indicateurs.
    
3. **Base de données**
    
    → Stocke les résultats d’analyse et les historiques.
    
4. **Interface Web (port 9000)**
    
    → Présente le tableau de bord de qualité du projet.
    

---

## 4. 🧰 Installation de SonarQube

### ⚠️ Prérequis communs

- **Java JDK ≥ 11**
    
    ```bash
    sudo apt update
    sudo apt install default-jdk -y
    java -version
    
    ```
    
- Compte utilisateur ayant accès à `/opt`
- Port **9000** libre sur la machine

---

### 🐧 Installation sur Linux (VM Debian / Ubuntu)

```bash
# 1. Télécharger SonarQube
wget https://binaries.sonarsource.com/Distribution/sonarqube/sonarqube-10.4.1.88267.zip

# 2. Extraire et déplacer
sudo unzip sonarqube-10.4.1.88267.zip -d /opt/
sudo mv /opt/sonarqube-10.4.1.88267 /opt/sonarqube

# 3. Créer un utilisateur dédié
sudo useradd sonar
sudo chown -R sonar:sonar /opt/sonarqube

# 4. Lancer le service
sudo -u sonar /opt/sonarqube/bin/linux-x86-64/sonar.sh start

# 5. Vérifier
sudo -u sonar /opt/sonarqube/bin/linux-x86-64/sonar.sh status

```

🖥️ Accès à l’interface :

👉 http://localhost:9000

**Login :** `admin` / **Password :** `admin`

---

### 🪟 Installation sur Windows

1. Télécharger la version Windows sur [sonarqube.org/downloads](https://www.sonarqube.org/downloads/).
2. Extraire le dossier (ex : `C:\SonarQube`).
3. Configurer le JDK (JAVA_HOME).
4. Lancer :
    
    ```powershell
    cd C:\SonarQube\bin\windows-x86-64
    StartSonar.bat
    
    ```
    
5. Ouvrir http://localhost:9000 (admin/admin).

---

### 🐳 Installation via Docker

```bash
docker run -d \
  --name sonarqube \
  -p 9000:9000 \
  sonarqube:lts

```

📁 Données persistantes :

```bash
docker volume create sonarqube_data
docker volume create sonarqube_extensions
docker run -d \
  --name sonarqube \
  -p 9000:9000 \
  -v sonarqube_data:/opt/sonarqube/data \
  -v sonarqube_extensions:/opt/sonarqube/extensions \
  sonarqube:lts

```

---

## 5. 🔗 Intégration dans GitLab CI/CD

SonarQube s’intègre parfaitement dans un pipeline d’intégration continue.

Voici un exemple simple dans un fichier `.gitlab-ci.yml` :

```yaml
stages:
  - test
  - quality

variables:
  SONAR_HOST_URL: "http://sonarqube:9000"
  SONAR_LOGIN: "${SONAR_TOKEN}"

sonarqube-check:
  stage: quality
  image: sonarsource/sonar-scanner-cli:latest
  script:
    - sonar-scanner \
        -Dsonar.projectKey=my_project \
        -Dsonar.sources=. \
        -Dsonar.host.url=$SONAR_HOST_URL \
        -Dsonar.login=$SONAR_LOGIN
  only:
    - main

```

### 📦 Dans Docker Compose

```yaml
services:
  sonarqube:
    image: sonarqube:lts
    ports:
      - "9000:9000"
    environment:
      - SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true
  gitlab-runner:
    image: gitlab/gitlab-runner:latest

```

---

## 6. ☁️ SonarCloud : la version SaaS de SonarQube

### Différences principales

| Critère | **SonarQube** | **SonarCloud** |
| --- | --- | --- |
| Hébergement | Local (on-premise, Docker, VM) | Cloud (géré par SonarSource) |
| Accès | Interface locale | Interface web : [https://sonarcloud.io](https://sonarcloud.io/) |
| Configuration | Manuelle | Automatique via intégration GitHub/GitLab |
| Tarification | Gratuit (Community) ou payant (Enterprise) | Gratuit pour projets open source |
| CI/CD | Intégré avec pipelines locaux | Intégré aux pipelines GitHub/GitLab/Bitbucket |

### Exemple d’utilisation avec GitHub Actions

```yaml
name: SonarCloud Analysis

on:
  push:
    branches: [ main ]

jobs:
  sonarcloud:
    name: SonarCloud Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@master
        with:
          args: >
            -Dsonar.projectKey=my_project
            -Dsonar.organization=my_org
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

```

---

## 7. 📈 Lecture et interprétation des résultats

| Indicateur | Signification | Seuil critique |
| --- | --- | --- |
| **Reliability** | Taux de bugs détectés | Aucune erreur critique |
| **Security** | Nombre de vulnérabilités | 0 vulnérabilité majeure |
| **Maintainability** | Dette technique en jours | < 5 % du temps de dev |
| **Coverage** | Taux de couverture par les tests | > 80 % conseillé |
| **Duplications** | Code dupliqué | < 3 % |

💡 *SonarQube affiche une note globale (A à E) sur chaque axe et un statut global : “Passed” ou “Failed” selon les Quality Gates.*

---

## 8. 🚀 Commandes et utilisation du scanner

### Installation du scanner CLI

### Sous Linux :

```bash
sudo apt install unzip
wget https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-5.0.1.zip
unzip sonar-scanner-cli-5.0.1.zip -d /opt/
sudo ln -s /opt/sonar-scanner-5.0.1/bin/sonar-scanner /usr/local/bin/sonar-scanner

```

### Exemple d’analyse manuelle :

```bash
sonar-scanner \
  -Dsonar.projectKey=my_project \
  -Dsonar.sources=src \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=my_token

```

---

## 9. 🧠 Bonnes pratiques

- Lancer une **analyse avant chaque merge** vers la branche principale.
- Configurer un **Quality Gate** pour bloquer les commits non conformes.
- Utiliser **SonarLint** (plugin IDE) pour corriger directement dans VSCode, PyCharm, Eclipse…
- Surveiller les **tendances** de dettes techniques dans le temps.
- Mettre à jour régulièrement SonarQube et les plugins de langage.

---

## 10. 🧩 Conclusion

Les outils comme **SonarQube** et **SonarCloud** s’inscrivent au cœur de la démarche **DevOps** :

ils assurent un **feedback continu** sur la qualité et la sécurité du code.

➡️ En automatisant ces vérifications :

- Les équipes gagnent en **fiabilité**,
- Le code devient **plus maintenable**,
- Et les risques de failles **diminuent drastiquement** avant la mise en production.