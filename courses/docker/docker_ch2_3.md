---
layout: page
title: "Construire une image"

course: docker
chapter_title: "Dockerfile et images"

chapter: 2
section: 3

tags: docker,build,image,dockerfile,context
difficulty: intermediate
duration: 40
mermaid: true

status: published
prev_module: "/courses/docker/docker_ch2_2.html"
prev_module_title: "Instructions Dockerfile"
next_module: "/courses/docker/docker_ch2_4.html"
next_module_title: "Optimiser les images (layers et cache)"
---

# Construire une image

## Objectifs pédagogiques

- Comprendre le fonctionnement de `docker build`  
- Comprendre la notion de contexte de build  
- Construire une image correctement  
- Diagnostiquer les erreurs de build  

---

## Contexte et problématique

Tu sais maintenant écrire un Dockerfile.

👉 Mais écrire un Dockerfile ne suffit pas.

Il faut ensuite :

- le transformer en image  
- vérifier que tout fonctionne  
- comprendre ce que Docker fait réellement  

---

## Définition

### Build*

Le build est le processus qui consiste à :

👉 **transformer un Dockerfile en image Docker**

---

## Architecture

Composant | Rôle | Exemple
----------|------|--------
Dockerfile | instructions | build de l’image
Contexte | fichiers envoyés | code source
Image | résultat final | application prête

```mermaid
flowchart LR
    A[Dockerfile + fichiers] --> B[Build Docker]
    B --> C[Image]
    C --> D[Conteneur]
```

---

## Commandes essentielles

### Construire une image

```bash
docker build -t mon-app .
```

👉 Explication :

- `build` = construire une image  
- `-t` = nom de l’image  
- `.` = contexte de build  

---

### Changer le nom du Dockerfile

```bash
docker build -f Dockerfile.dev -t mon-app .
```

---

### Voir les images construites

```bash
docker images
```

---

## Fonctionnement interne

💡 Astuce  
Docker exécute chaque instruction du Dockerfile étape par étape.

⚠️ Erreur fréquente  
Ne pas être dans le bon dossier lors du build.

💣 Piège classique  
Envoyer trop de fichiers dans le contexte de build.  
👉 Par défaut, Docker envoie tout le dossier courant (`.`).  
👉 Si ton projet contient des fichiers lourds (node_modules, logs…), le build devient lent.  
👉 Solution : utiliser un fichier `.dockerignore`.

🧠 Concept clé  
Le contexte de build = tous les fichiers envoyés à Docker

---

## Cas réel

Tu es dans ton projet :

```bash
docker build -t mon-api .
```

👉 Docker :

1. lit le Dockerfile  
2. envoie les fichiers  
3. exécute chaque instruction  
4. construit une image  

---

## Bonnes pratiques

- Toujours vérifier le dossier courant  
- Utiliser `.dockerignore`  
- Nommer correctement ses images  
- Tester immédiatement avec `docker run`  

---

## Résumé

Le build permet de :

- transformer un Dockerfile en image  
- préparer une application  
- automatiser la création d’environnement  

👉 C’est une étape centrale dans Docker  

---

## Notes

*Build : processus de création d’une image Docker

---

<!-- snippet
id: docker_build_image_standard
tech: docker
level: beginner
importance: high
format: knowledge
tags: build,image,dockerfile
title: Construire une image depuis le dossier courant
command: docker build -t mon-app .
description: -t nomme l’image, le point désigne le contexte de build (dossier courant)
-->

<!-- snippet
id: docker_build_custom_dockerfile
tech: docker
level: intermediate
importance: medium
format: knowledge
tags: build,dockerfile,fichier-alternatif
title: Construire avec un Dockerfile alternatif
command: docker build -f Dockerfile.dev -t mon-app .
description: Utile pour avoir plusieurs Dockerfile selon l’environnement (dev, prod, test)
-->

<!-- snippet
id: docker_images_list
tech: docker
level: beginner
importance: low
format: knowledge
tags: image,liste
title: Voir les images disponibles localement
command: docker images
description: Affiche la liste des images locales avec leur nom, tag, identifiant et taille
-->

<!-- snippet
id: docker_build_context_definition
tech: docker
level: beginner
importance: high
format: knowledge
tags: build,contexte,fichiers
title: Contexte de build
content: Le contexte de build correspond à tous les fichiers envoyés à Docker lors du build. Par défaut, c’est l’intégralité du dossier courant.
-->

<!-- snippet
id: docker_piege_contexte_lourd
tech: docker
level: intermediate
importance: low
format: knowledge
tags: build,contexte,performance,dockerignore
title: Contexte de build trop lourd ralentit le build
content: Si le dossier courant contient des fichiers lourds (node_modules, logs, assets), le build devient lent. Il faut utiliser un fichier .dockerignore pour exclure ces fichiers du contexte.
-->

<!-- snippet
id: docker_tip_dossier_courant
tech: docker
level: beginner
importance: low
format: knowledge
tags: build,organisation
title: Toujours vérifier le dossier courant avant le build
content: Docker lit le Dockerfile depuis le dossier courant. Se trouver dans le mauvais dossier est une erreur fréquente qui provoque un build incorrect ou raté.
-->
