---
layout: page
title: "Introduction à Docker"

course: docker
chapter_title: "Prise en main"

chapter: 1
section: 1

tags: docker,introduction,conteneur,image,commande
difficulty: beginner
duration: 25
mermaid: false

status: published
prev_module: "/courses/docker/docker_ch1_0.html"
prev_module_title: "D'où vient Docker"
next_module: "/courses/docker/docker_ch1_2.html"
next_module_title: "Lancer son premier conteneur"
---

# Introduction à Docker

## Objectifs pédagogiques

- Comprendre ce qu’est Docker concrètement  
- Comprendre les notions de conteneur et d’image  
- Lancer ses premières commandes Docker  
- Comprendre ce qu’il se passe en arrière-plan  

---

## Contexte et problématique

Dans le chapitre précédent, on a vu pourquoi Docker existe.

Maintenant, on va répondre à une question simple :

👉 **Docker, concrètement, c’est quoi ?**

Docker est un outil qui permet de lancer des applications dans des environnements isolés appelés *conteneurs*.

Mais pour bien comprendre, il faut voir ce que ça change réellement.

---

## Définition

Docker est un logiciel qui permet de :

👉 **créer, exécuter et gérer des conteneurs**

### Conteneur*

Un conteneur est un environnement isolé qui contient :

- une application  
- ses dépendances  
- sa configuration  

👉 C’est comme une “boîte” prête à fonctionner.

---

### Image*

Une image est un modèle utilisé pour créer un conteneur.

👉 On peut voir ça comme :

- une recette (image)  
- un plat préparé (conteneur)

---

## Fonctionnement

Le fonctionnement de Docker repose sur 3 éléments :

1. Une image  
2. Un conteneur  
3. Docker (le moteur)

👉 Processus :

- Docker télécharge une image  
- Il crée un conteneur à partir de cette image  
- Il lance l’application  

---

## Commandes essentielles

### Lancer un conteneur

```bash
docker run hello-world
```

👉 Cette commande :

- télécharge une image appelée `hello-world`
- crée un conteneur
- exécute un programme de test

---

### Voir les conteneurs en cours

```bash
docker ps
```

👉 Affiche les conteneurs actifs

---

### Voir tous les conteneurs

```bash
docker ps -a
```

👉 Inclut les conteneurs arrêtés

---

### Supprimer un conteneur

```bash
docker rm ID_DU_CONTENEUR
```

---

## Fonctionnement interne

💡 Astuce  
Docker ne crée pas une machine complète. Il utilise le système existant.

⚠️ Erreur fréquente  
Confondre conteneur et machine virtuelle.

🧠 Concept clé  
Un conteneur est léger et rapide car il partage le système.

---

## Cas réel en entreprise

Un développeur veut lancer une application.

Sans Docker :
- installation longue  
- erreurs fréquentes  

Avec Docker :

```bash
docker run nginx
```

👉 Le serveur web démarre immédiatement.

---

## Bonnes pratiques

- Toujours comprendre ce que fait une commande  
- Ne pas copier-coller sans comprendre  
- Tester les commandes une par une  

---

## Résumé

Docker permet de lancer des applications dans des conteneurs.

- une image = modèle  
- un conteneur = application en cours  

👉 C’est simple, rapide et reproductible.

---

## Notes

*Conteneur : environnement isolé pour exécuter une application
*Image : modèle servant à créer des conteneurs

---

<!-- snippet
id: docker_conteneur_definition
type: concept
tech: docker
level: beginner
importance: high
format: knowledge
tags: docker,conteneur,definition
title: Définition d'un conteneur
content: Un conteneur est un environnement isolé qui contient une application, ses dépendances et sa configuration. C'est une "boîte" prête à fonctionner.
description: Différent d'une machine virtuelle : le conteneur partage le système hôte et est donc léger et rapide.
-->

<!-- snippet
id: docker_image_definition
type: concept
tech: docker
level: beginner
importance: high
format: knowledge
tags: docker,image,definition
title: Définition d'une image Docker
content: Une image est un modèle utilisé pour créer un conteneur. Comme une recette qui permet de produire un plat (le conteneur).
description: Une image est immuable : elle ne change pas à l'exécution. C'est le conteneur qui est vivant — l'image reste toujours identique et reproductible.
-->

<!-- snippet
id: docker_run_hello_world
type: command
tech: docker
level: beginner
importance: high
format: knowledge
tags: docker,run,premier-conteneur
title: Lancer son premier conteneur
command: docker run hello-world
description: Télécharge l'image hello-world, crée un conteneur et exécute un programme de test. Permet de vérifier que Docker fonctionne correctement.
-->

<!-- snippet
id: docker_ps_actifs
type: command
tech: docker
level: beginner
importance: high
format: knowledge
tags: docker,ps,liste,conteneurs
title: Voir les conteneurs actifs
command: docker ps
description: Affiche uniquement les conteneurs en cours d'exécution.
-->

<!-- snippet
id: docker_ps_tous
type: command
tech: docker
level: beginner
importance: medium
format: knowledge
tags: docker,ps,liste,conteneurs,arretes
title: Voir tous les conteneurs (y compris arrêtés)
command: docker ps -a
description: Inclut les conteneurs arrêtés en plus des conteneurs actifs.
-->

<!-- snippet
id: docker_conteneur_vs_vm
type: warning
tech: docker
level: beginner
importance: high
format: knowledge
tags: docker,conteneur,machine-virtuelle,confusion
title: Erreur : confondre conteneur et machine virtuelle
content: Un conteneur n'est pas une machine virtuelle. Il ne crée pas un système complet mais partage le noyau du système hôte. C'est pourquoi il est léger et démarre rapidement.
-->

<!-- snippet
id: docker_run_nginx_exemple
type: command
tech: docker
level: beginner
importance: medium
format: knowledge
tags: docker,run,nginx,serveur-web
title: Lancer un serveur web nginx
command: docker run nginx
description: Lance immédiatement un serveur web nginx sans aucune installation complexe.
-->
