---
layout: page
title: Intégration continue - GitLab Runner
sujet: Intégration continue (CI)
type: module
jour: 18
ordre: 3
tags: flake8, ci, gitlab, devops
---

# 🧹 **Cours complet : Flake8**

## 🎯 Introduction

### Qu’est-ce que Flake8 ?

**Flake8** est un outil de **vérification du style et de la qualité du code Python**.

Il analyse ton code source pour détecter :

- les erreurs de **syntaxe**,
- les violations du style **PEP 8**,
- les variables inutilisées,
- les imports redondants ou manquants,
- les lignes trop longues,
- et certaines mauvaises pratiques de programmation.

Flake8 **n’exécute pas ton code**, il le lit et le **vérifie statiquement**.

### Pourquoi l’utiliser ?

✅ **Assurer la cohérence** du code dans un projet d’équipe

✅ **Détecter des erreurs potentielles** avant exécution

✅ **Normaliser** ton code selon les conventions PEP8

✅ **Faciliter les revues de code** et l’intégration continue

✅ **Préparer ton code à la production ou à l’open-source**

---

## ⚙️ Fonctionnement global

Flake8 est un **wrapper** (une surcouche) autour de plusieurs outils :

| Outil | Rôle |
| --- | --- |
| **PyFlakes** | Détecte les erreurs de logique et d’imports inutiles |
| **pycodestyle** (anciennement pep8) | Vérifie le respect du style PEP8 |
| **McCabe** | Mesure la complexité cyclomatique des fonctions |
| *(+ Plugins optionnels)* | Ex : `flake8-docstrings`, `flake8-bugbear`, etc. |

---

## 🧩 Installation et exécution de base

### Installation locale

```bash
pip install flake8

```

Tu peux vérifier la version :

```bash
flake8 --version

```

### Vérifier un fichier ou un dossier

```bash
flake8 script.py
flake8 mon_projet/

```

### Exemple de sortie

```
mon_projet/utils.py:15:1: F401 'os' imported but unused
mon_projet/main.py:22:80: E501 line too long (90 > 79 characters)
mon_projet/api.py:10:5: C901 'process_data' is too complex (11)

```

Chaque ligne indique :

```
fichier:ligne:colonne: code_erreur message

```

---

## 🔠 Codes d’erreurs les plus courants

| Catégorie | Préfixe | Signification |
| --- | --- | --- |
| **E*** | Erreurs de style selon PEP8 |  |
| **W*** | Avertissements de style |  |
| **F*** | Erreurs détectées par PyFlakes |  |
| **C*** | Complexité cyclomatique (McCabe) |  |
| **B*** | Règles supplémentaires (bugbear) |  |
| **D*** | Documentation (docstrings) |  |

Exemples :

- `E501` : ligne trop longue
- `F401` : import inutilisé
- `F841` : variable assignée mais jamais utilisée
- `C901` : fonction trop complexe
- `E302` : trop ou pas assez de lignes vides entre fonctions

---

## 🧱 Création d’un fichier de configuration `.flake8`

Ce fichier te permet d’adapter Flake8 à ton projet.

### Exemple simple

`.flake8`

```
[flake8]
max-line-length = 100
ignore = E203, E266, E501, W503
exclude = .git,__pycache__,build,dist

```

**Explications :**

- `max-line-length` : nombre max de caractères par ligne
- `ignore` : liste d’erreurs à ignorer
- `exclude` : fichiers/répertoires exclus de l’analyse

---

## ⚙️ Exemple avancé

`.flake8`

```
[flake8]
max-line-length = 100
max-complexity = 10
extend-ignore = E203, W503
exclude = .git,__pycache__,venv,build,dist,migrations
per-file-ignores =
    __init__.py:F401
    tests/*:D
select = C,E,F,W,B,B9
statistics = True
count = True

```

### Points clés :

- `max-complexity` : limite la complexité des fonctions (C901)
- `per-file-ignores` : ignorer certaines règles sur certains fichiers
- `extend-ignore` : ajoute des codes ignorés sans remplacer ceux par défaut
- `select` : restreint les vérifications à certaines catégories
- `statistics` : affiche un résumé chiffré
- `count` : affiche le nombre total d’erreurs

