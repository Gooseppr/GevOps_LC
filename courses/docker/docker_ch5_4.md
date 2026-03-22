---
layout: page
title: "Optimisation avancée des images"

course: docker
theme: "Optimisation et sécurité"
type: lesson

chapter: 5
section: 4

tags: docker,optimisation,image,performance,production
difficulty: advanced
duration: 50
mermaid: true

status: "published"
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

### Optimisation d’image*

L’optimisation consiste à :

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
Garder des outils de build dans l’image finale

💣 Piège classique  
Ne pas supprimer les fichiers temporaires ou caches.  
👉 Cela alourdit fortement l’image sans raison.  
👉 En production, cela impacte le déploiement et la sécurité.

🧠 Concept clé  
Une image doit contenir uniquement ce qui est nécessaire à l’exécution

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
[← Module précédent](docker_ch5_3.md) | [Module suivant →](docker_ch6_1.md)
---
