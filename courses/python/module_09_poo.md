---
layout: page
title: "Programmation orientée objet (POO) en Python"

course: python
chapter_title: "POO, Qualité & Tests"

chapter: 2
section: 1

tags: python,poo,classes,objets,architecture
difficulty: intermediate
duration: 90
mermaid: false

status: draft
---

# Programmation orientée objet (POO) en Python

## Objectifs pédagogiques
- Comprendre les bases de la POO en Python
- Créer et utiliser des classes correctement
- Identifier quand utiliser ou éviter la POO
- Structurer du code métier avec des objets

## Contexte
La POO est omniprésente en backend, mais mal utilisée elle rend le code complexe et difficile à maintenir.

## Principe de fonctionnement

🧠 Concept clé — Objet  
Un objet est une instance d’une classe avec des données et des comportements.

🧠 Concept clé — Classe  
Un plan pour créer des objets.

💡 Astuce — Penser “responsabilité” et non “objet”
Une classe doit avoir un rôle clair.

⚠️ Erreur fréquente — sur-ingénierie  
→ trop de classes inutiles → code illisible

---

## Syntaxe ou utilisation

### Classe simple

```python
class User:
    def __init__(self, name):
        self.name = name

    def greet(self):
        return f"Hello {self.name}"
```

---

### Utilisation

```python
user = User("Goose")
print(user.greet())
```

Résultat : Hello Goose

---

### Héritage

```python
class Admin(User):
    def delete(self):
        return "deleted"
```

---

## Cas d'utilisation

### Cas simple
Modéliser un utilisateur

### Cas réel
Backend API :

- User
- Order
- Product

Chaque classe représente une entité métier.

---

## Quand NE PAS utiliser la POO ⭐

- scripts simples
- transformations de données
- fonctions utilitaires

👉 préférer fonctions simples

---

## Erreurs fréquentes

⚠️ Trop de classes  
→ complexité inutile

⚠️ Classes sans logique  
→ simple conteneur → utiliser dict

💡 Astuce : commencer simple → refactoriser ensuite

---

## Bonnes pratiques

🔧 1 classe = 1 responsabilité  
🔧 Préférer composition à héritage  
🔧 Limiter la profondeur d’héritage  
🔧 Éviter les classes inutiles  
🔧 Garder les classes simples  
🔧 Favoriser lisibilité  

---

## Résumé

| Concept | Ce qu'il fait | À retenir |
|--------|-------------|----------|
| classe | modèle | structure |
| objet | instance | utilisation |
| héritage | extension | à limiter |

---

## SNIPPETS DE RÉVISION

<!-- snippet
id: python_class_definition
type: concept
tech: python
level: intermediate
importance: high
format: knowledge
tags: python,poo
title: Classe Python
content: Une classe est un modèle pour créer des objets
description: Base de la POO
-->

<!-- snippet
id: python_object_instance
type: concept
tech: python
level: intermediate
importance: high
format: knowledge
tags: python,poo
title: Objet instance
content: Un objet est une instance concrète d'une classe
description: Utilisation réelle
-->

<!-- snippet
id: python_poo_overengineering
type: warning
tech: python
level: intermediate
importance: high
format: knowledge
tags: python,poo,error
title: Sur ingénierie POO
content: trop de classes → complexité → préférer simplicité
description: piège fréquent
-->

<!-- snippet
id: python_composition_vs_inheritance
type: concept
tech: python
level: intermediate
importance: medium
format: knowledge
tags: python,poo
title: Composition vs héritage
content: L'héritage lie deux classes en permanence : changer le parent peut casser l'enfant. La composition assemble des comportements via des attributs — changer une dépendance ne touche pas le reste. Python favorise "has-a" (composition) plutôt que "is-a" (héritage) pour les relations complexes.
description: Règle pratique : hériter uniquement quand la relation est vraiment de type IS-A (un Carré IS-A Forme). Pour tout le reste, composer.
-->

