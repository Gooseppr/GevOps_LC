---
title: Serveurs Web & Reverse Proxy
sujet: Cloud publique, Hosting & Cloud
type: module
jour: 31
ordre: 1
tags: proxy, server, devops, nginx, apache, envoy, treafik, haproxy, caddy, certificats, http, https
---

# 1. Objectifs du module

À la fin de ce module, tu sauras :

- Expliquer clairement **ce qu’est un serveur web**, son rôle dans une architecture, et ce qu’il gère (HTTP, sécurité de base, cache, compression…).
- Expliquer **ce qu’est un reverse proxy**, la différence avec un proxy “classique”, et pourquoi c’est central dans une infra moderne.
- Installer et utiliser **Apache** et **Nginx** :
    - en direct sur une machine Linux,
    - ou dans un conteneur Docker.
- Configurer :
    - un **site statique**,
    - un **VirtualHost** / bloc `server`,
    - un **reverse proxy vers une appli** (Node, PHP, API…).
- Lire et exploiter les **logs** (access / error) pour comprendre ce qui se passe.
- Connaître les autres reverse proxies : **Traefik, HAProxy, Envoy, Caddy** et savoir *dans quel contexte* les utiliser.
- Comprendre le rôle des **certificats HTTPS** et comment les serveurs / reverse proxies aident à les gérer.

---

# 2. Rappels : architecture web & HTTP

## 2.1. Vue d’ensemble

Une appli web moderne, c’est rarement “un seul serveur magique”.

Schéma logique :

- **Client** : navigateur, appli mobile, autre service.
- **Serveur Web / Reverse Proxy** : point d’entrée HTTP/HTTPS.
- **Applications** : API, CMS, backends divers.
- **Base de données** : stockage persistant.

Exemple typique :

```
Client (navigateur)
        |
        v
[ Serveur Web / Reverse Proxy ]
        |
   +----+-------------------------+
   |                              |
   v                              v
Front-end statique (HTML/JS)   API backend (Node/PHP)
                                  |
                                  v
                              Base de données

```

Ce dessin signifie :

- Tout passe **d’abord** par le serveur web / reverse proxy.
- Ensuite, selon l’URL ou le domaine, les requêtes sont envoyées au bon service interne.

---

## 2.2. Le protocole HTTP en 2 minutes

Le client et le serveur web parlent **HTTP** (ou HTTPS, qui est HTTP + chiffrement TLS).

Une requête HTTP contient :

- une **méthode** : `GET`, `POST`, `PUT`, `DELETE`…
- une **URL** : `/`, `/api/users`, `/image.png`…
- des **en-têtes** (headers) : infos supplémentaires (`Authorization`, `Accept`, `User-Agent`, etc.)
- éventuellement un **corps** (body) pour `POST`, `PUT`…

Le serveur répond avec :

- un **code de statut** :
    - `1xx` : info provisoire
    - `2xx` : succès (`200 OK`, `201 Created`)
    - `3xx` : redirection (`301`, `302`)
    - `4xx` : erreur côté client (`400`, `404`)
    - `5xx` : erreur côté serveur (`500`, `502`, `504`)
- des **headers** : type de contenu, cache, cookies…
- un **corps** : HTML, JSON, image, etc.

Comprendre ces codes est vital pour lire les logs et dépanner.

---

# 3. Le serveur web

## 3.1. Définition

> Un serveur web est un logiciel (pas une machine) qui écoute sur un port réseau (80/443), reçoit des requêtes HTTP/HTTPS, et renvoie des réponses adaptées.
> 

Il peut tourner :

- sur une **machine physique** ou VM,
- dans un **conteneur Docker**,
- parfois dans des environnements managés (PaaS).

### Rôles principaux

- Gérer le **protocole HTTP/HTTPS** (parler avec les clients).
- **Servir des fichiers statiques** : HTML, CSS, JS, images, PDF…
- Faire l’interface avec des **applis dynamiques** (PHP, Node, Python, Java…).
- Apporter une première couche de **sécurité** :
    - filtrage basique,
    - HTTPS,
    - limitation de certaines méthodes…
- Améliorer les **performances** :
    - cache,
    - compression (gzip, Brotli),
    - réutilisation de connexions.

Il simplifie la vie des devs : ils se concentrent sur l’application, le serveur web “gère le web”.

---

## 3.2. Fonctionnement général

1. Le serveur web **écoute** sur `:80` (HTTP) et/ou `:443` (HTTPS).
2. Une requête arrive :
    
    `GET /index.html HTTP/1.1`
    
