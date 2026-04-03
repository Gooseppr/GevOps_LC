---
layout: page
title: "Structure du docker-compose.yml"

course: docker
chapter_title: "Docker Compose"

chapter: 4
section: 2

tags: docker,compose,yaml,services,configuration
difficulty: intermediate
duration: 50
mermaid: true

status: published
prev_module: "/courses/docker/docker_ch4_1.html"
prev_module_title: "Docker Compose — Introduction par un projet réel"
next_module: "/courses/docker/docker_ch4_3.html"
next_module_title: "Définir des services (approfondi)"
---

# Structure du docker-compose.yml

## Objectifs pédagogiques

- Comprendre la structure d’un fichier docker-compose.yml  
- Comprendre les éléments clés (services, ports, volumes, networks)  
- Savoir lire et modifier un fichier Compose  
- Construire une configuration complète  

---

## Contexte et problématique

Dans le chapitre précédent, tu as utilisé un fichier simple :

```yaml
services:
  db:
    image: postgres

  api:
    image: mon-api
```

👉 Mais en pratique, ce fichier doit être enrichi.

---

## Définition

Le fichier `docker-compose.yml` est un fichier YAML* qui décrit :

👉 toute ton architecture applicative

---

## Architecture

```mermaid
flowchart TD
    A[docker-compose.yml] --> B[Services]
    B --> C[API]
    B --> D[DB]
    A --> E[Volumes]
    A --> F[Networks]
```

---

## Structure générale

```yaml
version: "3"

services:
  service1:
    image: image1

  service2:
    image: image2

volumes:
  mon-volume:

networks:
  mon-reseau:
```

---

## Les éléments clés

### 1 — services

👉 cœur du fichier

```yaml
services:
  api:
    image: mon-api
```

---

### 2 — ports

```yaml
ports:
  - "3000:3000"
```

👉 expose un port

---

### 3 — volumes

```yaml
volumes:
  - db-data:/var/lib/postgresql/data
```

---

### 4 — environment

```yaml
environment:
  - NODE_ENV=production
```

---

### 5 — networks

```yaml
networks:
  - mon-reseau
```

---

## Exemple complet

```yaml
version: "3"

services:
  db:
    image: postgres
    volumes:
      - db-data:/var/lib/postgresql/data

  api:
    image: mon-api
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=db

volumes:
  db-data:
```

---

## Fonctionnement interne

💡 Astuce  
Chaque service devient un conteneur.

⚠️ Erreur fréquente  
Mauvaise indentation YAML (très sensible).

💣 Piège classique  
Oublier que YAML dépend des espaces.  
👉 Une mauvaise indentation peut casser tout le fichier.  
👉 Docker Compose peut échouer sans message clair.  
👉 Toujours vérifier l’alignement des blocs.

🧠 Concept clé  
Compose = configuration déclarative

---

## Cas réel

Projet classique :

- API  
- base de données  
- configuration via variables  
- persistance via volumes  

👉 Tout centralisé dans un seul fichier

---

## Bonnes pratiques

- garder un fichier lisible  
- utiliser des noms clairs  
- éviter les configurations inutiles  
- commenter si nécessaire  

---

## Résumé

Le fichier docker-compose.yml permet de :

- décrire une architecture complète  
- centraliser la configuration  
- simplifier le déploiement  

👉 C’est le cœur de Docker Compose  

---

## Notes

*YAML : format de fichier basé sur l’indentation pour structurer des données

---

<!-- snippet
id: docker_compose_yml_concept
type: concept
tech: docker
level: intermediate
importance: high
format: knowledge
tags: compose,yaml,architecture
title: docker-compose.yml — fichier central de l’architecture
content: Le fichier docker-compose.yml décrit toute l’architecture applicative : services, volumes, networks. C’est un fichier YAML dont l’indentation est critique.
description: Structure principale : services (obligatoire), volumes et networks (optionnels)
-->

<!-- snippet
id: docker_compose_yaml_indentation_warning
type: warning
tech: docker
level: intermediate
importance: high
format: knowledge
tags: compose,yaml,erreur
title: YAML — indentation incorrecte casse tout le fichier
content: YAML est très sensible à l’indentation. Une mauvaise indentation peut casser l’ensemble du fichier docker-compose.yml, parfois sans message d’erreur clair de Docker Compose.
description: Toujours vérifier l’alignement des blocs et utiliser des espaces, jamais des tabulations
-->

<!-- snippet
id: docker_compose_ports_mapping
type: concept
tech: docker
level: intermediate
importance: medium
format: knowledge
tags: compose,ports,reseau
title: Mapping de ports dans Compose
content: La clé `ports` expose un port du conteneur sur la machine hôte. Format : "port_hote:port_conteneur".
-->

<!-- snippet
id: docker_compose_environment_inline
type: concept
tech: docker
level: intermediate
importance: medium
format: knowledge
tags: compose,environment,configuration
title: Variables d’environnement inline dans un service
content: La clé `environment` permet d’injecter des variables directement dans un service Compose, sous forme de liste clé=valeur.
-->

<!-- snippet
id: docker_compose_declarative_config
type: concept
tech: docker
level: intermediate
importance: high
format: knowledge
tags: compose,declaratif,architecture
title: Compose = configuration déclarative
content: Docker Compose adopte une approche déclarative : tu décris l’état souhaité de ton architecture, et Compose s’occupe de le réaliser. Tu ne scriptes pas, tu configures.
-->
