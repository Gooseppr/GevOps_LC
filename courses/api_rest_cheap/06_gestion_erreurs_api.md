```yaml
---
layout: page
title: "Gestion des erreurs API"

course: "API REST"
chapter_title: "Gestion des erreurs API"

chapter: 1
section: 4

tags: "erreurs,codes-http,diagnostic,api-rest,bonnes-pratiques"
difficulty: "beginner"
duration: 45
mermaid: false

icon: "⚠️"
domain: "API REST"
domain_icon: "🔌"
status: "published"
---

## Objectifs pédagogiques

À la fin de ce module, vous serez capable de :

- **Interpréter** les codes de statut HTTP pour diagnostiquer ce qui s'est réellement passé côté serveur
- **Concevoir** des messages d'erreur API clairs et exploitables par un client (frontend ou autre système)
- **Déboguer** rapidement une intégration API en lisant les réponses d'erreur
- **Implémenter** une gestion d'erreur cohérente dans votre API (format unifié, codes explicites)
- **Distinguer** les erreurs client (4xx) des erreurs serveur (5xx) et réagir en conséquence

---

## Mise en situation

Vous développez un backend pour une application mobile. Un développeur frontend signale : *"L'app crash quand on crée un utilisateur. Je reçois une erreur 500."*

Vous avez besoin de savoir rapidement :
- Est-ce vraiment une erreur serveur, ou le client envoie-t-il des données malformées ?
- Quel est le problème exact : base de données indisponible, validation échouée, timeout ?
- Faut-il que le frontend réessaie, ou que l'utilisateur change son saisie ?

**Sans une gestion d'erreur API structurée, vous perdez 30 minutes à demander des logs.** Avec elle, le message d'erreur vous dit tout.

---

## Contexte : pourquoi les erreurs API sont mal gérées

Une API, c'est un *contrat* entre deux systèmes qui ne se parlent pas directement. Quand quelque chose échoue, le serveur ne peut pas afficher un message d'erreur à l'écran ou relancer du code interactif. Il doit **encoder l'erreur** dans la réponse HTTP pour que le client la comprenne et réagisse.

Le problème : beaucoup d'APIs renvoient un code 200 avec un message d'erreur dans le body, ou un code 500 pour une validation invalide. Le client ne sait pas comment interpréter ça, et vous êtes bloqué pour déboguer.

Une bonne gestion d'erreur API, c'est :
- **Utiliser les bons codes HTTP** : 400 pour "données invalides", 401 pour "authentification manquante", 500 pour "je ne sais pas ce qu'il s'est passé"
- **Répondre toujours dans le même format** : pas de HTML quand on attend du JSON
- **Inclure des détails exploitables** : pas juste "erreur", mais *quel* champ est invalide et pourquoi
- **Logger côté serveur** pour tracer les vrais bugs

---

## Les codes HTTP : une hiérarchie qui fait sens

HTTP définit des *classes* d'erreur. Comprendre cette hiérarchie change tout.

### Les codes 2xx : succès

**200 OK** — La requête a réussi, réponse dans le body.  
Exemple : `GET /users/42` → retourne l'utilisateur en JSON.

**201 Created** — La ressource a été créée avec succès.  
Exemple : `POST /users` avec un nouvel utilisateur → retourne l'utilisateur créé (avec son ID généré).

**204 No Content** — Succès, mais pas de body à retourner.  
Exemple : `DELETE /users/42` → suppression confirmée, aucune donnée à renvoyer.

💡 **Astuce** : Utilisez 201 au lieu de 200 pour les créations (`POST`). Ça permet aux clients de savoir "ah, la ressource est maintenant créée" sans parser le body.

### Les codes 4xx : erreurs client

L'**utilisateur** ou le **client** a fait quelque chose de mal. Le serveur ne peut rien y faire.

**400 Bad Request** — La requête est malformée ou les données sont invalides.  
Exemples :
- JSON malformé : `{"name": }` (pas de valeur)
- Validation échouée : email fourni ne correspond pas à un format valide
- Champ obligatoire manquant

**401 Unauthorized** — Authentication manquante ou invalide.  
Exemples :
- Token JWT expiré ou absent
- Pas de header `Authorization` fourni
- Mot de passe incorrect

💡 **Distinction clé** : 401 = "qui es-tu ?", 403 = "je sais qui tu es, mais tu n'as pas le droit".

**403 Forbidden** — L'utilisateur est authentifié, mais n'a pas les permissions.  
Exemples :
- Utilisateur A essaye de voir les données de l'utilisateur B
- Un utilisateur classique essaye d'accéder à un endpoint admin

**404 Not Found** — La ressource n'existe pas.  
Exemples :
- `GET /users/999` alors que l'utilisateur 999 n'existe pas
- `DELETE /posts/invalid-id` où l'ID n'existe pas

**409 Conflict** — Conflit lors de la modification.  
Exemples :
- Créer un utilisateur avec un email qui existe déjà
- Mettre à jour une ressource qui a changé entre-temps (race condition)

**422 Unprocessable Entity** — Syntaxe correcte, mais sémantiquement invalide.  
Exemples :
- Email valide syntaxiquement, mais domaine inexistant
- Âge = -5 (valeur numérique, mais logiquement impossible)

⚠️ **Confusion fréquente** : Utiliser 400 pour tout au lieu de 422. Les deux peuvent convenir, mais 422 est plus précis pour les données valides syntaxiquement, mais illogiques.

### Les codes 5xx : erreurs serveur

Le **serveur** a un problème. Le client ne peut rien y faire seul.

**500 Internal Server Error** — Erreur non gérée du serveur.  
Exemples :
- Division par zéro dans le code
- Accès à une clé de dictionnaire qui n'existe pas
- Exception non attrapée

**502 Bad Gateway** — Le serveur ne peut pas contacter un service en amont (base de données, microservice, etc.).

**503 Service Unavailable** — Le serveur est temporairement indisponible.  
Exemples :
- Déploiement en cours
- Base de données en maintenance
- Surcharge système

⚠️ **Comportement attendu du client** : Si une requête retourne 5xx, le client doit **réessayer plus tard**. Pour 4xx, pas de point à réessayer : l'utilisateur doit corriger son action.

---

## Structure d'une réponse d'erreur

Vous ne devez *jamais* retourner une erreur vide. Voici une structure simple et efficace :

### Format JSON (le standard)

```json
{
  "error": {
    "code": "INVALID_EMAIL",
    "message": "L'email fourni n'est pas valide",
    "details": {
      "field": "email",
      "received": "john@.com",
      "expected": "Format: user@domain.ext"
    }
  }
}
```

**Champs clés** :
- `code` (ou `error_code`) : identifiant *unique* de l'erreur. Permet au client de la traiter spécifiquement.
- `message` : description **claire et en langage humain**. Pas de "invalid input", mais "L'email fourni n'est pas valide".
- `details` : contexte supplémentaire pour déboguer. Ici : quel champ, quelle valeur, quel format attendu.

### Exemple avec code HTTP + réponse

**Requête** (malformée) :
```bash
curl -X POST http://api.exemple.com/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice", "email": "alice@"}'
```

**Réponse** :
```
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": {
    "code": "INVALID_EMAIL",
    "message": "L'email fourni n'est pas valide",
    "details": {
      "field": "email",
      "provided": "alice@",
      "pattern": "user@domain.ext"
    }
  }
}
```

Le client sait immédiatement : "C'est un problème de validation, c'est le champ email, voici le format attendu."

💡 **Astuce** : Inclure les codes d'erreur dans votre documentation. Ça permet aux clients de préparer la gestion sans relancer des requêtes pour comprendre chaque code.

---

## Erreurs fréquentes et comment les détecter

### ❌ Erreur 1 : retourner 200 pour une erreur

**Symptôme** : L'API retourne un code 200, mais le body contient un message d'erreur.

```json
HTTP/1.1 200 OK

