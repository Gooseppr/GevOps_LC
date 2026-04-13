---
layout: page
title: "Tests API — Stratégie et mise en œuvre"

course: "API REST"
chapter_title: "Tests API"

chapter: 3
section: 1

tags: "tests,api,automation,postman,pytest,ci/cd"
difficulty: "intermediate"
duration: 120
mermaid: true

icon: "🧪"
domain: "Backend / DevOps / QA"
domain_icon: "⚙️"
status: "published"
---

## Objectifs pédagogiques

À la fin de ce module, vous saurez :

- **Identifier** les niveaux de test pertinents pour une API (unitaires, intégration, contrat, charge) et arbitrer en fonction du contexte
- **Construire** une suite de tests reproductible et maintenable avec pytest ou Postman, intégrée au CI/CD
- **Diagnostiquer** les défaillances critiques en production : assertion insuffisante, données mal isolées, états persistants, timing
- **Implémenter** des stratégies de test robustes : fixtures réutilisables, données de test isolées, assertions explicites
- **Mesurer** la couverture et l'efficacité réelle des tests au-delà du pourcentage

---

## Mise en situation

Vous êtes responsable d'une API backend utilisée par 3 équipes frontend différentes. Depuis 2 mois, vous déployez chaque mardi. Depuis 3 semaines, **chaque déploiement casse une ou deux fonctionnalités en production** : un endpoint `POST /users` qui change le behavior de `GET /users/{id}`, une migration qui supprime des données de test sans le vouloir, une authentification qui passe mais refuse les anciens tokens valides.

L'équipe QA teste manuellement via Postman avant chaque déploiement, mais les tests prennent 45 minutes, sont incomplets, et dépendent d'un état spécifique de la base de données. Vous ne savez jamais ce qu'on a vraiment testé.

**Le problème :** sans tests automatisés, vous naviguez à vue. Les bugs arrivent en production, le coût de correction explose (équipes frustées, utilisateurs affectés, débug stressant). Vous avez besoin d'une stratégie de test qui soit :
- **exécutée à chaque commit** sans intervention manuelle
- **fiable** : pas de faux positifs, pas de dépendances cachées entre tests
- **évolutive** : facile d'ajouter des cas de test sans restructurer tout le code
- **significative** : qui protège vraiment les fonctionnalités critiques, pas juste des couvertures fictives

Ce module vous montre comment construire ça, pas à pas, avec les outils réels et les pièges qu'on croise en production.

---

## Contexte et problématique

### Pourquoi les API ont besoin d'une stratégie de test

Une API n'est pas un frontend : elle n'a pas d'interface visuelle pour cliquer, pas de feedback immédiat si quelque chose casse. Un endpoint cassé, c'est une ligne de code qui retourne le mauvais code HTTP, un champ mal nommé, une validation oubliée. **L'utilisateur le découvre en production**, pas en développement.

Contrairement aux tests unitaires classiques (qui testent une fonction isolée), les tests API testent un **contrat** : je fais une requête, j'obtiens une réponse. Ce contrat doit rester stable, même quand le code change.

Trois raisons urgentes de tester :

1. **L'API est un contrat public.** Si tu changes le nom d'un champ ou le code HTTP de réponse, c'est une **breaking change**. Tes clients (frontend, mobile, partenaires) cassent. Les tests détectent ça immédiatement.

2. **Les dépendances sont cachées.** Un endpoint `POST /users` appelle probablement une base de données, envoie un email, met à jour un cache. Si une seule dépendance est down ou misconfigurée, ça casse. Les tests d'intégration le trouvent avant la production.

3. **Les regressions s'accumulent.** Sans tests, chaque refactorisation est une loterie. Après 6 mois, tu ne peux plus refactoriser sans crainte, et le code devient un monolithe non-maintenable.

### Les trois catégories de défaillances en production

Avant de parler de tests, clarifions ce qu'on cherche à prévenir :

