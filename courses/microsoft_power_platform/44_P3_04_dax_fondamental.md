---
layout: page
title: "DAX fondamental"

course: microsoft_power_platform
chapter_title: "Power BI — Données et calculs"

chapter: 3
section: 2

tags: dax, power bi, mesures, colonnes calculées, contexte de filtre, agrégation
difficulty: beginner
duration: 90
mermaid: false

status: "published"
prev_module: "/courses/microsoft_power_platform/41_P3_01_architecture_power_bi.html"
prev_module_title: "Architecture Power BI"
next_module: "/courses/microsoft_power_platform/46_P3_06_dax_intermediaire_time_intelligence.html"
next_module_title: "DAX intermédiaire et Time Intelligence"
---

# DAX fondamental

## Objectifs pédagogiques

À l'issue de ce module, vous serez capable de :

1. **Distinguer** une mesure DAX d'une colonne calculée, et choisir laquelle créer selon le besoin
2. **Écrire** des formules DAX de base : `SUM`, `CALCULATE`, `FILTER`, `DIVIDE`, `IF`
3. **Expliquer** ce qu'est le contexte de filtre et pourquoi il change le résultat d'une mesure
4. **Identifier** les erreurs classiques de débutant en DAX et les corriger
5. **Organiser** ses mesures dans un rapport pour qu'elles restent maintenables

---

## Mise en situation

