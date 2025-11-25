---
title: La sécurité des application en production - Pratique
sujet: Cloud publique, Hosting & Sécurité
type: module
jour: 32
ordre: 2
tags: bastion, ssh, fail2ban, asciinema, kong, api-gateway, aws, vpc
---

- 🧱 **Pratique 1 — Bastion SSH + instance privée dans un VPC**
- 🛡 **Pratique 2 — Durcissement SSH & Fail2Ban sur le Bastion**
- 🎥 **Pratique 3 — Traçabilité SSH avec Asciinema**
- 🚪 **Pratique 4 — Kong API Gateway + httpbin + key-auth**

👉 Chaque pratique est structurée avec :

| Partie | Contenu |
| --- | --- |
| 🎯 Objectif | Ce que tu vas mettre en place |
| 🏗 Architecture | Schéma + explication |
| 🧰 Étapes détaillées | Commandes + explications |
| 🔎 Vérification | Comment tester + interpréter |
| 🧠 Compétences acquises | Ce que tu maîtrises |

---

## 🧱 Pratique 1 — Bastion SSH + instance privée dans un VPC

### 🎯 Objectif

Mettre en place une **première brique de sécurité** :

- Un **VPC dédié**,
- Un **Bastion** (point d’entrée SSH unique),
- Une **instance privée** accessible uniquement via Bastion,
- Un accès pratique depuis le poste local via `ProxyJump`.

### 🏗 Architecture

