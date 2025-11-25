---
title: La sécurité des application en Prod
sujet: Cloud publique, Hosting & Cloud
type: module
jour: 32
ordre: 1
tags: api gateway, sécurité, devops, asciinema, bastion, kong, ssh
---

# Sécurité des applications en Prod

*Bastion SSH, API Gateway & Kong*

---

## 1. Pourquoi la sécurité en prod est une priorité

Dès qu’une appli est en ligne, elle devient **une cible potentielle** :

- Tu exposes :
    - tes serveurs,
    - tes bases de données,
    - tes logs,
    - tes secrets,
- Tu engages :
    - la **confiance** des utilisateurs,
    - ta **responsabilité légale** (RGPD, fuite de données…),
    - la **continuité de service** (disponibilité).

### 1.1. Dev vs Staging vs Prod

- **Développement (local)**
    - Tu es souvent en `localhost`, ports ouverts, base de test.
    - On accepte de “bidouiller” : accès root, pas de firewall strict, etc.
- **Staging / Préprod**
    - Environnement plus proche de la prod.
    - On commence à mettre des **restrictions** : IP filtrées, comptes partagés limités.
- **Production**
    - Chaque erreur devient un **risque réel**.
    - On ne tolère plus :
        - les accès root,
        - les services ouverts “pour tester”,
        - les clés SSH partagées.

> En prod, la règle de base : tout ce qui n’est pas explicitement autorisé doit être refusé.
> 

---

## 2. Les points d’entrée à surveiller

Tu peux voir ton infra comme un immeuble avec plein de portes et fenêtres :

- **Ports et protocoles fréquents** :
    - HTTP/HTTPS (80, 443)
    - Ports applicatifs (3000, 8000, 8080…)
    - SSH (22, ou autre)
    - VPN
    - FTP / SFTP
    - Webhooks (GitLab, Stripe, etc.)

Chaque ouverture réseau est **un accès à forcer** pour un attaquant.

Sans contrôle strict, ce sont des **failles potentielles** :

- admin non protégée,
- webhook acceptant n’importe quelle IP,
- SSH exposé au monde entier, etc.

### 2.1. Les fausses sécurités courantes

- « J’ai une **clé SSH**, donc c’est bon. »
    
    ➜ Non, si tout le monde utilise la même clé, si tu ne traces rien, et si le port 22 est ouvert à tout Internet.
    
- « Mon serveur est dans un **VPC** / **VPN**. »
    
    ➜ Oui, mais :
    
    - qui a accès au VPN ?
    - que peuvent-ils faire une fois dedans ?
    - est-ce que tu traces leurs actions ?

> Moralité : il faut protéger l’accès ET protéger ce qui se passe après l’accès.
> 

---

## 3. Défense en profondeur : Bastion + API Gateway

Objectif : **ne pas exposer tout et n’importe quoi directement à Internet.**

- **Bastion SSH**
    
    ➜ Point d’entrée **unique** pour toutes les connexions SSH vers les serveurs internes.
    
- **API Gateway (Kong)**
    
    ➜ Point d’entrée **unique** pour toutes les requêtes HTTP/HTTPS vers les APIs.
    

Ces deux briques jouent le rôle de :

- **douane** (Bastion) pour les admins,
- **videur de boîte de nuit** (API Gateway) pour les utilisateurs et les clients d’API.

---

## 4. Bastion SSH

### 4.1. Rôle du Bastion

Le Bastion doit être :

- **la seule machine SSH exposée à Internet** ;
- le point de passage obligatoire :
    - pour se connecter aux serveurs internes,
    - pour administrer la prod.

Sans Bastion :

- chaque serveur :
    - a une IP publique,
    - expose SSH,
    - a ses logs à part,
    - gère ses clés SSH.

Avec Bastion :

- seul le Bastion a une IP publique ;
- les autres serveurs :
    - n’acceptent que SSH **depuis le Bastion** ;
    - ne sont pas joignables en SSH depuis Internet.

Tu gagnes :

- **contrôle** : un seul point à surveiller ;
- **audit** : un seul endroit où tracer ;
- **simplicité** : un seul endroit à configurer en durcissement (hardening).

---

### 4.2. Architecture typique (en texte)

- Internet → **Bastion (IP publique)**
- Bastion → **Serveurs internes (IPs privées)**

