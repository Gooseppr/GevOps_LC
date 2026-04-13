```yaml
---
layout: page
title: "Design avancé d'API — Architecture et patterns structurants"

course: "API REST"
chapter_title: "Design avancé"

chapter: 3
section: 1

tags: "api,architecture,design,patterns,versioning,scalability"
difficulty: advanced
duration: 120
mermaid: true

icon: "🏗️"
domain: "Backend & Architecture"
domain_icon: "⚙️"
status: "published"
---

## Objectifs pédagogiques

À la fin de ce module, vous serez capable de :

1. **Concevoir une API scalable** — structurer les ressources, les endpoints et les payloads pour supporter la croissance sans refonte majeure
2. **Choisir une stratégie de versioning** adaptée aux contraintes de production et aux impacts clients
3. **Appliquer des patterns d'architecture** (HATEOAS, pagination, filtering) pour fluidifier l'intégration côté client
4. **Identifier et éviter les anti-patterns** courants en production (over-fetching, instabilité du contrat, breakage silencieux)
5. **Documenter une API** de manière qu'elle soit auto-explicite et maintenable

---

## Mise en situation

Vous avez déployé une première version d'une API publique. Au bout de 6 mois :

- Les clients commencent à demander des champs supplémentaires dans les réponses
- Vous découvrez que vous devez ajouter une nouvelle ressource, mais les URLs existantes ne la reflètent pas logiquement
- Un changement en apparence mineur (ajouter un champ, supprimer un champ optionnel) casse 3 clients qui le ne testaient pas
- Vos endpoints GET retournent 10 champs alors que 80% des clients n'en utilisent que 2
- Vous avez 2 versions d'API en production et le coût de maintenance explose

Le problème n'est pas technique — c'est architectural. Vous avez construit sans anticiper les décisions qui importent vraiment en production : versioning, évolution du contrat, scalabilité, discoverabilité.

Ce module vous montre comment construire une API qui **vieillit bien**.

---

## Résumé

Une API bien conçue n'est pas une que l'on construit — c'est une qu'on fait évoluer sans régressions. Les décisions architecturales (structure des ressources, stratégie de versioning, contrats d'évolution) déterminent si vous pourrez ajouter une fonctionnalité en 1 jour ou si vous déchaînerez une refonte de 3 semaines. Ce module couvre les patterns et les principes qui permettent une API de rester opérationnelle et extensible à travers des années et des centaines de clients.

---

## 1. Structure logique des ressources : au-delà du CRUD basique

Votre première API ressemble souvent à ça :

```
GET    /users/{id}
POST   /users
PUT    /users/{id}
DELETE /users/{id}
```

C'est fonctionnel, mais dès que la métier se complexifie, vous manquez d'une grille de lecture cohérente. Voici comment penser structurellement.

### Principes de base

Une API REST organise les **ressources** — pas les actions. Si vous pensez en verbes (créer, valider, annuler), vous construisez une RPC déguisée, pas une API REST.

**Ressource** = entité métier avec identité, propriétés, relations. Exemples :
- User, Product, Order, Invoice, Subscription

**État d'une ressource** = propriétés qui décrivent son état courant. Exemples :
- Un Order peut être `pending`, `confirmed`, `shipped`, `delivered`
- Un Invoice peut être `draft`, `sent`, `paid`, `overdue`

**Transitions entre états** = réalisées par **mutation de la ressource elle-même**, pas création de sous-ressources parallèles.

❌ Mauvais design (penser en actions) :

```
POST /orders/{id}/validate       → état validé
POST /orders/{id}/cancel         → état annulé
GET  /orders/{id}/shipments      → liste des livraisons
POST /orders/{id}/shipments      → créer une livraison
```

C'est un API de commandes, pas une API de ressources.

✅ Bon design (penser en ressources) :

```
GET    /orders/{id}                        → état courant
PUT    /orders/{id}                        → mettre à jour l'état
GET    /orders/{id}/shipments              → ressources enfants
POST   /orders/{id}/shipments              → créer une ressource enfant
PUT    /shipments/{shipment_id}            → mettre à jour un shipment
```

Ici, on raisonne en **ressources imbriquées** : un Order contient des Shipments. Les transitions d'état se font par PUT (mutation directe), pas par routes d'action.

### Imbrication et relations

Quand une ressource B appartient logiquement à A et n'a pas de sens en dehors de ce contexte, **imbriquez-la** :

```
GET  /users/{user_id}/invoices          → factures de cet utilisateur
GET  /users/{user_id}/invoices/{id}     → une facture spécifique
POST /users/{user_id}/invoices          → créer une facture pour cet user
```

Quand B a une identité métier autonome (peut exister sans le contexte de A), **exposez-la au top level** :

```
GET  /products              → liste de tous les produits
GET  /products/{id}         → produit spécifique
GET  /orders/{id}           → une commande
GET  /orders/{id}/items     → articles DE cette commande (relation logique)
```

💡 Astuce — Quand douter ?

Posez-vous : "Mon client peut-il vouloir accéder à cette ressource sans connaître la ressource parent ?" 

- Oui → top level (`/products`, `/categories`)
- Non → imbriquée (`/orders/{id}/items`, `/users/{id}/preferences`)

### Exemple : boutique en ligne

Architecturons une API d'e-commerce.

**Ressources métier** : Product, Category, Order, OrderItem, User, Review, Inventory

**Structure logique** :

```
GET    /categories                  # lister les catégories
GET    /categories/{id}             # détails d'une catégorie
GET    /categories/{id}/products    # produits DE cette catégorie