Vous travaillez dans une PME qui vend des produits en ligne. Le modèle de données est déjà en place — une table `Ventes` reliée à `Produits`, `Clients` et `Calendrier` (c'est le schéma en étoile du module précédent, on part de là).

Votre responsable vous demande trois chiffres pour le tableau de bord :

- Le **chiffre d'affaires total** et sa **progression vs N-1**
- La **marge nette** par catégorie de produits
- Le **nombre de clients actifs** ce mois-ci

Excel vous aurait suffi pour une extraction ponctuelle. Mais ici, ces chiffres doivent se recalculer automatiquement quand l'utilisateur filtre sur un pays, une période, une gamme de produits. C'est exactement ce que DAX fait — et ce que les formules classiques ne peuvent pas faire.

---

## Pourquoi DAX existe — et ce qu'il change

DAX signifie *Data Analysis Expressions*. C'est le langage de formules de Power BI (et d'Analysis Services, et d'Excel Power Pivot — la même syntaxe fonctionne partout).

Ce qui distingue DAX d'Excel, ce n'est pas la syntaxe — elle est très proche. C'est le **mode de calcul**. Dans Excel, une formule `SOMME` travaille sur une plage de cellules fixe. Dans DAX, une mesure `SUM` travaille sur une table, et le résultat change selon le **contexte dans lequel elle est évaluée**.

Concrètement : vous écrivez `SUM(Ventes[Montant])` une seule fois. Sur un visuel "total général", elle renvoie 2 300 000 €. Sur un visuel filtré sur "France — Q1 2024", elle renvoie 340 000 €. La formule n'a pas changé. C'est le contexte de filtre qui a changé.

🧠 **DAX ne calcule pas une valeur — il calcule une valeur dans un contexte.** Comprendre ça, c'est comprendre 80% du comportement de DAX.

---

## Les deux choses qu'on crée avec DAX

Avant d'écrire la moindre formule, il faut savoir *où* on l'écrit et *pourquoi*.

### La mesure

Une mesure est un calcul qui s'exécute à la volée, au moment de l'affichage, en tenant compte des filtres actifs. Elle ne stocke aucune donnée. Elle n'existe que quand un visuel en a besoin.

C'est la forme la plus courante — et la plus puissante. Toutes les formules dynamiques, tous les KPIs, toutes les comparaisons temporelles se font avec des mesures.

```dax
-- Créer dans l'onglet "Modélisation" → Nouvelle mesure
CA Total = SUM(Ventes[Montant])
```

### La colonne calculée

Une colonne calculée s'exécute **une fois**, au moment du chargement du modèle, et stocke le résultat dans la table. Elle travaille ligne par ligne, comme une formule Excel classique.

```dax
-- Créer dans la table Ventes, onglet "Modélisation" → Nouvelle colonne
Marge Brute = Ventes[Montant] - Ventes[Coût]
```

| | Mesure | Colonne calculée |
|---|---|---|
| **Quand calculé ?** | À chaque affichage | Une fois au chargement |
| **Sensible aux filtres ?** | ✅ Oui | ❌ Non |
| **Consomme de la RAM ?** | Non | Oui (stockée en mémoire) |
| **Utilisable en axe / ligne de matrice ?** | Non | Oui |
| **Usage typique** | KPIs, totaux, ratios | Catégorisation, concaténation |

💡 **Règle simple :** si la valeur doit répondre aux filtres du rapport → mesure. Si la valeur enrichit une ligne de données (comme une nouvelle colonne dans Excel) → colonne calculée. En cas de doute, choisir la mesure.

---

## Le contexte de filtre — l'idée centrale

Imaginez un entonnoir. Quand un utilisateur clique sur "France" dans un segment, Power BI place mentalement un filtre sur toute la table `Ventes` : seules les lignes où `Pays = "France"` passent. Ensuite, toutes vos mesures sont calculées sur ce sous-ensemble.

Ce filtre, c'est le **contexte de filtre**. Il peut venir :
- d'un segment (slicer)
- d'un filtre de page ou de rapport
- de la position dans un visuel (chaque ligne d'un tableau = un filtre sur la dimension en ligne)
- d'une fonction DAX comme `CALCULATE`

⚠️ **L'erreur classique du débutant :** créer une colonne calculée en pensant qu'elle sera sensible aux filtres du rapport. Elle ne l'est pas. Une colonne calculée voit toutes les lignes de la table, sans aucun filtre du rapport.

---

## Les formules essentielles — avec leur logique

### Agrégations de base

Ce sont les briques fondamentales. Elles fonctionnent toutes de la même façon : elles prennent une colonne, retournent un scalaire.

```dax
CA Total = SUM(Ventes[Montant])
-- Additionne toutes les valeurs de la colonne Montant
-- dans le contexte de filtre courant

Nb Commandes = COUNTROWS(Ventes)
-- Compte le nombre de lignes de la table Ventes
-- (plus fiable que COUNT sur une colonne nullable)

Prix Moyen = AVERAGE(Ventes[Prix Unitaire])
-- Moyenne des valeurs non nulles

CA Max Jour = MAX(Ventes[Montant])
-- Valeur la plus haute dans le contexte
```

🧠 `COUNTROWS` sur une table est préférable à `COUNT` sur une colonne dès que vous voulez compter des enregistrements. `COUNT` ignore les valeurs vides, ce qui peut créer des surprises.

### DIVIDE — la division sans plantage

En DAX, diviser par zéro retourne une erreur visible dans les visuels. `DIVIDE` gère ça proprement.

```dax
Taux Marge = DIVIDE(
    SUM(Ventes[Marge Brute]),  -- numérateur
    SUM(Ventes[Montant]),      -- dénominateur
    0                          -- valeur si dénominateur = 0 (optionnel, défaut = BLANK)
)
```

💡 Utilisez toujours `DIVIDE` plutôt que l'opérateur `/` pour tout calcul de ratio. La ligne `0` en troisième argument est ce qui s'affiche si le dénominateur est nul — BLANK() est souvent préférable à 0 pour les KPIs, parce que BLANK disparaît dans les visuels au lieu d'afficher "0%".

### CALCULATE — la formule la plus importante de DAX

`CALCULATE` est la seule fonction DAX capable de **modifier le contexte de filtre**. Tout ce que vous voulez calculer "hors contexte courant" passe par elle.

Sa structure : `CALCULATE(<expression>, <filtre1>, <filtre2>, ...)`

```dax
-- Chiffre d'affaires uniquement pour la catégorie "Électronique"
CA Électronique = CALCULATE(
    SUM(Ventes[Montant]),           -- ce qu'on calcule
    Produits[Catégorie] = "Électronique"  -- dans ce contexte de filtre
)

-- CA sur les 12 derniers mois glissants
CA 12 mois = CALCULATE(
    SUM(Ventes[Montant]),
    DATESINPERIOD(
        Calendrier[Date],
        LASTDATE(Calendrier[Date]),
        -12,
        MONTH
    )
)
```

🧠 `CALCULATE` ne *remplace* pas toujours le contexte de filtre — il le *modifie*. Si un filtre sur "France" est déjà actif et que vous ajoutez un filtre sur une catégorie, les deux s'appliquent. Pour supprimer un filtre existant, il faut `ALL()`.

### ALL — "ignore ce filtre"

```dax
-- % du CA total, quelle que soit la sélection active
Part du Total = DIVIDE(
    SUM(Ventes[Montant]),
    CALCULATE(SUM(Ventes[Montant]), ALL(Ventes))
    -- ALL(Ventes) supprime TOUS les filtres sur la table Ventes
)
```

Cette mesure affiche la part de chaque ligne par rapport au grand total, même quand un filtre est actif. Sans `ALL`, le dénominateur serait identique au numérateur (les deux seraient dans le même contexte filtré) et vous auriez toujours 100%.

### IF et SWITCH — la logique conditionnelle

```dax
-- Classification simple
Performance = IF(
    [CA Total] >= 100000,
    "Objectif atteint",
    "En dessous de l'objectif"
)

-- Quand il y a plus de 2 cas, SWITCH est plus lisible que des IF imbriqués
Segment Client = SWITCH(
    TRUE(),                                  -- évalue chaque condition
    Clients[NbCommandes] >= 10, "VIP",
    Clients[NbCommandes] >= 3,  "Régulier",
    "Nouveau"                                -- valeur par défaut
)
```

💡 `SWITCH(TRUE(), ...)` est le pattern pour écrire des conditions range (supérieur, inférieur) avec SWITCH. C'est le pattern standard — vous le verrez partout dans les modèles Power BI.

---

## Construction progressive — une mesure de CA N-1

Voici comment un calcul réel se construit, étape par étape.

**v1 — Le CA de base**

```dax
CA Total = SUM(Ventes[Montant])
```

Ça fonctionne dans le contexte courant. Si l'utilisateur filtre sur 2024, on voit le CA 2024.

**v2 — Le CA de l'année précédente**

```dax
CA N-1 = CALCULATE(
    SUM(Ventes[Montant]),
    SAMEPERIODLASTYEAR(Calendrier[Date])
    -- Décale le contexte temporel d'un an en arrière
)
```

`SAMEPERIODLASTYEAR` est une fonction d'intelligence temporelle — elle requiert une table Calendrier marquée comme telle dans le modèle (ce qui était fait dans le module précédent).

**v3 — La variation en pourcentage, propre et lisible**

```dax
Évolution CA = DIVIDE(
    [CA Total] - [CA N-1],   -- on réutilise les mesures déjà créées
    [CA N-1],
    BLANK()                  -- pas de valeur si N-1 est vide (début d'historique)
)
```

⚠️ On ne réécrit pas `SUM(Ventes[Montant])` dans cette troisième mesure — on appelle `[CA Total]`. Réutiliser ses propres mesures, c'est la base de la maintenabilité en DAX. Si la logique de `CA Total` change demain, un seul endroit à modifier.

---

## Cas d'utilisation concrets

### Cas 1 — Taux de conversion

```dax
-- Nb commandes avec au moins un produit vendu / nb total de commandes créées
Taux Conversion = DIVIDE(
    COUNTROWS(FILTER(Commandes, Commandes[Statut] = "Validée")),
    COUNTROWS(Commandes),
    0
)
```

`FILTER` retourne une table filtrée. `COUNTROWS` compte ses lignes. La combinaison `COUNTROWS(FILTER(...))` est le pattern standard pour "compter les lignes qui respectent une condition".

### Cas 2 — Clients actifs ce mois

```dax
Clients Actifs Mois = CALCULATE(
    DISTINCTCOUNT(Ventes[ClientID]),
    -- DISTINCTCOUNT = nombre de valeurs uniques
    DATESMTD(Calendrier[Date])
    -- DATESMTD = "Month To Date" : du 1er du mois à la date max du contexte
)
```

`DISTINCTCOUNT` sur un identifiant client est plus fiable que `COUNT` sur un nom — un client peut commander plusieurs fois, il ne faut le compter qu'une fois.

### Cas 3 — Marge par catégorie avec format %

```dax
Taux Marge Nette = DIVIDE(
    SUM(Ventes[Montant]) - SUM(Ventes[Coût]),
    SUM(Ventes[Montant]),
    BLANK()
)
-- Mettre en forme en % dans l'onglet Modélisation → Format
```

Cette mesure dans un visuel "Matrice" avec `Catégorie` en ligne donnera automatiquement le taux de marge par catégorie, puis le total. Le contexte de filtre change à chaque ligne.

---

## Erreurs fréquentes

**"Ma mesure affiche le même chiffre partout"**

Symptôme : peu importe le filtre, la valeur ne change pas.
Cause : vous avez créé une *colonne calculée* au lieu d'une *mesure*.
Correction : supprimer la colonne calculée, créer une mesure avec la même formule.

---

**"CALCULATE ne filtre pas comme prévu"**

Symptôme : `CALCULATE(SUM(...), Produits[Catégorie] = "X")` retourne le CA total, pas le CA de la catégorie X.
Cause : la relation entre `Ventes` et `Produits` n'est pas active dans le modèle, ou la direction de filtrage est inversée.
Correction : vérifier dans la vue Modèle que la relation existe et filtre dans le bon sens (de `Produits` vers `Ventes`).

---

**"DIVIDE retourne BLANK et j'attends 0"**

Symptôme : des cases vides dans un tableau là où vous voulez voir des zéros.
Cause : le troisième argument de `DIVIDE` est omis (défaut = BLANK) ou vous avez explicitement mis `BLANK()`.
Correction : mettre `0` comme troisième argument si vous voulez que les cases vides affichent zéro. Mais réfléchissez : BLANK filtre les lignes dans certains visuels, ce qui peut être un comportement souhaitable.

---

**"Ma mesure % du total est toujours 100%"**

Symptôme : chaque ligne affiche 100%.
Cause : le dénominateur est dans le même contexte filtré que le numérateur.
Correction : envelopper le dénominateur dans `CALCULATE(..., ALL(<table>))` pour lever le filtre.

---

## Bonnes pratiques

**Nommer ses mesures clairement.** `[CA Total]`, `[CA N-1]`, `[Taux Marge Nette]` — pas `[Mesure1]` ou `[SUM CA]`. Le nom apparaît dans les visuels et dans les formules qui réutilisent la mesure.

**Regrouper ses mesures dans une table dédiée.** Créer une table vide appelée `_Mesures` (ou `[KPIs]`) et y déplacer toutes les mesures. Dans le volet Champs, tout est au même endroit, les tables de données restent propres.

**Toujours mettre en forme immédiatement.** Une mesure de montant sans format monétaire, c'est `1234567` au lieu de `1 234 567 €`. Ça se fait dans l'onglet Modélisation → Format, une fois la mesure créée.

**Commenter les formules complexes.** DAX supporte les commentaires sur une ligne avec `--` et les blocs avec `/* ... */`. Sur une mesure de 10 lignes, un commentaire au début qui dit ce qu'elle calcule évite 5 minutes de relecture 3 mois plus tard.

```dax
/* 
   Taux de marge nette = (CA - Coût) / CA
   BLANK si aucune vente dans le contexte (évite d'afficher 0% sur des lignes vides)
*/
Taux Marge Nette = DIVIDE(
    SUM(Ventes[Montant]) - SUM(Ventes[Coût]),  -- numérateur = marge brute
    SUM(Ventes[Montant]),                       -- dénominateur = CA
    BLANK()
)
```

---

## Résumé

| Concept | Ce qu'il fait | À retenir |
|---|---|---|
| **Mesure** | Calcul dynamique, sensible aux filtres | Toujours préférer pour les KPIs |
| **Colonne calculée** | Calcul statique ligne par ligne | Pour enrichir les données, pas pour les KPIs |
| **Contexte de filtre** | Ensemble des filtres actifs lors du calcul | Tout résultat DAX dépend de lui |
| **CALCULATE** | Modifie le contexte de filtre | La formule la plus importante de DAX |
| **ALL** | Supprime un ou tous les filtres | Indispensable pour les % de total |
| **DIVIDE** | Division sans erreur sur /0 | Toujours utiliser à la place de `/` |
| **SAMEPERIODLASTYEAR** | Décale le contexte d'un an | Nécessite une table Calendrier marquée |
| **COUNTROWS(FILTER(...))** | Compte les lignes selon une condition | Pattern standard pour "compter si" |

DAX peut sembler déroutant au début parce que le résultat d'une formule n'est pas une valeur fixe — c'est une *règle de calcul* qui s'adapte en permanence. Une fois cette idée intégrée, les formules deviennent beaucoup plus lisibles, et les comportements inattendus beaucoup plus prévisibles.

---

<!-- snippet
id: dax_mesure_vs_colonne_concept
type: concept
tech: dax
level: beginner
importance: high
format: knowledge
tags: dax, mesure, colonne-calculee, contexte
title: Mesure vs colonne calculée — quelle différence
content: Une mesure est calculée à chaque affichage et voit les filtres actifs du rapport. Une colonne calculée est calculée une fois au chargement, stockée en mémoire, et ne voit aucun filtre de rapport. Si vous avez besoin d'un KPI dynamique → mesure. Si vous avez besoin d'une nouvelle colonne dans la table (comme un calcul de marge par ligne) → colonne calculée.
description: La mesure répond aux filtres du rapport, la colonne calculée non — choisir selon si la valeur doit être dynamique
-->

<!-- snippet
id: dax_contexte_filtre_concept
type: concept
tech: dax
level: beginner
importance: high
format: knowledge
tags: dax, contexte-filtre, calculate, power-bi
title: Le contexte de filtre — mécanisme central de DAX
content: À chaque calcul, Power BI construit un "entonnoir" de lignes visibles : filtres de segments, filtres de page, position dans un visuel (chaque ligne d'un tableau = un filtre sur la dimension). La mesure s'exécute uniquement sur ces lignes. Même formule = résultats différents selon le contexte. C'est pourquoi SUM(Ventes[Montant]) donne 2 300 000 sur le total et 340 000 quand on filtre sur France.
description: DAX ne calcule pas une valeur fixe — il calcule une valeur dans un contexte de filtre qui change à chaque visuel
-->

<!-- snippet
id: dax_calculate_syntaxe
type: command
tech: dax
level: beginner
importance: high
format: knowledge
tags: dax, calculate, contexte-filtre, mesure
title: CALCULATE — modifier le contexte de filtre
command: <NOM_MESURE> = CALCULATE(<EXPRESSION>, <FILTRE1>, <FILTRE2>)
example: CA Électronique = CALCULATE(SUM(Ventes[Montant]), Produits[Catégorie] = "Électronique")
description: CALCULATE est la seule fonction DAX qui modifie le contexte de filtre — indispensable pour tout calcul hors contexte courant
-->

<!-- snippet
id: dax_divide_division_securisee
type: tip
tech: dax
level: beginner
importance: high
format: knowledge
tags: dax, divide, division, erreur
title: Toujours utiliser DIVIDE au lieu de l'opérateur /
content: DIVIDE(numérateur, dénominateur, valeur_si_zéro) gère silencieusement la division par zéro. Avec l'opérateur /, Power BI affiche une erreur visible dans le visuel. Le troisième argument peut être 0 (affiche zéro) ou BLANK() (case vide, ce qui filtre la ligne dans certains visuels). Exemple : DIVIDE([Marge], [CA Total], BLANK()).
description: Remplacer systématiquement / par DIVIDE pour éviter les erreurs de division par zéro dans les visuels
-->

<!-- snippet
id: dax_all_pourcentage_total
type: command
tech: dax
level: beginner
importance: high
format: knowledge
tags: dax, all, calculate, pourcentage
title: % du total avec ALL — lever le filtre sur le dénominateur
command: <NOM> = DIVIDE(<MESURE>, CALCULATE(<MESURE>, ALL(<TABLE>)))
example: Part du Total = DIVIDE([CA Total], CALCULATE([CA Total], ALL(Ventes)))
description: Sans ALL sur le dénominateur, les deux parties sont dans le même contexte filtré et le résultat est toujours 100%
-->

<!-- snippet
id: dax_countrows_filter_pattern
type: command
tech: dax
level: beginner
importance: medium
format: knowledge
tags: dax, countrows, filter, compter-si
title: Compter les lignes selon une condition — COUNTROWS + FILTER
command: <NOM> = COUNTROWS(FILTER(<TABLE>, <CONDITION>))
example: Commandes Validées = COUNTROWS(FILTER(Commandes, Commandes[Statut] = "Validée"))
description: Pattern standard pour "COUNTIF" en DAX — FILTER retourne une table réduite, COUNTROWS en compte les lignes
-->

<!-- snippet
id: dax_switch_true_pattern
type: command
tech: dax
level: beginner
importance: medium
format: knowledge
tags: dax, switch, if, conditions
title: SWITCH(TRUE()) — conditions range lisibles sans IF imbriqués
command: <NOM> = SWITCH(TRUE(), <CONDITION1>, <RESULTAT1>, <CONDITION2>, <RESULTAT2>, <DEFAUT>)
example: Segment = SWITCH(TRUE(), Clients[NbCommandes] >= 10, "VIP", Clients[NbCommandes] >= 3, "Régulier", "Nouveau")
description: SWITCH(TRUE()) évalue chaque condition dans l'ordre et retourne le premier résultat vrai — équivalent lisible des IF imbriqués pour les plages de valeurs
-->

<!-- snippet
id: dax_mesure_100_pourcent_warning
type: warning
tech: dax
level: beginner
importance: high
format: knowledge
tags: dax, pourcentage, calculate, all
title: Mesure % qui affiche toujours 100%
content: Piège : dénominateur dans le même contexte filtré que le numérateur → les deux valeurs sont identiques → 100% partout. Conséquence : le ratio ne sert à rien. Correction : envelopper le dénominateur dans CALCULATE([CA Total], ALL(Ventes)) pour lever le filtre et obtenir le grand total.
description: Si un % affiche toujours 100%, le dénominateur est dans le même contexte filtré — ajouter ALL() dans un CALCULATE
-->

<!-- snippet
id: dax_colonne_calculee_filtre_warning
type: warning
tech: dax
level: beginner
importance: high
format: knowledge
tags: dax, colonne-calculee, filtre, contexte
title: Une colonne calculée ne répond pas aux filtres du rapport
content: Piège : créer une colonne calculée pour un KPI en pensant qu'elle changera selon les filtres. Elle ne change pas — elle est calculée une fois au chargement sans aucun contexte de rapport. Conséquence : la valeur est la même quel que soit le segment actif. Correction : créer une mesure à la place.
description: Colonne calculée = valeur fixe calculée au chargement, pas sensible aux filtres — utiliser une mesure pour tout KPI dynamique
-->

<!-- snippet
id: dax_sameperiodlastyear_prerequis
type: tip
tech: dax
level: beginner
importance: medium
format: knowledge
tags: dax, time-intelligence, calendrier, n-1
title: SAMEPERIODLASTYEAR requiert une table Calendrier marquée
content: Les fonctions d'intelligence temporelle (SAMEPERIODLASTYEAR, DATESMTD, DATESYTD...) nécessitent une table de dates marquée comme "Table de dates" dans Power BI (clic droit sur la table → Marquer comme table de dates). Sans ça, les calculs temporels donnent des résultats incorrects ou une erreur. La colonne Date de cette table doit être continue, sans trous.
description: Marquer la table Calendrier comme "table de dates" dans Power BI avant d'utiliser SAMEPERIODLASTYEAR ou toute fonction time-intelligence
-->

<!-- snippet
id: dax_table_mesures_organisation
type: tip
tech: dax
level: beginner
importance: medium
format: knowledge
tags: dax, organisation, mesures, maintenabilite
title: Regrouper toutes les mesures dans une table dédiée
content: Créer une table vide nommée "_Mesures" (via Entrer des données dans Power BI) et déplacer toutes les mesures dedans via clic droit → Déplacer vers la table. Le volet Champs reste propre, les tables de données n'ont plus que leurs colonnes réelles. Préfixer avec _ force l'affichage en haut de la liste alphabétique.
description: Une table _Mesures centralise tous les KPIs — les tables de données restent propres et le modèle est plus facile à maintenir
-->
