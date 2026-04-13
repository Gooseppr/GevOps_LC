---
layout: page
title: "CI/CD & déploiement API"

course: api-rest
chapter_title: "CI/CD & déploiement API"

chapter: 9
section: 1

tags: ci/cd, déploiement, github actions, docker, api, devops, pipeline, tests, production
difficulty: advanced
duration: 120
mermaid: true

icon: "🚀"
domain: devops
domain_icon: "⚙️"
status: "published"
---

# CI/CD & déploiement API

## Objectifs pédagogiques

À l'issue de ce module, vous serez capable de :

1. **Concevoir** un pipeline CI/CD complet pour une API REST, de la validation du code jusqu'au déploiement en production
2. **Configurer** des étapes de test automatisées (lint, tests unitaires, tests d'intégration) dans GitHub Actions
3. **Construire et publier** une image Docker d'API avec un pipeline reproductible
4. **Mettre en place** une stratégie de déploiement progressive (blue/green, rolling update) pour zéro downtime
5. **Diagnostiquer** les pannes courantes dans un pipeline CI/CD et savoir où chercher en premier

---

## Mise en situation

L'équipe backend d'une startup SaaS livre son API de facturation en FTP. Sérieusement. Chaque développeur zippe son dossier, le dépose sur un serveur, et un script Bash redémarre le process. Ça fonctionne... jusqu'au jour où deux personnes déploient en même temps. L'API retourne des 500 pendant 12 minutes. Le lundi matin, le CTO décide que ça suffit.

Ce scénario n'est pas exceptionnel. Beaucoup d'équipes atteignent un seuil où le déploiement manuel devient le goulot d'étranglement et le premier vecteur de panne. Dès que l'API est consommée par des clients externes — ou même par d'autres équipes internes — le coût d'une régression non détectée avant la prod explose.

Un pipeline CI/CD répond à exactement ce problème : rendre chaque déploiement **déterministe, traçable et réversible**. Pas pour "faire du DevOps" — pour que la livraison d'une nouvelle version soit aussi ennuyeuse que possible. L'ennui, en production, c'est un objectif.

---

## Contexte et problématique

### Pourquoi une API a des contraintes de déploiement spécifiques

Une API en production, c'est différent d'une application web classique à plusieurs égards :

- **Le contrat est public** — changer un endpoint sans avertissement casse les clients. Le déploiement doit être coordonné avec la gestion des versions (voir module Versionning).
- **Elle est souvent sans état côté serveur mais stateful côté client** — les tokens, sessions, données en cache ne doivent pas être invalidés brutalement lors d'un redémarrage.
- **Elle peut recevoir des requêtes à n'importe quel moment** — contrairement à une app qu'on ferme le soir, une API peut être sollicitée à 3h du matin par un partenaire en Asie.

Ces contraintes font que "couper le serveur et relancer" est rarement acceptable. C'est là que la CI/CD devient non pas un luxe, mais une nécessité opérationnelle.

### Ce que la CI/CD résout concrètement

| Problème sans CI/CD | Solution apportée |
|---|---|
| Régression découverte en production | Tests automatisés qui bloquent le merge si ça casse |
| Déploiements inconsistants selon l'environnement | Image Docker identique du laptop à la prod |
| Impossible de savoir qui a déployé quoi | Traçabilité Git : chaque déploiement = un commit SHA |
| Rollback manuel laborieux | Tag Docker ou release GitHub = rollback en une commande |
| Downtime lors du redémarrage | Stratégies blue/green ou rolling update |

---

## Architecture du pipeline

Un pipeline CI/CD pour une API se décompose en deux phases distinctes qu'il faut bien séparer mentalement.

**CI (Intégration Continue)** : tout ce qui valide le code — lint, tests, build de l'image. Se déclenche sur chaque pull request. Son seul objectif : dire "ce code est safe à merger" ou "non".

**CD (Déploiement Continu)** : tout ce qui envoie le code validé vers un environnement. Se déclenche sur la branche principale après merge. Son objectif : déployer de façon fiable et répétable.

```mermaid
flowchart LR
    A[👨‍💻 Pull Request] --> B[CI — Validation]
    
    subgraph CI ["🔍 Intégration Continue"]
        B --> C[Lint & format]
        C --> D[Tests unitaires]
        D --> E[Tests intégration]
        E --> F[Build image Docker]
        F --> G[Scan sécurité]
    end
    
    G -->|✅ Merge autorisé| H[Merge → main]
    
    subgraph CD ["🚀 Déploiement Continu"]
        H --> I[Push image → Registry]
        I --> J[Deploy staging]
        J --> K{Tests E2E OK ?}
        K -->|✅| L[Deploy production]
        K -->|❌| M[🔴 Alert + rollback]
    end
    
    L --> N[Health check]
    N -->|❌| M
```

### Les composants en jeu

| Composant | Rôle | Exemple concret |
|---|---|---|
| **CI Runner** | Exécute les étapes du pipeline dans un environnement isolé | GitHub Actions, GitLab CI |
| **Registry Docker** | Stocke et versionne les images construites | Docker Hub, GitHub Container Registry, AWS ECR |
| **Orchestrateur** | Gère le déploiement et le scaling des conteneurs | Kubernetes, ECS, Render, Railway |
| **Secrets Manager** | Fournit les variables sensibles (clés API, mots de passe DB) sans les exposer dans le code | GitHub Secrets, Vault, AWS Secrets Manager |
| **Health check endpoint** | Permet au pipeline de vérifier que l'API répond après déploiement | `/health` ou `/readyz` sur l'API |

---

## Construction progressive du pipeline

### V1 — Le pipeline minimal qui apporte déjà de la valeur

Avant de vouloir tout automatiser, commençons par l'essentiel : s'assurer que le code qui arrive sur `main` ne casse rien.

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: testuser
          POSTGRES_PASSWORD: testpass
          POSTGRES_DB: testdb
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"
          cache: "pip"

      - name: Install dependencies
        run: pip install -r requirements.txt

      - name: Lint (ruff)
        run: ruff check .

      - name: Tests
        env:
          DATABASE_URL: postgresql://testuser:testpass@localhost:5432/testdb
          SECRET_KEY: test-secret-key-not-used-in-prod
        run: pytest tests/ -v --tb=short
```

💡 **Astuce** — Le bloc `services` dans GitHub Actions lance un conteneur annexe pendant toute la durée du job. C'est le moyen le plus propre de tester avec une vraie base de données sans mocker les appels SQL.

⚠️ **Erreur fréquente** — Mettre les variables d'environnement de test (clés, URLs de DB) directement dans le YAML sans les marquer comme secrets. Pour les tests, des valeurs fictives sont correctes. Pour staging/prod, elles doivent être dans `Settings > Secrets` du repo.

### V2 — Ajout du build Docker et publication dans le registry

Une fois les tests validés, on veut produire une image Docker reproductible. L'image devient l'artefact de déploiement — pas le code source.

```dockerfile
# Dockerfile
FROM python:3.12-slim AS base

WORKDIR /app

# Copier uniquement le fichier de dépendances d'abord
# → exploite le cache Docker : si requirements.txt n'a pas changé, 
#   cette couche est réutilisée même si le code change
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Utilisateur non-root — bonne pratique sécurité
RUN adduser --disabled-password --gecos "" appuser
USER appuser

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```yaml
# Ajout dans ci.yml — job build, déclenché après tests réussis
  build-and-push:
    runs-on: ubuntu-latest
    needs: test  # Ne démarre que si le job "test" a réussi
    if: github.ref == 'refs/heads/main'  # Seulement sur main, pas sur les PR
    
    permissions:
      contents: read
      packages: write  # Nécessaire pour pousser sur GitHub Container Registry

    steps:
      - uses: actions/checkout@v4

      - name: Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata (tags)
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/${{ github.repository }}/api
          tags: |
            type=sha,prefix=,suffix=,format=short
            type=raw,value=latest,enable=true

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

🧠 **Concept clé** — Tagger l'image avec le SHA du commit (`abc1234`) plutôt que seulement `latest` est fondamental pour la traçabilité. Si quelque chose casse en production, vous pouvez identifier exactement quel commit a produit l'image déployée. `latest` seul ne dit rien sur ce qui tourne.

### V3 — Pipeline complet avec déploiement staging → production

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  workflow_run:
    workflows: [CI]
    types: [completed]
    branches: [main]

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    environment: staging
    
    steps:
      - name: Deploy to staging
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.DEPLOY_TOKEN }}" \
            -H "Content-Type: application/json" \
            -d '{"image": "ghcr.io/${{ github.repository }}/api:${{ github.sha }}"}' \
            ${{ secrets.STAGING_DEPLOY_URL }}

      - name: Wait for deployment
        run: sleep 30

      - name: Health check staging
        run: |
          STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
            ${{ secrets.STAGING_API_URL }}/health)
          if [ "$STATUS" != "200" ]; then
            echo "Health check failed with status $STATUS"
            exit 1
          fi

  smoke-tests-staging:
    runs-on: ubuntu-latest
    needs: deploy-staging
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Run smoke tests against staging
        env:
          API_BASE_URL: ${{ secrets.STAGING_API_URL }}
          API_KEY: ${{ secrets.STAGING_API_KEY }}
        run: pytest tests/smoke/ -v --tb=short

  deploy-production:
    runs-on: ubuntu-latest
    needs: smoke-tests-staging
    environment: production  # Déclenche une approbation manuelle si configurée dans GitHub
    
    steps:
      - name: Deploy to production
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.DEPLOY_TOKEN }}" \
            -H "Content-Type: application/json" \
            -d '{"image": "ghcr.io/${{ github.repository }}/api:${{ github.sha }}"}' \
            ${{ secrets.PROD_DEPLOY_URL }}

      - name: Health check production
        retries: 3
        run: |
          for i in 1 2 3; do
            STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
              ${{ secrets.PROD_API_URL }}/health)
            [ "$STATUS" = "200" ] && exit 0
            sleep 15
          done
          exit 1
```

💡 **Astuce** — Dans GitHub, les `environments` permettent de configurer des approbateurs obligatoires avant le déploiement en production. Le pipeline se met en pause et attend qu'un humain clique "Approve". C'est le meilleur compromis entre automatisation et contrôle humain.

---

## L'endpoint `/health` — la pièce souvent oubliée

Un pipeline de déploiement ne peut pas savoir si votre API a vraiment démarré sans un endpoint dédié. Et cet endpoint doit faire un vrai travail, pas juste retourner 200.

```python
# FastAPI — exemple de health check complet
from fastapi import APIRouter, status
from sqlalchemy import text
from app.database import get_db
import redis

router = APIRouter()

@router.get("/health", status_code=status.HTTP_200_OK)
async def health_check(db=Depends(get_db)):
    checks = {}
    overall_healthy = True

    # Vérification base de données
    try:
        await db.execute(text("SELECT 1"))
        checks["database"] = "ok"
    except Exception as e:
        checks["database"] = f"error: {str(e)}"
        overall_healthy = False

    # Vérification Redis (si utilisé pour le cache/sessions)
    try:
        r = redis.from_url(settings.REDIS_URL)
        r.ping()
        checks["cache"] = "ok"
    except Exception as e:
        checks["cache"] = f"error: {str(e)}"
        # Redis down n'est pas forcément fatal — à vous de décider
        # overall_healthy = False

    if not overall_healthy:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=checks
        )

    return {"status": "healthy", "checks": checks}
```

🧠 **Concept clé** — Un `/health` qui retourne toujours 200 est pire qu'inutile : il donne l'impression que tout va bien alors que la base de données est injoignable. Le pipeline va considérer le déploiement réussi alors que l'API ne peut rien faire d'utile.

Distinction importante entre deux types de health checks :
- **`/healthz` ou `/readyz`** (readiness) : "Suis-je prêt à recevoir du trafic ?" — vérifie les dépendances. C'est celui que le load balancer interroge.
- **`/livez`** (liveness) : "Est-ce que le process tourne ?" — juste un 200. Utilisé par Kubernetes pour décider de redémarrer le pod.

---

## Stratégies de déploiement sans downtime

### Rolling update — le défaut raisonnable

Kubernetes et la plupart des PaaS font ça par défaut : démarrer des instances avec la nouvelle version progressivement, couper les anciennes une fois les nouvelles prêtes.

```yaml
# kubernetes/deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1        # Combien d'instances en plus pendant la transition
      maxUnavailable: 0  # Aucune instance ne peut être coupée avant qu'une nouvelle soit prête
  template:
    spec:
      containers:
      - name: api
        image: ghcr.io/myorg/api:abc1234
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 5
          failureThreshold: 3
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

⚠️ **Erreur fréquente** — Ne pas configurer `readinessProbe`. Sans ça, Kubernetes envoie du trafic vers le nouveau pod dès qu'il démarre, avant même que l'application soit initialisée. Résultat : des 502 pendant quelques secondes à chaque déploiement.

### Blue/Green — quand la cohérence totale est requise

L'idée : maintenir deux environnements identiques ("blue" = actuel, "green" = nouvelle version). On bascule le trafic d'un coup via le load balancer une fois que "green" est validé.

```mermaid
flowchart TB
    LB[Load Balancer] -->|100% trafic| BLUE[🔵 Blue v1.2\n3 instances]
    GREEN[🟢 Green v1.3\n3 instances] -.->|en attente| LB
    
    subgraph Après validation
        LB2[Load Balancer] -->|100% trafic| GREEN2[🟢 Green v1.3\n3 instances]
        BLUE2[🔵 Blue v1.2\nstandby rollback] -.->|rollback possible| LB2
    end
```

L'avantage décisif : si quelque chose cloche sur "green", le rollback est une modification DNS ou de config load balancer — quelques secondes, pas une re-livraison complète.

Le coût : vous payez pour deux environnements en même temps pendant la transition. Acceptable pour une API critique, moins justifié pour un service interne peu sollicité.

---

## Gestion des secrets dans le pipeline

C'est là que beaucoup d'équipes font des erreurs difficiles à rattraper. Les secrets (clés API, mots de passe de base de données, tokens) ne doivent **jamais** apparaître dans le code, ni dans les logs du pipeline.

```yaml
# ✅ Correct — utilisation des secrets GitHub
- name: Deploy
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
    JWT_SECRET: ${{ secrets.JWT_SECRET }}
  run: ./scripts/deploy.sh
```

```bash
# ❌ Ce qui arrive dans les logs si vous faites ça
- name: Debug
  run: echo "Database URL is $DATABASE_URL"
# → GitHub masque automatiquement les secrets connus, mais c'est une mauvaise habitude
#   et ça ne fonctionne pas avec tous les systèmes CI
```

Pour les environnements Kubernetes, la bonne pratique est d'injecter les secrets via des `Secret` objects Kubernetes ou un outil comme HashiCorp Vault, pas de les passer en variables d'environnement dans le YAML de déploiement.

```yaml
# kubernetes/secret.yml — créé manuellement ou via Vault, jamais commité dans Git
apiVersion: v1
kind: Secret
metadata:
  name: api-secrets
type: Opaque
stringData:
  DATABASE_URL: "postgresql://user:pass@host:5432/db"
  JWT_SECRET: "votre-secret-fort"
```

```yaml
# Référencé dans le deployment
env:
- name: DATABASE_URL
  valueFrom:
    secretKeyRef:
      name: api-secrets
      key: DATABASE_URL
```

---

## Diagnostic — Erreurs fréquentes dans les pipelines

### Le pipeline passe mais le déploiement échoue silencieusement

**Symptôme** : CI vert, déploiement déclenché, mais l'API retourne des erreurs en production.

**Cause probable** : le health check n'est pas configuré ou retourne toujours 200 même quand la base de données est injoignable. Le pipeline croit que tout va bien.

**Correction** : implémenter un vrai health check (voir section dédiée), configurer `readinessProbe` dans Kubernetes, et ajouter un health check explicite dans le pipeline après déploiement avec un délai suffisant pour que l'app démarre.

### Les tests passent en CI mais pas en local (ou l'inverse)

**Symptôme** : le développeur dit "ça marche sur ma machine", le pipeline échoue.

**Cause probable** : divergence d'environnement — version de Python différente, dépendances non épinglées, variable d'environnement manquante en CI.

**Correction** :
- Épingler toutes les dépendances (`pip freeze > requirements.txt` ou utiliser `poetry.lock`)
- Utiliser la même image Docker en CI et en local pour les tests
- Vérifier que toutes les variables d'environnement nécessaires sont définies dans le workflow

```yaml
# Toujours spécifier la version exacte de Python, pas "3.x"
- uses: actions/setup-python@v5
  with:
    python-version: "3.12.3"  # version exacte, pas "3.12"
```

### Le pipeline est lent (> 10 minutes pour une petite API)

**Symptôme** : chaque PR attend 15 minutes pour voir les résultats. Les développeurs désactivent les protections pour aller plus vite.

**Cause probable** : pas de cache sur les dépendances, image Docker reconstruite entièrement à chaque run, tests exécutés séquentiellement alors qu'ils pourraient être parallélisés.

**Correction** :

```yaml
# Cache des dépendances Python
- uses: actions/setup-python@v5
  with:
    python-version: "3.12"
    cache: "pip"  # Cache automatique basé sur requirements.txt

# Cache Docker layers
- uses: docker/build-push-action@v5
  with:
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

### Secrets exposés dans les logs

**Symptôme** : en cherchant un bug dans les logs CI, vous voyez une clé API en clair.

**Cause** : une commande `echo`, `env`, `printenv` ou un message d'erreur verbose a affiché la variable.

**Correction** : auditer les étapes du pipeline qui affichent des variables. Configurer le masquage dans votre système CI (GitHub le fait automatiquement pour les secrets déclarés, mais pas pour les variables locales). En dernier recours, révoquer immédiatement la clé exposée.

---

## Cas réel en entreprise

Une équipe de 6 développeurs backend gérait une API de gestion de commandes utilisée par 3 clients en B2B. Chaque déploiement impliquait : un Slack au responsable, une fenêtre de maintenance à 22h, un SSH manuel sur le serveur, un `git pull`, un `sudo systemctl restart api`. Environ 45 minutes de travail pour un changement de 10 lignes.

**Ce qu'ils ont mis en place :**

1. Pipeline GitHub Actions avec tests automatisés sur chaque PR — 8 minutes de feedback au lieu d'attendre la revue complète
2. Image Docker avec tag SHA, poussée sur GitHub Container Registry à chaque merge sur `main`
3. Déploiement automatique sur un serveur VPS avec Watchtower (outil qui surveille le registry et redémarre les conteneurs quand une nouvelle image est disponible)
4. Health check `/health` ajouté à l'API, vérifié par le pipeline post-déploiement et par un monitoring externe (UptimeRobot, gratuit)

**Résultats mesurés après 3 mois :**
- Temps de déploiement moyen : de 45 min à 8 min (dont 6 min de pipeline automatique)
- Incidents post-déploiement : de 2/mois à 0 sur la période (régression détectée en CI avant merge)
- Fenêtre de maintenance nocturne : supprimée complètement grâce au rolling restart de Watchtower
- Rollback en cas de problème : `docker pull myapi:sha_precedent && docker restart api` — moins de 2 minutes

---

## Bonnes pratiques

**1. Un artefact, plusieurs environnements.** Ne jamais construire des images Docker différentes pour staging et production. La même image (`ghcr.io/org/api:abc1234`) doit passer de staging à prod. Ce qui change, c'est la configuration injectée (variables d'environnement, secrets). Sinon, vous ne testez pas ce que vous déployez.

