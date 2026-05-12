---
layout: page
title: "XMLports AL"

course: al
chapter_title: "Objets AL et structures de données"

chapter: 6
section: 1

tags: al, xmlport, business central, import, export, xml, csv, intégration
difficulty: beginner
duration: 90
mermaid: false

status: "published"
prev_module: "/courses/al/12_git_projets_al.html"
prev_module_title: "Git et organisation projet AL"
next_module: "/courses/al/43_antipatterns_al.html"
next_module_title: "Anti-patterns AL"
---

# XMLports AL

## Objectifs pédagogiques

À l'issue de ce module, vous serez capable de :

1. **Expliquer** le rôle d'un XMLport et choisir entre XMLport, Report, API et RapidStart selon le contexte
2. **Créer** un XMLport minimal pour exporter ou importer des données tabulaires
3. **Configurer** les propriétés essentielles d'un XMLport (direction, format, encodage, séparateurs)
4. **Écrire** les triggers associés pour valider et filtrer le traitement ligne par ligne
5. **Déclencher** un XMLport depuis une page ou une codeunit avec gestion des erreurs partielles
6. **Identifier** les limites de performance et les stratégies d'adaptation sur de gros volumes

---

## Mise en situation

Votre client gère ses fournisseurs dans Business Central. Son équipe comptable doit chaque semaine exporter la liste des fournisseurs validés au format CSV pour les injecter dans un outil de paiement tiers — sans API, sans connecteur, juste un fichier.

Par ailleurs, le service logistique reçoit chaque matin un fichier XML depuis l'ERP de leur prestataire, contenant les numéros de lots et les quantités à mettre à jour dans BC. Certains articles n'existent pas encore, d'autres ont des quantités à zéro à ignorer. Il faudra gérer les erreurs ligne par ligne sans bloquer tout l'import.

Deux flux, deux directions, des contraintes réelles : c'est exactement le terrain d'un XMLport.

---

## Quand utiliser un XMLport — et quand ne pas le faire

Avant d'écrire une ligne de code, la vraie question est : **est-ce que le XMLport est le bon outil ici ?**

BC propose plusieurs mécanismes d'échange de données. Voici comment choisir :

| Critère | XMLport | Report | API Page | RapidStart |
|---|---|---|---|---|
| **Format** | XML ou CSV structuré | Texte libre, RDLC, Excel | JSON (REST) | Excel, RapidStart package |
| **Direction** | Import et export | Export uniquement | Lecture/écriture | Import initial principalement |
| **Volume** | Moyen (< 200k lignes conseillé) | Faible à moyen | Faible à élevé avec pagination | Élevé pour migration initiale |
| **Fréquence** | Régulière (quotidien, hebdo) | Ponctuelle (impression) | Temps réel | Ponctuelle (démarrage projet) |
| **Validation** | Dans les triggers | Limitée | Via logique page | Limitée |
| **Cas typique** | EDI, flux bancaires, exports tiers | Factures, bons de livraison | Intégration e-commerce, WMS | Migration NAV → BC, chargement initial |

**Utilisez un XMLport quand :**
- Le tiers ne dispose pas d'API et travaille avec des fichiers
- Le format est XML ou CSV avec une structure stable
- Vous avez besoin d'import ET d'export sur le même objet
- Le flux est récurrent mais pas temps réel

**N'utilisez pas un XMLport quand :**
- Une API partenaire existe et est fiable — l'API sera plus robuste et versionnable
- Le format du fichier change souvent — chaque modification casse le schema
- Le volume dépasse 200–300k lignes en SaaS — risque de timeout (session SaaS limitée)
- La validation métier est ultra-complexe — préférez une staging table + codeunit dédiée (module 17)

---

## Principe de fonctionnement

Un XMLport AL définit un objet avec une structure `schema` qui décrit comment mapper vos tables et champs vers les éléments du fichier. En export, BC lit les enregistrements et écrit le fichier. En import, il lit le fichier et crée ou modifie les enregistrements.

