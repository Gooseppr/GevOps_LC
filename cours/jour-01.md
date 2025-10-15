---
layout: page
title: Jour 01 — Fondamentaux
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

## Pourquoi / quoi

Le terminal (ligne de commande) permet d’interagir avec la machine via des **commandes** pour :

- naviguer dans les dossiers,
- manipuler fichiers/dossiers,
- rechercher/filtrer du contenu,
- enchaîner des traitements (pipelines).

> Windows : cmd / PowerShell (syntaxe différente)
> 
> 
> Linux/macOS : **terminal Bash** (ce qu’on utilise dans Vagrant).
> 

## Anatomie d’une commande

```
commande [options] [arguments]
```

- **commande** : le programme (ex: `ls`)
- **options** : modifient le comportement (ex: `l`, `r`, `h`)
- **arguments** : cibles (ex: `ls /var/log`)

## Naviguer / gérer l’arborescence

- `pwd` : chemin courant
- `ls` : lister (`ls -l`, `ls -la`)
- `cd <dir>` : changer de dossier (`cd ..` parent / `cd ~` home)
- `mkdir <dir>` : créer dossier (`mkdir -p a/b/c` crée toute la chaîne)

## Fichiers — créer, afficher, transformer

- `touch <f>` : créer/mettre à jour un fichier vide
- `cat <f>` : afficher (ou concaténer plusieurs)
- `less <f>` : paginer (↑/↓, `q` pour quitter)
- `grep "mot" <f>` : rechercher (options utiles : `n` numéros de ligne, `i` insensible à la casse, `r` récursif)
- `cut -d';' -f2 <f>` : extraire colonnes
- `sort` : trier (ex: `sort -h` nombres “humains”, `r` inverse, `t` séparateur, `k` clé)
- `tr 'A-Z' 'D-ZABC'` : substitution caractère→caractère (utile pour Caesar)
- `wc` : compter (`wc -l` lignes, `wc -w` mots, `wc -c` octets)
- `echo "texte"` : écrire du texte (souvent redirigé vers un fichier)
- `mv src dst` : déplacer/renommer (si `dst` est dossier → déplace, sinon renomme)
- `rm <f>` : supprimer fichier (`rm -r <dir>` pour un dossier) **→ attention, pas de corbeille**

## Système / réseau (bases)

- `whoami` : utilisateur courant
- `ps` / `ps aux` : processus
- `kill <PID>` : terminer un processus
- `df -h` : espace disque
- `history` : historique de commandes
- `ip addr` : infos réseau (IP)
- `curl <url>` : requête HTTP rapide (ex: `curl ifconfig.me`)

## Aide intégrée

- `man <cmd>` : manuel
- `<cmd> --help` : aide synthétique

## Redirections & pipelines (indispensable)

- `>` : écraser vers un fichier ; `>>` : ajouter
- `|` : **pipeline** : envoie la sortie d’une commande dans l’entrée de la suivante
    
    Ex. `cat logs.txt | grep ERROR | sort | uniq -c | sort -nr | head`
    

## Joker (globbing) & quotes

- `.txt`, `log?.txt`, `log{1..4}.txt`
- Quotes : `"mot clé"` préserve les espaces ; `'texte brut'` empêche l’expansion

---

# CHALLENGES — Terminal & Bash

## Préambule “Indices” (navigation + créations)

### Ta version

```bash
cd
# (affiche) projects/ setup/    .ssh/
cd setup
cd J
# (affiche) J1/ J2/ J3/
cd J1/secretcode
ls
# (affiche) indice.txt  lastindice.txt  myfolder  six.js
cd myfolder/
ls
# (affiche) five.js
touch terminal.txt
ls
# (affiche) five.js  terminal.txt
cd ..
cat lastindice.txt
# (affiche) 9
exit

```

### Version simplifiée (mêmes notions)

```bash
cd ~/setup/J1/secretcode/myfolder && touch terminal.txt && ls
cat ~/setup/J1/secretcode/lastindice.txt

```

**Pourquoi :** `&&` enchaîne uniquement si la commande précédente réussit ; chemins absolus/tilde évitent les allers-retours.

## Challenge — Files & Folders

### Ta version

