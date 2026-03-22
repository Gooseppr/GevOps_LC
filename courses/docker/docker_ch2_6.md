---
layout: page
title: "Gestion des dépendances"

course: docker
theme: "Dockerfile et images"
type: lesson

chapter: 2
section: 6

tags: docker,dependances,node,python,build
difficulty: intermediate
duration: 40
mermaid: false

status: "published"
---

# Gestion des dépendances

## Objectifs pédagogiques

- Comprendre ce que sont les dépendances  
- Savoir les installer correctement dans un Dockerfile  
- Optimiser leur gestion  
- Éviter les erreurs fréquentes  

---

## Contexte et problématique

Une application ne fonctionne jamais seule.

Elle dépend souvent de :

- bibliothèques  
- frameworks  
- outils système  

👉 Ces éléments sont appelés **dépendances**

---

## Définition

### Dépendances*

Les dépendances sont les éléments nécessaires au bon fonctionnement d’une application.

👉 Exemple :

- Node.js → npm packages  
- Python → pip packages  
- Linux → paquets système  

---

## Commandes essentielles

### Exemple Node.js

```Dockerfile
FROM node:18

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .
```

---

### Exemple Python

```Dockerfile
FROM python:3.11

WORKDIR /app

COPY requirements.txt .

RUN pip install -r requirements.txt

COPY . .
```

---

## Fonctionnement interne

💡 Astuce  
Toujours installer les dépendances avant de copier le code.

⚠️ Erreur fréquente  
Installer les dépendances après avoir copié tout le projet.

💣 Piège classique  
Ne pas figer les versions des dépendances.  
👉 Si les versions changent, ton application peut casser sans modification de ton code.  
👉 Cela rend les builds instables et difficiles à reproduire.

🧠 Concept clé  
Les dépendances doivent être stables et reproductibles.

---

## Cas réel

Projet Node.js :

- dépendances dans `package.json`  
- installation avec `npm install`  

👉 Dockerfile structuré :

1. copier package.json  
2. installer  
3. copier le code  

---

## Bonnes pratiques

- Toujours figer les versions (`package-lock.json`, `requirements.txt`)  
- Installer les dépendances avant le code  
- Nettoyer les dépendances inutiles  
- Utiliser des images adaptées (node, python…)  

---

## Résumé

La gestion des dépendances permet de :

- garantir le bon fonctionnement  
- stabiliser les builds  
- éviter les erreurs  

👉 C’est une étape essentielle dans la construction d’image  

---

## Notes

*Dépendances : éléments nécessaires au fonctionnement d’une application

---
[← Module précédent](docker_ch2_5.md) | [Module suivant →](docker_ch2_7.md)
---
