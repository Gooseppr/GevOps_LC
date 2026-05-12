---
layout: page
title: "Composants et bibliothèques de composants"

course: microsoft_power_platform
chapter_title: "Power Apps Canvas — Développement avancé"

chapter: 1
section: 8

tags: power apps, composants, bibliothèques, canvas, réutilisabilité, power fx
difficulty: intermediate
duration: 90
mermaid: false

status: "published"
prev_module: "/courses/microsoft_power_platform/23_P1_12_alm_power_apps.html"
prev_module_title: "ALM spécifique Power Apps"
next_module: "/courses/microsoft_power_platform/24_P1_13_pcf_controls.html"
next_module_title: "PCF Controls — Créer des composants personnalisés pour Power Apps et Model-Driven"
---

# Composants et bibliothèques de composants

## Objectifs pédagogiques

À l'issue de ce module, vous serez capable de :

- Créer un composant Canvas réutilisable avec ses propriétés d'entrée et de sortie
- Exposer des comportements personnalisés via des propriétés de type fonction
- Partager un composant entre plusieurs applications via une bibliothèque de composants
- Identifier les contraintes et limites des composants pour éviter les pièges courants
- Organiser une bibliothèque de composants dans un contexte d'équipe ou d'entreprise

---

## Mise en situation

Votre équipe développe quatre applications internes pour une société de logistique : une app pour les chauffeurs, une pour les coordinateurs, une pour les clients et une pour la direction. Toutes affichent un en-tête avec le logo, le nom de l'utilisateur connecté et un bouton de navigation. Chaque app a aussi ses propres formulaires, ses couleurs de thème, et sa logique métier.

Au fil des sprints, vous constatez un problème classique : l'en-tête est copié-collé dans chaque écran de chaque app. Quand le design change — et il change toujours — vous devez propager la modification à la main dans 40 endroits différents. Un oubli, et l'app des clients affiche l'ancien logo pendant trois semaines sans que personne ne s'en aperçoive.

C'est exactement le problème que les composants et bibliothèques résolvent.

---

## Contexte : pourquoi les composants existent

Dans une application Canvas basique, la réutilisabilité passe par le copier-coller de contrôles ou par les écrans templates. Ça fonctionne sur un projet solo, à court terme. Mais dès qu'on travaille en équipe ou sur plusieurs applications, cette approche crée une dette de maintenance exponentielle.

Les composants Canvas (introduits en 2019, sortis de preview en 2020) apportent une vraie encapsulation : vous définissez une fois un ensemble de contrôles et de comportements, vous l'exposez via une interface claire (les propriétés), et vous l'utilisez n'importe où. Pensez à un composant comme à une fonction avec une interface graphique — elle reçoit des paramètres, elle fait quelque chose, elle peut renvoyer une valeur.

La bibliothèque de composants, elle, va un cran plus loin : elle permet de partager ces composants entre applications, avec un mécanisme de versioning et de mise à jour contrôlée.

🧠 **Un composant n'est pas un écran.** C'est un groupe de contrôles autonome, avec sa propre surface, ses propres propriétés, qui peut être instancié plusieurs fois dans la même app ou dans des apps différentes.

---

## Créer un composant : les bases

### La surface d'un composant

Un composant se crée depuis l'onglet **Composants** dans le volet de navigation arborescent de Power Apps Studio (anciennement accessible via **Vue → Composants**). Chaque composant a une taille fixe définie à la création — sa largeur et sa hauteur servent de "canvas" pour le designer.

À l'intérieur, vous placez des contrôles exactement comme dans un écran normal. La différence clé : tout ce qui est à l'intérieur est encapsulé. Les contrôles du composant ne sont pas accessibles directement depuis l'écran qui l'utilise. On passe obligatoirement par les propriétés.

### Propriétés d'entrée (Input)

Les propriétés d'entrée permettent à l'écran hôte de **passer des données** au composant. Vous les créez dans le panneau Propriétés du composant, en cliquant sur **+ Nouvelle propriété personnalisée**.

