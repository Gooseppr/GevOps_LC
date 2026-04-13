---
layout: page
title: "Anti-patterns API — Diagnostic et correction des défauts de conception"

course: api_rest_cheap
chapter_title: "Anti-patterns API"

chapter: 5
section: 1

tags: anti-patterns,diagnostic,production,conception,erreurs-courantes
difficulty: advanced
duration: 75
mermaid: true

status: "published"
prev_module: "/courses/api_rest_cheap/16_performance_api.html"
prev_module_title: "Performance API — Optimisation et scalabilité"
next_module: "/courses/api_rest_cheap/14_observabilite_api.html"
next_module_title: "Observabilité API"
---

## Objectifs pédagogiques

À la fin de ce module, vous serez capable de :

1. **Identifier** les défauts de conception dans une API (reconnaissance de symptômes)
2. **Comprendre** pourquoi ces défauts créent des problèmes en production (cause → conséquence)
3. **Diagnostiquer** quel anti-pattern s'applique à une situation donnée
4. **Corriger** une API existante sans rupture de compatibilité
5. **Prévenir** ces pièges lors de la conception d'une nouvelle API

---

## Mise en situation

Vous opérez une API REST en production depuis 6 mois. Les retours des consommateurs commencent à poser des problèmes :

- Les clients reçoivent sporadiquement des `500` qui se résolvent seuls après quelques secondes
- Une modification "mineure" du champ `user_role` (ancien format string → nouvel objet) a cassé 3 services en cascade
- Les développeurs frontend doivent faire 7 appels API séquentiels pour afficher une page produit
- La réponse `/users?page=1` contient tantôt 50, tantôt 100 résultats selon le moment de l'appel
- Les codes HTTP reçus sont étranges : `200` pour un utilisateur inexistant, `500` pour un champ invalide

**Avant ce cours**, vous suspectez les services backend ou une mauvaise implémentation client.

**Après ce cours**, vous reconnaîtrez : défaut d'idempotence, versioning cassant, N+1 queries, absence de paginaison, violation des codes HTTP — tous des anti-patterns API **de conception**, et vous saurez les corriger.

---

## Résumé

Un **anti-pattern API** est une décision de conception qui semble logique à court terme mais crée des coûts opérationnels, de maintenance ou de compatibilité disproportionnés en production. Contrairement aux bugs (comportement inattendu), les anti-patterns sont souvent *intentionnels mais mal motivés* — une API qui retourne `200` avec un message d'erreur dans le body semble "fonctionner", mais elle viole le contrat HTTP et empêche les client de réagir correctement.

Ce module vous entraîne au **diagnostic** : reconnaître les 8 anti-patterns les plus courants, comprendre quand et pourquoi ils se manifestent, et comment les corriger. Vous apprendrez aussi que chaque anti-pattern a souvent une raison d'exister initialement — l'enjeu est de savoir quand il cesse d'être adapté et comment migrer vers une conception saine sans casser les clients.

---

## Anti-patterns : l'essentiel à maîtriser

### 1️⃣ Ignorer les codes HTTP standards — traiter tout en 200

**Symptôme**

```json
GET /api/users/999 HTTP/1.1

HTTP/1.1 200 OK
{
  "success": false,
  "error": "User not found",
  "data": null
}
```

L'API retourne `200` pour un utilisateur inexistant, ou `200` pour une validation échouée. Le client doit parser le body pour savoir si l'appel a vraiment fonctionné.

**Pourquoi c'est un anti-pattern**

Les codes HTTP sont un **contrat**. Un `200` signifie "la requête a réussi, la réponse est complète et exploitable". Quand vous retournez `200` avec `"success": false` ou un message d'erreur, vous cassez ce contrat :

- Les proxy, load balancers, caches et clients HTTP supposent qu'un `200` peut être mis en cache ou réutilisé
- Les frameworks (Express, FastAPI, Django) offrent des shortcut pour gérer les erreurs → pas de raison de les contourner
- Les tests et monitoring deviennent flous : un `200 != succès fonctionnel`
- Les clients doivent écrire du code defensive pour tous les cas

**Correction**

