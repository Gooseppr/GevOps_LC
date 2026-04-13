```yaml
---
layout: page
title: "Formats de données : JSON, XML, YAML et choix en production"

course: "API REST"
chapter_title: "Fondations"

chapter: 1
section: 4

tags: "json,xml,yaml,serialization,api,formats"
difficulty: "beginner"
duration: 45
mermaid: false

icon: "📦"
domain: "REST API"
domain_icon: "🔌"
status: "published"
---

## Objectifs pédagogiques

À la fin de ce module, tu seras capable de :

- **Identifier** les formats de données courants (JSON, XML, YAML) et leurs cas d'usage respectifs
- **Parser** et **générer** du JSON depuis Python ou JavaScript sans erreur de syntaxe
- **Choisir** le bon format selon tes contraintes : lisibilité, taille réseau, parsing côté client
- **Déboguer** les erreurs courantes de sérialisation (encodage, guillemets, nesting)
- **Valider** qu'une API retourne le bon format avec les bons en-têtes HTTP

---

## Mise en situation

Tu développes un backend pour une plateforme de gestion de projets. Ton API doit :

1. **Retourner** la liste des utilisateurs : nom, email, avatar (URL), statut actif/inactif
2. **Accepter** la création d'un nouveau projet en POST avec des métadonnées imbriquées (équipe, tags, budget)
3. **Interopérer** avec un client web (JavaScript) et un client mobile (iOS)
4. **S'intégrer** avec un système legacy qui consomme du XML

Le choix du format affecte directement :
- La taille des réponses (JSON ~25% plus petit que XML)
- Le temps de parsing côté client
- La compatibilité avec les outils existants
- La courbe d'apprentissage pour les intégrateurs tiers

**Tu dois donc comprendre les formats au-delà de "JSON c'est standard".**

---

## Contexte : pourquoi plusieurs formats ?

### L'histoire courte

Avant le JSON (popularisé vers 2005), le monde utilisait principalement **XML** : lisible, mais verbeux. Quand les API web ont explosé avec le JavaScript côté client, le JSON s'est imposé comme le standard *de facto* — plus léger, natif en JavaScript, plus facile à parser.

**Aujourd'hui :**
- **JSON** : 90% des API REST publiques
- **XML** : systèmes d'intégration d'entreprise, legacy, certains standards (SOAP, RSS)
- **YAML** : configuration, documentation, rarement dans les API (trop permissif)
- **Protobuf, MessagePack** : haute performance, peu courant en API REST public

### Pourquoi cette diversité persiste

Chaque format répond à un trade-off différent :

| Aspect | JSON | XML | YAML |
|--------|------|-----|------|
| **Taille** | Compact | 2-3× plus volumineux | Intermédiaire |
| **Parsing natif** | JavaScript, Python | Librairies requises | Python (YAML), autres varient |
| **Lisibilité humaine** | Excellente | Bonne (mais verbeux) | Très bonne |
| **Support des types** | string, number, boolean, null, array, object | Tous strings (attributs/éléments) | Riche (dates, sets, références) |
| **Écosystème** | Massive | Ancien, stable | DevOps, config |

Ce que tu dois retenir : **tu vas choisir JSON pour 95% de tes API REST**. Les autres formats ? Tu les rencontreras en intégration legacy ou configuration.

---

## Fondation : comprendre la sérialisation

La sérialisation, c'est transformer des données en mémoire (objet, dictionnaire, instance) en **texte brut** que tu peux envoyer sur le réseau ou stocker.

La désérialisation, c'est l'inverse : transformer ce texte brut en objet utilisable.

```
Objet Python (en mémoire)         Sérialisation (JSON)        Texte brut
┌──────────────────┐              ┌──────────────────┐        ┌──────────────┐
│ user = {         │              │ "toJSON()"       │        │ {            │
│  "id": 1,        │  ─────────→  │ ou json.dumps()  │  ──→   │  "id": 1,    │
│  "name": "Alice" │              │                  │        │  "name":     │
│ }                │              │                  │        │   "Alice"    │
└──────────────────┘              └──────────────────┘        │ }            │
                                                               └──────────────┘
      En mémoire (rapide)       Processus de transformation   Sur le réseau
      Pas accessible depuis              (coûteux)             ou disque
      le réseau ou le disque