GET    /products                    # lister tous les produits
GET    /products/{id}               # détails d'un produit
GET    /products/{id}/reviews       # avis pour ce produit
POST   /products/{id}/reviews       # poster un avis

GET    /users/{id}                  # profil utilisateur
GET    /users/{id}/orders           # commandes de cet utilisateur
POST   /users/{id}/orders           # placer une commande
GET    /users/{id}/orders/{oid}     # détails d'une commande
PUT    /users/{id}/orders/{oid}     # mettre à jour (ex: adresse avant envoi)

GET    /orders/{id}/items           # articles DE cette commande
PUT    /orders/{id}/items/{iid}     # modifier la quantité
DELETE /orders/{id}/items/{iid}     # retirer un article
```

Notez :
- Les **actions cachées** deviennent des changements d'état (PUT)
- Les **ressources autonomes** sont au top level (products)
- Les **ressources dépendantes** sont imbriquées (reviews d'un produit, items d'une commande)
- L'**URL encode la relation logique** — `/orders/{id}/items` dit clairement qu'on accède aux items D'une commande, pas à tous les items du système

⚠️ Erreur fréquente — URL dupliquées

```
GET /users/{id}/orders/{oid}    # accéder via l'user
GET /orders/{oid}               # accéder directement
```

À moins que ce ne soit intentionnel (deux contextes vraiment différents), maintenez **une seule URL canonique** par ressource. Si Order peut exister seul ET en tant que sous-ressource d'User, choisissez une voie :

- **Option 1 (simple)** : `/orders/{oid}` uniquement. L'user fait `GET /orders?user_id=123`
- **Option 2 (contextuelle)** : `/users/{id}/orders/{oid}` uniquement. Impose au client de connaître l'user (pertinent si l'accès dépend de la relation)

Le choix dépend de votre modèle de permissions et de votre cas d'usage. Mais ne doublez pas les URLs — cela fragmente votre API et rend la documentation confuse.

---

## 2. Versioning : choisir une stratégie pérenne

Vous ajoutez un champ à une réponse. Catastrophe : 3 clients qui parsaient le JSON avec une regex cassée plantent. Vous retirez un champ optionnel inutilisé. Silence, puis : "Pourquoi ma clé n'existe plus ?" Les 2 clients qui la testaient avec `if "field" in response` plantent discrètement en production.

Le versioning d'API n'est **pas une option** en production. C'est une **stratégie de survie**.

### Les approches

#### 1. URL versioning (`/v1/`, `/v2/`)

```
GET /v1/users/{id}     → réponse ancien format
GET /v2/users/{id}     → réponse nouveau format
```

**Avantages** :
- Évident pour le client (l'URL dit la version)
- Cache HTTP cohérent (2 URLs = 2 caches distincts)
- Dépannage facile en logs (on voit immédiatement la version)

**Inconvénients** :
- Duplication de code (deux versions complètes de chaque endpoint)
- Difficile de retirer une version — les clients l'oublient
- Versioning global (un changement quelque part = nouvelle version partout)

#### 2. Header versioning (`Accept-Version`, `API-Version`)

```
GET /users/{id}
    Accept-Version: 1
    
