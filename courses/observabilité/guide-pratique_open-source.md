---
layout: page
title: "Guide pratique — Stack open source (Prometheus, Grafana, Loki, Tempo)"
course: observabilité
chapter_title: "Guides pratiques"
chapter: 1
section: 1
tags: observabilité,prometheus,grafana,loki,tempo,opentelemetry,docker,alerting,logs,metriques,traces
difficulty: intermediate
duration: 180
mermaid: false
status: published
next_module: "/courses/observabilité/guide-pratique_aws.html"
next_module_title: "Guide pratique — Observabilité sur AWS (CloudWatch, X-Ray, ADOT)"
---

# Guide pratique — Stack open source (Prometheus, Grafana, Loki, Tempo)

> Deployer une stack d'observabilite complete en local avec Docker.
> On utilise l'application de demo OpenTelemetry (Astronomy Shop) comme terrain de jeu pour collecter logs, metriques et traces, puis diagnostiquer des incidents simules.

---

## 1. Application de demo : OpenTelemetry Demo (Astronomy Shop)

### Pourquoi ce choix

Cette app coche toutes les cases SRE/observabilite :

- microservices (frontend + backend + services internes)
- HTTP + gRPC + base de donnees
- logs structures
- metriques Prometheus natives
- traces distribuees OpenTelemetry natives
- dependances simulees (paiement, catalogue, etc.)
- latence et erreurs injectables
- trafic generable facilement

En clair : c'est exactement ce que tu auras en prod dans une vraie boite.

### Deploiement minimal (version app seule)

```yaml
version: "3.9"

services:
  otel-demo:
    image: ghcr.io/open-telemetry/opentelemetry-demo:latest
    ports:
      - "8080:8080"
```

```bash
docker compose up -d
```

### Acces et endpoints utiles

- App : http://localhost:8080
- `/` → frontend
- `/api/products`
- `/api/cart`
- `/api/checkout`

### Generer du trafic

Option simple (curl) :

```bash
while true; do curl -s http://localhost:8080 > /dev/null; sleep 0.5; done
```

Option plus realiste :

```bash
docker run --rm -it williamyeh/hey \
  -z 2m -q 10 -c 50 http://host.docker.internal:8080
```

### Provoquer des incidents

La capacite a provoquer des incidents est essentielle pour l'apprentissage.

**Latence artificielle** — dans certaines routes (checkout), tu peux simuler un ralentissement reseau ou un backend lent.

**Erreurs HTTP** — panier vide → erreurs, paiement → erreurs simulees.

**Crash service** :

```bash
docker ps
docker stop <container>
```

---

## 2. Architecture cible — stack open source complete

### Composants

| Composant | Role |
|-----------|------|
| Prometheus | Metriques |
| Grafana | Visualisation |
| Loki | Logs |
| Promtail | Collecte logs |
| Tempo | Traces |
| OTEL Collector | Hub observabilite |
| Node Exporter | Metriques systeme |
| cAdvisor | Metriques Docker |
| Alertmanager | Alertes |

### Origine des donnees

| Source | Type |
|--------|------|
| Application | Logs + metriques + traces |
| Docker | Metriques conteneur |
| Machine | CPU, RAM, disque |

### docker-compose.yml

```yaml
version: "3.9"

services:

  app:
    image: ghcr.io/open-telemetry/opentelemetry-demo:latest
    ports:
      - "8080:8080"
    depends_on:
      - otel-collector

  otel-collector:
    image: otel/opentelemetry-collector-contrib
    volumes:
      - ./otel-config.yaml:/etc/otel/config.yaml
    command: ["--config=/etc/otel/config.yaml"]

  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"

  loki:
    image: grafana/loki
    ports:
      - "3100:3100"

  promtail:
    image: grafana/promtail
    volumes:
      - /var/log:/var/log
      - ./promtail.yml:/etc/promtail/config.yml

  tempo:
    image: grafana/tempo
    ports:
      - "3200:3200"

  node-exporter:
    image: prom/node-exporter
    ports:
      - "9100:9100"

  cadvisor:
    image: gcr.io/cadvisor/cadvisor
    ports:
      - "8081:8080"
```

```bash
docker compose up -d
```

### Acces

| Service | URL |
|---------|-----|
| Grafana | http://localhost:3000 |
| Prometheus | http://localhost:9090 |
| Loki | http://localhost:3100 |
| Tempo | http://localhost:3200 |

---

## 3. Logs

### Definition

Un log = evenement horodate. C'est la premiere source d'information quand quelque chose ne va pas.

### Types de logs

| Type | Exemple |
|------|---------|
| Applicatif | Erreur HTTP, exception Java |
| Systeme | Message kernel |
| Conteneur | stdout Docker |

### Requetes LogQL

Rechercher les erreurs :

```
{job="app"} |= "error"
```

