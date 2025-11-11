---
titre: Helm pour Kubernetes
type: module
jour: 15
ordre: 1
tags: kubernetes, bash, linux, helm
---


# 🎓 Helm — Partie 1 : Déploiement simplifié sur Kubernetes

---

## 🌍 Introduction

### Pourquoi Helm existe ?

Déployer sur **Kubernetes** est puissant, mais très vite **lourd et répétitif** :

- Chaque application nécessite plusieurs fichiers YAML différents (**Deployment**, **Service**, **Ingress**, **ConfigMap**, **Secret**, parfois **PVC**, etc.).
- Ces fichiers se ressemblent beaucoup d’une app à l’autre : mêmes labels, mêmes probes, mêmes annotations ingress, mêmes règles de ressources.
- Tu dois déployer la même appli sur plusieurs environnements (**dev**, **staging**, **prod**) avec des petites variations (nombre de replicas, type de service, host ingress…).
- Les mises à jour sont compliquées à tracer et à rollback proprement.

👉 **Helm** est né pour **simplifier, centraliser et automatiser** ces déploiements.

C’est un **gestionnaire de packages pour Kubernetes**, comparable à :

- **apt / yum** pour Linux,
- **npm / pip** pour les développeurs.

**Ce qu’il apporte :**

- Il te permet d’installer une app complète (par exemple Nginx ou PostgreSQL) en une seule commande (`helm install`).
- Il standardise la config dans des **charts** réutilisables.
- Il historise les versions déployées pour pouvoir faire un **rollback**.

🧠 En clair :

> Helm te donne des applications Kubernetes "clé en main", prêtes à déployer, configurables, versionnées, et faciles à mettre à jour.
> 

---

## 🧠 Concepts fondamentaux

| Concept | Définition | Analogie |
| --- | --- | --- |
| **Helm** | Outil CLI et framework pour gérer des déploiements Kubernetes à partir de templates. | 🧰 “Chef d’orchestre des YAML” |
| **Chart** | Un package prêt à déployer une application. Contient les templates YAML + les valeurs modifiables. | 📦 “Un modèle d’application paramétrable” |
| **Release** | Une instance d’un chart déployée sur TON cluster. Chaque release a un nom unique. | 🚀 “L’application en production” |
| **values** | Les fichiers de paramètres (ports, image Docker, replicas, ressources, etc.). | ⚙️ “Le réglage du modèle” |
| **Helmfile** | (Plus avancé) Fichier d’orchestration qui déclare plusieurs releases à déployer ensemble. | 🗂️ “Le docker-compose du monde Helm” |

💡 En résumé :

> Helm = moteur de templating + gestionnaire de versions + orchestrateur de déploiements Kubernetes.
> 

---

## 🧩 Architecture et structure d’un Chart

Un chart Helm est juste un répertoire structuré avec certains fichiers clés :

```
my-chart/
├── Chart.yaml          # Métadonnées du chart (nom, version, description)
├── values.yaml         # Valeurs par défaut (config modifiable)
├── templates/          # Templates YAML pour Kubernetes (avec variables)
│   ├── deployment.yaml
│   ├── service.yaml
│   └── ingress.yaml
├── charts/             # Dépendances (autres charts inclus)
└── .helmignore         # Fichiers à ignorer lors du packaging

```

| Fichier / dossier | Rôle | Exemple / Contenu typique |
| --- | --- | --- |
| `Chart.yaml` | Métadonnées du projet Helm : nom du chart, version du chart, description, mainteneur. | Nom, `version: 1.2.3`, `appVersion: 1.27.2` |
| `values.yaml` | Valeurs par défaut (image, port, replicaCount). Surchargées au moment du déploiement. | `replicaCount: 2` |
| `templates/` | Fichiers YAML Kubernetes avec des placeholders (`{{ .Values.image.repository }}`). | `deployment.yaml`, `service.yaml`, `ingress.yaml` |
| `charts/` | Sous-charts. Exemple : ton chart dépend de `redis`. | `redis/` |
| `.helmignore` | Comme `.gitignore` : on exclut les README, tests, etc. du package. | `*.md`, `.git/` |

🧠 Concept clé :

> Helm rend dynamiques des manifestes Kubernetes statiques.
> 
> 
> Il prend les **templates** dans `templates/` + les **valeurs** dans `values.yaml` → et génère les vrais YAML complets qui seront appliqués au cluster.
> 

