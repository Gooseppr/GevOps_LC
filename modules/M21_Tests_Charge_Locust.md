---
titre: Test de montée en charge - Locust & Artillery
type: module
jour: 21
ordre: 1
tags: cd, test, locust, artillery, python, devops
---

# 🚀 Cours : Tests de montée en charge & Framework Locust

> **Objectif du cours** : Comprendre les tests de montée en charge, savoir les appliquer dans un contexte professionnel ou personnel, et apprendre à utiliser **Locust** (framework Python) pour simuler des utilisateurs et mesurer la résistance d’une application.

---

## 1️⃣ Introduction : Pourquoi faire des tests de montée en charge ?

Lorsqu’une application est mise en ligne, il est essentiel de **vérifier sa capacité à supporter un grand nombre d’utilisateurs simultanés**.

Les tests de montée en charge (Load Testing) permettent de :
- Identifier le **seuil critique** de l’application (au-delà duquel elle ralentit ou plante),
- Détecter les **goulets d’étranglement** (CPU, RAM, base de données),
- Évaluer la **stabilité** et la **scalabilité** du système,
- Prévenir les **pannes** en production.

### 🎯 Exemple d’entreprises
- **E-commerce** : gérer un pic de trafic pendant le Black Friday.  
- **Service SaaS** : supporter 10 000 connexions simultanées sans crash.  
- **Autoentrepreneur** : vérifier que son site portfolio reste fluide même si 100 visiteurs arrivent en même temps après une campagne.

---

## 2️⃣ Concepts fondamentaux

### 🧱 Seuil critique
Une application peut fonctionner correctement avec 100 utilisateurs mais **saturer à 1 000**.  
Au-delà du seuil critique, les temps de réponse explosent, voire le serveur tombe.

### ⚔️ Risques & Sécurité
Une **attaque de déni de service (DoS)** exploite ces faiblesses : surcharge du CPU ou de la mémoire, saturation des connexions, etc.

### ⚙️ Ressources à surveiller
| Ressource | Rôle | Symptôme de surcharge |
|------------|------|------------------------|
| **CPU** | Calculs, traitements logiques | Latence, freeze, erreurs 500 |
| **RAM** | Stockage temporaire des données | Crash, swap disque, lenteur |
| **Disque** | Accès aux fichiers/logs | Blocages, IOwait élevés |
| **Réseau** | Transmission des données | Timeout, goulot d’étranglement |

### 💡 Solutions possibles
- **Optimiser le code** (algorithmes, requêtes SQL, cache),
- **Scaling horizontal** (ajouter des instances serveur),
- **Scaling vertical** (augmenter CPU/RAM),
- **Systèmes de queue** (RabbitMQ, Celery),
- **Réplication** (serveurs ou bases de données).

---

## 3️⃣ Simulation d’utilisateurs

Les tests de charge consistent à **simuler des utilisateurs réels** interagissant avec ton application :
- Navigation sur plusieurs pages,
- Connexion / déconnexion,
- Achats, formulaires, API REST…

Ces scénarios permettent de mesurer les performances **dans un contexte réaliste**.

---

## 4️⃣ 🐍 Framework Python : Locust

### Introduction

**Locust** est un framework open-source de tests de charge écrit en Python.  
Il permet de simuler des milliers d’utilisateurs virtuels exécutant des scénarios définis dans un fichier Python (`locustfile.py`).

#### 🔧 Caractéristiques
- Écrit en **Python** (simple et flexible),
- Interface web intégrée (`localhost:8089`),
- Compatible avec **GitLab CI/CD**,
- Exporte des rapports en **CSV/HTML**.

---

### Installation et prérequis

#### Vérification Python
```bash
python3 --version
```
> Locust nécessite Python **≥ 3.7**

#### Installation
```bash
pip install locust
```

---

### Création d’un premier test : `locustfile.py`

Ce fichier contient les scénarios utilisateurs à exécuter.

```python
from locust import HttpUser, task, between

class FirstLoadTest(HttpUser):
    wait_time = between(1, 3)  # Délai entre deux requêtes

    @task
    def home_page(self):
        self.client.get("/")

    @task
    def about_page(self):
        self.client.get("/about")
```

#### 🔍 Explication
- `HttpUser` → représente un utilisateur virtuel.  
- `@task` → définit une action à répéter pendant le test.  
- `self.client.get()` → effectue une requête HTTP.  
- `wait_time` → simule un délai entre deux requêtes pour reproduire un comportement humain.

