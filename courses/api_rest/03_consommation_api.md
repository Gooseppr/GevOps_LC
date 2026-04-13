---
layout: page
title: "Consommer une API"

course: api_rest
chapter_title: "Consommer une API"

chapter: 1
section: 3

tags: api, rest, curl, postman, json, http, bearer-token, python, javascript
difficulty: beginner
duration: 90
mermaid: true

status: "published"
prev_module: "/courses/api_rest/02_http_rest.html"
prev_module_title: "HTTP & REST — Les fondations indispensables des API"
next_module: "/courses/api_rest/04_formats_donnees.html"
next_module_title: "Formats de données : JSON, XML, CSV et les autres"
---

# Consommer une API

## Objectifs pédagogiques

À l'issue de ce module, tu seras capable de :

1. **Envoyer** des requêtes HTTP (GET, POST) vers une API avec `curl` depuis un terminal
2. **Tester** interactivement une API avec Postman ou Insomnia
3. **Authentifier** une requête avec un Bearer token
4. **Parser** une réponse JSON en Python et en JavaScript
5. **Identifier** les erreurs courantes lors de la consommation d'une API et savoir les corriger

---

## Mise en situation

Tu rejoins une équipe qui intègre une API météo tierce pour alimenter un dashboard interne. La documentation de l'API t'est fournie — un endpoint `/forecast`, une clé API, des exemples de réponse JSON. Jusque-là, un collègue testait tout "à la main" depuis une interface web fournie par le fournisseur.

Le problème ? Ce workflow n'est pas reproductible. Impossible de partager un test, d'automatiser une vérification, de rejouer exactement la même requête deux heures plus tard dans un script d'intégration. Dès que tu veux passer à l'étape suivante — intégrer l'API dans ton backend, écrire des tests, ou simplement décrire un bug précisément — il te faut des outils qui parlent HTTP directement.

C'est exactement ce qu'on va construire ici : la capacité de consommer n'importe quelle API REST de façon reproductible, depuis le terminal ou dans du code.

---

## Contexte : qu'est-ce que "consommer" une API ?

Consommer une API, c'est envoyer des requêtes HTTP à un serveur distant et exploiter les réponses. Rien de plus — mais ça implique de maîtriser quelques éléments précis :

- **Quelle URL appeler** (endpoint)
- **Quelle méthode HTTP utiliser** (GET pour lire, POST pour créer…)
- **Quels headers envoyer** (authentification, format des données)
- **Quel body inclure** si nécessaire (pour POST/PUT)
- **Comment interpréter la réponse** (code HTTP + corps JSON)

```mermaid
sequenceDiagram
    participant Client
    participant API

    Client->>API: GET /users (Authorization: Bearer <token>)
    API-->>Client: 200 OK + JSON body
    Client->>API: POST /users (Content-Type: application/json + body)
    API-->>Client: 201 Created + JSON body
    Client->>API: GET /users/999
    API-->>Client: 404 Not Found
```

Ce cycle requête / réponse est la base de toute intégration. Une fois que tu sais le piloter à la main, tu peux l'automatiser dans n'importe quel langage.

---

## curl — ton premier outil de consommation

`curl` est un outil en ligne de commande qui envoie des requêtes HTTP. Il est disponible partout (Linux, macOS, Windows 10+), il ne demande aucune interface graphique, et les commandes sont partageables et scriptables.

### Requête GET simple

```bash
curl https://jsonplaceholder.typicode.com/posts/1
```

C'est tout. Tu envoies un GET à cette URL, et tu reçois un corps JSON en réponse. `jsonplaceholder.typicode.com` est une API publique de test — parfaite pour pratiquer sans avoir besoin de credentials.

Pour voir les headers de réponse en plus du corps :

```bash
curl -i https://jsonplaceholder.typicode.com/posts/1
```

