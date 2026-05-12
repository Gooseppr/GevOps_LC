---
layout: page
title: "Performance avancée Canvas Apps"

course: microsoft_power_platform
chapter_title: "Power Apps Canvas — Diagnostic et optimisation"

chapter: 1
section: 8

tags: power apps, canvas, performance, diagnostic, power fx, delegation, concurrent, named formulas
difficulty: advanced
duration: 90
mermaid: false

status: "published"
prev_module: "/courses/microsoft_power_platform/24_P1_13_pcf_controls.html"
prev_module_title: "PCF Controls — Créer des composants personnalisés pour Power Apps et Model-Driven"
next_module: "/courses/microsoft_power_platform/22_P1_11_tests_qualite_app_checker.html"
next_module_title: "Tests, qualité et App Checker"
---

# Performance avancée Canvas Apps

## Objectifs pédagogiques

À l'issue de ce module, vous serez capable de :

1. **Identifier** les véritables causes de lenteur dans une Canvas App à l'aide des outils de diagnostic intégrés
2. **Diagnostiquer** les pièges de délégation et leurs effets silencieux sur les données retournées
3. **Corriger** les patterns d'évaluation redondante (recalculs inutiles, chargements en cascade)
4. **Appliquer** les techniques avancées de chargement (`Concurrent`, Named Formulas, caching local)
5. **Lire et interpréter** le Monitor pour isoler les requêtes lentes ou les appels inattendus

---

## Mise en situation

Vous reprenez une Canvas App déployée depuis six mois pour une équipe commerciale de 200 personnes. Elle affiche une liste de comptes avec filtres, un écran de détail, et plusieurs galeries imbriquées. Les retours utilisateurs : "l'app met 8 secondes à s'ouvrir", "quand je filtre, ça rame", "parfois les données sont incomplètes".

Aucun bug visible. Pas d'erreur dans les logs. Et pourtant, quelque chose cloche.

Ce module vous donne les outils pour ouvrir le capot, comprendre ce qui ralentit, et corriger sans tout réécrire.

---

## Pourquoi Canvas Apps peut être lente — et pourquoi c'est souvent discret

Canvas Apps est une plateforme déclarative : vous décrivez des formules, et le moteur décide quand et comment les évaluer. C'est puissant, mais ça crée une catégorie de problèmes de performance qui ne ressemblent pas à ce qu'on rencontre dans du code impératif classique.

Les trois grandes familles de lenteur :

**1. La délégation silencieuse** — Power Fx ne peut pas tout envoyer au serveur. Quand une opération n'est pas délégable, elle est exécutée localement sur un sous-ensemble de données (500 ou 2000 lignes selon le paramètre). L'app ne plante pas. Elle renvoie juste des résultats faux ou incomplets. C'est le pire type de problème : invisible et dangereux.

**2. Les recalculs en cascade** — Canvas Apps recalcule les formules dès qu'une dépendance change. Si votre `OnStart` déclenche des `Set()` qui alimentent des collections utilisées dans des galeries, vous pouvez avoir une chaîne de recalculs qui bloque le thread principal.

**3. Les appels réseau non maîtrisés** — chaque connecteur, chaque `LookUp`, chaque `Patch` génère un appel HTTP. Si vous en avez dix dans des formules d'items de galerie, vous multipliez les appels par le nombre de lignes affichées.

🧠 **Concept clé** : Canvas Apps est single-threaded côté client pour l'évaluation des formules. Un calcul bloquant empêche littéralement l'affichage de se mettre à jour.

---

## Lire le Monitor — votre premier réflexe

Avant d'optimiser quoi que ce soit, ouvrez le **Power Apps Monitor** (`Advanced tools → Monitor` depuis le studio, ou via `make.powerapps.com`). C'est l'équivalent des DevTools réseau pour Canvas Apps.

Ce que vous y trouvez :

