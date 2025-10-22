---
module: Pratique - SSH et NGINX
jour: 08
ordre: 3
---

# Mise en pratique

## 1) SSH Begin — les bases propres & fiables

### Mental model

- **SSH = tunnel chiffré + identité** (utilisateur/machine).
- **Client** se connecte au **Serveur** sur un **port** (22 par défaut).
- La **politique** (qui peut entrer et comment) se règle côté **serveur** (`sshd_config`).
- Toujours : **tester → appliquer → vérifier**.

### Patrons réutilisables

#### A. Se connecter (et reconnaître l’hôte)

```bash
# trouver l’IP sur le serveur
ip -4 addr show   # ou ip a

# 1ère connexion (nouvel hôte → empreinte à accepter)
ssh user@IP

```

Tips :

- Si IP/DNS change → nettoyer l’empreinte :
    
    ```bash
    ssh-keygen -R IP_ou_DNS
    
    ```
    

#### B. Changer le port (ex. 5022) — *sans se tirer une balle dans le pied*

```bash
sudoedit /etc/ssh/sshd_config
# Port 5022   (décommente/ajoute)

# ordre “sécurité”
sudo sshd -t                  # 1) valider
sudo systemctl restart ssh    # 2) appliquer
ss -ltnp | grep ssh           # 3) vérifier l’écoute

```

Tips :

- **Toujours** `sshd -t` avant restart.
- Pense **firewall** si présent (UFW) :
    
    ```bash
    sudo ufw allow 5022/tcp
    
    ```
    

#### C. Créer un compte et lui donner **juste ce qu’il faut**

```bash
sudo adduser serveradmin             # crée le compte
sudo usermod -aG sudo serveradmin    # lui donne sudo

```

Pattern pro : **admin via sudo**, jamais root direct.

### Debug rapide (pattern universel)

1. **Le réseau** : `ping IP`, `nc -vz IP 5022` (ou 22).
2. **Service** : `systemctl status ssh`, `ss -ltnp | grep ssh`.
3. **Client verbeux** : `ssh -vvv -p 5022 user@IP` (on voit l’algorithme, la clé, le rejet).
4. **Logs serveur** : `sudo tail -f /var/log/auth.log`.

---

## 2) Secure SSH — authentification par **clé** et durcissement

### Mental model

- **Clé privée** = ton secret (reste chez toi).
- **Clé publique** = autorisation déposée sur le serveur.
- But : **désactiver le mot de passe** pour empêcher le bruteforce.

### Patrons réutilisables

#### A. Générer une clé (recommandé : Ed25519)

```bash
ssh-keygen -t ed25519 -f ~/.ssh/monprofil -C "monprofil@ma-machine"

```

- Privée : `~/.ssh/monprofil`
- Publique : `~/.ssh/monprofil.pub`

#### B. Déployer la clé publique (3 options)

**1) Automatique (si mot de passe encore ouvert)**

```bash
ssh-copy-id -i ~/.ssh/monprofil.pub -p 5022 user@IP

```

**2) Universelle (copie via pipe)**

```bash
cat ~/.ssh/monprofil.pub | ssh -p 5022 user@IP \
'umask 077; mkdir -p ~/.ssh; cat >> ~/.ssh/authorized_keys'

```

**3) Manuel (dernière chance)**

- Créer/éditer sur le serveur : `~/.ssh/authorized_keys`
- Coller **la ligne entière** de la clé publique.

**Droits corrects (sinon SSH ignore le fichier)**

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
# HOME ≤ 755 et propriétaire = l’utilisateur, pas root

```

#### C. Forcer l’auth par clé (désactiver le mot de passe)

```bash
sudo sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config.d/50-cloud-init.conf 2>/dev/null || true
sudo sshd -t && sudo systemctl restart ssh

```

#### D. Connexion avec la clé

```bash
ssh -p 5022 -i ~/.ssh/monprofil user@IP

```

### Renforcer encore (options utiles)

Dans `/etc/ssh/sshd_config` :

```
PermitRootLogin no
PubkeyAuthentication yes
PasswordAuthentication no
KbdInteractiveAuthentication no
MaxAuthTries 3
LoginGraceTime 20
AllowUsers user1 user2             # facultatif, liste blanche
# ou par groupe : AllowGroups sshusers

