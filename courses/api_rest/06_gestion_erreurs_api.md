---
layout: page
title: "Gestion des erreurs API"

course: api-rest
chapter_title: "Fondations"

chapter: 1
section: 5

tags: api, rest, erreurs, http, debug, codes-statut
difficulty: beginner
duration: 45
mermaid: false

icon: "🚨"
domain: api-rest
domain_icon: "🔌"
status: "published"
---

# Gestion des erreurs API

## Objectifs pédagogiques

À la fin de ce module, vous serez capable de :

1. **Lire et interpréter** un code de statut HTTP pour diagnostiquer une erreur côté client ou serveur
2. **Identifier la cause probable** d'une erreur à partir du corps de réponse et des headers
3. **Distinguer** une erreur temporaire (réessayable) d'une erreur permanente (qui nécessite une correction)
4. **Corriger** les erreurs les plus fréquentes rencontrées lors de la consommation d'une API
5. **Structurer** une stratégie de debug efficace face à une API qui ne répond pas comme attendu

---

## Mise en situation

Vous intégrez une API de paiement tierce dans votre backend. Le commercial vous a passé une clé API et une URL. Vous lancez votre premier appel… et vous obtenez une réponse `422 Unprocessable Entity` avec un body JSON que vous ne comprenez pas.

Votre manager veut une démo dans 2 heures.

C'est exactement ce genre de situation que ce module vous prépare à résoudre calmement — pas en tâtonnant, mais avec une méthode.

---

## Pourquoi les erreurs API méritent leur propre chapitre

Quand on débute avec les API, on se concentre sur le "happy path" : construire la requête, envoyer, récupérer la réponse `200 OK`, traiter les données. C'est naturel.

Mais en production, tout le reste du temps, les API échouent — par votre faute, par celle du serveur, ou à cause du réseau. Et si vous ne savez pas lire une erreur, vous allez passer des heures à chercher dans la mauvaise direction.

La bonne nouvelle : HTTP a été conçu avec un système de codes d'erreur standardisé. Une fois que vous savez le lire, vous pouvez diagnostiquer 80 % des problèmes en moins d'une minute.

---

## Le système de codes HTTP : une boussole, pas un détail

Les codes de statut HTTP sont organisés en familles. Chaque famille dit quelque chose d'essentiel sur **qui** est responsable du problème.

| Famille | Plage | Signification |
|---------|-------|---------------|
| **2xx** | 200–299 | Succès — tout s'est passé comme prévu |
| **3xx** | 300–399 | Redirection — la ressource a bougé |
| **4xx** | 400–499 | Erreur client — **vous** avez envoyé quelque chose de mauvais |
| **5xx** | 500–599 | Erreur serveur — **l'API** a un problème |

🧠 **Concept clé** : La distinction 4xx / 5xx est fondamentale. Une erreur `4xx` signifie que réessayer la même requête sans la modifier ne servira à rien. Une erreur `5xx` peut au contraire se résoudre toute seule — le serveur a peut-être crashé temporairement.

---

## Les codes que vous allez rencontrer tous les jours

### 400 — Bad Request

La requête est malformée. Le serveur l'a reçue, mais n'a pas pu l'interpréter.

Causes les plus courantes :
- JSON invalide (virgule oubliée, accolade non fermée)
- Champ obligatoire absent dans le body
- Type de données incorrect (vous envoyez une string là où un entier est attendu)

```bash
# Exemple : body JSON invalide
curl -X POST https://api.exemple.com/orders \
  -H "Content-Type: application/json" \
  -d '{"product_id": 42, "quantity": }' # ← JSON cassé : valeur manquante

# Réponse probable
# HTTP/1.1 400 Bad Request
# {"error": "Invalid JSON body", "detail": "Unexpected token at position 34"}
```

💡 Avant d'accuser l'API, validez votre JSON avec un outil en ligne ou `python -m json.tool`. C'est la première chose à faire.

---

### 401 — Unauthorized

Vous n'avez pas fourni d'authentification, ou elle est invalide.

```bash
# Sans token
curl https://api.exemple.com/users/me
# → 401 Unauthorized

# Avec token Bearer
curl https://api.exemple.com/users/me \
  -H "Authorization: Bearer <VOTRE_TOKEN>"
# → 200 OK
```

