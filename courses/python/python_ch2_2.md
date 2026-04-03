---
layout: page
title: "Compréhensions"

course: python
theme: "Intermédiaire"
type: lesson

chapter: 2
section: 2

tags: python,comprehension,liste,dict,set,generateur,filtre
difficulty: intermediate
duration: 25
mermaid: false

status: "published"
next_module: "/courses/python/python_ch2_3.html"
next_module_title: "Gestion des exceptions & fichiers"
---

# Compréhensions

## Objectifs pédagogiques

- Écrire des list comprehensions pour transformer et filtrer
- Construire des dict et set comprehensions
- Utiliser les expressions génératrices pour économiser la mémoire
- Reconnaître quand les compréhensions nuisent à la lisibilité

---

## Contexte

Les compréhensions sont une syntaxe concise pour construire des collections à partir d'un itérable existant. Elles remplacent avantageusement les boucles `for` + `.append()`. C'est l'une des features les plus appréciées de Python, à condition de ne pas en abuser.

---

## List comprehension

### Forme de base

```python
# Boucle classique
carres = []
for x in range(10):
    carres.append(x ** 2)

# Equivalent en list comprehension
carres = [x ** 2 for x in range(10)]
print(carres)   # [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]
```

### Forme générale

```
[expression for variable in iterable]
```

### Avec filtre (clause if)

```python
# Seulement les nombres pairs
pairs = [x for x in range(20) if x % 2 == 0]
print(pairs)   # [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]

# Mots de plus de 4 caractères en majuscules
mots = ["chat", "chien", "oiseau", "rat", "perroquet"]
longs = [mot.upper() for mot in mots if len(mot) > 4]
print(longs)   # ['CHIEN', 'OISEAU', 'PERROQUET']
```

### Avec condition ternaire dans l'expression

```python
# Remplacer les négatifs par 0
nombres = [-3, 1, -5, 8, 2, -1, 4]
positifs = [x if x > 0 else 0 for x in nombres]
print(positifs)   # [0, 1, 0, 8, 2, 0, 4]
```

---

## Dict comprehension

```python
# {clé: valeur for variable in iterable}
carres = {x: x ** 2 for x in range(6)}
print(carres)   # {0: 0, 1: 1, 2: 4, 3: 9, 4: 16, 5: 25}

# Inverser un dictionnaire (clés ↔ valeurs)
original = {"a": 1, "b": 2, "c": 3}
inverse = {v: k for k, v in original.items()}
print(inverse)   # {1: 'a', 2: 'b', 3: 'c'}

# Filtrer un dict
prix = {"pomme": 1.5, "truffe": 1200, "banane": 0.8, "caviar": 300}
abordable = {produit: p for produit, p in prix.items() if p < 10}
print(abordable)   # {'pomme': 1.5, 'banane': 0.8}
```

---

## Set comprehension

```python
# {expression for variable in iterable}
lettres = {lettre.lower() for lettre in "Bonjour LeMonDe"}
print(lettres)   # {'b', 'o', 'n', 'j', 'u', 'r', 'l', 'e', 'm', 'd', ' '}
# les doublons sont automatiquement supprimés

# Longueurs uniques des mots
mots = ["chat", "chien", "oiseau", "rat", "mouton"]
longueurs = {len(mot) for mot in mots}
print(longueurs)   # {3, 4, 5, 6}
```

---

## Expressions génératrices

Une expression génératrice ressemble à une list comprehension mais entre `()`. Elle ne crée pas la liste en mémoire, elle génère les éléments à la demande.

```python
# List comprehension : crée toute la liste en mémoire
carres_liste = [x ** 2 for x in range(1_000_000)]   # ~8 MB

# Expression génératrice : calcule à la demande
carres_gen = (x ** 2 for x in range(1_000_000))     # ~100 bytes

# Consommation avec une fonction
print(sum(x ** 2 for x in range(1_000_000)))   # pas besoin de []
print(max(len(mot) for mot in mots))
print(list(x for x in range(5)))   # convertir en liste si besoin
```

Quand utiliser un générateur plutôt qu'une liste :
- Quand on parcourt les éléments une seule fois
- Quand les données sont volumineuses
- Quand on passe directement le générateur à une fonction (`sum`, `max`, `any`, `all`)

---

## Compréhensions imbriquées

