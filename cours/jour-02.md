---
layout: page
title: Jour 02 — Scripting Bash et Droix Linux
---

## Objectifs
1. Effectuer des scripts en Bash
2. Gérer les droits sous Linux
3. Automatiser avec Cron

# Cours — Scripting Bash

## 1) Pourquoi script­er ?

Les scripts Bash sont des **recettes réutilisables** : tu enchaînes des commandes, ajoutes des variables/conditions/boucles, et tu obtiens des actions **automatisées et reproductibles** (nettoyage de logs, sauvegardes, déploiements…).

---

## 2) Créer & exécuter un script

**Éditer un fichier :**

- Terminal : `nano`, `vim`, `micro`
- Éditeur : VS Code (confortable pour gros scripts)

**Shebang :** indique l’interpréteur à utiliser (recommandé)

```bash
#!/usr/bin/env bash

```

**Script minimal :**

```bash
#!/usr/bin/env bash
echo "Hello World"

```

**Sauvegarder (nano) :** `Ctrl+X` → `Y` → `Entrée`

**Rendre exécutable :** `chmod +x myscript.sh`

**Exécuter :** `./myscript.sh` (ou `bash myscript.sh`)

> ⚠️ ./script.sh lance un nouveau processus.
> 
> 
> `source script.sh` (ou `. script.sh`) exécute **dans le shell courant** (modifie tes variables d’environnement actuelles).
> 

---

## 3) Codes de retour & enchaînements

Chaque commande renvoie un **code de sortie** (`$?`) : `0` = succès, `>0` = erreur.

```bash
commande && echo "ok" || echo "échec"

```

- `&&` n’exécute la suite **que si** la précédente a réussi.
- `||` exécute la suite **si** la précédente a échoué.

Terminer un script avec un code explicite :

```bash
exit 0     # succès
exit 1     # échec (générique)

```

---

## 4) Variables & quoting (très important)

**Déclaration & lecture :**

```bash
prenom="Grégoire"      # pas d'espaces autour de =
echo "Bonjour $prenom"

```

**Toujours citer les variables** (protéger espaces & caractères spéciaux) :

```bash
fichier="Mon dossier/data.txt"
cp "$fichier" /tmp/        # bien

```

**Arithmétique :**

```bash
n=41; echo $(( n + 1 ))    # 42

```

**Param expansion utile :**

```bash
echo "${VAR:-defaut}"      # valeur par défaut si VAR vide/indéfinie
echo "${#VAR}"             # longueur
echo "${FICHIER%.*}"       # sans extension
echo "${PATH##*/}"         # basename

```

---

## 5) Arguments positionnels & `getopts`

**Positionnels :** `$0` (nom du script), `$1`, `$2`, …, `$#` (nb), `$@` (tous)

```bash
#!/usr/bin/env bash
echo "Script: $0"
echo "Premier argument: $1"
echo "Nb d'arguments: $#"

```

**Lire tous les arguments en sécurité :**

```bash
for arg in "$@"; do
  printf '-> %s\n' "$arg"
done

```

**Options avec `getopts` (ex: `./backup.sh -s /src -d /dst -v`) :**

```bash
#!/usr/bin/env bash
set -euo pipefail

src="" dst="" verbose=0
while getopts "s:d:v" opt; do
  case "$opt" in
    s) src="$OPTARG" ;;
    d) dst="$OPTARG" ;;
    v) verbose=1 ;;
    *) echo "Usage: $0 -s SRC -d DST [-v]" >&2; exit 2 ;;
  esac
done

[[ -z "$src" || -z "$dst" ]] && { echo "SRC et DST requis"; exit 2; }
(( verbose )) && echo "Copie de '$src' vers '$dst'..."
rsync -a --delete "$src/" "$dst/"

```

---

## 6) Lire une entrée utilisateur / un fichier

```bash
read -r -p "Votre prénom ? " prenom
echo "Bonjour, $prenom !"

```

Lire un fichier ligne par ligne (sans casser les backslashes) :

```bash
while IFS= read -r line; do
  printf '%s\n' "$line"
done < "monfichier.txt"

```

---

## 7) Tests & conditions (`if`, `[[ ... ]]`, `test`)