- **Toutes les requêtes vers les connecteurs**, avec durée, payload, code HTTP
- **Les erreurs silencieuses** (délégations échouées, timeouts, 429 throttling)
- **L'ordre et la fréquence des appels** — vous verrez très rapidement si une formule est évaluée 50 fois au lieu d'une

### Comment l'utiliser concrètement

Lancez l'app en mode Monitor depuis le studio. Naviguez sur l'écran lent. Revenez dans Monitor et triez par durée décroissante. Les trois lignes en haut de cette liste sont votre problème.

💡 Cherchez les appels répétés vers la même table avec les mêmes paramètres — c'est le signe d'une formule dans `Items` d'une galerie qui se réévalue à chaque frame.

⚠️ **Erreur fréquente** : beaucoup de développeurs activent le Monitor après avoir "optimisé" leur app. Faites-le avant, pour avoir une baseline. Sinon, vous ne savez pas si vos changements ont eu un effet.

---

## La délégation — comprendre ce qui se passe vraiment

Vous connaissez probablement l'avertissement de délégation (le soulignement bleu dans le studio). Ce qui est moins connu, c'est la mécanique exacte de ce qui se passe quand la délégation échoue.

### Mécanisme interne

Quand vous écrivez :

```plaintext
Filter(Comptes, Chiffre_Affaires > SliderMin.Value)
```

Power Fx essaie de traduire cette expression en une requête OData ou SQL que le connecteur peut exécuter côté serveur. Si le connecteur supporte cette opération, la requête est déléguée : **toutes** les lignes correspondantes sont retournées (dans la limite des pages).

Si la délégation échoue (opération non supportée, type de colonne non indexé, fonction non délégable), Power Fx :
1. Récupère les N premières lignes de la table (N = votre `Data Row Limit`, entre 1 et 2000)
2. Applique le filtre **localement** sur ces N lignes
3. Retourne le résultat

Vous avez peut-être 50 000 comptes. Power Fx en charge 500. Il filtre ces 500. Si les bons résultats sont dans les lignes 501 à 50 000, vous ne les verrez jamais.

### Ce qui est délégable (et ce qui ne l'est pas)

Avec **Dataverse** (le connecteur le plus performant) :

| Opération | Délégable ? |
|-----------|-------------|
| `Filter` avec `=`, `<`, `>`, `<=`, `>=` sur colonnes indexées | ✅ |
| `Search` sur colonnes texte | ✅ (colonnes configurées) |
| `StartsWith` | ✅ |
| `In` | ✅ |
| `CountRows` sur `Filter` délégable | ✅ |
| `EndsWith` | ❌ |
| Fonctions de texte dans `Filter` (`Mid`, `Len`, etc.) | ❌ |
| `Sort` sur colonnes non indexées | ❌ (ou partiel) |
| `Filter` sur colonnes de type `Choice` avec expressions complexes | ⚠️ selon version |

Avec SharePoint, les restrictions sont plus sévères. `Filter` sur colonnes calculées n'est pas délégable. `Search` est limité aux colonnes indexées manuellement.

### Pattern de contournement : pré-filtrage serveur + affinage local

```plaintext
// On délègue la partie "lourde" à Dataverse (filtre sur date = délégable)
// puis on affine localement sur un champ non délégable
ClearCollect(
    colComptesRecents,
    Filter(Comptes, DateCreation >= DateAdd(Today(), -30, TimeUnit.Days))
);

// Ensuite, dans la galerie — Filter local sur la collection (pas de délégation nécessaire)
Filter(colComptesRecents, StartsWith(Nom, txtSearch.Text))
```

🧠 **Principe** : déléguez le filtre large (qui réduit le volume), affinez ensuite en local sur un sous-ensemble raisonnable.

---

## `Concurrent` — charger en parallèle, pas en séquence

Par défaut, les formules dans `OnStart` ou `OnVisible` s'exécutent de façon séquentielle. Si vous avez quatre `ClearCollect` qui chargent des tables différentes, ils attendent chacun leur tour.