3. Il analyse l’URL et sa configuration :
    - “Cette URL correspond à **tel dossier** ?”
    - “Ou je dois la transmettre à **telle appli** ?”
4. Il renvoie soit :
    - directement **un fichier** (`/var/www/monsite/index.html`),
    - soit la **réponse d’une appli** à laquelle il a transmis la requête.
5. Il écrit tout ça dans ses **logs** d’accès et d’erreurs.

---

## 3.3. Architectures possibles

Tu as noté quelque chose de très important :

> Serveur [ Frontend <--> Backend <--> BDD ]
> 
> 
> Serveur [ Frontend ] <--> Serveur [ Backend <--> BDD ]
> 

Les deux scénarios existent.

1. **Tout-en-un :**
    - Un seul serveur héberge le front, le backend et parfois la BDD.
    - Simple mais peu scalable.
2. **Séparé :**
    - Un serveur (ou conteneur) pour le front (HTML/JS),
    - Un autre pour l’API backend,
    - Une BDD séparée.
    - Le serveur web / reverse proxy sert d’**aiguilleur** entre tout ça.

C’est là que les reverse proxies deviennent clés.

---

## 3.4. Cas d’usage typiques

Tu les as listés, on les détaille :

1. **Site vitrine ou blog**
    - Fichiers **statiques** générés (Hugo, Jekyll) ou HTML “classique”.
    - Le serveur web lit simplement sur disque et envoie les fichiers.
2. **Fichiers statiques**
    - Images, vidéos, PDF, JS, CSS, polices…
    - Utilisé pour des **CDN maison**, des portails internes, etc.
3. **Applications dynamiques**
    - Site WordPress, Laravel, Symfony, Django, Node, etc.
    - Le serveur web devient une **passerelle** vers l’application :
        - il transmet la requête,
        - attend la réponse,
        - la renvoie au client.
4. **API REST**
    - Front-end (React, Vue) ou appli mobile qui appelle `/api/...`.
    - Le serveur web/reverse proxy reçoit la requête et la transmet à l’API.
5. **Autres exemples**
    - **Webhooks** : endpoint appelé par un service externe (Stripe, GitHub…).
    - **Health checks** pour du monitoring (`/health`, `/status`).
    - **Portails internes** d’entreprise (intranet, outils métiers, etc.).

---

# 4. Le reverse proxy

## 4.1. Définition et différence avec un proxy “classique”

- **Proxy classique (forward proxy)** :
    - placé **côté client**,
    - sert à masquer l’IP du client, filtrer sa navigation, etc.
- **Reverse proxy** :
    - placé **côté serveur**,
    - les clients ne savent même pas qu’il existe,
    - il reçoit les requêtes pour un ou plusieurs sites, et les **redirige vers les bons serveurs internes**.

On peut le voir comme le **standardiste / réceptionniste** de ton infra :

> Il reçoit tous les appels (“je veux /api/users”), et transfère au bon service sans que l’appelant voie la structure interne.
> 

---

## 4.2. Pourquoi utiliser un reverse proxy ?

Tu l’avais déjà bien noté, on organise :

### 1. Sécurité

- Seul le reverse proxy est exposé sur Internet.
- Les applis internes ne sont pas directement accessibles :
    - ports non exposés,
    - parfois même réseau privé.
- Il peut :
    - filtrer des IP,
    - limiter certaines méthodes HTTP,
    - n’autoriser que HTTPS,
    - faire du **rate limiting**, etc.

### 2. Performance

- Mise en **cache** de pages ou de réponses API.
- **Compression** des réponses (gzip, Brotli).
- Réutilisation de connexions vers les backends.
- **Load balancing** : répartir la charge sur plusieurs instances d’un même service.

### 3. Souplesse / organisation

- Plusieurs applis derrière un même domaine :
    - `/api` → API backend
    - `/blog` → WordPress
    - `/app` → SPA React
- Tu peux changer l’infrastructure interne (ports, machines, conteneurs…) sans changer l’URL côté client.

---

## 4.3. Routage vs redirection

Tu as déjà la bonne intuition, on la formalise.

### Routage (reverse proxy)

- **Transparent pour le client**.
- Le client demande `https://monsite.com/api/users`.
- Le reverse proxy route en interne vers :
    - `http://backend:3000/api/users` par exemple.
- L’URL dans le navigateur **ne change pas**.

👉 Utilisé pour connecter plusieurs services derrière un même point d’entrée.

### Redirection (HTTP 3xx)

- **Visible pour le client**.
- Le serveur répond avec un code `301` ou `302` + nouvelle URL.
- Le navigateur reçoit : “Va plutôt sur `https://monsite.com/login`”.
- L’URL **change dans la barre d’adresse**.

