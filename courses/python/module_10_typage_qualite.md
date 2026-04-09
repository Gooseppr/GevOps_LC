---
layout: page
title: "Typage & qualité de code en Python"

course: python
chapter_title: "POO, Qualité & Tests"

chapter: 2
section: 2

tags: python,typing,quality,mypy,lint
difficulty: intermediate
duration: 85
mermaid: false

status: draft
---

# Typage & qualité de code en Python

## Objectifs pédagogiques
- Comprendre l'intérêt du typage en Python
- Utiliser les type hints correctement
- Améliorer la qualité du code avec des outils standards
- Détecter les erreurs avant l'exécution

## Contexte
Python est dynamique, ce qui accélère le développement mais augmente les risques d’erreurs en production. Le typage et les outils de qualité permettent de sécuriser le code.

## Principe de fonctionnement

🧠 Concept clé — Type hints  
Annotations permettant d’indiquer le type attendu d’une variable ou fonction.

💡 Astuce — Le typage n’est pas obligatoire mais fortement recommandé

⚠️ Erreur fréquente — ignorer le typage  
→ bugs détectés trop tard

---

## Syntaxe ou utilisation

### Type hints simples

```python
def add(a: int, b: int) -> int:
    return a + b
```

---

### Types complexes

```python
from typing import List, Dict

def process(data: List[int]) -> Dict[str, int]:
    return {"count": len(data)}
```

---

### mypy ⭐

```bash
mypy script.py
```

Permet de détecter les erreurs de typage avant exécution.

---

### Linting & format

```bash
black script.py
ruff check .
```

---

## Cas d'utilisation

### Cas simple
Sécuriser une fonction

### Cas réel
Projet backend :

- typage API
- validation données
- détection bugs avant prod

---

## Erreurs fréquentes

⚠️ Mauvais typage
```python
def f(x: int) -> int:
    return "string"
```

Cause : incohérence  
Correction : respecter types

💡 Astuce : utiliser mypy régulièrement

---

## Bonnes pratiques

🔧 Toujours typer les fonctions critiques  
🔧 Utiliser mypy en CI  
🔧 Formatter automatiquement le code  
🔧 Respecter conventions (PEP8)  
🔧 Documenter avec docstrings  
🔧 Simplifier signatures  

---

## Résumé

| Concept | Ce qu'il fait | À retenir |
|--------|-------------|----------|
| typing | annotations | sécurité |
| mypy | vérification | essentiel |
| lint | qualité | standard |

---

## SNIPPETS DE RÉVISION

<!-- snippet
id: python_type_hint_basic
type: concept
tech: python
level: intermediate
importance: high
format: knowledge
tags: python,typing
title: Type hints Python
content: Les type hints permettent de documenter et vérifier les types attendus
description: Améliore la qualité du code
-->

<!-- snippet
id: python_mypy_command
type: command
tech: python
level: intermediate
importance: high
format: knowledge
tags: python,mypy
title: Vérifier typage avec mypy
command: mypy script.py
description: Analyse les erreurs de type sans exécuter le code
-->

<!-- snippet
id: python_typing_warning
type: warning
tech: python
level: intermediate
importance: high
format: knowledge
tags: python,typing,error
title: Ignorer le typage
content: ne pas typer → bugs invisibles → utiliser type hints
description: piège courant
-->

