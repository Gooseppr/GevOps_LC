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

# Guide pratique — Observabilite sur AWS (CloudWatch, X-Ray, ADOT)

> Meme application de demo (OpenTelemetry Astronomy Shop), mais cette fois deployee sur EC2 avec la stack d'observabilite native AWS.
> L'objectif est de maitriser CloudWatch Logs, CloudWatch Metrics, les alarmes et X-Ray pour le tracing distribue.

---

## Architecture cible

### Composants

| Composant | Role |
|-----------|------|
| EC2 | Machine hote |
| Docker | Runtime applicatif |
| CloudWatch Logs | Logs centralises |
| CloudWatch Metrics | Metriques |
| CloudWatch Agent | Collecte avancee (RAM, disque) |
| X-Ray | Tracing distribue |
| ADOT Collector | OpenTelemetry AWS (bridge vers X-Ray) |

### Flux des donnees

- Logs Docker → driver `awslogs` → CloudWatch Logs
- Metriques systeme → CloudWatch Agent → CloudWatch Metrics
- Traces → ADOT Collector → X-Ray

---

## Preparation de l'environnement AWS

### Instance recommandee

- Type : `t3.medium` (minimum realiste)
- OS : Amazon Linux 2023

### Security Group minimal

| Port | Usage |
|------|-------|
| 22 | SSH |
| 8080 | Application |
| 3000 | Grafana (optionnel, debug) |

### IAM Role (obligatoire)

Creer un role EC2 avec les policies suivantes :
- `CloudWatchAgentServerPolicy`
- `AWSXrayWriteOnlyAccess`

Sans ce role, ni le CloudWatch Agent ni le ADOT Collector ne pourront envoyer de donnees.

### Installation Docker

```bash
sudo dnf update -y
sudo dnf install docker -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user
```

### Installation Docker Compose

```bash
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-linux-x86_64" \
  -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Verification

```bash
docker --version
docker compose version
```

---

## Deploiement de l'application

### docker-compose.yml (adapte AWS)

```yaml
version: "3.9"

services:
  app:
    image: ghcr.io/open-telemetry/opentelemetry-demo:latest
    ports:
      - "8080:8080"
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

La difference cle avec la version open source : le driver de logs est `awslogs` au lieu de la sortie standard. Les logs partent directement dans CloudWatch sans passer par Promtail/Loki.

### Lancement et verification

```bash
docker compose up -d
curl http://localhost:8080
```

### Generer du trafic

```bash
while true; do curl -s http://localhost:8080 > /dev/null; sleep 0.5; done
```

---

## Logs avec CloudWatch Logs

### Structure

Chaque conteneur ecrit dans un log stream, regroupe dans un log group :

```
/observability-app
  ├── app/container-1
  └── app/container-2
```

### Requetes CloudWatch Logs Insights

Trouver les erreurs HTTP 500 :

```
fields @timestamp, @message
| filter @message like /500/
| sort @timestamp desc
```

Chercher les messages lies a la latence :

```
fields @timestamp, @message
| filter @message like /duration/
```

Lister les logs par service :

```
fields @logStream, @message
| sort @timestamp desc
```

### Objectif

Savoir repondre rapidement a trois questions :
- Ou sont les erreurs ?
- Quel service ?
- Quand ca a commence ?

---

## Metriques avec CloudWatch Metrics

### Metriques natives EC2

Ces metriques sont disponibles sans aucune configuration :

- `CPUUtilization`
- `NetworkIn` / `NetworkOut`
- `DiskReadOps` / `DiskWriteOps`

Limite importante : la memoire (RAM) n'est **pas** collectee par defaut. Il faut le CloudWatch Agent.

### Ajouter le CloudWatch Agent

Configuration (`config.json`) :

```json
{
  "metrics": {
    "append_dimensions": {
      "InstanceId": "${aws:InstanceId}"
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

Demarrage :

```bash
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -c file:config.json \
  -s
```

### Dashboard essentiel a construire

- CPU EC2
- Memoire (via Agent)
- Disque (via Agent)
- Trafic reseau
- Erreurs applicatives (via log-based metric)

### Alarmes utiles

| Alarme | Seuil | Periode |
|--------|-------|---------|
| CPU eleve | > 80% | 5 minutes |
| Memoire elevee | > 75% | 5 minutes |
| Erreurs HTTP 5xx | > 10/min | 1 minute |

Pour les erreurs HTTP : creer un **metric filter** sur le log group qui compte les occurrences de `500` et genere une metrique custom, puis configurer une alarme dessus.

---

## Traces avec X-Ray

### Instrumentation via ADOT

ADOT (AWS Distro for OpenTelemetry) sert de bridge entre l'instrumentation OpenTelemetry de l'application et X-Ray.

Configuration minimale de l'OTEL Collector pour exporter vers X-Ray :

```yaml
exporters:
  awsxray:

service:
  pipelines:
    traces:
      exporters: [awsxray]
