---
titre: Le Terminal (Bash)
type: module
jour: 01
ordre: 2
tags: bash, linux, cli
---

# Le Terminal (Bash)

## 1) Pourquoi / quoi

Le terminal permet d’interagir avec la machine via des **commandes** pour :

- naviguer dans les dossiers,
- manipuler fichiers/dossiers,
- rechercher/filtrer du contenu,
- automatiser et chaîner des traitements.

> Windows : cmd / PowerShell (syntaxe différente)
> 
> 
> Linux/macOS : **Bash** (ce qu’on utilise dans Vagrant).
> 

---

## 2) Anatomie d’une commande

```
commande [options] [arguments]

```

- **commande** : programme (ex : `ls`)
- **options** : modifient le comportement (ex : `l`, `r`, `h`)
- **arguments** : cibles (ex : `ls /var/log`)

Enchaînements :

- `;` exécute la suivante quoi qu’il arrive
- `&&` exécute la suivante **si succès** (exit code 0)
- `||` exécute la suivante **si échec**
- `()` **subshell** (nouveau shell), `{ ...; }` **groupement** dans le shell courant

## 3) Naviguer dans l’arborescence

### `pwd` — affiche le chemin courant

```bash
pwd

```

### `ls` — liste les fichiers/dossiers

```bash
ls                             # simple
ls -l                          # vue longue (droits, taille, date)
ls -la                         # inclut les fichiers cachés
ls -lh                         # tailles lisibles (K/M/G)
ls -lt                         # tri par date (récents en haut)

```

### `cd` — change de répertoire

```bash
cd /chemin/vers/dir
cd ..                          # remonter d'un cran
cd ~                           # aller dans le HOME
cd -                           # revenir au dossier précédent

```

### `mkdir` / `rmdir` — crée / supprime des dossiers

```bash
mkdir mon_dossier
mkdir -p a/b/c                 # crée toute la chaîne
rmdir dossier_vide             # supprime uniquement s’il est vide

```

---

## 4) Manipuler des fichiers

### `touch` — crée un fichier vide (ou met à jour son horodatage)

```bash
touch notes.txt

```

### `cp` — copie un fichier ou un dossier

```bash
cp source.txt dest.txt
cp -r dossier/ sauvegarde/     # copie récursive d’un dossier
cp -a dossier/ sauvegarde/     # “archival” : conserve attributs/permissions

```

### `mv` — déplace ou renomme

```bash
mv ancien_nom.txt nouveau_nom.txt
mv *.log logs/                 # déplace tous les .log dans logs/

```

### `rm` — supprime (⚠️ pas de corbeille)

```bash
rm fichier.txt
rm -r dossier                  # dossier et contenu
rm -rf dossier                 # **dangereux** : ne demande pas de confirmation

```

### `ln` — crée un lien (raccourci)

```bash
ln -s /vrai/chemin lien        # lien symbolique

```

---

## 5) Voir et feuilleter des fichiers

### `cat` / `tac` — affiche (normal / inversé)

```bash
cat fichier.txt
tac fichier.txt

```

### `less` — pager interactif (recherche, navigation)

```bash
less -N fichier.txt            # N = numéros de ligne ; /mot pour chercher ; q pour quitter

```

### `head` / `tail` — début / fin d’un fichier

```bash
head -n 20 fichier.txt
tail -n 50 fichier.txt
tail -f /var/log/syslog        # “suivre” les nouvelles lignes

```

### `nl` — numérote les lignes

```bash
nl -ba fichier.txt

```

---

## 6) Rechercher / découper / trier du texte

### `grep` — recherche de motif (regex possible)

```bash
grep "ERREUR" app.log
grep -n "ERREUR" app.log       # afficher numéros de ligne
grep -ri "erreur" .            # récursif, insensible à la casse
grep -E "foo|bar" fichier      # regex étendues
grep -v "DEBUG" app.log        # lignes qui NE contiennent PAS DEBUG

```

### `cut` — extrait des colonnes

```bash
cut -d',' -f1,3 data.csv       # colonnes 1 et 3 (séparateur virgule)
cut -f2                        # colonnes tabulées par défaut

```

### `tr` — remplace des caractères (translittération)

```bash
tr 'a-z' 'A-Z' < fichier.txt   # minuscules -> MAJUSCULES

```

### `sort` — trie des lignes

```bash
sort fichier.txt               # tri alphabétique
sort -r fichier.txt            # ordre inverse
sort -h tailles.txt            # comprend K/M/G
sort -t',' -k2,2 data.csv      # trier sur la 2e colonne CSV

```

