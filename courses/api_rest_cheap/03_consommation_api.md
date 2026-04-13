---
layout: page
title: "Consommer une API REST"

course: api_rest_cheap
chapter_title: "Intégration et consommation"

chapter: 1
section: 3

tags: api,http,rest,client,integration,beginner
difficulty: beginner
duration: 90
mermaid: true

status: "published"
prev_module: "/courses/api_rest_cheap/02_http_rest.html"
prev_module_title: "HTTP & REST : Fondamentaux pour les API"
next_module: "/courses/api_rest_cheap/10_authentification_autorisation.html"
next_module_title: "Authentification & Autorisation dans les API REST"
---

## Objectifs pédagogiques

À la fin de ce module, tu seras capable de :

- **Formuler une requête HTTP** (GET, POST, PUT, DELETE) vers une API distante avec les bons headers et un body JSON
- **Interpréter les codes de réponse** (200, 201, 400, 401, 404, 500) et adapter ton comportement en conséquence
- **Extraire et traiter les données JSON** reçues dans ta stack (Python, JavaScript ou autre)
- **Diagnostiquer une erreur d'API** en inspectant les logs, headers et réponses
- **Sécuriser tes appels** avec authentification (Bearer token, API key) sans exposer tes secrets

---

## Mise en situation

Tu travailles dans une équipe backend. Votre système a besoin d'intégrer un service tiers : envoyer des notifications, récupérer les prix d'une place de marché, valider des adresses, etc.

Jusqu'à présent, vous documentez "manuellement" les intégrations (comment appeler, quels paramètres, quelles réponses). Les tests se font via Postman en cliquant partout. Quand une API change, vous découvrez le bug en production.

**Le problème :** sans maîtriser les appels API côté code, vous restez dépendant d'UI de test, vous ne pouvez pas automatiser, et les erreurs ne remontent jamais clairement.

Aujourd'hui, tu vas faire tes premiers vrais appels d'API en code — reproductibles, testables, et prêts pour la production.

---

## Comprendre ce qu'on consomme quand on consomme une API

Une API REST, c'est un serveur qui écoute des requêtes HTTP sur des routes spécifiques et répond avec du JSON. Consommer une API, c'est :

1. **Construire une requête** : moi (le client) je dis au serveur ce que je veux (méthode HTTP, URL, headers, body)
2. **L'envoyer** : la requête voyage sur le réseau
3. **Recevoir la réponse** : le serveur répond avec un code de statut + des données JSON (ou une erreur)
4. **Traiter le résultat** : je parse le JSON et j'agis selon le contenu

La différence avec une application web classique : au lieu d'ouvrir une page HTML dans le navigateur, je fais des appels programmatiques. Mon code parle directement au code du serveur.

💡 **Astuce** — une même API peut être consommée par 10 clients différents : une app web en React, une app mobile iOS, un backend Python, une intégration Zapier, etc. L'API ne sait pas d'où viennent les appels, elle répond à tout le monde de la même manière.

---

## Dissection d'une requête HTTP

Avant de coder, comprendre la structure. Voici ce qu'on envoie au serveur :

```
POST /api/v1/invoices HTTP/1.1
Host: api.billing.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
User-Agent: MyApp/1.0

{
  "customer_id": 42,
  "amount": 150.50,
  "currency": "EUR"
}
```

**Décortiquons :**

| Partie | Signification | Exemple |
|--------|---------------|---------|
| **Méthode + URL** | *Ce que tu veux faire et où* | `POST /api/v1/invoices` = créer une facture |
| **Host** | *Domaine du serveur* | `api.billing.example.com` |
| **Headers** | *Metadata de ta requête* | `Authorization` pour te prouver, `Content-Type` pour dire "j'envoie du JSON" |
| **Body** | *Les données à envoyer (facultatif pour GET)* | L'objet JSON avec les détails de la facture |

La **réponse** aura exactement la même structure :

```
HTTP/1.1 201 Created
Content-Type: application/json
X-Request-ID: req-12345

{
  "id": 9876,
  "status": "created",
  "created_at": "2025-01-15T10:32:00Z"
}
```

