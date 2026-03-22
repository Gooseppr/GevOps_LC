---
layout: page
title: "Introduction à Docker"

course: docker
theme: "Prise en main"
type: lesson

chapter: 1
section: 1

tags: docker,introduction,conteneur,image,commande
difficulty: beginner
duration: 25
mermaid: false

status: "published"
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
[← Module précédent](docker_ch1_0.md) | [Module suivant →](docker_ch1_2.md)
---
