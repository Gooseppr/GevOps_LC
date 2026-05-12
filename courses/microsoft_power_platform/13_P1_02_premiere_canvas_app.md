---
layout: page
title: "Première Canvas App"

course: microsoft_power_platform
chapter_title: "Power Apps"

chapter: 1
section: 2

tags: power apps, canvas app, dataverse, débutant, low-code, galerie, formulaire
difficulty: beginner
duration: 90
mermaid: false

status: "published"
prev_module: "/courses/microsoft_power_platform/14_P1_03_power_fx_fondamental.html"
prev_module_title: "Power Fx fondamental"
next_module: "/courses/microsoft_power_platform/18_P1_07_connexion_donnees_apps.html"
next_module_title: "Canvas Apps connectées à Dataverse, SharePoint, SQL et API"
---

# Première Canvas App

## Objectifs pédagogiques

À l'issue de ce module, vous serez capable de :

1. **Créer** une Canvas App depuis zéro dans Power Apps Studio
2. **Connecter** l'application à une source de données (table Dataverse ou Excel)
3. **Construire** un écran de liste et un écran de détail avec les composants de base
4. **Configurer** les propriétés essentielles d'un contrôle (texte, couleur, visibilité)
5. **Publier** et tester une application sur navigateur et mobile

---

## Mise en situation

Vous rejoignez une équipe RH qui gère les demandes de matériel informatique via des e-mails et un fichier Excel partagé. Le fichier est souvent ouvert par plusieurs personnes en même temps, les données sont en doublon, et personne ne sait vraiment quel état a chaque demande.

Votre mission : créer une Canvas App simple qui permet à n'importe quel collaborateur de soumettre une demande (ordinateur, écran, périphérique) et de suivre l'état de sa demande. Pas de code, pas de serveur — juste Power Apps connecté à une table Dataverse.

Ce scénario volontairement simple va vous faire passer par toutes les étapes fondamentales : créer l'app, brancher la source, afficher une liste, ouvrir un détail, sauvegarder. C'est exactement ce que vous reproduirez sur des projets réels, juste à plus grande échelle.

---

## Contexte — Pourquoi les Canvas Apps sont différentes

Si vous avez lu le module précédent, vous savez qu'il existe plusieurs types d'applications dans Power Apps. La Canvas App se distingue par une idée centrale : **vous contrôlez tout**. Position des éléments, logique de navigation, comportement des boutons — c'est vous qui décidez, pixel par pixel si vous le voulez.

Comparez ça à PowerPoint : vous posez des formes où vous voulez sur un écran, vous ajoutez des comportements, et vous naviguez entre les slides. La différence, c'est que vos "slides" sont des écrans connectés à de vraies données.

🧠 **Ce que Power Apps Studio fait pour vous :** au lieu de gérer un back-end, une API, une base de données et un front-end séparément, tout est centralisé dans un seul environnement visuel. La formule que vous écrivez sur un bouton, c'est directement une action sur vos données — pas un appel HTTP, pas du JSON.

---

## Créer votre première application

### Accès à Power Apps Studio