---

## ⚙️ Installation de Helm

### Méthode 1 — Script officiel

```bash
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3
chmod 700 get_helm.sh
./get_helm.sh

```

### Méthode 2 — Via APT (Debian / Ubuntu)

```bash
curl https://baltocdn.com/helm/signing.asc | gpg --dearmor | sudo tee /usr/share/keyrings/helm.gpg > /dev/null
sudo apt-get install apt-transport-https --yes
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/helm.gpg] https://baltocdn.com/helm/stable/debian/ all main" | \
sudo tee /etc/apt/sources.list.d/helm-stable-debian.list

sudo apt-get update
sudo apt-get install helm

```

### Vérification

```bash
helm version

```

💡 Astuce :

> Helm parle au cluster sur lequel kubectl est déjà configuré.
> 
> 
> Si `kubectl get nodes` fonctionne, Helm peut déployer dessus.
> 

💡 Astuce bis :

> Helm marche sur Kubernetes managé, Minikube, ou k3s.
> 
> 
> Pour Helm, c’est juste du Kubernetes.
> 

---

## 🔎 Artifact Hub et Bitnami (très important en pratique)

### Artifact Hub

**Artifact Hub** est la plateforme publique où tu peux chercher des charts Helm existants publiés par la communauté ou par des éditeurs (bases de données, monitoring, Nginx, etc.).

Tu t’en sers pour trouver quel chart utiliser au lieu d’écrire tout à la main.

🧠 Exemple : tu veux déployer Nginx, Redis, PostgreSQL ? Tu vas les trouver là.

### Bitnami

**Bitnami** maintient des charts Helm propres, documentés, versionnés, très utilisés.

Par exemple :

- `bitnami/nginx`
- `bitnami/postgresql`
- `bitnami/redis`

En général, quand tu testes ou même quand tu fais un POC sérieux : **tu commences par Bitnami**.

---

## 🧱 Helm en pratique — commandes essentielles (mode “kubectl style”)

Cette section est le bloc opérationnel que tu vas taper au quotidien.

Je te le fais comme pour ton mémo Kubernetes : commande → contexte → but.

---

### 1. Préparer Helm (repos distants, recherche de charts)

Ajouter un repo Helm distant (ex : Bitnami) :

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami

```

Lister les repos configurés localement :

```bash
helm repo list

```

Mettre à jour l’index local (récupérer les dernières versions disponibles des charts) :

```bash
helm repo update

```

Rechercher un chart dans les repos ajoutés :

```bash
helm search repo nginx
helm search repo postgresql
helm search repo redis

```

Exemple typique :

```bash
helm search repo nginx
# NAME                CHART VERSION   APP VERSION   DESCRIPTION
# bitnami/nginx       15.1.2          1.27.x        NGINX Open Source web server...

```

✔ Utilise ça pour répondre à la question :

“Quelle version d’Nginx je peux déployer facilement dans le cluster ?”

⚠️ Erreur fréquente :

> helm search hub nginx existe aussi, mais ça va taper Artifact Hub global.
> 
> 
> `helm search repo nginx`, lui, ne cherche que dans tes repos ajoutés (`bitnami`, etc.).
> 
> En prod, on fige les repos approuvés et on évite d’en prendre d’autres au hasard.
> 

---

### 2. Installer une application dans le cluster

Déployer une application à partir d’un chart :

```bash
helm install mon-nginx bitnami/nginx

```

- `mon-nginx` = nom de la **release** (ton instance dans le cluster).
- `bitnami/nginx` = nom du **chart**.

Installer dans un namespace précis (recommandé en équipe) :

```bash
kubectl create namespace web
helm install mon-nginx bitnami/nginx -n web

```

Vérifier ce qui vient d’être créé :

```bash
helm list -n web
kubectl get all -n web
kubectl get svc -n web -o wide
kubectl get pods -n web -o wide

```

💡 Astuce :

> helm install ... --dry-run --debug te montre ce qui SERAIENT déployé sans rien envoyer au cluster (très bon réflexe avant une prod) :
> 

```bash
helm install mon-nginx bitnami/nginx --dry-run --debug

