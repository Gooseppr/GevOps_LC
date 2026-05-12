---
layout: page
title: "Queries, Reports et datasets AL"

course: al
chapter_title: "Accéder aux données et produire des états"

chapter: 8
section: 1

tags: al, query, report, dataset, business-central, reporting, rdl
difficulty: beginner
duration: 90
mermaid: false

status: "published"
prev_module: "/courses/al/24_performance_sql_al.html"
prev_module_title: "Performance AL et SQL Backend"
next_module: "/courses/al/17_staging_tables_integration_patterns.html"
next_module_title: "Staging Tables & Integration Patterns"
---

# Queries, Reports et datasets AL

## Objectifs pédagogiques

À la fin de ce module, vous serez capable de :

1. **Choisir** entre `Query`, `Report` et code AL procédural en fonction du volume, de la fréquence d'exécution et de la complexité des jointures
2. **Écrire** un objet `Query` simple pour agréger ou filtrer des données Business Central
3. **Construire** le dataset d'un `Report` en déclarant ses `DataItem` et leurs liaisons
4. **Expliquer** comment les colonnes AL sont transmises au layout RDL et diagnostiquer un champ vide
5. **Identifier** les pièges classiques de cardinalité, de timing des déclencheurs et de performance sur ces deux objets

---

## Mise en situation