```json
GET /api/users/999 HTTP/1.1

HTTP/1.1 404 Not Found
{
  "error": "user_not_found",
  "message": "L'utilisateur 999 n'existe pas",
  "trace_id": "req_abc123"
}
```

**Règles concrètes à appliquer** :

| Situation | Code | Raison |
|-----------|------|--------|
| Ressource trouvée et renvoyée complètement | `200 OK` | Contrat respecté |
| Ressource créée | `201 Created` + Location header | Permet au client de récupérer l'URI sans faire un nouveau GET |
| Ressource inexistante | `404 Not Found` | Distingue "je n'ai pas trouvé" de "j'ai trouvé mais rejette" |
| Authentification manquante | `401 Unauthorized` | Client doit ajouter un token |
| Authentification valide mais permission insuffisante | `403 Forbidden` | Client n'a pas le droit, même authentifié |
| Validation échouée (champ vide, format invalide) | `400 Bad Request` | Erreur du client, pas du serveur |
| Ressource existe mais état conflictuel | `409 Conflict` | Ex: créer deux fois la même ressource |
| Erreur serveur imprévisible | `500 Internal Server Error` | Bogue backend, pas lié au client |

💡 **Astuce** — Si vous êtes tenté de retourner `200` avec un champ erreur, demandez-vous : "Si mon code client vérifie d'abord le statut HTTP, aurais-je besoin de parser le body ?" Si non, vous êtes sur la bonne voie.

---

### 2️⃣ Versioning cassant — casser les clients quand vous modifiez la réponse

**Symptôme**

Vous migrez votre API v1 vers v2. Dans v2, le champ `user_role` passe de string à objet :

```json
// V1
{ "id": 1, "name": "Alice", "user_role": "admin" }

// V2
{ "id": 1, "name": "Alice", "user_role": { "id": 1, "name": "Administrator" } }
```

Les clients qui consomment v1 commencent à crasher : ils attendent une string, reçoivent un objet, et les propriétés `.toLowerCase()` ou `===` échouent.

**Pourquoi c'est un anti-pattern**

Quand une API change de schéma **sans migration structurée**, les clients cassent immédiatement. Pire : vous découvrez le problème via les erreurs de production, pas via des tests.

La raison : une API est un **contrat** que vous avez signé avec tous vos clients (frontend, services internes, partenaires externes). Casser le contrat sans prévention est une violation.

**Correction — 3 stratégies progressives**

**Option 1 : Versioning par URL** (quand la breaking change est intentionnelle)

Vous maintenez deux versions en parallèle. Les nouveaux clients consomment v2, les anciens restent sur v1 le temps qu'ils migrent.

```
GET /api/v1/users/1 → { "user_role": "admin" }
GET /api/v2/users/1 → { "user_role": { "id": 1, "name": "Administrator" } }
```

**Contrainte** : supporter deux versions en code = maintenance doublée. À utiliser que si vraiment nécessaire.

**Option 2 : Évolutivité additive** (mode par défaut)

Vous **ajoutez** des champs, vous ne supprimez jamais.

```json
// Version initiale
{ "id": 1, "name": "Alice", "user_role": "admin" }

// Évolution : on ajoute le nouveau champ, on garde l'ancien
{ "id": 1, "name": "Alice", "user_role": "admin", "role": { "id": 1, "name": "Administrator" } }

// Les clients peuvent migrer à leur rythme : ignorer user_role, utiliser role
// Après 1 an (quand tout le monde a migré) : supprimer user_role
```

**Option 3 : Stratégie d'acceptation** (plus modernes)

Vous offrez un paramètre ou header pour que le client déclare quelle version il comprend :

```
GET /api/users/1?schema_version=2
Accept: application/json; version=2
```

Le serveur adapte la réponse sans créer une URL différente.

⚠️ **Erreur fréquente** — Croire qu'ajouter un champ optionnel dans la réponse est "backward compatible". Faux si le client utilise une bibliothèque de sérialisation stricte (Protobuf, JSON Schema) : le champ non attendu peut déclencher une validation.

---

### 3️⃣ N+1 queries — faire 100 appels quand 1 suffit

**Symptôme**

Pour afficher une liste de 10 articles avec leurs auteurs, votre backend fait :