```

Le format **décrit la règle de transformation**.

---

## JSON : le format dominant

### Syntaxe de base

JSON, c'est 6 types de base :

```json
{
  "name": "Alice",           // string : guillemets obligatoires
  "age": 28,                 // number : pas de guillemets
  "active": true,            // boolean : true ou false (minuscules)
  "profile_url": null,       // null : absence de valeur
  "tags": ["api", "python"], // array : liste ordonnée
  "metadata": {              // object : dictionnaire
    "role": "admin",
    "created_at": "2024-01-15"
  }
}
```

⚠️ **Pièges courants avec JSON :**

1. **Les guillemets sont obligatoires autour des clés et valeurs string**
   ```json
   ❌ { name: "Alice" }      // syntaxe JavaScript, pas JSON valide
   ✅ { "name": "Alice" }    // correct
   ```

2. **Pas de virgule après le dernier élément**
   ```json
   ❌ { "name": "Alice", }   // virgule trainante
   ✅ { "name": "Alice" }    // correct
   ```

3. **Les valeurs non-string ne prennent pas de guillemets**
   ```json
   ❌ { "age": "28" }        // c'est une string, pas un number
   ✅ { "age": 28 }          // vrai number
   ```
   Pourquoi ça compte ? Parce qu'un client peut faire des opérations arithmétiques sur 28, mais pas sur `"28"`.

4. **Pas de commentaires en JSON**
   ```json
   ❌ { "name": "Alice" } // mon commentaire  — INVALIDE
   ```
   (Contrairement à YAML qui en accepte.)

### Parser et générer du JSON

**Python :**

```python
import json

# Désérialiser (JSON texte → Python dict)
json_text = '{"name": "Alice", "age": 28}'
user = json.loads(json_text)
print(user["name"])  # "Alice"

# Sérialiser (Python dict → JSON texte)
user_dict = {"name": "Alice", "age": 28}
json_output = json.dumps(user_dict, indent=2)
print(json_output)
# {
#   "name": "Alice",
#   "age": 28
# }
```

**JavaScript :**

```javascript
// Désérialiser (JSON texte → JS objet)
const jsonText = '{"name": "Alice", "age": 28}';
const user = JSON.parse(jsonText);
console.log(user.name); // "Alice"

// Sérialiser (JS objet → JSON texte)
const userObj = { name: "Alice", age: 28 };
const jsonOutput = JSON.stringify(userObj, null, 2);
console.log(jsonOutput);
// {
//   "name": "Alice",
//   "age": 28
// }
```

🧠 **Concept clé :** `JSON.parse()` et `json.loads()` font exactement la même chose : transformer une string JSON en objet utilisable. De même, `JSON.stringify()` et `json.dumps()` transforment un objet en string JSON.

### Cas réel : réponse d'API

Une vraie réponse HTTP depuis `/api/users/1` :

```
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 187

{
  "id": 1,
  "name": "Alice",
  "email": "alice@example.com",
  "created_at": "2024-01-15T10:30:00Z",
  "profile": {
    "bio": "API enthusiast",
    "avatar_url": "https://api.example.com/avatars/alice.jpg"
  },
  "tags": ["python", "devops"]
}
```

💡 **Notice important :** l'en-tête `Content-Type: application/json` dit au client "ce contenu est du JSON". Sans cet en-tête, le client ne saurait pas comment le parser.

---

## XML : quand tu le rencontreras

XML ressemble à du HTML. Chaque donnée est entourée d'une balise ouvrante et fermante.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<user>
  <id>1</id>
  <name>Alice</name>
  <email>alice@example.com</email>
  <created_at>2024-01-15T10:30:00Z</created_at>
  <profile>
    <bio>API enthusiast</bio>
    <avatar_url>https://api.example.com/avatars/alice.jpg</avatar_url>
  </profile>
  <tags>
    <tag>python</tag>
    <tag>devops</tag>
  </tags>
</user>
```

