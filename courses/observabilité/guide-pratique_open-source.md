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

# Application de demo recommandee : OpenTelemetry Demo (Astronomy Shop)

---

## Pourquoi ce choix (objectif pédagogique)

Cette app coche **toutes les cases SRE/observabilité** :

- microservices (frontend + backend + services internes)
- HTTP + gRPC + base de données
- logs structurés
- métriques Prometheus natives
- traces distribuées OpenTelemetry natives
- dépendances simulées (paiement, catalogue, etc.)
- latence et erreurs injectables
- trafic générable facilement

👉 En clair : **c’est exactement ce que tu auras en prod dans une vraie boîte**

---

## Architecture simplifiée

```

```

---

## Déploiement minimal (version app seule)

### docker-compose.yml

```
version:"3.9"

services:
  otel-demo:
    image: ghcr.io/open-telemetry/opentelemetry-demo:latest
    ports:
      -"8080:8080"
```

---

## Commandes

```
docker compose up-d
```

---

## Accès

- App : http://localhost:8080

---

## Endpoints utiles

- `/` → frontend
- `/api/products`
- `/api/cart`
- `/api/checkout`

---

## Générer du trafic

### Option simple (curl)

```
whiletrue;docurl-s http://localhost:8080 > /dev/null;sleep0.5;done
```

### Option plus réaliste

```
docker run--rm-it williamyeh/hey \
-z 2m-q10-c50 http://host.docker.internal:8080
```

---

## Provoquer des incidents

👉 Très important pour l’apprentissage

### 1. Latence artificielle

Dans certaines routes (checkout), tu peux simuler :

- ralentissement réseau
- backend lent

---

### 2. Erreurs HTTP

Ex :

- panier vide → erreurs
- paiement → erreurs simulées

---

### 3. Crash service

```
dockerps
dockerstop <container>
```

---

---

# ⚙️ 2. VERSION A — STACK OPEN SOURCE COMPLÈTE

---

# 2.1 Architecture cible

## Composants

| Composant | Rôle |
| --- | --- |
| Prometheus | métriques |
| Grafana | visualisation |
| Loki | logs |
| Promtail | collecte logs |
| Tempo | traces |
| OTEL Collector | hub observabilité |
| Node Exporter | métriques système |
| cAdvisor | métriques Docker |
| Alertmanager | alertes |

---

## Flux des données

```

```

---

## Origine des données

| Source | Type |
| --- | --- |
| Application | logs + metrics + traces |
| Docker | metrics conteneur |
| Machine | CPU, RAM, disque |

---

# 2.2 Déploiement complet

## docker-compose.yml

```
version:"3.9"

services:

  app:
    image: ghcr.io/open-telemetry/opentelemetry-demo:latest
    ports:
      -"8080:8080"
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
      -"9090:9090"

  grafana:
    image: grafana/grafana
    ports:
      -"3000:3000"

  loki:
    image: grafana/loki
    ports:
      -"3100:3100"

  promtail:
    image: grafana/promtail
    volumes:
      - /var/log:/var/log
      - ./promtail.yml:/etc/promtail/config.yml

  tempo:
    image: grafana/tempo
    ports:
      -"3200:3200"

  node-exporter:
    image: prom/node-exporter
    ports:
      -"9100:9100"

  cadvisor:
    image: gcr.io/cadvisor/cadvisor
    ports:
      -"8081:8080"
```

---

## Commandes

```
docker compose up-d
```

---

## Accès

- Grafana → http://localhost:3000
- Prometheus → http://localhost:9090
- Loki → http://localhost:3100
- Tempo → http://localhost:3200

---

# 2.3 LOGS

## Définition

Un log = événement horodaté

---

## Types

| Type | Exemple |
| --- | --- |
| applicatif | erreur HTTP |
| système | kernel |
| conteneur | stdout Docker |

---

## Requêtes LogQL

```
{job="app"} |= "error"
```

```
{job="app"} | json | status=500
```

```
{container="frontend"} |= "timeout"
```

---

## Objectif

👉 Trouver :

- erreurs
- comportements anormaux
- corrélation avec traces

---

# 2.4 MÉTRIQUES

## Types

| Type | Description |
| --- | --- |
| Counter | incrémente |
| Gauge | valeur instantanée |
| Histogram | distribution |
| Summary | percentiles |

---

## RED

- Rate → req/s
- Errors → %
- Duration → latence

---

## PromQL exemples

```
rate(http_requests_total[1m])
```

```
sum(rate(http_requests_total{status=~"5.."}[5m]))
```

```
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

---

## Dashboard essentiel

- RPS
- erreurs %
- latence p95
- CPU
- mémoire
- restarts

---

# 2.5 TRACES

## Concepts

| Terme | Description |
| --- | --- |
| trace | requête complète |
| span | étape |
| trace_id | identifiant |

---

## Exemple diagnostic

👉 problème checkout lent

Trace montre :

- frontend OK
- paiement lent

👉 conclusion : dépendance externe lente

---

# 2.6 ALERTING

## Bonnes alertes

| Type | Exemple |
| --- | --- |
| symptôme | latence élevée |
| cause | CPU 100% |

---

## Exemple

```
- alert: HighErrorRate
  expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
```

---

# 2.7 EXERCICES PRATIQUES

---

## 1. Latence

### déclencher

charge avec `hey`

### observer

- Prometheus → latency
- Tempo → span lent

### conclusion

bottleneck backend

---

## 2. HTTP 500

```
curl http://localhost:8080/api/checkout
```

### observer

- logs → erreurs
- métriques → error rate

---

## 3. CPU élevé

```
docker run--rm progrium/stress--cpu4
```

### observer

- Node exporter
- latence ↑

---

## 4. conteneur down

```
dockerstop <id>
```

### observer

- métriques restart
- logs disparition

---

## 5. trafic élevé

```
hey-z 2m-c100 http://localhost:8080
```

---

# ⚠️ PIÈGES FRÉQUENTS

- trop de logs → bruit
- dashboards inutiles
- alertes spam
- pas de corrélation entre signaux
