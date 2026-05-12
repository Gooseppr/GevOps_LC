---
layout: page
title: "Tables AL et modèle de données ERP"

course: al
chapter_title: "Fondations ERP / AL"

chapter: 1
section: 3

tags: al, business central, table, extension, champ, clé primaire, modèle de données, erp
difficulty: beginner
duration: 90
mermaid: false

status: "published"
prev_module: "/courses/al/04_tooling_communautaire_al.html"
prev_module_title: "Tooling communautaire & écosystème développeur AL"
next_module: "/courses/al/02_architecture_fonctionnelle_bc.html"
next_module_title: "Architecture fonctionnelle Business Central"
---

## Objectifs pédagogiques

À l'issue de ce module, tu seras capable de :

1. Décrire la structure d'une table AL et identifier ses éléments constitutifs (champs, clés, propriétés)
2. Créer une table AL simple dans une extension Business Central
3. Étendre une table standard BC avec un `TableExtension`
4. Choisir entre créer une nouvelle table, étendre une table existante ou utiliser une table de transaction, selon des critères concrets
5. Appliquer les règles de nommage, de numérotation et de modélisation propres à l'écosystème BC

---

## Mise en situation

Tu rejoins une équipe qui développe une extension BC pour un distributeur de matériel industriel. Le client a besoin de tracer les **garanties produit** : chaque article vendu peut faire l'objet d'une garantie d'une durée variable, avec un numéro de série et une date d'expiration.

Cette information n'existe pas dans BC standard. Il va falloir créer une table `Warranty Entry` et, en parallèle, ajouter un champ `Warranty Duration` sur la table `Item` standard — sans toucher au code Microsoft.

Mais avant d'écrire la moindre ligne de code, une question se pose : faut-il vraiment créer une nouvelle table ? Ou étendre `Item` suffit-il ? C'est la décision de modélisation que ce module t'apprend à prendre, avant même de t'apprendre à coder la réponse.

---

## Pourquoi les tables AL sont différentes de ce que tu connais

Si tu viens du développement web ou d'un environnement SQL classique, tu as l'habitude de créer des tables dans une base de données, séparément du code applicatif. En AL, **la table est un objet du langage** — elle est déclarée dans ton code source, compilée avec ton extension, et Business Central se charge de créer ou modifier la structure en base lors du déploiement.

Autrement dit, tu ne touches jamais directement à SQL Server. Tu décris ta table en AL, et BC gère le reste.

Ce changement de paradigme a une conséquence concrète au quotidien : **le schéma de données et le comportement de la donnée sont définis au même endroit**, dans le même fichier `.al`. Tu n'as pas à synchroniser un script SQL et du code applicatif — c'est une seule source de vérité.

🧠 Une table AL n'est pas juste un schéma SQL — c'est un objet applicatif qui embarque ses champs, ses clés, ses triggers et ses propriétés de comportement.

---

## La décision avant le code : créer, étendre ou réutiliser ?

Avant de créer une table, pose-toi trois questions. La réponse oriente directement ta modélisation.

**Est-ce que mes données sont indépendantes de celles d'une table existante ?**
Si oui → crée une nouvelle table. Les garanties ne sont pas des articles : elles ont leur propre cycle de vie, leur propre volume, leur propre logique d'accès. Une nouvelle table `Warranty Entry` est justifiée.

**Est-ce que je veux juste ajouter un ou plusieurs champs à une entité qui existe déjà ?**
Si oui → utilise un `tableextension`. La durée de garantie par défaut est une propriété de l'article, pas une entité à part entière. Elle appartient à `Item`.

**Est-ce que je veux enregistrer des événements ou des mouvements (pas une entité stable) ?**
Si oui → modèle-la comme une table de transaction, avec un auto-incrément comme clé primaire et des relations vers les entités maîtres concernées.

Le tableau suivant résume les critères décisifs :

| Critère | Nouvelle table | TableExtension | Table de transaction |
|---|---|---|---|
| Entité avec son propre cycle de vie | ✅ | ❌ | ❌ |
| Propriété supplémentaire d'une entité existante | ❌ | ✅ | ❌ |
| Volume potentiellement élevé (N enregistrements par entité) | ✅ | ❌ | ✅ |
| Historique d'événements horodatés | ❌ | ❌ | ✅ |
| Lien direct 1-1 avec une entité maître | ❌ | ✅ | ❌ |
| Besoin d'indexation indépendante | ✅ | ❌ | ✅ |

