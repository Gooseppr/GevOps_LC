---
layout: page
title: "PromQL pour l'analyse opérationnelle"

course: grafana
chapter_title: "Intermédiaire"

chapter: 2
section: 1

tags: promql,prometheus,grafana,observabilite,metriques
difficulty: intermediate
duration: 90
mermaid: true

status: "published"
prev_module: "/courses/grafana/12_projet_supervision_linux.html"
prev_module_title: "Projet pratique — Supervision d'un serveur Linux"
next_module: "/courses/grafana/14_loki_logql.html"
next_module_title: "Loki et LogQL opérationnel"
---

{% raw %}
# PromQL pour l'analyse opérationnelle

## Objectifs pédagogiques

À la fin de ce module, vous saurez :

- **distinguer** une instant query d'une range query, et choisir le bon mode selon le panel Grafana ;
- **construire** un taux d'erreurs fiable, y compris quand une série disparaît faute d'erreurs ;
- **appliquer** `on()`, `ignoring()` et `group_left()` pour combiner des séries aux labels différents ;
- **diagnostiquer** une erreur de correspondance many-to-many ou un résultat vide après une jointure ;
- **calculer** un percentile à partir d'un histogramme, comparer avec le passé (`offset`, sous-requêtes) et **décider** quand passer par une recording rule.

## Mise en situation

Vous reprenez le dashboard « Santé API » d'une application e-commerce fictive : trois services (`checkout`, `catalog`, `auth`) tournent sur plusieurs machines. Le module précédent vous a laissé un Prometheus qui scrape déjà des métriques système. Les applications exposent maintenant :

- `http_requests_total{service, status, method, instance}` (compteur) ;
- `http_request_duration_seconds_bucket{service, le, instance}` (histogramme) ;
- les métriques système de `node_exporter`, dont `node_uname_info`.

L'équipe d'astreinte vous demande quatre choses : un taux d'erreurs par service, un p95 de latence, une comparaison avec la même heure la semaine dernière, et un tableau des machines affichant leur nom lisible plutôt que `10.0.3.17:9100`. Le dashboard commence aussi à ramer, et il faudra comprendre pourquoi. Les chiffres de ce module sont purement illustratifs.

## Contexte : pourquoi `rate()` et `sum()` ne suffisent plus

Avec `rate()` et `sum by`, vous répondez à « combien ? ». L'analyse d'incident pose d'autres questions :

- Quelle **proportion** des requêtes échoue ?
- C'est **pire que d'habitude** ?
- Quelle est la latence subie par **95 % des utilisateurs** ?
- À **quelle machine** appartient cette série ?

Presque toutes ces questions demandent de combiner deux séries, ce qui pose la question de leur correspondance. Les requêtes deviennent aussi plus coûteuses, donc on cherche à précalculer une partie du travail. Le module suit ce fil : lire des résultats sans les confondre, combiner, comparer dans le temps, puis optimiser.

```mermaid
flowchart LR
    A[Cibles scrapées] --> B[Prometheus stocke les séries brutes]
    B --> C[Règles évaluées à intervalle fixe]
    C --> D[Nouvelles séries précalculées]
    B --> E[Grafana requête]
    D --> E
```

## Instant query et range query

Le vocabulaire prête à confusion, car `[5m]` dans `rate(x[5m])` n'a rien à voir avec une range query. Ce `[5m]` est un **sélecteur de plage** : la fenêtre de données que la fonction lit à *un* instant donné.

- Une **instant query** évalue l'expression à un seul timestamp et renvoie une valeur par série.
- Une **range query** évalue la même expression à chaque pas (`step`) entre un début et une fin, et renvoie une suite de points par série.

Une range query, c'est donc une instant query répétée à intervalles réguliers. Par l'API :

```bash
# Instant query : valeur au moment <T>, ou maintenant si omis
curl -G 'http://localhost:9090/api/v1/query' \
  --data-urlencode 'query=sum by (service) (rate(http_requests_total[5m]))'

# Range query : même expression évaluée toutes les 60 s sur 1 h
curl -G 'http://localhost:9090/api/v1/query_range' \
  --data-urlencode 'query=sum by (service) (rate(http_requests_total[5m]))' \
  --data-urlencode 'start=2025-01-15T10:00:00Z' \
  --data-urlencode 'end=2025-01-15T11:00:00Z' \
  --data-urlencode 'step=60s'
```

