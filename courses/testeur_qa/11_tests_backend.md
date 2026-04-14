---
layout: page
title: "Tests backend & unitaires"

course: testeur_qa
chapter_title: "Tests backend & unitaires"

chapter: 5
section: 1

tags: tests unitaires, backend, pytest, jest, tdd, mocking, api testing
difficulty: intermediate
duration: 90
mermaid: false

status: "published"
prev_module: "/courses/testeur_qa/23_strategie_qa.html"
prev_module_title: "Stratégie QA entreprise"
next_module: "/courses/testeur_qa/09_api_testing.html"
next_module_title: "API Testing avancé"
---

# Tests backend & unitaires

## Objectifs pédagogiques

À l'issue de ce module, tu seras capable de :

- Distinguer test unitaire et test d'intégration, et choisir lequel écrire selon la situation
- Écrire des tests unitaires lisibles et maintenables en Python avec pytest
- Utiliser les mocks pour isoler une fonction de ses dépendances externes
- Tester des endpoints API Flask avec des assertions sur le code HTTP et le body JSON
- Identifier pourquoi un test échoue vraiment — et corriger le code de production, pas le test

---

## Mise en situation

Tu rejoins l'équipe QA d'une startup qui développe une API REST pour gérer des commandes. Le backend est en Python (Flask). Aucun test n'existe encore. Une nouvelle feature vient d'être mergée : le calcul du prix total d'une commande, avec une réduction selon le statut du client — VIP, standard, nouveau.

Le développeur te dit : *"Ça marche en local, j'ai testé à la main."*

Ton rôle : écrire les tests qui vont prouver que ça marche — et détecter les cas limites que personne n'a vérifiés.

---

## Pourquoi les tests backend sont différents

Tester une interface, c'est cliquer. Tester un backend, c'est questionner la logique.

La majorité des bugs critiques — calculs faux, règles métier ignorées, données corrompues — ne se voient pas dans l'interface. Ils vivent dans les fonctions, les services, les endpoints. C'est là qu'un testeur QA apporte une vraie valeur technique.

Un test backend bien écrit documente aussi le comportement attendu. Si quelqu'un modifie la fonction de calcul dans six mois, le test va échouer et lui dire exactement ce qui a changé. C'est un filet de sécurité, pas un frein.

🧠 **Tests unitaires vs tests d'intégration** — ce n'est pas une question de niveau de qualité, c'est une question de périmètre. Un test unitaire vérifie une fonction seule, en isolation totale. Un test d'intégration vérifie que plusieurs composants fonctionnent ensemble : une route API et une base de données, par exemple. On commence presque toujours par les tests unitaires, parce qu'ils sont rapides, ciblés, et faciles à déboguer.

---

## Ce qu'on teste vraiment

Avant d'écrire une seule ligne de test, il faut répondre à une question simple : **qu'est-ce que cette fonction est censée faire ?**

Prenons la fonction de calcul de la mise en situation :

```python
def calculate_total(price: float, quantity: int, customer_type: str) -> float:
    """Calcule le prix total avec réduction selon le type de client."""
    base = price * quantity
    if customer_type == "vip":
        return base * 0.85       # -15%
    elif customer_type == "new":
        return base * 0.90       # -10%
    return base                  # pas de réduction pour "standard"
```

Voilà ce qu'on va tester :

- Le cas VIP : réduction de 15 %
- Le cas "new" : réduction de 10 %
- Le cas standard : aucune réduction
- `quantity = 0` : le total doit être zéro
- Un `customer_type` inconnu : que se passe-t-il ?

Ce dernier cas, c'est celui que le développeur n'a probablement pas testé à la main. La fonction renvoie le prix sans réduction, comme si le type était "standard". Est-ce le comportement voulu, ou devrait-elle lever une erreur ? C'est maintenant une question à poser au Product Owner. C'est ça, le travail du QA.

💡 **La règle des cas limites** : pour chaque paramètre, pense à la valeur zéro, la valeur négative, la valeur vide et la valeur inattendue. Ce sont tes meilleurs alliés pour trouver ce qui ne tient pas.

---

## Écrire un test unitaire avec pytest

### Installation et structure

```bash
pip install pytest
pytest --version
```

La convention pytest est simple : les fichiers de test commencent par `test_`, les fonctions aussi. L'organisation recommandée :

