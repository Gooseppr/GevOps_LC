---
layout: page
title: "Gestion d'erreur, retry et scopes dans Power Automate"

course: microsoft_power_platform
chapter_title: "Power Automate — Automatisation et intégration"

chapter: 2
section: 4

tags: power automate, gestion d'erreur, retry, scope, run after, exception handling
difficulty: intermediate
duration: 75
mermaid: false

status: "published"
prev_module: "/courses/microsoft_power_platform/33_P2_06_dataverse_flows_solution.html"
prev_module_title: "Dataverse et flows de solution"
next_module: "/courses/microsoft_power_platform/34_P2_07_http_api_custom_connector.html"
next_module_title: "HTTP, API REST et custom connector"
---

# Gestion d'erreur, retry et scopes dans Power Automate

## Objectifs pédagogiques

À l'issue de ce module, vous serez capable de :

1. **Configurer** le comportement Run After d'une action pour intercepter les échecs, timeouts et états annulés
2. **Structurer** un flow avec des scopes pour isoler les blocs logiques et centraliser la gestion d'erreur
3. **Paramétrer** les politiques de retry sur une action pour absorber les pannes transitoires
4. **Diagnostiquer** les causes réelles d'un échec à partir des logs d'exécution Power Automate
5. **Construire** un pattern de compensation — l'équivalent d'un try/catch dans un flow professionnel

---

## Mise en situation

Votre équipe a déployé un flow de traitement de commandes : il appelle une API externe, crée un enregistrement Dataverse, puis envoie une notification Teams. Ça tourne depuis trois semaines, et ce matin, quelqu'un vous signale que 12 commandes n'ont pas été créées — sans aucune alerte. Le flow a silencieusement échoué à l'étape API, ignoré les erreurs, et les étapes suivantes ont quand même essayé de s'exécuter dans un état incohérent.

Ce scénario est la norme, pas l'exception. Un flow sans gestion d'erreur explicite est un flow qui échoue en silence — et c'est exactement ce que ce module va résoudre.

---

## Pourquoi les flows échouent (et comment le savoir)

Avant de corriger, il faut comprendre. Power Automate donne à chaque action l'un de ces quatre états à l'issue de son exécution :

| État | Ce que ça signifie |
|------|-------------------|
| **Succeeded** | L'action s'est terminée sans erreur |
| **Failed** | L'action a retourné une erreur (HTTP 4xx/5xx, connecteur indisponible, expression invalide…) |
| **Skipped** | L'action n'a pas été exécutée parce que la condition Run After n'était pas remplie |
| **TimedOut** | L'action a dépassé son délai d'exécution autorisé |

🧠 **Concept clé** — Par défaut, chaque action d'un flow a son Run After configuré sur `Succeeded` uniquement. Cela signifie que si une action échoue, toutes les actions suivantes passent en état `Skipped` — elles ne s'exécutent pas, sans lever d'alerte visible. Le flow se termine en rouge, mais aucun mécanisme de compensation n'a joué.

### Lire les logs d'exécution

Dans Power Automate, ouvrez l'historique d'exécution d'un flow (onglet **Exécutions du flux de 28 derniers jours**). Cliquez sur une exécution échouée. Chaque action affiche :

- Son état (icône verte / rouge / grise)
- Le contenu des **entrées** et **sorties** — c'est là que vous voyez le body de la réponse HTTP, le message d'erreur exact, le code status
- La durée d'exécution

💡 L'erreur réelle est presque toujours dans les **sorties** de l'action échouée, pas dans le message générique affiché en haut du résumé. Cherchez le champ `body` ou `error.message` dans le JSON de sortie.

---

## Run After — Reprendre le contrôle sur l'enchaînement

Le Run After est la configuration qui dit à une action : "dans quel(s) état(s) l'action précédente doit-elle se trouver pour que tu t'exécutes ?"

Pour y accéder : dans le flow designer, cliquez sur les **… (trois points)** d'une action → **Configurer le run after**.

Vous obtenez quatre cases à cocher :

```
☑ Opération réussie
☐ A échoué
☐ Est ignorée
☐ A expiré
```

🧠 **Concept clé** — Run After n'est pas une propriété d'une *paire* d'actions mais d'une action par rapport à *toutes* ses branches entrantes. Si vous branchez une action sur plusieurs prédécesseurs, Run After s'applique à chacun indépendamment.

### Pattern : notification d'échec

