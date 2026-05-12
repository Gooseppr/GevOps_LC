---
layout: page
title: "Expressions Power Automate"

course: microsoft_power_platform
chapter_title: "Power Automate"

chapter: 2
section: 2

tags: power automate, expressions, formules, workflow, low-code
difficulty: beginner
duration: 75
mermaid: false

status: "published"
prev_module: "/courses/microsoft_power_platform/28_P2_01_types_de_flows.html"
prev_module_title: "Types de flows Power Automate"
next_module: "/courses/microsoft_power_platform/29_P2_02_premier_cloud_flow.html"
next_module_title: "Premier Cloud Flow"
---

# Expressions Power Automate

## Objectifs pédagogiques

À l'issue de ce module, vous serez capable de :

- Identifier dans quel contexte utiliser une expression plutôt qu'une valeur dynamique classique
- Écrire et tester une expression dans l'éditeur de formules de Power Automate
- Manipuler du texte, des dates et des nombres avec les fonctions les plus courantes
- Comprendre pourquoi une expression retourne `null` ou une erreur et savoir corriger

---

## Mise en situation

Vous avez construit votre premier flow dans le module précédent : un déclencheur, quelques actions, des valeurs dynamiques glissées depuis le panneau de contenu. Ça fonctionne — tant que les données arrivent exactement dans le bon format.

Mais dans la vraie vie, ça ne se passe pas comme ça. La date arrive en UTC et doit être affichée en heure de Paris. Le nom du fichier contient des espaces et doit être nettoyé avant d'être utilisé dans une URL. Le montant est une chaîne de caractères alors que vous avez besoin d'un nombre pour faire une comparaison.

C'est exactement là qu'interviennent les **expressions** : une couche de formules, insérée directement dans vos champs, qui transforme, formate ou calcule une valeur à la volée. Si vous avez déjà utilisé des formules Excel, vous êtes déjà à mi-chemin.

---

## Contexte — Pourquoi les expressions existent

