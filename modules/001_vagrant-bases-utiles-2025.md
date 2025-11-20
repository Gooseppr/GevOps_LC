---
titre: Vagrant — bases utiles et gestion SSH
type: module
jour: 01
ordre: 1
tags: vagrant, virtualisation, ssh, gitlab, vscode, devops
---

# 🧱 Vagrant — bases utiles et gestion SSH (2025)

> **Objectif :** maîtriser les commandes essentielles de Vagrant, se connecter à une VM via SSH ou Visual Studio Code, et gérer ses clés SSH pour des services externes comme GitLab.

---

## 🧭 1. Comprendre Vagrant

Vagrant automatise la création et la configuration de **machines virtuelles** reproductibles.

| Élément | Description |
|----------|--------------|
| **Box** | Image système préconfigurée servant de modèle (Debian, Ubuntu, etc.) |
| **Provider** | Logiciel de virtualisation utilisé (VirtualBox, VMware, etc.) |
| **Vagrantfile** | Fichier de configuration décrivant la VM à créer |
| **SSH** | Moyen de connexion sécurisé à la VM |

---

## ⚙️ 2. Commandes de base Vagrant (Windows & Bash)

> À exécuter dans le dossier contenant ton `Vagrantfile`.

| Commande | Description |
|-----------|--------------|
| `vagrant init <box>` | Initialise un projet Vagrant avec une box (ex: `debian/bookworm64`) |
| `vagrant up` | Crée et démarre la VM |
| `vagrant halt` | Éteint la VM |
| `vagrant reload` | Recharge la config (sans recréer la VM) |
| `vagrant destroy` | Supprime complètement la VM |
| `vagrant status` | Affiche l’état actuel de la VM |
| `vagrant ssh` | Connexion directe à la VM |
| `vagrant global-status` | Liste toutes les VMs connues |
| `vagrant global-status --prune` | Nettoie les anciennes entrées de VM |
| `set VAGRANT_VAGRANTFILE=Vagrantfile.amd64` *(Windows)* | Définit un Vagrantfile spécifique |
| `export VAGRANT_VAGRANTFILE=Vagrantfile.arm64` *(Linux/Mac)* | Même chose sous Linux |

---

## 💻 3. Connexion SSH classique à la VM

Après un `vagrant up`, tu peux te connecter avec :

```bash
vagrant ssh
```

🔎 Cette commande utilise automatiquement :
- **Host** → `127.0.0.1`
- **Port** → `2222`
- **User** → `vagrant`
- **Clé privée** → générée par Vagrant dans `.vagrant/machines/.../private_key`

---

## 🧩 4. Créer une entrée personnalisée SSH (pour VS Code)

Pour une connexion plus propre depuis **VS Code** ou le terminal, crée un fichier SSH global.

### Étapes

#### 1️⃣ Crée le dossier et le fichier de config SSH
```bash
mkdir -p ~/.ssh
touch ~/.ssh/config
chmod 700 ~/.ssh
chmod 600 ~/.ssh/config
```

#### 2️⃣ Ajoute la config générée automatiquement par Vagrant
Trouve ton ID de VM :
```bash
vagrant global-status
```
Exemple :
```
id       name    provider   state   directory
----------------------------------------------------
3a1b9e1  default virtualbox running C:/Users/Goose/Documents/DevOps/devops-full-time-setup/python
```

Ajoute la configuration :
```bash
vagrant ssh-config 3a1b9e1 --host devbox >> ~/.ssh/config
```

#### 3️⃣ Vérifie le résultat
```bash
cat ~/.ssh/config
```

Exemple attendu :
```
Host devbox
  HostName 127.0.0.1
  User vagrant
  Port 2222
  IdentityFile C:/Users/Goose/Documents/DevOps/devops-full-time-setup/python/.vagrant/machines/default/virtualbox/private_key
```

Tu peux maintenant te connecter simplement :
```bash
ssh devbox
```

---

## 🧠 5. Connexion à la VM depuis Visual Studio Code

### 🧩 Méthode 1 — Extension “Remote - SSH”

1. Installe l’extension **Remote - SSH**.
2. Clique sur `><` en bas à gauche → **Connect to Host...**
3. Sélectionne `devbox` (ou le nom défini dans ton `~/.ssh/config`).
4. VS Code ouvre directement un terminal connecté à ta VM.

### 🧩 Méthode 2 — Ligne de commande
```bash
code --remote ssh-remote+devbox
```

---

## 🔑 6. Gérer tes clés SSH (GitLab, GitHub, etc.)

### ⚙️ Générer une clé SSH sur ton PC (hôte)
Sur **Windows / Git Bash** :
```bash
ssh-keygen -t ed25519 -C "goose@host"
```

