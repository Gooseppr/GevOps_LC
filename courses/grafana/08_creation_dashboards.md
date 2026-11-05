---
layout: page
title: "Création de dashboards et panels"

course: grafana
chapter_title: "Fondations"

chapter: 1
section: 8

tags: grafana,dashboards,panels,visualisation,prometheus
difficulty: beginner
duration: 75
mermaid: true

status: "published"
prev_module: "/courses/grafana/07_premieres_requetes_promql.html"
prev_module_title: "Premières requêtes PromQL"
next_module: "/courses/grafana/09_variables_filtres.html"
next_module_title: "Variables, filtres et navigation dynamique"
---

{% raw %}
# Création de dashboards et panels

## Objectifs pédagogiques

À la fin de ce module, vous serez capable de :

- **Créer** un dashboard organisé dans un dossier, avec des panels classés par ordre de lecture.
- **Choisir** entre Time series, Stat, Gauge, Table et Bar chart selon la question à laquelle le panel doit répondre.
- **Configurer** unités, thresholds, légendes et axes pour qu'un chiffre ne soit pas mal interprété.
- **Documenter** un dashboard avec titres, descriptions et liens, puis le sauvegarder, le dupliquer et l'exporter en JSON.
- **Évaluer** un dashboard avec un critère opérationnel plutôt qu'esthétique.

## Mise en situation

Vous venez de rejoindre l'équipe support Cloud d'une PME : quatre personnes, une vingtaine de serveurs Linux et un Prometheus qui collecte `node_exporter` depuis six mois. Les données sont là, et vous savez les interroger depuis le module précédent.

Mais pendant les incidents, tout le monde ouvre Explore, retape les mêmes requêtes de mémoire et se les échange par messagerie.

Un collègue a bien fait un dashboard « pour la démo » avec 35 panels, des jauges partout et des couleurs vives. Personne ne l'ouvre en incident, parce qu'on n'y trouve pas la réponse à « est-ce que ce serveur va mal ? ».

Une requête PromQL ne vaut que par ce qu'on en fait. Un dashboard fige une question utile, avec la bonne unité, les bons seuils et la bonne place dans la page. C'est ce qu'on construit ici, en commençant petit.

## Comment un dashboard est organisé

Que manipule-t-on exactement avant de cliquer ?

> 📖 **Définition**
>
> Un dashboard est un document JSON stocké par Grafana. Il contient des panels, et chaque panel contient une ou plusieurs requêtes vers une source de données.
{: .callout .callout-definition}

<div class="fig fig-dash" markdown="0" role="img" aria-label="Maquette d'un dashboard Grafana : un dossier contient un dashboard, organisé en rows contenant des panels">
<div class="fig-folder">📁 Dossier : Infra Linux</div>
<div class="fig-board">
<div class="fig-board-top"><strong>Dashboard : Serveur Linux</strong><span>Plage de temps · Rafraîchissement</span></div>
<div class="fig-rowtitle">▾ Row : Vue d'ensemble</div>
<div class="fig-panels">
<div class="fig-panel"><span class="fig-ptitle">Panel Stat : CPU</span><span class="fig-stat">42 %</span></div>
<div class="fig-panel"><span class="fig-ptitle">Panel Stat : Mémoire</span><span class="fig-stat">68 %</span></div>
<div class="fig-panel"><span class="fig-ptitle">Panel Stat : Disque</span><span class="fig-stat">55 %</span></div>
</div>
<div class="fig-rowtitle">▾ Row : Détail ressources</div>
<div class="fig-panel fig-panel-wide"><span class="fig-ptitle">Panel Time series : CPU par instance</span>
<svg viewBox="0 0 300 60" preserveAspectRatio="none" aria-hidden="true"><polyline points="0,45 40,40 80,44 120,28 160,33 200,15 240,25 300,18" fill="none" stroke="#2563eb" stroke-width="2"/></svg>
<span class="fig-query">Ce panel exécute une requête PromQL → Data source Prometheus</span></div>
</div>
</div>