| Catégorie | Symptôme typique | Quand ça arrive | Comment le test l'aurait trouvé |
|-----------|------------------|-----------------|----------------------------------|
| **Régression fonctionnelle** | Endpoint OK avant, cassé après un commit | Un mois après refactorisation du code | Test d'intégration qui relance le même scénario |
| **Data corruption silencieuse** | Données corrompues ou manquantes dans la DB | Après migration, job batch ou script de test | Test qui compare l'état avant/après avec assertions explicites |
| **État persistant non isolé** | Test A passe seul, échoue s'il y a un test B avant | Entre deux tests consécutifs | Fixtures qui isolent chaque test, rollback de transaction |
| **Intégration cassée** | Endpoint change, les clients frontend s'en rendent compte | Après déploiement en prod | Tests de contrat (validateur de schéma) |
| **Race condition ou timing** | Ça marche en local, cassé en prod sous charge | Déploiement : 10 requêtes/sec au lieu de 1/sec | Tests de charge, mocks qui forcent des délais |

---

## Les niveaux de test : architecture

```mermaid
graph TD
    A["Requête HTTP"] -->|"URI, body, headers"| B["Endpoint"]
    B -->|"biz logic"| C["Service / Repository"]
    C -->|"SQL, cache, API ext"| D["Dépendances"]
    D -->|"response data"| E["Réponse HTTP"]
    E -->|"status, body, headers"| F["Client"]

    style A fill:#e1f5ff
    style B fill:#fff3e0
    style C fill:#f3e5f5
    style D fill:#e8f5e9
    style E fill:#ffe0b2
    style F fill:#c8e6c9

    G["Tests unitaires<br/>Testent C isolé"]
    H["Tests intégration<br/>Testent B+C+D"]
    I["Tests contrat<br/>Testent E"]
    J["Tests charge<br/>Testent F"]

    G -.-> C
    H -.-> D
    I -.-> E
    J -.-> F
```

En testant une API, tu dois couvrir **différents niveaux** :

**1. Tests unitaires** (la couche métier, `C`)
- Testent une fonction métier isolée : calcul d'une commission, validation d'email, création d'un token.
- **Isolés** : mocké les appels DB, API externes, cache.
- **Rapides** : ~1ms par test.
- **Objectif** : la logique métier est correcte.
- **Limiteur** : ne trouvent pas les bugs qui arrivent sous charge, avec des vraies données, ou au moment de l'API call.

**2. Tests d'intégration** (le flux complet, `A` → `E`)
- Testent l'API end-to-end : tu envoies une vraie requête HTTP, tu reçois une vraie réponse, tu vérifies l'état de la DB.
- **Contre une vraie env** : BD de test, éventuellement services externes, ou au minimum des mocks qui simulent vraiment le comportement réel.
- **Plus lents** : ~100ms à 1s par test.
- **Objectif** : le scénario complet marche (API call → métier → BD → réponse).
- **Limiteur** : coûteux en infrastructure, difficiles à maintenir si les données ne sont pas isolées.

**3. Tests de contrat** (la réponse, `E`)
- Testent que la structure de la réponse respecte le schéma attendu : champs présents, types corrects, codes HTTP standards.
- **Contre une vrai API** : soit une version déployée, soit un mock qui simule le comportement réel.
- **Rapides si tu testes le contrat, lents si tu rejoues les scénarios** : dépend de l'implémentation.
- **Objectif** : les clients (frontend, mobile, partenaires) ne cassent pas parce que tu as changé un champ.
- **Limiteur** : ne détectent pas les bugs de logique (réponse a la bonne structure, mais les données sont fausses).

**4. Tests de charge** (la performance sous charge, `F`)
- Testent qu'avec N requêtes/sec, tu ne cassent pas, tu ne deviens pas très très lent, tu ne perds pas de données.
- **Sur une env de test configurée comme la prod** : même DB, même cache, même infra.
- **Lents à l'exécution** : génèrent beaucoup de charge.
- **Objectif** : tu peux supporter 1000 requêtes/sec avec p95 latency < 200ms.
- **Limiteur** : coûteux, complexes à automatiser, nécessitent une infra suffisante.

💡 **La pyramide, en pratique :**
- ~70% tests unitaires (rapides, maintenables, bonne couverture logique).
- ~20% tests d'intégration (protègent les scénarios critiques).
- ~10% tests de contrat et charge (assurent la stabilité et la performance).