1. `SELECT * FROM articles LIMIT 10` → 10 articles
2. `SELECT * FROM users WHERE id = ?` × 10 → une requête par article pour récupérer l'auteur
3. **Total : 11 requêtes là où 1 join aurait suffi**

Vue de l'API REST :

```
GET /api/articles?limit=10
  → Retourne 10 articles avec author_id, mais pas le nom/email de l'auteur

// Le frontend doit faire :
GET /api/users/1
GET /api/users/2
GET /api/users/3
... (10 requêtes)
```

**Pourquoi c'est un anti-pattern**

- **Latence** : 11 aller-retours réseau vs 1, c'est 11× plus lent en pire cas
- **Load serveur** : on augmente la charge CPU/I/O sans nécessité
- **Expérience utilisateur** : le frontend attend toutes les requêtes avant d'afficher la page

**Correction — 3 niveaux**

**Niveau 1 : Inclusion optionnelle (simple)**

```
GET /api/articles?limit=10&include=author

HTTP/1.1 200 OK
{
  "data": [
    {
      "id": 1,
      "title": "...",
      "author": { "id": 1, "name": "Alice", "email": "alice@..." }
    }
  ]
}
```

Le paramètre `include=author` dit au backend : "Ajoute l'objet auteur complet dans la réponse."

**Niveau 2 : Graphe de ressources (JSON:API, HAL)**

Vous structurez la réponse pour expliciter les ressources liées :

```json
{
  "data": [
    { "id": 1, "type": "articles", "attributes": { "title": "..." }, "relationships": { "author": { "data": { "type": "users", "id": 1 } } } }
  ],
  "included": [
    { "id": 1, "type": "users", "attributes": { "name": "Alice" } }
  ]
}
```

Les ressources liées sont dans `included`, une seule fois, réutilisées via des références. Le client sait ce qui a été chargé.

**Niveau 3 : GraphQL (approche radicale)**

```graphql
{
  articles(limit: 10) {
    id
    title
    author {
      name
      email
    }
  }
}
```

Le client demande **exactement** ce dont il a besoin, le serveur optimise la requête SQL en fonction.

💡 **Astuce** — Avant d'ajouter une relation dans la réponse API, demandez-vous : "Est-ce que 80% des clients auront besoin de cette donnée ?" Si non, laissez-la optionnelle (paramètre `include`). Cela évite d'allourdir les réponses inutilement.

---

### 4️⃣ Paginaison inopérante ou incohérente

**Symptôme**

```
GET /api/users?page=1 → 50 résultats
GET /api/users?page=2 → 50 résultats
GET /api/users?page=1 → 100 résultats (?!)
```

Le nombre de résultats par page varie sans raison, ou la paginaison n'existe pas du tout :

```
GET /api/logs → retourne 1 million de logs
Timeout. Mémoire dépassée. Crash.
```

**Pourquoi c'est un anti-pattern**

Sans paginaison ou avec une paginaison cassée :

- Le client ne peut pas prédire la taille des réponses → allocation mémoire imprévisible
- À l'échelle, vous retournez des réponses gigantesques pour chaque requête → bande passante gaspillée
- Les bases de données doivent extraire tous les résultats avant d'envoyer → latence et CPU explosent

**Correction — Paginaison par offset/limit ou cursor**

**Option 1 : Offset/Limit (simple, mais limitation)**

```
GET /api/users?offset=0&limit=50
GET /api/users?offset=50&limit=50
GET /api/users?offset=100&limit=50
```

Le backend retourne les N résultats à partir de l'offset, toujours dans le même ordre.

**Limitation** : si la table change entre deux appels (un utilisateur est supprimé), l'offset `offset=100` peut sauter un résultat ou dédoubler. OK pour des données quasi-statiques, problématique pour des données très changeantes.

**Option 2 : Cursor-based (robuste)**

```
GET /api/users?limit=50
→ { "data": [...], "next_cursor": "abc123xyz" }

GET /api/users?limit=50&cursor=abc123xyz
→ { "data": [...], "next_cursor": "def456uvw" }
```

Le cursor encode la position de manière opaque (ex: ID du dernier objet + timestamp). Même si la table change, le cursor désigne toujours le même point logique.