```
[Admin] --ssh--> [Bastion] --ssh interne--> [VM App / DB / etc.]

```

Les serveurs d’app ne sont **pas directement exposés**.

---

### 4.3. Mise en place d’un Bastion (pas à pas)

### Étape 1 – Créer la VM Bastion et l’utilisateur dédié

Sur ta VM (Debian par ex.) :

```bash
# Créer l'utilisateur bastion
sudo adduser bastion

# Le mettre dans le groupe sudo (admin)
sudo usermod -aG sudo bastion

# Passer sur ce user
su - bastion

# Interdire le login interactif pour root
sudo usermod -s /usr/sbin/nologin root

```

> nologin empêche toute connexion interactive sur root (ssh, login…).
> 

---

### Étape 2 – Ajouter ta clé publique SSH

Toujours en tant que `bastion` :

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh

echo "ta_cle_publique_ssh_ici" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

```

---

### Étape 3 – SSH Hardening (`/etc/ssh/sshd_config`)

Édite le fichier sur le Bastion :

```bash
sudo nano /etc/ssh/sshd_config

```

Paramètres importants :

```
Port 4242
PermitRootLogin no
PasswordAuthentication no
AllowUsers bastion
PermitTunnel no
X11Forwarding no

```

- `Port 4242` : on ne reste pas sur 22 (réduit les scans automatiques).
- `PermitRootLogin no` : interdit le login direct en root.
- `PasswordAuthentication no` : **clé SSH obligatoire**.
- `AllowUsers bastion` : seul l’utilisateur `bastion` peut se connecter.
- `PermitTunnel no` : pas de tunnel SSH sauvage.
- `X11Forwarding no` : pas d’applis graphiques via SSH.

Puis :

```bash
sudo systemctl restart ssh

```

---

### Étape 4 – Config côté client : ProxyJump

Sur ta **machine d’admin** (ton laptop), édite `~/.ssh/config` :

```
Host bastion
  HostName 135.159.245.27   # IP publique du Bastion
  User bastion
  Port 4242
  IdentityFile ~/.ssh/key_bastion
  IdentitiesOnly yes

Host prod-app
  HostName 10.0.0.42        # IP privée de la VM de prod
  User admin
  IdentityFile ~/.ssh/key_prod-app
  IdentitiesOnly yes
  ProxyJump bastion

```

Maintenant, pour te connecter à la prod :

```bash
ssh prod-app

```

SSH passe automatiquement **par le Bastion** grâce à `ProxyJump`.

---

### 4.4. Sécuriser encore le Bastion

### Fail2Ban

Fail2Ban bannit automatiquement les IP qui tentent des connexions ratées en boucle.

Installation :

```bash
sudo apt update
sudo apt install fail2ban

```

Ensuite, tu peux personnaliser le comportement dans `/etc/fail2ban/jail.local` pour le service `sshd`.

---

### 4.5. Tracer les actions avec Asciinema

Objectif : **enregistrer les sessions SSH** pour auditer ce qui a été fait sur les serveurs de prod.

Installation :

```bash
sudo apt install asciinema

```

Dans `~/.bashrc` de l’utilisateur administrateur (par ex. `admin` sur les serveurs cibles, ou même sur le bastion) :

```bash
if [ -z "$ASCIINEMA_REC" ] && [ -n "$PS1" ] && [ -t 1 ]; then
  export ASCIINEMA_REC=1
  RECORD_FILE="$HOME/.asciinema_logs/session-$(date +%Y%m%d_%H%M%S).cast"
  mkdir -p "$HOME/.asciinema_logs"
  exec asciinema rec --quiet --append "$RECORD_FILE"
fi

