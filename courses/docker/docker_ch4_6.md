---
layout: page
title: "Variables d'environnement dans Docker Compose"

course: docker
chapter_title: "Docker Compose"

chapter: 4
section: 6

tags: docker,compose,env,configuration,yaml
difficulty: intermediate
duration: 45
mermaid: false

status: published
prev_module: "/courses/docker/docker_ch4_5.html"
prev_module_title: "Lancer et gérer une stack Docker Compose"
next_module: "/courses/docker/docker_ch4_7.html"
next_module_title: "Debug et logs avec Docker Compose"
---

# Variables d'environnement dans Docker Compose

## Objectifs pédagogiques

- Comprendre comment utiliser les variables d'environnement dans Compose
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

### Variables d'environnement dans Compose

Docker Compose permet d'injecter des variables :

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
👉 Si une variable `${PORT}` n'existe pas, Compose peut échouer ou utiliser une valeur vide.
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

👉 C'est essentiel pour un projet propre

---

## Notes

*Variable d'environnement : valeur utilisée pour configurer une application

---

<!-- snippet
id: docker_compose_env_inline
type: concept
tech: docker
level: intermediate
importance: medium
format: knowledge
tags: compose,environment,configuration
title: Injecter des variables d'environnement dans un service
content: La clé `environment` permet d'injecter des variables directement dans un service Compose. Les valeurs sont codées en dur dans le YAML — pratique pour des valeurs non sensibles et stables.
description: Pour les secrets, ne jamais mettre la valeur en dur dans le YAML — utiliser `${MON_SECRET}` interpolé depuis un fichier `.env` non commité, ou Docker Secrets en Swarm.
-->

<!-- snippet
id: docker_compose_dotenv_file
type: concept
tech: docker
level: intermediate
importance: high
format: knowledge
tags: compose,env,dotenv
title: Fichier .env — chargé automatiquement par Compose
content: Compose charge automatiquement un fichier `.env` à la racine du projet. Les variables sont disponibles via la syntaxe `${VARIABLE}` dans le docker-compose.yml.
description: Ne pas confondre avec `env_file:` qui injecte des variables dans le conteneur
-->

<!-- snippet
id: docker_compose_env_interpolation
type: concept
tech: docker
level: intermediate
importance: medium
format: knowledge
tags: compose,variables,interpolation
title: Interpolation de variables dans le docker-compose.yml
content: La syntaxe `${VARIABLE}` est remplacée par la valeur de la variable au lancement. La configuration devient dynamique sans modifier le fichier YAML.
-->

<!-- snippet
id: docker_compose_env_undefined_warning
type: warning
tech: docker
level: intermediate
importance: high
format: knowledge
tags: compose,env,erreur
title: Variable non définie peut casser la configuration Compose
content: Si une variable `${VARIABLE}` n'est pas définie, Compose peut échouer ou utiliser une valeur vide. Ces erreurs sont difficiles à diagnostiquer.
description: Toujours définir des valeurs par défaut ou documenter les variables requises
-->

<!-- snippet
id: docker_compose_multi_env
type: concept
tech: docker
level: intermediate
importance: medium
format: knowledge
tags: compose,env,dev,prod
title: Utiliser plusieurs fichiers .env pour dev et prod
content: Différents fichiers `.env` par environnement (dev, prod) permettent d'utiliser le même fichier YAML avec des comportements différents.
-->

<!-- snippet
id: docker_compose_no_hardcode
type: warning
tech: docker
level: intermediate
importance: high
format: knowledge
tags: compose,configuration,bonne-pratique
title: Ne jamais hardcoder les secrets dans le docker-compose.yml
content: Les valeurs sensibles (mots de passe, tokens) ne doivent jamais être écrites en dur dans le YAML. Utiliser `.env` et l'ajouter au `.gitignore`.
-->