Le mot-clé central est `schema`. À l'intérieur, vous imbriquez des nœuds `textelement`, `tableelement`, `fieldelement` ou `fieldattribute` selon la structure cible.

```
XMLport
└── schema
    └── textelement (racine XML ou en-tête CSV)
        └── tableelement (table source/destination)
            ├── fieldelement (champ 1)
            ├── fieldelement (champ 2)
            └── fieldelement (champ 3)
```

La direction (`Import` / `Export` / `Both`) se configure via la propriété `Direction`. Le format (`Xml` / `VariableText` / `FixedText`) via `Format`.

`VariableText` est le format CSV/délimité — c'est lui qu'on utilise dans la pratique pour les échanges avec les outils tiers qui n'acceptent pas XML.

---

## Syntaxe et construction progressive

### Version 1 — Export CSV minimal des fournisseurs

```al
xmlport 50100 "Export Fournisseurs CSV"
{
    Direction = Export;
    Format = VariableText;

    // ';' = séparateur standard Europe. En international, utiliser ','
    FieldSeparator = ';';

    RecordSeparator = '\n';

    schema
    {
        textelement(Root)
        {
            tableelement(Vendor; Vendor)
            {
                // Permet à l'utilisateur de filtrer par numéro ou pays
                RequestFilterFields = "No.", "Country/Region Code";

                fieldelement(No; Vendor."No.") { }
                fieldelement(Name; Vendor.Name) { }
                fieldelement(City; Vendor.City) { }
            }
        }
    }
}
```

Ce XMLport produit un fichier comme :
```
F00010;Dupont SA;Paris
F00011;Truchet SARL;Lyon
```

Pas d'en-tête de colonne ici — on l'ajoute dans la v2.

---

### Version 2 — Ajouter une ligne d'en-tête et un filtre automatique

En CSV, les outils tiers attendent souvent une ligne d'en-tête. On l'ajoute avec un `textelement` frère du `tableelement`, et on initialise les labels dans `OnInitXmlPort`.

```al
xmlport 50100 "Export Fournisseurs CSV"
{
    Direction = Export;
    Format = VariableText;
    FieldSeparator = ';';

    // Encapsule les valeurs texte dans des guillemets
    // Protège les valeurs contenant le séparateur (ex. "Dupont ; Fils SA")
    FieldDelimiter = '"';

    RecordSeparator = '\n';

    // Encodage explicite — évite les caractères accentués corrompus
    TextEncoding = UTF8;

    schema
    {
        textelement(Root)
        {
            // Ligne d'en-tête — textelement simple, pas lié à une table
            textelement(Header)
            {
                textelement(ColNo) { }
                textelement(ColName) { }
                textelement(ColCity) { }
            }

            tableelement(Vendor; Vendor)
            {
                // Filtre statique : on n'exporte que les fournisseurs non bloqués
                DataItemTableFilter = Blocked = CONST(' ');
                RequestFilterFields = "No.", "Country/Region Code";

                fieldelement(No; Vendor."No.") { }
                fieldelement(Name; Vendor.Name) { }
                fieldelement(City; Vendor.City) { }
            }
        }
    }

    trigger OnInitXmlPort()
    begin
        // Initialisation des labels d'en-tête — s'exécute une seule fois
        ColNo := 'Numero';
        ColName := 'Nom';
        ColCity := 'Ville';
    end;
}
```

`OnInitXmlPort` s'exécute une seule fois avant que le schema commence à traiter. C'est le bon endroit pour initialiser des variables globales ou des en-têtes.

---

### Version 3 — Import XML depuis un prestataire avec gestion d'erreurs ligne par ligne

On passe à l'import. Le fichier reçu ressemble à :

