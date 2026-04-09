---
layout: page
title: Administration de serveur SSH
sujet: Administration, Sécurité
type: module
jour: 08
ordre: 1
tags: ssh, linux, security
---

# Administration de serveur SSH

## 1) Vue d’ensemble (pourquoi SSH, et ce que ça résout)

**SSH (Secure Shell)** est un protocole qui fournit :

- **Confidentialité** : tout le trafic est chifré (empêche l’espionnage en clair).
- **Intégrité** : on détecte les modifications (empêche l’altération silencieuse).
- **Authenticité** : on sait à qui on parle (serveur ↔ client) via **clés**.

SSH résout donc trois problèmes fondamentaux de l’admin distante :

1. se connecter **de façon sûre** à un hôte potentiellement loin,
2. **authentifier** les parties (moi ↔ le bon serveur),
3. **transférer** des fichiers/tunnels de manière **sécurisée** (SCP/SFTP, port forwarding).

---

## 2) Menaces & modèle de sécurité (menace → mesure)

| Menace | Exemple | Mesure dans SSH |
| --- | --- | --- |
| Espionnage du trafic | Capture réseau en clair | **Chiffrement** bout-à-bout |
| Usurpation du serveur | Attaquant imite le serveur | **Clé d’hôte** (host key) + **known_hosts** |
| Vol d’identifiants | Mot de passe intercepté | **Auth par clé** (privée locale) + passphrase/MFA |
| Mouvement latéral | Compromission d’un compte | **Moindre privilège**, **bastion**, **journaux**, **rotation de clés** |
| Attaques par force brute | Tentatives multiples | **fail2ban**, limites d’essais, **MFA** |

**Idée clé** : la **clé d’hôte** (du serveur) vous garantit l’identité du serveur ; votre **clé privée** prouve votre identité côté client.

---

## 3) Clés & identités (bien comprendre les rôles)

### 3.1 Clés d’hôte (serveur)

- Générées à l’installation du serveur SSH (OpenSSH).
- La première fois que vous vous connectez, vous **enregistrez son empreinte** dans `~/.ssh/known_hosts`.
- Si l’empreinte **change** (message “REMOTE HOST IDENTIFICATION HAS CHANGED!”), vérifier s’il s’agit d’un **changement légitime** ou d’une attaque (MITM).

### 3.2 Clés utilisateur (client)

- Paire **privée/publique** (ex. `id_ed25519` / `id_ed25519.pub`).
- La **clé publique** est copiée sur le serveur (dans `~/.ssh/authorized_keys` du compte cible).
- À la connexion, le serveur **défie** le client → seule la **clé privée** peut répondre correctement.
    
    ⇒ **Aucun secret ne transite** : c’est ce qui rend la méthode très sûre.
    

### 3.3 Types de clés & choix

- **Ed25519** : moderne, rapide, robuste (recommandé).
- **RSA** : OK si **≥ 3072 bits**, mais Ed25519 est à préférer aujourd’hui.
- **ECDSA** : possible, mais Ed25519 a la faveur d’OpenSSH.

---

## 4) Comment SSH établit un canal sûr (en simplifiant)

1. **Négociation** des algorithmes (chiffre, MAC, KEX…).
2. **Échange de clés** (ex. Curve25519) pour établir un **secret partagé**.
3. **Vérification de l’identité du serveur** via sa **clé d’hôte**.
4. **Authentification** du client (mot de passe, **clé publique**, ou MFA).
5. **Session chiffrée** : exécutions de commandes, shell interactif, transferts, tunnels.

**À retenir** : c’est l’auth **par clé** qui évite d’envoyer des mots de passe réutilisables et se prête bien à l’automatisation.

---

## 5) Bonnes pratiques de sécurité (principes)

- **Toujours privilégier l’authentification par clé** (désactiver le mot de passe si possible).
- **Protéger la clé privée** (permissions strictes, passphrase, agent).
- **Limiter** : `AllowUsers`/`AllowGroups`, **pas de root direct** (`PermitRootLogin no`), **pare-feu**.
- **Surveiller** : journaux (`auth.log`, `journalctl -u ssh`), `fail2ban`.
- **Isoler** : bastion (jump host), **ProxyJump**, **agent forwarding** avec parcimonie.
- **Industrialiser** : **rotation de clés**, **inventaire**, règles GitOps (sshd_config versionné), secrets vaultés.
- **Renforcer** : **MFA** (OTP/U2F), **chiffres & KEX** modernes.

