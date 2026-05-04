---
layout: page
title: "Guide pratique — Tester et observer simultanément (Cypress, k6, Supertest)"
course: observabilité
chapter_title: "Guides pratiques"
chapter: 1
section: 3
tags: observabilité,test,qa,cypress,k6,supertest,locust,pytest,e2e,performance,opentelemetry,docker
difficulty: intermediate
duration: 150
mermaid: false
status: published
prev_module: "/courses/observabilité/guide-pratique_aws.html"
prev_module_title: "Guide pratique — Observabilité sur AWS (CloudWatch, X-Ray, ADOT)"
---

# Guide pratique — Tester et observer simultanément (Cypress, k6, Supertest)

> Monter un lab qui combine **tests automatisés** (E2E, API, performance) et **stack d'observabilité** sur la même application de demo.
> L'objectif n'est pas de tester l'application — c'est d'utiliser les tests comme générateur de trafic réaliste pour apprendre à corréler ce que voit l'utilisateur (échecs Cypress, latence k6) avec ce qu'on voit dans Prometheus, Loki et Tempo.

---

## Pourquoi coupler test et observabilité

En production, un bug n'est presque jamais visible dans une seule source. Un test E2E qui échoue ne dit pas *pourquoi* — il faut descendre dans les traces, les logs, et les métriques pour trouver la cause racine.

Ce lab s'appuie sur le même OpenTelemetry Demo que le [guide open source](/courses/observabilité/guide-pratique_open-source.html). On garde la stack Prometheus / Grafana / Loki / Tempo et on lui injecte des tests, en observant ce qu'ils révèlent.

| Type de test | Ce que ça génère côté observabilité |
|--------------|--------------------------------------|
| Cypress (E2E) | Trace complète frontend → backend, logs utilisateur réalistes |
| Supertest / pytest (API) | Requêtes ciblées, taux d'erreur par endpoint |
| Locust / k6 (perf) | Charge soutenue, métriques RED, saturation visible |
| REST Client | Sondes manuelles ponctuelles |

---

## Architecture du lab

Le lab tourne dans un devcontainer pour isoler les outils de test, et se connecte à la stack d'observabilité via le réseau Docker.

```
devcontainers/test-lab/
├── .devcontainer/
│   └── devcontainer.json
├── docker-compose.yml
└── tests/
    ├── cypress/
    ├── api/
    ├── perf/
    └── postman/
```

### devcontainer.json

```json
{
  "name": "test-observability-lab",
  "dockerComposeFile": "../docker-compose.yml",
  "service": "dev",
  "workspaceFolder": "/workspace",

  "features": {
    "ghcr.io/devcontainers/features/docker-in-docker:2": {},
    "ghcr.io/devcontainers/features/node:1": {},
    "ghcr.io/devcontainers/features/python:1": {}
  },

  "customizations": {
    "vscode": {
      "extensions": [
        "ms-azuretools.vscode-docker",
        "ms-python.python",
        "cypress-io.cypress-snippets",
        "humao.rest-client"
      ]
    }
  }
}
```

### docker-compose.yml

```yaml
version: "3.9"

services:

  dev:
    build: .devcontainer
    volumes:
      - .:/workspace
      - /var/run/docker.sock:/var/run/docker.sock
    command: sleep infinity

  app:
    image: ghcr.io/open-telemetry/opentelemetry-demo:latest
    ports:
      - "8080:8080"
```

> En pratique, on lance le `docker-compose.yml` de la stack open source en parallèle (Prometheus, Grafana, Loki, Tempo) et on cible l'app via `host.docker.internal:8080`.

### Installation des outils

Dans le container de dev :

```bash
# Outils Node
npm install -g cypress jest supertest

# Outils Python
pip install pytest locust requests

# Installation de k6
apt-get update && apt-get install -y gnupg
curl https://dl.k6.io/key.gpg | gpg --dearmor -o /usr/share/keyrings/k6.gpg
echo "deb [signed-by=/usr/share/keyrings/k6.gpg] https://dl.k6.io/deb stable main" \
  > /etc/apt/sources.list.d/k6.list
apt-get update && apt-get install -y k6
```

---

## Cypress — tests E2E

Cypress simule un vrai utilisateur dans un navigateur. C'est l'outil idéal pour générer des traces frontend complètes.

### Installation

```bash
npm init -y
npx cypress open
```

### Test minimal

```javascript
describe('Homepage', () => {
  it('loads correctly', () => {
    cy.visit('http://localhost:8080')
    cy.contains('Shop')
  })
})
```

### Lien avec l'observabilité

Pendant un test Cypress, on peut suivre dans la stack :

- **Tempo** → la trace complète, du clic utilisateur jusqu'à la base de données
- **Loki** → les logs côté backend pour la requête en question (filtrage par `trace_id`)
- **Prometheus** → l'impact sur les métriques RED (latence, erreurs)

