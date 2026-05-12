---
layout: page
title: "Collections, variables et état applicatif"

course: microsoft_power_platform
chapter_title: "Power Apps Canvas"

chapter: 1
section: 4

tags: power apps, canvas apps, collections, variables, power fx, état applicatif
difficulty: intermediate
duration: 90
mermaid: false

status: "published"
prev_module: "/courses/microsoft_power_platform/18_P1_07_connexion_donnees_apps.html"
prev_module_title: "Canvas Apps connectées à Dataverse, SharePoint, SQL et API"
next_module: "/courses/microsoft_power_platform/15_P1_04_delegation_limites_canvas.html"
next_module_title: "Délégation et limites dans Canvas Apps"
---

# Collections, variables et état applicatif

## Objectifs pédagogiques

À l'issue de ce module, vous serez capable de :

1. **Distinguer** variables globales, variables de contexte et collections, et choisir le bon type selon le besoin
2. **Gérer l'état applicatif** d'une Canvas App sans recharger les données à chaque interaction
3. **Manipuler des collections** en mémoire : créer, filtrer, trier, mettre à jour et vider
4. **Éviter les pièges courants** liés à la portée des variables et aux effets de bord sur les performances
5. **Structurer un formulaire multi-étapes** en exploitant les variables pour piloter la navigation et l'UX

---

## Mise en situation

Vous construisez une application de saisie de commandes internes. L'utilisateur choisit des articles dans un catalogue (venant de Dataverse), les ajoute à un panier temporaire, ajuste les quantités, puis valide d'un coup. Aucune ligne ne doit être écrite en base tant que la commande n'est pas confirmée.

Problème immédiat : où stocker ce panier ? Dataverse est trop tôt — on ne veut pas de brouillons persistants. SharePoint est hors sujet. Ce panier vit **dans l'application**, entre l'écran "catalogue" et l'écran "récapitulatif". C'est exactement le problème que résolvent les collections et les variables.

---

## Contexte — Pourquoi l'état applicatif est un vrai sujet en Canvas Apps

Une Canvas App n'a pas de "mémoire" naturelle entre les écrans. Par défaut, chaque formule est réévaluée, chaque connecteur est rappelé, et rien ne persiste d'un écran à l'autre sauf si vous le déclarez explicitement.

C'est un choix de conception de Power Fx : le modèle est **réactif**. Les formules se recalculent comme des cellules Excel quand les données changent. C'est puissant — mais ça impose de réfléchir à ce qu'on veut conserver intentionnellement versus ce qu'on laisse se recalculer automatiquement.

L'état applicatif, c'est tout ce qui doit **survivre à une navigation**, **persister pendant une session**, ou **évoluer sous l'action de l'utilisateur** sans provoquer un appel réseau à chaque fois. Power Apps met à disposition trois mécanismes pour ça : les variables globales, les variables de contexte, et les collections.

---

## Les trois mécanismes en un coup d'œil

Avant d'entrer dans le détail de chacun, voici comment ils se distinguent intuitivement :

- Une **variable globale** est accessible depuis n'importe quel écran. C'est un post-it collé sur le réfrigérateur — tout le monde dans la maison peut le lire.
- Une **variable de contexte** est locale à un écran. C'est une note dans votre poche — elle disparaît quand vous quittez la pièce.
- Une **collection** est un tableau en mémoire. C'est un panier de courses — vous pouvez y ajouter, enlever, modifier des éléments.

---

## Variables globales — `Set()`

### Comment ça fonctionne

`Set()` crée ou met à jour une variable globale. La syntaxe est minimaliste :

```
Set(<NomVariable>, <Valeur>)
```

Power Fx type la variable automatiquement à partir de la première valeur affectée. Si vous écrivez `Set(MonNombre, 42)`, `MonNombre` sera de type Number pour toute la session.

```
// Sur le bouton "Connexion" — mémoriser l'utilisateur courant
Set(UtilisateurActif, User().FullName)

// Sur un toggle — piloter un mode sombre
Set(ModeSombre, Toggle1.Value)

// Sur un écran de récap — stocker un total calculé
Set(TotalCommande, Sum(PanierCollection, PrixUnitaire * Quantite))
```

