```yaml
---
layout: page
title: "CI/CD & déploiement API"

course: "API REST"
chapter_title: "Opération et déploiement"

chapter: 7
section: 1

tags: "cicd,devops,déploiement,api,production,github-actions,docker,orchestration"
difficulty: advanced
duration: 240
mermaid: true

icon: "🚀"
domain: "DevOps & Infrastructure"
domain_icon: "⚙️"
status: "published"
---

# CI/CD & déploiement API

## Objectifs pédagogiques

À la fin de ce module, vous serez capable de :

- Concevoir un pipeline CI/CD automatisé qui teste, construit et déploie une API à chaque commit
- Différencier les rôles de la CI (tests, validation) et du CD (déploiement progressif)
- Implémenter des tests d'API dans un pipeline et rejeter les versions cassées avant production
- Orchestrer le déploiement d'une API containerisée sur plusieurs environnements (dev, staging, prod)
- Diagnostiquer et corriger les échecs de pipeline sans intervention manuelle
- Mettre en place des mécanismes de rollback et de canary deployment pour limiter les risques

---

## Mise en situation

Vous venez de finir votre première API : elle fonctionne en local, les tests passent. Vous la mettez en production… et 2 heures plus tard, un client signale une bug. Après investigation, vous découvrez qu'une dépendance a changé de comportement sur le serveur. Vous corrigez, redéployez manuellement, mais cette fois ça casse l'authentification. Pendant ce temps, votre équipe attend que l'API soit accessible.

**Le problème :** déployer à la main, c'est lent, sujet aux erreurs humaines, et impossible à tracer. Quand ça casse, tout le monde subit.

**La solution :** automatiser le cycle entier — chaque commit déclenche automatiquement des tests, une build, et un déploiement progressif. Si quelque chose échoue, vous le savez avant que le client le découvre. Si ça marche, c'est déployé en 10 minutes, pas 2 heures.

Ce module porte sur ce pipeline : comment tester une API avant qu'elle ne voie la lumière du jour, comment l'empaqueter, comment la déployer progressivement en production, et comment revenir en arrière si ça tourne mal.

---

## Architecture du pipeline CI/CD

Avant de plonger dans l'implémentation, voyons comment les pièces s'assemblent :

```mermaid
graph LR
    A["📝 Commit<br/>Code"] -->|Git push| B["🔍 CI Pipeline<br/>Tests & Lint"]
    B -->|✓ Valide| C["🏗️ Build<br/>Docker Image"]
    B -->|✗ Échoue| D["❌ Rejeté<br/>Notif dev"]
    C -->|Image| E["📦 Registry<br/>DockerHub/ECR"]
    E -->|Version| F["🚀 CD Pipeline<br/>Déploiement"]
    F -->|v1.0 en Staging| G["🧪 Smoke Tests<br/>Vérifs post-deploy"]
    G -->|✓ OK| H["✅ Prod<br/>Canary 10%"]
    G -->|✗ Rollback| I["⏮️ Version N-1"]
    H -->|Traffic stable| J["🎯 Prod Full<br/>100%"]
    J -->|Monitoring| K["📊 Observabilité"]
    K -->|Alerte| L["🔔 On-call"]
