---
layout: page
title: "Performance AL et SQL Backend"

course: al
chapter_title: "Diagnostic et optimisation"

chapter: 8
section: 1

tags: al, business-central, performance, sql, diagnostic, optimisation, setfilter, calcfields, flowfield
difficulty: intermediate
duration: 110
mermaid: false

status: "published"
prev_module: "/courses/al/28_onboarding_utilisateur_al.html"
prev_module_title: "Onboarding utilisateur AL"
next_module: "/courses/al/09_queries_reports.html"
next_module_title: "Queries, Reports et datasets AL"
---

# Performance AL et SQL Backend

## Objectifs pédagogiques

À l'issue de ce module, tu seras capable de :

1. **Identifier** les patterns AL qui génèrent des requêtes SQL inefficaces
2. **Lire** un plan d'exécution SQL ou un log AL pour localiser un goulot d'étranglement
3. **Corriger** les causes les plus fréquentes de lenteur : boucles mal filtrées, FlowFields systématiques, mauvaise utilisation des clés
4. **Appliquer** des règles de filtrage et de projection pour réduire la charge serveur
5. **Distinguer** les optimisations à impact immédiat des ajustements marginaux

---

## Mise en situation

Tu travailles sur une extension BC qui gère des rapports de rentabilité par client. Une procédure calcule le total des ventes pour chaque client actif, applique des remises conditionnelles, puis met à jour un champ calculé dans une table custom. En dev local, ça tourne en 2 secondes. En production, sur 15 000 clients et 500 000 lignes de vente, ça plante en timeout au bout de 30 secondes — et le helpdesk remonte 5 tickets par semaine là-dessus.

Le code *semble* correct. Il compile, il produit les bons résultats. Mais il interroge SQL de façon catastrophique. C'est exactement ce genre de situation qu'on va apprendre à diagnostiquer et corriger.

---

## Pourquoi AL et SQL sont indissociables

AL est un langage de haut niveau, mais chaque instruction `FindFirst`, `CalcFields`, `SetFilter` ou boucle `repeat...until` se traduit en SQL côté serveur. Business Central ne t'expose pas directement ces requêtes — et c'est là le danger.

Un développeur qui ne pense qu'en AL peut écrire du code parfaitement lisible qui génère des dizaines de requêtes SQL inutiles, des scans de table complets, ou des jointures implicites non indexées. La conséquence : des performances qui tiennent en sandbox sur 200 enregistrements et s'effondrent en prod sur 200 000.

🧠 **Règle mentale à adopter dès maintenant** : chaque opération sur un Record AL est potentiellement une requête SQL. Avant d'écrire une boucle ou un `CalcFields`, demande-toi combien de fois ce code sera exécuté et combien d'enregistrements il touche.

---

## Ce que BC envoie réellement à SQL Server

### La table AL n'est pas une variable en mémoire

Quand tu déclares `var Customer: Record Customer;`, tu ne charges rien. Mais dès que tu fais `Customer.FindSet()`, BC exécute un `SELECT` avec les filtres actifs. Si tu as oublié de poser des filtres, tu récupères toute la table.

La projection SQL (les colonnes ramenées) dépend de ce que BC juge nécessaire. Historiquement, AL ramenait toutes les colonnes (`SELECT *` effectif). Depuis BC 2020+, le compilateur optimise partiellement — mais pas toujours, et pas quand tu manipules des records dans des procédures génériques.

### FlowFields : le piège de l'élégance

Les FlowFields sont des champs calculés définis dans les métadonnées de la table — `Balance`, `Sales (LCY)`, etc. Ils n'existent pas physiquement dans SQL. Quand tu accèdes à un FlowField sans appeler `CalcFields`, tu obtiens 0. Quand tu appelles `CalcFields`, BC lance une sous-requête `SUM` ou `COUNT` pour chaque enregistrement.

```al
// ⚠️ Scénario catastrophe : CalcFields dans une boucle
Customer.FindSet();
repeat
    Customer.CalcFields("Balance (LCY)");  // 1 requête SQL par client !
    if Customer."Balance (LCY)" > 10000 then
        DoSomething(Customer);
until Customer.Next() = 0;
```

