---
layout: page
title: "Délégation et limites dans Canvas Apps"

course: microsoft_power_platform
chapter_title: "Canvas Apps"

chapter: 1
section: 4

tags: power apps, canvas, delegation, dataverse, sharepoint, power fx, limites
difficulty: beginner
duration: 55
mermaid: false

status: "published"
prev_module: "/courses/microsoft_power_platform/19_P1_08_collections_variables_etat.html"
prev_module_title: "Collections, variables et état applicatif"
next_module: "/courses/microsoft_power_platform/16_P1_05_premieres_model_driven_apps.html"
next_module_title: "Premières Model-Driven Apps"
---

# Délégation et limites dans Canvas Apps

## Objectifs pédagogiques

À l'issue de ce module, vous serez capable de :

1. **Expliquer** pourquoi la délégation existe et ce qu'elle évite comme problèmes silencieux
2. **Identifier** les signaux d'alerte visuels dans Power Apps Studio quand une formule n'est pas déléguée
3. **Distinguer** ce qui est délégable de ce qui ne l'est pas selon la source de données
4. **Réécrire** une formule non déléguée pour contourner la limite de 500/2000 enregistrements
5. **Choisir** une stratégie de filtrage adaptée à la volumétrie réelle de vos données

---

## Mise en situation

Votre collègue a construit une Canvas App connectée à une liste SharePoint de 4 000 bons de commande. Il a mis en place un `Filter` sur le statut et une barre de recherche. Ça semble fonctionner parfaitement en test — les résultats s'affichent, les filtres répondent.

Puis en production : les utilisateurs ne trouvent plus certaines commandes récentes. Personne ne comprend pourquoi. Les données sont bien dans SharePoint. La formule a l'air correcte. Et pourtant, la moitié des enregistrements est invisible.

Ce que votre collègue n'a pas vu : **un avertissement jaune discret dans la barre de formule**, et le fait que Power Apps ne lui montrait que les 500 premiers enregistrements — filtrés côté client sur ce sous-ensemble, pas sur les 4 000 lignes réelles.

Ce module explique ce mécanisme, comment le détecter, et comment ne pas tomber dans ce piège.

---

## Pourquoi la délégation existe

Quand vous écrivez `Filter(MaListeSharePoint, Statut = "Validé")`, Power Apps a deux manières de traiter ça :

**Option A — Tout ramener, puis filtrer ici**
Power Apps télécharge tous les enregistrements de la source, les stocke en mémoire dans l'app, puis applique le filtre localement. C'est simple à implémenter, mais catastrophique à l'échelle : 50 000 lignes à charger depuis SharePoint juste pour en afficher 12, ça tue la performance et ça dépasse les capacités mémoire d'une app cliente.

**Option B — Déléguer le travail à la source**
Power Apps traduit votre formule Power Fx en une requête que la source de données comprend (un filtre OData pour SharePoint, une requête Dataverse, etc.). Le filtrage se passe **sur le serveur**, et seuls les résultats utiles remontent. C'est exactement comme écrire un `WHERE` en SQL au lieu de tout sélectionner puis trier en mémoire.

La **délégation**, c'est ce mécanisme : confier le traitement à la source plutôt que de tout rapatrier.

🧠 **Le problème :** toutes les sources de données ne savent pas exécuter toutes les formules. SharePoint ne sait pas évaluer certaines fonctions Power Fx. Excel (en tant que source de données) ne sait en déléguer aucune. Et même Dataverse, qui est le plus capable, a ses limites.

