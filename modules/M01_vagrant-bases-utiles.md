---
titre: Vagrant — bases utiles
type: module
jour: 01
ordre: 1
tags: vagrant, virtualisation, linux, devops
---

# Vagrant — bases utiles (cours)

- **Vagrant** automatise la création/configuration de VMs.
- **Box** : image préconfigurée (modèle) ; **provider** : virtualiseur (VirtualBox, etc.)
- Commandes clés :
    - `vagrant init <box>` → crée `Vagrantfile`
    - `set VAGRANT_VAGRANTFILE=Vagrantfile.amd64` → définit le choix du `Vagrantfile`
    - `vagrant up` → démarre/crée la VM
    - `vagrant ssh` → se connecter en SSH
    - `vagrant halt` → éteindre
    - `vagrant destroy` → supprimer la VM
- Accès SSH typique : `127.0.0.1:2222`
- Ex. : `vagrant destroy 1a2b3c4d` (détruit la VM d’ID partiel)
    
    ---
    

---

---
[Module suivant →](001_terminal-bash.md)
---

## ⚙️ 1. Préparer ton environnement SSH sous Windows (Git Bash)

Ouvre **Git Bash** dans ton répertoire Vagrant (là où se trouve ton `Vagrantfile`).

Ensuite exécute :

```bash
mkdir -p ~/.ssh
touch ~/.ssh/config
chmod 700 ~/.ssh
chmod 600 ~/.ssh/config

```

🟢 **Explications :**

- `mkdir -p ~/.ssh` → crée le dossier s’il n’existe pas.
- `touch ~/.ssh/config` → crée le fichier de configuration SSH.
- `chmod 700 ~/.ssh` → le dossier est accessible uniquement à ton utilisateur.
- `chmod 600 ~/.ssh/config` → le fichier est lisible/écrivable uniquement par toi (sécurité).

---

## 🧱 2. Récupérer l’ID de ta VM Vagrant

Toujours dans ton dossier Vagrant :

```bash
vagrant global-status

```

Cela affiche toutes tes VMs Vagrant.

Exemple :

```
id       name    provider   state   directory
----------------------------------------------------
3a1b9e1  default virtualbox running C:/Users/Goose/DevOps/devops-full-time-setup/python

```

➡ Ici, **l’ID est `3a1b9e1`**.

---

## 🧩 3. Générer la configuration SSH automatiquement

On va ajouter cette configuration directement dans ton fichier `~/.ssh/config`.

Exécute :

```bash
vagrant ssh-config 3a1b9e1 --host backend >> ~/.ssh/config

```

🟢 **Explications :**

- `3a1b9e1` → remplace par ton ID réel.
- `-host backend` → c’est le **nom personnalisé** que tu donnes à cette connexion (tu pourrais mettre `-host devserver` si tu préfères).
- `>>` → ajoute la configuration à la fin du fichier `~/.ssh/config`.

---

## 📁 4. Vérifie le contenu du fichier SSH

Ouvre-le pour vérifier :

```bash
cat ~/.ssh/config

```

Tu devrais voir quelque chose comme :

```
Host backend
  HostName 127.0.0.1
  User vagrant
  Port 2222
  IdentityFile C:/Users/Goose/Documents/DevOps/devops-full-time-setup/python/.vagrant/machines/default/virtualbox/private_key

```

---

## 💻 5. Tester la connexion SSH

Maintenant que la configuration est faite, tu peux te connecter à ta VM **simplement** :

```bash
ssh backend

```

Si tout est correct, tu es dans ta machine Vagrant 🎉

---

## 🧠 6. Connexion directe depuis Visual Studio Code

### 🔹 Méthode 1 — Extension “Remote - SSH”

1. Installe l’extension **Remote - SSH** dans VS Code.
2. Clique sur `><` en bas à gauche → “Connect to Host...”
3. Sélectionne ton **host `backend`** (ou le nom que tu as mis).
4. VS Code ouvre directement un terminal connecté à ta VM !

### 🔹 Méthode 2 — Ligne de commande

Tu peux aussi lancer :

```bash
code --remote ssh-remote+backend

```

Cela ouvrira automatiquement une nouvelle fenêtre VS Code connectée à ta VM via SSH.

---

## 🧹 7. Bonus — Gestion et nettoyage

Pour lister ou supprimer proprement les anciennes VMs :

```bash
vagrant global-status --prune

```

👉 Cela supprime les entrées de VMs supprimées mais encore listées.

---

## 🧾 Résumé rapide

| Étape | Commande | Objectif |
| --- | --- | --- |
| 1️⃣ | `mkdir -p ~/.ssh && touch ~/.ssh/config` | Prépare le fichier SSH |
| 2️⃣ | `vagrant global-status` | Récupère l’ID de la VM |
| 3️⃣ | `vagrant ssh-config <ID> --host backend >> ~/.ssh/config` | Ajoute la config |
| 4️⃣ | `ssh backend` | Connexion rapide |
| 5️⃣ | `code --remote ssh-remote+backend` | Ouvre VS Code connecté à la VM |

---
[← Module précédent](M01_vagrant-bases-utiles-2025.md) | [Module suivant →](M01_terminal-bash.md)
---
