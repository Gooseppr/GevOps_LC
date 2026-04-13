---
layout: page
title: "Formats de données : JSON, XML, CSV et les autres"

course: api-rest
chapter_title: "Formats de données"

chapter: 1
section: 4

tags: json, xml, csv, api, formats, serialisation, content-type
difficulty: beginner
duration: 45
mermaid: false

icon: "📦"
domain: api-rest
domain_icon: "🔌"
status: "published"
---

# Formats de données

## Objectifs pédagogiques

À la fin de ce module, vous serez capable de :

1. **Identifier** les formats de données les plus courants dans les API (JSON, XML, CSV, form-encoded) et leurs cas d'usage respectifs
2. **Lire et écrire** du JSON valide à la main, sans outil, en comprenant sa structure
3. **Choisir** le bon format selon le contexte technique et les contraintes du système consommateur
4. **Utiliser** le header `Content-Type` correctement pour communiquer le format d'un payload
5. **Repérer** les erreurs de format les plus fréquentes qui font planter une intégration

---

## Mise en situation

Vous intégrez une API tierce pour envoyer des commandes clients vers un prestataire logistique. La documentation dit : *"POST /orders — body JSON"*. Simple. Sauf que votre collègue a testé avec Postman, ça marchait. Vous, vous l'appelez depuis un script Python — et vous obtenez un `400 Bad Request` à chaque fois.

Le problème ? Vous envoyiez bien du JSON dans le body, mais sans préciser `Content-Type: application/json`. Le serveur a refusé de parser la requête.

Ce genre de situation arrive constamment en intégration. Comprendre ce que sont réellement les formats de données — pas juste la syntaxe, mais le rôle qu'ils jouent dans la communication entre systèmes — c'est ce qui permet d'éviter ces bugs silencieux.

---

## Pourquoi les formats de données existent

Quand deux systèmes échangent des données, ils ne partagent pas la même mémoire. L'un envoie des octets sur le réseau, l'autre les reçoit. Pour que ces octets aient du sens des deux côtés, il faut un accord : un format commun, une façon de structurer l'information qui soit lisible par les deux.

C'est exactement ce que fait un format de données : il définit des règles d'encodage. Un peu comme un protocole de conversation — avant de parler, on s'accorde sur la langue.

En pratique, quand votre API reçoit une requête, elle doit savoir deux choses :
- **Quel format** a utilisé l'appelant pour encoder ses données ?
- **Comment les décoder** pour les transformer en structures utilisables côté serveur ?

C'est le rôle combiné du `Content-Type` (déclaration du format) et du parseur (interprétation du contenu).

🧠 **Un format ≠ un langage de programmation.** JSON n'est pas du JavaScript, même s'il en vient. C'est une notation textuelle indépendante du langage, que Python, Java, Go ou n'importe quel autre runtime peut lire sans problème.

---

## JSON — le format de facto des API modernes

### Pourquoi JSON a gagné

JSON (JavaScript Object Notation) est aujourd'hui le format dominant dans les API REST. Il a remplacé XML pour une raison simple : il est plus léger, plus lisible, et plus facile à manipuler dans la plupart des langages.

Un objet JSON ressemble à ceci :

```json
{
  "id": 42,
  "nom": "Alice Martin",
  "actif": true,
  "score": 98.5,
  "roles": ["admin", "viewer"],
  "adresse": {
    "ville": "Lyon",
    "code_postal": "69001"
  },
  "derniere_connexion": null
}
```

Ce que vous voyez ici couvre la totalité des types supportés par JSON :

| Type | Exemple | À retenir |
|------|---------|-----------|
| Chaîne | `"Alice Martin"` | Toujours entre guillemets doubles |
| Nombre | `42`, `98.5` | Pas de guillemets, point comme séparateur décimal |
| Booléen | `true`, `false` | En minuscules, sans guillemets |
| Null | `null` | Valeur explicite d'absence |
| Tableau | `["admin", "viewer"]` | Liste ordonnée, types mixtes possibles |
| Objet | `{ "clé": valeur }` | Paires clé/valeur, clés toujours en string |

### Ce que JSON ne sait pas faire

JSON ne supporte pas nativement les dates. `"2024-01-15T10:30:00Z"` est une chaîne de caractères pour JSON — c'est votre application qui décide de l'interpréter comme une date ISO 8601. Chaque API fait ses propres choix là-dessus, ce qui est une source fréquente de bugs lors de l'intégration.

Il ne supporte pas non plus les commentaires. Impossible d'écrire `// ceci est une note` dans un fichier JSON valide.

💡 Si vous manipulez des fichiers de configuration JSON et que vous trouvez les commentaires indispensables, regardez du côté de JSONC (JSON with Comments), utilisé notamment par VS Code.

### Valider du JSON à la main

