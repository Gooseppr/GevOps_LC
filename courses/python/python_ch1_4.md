---
layout: page
title: "Fonctions"

course: python
theme: "Fondations"
type: lesson

chapter: 1
section: 4

tags: python,fonctions,def,args,kwargs,lambda,portee,LEGB
difficulty: beginner
duration: 35
mermaid: false

status: "published"
next_module: "/courses/python/python_ch2_1.html"
next_module_title: "Structures de données"
---

# Fonctions

## Objectifs pédagogiques

- Définir et appeler une fonction avec `def`
- Maîtriser les paramètres positionnels, nommés, `*args` et `**kwargs`
- Comprendre la portée des variables (règle LEGB)
- Utiliser les fonctions lambda pour les cas simples
- Éviter le piège critique des arguments mutables par défaut

---

## Contexte

Les fonctions sont le premier outil de réutilisabilité du code. Elles permettent de nommer un bloc de logique, de l'isoler et de le tester indépendamment. En Python, les fonctions sont des objets de première classe : on peut les passer en argument, les retourner, les stocker dans des variables.

---

## Définir une fonction

```python
def saluer(nom):
    """Retourne un message de salutation."""
    return f"Bonjour, {nom} !"

message = saluer("Alice")
print(message)   # Bonjour, Alice !
```

La docstring (entre triple guillemets) documente la fonction. Elle est accessible via `help(saluer)` ou `saluer.__doc__`.

### Retour de valeurs

```python
def diviser(a, b):
    if b == 0:
        return None   # retour explicite de None
    return a / b

# Retour multiple (tuple)
def min_max(lst):
    return min(lst), max(lst)

minimum, maximum = min_max([3, 1, 4, 1, 5, 9])
print(minimum, maximum)   # 1 9
```

---

## Paramètres par défaut

```python
def saluer(nom, politesse="Bonjour"):
    return f"{politesse}, {nom} !"

print(saluer("Alice"))              # Bonjour, Alice !
print(saluer("Bob", "Bonsoir"))     # Bonsoir, Bob !
print(saluer("Charlie", politesse="Salut"))  # Salut, Charlie !
```

Les paramètres avec valeur par défaut doivent être après les paramètres obligatoires.

---

## Arguments positionnels et nommés

```python
def creer_profil(nom, age, ville="Paris"):
    return {"nom": nom, "age": age, "ville": ville}

# Appel positionnel
creer_profil("Alice", 30)

# Appel nommé (keyword arguments)
creer_profil(age=30, nom="Alice")   # l'ordre ne compte pas

# Mélange : positionnels d'abord
creer_profil("Alice", 30, ville="Lyon")
```

---

## *args et **kwargs

`*args` capture tous les arguments positionnels supplémentaires dans un tuple.
`**kwargs` capture tous les arguments nommés supplémentaires dans un dict.

```python
def additionner(*args):
    """Additionne un nombre arbitraire d'arguments."""
    return sum(args)

print(additionner(1, 2, 3))         # 6
print(additionner(1, 2, 3, 4, 5))   # 15


def afficher_infos(**kwargs):
    """Affiche des paires clé=valeur."""
    for cle, valeur in kwargs.items():
        print(f"  {cle}: {valeur}")

afficher_infos(nom="Alice", age=30, ville="Paris")


# Combinaison complète
def ma_fonction(obligatoire, *args, **kwargs):
    print(f"Obligatoire: {obligatoire}")
    print(f"Args: {args}")
    print(f"Kwargs: {kwargs}")

ma_fonction("A", "B", "C", x=1, y=2)
# Obligatoire: A
# Args: ('B', 'C')
# Kwargs: {'x': 1, 'y': 2}
```

### Dépack dans les appels

```python
def point(x, y, z):
    print(f"x={x}, y={y}, z={z}")

coords = [1, 2, 3]
point(*coords)   # dépack une liste

config = {"x": 10, "y": 20, "z": 30}
point(**config)  # dépack un dict
```

---

## Portée des variables : règle LEGB

Python résout les noms de variables selon l'ordre **L-E-G-B** :

- **L**ocal : à l'intérieur de la fonction
- **E**nclosing : dans la fonction parente (closures)
- **G**lobal : au niveau du module
- **B**uilt-in : noms intégrés Python (`len`, `print`, etc.)

```python
x = "global"

def externe():
    x = "enclosing"

    def interne():
        # x = "local"   # si décommenté, utilise le local
        print(x)        # utilise "enclosing"

    interne()

externe()   # affiche : enclosing
```

```python
compteur = 0

def incrementer():
    global compteur    # déclare qu'on modifie la variable globale
    compteur += 1

incrementer()
print(compteur)   # 1
```

Éviter `global` autant que possible. Préférer retourner la valeur et réassigner.

---

## Fonctions lambda

Les lambdas sont des fonctions anonymes à expression unique.

```python
# Équivalent
def doubler(x):
    return x * 2

doubler = lambda x: x * 2

# Usage typique : comme argument de sorted/map/filter
nombres = [3, 1, 4, 1, 5, 9]
print(sorted(nombres, reverse=True))   # [9, 5, 4, 3, 1, 1]

personnes = [("Alice", 30), ("Bob", 25), ("Charlie", 35)]
print(sorted(personnes, key=lambda p: p[1]))   # tri par âge
```

