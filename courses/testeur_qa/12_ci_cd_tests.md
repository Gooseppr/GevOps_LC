---
layout: page
title: "CI/CD & Tests — Intégrer la qualité dans le pipeline"

course: testeur_qa
chapter_title: "CI/CD & Tests"

chapter: 8
section: 1

tags: ci/cd, pipeline, tests automatisés, jenkins, github actions, qualité logicielle
difficulty: intermediate
duration: 90
mermaid: true

status: "published"
prev_module: "/courses/testeur_qa/09_api_testing.html"
prev_module_title: "API Testing avancé"
next_module: "/courses/testeur_qa/22_data_quality.html"
next_module_title: "Data quality & validation : diagnostiquer et corriger les problèmes de qualité"
---

# CI/CD & Tests — Intégrer la qualité dans le pipeline

## Objectifs pédagogiques

À l'issue de ce module, vous serez capable de :

1. **Expliquer** ce qu'est un pipeline CI/CD et la place des tests à chaque étape
2. **Identifier** quels types de tests appartiennent à quelle phase du pipeline
3. **Lire et interpréter** un fichier de configuration CI (GitHub Actions, GitLab CI)
4. **Concevoir** une stratégie de tests adaptée à un pipeline — en choisissant ce qu'on automatise, et pourquoi
5. **Diagnostiquer** un pipeline cassé à partir de ses logs et remonter à la cause racine

---

## Mise en situation

Une équipe de six personnes — deux devs, un ops, une PO, une designer et vous, QA. Application web Node.js avec une API REST. Jusqu'ici, les tests se font à la main avant chaque release, une fois par sprint. Le problème : la veille de la mise en prod, c'est le chaos. On détecte des régressions, on corrige à la hâte, on déploie les doigts croisés.

La décision est prise : mettre en place un pipeline CI/CD. Chaque merge sur la branche principale déclenche automatiquement une suite de tests, une analyse de code, et si tout passe, un déploiement. Votre rôle : décider quels tests mettre dans ce pipeline, à quel moment, et avec quelle stratégie de blocage.

C'est exactement ce que couvre ce module.

---

## Pourquoi "tester en fin de sprint" ne fonctionne plus

Le test tardif est une dette qui s'accumule. Quand les tests sont dissociés du développement, plusieurs mécanismes se déclenchent naturellement : le contexte du bug est perdu (le dev est passé à autre chose), les corrections en urgence contournent les bonnes pratiques, et l'intégration entre plusieurs features jamais testées ensemble devient une bombe à retardement.

CI/CD — Continuous Integration / Continuous Delivery — répond à ce problème fondamental en **décalant les tests vers la gauche**. "Shift left" dans le jargon : plus on détecte un problème tôt, moins il coûte cher à corriger.

> Un bug détecté pendant le développement coûte environ 1x à corriger. En test d'intégration : 6x. En production : 100x. Ces ordres de grandeur viennent d'une étude IBM de 1976, validée de nombreuses fois depuis. Les proportions exactes varient selon les contextes — la tendance, elle, est universelle.

### Ce que ça change pour un QA

Sans CI/CD, vous êtes en bout de chaîne : vous recevez ce que les devs ont produit et vous testez. Avec CI/CD, vous devenez **architecte de la qualité dans le pipeline**. Vous définissez les *gates* — ces points de contrôle qui bloquent une PR si les critères ne sont pas satisfaits. Vous décidez ce qui est bloquant et ce qui est simplement informatif.

C'est une montée en responsabilité réelle, et c'est aussi pourquoi cette compétence est très recherchée sur le marché.

---

## Architecture d'un pipeline CI/CD avec tests

Un pipeline est une séquence d'étapes automatisées déclenchées par un événement — typiquement un push ou une pull request. Chaque étape peut réussir ou échouer, et un échec bloque les étapes suivantes.

```mermaid
flowchart LR
    A[Push / PR] --> B[Lint & Build]
    B --> C[Tests Unitaires]
    C --> D[Tests d'Intégration]
    D --> E[Tests E2E / UI]
    E --> F[Analyse Qualité]
    F --> G{Tous les gates\npassent ?}
    G -- Oui --> H[Déploiement Staging]
    H --> I[Tests de Smoke\nen staging]
    I --> J[Déploiement Production]
    G -- Non --> K[❌ Pipeline bloqué\nNotification équipe]
```