Dans Grafana, un panel **Time series** envoie une range query. Un panel **Stat**, **Gauge** ou **Table** n'a souvent besoin que de la valeur courante, donc d'une instant query. Dans l'éditeur de requêtes Prometheus, l'option *Type* (Range, Instant ou Both) permet de choisir. Son emplacement exact varie selon la version de Grafana.

🧠 **Concept clé** : un « graphique » est une pile d'instant queries. Si une expression est lente, elle l'est à chaque pas. Une range query de 6 h avec un pas de 15 s évalue l'expression 1 440 fois.

💡 Dans un panel Grafana, remplacez les fenêtres fixes par `$__rate_interval` : `rate(http_requests_total[$__rate_interval])`. Grafana calcule alors une fenêtre cohérente avec l'intervalle de scrape et le niveau de zoom, ce qui évite les graphiques troués quand on zoome fort.

## Construire un taux d'erreurs fiable

Un taux d'erreurs semble simple à écrire. En pratique il se construit en trois versions.

**v1 : global et naïf**

```promql
# Débit d'erreurs 5xx divisé par le débit total, tous services confondus
sum(rate(http_requests_total{status=~"5.."}[5m]))
/
sum(rate(http_requests_total[5m]))
```

Ça marche, mais un seul chiffre global masque un service qui s'effondre au milieu de deux services sains.

**v2 : par service**

```promql
# Même calcul, mais une valeur par service
sum by (service) (rate(http_requests_total{status=~"5.."}[5m]))
/
sum by (service) (rate(http_requests_total[5m]))
```

Les deux côtés portent exactement le même label (`service`), donc la correspondance se fait toute seule.

Le piège vient des services sans erreur. Quand `catalog` n'a aucune 5xx, la série du numérateur n'existe tout simplement pas, car `rate()` sur une série absente ne renvoie rien. Le résultat de la division pour `catalog` est alors **absent**, et non 0 %. Un panel qui devrait afficher « 0 % » reste vide, et une alerte construite dessus ne se déclenche jamais, ce qui est pire.

**v3 : robuste**

```promql
# Le numérateur est complété par des zéros pour les services sans erreur
(
    sum by (service) (rate(http_requests_total{status=~"5.."}[5m]))
  or
    sum by (service) (rate(http_requests_total[5m])) * 0
)
/
sum by (service) (rate(http_requests_total[5m]))
```

L'opérateur `or` garde toutes les séries de gauche, puis ajoute celles de droite dont les labels n'existent pas à gauche. Le `* 0` transforme le débit total en zéros. Les services sans 5xx reçoivent donc un 0 explicite.

⚠️ **Erreur fréquente** : un service sans trafic donne `0 / 0`, soit `NaN`. Ajoutez un filtre `> 0` sur le dénominateur ou conditionnez l'alerte au trafic (voir les cas d'utilisation). Ne masquez pas ce `NaN` avec une valeur par défaut : « pas de trafic » et « pas d'erreurs » sont deux situations différentes.

## Vector matching : faire se rencontrer deux séries

Dès que vous écrivez `A / B`, `A * B` ou `A > B` avec deux vecteurs, Prometheus doit décider quelle série de gauche rencontre quelle série de droite. Pensez à un annuaire : pour fusionner deux listes de personnes, il faut un critère de rapprochement, sinon on ne sait pas qui apparier.

**La règle par défaut** : deux séries se correspondent si elles ont **exactement les mêmes labels**, le nom de métrique étant ignoré. C'est une correspondance one-to-one. Elle fonctionne quand les deux côtés ont la même forme, comme `node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes`.

Quand les labels diffèrent, on précise le critère :

- `on(l1, l2)` : ne comparer **que** sur ces labels ;
- `ignoring(l1)` : comparer sur **tous sauf** ceux-là.

🧠 **Concept clé** : `on()` liste ce qui doit être égal, `ignoring()` liste ce qui peut différer. Pour l'appariement, les deux reviennent au même. Ce n'est pas le cas pour le résultat : en correspondance one-to-one, `on()` ne conserve que les labels listés, alors que `ignoring()` conserve tous les autres. Choisissez selon les labels dont vous avez besoin en sortie (légendes, jointures suivantes).

### Many-to-one avec `group_left`

Un cas se présente souvent : plusieurs séries à gauche pour une seule à droite. Exemple, la part de chaque mode CPU dans l'activité totale d'une machine.

