```yaml
layout: page
title: "Sécurité API — Conception et défense en production"

course: "API REST"
chapter_title: "Sécurité API"

chapter: 3
section: 1

tags: "sécurité,api,authentification,autorisation,architecture,production"
difficulty: "intermediate"
duration: 120
mermaid: true

icon: "🔐"
domain: "Sécurité applicative"
domain_icon: "🛡️"
status: "published"
---

# Sécurité API — Conception et défense en production

## Objectifs pédagogiques

À la fin de ce module, vous serez capable de :

1. **Identifier les vecteurs d'attaque spécifiques aux API** et cartographier la surface d'exposition d'une API en production
2. **Concevoir un système d'authentification et d'autorisation** adapté à l'architecture d'une API (JWT, OAuth2, mTLS selon le contexte)
3. **Durcir une API existante** en appliquant des contrôles concrets : rate limiting, validation, chiffrement, secrets management
4. **Détecter et réagir à une attaque API** en mettant en place des logs et des alertes pertinentes
5. **Prendre une décision d'architecture sécurité** sachant les compromis entre protection, performance et complexité

---

## Mise en situation

**Juin 2023 — Twitch subit une fuite majeure.**

Un attaquant accède à l'API interne de Twitch via une vulnerability de **Server-Side Template Injection (SSTI)** dans un endpoint apparemment inoffensif. En deux heures, il exfiltrait :
- 125 GB de code source
- Les tokens d'accès de streamers
- Les clés de chiffrement internes

**Pourquoi la sécurité naïve n'a pas suffi :**
- ✅ Authentification présente (token OAuth)
- ✅ HTTPS activé
- ❌ Pas de validation stricte du templating côté serveur
- ❌ Pas de rate limiting sur l'endpoint exposé
- ❌ Les logs ne captaient pas les patterns d'accès anormaux

**La leçon :** Une API sécurisée n'est pas juste "authentifiée et chiffrée en transit". C'est une composition de contrôles — chacun adressant une classe spécifique de menaces. Ce module vous enseigne comment les concevoir ensemble.

---

## Surface d'attaque d'une API

Une API REST expose beaucoup plus qu'un endpoint `/users`. Avant de défendre, il faut cartographier ce qui attire réellement un attaquant.

### Vecteurs d'exposition

| **Catégorie** | **Vecteur d'attaque** | **Exposition** | **Impact potentiel** |
|---|---|---|---|
| **Entrée utilisateur** | Injection (SQL, NoSQL, LDAP, OS command) | Params GET/POST, headers custom, body JSON | Accès données, RCE, escalade |
| **Authentification** | Tokens forgés, replay, fixation de session, brute force | Bearer header, cookies, API keys | Usurpation d'identité, accès non autorisé |
| **Autorisation** | IDOR (Insecure Direct Object References), escalade horizontale/verticale | Params ID de ressource, absence de vérification d'ownership | Lecture/modification de données d'autres utilisateurs |
| **Métadonnées** | Énumération de comptes, leaks informationnels, fingerprinting | Messages d'erreur, headers, version API, timing | Reconnaissance pré-attaque, contournement des contrôles |
| **Rate limiting** | Brute force (credentials, tokens), DDoS applicatif | Absence de limitation ou limites trop hautes | Compromission comptes, déni de service |
| **Secrets** | Clés d'API, tokens, DB credentials en logs/code/réponses | Logs publics, dépôts Git, fichiers de config | Accès lateral, compromission complète |
| **Dépendances** | Vulnérabilités dans libs (Log4j, Struts, Jackson) | Npm, Maven, PyPI avec versions non patchées | RCE, extraction de données |
| **Interaction inter-services** | Traversée d'une API à une autre (gateway compromise) | Absence d'isolation, secrets partagés, mTLS absent | Propagation d'attaque dans l'infrastructure |

🔴 **Vecteur d'attaque — Web scraping massif :** Un bot envoie 10 000 requêtes/sec à `/api/users/{id}` en incrémentant l'ID. Sans rate limiting, il énumère tous les utilisateurs en 5 minutes.

---

## Modèle de menace

Qui attaque une API ? Pourquoi ? Comment structurer la défense ?

```mermaid
graph TD
    A["Attaquant externe<br/>(concurrence, financier,<br/>nation-état)"] -->|Reconnaissance| B["Énumération endpoints<br/>Fingerprinting tech<br/>Cherche API publique non sécurisée"]
    A -->|Exploitation| C["Injection<br/>Authentification faible<br/>IDOR<br/>Rate limiting absent"]
    A -->|Exfiltration| D["Données client<br/>Tokens/secrets<br/>Code source"]
    
    E["Attaquant interne<br/>(dev, ops, ancien employé)"] -->|Accès réseau| F["API interne supposée<br/>de confiance<br/>Pas d'encryption mTLS"]
    E -->|Escalade| G["Lire données sensibles<br/>Supprimer ressources<br/>Modifier configs"]
    
    H["Attaquant par le client<br/>(utilisateur malveillant,<br/>app compromise)"] -->|Manipulation| I["Forger requête API<br/>Changer ID ressource<br/>Rejouer token"]
    I -->|Impact| J["IDOR<br/>Escalade horizontale<br/>Usurpation"]
    
    K["Événement légitime non prévu"] -->|Charge anormale| L["Load spike<br/>Cache invalide<br/>Cascade failure"]
    
    style A fill:#ff6b6b
    style E fill:#ff8c00
    style H fill:#ffa500
    style K fill:#ffb347