```

---

### 3. Lister, inspecter, auditer

Lister toutes les releases Helm du cluster :

```bash
helm list
helm list -A           # tous namespaces
helm list -n web       # un namespace spécifique

```

Voir les valeurs réellement utilisées par une release :

```bash
helm get values mon-nginx
helm get values mon-nginx -n web

```

Voir l’historique des révisions d’une release (utile pour rollback) :

```bash
helm history mon-nginx
helm history mon-nginx -n web

```

Voir l’état détaillé d’une release :

```bash
helm status mon-nginx
helm status mon-nginx -n web

```

✔ Tu fais ça pour dire :

“Qu’est-ce qui est installé ? Avec quelle conf ? Depuis quand ? Ça a déjà été upgradé ?”

---

### 4. Personnaliser le déploiement (values)

Helm te laisse surcharger la configuration fournie dans `values.yaml` du chart.

### Méthode A — inline rapide avec `-set`

```bash
helm install mon-nginx bitnami/nginx \
  --set service.type=NodePort \
  --set replicaCount=3

```

Changer après coup :

```bash
helm upgrade mon-nginx bitnami/nginx \
  --set replicaCount=5

```

### Méthode B — fichier dédié

Tu crées un fichier `values-prod.yaml` :

```yaml
replicaCount: 4

service:
  type: LoadBalancer

ingress:
  enabled: true
  hostname: www.monsite.tld

```

Puis tu déploies avec ce fichier :

```bash
helm install mon-nginx bitnami/nginx -f values-prod.yaml
# ou
helm upgrade mon-nginx bitnami/nginx -f values-prod.yaml

```

👉 Ordre de priorité des valeurs :

1. `-set clé=valeur` (le plus fort)
2. `f fichier.yaml`
3. `values.yaml` par défaut du chart

🧠 Idée à retenir :

> Tu fais values-dev.yaml, values-staging.yaml, values-prod.yaml.
> 
> 
> Même chart, environnements différents = juste des valeurs différentes.
> 

⚠️ Mauvaise pratique :

> Modifier le values.yaml du chart Bitnami directement dans /tmp et le pousser en prod à la main.
> 
> 
> Garde tes overrides dans TES fichiers versionnés, pas en modif sauvage.
> 

---

### 5. Tester et valider avant de casser quelque chose

Générer les manifests YAML SANS rien déployer :

```bash
helm template bitnami/nginx
helm template bitnami/nginx -f values-prod.yaml

```

Simuler un upgrade avec les nouvelles valeurs, sans l’appliquer :

```bash
helm upgrade mon-nginx bitnami/nginx \
  -f values-prod.yaml \
  --dry-run --debug

```

Analyser un chart local (qualité / erreurs) :

```bash
helm lint ./mon-chart

```

✔ À utiliser avant tout passage en staging/prod.

Tu veux avoir vu les YAML finaux AVANT qu’ils atterrissent dans le cluster.

---

### 6. Mettre à jour une release déjà installée

Tu as déjà quelque chose qui tourne (`mon-nginx`).

Tu veux changer une config (replicas, type de service, version d’image, etc.).

Tu utilises **upgrade**, pas **install**.

```bash
helm upgrade mon-nginx bitnami/nginx \
  --set replicaCount=10

```

ou

```bash
helm upgrade mon-nginx bitnami/nginx \
  -f values-prod.yaml

```

Toujours possible en mode simulation d’abord :

```bash
helm upgrade mon-nginx bitnami/nginx \
  -f values-prod.yaml \
  --dry-run --debug

```

Après un upgrade :

```bash
helm history mon-nginx
kubectl get pods -o wide
kubectl describe pod <podname>
kubectl logs <podname>

```

🧠 Concept :

> Helm garde chaque upgrade comme une nouvelle révision.
> 
> 
> Donc tu peux revenir en arrière si ça part en fumée.
> 

---

### 7. Rollback (revenir à une version précédente)

Voir les révisions :

```bash
helm history mon-nginx -n web

```

Revenir à la révision 2 :

```bash
helm rollback mon-nginx 2 -n web

```

Ensuite, tu contrôles côté cluster :

```bash
kubectl get pods -n web -o wide
kubectl describe pod <pod> -n web
kubectl logs <pod> -n web

