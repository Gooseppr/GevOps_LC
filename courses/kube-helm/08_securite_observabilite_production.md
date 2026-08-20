---
layout: page
title: "Sécurité, observabilité et politiques de production"
course: kube-helm
chapter_title: "Sécurité, observabilité et politiques de production"
chapter: 3
section: 8
tags: "kubernetes, security, observability, rbac, policies"
difficulty: advanced
duration: 150
mermaid: false
icon: shield-check
domain: devops
domain_icon: cloud
status: published
prev_module: /courses/kube-helm/07_diagnostic_kubernetes_helm.html
prev_module_title: Diagnostic Kubernetes et Helm
next_module: /courses/kube-helm/09_livraison_continue_helm.html
next_module_title: Livraison continue et exploitation des releases Helm
---
# Sécurité, observabilité et politiques de production

## Objectifs pédagogiques

- Réduire les privilèges d’un workload et de son identité.
- Définir des politiques de ressources et de disponibilité.
- Relier logs, métriques et traces à des questions distinctes.
- Choisir des alertes orientées impact utilisateur.

## Mise en situation

Un cluster fonctionne en staging sans requests, avec ServiceAccount par défaut et conteneurs root. En production, un Pod gourmand évince ses voisins et un compte compromis peut lister tous les Secrets. Passer en production signifie rendre les comportements contraignables, observables et auditables.

## Défense en profondeur

RBAC répond à « quelle identité peut faire quelle action sur quelle ressource ? ». Un workload doit utiliser un ServiceAccount dédié, lié à un Role limité au namespace lorsque c’est suffisant. Vérifiez le droit effectif :

```bash
kubectl auth can-i get secrets --as=system:serviceaccount:demo:web -n demo
```

Au niveau du Pod, `securityContext` peut interdire l’escalade, exiger un utilisateur non-root, supprimer des capabilities et rendre le système de fichiers racine en lecture seule. Ces réglages cassent parfois une image conçue pour écrire partout : corrigez l’image ou montez un volume ciblé, plutôt que de réouvrir tous les privilèges.

Les NetworkPolicies limitent les flux autorisés, mais nécessitent un plugin réseau qui les applique. Commencez par observer les dépendances, puis passez progressivement d’un modèle ouvert à un default-deny testé.

## Ressources et disponibilité

Requests/limits permettent placement et isolation. `ResourceQuota` borne un namespace ; `LimitRange` impose des valeurs par défaut ou limites. Un PodDisruptionBudget protège contre les interruptions volontaires, mais ne crée pas de réplicas et ne protège pas d’une panne involontaire.

## Observer pour répondre à trois questions

| Signal | Question | Exemple |
|---|---|---|
| Logs | Que s’est-il passé dans un composant ? | erreur avec correlation ID |
| Métriques | Quelle tendance ou saturation ? | latence p95, erreurs, CPU |
| Traces | Où le temps est-il dépensé ? | appel API → base → cache |

Une alerte utile part du symptôme : taux d’erreur, latence ou indisponibilité. Une alerte CPU seule peut être un signal de capacité, pas forcément un incident utilisateur. Associez runbook, propriétaire et fenêtre d’observation.

## Cas réel et arbitrage

Une API atteint 90 % CPU pendant une campagne mais respecte sa latence. L’alerte CPU réveille inutilement l’astreinte. L’équipe garde un warning de capacité et déclenche l’incident sur erreurs et latence soutenues. Elle utilise ensuite les métriques CPU pour dimensionner requests et autoscaling.

## Bonnes pratiques

- ServiceAccount dédié et automount du token désactivé si inutile.
- Images non-root, système racine en lecture seule et capabilities minimales.
- Policies appliquées progressivement avec tests de connectivité.
- Requests mesurées et quotas explicites par namespace.
- Dashboards par service, SLI et dépendance, pas par accumulation de graphes.
- Alertes avec seuil temporel, runbook et propriétaire.
- Audit périodique des droits avec `kubectl auth can-i`.

## Résumé

La production exige plusieurs couches : identité RBAC, contraintes du conteneur, segmentation réseau, ressources et politiques de disponibilité. Logs, métriques et traces répondent à des questions complémentaires. Les alertes doivent refléter un impact ou une menace crédible. Ces garde-fous deviennent réellement utiles lorsqu’ils sont automatisés dans la livraison continue.

<!-- snippet
id: kubernetes_can_i_serviceaccount
type: command
tech: kubernetes
level: advanced
importance: high
format: knowledge
tags: kubernetes,rbac,serviceaccount
title: Tester un droit de ServiceAccount
command: kubectl auth can-i <VERBE> <RESSOURCE> --as=system:serviceaccount:<NAMESPACE>:<COMPTE> -n <NAMESPACE>
example: kubectl auth can-i get secrets --as=system:serviceaccount:demo:web -n demo
description: Vérifie l'autorisation effective d'une identité sans supposer ses rôles.
-->
<!-- snippet
id: kubernetes_networkpolicy_plugin
type: warning
tech: kubernetes
level: advanced
importance: high
format: knowledge
tags: kubernetes,networkpolicy,cni
title: NetworkPolicy dépend du réseau
content: Déclarer une NetworkPolicy sans plugin CNI compatible peut ne filtrer aucun trafic ; vérifier l'implémentation puis tester les flux autorisés et bloqués.
description: L'objet API seul ne garantit pas l'application de la politique réseau.
-->
<!-- snippet
id: kubernetes_pdb_scope
type: concept
tech: kubernetes
level: advanced
importance: medium
format: knowledge
tags: kubernetes,pdb,availability
title: Ce que protège un PDB
content: Un PodDisruptionBudget limite les disruptions volontaires simultanées ; il ne crée pas de réplica et ne couvre pas une panne brutale de nœud.
description: Sa protection dépend d'un workload déjà répliqué et sain.
-->
<!-- snippet
id: observability_three_signals
type: concept
tech: kubernetes
level: advanced
importance: high
format: knowledge
tags: observability,logs,metrics,traces
title: Logs, métriques et traces
content: Logs décrivent des événements, métriques quantifient une évolution, traces suivent une requête distribuée ; les trois signaux répondent à des questions différentes.
description: Les corréler accélère le passage du symptôme à la dépendance fautive.
-->
<!-- snippet
id: kubernetes_alert_on_symptoms
type: tip
tech: kubernetes
level: advanced
importance: high
format: knowledge
tags: kubernetes,alerting,sli
title: Alerter sur les symptômes
content: Déclencher l'astreinte sur erreurs, latence ou disponibilité soutenues ; conserver CPU et mémoire comme signaux de capacité avec une sévérité moindre.
description: Une ressource élevée sans impact utilisateur ne justifie pas toujours un réveil.
-->