```

**Actifs à protéger (priorité décroissante) :**

1. **Données utilisateur** (PII, historique, préférences) → confidentialité + intégrité
2. **Authentification (tokens, sessions)** → non-répudiation + intégrité
3. **Droit d'accès (roles, permissions)** → disponibilité + intégrité
4. **Secrets d'infrastructure** (DB password, API keys internes) → confidentialité
5. **Disponibilité du service** → résilience (rate limiting, circuit breaker)

**Scénarios les plus probables (et coûteux) :**

- **Vol de tokens en transit ou au repos** → Compromission de session → Usurpation → Lecture données complètes d'un utilisateur
- **IDOR non détecté** → Accès récursif à toutes les ressources d'autres utilisateurs (linéaire en nombre d'IDs)
- **Injection non validée** → RCE ou lecture directe de la base → Exfiltration massive
- **Secrets en logs/dépôt Git** → Accès lateral à d'autres systèmes → Chaîne de compromission
- **Rate limiting absent** → Brute force des credentials → Accès comptes de valeur élevée

---

## Authentification API : au-delà du token

### Pourquoi les tokens seuls ne suffisent pas

Un attaquant n'a pas besoin de cracker votre mot de passe. Il vous **observe** pour récupérer votre token.

**Vecteurs réels de vol de token :**

1. **Exfiltration via logs** : Une exception non filtrée affiche `Authorization: Bearer eyJ0eXAi...` en production
2. **XSS côté client** : Votre frontend stocke le token dans `localStorage` au lieu de `httpOnly cookie` → JS malveillant l'exfiltré
3. **Man-in-the-middle** : HTTPS non forcé ou certificat autoprovisionné → attaquant intercepte le bearer
4. **Careless developers** : Token hardcodé en config, committed en Git, visible en memory dump du serveur
5. **Replay attack** : Token récupéré une fois → réutilisé indéfiniment sans timestamping
6. **Scope creep** : Token généré pour accéder à `/users` → réutilisé pour accéder à `/admin`

### Architecture : trois piliers

```
┌─────────────────────────────────────────────────┐
│            AUTHENTIFICATION MULTI-NIVEAUX         │
├─────────────────────────────────────────────────┤
│ 1. OBTENTION du credential (sécurisé)           │
│    ├─ MFA : password + OTP/biométrique          │
│    ├─ Isolation : PKCE pour clients publics     │
│    └─ Expiration : tokens de courte durée       │
├─────────────────────────────────────────────────┤
│ 2. TRANSMISSION (en transit)                    │
│    ├─ HTTPS forcé + TLS 1.2+ obligatoire        │
│    ├─ Bearer ou mTLS (client cert)              │
│    └─ Rotation périodique du credential         │
├─────────────────────────────────────────────────┤
│ 3. VÉRIFICATION (au serveur)                    │
│    ├─ Signature cryptographique                 │
│    ├─ Expiration (iat, exp en JWT)              │
│    ├─ Revocation list (blacklist tokens)        │
│    └─ Rate limit sur auth endpoint              │
└─────────────────────────────────────────────────┘
```

### Décision : JWT vs OAuth2 vs mTLS

| **Technique** | **Quand l'utiliser** | **Risque principal** | **Coût en prod** |
|---|---|---|---|
| **JWT signé** | API mobile/web, app publique, stateless | Révocation lente, pas de valeurs secrètes côté serveur | Faible — juste vérifier la signature |
| **OAuth2 (Authorization Code)** | API tierce, délégation d'accès, compliance | Token interception, state parameter oublié, redirect_uri bypass | Moyen — implique un auth server externe |
| **mTLS** (client certificate) | API interne, intégration backend-to-backend, ZeroTrust | Gestion des certs complexe, revocation lente, erreur client → bloqué | Élevé — infra PKI, rotation certs |
| **API Key** | API publique simple, webhooks, scripts | Réutilisabilité (pas d'expiration), scope trop large, rotation rare | Très faible — juste une lookup en DB |

🔴 **Vecteur d'attaque — JWT sans expiration :** Un token JWT généré en 2019 sans champ `exp` est toujours valide en 2024. S'il fuit, c'est un accès perpétuel.

```json
// ❌ Mauvais
{
  "sub": "user123",
  "role": "admin",
  "iat": 1560000000
}