La règle d'or : chaque objet et tableau doit être fermé, et il ne doit pas y avoir de virgule après le dernier élément d'un objet ou d'un tableau.

```json
// ❌ JSON invalide — virgule traînante
{
  "nom": "Alice",
  "age": 30,   ← virgule ici → ERREUR
}

// ✅ JSON valide
{
  "nom": "Alice",
  "age": 30
}
```

⚠️ Cette erreur de virgule traînante est extrêmement fréquente quand on écrit du JSON à la main. Les parseurs stricts (et c'est la majorité en production) la rejettent avec un message d'erreur parfois cryptique.

---

## XML — le vétéran toujours présent

### Quand vous le croiserez

XML n'a pas disparu. Vous le rencontrerez dans les contextes suivants :
- Les API SOAP (services bancaires, assurances, administrations)
- Les flux RSS/Atom
- Certains formats d'export (Excel, Word en interne)
- Les systèmes d'entreprise legacy (SAP, par exemple)

Un document XML ressemble à ceci :

```xml
<?xml version="1.0" encoding="UTF-8"?>
<commande id="42">
  <client>
    <nom>Alice Martin</nom>
    <email>alice@example.com</email>
  </client>
  <articles>
    <article quantite="2">
      <reference>REF-001</reference>
      <prix>19.99</prix>
    </article>
  </articles>
</commande>
```

### Ce que XML apporte (et ce qu'il coûte)

XML est verbeux — un payload XML est souvent 2 à 3 fois plus grand que son équivalent JSON. Mais il offre des fonctionnalités que JSON n'a pas nativement : les schémas de validation (XSD), les namespaces, et les attributs sur les éléments.

Pour une API REST moderne que vous concevez vous-même, choisir XML n'a quasiment jamais de sens. En revanche, si vous consommez une API tierce qui expose du XML, vous n'avez pas le choix — et il faut savoir le lire.

🧠 Le `Content-Type` d'un payload XML est `application/xml` (ou parfois `text/xml` pour les systèmes anciens).

---

## CSV — des données tabulaires, rien de plus

CSV (Comma-Separated Values) n'est pas vraiment un format d'API. Vous ne l'utiliserez pas pour envoyer une requête POST. Mais vous le croiserez régulièrement dans deux situations :

- **Les exports** : une API qui permet de télécharger un rapport ou un historique de transactions en CSV
- **Les imports** : une API qui accepte un fichier CSV pour importer des données en masse

```csv
id,nom,email,actif
1,Alice Martin,alice@example.com,true
2,Bob Durand,bob@example.com,false
```

Simple, lisible dans un tableur, mais limité : pas de hiérarchie, pas de types (tout est string), et les conventions sur le séparateur (virgule ou point-virgule selon les locales) génèrent des bugs en production.

💡 Si vous construisez un endpoint d'export qui doit retourner du CSV, précisez `Content-Type: text/csv` et ajoutez `Content-Disposition: attachment; filename="export.csv"` pour déclencher le téléchargement automatique côté navigateur.

---

## Form-encoded — le format des formulaires web

Moins connu mais très présent, notamment dans l'authentification OAuth 2.0.

`application/x-www-form-urlencoded` encode les données comme des paramètres d'URL :

```
grant_type=client_credentials&client_id=abc123&client_secret=xyz789
```

Vous le verrez systématiquement dans les requêtes de token OAuth :

```bash
curl -X POST https://auth.example.com/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id=<CLIENT_ID>&client_secret=<CLIENT_SECRET>"
```

⚠️ Envoyer ce payload avec `Content-Type: application/json` ne fonctionnera pas — le serveur s'attend à un format précis et rejettera la requête. C'est une erreur fréquente chez les développeurs habitués à tout envoyer en JSON.

---

## Le rôle du Content-Type : déclarer ce qu'on envoie

Le header `Content-Type` est la pièce centrale de tout échange de données. Il dit au serveur : *"voilà comment j'ai encodé le body que je t'envoie"*.

```
Content-Type: application/json       ← JSON
Content-Type: application/xml        ← XML
Content-Type: text/csv               ← CSV
Content-Type: application/x-www-form-urlencoded  ← formulaire
Content-Type: multipart/form-data    ← fichier binaire (upload)
```

Son pendant, `Accept`, indique au serveur quel format vous souhaitez recevoir en réponse :

```
Accept: application/json   ← je veux du JSON en réponse
```

Certaines API supportent plusieurs formats et utilisent ce header pour décider quoi retourner. D'autres ignorent `Accept` et retournent toujours du JSON — à vous de lire la documentation.

🧠 **`Content-Type` concerne le body de la requête que vous envoyez. `Accept` concerne le body de la réponse que vous attendez.** Les confondre, c'est l'une des premières sources d'erreur en intégration.

---

## Choisir le bon format

En pratique, le choix ne se pose presque jamais quand vous consommez une API — vous utilisez ce qu'elle expose. Le choix devient réel quand vous concevez votre propre API.

Voici comment trancher rapidement :

| Situation | Format recommandé | Pourquoi |
|-----------|-------------------|----------|
| API REST moderne | JSON | Ecosystème, lisibilité, légèreté |
| Intégration avec un SI legacy ou SOAP | XML | Pas le choix, le système l'impose |
| Export de données tabulaires | CSV | Simple, compatible Excel sans dev |
| Upload de fichier + métadonnées | multipart/form-data | Seul format adapté aux binaires |
| Authentification OAuth 2.0 | form-encoded | C'est la spec, pas un choix |
| Streaming de données en temps réel | JSON Lines (NDJSON) | Un objet JSON par ligne |

💡 **JSON Lines** (aussi appelé NDJSON) mérite une mention spéciale. C'est du JSON, mais un objet par ligne, sans tableau englobant. C'est le format utilisé par les API de streaming comme OpenAI ou certains exports de logs. Chaque ligne est un JSON valide indépendant, ce qui permet de traiter les données au fur et à mesure sans attendre la fin de la réponse.

```
{"event": "start", "timestamp": "2024-01-15T10:00:00Z"}
{"event": "data", "value": 42}
{"event": "end", "timestamp": "2024-01-15T10:00:05Z"}
```

---

## Erreurs fréquentes

**Symptôme :** `400 Bad Request` alors que le body JSON semble correct.
**Cause :** `Content-Type` absent ou mal renseigné. Le serveur ne tente pas de parser le body.
**Correction :** Toujours ajouter `-H "Content-Type: application/json"` avec curl, ou configurer Postman pour l'inclure automatiquement.

---

**Symptôme :** `SyntaxError: Unexpected token` ou erreur de parsing JSON côté client.
**Cause :** L'API a retourné une erreur HTML (page 500, page de maintenance nginx) au lieu de JSON, mais votre code tente de parser la réponse comme du JSON sans vérifier.
**Correction :** Toujours vérifier le `Content-Type` de la réponse et le code HTTP avant de tenter un `JSON.parse()` ou `json.loads()`.

```python
response = requests.get("https://api.example.com/data")

# ❌ Plante si l'API répond avec du HTML en cas d'erreur
data = response.json()

# ✅ On vérifie d'abord
if response.status_code == 200 and "application/json" in response.headers.get("Content-Type", ""):
    data = response.json()
else:
    print(f"Erreur {response.status_code} : {response.text}")
```

---

**Symptôme :** Les données reçues semblent tronquées ou mal encodées (caractères bizarres).
**Cause :** Problème d'encodage de caractères — le serveur envoie de l'UTF-8 mais le client interprète en Latin-1, ou l'inverse.
**Correction :** Spécifier l'encodage explicitement dans le `Content-Type` : `Content-Type: application/json; charset=utf-8`. En Python, `response.encoding = 'utf-8'` avant `response.text`.

---

## Résumé

| Concept | Ce qu'il fait | À retenir |
|---------|---------------|-----------|
| JSON | Format texte structuré clé/valeur | 7 types natifs, pas de dates, pas de commentaires |
| XML | Format balisé hiérarchique | Verbeux, toujours présent dans les SI legacy et SOAP |
| CSV | Données tabulaires en texte | Limité, utile pour les exports seulement |
| Form-encoded | Paramètres URL dans le body | Obligatoire pour OAuth 2.0 |
| Content-Type | Déclare le format du body envoyé | Sans lui, le serveur peut ignorer votre payload |
| Accept | Demande un format de réponse spécifique | Ignoré par beaucoup d'API, mais bonne pratique |

En API REST, **JSON est la langue commune** — mais savoir lire les autres formats et comprendre le rôle du `Content-Type` vous évitera des heures de debug sur des intégrations qui "ne marchent pas pour une raison mystérieuse".

---

<!-- snippet
id: api_json_structure
type: concept
tech: json
level: beginner
importance: high
format: knowledge
tags: json, api, types, serialisation
title: Les 6 types de valeurs JSON
content: JSON ne connaît que 6 types : string (guillemets doubles obligatoires), number (entier ou décimal, point comme séparateur), boolean (true/false en minuscules), null, array ([...]) et object ({...}). Tout le reste — dates, binaires, undefined — n'existe pas nativement. Une "date" en JSON est toujours une string que l'application décide d'interpréter.
description: JSON supporte exactement 6 types. Les dates n'en font pas partie — elles sont des strings. Pas de guillemets simples, pas de commentaires.
-->

<!-- snippet
id: api_json_virgule_trailing
type: warning
tech: json
level: beginner
importance: high
format: knowledge
tags: json, parsing, erreur, syntaxe
title: Virgule traînante en JSON — erreur silencieuse
content: Piège : ajouter une virgule après le dernier élément d'un objet ou tableau. Conséquence : SyntaxError immédiate — tout parseur strict rejette le JSON. Correction : supprimer la virgule après la dernière valeur. Exemple invalide : {"nom": "Alice", "age": 30,} — la virgule après 30 est illégale.
description: Une virgule après le dernier élément d'un objet JSON provoque une SyntaxError. Erreur très fréquente en écriture manuelle.
-->

<!-- snippet
id: api_content_type_json
type: tip
tech: http
level: beginner
importance: high
format: knowledge
tags: http, content-type, json, headers, curl
title: Toujours envoyer Content-Type avec un body JSON
content: "Sans Content-Type: application/json, le serveur peut ignorer ou mal parser le body. Avec curl : -H 'Content-Type: application/json'. Avec requests Python : requests.post(url, json=data) l'ajoute automatiquement. Avec requests.post(url, data=data), il NE l'ajoute PAS."
description: Content-Type manquant = 400 Bad Request fréquent. requests.post(url, json=data) l'ajoute auto ; requests.post(url, data=data) ne le fait pas.
-->

<!-- snippet
id: api_content_type_vs_accept
type: concept
tech: http
level: beginner
importance: high
format: knowledge
tags: http, headers, content-type, accept, api
title: Content-Type vs Accept — deux directions opposées
content: "Content-Type décrit le format du body que VOUS envoyez (requête). Accept indique le format que vous souhaitez recevoir en réponse. Ils sont indépendants : vous pouvez envoyer du JSON (Content-Type: application/json) et demander du CSV en retour (Accept: text/csv). Beaucoup d'API ignorent Accept et retournent toujours JSON."
description: Content-Type = format envoyé. Accept = format attendu en réponse. Les confondre est une erreur d'intégration classique.
-->

<!-- snippet
id: api_form_encoded_oauth
type: warning
tech: http
level: beginner
importance: high
format: knowledge
tags: oauth, form-encoded, authentication, content-type
title: OAuth 2.0 exige application/x-www-form-urlencoded
content: "Piège : envoyer la requête de token OAuth en JSON. Conséquence : le serveur d'auth répond 400 ou 415 Unsupported Media Type. Correction : utiliser Content-Type: application/x-www-form-urlencoded avec le body encodé comme paramètres URL (grant_type=client_credentials&client_id=xxx&client_secret=yyy). C'est imposé par la spec OAuth 2.0 RFC 6749."
description: La spec OAuth 2.0 impose form-encoded pour les requêtes de token, pas JSON. Envoyer du JSON retourne systématiquement une erreur 400 ou 415.
-->

<!-- snippet
id: api_json_response_check
type: tip
tech: python
level: beginner
importance: medium
format: knowledge
tags: python, requests, json, parsing, erreur
title: Vérifier Content-Type avant de parser une réponse JSON
content: "En cas d'erreur serveur, l'API peut retourner du HTML au lieu de JSON. json.loads() plantera avec SyntaxError. Défense : if response.status_code == 200 and 'application/json' in response.headers.get('Content-Type', ''): data = response.json(). Sinon logger response.text pour diagnostiquer."
description: Une réponse 500 peut contenir du HTML. Toujours vérifier le status code et le Content-Type avant d'appeler response.json() en Python.
-->

<!-- snippet
id: api_csv_export_headers
type: tip
tech: http
level: beginner
importance: medium
format: knowledge
tags: csv, http, headers, content-disposition, export
title: Headers HTTP pour un export CSV propre
content: "Pour un endpoint d'export CSV, utiliser deux headers : Content-Type: text/csv; charset=utf-8 (déclare le format) et Content-Disposition: attachment; filename=\"export.csv\" (déclenche le téléchargement automatique dans le navigateur). Sans Content-Disposition, le navigateur affiche le CSV brut dans l'onglet au lieu de le télécharger."
description: Content-Disposition: attachment; filename="export.csv" déclenche le téléchargement automatique dans le navigateur. Sans lui, le CSV s'affiche en texte brut.
-->

<!-- snippet
id: api_ndjson_streaming
type: concept
tech: json
level: beginner
importance: medium
format: knowledge
tags: json, streaming, ndjson, jsonlines, api
title: JSON Lines (NDJSON) pour les réponses en streaming
content: "JSON Lines = un objet JSON valide par ligne, sans tableau englobant, sans virgule entre les lignes. Permet de traiter chaque objet au fur et à mesure sans attendre la fin du stream. Utilisé par OpenAI, les API de logs, les exports massifs. Content-Type associé : application/x-ndjson. Chaque ligne peut être parsée indépendamment avec json.loads(line)."
description: NDJSON = 1 objet JSON par ligne. Permet le traitement en streaming sans charger toute la réponse en mémoire. Utilisé par OpenAI et les API de logs.
-->