Chaque rectangle est un **job** dans la terminologie CI. Ils s'exécutent soit en séquence (l'un attend l'autre), soit en parallèle quand ils sont indépendants.

### Composants du pipeline

| Composant | Rôle | Exemples |
|-----------|------|---------|
| **Déclencheur** | Événement qui lance le pipeline | Push, PR, tag, cron |
| **Runner / Agent** | Machine qui exécute les jobs | GitHub Actions runner, GitLab Runner |
| **Stages** | Groupes d'étapes logiques | build, test, deploy |
| **Jobs** | Unité d'exécution dans un stage | unit-tests, lint, e2e |
| **Artefacts** | Fichiers produits par le pipeline | rapports de tests, binaire compilé |
| **Gate de qualité** | Critère de blocage | couverture > 80%, 0 test en échec |

### La pyramide de tests dans le pipeline

La pyramide de tests n'est pas qu'un concept théorique — elle a une implication directe sur l'ordre des étapes. Les tests rapides et nombreux vont tôt dans le pipeline ; les tests lents et coûteux vont tard. La raison est simple : si un test unitaire va échouer, autant le savoir en 2 minutes plutôt qu'après 40 minutes de tests E2E.

```mermaid
graph LR
    subgraph "Position dans le pipeline"
        P1["⚡ Début — &lt; 2 min\nTests unitaires"] --> P2["⏱️ Milieu — 5-15 min\nTests d'intégration"] --> P3["🐢 Fin — 15-45 min\nTests E2E / UI"]
    end
```

**Règle pratique** : si un test prend plus de 30 secondes à s'exécuter seul, posez-vous la question de sa place dans le pipeline. Un pipeline qui prend 45 minutes à tourner, les développeurs vont arrêter de le regarder — et c'est pire qu'un pipeline inexistant.

---

## Ce qui se passe vraiment dans un pipeline

### Isolation et environnements éphémères

Chaque job CI tourne dans un environnement propre — un container Docker ou une VM fraîche créée pour l'occasion. C'est intentionnel : ça garantit la **reproductibilité**. Si ça passe sur votre machine mais pas en CI, c'est presque toujours une dépendance implicite qui manque, ou un état local qui influence le résultat.

🧠 L'environnement CI est immuable et sans état. Il ne se souvient de rien entre deux runs. Toute dépendance externe — base de données, service tiers — doit être soit mockée, soit instanciée dans le pipeline lui-même (via Docker Compose ou les services intégrés, comme on le verra plus bas).

### Le cache — accélérer sans tricherie

Télécharger 500 packages npm à chaque commit, c'est lent. Les systèmes CI proposent un mécanisme de cache : si le fichier `package-lock.json` n'a pas changé, on récupère les `node_modules` du run précédent au lieu de tout retélécharger. C'est transparent et efficace — mais ça peut être source de bugs subtils si le cache n'est pas invalidé correctement.

⚠️ Erreur fréquente : un test passe en CI parce qu'il utilise une version cachée d'une dépendance, alors qu'une installation fraîche causerait un échec. Comportement inexplicable dans un pipeline ? Commencez par vider le cache CI.

### Secrets et variables d'environnement

Les credentials — clés API, mots de passe de base de données de test — ne vont **jamais** dans le code ni dans le fichier de config CI. Ils sont injectés via le système de secrets de la plateforme (GitHub Secrets, GitLab CI Variables, HashiCorp Vault). Le pipeline les référence sans jamais les exposer dans les logs.

---

## Construction progressive — Du pipeline minimal au pipeline production

La meilleure façon d'apprendre les pipelines, c'est de les construire couche par couche. Voici trois niveaux, du plus simple au plus complet.

### V1 — Le minimum viable : lint + tests unitaires

C'est le point de départ. Ça prend cinq minutes à mettre en place et ça apporte immédiatement de la valeur : chaque PR est vérifiée, chaque régression est détectée avant le merge.

```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Unit tests
        run: npm test -- --coverage
```