🧠 **`Set()` n'existe pas dans une formule de propriété.** Il ne peut être appelé que dans des propriétés comportementales : `OnSelect`, `OnVisible`, `OnChange`, etc. Vous ne pouvez pas écrire `Set(X, 1)` dans la propriété `Text` d'un label — ce n'est pas fait pour ça.

### Portée et durée de vie

La variable globale vit pendant toute la session de l'app. Elle est réinitialisée quand l'app est fermée ou rechargée. Elle est **partagée entre tous les écrans**, mais pas entre utilisateurs (chaque session a ses propres variables).

💡 Pour réinitialiser une variable, il suffit de rappeler `Set()` avec la valeur initiale — il n'y a pas de `Unset()`.

---

## Variables de contexte — `UpdateContext()`

### Ce qui les différencie vraiment

La différence avec `Set()` n'est pas juste la portée — c'est l'**intention**. Une variable de contexte sert à piloter l'état d'un écran précis : est-ce qu'un panneau est ouvert ? Quel onglet est actif ? L'utilisateur est-il en mode édition ?

```
// Syntaxe — passer un record avec un ou plusieurs couples clé/valeur
UpdateContext({ <NomVariable>: <Valeur>, <NomVariable2>: <Valeur2> })
```

Contrairement à `Set()`, `UpdateContext()` accepte plusieurs variables en un seul appel — pratique quand une action doit changer plusieurs états locaux simultanément.

```
// Ouvrir un panneau latéral et mémoriser l'item sélectionné
UpdateContext({ PanneauOuvert: true, ItemSelectionne: Gallery1.Selected })

// Refermer sans toucher à ItemSelectionne
UpdateContext({ PanneauOuvert: false })

// Passer en mode édition
UpdateContext({ ModeEdition: true, MessageErreur: "" })
```

🧠 **Une variable de contexte créée sur l'Écran A n'existe pas sur l'Écran B.** Si vous naviguez vers un autre écran et revenez, la variable est réinitialisée. Pour passer une valeur d'un écran à l'autre, utilisez le paramètre de `Navigate()` :

```
// Écran source — transmettre une valeur à l'écran destination
Navigate(EcranDetail, ScreenTransition.None, { IDSelectionne: Gallery1.Selected.ID })

// Sur EcranDetail, IDSelectionne est directement disponible comme variable de contexte
```

C'est un pattern très courant : on navigue vers un écran détail en lui passant l'identifiant de l'enregistrement à afficher.

---

## Collections — `Collect()`, `ClearCollect()`, `Patch()` local, `Remove()`

### La différence fondamentale avec les variables

Une variable stocke **une valeur unique** — un texte, un nombre, un booléen, un record. Une collection stocke **un tableau de records**. C'est ce qui permet de simuler un "panier", une liste de sélections, ou un cache local d'une source de données.

### Créer et alimenter une collection

```
// Ajouter un ou plusieurs records à une collection existante (ou la créer si elle n'existe pas)
Collect(PanierCollection, { Produit: "Stylo", PrixUnitaire: 1.5, Quantite: 10 })

// Réinitialiser complètement la collection puis la remplir
// — à préférer pour charger des données depuis une source
ClearCollect(PanierCollection, Filter(Produits, Categorie = "Fournitures"))
```

⚠️ **`Collect()` ajoute sans vérifier les doublons.** Si l'utilisateur clique deux fois sur "Ajouter au panier", vous obtiendrez deux lignes identiques. Pensez à vérifier avec `CountIf()` avant d'ajouter, ou utilisez `Patch()` pour faire un upsert.

```
// Vérifier avant d'ajouter
If(
    CountIf(PanierCollection, Produit = NouveauProduit.Nom) = 0,
    Collect(PanierCollection, { Produit: NouveauProduit.Nom, Quantite: 1 }),
    Notify("Ce produit est déjà dans le panier", NotificationType.Warning)
)
```

### Modifier un record dans une collection — `Patch()`

`Patch()` sur une collection fonctionne comme un upsert : si le record existe (matchant sur le premier argument), il est mis à jour ; sinon il est créé. C'est le mécanisme pour modifier une ligne en mémoire sans tout effacer.

```
// Augmenter la quantité d'un produit déjà dans le panier
Patch(
    PanierCollection,
    LookUp(PanierCollection, Produit = "Stylo"),  // record à modifier
    { Quantite: LookUp(PanierCollection, Produit = "Stylo").Quantite + 1 }
)
```