Dans le cas des garanties : on crée `Warranty Entry` (nouvelle table de transaction, potentiellement des centaines par article), et on étend `Item` pour la durée par défaut (un seul champ, propriété stable de l'article).

---

## Structure d'une table AL

Une table AL se compose de trois grandes parties :

- Les **champs** (`fields`) : la définition de chaque colonne — nom, type, propriétés
- Les **clés** (`keys`) : la clé primaire et les index secondaires
- Les **triggers** : du code qui s'exécute automatiquement lors d'insertions, modifications ou suppressions

Voici une table minimale fonctionnelle :

```al
table 50100 "Warranty Entry"
{
    Caption = 'Warranty Entry';
    DataClassification = CustomerContent;

    fields
    {
        field(1; "Entry No."; Integer)
        {
            Caption = 'Entry No.';
            AutoIncrement = true;
        }
        field(2; "Item No."; Code[20])
        {
            Caption = 'Item No.';
            TableRelation = Item;
        }
        field(3; "Serial No."; Code[50])
        {
            Caption = 'Serial No.';
        }
        field(4; "Expiration Date"; Date)
        {
            Caption = 'Expiration Date';
        }
        field(5; "Warranty Duration"; Integer)
        {
            Caption = 'Warranty Duration (Months)';
            MinValue = 0;
        }
    }

    keys
    {
        key(PK; "Entry No.")
        {
            Clustered = true;
        }
        key(ItemKey; "Item No.", "Expiration Date")
        {
        }
    }

    trigger OnInsert()
    begin
        // Logique de validation à l'insertion si nécessaire
    end;
}
```

Quelques détails que les débutants manquent souvent :

- Le **numéro d'objet** (`50100` ici) doit être dans ta plage réservée déclarée dans `app.json`. Deux extensions avec le même numéro sont incompatibles — le déploiement échoue.
- `DataClassification` est obligatoire depuis BC 14+. Les valeurs courantes : `CustomerContent`, `OrganizationIdentifiableInformation`, `SystemMetadata`. Son absence bloque la compilation.
- `TableRelation` crée une relation logique entre champs — équivalent d'une clé étrangère gérée par l'application, pas par la base. Ce point est plus important qu'il n'y paraît : on y revient juste après.

---

## Les types de champs : ce que BC propose vraiment

Le système de types en AL est plus riche qu'un simple mapping SQL. Voici les types les plus courants et leurs particularités :

| Type | Usage typique | Particularité |
|---|---|---|
| `Integer` | Compteurs, quantités entières | Range -2 147 483 647 à +2 147 483 647 |
| `Decimal` | Prix, montants, quantités | Toujours en devise locale sauf si tu gères la conversion |
| `Code[n]` | Références, numéros (article, client…) | Toujours converti en MAJUSCULES automatiquement |
| `Text[n]` | Descriptions, libellés libres | Respecte la casse, max 2048 caractères |
| `Boolean` | Oui/Non | Stocké comme 0/1 en base, manipulé comme `true`/`false` |
| `Date` | Dates sans heure | La "date vide" en BC est le 01/01/0001, pas `null` |
| `DateTime` | Dates avec heure précise | Pour les horodatages où la minute change quelque chose |
| `Enum` | Statuts, types finis | Remplace les anciens `Option` — plus maintenable |
| `Blob` | Fichiers binaires, images | Non filtrable directement en AL |
| `RecordId` | Référence vers n'importe quel enregistrement | Utile pour les liens polymorphes |

💡 Le type `Code[20]` est le type de référence par excellence dans BC. Presque tous les identifiants métier (article, client, fournisseur, compte) sont des `Code[20]`. Quand tu vois un champ qui "pointe vers" quelque chose, c'est presque toujours un `Code[20]` avec un `TableRelation`.

**`Date` vs `DateTime` — quand la granularité change quelque chose**
Si tu traces uniquement la date d'expiration d'une garantie, `Date` suffit — les rapports s'affichent plus lisiblement, les filtres par période fonctionnent naturellement. En revanche, si tu logues l'instant précis d'une activation (pour un audit légal, un horodatage contractuel, ou une synchronisation avec un système externe), `DateTime` devient nécessaire. Un rapport d'audit qui affiche "Activé le 15/03/2025" n'a pas la même valeur légale que "Activé le 15/03/2025 à 14h37". Ce n'est pas une question de confort — c'est une question de précision métier.

⚠️ Ne confonds pas `Code` et `Text`. Si tu stockes un numéro d'article dans un `Text`, les comparaisons échoueront silencieusement : `Code` normalise en majuscules à l'écriture, `Text` respecte la casse. C'est une source classique de bugs sur les filtres.

---

## Étendre une table standard : le TableExtension

Tu n'as pas accès au code Microsoft — tu ne peux pas modifier la table `Item` directement. À la place, tu crées un `tableextension` qui vient **greffer** tes champs sur la table existante.

```al
tableextension 50101 "Item Warranty Ext" extends Item
{
    fields
    {
        field(50100; "Default Warranty Duration"; Integer)
        {
            Caption = 'Default Warranty Duration (Months)';
            DataClassification = CustomerContent;
            MinValue = 0;
        }
    }
}
```

Ce qui se passe concrètement : quand ton extension est déployée, BC ajoute physiquement la colonne `Default Warranty Duration` à la table `Item` en base. Tes champs coexistent avec les champs Microsoft dans la même ligne SQL. Si tu désinstalles l'extension, la colonne disparaît — avec les données.

🧠 Un `tableextension` ne crée pas une nouvelle table. Il étend physiquement la table cible. C'est pour ça qu'un `tableextension` convient pour un champ stable (propriété de l'entité), pas pour des dizaines d'enregistrements par article.

---

## Ce qui se passe quand une TableRelation est manquante

Tu as vu la propriété `TableRelation = Item;` dans la définition du champ `Item No.`. Elle peut sembler optionnelle — le code compile sans elle. En pratique, son absence crée des problèmes concrets à différents niveaux.

**Sans `TableRelation`, BC ne valide pas la valeur saisie.** Un utilisateur peut taper un numéro d'article inexistant. L'enregistrement est créé. Rien ne signale le problème au moment de la saisie.

**Le résultat en production :** des garanties liées à des articles qui n'existent plus (ou qui n'ont jamais existé). Quand tu tentes de naviguer vers l'article depuis la garantie, le lookup ne trouve rien. Les rapports qui jointent `Warranty Entry` et `Item` renvoient des lignes orphelines. Pour corriger, il faut un script de nettoyage — qui lui-même doit identifier quels enregistrements sont valides, ce qui n'est pas trivial si le volume est élevé.

**L'autre conséquence :** sans `TableRelation`, l'UI de BC n'affiche pas de bouton de lookup sur le champ. L'utilisateur doit taper la valeur exacte. Dans un ERP où les codes articles font souvent 10 à 20 caractères, c'est une source d'erreurs supplémentaire.

La règle est simple : dès qu'un champ référence une autre table, déclare la relation. Le coût est nul à la conception, le coût de l'oubli peut être significatif en production.

---

## Le modèle de données ERP : comment BC organise l'information

Pour travailler efficacement avec les tables BC, il faut comprendre la logique qui structure le modèle de données standard. BC distingue deux grandes catégories :

**Les tables maîtres** contiennent les référentiels : clients, fournisseurs, articles, comptes du plan comptable. Ces données changent peu et servent de référence dans tout le système.

Tables maîtres incontournables :
- `Customer` (table 18) — le référentiel clients
- `Vendor` (table 23) — les fournisseurs
- `Item` (table 27) — les articles gérés en stock
- `G/L Account` (table 15) — le plan comptable

**Les tables de transaction** enregistrent ce qui s'est passé : ventes, achats, mouvements de stock. Elles suivent systématiquement un pattern en deux niveaux — un en-tête et des lignes.

Exemple sur le flux vente :
- `Sales Header` (table 36) — l'en-tête d'une commande ou facture
- `Sales Line` (table 37) — les lignes de cette commande
- `Cust. Ledger Entry` (table 21) — les écritures comptables client après validation

Ce pattern en-tête/lignes est omniprésent. Quand tu vois une table `*Header`, sa table `*Line` existe toujours.

💡 Les tables d'entrées comptables (`*Ledger Entry`) sont en lecture seule une fois créées. BC ne permet pas de les modifier directement — tu passes par des documents ou des journaux. Respecter ce principe dans tes extensions, c'est respecter la traçabilité comptable qui est au cœur de l'ERP.

---

## Cas d'utilisation concrets

### Cas 1 — Warranty Entry avec contrainte de volume

Le client active des garanties en masse lors des expéditions : entre 100 et 1 000 activations par jour. Dès que le volume devient significatif, la stratégie d'indexation compte.

La clé primaire sur `Entry No.` gère l'unicité et les lookups directs. Mais dans les faits, les requêtes métier cherchent presque toujours les garanties d'un article donné : "Montre-moi toutes les garanties actives pour l'article X". Sans index secondaire sur `Item No.`, cette requête scanne toute la table.

```al
table 50100 "Warranty Entry"
{
    Caption = 'Warranty Entry';
    DataClassification = CustomerContent;

    fields
    {
        field(1; "Entry No."; Integer)
        {
            AutoIncrement = true;
            Caption = 'Entry No.';
        }
        field(2; "Item No."; Code[20])
        {
            Caption = 'Item No.';
            TableRelation = Item;
        }
        field(3; "Serial No."; Code[50])
        {
            Caption = 'Serial No.';
        }
        field(4; "Expiration Date"; Date)
        {
            Caption = 'Expiration Date';
        }
        field(5; "Warranty Duration"; Integer)
        {
            Caption = 'Warranty Duration (Months)';
            MinValue = 0;
        }
        field(6; "Status"; Enum "Warranty Status")
        {
            Caption = 'Status';
            DataClassification = CustomerContent;
        }
    }

    keys
    {
        key(PK; "Entry No.")
        {
            Clustered = true;  // Index physique — lookup par numéro d'entrée
        }
        key(ItemKey; "Item No.", "Expiration Date")
        {
            // Index couvrant : recherche par article + tri par date d'expiration
            // Sans cet index, filtrer par Item No. = full table scan à partir de ~10 000 lignes
        }
        key(StatusKey; "Status", "Item No.")
        {
            // Pour les requêtes de suivi : "toutes les garanties actives par article"
        }
    }
}
```

La règle pratique : crée un index secondaire pour chaque axe de requête métier fréquent. Pas pour tous les champs — seulement ceux qui servent de filtre régulier dans les pages et les rapports.

### Cas 2 — Extension Item + table custom qui en dépend

Le client veut aussi un log d'activation — chaque activation de garantie doit être tracée avec l'utilisateur et l'heure exacte. C'est une table de transaction distincte, mais elle dépend de `Warranty Entry`.

```al
table 50102 "Warranty Activation Log"
{
    Caption = 'Warranty Activation Log';
    DataClassification = CustomerContent;

    fields
    {
        field(1; "Entry No."; Integer)
        {
            AutoIncrement = true;
            Caption = 'Entry No.';
        }
        field(2; "Warranty Entry No."; Integer)
        {
            Caption = 'Warranty Entry No.';
            TableRelation = "Warranty Entry";  // Lien vers notre table custom
        }
        field(3; "Activated By"; Code[50])
        {
            Caption = 'Activated By';
            TableRelation = User."User Name";
        }
        field(4; "Activation DateTime"; DateTime)
        {
            // DateTime et non Date : on veut l'heure exacte pour l'audit
            // La granularité minute est contractuellement requise par le client
            Caption = 'Activation Date & Time';
        }
        field(5; "Notes"; Text[250])
        {
            Caption = 'Notes';
        }
    }

    keys
    {
        key(PK; "Entry No.")
        {
            Clustered = true;
        }
        key(WarrantyKey; "Warranty Entry No.")
        {
        }
    }
}
```

Ce modèle crée un couplage entre `Warranty Activation Log` et `Warranty Entry`. C'est intentionnel ici — le log n'a de sens que par rapport à une garantie. Mais ce couplage a un prix : si tu désinstalles l'extension `Warranty Entry`, les enregistrements de log deviennent orphelins. En production, ce scénario ne devrait pas arriver, mais il faut en être conscient lors des migrations ou des restructurations d'extensions.

### Cas 3 — Ajouter un statut typé avec un Enum

Plutôt que d'utiliser un `Integer` pour coder un statut (0 = actif, 1 = expiré, 2 = annulé…), AL propose les `Enum` :

```al
enum 50100 "Warranty Status"
{
    Extensible = true;  // D'autres extensions peuvent ajouter des valeurs

    value(0; " ") { Caption = ' '; }
    value(1; "Active") { Caption = 'Active'; }
    value(2; "Expired") { Caption = 'Expired'; }
    value(3; "Voided") { Caption = 'Voided'; }
}
```

Dans le code, tu écriras `"Status" = "Warranty Status"::Active` plutôt que `"Status" = 1`. C'est immédiatement lisible, et si quelqu'un ajoute une valeur à l'enum, ton code reste valide.

`Extensible = true` est gratuit à déclarer, impossible à ajouter rétroactivement si quelqu'un a déjà compilé du code contre ta version fermée.

---

## Conséquences réelles d'une mauvaise modélisation

Il est utile de voir concrètement ce qu'implique un mauvais choix de conception — pas juste en théorie.

**Scénario : un développeur junior stocke les garanties dans `Item` via tableextension.**
Il ajoute 5 champs à `Item` : numéro de série, date d'expiration, statut, durée, date d'activation. Ça fonctionne pour un client avec 50 articles et 2 garanties par article. En production, le client gère 8 000 articles actifs, avec en moyenne 15 garanties actives par article. La table `Item` contient maintenant 8 000 lignes — mais les données de garantie ne sont pas dans `Item`, elles ne peuvent pas y être : un `tableextension` ne crée qu'une seule ligne supplémentaire par enregistrement. Le développeur a modélisé une relation 1-N avec un outil qui ne supporte que le 1-1. Il doit tout reconstruire.

**Scénario : une clé primaire mal choisie.**
Un développeur utilise `Serial No.` comme clé primaire sur `Warranty Entry`, plutôt qu'un `Entry No.` auto-incrémenté. Deux semaines après la mise en production, un utilisateur entre une garantie avec un numéro de série déjà existant (erreur de saisie). BC refuse l'insertion silencieusement — ou lève une erreur cryptique. Sans `Entry No.` auto-incrémenté, il n'existe pas de clé stable et sans ambiguïté pour référencer un enregistrement depuis d'autres tables. La correction implique une migration de données.

Ces cas ne sont pas des hypothèses — ce sont des situations récurrentes sur les projets ERP. La décision de modélisation prend 10 minutes. Sa correction peut prendre des jours.

---

## Erreurs fréquentes

**Oublier `DataClassification` sur un champ**
Symptôme : erreur AL0468 à la compilation. Correction : ajouter `DataClassification = CustomerContent;` sur chaque champ contenant des données client, `SystemMetadata` pour les champs techniques internes.

**Utiliser un numéro d'objet hors plage**
Symptôme : l'extension se compile mais échoue au déploiement avec une erreur de conflit d'ID. Correction : vérifier `idRanges` dans `app.json` et ajuster le numéro. La règle s'applique aux tables, tableextensions ET aux numéros de champs.

**Utiliser `Text` là où `Code` est attendu**
Symptôme : les filtres sur ce champ ne retrouvent pas les enregistrements même quand la valeur semble identique. Cause : `Code` normalise en majuscules à l'écriture, `Text` ne le fait pas. Correction : `Code[n]` pour tout identifiant métier destiné à être filtré ou comparé.

⚠️ Nommer un champ custom avec un nom déjà existant dans la table étendue provoque une erreur de compilation immédiate. Vérifie toujours les noms de champs de la table cible avant d'écrire ton `tableextension`.

---

## Bonnes pratiques

**Nommage des champs** : utilise des noms descriptifs avec des espaces et des guillemets (`"Expiration Date"`, `"Warranty Duration"`), comme BC le fait nativement. Évite les underscores et les abréviations cryptiques.

**Plages de numéros** : bloque ta plage d'IDs dès le début du projet. Si tu travailles sur plusieurs extensions, donne à chacune une sous-plage distincte pour éviter les collisions.

**`TableRelation` systématique** : dès qu'un champ référence une autre table, déclare la relation. BC l'utilise pour valider les saisies, générer des lookups dans l'UI, et diagnostiquer les données orphelines.

**`Extensible = true` sur les Enums** : si ton `Enum` a une chance d'être étendu — par toi ou par une autre extension — marque-le extensible dès la création. Impossible à corriger rétroactivement.

**Limiter les triggers de table au minimum** : les triggers `OnInsert`, `OnModify`, `OnDelete` s'exécutent sur chaque opération, y compris les imports en masse. Un trigger lourd peut transformer un import de 10 000 lignes en blocage de plusieurs minutes. Si la logique est complexe, elle appartient à un codeunit appelé explicitement, pas au trigger de table.

**Indexer selon les accès réels** : crée des index secondaires pour les axes de recherche métier fréquents. Pas pour tous les champs — uniquement ceux qui servent de filtre dans les pages et les rapports. Un index inutile coûte en écriture sans rien apporter en lecture.

---

## Résumé

| Concept | Ce qu'il fait | À retenir |
|---|---|---|
| `table` | Définit une nouvelle table dans l'extension | Numéro unique dans la plage `app.json` |
| `tableextension` | Ajoute des champs à une table existante | Étend physiquement — 1 ligne par enregistrement, pas pour du 1-N |
| `field(n; ...)` | Déclare un champ avec son ID, son nom et son type | L'ID de champ doit aussi être dans la plage réservée |
| `key(PK; ...)` | Définit la clé primaire (`Clustered = true`) | Toujours le premier `key` déclaré |
| `DataClassification` | Classifie la donnée pour le RGPD | Obligatoire sur chaque champ — son absence bloque la compilation |
| `TableRelation` | Lie un champ à une autre table | Valide les saisies, génère le lookup UI, évite les données orphelines |
| `Enum` | Définit un ensemble fini de valeurs typées | Préférer à `Integer` pour tous les statuts — ajouter `Extensible = true` |
| Tables maîtres | Référentiels (Client, Article…) | Base de tous les flux transactionnels |
| Tables de transaction | Documents et écritures (Commandes, Factures…) | Pattern systématique Header/Line |
| Décision créer vs étendre | Dépend de la cardinalité et du cycle de vie | 1-1 stable → tableextension ; 1-N ou entité propre → nouvelle table |

En AL, la table n'est pas qu'un conteneur de données — c'est le contrat entre ton extension et le reste de BC. Bien la modéliser dès le départ, c'est éviter la majorité des problèmes qui arrivent en production.

---

<!-- snippet
id: al_table_structure_base
type: concept
tech: AL
level: beginner
importance: high
format: knowledge
tags: al, table, structure, champ, cle
title: Structure d'une table AL
content: Une table AL se compose de trois parties : `fields` (définition des colonnes), `keys` (clé primaire + index secondaires), et des triggers (code auto-exécuté sur insert/modify/delete). Le schéma ET le comportement sont définis dans le même fichier `.al` — BC crée ou modifie la table en base lors du déploiement. Aucun SQL direct. C'est un objet applicatif complet, pas juste un schéma.
description: La table AL embarque schéma + logique au même endroit — déployée automatiquement par BC sans intervention SQL.
-->

<!-- snippet
id: al_table_creer_vs_etendre
type: concept
tech: AL
level: beginner
importance: high
format: knowledge
tags: al, table, tableextension, decision, modelisation, cardinalite
title: Créer une nouvelle table ou étendre une table existante
content: Règle de décision : si la relation est 1-1 stable (une valeur par entité existante), utilise un `tableextension`. Si la relation est 1-N (plusieurs enregistrements par entité) ou si les données ont leur propre cycle de vie, crée une nouvelle table. Un `tableextension` ne peut jamais stocker plusieurs lignes par enregistrement cible — utiliser un tableextension pour une relation 1-N est un anti-pattern fréquent chez les développeurs juniors.
description: tableextension = 1-1 stable. Nouvelle table = 1-N ou entité avec son propre cycle de vie. Ce choix ne se corrige pas facilement en production.
-->

<!-- snippet
id: al_table_dataclassification_obligatoire
type: warning
tech: AL
level: beginner
importance: high
format: knowledge
tags: al, table, rgpd, dataclassification, compilation
title: DataClassification obligatoire sur chaque champ
content: Oublier `DataClassification` sur un champ déclenche l'erreur AL0468 à la compilation — l'extension ne se déploie pas. Valeurs courantes : `CustomerContent` pour les données client, `SystemMetadata` pour les champs techniques internes, `OrganizationIdentifiableInformation` pour les données d'identification organisationnelle. Cette classification est exploitée par les outils d'audit RGPD de BC.
description: DataClassification est obligatoire depuis BC 14+ sur tous les champs — son absence bloque la compilation.
-->

<!-- snippet
id: al_table_numerotation_plage
type: warning
tech: AL
level: beginner
importance: high
format: knowledge
tags: al, table, id, plage, app.json, deploiement
title: Numéro d'objet et de champ dans la plage app.json
content: Utiliser un numéro d'objet ou de champ hors de la plage déclarée dans `app.json` (idRanges) peut compiler sans erreur mais échoue au déploiement avec un conflit d'ID. La règle s'applique aux tables, tableextensions ET aux numéros de champs custom. Vérifier `idR
