---
layout: page
title: "Data Exchange Framework & formats métier"

course: al
chapter_title: "Intégration et échanges de données"

chapter: 4
section: 2

tags: al, business-central, data-exchange, xml, json, formats-metier, edi, integration
difficulty: intermediate
duration: 130
mermaid: false

status: "published"
prev_module: "/courses/al/35_multi_environnements.html"
prev_module_title: "Multi-environnements et lifecycle ERP"
next_module: "/courses/al/15_posting_pipeline.html"
next_module_title: "Posting Pipeline Business Central"
---

# Data Exchange Framework & formats métier

## Objectifs pédagogiques

À l'issue de ce module, vous serez capable de :

- Expliquer le rôle du **Data Exchange Framework** (DEF) et pourquoi il existe face aux alternatives classiques
- Configurer une **Data Exchange Definition** complète pour un format métier (XML, CSV, texte fixe)
- Décrire le flux complet d'un import : du fichier brut jusqu'aux tables BC, en passant par les zones de transit
- Choisir entre DEF, codeunit classique, XMLport direct ou API REST selon le contexte réel
- Diagnostiquer un import silencieusement vide ou des données corrompues, avec une procédure pas à pas

---

## Mise en situation

Votre client est une PME industrielle qui reçoit chaque semaine des fichiers XML de ses fournisseurs — des **avis d'expédition avancés** (ASN). Ces fichiers ne suivent pas Peppol mais un format maison, avec des balises propriétaires et des codes internes à mapper vers les champs BC.

L'objectif : importer automatiquement ces fichiers en créant des en-têtes et lignes de réception dans BC, sans toucher au fichier. Pas d'API disponible côté fournisseur, pas de middleware externe — juste des fichiers déposés sur un SFTP.

Un junior écrira un codeunit de parsing one-shot. Ça fonctionnera. Puis le fournisseur renommera une balise, et ce sera à refaire. Puis un second fournisseur arrivera avec un format légèrement différent. C'est là que le DEF prend tout son sens.

---

## Pourquoi le DEF existe — et pourquoi ça change tout

Sans infrastructure dédiée, chaque intégration de fichier devient un codeunit sur mesure : on parse, on mappe, on insère. Ça fonctionne pour un format stable. Mais dès que le format évolue — une balise renommée, une colonne déplacée, un séparateur CSV changé — il faut modifier du code AL, recompiler, redéployer.

Le DEF répond à ça avec un principe simple : **séparer la configuration du moteur**.

- **La configuration** (*Data Exchange Definition*) décrit le format et les mappings. Elle vit dans des tables BC, modifiables sans toucher au code AL, sans redéploiement.
- **Le moteur** (codeunits génériques du framework) lit cette configuration et exécute le parsing et le mapping.

L'analogie qui aide : c'est un pilote automatique paramétrable. Vous définissez la destination et les règles de vol ; le moteur s'occupe d'exécuter. Changer de destination ne demande pas de modifier le moteur.

🧠 **Concept clé** : le DEF est une infrastructure de *configuration-driven integration*. La logique de transformation est dans les données (tables de configuration), pas dans le code.

Mais cette puissance a des limites — et savoir quand *ne pas* utiliser le DEF est aussi important que savoir le configurer.

---

## Quand utiliser le DEF — et quand ne pas le faire

Avant de se lancer dans la configuration, la vraie question professionnelle est : **est-ce que le DEF est le bon outil ici ?**

### Matrice de décision

| Critère | DEF | Codeunit classique | XMLport direct | API REST |
|---|---|---|---|---|
| **Format fichier stable, mapping simple** | ✅ Idéal | ⚠️ Surdimensionné | ✅ Possible | ❌ Non adapté |
| **Format qui change régulièrement** | ✅ Reconfigurable sans code | ⚠️ Refactoring fréquent | ⚠️ Refactoring | ❌ Non adapté |
| **Transformations métier complexes** (calculs, lookups conditionnels, règles multiples) | ⚠️ Limité | ✅ Flexible | ⚠️ Limité | ✅ Possible |
| **Fichiers très volumineux** (> 100 000 lignes) | ⚠️ Perf. dégradée | ✅ Contrôle total | ✅ Optimisable | ✅ Pagination possible |
| **Structure XML avec namespaces** | ❌ Non supporté nativement | ✅ Avec XMLport custom | ✅ Pris en charge | ❌ Non adapté |
| **Flux temps réel / webhook** | ❌ Pas conçu pour ça | ⚠️ Possible | ❌ | ✅ Adapté |
| **Formats multiples d'un même flux** (variantes fournisseur) | ✅ Une def par variante | ⚠️ Code conditionnel | ⚠️ | ❌ |
| **Accès utilisateur à la config** (sans développeur) | ✅ UI configurable | ❌ Code uniquement | ❌ | ❌ |
| **Formats standards BC** (SEPA, CAMT, Peppol) | ✅ Déjà fourni | ❌ À ne pas réinventer | ❌ | ❌ |

