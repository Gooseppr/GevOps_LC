```yaml
---
layout: page
title: "Architecture API : Structurer et concevoir une API robuste"

course: API REST
chapter_title: "Architecture API"

chapter: 2
section: 1

tags: architecture,api,design,patterns,scalabilité
difficulty: intermediate
duration: 75
mermaid: true

icon: "🏗️"
domain: Backend / DevOps
domain_icon: "⚙️"
status: "published"
---

# Architecture API : Structurer et concevoir une API robuste

## Objectifs pédagogiques

À la fin de ce module, vous serez capable de :

1. **Comprendre les principes de conception** qui distinguent une API chaotique d'une API maintenable
2. **Identifier les couches d'une API** (routing, validation, métier, persistance) et organiser le code en conséquence
3. **Faire des choix architecturaux** conscients : synchrone vs asynchrone, stateful vs stateless, monolithe vs microservices
4. **Reconnaître les pièges courants** et savoir quand une architecture devient inadaptée (scaling, sécurité, complexité)

---

## Mise en situation

Vous développez un backend qui expose des données produit. Ça a commencé simple : une fonction qui retourne du JSON. Aujourd'hui :

- Vous avez 50 endpoints dispersés partout dans le code
- Un changement de validation casse 3 endpoints différents
- Les requêtes lentes mettent à genoux votre serveur
- Un bug de sécurité dans une fonction de vérification affecte toutes les routes
- Vous devez répondre : "Comment on scale ça ?" et "Où on met la logique métier ?"

**Ce que ce module vous apporte :** Les modèles mentaux et les outils pratiques pour structurer une API dès le départ de manière à éviter le chaos, et pour reconnaître quand votre architecture a besoin de respirer.

---

## Résumé

Une **architecture API** est un plan structurel qui définit comment votre application reçoit les requêtes HTTP, les traite, et retourne les réponses. L'enjeu n'est pas d'avoir la structure la plus sophistiquée, mais la structure qui **redondance minimale, testabilité maximale, et croissance sereine**.

Concrètement : séparer les responsabilités en couches (requête → validation → logique → données → réponse), appliquer des patterns de routage et d'erreur cohérents, et savoir arbitrer entre synchrone et asynchrone. Sans cela, votre API devient un fouillis où changer une règle métier prend une journée.

---

## Ce que c'est et pourquoi ça existe

### Définition minimale

Une **architecture API** est la structure organisationnelle et technique d'un service web qui traite les requêtes HTTP selon un contrat défini. Elle répond à trois questions :

- **Où** chaque type de logique habite-t-il ? (routing, authentification, métier, persistance)
- **Comment** les données circulent-elles de la requête à la réponse ?
- **Quand** chaque traitement s'exécute-t-il ? (synchrone, asynchrone, périodique)

### Pourquoi ce problème existe

Quand vous démarrez une API, il est tentant d'écrire une fonction par endpoint. Elle fonctionne, les tests passent, c'est déployé. Sauf que :

**Sans architecture définie :**
- La logique de validation se retrouve copiée dans 5 endpoints différents
- Un changement de règle métier vous force à toucher 10 fichiers
- Les tests deviennent un cauchemar (pas de découplage, tout dépend de tout)
- L'authentification, le logging, la gestion d'erreur ne sont pas uniformes
- Vous ne pouvez pas réutiliser votre logique si un autre service en a besoin

**Une architecture API cohérente vous donne :**

- **Réutilisabilité** : une fonction de calcul de prix vit une seule fois, plusieurs endpoints l'appellent
- **Testabilité** : vous testez les couches indépendamment (logique métier sans HTTP)
- **Maintenabilité** : un changement métier ne touche qu'un endroit
- **Cohérence** : même gestion d'erreur, même authentification, même structure de réponse partout
- **Scalabilité** : vous pouvez ajouter un cache, une queue, un service externe sans refondre tout

Analogie utile : une bonne architecture API, c'est comme une chaîne de montage d'usine. Les étapes sont clairement ordonnées, chaque poste a une responsabilité, et les défauts sont détectés au bon moment. Une mauvaise architecture, c'est quand chaque ouvrier réinvente sa part du processus — c'est lent, incohérent, et cassant.

---

## Les couches d'une API

Avant de parler de patterns ou de technologies, il faut comprendre **où vivent les responsabilités**. Une API bien structurée suit généralement ce flux :

```
Requête HTTP
    ↓