**2. Trunk-based development de préférence.** Des feature branches qui vivent plusieurs semaines produisent des conflits douloureux et rendent le CI moins utile. Des PR courtes (1-2 jours max) avec des feature flags pour cacher les fonctionnalités incomplètes, c'est plus fluide pour la CI/CD.

**3. Épinglez vos versions partout.** `actions/checkout@v4` et non `@latest`. `python:3.12.3-slim` et non `python:latest`. Un pipeline qui casse à cause d'une mise à jour d'une action tierce est une mauvaise surprise.

**4. Testez la procédure de rollback.** Beaucoup d'équipes ont une procédure de rollback théorique mais ne l'ont jamais testée. Simulez un incident en staging : déployez une version qui fait échouer le health check, vérifiez que le pipeline alerte et que vous savez exactement comment revenir en arrière en moins de 5 minutes.

**5. Séparez les migrations de base de données du déploiement.** Lancer `alembic upgrade head` dans le conteneur API au démarrage est tentant mais dangereux : si deux instances démarrent simultanément, les deux vont essayer de migrer. Faites une étape dédiée dans le pipeline, avant le déploiement de la nouvelle image.

**6. Ajoutez des notifications utiles, pas du bruit.** Une notification Slack pour chaque commit en CI, c'est du bruit. Une notification uniquement en cas d'échec, ou en cas de déploiement réussi en production, c'est utile. Configurez les notifications pour l'action, pas pour chaque événement.

