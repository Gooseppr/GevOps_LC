---
layout: page
title: "Tests automatisés AL"

course: al
chapter_title: "Qualité et fiabilité du code AL"

chapter: 8
section: 1

tags: al, business-central, tests, automatisation, codeunit, testability, qualité
difficulty: intermediate
duration: 90
mermaid: false

status: "published"
prev_module: "/courses/al/25_securite_business_central.html"
prev_module_title: "Sécurité Business Central"
next_module: "/courses/al/30_telemetry_observabilite.html"
next_module_title: "Télémétrie et observabilité Business Central"
---

# Tests automatisés AL

## Objectifs pédagogiques

- Comprendre pourquoi les tests automatisés sont indispensables dans un projet BC en production
- Écrire des codeunits de test AL avec les annotations `[Test]`, `[TestFixture]` et les fonctions d'assertion
- Structurer un test selon le pattern AAA (Arrange / Act / Assert)
- Identifier et éviter les pièges classiques : dépendances aux données, tests non isolés, faux positifs
- Intégrer une stratégie de test cohérente dans une extension AL de taille réelle

---

## Mise en situation

Tu travailles sur une extension AL pour un distributeur. L'extension ajoute une logique de calcul de remise progressive sur les commandes ventes — 5 % au-dessus de 1 000 €, 10 % au-dessus de 5 000 €. Cette logique est appelée depuis plusieurs points : la saisie de commande, un job queue, et une API externe.

Un consultant a modifié le seuil de 1 000 € à 1 200 € pour un client spécifique. Résultat : trois semaines plus tard, les remises sont incorrectes sur les commandes importées via l'API, personne n'a fait le lien, et c'est le client final qui a remonté l'anomalie.

C'est exactement le type de régression que des tests automatisés auraient interceptée en quelques secondes, dès le premier build suivant la modification.

---

## Pourquoi tester en AL — et pourquoi c'est différent d'autres contextes

Dans la plupart des langages, tester c'est isoler une fonction pure et vérifier sa sortie. En AL, c'est un peu plus compliqué : ton code tourne dans une base de données transactionnelle, il interagit avec des tables système, des flux de validation, des triggers. La logique métier n'est jamais totalement séparée des données.

Ce contexte a une conséquence directe : Business Central fournit son propre framework de test intégré. Pas besoin de librairie externe, pas de configuration particulière. Les tests s'écrivent en AL pur, dans des codeunits spécifiques, et s'exécutent directement dans un environnement BC (sandbox ou conteneur Docker).

🧠 **Le framework de test AL est intégré au runtime BC** — tes tests ont accès à toutes les tables, triggers et logiques de l'environnement, exactement comme ton code applicatif. C'est puissant, mais ça oblige à être rigoureux sur l'isolation des données.

---

## Structure d'un codeunit de test

Un codeunit de test se distingue par la propriété `Subtype = Test`. C'est ce qui indique au runner AL que ce codeunit contient des tests à exécuter.

```al
codeunit 50100 "Remise Vente Tests"
{
    Subtype = Test;         // 👈 obligatoire pour que BC reconnaisse ce codeunit comme testable
    TestPermissions = Disabled; // on revient sur cette propriété plus bas

    [Test]
    procedure CalculRemise_SousSeuil_AucuneRemise()
    var
        RemiseCalc: Codeunit "Remise Calculator";
        MontantHT: Decimal;
        Remise: Decimal;
    begin
        // Arrange
        MontantHT := 800;  // sous le premier seuil

        // Act
        Remise := RemiseCalc.CalculerRemise(MontantHT);

        // Assert
        Assert.AreEqual(0, Remise, 'Aucune remise attendue sous 1000 €');
    end;
}
```

Quelques points à fixer immédiatement :