*Maquette simplifiée, valeurs illustratives.* Les panels sont rangés dans des rows, à l'intérieur du dashboard. Chaque panel s'appuie sur une ou plusieurs requêtes envoyées à une source de données.


Le dossier sert surtout à regrouper les dashboards et à poser des permissions, ce qu'on verra au module d'administration. Les rows sont des sections repliables : elles servent à structurer la lecture, pas à décorer.

> 🧠 **Concept clé**
>
> Le dashboard n'est pas lié à une métrique, il est lié à une **question**. « Ce serveur est-il en bonne santé ? » est un bon dashboard. « Toutes les métriques de node_exporter » est un catalogue.
{: .callout .callout-important}

## Mise en place : créer le premier dashboard

On suppose ici que votre Grafana tourne (module 03) avec une source Prometheus fonctionnelle (module 05) qui reçoit des métriques `node_exporter`.

Le chemin dépend de la version, car l'interface a pas mal évolué récemment, mais le principe reste identique :

1. **Dashboards → New → New dashboard**.
2. **Add visualization**, puis choisir la source Prometheus.
3. Saisir la requête, choisir le type de visualisation, régler les options.
4. **Back to dashboard**, puis **Save dashboard** avec un titre et un dossier.

Dans certaines versions, il faut d'abord passer en mode **Edit** avant de pouvoir modifier un dashboard existant. Si vous ne voyez pas les boutons de modification, cherchez le bouton **Edit** en haut à droite.

Pour vérifier que ça marche, la première requête doit afficher une courbe en moins de quelques secondes :

```promql
100 * (1 - avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])))
```

Si le panel affiche « No data », ouvrez **Query inspector** dans le menu du panel : vous y voyez la requête réellement envoyée et la réponse brute de Prometheus. C'est le premier réflexe avant de soupçonner Grafana.

## Choisir le bon panel

Le type de panel se choisit en fonction de la question posée, jamais par goût. Voici ceux qu'on utilise 90 % du temps.

| Question | Panel | Requête Prometheus |
|----------|-------|--------------------|
| Comment ça évolue ? Y a-t-il eu un pic ? | **Time series** | Range (défaut) |
| Où en est-on, là, maintenant ? | **Stat** | Range ou Instant |
| Quel niveau par rapport à une limite connue ? | **Gauge** | Instant, avec min et max définis |
| Quels sont les détails, serveur par serveur ? | **Table** | Instant, Format *Table* |
| Qui consomme le plus ? | **Bar chart** | Instant, Format *Table* |

### Time series : le cheval de trait

C'est le panel qui répond à « que s'est-il passé ? ». Il est indispensable pour voir une tendance, un pic ou une corrélation entre deux courbes. Deux réglages valent le détour dès le départ :

- **Tooltip mode = All** avec tri décroissant : on voit toutes les séries au survol, la plus haute en premier.
- Un **Fill opacity** faible, pour que les courbes qui se croisent restent lisibles.

### Stat : un chiffre, une couleur

Stat réduit une série entière à **une seule valeur**. La façon de réduire est réglée par l'option **Calculation** (Last, Mean, Max, Min, etc.), et c'est le piège numéro un. Sur une période de 6 heures, « Mean » ne dit pas du tout la même chose que « Last » : un serveur saturé à 98 % depuis dix minutes aura une moyenne confortable de 40 %. Pour un indicateur d'état, on veut presque toujours la dernière valeur.

Stat se marie très bien avec les **value mappings** : pour `up{job="node"}`, vous pouvez afficher `UP` en vert quand la valeur est 1 et `DOWN` en rouge quand elle est 0. C'est bien plus lisible qu'un 0 ou un 1.

### Gauge : seulement si l'échelle a un sens