Quand vous glissez une valeur dynamique dans un champ Power Automate (par exemple `Objet` d'un email), vous copiez la valeur brute telle qu'elle sort de l'étape précédente. C'est suffisant dans les cas simples.

Mais les connecteurs ne vous livrent pas toujours ce dont vous avez besoin. Un connecteur SharePoint vous donne `2024-11-03T09:15:00Z` — pas `03/11/2024 à 09h15`. Un connecteur Forms vous renvoie les réponses sous forme de texte, même pour des nombres. Une colonne Dataverse peut être vide alors que votre message d'email ne doit pas contenir "null".

🧠 **Les expressions comblent le fossé entre ce que les connecteurs produisent et ce que vos actions consomment.** Elles sont évaluées au moment de l'exécution du flow, juste avant que la valeur soit transmise à l'action suivante.

Techniquement, elles s'appuient sur le moteur d'expressions **Azure Logic Apps**, le même moteur qui fait tourner Power Automate sous le capot. Ce n'est pas du JavaScript, pas du Python — c'est un langage fonctionnel spécifique, proche des formules Excel dans la forme, mais avec son propre vocabulaire.

---

## Où écrire une expression

Dans l'éditeur de flow, chaque champ acceptant du contenu dynamique affiche un petit lien **"Ajouter du contenu dynamique"**. Cliquez dessus — un panneau s'ouvre avec deux onglets : **Contenu dynamique** (les valeurs issues des étapes) et **Expression**.

C'est dans l'onglet **Expression** que vous tapez vos formules. Une fois validée (bouton **OK**), l'expression s'insère dans le champ sous forme d'un jeton bleu, comme n'importe quelle valeur dynamique.

💡 Vous pouvez aussi **combiner** une expression avec du texte fixe dans un même champ. Par exemple, dans le champ "Objet" d'un email, vous pouvez écrire :

```
Rapport du @{formatDateTime(utcNow(), 'dd/MM/yyyy')}
```

La partie `@{...}` est l'expression, le reste est du texte brut. C'est la syntaxe d'interpolation de Power Automate.

---

## Syntaxe de base

Une expression Power Automate, c'est un **appel de fonction** qui retourne une valeur. La structure est toujours la même :

```
nomDeLaFonction(argument1, argument2, ...)
```

Les fonctions peuvent être imbriquées — la valeur retournée par une fonction devient l'argument d'une autre :

```
toUpper(trim('  bonjour monde  '))
```

Ici, `trim` supprime les espaces, puis `toUpper` met tout en majuscules. On lit de l'intérieur vers l'extérieur.

⚠️ **Les chaînes de texte s'écrivent avec des apostrophes simples `'...'`, pas des guillemets doubles.** C'est une source d'erreur fréquente pour ceux qui viennent d'Excel ou de JavaScript.

---

## Les catégories de fonctions essentielles

### Manipuler du texte

Les fonctions de texte sont les plus utilisées au quotidien. Voici les incontournables :

**`concat()`** — assembler plusieurs chaînes

```
concat('Bonjour ', triggerBody()?['prenom'], ' !'))
```

Renvoie : `Bonjour Marie !`

**`toUpper()` / `toLower()`** — changer la casse

```
toLower('JEAN-PAUL')
```

Renvoie : `jean-paul`

**`trim()`** — supprimer les espaces en début et fin

```
trim('  référence produit  ')
```

Renvoie : `référence produit`

**`replace()`** — substituer une sous-chaîne

```
replace('2024/11/03', '/', '-')
```

Renvoie : `2024-11-03`

**`substring(texte, debut, longueur)`** — extraire une portion

```
substring('FACT-2024-001', 5, 4)
```

Renvoie : `2024`

💡 Dans `substring`, le premier caractère est à l'index `0`, pas `1`. Encore un classique qui surprend.

**`length()`** — compter les caractères

```
length('bonjour')
```

Renvoie : `7`

---

### Travailler avec les dates

Les dates en Power Automate sont en UTC par défaut et au format ISO 8601 (`2024-11-03T09:15:00Z`). Deux fonctions sont particulièrement utiles :

**`utcNow()`** — retourne la date et l'heure actuelles en UTC

```
utcNow()
```

Renvoie : `2024-11-03T08:42:17.0000000Z`

**`formatDateTime(date, format)`** — formater une date pour l'affichage

```
formatDateTime(utcNow(), 'dd/MM/yyyy HH:mm')
```

Renvoie : `03/11/2024 08:42`

Les codes de format suivent la convention .NET : `dd` pour le jour, `MM` pour le mois, `yyyy` pour l'année sur 4 chiffres, `HH` pour les heures en format 24h.

**`addDays(date, nombre)`** — ajouter ou soustraire des jours

```
addDays(utcNow(), 7)
```

Renvoie la date dans 7 jours. Pour soustraire, utiliser un nombre négatif : `addDays(utcNow(), -30)`.

⚠️ `addDays` ne gère que des jours entiers. Pour des heures ou des minutes, il existe `addHours()` et `addMinutes()` qui fonctionnent de la même façon.

**`convertTimeZone(date, fuseauSource, fuseauCible)`** — convertir un fuseau horaire

```
convertTimeZone(utcNow(), 'UTC', 'Romance Standard Time')
```

Renvoie l'heure de Paris. Le nom des fuseaux suit la convention Windows — `'Romance Standard Time'` pour la France, `'Eastern Standard Time'` pour New York.

---

### Convertir des types

Power Automate est strict sur les types. Une chaîne `"42"` et le nombre `42` ne sont pas interchangeables.

**`int(valeur)`** — convertir en entier

```
int('42')
```

Renvoie : `42` (le vrai nombre, pas le texte)

**`float(valeur)`** — convertir en nombre décimal

```
float('3.14')
```

**`string(valeur)`** — convertir n'importe quoi en texte

```
string(outputs('Calculer_Total')?['body'])
```

**`bool(valeur)`** — convertir en booléen

```
bool('true')
```

Renvoie : `true`

---

### Fonctions mathématiques

Pour les calculs simples, Power Automate propose quelques fonctions directes :

**`add(a, b)`**, **`sub(a, b)`**, **`mul(a, b)`**, **`div(a, b)`** — les quatre opérations

```
mul(add(int(variables('quantite')), 2), float(variables('prix_unitaire')))
```

🧠 Il n'y a pas d'opérateurs arithmétiques comme `+` ou `*` dans les expressions. Tout passe par des fonctions. Si vous venez d'Excel, c'est le principal changement d'habitude.

**`mod(a, b)`** — reste de la division (modulo)

```
mod(13, 4)
```

Renvoie : `1`

**`max(a, b)`** / **`min(a, b)`** — valeur maximale/minimale entre deux nombres

```
max(int(variables('score')), 0)
```

Utile pour s'assurer qu'une valeur ne descend pas en dessous de zéro.

---

### Gérer les valeurs nulles ou vides

C'est souvent là que les flows plantent en production. Une valeur qui n'existe pas, et tout s'arrête.

**`empty(valeur)`** — vérifie si une chaîne, tableau ou objet est vide

```
empty(triggerBody()?['description'])
```

Renvoie `true` si le champ est vide ou null.

**`coalesce(val1, val2, ...)`** — retourne la première valeur non nulle

```
coalesce(triggerBody()?['telephone'], 'Non renseigné')
```

Si `telephone` est null, renvoie `'Non renseigné'`. C'est l'équivalent du `SIERREUR` d'Excel, mais pour les nulls.

**`if(condition, valeurSiVrai, valeurSiFaux)`** — expression conditionnelle inline

```
if(empty(triggerBody()?['prenom']), 'Inconnu', triggerBody()?['prenom'])
```

💡 Le `if` dans les expressions est différent du bloc **Condition** de Power Automate. Ici, c'est une expression qui retourne une valeur — elle s'utilise à l'intérieur d'un champ, pas pour brancher le flow. Conditions et branchements, c'est le module suivant.

---

## Construction progressive — Un exemple complet

Imaginez un flow déclenché quand un formulaire est soumis. Le formulaire collecte un prénom, un montant (sous forme de texte) et une date de commande. Vous devez envoyer un email récapitulatif bien formaté.

**Version 1 — Données brutes, sans expression**

Objet de l'email : `Nouvelle commande` (texte fixe)  
Corps : valeurs dynamiques collées telles quelles → résultat illisible, montant sous forme de chaîne, date en UTC.

**Version 2 — Formatage du texte et de la date**

```
// Objet de l'email
concat('Commande de ', toUpper(triggerBody()?['prenom']))

// Date formatée dans le corps
formatDateTime(triggerBody()?['date_commande'], 'dd MMMM yyyy')

// Montant formaté
concat(string(float(triggerBody()?['montant'])), ' €')
```

Résultat : `Commande de MARIE`, `03 novembre 2024`, `149.99 €`. Déjà bien plus propre.

**Version 3 — Robustesse aux données manquantes**

```
// Prénom avec valeur par défaut
coalesce(triggerBody()?['prenom'], 'Client')

// Montant avec vérification
if(
  empty(triggerBody()?['montant']),
  '0 €',
  concat(string(float(triggerBody()?['montant'])), ' €')
)
```

Maintenant le flow ne plante plus si un champ est vide. C'est ce qui différencie un flow de démonstration d'un flow de production.

---

## Erreurs fréquentes

**"InvalidTemplate: Unable to process template language expressions"**

Symptôme : le flow échoue au moment de l'exécution avec ce message.  
Cause : syntaxe incorrecte dans l'expression — guillemets doubles au lieu d'apostrophes, parenthèse manquante, ou nom de fonction mal orthographié.  
Correction : relire l'expression dans l'éditeur, vérifier que toutes les parenthèses sont fermées, et que les chaînes utilisent des apostrophes simples `'...'`.

---

**Une expression retourne `null` de façon inattendue**

Symptôme : le champ est vide dans l'email ou l'action suivante échoue sur une valeur null.  
Cause : le chemin d'accès à la propriété est incorrect. `triggerBody()?['NomDuChamp']` est sensible à la casse.  
Correction : utiliser le panneau de contenu dynamique pour insérer la propriété — Power Automate génère le bon nom automatiquement. Ne pas retaper à la main un chemin vu dans l'historique d'exécution.

---

**`formatDateTime` affiche la mauvaise heure**

Symptôme : la date s'affiche en UTC alors que vous attendez l'heure locale.  
Cause : `formatDateTime` ne convertit pas les fuseaux horaires — il formate seulement.  
Correction : d'abord `convertTimeZone`, ensuite `formatDateTime` :

```
formatDateTime(
  convertTimeZone(utcNow(), 'UTC', 'Romance Standard Time'),
  'dd/MM/yyyy HH:mm'
)
```

---

**Erreur de type : "Expected Integer, got String"**

Symptôme : une action arithmétique ou une comparaison échoue.  
Cause : vous utilisez une valeur textuelle là où Power Automate attend un nombre.  
Correction : encapsuler la valeur dans `int()` ou `float()` avant de l'utiliser dans le calcul.

---

## Bonnes pratiques

**Tester une expression avant de l'intégrer** — l'éditeur d'expression n'a pas de mode aperçu, mais vous pouvez créer une action **Composer** (Compose) avec juste l'expression dedans, exécuter le flow manuellement, et lire le résultat dans l'historique. C'est le bac à sable le plus rapide disponible.

**Ne pas imbriquer plus de 3 niveaux** — au-delà, l'expression devient illisible et difficile à déboguer. Si vous atteignez 4 ou 5 niveaux d'imbrication, découpez en plusieurs actions **Composer** intermédiaires et donnez-leur des noms explicites.

**Préférer `coalesce` aux vérifications manuelles de null** — c'est plus court, plus lisible, et ça gère à la fois `null` et la chaîne vide.

**Utiliser `triggerBody()?['champ']` avec le `?`** — le `?` est l'opérateur null-safe. Sans lui, accéder à une propriété inexistante plante l'expression. Avec lui, vous obtenez `null` au lieu d'une erreur. Toujours l'utiliser pour accéder aux propriétés d'objets dynamiques.

---

## Résumé

| Concept | Ce qu'il fait | À retenir |
|---------|--------------|-----------|
| `concat()` | Assemble des chaînes | Accepte autant d'arguments que nécessaire |
| `formatDateTime()` | Formate une date en texte lisible | Ne convertit pas les fuseaux — utiliser `convertTimeZone` avant |
| `utcNow()` | Retourne l'instant présent en UTC | Sans argument, toujours en UTC |
| `coalesce()` | Retourne la première valeur non nulle | Meilleur réflexe pour les champs optionnels |
| `int()` / `float()` | Convertit du texte en nombre | Indispensable avant toute opération arithmétique |
| `if()` (expression) | Valeur conditionnelle inline | N'est pas un branchement de flow — juste une valeur |
| Opérateur `?` | Accès null-safe à une propriété | `body()?['champ']` plutôt que `body()['champ']` |

Les expressions Power Automate ne sont pas un langage à apprendre de zéro — c'est un vocabulaire de fonctions à connaître au bon moment. La vraie compétence, c'est de reconnaître quand une valeur dynamique brute ne suffit plus, et de savoir quelle fonction résout le problème en une ligne.

---

<!-- snippet
id: pa_expr_concat_usage
type: command
tech: power automate
level: beginner
importance: high
format: knowledge
tags: expressions, texte, concat, power automate
title: Assembler des valeurs dans un champ avec concat()
context: Onglet Expression dans le panneau de contenu dynamique
command: concat('<TEXTE_FIXE>', triggerBody()?['<CHAMP>'])
example: concat('Bonjour ', triggerBody()?['prenom'], ' — votre commande est confirmée.')
description: concat() assemble texte fixe et valeurs dynamiques en une seule chaîne. Apostrophes simples obligatoires pour les chaînes littérales.
-->

<!-- snippet
id: pa_expr_apostrophes_strings
type: warning
tech: power automate
level: beginner
importance: high
format: knowledge
tags: expressions, syntaxe, chaines, erreur
title: Les chaînes s'écrivent avec des apostrophes simples
content: Piège → écrire "bonjour" avec des guillemets doubles. Conséquence → erreur "InvalidTemplate" à l'exécution. Correction → toujours utiliser 'bonjour' avec des apostrophes simples dans les expressions Power Automate.
description: Contrairement à JavaScript ou Python, les expressions PA utilisent uniquement des apostrophes simples pour les chaînes littérales.
-->

<!-- snippet
id: pa_expr_formatdatetime_timezone
type: warning
tech: power automate
level: beginner
importance: high
format: knowledge
tags: expressions, dates, fuseaux horaires, formatdatetime
title: formatDateTime ne convertit pas les fuseaux horaires
content: Piège → utiliser formatDateTime(utcNow(), 'dd/MM/yyyy HH:mm') en attendant l'heure locale. Conséquence → heure affichée en UTC, décalage de 1 à 2h pour la France. Correction → convertir d'abord : formatDateTime(convertTimeZone(utcNow(), 'UTC', 'Romance Standard Time'), 'dd/MM/yyyy HH:mm').
description: formatDateTime formate seulement — il ne déplace pas la date dans un autre fuseau. Toujours appeler convertTimeZone avant.
-->

<!-- snippet
id: pa_expr_coalesce_null
type: tip
tech: power automate
level: beginner
importance: high
format: knowledge
tags: expressions, null, coalesce, robustesse
title: Utiliser coalesce() pour les champs optionnels
context: Champ susceptible d'être null ou vide dans un déclencheur ou une action
command: coalesce(triggerBody()?['<CHAMP>'], '<VALEUR_PAR_DEFAUT>')
example: coalesce(triggerBody()?['telephone'], 'Non renseigné')
description: Retourne la première valeur non nulle dans la liste. Plus court et plus fiable qu'un if(empty(...)) pour gérer les champs optionnels.
-->

<!-- snippet
id: pa_expr_null_safe_operator
type: concept
tech: power automate
level: beginner
importance: high
format: knowledge
tags: expressions, null, operateur, proprietes
title: L'opérateur ? pour accéder aux propriétés sans risque
content: body()?['champ'] utilise l'opérateur null-safe : si l'objet parent est null ou si la propriété n'existe pas, l'expression retourne null au lieu de planter. Sans le ?, une propriété manquante génère une erreur InvalidTemplate à l'exécution. Toujours utiliser ?[] pour accéder aux propriétés d'objets dynamiques.
description: Le ? protège contre les erreurs d'accès à propriété inexistante — null plutôt qu'une exception.
-->

<!-- snippet
id: pa_expr_int_float_conversion
type: tip
tech: power automate
level: beginner
importance: high
format: knowledge
tags: expressions, types, conversion, nombre
title: Convertir en nombre avant toute opération arithmétique
context: Valeur provenant d'un formulaire, d'une colonne texte ou d'un connecteur externe
command: int('<VALEUR_TEXTE>')
example: mul(int(triggerBody()?['quantite']), float(triggerBody()?['prix']))
description: Les connecteurs renvoient souvent les nombres comme des chaînes. int() et float() sont indispensables avant add(), mul(), div() — sinon erreur de type à l'exécution.
-->

<!-- snippet
id: pa_expr_compose_debug
type: tip
tech: power automate
level: beginner
importance: medium
format: knowledge
tags: expressions, debug, test, compose
title: Tester une expression avec une action Composer
content: Ajouter une action "Composer" (Compose) dans le flow, y coller l'expression à tester, exécuter le flow manuellement, puis lire la valeur de sortie dans l'historique d'exécution. C'est le seul moyen de voir le résultat réel d'une expression sans déclencher toute la logique du flow. Supprimer l'action une fois le test terminé.
description: L'action Composer sert de bac à sable pour valider une expression avant de l'intégrer dans une vraie action.
-->

<!-- snippet
id: pa_expr_if_inline
type: concept
tech: power automate
level: beginner
importance: medium
format: knowledge
tags: expressions, condition, if, valeur
title: if() dans les expressions retourne une valeur, pas un branchement
content: if(condition, valeurSiVrai, valeurSiFaux) est une expression qui produit une valeur à insérer dans un champ. Elle ne branche pas le flow. Exemple : if(empty(triggerBody()?['prenom']), 'Client', triggerBody()?['prenom']). Pour des branchements de flow (deux chemins d'exécution), c'est le bloc Condition qui s'utilise — pas cette fonction.
description: if() en expression = valeur conditionnelle dans un champ. Le bloc Condition = branchement du flow. Ce ne sont pas les mêmes outils.
-->

<!-- snippet
id: pa_expr_adddays_negative
type: tip
tech: power automate
level: beginner
importance: medium
format: knowledge
tags: expressions, dates, adddays, calcul
title: Soustraire des jours avec addDays() et une valeur négative
command: addDays(utcNow(), <NOMBRE_JOURS>)
example: addDays(utcNow(), -30)
description: addDays accepte des entiers négatifs pour reculer dans le temps. Pas de fonction subtractDays — la soustraction passe toujours par addDays avec un nombre négatif.
-->

<!-- snippet
id: pa_expr_imbrication_limit
type: tip
tech: power automate
level: beginner
importance: medium
format: knowledge
tags: expressions, lisibilite, compose, refactoring
title: Limiter l'imbrication à 3 niveaux dans une expression
content: Au-delà de 3 fonctions imbriquées, l'expression devient très difficile à déboguer. Solution : couper en plusieurs actions Composer nommées explicitement (ex. "Formater date locale", "Construire objet email"). Chaque action Composer expose son résultat comme une valeur dynamique réutilisable dans les actions suivantes.
description: Dépasser 3 niveaux d'imbrication = expression illisible. Découper en actions Composer intermédiaires avec des noms métier clairs.
-->