```bash
cd
# (affiche) projects/ setup/    .ssh/
cd setup/J1/filesandfolders
mkdir txt
ls
# (affiche) emptyFile.txt  log1.txt  log2.txt  log3.txt  log4.txt  txt
rm txt
# -> erreur: est un dossier
rm -r txt
ls
# (affiche) emptyFile.txt  log1.txt  log2.txt  log3.txt  log4.txt
mkdir txt
ls
# (affiche) ... + txt
rm -r txt | mkdir logs
ls
# (affiche) ... + logs
mv log?.txt logs/
ls
# (affiche) emptyFile.txt  logs
mv emptyFile.txt logs/
ls
# (affiche) logs
ls logs/
# (affiche) emptyFile.txt  log1.txt  log2.txt  log3.txt  log4.txt
exit

```

### Version simplifiée/optimisée

```bash
cd ~/setup/J1/filesandfolders
rm -rf txt && mkdir logs
mv log?.txt emptyFile.txt logs/
ls logs/

```

**Pourquoi :** pas de pipeline (`|`) entre `rm` et `mkdir` ; `&&` garantit l’ordre logique. Un seul `mv` pour tout déplacer.

## Challenge — Merge Files (concaténation)

### Ta version

```bash
cd setup/J1/mergefiles/
ls
cat log1.txt
cat log?.txt
ls
cat log1.txt > globalLogs.txt | cat log2.txt >> globalLogs.txt | cat log3.txt >> globalLogs.txt | cat log4.txt >> globalLogs.txt
ls
cat globalLogs.txt
less --help
less globalLogs.txt
exit

```

### Version simplifiée/optimisée

```bash
cd ~/setup/J1/mergefiles
cat log{1..4}.txt > globalLogs.txt     # ou: cat log*.txt > globalLogs.txt
less globalLogs.txt

```

**Pourquoi :** une seule commande `cat` suffit ; pas besoin de `|` ici.

## Challenge — Error Logs (extraction WARNING)

### Ta version

```bash
cd setup/J1/errorlogs/
ls
cat log?.txt >>globalLogs.txt
less globalLogs.txt
less log1.txt
cat log.txt > globalLogs2.txt
# -> cat: log.txt: Aucun fichier ou dossier de ce type
ls
# (affiche globalLogs2.txt parmi les fichiers)
rm globalLogs2.txt
ls
cat log?.txt | xargs >> globalLogs2.txt
ls
grep "WARNING" log?.txt
grep "WARNING" log?.txt >> warningLogs.txt
cat warningLogs.txt
grep "WARNING" globalLogs.txt
grep "WARNING" globalLogs2.txt
grep "WARNING" globalLogs2.txt >> warningLogs2.txt
set VAGRANT_VAGRANTFILE=Vagrantfile.amd64

```

### Version simplifiée/optimisée

```bash
cd ~/setup/J1/errorlogs
cat log?.txt > globalLogs.txt
grep "WARNING" log?.txt > warningLogs.txt        # par fichier (avec préfixes)
grep -h "WARNING" log?.txt > warning_all.txt     # sans préfixes de fichier
grep -c "WARNING" log?.txt                       # compte par fichier
grep -h "WARNING" log?.txt | wc -l               # total WARNING

```

**Pourquoi :** `-h` nettoie l’affichage, `-c` donne le comptage direct. Évite `xargs` quand `grep` sait déjà faire.

## Challenge — Count Lines (compter correctement)

### Ta version

```bash
cd setup/J1/count
# (affiche) countlines/      countoccurences/
cd setup/J1/countlines/
ls
ls >> numberLines.txt
ls
cat numberLines.txt
wc -l numberLines.txt
# (affiche) 6 numberLines.txt

```

### Version selon intention

- **Nombre de fichiers .txt :**
    
    ```bash
    ls *.txt | wc -l
    
    ```
    
- **Nombre total de lignes dans log1–4 :**
    
    ```bash
    wc -l log?.txt
    # ou juste le total :
    cat log?.txt | wc -l
    
    ```
    

## Challenge — Find the command (système/réseau)

### Ta version

```bash
cd setup/J1/findthecommand/
whoami
whoami > whoami.txt
cat whoami.txt
ls
ps
ps aux
ps aux > ps.txt
ls
less ps.txt
df -h
df -h > df.txt
ls
less df.txt
ip addr show > ifconfig.txt
less ifconfig.txt
ls
curl ifconfig.me
curl ifconfig.me > ip.txt
ls
cat ip.txt

```

