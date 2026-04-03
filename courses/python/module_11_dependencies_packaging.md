---
layout: page
title: "Gestion des dépendances & packaging Python"

course: python
chapter_title: "POO, Qualité & Tests"

chapter: 2
section: 3

tags: python,dependencies,packaging,poetry,pip
difficulty: intermediate
duration: 90
mermaid: false

status: draft
---

# Gestion des dépendances & packaging Python

## Objectifs pédagogiques
- Comprendre comment Python gère les dépendances
- Utiliser requirements.txt et pyproject.toml
- Installer et versionner proprement les librairies
- Éviter les conflits de dépendances en production

## Contexte
La majorité des bugs en production Python viennent d’un mauvais contrôle des dépendances. Un projet non reproductible est inutilisable en équipe.

## Principe de fonctionnement

🧠 Concept clé — Dépendance  
Une librairie externe utilisée par ton projet.

🧠 Concept clé — Versioning  
Chaque dépendance a une version précise → impact direct sur ton code.

💡 Astuce — Toujours figer les versions  
Permet de garantir un comportement stable.

⚠️ Erreur fréquente — installer sans version  
→ comportement imprévisible

---

## Syntaxe ou utilisation

### Installer une dépendance

```bash
pip install requests
```

---

### Générer requirements.txt

```bash
pip freeze > requirements.txt
```

---

### Installer depuis requirements

```bash
pip install -r requirements.txt
```

---

### Poetry ⭐ (moderne)

```bash
pip install poetry
poetry init
poetry add requests
```

---

## Cas d'utilisation

### Cas simple
Installer une librairie API

### Cas réel
Projet backend :

- API → FastAPI
- DB → psycopg2
- config → pydantic

Toutes les dépendances sont versionnées

---

## Erreurs fréquentes

⚠️ Version flottante
```txt
requests
```

Cause : version non fixée  
Correction :
```txt
requests==2.31.0
```

⚠️ Conflits de dépendances  
→ incompatibilités entre libs

💡 Astuce : utiliser environnement propre + lock file

---

## Bonnes pratiques

🔧 Toujours figer les versions  
🔧 Utiliser requirements ou poetry.lock  
🔧 Isoler chaque projet  
🔧 Mettre à jour régulièrement  
🔧 Tester après upgrade  
🔧 Nettoyer dépendances inutiles  

---

## Résumé

| Concept | Ce qu'il fait | À retenir |
|--------|-------------|----------|
| pip | installer | simple |
| requirements | figer | essentiel |
| poetry | moderne | recommandé |

---

## SNIPPETS DE RÉVISION

<!-- snippet
id: python_pip_install
type: command
tech: python
level: intermediate
importance: high
format: knowledge
tags: python,pip
title: Installer une dépendance
command: pip install <PACKAGE>
description: Installe une librairie Python
-->

<!-- snippet
id: python_requirements_freeze
type: command
tech: python
level: intermediate
importance: high
format: knowledge
tags: python,requirements
title: Générer requirements
command: pip freeze > requirements.txt
description: Sauvegarde les dépendances du projet
-->

<!-- snippet
id: python_dependency_warning
type: warning
tech: python
level: intermediate
importance: high
format: knowledge
tags: python,dependencies,error
title: Version non fixée
content: dépendance sans version → comportement instable → utiliser ==
description: piège fréquent
-->

<!-- snippet
id: python_poetry_usage
type: concept
tech: python
level: intermediate
importance: medium
format: knowledge
tags: python,poetry
title: Poetry gestion deps
content: Poetry permet gérer dépendances et packaging proprement
description: outil moderne recommandé
-->