---

## 🧪 Commandes utiles

| Commande | Description |
| --- | --- |
| `flake8` | Analyse tous les fichiers |
| `flake8 chemin/fichier.py` | Analyse un fichier |
| `flake8 --count` | Affiche le nombre total d’erreurs |
| `flake8 --statistics` | Résumé par code d’erreur |
| `flake8 --show-source` | Montre la ligne fautive |
| `flake8 --format=html --htmldir=report` | Sortie HTML (avec plugin `flake8-html`) |
| `flake8 --extend-ignore F401` | Ignorer une erreur en CLI |

---

## 🔌 Intégration CI/CD avec GitLab

L’objectif est de **vérifier automatiquement la qualité du code** à chaque push ou merge request.

### Exemple simple de `.gitlab-ci.yml`

```yaml
stages:
  - lint

flake8_lint:
  stage: lint
  image: python:3.11
  script:
    - pip install flake8
    - flake8 .
  only:
    - merge_requests
    - main

```

### Variante avec rapport HTML

```yaml
flake8_lint:
  stage: lint
  image: python:3.11
  script:
    - pip install flake8 flake8-html
    - flake8 --format=html --htmldir=flake8-report
  artifacts:
    paths:
      - flake8-report

```

💡 **Bonnes pratiques :**

- L’étape `lint` doit être **bloquante** pour les erreurs critiques (F, E).
- Tu peux autoriser des warnings (W) si tu veux juste de l’information.

---

## 🔍 Exemple d’intégration locale avec Git Hook

Si tu veux exécuter Flake8 **avant chaque commit**, utilise un hook Git :

```bash
mkdir -p .git/hooks
cat > .git/hooks/pre-commit <<'EOF'
#!/bin/bash
echo "Running Flake8..."
flake8 .
if [ $? -ne 0 ]; then
  echo "Flake8 failed! Commit aborted."
  exit 1
fi
EOF
chmod +x .git/hooks/pre-commit

```

Ainsi, si Flake8 trouve une erreur, ton commit sera refusé.

---

## ⚡ Compléments et plugins utiles

Tu peux enrichir Flake8 avec des **plugins spécialisés** :

| Plugin | Rôle |
| --- | --- |
| `flake8-bugbear` | bonnes pratiques Python |
| `flake8-docstrings` | vérifie la présence/qualité des docstrings |
| `flake8-import-order` | ordre logique des imports |
| `flake8-comprehensions` | simplifie les compréhensions |
| `flake8-eradicate` | détecte le code commenté |
| `flake8-html` | génère un rapport HTML lisible |

Exemple d’installation :

```bash
pip install flake8 flake8-bugbear flake8-docstrings

```

Puis tu peux les activer via `select` ou `extend-select` dans `.flake8`.

---

## 🧠 Résumé rapide

| Objectif | Commande / Fichier |
| --- | --- |
| Lancer Flake8 | `flake8 .` |
| Lancer sur un fichier | `flake8 mon_script.py` |
| Ignorer des erreurs | `.flake8 → ignore = E501,F401` |
| Générer un rapport HTML | `flake8 --format=html --htmldir=report` |
| Intégrer à GitLab CI | Bloc `flake8_lint` dans `.gitlab-ci.yml` |
| Ajouter dans un hook Git | `.git/hooks/pre-commit` |
| Ajouter des plugins | `pip install flake8-bugbear flake8-docstrings` |

---

## 🧩 Exemple complet de projet

```
mon_projet/
│
├── .flake8
├── .gitlab-ci.yml
├── requirements.txt
└── src/
    ├── main.py
    └── utils.py

```

`.flake8`

```
[flake8]
max-line-length = 100
extend-ignore = E203, W503
exclude = venv, .git, __pycache__, build
max-complexity = 10
statistics = True
count = True

```

`.gitlab-ci.yml`

