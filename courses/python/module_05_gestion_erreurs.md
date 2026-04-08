---
layout: page
title: "Gestion des erreurs en Python"

course: python
chapter_title: "Erreurs, Fichiers & Scripting"

chapter: 1
section: 5

tags: python,exceptions,erreurs,try,except
difficulty: beginner
duration: 70
mermaid: false

status: draft
---

# Gestion des erreurs en Python

## Objectifs pédagogiques
- Comprendre le fonctionnement des exceptions Python
- Gérer les erreurs proprement avec try/except
- Différencier erreurs techniques et erreurs métier
- Éviter les mauvaises pratiques critiques en production

## Contexte
En production, une erreur non gérée peut faire tomber un service entier. Python repose fortement sur les exceptions pour contrôler les erreurs.

## Principe de fonctionnement

🧠 Concept clé — Exception  
Une exception est un événement qui interrompt le flux normal du programme.

💡 Astuce — Fail fast  
Mieux vaut échouer vite que masquer une erreur.

⚠️ Erreur fréquente — except sans type  
→ masque toutes les erreurs → debug impossible

---

## Syntaxe ou utilisation

### Gestion simple

```python
try:
    x = int("abc")
except ValueError:
    print("Conversion impossible")
```

Résultat : affiche un message au lieu de crash.

---

### Plusieurs exceptions

```python
try:
    x = int("abc")
except (ValueError, TypeError):
    print("Erreur de conversion")
```

---

### finally

```python
try:
    f = open("file.txt")
finally:
    f.close()
```

---

### Lever une erreur

```python
raise ValueError("Erreur personnalisée")
```

---

## Cas d'utilisation

### Cas simple
Validation input utilisateur

### Cas réel
API backend :

```python
def get_user(user_id):
    if not user_id:
        raise ValueError("user_id requis")
```

Permet d’éviter des comportements incohérents.

---

## Erreurs fréquentes

⚠️ Erreur classique : except global

```python
try:
    ...
except:
    pass
```

Cause : ignore toutes les erreurs  
Conséquence : bugs silencieux  
Correction :
```python
except ValueError as e:
    print(e)
```

💡 Astuce : toujours logger les erreurs

---

## Bonnes pratiques

🔧 Catch uniquement les erreurs attendues  
🔧 Ne jamais utiliser except vide  
🔧 Logger toutes les erreurs  
🔧 Utiliser des exceptions métier  
🔧 Ne pas masquer les erreurs critiques  
🔧 Fail fast sur les incohérences  

---

## Résumé

| Concept | Ce qu'il fait | À retenir |
|--------|-------------|----------|
| try/except | capture erreur | éviter crash |
| raise | lever erreur | contrôle |
| finally | nettoyage | essentiel |

---

## SNIPPETS DE RÉVISION

<!-- snippet
id: python_try_except
type: concept
tech: python
level: beginner
importance: high
format: knowledge
tags: python,exception
title: try except en Python
content: `try/except` intercepte les exceptions sans arrêter le programme. Le bloc `finally` s'exécute dans tous les cas (succès ou erreur), utile pour libérer des ressources. `else` s'exécute uniquement si aucune exception n'a été levée.
description: Capturer `Exception` est trop large — toujours spécifier le type exact (`ValueError`, `FileNotFoundError`) pour ne pas masquer des bugs inattendus.
-->

<!-- snippet
id: python_except_warning
type: warning
tech: python
level: beginner
importance: high
format: knowledge
tags: python,error
title: Except vide dangereux
content: except sans type masque les erreurs → toujours spécifier le type
description: Piège critique
-->

<!-- snippet
id: python_raise_usage
type: concept
tech: python
level: beginner
importance: high
format: knowledge
tags: python,raise
title: Lever une exception
content: `raise` interrompt l'exécution et remonte la pile d'appels jusqu'au premier `except` compatible. Lever une exception personnalisée (`raise ValueError("message clair")`) donne au code appelant un signal précis sur ce qui s'est passé et pourquoi.
description: `raise` sans argument re-lève l'exception courante dans un bloc `except`, utile pour logguer avant de propager l'erreur sans la modifier.
-->

<!-- snippet
id: python_fail_fast
type: concept
tech: python
level: beginner
importance: high
format: knowledge
tags: python,debug
title: Fail fast
content: Un programme qui continue à tourner après une erreur silencieuse propage des données corrompues et produit des bugs difficiles à tracer. Lever une exception dès qu'une condition invalide est détectée localise le problème à sa source, pas 10 appels plus tard.
description: `assert` est utile en développement mais désactivable avec `-O`. Préférer `raise ValueError` pour les vérifications qui doivent tenir en production.
-->

