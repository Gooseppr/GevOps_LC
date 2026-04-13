---
layout: page
title: "HTTP & REST : Fondamentaux pour les API"

course: "API REST"
chapter_title: "Fondations"

chapter: 1
section: 2

tags: http,rest,api,protocole,web,méthodes-http,codes-statut
difficulty: beginner
duration: 75
mermaid: true

icon: "🔵"
domain: "API REST"
domain_icon: "📡"
status: "published"
---

## Objectifs pédagogiques

À la fin de ce module, tu seras capable de :
- Distinguer les méthodes HTTP et les appliquer correctement selon l'intention (créer, lire, modifier, supprimer)
- Interpréter les codes de statut HTTP pour diagnostiquer rapidement un problème API
- Comprendre pourquoi certaines opérations sont idempotentes et d'autres non
- Construire une requête HTTP valide avec headers et body JSON
- Reconnaître une API RESTful correctement conçue

---

## Contexte et problématique

Imagine deux systèmes qui doivent communiquer : un frontend qui demande des données utilisateur, un backend qui les stocke. Sans règles communes, chacun inventerait sa propre façon de demander (« donne-moi l'user 42 » vs « récupère le profil avec ID 42 »). Le résultat ? du chaos.

C'est exactement ce que HTTP & REST résolvent. HTTP fournit un **protocole de transport standardisé** (avec méthodes, codes, headers), et REST impose des **conventions d'usage** pour que n'importe quel client puisse comprendre n'importe quelle API sans documentation secrète.

En pratique, si tu dois intégrer un service tiers, déboguer une API en prod, ou concevoir la tienne : tu dois maîtriser ces deux couches. Pas de contournement.

---

## HTTP : le protocole de base

### Pourquoi HTTP ?

HTTP n'est pas une invention pour les APIs. C'est d'abord le protocole du web : navigateur → serveur, document HTML → affichage. Les APIs l'ont réutilisé parce qu'il fait déjà le travail : requête claire, réponse structurée, codes d'erreur, authentification.

**Un point clé** : HTTP est **sans état** (stateless). Chaque requête est indépendante. Le serveur ne se souvient rien du client entre deux appels. C'est pour ça qu'on utilise tokens, cookies, ou headers d'authentification à chaque fois.

### Anatomie d'une requête HTTP

```
GET /api/users/42 HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGci...
Content-Type: application/json

{"filter":"active"}
```

**Décomposition** :
- **Ligne de demande** : méthode (GET) + route (/api/users/42) + version HTTP
- **Headers** : métadonnées (qui tu es, quel format tu acceptes, etc.)
- **Corps (body)** : données à envoyer (optionnel pour GET, obligatoire pour POST/PUT)

### Anatomie d'une réponse HTTP

```
HTTP/1.1 200 OK
Content-Type: application/json
X-RateLimit-Remaining: 99

{
  "id": 42,
  "name": "Alice",
  "email": "alice@example.com"
}
```

**Décomposition** :
- **Ligne d'état** : code (200) + signification (OK)
- **Headers** : infos sur la réponse (format, limite de requêtes restantes, etc.)
- **Corps** : les données elles-mêmes (JSON, XML, etc.)

---

## Les méthodes HTTP : l'intention de ta requête

Chaque méthode exprime une **intention**. C'est crucial pour que le serveur sache quoi faire.

### GET : lire sans modifier

```
GET /api/users/42 HTTP/1.1
```

**Propriétés** :
- ✅ Idempotente : appeler 1 fois ou 100 fois = même résultat
- ✅ Pas de corps (optionnel, généralement vide)
- ✅ Peut être mis en cache
- ❌ Ne pas l'utiliser pour modifier des données

**Exemple réel** : récupérer la liste des commandes d'un client.

### POST : créer une nouvelle ressource

```
POST /api/users HTTP/1.1
Content-Type: application/json

{
  "name": "Bob",
  "email": "bob@example.com"
}
```

**Propriétés** :
- ❌ NON idempotente : appeler 2 fois crée 2 ressources (Bob #1 et Bob #2)
- ✅ Corps obligatoire
- ❌ Pas de cache
- ✅ Retourne souvent **201 Created** (au lieu de 200)

**Piège classique** : un client qui retry automatiquement une requête POST en cas d'erreur réseau crée des doublons. Solution : ajouter un identifiant de demande unique (idempotency key) côté serveur.

### PUT : remplacer entièrement une ressource

```
PUT /api/users/42 HTTP/1.1
Content-Type: application/json

{
  "name": "Alice Brown",
  "email": "alice.brown@example.com"
}
```

**Propriétés** :
- ✅ Idempotente : envoyer 2 fois le même PUT = même état final (l'utilisateur 42 a le même profil les 2 fois)
- ✅ Corps obligatoire
- ✅ Tu dois envoyer la ressource **complète** (tous les champs)

**La différence clé avec POST** : PUT est idempotente. Si la requête échoue et que tu la retires, le serveur arrive au même résultat. POST ne garantit rien.

### PATCH : modifier partiellement une ressource

```
PATCH /api/users/42 HTTP/1.1
Content-Type: application/json

{
  "email": "newemail@example.com"
}
```

**Propriétés** :
- ⚠️ Pas vraiment idempotente en théorie (dépend de l'implémentation)
- ✅ Corps optionnel (tu envoies juste ce que tu changes)
- ✅ Pratique pour les mises à jour partielles

**Quand l'utiliser** : tu veux changer un champ sans toucher aux autres. Sinon, PUT est plus sûr.

### DELETE : supprimer une ressource

```
DELETE /api/users/42 HTTP/1.1
```

**Propriétés** :
- ✅ Idempotente : supprimer 2 fois donne le même résultat (la ressource n'existe plus)
- ❌ Pas de corps
- ✅ Retourne souvent **204 No Content**

---

## Les codes de statut HTTP : lire la réponse

Les codes décrivent ce qui s'est passé. Ils sont organisés par tranche :

### 2xx : succès

| Code | Sens | Quand l'utiliser |
|------|------|------------------|
| **200 OK** | Requête réussie, réponse contient les données | GET, POST (parfois), PUT, PATCH |
| **201 Created** | Ressource créée avec succès | POST qui crée une nouvelle ressource |
| **204 No Content** | Succès, mais pas de corps à envoyer | DELETE, PATCH sans résultat |

**En pratique** : si tu fais un POST pour créer un user et ça marche, retourne **201 + le user créé** (avec son ID généré). Pas juste 200.

### 4xx : erreur du client

L'utilisateur (ou ton code) a demandé quelque chose d'invalide.

| Code | Sens | Exemple |
|------|------|---------|
| **400 Bad Request** | Requête mal formée (JSON invalide, paramètre manquant) | Tu envoies `{"name": "Bob"` (pas de fermeture) |
| **401 Unauthorized** | Authentication manquante ou invalide | Token expiré, pas de token |
| **403 Forbidden** | Authentification OK, mais permission refusée | L'user authentifié n'a pas le droit de supprimer ce user |
| **404 Not Found** | La ressource n'existe pas | Chercher `/api/users/999999` alors qu'il n'y a que 42 users |
| **409 Conflict** | État du serveur incompatible avec la requête | Essayer de créer un user avec un email déjà existant (unicité violée) |
| **429 Too Many Requests** | Rate limiting : tu appelles trop vite | 100 requêtes en 1 seconde, limite = 10/sec |

**Piège courant** : confondre 401 et 403. **401** = "qui es-tu ?" (pas authentifié). **403** = "je te connais, mais non" (pas autorisé).

### 5xx : erreur du serveur

Le serveur a buggé, c'est pas ta faute.

| Code | Sens | Cause typique |
|------|------|----------------|
| **500 Internal Server Error** | Erreur non gérée (exception, crash) | Bug dans le code du serveur |
| **502 Bad Gateway** | Le serveur frontal ne peut pas joindre le backend | Service backend arrêté, surcharge |
| **503 Service Unavailable** | Serveur temporairement indisponible | Maintenance, déploiement en cours |

---

## Headers HTTP : les métadonnées essentielles

Les headers sont des paires clé-valeur qui décrivent la requête ou la réponse.

### Headers de requête fréquents

**Authorization**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
Transmet ton identité (token, clé API, credentials). Essentiellement tous les endpoints API le demandent.

**Content-Type**
```
Content-Type: application/json
```
Dit au serveur le format des données du corps. `application/json` = JSON. Si tu oublies, le serveur peut mal interpréter.

**Accept**
```
Accept: application/json
```
Dit au serveur quel format tu préfères pour la réponse. La plupart des APIs répondent en JSON de toute façon.

**User-Agent**
```
User-Agent: MyApp/1.0 (compatible; MyIntegration)
```
Identifie ton client. Utile pour les stats et le debugging serveur.

### Headers de réponse fréquents

**Content-Type**
```
Content-Type: application/json; charset=utf-8
```
Format de la réponse (JSON, HTML, etc.).

**X-RateLimit-Remaining**
```
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640000000
```
Indique tes requêtes restantes avant d'être bloqué. Crucial pour ne pas te faire rate-limiter par surprise.

**Set-Cookie**
```
Set-Cookie: session_id=abc123; Path=/; HttpOnly
```
Stocke un cookie côté client. Moins courant dans les APIs modernes (préfère les tokens), mais toujours utilisé.

---

## REST : les conventions au-dessus de HTTP

HTTP fournit le **protocole**, REST fournit les **conventions d'usage**. REST = **Representational State Transfer**.

### Les principes REST

#### 1. Ressources, pas actions

❌ Mauvais (RPC style) :
```
GET /api/createUser
POST /api/deleteUser?id=42
GET /api/getUser?id=42
```

✅ Bon (REST style) :
```
POST /api/users
DELETE /api/users/42
GET /api/users/42
```

**Le principe** : tes données sont des **ressources** (users, posts, comments). Tu utilises les méthodes HTTP pour dire ce que tu en fais, pas le nom de la route.

#### 2. Représentations JSON (ou XML)

La ressource est envoyée en JSON (ou autre format). C'est pas du HTML, c'est des données pures.

```json
{
  "id": 42,
  "name": "Alice",
  "email": "alice@example.com",
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### 3. Codes HTTP pour la sémantique

| Opération | Méthode | Code de succès |
|-----------|---------|-----------------|
| Créer | POST | 201 |
| Lire | GET | 200 |
| Mettre à jour | PUT/PATCH | 200 |
| Supprimer | DELETE | 204 |

#### 4. Relations entre ressources

Les ressources sont liées par des URLs :

```
GET /api/users/42                    # L'user 42
GET /api/users/42/posts              # Les posts de l'user 42
GET /api/users/42/posts/5            # Le post 5 de l'user 42
POST /api/users/42/posts             # Créer un post pour l'user 42
```

**Avantage** : la structure d'URL raconte l'histoire. Plus besoin de documentation secrète.

---

## Idempotence : pourquoi c'est crucial en production

Une opération est **idempotente** si la refaire plusieurs fois donne le même résultat que de la faire une fois.

### Exemple concret

**GET** est idempotente :
```
GET /api/users/42  → {id: 42, name: "Alice"}
GET /api/users/42  → {id: 42, name: "Alice"}  (pareil)
```

**POST** n'est pas idempotente :
```
POST /api/users + body {name: "Bob"}  → crée user 43
POST /api/users + body {name: "Bob"}  → crée user 44  (doublon !)
```

### Pourquoi ça change tout en production

**Scénario** : un client envoie une requête POST pour créer un paiement de 100€. La requête arrive au serveur, se traite, mais la réponse ne revient jamais au client (timeout réseau). Le client retry. Deux paiements de 100€ ont lieu.

**Solution** : implémenter une **idempotency key**. Le client envoie un UUID unique :
```
POST /api/payments HTTP/1.1
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000

{
  "amount": 100,
  "currency": "EUR"
}
```

Le serveur **enregistre** cet ID. La deuxième fois que la même clé arrive, il ne refait rien, il retourne le même résultat. Problème résolu.

💡 **C'est essentiel pour les opérations sensibles** : paiements, création de commandes, réservations. Toujours implémenter une idempotency key côté serveur.

---

## Cycle complet : requête → réponse

Voici ce qui se passe réellement :

```mermaid
sequenceDiagram
    participant Client
    participant Serveur

    Client->>Serveur: GET /api/users/42<br/>+ Authorization header
    Note over Serveur: Valide token<br/>Cherche user 42<br/>Sérialise en JSON
    Serveur->>Client: 200 OK<br/>Content-Type: application/json<br/>{id: 42, name: "Alice"}

    Client->>Serveur: POST /api/users<br/>+ JSON body {name: "Bob"}
    Note over Serveur: Valide body<br/>Crée user en DB<br/>Génère ID 43
    Serveur->>Client: 201 Created<br/>Location: /api/users/43<br/>{id: 43, name: "Bob"}

    Client->>Serveur: DELETE /api/users/43
    Note over Serveur: Supprime user 43
    Serveur->>Client: 204 No Content

    Client->>Serveur: GET /api/users/43
    Note over Serveur: User n'existe plus
    Serveur->>Client: 404 Not Found<br/>{error: "User not found"}
```

---

## Bonnes pratiques

### Routes claires et prévisibles

```
GET    /api/users              # Lister tous les users
GET    /api/users?role=admin   # Lister avec filtre
GET    /api/users/42           # Un user spécifique
POST   /api/users              # Créer un user
PUT    /api/users/42           # Remplacer le user 42
PATCH  /api/users/42           # Modifier partiellement
DELETE /api/users/42           # Supprimer
```

Pas de `/api/getUserById?id=42`, pas de `/api/updateUser`, pas d'actions bizarres. La structure parle d'elle-même.

### Codes d'erreur clairs

Toujours retourner le bon code HTTP + un body détaillé :

```json
{
  "error": "validation_error",
  "message": "Email already exists",
  "details": {
    "field": "email",
    "reason": "duplicate"
  }
}
```

Ne retourne pas 200 avec un message d'erreur dedans. Les clients bots ne regardent que le code HTTP.

### Versioning d'API

Si tu dois changer ta structure (supprimer un champ, renommer un paramètre), fais une v2 :

```
GET /api/v1/users/42
GET /api/v2/users/42
```

Ça permet aux anciens clients de rester sur v1 pendant qu'on migre. Pain à la tête en production autrement.

### Pagination et limites

Pour les listes :

```
GET /api/users?limit=50&offset=0
GET /api/users?limit=50&page=1
```

Retourne aussi les métadonnées :

```json
{
  "data": [{...}, {...}],
  "total": 342,
  "page": 1,
  "limit": 50
}
```

### Documentation

Une API sans doc c'est un mur de briques. Utilise **OpenAPI/Swagger** ou au minimum un README clair :

```markdown
## GET /api/users/{id}

Récupère un user par ID.

**Parameters:**
- id (integer, required): User ID

**Response (200):**
{
  "id": 42,
  "name": "Alice",
  "email": "alice@example.com"
}

**Errors:**
- 404: User not found
- 401: Unauthorized
```

---

## Résumé et points de repère

| Concept | Rôle | Point clé |
|---------|------|-----------|
| **Méthode HTTP** | Exprime l'intention (GET=lire, POST=créer, etc.) | Chaque méthode a une sémantique précise ; pas de POST pour lire |
| **Code de statut** | Raconte ce qui s'est passé (200=OK, 404=pas trouvé, 500=erreur serveur) | Lire le code en premier ; c'est la "réponse courte" |
| **Header** | Métadonnées de requête/réponse (auth, type, cache) | Authorization et Content-Type sont obligatoires 95% du temps |
| **Idempotence** | GET/PUT/DELETE peuvent être retried sans risque ; POST non | Crucial pour les opérations critiques (paiements, etc.) |
| **Ressources REST** | Les données sont des ressources avec des URLs | `/api/users/42` pas `/api/getUser?id=42` |
| **JSON** | Format standard pour les APIs modernes | Remplace XML/SOAP pour 99% des cas nouveaux |

**À retenir absolument** :
- HTTP est le transport ; REST est la convention.
- Un code 4xx, c'est ta faute (mauvaise requête, pas authentifié, pas autorisé).
- Un code 5xx, c'est la faute du serveur.
- GET = sans danger, idempotent. POST = crée du nouveau, pas idempotent.
- Toujours retourner le bon code HTTP + body détaillé pour les erreurs.

---

## Cas réel en entreprise

**Scénario** : tu dois intégrer un service de facturation tiers. La doc dit :

> POST /api/invoices pour créer une facture

Ton app envoie :
```
POST /api/invoices
Authorization: Bearer token_xxx
Content-Type: application/json

{
  "client_id": 42,
  "amount": 1500
}
```

La réponse arrive : `201 Created` + une facture avec un ID. Parfait.

**Mais** : 3 jours plus tard, un user fait un double-clic par erreur. Deux requêtes exactement identiques arrivent en 10ms. Résultat : deux factures de 1500 pour le même client. Désastre comptable.

**La fix** :
1. Le service tiers implémente une `Idempotency-Key` header.
2. Ton app envoie un UUID unique :
```
POST /api/invoices
Authorization: Bearer token_xxx
Content-Type: application/json
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000

{
  "client_id": 42,
  "amount": 1500
}
```
3. Le service tiers enregistre : "clé 550e8400... → facture 999".
4. Si la même clé arrive 10 fois, il retourne la facture 999. Pas de doublon.

**Conclusion** : maîtriser HTTP & REST, c'est l'écart entre une intégration qui marche et une qui te coûte 5000€ en factures fantômes.

---

<!-- snippet
id: http_methodes_idempotence
type: concept
tech: http
level: beginner
importance: high
format: knowledge
tags: http,méthodes,idempotence,rest
title: Idempotence des méthodes HTTP et retries sécurisés
description: GET/PUT/DELETE retirables sans risque. POST crée du neuf → risque de doublons. PATCH dépend de l'implémentation. Crucial pour les opérations critiques.
content: GET, PUT, DELETE sont idempotentes : appeler 2 fois = même résultat. POST ne l'est pas : 2 POST créent 2 ressources. Conséquence : un client peut retry GET/PUT/DELETE sans risque en cas d'erreur réseau. Pour POST critique (paiements, commandes), implémenter une Idempotency-Key côté serveur pour détecter les doublons.
-->

<!-- snippet
id: http_codes_statut_4xx_5xx
type: concept
tech: http
level: beginner
importance: high
format: knowledge
tags: http,codes-statut,erreurs
title: Les codes HTTP : 4xx = client, 5xx = serveur
description: 4xx = ta requête est mal formée ou non autorisée. 5xx = bug serveur. Distinction critique pour diagnostiquer.
content: Code 4xx = erreur du client (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 429 Too Many Requests). Code 5xx = erreur serveur (500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable). En production, regarder le code en premier : tu sais tout de suite si c'est toi ou le serveur.
-->

<!-- snippet
id: http_401_vs_403
type: warning
tech: http
level: beginner
importance: high
format: knowledge
tags: http,authentification,autorisation
title: 401 vs 403 : différence capitale
description: 401 = pas authentifié (qui es-tu ?). 403 = authentifié mais pas autorisé (je te connais, mais non). Les confondre = débogue infini.
content: 401 Unauthorized = token absent, expiré ou invalide. Retour au login. 403 Forbidden = token valide, user authentifié, mais pas les droits pour cette action (exemple : user normal essaie de supprimer un autre user). Solution : vérifier le token en premier (401), puis les permissions (403).
-->

<!-- snippet
id: http_post_vs_put_vs_patch
type: concept
tech: http
level: beginner
importance: high
format: knowledge
tags: http,méthodes,rest,modification
title: POST créée, PUT remplace entièrement, PATCH modifie partiellement
description: POST = nouveau (201 Created). PUT = remplace tout (idempotent, dois envoyer tous les champs). PATCH = change certains champs (plus flexible, risqué en concurrence).
content: POST crée une ressource, retourne 201 + la ressource avec ID généré. Pas idempotente (2 POST = 2 ressources). PUT remplace la ressource entière par ce que tu envoies (idempotente). Dois envoyer TOUS les champs, sinon les autres se vident. PATCH modifie juste les champs dans le JSON envoyé, laisse les autres intacts. Pratique mais pas standardisé (dépend du serveur). Pour sécurité : PUT > PATCH.
-->

<!-- snippet
id: http_rest_ressources_urls
type: concept
tech: rest
level: beginner
importance: high
format: knowledge
tags: rest,ressources,architecture-api
title: REST : les URLs racontent l'histoire (ressources, pas actions)
description: Mauvais = /api/createUser, /api/deleteUser. Bon = POST /api/users, DELETE /api/users/42. La méthode HTTP dit l'action, l'URL dit la ressource.
content: En REST, les données sont des ressources identifiées par des URLs. GET /api/users/42/posts = les posts de l'user 42. POST /api/users = crée un user. DELETE /api/users/42 = supprime l'user 42. La structure d'URL reflète la hiérarchie métier. Pas d'actions dans l'URL (pas de /api/getUserById, /api/createUser). C'est la méthode HTTP qui dit l'action.
-->

<!-- snippet
id: http_headers_essentiels
type: tip
tech: http
level: beginner
importance: high
format: knowledge
tags: http,headers,authentification
title: Headers obligatoires : Authorization et Content-Type
description: Authorization = qui tu es (Bearer token). Content-Type = format du corps (application/json). À chaque requête pour une API. Sans ça = 401 ou 400.
content: Authorization: Bearer <TOKEN> transmet ton identité. Généralement JWT ou clé API. Content-Type: application/json dit au serveur le format du corps. Si tu oublies, il peut mal parser. Toujours les envoyer sur chaque requête. Côté serveur, vérifier Authorization en premier (401 si absent), puis parser Content-Type correctement (400 si format invalide).
-->

<!-- snippet
id: http_code_200_vs_201_vs_204
type: concept
tech: http
level: beginner
importance: medium
format: knowledge
tags: http,codes-statut
title: 200 OK, 201 Created, 204 No Content : quand les utiliser
description: 200 = succès standard (GET, PUT, PATCH). 201 = ressource créée (POST). 204 = succès sans corps (DELETE, PATCH sans réponse).
content: 200 OK = requête réussie, réponse contient des données. 201 Created = POST qui crée une ressource, retourne la ressource créée avec son ID généré. 204 No Content = succès mais pas de données à renvoyer (DELETE, ou PATCH qui s'en fiche). Choix du bon code aide les clients à interpréter automatiquement.
-->

<!-- snippet
id: http_rate_limit_headers
type: tip
tech: http
level: beginner
importance: medium
format: knowledge
tags: http,rate-limit,headers
title: Lire les headers X-RateLimit pour éviter le blocking
description: X-RateLimit-Remaining = requêtes restantes. X-RateLimit-Reset = quand la limite se réinitialise. À vérifier après chaque appel d'API.
content: Beaucoup d'APIs limitent le nombre de requêtes (ex: 1000/heure). Headers de réponse : X-RateLimit-Remaining: 999, X-RateLimit-Limit: 1000, X-RateLimit-Reset: 1640000000. Si Remaining atteint 0, tu es bloqué jusqu'à Reset. Toujours vérifier ces headers et implémenter une backoff strategy si Remaining < 10.
-->

<!-- snippet
id: http_requete_complete_exemple
type: tip
tech: http
level: beginner
importance: medium
format: knowledge
tags: http,requête,json
title: Construire une requête HTTP valide (exemple concret)
description: Méthode + URL + headers + body. Ordre : Authorization, Content-Type, puis JSON bien formé.
context: Pour créer un user via API
example: POST /api/users HTTP/1.1\nHost: api.example.com\nAuthorization: Bearer eyJhbGc...\nContent-Type: application/json\nContent-Length: 53\n\n{"name":"Alice","email":"alice@example.com"}
content: POST = méthode. /api/users = URL. Authorization = qui tu es. Content-Type = le corps est en JSON. Body = données JSON bien formatées (pas d'espaces extra, guillemets corrects). Content-Length = taille du body en octets (généralement auto-calculé par le client). Manquer un header = erreur courante.
-->

<!-- snippet
id: http_json_parsing_erreurs
type: warning
tech: http
level: beginner
importance: medium
format: knowledge
tags: http,json,validation
title: JSON malformé = 400 Bad Request immédiat
description: Guillemets manquants, virgules oubliées, accolades non équilibrées → serveur refuse. Tester le JSON avant d'envoyer.
content: Erreurs courantes : {"name": "Alice" sans fermeture. {"name": Alice} sans guillemets. {"name":"Alice",} virgule finale. Serveur rejette avec 400 Bad Request. Outil rapide : valider en ligne (jsonlint.com) ou utiliser un IDE avec validation JSON. Côté client, toujours encoder en JSON propre (ne pas concaténer de strings).
-->

<!-- snippet
id: http_idempotency_key_impl
type: tip
tech