---

## Construire une suite de tests : v1 manuelle → v3 automatisée

### v1 : Tests manuels Postman (l'état actuel)

Vous lancez Postman, créez une collection avec 20 requêtes, testez manuellement avant chaque déploiement. **Problèmes évidentes :**

- **Pas reproductible** : dépend d'un état spécifique de la BD. Si quelqu'un a créé un user avec le même email, le test `POST /users` échoue.
- **Pas automatisable** : tu dois cliquer sur chaque requête à la main.
- **Pas versionné** : tu modifies la collection Postman, personne d'autre ne voit les changements. Le test qu'on a fait hier ne rejase pas aujourd'hui.
- **Invisible** : tu ne sais pas ce qui a été testé réellement.

**Quand garder Postman :** pour l'exploration manuelle et le debug ad-hoc. Pas pour les tests ci/cd.

### v2 : Tests automatisés avec pytest (minimal)

```python
# tests/test_users_api.py
import pytest
import requests
from datetime import datetime

BASE_URL = "http://localhost:8000"

@pytest.fixture(autouse=True)
def clean_db():
    """Reinitialize test DB before each test"""
    requests.post(f"{BASE_URL}/admin/reset")
    yield
    # Cleanup after test

def test_create_user_success():
    """POST /users returns 201 and user object"""
    payload = {
        "email": "alice@example.com",
        "name": "Alice",
        "role": "user"
    }
    
    response = requests.post(f"{BASE_URL}/users", json=payload)
    
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "alice@example.com"
    assert data["id"] is not None
    assert data["created_at"] is not None

def test_create_user_duplicate_email():
    """POST /users with duplicate email returns 409"""
    payload = {"email": "bob@example.com", "name": "Bob", "role": "user"}
    
    # First creation should succeed
    response1 = requests.post(f"{BASE_URL}/users", json=payload)
    assert response1.status_code == 201
    
    # Second creation with same email should fail
    response2 = requests.post(f"{BASE_URL}/users", json=payload)
    assert response2.status_code == 409
    assert "already exists" in response2.json()["error"]

def test_get_user_not_found():
    """GET /users/{id} with invalid ID returns 404"""
    response = requests.get(f"{BASE_URL}/users/99999")
    assert response.status_code == 404

def test_update_user_partial():
    """PATCH /users/{id} updates only specified fields"""
    # Create a user
    create_resp = requests.post(
        f"{BASE_URL}/users", 
        json={"email": "charlie@example.com", "name": "Charlie", "role": "user"}
    )
    user_id = create_resp.json()["id"]
    
    # Update only the name
    update_resp = requests.patch(
        f"{BASE_URL}/users/{user_id}",
        json={"name": "Charles"}
    )
    
    assert update_resp.status_code == 200
    data = update_resp.json()
    assert data["name"] == "Charles"
    assert data["email"] == "charlie@example.com"  # Email unchanged

def test_delete_user():
    """DELETE /users/{id} removes user, GET returns 404"""
    # Create
    create_resp = requests.post(
        f"{BASE_URL}/users", 
        json={"email": "david@example.com", "name": "David", "role": "user"}
    )
    user_id = create_resp.json()["id"]
    
    # Delete
    delete_resp = requests.delete(f"{BASE_URL}/users/{user_id}")
    assert delete_resp.status_code == 204
    
    # Verify gone
    get_resp = requests.get(f"{BASE_URL}/users/{user_id}")
    assert get_resp.status_code == 404
```

**Ce qu'on a gagné :**

✅ Reproductible : `@pytest.fixture(autouse=True)` reset la DB avant chaque test.  
✅ Automatisable : `pytest tests/` exécute tout, pas d'interaction manuelle.  
✅ Versionné : le fichier `.py` est dans git, l'historique est tracé.  
✅ Visible : tu vois exactement quel scénario est testé.

**Problèmes restants :**