⚠️ **Erreur fréquente** : envoyer le token dans le mauvais header (`Token` au lieu de `Bearer`, ou oublier le préfixe `Bearer`). Lisez toujours la doc de l'API concernée — certaines utilisent `X-API-Key` ou un header custom.

---

### 403 — Forbidden

Vous êtes bien authentifié, mais vous n'avez pas le droit d'accéder à cette ressource.

La nuance avec le `401` : ici, le serveur vous connaît — il refuse quand même. C'est une question de **permissions**, pas d'identité.

```bash
# Vous êtes connecté mais vous tentez d'accéder aux données d'un autre utilisateur
curl https://api.exemple.com/users/9999/orders \
  -H "Authorization: Bearer <TOKEN_USER_1>"
# → 403 Forbidden : user 1 ne peut pas voir les commandes de user 9999
```

🧠 Si vous recevez un `403` sur une endpoint qui fonctionnait avant, vérifiez si votre token a expiré et a été renouvelé avec un scope différent, ou si des permissions ont changé côté serveur.

---

### 404 — Not Found

La ressource demandée n'existe pas. Simple en apparence, mais les causes varient :

- L'URL est mal construite (faute de frappe, ID incorrect)
- La ressource a été supprimée
- L'API versionne ses endpoints et vous utilisez l'ancienne version (`/v1/` vs `/v2/`)

```bash
curl https://api.exemple.com/products/99999
# → 404 Not Found : le produit 99999 n'existe pas

# À vérifier systématiquement :
# 1. L'URL de base est-elle la bonne ?
# 2. L'ID vient d'où ? Est-il valide ?
# 3. Suis-je sur le bon environnement (prod vs staging) ?
```

---

### 422 — Unprocessable Entity

Le JSON est syntaxiquement valide, mais la logique métier est violée. C'est un `400` plus précis.

```json
POST /orders
{
  "product_id": 42,
  "quantity": -5
}

// Réponse 422 :
{
  "error": "Validation failed",
  "fields": {
    "quantity": "must be greater than 0"
  }
}
```

💡 Le `422` est votre meilleur ami quand l'API est bien faite : il vous dit exactement quel champ pose problème. Lisez le body de la réponse attentivement — la réponse est souvent là.

---

### 429 — Too Many Requests

Vous avez dépassé la limite de requêtes autorisées (rate limiting). L'API vous bloque temporairement.

```bash
# Réponse typique avec header de délai
HTTP/1.1 429 Too Many Requests
Retry-After: 60
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1718000000

{"error": "Rate limit exceeded. Retry after 60 seconds."}
```

🧠 Regardez toujours les headers `X-RateLimit-*` dans les réponses réussies — avant d'atteindre la limite. C'est comme surveiller votre jauge d'essence plutôt que de tomber en panne sèche.

---

### 500 — Internal Server Error

Le serveur a planté. Ce n'est pas votre faute — mais ça peut aussi cacher un bug déclenché par votre requête.

```bash
# Si vous recevez un 500 de façon reproductible sur une requête spécifique :
# 1. Notez exactement le body que vous avez envoyé
# 2. Contactez le support de l'API avec les détails
# 3. L'API peut avoir un bug déclenché par un cas limite que vous testez
```

⚠️ Ne jamais ignorer un `500`. Si c'est intermittent : réessayez avec un backoff exponentiel. Si c'est systématique sur une requête précise : signalez-le.

---

### 503 — Service Unavailable

L'API est temporairement hors service (maintenance, surcharge). Contrairement au `500`, c'est souvent planifié ou annoncé.

```bash
HTTP/1.1 503 Service Unavailable
Retry-After: 300
{"error": "Maintenance in progress. Back in 5 minutes."}
```

---

## Lire le body d'erreur : où est la vraie information

Le code HTTP vous dit la famille du problème. Mais le corps de la réponse contient souvent l'explication précise. Les APIs bien conçues renvoient un JSON structuré avec des détails actionnables.

Voici un pattern courant que vous verrez dans de nombreuses APIs :

```json
{
  "error": "validation_error",
  "message": "The request body is invalid",
  "details": [
    {
      "field": "email",
      "issue": "must be a valid email address",
      "received": "john.doe@"
    },
    {
      "field": "age",
      "issue": "must be an integer",
      "received": "vingt"
    }
  ],
  "request_id": "req_8f3k2j1m"
}
```