Pour chaque propriété, vous définissez :
- Un nom (ex. `TitreePage`)
- Un type de données (Texte, Nombre, Booléen, Enregistrement, Table, Couleur…)
- Une valeur par défaut
- Une description

À l'intérieur du composant, vous référencez la propriété avec la syntaxe `ComponentName.NomPropriete`. Depuis l'extérieur, l'instance se configure comme n'importe quel contrôle.

```
// À l'intérieur du composant "HeaderComp"
// Propriété d'entrée : TitrePage (type Texte)
// Le label lblTitre affiche la valeur passée depuis l'écran hôte

lblTitre.Text = HeaderComp.TitrePage
```

```
// Dans l'écran hôte, on configure l'instance du composant
HeaderComp1.TitrePage = "Tableau de bord"
```

### Propriétés de sortie (Output)

Une propriété de sortie permet au composant de **renvoyer une valeur** vers l'écran hôte. C'est là que beaucoup de débutants buttent : par défaut, un composant est une boîte noire. Si vous voulez récupérer ce que l'utilisateur a tapé dans un champ texte du composant, il faut explicitement l'exposer en sortie.

```
// Propriété de sortie "ValeurSaisie" (type Texte)
// Définie dans le composant comme :
ValeurSaisie = txtInput.Text

// Dans l'écran hôte, pour lire la valeur :
MonLabel.Text = MonComposant.ValeurSaisie
```

💡 **La propriété de sortie est une formule, pas une variable.** Elle se recalcule automatiquement quand la source change — exactement comme une cellule Excel qui référence une autre. Vous ne l'affectez pas, vous la définissez.

---

## Propriétés de comportement (fonctions)

C'est la fonctionnalité la plus puissante, et la moins utilisée. Une propriété de type **Comportement** permet d'exposer une action déclenchable depuis l'extérieur du composant — l'équivalent d'une méthode publique.

Cas typique : votre composant affiche un formulaire. Vous voulez qu'un bouton **dans l'écran hôte** puisse déclencher la validation du formulaire qui est **dans le composant**.

```
// Propriété de comportement "OnSave" dans le composant
// Définie côté composant :
If(
    IsBlank(txtNom.Text),
    Notify("Le nom est obligatoire", NotificationType.Error),
    Set(varSauvegardeOK, true)
)

// Appelée depuis l'écran hôte, sur le bouton "Enregistrer" :
btnEnregistrer.OnSelect = MonFormComp.OnSave()
```

⚠️ **Les propriétés de comportement ne peuvent pas retourner de valeur.** Si vous avez besoin d'un résultat, combinez une propriété de comportement (pour déclencher) et une propriété de sortie (pour lire le résultat après déclenchement).

---

## Construction progressive : un composant d'en-tête

Voici comment on développe un composant en partant du minimum viable jusqu'à une version robuste.

### V1 — L'en-tête statique

Un rectangle de fond, un label avec le titre, un logo. Pas de propriétés personnalisées. Ça fonctionne, mais c'est du copier-coller glorifié.

```
// Aucune propriété custom
// lblTitre.Text = "Mon Application"  ← codé en dur
```

### V2 — Propriétés d'entrée

On expose ce qui varie : le titre, la couleur de fond, et éventuellement la visibilité du bouton retour.

```
// Propriétés d'entrée définies :
// - TitrePage    : Texte     (défaut : "Application")
// - CouleurFond  : Couleur   (défaut : RGBA(0,120,212,1))
// - AfficherRetour : Booléen (défaut : false)

rectFond.Fill       = HeaderComp.CouleurFond
lblTitre.Text       = HeaderComp.TitrePage
btnRetour.Visible   = HeaderComp.AfficherRetour
```

### V3 — Comportement et sortie

On ajoute un comportement `OnRetourClick` pour que l'écran hôte gère lui-même la navigation quand l'utilisateur clique sur le bouton retour du composant.

