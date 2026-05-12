---
layout: page
title: "Conditions, boucles et variables — Pièges et comportements inattendus"

course: microsoft_power_platform
chapter_title: "Power Automate"

chapter: 2
section: 5

tags: power automate, conditions, boucles, variables, diagnostic, erreurs frequentes
difficulty: beginner
duration: 55
mermaid: false

status: "published"
prev_module: "/courses/microsoft_power_platform/32_P2_05_securite_propriete_flows.html"
prev_module_title: "Sécurité et propriété des flows"
next_module: "/courses/microsoft_power_platform/37_P2_10_desktop_flows_rpa.html"
next_module_title: "Desktop Flows et RPA"
---

# Conditions, boucles et variables — Pièges et comportements inattendus

## Objectifs pédagogiques

À l'issue de ce module, vous serez capable de :

1. **Identifier** pourquoi une condition ne se déclenche pas comme prévu et corriger le type comparé
2. **Comprendre** le comportement des variables dans les boucles et éviter les erreurs d'ordre et de portée
3. **Reconnaître** les pièges courants liés aux types de données dans les tests conditionnels
4. **Diagnostiquer** un flow qui tourne en boucle ou qui s'arrête prématurément via l'historique d'exécution
5. **Appliquer** une méthode de débogage systématique pour isoler rapidement la source d'un comportement inattendu

---

## Mise en situation

Vous construisez un flow pour automatiser le traitement des demandes de congés. La logique est simple : si le manager approuve, notifier les RH ; sinon, envoyer un refus à l'employé. Vous avez aussi une boucle qui parcourt les congés en attente et incrémente un compteur.

Le problème ? Rien ne fonctionne comme prévu. La branche "Approuvé" se déclenche même quand le manager a répondu "Non". Le compteur affiche toujours 0 à la fin. Et le flow s'arrête parfois à mi-chemin sans raison apparente.

Ce module explique ce qui se passe dans ces situations — et comment les résoudre.

---

## Contexte

Les conditions, boucles et variables semblent simples sur le papier. En pratique, ils concentrent une grande partie des bugs Power Automate pour une raison précise : leur comportement dépend fortement **du type de donnée reçu**, pas seulement de la valeur.

Un texte `"true"` n'est pas un booléen `true`. Un tableau vide n'est pas `null`. Une variable initialisée dans le mauvais ordre peut valoir `null` au moment où vous croyez l'utiliser. Ces nuances sont invisibles dans l'éditeur, mais catastrophiques à l'exécution.

La bonne nouvelle : l'historique d'exécution de Power Automate expose exactement ce que le flow reçoit à chaque étape. C'est votre outil principal — et ce module vous apprend à l'utiliser avant de toucher quoi que ce soit.

---

## Les conditions : quand votre "si" ne dit pas ce que vous pensez

### Le problème du type masqué

La cause numéro un des conditions qui "ne marchent pas" : **comparer deux valeurs de types différents sans le savoir**.

Power Automate reçoit des données depuis des connecteurs (SharePoint, formulaires, e-mails…). Ces données arrivent souvent sous forme de **chaîne de texte**, même quand elles représentent un booléen ou un nombre. Un champ SharePoint de type "Oui/Non" peut renvoyer la chaîne `"Yes"` plutôt que le booléen `true`. Si votre condition teste `is equal to true`, elle échoue systématiquement — même quand l'utilisateur a bien coché "Oui".

```
Champ SharePoint "Approuvé" → valeur reçue : "Yes" (texte)
Condition : Approuvé is equal to true (booléen)
Résultat : false — même si l'utilisateur a coché "Oui"
```

**Réflexe à adopter** : avant d'écrire une condition, vérifiez ce que la valeur contient réellement. Ouvrez l'historique d'exécution (page du flow → **Historique des exécutions** → cliquer sur l'exécution → inspecter les sorties de chaque action) et lisez la valeur brute.

### Corriger le type dans la condition

