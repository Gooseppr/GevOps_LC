---
layout: page
title: "Générateurs & itérateurs"

course: python
theme: "Avancé"
type: lesson

chapter: 3
section: 2

tags: python,generateurs,yield,itertools,iterateur,memoire
difficulty: advanced
duration: 35
mermaid: false

status: "published"
next_module: "/courses/python/python_ch3_3.html"
next_module_title: "Pièges classiques Python"
---

# Générateurs & itérateurs

## Objectifs pédagogiques

- Comprendre le protocole itérateur (`__iter__`, `__next__`)
- Écrire des générateurs avec `yield` et `yield from`
- Utiliser les expressions génératrices
- Maîtriser les outils essentiels d'`itertools`
- Choisir entre liste et générateur selon les contraintes mémoire

---

## Contexte

Les générateurs permettent de produire des séquences de valeurs à la demande, sans stocker toute la séquence en mémoire. C'est ce qui rend Python capable de traiter des fichiers de plusieurs gigaoctets ligne par ligne, ou de générer des séquences infinies. Comprendre ce mécanisme est clé pour écrire du code Python efficace.

---

## Le protocole itérateur

En Python, tout objet sur lequel on peut faire un `for` est un **itérable**. Un itérable implémente `__iter__()` qui retourne un **itérateur**. Un itérateur implémente `__next__()` qui retourne l'élément suivant ou lève `StopIteration`.

```python
# Comprendre ce que fait for ... in ... sous le capot
nombres = [1, 2, 3]

# Boucle for, équivalent interne :
iterateur = iter(nombres)      # appelle nombres.__iter__()
while True:
    try:
        element = next(iterateur)  # appelle iterateur.__next__()
        print(element)
    except StopIteration:
        break
```

### Implémenter un itérateur custom

```python
class Compteur:
    """Itérateur qui compte de start jusqu'à stop."""

    def __init__(self, start, stop):
        self.current = start
        self.stop = stop

    def __iter__(self):
        return self   # l'objet est son propre itérateur

    def __next__(self):
        if self.current >= self.stop:
            raise StopIteration
        valeur = self.current
        self.current += 1
        return valeur


for n in Compteur(1, 5):
    print(n)   # 1, 2, 3, 4
```

---

## Générateurs avec yield

Un générateur est une façon simple d'écrire un itérateur. Une fonction avec `yield` devient automatiquement un générateur.

```python
def compter(start, stop):
    """Générateur équivalent à Compteur ci-dessus."""
    current = start
    while current < stop:
        yield current   # suspend l'exécution, retourne la valeur
        current += 1    # reprend ici à l'itération suivante

for n in compter(1, 5):
    print(n)   # 1, 2, 3, 4

# L'appel de la fonction ne l'exécute pas, il crée un objet générateur
g = compter(1, 3)
print(type(g))    # <class 'generator'>
print(next(g))    # 1
print(next(g))    # 2
print(next(g))    # 3
# print(next(g))  # StopIteration !
```

### Générateur de nombres de Fibonacci

```python
def fibonacci():
    """Générateur infini de nombres de Fibonacci."""
    a, b = 0, 1
    while True:       # infini !
        yield a
        a, b = b, a + b

# Prendre les 10 premiers
fib = fibonacci()
for _ in range(10):
    print(next(fib), end=" ")   # 0 1 1 2 3 5 8 13 21 34

# Avec itertools.islice
import itertools
print(list(itertools.islice(fibonacci(), 10)))
```

### Générateur de fichier volumineux

```python
def lire_par_bloc(chemin, taille=8192):
    """Lit un fichier par blocs sans le charger entièrement en mémoire."""
    with open(chemin, "rb") as f:
        while True:
            bloc = f.read(taille)
            if not bloc:
                break
            yield bloc

def compter_lignes(chemin):
    """Compte les lignes d'un très gros fichier."""
    total = 0
    with open(chemin, "r", encoding="utf-8") as f:
        for _ in f:    # le fichier est un itérable ligne par ligne
            total += 1
    return total
```

---

## yield from

`yield from` délègue à un sous-générateur ou un itérable :

```python
def chaines(*iterables):
    """Chaîne plusieurs itérables (comme itertools.chain)."""
    for iterable in iterables:
        yield from iterable   # délègue l'itération

for x in chaines([1, 2], [3, 4], [5]):
    print(x, end=" ")   # 1 2 3 4 5

# Équivaut à :
def chaines_verbose(*iterables):
    for iterable in iterables:
        for element in iterable:
            yield element
```

`yield from` est particulièrement important avec les coroutines et `asyncio`.

---

## Expressions génératrices

```python
# Syntaxe : (expression for var in iterable if condition)
carres = (x ** 2 for x in range(1_000_000))   # génère à la demande

# Consommation
print(sum(carres))           # consomme le générateur
print(sum(carres))           # 0 ! Le générateur est épuisé

# Différence mémoire
import sys
liste = [x ** 2 for x in range(1_000_000)]
gen = (x ** 2 for x in range(1_000_000))
print(sys.getsizeof(liste))   # ~8 MB
print(sys.getsizeof(gen))     # ~112 bytes
```

**Attention** : un générateur n'est consommable qu'une fois. Après épuisement, il retourne vide.

---

## itertools

`itertools` fournit des outils hautement efficaces (implémentés en C) pour travailler avec des itérables.