### Version “mémo rapide”

```bash
whoami > whoami.txt
ps aux > ps.txt
df -h > df.txt
ip addr show > ifconfig.txt
curl -s ifconfig.me > ip.txt

```

**Astuce :** `-s` (silent) avec `curl` pour ne garder que la réponse.

## Challenge — Compter les occurrences (“INFO”)

### Ta version

```bash
cd setup/J1/countoccurences/
grep "INFO" log1.txt
grep "INFO" log1.txt | wc -l
# 41
grep "INFO" log?.txt | wc -l
# 113
grep "INFO" log?.txt | xargs wc -l
find log*.txt | xargs grep -c INFO
# log1.txt:41
# log2.txt:31
# log3.txt:27
# log4.txt:14

```

### Version simplifiée/optimisée

```bash
grep -c "INFO" log*.txt            # par fichier
grep -h "INFO" log*.txt | wc -l    # total toutes occurrences

```

**Pourquoi :** évite `find/xargs` ici, `grep` gère directement les glob patterns.

## Challenge — Jouer avec les pipelines (exemples utiles)

### Ta (intention annoncée, pas de commandes conservées)

Tu voulais pratiquer les `|` avec de vraies manipulations.

### Propositions (dans le cadre du cours)

```bash
# Top 5 lignes (exactes) les plus fréquentes dans tous les logs
cat log*.txt | sort | uniq -c | sort -nr | head -n5

# Toutes les lignes "ERROR" triées, sans doublons
grep "ERROR" log*.txt | sort | uniq

```

**Pourquoi :** `sort | uniq -c` agrège les doublons et les compte, `sort -nr` ordonne par fréquence.

## Challenge — File Sorting (trier une sortie de ls -l enregistrée)

### Ta version

```bash
cd setup/J1/filesorting/
sort ls.txt
cat ls.txt
# ligne 'total 40' + 6 entrées
sort -t" " k9 ls.txt
# -> erreur : k9 non trouvé (oubli du '-')
sort -t" " -k9 ls.txt
sort -r -t" " -k9 ls.txt
sort -h -t" " -k5 ls.txt
sort -ha -t" " -k5 ls.txt
# -> 'a' invalide
sort -h -a -t" " -k5 ls.txt
# -> 'a' invalide
sort -h -t -r -k5 ls.txt
# -> erreur de séparateur
sort -h -k5 ls.txt
sort -h -k5 -r ls.txt
sort -h -k5 -r head3 ls.txt
# -> 'head3' n'existe pas
sort -h -k5 -r head3 ls.txt | head -n3
# -> idem
sort -h -k5 -r head3 ls.txt | xargs head 3
# -> erreurs head
sort -h -k5 -r head3 ls.txt | xargs head -n3
# -> erreurs
sort -h -k5 -r ls.txt | head -n3
sort -h -k5 -r ls.txt | head -n3 > largest.txt
ls
cat largest.txt

```

### Version propre (3 plus gros éléments par **taille**)

```bash
grep -v '^total' ls.txt | sort -h -k5,5r | head -n3 > largest.txt

```

**Pourquoi :**

- `grep -v '^total'` enlève la ligne d’entête.
- `k5,5` fige la clé sur la seule 5e colonne (évite les surprises).
- `h` comprend 256B/10K/etc.
- `r` pour l’ordre décroissant.

## Challenge — César (décryptage avec `tr`)

### Ta version

```bash
cd setup/J1/caesercipher/
cat cipher.txt
echo "X IX SRB AB ZBQQB SFIIB ÉQOX
KDBX IX SRB AB ZBQQB SFIIB ÉQOXKD" | tr 'A-Z' 'D-C'
# -> erreur ordre inverse
echo "X IX SRB AB ZBQQB SFIIB ÉQOXKDBX IX SRB AB ZBQQB SFIIB ÉQOXKD" | tr 'A-Z' 'D-ZC'
# (sortie partielle)
echo "X IX SRB AB ZBQQB SFIIB ÉQOXKDBX IX SRB AB ZBQQB SFIIB ÉQOXKD" | tr 'A-Z' 'D-ZABC'
# (décryptage correct, partiel)
cat cipher.txt | tr 'A-Z' 'D-ZABC' > message.txt
ls
# (affiche) cipher.txt  message.txt

```