Rendez-vous sur [make.powerapps.com](https://make.powerapps.com). Vérifiez en haut à droite que vous êtes dans le bon **environnement** — c'est l'espace de travail qui contient vos données et vos apps. Pour commencer, l'environnement par défaut de votre tenant suffit.

Pour créer une nouvelle Canvas App :

> **Accueil → + Créer → Application canevas vide**

Vous choisissez ensuite le format :
- **Téléphone** → layout vertical, idéal pour les apps mobiles
- **Tablette** → layout horizontal, plus confortable pour des apps bureau

Pour notre scénario de demandes de matériel, choisissez **Tablette** — vos utilisateurs seront principalement sur desktop.

💡 Ce choix n'est pas irréversible, mais le changer en cours de route réorganise tous vos écrans. Prenez 30 secondes pour y réfléchir avant.

---

### Découverte de l'interface

Power Apps Studio ressemble à ça, de gauche à droite :

**Panneau gauche — Arborescence**
Tous vos écrans (`Screen1`, `Screen2`...) et tous les contrôles imbriqués. C'est votre plan de l'application.

**Zone centrale — Canevas**
L'écran en cours d'édition. Vous posez vos contrôles ici, vous les déplacez, vous les redimensionnez.

**Panneau droit — Propriétés**
Quand vous sélectionnez un contrôle, ses propriétés apparaissent ici : texte, couleur, taille, visibilité. Certaines propriétés acceptent une valeur fixe, d'autres une formule.

**Barre de formule (en haut)**
Le champ le plus important de toute l'interface. C'est ici que vous écrivez la logique de votre application — filtrer des données, naviguer entre écrans, sauvegarder un enregistrement. Chaque propriété d'un contrôle peut recevoir une formule.

⚠️ **Réflexe à prendre immédiatement :** avant d'écrire une formule, vérifiez toujours dans le menu déroulant à gauche de la barre quelle propriété est sélectionnée. Écrire une formule sur `Fill` au lieu de `OnSelect` est une erreur très courante.

---

## Connecter une source de données

Une application sans données, c'est une maquette. La première chose à faire après avoir créé l'app, c'est de brancher votre source.

### Avec Dataverse (recommandé)

Dans le menu gauche, cliquez sur l'icône **cylindre** (Données) → **+ Ajouter des données** → recherchez "Dataverse" → sélectionnez vos tables.

Pour notre scénario, nous allons créer une table `DemandesMateriel` avec ces colonnes :

| Colonne | Type |
|---|---|
| Titre | Texte (nom de la demande) |
| TypeMateriel | Choix (Ordinateur, Écran, Périphérique) |
| Statut | Choix (En attente, Approuvée, Refusée) |
| DateDemande | Date et heure |
| Demandeur | Lookup utilisateur |

Créez cette table dans [make.powerapps.com → Dataverse → Tables → + Nouvelle table] avant de revenir dans votre app.

🧠 **Pourquoi Dataverse plutôt qu'Excel ?** Les deux fonctionnent, mais Dataverse gère les accès concurrents, les types de données stricts, et s'intègre naturellement avec les autres piliers de la Power Platform. Excel est bien pour prototyper rapidement, Dataverse pour tout ce qui va en production.

### Avec Excel (alternative pour prototyper)

Si vous n'avez pas encore de Dataverse configuré, vous pouvez utiliser un fichier Excel stocké sur SharePoint ou OneDrive. Le fichier doit être **formaté en tableau** (Ctrl+T dans Excel) — Power Apps ne lit pas les plages libres.

Connexion : **+ Ajouter des données → Excel Online (Business) → sélectionner le fichier → sélectionner le tableau**

---

## Construire l'écran de liste

C'est l'écran d'accueil de votre app. L'utilisateur arrive ici et voit toutes les demandes existantes.

### Ajouter une galerie

La **Galerie** est le contrôle de base pour afficher une liste de données. Chaque "carte" dans la galerie représente un enregistrement.

> **Insérer → Galerie → Galerie verticale**

Une galerie vide apparaît sur le canevas. Sélectionnez-la, puis dans le panneau droit, cliquez sur **Source de données** et sélectionnez votre table `DemandesMateriel`.

Power Apps va automatiquement peupler la galerie avec les données. Vous verrez probablement apparaître des intitulés génériques — on va personnaliser ça.

### Personnaliser le modèle de carte

Cliquez une fois sur la galerie pour la sélectionner, puis une deuxième fois sur une carte individuelle pour entrer dans le **mode édition du modèle**. Vous êtes maintenant en train d'éditer ce qui s'affiche pour chaque enregistrement.

Sélectionnez le label du titre et regardez sa propriété `Text` dans la barre de formule. Vous verrez quelque chose comme `ThisItem.Name`. Remplacez par :

```
ThisItem.Titre
```

Faites de même pour le sous-titre :

```
ThisItem.TypeMateriel
```

💡 `ThisItem` est une référence spéciale qui pointe vers l'enregistrement de la ligne courante. C'est l'équivalent d'une variable de boucle — vous ne l'avez pas déclarée, Power Apps la crée automatiquement dans le contexte d'une galerie.

### Ajouter un badge de statut

Pour rendre le statut visible d'un coup d'œil, ajoutez un label dans le modèle de carte avec la propriété `Text` :

```
ThisItem.Statut
```

Et coloriez-le dynamiquement. Sélectionnez ce label, allez sur la propriété `Color` :

```
If(
    ThisItem.Statut = "Approuvée", Color.Green,
    ThisItem.Statut = "Refusée", Color.Red,
    Color.Orange
)
```

⚠️ Ne vous inquiétez pas si cette syntaxe vous semble nouvelle — le module suivant couvre Power Fx en détail. Pour l'instant, lisez-la comme du français : "si le statut est Approuvée, vert ; si Refusée, rouge ; sinon orange."

### Ajouter un bouton "Nouvelle demande"

En dehors de la galerie (cliquez sur le fond de l'écran pour désélectionner la galerie), ajoutez un bouton :

> **Insérer → Bouton**

Propriété `Text` : `"Nouvelle demande"`

On reviendra sur sa propriété `OnSelect` après avoir créé l'écran de formulaire.

---

## Construire l'écran de formulaire

Ajoutez un deuxième écran : clic droit sur `Screen1` dans l'arborescence → **Ajouter un écran → Écran vide**.

Renommez-le `EcranFormulaire` (clic droit → Renommer) — les noms par défaut `Screen1`, `Screen2` deviennent vite ingérables.

### Ajouter le formulaire d'édition

> **Insérer → Formulaire → Modifier**

Sélectionnez le formulaire, puis dans le panneau droit → **Source de données** → `DemandesMateriel`.

Power Apps génère automatiquement un champ pour chaque colonne de la table. Vous pouvez masquer les champs inutiles (comme les colonnes système) en cliquant sur **Modifier les champs** dans le panneau droit.

🧠 **Modes du formulaire :** un contrôle Formulaire a une propriété `DefaultMode` qui peut être `FormMode.Edit` (éditer un existant), `FormMode.New` (créer un nouveau) ou `FormMode.View` (lecture seule). Pour notre bouton "Nouvelle demande", on voudra `FormMode.New`.

### Lier la navigation

Revenez sur `EcranAccueil` (votre premier écran). Sélectionnez le bouton "Nouvelle demande" et écrivez sur sa propriété `OnSelect` :

```
NewForm(FormulaireDemande);
Navigate(EcranFormulaire)
```

`NewForm()` remet le formulaire en mode création propre. `Navigate()` change d'écran. Ces deux instructions s'exécutent l'une après l'autre — c'est le fonctionnement normal des formules avec point-virgule dans Power Fx.

Maintenant, sur `EcranFormulaire`, ajoutez deux boutons :

**Bouton Enregistrer**
```
SubmitForm(FormulaireDemande)
```

**Bouton Annuler**
```
ResetForm(FormulaireDemande);
Navigate(EcranAccueil)
```

Pour gérer la navigation après une sauvegarde réussie, sélectionnez votre contrôle formulaire et sur sa propriété `OnSuccess` :

```
Navigate(EcranAccueil)
```

⚠️ `SubmitForm` est asynchrone — ne mettez pas `Navigate` juste après `SubmitForm` sur le bouton, vous naviguerez avant que la sauvegarde soit terminée. Utilisez `OnSuccess` pour naviguer après confirmation.

---

## Construction progressive

### Version 1 — Le minimum fonctionnel

Ce que vous avez maintenant : deux écrans, une galerie, un formulaire, deux boutons. C'est suffisant pour qu'un utilisateur crée une demande et la voie dans la liste. Testez avec **F5** ou le bouton ▶ en haut à droite.

### Version 2 — Ouvrir le détail d'une demande existante

Pour le moment, tapper sur une demande dans la galerie ne fait rien. On va changer ça.

Sélectionnez la galerie sur `EcranAccueil`, propriété `OnSelect` :

```
EditForm(FormulaireDemande);
Navigate(EcranFormulaire)
```

Et sur le formulaire, mettez à jour la propriété `Item` pour qu'il charge l'enregistrement sélectionné :

```
EcranAccueil.Gallery1.Selected
```

Maintenant cliquer sur une demande ouvre le formulaire en mode édition avec les données de cette demande.

💡 Renommez votre galerie (clic droit → Renommer → `GalerieDemandes`) avant de référencer `EcranAccueil.GalerieDemandes.Selected` — c'est bien plus lisible que `Gallery1`.

### Version 3 — Filtrer la liste

Ajoutez une barre de recherche au-dessus de la galerie :

> **Insérer → Entrée de texte**

Renommez le contrôle `SearchBox`. Puis sur la propriété `Items` de votre galerie, remplacez la référence simple à la table par :

```
Filter(
    DemandesMateriel,
    IsBlank(SearchBox.Text) || StartsWith(Titre, SearchBox.Text)
)
```

La galerie se filtre maintenant en temps réel à chaque frappe. Pas de bouton, pas d'événement à déclencher — Power Apps recalcule automatiquement dès que `SearchBox.Text` change.

---

## Publier et tester

### Sauvegarder d'abord

Power Apps ne sauvegarde pas automatiquement. Utilisez **Ctrl+S** régulièrement. La première sauvegarde vous demande un nom pour l'application.

### Publier

> **Fichier → Publier → Publier cette version**

La publication rend l'application accessible aux utilisateurs que vous avez invités. Avant de publier, seul vous pouvez y accéder (en mode prévisualisation).

### Partager

> **Fichier → Partager** (ou depuis make.powerapps.com → trouver l'app → ⋯ → Partager)

Vous pouvez partager avec des utilisateurs individuels, des groupes de sécurité ou toute l'organisation. N'oubliez pas d'accorder aussi les permissions sur la source de données — l'accès à l'app ne donne pas automatiquement l'accès aux données.

### Tester sur mobile

Installez **Power Apps** depuis l'App Store ou Google Play. Connectez-vous avec le même compte Microsoft 365. Votre application apparaîtra automatiquement dans la liste des apps disponibles.

---

## Erreurs fréquentes

**L'application affiche "Délégation" en jaune sur ma galerie**

Ce message apparaît quand votre formule `Filter` ou `Sort` ne peut pas être entièrement exécutée côté serveur. Power Apps télécharge alors un maximum de 500 enregistrements localement et filtre dans le navigateur — si vous avez 2 000 lignes, les 1 500 dernières ne sont jamais vues.

Correction : utilisez des colonnes indexées pour filtrer, et privilégiez les fonctions déléguées (voir la documentation de délégation Power Apps pour chaque connecteur).

---

**Mon formulaire ne se vide pas quand j'arrive sur l'écran**

Cause classique : vous naviguez vers l'écran sans appeler `NewForm()` avant. Le formulaire garde l'état de la dernière session.

Correction : appelez `NewForm(NomDuFormulaire)` dans la propriété `OnSelect` de votre bouton, avant `Navigate()`, ou dans la propriété `OnVisible` de l'écran du formulaire.

---

**Les données que je crée n'apparaissent pas dans la galerie immédiatement**

La galerie peut avoir un cache local. Ajoutez `Refresh(DemandesMateriel)` dans la propriété `OnSuccess` du formulaire, avant le `Navigate` :

```
Refresh(DemandesMateriel);
Navigate(EcranAccueil)
```

---

## Bonnes pratiques

**Nommez tout immédiatement.** `Button1`, `Label3`, `Gallery2` — c'est illisible dès que vous avez 10 contrôles. Renommez chaque contrôle dès que vous le créez : `BoutonNouveauDemande`, `GalerieDemandes`, `SearchBox`. Vos formules qui référencent ces contrôles seront lisibles six mois plus tard.

**Une variable = un rôle précis.** Quand vous aurez besoin de stocker l'état de l'application (module Power Fx à venir), résistez à la tentation de recycler une variable pour plusieurs usages. `varModeFormulaire` ne doit contenir que le mode du formulaire.

**Testez sur mobile avant de livrer.** Un layout qui semble parfait sur tablette peut être inutilisable sur téléphone. Utilisez la prévisualisation mobile (icône téléphone en haut de l'éditeur) à chaque étape de construction.

**Ne mettez pas de logique dans `OnVisible`.** La propriété `OnVisible` se déclenche à chaque fois que l'écran apparaît — y compris quand on revient en arrière. Si vous y mettez un appel à une base de données ou une réinitialisation de variable, ça se déclenchera plus souvent que prévu. Préférez `OnSelect` sur les boutons de navigation pour contrôler précisément quand la logique s'exécute.

---

## Résumé

| Concept | Ce qu'il fait | À retenir |
|---|---|---|
| **Canevas (Canvas)** | Surface de design libre où vous posez les contrôles | Layout absolu, pas de responsive automatique |
| **Galerie** | Affiche une liste d'enregistrements, une carte par ligne | `ThisItem` référence l'enregistrement de la carte courante |
| **Formulaire d'édition** | Lit et écrit dans une source de données | 3 modes : New, Edit, View — à piloter avec `NewForm()` / `EditForm()` |
| **SubmitForm** | Sauvegarde les données du formulaire | Asynchrone — naviguer dans `OnSuccess`, pas après `SubmitForm` |
| **Navigate** | Change d'écran | Premier argument : nom de l'écran cible |
| **Refresh** | Recharge les données depuis la source | À appeler si la galerie n'affiche pas les nouvelles entrées |

Une Canvas App, c'est la combinaison de trois choses : des **écrans** pour organiser l'expérience, des **contrôles** pour afficher et saisir des données, et des **formules** pour tout faire tenir ensemble. Vous venez de construire votre première version — les modules suivants vont approfondir la partie formules, qui est le vrai coeur de la puissance de l'outil.

---

<!-- snippet
id: powerapps_galerie_thisitem
type: concept
tech: power-apps
level: beginner
importance: high
format: knowledge
tags: canvas-app, galerie, thisitem, donnees
title: ThisItem dans une galerie Power Apps
content: Dans une galerie, `ThisItem` est une référence automatique à l'enregistrement de la carte courante. Pas besoin de déclarer de variable : Power Apps l'injecte dans le contexte du modèle. `ThisItem.Titre` lit le champ "Titre" de la ligne affichée. Fonctionne aussi pour colorer dynamiquement un badge ou masquer un contrôle selon la valeur d'un champ.
description: ThisItem est créé automatiquement par Power Apps dans une galerie — il pointe sur l'enregistrement de la carte courante, accessible sans déclaration.
-->

<!-- snippet
id: powerapps_formulaire_submitform_async
type: warning
tech: power-apps
level: beginner
importance: high
format: knowledge
tags: canvas-app, formulaire, submitform, navigation, onsuccess
title: Ne pas naviguer juste après SubmitForm
content: Piège : mettre `Navigate(EcranAccueil)` sur la même ligne que `SubmitForm()` dans le OnSelect d'un bouton. SubmitForm est asynchrone — la navigation s'exécute avant que la sauvegarde soit confirmée. Correction : mettre `Navigate()` dans la propriété `OnSuccess` du contrôle formulaire, pas sur le bouton.
description: SubmitForm est asynchrone. Navigate après SubmitForm sur un bouton s'exécute avant la sauvegarde — utiliser OnSuccess à la place.
-->

<!-- snippet
id: powerapps_formulaire_newform_avant_navigate
type: tip
tech: power-apps
level: beginner
importance: high
format: knowledge
tags: canvas-app, formulaire, newform, navigation
title: Appeler NewForm avant Navigate pour vider le formulaire
content: Pour créer un nouvel enregistrement, toujours appeler `NewForm(NomDuFormulaire)` avant `Navigate(EcranFormulaire)`. Sans ça, le formulaire garde les données de la dernière session. Exemple sur le bouton : `NewForm(FormulaireDemande); Navigate(EcranFormulaire)`. Alternativement, placer `NewForm()` dans `OnVisible` de l'écran, mais attention aux déclenchements multiples.
description: Sans NewForm() avant Navigate, le formulaire garde les données de la session précédente. Appeler NewForm() sur le bouton de navigation, avant Navigate().
-->

<!-- snippet
id: powerapps_galerie_refresh_donnees
type: tip
tech: power-apps
level: beginner
importance: medium
format: knowledge
tags: canvas-app, galerie, refresh, dataverse
title: Rafraîchir la galerie après une sauvegarde
content: Après un SubmitForm réussi, la galerie peut ne pas afficher le nouvel enregistrement immédiatement à cause du cache local. Ajouter `Refresh(NomDeLaTable)` dans la propriété `OnSuccess` du formulaire, avant le Navigate : `Refresh(DemandesMateriel); Navigate(EcranAccueil)`.
description: Après SubmitForm, la galerie peut ne pas se mettre à jour. Appeler Refresh(NomTable) dans OnSuccess du formulaire pour forcer le rechargement.
-->

<!-- snippet
id: powerapps_formulaire_modes
type: concept
tech: power-apps
level: beginner
importance: high
format: knowledge
tags: canvas-app, formulaire, formmode, newform, editform
title: Les 3 modes d'un formulaire Power Apps
content: Un contrôle Formulaire a une propriété `DefaultMode` avec 3 valeurs : `FormMode.New` (création, champs vides), `FormMode.Edit` (édition d'un enregistrement existant), `FormMode.View` (lecture seule). On pilote le mode avec des fonctions : `NewForm()` bascule en New, `EditForm()` bascule en Edit. La propriété `Item` détermine quel enregistrement est chargé en mode Edit.
description: Formulaire Power Apps = 3 modes (New, Edit, View). NewForm() et EditForm() basculent le mode. La propriété Item détermine quel enregistrement est chargé.
-->

<!-- snippet
id: powerapps_navigation_navigate
type: command
tech: power-apps
level: beginner
importance: high
format: knowledge
tags: canvas-app, navigation, navigate, ecran
title: Naviguer entre écrans avec Navigate
command: Navigate(<NomEcran>)
example: Navigate(EcranFormulaire)
description: Navigue vers l'écran cible. S'utilise dans OnSelect d'un bouton ou OnSuccess d'un formulaire. Le nom de l'écran est celui visible dans l'arborescence gauche de Power Apps Studio.
-->

<!-- snippet
id: powerapps_galerie_filtre_temps_reel
type: command
tech: power-apps
level: beginner
importance: medium
format: knowledge
tags: canvas-app, galerie, filter, searchbox, temps-reel
title: Filtrer une galerie en temps réel avec une zone de recherche
command: Filter(<Table>, IsBlank(<SearchBox>.Text) || StartsWith(<Champ>, <SearchBox>.Text))
example: Filter(DemandesMateriel, IsBlank(SearchBox.Text) || StartsWith(Titre, SearchBox.Text))
description: À placer dans la propriété Items de la galerie. Power Apps recalcule automatiquement à chaque frappe dans SearchBox — aucun bouton ni événement nécessaire.
-->

<!-- snippet
id: powerapps_delegation_warning
type: warning
tech: power-apps
level: beginner
importance: medium
format: knowledge
tags: canvas-app, delegation, filter, performance, galerie
title: Avertissement de délégation sur les galeries
content: Piège : quand une formule Filter ou Sort ne peut pas être exécutée côté serveur (ex. StartsWith sur une colonne non indexée avec certains connecteurs), Power Apps affiche un triangle jaune et ne charge que les 500 premiers enregistrements. Les données au-delà de 500 lignes sont invisibles. Correction : utiliser des colonnes indexées, ou des fonctions déléguées selon le connecteur utilisé.
description: La délégation limite les filtres côté client à 500 lignes. Si le triangle jaune apparaît sur la galerie, les données au-delà de 500 enregistrements ne sont pas visibles.
-->

<!-- snippet
id: powerapps_nommage_controles
type: tip
tech: power-apps
level: beginner
importance: medium
format: knowledge
tags: canvas-app, bonnes-pratiques, nommage, lisibilite
title: Nommer les contrôles dès leur création
content: Power Apps nomme les contrôles Button1, Gallery2, Label3 par défaut. Dès qu'une formule référence un contrôle (ex. GalerieDemandes.Selected), un nom générique rend le code illisible et les bugs difficiles à tracer. Renommer immédiatement via clic droit → Renommer dans l'arborescence. Convention recommandée : préfixe par type (btn, gal, lbl, txt) + nom métier : `btnNouveauDemande`, `galDemandes`, `txtRecherche`.
description: Renommer chaque contrôle dès sa création — les formules qui le référencent seront lisibles. Button1 devient btnNouveauDemande, Gallery2 devient galDemandes.
-->