```python
import itertools

# chain : chaîner des itérables
print(list(itertools.chain([1, 2], [3, 4], [5])))
# [1, 2, 3, 4, 5]

# islice : trancher un itérable (même infini)
print(list(itertools.islice(range(100), 5, 15, 2)))
# [5, 7, 9, 11, 13]

# product : produit cartésien
print(list(itertools.product("AB", [1, 2])))
# [('A', 1), ('A', 2), ('B', 1), ('B', 2)]

# permutations et combinations
print(list(itertools.permutations("ABC", 2)))
# [('A', 'B'), ('A', 'C'), ('B', 'A'), ...]
print(list(itertools.combinations("ABC", 2)))
# [('A', 'B'), ('A', 'C'), ('B', 'C')]

# groupby : grouper des éléments consécutifs identiques
data = [("A", 1), ("A", 2), ("B", 3), ("B", 4), ("A", 5)]
data.sort(key=lambda x: x[0])   # groupby requiert un tri préalable !
for cle, groupe in itertools.groupby(data, key=lambda x: x[0]):
    print(cle, list(groupe))

# cycle : répéter indéfiniment
couleurs = itertools.cycle(["rouge", "vert", "bleu"])
for _ in range(6):
    print(next(couleurs), end=" ")   # rouge vert bleu rouge vert bleu

# takewhile / dropwhile
print(list(itertools.takewhile(lambda x: x < 5, [1, 2, 3, 6, 4, 5])))
# [1, 2, 3]  ← s'arrête au premier False
```

---

## Générateur avec send() et throw()

Les générateurs peuvent recevoir des valeurs :

```python
def accumulateur():
    total = 0
    while True:
        valeur = yield total   # yield retourne total ET reçoit une valeur via send()
        if valeur is None:
            break
        total += valeur

g = accumulateur()
next(g)        # initialisation obligatoire (avance jusqu'au premier yield)
g.send(10)     # total = 10
g.send(5)      # total = 15
print(g.send(3))   # total = 18
```

---

## Bonnes pratiques

- Utiliser un générateur quand on parcourt une seule fois et/ou les données sont volumineuses
- Utiliser une liste quand on a besoin de parcourir plusieurs fois, de l'indexation ou de `len()`
- `yield from` plutôt qu'une boucle `for/yield` pour déléguer à un sous-itérable
- Toujours réinitialiser un générateur épuisé (en le recréant)
- Préférer `itertools` à une implémentation maison

---

## Résumé

| Concept | Mémoire | Consommable | Usage |
|---|---|---|---|
| `list` | O(n) | N fois | Accès indexé, multiple parcours |
| `generator` | O(1) | 1 fois | Gros volumes, pipeline de données |
| `itertools` | O(1) | 1 fois | Combinatoire, transformation |

---

<!-- snippet
id: python_gen_yield_basic
type: concept
tech: python
level: advanced
importance: high
format: knowledge
tags: yield,generateur,suspension
title: Principe de yield dans un générateur
content: Une fonction contenant yield est un générateur. À chaque yield, l'exécution est suspendue et la valeur est retournée. Elle reprend après le yield lors du prochain next().
description: Un générateur ne s'exécute pas à l'appel de la fonction. Il retourne un objet générateur. L'exécution commence au premier next() et se suspend à chaque yield.
-->

<!-- snippet
id: python_gen_exhaustion
type: warning
tech: python
level: advanced
importance: high
format: knowledge
tags: generateur,epuisement,once
title: Un générateur ne peut être consommé qu'une fois
content: Après épuisement, sum(gen) retourne 0 et list(gen) retourne []. Recréer le générateur en rappelant la fonction génératrice plutôt que de tenter de le réinitialiser.
description: Contrairement à une liste, un générateur ne peut pas être "rembobiné". Si on a besoin de plusieurs parcours, convertir en liste ou recréer le générateur.
-->

<!-- snippet
id: python_gen_yield_from
type: command
tech: python
level: advanced
importance: high
format: knowledge
tags: yield_from,delegation,sous_generateur
title: Déléguer l'itération avec yield from
command: yield from sous_iterable
description: yield from iterable délègue à chaque élément de l'itérable, équivalent à for x in iterable: yield x mais plus efficace et compatible avec les coroutines.
-->

<!-- snippet
id: python_gen_islice
type: command
tech: python
level: advanced
importance: high
format: knowledge
tags: itertools,islice,generateur_infini
title: Prendre les N premiers éléments d'un générateur infini
command: list(itertools.islice(generateur_infini(), 10))
description: islice(iterable, stop) ou islice(iterable, start, stop, step) coupe un itérable sans le matérialiser. Indispensable avec les générateurs infinis.
-->

<!-- snippet
id: python_gen_memory
type: concept
tech: python
level: advanced
importance: high
format: knowledge
tags: memoire,generateur,liste
title: Différence de mémoire entre liste et générateur
content: Une list comprehension pour 1M d'éléments occupe ~8MB. Un générateur équivalent occupe ~112 bytes. Le générateur calcule chaque valeur à la demande, jamais tout en même temps.
description: Pour de gros volumes, une expression génératrice (x for x in ...) est dramatiquement plus économe qu'une list comprehension [x for x in ...].
-->

<!-- snippet
id: python_gen_groupby_sort
type: warning
tech: python
level: advanced
importance: medium
format: knowledge
tags: itertools,groupby,tri
title: groupby requiert un tri préalable
content: itertools.groupby regroupe des éléments consécutifs identiques, pas tous les éléments égaux. Trier la liste par la clé de groupement avant d'appeler groupby.
description: groupby('AAABBBCCAAA') donne A(3), B(3), C(2), A(3) — pas A(6), B(3), C(2). Toujours trier par la même clé : data.sort(key=lambda x: x['cle']).
-->