### Version plus robuste (majuscules **et** minuscules)

```bash
tr 'A-Za-z' 'D-ZA-Cd-za-c' < cipher.txt > message.txt

```

**Note :** `tr` ne transforme pas les caractères accentués — c’est attendu.

---

# Mini-rappels généraux (erreurs que tu as croisées)

- **Pipeline `|` ≠ enchaînement** :
    
    Utilise `&&` pour “exécuter si la précédente a réussi”.
    
    Exemple : `rm -r txt && mkdir logs` (et non `rm -r txt | mkdir logs`).
    
- **`sort`** :
    - `t" "` définit le séparateur,
    - `kX,Y` borne précisément la (les) colonne(s),
    - `h` comprend `K/M/G/B`,
    - `r` inverse l’ordre.
- **Comptages** :
    - Lignes par fichiers `wc -l log?.txt`,
    - Occurrences d’un motif : `grep -c "MOT" *.txt`, total : `grep -h "MOT" *.txt | wc -l`.
- **Suppression** : `rm -rf` = “pas de retour arrière”. Double-check le chemin.
- **Globbing** : vérifie avec `echo log?.txt` ce que la coquille va étendre.

---

# SED — bases utiles (stream editor)

## 1) À quoi sert `sed` ?

- **Lit un flux** (fichier ou entrée standard) **ligne par ligne**, applique des **règles** (rechercher/remplacer, supprimer, insérer, modifier), et **écrit** le résultat sur la sortie standard.
- Forme minimale :

```bash
sed 'COMMANDE' fichier.txt

```

## 2) Motifs & regex essentielles

- `.` un caractère quelconque
- 0 ou plusieurs répétitions du caractère précédent (`a*`)
- `^` début de ligne, `$` fin de ligne
- `[abc]` groupe de caractères autorisés
- **Classes POSIX** (très pratiques) :
    - `[[:digit:]]` chiffres, `[[:lower:]]` minuscules, `[[:upper:]]` majuscules, `[[:space:]]` espaces/tab
- **Délimiteurs de mot** (GNU sed) : `\<` début de mot, `\>` fin de mot
    
    (utile pour éviter de toucher des sous-chaînes dans des mots plus longs)
    

> Astuce : sed -E (ou -r sur certains systèmes) active les regex étendues (parenthèses () sans backslash, +, ?, |, …).
> 

## 3) Les commandes de base à connaître

- **Substitution (remplacement)**
    - 1re occurrence par ligne :
        
        `sed 's/motif/remplacement/' fichier`
        
    - **toutes** les occurrences par ligne :
        
        `sed 's/motif/remplacement/g' fichier`
        
    - indifférent à la casse (GNU sed) :
        
        `sed 's/motif/remplacement/Ig' fichier`
        
    - avec **groupes capturants** (`\(...\)` sans `E`, ou `(...)` avec `E`) et **backref** `\1`, `\2`, … :
        
        ```bash
        sed -E 's/(foo)_(bar)/\1-\2/g' fichier
        
        ```
        
    - n’utiliser que les **mots entiers** :
        
        `sed 's/\<vieux\>/ancien/g'`
        
- **Supprimer**
    - lignes qui matchent un motif : `sed '/motif/d' fichier`
    - lignes vides : `sed '/^$/d' fichier`
    - plage de lignes : `sed '5,10d' fichier`
- **Remplacer une ligne complète** :
    
    `sed '2c\Nouvelle ligne entière' fichier`
    
- **Insérer**
    - **après** la ligne qui matche : `sed '/motif/a\texte à ajouter' fichier`
    - **avant** la ligne qui matche : `sed '/motif/i\texte à insérer' fichier`
    - **au début** : `sed '1i\en-tête' fichier`
- **Impression/filtrage**
    - n’imprimer **que** les lignes qui matchent (et rien d’autre) :
        
        `sed -n '/motif/p' fichier`
        
    - **quitter** tôt (utile sur gros fichiers) :
        
        `sed '/motif/q' fichier`
        

## 4) Écrire dans le fichier (in-place)

- `sed -i 's/foo/bar/g' fichier`
- avec sauvegarde : `sed -i.bak 's/foo/bar/g' fichier` → garde `fichier.bak`

