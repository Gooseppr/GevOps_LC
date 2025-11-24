---
title: Hackathon 21/11/2025
sujet: Cloud publique, Hosting & Cloud
type: module
jour: 30
ordre: 1
tags: aws, gce, mongodb, cloud provider, node.js
---

# 🚀 Déploiement complet du backend HackaTweet (Node.js)

**Local → GitHub → Google Cloud Run → Google Compute Engine → MongoDB Atlas**

---

## 🏁 1) Travail local : récupération et publication du backend

### 1.1 Cloner le backend fourni par La Capsule

```bash
git clone https://projects.lacapsule.academy/students-projects/hackatweet-backend.git
cd hackatweet-backend/

```

### 1.2 Installer les dépendances Node

```bash
npm install

```

🎯 *Installation OK malgré des packages dépréciés.*

### 1.3 Vérifier que le dépôt est lié à La Capsule

```bash
git ls-remote

```

### 1.4 Configurer ton identité Git locale

```bash
git config --local user.name "Grégoire Elmacin"
git config --local user.email "gregoire.elmacin@gmail.com"

```

### 1.5 Modifier le dépôt distant (GitHub personnel)

```bash
git remote remove origin
git remote add origin https://github.com/Gooseppr/backend-hackathon.git

```

### 1.6 Commit + push vers GitHub

```bash
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main

```

💡 **Le backend est désormais sous ton contrôle.**

---

## 🌥️ 2) Google Cloud Shell : configuration + déploiement Cloud Run

### 2.1 Sélectionner le projet GCP

```bash
gcloud config set project windy-access-478909-d9

```

### 2.2 Cloner ton repo GitHub dans Cloud Shell

```bash
git clone https://github.com/gooseppr/backend-hackathon.git
cd backend-hackathon/

```

### 2.3 Définir la région Cloud Run par défaut

```bash
gcloud config set run/region europe-west9

```

### 2.4 Activer les services requis

```bash
gcloud services enable run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com

```

### 2.5 Déployer l’API sur Cloud Run

```bash
gcloud run deploy hackatweet-backend \
  --source . \
  --platform=managed \
  --region=europe-west9 \
  --allow-unauthenticated \
  --set-env-vars=CONNECTION_STRING="mongodb+srv://admin_db:ta78eJJXu2WDG4Ed@cluster0.ygmyguk.mongodb.net/hackatweet"

```

✔️ **Build & Deploy OK**

✔️ **URL publique générée** *(HTTPS + autoscaling + serverless)*

---

## 🖥️ 3) Google Compute Engine : hébergement de l’image en VM

### 3.1 Créer une VM avec le container déployé sur Cloud Run

```bash
gcloud compute instances create-with-container hackatweet-vm \
  --zone=europe-west9-b \
  --machine-type=e2-micro \
  --tags=hackatweet-backend \
  --container-image=europe-west9-docker.pkg.dev/windy-access-478909-d9/cloud-run-source-deploy/hackatweet-backend:latest \
  --container-env=CONNECTION_STRING="mongodb+srv://admin_db:ta78eJJXu2WDG4Ed@cluster0.ygmyguk.mongodb.net/"

```

📌 *Tu réutilises l’image Cloud Build `cloud-run-source-deploy`.*

### 3.2 Autoriser les accès réseau

### Ouvrir le port 80

```bash
gcloud compute firewall-rules create hackatweet-allow-http \
  --allow=tcp:80 \
  --target-tags=hackatweet-backend \
  --source-ranges=0.0.0.0/0

```

### Ouvrir le port 8080 (Express)

```bash
gcloud compute firewall-rules create hackatweet-allow-8080 \
  --allow=tcp:8080 \
  --target-tags=hackatweet-backend \
  --source-ranges=0.0.0.0/0

```

### 3.3 Vérifier l’état de la VM

```bash
gcloud compute instances list --filter="name=hackatweet-vm"

```

📌 **IP externe obtenue** : `34.155.75.122`

### 3.4 Tester l’accès depuis ton PC

```bash
curl http://34.155.75.122:8080/

```

🎉 Réponse HTML Express :

```html
<h1>Express</h1>
<p>Welcome to Express</p>

```

---

## 🔍 4) SSH + Debug Docker + Erreur MongoDB

### 4.1 Se connecter en SSH

```bash
gcloud compute ssh hackatweet-vm --zone=europe-west9-b

```

💡 GCP crée automatiquement une clé SSH à ta première connexion.

### 4.2 Lister et inspecter le container

```bash
sudo docker ps
sudo docker logs $(sudo docker ps -q)

```

📌 Erreur rencontrée :

```
MongooseServerSelectionError: Could not connect to any servers in your MongoDB Atlas cluster.
One common reason is that you're trying to access the database from an IP that isn't whitelisted.

```

🔎 *Le backend répond, mais ne peut pas accéder à MongoDB.*

---

## 🔐 5) Autoriser l’IP de la VM dans MongoDB Atlas

### 5.1 Récupérer l’IP publique (déjà connue)

```bash
gcloud compute instances list --filter="name=hackatweet-vm"

```

📌 IP : `34.155.75.122`

### 5.2 Dans l’interface MongoDB Atlas

➡️ **Network Access**

➡️ **Add IP Address**

📌 Ajouter :

- **IP Address** : `34.155.75.122`
- **Comment** : `gcp-hackatweet-vm`

💾 *Save*

🎉 La VM peut maintenant accéder au cluster MongoDB.

---

# 🎯 Résultat final

Tu as déployé la même API backend :

| Hébergement | Type | Avantages |
| --- | --- | --- |
| **Cloud Run** | Serverless | HTTPS, autoscaling, zéro admin |
| **Compute Engine** | VM + Docker | Contrôle total, réseau custom, production fine |

Tu es passé :

✔️ **D’un code étudiant → vers un repo perso**

✔️ **De GitHub → déploiement Cloud Run**

✔️ **Du serverless → VM Docker**

✔️ **Debug réseau & sécurité Atlas**

✔️ **Firewall GCP + whitelist MongoDB**