Pour ne voir **que** les headers (utile pour diagnostiquer un problème d'auth ou de redirection) :

```bash
curl -I https://jsonplaceholder.typicode.com/posts/1
```

💡 **Astuce** — Ajoute `-s` (silent) pour supprimer la barre de progression, et pipe vers `| python3 -m json.tool` pour formater le JSON automatiquement :
```bash
curl -s https://jsonplaceholder.typicode.com/posts/1 | python3 -m json.tool
```

### Requête POST avec un body JSON

Dès que tu dois envoyer des données — créer une ressource, déclencher une action — tu passes à POST. Deux choses sont nécessaires : préciser que le body est du JSON (`-H "Content-Type: application/json"`) et fournir le body lui-même (`-d`).

```bash
curl -s -X POST https://jsonplaceholder.typicode.com/posts \
  -H "Content-Type: application/json" \
  -d '{"title": "Mon titre", "body": "Contenu de test", "userId": 1}'
```

⚠️ **Erreur fréquente** — Oublier le header `Content-Type: application/json`. Le serveur reçoit alors les données comme du texte brut et répond souvent avec un `400 Bad Request` ou un body vide. Toujours inclure ce header quand tu envoies du JSON.

### Authentification avec un Bearer token

La majorité des APIs protégées utilisent un token transmis dans le header `Authorization`. Le format standard est :

```
Authorization: Bearer <ton_token>
```

```bash
curl -s https://api.example.com/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

🧠 **Concept clé** — Un Bearer token est une chaîne opaque (souvent un JWT) que l'API vérifie côté serveur. "Bearer" signifie littéralement "porteur" : quiconque possède ce token peut s'authentifier. D'où l'importance de ne jamais le logger ou le commettre dans Git.

### Récapitulatif des options curl essentielles

| Option | Rôle | Exemple |
|--------|------|---------|
| `-X <METHOD>` | Spécifie la méthode HTTP | `-X POST` |
| `-H "<header>"` | Ajoute un header | `-H "Content-Type: application/json"` |
| `-d '<body>'` | Corps de la requête | `-d '{"key":"value"}'` |
| `-i` | Inclut les headers de réponse | — |
| `-s` | Mode silencieux (pas de barre) | — |
| `-o <fichier>` | Sauvegarde la réponse dans un fichier | `-o response.json` |
| `-v` | Mode verbose — tout afficher | Très utile pour déboguer |

---

## Postman et Insomnia — pour tester sans taper du texte

`curl` est idéal pour les scripts et le terminal, mais quand tu explores une API inconnue, une interface graphique accélère vraiment le travail. Postman et Insomnia remplissent ce rôle.

Les deux outils font essentiellement la même chose — choisir selon ta préférence. Insomnia est plus léger et open source ; Postman a un écosystème plus riche (collections, tests automatisés, mock servers).

### Ce que ces outils apportent concrètement

- **Historique des requêtes** — retrouver immédiatement la requête qu'on a envoyée il y a 20 minutes
- **Collections** — grouper les requêtes par API ou par projet, les partager avec l'équipe
- **Variables d'environnement** — définir `base_url = https://api.prod.example.com` une fois et l'utiliser partout, puis switcher vers un env de staging en un clic
- **Visualisation JSON** — le corps de réponse est formaté et navigable automatiquement
- **Tests intégrés** — écrire des assertions sur la réponse (code HTTP, présence d'un champ, valeur attendue) directement dans l'outil

⚠️ **Erreur fréquente** — Utiliser uniquement l'interface graphique sans jamais exporter les requêtes. Si quelqu'un d'autre doit reproduire le test, ou si tu dois l'intégrer dans une CI, tu es bloqué. Prends l'habitude d'exporter tes collections Postman (format JSON) ou d'avoir l'équivalent `curl` sous la main.

### Workflow typique avec Postman

1. Créer une nouvelle requête — choisir la méthode, saisir l'URL
2. Onglet **Headers** — ajouter `Authorization: Bearer <token>` et `Content-Type: application/json`
3. Onglet **Body** → raw → JSON — saisir le body pour les POST/PUT
4. Cliquer **Send** — observer le code de statut, les headers de réponse, le body
5. Sauvegarder dans une collection pour réutilisation

💡 **Astuce** — Dans Postman, tu peux générer automatiquement le code `curl` équivalent à ta requête : icône `</>` à droite de l'interface → sélectionner "cURL". Pratique pour partager une requête avec un collègue qui préfère le terminal.

---

## Authentification — comprendre avant de brancher

Avant de coder quoi que ce soit, il vaut mieux comprendre ce que tu envoies réellement.

### Bearer token — le cas le plus courant

```
GET /api/orders HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGc...
```

Le serveur extrait ce token, le valide (signature, expiration pour les JWT), et décide si la requête est autorisée. Si le token est invalide ou expiré → `401 Unauthorized`. Si le token est valide mais sans les droits requis → `403 Forbidden`.

🧠 **Concept clé** — `401` et `403` ne signifient pas la même chose. `401` = "je ne sais pas qui tu es" (token absent, invalide ou expiré). `403` = "je sais qui tu es, mais tu n'as pas le droit". Ne jamais traiter ces deux cas de la même façon dans ton code.

### API Key — variante simple

Certaines APIs utilisent une clé passée soit en header, soit en query string. Moins sécurisé (la clé apparaît en clair dans les logs si passée en URL), mais courant pour des APIs publiques ou des services simples :

```bash
# En header (recommandé)
curl -H "X-Api-Key: <ta_cle>" https://api.example.com/data

# En query string (à éviter en prod)
curl "https://api.example.com/data?api_key=<ta_cle>"
```

---

## Parser JSON — Python et JavaScript

Recevoir du JSON, c'est bien. L'exploiter dans ton code, c'est le but. Voici comment faire de façon propre dans les deux langages les plus courants.

### Python

```python
import requests

# GET — récupérer une liste
response = requests.get(
    "https://jsonplaceholder.typicode.com/posts",
    headers={"Accept": "application/json"}
)

# Vérifier que la requête a réussi avant de parser
response.raise_for_status()  # lève une exception si code >= 400

posts = response.json()  # désérialise automatiquement le JSON
print(f"Nombre de posts : {len(posts)}")
print(f"Premier titre : {posts[0]['title']}")
```

```python
import requests

# POST — créer une ressource
payload = {
    "title": "Nouveau post",
    "body": "Contenu",
    "userId": 1
}

response = requests.post(
    "https://jsonplaceholder.typicode.com/posts",
    json=payload,  # sérialise automatiquement + ajoute Content-Type: application/json
    headers={"Authorization": "Bearer <ton_token>"}
)

response.raise_for_status()
created = response.json()
print(f"Ressource créée avec l'id : {created['id']}")
```

💡 **Astuce** — Utilise `json=payload` plutôt que `data=json.dumps(payload)` avec requests. Le premier gère automatiquement la sérialisation ET ajoute le header `Content-Type: application/json`. Le second t'oblige à faire les deux manuellement.

⚠️ **Erreur fréquente** — Appeler `.json()` sans vérifier le code de statut d'abord. Si le serveur répond `500` avec un body HTML d'erreur, `.json()` lève une exception `JSONDecodeError` — et le vrai problème (le 500) est masqué. Utilise `.raise_for_status()` systématiquement.

### JavaScript (Node.js avec fetch)

```javascript
// GET — avec async/await
async function getPosts() {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts");

  if (!response.ok) {
    throw new Error(`Erreur HTTP : ${response.status}`);
  }

  const posts = await response.json();
  console.log(`Nombre de posts : ${posts.length}`);
  console.log(`Premier titre : ${posts[0].title}`);
}

getPosts().catch(console.error);
```

```javascript
// POST — envoyer du JSON
async function createPost(title, body) {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer <ton_token>"
    },
    body: JSON.stringify({ title, body, userId: 1 })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Erreur ${response.status} : ${errorBody}`);
  }

  const created = await response.json();
  console.log(`Ressource créée avec l'id : ${created.id}`);
}
```

🧠 **Concept clé** — `fetch` ne rejette pas la promesse sur les erreurs HTTP (404, 500…). Il ne rejette que sur les erreurs réseau (serveur inaccessible, DNS échoué). C'est pourquoi le check `if (!response.ok)` est indispensable — sans lui, un `404` passe silencieusement.

---

## Construction progressive — du curl au code en production

Voici comment passer d'un test manuel à une intégration robuste en trois étapes.

### Étape 1 — Valider l'appel manuellement

Avant d'écrire la moindre ligne de code, valide que l'API répond comme prévu avec `curl` :

```bash
curl -s -i \
  -H "Authorization: Bearer <token>" \
  https://api.example.com/users/42
