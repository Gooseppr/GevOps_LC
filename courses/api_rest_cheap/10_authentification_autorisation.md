---
layout: page
title: "Authentification & Autorisation dans les API REST"

course: "API REST"
chapter_title: "Sécurité"

chapter: 2
section: 1

tags: authentification,autorisation,jwt,oauth2,rbac,tokens,api-security
difficulty: intermediate
duration: 75
mermaid: true

icon: "🔐"
domain: "sécurité applicative"
domain_icon: "🛡️"
status: "published"
---

# Authentification & Autorisation dans les API REST

## Objectifs pédagogiques

À la fin de ce module, vous serez capable de :

1. **Identifier** les vecteurs d'attaque spécifiques aux API (token theft, privilege escalation, brute force) et les distinguer des attaques web classiques
2. **Concevoir** un schéma d'authentification robuste : choix entre Basic, Bearer, OAuth2 ; gestion des tokens ; renouvellement et révocation
3. **Implémenter** une autorisation granulaire (RBAC, scopes) qui protège réellement les données sans bloquer les flux métier
4. **Détecter** les mauvaises configurations en audit : tokens trop longs, permissions trop larges, absence de signature, logs non filtrés
5. **Opérer** en production : rotation de secrets, détection d'accès anormaux, réponse à compromission de token

---

## Mise en situation

**Janvier 2022 — Incident Okta (CVE-2022-0391 et incidents connexes)**

Une API interne Okta exposant des données de session a été compromis. L'attaquant a utilisé un **compte de support privilégié non rotationné depuis 2 ans** pour accéder à un système d'administration. Sans authentification multi-facteur et sans audit granulaire des accès, la durée du vol a atteint plusieurs semaines.

**Impact initial :**
- Accès à des tokens de session valides
- Escalade de privilèges vers des comptes administrateurs
- Extraction de données client

**Pourquoi la sécurité naïve a échoué :**

| Contrôle mis en place | Raison de l'échec |
|----------------------|------------------|
| Authentification par mot de passe | Crédentials du compte de support réutilisées, jamais rotées |
| Logs d'accès présents | Non surveillés en temps réel ; alertes levées 3 semaines après compromission |
| Tokens avec expiration | Tokens de session extrêmement longs (90+ jours) |
| Permissions basées sur rôles | Un compte support avait accès à TOUTES les données ; pas de segmentation |

**Leçon :** L'authentification ne suffit pas. Sans révocation rapide, sans audit continu, sans principe de moindre privilège, une seule clé compromis peut paralyser l'entreprise entière.

---

## Surface d'attaque : qu'est-ce qui est réellement exposé

Une API REST expose plusieurs niveaux d'authentification et d'autorisation. Chacun est un vecteur potentiel :

| Vecteur | Exposition | Impact potentiel | Détectabilité |
|---------|-----------|------------------|---------------|
| **Token dans une URL GET** | Visible en clair dans les logs HTTP, les historiques du navigateur, les proxies | Vol de credentials, rejeu illimité | Très élevée (historiques navigateur) |
| **Token sans signature (opaque)** | Serveur ne peut pas vérifier l'intégrité ; dépend de la BD de sessions | Si la BD est compromise, tous les tokens sont forgés | Moyenne (nécessite breakin initial) |
| **JWT avec `alg: none`** | Accepte les tokens non signés | Escalade de privilèges triviale | Très élevée (payload JWT lisible) |
| **Token sans expiration ou expiration > 1 an** | Chaque token est une clé maîtresse permanente | Réutilisation infinie, même après révocation d'un compte | Basse (nécessite inspection du token) |
| **Permissions sans vérification côté serveur** | Client contrôle son propre scope via query param ou header modifié | Accès à des données non autorisées (IDOR, escalade) | Élevée (écarts de données visibles) |
| **Pas de rate limiting sur authentification** | Brute force illimité sur tokens ou credentials | Compromission par énumération | Élevée si logs sont surveillés |
| **Secret partagé (clé symétrique) entre client et serveur** | Si client est compris, tous les tokens du système sont compromis | Rejeu de tokens, forgerie de JWT | Dépend du client (mobile, web, etc.) |
| **Credentials en Authorization header sans HTTPS** | Interception en clair sur réseau non chiffré | Vol immédiat | Très élevée |

