---
layout: page
title: "CLI & scripting Python"

course: python
chapter_title: "Erreurs, Fichiers & Scripting"

chapter: 1
section: 7

tags: python,cli,argparse,scripting,automation
difficulty: beginner
duration: 80
mermaid: false

status: draft
---

# CLI & scripting Python

## Objectifs pédagogiques
- Créer des scripts Python exécutables en ligne de commande
- Gérer des arguments avec argparse
- Automatiser des tâches système
- Structurer un script utilisable en production

## Contexte
En DevOps et backend, Python est massivement utilisé pour automatiser des tâches : déploiement, nettoyage de données, monitoring.

## Principe de fonctionnement

🧠 Concept clé — CLI (Command Line Interface)  
Permet d'interagir avec un programme via le terminal.

💡 Astuce — Toujours prévoir des arguments configurables  
Évite de modifier le code pour chaque exécution.

⚠️ Erreur fréquente — hardcoder des valeurs  
→ script non réutilisable

---

## Syntaxe ou utilisation

### Arguments simples

```python
import sys

print(sys.argv)
```

Résultat : liste des arguments passés au script.

---

### argparse ⭐

```python
import argparse

parser = argparse.ArgumentParser()

parser.add_argument("--name", required=True)

args = parser.parse_args()

print(args.name)
```

---

### Script exécutable

```bash
chmod +x script.py
```

```bash
./script.py --name Goose
```

---

## Cas d'utilisation

### Cas simple
Script de nettoyage de fichiers

### Cas réel
Script DevOps :

- récupérer logs
- filtrer erreurs
- envoyer rapport

---

## Erreurs fréquentes

⚠️ Erreur classique : arguments manquants  
Cause : mauvaise configuration argparse  
Correction : required=True

💡 Astuce : ajouter help pour chaque argument

---

## Bonnes pratiques

🔧 Toujours utiliser argparse  
🔧 Documenter les arguments  
🔧 Gérer les erreurs d'entrée  
🔧 Rendre les scripts idempotents  
🔧 Logger les actions importantes  
🔧 Tester les scripts en conditions réelles  

---

## Résumé

| Concept | Ce qu'il fait | À retenir |
|--------|-------------|----------|
| sys.argv | brut | limité |
| argparse | structuré | recommandé |
| CLI | interaction | essentiel |

---

## SNIPPETS DE RÉVISION

<!-- snippet
id: python_argparse_basic
type: concept
tech: python
level: beginner
importance: high
format: knowledge
tags: python,cli
title: argparse permet gérer arguments
content: argparse génère automatiquement le message d'aide (`--help`), valide les types des arguments et gère les valeurs par défaut. Contrairement à `sys.argv`, il rend les scripts auto-documentés et robustes sans code de parsing manuel.
description: `add_argument('--verbose', action='store_true')` crée un flag booléen. `add_argument('nb', type=int)` valide que l'argument est bien un entier.
-->

<!-- snippet
id: python_sys_argv
type: concept
tech: python
level: beginner
importance: medium
format: knowledge
tags: python,cli
title: sys.argv
content: sys.argv contient la liste brute des arguments passés au script
description: bas niveau CLI
-->

<!-- snippet
id: python_cli_warning
type: warning
tech: python
level: beginner
importance: high
format: knowledge
tags: python,cli,error
title: Hardcoder arguments
content: valeurs codées en dur → script non réutilisable → utiliser argparse
description: piège courant
-->