## 5) Chaîner plusieurs commandes

- Avec point-virgule :
    
    `sed '/^#/d; /^$/d' fichier`
    
- Ou options multiples :
    
    `sed -e '/^#/d' -e '/^$/d' -e 's/http:/https:/g' fichier`
    

---

# CHALLENGES  SED

## Challenge : Recherche et remplacement

**Contexte**

```
texte.txt
C'est un vieux livre.
Le vieux bâtiment est en ruine.
Ce film est vraiment vieux.

```

### Ce que tu as fait

- `sed 's/vieux/ancien/g' texte.txt` (OK) → affiche **sur la sortie**.
- Tu as ensuite utilisé `i` pour **écrire** dans le fichier et `i.bak` pour garder une copie. Très bien.

### Points qui ont coincé

- Quotes cassées / retour à la ligne au mauvais endroit -> invite secondaire `>` et Ctrl-C.
- Sans `i`, **le fichier ne change pas** (sed écrit sur la sortie). Il faut rediriger `> nouveau.txt` ou utiliser `i`.

### Version propre (à garder)

```bash
# Voir le résultat sans toucher au fichier
sed 's/vieux/ancien/g' texte.txt

# Écrire en place + garder une sauvegarde
sed -i.bak 's/vieux/ancien/g' texte.txt

# Facultatif : n’agir que sur le mot entier “vieux”
sed -i 's/\<vieux\>/ancien/g' texte.txt

# Variante insensible à la casse (GNU sed)
sed -i 's/vieux/ancien/Ig' texte.txt

```

> Remarque langue : “Le ancien bâtiment” est grammaticalement incorrect, mais sed ne “comprend” pas le français — il remplace exactement le motif.
> 

---

## Challenge : Suppression et ajout de texte (journal)

**Objectif**

- Enlever **commentaires** (`^#`) et **lignes vides**, puis **ajouter** une marque après chaque ligne “ERREUR”.

### Ce que tu as fait

- `sed '/^#/d;/^$/d' journal.txt` (OK pour un aperçu)
- `sed -i.bak '/^#/d;/^$/d' journal.txt` (OK in-place + backup)
- Puis :
    
    ```bash
    sed -i '/ERREUR/a\-- Journal vérifié --' journal.txt.bak
    mv journal.txt.bak journal_nettoyé.txt
    
    ```
    
    → Résultat correct.
    

### Les erreurs rencontrées

- Mauvais nom de fichier (`texte.txt.bak` au lieu de `journal.txt.bak`)
- `sed -i 'ERREUR/a\...'` : il faut **délimiter le motif par des slashes** : `'/ERREUR/a\...'`

### Version propre (tout-en-un)

```bash
# 1) Nettoyer (supprimer commentaires + lignes vides), en place avec sauvegarde
sed -i.bak '/^#/d; /^$/d' journal.txt

# 2) Ajouter après chaque ligne contenant “ERREUR”
sed -i '/ERREUR/a\-- Journal vérifié --' journal.txt

# (Option) renommer la sauvegarde
mv journal.txt.bak journal_nettoye.txt

```

> Astuce : pour imprimer seulement les lignes utiles sans modifier le fichier :
> 

```bash
sed -n '/^#/!{/^$/!p}' journal.txt       # équivaut à “tout sauf # et vides”

```

---

## Challenge : Nettoyage automatique (config)

**Objectifs observés**

- Enlever commentaires et vides, remplacer une IP, supprimer des lignes spécifiques, ajouter des marqueurs.

### Version courte, reproductible

```bash
# 1) Supprimer commentaires + vides (en place + sauvegarde)
sed -i.bak '/^#/d; /^$/d' config.txt

# 2) Remplacer toutes les occurrences d’une IP
sed -i 's/192\.168\.1\.10/10.0.0.1/g' config.txt

# 3) Supprimer des lignes par numéro (ex: 1 à 2 puis la 3e)
sed -i '1,2d; 3d' config.txt

# 4) Ajouter après toute ligne contenant “server” (motif)
sed -i '/server/a# Configuration validée' config.txt

# 5) Insérer une entête au début
sed -i '1i# Début du fichier' config.txt

# 6) Remplacer complètement une ligne (ex: ligne 5)
sed -i '5c\port=8080' config.txt

```

