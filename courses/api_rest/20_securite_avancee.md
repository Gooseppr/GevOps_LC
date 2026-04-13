---
layout: page
title: "Sécurité avancée des API REST"

course: api-rest
chapter_title: "Sécurité avancée"

chapter: 9
section: 1

tags: api, sécurité, authentification, autorisation, oauth2, jwt, rate-limiting, injection, zero-trust
difficulty: advanced
duration: 180
mermaid: true

icon: "🔐"
domain: security
domain_icon: "🛡️"
status: "published"
---

# Sécurité avancée des API REST

## Objectifs pédagogiques

À l'issue de ce module, vous serez capable de :

1. **Identifier** les vecteurs d'attaque spécifiques aux API REST et les conditions qui les rendent exploitables
2. **Concevoir** une architecture d'authentification et d'autorisation robuste avec OAuth2, JWT et scopes
3. **Durcir** une API en production : headers, rate limiting, validation d'entrées, gestion des secrets
4. **Détecter** une compromission d'API à partir des logs et des patterns de trafic anormaux
5. **Arbitrer** entre sécurité, performance et complexité opérationnelle sur des contrôles concrets

---

## Mise en situation

En mars 2022, l'équipe de sécurité de Peloton découvre que son API REST `/api/user/{id}` retourne les données complètes de n'importe quel compte — sans authentification. Pas de token requis, pas de contrôle de session. 4 millions de profils utilisateurs accessibles en itérant simplement sur les IDs numériques.

La faille n'est pas une injection SQL sophistiquée. C'est un endpoint qui fait confiance au paramètre de l'URL sans vérifier que l'appelant a le droit de voir cet utilisateur. Un bug de deux lignes. L'impact : BOLA (Broken Object Level Authorization), classé #1 dans l'OWASP API Security Top 10.

Ce scénario illustre un pattern récurrent : **les API sont attaquées différemment des applications web classiques**. Les outils de sécurité périmétrique (WAF, IDS réseau) ne voient qu'un flux JSON valide. Les failles vivent dans la logique métier, la gestion des identités, et la confiance implicite accordée aux clients.

Ce module couvre les menaces qui comptent réellement en prod — pas la liste exhaustive des CVEs, mais les vecteurs qui reviennent systématiquement dans les rapports de breach.

---

## Modèle de menace

Avant de parler de contrôles, il faut savoir contre qui et contre quoi on se défend.

### Acteurs de menace réalistes

| Acteur | Motivation | Capacité technique | Vecteur typique |
|--------|-----------|-------------------|-----------------|
| Script kiddie | Données revendues, notoriété | Faible — outils automatisés | Scan de masse, credential stuffing |
| Concurrent / insider | Données concurrentielles, IP | Moyenne — connaissance du domaine | Enumération d'objets, abus de scopes |
| Chercheur bug bounty | Prime | Élevée — méthodique | BOLA, BFLA, injection, business logic |
| Attaquant ciblé (APT) | Exfiltration durable | Très élevée | Supply chain, token theft, pivoting |

### STRIDE appliqué aux API REST

```
Spoofing      → Usurpation d'identité via token volé ou forgé
Tampering     → Modification de payload (paramètre price=0, role=admin)
Repudiation   → Absence de logs sur les actions sensibles
Info Disclosure → Surexposition de données (BOLA, verbose errors)
DoS           → Absence de rate limiting, requêtes coûteuses
Elevation     → BFLA — appel d'endpoint admin sans vérification de rôle
```

### Actifs à protéger, par ordre de criticité

1. **Credentials et tokens** — compromission donne un accès durable
2. **Données utilisateurs** — impact RGPD, réputation, amendes
3. **Endpoints d'administration** — surface d'escalade de privilèges
4. **Logique métier** — abus de workflow (order sans paiement, refund infini)
5. **Disponibilité** — coût direct si l'API est core business

---

## Surface d'attaque

Tout ce qui est exposé est attaquable. La cartographie doit être exhaustive — les attaquants utilisent des crawlers et des fuzzers, pas juste la documentation.

