---
layout: page
title: "Triggers et logique métier AL"

course: al
chapter_title: "Logique métier et comportement applicatif"

chapter: 3
section: 1

tags: al, business central, triggers, logique métier, events, codeunit
difficulty: beginner
duration: 90
mermaid: false

status: "published"
prev_module: "/courses/al/07_pages_business_central.html"
prev_module_title: "Pages Business Central"
next_module: "/courses/al/46_power_bi_bc_developpeur_al.html"
next_module_title: "Power BI et Business Central — côté développeur AL"
---

## Objectifs pédagogiques

À l'issue de ce module, tu seras capable de :

1. **Identifier** les triggers disponibles sur les tables, pages et codeunits AL, et savoir lequel choisir selon le contexte
2. **Écrire** de la logique métier dans un trigger en respectant l'ordre d'exécution de Business Central
3. **Distinguer** les triggers de validation de champ des triggers de table pour ne pas placer du code au mauvais endroit
4. **Utiliser** les codeunits comme conteneurs de logique réutilisable, séparés des triggers
5. **Éviter** les pièges classiques : boucles infinies, validations en cascade incontrôlées, code mort

---

## Mise en situation

Tu travailles sur une extension pour une PME qui gère des commandes clients. Le besoin : quand un commercial saisit une ligne de commande, le prix unitaire doit être recalculé automatiquement à partir d'une remise négociée stockée sur la fiche client. Et si la quantité dépasse un seuil de stock, il faut bloquer la validation avec un message clair.

Ce genre de logique — déclencher du code au bon moment, dans le bon ordre, avec le bon accès aux données — c'est exactement ce que les triggers permettent de faire.

Pour aller jusqu'au bout de cet exemple : à la fin du module, tu auras les outils pour écrire ce recalcul dans le bon trigger, le déléguer au bon codeunit, et même le couvrir par un test unitaire AL.

---

## Pourquoi les triggers existent

Dans Business Central, les objets AL (tables, pages, rapports) ne sont pas passifs. Ce ne sont pas de simples définitions de structure : ils embarquent de la logique qui réagit aux actions de l'utilisateur ou du système.

Un **trigger** est une procédure qui s'exécute automatiquement en réponse à un événement précis : l'utilisateur modifie un champ, insère un enregistrement, ouvre une page… Tu n'appelles pas le trigger manuellement — BC l'appelle pour toi au moment approprié.

L'analogie utile ici : c'est comme un hook dans un framework web. Tu définis "que se passe-t-il avant/après cette action", et le runtime se charge d'appeler ton code au bon moment.

Sans triggers, tu serais obligé de gérer toute la logique depuis l'interface, ce qui est fragile et non réutilisable. Avec les triggers, la logique vit dans le modèle de données lui-même — elle s'applique quelle que soit la façon dont l'enregistrement est modifié (UI, API, traitement batch).

---

## Les triggers de table

C'est là que se concentre la logique métier la plus importante. Les triggers de table s'exécutent sur les enregistrements, indépendamment de la page ou du contexte UI.

### Les triggers fondamentaux

```al
trigger OnInsert()
// Appelé juste avant qu'un enregistrement soit inséré en base
// Idéal pour initialiser des champs calculés, numéroter automatiquement
begin
    "Created At" := CurrentDateTime();  // Horodatage automatique
    "Created By" := UserId();           // Traçabilité utilisateur
end;

trigger OnModify()
// Appelé avant chaque modification d'un enregistrement existant
begin
    "Modified At" := CurrentDateTime(); // Mise à jour de la date de modification
end;

trigger OnDelete()
// Appelé avant la suppression — dernier moment pour bloquer ou nettoyer
begin
    // Vérification d'intégrité : on empêche la suppression si des lignes existent
    SalesLine.SetRange("Document No.", "No.");
    if not SalesLine.IsEmpty() then
        Error('Impossible de supprimer : des lignes de commande existent.');
end;

trigger OnRename()
// Appelé quand la clé primaire change — rare mais existant
begin
    // Mettre à jour les références dans d'autres tables si nécessaire
end;
```

🧠 **Ces triggers s'exécutent même si la modification passe par une API ou un traitement batch**, pas seulement via l'UI. C'est leur grande force : la logique est garantie quelle que soit l'origine de la modification.

### Le trigger de validation de champ

C'est une nuance importante à comprendre. Sur chaque champ d'une table, tu peux définir un `OnValidate` :