> Détail : dans un motif de substitution, échappe les points des IP (\.), sinon . matche n’importe quel caractère.
> 

---

## Challenge : Data Processing (préparation simple avec sed)

Tu as fait :

- `sort -h -k3 testLogs.txt` puis `cut -f1,6` → OK.

Pour rester dans **SED**, deux idées utiles :

```bash
# 1) Normaliser : compresser les multiples tabulations en une seule
sed -E 's/\t+/\t/g' testLogs.txt > normalized.txt

# 2) Extraire "jour" (col 3) et le binaire (chemin entre la colonne 6 et le “:”)
#    Hypothèse : colonnes tabulées (comme ton fichier)
sed -E 's/^([^\t]*\t){2}([^\t]+)\t([^\t]*\t){2}([^[:space:]]+):.*/\2\t\4/' testLogs.txt
# -> imprime: <jour>\t<chemin-binaire>

```

Si tu préfères ta chaîne `sort|cut`, garde-la : elle est très bien.

---

## Challenge : Recherche de motif (journal erreurs)

Tu as utilisé `grep -i`. L’équivalent SED (pour ton cours) :

```bash
# Afficher seulement les lignes contenant “erreur” (insensible à la casse, GNU sed)
sed -n '/erreur/Ip' journal.txt > erreurs.log

```

- `n` : n’imprime rien par défaut.
- `/erreur/I` : motif insensible à la casse (`I`).
- `p` : imprimer les lignes qui matchent.

---

## Mini “cheat sheet” SED (à coller dans ton cours)

```bash
# Voir un remplacement (sans toucher au fichier)
sed 's/ancien/nouveau/g' fichier

# Écrire en place (+ sauvegarde)
sed -i.bak 's/foo/bar/g' fichier

# Mot entier seulement (GNU sed)
sed 's/\<mot\>/rempl/g' fichier

# Insensible à la casse (GNU sed)
sed 's/motif/rempl/Ig' fichier

# Supprimer : lignes par motif, vides, plage
sed '/motif/d' fichier
sed '/^$/d' fichier
sed '10,20d' fichier

# Remplacer ligne n
sed '5c\contenu entier' fichier

# Insérer avant / après
sed '/motif/i\ligne AVANT' fichier
sed '/motif/a\ligne APRES' fichier
sed '1i\entete au debut' fichier

# N’imprimer que les lignes qui matchent
sed -n '/motif/p' fichier

# Plusieurs commandes
sed '/^#/d; /^$/d; s/http:/https:/g' fichier

```

---

## Résumés rapides de tes erreurs (à ne plus refaire 😉)