```xml
<Lots>
  <Lot>
    <ItemNo>ARTICLE-001</ItemNo>
    <Quantity>150</Quantity>
  </Lot>
  <Lot>
    <ItemNo>ARTICLE-002</ItemNo>
    <Quantity>75</Quantity>
  </Lot>
</Lots>
```

La contrainte réelle : certains articles n'existent pas, certaines quantités sont nulles. On veut traiter au maximum de lignes, pas tout bloquer sur la première erreur. C'est pourquoi on isole les erreurs ligne par ligne plutôt que d'appeler `Error()` directement.

```al
xmlport 50101 "Import Lots Prestataire"
{
    Direction = Import;
    Format = Xml;
    TextEncoding = UTF8;

    schema
    {
        // Nœud racine : correspond à <Lots> dans le fichier
        // ⚠️ Casse exacte requise — <lots> ≠ <Lots>
        textelement(Lots)
        {
            textelement(Lot)
            {
                textelement(ItemNo) { }
                textelement(Quantity) { }

                // Déclenché après lecture complète d'un nœud <Lot>
                trigger OnAfterInitRecord()
                begin
                    ProcessLot(ItemNo, Quantity);
                end;
            }
        }
    }

    local procedure ProcessLot(ItemNoValue: Text; QuantityValue: Text)
    var
        ItemRec: Record Item;
        Qty: Decimal;
    begin
        // Ignorer les lignes à quantité nulle ou vide
        if (QuantityValue = '') or (QuantityValue = '0') then begin
            currXMLport.Skip();
            exit;
        end;

        // Conversion texte → décimal
        // Si Evaluate échoue (valeur non numérique), on isole l'erreur
        if not Evaluate(Qty, QuantityValue) then begin
            // Log l'erreur sans bloquer le reste de l'import
            Message('Quantité invalide pour l''article %1 : "%2" — ligne ignorée', ItemNoValue, QuantityValue);
            currXMLport.Skip();
            exit;
        end;

        // Vérification existence article
        if not ItemRec.Get(ItemNoValue) then begin
            Message('Article %1 introuvable — ligne ignorée', ItemNoValue);
            currXMLport.Skip();
            exit;
        end;

        // Traitement métier ici (ex. ajustement inventaire)
        // ...
    end;
}
```

> **Pourquoi `Skip()` plutôt que `Error()` ?**
> `Error()` stoppe tout l'import immédiatement. `Skip()` ignore l'enregistrement courant et continue. En production, sur un fichier de 500 lignes avec 10 erreurs, `Error()` signifie que 490 lignes valides ne sont jamais traitées. Le choix dépend du contrat métier : si une erreur doit tout bloquer (paiement bancaire), utilisez `Error()`. Si les erreurs sont des exceptions tolérées (catalogue articles), utilisez `Skip()` avec un log.

---

## Déclencher un XMLport depuis une page

Un XMLport seul ne fait rien — il faut le lancer. Le pattern standard en SaaS : `TempBlob` + `DownloadFromStream`.

```al
action(ExporterFournisseurs)
{
    Caption = 'Exporter CSV';
    Image = Export;

    trigger OnAction()
    var
        XmlportExport: XmlPort "Export Fournisseurs CSV";
        OutStr: OutStream;
        InStr: InStream;
        TempBlob: Codeunit "Temp Blob";
        FileName: Text;
    begin
        // 1. Crée un flux de sortie dans un blob temporaire en mémoire
        TempBlob.CreateOutStream(OutStr, TextEncoding::UTF8);

        // 2. Associe le flux au XMLport — OBLIGATOIRE avant Export()
        XmlportExport.SetDestination(OutStr);

        // 3. Lance l'export — écrit dans OutStr
        XmlportExport.Export();

        // 4. Prépare le flux en lecture pour le téléchargement
        TempBlob.CreateInStream(InStr);

        // 5. Propose le téléchargement au navigateur de l'utilisateur
        FileName := 'fournisseurs_' + Format(Today, 0, '<Year4><Month,2><Day,2>') + '.csv';
        DownloadFromStream(InStr, 'Export fournisseurs', '', 'Fichiers CSV (*.csv)|*.csv', FileName);
    end;
}
```

