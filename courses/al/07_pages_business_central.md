---
layout: page
title: "Pages Business Central"

course: al
chapter_title: "Pages Business Central"

chapter: 3
section: 1

tags: al, business central, pages, ui, extension, card, list, pagecustomization
difficulty: beginner
duration: 90
mermaid: false

status: "published"
prev_module: "/courses/al/13_architecture_extensions.html"
prev_module_title: "Architecture des extensions Business Central"
next_module: "/courses/al/08_triggers_logique_metier.html"
next_module_title: "Triggers et logique métier AL"
---

# Pages Business Central

## Objectifs pédagogiques

À l'issue de ce module, vous serez capable de :

- Identifier les différents types de pages BC et **choisir le bon** selon le contexte métier
- Lire et écrire la structure d'une page AL (Card, List, Document)
- Comprendre pourquoi une page se connecte à une table d'une façon précise — et ce qui se casse quand le lien est mal formé
- Ajouter des champs, des actions et des groupes dans une page existante via `pageextension`
- Diagnostiquer les erreurs de compilation et de rendu les plus fréquentes sur les pages AL

---

## Mise en situation

Vous travaillez sur une extension pour une PME qui gère des locations de matériel. La table `Equipment` existe déjà (créée dans le module précédent). Votre mission : rendre cette table accessible dans l'interface BC avec une page liste pour parcourir les équipements, et une page fiche pour en consulter ou modifier le détail.

Vous devrez aussi ajouter un champ personnalisé sur la page client standard — sans toucher au code source BC.

Une contrainte supplémentaire : la page Document de réservation doit embarquer les lignes de réservation dans un sous-formulaire. Si vous oubliez le lien entre l'en-tête et les lignes, toutes les lignes de tous les documents s'affichent en même temps — ce qui est exactement ce que vous allez apprendre à éviter.

---

## Pourquoi les pages sont-elles centrales en AL ?

En Business Central, l'interface utilisateur n'est pas générée automatiquement à partir des tables. Chaque écran que voit l'utilisateur correspond à un objet `page` explicitement défini. C'est très différent d'un framework web classique où un scaffold peut créer un CRUD en quelques secondes.

Ce choix a une raison concrète : BC est un ERP multi-tenant SaaS. Microsoft doit pouvoir mettre à jour les pages de base sans écraser vos personnalisations. La séparation entre la page standard et votre `pageextension` est ce qui rend ça possible.

Conséquence pratique sur votre code : si vous déclarez un `field` dans une page qui référence un champ absent de la table source (ou de son extension), BC ne génère pas d'erreur au moment de la compilation dans tous les cas — mais l'erreur remonte au déploiement ou à l'exécution. Règle d'or : créez d'abord le champ dans la table ou la `tableextension`, ensuite ajoutez-le à la page.

🧠 **Une page AL est un objet déclaratif** — vous déclarez quels champs afficher, dans quel ordre, avec quelles propriétés. BC se charge du rendu (web client, mobile, API). Vous ne gérez pas de pixels.

---

## Choisir son type de page avant d'écrire une ligne

La première question n'est pas "comment écrire ma page" mais "quel type de page correspond à mon besoin ?". Ce choix détermine la structure obligatoire du bloc `layout` — se tromper ici génère des erreurs de compilation difficiles à diagnostiquer.

### Matrice de décision

| Besoin | Type recommandé | Pourquoi |
|---|---|---|
| Afficher / éditer **un seul enregistrement** en détail | `Card` | Structure `group > field`, un enregistrement à la fois |
| Afficher **une collection** d'enregistrements en tableau | `List` | Structure `repeater > field`, pagination et filtrage natifs |
| Document transactionnel avec **en-tête + lignes** | `Document` | Card étendue qui embarque une `ListPart` pour les lignes |
| Sous-formulaire intégré dans une autre page | `ListPart` / `CardPart` | Ne s'affiche pas seul, toujours dans une `part()` |
| Endpoint REST sans interface visuelle | `API` | Même syntaxe AL, couvert dans le module Intégrations |
| Beaucoup de champs, édition ligne par ligne | `Worksheet` | Tableur-like, cas rares au niveau débutant |

> 💡 La règle pratique : si l'utilisateur travaille sur *un* objet → Card. Si il parcourt *plusieurs* objets → List. Si il saisit un document avec des lignes (commande, facture, location) → Document.

### Ce que le type contraint dans votre code

Le `PageType` n'est pas qu'un libellé sémantique — il impose une structure syntaxique précise :