Filtrer par code HTTP :

```
{job="app"} | json | status=500
```

Chercher les timeouts sur le frontend :

```
{container="frontend"} |= "timeout"
```

### Objectif

Savoir trouver rapidement :
- les erreurs et leur contexte
- les comportements anormaux (pics de logs, patterns inhabituels)
- la correlation avec les traces (via le `trace_id` dans les logs structures)

---

## 4. Metriques

### Types de metriques Prometheus

| Type | Description |
|------|-------------|
| Counter | Valeur qui ne fait qu'incrementer (ex: nombre total de requetes) |
| Gauge | Valeur instantanee qui monte et descend (ex: memoire utilisee) |
| Histogram | Distribution de valeurs dans des buckets (ex: latence) |
| Summary | Percentiles pre-calcules cote client |

### Methode RED

La methode RED est le standard pour monitorer un service :

- **R**ate → requetes par seconde
- **E**rrors → pourcentage d'erreurs
- **D**uration → latence (p50, p95, p99)

### Exemples PromQL

Taux de requetes par seconde :

```promql
rate(http_requests_total[1m])
```

Taux d'erreurs 5xx :

```promql
sum(rate(http_requests_total{status=~"5.."}[5m]))
```

Latence au 95e percentile :

```promql
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

### Dashboard essentiel a construire dans Grafana

- RPS (requetes par seconde)
- Taux d'erreurs en %
- Latence p95
- CPU par conteneur
- Memoire par conteneur
- Nombre de restarts

---

## 5. Traces

### Concepts

| Terme | Description |
|-------|-------------|
| Trace | Parcours complet d'une requete a travers tous les services |
| Span | Une etape individuelle dans la trace (ex: appel HTTP, requete BDD) |
| Trace ID | Identifiant unique qui relie tous les spans d'une meme requete |

### Exemple de diagnostic

Probleme : le checkout est lent.

La trace dans Tempo montre :
- Span frontend → 15 ms (OK)
- Span backend → 20 ms (OK)
- Span service paiement → 2 300 ms (lent)

Conclusion : la dependance externe (service de paiement) est le goulot d'etranglement, pas l'application elle-meme.

---

## 6. Alerting

### Bonnes pratiques

| Principe | Exemple |
|----------|---------|
| Alerter sur les symptomes, pas les causes | "Latence > 500 ms" plutot que "CPU > 80%" |
| Chaque alerte doit etre actionnable | Si tu ne peux rien faire → ce n'est pas une alerte |
| Eviter le bruit | Trop d'alertes = alertes ignorees |

### Exemple de regle Alertmanager

```yaml
- alert: HighErrorRate
  expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
  for: 2m
  labels:
    severity: critical
  annotations:
    summary: "Taux d'erreurs 5xx superieur a 5%"
```

---

## 7. Exercices pratiques

### Exercice 1 — Diagnostiquer une latence elevee

**Declencher** : generer de la charge avec `hey`

```bash
docker run --rm -it williamyeh/hey \
  -z 2m -q 10 -c 50 http://host.docker.internal:8080
```

**Observer** :
- Prometheus → requete PromQL sur la latence p95
- Tempo → identifier le span le plus lent

**Conclusion attendue** : identifier le service backend responsable du goulot d'etranglement.

### Exercice 2 — Trouver la cause d'erreurs HTTP 500

**Declencher** :

```bash
curl http://localhost:8080/api/checkout
```

**Observer** :
- Loki → requete LogQL `{job="app"} | json | status=500`
- Prometheus → pic sur le taux d'erreurs

### Exercice 3 — Reagir a une saturation CPU

**Declencher** :

```bash
docker run --rm progrium/stress --cpu 4
```

**Observer** :
- Node Exporter → CPU dans Grafana
- Correlation avec la latence applicative qui augmente

### Exercice 4 — Detecter un conteneur qui tombe

**Declencher** :

```bash
docker stop <container_id>
```

**Observer** :
- cAdvisor → le conteneur disparait des metriques
- Loki → les logs du conteneur s'arretent
- Prometheus → la metrique `up` passe a 0

### Exercice 5 — Observer le comportement sous trafic eleve

**Declencher** :

```bash
docker run --rm -it williamyeh/hey \
  -z 2m -c 100 http://host.docker.internal:8080
```

**Observer** : saturation progressive, augmentation de la latence, apparition d'erreurs.

---

## 8. Pieges frequents

| Piege | Consequence |
|-------|-------------|
| Trop de logs sans filtrage | Bruit — impossible de trouver l'information utile |
| Dashboards avec 50 panels | Personne ne les regarde — garder 5-6 metriques cles |
| Alertes sur chaque metrique | Alert fatigue — l'equipe finit par ignorer toutes les alertes |
| Pas de correlation entre signaux | On voit le symptome (latence) mais pas la cause (span lent dans la trace) |
