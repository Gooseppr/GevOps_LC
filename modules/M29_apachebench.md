---
layout: page
title: Apache Bench
sujet: Cloud publique, Hosting & Cloud
type: module
jour: 29
ordre: 2
tags: cd, test, charge, devops
---


# 📌 **Cours complet : ApacheBench (AB) — Tests de charge HTTP**

## 🎯 Objectif du module

Savoir utiliser ApacheBench pour :

- Mesurer les performances d’une API / d’un site web.
- Identifier le seuil de charge maximal supporté par un serveur.
- Comparer les optimisations (cache, compression, load balancer, etc.).
- Préparer des tests reproductibles dans un pipeline CI/CD.

---

## 📍 1. Introduction

### 🧪 **Qu’est-ce qu’un test de charge ?**

Un test de charge mesure la capacité d’un serveur à répondre à un nombre important de requêtes dans un temps limité. Il permet d’identifier :

- Le niveau de performance réel.
- Les limites (goulots d’étranglement).
- Les erreurs qui apparaissent sous pression.

### 🔧 **ApacheBench (AB)**

ApacheBench est un outil CLI fourni avec Apache HTTP Server, capable de :

- Émettre plusieurs milliers de requêtes HTTP en rafale.
- Simuler des connexions concurrentes.
- Fournir des statistiques précises (latences, erreurs, TPS…).

📌 **Il fonctionne sur n’importe quel serveur HTTP**, même si vous n’utilisez pas Apache.

🔍 **Cas d’usage typiques :**

- Test d’une API REST
- Validation d’un Load Balancer
- Test d’optimisation (cache, gzip, CDN)
- Benchmarking comparatif (avant/après optimisation)

---

## 📍 2. Installation

### 🔹 Linux (Ubuntu/Debian)

```bash
sudo apt update && sudo apt install apache2-utils -y

```

### 🔹 CentOS / RHEL

```bash
sudo yum install httpd-tools -y

```

### 🔹 macOS (Homebrew)

```bash
brew install httpd

```

### 🔹 Windows

Téléchargement des binaires :

https://www.apachehaus.com/cgi-bin/download.plx

📌 Génial : aucun serveur Apache n’est nécessaire. Seulement l’outil.

---

## 📍 3. Commande de base et premiers tests

### ▶️ Commande simple

```bash
ab -n 1000 -c 50 http://localhost/

```

🔎 **Explication :**

| Option | Signification |
| --- | --- |
| `-n 1000` | 1000 requêtes au total |
| `-c 50` | 50 requêtes simultanées |
| URL | cible du test |

📌 Résultat attendu : stats, erreurs éventuelles, performances.

---

## 📍 4. Analyse d’un résultat AB

Extrait typique :

```
Requests per second:    1200.50 [#/sec] (mean)
Time per request:       41.70 [ms] (mean)
Failed requests:        0
Transfer rate:          2300.25 [Kbytes/sec] received

```

### 🔍 Comment lire les données ?

| Ligne | Interprétation |
| --- | --- |
| `Requests per second` | Capacité du serveur. Plus c’est élevé, mieux c’est. |
| `Time per request` | Latence moyenne. Plus c’est bas, mieux c’est. |
| `Failed requests` | Erreurs 4xx/5xx ou timeouts. Idéal = 0. |
| `Transfer rate` | Débit de sortie (effet compression/CDN). |

---

## 📍 5. Options avancées indispensables

### 📌 Envoyer des headers personnalisés (API)

```bash
ab -n 5000 -c 200 -H "Authorization: Bearer <token>" http://localhost/api/users

```

### 📌 Envoyer un body POST (JSON)

```bash
ab -n 2000 -c 100 -p data.json -T application/json http://localhost/api/login

```

📌 `data.json` contient par exemple :

```json
{"email":"test@test.com","password":"1234"}

```

### 📌 Forcer HTTPS (si certificat non valide)

```bash
ab -n 500 -c 50 -H "Accept: application/json" -k https://myapi.com/

```

### 📌 Keep-Alive (connexion persistante)

```bash
ab -n 10000 -c 500 -k http://localhost/

```

⚠️ L’option `-k` peut booster artificiellement les résultats (connexions réutilisées).

---

## 📍 6. Méthodologie professionnelle de test

### 🛑 **Ne jamais tester violemment sans progression**

Procéder par paliers :

| Étape | Commande |
| --- | --- |
| Baseline | `ab -n 1000 -c 50` |
| Charge moyenne | `ab -n 5000 -c 200` |
| Stress test | `ab -n 20000 -c 1000` |
| Limite serveur | Augmenter jusqu’aux erreurs |

### 📌 **Recueillir et comparer**

Noter après chaque test :

| Test | Req/sec | Latence | Erreurs | Charge CPU |
| --- | --- | --- | --- | --- |

🧠 On optimise **uniquement avec des métriques**.

---

## 📍 7. Intégration en CI/CD

### Exemple : test de perf simple en CI (GitLab CI)

```yaml
performance_test:
  stage: test
  image: alpine
  script:
    - apk add apache2-utils
    - ab -n 2000 -c 100 http://myapp/

```

📌 Possibilité d’enregistrer les résultats dans des artefacts pour comparaison.

---

## 📍 8. Limites d’ApacheBench

