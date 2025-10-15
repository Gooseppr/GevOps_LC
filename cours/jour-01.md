---
layout: page
title: Jour 01 — Environnement Linux/Unix et découverte de Bash
---

## Objectifs
- Installer l’environnement
- Prendre en main le terminal et Bash

# Vagrant — bases utiles (cours)

- **Vagrant** automatise la création/configuration de VMs.
- **Box** : image préconfigurée (modèle) ; **provider** : virtualiseur (VirtualBox, etc.)
- Commandes clés :
    - `vagrant init <box>` → crée `Vagrantfile`
    - `vagrant up` → démarre/crée la VM
    - `vagrant ssh` → se connecter en SSH
    - `vagrant halt` → éteindre
    - `vagrant destroy` → supprimer la VM
- Accès SSH typique : `127.0.0.1:2222`
- Ex. : `vagrant destroy 1a2b3c4d` (détruit la VM d’ID partiel)
    
    ---
    

---

# Cours — Le Terminal (Bash)

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

---

# SED — comprendre, utiliser, être autonome

## 1) Principe & utilité

`sed` (STREAM EDitor) est un **éditeur de flux** : il **lit ligne par ligne**, applique des **règles** (rechercher/remplacer, supprimer, insérer, modifier), puis **écrit** le résultat (par défaut sur la sortie standard).

C’est parfait pour **nettoyer**, **normaliser**, **éditer rapidement** des fichiers de conf, des logs ou du texte structuré.

**Quand préférer `sed` ?**

- Remplacements simples ou massifs (mots, motifs).
- Suppression de lignes (vides, commentaires, plages).
- Ajout/insersion de lignes autour d’un motif.
- Éditions “in-place” ultra rapides dans des scripts.

> Si tu dois comparer, calculer ou agréger, AWK sera souvent plus adapté. Pour de la recherche pure, grep suffit. Pour des CSV complexes, préfère un parseur dédié.
> 

---

## 2) Anatomie d’une commande SED

### 2.1 Forme minimale

```bash
sed 'COMMANDE' fichier.txt

```

- Sans redirection ni `i`, **le fichier n’est pas modifié** ; le résultat s’affiche sur stdout.

### 2.2 Adresses (où appliquer la commande)

- **Numéros de lignes** : `1d` (supprimer 1re ligne), `5,10d` (lignes 5→10).
- **Motifs/regex** : `'/^#/d'` (supprimer les lignes qui commencent par `#`).
- **Plage motif→motif** : `'/^START/,/^END/d'`.

> On peut combiner : 2,20s/foo/bar/g (remplacer foo par bar lignes 2→20).
> 

### 2.3 Chaîner des commandes

- Séparateur `;` dans une seule expression :
    
    `sed '/^#/d; /^$/d; s/http:/https:/g' fichier`
    
- Plusieurs `e` :
    
    `sed -e '/^#/d' -e '/^$/d' -e 's/http:/https:/g' fichier`
    
- Charger un **script sed** depuis un fichier : `sed -f script.sed fichier`

### 2.4 Regex utiles

- **De base** : `.` (un char),  (0+ fois le précédent), `^` (début), `$` (fin), `[abc]` (classe).
- **Classes POSIX** : `[[:digit:]]`, `[[:lower:]]`, `[[:upper:]]`, `[[:space:]]`, etc.
- **Limites de mot (GNU sed)** : `\<mot\>` (début de mot), `\>mot\>` (fin de mot).
    
    Alternative : `\b` en **regex étendues**.
    
- **Regex étendues** : `sed -E 's/(foo|bar)+/X/'` (parenthèses non échappées, `+`, `?`, `|`, …)

> Change de délimiteur pour éviter d’échapper les / : s|http://|https://|g
> 

---

## 3) Commandes de base (à connaître par cœur)

### 3.1 Substitution (remplacement) — `s`

```bash
# 1re occurrence dans chaque ligne
sed 's/motif/remplacement/' fichier

# Toutes les occurrences (g = global)
sed 's/motif/remplacement/g' fichier

# Insensible à la casse (GNU sed: I)
sed 's/motif/remplacement/Ig' fichier

# Captures & backrefs (groupes) — avec -E c'est plus lisible
sed -E 's/(foo)_(bar)/\1-\2/g' fichier

# Mot entier seulement (GNU sed)
sed 's/\<vieux\>/ancien/g' fichier

# Remplacer la N-ième occurrence (ex: seulement la 2e)
sed 's/motif/rempl/2' fichier

# Remplacer et écrire les lignes modifiées dans un fichier (w)
sed -n 's/error/ERROR/w erreurs.txt' fichier

```