En SaaS, vous ne pouvez pas écrire directement sur le serveur — tout transite par des streams (`InStream` / `OutStream`) et le dialogue navigateur. Le pattern `TempBlob` + `DownloadFromStream` est la seule approche correcte. Ne tentez pas d'écrire dans `FilePath` ou sur un chemin réseau : ça ne fonctionne pas en cloud.

---

## Cas réel intégré — Export, modification externe, réimport

Voici un scénario complet qui illustre le cycle de vie réel d'un XMLport en entreprise.

**Contexte :** le contrôleur de gestion veut modifier les conditions de paiement de certains fournisseurs en masse depuis Excel, sans intervention du développeur pour chaque modification.

**Flux :**
1. **Export CSV** via le XMLport 50100 → fichier `fournisseurs.csv`
2. **Modification dans Excel** : l'utilisateur change les colonnes `PaymentTermsCode` pour une sélection de fournisseurs
3. **Réimport CSV** via un XMLport 50102 en direction `Import` → mise à jour conditionnelle des enregistrements existants

Le XMLport d'import ressemble à :

```al
xmlport 50102 "Import Mise à Jour Fournisseurs"
{
    Direction = Import;
    Format = VariableText;
    FieldSeparator = ';';
    TextEncoding = UTF8;

    // On ne veut pas que l'import écrase automatiquement — on gère nous-mêmes
    // AutoUpdate évité : on contrôle via OnBeforeInsertRecord / OnBeforeModifyRecord

    schema
    {
        textelement(Root)
        {
            tableelement(Vendor; Vendor)
            {
                fieldelement(No; Vendor."No.") { }
                fieldelement(Name; Vendor.Name) { }
                fieldelement(City; Vendor.City) { }
                fieldelement(PaymentTermsCode; Vendor."Payment Terms Code") { }

                trigger OnBeforeInsertRecord()
                begin
                    // Si le fournisseur existe déjà, on modifie — pas d'insertion
                    if Vendor.Get(Vendor."No.") then begin
                        // Mise à jour uniquement si le code paiement change
                        if Vendor."Payment Terms Code" <> xRec."Payment Terms Code" then begin
                            Vendor.Modify(true);
                        end;
                        // Empêche l'insertion d'un doublon
                        currXMLport.Skip();
                    end;
                    // Si l'article n'existe pas : on laisse l'insertion se faire
                    // (ou on Skip() si on veut refuser les nouveaux fournisseurs à l'import)
                end;
            }
        }
    }
}
```