| Vecteur | Exposition | Impact potentiel |
|---------|-----------|-----------------|
| Endpoints non documentés (shadow APIs) | Élevée — oubliés dans les revues de sécurité | Critique — souvent moins bien protégés |
| Paramètres d'objet dans l'URL (`/users/{id}`) | Élevée — prévisibles si IDs numériques | Élevé — BOLA, exfiltration de masse |
| Headers non validés (`X-Forwarded-For`, `X-User-ID`) | Moyenne — dépend de la conf proxy | Élevé — bypass d'IP allowlist, injection d'identité |
| JWT avec claims non vérifiés | Moyenne — dépend de l'implémentation | Critique — élévation de privilèges |
| Endpoints de debug/santé (`/debug`, `/actuator`) | Élevée — souvent oubliés en prod | Élevé — fuite de config, mémoire heap |
| Webhooks sortants | Faible — moins connue | Moyen — SSRF via callback URL |
| Dépendances tierces (SDK, libs de parsing) | Élevée — supply chain | Variable — RCE selon la faille |

🔴 **Vecteur d'attaque** : les shadow APIs sont découvertes avec des outils comme [Arjun](https://github.com/s0md3v/Arjun) (fuzzing de paramètres) ou en analysant les bundles JS frontend qui contiennent souvent les routes complètes de l'API.

```bash
# Découverte de paramètres cachés sur un endpoint connu
python3 arjun.py -u https://api.target.com/users/search --stable -oJ params.json

# Extraction de routes depuis un bundle JS
grep -oP '(?<=api/)[a-z/]+' main.bundle.js | sort -u
```

---

## Les 5 vecteurs qui génèrent 80% des incidents API

### 1. BOLA — Broken Object Level Authorization

C'est le Peloton. C'est l'Uber 2022 (exposition des données de chauffeurs). C'est la faille la plus commune dans les API REST.

**Comment ça marche** : l'API identifie une ressource par son ID dans l'URL. Le serveur vérifie que l'utilisateur est authentifié, mais pas qu'il est *propriétaire* de la ressource demandée. L'attaquant change l'ID. Il itère.

```
GET /api/v1/invoices/10423  → sa facture
GET /api/v1/invoices/10424  → facture de quelqu'un d'autre ✓ (côté attaquant)
```