Deux approches selon ce que vous avez :

**Option A — Comparer en texte directement**

```
Condition : Approuvé is equal to "Yes"
```

Simple et efficace. Attention : les comparaisons texte sont sensibles à la casse dans certains contextes. `"yes"` ≠ `"Yes"`.

**Option B — Convertir avec une expression**

```
Expression dans la condition :
equals(triggerBody()?['Approuve'], true)
```

Si vous n'êtes pas encore à l'aise avec les expressions Power Automate (couvertes dans P2-T3), retenez simplement que vous pouvez transformer le type d'une valeur avant de la tester — c'est souvent la solution quand la comparaison directe échoue.

### La condition "vide" qui trompe tout le monde

Tester si un champ est vide réserve aussi des surprises. Il faut distinguer trois cas :

- `null` — le champ n'existe pas ou n'a jamais été rempli
- `""` — le champ existe mais est vide
- `" "` — le champ contient un espace, donc il n'est **pas** vide pour Power Automate

```
Condition : Commentaire is equal to ""   → passe si le champ est vide
Condition : Commentaire is equal to null → passe si le champ n'existe pas
```

L'expression `empty(variables('MonChamp'))` couvre les deux premiers cas en un seul test — elle retourne `true` si la valeur est `null` ou `""`. C'est systématiquement plus fiable qu'une comparaison directe à chaîne vide.

---

## Les variables : portée, initialisation et ordre

### Toujours initialiser avant d'utiliser

Une variable Power Automate doit être créée avec l'action **"Initialiser la variable"** avant d'être utilisée où que ce soit dans le flow — dans les branches d'une condition, à l'intérieur d'une boucle, partout. C'est différent des langages de programmation classiques où on peut déclarer une variable n'importe où. Dans Power Automate, **l'ordre physique des actions compte** : si l'initialisation apparaît après une boucle, la variable n'est pas disponible dans cette boucle.

```
❌ Structure incorrecte :
1. Apply to each (boucle)
   └── Set variable "Compteur" = Compteur + 1   ← Compteur n'existe pas encore
2. Initialize variable "Compteur" (type Integer, valeur 0)

✅ Structure correcte :
1. Initialize variable "Compteur" (type Integer, valeur 0)
2. Apply to each (boucle)
   └── Set variable "Compteur" = Compteur + 1
```

Règle pratique : regroupez toutes vos initialisations en tout début de flow, avant toute condition ou boucle, avec des valeurs par défaut cohérentes (`0` pour un entier, `""` pour un texte, `[]` pour un tableau).

### L'erreur du "Définir la variable" dans la mauvaise branche

