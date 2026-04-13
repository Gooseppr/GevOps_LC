---
layout: page
title: "Structure d'une API REST"

course: api-rest
chapter_title: "HTTP & REST"

chapter: 2
section: 1

tags: rest, http, architecture, api, endpoints, ressources
difficulty: beginner
duration: 45
mermaid: true

icon: "🏗️"
domain: api
domain_icon: "🔌"
status: "published"
---

# Structure d'une API REST

## Objectifs pédagogiques

À l'issue de ce module, tu seras capable de :

- Identifier les composants structurels d'une API REST (ressources, endpoints, méthodes, réponses)
- Lire et interpréter une URL d'API pour comprendre ce qu'elle fait
- Associer une opération métier à la bonne combinaison méthode HTTP + URL
- Reconnaître un design REST cohérent et repérer les incohérences fréquentes
- Comprendre comment les couches d'une requête s'articulent de bout en bout

---

## Mise en situation

Tu rejoins une équipe qui expose une API pour gérer un catalogue de produits. Le jour J, tu dois intégrer cette API dans un service tiers. Tu reçois la "doc" — un fichier texte avec des URLs comme `/getProduct`, `/doCreateProduct`, `/updateProductById`, et quelques exemples de corps JSON copiés-collés.

Impossible de savoir sans lire chaque exemple : quelle méthode utiliser ? Qu'est-ce que l'API retourne en cas d'erreur ? Où passer les paramètres ?

C'est exactement le problème qu'un design REST bien structuré est censé éviter. Quand la structure est correcte, l'API *se lit* — tu devines ce que fait un endpoint avant même d'avoir la doc.

---

## Ce qu'est une API REST — et pourquoi cette structure existe

REST (Representational State Transfer) n'est pas un protocole. C'est un style architectural défini en 2000 par Roy Fielding dans sa thèse. L'idée centrale : utiliser HTTP tel qu'il a été conçu, plutôt que d'inventer une couche de protocole par-dessus.

Concrètement, ça veut dire :
- Les **ressources** sont des entités du domaine métier (un utilisateur, une commande, un produit)
- Chaque ressource est accessible via une **URL stable**
- Les **méthodes HTTP** indiquent ce qu'on fait à cette ressource (lire, créer, modifier, supprimer)
- L'**état** du système est entièrement dans les requêtes — le serveur ne mémorise pas la "session"

L'analogie qui aide : pense à une bibliothèque. Les livres sont les ressources. Leur cote (ex: `BIB-042`) est l'URL. Les actions possibles — emprunter, rendre, consulter — correspondent aux méthodes HTTP. La bibliothécaire ne se souvient pas de toi entre deux visites : tu te présentes à chaque fois avec ta carte.

Ce modèle devient puissant à l'échelle : n'importe quel client (mobile, navigateur, service tiers) comprend HTTP. Une API REST bien conçue est donc prédictible, interopérable, et cacheable — trois propriétés critiques en production.

---

## Anatomie d'une requête REST

Chaque échange avec une API REST se décompose en éléments précis. Voyons-les un par un, avec ce qu'ils signifient réellement.

### L'URL : l'identifiant de la ressource

```
https://api.example.com/v1/orders/42/items
```

| Partie | Valeur | Rôle |
|---|---|---|
| Schéma | `https` | Protocole de transport sécurisé |
| Hôte | `api.example.com` | Point d'entrée du service |
| Préfixe de version | `/v1` | Permet de faire évoluer l'API sans casser les clients |
| Ressource parente | `/orders` | Collection de toutes les commandes |
| Identifiant | `/42` | La commande spécifique n°42 |
| Sous-ressource | `/items` | Les articles appartenant à cette commande |

Cette URL dit exactement : *"les articles de la commande 42"*. Aucune ambiguïté. Pas besoin de doc pour deviner.

🧠 **Concept clé** — Une URL REST identifie une **ressource** (un nom), pas une **action** (un verbe). C'est la méthode HTTP qui porte l'action.

⚠️ **Erreur fréquente** — Inclure des verbes dans les URLs : `/getUser/5`, `/createProduct`, `/deleteOrder?id=3`. Ce design mélange deux responsabilités : l'identification et l'intention. Le résultat : une API impossible à prédire et difficile à documenter.

### La méthode HTTP : l'intention

La méthode exprime ce qu'on veut faire à la ressource. C'est le seul endroit où l'action est déclarée.

| Méthode | Sémantique | Idempotente ? | Corps ? |
|---|---|---|---|
| `GET` | Lire une ressource ou une collection | ✅ Oui | ❌ Non |
| `POST` | Créer une ressource (résultat non prédictible) | ❌ Non | ✅ Oui |
| `PUT` | Remplacer entièrement une ressource | ✅ Oui | ✅ Oui |
| `PATCH` | Modifier partiellement une ressource | ⚠️ Selon implémentation | ✅ Oui |
| `DELETE` | Supprimer une ressource | ✅ Oui | ❌ Généralement |

