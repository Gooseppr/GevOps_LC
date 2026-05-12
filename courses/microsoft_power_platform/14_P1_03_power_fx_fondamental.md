---
layout: page
title: "Power Fx fondamental"

course: microsoft_power_platform
chapter_title: "Power Apps Canvas"

chapter: 1
section: 2

tags: power fx, canvas app, formules, expressions, power apps
difficulty: beginner
duration: 90
mermaid: false

status: "published"
prev_module: "/courses/microsoft_power_platform/02_P0_02_licences_plans_limites.html"
prev_module_title: "Licences, plans et limites réelles"
next_module: "/courses/microsoft_power_platform/13_P1_02_premiere_canvas_app.html"
next_module_title: "Première Canvas App"
---

# Power Fx fondamental

## Objectifs pédagogiques

À la fin de ce module, tu seras capable de :

1. **Lire et écrire** des formules Power Fx dans les propriétés d'un composant Canvas App
2. **Utiliser les fonctions essentielles** de filtrage, de manipulation de texte et de logique conditionnelle
3. **Comprendre le modèle réactif** de Power Fx — pourquoi une formule se recalcule sans que tu aies à le demander
4. **Enchaîner plusieurs actions** dans une propriété comportementale comme `OnSelect`
5. **Éviter les trois pièges les plus fréquents** qui bloquent les débutants : guillemets, types, et confusion entre données et affichage

---

## Mise en situation

Tu as créé ta première Canvas App dans le module précédent. Tu as connecté une source de données, glissé quelques contrôles, et l'application ressemble à quelque chose. Mais pour l'instant, elle ne *fait* rien d'intéressant : le bouton ne filtre pas, le label affiche une valeur fixe, et le formulaire accepte n'importe quelle saisie.

C'est là qu'intervient Power Fx. Imagine que tu dois afficher uniquement les commandes en retard dans une galerie, calculer un total à la volée, ou afficher un message d'erreur si un champ est vide. Tout ça se passe dans les propriétés de tes contrôles, avec des formules.

Ce module couvre les bases opérationnelles : les fonctions que tu utiliseras dans 80 % de tes applications, les erreurs que tout le monde fait au départ, et la logique qui sous-tend le langage.

---

## Contexte — Pourquoi Power Fx existe

Excel a une logique que des millions de personnes comprennent intuitivement : tu entres une formule dans une cellule, elle se recalcule dès que les données changent. Power Fx reprend exactement cette idée, mais pour des applications interactives.

L'alternative, c'est écrire du code événementiel classique : un bouton déclenche une fonction, qui modifie une variable, qui met à jour un état, qui redessine l'interface. C'est puissant, mais verbeux. Power Fx compresse tout ça : tu déclares *ce que tu veux afficher*, pas *comment le calculer étape par étape*.

🧠 **Power Fx est un langage déclaratif et réactif.** Tu ne dis pas "recalcule quand l'utilisateur change ce champ". Tu dis "la valeur de ce label, c'est toujours la somme des montants filtrés". Power Apps se charge du reste.

C'est la même philosophie qu'un tableur, transportée dans une application métier.

---

## Principe de fonctionnement — Le modèle réactif

### Les propriétés comme cellules de tableur

Dans Canvas App, chaque contrôle expose des propriétés : `Text`, `Visible`, `Color`, `Items`, `OnSelect`, etc. Chaque propriété peut contenir soit une valeur fixe, soit une formule.

Quand tu écris une formule dans la propriété `Text` d'un label :

```
"Bonjour " & User().FullName
```

Power Apps évalue cette formule et affiche le résultat. Si quelque chose change dans l'environnement (l'utilisateur se connecte différemment, une variable change), la formule se réévalue automatiquement.

🧠 **Il n'y a pas de "bouton recalculer".** C'est le moteur qui décide quand réévaluer, exactement comme Excel recalcule une cellule quand ses dépendances changent.

### Deux grandes catégories de propriétés

Toutes les propriétés ne se comportent pas de la même façon :

**Propriétés de données** — elles retournent une valeur, elles s'évaluent en continu. Exemples : `Text`, `Items`, `Visible`, `Color`, `Default`.