🧠 Le champ `request_id` (ou `trace_id`, `correlation_id` selon les APIs) est précieux : il vous permet de contacter le support en leur donnant un identifiant qui pointe directement vers votre requête dans leurs logs.

---

## Une méthode de diagnostic en 5 étapes

Face à une erreur inconnue, suivez cette séquence plutôt que de modifier des choses au hasard.

**1. Lisez le code HTTP.** Il vous dit immédiatement si c'est votre faute (4xx) ou celle du serveur (5xx).

**2. Lisez le body de la réponse en entier.** Pas juste le premier champ — tout le JSON. Les détails sont souvent dans un sous-objet `details` ou `errors`.

**3. Vérifiez les headers de la requête.** `Content-Type: application/json` est-il bien présent ? Le token d'authentification est-il correct et non expiré ?

**4. Testez la même requête dans Postman ou avec `curl` brut.** Si ça fonctionne là mais pas dans votre code, le problème est dans votre code — pas dans l'API.

**5. Consultez la documentation de l'API.** Cherchez le code reçu dans la section "Errors" ou "Status codes" de la doc. Beaucoup d'APIs documentent leurs erreurs métier spécifiques.

---

## Cas d'utilisation concrets

### Cas 1 — Intégration d'une API de paiement

Vous envoyez une requête de création de paiement et recevez un `400` :

```bash
curl -X POST https://api.paiement.com/charges \
  -H "Authorization: Bearer sk_test_..." \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "currency": "EUR",
    "card_number": "4242424242424242"
  }'

# Réponse :
# HTTP 400
# {"error": "invalid_parameter", "message": "card_number is not accepted directly. Use a token."}
```

Le body vous dit tout : cette API n'accepte pas les numéros de carte bruts, elle attend un token généré côté front. Aucune quantité de débogage réseau n'aurait révélé ça aussi vite que lire le message d'erreur.

---

### Cas 2 — Appels en boucle qui déclenchent un 429

Vous synchronisez des données et votre script boucle sur des milliers d'appels :

```python
import time
import requests

def get_user(user_id, token):
    response = requests.get(
        f"https://api.exemple.com/users/{user_id}",
        headers={"Authorization": f"Bearer {token}"}
    )

    # Gestion du rate limiting
    if response.status_code == 429:
        retry_after = int(response.headers.get("Retry-After", 60))
        print(f"Rate limit atteint. Attente de {retry_after} secondes...")
        time.sleep(retry_after)          # on attend ce que le serveur demande
        return get_user(user_id, token)  # on réessaie

    response.raise_for_status()          # lève une exception pour tout autre 4xx/5xx
    return response.json()
```

💡 `raise_for_status()` est votre filet de sécurité : il transforme automatiquement n'importe quel code d'erreur HTTP en exception Python, vous évitant de checker manuellement chaque statut.

---

### Cas 3 — Debug d'un 500 intermittent

Vous avez un appel qui fonctionne 9 fois sur 10 et plante la dixième avec un `500`. La démarche :

```bash
# Loggez systématiquement les requêtes ET les réponses, avec timestamp
curl -v -X POST https://api.exemple.com/process \
  -H "Content-Type: application/json" \
  -d @payload.json 2>&1 | tee debug_$(date +%s).log

# Le flag -v affiche les headers envoyés ET reçus
# tee sauvegarde dans un fichier horodaté
# @payload.json charge le body depuis un fichier (reproductibilité)
```

Avec des logs comme ça, vous pouvez comparer les appels réussis et échoués, et isoler ce qui diffère.

---

## Erreurs fréquentes

**Symptôme** : vous recevez un `401` même avec un token valide  
**Cause** : le préfixe `Bearer` est absent, ou le header s'appelle `Token` dans votre code au lieu de `Authorization`  
**Correction** : vérifiez le header exact avec `curl -v` ou dans l'onglet "Headers" de Postman. Comparez lettre par lettre avec la doc.

---

**Symptôme** : `415 Unsupported Media Type`  
**Cause** : vous oubliez le header `Content-Type: application/json` sur une requête POST/PUT  
**Correction** : ajoutez `-H "Content-Type: application/json"` à chaque requête avec un body JSON