**7. Gardez les logs de pipeline accessibles.** Un pipeline qui échoue doit donner immédiatement l'information nécessaire pour comprendre pourquoi. Configurez la verbosité des tests (`pytest -v --tb=short`) et archivez les artefacts de test (rapports JUnit, coverage) pour pouvoir les consulter après coup.

---

## Résumé

Un pipeline CI/CD pour une API, c'est avant tout un investissement en confiance : confiance que le code qui arrive en production a été validé, que l'image déployée est identique à celle testée, et que vous pouvez revenir en arrière en quelques minutes si quelque chose tourne mal.

La progression logique : commencer par les tests automatisés sur les PR (valeur immédiate, faible complexité), ajouter le build Docker avec tagging par SHA (traçabilité), puis le déploiement automatique vers staging avec smoke tests, et enfin production avec approbation manuelle optionnelle. Chaque étape apporte de la valeur indépendamment.

Les pièges les plus coûteux sont les secrets exposés dans les logs, l'absence de readiness probe qui laisse Kubernetes envoyer du trafic vers des pods non prêts, et les migrations de base de données lancées dans le conteneur principal. Les éviter demande peu d'effort et épargne beaucoup de stress.

La suite naturelle : observer ce qui se passe après déploiement — métriques, logs centralisés, alerting. Le pipeline vous amène en production sereinement ; le monitoring vous dit ce qui s'y passe.