```plaintext
// ❌ Séquentiel — 4 appels × ~800ms = ~3.2 secondes
ClearCollect(colComptes, Comptes);
ClearCollect(colContacts, Contacts);
ClearCollect(colProduits, Produits);
ClearCollect(colStatuts, Statuts)
```

```plaintext
// ✅ Concurrent — les 4 appels partent en parallèle ~800ms total
Concurrent(
    ClearCollect(colComptes, Comptes),
    ClearCollect(colContacts, Contacts),
    ClearCollect(colProduits, Produits),
    ClearCollect(colStatuts, Statuts)
)
```

Le gain est proportionnel au nombre d'appels indépendants. Sur quatre sources à 800ms chacune, vous passez de 3,2 secondes à environ 800ms (le plus lent).

⚠️ **Limitation importante** : `Concurrent` ne convient que pour des appels **sans dépendance entre eux**. Si `colContacts` dépend d'une valeur calculée depuis `colComptes`, vous ne pouvez pas les mettre dans le même `Concurrent`. Respecter l'ordre de dépendance avant de paralléliser.

💡 `Concurrent` fonctionne aussi pour des `Set()`, `Navigate()` n'est pas supporté à l'intérieur.

---

## Named Formulas — évaluation paresseuse et sans recalcul superflu

Introduites relativement récemment dans Canvas Apps, les **Named Formulas** (définies dans le nœud `Formulas` de l'app, pas dans un contrôle) changent fondamentalement comment certains calculs sont gérés.

### La différence avec `Set()`

`Set()` est une instruction impérative : elle s'exécute quand on l'appelle, stocke une valeur, et cette valeur ne se met à jour que si vous rappelez `Set()`.

Une Named Formula est une **expression déclarative** : elle est évaluée **à la demande**, quand quelque chose en a besoin, et elle se réévalue automatiquement si ses dépendances changent — exactement comme une formule Excel.

```plaintext
// Dans le nœud Formulas de l'app (pas dans un écran)
ComptesFiltres = Filter(Comptes, Actif = true);
NombreComptes = CountRows(ComptesFiltres);
```

`NombreComptes` se met à jour automatiquement si `ComptesFiltres` change. Vous n'avez pas besoin de gérer la synchronisation manuellement.

### Quand utiliser Named Formulas vs `Set()`

| Cas | Recommandation |
|-----|----------------|
| Valeur calculée depuis des sources réactives | Named Formula |
| Résultat d'un appel réseau (collection chargée) | `ClearCollect` + variable |
| Constante globale (couleurs, textes UI) | Named Formula |
| Résultat d'une action utilisateur ponctuelle | `Set()` |
| Déduplication d'une expression complexe réutilisée | Named Formula |

🧠 Les Named Formulas **ne génèrent pas d'appel réseau supplémentaire** si la source n'a pas changé. Elles participent au graphe de dépendances de Power Fx et bénéficient du méchanisme de cache interne du moteur.

---

## Les pièges de galerie — le multiplicateur d'appels

Les galeries sont l'endroit où les problèmes de performance se multiplient littéralement. Si vous mettez un appel réseau dans la propriété d'un contrôle à l'intérieur d'une galerie, cet appel est potentiellement exécuté pour **chaque ligne**.

### Pattern toxique classique

```plaintext
// ❌ Dans la propriété Text d'un label dans une galerie de 50 lignes
// → 50 appels LookUp, soit 50 requêtes HTTP
LookUp(Utilisateurs, Id = ThisItem.ProprietaireId, NomComplet)
```

Cinquante lignes affichées = cinquante requêtes. Et si la galerie se réévalue (scroll, filtre, refresh), vous remultipliez.

### Correction : pré-charger et joindre

```plaintext
// Dans OnVisible ou Concurrent dans OnStart
ClearCollect(colUtilisateurs, Utilisateurs);

// Dans Items de la galerie — jointure locale, zéro appel réseau supplémentaire
AddColumns(
    colComptes,
    "NomProprietaire",
    LookUp(colUtilisateurs, Id = ProprietaireId, NomComplet)
)
```

`AddColumns` avec `LookUp` sur une **collection locale** ne génère aucun appel réseau. La jointure se fait en mémoire.

⚠️ Si votre table source est volumineuse, `AddColumns` peut être coûteux en CPU client. Testez sur un device moyen, pas sur votre machine de développement.

### Galeries imbriquées

Une galerie dans une galerie est un multiplicateur carré. Dix lignes dans la galerie parente × dix lignes dans la galerie enfant = cent évaluations du binding enfant. À éviter sauf si les deux niveaux sont des collections locales de taille maîtrisée.

---

## `OnVisible` vs `OnStart` — charger au bon moment

`OnStart` se déclenche une seule fois au lancement de l'app. `OnVisible` se déclenche à chaque navigation vers l'écran.

Répartissez intelligemment :

- **`OnStart`** : données globales stables (paramètres, listes de référence, profil utilisateur)
- **`OnVisible`** : données spécifiques à l'écran, surtout si elles peuvent changer entre deux visites

```plaintext
// OnStart — une fois, données partagées entre tous les écrans
Concurrent(
    ClearCollect(colStatuts, Statuts),
    ClearCollect(colRegions, Regions),
    Set(varUtilisateurConnecte, LookUp(Utilisateurs, Email = User().Email))
);

// OnVisible de l'écran Comptes — à jour à chaque visite
ClearCollect(
    colComptesEcran,
    Filter(Comptes, Region = varUtilisateurConnecte.Region)
)
```

💡 Si vous avez des données qui changent rarement, envisagez un flag `varDonneesChargees` pour éviter un rechargement à chaque `OnVisible`.

```plaintext
// OnVisible — ne recharge que si pas déjà fait
If(
    !varDonneesChargees,
    ClearCollect(colStatuts, Statuts);
    Set(varDonneesChargees, true)
)
```

---

## Erreurs fréquentes et leur diagnostic

### La galerie qui ne montre pas toutes les données

**Symptôme** : un filtre retourne moins de résultats que prévu, ou "seulement" 500 lignes s'affichent.  
**Cause** : délégation échouée + `Data Row Limit` à sa valeur par défaut (500).  
**Correction** : identifier la partie non délégable de la formule (soulignement bleu), retravailler le filtre ou augmenter temporairement le `Data Row Limit` à 2000 pour confirmer le diagnostic. Solution définitive : voir le pattern pré-filtrage serveur + affinage local décrit plus haut.

---

### L'app qui rame à chaque frappe dans un champ de recherche

**Symptôme** : chaque caractère tapé dans `txtSearch` déclenche un appel Dataverse visible dans le Monitor.  
**Cause** : `Items` de la galerie contient un `Filter(..., TextInput.Text)` directement sur la source connectée.  
**Correction** : deux options selon le volume de données.

Option A — déléguer proprement avec `Search` :
```plaintext
// Search est délégable sur Dataverse pour les colonnes configurées
Search(Comptes, txtSearch.Text, "nom", "email")
```

Option B — charger la collection localement et filtrer en mémoire :
```plaintext
// Collection locale, filtre instantané, zéro appel réseau à la frappe
Filter(colComptes, StartsWith(Nom, txtSearch.Text))
```

---

### `OnStart` bloque l'écran de démarrage

**Symptôme** : l'app affiche un écran blanc ou un spinner pendant 5 à 10 secondes.  
**Cause** : séquence de `ClearCollect` synchrones dans `OnStart`, sur des tables volumineuses ou des connecteurs lents.  
**Correction** : `Concurrent` pour les chargements indépendants + réduire le volume (filtre côté serveur dès la collecte).

```plaintext
// ❌ Séquentiel et non filtré
ClearCollect(colTout, MaGrandeTable);

// ✅ Concurrent + filtré dès l'appel
Concurrent(
    ClearCollect(colRecent, Filter(MaGrandeTable, DateMaj >= DateAdd(Today(), -90, TimeUnit.Days))),
    ClearCollect(colRef, TableReference)
)
```

---

### Les variables recalculées trop souvent

**Symptôme** : le Monitor montre des appels réseau répétés sans action utilisateur visible.  
**Cause** : une variable `Set()` ou une collection est dans la chaîne de dépendances d'une formule qui se réévalue sur des événements fréquents (timer, scroll, hover).  
**Correction** : isoler les données stables dans des Named Formulas ou des collections qui ne se rechargent pas sans action explicite. Vérifier qu'aucun `Timer` `AutoStart = true` ne déclenche des `Set()` en boucle.

---

## Bonnes pratiques — ce qui change vraiment en production

**Paginer plutôt que tout charger.** Si votre table dépasse 5 000 lignes, ne la chargez jamais entièrement dans une collection. Utilisez les fonctionnalités de pagination de Dataverse et gérez un curseur de page.

**Indexer les colonnes filtrées.** Côté Dataverse, les colonnes sur lesquelles vous filtrez fréquemment doivent être indexées. Sans index, même une requête déléguée peut être lente sur de gros volumes. C'est une configuration dans l'éditeur de table Dataverse, pas dans Canvas Apps.

**Éviter les `LookUp` dans des boucles.** Un `ForAll` qui contient un `LookUp` vers une source connectée génère autant d'appels que d'itérations. Toujours pré-charger et travailler sur des collections locales dans les boucles.

**Mesurer avant et après.** Utilisez le Monitor pour noter les durées clés avant optimisation, puis vérifiez après. Sans mesure, vous travaillez à l'aveugle et vous risquez d'optimiser le mauvais endroit.

**Tester sur un réseau représentatif.** Une app rapide sur votre Wi-Fi de bureau peut être inutilisable sur la 4G d'un commercial en déplacement. Les appels qui durent 200ms chez vous durent 1,5s sur un réseau dégradé — et si vous en avez dix séquentiels, vous atteignez 15 secondes.

**`App.StartScreen` plutôt que navigate dans `OnStart`.** Si vous naviguez programmatiquement vers un écran dans `OnStart`, vous bloquez le thread jusqu'à la fin d'`OnStart`. `App.StartScreen` permet de définir l'écran de démarrage déclarativement, sans bloquer.

---

## Résumé

| Concept | Ce qu'il fait | À retenir |
|---------|---------------|-----------|
| Délégation | Transfère le filtre/tri au serveur au lieu de le faire localement | Quand elle échoue, vous n'avez qu'un sous-ensemble silencieux des données |
| `Concurrent` | Parallélise des appels indépendants | Divise le temps de chargement par le nombre d'appels (si indépendants) |
| Named Formulas | Expression déclarative réévaluée à la demande | Élimine les `Set()` de synchronisation manuelle pour les valeurs calculées |
| `AddColumns` sur collection locale | Enrichit une collection sans appel réseau | Remplace les `LookUp` dans les galeries (multiplicateurs d'appels) |
| Monitor | Outil de diagnostic réseau et formules | Premier réflexe avant toute optimisation |
| `OnStart` vs `OnVisible` | Contrôle le moment du chargement | Données globales dans `OnStart`, données d'écran dans `OnVisible` |
| Data Row Limit | Limite le nombre de lignes récupérées localement | Régler à 2000 max, mais c'est un palliatif — pas une solution |

La performance d'une Canvas App se joue à trois endroits : **ce que vous envoyez au serveur** (délégation), **quand vous le chargez** (`OnStart`/`OnVisible`, `Concurrent`), et **ce que vous mettez dans les galeries** (zéro appel réseau dans les bindings d'items). Corrigez ces trois points et la majorité des problèmes de lenteur disparaissent.

---

<!-- snippet
id: canvas_delegation_silent_failure
type: warning
tech: power apps
level: advanced
importance: high
format: knowledge
tags: canvas, delegation, dataverse, filter, performance
title: Délégation échouée — résultats silencieusement incomplets
content: Quand Filter() n'est pas délégable, Power Fx charge les N premières lignes (500 par défaut, 2000 max) et filtre localement. L'app ne retourne pas d'erreur — les résultats sont juste partiels. Piège : si les bonnes lignes sont après la N-ième, elles n'apparaissent jamais.
description: Délégation échouée = filtre local sur 500 lignes. Pas d'erreur visible, mais données potentiellement fausses ou incomplètes.
-->

<!-- snippet
id: canvas_concurrent_parallel_load
type: tip
tech: power apps
level: intermediate
importance: high
format: knowledge
tags: canvas, concurrent, performance, onstart, chargement
title: Charger plusieurs sources en parallèle avec Concurrent
content: "Remplacer les ClearCollect séquentiels par Concurrent() pour paralléliser les appels indépendants. Exemple : Concurrent(ClearCollect(colA, TableA), ClearCollect(colB, TableB)) passe de 4×800ms à ~800ms total. Contrainte : les collections dans Concurrent ne peuvent pas dépendre les unes des autres."
description: Concurrent() parallélise les appels réseau indépendants — le temps total devient celui du plus lent, pas la somme.
-->

<!-- snippet
id: canvas_lookup_in_gallery_antipattern
type: error
tech: power apps
level: advanced
importance: high
format: knowledge
tags: canvas, gallery, lookup, performance, appels-reseau
title: LookUp connecteur dans une galerie — N appels réseau
content: "Symptôme : Monitor montre des dizaines d'appels identiques à la même table. Cause : LookUp(SourceConnectee, Id = ThisItem.RefId, Champ) dans la propriété d'un contrôle de galerie → 1 appel par ligne affichée. Correction : pré-charger la table cible dans une collection, puis LookUp(maCollection, ...) → zéro appel réseau."
description: Un LookUp sur connecteur dans une galerie génère un appel HTTP par ligne. Pré-charger en collection locale pour éliminer le problème.
-->

<!-- snippet
id: canvas_named_formulas_vs_set
type: concept
tech: power apps
level: advanced
importance: medium
format: knowledge
tags: canvas, named-formulas, power-fx, reactivity, set
title: Named Formulas — évaluation déclarative vs Set() impératif
content: "Une Named Formula (nœud Formulas de l'app) est une expression déclarative : Power Fx la réévalue automatiquement quand ses dépendances changent, sans appel réseau supplémentaire si la source n'a pas bougé. Set() est impératif : la valeur est figée jusqu'au prochain appel explicite. Utiliser Named Formulas pour les valeurs dérivées (ex: NombreActifs = CountRows(Filter(colComptes, Actif=true))), Set() pour les résultats d'actions ponctuelles."
description: Named Formula = recalcul automatique sur changement de dépendance, sans code de synchronisation. Set() = valeur figée jusqu'au prochain appel explicite.
-->

<!-- snippet
id: canvas_monitor_first_reflex
type: tip
tech: power apps
level: advanced
importance: high
format: knowledge
tags: canvas, monitor, diagnostic, performance, debugging
title: Power Apps Monitor — baseline avant toute optimisation
content: "Ouvrir le Monitor AVANT d'optimiser (Advanced tools → Monitor dans le studio). Naviguer sur l'écran lent, puis trier les appels par durée décroissante. Les 3 premiers sont le vrai problème. Chercher aussi les appels répétés vers la même table : signe d'une formule réévaluée en boucle dans une galerie ou un timer."
description: Trier le Monitor par durée décroissante après navigation sur l'écran lent — les 3 premières lignes sont le problème réel.
-->

<!-- snippet
id: canvas_onstart_vs_onvisible
type: tip
tech: power apps
level: intermediate
importance: medium
format: knowledge
tags: canvas, onstart, onvisible, chargement, performance
title: Répartir les chargements entre OnStart et OnVisible
content: "OnStart : données globales stables partagées entre écrans (profil utilisateur, listes de référence). OnVisible : données spécifiques à l'écran, potentiellement modifiées entre deux visites. Astuce : ajouter un flag Set(varDonneesChargees, true) après le premier chargement dans OnVisible et tester !varDonneesChargees pour éviter le rechargement systématique."
description: OnStart pour les données globales (une fois), OnVisible pour les données d'écran. Un flag varDonneesChargees évite les rechargements inutiles.
-->

<!-- snippet
id: canvas_addcolumns_local_join
type: tip
tech: power apps
level: advanced
importance: medium
format: knowledge
tags: canvas, addcolumns, collection, jointure, performance
title: AddColumns sur collection locale pour une jointure sans appel réseau
content: "Pattern : ClearCollect(colUtilisateurs, Utilisateurs) dans OnStart, puis AddColumns(colComptes, 'NomProp', LookUp(colUtilisateurs, Id = ProprietaireId, NomComplet)) dans Items de la galerie. La jointure se fait en mémoire — zéro appel réseau supplémentaire. Attention : AddColumns sur une grande collection peut coûter du CPU client — tester sur device représentatif."
description: AddColumns + LookUp sur collection locale = jointure en mémoire sans appel HTTP. Alternative directe au LookUp sur connecteur dans les galeries.
-->

<!-- snippet
id: canvas_delegation_workaround_pattern
type: tip
tech: power apps
level: advanced
importance: medium
format: knowledge
tags: canvas, delegation, filter, collection, pattern
title: Pattern pré-filtrage délégué + affinage local
content: "Étape 1 : ClearCollect(colBase, Filter(Source, ChampIndexe >= Valeur)) — filtre large et délégable, réduit le volume côté serveur. Étape 2 : dans la galerie, Filter(colBase, FonctionNonDelegable) — affinage local sur un sous-ensemble raisonnable. Ce pattern contourne la non-délégation sans sacrifier l'exhaustivité des données."
description: Déléguer le filtre large (indexé, simple) au serveur, affiner en local sur la collection réduite — contourne la délégation sans données manquantes.
-->

<!-- snippet
id: canvas_data_row_limit_diagnostic
type: warning
tech: power apps
level: intermediate
importance: medium
format: knowledge
tags: canvas, delegation, data-row-limit, diagnostic, sharepoint
title: Data Row Limit — palliatif, pas une solution
content: "Augmenter le Data Row Limit (File → Settings → App settings) de 500 à 2000 peut confirmer un problème de délégation (plus de résultats = délégation échouée). Mais 2000 lignes reste une limite arbitraire. La vraie correction est de rendre la requête délégable ou d'utiliser le pattern pré-filtrage serveur."
description: Passer Data Row Limit à 2000 permet de diagnostiquer une délégation échouée, mais n'est pas une solution — la limite reste à 2000 lignes maximum.
-->

<!-- snippet
id: canvas_timer_set_loop_trap
type: warning
tech: power apps
level: advanced
importance: medium
format: knowledge
tags: canvas, timer, set, performance, recalcul
title: Timer AutoStart + Set() — boucle de recalculs invisible
content: "Piège : un Timer avec AutoStart = true qui appelle Set(varX, ...) dans OnTimerEnd déclenche des réévaluations en chaîne sur toutes les formules dépendant de varX. Symptôme dans le Monitor : appels réseau réguliers sans action utilisateur. Correction : vérifier que les Timers ne modifient pas des variables utilisées dans des Items de galerie ou des formules globales."
description: Un Timer AutoStart qui modifie une variable utilisée dans des galeries provoque des appels réseau en boucle — surveiller dans le Monitor.
-->