Le test Cypress devient alors un *déclencheur* d'événement observable, pas juste une assertion.

---

## Supertest — tests API (Node)

Supertest cible directement l'API HTTP. Plus rapide que Cypress, plus précis pour valider des contrats d'API.

```bash
npm install supertest axios
```

```javascript
const request = require('supertest')

describe('API test', () => {
  it('GET /api/products', async () => {
    const res = await request('http://localhost:8080')
      .get('/api/products')

    expect(res.statusCode).toBe(200)
  })
})
```

---

## pytest — tests API (Python)

Variante Python, utile quand le reste du projet l'est aussi.

```python
import requests

def test_products():
    r = requests.get("http://localhost:8080/api/products")
    assert r.status_code == 200
```

---

## Locust — tests de performance

Locust écrit ses scénarios en Python. Confortable pour des charges modérées et des scénarios métier.

### locustfile.py

```python
from locust import HttpUser, task, between

class User(HttpUser):
    wait_time = between(1, 2)

    @task
    def index(self):
        self.client.get("/")

    @task
    def products(self):
        self.client.get("/api/products")
```

### Lancer

```bash
locust -H http://localhost:8080
```

UI disponible sur [http://localhost:8089](http://localhost:8089).

---

## k6 — tests de performance (recommandé)

k6 est le standard moderne pour la perf. Plus performant que Locust, plus proche des outils utilisés en entreprise.

```javascript
import http from 'k6/http'

export default function () {
  http.get('http://localhost:8080')
}
```

```bash
k6 run script.js
```

Pour un test de charge plus réaliste :

```bash
k6 run --vus 50 --duration 2m script.js
```

---

## REST Client (VS Code)

Plus léger que Postman, idéal pour des sondes manuelles pendant qu'on regarde Grafana.

### fichier `.http`

```http
GET http://localhost:8080/api/products

###

POST http://localhost:8080/api/cart
Content-Type: application/json

{ "productId": "OLJCESPC7Z", "quantity": 1 }
```

---

## Ce qu'il faut observer pendant chaque type de test

| Type de test | Signaux clés à regarder |
|--------------|-------------------------|
| Cypress | Trace bout en bout, latence par span, logs erreurs corrélés |
| Locust / k6 | RPS, p95, taux d'erreurs, saturation CPU et mémoire |
| API (Supertest, pytest) | Taux de succès, logs backend, erreurs silencieuses (200 OK avec payload incorrect) |

L'idée est d'apprendre à passer du *symptôme* (test rouge) à la *cause* (span lent dans Tempo, log d'exception dans Loki) sans intuition aveugle.

---

## Exercices pratiques

### Exercice 1 — Identifier un service lent sous charge

**Déclencher** :

```bash
k6 run --vus 50 --duration 2m script.js
```

**Observer** :
- Prometheus → la latence p95 par service
- Tempo → les traces les plus longues, identifier le span dominant

**Conclusion attendue** : un service backend précis explique la latence (ex : paiement à 2 s alors que le frontend reste à 15 ms).

### Exercice 2 — Corréler une erreur Cypress avec un log backend

**Déclencher** :

```bash
docker stop <container_checkout>
npx cypress run
```

**Observer** :
- Cypress → le test checkout échoue
- Loki → erreurs `connection refused` ou `5xx` côté backend
- Prometheus → la métrique `up` du service tombe à 0

### Exercice 3 — Mesurer la saturation sous Locust

**Déclencher** :

```bash
locust -H http://localhost:8080 --users 100 --spawn-rate 10
```

**Observer** :
- Node Exporter / cAdvisor → CPU et mémoire
- Prometheus → la latence augmente avec le nombre d'utilisateurs
- Tempo → identifier où le temps est passé quand le système sature

---

## Pièges fréquents

| Piège | Conséquence |
|-------|-------------|
| Lancer des tests sans regarder l'observabilité | On valide qu'un endpoint répond 200, mais on rate les erreurs silencieuses ou la latence anormale |
| Tester sans charge réaliste | Les bugs liés à la concurrence ou à la saturation n'apparaissent jamais |
| Multiplier les outils | Mieux vaut maîtriser deux outils (un E2E + un perf) que jongler avec cinq |
| Ne pas corréler par `trace_id` | On retrouve un log erreur sans savoir à quelle requête utilisateur il correspond |

---

## Stack finale recommandée

Pour un parcours QA orienté observabilité :

- **Cypress** → tests E2E
- **Supertest** ou **pytest** → tests API
- **k6** → performance
- **REST Client** → debug rapide pendant l'investigation

Le but n'est pas d'empiler des outils, c'est de boucler le cycle **tester → observer → corréler** sur la même app, avec la même stack qu'en prod.