```al
field(50100; "Discount Pct"; Decimal)
{
    Caption = 'Discount %';

    trigger OnValidate()
    // Appelé quand l'utilisateur change la valeur de ce champ spécifique
    begin
        // Validation métier : la remise ne peut pas dépasser 50%
        if "Discount Pct" > 50 then
            Error('La remise ne peut pas dépasser 50%%.');

        // Recalcul automatique du prix net
        "Net Price" := "Unit Price" * (1 - "Discount Pct" / 100);
    end;
}
```

La différence avec `OnModify` est subtile mais essentielle : `OnValidate` s'exécute champ par champ, immédiatement à la sortie du champ dans l'interface. `OnModify` s'exécute quand l'enregistrement entier est sauvegardé. Si tu mets le recalcul du prix dans `OnModify`, l'utilisateur ne voit pas le résultat en temps réel pendant la saisie.

---

## Les triggers de page

Les triggers de page contrôlent le comportement de l'interface. Ils sont liés à la navigation et aux interactions utilisateur — **pas** au stockage des données.

```al
trigger OnOpenPage()
// Appelé à l'ouverture de la page — initialiser des filtres, vérifier des droits
var
    UserSetup: Record "User Setup";
begin
    // Filtre la vue selon le vendeur connecté
    if UserSetup.Get(UserId()) then
        Rec.SetRange("Salesperson Code", UserSetup."Salespers./Purch. Code");
end;

trigger OnAfterGetRecord()
// Appelé après chaque chargement d'enregistrement dans la page
// Utile pour calculer des variables locales à afficher
begin
    // Calcul d'un indicateur visuel (non stocké en base)
    IsOverdue := (Rec."Due Date" < Today()) and (Rec."Amount Outstanding" > 0);
end;

trigger OnNewRecord(BelowxRec: Boolean)
// Appelé lors de la création d'une nouvelle ligne
// BelowxRec = true si insertion après l'enregistrement courant
begin
    Rec."Document Date" := Today(); // Valeur par défaut sur les nouveaux enregistrements
end;
```

⚠️ **Ne mets pas de logique de données métier dans les triggers de page.** Si tu valides des règles business dans `OnAfterGetRecord` ou `OnModify` côté page, cette logique ne s'applique pas quand l'enregistrement est modifié par une API. La règle simple : logique métier → triggers de table. Comportement UI → triggers de page.

### Les actions et leur trigger

Sur une page, les boutons et actions ont leur propre trigger `OnAction` :

```al
action(SendConfirmation)
{
    Caption = 'Envoyer confirmation';
    Image = SendMail;

    trigger OnAction()
    begin
        // Appel d'un codeunit métier — la logique d'envoi n'est pas ici
        OrderConfirmation.Send(Rec);
    end;
}
```

Le trigger `OnAction` ne doit contenir que le minimum : récupérer le contexte et déléguer à un codeunit.

---

## Les codeunits : sortir la logique des triggers

Un trigger, c'est 5 à 20 lignes maximum. Dès que la logique devient plus complexe, elle sort du trigger et va dans un **codeunit**.

Un codeunit, c'est simplement un objet AL qui contient des procédures. Pas d'interface, pas de table — juste de la logique métier encapsulée et réutilisable.

```al
codeunit 50100 "Order Pricing Logic"
{
    procedure RecalculateLinePrice(var SalesLine: Record "Sales Line")
    var
        Customer: Record Customer;
        DiscountPct: Decimal;
    begin
        if not Customer.Get(SalesLine."Sell-to Customer No.") then
            exit;

        DiscountPct := Customer."Negotiated Discount Pct";
        SalesLine."Unit Price" :=
            SalesLine."Unit Price" * (1 - DiscountPct / 100);
    end;

    procedure ValidateStockAvailability(SalesLine: Record "Sales Line")
    var
        Item: Record Item;
    begin
        Item.Get(SalesLine."No.");
        if SalesLine.Quantity > Item.Inventory then
            Error(
                'Stock insuffisant pour %1. Disponible : %2, Demandé : %3',
                Item."No.",
                Item.Inventory,
                SalesLine.Quantity
            );
    end;
}
```

Et depuis le trigger de table `Sales Line` :

```al
trigger OnModify()
var
    PricingLogic: Codeunit "Order Pricing Logic";
begin
    // Guard : si Discount % n'a pas changé, pas de recalcul inutile
    if "Discount %" = xRec."Discount %" then
        exit;

    PricingLogic.RecalculateLinePrice(Rec);
    PricingLogic.ValidateStockAvailability(Rec);
end;
```

