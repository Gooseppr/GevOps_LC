---
layout: page
title: "Structures de données"

course: python
theme: "Intermédiaire"
type: lesson

chapter: 2
section: 1

tags: python,liste,tuple,dict,set,slicing,copie,deepcopy
difficulty: intermediate
duration: 40
mermaid: false

status: "published"
next_module: "/courses/python/python_ch2_2.html"
next_module_title: "Compréhensions"
---

# Structures de données

## Objectifs pédagogiques

- Manipuler les quatre structures natives : listes, tuples, dictionnaires, sets
- Utiliser le slicing pour extraire des sous-séquences
- Comprendre l'immuabilité des tuples et l'unpacking
- Connaître les opérations clés sur les dicts (get, setdefault, update)
- Différencier copie superficielle et copie profonde

---

## Contexte

Python propose quatre structures de données fondamentales. Choisir la bonne structure est crucial pour la lisibilité et la performance. Une liste non ordonnée avec des recherches fréquentes devrait être un set ; un ensemble de clés fixes devrait être un tuple ou un dataclass, pas un dict.

---

## Listes

La liste est ordonnée, mutable, et accepte des doublons.

```python
fruits = ["pomme", "banane", "cerise"]

# Accès par indice (commence à 0)
print(fruits[0])    # pomme
print(fruits[-1])   # cerise (dernier élément)

# Modification
fruits[1] = "mangue"

# Ajout
fruits.append("kiwi")          # en fin
fruits.insert(1, "fraise")     # à l'indice 1
fruits.extend(["poire", "abricot"])  # ajoute plusieurs éléments

# Suppression
fruits.remove("pomme")   # supprime la première occurrence
dernier = fruits.pop()   # supprime et retourne le dernier
element = fruits.pop(0)  # supprime et retourne l'indice 0
del fruits[0]            # supprime sans retourner

# Recherche
print("banane" in fruits)       # True/False
print(fruits.index("cerise"))   # indice de la première occurrence
print(fruits.count("pomme"))    # nombre d'occurrences

# Tri
nombres = [3, 1, 4, 1, 5, 9]
nombres.sort()                  # tri en place (modifie la liste)
trie = sorted(nombres)          # retourne une nouvelle liste triée
trie_inverse = sorted(nombres, reverse=True)
```

### Slicing

```python
lst = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

lst[2:5]      # [2, 3, 4]         (début inclus, fin exclue)
lst[:3]       # [0, 1, 2]
lst[7:]       # [7, 8, 9]
lst[::2]      # [0, 2, 4, 6, 8]  (pas de 2)
lst[::-1]     # [9, 8, 7, ..., 0] (inversion)
lst[1:8:2]    # [1, 3, 5, 7]
```

---

## Tuples

Le tuple est ordonné, **immuable**, et accepte des doublons.

```python
point = (3, 4)
coordonnees = (10, 20, 30)
singleton = (42,)   # virgule obligatoire pour un tuple d'un seul élément

# Accès
print(point[0])   # 3

# Immuabilité
# point[0] = 99   # TypeError !

# Unpacking
x, y = point
print(x, y)   # 3 4

# Unpacking avec *
premier, *reste = (1, 2, 3, 4, 5)
print(premier)  # 1
print(reste)    # [2, 3, 4, 5]

# Swap élégant
a, b = 10, 20
a, b = b, a   # swap sans variable temporaire
print(a, b)   # 20 10
```

Quand utiliser un tuple vs une liste ?
- **Tuple** : données hétérogènes, coordonnées, retour de fonction multiple, clé de dictionnaire
- **Liste** : collection homogène destinée à être modifiée

---

## Dictionnaires

Le dictionnaire est une collection de paires clé-valeur, ordonné (Python 3.7+), mutable.

```python
profil = {"nom": "Alice", "age": 30, "ville": "Paris"}

# Accès
print(profil["nom"])          # Alice
print(profil.get("email"))    # None (pas d'erreur si clé absente)
print(profil.get("email", "non renseigné"))   # valeur par défaut

# Modification / ajout
profil["age"] = 31
profil["email"] = "alice@example.com"

# Suppression
del profil["ville"]
age = profil.pop("age")   # supprime et retourne la valeur

# Vérification d'existence
if "nom" in profil:
    print("La clé 'nom' existe")

# Itération
for cle in profil:            # itère sur les clés
    print(cle)

for valeur in profil.values():
    print(valeur)

for cle, valeur in profil.items():   # idiomatique
    print(f"{cle}: {valeur}")
```

### Méthodes utiles

```python
# setdefault : retourne la valeur existante ou initialise avec un défaut
compteur = {}
for mot in ["chat", "chien", "chat", "oiseau", "chat"]:
    compteur.setdefault(mot, 0)
    compteur[mot] += 1
# {'chat': 3, 'chien': 1, 'oiseau': 1}

# Équivalent plus direct avec collections.Counter
from collections import Counter
compteur = Counter(["chat", "chien", "chat", "oiseau", "chat"])

# update : fusionner deux dicts
config = {"debug": False, "port": 8080}
overrides = {"port": 9000, "host": "localhost"}
config.update(overrides)
# {'debug': False, 'port': 9000, 'host': 'localhost'}

# Fusion moderne (Python 3.9+)
merged = config | overrides
```

---

## Sets

