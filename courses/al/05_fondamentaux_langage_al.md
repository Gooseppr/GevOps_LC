---
layout: page
title: "Fondamentaux du langage AL"

course: al
chapter_title: "Fondations ERP / AL"

chapter: 1
section: 2

tags: al, business-central, syntaxe, objets, variables, procedures, triggers
difficulty: beginner
duration: 120
mermaid: false

status: "published"
prev_module: "/courses/al/01_ecosysteme_bc.html"
prev_module_title: "Comprendre l'écosystème ERP Microsoft Business Central"
next_module: "/courses/al/03_installation_environnement_al.html"
next_module_title: "Installation environnement développeur AL"
---

# Fondamentaux du langage AL

## Objectifs pédagogiques

À l'issue de ce module, vous serez capable de :

1. **Identifier** la structure d'un fichier AL et les types d'objets qui le composent
2. **Déclarer** des variables typées, des procédures et des triggers dans la syntaxe AL
3. **Distinguer** les types de données natifs AL et choisir le bon type selon le besoin
4. **Lire et écrire** un bloc de code AL simple avec contrôle de flux
5. **Appliquer** les conventions de nommage et les règles de portée des variables

---

## Mise en situation

Vous intégrez une équipe qui développe une extension Business Central pour une PME de négoce. Le premier ticket qui vous atterrit dessus : *"Ajouter un champ 'Priorité livraison' sur la fiche client, avec une valeur par défaut calculée selon la région."*

Ça a l'air simple. Mais avant d'ouvrir VS Code et de créer quoi que ce soit, vous allez devoir comprendre comment AL est structuré — parce que sans ça, vous ne saurez pas où écrire ce code, comment nommer vos variables, ni pourquoi le compilateur se plaint.

Ce module couvre exactement ça : la grammaire de base du langage, les types d'objets, les variables, les procédures et les triggers. Le ticket attendra — les fondations d'abord.

---

## Contexte : pourquoi AL est fait comme ça

AL (Application Language) n'est pas un langage généraliste comme C# ou Python. Il a été conçu spécifiquement pour décrire des **extensions de comportement sur un modèle de données ERP existant**. Cela a des conséquences directes sur sa syntaxe.

En AL, vous ne créez pas un programme qui tourne de façon autonome. Vous définissez des **objets** (table, page, codeunit...) qui viennent s'accrocher à la plateforme Business Central. Le runtime BC les charge, les exécute au bon moment, et gère la persistence des données. Votre code répond à des événements — on appelle ça des **triggers** — plutôt que de piloter un flux d'exécution de A à Z.

C'est un paradigme un peu différent de ce qu'on fait en développement web classique. Moins de liberté sur l'architecture d'exécution, mais une intégration très profonde avec le moteur ERP.

🧠 **AL = langage orienté objets ERP** — chaque fichier `.al` décrit un objet BC. Un objet a un type, un ID, un nom, et contient du code qui réagit à des triggers.

---

## Structure d'un fichier AL

Chaque fichier AL définit **un seul objet**. Pas deux, pas zéro — un. C'est une règle dure.

La structure générale est toujours la même :

```al
// Type et identifiant de l'objet
codeunit 50100 "Mon Premier Calcul"
{
    // Déclarations globales à l'objet (variables, procédures)

    procedure CalculerRemise(MontantHT: Decimal): Decimal
    var
        TauxRemise: Decimal; // variable locale à cette procédure
    begin
        TauxRemise := 0.1; // 10%
        exit(MontantHT * TauxRemise); // valeur de retour
    end;
}
```

Décortiquons les éléments :

- `codeunit 50100` : le **type** de l'objet, suivi de son **ID numérique**
- `"Mon Premier Calcul"` : le **nom** de l'objet — toujours entre guillemets doubles si il contient des espaces
- `procedure` : une fonction AL
- `var` : bloc de déclaration des variables locales
- `begin / end` : délimiteurs d'un bloc de code (comme `{}` en C# ou Java)

💡 Les IDs entre 50000 et 99999 sont réservés aux développements sur tenant propre (développement local ou par-tenant). Pour des extensions AppSource publiées, vous utilisez une plage d'IDs attribuée par Microsoft. Ne pas s'inquiéter de ça pour l'instant — retenez juste que le numéro a une signification.

---

## Les types d'objets AL

