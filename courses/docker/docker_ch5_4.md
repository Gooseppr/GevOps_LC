---
layout: page
title: "Optimisation avancée des images"

course: docker
chapter_title: "Optimisation et sécurité"

chapter: 5
section: 4

tags: docker,optimisation,image,performance,production
difficulty: advanced
duration: 50
mermaid: true

status: published
prev_module: "/courses/docker/docker_ch5_3.html"
prev_module_title: "Vulnérabilités et scan des images"
next_module: "/courses/docker/docker_ch6_1.html"
next_module_title: "Introduction à Docker Swarm"
---

# Optimisation avancée des images

## Objectifs pédagogiques

- Réduire la taille des images Docker
- Supprimer les éléments inutiles
- Optimiser les performances en production
- Construire des images propres et maintenables

---

## Contexte et problématique

Même avec un Dockerfile correct :

- les images peuvent être lourdes
- contenir des fichiers inutiles
- ralentir le déploiement

👉 En production, chaque Mo compte.

---

## Définition

### Optimisation d'image*

L'optimisation consiste à :

👉 réduire la taille
👉 améliorer la performance
👉 limiter les risques

---

## Architecture

```mermaid
flowchart LR
    A[Image brute] --> B[Optimisation]
    B --> C[Image légère]
```

---

## Techniques principales

### 1 — Utiliser des images légères

```Dockerfile
FROM node:18-alpine
```

👉 version minimale

---

### 2 — Nettoyer après installation

```Dockerfile
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
```

---

### 3 — Multi-stage build

👉 déjà vu, mais essentiel

---

### 4 — Copier uniquement le nécessaire

```Dockerfile
COPY package.json .
```

👉 éviter `COPY . .` trop tôt

---

## Fonctionnement interne

💡 Astuce
Moins de fichiers = image plus rapide à transférer

⚠️ Erreur fréquente
Garder des outils de build dans l'image finale

💣 Piège classique
Ne pas supprimer les fichiers temporaires ou caches.
👉 Cela alourdit fortement l'image sans raison.
👉 En production, cela impacte le déploiement et la sécurité.

🧠 Concept clé
Une image doit contenir uniquement ce qui est nécessaire à l'exécution

---

## Cas réel

Image non optimisée :

- 800MB
- lente à déployer

Image optimisée :

- 150MB
- rapide et sécurisée

---

## Bonnes pratiques

- utiliser alpine si possible
- nettoyer après installation
- utiliser multi-stage
- limiter les fichiers copiés

---

## Résumé

Optimiser une image permet de :

- améliorer les performances
- réduire les coûts
- renforcer la sécurité

👉 Indispensable en production

---

## Notes

*Optimisation : amélioration des performances et réduction des ressources utilisées

---

<!-- snippet
id: docker_optim_alpine_base
type: command
tech: docker
level: intermediate
importance: high
format: knowledge
tags: optimisation,alpine,image-legere,Dockerfile
title: Utiliser une image de base alpine
command: FROM node:18-alpine
description: Les images alpine sont des versions minimales (~5MB de base) qui réduisent significativement la taille finale de l'image
-->

<!-- snippet
id: docker_optim_clean_apt_cache
type: command
tech: docker
level: intermediate
importance: high
format: knowledge
tags: optimisation,apt,cache,Dockerfile
title: Nettoyer le cache apt après installation
command: RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
description: Chaîner l'installation et la suppression du cache dans une seule instruction RUN évite de créer un layer supplémentaire avec les fichiers temporaires
-->

<!-- snippet
id: docker_optim_copy_selective
type: command
tech: docker
level: intermediate
importance: medium
format: knowledge
tags: optimisation,COPY,layer,cache,Dockerfile
title: Copier uniquement les fichiers nécessaires
command: COPY package.json .
description: Copier uniquement package.json avant le reste du code exploite le cache des layers Docker : npm install ne se relance que si les dépendances changent
-->

<!-- snippet
id: docker_optim_concept
type: concept
tech: docker
level: intermediate
importance: medium
format: knowledge
tags: optimisation,image,production,performance
title: Optimisation d'image Docker — définition
content: L'optimisation d'une image Docker consiste à réduire sa taille et limiter les risques. Une image doit contenir uniquement ce qui est nécessaire à l'exécution.
-->

<!-- snippet
id: docker_optim_temp_files_warning
type: warning
tech: docker
level: intermediate
importance: medium
format: knowledge
tags: optimisation,cache,fichiers-temporaires,piege
title: Piège — ne pas supprimer les fichiers temporaires et caches
content: Ne pas supprimer les caches après installation alourdit l'image sans valeur ajoutée. En production, cela impacte le déploiement et la surface d'attaque.
-->

<!-- snippet
id: docker_optim_build_tools_error
type: warning
tech: docker
level: intermediate
importance: medium
format: knowledge
tags: optimisation,build,outils,image-finale
title: Erreur fréquente — garder les outils de build dans l'image finale
content: Laisser des outils de build dans l'image finale augmente sa taille et sa surface d'attaque. Utiliser le multi-stage build pour les exclure.
-->