## 6) Générer et déployer une paire de clés (client → serveur)

### 6.1 Linux/Debian (client)

**Génération (sans passphrase pour l’automatisation, avec passphrase pour l’interactif) :**

```bash
# Ed25519 recommandé (rapide & sûr)
ssh-keygen -t ed25519 -f ~/.ssh/mykey -N ""     # -N "" = pas de passphrase
# OU (avec passphrase) : ssh-keygen -t ed25519 -f ~/.ssh/mykey

```

**Explications :**

- `t ed25519` : type de clé (préférer Ed25519).
- `f` : chemin/nom du fichier clé privée.
- `N` : passphrase (vide ici pour l’exemple).

**Voir la clé publique :**

```bash
cat ~/.ssh/mykey.pub

```

**Copier la clé publique sur le serveur (méthode simple) :**

```bash
ssh-copy-id -i ~/.ssh/mykey.pub debian@192.168.1.4
# Demande le mdp (une dernière fois) puis ajoute la clé à ~/.ssh/authorized_keys (serveur)

```

> Si ssh-copy-id indisponible (Windows/BusyBox) :
> 
> 
> `scp ~/.ssh/mykey.pub debian@192.168.1.4:/tmp/` puis côté serveur :
> 
> `mkdir -p ~/.ssh && cat /tmp/mykey.pub >> ~/.ssh/authorized_keys && rm /tmp/mykey.pub`
> 

**Permissions côté serveur (critiques) :**

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys

```

**Connexion par clé :**

```bash
ssh -i ~/.ssh/mykey debian@192.168.1.4

```

### 6.2 Windows (client)

### Option A — OpenSSH intégré (Windows 10/11)

**Installer/activer si besoin :**

```powershell
# Client
Get-WindowsCapability -Online | ? Name -like 'OpenSSH.Client*'
Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0

# Serveur (si vous voulez héberger SSH sur Windows)
Get-WindowsCapability -Online | ? Name -like 'OpenSSH.Server*'
Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
Start-Service sshd
Set-Service -Name sshd -StartupType Automatic

```

**Générer la clé et se connecter (PowerShell/CMD) :**

```powershell
ssh-keygen -t ed25519 -f $env:USERPROFILE\.ssh\mykey -N ""
type $env:USERPROFILE\.ssh\mykey.pub
# Copier manuellement la clé publique sur le serveur (voir scp ci-dessous)

# Connexion
ssh -i $env:USERPROFILE\.ssh\mykey debian@192.168.1.4

```

**Copier la clé publique (ssh-copy-id n’existe pas par défaut) :**

```powershell
# Copier la clé vers /tmp/
scp -i $env:USERPROFILE\.ssh\mykey $env:USERPROFILE\.ssh\mykey.pub debian@192.168.1.4:/tmp/
# Puis côté serveur Linux : faites l'append dans authorized_keys (cf. plus haut)

```

> Fichier authorized_keys sur Windows Server OpenSSH (si le serveur est Windows) :
> 
> 
> `C:\Users\<User>\.ssh\authorized_keys`
> 
> Vérifiez les ACL (limiter à l’utilisateur). Exemple :
> 
> `icacls C:\Users\<User>\.ssh /inheritance:r`
> 
> `icacls C:\Users\<User>\.ssh /grant <User>:(R,W)`
> 
> `icacls C:\Users\<User>\.ssh\authorized_keys /grant <User>:(R,W)`
> 

### Option B — PuTTY/WinSCP

- **PuTTYgen** : génère la paire (PPK + OpenSSH public).
- **Pageant** : agent pour charger votre clé (SSO SSH).
- **PuTTY** : mettez `user@host`, port 22, clé privée PPK dans *Connection > SSH > Auth*.
- **WinSCP** : SFTP/FTP(S) graphique, supporte les clés PuTTY.

---

## 7) Configurer le serveur SSH (Debian/Ubuntu et Windows)

### 7.1 Debian/Ubuntu (serveur OpenSSH)

**Installation & service :**

```bash
sudo apt update && sudo apt install -y openssh-server
sudo systemctl enable --now ssh
sudo systemctl status ssh

