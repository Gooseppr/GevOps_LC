---
layout: page
title: "HTTP & REST — Les fondations indispensables des API"

course: api-rest
chapter_title: "HTTP & REST (indispensable)"

chapter: 1
section: 2

tags: http, rest, api, méthodes http, codes de statut, idempotence, headers
difficulty: beginner
duration: 75
mermaid: true

icon: "🌐"
domain: fondations
domain_icon: "🟢"
status: "published"
---

# HTTP & REST — Les fondations indispensables des API

## Objectifs pédagogiques

À l'issue de ce module, tu seras capable de :

1. **Identifier** les méthodes HTTP appropriées selon l'opération à réaliser (lecture, création, modification, suppression)
2. **Interpréter** un code de statut HTTP et comprendre ce qu'il implique côté client ou serveur
3. **Expliquer** le principe d'idempotence et pourquoi il conditionne la sécurité de certaines opérations
4. **Utiliser** les headers essentiels (`Authorization`, `Content-Type`) dans une requête API
5. **Reconnaître** les erreurs d'utilisation HTTP les plus fréquentes en production

---

## Mise en situation

Tu intègres l'équipe backend d'une startup. En première semaine, tu récupères un rapport d'incident : l'application mobile envoie des requêtes `POST` pour récupérer une liste de produits. En cas de timeout, le client réessaie — et crée des doublons en base de données.

Deuxième incident dans le même rapport : l'API répond systématiquement `200 OK` même quand l'authentification échoue. Le frontend affiche "succès" alors que l'utilisateur n'est pas connecté.

Ces deux bugs ont la même origine : une mauvaise compréhension de HTTP. Ce module couvre exactement ce qu'il faut savoir pour ne pas reproduire ces erreurs.

---

## Contexte et problématique

### HTTP n'est pas qu'un "tuyau"

Quand on débute, on a tendance à voir HTTP comme un simple canal pour envoyer et recevoir des données. En réalité, HTTP est un **protocole avec une sémantique précise** — chaque méthode, chaque code de statut a un sens qui doit être respecté.

REST (Representational State Transfer) n'est pas un protocole en soi, c'est un **style architectural** qui exploite cette sémantique HTTP pour structurer des API cohérentes et prévisibles. Une API REST bien conçue est lisible par n'importe quel développeur sans documentation, parce qu'elle respecte des conventions universelles.

Le problème, c'est que HTTP est facile à utiliser incorrectement — rien ne t'empêche techniquement de retourner `200 OK` avec un message d'erreur dans le body. L'application fonctionnera. Jusqu'au jour où un client automatisé, un load balancer ou un système de monitoring se basera sur ces codes pour prendre des décisions.

---

## Modèle conceptuel — HTTP dans la pile réseau

HTTP opère au niveau de la **couche application** (couche 7 du modèle OSI). Il s'appuie sur TCP pour la fiabilité de transport, sans s'en préoccuper directement.

```mermaid
sequenceDiagram
    participant Client
    participant Serveur

    Client->>Serveur: TCP Handshake (SYN / SYN-ACK / ACK)
    Client->>Serveur: HTTP Request (méthode + path + headers + body)
    Serveur-->>Client: HTTP Response (status code + headers + body)
    Client->>Serveur: TCP FIN
```

Ce qui nous intéresse en pratique : **la requête HTTP et la réponse**. Tout le reste (TCP, TLS, DNS) est transparent pour le développeur d'API.

Une requête HTTP se décompose toujours en :

- **Ligne de requête** : `GET /api/users HTTP/1.1`
- **Headers** : métadonnées (authentification, format du body, etc.)
- **Body** (optionnel) : données envoyées (JSON, formulaire, fichier…)

Et une réponse :

- **Status line** : `HTTP/1.1 200 OK`
- **Headers** : métadonnées de la réponse
- **Body** : données retournées

---

## Les méthodes HTTP — choisir la bonne, pas celle qui "marche"

Chaque méthode a un **rôle sémantique** défini par la RFC 9110. En ignorer le sens, c'est comme utiliser un marteau comme tournevis — ça peut avancer, mais ça va casser quelque chose.

| Méthode | Signification | Usage typique | Body autorisé |
|---------|--------------|---------------|---------------|
| `GET` | Lire une ressource | Récupérer un utilisateur, une liste | ❌ |
| `POST` | Créer une ressource | Créer un compte, soumettre une commande | ✅ |
| `PUT` | Remplacer entièrement | Mettre à jour un profil complet | ✅ |
| `PATCH` | Modifier partiellement | Changer uniquement l'email | ✅ |
| `DELETE` | Supprimer | Supprimer un article | ❌ |