Imaginons une action **Créer un enregistrement** qui peut échouer. Vous voulez envoyer un email d'alerte si ça arrive :

1. Ajoutez une action **Envoyer un email** après l'action qui peut échouer
2. Configurez son Run After : cochez **A échoué** et **A expiré** — décochez **Opération réussie**
3. Dans le body de l'email, injectez `@{actions('Créer_un_enregistrement').error.message}`

⚠️ **Erreur classique** — Si vous cochez à la fois "Opération réussie" et "A échoué", l'action de notification s'exécutera *dans tous les cas*, ce qui n'est généralement pas ce que vous voulez. Soyez explicite : une branche pour le succès, une pour l'échec.

### Run After avec des branches parallèles

Quand deux branches convergent vers une même action, Run After devient plus subtil. L'action de convergence s'exécute si **l'une ou l'autre** de ses branches précédentes remplit la condition. Ce n'est pas un "ET" logique, c'est un "OU". Gardez ça en tête lors de la conception d'un flow avec plusieurs chemins parallèles.

---

## Retry — Absorber les pannes transitoires

Certaines erreurs ne sont pas des bugs : c'est un service externe momentanément surchargé, un rate limit temporaire, une connexion réseau instable. Pour ce type de pannes *transitoires*, réessayer quelques secondes plus tard suffit souvent à résoudre le problème.

Power Automate propose une politique de retry configurable sur chaque action.

Pour y accéder : **… → Paramètres** sur l'action concernée → section **Stratégie de nouvelles tentatives**.

Quatre modes sont disponibles :

| Mode | Comportement |
|------|-------------|
| **Aucun** | Pas de retry — l'action échoue immédiatement si la première tentative rate |
| **Intervalle fixe** | Réessaie N fois avec un délai fixe entre chaque tentative |
| **Intervalle exponentiel** | Réessaie N fois avec un délai qui double à chaque tentative (recommandé pour les API) |
| **Par défaut** | Comportement hérité du connecteur — généralement 4 tentatives avec backoff exponentiel |

💡 **Astuce** — Le mode **Par défaut** est suffisant pour la grande majorité des connecteurs Microsoft (SharePoint, Dataverse, Teams). Passez sur **Intervalle exponentiel** personnalisé uniquement quand vous appelez des APIs tierces avec des contraintes de rate limiting connues, ou quand le délai par défaut est trop court / trop long pour votre cas.

Les paramètres clés du retry personnalisé :

```
Nombre de tentatives : 4      (max: 90)
Intervalle           : PT20S  (format ISO 8601 — PT20S = 20 secondes)
```

⚠️ **Piège** — Le retry ne s'active que sur les erreurs HTTP **5xx** (erreurs serveur) et les timeouts. Une erreur **4xx** (ex : 404 Not Found, 400 Bad Request) ne déclenche pas de retry car elle indique un problème côté client — réessayer ne changera rien. Si vous attendez un retry sur un 400, il ne viendra pas.

---

## Scopes — Structurer pour mieux gérer

Un **Scope** est un conteneur d'actions dans Power Automate. Visuellement, c'est une boîte dans laquelle vous regroupez plusieurs actions liées. Fonctionnellement, un scope expose son propre état (Succeeded / Failed / Skipped / TimedOut) en fonction de l'état des actions qu'il contient.

🧠 **Concept clé** — Si *une seule* action à l'intérieur d'un scope échoue, le scope entier passe en état `Failed`. C'est ce qui permet de brancher une logique de compensation sur l'état d'un bloc entier plutôt que sur chaque action individuellement.

Pensez au scope comme à un `try` en programmation : vous y mettez le code principal, et vous branchez votre `catch` sur l'état `Failed` du scope.

### Construire un pattern try/catch avec des scopes

**Étape 1 — Créer le scope principal**

Ajoutez un scope (cherchez "Scope" dans les actions Control) et nommez-le `TRY — Traitement commande`. Mettez-y toutes les actions de votre logique métier :

```
[Scope : TRY — Traitement commande]
  → Appel API externe
  → Créer enregistrement Dataverse
  → Envoyer notification Teams
```

**Étape 2 — Créer le scope de compensation**

Ajoutez un second scope après le premier, nommez-le `CATCH — Gestion erreur`. Configurez son **Run After** : cochez uniquement **A échoué** et **A expiré** — décochez **Opération réussie**.

```
[Scope : CATCH — Gestion erreur]
  Run After: Failed, TimedOut
  → Envoyer email d'alerte à l'équipe
  → Logger l'erreur dans une liste SharePoint
  → (optionnel) Créer un ticket incident
```