**En résumé** :
- DEF = formats fichiers semi-stables, accès config utilisateur souhaitable, mappings directs
- Codeunit classique = logique de transformation complexe, calculs conditionnels, volumes extrêmes
- XMLport = structure XML avec namespaces, parsing fin et contrôle ligne à ligne
- API REST = flux temps réel, systèmes avec API disponible (voir module 20)

💡 Le piège classique : utiliser un DEF pour un format dont les transformations métier sont si complexes (lookup conditionnel multi-niveaux, règles de gestion embarquées) qu'on finit par écrire un codeunit de post-traitement aussi lourd que si on avait tout fait en code. Dans ce cas, le DEF ajoute de la complexité sans apporter de bénéfice.

---

## Architecture du DEF — les pièces du puzzle

Avant de construire quoi que ce soit, il faut comprendre quelles tables jouent quel rôle. Elles s'articulent en couches :

### La Data Exchange Definition (table 1222)

C'est la racine. Elle nomme le format, indique son type (Import, Export, ou les deux) et précise quel codeunit va lire le fichier brut.

Champs importants :
- `Code` — identifiant unique du format
- `Type` — `Import`, `Export`, ou `Import/Export`
- `File Type` — `XML`, `Variable Text`, `Fixed Text`, `Json`
- `Reading/Writing XMLport` — le XMLport ou codeunit qui décode le format brut
- `Ext. Data Handling Codeunit` — codeunit qui parse le fichier et peuple la zone de transit

### Les Data Exchange Line Definitions (table 1227)

Un même fichier peut contenir plusieurs types de lignes. Un fichier bancaire MT940 a des lignes d'en-tête, des lignes de mouvement, des sous-lignes de détail. Chaque *Line Definition* correspond à un type de ligne, avec son identifiant et sa profondeur dans la hiérarchie.

### Les Data Exchange Column Definitions (table 1223)

Pour chaque *Line Definition*, on liste les colonnes (ou balises XML, ou champs JSON) attendues dans le fichier source. Chaque colonne porte un numéro d'ordre, un nom (ou chemin XPath pour XML), le type de données attendu, et des options de transformation (format de date, séparateur décimal…).

### Les Data Exchange Field Mappings (table 1225)

C'est le cœur du mapping : pour chaque colonne source, on indique quelle table BC et quel champ cible. Une même colonne peut alimenter plusieurs champs cibles si nécessaire.

### Data Exch. Field Value (table 1221) — la zone de transit

Après le parsing, chaque valeur extraite du fichier est stockée temporairement ici avec sa position (ligne, colonne). Le moteur de mapping lit cette table pour alimenter les tables cibles. **C'est le nœud central du diagnostic** en cas de problème d'import.

Le flux complet, visuellement :

```
Fichier brut
    ↓  [Ext. Data Handling Codeunit]
Data Exch. Field Value (table 1221)   ← zone de transit
    ↓  [Data Handling Codeunit + Field Mappings]
Tables BC cibles (Purchase Header, Purchase Line, etc.)
```

---

## Construire une Data Exchange Definition pas à pas

Prenons notre scénario d'import ASN. Le fichier XML ressemble à ceci :

```xml
<ASN>
  <Header>
    <VendorCode>FRNR-042</VendorCode>
    <ShipmentDate>20250312</ShipmentDate>
    <ExternalRef>ASN-2025-00891</ExternalRef>
  </Header>
  <Lines>
    <Line>
      <ItemRef>ART-7842</ItemRef>
      <Qty>150</Qty>
      <UOM>PCS</UOM>
    </Line>
    <Line>
      <ItemRef>ART-1023</ItemRef>
      <Qty>30</Qty>
      <UOM>BOX</UOM>
    </Line>
  </Lines>
</ASN>
```

### Étape 1 — Créer la définition de base

En AL, on pré-crée la configuration via un codeunit d'installation. C'est une bonne pratique pour la portabilité : la config voyage avec l'extension.