```

**Fichier de conf** : `/etc/ssh/sshd_config` (puis `sudo systemctl reload ssh`)

Réglages de durcissement utiles :

```
# Extraits conseillés
Port 22                         # Vous pouvez changer (ex. 2222) mais ce N'EST PAS une sécurité
Protocol 2                      # V2 uniquement
PermitRootLogin no              # Interdire root direct (préférer sudo)
PasswordAuthentication no       # Désactiver mdp (si clés en place)
PubkeyAuthentication yes
ChallengeResponseAuthentication no
UsePAM yes
X11Forwarding no
AllowUsers debian ansible ci-bot # Liste blanche d'utilisateurs
# AllowGroups sshusers
# MaxAuthTries 3
# LoginGraceTime 30
# ClientAliveInterval 300
# ClientAliveCountMax 2

```

**Recharge :**

```bash
sudo systemctl reload ssh

```

**Pare-feu (ex.: UFW) :**

```bash
sudo ufw allow 22/tcp
sudo ufw enable
sudo ufw status

```

**Journalisation (diagnostic) :**

```bash
sudo journalctl -u ssh -e
sudo tail -f /var/log/auth.log

```

### 7.2 Windows (serveur OpenSSH)

- Fichier : `C:\ProgramData\ssh\sshd_config` (similaire aux directives OpenSSH)
- **Service** : `sshd` (Services.msc / PowerShell)
- **Pare-feu** : autoriser le port (22 par défaut)

---

## 8) Copie & synchronisation de fichiers (SCP, SFTP, rsync)

### 8.1 SCP (simple, intégré à OpenSSH)

```bash
# Local -> Distant
scp -i ~/.ssh/mykey fichier.txt debian@192.168.1.4:/home/debian/

# Distant -> Local
scp -i ~/.ssh/mykey debian@192.168.1.4:/var/log/syslog ./syslog

# Recursif (dossiers)
scp -r projet/ debian@192.168.1.4:/opt/

```

### 8.2 SFTP (mode interactif)

```bash
sftp -i ~/.ssh/mykey debian@192.168.1.4
sftp> put fichier
sftp> get fichier
sftp> ls
sftp> exit

```

### 8.3 rsync (différentiel, très utilisé en DevOps)

```bash
rsync -avz -e "ssh -i ~/.ssh/mykey" ./site/ debian@192.168.1.4:/var/www/site/

```

**Windows :** `scp`, `sftp` disponibles via OpenSSH client ; sinon WinSCP (GUI).

---

## 9) Tunnels SSH (port forwarding) — puissant et souvent sous-exploité

### 9.1 Tunnel local (accéder à un service distant via localhost)

> Accéder au port 5432 (PostgreSQL) d’un serveur distant comme s’il était local :
> 

```bash
ssh -i ~/.ssh/mykey -L 5432:127.0.0.1:5432 debian@192.168.1.4
# Puis connexion locale : psql -h 127.0.0.1 -p 5432 ...

```

### 9.2 Tunnel distant (exposer un service local via le serveur)

```bash
ssh -i ~/.ssh/mykey -R 8022:127.0.0.1:22 debian@192.168.1.4
# Le serveur écoute 127.0.0.1:8022 qui pointe vers votre SSH local

```

### 9.3 Proxy SOCKS (navigation via le serveur)

```bash
ssh -i ~/.ssh/mykey -D 1080 debian@192.168.1.4
# Configurer le navigateur en SOCKS5 localhost:1080

```

---

## 10) Bastion, ProxyJump, Multi-sauts

**Objectif :** traverser un bastion (jump host) proprement.

- **Ad hoc :**
    
    ```bash
    ssh -J bastion@1.2.3.4 debian@192.168.1.4
    
    ```
    
- **Déclaratif (~/.ssh/config) :**
    
    ```
    Host bastion
      HostName 1.2.3.4
      User bastion
    
    Host cible
      HostName 192.168.1.4
      User debian
      ProxyJump bastion
      IdentityFile ~/.ssh/mykey
    
    ```
    

Puis : `ssh cible`

---

## 11) Optimisations côté client

### 11.1 Agent & passphrase (confort + sécurité)

```bash
# Démarrer l’agent et y charger une clé protégée par passphrase
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

```

Windows : **Pageant** (PuTTY) ou `ssh-agent` via PowerShell.

### 11.2 Multiplexage (accélérer connexions répétées)

```
# ~/.ssh/config
Host *
  ControlMaster auto
  ControlPath ~/.ssh/cm-%r@%h:%p
  ControlPersist 10m