```
project/
├── app/
│   └── pricing.py          # le code à tester
└── tests/
    └── test_pricing.py     # les tests
```

### Premiers tests — la structure Arrange / Act / Assert

```python
# tests/test_pricing.py
import pytest
from app.pricing import calculate_total

def test_vip_gets_15_percent_discount():
    # Arrange — données d'entrée
    price = 100.0
    quantity = 2
    customer_type = "vip"

    # Act — appel de la fonction
    result = calculate_total(price, quantity, customer_type)

    # Assert — vérification du résultat
    assert result == pytest.approx(170.0)    # 200 * 0.85 = 170

def test_new_customer_gets_10_percent_discount():
    result = calculate_total(50.0, 3, "new")
    assert result == pytest.approx(135.0)    # 150 * 0.90 = 135

def test_standard_customer_has_no_discount():
    result = calculate_total(100.0, 1, "standard")
    assert result == pytest.approx(100.0)

def test_zero_quantity_returns_zero():
    result = calculate_total(100.0, 0, "vip")
    assert result == pytest.approx(0.0)
```

🧠 **Arrange / Act / Assert** — cette structure force à séparer ce qu'on prépare, ce qu'on exécute, et ce qu'on vérifie. Un test illisible cache souvent un mauvais découpage. Quand tu n'arrives pas à isoler ces trois parties, c'est souvent le code de production qui mélange trop de responsabilités.

Tu remarques l'usage de `pytest.approx()` dès le départ. C'est intentionnel : les opérations sur les flottants produisent régulièrement des résultats comme `170.00000000000001`. Comparer avec `==` fait échouer le test alors que le calcul est correct. `pytest.approx()` applique une tolérance de `1e-6` par défaut — juste ce qu'il faut pour éviter ces faux négatifs.

### Tester qu'une exception est bien levée

```python
def test_unknown_customer_type_raises_error():
    with pytest.raises(ValueError):
        calculate_total(100.0, 1, "unknown_type")
```

Ce test va **échouer** avec le code actuel — la fonction ne lève aucune erreur pour un type inconnu. Ce n'est pas le test qui a tort. C'est une décision de conception qui n'a pas encore été prise. Tu l'as mise en lumière.

### Lancer les tests

```bash
pytest tests/                        # tous les tests du dossier
pytest tests/test_pricing.py -v      # un fichier, mode verbose
pytest -v --tb=short                 # traceback condensé en cas d'échec
```

---

## Aller plus loin : paramétrisation et fixtures

### Le problème avec les tests dupliqués

Les quatre tests qu'on vient d'écrire fonctionnent. Mais si tu dois couvrir dix combinaisons, tu vas écrire dix fonctions quasi-identiques. La maintenance devient pénible et les rapports d'erreur moins lisibles.

### Paramétrisation avec `@pytest.mark.parametrize`

```python
import pytest
from app.pricing import calculate_total

@pytest.mark.parametrize("price,quantity,customer_type,expected", [
    (100.0, 2, "vip",      170.0),   # -15%
    (50.0,  3, "new",      135.0),   # -10%
    (100.0, 1, "standard", 100.0),   # pas de réduction
    (100.0, 0, "vip",        0.0),   # quantité zéro
])
def test_calculate_total(price, quantity, customer_type, expected):
    result = calculate_total(price, quantity, customer_type)
    assert result == pytest.approx(expected)
```

Un seul test, quatre cas couverts. Pytest les exécute indépendamment et nomme chaque cas dans le rapport. C'est la façon propre de tester une fonction avec plusieurs jeux de données.

### Fixtures pour factoriser la préparation

Quand plusieurs tests ont besoin du même contexte — un objet client, une commande pré-construite — les fixtures évitent la répétition et rendent chaque test plus lisible :

```python
import pytest
from app.models import Order, Customer

@pytest.fixture
def vip_customer():
    """Retourne un client VIP prêt à l'emploi."""
    return Customer(id=1, name="Alice", type="vip")

@pytest.fixture
def sample_order(vip_customer):
    """Une commande liée au client VIP."""
    return Order(customer=vip_customer, items=[{"price": 100.0, "qty": 2}])

def test_order_total_for_vip(sample_order):
    assert sample_order.calculate_total() == pytest.approx(170.0)
```

