---
layout: page
title: Serveurs Web & Reverse Proxy - Pratique
sujet: Administration
type: module
jour: 31
ordre: 2
tags: proxy, server, devops, nginx, apache, treafik, haproxy, http, n8n, docker
---

- 🌍 **EC2 + Apache** (serveur web simple)
- 🐳 **EC2 + Docker + Apache/Nginx séparés** (conteneurs web)
- 🔀 **EC2 + HAProxy + Docker (Load Balancing)** (reverse proxy + LB)
- BONUS ❇️ **Traefik en stack complète** (reverse proxy dynamique + DB + App)

👉 Chaque pratique sera transformée en :

| Partie | Contenu |
| --- | --- |
| 🎯 Objectif | Ce que tu vas mettre en place |
| 🏗 Architecture | Schéma + explication |
| 🧰 Étapes détaillées | Commandes + explications |
| 🔎 Vérification | Comment tester + interpréter |
| 🧠 Compétences acquises | Ce que tu maîtrises |

---

# ⚙️ **Process Pro Complet – Tes 3 Pratiques DevOps Web**

---

## 🟢 **Pratique 1 — Serveur Web Apache sur EC2**

### 🎯 Objectif

Déployer un serveur web accessible publiquement, comprendre **le rôle d’un serveur web** et sa **page racine**.

### 🏗 Architecture

```
Navigateur -> Internet -> EC2 Ubuntu -> Apache -> /var/www/html/index.html

```

### 🧰 Étapes

### 1️⃣ Créer l’EC2 Ubuntu 24.04

- Instance type : t2.micro (ou t3.micro)
- Security Group ➜ Autoriser :
    - **TCP 22 (SSH)**
    - **TCP 80 (HTTP)**

### 2️⃣ Connexion SSH

```bash
ssh -i <ton-fichier.pem> ubuntu@<IP-Publique>

```

### 3️⃣ Installer Apache

```bash
sudo apt update && sudo apt install -y apache2

```

### 4️⃣ Vérifier Apache

```bash
sudo systemctl status apache2

```

✔️ Doit être “active (running)”

### 5️⃣ Tester l’accès public

👉 Dans ton navigateur :

```
http://<IP-Publique>

```

### 6️⃣ Personnaliser la page

```bash
echo "<h1>Bienvenue sur mon premier serveur Apache 🎉</h1>" \
| sudo tee /var/www/html/index.html

```

🔎 **Test final** : Recharge la page ➜ Ton texte apparaît.

### 🧠 Compétences acquises

| Compétence | Description |
| --- | --- |
| Serveur web | Compréhension d’Apache |
| Linux | Navigation + modification de fichiers |
| Cloud | Sécurité réseau (ports) |

---

## 🔵 **Pratique 2 — Docker + Apache & Nginx dans 2 Conteneurs**

### 🎯 Objectif

Déployer **deux serveurs web séparés** sur la même machine grâce à Docker.

### 🏗 Architecture

```
Navigateur               Navigateur
   |                         |
80/tcp -> Apache (Docker)   81/tcp -> Nginx (Docker)

```

### 🧰 Étapes

### 1️⃣ Installer Docker sur EC2

```bash
curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh

```

### 2️⃣ Préparer les données

```bash
mkdir -p ~/docker-webservers/apache ~/docker-webservers/nginx

echo "<h1>Hello depuis Apache 🧡</h1>" > ~/docker-webservers/apache/index.html
echo "<h1>Hello depuis Nginx 💙</h1>" > ~/docker-webservers/nginx/index.html

```

### 3️⃣ Lancer Apache

```bash
docker run -d -p 80:80 \
-v ~/docker-webservers/apache:/usr/local/apache2/htdocs:ro \
--name apache httpd:latest

```

### 4️⃣ Lancer Nginx

```bash
docker run -d -p 81:80 \
-v ~/docker-webservers/nginx:/usr/share/nginx/html:ro \
--name nginx nginx:latest

```

### 🔎 Tests

| URL | Résultat |
| --- | --- |
| `http://<IP>` | Apache |
| `http://<IP>:81` | Nginx |

### 🧠 Compétences acquises

| Compétence | Description |
| --- | --- |
| Docker | Lancement de conteneurs + volumes |
| Web | Hébergement multi-serveur |
| Sécurité | Exposition de ports sans conflit |

---

## 🔴 **Pratique 3 — HAProxy en Load Balancer sur 2 Nginx**

### 🎯 Objectif

Créer un **reverse proxy + load balancer** distribuant le trafic entre **deux Nginx**.

### 🏗 Architecture

```
Navigateur -> HAProxy (80)
                   |
      +------------+------------+
      |                         |
 Nginx1 (Serveur 1)     Nginx2 (Serveur 2)

```

### 🧰 Étapes

### 1️⃣ Préparer les sites

```bash
mkdir -p ~/site1 && echo "<h1>Serveur 1</h1>" > ~/site1/index.html
mkdir -p ~/site2 && echo "<h1>Serveur 2</h1>" > ~/site2/index.html

```

### 2️⃣ Lancer les Nginx

```bash
docker run -d --name nginx1 -v ~/site1:/usr/share/nginx/html:ro -p 8081:80 nginx
docker run -d --name nginx2 -v ~/site2:/usr/share/nginx/html:ro -p 8082:80 nginx

```

### 3️⃣ Créer un réseau Docker (important 🚨)

```bash
docker network create webnet
docker network connect webnet nginx1
docker network connect webnet nginx2

```

Il faut créer un réseau Docker car depuis le conteneur HAProxy il vaut mieux parler directement aux conteneurs nginx plutôt qu’aux ports 8081/8082 de l’host.

### 4️⃣ Config HAProxy

`nano ~/haproxy.cfg` :

