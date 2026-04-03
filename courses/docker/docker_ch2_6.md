---
layout: page
title: "Gestion des dépendances"

course: docker
chapter_title: "Dockerfile et images"

chapter: 2
section: 6

tags: docker,dependances,node,python,build
difficulty: intermediate
duration: 40
mermaid: false

status: published
prev_module: "/courses/docker/docker_ch2_5.html"
prev_module_title: "Variables d’environnement"
next_module: "/courses/docker/docker_ch2_7.html"
next_module_title: "Bonnes pratiques Dockerfile"
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

<!-- snippet
id: docker_deps_node_pattern
tech: docker
level: beginner
importance: high
format: knowledge
tags: node,npm,dependances,dockerfile,pattern
title: Pattern d’installation des dépendances Node.js
content: Copier package.json en premier, lancer npm install, puis copier le reste du code. Ce pattern exploite le cache Docker pour ne réinstaller les dépendances que si package.json change.
-->

<!-- snippet
id: docker_deps_python_pattern
tech: docker
level: beginner
importance: high
format: knowledge
tags: python,pip,dependances,dockerfile,pattern
title: Pattern d’installation des dépendances Python
content: Copier requirements.txt en premier, lancer pip install -r requirements.txt, puis copier le reste du code. Même logique que Node.js pour optimiser le cache.
-->

<!-- snippet
id: docker_piege_versions_non_figees
tech: docker
level: intermediate
importance: low
format: knowledge
tags: dependances,versions,stabilite,reproductibilite
title: Toujours figer les versions des dépendances
content: Sans versions figées, une dépendance peut se mettre à jour et casser l’application sans que le code ait changé.
-->

<!-- snippet
id: docker_piege_versions_non_figees_b
tech: docker
level: intermediate
importance: low
format: knowledge
tags: dependances,versions,stabilite,reproductibilite
title: Utiliser package-lock.json et requirements.txt pour figer les versions
content: Utiliser package-lock.json pour Node.js et requirements.txt avec versions précises pour Python garantit des builds reproductibles.
-->

<!-- snippet
id: docker_tip_deps_avant_code
tech: docker
level: beginner
importance: low
format: knowledge
tags: dependances,cache,ordre,dockerfile
title: Installer les dépendances avant de copier le code
content: Les dépendances changent rarement par rapport au code applicatif. En les installant en premier, le cache Docker les conserve même quand le code évolue.
-->

<!-- snippet
id: docker_deps_definition
tech: docker
level: beginner
importance: high
format: knowledge
tags: dependances,concept
title: Définition des dépendances
content: Les dépendances sont les bibliothèques, frameworks et outils nécessaires au fonctionnement d’une application. Elles doivent être stables et reproductibles d’un environnement à l’autre.
-->
