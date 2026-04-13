```yaml
---
layout: page
title: "Sécurité avancée des API REST"

course: API REST
chapter_title: "Sécurité avancée"

chapter: 6
section: 1

tags: authentification, autorisation, chiffrement, jwt, oauth2, secrets, architecture, hardening
difficulty: advanced
duration: 240
mermaid: true

icon: "🔐"
domain: "Sécurité"
domain_icon: "🛡️"
status: "published"
---

# Sécurité avancée des API REST

## Objectifs pédagogiques

À la fin de ce module, vous serez capable de :

1. **Identifier** les surfaces d'attaque spécifiques aux API REST en production et évaluer leur exposition réelle
2. **Concevoir** une architecture d'authentification et d'autorisation robuste (OAuth2, JWT, mTLS) en fonction du contexte de menace
3. **Implémenter** des contrôles de détection et de durcissement qui ne dégradent pas la performance (rate limiting, validation, secrets)
4. **Auditer** une API existante avec des outils offensifs (Burp Suite, curl, SQLMap) et corriger les vulnérabilités trouvées
5. **Opérer** en continu : rotation de secrets, détection d'anomalies, réponse à incident sans downtime

---

## Mise en situation

### Le scénario : API compromise en production

**Juin 2024** — Une équipe backend découvre qu'une API "interne" servant les données clients a été exploitée pendant 8 jours sans détection. Historique :

- L'API utilise des **Bearer tokens JWT** sans signature valide (`alg: none`)
- Les logs d'accès révèlent des requêtes depuis des IPs inconnues, avec des tokens forgés
- Les secrets RDS (identifiants base de données) **étaient en dur dans le code** d'une fonction Lambda
- Pas de rate limiting : un bot a énuméré 150 000 endpoints en 3 heures
- Aucune segmentation réseau : une fois dans l'API, l'attaquant accédait directement au stockage S3

**Impact** : exfiltration de 2 millions d'enregistrements, données personnelles, contrats clients.

**Pourquoi la défense naïve ne suffit pas** :
- HTTPS seul : empêche l'écoute du trafic, pas la manipulation de requêtes valides
- "On a un WAF" : le WAF a bien laissé passer les requêtes — aucune signature malveillante
- "Les tokens sont chiffrés" : ils n'étaient jamais vérifiés à cause de `alg: none`
- "C'est une API interne" : c'était sur un sous-domaine publiquement accessible

Ce module couvre les 5 domaines qui auraient stoppé cet incident à chaque étape.

---

## Résumé pour les pressés

Les API REST héritent des menaces classiques (injection, CSRF, brute-force) et en introduisent de nouvelles : JWT forgés, token leakage dans les logs, secrets codés en dur, énumération d'endpoints, autorisation insuffisante. La défense passe par une architecture multiniveaux : authentification forte (OAuth2/mTLS, jamais `alg: none`), autorisation explicite par endpoint (RBAC granulaire), secrets isolés (vault, env vars, rotation), détection comportementale (rate limiting, alertes sur les ratios d'erreur 401/403), et tests offensifs réguliers (outils comme Burp, semgrep, trivy). Le compromis sécurité/performance se joue surtout sur le caching des tokens, la complexité du RBAC (vs envergure de l'API), et le coût opérationnel de la rotation de secrets.

---

## Surface d'attaque spécifique aux API

Les API REST exposent une surface différente des applications web classiques. Voici ce qui est réellement attaqué en production :

| **Vecteur d'attaque** | **Exposition** | **Impact direct** | **Détection naïve** |
|---|---|---|---|
| JWT forgeables (`alg: none` ou clé faible) | Token en clair dans Authorization header, visible au client | Accès impersoné sans limite | Pas visible en logs si requête valide HTTP |
| Secrets en dur (clés RDS, tokens API, certificats) | Codé dans le repo git, fichier .env commité, hardcoded string | Accès aux données sensibles sans 2FA | Git log historique reste accessible, même après suppression |
| Énumération d'endpoints | GET/POST sur /api/users, /api/admin, /api/customers sans rate limiting | Cartographie complète de l'API, découverte d'endpoints non documentés | Logs montrent 10k requêtes/minute, classé "trafic normal" |
| Injection SQL/NoSQL via paramètres d'URL ou body JSON | `GET /users?id=1 OR 1=1` | Lecture/écriture directe en base, exfiltration massive | Logs applicatifs muets si la requête HTTP est valide |
| Failles CORS impropre (`Access-Control-Allow-Origin: *`) | Requête cross-origin depuis un site attaquant | Vol de réponse contenant des données sensibles | Requête HTTP valide, CORS header croit à tort que c'est autorisé |
| Autorisation insuffisante (Broken Object Level Authorization) | `GET /api/invoices/123` accepte n'importe quel ID | Accès aux données d'autres clients | Requête syntaxiquement correcte, endpoint public supposé sûr |
| Token expiré ignoré | JWT sans `exp` ou vérification du claim ignoré | Session infinie, accès durable après révocation | Application oublie de checker l'expiration en base |
| Secrets dans les erreurs (stack traces) | 500 error avec filepath, variable d'env, SQL query en JSON | Révélation d'architecture, identifiants internes | Endpoint /logs ou /errors publiquement accessible |
| Client credentials leakés (Basic Auth en clair) | `Authorization: Basic base64(user:pass)` sur HTTP non chiffré | Accès au compte du client (SaaS, B2B) | Proxy intermédiaire log l'header |
| Rate limiting absent | Endpoint POST /login, GET /verify-code sans throttle | Brute-force de mots de passe, énumération d'utilisateurs | Défense pare-feu classique inefficace à cette échelle |

**En production**, ces vecteurs ne sont jamais seuls : ils forment une chaîne. Exemple réel (CVE-2023-46134) :
1. Énumération d'endpoint non documenté : `GET /api/v1/admin/export`
2. Pas d'authentification sur cet endpoint (oubli lors du refacto)
3. Export JSON retourne une stack trace avec une API key
4. API key utilisée pour accéder aux données clients

→ **Question critique avant de déployer** : "Quel secret pourrait fuir si cet endpoint échoue ? Et si on l'énumère via des typos dans l'URL ?"

---

## Modèle de menace : STRIDE appliqué aux API

```mermaid
graph TD
    A["Client (navigateur, app mobile)"] -->|HTTP/HTTPS| B["API Gateway<br/>(authentification, rate limit)"]
    B -->|Request validé| C["Microservice<br/>(logique métier)"]
    C -->|Query| D["Base de données<br/>(données sensibles)"]
    C -->|Upload| E["Stockage (S3)<br/>(documents, images)"]
    
    F["Attaquant"] -->|1. Forge JWT<br/>2. Énumère<br/>3. Injecte| B
    F -->|4. Brute-force<br/>5. Exfiltration| C
    F -->|6. Accès secrets| E
    
    G["Admin Panel"] -->|Token secret| C
    
    style F fill:#ff6b6b
    style B fill:#4ecdc4
    style C fill:#95e1d3
    style D fill:#f7dc6f
    style E fill:#f7dc6f