🧠 **La séparation trigger → codeunit n'est pas une question de style, c'est une question de testabilité.** Tu peux appeler un codeunit depuis un test unitaire AL sans avoir besoin d'une page ouverte. Et ça change tout pour la qualité du code à long terme.

---

## Ordre d'exécution : visualiser la séquence complète

Comprendre dans quel ordre les triggers se déclenchent évite beaucoup de bugs. Voici la séquence lors d'une modification de champ dans une page :

```
Utilisateur modifie Champ A dans l'UI
        ↓
OnValidate('Champ A') déclenché
  → si Rec.Validate('Champ B', val) appelé ici
        ↓
  OnValidate('Champ B') déclenché
        ↓
Utilisateur quitte l'enregistrement (naviguer ailleurs)
        ↓
OnModify (table) déclenché
        ↓
Enregistrement sauvegardé en base de données
        ↓
OnAfterGetRecord (page) déclenché
        ↓
UI rafraîchie — valeurs mises à jour visibles
```

⚠️ **Le piège classique des validations en cascade** : si dans `OnValidate` du champ A tu appelles `Rec.Validate("B", ...)`, et que dans `OnValidate` de B tu rappelles `Rec.Validate("A", ...)`, tu crées une boucle infinie. BC la détecte généralement et lève une erreur de stack overflow. La solution : vérifier si la valeur change vraiment avant de valider.

```al
trigger OnValidate()
begin
    // Guard clause : on ne recalcule que si la valeur a réellement changé
    if "Discount Pct" = xRec."Discount Pct" then
        exit;

    "Net Price" := "Unit Price" * (1 - "Discount Pct" / 100);
end;
```

💡 `xRec` est une variable AL réservée qui contient **l'enregistrement avant modification**. Extrêmement utile pour comparer l'état avant/après et conditionner la logique.

---

## Quel trigger choisir ? Tableau décisionnel

Quand tu dois déclencher de la logique en AL, la vraie question est souvent : *dans quel trigger est-ce que ça appartient ?* Ce tableau répond directement :

| Situation | Trigger à utiliser | Pourquoi |
|---|---|---|
| Initialiser un champ à la création | `OnInsert` (table) | S'exécute avant le premier INSERT en base |
| Numéroter automatiquement un document | `OnInsert` (table) | Garantit l'attribution du numéro dès la création |
| Recalculer un montant en temps réel | `OnValidate` (champ) | Visible immédiatement pendant la saisie |
| Valider une règle métier champ par champ | `OnValidate` (champ) | Ciblé sur le champ déclencheur |
| Logique à chaque sauvegarde d'enregistrement | `OnModify` (table) | Couvre UI + API + batch |
| Bloquer ou nettoyer avant suppression | `OnDelete` (table) | Dernier point de contrôle avant DELETE |
| Appliquer des filtres à l'ouverture de page | `OnOpenPage` (page) | Exécuté une seule fois, avant affichage |
| Calculer une variable d'affichage | `OnAfterGetRecord` (page) | Après chaque chargement, hors base |
| Logique d'un bouton utilisateur | `OnAction` (page) | Déléguer immédiatement à un codeunit |
| Mettre à jour les références si clé primaire change | `OnRename` (table) | Rare mais explicite |

> **Règle de décision rapide** : si la logique doit s'appliquer même hors UI → table. Si c'est uniquement pour l'affichage ou l'interaction UI → page.

---

## Cas d'utilisation concrets

### Cas 1 — Numérotation automatique à l'insertion

```al
trigger OnInsert()
var
    NoSeries: Codeunit "No. Series";
    ServiceSetup: Record "Service Setup";
begin
    ServiceSetup.Get();
    ServiceSetup.TestField("Service Request Nos.");

    "No." := NoSeries.GetNextNo(
        ServiceSetup."Service Request Nos.",
        Today(),
        true
    );
end;
```

### Cas 2 — Contrôle de cohérence à la suppression

```al
trigger OnDelete()
var
    ProjectLine: Record "Project Line";
begin
    ProjectLine.SetRange("Project No.", "No.");
    ProjectLine.DeleteAll(true);  // true = déclenche les OnDelete des lignes enfant
end;
```

💡 `DeleteAll(true)` déclenche le trigger `OnDelete` de chaque enregistrement supprimé — utile pour la suppression en cascade avec logique de nettoyage. `DeleteAll(false)` est plus rapide mais bypasse tous les triggers : à n'utiliser que si tu es certain qu'aucune logique `OnDelete` n'existe sur la table cible.