C'est le **même contenu** que le JSON ci-dessus, mais 2× plus volumineux.

### Pourquoi XML existe encore

- **SOAP** (protocole legacy pour l'intégration d'entreprise) exige XML
- **RSS/Atom** (syndication de contenu) utilisent XML
- Certains systèmes d'intégration (EDI, BtoB) parce que les contrats incluent XML depuis 15 ans
- **XSD** permet une validation de schéma très stricte

### Parser du XML en Python

```python
import xml.etree.ElementTree as ET

xml_text = '''<?xml version="1.0"?>
<user>
  <id>1</id>
  <name>Alice</name>
</user>'''

# Parser le XML
root = ET.fromstring(xml_text)
name = root.find('name').text  # "Alice"
print(name)
```

**Conseil :** si tu dois traiter du XML en production, utilise `lxml` à la place (plus rapide, meilleur support des espaces de noms).

---

## YAML : lisibilité maximale (mais attention)

YAML essaie d'être super lisible — pas de guillemets autour des strings, indentation pour la structure.

```yaml
name: Alice
age: 28
active: true
tags:
  - api
  - python
metadata:
  role: admin
  created_at: 2024-01-15
```

C'est agréable à lire... **jusqu'au moment où ça ne l'est plus.**

### Les pièges de YAML

```yaml
# ❌ Piège 1 : dates vs strings
created_at: 2024-01-15     # YAML le parse comme... une date
created_at: "2024-01-15"   # ✅ String (guillemets forcer la string)

# ❌ Piège 2 : oui/non se parsent comme booléens
result: yes                # YAML → true (pas "yes")
result: "yes"              # ✅ String "yes"

# ❌ Piège 3 : les deux espaces d'indentation créent des niveaux différents
user:
  name: Alice              # partie de user
 role: admin               # ❌ ERREUR : indentation incohérente
```

**Verdict :** YAML c'est super pour la **configuration** (fichiers d'équipe, docker-compose.yml) où tu contrôles le contenu. Mais pour une **API**, c'est risqué parce que l'indentation est fragile et le parsing est trop permissif.

---

## Comparaison : quel format pour quoi ?

| Situation | Format | Raison |
|-----------|--------|--------|
| API REST public ou interne | **JSON** | Léger, native JS, parsing trivial, standard |
| Intégration avec système legacy SOAP | **XML** | Obligation contractuelle |
| Configuration d'application / infrastructure | **YAML** | Lisibilité, écosystème DevOps |
| Haute performance, très gros volumes | **Protobuf ou MessagePack** | Taille 5-10× plus petite que JSON |
| Flux de données temps réel (streaming) | **JSON Streaming** ou **Newline-delimited JSON** | Permet de traiter ligne par ligne sans charger tout en mémoire |

---

## Construction progressive : d'une réponse simple à la production

### Version 1 : données plates (débutant)

```python
# Récupérer une liste d'utilisateurs simples
# GET /api/users

{
  "users": [
    {"id": 1, "name": "Alice"},
    {"id": 2, "name": "Bob"}
  ]
}
```

**Problèmes :**
- Pas de type ou métadonnées
- Pas d'indication de pagination (et si 10 000 utilisateurs ?)
- Pas de statut de réponse inclus

### Version 2 : structure enveloppée (robustesse)

```python
# Format cohérent avec métadonnées
{
  "status": "success",
  "data": {
    "users": [
      {
        "id": 1,
        "name": "Alice",
        "email": "alice@example.com",
        "created_at": "2024-01-15T10:30:00Z"
      },
      {
        "id": 2,
        "name": "Bob",
        "email": "bob@example.com",
        "created_at": "2024-01-16T14:20:00Z"
      }
    ],
    "pagination": {
      "total": 42,
      "page": 1,
      "per_page": 2,
      "total_pages": 21
    }
  }
}
```

