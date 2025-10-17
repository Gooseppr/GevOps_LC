---
module: Python — le cours Python
jour: 04
ordre: 1
---

# Python — le cours Python 

## 1) Pourquoi Python (contexte DevOps)

Python est un langage **lisible**, **productif** et **multi-usage**. Il sert à automatiser des tâches, manipuler des fichiers/texte et écrire des mini-outils de supervision. Sa syntaxe est cohérente et évite le “bruit” : on se concentre sur la logique.

---

## 2) Installer et exécuter Python (Linux)

```bash
sudo apt update && sudo apt install -y python3
python3 --version

```

- **REPL** (console interactive) : `python3` → tape du code, `Ctrl+D` pour quitter.
- **Script** : `python3 script.py`
- **Shebang** (exécutable) en tête de fichier : `#!/usr/bin/env python3` + `chmod +x script.py`.

---

Les fichiers .py n'ont pas forcément besoin de Shebang et d'élévation de droit pour être exécuter si ils sont exécuté dans Linux directement par python3 qui lui dispose déjà des droits.

## 3) Premier script

`hello.py` :

```python
print("Hello, world!")

```

Exécution :

```bash
./hello.py

```

---

## 4) Variables et types de base

- Affectation : `x = 10` (nom en `snake_case` conseillé).
- Types natifs : **int**, **float**, **str**, **bool**, **None**.

```python
entier = 42            # int
reel = 3.14            # float
texte = "Python"       # str
ok = True              # bool
rien = None            # absence de valeur

# réaffectation
score = 5
score = score + 3       # 8  Réaffectation avec addition
score += 2              # 10 Affectation augmentée

```

Conversions (casts) :

```python
int("12")    # 12
float("2.5") # 2.5
str(3.14)    # "3.14"
bool(0)      # False ; bool(1) -> True

```

---

## 5) Opérateurs

- **Arithmétiques** : `+ - * / // % **`

```python
7 / 2   # 3.5 - Division classique : donne le résultat en nombre décimal.
7 // 2  # 3 - Division entière : donne le quotient entier.
7 % 2   # 1 - Modulo : donne le reste de la division entière.
2 ** 3  # 8 - Puissance : élève le premier nombre à la puissance du second.

```

- **Comparaison** : `== != < <= > >=`
- Compare des **valeurs** → renvoie `True`/`False`.
- Chaînage possible : `2 < x <= 10`.

```python
3 == 3        # True
3 != 4        # True
2 < 5         # True
"ab" < "aba"  # True (ordre lexicographique)
2 < x <= 10   # équivaut à (2 < x) and (x <= 10)

```

- **Logiques** : `and or not`
- Combiner des conditions (évaluation **paresseuse** / *short-circuit*).
- `and` renvoie le **premier falsy** ou le dernier operand.
- `or` renvoie le **premier truthy**.
- `not` inverse la vérité.

```python
age, has_id = 20, True
age >= 18 and has_id     # True
"user" or "default"      # "user"
"" or "default"          # "default"
not 0                    # True  (0 est falsy)

```

> Falsy : False, None, 0, 0.0, "", [], {}, set()… — tout le reste est truthy.

- **Appartenance / identité** :

  - **Appartenance (`in`)** : présence dans une **sequence/collection**.
      - `str` : sous-chaîne ; `list/tuple` : élément ; `set` : très rapide ; `dict` : **clés**.
  - **Identité (`is`)** : **même objet** en mémoire (≠ égalité de valeur).

```python
"py" in "python"           # True    (sous-chaîne)
"a" in "python"            # False
2 in [1,2,3]               # True
"ville" in {"ville":"Paris"}  # True (test sur les clés)

a = [1,2]; b = a; c = [1,2]
a == c     # True  (même contenu)
a is c     # False (objets distincts)
x is None  # idiome recommandé

```
---

## 6) Chaînes de caractères (str)

```python
s = "Hello world"
len(s)         # 11
s[0]           # 'H'
s[:5]          # 'Hello'
s[6:]          # 'world'
s[-1]          # 'd'

"hello".upper()           # 'HELLO'
"HELLO".lower()           # 'hello'
"  x  ".strip()           # 'x'
"a,b,c".split(",")        # ['a','b','c']
"-".join(["a","b"])       # 'a-b'
"abc".replace("b","X")    # 'aXc'

```