GET /users/{id}
    Accept-Version: 2
```

**Avantages** :
- Une seule URL = un seul endpoint à maintenir
- Versioning plus fin (une ressource peut être v2, une autre v1)
- Cache HTTP plus simple (même URL)

**Inconvénients** :
- Moins évident : le client oublie d'envoyer le header
- Debugging plus difficile (faut regarder les headers, pas l'URL)
- Tooling non standard (tous les clients doivent supporter ça)

#### 3. Content negotiation (`application/vnd.company.v2+json`)

```
GET /users/{id}
    Accept: application/vnd.company.v2+json
```

**Avantages** :
- Très REST-ish (suit la spécification)
- Peut coexister avec plusieurs formats (XML, JSON, etc.)

**Inconvénients** :
- Complexe à implémenter
- Clients et tooling standards ne le supportent pas bien
- Peu d'adoption dans la pratique

#### 4. Pas de versioning (évolution compatible)

```
GET /users/{id}     → répond toujours avec le schéma actuel
```

Vous ne versionnez **que si** vous pouvez ajouter des champs sans casser le contrat existant.

**Avantages** :
- Zéro overhead de maintenance
- Une seule URL = logique simple

**Inconvénients** :
- Vous êtes coincé : impossible de retirer un champ ou de changer son type
- Accumulation de débris schéma au fil des ans

**Possible si** :
- Vous contrôlez tous les clients (API interne)
- Vous pouvez vous permettre d'ajouter des champs sans jamais les retirer
- Votre schéma est vraiment stable

### Recommandation : hybride URL + évolution compatible

**En pratique, ce qui marche** :

```
GET /v1/users/{id}     → stable, on n'y touche plus après un délai
GET /v2/users/{id}     → nouveau schéma, en production
```

Règles :
1. Une nouvelle version = quand vous changez le **type** d'un champ ou le **supprimez**
2. Ajouter un champ optionnel = **jamais une nouvelle version** — c'est compatible
3. Une version existe au minimum **2-3 ans** avant dépréciation (donnez du temps aux clients)
4. Lors d'une dépréciation, communiquez **6 mois à l'avance**, fournissez un **client de migration**

Exemple de dépréciément :

```
GET /v1/users/{id}
    Deprecation: true
    Sunset: Wed, 21 Dec 2025 00:00:00 GMT
    Link: <https://docs.company.com/v1-sunset>; rel="deprecation"
