---
layout: page
title: "Tests API"

course: api-rest
chapter_title: "Tests API"

chapter: 8
section: 1

tags: api, tests, diagnostic, http, postman, curl, automatisation, ci-cd
difficulty: intermediate
duration: 75
mermaid: true

icon: "🧪"
domain: api-rest
domain_icon: "🔌"
status: "published"
---

# Tests API

## Objectifs pédagogiques

À l'issue de ce module, vous serez capable de :

1. **Identifier** les différentes couches de tests d'une API et savoir laquelle activer selon le problème rencontré
2. **Diagnostiquer** un comportement inattendu d'une API en isolant la source (code statut, payload, headers, auth)
3. **Écrire** des tests automatisés reproductibles avec des outils concrets (pytest, Newman, k6)
4. **Intégrer** une suite de tests API dans une pipeline CI/CD
5. **Distinguer** un test fonctionnel, un test de contrat et un test de charge — et savoir quand en avoir besoin

---

## Mise en situation

Vous êtes intégrateur dans une équipe qui expose une API de gestion de commandes à des partenaires e-commerce. Tout semble fonctionner en développement. Puis un jour, un partenaire appelle : son système de facturation reçoit des `200 OK` en réponse à des créations de commandes — mais les commandes n'apparaissent jamais en base.

Vous cherchez dans les logs. Rien d'évident. Le problème remonte depuis trois semaines mais personne ne l'avait détecté parce que les tests manuels étaient faits à la main, à la volée, sans vérifier le corps de réponse — juste le code statut.

C'est exactement ce que ce module cherche à éviter : tester une API "à l'œil" ne suffit pas en production. Il faut des tests qui vérifient ce qui compte vraiment, qui tournent automatiquement, et qui crient quand quelque chose change de façon inattendue.

---

## Contexte et problématique

Tester une API n'est pas la même chose que tester une fonction unitaire. Une API est une surface contractuelle exposée à l'extérieur — parfois à des tiers. Le moindre changement de comportement (un champ renommé, un code statut mal choisi, une validation silencieuse) peut casser des intégrations entières.

Le problème avec les tests manuels, c'est qu'ils sont invisibles. On fait un `curl`, on regarde la réponse, on dit "ça marche". Mais ça marche *maintenant*, *avec ce jeu de données*, *avec cette version du service*. Si on ne fixe pas les attentes dans du code, on ne saura pas quand ça cesse de marcher.

L'autre piège fréquent : tester uniquement le "happy path". L'API renvoie `200` quand on lui envoie des données valides ? Bien. Mais que se passe-t-il si le token est expiré ? Si le body est vide ? Si deux requêtes identiques arrivent simultanément ? Ce sont précisément ces cas qui font tomber les systèmes en production.

---

## Les grandes familles de tests API

Avant de plonger dans les outils, posons les bases. Il existe plusieurs types de tests, chacun répondant à une question différente.

| Type | Question posée | Granularité | Exemple concret |
|---|---|---|---|
| **Fonctionnel** | Est-ce que l'API fait ce qu'elle promet ? | Endpoint par endpoint | `POST /orders` crée bien une commande |
| **Contrat** | Est-ce que la réponse respecte le schéma attendu ? | Champs, types, formats | Le champ `id` est toujours un UUID |
| **Régression** | Est-ce qu'un changement a cassé quelque chose ? | Suite complète | Déploiement → run → comparaison |
| **Charge / perf** | Est-ce que l'API tient sous pression ? | Throughput, latence | 500 req/s sans dégradation |
| **Sécurité** | Est-ce que l'API résiste aux attaques ? | Auth, injection, CORS | Token invalide → `401`, pas `500` |

En pratique, une équipe saine maintient au minimum des tests **fonctionnels** et **de contrat** dans sa CI. Les tests de charge arrivent plus tard, en pré-production.

---

## Diagnostiquer une réponse API : ce qu'il faut regarder

Quand une API se comporte mal, on a tendance à s'arrêter au code statut. C'est rarement suffisant. Voici comment structurer l'analyse :

