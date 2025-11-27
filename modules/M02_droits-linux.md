---
layout: page
title: Gestion des droits sous Linux
sujet: Terminal & Scripting
type: module
jour: 02
ordre: 2
tags: linux, bash, permissions, droits
---

# Cours — Gestion des droits sous Linux

## 1) Pourquoi c’est crucial

Linux est **multi-utilisateurs** : plusieurs personnes/processus cohabitent. Les droits servent à :

- **protéger** (confidentialité, intégrité),
- **partager** (travail d’équipe via les groupes),
- **limiter** l’impact d’une erreur (principe du moindre privilège).

---

## 2) Vocabulaire de base

### Utilisateurs & groupes

- **root** : super-utilisateur (quasi sans limites). À utiliser **rarement**, via `sudo`, pour des actions administratives.
- **user (u)** : propriétaire d’un fichier.
- **group (g)** : groupe associé au fichier.
- **others (o)** : tous les autres.

### Types de droits

- **r** (read) : lire un **fichier** ; lister le contenu d’un **dossier**.
- **w** (write) : écrire un **fichier** ; **créer/supprimer/renommer** dans un **dossier** (si `x` aussi).
- **x** (execute) : exécuter un **fichier binaire/script** ; **traverser** un **dossier** (y entrer).

> ⚠️ Sur un dossier, x ne signifie pas “exécuter”, mais “traverser / accéder au contenu”.
> 
> 
> Pour **supprimer** un fichier dans un répertoire : il faut `w` **et** `x` sur le **répertoire**, pas forcément sur le fichier.
> 

---

## 3) Lire les droits

### Vue courte

```bash
ls -l              # fichiers
ls -ld mon_dossier # le dossier lui-même

```

Exemple :

```
drwxr-xr-x  2 joe  devops  4096 Oct 15 10:20 projet
- rwxr-xr-- 1 joe  devops   512 Oct 15 10:20 script.sh
^ ^^^ ^^^ ^^^
| |   |   └─ others (o) : r--
| |   └──── group  (g) : r-x
| └──────── user   (u) : rwx
└────────── type: d (dir) / - (file) / l (link) ...

```

### Vue détaillée

```bash
stat script.sh

```

Affiche mode octal, propriétaire, groupe, dates…

---

## 4) Modes symboliques et octaux

### Symbolique

```bash
chmod u+x,g-w script.sh   # +x pour user ; -w pour group
chmod o=r script.sh       # others : lecture seulement
chmod a-rwx fichier       # a = all (u,g,o)

```

### Octal (r=4, w=2, x=1)

- `644` → `rw-r--r--` (fichier lisible par tous, modifiable par le propriétaire)
- `600` → `rw-------` (privé)
- `755` → `rwxr-xr-x` (script exécutable par tous)
- `750` → `rwxr-x---` (équipe via groupe)

```bash
chmod 755 script.sh

```

### Récursif

```bash
chmod -R 755 dir/

```

---

## 5) Propriété & groupes

### Changer propriétaire/groupe

```bash
sudo chown paul script.sh          # propriétaire
sudo chown paul:devops script.sh   # propriétaire + groupe
sudo chgrp devops script.sh        # groupe
sudo chown -R user:group dir/      # récursif

```

### Qui suis-je / de quel groupe ?

```bash
whoami
id                # identités & groupes
id -ng            # groupe principal
id -nG            # tous les groupes
groups user

```

### Gérer les groupes (administration de base)

```bash
# (selon distro)
sudo groupadd devops
sudo usermod -aG devops paul   # ajouter 'paul' au groupe 'devops' (sans retirer les autres)
getent group devops            # afficher membres d’un groupe
newgrp devops                  # prendre le groupe sans se déconnecter

```

---

## 6) Droits spéciaux : SUID, SGID, Sticky

Ces bits **complètent** `rwx` et s’affichent comme `s` ou `t`.

- **SUID** (sur fichier, bit 4xxx) : exécution avec l’**UID du propriétaire** du fichier.
    - Affichage : `rwsr-xr-x` (`s` à la place de `x` chez **user**).
    - Ex : programme système qui a besoin d’un accès root.
    - **Risqué** si mal géré → à limiter.