- **`[Test]`** : annotation qui marque une procédure comme cas de test. Seules ces procédures sont exécutées par le runner.
- **`Assert`** : codeunit système (ID 130000) fourni par Microsoft. Il expose les méthodes d'assertion classiques — `AreEqual`, `AreNotEqual`, `IsTrue`, `IsFalse`, `ExpectedError`, etc.
- **TestPermissions** : définit avec quels droits le test tourne. `Disabled` signifie qu'on ignore les permissions BC pour ce test (utile quand on teste la logique pure, pas les accès). Les options sont `Disabled`, `Restrictive`, `NonRestrictive`.

💡 Le codeunit `Assert` (ID 130000) est disponible dans les extensions BC via la dépendance standard. Tu n'as pas à le déclarer explicitement dans `app.json` si tu dépends déjà du package de base.

---

## Le pattern AAA — pas juste une convention

Arrange / Act / Assert est le squelette de tout bon test, mais en AL il prend un sens particulier. La phase **Arrange** inclut souvent la création de données de test en base, ce qui exige de l'attention.

```al
[Test]
procedure CalculRemise_AuDessus5000_AppliqueRemiseDix()
var
    RemiseCalc: Codeunit "Remise Calculator";
    Client: Record Customer;
    Commande: Record "Sales Header";
    Remise: Decimal;
begin
    // Arrange — on crée un client et une commande de test
    LibrarySmallBusiness.CreateCustomer(Client);
    LibrarySales.CreateSalesHeader(Commande, Commande."Document Type"::Order, Client."No.");
    // on simule un montant HT de 6000 €
    Commande."Amount Excl. VAT" := 6000;
    Commande.Modify();

    // Act
    Remise := RemiseCalc.CalculerRemiseSurCommande(Commande);

    // Assert
    Assert.AreEqual(10, Remise, 'Remise de 10% attendue au-dessus de 5000 €');
end;
```

Les **Library codeunits** (`LibrarySales`, `LibraryPurchase`, `LibraryInventory`…) sont des helpers fournis par Microsoft dans les tests de BC lui-même. Ils permettent de créer rapidement des entités valides sans devoir gérer tous les champs obligatoires à la main. Dans une vraie extension, tu les références via la dépendance au module de test BC.

🧠 Ces Library codeunits ne sont disponibles que dans les extensions avec `"target": "OnPrem"` ou dans des build de test spécifiques — ils ne sont jamais déployés en production.

---

## Gérer l'isolation des données : le piège principal

C'est la source numéro un de tests instables en AL. Parce que les tests s'exécutent dans une vraie base de données, deux tests qui créent des données similaires peuvent s'interférer — surtout si l'un échoue en laissant des données orphelines.

BC gère ça via les **transactions de test**. Par défaut, chaque fonction `[Test]` est exécutée dans une transaction qui est **rollback automatiquement** à la fin du test, que celui-ci passe ou échoue. Tu ne pollues donc pas la base entre deux tests.

⚠️ Ce comportement automatique ne s'applique qu'aux codeunits avec `Subtype = Test`. Si tu appelles un codeunit applicatif qui fait un `Commit()` explicite depuis un test, ce commit échappe au rollback automatique. Les données persistent alors en base — et le test suivant peut hériter d'un état inattendu.

```al
// 🚨 Exemple problématique : un Commit() explicite dans le code testé
procedure TraiterCommande(var Commande: Record "Sales Header")
begin
    // ...logique...
    Commit(); // ← ce commit rend les données permanentes même depuis un test
end;
```

La bonne pratique ici : soit refactorer le code pour ne committer que là où c'est vraiment nécessaire, soit utiliser `[TransactionModel(TransactionModel::AutoRollback)]` sur le test si ton runner le supporte.

---

## Tester les erreurs attendues

Une logique métier solide doit lever des erreurs explicites dans les cas invalides. Tester ces erreurs est aussi important que tester les cas nominaux.

```al
[Test]
procedure CalculRemise_MontantNegatif_DevraitEchouer()
begin
    // Assert.ExpectedError doit être appelé AVANT l'action qui lève l'erreur
    Assert.ExpectedError('Le montant ne peut pas être négatif');

    // Act — cette ligne doit lever l'erreur déclarée ci-dessus
    RemiseCalc.CalculerRemise(-100);
end;
```