```

| **Menace (STRIDE)** | **Acteur** | **Vecteur** | **Contrôle-clé** |
|---|---|---|---|
| **S**poofing (identité) | Bot, usurpateur | JWT forgé, token réutilisé | Signature JWT valide + vérification `exp` + rotation token |
| **T**ampering (intégrité) | Proxy, MITM | Modification du body JSON en transit | HTTPS + intégrité vérifiée côté serveur (payload hash) |
| **R**epudiation (non-répudiation) | Utilisateur malveillant | "Je n'ai pas fait cette requête" | Logs horodatés + signature de la requête + audit trail |
| **I**nformation (confidentialité) | Énumérateur | Lecture d'endpoints, exposures de secrets | Autorisation explicite + rate limiting + log scrubbing |
| **D**enial of Service | Botnet | 1M requêtes/sec | Rate limiting + DDoS mitigation (AWS Shield, Cloudflare) |
| **E**levation of Privilege | Utilisateur standard | Accès endpoint admin via IDOR | RBAC granulaire + vérification ownership |

**Actifs critiques à protéger** (par ordre de priorité opérationnelle) :
1. **Secrets** (clés privées, credentials, tokens API) → confidentiel
2. **Tokens d'authentification** (JWT, OAuth2) → intégrité
3. **Données métier** (clients, contrats, paiements) → disponibilité + confidentialité
4. **Logs d'audit** (qui a accédé à quoi, quand) → immuabilité

**Scénarios les plus probables en entreprise** :
- Développeur commit un `.env` par erreur → secret recuperé en 24h par scanner sur GitHub
- Endpoint admin oublié lors du refacto → pas de vérification RBAC
- Token JWT expiré mais app continue à l'accepter → accès durable sans rotation

---

## Authentification avancée : Architecture et pièges

### JWT : Cas d'usage et catastrophes réelles

**Bon usage** : API stateless avec haute disponibilité (serverless, multi-région, pas de session centralisée).

**Mauvais usage** : Sécurité = "on utilise JWT" sans vérifier la signature.

#### Pièges majeurs de JWT

**🔴 Vecteur : `alg: none` accepté**

Le scénario classique (CVE-2015-9235, encore présent en 2024) :

```
Attaquant crée un token sans signature :
{
  "header": {"alg":"none"},
  "payload": {"user_id":"999","role":"admin"},
  "signature": ""
}
```

La lib JWT de beaucoup d'équipes a un mode "permissif" qui accepte `alg: none`. Résultat : n'importe qui peut forger un token valide.

```bash
# Attaquant teste
curl -H "Authorization: Bearer eyJhbGciOiJub25lIn0.eyJ1c2VyX2lkIjo5OTksInJvbGUiOiJhZG1pbiJ9." \
  https://api.example.com/api/admin/users