### Cas 3 — Enrichissement de l'affichage sans impact base

```al
var
    DaysOverdue: Integer;

trigger OnAfterGetRecord()
begin
    if Rec."Expected End Date" < Today() then
        DaysOverdue := Today() - Rec."Expected End Date"
    else
        DaysOverdue := 0;
end;
```

---

## Débogage : identifier et résoudre les bugs classiques

### Bug 1 — Boucle infinie dans OnValidate

**Symptôme** : message d'erreur "Stack overflow" ou la page se fige lors de la saisie d'un champ.

**Diagnostic** :
1. Chercher dans `OnValidate` du champ les appels à `Rec.Validate(...)` d'autres champs
2. Vérifier si ces autres champs ont eux-mêmes un `OnValidate` qui rappelle le premier
3. Ajouter un `Message('OnValidate déclenché : %1', "ChampX")` temporairement pour compter les appels

**Avant (❌ boucle infinie) :**
```al
// OnValidate du champ "Discount Pct"
trigger OnValidate()
begin
    "Net Price" := "Unit Price" * (1 - "Discount Pct" / 100);
    Rec.Validate("Unit Price", "Unit Price");  // ← rappelle OnValidate de Unit Price
    // qui lui-même rappelle Rec.Validate("Discount Pct") → boucle
end;
```

**Après (✅ guard clause) :**
```al
trigger OnValidate()
begin
    if "Discount Pct" = xRec."Discount Pct" then
        exit;  // Aucun changement réel → pas de recalcul

    "Net Price" := "Unit Price" * (1 - "Discount Pct" / 100);
    // Ne pas rappeler Validate d'autres champs si évitable
end;
```

**Prévention** : systématiquement comparer avec `xRec` en tête de tout `OnValidate` qui pourrait se propager.

---

### Bug 2 — OnModify s'exécute deux fois

**Symptôme** : effet de bord double (email envoyé deux fois, compteur incrémenté deux fois), ou stack overflow immédiat.

**Diagnostic** :
1. Chercher dans le corps d'`OnModify` un appel à `Rec.Modify()` ou `Rec.Modify(true)`
2. Ajouter un `Message('OnModify appelé')` temporaire pour compter les déclenchements

**Avant (❌ boucle auto-déclenchée) :**
```al
trigger OnModify()
begin
    "Modified At" := CurrentDateTime();
    Rec.Modify();  // ← redéclenche OnModify → boucle infinie
end;
```

**Après (✅ simple assignation) :**
```al
trigger OnModify()
begin
    "Modified At" := CurrentDateTime();
    // Pas de Rec.Modify() ici : BC sauvegarde l'enregistrement après le trigger
end;
```

---

### Bug 3 — Logique métier absente lors d'une importation API

**Symptôme** : les données importées via API ou XMLport ne passent pas par les règles de validation (remise non calculée, numéro non attribué, stock non vérifié).

**Diagnostic** :
1. Identifier où se trouve la logique : trigger de page ou trigger de table ?
2. Si la logique est dans `OnAfterGetRecord`, `OnModify` côté page, ou `OnAction` → elle ne s'exécute pas hors UI

**Correction** : déplacer toute logique métier persistante dans les triggers de table (`OnInsert`, `OnModify`, `OnValidate` de champ) ou dans un codeunit appelé depuis là.

---

## Tester un codeunit : de la promesse à la pratique

La testabilité du codeunit n'est pas un argument abstrait. Voici un test unitaire AL minimal qui prouve que `RecalculateLinePrice` fonctionne correctement, sans ouvrir aucune page :

```al
codeunit 50199 "Order Pricing Logic Tests"
{
    Subtype = Test;

    [Test]
    procedure TestRecalculate_DiscountApplied()
    var
        SalesLine: Record "Sales Line" temporary;  // Enregistrement temporaire — pas de base
        PricingLogic: Codeunit "Order Pricing Logic";
    begin
        // Arrange : construire la ligne de commande en mémoire
        SalesLine."Unit Price" := 100;
        SalesLine."Negotiated Discount Pct" := 10;

        // Act : appeler le codeunit directement
        PricingLogic.RecalculateLinePrice(SalesLine);

        // Assert : vérifier le résultat attendu
        Assert.AreEqual(
            90,
            SalesLine."Unit Price",
            'Une remise de 10% sur 100 doit donner 90'
        );
    end;
}
```