```

Headers standard [RFC 8594](https://tools.ietf.org/html/rfc8594) : donnent au client 6 mois pour migrer, avec une date précise.

### Gestion du schéma : pensez avant de coder

Avant d'ajouter un champ à votre modèle, posez-vous :

1. **Ce champ évoluera-t-il ?** (type, format, valeurs possibles)
   - Non → c'est safe, ajoutez-le
   - Oui → réfléchissez à le versionner d'emblée

2. **Ce champ sera-t-il toujours présent ?**
   - Non → mettez-le optionnel, expliquez sa condition d'apparition
   - Oui → obligatoire, mais documenter clairement

3. **Les clients vont-ils faire des suppositions sur sa présence ?**
   - Oui (probable) → présent dans le schéma publié, condition explicite si optionnel
   - Non → silence documenté (endpoint non publié, champ interne)

---

## 3. Contrats, évolution et backward compatibility

Un contrat d'API, c'est une **promesse** : "Si tu m'envoies ça, je te rends ça, avec tel comportement." Casser ce contrat = casser les clients silencieusement.

### Règles d'or

**Request contract (ce que le client envoie)** :

| Changement | Impact | Exemple |
|---|---|---|
| Ajouter un champ optionnel | Aucun (client l'ignore) | POST /orders → ajouter `gift_message` optionnel |
| Retirer un champ optionnel | ⚠️ Moyen (si le client le bâtit en POST) | Danger : clients qui font `POST /users {name, legacy_field}` avec ce champ |
| Rendre un champ optionnel obligatoire | 🔴 Casse (certains clients l'oubliaient) | Danger : `currency` optionnel → obligatoire dans v2 |
| Changer le type d'un champ | 🔴 Casse | Danger : `price` string → number |

**Response contract (ce que vous renvoyez)** :

| Changement | Impact | Exemple |
|---|---|---|
| Ajouter un champ | ✅ Safe (client l'ignore) | GET /orders/{id} → ajouter `tracking_number` |
| Retirer un champ | 🔴 Casse (client qui vérifie `if field in response` explose) | Danger : supprimer `deprecated_field` sans version |
| Changer le type d'un champ | 🔴 Casse | Danger : `total` number → string (même chose en texte) |
| Changer le format (JSON object vs array, etc.) | 🔴 Casse | Danger : `items: {...}` → `items: [...]` |
| Changer les valeurs d'une enum | ⚠️ Moyen si vous ajoutez | Safe : ajouter une nouvelle valeur enum → client ignore ou utilise défaut. Danger : supprimer une valeur |

### Pattern : versionner les ressources, pas l'API

Au lieu de créer `/v2/users`, `/v2/orders`, `/v2/products` (lourd), versionner au **niveau de la ressource** :

```
GET /users/v1/{id}           # user en version v1
GET /users/v2/{id}           # user en version v2
GET /orders/v1/{id}          # order toujours en v1
GET /products/{id}           # product sans version (compatible)
```

Cela permet une **transition progressive** : les clients migrent ressource par ressource, pas tout d'un coup.

Moins courant mais pragmatique en production.

### Exemple : migration d'un champ

**État initial (v1)** :

```json
{
  "id": 123,
  "name": "Alice",
  "created_at": "2020-01-15T10:30:00Z"  ← type string
}
```

**Besoin** : `created_at` devrait être un timestamp Unix pour faciliter les calculs côté client.

**Changement naïf (casse)** :

```json
{
  "id": 123,
  "name": "Alice",
  "created_at": 1579612200  ← type number (brise les clients)
}
```

**Approche compatible** :

```json
{
  "id": 123,
  "name": "Alice",
  "created_at": "2020-01-15T10:30:00Z",       ← conservé pour compatibilité
  "created_at_unix": 1579612200              ← nouveau champ
}
```

Puis, dans la **v2 de la ressource** (6 mois après), retirer `created_at` :

```json
{
  "id": 123,
  "name": "Alice",
  "created_at_unix": 1579612200  ← seul format à partir de v2
}
```

Les clients ont eu 6 mois pour basculer sur `created_at_unix`. Les clients de v2 ne voient que le nouveau format.

### Documenter les contrats explicitement

Votre documentation (OpenAPI / Swagger) doit dire **quand chaque champ a été ajouté et quand il sera retiré** :

```yaml
User:
  type: object
  properties:
    id:
      type: integer
    name:
      type: string
    email:
      type: string
      x-since: v1.0
    phone:
      type: string
      x-since: v2.1
      x-deprecated: false
    legacy_field:
      type: string
      x-since: v1.0
      x-deprecated: true
      x-sunset-date: "2025-12-31"
      description: |
        Deprecated since v2.0. Use `new_field` instead.
        Will be removed on 2025-12-31.
```

Extensions `x-*` OpenAPI : permet au client de parser automatiquement les dépréciations et de se préparer.

---

## 4. Pagination, filtering, sorting : scalabilité côté requête

Vous avez une table avec 10 millions de produits. Un client fait `GET /products`. Vous lui renvoyez les 10 millions en JSON. Serveur crash. Base de données crash. Client crash.

La **pagination** n'est pas une optimisation — c'est une **structure fondamentale**.

### Pagination : trois approches

#### 1. Limit / Offset (classique)

```
GET /products?limit=20&offset=40    → items 40-60
GET /products?limit=20&offset=60    → items 60-80
```

**Avantages** :
- Intuitif (client connaît l'offset exact)
- Cache-friendly (chaque offset = URL distincte)

**Inconvénients** :
- Slow si offset est grand (DB doit scroller 1 million de rows pour en retourner 20)
- Incohérence si les données changent entre requêtes (ajouter/supprimer pendant que le client page)

#### 2. Cursor-based (moderne, recommandé)

```
GET /products?limit=20                          → 20 premiers
GET /products?limit=20&after=abc123             → 20 suivants (curseur "abc123")
GET /products?limit=20&after=def456             → 20 suivants (curseur "def456")
```

Le **curseur** = pointeur opaque dans la liste. Généralement : ID du dernier item + direction.

**Avantages** :
- Très rapide même sur des milliards de rows
- Cohérent (curseur "fige" la position, même si les données changent)
- Pagination bidirectionnelle facile (`after`, `before`)

**Inconvénients** :
- Client ne connaît pas le nombre total (pas de "page 3 sur 50")
- Curseur opaque = client ne peut pas deviner le format

#### 3. Keyset pagination (optimisé pour les listes triées)

```
GET /products?limit=20                               → 20 premiers
GET /products?limit=20&after_id=123&after_name=abc  → suivants
```

Cursor = valeur(s) de la clé de tri du dernier item reçu.

**Avantages** :
- Super rapide (utilise directement l'index de la DB)
- Deterministe

**Inconvénients** :
- Dépend étroitement du tri et de la clé
- Moins intuitif

### Recommandation

**Défaut** : Cursor-based. C'est le standard de facto (GitHub, Stripe, Slack l'utilisent).

```json
GET /products?limit=20