| Partie | Signification |
|--------|---------------|
| **Code de statut** | `201` = succès, ressource créée |
| **Headers de réponse** | `Content-Type: application/json` = je te réponds en JSON |
| **Body de réponse** | Les données que tu demandais |

⚠️ **Erreur fréquente** — envoyer une requête POST sans `Content-Type: application/json` et espérer que le serveur comprenne. Résultat : 415 Unsupported Media Type ou le serveur rejette silencieusement ton body.

---

## Les codes HTTP à connaître

Quand tu appelles une API, le premier truc que tu regardes, c'est le code de statut. Il te dit immédiatement si ça a marché ou où c'est cassé.

| Code | Sens | Tu dois faire quoi ? |
|------|------|----------------------|
| **200 OK** | Succès, données retournées | Parse la réponse, traite les données |
| **201 Created** | Ressource créée avec succès | Même chose, mais savoir que c'est une création (pas une mise à jour) |
| **204 No Content** | Succès, mais aucune donnée | Ne cherche pas à parser un body vide |
| **400 Bad Request** | Ta requête a un problème (oubli de paramètre, format invalide) | Vérifier : paramètres obligatoires ? format JSON valide ? longueurs limites ? |
| **401 Unauthorized** | Authentification manquante ou invalide | Vérifier ton Bearer token, ta clé API, tes credentials |
| **403 Forbidden** | Authentification ok, mais pas le droit d'accéder | Vérifier les permissions (l'utilisateur a-t-il accès à cette ressource ?) |
| **404 Not Found** | La ressource n'existe pas (ou l'endpoint n'existe pas) | Vérifier l'URL, vérifier si l'ID existe vraiment |
| **429 Too Many Requests** | Tu appelles trop vite (rate limiting) | Attendre, puis implémenter des délais ou un backoff exponentiel |
| **500 Internal Server Error** | Le serveur a planté | Ce n'est pas toi, c'est lui. Réessayer plus tard. Alerter le support de l'API. |

🧠 **Concept clé** — les codes 2xx = succès (tu avances), les codes 4xx = c'est toi (vérifier ta requête), les codes 5xx = c'est le serveur (attendre ou signaler).

---

## Faire ton premier appel : avec curl

`curl` est ton meilleur ami pour tester une API en ligne de commande. Pas de GUI, pas d'attendre que Postman charge. Juste : requête → réponse.

### GET simple

```bash
curl https://api.example.com/users/123
```

Tu récupères l'utilisateur avec l'ID 123. Très basique.

Ajouter des headers :

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://api.example.com/users/123
```

Voir les headers de réponse en plus du body :

```bash
curl -i https://api.example.com/users/123
```

(le `-i` affiche Status + Headers + Body)

### POST avec un body JSON

C'est là que ça devient intéressant :

```bash
curl -X POST https://api.example.com/invoices \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"customer_id": 42, "amount": 150.50, "currency": "EUR"}'
```

Décryptage :
- `-X POST` : méthode HTTP
- `-H "..."` : ajouter un header (tu peux en mettre plusieurs)
- `-d '...'` : le body JSON (attention aux guillemets imbriqués !)

💡 **Astuce** — pour éviter les problèmes de guillemets dans bash, sauvegarde le JSON dans un fichier :

```bash
cat > /tmp/invoice.json << 'EOF'
{
  "customer_id": 42,
  "amount": 150.50,
  "currency": "EUR"
}
EOF

curl -X POST https://api.example.com/invoices \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d @/tmp/invoice.json
```

Le `@` dit à curl : "lis le contenu du fichier et l'envoie comme body".

### PUT et DELETE

Mettre à jour une ressource :

```bash
curl -X PUT https://api.example.com/invoices/9876 \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"status": "paid"}'
```

Supprimer une ressource :

```bash
curl -X DELETE https://api.example.com/invoices/9876 \
     -H "Authorization: Bearer YOUR_TOKEN"