Avant d'écrire du code, il faut savoir dans quel type d'objet l'écrire. Voici les principaux que vous rencontrerez dès le départ :

| Type | Rôle | Analogie |
|------|------|----------|
| `table` | Structure de données persistée en base | Une classe + un schéma SQL |
| `page` | Interface utilisateur (formulaire, liste) | Une vue dans un framework MVC |
| `codeunit` | Bloc de logique métier pur | Une classe de services/utilitaires |
| `report` | Génération de documents / exports | Un template de rapport |
| `tableextension` | Extension d'une table existante | Un "patch" sur un schéma existant |
| `pageextension` | Extension d'une page existante | Un "patch" sur une UI existante |

Les deux derniers — `tableextension` et `pageextension` — sont au cœur du modèle d'extension BC. C'est grâce à eux que vous pouvez modifier le comportement de l'application standard sans toucher au code Microsoft. Ils seront traités en détail dans les modules suivants. Pour l'instant, retenez qu'ils existent et qu'ils suivent la même syntaxe que leurs homologues.

---

## Les variables en AL

### Déclaration

En AL, toutes les variables doivent être déclarées avant utilisation dans un bloc `var`. Pas d'inférence de type, pas de `let` ou `var` façon JavaScript. Chaque variable a un type explicite.

```al
var
    NomClient: Text[100];    // texte limité à 100 caractères
    MontantTotal: Decimal;   // nombre décimal (2 décimales par défaut)
    CompteurLignes: Integer; // entier
    EstActif: Boolean;       // vrai/faux
    DateCreation: Date;      // date (sans heure)
    HeureDebut: Time;        // heure (sans date)
    HorodatageMAJ: DateTime; // date + heure
```

### Les types fondamentaux

AL dispose d'un ensemble de types natifs qu'il faut connaître. Voici ceux que vous utiliserez constamment :

**Types simples :**

- `Integer` — entier 32 bits, de -2 147 483 648 à 2 147 483 647
- `BigInteger` — quand Integer ne suffit pas (rarement)
- `Decimal` — pour les montants et quantités. Stocke jusqu'à 18 chiffres significatifs avec 5 décimales
- `Boolean` — `true` / `false`, minuscules
- `Text[n]` — chaîne de longueur maximale `n`. `Text` sans longueur est déconseillé dans les tables
- `Code[n]` — comme `Text`, mais stocké en majuscules et sans espaces en début/fin. Utilisé pour les identifiants (N° article, code client...)
- `Date` — date uniquement, pas d'heure
- `Time` — heure uniquement
- `DateTime` — les deux combinés

🧠 **`Code` vs `Text`** — La différence n'est pas qu'esthétique. `Code` force la casse majuscule et le trim automatique. Tous les champs clés dans BC (numéros de document, codes article...) sont de type `Code`. Si vous cherchez `'art-001'` dans un champ `Code`, BC cherche en réalité `'ART-001'`.