```

Quatre étapes-clés :

| Étape | Quand | Qui | Résultat |
|-------|-------|-----|----------|
| **CI** | À chaque commit | Serveur (GitHub Actions / GitLab CI) | ✓ Tests passent, image prête |
| **Build** | Après CI | Serveur | Docker image taguée et versionnée |
| **CD Staging** | Après build | Serveur | API testée en environnement "fake prod" |
| **CD Prod** | Manuel ou auto après staging | Humain (gate) | Déploiement canary → prod complète |

La clé : chaque étape rejette les mutations problématiques *avant* qu'elles ne touchent le client.

---

## Étape 1 : Configuration initiale et versioning

### Structure du dépôt

Voici comment organiser votre code pour qu'un pipeline le comprenne :

```
my-api/
├── src/                          # Code source
│   ├── main.py                   # Point d'entrée
│   ├── api/
│   │   ├── routes.py
│   │   └── models.py
│   └── requirements.txt
├── tests/                        # Tests unitaires + intégration
│   ├── test_api.py
│   ├── test_models.py
│   └── conftest.py
├── Dockerfile                    # Containerisation
├── .github/workflows/            # Pipelines CI/CD
│   ├── test.yml                  # Tests et lint
│   ├── build.yml                 # Build image
│   └── deploy.yml                # Déploiement
├── docker-compose.yml            # Environnements locaux
├── .dockerignore
├── .gitignore
└── README.md
```

⚠️ **Erreur fréquente :** garder les tokens/secrets en dur dans `.env`. Le pipeline doit les récupérer depuis le gestionnaire de secrets du serveur (GitHub Secrets, GitLab Variables). Jamais en dépôt.

### Versioning sémantique et tagging

Votre API doit être versionnable. Vous publiez `1.0.0`, puis vous corrigez une petite bug → `1.0.1`. Vous ajoutez un endpoint → `1.1.0`. Vous changez l'architecture → `2.0.0`.

À chaque tag Git, le pipeline doit :

```bash
git tag -a v1.0.0 -m "First stable release"
git push origin v1.0.0
```

→ Pipeline détecte le tag, construit l'image, la tague aussi : `my-api:v1.0.0`

💡 **Astuce :** utilisez un fichier de version unique (`VERSION` ou dans `__init__.py`) pour que le pipeline la lise automatiquement, sans duplication.

```python
# src/__init__.py
__version__ = "1.0.0"
```

```bash
# Dans le workflow YAML
VERSION=$(cat src/__init__.py | grep __version__ | cut -d'"' -f2)
docker build -t my-api:$VERSION .
```

---

## Étape 2 : Tests automatisés dans le pipeline (CI)

Un pipeline CI sans tests, c'est comme laisser quelqu'un commiter du code sans le compiler.

### Tests unitaires et d'intégration

Votre test suite doit couvrir :

- **Unitaires** : logique métier, validations, calculs
- **Intégration API** : endpoints, codes HTTP, payloads (pas de vraie DB, utiliser des mocks)
- **Contrats** : vérifier que l'API répond bien au schéma OpenAPI annoncé

Structure minimale :

```python
# tests/test_api.py
import pytest
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_get_users_200():
    """GET /users retourne 200 avec une liste vide au démarrage"""
    response = client.get("/users")
    assert response.status_code == 200
    assert response.json() == []

def test_create_user_201():
    """POST /users retourne 201 avec l'utilisateur créé"""
    payload = {"name": "Alice", "email": "alice@example.com"}
    response = client.post("/users", json=payload)
    assert response.status_code == 201
    assert response.json()["id"] is not None

def test_create_user_invalid_email_400():
    """POST /users avec email invalide retourne 400"""
    payload = {"name": "Bob", "email": "invalid"}
    response = client.post("/users", json=payload)
    assert response.status_code == 400
    assert "email" in response.json()["detail"]

@pytest.mark.asyncio
async def test_auth_missing_token_401():
    """GET /me sans token retourne 401"""
    response = client.get("/me")
    assert response.status_code == 401
```

### Workflow GitHub Actions pour la CI

Créez `.github/workflows/test.yml` :

```yaml
name: Test & Lint

on:
  push:
    branches:
      - main
      - develop
  pull_request:
    branches:
      - main

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ["3.10", "3.11"]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Python ${{ matrix.python-version }}
        uses: actions/setup-python@v4
        with:
          python-version: ${{ matrix.python-version }}
      
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install pytest pytest-cov pytest-asyncio
      
      - name: Run linter (flake8)
        run: |
          pip install flake8
          flake8 src/ --count --select=E9,F63,F7,F82 --show-source --statistics
      
      - name: Run tests with coverage
        run: |
          pytest tests/ \
            --cov=src \
            --cov-report=xml \
            --cov-report=term-missing \
            -v
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage.xml
          fail_ci_if_error: true
  
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Run Bandit (security check)
        run: |
          pip install bandit
          bandit -r src/ -f json -o bandit-report.json || true
      
      - name: Check for hardcoded secrets
        uses: truffleHog-Security/trufflehog@main
        with:
          path: ./
          base: ${{ github.event.repository.default_branch }}
```

🧠 **Concept clé :** la matrice `strategy.matrix.python-version` teste votre code sur plusieurs versions de Python. Si votre API casse sur Python 3.11 mais pas 3.10, vous le savez tout de suite.

⚠️ **Erreur fréquente :** oublier les tests d'intégration et ne tester que la logique métier. Résultat : les tests passent, mais l'API crashe au déploiement. Testez toujours l'endpoint complet, avec le serveur HTTP.

---

## Étape 3 : Build et stockage de l'image (Build)

Une fois les tests passés, buildez une image Docker.

### Dockerfile optimisé

```dockerfile
# Multistage pour réduire la taille finale
FROM python:3.11-slim as builder