---

**Symptôme** : vous recevez `200 OK` mais vos données n'ont pas changé  
**Cause** : vous utilisez GET au lieu de POST ou PUT, ou votre body est envoyé en query string au lieu du body  
**Correction** : `curl -v` pour voir exactement ce qui part — vérifiez la méthode HTTP et que le body n'est pas vide

---

**Symptôme** : `404` sur une URL que vous êtes sûr d'avoir copiée depuis la doc  
**Cause** : vous êtes sur l'environnement de staging mais votre base URL pointe vers la prod (ou l'inverse)  
**Correction** : affichez l'URL complète construite par votre code avant de l'envoyer — comparez avec la doc

---

## Bonnes pratiques

**Loggez toujours le statut HTTP et le body d'erreur.** Pas juste "la requête a échoué". Une ligne de log comme `POST /orders → 422: quantity must be > 0` vaut dix fois un stacktrace sans contexte.

**Ne swallowez pas les erreurs silencieusement.** Un `try/except` qui catch tout et continue sans logguer est l'ennemi numéro un du debugging en production.

**Distinguez les erreurs réessayables des erreurs permanentes dans votre code.** Les `5xx` et les `429` méritent un retry avec backoff. Les `4xx` (sauf `429`) ne se résolvent pas tout seuls — réessayer ne fait que polluer les logs.

**Exposez le `request_id` dans vos logs.** Quand vous appelez le support d'une API tierce, cet identifiant leur permet de retrouver votre requête en quelques secondes dans leurs systèmes.

---

## Résumé