```

⚠️ **Erreur fréquente** — oublier de mettre `-H "Content-Type: application/json"` quand tu envoies du JSON. Le serveur lit le header pour savoir comment parser ton body. Sans lui, il ignore ton JSON et tu reçois une erreur 400.

---

## Passer aux appels en code

curl c'est sympa pour tester, mais en vrai tu vas appeler l'API depuis ton code. C'est là qu'on voit les vraies erreurs : timeout, parsing JSON cassé, gestion des erreurs manquante.

### Python avec `requests`

C'est le standard pour les devs Python. Installation :

```bash
pip install requests
```

GET simple :

```python
import requests

response = requests.get(
    "https://api.example.com/users/123",
    headers={"Authorization": "Bearer YOUR_TOKEN"}
)

print(response.status_code)  # 200, 404, etc.
print(response.json())       # Parse le JSON
```

POST avec body :

```python
payload = {
    "customer_id": 42,
    "amount": 150.50,
    "currency": "EUR"
}

response = requests.post(
    "https://api.example.com/invoices",
    json=payload,  # requests convertit au JSON et ajoute Content-Type automatiquement
    headers={"Authorization": "Bearer YOUR_TOKEN"}
)

if response.status_code == 201:
    invoice_data = response.json()
    print(f"Invoice created: {invoice_data['id']}")
else:
    print(f"Error: {response.status_code}")
    print(response.text)  # Voir la réponse d'erreur
```

💡 **Astuce** — `json=` est plus simple que `data=` : il convertit le dict en JSON, ajoute automatiquement `Content-Type: application/json`, et gère les types (float, bool, None).

### JavaScript / Node.js avec `fetch`

fetch est intégré dans les navigateurs et dans Node.js 18+ :

```javascript
const payload = {
  customer_id: 42,
  amount: 150.50,
  currency: "EUR"
};

const response = await fetch("https://api.example.com/invoices", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_TOKEN",
    "Content-Type": "application/json"
  },
  body: JSON.stringify(payload)
});

if (response.status === 201) {
  const invoiceData = await response.json();
  console.log(`Invoice created: ${invoiceData.id}`);
} else {
  console.error(`Error: ${response.status}`);
  console.error(await response.text());
}
```

Ou avec axios (populaire, API plus simple) :

```javascript
const axios = require("axios");

const response = await axios.post(
  "https://api.example.com/invoices",
  {
    customer_id: 42,
    amount: 150.50,
    currency: "EUR"
  },
  {
    headers: { "Authorization": "Bearer YOUR_TOKEN" }
  }
);