Scénario courant : vous définissez une variable dans chacune des deux branches d'une condition (Si oui / Si non), puis vous l'utilisez après la condition. Le problème n'est pas l'utilisation après la condition — c'est si vous avez **oublié de l'initialiser avant**. Si le flow prend la branche "Non" sans action "Définir la variable", la variable garde sa valeur initiale (ou est vide si elle n'a jamais été initialisée). Résultat : comportement imprévisible selon le chemin emprunté.

### Le type de la variable est verrouillé

Une fois qu'une variable est initialisée avec un type (Integer, String, Boolean, Array, Object, Float), lui assigner une valeur d'un type différent lève une erreur. Power Automate refuse l'action ou la marque en rouge.

```
Initialize variable "MonTexte" → type: String, valeur: "Bonjour"
Set variable "MonTexte" → valeur: 42
→ Erreur : "The variable type 'String' does not match the type 'Integer'"
```

Correction : convertir la valeur avec `string(42)`, `int("42")` ou `float("3.14")` selon le cas — ou changer le type déclaré à l'initialisation si c'est votre intention.

---

## Les boucles : les pièges qui font perdre du temps

### "Apply to each" et la variable qui ne s'incrémente pas

Scénario très courant : un compteur que vous incrémentez dans une boucle `Apply to each` affiche toujours 0 à la fin. Avant de chercher un bug dans la logique d'incrémentation, vérifiez une chose : **combien d'itérations la boucle a-t-elle réellement exécutées ?**

Dans l'historique d'exécution, cliquer sur `Apply to each` affiche le nombre d'itérations. Si c'est 0, le tableau passé à la boucle est vide — le bug est dans l'action qui produit ce tableau (filtre trop restrictif, requête sans résultat), pas dans la variable.

```
Apply to each — 0 itérations → le tableau source est vide
→ Vérifier l'action qui produit le tableau (ex. requête SharePoint avec filtre trop restrictif)
```

### La boucle "Do until" qui ne s'arrête jamais

La boucle `Do until` tourne jusqu'à ce qu'une condition soit vraie. Elle peut ne jamais s'arrêter pour deux raisons :

1. **La variable de contrôle n'est jamais mise à jour à l'intérieur de la boucle**
2. **La condition de sortie compare des types incompatibles** — retour au problème des types vu plus haut

Power Automate impose une limite par défaut de **60 itérations** et **1 heure**. Si votre boucle les dépasse, elle s'arrête avec l'erreur `ActionBranchingConditionNotSatisfied`. Ce n'est pas un bug — c'est une protection. Mais si vous voyez cette erreur, c'est le signal que votre condition de sortie ne fonctionne pas.

Bonne pratique : configurez toujours manuellement la limite de la boucle `Do until` (paramètre **Limite** dans les options de l'action) à une valeur cohérente avec votre cas métier. Ne laissez pas la valeur par défaut si vous ne la connaissez pas.

### Modifier une variable de tableau dans une boucle

Pour accumuler des valeurs à chaque itération, utilisez l'action **"Ajouter à la variable tableau"** (`Append to array variable`), pas "Définir la variable". Avec "Définir la variable", chaque itération écrase la valeur précédente si l'expression n'est pas parfaitement formulée.

```
✅ Pour accumuler dans une boucle :
→ Action : "Ajouter à la variable tableau" — un élément à la fois

❌ À éviter :
→ "Définir la variable" MonTableau = union(variables('MonTableau'), [nouvelElement])
→ Fonctionnel en théorie, mais fragile et difficile à déboguer
```

---

## Diagnostiquer un flow en échec : méthode pas à pas

Quand un flow se comporte mal, l'erreur est presque toujours visible dans l'historique d'exécution. Voici comment l'isoler en quatre étapes — sans passer 30 minutes à relire l'éditeur en espérant trouver le bug à l'œil.

**Étape 1 — Ouvrir l'historique d'exécution**

Page du flow → section **Historique des 28 derniers jours** → cliquer sur l'exécution en échec ou au comportement suspect.

**Étape 2 — Identifier l'action rouge ou orange**

Les actions en **rouge** sont des erreurs franches. Les actions en **orange** sont des avertissements (skip, timeout). Cliquer sur l'action problématique révèle ses entrées et sorties réelles.

**Étape 3 — Lire les valeurs brutes, pas les noms de champs**

Ce que vous voyez dans l'éditeur, ce sont des **références** (`triggerBody()?['Approuve']`). Ce que vous voyez dans l'historique, c'est la **valeur réelle** au moment de l'exécution. L'écart entre les deux est souvent la source du bug.

**Étape 4 — Tester avec des valeurs en dur**

Si vous doutez d'une condition, remplacez temporairement la valeur dynamique par une valeur fixe pour isoler le problème :

```
Condition normale : Statut is equal to triggerBody()?['Statut']
Condition de test : Statut is equal to "Approuvé"
```

Si ça fonctionne avec la valeur en dur, le problème vient de la valeur dynamique — type, casse, espace invisible, encodage inattendu.

Astuce complémentaire : ajoutez une action **"Composer" (Compose)** juste avant une condition douteuse, avec la valeur dynamique en entrée. La sortie dans l'historique affichera exactement ce que la condition va recevoir — type inclus — sans modifier la condition elle-même.

---

## Bonnes pratiques

**Nommer les variables explicitement.** `Var1` ne dit rien. `CompteurCongesTraites`, `StatutDernierElement`, `ListeEmailsEnvoyes` sont lisibles six mois plus tard.

**Initialiser toutes les variables en bloc au début du flow.** Avant toute condition ou boucle, regroupez toutes les initialisations dans l'ordre logique. Cela évite les erreurs d'ordre et rend le flow lisible d'un coup d'œil.

**Inspecter la valeur brute avant d'écrire une condition.** Déclenchez le flow une fois, lisez l'historique, vérifiez la valeur réelle — puis écrivez la condition. Deux minutes évitent vingt minutes de débogage.

**Ne pas imbriquer les boucles si possible.** Un `Apply to each` dans un autre `Apply to each` est légal, mais difficile à déboguer. Si vous pouvez reformuler la logique avec un filtre sur les données d'entrée, faites-le.

**Configurer la limite de `Do until` explicitement.** Ne laissez pas le comportement par défaut gérer les cas limites à votre place.

---

<!-- snippet
id: pa_condition_type_mismatch
type: warning
tech: power automate
level: beginner
importance: high
format: knowledge
tags: condition, type, booleen, texte, diagnostic
title: Condition qui échoue à cause d'un type inattendu
content: Un champ SharePoint "Oui/Non" renvoie souvent le texte "Yes" au lieu du booléen true. Comparer à `true` échoue systématiquement — la branche "Si non" s'exécute même quand l'utilisateur a coché "Oui". Correction : comparer à la valeur texte exacte ("Yes") ou convertir avec une expression.
description: Vérifier le type réel dans l'historique avant d'écrire une condition — "Yes" (texte) et true (booléen) sont visuellement proches mais jamais égaux.
-->

<!-- snippet
id: pa_variable_init_order
type: warning
tech: power automate
level: beginner
importance: high
format: knowledge
tags: variable, initialisation, boucle, ordre, diagnostic
title: Variable null dans une boucle — problème d'ordre d'initialisation
content: L'ordre physique des actions dans un flow détermine la disponibilité des variables. Si "Initialiser la variable" est placé après une boucle ou une condition qui l'utilise, la variable sera null ou absente à l'exécution. Regrouper toutes les initialisations en tout début de flow, avant toute boucle ou condition.
description: L'initialisation doit précéder physiquement toute utilisation — placer toutes les initialisations de variables en début de flow.
-->

<!-- snippet
id: pa_variable_type_locked
type: error
tech: power automate
level: beginner
importance: high
format: knowledge
tags: variable, type, erreur, integer, string
title: Assigner une valeur d'un type incompatible à une variable
content: Le type d'une variable est verrouillé à l'initialisation. Tenter d'assigner une valeur d'un type différent produit l'erreur "The variable type 'String' does not match the type 'Integer'". Correction : convertir la valeur avec `string()`, `int()` ou `float()` avant l'assignation, ou changer le type déclaré à l'initialisation.
description: Le type est verrouillé dès l'initialisation — utiliser string(), int() ou float() pour convertir avant d'assigner.
-->

<!-- snippet
id: pa_diagnostic_workflow
type: tip
tech: power automate
level: beginner
importance: high
format: knowledge
tags: debug, diagnostic, historique, méthode, erreur
title: Méthode de diagnostic pas à pas — 4 étapes
content: Étape 1 : ouvrir l'historique d'exécution (page du flow → Historique des 28 derniers jours → cliquer sur l'exécution). Étape 2 : identifier l'action rouge (erreur) ou orange (skip/timeout). Étape 3 : lire les valeurs brutes dans les sorties — ce sont les vraies valeurs au moment de l'exécution, pas les références de l'éditeur. Étape 4 : remplacer temporairement la valeur dynamique par une valeur en dur pour isoler si le bug vient de la logique ou des données.
description: Historique → action rouge → valeurs brutes → test en dur : quatre étapes pour isoler n'importe quel bug de condition, variable ou boucle.
-->

<!-- snippet
id: pa_compose_debug
type: tip
tech: power automate
level: beginner
importance: high
format: knowledge
tags: debug, diagnostic, historique, compose, valeur
title: Inspecter une valeur dynamique avant une condition avec Compose
content: Ajouter une action "Composer" (Compose) juste avant une condition douteuse, avec la valeur dynamique en entrée. Dans l'historique d'exécution, la sortie de Compose affiche la valeur réelle avec son type exact — sans modifier la condition. Retirer l'action Compose une fois le diagnostic terminé.
description: Compose utilisé comme point d'inspection révèle le type et la valeur exacte d'une donnée dynamique avant qu'elle entre dans une condition.
-->

<!-- snippet
id: pa_loop_zero_iterations
type: warning
tech: power automate
level: beginner
importance: high
format: knowledge
tags: boucle, apply to each, tableau, diagnostic, historique
title: Boucle Apply to each à 0 itération — le bug est dans les données
content: Si une variable ne s'incrémente pas ou qu'un tableau reste vide après une boucle, ouvrir l'historique et cliquer sur Apply to each pour vérifier le nombre d'itérations. Si c'est 0, le tableau source est vide — le bug est dans l'action qui produit ce tableau (filtre trop restrictif, requête sans résultat), pas dans la logique de la boucle.
description: 0 itération = tableau source vide. Chercher le bug dans l'action qui produit les données, pas dans la boucle elle-même.
-->

<!-- snippet
id: pa_do_until_timeout
type: error
tech: power automate
level: beginner
importance: medium
format: knowledge
tags: do until, boucle, limite, timeout, diagnostic
title: Do until — ActionBranchingConditionNotSatisfied après 60 itérations
content: L'erreur ActionBranchingConditionNotSatisfied après exactement 60 itérations signifie que la condition de sortie n'est jamais devenue vraie. Causes fréquentes : la variable de contrôle n'est pas mise à jour dans la boucle, ou un problème de type empêche la comparaison de réussir. Inspecter la variable dans l'historique itération par itération, puis configurer la limite manuellement dans les paramètres de l'action.
description: 60 itérations atteintes = condition de sortie défaillante — vérifier la mise à jour de la variable de contrôle et le type comparé.
-->

<!-- snippet
id: pa_array_append_vs_set
type: tip
tech: power automate
level: beginner
importance: medium
format: knowledge
tags: tableau, variable, boucle, append, accumulation
title: Accumuler des valeurs dans une boucle — Append, pas Set
content: Pour ajouter des éléments à un tableau à chaque itération, utiliser "Ajouter à la variable tableau" (Append to array variable) plutôt que "Définir la variable". Avec Set variable, chaque itération écrase la valeur précédente si l'expression union() n'est pas parfaitement formulée. Append est atomique et ne présente pas ce risque.
description: Dans une boucle, Append to array variable accumule sans risque d'écrasement — Set variable avec union() est fragile si mal formulé.
-->

<!-- snippet
id: pa_empty_function
type: tip
tech: power automate
level: beginner
importance: medium
format: knowledge
tags: condition, vide, null, chaine, expression
title: Tester si un champ est vide — utiliser empty() plutôt que is equal to ""
content: Dans Power Automate, null (champ absent) et "" (champ vide) sont deux choses distinctes. L'expression empty(variables('MonChamp')) retourne true dans les deux cas. Un champ contenant un espace " " n'est pas vide — empty() retournera false, ce qui est le comportement attendu. Plus fiable qu'une comparaison directe à chaîne vide qui ne détecte pas null.
description: empty() couvre null et "" en un seul test — préférer à "is equal to empty string" qui ne détecte pas les valeurs nulles.
-->
