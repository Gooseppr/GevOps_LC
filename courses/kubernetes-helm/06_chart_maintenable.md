---
layout: page
title: "Construire un chart maintenable"
course: kubernetes-helm
chapter_title: "Projets réels"
chapter: 2
section: 6
tags: helm, chart, architecture, testing, environments
difficulty: intermediate
duration: 120
mermaid: false
status: "published"
prev_module: "/courses/kubernetes-helm/05_helm_charts_templates_valeurs.html"
prev_module_title: "Helm : charts, templates et valeurs"
next_module: "/courses/kubernetes-helm/07_diagnostic_kubernetes_helm.html"
next_module_title: "Diagnostic Kubernetes et Helm"
---

# Construire un chart maintenable

## Objectifs pédagogiques

- Concevoir une interface de valeurs stable et documentée.
- Centraliser noms et labels dans des helpers.
- Séparer chart commun et configuration d’environnement.
- Valider structure et rendu avant publication.

## Mise en situation

Un chart fonctionne pour une équipe, puis devient illisible : conditions imbriquées, valeurs sans type, noms différents selon les ressources et copies par environnement. Le problème n’est plus Helm mais l’absence de contrat entre le chart et ses consommateurs.

## Traiter values.yaml comme une API

Une valeur publique est une interface. Son nom, son type et sa valeur par défaut doivent rester compréhensibles. Préférez une structure stable :

```yaml
replicaCount: 2
image:
  repository: ghcr.io/acme/web
  tag: "1.4.2"
  pullPolicy: IfNotPresent
service:
  port: 8080
resources:
  requests:
    cpu: 100m
    memory: 128Mi
```

`values.schema.json` permet de contrôler types, valeurs obligatoires et contraintes. Il bloque par exemple `replicaCount: "deux"` avant le rendu utile.

## Les helpers portent les conventions

Placez dans `_helpers.tpl` les noms complets et labels communs. Une modification de convention ne doit pas demander dix corrections dispersées. Utilisez les labels Kubernetes recommandés comme `app.kubernetes.io/name`, `instance` et `managed-by`.

Les environnements ne justifient pas trois forks du chart :

```text
chart commun
├── values.yaml
├── values-dev.yaml
├── values-staging.yaml
└── values-prod.yaml
```

Le chart définit la structure ; chaque fichier d’environnement ne porte que les écarts. Les secrets réels restent hors de ces fichiers Git ordinaires.

## Dépendances, hooks et décisions

Une dépendance Helm convient à un composant fortement lié et géré avec la même release. Elle devient un mauvais choix si son cycle de vie, son équipe ou son niveau de criticité diffère. Une base de données partagée mérite généralement une release ou un service distinct.

Les hooks peuvent lancer migrations ou validations, mais ils introduisent un cycle de vie séparé. Préférez un Job explicite quand l’observabilité et la reprise importent. Un hook mal supprimé peut laisser des ressources orphelines.

## Pipeline minimal du chart

```bash
helm lint ./web --strict
helm template demo ./web -f values-prod.yaml > rendered.yaml
kubectl apply --dry-run=server -f rendered.yaml
```

Ajoutez ensuite tests unitaires de templates ou snapshots ciblés, scan d’images et test d’installation sur kind. Le but n’est pas d’empiler les outils : chaque étape doit intercepter une famille de défauts précise.

## Cas réel

Deux équipes utilisent le même chart. Une clé est renommée sans migration et casse le pipeline consommateur. L’équipe publie désormais les changements incompatibles avec une version majeure du chart, maintient un changelog et valide plusieurs fichiers de valeurs en CI.

## Bonnes pratiques

- Garder les templates lisibles après rendu et avant rendu.
- Valider les valeurs avec un schéma.
- Versionner le chart indépendamment de l’application.
- Documenter dépréciations et migrations de valeurs.
- Éviter les hooks pour masquer une orchestration mal découpée.
- Tester au moins la configuration minimale et la configuration production.

## Résumé

Un chart maintenable expose une interface de valeurs claire, centralise ses conventions et limite la logique de template. Le schéma protège les types. Les fichiers d’environnement décrivent des écarts sans dupliquer le chart. Dépendances et hooks doivent respecter les cycles de vie réels. Une validation multicouche rend les changements compatibles et prépare le diagnostic du module suivant.

<!-- snippet
id: helm_values_as_api
type: concept
tech: helm
level: intermediate
importance: high
format: knowledge
tags: helm,values,api
title: Values comme interface publique
content: Les clés values consommées par les équipes forment une API ; renommer ou changer leur type peut casser les pipelines même si le template reste valide.
description: Versionner et documenter les changements incompatibles du chart.
-->
<!-- snippet
id: helm_values_schema
type: tip
tech: helm
level: intermediate
importance: high
format: knowledge
tags: helm,schema,validation
title: Valider les types de values
content: Ajouter values.schema.json pour imposer types, champs requis et plages ; tester au moins les fichiers dev et prod dans la CI.
description: Le schéma bloque les mauvaises valeurs avant leur arrivée dans les manifests.
-->
<!-- snippet
id: helm_lint_strict
type: command
tech: helm
level: intermediate
importance: medium
format: knowledge
tags: helm,lint,ci
title: Linter strictement un chart
command: helm lint <CHART> --strict
example: helm lint ./web --strict
description: Traite les avertissements du lint comme des erreurs dans la validation du chart.
-->
<!-- snippet
id: helm_avoid_environment_forks
type: warning
tech: helm
level: intermediate
importance: high
format: knowledge
tags: helm,environments,maintenance
title: Ne pas forker le chart par environnement
content: Copier le chart pour dev et prod fait diverger correctifs et conventions ; garder un chart commun et des fichiers de valeurs ne contenant que les écarts.
description: La configuration varie, la structure applicative reste partagée.
-->
<!-- snippet
id: helm_hooks_lifecycle
type: warning
tech: helm
level: intermediate
importance: medium
format: knowledge
tags: helm,hooks,jobs
title: Les hooks ont leur propre cycle de vie
content: Un hook mal conçu peut bloquer l'upgrade ou laisser une ressource ; définir politique de suppression, timeout et procédure de reprise, ou préférer un Job explicite.
description: Les hooks ne doivent pas cacher une orchestration critique non observable.
-->