console.log(response.data);  // Les données
console.log(response.status); // Le code
```

---

## Gérer l'authentification sans exposer tes secrets

Une API n'accepte pas les requêtes de n'importe qui. Tu dois prouver qui tu es. Les méthodes courantes :

### Bearer Token (OAuth 2.0)

C'est le standard moderne. Le serveur t'a donné un token (une longue chaîne), et tu l'envoies dans chaque requête :

```python
headers = {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
response = requests.get("https://api.example.com/users/123", headers=headers)
```

### API Key

Certains services utilisent juste une clé unique :

```python
headers = {
    "X-API-Key": "sk-abc123def456..."
}
response = requests.get("https://api.example.com/users/123", headers=headers)
```

(Le header exact dépend de l'API, consulte la doc)

### ⚠️ Ne JAMAIS hardcoder tes secrets

Ton token ou ta clé ne doivent **jamais** être en dur dans le code. Ils vont sur GitHub public, un stagiaire récupère ton laptop, et boom : quelqu'un d'autre accède à ton API.

**La bonne pratique :**

1. Stocke le secret dans une **variable d'environnement** :

```bash
export API_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

2. Lis-la dans le code :

```python
import os

token = os.getenv("API_TOKEN")
if not token:
    raise ValueError("API_TOKEN not set in environment")

headers = {"Authorization": f"Bearer {token}"}
response = requests.get("https://api.example.com/users/123", headers=headers)
```

3. Ajoute `.env` au `.gitignore` (pour les variables locales) et configure les secrets sur ton serveur de production via la plateforme (AWS Secrets Manager, GitHub Secrets, etc.)

💡 **Astuce** — en développement local, utilise `python-dotenv` pour charger les variables depuis un fichier `.env` (non commité) :

```bash
pip install python-dotenv
```

```python
from dotenv import load_dotenv
import os

load_dotenv()  # Charge .env
token = os.getenv("API_TOKEN")
```

---

## Parser et traiter les réponses JSON

Quand tu reçois une réponse, ce n'est jamais magiquement exploitable. Tu dois vérifier le code, vérifier que c'est du JSON valide, et extraire ce qui t'intéresse.

### Cas simple (succès)

```python
response = requests.get("https://api.example.com/users/123")
user = response.json()

print(user["name"])
print(user["email"])
```

Ça marche si :
- Le code est 200
- Le body est du JSON valide
- La clé `"name"` existe

Souvent, ce n'est pas le cas.

### Cas robuste (erreur potentielle)

```python
response = requests.get("https://api.example.com/users/123")

# 1. Vérifier le code de statut
if response.status_code == 404:
    print("Utilisateur non trouvé")
    return None
elif response.status_code != 200:
    print(f"Erreur API: {response.status_code}")
    print(response.text)  # Voir le détail de l'erreur
    raise Exception(f"API call failed with {response.status_code}")

# 2. Parser le JSON
try:
    user = response.json()
except ValueError:
    print("Réponse invalide: pas du JSON")
    raise

# 3. Vérifier que les clés existent
if "name" not in user:
    print("Réponse API invalide: clé 'name' absente")
    raise KeyError("'name' not in response")

print(user["name"])
```

Oui, c'est verbeux. Mais en production, quand une API saute et que tu dois déboguer à 3h du matin, ces vérifications te sauvent la vie.

💡 **Astuce** — utilise la méthode `response.raise_for_status()` pour que requests lève automatiquement une exception si le code n'est pas 2xx :

```python
response = requests.get("https://api.example.com/users/123")
response.raise_for_status()  # Lève une exception si status >= 400

user = response.json()
```

Beaucoup plus clean pour du code simple.

---

## Construire un client réutilisable

Appeler une API chaque fois avec tous les headers, les vérifications, c'est pénible. Mieux vaut factoriser en une classe réutilisable.

```python
import requests
import os

class BillingAPIClient:
    def __init__(self):
        self.base_url = "https://api.billing.example.com"
        self.token = os.getenv("API_TOKEN")
        if not self.token:
            raise ValueError("API_TOKEN not set")
        
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        })
    
    def get_user(self, user_id):
        """Récupère un utilisateur par ID"""
        response = self.session.get(f"{self.base_url}/users/{user_id}")
        response.raise_for_status()
        return response.json()
    
    def create_invoice(self, customer_id, amount, currency="EUR"):
        """Crée une nouvelle facture"""
        payload = {
            "customer_id": customer_id,
            "amount": amount,
            "currency": currency
        }
        response = self.session.post(
            f"{self.base_url}/invoices",
            json=payload
        )
        response.raise_for_status()
        return response.json()

# Usage :
client = BillingAPIClient()
user = client.get_user(123)
invoice = client.create_invoice(customer_id=123, amount=150.50)
```

Avantages :
- **Headers et auth centralisés** : une seule place à mettre à jour
- **URLs de base réutilisables** : pas besoin de recopier l'URL complète
- **Erreurs gérées uniformément** : `raise_for_status()` partout
- **Session réutilisée** : requests réutilise la connexion TCP (plus rapide)

---

## Gérer les erreurs et les timeouts

Les APIs ne sont pas parfaites. Elles plantent, elles sont lentes, elles changent. Tu dois prévoir le pire.

### Timeout

Par défaut, requests attend indéfiniment. Si l'API ne répond pas, ton code se gèle.

```python
try:
    response = requests.get(
        "https://api.example.com/users/123",
        timeout=5  # Attendre max 5 secondes
    )
except requests.exceptions.Timeout:
    print("L'API met trop de temps à répondre")
    # Relancer la requête, alerter, etc.
```

💡 **Astuce** — utilise un timeout court (2-5 secondes) en production. Si l'API met plus longtemps, c'est qu'elle surchauffe, et il faut le savoir pour escalader aux ops.

### Retry automatique

Si l'API retourne une 500 (erreur serveur), ça peut être temporaire. Réessayer aide souvent.

```python
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

session = requests.Session()

# Retry strategy : réessayer 3 fois si erreur 5xx
retry = Retry(total=3, backoff_factor=1, status_forcelist=[500, 502, 503, 504])
adapter = HTTPAdapter(max_retries=retry)
session.mount("https://", adapter)
session.mount("http://", adapter)

response = session.get("https://api.example.com/users/123", timeout=5)
```

Cela fait : requête 1 → erreur 500 → attendre 1s → requête 2 → attendre 2s → requête 3 → erreur persistent → abandon.

### Rate limiting

L'API dit "stop, trop de requêtes". Elle retourne un 429 avec un header `Retry-After` qui dit combien attendre.

```python
import time

while True:
    try:
        response = requests.get("https://api.example.com/users/123", timeout=5)
        response.raise_for_status()
        break  # Succès, sortir de la boucle
    except requests.exceptions.HTTPError as e:
        if response.status_code == 429:
            wait_time = int(response.headers.get("Retry-After", 60))
            print(f"Rate limited. Attendant {wait_time}s...")
            time.sleep(wait_time)
        else:
            raise  # Autre erreur, la relancer

user = response.json()
```

⚠️ **Erreur fréquente** — boucler sur les requêtes sans attendre → le serveur t'ignore de plus en plus. Toujours respecter le `Retry-After`.

---

## Cas réel : intégrer une API de paiement

Imaginons que ton app doit traiter des paiements via une API tierce (Stripe, PayPal, etc.). Voici comment ça se passe en vrai :

**Contexte :** E-commerce avec 50 commandes/jour. Chaque commande doit être payée via l'API. Si le paiement échoue, faut relancer. Si l'API est down, faut mettre en queue et réessayer plus tard.

**Code initial (naïf) :**

```python
def process_order(order_id):
    order = db.get_order(order_id)
    
    # Appel direct à l'API de paiement
    response = requests.post(
        "https://payment-api.com/charge",
        json={"amount": order.total, "token": order.payment_token}
    )
    
    if response.status_code == 200:
        order.status = "paid"
    else:
        order.status = "failed"
    
    db.save(order)
```

**Problèmes :**
- Pas de timeout → si l'API freeze, le serveur attend indéfiniment
- Pas de retry → une erreur temporaire (500) annule la commande
- Pas de log → tu ne sais pas pourquoi ça a échoué
- Pas de gestion du 429 → tu spammes l'API et ça s'aggrave

**Code robuste :**

```python
import logging
import requests
from tenacity import retry, stop_after_attempt, wait_exponential

logger = logging.getLogger(__name__)

class PaymentClient:
    def __init__(self):
        self.base_url = "https://payment-api.com"
        self.api_key = os.getenv("PAYMENT_API_KEY")
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Bearer {self.api_key}"
        })
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10)
    )
    def charge(self, amount, token):
        """Charge avec retry automatique (backoff exponentiel)"""
        logger.info(f"Charging ${amount} with token {token[:8]}...")
        
        try:
            response = self.session.post(
                f"{self.base_url}/charge",
                json={"amount": amount, "token": token},
                timeout=5
            )
            
            # Log le code et le body pour debug
            logger.debug(f"Response status: {response.status_code}, body: {response.text[:200]}")
            
            # Laisser passer les 2xx, lever une exception sinon
            response.raise_for_status()
            
            return response.json()
        
        except requests.exceptions.Timeout:
            logger.error(f"Timeout charging ${amount}")
            raise
        except requests.exceptions.HTTPError as e:
            if response.status_code == 429:
                logger.warning(f"Rate limited, will retry...")
                # La décorateur @retry gère le retry
            logger.error(f"HTTP error {response.status_code}: {response.text}")
            raise

def process_order(order_id):
    order = db.get_order(order_id)
    client = PaymentClient()
    
    try:
        result = client.charge(order.total, order.payment_token)
        order.status = "paid"
        order.payment_id = result["transaction_id"]
        logger.info(f"Order {order_id} paid successfully")
    
    except Exception as e:
        # Log l'erreur, mais ne pas crasher
        logger.error(f"Payment failed for order {order_id}: {e}")
        order.status = "payment_pending"  # Attendre un retry manuel
        # Ou déclencher une relance async
    
    finally:
        db.save(order)
```

**Ce qui change :**
- `@retry` : relance 3 fois avec délai croissant (1s, 2s, 4s...)
- `timeout=5` : ne pas attendre indéfiniment
- Logs détaillés : pour deboguer quand ça casse
- Distinction 4xx (erreur client, pas de retry) vs 5xx (erreur serveur, retry)
- Status intermédiaire `payment_pending` : on peut relancer manuellement

En production, tu ajouterais aussi une queue (Celery, SQS) pour relancer les paiements échoués en arrière-plan, alerter les ops si trop d'erreurs, etc.

---

## Tester tes appels API sans toucher le vrai serveur

En dev, tu ne veux pas vraiment appeler l'API externe. C'est lent, c'est fragile, ça coûte parfois de l'argent.

### Mock avec `unittest.mock`

```python
from unittest.mock import patch, MagicMock
import requests

def test_get_user_success():
    with patch("requests.get") as mock_get:
        # Dire à mock de retourner un objet fake
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"id": 123, "name": "Alice"}
        mock_get.return_value = mock_response
        
        # Appeler ton code
        user = client.get_user(123)
        
        # Vérifier que ça marche
        assert user["name"] == "Alice"
        # Vérifier que requests.get a été appelé avec les bons paramètres
        mock_get.assert_called_once()

def test_get_user_not_found():
    with patch("requests.get") as mock_get:
        mock_response = MagicMock()
        mock_response.status_code = 404
        mock_response.raise_for_status.side_effect = requests.exceptions.HTTPError()
        mock_get.return_value = mock_response
        
        with pytest.raises(requests.exceptions.HTTPError):
            client.get_user(999)
```

### Utiliser un serveur API fake (plus avancé)

Pour des tests plus complexes, utilise `responses` ou `vcrpy` :

```bash
pip install responses
```

```python
import responses

@responses.activate
def test_create_invoice():
    # Dire à responses d'intercepter cet URL et retourner ça
    responses.add(
        responses.POST,
        "https://api.billing.example.com/invoices",
        json={"id": 9876, "status": "created"},
        status=201
    )
    
    # Maintenant, mon code appelle vraiment requests.post(),
    # mais ça retourne la réponse fake
    result = client.create_invoice(customer_id=42, amount=150.50)
    
    assert result["id"] == 9876
```

💡 **Astuce** — en staging (pré-prod), appelle la vraie API avec des données de test. En unit tests, mock. Ça t'évite les surprises en prod.

---

## Bonnes pratiques

### 1. Toujours mettre un timeout

```python
response = requests.get(url, timeout=5)
```

Sans lui, une API lente te gèle le code indéfiniment.

### 2. Logguer les appels API importants

```python
logger.info(f"Calling POST {url} with payload {payload}")
logger.debug(f"Response: {response.status_code} {response.text[:500]}")
```

Indispensable pour deboguer en prod. Le log t'indique exactement ce qui s'est passé.

### 3. Vérifier le code de statut avant de parser le JSON

```python
if response.status_code != 200:
    logger.error(f"Unexpected status {response.status_code}: {response.text}")
    raise ValueError(f"API error: {response.status_code}")

data = response.json()
```

Les erreurs retournent souvent du JSON invalide ou un HTML d'erreur. Parser sans vérifier = crash.

### 4. Stocker les credentials en variables d'environnement

```python
api_key = os.getenv("API_KEY")
if not api_key:
    raise ValueError("API_KEY not configured")
```

Jamais en dur dans le code.

### 5. Implémenter un backoff exponentiel pour les retries

```python
for attempt
