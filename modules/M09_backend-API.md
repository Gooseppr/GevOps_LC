---
title: Backend & API
type: module
jour: 09
ordre: 1
tags: api, devops
---

# Le Backend et les API

## Comprendre, installer, exécuter et administrer les architectures serveur modernes

---

## 1. Définition et rôle du backend

Le **backend** désigne la partie cachée d’une application, celle qui gère la **logique métier**, la **sécurité**, les **bases de données** et les **services**.

Contrairement au **frontend**, qui s’occupe de l’affichage et de l’interaction avec l’utilisateur, le backend agit comme le **cerveau** du système.

Le backend :

- traite les requêtes HTTP reçues du client,
- exécute la logique nécessaire (calcul, accès base de données, règles métier),
- renvoie une **réponse structurée** au client (souvent en JSON ou HTML).

L’architecture la plus répandue aujourd’hui repose sur une séparation claire :

```
Frontend (client/présentation)
    ↓  (requête HTTP)
Backend (logique métier)
    ↓  (accès base de données / services)
Base de données (stockage persistant)

```

---

## 2. Typologies de backend : API REST et moteurs de rendu

### a) Les API REST

Une **API REST** (Representational State Transfer) est un serveur qui reçoit des requêtes HTTP et renvoie des réponses sous un format standardisé (souvent JSON).

Elles sont utilisées pour interagir avec d’autres services, des applications mobiles, ou des interfaces web dynamiques.

Exemple concret :

> Le service de paiement Stripe expose une API REST : une requête POST contenant les informations d’un paiement est envoyée au serveur Stripe, qui répond par un JSON indiquant si l’opération a réussi.
> 

**Avantages :**

- Communication universelle via HTTP.
- Indépendance entre frontend et backend.
- Réutilisable par plusieurs clients (site web, app mobile, etc.).

---

### b) Les moteurs de rendu

Avant l’essor des API REST, de nombreux frameworks rendaient directement des **pages HTML** côté serveur.

Le backend intégrait alors le moteur de rendu et renvoyait du contenu prêt à afficher.

Exemples : **PHP (Laravel)**, **Django (templates)**, **ASP.NET MVC**, etc.

**Principe :**

```
Client → Requête HTTP → Backend
Backend → Génération d'une page HTML → Réponse au client

```

**Particularité :**

Le backend gère à la fois la logique métier **et** la présentation.

C’est une architecture monolithique, encore courante dans les CMS (WordPress, Drupal…).

---

## 3. Les requêtes HTTP et les formats de réponse

### 3.1. Méthodes HTTP : rôle, sémantique, idempotence

| Méthode | Usage canonique | Corps requis ? | Idempotent ? | Exemple |
| --- | --- | --- | --- | --- |
| **GET** | Lire une ressource | Non | ✔️ | `GET /users/42` |
| **POST** | Créer / exécuter une action | Oui | ❌ | `POST /users` (création) |
| **PUT** | Remplacer **entièrement** | Oui | ✔️ | `PUT /users/42` |
| **PATCH** | Modifier **partiellement** | Oui | ❌ (souvent) | `PATCH /users/42` |
| **DELETE** | Supprimer | Facultatif | ✔️ | `DELETE /users/42` |
| **HEAD** | Métadonnées seulement | Non | ✔️ | `HEAD /users/42` |
| **OPTIONS** | Découvrir capacités (CORS) | Non | ✔️ | `OPTIONS /users` |

> Idempotent : répéter l’appel n’aggrave pas l’état (utile pour retries côté client).
> 

### 3.2. Codes de statut : signification + exemples concrets

#### Succès (2xx)

- **200 OK** — lecture ou action réussie (réponse avec contenu)
    
    ```
    HTTP/1.1 200 OK
    Content-Type: application/json
    
    {"id":42,"name":"Goose"}
    
    ```
    
- **201 Created** — création réussie **avec** `Location`
    
    ```
    HTTP/1.1 201 Created
    Location: /users/42
    Content-Type: application/json
    
    {"id":42,"name":"Goose"}
    
    ```
    
- **204 No Content** — succès **sans** corps (ex. DELETE)
    
    ```
    HTTP/1.1 204 No Content
    
    ```
    

