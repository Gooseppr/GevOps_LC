---
layout: page
title: Déploiement continu
sujet: Déploiement Continu (CD)
type: module
jour: 20
ordre: 1
tags: cd, test, devops
---

# 🚀 Déploiement Continu (CD) — Cours approfondi (GitLab & Vercel)

> **Objectif** : Comprendre **en profondeur** le Déploiement Continu, savoir **concevoir** et **opérer** un pipeline CD fiable avec **GitLab** et **Vercel**, maîtriser les **stratégies de mise en production**, les **mécanismes de rollback**, la **gestion d’environnements/variables**, et les **gates** (contrôles) post‑déploiement.

---

## 🧭 Qu’est‑ce que le CD (sans re‑faire la CI) ?

- **CD = Continuous Delivery/Deployment** : automatiser la **promotion** d’un artefact **déjà testé** vers des **environnements cibles** (staging, prod), avec des **garde‑fous** (approvals, gates, smoke tests) et la capacité de **roll‑back** immédiat.
- Le CD **n’exécute pas les tests unitaires/intégration** (ça, c’est la **CI**) ; il **orchestré** : **build → version → publier artefact → déployer → vérifier → exposer trafic → monitorer → rollback**.

**Mantra CD** : *Déploiement = procédure standardisée, idempotente, traçable, réversible.*

---

## 🧩 Concepts & composants CD (à connaître absolument)

| Concept | Pourquoi c’est clé en CD | Comment |
|---|---|---|
| **Artefact immuable** | On déploie **une version figée** (image Docker, tar `dist/`, release) | Tag immuable (`app:1.4.3`), registry |
| **Promotion** | On **re‑déploie le même artefact** de dev → staging → prod | Pas de rebuild entre envs |
| **Stratégie de déploiement** | Réduire le risque lors de la mise en prod | **Rolling**, **Blue/Green**, **Canary** |
| **Environnements** | Staging ≈ Prod, Prod protégée | Variables, secrets, accès restreints |
| **Approvals** | Gate humain (N+1/N+2) | Jobs `when: manual`, règles protected |
| **Health/Readiness** | Valider que l’instance est saine **avant** d’exposer | Probes, smoke tests |
| **Rollback** | Revenir vite à N‑1 | `helm rollback`, Vercel **Instant Rollback** |
| **Observabilité** | Décider d’exposer plus de trafic | Logs, métriques, SLO, alertes |
| **Migrations DB** | Éviter l’indisponibilité | Stratégie **expand/contract** |

---

## 🧱 Stratégies de déploiement

### 1) Rolling update
- Remplacement **progressif** des pods / instances.
- **+**: simple, pas de double infra. **–**: si bug, impact partiel pendant le rollout.
- Kubernetes/Helm : par défaut.

### 2) Blue/Green
- Deux environnements **parallèles** : **Blue (N‑1)**, **Green (N)**.
- On **bascule le trafic** d’un coup (ou via alias DNS/LB). Si souci → retour **instantané** à Blue.
- **+** rollback instantané ; **–** double coût.

### 3) Canary
- On envoie **X%** du trafic sur la nouvelle version, on **observe**, puis on **augmente**.
- Permet de **détecter tôt** les régressions en prod.
- Réalisable côté ingress/LB ou via plate‑formes (feature flags).

> **Règle** : choisis la stratégie selon **le risque** et **les contraintes** (coût, infra, SLA).

---

## 🔐 Gestion des environnements & secrets

- **Variables/Secrets** par environnement :
  - **GitLab** : *Settings → CI/CD → Variables* (scopées `staging`/`production`, *protected*).
  - **Vercel** : *Project → Settings → Environment Variables* (**Development / Preview / Production**).
- **Jamais** de secrets en clair dans le repo. Utilise `masked`, `protected`.
- **Paramétrage par env** : URL DB, clés API, domain, feature flags.

---

## 🛠️ GitLab — CD concret

### 🗂️ `.gitlab-ci.yml` focalisé CD (environnements, approvals, on_stop, rollbacks)

