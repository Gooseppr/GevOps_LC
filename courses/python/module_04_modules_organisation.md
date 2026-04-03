---
layout: page
title: "Modules & organisation du code Python"

course: python
theme: "Syntaxe, Types & Structures"
type: lesson

chapter: 1
section: 4

tags: python,modules,import,organisation,package
difficulty: beginner
duration: 65
mermaid: false

theme_icon: "🐍"
theme_group: programming
theme_group_icon: "💻"
theme_order: 4
status: "draft"
---

# Modules & organisation du code Python

## Objectifs pédagogiques
- Comprendre le système de modules Python
- Structurer un projet proprement
- Utiliser correctement import et from import
- Séparer logique métier et exécution

## Contexte
Un script Python simple devient rapidement ingérable sans organisation. En production, le code doit être modulaire, lisible et maintenable.

## Principe de fonctionnement

🧠 Concept clé — Module  
Un module est simplement un fichier Python.

🧠 Concept clé — Package  
Un dossier contenant plusieurs modules (avec __init__.py ou implicite en Python 3.3+)

💡 Astuce — Penser en “responsabilités”  
Chaque module doit avoir un rôle précis

⚠️ Erreur fréquente — tout mettre dans un seul fichier  
→ difficile à maintenir → non scalable

---

## Syntaxe ou utilisation

### Import simple

```python
import math

print(math.sqrt(16))
```

Résultat : 4.0

---

### Import ciblé

```python
from math import sqrt

print(sqrt(16))
```

---

### Alias

```python
import math as m
```

---

## Organisation projet

Exemple structure :

```
project/
│
├── main.py
├── utils.py
└── services/
    ├── __init__.py
    └── user_service.py
```

---

### Point d’entrée ⭐

```python
if __name__ == "__main__":
    print("Lancement script")
```

Permet de différencier :
- exécution directe
- import module

---

## Cas d'utilisation

### Cas simple
Séparer fonctions utilitaires

### Cas réel
Backend API :

- routes/
- services/
- models/

Chaque dossier a une responsabilité claire

---

## Erreurs fréquentes

⚠️ Erreur classique : import circulaire  
Cause : modules dépendants entre eux  
Correction : restructurer dépendances

💡 Astuce : centraliser logique dans services

---

## Bonnes pratiques

🔧 1 module = 1 responsabilité  
🔧 Ne pas mélanger logique et exécution  
🔧 Utiliser des noms explicites  
🔧 Organiser par domaine métier  
🔧 Limiter les dépendances croisées  
🔧 Préparer structure scalable dès le début  

---

## Résumé

| Concept | Ce qu'il fait | À retenir |
|--------|-------------|----------|
| module | fichier | base Python |
| package | dossier | organisation |
| import | liaison | structuration |

---

## SNIPPETS DE RÉVISION

<!-- snippet
id: python_module_definition
type: concept
tech: python
level: beginner
importance: high
format: knowledge
tags: python,module
title: Module Python
content: Un module est un fichier Python contenant du code réutilisable
description: Base de l'organisation Python
-->

<!-- snippet
id: python_import_usage
type: concept
tech: python
level: beginner
importance: high
format: knowledge
tags: python,import
title: Import en Python
content: import permet de réutiliser du code d'autres modules
description: Essentiel pour modularité
-->

<!-- snippet
id: python_main_guard
type: concept
tech: python
level: beginner
importance: high
format: knowledge
tags: python,main
title: __name__ == main
content: Permet d'exécuter du code uniquement si fichier lancé directement
description: Sépare script et module
-->

<!-- snippet
id: python_import_cycle_warning
type: warning
tech: python
level: beginner
importance: high
format: knowledge
tags: python,import,error
title: Import circulaire
content: Module A importe B et B importe A → erreur → refactoriser dépendances
description: Problème classique
-->