💡 `npm ci` au lieu de `npm install` : installe exactement ce qui est dans le lockfile, sans jamais résoudre ni mettre à jour les versions. C'est la commande à utiliser en CI pour garantir que tout le monde — développeur, pipeline, prod — travaille avec les mêmes dépendances.

### V2 — Ajouter les tests d'intégration avec une base de données

On franchit une étape : tester le comportement réel de l'application avec une vraie base de données, pas un mock. GitHub Actions (et GitLab CI) permettent de déclarer des **services** — des containers Docker qui tournent en parallèle du job.

```yaml
jobs:
  integration-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: testdb
          POSTGRES_USER: testuser
          POSTGRES_PASSWORD: testpass
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run migrations
        run: npm run db:migrate
        env:
          DATABASE_URL: postgresql://testuser:testpass@localhost:5432/testdb

      - name: Integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://testuser:testpass@localhost:5432/testdb
```

Ce que V2 apporte par rapport à V1 : les bugs d'ORM, de requête SQL, de gestion des transactions — tout ça n'est visible qu'avec une vraie base de données. Les mocks ne capturent pas ce niveau de comportement. Le `--health-retries 5` sur le container PostgreSQL est important : il garantit que la base est prête à recevoir des connexions avant que les migrations démarrent, évitant des échecs aléatoires au démarrage.

### V3 — Pipeline complet avec gates de qualité et déploiement

On ajoute les tests E2E (Playwright), un seuil de couverture bloquant, et le déploiement conditionnel sur `main`.

```yaml
name: Full CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  # ---- Stage 1 : Vérifications rapides ----
  lint-and-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: dist/

  # ---- Stage 2 : Tests unitaires avec seuil de couverture ----
  unit-tests:
    runs-on: ubuntu-latest
    needs: lint-and-build
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - name: Run unit tests with coverage
        run: npm test -- --coverage --coverageThreshold='{"global":{"lines":80}}'
      - uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage/

  # ---- Stage 3 : Tests E2E ----
  e2e-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - name: Start app
        run: npm start &
      - name: Wait for app to be ready
        run: npx wait-on http://localhost:3000 --timeout 30000
      - name: Run E2E tests
        run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  # ---- Stage 4 : Déploiement (main uniquement) ----
  deploy:
    runs-on: ubuntu-latest
    needs: [unit-tests, e2e-tests]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    environment: production
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with:
          name: build-output
          path: dist/
      - name: Deploy to production
        run: ./scripts/deploy.sh
        env:
          DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
```

Trois mécanismes méritent une attention particulière :

**`needs`** crée les dépendances entre jobs. Les tests E2E ne démarrent pas si les tests unitaires échouent. Le déploiement ne démarre pas si l'un des deux stages précédents est en échec. Sans `needs`, tous les jobs partent en parallèle dès le début — y compris le déploiement.

**`if: failure()`** sur l'upload du rapport Playwright — les screenshots et traces ne sont sauvegardés qu'en cas d'échec. Sur un pipeline qui tourne des dizaines de fois par jour, c'est une économie de stockage significative, et ça force à regarder les artefacts au moment où ils ont vraiment de la valeur : pendant le debug.

**`if: github.ref == 'refs/heads/main'`** sur le déploiement — les PRs font tourner tous les tests sans déclencher de déploiement. Seuls les merges sur `main` vont jusqu'en production.

---

## Stratégie de tests dans un pipeline — Quoi automatiser, et pourquoi

Mettre tous ses tests dans un pipeline n'est pas une stratégie — c'est une recette pour un pipeline lent et peu fiable. La vraie question : que mérite d'être automatisé, à quel endroit, et avec quel niveau de blocage ?

### La règle des trois questions

Avant d'ajouter un test au pipeline :

1. **Ce test peut-il échouer de manière aléatoire ?** Un test instable (flaky) qui passe 8 fois sur 10 est pire qu'un test absent : l'équipe commence à ignorer les alertes CI. Et un jour, c'est un vrai bug qu'on laisse passer.
2. **Combien de temps prend-il ?** Au-delà de 15 minutes pour la suite complète, les devs décrochent. Le pipeline doit être rapide pour être consulté.
3. **Que couvre-t-il vraiment ?** Un test E2E qui couvre un cas déjà couvert par cinq tests unitaires n'apporte pas de valeur supplémentaire en CI — il ajoute juste de la lenteur.