Ce test montre concrètement trois choses : le codeunit est appelable sans UI, testable avec des données en mémoire (`temporary`), et vérifiable avec une assertion claire. Si la même logique était dans un trigger de page, ce test serait impossible à écrire.

> Pour exécuter ce test : ouvrir le **Test Tool** BC (`Page 130401`), ou lancer via pipeline CI/CD avec `Run-ALCops` dans AL-Go.

---

## Erreurs fréquentes

**Symptôme** : le code dans `OnModify` s'exécute deux fois  
**Cause** : appel à `Rec.Modify()` à l'intérieur d'`OnModify`, ce qui redéclenche le trigger  
**Correction** : ne jamais appeler `Rec.Modify()` dans `OnModify`. BC sauvegarde automatiquement l'enregistrement après le trigger.

---

**Symptôme** : la logique métier ne s'applique pas lors d'une importation via XMLport ou API  
**Cause** : la logique est dans un trigger de page ou dans `OnAction` — jamais appelés hors UI  
**Correction** : placer les règles métier dans les triggers de table (`OnInsert`, `OnModify`, `OnValidate` de champ)

---

**Symptôme** : `Error(...)` dans `OnDelete` mais l'enregistrement est quand même supprimé  
**Cause** : la vérification est positionnée après une opération déjà effectuée  
**Correction** : toujours placer les vérifications bloquantes **au début** du trigger, avant toute modification

---

**Symptôme** : champ affiché sur la page ne se met pas à jour lors de la saisie  
**Cause** : le calcul est dans `OnModify` (déclenché à la sauvegarde) au lieu d'`OnValidate` du champ source  
**Correction** : mettre le recalcul dans `OnValidate` du champ déclencheur

---

## Bonnes pratiques

**Garder les triggers courts.** Un trigger qui fait plus de 20 lignes est un signal que la logique doit aller dans un codeunit. Ce n'est pas une question d'esthétique : c'est une question de testabilité et de réutilisabilité.

**Nommer les codeunits avec intention.** `Codeunit 50100 "Order Pricing Logic"` dit exactement ce qu'il fait. `Codeunit 50100 "Utils"` finit toujours par devenir un fourre-tout ingérable.

**Utiliser `xRec` pour conditionner les recalculs.** Systématiquement vérifier si la valeur a changé avant de déclencher une logique coûteuse ou risquée. C'est une protection contre les effets de bord et les boucles.

**Ne jamais swallower les erreurs silencieusement.** Un `exit` silencieux dans un trigger peut masquer des problèmes de données. Si une condition anormale est atteinte, lever une erreur explicite ou loguer l'anomalie avec `Session.LogMessage` en SaaS.

**Préférer `TestField()` à `if ... then Error()`** pour les champs obligatoires. C'est plus lisible et produit un message d'erreur standard BC cohérent avec l'interface.

```al
// ❌ Verbeux et incohérent visuellement
if "Customer No." = '' then
    Error('Le numéro de client est obligatoire.');

// ✅ Idiomatique BC — message d'erreur standard et localisé
Rec.TestField("Customer No.");
```

---

## Résumé

| Concept | Ce qu'il fait | À retenir |
|---|---|---|
| `OnInsert` / `OnModify` / `OnDelete` | Triggers de table déclenchés sur les opérations CRUD | S'exécutent quelle que soit l'origine (UI, API, batch) |
| `OnValidate` (champ) | Déclenché à la sortie d'un champ modifié | Idéal pour les recalculs et validations unitaires en temps réel |
| `OnOpenPage` / `OnAfterGetRecord` | Triggers de page pour le comportement UI | Ne jamais y mettre de logique métier persistante |
| `OnAction` | Déclenché par un bouton de page | Doit déléguer à un codeunit, pas contenir de logique |
| `xRec` | État de l'enregistrement avant modification | Indispensable pour éviter les recalculs inutiles ou circulaires |
| Codeunit | Conteneur de logique réutilisable | Toujours préférer au code inline dans les triggers dès que la logique est complexe |

Les triggers AL sont le mécanisme central qui transforme une table de données en objet métier intelligent. Bien utilisés — courts, délégant au codeunit, placés au bon niveau (table vs page) — ils rendent le code prévisible et maintenable. Mal utilisés, ils deviennent la source principale de bugs difficiles à reproduire.

Le prochain module sur les **Events et Subscribers** prolonge cette logique : au lieu de modifier les triggers existants, tu vas apprendre à t'y abonner depuis l'extérieur — sans toucher au code d'origine.