Les lambdas ne peuvent contenir qu'une expression, pas de `if/else` multi-lignes ni de `return`.

---

## Le piège critique : mutable default argument

C'est l'un des pièges les plus célèbres de Python.

```python
# MAUVAIS : la liste est créée UNE SEULE FOIS à la définition de la fonction
def ajouter_element(element, liste=[]):
    liste.append(element)
    return liste

print(ajouter_element(1))   # [1]
print(ajouter_element(2))   # [1, 2]  ← la liste persiste entre les appels !
print(ajouter_element(3))   # [1, 2, 3]  ← toujours la même liste !
```

```python
# BON : utiliser None comme sentinelle
def ajouter_element(element, liste=None):
    if liste is None:
        liste = []    # nouvelle liste à chaque appel
    liste.append(element)
    return liste

print(ajouter_element(1))   # [1]
print(ajouter_element(2))   # [2]   ← liste fraîche
```

Ce piège s'applique à tout type mutable : `list`, `dict`, `set`.

---

## Bonnes pratiques

- Écrire une docstring pour toute fonction publique
- Une fonction = une responsabilité (principe de responsabilité unique)
- Noms de fonctions en `snake_case` avec un verbe : `calculer_total()`, `charger_fichier()`
- Utiliser `None` comme valeur par défaut pour les arguments mutables
- Éviter les variables `global` : préférer les paramètres et les retours

---

## Résumé

| Concept | Syntaxe | Rôle |
|---|---|---|
| Définir | `def f(x):` | Déclare une fonction |
| Retour | `return valeur` | Retourne une valeur |
| Défaut | `def f(x=10):` | Paramètre optionnel |
| Variadic | `*args` | Tuple des args positionnels |
| Variadic nommés | `**kwargs` | Dict des args nommés |
| Lambda | `lambda x: x*2` | Fonction anonyme courte |
| Global | `global x` | Modifier une variable globale |

---

<!-- snippet
id: python_func_mutable_default_arg
type: warning
tech: python
level: beginner
importance: high
format: knowledge
tags: fonctions,parametres,mutable,piege
title: Piège : argument mutable par défaut
content: def f(lst=[]): persiste la liste entre les appels. Utiliser def f(lst=None): puis if lst is None: lst = []. S'applique aussi aux dicts et sets.
description: Les valeurs par défaut sont évaluées une seule fois à la définition. Un objet mutable comme [] est partagé entre tous les appels.
-->

<!-- snippet
id: python_func_args_kwargs
type: concept
tech: python
level: beginner
importance: high
format: knowledge
tags: args,kwargs,variadic
title: *args et **kwargs pour arguments variables
content: *args capture les arguments positionnels en excès dans un tuple. **kwargs capture les arguments nommés en excès dans un dict. Peuvent être combinés.
description: Permettent d'écrire des fonctions flexibles acceptant un nombre arbitraire d'arguments. Très utilisés dans les décorateurs et les API.
-->

<!-- snippet
id: python_func_unpack_call
type: command
tech: python
level: beginner
importance: medium
format: knowledge
tags: depack,appel,liste,dict
title: Dépacker une liste ou un dict lors d'un appel
command: fonction(*liste)  # ou fonction(**dict)
description: L'opérateur * décompresse une liste en arguments positionnels. ** décompresse un dict en arguments nommés. Pratique pour les fonctions à signature fixe.
-->

<!-- snippet
id: python_func_return_multiple
type: concept
tech: python
level: beginner
importance: medium
format: knowledge
tags: return,tuple,multiple
title: Retourner plusieurs valeurs via un tuple
content: return a, b retourne implicitement un tuple. L'appelant peut dépacker avec min_val, max_val = ma_fonction(). C'est la façon idiomatique Python.
description: Python ne supporte pas nativement le retour multiple, mais les tuples permettent d'en simuler l'effet de façon élégante.
-->

<!-- snippet
id: python_func_legb_global
type: warning
tech: python
level: beginner
importance: medium
format: knowledge
tags: portee,global,LEGB
title: Utiliser global pour modifier une variable de module
content: Sans le mot-clé global, assigner dans une fonction crée une variable locale. global x déclare qu'on veut modifier la variable x du module.
description: Si on écrit x = x + 1 dans une fonction sans global x, Python lève UnboundLocalError car il voit x comme locale mais non initialisée.
-->

<!-- snippet
id: python_func_lambda_sort
type: tip
tech: python
level: beginner
importance: medium
format: knowledge
tags: lambda,sort,key
title: Utiliser lambda comme clé de tri
content: sorted(personnes, key=lambda p: p[1]) trie une liste de tuples par le second élément. Plus lisible que d'écrire une fonction séparée pour un critère simple.
description: Les lambdas sont idiomatiques comme argument key= de sorted(), min(), max(). Pour des critères complexes, préférer une vraie fonction nommée.
-->