⚠️ Les flaky tests sont l'ennemi numéro un d'un pipeline. L'équipe commence à merger des PRs en disant "c'est juste le test flaky, ça va". Le jour où c'est un vrai bug, personne ne le voit. Identifiez les tests instables via les statistiques de run (GitHub Actions les signale nativement), isolez-les dans une suite non-bloquante, et corrigez-les avant d'en ajouter de nouveaux.

### Ce qui bloque vs ce qui informe

Tout ne mérite pas d'être bloquant. Une stratégie mature distingue trois niveaux :

| Niveau | Comportement | Exemples typiques |
|--------|-------------|------------------|
| **Bloquant** | Pipeline échoue, merge impossible | Tests unitaires en échec, couverture sous le seuil, build cassé |
| **Avertissement** | Pipeline passe, notification envoyée | Nouvelle dette technique détectée, dégradation de performance > 20% |
| **Informatif** | Rapport généré, aucune alerte | Rapport de couverture complet, analyse des dépendances |

💡 Dans SonarQube, c'est exactement cette logique. Le "Quality Gate" définit des critères stricts pour le **nouveau** code uniquement — ce qui évite de bloquer tout le projet pour de la dette technique existante accumulée avant la mise en place du pipeline.

### Les tests de régression dans le pipeline

Le pipeline CI est l'endroit naturel pour les tests de régression : à chaque PR, toute la suite tourne, et n'importe quelle régression est détectée avant le merge. La vraie question n'est pas "doit-on automatiser la régression ?" mais "est-ce que la suite de régression est maintenue ?"

Un test de régression avec des sélecteurs CSS obsolètes ou des données de test périmées devient un boulet. **La règle pratique** : qui écrit le test est responsable de sa maintenance dans le pipeline. Le QA qui rédige un test E2E doit surveiller son comportement dans les runs CI, pas seulement au moment de l'écriture.

---

## Cas réel en entreprise

**Contexte** : une startup fintech, huit développeurs, application mobile et API Node.js. Avant la refonte du pipeline, le cycle était : développement → revue de code → QA manuel → staging → production. Durée moyenne : trois à quatre jours par feature.

**Problème** : trois incidents en production en deux mois, tous dus à des régressions sur des fonctionnalités existantes. Les développeurs travaillaient en parallèle sur plusieurs features et personne ne testait les interactions entre elles.

**Ce qui a été mis en place** — dans cet ordre :

1. Pipeline CI sur toutes les PRs : lint + tests unitaires + tests d'intégration. Durée : 8 minutes.
2. Coverage gate à 75% sur le nouveau code via SonarQube Cloud — pas sur le code existant.
3. Suite Playwright couvrant les **10 parcours critiques uniquement** (connexion, virement, consultation de solde...) — déclenchée sur les merges vers `main`, pas sur chaque PR.
4. Déploiement automatique sur staging après merge sur `main`.
5. Tests de smoke automatisés sur staging avant promotion en production.

**Résultats après trois mois** :
- Zéro incident de régression en production
- Temps de cycle réduit de 3-4 jours à 1 jour
- Pipeline complet en 12 minutes end-to-end
- Dans la rétro suivante : "on merge avec beaucoup plus de confiance maintenant"

Le point clé de cette mise en place : couvrir les 10 parcours critiques avec Playwright (et non les 80 scénarios complets) a permis de rester sous 15 minutes. Le choix de ce qui entre dans le pipeline était aussi important que le pipeline lui-même.

---

## Bonnes pratiques

**Commencer petit, itérer.** Un pipeline avec lint et tests unitaires qui tourne vraiment est infiniment plus utile qu'un pipeline parfait théorique jamais déployé. Ajoutez une étape à la fois, vérifiez qu'elle fonctionne, puis passez à la suivante.

**Nommer les jobs de façon lisible.** `unit-tests` est mieux que `test`. `e2e-checkout-flow` est mieux que `e2e`. Quand un pipeline échoue à 2h du matin en urgence, le nom du job doit immédiatement indiquer où chercher.

