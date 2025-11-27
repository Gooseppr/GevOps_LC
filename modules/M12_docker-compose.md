---
layout: page
title: Docker Compose
sujet: Conteneurisation
type: module
jour: 12
ordre: 1
tags: docker compose, yaml, orchestration
---


# 1. Pourquoi Docker Compose existe

## 1.1 Le problème quand on n’a que Docker

Avec Docker “classique”, tu fais les trucs comme :

```bash
docker run -d --name webserver -p 8080:80 nginx
docker run -d --name db postgres:latest
docker run -d --name api --env DB_URL=... my-backend-image

```

Et tu dois toi-même :

- créer les réseaux pour que les conteneurs se parlent,
- publier les bons ports,
- monter les bons volumes,
- injecter les bonnes variables d’environnement,
- lancer les conteneurs dans le bon ordre.

Très vite, c’est le chaos.

Tu finis avec 4 commandes `docker run` longues comme le bras, et si tu veux redémarrer l’environnement sur une autre machine (collègue, staging, prod), tu dois tout retaper à la main. Pas fiable.

## 1.2 La réponse : Docker Compose

Docker Compose, c’est un **orchestrateur local**.

Définition claire :

> Docker Compose est un outil CLI qui permet de définir et gérer un ensemble de conteneurs (qu’on appelle des “services”) comme une seule application, à partir d’un simple fichier YAML (docker-compose.yml).
> 

Traduction pratico-pratique :

- Tu décris TOUT dans un fichier lisible (services, images, ports, volumes, réseau, variables…).
- Et ensuite tu fais :

```bash
docker compose up -d

```

→ et toute l’architecture démarre d’un coup.

Avantage énorme :

- administration par groupe : tu gères toute l’app, pas les conteneurs un par un
- reproductibilité : même stack sur toutes les machines
- clarté : infra = du code lisible

Compose, c’est “l’environnement applicatif complet” versionnable dans Git.

────────────────

# 2. Les concepts fondamentaux de Docker Compose

## 2.1 Service

Un **service** = un conteneur décrit dans `docker-compose.yml`.

Exemple :

- un service `frontend` basé sur une image `nginx`
- un service `backend` basé sur ton image Node/Python
- un service `db` basé sur `postgres`

Ces services tournent ensemble et forment l’application.

Exemple logique d’archi :

- `frontend` parle à `backend`
- `backend` parle à `db`
- `db` stocke les données

Chaque service est déclaré dans le YAML sous `services:`.

Exemple minimal :

```yaml
services:
  web:
    image: nginx:latest
    ports:
      - "8080:80"

```

Ici :

- Le service s’appelle `web`
- Il est lancé depuis l’image `nginx:latest`
- Il rend accessible son port 80 interne sur le port 8080 de ta machine

Tu remarques : au lieu de taper une `docker run -d -p 8080:80 nginx`, tu décris ça dans le YAML.

## 2.2 Réseau entre services

Même si les conteneurs sont isolés, Docker Compose crée automatiquement un réseau interne pour qu’ils puissent communiquer entre eux par leur nom de service.

Exemple :

- `backend` peut parler à `db` via l’URL `postgres://user:pass@db:5432/...`
- Pas besoin d’adresse IP fixe. Le nom du service = le hostname.

C’est ultra important :

> Avec Compose, les services se résolvent par nom DNS automatiquement sur le réseau partagé.
> 

Tu n’ouvres pas ta base de données à l’extérieur. Tu la gardes privée entre conteneurs.

## 2.3 Volumes

Compose te permet aussi de définir des **volumes persistants** (pour ne pas perdre les données à l’arrêt des conteneurs) et/ou des montages de répertoire hôte ↔ conteneur.

Exemple :

- un volume `db_data:` pour PostgreSQL
- un montage d’un dossier `./html` vers `/usr/share/nginx/html` pour Nginx

## 2.4 Variables d’environnement

On peut injecter facilement des variables au runtime d’un service : mots de passe DB, URLs, secrets de dev, etc.

Ces valeurs peuvent venir d’un `.env` que Compose charge automatiquement.

## 2.5 Administration groupée

Tu n’arrêtes plus un service avec `docker stop`, tu arrêtes tout l’environnement avec `docker compose stop`.

Tu vois les logs de toute l’app avec `docker compose logs`, etc.

Compose, c’est du “multi-conteneurs orchestrés”, mais local, simple.

────────────────

# 3. Le fichier `docker-compose.yml`

Voici la structure typique d’un `docker-compose.yml` simple :