**Syntaxe générale :**

```bash
if CONDITION; then
  # ...
elif AUTRE_COND; then
  # ...
else
  # ...
fi

```

**Tests chaîne/numérique/fichier :** avec `[[ ... ]]` (plus robuste que `[ ... ]`)

```bash
s="admin"
if [[ "$1" == "$s" ]]; then echo "Bienvenue admin"; fi

n=10
if (( n >= 5 )); then echo "ok"; fi         # arithmétique pure

# tests de fichiers
f="data.txt"
[[ -f "$f" ]]  && echo "fichier régulier"
[[ -d "$f" ]]  && echo "répertoire"
[[ -s "$f" ]]  && echo "taille > 0"
[[ -x "$f" ]]  && echo "exécutable"

```

> Ta version contenait une coquille de quote : if [ "$1" = "admin ]; then → il manque ".
> 
> 
> Version fiable : `if [[ "$1" == "admin" ]]; then ... fi`
> 

---

## 8) Boucles

**`for` (liste) :**

```bash
for nom in Alice Bob Charlie; do
  echo "Prénom: $nom"
done

```

**`for` (glob de fichiers) :**

```bash
for f in *.log; do
  echo "-> $f"
done

```

**`for (( ... ))` style C :**

```bash
for (( i=1; i<=3; i++ )); do
  echo "Compteur: $i"
done

```

**`while` :**

```bash
compteur=1
while (( compteur <= 3 )); do
  echo "Compteur : $compteur"
  (( compteur++ ))
done

```

**`until` (tant que la condition est FAUSSE) :**

```bash
i=0
until (( i==3 )); do
  echo "$i"; ((i++))
done

```

**`break` / `continue`** fonctionnent comme en C.

---

## 9) Fonctions & portée

**Définir / appeler :**

```bash
hello(){ printf 'Hello %s\n' "${1:-world}"; }
hello "Bash"

```

**Valeur de retour :** via `return` (code 0-255) ou en **écrivant** sur stdout :

```bash
sum(){ echo $(( $1 + $2 )); }       # usage : r=$(sum 2 3)
sum_rc(){ return $(( $1 + $2 )); }  # déconseillé (codé sur 8 bits)

```

**Variables locales :**

```bash
foo="global"
demo(){ local foo="local"; echo "$foo"; }
demo; echo "$foo"   # affiche "local" puis "global"

```

---

## 10) Tableaux

**Indexés :**

```bash
fruits=(pomme banane kiwi)
echo "${fruits[1]}"          # banane
echo "${#fruits[@]}"         # taille
for x in "${fruits[@]}"; do echo "$x"; done

```

**Associatifs (Bash ≥ 4) :**

```bash
declare -A age
age[Ana]=30
age[Bob]=28
echo "${age[Ana]}"
for k in "${!age[@]}"; do echo "$k -> ${age[$k]}"; done

```

---

## 11) Entrées/sorties : redirections, here-docs, process substitution

**Redirections :**

```bash
cmd > out.txt           # stdout vers fichier (écrase)
cmd >> out.txt          # stdout en ajout
cmd 2> err.txt          # stderr vers fichier
cmd &> tout.txt         # stdout+stderr
cmd < in.txt            # fichier en entrée

```

**Here-doc / here-string :**

```bash
cat > config.ini <<'EOF'
[server]
port=8080
EOF

grep foo <<< "bar foo baz"    # here-string (une seule ligne)

```

**Substitutions de processus (puissant) :**

```bash
diff <(sort a.txt) <(sort b.txt)

```

---

## 12) Gestion des erreurs (mode strict) & logs

Active une discipline stricte en tête de script :

```bash
set -euo pipefail
IFS=$'\n\t'
# -e : stop sur erreur
# -u : variable non définie = erreur
# -o pipefail : si une commande échoue dans un pipe, le pipe échoue

```

**Messages & logs :**

```bash
log(){ printf '[%(%F %T)T] %s\n' -1 "$*" >&2; }  # timestamp vers stderr
log "Démarrage"

```

**Valider les prérequis :**

```bash
command -v rsync >/dev/null || { echo "rsync manquant"; exit 127; }

```

---

## 13) Traps & nettoyage (signaux)

Nettoyer même en cas d’interruption (`Ctrl-C`, `kill`, etc.) :

```bash
tmp="$(mktemp)"; cleanup(){ rm -f "$tmp"; }
trap cleanup EXIT INT TERM

# ... utiliser "$tmp" ...

exit 0

```

---

## 14) Débogage & qualité

**Déboguer :**

```bash
set -x                     # trace chaque commande
# ou: bash -x script.sh
PS4='+ ${BASH_SOURCE}:${LINENO}:${FUNCNAME[0]}: '  # trace enrichie

```

**Linting (fortement conseillé) :**

- `shellcheck script.sh` → explique les pièges, propose des corrections.

**Validation à blanc :**

```bash
bash -n script.sh          # vérifie la syntaxe sans exécuter

```

---

## 15) Interop & portabilité

- `#!/bin/sh` = shell POSIX (plus portable), mais **moins de features** que Bash (`arrays`, `[[ ]]`, etc.).
- Si tu utilises des spécificités Bash (recommandé ici), garde `#!/usr/bin/env bash`.

---

## 16) Gabarit de script réutilisable (copier-coller)

```bash
#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

usage(){
  cat <<'USAGE'
Usage: myscript.sh [-v] -i INPUT -o OUTPUT
  -i FILE   fichier d'entrée
  -o FILE   fichier de sortie
  -v        mode verbeux
USAGE
}

input="" output="" verbose=0
while getopts "i:o:v" opt; do
  case "$opt" in
    i) input="$OPTARG" ;;
    o) output="$OPTARG" ;;
    v) verbose=1 ;;
    *) usage; exit 2 ;;
  esac
done
shift $((OPTIND-1))

[[ -z "${input}" || -z "${output}" ]] && { usage; exit 2; }
(( verbose )) && echo "Lecture: $input  →  Écriture: $output"

tmp="$(mktemp)"; cleanup(){ rm -f "$tmp"; }
trap cleanup EXIT INT TERM

# Exemple de traitement : lignes non vides en majuscules
grep -v '^[[:space:]]*$' "$input" | tr '[:lower:]' '[:upper:]' > "$tmp"
mv "$tmp" "$output"
echo "OK -> $output"

```

---

## 17) 3 mini-projets utiles (exercices guidés)

### A) Alerte espace disque (simple)

```bash
#!/usr/bin/env bash
set -euo pipefail
threshold="${1:-80}"   # % utilisé autorisé

used=$(df -h / | awk 'NR==2 { gsub("%","",$5); print $5 }')
if (( used > threshold )); then
  echo "ALERTE: disque plein ($used% > $threshold%)"
  exit 1
else
  echo "OK: $used% utilisés"
fi

```

### B) Sauvegarde incrémentale (rsync)

```bash
#!/usr/bin/env bash
set -euo pipefail
src="${1:?src manquant}"
dst="${2:?dst manquant}"
rsync -a --delete --info=progress2 "$src"/ "$dst"/

```

### C) Suivi de logs & comptage d’erreurs

```bash
#!/usr/bin/env bash
set -euo pipefail
log="${1:-/var/log/syslog}"
tail -n0 -F "$log" | awk '/ERROR|CRITICAL/ {c[$1]++; print; fflush()} END{for(k in c) print k,c[k] > "/tmp/error_counts.txt"}'

```

---

## 18) Check-list “anti-galères”

- Shebang Bash présent ? `#!/usr/bin/env bash`
- `set -euo pipefail` + `IFS` défini ?
- Variables toujours **quotées** : `"${var}"`
- Fichiers toujours testés (`[[ -f ]]`, `[[ -s ]]`) avant usage ?
- Nettoyage via `trap` prévu ?
- Aide `usage()` + `getopts` pour les options ?
- `shellcheck` passé sans erreurs critiques ?
- Tests sur un **répertoire temporaire** avant prod ?

---

### Bonus : corrections rapides de tes exemples (coquilles)

- **If admin :**

```bash
if [[ "${1:-}" == "admin" ]]; then
  echo "Bienvenue administrateur !"
else
  echo "Accès limité."
fi

```

- **For noms :**

```bash
for prenom in Alice Bob Charlie; do
  echo "$prenom"
done

```

- **While compteur :**

```bash
compteur=1
while (( compteur <= 3 )); do
  echo "Compteur : $compteur"
  (( compteur++ ))
done

```

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

# Automatiser avec **cron** — comprendre & manipuler sans galérer

## 1) Ce que tu sauras faire

- Comprendre comment fonctionne **cron** (service d’ordonnancement).
- Automatiser des sauvegardes, nettoyages, rapports récurrents.
- Créer / modifier / lire / supprimer des tâches avec **crontab**.
- Maitriser la **syntaxe** (5 champs + commande, raccourcis @daily, etc.).
- Appliquer les **bonnes pratiques** (scripts, chemins absolus, logs, non-chevauchement).
- **Diagnostiquer** via les logs système et tester proprement.

---

## 2) À quoi sert cron ?

**cron** tourne en arrière-plan et exécute des commandes à des horaires planifiés (comme un agenda automatique). Tu écris tes tâches dans une **crontab** (to-do list horodatée) ; cron lit cette liste et déclenche au bon moment.

Exemples d’usages :

- Sauvegarde quotidienne à minuit,
- Nettoyage hebdo d’un dossier temporaire,
- Envoi d’un rapport chaque lundi matin.

---

## 3) Comment ça marche (architecture minimale)

- **Service** : `crond` (souvent géré par systemd).
- **Crontabs utilisateur** : éditées via `crontab -e` (une par utilisateur).
- **Crontab système** : `/etc/crontab` et fichiers dans `/etc/cron.d/`.
- **Jobs prédéfinis** : `/etc/cron.daily`, `/etc/cron.hourly`, etc. (lancés par `run-parts`).

> Note : Sur Ubuntu/Debian récents, les logs liés à cron passent dans syslog et/ou journalctl. Sur macOS, cron existe mais Apple pousse plutôt launchd (hors périmètre ici).
> 

---

## 4) La syntaxe cron (5 champs + commande)

```
*  *  *  *  *  commande
|  |  |  |  |
|  |  |  |  └── Jour de semaine (0-7, dim = 0 ou 7)
|  |  |  └───── Mois (1-12 ou jan,feb,…)
|  |  └──────── Jour du mois (1-31)
|  └─────────── Heure (0-23)
└────────────── Minute (0-59)

```

- = “n’importe quelle valeur”.
- Plages : `8-18` ; listes : `1,15,30` ; pas : `/10` (toutes les 10 minutes).

**Exemples courants :**

```
* * * * *   /path/to/script.sh                   # chaque minute
0 * * * *   /path/to/script.sh                   # à chaque heure pile
0 0 * * *   /path/to/script.sh                   # tous les jours à minuit
0 4 * * 1   /home/user/backup.sh                 # chaque lundi à 04:00
*/10 * * * * /usr/local/bin/collect-metrics.sh   # toutes les 10 minutes
30 8-18 * * 1-5 /usr/local/bin/report.sh         # 08:30 à 18:30, lundi→vendredi

```

**Raccourcis utiles** (spécial-cron) :

```
@reboot   /path/to/script.sh               # au démarrage
@hourly   /path/to/script.sh               # toutes les heures
@daily    /path/to/script.sh               # chaque jour (≈ 00:00)
@weekly   /path/to/script.sh
@monthly  /path/to/script.sh
@yearly   /path/to/script.sh

```

> Dans /etc/crontab et /etc/cron.d/*, il y a 6 champs : les 5 temps + l’utilisateur.
> 
> 
> Exemple :
> 
> `0 2 * * *  root  /usr/local/bin/backup.sh`
> 

---

## 5) Manipuler sa crontab (utilisateur)

### Créer / modifier

```bash
crontab -e
# Choisis nano si tu débutes (Ctrl+X, Y, Entrée pour sauvegarder)

```

### Lister

```bash
crontab -l

```

### Supprimer **toutes** les entrées (irréversible)

```bash
crontab -r

```

### Éditer la crontab d’un autre utilisateur (administrateur)

```bash
sudo crontab -u alice -e
sudo crontab -u alice -l

```

---

## 6) Écrire des jobs **fiables** (bonnes pratiques)

### 6.1 Mets la logique dans un script, pas dans la crontab

- Crée `backup.sh` avec un **shebang** et rends-le exécutable :

```bash
cat > /home/user/bin/backup.sh <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
# Variables explicites
SRC="/srv/data"
DST="/backup/$(date +%F)"
mkdir -p "$DST"
rsync -a --delete "$SRC/" "$DST/"
echo "[OK] backup $(date -Is)" >> /var/log/backup.log
EOF

chmod +x /home/user/bin/backup.sh

```

- Appelle-le dans ta crontab avec des **chemins absolus** :

```
0 2 * * *  /home/user/bin/backup.sh >> /var/log/backup.cron.log 2>&1

```

### 6.2 Utilise **des chemins absolus**

- L’environnement cron est **minimal** (`PATH` restreint, pas tes alias).
- Évite `python` ou `rsync` tout court, préfère `/usr/bin/python3`, `/usr/bin/rsync`.

### 6.3 Redirige les sorties pour **déboguer**

```
* * * * * /path/to/script.sh >> /var/log/monjob.log 2>&1

```

- `>>` append ; `2>&1` redirige l’erreur standard vers la sortie standard.

### 6.4 Fixe l’environnement si nécessaire

Dans la crontab **(utilisateur)**, tu peux définir :

```
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/bin
MAILTO=""                       # vide = pas d’email
TZ=Europe/Paris                 # fuseau si besoin

```

### 6.5 Empêche les **chevauchements**

Si ton job peut prendre plus longtemps que son intervalle :

- **`flock`** (simple et robuste) :

```
*/5 * * * * /usr/bin/flock -n /tmp/rapport.lock /usr/local/bin/rapport.sh

```

- Ou **`systemd-run --scope`** + timers (voir §11) si tu préfères systemd.

### 6.6 Attention aux **`%`** dans crontab

Le caractère `%` est spécial (sépare l’input de la commande). Échappe-le `\%` ou mets ta commande dans un script.

### 6.7 Pense à **l’exécutable** et aux droits

- `chmod +x script.sh` ; lis/écris où il faut ; loggable par root si besoin.
- Teste manuellement : `/path/to/script.sh` **avant** de le mettre au cron.

---

## 7) Tester et diagnostiquer

### 7.1 Forcer un “dry run”

Planifie toutes les minutes pendant 2–3 minutes :

```
* * * * * /path/to/script.sh >> /tmp/test.log 2>&1

```

Surveille :

```bash
tail -f /tmp/test.log

```

### 7.2 Lire les logs

- Debian/Ubuntu :

```bash
grep CRON /var/log/syslog
# ou (systemd)
journalctl -u cron -f

```

- CentOS/RHEL :

```bash
grep CRON /var/log/cron
journalctl -u crond -f

```

### 7.3 Problèmes courants

- **Commande introuvable** → utilise des chemins absolus ou exporte `PATH=...`.
- **Permissions** → droits du fichier/dossier/log, user correct (root vs utilisateur).
- **Script marche en manuel mais pas en cron** → variables d’environnement manquantes, `cd` implicite. Solution : `cd` explicite dans le script ou utiliser des chemins absolus partout.
- **DST / changement d’heure** → évite les horaires *pile* et préfère `systemd timer` si c’est critique (voir après).

---

## 8) Crontab **système** (admin)

### `/etc/crontab` (6 champs)

Exemple :

```
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/bin

# m h dom mon dow user  command
0 3 * * *  root /usr/local/sbin/rotate-logs.sh

```

### `/etc/cron.d/monapp`

Un fichier dédié par application :

```
*/15 * * * *  www-data  /usr/local/bin/collect-stats.sh >> /var/log/monapp.stats.log 2>&1

```

### `cron.daily` / `cron.weekly` …

Déposer un script exécutable dans `/etc/cron.daily/` (attention aux noms compatibles avec `run-parts` : lettres, chiffres, tirets).

```bash
sudo install -m 755 monjob.sh /etc/cron.daily/monjob

```

---

## 9) Expressions utiles prêtes à coller

**Rapport chaque vendredi à 17:45 :**

```
45 17 * * 5 /usr/local/bin/rapport.sh >> /var/log/rapport.log 2>&1

```

**Sauvegarde toutes les 6 heures :**

```
0 */6 * * * /usr/local/bin/backup.sh

```

**Nettoyer les fichiers de +30 jours chaque nuit :**

```
0 1 * * * /usr/bin/find /var/tmp -type f -mtime +30 -delete

```

**Échelonner (stagger) pour éviter les pics :**

```
0 2 * * * sleep $((RANDOM%600)); /usr/local/bin/task.sh

```

---

## 10) Sécurité & contrôle d’accès

- **Limiter qui peut utiliser cron** :
    - `/etc/cron.allow` (liste blanche), `/etc/cron.deny` (liste noire).
- **Secrets** : ne mets pas de secrets en clair dans la crontab ; utilise un fichier `.env` root-owned (`chmod 600`) sourcé par le script.
- **Permissions** : logs dans un répertoire accessible, rotation via `logrotate`.

---

## 11) Alternative moderne : **systemd timers** (quand c’est dispo)

Pour des besoins avancés (précision, timezone, non-overlap natif, dépendances), préfère parfois **systemd timers**.

Exemple “toutes les 10 minutes, sans chevauchement” :

`/etc/systemd/system/backup.service`

```
[Unit]
Description=Backup job

[Service]
Type=oneshot
ExecStart=/usr/local/bin/backup.sh

```

`/etc/systemd/system/backup.timer`

```
[Unit]
Description=Run backup every 10 minutes

[Timer]
OnBootSec=2m
OnUnitActiveSec=10m
Persistent=true

[Install]
WantedBy=timers.target

```

Activation :

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now backup.timer
systemctl list-timers | grep backup
journalctl -u backup.service -f

```

---

## 12) Mini-TP (rapides)

### TP1 — “Hello cron”

1. Script :

```bash
echo '#!/usr/bin/env bash
date "+%F %T" >> /tmp/hello-cron.log' | sudo tee /usr/local/bin/hello-cron.sh >/dev/null
sudo chmod +x /usr/local/bin/hello-cron.sh

```

1. Crontab :

```bash
(crontab -l; echo '* * * * * /usr/local/bin/hello-cron.sh') | crontab -
tail -f /tmp/hello-cron.log

```

### TP2 — “Job robuste”

- Script avec `set -euo pipefail`, chemins absolus, logs, `flock` :

```bash
sudo tee /usr/local/bin/robust-job.sh >/dev/null <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
exec 9>/var/lock/robust-job.lock
flock -n 9 || exit 0
/usr/bin/env echo "[$(date -Is)] run" >> /var/log/robust-job.log
# ... traitement ...
EOF
sudo chmod +x /usr/local/bin/robust-job.sh

```

- Crontab :

```bash
(crontab -l; echo '*/5 * * * * /usr/local/bin/robust-job.sh') | crontab -

```

---

## 13) Mémo express (copier-coller)

```bash
# Éditer / lister / supprimer crontab utilisateur
crontab -e
crontab -l
crontab -r

# Logs d’exécution (selon distro)
grep CRON /var/log/syslog || true
journalctl -u cron -f || journalctl -u crond -f

# Exemple de crontab (utilisateur)
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/bin
MAILTO=""
TZ=Europe/Paris
# m h dom mon dow  command
0 2 * * * /home/user/bin/backup.sh >> /var/log/backup.cron.log 2>&1
*/15 * * * * /usr/bin/flock -n /tmp/collect.lock /usr/local/bin/collect.sh

# Exemple dans /etc/crontab (6 champs : + user)
# m h dom mon dow user  command
0 3 * * * root /usr/local/sbin/rotate-logs.sh

```

---

### À retenir

- **Écris un script robuste** (shebang, `set -euo pipefail`, chemins absolus, logs).
- **Planifie** via `crontab -e` (ou `/etc/crontab` / `/etc/cron.d` pour le système).
- **Teste et observe** (`tail -f` des logs, `journalctl`, `grep CRON`).
- **Évite les chevauchements** (verrou `flock`) et les surprises d’environnement (`PATH`, `SHELL`, `TZ`).
- En cas de besoins avancés (précision, dépendances, DST), regarde les **timers systemd**.

Avec ça, tu as tout pour automatiser proprement tes tâches récurrentes sur Linux.