💡 Les fixtures pytest sont injectées par nom dans les arguments de la fonction de test. Pas besoin d'instancier quoi que ce soit dans chaque test — pytest s'en charge.

---

## Mocking — Isoler une fonction de ses dépendances

C'est là où beaucoup de gens bloquent. Imaginons que la fonction ne reçoive plus le type de client en paramètre, mais l'interroge elle-même depuis une base de données :

```python
from app.database import get_customer_type

def calculate_total_v2(price: float, quantity: int, customer_id: int) -> float:
    customer_type = get_customer_type(customer_id)   # appel BDD réel
    base = price * quantity
    if customer_type == "vip":
        return base * 0.85
    return base
```

Tu ne veux pas démarrer une vraie base de données pour tester cette logique. Tu veux juste vérifier que *si* `get_customer_type` retourne `"vip"`, le calcul applique bien la réduction de 15 %. C'est le rôle du **mock** : remplacer la dépendance externe par une version simulée et contrôlée.

```python
from unittest.mock import patch
from app.pricing import calculate_total_v2

def test_vip_discount_with_mock():
    # get_customer_type est remplacé par un mock qui retourne toujours "vip"
    with patch("app.pricing.get_customer_type", return_value="vip"):
        result = calculate_total_v2(100.0, 2, customer_id=42)
        assert result == pytest.approx(170.0)
```

`unittest.mock` fait partie de la bibliothèque standard Python — aucune installation nécessaire.

🧠 **Le mock ne teste pas la dépendance — il la court-circuite.** Tu testes uniquement la logique de la fonction, en supposant que la dépendance fonctionne correctement. Ce sont les tests d'intégration qui vérifieront que les deux fonctionnent ensemble, sur une vraie base.

⚠️ **Trop de mocks = signal d'alerte.** Si la configuration des mocks prend plus de lignes que le test lui-même, la fonction testée mélange probablement logique métier et accès aux données. C'est souvent une violation du principe de responsabilité unique. La solution n'est pas d'ajouter encore plus de mocks — c'est de refactoriser la fonction pour isoler la logique pure, qui deviendra alors testable sans aucun mock.

---

## Tester des endpoints API

Un test unitaire vérifie une fonction. Un test d'API vérifie un endpoint complet : routing, validation des entrées, réponse HTTP. Avec Flask, le client de test est intégré et simule des requêtes en mémoire — aucun serveur, aucun port réseau.

```python
import pytest
from app import create_app

@pytest.fixture
def client():
    app = create_app(config="testing")   # config sans BDD réelle
    with app.test_client() as client:
        yield client

def test_get_order_returns_200(client):
    response = client.get("/api/orders/1")
    assert response.status_code == 200

def test_get_order_response_structure(client):
    response = client.get("/api/orders/1")
    data = response.get_json()

    assert "id" in data
    assert "total" in data
    assert isinstance(data["total"], float)

def test_create_order_with_invalid_data_returns_400(client):
    # Body invalide — le champ "quantity" est absent
    response = client.post("/api/orders", json={"price": 100.0})
    assert response.status_code == 400

def test_unauthorized_access_returns_401(client):
    response = client.get("/api/admin/orders")
    assert response.status_code == 401
```

💡 **Tester les codes d'erreur est aussi important que tester les succès.** Une API qui retourne 200 sur une requête invalide, c'est un bug silencieux — le type de bug qui passe en production et corrompt des données sans que personne ne s'en aperçoive immédiatement. Couvre systématiquement : 400 (données invalides), 401 (non authentifié), 404 (ressource inexistante), 422 (validation échouée).

---

## Erreurs fréquentes et comment les lire

**Le test passe en local mais échoue en CI.**
Cause presque certaine : une dépendance implicite à l'environnement local — un fichier présent, une variable d'environnement non déclarée, une base de données accessible. Correction : chaque test doit être hermétique. Toute dépendance externe est soit mockée, soit injectée via une fixture avec des valeurs explicites. Si ce n'est pas le cas, c'est un test d'intégration déguisé en test unitaire.

---

**Le test échoue, et tu modifies le test pour le faire passer.**
C'est le signe le plus dangereux. Un test qui échoue sur un cas limite, c'est souvent le test qui a raison — et le code de production qui a tort. Quand un test échoue, commence par comprendre pourquoi. Si l'attendu est correct, c'est le code de production qui doit changer.