- Dans une `Card` : le contenu principal est dans des `group`
- Dans une `List` : la zone répétée utilise `repeater` — utiliser `group` à la place génère une erreur de compilation
- Dans un `Document` : les lignes arrivent via une `part()` avec `SubPageLink`

C'est pour ça qu'on choisit *avant* d'écrire.

---

## Anatomie d'une page AL

Voici une page Card complète sur la table `Equipment` — la structure minimale viable commentée ligne par ligne.

```al
page 50100 "Equipment Card"          // Numéro unique dans votre plage, nom entre guillemets
{
    PageType = Card;                 // Type : une fiche, un seul enregistrement à la fois
    SourceTable = Equipment;         // Table AL source — tous les champs Rec. viennent de là
    Caption = 'Equipment Card';      // Libellé affiché dans l'interface

    layout                           // Bloc layout : tout ce qui est visible à l'écran
    {
        area(Content)                // Zone principale — obligatoire, toujours présente
        {
            group(General)           // Un groupe = une section visuelle (onglet ou encadré)
            {
                Caption = 'General';

                field("No."; Rec."No.")
                {
                    ApplicationArea = All;   // Obligatoire — contrôle la visibilité par licence
                    ToolTip = 'Specifies the equipment number.';
                }
                field(Description; Rec.Description)
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies a description of the equipment.';
                }
                field(Status; Rec.Status)
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the current status of the equipment.';
                }
            }
        }
    }

    actions
    {
        area(Processing)
        {
            action(CheckAvailability)
            {
                Caption = 'Check Availability';
                ApplicationArea = All;
                Image = Check;
                ToolTip = 'Checks whether this equipment is currently available.';

                trigger OnAction()
                begin
                    // logique métier ici — voir module Triggers
                end;
            }
        }
    }
}
```

🧠 Retenez la structure : `layout` → `area` → `group` → `field`. C'est toujours dans cet ordre. Un `field` ne peut pas aller directement dans un `area` sans passer par un `group` — BC le rejette à la compilation.

---

## La page List : afficher une collection

```al
page 50101 "Equipment List"
{
    PageType = List;
    SourceTable = Equipment;
    Caption = 'Equipments';
    CardPageId = "Equipment Card";   // Double-clic sur une ligne → ouvre cette Card

    layout
    {
        area(Content)
        {
            repeater(Lines)          // "repeater" — et pas "group" — c'est obligatoire ici
            {
                field("No."; Rec."No.")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the equipment number.';
                }
                field(Description; Rec.Description)
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the description.';
                }
                field(Status; Rec.Status)
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the status.';
                }
            }
        }
    }
}
```

### Pourquoi `repeater` et pas `group` ?

`group` est un conteneur **statique** — il regroupe des champs autour d'un seul enregistrement courant, comme dans une Card. `repeater` est un conteneur **itératif** — il dit à BC "itère sur tous les enregistrements de la SourceTable et affiche ces champs pour chacun". C'est ce mécanisme qui crée le tableau : une ligne par enregistrement, une colonne par `field`.

Utiliser `group` dans une List génère une erreur de compilation ou un rendu incohérent selon la version BC. La distinction n'est pas arbitraire — elle reflète le modèle d'affichage sous-jacent.

---

## Étendre une page existante : le PageExtension

C'est l'une des opérations les plus fréquentes en projet réel. Le client veut un champ supplémentaire sur la fiche client BC standard. Vous ne modifiez pas la page `Customer Card` de Microsoft — vous créez une `pageextension`.

```al
pageextension 50110 "Customer Card Ext" extends "Customer Card"
{
    layout
    {
        addafter("Phone No.")
        {
            field("Preferred Equipment Type"; Rec."Preferred Equipment Type")
            // Ce champ doit exister dans une tableextension de la table Customer
            // S'il n'existe pas, la compilation peut passer mais le déploiement échoue
            {
                ApplicationArea = All;
                ToolTip = 'Specifies the preferred equipment type for this customer.';
            }
        }
    }

    actions
    {
        addlast(Processing)
        {
            action(ViewEquipments)
            {
                Caption = 'View Equipments';
                ApplicationArea = All;
                Image = List;
                ToolTip = 'Opens the list of equipments linked to this customer.';

                trigger OnAction()
                begin
                    // logique dans le module suivant
                end;
            }
        }
    }
}
```

### Ce que `modify` autorise — et ce qu'il interdit