> **Ce cas illustre un compromis concret :** en validation stricte (`Error()` dès qu'un fournisseur est introuvable), l'import est sûr mais fragile — une ligne invalide bloque tout. En mode tolérant (`Skip()` avec log), l'import est plus robuste mais vous devez surveiller les lignes ignorées. En production, **documentez explicitement le comportement choisi** dans le code.

---

## Propriétés essentielles

| Propriété | Valeurs possibles | Ce qu'elle fait |
|---|---|---|
| `Direction` | `Import`, `Export`, `Both` | Sens du flux. `Both` expose un champ à l'utilisateur |
| `Format` | `Xml`, `VariableText`, `FixedText` | Format du fichier |
| `FieldSeparator` | Tout caractère | Séparateur de colonnes (CSV) |
| `FieldDelimiter` | `"`, `'`… | Encapsule les valeurs texte — protège les valeurs contenant le séparateur |
| `RecordSeparator` | `\n`, `\r\n`… | Séparateur de lignes |
| `TextEncoding` | `UTF8`, `Windows`, `MSDOS`… | Encodage du fichier |
| `UseRequestPage` | `true` / `false` | Affiche ou non une page de paramètres à l'utilisateur |

**Sur `VariableText` vs `FixedText` :** `VariableText` est le format CSV classique — les colonnes sont séparées par un délimiteur, les valeurs ont des longueurs variables. `FixedText` est un format à colonnes de largeur fixe, utilisé dans des échanges bancaires ou douaniers très anciens. Dans 95% des cas, `VariableText` est ce qu'il faut.

**Sur `FieldDelimiter` :** souvent oublié. Sans lui, une valeur comme `Dupont ; Fils SA` dans une colonne casse le parsing CSV côté destinataire parce que le point-virgule est interprété comme séparateur. Avec `FieldDelimiter = '"'`, la valeur est encapsulée : `"Dupont ; Fils SA"` — le parser sait que c'est une seule colonne.

---

## Triggers disponibles

| Trigger | Niveau | Quand il s'exécute |
|---|---|---|
| `OnInitXmlPort` | XMLport | Une fois, à l'initialisation |
| `OnPreXmlPort` | XMLport | Avant le début du traitement |
| `OnPostXmlPort` | XMLport | Après la fin du traitement |
| `OnAfterGetRecord` | tableelement | Après lecture de chaque enregistrement (export) |
| `OnBeforeInsertRecord` | tableelement | Avant insertion d'un enregistrement (import) |
| `OnAfterInsertRecord` | tableelement | Après insertion (import) |
| `OnAfterInitRecord` | textelement | Après lecture d'un nœud XML |

```al
// Exemple : filtrer dynamiquement les fournisseurs sans nom à l'export
tableelement(Vendor; Vendor)
{
    trigger OnAfterGetRecord()
    begin
        // Un DataItemTableFilter ne peut pas filtrer sur 'vide' facilement
        // currXMLport.Skip() permet ce filtre dynamique
        if Vendor.Name = '' then
            currXMLport.Skip();
    end;
}
```

---

## Performance et limites sur gros volumes

Le XMLport est synchrone : il tourne dans la session utilisateur ou de job queue courante. En SaaS BC, une session a une durée maximale (30 minutes par défaut). Sur 50 000 lignes avec une logique de validation légère, aucun problème. Sur 500 000 lignes avec des `Get()` par ligne, vous approchez des limites.

**Ce qui consomme :**
- Un `Get()` ou `Find()` dans `OnBeforeInsertRecord` pour chaque ligne = N requêtes SQL
- Un `CalcFields` ou `FlowField` par ligne = N scans additionnels
- Des `Message()` ou `Error()` dans une boucle = blocage session utilisateur

**Stratégies pour les gros volumes :**

1. **Chunking via Job Queue** : découpez le fichier en blocs de 10 000 lignes, chaque bloc est traité par un job queue séparé. Nécessite une staging table pour stocker les données brutes (voir module 17).

2. **Staging + traitement différé** : l'import XMLport écrit dans une table de staging sans validation (rapide), puis une Job Queue traite la staging en batch (avec validation complète). Découple la vitesse d'import de la lourdeur de validation.

3. **SetLoadFields dans les requêtes de validation** : si vous faites un `Get()` dans un trigger, chargez uniquement les champs nécessaires.

4. **Éviter les appels externes dans les triggers** : aucun appel HTTP, aucun CalcFields inutile dans la boucle d'import.

> En règle générale, au-delà de 100 000 lignes en SaaS, un XMLport seul n'est plus la bonne architecture. Combinez-le avec une staging table et une Job Queue.

---

## Erreurs fréquentes — causes et impacts réels

**Colonnes décalées à l'import CSV**
- **Symptôme :** les champs sont mal mappés, les valeurs se retrouvent dans les mauvaises colonnes
- **Cause racine :** `FieldSeparator` déclaré à `;` mais le fichier utilise `,` — fréquent quand le fichier vient d'Excel anglophone
- **Impact métier :** données corrompues en base, potentiellement difficiles à détecter si les types sont compatibles (ex. un code devient une ville)
- **Correction :** ouvrir le fichier dans un éditeur texte brut (Notepad++, VS Code) — jamais Excel — pour voir le vrai séparateur

---

**Import XML sans erreur, zéro enregistrement créé**
- **Symptôme :** le XMLport se termine sans message d'erreur mais la base n'a pas changé
- **Cause racine :** les noms de `textelement` dans le schema ne correspondent pas exactement aux balises XML (ex. `ItemNo` vs `itemNo` vs `item_no`). BC mappe par nom exact, sensible à la casse.
- **Impact métier :** import silencieusement ignoré — l'utilisateur croit que les données sont à jour alors qu'elles ne le sont pas
- **Correction :** ouvrir le fichier XML source, copier les noms de balises tels quels dans le schema. Si le fichier vient d'un tiers, demander la spécification technique exacte.

---

**Caractères accentués illisibles dans le fichier exporté**
- **Symptôme :** `é`, `à`, `ü` apparaissent comme `Ã©`, `Ã `, `Ã¼` ou des carrés dans le destinataire
- **Cause racine :** BC utilise Windows-1252 par défaut (héritage NAV), encodage latin qui n'est pas UTF-8. Les systèmes Linux, les APIs modernes et la plupart des outils cloud attendent UTF-8.
- **Impact métier :** fichier rejeté par le destinataire, ou pire, importé avec des données corrompues qui ne se détectent qu'en audit
- **Correction :** ajouter `TextEncoding = UTF8;` dans le XMLport. Si le destinataire est un outil bancaire ancien, vérifier son encodage attendu avant de supposer UTF-8.

---

**Erreur `The XMLport cannot be run` au déclenchement**
- **Symptôme :** erreur runtime immédiate avant même le début du traitement
- **Cause racine :** `Export()` ou `Import()` appelé sans avoir préalablement associé un stream via `SetDestination` / `SetSource`
- **Impact métier :** l'action ne fait rien, l'utilisateur voit une erreur générique
- **Correction :** toujours suivre l'ordre : créer le stream → `SetDestination` → `Export()`

---

**Import partiel sans avertissement**
- **Symptôme :** 800 lignes sur 1000 importées, les 200 restantes absentes sans message d'erreur visible
- **Cause racine :** `Skip()` utilisé dans les triggers sans logging — les lignes ignorées disparaissent silencieusement
- **Impact métier :** données incomplètes en base, impossible de savoir quelles lignes ont été ignorées et pourquoi
- **Correction :** toujours logger les `Skip()` (au minimum dans un `Message()` cumulatif, idéalement dans une table d'erreurs dédiée). Afficher un résumé en fin d'import : « X lignes importées, Y ignorées ».

---

## Pièges et trade-offs

**Valider en import : coût vs sécurité**
Valider chaque ligne en import (existence de l'article, plage de valeurs, doublon) protège la base mais coûte cher en SQL. Un import de 50 000 lignes avec un `Get()` par ligne fait 50 000 requêtes. Le trade-off : valider uniquement ce qui est critique pour l'intégrité métier, pas tout ce qui est idéalement souhaitable. Pour les validations complexes, différez-les dans une Job Queue après staging.

**`Error()` vs `Skip()` : bloquer ou continuer ?**
Le choix dépend du contexte métier, pas de la facilité technique. Un import de virement bancaire doit être tout-ou-rien — une seule ligne invalide doit bloquer tout le fichier pour éviter un paiement partiel. Un import de catalogue articles peut tolérer des lignes ignorées — mieux vaut importer 950 articles sur 1000 que zéro. Documentez ce choix dans le code.

**XMLport dans un trigger utilisateur**
Ne déclenchez jamais un XMLport lourd (>1000 lignes) directement dans un trigger `OnAction` d'une page. Si l'opération dure plus de quelques secondes, la session UI se bloque et l'utilisateur pense que BC est planté. Pour les volumes importants, passez par une Job Queue.

**Format VariableText et valeurs avec séparateurs**
Sans `FieldDelimiter`, une valeur textuelle contenant votre séparateur (ex. une adresse avec `;`) casse le fichier. Ajoutez systématiquement `FieldDelimiter = '"'` dès que vos données peuvent contenir le caractère séparateur. C'est indolore si les données n'en ont pas, et critique si elles en ont.

---

## Résumé

Le XMLport occupe un rôle précis dans l'écosystème BC : il gère les échanges fichiers structurés, dans les deux sens, avec un contrôle ligne par ligne. Ce n'est pas un Report (qui affiche), ce n'est pas une API (qui communique en temps réel), c'est un pont entre BC et le monde des fichiers — XML ou CSV.

Sa force est sa lisibilité : en lisant le schema, on voit immédiatement la structure du fichier. Sa limite est son caractère synchrone et son comportement sur gros volumes en SaaS.

Les points à retenir pour aller en production :
- Toujours définir `TextEncoding = UTF8` pour les échanges modernes
- Toujours logger les lignes ignorées — un `Skip()` silencieux est un bug d'audit
- Choisir délibérément entre `Error()` et `Skip()` selon le contexte métier
- Sur les volumes > 100k lignes, combiner avec staging table + Job Queue
- Tester avec de vrais fichiers du tiers, pas des fichiers construits manuellement

Le prochain module (Gestion erreurs et transactions) approfondira la gestion des erreurs dans les transactions AL, dont certains patterns s'appliquent directement aux imports XMLport complexes.

---

<!-- snippet
id: al_xmlport_direction
type: concept
tech: AL
level: beginner
importance: high
format: knowledge
tags: al, xmlport, import, export, direction
title: XMLport — propriété Direction et ses implications
context: À définir dès la conception — impacte l'UX (Both affiche un choix à l'utilisateur) et la sécurité (Export seul évite qu'un XMLport serve à l'import par erreur)
content: Direction contrôle le sens du flux : Export = BC vers fichier, Import = fichier vers BC, Both = l'utilisateur choisit au lancement via la RequestPage. Choisir Export ou Import explicitement plutôt que Both quand le sens est fixé : cela évite qu'un utilisateur lance un import là où seul un export est prévu. La valeur par défaut est Both si la propriété est absente.
description: Direction définit le sens du flux — préférer Export ou Import explicite plutôt que Both quand le sens est connu.
-->

<!-- snippet
id: al_xmlport_format_variabletext_vs_fixedtext
type: concept
tech: AL
level: beginner
importance: high
format: knowledge
tags: al, xmlport, csv, format, variabletext, fixedtext
title: VariableText vs FixedText — choisir le bon format CSV
content: Format = VariableText produit un CSV avec des colonnes séparées par FieldSeparator (longueur variable). Format = FixedText produit un fichier à colonnes de largeur fixe — utilisé dans les échanges bancaires ou douaniers legacy. Dans 95% des cas, VariableText est le bon choix. Ajouter FieldDelimiter = '"' pour protéger les valeurs texte contenant le séparateur. Sans FieldDelimiter, une adresse avec ';' casse le parsing côté destinataire.
description: VariableText = CSV délimité (cas standard), FixedText = colonnes fixes (legacy). Toujours ajouter FieldDelimiter pour protéger les valeurs texte.
-->

<!-- snippet
id: al_xmlport_schema_structure
type: concept
tech: AL
level: beginner
importance: high
format: knowledge
tags: al, xmlport, schema, tableelement, fieldelement, textelement
title: Hiérarchie schema d'un XMLport
content: Le schema imbrique : textelement (nœud racine ou nœud répété — requis même en CSV), tableelement (lie un nœud à une table BC — répète automatiquement son contenu pour chaque enregistrement), fieldelement (lie un sous-nœud