---

**Les tests passent tous, mais un bug passe quand même en production.**
Les tests couvrent les cas nominaux mais pas les cas limites. Pour chaque paramètre, pose-toi systématiquement la question : que se passe-t-il avec une valeur nulle, vide, négative, ou hors domaine ?

---

## Bonnes pratiques

**Un test = un comportement.** Ne teste pas trois choses dans la même fonction. Si le test échoue, tu dois savoir immédiatement quoi regarder. `test_vip_discount_applied_correctly` est infiniment plus utile que `test_calculate_total`.

**Nomme tes tests comme des phrases.** `test_order_with_zero_quantity_returns_zero` se lit comme une spécification. Dans six mois, tu comprendras ce que le test vérifie sans lire le corps — et quand il échoue en CI, le nom seul localise la régression. Convention : `test_<contexte>_<condition>_<résultat_attendu>`.

**Ne teste pas les getters et setters triviaux.** Si une fonction fait `return self.name`, tester ça n'apporte rien. Concentre-toi sur la logique métier, les conditions, les calculs.

**Garde les tests rapides.** Les tests unitaires doivent s'exécuter en quelques secondes au total. Si un test met 2 secondes parce qu'il appelle une vraie API externe, il n'est pas unitaire — et l'équipe finira par ne plus lancer la suite complète.

**Utilise toujours `pytest.approx()` pour les flottants.** Comparer des décimaux avec `==` produit des faux négatifs à cause de la précision des flottants. `pytest.approx()` règle le problème proprement, avec une tolérance ajustable via `rel=` ou `abs=`.

**Maintiens le ratio signal/bruit.** Un test trop verbeux — 20 lignes pour vérifier une addition — est difficile à maintenir. Si tu as besoin d'autant de setup, c'est souvent le code de production qui devrait être refactorisé.

---

## Résumé

Un test unitaire vérifie une fonction en isolation totale, sans base de données ni réseau. Le mock remplace une dépendance externe pour tester la logique seule. La paramétrisation évite la duplication quand plusieurs jeux de données couvrent le même comportement. Les fixtures factorisent la préparation réutilisable entre plusieurs tests. Pour les APIs Flask, `app.test_client()` simule des requêtes HTTP sans démarrer de serveur — et tester les codes d'erreur est aussi important que tester les succès.

Un test bien écrit ne se contente pas de vérifier que le code fonctionne : il documente ce que le code *est censé* faire. C'est ça, la vraie valeur du QA sur un backend.

---

<!-- snippet
id: qa_pytest_parametrize
type: concept
tech: pytest
level: intermediate
importance: high
format: knowledge
tags: pytest,parametrize,tests unitaires,backend
title: Paramétriser un test avec pytest.mark.parametrize
content: @pytest.mark.parametrize("arg1,arg2,expected", [(val1a, val2a, res_a), (val1b, val2b, res_b)]) exécute la même fonction de test avec chaque tuple indépendamment. Pytest nomme chaque cas dans le rapport. Résultat : N cas couverts, une seule fonction de test à maintenir.
description: Évite de dupliquer N fonctions quasi-identiques — un seul test, autant de jeux de données que nécessaire.
-->

<!-- snippet
id: qa_mock_patch_return
type: command
tech: pytest
level: intermediate
importance: high
format: knowledge
tags: mock,unittest.mock,patch,dépendance,backend
title: Mocker une dépendance externe avec unittest.mock.patch
command: with patch("<MODULE>.<FONCTION>", return_value=<VALEUR>):
example: with patch("app.pricing.get_customer_type", return_value="vip"):
description: Remplace temporairement une dépendance (BDD, API externe) par une valeur simulée — teste la logique sans infrastructure réelle.
-->

<!-- snippet
id: qa_pytest_raises
type: command
tech: pytest
level: intermediate
importance: medium
format: knowledge
tags: pytest,exceptions,test erreur,raises
title: Vérifier qu'une exception est bien levée
command: with pytest.raises(<ExceptionType>):
example: with pytest.raises(ValueError):
    calculate_total(100.0, 1, "unknown_type")
description: Fait échouer le test si l'exception n'est PAS levée — documente les comportements d'erreur attendus.
-->

