---
titre: Scripting Bash
type: module
jour: 02
ordre: 1
tags: bash, linux, devops
---

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


---
[Module suivant →](002_droits-linux.md)
---

---
[Module suivant →](002_droits-linux.md)
---

---
[Module suivant →](002_droits-linux.md)
---

---
[Module suivant →](002_droits-linux.md)
---

---
[Module suivant →](002_droits-linux.md)
---

---
[Module suivant →](002_droits-linux.md)
---

---
[Module suivant →](002_droits-linux.md)
---

---
[Module suivant →](002_droits-linux.md)
---

---
[Module suivant →](002_droits-linux.md)
---

---
[Module suivant →](002_droits-linux.md)
---

---
[Module suivant →](002_droits-linux.md)
---

---
[Module suivant →](002_droits-linux.md)
---

---
[Module suivant →](002_droits-linux.md)
---

---
[Module suivant →](002_droits-linux.md)
---

---
[Module suivant →](002_droits-linux.md)
---

---
[Module suivant →](002_droits-linux.md)
---

---
[Module suivant →](002_droits-linux.md)
---