---

### Lancer Locust

#### Commande
```bash
locust
```
➡️ Par défaut, Locust démarre une interface web sur [http://localhost:8089](http://localhost:8089)

#### Dans l’interface :
- **Host** : URL de ton application (ex. `http://127.0.0.1:5000` ou ton site),
- **Users** : nombre d’utilisateurs simultanés,
- **Spawn rate** : nouveaux utilisateurs/seconde,
- **Run time** : durée du test.

Locust va alors simuler la charge et afficher les résultats en temps réel.

---

### Analyse des résultats

#### Indicateurs importants
| Indicateur | Description |
|-------------|-------------|
| **RPS (Requests per Second)** | Nombre de requêtes traitées par seconde |
| **Response Time (ms)** | Temps moyen de réponse |
| **Fail %** | Taux d’erreur des requêtes |
| **Users** | Nombre d’utilisateurs actifs |
| **Throughput** | Volume total de données échangées |

#### Export des résultats
Locust peut exporter les résultats :
```bash
locust -f locustfile.py --headless -u 100 -r 10 -t 5m --host=http://localhost:8000 --csv=results
```

---

### Intégration avec GitLab CI/CD

#### Exemple de pipeline GitLab
```yaml
# .gitlab-ci.yml — Test de charge automatisé
stages: [test]

load_test:
  image: python:3.10
  stage: test
  script:
    - pip install locust
    - locust -f locustfile.py --headless -u 50 -r 5 -t 2m --host=http://app:5000 --csv=results
  artifacts:
    paths:
      - results_stats.csv
      - results_failures.csv
  only:
    - main
```

#### Paramètres utiles
- `-u` : nombre d’utilisateurs simultanés,
- `-r` : utilisateurs ajoutés par seconde,
- `-t` : durée totale du test,
- `--csv` : export des résultats.

#### 🔄 Intégration continue
Les tests de charge peuvent être **déclenchés automatiquement** à chaque `merge request`.  
En cas d’échec, **la fusion est bloquée** et les résultats apparaissent dans GitLab CI/CD.

---

### 🔬 Exemple d’analyse de résultats

| Scénario | Utilisateurs | Erreurs | Temps moyen | Observation |
|-----------|---------------|----------|--------------|--------------|
| Home Page | 100 | 0% | 150 ms | Stable |
| Login API | 100 | 12% | 1200 ms | Requêtes lentes, à optimiser |
| Checkout | 200 | 40% | 2400 ms | Saturation de la base de données |

---

### 🔧 Optimiser après les tests

1. **Optimiser le code** (requêtes SQL, cache, asynchronisme).
2. **Surveiller l’infrastructure** (CPU/RAM, scaling horizontal).
3. **Utiliser du caching** (Redis, CDN).
4. **Mettre en file d’attente** les tâches lourdes (RabbitMQ, Celery).
5. **Mettre en place du monitoring** (Prometheus, Grafana, Datadog).

---

### 💡 Bonnes pratiques

- Toujours tester **dans un environnement isolé** (pré-prod ou staging).  
- Ne jamais lancer un test massif **sur la prod** sans validation.  
- Analyser les logs système et applicatifs pendant les tests.  
- Automatiser les tests de charge dans le pipeline CI/CD.  
- Garder des **rapports historiques** pour comparer les versions.

---

### 🧠 À retenir

> Les tests de montée en charge permettent d’anticiper les problèmes de performance **avant** qu’ils n’impactent les utilisateurs réels.  
> Locust offre un moyen simple, rapide et Pythonique d’automatiser ces tests et de les intégrer à un cycle DevOps complet.

---

### 📎 Commandes récapitulatives

#### Interface Web (par défaut)

```bash
locust -f locustfile.py --host http://127.0.0.1:8000

```

- Ouvre l’UI sur **http://localhost:8089**
- Tu saisis **Users**, **Spawn rate** et tu lances depuis le navigateur

#### Mode headless (sans UI) + résumé final uniquement

```bash
locust -f locustfile.py --headless --only-summary \
  -u 100 -r 10 -t 2m --host http://127.0.0.1:8000

```

---

### 🧩 Options essentielles

#### Cible & scénario

- `f, --locustfile PATH` : fichier test (par défaut `locustfile.py`)
- `-host URL` : URL cible (peut aussi être définie dans le code)

#### Charge & durée

- `u, --users N` : nombre d’utilisateurs simulés
- `r, --spawn-rate N` : nouveaux utilisateurs par seconde
- `t, --run-time D` : durée totale (ex : `30s`, `2m`, `1h`)
- `-stop-timeout S` : arrêt **gracieux** des users (sec) à la fin

#### Sortie & rapports

- `-headless` : exécution sans interface web
- `-only-summary` : **n’affiche que le résumé final**
- `-csv PREFIX` : export CSV (`PREFIX_stats.csv`, `PREFIX_failures.csv`, …)
- `-csv-full-history` : CSV avec chronologie complète (timeseries)
- `-html REPORT.html` : génère un **rapport HTML** à la fin

#### Logs

- `-loglevel LEVEL` : `INFO`, `DEBUG`, `WARNING`, …
- `-logfile FILE` : envoie les logs dans un fichier

#### UI Web (quand tu veux la garder mais l’exposer ailleurs)

- `-web-host 0.0.0.0` : écoute sur toutes les interfaces
- `-web-port 8089` : port de l’UI

---

### 🎛️ Filtrer/organiser les tâches

> Marque tes tâches avec @tag("login"), @tag("checkout") dans le code.
> 
- `-tags login,checkout` : **inclure** seulement ces tags
- `-exclude-tags slow,admin` : **exclure** ces tags

---

### 🧪 Scénarios concrets (recettes)

#### 1) Petit test de fumée (CI rapide)

```bash
locust -f locustfile.py --headless --only-summary \
  -u 20 -r 5 -t 1m --host http://127.0.0.1:8000

```

#### 2) Campagne avec rapport HTML + CSV complet

```bash
locust -f locustfile.py --headless \
  -u 200 -r 20 -t 10m --host https://app.example.com \
  --csv results/run_$(date +%F_%H%M) --csv-full-history \
  --html report_$(date +%F_%H%M).html

```

#### 3) Test sur un sous-ensemble de tâches (tags)

```bash
locust -f locustfile.py --headless --only-summary \
  -u 100 -r 10 -t 5m --host https://api.example.com \
  --tags login,search

```

#### 4) UI exposée à distance (docker/vm)

```bash
locust -f locustfile.py --host http://service:8000 \
  --web-host 0.0.0.0 --web-port 8089

```

---

### 🧮 Exécution distribuée (maître / travailleurs)

> Pour pousser plus de charge, démarre 1 master + N workers.
> 

**Master :**

```bash
locust -f locustfile.py --master --headless \
  -u 1000 -r 100 -t 15m --host https://app.example.com --only-summary

```

**Workers :**

```bash
locust -f locustfile.py --worker --master-host 127.0.0.1
# (répéter la commande sur plusieurs machines/containers)

```

Options utiles côté master :

- `-expect-workers N` : attend N workers avant de démarrer
- `-master-bind-host/--master-bind-port` : écoute master personnalisée

---

### 🧠 Petits rappels utiles

- **Users (`u`)** = plateau de charge cible, **Spawn rate (`r`)** = pente de montée.
- **`-only-summary`** garde la console propre en CI (un verdict clair).
- Toujours fixer `-host` ou le définir dans `HttpUser.host`.
- Pense à `-stop-timeout` pour une fin de test propre (ex : 30 s).
- Combine `-csv` et `-html` pour conserver des **preuves** et **comparer** les runs.

---

### 🎯 Pour aller plus loin
- [Documentation officielle Locust](https://docs.locust.io)
- [Exemples GitLab CI/CD Load Testing](https://docs.gitlab.com/ee/ci/testing/load_performance_testing.html)
- [Tutoriel vidéo Locust & Python](https://www.youtube.com/results?search_query=locust+python+tutorial)

---
[Module suivant →](M21_Artillery.md)
---

---
[Module suivant →](M21_Artillery.md)
---

---
[Module suivant →](M21_Artillery.md)
---

---
[Module suivant →](M21_Artillery.md)
---

---
[Module suivant →](M21_Artillery.md)
---

---
[Module suivant →](M21_Artillery.md)
---

---
[Module suivant →](M21_Artillery.md)
---

---
[Module suivant →](M21_Artillery.md)
---

---
[Module suivant →](M21_Artillery.md)
---

---
[Module suivant →](M21_Artillery.md)
---

---
[Module suivant →](M21_Artillery.md)
---

---
[Module suivant →](M21_Artillery.md)
---

---
[Module suivant →](M21_Artillery.md)
---

---
[Module suivant →](M21_Artillery.md)
---