**Étape 3 — Optionnel : scope de finalisation**

Si vous avez des actions à exécuter dans tous les cas (équivalent d'un `finally`), ajoutez un troisième scope après les deux premiers. Configurez son Run After pour cocher *tous* les états — Succeeded, Failed, Skipped, TimedOut.

```
[Scope : FINALLY — Nettoyage]
  Run After: Succeeded, Failed, Skipped, TimedOut
  → Mettre à jour le statut du traitement
  → Libérer un verrou si nécessaire
```

### Récupérer l'erreur dans le scope CATCH

Dans le scope CATCH, vous pouvez accéder aux détails de l'échec avec l'expression suivante :

```
result('NOM_DU_SCOPE_TRY')
```

Cette expression retourne un tableau JSON de toutes les actions du scope avec leur état et leurs sorties. Pour extraire le premier échec :

```
@{body('NOM_DE_LACTION_ECHOUEE')?['error']?['message']}
```

💡 Si vous ne connaissez pas à l'avance quelle action a échoué dans le scope, vous pouvez filtrer le tableau `result()` avec une expression `Filter` pour trouver les actions en état `Failed` :

```
@{string(filter(result('TRY_Traitement_commande'), item() => equals(item()?['status'], 'Failed')))}
```

---

## Erreurs fréquentes et comment les diagnostiquer

### "Mon action de compensation ne s'exécute jamais"

**Symptôme** — Le scope CATCH reste en état Skipped même quand le scope TRY échoue.  
**Cause** — Le Run After du scope CATCH est encore configuré sur "Opération réussie" (valeur par défaut).  
**Correction** — Ouvrez le Run After du scope CATCH, décochez "Opération réussie", cochez "A échoué" et "A expiré".

---

### "Mon flow se termine en succès alors qu'une action a échoué"

**Symptôme** — Le résumé d'exécution affiche une coche verte, mais une action individuelle est rouge.  
**Cause** — Une action après l'échec était configurée pour s'exécuter aussi bien en succès qu'en échec (Run After coché sur les deux). Power Automate considère le flow comme réussi si la *dernière* action s'est terminée en succès — même si des actions intermédiaires ont échoué.  
**Correction** — Séparez explicitement vos branches succès/échec. Ne cochez jamais "Opération réussie" ET "A échoué" sur la même action sauf si vous avez une raison délibérée.

---

### "Le retry ne se déclenche pas sur mon connecteur custom"

**Symptôme** — L'action échoue au premier essai sans réessayer, malgré une politique de retry configurée.  
**Cause** — Le connecteur custom renvoie peut-être une erreur 4xx (Bad Request ou Unauthorized) que Power Automate interprète comme une erreur client non-retriable.  
**Correction** — Vérifiez le code HTTP dans les sorties de l'action. Si c'est un 400 ou 401, le retry ne peut pas aider : corrigez la requête ou le secret d'authentification. Si l'API renvoie incorrectement un 400 pour une erreur serveur temporaire, envisagez une boucle de retry manuelle avec `Do Until`.

---

### "L'expression `result()` me retourne une erreur de parsing"

**Symptôme** — `@{result('MonScope')}` déclenche une erreur dans l'action suivante.  
**Cause** — Le nom du scope dans l'expression ne correspond pas exactement au nom interne (les espaces sont remplacés par des underscores dans le nom technique).  
**Correction** — Dans l'éditeur d'expression, utilisez l'autocomplétion pour sélectionner le scope — Power Automate insère automatiquement le nom technique correct.

---

## Bonnes pratiques

**Nommez vos scopes explicitement.** Un scope nommé `Scope 1` est inutilisable en maintenance. Utilisez une convention : `TRY — [Domaine fonctionnel]` et `CATCH — [Domaine fonctionnel]`. Ça se lit d'un coup d'œil dans l'historique d'exécution.

**Ne gérez pas les erreurs action par action.** Brancher une notification d'erreur sur chaque action individuelle produit un flow illisible et difficile à maintenir. Groupez d'abord par scope, gérez au niveau du scope. Descendez au niveau d'une action individuelle seulement si elle a un comportement d'erreur spécifique qui diffère du reste du scope.

**Loggez toujours le contexte de l'erreur.** Un email d'alerte avec "Le flow a échoué" est inutile à 23h un dimanche. Loggez au minimum : l'ID de l'enregistrement traité, le message d'erreur, le timestamp, le nom du flow. Une ligne dans une liste SharePoint ou une table Dataverse suffit et permet de relancer manuellement.

**Attention au retry et aux effets de bord.** Si une action crée un enregistrement et que le retry la relance, vous risquez de créer des doublons. Avant d'activer le retry sur une action non-idempotente (création, envoi d'email), assurez-vous d'avoir une logique de déduplication ou utilisez une vérification "existe déjà" en amont.