- **SGID** (sur fichier, bit 2xxx) : exécution avec le **GID du groupe** du fichier.
    - Affichage : `rwxr-sr-x` (`s` chez **group**).
- **SGID** (sur **répertoire**) : **héritage de groupe** : les nouveaux fichiers/dossiers héritent du groupe du dossier.
    - Recette *projet d’équipe* :
        
        ```bash
        sudo chgrp -R devops /srv/projet
        sudo chmod 2775 /srv/projet        # 2 = SGID sur dossier
        
        ```
        
- **Sticky bit** (sur **répertoire**, bit 1xxx) : seuls le **propriétaire du fichier** (ou root) peut le supprimer, même si le dossier est `rwx` pour tous.
    - Affichage : `drwxrwxrwt` (le `t` final).
    - Ex : `/tmp`

**En octal :**

- `chmod 4755 fichier` # SUID + 755
- `chmod 2755 dossier` # SGID + 755
- `chmod 1777 /partage` # Sticky + 777

---

## 7) Umask : droits **par défaut** à la création

**Umask** définit **ce qu’on retire** des droits par défaut :

- Valeur courante :
    
    ```bash
    umask
    
    ```
    
- Exemple : `umask 022` → nouveaux **fichiers** ≈ `644`, **dossiers** ≈ `755`
    - Fichier : base 666 − 022 = **644**
    - Dossier : base 777 − 022 = **755**

Changer temporairement :

```bash
umask 027   # fichier ~640, dossier ~750

```

---

## 8) ACL (Access Control Lists) — pour aller au-delà de u/g/o

Quand `u/g/o` ne suffit pas (droits **granulaires** par utilisateur/groupe), utilise les **ACL**.

### Voir / appliquer des ACL

```bash
getfacl fichier
setfacl -m u:alice:rw fichier      # donner rw à alice
setfacl -m g:devops:rwx dossier    # groupe devops rwx sur le dossier
setfacl -x u:alice fichier         # retirer l’ACL d’alice

# ACL par défaut (héritées par les nouveaux fichiers/dossiers)
setfacl -d -m g:devops:rwx dossier
getfacl dossier

```

> Les ACL s’ajoutent au-dessus du modèle u/g/o. Elles nécessitent que le système de fichiers les supporte (ext4, xfs, …).
> 

---

## 9) Trouver & corriger des permissions

### Rechercher par permissions

```bash
find . -type f -perm -o+w         # fichiers world-writable
find / -type f -perm -4000 2>/dev/null   # fichiers SUID (audit)

```

### Fixer récursivement (répertoires vs fichiers)

```bash
# Dossiers : 755 (SGID si projet d’équipe)
find /srv/projet -type d -exec chmod 2755 {} \;

# Fichiers : 644 (ou 640 si privé au groupe)
find /srv/projet -type f -exec chmod 0644 {} \;

```

---

## 10) Exécution d’un script : conditions requises

Pour exécuter `./script.sh` :

1. Le **fichier** doit être **exécutable** (`chmod +x`), **et**
2. Tous les **répertoires** du chemin (`.` → `/`, `/home`, `/home/user`, …) doivent être **traversables** (`x`) pour toi.

> Alternative : bash script.sh n’a pas besoin du bit x (mais a besoin des droits de lecture).
> 

---

## 11) Sudo : élever ses privilèges proprement

- **Principe** : exécuter ponctuellement une commande avec des droits supérieurs.
- **Fichier de config** : `/etc/sudoers` (éditer avec `visudo`).
- Exemples :
    
    ```bash
    sudo chown paul:devops script.sh
    sudo chgrp devops script.sh
    sudo -u postgres psql         # se faire passer pour 'postgres'
    
    ```
    
- **Moindre privilège** : donne le minimum nécessaire, pas `NOPASSWD` partout.

---

## 12) Cas réels & recettes

### A) Dossier de projet partagé (héritage de groupe + ACL)