WORKDIR /app

# Installer les dépendances dans un virtualenv
COPY requirements.txt .
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir -r requirements.txt

# Étape finale : copier uniquement le nécessaire
FROM python:3.11-slim

WORKDIR /app

# Copier le virtualenv depuis le builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copier le code
COPY src/ src/
COPY VERSION .

# Non-root user pour la sécurité
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')"

EXPOSE 8000

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

💡 **Astuce :** la taille compte. Multistage + slim Python = image ~200MB au lieu de 500MB+. À chaque déploiement x100, ça s'accumule.

### Workflow pour la build et push

Créez `.github/workflows/build.yml` :

```yaml
name: Build & Push Image

on:
  push:
    branches:
      - main
    tags:
      - "v*"

jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      image-tag: ${{ steps.meta.outputs.tags }}
      image-digest: ${{ steps.build.outputs.digest }}
    
    permissions:
      contents: read
      packages: write
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      
      - name: Extract version from VERSION file
        id: version
        run: echo "VERSION=$(cat VERSION)" >> $GITHUB_OUTPUT
      
      - name: Generate Docker metadata
        id: meta
        uses: docker/metadata-action@v4
        with:
          images: ${{ secrets.DOCKER_USERNAME }}/my-api
          tags: |
            type=ref,event=branch
            type=semver,pattern={{version}},value=${{ steps.version.outputs.VERSION }}
            type=semver,pattern={{major}}.{{minor}},value=${{ steps.version.outputs.VERSION }}
            type=sha
      
      - name: Build and push image
        id: build
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=registry,ref=${{ secrets.DOCKER_USERNAME }}/my-api:buildcache
          cache-to: type=registry,ref=${{ secrets.DOCKER_USERNAME }}/my-api:buildcache,mode=max
      
      - name: Image digest
        run: echo "Image pushed: ${{ steps.build.outputs.digest }}"
```

📝 **Décryptage :**
- `type=semver` : si vous taguez `v1.0.0`, l'image devient aussi `my-api:1.0.0`
- `type=sha` : chaque image a aussi un tag par commit pour la traçabilité
- `cache-from/cache-to` : Docker réutilise les layers précédentes, ça accélère à ~2min au lieu de 10min

---

## Étape 4 : Déploiement sur environnements

Maintenant que vous avez une image testée, déployez-la progressivement : d'abord staging pour des tests, puis canary en prod, puis full rollout.

### Déploiement sur Kubernetes (standard en prod)

Créez `.github/workflows/deploy.yml` :

```yaml
name: Deploy to Staging & Production

on:
  push:
    branches:
      - main
    tags:
      - "v*"
  workflow_dispatch:
    inputs:
      environment:
        description: "Target environment"
        required: true
        default: "staging"
        type: choice
        options:
          - staging
          - production

env:
  REGISTRY: docker.io
  IMAGE_NAME: ${{ secrets.DOCKER_USERNAME }}/my-api

jobs:
  deploy-staging:
    if: github.ref == 'refs/heads/main' || github.event_name == 'workflow_dispatch'
    runs-on: ubuntu-latest
    environment:
      name: staging
      url: https://api-staging.example.com
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Extract version
        id: version
        run: echo "VERSION=$(cat VERSION)" >> $GITHUB_OUTPUT
      
      - name: Configure kubectl
        run: |
          mkdir -p $HOME/.kube
          echo "${{ secrets.KUBE_CONFIG_STAGING }}" | base64 -d > $HOME/.kube/config
          chmod 600 $HOME/.kube/config
      
      - name: Update deployment image in staging
        run: |
          kubectl set image deployment/my-api \
            my-api=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ steps.version.outputs.VERSION }} \
            -n api-staging
          kubectl rollout status deployment/my-api -n api-staging --timeout=5m
      
      - name: Run smoke tests
        run: |
          pip install requests
          python -c "
          import requests
          import time
          time.sleep(10)  # Attendre que le pod soit prêt
          url = 'https://api-staging.example.com/health'
          resp = requests.get(url, timeout=5)
          assert resp.status_code == 200, f'Health check failed: {resp.status_code}'
          print('✓ Staging health check passed')
          "
      
      - name: Notify deployment
        run: |
          echo "✅ Staging deployment successful for version ${{ steps.version.outputs.VERSION }}"

  deploy-production-canary:
    if: startsWith(github.ref, 'refs/tags/v')
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://api.example.com
    needs: [deploy-staging]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Extract version
        id: version
        run: echo "VERSION=$(cat VERSION)" >> $GITHUB_OUTPUT
      
      - name: Configure kubectl for prod
        run: |
          mkdir -p $HOME/.kube
          echo "${{ secrets.KUBE_CONFIG_PROD }}" | base64 -d > $HOME/.kube/config
          chmod 600 $HOME/.kube/config
      
      - name: Deploy canary (10% traffic)
        run: |
          cat <<EOF | kubectl apply -f -
          apiVersion: flagger.app/v1beta1
          kind: Canary
          metadata:
            name: my-api
            namespace: api-prod
          spec:
            targetRef:
              apiVersion: apps/v1
              kind: Deployment
              name: my-api
            progressDeadlineSeconds: 300
            service:
              port: 8000
            analysis:
              interval: 1m
              threshold: 5
              maxWeight: 50
              stepWeight: 10
              metrics:
              - name: request-success-rate
                thresholdRange:
                  min: 99
              webhooks:
              - name: smoke-tests
                url: http://flagger-loadtester.test/
                timeout: 30s
                metadata:
                  type: smoke
                  cmd: "curl -sd 'test' http://my-api:8000/health | grep ok"
          EOF
      
      - name: Monitor canary for 10 minutes
        run: |
          kubectl rollout status canary/my-api -n api-prod --timeout=10m || exit 1
          echo "✓ Canary stable, promoting to 100%"
      
      - name: Promote to full production
        run: |
          kubectl patch canary my-api -n api-prod -p '{"spec":{"skipAnalysis":true}}' --type merge
          kubectl set image deployment/my-api \
            my-api=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ steps.version.outputs.VERSION }} \
            -n api-prod
          kubectl rollout status deployment/my-api -n api-prod --timeout=5m
```

