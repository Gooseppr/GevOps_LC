---
layout: page
title: "Pièges classiques Python"

course: python
theme: "Avancé"
type: lesson

chapter: 3
section: 3

tags: python,pieges,bugs,mutable,closure,is,copie,string
difficulty: advanced
duration: 30
mermaid: false

status: "published"
next_module: ""
next_module_title: "Fin du parcours"
---

# Pièges classiques Python

## Objectifs pédagogiques

- Reconnaître et éviter les 8 pièges les plus courants de Python
- Comprendre le mécanisme sous-jacent de chaque piège
- Appliquer la correction idiomatique dans chaque cas

---

## Contexte

Python est un langage conçu pour la lisibilité, mais certains comportements contre-intuitifs surprennent régulièrement les développeurs, même expérimentés. Ces pièges ne déclenchent pas d'erreur immédiate : ils produisent des bugs silencieux qui apparaissent parfois des heures plus tard. Les comprendre en profondeur permet de les détecter à la lecture du code.

---

## Piège 1 : Mutable default argument

C'est le piège numéro 1 en Python. Les valeurs par défaut des fonctions sont évaluées **une seule fois** à la définition.

### Le piège

```python
def ajouter(element, liste=[]):
    liste.append(element)
    return liste

print(ajouter(1))   # [1]
print(ajouter(2))   # [1, 2]  ← la liste persiste !
print(ajouter(3))   # [1, 2, 3]
```

### Pourquoi

La liste `[]` est créée une seule fois quand Python lit la définition de la fonction. Elle vit dans `ajouter.__defaults__`. Chaque appel partage le même objet.

### Correction

```python
def ajouter(element, liste=None):
    if liste is None:
        liste = []
    liste.append(element)
    return liste

print(ajouter(1))   # [1]
print(ajouter(2))   # [2]
print(ajouter(3))   # [3]
```

S'applique à tout type mutable : `list`, `dict`, `set`.

---

## Piège 2 : Late binding dans les closures

### Le piège

```python
fonctions = []
for i in range(5):
    fonctions.append(lambda: i)

print([f() for f in fonctions])   # [4, 4, 4, 4, 4]  ← pas [0, 1, 2, 3, 4] !
```

### Pourquoi

Les lambdas capturent la variable `i` par référence, pas par valeur. Quand elles s'exécutent, la boucle est terminée et `i` vaut 4.

### Correction

```python
# Option 1 : argument par défaut (capturé par valeur)
fonctions = [lambda i=i: i for i in range(5)]
print([f() for f in fonctions])   # [0, 1, 2, 3, 4]

# Option 2 : factory function
def creer_fonction(n):
    return lambda: n

fonctions = [creer_fonction(i) for i in range(5)]
print([f() for f in fonctions])   # [0, 1, 2, 3, 4]
```

---

## Piège 3 : is vs == (identité vs égalité)

### Le piège

```python
a = 1000
b = 1000
print(a == b)    # True  ← compare les valeurs
print(a is b)    # False (ou True selon l'implémentation... !)
```

### Pourquoi

`is` compare l'identité (même objet en mémoire), `==` compare l'égalité des valeurs. Python met en cache les petits entiers (-5 à 256) et les chaînes courtes (interning), ce qui donne des résultats trompeusement vrais pour `is` avec ces valeurs.

```python
x = 256
y = 256
print(x is y)   # True  (entier mis en cache)

x = 257
y = 257
print(x is y)   # False (pas en cache)

# Avec les strings
a = "hello"
b = "hello"
print(a is b)   # True  (string interning)

a = "hello world"
b = "hello world"
print(a is b)   # Peut être True ou False selon le contexte !
```

### Correction

```python
# Utiliser == pour comparer des valeurs
print(a == b)       # toujours correct pour les valeurs

# Utiliser is uniquement pour None, True, False
if x is None:    # correct
    pass
if x == None:    # fonctionne mais déconseillé
    pass
```

---

## Piège 4 : Variables de boucle dans les closures

Extension du piège 2, très courant avec les interfaces graphiques et les callbacks.

### Le piège

```python
boutons = []
for i in range(5):
    # Imagine que c'est un bouton GUI
    action = lambda: print(f"Bouton {i}")
    boutons.append(action)

boutons[0]()   # affiche "Bouton 4" au lieu de "Bouton 0"
boutons[2]()   # affiche "Bouton 4"
```