```bash
sudo groupadd devops
sudo mkdir -p /srv/projet
sudo chgrp -R devops /srv/projet
sudo chmod 2775 /srv/projet                     # SGID pour héritage de groupe
sudo setfacl -d -m g:devops:rwx /srv/projet     # ACL par défaut pour le groupe
sudo usermod -aG devops alice
sudo usermod -aG devops bob

```

### B) Rendre un script exécutable par tous, modifiable par le propriétaire

```bash
chmod 755 deploy.sh

```

### C) Sécuriser un fichier de clé privée

```bash
chmod 600 ~/.ssh/id_rsa

```

### D) Empêcher la suppression mutuelle dans un répertoire partagé

```bash
sudo chmod 1777 /srv/partage   # sticky bit (comme /tmp)

```

### E) Corriger une arborescence “cassée”

```bash
# Dossiers 755, fichiers 644
find site/ -type d -exec chmod 755 {} \;
find site/ -type f -exec chmod 644 {} \;

```

---

## 13) Aller (un peu) plus loin

- **Capabilities Linux** (droits par capacité fine sur un binaire) :
    
    ```bash
    getcap /usr/bin/ping
    sudo setcap cap_net_raw+ep /usr/local/bin/monoutil
    
    ```
    
    Permet d’éviter un SUID root dangereux.
    
- **Attributs immuables (chattr)** :
    
    ```bash
    sudo chattr +i fichier_critique   # impossible à modifier/supprimer (même root doit retirer le +i)
    lsattr fichier_critique
    sudo chattr -i fichier_critique
    
    ```
    
- **Confinements MAC (SELinux/AppArmor)** : couches supplémentaires de sécurité (hors scope de base, mais sache que ça peut **bloquer** même si les permissions POSIX semblent correctes).

---

## 14) Checklist “droits” (avant prod)

- Propriétaire/groupe **corrects** ? (`ls -l`, `stat`)
- Permissions **minimales** nécessaires ? (`chmod` ; éviter `777`)
- Dossier d’équipe : **SGID** + **ACL par défaut** si besoin d’héritage propre ?
- Fichiers sensibles (clés, secrets) : `600` ou `640` ?
- Pas de fichiers **SUID** inutiles ? (`find / -perm -4000`)
- Pas de **world-writable** non voulus ? (`find . -perm -o+w`)
- Umask adapté (`umask 027` sur serveurs) ?
- Sudo : règles **précises** via `visudo`, principe du moindre privilège.

---

## 15) Exercices rapides (à faire)

1. **Lire & comprendre** :
    - Que signifie `rwxr-sr-x` ? (Réponse : SGID sur fichier, `s` dans le triplet group.)
2. **Partage d’équipe** :
    - Crée `/srv/projet` partagé avec héritage de groupe `devops` et ACL par défaut `rwx` pour `devops`.
3. **Audit** :
    - Trouve tous les fichiers world-writable dans `/var/www` et corrige-les.
4. **Sécurise** :
    - Mets `~/.ssh/id_rsa` en `600` et explique **pourquoi** c’est requis.

---

## 16) Tes commandes (corrigées & consolidées)

```bash
# Voir les droits
ls -l            # fichiers
ls -ld dossier   # le dossier lui-même
stat fichier

# Changer droits (symbolique / octal)
chmod o=r -- script.sh
chmod u+x,g-w -- script.sh
chmod 755 -- script.sh

# Propriétaire / groupe
sudo chown paul:devops script.sh
sudo chgrp devops script.sh
id -ng           # groupe principal
id -nG           # groupes de l'utilisateur

# Récursif
sudo chown -R paul:devops /srv/projet
chmod -R 755 /srv/projet

# Bits spéciaux
chmod 4755 /usr/local/bin/out      # SUID
chmod 2755 /srv/projet             # SGID (héritage de groupe)
chmod 1777 /srv/partage            # sticky

# ACL
setfacl -m u:alice:rw fichier
setfacl -m g:devops:rwx dossier
setfacl -d -m g:devops:rwx dossier
getfacl dossier

# Trouver des permissions “dangereuses”
find . -type f -perm -o+w
find / -type f -perm -4000 2>/dev/null

```

---
[← Module précédent](M02_scripting-bash.md) | [Module suivant →](M02_cron-automatisation.md)
---