Formatage recommandé (f-strings) :

```python
prenom, nom = "John", "Wall"
print(f"{prenom} {nom}")    # John Wall

```

Chaînes multi-lignes :

```python
msg = """Ligne 1
Ligne 2"""

```

---

## 7) Collections : listes, tuples, dictionnaires, ensembles

### 7.1 Listes (mutables, ordonnées)

```python
foods = ["Morue", "Poulet", "Jambon"]
foods.append("Crabe")
foods.insert(1, "Crabe")
foods.pop()          # supprime le dernier
foods.pop(1)         # supprime à l’index 1
foods.remove("Jambon")      # supprime la 1re occurrence
len(foods)
foods.sort()         # tri sur place
foods.reverse()      # inversion sur place

# slices
nums = [0,1,2,3,4,5]
nums[1:4]    # [1,2,3]
nums[:3]     # [0,1,2]
nums[::2]    # [0,2,4]

```

### 7.2 Tuples (immutables, ordonnés)

```python
coord = (48.0, 2.0)
coord[0]           # 48.0
# conversion
t = (1,2,3)
lst = list(t); lst.append(4); t2 = tuple(lst)  # (1,2,3,4)

```

### 7.3 Dictionnaires (clé → valeur)

```python
contact = {"name":"Vanessa","tel":"06","mail":"v@ex.com"}
contact["name"] = "Charles"
contact["ville"] = "Paris"
contact.get("age", 0)    # 0 si absent
"tel" in contact         # True
list(contact.keys())     # ['name','tel','mail','ville']
list(contact.items())    # [('name','Charles'), ...]
del contact["tel"]

# liste de dictionnaires
contacts = [
  {"name":"Charles","ville":"Paris"},
  {"name":"Julien","ville":"Lyon"},
]

```

### 7.4 Ensembles (sets : uniques, non ordonnés)

```python
s = {1,2,2,3}     # {1,2,3}
s.add(4)
s.remove(1)
s2 = {3,4,5}
s | s2   # union
s & s2   # intersection
s - s2   # différence

```

---

## 8) Entrées / sorties (I/O) natives

Affichage :

```python
print("A", 123, True)        # A 123 True
print("A","B", sep=" | ")    # A | B
print("Fin", end=".\n")      # Fin.

```

Lecture clavier :

```python
nom = input("Votre nom ? ")
print(f"Bonjour {nom}")

```

Fichiers :

```python
# écrire
with open("notes.txt","w",encoding="utf-8") as f:
    f.write("L1\nL2\n")

# lire tout
with open("notes.txt","r",encoding="utf-8") as f:
    contenu = f.read()

# lire ligne à ligne
with open("notes.txt","r",encoding="utf-8") as f:
    for ligne in f:
        print(ligne.strip())

```

---

## 9) Contrôle de flux

### 9.1 Conditions

```python
score = 80
if score == 100:
    print("Bravo")
elif score > 50:
    print("Bien joué")
else:
    print("Recommence")

```

### 9.2 Boucles

```python
# for (compteur)
for i in range(3):
    print(i)             # 0,1,2

# for (itération sur collection)
foods = ["Morue","Poulet","Jambon"]
for f in foods:
    print(f)

# index + valeur
for i, f in enumerate(foods):
    print(i, f)

# while
i = 1
while i < 4:
    print(i)
    i += 1

# break / continue / else
for n in [1,2,3,4]:
    if n == 3:
        break
else:
    print("s’exécute si aucune rupture (break) dans la boucle")

```

---

## 10) Fonctions (définir, appeler, renvoyer)

Définition + retour :

```python
def moyenne(a, b):
    """Renvoie la moyenne de deux nombres."""
    return (a + b) / 2

```

Paramètres nommés et valeurs par défaut :

```python
def saluer(prenom, titre=""):
    if titre:
        print(f"Bonjour {titre} {prenom}")
    else:
        print(f"Bonjour {prenom}")

saluer("Amina")
saluer("Dupont", titre="Dr")

```

Nombre variable d’arguments :

```python
def somme(*nums):
    total = 0
    for n in nums:
        total += n
    return total

```