```

Puis : `sudo sshd -t && sudo systemctl restart ssh`.

### Debug typiques & solutions

- **Permission denied (publickey)**
    
    → Mauvais droits/proprio sur `~/.ssh`/`authorized_keys` ou clé .pub non conforme.
    
- **We did not send a packet, disable method** (côté `ssh -vvv`)
    
    → La clé privée ne correspond pas à la clé publique sur le serveur.
    
    Vérifie l’empreinte :
    
    ```bash
    ssh-keygen -lf ~/.ssh/monprofil.pub
    
    ```
    
- **Changement d’IP/port**
    
    → `ssh-keygen -R IP` et ajuster `-p`.
    

---

## 3) My Friend Nginx — servir **/** et **/chemins** proprement

### Mental model

- Nginx lit `nginx.conf` → charge des **server blocks** (vhosts) dans `sites-enabled/`.
- Un `server {}` a une **racine** (`root`) pour `/`.
- Des **locations** surchargent la racine pour certains chemins (`location /intranet/ { … }`).
- `alias` vs `root` dans `location` :
    - `alias /chemin/` → **remplace** le préfixe URI par ce chemin.
    - `root /racine` → **concatène** la racine + l’URI.

### Patron “site par défaut + sous-chemin”

**Objectif** : garder la page Nginx pour `/`, et servir un contenu dédié pour `/intranet/`.

1. **Contenu**

```bash
sudo mkdir -p /var/www/intranet
sudo tee /var/www/intranet/index.html >/dev/null <<'HTML'
<!doctype html><meta charset="utf-8"><title>Intranet</title>
<h1>Bienvenue sur l’intranet</h1>
<p>Servi depuis /intranet/</p>
HTML
sudo chown -R www-data:www-data /var/www/intranet
sudo chmod -R 755 /var/www/intranet

```

1. **Config** (`/etc/nginx/sites-available/default`)
    
    Dans le **même** `server { … }` que la racine `/var/www/html` :
    

```
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    root /var/www/html;   # / → page par défaut
    index index.html index.htm index.nginx-debian.html;
    server_name _;

    # /intranet → redirection propre vers le slash final
    location = /intranet {
        return 301 /intranet/;
    }

    # /intranet/ → sert /var/www/intranet/
    location /intranet/ {
        alias /var/www/intranet/;
        index index.html;
        try_files $uri $uri/ =404;
    }
}

```

1. **Appliquer**

```bash
sudo nginx -t && sudo systemctl reload nginx

```

1. **Valider**

```bash
curl -I http://IP/              # 200 OK, page par défaut
curl -I http://IP/intranet      # 301 → /intranet/
curl    http://IP/intranet/     # 200 OK, intranet

```

### Variantes réutilisables

#### A. Servir un **fichier unique** à un chemin précis

```
location = /healthz { return 200 "ok\n"; add_header Content-Type text/plain; }

```

#### B. Servir un **fichier** sous `/` sans créer de dossier dédié

```
location = /intranet {
    root /var/www/html;     # -> /var/www/html/intranet
    try_files /intranet.html =404;
}

```

#### C. Reverse proxy basique (microservice)

```
location /api/ {
    proxy_pass http://127.0.0.1:3000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

```

### Debug & hygiène

- **Toujours** : `sudo nginx -t` avant `reload`.
- Logs :
    - accès : `/var/log/nginx/access.log`
    - erreurs : `/var/log/nginx/error.log`
    
    ```bash
    sudo tail -f /var/log/nginx/{access,error}.log
    
    ```
    
- **403 Forbidden** → droits/owner de `/var/www/...` (lecture pour `www-data`).
- **404** sur `/intranet` → vérifie `alias` vs `root` et la présence d’`index.html`.
- **301** intempestifs → `curl -I` pour voir les redirections, `L` pour les suivre.

---

### “Commandes d’or” (à mémoriser)

**SSH**

```bash
sshd -t
systemctl restart ssh
ssh -p PORT -i ~/.ssh/KEY user@IP
ssh -vvv -p PORT -i ~/.ssh/KEY user@IP
ssh-keygen -R IP

```

**Clés**

```bash
ssh-keygen -t ed25519 -f ~/.ssh/KEY -C "commentaire"
ssh-copy-id -i ~/.ssh/KEY.pub -p PORT user@IP
chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys

```

**Nginx**

```bash
nginx -t
systemctl reload nginx
tail -f /var/log/nginx/error.log

```

---

### Stratégie “pro” réutilisable

1. **Préparer l’accès**
    - Créer un **compte admin non-root** + **sudo**.
    - Ouvrir SSH sur un **port connu**, tester, **clés OK**, puis **désactiver password**.
2. **Automatiser les gestes**
    - Script d’init (user, clés, sshd_config minimal).
    - Templates Nginx (vhost + blocs `location` prêts à coller).
3. **Toujours valider**
    - Avant restart : `sshd -t` / `nginx -t`.
    - Après : port à l’écoute (`ss | grep`), `curl` ou `ssh -vvv`.
4. **Journaliser et corriger**
    - Lire les **logs**.
    - Corriger **permissions/owners** (souvent la vraie cause).