💡 **`PUT` vs `PATCH`** — La distinction est souvent ignorée en pratique, mais elle a un impact réel. `PUT` implique d'envoyer la **totalité** de la ressource. Si tu oublies un champ, il sera écrasé avec une valeur vide ou null. `PATCH` ne modifie que les champs envoyés. Pour une mise à jour partielle, utilise toujours `PATCH`.

⚠️ **Piège fréquent** : utiliser `POST` pour des opérations de lecture (ex: `POST /search` avec des filtres dans le body). C'est parfois justifié quand les paramètres sont trop complexes pour une query string, mais ça casse la sémantique REST et empêche la mise en cache. Préfère `GET /search?q=...` tant que possible.

---

## Idempotence — le concept qui change tout en production

L'idempotence, c'est la propriété d'une opération qui peut être **exécutée plusieurs fois avec le même résultat**. En termes réseau : si la requête est rejoué (timeout, retry automatique), est-ce que ça crée des effets de bord ?

🧠 **Concept fondamental** — Voici comment se comporte chaque méthode :

| Méthode | Idempotente | Explication |
|---------|-------------|-------------|
| `GET` | ✅ Oui | Lire 10 fois = même résultat, rien ne change |
| `PUT` | ✅ Oui | Remplacer 10 fois avec le même body = même état final |
| `DELETE` | ✅ Oui | Supprimer un objet déjà supprimé = toujours absent |
| `PATCH` | ⚠️ Dépend | Si `email=x@x.com` → oui. Si `increment_counter` → non |
| `POST` | ❌ Non | Créer 10 fois = 10 ressources créées |

Pourquoi c'est critique en production ? Les clients HTTP réessaient automatiquement en cas d'erreur réseau. Si ton endpoint `POST /orders` est appelé deux fois à cause d'un retry, tu crées deux commandes. C'est le bug de l'incident décrit en mise en situation.

La solution classique : utiliser un **idempotency key** — un identifiant unique envoyé par le client dans un header (`Idempotency-Key: <UUID>`), que le serveur mémorise pour dédupliquer les requêtes identiques.

---

## Codes de statut HTTP — parler le même langage

Les codes HTTP sont regroupés par famille. Comprendre la famille suffit souvent à interpréter le problème.

### Vue d'ensemble

```
1xx — Informationnel  (rare, HTTP/2 streams)
2xx — Succès
3xx — Redirection
4xx — Erreur côté CLIENT
5xx — Erreur côté SERVEUR
```

### Les codes que tu croiseras en production

**2xx — Tout s'est bien passé**

| Code | Nom | Quand l'utiliser |
|------|-----|-----------------|
| `200 OK` | Succès générique | GET, PUT, PATCH réussis |
| `201 Created` | Ressource créée | Après un POST qui crée une entité |
| `204 No Content` | Succès sans body | DELETE réussi, ou PATCH sans retour |

💡 Retourner `200` après un `POST` de création est techniquement valide mais incorrect sémantiquement. Utilise `201` et ajoute un header `Location: /api/users/42` qui pointe vers la ressource créée — c'est la convention REST.

**4xx — Le client a fait une erreur**

| Code | Nom | Signification concrète |
|------|-----|----------------------|
| `400 Bad Request` | Requête invalide | JSON malformé, champ obligatoire manquant |
| `401 Unauthorized` | Non authentifié | Token absent ou expiré |
| `403 Forbidden` | Non autorisé | Authentifié, mais pas les droits suffisants |
| `404 Not Found` | Ressource absente | L'ID n'existe pas |
| `422 Unprocessable Entity` | Validation échouée | Champs présents mais valeurs invalides |
| `429 Too Many Requests` | Rate limit atteint | Trop de requêtes en trop peu de temps |

⚠️ **`401` vs `403` — confusion classique** : `401` signifie "je ne sais pas qui tu es" (authentification manquante ou invalide). `403` signifie "je sais qui tu es, mais tu n'as pas le droit". Ce n'est pas interchangeable — un client qui reçoit `401` doit se reconnecter, pas demander des permissions.

**5xx — Le serveur a un problème**

