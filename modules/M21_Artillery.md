---
title: Test de montée en charge - Locust & Artillery
sujet: Déploiement Continu (CD), Versionning, Intégration continue (CI)
type: module
jour: 21
ordre: 2
tags: cd, test, artillery, python, devops
---


# 5️⃣ Artillery — Tests de montée en charge (complément à Locust)

> Objectif : découvrir Artillery (outil Node.js) pour le load testing, comprendre quand l’utiliser vs Locust, savoir écrire un fichier unique de test (config + scenarios), l’exécuter en CLI et l’intégrer à GitLab CI.
> 

## 📌 Pourquoi Artillery ?

- **YAML/JS simple** pour décrire **phases** (arrivée d’utilisateurs, ramp-up) + **scénarios** (flows HTTP).
- **Seuils de perf** (p95/p99, codes HTTP, Apdex) qui **font échouer** la CI si non tenus.
- **Rapports** JSON → HTML intégrés.
- Écosystème Node : facile à installer/embarquer (`npx artillery`), scripts NPM, monorepos JS.

---

## ⚔️ Locust vs Artillery — que choisir ?

| Critère | **Locust** (Python) | **Artillery** (Node.js) |
| --- | --- | --- |
| Langage / écosystème | Python (tests en code Python) | Node.js (YAML ou JS) |
| Modélisation du user | Code Python (classe `HttpUser`, `@task`) | YAML/JS déclaratif (flows, loops, payloads) |
| Démarrage rapide | UI web locale + CLI headless | CLI `npx artillery run` |
| Seuils / SLO | Via scripts/CI + plugins | **Plugins `ensure`, `apdex`** (natifs) |
| Rapports | CSV/HTML (plugins/outils) | JSON → **HTML** (natif) |
| Distribué | Master/Workers (très solide) | Via runners/Cloud (ou orchestré côté CI) |
| Points forts | Scénarios Python riches, mocks, extensibilité | YAML concis, **seuils natifs**, CI-friendly |
| Points de vigilance | Python requis dans l’image CI | Node requis; syntaxe YAML stricte |

**Règle simple** :

- Tu es **à l’aise en Python** / scénarios dynamiques complexes → **Locust**.
- Tu veux un **YAML autoportant**, seuils intégrés, et t’es dans un **stack JS** → **Artillery**.

---

## 🛠️ Installer Artillery (au choix)

### 1) Sans rien installer globalement (recommandé)

> Utilise npx (Node ≥ 16 conseillé)
> 

```bash
npx artillery@latest --version
npx artillery run loadtest.yml

```

### 2) En dépendance de projet (devDependency)

```bash
# npm
npm install --save-dev artillery
# pnpm
pnpm add -D artillery
# yarn
yarn add -D artillery

```

Ajoute un script dans `package.json` :

```json
{
  "scripts": {
    "loadtest": "artillery run loadtest.yml",
    "loadreport": "artillery report report.json -o report.html"
  }
}

```

Puis :

```bash
npm run loadtest
npm run loadreport

```

### 3) Global (si tu veux la commande partout)

```bash
npm install -g artillery@latest
artillery --version
artillery run loadtest.yml

```

### 4) Docker (pas de Node à installer sur la machine)

```bash
docker run --rm -v "$PWD":/app -w /app node:20 \
  npx artillery@latest run -o report.json loadtest.yml

docker run --rm -v "$PWD":/app -w /app node:20 \
  npx artillery@latest report report.json -o report.html

```

---

### ✅ Vérifier que tout est OK

```bash
node -v        # idéalement >= 16/18/20
npm -v
npx artillery@latest --version

```

## 🧱 Fichier Artillery — structure (un seul YAML)

Un fichier **unique** avec **deux blocs** : `config` (cible, phases, plugins, payloads…) et `scenarios` (flows).

### ✅ Exemple complet (ton scénario intégré & seuils)

```yaml
# loadtest.yml
config:
  target: http://asciiart.artillery.io:8080
  phases:
    - duration: 60
      arrivalRate: 1
      rampTo: 5
      name: Warm up
    - duration: 60
      arrivalRate: 5
      rampTo: 10
      name: Ramp up
    - duration: 30
      arrivalRate: 10
      rampTo: 30
      name: Spike

  plugins:
    ensure:
      thresholds:
        - http.response_time.p99: 100    # p99 <= 100ms
        - http.response_time.p95: 75     # p95 <= 75ms
        # - http.codes.2xx: 95%          # (selon version: % de 2xx)
    apdex:
      threshold: 100
    metrics-by-endpoint: {}

  http:
    timeout: 2000
    # headers:
    #   Authorization: "Bearer {{ token }}"

scenarios:
  - name: Get 3 animal pictures
    flow:
      - loop:
          - get: { url: "/dino" }
          - get: { url: "/pony" }
          - get: { url: "/armadillo" }
        count: 100

```