- **Dépendance à une env** : les tests supposent qu'il y a une API en local à `localhost:8000`. Si ce n'est pas le cas, tout échoue.
- **État de la BD non isolé** : si le reset échoue, les tests suivants utilisent les données des tests précédents.
- **Pas de gestion des erreurs réseau** : si l'API est lente ou timeout, le test échoue (pas d'assertions précises).
- **Duplication de setup** : chaque test refait la même initialisation.

### v3 : Tests robustes avec fixtures réutilisables et isolation

```python
# tests/conftest.py — Configuration partagée
import pytest
import requests
from contextlib import contextmanager
import os

BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")
DB_URL = os.getenv("DATABASE_URL", "postgresql://test:test@localhost/api_test")

@pytest.fixture(scope="session")
def api_client():
    """Create a reusable HTTP client with base URL"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session

@pytest.fixture
def db_connection():
    """Direct database connection for setup/teardown"""
    import psycopg2
    conn = psycopg2.connect(DB_URL)
    yield conn
    conn.close()

@pytest.fixture
def reset_users_table(db_connection):
    """Truncate users table before each test (fast + atomic)"""
    cursor = db_connection.cursor()
    cursor.execute("TRUNCATE users CASCADE")  # CASCADE handles foreign keys
    db_connection.commit()
    cursor.close()
    yield
    # Implicit cleanup on fixture teardown

@pytest.fixture
def test_user(api_client, reset_users_table):
    """Factory: create a test user, return user object"""
    payload = {
        "email": "testuser@example.com",
        "name": "Test User",
        "role": "user"
    }
    response = api_client.post(f"{BASE_URL}/users", json=payload)
    assert response.status_code == 201, f"Failed to create test user: {response.text}"
    return response.json()
```

```python
# tests/test_users_api_robust.py
import pytest
from datetime import datetime

class TestUserCreation:
    def test_create_user_with_all_fields(self, api_client):
        """Verify all required fields are present in response"""
        payload = {
            "email": "new@example.com",
            "name": "New User",
            "role": "admin"
        }
        
        response = api_client.post("http://localhost:8000/users", json=payload)
        
        assert response.status_code == 201, f"Unexpected status: {response.text}"
        user = response.json()
        
        # Assertions explicites : pas d'hypothèses cachées
        assert "id" in user, "Response missing 'id' field"
        assert user["id"] > 0, "ID should be positive integer"
        assert user["email"] == "new@example.com"
        assert user["name"] == "New User"
        assert user["role"] == "admin"
        assert "created_at" in user
        assert isinstance(user["created_at"], str)
        
        # Verify timestamp is recent (within last 5 seconds)
        created = datetime.fromisoformat(user["created_at"])
        now = datetime.utcnow()
        assert (now - created).total_seconds() < 5

    def test_create_user_missing_required_field(self, api_client):
        """POST without 'email' should return 400 with error message"""
        payload = {"name": "Incomplete User", "role": "user"}
        
        response = api_client.post("http://localhost:8000/users", json=payload)
        
        assert response.status_code == 400
        error = response.json()
        assert "error" in error or "message" in error
        assert "email" in str(error).lower()

    def test_create_user_invalid_email(self, api_client):
        """Email validation should reject invalid formats"""
        invalid_emails = ["notanemail", "user@", "@example.com", "user @example.com"]
        
        for bad_email in invalid_emails:
            payload = {"email": bad_email, "name": "Bad Email User", "role": "user"}
            response = api_client.post("http://localhost:8000/users", json=payload)
            
            assert response.status_code == 400, f"Should reject email: {bad_email}"

class TestUserRetrieval:
    def test_get_existing_user(self, api_client, test_user):
        """GET /users/{id} returns the user that was created"""
        user_id = test_user["id"]
        
        response = api_client.get(f"http://localhost:8000/users/{user_id}")
        
        assert response.status_code == 200
        retrieved = response.json()
        assert retrieved["id"] == user_id
        assert retrieved["email"] == test_user["email"]

    def test_get_nonexistent_user_returns_404(self, api_client):
        """GET with invalid ID should return 404, not 500"""
        response = api_client.get("http://localhost:8000/users/999999")
        
        assert response.status_code == 404, "Should return 404 for missing user"
        error = response.json()
        assert "not found" in str(error).lower()

class TestUserUpdate:
    def test_update_idempotent_on_retry(self, api_client, test_user):
        """PATCH /users/{id} should be idempotent"""
        user_id = test_user["id"]
        update_payload = {"name": "Updated Name"}
        
        # First PATCH
        resp1 = api_client.patch(
            f"http://localhost:8000/users/{user_id}",
            json=update_payload
        )
        assert resp1.status_code == 200
        result1 = resp1.json()
        
        # Second identical PATCH should return the same result
        resp2 = api_client.patch(
            f"http://localhost:8000/users/{user_id}",
            json=update_payload
        )
        assert resp2.status_code == 200
        result2 = resp2.json()
        
        # Results should be identical
        assert result1 == result2, "Idempotent operation should return same result"

class TestUserDeletion:
    def test_delete_user_returns_204_not_200(self, api_client, test_user):
        """DELETE should return 204 No Content, not 200"""
        user_id = test_user["id"]
        
        response = api_client.delete(f"http://localhost:8000/users/{user_id}")
        
        assert response.status_code == 204, "DELETE should return 204"
        assert response.text == "", "204 should have empty body"
        
        # Verify user is gone
        get_resp = api_client.get(f"http://localhost:8000/users/{user_id}")
        assert get_resp.status_code == 404

    def test_delete_nonexistent_user(self, api_client):
        """DELETE nonexistent user should return 404, not 204"""
        response = api_client.delete("http://localhost:8000/users/999999")
        
        assert response.status_code == 404
```