**Contrainte** : le client doit stocker et réutiliser le cursor, pas le calculer.

**Option 3 : Incrémentaux (keyset pagination)**

```
GET /api/users?limit=50&since_id=100
→ Retourne les users avec id > 100
```

Utile pour les feeds temps-réel (notifications, messages) où l'utilisateur veut juste "ce qu'il y a après le dernier que j'ai vu".

**Métadonnées obligatoires dans la réponse**

```json
{
  "data": [...],
  "pagination": {
    "total_count": 12500,
    "limit": 50,
    "offset": 0,
    "has_more": true,
    "next_url": "/api/users?offset=50&limit=50"
  }
}
```

Le client sait combien de résultats existent, où il en est, s'il doit faire une requête suivante.

⚠️ **Erreur fréquente** — Compter les résultats totaux (`total_count`) à chaque requête. Si la table a 10 millions de lignes, `SELECT COUNT(*)` bloque les écritures. Précalculez `total_count` ou dites simplement `has_more: true/false`.

---

### 5️⃣ Absence de contrat clair — API explorer par essai/erreur

**Symptôme**

```
GET /api/search
```

Aucune documentation. Le client essaie :

```
GET /api/search?q=alice → 500 (serveur crashe si q est vide)
GET /api/search?query=alice → 200 { "data": [] } (silencieux, pas de résultats)
GET /api/search?text=alice → 404 (endpoint inexistant)
```

Finalement, après 15 tentatives, il découvre que c'est `/api/search?q=alice&type=user&limit=20`, et même là, ça retourne parfois du JSON, parfois du XML.

**Pourquoi c'est un anti-pattern**

Une API sans contrat clair est une **API non maintenable** :