Une jauge n'a de sens que si la valeur a des bornes naturelles : un pourcentage de disque, de 0 à 100. Si vous ne fixez pas **Min** et **Max**, Grafana devine une échelle, et la jauge devient trompeuse. Pour un débit réseau sans plafond défini, utilisez un Stat ou une Time series.

```promql
100 * (1 - node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"})
```

### Table : le détail serveur par serveur

C'est le panel le plus mal utilisé par les débutants. Si vous gardez le type de requête **Range**, vous obtenez une ligne par timestamp, soit un tableau illisible. Réglez **Type = Instant** et **Format = Table** dans le query editor : une ligne par série, avec les labels en colonnes. Pour réorganiser ou masquer des colonnes, il existe des transformations, abordées au module 17. Ici, on se contente de l'option *Hide in table* des overrides, ou on laisse tel quel.

### Bar chart : comparer des catégories

Le Bar chart ne montre pas le temps, il compare des catégories (points de montage, serveurs, services). Même recette que la table : requête **Instant**, **Format = Table**, puis choisir dans les options quel champ texte sert d'axe X. Pour un classement, ajoutez un `topk(5, …)` à la requête.

```promql
topk(5, 100 * (1 - node_filesystem_avail_bytes{fstype!~"tmpfs|overlay"} / node_filesystem_size_bytes{fstype!~"tmpfs|overlay"}))
```

> ⚠️ **Erreur fréquente**
>
> Bar chart vide ou illisible. Cause : requête laissée en Range et format Time series, donc Grafana reçoit des courbes et non des catégories. Correction : Instant + Format Table, puis sélection du champ texte pour l'axe X. Selon les versions, le panel peut aussi proposer de lui-même une transformation : lisez le message d'avertissement dans le panel.
{: .callout .callout-attention}

## Le query editor et ses options

Le query editor a deux modes : **Builder** (guidé, parfait pour découvrir les métriques disponibles) et **Code** (saisie libre). Dès que vous savez écrire du PromQL, restez en Code : c'est plus rapide et plus précis.

Sous la requête, trois options reviennent tout le temps :

- **Legend** : en mode *Auto* (défaut), Grafana construit la légende à partir des labels qui diffèrent entre séries ; le mode *Verbose* affiche tous les labels, soit `{instance="web-01:9100", job="node"}`. Passez en mode *Custom* avec `{{instance}}` pour choisir exactement ce qui s'affiche, ici `web-01:9100` seulement.
- **Min step** : intervalle minimum entre deux points. Si vous forcez 5 s alors que Prometheus scrape toutes les 30 s, vous demandez des points qui n'existent pas.
- **Type** : Range pour les courbes, Instant pour les valeurs courantes (tables, bar charts), Both pour les deux.

> 🚗 **Analogie : le compteur et l'enregistreur de trajet**
>
> Une requête Instant lit le compteur : une seule valeur par série, faite pour un tableau ou un classement. Une requête Range consulte l'enregistreur de trajet : une suite de points sur la plage de temps, faite pour une courbe. Limite de l'image : la lecture Instant reprend la dernière valeur disponible dans les minutes précédentes, pas forcément une mesure prise à la seconde exacte.
{: .callout .callout-analogie}

Un panel peut contenir plusieurs requêtes (A, B, C…). C'est utile pour superposer, par exemple, le trafic entrant et sortant sur le même graphique.

## Unités, seuils, couleurs et axes

C'est la partie qui sépare un graphique lisible d'un graphique qui trompe. Tout se trouve dans le panneau d'options à droite, section **Standard options** et suivantes.

### Unités

Un chiffre sans unité est une énigme. Pour de la mémoire ou des octets, choisissez la variante binaire (base 1024) de *bytes* dans la catégorie Data : Grafana affichera automatiquement `3.2 GiB` plutôt que `3435973836`. Pour une durée, utilisez la catégorie Time (par exemple *duration (s)*, qui convertit une valeur en secondes en jours, heures, etc.).