---

<!-- snippet
id: al_trigger_table_order
type: concept
tech: AL
level: beginner
importance: high
format: knowledge
tags: triggers, table, oninsert, onmodify, ondelete
title: Ordre d'exécution des triggers de table AL
content: OnInsert → déclenché avant INSERT en base. OnModify → avant UPDATE. OnDelete → avant DELETE. Ces triggers s'exécutent quelle que soit l'origine : UI, API REST, XMLport, traitement batch. La logique métier placée ici est garantie universellement, contrairement aux triggers de page.
description: Triggers de table = logique universelle. Ils s'exécutent même hors UI (API, batch). OnModify ≠ OnValidate : OnModify = sauvegarde, OnValidate = sortie de champ.
-->

<!-- snippet
id: al_trigger_onvalidate_field
type: concept
tech: AL
level: beginner
importance: high
format: knowledge
tags: onvalidate, champ, recalcul, cascade
title: OnValidate — trigger de champ vs OnModify table
content: OnValidate s'exécute champ par champ, immédiatement quand l'utilisateur quitte le champ modifié. OnModify s'exécute quand l'enregistrement entier est sauvegardé. Pour un recalcul visible en temps réel pendant la saisie, utiliser OnValidate sur le champ déclencheur. OnModify = trop tard pour l'affichage.
description: OnValidate = recalcul immédiat par champ (visible pendant saisie). OnModify = sauvegarde complète de l'enregistrement. Ne pas confondre les deux.
-->

<!-- snippet
id: al_xrec_guard_clause
type: tip
tech: AL
level: beginner
importance: high
format: knowledge
tags: xrec, onvalidate, boucle, cascade, guard
title: Utiliser xRec pour éviter les validations circulaires
content: Dans OnValidate, comparer Rec."ChampX" à xRec."ChampX" avant de déclencher un recalcul. Si les valeurs sont identiques, faire exit. Sans cette garde, deux champs qui se valident mutuellement créent une boucle infinie que BC détecte comme stack overflow. xRec contient l'état de l'enregistrement AVANT la modification courante.
description: Pattern anti-boucle : if "ChampX" = xRec."ChampX" then exit. À placer en tête de tout OnValidate qui appelle d'autres Validate.
-->

<!-- snippet
id: al_trigger_page_vs_table
type: warning
tech: AL
level: beginner
importance: high
format: knowledge
tags: triggers, page, table, api, logique metier
title: Ne jamais mettre la logique métier dans les triggers de page
content: Piège : placer des règles métier (validation, calcul) dans OnAfterGetRecord, OnModify page ou OnAction. Conséquence : cette logique ne s'exécute PAS lors d'un appel API, XMLport ou batch — uniquement en UI. Correction : logique métier → triggers de table (OnModify, OnValidate champ). Triggers de page → comportement UI uniquement (filtres, variables d'affichage).
description: Logique dans trigger de page = invisible pour les API et batchs. Règle : toute règle métier persistante va dans les triggers de table, pas de page.
-->

<!-- snippet
id: al_onmodify_with_guard_and_delegation
type: command
tech: AL
level: beginner
importance: high
format: knowledge
tags: onmodify, guard clause, codeunit, delegation, xrec
title: Trigger OnModify complet avec guard clause et délégation codeunit
context: À placer dans la définition d'une table étendue ou custom. Remplacer "Sales Line" et "Order Pricing Logic" par votre table et codeunit réels.
command: trigger OnModify()
  var
      PricingLogic: Codeunit "<NOM_CODEUNIT>";
  begin
      if "<CHAMP_SURVEILLE>" = xRec."<CHAMP_SURVEILLE>" then
          exit;
      PricingLogic.<PROCEDURE>(Rec);
  end;
example: trigger OnModify()
  var
      PricingLogic: Codeunit "Order Pricing Logic";
  begin
      if "Discount %" = xRec."Discount %" then
          exit;
      PricingLogic.RecalculateLinePrice(Rec);
      PricingLogic.ValidateStockAvailability(Rec);
  end;
description: Pattern complet : guard clause sur xRec pour éviter les recalculs inutiles, puis délégation au codeunit. Trigger court, logique dans le codeunit, testable indépendamment.
-->

<!-- snippet
id: al_codeunit_delegation
type: tip
tech: AL
level: beginner
importance: medium
format: knowledge
tags: codeunit, trigger, separation, test