### 3.2 Supprimer — `d`

```bash
sed '/^$/d' fichier          # lignes vides
sed '/^#/d' fichier          # commentaires débutant par #
sed '5,10d' fichier          # plage 5→10
sed '/^START/,/^END/d' f     # entre deux motifs

```

### 3.3 Remplacer une ligne entière — `c`

```bash
sed '2c\Ceci est une nouvelle ligne' fichier

```

### 3.4 Insérer/ajouter — `i` / `a`

```bash
sed '/motif/i\ligne AVANT' fichier
sed '/motif/a\ligne APRES' fichier
sed '1i\# En-tête' fichier

```

### 3.5 Impression/filtrage — `n` / `p` / `q` / `=`

```bash
sed -n '/motif/p' fichier   # n’imprime que les lignes qui matchent
sed '/motif/q' fichier      # quitte au 1er match (utile gros fichiers)
sed -n '1,3p' fichier       # n’imprimer que les lignes 1→3
sed -n '=' fichier          # afficher les numéros de lignes

```

### 3.6 Translittération — `y`

```bash
sed 'y/abc/ABC/' fichier    # a->A, b->B, c->C (caractère par caractère)

```

---

## 4) Écriture “in-place” (modifier le fichier)

```bash
sed -i 's/foo/bar/g' fichier          # Linux (GNU sed)
sed -i.bak 's/foo/bar/g' fichier      # crée fichier.bak avant d’écrire

```

> macOS/BSD sed : l’option -i exige un suffixe (même vide) :
> 
> 
> `sed -i '' 's/foo/bar/g' fichier` ou `sed -i .bak 's/foo/bar/g' fichier`
> 

---

## 5) Aller plus loin (multi-lignes & espace de retenue)

### 5.1 Espace de motif vs espace de retenue

- **Pattern space** : ligne en cours.
- **Hold space** : tampon pour stocker et réutiliser (`h`, `H`, `g`, `G`, `x`).

Commandes utiles :

- `N` : lire **la ligne suivante** et l’ajouter au pattern space (donc pattern multi-ligne).
- `P` : imprimer **jusqu’au 1er saut de ligne** dans le pattern space.
- `h/H` : copier/concaténer dans la hold space ; `g/G` : récupérer/concaténer depuis la hold space ; `x` : échanger.

### 5.2 Exemples multi-lignes

```bash
# Joindre les lignes vides avec la ligne suivante (supprime les doubles blancs)
sed ':a;N;$!ba;s/\n{2,}/\n/g' fichier

# Supprimer une ligne et la suivante si la 1re matche MOTIF
sed '/MOTIF/ { N; d }' fichier

```

> Pour la plupart des usages du cours (conf/logs), tu restes sur du ligne par ligne sans hold space.
> 

---

## 6) Recettes utiles (copier-coller)

### 6.1 Nettoyages courants

```bash
# Supprimer commentaires (#) et lignes vides
sed -i.bak '/^#/d; /^$/d' fichier

# Trim espaces en début/fin de ligne
sed -E -i 's/^[[:space:]]+//; s/[[:space:]]+$//' fichier

# Réduire les espaces multiples à un seul
sed -E -i 's/[[:space:]]+/ /g' fichier

```

### 6.2 URLs & IPs

```bash
# http -> https (change de délimiteur pour éviter d’échapper les /)
sed -i 's|http://|https://|g' index.html

# Remplacer une IP (échapper les points)
sed -i 's/192\.168\.1\.10/10.0.0.1/g' config.txt

```

### 6.3 Autour d’un motif

```bash
# Ajouter un tag après chaque ligne contenant ERREUR
sed -i '/ERREUR/a\-- Journal vérifié --' journal.txt

# Insérer un en-tête une seule fois au début
sed -i '1i# Début du fichier' fichier

```

### 6.4 Plages & blocs

```bash
# Supprimer tout entre START et END inclus
sed -i '/^START/,/^END/d' fichier

# Remplacer les lignes 5 à 7 par un bloc
sed -i '5,7c\Bloc\nmulti-lignes' fichier

```

### 6.5 Extraire sans modifier (filtrage)

```bash
# Seulement les lignes avec "erreur" (insensible à la casse)
sed -n '/erreur/Ip' journal.txt > erreurs.log

```

### 6.6 Reformatage simple

```bash
# Inverser "Nom, Prenom" -> "Prenom Nom"
sed -E 's/^([^,]+),[[:space:]]*(.+)$/\2 \1/' noms.txt

```