```

---

## 12) Sécurisation avancée (serveur)

- **Fail2ban** (bloque automatiquement les IP à force de tentatives ratées) :
    
    ```bash
    sudo apt install -y fail2ban
    # jail local à activer : /etc/fail2ban/jail.local (service sshd)
    
    ```
    
- **Désactiver login root** : `PermitRootLogin no`
- **Désactiver auth par mot de passe** (si clés déployées) : `PasswordAuthentication no`
- **Limiter par utilisateurs/groupes** : `AllowUsers` / `AllowGroups`
- **Port non standard** (utile contre le bruit, mais pas une défense) : `Port 2222`
- **Chiffres & MAC modernes** (OpenSSH le fait), désactiver anciens algos.
- **SFTP en chroot** pour utilisateurs restreints :
    
    ```
    Subsystem sftp internal-sftp
    Match Group sftpusers
      ChrootDirectory /sftp/%u
      ForceCommand internal-sftp
      X11Forwarding no
      AllowTcpForwarding no
    
    ```
    
- **MFA** (Google Authenticator, Duo, etc.) via PAM (hors détail ici).

---

## 13) Dépannage — erreurs fréquentes

- `Permission denied (publickey)` :
    - Clé publique **non** dans `~/.ssh/authorized_keys` ?
    - **Permissions** incorrectes (réparer `chmod 700 ~/.ssh` + `chmod 600 authorized_keys`) ?
    - Mauvais **utilisateur** ou mauvais **i clé** ?
- `REMOTE HOST IDENTIFICATION HAS CHANGED!` :
    - L’empreinte du serveur a changé. Vérifier qu’il n’y a pas d’attaque MITM.
    - Si changement légitime : supprimer la ligne correspondante dans `~/.ssh/known_hosts`.
- Bloqué par **pare-feu** : tester `telnet IP 22` / `nc -vz IP 22` depuis le client.
- `ssh-copy-id` absent sur Windows : utilisez `scp` puis `cat >> authorized_keys`.
- Journal côté serveur : `journalctl -u ssh -e` / `tail -f /var/log/auth.log`.

---

## 14) Annexes pratiques

### 14.1 Fichier client `~/.ssh/config` (qualité de vie)

```
Host srv
  HostName 192.168.1.4
  User debian
  IdentityFile ~/.ssh/mykey
  Port 22
  ServerAliveInterval 30
  ServerAliveCountMax 2

```

→ permet de faire simplement : `ssh srv`

### 14.2 Commandes rapides (récap)

```bash
# Générer clé
ssh-keygen -t ed25519 -f ~/.ssh/mykey -N ""

# Déployer clé
ssh-copy-id -i ~/.ssh/mykey.pub debian@192.168.1.4

# Se connecter
ssh -i ~/.ssh/mykey debian@192.168.1.4

# Transférer
scp -i ~/.ssh/mykey fichier debian@192.168.1.4:/tmp/
sftp -i ~/.ssh/mykey debian@192.168.1.4

# Tunnels
ssh -L 8080:127.0.0.1:80 debian@192.168.1.4
ssh -D 1080 debian@192.168.1.4