```yaml
stages: [package, deploy, verify, release]

variables:
  APP_IMAGE: $CI_REGISTRY_IMAGE/app
  VERSION: $CI_COMMIT_TAG

# 1) Package (produit depuis la CI en amont ou ici si besoin)
package_image:
  stage: package
  image: docker:25
  services: [docker:25-dind]
  rules:
    - if: '$CI_COMMIT_TAG'         # on ne package que sur tag
  script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker build -t $APP_IMAGE:$VERSION .
    - docker push $APP_IMAGE:$VERSION
  artifacts:
    reports:
      dotenv: package.env          # exporte variables pour downstream
  when: on_success

# 2) Déploiement STAGING (auto)
deploy_staging:
  stage: deploy
  image: alpine/k8s:1.29.2
  environment:
    name: staging
    url: https://staging.example.com
    on_stop: stop_staging
  needs: [package_image]
  script:
    - kubectl config set-cluster k8s --server=$K8S_API --insecure-skip-tls-verify=true
    - kubectl config set-credentials deployer --token=$K8S_TOKEN
    - kubectl config set-context ctx --cluster=k8s --namespace=staging --user=deployer
    - kubectl config use-context ctx
    - helm upgrade --install app charts/app --set image.tag=$VERSION --namespace staging --wait --timeout 5m
  rules:
    - if: '$CI_COMMIT_TAG'

stop_staging:
  stage: deploy
  image: alpine/k8s:1.29.2
  environment:
    name: staging
    action: stop
  script:
    - kubectl delete ns staging --ignore-not-found=true
  when: manual

# 3) Gate humain + déploiement PROD
approve_prod:
  stage: deploy
  when: manual                      # bouton d'approbation
  allow_failure: false
  rules:
    - if: '$CI_COMMIT_TAG'
  environment:
    name: production
    url: https://example.com

deploy_prod:
  stage: deploy
  image: alpine/k8s:1.29.2
  needs: [approve_prod]
  environment:
    name: production
    url: https://example.com
  script:
    - kubectl config set-cluster k8s --server=$K8S_API --insecure-skip-tls-verify=true
    - kubectl config set-credentials deployer --token=$K8S_TOKEN
    - kubectl config set-context ctx --cluster=k8s --namespace=prod --user=deployer
    - kubectl config use-context ctx
    - helm upgrade --install app charts/app --set image.tag=$VERSION --namespace prod --wait --timeout 10m

# 4) Vérification post-déploiement (smoke test)
smoke_prod:
  stage: verify
  image: curlimages/curl:8.7.1
  needs: [deploy_prod]
  script:
    - curl -fsS https://example.com/healthz
    - curl -fsS https://example.com/version | grep "$VERSION"

# 5) Job Rollback (disponible en cas d'incident)
rollback_prod:
  stage: deploy
  image: alpine/k8s:1.29.2
  when: manual
  script:
    - kubectl config use-context ctx
    - helm rollback app 1 --namespace prod   # ex: vers la révision 1
```

**Clés CD GitLab** :
- `environment.name/url`, `on_stop` (Review Apps/stop), `when: manual` (approvals), `rules` / `only`/`except` pour contrôler **qui/quand**.
- **Tags** = versions immuables ; **deploy** à partir d’un **artefact**.

### 🔁 Blue/Green / Canary (idées rapides Kubernetes)
- **Blue/Green** : deux `Deployments` (labels `version=blue|green`), un `Service` commute la `selector`.
- **Canary** : deux `Deployments` avec des `weights`/annotations au niveau **Ingress** (selon l’ingress controller).

---

## ☁️ Vercel — CD concret (Preview, Prod, Rollback instantané)

### Notions Vercel spécifiques au CD
- **Preview Deployments** : à chaque branche/PR → URL unique (gate visuel).
- **Production Deployment** : merge sur branche protégée (ex. `main`) → déploiement prod.
- **Env Vars** par scope : `Development` / `Preview` / `Production`.
- **Monorepo** : config par répertoire avec `vercel.json`.
- **Instant Rollback** : revenir à un déploiement précédent en 1 clic/commande.