Quand vous utilisez `modify` sur un champ existant dans une `pageextension`, vous ne pouvez toucher qu'à un sous-ensemble de propriétés : `Caption`, `ToolTip`, `Visible`, `Editable`, `ApplicationArea`. Toute tentative de modifier la position du champ, son type source ou sa liaison de données génère l'erreur `"You cannot change property X on an existing field"`. La logique est la même que pour les tables : vous étendez, vous ne réécrivez pas.

---

## `ApplicationArea` : pourquoi c'est obligatoire

`ApplicationArea` contrôle la visibilité d'un champ ou d'une action selon la **licence** de l'utilisateur connecté. Dans un tenant multi-tenant SaaS, BC doit filtrer ce que chaque utilisateur peut voir selon son profil de licence (Essential, Premium, Basic…).

Si vous omettez cette propriété, le champ disparaît silencieusement dans certains contextes — sans message d'erreur visible. L'utilisateur ne voit pas le champ, le développeur cherche une demi-heure ce qui ne va pas.

Mettre `ApplicationArea = All` signifie "visible quel que soit le niveau de licence". C'est la valeur à utiliser par défaut sauf besoin de restriction explicite. Ce n'est pas optionnel : sur AppSource, l'absence d'`ApplicationArea` sur un champ est un motif de rejet à la validation.

---

## `SubPageLink` : le lien que vous ne devez pas oublier

Dans une page Document, la `ListPart` qui affiche les lignes n'est pas magiquement filtrée sur le document courant. Sans `SubPageLink`, BC affiche **toutes** les lignes de la table source — celles du document 1, du document 2, de tous les documents — dans le même sous-formulaire.

```al
part(Lines; "Rental Lines Subform")
{
    ApplicationArea = All;
    SubPageLink = "Document No." = field("No.");
    // Quand l'enregistrement parent change, BC refiltre la ListPart sur Rec."No."
}
```

`SubPageLink` crée une jointure dynamique : à chaque changement d'enregistrement dans la page parent, la ListPart se recharge avec le filtre correspondant. Si vous mal formez cette propriété (mauvais nom de champ, mauvais sens de la liaison), la ListPart n'affiche aucune donnée — sans erreur, juste un tableau vide.

---

## Cas d'utilisation complets

### Cas 1 — Page Document avec lignes

```al
page 50102 "Rental Order"
{
    PageType = Document;
    SourceTable = "Rental Header";
    Caption = 'Rental Order';

    layout
    {
        area(Content)
        {
            group(General)
            {
                field("No."; Rec."No.") { ApplicationArea = All; ToolTip = 'Specifies the rental order number.'; }
                field("Customer No."; Rec."Customer No.") { ApplicationArea = All; ToolTip = 'Specifies the customer.'; }
                field("Rental Start Date"; Rec."Rental Start Date") { ApplicationArea = All; ToolTip = 'Specifies the start date.'; }
                field("Rental End Date"; Rec."Rental End Date") { ApplicationArea = All; ToolTip = 'Specifies the end date.'; }
            }

            part(Lines; "Rental Lines Subform")
            {
                ApplicationArea = All;
                SubPageLink = "Document No." = field("No.");
            }
        }
    }
}
```

### Cas 2 — Page List avec performance en tête

Une List avec beaucoup de colonnes calculées (FlowFields) peut ralentir significativement sur un grand volume de données — chaque ligne déclenche un calcul SQL. Deux leviers à connaître dès maintenant :

- Utiliser `Visible = false` sur les colonnes rarement consultées plutôt que les supprimer — l'utilisateur peut les réactiver, et elles ne chargent pas si non visibles
- Éviter les `CalcFields` dans `OnAfterGetRecord` sur les champs déjà calculés en FlowField — doublon coûteux

### Cas 3 — Promoted Actions

Les actions "promues" apparaissent dans le ruban — c'est la visibilité maximale pour l'utilisateur.

```al
actions
{
    area(Processing)
    {
        action(CheckAvailability)
        {
            Caption = 'Check Availability';
            ApplicationArea = All;
            Image = Check;
            ToolTip = 'Checks whether this equipment is currently available.';
            trigger OnAction()
            begin
            end;
        }
    }

    area(Promoted)
    {
        actionref(CheckAvailability_Promoted; CheckAvailability)
        // Référence l'action existante — pas de duplication de code
    }
}
```

💡 Depuis BC 21, la syntaxe `actionref` remplace `Promoted = true` sur l'action elle-même. L'ancienne syntaxe compile encore mais génère des warnings de compilation.