```

⚠️ Attention :

> Helm rollback te remet l’ancienne configuration déployée.
> 
> 
> Il ne “time machine” pas tes données (ex : base PostgreSQL).
> 
> Donc prudence sur les services stateful.
> 

---

### 8. Désinstaller proprement

Supprimer une release et tous les objets Kubernetes créés par Helm pour cette release :

```bash
helm uninstall mon-nginx
helm uninstall mon-nginx -n web

```

Contrôle ensuite que tout est bien parti :

```bash
helm list -n web
kubectl get all -n web

```

💡 Note :

> Les PersistentVolumeClaims (PVC) peuvent rester pour ne pas perdre de données.
> 
> 
> Checke à la main avant de dire “c’est clean”.
> 

---

### 9. Créer ton propre chart (quand tu ne veux pas dépendre de Bitnami)

Créer un squelette de chart :

```bash
helm create mon-app

```

Tu obtiens :

```
mon-app/
├─ Chart.yaml
├─ values.yaml
├─ templates/
│   ├─ deployment.yaml
│   ├─ service.yaml
│   └─ ingress.yaml
└─ .helmignore

```

Tester le rendu :

```bash
helm template ./mon-app

```

Vérifier la qualité :

```bash
helm lint ./mon-app

```

Déployer ta version interne :

```bash
helm install mon-app-release ./mon-app
helm list
kubectl get pods -o wide

```

Mettre à jour plus tard :

```bash
helm upgrade mon-app-release ./mon-app -f values-prod.yaml

```

🧠 Idée :

> À partir de là, tu peux versionner TON chart dans Git, comme un composant interne de ta plateforme.
> 

---

## 🧠 Résumé / Synthèse

### Ce qu’est Helm

- **Helm** : un gestionnaire de paquets pour Kubernetes (+ moteur de templating).
- **Chart** : un modèle d’application complet (Deployments, Services, Ingress, etc.).
- **Release** : l’instance concrète d’un chart déployé dans TON cluster.
- **values.yaml** : l’endroit où tu choisis comment l’app se comporte (ports, images, nb de replicas, type de service, etc.).
- **Artifact Hub** : catalogue public de charts.
- **Bitnami** : source fiable de charts packagés prêts pour déploiement réel.

### Le flux classique en vrai :

1. 🔍 Chercher une app dispo
    
    ```bash
    helm repo add bitnami https://charts.bitnami.com/bitnami
    helm repo update
    helm search repo nginx
    
    ```
    
2. 🚀 Déployer
    
    ```bash
    helm install mon-nginx bitnami/nginx -n web
    
    ```
    
3. 🔎 Inspecter / auditer
    
    ```bash
    helm list -n web
    helm get values mon-nginx -n web
    helm history mon-nginx -n web
    
    ```
    
4. ♻️ Mettre à jour
    
    ```bash
    helm upgrade mon-nginx bitnami/nginx \
      -f values-prod.yaml \
      --dry-run --debug
    
    ```
    
5. ⏪ Rollback si souci
    
    ```bash
    helm rollback mon-nginx 2 -n web
    
    ```
    
6. 🗑️ Nettoyer
    
    ```bash
    helm uninstall mon-nginx -n web
    
    ```
    

📘 Philosophie à retenir :

> “Je ne pousse plus des YAML bruts à la main.
> 
> 
> Je déclare une application, je donne ses valeurs, Helm génère et applique les manifests Kubernetes, garde l’historique, et me permet d’upgrader ou de revenir en arrière proprement.”
>
# 🎓 Helm — Partie 2 : Helmfile & déploiements multi-environnements

---

## 🌍 Introduction — Pourquoi Helmfile existe ?

Helm est parfait pour **déployer UNE application**.

Mais en entreprise, tu n’as jamais une seule app.

Tu as :

- un **frontend** (Angular, React, etc.),
- un **backend API** (Flask, Node, Spring),
- une **base de données** (PostgreSQL, Redis…),
- un **Ingress Controller**,
- parfois un **monitoring** (Prometheus, Grafana).

➡️ Et tout ça doit être :

- **déployé ensemble**,
- **cohérent entre environnements** (dev/staging/prod),
- **versionné dans Git** (infra as code),
- et **reproductible** en une seule commande.

C’est là que **Helmfile** entre en scène.

🧠 **Helmfile = orchestration pour Helm**

→ Il te permet de **décrire tout ton environnement** (plusieurs charts, plusieurs namespaces, plusieurs valeurs) dans **un seul fichier YAML**, puis de tout déployer ou mettre à jour d’un coup.

---

## ⚙️ Installation de Helmfile

Helmfile est un **binaire indépendant**, qui s’appuie sur Helm déjà installé.

### 1️⃣ Prérequis

Helm doit être fonctionnel :

```bash
helm version