**Améliorations clés :**

✅ **Fixtures réutilisables** : `test_user` est un factory, plusieurs tests l'utilisent sans duplication.  
✅ **Isolation complète** : `TRUNCATE users CASCADE` avant chaque test garantit aucune pollution de données.  
✅ **Assertions explicites** : chaque assertion dit ce qu'elle teste, facilite le debug.  
✅ **Gestion d'erreurs** : on vérifie que les erreurs ont la structure attendue (pas juste un status code).  
✅ **Idempotence** : on teste que les opérations sont reproductibles.

⚠️ **Erreur fréquente** : tester seulement le happy path. Les cas d'erreur (400, 404, 500) sont aussi importants que les succès, parce que c'est là que les intégrations cassent.

---

## Diagnostic : erreurs et défaillances fréquentes

### Symptôme 1 : Test passe localement, échoue en CI

```
✅ python -m pytest tests/ (en local) → tous les tests passent
❌ CI/CD pipeline → 3 tests échouent avec timeout
```

**Causes probables :**

| Cause | Diagnostic | Correction |
|-------|-----------|-----------|
| API n'est pas démarrée en CI | Les logs CI montrent "Connection refused" | Ajouter une étape `start_server.sh` ou utiliser un service Docker en CI |
| Base de données en CI est différente | Test utilise `localhost:5432`, CI utilise une DB cloud | Utiliser des variables d'env : `DATABASE_URL` en CI vs `.env` en local |
| Données non isolées | Test A crée un user, Test B assume cette BD vide | Ajouter le fixture `reset_users_table` à tous les tests |
| Timing : test trop rapide | Test attend une webhook callback, mais elle arrive en async | Ajouter une boucle retry : attendre max 5s, recheck chaque 100ms |

**Correction rapide :**

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: api_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Start API server
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/api_test
        run: |
          python -m uvicorn app:app --host 127.0.0.1 --port 8000 &
          sleep 2  # Give server time to start
      
      - name: Run tests
        env:
          API_BASE_URL: http://127.0.0.1:8000
          DATABASE_URL: postgresql://postgres:test@localhost:5432/api_test
        run: python -m pytest tests/ -v
```

### Symptôme 2 : Faux positif — test passe même quand l'endpoint est cassé

```python
# ❌ Test insuffisant
def test_user_creation():
    response = requests.post("http://localhost:8000/users", json={"email": "a@b.com"})
    assert response.status_code == 201  # ✓ Passe