---

## 7) Pièges fréquents & bons réflexes

- **Tu vois la sortie, mais le fichier ne change pas ?**
    
    Normal : `sed` écrit sur **stdout**. Utilise `-i` **ou** redirige `>`.
    
- **Slashes dans le motif (URLs, chemins)** :
    
    change le délimiteur : `s|/ancien/chemin|/nouveau/chemin|g`.
    
- **IP/regex** : `.` matche n’importe quoi → **échappe les points** : `192\.168\.1\.10`.
- **Quoting/retours à la ligne** : garde ta commande sur **une seule ligne** (ou échappe les fins de ligne avec `\`).
- **Insensible à la casse** : le flag `I` est **GNU sed**. Sur BSD/macOS, préfère des classes (`[Vv][Ii][Ee][Uu][Xx]`) si besoin de portabilité.
- **`i` sur macOS** : `i ''` (suffixe vide) ou `i .bak`.
- **Mots entiers** : `\<mot\>`/`\>mot\>` est GNU ; sinon, travaille avec des **délimiteurs explicites** (espaces, ponctuation) ou regex étendues `\b` selon l’outil.
- **Multi-lignes** : n’en abuse pas ; pour les gros traitements multi-lignes, `awk`/`perl` peuvent être plus confortables.

---

## 8) Mini “cheat sheet” (SED en 60 secondes)

```bash
# Substitutions
sed 's/foo/bar/' file             # 1re occurrence par ligne
sed 's/foo/bar/g' file            # toutes
sed -E 's/(foo)_(bar)/\1-\2/g' f  # captures (ERE)
sed 's|\<http://\>|https://|g' f  # change délimiteur + mot entier (GNU)

# Supprimer
sed '/^$/d' f                     # vides
sed '/^#/d' f                     # commentaires
sed '5,10d' f                     # plage lignes
sed '/^START/,/^END/d' f         # bloc entre motifs

# Insérer / Ajouter / Changer
sed '1i\# Titre' f
sed '/ERREUR/a\-- vérifié --' f
sed '5c\Nouvelle ligne' f

# Filtrer / Imprimer
sed -n '/motif/p' f
sed '/motif/q' f                  # quitter au 1er match

# In-place (+ sauvegarde)
sed -i.bak 's/http:/https:/g' f

```

# AWK — comprendre, utiliser, être autonome

## 1) Principe & utilité

AWK est un **outil de traitement de texte tabulaire** : il lit un flux **ligne par ligne**, découpe chaque ligne en **champs** (colonnes), et exécute une **action** (afficher, filtrer, calculer, reformater).

Quand l’utiliser ?

- Quand `cut` est trop limité (espaces irréguliers, besoin de calculs/conditions/formatage).
- Quand `grep` ne suffit pas (tu veux **filtrer + afficher certaines colonnes**).
- Quand tu veux des **totaux/moyennes** ou des **regroupements** “à la SQL” en une ligne.

---

## 2) Forme de base & notions essentielles

### 2.1 Forme minimale

```bash
awk '{ ACTION }' fichier

```

- Sans **pattern**, l’`ACTION` s’applique à **chaque** ligne.

### 2.2 Pattern → Action

```bash
awk 'PATTERN { ACTION }' fichier

```

- `PATTERN` peut être :
    - une **expression** : `$2 >= 15`, `$3 == "Maths"`,
    - une **regex** : `/ERROR/`, `$3 ~ /^Chi/`,
    - un “**vrai**” implicite : `NF` (ligne non vide), `NR>1` (pas l’entête).

### 2.3 Champs & variables clés

- `$1`, `$2`, … : colonnes de la ligne ; `$0` : la **ligne entière**
- `NF` : nombre de champs de la ligne ; `NR` : numéro de ligne global
- `FILENAME` : nom du fichier courant ; `FNR` : n° de ligne **dans** ce fichier

### 2.4 Séparateurs (entrée & sortie)

- **Entrée** : `F','` (CSV simple), `F'\t'` (TSV), `F'[[:space:]]+'` (espaces multiples)
- **Sortie** : par défaut, `print` sépare par **un espace** entre les éléments

### 2.5 Comparaisons & regex

- Comparaisons : `==`, `!=`, `<`, `<=`, `>`, `>=`
- Regex : `$3 ~ /mot/` (matche), `$3 !~ /mot/` (ne matche pas)

> 💡 Numérique vs texte : AWK compare numériquement si les deux opérandes “ressemblent” à des nombres, sinon en chaîne.
> 
> 
> Astuce pour forcer le numérique : `($3+0) > 100`.
> 

---

## 3) Ce que tu peux faire (et comment)

### 3.1 Afficher des colonnes

```bash
awk '{print $1,$3}' file                 # colonnes 1 et 3
awk -F',' '{print $1,$3}' file.csv       # CSV simple
awk -F'[[:space:]]+' '{print $1,$2,$3}' file.txt

```

### 3.2 Filtrer (conditions)

```bash
awk '$2 >= 15 {print $1,$2}' notes.txt
awk '$3 == "Maths" {print $1,$2}' notes.txt
awk '$3 ~ /^Chi/ {print $1,$3}' notes.txt
awk 'NF' notes.txt                        # lignes non vides
awk 'NR>1' notes.csv                      # saute l’entête

```

### 3.3 Compter / sommer / moyenne / min / max

```bash
awk '{n++; sum+=$2} END{ if(n) print "n=",n,"sum=",sum,"avg=",sum/n }' file

awk 'NR==1{min=max=$2; wmin=wmax=$1}
     $2<min{min=$2; wmin=$1}
     $2>max{max=$2; wmax=$1}
     END{print "min",min,wmin,"max",max,wmax}' file

```

### 3.4 Regrouper (tableaux associatifs)

```bash
# Fréquences par clé
awk '{c[$1]++} END{for(k in c) print k, c[k]}' file

# Somme & moyenne par groupe (ex. matière en $3)
awk '{s[$3]+=$2; n[$3]++}
     END{for(m in s) printf "%s %d %.2f\n", m, s[m], s[m]/n[m] }' file

```

### 3.5 Formatage propre

- `print` : simple, ajoute `OFS` (séparateur de sortie, espace par défaut)
- `printf` : contrôle fin (largeur, décimales, alignement)

```bash
awk '{printf "%-10s %6d %-12s\n",$1,$2,$3}' notes.txt
# %-10s = texte gauche 10; %6d = entier largeur 6; %.2f = 2 décimales

```

### 3.6 Variables shell → AWK

```bash
seuil=15
awk -v s="$seuil" '$2 >= s {print $1,$2}' notes.txt

```

### 3.7 Fonctions pratiques

- `length($1)`, `tolower($1)`, `toupper($1)`
- `sub(/x/,"y",$3)` (remplace 1ère), `gsub(/x/,"y",$3)` (toutes)
- `split($3, arr, "/")`, `substr($1,1,3)`, `index($0,"ERROR")`

### 3.8 Multi-fichiers & “join léger” (idiome `NR==FNR`)

```bash
# bonus.txt : "Alice 2" (bonus de points)
# notes.txt : "Alice 14 Maths" ...
awk '
  NR==FNR { bonus[$1]=$2; next }       # 1er fichier : charge bonus
  { $2 += ( $1 in bonus ? bonus[$1] : 0 ); print $1,$2,$3 }
' bonus.txt notes.txt

```

---

## 4) Ce qu’il faut éviter / pièges fréquents

- **`cat file | awk ...`** : inutile, fais `awk ... file`.
- **`grep ... | awk ...`** : souvent inutile, mets la condition **dans AWK** (`/mot/` ou `$col ~ /mot/`).
- **CSV “complexes”** (guillemets, virgules internes) : AWK a des limites → préfère `csvkit`, `xsv`, `mlr` si besoin.
- **Espaces irréguliers** : utilise `F'[[:space:]]+'`.
- **Forcer numérique** : `($3+0)` pour éviter des surprises si `$3` contient des espaces ou du texte.
- **Locale & décimales** : `printf "%.2f"` donne un **point** (utile si ta locale affiche des virgules).

---

# Tes challenges — explications AWK (propres & réutilisables)

## A) Score — extraire noms & calculer la moyenne

**Objectif** : afficher `(nom, note)` et calculer la **moyenne** des notes.

```bash
# (1) colonnes 2 (nom) et 4 (note)
awk '{print $2,$4}' scores.txt > results.txt

# (2) moyenne depuis results.txt (note en $2)
awk '{sum+=$2; n++} END{ if(n) printf "%.2f\n", sum/n }' results.txt

```

> Tu avais tenté somme/n += $2 : c’est une erreur de syntaxe. On accumule d’abord (sum+=...), on divise à la fin dans END.
> 

---

## B) IP Finder — extraire l’IP sans le `/24`

**Objectif** : récupérer l’IP de `enp0s3` **sans** le masque.

```bash
ip addr show enp0s3 \
| awk '/inet /{ split($2,a,"/"); print a[1] }' > ip.txt
# -> 10.0.2.15

```

> /inet / = pattern ; $2 vaut 10.0.2.15/24 ; split(...,"/") garde a[1].
> 

---

## C) Free space — pourcentage libre à partir de `df -h`

**Objectif** : afficher `100 - Utilisation%` de `/dev/sda1`.

```bash
df -h /dev/sda1 | awk 'NR==2 { gsub("%","",$5); print 100-$5 "%"}' > free.txt
# NR==2 prend la ligne des données (la 2e), gsub retire le '%'

```

---

## D) Colonnes & lignes (CSV) — filtrer strictement `$3 > 100`

**Objectif** : garder **l’entête** + lignes où la **3e colonne** est **> 100**.

```bash
awk -F',' 'NR==1{print; next} ($3+0) > 100' donnees.txt > resultat_sup_100.txt
# ($3+0) force l’interprétation numérique ; next évite de re-tester l’entête

```

> Les erreurs que tu as vues (lignes 75, 90) viennent souvent d’un cast implicite ambigu ou d’espaces.
> 
> 
> Avec `($3+0) > 100`, c’est sûr et simple.
> 

---

## E) Regroupement de données — somme par mois

**Objectif** : `ventes_mensuelles.txt` (= somme des montants par mois).

```bash
awk -F',' '{s[$1]+=$2} END{for(m in s) print m "," s[m]}' ventes.txt \
| sort > ventes_mensuelles.txt

```

> Tu avais bien la logique ; vérifie juste le nom du fichier de sortie (tu avais *.tx).
> 

---

## F) Filtrage & statistiques — moyenne + export des > moyenne

**Objectif** : calculer la **moyenne**, puis **écrire** les lignes **au-dessus** dans un fichier.

```bash
awk -F',' '
  NR>1 { sum+=$3; n++; data[n]=$0 }          # charge les lignes (sans entête)
  END{
    if(n){
      avg=sum/n; printf "Moyenne: %.2f\n", avg;
      for(i=1;i<=n;i++){
        split(data[i],f,",");
        if((f[3]+0) > avg) print f[1] "," f[2] > "excellents_etudiants.txt"
      }
    }
  }
' etudiants.txt

```

> Ici j’utilise printf pour forcer la ponctuation et +0 pour forcer le numérique.
> 

---

# 15 commandes AWK à savoir (mémo rapide)

```bash
# Sélection de colonnes
awk '{print $1,$3}' file
awk -F',' '{print $1,$3}' file.csv
awk -F'[[:space:]]+' '{print $1,$2,$3}' file.txt

# Filtres
awk '$2>=15' file
awk '$3=="Maths"' file
awk '$3 ~ /^Chi/' file
awk 'NF' file            # non vides
awk 'NR>1' file          # sans l’entête

# Totaux, moyennes, min/max
awk '{s+=$2} END{print s}' file
awk '{s+=$2;n++} END{if(n) printf "%.2f\n", s/n}' file
awk 'NR==1{min=max=$2} $2<min{min=$2} $2>max{max=$2} END{print min,max}' file

# Groupes / Agrégats
awk '{c[$1]++} END{for(k in c) print k,c[k]}' file
awk '{s[$3]+=$2;n[$3]++} END{for(m in s) printf "%s %d %.2f\n",m,s[m],s[m]/n[m]}' file

# Logs web (combined): URLs en 404
awk '$9==404 {print $7}' access.log | sort | uniq -c | sort -nr | head

# ls -l capturé : nom + taille (tri humain)
grep -v '^total' ls.txt | awk '{print $9,$5}' | sort -k2,2h

# Forcer numérique & nettoyer
awk '($3+0)>100' file
awk '{gsub(/,/, ".", $2); print $1,$2}' file

```

---

## BONUS (à la fin du cours) — `BEGIN` & formatage avancé (optionnel)

- **Fixer un séparateur de sortie** pour tous les `print` :
    
    ```bash
    awk 'BEGIN{OFS=" | "} {print $1,$3}' file
    
    ```
    
- **En-têtes & tableau aligné :**
    
    ```bash
    awk 'BEGIN{printf "%-10s %6s %-12s\n","Prenom","Note","Matiere"}
         {printf "%-10s %6d %-12s\n",$1,$2,$3}' notes.txt
    
    ```
    
- **Passer des variables dès le début (seuil, formats, etc.) :**
    
    ```bash
    seuil=15
    awk -v s="$seuil" 'BEGIN{OFS=";"} $2>=s {print $1,$2}' notes.txt
    
    ```