| Code | Nom | Quand ça arrive |
|------|-----|-----------------|
| `500 Internal Server Error` | Crash non géré | Exception non catchée, bug applicatif |
| `502 Bad Gateway` | Proxy en échec | Le serveur upstream ne répond pas |
| `503 Service Unavailable` | Serveur indisponible | Maintenance, surcharge, circuit breaker ouvert |
| `504 Gateway Timeout` | Timeout upstream | Le backend a mis trop longtemps à répondre |

🧠 En production, `500` est souvent le signe d'un bug non anticipé. Un système robuste devrait retourner `422` ou `400` pour les erreurs prévisibles et réserver `500` aux vraies exceptions.

---

## Headers essentiels

Les headers sont les **métadonnées de la requête et de la réponse**. Deux catégories à connaître absolument.

### Headers de contenu

```http
Content-Type: application/json
Accept: application/json
```

`Content-Type` indique le format du body envoyé. `Accept` indique ce que le client peut recevoir. Si tu envoies du JSON sans `Content-Type: application/json`, certains serveurs refuseront la requête avec `415 Unsupported Media Type`.

### Headers d'authentification

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

C'est le format standard pour les tokens JWT (JSON Web Token). Le préfixe `Bearer` est une convention obligatoire — sans lui, de nombreux middlewares d'authentification ignorent le header.

Autres formats possibles selon l'API :

```http
Authorization: Basic dXNlcjpwYXNzd29yZA==   ← Base64(user:password)
X-API-Key: sk_live_abc123xyz                 ← Convention propre à l'API
```

💡 Les headers custom commencent souvent par `X-` par convention (ex: `X-Request-ID`, `X-Rate-Limit-Remaining`). Ce n'est pas obligatoire, mais ça signale clairement qu'il s'agit d'un header non standard.

---

## Fonctionnement détaillé — anatomie d'un échange complet

Regardons concrètement ce qui circule sur le réseau lors d'une création d'utilisateur :

**Requête cliente :**
```http
POST /api/users HTTP/1.1
Host: api.example.com
Content-Type: application/json
Authorization: Bearer eyJhbGci...
Content-Length: 58

{
  "email": "alice@example.com",
  "role": "editor"
}
```

**Réponse serveur (succès) :**
```http
HTTP/1.1 201 Created
Content-Type: application/json
Location: /api/users/42
X-Request-ID: 7f3a-bc12-...

{
  "id": 42,
  "email": "alice@example.com",
  "role": "editor",
  "created_at": "2024-01-15T14:32:00Z"
}
```

**Réponse serveur (erreur de validation) :**
```http
HTTP/1.1 422 Unprocessable Entity
Content-Type: application/json

{
  "error": "validation_failed",
  "details": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
```

Ce qu'on voit ici : le body d'erreur est structuré, pas juste une string. C'est une bonne pratique — le client peut traiter l'erreur programmatiquement sans parser du texte libre.

---

## Cas réel en entreprise

### Incident : les retries qui créent des doublons de paiement

Une fintech traite des paiements via une API externe. En cas de timeout réseau (>5s), leur SDK HTTP réessaie automatiquement 3 fois. Résultat : certains clients se voient débiter deux ou trois fois pour une seule commande.

**Diagnostic :**
- L'endpoint `POST /payments` n'est pas idempotent par design
- Le SDK est configuré avec retry automatique (comportement par défaut de nombreuses librairies)
- Aucun mécanisme de déduplication côté serveur

**Correction mise en place :**

Côté client, ajout d'un header idempotency key généré une fois par transaction :
```http
POST /payments HTTP/1.1
Idempotency-Key: pay_7f3abc12-d456-...
Content-Type: application/json

{ "amount": 4990, "currency": "EUR", "card_id": "card_xyz" }
```

Côté serveur, stockage en Redis de la clé pendant 24h avec le résultat associé. Si la même clé arrive une deuxième fois, le serveur retourne directement la réponse mise en cache sans retraiter le paiement.

Résultat : zéro doublon, retries transparents pour le client.

---

## Bonnes pratiques

**Utiliser les codes HTTP pour ce qu'ils sont : un contrat**

Ne retourne jamais `200 OK` avec `{ "success": false }` dans le body. Les proxies, les load balancers, les outils de monitoring — tout se base sur le status code pour prendre des décisions. Un `200` avec une erreur dans le body passe à travers tous les filtres.

**Structurer les erreurs de façon cohérente**

Adopte un format d'erreur uniforme dès le début du projet :
```json
{
  "error": "code_machine_lisible",
  "message": "Texte lisible par un humain",
  "details": []
}
```

