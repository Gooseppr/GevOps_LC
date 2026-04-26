# Coursite — Contexte projet pour Claude

## Ce que fait l'application

**Coursite** est une plateforme de formation en ligne sur les thèmes DevOps / Cloud / Scripting.
Elle est composée de deux parties :

1. **Site Jekyll statique** hébergé sur GitHub Pages — contient les modules de formation, les cours thématiques et une navigation par tags/jours.
2. **Pipeline Python** (`pipeline/`) — automatise la génération des index, de la navigation, des emails quotidiens de révision, et la génération de contenu via l'API Claude.

---

## Stack technique

| Couche | Technologie |
|--------|------------|
| Site statique | Jekyll + thème Minima, Liquid templates |
| Frontend JS | `assets/nav.js` + `assets/nav-data.json` (arbre de navigation) |
| Diagrammes | Mermaid (mindmaps, flowcharts dans les `.md`) |
| Automation | Python 3.12+ (scripts `pipeline/`) |
| Emails | Brevo SMTP (`email_daily_review.py`) |
| CI/CD | GitHub Actions (`.github/workflows/daily_review.yml`) |
| Secrets | Windows Credential Manager (`keyring`) + GitHub Secrets |
| Génération IA | API Anthropic via `pipeline/ai_generate_course.py` |

---

## Structure des dossiers

```
Coursite/
├── modules/          # ~130+ modules de formation (M01_*.md, M02_*.md, B00_*.md)
├── jours/            # Pages agrégées par jour (générées par pipeline)
├── courses/          # Cours thématiques (docker/, cloud-aws/, python/, ...)
├── _data/            # JSON générés (snippets.json, courses.json, nav-data.json)
├── _layouts/         # Templates Liquid (home.html, page.html, course-index.html)
├── _includes/        # Partials Liquid (course-lock.html, head.html)
├── assets/           # CSS, JS, nav-data.json
├── pipeline/         # Tous les scripts Python d'automation
├── .github/workflows/# GitHub Actions
└── _config.yml       # Config Jekyll
```

---

## Pipeline — runners et scripts clés

### Convention de nommage
- `run_*.py` — orchestrateurs qui enchaînent plusieurs scripts
- `mod_*.py` — scripts unitaires pour les modules
- `crs_*.py` — scripts unitaires pour les cours
- `data_*.py` — scripts unitaires pour les données/snippets
- `ai_*.py` — scripts utilisant l'API Claude
- `git_push.py`, `email_*.py`, `config_*.py` — scripts utilitaires

### Après édition de `modules/`
```bash
python pipeline/run_modules.py
```
Exécute : mod_extract_subjects → mod_build_days → mod_tags_to_days → mod_update_index → mod_nav_links → git_push

### Après édition de `courses/`
```bash
python pipeline/run_courses.py
```
Exécute : mod_fix_frontmatter → crs_update_indexes → crs_scan_index → crs_scan_themes → crs_nav_links → git_push

### Après ajout de snippets dans les `.md`
```bash
python pipeline/run_snippets.py
```
Exécute : data_extract_snippets → git_push

### Rebuild complet
```bash
python pipeline/run_full.py
```
Enchaîne run_modules + run_courses + data_extract_snippets + git_push

### Emails quotidiens
```bash
python pipeline/email_daily_review.py              # Envoie 5 snippets/utilisateur par email
python pipeline/email_daily_review.py --dry-run    # Génère dry_run_<nom>.html sans envoyer ni toucher l'état
python pipeline/email_daily_review.py --user Greg  # Envoie uniquement pour un utilisateur (nom ou email)
```

Le rendu HTML de `email_daily_review.py` affiche pour chaque snippet `command` :
1. La commande générique avec les `<VAR>` mises en valeur (violet/italique)
2. Un bloc vert "▶ Exemple concret" si le champ `example:` est présent
3. Un lien **"Voir le cours →"** en bas de carte pointant vers la page source sur le site

### API Flask (déclenchement externe / n8n)
```bash
python pipeline/api_server.py            # http://localhost:5055
```

---

## Fichiers de config importants

| Fichier | Rôle |
|---------|------|
| `pipeline/review_config.json` | Destinataires email, filtres par user (tech/level), SMTP config |
| `pipeline/review_state.json` | État de progression par user (snippets déjà envoyés) |
| `_config.yml` | Config Jekyll (baseurl, plugins, titre) |
| `_data/course_passwords.yml` | Mots de passe des cours (hachés) |
| `.gitignore` | Exclut : `pipeline/*`, `prompt/`, `Code/`, `.env` |

---

## Snippets — format dans les `.md`

Les snippets sont des blocs de commentaires HTML dans les modules/cours, parsés en clés `key: value` :