👉 Exemple classique : rediriger tout le trafic `http://` vers `https://`.

---

# 5. Apache HTTP Server

## 5.1. Installation

### Sur Debian / Ubuntu

```bash
sudo apt update
sudo apt install -y apache2
sudo systemctl status apache2

```

Si pare-feu actif (UFW) :

```bash
sudo ufw allow 'Apache'

```

### Via Docker

Apache s’appelle `httpd` dans Docker Hub :

```bash
docker run --rm -d -p 8080:80 --name apache httpd:latest

```

Ou avec ton propre site :

```bash
docker run --rm -d -p 8080:80 \
  -v $(pwd)/public:/usr/local/apache2/htdocs:ro \
  --name apache httpd:latest

```

---

## 5.2. Fichiers de configuration (modularité)

Sur Debian/Ubuntu, arborescence classique :

```
/etc/apache2/
├── apache2.conf         # config globale
├── sites-available/     # définitions de sites (VirtualHost)
│   ├── 000-default.conf
│   └── monsite.conf
├── sites-enabled/       # liens symboliques vers les sites actifs
├── mods-available/      # modules disponibles
├── mods-enabled/        # modules activés
└── conf-available/conf-enabled (snippets divers)

```

Dans l’image Docker officielle (httpd) :

- fichier principal : `/usr/local/apache2/conf/httpd.conf`

### Pourquoi c’est important ?

- Tu peux activer / désactiver des **sites** sans casser le reste.
- Tu peux activer / désactiver des **modules** (proxy, rewrite, headers…) selon le besoin.
- Tu peux organiser tes configs par projet.

---

## 5.3. Commandes CLI utiles (Apache)

```bash
# Service
sudo systemctl start apache2
sudo systemctl stop apache2
sudo systemctl restart apache2
sudo systemctl reload apache2    # recharge la conf sans couper les connexions
sudo systemctl status apache2

# Activer / désactiver un site
sudo a2ensite monsite.conf
sudo a2dissite 000-default.conf

# Activer / désactiver un module
sudo a2enmod proxy proxy_http headers rewrite
sudo a2dismod proxy_http

# Tester la configuration
sudo apache2ctl configtest

```

Toujours faire un `configtest` avant de recharger en prod.

---

## 5.4. Logs Apache

- **Accès** : `/var/log/apache2/access.log`
- **Erreurs** : `/var/log/apache2/error.log`

Suivre les deux en temps réel :

```bash
sudo tail -f /var/log/apache2/access.log /var/log/apache2/error.log

```

Réflexe à prendre :

→ quand une page ne marche pas comme prévu, tu regardes les logs côté navigateur **et** côté Apache.

---

## 5.5. Servir un site statique

Dossier par défaut : `/var/www/html`.

Test rapide :

```bash
echo "<h1>Hello Apache</h1>" | sudo tee /var/www/html/index.html

```

Puis `http://localhost` → tu dois voir “Hello Apache”.

---

## 5.6. VirtualHost (héberger plusieurs sites)

Un `VirtualHost` permet de dire :

“Pour tel nom de domaine, utilise tel dossier, tels logs, telles règles”.

Exemple minimal :

```
<VirtualHost *:80>
    ServerName monsite.local
    DocumentRoot /var/www/mysite

    <Directory /var/www/mysite>
        Require all granted
        AllowOverride All
    </Directory>

    ErrorLog  ${APACHE_LOG_DIR}/monsite_error.log
    CustomLog ${APACHE_LOG_DIR}/monsite_access.log combined
</VirtualHost>

```

Étapes :

```bash
sudo mkdir -p /var/www/mysite
echo "<h1>Mon site</h1>" | sudo tee /var/www/mysite/index.html

sudo nano /etc/apache2/sites-available/monsite.conf   # y coller le VirtualHost
sudo a2ensite monsite.conf
sudo systemctl reload apache2

```

Et dans `/etc/hosts` :

```
127.0.0.1    monsite.local

```

→ `http://monsite.local` fonctionne, avec ses propres logs.

---

## 5.7. Apache en reverse proxy

### Activer les modules nécessaires

```bash
sudo a2enmod proxy proxy_http headers
# WebSocket éventuel :
sudo a2enmod proxy_wstunnel
sudo systemctl reload apache2

```

### Exemple : proxy vers une app Node sur `localhost:3000`

