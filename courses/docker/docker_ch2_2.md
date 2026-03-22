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
[← Module précédent](docker_ch2_1.md) | [Module suivant →](docker_ch2_3.md)
---