Le set est non ordonné, mutable, ne contient pas de doublons. Idéal pour les tests d'appartenance et les opérations ensemblistes.

```python
couleurs = {"rouge", "vert", "bleu"}
couleurs2 = {"bleu", "jaune", "orange"}

# Ajout / suppression
couleurs.add("violet")
couleurs.discard("vert")   # ne lève pas d'erreur si absent
couleurs.remove("rouge")   # lève KeyError si absent

# Opérations ensemblistes
print(couleurs | couleurs2)   # union
print(couleurs & couleurs2)   # intersection
print(couleurs - couleurs2)   # différence
print(couleurs ^ couleurs2)   # différence symétrique

# Test d'appartenance O(1) vs liste O(n)
grand_set = set(range(1_000_000))
print(999_999 in grand_set)   # instantané
```

---

## Copie superficielle vs profonde

```python
import copy

# Assignation : même objet !
a = [1, 2, [3, 4]]
b = a            # b est un alias de a
b[0] = 99
print(a)   # [99, 2, [3, 4]]  ← a est modifié !

# Copie superficielle : copie le container, pas les objets imbriqués
c = a.copy()   # ou list(a) ou a[:]
c[0] = 0
print(a)   # [99, 2, [3, 4]]  ← a non modifié pour l'entier
c[2][0] = 99
print(a)   # [99, 2, [99, 4]] ← a modifié car la sous-liste est partagée !

# Copie profonde : copie récursive de tout le contenu
d = copy.deepcopy(a)
d[2][0] = 0
print(a)   # inchangé
```

---

## Bonnes pratiques

- Utiliser `.get()` sur un dict pour éviter les `KeyError`
- Préférer les sets aux listes pour les tests d'appartenance fréquents
- Utiliser `copy.deepcopy()` pour les structures imbriquées
- Ne jamais utiliser `b = a` pour "copier" une liste mutable
- Les tuples sont plus rapides que les listes pour l'accès indexé

---

## Résumé

| Structure | Ordonné | Mutable | Doublons | Usage typique |
|---|---|---|---|---|
| `list` | Oui | Oui | Oui | Séquence modifiable |
| `tuple` | Oui | Non | Oui | Données fixes, clé de dict |
| `dict` | Oui (3.7+) | Oui | Clés non | Association clé-valeur |
| `set` | Non | Oui | Non | Unicité, opérations ensemblistes |

---

<!-- snippet
id: python_ds_dict_get
type: command
tech: python
level: intermediate
importance: high
format: knowledge
tags: dict,get,keyerror
title: Accéder à une clé de dict sans KeyError
command: valeur = dico.get("cle", "valeur_par_defaut")
description: .get() retourne None si la clé n'existe pas, ou la valeur par défaut fournie en second argument. Evite les KeyError sur des clés optionnelles.
-->

<!-- snippet
id: python_ds_deepcopy
type: warning
tech: python
level: intermediate
importance: high
format: knowledge
tags: copie,deepcopy,mutable
title: Copie superficielle ne copie pas les objets imbriqués
content: b = a.copy() copie la liste externe mais partage les objets imbriqués. Modifier b[0][1] modifie aussi a[0][1]. Utiliser copy.deepcopy(a) pour une vraie copie indépendante.
description: La copie superficielle ne copie qu'un niveau. Pour des structures imbriquées (listes de listes, dicts de dicts), utiliser copy.deepcopy().
-->

<!-- snippet
id: python_ds_set_membership
type: tip
tech: python
level: intermediate
importance: high
format: knowledge
tags: set,performance,appartenance
title: Utiliser un set pour les tests d'appartenance fréquents
content: Convertir une liste en set avec set(liste) si on fait de nombreux tests in. La recherche dans un set est O(1), dans une liste O(n).
description: Pour 1 000 000 éléments, un test in sur une liste peut prendre 100ms, sur un set il est quasi-instantané grâce à la table de hachage.
-->

<!-- snippet
id: python_ds_tuple_unpack
type: concept
tech: python
level: intermediate
importance: medium
format: knowledge
tags: tuple,unpacking,swap
title: Unpacking de tuple et swap de variables
content: a, b = b, a permute les deux variables sans variable temporaire. Python évalue d'abord le côté droit, crée un tuple, puis dépack à gauche.
description: L'unpacking de tuple est idiomatique en Python. Fonctionne pour tout itérable : x, y, z = [1, 2, 3] ou premier, *reste = (1, 2, 3, 4).
-->

<!-- snippet
id: python_ds_dict_update_merge
type: command
tech: python
level: intermediate
importance: medium
format: knowledge
tags: dict,fusion,update
title: Fusionner deux dictionnaires
command: merged = dict1 | dict2
description: L'opérateur | (Python 3.9+) fusionne deux dicts et retourne un nouveau dict. Les clés de dict2 écrasent celles de dict1. Utiliser .update() pour modifier en place.
-->

<!-- snippet
id: python_ds_setdefault
type: tip
tech: python
level: intermediate
importance: medium
format: knowledge
tags: dict,setdefault,compteur
title: Initialiser une clé dict si elle n'existe pas
content: dico.setdefault(cle, valeur_defaut) retourne la valeur existante ou initialise la clé avec valeur_defaut. Utile pour les accumulateurs et les groupements.
description: Plus concis que if cle not in dico: dico[cle] = []. Alternative : utiliser collections.defaultdict pour éviter tout test d'initialisation.
-->