Portée : les variables créées **dans** la fonction sont **locales**.

Docstring : la chaîne triple-quotes sous `def` sert d’aide (`help(f)`).

---

## 11) Gestion des erreurs (exceptions)

```python
def division(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        return None
    finally:
        pass  # toujours exécuté

def set_age(age):
    if age < 0:
        raise ValueError("age négatif interdit")

```

---

## 12) Les classes (programmation orientée objet)

### 12.1 Pourquoi des classes

Les classes regroupent **données** (attributs) et **comportements** (méthodes). Elles modélisent des entités réelles (compte, capteur, commande), protègent les invariants (ex : “solde ≥ 0”) et rendent le code extensible.

---

### 12.2 Définir une classe, créer des objets

```python
class CompteBancaire:
    def __init__(self, titulaire, solde_initial=0):
        self.titulaire = titulaire
        self.solde = solde_initial

    def deposer(self, montant):
        self.solde += montant

    def retirer(self, montant):
        if montant > self.solde:
            print("Fonds insuffisants")
            return False
        self.solde -= montant
        return True

    def afficher(self):
        print(f"{self.titulaire}: solde = {self.solde} €")

c = CompteBancaire("Amina", 100)
c.deposer(50)
c.retirer(20)
c.afficher()     # Amina: solde = 130 €

```

- `__init__` : **constructeur**, appelé à la création.
- `self` : référence **l’instance courante**.

---

### 12.3 Attributs d’instance vs attributs de classe

```python
class Serveur:
    port_par_defaut = 8080         # attribut de classe (commun)

    def __init__(self, nom, port=None):
        self.nom = nom             # attribut d’instance (propre à l’objet)
        self.port = port or Serveur.port_par_defaut

```

---

### 12.4 Représentation lisible : `__repr__`, `__str__`

```python
class Point:
    def __init__(self, x=0, y=0):
        self.x, self.y = x, y
    def __repr__(self):  # debug/dev
        return f"Point(x={self.x}, y={self.y})"
    def __str__(self):   # affichage utilisateur
        return f"({self.x}, {self.y})"

```

---

### 12.5 Comparaison et opérations (dunders utiles)

Égalité :

```python
class Identite:
    def __init__(self, uid):
        self.uid = uid
    def __eq__(self, other):
        if not isinstance(other, Identite):
            return NotImplemented
        return self.uid == other.uid

```

Opérations arithmétiques (exemple vectoriel) :

```python
class Vec2:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __add__(self, o):     # v1 + v2
        return Vec2(self.x + o.x, self.y + o.y)
    def __sub__(self, o):     # v1 - v2
        return Vec2(self.x - o.x, self.y - o.y)
    def __mul__(self, k):     # v * k (scalaire)
        return Vec2(self.x * k, self.y * k)
    def __rmul__(self, k):    # k * v
        return self.__mul__(k)
    def __repr__(self):
        return f"Vec2({self.x}, {self.y})"

```

Comportement “conteneur” léger :

```python
class Panier:
    def __init__(self, items):
        self._items = list(items)
    def __len__(self):      # len(panier)
        return len(self._items)
    def __iter__(self):     # for x in panier
        return iter(self._items)
    def __getitem__(self, i):     # panier[i]
        return self._items[i]

```

---

### 12.6 Propriétés : encapsuler et valider sans casser l’API

```python
class Temperature:
    def __init__(self, celsius=0.0):
        self._celsius = float(celsius)   # _ = interne (convention)

    @property
    def celsius(self):
        return self._celsius

    @celsius.setter
    def celsius(self, value):
        v = float(value)
        if v < -273.15:
            raise ValueError("zéro absolu dépassé")
        self._celsius = v

t = Temperature(20)
t.celsius = 25    # passe par le setter avec validation

```

---

### 12.7 Méthodes de classe et méthodes statiques

```python
class Utilisateur:
    compteur = 0

    def __init__(self, login):
        self.login = login
        Utilisateur.compteur += 1

    @classmethod
    def total(cls):
        return cls.compteur

    @staticmethod
    def normaliser(login):
        return login.strip().lower()

```

---

### 12.8 Encapsulation pratique et `__slots__`