---

## Pièges de performance et de cycle de chargement

### Page Document avec beaucoup de lignes

Une `ListPart` dans une page Document recharge ses lignes à chaque navigation sur l'en-tête. Si la sous-table contient des centaines de lignes avec des colonnes FlowField, chaque navigation déclenche autant de requêtes SQL. Conséquence : une page Document qui devient lente à mesure que le volume de données augmente — difficile à diagnostiquer après coup.

Stratégies : limiter les FlowFields dans la ListPart, utiliser `Visible` pour masquer les colonnes coûteuses par défaut, envisager une page séparée si les lignes dépassent régulièrement 500 enregistrements.

### Cycles de rechargement page-subpage

Un pattern dangereux : un trigger `OnAfterGetRecord` dans la page parent qui modifie un champ lié au filtre `SubPageLink`. BC recharge la ListPart, ce qui peut déclencher à nouveau `OnAfterGetRecord` dans certains contextes. Si la logique n'est pas idempotente, vous obtenez un cycle de rechargement infini ou des comportements erratiques. Règle : `OnAfterGetRecord` ne doit jamais modifier des données — seulement mettre à jour des variables d'état locales.

---

## Erreurs fréquentes

**`ApplicationArea` manquant**
Symptôme : le champ n'apparaît pas dans l'interface, sans aucun message d'erreur.
Cause : `ApplicationArea` est absent ou vide.
Correction : ajouter `ApplicationArea = All;` sur chaque `field` et chaque `action`.

**Champ référencé qui n'existe pas dans la table source**
Symptôme : à la compilation, erreur `"The field X does not exist in table Y"` — ou pire, erreur silencieuse au déploiement si le champ est dans une extension non encore déployée.
Cause : le champ est déclaré dans la page mais absent de la table ou de son `tableextension`.
Correction : déployer d'abord la `tableextension` contenant le champ, ensuite déployer la `pageextension`.

**Utiliser `group` au lieu de `repeater` dans une List**
Symptôme : erreur de compilation ou rendu incohérent.
Cause : `group` est un conteneur statique, il ne peut pas itérer sur des enregistrements.
Correction : remplacer `group(...)` par `repeater(...)` dans `area(Content)` de la List.

**`SubPageLink` oublié ou mal formé**
Symptôme : la ListPart affiche toutes les lignes de la table (oubli de SubPageLink) ou aucune ligne (SubPageLink mal formé).
Cause : absence de la liaison document → lignes, ou nom de champ incorrect dans la liaison.
Correction : vérifier que le champ cible existe dans la table de la ListPart avec exactement le même nom. En cas de doute, utiliser la navigation AL dans VS Code pour confirmer.

**Modifier une propriété non modifiable dans un `pageextension`**
Symptôme : erreur `"You cannot change property X on an existing field"`.
Cause : tentative de modifier la position, le type ou la source d'un champ standard via `modify`.
Correction : se limiter à `Caption`, `ToolTip`, `Visible`, `Editable`, `ApplicationArea`.

---

## Propriétés essentielles à connaître

**`ApplicationArea`** — Obligatoire sur chaque `field` et `action`. Contrôle la visibilité selon la licence. Valeur par défaut : `All`.

**`ToolTip`** — Texte d'aide au survol. Obligatoire pour AppSource, bonne pratique partout ailleurs.

**`Editable`** — Peut se mettre au niveau de la page entière ou champ par champ. `Editable = false` rend la page en lecture seule.

**`Visible`** — Accepte une expression booléenne : `Visible = Rec.Status = Rec.Status::Active;`. Utile pour afficher des sections conditionnellement.

**`Importance`** — `Standard` (défaut), `Promoted` (visible en haut de fiche sans scroller), `Additional` (caché sous "Afficher plus"). Permet de hiérarchiser l'information dense sans supprimer de champs.

**`CardPageId`** — Sur une page List, définit quelle Card s'ouvre au double-clic. Sans cette propriété, le double-clic n'ouvre rien.

**`SubPageLink`** — Sur une `part()`, filtre la sous-page sur l'enregistrement parent. Sans elle, la ListPart affiche tous les enregistrements de sa table source.

---

## Bonnes pratiques

**Nommez vos objets clairement dès le départ.** `page 50100 "Equipment Card"` plutôt que `"EqCard"`. BC affiche ces noms dans les erreurs de déploiement et dans l'interface de personnalisation — un nom explicite vous fait gagner du temps en maintenance.

