---
layout: page
title: Docker, mise en pratique
sujet: Conteneurisation
type: module
jour: 11
ordre: 3
tags: docker, linux, devops
---

# 1. Introduction – synthèse déclarative du quiz

Une application moderne doit être disponible 24h/24 parce que les utilisateurs (ou les clients) attendent un service constant et fiable.

Quand plusieurs applications tournent sur la même machine physique, elles peuvent entrer en conflit (versions incompatibles, ressources CPU/RAM partagées, plantages qui se propagent).

Pour éviter ça, on cloisonne chaque application dans son propre environnement isolé. La technologie qui rend ça simple, portable et reproductible, c’est Docker.

Docker apporte quatre garanties majeures :

- Isolation : chaque application tourne dans son propre conteneur, ce qui évite les interférences.
- Reproductibilité : une image Docker contient le code + les dépendances + la config. On est sûr que ça tourne pareil partout.
- Portabilité : on build une image une fois, on peut la déployer sur n’importe quelle machine qui a Docker.
- Déploiement rapide : au lieu de reconfigurer un serveur à la main, on “instancie” une image en un conteneur prêt à l’emploi.

Une image Docker est un package en lecture seule (immuable), versionnable (tags), qui sert de modèle.

Un conteneur Docker est une exécution vivante d’une image. Son cycle de vie standard est :

1. création
2. démarrage
3. exécution
4. arrêt
5. suppression

Docker facilite donc :

- la cohabitation d’applications sur la même machine sans conflit,
- la mise en production,
- l’industrialisation du déploiement (CI/CD),
- la maintenance (tu peux recréer l’environnement exact d’un bug).

En bref : Docker te donne des environnements isolés, maîtrisés, reproductibles et faciles à déployer.

Tu sais maintenant le justifier clairement en entretien.

––––––––––––––––––

# 2. Concepts de base à comprendre absolument

## 2.1 Image vs Conteneur

- **Image** = modèle figé. Ça définit “à quoi ressemble le système”. Exemple : `nginx:stable`, `debian:latest`, `nginx-lacapsule:alpha`.
- **Conteneur** = instance qui tourne à partir de cette image. Exemple : `webserver`, `mydebian`.

Une image peut avoir plusieurs tags (ex: `nginx-lacapsule:alpha`, `nginx-lacapsule:latest`) mais c’est le même contenu interne.

## 2.2 Le Dockerfile

C’est un script texte qui décrit comment construire une image :

```docker
FROM nginx:stable        # image de base
COPY index.html ...      # ajoute des fichiers
RUN chmod ...            # prépare l’environnement
EXPOSE 81                # documente le port interne
CMD ["nginx", ...]       # commande de démarrage

```

Le `FROM nom:tag` :

- `nom` = le repository (ici `nginx`)
- `tag` = la version spécifique (ici `stable`)
    
    Le `:` sépare le nom de l’image et son tag de version.
    

Si tu écris juste `nginx`, Docker prend `nginx:latest` par défaut.

En prod on évite `latest`, on choisit des tags contrôlés (`stable`, `1.25.3`, etc.) pour être prévisible.

––––––––––––––––––

# 3. Manipuler les conteneurs

## 3.1 Installer Docker

(Exemple Debian / Ubuntu, version CLI officielle)

1. Installer les dépendances et la clé GPG du repo Docker (doc officielle Docker Engine).
2. Ajouter ton user au groupe docker pour ne pas avoir besoin de sudo :

```bash
sudo usermod -aG docker $USER
newgrp docker

```

1. Vérifier l’installation :

```bash
docker --version

```

## 3.2 Lancer un conteneur simple

Le cas école :

```bash
docker run hello-world

```

Ça télécharge l’image `hello-world` (si pas déjà locale), crée un conteneur, l’exécute, puis le conteneur s’arrête.

## 3.3 Lister les conteneurs

```bash
docker ps        # conteneurs EN COURS
docker ps -a     # tous les conteneurs (y compris arrêtés)

```

À lire dans `docker ps` :

- CONTAINER ID : identifiant unique
- IMAGE : à partir de quelle image il tourne
- STATUS : Up / Exited
- PORTS : mapping réseau
- NAMES : nom du conteneur (ex: `webserver`)

## 3.4 Supprimer un conteneur

```bash
docker rm <nom_ou_id>

```

⚠️ S’il est encore en cours d’exécution tu feras d’abord :