// ✅ Bon
{
  "sub": "user123",
  "role": "admin",
  "iat": 1722500000,
  "exp": 1722503600,       // Expire dans 1 heure
  "jti": "unique-id-xyz"   // ID unique pour revocation
}
```

### Cas réel : la fuite de Dropbox (2016)

Un employé de Dropbox réutilisait ses mot de passe personnel sur plusieurs services. Quand LinkedIn subit une fuite, le mot de passe fut crackable. L'attaquant utilisa ce mot de passe pour accéder à Dropbox, généra un token API valide, et avait accès complet pendant **plusieurs mois** avant détection.

**Ce qui manquait :**
- ❌ Pas de MFA obligatoire
- ❌ Pas de notification quand un nouveau token était créé
- ❌ Pas d'IP whitelist sur les tokens
- ❌ Pas de rate limiting sur la création de tokens

**La correction :**
- ✅ MFA obligatoire pour les comptes privilégiés
- ✅ Notification + validation par email quand token créé
- ✅ Token limité à une IP source ou range CIDR
- ✅ Rate limit : max 5 tokens créés par jour

---

## Autorisation : du RBAC au Zero Trust

L'authentification dit "*qui tu es*". L'autorisation dit "*que peux-tu faire*".

### Erreur classique : IDOR (Insecure Direct Object References)

```python
# ❌ Code vulnérable
@app.get("/api/invoices/{invoice_id}")
def get_invoice(invoice_id: int, current_user: User = Depends(get_current_user)):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    return invoice

# Attaquant authentifié en tant que user 100
# Demande GET /api/invoices/999 (facture d'un concurrent)
# → Obtient la facture sans contrôle d'ownership
```

**Pourquoi ça marche ?**
- L'endpoint vérifie l'**authentification** (token valide)
- Mais pas l'**autorisation** (le user 100 n'est pas propriétaire de la facture 999)
- C'est une erreur de logique simple → présente dans ~50% des APIs en prod

**Correction — Vérifier l'ownership :**

```python
# ✅ Sécurisé
@app.get("/api/invoices/{invoice_id}")
def get_invoice(invoice_id: int, current_user: User = Depends(get_current_user)):
    invoice = db.query(Invoice).filter(
        Invoice.id == invoice_id,
        Invoice.user_id == current_user.id  # ← Vérification d'ownership
    ).first()
    
    if not invoice:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    return invoice
```

### Escalade verticale vs horizontale

```
Escalade VERTICALE (user → admin)
├─ Cas : attaquant change son role de "user" à "admin" en manipulant le token
├─ Détection : audit logs de changement de role
└─ Exemple : JWT modifié (alg=none) ou session tamponnée en DB

