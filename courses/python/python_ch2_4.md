---
layout: page
title: "Modules & packages"

course: python
theme: "Intermédiaire"
type: lesson

chapter: 2
section: 4

tags: python,modules,packages,import,stdlib,pyproject
difficulty: intermediate
duration: 30
mermaid: false

status: "published"
next_module: "/courses/python/python_ch2_5.html"
next_module_title: "Programmation Orientée Objet"
---

# Modules & packages

## Objectifs pédagogiques

- Importer des modules avec `import`, `from...import` et les alias `as`
- Comprendre la structure d'un package Python (`__init__.py`)
- Connaître les modules les plus utiles de la bibliothèque standard
- Utiliser le guard `if __name__ == "__main__"`
- Éviter les imports circulaires

---

## Contexte

Un module est simplement un fichier `.py`. Un package est un dossier contenant un `__init__.py`. La bibliothèque standard Python regroupe plus de 200 modules couvrant la grande majorité des besoins courants : fichiers, réseau, JSON, dates, expressions régulières, etc. Avant d'installer un package tiers, il vaut la peine de vérifier si la stdlib ne suffit pas.

---

## Import de modules

```python
# Import complet
import os
import sys
import json

print(os.getcwd())           # répertoire courant
print(sys.version)           # version Python
print(sys.platform)          # 'linux', 'darwin', 'win32'

# Import avec alias
import numpy as np            # convention
import pandas as pd           # convention
import matplotlib.pyplot as plt  # convention

# Import sélectif
from os import getcwd, listdir
from pathlib import Path
from datetime import datetime, timedelta

# Import de tout (déconseillé)
from os import *   # pollue le namespace local, éviter
```

---

## Modules essentiels de la stdlib

### os et sys

```python
import os
import sys

# os : interaction avec le système d'exploitation
os.getcwd()                    # répertoire courant
os.listdir(".")                # liste les fichiers
os.makedirs("dossier/sous", exist_ok=True)
os.path.join("a", "b", "c")   # jointure de chemin (préférer pathlib)
os.environ.get("HOME")         # variable d'environnement

# sys : interaction avec l'interpréteur Python
sys.argv          # arguments de ligne de commande
sys.exit(1)       # quitter le script avec un code de retour
sys.path          # liste des chemins de recherche des modules
```

### datetime

```python
from datetime import datetime, date, timedelta

maintenant = datetime.now()
print(maintenant.strftime("%Y-%m-%d %H:%M:%S"))   # formatage

hier = maintenant - timedelta(days=1)
dans_un_mois = maintenant + timedelta(days=30)

# Parsing
d = datetime.strptime("2024-03-15", "%Y-%m-%d")

# Comparaison
print(maintenant > hier)   # True
```

### re (expressions régulières)

```python
import re

texte = "Contactez-nous au 06-12-34-56-78 ou 01.23.45.67.89"

# Recherche
match = re.search(r"\d{2}[-. ]\d{2}[-. ]\d{2}[-. ]\d{2}[-. ]\d{2}", texte)
if match:
    print(match.group())   # 06-12-34-56-78

# Toutes les occurrences
numeros = re.findall(r"\d{2}[-. ]\d{2}[-. ]\d{2}[-. ]\d{2}[-. ]\d{2}", texte)

# Substitution
propre = re.sub(r"\s+", " ", "texte   avec    espaces")   # normalise espaces
```

### collections

```python
from collections import Counter, defaultdict, namedtuple, deque

# Counter : compter des occurrences
votes = ["Alice", "Bob", "Alice", "Charlie", "Alice", "Bob"]
c = Counter(votes)
print(c)                    # Counter({'Alice': 3, 'Bob': 2, 'Charlie': 1})
print(c.most_common(2))     # [('Alice', 3), ('Bob', 2)]

# defaultdict : dict avec valeur par défaut
from collections import defaultdict
groupes = defaultdict(list)
for etudiant, note in [("Alice", 85), ("Bob", 90), ("Alice", 78)]:
    groupes[etudiant].append(note)

# namedtuple : tuple avec des champs nommés
Point = namedtuple("Point", ["x", "y"])
p = Point(3, 4)
print(p.x, p.y)    # plus lisible que p[0], p[1]

# deque : file double (append/pop des deux côtés en O(1))
file = deque(maxlen=3)   # file circulaire de taille 3
file.append(1)
file.appendleft(0)
```

### functools

```python
from functools import lru_cache, partial, reduce

# lru_cache : mémoïsation automatique
@lru_cache(maxsize=128)
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(100))   # rapide grâce au cache

# partial : fixer des arguments d'une fonction
from functools import partial

def puissance(base, exposant):
    return base ** exposant

carre = partial(puissance, exposant=2)
cube = partial(puissance, exposant=3)
print(carre(5))    # 25
print(cube(3))     # 27
```

---

## Structure d'un package

```
mon_projet/
├── pyproject.toml
├── README.md
├── src/
│   └── mon_package/
│       ├── __init__.py      ← rend le dossier importable
│       ├── utils.py
│       ├── models.py
│       └── sous_package/
│           ├── __init__.py
│           └── helpers.py
└── tests/
    └── test_utils.py
```