# Mais l'endpoint retourne : {"email": "wrong_field_name"}
# Le test ne vérife PAS la structure de la réponse
```

**Causes :**

1. Assertion sur le status code uniquement, pas la structure de la réponse
2. Pas de vérification que les champs requis sont présents
3. Pas de validation du type des champs

**Correction :**

```python
# ✅ Test complet
def test_user_creation():
    response = requests.post(
        "http://localhost:8000/users", 
        json={"email": "a@b.com", "name": "Alice"}
    )
    
    assert response.status_code == 201
    data = response.json()
    
    # Vérifie la structure exacte
    assert "id" in data, "Missing 'id' field"
    assert isinstance(data["id"], int), "'id' should be integer"
    assert "email" in data
    assert data["email"] == "a@b.com"
    assert "created_at" in data
    assert isinstance(data["created_at"], str)
    
    # Utiliser une libraire de validation pour automatiser ça
    from jsonschema import validate
    schema = {
        "type": "object",
        "properties": {
            "id": {"type": "integer"},
            "email": {"type": "string", "format": "email"},
            "created_at": {"type": "string", "format": "date-time"}
        },
        "required": ["id", "email", "created_at"]
    }
    validate(instance=data, schema=schema)
```

💡 **Astuce :** générer les schémas automatiquement depuis votre Swagger/OpenAPI, plutôt que de les écrire à la main.

### Symptôme 3 : État persistant — test B échoue s'il y a test A avant

```python
# Test A
def test_create_user():
    requests.post("http://localhost:8000/users", json={"email": "a@example.com"})
    # Bug : on ne nettoie pas après

# Test B
def test_user_email_unique():
    # Assume la BD est vide, mais elle contient l'user de Test A
    requests.post("http://localhost:8000/users", json={"email": "new@example.com"})
    # Passe en isolation, échoue quand Test A s'exécute avant
```

**Causes :**

- Pas de `@pytest.fixture(autouse=True)` qui reset la BD
- Fixture reset, mais elle ne reset que partiellement (oublie une table)
- Test exécuté en parallèle : Test A reset, Test B crée, Test A écrit → race condition

**Correction :**

```python
# conftest.py
import pytest

@pytest.fixture(autouse=True)
def clean_db(db_connection):
    """Reset all tables before each test"""
    cursor = db_connection.cursor()
    # Reset dans l'ordre des dépendances (foreign keys)
    cursor.execute("TRUNCATE users CASCADE")
    cursor.execute("TRUNCATE api_keys CASCADE")
    db_connection.commit()
    cursor.close()
    yield
    # Optionnel : cleanup après
    # cursor.execute("TRUNCATE users CASCADE")
    # db_connection.commit()
```

```bash
# Exécuter les tests séquentiellement, pas en parallèle
pytest tests/ -n 0  # Désactive pytest-xdist
```

### Symptôme 4 : Timing — test échoue "aléatoirement"

```python
# ❌ Test instable
def test_async_notification():
    response = requests.post("http://localhost:8000/users", json={"email": "a@b.com"})
    user_id = response.json()["id"]
    
    # L'endpoint envoie un email EN ARRIÈRE-PLAN (async)
    # Mais le test check immédiatement
    
    emails = requests.get("http://localhost:8000/emails").json()
    assert len(emails) == 1  # Échoue : l'email n'a pas eu le temps d'arriver
```

**Causes :**

- Opération asynchrone (job queue, webhook, email)
- Pas d'attente explicite
- Timeout trop court

**Correction — Boucle de retry :**

```python
import time

def wait_for_email(max_attempts=50, delay_ms=100):
    """Poll until email arrives, max 5 seconds"""
    for attempt in range(max_attempts):
        emails = requests.get("http://localhost:8000/emails").json()
        if len(emails) > 0:
            return emails[0]
        time.sleep(delay_ms / 1000)
    
    raise AssertionError(f"Email did not arrive after {max_attempts * delay_ms}ms")

def test_async_notification():
    response = requests.post("http://localhost:8000/users", json={"email": "a@b.com"})
    
    # Attend l'email avec timeout
    email = wait_for_email()
    assert "a@b.com" in email["to"]
```

⚠️ **Erreur fréquente** : `time.sleep(5)` inconditionnellement. C'est lent et fragile. Préférez une boucle retry.

###