⚠️ **Point clé :** Contrairement à une application web classique (cookies + sessions dans la mémoire du serveur), une API REST **repose entièrement sur la validité et l'intégrité du token**. Si le token est valide, l'API l'accepte — peu importe d'où la requête vient.

---

## Comment l'attaque fonctionne réellement

### Étape 1 : Obtenir un token valide

Un attaquant n'a généralement pas besoin d'attaquer le mécanisme cryptographique. Il va plutôt :

**1a. Vol de token en transit (réseau non chiffré)**
```
Client → Attaquant sur le réseau → API
Commande tcpdump sur un WiFi non sécurisé :

$ sudo tcpdump -i eth0 -A 'tcp port 80' | grep -i authorization
GET /api/users HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWI...
```

Le token est en clair dans chaque requête. L'attaquant l'extrait et le rejoue.

**1b. Token exposé dans les logs ou les erreurs**

```python
# ❌ Dangereux : token en clair dans les exceptions
@app.get("/api/protected")
def protected(auth_header: str):
    try:
        token = auth_header.replace("Bearer ", "")
        user = validate_token(token)
    except Exception as e:
        logger.error(f"Auth failed: {auth_header}")  # ← TOKEN LOGGÉ
        return {"error": str(e)}
```

Les logs applicatifs sont souvent moins bien protégés que la mémoire. Un attaquant qui accède aux logs (via une LFI, un breakin sur le serveur, ou une mauvaise config AWS S3) récupère les tokens.

**1c. Token stocké de manière insécurisée côté client**

```javascript
// ❌ Token en localStorage (XSS → vol)
localStorage.setItem("token", response.data.access_token);

// ✅ Token en memory ou cookie HttpOnly
// (mais : XSS peut toujours faire des requêtes)
document.cookie = `token=${token}; HttpOnly; Secure; SameSite=Strict`;
```

**1d. Brute force sur l'endpoint d'authentification**

```bash
# Pas de rate limiting : l'attaquant énumère les tokens
for i in {1..1000000}; do
  curl -s "https://api.example.com/auth/token" \
    -d "{\"user_id\": $i, \"password\": \"admin\"}" \
    | grep -q "token" && echo "Found token for user $i"
done
```

### Étape 2 : Réutiliser le token pour accéder à des données

Une fois en possession du token, l'attaquant l'utilise directement :

```bash
# Attaquant se fait passer pour l'utilisateur original
curl -H "Authorization: Bearer <STOLEN_TOKEN>" \
  https://api.example.com/api/users/<TARGET_ID>/data

# Réponse : données de la victime, car le token est valide
```

### Étape 3 : Escalade de privilèges (si tokens mal conçus)

**Cas 1 : JWT avec `alg: none`**

```
Token original : 
eyJhbGciOiAibm9uZSIsICJ0eXAiOiAiSldUIn0.
eyJzdWIiOiAidXNlciIsICJyb2xlIjogImFkbWluIn0.

Attaquant le modifie à la main (base64url) :
- Change "role": "user" → "role": "admin"
- Envoie le token modifié sans signature

Serveur vérifie : alg=none → pas de vérification de signature → ✅ accepté
```

**Cas 2 : JWT avec secret par défaut**

```bash
# Secret : "secret" (trouvé dans la doc ou le code source)
# Attaquant utilise https://jwt.io pour créer un token

echo '{
  "alg": "HS256",
  "typ": "JWT"
}' | base64url

echo '{
  "sub": "admin",
  "role": "admin",
  "exp": 1893456000
}' | base64url

# Signe avec secret "secret" → token forgé accepté par le serveur
```

**Cas 3 : Permissions basées sur des paramètres client contrôlés**

```bash
# Requête d'une API mal sécurisée
curl "https://api.example.com/api/users/123/data?user_id=456"
# L'API se fie au paramètre query "user_id" au lieu de lire le token
# Attaquant peut accéder aux données de n'importe quel user
```

