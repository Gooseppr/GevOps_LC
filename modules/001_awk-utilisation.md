---
titre: AWK
type: module
jour: 01
ordre: 4
tags: bash, linux, text-processing
---

# AWK

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

## Tes challenges — explications AWK (propres & réutilisables)

### A) Score — extraire noms & calculer la moyenne

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

### B) IP Finder — extraire l’IP sans le `/24`

**Objectif** : récupérer l’IP de `enp0s3` **sans** le masque.

```bash
ip addr show enp0s3 \
| awk '/inet /{ split($2,a,"/"); print a[1] }' > ip.txt
# -> 10.0.2.15

```

> /inet / = pattern ; $2 vaut 10.0.2.15/24 ; split(...,"/") garde a[1].
> 

---

### C) Free space — pourcentage libre à partir de `df -h`

**Objectif** : afficher `100 - Utilisation%` de `/dev/sda1`.

```bash
df -h /dev/sda1 | awk 'NR==2 { gsub("%","",$5); print 100-$5 "%"}' > free.txt
# NR==2 prend la ligne des données (la 2e), gsub retire le '%'

```

---

### D) Colonnes & lignes (CSV) — filtrer strictement `$3 > 100`

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

### E) Regroupement de données — somme par mois

**Objectif** : `ventes_mensuelles.txt` (= somme des montants par mois).

```bash
awk -F',' '{s[$1]+=$2} END{for(m in s) print m "," s[m]}' ventes.txt \
| sort > ventes_mensuelles.txt

```

> Tu avais bien la logique ; vérifie juste le nom du fichier de sortie (tu avais *.tx).
> 

---

### F) Filtrage & statistiques — moyenne + export des > moyenne

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

## 15 commandes AWK à savoir (mémo rapide)

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

### BONUS (à la fin du cours) — `BEGIN` & formatage avancé (optionnel)

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

---
[← Module précédent](001_sed-utilisation.md)
---

---
[← Module précédent](001_sed-utilisation.md)
---

---
[← Module précédent](001_sed-utilisation.md)
---

---
[← Module précédent](001_sed-utilisation.md)
---

---
[← Module précédent](001_sed-utilisation.md)
---

---
[← Module précédent](001_sed-utilisation.md)
---
