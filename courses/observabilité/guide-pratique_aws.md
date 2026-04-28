---
layout: page
title: "Guide pratique — Observabilité sur AWS (CloudWatch, X-Ray, ADOT)"
course: observabilité
chapter_title: "Guides pratiques"
chapter: 1
section: 2
tags: observabilité,aws,cloudwatch,xray,adot,opentelemetry,ec2,logs,metriques,traces,sre
difficulty: intermediate
duration: 150
mermaid: false
status: published
prev_module: "/courses/observabilité/guide-pratique_open-source.html"
prev_module_title: "Guide pratique — Stack open source (Prometheus, Grafana, Loki, Tempo)"
---

# Observabilite sur AWS (EC2 + CloudWatch + X-Ray)

---

# 3.1 Architecture cible AWS

## Vision globale

```

```

---

## Rôle des composants

| Composant | Rôle |
| --- | --- |
| EC2 | machine hôte |
| Docker | runtime app |
| CloudWatch Logs | logs centralisés |
| CloudWatch Metrics | métriques |
| CloudWatch Agent | collecte avancée |
| X-Ray | tracing distribué |
| ADOT | OpenTelemetry AWS |

---

## Flux des données

- Logs Docker → CloudWatch Logs
- Métriques système → CloudWatch Agent → CloudWatch Metrics
- Traces → OpenTelemetry → X-Ray

---

# 3.2 Préparation AWS

---

## Instance recommandée

- Type : `t3.medium` (minimum réaliste)
- OS : Amazon Linux 2023

---

## Security Group (minimal)

| Port | Usage |
| --- | --- |
| 22 | SSH |
| 8080 | app |
| 3000 | (optionnel debug Grafana) |

---

## IAM Role (obligatoire)

Créer un rôle EC2 avec :

- `CloudWatchAgentServerPolicy`
- `AWSXrayWriteOnlyAccess`

---

## Installation Docker

```
sudo dnf update-y
sudo dnf install docker-y
sudo systemctlstart docker
sudo systemctl enable docker
sudo usermod-aG docker ec2-user
```

---

## Docker Compose

```
sudocurl-L"https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-linux-x86_64"-o /usr/local/bin/docker-compose
sudochmod+x /usr/local/bin/docker-compose
```

---

## Vérification

```
docker--version
docker compose version
```

---

# 3.3 Déploiement application

---

## docker-compose.yml (AWS adapté)

```
version:"3.9"

services:
  app:
    image: ghcr.io/open-telemetry/opentelemetry-demo:latest
    ports:
      -"8080:8080"
    logging:
      driver: awslogs
      options:
        awslogs-region: eu-west-1
        awslogs-group: observability-app
        awslogs-stream-prefix: app

  otel-collector:
    image: public.ecr.aws/aws-observability/aws-otel-collector
    volumes:
      - ./otel-config.yaml:/etc/otel/config.yaml
    command: ["--config=/etc/otel/config.yaml"]
```

---

## Lancement

```
docker compose up-d
```

---

## Vérification

```
curl http://localhost:8080
```

---

## Générer du trafic

```
whiletrue;docurl-s http://localhost:8080 > /dev/null;done
```

---

# 3.4 Logs avec CloudWatch

---

## Concept

- Chaque conteneur → log stream
- Chaque app → log group

---

## Structure

```
/observability-app
  ├── app/container-1
  ├── app/container-2
```

---

## Requêtes Logs Insights

### erreurs HTTP

```
fields @timestamp, @message
| filter @messagelike/500/
| sort @timestampdesc
```

---

### latence

```
fields @timestamp, @message
| filter @messagelike/duration/
```

---

### logs par service

```
fields @logStream, @message
| sort @timestampdesc
```

---

## Objectif pédagogique

👉 répondre à :

- où sont les erreurs ?
- quel service ?
- quand ?

---

# 3.5 Métriques avec CloudWatch

---

## Métriques natives EC2

- CPUUtilization
- NetworkIn / Out
- DiskRead / Write

⚠️ Limite : pas de RAM par défaut

---

## Ajouter CloudWatch Agent

### config

```
{
  "metrics": {
    "append_dimensions": {
      "InstanceId":"${aws:InstanceId}"
    },
    "metrics_collected": {
      "mem": {
        "measurement": ["mem_used_percent"]
      },
      "disk": {
        "measurement": ["used_percent"],
        "resources": ["*"]
      }
    }
  }
}
```

---

## Démarrage

```
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
-a fetch-config \
-m ec2 \
-c file:config.json \
-s
```

---

## Dashboards essentiels

- CPU EC2
- mémoire
- disque
- trafic réseau
- erreurs applicatives

---

## Alarmes utiles

### CPU élevé

- seuil : > 80% sur 5 min

---

### mémoire

- 75%

---

### erreurs HTTP

(log-based metric)

---

# 3.6 Traces avec X-Ray

---

## Définition

X-Ray = tracing distribué AWS

---

## Instrumentation

Via ADOT (OpenTelemetry AWS)

---

## Exemple config OTEL

```
exporters:
  awsxray:

service:
  pipelines:
    traces:
      exporters: [awsxray]
```

---

## Lecture d’une trace

Dans X-Ray :

- service map
- latence par service
- erreurs

---

## Diagnostic type

👉 lenteur checkout

- frontend OK
- backend lent
- DB lent

👉 conclusion : bottleneck DB

---

# 3.7 Méthode de diagnostic AWS (SRE)

---

## Étape 1 : alarme

ex : latence ↑

---

## Étape 2 : métriques

CloudWatch :

- CPU ?
- trafic ?

---

## Étape 3 : logs

Logs Insights :

- erreurs ?

---

## Étape 4 : traces

X-Ray :

- quel service ?

---

## Étape 5 : conclusion

ex :

- CPU saturé → scaling
- service lent → optimisation

---

# 3.8 Exercices pratiques AWS

---

## 1. erreurs 500

### déclencher

endpoint checkout

---

### observer

- Logs Insights
- métrique erreur

---

## 2. latence

### déclencher

hey / curl load

---

### observer

- métriques latency
- X-Ray trace lente

---

## 3. CPU élevé

```
docker run--rm progrium/stress--cpu4
```

---

### observer

- CloudWatch CPU
- latence ↑

---

## 4. conteneur down

```
dockerstop <id>
```

---

### observer

- logs stop
- métriques anomalies

---

## 5. disque plein

```
fallocate-l 10G testfile
```

---

### observer

- CloudWatch disk

---

## 6. dépendance KO

stop service interne

---

### observer

- erreurs ↑
- traces montrent dépendance

---

## 7. trafic élevé

```
hey-z 2m-c100 http://EC2_IP:8080
```

---

---

# 📊 4. COMPARAISON Open Source vs AWS

---

## Open source

### Avantages

- contrôle total
- gratuit (infra locale)
- flexible

---

### Inconvénients

- maintenance lourde
- config complexe
- scaling manuel

---

## AWS

### Avantages

- intégré
- scalable
- rapide à mettre en place

---

### Inconvénients

- coût
- vendor lock-in
- moins flexible

---

## Résumé

| Critère | Open Source | AWS |
| --- | --- | --- |
| coût | faible | variable |
| complexité | élevée | moyenne |
| maintenance | élevée | faible |
| flexibilité | maximale | limitée |
| scalabilité | manuelle | native |

---

# 🎯 Ce que tu dois retenir

---

👉 Open source = comprendre les briques

👉 AWS = comprendre le système intégré

👉 SRE réel = capacité à :

- corréler logs / metrics / traces
- diagnostiquer rapidement
- éviter le bruit
- créer des alertes utiles