```

Explication rapide :

- `ASCIINEMA_REC` : évite les boucles.
- `PS1` : vérifie que c’est une session interactive.
- `t 1` : terminal réel.
- `exec` : remplace le shell par `asciinema rec` (tout est enregistré).
- `-quiet` : pas de message à l’écran.

Résultat : chaque connexion crée un fichier `.cast` horodaté, que tu peux rejouer.

---

## 5. API Gateway

### 5.1. À quoi ça sert concrètement ?

Sans Gateway, chaque service de ton système :

- a son URL exposée,
- gère sa propre auth,
- logue ou pas ce qui se passe,
- expose éventuellement des infos internes.

Une **API Gateway** joue le rôle de **point d’entrée unique HTTP/HTTPS** :

- reçoit toutes les requêtes,
- applique des règles de sécurité :
    - authentification,
    - autorisations,
    - rate limiting,
- route vers les bons services,
- logue les appels et erreurs.

---

### 5.2. Différence : Load Balancer, Reverse Proxy, API Gateway

Petit tableau synthèse :

| Composant | Rôle principal |
| --- | --- |
| Load Balancer | Répartir la charge entre plusieurs instances |
| Reverse Proxy | Faire suivre des requêtes vers un backend unique ou quelques services, parfois avec mise en cache |
| API Gateway | Point d’entrée applicatif complet : routing + auth + quotas + logs + transformation de requêtes/réponses |

> Un NGINX peut faire du reverse proxy ET jouer le rôle d’API Gateway si tu le configures, mais un outil comme Kong est spécialisé pour ce rôle.
> 

---

## 6. Kong comme API Gateway

### 6.1. Pourquoi Kong ?

- Open source, moderne, extensible via **plugins**.
- Se déploie facilement :
    - en **Docker**,
    - en **Kubernetes**,
    - ou en VM classique.
- Intègre :
    - logs,
    - supervision,
    - plugins d’auth,
    - rate limiting,
    - intégrations Prometheus, Grafana, Elastic, Datadog…

Parfait pour un contexte DevOps / microservices.

---

### 6.2. Déploiement rapide avec Docker Compose

Voici un exemple de `docker-compose.yml` minimal inspiré de ce que tu as :

```yaml
volumes:
  kong_db_data: {}

networks:
  kong-ee-net:
    driver: bridge

x-kong-config: &kong-env
  KONG_DATABASE: postgres
  KONG_PG_HOST: kong-ee-database
  KONG_PG_DATABASE: kong
  KONG_PG_USER: kong
  KONG_PG_PASSWORD: kong

services:

  kong-ee-database:
    container_name: kong-ee-database
    image: postgres:latest
    restart: on-failure
    volumes:
      - kong_db_data:/var/lib/postgresql/data
    networks:
      - kong-ee-net
    environment:
      POSTGRES_USER: kong
      POSTGRES_DB: kong
      POSTGRES_PASSWORD: kong
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "kong"]
      interval: 5s
      timeout: 10s
      retries: 10
    ports:
      - "5432:5432"  # optionnel pour debug

  kong-bootstrap:
    image: "${GW_IMAGE:-kong/kong-gateway:3.11.0.1}"
    container_name: kong-bootstrap
    networks:
      - kong-ee-net
    depends_on:
      kong-ee-database:
        condition: service_healthy
    restart: on-failure
    environment:
      <<: *kong-env
      KONG_PASSWORD: handyshake
    command: kong migrations bootstrap

  kong-cp:
    image: "${GW_IMAGE:-kong/kong-gateway:3.11.0.1}"
    container_name: kong-cp
    restart: on-failure
    networks:
      - kong-ee-net
    environment:
      <<: *kong-env
      KONG_ADMIN_LISTEN: 0.0.0.0:8001, 0.0.0.0:8444 ssl
      KONG_ADMIN_GUI_LISTEN: 0.0.0.0:8002, 0.0.0.0:8445 ssl
      KONG_ADMIN_GUI_URL: http://${GW_HOST:-localhost}:8002
      KONG_PASSWORD: handyshake
    depends_on:
      kong-bootstrap:
        condition: service_completed_successfully
    ports:
      - "8000:8000"  # Proxy HTTP
      - "8443:8443"  # Proxy HTTPS
      - "8001:8001"  # Admin API HTTP
      - "8444:8444"  # Admin API HTTPS
      - "8002:8002"  # UI HTTP
      - "8445:8445"  # UI HTTPS

```

Lancement :

```bash
docker compose up -d

```

Tu obtiens :

- Proxy : `http://localhost:8000`
- Admin API : `http://localhost:8001`
- UI (Kong Manager) : `http://localhost:8002`

---

### 6.3. Premier service derrière Kong (via CLI / curl)

### 1. Créer un service

Exemple avec `httpbin.org` :

```bash
curl -X POST http://localhost:8001/services \
  --data name=hello-service \
  --data url=http://httpbin.org

```

### 2. Créer une route

```bash
curl -X POST http://localhost:8001/services/hello-service/routes \
  --data paths[]=/hello

```