[Couche HTTP/Routing]      → Qui traite cette URL/méthode ?
    ↓
[Couche Authentification]  → Qui fait cette demande ?
    ↓
[Couche Validation]        → Les données sont-elles cohérentes ?
    ↓
[Couche Métier]            → Qu'est-ce qui doit se passer réellement ?
    ↓
[Couche Persistance]       → Comment on stocke/récupère les données ?
    ↓
[Couche HTTP/Réponse]      → Comment on formate et retourne le résultat ?
    ↓
Réponse HTTP
```

Chacune de ces couches a un rôle très spécifique. Voyons-les une par une.

### Couche HTTP/Routing

**Rôle** : associer une URL et une méthode HTTP à une fonction handler.

```python
# Flask
@app.route('/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    ...

@app.route('/products', methods=['POST'])
def create_product():
    ...
```

C'est le point d'entrée. Ici, on ne fait pas de métier, on reçoit la requête et on l'aiguille vers le bon traitement.

**Conseil** : gardez ce niveau aussi léger que possible. Si votre handler routing fait 50 lignes de code, c'est un symptôme que vous n'avez pas assez de couches intermédiaires.

### Couche Authentification & Autorisation

**Rôle** : vérifier que la personne qui appelle l'API a le droit de faire cette action.

```python
# Avant chaque endpoint sensible
def require_auth(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token or not verify_token(token):
            return {'error': 'Unauthorized'}, 401
        return f(*args, **kwargs)
    return wrapper

@app.route('/admin/users', methods=['GET'])
@require_auth
def list_users():
    ...
```

⚠️ **Erreur fréquente** : mélanger authentification et logique métier. L'authentification doit être transparente au reste du code.

### Couche Validation

**Rôle** : s'assurer que les données entrantes respectent le contrat.

```python
def validate_product_creation(data):
    errors = {}
    
    if not data.get('name') or len(data['name']) < 3:
        errors['name'] = 'Name must be at least 3 chars'
    
    if 'price' not in data or not isinstance(data['price'], (int, float)):
        errors['price'] = 'Price must be a number'
    
    if data.get('price', 0) < 0:
        errors['price'] = 'Price cannot be negative'
    
    return errors if errors else None

@app.route('/products', methods=['POST'])
def create_product():
    errors = validate_product_creation(request.json)
    if errors:
        return {'errors': errors}, 400
    
    # Continuer seulement si valide
    ...
```

**Pourquoi une couche séparée ?** Parce que votre logique métier ne doit jamais supposer que les entrées sont bonnes. Valider au point d'entrée permet à toute fonction métier de faire ses assomptions.

### Couche Métier

**Rôle** : implémenter les règles réelles. Comment crée-t-on un produit ? Quel est le prix final ? Qui peut faire quoi ?

```python
class ProductService:
    def __init__(self, product_repo):
        self.repo = product_repo
    
    def create_product(self, name, price, category):
        """Crée un produit avec validations métier"""
        
        # Règle métier : pas de doublons
        if self.repo.find_by_name(name):
            raise ValueError(f'Product {name} already exists')
        
        # Règle métier : catégories autorisées
        if category not in VALID_CATEGORIES:
            raise ValueError(f'Category {category} not allowed')
        
        product = Product(name=name, price=price, category=category)
        return self.repo.save(product)
```

**Clé** : cette couche ne connaît rien du HTTP. Elle prend des arguments Python, retourne des objets Python, et lève des exceptions si quelque chose ne peut pas être fait.

### Couche Persistance

**Rôle** : sauvegarder et récupérer les données.

```python
class ProductRepository:
    def __init__(self, db_connection):
        self.db = db_connection
    
    def save(self, product):
        query = "INSERT INTO products (name, price) VALUES (?, ?)"
        self.db.execute(query, (product.name, product.price))
        return product
    
    def find_by_id(self, product_id):
        query = "SELECT * FROM products WHERE id = ?"
        row = self.db.query_one(query, (product_id,))
        return Product(**row) if row else None
```

Ici aussi, on isole : la logique métier ne sait pas si on utilise SQL, MongoDB, ou Redis. Elle appelle des méthodes du repo, point.

### Couche Réponse HTTP

**Rôle** : transformer un objet métier en JSON et ajouter les bons codes/headers HTTP.

```python
def product_to_json(product):
    return {
        'id': product.id,
        'name': product.name,
        'price': product.price,
        'url': f'/products/{product.id}'
    }

@app.route('/products', methods=['POST'])
def create_product():
    data = request.json
    
    # Validation
    errors = validate_product_creation(data)
    if errors:
        return {'errors': errors}, 400
    
    # Métier
    product = product_service.create_product(
        name=data['name'],
        price=data['price'],
        category=data.get('category')
    )
    
    # Réponse HTTP
    return product_to_json(product), 201
```

**Pourquoi séparer** ? Parce que la représentation HTTP change, mais la logique métier reste. Demain, vous exposez la même API en gRPC ? Vous réutilisez tout sauf cette couche.

---

## Tableau des responsabilités

| Couche | Responsabilité | Exemple | ❌ Ne doit PAS contenir |
|--------|---|---|---|
| **Routing** | Associer URL + méthode à un handler | `GET /products/:id → get_product()` | Logique métier, requêtes BD |
| **Auth** | Vérifier identité/permissions | Valider JWT, extraire user_id | Logique métier spécifique |
| **Validation** | Vérifier format/contraintes données entrantes | "Le nom doit avoir ≥ 3 caractères" | Règles métier complexes |
| **Métier** | Implémenter les règles réelles | "Appliquer remise si client fidèle" | Détails de BD ou HTTP |
| **Persistance** | CRUD sur les données | `SELECT * FROM products WHERE...` | Logique applicative |
| **Réponse** | Formater et sérializer | JSON, codes HTTP, headers | Transformations métier |

💡 **Astuce** : une fonction de 3 à 5 lignes qui ne traverse qu'une couche, c'est bon signe. Une fonction de 80 lignes qui traite du routing, de la validation, du métier et de la persistance, c'est un signal d'alarme.

---

## Synchrone vs Asynchrone

Une décision architecturale majeure : **en attendre-vous que la requête se termine dans le cycle requête/réponse HTTP, ou commencez-vous un traitement qui se terminera plus tard ?**

### Synchrone : "Je t'attends"

```python
@app.route('/products', methods=['POST'])
def create_product():
    data = request.json
    
    # Traitement complet, puis réponse
    product = product_service.create_product(data)
    send_email_notification(product)  # ← Attend la fin de l'email
    update_analytics(product)          # ← Attend la mise à jour
    
    return product_to_json(product), 201
```

**Avantages** :
- Simple à comprendre et debugger
- Erreurs et succès clairs : si ça retourne 201, tout a réussi

**Inconvénients** :
- Si `send_email_notification()` prend 2 secondes, votre requête prend 2 secondes de plus
- Un problème en aval (mauvais serveur email) tue votre requête
- Vous ne pouvez pas paralléliser les traitements

### Asynchrone : "Je te lance le truc et je te réponds tout de suite"

```python
@app.route('/products', methods=['POST'])
def create_product():
    data = request.json
    
    # Créer le produit, puis lancer les traitements en arrière-plan
    product = product_service.create_product(data)
    
    # Mettre dans une queue de tâches
    background_jobs.enqueue(send_email_notification, product_id=product.id)
    background_jobs.enqueue(update_analytics, product_id=product.id)
    
    # Répondre immédiatement (le client ne sait pas encore si l'email a marché)
    return product_to_json(product), 201
```

**Avantages** :
- La réponse HTTP est rapide (quelques ms au lieu de plusieurs secondes)
- Les traitements longs n'impactent pas le client
- Vous pouvez retry automatiquement si quelque chose échoue

**Inconvénients** :
- Plus complexe : il faut une queue (Redis, RabbitMQ, etc.)
- Erreurs décorrélées du client : "Votre commande a été créée, mais l'email n'a pas pu être envoyé" — détecté plus tard
- Debugging devient plus difficile

### Quand utiliser quoi ?

| Situation | Synchrone | Asynchrone |
|-----------|---|---|
| Traitement court (< 100ms) | ✅ Oui | ❌ Overhead |
| Traitement long (> 500ms) | ❌ Timeout client | ✅ Oui |
| Résultat critique pour la réponse | ✅ Oui (calcul de prix) | ❌ Non |
| Résultat non-bloquant | ❌ Oui mais pas optimal | ✅ Oui (envoi email) |
| Dépendance externe non fiable | ❌ Risqué | ✅ Oui avec retry |
| Opération idempotente (peut être rejoué) | ❌ Sauf si urgent | ✅ Oui (analytics) |

⚠️ **Erreur fréquente** : faire tout asynchrone parce que "c'est moderne". Résultat : une API lente qui dit "OK" à tout, et les véritables erreurs prennent 30 minutes à remonter.

**Conseil pragmatique** : synchrone par défaut. Asynchrone quand vous avez mesuré que quelque chose est lent, non-critique pour le client, et peut être geré de manière fiable.

---

## Stateless vs Stateful

Une autre bifurcation architectural : **votre API mémorise-t-elle quelque chose entre deux requêtes ?**

### Stateless : "Je ne me souviens de rien"

```python
# Chaque requête est indépendante
@app.route('/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    # Je vais chercher le produit à chaque fois
    product = product_repo.find_by_id(product_id)
    return product_to_json(product), 200
```

**Avantages** :
- Vous pouvez lancer 10 instances de votre API, distribuer les requêtes n'importe comment
- Pas de synchronisation entre instances
- Simple à déployer

**Inconvénients** :
- Chaque requête rejoue le travail (aller chercher la donnée en base)
- Perte d'opportunity pour du cache local

### Stateful : "Je mémorise"

```python
# Mauvais exemple : variable globale (ne jamais faire)
_product_cache = {}

@app.route('/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    if product_id not in _product_cache:
        _product_cache[product_id] = product_repo.find_by_id(product_id)
    return product_to_json(_product_cache[product_id]), 200
```

Pourquoi c'est mauvais ? Si vous avez deux instances, instance A cache le produit 5, instance B ne l'a pas. Si vous updatez le produit via instance B, instance A serve toujours la version stale.

### Cas réel : un bon équilibre

En pratique, l'industrie est **stateless au niveau de l'application**, mais **avec du cache distribué** :

```python
@app.route('/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    # Vérifier Redis (état partagé entre instances)
    product_data = redis_cache.get(f'product:{product_id}')
    
    if not product_data:
        # Pas en cache, aller le chercher en base
        product = product_repo.find_by_id(product_id)
        # Mettre en cache pour les prochaines requêtes
        redis_cache.set(f'product:{product_id}', product.to_json(), ex=3600)
        return product_to_json(product), 200
    
    return json.loads(product_data), 200
```

Ici, chaque instance est **indépendante** (stateless d'un point de vue logique), mais elles partagent un cache centralisé. Best of both worlds.

---

## Monolithe vs Microservices

**Monolithe** : une seule application qui gère tous les endpoints.

```
┌─────────────────────────────────┐
│      API Monolithique           │
├─────────────────────────────────┤
│  /products                      │
│  /users                         │
│  /orders                        │
│  /payments                      │
│  /shipping                      │
└─────────────────────────────────┘
         ↓
    Une seule BD
```

**Microservices** : plusieurs petites applications, chacune responsable d'un domaine.

```
┌──────────────┐
│   API Users  │ ← User Service
└──────────────┘
       ↓
    Base Users

┌──────────────┐
│ API Products │ ← Product Service
└──────────────┘
       ↓
    Base Produits

┌──────────────┐
│   API Orders │ ← Order Service
└──────────────┘
       ↓
    Base Commandes
```

### Quand monolithe, quand microservices ?

| Critère | Monolithe | Microservices |
|---------|---|---|
| **Équipe** | 1-5 personnes | 5+ personnes, plusieurs équipes |
| **Complexité métier** | Simple à modérée | Haute, domaines distincts |
| **Fréquence de déploiement** | Tout redeployer ensemble, OK | Chaque service doit être autonome |
| **Scalabilité** | Vous scalez tout ou rien | Scalez juste le service surchargé |
| **Coût opérationnel** | Bas (une seule app à monitor) | Haut (monitoring distribué complexe) |
| **Temps de démarrage** | Rapide | Vous êtes déjà en production |

**Erreur classique** : commencer en microservices. Résultat : vous passez 6 mois à gérer les communications inter-services, les timeouts, la cohérence des données — et vous n'avez pas encore écrit votre logique métier.

**Conseil** : monolithe au démarrage. Quand un domaine devient trop lourd (ou que vous avez besoin de scalabilité différenciée), **extrayez** ce service. Pas avant.

---

## Gestion d'erreurs cohérente

Une architecture API doit définir **une seule façon de retourner les erreurs**, partout.

### Pattern courant : enveloppe d'erreur standardisée

```python
# Erreur de validation
{
  "status": "validation_error",
  "code": 400,
  "errors": {
    "email": "Email must be valid",
    "age": "Age must be >= 18"
  }
}

# Erreur métier
{
  "status": "insufficient_stock",
  "code": 409,
  "message": "Only 5 units available, 10 requested"
}

# Erreur d'authentification
{
  "status": "unauthorized",
  "code": 401,
  "message": "Invalid token"
}
```

### Implémenter ça avec des exceptions personnalisées

```python
class APIError(Exception):
    """Base pour toutes les erreurs API"""
    def __init__(self, status, message, code=400, details=None):
        self.status = status
        self.message = message
        self.code = code
        self.details = details or {}

class ValidationError(APIError):
    def __init__(self, errors):
        super().__init__(
            status='validation_error',
            message='Validation failed',
            code=400,
            details=errors
        )

class AuthenticationError(APIError):
    def __init__(self, message='Invalid credentials'):
        super().__init__(
            status='unauthorized',
            message=message,
            code=401
        )

# Handler global
@app.errorhandler(APIError)
def handle_api_error(error):
    response = {
        'status': error.status,
        'message': error.message,
    }
    if error.details:
        response['errors'] = error.details
    return response, error.code

# Utilisation
@app.route('/users', methods=['POST'])
def create_user():
    errors = validate_user(request.json)
    if errors:
        raise ValidationError(errors)
    
    try:
        user = user_service.create(request.json)
    except UserAlreadyExistsError as e:
        raise APIError(
            status='user_exists',
            message=str(e),
            code=409
        )
    
    return user_to_json(user), 201
```

**Bénéfice** : 
- Le client voit toujours la même structure d'erreur
- Vous loggez/debuggez de manière cohérente
- Les tests API sont simples à écrire

---

## Cas réel : E-commerce simple en production

Décrivons une petite architecture pour un e-commerce basique qui a besoin de scaling initial.

### Requête type : créer une commande

```
POST /orders
Content-Type: application/json
Authorization: Bearer <token>

{
  "product_ids": [1, 2, 3],
  "shipping_address_id": 5
}
```

### Flux dans l'application

```python
# 1. Routing
@app.route('/orders', methods=['POST'])
@require_auth
def create_order():

    # 2. Validation
    data = request.json
    errors = validate_order_creation(data)
    if errors:
        raise ValidationError(errors)
    
    # 3. Métier
    user_id = get_current_user_id()  # Extrait du token
    order = order_service.create(
        user_id=user_id,
        product_ids=data['product_ids'],
        shipping_address_id=data['shipping_address_id']
    )
    
    # 4. Asynchrone pour les trucs longs
    background_jobs.enqueue(
        'send_order_confirmation_email',
        order_id=order.id,
        user_id=user_id
    )
    
    # 5. Réponse
    return order_to_json(order), 201
```

### Ce qui se passe en arrière-plan

```python
class OrderService:
    def create(self, user_id, product_ids, shipping_address_id):
        """Crée une commande"""
        
        # Vérifier que la liste de produits existe
        products = self.product_repo.find_by_ids(product_ids)
        if len(products) != len(product_ids):
            raise ValidationError('Some products not found')
        
        # Vérifier que l'adresse appartient à l'utilisateur
        address = self.address_repo.find_by_id(shipping_address_id)
        if not address or address.user_id != user_id:
            raise AuthorizationError('Cannot use this address')
        
        # Vérifier le stock
        for product in products:
            if product.stock < 1:
                raise OutOfStockError(f'{product.name} is out of stock')
        
        # Créer la commande
        order = Order(
            user_id=user_id,
            products=products,
            shipping_address=address,
            total_price=sum(p.price for p in products),
            status='pending'
        )
        
        # Décrémenter les stocks
        for product in products:
            product.stock -= 1
            self.product_repo.save(product)
        
        # Sauvegarder
        self.order_repo.save(order)
        
        return order
```

### Avantages de cette structure

- **Testabilité** : vous testez `OrderService` sans HTTP, sans base de données (avec des mocks)
- **Réutilisabilité** : si un autre endpoint doit créer une commande, il appelle simplement `OrderService`
- **Maintenabilité** : un changement de règle métier ("vérifier les stocks") ne touche qu'un endroit
- **Scaling** : demain, vous ajoutez un cache Redis ou un worker asynchrone sans toucher à `OrderService`

---

## Bonnes pratiques et pièges

### 💡 Versioning des API

Vous allez modifier votre API. Comment garder la compatibilité avec les anciens clients ?

**Option 1 : versioning dans l'URL**
```
/v1/products
/v2/products
```

Avantage : clair. Inconvénient : vous maintenez deux code paths.

**Option 2 : versioning dans le header**
```
GET /products
Accept-Version: 2
```

Avantage : une seule URL. Inconvénient : moins visible.

**Conseil** : versioning dans l'URL au démarrage (simple). Changez de v1 à v2 quand vous cassez vraiment la compatibilité (rarement).

### ⚠️ N'oubliez pas la pagination

```python
# Mauvais : retourne 1000 produits
@app.route('/products', methods=['GET'])
def list_products():
    return product_repo.find_all()

# Bon : retourne 20 avec navigation
@app.route('/products', methods=['GET'])
def list_products():
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 20, type=int)
    
    if limit > 100:
        limit = 100  # Limite pour protéger
    
    products = product_repo.find_all(skip=(page-1)*limit, limit=limit)
    total = product_repo.count()
    
    return {
        'data': [p.to_json() for p in products],
        'pagination': {
            'page': page,
            'limit': limit,
            'total': total,
            'pages': (total + limit - 1) // limit
        }
    }, 200
```

### ⚠️ Logging structuré

```python
# Mauvais
print(f"User {user_id} created order {order_id}")

# Bon
logger.info('order_created', extra={
    'user_id': user_id,
    'order_id': order_id,
    'total': order.total_price,
    'request_id': get_request_id()  # Trace l'ensemble de la requête
})
```

Structuré = parsable. En production, c'est indispensable pour le debugging.

### ⚠️ Timeouts explicites

```python
# Mauvais : j'appelle un service externe et j'attends indéfiniment
result = requests.post(external_service_url, data=order_data)

# Bon
result = requests.post(
    external_service_url,
    data=order_data,
    timeout=2  # Timeout après 2 secondes
)
```

Sans timeout, une requête peut traîner pendant 30 secondes en silence. Avec, vous échouez rapidement et pouvez retry.

### 💡 Circuits breakers

Quand un service externe est down, ne pas continuer à lui envoyer des requêtes pendant 10 minutes.

```python
from pybreaker import CircuitBreaker

payment_breaker = CircuitBreaker(
    fail_max=5,           # Échoue 5 fois
    reset_timeout=60      # Puis attendre 60