```yaml
services:
  nginx:
    image: nginx:latest
    ports:
      - "8080:80"
    volumes:
      - ./html:/usr/share/nginx/html

```

Décryptons :

- `services:`
    
    C’est la section principale. On déclare un service par sous-clé.
    
- `nginx:`
    
    Nom du service (équivaut à `--name nginx` en Docker classique).
    
    Les autres services pourront parler à ce service en l’appelant `nginx`.
    
- `image: nginx:latest`
    
    Image sur laquelle le conteneur est basé.
    
- `ports:`
    
    `"8080:80"` veut dire :
    
    - port 80 du conteneur exposé sur le port 8080 de la machine hôte
- `volumes:`
    
    `./html:/usr/share/nginx/html` veut dire :
    
    - le dossier `./html` (sur ta machine) est monté dans le conteneur à l’emplacement où Nginx cherche ses fichiers statiques
    - du coup, si tu modifies un fichier localement, c’est servi directement par Nginx sans rebuild d’image

👉 En résumé : ce YAML remplace une commande du style :

```bash
docker run -d --name nginx \
  -p 8080:80 \
  -v ./html:/usr/share/nginx/html \
  nginx:latest

```

Compose te donne un environnement déclaratif.

────────────────

# 4. Aller plus loin avec Compose : réseaux, volumes, variables, profils, ordre de démarrage

Dans ce chapitre je vais reprendre tes points avancés un par un.

## 4.1 Réseau entre services

Tu peux forcer l’app à organiser ses propres réseaux logiques.

Exemple : un réseau “front ↔ back” et un autre réseau “config ↔ db”.

```yaml
services:
  frontend:
    image: my-frontend-image
    networks:
      - frontend_backend

  backend:
    image: my-backend-image
    networks:
      - frontend_backend

  db:
    image: my-db-image
    networks:
      - config_db

  config:
    image: my-config-image
    networks:
      - config_db

networks:
  frontend_backend:
  config_db:

```

Lecture pédagogique :

- `frontend` et `backend` partagent le réseau `frontend_backend`, donc `frontend` peut appeler `backend` via `http://backend:PORT`.
- `db` et `config` partagent `config_db`, mais le frontend ne voit pas la DB directement.
- Tu cloisonnes les flux, tu évites que le front prod voie la base si ce n’est pas voulu.

**Résumé :** Compose te laisse créer plusieurs réseaux applicatifs isolés. C’est du mini-SDN (Software Defined Network) local.

---

## 4.2 Volumes partagés entre services

Besoin : plusieurs services doivent lire/écrire le même stockage persistant.

Exemple :

```yaml
services:
  frontend1:
    image: my-frontend-image
    volumes:
      - shared-volume:/app/files

  frontend2:
    image: my-frontend-image
    volumes:
      - shared-volume:/app/files

  frontend3:
    image: my-frontend-image
    volumes:
      - shared-volume:/app/files

volumes:
  shared-volume:

```

Ici :

- On déclare un volume persistant `shared-volume:`
- On le monte dans trois services différents, au même chemin `/app/files`

Pourquoi c’est utile ?

- partage de fichiers générés dynamiquement
- cache commun
- stockage qui survit aux redéploiements

Important :

Les `volumes:` en bas du fichier définissent les volumes “gérés par Docker”, pas juste des montages de répertoire local.

---

## 4.3 Variables d’environnement et fichiers `.env`

Tu veux que ta stack dev n’ait pas les mêmes identifiants que ta stack prod.

Tu peux injecter des variables dans les services :

```yaml
services:
  app:
    image: my-app-image
    environment:
      - DATABASE_URL=${DB_URL}
      - DB_CONFIG=${DB_CONFIG}

  db:
    image: postgres:latest

```

Et tu crées un fichier `.env` à côté de ton `docker-compose.yml`, par exemple `dev.env` :

```
DB_URL=postgres://devuser:dev@db:5432/devdb
DB_CONFIG=dev-config

```

Comment ça marche :

- Docker Compose lit automatiquement un fichier `.env` (par défaut nommé `.env`).
- Les `${VARIABLE}` dans le YAML sont remplacées par les valeurs trouvées dans `.env`.

Très important en équipe :

- Le `.env` contient souvent des secrets → il NE DOIT PAS être versionné dans Git.
    
    Tu mets `.env` dans `.gitignore`.
    

Tu peux aussi utiliser un autre fichier que `.env`, selon la version de compose et tes besoins, mais le pattern commun est :