Le mécanisme fonctionne ainsi : `Assert.ExpectedError` enregistre le message d'erreur attendu. Quand le code qui suit lève une erreur avec ce message, le test passe. Si aucune erreur n'est levée, ou si le message ne correspond pas, le test échoue.

💡 `Assert.ExpectedError` fait une comparaison de sous-chaîne, pas une égalité stricte. Tu n'as pas besoin de reproduire le message exact — juste une partie discriminante suffit. C'est utile quand le message inclut des valeurs dynamiques.

---

## Construction progressive : d'un test simple à une suite structurée

### V1 — Un test isolé, tout dans la procédure

C'est le point de départ. Un seul test, tout inline, aucune abstraction. Ça convient pour valider rapidement une fonction.

```al
[Test]
procedure TestSimple()
begin
    Assert.AreEqual(5, MaFonction(2, 3), 'Résultat inattendu');
end;
```

### V2 — Factoriser l'initialisation avec `[TestSetup]`

Dès que plusieurs tests partagent le même contexte initial, `[TestSetup]` évite la duplication.

```al
codeunit 50101 "Remise Suite Tests"
{
    Subtype = Test;

    var
        Client: Record Customer;
        LibrarySales: Codeunit "Library - Sales";

    [TestSetup]
    procedure Initialiser()
    begin
        // Cette procédure est exécutée AVANT chaque test du codeunit
        LibrarySales.CreateCustomer(Client);
    end;

    [Test]
    procedure Test_RemiseSur1000()
    begin
        // Client est déjà créé et disponible ici
        // ...
    end;

    [Test]
    procedure Test_RemiseSur5000()
    begin
        // Même client disponible, réinitialisé entre chaque test
        // ...
    end;
}
```

⚠️ `[TestSetup]` s'exécute avant **chaque** test, pas une seule fois pour toute la suite. Il n'y a pas d'équivalent `[TestTeardown]` en AL standard — c'est le rollback automatique qui joue ce rôle.

### V3 — Codeunit de test dédié par domaine fonctionnel

En production, organise tes tests par domaine : un codeunit pour la remise, un pour la validation de commande, un pour l'intégration API. Chaque codeunit couvre un périmètre cohérent, avec ses propres helpers.

```
50100 "Remise - Tests unitaires"
50101 "Validation Commande - Tests"
50102 "API Intégration - Tests"
50103 "Job Queue Remise - Tests"
```

Cette organisation facilite l'exécution partielle (par exemple, ne lancer que les tests remise après une modification localisée) et rend les rapports d'échec beaucoup plus lisibles.

---

## Cas d'utilisation réels

### Cas 1 — Tester une règle de gestion sur les lignes vente

Tu as une fonction qui calcule automatiquement la quantité minimale selon le type d'article. Elle doit retourner 10 pour les articles de type "Service" et 1 pour les autres.

```al
[Test]
procedure QuantiteMin_ArticleService_Retourne10()
var
    Article: Record Item;
    RegleQte: Codeunit "Regles Quantite";
    QteMin: Integer;
begin
    // Arrange
    LibraryInventory.CreateItem(Article);
    Article.Type := Article.Type::Service;
    Article.Modify();

    // Act
    QteMin := RegleQte.CalculerQuantiteMin(Article);

    // Assert
    Assert.AreEqual(10, QteMin, 'Quantité minimale attendue pour un article Service');
end;
```

### Cas 2 — Tester un comportement conditionnel selon le type de client

La logique de blocage de commande diffère entre clients nationaux et clients export. Deux tests distincts, même logique testée sous deux angles.