```bash
docker stop <nom_ou_id>
docker rm   <nom_ou_id>

```

## 3.5 Mode interactif

Lancer Debian en mode interactif avec un shell :

```bash
docker run -it --name mydebian debian bash

```

- `i` : interactif
- `t` : pseudo-terminal
- `-name mydebian` : je choisis le nom du conteneur
- `debian` : image utilisée
- `bash` : commande lancée à l’intérieur

Quand tu tapes `exit` dans le shell du conteneur interactif :

- tu sors,
- le process principal (`bash`) s’arrête,
- donc le conteneur passe en état `Exited`.

## 3.6 Redémarrer un conteneur existant

Si tu veux relancer un conteneur déjà créé (plutôt que d’en recréer un nouveau) :

```bash
docker start mydebian

```

Entrer dedans après démarrage :

```bash
docker exec -it mydebian bash

```

Différence clé :

- `docker run` = créer + démarrer un NOUVEAU conteneur
- `docker start` = redémarrer un conteneur existant (arrêté)
- `docker exec` = ouvrir un shell DANS un conteneur qui tourne

## 3.7 Voir / suivre les logs

```bash
docker logs -f webserver

```

- `f` = follow temps réel
    
    Tu peux laisser ça tourner dans un terminal, puis dans un autre envoyer du trafic avec `curl`, et tu vois les requêtes apparaître en live.
    

––––––––––––––––––

# 4. Réseau et publication de ports

Par défaut, un conteneur est isolé. S’il écoute sur son port interne (par exemple 80 pour Nginx), ce port n’est PAS accessible depuis ta machine hôte tant que tu ne l’as pas publié.

## 4.1 Lancer un serveur web Nginx en tâche de fond

```bash
docker run -d --name webserver nginx

```

- `d` = détaché (le conteneur tourne en arrière-plan)

Regarde son état :

```bash
docker ps

```

Tu verras souvent `PORTS` vide ou `80/tcp` sans mapping → ça veut dire “Nginx écoute bien sur 80 à l’intérieur du conteneur, mais ce port n’est pas partagé vers l’extérieur”.

Si tu fais sur l’hôte :

```bash
curl http://localhost

```

Tu peux avoir un `Failed to connect`, ce qui est normal.

## 4.2 Exposer un port vers l’hôte

On supprime et on relance proprement le conteneur avec un mapping de port :

```bash
docker stop webserver
docker rm webserver

docker run -d -p 8080:80 --name webserver nginx

```

Lecture de `-p 8080:80` :

- `8080` = port de TA machine (hôte)
- `80` = port DANS le conteneur

Donc maintenant, tu peux faire :

```bash
curl http://localhost:8080

```

et tu obtiens la page “Welcome to nginx!”.

## 4.3 Vérifier les ports publiés

```bash
docker ps

```

Tu dois voir une colonne PORTS du style :

```
0.0.0.0:8080->80/tcp

```

Ça veut dire : tout ce qui arrive sur ton port 8080 est redirigé vers le port 80 à l’intérieur du conteneur.

## 4.4 Collision de port

Si tu fais :

```bash
docker run -d -p 8080:81 --name webserver2 nginx-lacapsule:alpha

```

et que 8080 est déjà utilisé par un autre conteneur, Docker va te dire : `port is already allocated`.

Chaque port externe (sur l’hôte) ne peut servir qu’un seul conteneur à la fois.

Tu peux contourner en choisissant un autre port hôte (`-p 8081:81` par exemple).

––––––––––––––––––

# 5. Volumes et persistance

Problème :

Si tu modifies un fichier à l’intérieur d’un conteneur (ex : tu changes la page HTML dans Nginx), puis tu détruis ce conteneur et tu le relances depuis l’image d’origine → tu perds la modification.

Normal : le conteneur est éphémère.

Solution : les **volumes Docker**.

## 5.1 Créer un volume

```bash
docker volume create nginx_data

```

## 5.2 Lancer un conteneur avec un volume monté

```bash
docker run -d \
  -p 8080:80 \
  --name webserver \
  -v nginx_data:/usr/share/nginx/html \
  nginx

```

Ici :

- `/usr/share/nginx/html` = dossier où Nginx lit ses fichiers HTML.
- `nginx_data` = volume persistant géré par Docker.

Donc si tu modifies `index.html` dans ce répertoire, le contenu reste même si tu supprimes et recrées le conteneur.

