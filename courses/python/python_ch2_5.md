---
layout: page
title: "Programmation Orientée Objet"

course: python
theme: "Intermédiaire"
type: lesson

chapter: 2
section: 5

tags: python,poo,class,heritage,property,dataclass,methodes
difficulty: intermediate
duration: 50
mermaid: false

status: "published"
next_module: "/courses/python/python_ch3_1.html"
next_module_title: "Décorateurs"
---

# Programmation Orientée Objet

## Objectifs pédagogiques

- Définir une classe avec `__init__`, `self` et des méthodes
- Comprendre `__str__` et `__repr__` pour la représentation
- Implémenter l'héritage et utiliser `super()`
- Utiliser `@property`, `@classmethod`, `@staticmethod`
- Connaître les méthodes magiques essentielles
- Simplifier les classes de données avec `dataclasses`

---

## Contexte

La POO permet de modéliser le monde réel sous forme d'objets qui encapsulent des données (attributs) et des comportements (méthodes). Python supporte la POO mais ne l'impose pas : on peut très bien écrire du Python procédural ou fonctionnel. Choisir la POO quand on a des objets avec un état et des comportements liés.

---

## Définir une classe

```python
class Animal:
    """Représente un animal générique."""

    # Attribut de classe (partagé par toutes les instances)
    especes_count = 0

    def __init__(self, nom, age):
        """Constructeur : initialise les attributs d'instance."""
        self.nom = nom       # attribut d'instance
        self.age = age
        Animal.especes_count += 1

    def __str__(self):
        """Représentation lisible pour print()."""
        return f"{self.nom} ({self.age} ans)"

    def __repr__(self):
        """Représentation non ambiguë pour le débogage."""
        return f"Animal(nom={self.nom!r}, age={self.age!r})"

    def parler(self):
        return "..."


chat = Animal("Minou", 3)
print(chat)         # Minou (3 ans)
print(repr(chat))   # Animal(nom='Minou', age=3)
```

---

## Héritage

```python
class Chien(Animal):
    """Un chien hérite d'Animal."""

    def __init__(self, nom, age, race):
        super().__init__(nom, age)   # appel du constructeur parent
        self.race = race

    def parler(self):
        return "Waf !"   # redéfinition (override) de la méthode parent

    def __str__(self):
        return f"{super().__str__()} - Race: {self.race}"


class Chat(Animal):
    def parler(self):
        return "Miaou !"


rex = Chien("Rex", 5, "Labrador")
print(rex)             # Rex (5 ans) - Race: Labrador
print(rex.parler())    # Waf !

# Polymorphisme
animaux = [Chien("Rex", 5, "Labrador"), Chat("Minou", 3)]
for animal in animaux:
    print(f"{animal.nom}: {animal.parler()}")
```

### Vérifier l'héritage

```python
print(isinstance(rex, Chien))    # True
print(isinstance(rex, Animal))   # True (héritage)
print(issubclass(Chien, Animal)) # True
```

---

## @property

`@property` transforme une méthode en attribut en lecture seule (ou lecture/écriture avec setter).

```python
class Cercle:
    def __init__(self, rayon):
        self._rayon = rayon   # convention _ = "privé"

    @property
    def rayon(self):
        return self._rayon

    @rayon.setter
    def rayon(self, valeur):
        if valeur < 0:
            raise ValueError("Le rayon ne peut pas être négatif")
        self._rayon = valeur

    @property
    def aire(self):
        """Propriété calculée (pas de setter)."""
        import math
        return math.pi * self._rayon ** 2


c = Cercle(5)
print(c.rayon)    # 5  ← syntaxe attribut, pas c.rayon()
print(c.aire)     # 78.53...
c.rayon = 10      # appelle le setter
# c.rayon = -1    # ValueError
# c.aire = 50    # AttributeError (pas de setter)
```

---

## @classmethod et @staticmethod

```python
class Date:
    def __init__(self, jour, mois, annee):
        self.jour = jour
        self.mois = mois
        self.annee = annee

    @classmethod
    def depuis_chaine(cls, chaine):
        """Factory method : crée une Date depuis une string 'JJ/MM/AAAA'."""
        j, m, a = map(int, chaine.split("/"))
        return cls(j, m, a)   # cls = la classe elle-même

    @staticmethod
    def est_annee_bissextile(annee):
        """Méthode utilitaire sans self ni cls."""
        return annee % 4 == 0 and (annee % 100 != 0 or annee % 400 == 0)

    def __str__(self):
        return f"{self.jour:02d}/{self.mois:02d}/{self.annee}"


d = Date.depuis_chaine("15/03/2024")   # factory
print(d)                               # 15/03/2024
print(Date.est_annee_bissextile(2024)) # True
```

- `@classmethod` : reçoit `cls` (la classe), utile pour les factory methods et constructeurs alternatifs
- `@staticmethod` : ni `self` ni `cls`, simple fonction utilitaire logiquement liée à la classe

---

## Méthodes magiques (dunder methods)