> ⚠️ **Erreur fréquente**
>
> Une jauge de CPU affiche « 0.73 % » alors que la machine est à 73 %. Cause : l'unité *Percent (0-100)* est appliquée à une valeur comprise entre 0 et 1. Correction : soit multiplier la requête par 100 et garder *Percent (0-100)*, soit garder la requête brute et utiliser *Percent (0.0-1.0)*.
{: .callout .callout-attention}

### Thresholds et couleurs

Un classique pour un disque : Base verte, orange à 80, rouge à 90. Pour que la couleur s'applique réellement, vérifiez que **Color scheme** est sur *From thresholds* (c'est le défaut pour Stat et Gauge). Sur une Time series, activez *Show thresholds* en lignes pour voir la limite sur le graphique.

> 📖 **Définition**
>
> Les thresholds sont des paliers de valeurs, chacun associé à une couleur. La couleur **Base** couvre tout ce qui est en dessous du premier palier.
{: .callout .callout-definition}

> 💡 **Astuce**
>
> Les seuils doivent venir d'une décision, pas d'une intuition. 80 % de disque, c'est « on agit avant la fin de semaine » ; 90 %, c'est « on agit aujourd'hui ». Si personne ne réagit à l'orange, supprimez-le : une couleur sans action est du bruit visuel.
{: .callout .callout-astuce}

### Légendes et axes

La légende peut être masquée, en liste ou en tableau. En mode tableau, ajoutez les valeurs **Last**, **Max** et **Mean** : c'est un mini-résumé gratuit sous la courbe, et on peut cliquer sur une série pour l'isoler.

Côté axes, le réglage le plus utile est **Soft min = 0**. Sans lui, Grafana ajuste l'échelle verticale sur les données : une variation de 41 % à 43 % ressemble alors à un effondrement dramatique. Fixer le zéro, c'est garder les proportions honnêtes. Un deuxième axe à droite (override par série) permet de combiner deux métriques d'ordres de grandeur différents, mais à utiliser avec parcimonie : deux échelles sur un même graphique prêtent vite à confusion.

## Nommer, documenter, organiser

Un titre de panel doit dire ce qu'on regarde **et dans quelle unité** si ce n'est pas évident : « CPU utilisé par serveur (%) » plutôt que « CPU ». Les titres génériques (« Graph 1 », « Panel Title ») sont la marque d'un dashboard jamais relu.

Le champ **Description** de chaque panel s'affiche en infobulle (icône `i` dans le coin). C'est l'endroit pour écrire ce que ça mesure, d'où vient la donnée et surtout **ce qu'on fait si la valeur est mauvaise**. Deux lignes suffisent.

Trois types de liens à connaître :

- **Panel links** : lien depuis le panel vers un runbook ou un autre dashboard.
- **Data links** : lien contextuel sur un point de donnée (vers un dashboard de détail, avec des valeurs transmises).
- **Dashboard links** (Settings → Links) : barre de navigation entre dashboards liés.

> 💡 **À retenir**
>
> Le plus important se place en haut à gauche : un lecteur pressé lit le haut, et ne descend que s'il a une raison.
{: .callout .callout-important}

Côté disposition, cela donne une première rangée de Stat pour l'état global (up, CPU, mémoire, disque), puis dessous les courbes de détail, puis éventuellement une row repliée pour les cas rares.

## Sauvegarde, duplication, JSON

Les modifications d'un dashboard ne sont **pas** enregistrées tant que vous n'avez pas cliqué sur *Save dashboard*. Un onglet fermé trop vite, et le travail disparaît (Grafana prévient normalement, mais pas toujours quand on navigue ailleurs).

Voici les opérations de base :

- **Save dashboard** : enregistre une nouvelle version. Vous pouvez saisir un message de version, comme pour un commit.
- **Save as copy** (ou *Save as*, selon la version) : duplique le dashboard pour expérimenter sans casser l'original.
- **Settings → Versions** : liste des versions avec comparaison et restauration. C'est votre filet de sécurité.
- **Duplicate** sur un panel : copie un panel dans le même dashboard, pratique pour décliner une requête.