### Supprimer des éléments — `Remove()` et `RemoveIf()`

```
// Supprimer un record spécifique (souvent l'item sélectionné dans une galerie)
Remove(PanierCollection, Gallery_Panier.Selected)

// Supprimer tous les records correspondant à une condition
RemoveIf(PanierCollection, Quantite = 0)

// Vider entièrement la collection
Clear(PanierCollection)
```

### Manipuler les données d'une collection

Les fonctions de manipulation sont les mêmes que sur les sources de données connectées — ce qui rend les collections très naturelles à utiliser.

```
// Filtrer
Filter(PanierCollection, Quantite > 0)

// Trier
Sort(PanierCollection, Produit, SortOrder.Ascending)

// Combiner filtre + tri
SortByColumns(Filter(PanierCollection, PrixUnitaire > 5), "Produit")

// Calculer un total
Sum(PanierCollection, PrixUnitaire * Quantite)
```

💡 Une collection peut être utilisée directement comme source d'une galerie (`Items = PanierCollection`). Toute modification de la collection via `Collect()`, `Patch()` ou `Remove()` met à jour la galerie en temps réel — c'est le modèle réactif de Power Fx en action.

---

## Construction progressive — Panier de commande en 3 étapes

### Version 1 — Panier basique, ajout sans contrôle

Sur le bouton "Ajouter" dans la galerie Produits :

```
Collect(
    PanierCollection,
    {
        Produit: Gallery_Catalogue.Selected.Nom,
        PrixUnitaire: Gallery_Catalogue.Selected.Prix,
        Quantite: 1
    }
)
```

Problème évident : aucun contrôle des doublons, pas de gestion de quantité.

### Version 2 — Upsert propre avec `Patch()`

```
If(
    CountIf(PanierCollection, Produit = Gallery_Catalogue.Selected.Nom) > 0,
    // Produit déjà présent → incrémenter la quantité
    Patch(
        PanierCollection,
        LookUp(PanierCollection, Produit = Gallery_Catalogue.Selected.Nom),
        { Quantite: LookUp(PanierCollection, Produit = Gallery_Catalogue.Selected.Nom).Quantite + 1 }
    ),
    // Nouveau produit → ajouter une ligne
    Collect(
        PanierCollection,
        {
            Produit: Gallery_Catalogue.Selected.Nom,
            PrixUnitaire: Gallery_Catalogue.Selected.Prix,
            Quantite: 1
        }
    )
)
```

### Version 3 — Finalisation et envoi vers Dataverse

Sur le bouton "Valider la commande" de l'écran récapitulatif :

```
// Écrire chaque ligne du panier dans Dataverse
ForAll(
    PanierCollection,
    Patch(
        LignesCommande,           // table Dataverse
        Defaults(LignesCommande), // créer un nouveau record
        {
            Produit: Produit,
            Prix: PrixUnitaire,
            Quantite: Quantite,
            CommandeID: IDCommandeActive  // variable globale définie en amont
        }
    )
);
// Vider le panier après envoi
Clear(PanierCollection);
// Confirmer à l'utilisateur
Navigate(EcranConfirmation, ScreenTransition.Fade)
```

🧠 `ForAll()` itère sur une collection et exécute une action pour chaque ligne. C'est le pattern standard pour écrire une collection en base en une seule formule.

---

## Cas d'utilisation concrets

### Formulaire multi-étapes avec variable d'état

Plutôt que de créer trois écrans distincts pour un formulaire en trois parties, vous pouvez rester sur un seul écran et piloter la visibilité des sections avec une variable :

```
// EtapeFormulaire vaut 1, 2 ou 3
// Propriété Visible de la section "Coordonnées"
EtapeFormulaire = 1

// Propriété Visible de la section "Détails commande"
EtapeFormulaire = 2

// Bouton "Suivant" de l'étape 1
UpdateContext({ EtapeFormulaire: EtapeFormulaire + 1 })

// Bouton "Précédent"
UpdateContext({ EtapeFormulaire: EtapeFormulaire - 1 })
```

C'est simple, performant, et évite de gérer des paramètres de navigation entre écrans.

### Cache local pour éviter les appels répétés

Si vous avez une table de référence (pays, catégories, unités) qui ne change pas pendant la session, chargez-la une seule fois dans `OnStart` de l'app :