---

## Concept fondamental : Authentification vs Autorisation

Ces deux termes sont **souvent confondus** dans les API REST mal sécurisées. Comprendre la différence est critique.

### Authentification : "Qui es-tu ?"

L'authentification **établit l'identité** du client. Elle répondsponds à : "Es-tu vraiment cet utilisateur ?"

**Mécanismes courants :**

| Mécanisme | Comment ça marche | Sécurité | Cas d'usage |
|-----------|-------------------|---------|-----------|
| **HTTP Basic** | `Authorization: Basic base64(user:password)` | ⚠️ Faible (se fait brute-forcer) | Dev local, systèmes legacy |
| **Bearer Token** | `Authorization: Bearer <TOKEN>` | ✅ Fort si token non-forgeable | APIs modernes, OAuth2 |
| **API Key** | `X-API-Key: <KEY>` ou header custom | Dépend de la rotation | Microservices internes |
| **OAuth2 / OIDC** | Redirection vers IdP, obtention d'un code, puis token | ✅ Très fort (délégation) | Web SPA, mobile, intégrations tierces |

**🧠 Concept clé :** L'authentification forte nécessite une **vérification en deux étapes** :
1. Présenter une preuve d'identité (token, certificat, password)
2. Serveur **valide** cette preuve (signature valide, non expirée, non révoquée)

### Autorisation : "As-tu le droit ?"

L'autorisation **contrôle l'accès aux ressources**. Elle répondsponds à : "Es-tu autorisé à accéder à cette ressource ou cette action ?"

**Modèles courants :**

| Modèle | Principe | Sécurité | Complexité |
|--------|----------|---------|-----------|
| **ACL (Access Control List)** | Chaque ressource liste les utilisateurs qui y ont accès | ✅ Très fin, mais O(n) | Haute |
| **RBAC (Role-Based)** | `user.role` → permissions prédéfinies | ✅ Bon compromis | Moyenne |
| **ABAC (Attribute-Based)** | Règles : `if user.department == resource.owner.department then allow` | ✅ Très flexible | Très haute |
| **Scopes (OAuth2 style)** | Token limité à `read:users`, `write:posts`, etc. | ✅ Bon pour délégation | Basse |

**Piège courant :** Une API vérifie que vous êtes authentifiés (`if token_valid`), mais **ne vérifie jamais** votre autorisation (`if user.role == "admin"`).

```python
# ❌ Dangereux : authentification sans autorisation
@app.get("/api/admin/users")
def list_users(token: str = Depends(verify_token)):
    # Vérifie uniquement que le token est valide
    # N'importe quel utilisateur authentifié voit tous les users
    return db.query(User).all()

# ✅ Sécurisé : vérification du rôle
@app.get("/api/admin/users")
def list_users(current_user: User = Depends(verify_token_and_get_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")
    return db.query(User).all()
```

---

## Schémas d'authentification pour les APIs REST

### HTTP Basic Auth (déconseillé en production)

**Mécanisme :** Chaque requête inclut `Authorization: Basic base64(username:password)`.

```bash
curl -u "user:password" https://api.example.com/api/resource
# Sous le capot :
# Authorization: Basic dXNlcjpwYXNzd29yZA==
```

**Avantages :**
- Simple, aucune session à gérer
- Natif dans HTTP

**Risques majeurs :**
- Credentials en clair dans chaque requête (si pas HTTPS, vol immédiat)
- Aucun moyen de révoquer un accès sans changer le password
- Brute force efficace : `Attacker → curl https://api.example.com/api/ -u user:password_attempt`

🔴 **Vecteur d'attaque réel :** En 2020, un chercheur a trouvé **700+ APIs publiques utilisant HTTP Basic** en production (certaines sans HTTPS). L'énumération de credentials était triviale.

**⚠️ Erreur fréquente :**

