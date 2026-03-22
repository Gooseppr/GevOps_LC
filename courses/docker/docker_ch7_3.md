---
layout: page
title: "Push vers un Docker Registry"

course: docker
theme: "CI/CD"
type: lesson

chapter: 7
section: 3

tags: docker,registry,ci,cd,github-actions,dockerhub
difficulty: advanced
duration: 60
mermaid: true

status: "published"
prev_module: "/courses/docker/docker_ch7_2.html"
prev_module_title: "Pipeline CI avec GitHub Actions et Docker"
next_module: "/courses/docker/docker_ch7_4.html"
next_module_title: "Déploiement automatique (CD)"
---

# Push vers un Docker Registry

## Objectifs pédagogiques

- Comprendre le rôle d’un registry Docker  
- Publier une image Docker  
- Automatiser le push via CI  
- Gérer les versions d’image  

---

## Contexte et problématique

Construire une image Docker c’est bien…

👉 mais il faut la rendre disponible :

- pour le déploiement  
- pour d’autres environnements  

👉 Solution : un registry

---

## Définition

### Registry*

Un registry est un service de stockage d’images Docker.

👉 Exemples :

- Docker Hub  
- GitHub Container Registry (GHCR)  

---

## Architecture

```mermaid
flowchart LR
    A[CI Pipeline] --> B[Build Image]
    B --> C[Push Registry]
    C --> D[Deployment]
```

---

## Commandes essentielles

### Login

```bash
docker login
```

---

### Tagger une image

```bash
docker tag mon-app username/mon-app:1.0
```

---

### Push

```bash
docker push username/mon-app:1.0
```

---

## Pipeline GitHub Actions avec push

```yaml
name: CI

on:
  push:
    branches: [ "main" ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Login DockerHub
        run: echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u "${{ secrets.DOCKER_USERNAME }}" --password-stdin

      - name: Build
        run: docker build -t username/mon-app:latest .

      - name: Push
        run: docker push username/mon-app:latest
```

---

## Fonctionnement interne

💡 Astuce  
Utiliser des tags pour versionner les images.

⚠️ Erreur fréquente  
Utiliser uniquement `latest`.

💣 Piège classique  
Ne pas sécuriser les credentials.  
👉 Les identifiants Docker doivent être stockés dans les secrets GitHub.  
👉 Ne jamais les mettre en clair dans le code.  
👉 Sinon → fuite de credentials.

🧠 Concept clé  
Registry = source des images en production

---

## Cas réel

Pipeline complet :

- build image  
- push vers Docker Hub  
- déploiement depuis registry  

---

## Bonnes pratiques

- utiliser des tags de version (`v1`, `v2`)  
- éviter `latest` en production  
- sécuriser les credentials  
- nettoyer les images inutilisées  

---

## Résumé

Le registry permet de :

- stocker les images  
- partager les builds  
- déployer facilement  

👉 C’est indispensable en CI/CD  

---

## Notes

*Registry : service de stockage d’images Docker