**Propriétés comportementales** — elles définissent *quoi faire* quand quelque chose se passe. Elles contiennent des actions, pas des expressions de valeur. Exemples : `OnSelect`, `OnChange`, `OnStart`.

La distinction est importante parce que les fonctions disponibles ne sont pas les mêmes. Tu ne peux pas appeler `Navigate()` dans la propriété `Text` d'un label. Et tu ne peux pas utiliser `Filter()` dans `OnSelect` pour afficher directement un résultat — tu dois passer par une variable.

---

## Syntaxe et fonctions essentielles

### Les types de base

Power Fx manipule six types principaux : texte (`"valeur"`), nombre (`42`, `3.14`), booléen (`true` / `false`), date/heure, table et enregistrement. Les guillemets sont toujours des guillemets droits — jamais de guillemets typographiques.

⚠️ **Piège classique** : copier-coller une formule depuis Word ou un PDF qui a transformé `"` en `"` ou `"`. La formule plante sans message d'erreur évident. Tape toujours tes formules directement dans l'éditeur Power Apps.

### Concaténation de texte

```
// Combiner du texte avec &
"Bonjour " & FirstName & " " & LastName

// Avec Text() pour convertir un nombre en texte
"Vous avez " & Text(NbCommandes) & " commande(s) en attente"
```

`&` est l'opérateur de concaténation. Si tu essaies d'additionner un texte et un nombre avec `+`, Power Fx peut se comporter de façon inattendue selon le contexte — utilise `&` pour le texte, `+` pour les nombres.

### Logique conditionnelle — If et Switch

```
// If simple
If(Stock < 5, "Stock critique", "OK")

// If imbriqué (à utiliser avec modération)
If(
    Score >= 90, "Excellent",
    Score >= 70, "Bien",
    Score >= 50, "Passable",
    "Insuffisant"
)

// Switch — plus lisible quand on compare une valeur à plusieurs cas fixes
Switch(
    Statut,
    "En cours", "🔵 En cours",
    "Terminé",  "✅ Terminé",
    "Annulé",   "❌ Annulé",
    "Statut inconnu"    // valeur par défaut
)
```

💡 `If()` en Power Fx accepte autant de paires condition/résultat que tu veux avant la valeur par défaut finale — c'est différent de certains langages où `if/else if` s'écrit très différemment.

### Filter — sélectionner des lignes dans une table

C'est l'une des fonctions que tu utiliseras le plus. Elle retourne un sous-ensemble d'une table selon une condition.

```
// Afficher uniquement les commandes non livrées
Filter(Commandes, Statut = "En attente")

// Combiner plusieurs conditions
Filter(
    Commandes,
    Statut = "En attente" && MontantTotal > 1000
)

// Recherche partielle sur du texte
Filter(
    Clients,
    StartsWith(Nom, RechercheInput.Text)
)
```

Tu places typiquement un `Filter()` dans la propriété `Items` d'une galerie ou d'une liste déroulante. La galerie affiche alors uniquement les lignes qui correspondent à la condition — et si l'utilisateur modifie le champ de recherche, la galerie se met à jour instantanément.

### LookUp — récupérer un seul enregistrement

Là où `Filter()` retourne une table (potentiellement plusieurs lignes), `LookUp()` retourne un seul enregistrement.

```
// Trouver le client dont l'ID correspond à la sélection dans la galerie
LookUp(Clients, ID = GalerieCommandes.Selected.ClientID)

// Récupérer directement un champ de l'enregistrement trouvé
LookUp(Clients, ID = GalerieCommandes.Selected.ClientID).NomComplet
```

🧠 Si plusieurs enregistrements correspondent à la condition, `LookUp()` retourne le premier. Si aucun n'est trouvé, il retourne `Blank()`.

### Les fonctions de texte les plus utiles