```al
codeunit 50200 "ASN Exchange Setup"
{
    procedure CreateASNDefinition()
    var
        DataExchDef: Record "Data Exch. Def";
    begin
        // Guard idempotent : ne pas recréer si déjà existant
        if DataExchDef.Get('ASN-IMPORT') then
            exit;

        DataExchDef.Init();
        DataExchDef.Code := 'ASN-IMPORT';
        DataExchDef.Name := 'Import ASN Fournisseur';
        DataExchDef.Type := DataExchDef.Type::Import;
        DataExchDef."File Type" := DataExchDef."File Type"::Xml;
        DataExchDef."Ext. Data Handling Codeunit" := Codeunit::"Import XML File to Data Exch.";
        DataExchDef.Insert(true);
    end;
}
```

### Étape 2 — Définir les Line Definitions

Notre fichier a deux niveaux : l'en-tête (`Header`) et les lignes (`Line`). On crée une *Line Definition* pour chacun.

```al
procedure CreateLineDefinitions(DataExchDefCode: Code[20])
var
    DataExchLineDef: Record "Data Exch. Line Def";
begin
    DataExchLineDef.Init();
    DataExchLineDef."Data Exch. Def Code" := DataExchDefCode;
    DataExchLineDef.Code := 'HEADER';
    DataExchLineDef.Name := 'En-tête ASN';
    DataExchLineDef."Line Type" := DataExchLineDef."Line Type"::Header;
    DataExchLineDef."Data Line Tag" := '/ASN/Header';
    DataExchLineDef.Insert(true);

    DataExchLineDef.Init();
    DataExchLineDef."Data Exch. Def Code" := DataExchDefCode;
    DataExchLineDef.Code := 'LINE';
    DataExchLineDef.Name := 'Ligne article';
    DataExchLineDef."Line Type" := DataExchLineDef."Line Type"::Detail;
    DataExchLineDef."Data Line Tag" := '/ASN/Lines/Line';
    DataExchLineDef."Parent Code" := 'HEADER';
    DataExchLineDef.Insert(true);
end;
```

⚠️ Le `Data Line Tag` est un XPath simplifié — BC ne supporte pas XPath complet. Il doit correspondre exactement au chemin depuis la racine du document. Une erreur ici est souvent silencieuse : le fichier est lu sans erreur mais aucune ligne n'est créée.

### Étape 3 — Déclarer les colonnes

```al
procedure CreateColumnDefs(DataExchDefCode: Code[20])
var
    DataExchColDef: Record "Data Exch. Column Def";
    ColNo: Integer;
begin
    ColNo := 1;
    DataExchColDef.Init();
    DataExchColDef."Data Exch. Def Code" := DataExchDefCode;
    DataExchColDef."Data Exch. Line Def Code" := 'HEADER';
    DataExchColDef."Column No." := ColNo;
    DataExchColDef.Name := 'VendorCode';
    DataExchColDef.Path := '/ASN/Header/VendorCode';
    DataExchColDef."Data Type" := DataExchColDef."Data Type"::Text;
    DataExchColDef.Insert(true);

    ColNo += 1;
    DataExchColDef.Init();
    DataExchColDef."Data Exch. Def Code" := DataExchDefCode;
    DataExchColDef."Data Exch. Line Def Code" := 'HEADER';
    DataExchColDef."Column No." := ColNo;
    DataExchColDef.Name := 'ShipmentDate';
    DataExchColDef.Path := '/ASN/Header/ShipmentDate';
    DataExchColDef."Data Type" := DataExchColDef."Data Type"::Date;
    DataExchColDef."Data Format" := 'yyyyMMdd';
    DataExchColDef.Insert(true);

    ColNo := 1;
    DataExchColDef.Init();
    DataExchColDef."Data Exch. Def Code" := DataExchDefCode;
    DataExchColDef."Data Exch. Line Def Code" := 'LINE';
    DataExchColDef."Column No." := ColNo;
    DataExchColDef.Name := 'ItemRef';
    DataExchColDef.Path := '/ASN/Lines/Line/ItemRef';
    DataExchColDef."Data Type" := DataExchColDef."Data Type"::Text;
    DataExchColDef.Insert(true);

    ColNo += 1;
    DataExchColDef.Init();
    DataExchColDef."Data Exch. Def Code" := DataExchDefCode;
    DataExchColDef."Data Exch. Line Def Code" := 'LINE';
    DataExchColDef."Column No." := ColNo;
    DataExchColDef.Name := 'Qty';
    DataExchColDef.Path := '/ASN/Lines/Line/Qty';
    DataExchColDef."Data Type" := DataExchColDef."Data Type"::Decimal;
    DataExchColDef.Insert(true);
end;
```