```
// Dans la propriété OnStart de l'application
ClearCollect(CollectionPays, Pays);        // table Dataverse
ClearCollect(CollectionCategories, Categories)
```

Les galeries et listes déroulantes utilisent ensuite `CollectionPays` directement, sans rappeler Dataverse à chaque navigation. Sur des tables à faible cardinalité, c'est une optimisation significative.

### Variables pour piloter un état de chargement

```
// Avant l'appel
UpdateContext({ ChargementEnCours: true });

// Appel (ex : patch vers Dataverse)
Patch(MaTable, Defaults(MaTable), MonFormulaire);

// Après l'appel
UpdateContext({ ChargementEnCours: false })
```

Un spinner ou un overlay peut avoir `Visible = ChargementEnCours` pour donner un feedback visuel pendant les opérations longues.

---

## Erreurs fréquentes

**Symptôme :** La variable de contexte créée sur l'Écran A n'est pas reconnue sur l'Écran B — Power Apps souligne la variable en rouge.
**Cause :** Les variables de contexte sont locales à l'écran. Elle n'existe tout simplement pas ailleurs.
**Correction :** Passer la valeur via le troisième paramètre de `Navigate()`, ou utiliser `Set()` si la variable doit vraiment être globale.

---

**Symptôme :** La galerie affiche des doublons après plusieurs clics sur "Ajouter".
**Cause :** `Collect()` ajoute inconditionnellement — il n'y a aucune déduplication implicite.
**Correction :** Utiliser `CountIf()` avant d'appeler `Collect()`, ou remplacer par un `Patch()` sur le record existant.

---

**Symptôme :** `OnStart` est lent au démarrage, l'app met plusieurs secondes à s'ouvrir.
**Cause :** Trop d'appels `ClearCollect()` sur des tables volumineuses sans délégation — Power Fx charge tout en mémoire.
**Correction :** Limiter le cache aux tables de référence légères (< quelques centaines de lignes). Pour les grandes tables, conserver le `Filter()` délégué directement sur la source.

---

**Symptôme :** `ForAll()` s'exécute mais certains records ne sont pas écrits en base.
**Cause :** `ForAll()` en Power Apps n'est pas garanti séquentiel — les appels peuvent être parallélisés et certaines erreurs silencieuses peuvent passer inaperçues.
**Correction :** Ajouter une gestion d'erreur avec `IfError()` autour du `Patch()` interne, et tester avec des collections de taille variable.

---

## Bonnes pratiques

**Nommer les variables avec un préfixe de type.** `gbl_UtilisateurActif` pour les globales, `loc_PanneauOuvert` pour les locales, `col_Panier` pour les collections. Quand une app grossit, retrouver la portée d'une variable par son nom seul est un gain de temps réel.

**Ne pas abuser de `OnStart`.** C'est tentant d'y tout charger, mais chaque `ClearCollect()` bloque l'affichage de l'app. Chargez uniquement les données vraiment nécessaires dès le démarrage — les autres peuvent être chargées dans `OnVisible` de l'écran qui en a besoin.

**Éviter les variables imbriquées complexes.** Power Fx accepte des records comme valeur de variable (`Set(MonRecord, { Nom: "Alice", Age: 30 })`), mais accéder à `MonRecord.Nom` dans de nombreux endroits crée des dépendances difficiles à tracer. Préférez des variables plates et explicites.