- `.env` pour dev,
- un autre `.env` privé pour prod.

---

## 4.4 Profils (profiles)

Les profils permettent d’activer certains services seulement dans certains contextes.

Exemple :

```yaml
services:
  frontend:
    image: my-frontend-image
    profiles: ["dev", "prod"]

  backend:
    image: my-backend-image
    profiles: ["dev", "prod"]

  monitoring:
    image: my-monitoring-image
    profiles: ["prod"]

```

Ici :

- `monitoring` ne tourne QUE dans le profil `prod`.
- `frontend` et `backend` tournent dans les deux.

Pour lancer juste le profil dev :

```bash
docker compose --profile dev up -d

```

Pour lancer l’environnement prod :

```bash
docker compose --profile prod up -d

```

Intérêt :

- Tu peux définir des services utiles pour la prod (monitoring, alerting, observabilité, etc.) sans les lancer en dev.
- Tu peux isoler des services coûteux (grosse base Elasticsearch, par ex.) et ne les démarrer que quand tu veux les tester.

---

## 4.5 Ordre de démarrage et dépendances

Problème réel :

Tu veux que `backend` ne démarre pas tant que `db` n’est pas prête.

Tu déclares les dépendances dans Compose avec `depends_on`.

Tu peux aussi définir des `healthcheck` pour indiquer quand un service est “opérationnel”.

Exemple :

```yaml
services:
  db:
    image: postgres:latest
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    image: my-backend-image
    depends_on:
      - db
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 5s
      timeout: 5s
      retries: 5

  frontend:
    image: my-frontend-image
    depends_on:
      - backend

  monitoring:
    image: my-monitoring-image
    depends_on:
      - db
      - backend
      - frontend

```

Lecture importante :

- `depends_on` dit “ce service doit être démarré après l’autre”.
- `healthcheck` dit “ce service est considéré sain quand cette commande renvoie OK”.

But : garantir l’ordre logique de démarrage.

Ex : pas de frontend qui tape un backend mort.

────────────────

# 5. Docker Compose VS Docker (commandes pratiques)

Tu m’as déjà listé un gros mapping Docker ↔ Compose.

Je vais le reformater façon antisèche, pour l’avoir en tête.

## 5.1 Démarrer l’environnement

- Docker Compose (multi-services, orchestré) :
    
    ```bash
    docker compose up
    docker compose up -d        # en arrière-plan
    
    ```
    
- Docker classique (1 seul conteneur) :
    
    ```bash
    docker run ...
    docker run -d ...
    
    ```
    

## 5.2 Arrêter sans supprimer

- Compose :
    
    ```bash
    docker compose stop
    
    ```
    
- Docker :
    
    ```bash
    docker stop <container>
    
    ```
    

## 5.3 Supprimer les conteneurs arrêtés

- Compose :
    
    ```bash
    docker compose rm
    
    ```
    
- Docker :
    
    ```bash
    docker rm <container>
    
    ```
    

## 5.4 Lister les conteneurs

- Compose (services déclarés pour ce projet) :
    
    ```bash
    docker compose ps
    docker compose ps -a
    
    ```
    
- Docker :
    
    ```bash
    docker ps
    docker ps -a
    
    ```
    

## 5.5 Logs

- Compose :
    
    ```bash
    docker compose logs
    docker compose logs -f
    docker compose logs <service>
    
    ```
    
- Docker :
    
    ```bash
    docker logs <container>
    docker logs -f <container>
    
    ```
    

## 5.6 Exécuter une commande dans un conteneur

- Compose :
    
    ```bash
    docker compose exec <service> bash
    docker compose exec <service> <cmd>
    
    ```
    
- Docker :
    
    ```bash
    docker exec -it <container> bash
    docker exec -it <container> <cmd>
    
    ```
    

## 5.7 Construire les images

- Compose :
    
    ```bash
    docker compose build
    
    ```
    
    (Utilise les `build:` de ton compose pour construire les images)
    
- Docker :
    
    ```bash
    docker build -t <image> .
    
    ```
    

## 5.8 Lister les images

- Compose :
    
    ```bash
    docker compose images
    
    ```
    
- Docker :
    
    ```bash
    docker images
    
    ```
    

## 5.9 Réseaux

- Compose crée et gère automatiquement les réseaux déclarés sous `networks:`.
- Docker classique :
    
    ```bash
    docker network create <name>
    docker network ls
    docker network inspect <network>
    
    ```
    

