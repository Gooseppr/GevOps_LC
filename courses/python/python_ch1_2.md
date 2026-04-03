---
layout: page
title: "Syntaxe de base & types"

course: python
theme: "Fondations"
type: lesson

chapter: 1
section: 2

tags: python,variables,types,syntaxe,fstrings,operateurs
difficulty: beginner
duration: 30
mermaid: false

status: "published"
next_module: "/courses/python/python_ch1_3.html"
next_module_title: "Structures de contrôle"
---

# Syntaxe de base & types

## Objectifs pédagogiques

- Déclarer des variables en Python sans mot-clé explicite
- Connaître les types primitifs : `int`, `float`, `str`, `bool`, `None`
- Utiliser `print()`, les f-strings et les opérateurs de base
- Vérifier et inspecter le type d'une valeur avec `type()` et `isinstance()`
- Comprendre les pièges des flottants et des valeurs falsy

---

## Contexte

Python est un langage à typage dynamique. On n'écrit pas `int x = 5` comme en Java ou C. On écrit simplement `x = 5` et Python infère le type. C'est une force (concision) et une source de bugs (le type peut changer silencieusement).

---

## Variables et nommage

```python
# Pas de mot-clé de déclaration
compteur = 0
nom_utilisateur = "Alice"
est_actif = True
valeur_nulle = None

# Convention Python : snake_case pour les variables et fonctions
# PascalCase pour les classes
# MAJUSCULES pour les constantes
MAX_TENTATIVES = 3
```

Python est sensible à la casse : `Compteur` et `compteur` sont deux variables différentes.

---

## Types primitifs

### int et float

```python
age = 30               # int
prix = 19.99           # float
grand_nombre = 1_000_000  # underscore autorisé pour la lisibilité

# Opérations
print(10 / 3)    # 3.3333... (division retourne toujours un float)
print(10 // 3)   # 3 (division entière)
print(10 % 3)    # 1 (modulo)
print(2 ** 8)    # 256 (puissance)
```

### str

```python
prenom = "Alice"
message = 'Bonjour'   # guillemets simples ou doubles, équivalents

# Chaîne multi-lignes
texte = """
Première ligne
Deuxième ligne
"""

# Concaténation
salutation = "Bonjour " + prenom   # déconseillé en boucle

# Longueur
print(len(prenom))   # 5
```

### bool

```python
vrai = True
faux = False

# Opérateurs logiques
print(True and False)  # False
print(True or False)   # True
print(not True)        # False
```

### None

`None` représente l'absence de valeur. C'est un objet unique (singleton).

```python
resultat = None
print(resultat is None)   # True  ← syntaxe recommandée
print(resultat == None)   # True  ← fonctionne mais déconseillé
```

---

## f-strings (Python 3.6+)

Les f-strings sont le moyen moderne et lisible de formater des chaînes.

```python
nom = "Alice"
age = 30
score = 18.5678

print(f"Bonjour {nom}, tu as {age} ans.")
print(f"Score : {score:.2f}")          # 2 décimales → 18.57
print(f"En majuscules : {nom.upper()}")
print(f"Calcul : {2 ** 10}")           # expressions autorisées → 1024

# Debug (Python 3.8+)
valeur = 42
print(f"{valeur=}")    # affiche : valeur=42
```

---

## Inspecter les types

```python
x = 42
print(type(x))              # <class 'int'>
print(type(x).__name__)     # int

# isinstance est préféré pour les vérifications
print(isinstance(x, int))           # True
print(isinstance(x, (int, float)))  # True si l'un ou l'autre
```

---

## Valeurs falsy

En Python, certaines valeurs sont considérées comme "fausses" dans un contexte booléen :

```python
# Valeurs falsy
False, None, 0, 0.0, "", [], {}, ()

# Exemples
if not "":
    print("Chaîne vide est falsy")   # s'affiche

if not []:
    print("Liste vide est falsy")    # s'affiche

if not 0:
    print("Zéro est falsy")          # s'affiche
```

---

## Le piège des flottants

```python
print(0.1 + 0.2)          # 0.30000000000000004
print(0.1 + 0.2 == 0.3)   # False !

# Solution : comparer avec une tolérance
import math
print(math.isclose(0.1 + 0.2, 0.3))   # True

# Ou utiliser Decimal pour la précision financière
from decimal import Decimal
print(Decimal("0.1") + Decimal("0.2"))  # 0.3
```