Escalade HORIZONTALE (user A → user B, même niveau)
├─ Cas : IDOR — accès aux données d'un autre user du même niveau
├─ Détection : pattern d'accès impossible (user 100 accède ressources user 101-500)
└─ Exemple : GET /api/users/101/profile au lieu de /api/users/100/profile
```

### Architecture RBAC : les trois niveaux

```
┌─ NIVEAU 1 : Contrôle simple (API basique)
│  Roles : ["user", "admin"]
│  Vérif : if current_user.role == "admin" → permet, sinon refuse
│  Risque : pas de granularité, escalade simple
│
├─ NIVEAU 2 : RBAC (Role-Based Access Control) — standard
│  Roles : ["viewer", "editor", "owner", "admin"]
│  Permissions : 
│    ├─ viewer   : GET /posts
│    ├─ editor   : GET /posts + POST /posts
│    ├─ owner    : GET /posts + POST/PUT/DELETE son propre /posts
│    └─ admin    : GET/POST/PUT/DELETE tous les /posts
│  Implémentation : table roles_permissions
│  Risque : oublier d'ajouter une permission → découverte progressive de vulnérabilités
│
└─ NIVEAU 3 : ABAC (Attribute-Based Access Control) — granulaire
   Conditions : role + temps + IP + deviceid + resourceTag + ...
   Exemple :
     "user peut modifier son post SAUF 24h après création"
     "admin peut voir tous les posts SAUF les données sensibles"
     "API key depuis IP 203.0.113.0/24 peut faire GET uniquement"
   Risque : complexité exponentielle, bugs dans les conditions logiques
```

🧠 **Concept clé — Principle of Least Privilege :** Chaque token/user reçoit le **minimum** de permissions nécessaire pour sa fonction. Pas "admin" par défaut, puis "retirer les droits", mais "viewer" par défaut, puis "ajouter explicitement".

### Zero Trust appliqué aux APIs

Zero Trust = "*Trusted network ou device n'existe pas. Tout doit être vérifié.*"

Pour une API, ça signifie :

```
❌ Ancien modèle (périmètre)
└─ API interne = de confiance
   └─ Pas d'authentification obligatoire
   └─ Pas de chiffrement inter-services
   └─ Un accès réseau → accès complet API

✅ Zero Trust pour API
├─ Toute requête authentifiée (même inter-services)
│  └─ Certificat client (mTLS) ou token avec TTL court
├─ Toute requête autorisée explicitement
│  └─ Vérifier role + scope au lieu de "faire confiance au service qui appelle"
├─ Segmentation réseau + application
│  └─ Firewall entre zones (frontend ↔ API ↔ DB)
└─ Audit de chaque accès
   └─ Logs centralisés, alertes sur patterns anormaux
```

**Implémentation concrète d'une API Zero Trust :**

```
Requête reçue : GET /api/orders/42