```
// Longueur d'un texte
Len(EmailInput.Text)                    // → nombre de caractères

// Mettre en minuscules / majuscules
Lower("JEAN DUPONT")                    // → "jean dupont"
Upper("jean dupont")                    // → "JEAN DUPONT"

// Extraire une partie d'un texte
Left("jean.dupont@contoso.com", 4)     // → "jean"
Mid("jean.dupont@contoso.com", 6, 6)   // → "dupont"

// Supprimer les espaces en début et fin (très utile pour les saisies utilisateur)
Trim("  jean dupont  ")                 // → "jean dupont"

// Vérifier si un texte contient une sous-chaîne
"jean.dupont@contoso.com" in "contoso" // → true
```

### Calculs sur une table — Sum, CountRows, Average

```
// Somme d'une colonne
Sum(Commandes, MontantTotal)

// Avec filtre intégré
Sum(Filter(Commandes, Statut = "Validé"), MontantTotal)

// Compter le nombre de lignes
CountRows(Filter(Commandes, Statut = "En attente"))

// Moyenne
Average(Commandes, MontantTotal)
```

---

## Construction progressive — Du label statique à la galerie interactive

Voici comment une formule évolue au fil des besoins réels.

### V1 — Afficher toutes les commandes

Tu poses une galerie, tu définis sa propriété `Items` :

```
Commandes
```

Simple. La galerie affiche tout.

### V2 — Filtrer par statut

L'utilisateur veut voir seulement ses commandes en attente. Tu ajoutes un filtre :

```
Filter(Commandes, Statut = "En attente" && AssignéÀ = User().Email)
```

La galerie ne montre plus que les lignes qui correspondent. Zéro code supplémentaire — juste une formule dans `Items`.

### V3 — Recherche dynamique pilotée par un champ texte

Tu ajoutes un `TextInput` nommé `RechercheInput` et tu modifies la formule :

```
Filter(
    Commandes,
    Statut = "En attente" &&
    AssignéÀ = User().Email &&
    (
        StartsWith(RéférenceCommande, RechercheInput.Text) ||
        StartsWith(NomClient, RechercheInput.Text)
    )
)
```

Maintenant, dès que l'utilisateur tape dans le champ de recherche, la galerie se filtre en temps réel. Le moteur réactif s'occupe de tout — tu n'as écrit aucun gestionnaire d'événement.

💡 La condition `StartsWith(RechercheInput.Text, "")` est toujours vraie quand le champ est vide, ce qui fait que la galerie affiche tout quand l'utilisateur n'a pas encore tapé. Comportement utile à connaître.

---

## Variables — Stocker une valeur temporaire

Parfois, tu as besoin de mémoriser quelque chose entre deux interactions. Power Fx propose deux types de variables.

### Set — variable globale

```
// Dans OnSelect d'un bouton
Set(MontantSelectionné, GalerieCommandes.Selected.MontantTotal)

// Dans un label ailleurs dans l'app
Text(MontantSelectionné, "[$-fr-FR]#,##0.00 €")
```

`Set()` crée ou met à jour une variable accessible partout dans l'application. La variable n'existe pas avant le premier appel à `Set()`.

### UpdateContext — variable locale à l'écran

```
// Initialiser un booléen pour contrôler la visibilité d'un panneau
UpdateContext({PanneauVisible: false})

// Basculer l'état au clic
UpdateContext({PanneauVisible: !PanneauVisible})
```

`UpdateContext()` fonctionne uniquement sur l'écran courant. Utilise-la pour les états d'interface qui n'ont pas besoin de persister au-delà de l'écran : un menu ouvert/fermé, un mode édition activé, un message temporaire.

🧠 **Règle simple** : si la variable doit être lue par un autre écran → `Set()`. Si elle ne sert qu'à gérer l'état visuel de l'écran courant → `UpdateContext()`.

---

## Cas d'utilisation concrets

### Cas 1 — Validation de formulaire avant soumission

Tu veux griser le bouton "Enregistrer" si des champs obligatoires sont vides :

```
// Propriété DisplayMode du bouton
If(
    IsBlank(NomInput.Text) || IsBlank(EmailInput.Text),
    DisplayMode.Disabled,
    DisplayMode.Edit
)
```

Pas de code, pas d'événement : le bouton se grise automatiquement dès qu'un champ est vide, et redevient cliquable dès que tout est rempli.

### Cas 2 — Couleur dynamique selon une valeur

