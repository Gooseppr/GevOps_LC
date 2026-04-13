---
layout: page
title: "Créer une API REST (backend)"

course: api_rest
chapter_title: "Créer une API (backend)"

chapter: 5
section: 1

tags: api, rest, backend, python, fastapi, http
difficulty: intermediate
duration: 90
mermaid: false

status: "published"
prev_module: "/courses/api_rest/07_bonnes_pratiques_base.html"
prev_module_title: "Bonnes pratiques de base pour une API REST"
next_module: "/courses/api_rest/11_securite_api.html"
next_module_title: "Sécurité des API REST"
---

# Créer une API REST (backend)

## Objectifs pédagogiques

À la fin de ce module, vous serez capable de :

1. **Structurer** une API REST avec des routes, des méthodes HTTP et des codes de statut appropriés
2. **Implémenter** les opérations CRUD sur une ressource avec FastAPI
3. **Valider** les données entrantes avec des schémas Pydantic
4. **Gérer** les erreurs de manière cohérente et explicite
5. **Tester** vos endpoints localement via la documentation interactive et curl

---

## Mise en situation

Vous intégrez une équipe qui développe une plateforme de gestion de tâches. Le frontend est déjà en cours de développement — il attend une API. Votre mission : livrer un backend fonctionnel qui expose une ressource `/tasks` avec les opérations de base (lecture, création, mise à jour, suppression).

Contraintes réelles du projet :
- Les données entrantes doivent être validées (pas de titre vide, priorité entre 1 et 5)
- Les erreurs doivent retourner un JSON structuré, pas un stack trace brut
- L'API doit être auto-documentée (le frontend a besoin de savoir ce que chaque route attend)

C'est exactement ce que ce module vous permet de construire, de façon progressive.

---

## Contexte — Pourquoi créer une API plutôt qu'une appli classique ?

Une appli web classique rend du HTML. Une API rend des données. C'est une différence de fond : votre backend devient un service que d'autres systèmes consomment — un frontend React, une app mobile, un script de traitement en Python, un autre microservice.

Ce découplage a un prix : il faut formaliser ce contrat (quelles routes, quels paramètres, quelles réponses) et le respecter rigoureusement. Un HTML mal formaté, ça s'affiche quand même. Un JSON mal structuré, ça casse silencieusement le client.

**FastAPI** est le choix de ce module pour plusieurs raisons concrètes : il est rapide à écrire, il valide automatiquement les données via Pydantic, et il génère une documentation interactive sans configuration supplémentaire. Pour un module sur la création d'API, c'est un excellent terrain d'apprentissage — les concepts s'appliquent ensuite à Express, Spring Boot ou Django REST Framework.

---

## Installation

```bash
# Créer et activer un environnement virtuel
python -m venv venv
source venv/bin/activate        # macOS/Linux
venv\Scripts\activate           # Windows

# Installer FastAPI et le serveur ASGI
pip install fastapi uvicorn

# Vérifier l'installation
python -c "import fastapi; print(fastapi.__version__)"
```

> 💡 `uvicorn` est le serveur qui fait tourner FastAPI. Il joue le même rôle qu'un Apache ou Nginx en développement — il écoute les requêtes HTTP et les transmet à votre application.

---

## Construction progressive — De zéro à une API fonctionnelle

### V1 — Le strict minimum : une route qui répond

```python
# main.py
from fastapi import FastAPI

app = FastAPI()           # L'objet principal — votre application

@app.get("/")             # Décorateur : associe GET / à cette fonction
def root():
    return {"message": "API en ligne"}   # FastAPI sérialise automatiquement le dict en JSON
```

```bash
# Lancer le serveur en mode développement (rechargement automatique)
uvicorn main:app --reload
```

Ouvrez `http://localhost:8000/docs` — vous avez déjà une documentation Swagger interactive. C'est gratuit, généré à partir de votre code.

Cette version ne fait rien d'utile, mais elle confirme que la mécanique fonctionne. Passons à quelque chose de concret.

---

### V2 — CRUD sur une ressource `/tasks`