Pour l'export, passez par **Export → Export as JSON**. Le choix à connaître est *Export for sharing externally* : il remplace la référence de votre source de données par une entrée à choisir à l'import, ce qui rend le fichier portable vers un autre Grafana. Pour l'import : **Dashboards → New → Import**, puis coller le JSON ou donner l'identifiant d'un dashboard de la bibliothèque publique.

Un JSON de dashboard est long, mais la structure d'un panel est lisible. Extrait raccourci :

```json
{
  "type": "stat",
  "title": "Disque / utilisé (%)",
  "description": "Si > 90 %, voir runbook disque.",
  "targets": [
    {
      "expr": "100 * (1 - node_filesystem_avail_bytes{mountpoint=\"/\"} / node_filesystem_size_bytes{mountpoint=\"/\"})",
      "legendFormat": "{{instance}}"
    }
  ],
  "fieldConfig": {
    "defaults": {
      "unit": "percent",
      "min": 0,
      "max": 100,
      "thresholds": {
        "mode": "absolute",
        "steps": [
          { "color": "green", "value": null },
          { "color": "orange", "value": 80 },
          { "color": "red", "value": 90 }
        ]
      }
    }
  }
}
```

On y retrouve tout ce qu'on a réglé à la souris. Le dashboard a aussi un **UID (Unique Identifier)**, qui sert à l'identifier de façon stable dans les URL et l'API. Si vous importez un JSON dont l'UID existe déjà, Grafana propose de l'écraser ou d'en générer un nouveau.

Pour récupérer un dashboard depuis l'API (le provisioning complet viendra au module 25) :

```bash
curl -s -H "Authorization: Bearer <TOKEN>" http://localhost:3000/api/dashboards/uid/<UID> | jq .dashboard > dashboard.json
```

## Construction progressive d'un dashboard serveur

### v1 : une seule question

Un dashboard avec **un** Time series : le CPU par instance, légende `{{instance}}`, unité *Percent (0-100)*, Soft min à 0. C'est tout. On voit déjà si la base de la chaîne (scrape, requête, affichage) fonctionne, et on évite de construire sur du sable.

### v2 : lisible en 10 secondes

On ajoute une rangée de Stat en haut (état `up`, CPU, mémoire, disque racine) avec thresholds, des unités propres et *Calculation = Last*. On passe les titres en clair et on remplit les descriptions. Le saut de v1 à v2 tient à ce que quelqu'un qui n'a pas construit le dashboard peut maintenant en tirer une décision : tout va bien, ou il faut creuser.

### v3 : prêt à être partagé

On ajoute un Table des disques (Instant, Format Table), un Bar chart du top 5 des filesystems, une row repliée pour le réseau, des liens vers un runbook. On range le dashboard dans le bon dossier avec des tags, puis on exporte le JSON dans Git. À partir de là, le dashboard n'est plus un bricolage personnel : c'est un livrable qu'on peut relire, versionner et restaurer.

## Un dashboard joli n'est pas un dashboard utile

Posez-vous ces questions devant le dashboard, comme le ferait quelqu'un réveillé à 3 h du matin :

> ⚠️ **Erreur fréquente**
>
> Empiler des panels spectaculaires. Conséquence : en incident, le dashboard demande plus d'efforts de lecture que de réflexion, et l'équipe retourne à Explore. Correction : appliquer un test simple avant de partager.
{: .callout .callout-attention}

- En moins de 30 secondes, sait-on si le serveur va bien ou mal ?
- Chaque couleur rouge correspond-elle à une action précise ?
- Les unités et les échelles sont-elles lisibles sans deviner ?
- Un panel qui affiche « No data » se distingue-t-il d'une valeur à zéro ?
- Que ferait-on différemment si tel panel était rouge ? Si la réponse est « rien », le panel est décoratif.