{
  "data": [
    {"id": 1, "name": "Product A"},
    ...
    {"id": 20, "name": "Product T"}
  ],
  "pagination": {
    "limit": 20,
    "has_next": true,
    "after": "eyJpZCI6IDIwfQ=="  ← curseur = base64({"id": 20})
  }
}
```

Client pagine avec :

```
GET /products?limit=20&after=eyJpZCI6IDIwfQ==
```

Implémentation serveur :

```python
# Décoder le curseur
cursor = json.loads(base64.b64decode(after))
last_id = cursor["id"]

# Chercher les items APRÈS cet ID
items = db.products.find({"id": {"$gt": last_id}}).limit(limit + 1)

# Vérifier s'il y a une page suivante
has_next = len(items) > limit
items = items[:limit]

# Encoder le curseur pour le prochain appel
next_cursor = json.dumps({"id": items[-1]["id"]})
```

### Filtering

Permettre au client de **réduire** la requête plutôt que de la paginer entièrement.

```
GET /products?category=electronics&price_min=50&price_max=500&in_stock=true
```

**Règles** :

| Cas | Pattern | Exemple |
|---|---|---|
| Égalité simple | `?field=value` | `?category=electronics` |
| Plusieurs valeurs | `?field=val1&field=val2` | `?tag=python&tag=api` |
| Range | `?field_min=x&field_max=y` | `?price_min=10&price_max=100` |
| Comparaison | `?field__operator=value` | `?price__gte=50` (greater than or equal) |
| Full-text search | `?q=searchterm` | `?q=wireless+headphones` |

Documentez clairement les filtres supportés et leurs valeurs :

```
GET /products
  ?category={electronics|clothing|books}
  &in_stock={true|false}
  &price_min={number}
  &price_max={number}
```

**Limitation importante** : n'exposez pas tous les champs en filtre. Filtrer sur des champs non-indexés = slow queries. Maintenez une **liste blanche** de filtres autorisés.

### Sorting

```
GET /products?sort=name,-price,created_at
```

Conventions :
- `-field` = descending
- `field` = ascending
- Plusieurs champs séparés par `,`

**Limitation** : permettre le tri seulement sur des champs non-coûteux. Trier sur `description` (texte long) à travers 10M de rows = disaster. Limite à 1-2 champs de tri à la fois.

### Limitation : combinez pagination + filtering + sorting

Attention aux **footguns** :

```
GET /products?sort=price&limit=20&offset=100
```

Quand l'utilisateur ajoute un filtre :

```
GET /products?sort=price&limit=20&offset=100&category=electronics
```

Les items aux positions 100-120 **changent** (il y a moins de produits dans "electronics"). Le client pagine à côté.

**Solution** : utilisez cursor-based avec filtering/sorting. Le curseur encode la position *dans la liste filtrée/triée*, pas dans la liste globale.

```python
# Pseudo-code
items = db.products.find(filters).sort(sort_order).skip_to_cursor(cursor).limit(limit)
```

---

## 5. HATEOAS et hypermedia : API auto-explicite

REST purist parle de **HATEOAS** (Hypermedia As The Engine Of Application State). En pratique, c'est souvent ignoré. Voici pourquoi c'est utile et comment le faire sans overdose.

### Idée centrale

Au lieu de donner au client uniquement des données, donnez-lui **les actions possibles et comment les faire** :

```json
GET /orders/123