{
  "status": "error",
  "message": "User not found"
}
```

**Pourquoi c'est un problème** :
- Le client lit le code 200 et pense que c'est un succès. Il ne va pas chercher un message d'erreur.
- Les outils de monitoring (alertes, dashboards) ne vont pas signaler une erreur.
- Le code client doit parser le body pour chaque réponse, même succès.

**Correction** :
```json
HTTP/1.1 404 Not Found

{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "L'utilisateur avec cet ID n'existe pas"
  }
}
```

Le code 404 dit tout. Le client peut vérifier `if response.status == 404` et réagir.

---

### ❌ Erreur 2 : cacher les détails d'erreur en production

**Symptôme** : L'API retourne `"message": "Internal error"` en prod, mais toute la stack trace en dev.

```json
HTTP/1.1 500 Internal Server Error

{
  "error": "Internal server error"
}
```

**Pourquoi c'est un problème** :
- En dev, vous exposez des chemins de fichier, des noms de table, des versions de libs → **faille de sécurité**.
- En prod, vous bloquez le débogage : vous ne savez pas ce qui a échoué.

**Correction** :
- En dev : loguer la stack complète côté serveur, retourner un ID de transaction unique.
- En prod : retourner un ID de transaction, un message générique, mais **logger le détail côté serveur**.

```json
HTTP/1.1 500 Internal Server Error

