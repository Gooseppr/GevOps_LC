---
layout: page
title: "Syntaxe de base & types Python"

course: python
chapter_title: "Syntaxe, Types & Structures"

chapter: 1
section: 2

tags: python,types,variables,syntaxe
difficulty: beginner
duration: 60
mermaid: false

status: draft
---

# Syntaxe de base & types Python

## Objectifs pédagogiques
- Comprendre le modèle de typage dynamique de Python
- Manipuler les types primitifs correctement
- Éviter les pièges liés à la mutabilité
- Écrire des structures de contrôle fiables

## Contexte
Python privilégie la lisibilité et la rapidité de développement. Mais cette simplicité cache des comportements implicites qui peuvent générer des bugs en production.

## Principe de fonctionnement

🧠 Concept clé — Typage dynamique  
Le type est associé à la valeur, pas à la variable.

💡 Astuce — Lire le type avec type()  
Permet de comprendre le comportement réel du code.

⚠️ Erreur fréquente — confondre copie et référence  
Cause : objets mutables  
Correction : utiliser copy() ou deepcopy()

## Syntaxe ou utilisation

```python
# Variables
x = 10          # int
y = 3.14        # float
name = "Goose"  # str
flag = True     # bool

# Vérifier le type
print(type(x))
```

Résultat attendu : affiche le type de chaque variable.

---

### Conditions

```python
age = 18

if age >= 18:
    print("majeur")
else:
    print("mineur")
```

---

### Boucles

```python
for i in range(3):
    print(i)
```

---

## Cas d'utilisation

### Cas simple
Validation d'une condition utilisateur (âge, statut, etc.)

### Cas réel
Filtrer des données :
```python
data = [1, 2, 3, 4]

filtered = [x for x in data if x > 2]
```

Résultat : [3, 4]

---

## Erreurs fréquentes

⚠️ Erreur classique : modification inattendue
```python
a = [1,2]
b = a
b.append(3)
```

Cause : même référence mémoire  
Correction :
```python
b = a.copy()
```

💡 Astuce : utiliser id() pour vérifier

---

## Bonnes pratiques

🔧 Nommer clairement les variables  
🔧 Éviter les valeurs magiques  
🔧 Toujours tester les conditions limites  
🔧 Comprendre mutabilité vs immutabilité  
🔧 Éviter les effets de bord  

---

## Résumé

| Concept | Ce qu'il fait | À retenir |
|--------|-------------|----------|
| Typage dynamique | flexible | puissant mais piégeux |
| list vs tuple | mutabilité | impact critique |
| conditions | contrôle flux | simple mais critique |

---

## SNIPPETS DE RÉVISION

<!-- snippet
id: python_type_dynamic
tech: python
level: beginner
importance: high
format: knowledge
tags: python,types,concept
title: Typage dynamique en Python
content: Le type est attaché à la valeur et non à la variable
description: Permet flexibilité mais nécessite vigilance
-->

<!-- snippet
id: python_list_mutable_warning
tech: python
level: beginner
importance: high
format: knowledge
tags: python,list,mutation
title: Listes sont mutables
content: Modifier une liste partagée modifie toutes les références → utiliser copy()
description: Piège fréquent en Python
-->

<!-- snippet
id: python_if_structure
tech: python
level: beginner
importance: medium
format: knowledge
tags: python,condition
title: Structure conditionnelle
content: if elif else permet de contrôler le flux logique
description: Base du contrôle de flux
-->

<!-- snippet
id: python_for_loop
tech: python
level: beginner
importance: medium
format: knowledge
tags: python,boucle
title: Boucle for Python
content: La boucle for itère sur une séquence directement
description: Plus simple que dans d'autres langages
-->