Sur 15 000 clients, ce code envoie 15 001 requêtes SQL au serveur. Chacune fait un `SUM` sur la table `Detailed Cust. Ledg. Entry`. C'est le pattern le plus destructeur en production BC.

💡 La bonne approche : filtrer *avant* de boucler, et ne calculer les FlowFields que sur le sous-ensemble nécessaire. Ou mieux, éviter les FlowFields dans les boucles et les remplacer par une agrégation directe via `Query`.

---

## Les causes de lenteur les plus fréquentes

### 1. Boucles sans filtres suffisants

```al
// ❌ Scan complet de la table Sales Line
SalesLine.FindSet();
repeat
    if SalesLine."Document No." = CurrentDocNo then
        ProcessLine(SalesLine);
until SalesLine.Next() = 0;
```

Ce code scanne toutes les lignes de vente pour en trouver quelques-unes. La correction est évidente une fois qu'on la voit, mais ce pattern se glisse facilement dans du code réécrit rapidement :

```al
// ✅ Filtre avant FindSet
SalesLine.SetRange("Document No.", CurrentDocNo);
SalesLine.FindSet();
repeat
    ProcessLine(SalesLine);
until SalesLine.Next() = 0;
```

La différence SQL : dans le premier cas, `SELECT * FROM Sales_Line` complet. Dans le second, `SELECT * FROM Sales_Line WHERE Document_No_ = 'SO-00042'` avec utilisation de l'index sur `Document No.`.

### 2. Mauvais ordre de filtres et clés non utilisées

SQL Server utilise les index pour accélérer les recherches. En BC, les index sont définis dans les clés de table (`key(...)`). Un filtre sur un champ qui n'est pas en tête de clé force un scan.

🧠 BC choisit automatiquement la clé active en fonction des filtres `SetRange` / `SetFilter` posés. Mais ce choix automatique n'est pas toujours optimal — surtout avec des filtres complexes sur plusieurs champs.

```al
// Si la clé primaire est (No.), ce filtre ne l'utilise pas efficacement
Customer.SetRange("Country/Region Code", 'FR');
Customer.SetRange("Salesperson Code", 'DUPONT');
Customer.FindSet();
```

Si tu fais ça souvent, crée une clé secondaire ou utilise `SetCurrentKey` pour forcer BC à choisir la bonne :

```al
Customer.SetCurrentKey("Country/Region Code", "Salesperson Code");
Customer.SetRange("Country/Region Code", 'FR');
Customer.SetRange("Salesperson Code", 'DUPONT');
Customer.FindSet();
```

⚠️ `SetCurrentKey` ne crée pas l'index — il indique à AL quelle clé utiliser. Si la clé n'existe pas dans la définition de la table, BC ignorera silencieusement l'instruction.

### 3. FindFirst quand on n'a pas besoin de boucler

```al
// ❌ Utilise FindSet sans avoir besoin d'itérer
if Item.FindSet() then
    if Item."Unit Price" > 0 then
        ...
```

```al
// ✅ FindFirst : une seule requête, LIMIT 1 côté SQL
if Item.FindFirst() then
    ...
```

La différence est minime sur un seul appel, mais dans une boucle parente qui s'exécute 10 000 fois, `FindFirst` vs `FindSet` peut représenter des secondes de différence — `FindSet` prépare un curseur complet côté serveur même si tu n't'en utilises qu'un enregistrement.

### 4. IsEmpty vs FindSet pour l'existence

```al
// ❌ Charge des données juste pour vérifier l'existence
SalesHeader.SetRange("Customer No.", CustNo);
if SalesHeader.FindSet() then
    HasOrders := true;
```

```al
// ✅ IsEmpty : traduit en SELECT COUNT(*) ... HAVING COUNT > 0, bien plus léger
SalesHeader.SetRange("Customer No.", CustNo);
HasOrders := not SalesHeader.IsEmpty();
```