## 5.3 Modifier le contenu servi par Nginx

Entre dans le conteneur :

```bash
docker exec -it webserver bash

```

Puis remplace la page :

```bash
echo "Welcome to my persistent Nginx server!" > /usr/share/nginx/html/index.html
exit

```

Teste :

```bash
curl http://localhost:8080

```

Tu dois voir ton message custom.

Redémarre le conteneur :

```bash
docker restart webserver
curl http://localhost:8080

```

=> Ton message est toujours là. Persistance validée ✅

## 5.4 Inspecter / lister les volumes

Lister :

```bash
docker volume ls

```

Détails d’un volume :

```bash
docker volume inspect nginx_data

```

Tu verras notamment `Mountpoint`, qui est l’endroit où Docker stocke physiquement les fichiers sur l’hôte (`/var/lib/docker/volumes/.../_data`).

## 5.5 Supprimer un volume

⚠️ On ne peut pas supprimer un volume s’il est encore utilisé par un conteneur.

Séquence correcte :

```bash
docker stop webserver
docker rm webserver
docker volume rm nginx_data

```

––––––––––––––––––

# 6. Créer ses propres images avec un Dockerfile

Jusqu’ici tu utilises des images existantes (`nginx`, `debian`).

Maintenant tu fais TA PROPRE image.

## 6.1 Exemple simple

Dockerfile minimal :

```docker
FROM nginx:latest
RUN touch /test.txt

```

Build :

```bash
docker build -t mynginx .

```

Lister :

```bash
docker images

```

Tu verras `mynginx` en `latest`.

Lancer un conteneur basé sur cette image :

```bash
docker run -d -p 8080:80 --name webserver2 mynginx

```

Vérifier que Nginx répond :

```bash
curl http://localhost:8080

```

Entrer dedans et vérifier `test.txt` :

```bash
docker exec -it webserver2 bash
ls /
exit

```

Idée clé :

- Ce fichier `test.txt` existe dans l’image → donc chaque conteneur créé depuis cette image aura ce fichier.
- Ça, c’est la différence entre “je modifie un conteneur en live” (temporaire) et “j’intègre la modif dans l’image” (reproductible).

## 6.2 Tagger une image (versionner)

Tu peux créer une version spécifique :

```bash
docker build -t mynginx:1.0 .

```

Et tu peux dupliquer le tag (par exemple ajouter `latest`) :

```bash
docker tag mynginx:1.0 mynginx:latest

```

Affiche :

```bash
docker images

```

Tu verras `mynginx` listé 2 fois avec le même IMAGE ID mais des tags différents (`1.0`, `latest`).

C’est exactement ce que tu as fait pour `nginx-lacapsule:alpha`.

––––––––––––––––––

# 7. Analyser une image Docker avec dive

`dive` est un outil qui te montre :

- chaque couche créée par chaque instruction du Dockerfile (`FROM`, `RUN`, `COPY`, etc.)
- la taille de chaque couche
- les fichiers ajoutés ou modifiés à chaque étape
- un score d’efficacité (wasted space)

### 7.1 Installer dive

(sur Debian-like sans snap, comme tu l’as fait)

1. Récupérer le `.deb` de la dernière version depuis GitHub Releases.
2. Installer :

```bash
sudo apt install ./dive_<version>_linux_amd64.deb

```

### 7.2 Lancer dive

```bash
dive mynginx
# ou
dive nginx-lacapsule:alpha

```

⚠ Important :

- `dive` s’applique à une IMAGE, pas à un conteneur.
- Donc tu lui donnes le nom/tag de l’image (`nginx-lacapsule:alpha`), pas le nom du conteneur (`webserver`).

### 7.3 Interpréter

Dans dive tu verras :

- à gauche : la liste des Layers avec la commande Dockerfile qui les a créées,
- à droite : l’arborescence de fichiers après cette couche,
- en bas : “Image efficiency score”.

![Interface Dive](../images/Capture%20d%27%C3%A9cran%202025-10-27%20132312.png)

Intérêt pédagogique :

- comprendre l’impact de chaque `RUN`, `COPY`, `ADD`,
- détecter les couches trop lourdes,
- optimiser les Dockerfile pour produire des images légères (ex : préférer `nginx:alpine`, fusionner plusieurs RUN en un RUN unique, nettoyer les caches APT dans la même couche).

––––––––––––––––––

