---
layout: page
title: Prise en main de kubectl et environnement local
course: kube-helm
chapter_title: Prise en main de kubectl et environnement local
chapter: 1
section: 2
tags: "kubernetes, kubectl, kind, troubleshooting"
difficulty: beginner
duration: 100
mermaid: false
icon: terminal
domain: devops
domain_icon: cloud
status: published
prev_module: /courses/kube-helm/01_architecture_reconciliation.html
prev_module_title: Architecture Kubernetes et boucle de réconciliation
next_module: /courses/kube-helm/03_pods_deployments_services.html
next_module_title: "Pods, Deployments et Services"
---
# Prise en main de kubectl et environnement local

## Objectifs pédagogiques

- Créer un cluster local reproductible avec kind.
- Contrôler le contexte et le namespace avant une action.
- Lire ressources, événements, logs et spécification effective.
- Appliquer puis retirer proprement un manifeste.

## Mise en situation

Vous recevez un ticket « l’application ne répond plus ». Avant de toucher à la production, il faut savoir reproduire les gestes sur un cluster jetable et surtout éviter l’erreur classique : exécuter la bonne commande sur le mauvais cluster.

## Construire le laboratoire

Avec Docker actif, kind lance les nœuds Kubernetes sous forme de conteneurs :

```bash
kind create cluster --name coursite
kubectl cluster-info --context kind-coursite
kubectl get nodes -o wide
```

Le kubeconfig contient clusters, utilisateurs et contextes. Un contexte associe ces informations et éventuellement un namespace.

```bash
kubectl config current-context
kubectl config get-contexts
kubectl config set-context --current --namespace=default
```

💡 Affichez le contexte courant dans le prompt du terminal en production. La vérification coûte deux secondes ; une suppression au mauvais endroit coûte beaucoup plus.

## La séquence de lecture utile

Commencez large, puis resserrez :

```bash
kubectl get pods -A
kubectl get pod web-abc123 -n demo -o wide
kubectl describe pod web-abc123 -n demo
kubectl logs web-abc123 -n demo --previous
kubectl get events -n demo --sort-by=.metadata.creationTimestamp
```

`get` montre l’état synthétique. `describe` ajoute conditions et événements. `logs --previous` récupère les logs du conteneur précédent après un redémarrage. Les événements sont utiles mais leur conservation est limitée : ils ne remplacent pas une observabilité durable.

Pour comprendre un champ sans quitter le terminal :

```bash
kubectl explain deployment.spec.strategy
kubectl get deployment web -n demo -o yaml
```

## Appliquer sans piloter à l’aveugle

```bash
kubectl apply --dry-run=server -f deployment.yaml
kubectl diff -f deployment.yaml
kubectl apply -f deployment.yaml
kubectl rollout status deployment/web -n demo --timeout=120s
```

Le dry-run serveur utilise la validation du cluster. `diff` rend le changement visible. `rollout status` transforme le déploiement en étape vérifiable plutôt qu’en simple envoi de YAML.

## Cas réel

Une modification paraît sans effet. `current-context` révèle un cluster local au lieu du staging. La panne n’était pas Kubernetes mais l’absence de garde-fou opératoire. L’équipe ajoute ensuite un nom de contexte explicite dans ses scripts et interdit les contextes implicites en CI.

## Bonnes pratiques

- Toujours préciser le namespace dans les procédures partagées.
- Préférer `apply`, `diff` et Git aux modifications impératives durables.
- Capturer YAML, événements et logs avant de supprimer un Pod défaillant.
- Utiliser `exec` pour observer, jamais pour installer une correction permanente.
- Détruire le laboratoire avec `kind delete cluster --name coursite` après usage.

## Résumé

kind fournit un cluster local jetable et kubectl sert à interroger l’API. Le contexte et le namespace définissent la cible réelle. Une investigation fiable progresse de `get` vers `describe`, événements, logs et YAML. Le dry-run serveur, le diff et l’attente du rollout sécurisent les changements. Vous pouvez maintenant manipuler les principaux objets applicatifs.

<!-- snippet
id: kubernetes_check_context
type: command
tech: kubernetes
level: beginner
importance: high
format: knowledge
tags: kubernetes,kubectl,context
title: Vérifier le contexte actif
command: kubectl config current-context
description: Confirme le cluster ciblé avant toute lecture ou modification.
-->
<!-- snippet
id: kubernetes_describe_pod
type: command
tech: kubernetes
level: beginner
importance: high
format: knowledge
tags: kubernetes,kubectl,events
title: Décrire un Pod
command: kubectl describe pod <POD> -n <NAMESPACE>
example: kubectl describe pod web-abc123 -n demo
description: Affiche conditions, conteneurs et événements attachés au Pod.
-->
<!-- snippet
id: kubernetes_previous_logs
type: command
tech: kubernetes
level: beginner
importance: high
format: knowledge
tags: kubernetes,logs,restart
title: Lire les logs avant redémarrage
command: kubectl logs <POD> -n <NAMESPACE> --previous
example: kubectl logs web-abc123 -n demo --previous
description: Lit les logs de l'instance précédente du conteneur après un crash.
-->
<!-- snippet
id: kubernetes_server_dry_run
type: command
tech: kubernetes
level: beginner
importance: medium
format: knowledge
tags: kubernetes,validation,manifest
title: Valider un manifeste côté serveur
command: kubectl apply --dry-run=server -f <FICHIER>
example: kubectl apply --dry-run=server -f deployment.yaml
description: Demande au cluster de valider la ressource sans la persister.
-->
<!-- snippet
id: kubernetes_capture_before_delete
type: warning
tech: kubernetes
level: beginner
importance: high
format: knowledge
tags: kubernetes,diagnostic,evidence
title: Observer avant de supprimer
content: Supprimer immédiatement un Pod efface une partie du contexte de panne ; capturer describe, événements, logs courants et précédents avant le remplacement.
description: Le redémarrage peut rétablir le service tout en détruisant la preuve utile.
-->