🧠 **Concept clé :** le déploiement canary (Flagger) envoie 10% du trafic à la nouvelle version. Si les erreurs restent <1% pendant 10 min, promouvoir à 100%. Sinon, rollback automatique. Ça vous évite les blackouts.

### Manifests Kubernetes

Créez `k8s/deployment.yaml` :

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-api
  namespace: api-prod
  labels:
    app: my-api
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: my-api
  template:
    metadata:
      labels:
        app: my-api
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8000"
        prometheus.io/path: "/metrics"
    spec:
      serviceAccountName: my-api
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 1000
      
      containers:
      - name: my-api
        image: docker.io/username/my-api:latest
        imagePullPolicy: IfNotPresent
        
        ports:
        - name: http
          containerPort: 8000
          protocol: TCP
        
        env:
        - name: LOG_LEVEL
          value: "info"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: api-secrets
              key: database-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: api-secrets
              key: jwt-secret
        
        livenessProbe:
          httpGet:
            path: /health
            port: http
          initialDelaySeconds: 10
          periodSeconds: 30
          timeoutSeconds: 3
          failureThreshold: 3
        
        readinessProbe:
          httpGet:
            path: /ready
            port: http
          initialDelaySeconds: 5
          periodSeconds: 10
          timeoutSeconds: 2
          failureThreshold: 2
        
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 500m
            memory: 512Mi
        
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop:
              - ALL

---
apiVersion: v1
kind: Service
metadata:
  name: my-api
  namespace: api-prod
spec:
  type: ClusterIP
  ports:
  - port: 80
    targetPort: http
    protocol: TCP
    name: http
  selector:
    app: my-api

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: my-api
  namespace: api-prod
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: my-api
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 15
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
      - type: Pods
        value: 2
        periodSeconds: 15
      selectPolicy: Max
```

⚠️ **Erreur fréquente :** sous-provisionner les ressources. Si vous demandez 100m CPU mais votre API en consomme 300m, Kubernetes la tuera régulièrement (OOMKill). Testez en load pour connaître les vrais besoins.

---

## Construction progressive : de v1 minimal à v3 production-grade

### v1 : Pipeline basique (tests + docker build)

Déployez localement avec compose :

```yaml
# docker-compose.yml
version: "3.9"

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: "sqlite:///./test.db"
      JWT_SECRET: "dev-secret-key-change-in-prod"
    volumes:
      - ./src:/app/src
    command: uvicorn src.main:app --reload --host 0.0.0.0

  test:
    build:
      context: .
      dockerfile: Dockerfile
    entrypoint: pytest
    command: tests/ --cov=src -v
    depends_on:
      - api