{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Une erreur interne s'est produite",
    "transaction_id": "tx_abc123xyz"
  }
}
```

L'utilisateur/client peut chercher `tx_abc123xyz` dans vos logs pour voir la cause réelle.

---

### ❌ Erreur 3 : retourner du HTML au lieu de JSON

**Symptôme** : L'API en erreur retourne une page HTML (ex: erreur 500 avec la page nginx par défaut).

```html
HTTP/1.1 500 Internal Server Error
Content-Type: text/html

<html>
  <body>
    <h1>500 Internal Server Error</h1>
    <p>An error occurred</p>
  </body>
</html>
```

**Pourquoi c'est un problème** :
- Le client s'attend à du JSON. Il va crash en essayant de le parser.
- Impossible de traiter l'erreur programmatiquement.

**Correction** : Toujours retourner du JSON (ou le format déclaré en `Content-Type`), même en erreur.

```json
HTTP/1.1 500 Internal Server Error
Content-Type: application/json

{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Une erreur interne s'est produite"
  }
}
```

---

### ❌ Erreur 4 : utiliser 500 pour une erreur client

**Symptôme** : Validation échouée (email invalide), mais code 500 retourné.

```json
HTTP/1.1 500 Internal Server Error

{
  "error": "Email validation failed"
}
```

**Pourquoi c'est un problème** :
- Code 500 = serveur en panne. Les systèmes de monitoring vont déclencher une alerte.
- Le client ne sait pas s'il faut réessayer ou corriger sa requête.
- Les statistiques de santé de votre API vont exploser.

**Correction** : Valider avant de traiter, retourner 400 (ou 422).

```json
HTTP/1.1 400 Bad Request

{
  "error": {
    "code": "INVALID_EMAIL",
    "message": "L'email fourni n'est pas valide",
    "details": { "field": "email" }
  }
}
```

---

### ❌ Erreur 5 : ne pas loger les erreurs serveur

**Symptôme** : Vous recevez un rapport d'erreur 500, mais aucune trace dans les logs.

**Pourquoi c'est un problème** :
- Vous ne pouvez pas déboguer.
- L'erreur peut se reproduire sans que vous le sachiez.
- Vous découvrez les bugs en production par l'utilisateur.

**Correction** : Loger **systématiquement** les erreurs non attendues avec contexte complet.

Exemple en Python (Flask) :

```python
@app.errorhandler(Exception)
def handle_error(error):
    # Log l'erreur complète côté serveur
    app.logger.error(
        "Unhandled error",
        exc_info=True,  # Inclut la stack trace
        extra={
            "path": request.path,
            "method": request.method,
            "user_id": current_user.id if current_user else None
        }
    )
    
    # Retourne une réponse générique au client
    return {
        "error": {
            "code": "INTERNAL_ERROR",
            "message": "Une erreur interne s'est produite",
            "transaction_id": request.headers.get("X-Request-ID")
        }
    }, 500
```

---

## Bonnes pratiques : concevoir une gestion d'erreur cohérente

### 1. Créer un format d'erreur unifié

Tous les endpoints doivent retourner les erreurs dans le même format. Pas de variations selon l'endpoint.

Définissez un schéma central :

```python
# errors.py (module centralisé)
class APIError(Exception):
    def __init__(self, code, message, status_code=400, details=None):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details or {}