```al
[Test]
procedure Blocage_ClientNational_SansDepassement_PasBloque()
begin
    // client national, encours dans les limites → pas de blocage
    Assert.IsFalse(
        VerifBlocage.EstBloque(ClientNational, 4000),
        'Client national sous seuil ne devrait pas être bloqué'
    );
end;

[Test]
procedure Blocage_ClientExport_MemeEncours_Bloque()
begin
    // client export, mêmes 4000 € → bloqué car seuil différent
    Assert.IsTrue(
        VerifBlocage.EstBloque(ClientExport, 4000),
        'Client export devrait être bloqué à ce niveau d''encours'
    );
end;
```

### Cas 3 — Tester l'intégration d'un événement (EventSubscriber)

Quand ton code réagit à un événement BC plutôt qu'être appelé directement, le test doit déclencher l'action qui publie l'événement et observer l'effet en base.

```al
[Test]
procedure Validation_Commande_DeclencheCalculRemise()
var
    Commande: Record "Sales Header";
    LigneCommande: Record "Sales Line";
begin
    // Arrange — créer une commande complète
    LibrarySales.CreateSalesOrder(Commande, LigneCommande, Client."No.", Article."No.", 10, 6500);

    // Act — la validation déclenche l'événement OnAfterPost
    LibrarySales.PostSalesDocument(Commande, true, true);

    // Assert — vérifier l'effet de l'EventSubscriber
    LigneCommande.Get(LigneCommande."Document Type", LigneCommande."Document No.", LigneCommande."Line No.");
    Assert.AreEqual(10, LigneCommande."Line Discount %", 'Remise de 10% attendue après validation');
end;
```

---

## Erreurs fréquentes

**Symptôme** : le test passe toujours, même quand la logique est cassée.
**Cause** : assertion mal formulée — par exemple, `Assert.AreEqual(0, 0, '...')` qui compare des constantes, pas le résultat réel.
**Correction** : vérifier que la variable testée dans `Assert` est bien celle retournée par la fonction, pas une valeur par défaut non initialisée.

---

**Symptôme** : les tests passent en local mais échouent en CI.
**Cause** : dépendance à des données existantes en base locale (un client "Test" créé à la main, un paramètre de setup spécifique). En CI, la base est vierge.
**Correction** : chaque test doit créer toutes ses données. Ne jamais supposer qu'un enregistrement existe déjà.

---

**Symptôme** : un test modifie la base et impacte les tests suivants.
**Cause** : présence d'un `Commit()` explicite dans le code testé, qui court-circuite le rollback automatique.
**Correction** : identifier et — si possible — retirer le `Commit()` du chemin de code testé, ou l'encapsuler dans une procédure séparable.

---

**Symptôme** : `Assert.ExpectedError` ne capture pas l'erreur.
**Cause** : l'appel à `Assert.ExpectedError` est placé **après** l'instruction qui lève l'erreur au lieu d'avant.
**Correction** : `Assert.ExpectedError` doit toujours précéder immédiatement l'action censée échouer.

---

## Bonnes pratiques

**Nommer les tests comme des phrases** — `CalculRemise_MontantNegatif_DevraitEchouer` dit immédiatement ce qui est testé, dans quelle condition, et quel est le résultat attendu. Évite les noms vagues comme `TestRemise1` qui ne signifient rien trois semaines plus tard.

**Un test = un seul comportement vérifié** — si tu te retrouves à écrire plusieurs `Assert` qui vérifient des choses sans rapport, c'est probablement deux tests différents. La règle : si le test échoue, le nom du test doit suffire à comprendre ce qui est cassé.

**Ne pas tester les tables ou les triggers BC standard** — ton extension ne peut pas (et ne doit pas) tester si `Customer.Name` est obligatoire. Microsoft le fait déjà. Teste uniquement la logique que tu as écrite.

**Garder les tests rapides** — un test qui dure 5 secondes parce qu'il crée 200 enregistrements est un frein à l'adoption. Si ton test a besoin de beaucoup de données, interroge-toi sur la conception de la fonction testée.