```



<!-- snippet
id: ssh_keygen_gen
type: command
tech: ssh
level: beginner
importance: high
format: knowledge
tags: ssh,keygen,ed25519,cle
title: Générer une clé SSH Ed25519
context: créer une paire de clés pour l'authentification sans mot de passe
command: ssh-keygen -t ed25519 -f ~/.ssh/mykey -N ""
description: Génère une paire de clés Ed25519 sans passphrase (adapté à l'automatisation). Pour un usage interactif, omettre `-N ""` afin de saisir une passphrase. Clé privée : ~/.ssh/mykey, clé publique : ~/.ssh/mykey.pub.
-->

<!-- snippet
id: ssh_copy_id
type: command
tech: ssh
level: beginner
importance: high
format: knowledge
tags: ssh,cle,authorized_keys,deploiement
title: Déployer une clé publique SSH sur un serveur
context: autoriser l'accès par clé avant de désactiver les mots de passe
command: ssh-copy-id -i ~/.ssh/mykey.pub debian@192.168.1.4
description: Ajoute la clé publique dans ~/.ssh/authorized_keys sur le serveur cible. Demande le mot de passe une dernière fois. Si ssh-copy-id est absent, utiliser : `cat ~/.ssh/mykey.pub | ssh user@IP 'mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys'`.
-->

<!-- snippet
id: ssh_install_serveur
type: command
tech: ssh
level: beginner
importance: high
format: knowledge
tags: ssh,openssh,installation,service
title: Installer et activer le serveur SSH OpenSSH
context: préparer un serveur Debian/Ubuntu pour accepter des connexions SSH
command: sudo apt update && sudo apt install -y openssh-server && sudo systemctl enable --now ssh
description: Installe OpenSSH Server, l'active au démarrage et le lance immédiatement. Vérifier ensuite avec `sudo systemctl status ssh` et `ss -ltnp | grep :22`.
-->

<!-- snippet
id: ssh_sshd_config_durcissement
type: concept
tech: ssh
level: intermediate
importance: high
format: knowledge
tags: ssh,sshd_config,durcissement,securite
title: Directives clés de durcissement dans sshd_config
context: configurer un serveur SSH conforme aux bonnes pratiques de sécurité
content: Directives essentielles dans /etc/ssh/sshd_config : `PermitRootLogin no` (interdire root direct), `PasswordAuthentication no` (clés obligatoires), `PubkeyAuthentication yes`, `MaxAuthTries 3`, `LoginGraceTime 30`, `AllowUsers user1 user2` (liste blanche). Toujours valider avec `sudo sshd -t` avant `sudo systemctl reload ssh`. Chaque directive réduit une surface d'attaque spécifique.
-->

<!-- snippet
id: ssh_tunnel_local
type: command
tech: ssh
level: intermediate
importance: medium
format: knowledge
tags: ssh,tunnel,port-forwarding,proxy
title: Créer un tunnel SSH local vers un service distant
context: accéder à un service distant (base de données, interface web) comme s'il était local
command: ssh -i ~/.ssh/mykey -L 5432:127.0.0.1:5432 debian@192.168.1.4
description: Redirige le port local 5432 vers le port 5432 du serveur distant via le tunnel SSH. Après connexion, se connecter à 127.0.0.1:5432 localement pour joindre le service distant. Remplacer les ports selon le service cible (80, 8080, 3306, etc.).
-->

<!-- snippet
id: ssh_proxyjump
type: command
tech: ssh
level: advanced
importance: medium
format: knowledge
tags: ssh,bastion,proxyjump,multi-sauts
title: Connexion SSH via un bastion (ProxyJump)
context: atteindre un serveur interne en passant par un hôte de rebond
command: ssh -J bastion@1.2.3.4 debian@192.168.1.4
description: Utilise le bastion 1.2.3.4 comme rebond pour atteindre 192.168.1.4. Évite d'exposer directement les serveurs internes. Déclarable de façon permanente dans ~/.ssh/config avec `ProxyJump bastion`.
-->

<!-- snippet
id: ssh_fail2ban
type: tip
tech: ssh
level: intermediate
importance: high
format: knowledge
tags: ssh,fail2ban,bruteforce,securite
title: Protéger SSH contre la force brute avec Fail2ban
context: bloquer automatiquement les IP qui enchaînent les échecs de connexion SSH
content: Installer Fail2ban : `sudo apt install -y fail2ban`. Créer /etc/fail2ban/jail.local avec `[sshd]`, `enabled = true`, `maxretry = 5`, `bantime = 3600`. Relancer avec `sudo systemctl restart fail2ban`. Contrôler avec `sudo fail2ban-client status sshd`. Fail2ban analyse auth.log et bloque les IP via iptables/nftables après le nombre de tentatives configuré.
-->

<!-- snippet
id: ssh_rsync
type: command
tech: ssh
level: intermediate
importance: medium
format: knowledge
tags: ssh,rsync,transfert,synchronisation,devops
title: Synchroniser des fichiers vers un serveur via rsync/SSH
context: déployer des fichiers ou synchroniser un dossier de façon différentielle
command: rsync -avz -e "ssh -i ~/.ssh/mykey" ./site/ debian@192.168.1.4:/var/www/site/
description: Transfère uniquement les fichiers modifiés (différentiel) en utilisant SSH comme transport. Plus efficace que scp pour les déploiements répétés. `-a` préserve les attributs, `-v` mode verbeux, `-z` compression.
-->

---
[Module suivant →](M08_securite.md)
---
