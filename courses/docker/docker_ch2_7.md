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

---

<!-- snippet
id: docker_build_tag_version
type: command
tech: docker
level: beginner
importance: high
format: knowledge
tags: build,tag,version,nommage
title: Construire une image avec un tag de version
command: docker build -t mon-projet:v1 .
description: Nommer et versionner ses images facilite le suivi et le déploiement
-->

<!-- snippet
id: docker_run_chain_best_practice
type: concept
tech: docker
level: intermediate
importance: medium
format: knowledge
tags: dockerfile,run,couches,optimisation
title: Chaîner les commandes RUN pour réduire les couches
content: Regrouper plusieurs commandes dans un seul RUN avec && réduit le nombre de couches et la taille de l’image finale.
-->

<!-- snippet
id: docker_dockerignore_usage
type: tip
tech: docker
level: beginner
importance: medium
format: knowledge
tags: dockerignore,contexte,performance
title: Utiliser .dockerignore pour alléger le contexte de build
content: Le fichier .dockerignore fonctionne comme .gitignore. Il exclut du contexte de build les fichiers inutiles (node_modules, logs, .git) pour accélérer le build et réduire la taille de l’image.
-->

<!-- snippet
id: docker_image_officielle_from
type: tip
tech: docker
level: beginner
importance: medium
format: knowledge
tags: from,image-officielle,securite
title: Toujours partir d’une image officielle
content: Les images officielles (node, python, nginx, alpine) sont maintenues, sécurisées et régulièrement mises à jour. Elles constituent une base fiable pour construire ses propres images.
-->

<!-- snippet
id: docker_piege_dockerfile_non_structure
type: warning
tech: docker
level: intermediate
importance: medium
format: knowledge
tags: dockerfile,maintenabilite,structure
title: Dockerfile non structuré difficile à maintenir
content: Un Dockerfile sans structure claire devient vite incompréhensible en équipe et difficile à faire évoluer. Les erreurs sont plus fréquentes et plus dures à diagnostiquer.
-->

<!-- snippet
id: docker_bp_alpine_images
type: tip
tech: docker
level: intermediate
importance: medium
format: knowledge
tags: alpine,taille,image,optimisation
title: Utiliser des images légères (alpine) quand c’est pertinent
content: Les variantes alpine des images (node:18-alpine, python:3.11-alpine) sont beaucoup plus légères. Elles réduisent la surface d’attaque et accélèrent les pulls et déploiements.
-->
