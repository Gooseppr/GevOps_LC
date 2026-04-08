---
layout: page
title: "Environnement Python & Toolchain"

course: python
chapter_title: "Environnement & Toolchain"

chapter: 1
section: 1

tags: python,environnement,venv,pip,setup
difficulty: beginner
duration: 45
mermaid: false

status: draft
---

# Environnement Python & Toolchain

## Objectifs pédagogiques
- Installer Python et vérifier son bon fonctionnement
- Créer et utiliser des environnements virtuels
- Gérer les dépendances avec pip
- Structurer un projet Python simple

## Contexte
Python est utilisé dans des environnements variés (data, backend, DevOps). Sans isolation des dépendances, les projets deviennent instables et non reproductibles.

## Principe de fonctionnement

🧠 Concept clé — Environnement virtuel  
Un environnement virtuel isole les dépendances d’un projet.

💡 Astuce — Toujours créer un venv par projet  
Permet d’éviter les conflits de versions.

⚠️ Erreur fréquente — Installer globalement  
Cause : mélange des dépendances  
Correction : utiliser venv

## Installation

```bash
# Vérifier Python
python --version
```

Résultat attendu : affiche la version installée.

```bash
# Créer un environnement virtuel
python -m venv venv
```

```bash
# Activer (Linux/Mac)
source venv/bin/activate

# Activer (Windows)
venv\Scripts\activate
```

## Syntaxe ou utilisation

```python
# Vérifier l'environnement
import sys

print(sys.executable)
```

Affiche le chemin du Python utilisé.

## Cas d'utilisation

Cas simple : projet API  
→ isoler FastAPI et ses dépendances

Cas avancé : pipeline data  
→ gérer versions pandas/numpy

## Erreurs fréquentes

⚠️ Erreur classique : module non trouvé  
Cause : mauvais environnement actif  
Correction : activer le bon venv

💡 Astuce associée : vérifier sys.executable

## Bonnes pratiques

🔧 Toujours utiliser venv  
🔧 Versionner requirements.txt  
🔧 Ne jamais coder en global  
🔧 Nommer clairement les environnements  
🔧 Nettoyer les dépendances inutiles  

## Résumé

| Concept | Ce qu'il fait | À retenir |
|--------|-------------|----------|
| venv | isolation | indispensable |
| pip | gestion deps | utiliser requirements |
| sys.executable | debug env | vérifier contexte |

---

## SNIPPETS DE RÉVISION

<!-- snippet
id: python_venv_creation
type: command
tech: python
level: beginner
importance: high
format: knowledge
tags: python,venv,setup
title: Créer un environnement virtuel
command: python -m venv venv
description: Crée un environnement isolé pour un projet Python
-->

<!-- snippet
id: python_venv_activation
type: command
tech: python
level: beginner
importance: high
format: knowledge
tags: python,venv,activation
title: Activer un environnement virtuel
command: source venv/bin/activate
description: Active l'environnement virtuel sous Linux/Mac
-->

<!-- snippet
id: python_env_concept
type: concept
tech: python
level: beginner
importance: high
format: knowledge
tags: python,venv,concept
title: Rôle des environnements virtuels
content: Sans venv, pip installe les packages dans Python global — deux projets qui requièrent des versions différentes de la même lib entrent en conflit. Chaque venv a son propre répertoire `site-packages` totalement indépendant.
description: Toujours créer un venv avant d'installer quoi que ce soit dans un projet. C'est la première commande d'un projet Python propre.
-->

<!-- snippet
id: python_global_warning
type: warning
tech: python
level: beginner
importance: high
format: knowledge
tags: python,venv,erreur
title: Installer en global est dangereux
content: Installer globalement → conflits de dépendances → utiliser venv
description: Toujours isoler les dépendances
-->