```
Réponse HTTP
├── Code statut         → indique la catégorie du résultat
├── Headers             → Content-Type, Location, X-RateLimit, WWW-Authenticate
├── Corps (body)        → payload JSON, message d'erreur, champs manquants
└── Temps de réponse    → latence anormale = indice de problème upstream
```

> ⚠️ **Erreur fréquente** : un `200 OK` ne signifie pas que la requête a réussi métier. Certaines API retournent `200` avec un body `{"error": "invalid_token"}`. Toujours vérifier le corps.

Avec `curl`, l'option `-v` (verbose) affiche les headers request/response complets. L'option `-w` permet d'extraire des métriques précises :

```bash
curl -s -o /dev/null -w "Status: %{http_code} | Time: %{time_total}s" \
  -H "Authorization: Bearer <TOKEN>" \
  https://api.exemple.com/orders
```

```bash
# Avec des valeurs réelles
curl -s -o /dev/null -w "Status: %{http_code} | Time: %{time_total}s" \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiJ9..." \
  https://api.exemple.com/orders
```

---

## Construction progressive : des tests manuels aux tests automatisés

### Étape 1 — Tester manuellement avec intention

Un test manuel utile, c'est un test où vous avez défini *avant* ce que vous attendez. Pas "je lance la requête et je vois ce qui sort", mais "je m'attends à un `201` avec un champ `id` dans la réponse".

Dans Postman, ça se traduit par des **tests scripts** dans l'onglet "Tests" :

```javascript
pm.test("Statut 201 - commande créée", () => {
    pm.response.to.have.status(201);
});

pm.test("Body contient un ID", () => {
    const json = pm.response.json();
    pm.expect(json).to.have.property("id");
    pm.expect(json.id).to.match(/^[0-9a-f-]{36}$/); // UUID
});

pm.test("Content-Type est JSON", () => {
    pm.expect(pm.response.headers.get("Content-Type")).to.include("application/json");
});
```

> 💡 **Astuce** : dans Postman, utilisez les **environments** pour stocker les tokens et URLs. Ça évite de coder en dur des valeurs qui changent selon l'environnement (dev / staging / prod).

### Étape 2 — Automatiser avec pytest + requests

Sortir de Postman pour passer à du code Python, c'est le bon moment dès que vous avez plus de 5-6 endpoints à couvrir ou que vous voulez intégrer ça dans une CI.

```python
# tests/test_orders_api.py
import pytest
import requests

BASE_URL = "https://api.exemple.com"
HEADERS = {"Authorization": "Bearer <TOKEN>", "Content-Type": "application/json"}

def test_create_order_returns_201():
    payload = {"product_id": "prod-42", "quantity": 2}
    response = requests.post(f"{BASE_URL}/orders", json=payload, headers=HEADERS)
    
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert isinstance(data["id"], str)

def test_create_order_without_product_id_returns_400():
    payload = {"quantity": 2}  # champ obligatoire manquant
    response = requests.post(f"{BASE_URL}/orders", json=payload, headers=HEADERS)
    
    assert response.status_code == 400
    error = response.json()
    assert "error" in error  # l'API doit expliquer pourquoi

def test_get_order_unknown_id_returns_404():
    response = requests.get(f"{BASE_URL}/orders/id-qui-nexiste-pas", headers=HEADERS)
    assert response.status_code == 404

def test_unauthenticated_request_returns_401():
    response = requests.get(f"{BASE_URL}/orders")  # sans header Authorization
    assert response.status_code == 401
```

Structure logique : on teste d'abord le cas nominal, puis les cas d'erreur attendus. Les tests de cas d'erreur sont souvent plus précieux que les tests du happy path.

```bash
# Lancer les tests
pytest tests/test_orders_api.py -v

# Avec rapport de couverture
pytest tests/ -v --tb=short
```

### Étape 3 — Validation de contrat avec jsonschema

Un test fonctionnel vérifie que le statut est correct. Un test de contrat vérifie que la structure de la réponse respecte ce qui a été promis aux consommateurs.