Voici un exemple concret du problème. Une jauge de CPU à 35 %, bien verte, a l'air rassurante, mais elle est calculée sur une moyenne de 5 minutes alors que l'incident dure 40 secondes. Le dashboard est irréprochable visuellement et totalement aveugle à la panne. À l'inverse, un dashboard sobre avec trois Stat, deux courbes et un tableau bien nommés sert immédiatement.

Sur les panels critiques, pensez aussi à l'option **No value** (Standard options) : un texte explicite comme « pas de données » évite de confondre une absence de métrique avec une valeur normale. La gestion fine des états `No Data` et `Error` arrive avec les alertes, mais l'habitude se prend dès maintenant.

## Erreurs fréquentes

| Symptôme | Cause | Correction |
|----------|-------|------------|
| Panel « No data » alors que Explore affiche des séries | Mauvaise source de données sélectionnée dans le panel, ou plage de temps du dashboard trop courte | Vérifier la source dans le query editor, élargir la plage, ouvrir Query inspector |
| Stat affiche une valeur qui ne correspond pas à la courbe | Calculation = Mean ou autre, alors qu'on attendait la dernière valeur | Mettre *Calculation* sur Last * (dernière valeur non nulle, défaut de Stat) ou Last |
| Jauge à « 0.73 % » au lieu de 73 % | Unité *Percent (0-100)* sur une valeur entre 0 et 1 | Multiplier par 100 dans PromQL, ou utiliser *Percent (0.0-1.0)* |
| Table avec des milliers de lignes | Requête en Range, une ligne par timestamp | *Type = Instant* et *Format = Table* |
| Légende illisible avec tous les labels | Légende en mode Verbose | *Legend = Custom* avec `{{instance}}` |
| Modifications perdues | Dashboard non sauvegardé | *Save dashboard* à chaque étape, ou restaurer via Settings → Versions |
| Import échoue ou pointe vers la mauvaise source | JSON exporté sans partage externe, UID de source différent | Réexporter avec *Export for sharing externally* et choisir la source à l'import |

## Scénario : de 35 panels à 9

Reprenons l'équipe support de la mise en situation et son dashboard « pour la démo » de 35 panels : 12 jauges, 8 courbes empilées, quelques tableaux jamais lus. Lors d'un incident, il faut en moyenne plusieurs minutes pour dire quel serveur va mal et quelle ressource sature, parce qu'on cherche la bonne vignette.

L'équipe procède à une refonte en trois passes, sur une demi-journée :

1. Elle note pour chaque panel « quelle décision prend-on avec ça ? » ; une vingtaine n'en justifient aucune.
2. Elle regroupe le reste en une rangée de quatre Stat (disponibilité, CPU, mémoire, disque), quatre Time series (CPU, mémoire, trafic réseau, disque par serveur) et un Table du détail par serveur.
3. Elle ajoute des thresholds validés avec l'astreinte et une description avec un lien vers le runbook sur chaque panel.

Les chiffres sont illustratifs, mais l'ordre de grandeur est réaliste : le temps de première localisation passe d'environ cinq minutes à moins d'une minute, et deux faux positifs liés à une mauvaise unité disparaissent. Le dashboard est exporté en JSON dans un dépôt Git, avec un message de commit par modification.

## Bonnes pratiques

- **Partir d'une question** (« ce serveur est-il en bonne santé ? ») plutôt que d'une métrique disponible, et écrire cette question dans la description du dashboard.
- **Définir unités, min et max à chaque panel**, y compris sur les Stat : un chiffre sans unité ne se lit pas.
- **Poser des thresholds issus d'une décision** (qui agit, à quel seuil, comment), pas des valeurs arbitraires.
- **Garder le zéro sur l'axe Y** (Soft min = 0) pour les graphiques de ressources, afin de ne pas amplifier des variations anodines.
- **Limiter le nombre de panels** : une dizaine par vue suffit. Au-delà, scinder en dashboards liés par des dashboard links.
- **Documenter chaque panel** avec une description courte : ce que ça mesure, d'où ça vient, quoi faire si c'est mauvais.
- **Sauvegarder avec un message de version** et exporter le JSON dans Git : c'est votre filet de sécurité et le point de départ du provisioning.
- **Vérifier le comportement sans données** : un panel qui affiche zéro quand la source est tombée est plus dangereux qu'un panel vide.

