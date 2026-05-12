---
layout: page
title: "Gestion des erreurs et transactions en AL"

course: al
chapter_title: "Gestion erreurs et transactions"

chapter: 9
section: 1

tags: al, business central, erreurs, transactions, error handling, commit, rollback
difficulty: beginner
duration: 75
mermaid: false

status: "published"
prev_module: "/courses/al/48_expertise_lead_technique.html"
prev_module_title: "Expertise AL / Lead technique ERP"
next_module: "/courses/al/36_maintenance_erp.html"
next_module_title: "Maintenance corrective et évolutive des extensions AL"
---

# Gestion des erreurs et transactions en AL

## Objectifs pédagogiques

À la fin de ce module, tu seras capable de :

1. **Expliquer** pourquoi Business Central annule automatiquement une transaction quand une erreur survient
2. **Utiliser** `Error()`, `FieldError()` et `TestField()` pour interrompre proprement un traitement
3. **Distinguer** quand utiliser `Commit()` — et pourquoi c'est rare
4. **Lire** un message d'erreur AL et identifier la cause réelle dans le code
5. **Éviter** les pièges classiques de rollback implicite qui piègent tous les débutants

---

## Mise en situation

Tu travailles sur une extension qui gère des bons de commande internes. Ton code crée une ligne d'écriture, met à jour un solde sur une fiche client, puis envoie un e-mail de confirmation.

Tout va bien en développement. En production, un utilisateur saisit un montant négatif. L'e-mail part, le solde est modifié — mais l'écriture n'a jamais été créée. Les données sont incohérentes.

Ce module explique pourquoi c'est arrivé, et comment l'éviter.

---

## Contexte : pourquoi la gestion d'erreurs n'est pas optionnelle en ERP

Dans un ERP, chaque action utilisateur touche potentiellement plusieurs tables en même temps : une écriture comptable, un mouvement de stock, une mise à jour de fiche. Si une étape échoue à mi-chemin, tu te retrouves avec des données à moitié modifiées — ce qui est souvent pire que si rien n'avait bougé.