```yaml
stages:
  - lint
  - test

flake8_lint:
  stage: lint
  image: python:3.11
  script:
    - pip install flake8
    - flake8 src/

```

---

## 🎓 Entraînement

👉 Lance :

```bash
flake8 src/

```

Puis modifie ton code pour corriger les erreurs une par une.

Reviens ensuite sur le fichier `.flake8` pour **ignorer volontairement certaines règles** (ex. E501, F401) et constate comment cela change les résultats.



<!-- snippet
id: cicd_flake8_install_run
type: command
tech: cicd
level: beginner
importance: high
format: knowledge
tags: flake8,python,lint,qualite
title: Installer et lancer Flake8
context: vérifier la qualité et le style d'un projet Python
command: pip install flake8 && flake8 .
description: Installe Flake8 via pip puis analyse tous les fichiers Python du répertoire courant. Chaque ligne de sortie indique fichier:ligne:colonne:code_erreur message.
-->

<!-- snippet
id: cicd_flake8_config_file
type: concept
tech: cicd
level: intermediate
importance: high
format: knowledge
tags: flake8,python,configuration,pep8
title: Configurer Flake8 via .flake8
context: adapter les règles Flake8 aux contraintes d'un projet sans modifier le code
content: Le fichier .flake8 à la racine du projet configure max-line-length, ignore (codes à ignorer), exclude (dossiers exclus) et max-complexity.
-->

<!-- snippet
id: cicd_flake8_config_per_file
type: concept
tech: cicd
level: intermediate
importance: medium
format: knowledge
tags: flake8,python,per-file-ignores,select
title: Options avancées du fichier .flake8
context: affiner la configuration Flake8 pour ignorer des règles selon les fichiers
content: per-file-ignores permet d'ignorer des règles spécifiques sur certains fichiers (ex. __init__.py:F401, tests/*:D). select restreint les vérifications à certaines catégories (C,E,F,W,B).
-->

<!-- snippet
id: cicd_flake8_error_codes
type: concept
tech: cicd
level: beginner
importance: medium
format: knowledge
tags: flake8,python,codes,erreur
title: Codes d'erreur Flake8 essentiels
context: interpréter les résultats d'une analyse Flake8
content: E* = erreurs de style PEP8 (E501 ligne trop longue, E302 lignes vides manquantes). W* = avertissements de style. F* = erreurs PyFlakes (F401 import inutilisé).
-->

<!-- snippet
id: cicd_flake8_error_codes_b
type: concept
tech: cicd
level: beginner
importance: medium
format: knowledge
tags: flake8,python,codes,erreur,complexite
title: Codes d'erreur Flake8 avancés (C* et B*)
context: interpréter les résultats d'une analyse Flake8 sur la complexité et les pratiques
content: C* = complexité cyclomatique McCabe (C901 fonction trop complexe). F841 = variable assignée mais jamais utilisée. B* = règles supplémentaires bugbear (bonnes pratiques Python).
-->

<!-- snippet
id: cicd_flake8_gitlab_ci
type: concept
tech: cicd
level: intermediate
importance: high
format: knowledge
tags: flake8,python,gitlab,ci,lint
title: Intégrer Flake8 dans un pipeline GitLab CI
context: bloquer automatiquement les merge requests contenant du code Python non conforme
content: Ajouter un job lint dans .gitlab-ci.yml avec image python:3.11, script pip install flake8 && flake8 ., et only: [merge_requests, main]. Le job est bloquant par défaut.
-->

<!-- snippet
id: cicd_flake8_pre_commit_hook
type: concept
tech: cicd
level: intermediate
importance: medium
format: knowledge
tags: flake8,python,git,hook,pre-commit
title: Bloquer les commits avec un hook pre-commit Flake8
context: éviter de pusher du code non conforme en vérifiant dès le commit local
content: Créer .git/hooks/pre-commit avec flake8 . puis exit 1 si le code de retour est non nul. Rendre exécutable avec chmod +x .git/hooks/pre-commit pour bloquer les commits non conformes.
-->

---
[← Module précédent](M18_azure_devops.md)
---
