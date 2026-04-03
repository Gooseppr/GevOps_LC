---
layout: page
title: "Environnement & outils"

course: python
theme: "Fondations"
type: lesson

chapter: 1
section: 1

tags: python,installation,venv,pip,pyenv,environnement
difficulty: beginner
duration: 25
mermaid: false

status: "published"
next_module: "/courses/python/python_ch1_2.html"
next_module_title: "Syntaxe de base & types"
---

# Environnement & outils

## Objectifs pédagogiques

- Installer Python et vérifier sa version
- Comprendre pourquoi isoler ses projets avec un environnement virtuel
- Créer et activer un environnement virtuel avec `venv`
- Gérer les dépendances avec `pip` et `requirements.txt`
- Écrire et lancer un premier script Python

---

## Contexte

Avant d'écrire la moindre ligne de Python, il faut mettre en place un environnement de travail propre. Sans cela, les projets partagent les mêmes versions de bibliothèques, ce qui provoque des conflits difficiles à diagnostiquer. Un environnement virtuel isole chaque projet dans sa propre bulle.

---

## Vérifier l'installation Python

```bash
python --version
# ou
python3 --version
```

Sur Windows, `python` et `python3` pointent souvent vers la même chose. Sur Linux/Mac, `python` peut désigner Python 2 (obsolète).

```bash
which python3        # Linux/Mac : chemin de l'interpréteur
where python         # Windows
```

---

## Gérer plusieurs versions avec pyenv

`pyenv` permet d'installer et de basculer entre plusieurs versions de Python sans toucher à l'installation système.

```bash
# Installation (Linux/Mac)
curl https://pyenv.run | bash

# Lister les versions disponibles
pyenv install --list

# Installer une version spécifique
pyenv install 3.12.3

# Définir la version globale
pyenv global 3.12.3

# Définir une version locale (par projet, crée un .python-version)
pyenv local 3.11.8

# Vérifier la version active
pyenv version
```

Sur Windows, l'équivalent s'appelle `pyenv-win` et s'installe via winget ou PowerShell.

---

## Environnements virtuels avec venv

Un environnement virtuel est un dossier qui contient une copie de l'interpréteur Python et un espace isolé pour les packages.

### Création

```bash
# Créer un environnement virtuel nommé .venv dans le dossier courant
python -m venv .venv
```

Le dossier `.venv` contient `bin/` (ou `Scripts/` sur Windows), `lib/` et `pyvenv.cfg`.

### Activation

```bash
# Linux / Mac
source .venv/bin/activate

# Windows (PowerShell)
.venv\Scripts\Activate.ps1

# Windows (cmd)
.venv\Scripts\activate.bat
```

Une fois activé, le prompt affiche `(.venv)` et `python` pointe vers l'interpréteur de l'environnement virtuel.

### Désactivation

```bash
deactivate
```

---

## Gérer les dépendances avec pip

```bash
# Installer un package
pip install requests

# Installer une version précise
pip install requests==2.31.0

# Installer plusieurs packages d'un coup
pip install requests flask pandas

# Désinstaller
pip uninstall requests

# Lister les packages installés
pip list

# Voir les détails d'un package
pip show requests
```

### Sauvegarder et restaurer les dépendances

```bash
# Exporter les dépendances actuelles
pip freeze > requirements.txt

# Réinstaller depuis requirements.txt (sur une autre machine ou dans un nouveau venv)
pip install -r requirements.txt
```

Exemple de `requirements.txt` :

```
requests==2.31.0
flask==3.0.2
pandas==2.2.1
```

---

## Premier script Python

Créez un fichier `hello.py` :

```python
# hello.py
nom = input("Quel est ton prénom ? ")
print(f"Bonjour, {nom} !")
```

Lancez-le :

```bash
python hello.py
```

Pour rendre un script exécutable directement sous Linux/Mac, ajoutez en première ligne :

```python
#!/usr/bin/env python3
```

Puis : `chmod +x hello.py` et `./hello.py`.

---

## Bonnes pratiques

- Toujours créer un venv par projet, jamais installer en global sauf outils CLI
- Ajouter `.venv/` au `.gitignore`
- Versionner `requirements.txt` (ou `pyproject.toml` pour les projets modernes)
- Nommer le dossier `.venv` (convention la plus répandue)
- Utiliser `pip install -e .` pour installer son propre package en mode éditable

---

## Résumé

| Commande | Rôle |
|---|---|
| `python --version` | Vérifier la version |
| `python -m venv .venv` | Créer un environnement virtuel |
| `source .venv/bin/activate` | Activer le venv (Linux/Mac) |
| `.venv\Scripts\activate` | Activer le venv (Windows) |
| `pip install <pkg>` | Installer un package |
| `pip freeze > requirements.txt` | Sauvegarder les dépendances |
| `pip install -r requirements.txt` | Restaurer les dépendances |

---

<!-- snippet
id: python_env_venv_create
type: command
tech: python
level: beginner
importance: high
format: knowledge
tags: venv,environnement,isolation
title: Créer un environnement virtuel Python
command: python -m venv .venv
description: Crée un environnement virtuel isolé dans le dossier .venv du projet courant.
-->

<!-- snippet
id: python_env_venv_activate_linux
type: command
tech: python
level: beginner
importance: high
format: knowledge
tags: venv,activation,linux,mac
title: Activer un venv sous Linux/Mac
command: source .venv/bin/activate
description: Active l'environnement virtuel .venv. Le prompt affiche (.venv) pour confirmer l'activation.
-->

<!-- snippet
id: python_env_venv_activate_windows
type: command
tech: python
level: beginner
importance: high
format: knowledge
tags: venv,activation,windows
title: Activer un venv sous Windows
command: .venv\Scripts\activate.bat
description: Active l'environnement virtuel .venv sous Windows (cmd). Utiliser Activate.ps1 pour PowerShell.
-->

<!-- snippet
id: python_env_pip_freeze
type: command
tech: python
level: beginner
importance: high
format: knowledge
tags: pip,dependances,requirements
title: Exporter les dépendances du projet
command: pip freeze > requirements.txt
description: Génère un fichier requirements.txt avec toutes les versions exactes des packages installés.
-->

<!-- snippet
id: python_env_pip_install_requirements
type: command
tech: python
level: beginner
importance: high
format: knowledge
tags: pip,dependances,requirements,restauration
title: Installer les dépendances depuis requirements.txt
command: pip install -r requirements.txt
description: Installe tous les packages listés dans requirements.txt, idéal pour reproduire un environnement.
-->

<!-- snippet
id: python_env_venv_gitignore
type: tip
tech: python
level: beginner
importance: high
format: knowledge
tags: venv,git,gitignore
title: Toujours exclure .venv du dépôt git
content: Ajouter .venv/ dans .gitignore pour ne pas versionner l'environnement virtuel.
description: Le dossier .venv peut contenir des centaines de fichiers binaires inutiles à versionner. Versionner requirements.txt suffit.
-->

<!-- snippet
id: python_env_global_install_warning
type: warning
tech: python
level: beginner
importance: high
format: knowledge
tags: pip,global,conflit
title: Ne pas installer de packages en global
content: Installer des packages avec pip sans venv actif les place dans l'environnement Python système, créant des conflits entre projets.
description: Sans venv, tous les projets partagent les mêmes versions de packages. Un upgrade pour un projet peut casser un autre.
-->