```

### Lecture d'une trace dans X-Ray

La console X-Ray offre trois vues :

- **Service Map** : graphe des dependances entre services avec latence et taux d'erreurs sur chaque lien
- **Traces** : liste des traces individuelles, filtrables par duree, statut, service
- **Analyse par span** : detail de chaque etape d'une requete avec sa duree

### Exemple de diagnostic

Probleme : lenteur sur le checkout.

Dans X-Ray :
- Frontend → 12 ms (OK)
- Backend → 18 ms (OK)
- Base de donnees → 1 800 ms (lent)

Conclusion : le goulot d'etranglement est la base de donnees, pas l'application.

---

## Methode de diagnostic SRE sur AWS

Quand une alarme se declenche, suivre ces etapes dans l'ordre :

### Etape 1 — Alarme

Identifier le symptome : latence elevee ? taux d'erreurs en hausse ? CPU sature ?

### Etape 2 — Metriques

Ouvrir CloudWatch Metrics :
- CPU inhabituellement eleve ?
- Pic de trafic reseau ?
- Memoire proche de la saturation ?

### Etape 3 — Logs

Ouvrir CloudWatch Logs Insights :
- Des erreurs dans les logs applicatifs ?
- Un pattern qui se repete (ex: `connection refused`, `timeout`) ?

### Etape 4 — Traces

Ouvrir X-Ray :
- Quel service est le plus lent dans la chaine ?
- Y a-t-il des erreurs sur un span specifique ?

### Etape 5 — Conclusion et action

Exemples de conclusions :
- CPU sature → scaling horizontal (ASG) ou vertical (type d'instance)
- Service externe lent → circuit breaker, retry avec backoff
- Base de donnees lente → read replicas, cache, optimisation de requetes

---

## Exercices pratiques

### Exercice 1 — Trouver la cause d'erreurs 500

**Declencher** :

```bash
curl http://localhost:8080/api/checkout
```

**Observer** :
- CloudWatch Logs Insights → filtrer par `500`
- CloudWatch Metrics → pic sur la metrique d'erreurs

### Exercice 2 — Diagnostiquer une latence elevee

**Declencher** : generer de la charge

```bash
hey -z 2m -q 10 -c 50 http://<EC2_IP>:8080
```

**Observer** :
- CloudWatch Metrics → latence en hausse
- X-Ray → identifier le span le plus lent

### Exercice 3 — Reagir a une saturation CPU

**Declencher** :

```bash
docker run --rm progrium/stress --cpu 4
```

**Observer** :
- CloudWatch → `CPUUtilization` monte
- Correlation avec la latence applicative

### Exercice 4 — Detecter un conteneur qui tombe

**Declencher** :

```bash
docker stop <container_id>
```

**Observer** :
- CloudWatch Logs → les logs du conteneur s'arretent
- CloudWatch Metrics → anomalies sur les metriques applicatives

### Exercice 5 — Simuler un disque plein

**Declencher** :

```bash
fallocate -l 10G testfile
```

**Observer** :
- CloudWatch Agent → metrique `disk_used_percent` monte

### Exercice 6 — Observer une dependance KO

**Declencher** : arreter un service interne

**Observer** :
- Taux d'erreurs en hausse
- X-Ray → la trace montre que le span vers le service arrete echoue

### Exercice 7 — Tester le comportement sous forte charge

**Declencher** :

```bash
hey -z 2m -c 100 http://<EC2_IP>:8080
```

**Observer** : saturation progressive, augmentation de la latence, apparition d'erreurs.

---

## Comparaison Open Source vs AWS

| Critere | Open Source (Prometheus, Grafana, Loki, Tempo) | AWS (CloudWatch, X-Ray) |
|---------|------------------------------------------------|------------------------|
| Cout | Gratuit (hors infra) | Facture a l'usage (logs ingeres, metriques custom, traces) |
| Complexite de mise en place | Elevee — tout a configurer soi-meme | Moyenne — integration native avec les services AWS |
| Maintenance | A ta charge (mises a jour, stockage, scaling) | Geree par AWS |
| Flexibilite | Maximale — tout est personnalisable | Limitee au perimetre CloudWatch/X-Ray |
| Scalabilite | Manuelle (Federation Prometheus, sharding Loki) | Native et transparente |
| Portabilite | Fonctionne partout (cloud, on-premise, hybrid) | Dependant d'AWS |

### Quand choisir quoi

**Open Source** quand tu veux comprendre les briques fondamentales de l'observabilite, quand tu travailles en multi-cloud ou on-premise, ou quand tu as besoin d'une flexibilite maximale sur les requetes et les dashboards.

**AWS** quand tu es deja sur AWS et que tu veux une mise en place rapide sans maintenance, quand l'equipe est petite et ne peut pas se permettre de gerer l'infra d'observabilite en plus du produit.

**En realite** : un SRE doit maitriser les deux. Les concepts sont les memes (logs, metriques, traces, correlation). Seuls les outils changent. La capacite a diagnostiquer rapidement un incident repose sur la methode, pas sur l'outil.
