---
layout: page
title: "Tests en Python avec pytest"

course: python
chapter_title: "POO, Qualité & Tests"

chapter: 2
section: 4

tags: python,tests,pytest,unittest,quality
difficulty: intermediate
duration: 95
mermaid: false

status: draft
prev_module: "/courses/python/module_11_dependencies_packaging.html"
prev_module_title: "Gestion des dépendances & packaging Python"
next_module: "/courses/python/module_13_logging.html"
next_module_title: "Logging & observabilité en Python"
---

# Tests en Python avec pytest

## Objectifs pédagogiques
- Comprendre l’intérêt des tests automatisés
- Écrire des tests unitaires avec pytest
- Utiliser des fixtures pour structurer les tests
- Tester du code réel (API, fonctions métier)

## Contexte
En entreprise, un code non testé est considéré comme non fiable. Les tests permettent d’éviter les régressions et sécurisent les déploiements.

## Principe de fonctionnement

🧠 Concept clé — Test unitaire  
Test d’une unité de code isolée.

🧠 Concept clé — Test d’intégration  
Test de plusieurs composants ensemble.

💡 Astuce — Tester les cas limites  
Les bugs se cachent dans les cas extrêmes.

⚠️ Erreur fréquente — ne tester que le cas nominal  
→ bugs en production

---

## Syntaxe ou utilisation

### Installation

```bash
pip install pytest
```

---

### Test simple

```python
def add(a, b):
    return a + b

def test_add():
    assert add(2, 3) == 5
```

---

### Lancer les tests

```bash
pytest
```

---

### Fixtures ⭐

```python
import pytest

@pytest.fixture
def sample_data():
    return [1, 2, 3]

def test_len(sample_data):
    assert len(sample_data) == 3
```

---

## Cas d'utilisation

### Cas simple
Tester une fonction

### Cas réel
Backend API :

- tests endpoints
- validation inputs
- gestion erreurs

---

## Erreurs fréquentes

⚠️ Tests inutiles  
→ tester du code trivial

⚠️ Tests fragiles  
→ dépendances externes

💡 Astuce : mocker les dépendances

---

## Bonnes pratiques

🔧 Tester les cas limites  
🔧 Isoler les tests  
🔧 Utiliser fixtures  
🔧 Automatiser dans CI  
🔧 Ne pas dépendre d’un état externe  
🔧 Nommer clairement les tests  

---

## Résumé

| Concept | Ce qu'il fait | À retenir |
|--------|-------------|----------|
| pytest | framework | standard |
| assert | validation | simple |
| fixture | setup | puissant |

---

## SNIPPETS DE RÉVISION

<!-- snippet
id: python_pytest_install
type: command
tech: python
level: intermediate
importance: high
format: knowledge
tags: python,pytest
title: Installer pytest
command: pip install pytest
description: Installe le framework de test Python
-->

<!-- snippet
id: python_test_basic
type: concept
tech: python
level: intermediate
importance: high
format: knowledge
tags: python,tests
title: Test unitaire
content: Un test unitaire vérifie une fonction isolée
description: Base des tests
-->

<!-- snippet
id: python_fixture_usage
type: concept
tech: python
level: intermediate
importance: medium
format: knowledge
tags: python,pytest
title: Fixtures pytest
content: Les fixtures permettent de préparer des données pour les tests
description: Réutilisation efficace
-->

<!-- snippet
id: python_test_warning
type: warning
tech: python
level: intermediate
importance: high
format: knowledge
tags: python,tests,error
title: Tester uniquement nominal
content: tester seulement cas normal → bugs en prod → tester cas limites
description: piège critique
-->
