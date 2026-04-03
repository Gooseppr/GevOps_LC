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
tech: python
level: beginner
importance: high
format: knowledge
tags: python,exception
title: try except en Python
content: try permet d'exécuter du code et except capture les erreurs
description: Base de la gestion des erreurs
-->

<!-- snippet
id: python_except_warning
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
tech: python
level: beginner
importance: high
format: knowledge
tags: python,raise
title: Lever une exception
content: raise permet de déclencher une erreur volontairement
description: Contrôle du flux
-->

<!-- snippet
id: python_fail_fast
tech: python
level: beginner
importance: high
format: knowledge
tags: python,debug
title: Fail fast
content: détecter et arrêter immédiatement en cas d'erreur améliore le debug
description: Bonne pratique production
-->