Cela crée :
```
C:\Users\goose\.ssh\id_ed25519
C:\Users\goose\.ssh\id_ed25519.pub
```

Charge la clé dans l’agent :
```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
ssh-add -l    # vérifie qu’elle est chargée
```

### ➕ Ajouter la clé à GitLab
1. Copie la clé publique :
   ```bash
   cat ~/.ssh/id_ed25519.pub | clip
   ```
2. Va dans **GitLab > Settings > SSH Keys**.
3. Colle ta clé, donne un nom (“PC Goose”) et valide.

---

## 🛰️ 7. Utiliser cette clé dans ta VM Vagrant

### Option 1 — (Recommandée) Agent Forwarding
> Permet à la VM d’utiliser **la clé de ton PC** sans la copier.

Dans ton `Vagrantfile` :
```ruby
config.ssh.forward_agent = true
```

Recharge :
```bash
vagrant reload
vagrant ssh -A
```

Teste :
```bash
ssh -T git@gitlab.com
```

✅ Si tu vois :  
> Welcome to GitLab, @goose

... c’est bon, ta clé locale est bien utilisée depuis la VM.

### Option 2 — Clé dédiée à la VM
Si tu préfères générer une clé **directement dans la VM** :
```bash
ssh-keygen -t ed25519 -C "vagrant@vm" -f ~/.ssh/id_ed25519
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_ed25519
chmod 644 ~/.ssh/id_ed25519.pub
cat ~/.ssh/id_ed25519.pub
```
➡️ Copie et ajoute cette clé à GitLab (comme précédemment).

---

## 🧹 8. Gestion et nettoyage des VMs

```bash
vagrant global-status --prune    # nettoie les entrées obsolètes
vagrant destroy                  # supprime une VM
vagrant suspend                  # met une VM en veille
vagrant resume                   # relance une VM suspendue
```

---

## 🧾 Résumé express

| Étape | Commande / Action | Objectif |
|-------|--------------------|-----------|
| 1️⃣ | `vagrant up` | Crée et démarre la VM |
| 2️⃣ | `vagrant ssh` | Connexion rapide |
| 3️⃣ | `vagrant ssh-config <ID> --host devbox` | Ajoute une config SSH permanente |
| 4️⃣ | `ssh devbox` | Connexion simplifiée |
| 5️⃣ | `code --remote ssh-remote+devbox` | Connexion VS Code |
| 6️⃣ | `ssh-keygen -t ed25519` | Crée une clé SSH |
| 7️⃣ | `ssh-add ~/.ssh/id_ed25519` | Charge la clé |
| 8️⃣ | `ssh -T git@gitlab.com` | Teste GitLab via SSH |
| 9️⃣ | `vagrant ssh -A` + `config.ssh.forward_agent = true` | Utilise la clé de ton hôte depuis la VM |

---

## 🧩 9. Schéma mental de workflow complet

```
[ Ton PC ]
   │
   ├── Vagrantfile → crée une VM Debian via VirtualBox
   │
   ├── Clé SSH locale (id_ed25519)
   │        │
   │        ├── utilisée pour GitLab
   │        └── forwardée à la VM (vagrant ssh -A)
   │
   └── VS Code → Remote SSH → se connecte à la VM
```

---

## 🎯 À retenir

- **Vagrant** te donne un environnement isolé et reproductible.
- **SSH** est la clé d’entrée : vers la VM, VS Code, et les dépôts Git.
- **Agent Forwarding** = sécurité + simplicité : ta clé ne quitte jamais ton PC.
- **GitLab** ou **GitHub** peuvent coexister : ajoute la même clé sur chaque plateforme.

---

[Module suivant →](001_terminal-bash.md)

---
[Module suivant →](001_vagrant-bases-utiles.md)
---

---
[Module suivant →](001_vagrant-bases-utiles.md)
---

---
[Module suivant →](001_vagrant-bases-utiles.md)
---

---
[Module suivant →](001_vagrant-bases-utiles.md)
---

---
[Module suivant →](001_vagrant-bases-utiles.md)
---

---
[Module suivant →](001_vagrant-bases-utiles.md)
---

---
[Module suivant →](001_vagrant-bases-utiles.md)
---

---
[Module suivant →](001_vagrant-bases-utiles.md)
---

---
[Module suivant →](001_vagrant-bases-utiles.md)
---

---
[Module suivant →](001_vagrant-bases-utiles.md)
---

---
[Module suivant →](001_vagrant-bases-utiles.md)
---

---
[Module suivant →](001_vagrant-bases-utiles.md)
---

---
[Module suivant →](001_vagrant-bases-utiles.md)
---

---
[Module suivant →](001_vagrant-bases-utiles.md)
---
