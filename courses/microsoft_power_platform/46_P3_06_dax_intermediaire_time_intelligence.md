---
layout: page
title: "DAX intermédiaire et Time Intelligence"

course: microsoft_power_platform
chapter_title: "Power BI — Modélisation et analyse avancée"

chapter: 3
section: 2

tags: dax, power bi, time intelligence, mesures, calcul, modélisation
difficulty: intermediate
duration: 90
mermaid: false

status: "published"
prev_module: "/courses/microsoft_power_platform/44_P3_04_dax_fondamental.html"
prev_module_title: "DAX fondamental"
next_module: "/courses/microsoft_power_platform/47_P3_07_directquery_composite_models.html"
next_module_title: "DirectQuery et Composite Models dans Power BI"
---

# DAX intermédiaire et Time Intelligence

## Objectifs pédagogiques

À l'issue de ce module, vous serez capable de :

1. **Distinguer** le contexte de filtre du contexte de ligne, et comprendre pourquoi cette distinction change tout au comportement de vos mesures
2. **Écrire** des mesures DAX intermédiaires avec `CALCULATE`, `FILTER`, `ALL` et `VALUES`
3. **Implémenter** des calculs de Time Intelligence : cumul YTD, comparaison avec l'année précédente, moyennes mobiles
4. **Diagnostiquer** les erreurs silencieuses liées aux mauvaises relations, à un calendrier absent ou à un `CALCULATE` mal positionné
5. **Structurer** une mesure production-ready : nommage, gestion des cas limites, composition à partir de mesures existantes

---

## Mise en situation

Vous travaillez sur un rapport de performance commerciale pour une direction régionale. Le modèle contient une table `Sales` (transactions), une table `Products`, une table `Regions`, et… une colonne `OrderDate` dans `Sales` que quelqu'un a utilisée directement comme axe temporel.

Le rapport fonctionne *à peu près*, mais trois demandes arrivent : « Peut-on voir l'évolution par rapport au même trimestre l'an dernier ? », « Peut-on avoir le cumul du CA depuis le début de l'année fiscale ? », « Pourquoi le total affiché ne correspond pas à la somme des lignes ? »

Ces trois questions convergent vers le même endroit : DAX intermédiaire et Time Intelligence. Aucune de ces réponses ne passe par une mesure simple `SUM()`. C'est exactement ce que ce module couvre — y compris comment déboguer quand ça ne retourne pas ce qu'on attend.

---

## Contexte — Pourquoi DAX devient indispensable ici

Les mesures de base (`SUM`, `AVERAGE`, `COUNT`) répondent aux questions statiques. Dès qu'on veut comparer, cumuler, ou naviguer dans le temps, elles atteignent leur limite naturelle.