On introduit ici trois choses en même temps : les modèles Pydantic pour la validation, un stockage en mémoire (on n'a pas encore de base de données), et les quatre opérations essentielles.

```python
# main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
import uuid

app = FastAPI(title="Task Manager API")

# --- Modèle de données ---

class TaskCreate(BaseModel):
    """Schéma pour la création d'une tâche — ce que le client envoie."""
    title: str = Field(..., min_length=1, max_length=100)   # obligatoire, non vide
    description: Optional[str] = None                        # facultatif
    priority: int = Field(default=1, ge=1, le=5)             # entre 1 et 5

class Task(TaskCreate):
    """Schéma complet — ce que l'API retourne, avec les champs générés côté serveur."""
    id: str
    done: bool = False

# --- Stockage en mémoire (remplacé par une DB en V3) ---
db: dict[str, Task] = {}

# --- Routes ---

@app.get("/tasks", response_model=list[Task])
def list_tasks():
    """Retourne toutes les tâches."""
    return list(db.values())   # 200 implicite si tout va bien


@app.post("/tasks", response_model=Task, status_code=201)
def create_task(task_data: TaskCreate):
    """Crée une nouvelle tâche. Retourne 201 avec la ressource créée."""
    task = Task(id=str(uuid.uuid4()), **task_data.dict())   # génère un ID unique
    db[task.id] = task
    return task


@app.get("/tasks/{task_id}", response_model=Task)
def get_task(task_id: str):
    """Récupère une tâche par son ID. Retourne 404 si introuvable."""
    if task_id not in db:
        raise HTTPException(status_code=404, detail=f"Tâche '{task_id}' introuvable")
    return db[task_id]


@app.patch("/tasks/{task_id}", response_model=Task)
def update_task(task_id: str, updates: dict):
    """Mise à jour partielle. PATCH modifie seulement les champs envoyés."""
    if task_id not in db:
        raise HTTPException(status_code=404, detail=f"Tâche '{task_id}' introuvable")
    stored = db[task_id].dict()
    stored.update(updates)                # fusionne les modifications
    db[task_id] = Task(**stored)
    return db[task_id]


@app.delete("/tasks/{task_id}", status_code=204)
def delete_task(task_id: str):
    """Supprime une tâche. Retourne 204 No Content — pas de body."""
    if task_id not in db:
        raise HTTPException(status_code=404, detail=f"Tâche '{task_id}' introuvable")
    del db[task_id]
    # Pas de return → 204 implicite
```

🧠 **Deux modèles Pydantic distincts** (`TaskCreate` et `Task`) — c'est un pattern fondamental. Le client ne doit jamais pouvoir fixer l'`id` ou le champ `done` à la création. Séparer les schémas d'entrée et de sortie empêche ce genre d'injection silencieuse.

⚠️ Le `dict` utilisé comme stockage est **non persistant** : toutes les tâches disparaissent au redémarrage du serveur. C'est volontaire ici pour se concentrer sur la mécanique HTTP, pas sur le stockage.

---

### V3 — Gestion des erreurs centralisée et validation stricte

En production, les erreurs arrivent de partout. Si chaque route gère les exceptions à sa façon, les clients reçoivent des formats incohérents — certaines erreurs en JSON, d'autres en texte brut. Un handler global résout ça.

```python
# À ajouter dans main.py, après la création de `app`
from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    """
    Intercepte les erreurs de validation Pydantic (données invalides du client).
    Retourne un 422 structuré plutôt que le message brut de FastAPI.
    """
    errors = [
        {
            "field": ".".join(str(loc) for loc in err["loc"]),  # ex: "body.title"
            "message": err["msg"],                               # ex: "field required"
        }
        for err in exc.errors()
    ]
    return JSONResponse(
        status_code=422,
        content={"error": "Données invalides", "details": errors}
    )


@app.exception_handler(Exception)
async def generic_error_handler(request: Request, exc: Exception):
    """
    Filet de sécurité : capture toute exception non gérée.
    Ne jamais exposer le stack trace en production.
    """
    return JSONResponse(
        status_code=500,
        content={"error": "Erreur interne", "message": "Contactez l'équipe technique"}
    )
```

💡 Le handler `RequestValidationError` est déclenché automatiquement quand Pydantic rejette les données entrantes — pas besoin de `try/except` dans chaque route. Vous écrivez la règle une fois, elle s'applique partout.

---

## Tester votre API

Deux approches complémentaires — l'une pour explorer, l'autre pour automatiser.

**Via Swagger UI** (navigation)

Rendez-vous sur `http://localhost:8000/docs`. Chaque route est listée avec ses paramètres attendus, ses codes de retour, et un bouton "Try it out" pour tester en direct.

**Via curl** (reproductible)

```bash
# Créer une tâche
curl -X POST http://localhost:8000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Configurer le CI", "priority": 3}'

# Lister toutes les tâches
curl http://localhost:8000/tasks

# Récupérer une tâche spécifique (remplacer <TASK_ID> par l'id retourné)
curl http://localhost:8000/tasks/<TASK_ID>

# Tester la validation — envoi d'une priorité hors plage
curl -X POST http://localhost:8000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "priority": 99}'
# → 422 avec le détail de l'erreur
```

---

## Erreurs fréquentes

**Symptôme** : `422 Unprocessable Entity` sur une route POST alors que le JSON semble correct.  
**Cause** : le `Content-Type: application/json` est absent du header. FastAPI ne sait pas que le body est du JSON et refuse de le parser.  
**Correction** : toujours inclure `-H "Content-Type: application/json"` dans curl, ou configurer Postman correctement.

---

**Symptôme** : les modifications via PATCH semblent s'appliquer, mais les données originales restent au prochain GET.  
**Cause** : vous avez modifié le dictionnaire retourné par `.dict()` sans réassigner dans `db`. Python ne modifie pas l'objet original automatiquement.  
**Correction** : vérifier que la ligne `db[task_id] = Task(**stored)` est bien exécutée — c'est elle qui persiste la modification.

---

**Symptôme** : le serveur plante avec `address already in use` au lancement.  
**Cause** : un autre processus uvicorn tourne déjà (terminal oublié, ou plantage partiel).  
**Correction** : `lsof -i :8000` pour trouver le PID, puis `kill <PID>`. Ou lancer sur un autre port : `uvicorn main:app --reload --port 8001`.

---

⚠️ **Retourner un dict Python directement depuis un handler d'erreur** (sans `JSONResponse`) peut produire un 200 OK au lieu du bon code de statut. FastAPI interprète le `return {}` comme une réponse normale. Toujours utiliser `raise HTTPException(...)` pour les erreurs dans les routes, ou `JSONResponse(status_code=...)` dans les handlers.

---

## Bonnes pratiques

**Séparer les schémas d'entrée et de sortie.** L'exemple avec `TaskCreate` / `Task` n'est pas une coquetterie — c'est une protection. Si le client peut fixer l'`id` lui-même, vous avez une faille d'intégrité. Si le schéma de sortie expose un champ `password_hash`, c'est une fuite. Deux modèles distincts, c'est la règle de base.

**Utiliser les bons codes HTTP dès le début.** `POST` réussi → 201, pas 200. `DELETE` réussi → 204, pas 200. Suppression d'une ressource inexistante → 404, pas 500. Ce n'est pas du détail : les clients (et les outils de monitoring) utilisent ces codes pour décider quoi faire ensuite.

**Ne jamais exposer les détails internes en 500.** Un stack trace en production dit au client (et potentiellement à un attaquant) comment votre code est structuré. Le handler générique de la V3 est là pour ça — logguer l'exception côté serveur, retourner un message générique côté client.

**Versionner votre API dès le premier jour.** Même si vous n'avez qu'une version, préfixer vos routes `/v1/tasks` plutôt que `/tasks` évite un refactor douloureux le jour où un breaking change est nécessaire.

```python
# Préfixage simple avec APIRouter
from fastapi import APIRouter

router = APIRouter(prefix="/v1")

@router.get("/tasks")
def list_tasks():
    ...

app.include_router(router)   # montage dans l'app principale
```

---

## Résumé

| Concept | Ce qu'il fait | À retenir |
|---|---|---|
| `@app.get/post/patch/delete` | Associe une méthode HTTP à une fonction Python | Le décorateur définit le contrat de la route |
| `BaseModel` Pydantic | Valide et parse les données entrantes automatiquement | Si la validation échoue → 422 avant même d'entrer dans la fonction |
| `HTTPException` | Retourne une erreur HTTP structurée depuis une route | Préférer ça à un `return {"error": ...}` sans code de statut |
| `status_code=201` | Fixe le code de retour d'une route | Nécessaire pour POST (création) et DELETE (204) |
| `exception_handler` | Intercepte les erreurs globalement | Une seule définition couvre toutes les routes |
| `APIRouter` avec prefix | Regroupe et préfixe les routes | Indispensable pour le versioning et la modularité |

Créer une API backend, c'est finalement formaliser un contrat : quels chemins existent, ce qu'ils attendent, ce qu'ils retournent, et comment ils se comportent en cas d'erreur. FastAPI rend ce contrat explicite dans le code lui-même — la validation, la documentation et les types sont alignés par construction, pas par convention.

---

<!-- snippet
id: fastapi_install_setup
type: command
tech: fastapi
level: intermediate
importance: high
format: knowledge
tags: fastapi, installation, uvicorn, setup, python
title: Installer et lancer FastAPI avec uvicorn
command: pip install fastapi uvicorn && uvicorn <MODULE>:app --reload
example: pip install fastapi uvicorn && uvicorn main:app --reload
description: uvicorn est le serveur ASGI requis pour faire tourner FastAPI. --reload active le rechargement automatique à chaque modification du code.
-->

<!-- snippet
id: fastapi_route_decorator
type: concept
tech: fastapi
level: intermediate
importance: high
format: knowledge
tags: fastapi, route, decorateur, http, methode
title: Déclarer une route FastAPI avec un décorateur HTTP
content: Le décorateur @app.get("/path") associe la méthode HTTP GET et le chemin /path à la fonction Python. FastAPI enregistre cette association au démarrage et sérialise automatiquement le dict retourné en JSON avec status 200.
description: La méthode HTTP est choisie dans le décorateur (@app.post, @app.patch...). Le dict Python retourné est automatiquement converti en JSON.
-->

<!-- snippet
id: fastapi_pydantic_two_models
type: tip
tech: fastapi
level: intermediate
importance: high
format: knowledge
tags: fastapi, pydantic, schema, securite, validation
title: Toujours séparer le schéma d'entrée et de sortie Pydantic
content: Créer deux classes distinctes : TaskCreate (ce que le client envoie, sans id ni champs générés) et Task(TaskCreate) (ce que l'API retourne, avec id et champs serveur). Empêche le client de fixer l'id ou d'exposer des champs sensibles (ex: password_hash) dans la réponse.
description: Un seul modèle pour entrée et sortie expose des champs internes ou laisse le client manipuler des champs qu'il ne devrait pas contrôler.
-->

<!-- snippet
id: fastapi_http_exception
type: concept
tech: fastapi
level: intermediate
importance: high
format: knowledge
tags: fastapi, erreur, http, 404, exception
title: Lever une HTTPException pour retourner une erreur HTTP
content: raise HTTPException(status_code=404, detail="message") interrompt la fonction et retourne immédiatement une réponse JSON {"detail": "message"} avec le code HTTP choisi. Utiliser ça plutôt que return {"error": ...} qui retournerait un 200 OK malgré l'erreur.
description: Sans HTTPException, FastAPI retourne 200 même si vous signalez une erreur dans le body. HTTPException est le seul moyen propre de retourner un vrai code d'erreur depuis une route.
-->

<!-- snippet
id: fastapi_status_code_201_204
type: warning
tech: fastapi
level: intermediate
importance: high
format: knowledge
tags: fastapi, status_code, 201, 204, http
title: Spécifier status_code=201 sur POST et 204 sur DELETE
content: Piège : FastAPI retourne 200 par défaut sur toutes les routes, même POST et DELETE. Conséquence : les clients ne distinguent pas une création d'une lecture. Correction : @app.post("/tasks", status_code=201) et @app.delete("/tasks/{id}", status_code=204). Pour 204, ne pas retourner de body.
description: POST réussi → 201 Created. DELETE réussi → 204 No Content. Le 200 par défaut de FastAPI ne correspond pas à la sémantique REST attendue.
-->

<!-- snippet
id: fastapi_validation_error_handler
type: tip
tech: fastapi
level: intermediate
importance: medium
format: knowledge
tags: fastapi, validation, erreur, pydantic, handler
title: Centraliser la gestion des erreurs de validation Pydantic
content: Décorer une fonction avec @app.exception_handler(RequestValidationError) intercepte toutes les erreurs Pydantic de l'application. Retourner JSONResponse(status_code=422, content={...}) avec un format structuré. Sans ça, FastAPI expose le message brut de Pydantic, difficile à parser côté client.
description: Un handler global évite d'écrire try/except dans chaque route et garantit un format d'erreur homogène pour tous les endpoints.
-->

<!-- snippet
id: fastapi_500_no_stacktrace
type: warning
tech: fastapi
level: intermediate
importance: high
format: knowledge
tags: fastapi, securite, erreur, production, 500
title: Ne jamais exposer le stack trace dans une réponse 500
content: Piège : retourner str(exc) dans un handler 500 révèle la structure interne du code (noms de fichiers, variables, librairies). Conséquence : fuite d'informations exploitable. Correction : loguer l'exception côté serveur (logging.exception(exc)), retourner {"error": "Erreur interne"} côté client.
description: En production, le message d'erreur côté client doit être générique. Le détail part dans les logs, pas dans la réponse HTTP.
-->

<!-- snippet
id: fastapi_api_versioning_router
type: tip
tech: fastapi
level: intermediate
importance: medium
format: knowledge
tags: fastapi, versioning, router, apirouter, architecture
title: Préfixer les routes avec APIRouter pour versionner dès le départ
content: Créer un router = APIRouter(prefix="/v1") et déclarer les routes dessus (@router.get("/tasks")). Monter avec app.include_router(router). Préférer ça dès le premier endpoint — migrer /tasks vers /v1/tasks après coup nécessite de mettre à jour tous les clients.
description: Le versioning /v1/ dans l'URL permet d'introduire des breaking changes dans /v2/ sans casser les clients existants sur /v1/.
-->

<!-- snippet
id: fastapi_curl_content_type
type: error
tech: fastapi
level: intermediate
importance: medium
format: knowledge
tags: fastapi, curl, 422, content-type, debug
title: 422 sur POST curl alors que le JSON semble valide
content: Symptôme : curl POST retourne 422 alors que le JSON est correct. Cause : le header Content-Type: application/json est absent — FastAPI ne parse pas le body sans lui. Correction : ajouter -H "Content-Type: application/json" à chaque requête curl avec body JSON.
description: Sans Content-Type, FastAPI interprète le body comme form-data et Pydantic échoue à valider. C'est l'erreur curl la plus fréquente sur les API JSON.
-->

<!-- snippet
id: fastapi_swagger_docs_url
type: tip
tech: fastapi
level: intermediate
importance: medium
format: knowledge
tags: fastapi, swagger, documentation, debug, test
title: Accéder à la documentation interactive FastAPI
content: FastAPI génère automatiquement deux interfaces : http://localhost:8000/docs (Swagger UI, avec formulaires Try it out) et http://localhost:8000/redoc (documentation lisible). Disponibles sans configuration supplémentaire, basées sur le code et les schémas Pydantic.
description: La doc Swagger est générée à partir des décorateurs et des modèles Pydantic. Elle permet de tester chaque endpoint directement depuis le navigateur.
-->