# Utilisation
raise APIError(
    code="INVALID_EMAIL",
    message="L'email fourni n'est pas valide",
    status_code=400,
    details={"field": "email", "provided": "alice@"}
)

# Renvoie toujours au client:
# {
#   "error": {
#     "code": "INVALID_EMAIL",
#     "message": "L'email fourni n'est pas valide",
#     "details": { ... }
#   }
# }
```

**Avantage** : Un seul endroit à modifier. Tous les endpoints restent synchronisés.

---

### 2. Documenter les codes d'erreur possibles

Chaque endpoint doit lister ses codes d'erreur attendus :

```markdown
## POST /users

Crée un utilisateur.

### Erreurs possibles

- **400 / INVALID_EMAIL** : Email fourni ne correspond pas au format user@domain.ext
- **400 / PASSWORD_TOO_SHORT** : Mot de passe < 8 caractères
- **409 / EMAIL_ALREADY_EXISTS** : Un utilisateur avec cet email existe déjà
- **500 / DATABASE_ERROR** : Erreur lors de la sauvegarde en base

### Exemple

```bash
curl -X POST http://api.exemple.com/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice", "email": "alice@.com", "password": "test"}'
```

Réponse (400) :
```json
{
  "error": {
    "code": "INVALID_EMAIL",
    "message": "L'email fourni n'est pas valide"
  }
}
```
```

Ça permet aux clients de **prévoir** tous les cas au lieu de les découvrir en prod.

---

### 3. Différencier les erreurs attendues des bugs

**Erreur attendue** (client invalide) :
- Code 4xx
- Message explicite : "L'email est invalide"
- Pas besoin de log spécial : c'est du comportement normal

**Bug (erreur serveur)** :
- Code 5xx
- Message générique : "Une erreur interne s'est produite"
- Log détaillé côté serveur avec stack trace et contexte

```python
try:
    user = User.create(name=name, email=email)  # Peut lever une exception
except ValueError as e:
    # Erreur attendue : validation échouée
    return {
        "error": {
            "code": "INVALID_DATA",
            "message": str(e)
        }
    }, 400

except Exception as e:
    # Bug : erreur non attendue
    app.logger.error("Unexpected error in user creation", exc_info=True)
    return {
        "error": {
            "code": "INTERNAL_ERROR",
            "message": "Une erreur interne s'est produite"
        }
    }, 500
```

---

### 4. Inclure un contexte de débogage minimal

Dans les erreurs 4xx, le contexte aide sans exposer de secrets :

✅ **Bon** :
```json
{
  "error": {
    "code": "INVALID_EMAIL",
    "message": "L'email fourni n'est pas valide",
    "details": {
      "field": "email",
      "provided": "alice@"
    }
  }
}
```

❌ **Mauvais** (expose trop) :
```json
{
  "error": {
    "code": "INVALID_EMAIL",
    "message": "Regex pattern '^[\\w\\.-]+@[\\w\\.-]+\\.\\w{2,}$' ne correspond pas",
    "query": "SELECT * FROM users WHERE email = 'alice@'"
  }
}
```

---

### 5. Gérer les validations avec une liste d'erreurs

Pour les formulaires avec plusieurs champs, retourner une liste d'erreurs au lieu d'une seule :

```json
HTTP/1.1 400 Bad Request

{
  "errors": [
    {
      "code": "INVALID_EMAIL",
      "message": "L'email n'est pas valide",
      "field": "email"
    },
    {
      "code": "PASSWORD_TOO_SHORT",
      "message": "Le mot de passe doit contenir au moins 8 caractères",
      "field": "password"
    }
  ]
}
```

**Avantage** : L'utilisateur corrige tous les problèmes en une seule soumission, pas itérativement.

---

## Résumé : diagnostiquer une erreur API en 30 secondes

| Élément | Ce qu'il vous dit |
|---------|-------------------|
| **Code 2xx** | ✅ Succès. Continuer. |
| **Code 4xx** | ❌ Erreur client. L'utilisateur/demandeur a fourni quelque chose d'invalide. Ne pas réessayer, corriger la requête. |
| **Code 5xx** | ⚠️ Erreur serveur. Le serveur ne peut pas traiter. Peut réessayer plus tard. |
| **Champ `code`** | Identifiant technique de l'erreur pour traitement programmatique. |
| **Champ `message`** | Explication lisible pour un humain. |
| **Champ `details`** | Contexte : quel champ, quelle valeur, quel format attendu. Aide au débogage. |

**Règle d'or** : Si vous pouvez lire le code HTTP + le message d'erreur et immédiatement savoir quoi corriger, c'est une bonne gestion d'erreur API.

---

## Cas d'usage réels

### Cas 1 : Créer un utilisateur avec email en doublon

**Requête** :
```bash
curl -X POST http://api.exemple.com/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Bob", "email": "alice@exemple.com", "password": "secret123"}'
```

(Alice existe déjà avec cet email)

**Réponse attendue** :
```json
HTTP/1.1 409 Conflict