💡 `Count` (nombre exact) est plus lourd que `IsEmpty` (existence). Si tu as juste besoin de savoir si des enregistrements existent, `IsEmpty` est toujours le bon choix.

### 5. Modifier dans une boucle FindSet sans MODIFYALL

Si tu dois mettre à jour un champ sur tous les enregistrements filtrés avec la même valeur :

```al
// ❌ N requêtes UPDATE
Item.SetRange("Item Category Code", 'ELEC');
Item.FindSet(true); // true = verrouillage
repeat
    Item.Status := Item.Status::Blocked;
    Item.Modify();
until Item.Next() = 0;
```

```al
// ✅ 1 seule requête UPDATE avec WHERE
Item.SetRange("Item Category Code", 'ELEC');
Item.ModifyAll(Status, Item.Status::Blocked);
```

`ModifyAll` génère un `UPDATE ... WHERE` unique. La version en boucle génère autant d'UPDATE qu'il y a d'enregistrements — et chacun passe par la couche AL, le trigger validation, etc. Si tu n'as pas besoin des triggers, `ModifyAll` est 10x à 100x plus rapide.

⚠️ `ModifyAll` ne déclenche pas `OnModify`. Si ta logique métier en dépend, tu dois boucler — mais tu dois en être conscient.

---

## Utiliser les objets Query pour les agrégations

Pour les calculs de totaux, comptages ou regroupements, les objets `Query` AL sont bien plus efficaces que des boucles avec accumulation.

```al
// Définition d'une Query (fichier .query.al)
query 50100 "Customer Sales Totals"
{
    QueryType = Normal;

    elements
    {
        dataitem(Customer; Customer)
        {
            column(No; "No.") { }
            column(Name; Name) { }

            dataitem(SalesInvoiceHeader; "Sales Invoice Header")
            {
                DataItemLink = "Sell-to Customer No." = Customer."No.";
                column(Count; "No.")
                {
                    Method = Count;  // Agrégation côté SQL
                }
            }
        }
    }
}
```

```al
// Utilisation
var
    CustSalesTotals: Query "Customer Sales Totals";
begin
    CustSalesTotals.Open();
    while CustSalesTotals.Read() do begin
        // Chaque Read() lit une ligne du résultat SQL agrégé
        // Une seule requête SQL avec GROUP BY pour tout le résultat
        ProcessCustomer(CustSalesTotals.No, CustSalesTotals.Count);
    end;
    CustSalesTotals.Close();
end;
```

La Query se traduit en SQL avec `JOIN` et `GROUP BY`. Au lieu d'une boucle qui fait N sous-requêtes, tu envoies une seule requête qui ramène exactement ce dont tu as besoin. C'est l'outil le plus sous-utilisé en AL pour les problèmes de performance.

---

## Lire les signaux de lenteur : où regarder

### Event Log et Telemetry BC

En environnement SaaS, Business Central émet des traces vers Azure Application Insights si le tenant est configuré pour. Les événements clés pour le diagnostic perf :

- `RT0005` — durée d'exécution d'une requête AL/SQL dépassant un seuil
- `RT0006` — nombre excessif de requêtes SQL sur une même opération
- `AL0000E2J` — long running queries

En OnPrem, les logs SQL Server (Query Store, Extended Events) sont ta principale source.

### Le champ Duration dans les traces AL

L'outil de diagnostic intégré le plus accessible reste le **AL Profiler** (disponible dans VS Code avec l'extension AL). Il capture les durées par fonction et révèle où le temps est vraiment passé — pas toujours là où on l'attend.

💡 Avant d'optimiser, mesure. Il est fréquent de passer du temps sur une fonction qui représente 2% du temps total, en ignorant une boucle qui en représente 80%.

### Compter les requêtes avec Database.GetLastUpdateID / logs

Une astuce simple pour quantifier le problème en développement :

```al
// Encadrer un bloc suspect avec des markers de diagnostic
var
    StartTime: DateTime;
begin
    StartTime := CurrentDateTime();

    // ... bloc de code à mesurer ...

    Message('Durée : %1 ms', CurrentDateTime() - StartTime);
end;
```