**Respectez les plages de numéros.** Votre partenaire Microsoft ou l'environnement sandbox vous attribue une plage (ex. 50000–59999). En dépasser génère des conflits avec d'autres extensions.

**Séparez les pages de leur logique métier.** La page déclare l'interface, les triggers et codeunits contiennent la logique. Si vous vous retrouvez avec 200 lignes de code dans `OnAction()`, c'est le signal que quelque chose appartient à une codeunit — sujet du module suivant.

**Toujours renseigner `ToolTip`.** Les utilisateurs lisent ces textes. Et si le projet évolue vers AppSource, l'absence de tooltips bloque la validation technique.

**Pensez performance dès la conception.** Une List avec des FlowFields sur chaque colonne sera lente sur un grand volume. Décidez dès le départ quelles colonnes méritent un calcul dynamique et lesquelles peuvent être `Visible = false` par défaut.

---

## Résumé

| Concept | Ce que c'est | À retenir |
|---|---|---|
| `page` | Objet AL qui définit un écran | Toujours lié à une `SourceTable` |
| `PageType = Card` | Fiche — un enregistrement | Structure : `layout > area > group > field` |
| `PageType = List` | Liste — plusieurs enregistrements | Utilise `repeater` (jamais `group`) dans `area(Content)` |
| `PageType = Document` | Document avec lignes | Contient une `part()` avec `SubPageLink` obligatoire |
| `pageextension` | Étend sans modifier le standard | `addafter`, `addbefore`, `modify` — propriétés limitées |
| `ApplicationArea` | Visibilité par licence | Toujours `All` si pas de restriction — jamais absent |
| `SubPageLink` | Filtre la ListPart sur le parent | Oublié → toutes les lignes s'affichent ; mal formé → aucune |
| `CardPageId` | Ouvre la Card au double-clic depuis une List | Doit pointer vers une Card existante |
| `repeater` vs `group` | `repeater` itère, `group` est statique | Utiliser `repeater` dans une List, `group` dans une Card |

Les pages sont le point de contact entre votre modèle de données et l'utilisateur. Choisir le bon type, câbler correctement `SubPageLink` et `CardPageId`, ne jamais oublier `ApplicationArea` — ce sont les trois réflexes qui évitent 80 % des bugs de débutant sur les pages AL. La prochaine étape : injecter de la logique métier dans ces pages via les triggers.

---

<!-- snippet
id: al_page_types_card_list
type: concept
tech: AL
level: beginner
importance: high
format: knowledge
tags: al, pages, business-central, card, list, document
title: Types de pages BC — Card vs List vs Document
content: Card affiche un seul enregistrement (structure : area > group > field). List affiche une collection (area > repeater > field) — repeater itère sur les enregistrements, group est un conteneur statique, les deux ne sont pas interchangeables. Document combine une Card avec une ListPart intégrée via part() + SubPageLink pour les lignes. Le type détermine la structure syntaxique obligatoire du layout : se tromper génère une erreur de compilation.
description: Le PageType impose une structure de layout précise — repeater dans une List, group dans une Card, part() dans un Document.
-->

<!-- snippet
id: al_page_applicationarea_missing
type: warning
tech: AL
level: beginner
importance: high
format: knowledge
tags: al, pages, applicationarea, visibilite, champ
title: ApplicationArea manquant — le champ disparaît sans erreur
content: Piège : oublier ApplicationArea sur un field ou une action → le champ n'apparaît pas dans l'interface, sans aucun message d'erreur ni warning visible. En BC multi-tenant SaaS, ApplicationArea filtre la visibilité par profil de licence — son absence désactive l'élément silencieusement. Conséquence réelle : l'utilisateur ne voit pas le champ, le développeur cherche 20 minutes. Sur AppSource, l'absence d'ApplicationArea est un motif de rejet à la validation technique. Correction : ApplicationArea = All; sur chaque field et action.
description: Propriété obligatoire sur chaque field et action — son absence rend l'élément invisible en production sans aucun message d'erreur.
-->