Compose te permet de définir ces réseaux dans le YAML, au même endroit que tes services.

Donc ton infra (réseau inclus) devient du code versionnable.

────────────────

# 6. Exemple complet de `docker-compose.yml`

Voici un exemple cohérent qui assemble tout ce qu’on vient de voir :

- un frontend Nginx
- un backend applicatif
- une base de données Postgres
- un volume persistant pour la DB
- un réseau interne
- usage de variables d’environnement

```yaml
version: "3.9"

services:
  frontend:
    image: my-frontend-image
    ports:
      - "8080:80"
    networks:
      - web
    depends_on:
      - backend

  backend:
    image: my-backend-image
    environment:
      - DATABASE_URL=${DB_URL}
    networks:
      - web
      - db_net
    depends_on:
      - db

  db:
    image: postgres:latest
    environment:
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=${DB_NAME}
    volumes:
      - db_data:/var/lib/postgresql/data
    networks:
      - db_net

networks:
  web:
  db_net:

volumes:
  db_data:

```

Comment on lit ça :

- `frontend` est exposé dehors (`8080:80`) → c’est le point d’entrée utilisateur.
- `backend` n’est pas exposé dehors, mais il est joignable par `frontend` via le réseau `web` sous le nom `backend`.
- `db` n’est pas exposée dehors du tout. Elle vit uniquement sur `db_net`.
- `backend` peut parler à `db` en utilisant l’hôte `db` (car ils partagent `db_net`).
- Les credentials DB (utilisateur/mot de passe/nom DB) sont injectés par variables d’environnement → elles viendront de ton `.env`.

Exemple de `.env` (dans le même dossier) :

```
DB_URL=postgres://devuser:devpass@db:5432/appdb
DB_USER=devuser
DB_PASSWORD=devpass
DB_NAME=appdb

```

Tu lances TOUT :

```bash
docker compose up -d

```

Tu arrêtes TOUT :

```bash
docker compose stop

```

Tu détruis TOUT (conteneurs, mais pas les volumes persos si tu ne précises pas `-v`) :

```bash
docker compose down

```

(`down` est l’opération “stop + rm” pour toute la stack d’un coup)

────────────────

# 7. Résumé pédagogique

Voici les idées clés à retenir absolument :

1. **Compose = orchestration locale.**
    
    Tu décris toute une appli multi-conteneurs dans `docker-compose.yml` au lieu de lancer chaque conteneur à la main avec `docker run`.
    
2. **Service = conteneur géré par Compose.**
    
    Chaque service correspond à une image Docker.
    
    Compose devient la “tour de contrôle” de tous tes services (web, api, db…).
    
3. **Tout est codé** :
    - ports exposés
    - volumes persistants
    - réseaux internes
    - variables d’environnement
    - ordre de démarrage
    
    Donc ton infra devient reproductible, partageable, testable.
    
4. **Réseaux Compose = communication inter-conteneurs par nom de service.**
    
    Plus besoin de deviner des IP.
    
    `backend` peut appeler `db` via `db:5432`.
    
5. **Volumes Compose = persistance.**
    
    Les données survivent même si tu `docker compose down`.
    
    Tu peux aussi partager un même volume entre plusieurs services.
    
6. **Profils = environnements (dev, prod, monitoring...).**
    
    Tu peux définir des services qui ne tournent qu’en prod (`monitoring`) ou qu’en dev (`mock-db`), et choisir lesquels tu démarres :
    
    ```bash
    docker compose --profile prod up -d
    
    ```
    
7. **Healthcheck + depends_on = ordre de démarrage maîtrisé.**
    
    Tu garantis que `backend` attend que `db` soit prête avant de démarrer, etc.
    
    Tu montes une mini-archi fiable qui boot proprement.
    
8. **Commandes essentielles à retenir :**
    - Lancer tout :
        
        ```bash
        docker compose up -d
        
        ```
        
    - Voir l’état :
        
        ```bash
        docker compose ps
        docker compose logs -f
        
        ```
        
    - Ouvrir un shell dans un service :
        
        ```bash
        docker compose exec backend bash
        
        ```
        
    - Stopper tout :
        
        ```bash
        docker compose stop
        
        ```
        
    - Tout détruire proprement :
        
        ```bash
        docker compose down
        
        ```
        

Si tu maîtrises ça, tu sais déjà faire ce que la plupart des boîtes attendent d’un dev backend ou d’un devops junior : lancer une app multi-services complète en une commande.

---
[Module suivant →](M12_pratique-docker-compose.md)
---