**Testez vos branches d'erreur.** C'est le point le plus souvent oublié. Forcez volontairement un échec (une URL invalide, un ID inexistant) pour vérifier que votre scope CATCH s'exécute bien, que l'email arrive, que le log est créé. Une gestion d'erreur non testée est une fausse sécurité.

---

## Résumé

| Concept | Ce qu'il fait | À retenir |
|---------|--------------|-----------|
| **Run After** | Contrôle la condition d'exécution d'une action selon l'état de son prédécesseur | Par défaut = Succeeded uniquement — à reconfigurer explicitement pour capturer les échecs |
| **Retry policy** | Réessaie automatiquement une action en cas d'échec transitoire | S'active uniquement sur les erreurs 5xx et timeouts — pas sur les 4xx |
| **Scope** | Regroupe des actions en un bloc avec un état composite | Si une action du scope échoue → le scope entier est Failed |
| **Pattern try/catch** | Scope TRY + scope CATCH en Run After:Failed | Centralise la compensation sans polluer la logique métier |
| **`result()`** | Retourne le tableau d'exécution de toutes les actions d'un scope | Permet d'identifier quelle action a échoué et avec quel message |

Un flow robuste n'est pas un flow qui ne tombe jamais — c'est un flow qui sait quoi faire quand il tombe. Le scope try/catch + un log systématique vous donnent cette visibilité.

---

<!-- snippet
id: pf_runafter_echec
type: concept
tech: power automate
level: intermediate
importance: high
format: knowledge
tags: run after, gestion erreur, flow, controle
title: Run After — comportement par défaut et conséquences
content: Par défaut, chaque action a Run After = Succeeded. Si l'action précédente échoue, toutes les suivantes passent en Skipped et ne s'exécutent pas. Le flow se termine en rouge, sans compensation automatique. Pour intercepter un échec, il faut explicitement cocher "A échoué" dans le Run After de l'action de compensation.
description: La valeur par défaut "Succeeded uniquement" explique pourquoi les flows échouent silencieusement — sans reconfiguration, aucune branche d'erreur ne joue.
-->

<!-- snippet
id: pf_runafter_config
type: tip
tech: power automate
level: intermediate
importance: high
format: knowledge
tags: run after, scope, catch, branchement
title: Configurer Run After pour un scope CATCH
content: Dans le flow designer : cliquez sur … du scope CATCH → Configurer le run after. Décochez "Opération réussie", cochez "A échoué" et "A expiré". Sans cette config, le scope CATCH reste en Skipped même quand le scope TRY échoue — c'est l'erreur la plus fréquente sur ce pattern.
description: Run After doit être reconfiguré manuellement — la valeur par défaut (Succeeded) empêche tout scope CATCH de s'exécuter.
-->

<!-- snippet
id: pf_retry_scope
type: concept
tech: power automate
level: intermediate
importance: high
format: knowledge
tags: retry, erreur, http, 4xx, 5xx
title: Retry — erreurs 5xx uniquement, pas les 4xx
content: La politique de retry Power Automate ne se déclenche que sur les erreurs HTTP 5xx (erreurs serveur) et les timeouts. Une erreur 4xx (400 Bad Request, 401 Unauthorized, 404 Not Found) n'active pas le retry car elle signale un problème côté client. Réessayer 4 fois une requête mal formée ne la corrigera pas.
description: Si le retry ne se déclenche pas, vérifiez le code HTTP dans les sorties de l'action — un 4xx bloque définitivement le retry.
-->

<!-- snippet
id: pf_retry_exponential
type: tip
tech: power automate
level: intermediate
importance: medium
format: knowledge
tags: retry, backoff, api, connecteur, interval
title: Choisir la stratégie de retry selon le contexte
content: Pour les connecteurs Microsoft (Dataverse, SharePoint, Teams) : laissez le mode "Par défaut" — 4 tentatives avec backoff intégré. Pour les APIs tierces avec rate limiting connu : passez sur "Intervalle exponentiel" personnalisé. Format du délai : ISO 8601 — PT20S = 20 secondes, PT2M = 2 minutes. Ne pas activer le retry sur une action non-idempotente (création, envoi email) sans logique de déduplication.
description: Le mode Par défaut suffit pour 90% des cas Microsoft — réservez le retry personnalisé aux APIs tierces avec contraintes connues.
-->