{
  "error": {
    "code": "EMAIL_ALREADY_EXISTS",
    "message": "Un utilisateur avec cet email existe déjà",
    "details": {
      "email": "alice@exemple.com"
    }
  }
}
```

**Pourquoi 409** : Conflit sur une ressource existante. Le client sait : "réessaye avec un autre email".

---

### Cas 2 : Accéder à un endpoint sans authentification

**Requête** :
```bash
curl -X GET http://api.exemple.com/me
# (pas de header Authorization)
```

**Réponse attendue** :
```json
HTTP/1.1 401 Unauthorized

{
  "error": {
    "code": "MISSING_TOKEN",
    "message": "Token d'authentification manquant",
    "details": {
      "required_header": "Authorization",
      "format": "Authorization: Bearer <token>"
    }
  }
}
```

**Pourquoi 401** : Le serveur ne connaît pas l'identité du demandeur. À ajouter un token.

---

### Cas 3 : Utilisateur authentifié, mais sans permission

**Requête** :
```bash
curl -X DELETE http://api.exemple.com/users/42 \
  -H "Authorization: Bearer <token_utilisateur_normal>"
```

(L'utilisateur authentifié n'est pas admin)

**Réponse attendue** :
```json
HTTP/1.1 403 Forbidden

{
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "Vous n'avez pas les permissions pour accéder à cette ressource",
    "details": {
      "required_role": "admin",
      "your_role": "user"
    }
  }
}
```

**Pourquoi 403** : Utilisateur connu, mais refusé d'accès intentionnellement. Pas de "réessaye avec un autre token" possible.

---

### Cas 4 : Erreur serveur avec transaction ID

**Requête** (quelconque) :
```bash
curl -X GET http://api.exemple.com/data \
  -H "X-Request-ID: req_abc123"
```

(Un bug inattendu se produit côté serveur)

**Réponse** :
```json
HTTP/1.1 500 Internal Server Error

{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Une erreur interne s'est produite",
    "transaction_id": "req_abc123"
  }
}
```

**Côté serveur (logs)** :
```
ERROR [req_abc123] Unhandled exception in GET /data
Traceback (most recent call last):
  File "app.py", line 42, in get_data
    result = db.query(sql)
  File "db.py", line 120, in query
    return self.connection.execute(sql)
