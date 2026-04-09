---
layout: page
title: Sécurité des pipelines
sujet: Intégration continue (CI)
type: module
jour: 24
ordre: 1
tags: jenkins, ci, cd, test, devops
---

# ⚙️ Cours : Jenkins – Automatisation et CI/CD Open Source

## 🎯 Objectifs pédagogiques

À la fin de ce module, tu sauras :

- Comprendre le rôle de **Jenkins** dans la chaîne CI/CD.
- Installer et configurer Jenkins sur différents environnements.
- Créer et structurer des **pipelines Groovy (Jenkinsfile)**.
- Gérer les **agents, credentials et plugins**.
- Comparer Jenkins à d’autres solutions CI/CD (GitLab, GitHub Actions, Azure DevOps).

---

## 1. 🧩 Introduction à Jenkins

### Qu’est-ce que Jenkins ?

**Jenkins** est un **serveur d’automatisation open source**, principalement utilisé pour :

- l’**Intégration Continue (CI)** : automatiser les builds et tests à chaque commit,
- le **Déploiement Continu (CD)** : déployer automatiquement les applications sur différents environnements.

Il permet de :

- compiler du code,
- exécuter des tests unitaires ou de sécurité,
- effectuer des analyses de qualité,
- déployer sur des serveurs, conteneurs, clusters Kubernetes, etc.

---

### Jenkins en quelques mots

| Élément | Description |
| --- | --- |
| 🧱 Type | Serveur CI/CD auto-hébergé |
| 🪶 Licence | Open Source (MIT) |
| 🧩 Extensible | Basé sur un **système de plugins** |
| 🖥️ Interface | Web UI complète (tableaux de bord, logs, jobs, etc.) |
| 🔁 Langage Pipeline | Groovy (DSL spécifique appelé *Declarative Pipeline*) |
| 🔐 Sécurité | Gestion intégrée des credentials et des rôles |

---

## 2. 🧠 Architecture et fonctionnement général

### Architecture modulaire

```
    +--------------------+
    |     Jenkins UI     |   → Interface web (tableau de bord)
    +--------------------+
              ↓
    +--------------------+
    |     Controller     |   → Cœur du serveur Jenkins
    +--------------------+
              ↓
    +--------------------+
    |      Agents        |   → Machines qui exécutent les jobs
    +--------------------+

```

- **Controller (anciennement Master)** : gère la configuration, planifie les builds, supervise les agents.
- **Agent (ou Node)** : exécute réellement les tâches (build, tests, déploiement).
- **Jobs/Pipelines** : scripts d’automatisation à exécuter.
- **Plugins** : ajoutent des fonctionnalités (Git, Docker, SonarQube, Kubernetes, etc.).

---

## 3. ⚙️ Installation de Jenkins

### 📦 Prérequis

- **Java JDK 11 ou 17**
- Ports ouverts : **8080** (par défaut)
- Un utilisateur ayant les droits d’exécution de services
- (optionnel) Docker, Git, Node, Maven selon tes projets

---

### 🐧 Installation sur Linux (Debian/Ubuntu)

```bash
sudo apt update
sudo apt install fontconfig openjdk-17-jre -y

# Ajouter le dépôt Jenkins officiel
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null

echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

sudo apt update
sudo apt install jenkins -y

# Démarrer Jenkins
sudo systemctl enable jenkins
sudo systemctl start jenkins

# Vérifier
sudo systemctl status jenkins

```

👉 Accéder à l’interface : http://localhost:8080

**Mot de passe d’admin initial :**

```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword

```

---

### 🪟 Installation sur Windows