```
// Propriété de comportement "OnRetourClick"
// Dans le composant, btnRetour.OnSelect :
HeaderComp.OnRetourClick()

// Dans chaque écran hôte, on câble la navigation :
HeaderComp1.OnRetourClick = Navigate(EcranAccueil, ScreenTransition.Fade)
```

Cette architecture sépare proprement la présentation (dans le composant) de la logique de navigation (dans l'app). Le composant ne sait pas où il est utilisé — c'est l'écran hôte qui décide.

---

## Les bibliothèques de composants

### Pourquoi une bibliothèque et pas juste un composant dans l'app

Un composant défini **dans** une app est local à cette app. Vous pouvez l'importer dans une autre app via **Insérer → Bibliothèques de composants → Importer**, mais c'est une copie statique : si l'original change, votre app ne le sait pas.

Une **bibliothèque de composants** est une application spéciale (type "Bibliothèque de composants") qui héberge des composants destinés au partage. Quand un composant de bibliothèque est mis à jour, les apps qui l'utilisent reçoivent une notification et peuvent accepter la mise à jour en un clic.

C'est la différence entre envoyer un fichier Word par email (copie statique) et partager un lien SharePoint (référence vivante).

### Créer et publier une bibliothèque

Depuis make.powerapps.com → **+ Créer → Bibliothèque de composants**.

L'interface est identique à Power Apps Studio, mais il n'y a pas d'écrans — uniquement l'onglet Composants. Vous créez vos composants normalement, puis vous **publiez** la bibliothèque. Publication ≠ Enregistrement : un composant sauvegardé mais non publié n'est pas visible par les autres apps.

💡 **Versioning implicite :** chaque publication crée une nouvelle version. Les apps connectées continuent d'utiliser l'ancienne version jusqu'à ce qu'un maker accepte la mise à jour. C'est un comportement voulu — ça évite de casser des apps en production par un changement non contrôlé.

### Connexion depuis une app

Dans Power Apps Studio : **Insérer → Bibliothèques de composants** → sélectionner votre bibliothèque → les composants apparaissent dans le panneau d'insertion comme des contrôles natifs.

Quand une mise à jour est disponible, une icône apparaît dans l'arborescence avec la mention "Mise à jour disponible". Le maker choisit d'accepter ou non — la mise à jour n'est jamais forcée.

### Organisation et gouvernance

Dans un contexte d'équipe ou d'entreprise, il est utile d'avoir une convention claire :

- **Une bibliothèque par domaine fonctionnel** (ex. `Lib-Navigation`, `Lib-Formulaires`, `Lib-Tableaux`) plutôt qu'une bibliothèque fourre-tout
- **Un propriétaire désigné** par bibliothèque — la bibliothèque est une app avec ses propres droits de partage
- **Documenter les propriétés** : la description de chaque propriété apparaît dans le tooltip de Power Apps Studio. C'est la seule documentation visible par les consommateurs sans ouvrir la bibliothèque

⚠️ **Droits d'accès :** pour qu'un utilisateur puisse utiliser un composant de bibliothèque dans ses apps, il doit avoir au minimum un accès **Utilisateur** sur la bibliothèque. Si la bibliothèque est dans un environnement différent de l'app, la connexion n'est pas possible — bibliothèque et app doivent être dans le même environnement.

---

## Cas d'utilisation réels

### Cas 1 — Barre de navigation cohérente

Une entreprise veut que toutes ses apps affichent la même barre latérale avec les mêmes items de menu, les mêmes couleurs et le même comportement d'accessibilité. Le composant `NavBarComp` expose :
- `Items` : Table des liens (Label, Icône, EcranCible)
- `EcranActif` : Texte pour mettre en surbrillance l'item courant
- `OnNavigation` : Comportement déclenché au clic, avec en paramètre l'écran cible

Les apps appellent `NavBarComp.OnNavigation()` et gèrent elles-mêmes le `Navigate()`. Quand le design system évolue, un seul composant mis à jour propage le changement à toutes les apps en attente de mise à jour.

### Cas 2 — Champ de saisie avec validation intégrée

Plutôt que de dupliquer la logique de validation dans chaque formulaire, un composant `ValidatedInput` encapsule un champ texte avec ses règles :
- `PlaceholderText`, `MaxLength`, `TypeValidation` (email, téléphone, requis) en entrée
- `Valeur` et `EstValide` en sortie
- Le composant gère lui-même l'affichage du message d'erreur inline

Dans l'écran hôte, vérifier `MonChamp.EstValide` suffit — la logique de validation ne se répète plus.

### Cas 3 — Indicateur de chargement

Un simple composant `SpinnerComp` avec une propriété d'entrée `Visible` (booléen). Il affiche un cercle animé centré sur l'écran avec un fond semi-transparent. Plutôt que de créer 3 contrôles dans chaque écran, un composant, une propriété, une ligne de formule :

```
// Dans l'écran, pendant une opération longue :
Set(varChargement, true);
Patch(MaTable, ...);
Set(varChargement, false)

// Le composant dans l'écran :
SpinnerComp1.Visible = varChargement
```

---

## Erreurs fréquentes

**Symptôme :** Les contrôles du composant ne réagissent pas aux changements de propriétés d'entrée en temps réel.
**Cause :** La valeur par défaut de la propriété a été utilisée à la place d'une formule dynamique. Par exemple, `TitrePage = "Accueil"` (statique) au lieu de `TitrePage = varTitrePage` dans l'écran hôte.
**Correction :** Vérifier que l'écran hôte référence bien une variable ou une expression, pas une valeur littérale.

---

**Symptôme :** "Vous ne pouvez pas référencer des contrôles de l'écran depuis l'intérieur d'un composant."
**Cause :** Tentative d'accès à une variable globale ou à un contrôle de l'app depuis la formule interne du composant. Les composants sont isolés.
**Correction :** Passer la valeur nécessaire via une propriété d'entrée. Les variables globales (`Set()`) sont accessibles en revanche — c'est l'accès direct aux contrôles qui est interdit.

---

**Symptôme :** La mise à jour d'un composant de bibliothèque ne se propage pas à l'app.
**Cause :** La bibliothèque a été enregistrée mais pas **publiée**, ou le maker de l'app n'a pas accepté la mise à jour.
**Correction :** Publier explicitement la bibliothèque (bouton Publier dans Studio), puis dans l'app consommatrice, accepter la mise à jour depuis l'indicateur dans le volet des composants.

---

**Symptôme :** Un composant disparaît ou se comporte bizarrement après import dans une autre app.
**Cause :** Import d'un composant depuis une app (pas une bibliothèque) — c'est une copie locale désynchronisée qui ne suit plus les évolutions de la source.
**Correction :** Migrer le composant vers une bibliothèque dédiée pour bénéficier du suivi de version.

---

## Bonnes pratiques

**Nommer les propriétés comme une API.** Un maker qui consomme votre composant ne verra que les noms de propriétés. `TitrePage`, `EstDesactive`, `OnValidation` sont explicites. `Prop1`, `texte`, `comportement` sont inutilisables sans documentation.

**Documenter chaque propriété.** Le champ Description est le seul endroit où un consommateur peut comprendre ce qu'attend une propriété sans ouvrir la bibliothèque. Remplissez-le systématiquement — même deux mots valent mieux que rien.

**Éviter les effets de bord dans les propriétés de sortie.** Une propriété de sortie doit être une formule pure (lecture seule). Ne jamais appeler `Set()`, `Patch()` ou `Navigate()` à l'intérieur. Ces actions appartiennent aux propriétés de comportement.

**Une bibliothèque par périmètre, pas une bibliothèque par composant.** Regrouper les composants par thème fonctionnel réduit le nombre de connexions à gérer dans les apps et simplifie la gouvernance.

**Tester le composant en isolation avant de le publier.** Créez un écran de test dans la bibliothèque avec toutes les configurations possibles du composant. Power Apps ne propose pas encore de tests unitaires natifs pour les bibliothèques — un écran de démo bien construit est votre filet de sécurité.

---

## Résumé

| Concept | Ce que c'est | À retenir |
|---|---|---|
| Composant | Groupe de contrôles encapsulé avec interface de propriétés | Isolé de l'app hôte — tout passe par les propriétés |
| Propriété d'entrée | Paramètre passé au composant depuis l'écran hôte | Type défini à la création, valeur par défaut requise |
| Propriété de sortie | Valeur calculée exposée par le composant | Formule, pas variable — se recalcule automatiquement |
| Propriété de comportement | Action déclenchable de l'extérieur | Ne retourne pas de valeur — combiner avec une sortie si besoin |
| Bibliothèque de composants | App spéciale qui héberge des composants partageables | Publication explicite requise, mise à jour opt-in |

Les composants transforment votre app d'une collection de contrôles en une architecture à couches : la présentation est encapsulée, l'interface est explicite, et la maintenance passe de "chercher et remplacer partout" à "mettre à jour une fois, accepter où c'est pertinent".

---

<!-- snippet
id: powerapps_composant_propriete_entree
type: concept
tech: Power Apps
level: intermediate
importance: high
format: knowledge
tags: composants, proprietes, canvas, power-apps, encapsulation
title: Propriété d'entrée d'un composant Canvas
content: Une propriété d'entrée permet à l'écran hôte de passer une valeur au composant. Elle est définie dans le panneau Propriétés du composant avec un type de données et une valeur par défaut. À l'intérieur du composant, elle est référencée par NomComposant.NomPropriete. L'écran hôte la configure comme n'importe quel attribut de contrôle. Le composant ne sait pas d'où vient la valeur — c'est l'encapsulation.
description: Interface d'entrée d'un composant Canvas — définie une fois dans le composant, configurée librement dans chaque instance de l'écran hôte.
-->

<!-- snippet
id: powerapps_composant_propriete_sortie
type: concept
tech: Power Apps
level: intermediate
importance: high
format: knowledge
tags: composants, sortie, formule, canvas, power-apps
title: Propriété de sortie — formule, pas variable
content: Une propriété de sortie expose une valeur calculée depuis le composant vers l'écran hôte. Elle se définit comme une formule (ex: ValeurSaisie = txtInput.Text) — elle se recalcule automatiquement quand la source change. On ne l'affecte pas avec Set(). Depuis l'hôte, on lit MonComposant.NomPropriete. Fonctionnement identique à une cellule Excel qui référence une autre.
description: Propriété de sortie = formule calculée dans le composant, lisible depuis l'hôte via MonComposant.NomPropriete — jamais affectée avec Set().
-->

<!-- snippet
id: powerapps_composant_comportement
type: concept
tech: Power Apps
level: intermediate
importance: high
format: knowledge
tags: composants, comportement, action, canvas, power-apps
title: Propriété de comportement — action déclenchable de l'extérieur
content: Une propriété de comportement expose une action Power Fx que l'écran hôte peut déclencher. Elle s'appelle depuis l'hôte avec MonComposant.NomAction(). Contrainte : elle ne retourne pas de valeur. Pour récupérer un résultat, combiner avec une propriété de sortie — le comportement modifie un état interne, la sortie expose cet état.
description: Propriété de comportement = méthode publique du composant. Appelée depuis l'hôte, ne retourne rien — combiner avec une sortie pour lire un résultat.
-->

<!-- snippet
id: powerapps_composant_isolation_variable
type: warning
tech: Power Apps
level: intermediate
importance: high
format: knowledge
tags: composants, isolation, erreur, canvas, scope
title: Composant Canvas — accès aux contrôles de l'app interdit
content: Piège : un composant Canvas ne peut pas référencer directement les contrôles de l'écran hôte (ex: lblTitre.Text depuis le composant). Conséquence : erreur de compilation ou comportement indéfini. Correction : passer la valeur via une propriété d'entrée. Les variables globales (Set) restent accessibles depuis le composant — seul l'accès direct aux contrôles est bloqué.
description: Depuis l'intérieur d'un composant, les contrôles de l'app hôte sont inaccessibles — tout échange passe obligatoirement par les propriétés.
-->

<!-- snippet
id: powerapps_bibliotheque_publication
type: warning
tech: Power Apps
level: intermediate
importance: high
format: knowledge
tags: bibliotheque, composants, publication, versioning, power-apps
title: Bibliothèque de composants — enregistrer ≠ publier
content: Piège fréquent : enregistrer la bibliothèque (Ctrl+S) ne rend pas la nouvelle version disponible aux apps consommatrices. Il faut cliquer explicitement sur Publier dans Power Apps Studio. Chaque publication crée une version. Les apps connectées voient l'indicateur "Mise à jour disponible" et acceptent la maj manuellement — jamais automatiquement.
description: Sans clic sur Publier, les apps consommatrices ne voient pas les modifications. La mise à jour est opt-in côté app — jamais forcée.
-->

<!-- snippet
id: powerapps_bibliotheque_meme_environnement
type: warning
tech: Power Apps
level: intermediate
importance: medium
format: knowledge
tags: bibliotheque, environnement, partage, gouvernance, power-apps
title: Bibliothèque et app consommatrice — même environnement obligatoire
content: Une bibliothèque de composants ne peut être connectée qu'à des apps dans le même environnement Power Apps. Impossible de référencer une bibliothèque d'un environnement DEV depuis une app en PROD. De plus, les consommateurs doivent avoir au minimum un accès Utilisateur sur la bibliothèque pour l'utiliser dans leurs apps.
description: Bibliothèque et app consommatrice doivent être dans le même environnement. Accès Utilisateur requis sur la bibliothèque pour les makers consommateurs.
-->

<!-- snippet
id: powerapps_composant_nommage_proprietes
type: tip
tech: Power Apps
level: intermediate
importance: medium
format: knowledge
tags: composants, nommage, documentation, bonnes-pratiques, canvas
title: Nommer les propriétés comme une API publique
content: Les noms de propriétés sont la seule interface visible par le consommateur du composant. Utiliser des noms explicites (TitrePage, EstDesactive, OnValidation) et remplir le champ Description de chaque propriété — c'est le seul tooltip visible dans Power Apps Studio sans ouvrir la bibliothèque. Éviter Prop1, texte, action qui forcent le consommateur à deviner.
description: Propriétés bien nommées + description renseignée = composant utilisable sans documentation externe. La description apparaît en tooltip dans Studio.
-->

<!-- snippet
id: powerapps_composant_sortie_sans_effets_bord
type: tip
tech: Power Apps
level: intermediate
importance: medium
format: knowledge
tags: composants, sortie, formule, bonnes-pratiques, power-apps
title: Propriétés de sortie — formules pures uniquement
content: Ne jamais appeler Set(), Patch() ou Navigate() dans une propriété de sortie. Ces actions provoquent des effets de bord difficiles à déboguer et violent le principe d'encapsulation. Les propriétés de sortie doivent être des formules de lecture (ValeurSaisie = txtInput.Text). Les actions appartiennent aux propriétés de comportement.
description: Propriété de sortie = formule pure sans Set/Patch/Navigate. Toute action appartient à une propriété de comportement.
-->

<!-- snippet
id: powerapps_composant_import_vs_bibliotheque
type: concept
tech: Power Apps
level: intermediate
importance: medium
format: knowledge
tags: bibliotheque, import, versioning, composants, power-apps
title: Import local vs bibliothèque — différence fondamentale
content: Importer un composant depuis une app (Insérer → Importer composant) crée une copie locale statique : aucun lien avec l'original, aucune notification de mise à jour. Une bibliothèque de composants maintient un lien vivant : quand la bibliothèque est publiée, les apps connectées reçoivent une notification et peuvent accepter la mise à jour. Pour tout partage d'équipe, utiliser une bibliothèque.
description: Import local = copie figée sans suivi. Bibliothèque = référence vivante avec versioning opt-in. Choisir la bibliothèque dès qu'un composant est partagé entre apps.
-->