C'est artisanal mais ça répond à la question "est-ce que c'est vraiment là le problème ?"

---

## Cas d'utilisation : corriger la procédure initiale

Reprenons la mise en situation du début. La procédure originale ressemble probablement à ceci :

```al
// ❌ Version originale — lente en production
procedure UpdateCustomerProfitability()
var
    Customer: Record Customer;
    SalesLine: Record "Sales Line";
    TotalAmount: Decimal;
begin
    Customer.SetRange(Blocked, Customer.Blocked::" ");  // clients non bloqués
    Customer.FindSet();
    repeat
        // FlowField dans une boucle : 1 requête SQL par client
        Customer.CalcFields("Sales (LCY)");

        // Deuxième boucle imbriquée : N*M requêtes
        SalesLine.SetRange("Sell-to Customer No.", Customer."No.");
        SalesLine.FindSet();
        repeat
            TotalAmount += SalesLine.Amount;
        until SalesLine.Next() = 0;

        // Mise à jour enregistrement par enregistrement
        Customer."Custom Profitability" := TotalAmount;
        Customer.Modify();
        TotalAmount := 0;
    until Customer.Next() = 0;
end;
```

Sur 15 000 clients avec 30 lignes en moyenne : 15 000 `CalcFields` + 15 000 `FindSet` sur SalesLine + 450 000 `Next()` + 15 000 `Modify()`. Soit environ **480 000 allers-retours SQL**.

```al
// ✅ Version optimisée
query 50101 "Customer Amount Totals"
{
    QueryType = Normal;
    elements
    {
        dataitem(SalesLine; "Sales Line")
        {
            column(CustomerNo; "Sell-to Customer No.") { }
            column(TotalAmount; Amount)
            {
                Method = Sum;
            }
        }
    }
}

procedure UpdateCustomerProfitability()
var
    Customer: Record Customer;
    AmountQuery: Query "Customer Amount Totals";
    AmountMap: Dictionary of [Code[20], Decimal];
    CustNo: Code[20];
begin
    // Étape 1 : charger tous les totaux en UNE requête SQL agrégée
    AmountQuery.Open();
    while AmountQuery.Read() do
        AmountMap.Set(AmountQuery.CustomerNo, AmountQuery.TotalAmount);
    AmountQuery.Close();

    // Étape 2 : mettre à jour via ModifyAll ou boucle ciblée
    Customer.SetRange(Blocked, Customer.Blocked::" ");
    if Customer.FindSet(true) then
        repeat
            if AmountMap.ContainsKey(Customer."No.") then begin
                Customer."Custom Profitability" := AmountMap.Get(Customer."No.");
                Customer.Modify();  // Ici on garde Modify() pour déclencher les triggers
            end;
        until Customer.Next() = 0;
end;
```

