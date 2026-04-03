---
layout: page
title: "Instructions Dockerfile"

course: docker
theme: "Dockerfile et images"
type: lesson

chapter: 2
section: 2

tags: docker,dockerfile,from,run,copy,cmd
difficulty: intermediate
duration: 45
mermaid: false

status: "published"
prev_module: "/courses/docker/docker_ch2_1.html"
prev_module_title: "Introduction au Dockerfile"
next_module: "/courses/docker/docker_ch2_3.html"
next_module_title: "Construire une image"
---

# Instructions Dockerfile

## Objectifs pédagogiques

- Comprendre les principales instructions d’un Dockerfile  
- Savoir utiliser FROM, RUN, COPY et CMD  
- Comprendre le rôle de chaque instruction  
- Construire une image fonctionnelle  

---

## Contexte et problématique

Dans le chapitre précédent, tu as vu ce qu’est un Dockerfile.

👉 Maintenant, on va apprendre à écrire un Dockerfile réel.

Un Dockerfile est composé d’instructions.

👉 Chaque instruction correspond à une action.

---

## Architecture

Composant | Rôle | Exemple
----------|------|--------
FROM | image de base | ubuntu, node
RUN | exécuter une commande | installer un package
COPY | copier des fichiers | app vers conteneur
CMD | commande de démarrage | lancer un serveur

---

## Commandes essentielles

### FROM — Image de base

```Dockerfile
FROM ubuntu
```

👉 Définit l’image de départ

---

### RUN — Exécuter une commande

```Dockerfile
RUN apt-get update && apt-get install -y curl
```

👉 Installe des dépendances

---

### COPY — Copier des fichiers

```Dockerfile
COPY . /app
```

👉 Copie les fichiers locaux dans le conteneur

---

### CMD — Commande par défaut

```Dockerfile
CMD ["node", "app.js"]
```

👉 Lance l’application au démarrage

---

## Exemple complet

```Dockerfile
FROM node:18

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

CMD ["node", "app.js"]
```

---

## Fonctionnement interne

💡 Astuce  
Les instructions sont exécutées dans l’ordre.

⚠️ Erreur fréquente  
Changer l’ordre des instructions et casser le build.

💣 Piège classique  
Copier tout le projet avant d’installer les dépendances.  
👉 Cela casse le cache Docker et force une réinstallation complète à chaque modification.  
👉 Résultat : builds beaucoup plus longs et inefficaces.

🧠 Concept clé  
Chaque instruction crée une couche (layer) réutilisable.

---

## Cas réel en entreprise

Une application Node.js :

- copie package.json  
- installe dépendances  
- copie le code  
- lance l’application  

👉 Ce pattern est utilisé partout

---

## Bonnes pratiques

- Mettre FROM en premier  
- Optimiser l’ordre des instructions  
- Minimiser le nombre de RUN  
- Utiliser des images officielles  

---

## Résumé

Les instructions Dockerfile permettent de :

- définir une image  
- installer des dépendances  
- copier du code  
- lancer une application  

👉 Maîtriser ces instructions est essentiel  

---

## Notes

*FROM : définit l’image de base
*RUN : exécute une commande
*COPY : copie des fichiers
*CMD : commande de démarrage

---

<!-- snippet
id: docker_instruction_from
type: concept
tech: docker
level: beginner
importance: high
format: knowledge
tags: dockerfile,from,image-de-base
title: Instruction FROM — image de base
content: FROM définit l’image de départ du Dockerfile. C’est toujours la première instruction. Exemple : FROM ubuntu, FROM node:18.
-->

<!-- snippet
id: docker_instruction_run_install
type: concept
tech: docker
level: beginner
importance: high
format: knowledge
tags: dockerfile,run,dependances
title: Instruction RUN — installer des dépendances
content: RUN exécute une commande lors du build de l’image. Utilisée pour installer des packages ou configurer l’environnement.
-->

<!-- snippet
id: docker_instruction_copy_app
type: concept
tech: docker
level: beginner
importance: high
format: knowledge
tags: dockerfile,copy,fichiers
title: Instruction COPY — copier des fichiers
content: COPY transfère des fichiers du contexte local vers le système de fichiers du conteneur.
-->

<!-- snippet
id: docker_instruction_cmd_node
type: concept
tech: docker
level: beginner
importance: high
format: knowledge
tags: dockerfile,cmd,demarrage
title: Instruction CMD — commande de démarrage
content: CMD définit la commande exécutée au démarrage du conteneur. Elle n’est pas exécutée lors du build.
-->

<!-- snippet
id: docker_piege_ordre_instructions
type: warning
tech: docker
level: beginner
importance: medium
format: knowledge
tags: dockerfile,ordre,cache,build
title: Changer l’ordre des instructions peut invalider le cache
content: Les instructions sont exécutées dans l’ordre. Changer cet ordre peut invalider le cache et provoquer des erreurs de build.
-->

<!-- snippet
id: docker_piege_ordre_instructions_b
type: warning
tech: docker
level: beginner
importance: medium
format: knowledge
tags: dockerfile,ordre,cache,build
title: Copier le projet avant les dépendances force une réinstallation complète
content: Copier tout le projet avant d’installer les dépendances force une réinstallation complète à chaque modification du code.
-->

<!-- snippet
id: docker_layer_reutilisable
type: tip
tech: docker
level: beginner
importance: medium
format: knowledge
tags: dockerfile,layers,cache,performance
title: Les couches Dockerfile sont réutilisables
content: Chaque instruction crée une couche réutilisable. Docker utilise le cache pour éviter de reconstruire les couches inchangées, ce qui accélère les builds.
-->