```

Le workflow minimal (.github/workflows/test.yml) :
- Python + pip install
- pytest
- docker build (local)

✓ Vous testez chaque commit, vous savez si ça casse avant même de merger.

### v2 : Push image + déploiement staging

Ajoutez :
- Docker Hub login
- Kaniko ou docker build-push pour construire + pousser l'image
- Déploiement auto sur staging K8s

⚠️ **Challenge :** gérer les secrets (Docker login, KUBE_CONFIG). Utilisez GitHub Secrets, pas .env en dépôt.

💡 **Astuce :** créez des environnements GitHub (`github.environment`) pour chaque étape. Chaque env a sa propre liste de secrets, ça cloisonne staging et prod.

```yaml
environments:
  staging:
    secrets:
      - KUBE_CONFIG_STAGING
      - DOCKER_USERNAME
  production:
    secrets:
      - KUBE_CONFIG_PROD
      - SLACK_WEBHOOK
```

### v3 : Canary deployment + observabilité

Ajoutez :
- Flagger ou Istio pour le canary (10% → 50% → 100%)
- Prometheus + Grafana pour surveiller
- Sentry pour les erreurs
- Slack/PagerDuty pour les alertes

À ce stade :
- Chaque déploiement est traçable (version, commit, timestamp)
- Rollback automatique si les métriques dégradent
- On-call averti 2 secondes après une erreur

---

## Bonnes pratiques

**1. Tests d'intégration API, pas juste unitaires**

Tester que `POST /users` retourne 201 avec le champ `id`. Ne pas juste tester la fonction `create_user()` isolée.

```python
def test_create_user_e2e():
    response = client.post("/users", json={...})
    assert response.status_code == 201
    assert "id" in response.json()
    assert response.headers["X-Request-ID"]  # Traçabilité
```

**2. Chaque version doit être taggée et tracée**

```bash
git tag -a v1.0.1 -m "Fix user endpoint bug #123"
git push origin v1.0.1
```

L'image Docker, les déploiements, les logs → tous liés à ce tag.

**3. Secrets hors du code, dans le gestionnaire de secrets**

```yaml
# ❌ Mauvais
env:
  DATABASE_URL: "postgres://user:password@localhost"

# ✅ Bon
env:
  DATABASE_URL:
    valueFrom:
      secretKeyRef:
        name: api-secrets
        key: database-url
```

Créez les secrets une fois, à la main (ou avec Terraform) :

```bash
kubectl create secret generic api-secrets \
  --from-literal=database-url="postgres://..." \
  --from-literal=jwt-secret="..." \
  -n api-prod
```

**4. Health checks et readiness probes**

Votre API doit exposer `GET /health` qui répond 200 si elle est vivante.

```python
@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/ready")
async def ready():
    # Vérifier la DB aussi
    try:
        await db.execute("SELECT 1")
        return {"status": "ready"}
    except Exception:
        return {"status": "unhealthy"}, 503
```

Kubernetes les utilise pour décider si envoyer du trafic ou relancer le pod.

**5. Logs structurés et tracés**

```python
import logging
import uuid

logging.basicConfig(format="%(timestamp)s %(level)s %(message)s")
logger = logging.getLogger(__name__)

@app.post("/users")
def create_user(user: UserSchema):
    request_id = str(uuid.uuid4())
    logger.info(f"Creating user", extra={"request_id": request_id, "email": user.email})
    try:
        # ...
        logger.info(f"User created", extra={"request_id": request_id, "user_id": user.id})
    except Exception as e:
        logger.error(f"User creation failed", extra={"request_id": request_id, "error": str(e)})
        raise
```

Chaque requête a un `request_id`, facile à tracer dans les logs distribués.

**6. Monitoring des déploiements**

```yaml
# Prometheus metrics
- name: deployment_latency_seconds
  help: "Time to deploy a version"
  value: 300  # 5 minutes

- name: deployment_success_total
  help: "Total successful deployments"
  labels:
    version: "v1.0.0"
  value: 42

- name: deployment_rollback_total
  help: "Total rollbacks"
  value: 2
```

Suivre : temps de déploiement, taux d'erreur post-déploiement, rollbacks. Ça aide à identifier les pattern (ex: "toujours des problèmes le lundi").

**7. Documentation du pipeline pour l'équipe**

```markdown
# Déploiement

## Merger une PR
- Tests auto (ci/test.yml) vérifient la PR
- Si ✓, la PR est mergeable
- Merge → build auto