---

<!-- snippet
id: cicd_github_actions_minimal
type: concept
tech: github-actions
level: intermediate
importance: high
format: knowledge
tags: ci/cd, github-actions, pipeline, tests, automatisation
title: Structure d'un workflow GitHub Actions pour API
content: Un workflow GitHub Actions se décompose en jobs (ex: test, build, deploy), chaque job tourne dans un runner isolé. `needs: test` crée une dépendance : le job build ne démarre que si test réussit. `if: github.ref == 'refs/heads/main'` restreint un job à la branche principale. Le fichier YAML vit dans `.github/workflows/`.
description: Les jobs sont indépendants par défaut. `needs:` crée l'ordre d'exécution. Sans `if:`, le job tourne sur toutes les branches, y compris les PR.
-->

<!-- snippet
id: cicd_docker_tag_sha
type: tip
tech: docker
level: intermediate
importance: high
format: knowledge
tags: docker, registry, tagging, traçabilité, déploiement
title: Toujours tagger les images Docker avec le SHA du commit
content: Tagger uniquement avec `latest` rend impossible de savoir quelle version tourne en production. Ajouter le SHA court du commit (`abc1234`) permet d'identifier précisément l'image : `ghcr.io/org/api:abc1234`. En cas d'incident, `docker inspect <container>` → image tag → `git log abc1234` donne le contexte exact du changement.
description: `latest` ne dit rien sur ce qui tourne. SHA du commit = lien direct entre l'image déployée et le code source.
-->

<!-- snippet
id: cicd_health_check_api
type: concept
tech: api-rest
level: intermediate
importance: high
format: knowledge
tags: health-check, kubernetes, readiness, api, disponibilité
title