# 8. Cas concret : construire une image Nginx “prod-ready”

Ici tu as fait une image `nginx-lacapsule:alpha` qui respecte des contraintes “vraie vie” :

1. Utiliser Nginx en version stable, pas latest
2. Cacher la version Nginx dans les headers HTTP (`server_tokens off`)
3. Écouter sur le port 81, pas 80
4. Servir ta page HTML personnalisée `index-lacapsule.html`
5. Donner les bonnes permissions de lecture au HTML (sinon 403)
6. Exposer le bon port

### 8.1 Fichier `nginx.conf`

```
user  nginx;
worker_processes  auto;

error_log  /var/log/nginx/error.log notice;
pid        /var/run/nginx.pid;

events {
    worker_connections  1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile        on;
    keepalive_timeout  65;

    include /etc/nginx/conf.d/*.conf;

    server_tokens off;  # → masque la version Nginx
}

```

### 8.2 Fichier `default.conf`

```
server {
    listen       81;
    listen  [::]:81;
    server_name  localhost;

    location / {
        root   /usr/share/nginx/html;
        index  index-lacapsule.html;
    }
}

```

Ici :

- Nginx écoute sur le port 81 au lieu du 80.
- La page par défaut est `index-lacapsule.html`.

### 8.3 Fichier HTML `index-lacapsule.html`

(Tu mets ici ton contenu personnalisé, branding Capsule / Goose, etc.)