```python
# ❌ Accepter HTTP Basic sans rate limiting
@app.get("/api/auth/login", dependencies=[Depends(verify_basic_auth)])
def login():
    return {"status": "ok"}

# Attaquant : 10 requêtes/sec × 1M de mots de passe = craquage garanti en heures
```

**Correction :**
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.get("/api/auth/login", dependencies=[Depends(verify_basic_auth)])
@limiter.limit("5/minute")
def login(request: Request):
    return {"status": "ok"}
```

---

### Bearer Tokens (standard moderne)

**Mécanisme :** Le client obtient un token opaque ou structuré (JWT), puis l'inclut dans chaque requête.

```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  https://api.example.com/api/resource
```

**Variante 1 : Tokens opaques (gérés par le serveur)**

```
Client
  ↓
POST /auth/login (credentials)
  ↓
Serveur crée une session, retourne token aléatoire : "abc123xyz"
  ↓
Client stocke "abc123xyz"
  ↓
Client envoie : GET /api/resource, Authorization: Bearer abc123xyz
  ↓
Serveur cherche "abc123xyz" en cache/BD → retrouve la session → ✅ accepte
```

**Avantages :**
- Révocation instantanée (supprimer la session en BD)
- Serveur a le contrôle total

**Inconvénients :**
- Nécessite une requête BD par API call (performance)
- État serveur : impossible à scaler horizontalement sans état partagé

**Variante 2 : JWT (tokens signés, stateless)**

```
Client
  ↓
POST /auth/login (credentials)
  ↓
Serveur crée un JWT signé : header.payload.signature
  ↓
Serveur retourne le JWT au client
  ↓
Client envoie : GET /api/resource, Authorization: Bearer <JWT>
  ↓
Serveur vérifie la signature avec sa clé secrète → ✅ accepte
```

**Avantages :**
- Pas d'état serveur, ultra-scalable
- Token peut contenir des claims (user_id, role, scopes)
- Pas de requête BD pour chaque vérification

**Risques spécifiques au JWT :**

| Risque | Mécanisme | Conséquence |
|--------|-----------|------------|
| **Algorithme `none`** | JWT accepte `alg: none` (pas de signature) | N'importe qui forge un token valide |
| **Secret faible** | Secret = "secret" ou généré par MD5(username) | Brute force du secret, token forgé |
| **Expiration oubliée** | Token sans `exp` claim | Token valide indéfiniment |
| **Révocation impossible** | Token signé = pas de BD pour le bloquer | Même après suppression de compte, token reste valide |
| **Claims non vérifiés côté serveur** | Client envoie `role: admin` dans le JWT, serveur le croit | Escalade de privilèges triviale |

---

## Configuration sécurisée d'un JWT

### Structure d'un JWT bien formé

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyNDI2MjIsImlzcyI6ImFwaS5leGFtcGxlLmNvbSJ9.signature

Décodé :
Header:
{
  "alg": "HS256",         ← ✅ Algorithme signé (pas "none")
  "typ": "JWT"
}

Payload:
{
  "sub": "1234567890",    ← Sujet (user ID)
  "name": "John Doe",
  "iat": 1516239022,      ← ✅ Émis à (timestamp)
  "exp": 1516242622,      ← ✅ Expire à (1 heure après iat)
  "iss": "api.example.com" ← Émetteur (validation du serveur d'origine)
}

Signature: HMAC-SHA256(header.payload, secret_key)
```

### Checklist de configuration sécurisée