### Commandes utiles
```bash
npm i -g vercel
vercel login
vercel link                      # associe le dossier au projet
vercel env ls                    # liste variables
vercel env add NAME production   # ajoute une variable en prod
vercel --pre                     # déploiement preview (staging)
vercel --prod                    # déploiement production
vercel ls                        # historise les déploiements
vercel rollback <deployment-id>  # rollback instantané
```

### `vercel.json` (exemple CD)
```json
{
  "version": 2,
  "builds": [{ "src": "package.json", "use": "@vercel/node" }],
  "routes": [
    { "src": "/healthz", "dest": "/api/health" }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

> **Bonnes pratiques Vercel** : protéger la prod (branche), variables par scope, **preview obligatoire** avant merge, endpoint **/healthz** pour smoke test.

---

## 🗃️ Versionning & promotion d’artefacts

1. **Taguer** les releases (`v1.4.3`) ; générer CHANGELOG.
2. **Publier** l’artefact immuable (Docker, archive).
3. **Promouvoir** le **même artefact** : staging → prod (pas de rebuild).

**GitLab Release (idée)** :
```yaml
release:
  stage: release
  image: registry.gitlab.com/gitlab-org/release-cli:latest
  rules: [ { if: '$CI_COMMIT_TAG' } ]
  script:
    - echo "Creating release $CI_COMMIT_TAG"
  release:
    name: "$CI_COMMIT_TAG"
    tag_name: "$CI_COMMIT_TAG"
    description: "Release notes…"