## Résumé

Un dashboard fige une question opérationnelle sous forme de panels : Time series pour les tendances, Stat pour l'état courant, Gauge pour un niveau borné, Table et Bar chart pour comparer des séries. Le query editor, les unités, les thresholds, les légendes et les axes déterminent si un chiffre est lisible ou trompeur. Les titres, descriptions et liens rendent le dashboard compréhensible par quelqu'un qui ne l'a pas construit. La sauvegarde, les versions et l'export JSON le rendent récupérable et partageable.

Un dashboard n'est pas bon parce qu'il est joli, mais parce qu'il permet de décider vite. Le module suivant l'enrichit avec des variables et des filtres, pour qu'un seul dashboard serve à tous les serveurs.

<!-- snippet
id: grafana_stat_calculation_reduce
type: concept
tech: grafana
level: beginner
importance: high
format: knowledge
tags: grafana,stat,panels,visualisation
title: Stat réduit la série selon l'option Calculation
content: Un panel Stat convertit toute la série en un seul chiffre via Calculation (Last, Mean, Max, Min…). Sur 6 h, un CPU saturé depuis 10 min peut afficher une moyenne de 40 % mais une dernière valeur de 98 %. Pour un indicateur d'état, choisir Last.
description: Calculation décide de la valeur affichée par Stat : Mean masque un pic récent, Last montre l'état courant.
-->

<!-- snippet
id: grafana_unit_percent_vs_percentunit
type: warning
tech: grafana
level: beginner
importance: high
format: knowledge
tags: grafana,unites,pourcentage,panels
title: Percent (0-100) appliqué à une valeur entre 0 et 1
content: Piège : appliquer l'unité Percent (0-100) à un ratio entre 0 et 1 affiche 0.73 % au lieu de 73 %. Conséquence : un disque presque plein paraît vide. Correction : multiplier la requête par 100 en PromQL, ou utiliser l'unité Percent (0.0-1.0).
description: Un ratio PromQL entre 0 et 1 doit être multiplié par 100 ou associé à l'unité Percent (0.0-1.0), sinon la valeur est fausse.
-->

<!-- snippet
id: grafana_table_instant_format_table
type: tip
tech: grafana
level: beginner
importance: high
format: knowledge
tags: grafana,table,promql,query-editor
title: Table et Bar chart : requête Instant en Format Table
content: Pour un panel Table ou Bar chart alimenté par Prometheus, ouvrir les options du query editor et régler Type = Instant et Format = Table. On obtient une ligne par série, avec les labels en colonnes, au lieu d'une ligne par timestamp.
description: Sans Instant + Format Table, un Table affiche des milliers de lignes et un Bar chart reste vide ou illisible.
-->

<!-- snippet
id: grafana_thresholds_base_color
type: concept
tech: grafana
level: beginner
importance: medium
format: knowledge
tags: grafana,thresholds,couleurs,panels
title: Thresholds : la couleur Base couvre tout le bas de l'échelle
content: Dans Thresholds, la ligne Base s'applique de moins l'infini jusqu'au premier palier. Exemple disque : Base verte, orange à 80, rouge à 90. La couleur n'est appliquée que si Color scheme vaut From thresholds, défaut des panels Stat et Gauge.
description: Base = couleur sous le premier palier. Sur Time series, activer Show thresholds pour afficher les seuils comme lignes sur le graphique.
-->