```python
import jwt
from datetime import datetime, timedelta
from secrets import token_urlsafe

# ✅ 1. Clé secrète forte et unique
SECRET_KEY = token_urlsafe(32)  # 256 bits
# ⚠️ Ne JAMAIS : SECRET_KEY = "secret" ou "admin123"

# ✅ 2. Créer un JWT avec tous les claims obligatoires
def create_access_token(user_id: str, role: str, expires_delta: timedelta = None):
    if expires_delta is None:
        expires_delta = timedelta(hours=1)  # ✅ Court (1 heure)
    
    expire = datetime.utcnow() + expires_delta
    
    payload = {
        "sub": user_id,              # ✅ Sujet (user ID uniquement, pas de secrets)
        "role": role,                # ✅ Role (mais VÉRIFIER côté serveur)
        "iat": datetime.utcnow(),    # ✅ Émis à
        "exp": expire,               # ✅ Expire à
        "iss": "api.example.com",    # ✅ Émetteur
        "jti": token_urlsafe(16)     # ✅ ID unique du token (pour révocation)
    }
    
    encoded_jwt = jwt.encode(
        payload,
        SECRET_KEY,
        algorithm="HS256"  # ✅ Jamais "none"
    )
    return encoded_jwt

# ✅ 3. Vérifier le JWT
def verify_access_token(token: str):
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=["HS256"],  # ✅ Explicite : seulement HS256
            options={"verify_signature": True}  # ✅ Force la vérification
        )
        
        user_id = payload.get("sub")
        if user_id is None:
            raise ValueError("Invalid token: missing 'sub'")
        
        return payload
    
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidSignatureError:
        raise HTTPException(status_code=401, detail="Invalid signature")
    except jwt.DecodeError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ✅ 4. Implémenter la révocation (pour les cas critiques)
# Maintenir une liste noire (Redis avec TTL = expiration du token)
revocation_list = {}  # {jti: expiration_time}

def revoke_token(jti: str, expiration: datetime):
    revocation_list[jti] = expiration

def is_token_revoked(jti: str):
    return jti in revocation_list

# ✅ 5. Utiliser le token dans une dépendance FastAPI
from fastapi import Depends, HTTPException, status

async def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = verify_access_token(token)
    
    # ✅ Vérifier que le token n'est pas révoqué
    if is_token_revoked(payload.get("jti")):
        raise HTTPException(status_code=401, detail="Token revoked")
    
    return payload

# ✅ 6. Utiliser dans une route
@app.get("/api/protected")
async def protected_resource(current_user = Depends(get_current_user)):
    # current_user contient : {"sub": "user123", "role": "admin", ...}
    return {"message": f"Hello, {current_user['sub']}"}
```

### ⚠️ Erreurs fréquentes

**Erreur 1 : Accepter plusieurs algorithmes**

```python
# ❌ Dangereux
payload = jwt.decode(token, key, algorithms=["HS256", "RS256", "none"])
# Si "none" est dans la liste, attaquant envoie un JWT sans signature

# ✅ Sécurisé
payload = jwt.decode(token, key, algorithms=["HS256"])
```

**Erreur 2 : Stocker des secrets dans le JWT**

```python
# ❌ Dangereux (password ou token en clair dans le JWT)
payload = {
    "user_id": "123",
    "password_hash": user.password,  # ← Visible en base64 !
    "api_key": "sk-1234567890"      # ← Visible en base64 !
}

# ✅ Sécurisé (seulement les identifiants)
payload = {
    "sub": "123",
    "role": "admin"
}
```

**Erreur 3 : Expiration trop longue**

```python
# ❌ Dangereux
expires_delta = timedelta(days=365)  # Un an !

# ✅ Sécurisé
expires_delta = timedelta(hours=1)   # 1 heure (renouvellement possible via refresh token)
```

**Erreur 4 : Se fier aux claims du client**

```python
# ❌ Dangereux
token = "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjogImFkbWluIn0.xxx"
# Attaquant crée un JWT avec role=admin, et même s'il n'a pas la clé secrète,
# il peut envoyer un JWT avec alg=none

# ✅ Sécurisé
# Le serveur créé le JWT et contrôle les claims
# Le client ne peut que lire et envoyer ce qu'il a reçu
```

---

## Autorisation : Implémenter le contrôle d'accès

### RBAC (Role-Based Access Control) — l'approche standard

L'idée : chaque utilisateur a un rôle, chaque rôle a des permissions prédéfinies.