Business Central gère ça via un mécanisme de transaction implicite. Quand un utilisateur déclenche une action (clic sur un bouton, validation d'un document), BC ouvre une transaction. Si une erreur survient — n'importe où dans le call stack — tout ce qui a été écrit pendant cette transaction est annulé. C'est le **rollback implicite**.

🧠 **Concept clé** — Ce comportement n'est pas une particularité AL : c'est le comportement standard des bases de données transactionnelles. BC l'applique automatiquement, sans que tu aies à écrire `BEGIN TRANSACTION` ou `ROLLBACK` explicitement.

L'enjeu en AL n'est donc pas d'implémenter les transactions — elles existent déjà. L'enjeu, c'est de savoir **quand et comment déclencher une erreur correctement**, et de comprendre **où la transaction commence et se termine**.

---

## Les outils pour signaler une erreur

### `Error()` — interrompre proprement

C'est la fonction de base. Elle interrompt l'exécution, affiche un message à l'utilisateur, et déclenche le rollback de tout ce qui a été fait dans la transaction en cours.

```al
// Validation simple d'un montant
if Amount <= 0 then
    Error('Le montant doit être positif. Valeur saisie : %1', Amount);
    // %1 est remplacé par la valeur de Amount dans le message affiché
```

Le `%1`, `%2`, etc. sont des placeholders — tu peux en passer autant que nécessaire. C'est simple, mais suffisant dans la majorité des cas.

⚠️ **Erreur fréquente** — Beaucoup de débutants appellent `Error()` après avoir déjà modifié des champs sur un enregistrement. Ils s'attendent à ce que l'enregistrement "revienne" automatiquement. C'est vrai si le `Modify()` n'a pas encore été appelé (les modifications sont juste en mémoire). Mais si `Modify()` a déjà été appelé dans la même transaction, le rollback annulera bien l'écriture en base — à condition que tu sois dans la même transaction implicite.

### `FieldError()` — l'erreur ciblée sur un champ

Quand l'erreur concerne directement un champ d'un enregistrement, `FieldError()` génère un message plus précis que `Error()` et pointe vers le champ concerné dans l'interface.

```al
// Sur un enregistrement Customer déjà chargé
if Customer."Credit Limit (LCY)" = 0 then
    Customer.FieldError("Credit Limit (LCY)", 'doit être supérieur à zéro pour ce type de client');
    // Message généré : "Credit Limit (LCY) doit être supérieur à zéro pour ce type de client"
```

L'avantage : le message inclut automatiquement le nom du champ. L'utilisateur sait immédiatement où regarder.

### `TestField()` — la vérification en une ligne

C'est un raccourci pour le cas le plus fréquent : vérifier qu'un champ n'est pas vide ou nul.

```al
Customer.TestField(Name);
// Équivalent à : if Customer.Name = '' then Customer.FieldError(Name, 'must have a value');

Customer.TestField("Salesperson Code", 'VENTES');
// Vérifie que le champ a exactement la valeur 'VENTES'
```

💡 `TestField()` sans deuxième argument vérifie simplement que le champ est non vide / non nul selon son type. Avec un deuxième argument, il vérifie l'égalité exacte. C'est utile pour les règles métier du type "ce document ne peut être validé que si le statut est X".

---

## Comprendre le rollback implicite

Voici le comportement qui piège le plus souvent les débutants. Observe ce code :

```al
// Code déclenché par un bouton sur une page
local procedure ProcessOrder(var SalesHeader: Record "Sales Header")
var
    Customer: Record Customer;
    LogEntry: Record "My Log Entry";
begin
    // Étape 1 — on enregistre un log
    LogEntry.Init();
    LogEntry.Description := 'Début traitement commande ' + SalesHeader."No.";
    LogEntry.Insert();   // Écriture en base dans la transaction en cours

    // Étape 2 — on charge le client
    Customer.Get(SalesHeader."Sell-to Customer No.");

    // Étape 3 — validation métier
    if SalesHeader.Amount <= 0 then
        Error('Le montant de la commande %1 est invalide.', SalesHeader."No.");
        // 🔥 Le rollback annule AUSSI l'Insert() du log — c'est voulu

    // Suite du traitement...
end;
```

Si l'erreur se déclenche à l'étape 3, l'entrée de log créée à l'étape 1 disparaît aussi. Tout revient à l'état initial. C'est exactement ce qu'on veut dans la plupart des cas : soit tout passe, soit rien ne passe.

🧠 **Concept clé** — La transaction est liée à l'appel de niveau racine déclenché par BC (le clic utilisateur, le job scheduler, etc.). Toutes les écritures faites dans cet appel sont dans la même transaction, peu importe combien de procédures tu traverses.

---

## `Commit()` — quand et pourquoi (rarement)

`Commit()` force la validation immédiate de tout ce qui a été écrit depuis le début de la transaction. Après un `Commit()`, ces écritures sont permanentes — un `Error()` ultérieur ne les annulera plus.

```al
// Exemple d'usage légitime : journal de progression long
procedure ImportLargeFile(FileName: Text)
var
    ImportLog: Record "Import Log";
    LineCount: Integer;
begin
    LineCount := 0;

    // Pour chaque ligne du fichier...
    repeat
        // ... on traite et insère des données ...
        LineCount += 1;

        // Tous les 500 enregistrements, on valide pour libérer les verrous
        if LineCount mod 500 = 0 then begin
            ImportLog.Description := Format(LineCount) + ' lignes traitées';
            ImportLog.Insert();
            Commit(); // On valide ce qui est fait — pas de retour arrière possible
        end;
    until EndOfFile();
end;
```

⚠️ **Piège critique** — `Commit()` dans le mauvais endroit est l'une des causes les plus fréquentes de données incohérentes en BC. Si tu appelles `Commit()` au milieu d'une procédure standard (un codeunit de validation, par exemple), tu coupes la transaction en deux. Une erreur après le `Commit()` ne peut plus annuler ce qui a été fait avant.

La règle pratique : **ne place jamais un `Commit()` dans un codeunit qui peut être appelé depuis l'extérieur** (depuis une page, depuis un autre codeunit métier). Reserve-le aux traitements batch longs, isolés, où tu contrôles l'intégralité du flux.

---

## Lire et diagnostiquer une erreur AL

Quand une erreur remonte en production, le message affiché n'est souvent qu'une partie de l'information. BC génère aussi une **call stack** dans les logs.

### Anatomie d'un message d'erreur courant

```
The field Credit Limit (LCY) of table Customer contains a value (0) that cannot be found in the related table.
```

Ce message te dit :
- Le champ concerné : `Credit Limit (LCY)`
- La table source : `Customer`
- Le problème : une valeur qui ne correspond à rien dans une table liée (clé étrangère invalide, ou champ de type Code qui ne trouve pas sa correspondance)

### Erreur de type "The record already exists"

```al
MyRecord.Insert(); // 🔥 Erreur si un enregistrement avec la même clé primaire existe déjà
```

Correction — utilise `Insert(true)` pour déclencher les triggers, ou vérifie avant :

```al
if not MyRecord.Insert() then
    MyRecord.Modify(); // Si l'Insert échoue, on essaie de modifier l'existant
```

Ou plus proprement avec `InsertOrModify` si le pattern métier le permet.

### Erreur "Attempt to modify a record that does not exist"

Symptôme : tu appelles `Modify()` sur un enregistrement qui n'a pas été chargé depuis la base avec `Get()` ou `FindFirst()`, ou dont la clé primaire a changé entre le `Get()` et le `Modify()`.

```al
// ❌ Pattern qui plante silencieusement ou lève une erreur
MyRecord.Init();           // Initialise en mémoire — aucun enregistrement chargé de la base
MyRecord."No." := 'TEST';
MyRecord.Description := 'Mon test';
MyRecord.Modify();         // 🔥 Erreur : cet enregistrement n'existe pas en base

// ✅ Correction : il faut d'abord faire un Get() si l'enregistrement existe
MyRecord.Get('TEST');
MyRecord.Description := 'Mon test';
MyRecord.Modify();

// Ou si l'enregistrement est nouveau :
MyRecord.Init();
MyRecord."No." := 'TEST';
MyRecord.Description := 'Mon test';
MyRecord.Insert();         // ✅ Insert pour un nouvel enregistrement
```

---

## Cas d'utilisation réels

### Cas 1 — Validation avant une action irréversible

Tu dois vérifier plusieurs conditions avant de valider un document. La bonne approche : regrouper les validations en amont, avant de toucher quoi que ce soit en base.

```al
procedure ValidateBeforePost(SalesHeader: Record "Sales Header")
begin
    // On vérifie tout d'abord, sans rien écrire
    SalesHeader.TestField("Sell-to Customer No.");    // Client obligatoire
    SalesHeader.TestField("Posting Date");            // Date de comptabilisation obligatoire

    if SalesHeader.Amount <= 0 then
        Error('Impossible de valider une commande avec un montant nul ou négatif (%1).', SalesHeader.Amount);

    // Si on arrive ici, toutes les conditions sont remplies — on peut commencer les écritures
end;
```

### Cas 2 — Gestion d'une erreur récupérable avec `if not`

Toutes les erreurs ne méritent pas d'interrompre complètement le traitement. Sur certaines fonctions AL, tu peux intercepter l'échec sans déclencher d'erreur.

```al
var
    Customer: Record Customer;
begin
    // Get() lève une erreur si l'enregistrement n'existe pas
    // Pour l'éviter, on teste le retour booléen
    if not Customer.Get('CLIENT_INEXISTANT') then begin
        Message('Client introuvable — traitement ignoré pour cette ligne.');
        exit; // On sort proprement sans erreur
    end;

    // Si on est ici, Customer est chargé et valide
    Customer.TestField(Name);
end;
```

💡 `Get()`, `FindFirst()`, `FindSet()`, `FindLast()` retournent tous un booléen. Utiliser `if not Record.Get(...)` est le pattern idiomatique pour gérer proprement l'absence d'un enregistrement sans déclencher de rollback.

### Cas 3 — Le piège du `Commit()` dans un subscriber

C'est un scénario réel et fréquent. Tu crées un event subscriber sur `OnAfterPostSalesOrder` pour logguer quelque chose. Tu ajoutes un `Commit()` dans ton subscriber parce que "tu veux être sûr que le log est enregistré".

```al
// ❌ Dangereux
[EventSubscriber(ObjectType::Codeunit, Codeunit::"Sales-Post", 'OnAfterPostSalesDoc', '', false, false)]
local procedure LogAfterPost(var SalesHeader: Record "Sales Header")
var
    MyLog: Record "My Post Log";
begin
    MyLog.Init();
    MyLog.Description := 'Commande postée : ' + SalesHeader."No.";
    MyLog.Insert();
    Commit(); // 🔥 Coupe la transaction principale de Sales-Post
              // Tout ce qui vient après dans le codeunit de post ne peut plus être annulé
end;
```

La correction : retire le `Commit()`. Si l'ordre global de post réussit, ton log sera persisté avec lui. Si le post échoue, ton log disparaît aussi — ce qui est exactement le comportement attendu.

---

## Bonnes pratiques

**Valide en amont, écris en aval.** Regroupe toutes tes vérifications métier avant de commencer à modifier des enregistrements. Un `Error()` déclenché avant le premier `Insert()` ou `Modify()` n'a rien à annuler — c'est le scénario le plus propre.

**Des messages d'erreur utiles.** Un message du type `'Erreur'` n'aide personne. Inclus toujours la valeur problématique (`%1`), le contexte (numéro de document, code client), et si possible ce que l'utilisateur doit faire pour corriger.

**Ne swallow jamais une erreur silencieusement.** Il est techniquement possible d'utiliser `ClearLastError()` pour ignorer une erreur. Ne le fais pas sauf cas très spécifique — les données dans un état indéterminé sont pires qu'un message d'erreur visible.

**`Commit()` est un signal d'alarme.** Si tu ressens le besoin d'en mettre un, interroge-toi sur la structure de ton traitement. Souvent, le vrai problème est que ton codeunit fait trop de choses à la fois.

---

## Résumé

| Concept | Ce qu'il fait | À retenir |
|---|---|---|
| `Error(msg, %1)` | Interrompt l'exécution et déclenche le rollback | Principal outil de validation métier |
| `FieldError(Field, msg)` | Erreur ciblée sur un champ, message enrichi | Préférer à `Error()` quand c'est un champ spécifique |
| `TestField(Field)` | Vérifie qu'un champ est non vide | Raccourci idiomatique pour les champs obligatoires |
| Rollback implicite | Annule toutes les écritures de la transaction si une erreur survient | Comportement automatique — pas de code à écrire |
| `Commit()` | Valide définitivement les écritures en cours | Rare, réservé aux batchs longs — dangereux dans les flux normaux |
| `if not Record.Get(...)` | Récupère proprement l'absence d'un enregistrement | Pattern standard pour éviter les erreurs de "record not found" |

En AL, la gestion d'erreurs est moins une question de syntaxe qu'une question de raisonnement : comprendre que la transaction implicite est ton filet de sécurité, et que ton travail est de déclencher les erreurs au bon moment — avant d'écrire, pas après.

---

<!-- snippet
id: al_error_basic_usage
type: command
tech: AL
level: beginner
importance: high
format: knowledge
tags: al, error, validation, business-central
title: Déclencher une erreur avec message formaté
command: Error('<MESSAGE>', <VALEUR>);
example: Error('Le montant %1 est invalide pour la commande %2.', Amount, SalesHeader."No.");
description: Interrompt l'exécution, affiche le message à l'utilisateur et déclenche le rollback de toute la transaction en cours.
-->

<!-- snippet
id: al_testfield_usage
type: command
tech: AL
level: beginner
importance: high
format: knowledge
tags: al, testfield, validation, champ-obligatoire
title: Vérifier qu'un champ est non vide avec TestField
command: <RECORD>.TestField(<FIELD>);
example: SalesHeader.TestField("Sell-to Customer No.");
description: Lève une FieldError automatique si le champ est vide ou nul. Variante avec 2e argument pour vérifier une valeur exacte : TestField(Status, Status::Released).
-->

<!-- snippet
id: al_fielderror_usage
type: command
tech: AL
level: beginner
importance: medium
format: knowledge
tags: al, fielderror, validation, message-erreur
title: Erreur ciblée sur un champ avec FieldError
command: <RECORD>.FieldError(<FIELD>, '<COMPLEMENT>');
example: Customer.FieldError("Credit Limit (LCY)", 'doit être supérieur à zéro pour ce type de client');
description: Génère un message incluant automatiquement le nom du champ. Plus précis qu'Error() quand le problème concerne un champ identifiable.
-->

<!-- snippet
id: al_rollback_implicit_concept
type: concept
tech: AL
level: beginner
importance: high
format: knowledge
tags: al, transaction, rollback, business-central
title: Le rollback implicite en Business Central
content: Chaque action utilisateur (clic bouton, validation document) ouvre une transaction BC. Si Error() est appelé n'importe où dans le call stack, BC annule automatiquement TOUTES les écritures (Insert/Modify/Delete) effectuées depuis le début de cette transaction — même dans des codeunits appelés en profondeur. Aucun code explicite de rollback n'est nécessaire.
description: Mécanisme fondamental BC : une erreur = tout annulé. Cela signifie qu'un Error() après un Insert() annule aussi l'Insert(), même si Modify() n'a pas encore été appelé.
-->

<!-- snippet
id: al_commit_danger
type: warning
tech: AL
level: beginner
importance: high
format: knowledge
tags: al, commit, transaction, piege
title: Commit() coupe définitivement la transaction
content: Piège : appeler Commit() dans un codeunit appelable depuis l'extérieur (page, autre codeunit) coupe la transaction en deux. Conséquence : une erreur après le Commit() ne peut plus annuler ce qui a été écrit avant — données potentiellement incohérentes. Correction : réserver Commit() aux batchs longs et isolés où tout le flux est contrôlé localement.
description: Après Commit(), le rollback implicite ne couvre plus les écritures précédentes. Ne jamais placer Commit() dans un event subscriber ou un codeunit de validation standard.
-->

<!-- snippet
id: al_get_safe_pattern
type: tip
tech: AL
level: beginner
importance: high
format: knowledge
tags: al, get, record-not-found, pattern
title: Utiliser "if not Record.Get()" pour éviter l'erreur record not found
content: Customer.Get('CODE') lève une erreur si l'enregistrement n'existe pas et déclenche un rollback. Pattern sûr : if not Customer.Get('CODE') then exit; — le booléen retourné permet de gérer l'absence sans interrompre la transaction. Fonctionne aussi avec FindFirst(), FindLast(), FindSet().
description: Get() sans vérification du retour est une source fréquente d'erreurs inattendues. Toujours tester le booléen retourné si l'existence de l'enregistrement n'est pas garantie.
-->

<!-- snippet
id: al_insert_vs_modify_error
type: error
tech: AL
level: beginner
importance: high
format: knowledge
tags: al, insert, modify, record, erreur-frequente
title: Erreur "record does not exist" sur Modify après Init
content: Symptôme : erreur "Attempt to modify a record that does not exist" sur un Modify(). Cause : Init() crée un enregistrement en mémoire uniquement — aucun Get() n'a chargé de données depuis la base. Correction : utiliser Insert() pour un nouvel enregistrement, ou Get() suivi de Modify() pour un enregistrement existant.
description: Init() + Modify() est un pattern invalide. Init() ne charge rien depuis la base — il initialise les valeurs par défaut en mémoire seulement.
-->

<!-- snippet
id: al_validate_before_write
type: tip
tech: AL
level: beginner
importance: medium
format: knowledge
tags: al, validation, bonne-pratique, transaction
title: Regrouper toutes les validations avant la première écriture
content: Placer tous les TestField(), FieldError() et Error() de validation au début de la procédure, avant tout Insert()/Modify()/Delete(). Un Error() déclenché avant la première écriture n'a rien à annuler : c'est le scénario le plus propre et le moins risqué. Si les validations sont dispersées après des écritures, le rollback doit défaire du travail déjà fait.
description: Règle de structure : valider en amont, écrire en aval. Réduit le risque d'état intermédiaire et facilite la lecture du code.
-->
