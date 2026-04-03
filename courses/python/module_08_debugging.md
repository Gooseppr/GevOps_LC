---
layout: page
title: "Debugging & introspection en Python"

course: python
theme: "Erreurs, Fichiers & Scripting"
type: lesson

chapter: 1
section: 8

tags: python,debugging,introspection,pdb,logging
difficulty: beginner
duration: 75
mermaid: false

theme_icon: "🐍"
theme_group: programming
theme_group_icon: "💻"
theme_order: 8
status: "draft"
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
content: pdb permet d'inspecter le code en cours d'exécution
description: outil clé debug
-->

<!-- snippet
id: python_stacktrace
type: concept
tech: python
level: beginner
importance: high
format: knowledge
tags: python,error
title: Stack trace
content: la stack trace indique où et pourquoi une erreur se produit
description: essentiel pour debug
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