```
[PC local]
   |
   |  SSH (port 4242, clé SSH)
   v
[Bastion EC2 - subnet public, IP publique]
   |
   |  SSH (port 22, depuis IP privée bastion)
   v
[app-privee EC2 - subnet privé, sans IP publique]
🧰 Étapes détaillées
1️⃣ Créer le VPC et les subnets
Dans AWS (console) :

VPC :

Nom : my-bastion-vpc

CIDR : 10.0.0.0/24

Subnets :

subnet-public → ex. 10.0.0.0/26

subnet-private → ex. 10.0.0.64/27

Pas de NAT, pas de VPC Endpoint pour l’exercice.

2️⃣ Créer le Security Group du Bastion
Security Group : bastion-sg :

Inbound :

SSH TCP 22 depuis 0.0.0.0/0 (juste pour la première connexion, tu changeras ensuite).

Outbound :

All traffic.

3️⃣ Créer l’instance Bastion
Instance EC2 Ubuntu 24.04 :

Nom : bastion-public

Type : t2.micro

Clé SSH : secureme.pem (par ex.)

Accès public : Oui (IP publique)

VPC : my-bastion-vpc

Subnet : subnet-public

SG : bastion-sg

Connexion initiale :

bash
Copier le code
ssh -i secureme.pem ubuntu@<IP_PUBLIQUE_BASTION>
4️⃣ Créer l’instance privée app-privee
Security Group : app-privee-sg :

Inbound :

SSH TCP 22 depuis l’IP privée du Bastion (ex. 10.0.0.5/32).

Outbound : All traffic.

Instance EC2 :

Nom : app-privee

OS : Ubuntu 24.04

Subnet : subnet-private

Pas d’IP publique

SG : app-privee-sg

Clé SSH : même .pem ou autre selon ta stratégie.

5️⃣ Générer et installer la clé pour le Bastion
Sur le PC local :

bash
Copier le code
cd ~/Documents/DevOps
ssh-keygen -y -f secureme.pem > secureme.pub
cat secureme.pub  # copie la clé publique
Sur le Bastion :

bash
Copier le code
sudo adduser bastion
sudo usermod -aG sudo bastion
sudo su - bastion

mkdir -p ~/.ssh
chmod 700 ~/.ssh

nano ~/.ssh/authorized_keys
# colle ici la clé publique (secureme.pub)

chmod 600 ~/.ssh/authorized_keys
6️⃣ Durcir la config SSH de base (ports + root + password)
Éditer /etc/ssh/sshd_config :

bash
Copier le code
sudo nano /etc/ssh/sshd_config
Remplacer/ajouter :

text
Copier le code
Port 4242
PermitRootLogin no
PasswordAuthentication no
AllowUsers bastion
PermitTunnel no
X11Forwarding no
Redémarrer :

bash
Copier le code
sudo systemctl daemon-reload
sudo systemctl restart ssh
sudo systemctl restart ssh.socket
7️⃣ Config ProxyJump sur le poste local
Sur le PC local, fichier ~/.ssh/config :

text
Copier le code
Host bastion
  HostName <IP_PUBLIQUE_BASTION>
  User bastion
  Port 4242
  IdentityFile C:/Users/grego/Documents/DevOps/secureme.pem
  IdentitiesOnly yes

Host app-privee
  HostName <IP_PRIVEE_APP_PRIVEE>
  User ubuntu
  IdentityFile C:/Users/grego/Documents/DevOps/secureme.pem
  IdentitiesOnly yes
  ProxyJump bastion
🔎 Vérification
Depuis le PC :

bash
Copier le code
ssh bastion      # doit te connecter à bastion@...
ssh app-privee   # doit te connecter à ubuntu@app-privee via ProxyJump
Si ssh app-privee échoue avec timeout, vérifier :

IP privée du bastion dans app-privee-sg,

SSH actif sur app-privee (sudo systemctl status ssh),

routes / subnets.

🧠 Compétences acquises
Compétence	Description
VPC & Subnet	Création d’un réseau isolé avec public/privé
Bastion	Rôle et mise en place d’un point d’entrée unique
AWS SG	Filtrer finement les flux SSH (from bastion only)
ProxyJump	Connexion transparente aux machines privées

🛡 Pratique 2 — Durcissement SSH & Fail2Ban sur le Bastion
🎯 Objectif
Renforcer la sécurité du Bastion :

Port non standard (4242),

Pas de root, pas de password,

Filtrage IP,

Détection d’attaques SSH avec Fail2Ban.

🏗 Architecture
text
Copier le code
[PC local] --SSH 4242--> [Bastion] --SSH 22--> [Instances privées]

Fail2Ban sur Bastion :
- Surveille /var/log/auth.log
- Ban les IP bruteforce sur sshd
🧰 Étapes détaillées
1️⃣ Installer et activer Fail2Ban
Sur le Bastion :

bash
Copier le code
sudo apt update && sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
Vérifier la jail sshd :

bash
Copier le code
sudo fail2ban-client status sshd
2️⃣ Simuler une attaque brute
Depuis un autre réseau (tethering, autre EC2, etc.) :

bash
Copier le code
ssh -i secureme.pem -p 4242 fauxutilisateur@<IP_BASTION>
# Répéter plusieurs fois (>= 5 tentatives)
Puis revenir sur ton réseau habituel, te reconnecter au Bastion, et vérifier :

bash
Copier le code
sudo fail2ban-client status sshd
# Tu dois voir l'IP attaquante dans "Banned IP list"
3️⃣ Restreindre l’accès SSH à ta seule IP publique
Sur le Bastion :

bash
Copier le code
curl ifconfig.me
# note ton IP publique : x.x.x.x
Dans le SG bastion-sg (inbound) :

Port 4242 TCP → Source : x.x.x.x/32

Supprimer les anciennes règles plus ouvertes.

🔎 Vérification
Depuis ton IP : ssh bastion → OK.

Depuis une autre IP (VPN, autre réseau) : connexion refusée (ou même pas de réponse).

🧠 Compétences acquises
Compétence	Description
SSH Hardening	Root interdit, password off, port custom
Fail2Ban	Détection & bannissement automatique
Filtrage IP	Restreindre l’entrée Bastion à une IP unique
Lecture logs	Comprendre l’impact d’attaques SSH simples

🎥 Pratique 3 — Traçabilité SSH avec Asciinema
🎯 Objectif
Mettre en place un audit continu des sessions SSH sur le Bastion :

Enregistrement automatique de chaque session,

Fichiers de log lisibles et rejouables.

🏗 Architecture
text
Copier le code
[PC] --> [Bastion]
          |
          +--> ~/.asciinema_logs/session-YYYYMMDD_HHMMSS.cast
🧰 Étapes détaillées
1️⃣ Installer Asciinema sur le Bastion
bash
Copier le code
sudo apt update && sudo apt install -y asciinema
2️⃣ Préparer le dossier de logs
bash
Copier le code
mkdir -p ~/.asciinema_logs
3️⃣ Ajouter le hook dans ~/.bashrc
Éditer ~/.bashrc :

bash
Copier le code
nano ~/.bashrc
Ajouter à la fin :

bash
Copier le code
if [ -z "$ASCIINEMA_REC" ] && [ -n "$PS1" ] && [ -t 1 ]; then
  export ASCIINEMA_REC=1
  RECORD_FILE="$HOME/.asciinema_logs/session-$(date +%Y%m%d_%H%M%S).cast"
  exec asciinema rec --quiet --append "$RECORD_FILE"
fi
Explication rapide :

PS1 : garantit qu’on est dans un shell interactif.

-t 1 : vérifie que la sortie est un vrai terminal.

ASCIINEMA_REC : empêche une boucle infinie.

exec : remplace le shell par la session enregistrée.

4️⃣ Tester
Se déconnecter du Bastion.

Se reconnecter.

Puis :

bash
Copier le code
ls ~/.asciinema_logs
# Tu dois voir un fichier .cast
Tu peux ensuite rejouer depuis ton PC (en copiant le fichier), ou avec Asciinema.

🔎 Vérification
Plusieurs connexions différentes → plusieurs fichiers .cast.

Taille des fichiers qui grossit proportionnellement à l’activité.

🧠 Compétences acquises
Compétence	Description
Audit	Traçabilité des actions sur Bastion
Shell	Hook sur ~/.bashrc pour automatiser des comportements
Sécurité	Preuve et analyse post-incident possible

🚪 Pratique 4 — Kong API Gateway + httpbin + key-auth
🎯 Objectif
Mettre en place une API Gateway centralisée (Kong) pour :

Proxyfier une API (httpbin),

Appliquer une authentification par clé,

Tester l’accès via Kong en local et depuis Internet.

🏗 Architecture
text
Copier le code
[Clients externes] --> [Kong Gateway EC2, port 8000]
                            |
                            v
                   [app-public/httpbin EC2]

[Admin] --> [Kong Admin API : 8001] (restreint à ton IP)
🧰 Étapes détaillées
1️⃣ Instance dédiée pour Kong
Créer une EC2 :

Nom : kong-gateway

OS : Ubuntu 22.04

Subnet : subnet-public

Elastic IP associée.

SG kong-sg :

Inbound (phase setup) :

SSH 22 → ton IP

8000, 8001 → ton IP (tu ouvriras 8000 plus tard au public)

Connexion :

bash
Copier le code
ssh ubuntu@<ELASTIC_IP_KONG>
2️⃣ Installer Docker & Docker Compose
bash
Copier le code
sudo apt update
sudo apt install -y ca-certificates curl gnupg lsb-release

sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL <https://download.docker.com/linux/ubuntu/gpg> \\
  | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

echo \\
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \\
  <https://download.docker.com/linux/ubuntu> $(lsb_release -cs) stable" \\
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

sudo usermod -aG docker ubuntu
newgrp docker

docker ps
docker compose version
3️⃣ Déployer Kong via Docker Compose
Créer le dossier :

bash
Copier le code
mkdir ~/kong && cd ~/kong
nano docker-compose.yml
Y coller ton docker-compose.yml (version Postgres + kong-gateway).

Lancer :

bash
Copier le code
docker compose up -d
docker ps
Tu dois voir au minimum :

kong-ee-database

kong-cp

kong-bootstrap (qui peut s’arrêter après migrations).

4️⃣ Déployer httpbin sur app-public
Sur une instance app-public (dans subnet-public, IP publique, SG autorisant 80 depuis Kong ou ton IP) :

bash
Copier le code
sudo apt update && sudo apt install -y docker.io
sudo systemctl enable --now docker

sudo docker run -d --name httpbin -p 80:80 kennethreitz/httpbin

curl localhost           # doit renvoyer la page httpbin
5️⃣ Déclarer le service et la route dans Kong
Sur kong-gateway :

bash
Copier le code
# Créer un service vers app-public
curl -X POST <http://localhost:8001/services> \\
  --data name=hello-public \\
  --data url=http://<IP_PRIVEE_APP_PUBLIC>

# Créer une route associée
curl -X POST <http://localhost:8001/services/hello-public/routes> \\
  --data paths[]=/hello-public
Test local :

bash
Copier le code
curl <http://localhost:8000/hello-public>
# doit proxy vers httpbin
6️⃣ Protéger avec key-auth
bash
Copier le code
# Ajouter plugin d'auth par clé
curl -X POST <http://localhost:8001/services/hello-public/plugins> \\
  --data name=key-auth

# Créer un consommateur
curl -X POST <http://localhost:8001/consumers> \\
  --data username=test-user

# Générer une clé
curl -X POST <http://localhost:8001/consumers/test-user/key-auth> \\
  --data key=my-secret-key
Tests locaux :

bash
Copier le code
# Sans clé -> refus
curl <http://localhost:8000/hello-public>

# Mauvaise clé -> refus
curl <http://localhost:8000/hello-public> -H "apikey: my-wrong-key"

# Bonne clé -> OK
curl <http://localhost:8000/hello-public> -H "apikey: my-secret-key"
7️⃣ Exposer Kong au public
Dans kong-sg :

Ouvrir le port 8000 à 0.0.0.0/0 (public),

Laisser 8001/8002 restreints à ton IP uniquement.

Depuis ton PC :

bash
Copier le code
curl http://<ELASTIC_IP_KONG>:8000/hello-public \\
  -H "apikey: my-secret-key"
Si tu reçois la réponse httpbin → succès complet 🎉

🔎 Vérification
docker ps sur kong-gateway : containers de Kong OK.

curl localhost sur app-public : httpbin OK.

curl avec et sans clé sur 8000 : comportements corrects (401/403 vs 200).

🧠 Compétences acquises
Compétence	Description
API Gateway	Compréhension du rôle de Kong
Docker	Stack complète (DB + Gateway)
Auth API	key-auth côté Gateway, sans toucher au code backend
Réseau Cloud	Lien entre VPC, SG, IP publique, services internes

🎉 Conclusion globale
Étape	Contenu	Outil
Accès SSH sécurisé	Bastion + ProxyJump	EC2, SSH
Durcissement	Port custom, Fail2Ban, IP filtering	SSH, Fail2Ban, SG
Audit	Enregistrement des sessions	Asciinema
Sécurité API	Auth centralisée, proxy, key-auth	Kong, Docker

```

---
[← Module précédent](M32_sécurité-des-application.md)
---
