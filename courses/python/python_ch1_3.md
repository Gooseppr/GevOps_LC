---
layout: page
title: "Structures de contrôle"

course: python
theme: "Fondations"
type: lesson

chapter: 1
section: 3

tags: python,if,for,while,boucles,iteration,range
difficulty: beginner
duration: 30
mermaid: false

status: "published"
next_module: "/courses/python/python_ch1_4.html"
next_module_title: "Fonctions"
---

# Structures de contrôle

## Objectifs pédagogiques

- Écrire des conditions avec `if`, `elif`, `else`
- Itérer avec `for` et `while`
- Utiliser `break`, `continue`, `pass` à bon escient
- Maîtriser `range()`, `enumerate()`, `zip()`
- Connaître l'opérateur ternaire et les idiomes d'itération Python

---

## Contexte

Les structures de contrôle définissent le flux d'exécution d'un programme. Python se distingue par sa syntaxe basée sur l'indentation (pas d'accolades) et par des outils d'itération idiomatiques très expressifs.

---

## Conditions : if / elif / else

```python
score = 75

if score >= 90:
    print("Excellent")
elif score >= 70:
    print("Bien")
elif score >= 50:
    print("Passable")
else:
    print("Insuffisant")
```

L'indentation (4 espaces par convention) est obligatoire, pas optionnelle.

### Conditions composées

```python
age = 25
abonne = True

if age >= 18 and abonne:
    print("Accès autorisé")

if age < 0 or age > 150:
    print("Âge invalide")

# Vérification d'appartenance
couleurs = ["rouge", "vert", "bleu"]
if "rouge" in couleurs:
    print("Rouge est dans la liste")

# Vérification de type et None
valeur = None
if valeur is None:
    print("Pas de valeur")
```

---

## Opérateur ternaire

```python
# Syntaxe : valeur_si_vrai if condition else valeur_si_faux
age = 20
statut = "majeur" if age >= 18 else "mineur"
print(statut)   # majeur

# Peut s'utiliser dans une f-string
print(f"Utilisateur : {'actif' if abonne else 'inactif'}")
```

---

## Boucle for

En Python, `for` itère sur n'importe quel itérable (liste, chaîne, dictionnaire...).

```python
# Itération sur une liste
fruits = ["pomme", "banane", "cerise"]
for fruit in fruits:
    print(fruit)

# Itération sur une chaîne
for lettre in "Python":
    print(lettre)

# Itération idiomatique Python : on évite les indices
# Mauvais style (style C)
for i in range(len(fruits)):
    print(fruits[i])

# Bon style Python
for fruit in fruits:
    print(fruit)
```

### range()

```python
for i in range(5):          # 0, 1, 2, 3, 4
    print(i)

for i in range(1, 6):       # 1, 2, 3, 4, 5
    print(i)

for i in range(0, 10, 2):   # 0, 2, 4, 6, 8
    print(i)

for i in range(10, 0, -1):  # 10, 9, 8, ..., 1
    print(i)
```

### enumerate()

Quand on a besoin de l'indice ET de la valeur :

```python
fruits = ["pomme", "banane", "cerise"]

# Mauvais style
for i in range(len(fruits)):
    print(i, fruits[i])

# Bon style avec enumerate
for i, fruit in enumerate(fruits):
    print(i, fruit)

# Démarrer à 1
for i, fruit in enumerate(fruits, start=1):
    print(f"{i}. {fruit}")
```

### zip()

Itérer sur plusieurs listes en parallèle :

```python
noms = ["Alice", "Bob", "Charlie"]
scores = [85, 92, 78]

for nom, score in zip(noms, scores):
    print(f"{nom} : {score}/100")

# zip s'arrête au plus court
# Pour lever une erreur si les longueurs diffèrent :
for nom, score in zip(noms, scores, strict=True):  # Python 3.10+
    print(f"{nom} : {score}")
```

---

## Boucle while

```python
compteur = 0
while compteur < 5:
    print(compteur)
    compteur += 1

# Boucle infinie avec break
while True:
    reponse = input("Entrez 'q' pour quitter : ")
    if reponse == "q":
        break
    print(f"Vous avez tapé : {reponse}")
```

---

## break, continue, pass

```python
# break : quitter la boucle
for i in range(10):
    if i == 5:
        break
    print(i)   # affiche 0, 1, 2, 3, 4

# continue : passer à l'itération suivante
for i in range(10):
    if i % 2 == 0:
        continue
    print(i)   # affiche 1, 3, 5, 7, 9

# pass : ne rien faire (placeholder)
for i in range(5):
    pass   # boucle vide, souvent utilisé pour du code à implémenter plus tard

# Clause else sur une boucle (peu connu mais utile)
for i in range(5):
    if i == 10:
        break
else:
    print("Boucle terminée sans break")   # s'affiche
```