Exemple :

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>La Capsule - Serveur Nginx Stable</title>
  <style>
    body { background:#111; color:#0f0; font-family:sans-serif; text-align:center; padding-top:10vh; }
    h1 { font-size:2rem; margin-bottom:1rem; }
    p { opacity:0.8; }
  </style>
</head>
<body>
  <h1>Bienvenue sur le serveur Nginx stable de La Capsule 🚀</h1>
  <p>Port d'écoute interne : 81 | Version masquée | Image Docker custom</p>
</body>
</html>

```

### 8.4 Dockerfile final (prod-style)

```docker
FROM nginx:stable

# On enlève la conf par défaut de l'image officielle
RUN rm /etc/nginx/conf.d/default.conf

# On injecte nos fichiers de config
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf
COPY index-lacapsule.html /usr/share/nginx/html/index-lacapsule.html

# On s'assure que Nginx pourra lire le HTML
RUN chmod +r /usr/share/nginx/html/index-lacapsule.html

# On documente le port interne (81)
EXPOSE 81

# On lance Nginx en avant-plan (obligatoire en conteneur)
CMD ["nginx", "-g", "daemon off;"]

```

Points clés :

- `FROM nginx:stable`
    
    ⇒ on choisit explicitement le tag `stable`.
    
    Le `:` sépare le nom (`nginx`) du tag (`stable`).
    
- `server_tokens off;` dans `nginx.conf`
    
    ⇒ cache la version exacte de Nginx dans les headers HTTP.
    
- `listen 81;`
    
    ⇒ le service écoute en interne sur 81.
    
- `EXPOSE 81`
    
    ⇒ on documente que le conteneur attend du trafic sur 81.
    
- `chmod +r`
    
    ⇒ permission de lecture pour l’utilisateur `nginx` dans le conteneur.
    

### 8.5 Build + run + test

Build l’image avec un tag de version :

```bash
docker build -t nginx-lacapsule:alpha .

```

Optionnellement, ajoute un tag `latest` aussi :

```bash
docker tag nginx-lacapsule:alpha nginx-lacapsule:latest

```

Lance le conteneur à partir de cette image :

```bash
docker run -d -p 8080:81 --name webserver nginx-lacapsule:alpha

```

Ici :

- Port 81 interne du conteneur
- exposé sur le port 8080 de la machine hôte

Test HTTP simple :

```bash
curl http://localhost:8080

```

Test des headers HTTP (inclut les en-têtes `Server:` pour vérifier que la version est masquée) :

```bash
curl -v http://localhost:8080

```

Tu dois voir :

- ta page HTML personnalisée
- pas de version Nginx dans `Server:` (juste `Server: nginx` sans numéro)

––––––––––––––––––

# 9. Antisèche finale des commandes Docker à connaître

## Installation / setup

```bash
docker --version
sudo usermod -aG docker $USER
newgrp docker

```

## Images

```bash
docker images
docker pull debian
docker rmi <image_id>          # supprime une image locale

```

## Conteneurs

```bash
docker run IMAGE
docker run -it --name mydebian debian bash
docker run -d --name webserver nginx
docker run -d -p 8080:80 --name webserver nginx
docker exec -it webserver bash
docker logs -f webserver
docker ps
docker ps -a
docker stop webserver
docker rm webserver
docker start webserver
docker restart webserver

```

## Volumes

```bash
docker volume create nginx_data
docker run -d -p 8080:80 --name webserver -v nginx_data:/usr/share/nginx/html nginx
docker volume ls
docker volume inspect nginx_data
docker stop webserver && docker rm webserver && docker volume rm nginx_data

```

## Réseaux Docker (bonus)

```bash
docker network create my_network
docker run -d --name webserver --network my_network nginx
docker run -it --name debian-container --network my_network debian bash
# puis dans debian-container :
ping webserver

```

## Build d’image custom

```bash
docker build -t mynginx .
docker build -t mynginx:1.0 .
docker tag mynginx:1.0 mynginx:latest
docker run -d -p 8080:80 --name webserver2 mynginx:1.0

```

## Nginx custom prod-ready

```bash
docker build -t nginx-lacapsule:alpha .
docker tag nginx-lacapsule:alpha nginx-lacapsule:latest
docker run -d -p 8080:81 --name webserver nginx-lacapsule:alpha
curl -v http://localhost:8080

```

## Analyse d’image avec dive

```bash
dive nginx-lacapsule:alpha
# inspecte les couches, la taille, les fichiers ajoutés à chaque étape du Dockerfile

```

––––––––––––––––––![Texte alternatif](chemin/vers/image.png)



---

<!-- snippet
id: docker_module_pratique_port_mapping
type: command
tech: docker
level: beginner
importance: high
format: knowledge
tags: docker,port,réseau,nginx
title: Publier un port conteneur vers l'hôte
context: rendre un service Docker accessible depuis l'extérieur du conteneur
command: docker run -d -p 8080:80 --name webserver nginx
description: Le format -p hôte:conteneur redirige le port 8080 de la machine vers le port 80 interne. Sans ce mapping, le conteneur est isolé et inaccessible depuis l'hôte.
-->

<!-- snippet
id: docker_module_pratique_volume_create
type: command
tech: docker
level: beginner
importance: high
format: knowledge
tags: docker,volume,persistance,données
title: Monter un volume pour persister les données
context: éviter la perte de données lors de la suppression d'un conteneur
command: docker run -d -p 8080:80 --name webserver -v nginx_data:/usr/share/nginx/html nginx
description: Crée un volume nommé nginx_data et le monte dans le conteneur. Les données survivent à docker stop && docker rm. Lister avec docker volume ls, inspecter avec docker volume inspect nginx_data.
-->

<!-- snippet
id: docker_module_pratique_exec_shell
type: command
tech: docker
level: beginner
importance: high
format: knowledge
tags: docker,exec,shell,debug
title: Ouvrir un shell dans un conteneur en cours
context: déboguer ou modifier un conteneur en exécution
command: docker exec -it webserver bash
description: Ouvre un terminal interactif dans le conteneur. Utiliser sh si bash n'est pas disponible (images Alpine). Différent de docker run qui crée un nouveau conteneur.
-->

<!-- snippet
id: docker_module_pratique_image_custom
type: command
tech: docker
level: intermediate
importance: high
format: knowledge
tags: docker,image,build,tag,prod
title: Builder et tagger une image custom prod-ready
context: créer une image Docker versionnée prête pour la production
command: docker build -t nginx-lacapsule:alpha . && docker tag nginx-lacapsule:alpha nginx-lacapsule:latest
description: Construit l'image avec tag versionné puis ajoute un alias latest. En prod, utiliser des tags contrôlés (ex: nginx:stable) pour la reproductibilité.
-->

<!-- snippet
id: docker_module_pratique_env_vars
type: concept
tech: docker
level: beginner
importance: medium
format: knowledge
tags: docker,env,variables,dockerfile
title: Priorité des variables d'environnement dans Docker
context: comprendre quel ENV est appliqué quand plusieurs sources coexistent
content: Priorité décroissante : environment: dans Compose > env_file: > ENV dans le Dockerfile. La valeur la plus proche du runtime écrase toujours celle définie au build.
-->

---
[← Module précédent](M11_dockers.md)
---