### Étape 4 — Mapper vers les tables BC

```al
procedure CreateFieldMappings(DataExchDefCode: Code[20])
var
    DataExchFieldMapping: Record "Data Exch. Field Mapping";
begin
    DataExchFieldMapping.Init();
    DataExchFieldMapping."Data Exch. Def Code" := DataExchDefCode;
    DataExchFieldMapping."Data Exch. Line Def Code" := 'HEADER';
    DataExchFieldMapping."Column No." := 1;
    DataExchFieldMapping."Table ID" := Database::"Purchase Header";
    DataExchFieldMapping."Field ID" := 2;               // "Buy-from Vendor No."
    DataExchFieldMapping."Optional" := false;
    DataExchFieldMapping.Insert(true);

    DataExchFieldMapping.Init();
    DataExchFieldMapping."Data Exch. Def Code" := DataExchDefCode;
    DataExchFieldMapping."Data Exch. Line Def Code" := 'LINE';
    DataExchFieldMapping."Column No." := 1;
    DataExchFieldMapping."Table ID" := Database::"Purchase Line";
    DataExchFieldMapping."Field ID" := 6;               // "No."
    DataExchFieldMapping."Optional" := false;
    DataExchFieldMapping.Insert(true);

    DataExchFieldMapping.Init();
    DataExchFieldMapping."Data Exch. Def Code" := DataExchDefCode;
    DataExchFieldMapping."Data Exch. Line Def Code" := 'LINE';
    DataExchFieldMapping."Column No." := 2;
    DataExchFieldMapping."Table ID" := Database::"Purchase Line";
    DataExchFieldMapping."Field ID" := 15;              // "Quantity"
    DataExchFieldMapping."Optional" := false;
    DataExchFieldMapping.Insert(true);
end;
```

💡 Le champ `Optional` mérite attention. Une colonne `Optional = false` absente du fichier génère une erreur propre avec message. Une colonne `Optional = true` manquante est silencieusement ignorée. Calibrez selon les SLA : sur les champs fonctionnellement obligatoires (N° fournisseur, montant), préférez `false` pour détecter immédiatement les fichiers malformés.

---

## Le workflow complet d'import — du fichier aux tables BC

Une fois la configuration en place, voici comment orchestrer l'import complet depuis un codeunit AL. C'est le workflow end-to-end que le module précédent ne montre pas — c'est ici qu'on connecte toutes les pièces.

```al
codeunit 50201 "ASN Import Processor"
{
    procedure ImportASNFile(FileStream: InStream): Boolean
    var
        DataExch: Record "Data Exch.";
        DataExchDef: Record "Data Exch. Def";
        DataExchFieldValue: Record "Data Exch. Field Value";
        ErrorText: Text;
    begin
        // 1. Récupérer la définition — erreur propre si absente
        if not DataExchDef.Get('ASN-IMPORT') then begin
            Error('La définition ASN-IMPORT est introuvable. Vérifiez le déploiement de l''extension.');
        end;

        // 2. Créer un enregistrement de suivi (Data Exch.) et attacher le fichier
        DataExch.Init();
        DataExch."Data Exch. Def Code" := 'ASN-IMPORT';
        DataExch.Insert(true);
        DataExch.ImportFileContent(FileStream);
        // Le contenu brut est stocké dans le BLOB de la table Data Exch.

        // 3. Phase de parsing : lire le fichier et peupler Data Exch. Field Value
        if not Codeunit.Run(DataExchDef."Ext. Data Handling Codeunit", DataExch) then begin
            ErrorText := GetLastErrorText();
            // Logguer l'erreur et nettoyer l'enregistrement orphelin
            DataExch.Delete(true);
            Error('Échec du parsing ASN (Exch. No. %1) : %2', DataExch."Entry No.", ErrorText);
        end;

        // 4. Vérification post-parsing : la zone de transit doit être peuplée
        DataExchFieldValue.SetRange("Data Exch. No.", DataExch."Entry No.");
        if DataExchFieldValue.IsEmpty() then begin
            DataExch.Delete(true);
            Error('Parsing terminé sans données extraites pour Exch. No. %1. Vérifiez les XPath des Line Definitions.', DataExch."Entry No.");
        end;

        // 5. Phase de mapping : alimenter les tables BC cibles depuis Field Value
        if not Codeunit.Run(DataExchDef."Data Handling Codeunit", DataExch) then begin
            ErrorText := GetLastErrorText();
            Error('Échec du mapping ASN (Exch. No. %1) : %2', DataExch."Entry No.", ErrorText);
        end;

        // 6. Validation post-import : vérifier que les Purchase Headers ont bien été créés
        // (logique métier spécifique à votre extension)
        ValidateImportedDocuments(DataExch."Entry No.");

        exit(true);
    end;

    local procedure ValidateImportedDocuments(DataExchEntryNo: Integer)
    var
        PurchaseHeader: Record "Purchase Header";
    begin
        // Exemple : vérifier qu'au moins un document a été créé
        PurchaseHeader.SetRange("Data Exch. Entry No.", DataExchEntryNo);
        if PurchaseHeader.IsEmpty() then
            Error('Import terminé mais aucun document de réception créé. Vérifiez les Field Mappings (Table ID / Field ID).');
    end;
}
```