Tu peux maintenant appeler :

```bash
curl http://localhost:8000/hello

```

Kong reçoit la requête sur `8000`, la route `/hello` l’envoie vers `hello-service`, qui pointe vers `http://httpbin.org`.

---

### 6.4. Authentification centralisée

### 1. Activer un plugin d’auth (key-auth)

```bash
curl -X POST http://localhost:8001/services/hello-service/plugins \
  --data name=key-auth

```

### 2. Créer un consommateur et une clé

```bash
# Créer un utilisateur (consumer)
curl -X POST http://localhost:8001/consumers \
  --data username=test-user

# Générer / enregistrer sa clé
curl -X POST http://localhost:8001/consumers/test-user/key-auth \
  --data key=supercle

```

### 3. Appeler l’API avec la clé

```bash
curl http://localhost:8000/hello \
  -H "apikey: supercle"

```

Sans header `apikey`, l’accès est refusé → c’est Kong qui bloque, **avant** que la requête n’atteigne ton backend.

---

### 6.5. Protéger les services : rate limiting

Tu peux ajouter un plugin de **rate limiting** :

```bash
curl -X POST http://localhost:8001/services/hello-service/plugins \
  --data name=rate-limiting \
  --data config.minute=60 \
  --data config.policy=local

```

Ici :

- `config.minute=60` ➜ max 60 requêtes / minute par client.
- Au-delà : Kong renvoie une erreur (429 Too Many Requests).

---

### 6.6. Logs & supervision

Tu peux :

- activer des plugins de logs (fichiers, HTTP, TCP, Kafka…),
- exporter les métriques vers :
    - **Prometheus** ➜ visualisation avec **Grafana**,
    - **Elastic / Kibana**,
    - **Datadog**, etc.

Intérêt :

- savoir :
    - quelles routes sont les plus utilisées,
    - quelle IP / clé abuse,
    - quelles erreurs sont fréquentes ;
- améliorer :
    - la performance,
    - la sécurité,
    - la conformité (RGPD, audits).

---

## 7. Bastion + Kong : comment les combiner dans un projet

Pour ton contexte DevOps / S1000D, tu peux te projeter comme ça :

1. **VM infra (cloud / on-prem)**
    - Un réseau privé avec :
        - VM `bastion` (IP publique),
        - VM `api-gateway` (Kong),
        - VM `app-s1000d`, `db-s1000d`, etc.
2. **Accès admin**
    - Tous les `ssh` vers les VM internes passent par **le Bastion**.
    - Logs, Asciinema, Fail2Ban sur le Bastion.
3. **Accès API S1000D**
    - L’API FastAPI/Flask (validation XML, génération PDF…) n’est **pas directement exposée**.
    - **Kong** reçoit :
        - les requêtes du site Front,
        - les webhooks (GitLab CI, cron, n8n…),
    - Il applique :
        - auth (clé API, JWT),
        - quotas,
        - logs.
4. **CI/CD**
    - Ton pipeline (GitLab, Jenkins, Azure DevOps) peut :
        - déployer la nouvelle version de l’API,
        - mettre à jour dynamiquement la config Kong (services/routes/plugins) via curl,
        - garder une trace dans les logs / dashboards.

---

## 8. Checklist pour te lancer

Tu peux t’en servir comme mini-plan d’action.

### Bastion

- [ ]  Créer une VM dédiée Bastion.
- [ ]  Créer l’utilisateur `bastion`.
- [ ]  Désactiver le login root.
- [ ]  Forcer les clés SSH, interdire les mots de passe.
- [ ]  Limiter les users avec `AllowUsers`.
- [ ]  Installer et configurer Fail2Ban.
- [ ]  Mettre en place l’enregistrement des sessions (Asciinema) sur les serveurs sensibles.
- [ ]  Configurer `~/.ssh/config` avec `ProxyJump`.

### API Gateway / Kong

- [ ]  Déployer Kong (docker compose, ou autre).
- [ ]  Créer un **service** vers ton backend.
- [ ]  Créer une **route** publique.
- [ ]  Protéger la route (key-auth, JWT, OAuth2 selon le besoin).
- [ ]  Configurer un **plugin de rate-limiting**.
- [ ]  Activer l’export des métriques vers un outil de monitoring.
- [ ]  Centraliser les logs applicatifs via Kong.