**Ne pas exposer les détails internes dans les `500`**

Un `500` ne doit jamais retourner une stack trace ou un message de base de données en production. Ces informations sont précieuses pour un attaquant. Log-les côté serveur, retourne un message générique au client.

**Documenter l'idempotence de chaque endpoint**

Dans ta documentation (OpenAPI/Swagger), précise quels endpoints sont idempotents et lesquels nécessitent une idempotency key. Tes clients frontend et les intégrateurs extérieurs en ont besoin pour configurer correctement leurs retries.

**Valider le `Content-Type` côté serveur**

Rejette les requêtes sans `Content-Type: application/json` pour les endpoints qui attendent du JSON. Sinon tu te retrouves à parser des données dans un format inattendu, ce qui génère des `500` cryptiques.

---

## Résumé

| Concept | Rôle | Points clés |
|---------|------|-------------|
| Méthodes HTTP | Définir l'intention de l'opération | GET=lire, POST=créer, PUT=remplacer, PATCH=modifier, DELETE=supprimer |
| Codes de statut | Communiquer le résultat de façon standardisée | 2xx=succès, 4xx=erreur client, 5xx=erreur serveur |
| Idempotence | Garantir la sécurité des retries | GET/PUT/DELETE sont idempotents, POST ne l'est pas |
| Headers | Transporter les métadonnées | `Authorization` pour l'auth, `Content-Type` pour le format |
| Idempotency Key | Déduplication des requêtes rejouées | UUID généré côté client, mémorisé côté serveur |

HTTP et REST ne sont pas des détails techniques à apprendre "plus tard". Ce sont les fondations sur lesquelles repose la fiabilité, la maintenabilité et la sécurité de toute API en production. Le prochain module te montrera comment consommer concrètement ces API avec `curl` et Postman — maintenant que tu sais ce que tu lis dans les réponses.

---

<!-- snippet
id: http_methodes_choix
type: concept
tech: http
level: beginner
importance: high
format: knowledge
tags: http, methodes, rest, semantique
title: Quelle méthode HTTP utiliser selon l'opération
content: GET=lire (sans modifier), POST=créer (non idempotent), PUT=remplacer entièrement (idempotent), PATCH=modifier partiellement (souvent idempotent), DELETE=supprimer (idempotent). Choisir la mauvaise méthode casse la sémantique REST et fausse les retries automatiques des clients HTTP.
description: Chaque méthode a un rôle sémantique précis — les confondre entraîne des bugs de duplication ou des comportements imprévisibles lors des retries.
-->

<!-- snippet
id: http_idempotence_definition
type: concept
tech: http
level: beginner
importance: high
format: knowledge
tags: http, idempotence, retry, post
title: Idempotence HTTP — ce qui change avec les retries
content: Une opération est idempotente si l'appeler N fois produit le même résultat qu'une seule fois. GET, PUT, DELETE sont idempotents. POST ne l'est pas : un retry sur POST /orders crée plusieurs commandes. Les SDK HTTP retentent automatiquement sur timeout — d'où les bugs de duplication en production.
description: POST n'est pas idempotent : un retry automatique sur un endpoint de création génère des doublons. GET, PUT et DELETE sont sûrs à rejouer.
-->

<!-- snippet
id: http_401_vs_403
type: warning
tech: http
level: beginner
importance: high
format: knowledge
tags: http, codes, authentification, autorisation
title: 401 vs 403 — ne pas confondre authentification et autorisation
content: Piège : utiliser 401 et 403 de façon interchangeable. Conséquence : un client qui reçoit 401 va tenter de se reconnecter inutilement, ou pire, un 403 qui devrait déclencher une re-auth laisse l'utilisateur bloqué. Correction : 401 = "je ne sais pas qui tu es" (token absent ou expiré → se reconnecter), 403 = "je sais qui tu es, tu n'as pas les droits" (changer de compte ou demander des permissions).
description: 401 = non authentifié (se reconnecter), 403 = authentifié mais non autorisé (changer de rôle). Les confondre casse la logique de reconnexion côté client.
-->

<!-- snippet
id: http_200_erreur_antipattern
type: error
tech: http
level: beginner
importance: high
format: knowledge
tags: http, codes, erreur, monitoring
title: Retourner 200 OK avec une erreur dans le body
content: Symptôme : les monitoring tools, proxies et load balancers ne détectent aucune erreur alors que l'API échoue. Cause : l'API retourne 200 avec {"success": false} dans le body. Correction : utiliser le code HTTP approprié (400, 422, 500…) — les outils d'infrastructure se basent exclusivement sur le status code pour déclencher les alertes et les circuit breakers.
description: Un 200 avec erreur dans le body passe à travers tous les filtres automatiques. Le status code doit refléter le résultat réel de l'opération.
-->