### `uniq` — compresse les doublons (après un sort)

```bash
sort erreurs.log | uniq        # supprime doublons adjacents
sort erreurs.log | uniq -c     # compte les occurrences

```

### `wc` — compte lignes/mots/octets

```bash
wc -l fichier.txt              # lignes
wc -w fichier.txt              # mots
wc -c fichier.txt              # octets

```

### `paste` — assemble des colonnes de fichiers

```bash
paste -d',' noms.txt notes.txt > fusion.csv

```

### `join` — jointure sur une clé (fichiers triés)

```bash
join -t',' -1 1 -2 1 A.csv B.csv   # jointure sur la 1re colonne

```

---

## 7) Redirections & pipelines

### Rediriger la sortie / l’erreur / l’entrée

```bash
cmd > out.txt                   # stdout -> fichier (écrase)
cmd >> out.txt                  # stdout -> fichier (ajoute)
cmd 2> err.txt                  # stderr -> fichier
cmd &> tout.txt                 # stdout + stderr -> fichier
cmd < input.txt                 # fichier -> stdin

```

### `|` (pipeline) — enchaîner des traitements

```bash
cat logs.txt | grep ERROR | sort | uniq -c | sort -nr | head

```

### `tee` — dupliquer la sortie (fichier + pipe)

```bash
dmesg | tee dmesg.txt | grep -i usb

```

> Rappel : | n’est pas un “et ensuite” : pour exécuter une 2e commande seulement si la 1re réussit, utilise &&.
> 

---

## 8) Joker (globbing) & expansions

### Jokers — étendre des motifs de noms de fichiers

```bash
echo log?.txt                  # ? = un caractère
echo *.log                     # * = 0+ caractères
echo file{1..3}.txt            # brace expansion : file1.txt file2.txt file3.txt
echo {dev,staging,prod}.yaml   # 3 variantes

```

### Quotes — contrôler l’expansion

```bash
echo "Hello $USER"             # expansion de $USER
echo 'Hello $USER'             # pas d’expansion

```

---

## 9) Chercher des fichiers (puissant)

### `find` — cherche par nom, type, taille, date…

```bash
find . -type f -name "*.log"
find /var -type f -size +100M
find . -mtime -1               # modifiés il y a < 1 jour
find . -maxdepth 1 -type d
find . -type f -perm -111      # exécutables

```

### `find` → action (`delete`, `exec`, `xargs`)

```bash
find . -type f -name "*.tmp" -delete
find . -type f -name "*.log" -exec gzip -9 {} \;
find . -type f -print0 | xargs -0 grep -n "ERROR"

```

---

## 10) Espace disque & archives

### `df` — vue globale des systèmes de fichiers

```bash
df -h

```

### `du` — taille par dossier/fichier

```bash
du -sh .                       # taille du dossier courant
du -sh * | sort -h             # tailles de tous les éléments du répertoire

```

### `tar` / `gzip` / `zip` — archiver / compresser

```bash
tar -czf archive.tgz dossier/  # créer archive .tgz
tar -xzf archive.tgz           # extraire
tar -tvf archive.tgz           # lister le contenu
gzip -9 fichier                # compresser -> fichier.gz
gunzip fichier.gz              # décompresser
zip -r archive.zip dossier/    # zip récursif
unzip archive.zip

```

---

## 11) Droits & propriétaires

### `chmod` — change permissions

```bash
chmod 644 fichier              # rw-r--r--
chmod -R 755 dossier           # rwxr-xr-x récursif

```

### `chown` — change propriétaire/groupe

```bash
chown user:group fichier
chown -R www-data:www-data /var/www

```

### Aides

```bash
id                              # uid/gid
whoami                          # utilisateur courant
groups                          # groupes
umask 022                       # masque par défaut (futurs fichiers 644)

```

---

## 12) Processus & jobs

### Voir ce qui tourne

```bash
ps aux | grep nginx
top                              # ou htop si installé
pgrep -fl nginx                  # pids par nom

```

### Tuer / prioriser / mesurer

```bash
kill -TERM 1234                  # terminer proprement
kill -9 1234                     # forcer (dernier recours)
nice -n 10 cmd                   # lancer avec priorité basse
renice 5 -p 1234                 # changer la priorité d’un pid
/usr/bin/time -v cmd             # temps + stats détaillées

```

### Exécuter en arrière-plan & gérer les jobs

```bash
cmd &                            # lancer en arrière-plan
jobs                             # lister
fg                               # ramener au premier plan
bg                               # relancer en arrière-plan
nohup cmd &                      # survivre à la déconnexion

```