```python
import jsonschema

ORDER_SCHEMA = {
    "type": "object",
    "required": ["id", "status", "created_at", "items"],
    "properties": {
        "id":         {"type": "string", "format": "uuid"},
        "status":     {"type": "string", "enum": ["pending", "confirmed", "shipped"]},
        "created_at": {"type": "string", "format": "date-time"},
        "items":      {
            "type": "array",
            "minItems": 1,
            "items": {
                "type": "object",
                "required": ["product_id", "quantity"],
                "properties": {
                    "product_id": {"type": "string"},
                    "quantity":   {"type": "integer", "minimum": 1}
                }
            }
        }
    }
}

def test_order_response_matches_contract():
    response = requests.post(f"{BASE_URL}/orders",
                             json={"product_id": "prod-42", "quantity": 1},
                             headers=HEADERS)
    assert response.status_code == 201
    
    try:
        jsonschema.validate(instance=response.json(), schema=ORDER_SCHEMA)
    except jsonschema.ValidationError as e:
        pytest.fail(f"Contrat violé : {e.message}")
```

> 🧠 **Concept clé** : les tests de contrat sont particulièrement utiles dans les architectures microservices. Si le service A consomme le service B, les tests de contrat détectent une rupture de compatibilité *avant* le déploiement — pas après.

### Étape 4 — Exporter et rejouer avec Newman (Postman en CLI)

Si votre équipe a déjà construit une collection Postman, inutile de tout réécrire. Newman permet de rejouer cette collection en ligne de commande, idéal pour la CI.

```bash
# Installation
npm install -g newman

# Lancer une collection avec un environnement
newman run collection_orders.json \
  -e environment_staging.json \
  --reporters cli,junit \
  --reporter-junit-export results.xml
```

Le fichier `results.xml` peut être consommé par Jenkins, GitLab CI, ou GitHub Actions pour afficher les résultats directement dans la pipeline.

---

## Intégration dans une pipeline CI/CD

Voici comment les tests s'articulent dans un pipeline typique :

```mermaid
flowchart LR
    A[Push / PR] --> B[Build]
    B --> C[Tests unitaires]
    C --> D[Déploiement staging]
    D --> E[Tests API fonctionnels]
    E --> F{OK ?}
    F -->|Oui| G[Tests de contrat]
    G --> H{OK ?}
    H -->|Oui| I[Déploiement prod]
    H -->|Non| J[🚫 Blocage + alerte]
    F -->|Non| J
```

Exemple de configuration GitHub Actions :

```yaml
# .github/workflows/api-tests.yml
name: API Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: "3.11"

      - name: Install dependencies
        run: pip install pytest requests jsonschema

      - name: Run API tests
        env:
          API_TOKEN: ${{ secrets.API_TOKEN }}
          BASE_URL: ${{ vars.STAGING_URL }}
        run: pytest tests/ -v --tb=short --junitxml=results.xml

      - name: Publish test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: results.xml
```

> ⚠️ **Erreur fréquente** : mettre le token d'API en clair dans le fichier de config du CI. Toujours utiliser les secrets du CI (`${{ secrets.API_TOKEN }}` sur GitHub Actions, variables CI/CD masquées sur GitLab).

---

## Diagnostic / Erreurs fréquentes

Voici les patterns qui reviennent le plus souvent quand les tests API dysfonctionnent ou ne détectent pas ce qu'ils devraient.

---

**Symptôme : les tests passent en local mais échouent en CI**

Cause : les tests dépendent d'un état laissé par un test précédent (une commande créée en étape 1 est utilisée en étape 3). En CI, l'ordre d'exécution peut différer, ou la base de données est vide.

Correction : chaque test doit créer ses propres données et nettoyer après lui. Utiliser des fixtures pytest pour l'initialisation :

```python
@pytest.fixture
def created_order(auth_headers):
    response = requests.post(f"{BASE_URL}/orders",
                             json={"product_id": "prod-test", "quantity": 1},
                             headers=auth_headers)
    order_id = response.json()["id"]
    yield order_id
    # Nettoyage après le test
    requests.delete(f"{BASE_URL}/orders/{order_id}", headers=auth_headers)
```