Colorer le fond d'une cellule en rouge si le stock est critique :

```
// Propriété Fill d'un label ou d'un rectangle
If(Stock < MinimumStock, RGBA(255, 80, 80, 1), RGBA(255, 255, 255, 0))
```

### Cas 3 — Enchaîner des actions dans OnSelect

Un bouton qui enregistre, navigue, et affiche une confirmation :

```
// Propriété OnSelect du bouton "Valider"
SubmitForm(FormulaireCommande);                          // soumettre le formulaire
Navigate(EcranConfirmation, ScreenTransition.Fade);     // naviguer vers l'écran suivant
Set(DerniereAction, "Commande enregistrée à " & Text(Now(), "hh:mm"))  // mémoriser pour affichage
```

Le point-virgule sépare les actions dans une propriété comportementale. Elles s'exécutent dans l'ordre.

---

## Erreurs fréquentes

**"La formule attend un texte mais reçoit un nombre"**
→ Tu essaies de concaténer directement un nombre avec `&`. Solution : entoure la valeur numérique avec `Text()` — `Text(MontantTotal)` ou `Text(MontantTotal, "#,##0.00")` pour formater.

**Le filtre ne retourne aucun résultat alors que les données existent**
→ Vérifie la casse et les espaces. `"En attente"` ≠ `"en attente"` ≠ `"En attente "`. Utilise `Trim()` et `Lower()` sur les deux côtés de la comparaison si les données peuvent être inconsistantes : `Lower(Trim(Statut)) = "en attente"`.

**`IsBlank()` retourne `false` sur un champ qui semble vide**
→ Le champ contient peut-être des espaces invisibles. Combine avec `Trim()` : `IsBlank(Trim(ChampInput.Text))`.

⚠️ **Confondre `=` et `==`** — Power Fx utilise `=` pour la comparaison (pas `==` comme en JavaScript ou Python). Si tu viens d'un autre langage, ce réflexe peut trahir.

**`Set()` ne fonctionne pas dans une propriété de données**
→ `Set()` est une action, elle ne peut s'exécuter que dans une propriété comportementale (`OnSelect`, `OnChange`, etc.). Si tu en as besoin dans `Items` ou `Text`, c'est que tu dois restructurer ta logique — utilise une variable initialisée dans `OnStart` ou `OnVisible`.

---

## Bonnes pratiques

**Nomme tes contrôles avant d'écrire des formules.** Une formule qui référence `TextInput3` est illisible dans deux semaines. Renomme-le `RechercheInput` ou `EmailInput` dès que tu le poses — Power Apps met à jour les références automatiquement.

**Évite les formules trop longues dans une seule propriété.** Si ton `OnSelect` dépasse une dizaine de lignes, c'est souvent le signe qu'une partie de la logique devrait être déplacée dans une variable ou dans l'`OnStart` de l'écran.

**Préfère `Switch()` à `If()` imbriqués** dès que tu compares une même valeur à plus de deux cas. La lisibilité est sans comparaison.

**Initialise tes variables dans `OnStart` ou `OnVisible`.** Ne laisse pas une variable apparaître pour la première fois dans un `OnSelect` au fond d'un flux de navigation — tu t'assures ainsi que la variable existe toujours quand une formule y fait référence.

---

## Résumé

| Concept | Ce que ça fait | À retenir |
|---|---|---|
| Formule dans une propriété | Calcul automatiquement réévalué | Comme une cellule Excel — pas de "recalculer" manuel |
| `Filter(Table, Condition)` | Retourne les lignes qui satisfont la condition | Utiliser dans `Items` d'une galerie |
| `LookUp(Table, Condition)` | Retourne le premier enregistrement qui correspond | Retourne `Blank()` si rien ne correspond |
| `If(Cond, Vrai, Faux)` | Logique conditionnelle | Accepte des paires multiples avant la valeur par défaut |
| `Switch(Valeur, Cas, Résultat, ...)` | Comparaison multi-cas | Plus lisible qu'un `If` imbriqué |
| `Set(Variable, Valeur)` | Variable globale accessible partout | Action — uniquement dans propriétés comportementales |
| `UpdateContext({Var: Valeur})` | Variable locale à l'écran courant | Idéal pour les états d'interface |
| `&` | Concaténation de texte | Convertir les nombres avec `Text()` avant |
| `;` | Séparateur d'actions dans `OnSelect` etc. | Exécuté dans l'ordre, de haut en bas |