Le nombre de requêtes SQL passe de ~480 000 à **3** (une query d'agrégation, un FindSet, N Modify — inévitables si les triggers métier sont nécessaires). Si les triggers ne sont pas nécessaires, un `ModifyAll` sur les champs standards ramènerait ça à 2.

---

## Bonnes pratiques actionnables

**Filtrer toujours avant de chercher.** Poser `SetRange` / `SetFilter` avant tout `FindSet`, `FindFirst` ou `Count`. Un oubli sur une petite table est indolore en dev, désastreux en prod.

**Ne jamais appeler `CalcFields` dans une boucle sans raison impérieuse.** Si tu as besoin d'un FlowField pour tous les enregistrements d'un lot, cherche d'abord si une Query peut le calculer en une passe.

**Préférer `IsEmpty` à `FindSet` pour tester l'existence.** C'est plus lisible *et* plus rapide. Double bénéfice.

**Utiliser `ModifyAll` / `DeleteAll` quand la valeur est uniforme** et que les triggers ne sont pas requis. Documente dans un commentaire pourquoi tu bypasses les triggers — un futur mainteneur te remerciera.

**Tester avec des volumes réalistes.** Une sandbox avec 200 enregistrements ne révèle rien. Avant de merger une feature liée aux données, tester avec au moins 10% du volume production estimé.

**Mesurer avant d'optimiser.** Le AL Profiler dans VS Code est ton meilleur allié. Utilise-le avant de réécrire quoi que ce soit — tu éviteras d'optimiser la mauvaise fonction.

---

## Résumé

| Concept | Ce qu'il fait | À retenir |
|---|---|---|
| `FindSet` sans filtre | Scan complet de la table → `SELECT *` | Toujours poser des filtres avant |
| `CalcFields` en boucle | 1 requête SQL par enregistrement | Remplacer par Query avec agrégation |
| `IsEmpty` | `SELECT TOP 1` ou COUNT > 0 | Toujours préférer à FindSet pour l'existence |
| `ModifyAll` | `UPDATE ... WHERE` unique | Bypasse OnModify — documenter l'intention |
| `SetCurrentKey` | Force l'index SQL utilisé | La clé doit exister dans la table |
| `Query` AL | Requête SQL avec JOIN/GROUP BY en une passe | Outil principal pour les agrégations de masse |
| `FindFirst` vs `FindSet` | LIMIT 1 vs curseur complet | Utiliser FindFirst quand on veut ≤1 enregistrement |

La performance AL n'est pas une optimisation de fin de projet — c'est une discipline de développement. Un code qui fonctionne en dev mais s'effondre en prod n'est pas un code fonctionnel : c'est un bug à déclenchement retardé.

---

<!-- snippet
id: al_findset_filter_before
type: warning
tech: AL
level: intermediate
importance: high
tags: al, performance, findset, sql, filtrage
title: FindSet sans filtre = scan complet de table SQL
content: Appeler FindSet() sans SetRange/SetFilter préalable génère un SELECT * sans WHERE → scan complet. Sur une table de 500 000 lignes en prod, c'est un timeout garanti. Règle : toujours poser les filtres avant tout FindSet, FindFirst ou Count.
description: Absence de filtre avant FindSet → requête SQL sans WHERE → scan complet → timeout en production sur tables volumineuses
-->

<!-- snippet
id: al_calcfields_loop_danger
type: warning
tech: AL
level: intermediate
importance: high
tags: al, performance, calcfields, flowfield, boucle
title: CalcFields dans une boucle = N requêtes SQL distinctes
content: Chaque appel à CalcFields() dans un repeat...until envoie une sous-requête SQL séparée (SUM, COUNT...). Sur 15 000 enregistrements = 15 000 requêtes. Remplacer par un objet Query AL avec Method=Sum/Count pour obtenir le même résultat en une seule requête agrégée.
description: CalcFields() dans une boucle AL envoie 1 requête SQL par itération — remplacer par une Query AL avec agrégation pour traiter en une seule passe
-->

<!-- snippet
id: al_isempty_vs_findset
type: tip
tech: AL
level: intermediate
importance: high
tags: al, performance, isempty, findset, existence
title: Tester l'existence d'un enregistrement avec IsEmpty
content: Pour vérifier si des enregistrements existent après SetRange, utiliser `not Record.IsEmpty()` plutôt que `Record.FindSet()`. IsEmpty génère un SELECT TOP 1 ou COUNT limité côté SQL, sans préparer de curseur. FindSet prépare un curseur complet même si on n'utilise pas les données.
description: IsEmpty → SELECT TOP 1 côté SQL, sans curseur ; FindSet → curseur complet inutile si on vérifie juste l'existence
-->

<!-- snippet
id: al_modifyall_bulk_update
type: tip
tech: AL
level: intermediate
importance: high
tags: al, performance, modifyall, update, bulk
title: ModifyAll pour les mises à jour uniformes sans trigger
content: Quand une même valeur doit être appliquée à tous les enregistrements filtrés, utiliser ModifyAll(FieldNo, Value) au lieu d'une boucle avec Modify(). ModifyAll génère un seul UPDATE ... WHERE. Attention : ModifyAll ne déclenche PAS l'événement OnModify — documenter ce choix dans le code si la logique métier utilise OnModify.
description: ModifyAll génère 1 UPDATE SQL avec WHERE ; la boucle + Modify() en génère N. Ne déclenche pas OnModify — à documenter explicitement.
-->

<!-- snippet
id: al_setcurrentkey_index
type: concept
tech: AL
level: intermediate
importance: medium
tags: al, performance, index, setcurrentkey, sql
title: SetCurrentKey force la clé SQL utilisée par BC
content: SetCurrentKey(Field1, Field2) indique à BC quelle clé de table utiliser pour la requête SQL suivante. BC choisit normalement une clé automatiquement selon les filtres actifs, mais ce choix peut être sous-optimal sur des filtres multi-champs. Si la clé spécifiée n'existe pas dans la définition de la table, BC l'ignore silencieusement sans erreur.
description: SetCurrentKey oriente le choix d'index SQL de BC — sans effet silencieux si la clé demandée n'existe pas dans la table
-->

<!-- snippet
id: al_query_aggregation
type: concept
tech: AL
level: intermediate
importance: high
tags: al, performance, query, agregation, sql, groupby
title: Objet Query AL pour remplacer les boucles d'agrégation
content: Un objet Query AL avec Method=Sum ou Method=Count se traduit en SQL avec GROUP BY. Une seule requête remplace une boucle AL qui ferait N CalcFields. Utilisation : définir le Query dans un fichier .query.al, appeler Open(), lire avec Read() dans un while, fermer avec Close(). Résultat : données agrégées disponibles en une passe SQL.
description: Query AL avec Method=Sum/Count → 1 requête SQL GROUP BY ; remplace N CalcFields en boucle. Outil principal pour les agrégations sur gros volumes.
-->

<!-- snippet
id: al_findfirst_vs_findset
type: tip
tech: AL
level: intermediate
importance: medium
tags: al, performance, findfirst, findset, curseur
title: FindFirst quand on ne lit qu'un seul enregistrement
content: FindFirst() génère un SELECT avec LIMIT 1 côté SQL et ne prépare pas de curseur. FindSet() prépare un curseur complet même si on n'itère pas. Dans une boucle parente exécutée 10 000 fois, utiliser FindSet() à la place de FindFirst() peut représenter plusieurs secondes de différence.
description: FindFirst → LIMIT 1, pas de curseur. FindSet dans une boucle parente quand on veut 1 seul enregistrement = coût inutile répété N fois.
-->

<!-- snippet
id: al_deleteall_bulk
type: tip
tech: AL
level: intermediate
importance: medium
tags: al, performance, deleteall, bulk, trigger
title: DeleteAll pour supprimer un lot sans boucle
content: DeleteAll() sur un Record filtré génère un DELETE ... WHERE unique. La boucle avec Delete() génère 1 DELETE par enregistrement. Comme ModifyAll, DeleteAll(false) ne déclenche pas OnDelete. Passer DeleteAll(true) pour déclencher les triggers — au prix d'une boucle interne côté serveur.
description: DeleteAll() → 1 DELETE SQL avec WHERE. DeleteAll(false) bypasse OnDelete ; DeleteAll(true) déclenche les triggers enregistrement par enregistrement.
-->

<!-- snippet
id: al_perf_measure_datetime
type: tip
tech: AL
level: intermediate
importance: low
tags: al, diagnostic, mesure, performance, debug
title: Mesurer la durée d'un bloc AL avec CurrentDateTime
content: Encadrer un bloc suspect avec `StartTime := CurrentDateTime()` avant et `Duration := CurrentDateTime() - StartTime` après. Afficher avec Message() ou écrire dans un log custom. Simple mais efficace pour confirmer qu'un bloc est bien la source du problème avant de l'optimiser.
description: CurrentDateTime() - StartTime donne la durée en millisecondes d'un bloc AL — mesurer avant d'optimiser pour ne pas travailler sur le mauvais endroit.
-->