<!-- snippet
id: grafana_axis_soft_min_zero
type: tip
tech: grafana
level: beginner
importance: medium
format: knowledge
tags: grafana,axes,time-series,lisibilite
title: Fixer Soft min = 0 sur les graphiques de ressources
content: Dans Axis → Soft min, saisir 0 pour les courbes de CPU, mémoire ou disque. Sans cela, Grafana adapte l'échelle aux données : une variation de 41 % à 43 % ressemble à un effondrement. Le zéro conserve les proportions réelles.
description: Soft min = 0 évite qu'une variation mineure paraisse dramatique, car l'auto-échelle de l'axe Y agrandit les petits écarts.
-->

<!-- snippet
id: grafana_legend_custom_instance
type: tip
tech: grafana
level: beginner
importance: low
format: knowledge
tags: grafana,legende,query-editor,promql
title: Légende Custom avec {{instance}}
content: Dans le query editor, passer Legend en Custom et saisir {{instance}} pour afficher uniquement web-01:9100, au lieu de la légende générée en mode Auto ou de tous les labels en mode Verbose ({instance="web-01:9100", job="node"}). Les labels s'écrivent entre doubles accolades, avec le nom du label PromQL.
description: Le mode Custom remplace la légende verbeuse par les labels choisis, ce qui rend les courbes lisibles quand il y a plusieurs séries.
-->

<!-- snippet
id: grafana_dashboard_export_for_sharing
type: tip
tech: grafana
level: beginner
importance: medium
format: knowledge
tags: grafana,json,export,import
title: Exporter en JSON pour un autre Grafana
content: Chemin : Export → Export as JSON, puis activer Export for sharing externally. La référence à la source de données est remplacée par une entrée à choisir à l'import. Sans cela, le JSON pointe vers l'UID de votre source locale, absent de l'autre instance.
description: Sans l'option de partage externe, l'import sur un autre Grafana échoue ou pointe vers une source inexistante ; le chemin de menu peut varier selon la version.
-->

<!-- snippet
id: grafana_dashboard_api_export_uid
type: command
tech: grafana
level: beginner
importance: medium
format: knowledge
tags: grafana,api,json,export
title: Exporter un dashboard en JSON via l'API
context: Nécessite un token de compte de service avec droit de lecture sur le dashboard
command: curl -s -H "Authorization: Bearer <TOKEN>" http://<HOST>:3000/api/dashboards/uid/<UID> | jq .dashboard > dashboard.json
example: curl -s -H "Authorization: Bearer glsa_xxxx" http://localhost:3000/api/dashboards/uid/node-overview | jq .dashboard > dashboard.json
description: Récupère le JSON d'un dashboard par son UID, prêt à être versionné dans Git ; la clé .dashboard exclut les métadonnées de l'enveloppe.
-->

<!-- snippet
id: grafana_dashboard_unsaved_changes
type: warning
tech: grafana
level: beginner
importance: high
format: knowledge
tags: grafana,sauvegarde,versions,dashboards
title: Modifications non sauvegardées et restauration de version
content: Piège : les changements ne sont enregistrés qu'après Save dashboard ; fermer l'onglet les perd. Conséquence : une heure de travail disparue. Correction : sauvegarder à chaque étape avec un message de version, et restaurer une ancienne version via Settings → Versions.
description: Settings → Versions permet de comparer et restaurer, mais seulement ce qui a été sauvegardé ; saisir un message de version aide à retrouver la bonne.
-->

<!-- snippet
id: grafana_dashboard_operational_test
type: warning
tech: grafana
level: beginner
importance: high
format: knowledge
tags: grafana,dashboards,diagnostic,conception
title: Un dashboard esthétique n'est pas opérationnel
content: Piège : multiplier les jauges et les couleurs vives. Conséquence : en incident, on cherche la bonne vignette et on retourne dans Explore. Correction : tester le dashboard avec la question « sait-on en 30 secondes si ça va mal, et que fait-on si un panel est rouge ? ». Supprimer tout panel sans action associée.
description: Le critère de qualité d'un dashboard est la rapidité de décision, pas son apparence ; un panel sans action associée est décoratif.
-->
{% endraw %}