#### Redirections (3xx)

- **304 Not Modified** — contenu inchangé (si `If-None-Match`/`ETag`)
    
    ```
    HTTP/1.1 304 Not Modified
    ETag: "abc123"
    
    ```
    

#### Erreurs client (4xx)

- **400 Bad Request** — requête mal formée
- **401 Unauthorized** — authentification manquante/incorrecte
- **403 Forbidden** — authentifié mais **pas** autorisé
- **404 Not Found** — ressource inexistante
- **409 Conflict** — conflit d’état (ex. versionning, doublon)
- **422 Unprocessable Entity** — validation échouée (payload invalide)
- **429 Too Many Requests** — **rate limit** atteint
    
    ```
    HTTP/1.1 429 Too Many Requests
    Retry-After: 60
    X-RateLimit-Limit: 100
    X-RateLimit-Remaining: 0
    
    ```
    

#### Erreurs serveur (5xx)

- **500 Internal Server Error** — erreur non gérée
- **503 Service Unavailable** — maintenance/surcharge (avec `Retry-After` recommandé)

---

### 3.3. En-têtes essentiels (à connaître et utiliser)

- **Content-Type** : format envoyé (`application/json`, `text/html`, `application/xml`)
- **Accept** : négociation de contenu côté client (`Accept: application/json`)
- **Authorization** : ex. `Bearer <token>`
- **Location** : URL de la ressource créée (201)
- **ETag / If-None-Match** : cache conditionnel et 304
- **Cache-Control** : `no-store`, `max-age=60` …
- **Link** (pagination) : `rel="next"`, `rel="prev"`
- **CORS** (réponses) : `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, etc.

---

### 3.4. Formats de réponse : JSON, HTML, erreurs standardisées

#### Réussite (JSON)

```json
{
  "data": {
    "id": 42,
    "name": "Goose"
  },
  "meta": {
    "requestId": "4be2…",
    "durationMs": 12
  }
}

```

#### Erreur normalisée (recommandé)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Field 'email' is invalid",
    "details": [
      {"field": "email", "rule": "format", "expected": "email"}
    ]
  }
}

```

---

## 4. Le rôle opérationnel du DevOps dans un projet backend

Le DevOps est responsable de l’**intégration**, du **déploiement**, et de la **supervision** des applications backend.

Son rôle est de garantir que le backend fonctionne correctement, en toutes circonstances.

### Missions principales :

1. **Installer et configurer** les environnements (langages, dépendances, services).
2. **Gérer la compatibilité** entre les environnements (local, préproduction, production).
3. **Sécuriser** les applications (authentification, chiffrement, pare-feu applicatif).
4. **Superviser** les performances et les erreurs.
5. **Déboguer** les pannes ou anomalies.
6. **Mettre en place un reverse proxy (Nginx, Traefik)** pour protéger les ports internes.

> Exemple : Le DevOps peut installer une application Flask en local, la packager avec Docker, et la déployer derrière un Nginx pour la rendre accessible via HTTPS.
> 

---

## 5. Les principales stacks backend

Chaque langage possède ses frameworks et outils spécifiques, mais la logique d’exploitation reste la même.

