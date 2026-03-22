---
layout: page
title: "D'où vient Docker"

course: docker
theme: "Prise en main"
type: lesson

chapter: 1
section: 0

tags: docker,conteneurisation,introduction,histoire
difficulty: beginner
duration: 20
mermaid: false

status: "published"
next_module: "/courses/docker/docker_ch1_1.html"
next_module_title: "Introduction à Docker"
---

# D'où vient Docker

## Objectifs pédagogiques

- Comprendre l’origine de Docker  
- Identifier le problème que Docker a résolu  
- Comprendre ce qu’est la conteneurisation simplement  
- Situer Docker dans le monde actuel du numérique  

---

## Contexte et problématique

Aujourd’hui, quand tu utilises une application ou un site web, tu ne vois pas ce qu’il y a derrière.

Mais en réalité, pour faire fonctionner une application, il faut :

- du code  
- des bibliothèques  
- un environnement spécifique  
- une configuration précise  

Avant Docker, installer et faire fonctionner une application pouvait être compliqué.

Très souvent :

- ça marchait sur l’ordinateur du développeur  
- mais ça ne marchait plus ailleurs  

👉 C’est le fameux problème :

“Ça marche sur ma machine”

---

## Définition

Docker est un outil qui permet de :

mettre une application et tout ce dont elle a besoin dans un conteneur pour qu’elle fonctionne partout de la même manière

---

## Pourquoi ce concept existe

Docker a été créé pour simplifier le déploiement des applications.

Avant :

- chaque machine était différente  
- chaque installation était différente  
- les erreurs étaient fréquentes  

Avec Docker :

- tout est standardisé  
- tout est reproductible  
- tout devient portable  

---

## Fonctionnement

Le principe est simple :

1. On crée une image  
2. On lance un conteneur  
3. L’application tourne partout de la même manière  

---

## Comparaison

| | Installation classique | Docker |
|--|----------------------|--------|
| Installation | complexe | simple |
| Reproductibilité | faible | élevée |
| Portabilité | limitée | très élevée |
| Temps de démarrage | lent | rapide |

---

## Cas réel

Docker est utilisé dans :

- sites web  
- applications backend  
- plateformes comme Netflix, Amazon  

---

## Histoire de Docker

Docker a été créé en 2013 par Solomon Hykes.

L’idée est née à Montrouge, en France, dans la startup dotCloud.

---

## Bonnes pratiques

- Comprendre Docker comme un outil de simplification  
- Ne pas chercher à tout comprendre d’un coup  

---

## Résumé

Docker permet de rendre les applications portables, simples à déployer et fiables.