🧠 La vérification à l'étape 4 (Data Exch. Field Value vide) est souvent absente dans les implémentations junior. C'est pourtant elle qui transforme un import silencieusement vide en erreur diagnosticable avec un message d'action claire.

---

## Gérer l'évolution d'un format — sans casser les imports existants

Un format fournisseur ne reste jamais stable indéfiniment. Le cas réel : votre fournisseur vous annonce qu'à partir du 1er mars, ses fichiers ASN auront une balise `<ShipmentRef>` en plus, et que `<ExternalRef>` sera renommée en `<VendorRef>`.

La mauvaise approche : modifier directement les Column Definitions existantes → les imports passés ne sont plus consultables dans leur format d'origine, et vous risquez de casser les mappings en production pendant la transition.

**La bonne approche : versioning des définitions**

```al
procedure CreateASNDefinitionV2()
var
    DataExchDef: Record "Data Exch. Def";
    DataExchColDef: Record "Data Exch. Column Def";
begin
    // Créer une nouvelle définition V2 sans toucher à l'ancienne
    if DataExchDef.Get('ASN-IMPORT-V2') then
        exit;

    // ... [même structure que V1, code condensé ici]
    DataExchDef.Code := 'ASN-IMPORT-V2';
    DataExchDef.Name := 'Import ASN Fournisseur V2 (mars 2025+)';
    DataExchDef.Insert(true);

    // Ajouter la nouvelle colonne ShipmentRef
    DataExchColDef.Init();
    DataExchColDef."Data Exch. Def Code" := 'ASN-IMPORT-V2';
    DataExchColDef."Data Exch. Line Def Code" := 'HEADER';
    DataExchColDef."Column No." := 3;
    DataExchColDef.Name := 'ShipmentRef';
    DataExchColDef.Path := '/ASN/Header/ShipmentRef';
    DataExchColDef."Data Type" := DataExchColDef."Data Type"::Text;
    DataExchColDef."Optional" := true; // Optionnel pendant la période de transition
    DataExchColDef.Insert(true);

    // Mettre à jour la colonne renommée (VendorRef au lieu de ExternalRef)
    DataExchColDef.Init();
    DataExchColDef."Data Exch. Def Code" := 'ASN-IMPORT-V2';
    DataExchColDef."Data Exch. Line Def Code" := 'HEADER';
    DataExchColDef."Column No." := 2; // Même position
    DataExchColDef.Name := 'VendorRef';
    DataExchColDef.Path := '/ASN/Header/VendorRef'; // Chemin mis à jour
    DataExchColDef."Data Type" := DataExchColDef."Data Type"::Text;
    DataExchColDef.Insert(true);
end;
```

**Stratégie de transition** :
1. Créer `ASN-IMPORT-V2` avec les nouvelles balises, toutes les nouvelles colonnes en `Optional = true`
2. Tester V2 en sandbox avec de vrais fichiers du fournisseur
3. Le jour J, basculer le sélecteur de définition dans votre codeunit d'import
4. Garder V1 pendant 3 mois pour les éventuelles ré-importations de fichiers historiques
5. Supprimer V1 après la période de rétention

💡 Si votre codeunit d'import sélectionne dynamiquement la définition selon la date du fichier ou une metadata du header XML, vous pouvez même gérer les deux versions en parallèle sans action manuelle.

---

## Les formats supportés et leurs particularités

### XML