```python
# Modèle de données
class User(Base):
    id: int
    username: str
    role: str  # "admin", "editor", "viewer"

# Permissions statiques
ROLE_PERMISSIONS = {
    "admin": ["read:users", "write:users", "delete:users", "read:posts", "write:posts", "delete:posts"],
    "editor": ["read:users", "read:posts", "write:posts"],
    "viewer": ["read:users", "read:posts"]
}

# Middleware de vérification
def require_permission(required_perm: str):
    async def check_permission(current_user = Depends(get_current_user)):
        user_role = current_user.get("role")
        user_perms = ROLE_PERMISSIONS.get(user_role, [])
        
        if required_perm not in user_perms:
            raise HTTPException(
                status_code=403,
                detail="Insufficient permissions"
            )
        return current_user
    return check_permission

# Utilisation
@app.delete("/api/users/{user_id}")
async def delete_user(
    user_id: int,
    current_user = Depends(require_permission("delete:users"))
):
    # Seulement un admin peut arriver ici
    db.delete(User, user_id)
    return {"status": "deleted"}
```

**Avantages :** Simple, performant, facile à auditer.

**Limites :**
- Permissions "tout ou rien" : un rôle a accès à TOUS les posts ou AUCUN
- Impossible de donner un accès spécifique : "seulement sur les posts qu'il a créés"

### ABAC (Attribute-Based Access Control) — pour les cas complexes

Les permissions dépendent d'attributs : propriété de la ressource, département, etc.

```python
# Exemple : Un utilisateur peut éditer un post seulement s'il en est propriétaire
def require_resource_permission(resource_type: str, action: str):
    async def check_permission(
        resource_id: int,
        current_user = Depends(get_current_user)
    ):
        resource = db.get(resource_type, resource_id)
        user_id = current_user.get("sub")
        
        # Règles spécifiques par resource
        if resource_type == "post" and action == "write":
            if resource.author_id != user_id and current_user.get("role") != "admin":
                raise HTTPException(status_code=403, detail="Forbidden")
        
        return current_user
    return check_permission

# Utilisation
@app.put("/api/posts/{post_id}")
async def update_post(
    post_id: int,
    updates: PostUpdate,
    current_user = Depends(require_resource_permission("post", "write"))
):
    post = db.get(Post, post_id)
    post.update(updates)
    return post
```

**Avantages :** Très flexible, adapt aux cas métier complexes.

**Inconvénients :** Complexité accrue, nécessite une BD de règles, peut impacter la performance.

---

## OAuth2 & OpenID Connect — Délégation d'authentification

Pour les cas où l'API doit accepter des utilisateurs d'un système d'identité externe (Google, Okta, GitHub, etc.).

### Flux OAuth2 Authorization Code (Web SPA)

```
1. Utilisateur clique "Login with Google"
   ↓
2. SPA redirige vers : https://accounts.google.com/oauth/authorize?
   client_id=<YOUR_CLIENT_ID>&
   redirect_uri=https://yourapp.com/callback&
   scope=profile email&
   state=<RANDOM_STATE>
   ↓
3. Utilisateur se connecte chez Google
   ↓
4. Google redirige vers : https://yourapp.com/callback?
   code=<AUTH_CODE>&
   state=<SAME_STATE>
   ↓
5. SPA envoie le code au backend :
   POST /api/auth/callback
   { "code": "<AUTH_CODE>" }
   ↓
6. Backend appelle Google directement (pas le client) :
   POST https://oauth.googleapis.com/token
   {
     "code": "<AUTH_CODE>",
     "client_id": "<YOUR_CLIENT_ID>",
     "client_secret": "<YOUR_CLIENT_SECRET>"  ← Serveur seulement !
   }
   ↓
7. Google retourne un access token (et optional ID token)
   ↓
8. Backend crée sa propre session/JWT et retourne au client
```

**🧠 Concept clé :** Le `client_secret` **ne doit jamais quitter le serveur**. C'est pourquoi les applications mobiles n'utilisent pas de `client_secret` — elles utilisent PKCE (Proof Key for Code Exchange) à la place.

**Implémentation simplifié en FastAPI + Google OAuth2**

```python
from fastapi import FastAPI
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from google.oauth2 import service_account
import google.auth.transport.requests

app = FastAPI()

# Configuration
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = "https://yourapp.com/api/auth/callback"

oauth2_scheme