### Correction

```python
boutons = []
for i in range(5):
    action = lambda i=i: print(f"Bouton {i}")
    boutons.append(action)

boutons[0]()   # Bouton 0
boutons[2]()   # Bouton 2
```

---

## Piège 5 : Modification de liste pendant l'itération

### Le piège

```python
nombres = [1, 2, 3, 4, 5, 6]
for n in nombres:
    if n % 2 == 0:
        nombres.remove(n)

print(nombres)   # [1, 3, 5]  ... parfois [1, 3, 4, 5] selon les valeurs !
```

### Pourquoi

Python maintient un indice interne. Quand on supprime `2` à l'indice 1, `3` passe à l'indice 1 et Python saute directement à l'indice 2 (`4`). Résultat : `3` n'est jamais testé.

```python
# Démonstration avec des doublons
nombres = [1, 2, 2, 3, 4]
for n in nombres:
    if n == 2:
        nombres.remove(n)
print(nombres)   # [1, 2, 3, 4]  ← un 2 survit !
```

### Correction

```python
# Option 1 : copie de la liste
for n in nombres[:]:   # ou list(nombres)
    if n % 2 == 0:
        nombres.remove(n)

# Option 2 : compréhension (recommandé)
nombres = [n for n in nombres if n % 2 != 0]
```

---

## Piège 6 : Copie superficielle de liste

### Le piège

```python
a = [1, 2, 3]
b = a           # b est un alias, PAS une copie
b.append(4)
print(a)        # [1, 2, 3, 4]  ← a est modifié !
```

### Pourquoi

L'assignation copie la référence, pas l'objet. `a` et `b` pointent vers la même liste en mémoire.

### Correction

```python
b = a.copy()    # copie superficielle
b = list(a)     # équivalent
b = a[:]        # slice = copie aussi

# Pour les structures imbriquées
import copy
b = copy.deepcopy(a)   # copie complète et récursive
```

---

## Piège 7 : Concaténation de strings en boucle

### Le piège

```python
# TRÈS LENT pour de grandes listes
texte = ""
for mot in liste_de_mots:
    texte += mot + " "   # crée une nouvelle string à chaque itération !
```

### Pourquoi

Les strings sont **immuables** en Python. `texte += mot` ne modifie pas `texte` : elle crée une nouvelle string de longueur (len(texte) + len(mot)) et assigne cette nouvelle string à `texte`. En boucle sur n mots, c'est O(n²) en mémoire et temps.

### Correction

```python
# Méthode recommandée : join
texte = " ".join(liste_de_mots)

# Si transformations nécessaires, accumuler dans une liste puis join
parties = []
for mot in liste_de_mots:
    parties.append(mot.strip().lower())
texte = " ".join(parties)

# Ou en compréhension
texte = " ".join(mot.strip().lower() for mot in liste_de_mots)
```

---

## Piège 8 : Exception trop large

### Le piège

```python
try:
    config = charger_config("config.json")
    connecter_base(config["db_url"])
    traiter_donnees()
except Exception:
    print("Une erreur est survenue")
    # Continue silencieusement...
```

### Pourquoi

Capturer `Exception` sans distinction avale toutes les erreurs : `FileNotFoundError`, `KeyError`, `ConnectionError`, `AttributeError`, erreurs de logique... Le programme continue dans un état potentiellement incohérent et le débogage devient un cauchemar.

### Correction

```python
import logging

try:
    config = charger_config("config.json")
except FileNotFoundError:
    logging.error("Fichier de configuration introuvable")
    raise   # ou sys.exit(1)
except json.JSONDecodeError as e:
    logging.error(f"Configuration JSON invalide : {e}")
    raise

try:
    connecter_base(config["db_url"])
except KeyError:
    logging.error("Clé 'db_url' absente de la configuration")
    raise
except ConnectionError as e:
    logging.error(f"Impossible de se connecter à la base : {e}")
    raise

# Si on doit capturer large, toujours logger le traceback complet
try:
    traiter_donnees()
except Exception:
    logging.exception("Erreur inattendue dans traiter_donnees")  # inclut le traceback
    raise
```

---

## Récapitulatif