```
<VirtualHost *:80>
    ServerName monapp.local

    ProxyPreserveHost On
    RequestHeader set X-Forwarded-Proto "http"

    ProxyPass        /  http://localhost:3000/
    ProxyPassReverse /  http://localhost:3000/

    # WebSocket (optionnel)
    ProxyPass        /socket ws://localhost:3000/socket
    ProxyPassReverse /socket ws://localhost:3000/socket

    ErrorLog  ${APACHE_LOG_DIR}/monapp_error.log
    CustomLog ${APACHE_LOG_DIR}/monapp_access.log combined
</VirtualHost>

```

Ce que ça donne en pratique :

- Le client demande `http://monapp.local/users`.
- Apache transmet à `http://localhost:3000/users`.
- Le backend répond → Apache renvoie la réponse au client.
- L’utilisateur ne voit jamais le port 3000.

---

# 6. Nginx

## 6.1. Installation

### Debian / Ubuntu

```bash
sudo apt update
sudo apt install -y nginx
sudo systemctl status nginx
sudo ufw allow 'Nginx Full'

```

### Docker

```bash
docker run --rm -d -p 8080:80 --name nginx nginx:latest

```

Avec config et contenu persos :

```bash
docker run --rm -d -p 8080:80 --name nginx \
  -v $(pwd)/nginx.conf:/etc/nginx/nginx.conf:ro \
  -v $(pwd)/html:/usr/share/nginx/html:ro \
  nginx:latest

```

---

## 6.2. Fichiers de configuration

Arborescence classique :

```
/etc/nginx/
├── nginx.conf           # fichier principal
├── sites-available/     # définitions de sites
├── sites-enabled/       # liens vers sites actifs
└── conf.d/              # petits fichiers *.conf supplémentaires

```

Nginx lit `nginx.conf`, qui peut ensuite inclure les autres.

### Commandes utiles

```bash
# Tester la config
sudo nginx -t

# Recharger (sans couper les connexions)
sudo systemctl reload nginx
# ou
sudo nginx -s reload

```

Toujours `nginx -t` avant un reload.

---

## 6.3. Logs Nginx

- **Accès** : `/var/log/nginx/access.log`
- **Erreurs** : `/var/log/nginx/error.log`

Suivi en temps réel :

```bash
sudo tail -f /var/log/nginx/access.log /var/log/nginx/error.log

```

Comme pour Apache, réflexe debugging.

---

## 6.4. Servir un site statique

Bloc `server` minimal :

```
server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ =404;
    }
}

```

- `root` : dossier de base.
- `index` : fichier par défaut.
- `try_files` : si le fichier n’existe pas → 404.

Tu peux changer `root` pour ton dossier projet (`/var/www/mysite`), et y mettre tes fichiers.

---

## 6.5. Nginx en reverse proxy

### Exemple complet vers app Node sur `localhost:3000`

```
server {
    listen 80;
    server_name monapp.local;

    location / {
        proxy_pass http://localhost:3000;

        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_http_version 1.1;
        proxy_read_timeout 60s;
    }

    # WebSocket (facultatif)
    location /socket {
        proxy_pass http://localhost:3000;
        proxy_set_header Upgrade    $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host       $host;
    }
}

```

Explications rapides :

- `proxy_pass` : où envoyer les requêtes.
- `proxy_set_header` : transmet au backend les infos utiles (IP client, host, protocole).
- Bloc `/socket` : pour les connexions WebSocket.

---

## 6.6. Apache vs Nginx : quand utiliser quoi ?

Sans tout détailler à l’extrême :

- **Apache**
    - Très modulaire, historique, énorme écosystème.
    - `.htaccess` (utile dans certains contextes, pas dans d’autres).
    - Mélange fichiers statiques + applis dynamiques (PHP mod_php, etc.) historique.
- **Nginx**
    - Ultra performant pour le **statique** et le **reverse proxy**.
    - Modèle événementiel, très léger même avec beaucoup de connexions.
    - Config plus simple pour faire du proxy et du load balancing.

En pratique aujourd’hui :

- pour un **reverse proxy frontal** : Nginx est souvent le premier choix,
- pour des vieilles applis PHP + `.htaccess` : Apache encore très présent.

---

# 7. Autres reverse proxies

## 7.1. Traefik

- Pensé pour **Docker / Kubernetes**.
- S’auto-configure à partir de :
    - labels Docker,
    - annotations Kubernetes, etc.
- Intègre **Let’s Encrypt** pour HTTPS auto.
- Dashboard intégré.

Cas typique : tu fais tourner plusieurs conteneurs, Traefik les détecte tout seul et route selon les labels (super pratique en DevOps).

---

## 7.2. HAProxy

- Très utilisé pour du **load balancing haute performance**.
- Gère L4 (TCP) et L7 (HTTP).
- Hyper configurable, parfait pour du trafic massif.

