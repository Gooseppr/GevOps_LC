---
layout: page
title: "Debugging & introspection en Python"

course: python
chapter_title: "Erreurs, Fichiers & Scripting"

chapter: 1
section: 8

tags: python,debugging,introspection,pdb,logging
difficulty: beginner
duration: 75
mermaid: false

status: draft
---

# Debugging & introspection en Python

## Objectifs pédagogiques
- Comprendre comment analyser un bug Python
- Utiliser pdb pour debugger efficacement
- Exploiter les outils d’introspection (type, dir, help)
- Lire et interpréter une stack trace

## Contexte
En production, savoir écrire du code ne suffit pas. Il faut savoir diagnostiquer et corriger rapidement les erreurs.

## Principe de fonctionnement

🧠 Concept clé — Debugging  
Processus d’identification et correction des bugs.

💡 Astuce — Reproduire avant corriger  
Toujours isoler le problème.

⚠️ Erreur fréquente — corriger sans comprendre  
→ introduit d’autres bugs

---

## Syntaxe ou utilisation

### Debug simple

```python
print("debug:", variable)
```

Limité mais rapide.

---

### pdb ⭐

```python
import pdb

pdb.set_trace()
```

Permet de stopper l’exécution et inspecter.

Commandes utiles :
- n → next
- s → step
- c → continue
- p variable → print variable

---

### Introspection

```python
x = [1,2,3]

print(type(x))
print(dir(x))
help(x)
```

---

## Cas d'utilisation

### Cas simple
Comprendre une erreur de variable

### Cas réel
Debug API :

- erreur 500
- analyse stack trace
- reproduction bug
- correction ciblée

---

## Erreurs fréquentes

⚠️ Erreur classique : ignorer stack trace  
Cause : manque de compréhension  
Correction : lire ligne par ligne

💡 Astuce : remonter à la première erreur utile

---

## Bonnes pratiques

🔧 Toujours lire la stack trace  
🔧 Utiliser pdb plutôt que print  
🔧 Reproduire bug minimal  
🔧 Isoler les variables  
🔧 Ajouter logs utiles  
🔧 Ne jamais corriger “au hasard”  

---

## Résumé

| Concept | Ce qu'il fait | À retenir |
|--------|-------------|----------|
| pdb | debug avancé | essentiel |
| print | debug simple | limité |
| introspection | analyser objet | puissant |

---

## SNIPPETS DE RÉVISION

<!-- snippet
id: python_pdb_usage
type: concept
tech: python
level: beginner
importance: high
format: knowledge
tags: python,debug
title: pdb debugger Python
content: `import pdb; pdb.set_trace()` (ou `breakpoint()` depuis Python 3.7) suspend l'exécution et ouvre un shell interactif. On peut inspecter les variables, avancer pas à pas (`n`), entrer dans une fonction (`s`) et continuer (`c`).
description: `breakpoint()` respecte la variable `PYTHONBREAKPOINT` : mettre `PYTHONBREAKPOINT=0` désactive tous les breakpoints sans modifier le code.
-->

<!-- snippet
id: python_stacktrace
type: warning
tech: python
level: beginner
importance: high
format: knowledge
tags: python,error
title: Stack trace
content: La stack trace se lit de bas en haut : la dernière ligne indique l'erreur exacte (`TypeError: ...`) et la ligne juste au-dessus pointe le code qui l'a déclenchée. Les lignes suivantes remontent l'arbre d'appels jusqu'à l'origine.
description: L'erreur est toujours à la dernière ligne — commencer par lire ça avant de remonter la stack trace.
-->

<!-- snippet
id: python_debug_warning
type: warning
tech: python
level: beginner
importance: high
format: knowledge
tags: python,debug
title: Corriger sans comprendre
content: corriger sans analyser → nouveaux bugs → toujours comprendre avant
description: erreur critique
-->