```

Tu veux voir un `200 OK` et un body JSON cohérent. Si ça ne fonctionne pas ici, ça ne fonctionnera pas dans ton code non plus — et déboguer un appel HTTP dans du code Python est bien plus difficile que dans un terminal.

### Étape 2 — Wrapper dans une fonction simple

```python
import requests

BASE_URL = "https://api.example.com"

def get_user(user_id: int, token: str) -> dict:
    response = requests.get(
        f"{BASE_URL}/users/{user_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    response.raise_for_status()
    return response.json()
```

À ce stade, la fonction fait une seule chose. Pas de retry, pas de cache — juste l'appel et la désérialisation.

### Étape 3 — Vers la production : timeouts, erreurs, retry

```python
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

def build_session(token: str) -> requests.Session:
    session = requests.Session()
    session.headers.update({"Authorization": f"Bearer {token}"})

    # Retry automatique sur erreurs réseau et 5xx
    retry = Retry(
        total=3,
        backoff_factor=1,          # attend 1s, 2s, 4s entre les tentatives
        status_forcelist=[500, 502, 503, 504]
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("https://", adapter)
    return session

def get_user(user_id: int, token: str) -> dict:
    session = build_session(token)
    response = session.get(
        f"https://api.example.com/users/{user_id}",
        timeout=5  # secondes — ne jamais laisser sans timeout
    )
    response.raise_for_status()
    return response.json()
```

⚠️ **Erreur fréquente** — Oublier le `timeout`. Sans lui, ton appel peut rester bloqué indéfiniment si le serveur distant ne répond pas, gelant ton thread ou ton worker entier. En production, toujours définir un timeout explicite — typiquement 3 à 10 secondes selon le contexte.

---

## Diagnostic — erreurs fréquentes et comment les corriger

| Symptôme | Cause probable | Correction |
|----------|----------------|------------|
| `401 Unauthorized` | Token absent, invalide ou expiré | Vérifier le header `Authorization`, renouveler le token si JWT expiré |
| `403 Forbidden` | Token valide mais droits insuffisants | Vérifier les scopes/permissions associés au token |
| `404 Not Found` | URL incorrecte ou ressource inexistante | Vérifier l'endpoint exact dans la doc, vérifier l'id de la ressource |
| `400 Bad Request` | Body malformé ou champ requis manquant | Vérifier `Content-Type`, valider le JSON envoyé, lire le message d'erreur dans le body |
| `JSONDecodeError` en Python | Le body de réponse n'est pas du JSON (erreur HTML, réponse vide) | Afficher `response.text` avant d'appeler `.json()` pour voir ce que le serveur envoie vraiment |
| Timeout / connexion refusée | Serveur inaccessible, mauvaise URL, firewall | Tester avec `curl -v` pour voir où la connexion échoue |
| `SSL certificate verify failed` | Certificat auto-signé ou expiré | En dev uniquement : `verify=False` dans requests — jamais en prod |

💡 **Astuce** — Quand une API répond avec une erreur, lis toujours le **body** de la réponse, pas seulement le code HTTP. La plupart des APIs bien conçues incluent un message d'erreur descriptif dans le JSON (`{"error": "field 'email' is required"}`). C'est là que se trouve l'information utile.

---

## Cas réel — intégration d'une API de paiement

**Contexte** : une équipe de 3 développeurs intègre l'API Stripe pour gérer les paiements d'une application SaaS. Délai : 2 semaines.

**Problème initial** : les tests se faisaient en cliquant dans le dashboard Stripe. Impossible de rejouer un scénario précis, pas de trace des appels envoyés.

**Ce qui a été mis en place** :

1. **Validation manuelle avec curl** — tous les endpoints documentés testés manuellement en premier, avec les vraies clés de test Stripe
2. **Collection Postman partagée** — chaque scénario (paiement réussi, carte refusée, remboursement) documenté comme une requête nommée dans une collection versionnée dans Git
3. **Wrapper Python** — une classe `StripeClient` encapsulant tous les appels, avec timeout à 10s et retry sur 5xx
4. **Vérification du code HTTP avant parsing** — `raise_for_status()` systématique, plus gestion explicite des `400` (erreurs de validation Stripe) avec log du body

**Résultat** : les bugs d'intégration (mauvais Content-Type, token de test vs prod, champs manquants) ont été détectés en phase de test manuel avant d'écrire du code. Le temps de débogage en intégration a été réduit de moitié.

---

## Bonnes pratiques

**Ne jamais hardcoder un token dans le code source.** Utilise des variables d'environnement (`os.environ["API_TOKEN"]`) ou un gestionnaire de secrets. Un token commité dans Git, même dans un repo privé, est une fuite de sécurité.

**Valider d'abord avec curl, coder ensuite.** Toujours vérifier qu'un endpoint fonctionne manuellement avant d'écrire le code qui l'appelle. Ça évite de déboguer en aveugle.

**Toujours définir un timeout explicite.** Sans timeout, un service tiers lent peut bloquer ton application indéfiniment. Commence à 5 secondes et ajuste selon le contrat SLA de l'API.

**Lire le body des erreurs, pas seulement le code HTTP.** Un `400` sans lire le body JSON de réponse, c'est ignorer la moitié de l'information disponible.

**Utiliser `json=` dans requests plutôt que `data=`** pour les appels POST/PUT — ça sérialise et ajoute automatiquement le bon Content-Type.

**Versionner tes collections Postman.** Une collection exportée en JSON dans ton repo, c'est une documentation vivante et reproductible de comment consommer l'API.

**Ne tester que via une UI graphique, c'est une dette.** Dès qu'un appel sera automatisé (CI, script, backend), il faudra le recoder. Prendre le réflexe `curl` dès le départ fait gagner du temps à long terme.

---

## Résumé

Consommer une API, c'est maîtriser le cycle requête / réponse HTTP : choisir la bonne méthode, envoyer les bons headers, interpréter le code de statut avant de toucher au body. `curl` est l'outil de référence pour valider un appel en 30 secondes depuis n'importe quel terminal. Postman et Insomnia accélèrent l'exploration interactive et permettent de partager les tests en équipe. En Python, `requests` avec `.raise_for_status()` et `json=` couvre 90% des besoins ; en JavaScript, `fetch` exige un check explicite sur `response.ok`. En production, deux règles non négociables : un timeout sur chaque appel, et le token dans une variable d'environnement. La suite logique de ce module : comprendre les formats de données (JSON Schema, types, validation) pour aller plus loin que le simple parsing.

---

<!-- snippet
id: api_curl_get_basic
type: command
tech: curl
level: beginner
importance: high
format: knowledge
tags: curl,api,get,http,rest
title: Requête GET avec curl vers une API
command: curl -s <URL> | python3 -m json.tool
example: curl -s https://jsonplaceholder.typicode.com/posts/1 | python3 -m json.tool
description: Envoie un GET et formate le JSON de réponse. -s supprime la barre de progression, python3 -m json.tool indente automatiquement.
-->

<!-- snippet
id: api_curl_post_json
type: command
tech: curl
level: beginner
importance: high
format: knowledge
tags: curl,api,post,json,content-type
title: Requête POST avec body JSON via curl
command: curl -s -X POST <URL> -H "Content-Type: application/json" -d '<JSON_BODY>'
example: curl -s -X POST https://jsonplaceholder.typicode.com/posts -H "Content-Type: application/json" -d '{"title":"test","body":"contenu","userId":1}'
description: POST avec body JSON. Sans le header Content-Type, le serveur reçoit du texte brut et répond souvent 400.
-->

<!-- snippet
id: api_curl_bearer_auth
type: command
tech: curl
level: beginner
importance: high
format: knowledge
tags: curl,api,authentication,bearer,token
title: Authentifier une requête curl avec un Bearer token
command: curl -s <URL> -H "Authorization: Bearer <TOKEN>"
example: curl -s https://api.example.com/me -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMifQ.abc"
description: Passe le token dans le header Authorization. Format exact : "Bearer " suivi du token, sans guillemets autour du token seul.
-->

<!-- snippet
id: api_http_401_vs_403
type: concept
tech: http
level: beginner
importance: high
format: knowledge
tags: http,statut,authentification,autorisation,erreur
title: Différence entre 401 et 403
content: 401 Unauthorized = le serveur ne sait pas qui tu es (token absent, invalide ou expiré). 403 Forbidden = identité connue, mais droits insuffisants. Conséquence : un 401 se corrige en renouvelant/ajoutant le token, un 403 nécessite de vérifier les permissions ou scopes associés au compte.
description: 401 = problème d'identité, 403 = problème de droits. Ne pas traiter ces deux cas de la même façon dans le code.
-->

<!-- snippet
id: api_requests_raise_for_status
type: warning
tech: python
level: beginner
importance: high
format: knowledge
tags: python,requests,erreur,http,json
title: Appeler .json() sans vérifier le code HTTP
content: Piège : appeler response.json() directement. Si le serveur répond 500 avec un body HTML, json() lève JSONDecodeError et masque le vrai problème. Correction : appeler response.raise_for_status() avant .json() — lève une HTTPError explicite si code >= 400.
description: Sans raise_for_status(), une erreur HTTP 500 peut lever JSONDecodeError au lieu d'HTTPError, rendant le debug trompeur.
-->

<!-- snippet
id: api_requests_json_param
type: tip
tech: python
level: beginner
importance: medium
format: knowledge
tags: python,requests,post,json,content-type
title: Utiliser json= plutôt que data= dans requests
content: Passer json=payload à requests.post() sérialise automatiquement le dict en JSON ET ajoute le header Content-Type: application/json. Avec data=json.dumps(payload), il faut ajouter le header manuellement. Exemple : requests.post(url, json={"key": "value"}) vs requests.post(url, data=json.dumps({"key": "value"}), headers={"Content-Type": "application/json"}).
description: json=payload dans requests gère à la fois la sérialisation et le Content-Type automatiquement — évite un oubli fréquent.
-->

<!-- snippet
id: api_requests_timeout
type: warning
tech: python
level: beginner
importance: high
format: knowledge
tags: python,requests,timeout,production,performance
title: Oublier le timeout sur un appel requests
content: Piège : requests.get(url) sans timeout. Si le serveur distant ne répond pas, l'appel bloque indéfiniment, gelant le thread ou le worker entier. Correction : toujours passer timeout=5 (secondes). Exemple : requests.get(url, timeout=5). En prod, ajuster selon le SLA de l'API cible — rarement au-delà de 10s.
description: Sans timeout explicite, un serveur lent ou muet bloque le thread indéfiniment. Toujours définir timeout= en production.
-->

<!-- snippet
id: api_fetch_ok_check
type: warning
tech: javascript
level: beginner
importance: high
format: knowledge
tags: javascript,fetch,http,erreur,async
title: fetch ne rejette pas sur les erreurs HTTP
content: Piège : fetch ne rejette la promesse que sur erreur réseau (DNS, connexion refusée). Un 404 ou 500 résout normalement la promesse. Sans if (!response.ok), une erreur HTTP passe silencieusement. Correction : vérifier response.ok avant response.json(). Exemple : if (!response.ok) throw new Error(`HTTP ${response.status}`).
description: fetch résout la promesse même sur 404/500. Vérifier response.ok avant de parser le JSON est obligatoire.
-->

<!-- snippet
id: api_token_env_variable
type: tip
tech: python
level: beginner
importance: high
format: knowledge
tags: securite,token,environnement,secret,python
title: Lire un token API depuis une variable d'environnement
content: Ne jamais écrire le token directement dans le code. Le lire avec import os; token = os.environ["API_TOKEN"]. Définir la variable avant l'exécution : export API_TOKEN="eyJ..." (Linux/macOS) ou set API_TOKEN=eyJ... (Windows). Un token commité dans Git, même repo privé, est une fuite de sécurité — même supprimé ensuite, il reste dans l'historique.
description: os.environ["API_TOKEN"] lit le token depuis l'environnement. Jamais de token en dur dans le code source ou commité dans Git.
-->

<!-- snippet
id: api_curl_verbose_debug
type: tip
tech: curl
level: beginner
importance: medium
format: knowledge
tags: curl,debug,http,headers,diagnostic
title: Utiliser curl -v pour diagnostiquer un appel qui échoue
content: curl -v <URL> affiche l'intégralité de l'échange HTTP : résolution DNS, handshake TLS, headers envoyés (lignes >), headers reçus (lignes <) et body. Utile pour vérifier qu'un header Authorization est bien envoyé, détecter une redirection 301 inattendue, ou identifier où la connexion échoue.
description: curl -v montre tous les headers envoyés et reçus. Indispensable quand l'API répond de façon inattendue et qu'on ne sait pas ce qui est transmis.
-->