---

## 13) Réseau (en un clin d’œil)

### IP, routes, ports, DNS, transferts

```bash
ip addr show                     # IP locales
ip -brief addr                   # résumé
ip route                         # table de routage
ss -tulpen                       # ports en écoute (TCP/UDP)
ping -c 4 8.8.8.8                # latence
curl -I https://example.org      # entêtes HTTP
curl -s ifconfig.me              # IP publique
wget URL -O out.bin              # téléchargement simple
dig +short A example.org         # requête DNS
scp fichier user@hote:/chemin/   # copie via SSH
rsync -a --delete src/ dst/      # synchro efficace

```

---

## 14) Variables & expansions Bash

### Déclarer, afficher, exporter

```bash
NAME="Alice"
echo "Hello $NAME"
export PATH="$HOME/bin:$PATH"

```

### Substitutions utiles

```bash
DATE="$(date +%F)"              # substitution de commande
echo $(( 2 + 3 ))               # arithmétique
echo "${VAR:-defaut}"           # valeur par défaut
echo "${#VAR}"                  # longueur
echo "${PATH##*/}"              # basename
echo "${FILE%.*}"               # sans extension

```

---

## 15) Scripts Bash (bases solides)

### Squelette sûr & options de sécurité

```bash
#!/usr/bin/env bash
set -euo pipefail               # stop sur erreur/var non définie/pipe défaillant
IFS=$'\n\t'                     # séparateurs sûrs pour read/for

```

### Arguments, tests, boucles, fonctions

```bash
echo "Script: $0  args: $@  count: $#"

if [[ -f "fichier" ]]; then echo "existe"; fi    # -d dossier, -x exécutable, -s >0 octets
if [[ "$x" =~ ^[0-9]+$ ]]; then echo "numérique"; fi

for f in *.log; do echo "$f"; done

while IFS= read -r line; do
  printf '%s\n' "$line"
done < input.txt

sum(){ echo $(( $1 + $2 )); }
sum 2 3

trap 'echo "Abort"; rm -f /tmp/tmpfile' INT TERM EXIT

```

---

## 16) Aide & introspection

### Trouver la doc / où se trouve une commande

```bash
man grep                        # manuel complet
grep --help                     # aide brève
man -k "network"                # rechercher par mots-clés (apropos)
type ls                         # builtin/alias/fichier ?
which ls                        # chemin de l’exécutable
history                         # historique
# astuces : !123 (rejouer la commande n°123), Ctrl-r (recherche inversée)

```

---

## 17) Recettes rapides (prêtes à coller)

### Top 10 erreurs uniques sur tous les logs

```bash
grep -h "ERROR" *.log | sort | uniq -c | sort -nr | head -n10

```

### Les 20 plus gros éléments du dossier courant

```bash
du -ah . | sort -h | tail -n 20

```

### Remplacer récursivement une chaîne dans tous les .conf

```bash
grep -RIl --include="*.conf" "ancien" . | xargs sed -i 's/ancien/nouveau/g'

```

### Supprimer les fichiers de log de plus de 30 jours

```bash
find /var/log -type f -mtime +30 -delete

```

### Lister les ports ouverts

```bash
ss -tulpen | sort

```

---

## Bons réflexes & pièges à éviter

- **`|` n’est pas un “et ensuite”** : pour dépendre du succès, utilise `&&` (`rm -r txt && mkdir logs`).
- **Quoting partout** : `"$var"` protège les espaces/caractères spéciaux.
- **`rm -rf`** : toujours vérifier le chemin. Astuce : commence par **afficher** la commande ou utilise `echo *.log` pour voir l’expansion.
- **Tri/locale** : pour des tris ASCII rapides et prévisibles, `LC_ALL=C sort`.
- **CSV compliqués** : `awk/sed` suffisent pour simple ; sinon `xsv`, `mlr`, `csvkit`.


[← Module précédent](M01_vagrant-bases-utiles.md) | [Module suivant →](M01_sed-utilisation.md)

[← Module précédent](M01_vagrant-bases-utiles.md) | [Module suivant →](M01_sed-utilisation.md)

[← Module précédent](M01_vagrant-bases-utiles.md) | [Module suivant →](M01_sed-utilisation.md)

[← Module précédent](M01_vagrant-bases-utiles.md) | [Module suivant →](M01_sed-utilisation.md)
---

---
[← Module précédent](M01_vagrant-bases-utiles.md) | [Module suivant →](M01_sed-utilisation.md)
---