---

**Symptôme : le test vérifie `status_code == 200` mais la fonctionnalité est cassée**

Cause : on teste la forme, pas le fond. L'API renvoie `200` avec un body d'erreur.

Correction : toujours vérifier le corps de la réponse, pas seulement le code statut. Ajouter des assertions sur les champs métier critiques.

---

**Symptôme : `ConnectionRefusedError` ou `SSLError` dans les tests**

Cause : l'URL cible n'est pas disponible (service non démarré, mauvaise env var, certificat self-signed en staging).

Correction : vérifier l'env var `BASE_URL`. Pour les certificats self-signed en staging uniquement :

```python
response = requests.get(url, headers=headers, verify=False)
# ⚠️ Ne jamais faire ça en production
```

---

**Symptôme : les tests de charge montrent de la latence mais on ne sait pas d'où elle vient**

Cause : on mesure le temps total sans distinguer le réseau, le traitement serveur et la base de données.

Correction : activer les headers de trace côté serveur (`X-Response-Time`, `Server-Timing`) et les lire dans les tests de performance.

---

## Tests de charge avec k6 (aperçu)

Pour les tests de performance, k6 est l'outil le plus simple à adopter en environnement DevOps. Les scénarios sont écrits en JavaScript, les métriques sortent en JSON ou Prometheus.

