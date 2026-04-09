---
layout: page
title: "Modules & organisation du code Python"

course: python
chapter_title: "Syntaxe, Types & Structures"

chapter: 1
section: 4

tags: python,modules,import,organisation,package
difficulty: beginner
duration: 65
mermaid: false

status: draft
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
content: `import module` charge le fichier et le met en cache dans `sys.modules` — les imports répétés ne rechargent pas le fichier. `from module import func` importe directement dans l'espace de noms local, sans préfixer par le nom du module.
description: Préférer les imports explicites (`from os.path import join`) aux imports glob (`from os.path import *`) qui polluent l'espace de noms et rendent le code difficile à déboguer.
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
content: Quand un fichier est importé, `__name__` vaut le nom du module. Quand il est lancé directement, `__name__` vaut `"__main__"`. Le bloc `if __name__ == "__main__":` permet d'avoir un fichier qui fonctionne à la fois comme script exécutable et comme module importable.
description: Sans ce garde-fou, importer un module qui contient `print()` ou des appels réseau au niveau module les exécuterait immédiatement à l'import.
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