| Code | Famille | Qui est responsable | Réessayable ? |
|------|---------|-------------------|---------------|
| 400 | Client | Vous — requête malformée | Non |
| 401 | Client | Vous — auth manquante ou invalide | Non (corrigez d'abord) |
| 403 | Client | Vous — permissions insuffisantes | Non |
| 404 | Client | Vous — mauvaise URL ou ressource inexistante | Non |
| 422 | Client | Vous — logique métier violée | Non |
| 429 | Client | Vous — trop de requêtes | Oui (après délai) |
| 500 | Serveur | L'API | Oui (avec backoff) |
| 503 | Serveur | L'API | Oui (après délai annoncé) |

La règle d'or : **lisez le body d'erreur avant de toucher quoi que ce soit**. 80 % des erreurs API se diagnostiquent en 60 secondes quand on sait où chercher. Les 20 % restants nécessitent des logs et de la reproductibilité — pas de la chance.

---

<!-- snippet
id: api_erreurs_4xx_vs_5xx
type: concept
tech: api
level: beginner
importance: high
format: knowledge
tags: http, erreurs, debug, codes-statut, rest
title: 4xx vs 5xx — qui est responsable de l'erreur
content: 4xx = erreur côté client : réessayer la même requête sans la modifier ne servira à rien. 5xx = erreur côté serveur : la requête peut être bonne, le serveur a un problème temporaire. Ce distinguo détermine votre stratégie : corriger vs réessayer.
description: La famille du code HTTP dit immédiatement si c'est votre requête ou le serveur qui pose problème — essentiel pour choisir la bonne action.
-->

<!-- snippet
id: api_erreurs_401_vs_403
type: concept
tech: api
level: beginner
importance: high
format: knowledge
tags: http, auth, permissions, 401, 403
title: 401 vs 403 — authentification vs autorisation
content: 401 = le serveur ne vous connaît pas (token absent, expiré ou invalide). 403 = le serveur vous connaît mais vous interdit l'accès (scope insuffisant, ressource appartenant à un autre user). Même traitement côté code, causes radicalement différentes.
description: Confondre les deux fait perdre du temps : un 401 se corrige avec le token, un 403 nécessite de vérifier les permissions ou le scope du token.
-->

<!-- snippet
id: api_erreurs_422_body
type: tip
tech: api
level: beginner
importance: high
format: knowledge
tags: http, 422, validation, debug, json
title: 422 — lire le champ details du body d'erreur
content: Sur un 422, le body contient presque toujours le nom du champ invalide et la règle violée. Ex : {"fields": {"quantity": "must be > 0"}}. Lisez-le avant de chercher ailleurs — c'est la réponse directe à votre erreur.
description: Le 422 est l'erreur la plus informative : le serveur valide votre logique métier et détaille exactement ce qui cloche dans le body de réponse.
-->

<!-- snippet
id: api_erreurs_429_retry_after
type: tip
tech: api
level: beginner
importance: high
format: knowledge
tags: http, 429, rate-limit, retry, headers
title: 429 — lire le header Retry-After avant de réessayer
content: Sur un 429, le header Retry-After indique combien de secondes attendre. En Python : retry_after = int(response.headers.get("Retry-After", 60)) puis time.sleep(retry_after). Réessayer sans attendre déclenche d'autres 429 et peut faire bannir votre IP.
description: Le header Retry-After donne le délai exact à respecter — l'ignorer aggrave la situation en continuant à consommer le quota bloqué.
-->

<!-- snippet
id: api_erreurs_raise_for_status
type: tip
tech: python
level: beginner
importance: high
format: knowledge
tags: python, requests, http, erreurs, exception
title: raise_for_status() — transformer les erreurs HTTP en exceptions
content: Après chaque appel requests, ajoutez response.raise_for_status(). Cette méthode lève automatiquement une HTTPError pour tout code 4xx ou 5xx. Sans elle, requests retourne silencieusement la réponse même en cas d'erreur — et vous traitez des données vides sans vous en rendre compte.
description: Sans raise_for_status(), un 404 ou 500 est retourné sans exception — votre code continue à tourner sur une réponse d'erreur sans le savoir.
-->

<!-- snippet
id: api_erreurs_curl_verbose
type: command
tech: curl
level: beginner
importance: medium
format: knowledge
tags: curl, debug, headers, http, diagnostic
title: curl -v — inspecter headers envoyés et reçus
command: curl -v -X <METHODE> <URL> -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '<BODY>'
example: curl -v -X POST https://api.exemple.com/orders -H "Authorization: Bearer sk_test_abc123" -H "Content-Type: application/json" -d '{"product_id": 42, "quantity": 2}'
description: Le flag -v affiche les headers de la requête envoyée ET de la réponse reçue — indispensable pour vérifier que Content-Type et Authorization partent correctement.
-->

<!-- snippet
id: api_erreurs_request_id
type: tip
tech: api
level: beginner
importance: medium
format: knowledge
tags: api, debug, logs, support, tracing
title: Logguer le request_id pour le support API
content: La plupart des APIs renvoient un champ request_id (ou trace_id, correlation_id) dans le body d'erreur. Loggez-le systématiquement. Quand vous contactez le support, ce seul identifiant leur permet de retrouver votre requête dans leurs logs en quelques secondes.
description: Sans le request_id, le support ne peut pas isoler votre requête parmi des millions — avec lui, le diagnostic prend 30 secondes au lieu de plusieurs échanges.
-->

<!-- snippet
id: api_erreurs_swallow_silencieux
type: warning
tech: api
level: beginner
importance: high
format: knowledge
tags: erreurs, debug, logs, exception, production
title: Ne jamais ignorer silencieusement une erreur API
content: Piège : try/except qui catch tout sans logger → conséquence : les erreurs passent inaperçues en prod, les données ne se mettent pas à jour, aucune alerte. Correction : loggez toujours le statut HTTP + le body d'erreur, même si vous continuez l'exécution. Une ligne minimum : logger.error(f"{method} {url} → {status}: {body}").
description: Un except silencieux est le bug le plus difficile à diagnostiquer en production — l'erreur disparaît mais le système est dans un état incohérent.
-->

<!-- snippet
id: api_erreurs_4xx_no_retry
type: warning
tech: api
level: beginner
importance: high
format: knowledge
tags: erreurs, retry, 4xx, production, logique
title: Ne pas réessayer les erreurs 4xx (sauf 429)
content: Piège : implémenter un retry générique sur toutes les erreurs → conséquence : un 400 ou 422 est rejoué en boucle, pollue les logs et ne se corrige jamais seul. Correction : retry uniquement sur 429 (avec Retry-After) et 5xx (avec backoff exponentiel). Les 4xx permanents nécessitent une correction du code ou des données.
description: Réessayer un 4xx est inutile par définition : la requête est mauvaise, pas le serveur — la même requête produira toujours la même erreur.
-->