<!-- snippet
id: al_page_repeater_vs_group
type: warning
tech: AL
level: beginner
importance: high
format: knowledge
tags: al, pages, list, repeater, group
title: List — utiliser repeater et non group
content: Piège : utiliser group(...) dans une page List comme dans une Card → erreur de compilation ou rendu incohérent. Pourquoi : repeater est un conteneur itératif — il dit à BC d'afficher ces champs pour chaque enregistrement de la SourceTable, créant le tableau ligne par ligne. group est un conteneur statique autour d'un seul enregistrement courant — il ne sait pas itérer. Dans PageType=List, la zone répétée doit utiliser repeater(nom), pas group(nom). Le group reste utilisable dans d'autres areas de la List (filtres, FactBoxes).
description: Dans PageType=List, utiliser repeater dans area(Content) — group génère une erreur ou un affichage cassé car il ne peut pas itérer sur les enregistrements.
-->

<!-- snippet
id: al_pageextension_addafter
type: command
tech: AL
level: beginner
importance: high
format: knowledge
tags: al, pageextension, champ, ajout, layout
title: Ajouter un champ après un champ existant dans une pageextension
command: addafter("<CHAMP_EXISTANT>") { field("<NOM_CHAMP>"; Rec.<CHAMP_TABLE>) { ApplicationArea = All; ToolTip = '<TEXTE>'; } }
example: addafter("Phone No.") { field("Preferred Equipment Type"; Rec."Preferred Equipment Type") { ApplicationArea = All; ToolTip = 'Specifies the preferred equipment type for this customer.'; } }
description: Insérer un champ personnalisé après un champ standard BC — le champ doit exister dans la table ou une tableextension déployée avant la pageextension.
context: Si le champ référencé n'existe pas encore dans la tableextension, la compilation peut passer selon la version BC mais le déploiement échoue. Déployer toujours la tableextension en premier.
-->

<!-- snippet
id: al_page_subpagelink
type: concept
tech: AL
level: beginner
importance: high
format: knowledge
tags: al, pages, document, listpart, subpagelink
title: SubPageLink — filtrer une ListPart sur le document parent
content: Dans une page Document, la ListPart doit être filtrée pour n'afficher que les lignes du document courant. SubPageLink = "Document No." = field("No.") crée ce filtre dynamique : quand l'enregistrement parent change, BC refiltre la ListPart sur la valeur courante de Rec."No.". Sans SubPageLink : la ListPart affiche TOUTES les lignes de la table source — celles de tous les documents. SubPageLink mal formé (mauvais nom de champ) : la ListPart affiche zéro ligne, sans message d'erreur. Dans les deux cas, l'interface paraît fonctionner mais les données sont fausses.
description: Propriété obligatoire sur une part dans une page Document — oubliée, la sous-liste affiche tous les enregistrements ; mal formée, elle en affiche zéro.
-->

<!-- snippet
id: al_page_cardpageid
type: tip
tech: AL
level: beginner
importance: medium
format: knowledge
tags: al, pages, list, cardpageid, navigation
title: CardPageId — lier une List à sa fiche Card
content: Sur une page List, ajouter CardPageId = "Equipment Card"; pour que le double-clic ouvre automatiquement la fiche correspondante. Sans cette propriété, le double-clic n'ouvre rien — comportement difficile à expliquer à un utilisateur. La valeur doit être le nom exact (entre guillemets) d'une page Card existante dans l'extension ou dans BC standard.
description: Sans CardPageId sur une List, le double-clic sur une ligne n'ouvre aucune fiche — à renseigner dès la création de la page List.
-->

<!-- snippet
id: al_page_champ_inexistant_erreur
type: error
tech: AL
level: beginner
importance: high
format: knowledge
tags: al, pages, compilation, champ, erreur
title: Champ inexistant dans la table source — erreur de déploiement
content: Symptôme : erreur "The field X does not exist in table Y" à la compilation ou au déploiement. Cause fréquente : le champ est référencé dans la pageextension mais la tableextension qui le déclare n'est pas encore déployée, ou le nom du champ est orthographié différemment. BC est sensible à la casse et aux espaces dans les noms entre guillemets. Correction : déployer d'abord la tableextension, vérifier le nom exact du champ, utiliser la navigation AL (Ctrl+clic) dans VS Code pour confirmer que le champ existe et est accessible.
description: Référencer un champ absent de la table source génère une erreur de déploiement — toujours déployer la tableextension avant la pageextension qui l'utilise.
-->

<!-- snippet
id: al_page_importance_field
type: tip
tech: AL
level: beginner
importance: medium
format: knowledge
tags: al, pages, champ, importance, visibilite
title: Importance sur un champ — hiérarchiser sans supprimer
content: La propriété Importance contrôle la visibilité par défaut d'un champ dans une Card : Standard (affiché normalement), Promoted (affiché en h