| Langage | Framework principal | Gestionnaire de paquets | Commandes essentielles |
| --- | --- | --- | --- |
| **Node.js** | Express, NestJS | npm / yarn | `npm install` → `npm start` |
| **Python** | Flask, Django | pip | `pip install -r requirements.txt` → `flask run` |
| **Java** | Spring Boot | Maven / Gradle | `mvn spring-boot:run` |
| **PHP** | Laravel, Symfony | Composer | `composer install` → `php artisan serve` |
| **.NET (C#)** | ASP.NET Core | dotnet | `dotnet restore` → `dotnet run` |
| **Go** | Gin, Fiber | go mod | `go mod tidy` → `go run main.go` |
| **Rust** | Actix-Web, Rocket | Cargo | `cargo run` |

Chaque stack comprend :

- un **interpréteur ou compilateur** (Node, Python, Java, Rust, etc.),
- un **gestionnaire de paquets**,
- un **outil de lancement** du serveur local,
- un **système de logs** intégré.

---

## 6. Structure type d’un projet backend

Peu importe la technologie utilisée, les projets backend suivent une organisation récurrente.

```
project/
├─ src/                 → Code source principal
├─ public/              → Fichiers statiques (images, CSS…)
├─ config/              → Fichiers de configuration
├─ bin/                 → Scripts d’exécution ou d’installation
├─ .env                 → Variables d’environnement (non versionné)
├─ README.md            → Documentation du projet

```

### Fichiers de configuration caractéristiques

| Fichier | Langage / Outil | Rôle |
| --- | --- | --- |
| `package.json` | Node.js | Dépendances et scripts du projet |
| `requirements.txt` | Python | Liste des bibliothèques nécessaires |
| `pom.xml` | Java (Maven) | Déclaration des dépendances et plugins |
| `composer.json` | PHP | Dépendances et autoload du projet |
| `.csproj` | .NET | Configuration du projet et dépendances |
| `go.mod` | Go | Informations du module et dépendances |
| `Cargo.toml` | Rust | Métadonnées et dépendances |

### Variables sensibles

Les fichiers `.env` contiennent souvent :

```
DB_USER=admin
DB_PASS=secret
API_KEY=abcd1234

```

Ces fichiers **ne doivent jamais être publiés sur GitHub**.

Les secrets doivent être stockés dans un **vault** (HashiCorp Vault, AWS Secrets Manager, Doppler…).

---

## 7. Administration et exploitation d’un backend

Le DevOps doit maîtriser un ensemble de commandes et de vérifications pour assurer le bon fonctionnement de chaque service.

### Commandes génériques

```bash
# Vérifier qu’un port est occupé
lsof -i :8080

# Surveiller les processus backend
ps aux | grep node
ps aux | grep java

# Arrêter proprement un serveur
Ctrl + C

# Vérifier les logs d’une application
tail -f logs/app.log

```

### Reverse proxy simplifié (Nginx)

```
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

```

---

## 8. Méthodologie de prise en main d’un projet backend inconnu

1. **Identifier la stack** → repérer les fichiers caractéristiques (`package.json`, `pom.xml`, `go.mod`...).
2. **Lire la documentation** (`README.md`, commentaires, scripts).
3. **Installer les dépendances** avec le bon gestionnaire.
4. **Configurer les variables** (`.env`, config/...).
5. **Lancer localement** le serveur.
6. **Tester les routes** avec `curl`.
7. **Observer les logs** pour comprendre le comportement du backend.
8. **Sécuriser** (proxy, authentification, permissions).
9. **Superviser** (disponibilité, consommation CPU/RAM, métriques).

---

## 9. Vision d’ensemble d’un DevOps sur le backend

| Étape | Objectif | Outils clés |
| --- | --- | --- |
| **Installation** | Préparer les environnements de dev/test/prod | apt, docker, package managers |
| **Intégration** | Mettre en place CI/CD | GitHub Actions, Jenkins |
| **Sécurisation** | Éviter les fuites et les attaques | HTTPS, reverse proxy, authentification |
| **Supervision** | Surveiller la santé et la charge | Prometheus, Grafana, ELK |
| **Optimisation** | Réduire la latence et la consommation | Profiling, caching, scaling |

---

## 10. À retenir

- Le **backend** est la partie logique et invisible d’une application.
- Deux grands modèles existent : **API REST** et **moteur de rendu**.
- Les **requêtes HTTP** (GET, POST, PUT, PATCH, DELETE) structurent la communication client/serveur.
- Les **formats JSON** dominent dans les API modernes.
- Chaque langage dispose de ses **outils** : Node (npm), Python (pip), Java (maven), PHP (composer), etc.
- Le **DevOps** joue un rôle central : installation, sécurité, supervision, et automatisation du cycle de vie.
- Les **fichiers de configuration** (package.json, pom.xml, etc.) sont la carte d’identité technique d’un projet.
- Le **.env** et les secrets doivent toujours rester protégés.
- Une architecture propre = un backend maîtrisé, sécurisé et évolutif.

---
[Module suivant →](M09_pratique-framework.md)
---