```promql
# Gauche : une série par (instance, mode)
sum by (instance, mode) (rate(node_cpu_seconds_total[5m]))
/ ignoring(mode) group_left
# Droite : une seule série par instance
sum by (instance) (rate(node_cpu_seconds_total[5m]))
```

Sans `group_left`, Prometheus refuse : à gauche, plusieurs séries partageraient la même clé de correspondance (`instance`) et il ne devine pas votre intention. `group_left` dit « oui, le côté gauche a plusieurs séries par clé, c'est voulu ». Son symétrique `group_right` s'utilise quand le côté « many » est à droite.

### Enrichir une série avec des labels : le pattern « info »

Le second usage de `group_left` est le plus courant en exploitation. Certaines métriques valent toujours 1 et ne servent qu'à porter des labels descriptifs. `node_uname_info` fait partie de cette famille : elle contient `nodename`, `release`, etc. On multiplie par 1, donc la valeur ne change pas, et on recopie les labels voulus :

```promql
# Charge CPU par machine, avec le nom lisible de l'hôte
sum by (instance) (rate(node_cpu_seconds_total{mode!="idle"}[5m]))   # gauche : valeurs
* on(instance) group_left(nodename)                                   # on joint sur instance, on copie nodename
node_uname_info                                                       # droite : une série par instance, valeur 1
```

Les labels listés entre parenthèses après `group_left` sont copiés du côté droit vers le résultat. Dans le panel, la légende peut alors utiliser `{{nodename}}`.

💡 La multiplication par une métrique « info » est préférable à une addition : multiplier par 1 laisse la valeur intacte, alors qu'additionner la fausserait.

### ⚠️ Jointures many-to-many et erreurs de correspondance

Le message que tout le monde finit par rencontrer ressemble à ceci (le libellé exact varie selon la version) :

```text
found duplicate series for the match group {instance="10.0.3.17:9100"} on the right hand side of the operation:
[{...nodename="web-01", release="5.15"}, {...nodename="web-01", release="5.19"}];
many-to-many matching not allowed: matching labels must be unique on one side
```

Il signifie que, pour une clé de correspondance, **les deux côtés** contiennent plusieurs séries. Même avec `group_left`, le côté « one » doit réellement être unique. Les causes courantes :

- une série « info » dont un label a changé (mise à jour du noyau, redéploiement) : l'ancienne et la nouvelle peuvent coexister brièvement. C'est le cas dans une fonction sur plage qui couvre le changement, ou quand Prometheus n'a pas pu marquer l'ancienne série comme périmée (staleness marker). Elle reste alors visible pendant la fenêtre de lookback (5 min par défaut) ;
- le même `instance` apparu sous deux `job` différents ;
- un `on()` trop pauvre qui regroupe des séries pourtant distinctes.

La méthode de diagnostic est toujours la même : exécutez **chaque côté séparément** dans Explore en mode Instant (vue Table) et comparez les ensembles de labels. Pour trouver les doublons côté droit :

```promql
# Toute clé qui apparaît plus d'une fois est un suspect
count by (instance) (node_uname_info) > 1
```

Deux corrections sont possibles : rendre la clé plus précise (`on(instance, job)`), ou dédoublonner avant de joindre, par exemple avec `max by (instance, nodename) (node_uname_info)`.

L'erreur inverse est **silencieuse** : si aucune paire de labels ne correspond (un côté porte `instance="web-01:9100"`, l'autre `instance="web-01"`), le résultat est simplement vide, sans message. Un résultat vide après une jointure doit toujours faire penser à des labels qui ne s'alignent pas.

💡 Les opérateurs ensemblistes `and`, `or` et `unless` fonctionnent différemment : ils sont many-to-many par nature et n'ont pas besoin de `group_left`. On les utilise pour des conditions, pas pour calculer.

## Comparer dans le temps : offset, comparaisons et sous-requêtes

### `offset` : regarder en arrière

`offset` décale l'évaluation d'une sélection dans le passé. Il se place **juste après** le sélecteur, y compris après une plage :

```promql
# Trafic actuel rapporté au trafic à la même heure, il y a 7 jours
sum(rate(http_requests_total[5m]))
/
sum(rate(http_requests_total[5m] offset 1w))
```

Sur un graphique, chaque point est comparé au point correspondant d'une semaine plus tôt. Un résultat à 1,0 signifie « comme d'habitude », 0,4 « bien en dessous de la normale ». C'est une comparaison bien plus parlante qu'un seuil fixe pour un trafic qui varie selon l'heure et le jour.