TypeError: connection.execute() missing 1 required positional argument: 'params'
...
```

**Flux** : Le client reçoit un message générique + un ID unique. Il le signale. Vous cherchez cet ID dans les logs, vous trouvez la stack trace. Debug rapide.

---

## Snippets de révision

<!-- snippet
id: http_status_codes_hierarchy
type: concept
tech: HTTP / API REST
level: beginner
importance: high
format: knowledge
tags: "codes-http,erreurs,api-rest"
title: Les 3 familles de codes HTTP et leur signification
content: "2xx = succès (200 OK, 201 Created, 204 No Content). 4xx = erreur client : les données envoyées ou l'authentification sont invalides, le client doit corriger (400 Bad Request pour validation, 401 Unauthorized pour authentification manquante, 403 Forbidden pour permissions insuffisantes, 404 Not Found pour ressource inexistante, 409 Conflict pour doublon). 5xx = erreur serveur : le serveur ne peut pas traiter, le client peut réessayer plus tard (500 Internal Error pour bug non attendu, 503 Service Unavailable pour maintenance/surcharge)."
description: "Famille 2xx = succès et continuer. 4xx = erreur client, corriger la requête. 5xx = erreur serveur, réessayer plus tard."
-->

<!-- snippet
id: api_error_response_format
type: concept
tech: API REST
level: beginner
importance: high
format: knowledge
tags: "erreurs,json,format-unifié,api-rest"
title: Structure standard d'une réponse d'erreur API
content: "Toujours retourner une structure JSON uniforme : { \"error\": { \"code\": \"ERROR_CODE\", \"message\": \"Description lisible\", \"details\": { contexte } } }. Le champ 'code' est un identifiant unique pour traitement programmatique (ex: INVALID_EMAIL, EMAIL_ALREADY_EXISTS). Le champ 'message' explique en langage courant ce qui s'est passé. Le champ 'details' (optionnel) donne le contexte : quel champ est invalide, quel format attendu, quel objet n'existe pas. Les trois champs ensemble permettent au client de savoir quoi faire : corriger, réessayer, ou signaler à l'utilisateur."
description: "Erreur = code + message + details. Code pour la machine, message pour le client, details pour déboguer."
-->

<!-- snippet
id: http_401_vs_403_difference
type: concept
tech: HTTP / API REST
level: beginner
importance: high
format: knowledge
tags: "authentification,autorisation,codes-http,api-rest"
title: Différence entre 401 Unauthorized et 403 Forbidden
content: "401 Unauthorized = le serveur ne sait pas qui vous êtes. Pas de token, token expiré, identifiants invalides. Le client doit envoyer un token valide. Réponse typique : { \"error\": { \"code\": \"MISSING_TOKEN\", \"message\": \"Token manquant\", \"details\": { \"required_header\": \"Authorization: Bearer <token>\" } } }. En contraste, 403 Forbidden = le serveur sait qui vous êtes (authentification réussie), mais vous n'avez pas la permission d'accéder à cette ressource. Exemple : utilisateur normal essaye DELETE /admin. Réponse typique : { \"error\": { \"code\": \"INSUFFICIENT_PERMISSIONS\", \"message\": \"Permissions insuffisantes\", \"details\": { \"required_role\": \"admin\" } } }."
description: "401 = qui es-tu ? 403 = je sais qui tu es, mais tu n'as pas le droit."
-->

<!-- snippet
id: api_error_logging_strategy
type: tip
tech: API REST / Logging
level: beginner
importance: high
format: knowledge
tags: "erreurs,logs,debugging,api-rest"
title: Stratégie de logging pour erreurs API en production
content: "Erreurs attendues (4xx) : log minimal, pas d'alerte. Exemple : log.info('Email validation failed', extra={'code': 'INVALID_EMAIL', 'field': 'email'}). Erreurs serveur (5xx) : log détaillé avec stack trace complète, contexte (user_id, path, method), et générer un transaction_id unique (ex: uuid). Retourner ce transaction_id au client : { \"error\": { \"code\": \"INTERNAL_ERROR\", \"message\": \"Une erreur s'est produite\", \"transaction_id\": \"tx_a1b2c3\" } }. Le client peut signaler l'ID, vous pouvez chercher dans les logs : log.error('Error in GET /users', exc_info=True, extra={'transaction_id': 'tx_a1b2c3'}) → stack trace visible uniquement côté serveur, pas exposée au client."
description: "4xx = log simple, pas d'alerte. 5xx = log complet + stack trace + transaction_id retourné au client pour traçabilité."
-->

<!-- snippet
id: http_200_success_trap
type: warning
tech: HTTP / API REST
level: beginner
importance: high
format: knowledge
tags: "codes-http,erreurs,pièges,api-rest"
title: Piège : retourner 200 avec un message d'erreur dans le body
content: "❌ Anti-pattern courant : HTTP/1.1 200 OK + body { \"status\": \"error\", \"message\": \"User not found\" }. Problème : le code 200 dit « succès », le client s'arrête là. Il ne va pas vérifier le body. Les systèmes de monitoring ne détectent pas d'erreur (alertes ne se déclenchent pas). ✅ Correction : retourner le bon code HTTP. HTTP/1.1 404 Not Found + body { \"error\": { \"code\": \"USER_NOT_FOUND\", \"message\": \"L'utilisateur n'existe pas\" } }. Le code HTTP EST l'information. Le body détaille."
description: "Toujours utiliser le bon code HTTP (4xx/5xx) pour erreurs, jamais 200