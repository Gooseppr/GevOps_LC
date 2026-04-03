---
layout: page
title: "Structures de données Python"

course: python
theme: "python"
type: lesson

chapter: 1
section: 3

tags: python,structures,list,dict,set,tuple
difficulty: beginner
duration: 70
mermaid: false

theme_icon: "🐍"
theme_group: programming
theme_group_icon: "💻"
theme_order: 3
status: "draft"
---

# Structures de données Python

## Objectifs pédagogiques
- Choisir la bonne structure de données selon le besoin
- Comprendre les différences de comportement (mutabilité, performance)
- Manipuler efficacement list, dict, set et tuple
- Éviter les pièges fréquents en production

## Contexte
Les structures de données sont au cœur de toutes les applications Python. Un mauvais choix entraîne des problèmes de performance, de bugs ou de lisibilité.

## Principe de fonctionnement

🧠 Concept clé — Chaque structure a un rôle précis  
- list → collection ordonnée modifiable  
- tuple → collection ordonnée immuable  
- set → collection unique non ordonnée  
- dict → mapping clé → valeur ⭐

💡 Astuce — dict est la structure la plus utilisée en backend

⚠️ Erreur fréquente — utiliser list au lieu de set pour vérifier appartenance  
→ complexité O(n) vs O(1)

---

## Syntaxe ou utilisation

### List

```python
data = [1, 2, 3]
data.append(4)
```

Résultat : [1, 2, 3, 4]

---

### Tuple

```python
coords = (10, 20)
```

Immuable → plus sûr et plus rapide.

---

### Set

```python
unique = {1, 2, 2, 3}
print(unique)
```

Résultat : {1, 2, 3}

---

### Dict

```python
user = {
    "name": "Goose",
    "age": 25
}

print(user["name"])
```

---

### Compréhensions ⭐

```python
squares = [x*x for x in range(5)]
```

Résultat : [0,1,4,9,16]

---

## Cas d'utilisation

### Cas simple
Stocker des données utilisateur → dict

### Cas réel
Filtrage performant :

```python
allowed = {1, 2, 3}

if 2 in allowed:
    print("ok")
```

Utilisation d’un set pour performance O(1)

---

## Erreurs fréquentes

⚠️ Erreur classique : KeyError
```python
user["email"]
```

Cause : clé absente  
Correction :
```python
user.get("email")
```

💡 Astuce : toujours utiliser .get() en production

---

## Bonnes pratiques

🔧 Utiliser dict pour données structurées  
🔧 Utiliser set pour recherche rapide  
🔧 Préférer tuple pour données fixes  
🔧 Éviter les listes pour lookup  
🔧 Utiliser comprehensions pour lisibilité  
🔧 Toujours vérifier les clés dict  

---

## Résumé

| Structure | Usage | À retenir |
|----------|------|----------|
| list | séquence | simple mais lente en lookup |
| tuple | fixe | immuable |
| set | unique | rapide |
| dict | clé/valeur | incontournable |

---

## SNIPPETS DE RÉVISION

<!-- snippet
id: python_dict_usage
type: concept
tech: python
level: beginner
importance: high
format: knowledge
tags: python,dict,structure
title: Dict est clé valeur
content: Un dictionnaire stocke des paires clé valeur avec accès rapide
description: Structure la plus utilisée en Python
-->

<!-- snippet
id: python_set_performance
type: concept
tech: python
level: beginner
importance: high
format: knowledge
tags: python,set,performance
title: Set pour lookup rapide
content: Un set permet des recherches en O(1) contrairement aux listes
description: Important pour performance
-->

<!-- snippet
id: python_keyerror_warning
type: warning
tech: python
level: beginner
importance: high
format: knowledge
tags: python,dict,error
title: KeyError sur dict
content: Accéder à une clé absente → erreur → utiliser get()
description: Eviter crash en production
-->

<!-- snippet
id: python_list_vs_set
type: concept
tech: python
level: beginner
importance: medium
format: knowledge
tags: python,list,set
title: List vs Set
content: list est ordonnée, set est unique et rapide
description: Choisir selon usage
-->