### Comparaisons : filtrer ou produire 0/1

Appliquée à un vecteur, une comparaison **filtre** : seules les séries qui satisfont la condition restent.

```promql
up == 0                    # ne garde que les cibles qui ne répondent pas
sum by (service) (rate(http_requests_total[5m])) > 100   # services au-dessus de 100 req/s
```

Avec le modificateur `bool`, la comparaison renvoie au contraire 0 ou 1 pour chaque série, ce qui sert pour un panel d'état :

```promql
sum by (service) (rate(http_requests_total[5m])) > bool 100
```

Quand les deux côtés sont des vecteurs, les règles de correspondance de la section précédente s'appliquent aussi.

### Sous-requêtes : une range query dans une expression

Une fonction comme `max_over_time()` attend un vecteur de plage, mais `rate(...)` produit un vecteur instantané. La sous-requête comble cet écart avec la syntaxe `<expression>[<durée>:<pas>]` :

```promql
# Pic du taux d'erreurs observé sur la dernière heure, évalué toutes les minutes
max_over_time(
  (
    sum by (service) (rate(http_requests_total{status=~"5.."}[5m]))
    /
    sum by (service) (rate(http_requests_total[5m]))
  )[1h:1m]
)
```

Le coût est caché : l'expression interne est évaluée 60 fois (1 h ÷ 1 min) **pour chaque point** du graphique. Sur une plage d'affichage de 24 h, la charge explose. Une sous-requête convient pour explorer, ou pour une valeur unique dans un panel Stat. Si vous la mettez dans un panel de dashboard très consulté, c'est qu'il vous faut une recording rule.

## Percentiles issus des histogrammes

Un histogramme Prometheus ne stocke pas de latences individuelles. Il compte, pour chaque seuil `le` (« less than or equal »), le nombre de requêtes plus rapides que ce seuil. Les buckets sont **cumulatifs** : `le="0.5"` inclut tout ce qui est dans `le="0.1"`.

Pour estimer le p95 :

```promql
histogram_quantile(
  0.95,                                                                # quantile voulu
  sum by (le, service) (rate(http_request_duration_seconds_bucket[5m]))  # on garde le ET les labels voulus
)
```

Trois points à ancrer :

- **Gardez toujours `le`** dans le `sum by`. Sans lui, la fonction n'a plus de buckets à interpoler et le résultat est vide ou absurde.
- **Agrégez les buckets, jamais les percentiles.** La moyenne de trois p95 (un par instance) ne vaut pas le p95 global. Sommez les débits de buckets d'abord, calculez le quantile ensuite.
- **La précision dépend des seuils choisis à l'instrumentation.** `histogram_quantile` interpole linéairement *dans* le bucket qui contient le quantile. Avec des buckets à 0,5 s et 1 s, un p95 estimé à 0,87 s peut en réalité valoir 0,6 s ou 0,99 s. Si le quantile tombe dans le bucket `+Inf`, la fonction renvoie la plus grande borne finie, ce qui sous-estime la réalité.

Pour la latence **moyenne**, deux compteurs suffisent (`_sum` et `_count`) :

```promql
# Latence moyenne par service
sum by (service) (rate(http_request_duration_seconds_sum[5m]))
/
sum by (service) (rate(http_request_duration_seconds_count[5m]))
```

La moyenne cache les pics de latence qui touchent une minorité d'utilisateurs, d'où l'intérêt du p95. Les histogrammes natifs, plus récents, changent la syntaxe et dépendent de la version de Prometheus : le principe reste valable, mais vérifiez la documentation de votre version.

## Recording rules : précalculer ce qui coûte cher

Une recording rule demande à Prometheus d'évaluer une expression à intervalle régulier et de **stocker le résultat comme une nouvelle série**. Un dashboard qui relit une série déjà calculée est bien plus rapide qu'un dashboard qui recalcule `histogram_quantile` sur toutes les séries de buckets à chaque rafraîchissement.

Deux situations justifient d'en créer :

- une expression lourde exécutée souvent (panels visibles par beaucoup de monde, rafraîchissement automatique) ;
- une expression utilisée à plusieurs endroits (dashboard et alerte), qui doit donner **exactement** le même résultat partout.

Fichier de règles :

