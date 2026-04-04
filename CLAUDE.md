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
| Emails | Brevo SMTP (`ZZ_daily_review.py`) |
| CI/CD | GitHub Actions (`.github/workflows/daily_review.yml`) |
| Secrets | Windows Credential Manager (`keyring`) + GitHub Secrets |
| Génération IA | API Anthropic via `pipeline/Z_generate_course.py` |

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

## Pipeline — scripts clés

### Modules pipeline (après édition de `modules/`)
```bash
python pipeline/ZZ_run_push.py
```
Exécute : sujets-module → modules_jours → tags_jours → update_index → modules_prec_suiv → git push

### Cours pipeline (après édition de `courses/`)
```bash
python pipeline/ZZ_run_all.py
```
Exécute : fix_frontmatter → update_course_indexes → scan_courses → scan_themes → courses_prec_suiv → git push

### Snippets & emails quotidiens
```bash
python pipeline/Z0_extract_snippets.py   # Extrait les blocs <!-- snippet --> → _data/snippets.json
python pipeline/ZZ_daily_review.py       # Envoie 5 snippets/utilisateur par email
```

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

Les snippets sont des blocs HTML dans les modules/cours :
```html
<!-- snippet id="unique-id" tech="docker" level="medium" priority="high" title="Titre" -->
Contenu du snippet (markdown ou code)
<!-- /snippet -->
```
Extraits par `Z0_extract_snippets.py` → `_data/snippets.json`.

---

## Déploiement

- **Push sur `main`** → GitHub Pages construit et déploie automatiquement le site Jekyll.
- **GitHub Actions** → email quotidien à 10h CET (08:00 UTC).
- Les scripts Python commitent eux-mêmes via `ZY_auto_push.py`.

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
course: docker
order: 3
prev: /courses/docker/02-images
next: /courses/docker/04-volumes
---
```

---

## Ce qu'il ne faut pas toucher sans raison

- `_data/snippets.json`, `_data/courses.json`, `assets/nav-data.json` — **générés automatiquement**, ne pas éditer à la main.
- `pipeline/review_state.json` — état vivant des envois email, ne pas réinitialiser sans `Z0_reset_state.py`.
- `jours/` — pages générées par `Z0_modules_jours.py`.