**Conserver les artefacts d'échec.** Screenshots Playwright, logs d'erreur, rapports Jest — tout ça doit être uploadé comme artefact quand le pipeline échoue. Sans ça, déboguer un échec CI revient à reproduire le problème localement, ce qui peut prendre des heures.

**Ne jamais commiter de secrets.** Même un secret "temporaire" dans un fichier de config finira dans l'historique Git, pour toujours, même après suppression du commit. Utilisez les variables d'environnement de votre plateforme CI, systématiquement, sans exception.

**Monitorer la durée du pipeline.** Si le pipeline grossit de deux minutes par sprint, dans six mois il est ingérable. Fixez un budget temps (15 minutes maximum pour la majorité des cas) et respectez-le. Quand le budget est dépassé, quelque chose doit sortir ou être parallélisé.

**Rendre le pipeline déterministe.** Un pipeline qui passe parfois et échoue parfois sans raison claire détruira la confiance de l'équipe plus vite que tout. Corrigez les flaky tests avant d'en ajouter de nouveaux — sans quoi le pipeline devient un bruit de fond que personne ne surveille.

**Documenter les gates de qualité.** Chaque critère bloquant doit avoir une justification écrite. "Couverture > 80% parce qu'on a décidé" n'est pas une raison suffisante. "Couverture > 80% sur les services de paiement pour réduire le risque de régression silencieuse sur les flux critiques" — ça, c'est une raison qui survivra aux changements d'équipe.

---

## Résumé

Le CI/CD n'est pas un outil DevOps réservé aux ops : c'est l'infrastructure de la qualité logicielle. En tant que QA, vous définissez les gates qui décident ce qui peut partir en production. La clé est de comprendre que tous les tests n'ont pas leur place dans un pipeline — les tests lents, instables ou redondants dégradent la confiance de l'équipe dans le système de la même façon qu'une alarme incendie qui se déclenche pour rien.

Un pipeline bien conçu suit la pyramide de tests : beaucoup de tests unitaires rapides en entrée, peu de tests E2E lents en sortie, et des gates de qualité explicitement justifiés à chaque niveau. Les artefacts d'échec — screenshots, logs, rapports — sont essentiels pour déboguer sans reproduire localement. La durée totale est un indicateur de santé du pipeline autant que le taux de succès.

La prochaine étape logique : explorer les tests de performance et de charge intégrés au pipeline (k6, Gatling), et les stratégies de déploiement progressif — blue/green, canary — qui permettent de tester en production de manière contrôlée.

---

<!-- snippet
id: cicd_pipeline_trigger_config
type: concept
tech: github-actions
level: intermediate
importance: high
format: knowledge
tags: ci/cd,github-actions,pipeline,declencheur
title: Déclencheurs d'un pipeline GitHub Actions
content: Un pipeline se déclenche via le champ `on:`. `push` déclenche sur chaque commit poussé, `pull_request` sur ouverture ou mise à jour d'une PR, `workflow_dispatch` permet un déclenchement manuel. On peut filtrer par branche avec `branches: [main, develop]`. Sans filtre, le pipeline tourne sur toutes les branches — y compris les branches temporaires.
description: Contrôler quand un pipeline se déclenche évite de consommer des minutes de CI inutilement sur des branches de travail temporaires.
-->

<!-- snippet
id: cicd_npm_ci_vs_install
type: tip
tech: nodejs
level: intermediate
importance: high
format: knowledge
tags: ci/cd,npm,reproductibilite,dependances
title: Utiliser npm ci plutôt que npm install en CI
content: En CI, toujours utiliser `npm ci` : installe exactement ce qui est dans `package-lock.json`, sans jamais résoudre ni mettre à jour les versions. `npm install` peut modifier le lockfile et introduire une version différente de celle testée localement. `npm ci` supprime aussi `node_modules` avant d'installer, garantissant un état propre à chaque run.
description: npm ci garantit que la CI installe exactement les mêmes versions que le développeur — élimine la classe de bugs "ça marche chez moi mais pas en CI".
-->