```yaml
# rules/http.yml
groups:
  - name: http_aggregations
    interval: 30s                      # fréquence d'évaluation du groupe
    rules:
      # Convention de nommage : niveau:métrique:opérations
      - record: service:http_requests:rate5m
        expr: sum by (service) (rate(http_requests_total[5m]))

      - record: service:http_errors:rate5m
        expr: sum by (service) (rate(http_requests_total{status=~"5.."}[5m]))

      - record: service:http_request_duration_seconds:p95_5m
        expr: >
          histogram_quantile(0.95,
            sum by (le, service) (rate(http_request_duration_seconds_bucket[5m])))
```

Référencement dans `prometheus.yml`, validation, puis rechargement :

```bash
# Dans prometheus.yml :
#   rule_files:
#     - "rules/*.yml"

# Valider la syntaxe avant tout déploiement
promtool check rules rules/http.yml

# Recharger sans redémarrer (nécessite --web.enable-lifecycle au démarrage)
curl -X POST http://localhost:9090/-/reload
```

Le nom `service:http_requests:rate5m` suit une convention lisible : il dit sur quel label on a agrégé (`service`), quelle métrique est utilisée et quelle opération a été faite (`rate5m`).

Deux limites sont à connaître :

- La série n'existe **qu'à partir du moment où la règle est active**. Il n'y a pas de rétroactivité : votre graphique sur 30 jours sera vide avant le déploiement.
- Enregistrez le numérateur et le dénominateur séparément, et faites la division à la lecture. Un ratio pré-enregistré ne peut plus être agrégé correctement (la moyenne de deux ratios n'est pas le ratio des sommes).

💡 Avec ces recording rules en place, la sous-requête du pic d'erreurs devient bien moins coûteuse : `max_over_time((service:http_errors:rate5m / service:http_requests:rate5m)[1h:1m])` ne relit que des séries déjà agrégées. Cette économie est une bonne raison de précalculer.

## Cas d'utilisation

**1. Panel Stat « Taux d'erreurs actuel » du service `checkout`**

Mode *Instant*, car on veut une seule valeur :

```promql
# Part des requêtes en 5xx sur la fenêtre $__rate_interval, pour un service sélectionné
sum(rate(http_requests_total{service="checkout", status=~"5.."}[$__rate_interval]))
/
sum(rate(http_requests_total{service="checkout"}[$__rate_interval]))
```

Résultat attendu : une valeur comme `0.012`, à afficher en pourcentage (unité *Percent (0.0-1.0)* du panel).

**2. Condition d'alerte : erreurs élevées *et* trafic suffisant**

Un service quasi inactif peut afficher 50 % d'erreurs sur 2 requêtes. On conditionne donc :

```promql
(
  service:http_errors:rate5m / service:http_requests:rate5m > 0.05   # plus de 5 % d'erreurs
)
and on(service)
(
  service:http_requests:rate5m > 1                                   # et plus de 1 req/s
)
```

Résultat attendu : une série par service en difficulté, et un vecteur vide quand tout va bien. Le détail de l'évaluation des alertes viendra dans les modules dédiés.

**3. Table des machines avec nom lisible et valeur de la semaine dernière**

Deux requêtes en mode Instant, regroupées par une transformation Grafana (traitée plus loin dans le parcours) :

```promql
# Requête A : CPU actuel, avec nodename
sum by (instance) (rate(node_cpu_seconds_total{mode!="idle"}[5m]))
* on(instance) group_left(nodename) node_uname_info

# Requête B : CPU il y a 7 jours, même jointure
sum by (instance) (rate(node_cpu_seconds_total{mode!="idle"}[5m] offset 1w))
* on(instance) group_left(nodename) node_uname_info
```

Résultat attendu : un tableau où `web-01` apparaît avec ses deux valeurs côte à côte, ce qui permet de repérer une machine plus chargée qu'à l'habitude.

## Erreurs fréquentes

**Symptôme** : `many-to-many matching not allowed` ou `multiple matches for labels`.
**Cause** : plusieurs séries partagent la même clé de correspondance côté droit, ou côté gauche sans `group_left`.
**Correction** : inspectez chaque côté seul en mode Instant, repérez les doublons avec `count by (<LABEL>) (<METRIC>) > 1`, puis resserrez le `on()` ou dédoublonnez avec `max by (...)`.

**Symptôme** : le taux d'erreurs d'un service sain n'apparaît pas dans le panel.
**Cause** : la série d'erreurs n'existe pas, donc la division ne produit rien.
**Correction** : complétez le numérateur avec `or <total> * 0` (version v3 plus haut).

**Symptôme** : `histogram_quantile` renvoie un résultat vide ou `NaN`.
**Cause** : le label `le` a disparu dans l'agrégation, ou aucune requête n'a été observée dans la fenêtre.
**Correction** : écrivez `sum by (le, ...) (rate(..._bucket[...]))` et vérifiez que le trafic est non nul.

**Symptôme** : une jointure donne un résultat vide, sans erreur.
**Cause** : les valeurs de labels ne s'alignent pas (`web-01:9100` contre `web-01`).
**Correction** : comparez les labels des deux côtés dans la vue Table. Si besoin, normalisez avec `label_replace()`.

**Symptôme** : la valeur d'un panel Stat ne correspond pas au dernier point du graphique voisin.
**Cause** : les deux panels n'utilisent pas le même mode (Range pour l'un, Instant pour l'autre), ou des fenêtres de `rate` différentes.
**Correction** : alignez la fenêtre (`$__rate_interval` partout) et vérifiez le champ *Type* de chaque requête.

💡 **Astuce** : dans Explore, passez en mode *Both* pour afficher le graphique et la table instantanée en même temps. Le graphique révèle la tendance, la table révèle les labels exacts, ce qui accélère beaucoup le débogage de correspondances.

## Bonnes pratiques

- **Testez chaque moitié d'une jointure seule avant de les combiner.** Cela isole immédiatement les problèmes de labels.
- **Préférez `on()` à `ignoring()` pour les jointures stables.** `ignoring()` s'adapte silencieusement quand quelqu'un ajoute un label sur une des métriques, `on()` reste prévisible.
- **Utilisez `$__rate_interval` dans Grafana, une durée fixe dans les règles.** Une règle n'a pas de contexte d'affichage : `5m` y est un choix explicite et documentable.
- **Précalculez ce qui est lourd *et* partagé.** Une expression légère utilisée une seule fois n'a pas besoin de recording rule : chaque règle ajoute une série à stocker et un fichier à maintenir.
- **Nommez vos règles selon `niveau:métrique:opérations`.** Un nom comme `service:http_requests:rate5m` se comprend sans ouvrir le fichier.
- **Validez avec `promtool check rules` en intégration continue.** Une règle invalide empêche le rechargement de la configuration.
- **Évitez les sous-requêtes dans les dashboards partagés.** Gardez-les pour l'investigation.
- **Conditionnez les alertes de ratio au volume de trafic.** Un pourcentage seul n'a aucun sens sans dénominateur significatif.

## Résumé

| Concept | Ce qu'il fait | À retenir |
|---|---|---|
| Instant / range query | Évalue une expression à un instant ou à chaque pas d'un intervalle | `[5m]` est une fenêtre de calcul, pas une range query |
| `on()` / `ignoring()` | Définit les labels qui servent à apparier deux séries | Sans eux, tous les labels doivent être identiques |
| `group_left()` | Autorise plusieurs séries à gauche pour une à droite, copie des labels | Le côté « one » doit être réellement unique |
| `offset` | Décale la lecture dans le passé | Se place après le sélecteur : `x[5m] offset 1w` |
| Sous-requête | `expr[durée:pas]`, transforme une expression en vecteur de plage | Coût multiplié par le nombre de pas internes |
| `histogram_quantile` | Estime un percentile par interpolation entre buckets | Garder `le`, agréger les buckets avant, jamais les percentiles |
| Recording rule | Stocke le résultat d'une expression comme nouvelle série | Pas de rétroactivité, nommer `niveau:métrique:opérations` |

Pour retenir l'essentiel : une requête d'analyse fiable commence par vérifier que ses deux côtés ont la même forme de labels, puis se demande si elle est assez légère pour être recalculée à chaque rafraîchissement, et sinon la précalcule.

<!-- snippet
id: promql_query_instant_vs_range
type: concept
tech: promql
level: intermediate
importance: high
format: knowledge
tags: promql,grafana,instant-query,range-query
title: Instant query ou range query : ce qui change
content: Une instant query évalue l'expression à un seul timestamp et renvoie une valeur par série (API /api/v1/query). Une range query répète cette évaluation à chaque step entre start et end (/api/v1/query_range) et renvoie une matrice de points. Un panel Time series envoie une range query ; Stat, Gauge et Table n'ont souvent besoin que d'une instant query. Ne pas confondre avec la fenêtre [5m] de rate(), qui est interne à chaque évaluation.
description: Un graphique est une instant query répétée à chaque pas : le coût d'une expression est donc multiplié par le nombre de points affichés.
-->

<!-- snippet
id: promql_matching_on_ignoring
type: concept
tech: promql
level: intermediate
importance: high
format: knowledge
tags: promql,vector-matching,on,ignoring
title: Correspondance par défaut entre deux vecteurs
content: Par défaut, A / B apparie deux séries uniquement si tous leurs labels sont identiques (le nom de métrique est ignoré). on(l1,l2) restreint la comparaison à ces labels ; ignoring(l1) l'exclut de la comparaison. Si plusieurs séries partagent la même clé d'un côté, Prometheus lève une erreur de correspondance.
description: on() liste ce qui doit être égal, ignoring() ce qui peut différer. En one-to-one, on() ne garde que les labels listés dans le résultat, ignoring() garde tous les autres.
-->

<!-- snippet
id: promql_group_left_enrich_nodename
type: command
tech: promql
level: intermediate
importance: high
format: knowledge
tags: promql,group-left,vector-matching,node-exporter
title: Ajouter le nom d'hôte à une série avec group_left
context: Éditeur de requêtes Prometheus dans Grafana (Explore ou panel), avec node_exporter scrapé
command: <EXPRESSION_PAR_INSTANCE> * on(instance) group_left(<LABEL_A_COPIER>) <METRIQUE_INFO>
example: sum by (instance) (rate(node_cpu_seconds_total{mode!="idle"}[5m])) * on(instance) group_left(nodename) node_uname_info
description: Multiplier par une métrique info (valeur 1) laisse la valeur intacte et copie les labels listés dans group_left() vers le résultat.
-->

<!-- snippet
id: promql_many_to_many_duplicate_series
type: error
tech: promql
level: intermediate
importance: high
format: knowledge
tags: promql,vector-matching,debug,many-to-many
title: Erreur many-to-many après une jointure
content: Symptôme : "found duplicate series for the match group ... many-to-many matching not allowed". Cause : le côté censé être unique contient plusieurs séries pour la même clé, par exemple une métrique info dont un label a changé et dont l'ancienne série n'est pas encore périmée. Correction : repérer les doublons avec count by (instance) (node_uname_info) > 1, puis resserrer le on() ou dédoublonner avec max by (instance, nodename) (...).
description: Même avec group_left, le côté "one" doit être unique pour chaque clé. Inspecter chaque côté séparément en vue Table révèle le doublon.
-->

<!-- snippet
id: promql_join_empty_result_labels
type: warning
tech: promql
level: intermediate
importance: medium
format: knowledge
tags: promql,vector-matching,debug,labels
title: Jointure silencieusement vide
content: Piège : si aucune paire de séries n'a des labels qui correspondent (instance="web-01:9100" d'un côté, instance="web-01" de l'autre), le résultat est vide sans message d'erreur. Conséquence : un panel ou une alerte qui ne montre rien. Correction : afficher chaque côté en vue Table, comparer les valeurs de labels, normaliser avec label_replace() si besoin.
description: Un résultat vide après une jointure vient presque toujours de labels qui ne s'alignent pas, pas d'une absence de données.
-->

<!-- snippet
id: promql_error_ratio_missing_series
type: error
tech: promql
level: intermediate
importance: high
format: knowledge
tags: promql,taux-erreurs,ratio,alerting
title: Taux d'erreurs absent pour un service sans 5xx
content: Symptôme : un service sain n'apparaît pas dans le panel de taux d'erreurs. Cause : rate() sur une série inexistante ne renvoie rien, donc la division n'a pas de numérateur pour ce service. Correction : compléter le numérateur avec or, par exemple (sum by (service) (rate(http_requests_total{status=~"5.."}[5m])) or sum by (service) (rate(http_requests_total[5m])) * 0) / sum by (service) (rate(http_requests_total[5m])).
description: Sans complétion par zéros, une alerte basée sur ce ratio ne peut jamais se déclencher pour le service concerné.
-->

<!-- snippet
id: promql_histogram_quantile_p95
type: command
tech: promql
level: intermediate
importance: high
format: knowledge
tags: promql,histogram,percentile,latence
title: Calculer un p95 par service à partir d'un histogramme
context: Métrique d'histogramme exposant des séries <METRIQUE>_bucket avec le label le
command: histogram_quantile(<QUANTILE>, sum by (le, <LABEL>) (rate(<METRIQUE>_bucket[$__rate_interval])))
example: histogram_quantile(0.95, sum by (le, service) (rate(http_request_duration_seconds_bucket[$__rate_interval])))
description: Le label le doit rester dans le sum by, sinon la fonction n'a plus de buckets à interpoler.
-->

<!-- snippet
id: promql_histogram_percentile_aggregation
type: warning
tech: promql
level: intermediate
importance: high
format: knowledge
tags: promql,histogram,percentile,agregation
title: Ne jamais moyenner des percentiles
content: Piège : calculer un p95 par instance puis en faire la moyenne (avg) ou la somme. Conséquence : une valeur qui ne correspond à aucun percentile réel, souvent trop optimiste. Correction : sommer d'abord les débits de buckets avec sum by (le, ...) (rate(..._bucket[5m])), puis appliquer histogram_quantile sur le résultat.
description: Les percentiles ne s'agrègent pas : on agrège les buckets, on calcule le quantile en dernier.
-->

<!-- snippet
id: promql_offset_week_comparison
type: command
tech: promql
level: intermediate
importance: medium
format: knowledge
tags: promql,offset,comparaison,trafic
title: Comparer le trafic à la même heure la semaine passée
command: sum(rate(<METRIQUE>[5m])) / sum(rate(<METRIQUE>[5m] offset 1w))
example: sum(rate(http_requests_total[5m])) / sum(rate(http_requests_total[5m] offset 1w))
description: Un résultat proche de 1 signifie un trafic habituel, 0,4 un trafic à 40 % de la normale. offset se place après la plage [5m].
-->

<!-- snippet
id: promql_subquery_cost
type: warning
tech: promql
level: intermediate
importance: medium
format: knowledge
tags: promql,sous-requete,performance,dashboard
title: Le coût caché d'une sous-requête
content: Piège : utiliser max_over_time(<expr>[1h:1m]) dans un panel Time series. Conséquence : l'expression interne est évaluée 60 fois pour chaque point du graphique, la charge sur Prometheus explose sur une plage de 24 h. Correction : réserver les sous-requêtes à l'exploration ou à un panel Stat, et créer une recording rule pour les panels très consultés.
description: Une sous-requête [1h:1m] multiplie par 60 le nombre d'évaluations de l'expression interne, à chaque pas du graphique.
-->

<!-- snippet
id: promql_recording_rule_naming
type: concept
tech: promql
level: intermediate
importance: medium
format: knowledge
tags: promql,recording-rules,prometheus,performance
title: Recording rule : ce qu'elle stocke et ses limites
content: Une recording rule est évaluée par Prometheus à l'intervalle de son groupe (ex. 30s) et son résultat est stocké comme nouvelle série, nommée par convention niveau:métrique:opérations (service:http_requests:rate5m). Les dashboards lisent alors une série déjà calculée. Limite : la série n'existe qu'à partir du déploiement de la règle, sans rétroactivité. Enregistrer numérateur et dénominateur séparément plutôt qu'un ratio.
description: Un dashboard qui lit une série précalculée évite de recalculer histogram_quantile sur tous les buckets à chaque rafraîchissement.
-->

<!-- snippet
id: promql_promtool_check_rules
type: command
tech: promql
level: intermediate
importance: medium
format: knowledge
tags: promql,promtool,recording-rules,validation
title: Valider un fichier de règles avant de recharger
context: À lancer avant tout rechargement de Prometheus, idéalement en intégration continue
command: promtool check rules <FICHIER_REGLES>
example: promtool check rules rules/http.yml
description: Détecte une erreur de syntaxe ou d'expression avant qu'elle ne bloque le rechargement de la configuration Prometheus.
-->

<!-- snippet
id: grafana_rate_interval_variable
type: tip
tech: grafana
level: intermediate
importance: medium
format: knowledge
tags: grafana,promql,rate,dashboard
title: Utiliser $__rate_interval dans les panels
content: Dans un panel Grafana, écrire rate(http_requests_total[$__rate_interval]) au lieu de [5m] fixe. Grafana adapte la fenêtre à l'intervalle de scrape et au zoom, ce qui évite les graphiques troués en zoomant. Dans un fichier de règles Prometheus, la variable n'existe pas : y écrire une durée explicite comme [5m].
description: $__rate_interval n'existe que côté Grafana. Les recording rules et alertes Prometheus exigent une durée explicite.
-->
{% endraw %}