```javascript
// load_test_orders.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },   // montée progressive à 50 users
    { duration: '1m',  target: 50 },   // palier stable
    { duration: '10s', target: 0 },    // descente
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% des requêtes < 500ms
    http_req_failed:   ['rate<0.01'],  // moins de 1% d'erreurs
  },
};

export default function () {
  const res = http.post(
    'https://api.exemple.com/orders',
    JSON.stringify({ product_id: 'prod-42', quantity: 1 }),
    { headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer <TOKEN>' } }
  );

  check(res, {
    'status 201': (r) => r.status === 201,
    'latence < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

```bash
k6 run load_test_orders.js
```

> 💡 **Astuce** : ne lancez jamais de tests de charge contre la production sans prévenir l'équipe et sans avoir des circuit breakers en place. Un test de charge mal calibré peut déclencher des alertes PagerDuty à 3h du matin.

---

## Cas réel en entreprise

Une équipe de 6 développeurs backend maintient une API de livraison intégrée avec 12 partenaires logistiques. Chaque partenaire consomme les mêmes endpoints mais s'attend à des formats légèrement différents selon les versions de l'API (v1 et v2 coexistent).

**Problème initial** : lors d'un refactoring du modèle de données, le champ `delivery_date` passe de format `YYYY-MM-DD` à ISO 8601 complet (`YYYY-MM-DDTHH:MM:SSZ`). Les tests manuels ne détectent rien — les développeurs regardent le statut, pas le format du champ. Trois partenaires cassent silencieusement.

**Solution mise en place** :
1. Ajout de tests de contrat sur chaque endpoint exposé, avec un schéma JSON validant le format des dates
2. Création de collections Postman par version d'API, rejouées via Newman à chaque PR
3. Mise en place d'un test de régression "golden file" : la réponse de référence est stockée en JSON et comparée à chaque déploiement

**Résultats** : le déploiement suivant détecte immédiatement la rupture de contrat en CI. Le fix est fait avant la mise en prod. Zéro partenaire impacté.

Le point clé : les tests de contrat sont devenus la barrière de sécurité la plus utile de leur pipeline — pas les tests unitaires, pas les tests de charge. Sur une API publique, c'est ce qui protège les consommateurs.

---

## Bonnes pratiques

**1. Tester les cas d'erreur autant que les cas nominaux.** Les `400`, `401`, `403`, `404` sont aussi des comportements contractuels. Un `500` là où on attendait un `400` est un bug.

**2. Nommer les tests avec l'intention, pas l'implémentation.** `test_create_order_without_product_id_returns_400` est utile. `test_post_orders_2` ne l'est pas.

**3. Isoler chaque test de l'état global.** Un test qui dépend d'un autre test (via des données partagées) est un test qui va se comporter aléatoirement. Fixtures, teardown, base de test dédiée.

**4. Versionner les collections Postman avec le code.** Si le code de l'API est taggué `v2.3.1`, la collection de tests doit l'être aussi. Les deux évoluent ensemble.

**5. Ne jamais supposer que `200 OK` = succès métier.** Ajouter systématiquement une assertion sur au moins un champ du body critique.

**6. Mesurer la couverture des endpoints, pas des lignes.** En tests API, la métrique utile c'est : "combien d'endpoints et de cas d'erreur sont couverts", pas la couverture de code au sens strict.

**7. Ajouter des tests de régression à chaque bug corrigé.** Quand un bug est trouvé en production, la première chose à faire avant de le corriger : écrire le test qui l'aurait détecté.

**8. Séparer les tests par environnement.** Certains tests (destructifs, de charge) ne doivent jamais tourner en production. Utiliser des flags ou des fichiers de configuration distincts.

---

## Résumé

Tester une API sérieusement, ce n'est pas vérifier que le `curl` renvoie `200`. C'est valider un contrat — entre votre code et ses consommateurs, entre la version actuelle et les déploiements futurs.

Ce module couvre les quatre niveaux pratiques : le test manuel avec intention (Postman + scripts), les tests automatisés reproductibles (pytest + requests), la validation de contrat (jsonschema), et l'intégration CI/CD (Newman, GitHub Actions). Les tests de charge avec k6 complètent le tableau pour les besoins de performance.

Le pattern central à retenir : chaque type de test répond à une question différente, et une API robuste en production a besoin des trois premiers au minimum dans sa pipeline. Le prochain niveau naturel est la documentation contractuelle avec OpenAPI — qui peut servir de source de vérité pour générer automatiquement des tests de contrat.

---

<!-- snippet
id: api_tests_curl_metrics
type: command
tech: curl
level: intermediate
importance: high
tags: curl, api, diagnostic, http, latence
title: Extraire statut et temps de réponse avec curl
command: curl -s -o /dev/null -w "Status: %{http_code} | Time: %{time_total}s" -H "Authorization: Bearer <TOKEN>" <URL>
example: curl -s -o /dev/null -w "Status: %{http_code} | Time: %{time_total}s" -H "Authorization: Bearer eyJhbGciOiJSUzI1NiJ9..." https://api.exemple.com/orders
description: -s masque la progression, -o /dev/null supprime le body, -w extrait les métriques sans polluer la sortie — idéal pour un diagnostic rapide
-->

<!-- snippet
id: api_tests_200_ok_piege
type: warning
tech: api
level: intermediate
importance: high
tags: http, statut, diagnostic, api, erreur
title: 200 OK ne garantit pas un succès métier
content: Piège : certaines API retournent 200 avec un body {"error": "invalid_token"} ou {"success": false}. Conséquence : un test qui vérifie uniquement status_code == 200 laisse passer des bugs silencieux. Correction : toujours ajouter une assertion sur au moins un champ métier du body (ex : assert "id" in response.json()).
description: Un 200 OK indique que le serveur a répondu, pas que l'opération a réussi — toujours vérifier le corps de la réponse
-->

<!-- snippet
id: api_tests_pytest_fixture_teardown
type: tip
tech: pytest
level: intermediate
importance: high
tags: pytest, fixture, isolation, tests, api
title: Isoler les tests API avec des fixtures pytest + teardown
content: Déclarer une fixture qui crée les données nécessaires au test ET les supprime après via yield. Exemple : créer une commande en setup, yield son id, supprimer la commande en teardown. Ça évite les effets de bord entre tests et rend la suite rejouable à l'infini.
description: Un test qui dépend de données créées par un autre test est un test non déterministe — les fixtures avec yield règlent ça proprement
-->

<!-- snippet
id: api_tests_jsonschema_contrat
type: concept
tech: python
level: intermediate
importance: high
tags: jsonschema, contrat, validation, api, schema
title: Validation de contrat API avec jsonschema
content: jsonschema.validate(instance=response.json(), schema=SCHEMA) lève une ValidationError si un champ manque, a le mauvais type ou une valeur hors enum. Le schéma définit required, type, format et enum. Cette vérification est indépendante du code statut — elle garantit que la structure de réponse reste stable entre les déploiements, ce qui protège les consommateurs de l'API.
description: Les tests de contrat détectent les ruptures de structure (champ renommé, type changé) avant qu'elles n'impactent les consommateurs en production
-->

<!-- snippet
id: api_tests_newman_cli
type: command
tech: newman
level: intermediate
importance: medium
tags: newman, postman, ci-cd, automatisation, api
title: Rejouer une collection Postman en CLI avec Newman
command: newman run <COLLECTION.json> -e <ENVIRONMENT.json> --reporters cli,junit --reporter-junit-export results.xml
example: newman run collection_orders.json -e environment_staging.json --reporters cli,junit --reporter-junit-export results.xml
description: Newman permet d'exécuter une collection Postman existante en CI — le fichier XML généré est lisible par Jenkins, GitLab CI et GitHub Actions
-->

<!-- snippet
id: api_tests_secrets_ci
type: warning
tech: ci-cd
level: intermediate
importance: high
tags: securite, ci-cd, secrets, token, api
title: Ne jamais écrire un token API en clair dans la config CI
content: Piège : stocker un token API directement dans le fichier .github/workflows ou .gitlab-ci.yml. Conséquence : le token est exposé dans l'historique git et lisible par quiconque a accès au repo. Correction : utiliser les secrets du CI (${{ secrets.API_TOKEN }} sur GitHub Actions, variables CI/CD masquées sur GitLab) et les injecter en variable d'environnement au moment du run.
description: Un token en clair dans un fichier de CI est un secret compromis dès le premier commit — utiliser les secrets natifs de la plateforme CI
-->

<!-- snippet
id: api_tests_k6_thresholds
type: tip
tech: k6
level: intermediate
importance: medium
tags: k6, performance, seuils, charge, api
title: Définir des seuils de performance k6 qui font échouer la CI
content: Dans les options k6, déclarer thresholds : { http_req_duration: ['p(95)<500'], http_req_failed: ['rate<0.01'] }. Si ces seuils sont dépassés, k6 retourne un exit code non-zéro et bloque la pipeline CI. Calibrer p(95) < 500ms pour la latence et < 1% d'erreurs comme point de départ raisonnable pour une API CRUD standard.
description: Sans thresholds, k6 produit des métriques mais ne fait jamais échouer la CI — les seuils transforment un rapport en vrai gate de qualité
-->

<!-- snippet
id: api_tests_regression_bug
type: tip
tech: pytest
level: intermediate
importance: medium
tags: regression, tests, bugs, qualite, api
title: Écrire le test avant de corriger un bug de production
content: Dès qu'un bug API est identifié en production, écrire le test qui l'aurait détecté AVANT de coder le fix. Lancer le test → il doit échouer (rouge). Corriger le bug. Lancer le test → il doit passer (vert). Ce test de régression reste dans la suite permanente et garantit que le bug ne reviendra pas silencieusement.
description: Un bug sans test de régression associé a de bonnes chances de revenir — écrire le test en premier force à comprendre la cause exacte
-->

<!-- snippet
id: api_tests_cas_erreur_contrat
type: concept
tech: api
level: intermediate
importance: high
tags: api, contrat, erreurs, 400, 404, tests
title: Les codes d'erreur sont aussi des comportements contractuels
content: Un 400, 401, 403 ou 404 est un comportement promis aux consommateurs, au même titre qu'un 200. Tester uniquement le happy path laisse sans filet tous les cas limites. Un 500 là où on attendait un 400 (validation manquante côté serveur) est un bug de contrat. Les tests d'erreur sont souvent plus révélateurs de la robustesse réelle d'une API que les tests nominaux.
description: Couvrir les codes d'erreur attendus dans les tests est aussi important que de tester le cas nominal — c'est là que les bugs se cachent en prod
-->