<!-- snippet
id: cicd_flaky_test_danger
type: warning
tech: ci/cd
level: intermediate
importance: high
format: knowledge
tags: ci/cd,tests,flaky,qualite,pipeline
title: Les flaky tests détruisent la confiance dans le pipeline
content: Un test flaky passe 8 fois sur 10 sans raison apparente. Piège : l'équipe commence à ignorer les alertes CI ("c'est juste le flaky test, ça va"). Conséquence : un vrai bug passe inaperçu au merge. Correction : identifier les tests instables via les statistiques de run (GitHub Actions les signale nativement), les isoler dans une suite séparée non-bloquante, et les corriger avant d'en ajouter de nouveaux.
description: Un test instable est pire qu'un test absent : il génère de la défiance envers tout le système d'alerte CI — jusqu'à ce qu'on ignore un vrai bug.
-->

<!-- snippet
id: cicd_needs_job_dependency
type: concept
tech: github-actions
level: intermediate
importance: high
format: knowledge
tags: ci/cd,github-actions,jobs,dependances,pipeline
title: Dépendances entre jobs avec needs
content: Le mot-clé `needs` dans un job GitHub Actions définit les jobs qui doivent réussir avant que celui-ci démarre. Exemple : `needs: [unit-tests, lint]`. Si un des jobs listés échoue, le job dépendant est automatiquement annulé (statut `skipped`). C'est le mécanisme qui crée les gates entre les stages du pipeline.
description: Sans needs, tous les jobs démarrent en parallèle — le déploiement pourrait se lancer même si les tests échouent.
-->

<!-- snippet
id: cicd_artifacts_on_failure
type: tip
tech: github-actions
level: intermediate
importance: medium
format: knowledge
tags: ci/cd,github-actions,artefacts,debug,playwright
title: Uploader les artefacts de test uniquement en cas d'échec
content: Ajouter `if: failure()` sur l'étape upload-artifact pour ne conserver screenshots et rapports que quand le pipeline échoue. Sans cette condition, chaque run stocke des Mo de rapports inutiles. En cas d'échec, les traces Playwright sont accessibles dans l'onglet "Artifacts" du run GitHub — sans avoir à reproduire le problème localement.
description: Conditionner l'upload à l'échec réduit le stockage et donne de la valeur aux artefacts au seul moment où ils comptent vraiment : le debug.
-->

<!-- snippet
id: cicd_coverage_threshold_jest
type: command
tech: jest
level: intermediate
importance: medium
format: knowledge
tags: ci/cd,jest,couverture,quality-gate
title: Bloquer le pipeline si la couverture de code est insuffisante
command: npm test -- --coverage --coverageThreshold='{"global":{"lines":<SEUIL>}}'
example: npm test -- --coverage --coverageThreshold='{"global":{"lines":80}}'
description: Jest retourne un exit code non-nul si la couverture passe sous le seuil — le pipeline s'arrête automatiquement. Configurable aussi dans jest.config.js pour ne pas surcharger la commande CLI.
-->

<!-- snippet
id: cicd_service_docker_postgres
type: concept
tech: github-actions
level: intermediate
importance: medium
format: knowledge
tags: ci/cd,github-actions,docker,postgres,integration-tests
title: Instancier une base de données PostgreSQL dans un pipeline CI
content: GitHub Actions permet de déclarer des `services` — containers Docker qui tournent en parallèle du job. Le service postgres:15 est accessible via `localhost:<PORT>` depuis les étapes du job. L'option `--health-cmd pg_isready` avec `--health-retries 5` garantit que le container est prêt à accepter des connexions avant que les migrations démarrent — sans ça, les migrations échouent aléatoirement au démarrage.
description: Les services CI sont des containers éphémères créés au démarrage du job et détruits à sa fin — chaque run part d'une base vide, ce qui garantit l'isolation complète des tests.
-->

<!-- snippet
id: cicd_deploy_condition_main_only
type: tip
tech: github-actions
level: intermediate
importance: high
format: knowledge
tags: ci/cd,github-actions,deploiement,conditions,securite
title: Restreindre le déploiement aux merges sur main uniquement
content: Utiliser la condition `if: github.ref == 'refs/heads/main' && github.event_name == 'push'` sur le job de déploiement. Les PRs font tourner tous les tests sans déclencher de dé