1. Télécharger le package MSI sur [jenkins.io/download](https://www.jenkins.io/download/).
2. Installer Java 11 ou 17.
3. Lancer l’installeur Jenkins (il crée un service Windows).
4. Ouvrir l’interface sur `http://localhost:8080`.
5. Entrer le mot de passe initial (fourni dans `C:\Program Files\Jenkins\secrets`).

---

### 🐳 Installation via Docker

```bash
docker run -d \
  --name jenkins \
  -p 8080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  jenkins/jenkins:lts-jdk17

```

🔹 Jenkins sera accessible sur http://localhost:8080

---

## 4. 🧩 Premier démarrage et configuration

Lors du premier accès :

1. Jenkins demande la **clé d’administration**.
2. Il propose d’**installer les plugins recommandés**.
3. Tu peux ensuite :
    - Créer ton premier utilisateur,
    - Configurer un agent,
    - Connecter ton dépôt Git (GitLab, GitHub…).

---

## 5. 🧠 Le Jenkinsfile : le cœur de Jenkins

Le **Jenkinsfile** décrit ton pipeline CI/CD.

Il est écrit en **Groovy DSL**, ce qui permet :

- des **structures conditionnelles**,
- des **boucles**,
- des **fonctions personnalisées**,
- et une grande **flexibilité**.

---

### 📄 Exemple basique

```groovy
pipeline {
    agent any
    stages {
        stage('Install') {
            steps {
                sh 'npm install'
            }
        }
        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
    }
}

```

🧠 **agent any** → exécute sur n’importe quel agent disponible

🧱 **stages** → grandes étapes logiques (Install, Test, Build…)

🪜 **steps** → instructions concrètes à exécuter

---

### 🧰 Exemple avec variables et credentials

```groovy
pipeline {
    agent any
    environment {
        APP_ENV = 'production'
    }
    stages {
        stage('Deploy') {
            steps {
                withCredentials([string(credentialsId: 'ssh-key', variable: 'SSH_KEY')]) {
                    sh 'scp -i $SSH_KEY build.zip user@server:/var/www/app/'
                }
            }
        }
    }
}

```

💡 Les **credentials** sont gérés dans Jenkins et masqués dans les logs.

---

## 6. 🧱 Types de pipelines

| Type | Description |
| --- | --- |
| **Freestyle Job** | Interface graphique simple (pas de Jenkinsfile) |
| **Declarative Pipeline** | Syntaxe structurée (pipeline { ... }) |
| **Scripted Pipeline** | Syntaxe Groovy libre, plus flexible |
| **Multibranch Pipeline** | Détecte automatiquement les branches Git |
| **Matrix Pipeline** | Exécute des tests sur plusieurs environnements (OS, versions, etc.) |

---

## 7. 🔗 Intégration avec Git

### Connexion SSH GitLab / GitHub

1. Génère une clé SSH sur le serveur Jenkins :
    
    ```bash
    ssh-keygen -t ed25519 -C "jenkins"
    
    ```
    
2. Copie la clé publique dans ton dépôt GitLab/GitHub.
3. Ajoute la clé privée dans Jenkins :
    - Dashboard → Manage Jenkins → Credentials → Add → SSH Key.
4. Jenkins peut maintenant **cloner ton dépôt** automatiquement.

---

### Exemple de déclenchement automatique

Jenkins peut détecter un **webhook** :

- À chaque **push** dans GitLab/GitHub,
- Jenkins déclenche le pipeline correspondant.

---

## 8. 🔌 Les plugins Jenkins

Jenkins tire sa puissance de ses **plugins**.

Il en existe plus de **1800** : intégrations, outils, notifications, etc.

| Plugin | Utilité |
| --- | --- |
| **Git / GitLab / GitHub** | Connexion au SCM |
| **Docker / Docker Pipeline** | Build & push d’images |
| **SonarQube** | Analyse de qualité du code |
| **Slack / Discord** | Notifications |
| **Kubernetes** | Déploiement automatique sur cluster |
| **Blue Ocean** | Interface visuelle moderne des pipelines |

Installation via :

**Manage Jenkins → Plugins → Available Plugins**

---

## 9. 🧠 Techniques avancées

### 🎯 Objectifs

- Maîtriser l’écriture de pipelines **déclaratifs** et **scriptés** pour des cas complexes.
- Savoir combiner **séries/parallèle/matrice** efficacement.
- Utiliser **conditions, boucles, credentials, agents, timeouts, retries, verrous, artefacts**.
- Connaître les **commandes CLI** indispensables de Jenkins.

---

### Rappels rapides (contexte)

- **Deux syntaxes** :
    - *Declarative Pipeline* (`pipeline { ... }`) : plus lisible, validation stricte.
    - *Scripted Pipeline* (pur Groovy) : ultra flexible (boucles/conditions dynamiques).
- **Agents** : où s’exécutent les étapes (node, label, Docker, Kubernetes).
- **Stages/Steps** : structure logique (stages) + commandes concrètes (steps).
- **Credentials** : jamais en clair ; injectés via `withCredentials`.

---

### Exécution **en série** (pipeline standard)

Par défaut, les stages d’un pipeline se succèdent **en série**.

```groovy
pipeline {
  agent any
  stages {
    stage('Install') {
      steps { sh 'npm ci' }
    }
    stage('Test') {
      steps { sh 'npm test' }
    }
    stage('Build') {
      steps { sh 'npm run build' }
    }
    stage('Package') {
      steps { sh 'tar -czf build.tgz dist/' }
    }
  }
}

```

🔎 Astuces série :

- Découper finement pour des logs lisibles.
- Ajouter `post { always { ... } }` pour des actions communes (voir §7).

---

### Exécution **parallèle**

Idéale pour **accélérer** les pipelines (tests frontend/backend, lint multi-langage, etc.).

#### Parallèle (déclaratif)

```groovy
pipeline {
  agent any
  stages {
    stage('Tests en parallèle') {
      parallel {
        stage('Lint JS') { steps { sh 'npm run lint' } }
        stage('Unit JS') { steps { sh 'npm test' } }
        stage('Unit Python') {
          agent { label 'python' }
          steps { sh 'pytest -q' }
        }
      }
    }
  }
}

```

#### Parallèle **dynamique** (scripted)

Pour créer les branches parallèles **à la volée** (ex. liste de services).

```groovy
def services = ['api', 'web', 'worker']
def branches = [:]

services.each { svc ->
  branches["test-${svc}"] = {
    node('linux') {
      stage("Test ${svc}") {
        sh "make test SERVICE=${svc}"
      }
    }
  }
}

pipeline {
  agent none
  stages {
    stage('Tests dynamiques') {
      steps {
        script {
          parallel branches
        }
      }
    }
  }
}

```

---

### Pipelines **en matrice**

Tester plusieurs combinaisons (OS, version de runtime, architecture, etc.).

#### Matrice (déclaratif)

```groovy
pipeline {
  agent any
  stages {
    stage('Matrix CI') {
      matrix {
        axes {
          axis { name 'OS'; values 'ubuntu', 'alpine' }
          axis { name 'NODE_VER'; values '18', '20' }
        }
        agent { label 'docker' }
        stages {
          stage('Install') { steps { sh 'npm ci' } }
          stage('Test') {
            steps {
              sh 'node -v'
              sh 'npm test'
            }
          }
        }
        post {
          always {
            echo "Fin combinaison OS=${OS}, NODE_VER=${NODE_VER}"
          }
        }
      }
    }
  }
}

```

#### Matrice custom (scripted)

Utile si tu veux **filtrer/assembler** tes combinaisons à la main.

```groovy
def axes = [
  [os: 'ubuntu', node: '18'],
  [os: 'ubuntu', node: '20'],
  [os: 'alpine', node: '20']
]

pipeline {
  agent none
  stages {
    stage('Matrix scripted') {
      steps {
        script {
          def branches = [:]
          axes.each { combo ->
            def key = "${combo.os}-${combo.node}"
            branches[key] = {
              node('docker') {
                stage("Install ${key}") { sh 'npm ci' }
                stage("Test ${key}")   { sh "echo Testing on ${key} && npm test" }
              }
            }
          }
          parallel branches
        }
      }
    }
  }
}

```

---

### **Boucles** `each` et `for`, **conditions** `if`

Dans un pipeline **déclaratif**, place tes constructions Groovy dans un bloc `script { ... }`.

```groovy
pipeline {
  agent any
  stages {
    stage('Boucles & conditions') {
      steps {
        script {
          def modules = ['auth', 'billing', 'catalog']

          // each
          modules.each { m ->
            sh "echo Analyse du module: ${m}"
          }

          // for
          for (int i = 0; i < modules.size(); i++) {
            sh "echo Test indexé: ${modules[i]}"
          }

          // if / else
          def deployEnv = params.DEPLOY_ENV ?: 'dev'
          if (deployEnv == 'prod') {
            echo 'Déploiement production'
          } else if (deployEnv == 'staging') {
            echo 'Déploiement staging'
          } else {
            echo 'Déploiement dev'
          }
        }
      }
    }
  }
  parameters {
    choice(name: 'DEPLOY_ENV', choices: ['dev','staging','prod'], description: 'Cible de déploiement')
  }
}

```

---

### **Conditions** de stage (directive `when`)

Contrôle l’exécution d’un stage **sans Groovy**.

```groovy
stage('Deploy Prod') {
  when {
    branch 'main'
    expression { return params.DEPLOY_ENV == 'prod' }
  }
  steps {
    sh './deploy-prod.sh'
  }
}

```

Autres prédicats utiles : `changeset`, `environment name: 'VAR', value: 'X'`, `not`, `allOf`, `anyOf`, `beforeAgent true`.

---

### **Agents** avancés (Docker, labels, none)

#### Agent Docker (isolation out-of-the-box)

```groovy
pipeline {
  agent {
    docker {
      image 'node:20-alpine'
      args '-u root:root'   // si tu dois écrire dans le workspace
    }
  }
  stages {
    stage('Lint') { steps { sh 'npm ci && npm run lint' } }
  }
}

```

#### Agent par stage

```groovy
pipeline {
  agent none
  stages {
    stage('Python tests') {
      agent { docker { image 'python:3.12' } }
      steps { sh 'pytest -q' }
    }
    stage('Node build') {
      agent { docker { image 'node:20' } }
      steps { sh 'npm ci && npm run build' }
    }
  }
}

```

---

### **Robustesse** : `timeout`, `retry`, `post`, `catchError`, `warnError`

```groovy
pipeline {
  agent any
  options {
    timeout(time: 20, unit: 'MINUTES') // Timeout global
  }
  stages {
    stage('Flaky Step with retry') {
      steps {
        retry(3) {
          sh 'curl -sfL https://service/health'  // relance 3 fois si échec
        }
      }
    }
  }
  post {
    always {
      archiveArtifacts artifacts: 'build/**', fingerprint: true
      junit 'reports/junit/*.xml'
    }
    success { echo '✅ Pipeline OK' }
    failure { echo '❌ Pipeline KO' }
    unstable { echo '⚠️ Pipeline instable' }
    changed { echo 'ℹ️ Statut différent du run précédent' }
  }
}

```

`catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE')` permet de **ne pas casser tout** le pipeline.

---

### **Flux d’artefacts** : `stash/unstash`, `archiveArtifacts`

Passer des fichiers entre stages (utile en **parallèle** ou avec **agents différents**).

```groovy
stage('Build') {
  steps {
    sh 'npm run build'
    stash name: 'bundle', includes: 'dist/**'
  }
}
stage('Scan') {
  steps {
    unstash 'bundle'
    sh 'trivy fs dist/'
  }
}

```

Archiver pour téléchargement depuis l’UI Jenkins :

```groovy
archiveArtifacts artifacts: 'dist/**', fingerprint: true

```

---

### **Entrées utilisateur** : `input`

Stoppe le pipeline en attendant une **validation humaine**.

```groovy
stage('Approval') {
  steps {
    timeout(time: 10, unit: 'MINUTES') {
      input message: 'Déployer en Production ?', ok: 'Oui, déployer'
    }
  }
}

```

---

### **Verrous** (environnements partagés) : `lock`, `throttle`

Évite les déploiements concurrents sur la **même ressource**.

```groovy
stage('Deploy Prod') {
  steps {
    lock(resource: 'prod-cluster') {
      sh './deploy-prod.sh'
    }
  }
}

```

> Pour limiter N builds en parallèle d’un même job : Throttle Concurrent Builds plugin.
> 

---

### **Credentials** & secrets

Jamais en clair. Déclare dans **Manage Jenkins → Credentials**.

```groovy
withCredentials([
  string(credentialsId: 'gh-token', variable: 'GITHUB_TOKEN'),
  sshUserPrivateKey(credentialsId: 'gitlab-ssh', keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')
]) {
  sh 'curl -H "Authorization: Bearer $GITHUB_TOKEN" https://api.github.com/user'
  sh 'git -c core.sshCommand="ssh -i $SSH_KEY" fetch'
}

```

---

### **Qualité & Sécurité** dans Jenkins

Intègre facilement Sonar, SAST/DAST, container scan.

```groovy
stage('Quality Gate') {
  steps {
    withSonarQubeEnv('sonarqube-server') {
      sh 'sonar-scanner -Dsonar.projectKey=myproj -Dsonar.sources=src'
    }
  }
}
stage('SAST') { steps { sh 'owasp-dependency-check --scan .' } }
stage('Container Scan') { steps { sh 'trivy image myorg/app:latest' } }

```

---

### **Bibliothèques partagées** (Shared Libraries)

Factorise des fonctions réutilisables.

1. **Repo** `jenkins-shared-lib` avec `vars/util.groovy` :

```groovy
def call(String msg) {
  echo "UTIL: ${msg}"
}

```

1. Jenkins → *Manage Jenkins → Configure System → Global Pipeline Libraries*
    
    Nom: `lib`, URL Git: ton repo.
    
2. Jenkinsfile :

```groovy
@Library('lib') _
pipeline {
  agent any
  stages {
    stage('Use lib') { steps { util('Bonjour depuis la lib') } }
  }
}

```

---

### **Notifications** (Slack/Discord)

```groovy
post {
  failure {
    slackSend channel: '#ci', message: "🔴 ${env.JOB_NAME} #${env.BUILD_NUMBER} a échoué"
  }
}

```

---

### **Paramètres** & **déclencheurs**

```groovy
pipeline {
  agent any
  parameters {
    choice(name: 'ENV', choices: ['dev','staging','prod'], description: 'Cible')
    booleanParam(name: 'RUN_SECSCAN', defaultValue: true, description: 'Scan sécurité')
  }
  triggers {
    pollSCM('H/5 * * * *') // fallback si webhook pas possible
    cron('H 2 * * *')      // build quotidien
  }
}

```

---

### **CLI Jenkins** – commandes de base

Le **CLI** permet d’administrer Jenkins depuis un terminal.

#### Connexion

1. Récupère `jenkins-cli.jar` depuis `http://JENKINS_URL/jnlpJars/jenkins-cli.jar`.
2. Utilise un **API Token** (User → *Configure* → *API Token*).

```bash
java -jar jenkins-cli.jar -s http://localhost:8080 -auth USER:TOKEN help

```

#### Commandes utiles

```bash
# Lister les jobs
java -jar jenkins-cli.jar -s URL -auth USER:TOKEN list-jobs

# Lancer un build (avec paramètres)
java -jar jenkins-cli.jar -s URL -auth USER:TOKEN build JOB_NAME -p ENV=staging -s

# Afficher la config XML d’un job
java -jar jenkins-cli.jar -s URL -auth USER:TOKEN get-job JOB_NAME > job.xml

# Créer un job à partir d’un XML
java -jar jenkins-cli.jar -s URL -auth USER:TOKEN create-job NEW_JOB < job.xml

# Copier / Supprimer un job
java -jar jenkins-cli.jar -s URL -auth USER:TOKEN copy-job SRC_JOB DST_JOB
java -jar jenkins-cli.jar -s URL -auth USER:TOKEN delete-job JOB_NAME

# Installer un plugin
java -jar jenkins-cli.jar -s URL -auth USER:TOKEN install-plugin blueocean
java -jar jenkins-cli.jar -s URL -auth USER:TOKEN safe-restart

# Qui suis-je ?
java -jar jenkins-cli.jar -s URL -auth USER:TOKEN who-am-i

```

#### Gestion service (Linux)

```bash
sudo systemctl status jenkins
sudo systemctl restart jenkins
sudo journalctl -u jenkins -f

```

---

### **Exemple “tout-en-un”** — Avancé & réaliste

```groovy
@Library('lib') _
pipeline {
  agent none
  options {
    timeout(time: 30, unit: 'MINUTES')
    timestamps()
    ansiColor('xterm')
  }
  parameters {
    choice(name: 'DEPLOY_ENV', choices: ['dev','staging','prod'], description: 'Cible')
    booleanParam(name: 'RUN_SCANS', defaultValue: true, description: 'Activer scans sécurité')
  }
  triggers { pollSCM('H/10 * * * *') }

  stages {
    stage('Checkout') {
      agent { label 'linux' }
      steps {
        checkout scm
        stash name: 'src', includes: '**/*'
      }
      post { failure { echo 'Échec checkout' } }
    }

    stage('Lint & Unit (parallel)') {
      parallel {
        stage('Node') {
          agent { docker { image 'node:20' } }
          steps {
            unstash 'src'
            sh 'npm ci && npm run lint && npm test'
            stash name: 'node-artifacts', includes: 'coverage/**'
          }
        }
        stage('Python') {
          agent { docker { image 'python:3.12' } }
          steps {
            unstash 'src'
            sh 'pip install -r requirements.txt && pytest -q --junitxml=reports/junit.xml'
            junit 'reports/junit.xml'
          }
        }
      }
    }

    stage('Build') {
      agent { docker { image 'node:20' } }
      steps {
        unstash 'src'
        retry(2) {
          sh 'npm run build'
        }
        stash name: 'bundle', includes: 'dist/**'
        archiveArtifacts artifacts: 'dist/**', fingerprint: true
      }
    }

    stage('Quality Gate') {
      when { expression { return params.RUN_SCANS } }
      agent { label 'linux' }
      steps {
        withSonarQubeEnv('sonarqube-server') {
          sh 'sonar-scanner -Dsonar.projectKey=myproj -Dsonar.sources=.'
        }
      }
    }

    stage('Security Scans (parallel)') {
      when { expression { return params.RUN_SCANS } }
      parallel {
        stage('SCA (OWASP)') {
          agent { label 'linux' }
          steps {
            sh 'dependency-check.sh --scan . --format HTML --out reports/'
            archiveArtifacts 'reports/dependency-check-report.html'
          }
        }
        stage('Container') {
          agent { label 'docker' }
          steps {
            sh 'docker build -t myorg/app:${BUILD_NUMBER} .'
            sh 'trivy image --exit-code 0 myorg/app:${BUILD_NUMBER}'
          }
        }
      }
    }

    stage('Approval & Deploy') {
      when { anyOf { branch 'main'; expression { params.DEPLOY_ENV == 'prod' } } }
      stages {
        stage('Approval') {
          steps {
            timeout(time: 10, unit: 'MINUTES') {
              input message: "Déployer sur ${params.DEPLOY_ENV} ?", ok: 'Déployer'
            }
          }
        }
        stage('Deploy') {
          steps {
            lock(resource: "cluster-${params.DEPLOY_ENV}") {
              sh "./deploy.sh ${params.DEPLOY_ENV}"
            }
          }
        }
      }
    }
  }

  post {
    always {
      echo "Fin du run #${env.BUILD_NUMBER}"
      cleanWs()
    }
    success { echo '✅ Succès' }
    failure { echo '❌ Échec' }
    unstable { echo '⚠️ Instable' }
  }
}

```

---

## 10. 🔐 Sécurité et secrets

Les **credentials** Jenkins stockent :

- Tokens API (GitLab, DockerHub, SonarQube…)
- Clés SSH
- Mots de passe
- Certificats

Ils sont chiffrés et utilisables via :

```groovy
withCredentials([string(credentialsId: 'token', variable: 'TOKEN')]) {
    sh 'curl -H "Authorization: Bearer $TOKEN" ...'
}

```

---

## 11. 🏗️ Jenkins vs GitLab CI/CD

| Fonctionnalité | **Jenkins** | **GitLab CI/CD** |
| --- | --- | --- |
| Hébergement | Auto-hébergé | Intégré à GitLab |
| Langage pipeline | Groovy DSL | YAML |
| Flexibilité | Très élevée (logique, conditions, boucles) | Limitée |
| Plugins | +1800 | Non extensible |
| Simplicité d’usage | Complexe | Simple |
| Maintenance | À ta charge | Gérée par GitLab |
| Sécurité | Gestion fine (Vault interne) | Intégrée à GitLab |
| Usage idéal | Environnements hétérogènes, multi-outils | Petits projets ou GitLab centric |

---

## 12. 💡 Bonnes pratiques DevOps avec Jenkins

- 🧩 Toujours versionner ton `Jenkinsfile` dans le dépôt Git.
- 🧠 Découper tes pipelines en **stages lisibles et indépendants**.
- 🔐 Centraliser les credentials et ne jamais les afficher dans les logs.
- 🧰 Utiliser des **agents Docker** pour isoler les environnements d’exécution.
- 📊 Connecter Jenkins à **SonarQube**, **Trivy**, **OWASP Dependency Check** pour la sécurité.
- 📅 Sauvegarder régulièrement le répertoire `/var/lib/jenkins`.

---

## 13. 🧩 Exemple complet de pipeline CI/CD

```groovy
pipeline {
    agent any
    environment {
        DOCKER_HUB = credentials('dockerhub-token')
    }
    stages {
        stage('Build') {
            steps {
                sh 'docker build -t myapp .'
            }
        }
        stage('Test') {
            steps {
                sh 'pytest tests/'
            }
        }
        stage('Quality') {
            steps {
                sh 'sonar-scanner'
            }
        }
        stage('Deploy') {
            when { branch 'main' }
            steps {
                sh 'docker push myapp:latest'
            }
        }
    }
}

```

---

## 14. 🚀 Conclusion

**Jenkins** est l’un des piliers historiques du DevOps moderne.

Sa force réside dans sa **flexibilité** et sa **puissance d’automatisation**, capable de s’adapter à tout type d’environnement.

En contrepartie, il demande une **expertise plus avancée** que GitLab CI/CD ou GitHub Actions, mais il reste le **standard industriel** dans les grandes entreprises cherchant un contrôle total sur leurs pipelines.

---

<!-- snippet
id: jenkins_install_linux
type: command
tech: jenkins
level: beginner
importance: high
format: knowledge
tags: jenkins,installation,linux,debian,ubuntu
title: Installer Jenkins sur Linux (Debian/Ubuntu)
context: mettre en place un serveur Jenkins sur une machine Linux
command: sudo apt install fontconfig openjdk-17-jre jenkins -y && sudo systemctl enable --now jenkins
description: Installe Java 17 (prérequis) et Jenkins, puis active et démarre le service. Jenkins sera accessible sur http://localhost:8080.
-->

<!-- snippet
id: jenkins_install_linux_password
type: command
tech: jenkins
level: beginner
importance: medium
format: knowledge
tags: jenkins,installation,linux,password,admin
title: Récupérer le mot de passe admin initial Jenkins
context: se connecter pour la première fois à Jenkins après installation
command: sudo cat /var/lib/jenkins/secrets/initialAdminPassword
description: Affiche le mot de passe généré à l'installation, requis pour la configuration initiale via l'interface web.
-->

<!-- snippet
id: jenkins_install_docker
type: command
tech: jenkins
level: beginner
importance: high
format: knowledge
tags: jenkins,docker,installation,conteneur
title: Lancer Jenkins avec Docker
context: démarrer rapidement Jenkins dans un conteneur sans installation système
command: docker run -d --name jenkins -p 8080:8080 -p 50000:50000 -v jenkins_home:/var/jenkins_home jenkins/jenkins:lts-jdk17
description: Lance Jenkins en conteneur Docker avec persistance des données dans le volume jenkins_home. Port 8080 = interface web, port 50000 = communication avec les agents. Accessible sur http://localhost:8080.
-->

<!-- snippet
id: jenkins_jenkinsfile_basic
type: concept
tech: jenkins
level: beginner
importance: high
format: knowledge
tags: jenkins,jenkinsfile,groovy,pipeline,stages
title: Structure de base d'un Jenkinsfile
context: écrire un premier pipeline Jenkins déclaratif avec Install, Test, Build
content: Un Jenkinsfile déclaratif est structuré en pipeline > stages > stage > steps. Les stages sont les étapes logiques, les steps les commandes concrètes.
-->

<!-- snippet
id: jenkins_credentials_withcredentials
type: concept
tech: jenkins
level: intermediate
importance: high
format: knowledge
tags: jenkins,credentials,secrets,securite,withcredentials
title: Injecter des secrets avec withCredentials dans Jenkins
context: utiliser des tokens, clés SSH ou mots de passe dans un pipeline sans les exposer dans les logs
content: Les secrets Jenkins sont injectés via withCredentials et restent masqués dans les logs. Ne jamais écrire de secret en clair dans le Jenkinsfile.
-->

<!-- snippet
id: jenkins_parallel_stages
type: concept
tech: jenkins
level: intermediate
importance: medium
format: knowledge
tags: jenkins,parallele,stages,performance,pipeline
title: Exécuter des stages en parallèle dans Jenkins
context: accélérer un pipeline en lançant simultanément des tests frontend, backend ou de sécurité
content: Utiliser parallel { stage('A') {...} stage('B') {...} } pour exécuter des stages simultanément et accélérer le pipeline.
-->

<!-- snippet
id: jenkins_vs_gitlab_ci
type: concept
tech: jenkins
level: beginner
importance: medium
format: knowledge
tags: jenkins,gitlab,comparaison,choix,cicd
title: Jenkins vs GitLab CI/CD — quand choisir lequel ?
context: décider entre Jenkins et GitLab CI selon les contraintes du projet
content: Jenkins est auto-hébergé, Groovy DSL, +1800 plugins — très flexible mais maintenance à la charge de l'équipe. GitLab CI est en YAML, intégré et géré par GitLab.
-->