Le plus commun en échanges B2B. Le DEF utilise des chemins XPath simplifiés. **Attention** : BC ne supporte pas les namespaces XML natifs dans les chemins — si votre fichier contient des namespaces (`xmlns:`), vous devrez pré-processer le fichier ou écrire un XMLport personnalisé. Le DEF ne convient pas ici sans adaptation.

### CSV et texte variable

Pour les fichiers CSV, le `File Type` est `Variable Text`. On définit le séparateur de colonne et l'encodage dans la définition. La colonne `Column No.` correspond à la position (1, 2, 3…) — pas de XPath.

```al
DataExchDef."Column Separator" := DataExchDef."Column Separator"::Semicolon;
DataExchDef."File Encoding" := DataExchDef."File Encoding"::"UTF-8";
```

⚠️ L'encodage est un piège classique. Un fichier Windows-1252 reçu d'un ERP vieux de 20 ans produira des données corrompues si vous laissez UTF-8. Demandez toujours à votre client l'encodage réel du fichier.

### Texte fixe

Pour les formats bancaires anciens, EDI simplifié, exports de mainframes. Chaque colonne est définie par sa position de début et sa longueur.

```al
DataExchColDef."Start Position" := 1;
DataExchColDef.Length := 10;
```

### JSON

Supporté depuis BC 19. Syntaxe similaire à XML mais les chemins utilisent la notation pointée (`Lines.Line.ItemRef`). Utile si vous recevez des webhooks en JSON stockés comme fichiers avant traitement différé.

---

## Formats métier courants en pratique

### SEPA et relevés bancaires

BC inclut nativement des définitions DEF pour SEPA CAMT.053 (relevé de compte) et CAMT.054 (avis de débit/crédit), utilisées dans le rapprochement bancaire. Il est rare de les modifier ; en revanche, comprendre leur structure aide à diagnostiquer un import bancaire qui échoue.

### Peppol / e-Document Framework

Les formats de facturation électronique Peppol BIS 3.0 sont gérés via l'e-Document Framework (BC 23+), une infrastructure séparée du DEF classique — à ne pas confondre.

### Formats EDI propriétaires

Le DEF est particulièrement adapté ici. Les clients qui ont des accords EDI avec leurs grands clients (grande distribution, industrie automobile) reçoivent des formats comme EDIFACT D97A ou X12, souvent via des convertisseurs VAN qui produisent un XML simplifié. C'est ce XML simplifié qu'on configure dans le DEF.

---

## Erreurs fréquentes — diagnostic réaliste

### Scénario 1 : l'import fonctionne en sandbox, rien en production

C'est la situation classique lors du premier déploiement. L'import se termine sans erreur, mais aucune ligne n'apparaît dans les tables cibles. La `Data Exch.` est créée, les logs ne montrent rien.

**Cause réelle** : la configuration DEF (tables 1222-1225) n'existe pas en production. Elle a été créée manuellement en sandbox via l'UI, mais les tables de configuration ne se déploient pas automatiquement avec l'extension AL.

**Procédure diagnostique** :
1. En production, ouvrir la page **Data Exchange Definitions** (recherche BC)
2. Chercher le code `ASN-IMPORT` — s'il n'existe pas, c'est la cause
3. Vérifier que le codeunit d'installation de votre extension a bien été exécuté

**Correction** : le codeunit `Install/Upgrade` de l'extension doit appeler `CreateASNDefinition()` avec le guard idempotent. Si le codeunit a été oublié, l'exécuter manuellement une fois via un codeunit de run temporaire.

---

### Scénario 2 : l'encodage a changé entre deux envois fournisseur

C'est un cas réel très fréquent. Pendant 6 mois, les imports fonctionnent. Puis un lundi matin, les données importées contiennent des caractères bizarres (`Ã©` au lieu de `é`, `â€™` au lieu de `'`). Aucun changement côté BC.

**Ce qui s'est passé** : le fournisseur a changé son système de génération de fichiers (mise à jour logiciel, changement d'ERP, nouveau prestataire EDI). L'ancien système produisait du Windows-1252, le nouveau produit de l'UTF-8 — ou l'inverse.

**Procédure diagnostique pas à pas** :
1. Télécharger le fichier brut depuis le SFTP
2. Ouvrir dans **Notepad++** → menu `Encodage` → l'encodage réel est affiché
3. Comparer avec `File Encoding` dans la `Data Exch. Def` (`ASN-IMPORT`)
4. Si différence → mettre à jour `File Encoding` dans la définition (sans redéploiement AL nécessaire