Power Fx se prend en main rapidement si tu gardes en tête un principe : tu ne *programmes* pas un comportement, tu *déclares* une valeur. La galerie montre toujours le résultat de `Filter()`, le label affiche toujours l'expression, le bouton est toujours dans l'état que décrit `If()`. Le moteur gère la mise à jour — ton travail est de dire ce que tu veux, pas quand le calculer.

---

<!-- snippet
id: powerfx_filter_items_galerie
type: command
tech: power-fx
level: beginner
importance: high
format: knowledge
tags: power-fx, filter, galerie, items, canvas-app
title: Filtrer les éléments d'une galerie avec Filter()
context: Propriété Items d'une Galerie (Gallery) dans Canvas App
command: Filter(<TABLE>, <CONDITION>)
example: Filter(Commandes, Statut = "En attente" && AssignéÀ = User().Email)
description: Retourne uniquement les lignes de la table qui satisfont la condition. La galerie se met à jour automatiquement quand la condition change.
-->

<!-- snippet
id: powerfx_lookup_enregistrement_unique
type: concept
tech: power-fx
level: beginner
importance: high
format: knowledge
tags: power-fx, lookup, table, enregistrement, blank
title: LookUp vs Filter — un seul enregistrement ou une table
content: LookUp(Table, Condition) retourne le PREMIER enregistrement qui correspond, pas une table. Si aucun enregistrement ne correspond, il retourne Blank(). Pour accéder à un champ : LookUp(Clients, ID = 42).NomComplet. Utiliser quand on sait qu'on veut un résultat unique.
description: LookUp retourne un enregistrement unique (ou Blank), Filter retourne une table. Ne pas les interchanger — les propriétés qui attendent une table rejettent un enregistrement.
-->

<!-- snippet
id: powerfx_set_vs_updatecontext
type: concept
tech: power-fx
level: beginner
importance: high
format: knowledge
tags: power-fx, set, updatecontext, variables, portee
title: Set() vs UpdateContext() — portée des variables
content: Set(MaVar, valeur) crée une variable accessible sur TOUS les écrans. UpdateContext({MaVar: valeur}) crée une variable locale à l'écran courant uniquement. Les deux sont des actions — uniquement utilisables dans des propriétés comportementales (OnSelect, OnChange, OnStart, OnVisible).
description: Set = portée globale (tous écrans). UpdateContext = portée locale (écran courant). Aucune des deux ne fonctionne dans une propriété de données comme Text ou Items.
-->

<!-- snippet
id: powerfx_semicolon_actions_onselect
type: tip
tech: power-fx
level: beginner
importance: high
format: knowledge
tags: power-fx, onselect, actions, semicolon, comportement
title: Enchaîner plusieurs actions dans OnSelect avec ;
context: Propriété OnSelect, OnChange, OnStart ou OnVisible
content: Séparer les actions avec un point-virgule (;). Elles s'exécutent dans l'ordre, de haut en bas. Exemple : SubmitForm(F); Navigate(Ecran2, ScreenTransition.Fade); Set(Confirmation, true). Ne pas utiliser ; dans les propriétés de données (Text, Items) — seulement dans les propriétés comportementales.
description: Le ; enchaîne des actions dans les propriétés comportementales. Exécution séquentielle, dans l'ordre d'écriture.
-->

<!-- snippet
id: powerfx_if_switch_conditionnel
type: tip
tech: power-fx
level: beginner
importance: medium
format: knowledge
tags: power-fx, if, switch, conditionnel, lisibilite
title: Préférer Switch() à If() imbriqués pour 3 cas ou plus
content: If(Val="A","Résultat A", Val="B","Résultat B", Val="C","Résultat C","Défaut") devient vite illisible. Switch(Val, "A","Résultat A", "B","Résultat B", "C","Résultat C", "Défaut") exprime la même chose plus clairement. Switch ne fonctionne que pour comparer une seule valeur à des cas fixes — If reste nécessaire pour des conditions indépendantes.
description: Switch est plus lisible qu'un If imbriqué dès 3 cas comparant la même valeur. Le dernier argument sans cas associé est la valeur par défaut.
-->

