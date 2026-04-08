---
layout: page
title: "Performance & optimisation en Python"

course: python
chapter_title: "Architecture & Performance"

chapter: 3
section: 2

tags: python,performance,profiling,optimisation,memory
difficulty: advanced
duration: 95
mermaid: false

status: draft
---

# Performance & optimisation en Python

## Objectifs pédagogiques
- Identifier les goulots d'étranglement dans un programme Python
- Utiliser des outils de profiling
- Optimiser le CPU et la mémoire
- Appliquer des optimisations pertinentes (et éviter les inutiles)

## Contexte
Python est simple mais pas toujours performant. En production, des problèmes de performance peuvent entraîner des coûts élevés et une mauvaise expérience utilisateur.

## Principe de fonctionnement

🧠 Concept clé — Profiling  
Mesurer où le temps est réellement passé dans le code.

💡 Astuce — Ne jamais optimiser sans mesurer ⭐

⚠️ Erreur fréquente — optimisation prématurée  
→ perte de temps sans gain réel

---

## Syntaxe ou utilisation

### Profiling avec cProfile ⭐

```bash
python -m cProfile script.py
```

Permet d'identifier les fonctions lentes.

---

### Optimisation simple

```python
# Mauvais
result = []
for i in range(1000):
    result.append(i*i)

# Meilleur
result = [i*i for i in range(1000)]
```

---

### Mémoire

```python
import sys

print(sys.getsizeof([1,2,3]))
```

---

## Cas d'utilisation

### Cas simple
Optimiser une boucle

### Cas réel
Backend API :

- endpoints lents
- requêtes DB inefficaces
- parsing de données

---

## Erreurs fréquentes

⚠️ Optimiser sans mesurer  
→ effort inutile

⚠️ Mauvais algorithme  
→ performance catastrophique

💡 Astuce : choisir bonne structure de données

---

## Bonnes pratiques

🔧 Mesurer avant optimiser  
🔧 Optimiser les algorithmes avant le code  
🔧 Utiliser structures adaptées  
🔧 Limiter les copies inutiles  
🔧 Éviter les boucles coûteuses  
🔧 Surveiller la mémoire  

---

## Résumé

| Concept | Définition courte | À retenir |
|--------|------------------|----------|
| profiling | mesurer | indispensable |
| optimisation | améliorer | ciblée |
| mémoire | usage RAM | critique |

Phrase clé : **Optimiser sans mesurer est une perte de temps.**

---

## SNIPPETS DE RÉVISION

<!-- snippet
id: python_cprofile_command
type: command
tech: python
level: advanced
importance: high
format: knowledge
tags: python,performance
title: Profiling avec cProfile
command: python -m cProfile script.py
description: Identifie les parties lentes du code
-->

<!-- snippet
id: python_optimization_warning
type: warning
tech: python
level: advanced
importance: high
format: knowledge
tags: python,performance,error
title: Optimisation prématurée
content: optimiser sans mesurer → perte de temps → profiler avant
description: erreur fréquente
-->

<!-- snippet
id: python_datastructure_perf
type: concept
tech: python
level: advanced
importance: high
format: knowledge
tags: python,performance
title: Choix structure
content: Liste : accès par index O(1), recherche O(n). Dict/Set : recherche O(1). deque : append/pop aux deux bouts O(1) (vs liste O(n) en début). Le mauvais choix ne se voit pas sur 100 éléments mais devient catastrophique à 100 000.
description: `timeit` et `cProfile` mesurent les vraies performances — ne pas deviner. Souvent, remplacer une liste par un set est la seule optimisation nécessaire.
-->

