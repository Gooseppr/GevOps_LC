---
layout: page
title: "Docker Compose — Introduction par un projet réel"

course: docker
theme: "Docker Compose"
type: lesson

chapter: 4
section: 1

tags: docker,compose,orchestration,yaml,api,db
difficulty: intermediate
duration: 50
mermaid: true

status: "published"
prev_module: "/courses/docker/docker_ch3_6.html"
prev_module_title: "Stratégies de stockage"
next_module: "/courses/docker/docker_ch4_2.html"
next_module_title: "Structure du docker-compose.yml"
---

# Docker Compose — Introduction par un projet réel

## Objectifs pédagogiques

- Comprendre pourquoi Docker Compose est nécessaire  
- Lancer plusieurs conteneurs avec un seul fichier  
- Comprendre la structure d’un fichier docker-compose.yml  
- Mettre en place une stack simple (API + DB)  

---

## Contexte et problématique

Jusqu’ici, tu faisais :

```bash
docker network create app-net

docker run -d --name db --network app-net postgres

docker run -d --name api --network app-net mon-api
```

👉 Problèmes :

- long à écrire  
- difficile à maintenir  
- non reproductible facilement  

---

## Définition

### Docker Compose*

Docker Compose permet de :

👉 **définir et lancer plusieurs conteneurs avec un seul fichier**

---

## Architecture

```mermaid
flowchart LR
    A[docker-compose.yml] --> B[API]
    A --> C[Database]
```

👉 Un seul fichier → toute l’architecture

---

## Exemple concret

Créer un fichier `docker-compose.yml` :

```yaml
version: "3"

services:
  db:
    image: postgres
    container_name: db

  api:
    image: mon-api
    container_name: api
```

---

## Commandes essentielles

### Lancer la stack

```bash
docker compose up
```

---

### Mode détaché

```bash
docker compose up -d
```

---

### Arrêter la stack

```bash
docker compose down
```

---

## Fonctionnement interne

💡 Astuce  
Compose recrée automatiquement le réseau entre services.

⚠️ Erreur fréquente  
Penser qu’il faut créer le réseau manuellement.

💣 Piège classique  
Modifier les conteneurs manuellement au lieu de modifier le fichier compose.  
👉 Cela casse la cohérence du projet.  
👉 Le fichier compose doit rester la source de vérité.

🧠 Concept clé  
Compose = description déclarative de ton architecture

---

## Cas réel

Projet classique :

- API  
- base de données  
- éventuellement un frontend  

👉 Tout est défini dans un seul fichier

---

## Bonnes pratiques

- Toujours utiliser docker-compose pour multi-conteneurs  
- Versionner le fichier YAML  
- Ne pas modifier les conteneurs à la main  
- Garder une structure claire  

---

## Résumé

Docker Compose permet de :

- simplifier les commandes  
- structurer une architecture  
- lancer plusieurs services facilement  

👉 C’est indispensable pour les projets réels  

---

## Notes

*Docker Compose : outil permettant de gérer plusieurs conteneurs avec un fichier YAML