- **Quotes cassées / retour à la ligne** : garde la commande sur **une seule ligne** (ou échappe les retours `\`).
- **Sans `i`**, `sed` **n’écrit pas** dans le fichier (redirige `>` ou ajoute `i`).
- Motifs : entoure-les bien de `/.../` (ex. `'/ERREUR/a\...'`), pas `ERREUR` tout seul.
- Remplacement avec **IP** : échappe les points `\.`.
- Fichiers : relis le **nom exact** du fichier (beaucoup d’erreurs venaient d’un nom fautif).

---

# AWK — les bases utiles (pour être autonome)

## 1) Ce que fait AWK

- **Lit** un fichier ligne par ligne, **découpe** en colonnes, puis **agit** (afficher, filtrer, calculer, formater).
- Forme la plus simple :

```bash
awk '{ ACTION }' fichier

```

## 2) Mots clés à connaître

- `$1`, `$2`, … : colonnes (champs).
- `$0` : ligne complète.
- `NF` : nombre de colonnes de la ligne.
- `NR` : numéro de ligne (1, 2, 3…).
- Séparateurs :
    - Entrée : `F','` (CSV simple), `F'\t'` (TSV), `F'[[:space:]]+'` (espaces multiples).
    - Sortie : par défaut un espace entre les éléments de `print`.
- Comparaisons simples : `==`, `!=`, `<`, `<=`, `>`, `>=` ; regex : `$3 ~ /mot/` (matche) / `$3 !~ /mot/` (ne matche pas).

## 3) Les 4 actions de base (à connaître par cœur)

- **Afficher des colonnes**
    
    ```bash
    awk '{print $1,$3}' fichier
    
    ```
    
- **Filtrer**
    
    ```bash
    awk '$2 >= 15 {print $1,$2}' fichier
    awk '$3 ~ /^Chi/' fichier
    
    ```
    
- **Compter / sommer / moyenne**
    
    ```bash
    awk '{n++; sum+=$2} END{ if(n) print sum, sum/n }' fichier
    
    ```
    
- **Agrégats par groupe (tableau associatif)**
    
    ```bash
    awk '{s[$1]+=$2} END{for(k in s) print k, s[k]}' fichier
    
    ```
    

> END { ... } s’exécute après la dernière ligne : parfait pour afficher des totaux/moyennes.
> 

---

---

# CHALLENGES AWK

---

## Challenge “Score”

**Fichier :** `scores.txt`

```
1 Anais History 80 B 0.345
2 Antoine Biology 70 C 0.583
3 Julie Physics 85 B+ 0.438
4 Emma History 90 A 0.632
5 Marlene Maths 80 B 0.832
6 Lucas Chemistry 80 B 0.464

```

### Ce que tu as fait

```bash
awk '{print $2,$4}' scores.txt > results.txt   # OK : (nom, note)
awk '{ total += $2; count++ } END { print total/count }' results.txt
# -> 80,8333 (affiché avec virgule selon locale)

```

### Ce qui coinçait avant

- `awk '{somme/n += $2}' END { ... }` est **syntaxiquement faux** : `END{...}` doit être **dans** les quotes, et `somme/n += $2` n’a pas de sens (division avant affectation).
- Utilise un **numérateur** et un **compteur** puis moyenne dans `END`.

### Version propre (2 manières)

- **Directement depuis `scores.txt` (colonne 4)** :
    
    ```bash
    awk '{sum+=$4; n++} END{ if(n) printf "%.2f\n", sum/n }' scores.txt
    
    ```
    
- **Depuis `results.txt` (colonne 2)** :
    
    ```bash
    awk '{sum+=$2; n++} END{ if(n) printf "%.2f\n", sum/n }' results.txt
    
    ```
    

> printf "%.2f" force le point et 2 décimales (évite la virgule locale).
> 

---

## Challenge “IP Finder”

### Ce que tu as fait

- Bon réflexe : `ip addr show enp0s3 > ipaddr.txt`, puis `grep "inet"` pour filtrer.
- Petite coquille de nom de fichier (`ipaddre.txt`) puis un retour à la ligne avant le `| awk` (sans gravité).

### Version AWK seule (et IP sans le /24)

```bash
ip addr show enp0s3 | awk '/inet /{ split($2,a,"/"); print a[1] }' > ip.txt
# ip.txt contient: 10.0.2.15

```

> /inet / = motif (pattern). split($2,a,"/") sépare “10.0.2.15/24” en a[1]="10.0.2.15".
> 

---

## Challenge “Free space”

### Ce que tu as fait

```bash
df -h /dev/sda1 | awk 'NR==2 {print $5}'                 # 13%
df -h /dev/sda1 | awk 'NR==2 {print(100 - int($5))"%"}'  # 87%

```

**C’est très bien.** `int($5)` convertit “13%” → 13.

### Alternative lisible

```bash
df -h /dev/sda1 | awk 'NR==2 { gsub("%","",$5); print 100-$5 "%"}' > free.txt

```

> gsub("%","",$5) enlève le % dans le champ 5, puis on calcule.
> 

---

## Challenge “Colonnes et lignes”

### Commandes

```bash
awk -F ',' 'NR==1 || $3 > 100' donnees.txt > resultat_sup_100.txt

```

**Attendu :** l’entête **+** seulement les lignes où la **colonne 3 > 100**.

### Pourquoi tu as eu des lignes à 75 / 90 ?

Causes possibles (fréquentes) :

- **Espace après la virgule** (`"..., 75"`). Normalement la comparaison numérique gère, mais pour être carré, **trim** :
    
    ```bash
    awk -F',' 'NR==1{print; next} {gsub(/^ +| +$/,"",$3); if($3>100) print}' donnees.txt
    
    ```
    
- **Mauvais nom de fichier de sortie** : tu as fait `> resultat_sup_100.txt` puis tenté d’ouvrir `resultats_sup_100.txt` (avec un **s**).
- **Mauvais séparateur** : si ce n’est pas la virgule dans le vrai fichier, ajuste `F`.

### Version simple et sûre

```bash
awk -F',' 'NR==1{print; next} ($3+0) > 100' donnees.txt > resultat_sup_100.txt

```

> ($3+0) force l’interprétation numérique de la colonne.
> 

---

## Challenge “Regroupement de données”

**Fichier :** `ventes.txt`

```
Janvier,500
Février,600
Janvier,750
Mars,800
Février,900

```

### Ce que tu as fait

```bash
awk -F ',' '{sums[$1] += $2} END {for (month in sums) print month "," sums[month]}' ventes.txt > ventes_mensuelles.tx
# Puis tu as cherché ventes_mensuelles.txt (t manquant) → “Aucun fichier…”

```

### Version propre

```bash
awk -F',' '{s[$1]+=$2} END{for(m in s) print m "," s[m]}' ventes.txt \
| sort > ventes_mensuelles.txt

```

> Le sort final classe les mois (sinon ordre associatif).
> 

---

## Challenge “Filtrage et statistiques”

**Fichier :** `etudiants.txt`

```
Nom,Prenom,Note
John,Doe,85
Jane,Smith,92
Bob,Johnson,78
Alice,Williams,95

```

### Ton intention (moyenne + liste > moyenne) est parfaite.

Ta commande s’est “cassée” en collant (retours à la ligne au mauvais endroit).

### Version claire (une seule ligne, facile à relire)

```bash
awk -F',' 'NR>1 {sum+=$3; n++; data[n]=$0}
END{
  if(n){
    avg=sum/n; print "Moyenne:", avg;
    for(i=1;i<=n;i++){
      split(data[i],f,",");
      if(f[3]>avg) print f[1] "," f[2] > "excellents_etudiants.txt"
    }
  }
}' etudiants.txt

```

**Remarques**

- `NR>1` saute l’entête.
- On garde les lignes dans `data[]`, on calcule `avg`, puis on **écrit** les > moyenne.
- L’affichage “Moyenne: 87,5” avec **virgule** vient de ta locale. Si tu veux **forcer le point** :
    
    ```bash
    awk -F',' 'NR>1{sum+=$3;n++}
    END{ if(n) printf "Moyenne: %.2f\n", sum/n }' etudiants.txt
    
    ```
    

---

## En 10 commandes, tu sais faire 95% des besoins

```bash
# 1. Choisir des colonnes
awk '{print $1,$3}' file

# 2. Séparateur d’entrée (CSV simple / TSV / espaces multiples)
awk -F',' '{print $1,$3}' file.csv
awk -F'\t' '{print $1,$3}' file.tsv
awk -F'[[:space:]]+' '{print $1,$2,$3}' file.txt

# 3. Filtrer simples (numérique / texte / regex)
awk '$2>=15' file
awk '$3=="Maths"' file
awk '$3 ~ /^Chi/' file

# 4. Total / moyenne
awk '{sum+=$2} END{print sum}' file
awk '{sum+=$2;n++} END{if(n) print sum/n}' file

# 5. Min / Max (et qui)
awk 'NR==1{min=max=$2; whoMin=whoMax=$1}
     $2<min{min=$2;whoMin=$1}
     $2>max{max=$2;whoMax=$1}
     END{print "min",min,whoMin,"max",max,whoMax}' file

# 6. Comptages/agrégats par groupe
awk '{c[$1]++} END{for(k in c) print k,c[k]}' file
awk '{s[$3]+=$2;n[$3]++} END{for(m in s) print m,s[m],s[m]/n[m]}' file

# 7. Logs web : URLs en 404 (combined)
awk '$9==404 {print $7}' access.log | sort | uniq -c | sort -nr | head

# 8. ls -l capturé : nom + taille (tri par taille humaine)
grep -v '^total' ls.txt | awk '{print $9,$5}' | sort -k2,2h

```

---

## Bonus (facultatif, à la fin du cours) — soigner la sortie

- **Séparateur de sortie** :
    
    ```bash
    awk 'BEGIN{OFS=" | "} {print $1,$3}' file
    
    ```
    
- **Tableau aligné** :
    
    ```bash
    awk 'BEGIN{printf "%-10s %6s %-12s\n","Prenom","Note","Matiere"}
         {printf "%-10s %6d %-12s\n",$1,$2,$3}' notes.txt
    
    ```