**Vider les collections après usage.** Une collection non vidée entre deux sessions (si l'app reste ouverte longtemps) peut accumuler des données obsolètes. Appelez `Clear(MaCollection)` dans les `OnVisible` appropriés quand c'est pertinent.

**Tester la portée dès la conception.** Avant d'écrire la formule, posez-vous la question : "Est-ce que cette valeur doit survivre à une navigation ?" Si oui → `Set()`. Si non → `UpdateContext()`. Si c'est une liste → collection. Ce réflexe évite 80% des erreurs de portée.

---

## Résumé

| Concept | Ce qu'il fait | À retenir |
|---|---|---|
| `Set(Var, Valeur)` | Crée/met à jour une variable globale | Accessible partout, vit toute la session |
| `UpdateContext({Var: Valeur})` | Crée/met à jour une variable locale à l'écran | Disparaît à la navigation, idéale pour l'état UI |
| `Navigate(Ecran, Anim, {Var: Val})` | Passe une valeur de contexte à l'écran destination | Seul moyen de transmettre une variable locale entre écrans |
| `Collect(Col, Record)` | Ajoute un record à une collection | Ne déduplique pas — à coupler avec `CountIf()` |
| `ClearCollect(Col, Source)` | Réinitialise et charge une collection | Pattern standard pour les caches locaux |
| `Patch(Col, Record, MàJ)` | Met à jour un record dans une collection | Fonctionne aussi bien sur une collection qu'une table connectée |
| `Remove(Col, Record)` | Supprime un record précis | Souvent utilisé avec `.Selected` d'une galerie |
| `ForAll(Col, Action)` | Itère sur une collection pour exécuter des actions | Pattern d'écriture en masse vers une source de données |

L'état applicatif dans une Canvas App, c'est avant tout un choix de portée : locale ou globale, scalaire ou tabulaire. Quand ces trois mécanismes sont bien maîtrisés, vous pouvez construire des expériences utilisateur fluides et réactives sans aucun appel réseau superflu.

---

<!-- snippet
id: powerapps_set_global_variable
type: command
tech: Power Apps
level: intermediate
importance: high
format: knowledge
tags: power apps, variables, set, power fx, etat
title: Créer ou mettre à jour une variable globale
context: À appeler dans une propriété comportementale (OnSelect, OnVisible, OnChange) — pas dans une propriété de rendu
command: Set(<NomVariable>, <Valeur>)
example: Set(UtilisateurActif, User().FullName)
description: Variable accessible depuis tous les écrans pendant toute la session. Typée automatiquement à la première affectation.
-->

<!-- snippet
id: powerapps_updatecontext_local_variable
type: command
tech: Power Apps
level: intermediate
importance: high
format: knowledge
tags: power apps, variables, updatecontext, portee, ecran
title: Créer une variable locale à un écran
context: La variable n'existe que sur l'écran où UpdateContext est appelé
command: UpdateContext({ <NomVariable>: <Valeur> })
example: UpdateContext({ PanneauOuvert: true, ModeEdition: false })
description: Peut mettre à jour plusieurs variables en un seul appel. Réinitialisée à chaque navigation vers l'écran.
-->

<!-- snippet
id: powerapps_navigate_context_pass
type: command
tech: Power Apps
level: intermediate
importance: high
format: knowledge
tags: power apps, navigate, variables, contexte, navigation
title: Passer une variable de contexte à l'écran destination
command: Navigate(<Ecran>, ScreenTransition.None, { <NomVariable>: <Valeur> })
example: Navigate(EcranDetail, ScreenTransition.None, { IDSelectionne: Gallery1.Selected.ID })
description: Seul mécanisme pour transmettre une variable locale d'un écran à l'autre. La variable est disponible immédiatement sur l'écran destination.
-->

<!-- snippet
id: powerapps_collect_add_record
type: command
tech: Power Apps
level: intermediate
importance: high
format: knowledge
tags: power apps, collections, collect, panier, memoire
title: Ajouter un record à une collection en mémoire
context: Collect n'effectue aucune déduplication — vérifier avec CountIf avant d'appeler si les doublons posent problème
command: Collect(<NomCollection>, { <Champ1>: <Valeur1>, <Champ2>: <Valeur2> })
example: Collect(PanierCollection, { Produit: "Stylo", PrixUnitaire: 1.5, Quantite: 1 })
description: Crée la collection si elle n'existe pas. Ajoute inconditionnellement — pas d'upsert implicite.
-->

<!-- snippet
id: powerapps_clearcollect_cache
type: command
tech: Power Apps
level: intermediate
importance: high
format: knowledge
tags: power apps, collections, clearcollect, cache, onstart
title: Charger une source de données dans une collection locale (cache)
context: Idéal dans OnStart pour les tables de référence légères (< quelques centaines de lignes)
command: ClearCollect(<NomCollection>, <Source>)
example: ClearCollect(CollectionPays, Filter(Pays, Actif = true))
description: Réinitialise la collection puis la remplit depuis la source. Élimine les appels réseau répétés pour les données stables.
-->

<!-- snippet
id: powerapps_collect_deduplicate
type: warning
tech: Power Apps
level: intermediate
importance: high
format: knowledge
tags: power apps, collections, doublons, countif, collect
title: Collect ne déduplique pas — piège classique du panier
content: Piège : cliquer deux fois sur "Ajouter" avec Collect() crée deux lignes identiques. Correction : vérifier avec CountIf avant d'ajouter — If(CountIf(PanierCollection, Produit = NomProduit) = 0, Collect(...), Patch(...)) — ou remplacer l'ajout initial par un Patch() avec LookUp.
description: Collect() ajoute toujours un nouveau record. Sans garde-fou, chaque clic produit un doublon silencieux dans la collection.
-->

<!-- snippet
id: powerapps_patch_collection_upsert
type: command
tech: Power Apps
level: intermediate
importance: medium
format: knowledge
tags: power apps, patch, collections, upsert, modification
title: Modifier un record existant dans une collection
command: Patch(<NomCollection>, LookUp(<NomCollection>, <Condition>), { <Champ>: <NouvelleValeur> })
example: Patch(PanierCollection, LookUp(PanierCollection, Produit = "Stylo"), { Quantite: LookUp(PanierCollection, Produit = "Stylo").Quantite + 1 })
description: Met à jour uniquement les champs spécifiés sur le record trouvé par LookUp. Fonctionne identiquement sur une collection et une table Dataverse.
-->

<!-- snippet
id: powerapps_forall_patch_dataverse
type: command
tech: Power Apps
level: intermediate
importance: high
format: knowledge
tags: power apps, forall, patch, dataverse, collections, ecriture
title: Écrire tous les records d'une collection vers Dataverse
context: S'utilise dans une propriété comportementale (ex : OnSelect d'un bouton Valider)
command: ForAll(<NomCollection>, Patch(<TableDataverse>, Defaults(<TableDataverse>), { <Champ>: <Valeur> }))
example: ForAll(PanierCollection, Patch(LignesCommande, Defaults(LignesCommande), { Produit: Produit, Quantite: Quantite }))
description: Itère sur chaque record de la collection et crée un enregistrement en base. Les appels peuvent être parallélisés — ajouter IfError() pour détecter les échecs silencieux.
-->