<!-- snippet
id: powerfx_text_concatenation_typage
type: warning
tech: power-fx
level: beginner
importance: high
format: knowledge
tags: power-fx, texte, concatenation, types, text
title: Convertir un nombre en texte avant de concaténer avec &
content: PIÈGE : "Total : " & MontantTotal provoque une erreur si MontantTotal est de type nombre. CORRECTION : "Total : " & Text(MontantTotal) ou "Total : " & Text(MontantTotal, "#,##0.00 €"). L'opérateur & attend du texte des deux côtés. Text() sans format retourne le nombre en texte brut.
description: L'opérateur & ne convertit pas automatiquement les nombres. Entourer la valeur numérique avec Text() avant de concaténer.
-->

<!-- snippet
id: powerfx_isblank_trim_combinaison
type: tip
tech: power-fx
level: beginner
importance: medium
format: knowledge
tags: power-fx, isblank, trim, validation, formulaire
title: Combiner IsBlank() et Trim() pour la validation de champs
content: IsBlank(ChampInput.Text) retourne false si le champ contient des espaces uniquement. Pour détecter les saisies "vides mais pas vraiment" : IsBlank(Trim(ChampInput.Text)). Utiliser dans la propriété DisplayMode d'un bouton : If(IsBlank(Trim(NomInput.Text)), DisplayMode.Disabled, DisplayMode.Edit).
description: Un champ qui contient des espaces n'est pas Blank() — combiner Trim() et IsBlank() pour une validation fiable des saisies utilisateur.
-->

<!-- snippet
id: powerfx_egal_comparaison_syntaxe
type: warning
tech: power-fx
level: beginner
importance: high
format: knowledge
tags: power-fx, comparaison, egal, syntaxe, operateur
title: Power Fx utilise = pour comparer, pas ==
content: PIÈGE (venant de JS/Python/C#) : écrire Statut == "En attente" provoque une erreur de syntaxe. CORRECTION : écrire Statut = "En attente". Power Fx utilise = à la fois pour l'affectation dans certains contextes et pour la comparaison. Il n'y a pas de == dans le langage.
description: En Power Fx, la comparaison s'écrit = (pas ==). Réflexe à corriger pour les développeurs habitués à d'autres langages.
-->

<!-- snippet
id: powerfx_recherche_dynamique_startswith
type: command
tech: power-fx
level: beginner
importance: medium
format: knowledge
tags: power-fx, filter, startswith, recherche, galerie
title: Recherche dynamique temps réel dans une galerie
context: Propriété Items d'une Galerie, avec un TextInput nommé RechercheInput
command: Filter(<TABLE>, StartsWith(<COLONNE_TEXTE>, RechercheInput.Text))
example: Filter(Clients, StartsWith(NomComplet, RechercheInput.Text))
description: Quand RechercheInput.Text est vide, StartsWith retourne true pour tous les enregistrements — la galerie affiche tout. La galerie se filtre en temps réel sans aucun code événementiel.
-->

<!-- snippet
id: powerfx_variables_init_onvisible
type: tip
tech: power-fx
level: beginner
importance: medium
format: knowledge
tags: power-fx, variables, onvisible, onstart, initialisation
title: Initialiser les variables dans OnVisible ou OnStart
content: Ne pas laisser une variable apparaître pour la première fois dans un OnSelect profondément imbriqué. Initialiser toutes les variables d'un écran dans sa propriété OnVisible : UpdateContext({PanneauVisible: false, ModeEdition: false}). Pour les variables globales, les initialiser dans OnStart de l'App. Cela garantit que les formules qui les référencent trouvent toujours une valeur.
description: Initialiser les variables dans OnVisible (locales) ou App.OnStart (globales) évite les comportements undefined quand une formule référence une variable avant qu'elle ait été définie.
-->