```

### 2️⃣ Installation sur Linux / WSL

### Option 1 : via `curl` (recommandée)

```bash
curl -fsSL https://raw.githubusercontent.com/helmfile/helmfile/main/scripts/install.sh | bash

```

### Option 2 : via APT (Debian / Ubuntu)

```bash
sudo apt-get install -y helmfile

```

(si le dépôt est déjà connu, sinon préfère la méthode curl ci-dessus)

### Vérification :

```bash
helmfile --version

```

### 3️⃣ macOS (brew)

```bash
brew install helmfile

```

### 4️⃣ Windows (WSL ou binaire)

Via WSL, même commande que Linux :

```bash
curl -fsSL https://raw.githubusercontent.com/helmfile/helmfile/main/scripts/install.sh | bash

```

ou téléchargement direct depuis :

👉 https://github.com/helmfile/helmfile/releases

---

## 🧠 Concepts fondamentaux Helmfile

| Concept | Définition | Analogie |
| --- | --- | --- |
| **helmfile.yaml** | Fichier central décrivant toutes les releases Helm à déployer. | 📋 “Plan complet de ton environnement Kubernetes” |
| **release** | Une instance d’un chart Helm gérée par Helmfile. | 🚀 “Une appli (ou microservice) dans ton cluster” |
| **repository** | Source d’où proviennent les charts (Bitnami, Artifact Hub, etc.). | 📦 “Ton dépôt applicatif Helm” |
| **values** | Fichiers YAML contenant les configurations par environnement. | ⚙️ “Les réglages du projet” |
| **environment (`-e`)** | Bloc ou répertoire pour distinguer dev, staging, prod. | 🌍 “Ton espace logique de déploiement” |
| **diff** | Compare ce qui tourne vs ce que tu veux appliquer. | 🔍 “Le git diff du déploiement” |
| **sync / apply** | Exécute les changements pour que ton cluster reflète le `helmfile.yaml`. | 🔧 “Mets à jour tout ton environnement” |

🧠 En résumé :

> Helm déploie une app.
> 
> 
> Helmfile déploie un écosystème complet.
> 

---

## 🧩 Structure type d’un projet Helmfile

```
infrastructure/
├── helmfile.yaml
├── values-dev.yaml
├── values-staging.yaml
├── values-prod.yaml
└── charts/
    ├── backend/
    ├── frontend/
    └── database/

```

### Exemple de `helmfile.yaml`

```yaml
repositories:
  - name: bitnami
    url: https://charts.bitnami.com/bitnami

releases:
  - name: database
    namespace: prod
    chart: bitnami/postgresql
    values:
      - values-db-prod.yaml

  - name: backend
    namespace: prod
    chart: ./charts/backend
    values:
      - values-backend-prod.yaml

  - name: frontend
    namespace: prod
    chart: ./charts/frontend
    values:
      - values-frontend-prod.yaml

```

💡 Lecture :

- Chaque `release:` correspond à une **app** (un chart Helm).
- Tu peux avoir autant de releases que tu veux.
- Tu gères tout via **un seul fichier `helmfile.yaml`**.

---

## 🔧 Commandes Helmfile essentielles (style “kubectl cheat-sheet”)

### 1. Vérifier l’installation

```bash
helmfile --version

```

---

### 2. Simuler sans rien casser

```bash
helmfile diff

```

Compare ton `helmfile.yaml` avec ce qui tourne réellement dans le cluster.

🧠 C’est l’équivalent de `git diff` pour ton infra Helm.

---

### 3. Appliquer les changements (déploiement complet)

```bash
helmfile apply

```

➡️ Déploie ou met à jour toutes les releases listées dans ton `helmfile.yaml`.

Option plus stricte (même effet) :

```bash
helmfile sync

```

> Synchronise l’état du cluster pour qu’il corresponde exactement à ton fichier.
> 

---

### 4. Travailler sur un seul composant

```bash
helmfile -l name=backend apply
helmfile -l name=database diff