Vous travaillez sur une extension pour un distributeur qui veut deux choses : un **indicateur de pilotage** (volume de commandes par client sur 30 jours, affiché sur une page tableau de bord) et un **bon de commande imprimable** (PDF envoyé au fournisseur, généré environ 500 fois par jour, pouvant contenir jusqu'à 400 lignes). Ce sont deux besoins fondamentalement différents. Le premier demande un `Query`, le second un `Report`. Mais avant de choisir, encore faut-il comprendre pourquoi ce n'est pas le même outil — et dans quels cas un troisième choix, le code AL procédural pur, resterait justifié.

---

## Contexte — pourquoi ces deux objets existent

Dans Business Central, quand vous voulez lire des données croisées entre plusieurs tables, vous avez trois options :

- **Code AL procédural** : boucles `FindSet`, jointures manuelles, logique explicite ligne par ligne
- **Objet `Query`** : jointure déclarative, résultat en curseur, agrégations natives
- **Objet `Report`** : dataset déclaratif + mise en page + déclencheurs par ligne

L'analogie utile : une `Query` ressemble à une vue SQL — vous déclarez *ce que vous voulez*, pas *comment l'obtenir*. Un `Report` va plus loin : il prend un dataset (structuré comme une Query) et le projette dans un document imprimable ou exportable.

🧠 **Ces deux objets ne s'excluent pas.** Un `Report` embarque son propre dataset sans avoir besoin d'un objet `Query` séparé. La `Query` seule est utile quand vous voulez lire des données agrégées depuis du code AL (une page, une codeunit) sans générer un état imprimé.

---

## Quand choisir Query, Report ou AL procédural

Avant d'écrire une ligne de code, posez-vous trois questions : quel est le volume de données ? à quelle fréquence ce traitement s'exécute-t-il ? ai-je besoin d'un document en sortie ou juste de données ?

| Critère | Query | Report | AL procédural |
|---|---|---|---|
| **Sortie attendue** | Données pour du code AL | Document (PDF, Excel, Word) | Traitement ou données |
| **Jointures** | Déclaratives, optimisées SQL | Déclaratives via DataItem | Manuelles, boucles |
| **Agrégations** | Natives (Sum, Count, Avg…) | Non (à faire dans les déclencheurs) | Manuelles |
| **Volume données** | Bon (SQL-side) | Bon si filtres corrects | Risqué sur gros volumes |
| **Fréquence élevée** | ✅ recommandé | ✅ si dataset léger | ⚠️ attention aux boucles |
| **Logique métier complexe** | Limitée | Via déclencheurs | ✅ pleine liberté |
| **Maintenance** | Facile à lire | Facile à lire | Peut devenir verbeux |
| **Filtrage utilisateur** | Depuis le code appelant | Via `requestpage` | Depuis le code appelant |

**Lecture pratique de ce tableau :**

- Vous avez besoin d'afficher un KPI sur une page BC ? → `Query`
- Vous générez un document envoyé au client ou au fournisseur ? → `Report`
- Vous avez une logique conditionnelle complexe impossible à exprimer en déclaratif, sur un petit volume ? → AL procédural
- Vous avez un bon de livraison à 400 lignes, généré 500 fois par jour ? → `Report` avec dataset bien filtré côté `DataItemTableView` et `OnPreDataItem`, **pas** un `OnAfterGetRecord` qui charge tout puis filtre

---

## Les Queries AL

### Ce qu'une Query fait exactement

Un objet `Query` déclare une ou plusieurs tables sources (`DataItem`), leurs jointures, les colonnes à exposer, et optionnellement des agrégations. À l'exécution, BC génère la requête SQL correspondante et vous renvoie un curseur ligne par ligne.

Structure de base :

```al
query 50100 "Customer Order Summary"
{
    QueryType = Normal;

    elements
    {
        dataitem(Customer; Customer)
        {
            column(CustomerNo; "No.") { }
            column(CustomerName; Name) { }

            dataitem(SalesHeader; "Sales Header")
            {
                DataItemLink = "Sell-to Customer No." = Customer."No.";
                SqlJoinType = InnerJoin;

                column(OrderDate; "Order Date") { }

                column(OrderCount; "No.")
                {
                    Method = Count;
                }
            }
        }
    }
}
```

La jointure se déclare via `DataItemLink` — vous liez le champ de la table enfant à celui du parent. `SqlJoinType` contrôle le type de jointure SQL sous-jacent.

### Utiliser une Query depuis du code AL

```al
var
    CustomerOrderSummary: Query "Customer Order Summary";
begin
    // SetFilter AVANT Open() — après, il est ignoré silencieusement
    CustomerOrderSummary.SetFilter(OrderDate, '>=%1', Today - 30);

    CustomerOrderSummary.Open();

    while CustomerOrderSummary.Read() do
        Message('%1 → %2 commandes',
            CustomerOrderSummary.CustomerName,
            CustomerOrderSummary.OrderCount);

    CustomerOrderSummary.Close();
end;
```

💡 `SetFilter` doit être appelé **avant** `Open()`. Une fois le curseur ouvert, modifier les filtres est silencieusement ignoré — aucune erreur, juste des résultats incorrects.

### Agrégations disponibles

| Méthode | Équivalent SQL | Usage typique |
|---|---|---|
| `Count` | `COUNT(*)` | Nombre de lignes |
| `Sum` | `SUM(colonne)` | Total d'un montant |
| `Average` | `AVG(colonne)` | Moyenne |
| `Min` / `Max` | `MIN` / `MAX` | Bornes d'un ensemble |
| `None` | Pas d'agrégation | Lecture brute, pas de GROUP BY |

Quand vous utilisez une agrégation, tous les autres champs non agrégés forment automatiquement le `GROUP BY` implicite. Quand `Method = None` sur toutes les colonnes, aucun GROUP BY n'est produit : vous lisez les lignes brutes sans dédoublonnage automatique.

⚠️ **Piège fréquent** : si vous agrégez `OrderCount` et exposez aussi `OrderDate`, chaque date distincte crée un groupe — vous obtenez une ligne par combinaison Client × Date, pas un total par client. Pour un total global par client, ne pas exposer `OrderDate` dans le dataset.

---

## Les Reports AL

### La différence fondamentale avec une Query

Un `Report` est fait pour **produire un document** — PDF, Word, Excel, ou impression. Il embarque :
- Un **dataset** (des `DataItem` imbriqués, exactement comme dans une Query)
- Une **mise en page** (fichier RDL pour le rendu PDF/impression, ou layout Excel)
- Des **déclencheurs** qui s'exécutent pendant le parcours des données

C'est pour ça qu'un développeur débutant se retrouve parfois désorienté : un `Report` ressemble à une Query pour la partie données, mais il déclenche aussi du code AL à chaque ligne lue.

### Anatomie d'un Report minimal

```al
report 50200 "Purchase Order"
{
    UsageCategory = Documents;
    ApplicationArea = All;
    DefaultRenderingLayout = RDLCLayout;

    rendering
    {
        layout(RDLCLayout)
        {
            Type = RDLC;
            LayoutFile = 'Reports/PurchaseOrder.rdl';
        }
    }

    dataset
    {
        dataitem(PurchaseHeader; "Purchase Header")
        {
            column(DocumentNo; "No.") { }
            column(VendorName; "Buy-from Vendor Name") { }
            column(OrderDate; "Order Date") { }

            dataitem(PurchaseLine; "Purchase Line")
            {
                DataItemLink = "Document Type" = PurchaseHeader."Document Type",
                               "Document No." = PurchaseHeader."No.";
                DataItemTableView = where("Document Type" = const(Order));

                column(ItemNo; "No.") { }
                column(Description; Description) { }
                column(Quantity; Quantity) { }
                column(UnitPrice; "Direct Unit Cost") { }

                trigger OnAfterGetRecord()
                begin
                    // Calcul léger ou Skip conditionnel ici
                end;
            }

            trigger OnAfterGetRecord()
            begin
                // CurrReport.Skip() si une condition métier l'exige
            end;
        }
    }

    requestpage
    {
        layout
        {
            area(content)
            {
                group(Options)
                {
                    field(StartDate; StartDate)
                    {
                        ApplicationArea = All;
                        Caption = 'From date';
                    }
                }
            }
        }
    }

    var
        StartDate: Date;
}
```

**`DataItemLink`** fonctionne exactement comme dans une Query. **`DataItemTableView`** fixe un filtre permanent dans le code (non modifiable à l'exécution). **`requestpage`** est la fenêtre de paramétrage que BC affiche à l'utilisateur avant de lancer l'état.

### Les déclencheurs d'un Report

| Déclencheur | Quand il s'exécute |
|---|---|
| `OnPreReport` | Une seule fois, avant le début du dataset |
| `OnPostReport` | Une seule fois, après la dernière ligne |
| `OnPreDataItem` (DataItem) | Avant que ce DataItem commence son parcours |
| `OnAfterGetRecord` (DataItem) | À chaque enregistrement lu |
| `OnPostDataItem` (DataItem) | Après le dernier enregistrement du DataItem |

`OnPreDataItem` est le bon endroit pour `SetFilter` — la requête SQL de ce DataItem n'a pas encore été émise. `OnAfterGetRecord` est trop tardif pour filtrer ; il sert aux calculs légers et à `CurrReport.Skip()`.

💡 `CurrReport.Skip()` exclut silencieusement la ligne courante du dataset sans interrompre le parcours. Mais attention : la ligne est quand même lue depuis la base avant d'être ignorée. `Skip()` ne remplace pas un `SetFilter` en termes de performance — utilisez-le uniquement pour des conditions impossibles à exprimer de façon déclarative.

### Comment les colonnes AL atteignent le layout RDL

C'est le point qui échappe le plus aux débutants. Voici ce qui se passe concrètement :

Quand le Report s'exécute, BC construit en mémoire un dictionnaire de colonnes pour chaque ligne lue. Chaque entrée de ce dictionnaire est identifiée par le **nom déclaré dans `column(...)`**. Le fichier `.rdl` accède à ces valeurs en référençant ce nom exact — comme une variable Pascal dans un rapport Crystal Reports.

```
AL                              Mémoire Report          Layout RDL
column(DocumentNo; "No.")  →   { "DocumentNo": "BC001" }  →  =Fields!DocumentNo.Value
column(VendorName; "Buy-from Vendor Name") → { "VendorName": "Dupont SA" } → =Fields!VendorName.Value
```

**Conséquence directe** : si vous renommez `column(DocumentNo; ...)` en `column(DocNumber; ...)` côté AL sans toucher au `.rdl`, le champ `DocumentNo` n'existe plus dans le dictionnaire. Le layout cherche `Fields!DocumentNo.Value`, ne trouve rien, et affiche un champ vide — sans erreur de compilation, sans message d'avertissement.

Les noms de colonnes AL sont le **contrat entre le développeur et le designer de mise en page**. Tout renommage côté AL doit être répercuté dans le fichier `.rdl`.

**Diagnostiquer un champ vide dans le layout :**
1. Vérifier que le nom déclaré dans `column(NomExact; ...)` correspond exactement à la référence RDL (`Fields!NomExact.Value`)
2. Ouvrir le fichier `.rdl` dans un éditeur texte et rechercher l'ancienne référence
3. Vérifier que le DataItem parent est bien parcouru (ajouter un `Message` temporaire dans `OnAfterGetRecord` pour confirmer)
4. Vérifier que `DataItemTableView` ou `DataItemLink` ne filtre pas trop et exclut toutes les lignes

---

## Construction progressive — du dataset simple à l'état utilisable

### Version 1 — dataset minimal, sans layout

Avant de toucher à un fichier RDL, validez votre dataset seul. Construire d'abord, mettre en page ensuite.

```al
report 50201 "Vendor List Simple"
{
    UsageCategory = Lists;
    ApplicationArea = All;

    dataset
    {
        dataitem(Vendor; Vendor)
        {
            column(VendorNo; "No.") { }
            column(VendorName; Name) { }
            column(Balance; "Balance (LCY)") { }
        }
    }
}
```

Un DataItem unique, trois colonnes. Pas de jointure, pas de déclencheur. Suffisant pour confirmer que les champs existent et sont accessibles avant d'investir du temps dans le layout.

### Version 2 — DataItem enfant et filtre conditionnel

```al
dataitem(Vendor; Vendor)
{
    column(VendorNo; "No.") { }
    column(VendorName; Name) { }

    dataitem(VendorLedgerEntry; "Vendor Ledger Entry")
    {
        DataItemLink = "Vendor No." = Vendor."No.";
        DataItemTableView = where(Open = const(true));

        column(EntryAmount; "Amount (LCY)") { }
        column(DueDate; "Due Date") { }

        trigger OnAfterGetRecord()
        begin
            // Filtre conditionnel impossible à exprimer en déclaratif
            if Abs(VendorLedgerEntry."Amount (LCY)") < 1 then
                CurrReport.Skip();
        end;
    }
}
```

### Version 3 — requestpage et filtre utilisateur appliqué au bon endroit

```al
requestpage
{
    layout
    {
        area(content)
        {
            group(Filters)
            {
                field(OnlyOverdue; OnlyOverdue)
                {
                    ApplicationArea = All;
                    Caption = 'Overdue entries only';
                }
            }
        }
    }
}

var
    OnlyOverdue: Boolean;
```

Et dans `OnPreDataItem` du `VendorLedgerEntry` — pas dans `OnAfterGetRecord` :

```al
trigger OnPreDataItem()
begin
    if OnlyOverdue then
        SetFilter("Due Date", '<%1', Today);
end;
```

`SetFilter` dans `OnPreDataItem` agit au niveau SQL avant l'émission de la requête. Mis dans `OnAfterGetRecord` du parent, il serait ignoré : l'enfant a déjà construit sa requête. La différence n'est pas stylistique — c'est une question de lignes transportées depuis la base.

---

## Cas d'utilisation réels avec analyse de contexte

**Cas 1 — KPI tableau de bord : nombre de commandes ouvertes par commercial**

Contexte : page d'accueil rechargée à chaque connexion, données fraîches attendues, pas de document à produire.

Choix : `Query` avec `DataItem` sur `Sales Header`, colonne `SalespersonCode`, colonne `Count` sur `No.`. Depuis une Page, on instancie la Query, on l'ouvre avec un filtre sur `Status = Open`, on alimente une liste. Le SQL généré est optimisé, aucune boucle AL.

Pourquoi pas un Report ? Il n'y a pas de document à produire. Pourquoi pas du AL procédural ? Une boucle `FindSet` sur `Sales Header` avec des dizaines de milliers de commandes deviendrait rapidement problématique — la Query délègue le travail à SQL.

---

**Cas 2 — Bon de commande fournisseur (400 lignes, 500 fois/jour)**

Contexte : volume élevé, fréquence élevée, sortie PDF obligatoire.

Choix : `Report` avec `DataItem` `Purchase Header` → `Purchase Line`. Le filtre sur le document traité doit être posé via `DataItemTableView` (type = Order) et via un `SetFilter` dans `OnPreDataItem` sur le numéro de document — pas de chargement global. `OnAfterGetRecord` se limite à des calculs légers (formatage adresse, conversion devise).

À cette fréquence et à ce volume, la question du pré-traitement se pose : si une codeunit de pré-calcul prépare des données dans une table temporaire avant le lancement du Report, les `OnAfterGetRecord` deviennent quasi-vides et le Report se contente de lire des données déjà prêtes. Le trade-off : complexité de maintenance plus haute (deux objets à maintenir), mais Report plus rapide et plus prévisible. À considérer si les déclencheurs deviennent lourds.

---

**Cas 3 — Export Excel hebdomadaire des mouvements de stock**

Contexte : export planifié une fois par semaine, fichier `.xlsx` téléchargé par le contrôleur de gestion.

Choix : `Report` avec layout Excel et `DataItem` sur `Item Ledger Entry` filtré par date via `requestpage`. L'utilisateur saisit `StartDate` / `EndDate`, le Report filtre via `OnPreDataItem`, le layout Excel organise les colonnes. Pas besoin de Query séparée.

Point d'attention : un export Excel avec des dizaines de milliers de lignes non filtrées peut provoquer un timeout. Forcer un filtre de date minimal dans `OnPreDataItem` même si l'utilisateur ne le saisit pas — par exemple, les 90 derniers jours par défaut si les champs sont vides.

---

## Diagnostics pas à pas — pièges et comment les résoudre

### Dataset vide sans erreur

**Symptôme** : le Report se lance, la requestpage s'affiche, mais le document généré est vide.

**Diagnostic :**
1. Ajouter un `Message` temporaire dans `OnAfterGetRecord` du DataItem racine — s'il ne s'affiche pas, le DataItem ne lit aucune ligne
2. Vérifier `DataItemTableView` : le filtre fixe exclut-il toutes les données ?
3. Vérifier `DataItemLink` : la jointure est-elle correcte ? Un champ mal lié produit zéro correspondance
4. Tester la même condition directement en SQL ou via une Query pour isoler le problème AL du problème de données

---

### Beaucoup plus de lignes que prévu

**Symptôme** : la Query ou le Report produit 10× plus de lignes qu'attendu.

**Diagnostic :**
1. Vérifier `SqlJoinType` sur chaque DataItem enfant — une valeur par défaut inattendue peut produire un produit cartésien
2. Vérifier `DataItemLink` — un lien manquant sur un DataItem enfant de Report produit un produit cartésien complet
3. Dans une Query : vérifier les colonnes agrégées vs non agrégées — chaque colonne non agrégée ajoute une dimension de regroupement et multiplie les lignes

---

### Champ affiché vide dans le layout

**Symptôme** : le document PDF s'affiche mais une colonne est systématiquement vide.

**Diagnostic :**
1. Vérifier que le nom dans `column(NomColonne; ChampTable)` correspond exactement à la référence dans le `.rdl` (`Fields!NomColonne.Value`)
2. Ouvrir le `.rdl` dans un éditeur texte, rechercher l'ancien nom si un renommage a eu lieu
3. Vérifier que le DataItem qui produit cette colonne n'est pas sauté via `CurrReport.Skip()` ou filtré à zéro lignes

---

### SetFilter ignoré

**Symptôme** : `SetFilter` posé dans le code ne réduit pas les données.

**Diagnostic :**
- Sur une Query : `SetFilter` appelé **après** `Open()` → déplacer avant `Open()`
- Sur un Report : `SetFilter` sur un DataItem enfant posé dans `OnAfterGetRecord` du parent → déplacer dans `OnPreDataItem` du DataItem enfant

---

### Report lancé sans fenêtre de paramètres

**Symptôme** : le Report s'exécute immédiatement sans afficher la requestpage.

**Diagnostic :**
1. Vérifier `UseRequestPage = true` (valeur par défaut — peut avoir été passé à `false`)
2. Vérifier que la `requestpage` contient au moins un champ visible avec `ApplicationArea` défini

---

## Résumé

| Concept | Ce qu'il fait | À retenir |
|---|---|---|
| `Query` | Jointure + agrégation déclarative sur plusieurs tables | Instancier, `SetFilter` avant `Open()`, `Read()`, `Close()` |
| `Report` | Dataset déclaratif + mise en page + déclencheurs | Pour produire un document ; pas pour alimenter du code AL |
| `DataItem` | Déclare une table source dans Query ou Report | Le lien parent/enfant remplace les JOIN manuels |
| `DataItemLink` | Condition de jointure entre deux DataItems | Équivalent du `ON` en SQL — son absence = produit cartésien |
| `SqlJoinType` | Type de jointure SQL (Inner, LeftOuter…) | Toujours l'expliciter pour éviter les surprises |
| `DataItemTableView` | Filtre permanent câblé dans le code | Pour contraintes métier fixes, pas pour les filtres utilisateur |
| `OnPreDataItem` | Avant l'émission de la requête SQL du DataItem | Bon endroit pour `SetFilter` dynamique |
| `OnAfterGetRecord` | Après lecture de chaque ligne | Calculs légers et `CurrReport.Skip()` uniquement |
| `requestpage` | Interface de paramétrage avant lancement | Filtres et options modifiables par l'utilisateur |
| Noms de colonnes AL | Contrat avec le layout RDL | Tout renommage AL doit être répercuté dans le `.rdl` |

Le fil directeur de ce module : choisissez `Query` quand vous avez besoin de données agrégées dans du code, `Report` quand vous produisez un document. Dans les deux cas, filtrez tôt (côté SQL via `DataItemLink`, `DataItemTableView`, `OnPreDataItem`) plutôt que tard (via boucles AL ou `Skip()`). Et considérez le code procédural uniquement quand la logique métier est trop complexe pour être exprimée de façon déclarative sur un volume maîtrisé.

Le module suivant abordera les XMLports — un troisième objet AL dédié aux imports et exports de fichiers structurés, qui complète cette palette d'outils d'accès aux données.

---

<!-- snippet
id: al_query_open_read_close
type: concept
tech: AL
level: beginner
importance: high
format: knowledge
tags: al, query, curseur, business-central, dataset
title: Cycle de vie d'une Query AL — Open / Read / Close
content: Une Query AL fonctionne comme un curseur SQL : Open() exécute la requête et ouvre le flux, Read() avance d'une ligne et renvoie false quand le flux est épuisé, Close() libère le curseur. SetFilter() doit impérativement être appelé AVANT Open() — modifier les filtres après ouverture n'a aucun effet et ne produit aucune erreur.
description: Open() déclenche l'exécution SQL, Read() parcourt ligne par ligne, Close() libère les ressources. SetFilter avant Open uniquement.
-->

<!-- snippet
id: al_query_setfilter_before_open
type: warning
tech: AL
level: beginner
importance: high
format: knowledge
tags: al, query, setfilter, filtre, ordre-appel
title: SetFilter sur une Query doit précéder Open()
content: Piège : appeler SetFilter() après Open() — le filtre est silencieusement ignoré, la Query renvoie toutes les lignes sans filtrage. Aucune erreur de compilation, aucun message d'avertissement. Conséquence : surcharge mémoire et résultats incorrects. Correction : placer tous les SetFilter() avant l'appel à Open() sans exception.
description: SetFilter après Open() est ignoré sans erreur. Placer tous les filtres avant Open() sans exception.
-->

<!-- snippet
id: al_query_aggregation_groupby
type: concept
tech: AL
level: beginner
importance: high
format: knowledge
tags: al, query, agregation, group-by, method
title: Agrégation dans une Query — GROUP BY implicite et Method None
content: Dès qu'une colonne porte Method = Count/Sum/Average/Min/Max, toutes les autres colonnes sans agrégation forment automatiquement le GROUP BY. Exemple : Method=Count sur "No." + colonne OrderDate → une ligne par combinaison (Client, Date), pas un total par client. Avec Method = None sur toutes les colonnes : aucun GROUP BY, lecture brute sans dédoublonnage. Pour un total global par client, ne pas exposer OrderDate dans le dataset.
description: Colonne non agrégée = dimension de regroupement implicite. Method=None = lecture brute sans GROUP BY. Moins de colonnes = regroupement plus large.
-->

<!-- snippet
id: al_report_dataitemlink
type: concept
tech: AL
level: beginner
importance: high
format: knowledge
tags: al, report, dataitemlink, jointure, dataset
title: DataItemLink — jointure parent/enfant dans un Report
content: DataItemLink dans un DataItem enfant exprime la condition de jointure avec son parent, équivalent du ON en SQL. Syntaxe : DataItemLink = "Champ enfant" = Parent."Champ parent". Sans DataItemLink sur un DataItem enfant de Report, ce DataItem parcourt TOUTES ses lignes pour chaque ligne parent — produit cartésien silencieux qui multiplie les lignes du dataset.
description: DataItemLink est le ON de la jointure. Son absence sur un DataItem enfant produit un produit cartésien silencieux.
-->

<!-- snippet
id: al_report_dataitemtableview_vs_requestpage
type: tip
tech: AL
level: beginner
importance: medium
format: knowledge
tags: al, report, dataitemtableview, requestpage, filtre
title: DataItemTableView pour les filtres fixes, requestpage pour l'utilisateur
content: DataItemTableView = where(...) est câblé dans le code AL et ne change jamais à l'exécution — utiliser pour les contraintes métier permanentes (ex : type = Order). La requestpage expose des champs modifiables par l'utilisateur avant chaque lancement. Mélanger les deux rôles crée de la confusion : l'utilisateur ne peut pas modifier un DataItemTableView et ne comprend pas pourquoi certaines données n'apparaissent pas.
description: DataItemTableView = filtre permanent dans le code. requestpage = paramètre utilisateur au lancement. Ne pas intervertir les deux rôles.
-->

<!-- snippet
id: al_report_onpredataitem_setfilter
type: tip
tech: AL
level: beginner
importance: high
format: knowledge
tags: al, report, onpredataitem, setfilter, timing
title: SetFilter dans un Report — OnPreDataItem, pas OnAfterGetRecord
context: Filtrage dynamique d'un DataItem enfant en fonction d'une variable du report
content: ❌ Mauvais : SetFilter dans OnAfterGetRecord du DataItem parent → trop tardif, l'enfant a déjà construit sa requête SQL, le filtre est ignoré. ✅ Correct : SetFilter dans OnPreDataItem du DataItem enfant → s'exécute avant l'émission de la requête SQL, le filtre est transmis à SQL et réduit les données chargées. Exemple correct : trigger OnPreDataItem() begin if OnlyOverdue then SetFilter("Due Date", '<%1', Today); end;
description: OnPreDataItem = avant la requête SQL du DataItem → bon moment pour SetFilter. OnAfterGetRecord = après lecture → trop tard pour filtrer côté SQL.
-->

<!-- snippet
id: al_report_currreport_skip
type: tip
tech: AL
level: beginner
importance: medium
format: knowledge
tags: al, report, skip, dataset, filtre-conditionnel
title: CurrReport.Skip() — exclure une ligne sans erreur
content: CurrReport.Skip() dans un OnAfterGetRecord exclut silencieusement la ligne courante du dataset transmis au layout sans interrompre le parcours. Ut