**Séparer les tests unitaires des tests d'intégration** — les tests unitaires testent une fonction isolée (rapides, sans effets de bord). Les tests d'intégration testent un flux complet (plus lents, plus fragiles). Les deux ont leur place, mais dans des codeunits distincts pour pouvoir les exécuter séparément.

---

## Résumé

| Concept | Ce qu'il fait | À retenir |
|---|---|---|
| `Subtype = Test` | Marque un codeunit comme codeunit de test | Sans cette propriété, les `[Test]` ne sont pas exécutés |
| `[Test]` | Identifie une procédure comme cas de test | Seules ces procédures sont lancées par le runner |
| `[TestSetup]` | Exécute du code avant chaque test du codeunit | Idéal pour factoriser la création de données communes |
| `Assert` (codeunit 130000) | Fournit toutes les méthodes d'assertion | `AreEqual`, `IsTrue`, `ExpectedError`… |
| Library codeunits | Helpers pour créer des entités BC valides | `LibrarySales`, `LibraryInventory`… — uniquement en contexte test |
| Rollback automatique | Annule toutes les écritures après chaque test | Un `Commit()` explicite dans le code testé brise cette isolation |
| Pattern AAA | Structurer chaque test en Arrange / Act / Assert | Rend les tests lisibles et les échecs immédiatement compréhensibles |

Les tests automatisés en AL ne sont pas un luxe réservé aux grosses équipes. Sur un projet réel, c'est ce qui te permet de modifier du code deux ans après sa livraison sans craindre de casser silencieusement quelque chose que tu as oublié.

---

## Snippets de révision

<!-- snippet
id: al_test_subtype_declaration
type: concept
tech: AL
level: intermediate
importance: high
tags: al, tests, codeunit, subtype
title: Déclarer un codeunit de test AL
content: Un codeunit de test AL se déclare avec `Subtype = Test`. Sans cette propriété, les procédures annotées `[Test]` ne sont pas reconnues ni exécutées par le runner BC. La propriété `TestPermissions = Disabled` désactive la vérification des droits BC pendant l'exécution — utile pour tester la logique pure indépendamment des entitlements.
description: Subtype = Test est obligatoire pour qu'un codeunit soit reconnu comme testable par le runtime BC
-->

<!-- snippet
id: al_test_annotation_test
type: concept
tech: AL
level: intermediate
importance: high
tags: al, tests, annotation, runner
title: Annotation [Test] — marqueur de cas de test
content: L'annotation `[Test]` placée sur une procédure signale au runner AL que cette procédure est un cas de test à exécuter. Sans cette annotation, la procédure est ignorée même dans un codeunit `Subtype = Test`. Une procédure `[Test]` ne prend pas de paramètres et ne retourne rien.
description: Seules les procédures annotées [Test] sont exécutées par le runner — toutes les autres sont des helpers internes
-->

<!-- snippet
id: al_test_setup_annotation
type: concept
tech: AL
level: intermediate
importance: medium
tags: al, tests, setup, fixture
title: [TestSetup] — initialisation avant chaque test
content: `[TestSetup]` marque une procédure exécutée automatiquement avant CHAQUE test du codeunit, pas une seule fois pour tous. Permet de factoriser la création de données communes. Il n'existe pas de `[TestTeardown]` en AL standard — c'est le rollback automatique de transaction qui joue ce rôle.
description: [TestSetup] s'exécute avant chaque [Test] individuellement — si 5 tests, elle est appelée 5 fois
-->

<!-- snippet
id: al_test_assert_expected_error
type: warning
tech: AL
level: intermediate
importance: high
tags: al, tests, assert, erreur, expectedError
title: Assert.ExpectedError doit précéder l'action qui échoue
content: Piège fréquent : placer `Assert.ExpectedError('...')` APRÈS l'instruction qui lève l'erreur. Dans ce cas, l'erreur interrompt l'exécution avant d'atteindre l'assertion — le test échoue avec l'erreur elle-même. Correction : appeler `Assert.ExpectedError` toujours AVANT l'instruction qui doit lever l'erreur. La comparaison se fait par sous-chaîne, pas en égalité stricte.
description: Assert.ExpectedError doit être appelé AVANT l'action censée échouer, sinon l'erreur tue le test avant l'assertion
-->