**Outil** : [ffuf](https://github.com/ffuf/ffuf) pour itérer sur les IDs numériques ou GUID.

```bash
ffuf -u "https://api.target.com/invoices/FUZZ" \
     -H "Authorization: Bearer <TOKEN_VALIDE>" \
     -w ids.txt \
     -mc 200 \
     -o bola_results.json
```

🔒 **Contrôle** : vérifier systématiquement `resource.owner_id == authenticated_user.id` côté serveur, sur chaque accès. Ne jamais déléguer ce contrôle au client.

```python
# ❌ Mauvais — vérifie seulement l'auth
@app.route("/invoices/<int:invoice_id>")
@require_auth
def get_invoice(invoice_id):
    return db.get_invoice(invoice_id)

# ✅ Correct — vérifie l'appartenance
@app.route("/invoices/<int:invoice_id>")
@require_auth
def get_invoice(invoice_id):
    invoice = db.get_invoice(invoice_id)
    if invoice.owner_id != g.current_user.id:
        abort(403)
    return invoice
```

Utiliser des UUIDs v4 aléatoires plutôt que des IDs séquentiels réduit la surface d'énumération mais ne remplace pas le contrôle d'autorisation.

---

### 2. BFLA — Broken Function Level Authorization

Variante verticale du BOLA : l'attaquant ne change pas l'ID de l'objet, il change la **méthode HTTP** ou appelle un **endpoint de niveau supérieur** qu'il ne devrait pas pouvoir atteindre.

**Cas réel** : en 2019, un chercheur découvre que l'API d'une fintech exposait `DELETE /admin/users/{id}` accessible avec un token utilisateur standard. L'endpoint était dans la doc interne mais pas protégé par le middleware d'autorisation admin.

```bash
# Test rapide — appeler un endpoint admin avec un token user
curl -X DELETE https://api.target.com/admin/users/42 \
     -H "Authorization: Bearer <TOKEN_USER>"

# Fuzzing d'endpoints admin non documentés
ffuf -u "https://api.target.com/FUZZ" \
     -w /usr/share/wordlists/api_endpoints.txt \
     -H "Authorization: Bearer <TOKEN_USER>" \
     -mc 200,201,204
```

🔒 **Contrôle** : le middleware d'autorisation doit être appliqué *par rôle ET par endpoint*, pas seulement au niveau du routeur global. Chaque endpoint admin doit vérifier explicitement le scope ou le rôle requis.

---

### 3. Mass Assignment

L'API accepte un body JSON et mappe automatiquement les champs sur un objet du modèle. Si le développeur ne filtre pas les champs autorisés, un attaquant peut envoyer des champs supplémentaires.

```json
// Requête utilisateur normale
{ "email": "new@example.com" }

// Requête attaquant — ajout de champs non documentés
{ "email": "new@example.com", "role": "admin", "is_verified": true, "credits": 99999 }
```

🔴 **Vecteur** : GitHub a eu ce bug en 2012 — un chercheur a pu ajouter sa clé SSH publique au repo de l'organisation Rails en injectant `public_key[user_attributes][admin]=1` dans un formulaire mappé directement sur le modèle ActiveRecord.

🔒 **Contrôle** : utiliser des DTOs (Data Transfer Objects) ou des allowlists explicites. Ne jamais mapper `request.body` directement sur un objet de domaine.

```python
# ❌ Dangereux
user.update(**request.json)

# ✅ Allowlist explicite
ALLOWED_UPDATE_FIELDS = {"email", "display_name", "avatar_url"}
update_data = {k: v for k, v in request.json.items() if k in ALLOWED_UPDATE_FIELDS}
user.update(**update_data)
```

---

### 4. JWT — Ce que les implémentations ratent

JWT est bien compris en théorie. En pratique, les implémentations ratent sur des points précis.

#### Attaque `alg: none`

L'attaquant modifie le header du token pour indiquer `"alg": "none"`, supprime la signature, et envoie le token tronqué. Si la librairie accepte `none` comme algorithme valide, le token est accepté sans vérification de signature.

```python
# Token forgé — header modifié
import base64, json

header = base64.urlsafe_b64encode(json.dumps({"alg": "none", "typ": "JWT"}).encode()).rstrip(b'=')
payload = base64.urlsafe_b64encode(json.dumps({"sub": "1", "role": "admin"}).encode()).rstrip(b'=')
forged_token = f"{header.decode()}.{payload.decode()}."  # Pas de signature
```

🔒 **Contrôle** : fixer l'algorithme accepté côté serveur, ne pas le lire depuis le token lui-même.

```python
# ✅ Algorithme fixé côté serveur
jwt.decode(token, secret, algorithms=["HS256"])  # Liste explicite, jamais ["none"]
```

#### Confusion RS256/HS256

Si l'API supporte les deux algorithmes, un attaquant peut prendre la **clé publique RSA** (souvent exposée via `/jwks.json`) et l'utiliser comme secret HMAC pour signer un token HS256. Si le serveur ne valide pas que RS256 est utilisé pour les tokens qui le déclarent, il accepte le token forgé.

#### Claims non vérifiés

Les librairies vérifient la signature, mais `exp`, `nbf`, `iss`, `aud` doivent être vérifiés **explicitement** dans le code.

```python
# ✅ Vérification complète
payload = jwt.decode(
    token,
    secret,
    algorithms=["HS256"],
    options={
        "require": ["exp", "iss", "sub"],
        "verify_exp": True,
        "verify_iss": True,
    },
    issuer="https://auth.myapp.com",
    audience="api.myapp.com"
)
```

#### Durée de vie excessive

Un token avec `exp` à J+365 est équivalent à un credential permanent si le système n'a pas de mécanisme de révocation. Après un vol de token, la fenêtre d'exploitation est d'un an.

🔒 **Contrôle** : access token ≤ 15 minutes, refresh token ≤ 7 jours avec rotation. Maintenir une blocklist des JTI révoqués (Redis avec TTL).

---

### 5. Injection dans les API REST

Les API REST ne sont pas à l'abri des injections — le vecteur change, pas le principe.

**NoSQL Injection** (MongoDB) :

```json
// Body normal
{ "username": "alice", "password": "secret" }

// Payload d'injection — opérateur MongoDB
{ "username": "alice", "password": { "$gt": "" } }
```

Si l'API passe ce body directement à `db.users.findOne(request.json)`, la condition `password > ""` est toujours vraie → bypass d'authentification.

**GraphQL Injection** (hors scope REST mais fréquent dans les architectures mixtes) :

```graphql
{ user(id: "1; DROP TABLE users;--") { name } }
```

**SSRF via URL parameter** :

```
POST /api/fetch-preview
{ "url": "http://169.254.169.254/latest/meta-data/iam/security-credentials/" }
```

Le service fait une requête vers l'URL fournie — qui pointe vers l'endpoint de métadonnées AWS. L'attaquant récupère les credentials IAM du rôle attaché à l'instance.

🔒 **Contrôles** :
- Valider et typer chaque paramètre d'entrée avant toute utilisation en query
- Utiliser des requêtes paramétrées
- Pour les URLs externes : allowlist de domaines + blocklist de ranges IP privés (RFC1918, link-local, loopback)

---

## Architecture d'authentification et d'autorisation

### OAuth2 + OIDC — Le flux qui compte en production

```mermaid
sequenceDiagram
    participant Client
    participant AuthServer as Authorization Server
    participant API as Resource Server
    participant DB

    Client->>AuthServer: POST /token (client_credentials ou code)
    AuthServer-->>Client: access_token (JWT, 15min) + refresh_token (opaque, 7j)
    
    Client->>API: GET /resource (Bearer access_token)
    API->>API: Vérifier signature JWT (JWKS)
    API->>API: Vérifier exp, iss, aud, scopes
    API->>DB: Query avec user_id du claim
    DB-->>API: Data
    API-->>Client: 200 OK

    Note over Client,API: Après expiration du access_token
    Client->>AuthServer: POST /token (grant=refresh_token)
    AuthServer->>AuthServer: Invalider ancien refresh_token (rotation)
    AuthServer-->>Client: Nouveaux access_token + refresh_token
```

### Scopes — Granularité qui compte

Les scopes sont le mécanisme de moindre privilège pour les API. Un client ne devrait obtenir que les scopes dont il a besoin pour son cas d'usage.

| Scope | Accès accordé | À accorder à |
|-------|--------------|--------------|
| `invoices:read` | Lecture de ses propres factures | Application mobile |
| `invoices:write` | Création et modification de factures | Application web |
| `admin:users:read` | Lecture de tous les utilisateurs | Dashboard admin interne |
| `admin:users:write` | Modification de tous les utilisateurs | Script de migration seulement |

🔒 **Contrôle** : vérifier les scopes côté Resource Server sur chaque endpoint, même si l'Authorization Server les a accordés. Le token peut être volé — le vérifier ne suffit pas, il faut aussi vérifier qu'il a le scope requis pour *cette* action.

```python
def require_scope(scope: str):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            token_scopes = g.token_payload.get("scope", "").split()
            if scope not in token_scopes:
                abort(403, description=f"Missing scope: {scope}")
            return f(*args, **kwargs)
        return wrapper
    return decorator

@app.route("/invoices", methods=["POST"])
@require_auth
@require_scope("invoices:write")
def create_invoice():
    ...
```

### mTLS pour les communications service-à-service

Pour les API internes (microservices), utiliser mTLS plutôt que des tokens partagés. Chaque service possède un certificat client — l'authentification est mutuelle.

```nginx
# nginx — vérification du certificat client
server {
    listen 443 ssl;
    ssl_certificate     /certs/server.crt;
    ssl_certificate_key /certs/server.key;
    ssl_client_certificate /certs/ca.crt;
    ssl_verify_client on;
    ssl_verify_depth 2;

    location /internal/ {
        # Le CN du certificat client est transmis à l'application
        proxy_set_header X-Client-CN $ssl_client_s_dn_cn;
        proxy_pass http://upstream;
    }
}
```

---

## Durcissement en production

### Headers de sécurité

Les headers sont la première ligne de défense visible — et souvent mal configurés.

```nginx
# Configuration nginx recommandée pour une API REST
server {
    # Masquer la version du serveur
    server_tokens off;

    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    
    # CSP minimal pour API pure (pas de contenu HTML)
    add_header Content-Security-Policy "default-src 'none'" always;
    
    # Contrôle CORS strict
    add_header Access-Control-Allow-Origin "https://app.mycompany.com" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
    add_header Access-Control-Max-Age "3600" always;

    # Ne pas exposer les informations de timing
    add_header Referrer-Policy "no-referrer" always;
}
```

⚠️ **Erreur fréquente** : `Access-Control-Allow-Origin: *` sur une API authentifiée. Les navigateurs n'envoient pas les cookies tiers avec un wildcard — mais les tokens Bearer dans les headers, si. Un site malveillant peut initier des requêtes cross-origin et lire les réponses si l'origine est `*`.

### Rate Limiting — architecture

Le rate limiting naïf (compteur par IP) est bypassé en quelques minutes avec des proxies rotatifs. Une architecture robuste combine plusieurs niveaux.

```mermaid
graph LR
    Client --> Gateway["API Gateway<br/>Rate limit global<br/>(IP + token)"]
    Gateway --> Service["Service applicatif<br/>Rate limit par user<br/>(sliding window)"]
    Service --> Endpoint["Endpoint sensible<br/>Rate limit par action<br/>(ex: /login → 5/min)"]
    
    style Gateway fill:#ff6b6b,color:#fff
    style Service fill:#ffa94d,color:#fff
    style Endpoint fill:#69db7c,color:#000
```

**Implémentation avec Redis (sliding window)** :

```python
import redis
import time

r = redis.Redis()

def is_rate_limited(user_id: str, action: str, limit: int, window_seconds: int) -> bool:
    key = f"rl:{action}:{user_id}"
    now = time.time()
    window_start = now - window_seconds
    
    pipe = r.pipeline()
    # Supprimer les requêtes hors fenêtre
    pipe.zremrangebyscore(key, 0, window_start)
    # Compter les requêtes dans la fenêtre
    pipe.zcard(key)
    # Ajouter la requête courante
    pipe.zadd(key, {str(now): now})
    # Expirer la clé
    pipe.expire(key, window_seconds)
    
    results = pipe.execute()
    request_count = results[1]
    
    return request_count >= limit

# Usage
if is_rate_limited(user_id=user.id, action="login", limit=5, window_seconds=60):
    abort(429, description="Too many login attempts")
```

🔒 **Contrôle** : retourner `Retry-After` dans les headers 429 — les clients bien écrits respectent cette valeur plutôt que de retry en boucle.

```
HTTP/1.1 429 Too Many Requests
Retry-After: 30
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1711234567
```

### Validation d'entrées — pas de confiance au schéma OpenAPI

Le schéma OpenAPI documente le contrat. Il ne valide pas les données en production — c'est le code qui le fait.

```python
from pydantic import BaseModel, Field, validator
from typing import Optional
import re

class CreateOrderRequest(BaseModel):
    product_id: str = Field(..., regex=r'^[a-f0-9-]{36}$')  # UUID format
    quantity: int = Field(..., ge=1, le=1000)
    shipping_address: str = Field(..., min_length=10, max_length=500)
    promo_code: Optional[str] = Field(None, regex=r'^[A-Z0-9]{6,10}$')
    
    @validator('shipping_address')
    def no_script_injection(cls, v):
        if re.search(r'<[^>]+>', v):
            raise ValueError('Invalid characters in address')
        return v

# Pydantic lève ValidationError → retourner 422 Unprocessable Entity
```

⚠️ **Erreur fréquente** : valider le type (`int`) mais pas la plage. `quantity: -1` passe la validation de type, mais génère un avoir négatif si la logique métier ne vérifie pas les bornes.

### Gestion des erreurs — ne pas fuir d'informations

```python
# ❌ Mauvais — stack trace en réponse
{
  "error": "psycopg2.errors.UndefinedTable: relation \"users_backup\" does not exist\nLINE 1: SELECT * FROM users_backup WHERE..."
}

# ✅ Correct — message générique + log interne
{
  "error": "internal_error",
  "message": "An error occurred. Reference: err-7f3a2b",
  "request_id": "req-abc123"
}
```

L'ID de référence permet de corréler l'erreur dans les logs internes sans exposer les détails à l'appelant.

---

## Gestion des secrets

Les secrets dans le code source sont **la première chose que cherchent les attaquants** après un accès à un repo — même privé, même avec un accès limité. GitGuardian a détecté 10 millions de secrets exposés dans des repos publics GitHub en 2023.

### Ce qu'il ne faut jamais faire

```python
# ❌ Secret hardcodé — visible dans git history même après suppression
DATABASE_URL = "postgresql://admin:SuperSecret123@prod-db.internal:5432/myapp"
AWS_SECRET_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"

# ❌ Variable d'environnement dans un Dockerfile
ENV API_KEY=my-production-key-12345
```

💡 `git log -S "password" --source --all` retrouve tous les commits qui ont introduit ou supprimé le mot "password" dans n'importe quel fichier — y compris les branches supprimées. Rien n'est vraiment effacé sans `git filter-branch` ou `git filter-repo`.

### Architecture de gestion des secrets en production

```
┌─────────────────────────────────────────────────────┐
│  Secret Source                                       │
│                                                      │
│  HashiCorp Vault / AWS Secrets Manager / GCP SM     │
│  - Rotation automatique                              │
│  - Audit trail de chaque accès                      │
│  - TTL sur les credentials dynamiques               │
└────────────────────┬────────────────────────────────┘
                     │ Injection au démarrage
                     ▼
┌─────────────────────────────────────────────────────┐
│  Runtime                                             │
│  - Variables d'environnement (pas de fichier)        │
│  - Jamais dans les logs                              │
│  - Jamais dans les réponses d'API                   │
└─────────────────────────────────────────────────────┘
```

**Rotation de secret avec Vault** :

```bash
# Générer des credentials PostgreSQL dynamiques (TTL 1h)
vault read database/creds/my-role
# Key                Value
# lease_duration     1h
# username           v-app-xyz123
# password           A1a-generated-password

# L'application utilise ces credentials — à l'expiration, Vault les révoque
# et peut en générer de nouveaux automatiquement
```

🔒 **Contrôle** : installer [detect-secrets](https://github.com/Yelp/detect-secrets) en pre-commit hook pour bloquer les commits contenant des patterns de secrets.

```bash
pip install detect-secrets
detect-secrets scan > .secrets.baseline
# Ajouter dans .pre-commit-config.yaml
```

---

## Contrôles de détection

Sécuriser sans surveiller, c'est construire une alarme sans batterie.

### Logs à surveiller

Pas question de logger tout — ça noie le signal dans le bruit. Les événements qui comptent :

| Événement | Champ à logger | Seuil d'alerte |
|-----------|---------------|----------------|
| Échec d'authentification | user_id, IP, user_agent | > 10/min par IP |
| Accès refusé (403) | user_id, endpoint, resource_id | > 20/min par user |
| Rate limit atteint (429) | user_id, IP, action | Tout déclenchement sur /login |
| Token invalide/expiré | IP, user_agent, token_jti partiel | > 5/min |
| Modification de données sensibles | user_id, resource_id, before/after hash | Tout événement |
| Appel d'endpoint admin | user_id, IP, timestamp | Tout événement hors horaires |

### Format de log structuré

```json
{
  "timestamp": "2024-03-15T14:32:07.123Z",
  "level": "WARN",
  "event": "auth.failed",
  "request_id": "req-7f3a2b",
  "user_id": null,
  "ip": "185.220.101.45",
  "user_agent": "python-httpx/0.24.0",
  "endpoint": "POST /api/auth/token",
  "reason": "invalid_credentials",
  "attempt_count": 8
}
```

💡 Ne jamais logger le token JWT complet, ni le mot de passe, ni le numéro de carte. Logger le JTI (JWT ID) permet de corréler sans exposer le token.

### Règles de détection — exemples SIEM

```yaml
# Règle : détection d'énumération BOLA
rule: bola_enumeration_detected
condition:
  - event: "access.forbidden"
  - user_id: same
  - count: > 50
  - timeframe: 5m
  - distinct_resource_ids: > 20
action: alert + block_user_temporarily

# Règle : credential stuffing
rule: credential_stuffing_detected
condition:
  - event: "auth.failed"
  - ip: same
  - count: > 100
  - timeframe: 10m
  - distinct_user_ids: > 30
action: alert + block_ip + notify_security_team
```

---

## Tests de sécurité

### Checklist de test — ce qu'il faut vérifier avant chaque mise en production

```bash
# 1. Vérifier les headers de sécurité
curl -I https://api.myapp.com/health | grep -E "Strict-Transport|X-Content-Type|X-Frame"

# 2. Tester le CORS — l'origine malveillante doit être rejetée
curl -H "Origin: https://evil.com" \
     -H "Access-Control-Request-Method: GET" \
     -I https://api.myapp.com/users/me

# 3. Vérifier que les endpoints