Les flottants sont stockés en binaire selon la norme IEEE 754. Certaines fractions décimales n'ont pas de représentation binaire exacte.

---

## Conversion de types

```python
# Conversions explicites (cast)
print(int("42"))         # 42
print(float("3.14"))     # 3.14
print(str(100))          # "100"
print(bool(0))           # False
print(bool("hello"))     # True

# Piège
print(int(3.9))   # 3  (tronqué, pas arrondi !)
```

---

## Bonnes pratiques

- Utiliser `snake_case` pour toutes les variables et fonctions
- Préférer `isinstance(x, int)` à `type(x) == int` (plus robuste à l'héritage)
- Tester `None` avec `is None`, pas `== None`
- Ne jamais comparer des flottants avec `==`, utiliser `math.isclose()`
- Utiliser les f-strings plutôt que `%` ou `.format()`

---

## Résumé

| Type | Exemple | Falsy si |
|---|---|---|
| `int` | `42` | `0` |
| `float` | `3.14` | `0.0` |
| `str` | `"hello"` | `""` |
| `bool` | `True` | `False` |
| `None` | `None` | toujours |

---

<!-- snippet
id: python_types_fstring_basic
type: command
tech: python
level: beginner
importance: high
format: knowledge
tags: fstring,formatage,affichage
title: Formater une chaîne avec une f-string
command: f"Bonjour {nom}, tu as {age} ans."
description: Les f-strings évaluent les expressions entre accolades au moment de l'exécution. Disponibles depuis Python 3.6.
-->

<!-- snippet
id: python_types_isinstance
type: command
tech: python
level: beginner
importance: medium
format: knowledge
tags: type,verification,isinstance
title: Vérifier le type d'une variable
command: isinstance(x, (int, float))
description: isinstance() accepte un tuple de types. Préféré à type(x) == int car compatible avec l'héritage de classes.
-->

<!-- snippet
id: python_types_float_trap
type: warning
tech: python
level: beginner
importance: high
format: knowledge
tags: float,precision,comparaison
title: Ne pas comparer des flottants avec ==
content: 0.1 + 0.2 == 0.3 retourne False à cause de la représentation binaire IEEE 754. Utiliser math.isclose() ou Decimal.
description: Les flottants ne sont pas stockés exactement en binaire. 0.1 + 0.2 donne 0.30000000000000004, jamais 0.3 exactement.
-->

<!-- snippet
id: python_types_none_comparison
type: tip
tech: python
level: beginner
importance: medium
format: knowledge
tags: none,comparaison,identite
title: Comparer à None avec is, pas ==
content: Utiliser `x is None` plutôt que `x == None`. C'est plus explicite et évite les surprises avec les objets qui surchargent ==.
description: None est un singleton. L'opérateur `is` vérifie l'identité (même objet en mémoire), ce qui est le test correct pour None.
-->

<!-- snippet
id: python_types_int_truncation
type: warning
tech: python
level: beginner
importance: medium
format: knowledge
tags: int,conversion,troncature
title: int() tronque, il n'arrondit pas
content: int(3.9) retourne 3, pas 4. La conversion vers int tronque vers zéro. Utiliser round() pour arrondir.
description: int() supprime la partie décimale sans arrondir. Pour 3.9 → 4, utiliser round(3.9) ou math.ceil(3.9).
-->

<!-- snippet
id: python_types_falsy_values
type: concept
tech: python
level: beginner
importance: high
format: knowledge
tags: falsy,bool,condition
title: Valeurs falsy en Python
content: Sont falsy : False, None, 0, 0.0, "", [], {}, (). Tout le reste est truthy. Permet d'écrire if liste: au lieu de if len(liste) > 0.
description: Python évalue ces valeurs à False dans un contexte booléen. Connaître les valeurs falsy évite des conditions verbeuses inutiles.
-->

<!-- snippet
id: python_types_division
type: concept
tech: python
level: beginner
importance: medium
format: knowledge
tags: division,operateurs,entier
title: Différence entre / et // en Python
content: L'opérateur / retourne toujours un float (10/2 = 5.0). L'opérateur // effectue la division entière (10//3 = 3). % donne le reste (10%3 = 1).
description: En Python 3, la division / est toujours flottante. Utiliser // pour une division entière, % pour le modulo.
-->
