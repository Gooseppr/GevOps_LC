---
layout: page
title: "Décorateurs"

course: python
theme: "Avancé"
type: lesson

chapter: 3
section: 1

tags: python,decorateurs,closure,functools,wraps,wrapper
difficulty: advanced
duration: 40
mermaid: false

status: "published"
next_module: "/courses/python/python_ch3_2.html"
next_module_title: "Générateurs & itérateurs"
---

# Décorateurs

## Objectifs pédagogiques

- Comprendre que les fonctions sont des objets de première classe en Python
- Saisir le concept de closure (fermeture)
- Implémenter un décorateur simple puis avec arguments
- Utiliser `@functools.wraps` pour préserver les métadonnées
- Connaître des décorateurs pratiques : timer, retry, cache

---

## Contexte

Un décorateur est un outil Python permettant de modifier ou d'enrichir le comportement d'une fonction sans en modifier le code source. C'est l'application directe du principe ouvert/fermé : ouvert à l'extension, fermé à la modification. Les décorateurs sont massivement utilisés dans les frameworks (Flask, Django, FastAPI) et pour la gestion transversale (logging, authentification, cache).

---

## Fonctions comme objets de première classe

En Python, une fonction est un objet comme les autres : on peut la passer en argument, la retourner, la stocker.

```python
def saluer(nom):
    return f"Bonjour, {nom} !"

# Assigner une fonction à une variable
ma_func = saluer
print(ma_func("Alice"))   # Bonjour, Alice !

# Passer une fonction en argument
def appliquer(func, valeur):
    return func(valeur)

print(appliquer(saluer, "Bob"))   # Bonjour, Bob !

# Retourner une fonction
def creer_multiplieur(facteur):
    def multiplier(x):
        return x * facteur   # multiplie capture facteur depuis le scope englobant
    return multiplier

doubler = creer_multiplieur(2)
tripler = creer_multiplieur(3)
print(doubler(5))    # 10
print(tripler(5))    # 15
```

---

## Closures

Une closure est une fonction interne qui "capture" les variables de son scope englobant, même après que la fonction externe a retourné.

```python
def compteur():
    count = 0

    def incrementer():
        nonlocal count   # modifie la variable du scope englobant
        count += 1
        return count

    return incrementer

c1 = compteur()
c2 = compteur()   # un compteur indépendant

print(c1())   # 1
print(c1())   # 2
print(c2())   # 1  ← indépendant
print(c1())   # 3
```

---

## Principe du décorateur

Un décorateur est une fonction qui prend une fonction en argument et retourne une nouvelle fonction (le "wrapper").

```python
def mon_decorateur(func):
    def wrapper(*args, **kwargs):
        print(f"Avant l'appel de {func.__name__}")
        resultat = func(*args, **kwargs)
        print(f"Après l'appel de {func.__name__}")
        return resultat
    return wrapper

# Application manuelle
def saluer(nom):
    return f"Bonjour, {nom} !"

saluer = mon_decorateur(saluer)
print(saluer("Alice"))
# Avant l'appel de saluer
# Après l'appel de saluer
# Bonjour, Alice !
```

La syntaxe `@` est du sucre syntaxique pour cette assignation :

```python
@mon_decorateur
def saluer(nom):
    return f"Bonjour, {nom} !"

# Équivaut exactement à :
# saluer = mon_decorateur(saluer)
```

---

## @functools.wraps

Sans `@wraps`, le wrapper masque les métadonnées de la fonction originale :

```python
@mon_decorateur
def saluer(nom):
    """Salue poliment."""
    pass

print(saluer.__name__)   # 'wrapper'  ← mauvais !
print(saluer.__doc__)    # None       ← perdu !
```

Avec `@functools.wraps` :

```python
import functools

def mon_decorateur(func):
    @functools.wraps(func)   # copie les métadonnées de func vers wrapper
    def wrapper(*args, **kwargs):
        print(f"Appel de {func.__name__}")
        return func(*args, **kwargs)
    return wrapper

@mon_decorateur
def saluer(nom):
    """Salue poliment."""
    pass

print(saluer.__name__)   # 'saluer'         ← correct
print(saluer.__doc__)    # 'Salue poliment.' ← correct
```

Toujours utiliser `@functools.wraps` dans vos décorateurs.

---

## Décorateurs pratiques

### Timer

```python
import functools
import time

def timer(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        debut = time.perf_counter()
        resultat = func(*args, **kwargs)
        fin = time.perf_counter()
        print(f"{func.__name__} exécutée en {fin - debut:.4f}s")
        return resultat
    return wrapper

@timer
def traitement_lourd(n):
    return sum(range(n))

traitement_lourd(10_000_000)   # traitement_lourd exécutée en 0.3842s
```

### Retry

```python
import functools
import time

def retry(max_tentatives=3, delai=1.0):
    """Décorateur avec arguments (factory de décorateur)."""
    def decorateur(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for tentative in range(1, max_tentatives + 1):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if tentative == max_tentatives:
                        raise
                    print(f"Tentative {tentative} échouée: {e}. Retry dans {delai}s")
                    time.sleep(delai)
        return wrapper
    return decorateur

@retry(max_tentatives=3, delai=0.5)
def appel_api_fragile():
    import random
    if random.random() < 0.7:
        raise ConnectionError("Service temporairement indisponible")
    return "Succès !"
```