| Piège | Cause | Correction |
|---|---|---|
| Mutable default arg | Valeur par défaut évaluée une fois | Utiliser `None` comme sentinelle |
| Late binding closure | Capture par référence | Argument par défaut `lambda i=i` |
| `is` vs `==` | Identité vs égalité | `is` pour `None`, `==` pour les valeurs |
| Variable de boucle en closure | Même cause que late binding | `lambda i=i` ou factory |
| Modifier liste en itération | Décalage des indices | Itérer sur une copie `lst[:]` |
| `b = a` pour copier | Copie de référence | `b = a.copy()` ou `deepcopy` |
| `+=` string en boucle | Strings immuables, O(n²) | `"".join(liste)` |
| `except Exception` large | Erreurs silencieuses | Capturer les exceptions spécifiques |

---

## Bonnes pratiques

- Activer les avertissements : `python -W all mon_script.py`
- Utiliser un linter (ruff, flake8) pour détecter certains de ces pièges
- Les tests unitaires révèlent ces bugs tôt
- Relire le code en pensant "que se passe-t-il si cette variable est None / vide / partagée ?"

---

<!-- snippet
id: python_trap_mutable_default
type: warning
tech: python
level: advanced
importance: high
format: knowledge
tags: piege,mutable,default,argument
title: Mutable default argument : la liste persiste entre les appels
content: def f(lst=[]): liste est créée une fois à la définition. Chaque appel partage le même objet. Corriger avec def f(lst=None): if lst is None: lst = [].
description: Les valeurs par défaut vivent dans f.__defaults__. Un objet mutable comme [] est réutilisé à chaque appel au lieu d'être recréé.
-->

<!-- snippet
id: python_trap_late_binding
type: warning
tech: python
level: advanced
importance: high
format: knowledge
tags: piege,closure,late_binding,lambda
title: Late binding : la closure capture i par référence
content: [lambda: i for i in range(5)] retourne 5 fois la valeur finale de i. Corriger avec lambda i=i: i pour capturer la valeur au moment de la création.
description: Les closures capturent les variables par référence. Au moment de l'appel, la boucle est terminée et i vaut sa dernière valeur. L'argument par défaut force la capture par valeur.
-->

<!-- snippet
id: python_trap_is_vs_eq
type: warning
tech: python
level: advanced
importance: high
format: knowledge
tags: piege,is,egalite,identite
title: is compare l'identité, == compare la valeur
content: Utiliser == pour comparer des valeurs. Réserver is à None, True, False. Python met en cache les petits entiers et certaines strings, ce qui rend is parfois trompeusement vrai.
description: a is b retourne True uniquement si a et b sont le même objet en mémoire (même id()). Pour les entiers > 256 ou les strings construites dynamiquement, is peut retourner False même si les valeurs sont égales.
-->

<!-- snippet
id: python_trap_string_concat_loop
type: warning
tech: python
level: advanced
importance: high
format: knowledge
tags: piege,string,concatenation,performance
title: Ne pas concaténer des strings avec += en boucle
content: Chaque += crée une nouvelle string. En boucle, c'est O(n²). Accumuler dans une liste et utiliser "".join(liste) pour une opération O(n).
description: Les strings sont immuables. texte += mot crée un nouvel objet à chaque itération. Pour 10 000 mots, += prend ~100ms, "".join() prend ~1ms.
-->

<!-- snippet
id: python_trap_modify_list_iteration
type: warning
tech: python
level: advanced
importance: high
format: knowledge
tags: piege,liste,iteration,modification
title: Modifier une liste pendant son itération saute des éléments
content: Supprimer des éléments dans un for décale les indices et fait sauter des éléments silencieusement. Itérer sur lst[:] (copie) ou reconstruire avec une compréhension.
description: Python avance l'indice interne après chaque itération. Si on supprime l'élément à l'indice courant, le suivant devient le courant et est ignoré.
-->

<!-- snippet
id: python_trap_bare_reference
type: warning
tech: python
level: advanced
importance: high
format: knowledge
tags: piege,copie,reference,alias
title: b = a ne copie pas une liste, c'est un alias
content: b = a crée un alias : a et b pointent vers le même objet. Modifier b modifie a. Utiliser b = a.copy() pour une copie superficielle, copy.deepcopy(a) pour les structures imbriquées.
description: En Python, l'assignation copie la référence, pas l'objet. Toutes les structures mutables (list, dict, set) sont touchées par ce comportement.
-->
