---
layout: page
title: "Bonnes pratiques Dockerfile"

course: docker
theme: "Dockerfile et images"
type: lesson

chapter: 2
section: 7

tags: docker,dockerfile,bonnes-pratiques,optimisation
difficulty: intermediate
duration: 40
mermaid: false

status: "published"
prev_module: "/courses/docker/docker_ch2_6.html"
prev_module_title: "Gestion des dépendances"
next_module: "/courses/docker/docker_ch3_1.html"
next_module_title: "Réseau Docker — communication entre conteneurs"
---

# Bonnes pratiques Dockerfile

## Objectifs pédagogiques

- Appliquer les bonnes pratiques Dockerfile  
- Éviter les erreurs courantes  
- Structurer un Dockerfile propre  
- Améliorer performance et maintenabilité  

---

## Contexte et problématique

Tu sais maintenant :

- écrire un Dockerfile  
- construire une image  
- gérer les dépendances  

👉 Mais sans bonnes pratiques :

- builds lents  
- images lourdes  
- erreurs difficiles à diagnostiquer  

---

## Bonnes pratiques essentielles

### 1 — Utiliser une image officielle

```Dockerfile
FROM node:18
```

👉 Plus fiable, maintenue et sécurisée

---

### 2 — Minimiser le nombre de couches

```Dockerfile
RUN apt-get update && apt-get install -y curl
```

👉 Évite plusieurs RUN inutiles

---

### 3 — Optimiser l’ordre des instructions

👉 Toujours :

1. dépendances  
2. code  

---

### 4 — Utiliser .dockerignore

👉 Évite d’envoyer :

- node_modules  
- logs  
- fichiers temporaires  

---

### 5 — Nommer correctement les images

```bash
docker build -t mon-projet:v1 .
```

---

## Fonctionnement interne

💡 Astuce  
Un Dockerfile propre = plus rapide + plus lisible

⚠️ Erreur fréquente  
Créer des Dockerfile trop complexes dès le début

💣 Piège classique  
Tout faire dans un seul Dockerfile sans structure.  
👉 Cela rend les images difficiles à maintenir et à faire évoluer.  
👉 En équipe, cela devient vite incompréhensible et source d’erreurs.

🧠 Concept clé  
Un bon Dockerfile est simple, lisible et optimisé

---

## Cas réel

Projet mal structuré :

- build lent  
- bugs fréquents  

Projet optimisé :

- build rapide  
- stable  
- facile à maintenir  

---

## Bonnes pratiques avancées

- Utiliser des images légères (`alpine` si pertinent)  
- Supprimer les fichiers inutiles  
- Éviter les secrets dans l’image  
- Structurer clairement les étapes  

---

## Résumé

Un bon Dockerfile permet de :

- gagner du temps  
- éviter les erreurs  
- améliorer la performance  

👉 C’est une compétence clé pour un usage professionnel  

---

## Notes

*Bonnes pratiques : règles permettant d’améliorer qualité et performance