```python
# Aplatir une liste de listes
matrice = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
aplatie = [x for ligne in matrice for x in ligne]
print(aplatie)   # [1, 2, 3, 4, 5, 6, 7, 8, 9]

# Tableau de multiplication
table = [[i * j for j in range(1, 5)] for i in range(1, 5)]
for ligne in table:
    print(ligne)
```

Lire les compréhensions imbriquées dans l'ordre naturel :
`[x for ligne in matrice for x in ligne]`
= "pour chaque ligne dans matrice, pour chaque x dans ligne, prendre x"

---

## Quand ne pas utiliser les compréhensions

```python
# Trop imbriqué : illisible
resultat = [func(x) for x in [y ** 2 for y in [z + 1 for z in range(5)]]]
# Préférer une boucle ou plusieurs étapes

# Effets de bord : utilisez une boucle
[print(x) for x in range(5)]   # MAUVAIS : compréhension pour effet de bord
for x in range(5):              # BON
    print(x)

# Règle pratique : si la compréhension dépasse une ligne,
# envisager une boucle for classique
```

---

## Bonnes pratiques

- Les compréhensions doivent tenir sur une ligne (ou deux au max)
- Favoriser les expressions génératrices quand on n'a pas besoin d'une liste
- Ne jamais utiliser une compréhension pour ses effets de bord
- Nommer clairement la variable d'itération

---

## Résumé

| Syntaxe | Type résultant | Exemple |
|---|---|---|
| `[x for x in ...]` | `list` | `[x**2 for x in range(5)]` |
| `{k: v for k, v in ...}` | `dict` | `{x: x**2 for x in range(5)}` |
| `{x for x in ...}` | `set` | `{x%3 for x in range(10)}` |
| `(x for x in ...)` | `generator` | `sum(x**2 for x in range(5))` |

---

<!-- snippet
id: python_comp_list_filter
type: concept
tech: python
level: intermediate
importance: high
format: knowledge
tags: comprehension,liste,filtre
title: List comprehension avec filtre
content: [expression for var in iterable if condition] filtre les éléments. Exemple : [x for x in range(20) if x % 2 == 0] retourne les pairs de 0 à 18.
description: La clause if à la fin filtre les éléments avant d'appliquer l'expression. Ne pas confondre avec le ternaire dans l'expression qui transforme chaque élément.
-->

<!-- snippet
id: python_comp_dict
type: concept
tech: python
level: intermediate
importance: high
format: knowledge
tags: comprehension,dict
title: Dict comprehension pour transformer un dictionnaire
content: {k: v for k, v in dico.items()} transforme un dict. Exemple pour l'inverser : {v: k for k, v in dico.items()}. Filtrage possible avec if condition.
description: Les dict comprehensions remplacent les boucles for + dict[k] = v. Particulièrement utiles pour filtrer, transformer ou inverser un dictionnaire.
-->

<!-- snippet
id: python_comp_generator_sum
type: tip
tech: python
level: intermediate
importance: high
format: knowledge
tags: generateur,memoire,sum
title: Passer une expression génératrice à sum/max/any
content: sum(x**2 for x in range(1_000_000)) n'a pas besoin de créer la liste. La suppression des [] crée un générateur, économisant la mémoire.
description: Quand on passe une compréhension comme seul argument à sum(), max(), any(), all(), les [] sont optionnels et le générateur est plus efficace.
-->

<!-- snippet
id: python_comp_no_side_effects
type: warning
tech: python
level: intermediate
importance: high
format: knowledge
tags: comprehension,effets,bord
title: Ne pas utiliser une compréhension pour ses effets de bord
content: [print(x) for x in lst] construit une liste de None inutile. Utiliser une boucle for classique quand l'objectif est un effet de bord (print, append, write).
description: Les compréhensions sont faites pour construire une collection, pas pour exécuter du code. Une boucle for classique est plus lisible et honnête sur l'intention.
-->

<!-- snippet
id: python_comp_flatten
type: tip
tech: python
level: intermediate
importance: medium
format: knowledge
tags: comprehension,imbriquee,aplatir
title: Aplatir une liste de listes avec une compréhension
content: [x for sous_liste in matrice for x in sous_liste] aplatit une liste de listes. L'ordre des for suit l'ordre naturel de lecture.
description: La compréhension imbriquée se lit comme deux boucles for empilées. Si c'est plus complexe, utiliser itertools.chain.from_iterable().
-->