DAX a été conçu pour deux choses que les formules classiques ne savent pas faire proprement : **évaluer dans un contexte dynamique** (filtres qui changent selon ce qu'on affiche) et **naviguer dans une hiérarchie temporelle** sans avoir à construire chaque calcul à la main.

Ce n'est pas un langage de script — c'est un langage d'**expressions évaluées à chaque interaction visuelle**. Comprendre ça, c'est comprendre pourquoi le même calcul peut retourner des résultats différents selon l'endroit où on l'utilise.

---

## Principe de fonctionnement — Les deux contextes DAX

🧠 C'est LE concept fondateur. Tout le reste en découle.

### Contexte de ligne (*Row Context*)

Il existe quand DAX parcourt une table ligne par ligne — dans une colonne calculée, ou à l'intérieur d'une fonction itérative (`SUMX`, `AVERAGEX`…). Dans ce contexte, chaque ligne est accessible comme si vous étiez "positionné" dessus.

```dax
// Colonne calculée dans Sales
Marge = Sales[Revenue] - Sales[Cost]
// DAX évalue cette expression pour chaque ligne de Sales
// Sales[Revenue] désigne la valeur de la ligne courante
```

### Contexte de filtre (*Filter Context*)

Il existe quand une mesure est évaluée — dans un visuel, une carte, un tableau. Ce contexte est constitué de **tous les filtres actifs** : segments, filtres de page, lignes/colonnes d'une matrice, interactions entre visuels.

```dax
// Mesure
Total CA = SUM(Sales[Revenue])
// Résultat différent selon le contexte :
// → Dans une matrice par région : filtre actif = une région
// → Dans une carte sans filtre : toutes les lignes de Sales
```

💡 Une colonne calculée est figée à la création du modèle. Une mesure est recalculée à chaque rendu. C'est pour ça que les mesures sont quasi toujours préférables pour les agrégations.

### Voir l'effet du contexte — Avant et après CALCULATE

La confusion classique : une mesure retourne le même résultat partout dans un tableau, peu importe la ligne. Voici ce qui se passe réellement :

| Contexte | `SUM(Sales[Revenue])` | `CALCULATE(SUM(Sales[Revenue]), Products[Category] = "Électronique")` |
|---|---|---|
| Matrice — ligne "Mobilier" | 42 000 € (filtre = Mobilier) | 87 000 € (filtre forcé = Électronique, ignore Mobilier) |
| Matrice — ligne "Électronique" | 87 000 € (filtre = Électronique) | 87 000 € (identique — le filtre forcé correspond) |
| Carte sans filtre | 210 000 € (tout) | 87 000 € (filtre forcé = Électronique) |

`CALCULATE` ne "calcule pas différemment" — il modifie d'abord **quelles lignes sont visibles**, puis applique `SUM` sur ce sous-ensemble. C'est ça, la transition de contexte.

---

## CALCULATE — Le cœur du DAX avancé

Tout calcul DAX non trivial passe par `CALCULATE`. Sa signature est simple, mais sa logique est profonde :

```dax
CALCULATE(<expression>, <filtre1>, <filtre2>, ...)
```

Ce que fait `CALCULATE` en pratique : il évalue l'expression dans un **contexte de filtre modifié**. Les filtres passés en argument s'ajoutent, remplacent ou suppriment les filtres existants.

### Exemple concret — CA sur une catégorie spécifique

```dax
CA Électronique =
CALCULATE(
    SUM(Sales[Revenue]),                    -- expression à évaluer
    Products[Category] = "Électronique"     -- filtre ajouté au contexte
)
```

Peu importe ce que l'utilisateur a sélectionné comme catégorie dans le rapport, cette mesure **force** le filtre sur "Électronique". Pratique pour les benchmarks internes.

### Supprimer un filtre avec ALL

```dax
Part du CA =
DIVIDE(
    SUM(Sales[Revenue]),
    CALCULATE(SUM(Sales[Revenue]), ALL(Sales))  -- ignore tous les filtres sur Sales
)
```

`ALL(Sales)` dit à CALCULATE d'ignorer tous les filtres actifs sur la table `Sales`. Le résultat du dénominateur est donc toujours le CA total, quelle que soit la sélection — ce qui permet de calculer une part en pourcentage qui se comporte correctement dans une matrice.

⚠️ `ALL` avec une table entière supprime les filtres sur **toutes ses colonnes**. Si vous voulez ne supprimer qu'un seul filtre (par exemple, la région mais pas la date), utilisez `ALL(Sales[Region])`.

### FILTER pour des conditions complexes

```dax
CA Gros Clients =
CALCULATE(
    SUM(Sales[Revenue]),
    FILTER(
        Customers,
        Customers[AnnualRevenue] > 100000  -- condition qui ne peut pas s'écrire directement
    )
)
```

`FILTER` parcourt la table et retourne les lignes qui satisfont la condition. À utiliser quand la condition porte sur une expression calculée, pas juste une valeur de colonne égale à une constante.

💡 Préférez la syntaxe directe `Products[Category] = "X"` quand c'est possible — c'est plus rapide que `FILTER(Products, Products[Category] = "X")` car Power BI peut l'optimiser en filtre natif. `FILTER` sur une table de plusieurs millions de lignes peut provoquer un timeout : réservez-le aux cas où il est réellement nécessaire.

---

## Time Intelligence — Pourquoi ça ne marche pas sans table de dates

Avant même d'écrire la première fonction de Time Intelligence, il y a une condition préalable que beaucoup de rapports ne respectent pas : **une table de dates dédiée, marquée comme table de dates, reliée au modèle**.

### Ce qu'il faut en place

La table de dates doit :
- Contenir **une ligne par jour**, sans trou, sur toute la plage couverte par vos données
- Avoir une colonne de dates sans doublon
- Être marquée comme "Table de dates" dans Power BI (clic droit sur la table → Marquer comme table de dates)
- Être reliée à vos tables de faits via une relation sur la colonne date

```dax
// Créer une table de dates en DAX (dans Power BI : Nouveau tableau)
DateTable =
ADDCOLUMNS(
    CALENDAR(DATE(2020,1,1), DATE(2025,12,31)),  -- plage complète
    "Année", YEAR([Date]),
    "Mois", MONTH([Date]),
    "Nom Mois", FORMAT([Date], "MMMM"),
    "Trimestre", "T" & QUARTER([Date]),
    "Semaine ISO", WEEKNUM([Date], 2),
    "Année-Mois", FORMAT([Date], "YYYY-MM")      -- utile pour les axes
)
```

⚠️ Si vous utilisez directement `OrderDate` depuis la table `Sales` comme axe, les fonctions de Time Intelligence vont soit échouer, soit produire des résultats incorrects. Power BI ne peut pas construire une hiérarchie temporelle cohérente sans une table de dates dédiée.

---

## Fonctions de Time Intelligence — Les essentielles

### Cumul depuis le début de l'année — TOTALYTD

```dax
CA YTD =
TOTALYTD(
    SUM(Sales[Revenue]),   -- mesure de base
    DateTable[Date]        -- colonne de la table de dates
)
```

`TOTALYTD` modifie automatiquement le contexte de filtre pour inclure toutes les dates depuis le 1er janvier de l'année courante jusqu'à la date maximale du contexte actuel. Sur un graphique mensuel, chaque point représente le cumulé depuis janvier.

Pour une **année fiscale qui ne commence pas en janvier** :

```dax
CA YTD Fiscal =
TOTALYTD(
    SUM(Sales[Revenue]),
    DateTable[Date],
    "31/03"   -- fin de l'exercice fiscal : "JJ/MM", ici avril-mars
              -- exemples valides : "30/06" (juil-juin), "30/09" (oct-sep)
)
```

### Comparaison avec la période précédente — SAMEPERIODLASTYEAR

```dax
CA Année Précédente =
CALCULATE(
    SUM(Sales[Revenue]),
    SAMEPERIODLASTYEAR(DateTable[Date])
)
```

Cette mesure retourne le CA sur la période équivalente de l'année passée. Sur un graphique mensuel, mars 2024 retournera les données de mars 2023.

En combinant les deux, on peut calculer la variation :

```dax
Variation CA YoY =
DIVIDE(
    SUM(Sales[Revenue]) - [CA Année Précédente],
    [CA Année Précédente],
    0   -- valeur si division par zéro (premier exercice, pas de référence)
)
```

💡 Toujours utiliser `DIVIDE` plutôt que l'opérateur `/` dès qu'il y a un risque de division par zéro. `DIVIDE` gère ça proprement sans erreur.

### Autres fonctions temporelles utiles

```dax
// Même période du trimestre précédent
CA Trimestre Précédent =
CALCULATE(
    SUM(Sales[Revenue]),
    PREVIOUSQUARTER(DateTable[Date])
)

// Cumul depuis le début du trimestre
CA QTD =
TOTALQTD(SUM(Sales[Revenue]), DateTable[Date])

// Décalage de N périodes (très flexible)
CA Mois-2 =
CALCULATE(
    SUM(Sales[Revenue]),
    DATEADD(DateTable[Date], -2, MONTH)   -- 2 mois en arrière
)
```

`DATEADD` est la fonction la plus flexible — elle accepte `DAY`, `MONTH`, `QUARTER`, `YEAR` comme unité, et des valeurs négatives (passé) ou positives (futur dans les données disponibles).

---

## Moyennes mobiles et calculs glissants

Une moyenne mobile sur 3 mois est un bon exemple de calcul qui combine Time Intelligence et CALCULATE :

```dax
Moyenne Mobile 3 Mois =
AVERAGEX(
    DATESINPERIOD(
        DateTable[Date],
        LASTDATE(DateTable[Date]),   -- date de fin = dernière date du contexte
        -3,
        MONTH                        -- fenêtre de 3 mois en arrière
    ),
    [Total CA]                       -- mesure évaluée pour chaque mois de la fenêtre
)
```

`DATESINPERIOD` construit une table de dates glissante — ici, les 3 derniers mois à partir de la date courante. `AVERAGEX` itère sur cette table et évalue `[Total CA]` pour chaque mois, puis fait la moyenne. Le résultat lisse les pics et donne une tendance plus lisible.

---

## De la théorie à la mesure réelle — Une mesure production-ready

Comprendre `CALCULATE` et `SAMEPERIODLASTYEAR` séparément ne suffit pas. Voici comment assembler une mesure robuste telle qu'elle devrait apparaître dans un modèle de production — avec tous les pièges gérés.

### La mesure naive (ce qu'on écrit en premier)

```dax
-- Version naive : fonctionne dans les cas simples, fragile en production
Δ% CA vs N-1 = (SUM(Sales[Revenue]) - CALCULATE(SUM(Sales[Revenue]), SAMEPERIODLASTYEAR(DateTable[Date]))) / CALCULATE(SUM(Sales[Revenue]), SAMEPERIODLASTYEAR(DateTable[Date]))
```

Problèmes concrets : division par zéro si pas de données N-1, logique dupliquée, résultat `0%` affiché quand il devrait être vide (premier exercice), formule illisible.

### La mesure refactorisée (ce qu'on met en production)

```dax
-- Étape 1 : mesure de base
CA Total = SUM(Sales[Revenue])

-- Étape 2 : N-1 qui compose la mesure de base
CA N-1 =
CALCULATE(
    [CA Total],                                    -- référence la mesure, pas SUM() directement
    SAMEPERIODLASTYEAR(DateTable[Date])
)

-- Étape 3 : variation avec gestion explicite des cas limites
Δ% CA vs N-1 =
VAR vCA = [CA Total]
VAR vCAN1 = [CA N-1]
RETURN
    -- BLANK() si pas de N-1 (premier exercice) : évite un faux 0% trompeur
    -- DIVIDE gère la division par zéro sans erreur
    IF(
        ISBLANK(vCAN1),
        BLANK(),                                   -- pas de référence = cellule vide
        DIVIDE(vCA - vCAN1, vCAN1, BLANK())        -- variation propre
    )
```

Ce que cette version ajoute par rapport à la naive :
- **Composition** : `[CA N-1]` référence `[CA Total]` — si la logique de base change, un seul endroit à modifier
- **Variables** : lisible, pas d'évaluation double de l'expression
- **`IF(ISBLANK(vCAN1), BLANK(), ...)`** : distingue "pas de données" (BLANK) de "zéro vente" (0) — un 0% affiché quand il n'y a pas de référence N-1 est un mensonge
- **`DIVIDE(..., BLANK())`** : protection contre la division par zéro dans les cas résiduels

---

## Cas d'utilisation

### Cas 1 — Tableau de bord mensuel avec comparatif N-1

Un manager veut voir mois par mois : le CA du mois, le CA du même mois l'an dernier, et l'écart en pourcentage. Les trois mesures composées de la section précédente s'affichent directement dans une matrice avec `Année-Mois` en lignes — chaque ligne ayant son propre contexte de date.

### Cas 2 — Indicateur de performance cumulée vs objectif

L'équipe commerciale a des objectifs mensuels dans une table `Targets`. On veut le cumul du réalisé vs le cumul de l'objectif depuis le début de l'année :

```dax
Objectif YTD =
TOTALYTD(SUM(Targets[TargetAmount]), DateTable[Date])

Taux Atteinte YTD =
DIVIDE([CA YTD], [Objectif YTD], BLANK())
```

Ce calcul tient compte du contexte : si l'utilisateur filtre sur une région, les deux mesures se filtrent en conséquence automatiquement — c'est le contexte de filtre qui travaille pour vous.

### Cas 3 — Analyse des N derniers jours glissants

Pour un rapport opérationnel qui suit les 30 derniers jours de commandes :

```dax
CA 30 Derniers Jours =
VAR vDateRef =
    IF(
        MAX(DateTable[Date]) <= TODAY(),
        MAX(DateTable[Date]),   -- données à jour : on part de la dernière date disponible
        TODAY()                 -- données futures dans le modèle : on plafonne à aujourd'hui
    )
RETURN
CALCULATE(
    SUM(Sales[Revenue]),
    DATESINPERIOD(
        DateTable[Date],
        vDateRef,
        -30,
        DAY
    )
)
```

Pourquoi cette version plutôt que `MAX(DateTable[Date])` directement ? Si le modèle contient des données futures (prévisions, commandes planifiées), `MAX(DateTable[Date])` peut pointer dans le futur et la fenêtre de 30 jours sera décalée. La variable `vDateRef` plafonne à `TODAY()` dans ce cas, ce qui produit toujours la fenêtre "30 derniers jours calendaires réels".

Si en revanche le rapport est volontairement filtré sur une plage passée, `MAX(DateTable[Date])` ≤ `TODAY()` et le comportement est celui attendu : fenêtre depuis la fin de la plage filtrée. Les deux cas sont couverts.

---

## Diagnostic de mesures défaillantes

La première réaction face à une mesure qui retourne BLANK ou un résultat inattendu est souvent de réécrire la formule. C'est rarement la bonne approche — la cause est presque toujours dans le modèle ou dans le contexte, pas dans la syntaxe.

### Arbre de décision — Mesure vide ou incorrecte

```
Mesure retourne BLANK ou résultat inattendu
│
├── La mesure retourne BLANK partout (même dans une carte sans filtre)
│   ├── La table source est-elle vide ? → Vérifier l'import de données
│   ├── La colonne agrégée contient-elle des blancs ? → Ajouter IF(ISBLANK(), 0, ...)
│   └── Mauvais nom de table/colonne ? → Vérifier orthographe exacte dans la vue modèle
│
├── La mesure retourne BLANK sur certaines lignes seulement
│   ├── Time Intelligence (TOTALYTD, SAMEPERIODLASTYEAR...) ?
│   │   ├── Table de dates marquée comme "Table de dates" ? → Clic droit → Marquer
│   │   ├── Relation active entre DateTable et la table de faits ? → Vue Modèle
│   │   └── Plage DateTable couvre-t-elle toutes les dates des données ? → Vérifier MIN/MAX
│   └── CALCULATE avec FILTER ?
│       ├── La condition FILTER exclut-elle ces lignes ? → Tester la condition seule
│       └── La table dans FILTER est-elle la bonne ? → Vérifier les relations
│
├── La mesure retourne une valeur mais elle est incorrecte
│   ├── Le total ne correspond pas à la somme des lignes ?
│   │   └── Comportement normal avec ALL, ratio, ou mesure semi-additive
│   │       → Vérifier si c'est intentionnel, sinon revoir la logique ALL
│   ├── ALL() ignore les segments de l'utilisateur ?
│   │   └── Remplacer ALL() par ALLSELECTED() si le segment doit être respecté
│   └── CALCULATE avec FILTER sur grande table = timeout ou lenteur ?
│       └── Voir section Performance ci-dessous
│
└── La mesure fonctionne dans un tableau mais pas dans une carte
    └── Carte = pas de contexte de date → YTD ou glissant évalué sur toutes les dates
        → Ajouter filtre explicite dans le visuel, ou adapter la mesure
```

### Outil recommandé pour aller plus loin

Power BI inclut le **Performance Analyzer** (onglet Affichage → Performance Analyzer) qui enregistre le temps d'évaluation de chaque visuel. Si une mesure prend > 500 ms, c'est un signal. Pour analyser la requête DAX générée, copiez-la depuis Performance Analyzer et collez-la dans **DAX Studio** (outil gratuit externe) — vous verrez exactement ce que le moteur exécute.

---

## Performance et limitations

La plupart des lenteurs DAX viennent de deux sources : des itérateurs sur des tables volumineuses, et des FILTER imbriqués là où une syntaxe directe suffisait.

**`FILTER` sur une grande table coûte cher.** `FILTER(Sales, Sales[Amount] > 1000)` parcourt toutes les lignes de `Sales` à chaque évaluation. Si `Sales` contient 10 millions de lignes, c'est problématique. Alternative : si la condition peut être exprimée comme un filtre de colonne direct dans `CALCULATE`, faites-le — Power BI l'optimise en filtre natif sans scan complet.

**Les itérateurs (`SUMX`, `AVERAGEX`) évaluent ligne par ligne.** Ils sont puissants mais coûteux sur des tables volumineuses. Si vous pouvez exprimer le même calcul avec des mesures composées et `CALCULATE`, c'est généralement plus rapide.

**Les colonnes calculées consomment de la mémoire.** Une colonne calculée qui duplique un résultat qu'une mesure pourrait produire à la demande gonfle le modèle inutilement. Préférez la mesure sauf si vous avez besoin de filtrer ou trier sur cette valeur dans le modèle.

**`DIVIDE` est plus rapide que `IF(denominator = 0, BLANK(), numerator / denominator)`.** La version `DIVIDE` est optimisée en interne — utilisez-la systématiquement.

---

## Erreurs fréquentes

**Symptôme :** Les fonctions TOTALYTD ou SAMEPERIODLASTYEAR retournent des erreurs ou des blancs inattendus.  
**Diagnostic :** Appliquer les deux premières branches de l'arbre ci-dessus — table de dates marquée ? Relation active ?  
**Correction :** Clic droit sur la table de dates → "Marquer comme table de dates". Vérifier dans la vue Modèle que la relation est active (trait plein, pas en pointillés).

---

**Symptôme :** Le total d'une mesure dans une matrice ne correspond pas à la somme des lignes.  
**Cause :** Comportement normal et correct — c'est la définition d'une mesure semi-additive ou d'un calcul avec `ALL`. La mesure est réévaluée au niveau du total avec un contexte de filtre différent (sans filtre sur la dimension de ligne).  
**Correction :** Si ce n'est pas voulu, revoir la logique de la mesure. Si c'est voulu (ex : % de total, ratio), c'est exactement le bon comportement.

---

**Symptôme :** `CALCULATE` avec `ALL(Table)` continue de respecter les filtres d'une autre table.  
**Cause :** `ALL` ne supprime les filtres que sur la table spécifiée. Les filtres venant d'autres tables (via des relations) restent actifs.  
**Correction :** Utiliser `ALL(Table1, Table2)` ou `REMOVEFILTERS()` pour cibler plusieurs tables. `ALLSELECTED()` est une alternative utile si vous voulez ignorer les filtres internes au visuel mais garder les segments.

---

**Symptôme :** Une mesure qui fonctionne dans un tableau donne des résultats étranges dans une carte ou un KPI.  
**Cause :** Dans une carte, il n'y a pas de contexte de date explicite — la mesure est évaluée sur **toutes les dates**. Une mesure YTD dans une carte affichera le YTD de la date maximale des données, pas de la date du jour.  
**Correction :** Ajouter un filtre de date explicite dans le visuel, ou adapter la mesure avec une variable `vDateRef` plafonnée à `TODAY()` comme dans le Cas 3.

---

## Bonnes pratiques

**Nommer les mesures avec intention.** Une mesure qui s'appelle `CA` est ambiguë. `CA Total`, `CA YTD`, `CA N-1`, `Δ% CA vs N-1` — ces noms permettent à n'importe qui de comprendre ce qu'il affiche sans ouvrir la formule. Dans un modèle partagé, c'est de la documentation gratuite.

**Composer les mesures plutôt que dupliquer la logique.** Si `[CA N-1]` est déjà une mesure, `[Δ% CA vs N-1]` doit la référencer — pas réécrire le `CALCULATE(SUM(...), SAMEPERIODLASTYEAR(...))`. Quand la logique change, vous n'avez qu'un seul endroit à modifier.

**Utiliser des variables pour les mesures complexes.** `VAR vCA = [CA Total]` évalue l'expression une seule fois et la réutilise. En plus d'être plus lisible, c'est plus performant qu'évaluer deux fois la même expression dans une formule.

**Documenter les cas limites dans la formule elle-même.** DAX accepte les commentaires avec `--` ou `/* */`. Un commentaire sur un `IF(ISBLANK(vCAN1), BLANK(), ...)` qui explique "BLANK si pas de données N-1 pour éviter un faux 0%" fait gagner du temps à la prochaine personne qui lit le modèle — y compris vous dans six mois.

**Tester les mesures à plusieurs granularités.** Une mesure qui fonctionne au niveau mensuel peut se comporter différemment au niveau annuel ou jour. Tester systématiquement dans une matrice avec au moins trois granularités différentes (jour, mois, année) avant de considérer une mesure comme terminée.

**Regrouper les mesures dans une table dédiée.** Créez une table vide (souvent appelée `_Mesures` ou `KPIs`) et déplacez-y toutes vos mesures. Le modèle devient beaucoup plus lisible quand les mesures ne sont pas éparpillées dans les tables de faits — la table `_Mesures` remonte en tête de liste avec le préfixe `_`.

---

## Résumé

| Concept | Ce qu'il fait | À retenir |
|---|---|---|
| Contexte de filtre | Détermine quelles lignes sont visibles lors de l'évaluation d'une mesure | Change à chaque visuel, segment, interaction |
| Contexte de ligne | Permet d'accéder à la valeur d'une colonne pour la ligne courante | Existe dans les colonnes calculées et les itérateurs |
| `CALCULATE` | Évalue une expression dans un contexte de filtre modifié | Fondation de presque tout calcul avancé |
| `ALL` / `ALLSELECTED` | Supprime des filtres sur une table ou colonne | `ALL` total, `ALLSELECTED` respecte les segments |
| `TOTALYTD` / `TOTALQTD` | Cumule depuis le début de la période jusqu'au contexte actuel | Nécessite une table de dates marquée |
| `SAMEPERIODLASTYEAR` | Décale le contexte temporel d'un an en arrière | Toujours utiliser avec une table de dates |
| `DATEADD` | Décale de N unités (jour, mois, trimestre, année) | Plus flexible que les fonctions dédiées |
| `DATESINPERIOD` | Construit une fenêtre glissante de N périodes | Base des moyennes mobiles et des cumuls glissants |
| Table de dates | Prérequis de toutes les fonctions Time Intelligence | Doit être marquée, continue, sans doublon |
| `VAR` + `RETURN` | Décompose une mesure complexe en étapes lisibles | Évite l'évaluation double et améliore la lisibilité |
| `IF(ISBLANK(...), BLANK(), ...)` | Distingue "pas de données" de "zéro" | Évite les faux 0% trompeurs en N-1 |

La Time Intelligence DAX n'est pas magique — c'est un ensemble de fonctions qui manipulent le contexte de filtre temporel. Une fois qu'on comprend qu'elles ne font que modifier "quelles dates sont visibles", le comportement de chaque fonction devient prévisible. Et quand quelque chose ne fonctionne pas, le problème est presque toujours dans le modèle (table de dates, relation) plutôt que dans la formule elle-même.

---

<!-- snippet
id: dax_calculate