### Cache simple

```python
import functools

def cache(func):
    """Mémoïsation sans limite de taille."""
    resultats = {}

    @functools.wraps(func)
    def wrapper(*args):
        if args not in resultats:
            resultats[args] = func(*args)
        return resultats[args]
    return wrapper

@cache
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

# En pratique, utiliser functools.lru_cache ou functools.cache
```

---

## Décorateurs avec arguments (factory)

Un décorateur avec arguments est une fonction qui retourne un décorateur :

```python
def logger(niveau="INFO"):
    def decorateur(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            print(f"[{niveau}] Appel de {func.__name__}")
            return func(*args, **kwargs)
        return wrapper
    return decorateur

@logger(niveau="DEBUG")
def calculer(x, y):
    return x + y

@logger()   # parenthèses obligatoires même sans argument !
def traiter():
    pass
```

Il y a donc trois niveaux de fonctions imbriquées :
1. `logger(niveau)` → fabrique le décorateur
2. `decorateur(func)` → enveloppe la fonction
3. `wrapper(*args, **kwargs)` → s'exécute à chaque appel

---

## Décorateur de classe

On peut aussi décorer une classe entière :

```python
def singleton(cls):
    """Assure qu'une classe n'a qu'une seule instance."""
    instances = {}
    @functools.wraps(cls)
    def get_instance(*args, **kwargs):
        if cls not in instances:
            instances[cls] = cls(*args, **kwargs)
        return instances[cls]
    return get_instance

@singleton
class Configuration:
    def __init__(self):
        self.valeurs = {}

c1 = Configuration()
c2 = Configuration()
print(c1 is c2)   # True
```

---

## Bonnes pratiques

- Toujours utiliser `@functools.wraps(func)` dans le wrapper
- Utiliser `*args, **kwargs` dans le wrapper pour la transparence
- Pour les décorateurs avec arguments, utiliser une factory (trois niveaux)
- Préférer `functools.lru_cache` ou `functools.cache` à un cache maison
- Documenter l'effet du décorateur dans sa docstring

---

## Résumé

```
@decorateur_avec_args(param)    ← factory qui retourne un décorateur
def ma_fonction():
    pass

# Équivaut à :
ma_fonction = decorateur_avec_args(param)(ma_fonction)
```

---

<!-- snippet
id: python_dec_functools_wraps
type: command
tech: python
level: advanced
importance: high
format: knowledge
tags: decorateur,functools,wraps,metadonnees
title: Préserver les métadonnées avec @functools.wraps
command: "@functools.wraps(func)\ndef wrapper(*args, **kwargs): ..."
description: Sans @wraps, wrapper.__name__ et wrapper.__doc__ remplacent ceux de la fonction originale. @wraps copie ces métadonnées pour que l'introspection reste correcte.
-->

<!-- snippet
id: python_dec_principle
type: concept
tech: python
level: advanced
importance: high
format: knowledge
tags: decorateur,wrapper,sucre_syntaxique
title: Principe du décorateur Python
content: @mon_decorateur au-dessus d'une fonction est équivalent à f = mon_decorateur(f). Un décorateur est une fonction qui prend une fonction et retourne une nouvelle fonction.
description: La syntaxe @ est du sucre syntaxique. Comprendre l'équivalence avec l'assignation explicite permet de déboguer et de composer des décorateurs.
-->

<!-- snippet
id: python_dec_factory
type: concept
tech: python
level: advanced
importance: high
format: knowledge
tags: decorateur,arguments,factory
title: Décorateur avec arguments (factory)
content: Pour @retry(max=3), il faut trois niveaux : factory(args) → decorateur(func) → wrapper(*args, **kwargs). La factory retourne le vrai décorateur.
description: @retry(3) appelle d'abord retry(3) qui retourne un décorateur, qui est ensuite appliqué à la fonction. Les parenthèses sont obligatoires même si aucun argument n'est passé.
-->

<!-- snippet
id: python_dec_timer
type: tip
tech: python
level: advanced
importance: medium
format: knowledge
tags: decorateur,timer,performance
title: Mesurer le temps d'exécution avec un décorateur
content: Utiliser time.perf_counter() (plus précis que time.time()) avant et après l'appel. Retourner le résultat de func(*args, **kwargs) pour ne pas casser la valeur de retour.
description: Un décorateur timer est un excellent exemple pédagogique. En production, utiliser plutôt cProfile ou py-spy pour le profiling.
-->

<!-- snippet
id: python_dec_nonlocal
type: concept
tech: python
level: advanced
importance: medium
format: knowledge
tags: closure,nonlocal,etat
title: Modifier une variable englobante avec nonlocal
content: Dans une closure, nonlocal x déclare qu'on veut modifier la variable x du scope englobant (pas créer une nouvelle variable locale). Différent de global qui cible le module.
description: Sans nonlocal, Python considère toute assignation dans une fonction comme locale. nonlocal est nécessaire pour des closures avec état mutable (compteur, cache).
-->