Conventions :

- `_attribut` = interne (usage externe déconseillé),
- `__attribut` = *name mangling* (pseudo-privé).

Limiter les attributs autorisés et réduire l’empreinte mémoire :

```python
class Node:
    __slots__ = ("val", "next")
    def __init__(self, val, next=None):
        self.val = val
        self.next = next

```

---

### 12.9 Héritage et composition

Héritage :

```python
class Compte:
    def __init__(self, solde=0):
        self.solde = solde
    def deposer(self, m): self.solde += m

class CompteEpargne(Compte):
    def __init__(self, solde=0, taux=0.01):
        super().__init__(solde)
        self.taux = taux
    def appliquer_interets(self):
        self.solde += self.solde * self.taux

```

Composition (souvent préférable) :

```python
class Moteur:
    def demarrer(self): print("Moteur ON")

class Voiture:
    def __init__(self):
        self.moteur = Moteur()   # contient un moteur
    def demarrer(self):
        self.moteur.demarrer()   # délégation

```

---

### 12.10 Itération et contextes avec des classes

Itérable simple (générateur) :

```python
class Compteur:
    def __init__(self, n):
        self.n = n
    def __iter__(self):
        i = 0
        while i < self.n:
            yield i
            i += 1

```

Gestion de contexte (`with`) :

```python
class Ressource:
    def __enter__(self):
        print("ouvrir")
        return self
    def __exit__(self, exc_type, exc, tb):
        print("fermer")
        return False  # laisser propager une éventuelle exception

with Ressource() as r:
    print("utiliser")

```

---

### 12.11 Exemples compacts

Cube :

```python
class Cube:
    def __init__(self, dimension):
        self.dimension = dimension
    def volume(self):
        return self.dimension ** 3
    def surface(self):
        return 6 * (self.dimension ** 2)
    def __repr__(self):
        return f"Cube({self.dimension})"

```

Utilisateur (règles simples) :

```python
class Utilisateur:
    def __init__(self, login, actif=True):
        self._login = login
        self._actif = bool(actif)
    @property
    def login(self): return self._login
    @property
    def actif(self): return self._actif
    def desactiver(self): self._actif = False
    def __repr__(self):
        etat = "actif" if self._actif else "inactif"
        return f"Utilisateur(login={self._login!r}, {etat})"

```

---

### 12.12 Bonnes pratiques OOP

- Donner **une responsabilité claire** à chaque classe.
- Préférer la **composition** si la relation n’est pas “est-un(e)”.
- Valider via **propriétés** (`@property`) plutôt que d’exposer des champs bruts.
- Fournir un `__repr__` utile pour le debug ; ajouter `__str__` si besoin.
- Éviter les états implicites ; documenter les invariants (ex. “solde ≥ 0”).
- Respecter la convention : `snake_case` (fonctions/attributs), `PascalCase` (classes).

---

### 13) Mini-référence (copier-coller)

```python
# Types & cast
n = int("12"); x = float(2); s = str(3.14); ok = bool(1)

# Chaînes
t = "Hello"; t[:5]; t.lower(); len(t)

# Listes
lst = [1,2,3]; lst.append(4); lst.pop(); lst[1:]; len(lst)

# Dict
d = {"a":1}; d["b"]=2; "a" in d; d.get("x",0); list(d.items())

# Conditions
if n>10: print("grand")
elif n==10: print("pile")
else: print("petit")

# Boucles
for i in range(3): print(i)
i=0
while i<3: i+=1

# Fonctions
def f(a,b=0): return a+b
def somme(*ns):
    total=0
    for v in ns: total+=v
    return total

# Exceptions
try: 1/0
except ZeroDivisionError: pass

# Classe minimale
class A:
    def __init__(self,x): self.x=x
    def inc(self): self.x+=1
    def __repr__(self): return f"A(x={self.x})"

```

---

### Conclusion

Ce document rassemble **toutes les briques natives** pour écrire des scripts Python efficaces et évolutifs — **sans dépendances externes**.

Tu peux automatiser des tâches, manipuler des fichiers/texte, structurer ton code avec **fonctions** et **classes**, et exposer une API propre grâce aux **propriétés** et aux **dunders** essentiels.