- Les clients écrivent du code defensive pour tous les cas imaginables
- Vous cassez accidentellement des clients en changeant le paramètre `q` en `query`
- Chaque bug prend 3× plus de temps à déboguer (le client pense que c'est lui qui se trompe)
- Les équipes concurrentes réinventent la roue au lieu de réutiliser l'API

**Correction**

**Niveau 1 : OpenAPI/Swagger**

Documentez formellement l'API :

```yaml
paths:
  /api/search:
    get:
      parameters:
        - name: q
          in: query
          required: true
          schema:
            type: string
            minLength: 1
          description: Terme de recherche (au moins 1 caractère)
        - name: type
          in: query
          required: false
          schema:
            type: string
            enum: [user, article, comment]
          description: Filtre par type de ressource
        - name: limit
          in: query
          required: false
          schema:
            type: integer
            default: 10
            maximum: 100
      responses:
        '200':
          description: Résultats trouvés
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                  total:
                    type: integer
        '400':
          description: Paramètre q manquant ou invalide
```

Cette spécification génère :
- Une UI Swagger explorable dans le navigateur
- Des clients auto-générés (JS, Python, Java...)
- Des tests automatisés

**Niveau 2 : Validation + erreurs structurées**

Dans le code :

```python
from pydantic import BaseModel, Field

class SearchQuery(BaseModel):
    q: str = Field(..., min_length=1, max_length=100)
    type: Optional[str] = Field(None, enum=['user', 'article'])
    limit: int = Field(10, ge=1, le=100)

@app.get("/search")
def search(query: SearchQuery):
    try:
        results = db.search(query.q, query.type, query.limit)
        return { "data": results, "total": len(results) }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
```

Si `q` est vide, la réponse est automatiquement `400` + un message clair. Pas de 500 mystérieux.

**Niveau 3 : Changelog et versioning**

```
API v2.1 (2024-01-15)
- ADDED: /api/search accepte le paramètre 'filters' pour recherche avancée
- CHANGED: /api/search?type retourne maintenant un ID au lieu d'un slug (ex: 1 au lieu de "article")
- DEPRECATED: /api/search?category sera supprimé dans v3.0 (utiliser ?type à la place)
```

Les clients savent quand une breaking change arrive et peuvent planifier la migration.

---

### 6️⃣ Idempotence cassée — créer 3 fois la même ressource avec 1 requête

**Symptôme**

```
POST /api/orders
Body: { "user_id": 1, "product_id": 5, "quantity": 1 }

Response 1: { "id": 101, "status": "created" }
```

Le client n'a pas entendu la réponse et réessaie (timeout réseau, retry automatique) :

```
POST /api/orders
Body: { "user_id": 1, "product_id": 5, "quantity": 1 }

Response 2: { "id": 102, "status": "created" }
```

**Résultat** : 2 commandes identiques ont été créées au lieu de 1. Le client a reçu une réponse à la première tentative, mais ne le savait pas.

**Pourquoi c'est un anti-pattern**

En production, les requêtes **réessaient toujours** (timeouts réseau, retry logiciel). Si votre API crée une ressource à chaque retry au lieu d'une seule, vous avez des doublons, de la fraude ou des données corrompues.

**Correction — Idempotence par clé**

L'idée : le client fournit un ID unique pour la requête. Le serveur se souvient : "J'ai déjà traité cette requête, voici le résultat en cache."

```
POST /api/orders
Headers: Idempotency-Key: user1_product5_20240115_001
Body: { "user_id": 1, "product_id": 5, "quantity": 1 }

Response 1: { "id": 101, "status": "created" }
```

Retry :

```
POST /api/orders
Headers: Idempotency-Key: user1_product5_20240115_001
Body: { "user_id": 1, "product_id": 5, "quantity": 1 }

Response 2: { "id": 101, "status": "created" }  ← Même réponse
```

**Implémentation**

```python
from functools import lru_cache

idempotency_cache = {}  # En prod : Redis

@app.post("/orders")
def create_order(data: OrderData, idempotency_key: str = Header(...)):
    # Vérifier si cette requête a déjà été traitée
    if idempotency_key in idempotency_cache:
        return idempotency_cache[idempotency_key]
    
    # Créer la commande
    order = Order.create(data)
    result = { "id": order.id, "status": "created" }
    
    # Mémoriser le résultat pour les retries
    idempotency_cache[idempotency_key] = result
    
    return result
```

**Contraintes pratiques**

- Le cache d'idempotence doit survivre aux redémarrages du serveur → utiliser Redis ou une base de données
- Nettoyer les anciennes clés (> 24h) pour éviter une croissance infinie du cache
- Tous les POST ne sont pas idempotents (ex: `POST /api/notifications` d'une notification unique) → le client doit utiliser la clé quand ça compte

💡 **Astuce** — Si vous n'implémentez pas l'idempotence côté serveur, demandez au client de la gérer (déduplication client-side, idempotent token, check before POST). C'est moins robuste mais mieux que rien.

---

### 7️⃣ Gestion d'erreur par exception — pas de messages exploitables

**Symptôme**

```
POST /api/users
Body: { "email": "alice", "age": -5 }

HTTP/1.1 400 Bad Request
{
  "error": "Validation failed"
}
```

C'est quoi, le problème ? Le email est invalide ? L'age est négatif ? Les deux ? Le client ne sait pas quoi afficher à l'utilisateur.

Pire :

```
HTTP/1.1 500 Internal Server Error
{
  "error": "Unexpected error"
}
```

Aucune trace. Impossible de déboguer.

**Pourquoi c'est un anti-pattern**

Les erreurs sont votre API's interface avec les situations problématiques. Des erreurs floues signifient :

- Les clients écrivent du code defensive **très** pessimiste ("si ça échoue, réessayer 5 fois")
- Les bugs prennent 10× plus longtemps à identifier
- Vous ne saurez jamais pourquoi vos utilisateurs sont frustrés

**Correction — Structure d'erreur claire**

```json
HTTP/1.1 400 Bad Request
{
  "type": "validation_error",
  "message": "La requête contient des champs invalides",
  "trace_id": "req_abc123_xyz789",
  "details": [
    {
      "field": "email",
      "issue": "invalid_format",
      "message": "Email invalide : 'alice' ne contient pas '@'"
    },
    {
      "field": "age",
      "issue": "out_of_range",
      "message": "Age doit être >= 0, reçu: -5"
    }
  ]
}
```

Structure :
- **type** : catégorie machine-readable (validation_error, auth_error, not_found...)
- **message** : explication humaine
- **trace_id** : référence unique pour tracer la requête côté serveur (utile pour le support)
- **details** : liste structurée des problèmes (pour les validations complexes)

Pour les erreurs serveur :

```json
HTTP/1.1 500 Internal Server Error
{
  "type": "internal_error",
  "message": "Une erreur inattendue s'est produite",
  "trace_id": "req_def456_uvw",
  "timestamp": "2024-01-15T14:32:10Z"
}
```

Le `trace_id` permet au client de signaler l'erreur au support : "Mon requête req_def456_uvw a échoué à 14h32". L'équipe de support consulte les logs serveur avec ce `trace_id` et trouve l'erreur exacte.

**Implémentation standard**

Utiliser une bibliothèque :
- **FastAPI** : utiliser `HTTPException` avec un `detail` structuré
- **Express.js** : middleware d'erreur centralisé
- **Django REST** : classe `APIException` personnalisée

Exemple FastAPI :

```python
from fastapi import HTTPException
from pydantic import BaseModel, validator

class UserCreate(BaseModel):
    email: str
    age: int
    
    @validator('email')
    def email_valid(cls, v):
        if '@' not in v:
            raise ValueError('Email invalide')
        return v
    
    @validator('age')
    def age_positive(cls, v):
        if v < 0:
            raise ValueError('Age doit être positif')
        return v

@app.post("/users")
def create_user(user: UserCreate):
    # Pydantic valide automatiquement et retourne 400 avec les détails
    ...
```

⚠️ **Erreur fréquente** — Exposer les détails techniques internes dans les messages d'erreur 500 : "Column 'user_id' does not exist in table 'orders'". Cela révèle la structure de la base et permet les attaques ciblées. **Règle** : 5xx → message générique + trace_id privé. Les détails techniques vont dans les logs serveur, pas la réponse.

---

### 8️⃣ Absence de rate limiting — API exploitable sans limite

**Symptôme**

```
for i in range(1000000):
    requests.get("https://api.example.com/users/1")
```

L'API accepte le million de requêtes sans broncher. Résultats :

- La base de données est surcharge, l'API devient lente pour tous les utilisateurs
- Coûts d'infrastructure explosent
- Rien ne distingue un bot malveillant d'un client légitime qui a un bug

**Pourquoi c'est un anti-pattern**

Sans limite, une API est vulnérable à :
- **Attaques de déni de service (DoS)** : un attaquant sature votre infrastructure
- **Bugs client en boucle infinie** : un retry automatique qui boucle consomme toutes vos ressources
- **Web scraping agressif** : quelqu'un télécharge votre base complète en quelques minutes

**Correction — Rate limiting par client**

```
GET /api/users/1
Headers:
  X-API-Key: user123_key_abc
```

Règles appliquées :

- Par défaut : 100 requêtes par minute par API key
- Plan premium : 10 000 requêtes par minute
- Utilisateur non authentifié (IP anonyme) : 10 requêtes par minute

**Implémentation courante**

Avec Redis :

```python
from redis import Redis
from time import time

redis = Redis()

def rate_limit(user_id, limit=100, window=60):
    key = f"rate_limit:{user_id}"
    current = redis.incr(key)
    
    if current == 1:
        redis.expire(key, window)
    
    if current > limit:
        return False, f"Rate limit exceeded. Retry after {window}s"
    
    return True, None

@app.get("/users/<id>")
def get_user(id, request: Request):
    api_key = request.headers.get('X-API-Key')
    allowed, error = rate_limit(api_key)
    
    if not allowed:
        raise HTTPException(status_code=429, detail=error)
    
    return get_user_from_db(id)
```

**Headers informatifs**

```
HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 43
X-RateLimit-Reset: 1705339200
```

Le client sait combien de requêtes il a restantes et quand la limite se réinitialise.

**Quand on dépasse la limite**

```
HTTP/1.1 429 Too Many Requests
Retry-After: 60
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1705339200

{
  "error": "rate_limit_exceeded",
  "message": "Limite de 100 requêtes par minute dépassée",
  "retry_after": 60
}
```

Le header `Retry-After` dit au client quand recommencer. Les clients HTTP intelligents respectent ce header automatiquement.

💡 **Astuce** — Les bots ignorent les rate limits. Pour une vraie protection, combinez : rate limiting +