# Si la réponse est 200 (pas 401), c'est exploitable
```

**Correction obligatoire** : Vérifier `alg` avant d'accepter le token.

```python
# ❌ DANGEREUX
import jwt
token = request.headers.get("Authorization").replace("Bearer ", "")
payload = jwt.decode(token, options={"verify_signature": False})
# N'importe quel token est accepté

# ✅ SÉCURISÉ
payload = jwt.decode(
    token,
    SECRET_KEY,
    algorithms=["HS256"],  # Whitelist explicite
    options={"verify_signature": True}
)
# Si alg n'est pas dans la liste, lève une exception
```

⚠️ **Erreur fréquente** : Accepter `alg: RS256` et `alg: HS256` dans la même API. Si le code change d'algo, un attaquant forge avec HS256 en utilisant la clé publique.

**🔴 Vecteur : Clé secrète faible ou publique**

```bash
# Tester si une clé est faible : hashcat, John the Ripper
# Exemple : SECRET_KEY = "password123"
echo -n "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJyb2xlIjoidXNlciJ9.test" \
  | hashcat --mode 16500 hashes.txt wordlist.txt

# Si trouvé → clé cassée en secondes
```

En production, beaucoup d'équipes utilisent une clé **stockée en dur dans le code** :

```python
# ❌ Dans le repo git
SECRET_KEY = "my-secret-key-12345"

# ✅ Via secret manager
SECRET_KEY = os.environ.get("JWT_SECRET")  # Ou AWS Secrets Manager
```

**🔴 Vecteur : Expiration non vérifiée**

```python
# ❌ Oubli classique
payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
# Si le token n'a pas de claim "exp", aucune erreur n'est levée

# ✅ Correct
payload = jwt.decode(
    token,
    SECRET_KEY,
    algorithms=["HS256"],
    options={"verify_exp": True}  # Vérifie le claim exp
)
# Lève jwt.ExpiredSignatureError si expiré
```

Un token sans `exp` = session infinie. Un utilisateur révoqué reste accédé.

**🔴 Vecteur : Token dans les logs**

```python
# ❌ Dangereux
app.logger.info(f"Authorization header: {request.headers.get('Authorization')}")

# Stack trace d'une exception, si elle logue l'objet request :
try:
    process_payment()
except Exception as e:
    logger.error(f"Payment failed: {request}", exc_info=True)
    # request.headers.Authorization contient le token en clair
```

Si quelqu'un a accès aux logs (DevOps, service tiers, ex-employé), le token est compromis.

**Correction** : Filtrer les headers sensibles dans le logger.

```python
import logging

class SensitiveHeaderFilter(logging.Filter):
    def filter(self, record):
        # Remplace Authorization par ***REDACTED***
        if hasattr(record, "headers"):
            record.headers = str(record.headers).replace("Bearer ", "Bearer ***REDACTED***")
        return True