<!-- snippet
id: qa_pytest_approx_float
type: warning
tech: pytest
level: intermediate
importance: high
format: knowledge
tags: pytest,flottants,précision,approx
title: Comparaison de flottants — toujours utiliser pytest.approx
content: Piège : assert result == 170.0 peut échouer avec 170.00000000000001 à cause de la précision flottante. Conséquence : faux négatif — le test échoue alors que le calcul est correct. Correction : assert result == pytest.approx(170.0). Tolérance par défaut 1e-6, ajustable avec rel= ou abs=.
description: Ne jamais comparer des flottants avec == en test — utiliser pytest.approx() pour éviter les faux négatifs sur les arrondis.
-->

<!-- snippet
id: qa_flask_test_client
type: concept
tech: flask
level: intermediate
importance: high
format: knowledge
tags: flask,api,test client,endpoint,http
title: Tester un endpoint Flask sans lancer le serveur
content: Flask fournit app.test_client() qui simule des requêtes HTTP en mémoire — aucun port, aucun réseau. Retourne un objet response avec .status_code, .get_json() et .headers. La fixture pytest encapsule le client pour le réutiliser dans tous les tests d'un fichier.
description: Permet de tester route + validation + réponse HTTP sans démarrer de serveur réel — rapide et isolé.
-->

<!-- snippet
id: qa_mock_over_engineering
type: warning
tech: pytest
level: intermediate
importance: medium
format: knowledge
tags: mock,architecture,responsabilité,test unitaire
title: Trop de mocks — signe que la fonction fait trop de choses
content: Piège : si la configuration des mocks prend plus de lignes que le test lui-même, la fonction testée mélange probablement logique métier et accès aux données. Conséquence : tests fragiles, difficiles à maintenir. Correction : refactoriser la fonction pour isoler la logique pure (sans I/O) — elle deviendra testable sans mock.
description: Un test avec 5+ mocks signale souvent une violation du principe de responsabilité unique dans le code de production.
-->

<!-- snippet
id: qa_test_naming_behavior
type: tip
tech: pytest
level: intermediate
importance: medium
format: knowledge
tags: nommage,lisibilité,documentation,test
title: Nommer un test comme une phrase décrivant le comportement
content: Privilégier test_order_with_zero_quantity_returns_zero plutôt que test_calculate ou test_v2. Convention recommandée : test_<contexte>_<condition>_<résultat_attendu>. Bénéfice : quand le test échoue en CI, le nom seul indique ce qui a régressé, sans lire le corps du test.
description: Un bon nom de test remplace un commentaire — il documente le comportement attendu et localise la régression immédiatement.
-->

<!-- snippet
id: qa_test_status_codes_api
type: tip
tech: flask
level: intermediate
importance: medium
format: knowledge
tags: api,http,status code,test,erreur
title: Tester les codes d'erreur API autant que les succès
content: Tester uniquement les cas 200 laisse passer les bugs silencieux. Couvrir systématiquement : 400 (données invalides), 401 (non authentifié), 404 (ressource inexistante), 422 (validation échouée). Dans Flask : client.post("/api/orders", json={}) puis assert response.status_code == 400.
description: Une API qui retourne 200 sur une requête invalide est un bug silencieux — les codes d'erreur doivent être testés explicitement.
-->

<!-- snippet
id: qa_unit_test_hermetic
type: warning
tech: pytest
level: intermediate
importance: high
format: knowledge
tags: ci,environnement,isolation,test unitaire
title: Test qui passe en local mais échoue en CI — cause d'isolation
content: Piège : dépendance implicite à l'environnement local (fichier présent, variable d'env non déclarée, BDD accessible). Conséquence : test non reproductible, false positive en local. Correction : chaque test doit être hermétique — toute dépendance externe est soit mockée, soit injectée via une fixture avec des valeurs explicites.
description: Un test unitaire ne doit dépendre d'aucune ressource extérieure — sinon c'est un test d'intégration déguisé.
-->

<!-- snippet
id: qa_pytest_run_commands
type: command
tech: pytest
level: beginner
importance: medium
format: knowledge
tags: pytest,cli,exécution,verbose
title: Lancer les tests pytest en ligne de commande
command: pytest <CHEMIN> -v --tb=<MODE>
example: pytest tests/test_pricing.py -v --tb=short
description: Lance les tests du chemin spécifié en mode verbose — --tb=short condense les tracebacks pour faciliter la lecture des échecs.
-->
