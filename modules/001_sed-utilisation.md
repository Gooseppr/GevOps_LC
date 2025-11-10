---
titre: SED
type: module
jour: 01
ordre: 3
tags: bash, linux, text-processing
---

# SED

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

---
[← Module précédent](001_terminal-bash.md) | [Module suivant →](001_awk-utilisation.md)
---
