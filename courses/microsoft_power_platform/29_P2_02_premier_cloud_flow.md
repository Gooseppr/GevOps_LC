---
layout: page
title: "Premier Cloud Flow"

course: microsoft_power_platform
chapter_title: "Power Automate"

chapter: 2
section: 2

tags: power automate, cloud flow, trigger, action, connecteur, automatisation
difficulty: beginner
duration: 75
mermaid: false

status: "published"
prev_module: "/courses/microsoft_power_platform/30_P2_03_expressions_power_automate.html"
prev_module_title: "Expressions Power Automate"
next_module: "/courses/microsoft_power_platform/05_P0_05_dataverse_securite_roles.html"
next_module_title: "Sécurité Dataverse : security roles et column-level security"
---

# Premier Cloud Flow

## Objectifs pédagogiques

À la fin de ce module, tu seras capable de :

1. **Créer** un Cloud Flow depuis l'interface Power Automate
2. **Configurer** un déclencheur (trigger) et relier des actions enchaînées
3. **Tester** un flow et interpréter le résultat d'une exécution
4. **Corriger** les erreurs courantes de connexion ou de configuration d'action
5. **Lire** l'historique d'exécution pour diagnostiquer un problème

---

## Mise en situation

Tu rejoins une équipe qui reçoit chaque semaine des demandes de congés par email. Aujourd'hui, quelqu'un les recopie manuellement dans une liste SharePoint. Ta mission : automatiser ça. Dès qu'un email avec l'objet **"Demande de congé"** arrive dans la boîte Outlook partagée, une ligne doit être créée automatiquement dans la liste SharePoint avec le nom de l'expéditeur, la date, et l'objet du message.

C'est exactement ce genre de scénario qu'on va construire dans ce module — pas un exemple fictif, mais quelque chose qu'on pourrait déployer lundi matin.

---

## Pourquoi les Cloud Flows sont différents des autres automatisations

Tu as peut-être déjà vu des macros Excel ou des scripts Python tournant en tâche planifiée. Un Cloud Flow, c'est conceptuellement similaire, sauf que **tout se passe dans le cloud Microsoft**, sans serveur à gérer, sans exécutable à déployer. Le flow vit dans ton tenant Microsoft 365, il tourne 24h/24, et il répond aux événements en temps réel.

Ce qui change tout par rapport à un script maison : les **connecteurs**. Au lieu d'écrire du code pour appeler l'API Outlook, puis l'API SharePoint, puis gérer les tokens OAuth, tu glisses des blocs préconfigurés. Microsoft a déjà fait le travail d'intégration — toi, tu branches les blocs entre eux.

🧠 **Un flow, c'est toujours : 1 déclencheur → N actions.** Le déclencheur dit *quand*, les actions disent *quoi faire*. Sans déclencheur, rien ne démarre. Sans action, ça ne sert à rien.

---

## Créer son premier flow de A à Z

### 1. Accéder à Power Automate