Quand Power Apps rencontre une formule qu'il ne peut pas déléguer, il ne lève pas une erreur — il se rabat silencieusement sur l'Option A, mais avec un plafond : **il ne rapatrie que les N premiers enregistrements** (500 par défaut, configurable jusqu'à 2 000). Le reste de vos données n'existe tout simplement pas pour l'app.

---

## Le signal d'alerte à ne jamais ignorer

Power Apps Studio affiche un **soulignement bleu ondulé** sous la fonction ou l'argument qui pose problème, accompagné d'un warning dans le panneau de formule. C'est discret, et c'est exactement pour ça qu'on le rate.

```
Filter(MaListeSharePoint, StartsWith(Titre, RechercheText.Text))
```

⚠️ `StartsWith` n'est pas délégable sur SharePoint. Power Apps va filtrer sur les 500 premiers enregistrements chargés, pas sur toute la liste. Si votre enregistrement est en position 501, il n'apparaîtra jamais.

Le texte du warning dit généralement quelque chose comme :  
*"Cette formule contient des opérations non déléguées. Pour des sources de données volumineuses, cela peut produire des résultats incomplets."*

C'est un euphémisme. "Résultats incomplets" signifie : **des données réelles sont invisibles pour vos utilisateurs**.

---

## Ce qui est délégable (et ce qui ne l'est pas)

La capacité de délégation dépend entièrement de la **combinaison** : source de données × fonction Power Fx. Il n'y a pas de règle universelle — voici les cas les plus courants.

### Dataverse — la source la plus permissive

Avec Dataverse, la délégation couvre l'essentiel des besoins courants :

- `Filter` avec `=`, `<>`, `<`, `>`, `<=`, `>=` ✅
- `Search` ✅
- `Sort`, `SortByColumns` ✅
- `CountRows`, `Sum`, `Average`, `Min`, `Max` ✅
- Opérateurs `And`, `Or`, `Not` ✅
- `StartsWith` ✅
- `In` (membership) ✅

💡 Dataverse est pensé pour Power Apps. Si vous avez le choix de la source, c'est la meilleure option pour des volumes importants.

### SharePoint — partiel et parfois surprenant

SharePoint délègue `Filter` avec `=`, `<>`, et les comparaisons numériques sur la plupart des colonnes. Mais :

- `StartsWith` → ✅ délégable sur les colonnes texte
- `Search` → ✅ délégable
- `Contains` → ❌ **non délégable** (c'est là que beaucoup tombent)
- Fonctions de date complexes → ❌ selon les cas
- Colonnes calculées → ❌ non délégables en filtre

⚠️ `Filter(MaListe, Recherche in Titre)` ou `Filter(MaListe, IsBlank(Colonne))` : non délégables. Vous filtrerez sur 500 lignes seulement.

### Excel, Collections locales — zéro délégation

Excel comme source de données connectée, ou une `Collection` Power Apps : **aucune délégation possible**. Tout est traité en local, avec la limite de lignes rapatriées. Ces sources sont acceptables pour des volumes faibles (quelques centaines de lignes au maximum).

---

## La limite configurable — et ses malentendus

Par défaut, quand une formule n'est pas déléguée, Power Apps charge les **500 premiers enregistrements**. Vous pouvez monter ce seuil à **2 000** dans les paramètres de l'app :

> **Fichier → Paramètres → Général → Limite de lignes de données**

🧠 Ce n'est pas une solution — c'est un emplâtre. Passer à 2 000 lignes ne change pas le problème de fond : si votre source a 10 000 enregistrements, les 8 000 restants restent invisibles. Cette option sert uniquement quand vous êtes certain que votre volume réel ne dépassera jamais ce seuil.

---

## Stratégies pour contourner les limites

### 1. Reformuler pour rendre la formule délégable

C'est la vraie solution. Si une formule n'est pas délégable, la réécrire avec une alternative qui l'est.

**Cas classique : recherche textuelle**

```
// ❌ Non délégable sur SharePoint — Contains n'est pas supporté
Filter(Commandes, "urgent" in Titre)

// ✅ Délégable — StartsWith l'est
Filter(Commandes, StartsWith(Titre, RechercheText.Text))
```

La nuance : `StartsWith` filtre les titres qui *commencent par* le texte saisi, pas ceux qui le *contiennent*. C'est une contrainte métier à accepter ou à compenser autrement.

**Cas classique : filtre sur une valeur calculée**

```
// ❌ Non délégable — Year() n'est pas traité côté serveur sur SharePoint
Filter(Commandes, Year(DateCreation) = 2024)

// ✅ Délégable — comparaison de dates directes
Filter(Commandes, DateCreation >= DateValue("01/01/2024") && DateCreation < DateValue("01/01/2025"))
```

### 2. Réduire le jeu de données en amont

Si vous ne pouvez pas rendre la formule délégable, réduisez d'abord l'ensemble des données avec un filtre délégable, puis affinez localement :

```
// Étape 1 — filtre délégable (réduit à quelques centaines de lignes)
ClearCollect(
    ColCommandesActives,
    Filter(Commandes, Statut = "Actif")   // délégable sur SharePoint
);

// Étape 2 — filtre local sur la collection (volume maîtrisé)
Filter(ColCommandesActives, Contains(Commentaire, RechercheText.Text))
```

💡 L'idée : la délégation gère le gros du volume, et votre filtre non délégable s'applique sur un sous-ensemble raisonnable — pas sur les 50 000 lignes brutes.

### 3. Côté Dataverse : utiliser les vues filtrées

Dataverse permet de définir des **vues système** côté serveur, avec des filtres préconfigurés. Vous pouvez pointer directement sur une vue dans votre formule, ce qui pré-réduit les données avant même que Power Apps intervienne.

---

## Erreurs fréquentes

### "Mon filtre fonctionne en test, pas en production"

**Symptôme :** Tout semble correct sur un jeu de données de test, puis des enregistrements disparaissent en production.  
**Cause :** En test, vous aviez moins de 500 lignes — la limite ne se manifestait pas. En production, avec plus de données, les enregistrements au-delà du seuil sont invisibles.  
**Correction :** Vérifier systématiquement les avertissements de délégation dans Studio, même si l'app "fonctionne". Un warning ignoré en dev devient un bug silencieux en prod.

---

### "J'ai mis la limite à 2 000, le problème est résolu"

**Symptôme :** Vous augmentez la limite de lignes, les tests passent, vous considérez le problème réglé.  
**Cause :** La limite à 2 000 ne supprime pas la non-délégation — elle repousse simplement le seuil où les données disparaissent.  
**Correction :** La vraie solution est de rendre la formule délégable. La limite à 2 000 n'est acceptable que si vous pouvez garantir que le volume ne la dépassera jamais.

---

### "Ma collection locale ne déclenche pas de warning, donc c'est bon"

**Symptôme :** Vous filtrez sur une Collection Power Apps sans warning de délégation.  
**Cause :** Les Collections sont locales — il n'y a rien à déléguer, donc pas de warning. Mais si votre collection a été chargée depuis une source volumineuse avec une formule non déléguée, elle est déjà tronquée à 500 lignes avant le filtre.  
**Correction :** S'assurer que le `ClearCollect` initial utilise une formule déléguée pour charger la collection, pas seulement que le filtre local est correct.

---

## Bonnes pratiques

**Tester avec un volume représentatif.** Une app qui fonctionne sur 50 lignes et plante silencieusement sur 5 000 est un bug de conception, pas un bug de code. Pendant le développement, alimentez votre source de test avec au moins 600 enregistrements — suffisant pour voir apparaître les effets de la limite à 500.

**Traiter les warnings comme des erreurs.** L'avertissement de délégation n'est pas informatif — il signale un comportement potentiellement incorrect. Adoptez la règle : zéro warning bleu en production.

**Choisir la bonne source selon le volume attendu.** Si votre données va dépasser 2 000 lignes, Dataverse n'est pas un luxe — c'est la bonne décision d'architecture. SharePoint reste adapté pour des volumes maîtrisés avec une conception soigneuse des filtres.

**Documenter les formules non déléguées assumées.** Parfois, une formule non déléguée est acceptable parce que le volume est garanti faible. Dans ce cas, ajoutez un commentaire explicite dans la formule et dans la documentation de l'app, avec la limite de volume acceptable.

---

## Résumé

| Concept | Ce qu'il fait | À retenir |
|---|---|---|
| Délégation | Confie le filtrage/tri à la source de données côté serveur | Sans délégation, seuls les N premiers enregistrements sont visibles |
| Limite de lignes | Plafond de lignes rapatriées quand la délégation échoue | 500 par défaut, max 2 000 — pas une solution, un pansement |
| Warning bleu ondulé | Signal visuel dans Studio d'une formule non déléguée | À traiter comme une erreur, jamais à ignorer |
| Dataverse vs SharePoint | Dataverse délègue beaucoup plus que SharePoint | Pour les volumes > 2 000 lignes, Dataverse s'impose |
| Collection locale | Aucune délégation, mais volume maîtrisé si chargement bien fait | Le `ClearCollect` initial doit lui-même utiliser une formule déléguée |

La délégation est un des rares mécanismes de Power Apps qui peut produire des bugs **silencieux et corrects en apparence** — des données absentes sans message d'erreur. Comprendre ce mécanisme n'est pas optionnel dès que vos sources de données dépassent quelques centaines de lignes.

---

<!-- snippet
id: powerapps_delegation_concept
type: concept
tech: power apps
level: beginner
importance: high
format: knowledge
tags: delegation, canvas, filter, sharepoint, dataverse
title: Comment fonctionne la délégation dans Canvas Apps
content: Sans délégation, Power Apps rapatrie les N premiers enregistrements (500 par défaut) et filtre localement sur ce sous-ensemble. Avec délégation, il traduit la formule Power Fx en requête serveur (OData, Dataverse API) — seuls les résultats remontent. Si la formule n'est pas délégable, les données au-delà du seuil sont invisibles sans aucun message d'erreur.
description: La délégation = filtrage côté serveur. Sans elle, Power Apps travaille sur un extrait tronqué de vos données, silencieusement.
-->

<!-- snippet
id: powerapps_delegation_warning
type: warning
tech: power apps
level: beginner
importance: high
format: knowledge
tags: delegation, warning, canvas, bug silencieux
title: Warning de délégation = données potentiellement invisibles
content: Piège → Power Apps affiche un soulignement bleu ondulé sous une formule non déléguée. Conséquence → seuls les 500 premiers enregistrements sont filtrés ; si votre résultat est en position 501+, il n'apparaît jamais dans l'app. Correction → traiter ce warning comme une erreur bloquante et réécrire la formule avec une alternative déléguable, ou réduire le dataset en amont avec un filtre délégable.
description: Un warning bleu ondulé dans Studio signale que vos données sont peut-être tronquées — bug silencieux garanti en production sur volumes élevés.
-->

<!-- snippet
id: powerapps_delegation_limit_2000
type: warning
tech: power apps
level: beginner
importance: high
format: knowledge
tags: delegation, limite, canvas, parametres
title: Augmenter la limite à 2 000 lignes ne résout pas la délégation
content: Piège → passer la limite de 500 à 2 000 lignes (Fichier → Paramètres → Général → Limite de lignes de données) semble régler le problème. Conséquence → la formule reste non déléguée, seul le seuil de troncature change ; à 2 001 lignes, les données disparaissent à nouveau. Correction → réécrire la formule pour la rendre déléguable ; n'utiliser la limite à 2 000 que si le volume est garanti inférieur à cette valeur.
description: Monter la limite à 2 000 repousse le problème, ne le supprime pas — la non-délégation reste active.
-->

<!-- snippet
id: powerapps_delegation_contains_sharepoint
type: error
tech: power apps
level: beginner
importance: high
format: knowledge
tags: delegation, sharepoint, contains, startswith
title: Contains non délégable sur SharePoint — utiliser StartsWith
content: Symptôme → filtre de recherche textuelle fonctionne en test (< 500 lignes) mais manque des résultats en production. Cause → `Contains(Titre, Recherche)` n'est pas délégable sur SharePoint : Power Apps filtre sur les 500 premiers enregistrements seulement. Correction → remplacer par `StartsWith(Titre, Recherche)` qui est délégable sur SharePoint, ou utiliser la fonction `Search()` pour une recherche multi-colonnes déléguée.
description: Contains sur SharePoint = filtre sur 500 lignes max. Remplacer par StartsWith ou Search pour une délégation réelle.
-->

<!-- snippet
id: powerapps_delegation_date_filter
type: tip
tech: power apps
level: beginner
importance: medium
format: knowledge
tags: delegation, date, filter, sharepoint
title: Filtrer sur une année — éviter Year(), utiliser une plage de dates
content: Sur SharePoint, `Filter(Table, Year(DateCol) = 2024)` n'est pas délégable car Year() est évalué localement. Solution déléguable : `Filter(Table, DateCol >= DateValue("01/01/2024") && DateCol < DateValue("01/01/2025"))`. La comparaison directe de dates est traitée côté serveur SharePoint, ce qui rend la formule entièrement déléguée.
description: Remplacer Year(DateCol) = N par une plage DateValue() pour obtenir un filtre de date délégable sur SharePoint.
-->

<!-- snippet
id: powerapps_delegation_collection_strategy
type: tip
tech: power apps
level: beginner
importance: medium
format: knowledge
tags: delegation, collection, clearcollect, filtre local
title: Stratégie en deux étapes pour les formules non déléguables
content: Quand un filtre n'est pas délégable, utiliser deux étapes : 1) `ClearCollect(ColFiltrée, Filter(Source, FiltreDeleguable))` pour réduire le volume côté serveur avec un filtre délégable. 2) `Filter(ColFiltrée, FormuleNonDelegable)` sur la collection locale, dont le volume est maintenant maîtrisé. L'essentiel est que l'étape 1 soit déléguée — c'est elle qui empêche la troncature.
description: Réduire d'abord avec un filtre délégable dans ClearCollect, puis filtrer finement en local sur la collection résultante.
-->

<!-- snippet
id: powerapps_delegation_dataverse_vs_sharepoint
type: concept
tech: power apps
level: beginner
importance: medium
format: knowledge
tags: delegation, dataverse, sharepoint, choix source
title: Dataverse délègue beaucoup plus que SharePoint
content: Dataverse supporte la délégation pour Filter, Search, Sort, CountRows, Sum, Average, Min, Max, StartsWith, In, et les opérateurs And/Or/Not. SharePoint délègue Filter avec =/<>/comparaisons numériques et StartsWith, mais pas Contains, les fonctions de date complexes ni les colonnes calculées. Pour tout volume > 2 000 lignes ou besoin de filtres complexes, Dataverse est le bon choix structurel.
description: Dataverse délègue quasiment tout ; SharePoint délègue l'essentiel mais pas Contains ni les calculs côté formule.
-->

<!-- snippet
id: powerapps_delegation_test_volume
type: tip
tech: power apps
level: beginner
importance: medium
format: knowledge
tags: delegation, test, debug, volume
title: Tester la délégation avec au moins 600 enregistrements
content: Les bugs de délégation sont invisibles si votre source de test a moins de 500 lignes — la limite ne se déclenche jamais. Pendant le développement, alimenter la source avec au minimum 600 enregistrements et vérifier que les enregistrements au-delà de 500 apparaissent bien dans l'app. C'est le seul moyen de valider qu'une formule est réellement déléguée.
description: Tester avec 600+ enregistrements pour être sûr que la délégation fonctionne — en dessous de 500, le bug est invisible.
-->