<!-- snippet
id: powerapps_variable_scope_decision
type: concept
tech: Power Apps
level: intermediate
importance: high
format: knowledge
tags: power apps, variables, portee, set, updatecontext, decision
title: Choisir entre Set et UpdateContext — règle de décision
content: La question à se poser avant d'écrire la formule : "Est-ce que cette valeur doit survivre à une navigation entre écrans ?" Si oui → Set() (variable globale). Si non → UpdateContext() (variable locale à l'écran). Si c'est une liste de records → collection. Ce réflexe couvre 95% des cas de choix de portée.
description: Set() = global (tous les écrans, toute la session). UpdateContext() = local (un seul écran). Collection = tableau de records en mémoire.
-->

<!-- snippet
id: powerapps_onstart_overload
type: warning
tech: Power Apps
level: intermediate
importance: medium
format: knowledge
tags: power apps, onstart, performance, clearcollect, chargement
title: Ne pas surcharger OnStart avec de gros ClearCollect
content: Piège : charger toutes les données de l'app dans OnStart retarde l'affichage — chaque ClearCollect bloque le démarrage. Correction : réserver OnStart aux tables légères de référence (pays, catégories). Charger les données métier dans OnVisible de l'écran qui en a besoin. Pour les grandes tables, garder le Filter() délégué directement sur la source Dataverse.
description: OnStart bloquant — chaque ClearCollect sur une table volumineuse allonge le temps avant que l'utilisateur voit quelque chose.
-->

<!-- snippet
id: powerapps_naming_convention_variables
type: tip
tech: Power Apps
level: intermediate
importance: medium
format: knowledge
tags: power apps, variables, nommage, conventions, maintenabilite
title: Préfixer les variables par leur portée pour les identifier immédiatement
content: Convention recommandée : préfixer gbl_ pour les variables globales (Set), loc_ pour les variables de contexte (UpdateContext), col_ pour les collections. Exemple : gbl_UtilisateurActif, loc_PanneauOuvert, col_Panier. Dans une app de 10+ écrans, retrouver la portée d'une variable par son nom seul évite de remonter à sa déclaration.
description: Sans convention de nommage, distinguer une variable locale d'une globale dans une grosse app devient un exercice de mémoire inutile.
-->