Rendez-vous sur [make.powerautomate.com](https://make.powerautomate.com). Connecte-toi avec ton compte Microsoft 365. Vérifie dans le coin supérieur droit que tu es bien dans le bon **environnement** — c'est l'équivalent d'un espace de travail isolé. Pour l'instant, l'environnement par défaut suffit.

Dans le menu de gauche, clique sur **Mes flux** puis sur **+ Nouveau flux → Flux de cloud automatisé**.

### 2. Choisir le déclencheur

Une fenêtre s'ouvre avec un champ de recherche de déclencheurs. C'est là que tu définis l'événement qui va lancer ton flow.

Tape `Outlook` dans la recherche. Sélectionne :
> **"Lorsqu'un nouvel e-mail arrive (V3)"** — connecteur *Office 365 Outlook*

Donne un nom à ton flow en haut (par exemple : `Congés → SharePoint`), puis clique sur **Créer**.

L'éditeur s'ouvre avec ton déclencheur déjà posé. Tu vois une carte avec plusieurs champs configurables.

### 3. Configurer le déclencheur

La carte du déclencheur Outlook te propose plusieurs paramètres :

| Champ | Ce qu'il fait | Valeur pour notre cas |
|---|---|---|
| Dossier | Quel dossier surveiller | `Boîte de réception` |
| Filtre Objet | Filtrer par mots dans l'objet | `Demande de congé` |
| Uniquement les e-mails avec pièces jointes | Ignorer les emails sans PJ | `Non` |
| À | Filtrer par destinataire | (laisser vide) |

💡 Le **filtre objet** ici est côté déclencheur : il évite que le flow se déclenche pour *chaque* email reçu. C'est bien plus propre qu'une condition dans le flow. Exploite ces filtres natifs au maximum — ils réduisent les exécutions inutiles et la consommation de quota.

### 4. Ajouter une action SharePoint

Clique sur **+ Nouvelle étape** sous le déclencheur.

Dans la recherche, tape `SharePoint` et sélectionne l'action :
> **"Créer un élément"** — connecteur *SharePoint*

Cette action nécessite deux informations structurelles :

- **Adresse du site** : l'URL de ton site SharePoint (ex. `https://monentreprise.sharepoint.com/sites/RH`)
- **Nom de la liste** : une fois l'URL saisie, Power Automate charge les listes disponibles — sélectionne ta liste.

Une fois la liste choisie, les **colonnes de la liste apparaissent automatiquement** comme champs dans la carte. C'est l'un des avantages de Dataverse et SharePoint avec Power Automate : la structure est déjà connue, tu n'as pas à la redéclarer.

### 5. Injecter les données dynamiques (contenu dynamique)

C'est ici que beaucoup d'apprenants s'arrêtent, ne sachant pas comment "brancher" les données de l'email vers SharePoint.

Clique dans le champ **Titre** de ta liste. Un panneau apparaît à droite (ou sous le champ) : le **panneau de contenu dynamique**. C'est la liste de toutes les valeurs disponibles issues du déclencheur — dans notre cas, les propriétés de l'email.

Sélectionne **Objet** pour mettre l'objet de l'email dans le titre. Dans le champ **Expéditeur** (si ta liste a une telle colonne), insère la valeur dynamique **De**.

🧠 Le contenu dynamique, c'est la façon dont Power Automate passe les données d'une étape à l'autre. Chaque action "publie" ses sorties — l'étape suivante peut les consommer. Tu n'écris pas de variable, tu pointes vers une sortie nommée.

⚠️ Si le panneau de contenu dynamique n'affiche rien, c'est souvent parce que le déclencheur n'a pas encore été sauvegardé ou que la connexion n'est pas établie. Sauvegarde une fois, rouvre la carte.

### 6. Sauvegarder et tester

Clique sur **Sauvegarder** en haut à droite. Une fois sauvegardé, clique sur **Tester** (icône en haut à droite de l'éditeur).

Power Automate te propose deux modes :
- **Manuellement** : tu vas déclencher l'événement toi-même, puis Power Automate attend
- **Automatiquement** : rejouer une exécution précédente

Choisis **Manuellement**, puis envoie un email avec l'objet "Demande de congé" depuis un client Outlook vers la boîte surveillée. Dans les secondes qui suivent, Power Automate devrait capter l'email et exécuter le flow.

---

## Lire l'historique d'exécution

Après un test, va dans **Mes flux → ton flow → Historique des exécutions**. Tu vois chaque exécution avec son statut : ✅ Réussi, ❌ Échec, ⏭️ Ignoré.

Clique sur une exécution pour l'ouvrir. Chaque étape s'affiche avec :
- Son statut individuel (réussi / échoué)
- Les **entrées** qu'elle a reçues
- Les **sorties** qu'elle a produites

C'est extrêmement utile pour déboguer. Si l'action SharePoint a échoué, tu peux voir exactement quelle valeur a été envoyée et quel message d'erreur a été retourné.

💡 Garde l'habitude d'ouvrir l'historique même quand un flow **réussit**. Vérifier que les sorties contiennent bien ce que tu attendais évite de découvrir un problème silencieux deux semaines plus tard.

---

## Erreurs fréquentes et comment les corriger

### Connexion non établie

**Symptôme** : une carte d'action affiche "Connexion non valide" ou une icône d'avertissement jaune.

**Cause** : Power Automate utilise des connexions nommées (OAuth, API key…). Si tu viens d'arriver dans un environnement ou si la connexion a expiré, l'action ne peut pas s'authentifier.

**Correction** : clique sur les trois points de la carte → **Ajouter une nouvelle connexion**. Tu te connectes avec ton compte M365. La connexion est sauvegardée et réutilisable dans tous tes flows.

---

### Le flow ne se déclenche pas

**Symptôme** : tu envoies l'email, tu attends, rien ne se passe dans l'historique.

**Cause probable** : le filtre d'objet est sensible à la casse ou l'email est arrivé dans un sous-dossier (règle Outlook active). Autre cause : délai de polling — le déclencheur Outlook V3 peut avoir un délai allant jusqu'à quelques minutes selon ton plan.

**Correction** : vérifie le dossier configuré dans le trigger, désactive temporairement les règles Outlook, attends 2-3 minutes. Si le problème persiste, inspecte si l'email a bien atterri dans le dossier surveillé.

---

### Erreur 403 sur l'action SharePoint

**Symptôme** : l'action "Créer un élément" échoue avec un code 403 (Forbidden).

**Cause** : le compte utilisé pour la connexion SharePoint n'a pas les droits d'écriture sur la liste.

**Correction** : ouvre SharePoint, vérifie les permissions de la liste (Paramètres de la liste → Autorisations). Le compte connecté doit avoir au minimum le niveau **Contribuer**.

---

## Bonnes pratiques dès le départ

**Nomme tes flows clairement.** `Flow1` ou `Test automatisation` ne te dira plus rien dans trois semaines. Utilise le format `[Déclencheur] → [Résultat]` : `Email Congé → Créer ligne SharePoint`.

**Décris ce que fait ton flow.** Dans les paramètres du flow, il y a un champ Description. Utilise-le. Une ligne suffit. Ça compte double dans un environnement partagé.

**Exploite les filtres natifs des déclencheurs** plutôt que de tout recevoir puis filtrer dans le flow avec une condition. Un flow qui ne se déclenche pas du tout est plus efficace qu'un flow qui se déclenche pour rien faire.

**Ne stocke pas de credentials en dur dans les actions.** Les connexions Power Automate gèrent ça pour toi — n'essaie pas de contourner avec des clés API dans des champs texte.

**Teste avec des données réalistes.** Tester avec un email dont l'objet est "aaaa" ne te dira pas si ton flow se comporte correctement en production. Utilise des données proches du réel dès le départ.

---

## Résumé

| Concept | Ce que c'est | À retenir |
|---|---|---|
| Déclencheur (trigger) | L'événement qui lance le flow | 1 seul par flow, définit le *quand* |
| Action | Une opération à exécuter | Autant que nécessaire, s'enchaînent |
| Contenu dynamique | Les sorties d'une étape réutilisables dans les suivantes | C'est comme passer une variable entre fonctions |
| Connexion | L'authentification vers un service externe | Gérée une fois, réutilisée dans tous les flows |
| Historique d'exécution | Le log de chaque déclenchement | Premier réflexe de débogage |

Un Cloud Flow, c'est finalement un pipeline événementiel visuel : un fait se produit quelque part, Power Automate le capte, enchaîne des opérations, et chaque étape peut s'appuyer sur ce que la précédente a produit. Une fois ce mécanisme intégré, ajouter de la complexité n'est qu'une question d'actions supplémentaires.

---

<!-- snippet
id: powerautomate_flow_trigger_concept
type: concept
tech: power-automate
level: beginner
importance: high
format: knowledge
tags: trigger, declencheur, cloud-flow, evenement
title: Structure fondamentale d'un Cloud Flow
content: Un Cloud Flow suit toujours la structure : 1 déclencheur → N actions. Le déclencheur définit l'événement déclenchant (email reçu, item créé, heure planifiée). Sans déclencheur, le flow ne démarre jamais. Les actions s'exécutent séquentiellement et chacune expose ses sorties à l'étape suivante.
description: Structure immuable de tout Cloud Flow — 1 trigger + au moins 1 action. Comprendre ça avant tout.
-->

<!-- snippet
id: powerautomate_contenu_dynamique_concept
type: concept
tech: power-automate
level: beginner
importance: high
format: knowledge
tags: contenu-dynamique, sorties, donnees, flux
title: Contenu dynamique — comment les données circulent entre étapes
content: Chaque étape d'un Cloud Flow publie des sorties (ex : Objet, De, Corps pour un email). L'étape suivante peut consommer ces sorties via le panneau "Contenu dynamique". Ce n'est pas une variable déclarée manuellement — c'est un pointeur vers la sortie nommée d'une étape précédente. Si le panneau est vide, la connexion ou la sauvegarde du déclencheur est manquante.
description: Les données passent d'une étape à l'autre via le panneau contenu dynamique — pas de variable à déclarer, on pointe une sortie nommée.
-->

<!-- snippet
id: powerautomate_filtre_trigger_tip
type: tip
tech: power-automate
level: beginner
importance: high
format: knowledge
tags: trigger, filtre, optimisation, quota
title: Utiliser les filtres natifs du déclencheur plutôt qu'une condition
content: Plutôt que de laisser le flow se déclencher sur chaque email puis ajouter une condition "Si Objet contient X", configure le champ Filtre Objet directement dans la carte du déclencheur Outlook. Le flow ne démarre pas du tout si le filtre ne correspond pas — aucune exécution consommée, aucune ligne dans l'historique.
description: Les filtres natifs du trigger empêchent le déclenchement inutile du flow, réduisant la consommation du quota d'exécutions.
-->

<!-- snippet
id: powerautomate_connexion_invalide_error
type: error
tech: power-automate
level: beginner
importance: high
format: knowledge
tags: connexion, authentification, erreur, sharepoint
title: Carte d'action avec avertissement "Connexion non valide"
content: Symptôme : icône jaune sur une carte ou message "Connexion non valide". Cause : la connexion OAuth vers le service (Outlook, SharePoint…) n'existe pas dans cet environnement ou a expiré. Correction : cliquer sur les trois points de la carte → Ajouter une nouvelle connexion → s'authentifier avec le compte M365. La connexion est ensuite réutilisable dans tous les flows du même environnement.
description: Connexion invalide = authentification manquante ou expirée. Se règle en créant une nouvelle connexion depuis la carte défaillante.
-->

<!-- snippet
id: powerautomate_403_sharepoint_error
type: error
tech: power-automate
level: beginner
importance: medium
format: knowledge
tags: sharepoint, permission, erreur, 403
title: Erreur 403 Forbidden sur l'action SharePoint "Créer un élément"
content: Symptôme : l'action "Créer un élément" échoue avec le code HTTP 403. Cause : le compte de la connexion SharePoint n'a pas les droits d'écriture sur la liste ciblée. Correction : ouvrir la liste SharePoint → Paramètres → Autorisations de cette liste → vérifier que le compte connecté possède au minimum le niveau "Contribuer".
description: 403 sur SharePoint = droits insuffisants. Le compte de la connexion doit avoir le niveau Contribuer sur la liste cible.
-->

<!-- snippet
id: powerautomate_historique_execution_tip
type: tip
tech: power-automate
level: beginner
importance: high
format: knowledge
tags: debug, historique, execution, diagnostic
title: Lire l'historique d'exécution pour déboguer un flow
content: Après chaque exécution (réussie ou non), aller dans Mes flux → le flow → Historique des exécutions. Cliquer sur une exécution affiche chaque étape avec ses entrées et sorties exactes. Vérifier les sorties même en cas de succès : un flow peut réussir techniquement mais avoir injecté une valeur vide dans SharePoint si le contenu dynamique était mal configuré.
description: Premier réflexe de debug : ouvrir l'historique d'exécution et inspecter les entrées/sorties de chaque étape, pas seulement le statut global.
-->

<!-- snippet
id: powerautomate_nommage_flow_tip
type: tip
tech: power-automate
level: beginner
importance: medium
format: knowledge
tags: bonnes-pratiques, nommage, lisibilite, organisation
title: Nommer ses flows avec le format Déclencheur → Résultat
content: Utiliser le format "[Source] → [Action]" pour nommer ses flows, par exemple : "Email Congé → Créer ligne SharePoint" ou "Formulaire RH → Notifier manager". Ce format permet de comprendre d'un coup d'œil ce que fait le flow sans l'ouvrir, surtout dans un environnement partagé avec des dizaines de flows.
description: Format recommandé pour nommer un flow : "[Déclencheur] → [Résultat]". Compréhensible sans l'ouvrir, essentiel en environnement d'équipe.
-->

<!-- snippet
id: powerautomate_test_manuel_tip
type: tip
tech: power-automate
level: beginner
importance: medium
format: knowledge
tags: test, debug, validation, execution
title: Tester un flow manuellement après création
content: Après avoir sauvegardé un flow, cliquer sur Tester → Manuellement. Power Automate passe en mode écoute et attend que l'événement déclencheur se produise réellement (ex : envoyer un vrai email). Une fois l'événement déclenché, le résultat s'affiche immédiatement dans l'interface avec le détail de chaque étape. Tester avec des données proches du réel — pas des valeurs factices comme "test123".
description: Mode test manuel : Power Automate attend l'événement déclencheur en temps réel et affiche le résultat étape par étape dès l'exécution.
-->