---

## Piège : modifier une liste pendant l'itération

```python
# MAUVAIS : comportement imprévisible
nombres = [1, 2, 3, 4, 5]
for n in nombres:
    if n % 2 == 0:
        nombres.remove(n)   # modifie la liste en cours d'itération !
print(nombres)   # [1, 3, 5] ... parfois, mais pas toujours

# BON : itérer sur une copie
for n in nombres[:]:    # slice [:] crée une copie
    if n % 2 == 0:
        nombres.remove(n)

# ENCORE MIEUX : compréhension de liste (vu au module 6)
nombres = [n for n in nombres if n % 2 != 0]
```

---

## Bonnes pratiques

- Itérer directement sur l'itérable, pas sur `range(len(...))`
- Utiliser `enumerate()` quand l'indice est nécessaire
- Utiliser `zip()` pour les itérations parallèles
- Ne jamais modifier une liste pendant qu'on l'itère
- `pass` est un placeholder légitime pour les blocs vides

---

## Résumé

| Outil | Usage |
|---|---|
| `if/elif/else` | Branchement conditionnel |
| `for x in iterable` | Itération sur tout itérable |
| `range(n)` | Séquence de n entiers (0 à n-1) |
| `enumerate(lst)` | Indice + valeur simultanément |
| `zip(a, b)` | Itération parallèle sur deux séquences |
| `while condition` | Boucle tant que la condition est vraie |
| `break` | Sortir de la boucle |
| `continue` | Passer à l'itération suivante |

---

<!-- snippet
id: python_ctrl_enumerate
type: command
tech: python
level: beginner
importance: high
format: knowledge
tags: enumerate,boucle,indice
title: Itérer avec indice et valeur
command: for i, item in enumerate(liste, start=1):
description: enumerate() retourne un tuple (indice, valeur). Evite d'écrire range(len(liste)). start=1 pour commencer à 1.
-->

<!-- snippet
id: python_ctrl_zip
type: command
tech: python
level: beginner
importance: high
format: knowledge
tags: zip,iteration,parallele
title: Itérer sur deux listes en parallèle
command: for nom, score in zip(noms, scores):
description: zip() combine plusieurs itérables élément par élément. S'arrête au plus court. Utiliser strict=True (Python 3.10+) pour lever une erreur si longueurs différentes.
-->

<!-- snippet
id: python_ctrl_modify_while_iterate
type: warning
tech: python
level: beginner
importance: high
format: knowledge
tags: liste,iteration,modification,piege
title: Ne pas modifier une liste pendant son itération
content: Modifier une liste (remove, pop, append) pendant un for...in provoque des sauts d'éléments silencieux. Itérer sur une copie avec liste[:] ou reconstruire avec une compréhension.
description: Python avance l'indice interne après chaque itération. Si on supprime un élément, l'élément suivant est sauté sans erreur.
-->

<!-- snippet
id: python_ctrl_ternary
type: concept
tech: python
level: beginner
importance: medium
format: knowledge
tags: ternaire,condition,inline
title: Opérateur ternaire Python
content: La syntaxe est : valeur_si_vrai if condition else valeur_si_faux. Exemple : statut = "majeur" if age >= 18 else "mineur".
description: L'opérateur ternaire permet d'écrire une condition sur une ligne. Lisible pour des cas simples, à éviter si la logique est complexe.
-->

<!-- snippet
id: python_ctrl_for_else
type: concept
tech: python
level: beginner
importance: low
format: knowledge
tags: for,else,break
title: Clause else sur une boucle for
content: Le bloc else d'une boucle for s'exécute uniquement si la boucle s'est terminée sans break. Utile pour signaler qu'une recherche n'a rien trouvé.
description: Peu connu mais expressif : for...else permet de gérer le cas "aucun élément ne satisfait la condition" sans variable booléenne auxiliaire.
-->

<!-- snippet
id: python_ctrl_range_step
type: command
tech: python
level: beginner
importance: medium
format: knowledge
tags: range,boucle,pas
title: Boucle for avec step personnalisé
command: for i in range(0, 10, 2):
description: range(start, stop, step) génère une séquence de start à stop (exclu) avec un pas de step. Fonctionne aussi avec un pas négatif pour décompter.
-->