💡 **Astuce** — L'idempotence, c'est la garantie que répéter la même requête N fois produit le même effet qu'une seule fois. `DELETE /orders/42` appelé 5 fois : la commande est supprimée après le premier appel, les suivants renvoient 404 — mais l'état final est identique. C'est ce qui permet les retry automatiques sans risque.

### Les headers : les métadonnées de l'échange

Les headers ne font pas partie de la ressource — ils décrivent *comment* communiquer et *qui* communique.

```http
GET /v1/products/7 HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Accept: application/json
```

Les trois headers que tu verras partout :

- `Authorization` — qui fait la requête (token, clé API)
- `Content-Type` — format du corps envoyé (`application/json` presque toujours)
- `Accept` — format de réponse attendu (le client *négocie* le format)

### Le corps (body) : les données

Uniquement pour `POST`, `PUT`, `PATCH`. C'est là que passent les données à créer ou modifier.

```json
{
  "name": "Clavier mécanique",
  "price": 89.99,
  "stock": 120
}
```

Le format JSON est le standard de facto. Quelques règles de bon sens : pas d'ID dans le body lors d'une création (c'est le serveur qui le génère), pas de champs inutiles, structure cohérente avec la ressource.

---

## Le flux complet d'une requête à une réponse

Voici ce qui se passe entre le moment où tu envoies une requête et celui où tu reçois la réponse :

```mermaid
sequenceDiagram
    participant Client
    participant LB as Load Balancer
    participant API as API Server
    participant Auth as Auth Middleware
    participant DB as Base de données

    Client->>LB: POST /v1/orders (Bearer token)
    LB->>API: Transfert de la requête
    API->>Auth: Vérification du token
    Auth-->>API: Identité confirmée (user_id: 99)
    API->>DB: INSERT INTO orders ...
    DB-->>API: order_id: 1042
    API-->>Client: 201 Created { "id": 1042, "status": "pending" }
```

Ce qui est important ici : chaque couche a une responsabilité unique. Le middleware d'auth ne touche pas à la DB. L'API ne vérifie pas le token elle-même. Ce découplage est ce qui rend le système maintenable et testable.

---

## La réponse : code + corps + headers

Une réponse REST bien construite contient toujours trois choses utiles.

**Le code de statut** — l'information principale. Pas de 200 pour tout, c'est une erreur de débutant très répandue.

```
200 OK          → Lecture réussie
201 Created     → Ressource créée
204 No Content  → Action réussie, rien à retourner (ex: DELETE)
400 Bad Request → Le client a envoyé des données invalides
401 Unauthorized → Pas authentifié (pas de token valide)
403 Forbidden   → Authentifié, mais pas autorisé sur cette ressource
404 Not Found   → La ressource n'existe pas
409 Conflict    → État incohérent (ex: email déjà pris)
422 Unprocessable → Syntaxe valide mais données incohérentes métier
500 Internal Server Error → Bug côté serveur
```

🧠 **Concept clé** — Le code de statut est la première chose que le client lit. Un client bien écrit branche sa logique d'erreur dessus, avant même de parser le JSON. Retourner `200` avec `{"error": "not found"}` dans le body brise toute cette mécanique.

**Le corps de réponse** — la ressource créée, modifiée, ou un message d'erreur structuré :

```json
{
  "id": 1042,
  "status": "pending",
  "created_at": "2024-03-15T10:23:00Z",
  "items": []
}
```

Pour les erreurs, un format cohérent aide énormément côté client :

```json
{
  "error": "validation_failed",
  "message": "Le champ 'price' doit être positif",
  "field": "price"
}
```

**Les headers de réponse** — souvent sous-exploités mais précieux :

```
Content-Type: application/json
Location: /v1/orders/1042     ← après un 201, où trouver la ressource créée
X-RateLimit-Remaining: 47    ← quota restant
```

---

## Un exemple de bout en bout : gestion d'une commande

Voici comment une ressource "commande" se traduit en endpoints REST cohérents :

| Opération | Méthode | URL | Réponse attendue |
|---|---|---|---|
| Lister toutes les commandes | `GET` | `/v1/orders` | `200` + tableau |
| Créer une commande | `POST` | `/v1/orders` | `201` + ressource créée + header `Location` |
| Lire une commande | `GET` | `/v1/orders/42` | `200` + ressource ou `404` |
| Modifier le statut | `PATCH` | `/v1/orders/42` | `200` + ressource mise à jour |
| Remplacer entièrement | `PUT` | `/v1/orders/42` | `200` ou `204` |
| Supprimer | `DELETE` | `/v1/orders/42` | `204` |
| Lister les articles | `GET` | `/v1/orders/42/items` | `200` + tableau |

Cette symétrie est précieuse : une fois qu'on comprend la logique, on peut deviner les endpoints d'un domaine métier entier sans ouvrir la doc.

---

## Bonnes pratiques — et pièges à éviter

**Nommer les ressources au pluriel.** `/orders` pas `/order`. La collection et l'instance partagent la même racine, c'est plus prévisible.

**Versionner dès le début.** `/v1/...` dans le chemin est la méthode la plus simple et la plus lisible. Changer une API sans version, c'est casser silencieusement tous tes clients.

💡 **Astuce** — Pour les actions qui ne rentrent pas dans le modèle CRUD (ex: "annuler une commande", "envoyer un email"), deux approches propres : utiliser une sous-ressource (`POST /orders/42/cancellation`) ou un champ de statut via `PATCH` (`{"status": "cancelled"}`). Évite `/orders/42/cancel` — c'est un verbe dans une URL.

⚠️ **Erreur fréquente** — Utiliser `GET` pour des opérations qui modifient l'état. Ex: `/deleteUser?id=5` via GET. Les GET sont censés être sûrs et cacheables. Les proxies et CDN peuvent les rejouer. Une suppression via GET peut être déclenchée par un simple prefetch de navigateur.

⚠️ **Erreur fréquente** — Retourner toujours 200, même pour les erreurs. Le client ne peut pas distinguer un succès d'un échec sans parser le JSON et implémenter sa propre logique d'erreur. Le contrat HTTP est brisé.

**Filtrer et paginer via query params, pas dans le path :**

```
GET /v1/orders?status=pending&page=2&limit=20
```

Les query params sont faits pour filtrer, trier, paginer. Le path identifie la ressource.

**Documenter la structure des erreurs dès le premier jour.** Un format d'erreur incohérent est l'une des premières plaintes des intégrateurs. Définis-le une fois, applique-le partout.

---

## Résumé

Une API REST bien structurée s'appuie sur une idée simple : HTTP a déjà un vocabulaire — autant s'en servir. Les URLs identifient des ressources (des noms, jamais des verbes), les méthodes HTTP expriment les intentions, les codes de statut communiquent le résultat. Ensemble, ces trois éléments forment un contrat lisible, prédictible et interopérable.

Le gain concret : un développeur qui intègre ton API peut deviner une grande partie de son comportement avant même d'ouvrir la documentation. Et côté opérations, des codes HTTP corrects permettent aux proxies, load balancers et outils de monitoring de traiter les réponses intelligemment — retry sur 5xx, cache sur GET, alertes sur 4xx en volume anormal.

La suite logique : maintenant que la structure est claire, on va s'attaquer à ce que ça donne concrètement — consommer cette API avec curl et Postman, parser les réponses, gérer l'authentification.

---

<!-- snippet
id: rest_url_structure_ressource
type: concept
tech: rest
level: beginner
importance: high
format: knowledge
tags: rest, url, ressource, architecture, endpoint
title: Structure d'une URL REST — ressource + identifiant
content: Une URL REST identifie une ressource (nom), jamais une action. Structure type : `/v1/{collection}/{id}/{sous-ressource}`. Ex: `/v1/orders/42/items` = les articles de la commande 42. La méthode HTTP porte l'action — pas l'URL.
description: L'URL localise la ressource, la méthode HTTP exprime ce qu'on en fait — mélanger les deux (ex: /getUser) brise la prévisibilité de l'API.
-->

<!-- snippet
id: rest_methodes_idempotence
type: concept
tech: rest
level: beginner
importance: high
format: knowledge
tags: rest, http, idempotence, methodes, put, delete
title: Idempotence des méthodes HTTP en REST
content: GET, PUT, DELETE sont idempotentes : répéter N fois la requête produit le même état final qu'une seule fois. POST ne l'est pas : chaque appel crée une nouvelle ressource. L'idempotence permet les retry automatiques sans risque d'effet de bord.
description: Un client peut retry un DELETE ou un PUT sans vérifier le résultat précédent — c'est ce qui rend les retry safe en cas de timeout réseau.
-->

<!-- snippet
id: rest_verbes_url_antipattern
type: warning
tech: rest
level: beginner
importance: high
format: knowledge
tags: rest, url, antipattern, conception, verbe
title: Ne jamais mettre un verbe dans une URL REST
content: URLs comme /getUser/5, /createProduct, /deleteOrder?id=3 mélangent identification et intention. Conséquence : l'API devient imprévisible, les outils HTTP (cache, monitoring) ne peuvent pas interpréter les requêtes correctement. Correction : /users/5 (GET), /products (POST), /orders/3 (DELETE).
description: Piège → conséquence → correction : verbe dans URL → API imprévisible + cache cassé → utiliser méthode HTTP pour l'action, nom au pluriel pour la ressource.
-->

<!-- snippet
id: rest_codes_statut_200_tout
type: warning
tech: rest
level: beginner
importance: high
format: knowledge
tags: rest, http, statut, erreur, 200
title: Toujours retourner 200 même en erreur — anti-pattern critique
content: Retourner 200 avec {"error": "not found"} dans le body brise le contrat HTTP. Les proxies, CDN et clients bien écrits branchent leur logique sur le code de statut avant de parser le JSON. Conséquence : retry inattendus, cache poisoning, alertes monitoring silencieuses. Utiliser 404, 400, 409, 422 selon la cause réelle.
description: Symptôme : monitoring ne voit pas les erreurs. Cause : tout retourne 200. Correction : mapper chaque cas d'erreur au code HTTP sémantiquement correct.
-->

<!-- snippet
id: rest_codes_statut_reference
type: concept
tech: rest
level: beginner
importance: high
format: knowledge
tags: rest, http, statut, 201, 204, 404, 422
title: Codes de statut REST essentiels et leur usage précis
content: 200 OK (lecture), 201 Created (création + header Location), 204 No Content (DELETE/action sans retour), 400 Bad Request (données malformées), 401 Unauthorized (pas de token valide), 403 Forbidden (token valide, accès refusé), 404 Not Found, 409 Conflict (email déjà pris), 422 Unprocessable (syntaxe OK, logique métier invalide), 500 Internal Server Error.
description: Le client lit le code de statut en premier — un code correct permet de router les erreurs sans parser le body, et au monitoring de détecter les anomalies automatiquement.
-->

<!-- snippet
id: rest_post_put_patch_difference
type: concept
tech: rest
level: beginner
importance: medium
format: knowledge
tags: rest, post, put, patch, methodes, crud
title: POST vs PUT vs PATCH — quelle différence concrète
content: POST crée une ressource, l'ID est généré par le serveur → non idempotent. PUT remplace entièrement une ressource existante (tous les champs requis) → idempotent. PATCH modifie partiellement (seuls les champs envoyés sont mis à jour) → idempotent selon l'implémentation. Exemple : PATCH /orders/42 avec {"status":"cancelled"} ne touche qu'au statut.
description: PUT nécessite d'envoyer la ressource complète — oublier un champ peut l'effacer. PATCH est plus souple mais demande une implémentation explicite côté serveur.
-->

<!-- snippet
id: rest_actions_non_crud
type: tip
tech: rest
level: beginner
importance: medium
format: knowledge
tags: rest, conception, action, sous-ressource, patch
title: Modéliser les actions métier qui ne sont pas du CRUD
content: Pour "annuler une commande" ou "envoyer un email" : option 1 → sous-ressource POST /orders/42/cancellation (crée un événement). Option 2 → PATCH /orders/42 avec {"status":"cancelled"}. Éviter /orders/42/cancel (verbe dans URL). Préférer l'option 2 si le statut est une propriété de la ressource, l'option 1 si l'action est un événement métier distinct.
description: Règle pratique : si l'action change un attribut de la ressource → PATCH. Si c'est un événement avec sa propre logique → sous-ressource POST.
-->

<!-- snippet
id: rest_versioning_url
type: tip
tech: rest
level: beginner
importance: medium
format: knowledge
tags: rest, versioning, url, v1, api
title: Versionner une API REST dès le premier endpoint
content: Préfixer toutes les routes avec /v1/ dès le départ : /v1/orders, /v1/products. Quand une breaking change est nécessaire, déployer /v2/ en parallèle sans casser /v1/. Alternative via header (Accept: application/vnd.api+json;version=2) — plus propre mais plus complexe à implémenter et moins lisible dans les logs.
description: Ne pas versionner dès le début = casser les clients existants à chaque évolution d'API. Ajouter /v1/ rétroactivement est possible mais douloureux.
-->

<!-- snippet
id: rest_query_params_filtrage
type: tip
tech: rest
level: beginner
importance: medium
format: knowledge
tags: rest, url, query, pagination, filtre
title: Filtrer et paginer via query params — pas dans le path
content: Correct : GET /v1/orders?status=pending&page=2&limit=20. Incorrect : GET /v1/orders/pending/page/2. Les query params sont faits pour affiner une collection, pas pour identifier une ressource. Paramètres courants : page, limit (ou per_page), sort, order, filter[champ].
description: Le path identifie la ressource. Les query params la filtrent, trient ou paginent — les mélanger rend l'API impossible à documenter et à cacher.
-->