<!-- snippet
id: al_test_commit_isolation
type: warning
tech: AL
level: intermediate
importance: high
tags: al, tests, commit, isolation, rollback
title: Commit() dans le code testé brise l'isolation des tests
content: Par défaut, chaque [Test] s'exécute dans une transaction rollbackée automatiquement à la fin. Mais si le code applicatif appelé contient un `Commit()` explicite, ce commit persiste en base même depuis un test — les données ne sont pas annulées. Conséquence : les tests suivants peuvent hériter d'un état pollué. Solution : isoler ou retirer les Commit() des chemins de code testés.
description: Un Commit() explicite dans le code testé court-circuite le rollback automatique — les données persistent entre les tests
-->

<!-- snippet
id: al_test_library_codeunits
type: tip
tech: AL
level: intermediate
importance: medium
tags: al, tests, library, helpers, données
title: Utiliser les Library codeunits pour créer des données de test
content: Les codeunits `Library - Sales`, `Library - Inventory`, `Library - Purchase` etc. sont des helpers Microsoft qui créent des entités BC valides (avec tous les champs obligatoires remplis) en une seule ligne. Ex : `LibrarySales.CreateCustomer(Client)` crée un client complet. Attention : ces codeunits ne sont disponibles qu'en contexte test (target OnPrem ou build de test) — jamais déployés en production.
description: Les Library codeunits Microsoft évitent de remplir manuellement les champs obligatoires lors de la création de données de test
-->

<!-- snippet
id: al_test_naming_convention
type: tip
tech: AL
level: intermediate
importance: medium
tags: al, tests, nommage, lisibilité
title: Nommer les tests comme des phrases — convention recommandée
content: Nommer chaque procédure [Test] sous la forme `Sujet_Condition_ResultatAttendu` — ex : `CalculRemise_MontantNegatif_DevraitEchouer`. Quand un test échoue en CI, le nom seul doit permettre de comprendre ce qui est cassé sans ouvrir le code. Un nom comme `TestRemise2` est inutile à la relecture 3 mois plus tard.
description: Convention CalculRemise_MontantNegatif_DevraitEchouer : le nom d'un test raté doit suffire à diagnostiquer la régression
-->

<!-- snippet
id: al_test_no_existing_data
type: warning
tech: AL
level: intermediate
importance: high
tags: al, tests, isolation, ci, données
title: Ne jamais supposer qu'un enregistrement existe déjà en base
content: Un test qui dépend d'un enregistrement créé manuellement (client "TEST", paramètre de setup préconfigura) passe en local et échoue en CI où la base est vierge. Règle absolue : chaque test crée lui-même toutes les données dont il a besoin via les Library codeunits ou des procédures helper dédiées. Zéro dépendance à l'état préexistant de la base.
description: Tests qui supposent des données existantes passent en local, échouent en CI sur base vierge — toujours créer ses propres données
-->

<!-- snippet
id: al_test_aaa_pattern
type: concept
tech: AL
level: intermediate
importance: medium
tags: al, tests, aaa, pattern, structure
title: Pattern AAA en AL — Arrange / Act / Assert
content: Arrange : créer les données et l'état nécessaires (souvent via Library codeunits). Act : appeler la fonction testée et capturer le résultat. Assert : vérifier le résultat avec `Assert.AreEqual`, `Assert.IsTrue`, etc. En AL, la phase Arrange peut inclure des écritures en base, ce qui la rend plus lourde qu'en langages fonctionnels — raison de plus pour la factoriser avec [TestSetup].
description: Structurer chaque test en Arrange/Act/Assert — en AL, Arrange peut écrire en base, ce qui exige rigeur sur l'isolation
-->