{
  "id": 123,
  "status": "pending",
  "total": 150.00,
  "user_id": 456,
  "_links": {
    "self": {"href": "/orders/123"},
    "cancel": {"href": "/orders/123", "method": "DELETE"},
    "update_address": {"href": "/orders/123", "method": "PATCH"},
    "user": {"href": "/users/456"}
  }
}
```

Client lit `_links` et sait exactement comment annuler, modifier, accéder à l'user — sans connaissance préalable de l'API.

### Cas d'usage réel : transitions d'état

Quand une ressource a un **cycle de vie** (Order : pending → confirmed → shipped → delivered), HATEOAS élimine les erreurs de client :

```json
GET /orders/123
{
  "id": 123,
  "status": "pending",
  "_links": {
    "confirm": {"href": "/orders/123", "method": "POST", "body": {"status": "confirmed"}},
    "cancel": {"href": "/orders/123", "method": "DELETE"}
  }
}
```

Client en attente ne voit pas les actions invalides (ex : "ship", "deliver"). Si vous ajoutez un état intermédiaire (ex : "payment_pending"), les vieux clients marchent toujours — ils voient les actions applicables.

### Implémentation légère (réaliste)

HATEOAS complet = lourd et peu adopté. **Compromis pragmatique** :

1. Ajouter `_links` **seulement pour les transitions d'état critiques** ou les **relations clés**
2. Documenter les liens en OpenAPI
3. Ne pas encoder la **sémantique du domaine** dans les URLs (ex : pas de `/orders/123/confirm-payment` — utiliser `/orders/123` avec `PUT {status: "payment_confirmed"}`)

Exemple minimal :

```json
{
  "id": 123,
  "name": "Product X",
  "category_id": 5,
  "_links": {
    "self": {"href": "/products/123"},
    "category": {"href": "/categories/5"}
  }
}
```

Cela aide le client à **suivre les relations sans parsage d'URL**. C'est la partie la plus utile de HATEOAS sans la complexité.

### Template de réponse typique (pattern moderne)

```json
{
  "data": {
    "id": 123,
    "status": "pending",
    ...
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "v2"
  },
  "links": {
    "self": {"href": "/orders/123"}
  }
}
```

Structure claire : données, métadonnées, liens.

---

## 6. Gestion des erreurs : messages utiles en production

Une API qui dit `{"error": "bad request"}` est inutile. Comment déboguer ? Quoi corriger ?

### Structure d'erreur standard

```json
{
  "error": {
    "code": "INVALID_PAYMENT_METHOD",
    "message": "Payment method 'amex' is not supported for this region",
    "status": 400,
    "details": {
      "field": "payment_method",
      "supported_values": ["visa", "mastercard"]
    },
    "trace_id": "req_abc123xyz"
  }
}
```

**Champs obligatoires** :

| Champ | Rôle |
|---|---|
| `code` | Code machine (ex: `INVALID_PAYMENT_METHOD`). Client peut décider l'action basée dessus. |
| `message` | Message humain court (~1 phrase). Ne pas dire "error occurred" — être spécifique. |
| `status` | Code HTTP (200, 400, 500) — redondance utile pour les clients qui parsent JSON en premier. |
| `trace_id` | ID unique pour cette erreur. Logs côté serveur include le même ID → client peut dire "Erreur sur req_abc123xyz" et vous cherchez vos logs. |

**Champs optionnels mais utiles** :

| Champ | Quand |
|---|---|
| `details` | Contexte supplémentaire : valeurs acceptées, règles violées, etc. |
| `timestamp` | Quand l'erreur s'est produite (utile si le client rejoue après délai) |
| `documentation_url` | URL vers la doc du problème |

### Codes d'erreur : énumération ou libre ?

**Option 1 : Codes énumérés**

```json
{
  "code": "INVALID_PAYMENT_METHOD",
  "code_enum": 4001
}
```

Client peut faire `switch(error.code)` ou `switch(error.code_enum)`.

**Option 2 : Hiérarchie de codes**

```json
{
  "