```

---

## 🧪 Gates & contrôles post‑déploiement

- **Smoke tests** (HTTP 200 sur `/healthz`, page clé accessible).
- **Checks métiers rapides** (ex. requête simple DB via API).
- **Observabilité** : 5–15 min d’observation **avant** élargir le trafic (canary).
- **SLO/Alertes** : si erreurs > seuil → **rollback** automatique (si outillage le permet).

---

## 🗄️ Migrations de base de données (zero/low‑downtime)

Stratégie **expand/contract** :
1. **Expand** : déployer d’abord les **nouvelles colonnes** / tables **sans supprimer** l’ancien schéma (code compatible N & N‑1).
2. Déployer l’app **N** qui **écrit** dans le nouveau schéma (et éventuellement encore dans l’ancien).
3. **Contract** : une fois stable, supprimer l’ancien champ/chemin.

> Évite les **migrations destructives** en même temps que le déploiement de code.

---

## 🔎 Check‑lists opérateur CD

**Avant prod :**
- [ ] L’artefact est **tagué** et publié (immuable).
- [ ] Variables/Secrets **scopés** et **protégés**.
- [ ] Endpoint **/healthz** en place.
- [ ] Plan de **rollback** clair (commande documentée).

**Pendant :**
- [ ] Déploiement **progressif** (rolling/canary).
- [ ] **Logs/metrics** OK ; pas d’erreurs anormales.
- [ ] **Smoke tests** verts.

**Après :**
- [ ] **Monitoring** activé ; alertes calées sur SLO.
- [ ] **Release notes** publiées.
- [ ] **Rollback** possible en 1 commande/clic.

---

## 📘 Résumé

- **Le CD n’est pas la CI** : il **orchestre et expose** des versions **déjà testées**.
- Les **stratégies (Rolling / Blue‑Green / Canary)** diminuent le **risque**.
- **GitLab** fournit les **environnements**, **approvals**, **jobs manuels**, **rollback**.
- **Vercel** simplifie le **Preview → Production** et propose **Instant Rollback**.
- CD robuste = **artefacts immuables**, **promotion**, **gates**, **observabilité**, **plan de rollback**, **migrations safe**.

> *“Déployer, c’est ouvrir le robinet du trafic sur une version saine, et pouvoir le refermer immédiatement.”*



<!-- snippet
id: cicd_cd_strategies
type: concept
tech: cicd
level: intermediate
importance: high
format: knowledge
tags: cd,rolling,blue-green,canary,strategie-deploiement
title: Stratégies de déploiement en CD (Rolling, Blue/Green, Canary)
context: choisir la bonne stratégie pour minimiser le risque lors d'une mise en production
content: Rolling = remplacement progressif des instances, simple mais impact partiel si bug. Blue/Green = deux environnements parallèles, bascule d'un coup, rollback instantané (double coût).
-->

<!-- snippet
id: cicd_cd_canary
type: concept
tech: cicd
level: intermediate
importance: medium
format: knowledge
tags: cd,canary,trafic,pourcentage,regression
title: Stratégie Canary : déploiement progressif par pourcentage de trafic
context: détecter les régressions en production avant d'exposer tous les utilisateurs
content: Canary envoie X% du trafic vers la nouvelle version, puis augmente progressivement après observation. Il détecte les régressions tôt et permet un rollback partiel.
-->

<!-- snippet
id: cicd_cd_immutable_artifact
type: concept
tech: cicd
level: intermediate
importance: high
format: knowledge
tags: cd,artefact,immuable,promotion,version
title: Artefact immuable et promotion d'environnement
context: garantir que le même binaire est déployé de staging en prod sans rebuild
content: Un artefact immuable est une version figée (ex. image Docker taguée app:1.4.3). On déploie le même artefact de dev → staging → prod sans jamais rebuilder entre environnements.
-->

<!-- snippet
id: cicd_cd_promotion_guarantee
type: concept
tech: cicd
level: intermediate
importance: high
format: knowledge
tags: cd,promotion,artefact,staging,prod
title: La promotion garantit que staging et prod exécutent le même binaire
context: comprendre pourquoi on ne rebuilde pas entre environnements en CD
content: Rebuilder entre staging et prod risque d'introduire des différences (cache, dépendances, timestamp). Promouvoir le même artefact immuable garantit que ce qui passe en staging est exactement ce qui va en prod.
-->

<!-- snippet
id: cicd_vercel_rollback
type: command
tech: cicd
level: intermediate
importance: medium
format: knowledge
tags: vercel,cd,rollback,deploiement
title: Rollback instantané avec Vercel CLI
context: revenir rapidement à une version précédente après un incident en production Vercel
command: vercel rollback <deployment-id>
description: Revient instantanément à un déploiement précédent identifié par son ID. Utiliser `vercel ls` pour lister les déploiements disponibles et trouver l'ID cible.
-->

<!-- snippet
id: cicd_cd_gitlab_manual_approval
type: concept
tech: cicd
level: advanced
importance: high
format: knowledge
tags: gitlab,cd,approval,when-manual,gate
title: Gate humain (approbation manuelle) dans GitLab CD
context: protéger la production en exigeant une validation humaine avant le déploiement
content: `when: manual` transforme un job en bouton déclenchable depuis l'interface GitLab. Combiné à `allow_failure: false`, il bloque les jobs suivants tant qu'il n'est pas déclenché.
-->

<!-- snippet
id: cicd_cd_gitlab_approval_needs
type: tip
tech: cicd
level: advanced
importance: high
format: knowledge
tags: gitlab,cd,approval,needs,séquence
title: Forcer la séquence approbation → déploiement avec needs
context: s'assurer que le job de déploiement ne peut pas démarrer sans approbation humaine
content: Utiliser `needs: [approve_prod]` sur le job deploy pour forcer la séquence : approbation d'abord, déploiement ensuite. Sans needs, GitLab pourrait démarrer deploy indépendamment.
-->

<!-- snippet
id: cicd_cd_smoke_test
type: concept
tech: cicd
level: intermediate
importance: high
format: knowledge
tags: cd,smoke-test,healthz,verification,post-deploiement
title: Smoke test post-déploiement avec curl
context: valider qu'une application est fonctionnelle immédiatement après déploiement en production
content: Un smoke test minimal appelle /healthz avec curl -fsS. Si le code HTTP n'est pas 2xx, le job CI échoue et déclenche un rollback.
-->

<!-- snippet
id: cicd_cd_smoke_test_b
type: concept
tech: cicd
level: intermediate
importance: medium
format: knowledge
tags: cd,smoke-test,verify,stage,needs
title: Placer le smoke test dans le bon stage du pipeline
context: structurer correctement le pipeline CD pour que le smoke test s'exécute après le déploiement
content: Le smoke test doit s'exécuter dans un stage verify après le deploy, avec needs pointant sur le job de déploiement.
-->

---
[Module suivant →](M20_eslint.md)
---