**Types complexes (pour référencer d'autres objets) :**

- `Record` — référence à une ligne d'une table
- `Page` — référence à une page BC
- `Codeunit` — référence à un codeunit

```al
var
    ClientRec: Record Customer;     // variable qui pointe vers la table Customer
    NomArticle: Code[20];           // identifiant article, stocké en majuscules
    Description: Text[100];         // description libre
```

### Portée des variables

La portée fonctionne ainsi :

- Variables déclarées dans le bloc `var` **d'une procédure** → locales à cette procédure
- Variables déclarées dans le bloc `var` **de l'objet** (hors de toute procédure) → globales à l'objet

```al
codeunit 50101 "Gestion Priorité"
{
    var
        CompteurGlobal: Integer; // visible dans toutes les procédures de ce codeunit

    procedure MaProc()
    var
        CompteurLocal: Integer; // visible uniquement dans MaProc
    begin
        CompteurLocal := 1;
        CompteurGlobal += 1;
    end;
}
```

⚠️ **Les variables globales d'objet ne persistent pas entre deux appels** — elles sont réinitialisées à chaque instanciation du codeunit. Si vous avez besoin de persistence, il faut passer par une table ou des paramètres.

---

## Syntaxe et contrôle de flux

### Assignation et opérateurs

```al
// Assignation — le signe := (pas =)
MontantTotal := 1500.50;
NomClient := 'Dupont SA';

// Opérateurs arithmétiques classiques
MontantTTC := MontantHT * 1.2;
Reste := TotalCommande - AcompteVerse;

// Concaténation de texte
MessageComplet := 'Bonjour ' + NomClient + ', votre solde est de ' + Format(Solde);
// Format() convertit un Decimal ou Date en Text — indispensable pour les concaténations
```

### Conditions

```al
// IF simple
if MontantTotal > 10000 then
    Priorite := 'HAUTE';

// IF / ELSE
if EstActif then begin
    // begin/end obligatoire si plusieurs instructions dans la branche
    EnvoyerNotification(NomClient);
    LogActivite('client actif traité');
end else
    Priorite := 'BASSE';

// CASE — équivalent du switch
case RegionCode of
    'IDF':
        DelaLivraison := 1;
    'SUD', 'OUEST':
        DelaLivraison := 2;
    else
        DelaLivraison := 3;
end;
```

💡 Le `begin/end` n'est nécessaire que si la branche contient **plusieurs instructions**. Pour une seule instruction, vous pouvez l'écrire directement après le `then`. C'est une source fréquente de bugs quand on ajoute une ligne sans penser à ajouter le `begin`.

### Boucles

```al
// FOR classique
for i := 1 to 10 do begin
    Total += i;
end;

// FOR DOWNTO
for i := 10 downto 1 do
    Message += Format(i) + ' ';

// WHILE
while Compteur < MaxIterations do begin
    TraiterElement(Compteur);
    Compteur += 1;
end;

// REPEAT / UNTIL — équivalent du do/while
repeat
    Compteur += 1;
until Compteur >= 100;
```

---

## Procédures et fonctions

En AL, on parle de **procédures** — le terme "fonction" n'est pas utilisé dans la doc officielle, même si c'est bien le même concept.

### Procédure sans retour

```al
procedure AfficherBienvenue(NomUtilisateur: Text[100])
begin
    Message('Bonjour, %1 !', NomUtilisateur);
    // Message() est une fonction BC qui affiche une boîte de dialogue
end;
```

### Procédure avec valeur de retour

```al
// Le type de retour se déclare après les parenthèses
procedure CalculerTVA(MontantHT: Decimal; TauxTVA: Decimal): Decimal
begin
    exit(MontantHT * TauxTVA / 100);
    // exit() est le mot-clé AL pour retourner une valeur
end;
```

### Passage de paramètres : valeur vs référence

Par défaut, AL passe les paramètres **par valeur** — la procédure travaille sur une copie. Pour modifier la variable de l'appelant, il faut utiliser `var` devant le paramètre.

```al
// Passage par valeur — MontantHT est une copie, l'original ne change pas
procedure AppliquerRemise(MontantHT: Decimal): Decimal
begin
    MontantHT := MontantHT * 0.9; // modifie la copie locale
    exit(MontantHT);
end;

// Passage par référence — MontantHT est l'original
procedure AppliquerRemiseSurPlace(var MontantHT: Decimal)
begin
    MontantHT := MontantHT * 0.9; // modifie la variable de l'appelant
end;
```

🧠 Passer un `Record` par valeur charge une copie complète de l'enregistrement en mémoire. Pour les tables avec beaucoup de champs, c'est coûteux. En pratique, on passe presque toujours les `Record` avec `var`.

### Visibilité des procédures

```al
// Accessible depuis d'autres objets AL
procedure ProcédurePublique()
begin
    // ...
end;

// Accessible uniquement dans cet objet
local procedure ProcédurePrivée()
begin
    // ...
end;

// Accessible depuis l'objet et ses extensions (pattern EventSubscriber)
internal procedure ProcédureInterne()
begin
    // ...
end;
```

---

## Les triggers

C'est là qu'AL devient vraiment différent d'un langage généraliste. Un trigger est une procédure spéciale, **appelée automatiquement par le runtime BC** quand un événement se produit sur l'objet.

Sur une table, les triggers principaux sont :

```al
table 50100 "Priorité Livraison"
{
    fields
    {
        field(1; "No."; Code[20]) { }
        field(2; Montant; Decimal) { }
    }

    trigger OnInsert()
    // Déclenché automatiquement quand on insère un enregistrement
    begin
        "No." := 'PL-' + Format(Today());
    end;

    trigger OnModify()
    // Déclenché avant chaque modification
    begin
        if Montant < 0 then
            Error('Le montant ne peut pas être négatif.');
        // Error() interrompt l'exécution et affiche un message d'erreur
    end;

    trigger OnDelete()
    // Déclenché avant la suppression
    begin
        // vérifications avant suppression
    end;
}
```

Sur une page, les triggers réagissent aux actions utilisateur :

```al
pageextension 50100 "Extension Fiche Client" extends "Customer Card"
{
    trigger OnAfterGetRecord()
    // Déclenché après chaque chargement d'enregistrement dans la page
    begin
        // rafraîchir des champs calculés, vérifier des états...
    end;
}
```

⚠️ **`OnInsert` et `OnModify` ne se déclenchent pas en cas d'import bulk via `Insert(true)` ou `Modify(true)`** — le paramètre booléen `true` indique "ignore les triggers". C'est intentionnel pour les performances, mais ça veut dire que votre logique de validation dans ces triggers peut être contournée. À garder en tête quand on debug une incohérence de données.

---

## Construction progressive : du code minimal au code lisible

Voici comment évolue un bloc AL typique, du brouillon fonctionnel vers quelque chose de maintenable.

**Version 1 — ça compile, c'est tout**

```al
procedure v1(x: Decimal; y: Text[20]): Decimal
var
    z: Decimal;
begin
    if y = 'A' then z := x * 0.05 else if y = 'B' then z := x * 0.1 else z := x * 0.15;
    exit(z);
end;
```

**Version 2 — noms explicites, structure lisible**

```al
procedure CalculerTauxRemise(MontantCommande: Decimal; CategorieClient: Text[20]): Decimal
var
    TauxRemise: Decimal;
begin
    case CategorieClient of
        'A': TauxRemise := 0.05;
        'B': TauxRemise := 0.10;
        else TauxRemise := 0.15;
    end;
    exit(TauxRemise);
end;
```

**Version 3 — validation défensive + constantes nommées**

```al
procedure CalculerTauxRemise(MontantCommande: Decimal; CategorieClient: Code[10]): Decimal
var
    TauxRemise: Decimal;
begin
    if MontantCommande <= 0 then
        Error('Le montant de commande doit être positif. Valeur reçue : %1', MontantCommande);

    case CategorieClient of
        'A': TauxRemise := 0.05;  // Grand compte
        'B': TauxRemise := 0.10;  // Client régulier
        'C': TauxRemise := 0.12;  // Client fidélité
        else TauxRemise := 0.15;  // Standard
    end;

    exit(TauxRemise);
end;
```

La progression n'est pas que cosmétique : `CategorieClient` est maintenant `Code[10]` au lieu de `Text[20]`, ce qui garantit la comparaison en majuscules et évite les bugs du type `'a' ≠ 'A'`.

---

## Bonnes pratiques

**Nommage**

Utilisez des noms en PascalCase pour les procédures et les variables, et des noms entre guillemets pour les champs de table qui contiennent des espaces. Évitez les abréviations obscures : `MontantHT` est acceptable, `MntHT` ne l'est pas si vous travaillez en équipe.

**Gestion des erreurs**

`Error()` interrompt toute la transaction et affiche un message. `Message()` informe sans interrompre. Ne pas les confondre : utiliser `Message()` là où on devrait utiliser `Error()` laisse passer des données invalides en base.

**Variables non utilisées**

AL compile avec des warnings sur les variables déclarées mais jamais utilisées. Ne les laissez pas traîner — un warning ignoré finit par cacher un vrai problème.

**`begin/end` systématique**

Même pour une seule instruction dans un `if`, certaines équipes imposent `begin/end`. Ça évite des bugs à l'ajout de lignes et rend le code plus prévisible à lire. Ce n'est pas obligatoire en AL, mais c'est une convention raisonnable.

```al
// Moins défensif
if EstActif then
    EnvoyerEmail(Client);

// Plus défensif — les {} équivalents en AL
if EstActif then begin
    EnvoyerEmail(Client);
end;
```

---

## Erreurs fréquentes

**1. Oublier le `:=` pour l'assignation**

```al
// ❌ Erreur de compilation — = est utilisé pour les comparaisons
MontantTotal = 1500;

// ✅ Correct
MontantTotal := 1500;
```

AL utilise `=` pour les comparaisons et `:=` pour les assignations. Classique quand on vient du C# ou du Python.

---

**2. Concaténer un Decimal directement dans un Text**

```al
// ❌ Erreur de compilation — types incompatibles
Message := 'Total : ' + MontantTotal;

// ✅ Format() convertit en Text
Message := 'Total : ' + Format(MontantTotal);
```

AL ne fait pas de conversion implicite. `Format()` est votre outil de conversion universel vers `Text`.

---

**3. Tester une variable non initialisée**

```al
var
    NomClient: Text[100];
begin
    // NomClient vaut '' (chaîne vide) — pas null, pas une erreur runtime
    if NomClient = '' then
        Error('Nom client obligatoire.');
    // Cette vérification est donc correcte en AL
end;
```

⚠️ En AL, les variables sont toujours initialisées à leur valeur nulle de type : `0` pour les numériques, `''` pour les textes, `false` pour les booléens, `0D` pour les dates. Il n'y a pas de `null` au sens SQL dans les variables AL (c'est différent dans les champs de table avec l'option `BlankNumbers`).

---

**4. `begin/end` manquant sur un bloc multi-instructions**

```al
// ❌ Seule la première instruction est dans le if — la deuxième s'exécute toujours
if EstValide then
    CompteurOK += 1;
    LogEvenement('OK');  // ← s'exécute TOUJOURS, peu importe EstValide

// ✅ Correct
if EstValide then begin
    CompteurOK += 1;
    LogEvenement('OK');
end;
```

---

## Résumé

| Concept | Ce qu'il fait | À retenir |
|---------|--------------|-----------|
| Objet AL | Unité de base du code (table, page, codeunit...) | 1 fichier = 1 objet. Toujours un ID + un nom |
| `var` block | Déclare les variables avant utilisation | Obligatoire, pas d'inférence de type |
| `:=` | Assignation | `=` est réservé aux comparaisons |
| `begin/end` | Délimite un bloc multi-instructions | Obligatoire dès qu'on a 2+ instructions dans une branche |
| Trigger | Procédure appelée automatiquement par le runtime | Réaction à un événement ERP, pas un appel explicite |
| `exit()` | Valeur de retour d'une procédure | Équivalent de `return` dans d'autres langages |
| `Error()` | Interrompt la transaction et affiche une erreur | Annule tout ce qui a été fait depuis le dernier `Commit` |
| `var` sur un paramètre | Passage par référence | Sans `var`, la procédure reçoit une copie |
| `Code[n]` vs `Text[n]` | Code = majuscules + trim automatique | Utiliser `Code` pour tous les identifiants et clés |
| `Format()` | Convertit une valeur non-texte en `Text` | Indispensable pour les concaténations |

Vous avez maintenant les outils pour lire et écrire du code AL de base. Le ticket "champ Priorité livraison" devient tout à fait abordable — il manque juste un détail : savoir où ce champ va vivre en base de données. C'est exactement ce que couvre le module suivant.

---

<!-- snippet
id: al_assignation_operateur
type: warning
tech: AL
level: beginner
importance: high
format: knowledge
tags: al, syntaxe, assignation, operateur, erreur-frequente
title: Assignation AL avec := et non =
content: En AL, := est l'opérateur d'assignation. Le signe = est réservé aux comparaisons. Écrire `MontantTotal = 1500;` provoque une erreur de compilation immédiate.
description: Piège classique pour les développeurs C#/Python — en AL, = compare, := assigne. Le compilateur l'indique clairement.
-->

<!-- snippet
id: al_code_vs_text
type: concept
tech: AL
level: beginner
importance: high
format: knowledge
tags: al, types, code, text, majuscules
title: Différence entre Code[n] et Text[n] en AL
content: Code[n] stocke automatiquement la valeur en majuscules avec trim des espaces. Comparer 'art-001' dans un champ Code revient à chercher 'ART-001'. Text[n] conserve la casse telle quelle. Tous les identifiants ERP (N° client, code article) sont de type Code.
description: Code[n] force majuscules + trim automatique — utiliser pour tout identifiant ou clé, Text[n] pour les libellés libres.
-->

<!-- snippet
id: al_format_conversion
type: tip
tech: AL
level: beginner
importance: high
format: knowledge
tags: al, format, conversion, text, concatenation
title: Convertir une valeur non-texte en Text avec Format()
content: AL n'effectue aucune conversion implicite. Pour concaténer un Decimal, Integer ou Date dans un Text, entourer la valeur avec Format() : `Message := 'Total : ' + Format(MontantTotal);`. Sans Format(), le compilateur retourne une erreur de type incompatible.
description: Format() est l'outil universel de conversion vers Text en AL — obligatoire pour toute concaténation avec un non-texte.
-->

<!-- snippet
id: al_exit_return
type: concept
tech: AL
level: beginner
importance: high
format: knowledge
tags: al, procedure, exit, retour, valeur
title: exit() — valeur de retour d'une procédure AL
content: En AL, exit() est l'équivalent de return. Une procédure avec un type de retour déclaré doit appeler exit(valeur) pour renvoyer son résultat. exit() sans argument dans une procédure sans retour interrompt simplement l'exécution de la procédure.
description: exit() remplace return en AL — utilisé pour retourner une valeur ou sortir prématurément d'une procédure.
-->

<!-- snippet
id: al_begin_end_multiline
type: warning
tech: AL
level: beginner
importance: high
format: knowledge
tags: al, syntaxe, begin, end, if, bloc
title: begin/end obligatoire pour plusieurs instructions dans un if
content: Piège : sans begin/end, seule la première instruction après le then appartient au if. La deuxième s'exécute toujours, indépendamment de la condition. Exemple cassé : `if IsValid then / CompteurOK += 1; / Log('OK');` — Log s'exécute même si IsValid est false.
description: Sans begin/end après then, seule la ligne immédiate est conditionnelle — les suivantes s'exécutent systématiquement.
-->

<!-- snippet
id: al_var_initialisation
type: concept
tech: AL
level: beginner
importance: medium
format: knowledge
tags: al, variables, initialisation, null, valeur-defaut
title: Les variables AL sont toujours initialisées à leur valeur nulle de type
content: En AL, il n'existe pas de null pour les variables locales. Une variable non affectée vaut : 0 pour Integer/Decimal, '' pour Text/Code, false pour Boolean, 0D pour Date. Tester `if NomClient = '' then` est donc valide et ne lève jamais d'exception de référence nulle.
description: Pas de NullReferenceException en AL sur les variables — elles sont initialisées à leur zéro de type (0, '', false, 0D...).
-->

<!-- snippet
id: al_passage_reference_var
type: concept
tech: AL
level: beginner
importance: medium
format: knowledge
tags: al, procedure, parametre, reference, var
title: Passage par référence avec var devant un paramètre
content: Par défaut, AL passe les paramètres par valeur (copie). Ajouter var devant le nom du paramètre dans la signature force le passage par référence : la procédure modifie directement la variable de l'appelant. Pour les Record, passer par référence (var) évite la copie mémoire complète de l'enregistrement.
description: var devant un paramètre = passage par référence en AL. Indispensable pour modifier l'original ou éviter la copie d'un Record volumineux.
-->

<!-- snippet
id: al_trigger_insert_skip
type: warning
tech: AL
level: beginner
importance: high
format: knowledge
tags: al, trigger, oninsert, onmodify, bulk, insert
title: Insert(true) et Modify(true) ignorent les triggers AL
content: Appeler Insert(true) ou Modify(true) sur un Record court-circuite les triggers OnInsert et OnModify de la table. Ce comportement est intentionnel pour les imports bulk, mais votre logique de validation dans ces triggers ne sera pas exécutée. Une incohérence de données sans erreur visible en est souvent la cause.
description: Insert(true)/Modify(true) = performances, mais OnInsert/OnModify ne se déclenchent pas — vérifications de données ignorées silencieusement.
-->

<!-- snippet
id: al_error_vs_message
type: tip
tech: AL
level: beginner
importance: high
format: knowledge
tags: al, error, message, transaction, validation
title: Error() annule la transaction, Message() non
content: Error('texte') interrompt l'exécution et annule tout ce qui a été fait depuis le dernier Commit implicite — aucune donnée n'est persistée. Message('texte') affiche une information sans interrompre le flux ni annuler quoi que ce soit. Utiliser Message() là où Error() est attendu laisse passer des données invalides en base.
description: Error() = rollback transaction + arrêt. Message() = information sans effet sur les données. Ne pas les intervertir lors des validations métier.
-->

<!-- snippet
id: al_un_objet_par_fichier
type: concept
tech: AL
level: beginner
importance: medium
format: knowledge
tags: al, fichier, objet, structure,