Scénario : des dizaines/centaines de backends, besoin de répartir la charge finement.

---

## 7.3. Envoy

- Proxy moderne, pensé pour les **microservices** et les **service mesh** (Istio, etc.).
- Très bon support de HTTP/2, gRPC, TLS, observabilité fine.
- S’intègre dans des architectures complexes avec beaucoup de services qui communiquent entre eux.

---

## 7.4. Caddy

- Serveur web + reverse proxy orienté **simplicité**.
- Gros avantage : **HTTPS automatique** avec Let’s Encrypt.
- Config minimaliste.

Typiquement, pour un petit projet ou une démo pro rapide, Caddy est ultra confortable.

---

# 8. Certificats & HTTPS

Tu as aussi noté un point important : la gestion des certificats.

## 8.1. Pourquoi un certificat ?

HTTPS = HTTP + chiffrement **TLS**.

Le certificat sert à :

- prouver que tu parles bien au **bon serveur**,
- chiffrer les échanges entre client et serveur.

Sans certificat valide → navigateur affiche des alertes de sécurité.

---

## 8.2. Types de certificats

1. **Auto-signé**
    - Tu le génères toi-même.
    - Utile pour les tests internes.
    - Le navigateur ne lui fait pas confiance par défaut → gros warning.
2. **Certificat signé par une AC (Autorité de Certification)**
    - Ex. Let’s Encrypt, GlobalSign, etc.
    - Repose sur une chaîne de confiance.
    - Nécessite de prouver que tu possèdes le domaine (DNS, HTTP challenge).
3. **Certificats gérés automatiquement**
    - Outils type **Certbot** (Apache/Nginx) ou intégrés (Caddy, Traefik).
    - Renouvellent le certificat régulièrement (ex : tous les 3 mois pour Let’s Encrypt).

---

## 8.3. Rôle des reverse proxies dans HTTPS

Plutôt que gérer des certificats sur chaque application :

- Tu gères **le certificat une seule fois** sur le reverse proxy (Apache/Nginx/Traefik/Caddy).
- Le proxy fait du **TLS termination** :
    - Client ↔ Proxy : HTTPS
    - Proxy ↔ Appli interne : souvent HTTP simple (réseau interne de confiance).

Ça simplifie énormément la gestion des certificats, surtout avec beaucoup de services.

---

# 9. Mise en pratique : scénarios

## 9.1. Scénario 1 – Nginx + Node

1. Lancer une petite API Node sur `localhost:3000`.
2. Installer Nginx.
3. Configurer un bloc `server` qui :
    - écoute sur `80`,
    - reverse proxy vers `localhost:3000`,
    - transmet les bons headers.
4. Tester `curl http://monapp.local` et vérifier les logs Nginx.

Objectif : comprendre de bout en bout le rôle du reverse proxy.

---

## 9.2. Scénario 2 – Apache + deux sites

1. Créer deux dossiers : `/var/www/site1`, `/var/www/site2`.
2. Créer deux fichiers `.conf` dans `sites-available` avec chacun son `ServerName` et ses logs.
3. Activer les deux sites, recharger Apache.
4. Configurer `/etc/hosts` pour les faire pointer vers `127.0.0.1`.
5. Tester dans le navigateur.

Objectif : maîtriser **VirtualHost** + logs.

---

## 9.3. Scénario 3 – HTTPS automatique (vision conceptuelle)

1. Acheter ou utiliser un vrai nom de domaine.
2. Mettre un Nginx ou Caddy en frontal.
3. Utiliser :
    - `certbot` pour Apache/Nginx, ou
    - la gestion intégrée de Caddy / Traefik.
4. Vérifier que :
    - `http://` redirige vers `https://`,
    - le certificat est valide dans le navigateur.

Objectif : comprendre **où** se place la gestion des certificats dans ton infra.

---

# 10. À retenir

- **Serveur web** = logiciel qui gère HTTP/HTTPS, sert des fichiers statiques et/ou transmet aux applis.
- **Reverse proxy** = intermédiaire côté serveur, qui reçoit toutes les requêtes et décide vers quel service interne les router.
- Apache & Nginx :
    - savent faire serveur web **et** reverse proxy,
    - ont des systèmes de fichiers de configuration organisés (sites, modules, logs).
- D’autres reverse proxies existent pour des contextes spécifiques (Docker/K8s, haute dispo, microservices).
- Les **certificats TLS** et HTTPS sont souvent gérés au niveau du reverse proxy, qui agit comme point d’entrée unique sécurisé.