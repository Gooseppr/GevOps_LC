---
layout: page
title: "Variables d’environnement dans Docker Compose"

course: docker
theme: "Docker Compose"
type: lesson

chapter: 4
section: 6

tags: docker,compose,env,configuration,yaml
difficulty: intermediate
duration: 45
mermaid: false

status: "published"
prev_module: "/courses/docker/docker_ch4_5.html"
prev_module_title: "Lancer et gérer une stack Docker Compose"
next_module: "/courses/docker/docker_ch4_7.html"
next_module_title: "Debug et logs avec Docker Compose"
---

# Variables d’environnement dans Docker Compose

## Objectifs pédagogiques

- Comprendre comment utiliser les variables d’environnement dans Compose  
- Différencier `environment` et fichier `.env`  
- Rendre une stack configurable  
- Gérer plusieurs environnements (dev / prod)  

---

## Contexte et problématique

Dans un projet réel, tu ne veux pas :

- modifier ton fichier YAML à chaque fois  
- hardcoder (écrire en dur) des valeurs  

👉 Exemple :

- port  
- mot de passe  
- URL  

👉 Tu veux une configuration **flexible**

---

## Définition

### Variables d’environnement dans Compose

Docker Compose permet d’injecter des variables :

👉 directement dans les services  
👉 ou via un fichier `.env`

---

## Utilisation avec `environment`

```yaml
services:
  api:
    image: mon-api
    environment:
      - NODE_ENV=production
      - PORT=3000
```

---

## Utilisation avec `.env`

Créer un fichier `.env` :

```bash
PORT=3000
DB_HOST=db
```

Puis dans le YAML :

```yaml
services:
  api:
    image: mon-api
    environment:
      - PORT=${PORT}
      - DB_HOST=${DB_HOST}
```

---

## Fonctionnement interne

💡 Astuce  
Le fichier `.env` est automatiquement chargé par Docker Compose.

⚠️ Erreur fréquente  
Confondre variables Compose et variables système.

💣 Piège classique  
Oublier que les variables non définies peuvent casser la configuration.  
👉 Si une variable `${PORT}` n’existe pas, Compose peut échouer ou utiliser une valeur vide.  
👉 Cela peut provoquer des erreurs difficiles à comprendre.

🧠 Concept clé  
Les variables rendent la configuration dynamique

---

## Cas réel

Tu veux 2 environnements :

### Dev

```bash
PORT=3000
```

### Prod

```bash
PORT=80
```

👉 Même fichier YAML → comportement différent

---

## Bonnes pratiques

- utiliser `.env` pour la configuration  
- ne jamais stocker de secrets sensibles en clair  
- documenter les variables  
- prévoir des valeurs par défaut si possible  

---

## Résumé

Les variables dans Compose permettent de :

- rendre la stack flexible  
- adapter les environnements  
- éviter les modifications du YAML  

👉 C’est essentiel pour un projet propre  

---

## Notes

*Variable d’environnement : valeur utilisée pour configurer une application