```

💡 `-l name=` agit comme un **sélecteur de release**.

---

### 5. Générer les manifestes YAML sans rien déployer

```bash
helmfile template

```

> Idéal pour audit / validation avant mise en prod.
> 

---

### 6. Supprimer toutes les releases

```bash
helmfile destroy

```

> Equivalent d’un helm uninstall sur chaque release listée.
> 

---

### 7. Gérer plusieurs environnements

Helmfile peut pointer vers différents fichiers de valeurs selon ton environnement.

Exemple :

```yaml
environments:
  dev:
    values:
      - values-dev.yaml
  staging:
    values:
      - values-staging.yaml
  prod:
    values:
      - values-prod.yaml

```

Commandes :

```bash
helmfile -e dev apply
helmfile -e staging diff
helmfile -e prod apply

```

💡 Astuce :

> Tu peux combiner plusieurs valeurs (values-prod.yaml, values-secrets.yaml)
> 
> 
> Helmfile les fusionne dans l’ordre.
> 

---

### 8. Forcer la mise à jour des dépendances

```bash
helmfile deps

```

> Met à jour les sous-charts ou dépendances du projet.
> 

---

### 9. Vérifier un seul fichier / environnement sans appliquer

```bash
helmfile lint

```

> Analyse syntaxique et cohérence globale du fichier Helmfile.
> 

---

### 10. Variables d’environnement et templating avancé

Helmfile supporte des variables d’environnement (comme `${IMAGE_TAG}`).

Exemple :

```yaml
values:
  - image:
      tag: {{ requiredEnv "IMAGE_TAG" }}

```

Lancement :

```bash
export IMAGE_TAG=v1.4.2
helmfile apply

```

---

## 🧱 Bonnes pratiques d’équipe

| Thème | Recommandation |
| --- | --- |
| **Organisation** | 1 Helmfile par environnement ou cluster. |
| **Versioning** | Toujours commit le `helmfile.yaml` et les `values-*.yaml` dans Git. |
| **Secrets** | Ne stocke pas de mots de passe en clair. Utilise `helm-secrets` ou SOPS. |
| **Auditabilité** | Toujours exécuter `helmfile diff` avant `helmfile apply`. |
| **Rollback** | Chaque release reste une Helm release → `helm rollback` fonctionne toujours. |
| **CI/CD** | Utilise Helmfile dans ton pipeline pour garantir des déploiements cohérents. |

💡 Astuce :

> En entreprise, Helmfile remplace souvent les scripts bash d’orchestration manuelle (helm install A && helm install B...).
> 

---

## 🧠 Différences Helm vs Helmfile

| Fonctionnalité | Helm | Helmfile |
| --- | --- | --- |
| Déploiement d’une app | ✅ | ✅ |
| Déploiement de plusieurs apps | ⚠️ (manuellement) | ✅ (déclaratif) |
| Gestion multi-environnements | Manuelle via fichiers `values` | Native via `-e` |
| Historique et rollback | Par release | Par environnement |
| Diff avant apply | Partiel (`--dry-run`) | Complet (`helmfile diff`) |
| CI/CD global | Limité | Intégré |
| Lisibilité du système global | Faible | Excellente |

🧠 Phrase clé :

> “Helmfile rend Helm vraiment déclaratif : on décrit l’état voulu de l’environnement, Helmfile se charge que le cluster le respecte.”
> 

---

## 🧩 Résumé final

| Élément | Description |
| --- | --- |
| **Helm** | Gère une application (chart unique). |
| **Helmfile** | Gère tout un environnement (plusieurs charts). |
| **helmfile.yaml** | Source de vérité de l’infrastructure déployée. |
| **helmfile diff / apply / sync** | Cycle standard d’évolution de ton cluster. |
| **Bitnami / Artifact Hub** | Sources de charts fiables. |
| **`-e dev`, `-e prod`** | Gestion d’environnements maîtrisée. |

📘 **Philosophie :**

> “Helmfile, c’est la pièce manquante qui fait de Helm un vrai outil d’infrastructure déclarative :
> 
> 
> tu décris ton environnement complet en YAML, et tu le déploies en une commande, traçable, diffable et rollbackable.”
>