```python
class Vecteur:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __repr__(self):
        return f"Vecteur({self.x}, {self.y})"

    def __add__(self, autre):
        """Surcharge de +"""
        return Vecteur(self.x + autre.x, self.y + autre.y)

    def __mul__(self, scalaire):
        """Surcharge de * (scalaire)"""
        return Vecteur(self.x * scalaire, self.y * scalaire)

    def __len__(self):
        """Retourne la dimension (toujours 2 ici)"""
        return 2

    def __eq__(self, autre):
        """Surcharge de =="""
        return self.x == autre.x and self.y == autre.y

    def __abs__(self):
        """Norme du vecteur"""
        return (self.x**2 + self.y**2) ** 0.5


v1 = Vecteur(1, 2)
v2 = Vecteur(3, 4)
print(v1 + v2)     # Vecteur(4, 6)
print(v1 * 3)      # Vecteur(3, 6)
print(v1 == v2)    # False
print(abs(v2))     # 5.0
```

---

## dataclasses

`dataclasses` génère automatiquement `__init__`, `__repr__` et `__eq__` :

```python
from dataclasses import dataclass, field

@dataclass
class Produit:
    nom: str
    prix: float
    stock: int = 0
    tags: list = field(default_factory=list)   # argument mutable → field !

    def appliquer_remise(self, pourcentage):
        self.prix *= (1 - pourcentage / 100)


p = Produit("T-shirt", 29.99, stock=100)
print(p)   # Produit(nom='T-shirt', prix=29.99, stock=100, tags=[])

# Dataclass immutable
@dataclass(frozen=True)
class Point:
    x: float
    y: float

pt = Point(3, 4)
# pt.x = 10   # FrozenInstanceError
```

---

## Bonnes pratiques

- Utiliser des noms en PascalCase pour les classes
- Toujours définir `__repr__` pour faciliter le débogage
- Préfixer les attributs "privés" par `_` (convention, pas vraiment privé)
- Préférer `@dataclass` pour les simples conteneurs de données
- Éviter l'héritage profond (plus de 2-3 niveaux) ; préférer la composition

---

## Résumé

| Élément | Rôle |
|---|---|
| `__init__` | Constructeur |
| `__str__` | Affichage lisible (`print`) |
| `__repr__` | Repr. de débogage |
| `@property` | Attribut calculé ou protégé |
| `@classmethod` | Factory method (reçoit `cls`) |
| `@staticmethod` | Utilitaire sans contexte |
| `@dataclass` | Génère init/repr/eq automatiquement |

---

<!-- snippet
id: python_poo_init_self
type: concept
tech: python
level: intermediate
importance: high
format: knowledge
tags: class,__init__,self
title: Constructeur de classe avec __init__ et self
content: __init__(self, ...) est appelé automatiquement à la création. self représente l'instance courante et doit être le premier paramètre de toute méthode d'instance. self.attribut crée un attribut d'instance.
description: Contrairement à d'autres langages, self est explicite en Python. Les attributs sont créés dynamiquement dans __init__ par simple assignation.
-->

<!-- snippet
id: python_poo_property
type: command
tech: python
level: intermediate
importance: high
format: knowledge
tags: property,setter,encapsulation
title: Attribut protégé avec @property et setter
command: "@property\ndef rayon(self): return self._rayon\n@rayon.setter\ndef rayon(self, val): self._rayon = val"
description: @property expose une méthode comme attribut. Le setter permet la validation à l'assignation. Sans setter, l'attribut est en lecture seule.
-->

<!-- snippet
id: python_poo_dataclass
type: command
tech: python
level: intermediate
importance: high
format: knowledge
tags: dataclass,boilerplate,init
title: Créer une classe de données avec @dataclass
command: "@dataclass\nclass Produit:\n    nom: str\n    prix: float\n    stock: int = 0"
description: @dataclass génère automatiquement __init__, __repr__ et __eq__. field(default_factory=list) est obligatoire pour les valeurs par défaut mutables.
-->

<!-- snippet
id: python_poo_super
type: concept
tech: python
level: intermediate
importance: high
format: knowledge
tags: heritage,super,constructeur
title: Appeler le constructeur parent avec super()
content: super().__init__(args) appelle le __init__ de la classe parente. Indispensable en héritage pour initialiser correctement la partie héritée.
description: Sans super().__init__(), les attributs définis dans le parent ne sont pas créés. super() fonctionne aussi pour les méthodes normales : super().ma_methode().
-->

<!-- snippet
id: python_poo_classmethod_factory
type: tip
tech: python
level: intermediate
importance: medium
format: knowledge
tags: classmethod,factory,constructeur
title: Factory method avec @classmethod
content: @classmethod reçoit cls (la classe) comme premier argument. Permet de créer des constructeurs alternatifs comme Date.depuis_chaine("15/03/2024") sans passer par __init__.
description: Les factory methods avec @classmethod sont idiomatiques pour des constructeurs avec des formats d'entrée variés, tout en restant orientés objet.
-->

<!-- snippet
id: python_poo_repr_str
type: tip
tech: python
level: intermediate
importance: medium
format: knowledge
tags: __repr__,__str__,debug
title: Différence entre __str__ et __repr__
content: __str__ est pour l'affichage lisible (print). __repr__ est pour le débogage (doit permettre de recréer l'objet idéalement). Si __str__ manque, Python utilise __repr__.
description: Toujours définir au minimum __repr__. La convention : repr(obj) doit idéalement retourner du code Python valide reconstituant l'objet, ex: Point(x=3, y=4).
-->