logging.getLogger().addFilter(SensitiveHeaderFilter())
```

### OAuth2 : Quand JWT ne suffit pas

**Cas d'usage** : Intégrations B2B, délégation d'accès (app tier peut accéder à API sans avoir le mot de passe utilisateur), révocation dynamique.

**Avantage clé par rapport à JWT** : Le serveur peut révoquer un token immédiatement (pas besoin d'attendre l'expiration).

#### Scénario réel : OAuth2 avec confusion d'algo

Une API B2B expose un endpoint d'échange de `client_credentials` pour que les partenaires obtiennent un access token :

```bash
# Partenaire demande un token
curl -X POST https://api.example.com/oauth/token \
  -d "grant_type=client_credentials&client_id=<PARTNER_ID>&client_secret=<SECRET>"

# Réponse :
{
  "access_token": "eyJhbGc...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

**Pièges courants** :

1. **Pas de vérification du `client_id` dans le token** → Partenaire A obtient un token, l'utilise pour accéder aux données de Partenaire B (jeton sans contexte).

2. **Token stocké en clair dans les logs partenaire** → Fuite locale chez le client.

3. **Pas de rotation forcée des `client_secret`** → Si exposé, accès infini.

**Défense OAuth2 appropriée** :

```python
# Lors de la génération du token
payload = {
    "client_id": client_id,
    "scope": "read:data write:data",  # Explicite ce qu'on peut faire
    "aud": "https://api.example.com",  # Audience ciblée
    "exp": int(time.time()) + 3600,
    "iat": int(time.time())
}

# Lors de la vérification
def verify_token(token):
    payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    
    # Vérifier que le token est fait pour CETTE API
    if payload["aud"] != "https://api.example.com":
        raise UnauthorizedError("Token for wrong audience")
    
    # Vérifier les scopes demandés
    if "write:data" not in payload["scope"]:
        raise ForbiddenError("Insufficient scope")
    
    return payload
```

---

## Autorisation : RBAC granulaire et IDOR

### Broken Object Level Authorization (IDOR)

**Définition technique** : Un endpoint accepte un paramètre ID, mais ne vérifie pas que l'utilisateur connecté peut accéder cet objet.

**Exemple réel (Airbnb, 2020)** :

```bash
# Utilisateur A est connecté (user_id = 123)
curl https://api.airbnb.com/api/reservations/5678

# Endpoint retourne la réservation (adresse, prix, détails)
# SANS vérifier que user_id 123 est propriétaire de la réservation 5678
```

**Pourquoi c'est courant** :

```python
# ❌ Code naïf
@app.get("/reservations/{reservation_id}")
def get_reservation(reservation_id: int, token: str):
    if not verify_token(token):
        return 401
    
    # On a oublié de vérifier la PROPRIÉTÉ
    reservation = db.query(Reservation).filter_by(id=reservation_id).first()
    return reservation

# ✅ Sécurisé
@app.get("/reservations/{reservation_id}")
def get_reservation(reservation_id: int, token: str):
    payload = verify_token(token)
    user_id = payload["user_id"]
    
    reservation = db.query(Reservation).filter_by(
        id=reservation_id,
        user_id=user_id  # Filtrer par propriétaire
    ).first()
    
    if not reservation:
        return 404  # Pas 403, pour ne pas révéler l'existence
    return reservation
```

**Test offensif pour IDOR** :

```bash
# 1. Obtenir un token pour utilisateur A
TOKEN_A=$(curl -X POST https://api.example.com/login \
  -d '{"email":"user_a@test.com","password":"pass"}' | jq -r '.token')

# 2. Accéder à son propre ID (devrait marcher)
curl -H "Authorization: Bearer $TOKEN_A" https://api.example.com/users/123

# 3. Changer l'ID pour celui d'un autre utilisateur
curl -H "Authorization: Bearer $TOKEN_A" https://api.example.com/users/124
# Si c'est 200 (pas 403), c'est une IDOR
```

### RBAC multi-niveaux

Pour éviter IDOR à grande échelle, une architecture RBAC clair est essentielle.

```python
# Modèle simple
class Permission:
    ROLES = {
        "user": ["read:own_data"],
        "admin": ["read:all_data", "write:all_data", "delete:all_data"],
        "moderator": ["read:all_data", "delete:user_posts"]
    }

def check_permission(payload, resource, action):
    user_id = payload["user_id"]
    role = payload["role"]
    
    # 1. Vérifier que le rôle a la permission
    if action not in ROLES[role]:
        raise ForbiddenError(f"Role {role} cannot {action}")
    
    # 2. Vérifier la propriété (si "own_data")
    if "own_data" in ROLES[role][action] and resource.owner_id != user_id:
        raise ForbiddenError("Cannot access other user's data")
    
    return True

# Utilisation dans chaque endpoint
@app.get("/invoices/{invoice_id}")
def get_invoice(invoice_id: int, token: str):
    payload = verify_token(token)
    invoice = db.query(Invoice).get(invoice_id)
    
    check_permission(payload, invoice, "read:own_data")
    return invoice
```

**Erreur fréquente** : RBAC côté client uniquement.

```javascript
// ❌ Frontend masque le bouton "Supprimer"
if (user.role !== "admin") {
    deleteButton.style.display = "none";
}

// Mais rien n'empêche un attaquant de :
// 1. Ouvrir la console et faire : deleteButton.style.display = "block"
// 2. Ou faire un curl directement : DELETE /api/users/123
```

**La vraie défense est serveur**, dans chaque endpoint.

---

## Gestion des secrets en production

### Où les secrets se cachent (et s'échappent)

**🔴 Vecteur : Secrets en dur dans le code**

```bash
# Historique Git, pour toujours
git log -p --all | grep -i "password\|secret\|key"

# Même après suppression :
git log --all --full-history -- ".env"

# Solution : git-filter-branch ou BFG (après, les secrets doivent être rotés)
bfg --delete-files .env repo.git
```

**🔴 Vecteur : Secrets dans les fichiers de config (Docker, Kubernetes)**

```bash
# ❌ Dangerous Dockerfile
FROM python:3.11
COPY app.py /app/
ENV DATABASE_URL=postgresql://user:password123@db.example.com/prod
# Visible en : docker history <image>
```

```bash
# ✅ Correct
FROM python:3.11
COPY app.py /app/
# DATABASE_URL vient d'une variable d'env à runtime (ou secret manager)
```

**🔴 Vecteur : Secrets dans les logs**

```python
import logging

# ❌ Log la requête complète
@app.post("/login")
def login(request):
    logger.info(f"Login request: {request.json}")  # Password en clair
    # {"email": "user@test.com", "password": "SecurePass123!"}
    
    if authenticate(request.json):
        return {"token": "jwt..."}

# ✅ Correct : filtrer les champs sensibles
def sanitize_logs(data):
    SENSITIVE_FIELDS = ["password", "token", "secret", "api_key"]
    if isinstance(data, dict):
        return {k: ("***REDACTED***" if k in SENSITIVE_FIELDS else v) 
                for k, v in data.items()}
    return data

@app.post("/login")
def login(request):
    logger.info(f"Login request: {sanitize_logs(request.json)}")
```

### Architecture de stockage des secrets

**Option 1 : Variables d'environnement (simple, pas idéal)**

```bash
# .env (NE JAMAIS commiter)
JWT_SECRET=my-very-secure-key-1234567890
DATABASE_URL=postgresql://user:pass@localhost/db

# Python
import os
SECRET_KEY = os.getenv("JWT_SECRET")
```

**Problème** : Si quelqu'un accède au serveur, toutes les env vars sont lisibles.

**Option 2 : AWS Secrets Manager / Azure Key Vault (production standard)**

```python
import boto3

def get_secret(secret_name):
    client = boto3.client('secretsmanager', region_name='us-east-1')
    try:
        response = client.get_secret_value(SecretId=secret_name)
        return response['SecretString']
    except client.exceptions.ResourceNotFoundException:
        raise ValueError(f"Secret {secret_name} not found")

JWT_SECRET = get_secret("prod/api/jwt-secret")
```

**Avantage** : Rotation automatique, audit trail, encryption at rest, accès granulaire par IAM role.

**Option 3 : HashiCorp Vault (complexe mais très puissant)**

```bash
# App demande un secret dynamique à Vault
curl -H "X-Vault-Token: $VAULT_TOKEN" \
  https://vault.company.com/v1/secret/data/prod/db-creds
# Réponse :
{
  "data": {
    "username": "app_user",
    "password": "temp_password_expires_in_1h"
  }
}

# Vault rotate les credentials automatiquement
```

### Rotation des secrets

**Scenario réel** : Un développeur commite un token API, il est découvert via GitHub scanning.

```bash
# 1. Révoquer immédiatement le vieux token
curl -X DELETE https://api.example.com/api/tokens/old_token_id

# 2. Générer un nouveau token
NEW_TOKEN=$(curl -X POST https://api.example.com/api/tokens \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"name":"backup_token","scope":"read:data"}' | jq -r '.token')

# 3. Déployer le nouveau token
# Option A : Secret Manager
aws secretsmanager update-secret --secret-id "prod/api/token" --secret-string "$NEW_TOKEN"

# Option B : Redéployer l'app avec nouveau secret
docker pull <image>
docker run -e API_TOKEN="$NEW_TOKEN" <image>
```

**Rotation régulière (best practice)** :
- Credentials BD : tous les 30 jours
- Tokens API : tous les 90 jours (ou en cas de suspicion de compromise)
- Clés de chiffrement : tous les 12 mois (plan de migration anticipé)

---

## Hardening : Configuration sécurisée par couche

### Couche réseau : TLS / mTLS

**Basique (API publique)** : HTTPS obligatoire, certificat valide.

```bash
# ❌ Test : vérifier qu'HTTP redirige
curl -i http://api.example.com/health
# Doit répondre 301 vers https://

# ✅ Vérifier le certificat
openssl s_client -connect api.example.com:443 -showcerts | grep "Issuer:"
# Doit être un CA reconnu, pas self-signed en prod
```

**Avancé (API interne, B2B)** : mTLS (mutual TLS) — client ET serveur s'authentifient par certificat.

```bash
# Vérifier qu'un client sans certificat ne peut pas se connecter
curl -i https://api-internal.example.com/data
# Doit répondre 401 / 403 ou fermer la connexion

# Avec le bon certificat
curl --cert client.crt --key client.key https://api-internal.example.com/data
# 200
```

**Configuration nginx (mTLS)** :

```nginx
server {
    listen 443 ssl;
    server_name api-internal.example.com;
    
    ssl_certificate /etc/ssl/certs/server.crt;
    ssl_certificate_key /etc/ssl/private/server.key;
    
    # mTLS : exige un certificat client
    ssl_client_certificate /etc/ssl/certs/ca.crt;
    ssl_verify_client on;
    
    # Protocole minimum
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    
    location / {
        proxy_pass http://backend;
        # Transmettre le DN du certificat client
        proxy_set_header X-SSL-Client-S-DN $ssl_client_s_dn;
    }
}
```

**Erreur fréquente** : Accepter `ssl_verify_client optional` en production. Cela signifie "certificat client accepté si présent, mais pas obligatoire".

```nginx
# ❌ DANGEREUX
ssl_verify_client optional;
if ($ssl_client_verify != SUCCESS) {
    # Vérifier le client ici... peut être oublié
}

# ✅ Correct
ssl_verify_client on;  # Obligatoire
```

### Couche applicative : Validation stricte

**Input validation** : Chaque paramètre d'entrée doit être whitelist, pas blacklist.

```python
from pydantic import BaseModel, Field, validator

class CreateUserRequest(BaseModel):
    email: str = Field(..., regex=r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
    age: int = Field(..., ge=0, le=150)
    role: str = Field(..., pattern="^(user|admin|moderator)$")  # Whitelist
    
    @validator('email')
    def email_not_reserved(cls, v):
        if v.endswith("@admin.example.com"):
            raise ValueError("Reserved domain")
        return v

@app.post("/users")
def create_user(user: CreateUserRequest):
    # Pydantic valide automatiquement
    # Si les données ne matchent pas, 422 Unprocessable Entity
    pass
```

**SQL Injection** : Toujours utiliser prepared statements, jamais f-strings.

```python
# ❌ DANGEREUX
user_id = request.args.get("id")
query = f"SELECT * FROM users WHERE id = {user_id}"
result = db.execute(query)

# Attaquant : GET /users?id=1 OR 1=1
# Query devient : SELECT * FROM users WHERE id = 1 OR 1=1