```
global
    daemon
    maxconn 256

defaults
    mode http
    timeout connect 5000ms
    timeout client 50000ms
    timeout server 50000ms

frontend http-in
    bind *:80
    default_backend nginx-backend

backend nginx-backend
    balance roundrobin
    option httpclose
    server s1 nginx1:80 check
    server s2 nginx2:80 check


```

- Sur Docker Desktop (Windows/macOS), host.docker.internal existe.
- Sur la VM Ubuntu/EC2, ce hostname n’existe pas → HAProxy n’arrive pas à résoudre l’adresse → il crashe
- On cible directement les conteneurs nginx1 et nginx2 sur leur port interne 80 (pas 8081/8082, ça c’est pour l’extérieur).

### 5️⃣ Lancer HAProxy

```bash
docker run -d --name haproxy --network webnet \
-p 80:80 -v ~/haproxy.cfg:/usr/local/etc/haproxy/haproxy.cfg:ro haproxy

```

### 🔎 Test Round-Robin

```bash
curl http://<IP>
curl http://<IP>
curl http://<IP>

```

### 🧠 Compétences acquises

| Compétence | Description |
| --- | --- |
| Reverse Proxy | HAProxy (frontend/backend) |
| Load Balancing | Round-robin réel |
| Réseaux Docker | Utilisation de network + DNS interne |

---

### 🎉 Conclusion Globale

| Étape DevOps | Outil | Compétence |
| --- | --- | --- |
| Hébergement Cloud | EC2 | Réseau + SSH |
| Serveur Web | Apache/Nginx | HTTP, statique |
| Conteneurisation | Docker | Isolation & volume |
| Reverse Proxy | HAProxy | Sécurité + LB |
| Proxy dynamique | Traefik | Automatisation & micro-services |



---

<!-- snippet
id: nginx_install_apache_ec2
type: command
tech: nginx
level: beginner
importance: high
format: knowledge
tags: apache,ec2,ubuntu,install
title: Installer Apache sur EC2 Ubuntu
context: déployer un serveur web Apache sur une instance EC2 Ubuntu
command: sudo apt update && sudo apt install -y apache2
description: Met à jour les paquets et installe Apache2. Après cette commande, le serveur web est actif et accessible sur le port 80.
-->

<!-- snippet
id: nginx_docker_run_apache
type: command
tech: nginx
level: beginner
importance: high
format: knowledge
tags: docker,apache,conteneur,volume
title: Lancer Apache dans un conteneur Docker avec volume
context: héberger un site statique dans un conteneur Apache
command: docker run -d -p 80:80 -v ~/docker-webservers/apache:/usr/local/apache2/htdocs:ro --name apache httpd:latest
description: Lance un conteneur Apache en arrière-plan, mappe le port 80 et monte un dossier local en lecture seule comme répertoire racine web.
-->

<!-- snippet
id: nginx_docker_run_nginx
type: command
tech: nginx
level: beginner
importance: high
format: knowledge
tags: docker,nginx,conteneur,volume
title: Lancer Nginx dans un conteneur Docker avec volume
context: héberger un site statique dans un conteneur Nginx
command: docker run -d -p 81:80 -v ~/docker-webservers/nginx:/usr/share/nginx/html:ro --name nginx nginx:latest
description: Lance un conteneur Nginx en arrière-plan, mappe le port 81 de l'hôte vers le port 80 du conteneur et monte un dossier local en lecture seule.
-->

<!-- snippet
id: nginx_haproxy_network_docker
type: command
tech: nginx
level: intermediate
importance: medium
format: knowledge
tags: docker,haproxy,network,load-balancer
title: Créer un réseau Docker pour HAProxy
context: permettre à HAProxy d'atteindre les conteneurs Nginx par leur nom DNS interne
command: docker network create webnet && docker network connect webnet nginx1 && docker network connect webnet nginx2
description: Crée un réseau Docker webnet et y connecte les conteneurs Nginx. HAProxy peut les cibler par leur nom DNS interne sans passer par les ports de l'hôte.
-->

<!-- snippet
id: nginx_haproxy_run
type: command
tech: nginx
level: intermediate
importance: medium
format: knowledge
tags: docker,haproxy,load-balancer,round-robin
title: Lancer HAProxy en load balancer avec réseau Docker
context: distribuer le trafic entre deux conteneurs Nginx avec round-robin
command: docker run -d --name haproxy --network webnet -p 80:80 -v ~/haproxy.cfg:/usr/local/etc/haproxy/haproxy.cfg:ro haproxy
description: Lance HAProxy en arrière-plan sur le réseau webnet, mappe le port 80 et monte la configuration haproxy.cfg en lecture seule. HAProxy distribue les requêtes entre nginx1 et nginx2.
-->

<!-- snippet
id: nginx_haproxy_test_roundrobin
type: command
tech: nginx
level: intermediate
importance: medium
format: knowledge
tags: haproxy,curl,load-balancer,test
title: Tester le round-robin HAProxy avec curl
context: vérifier que le trafic alterne bien entre les serveurs
command: curl http://<IP> && curl http://<IP> && curl http://<IP>
description: Envoie trois requêtes successives au load balancer. Les réponses doivent alterner entre "Serveur 1" et "Serveur 2", prouvant que le round-robin fonctionne.
-->

<!-- snippet
id: nginx_apache_status
type: command
tech: nginx
level: beginner
importance: high
format: knowledge
tags: apache,systemctl,status
title: Vérifier le statut d'Apache
context: contrôler qu'Apache est actif après installation
command: sudo systemctl status apache2
description: Affiche l'état du service Apache2. La ligne "active (running)" confirme que le serveur web est opérationnel.
-->

---
[← Module précédent](M31_serveur-web.md)
---