```python
# mon_package/__init__.py
# Peut être vide, ou exposer l'API publique du package
from .utils import fonction_utile
from .models import MonModele

__all__ = ["fonction_utile", "MonModele"]
```

---

## if __name__ == "__main__"

Chaque fichier Python a un attribut `__name__`. Quand on l'exécute directement, `__name__` vaut `"__main__"`. Quand il est importé, `__name__` vaut le nom du module.

```python
# utils.py

def calculer(x):
    return x ** 2

def main():
    print(calculer(5))

if __name__ == "__main__":
    # Ce code ne s'exécute que si on lance : python utils.py
    # Il ne s'exécute PAS quand on fait : import utils
    main()
```

C'est la façon idiomatique d'écrire des scripts Python réutilisables.

---

## Imports circulaires

```python
# PROBLÈME : a.py importe b, b.py importe a → ImportError

# a.py
from b import fonc_b   # b n'est pas encore chargé !

# b.py
from a import fonc_a
```

Solutions :
1. **Restructurer** : extraire le code partagé dans un troisième module `commun.py`
2. **Import local** : déplacer l'import à l'intérieur de la fonction qui en a besoin
3. **Import de module** : `import b` au lieu de `from b import fonc_b`

---

## pyproject.toml

Fichier de configuration moderne pour les projets Python (PEP 517/518) :

```toml
[build-system]
requires = ["setuptools>=68", "wheel"]
build-backend = "setuptools.backends.legacy:build"

[project]
name = "mon-package"
version = "1.0.0"
description = "Mon super package"
requires-python = ">=3.11"
dependencies = [
    "requests>=2.31",
    "pydantic>=2.0",
]

[project.optional-dependencies]
dev = ["pytest", "ruff", "mypy"]
```

---

## Bonnes pratiques

- Regrouper les imports en trois blocs séparés par une ligne vide : stdlib, tiers, locaux
- Utiliser des alias conventionnels (`np`, `pd`, `plt`)
- Ne jamais faire `from module import *`
- Toujours utiliser le guard `if __name__ == "__main__"` dans les scripts
- Éviter les imports circulaires par une bonne architecture

---

## Résumé

| Module stdlib | Usage principal |
|---|---|
| `os`, `sys` | Système, processus |
| `pathlib` | Chemins de fichiers |
| `json` | Sérialisation JSON |
| `datetime` | Dates et durées |
| `re` | Expressions régulières |
| `collections` | Structures avancées |
| `functools` | Outils fonctionnels |
| `itertools` | Itérateurs avancés |

---

<!-- snippet
id: python_mod_import_as
type: command
tech: python
level: intermediate
importance: high
format: knowledge
tags: import,alias,module
title: Importer un module avec un alias
command: import numpy as np
description: L'alias évite les noms longs répétitifs. Les conventions communautaires : numpy → np, pandas → pd, matplotlib.pyplot → plt.
-->

<!-- snippet
id: python_mod_name_main
type: concept
tech: python
level: intermediate
importance: high
format: knowledge
tags: __name__,__main__,script
title: Guard if __name__ == "__main__"
content: Quand un fichier .py est exécuté directement, __name__ vaut "__main__". Quand il est importé, __name__ vaut le nom du module. Ce guard permet d'avoir du code qui ne s'exécute qu'en script.
description: Indispensable pour les modules réutilisables avec un comportement de script. Le code de test/démonstration doit toujours être dans ce bloc.
-->

<!-- snippet
id: python_mod_lru_cache
type: command
tech: python
level: intermediate
importance: medium
format: knowledge
tags: functools,cache,memoisation
title: Mémoïser une fonction récursive avec lru_cache
command: "@lru_cache(maxsize=128)\ndef fibonacci(n): ..."
description: @lru_cache stocke les résultats des appels précédents. Transforme fibonacci(100) de O(2^n) à O(n). Depuis Python 3.9, @cache est équivalent sans limite.
-->

<!-- snippet
id: python_mod_defaultdict
type: tip
tech: python
level: intermediate
importance: medium
format: knowledge
tags: collections,defaultdict,groupement
title: Grouper des éléments avec defaultdict
content: defaultdict(list) initialise automatiquement une liste vide pour les nouvelles clés. Evite le pattern if cle not in dico: dico[cle] = [].
description: collections.defaultdict prend un callable en argument. defaultdict(list) pour des listes, defaultdict(int) pour des compteurs, defaultdict(set) pour des ensembles.
-->

<!-- snippet
id: python_mod_counter
type: command
tech: python
level: intermediate
importance: medium
format: knowledge
tags: collections,counter,frequence
title: Compter les occurrences avec Counter
command: Counter(liste).most_common(5)
description: Counter retourne un dict-like avec les fréquences. most_common(n) retourne les n éléments les plus fréquents. S'additionne avec +, se soustrait avec -.
-->

<!-- snippet
id: python_mod_circular_import
type: warning
tech: python
level: intermediate
importance: high
format: knowledge
tags: import,circulaire,architecture
title: Éviter les imports circulaires
content: Si a.py importe b et b.py importe a, Python lève ImportError. Solution : extraire le code partagé dans un module tiers, ou utiliser des imports locaux dans les fonctions.
description: Les imports circulaires révèlent un problème architectural. La solution propre est de repenser les dépendances, pas de contourner avec des imports tardifs.
-->