**Améliorations :**
- Champ `status` explicite (client sait si c'est ok)
- Métadonnées de pagination (client peut afficher "page 1/21")
- Timestamps ISO 8601 (parsable partout)
- Données enrichies (email inclus)

### Version 3 : production avec versionning et erreurs

```python
# La version finale qui va en prod
# GET /api/v2/users?page=1&per_page=2

HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
X-RateLimit-Remaining: 4999
X-API-Version: 2.1

{
  "status": "success",
  "version": "2.1",
  "timestamp": "2024-01-20T15:45:30Z",
  "data": {
    "users": [
      {
        "id": 1,
        "name": "Alice",
        "email": "alice@example.com",
        "created_at": "2024-01-15T10:30:00Z",
        "links": {
          "self": "/api/v2/users/1",
          "profile": "/api/v2/users/1/profile"
        }
      },
      {
        "id": 2,
        "name": "Bob",
        "email": "bob@example.com",
        "created_at": "2024-01-16T14:20:00Z",
        "links": {
          "self": "/api/v2/users/2",
          "profile": "/api/v2/users/2/profile"
        }
      }
    ],
    "pagination": {
      "total": 42,
      "page": 1,
      "per_page": 2,
      "total_pages": 21,
      "links": {
        "next": "/api/v2/users?page=2&per_page=2",
        "last": "/api/v2/users?page=21&per_page=2"
      }
    }
  }
}
```

**Évolutions en production :**
- En-têtes HTTP explicites (versionning dans l'URL, headers de rate limit)
- Champs `links` pour que le client puisse découvrir les URLs sans les construire (HATEOAS)
- Timestamp de réponse
- Versionning d'API (v2, v3) pour gérer l'évolution

---

## Erreurs fréquentes et corrections

### Erreur 1 : JSON malformé dans une réponse

**Symptôme :**
```
TypeError: JSONDecodeError: Expecting value: line 1 column 1 (char 0)
```

**Cause probable :**
```python
# Code backend
return {"name": "Alice", "active": True}  # ❌ Python (True, pas true)
# Le serveur web n'a pas sérialisé en JSON valide
```

**Correction :**
```python
import json

response = {"name": "Alice", "active": True}
return json.dumps(response)  # ✅ Correct : true (minuscule)
# Résultat : {"name": "Alice", "active": true}
```

**Astuce :** utilise un middleware ou framework (Flask, FastAPI, Django) qui sérialise automatiquement. Ne forge jamais du JSON à la main.

---

### Erreur 2 : Guillemets mal échappés dans une string

**Symptôme :**
```json
❌ {"text": "He said "hello" today"}
```

Ceci est invalide JSON. Les guillemets internes cassent la string.

**Correction :**

```python
import json

text = 'He said "hello" today'
json_output = json.dumps({"text": text})
# ✅ Résultat : {"text": "He said \"hello\" today"}
# Les guillemets internes sont échappés automatiquement
```

**Astuce :** laisse toujours la librairie JSON gérer l'échappement. N'essaie jamais de construire du JSON en concaténant des strings.

---

### Erreur 3 : Encoder/décoder avec le mauvais charset

**Symptôme :**
```
UnicodeDecodeError: 'utf-8' codec can't decode byte 0xff in position 0
```

**Cause :** la réponse HTTP utilise Latin-1 ou UTF-16, mais tu demandes UTF-8.

**Correction :**

```python
import requests

response = requests.get("https://api.example.com/users")
# requests détecte automatiquement le charset depuis Content-Type
data = response.json()  # ✅ Charset correct

# Ou manuellement si tu récupères les bytes bruts :
json_bytes = b'{"name": "\xc3\x89ric"}'  # UTF-8 encodé
data = json.loads(json_bytes.decode('utf-8'))  # ✅ Décode en UTF-8
```

**Astuce :** `requests.json()` gère le charset pour toi. Si tu utilises un client bas niveau, regarde l'en-tête `Content-Type: application/json; charset=utf-8` pour savoir comment décoder.

---

### Erreur 4 : Types mal convertis à la désérialisation

**Symptôme :**
```python
response = {"age": 28, "budget": 1500.50, "active": true}
data = json.loads(response)
print(type(data["age"]))  # <class 'int'> ✅ Correct
print(type(data["active"]))  # <class 'bool'> ✅ Correct
print(data["age"] + 1)  # 29 ✅ Arithmétique fonctionne

# MAIS si tu reçois...
response = '{"age": "28"}'  # ❌ String, pas number
data = json.loads(response)
print(type(data["age"]))  # <class 'str'>
print(data["age"] + 1)  # TypeError: can only concatenate str with str
```

**Correction :**
Valide le type à la réception :

```python
import json

response = '{"age": "28"}'
data = json.loads(response)

# Validation et conversion
age = int(data["age"])  # Convertir en int
print(age + 1)  # ✅ 29

# Ou utilise Pydantic (pour FastAPI/modernes)
from pydantic import BaseModel

class User(BaseModel):
    age: int  # Pydantic valide et convertit

user = User(age="28")  # ✅ Accepté et converti en int
print(user.age + 1)  # 29
```

---

## Cas d'usage réels

### Cas 1 : Créer un utilisateur via POST

**Requête :**
```
POST /api/users
Content-Type: application/json

{
  "name": "Charlie",
  "email": "charlie@example.com",
  "role": "editor"
}
```

**Code Python (côté serveur) :**
```python
from flask import Flask, request, jsonify
import json

app = Flask(__name__)

@app.route('/api/users', methods=['POST'])
def create_user():
    # Désérialiser le JSON reçu
    data = request.json  # Flask le désérialise automatiquement
    
    # Valider
    if not data.get('name') or not data.get('email'):
        return jsonify({"error": "name et email requis"}), 400
    
    # Créer l'utilisateur en base de données (pseudo-code)
    user = {
        "id": 3,
        "name": data['name'],
        "email": data['email'],
        "role": data.get('role', 'viewer'),  # défaut
        "created_at": "2024-01-20T15:45:30Z"
    }
    
    # Sérialiser la réponse
    return jsonify(user), 201  # jsonify() sérialise automatiquement
```

**Code JavaScript (côté client) :**
```javascript
// Sérialiser et envoyer
const newUser = {
  name: "Charlie",
  email: "charlie@example.com",
  role: "editor"
};

fetch("/api/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(newUser)  // Sérialiser en JSON
})
  .then(response => response.json())  // Désérialiser la réponse
  .then(data => console.log("Créé :", data));
```

---

### Cas 2 : Parser une réponse avec données imbriquées

**Réponse de l'API :**
```json
{
  "project": {
    "id": 101,
    "name": "Platform Redesign",
    "team": [
      {"id": 1, "name": "Alice", "role": "lead"},
      {"id": 2, "name": "Bob", "role": "developer"}
    ],
    "budget": {
      "total": 50000,
      "spent": 32000,
      "remaining": 18000
    }
  }
}
```

**Accéder aux données imbriquées :**

```python
import json

response = '{"project": {"id": 101, "name": "Platform Redesign", ...}}'
data = json.loads(response)

# Accès aux niveaux imbriqués
project_name = data['project']['name']  # "Platform Redesign"
first_team_member = data['project']['team'][0]['name']  # "Alice"
remaining_budget = data['project']['budget']['remaining']  # 18000

print(f"Projet: {project_name}")
print(f"Leader: {first_team_member}")
print(f"Budget restant: ${remaining_budget}")
```

**Avec JavaScript :**
```javascript
const data = {
  project: {
    id: 101,
    name: "Platform Redesign",
    team: [
      { id: 1, name: "Alice", role: "lead" },
      { id: 2, name: "Bob", role: "developer" }
    ],
    budget: {
      total: 50000,
      spent: 32000,
      remaining: 18000
    }
  }
};

const projectName = data.project.name;
const firstTeamMember = data.project.team[0].name;
const remainingBudget = data.project.budget.remaining;

console.log(`Projet: ${projectName}`);
console.log(`Leader: ${firstTeamMember}`);
console.log(`Budget restant: $${remainingBudget}`);
```

---

### Cas 3 : Valider le Content-Type d'une réponse

**Problème :** tu reçois une réponse qui prétend être du JSON, mais ce n'est pas du JSON valide.

```python
import requests

response = requests.get("https://api.example.com/users")

# ✅ Vérifier le Content-Type
if "application/json" not in response.headers.get("Content-Type", ""):
    raise ValueError("Réponse n'est pas du JSON")

# ✅ Essayer de parser
try:
    data = response.json()
except json.JSONDecodeError as e:
    print(f"Erreur de parsing JSON : {e}")
    print(f"Contenu brut : {response.text[:200]}")  # Affiche les 200 premiers caractères
```

**Astuce :** certaines APIs bugguées retournent `Content-Type: text/html` même si c'est du JSON. Toujours vérifier.

---

## Bonnes pratiques

### 1. Utilise des librairies JSON, jamais du string building

❌ **Mauvais :**
```python
json_str = '{"name": "' + user_name + '", "age": ' + str(age) + '}'
```

✅ **Bon :**
```python
data = {"name": user_name, "age": age}
json_str = json.dumps(data)
```

**Pourquoi :** la première approche crée des JSON invalides si `user_name` contient des guillemets ou caractères spéciaux. La librairie gère l'échappement.

---

### 2. Valide les données désérialisées

```python
import json
from typing import TypedDict

class UserData(TypedDict):
    name: str
    email: str
    age: int

def process_user(json_str: str):
    data = json.loads(json_str)
    
    # ✅ Valider avant d'utiliser
    if not isinstance(data.get('name'), str) or len(data['name']) == 0:
        raise ValueError("name doit être une string non vide")
    
    if not isinstance(data.get('age'), int) or data['age'] < 0:
        raise ValueError("age doit être un entier positif")
    
    return data
```

**Pourquoi :** une API reçoit du JSON brut. Le client peut envoyer `{"name": null}` ou `{"age": "vingt-huit"}`. Ne fais jamais de suppositions.

---

### 3. Prépare les réponses pour la pagination

```python
def serialize_response(data, total_count, page, per_page):
    return {
        "status": "success",
        "data": data,
        "pagination": {
            "total": total_count,
            "page": page,
            "per_page": per_page,
            "total_pages": (total_count + per_page - 1) // per_page
        }
    }
```

**Pourquoi :** un client web affichant 100 utilisateurs ne peut pas télécharger 100 000 d'un coup. La pagination est obligatoire en production.

---

### 4. Utilise ISO 8601 pour les dates

```python
from datetime import datetime

# ❌ Mauvais : format ambigu
created_at = "01/02/2024"  # c'est janvier ou février ? Dépend de la locale.

# ✅ Bon : ISO 8601
created_at = datetime.utcnow().isoformat() + "Z"  # "2024-01-20T15:45:30Z"
```

**Pourquoi :** ISO 8601 est un standard universel. Tout système (JavaScript, Java, Go) peut le parser sans ambiguïté de format.

---

### 5. Gère les erreurs avec structure cohérente

```python
@app.errorhandler(400)
def bad_request(error):
    return jsonify({
        "status": "error",
        "error_code": "INVALID_REQUEST",
        "message": "Le JSON n'est pas valide",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }), 400
```

**Pourquoi :** le client peut parser les erreurs de la même façon que les réussites. Cohérence = maintenabilité.

---

## Résumé — Tableau de révision

| Concept | Ce qu'il fait | À retenir |
|---------|---------------|-----------|
| **JSON** | Format texte pour échanger des données structurées | Léger, natif JavaScript, standard pour les API |
| **Sérialisation** | Convertir un objet en mémoire → texte (JSON) | Obligatoire pour envoyer les données sur le réseau |
| **Désérialisation** | Convertir du texte (JSON) → objet en mémoire | `json.loads()` Python, `JSON.parse()` JS |
| **Content-Type** | En-tête HTTP indiquant le format de la réponse | `application/json` = tu peux appeler `.json()` |
| **Types JSON** | string, number, boolean, null, array, object | Pas de dates, pas de `undefined`, pas de fonctions |
| **XML** | Format alternatif, plus verbeux, pour l'intégration legacy | 2-3× plus volumineux que JSON |
| **YAML** | Format lisible pour la configuration, peu fiable en API | Pièges d'indentation et parsing implic