1. AUTHENTIFICATION
   ├─ Extraire Bearer token du header
   ├─ Vérifier signature JWT
   └─ Vérifier exp, iat, jti (pas d'expiration passée, pas de replay)

2. AUTORISATION
   ├─ Décoder le JWT → récupérer user_id et roles
   ├─ Vérifier role inclut "order_reader"
   ├─ Vérifier scope inclut le domaine de ressource (orders)
   └─ Vérifier ownership : user_id == order.user_id

3. ISOLATION DONNÉE
   ├─ Requête DB filtrée par user_id
   ├─ Champs sensibles (pricing_cost) excluded
   └─ Timestamp d'accès enregistré

4. AUDIT
   ├─ Log : user_id, ip, resource, timestamp, résultat (200 ou 403)
   └─ Alerte si : même user 100 accès ressources d'autres users
```

---

## Injection et validation

L'injection est le vecteur #1 exploité contre les APIs. Pourquoi ? Parce que beaucoup de devs font confiance à la base de données ou au langage de templating pour "se protéger tout seul".

### Comment ça marche : la chaîne de confiance brisée

```python
# Attaquant envoie :
POST /api/users
{"email": "test@test.com'; DROP TABLE users;--"}

# Le code (naïf) fait :
query = f"INSERT INTO users (email) VALUES ('{email}')"
# → "INSERT INTO users (email) VALUES ('test@test.com'; DROP TABLE users;--')"

db.execute(query)  # ❌ Deux commandes SQL exécutées !
```

**C'est pas juste SQL.** L'injection fonctionne sur :
- **SQL** : requête modifiée
- **NoSQL** : document manipulation (`{"$ne": null}`)
- **LDAP** : filtre modifié
- **OS Command** : exécution arbitraire (`; rm -rf /`)
- **Template** : Server-Side Template Injection (SSTI)
- **XPath** : requête XML modifiée
- **Headers HTTP** : response splitting (CRLF injection)

### Défense : validation + parameterized queries

🔒 **Contrôle de sécurité — Input validation (whitelist)** :

```python
import re
from pydantic import BaseModel, validator

class UserCreate(BaseModel):
    email: str
    age: int
    country_code: str
    
    @validator('email')
    def email_valid(cls, v):
        # Whitelist : emails sont simples
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', v):
            raise ValueError('Invalid email format')
        if len(v) > 254:  # RFC 5321
            raise ValueError('Email too long')
        return v
    
    @validator('age')
    def age_valid(cls, v):
        if not (0 <= v <= 150):
            raise ValueError('Age must be 0-150')
        return v
    
    @validator('country_code')
    def country_valid(cls, v):
        # Whitelist stricte : codes pays ISO
        allowed = ['FR', 'DE', 'US', 'GB', 'JP', 'CN', 'IN', 'BR']
        if v not in allowed:
            raise ValueError(f'Invalid country. Allowed: {allowed}')
        return v

# Pydantic rejette automatiquement les données invalides
# → Impossible d'injecter du code SQL ou des commandes OS
```

**Pourquoi la validation à elle seule ne suffit pas :**

Même avec validation stricte, une query SQL construite avec concatenation est vulnérable :

```python
# ❌ Mauvais, même avec validation
email_validated = "test@example.com"  # ✅ Validé
query = f"SELECT * FROM users WHERE email = '{email_validated}'"
# Si la validation regex était bypass (0-day), ça passerait quand même

# ✅ Bon — Parameterized query (prepared statement)
query = "SELECT * FROM users WHERE email = ?"
db.execute(query, (email_validated,))
# La DB traite email_validated comme DATA, pas comme COMMANDE
```

**Règle d'or :** `validation + parameterized queries`. Pas l'un ou l'autre, les deux.

### Cas réel : Equifax breach (2017)

Une application Apache Struts utilisée pour importer des fichiers contenait une **vulnérabilité RCE d'injection OGNL** (Object Graph Navigation Language). Un attaquant envoyait :

```
POST /ajax/ses
Content-Type: application/x-www-form-urlencoded

_name=${(#_memberAccess=@ognl.OgnlContext@DEFAULT_MEMBER_ACCESS).(@java.lang.Runtime@getRuntime().exec('id'))}
```

Sans validation côté serveur, le moteur de templating Struts **exécutait** la commande arbitraire. L'attaquant avait RCE, accédait à la DB principale, et exfiltraient des données de **147 millions de personnes** (SSN, dates de naissance, adresses).

**Pourquoi c'était possible :**
- ❌ Pas de validation sur le paramètre `_name`
- ❌ Pas de blacklist des caractères dangereux (${, @)
- ❌ Moteur de templating configured trop permissif
- ❌ Pas de tests de sécurité (fuzzing sur le paramètre)

**Ce qui aurait arrêté l'attaque :**
- ✅ Whitelist stricte : `_name` doit être alphanumeric + underscore uniquement
- ✅ Désactiver les expressions OGNL dans les paramètres utilisateur
- ✅ Content Security Policy header (CSP) — limiter l'exécution inline
- ✅ WAF (Web Application Firewall) avec règle OWASP CRS pour détecter OGNL

---

## Gestion des secrets

### Les secrets que vous oubliez

Tout ce qui authentifie ou autorise doit être secret :

| **Secret** | **Où il se retrouve** | **Impact si leaked** |
|---|---|---|
| DB password | `.env`, config files, Docker Compose | Accès complet base + données historiques |
| JWT signing key | Code source, deploiement | Forge de tokens valides pour toujours |
| API key interne | Logs, dépôt Git, cache | Accès lateral à autres APIs, systèmes |
| TLS private key | File system mal protégé | Déchiffrement HTTPS histourique + MITM futur |
| OAuth2 client_secret | Frontend (❌❌❌), config publique | Usurpation d'identité OAuth |
| Encryption key | Hardcodé, version control | Déchiffrement données sensibl |

🔴 **Vecteur d'attaque — GitHub commit avec credentials :** Développeur committe accidentellement :

```bash
git log --all --full-history -- .env | grep password
```

Un attaquant scrape GitHub en temps réel, trouve le commit, et rewind 2 ans d'historique pour extraire tous les secrets jamais changés.

### Pattern dangereux

```python
# ❌ JAMAIS
DB_PASSWORD = "supersecret123"  # En dur dans le code

# ❌ JAMAIS
with open('.env') as f:
    env_vars = f.read()  # Fichier en plain text sur disk

# ❌ JAMAIS
os.environ.get('DB_PASSWORD', 'fallback_hardcoded_value')  # Fallback exposé

# ❌ JAMAIS
logger.debug(f"Connecting to {DB_HOST} as {DB_USER}:{DB_PASSWORD}")  # Dans les logs

# ✅ BON
DB_PASSWORD = os.getenv('DB_PASSWORD')
if not DB_PASSWORD:
    raise ValueError("DB_PASSWORD not set in environment")

# ✅ BON (pour secrets à rotation fréquente)
from hvac import Client
vault = Client(url='https://vault.example.com:8200')
secret = vault.secrets.kv.read_secret_version(path='database/config')
db_password = secret['data']['data']['password']
```

### Checklist : gestion des secrets en production

| **Étape** | **Action** | **Outil typique** |
|---|---|---|
| **Stockage** | Secrets en gestionnaire centralisé, pas en code/config | Vault, AWS Secrets Manager, Azure Key Vault |
| **Rotation** | Changement automatique périodiquement (tous les 30-90 j) | Vault dynamic secrets, AWS Lambda rotation |
| **Distribution** | Au runtime via env vars ou API, jamais en fichier | Docker/K8s secrets, environment injection |
| **Audit** | Log chaque accès au secret (quand, qui, pour quoi) | Vault audit logs, CloudTrail |
| **Révocation** | Instant blacklist si compromise détectée | Vault revoke, token blacklist |
| **Chiffrement** | En transit (TLS) + au repos (vault encryption) | TLS 1.2+, vault seal/unseal |

**Exemple : rotation de secrets avec Vault**

```bash
# Configuration Vault (une fois)
vault write database/config/postgresql \
  plugin_name=postgresql-database-plugin \
  allowed_roles="readonly,admin" \
  connection_url="postgresql://{{username}}:{{password}}@db.example.com/myapp" \
  username="vault_admin" \
  password="vault_admin_password"

vault write database/roles/readonly \
  db_name="postgresql" \
  creation_statements="CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}';" \
  default_ttl="1h" \
  max_ttl="24h"

# Au runtime — l'app demande un secret
# Vault génère automatiquement un nouveau user + password
# Expire dans 1h → Application doit se ré-authentifier
curl -H "X-Vault-Token: $VAULT_TOKEN" \
  https://vault.example.com:8200/v1/database/static-creds/readonly
# Réponse :
# {
#   "username": "v-approle-readonly-xyz123",
#   "password": "Txu2q-7vqxwzH4n2K8mJ"  ← nouveau + temporaire
# }
```

⚠️ **Erreur fréquente — Logging de credentials :** Une exception non filtrée logue l'en-tête `Authorization` ou les paramètres de requête :

```python
# ❌ Mauvais
@app.middleware("http")
async def log_requests(request, call_next):
    logger.info(f"Request: {request.headers}")  # ← Bearer token exposé
    response = await call_next(request)
    return response

# ✅ Bon
@app.middleware("http")
async def log_requests(request, call_next):
    headers = dict(request.headers)
    headers['authorization'] = '***REDACTED***'  # ← Filtrer avant log
    logger.info(f"Request headers: {headers}")
    response = await call_next(request)
    return response
```

---

## Rate limiting et DDoS applicatif

Rate limiting = "*Limiter le nombre de requêtes par user/IP/clé dans une fenêtre de temps*".

C'est un contrôle de disponibilité, pas de confidentialité. Il rend inutile l'attaque par "force brute" (brute force password guessing, token enumeration, ressource enumeration).

### Pourquoi c'est décisif

```
Attaquant sans rate limiting :
  → 10 000 requêtes/sec sur /api/login
  → Test 10M de combinaisons (password + email)
  → Durée : 1000 secondes = 16 minutes
  → Détection : trop tard, compte compromis

Attaquant avec rate limiting (100 req/min) :
  → Max 100 tentatives de login par minute
  → Pour tester 10M combinaisons : 100 000 minutes = 69 jours
  → Après 10 échecs en 5 min : alarme, account lock
  → Attaque inutile, passe à une autre cible
```

### Stratégies de rate limiting

| **Stratégie** | **Granularité** | **Cas d'usage