### Variantes utiles

- **Pause (think time)** :
    
    ```yaml
    - think: 2
    
    ```
    
- **Variables** :
    
    ```yaml
    config:
      variables:
        userId: 42
    scenarios:
      - flow:
        - get: { url: "/users/{{ userId }}" }
    
    ```
    
- **Payload CSV** (login) :
    
    ```yaml
    config:
      payload:
        path: users.csv
        fields: ["email","password"]
    scenarios:
      - flow:
        - post:
            url: "/login"
            json: { email: "{{ email }}", password: "{{ password }}" }
    
    ```
    
- **Capture & réutilisation (token)** :
    
    ```yaml
    - post:
        url: "/login"
        json: { user: "john", pass: "doe" }
        capture:
          - json: "$.token"
            as: token
    - get:
        url: "/me"
        headers:
          Authorization: "Bearer {{ token }}"
    
    ```
    

---

## 🖥️ CLI Artillery — commandes indispensables

### Démarrer un test

```bash
# Simple
npx artillery run loadtest.yml

# Override de la cible
npx artillery run --target https://staging.example.com loadtest.yml

```

### Rapports

```bash
# JSON brut
npx artillery run -o report.json loadtest.yml

# Rapport HTML (lisible et partageable)
npx artillery report report.json -o report.html

```

### Options fréquentes

- `-target URL` : change la cible sans toucher au YAML
- `-output|-o report.json` : export des métriques brutes
- `-overrides` : patch rapide de `config` (phases, target…) via JSON inline
- `-environment` : charger un bloc `environments` si tu en définis dans `config`

---

## 🤝 Intégration GitLab CI — job robuste avec seuils & rapport

```yaml
stages: [loadtest]

loadtest:
  stage: loadtest
  image: node:20-bookworm
  variables:
    ARTILLERY_TARGET: "https://app.example.com"  # override optionnel
  before_script:
    - node -v && npm -v
    - npm i -g artillery@latest
  script:
    - artillery run --target "${ARTILLERY_TARGET}" -o report.json loadtest.yml
    - artillery report report.json -o report.html
  artifacts:
    when: always
    paths:
      - report.json
      - report.html
    expire_in: 7 days
  # rules:
  #   - if: '$CI_COMMIT_BRANCH == "main"'
  #   - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'

```

- Les **seuils** dans `plugins.ensure.thresholds` donnent un **exit code ≠ 0** si non respectés → **le job échoue** (parfait pour bloquer une MR).
- Ajoute un **job “smoke”** (phases courtes) + un **job “load”** (plus long) pour séparer validation rapide et campagne lourde.

---

## 🌐 “Via le site” — que propose Artillery Cloud ?

- Lancement **hébergé** et **distribué** de tests, sans gérer d’infra.
- **Dashboards** interactifs, historisation des runs, comparaisons de versions.
- **Planification** de campagnes récurrentes (ex: nightly), **alertes**.
- Intégrations CI/CD (GitHub, GitLab) & SLO/thresholds centralisés.

> Utile si tu veux scaler sans monter toi-même des runners distribués.
> 

---

## 🧭 Quand préférer l’un ou l’autre ?

- **Locust** : tu veux **scripter en Python**, faire du **scénario complexe**, manipuler des libs Python (auth JWT custom, data science, etc.).
- **Artillery** : tu veux **YAML déclaratif** + **seuils natifs** + **rapport HTML**, et tu es déjà dans un **stack JS** (Node/Vite/Next).

---

## 🧪 Recettes express

### 1) Smoke test (CI rapide)

```bash
npx artillery run --target http://127.0.0.1:8000 loadtest.yml

```

### 2) Campagne avec rapport HTML

```bash
npx artillery run -o report.json loadtest.yml \
 && npx artillery report report.json -o report.html

```

### 3) Même YAML, cibles différentes (staging/prod)

```bash
npx artillery run --target https://staging.example.com loadtest.yml
npx artillery run --target https://example.com loadtest.yml

```

---

## 🧠 À retenir

> Artillery brille par son YAML concis, ses seuils natifs et ses rapports faciles à partager.
> 
> **Locust** excelle quand le **code Python** est la meilleure façon d’exprimer un scénario.
> 
> Garde **un smoke test** court en CI et **une campagne** plus lourde en planifiée — avec des **seuils** qui **font foi**.
>

---
[← Module précédent](M21_Tests_Charge_Locust.md)
---