<!-- snippet
id: pf_scope_etat_failed
type: concept
tech: power automate
level: intermediate
importance: high
format: knowledge
tags: scope, etat, failed, composition
title: Scope — état composite basé sur les actions internes
content: Un scope passe en état Failed si au moins une action à l'intérieur échoue, même si les autres ont réussi. C'est ce comportement qui rend le pattern try/catch possible : le scope CATCH est branché sur l'état Failed du scope TRY, peu importe laquelle des actions internes a échoué.
description: Un seul échec interne suffit à faire passer tout le scope en Failed — c'est le mécanisme qui permet de centraliser la gestion d'erreur.
-->

<!-- snippet
id: pf_scope_trycatch_pattern
type: tip
tech: power automate
level: intermediate
importance: high
format: knowledge
tags: scope, try, catch, pattern, compensation
title: Pattern try/catch avec deux scopes Power Automate
content: Structure : Scope TRY (logique métier) → Scope CATCH (Run After: Failed + TimedOut) → Scope FINALLY optionnel (Run After: tous les états). Nommez explicitement : "TRY — Traitement commande" et "CATCH — Gestion erreur". Le scope CATCH centralise toutes les compensations sans polluer la logique principale.
description: Ce pattern est l'équivalent du try/catch en code — il isole la logique métier de la gestion d'erreur dans un flow professionnel.
-->

<!-- snippet
id: pf_result_expression
type: command
tech: power automate
level: intermediate
importance: medium
format: knowledge
tags: expression, result, scope, diagnostic, json
title: Expression result() — récupérer le détail d'exécution d'un scope
command: result('<NOM_DU_SCOPE>')
example: result('TRY_Traitement_commande')
description: Retourne un tableau JSON de toutes les actions du scope avec leur état (Succeeded/Failed/Skipped) et leurs sorties. Utilisez-le dans le scope CATCH pour identifier quelle action a échoué et avec quel message.
-->

<!-- snippet
id: pf_result_filter_failed
type: command
tech: power automate
level: intermediate
importance: medium
format: knowledge
tags: expression, filter, result, failed, scope
title: Filtrer les actions Failed dans le résultat d'un scope
command: filter(result('<NOM_SCOPE>'), item() => equals(item()?['status'], 'Failed'))
example: string(filter(result('TRY_Traitement_commande'), item() => equals(item()?['status'], 'Failed')))
description: Extrait uniquement les actions en état Failed depuis le tableau result(). Pratique quand plusieurs actions peuvent échouer et que vous voulez logguer laquelle a planté.
-->

<!-- snippet
id: pf_runafter_piege_double
type: warning
tech: power automate
level: intermediate
importance: high
format: knowledge
tags: run after, succeeded, failed, piege, etat flow
title: Piège Run After — cocher Succeeded ET Failed en même temps
content: Piège : cocher à la fois "Opération réussie" et "A échoué" sur une action fait qu'elle s'exécute dans tous les cas. Conséquence : si cette action réussit, Power Automate peut terminer le flow en succès même si des actions précédentes ont échoué — masquant l'erreur réelle. Correction : séparez explicitement en deux branches distinctes, une par état.
description: Cocher Succeeded + Failed sur la même action masque les erreurs — la dernière action réussie fait passer tout le flow en vert.
-->

<!-- snippet
id: pf_log_erreur_contexte
type: tip
tech: power automate
level: intermediate
importance: medium
format: knowledge
tags: logging, erreur, alerte, diagnostic, bonne pratique
title: Logguer le contexte d'erreur, pas juste "le flow a échoué"
content: Dans le scope CATCH, loggez au minimum : l'ID de l'enregistrement traité, le message d'erreur (@{body('action')?['error']?['message']}), le timestamp (utcNow()), et le nom du flow (@{workflow()?['name']}). Une ligne dans une liste SharePoint ou Dataverse suffit. Sans ce contexte, une alerte nocturne est inexploitable.
description: Un email "Le flow a échoué" sans contexte est inutile en production — loggez toujours l'ID traité, le message d'erreur et le timestamp.
-->