<!-- snippet
id: http_header_content_type
type: tip
tech: http
level: beginner
importance: high
format: knowledge
tags: http, headers, json, content-type
title: Toujours envoyer Content-Type sur les requêtes avec body
content: Pour toute requête POST, PUT ou PATCH avec du JSON : ajouter "Content-Type: application/json". Sans ce header, certains serveurs retournent 415 Unsupported Media Type ou parsent le body incorrectement. Côté serveur, rejeter les requêtes sans Content-Type valide plutôt que tenter de deviner le format.
description: Sans Content-Type: application/json, de nombreux serveurs refusent ou mal-parsent le body — source fréquente de 400/415 inexpliqués.
-->

<!-- snippet
id: http_201_location_header
type: tip
tech: http
level: beginner
importance: medium
format: knowledge
tags: http, codes, rest, creation
title: POST de création → répondre 201 + header Location
content: Après un POST qui crée une ressource, répondre 201 Created (pas 200) et ajouter un header Location pointant vers la ressource créée : "Location: /api/users/42". Cela permet au client de récupérer la ressource sans connaître à l'avance son identifiant, et respecte la sémantique REST.
description: 201 + Location header est la convention REST pour signaler une création réussie et indiquer où trouver la ressource créée.
-->

<!-- snippet
id: http_idempotency_key
type: tip
tech: http
level: beginner
importance: high
format: knowledge
tags: http, idempotence, paiement, retry
title: Idempotency-Key pour sécuriser les POST critiques
content: Sur les POST non idempotents critiques (paiement, commande) : le client génère un UUID unique par tentative et l'envoie dans le header "Idempotency-Key: <UUID>". Le serveur stocke la clé (ex: Redis, TTL 24h) et retourne la réponse mise en cache si la clé est rejouée. Résultat : retries transparents, zéro doublon.
description: Pattern indispensable pour les endpoints de création critiques — génère un UUID côté client, mémorise le résultat côté serveur pour déduplication.
-->

<!-- snippet
id: http_500_no_stacktrace
type: warning
tech: http
level: beginner
importance: high
format: knowledge
tags: http, securite, erreur, production
title: Ne jamais exposer les détails internes dans un 500
content: Piège : retourner la stack trace ou le message SQL dans le body d'un 500. Conséquence : un attaquant obtient les chemins internes, noms de tables, versions de librairies — des informations exploitables. Correction : logger l'erreur complète côté serveur (avec un request-id), retourner uniquement {"error": "internal_server_error", "request_id": "..."} au client.
description: Une stack trace en réponse 500 révèle la structure interne du système. Logger côté serveur, retourner un message générique avec un ID de corrélation.
-->

<!-- snippet
id: http_codes_familles
type: concept
tech: http
level: beginner
importance: medium
format: knowledge
tags: http, codes, statut, familles
title: Les familles de codes HTTP et leur signification
content: 2xx = succès (200 OK, 201 Created, 204 No Content). 4xx = erreur du client (400 requête invalide, 401 non authentifié, 403 non autorisé, 404 absent, 422 validation échouée, 429 rate limit). 5xx = erreur serveur (500 crash, 502 gateway, 503 indisponible, 504 timeout upstream). La famille indique qui est responsable de l'erreur — 4xx = le client doit changer sa requête, 5xx = le serveur doit être réparé.
description: 4xx = erreur côté client (corriger la requête), 5xx = erreur côté serveur (intervention ops nécessaire). La famille conditionne la réponse opérationnelle.
-->

<!-- snippet
id: http_authorization_bearer
type: concept
tech: http
level: beginner
importance: medium
format: knowledge
tags: http, headers, authentification, jwt, bearer
title: Format du header Authorization avec un token JWT
content: Format standard : "Authorization: Bearer <TOKEN>". Le mot-clé "Bearer" est obligatoire — sans lui, la plupart des middlewares d'authentification ignorent le header et retournent 401. Le token JWT est une chaîne base64 en trois parties (header.payload.signature) qui encode l'identité et les droits de l'utilisateur sans requête base de données.
description: "Bearer" est un mot-clé obligatoire dans le header Authorization — son absence provoque un 401 même avec un token valide.
-->