| Limitation | Conséquence |
| --- | --- |
| Mono-thread | Ne charge pas au maximum les multi-CPU |
| Peu configurable | Pas de scénario complexes |
| Pas de think time | Pas de simulation utilisateur réel |
| Rapports minimaux | Pas de dashboard graphique |

### 🔁 Alternatives plus modernes :

| Outil | Points forts |
| --- | --- |
| **wrk** | Très performant multithread |
| **Locust** | Scénarios réalistes en Python |
| **k6** | Intégration CI + scripting moderne |
| **Ddosify** | API Load-test + dashboards |

---

## 📌 Conclusion

ApacheBench est :

✔ **Simple**, ✔ **rapide**, ✔ **idéal pour le benchmarking brut**

Mais ❗ **pas suffisant pour simuler des utilisateurs réels**.

Il est parfait **pour établir des bases de performance, comparer des optimisations et tester des API statiques**.



<!-- snippet
id: aws_ab_basic_test
type: command
tech: aws
level: beginner
importance: high
format: knowledge
tags: apachebench,test-charge,http,benchmark
title: ApacheBench – Test de charge HTTP de base
context: mesurer les performances d'une API ou d'un site web
command: ab -n 1000 -c 50 http://localhost/
description: Lance 1000 requêtes HTTP vers localhost avec 50 connexions simultanées. Le résultat affiche : Requests per second (capacité), Time per request (latence moyenne), Failed requests (erreurs 4xx/5xx), Transfer rate (débit). Idéal pour un premier benchmark brut avant toute optimisation. La cible peut être n'importe quel serveur HTTP, pas uniquement Apache.
-->

<!-- snippet
id: aws_ab_install
type: command
tech: cloud
level: beginner
importance: medium
format: knowledge
tags: apachebench,installation,ubuntu,debian
title: Installer ApacheBench sur Linux
context: préparer l'environnement pour les tests de charge HTTP
command: sudo apt update && sudo apt install apache2-utils -y
description: Installe les outils Apache (dont ab) sur Ubuntu/Debian sans le serveur complet. Sur CentOS/RHEL : sudo yum install httpd-tools -y. Vérifier avec : ab -V.
-->

<!-- snippet
id: aws_ab_post_json
type: command
tech: cloud
level: intermediate
importance: medium
format: knowledge
tags: apachebench,post,json,api
title: ApacheBench – Test de charge avec requête POST JSON
context: tester une API REST acceptant un body JSON sous charge
command: ab -n 2000 -c 100 -p data.json -T application/json http://localhost/api/login
description: Lance 2000 requêtes POST avec le contenu du fichier data.json et le Content-Type application/json. Créer data.json avec le body de la requête (ex: {"email":"test@test.com","password":"1234"}). Utiliser -H "Authorization: Bearer token" pour ajouter un header d'authentification. L'option -k active le Keep-Alive pour réutiliser les connexions.
-->

<!-- snippet
id: aws_ab_methodology
type: tip
tech: cloud
level: intermediate
importance: high
format: knowledge
tags: apachebench,méthodologie,charge,benchmark
title: Méthodologie de test de charge avec ApacheBench
context: exécuter des tests de charge de façon progressive et reproductible
content: Ne jamais lancer un test violent directement. Procéder par paliers : baseline (ab -n 1000 -c 50), charge moyenne (ab -n 5000 -c 200), stress test (ab -n 20000 -c 1000), puis augmenter jusqu'aux premières erreurs. Après chaque test, noter : Req/sec, latence, erreurs, et charge CPU CloudWatch. On optimise uniquement sur la base de métriques mesurées. Comparer avant/après chaque optimisation (cache, compression, CDN, load balancer).
-->

<!-- snippet
id: aws_ab_ci_cd
type: tip
tech: cloud
level: intermediate
importance: medium
format: knowledge
tags: apachebench,ci-cd,gitlab,performance
title: ApacheBench dans un pipeline CI/CD
context: automatiser les tests de performance dans GitLab CI ou GitHub Actions
content: ApacheBench peut être intégré dans un pipeline CI/CD pour valider les performances à chaque déploiement. Dans GitLab CI : utiliser l'image alpine, installer avec apk add apache2-utils, puis lancer ab sur l'URL de staging. Les résultats peuvent être sauvegardés en artefacts pour comparaison entre builds. Alternatives plus modernes pour des scénarios complexes : k6 (scripting JS, métriques Grafana), Locust (Python, scénarios réalistes), wrk (multithread).
-->

<!-- snippet
id: aws_ab_limitations
type: warning
tech: cloud
level: intermediate
importance: medium
format: knowledge
tags: apachebench,limites,alternatives,performance
title: Limites d'ApacheBench – Quand utiliser une alternative
context: choisir le bon outil de test de charge selon la complexité du scénario
content: ApacheBench est mono-thread (ne sature pas les serveurs multi-CPU modernes), ne supporte pas les scénarios complexes (multi-étapes, cookies dynamiques, sessions), ne simule pas de "think time" utilisateur réel et ne produit pas de dashboard graphique. Pour les tests de production sérieux, préférer : k6 (scripting moderne, intégration CI, métriques Grafana), Locust (scénarios Python réalistes), wrk (multithread très performant). AB reste utile pour les benchmarks rapides et la validation d'optimisations simples.
-->

---
[← Module précédent](M29_paas-serverless.md)
---