```html
<!-- snippet
id: docker_run_port_mapping
type: command              # command | concept | warning | tip | error
tech: docker
level: beginner            # beginner | intermediate | advanced
importance: high           # high | medium | low
format: knowledge
tags: docker,port,run
title: Exposer un port avec -p
context: contexte d'usage optionnel
command: docker run -p <PORT>:80 nginx     # obligatoire si type=command
example: docker run -p 8080:80 nginx       # exemple concret (obligatoire si command contient <VAR>)
description: Description courte du comportement.
-->
```

Pour les types `concept`, `warning`, `tip`, `error`, utiliser `content:` à la place de `command:`.

**Règle `example`** : tout snippet `command` dont la commande contient une variable `<VAR>` doit avoir un champ `example:` avec une valeur concrète et réaliste. Les commandes sans variable n'ont pas besoin d'exemple.

Extraits par `data_extract_snippets.py` → `_data/snippets.json`.

---

## Déploiement

- **Push sur `main`** → GitHub Pages construit et déploie automatiquement le site Jekyll.
- **URL du site** : `https://gooseppr.github.io/GevOps_LC`
- **GitHub Actions** → email quotidien à 10h CET (08:00 UTC).
- Les scripts Python commitent eux-mêmes via `git_push.py`.

---

## Conventions de contenu

### Frontmatter modules (`modules/M*.md`)
```yaml
---
layout: page
title: "Titre du module"
day: 1
tags: [bash, scripting]
---
```

### Frontmatter cours (`courses/*/chapitre.md`)
```yaml
---
layout: page
title: "Titre chapitre"
course: cloud-aws
chapter_title: "Fondations AWS"     # Nom de la section (groupement dans la sidebar)
chapter: 1                          # Numéro du chapitre (tri principal)
section: 3                          # Position dans le chapitre (tri secondaire)
tags: aws,ec2,compute,network
difficulty: beginner                # beginner | intermediate | advanced
duration: 75                        # Durée estimée en minutes
mermaid: true                       # Activer le support Mermaid
status: published
prev_module: "/courses/cloud-aws/aws_module_02_iam.html"
prev_module_title: "IAM — Gestion des identités AWS"
next_module: "/courses/cloud-aws/aws_module_04_storage.html"
next_module_title: "Stockage AWS — S3 / EBS / EFS"
---
```

> **Note** : `prev_module` / `next_module` sont générés automatiquement par `crs_nav_links.py`. Ne pas les renseigner à la main lors de la création d'un module — le pipeline s'en charge. En revanche `chapter`, `section` et `chapter_title` doivent être définis manuellement car ils déterminent l'ordre de tri.

### Organisation des chapitres dans un cours

Les modules sont triés par `(chapter, section, title)`. La convention de numérotation :

| Chapter | Usage |
|---------|-------|
| **0** | Références (cheat sheet, glossaire) — apparaît en premier dans la sidebar |
| **1** | Fondations / Bases |
| **2** | Services / Intermédiaire |
| **3+** | Avancé, spécialisations |

Chaque nouveau cours devrait idéalement inclure un chapitre 0 "Références" avec :
- Une **Cheat Sheet** (`<slug>_cheatsheet.md`) — tableaux comparatifs, arbres de décision, limites, aide-mémoire
- Un **Glossaire** (`<slug>_glossaire_services.md`) — définitions courtes d'une ligne + liens vers les modules du cours

### Exclure un fichier du site et de la sidebar (`published: false`)

Pour qu'un fichier `.md` ne soit ni build par Jekyll, ni inclus dans la navigation (sidebar, index, prev/next) :

```yaml
---
published: false
---
```

C'est le **seul champ nécessaire** — il est respecté par :
- **Jekyll** (natif : ne build pas la page HTML)
- **`crs_scan_index.py`** (n'inclut pas le module dans `courses.json` / `nav-data.json`)
- **`crs_nav_links.py`** (n'inclut pas le module dans la chaîne prev/next)

Si `published: false` est placé dans le `index.md` d'un cours, **le cours entier** est exclu.

**Cas d'usage** : fichiers de planification (PLAN.md, PLANBIS.md), brouillons, cours en préparation.

> **Important** : ne pas utiliser de liste statique de noms de fichiers dans les scripts pipeline pour exclure des fichiers. Toujours utiliser `published: false` dans le frontmatter.

---

## Ce qu'il ne faut pas toucher sans raison

- `_data/snippets.json`, `_data/courses.json`, `assets/nav-data.json` — **générés automatiquement**, ne pas éditer à la main.
- `pipeline/review_state.json` — état vivant des envois email, ne pas réinitialiser sans `state_reset_review.py`.
- `jours/` — pages générées par `mod_build_days.py`.
