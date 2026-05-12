---
layout: page
title: "Desktop Flows et RPA"

course: microsoft_power_platform
chapter_title: "Power Automate — Automatisation et Orchestration"

chapter: 2
section: 5

tags: power automate, desktop flows, rpa, power automate desktop, automatisation, ui automation
difficulty: intermediate
duration: 90
mermaid: false

status: "published"
prev_module: "/courses/microsoft_power_platform/31_P2_04_conditions_boucles_variables.html"
prev_module_title: "Conditions, boucles et variables — Pièges et comportements inattendus"
next_module: "/courses/microsoft_power_platform/36_P2_09_approbations_workflows_humains.html"
next_module_title: "Approbations et workflows humains"
---

# Desktop Flows et RPA

## Objectifs pédagogiques

À l'issue de ce module, vous serez capable de :

1. **Distinguer** un Desktop Flow d'un Cloud Flow et choisir lequel utiliser selon le contexte applicatif
2. **Installer et configurer** Power Automate Desktop avec la machine gateway pour exécuter des flows distants
3. **Construire** un flux d'automatisation desktop avec des sélecteurs robustes, des variables et une gestion d'erreurs sérieuse
4. **Intégrer** un Desktop Flow dans un Cloud Flow avec passage de paramètres et récupération des variables Output
5. **Anticiper** les pièges de l'unattended (sessions, popups, timing) et les corriger avant d'aller en production

---

## Mise en situation

Votre entreprise utilise un ERP vieillissant — pas d'API, pas d'export automatique, juste une interface Windows qui n'a pas changé depuis 2012. Chaque semaine, un collaborateur passe 45 minutes à copier des données de cet ERP vers un fichier Excel, puis à les consolider dans une feuille SharePoint. Le processus est répétitif, sans valeur ajoutée humaine, mais impossible à brancher directement sur un connecteur Power Automate classique.

C'est exactement la situation pour laquelle RPA existe. Power Automate Desktop va piloter l'application à votre place — en cliquant, en lisant, en tapant — comme le ferait un humain, mais de façon reproductible.

Avant même de construire quoi que ce soit, posez-vous cette question : **l'application a-t-elle une API REST documentée ?** Si oui, un Cloud Flow classique est plus simple, plus rapide et plus fiable. Si non — comme c'est le cas ici — le RPA est la bonne réponse.

> **Matrice décisionnelle rapide**
>
> | Situation | Approche recommandée |
> |---|---|
> | L'application expose une API REST | Cloud Flow direct |
> | Application web sans API | Desktop Flow (web automation) |
> | Application Windows sans API | Desktop Flow (UI automation) |
> | Processus 95% intégré + 1 écran legacy | Cloud Flow + Desktop Flow combinés |

---

## Contexte : pourquoi le RPA existe

Les Cloud Flows fonctionnent sur un principe simple : déclencher des actions via des API. SharePoint, Dataverse, Teams — tout ça expose des endpoints que Power Automate peut appeler proprement.

Mais une fraction non négligeable du parc applicatif en entreprise n'a pas d'API. Des applications métier développées il y a 20 ans, des outils installés en local, des PDF générés par des systèmes legacy — aucun connecteur ne peut les atteindre directement.

Le RPA répond à ce problème par une approche différente : **automatiser l'interface graphique elle-même**. Plutôt que de parler à une API, on pilote l'écran comme le ferait un utilisateur. L'outil observe les éléments visuels (boutons, champs, tableaux), interagit avec eux, et lit les résultats affichés.

🧠 **La distinction fondamentale** : les Cloud Flows automatisent des *services*, les Desktop Flows automatisent des *interfaces*. Les deux peuvent coexister dans le même processus — et c'est souvent là que la vraie valeur se trouve.

---

## ⚠️ Ce qui casse en production — à lire avant de construire

Avant d'écrire la moindre action, il faut comprendre les trois raisons principales pour lesquelles un Desktop Flow fonctionne parfaitement en dev et échoue en production.

**Sélecteurs auto-générés.** L'enregistreur de PAD génère des sélecteurs basés sur des attributs volatils : le texte exact d'un bouton, son index dans la hiérarchie, le nom de la fenêtre. Résultat concret : votre ERP passe de la version 2.3 à la version 2.4. Le titre de la fenêtre change de `"ERP Gestion v2.3"` à `"ERP Gestion v2.4"`. Le sélecteur auto-généré `window[Name="ERP Gestion v2.3"]` ne trouve plus rien. Le flow échoue immédiatement.

La correction est simple une fois qu'on la connaît : utiliser `AutomationId` à la place du texte. `button[AutomationId="BtnValider"]` ne contient aucune référence à une version — il survivra à la mise à jour.

**Timing.** Une application prend du temps à charger un écran, à afficher un résultat après un calcul. Si le flow tente de lire une valeur avant qu'elle soit affichée, il lit une chaîne vide. Sur votre machine de développement rapide, ça passe. Sur la VM de production moins bien allouée, ça échoue une fois sur trois. Un délai fixe (`Attendre 3 secondes`) ne résout pas le problème — il le masque sur votre machine mais pas sur une machine plus lente.

**Variables Output non déclarées.** Vous créez une variable dans PAD, vous la remplissez de données précieuses, le Desktop Flow se termine. Dans le Cloud Flow, vous regardez les sorties : vide. La cause : une variable locale dans PAD n'est pas automatiquement une sortie. Il faut la déclarer explicitement comme type "Sortie" dans le panneau Variables. C'est un oubli qui arrive à chaque premier flow, sans exception.

<!-- snippet
id: pad_selecteur_fragile_warning
type: warning
tech: power-automate-desktop
level: intermediate
importance: high
format: knowledge
tags: selecteur, rpa, ui-automation, robustesse, maintenance
title: Sélecteur auto-généré — ce qui casse après une mise à jour
content: Avant (sélecteur généré automatiquement) : window[Name="ERP Gestion v2.3"][Process="erp"] > button[Name="Valider"][Index=3]. Après la mise à jour v2.4 : le flow échoue sur "Impossible de trouver l'élément UI" car le nom de fenêtre a changé. Après correction (sélecteur robuste) : window[Process="erp"] > button[AutomationId="BtnValider"]. AutomationId est défini par le développeur de l'application, pas par son contenu affiché — il ne change pas à chaque version.
description: Retirer le nom de version et l'index des sélecteurs auto-générés. Utiliser AutomationId via UI Explorer — il survit aux mises à jour applicatives.
-->

<!-- snippet
id: pad_variable_output_declaration
type: warning
tech: power-automate-desktop
level: intermediate
importance: high
format: knowledge
tags: variables, output, desktop-flow, cloud-flow, integration
title: Variables Output — déclaration obligatoire dans PAD
content: Piège : créer une variable dans un Desktop Flow et y stocker un résultat ne suffit pas pour la rendre accessible au Cloud Flow appelant. Les sorties sont vides dans le Cloud Flow. Correction : dans PAD → panneau Variables (colonne de droite) → onglet "Sortie" → bouton "+" → nommer la variable (ex: ListeCommandes) → choisir le type (List, Text, Number). La variable doit être déclarée AVANT d'être utilisée dans le flow.
description: Variable locale PAD ≠ variable de sortie. Déclarer explicitement dans panneau Variables → onglet "Sortie" → "+" avant utilisation.
-->

<!-- snippet
id: pad_attente_element_ui
type: tip
tech: power-automate-desktop
level: intermediate
importance: high
format: knowledge
tags: timing, ui-automation, attente, robustesse, rpa
title: Pourquoi un délai fixe casse en production
content: Contre-exemple à éviter : "Attendre 5 secondes" → l'application charge en 3s sur votre poste, en 8s sur la VM de production → le flow lit une valeur vide. Bonne pratique : utiliser l'action "Attendre l'élément UI" avec une condition (état = Visible, état = Activé, contient une valeur). Le flow attend exactement le temps nécessaire, quelle que soit la machine. Exemple : attendre que le bouton "Valider" soit en état Activé avant de cliquer → fonctionne sur machine rapide et lente.
description: Délai fixe = fragile selon la machine. "Attendre l'élément UI" avec condition = robuste partout. La condition remplace le chronomètre.
-->

---

## Power Automate Desktop : l'environnement de travail

### Installation et configuration

Power Automate Desktop (PAD) est une application Windows gratuite, téléchargeable depuis [flow.microsoft.com](https://flow.microsoft.com) ou depuis le Microsoft Store. Elle est pré-installée sur Windows 11.

```
# Téléchargement manuel si non disponible via Store
https://go.microsoft.com/fwlink/?linkid=2102613

# Après installation : lancer Power Automate Desktop
# Se connecter avec le compte M365 de l'organisation
```

L'interface présente trois zones :

- **Le panneau d'actions** (gauche) — catalogue de toutes les actions classées par catégorie
- **Le canvas** (centre) — l'éditeur visuel où vous construisez le flux
- **Le panneau de variables** (droite) — toutes les variables déclarées, avec leurs valeurs en temps réel pendant l'exécution

💡 Le débogueur intégré permet d'exécuter le flow pas à pas, de poser des points d'arrêt et d'inspecter la valeur de chaque variable. Prenez l'habitude de l'utiliser dès le premier flow — c'est là que vous comprendrez ce qui se passe réellement.

### Machine gateway : le pont vers les Cloud Flows

Quand vous exécutez un Desktop Flow directement depuis PAD sur votre machine, c'est le mode **attended** — vous êtes devant l'écran, le flow tourne en premier plan.

Dans un scénario réel, vous voulez qu'un Cloud Flow déclenche l'automatisation automatiquement, sans intervention humaine. C'est le mode **unattended** — il nécessite une **machine gateway**.

La machine gateway est un enregistrement de votre machine Windows dans Power Platform. Elle permet au service cloud d'envoyer des instructions à votre machine locale via un agent installé.

**Configuration :**

1. Dans Power Automate Desktop → menu **Machine** → **Enregistrer cette machine**
2. Sélectionner l'environnement Power Platform cible
3. La machine apparaît dans [make.powerautomate.com](https://make.powerautomate.com) → **Surveiller** → **Machines**
4. Dans le Cloud Flow : connecteur **Power Automate Desktop** → action **Exécuter un flux de bureau**
5. Configurer : Machine = `<NOM_MACHINE>`, Desktop Flow = `<NOM_FLOW>`, Mode = Unattended

⚠️ Le mode unattended nécessite une licence **Power Automate Premium** + le **module complémentaire Unattended RPA**. En mode attended, Power Automate Premium seule suffit.

<!-- snippet
id: pad_machine_gateway_setup
type: command
tech: power-automate-desktop
level: intermediate
importance: high
format: knowledge
tags: machine-gateway, unattended, rpa, configuration, power-automate
title: Enregistrer une machine gateway dans PAD
context: Sur la machine Windows cible, dans Power Automate Desktop
command: Menu Machine → Enregistrer cette machine → sélectionner l'environnement Power Platform → Enregistrer
example: Menu Machine → Enregistrer cette machine → Environnement "Production ACME" → la machine "VM-RPA-PROD" apparaît dans make.powerautomate.com → Surveiller → Machines
description: Crée le pont entre Power Automate cloud et la machine locale. Nécessaire pour tout déclenchement unattended depuis un Cloud Flow.
-->

<!-- snippet
id: pad_attended_vs_unattended
type: concept
tech: power-automate-desktop
level: intermediate
importance: high
format: knowledge
tags: attended, unattended, licence, machine, rpa
title: Modes d'exécution : Attended vs Unattended
content: Attended = utilisateur connecté, flow en premier plan sur la session ouverte. Licence requise : Power Automate Premium. Unattended = exécution en arrière-plan sans session visible, déclenchée par Cloud Flow. Licence requise : Power Automate Premium + add-on Unattended RPA. Infrastructure requise : machine dédiée (physique ou VM) configurée pour ignorer les popups Windows et les mises à jour automatiques pendant les plages d'exécution. Toute interruption OS (alerte antivirus, dialogue de mise à jour, économiseur d'écran) peut intercepter le focus et faire échouer silencieusement le flow.
description: Attended = Premium seule. Unattended = Premium + add-on + machine dédiée sans interruptions. Ne pas tester en unattended sur le poste d'un développeur.
-->

---

## Construire un Desktop Flow : du simple au robuste

### Étape 1 — Le flow minimal (enregistrement)

La manière la plus rapide de démarrer est le **recorder** intégré. Vous lancez l'enregistrement, effectuez les actions manuellement, et PAD génère automatiquement les actions correspondantes.

```
# Dans PAD : Nouveau flow → bouton "Enregistrer"
# Effectuer les actions dans l'application cible
# Arrêter l'enregistrement → le flow est généré
```

Le résultat ressemble à ça :

```
// Flow généré automatiquement après enregistrement
Lancer l'application "C:\Program Files\MonERP\erp.exe"
Cliquer sur l'élément UI "Fenêtre:MainWindow > Bouton:BtnConnexion"
Remplir le champ texte "Fenêtre:MainWindow > TextBox:TxtLogin" avec "admin"
Remplir le champ texte "Fenêtre:MainWindow > TextBox:TxtPassword" avec "motdepasse123"
Cliquer sur "Fenêtre:MainWindow > Bouton:BtnValider"
```

Ce flow fonctionne dans votre configuration exacte. Dès que la fenêtre change de taille, que l'application met à jour sa version, ou que le texte d'un bouton change, les sélecteurs peuvent casser. C'est pourquoi on ne s'arrête pas là.

### Étape 2 — Sélecteurs robustes

Un sélecteur identifie un élément dans l'interface. Par défaut, l'enregistreur génère des sélecteurs basés sur la position ou le texte exact — ce qui est fragile, comme expliqué plus haut.

Pour modifier un sélecteur : double-cliquez sur l'action → bouton **Modifier le sélecteur** :

```
// Sélecteur fragile (généré automatiquement)
:desktop > window[Name="ERP Gestion v2.3"][Process="erp"] > 
  button[Name="Valider"][Index=3]

// Sélecteur robuste (revu manuellement)
:desktop > window[Process="erp"] > 
  button[AutomationId="BtnValider"]
```

En retirant l'index de position et le nom de fenêtre (qui contient le numéro de version), le sélecteur survivra aux mises à jour mineures. Pour trouver l'`AutomationId` d'un élément, utilisez l'outil **UI Explorer**.

<!-- snippet
id: pad_selecteur_automationid
type: tip
tech: power-automate-desktop
level: intermediate
importance: medium
format: knowledge
tags: selecteur, automationid, ui-explorer, robustesse, rpa
title: Trouver AutomationId avec UI Explorer
content: Dans PAD : menu Outils → UI Explorer → l'outil s'ouvre. Pointer l'élément cible dans l'application (bouton, champ, cellule). Dans le panneau de droite d'UI Explorer, inspecter les attributs listés. Chercher "AutomationId" en priorité — c'est un identifiant défini par le développeur de l'application, stable entre versions. Si absent, utiliser "Name" combiné au type de contrôle. Exemple de sélecteur final : ":desktop > window[Process='erp'] > button[AutomationId='BtnValider']". Éviter tout attribut contenant un numéro de version, un index ou des coordonnées écran.
description: Outils → UI Explorer dans PAD = équivalent DevTools pour applications Windows. AutomationId en priorité, Name en backup, jamais l'index.
-->

### Étape 3 — Variables, conditions et boucles

Un flow réel ne fait pas que cliquer à des endroits fixes. Il lit des données, prend des décisions, traite des listes.

Voici un exemple complet : extraire une liste de commandes depuis l'ERP, ligne par ligne, et préparer les données pour les retourner au Cloud Flow.

```
// Déclaration des variables de sortie (panneau Variables → Sortie)
// OUTPUT ListeCommandes (type: List)

SET NombreCommandes TO 0
SET ListeCommandes TO []

// Attendre que le tableau soit chargé avant de lire
Attendre l'élément UI "TableauCommandes" — état: Visible

// Récupérer le nombre de lignes dans le tableau
Obtenir le détail de l'élément UI "TableauCommandes"
  → Stocker dans: NombreLignes

// Boucler sur chaque ligne
LOOP Index FROM 1 TO NombreLignes

  // Attendre que la cellule soit disponible
  Attendre l'élément UI "TableauCommandes > Ligne[Index] > Colonne1" — état: Visible

  // Lire numéro de commande et montant
  Obtenir la valeur de la cellule UI "TableauCommandes > Ligne[Index] > Colonne1"
    → Stocker dans: NumCommande
  Obtenir la valeur de la cellule UI "TableauCommandes > Ligne[Index] > Colonne2"
    → Stocker dans: Montant

  // Ajouter à la liste de sortie
  Ajouter l'élément à la liste %ListeCommandes% : {NumCommande: NumCommande, Montant: Montant}

  SET NombreCommandes TO NombreCommandes + 1

END LOOP

// ListeCommandes est déclarée en Sortie → disponible dans le Cloud Flow
```

💡 Notez les appels à "Attendre l'élément UI" avant chaque lecture : c'est ce qui rend le flow robuste, quelle que soit la vitesse de la machine d'exécution.

### Étape 4 — Gestion des erreurs

Sans gestion d'erreurs, un sélecteur qui ne trouve pas son élément fait planter le flow entier — et le Cloud Flow parent reçoit une erreur générique sans contexte utile.

Dans PAD, chaque action a un onglet **En cas d'erreur** qui configure le comportement en cas d'échec :

```
// Configuration sur l'action "Cliquer sur BtnConnexion"
En cas d'erreur :
  → Continuer et stocker le message dans: ErreurConnexion
  → Exécuter la sous-routine: GestionErreurConnexion

// Sous-routine GestionErreurConnexion
IF ErreurConnexion IS NOT EMPTY THEN
  Écrire dans le journal: "Échec connexion ERP : " + ErreurConnexion
  Fermer l'application "erp.exe"
  THROW ErreurConnexion  // Propager vers le Cloud Flow
END IF
```

<!-- snippet
id: pad_error_handling_throw
type: tip
tech: power-automate-desktop
level: intermediate
importance: medium
format: knowledge
tags: gestion-erreurs, throw, sous-routine, robustesse, rpa
title: Propager une erreur de PAD vers le Cloud Flow avec THROW
content: Structure complète : (1) Sur l'action critique, onglet "En cas d'erreur" → "Continuer" → stocker message dans variable ErreurMsg. (2) Créer une sous-routine "GestionErreur". (3) Dans la sous-routine : IF ErreurMsg IS NOT EMPTY THEN → écrire dans journal → fermer application cible → THROW ErreurMsg → END IF. Sans THROW, le Cloud Flow peut afficher "Réussi" alors que le Desktop Flow a silencieusement échoué et n'a rien traité. THROW force le Cloud Flow à entrer dans sa propre logique d'erreur (retry, notification, log).
description: Sans THROW explicite dans PAD, une erreur gérée localement peut laisser le Cloud Flow croire que tout s'est bien passé. THROW force la propagation.
-->

---

## Intégration Desktop Flow ↔ Cloud Flow : exemple end-to-end

C'est là que tout s'assemble. Voici un scénario complet : le Cloud Flow récupère les paramètres de filtrage depuis SharePoint, passe une date au Desktop Flow, qui extrait les commandes de l'ERP et les retourne, puis le Cloud Flow crée les enregistrements Dataverse correspondants.

```
// CLOUD FLOW — Schéma complet

[Déclencheur : Planification hebdomadaire — tous les lundis 06h00]
    ↓
[Action : Obtenir élément SharePoint "Config/DateDebutExtraction"]
  → Résultat : DateDebut = "2024-11-01"
    ↓
[Action : Exécuter un flux de bureau]
  - Machine: "VM-RPA-PROD"
  - Desktop Flow: "Extraction ERP Commandes"
  - Mode: Unattended
  - Paramètre d'entrée: DateDebut = @{outputs('Obtenir_élément')?['body/DateDebut']}
  → Sortie: ListeCommandes (JSON array)
    ↓
[Action : Parser JSON — schéma [{NumCommande: string, Montant: number}]]
  → Corps: @{outputs('Exécuter_flux_bureau')?['body/ListeCommandes']}
    ↓
[Action : Pour chaque commande dans ListeCommandes]
  → [Action : Créer un enregistrement Dataverse]
       Table: Commandes
       NumCommande: @{items('Pour_chaque')?['NumCommande']}
       Montant: @{items('Pour_chaque')?['Montant']}
       StatutImport: "Importé"
    ↓
[Action : Envoyer email de confirmation]
  - Objet: "Import ERP terminé — @{length(outputs('Parser_JSON')?['body'])} commandes"
```

**Ce qui se passe côté Desktop Flow :** il reçoit `DateDebut` comme paramètre d'entrée (déclaré dans le panneau Variables → onglet "Entrée"), extrait les lignes correspondantes de l'ERP, et retourne `ListeCommandes` via la variable de sortie. Le Cloud Flow n'a aucune logique d'interaction UI — il orchestre, le Desktop Flow interagit.

**Comment mapper les sorties dans le connecteur :** dans l'action "Exécuter un flux de bureau" du Cloud Flow, les sorties apparaissent automatiquement dans le sélecteur de contenu dynamique une fois le Desktop Flow sélectionné — à condition que les variables de sortie soient correctement déclarées dans PAD.

<!-- snippet
id: pad_desktop_flow_concept
type: concept
tech: power-automate-desktop
level: intermediate
importance: high
format: knowledge
tags: rpa, desktop-flow, cloud-flow, ui-automation, power-automate
title: Desktop Flow vs Cloud Flow — différence et complémentarité
content: Cloud Flow = automatise des services via API (SharePoint, Dataverse, Teams, HTTP). Desktop Flow = automatise une interface graphique (clics, saisies, lectures d'écran) sans API. Les deux coexistent dans le même processus : le Cloud Flow orchestre (déclencheur, logique métier, autres services), passe des paramètres d'entrée au Desktop Flow, et récupère les variables Output. Exemple : Cloud Flow récupère une date depuis SharePoint → passe au Desktop Flow → Desktop Flow extrait des commandes ERP → retourne ListeCommandes → Cloud Flow crée les enregistrements Dataverse. Si l'application a une API REST : Cloud Flow direct. Si elle n'en a pas : Desktop Flow.
description: Cloud Flow = API et orchestration. Desktop Flow = interaction UI sans API. Complémentaires : le Cloud Flow commande, le Desktop Flow exécute sur l'écran.
-->

<!-- snippet
id: pad_separation_responsabilites
type: tip
tech: power-automate-desktop
level: intermediate
importance: medium
format: knowledge
tags: architecture, desktop-flow, cloud-flow, maintenabilite, rpa
title: Frontière claire entre Desktop Flow et Cloud Flow
content: Desktop Flow doit retourner des données brutes uniquement (ex: ListeCommandes avec NumCommande et Montant). Cloud Flow applique la logique métier : vérifier si Montant > 10000€ ET client dans liste approuvée → créer enregistrement Dataverse avec statut "À valider". Cette séparation a une conséquence pratique : quand l'ERP change d'interface, vous ne modifiez que le Desktop Flow. Quand la règle métier change, vous ne modifiez que le Cloud Flow. Un Desktop Flow avec 50+ actions et des conditions complexes mélange les deux couches et devient impossible à maintenir.
description: Desktop Flow = données brutes depuis l'UI. Cloud Flow = logique métier, filtres, conditions, appels à d'autres services. Modifier l'UI ne doit pas impacter la logique métier.
-->

---

## Erreurs fréquentes

**Sélecteur qui casse après une mise à jour de l'application**
*Symptôme :* Le flow échoue avec "Impossible de trouver l'élément UI" après une mise à jour.
*Cause :* Le sélecteur contient le nom exact de la fenêtre avec le numéro de version, un index de position, ou le texte exact d'un bouton qui a changé.
*Correction :* Ouvrir UI Explorer → inspecter l'élément → remplacer par `AutomationId`. Si l'application ne définit pas d'`AutomationId`, utiliser `Name` combiné au type de contrôle sans index. Tester en modifiant artificiellement le titre de la fenêtre pour valider la robustesse.

**Timing : l'action s'exécute avant que l'interface soit prête**
*Symptôme :* Le flow lit une valeur vide, ou clique sur un bouton sans effet.
*Cause :* L'application charge un écran, un calcul, ou une requête en arrière-plan — et le flow n'attend pas.
*Correction :* Remplacer tout `Attendre [N secondes]` par `Attendre l'élément UI` avec une condition (Visible, Activé, contient une valeur). Valider en mode pas-à-pas avec le débogueur pour confirmer que la condition est bien atteinte avant l'action suivante.

**Variables de sortie absentes dans le Cloud Flow**
*Symptôme :* Dans le Cloud Flow, les champs de sortie du Desktop Flow sont vides ou n'apparaissent pas dans le contenu dynamique.
*Cause :* Les variables ont été créées et utilisées localement dans PAD sans être déclarées comme "Sortie".
*Correction :* Panneau Variables → onglet "Sortie" → bouton "+" → nommer et typer la variable → l'utiliser dans le flow. Republier le Desktop Flow pour que les nouvelles sorties soient visibles dans le connecteur Cloud Flow.

**Flow unattended bloqué par une popup Windows**
*Symptôme :* La machine gateway est connectée, le Cloud Flow indique "Succès", mais rien n'a été traité. Ou le flow échoue sur la première action.
*Cause :* Une interruption OS a intercepté le focus — dialogue de mise à jour Windows Update, alerte antivirus, économiseur d'écran, notification Teams sur la machine.
*Correction :* Configurer Windows Update pour les heures creuses en dehors des plages d'exécution. Désactiver les notifications de bureau sur la machine dédiée. Ajouter en début de flow une vérification : chercher et fermer les fenêtres de dialogue Windows connues avant de lancer l'application cible. Ajouter un log "Flow démarré" comme première action pour distinguer "flow non démarré" de "flow démarré mais bloqué".

**Session verrouillée bloquant l'exécution unattended**
*Symptôme :* Le flow s'exécute en mode unattended mais ne peut pas interagir avec l'interface — les clics n'ont aucun effet.
*Cause :* La session Windows de l'utilisateur de service s'est verrouillée suite à une inactivité, une politique GPO, ou un redémarrage non planifié.
*Correction :* Configurer la stratégie de groupe (GPO) de la machine pour désactiver le verrouillage automatique sur le compte de service. Vérifier que le compte de service utilisé par PAD est configuré pour ne pas expirer ni se verrouiller. Ajouter une alerte dans le Cloud Flow si le Desktop Flow échoue deux fois consécutivement — signe probable d'un problème de session.

---

## Bonnes pratiques

**Nommer les actions de façon lisible.** PAD génère des noms comme "Cliquer sur l'élément UI 3". Renommez chaque action : "Cliquer sur Bouton Valider Commande". Vous gagnerez du temps lors des corrections — et l'historique Git sera lisible.

**Centraliser les sélecteurs dans des variables.** Si le même sélecteur est utilisé à plusieurs endroits, stockez-le dans une variable en début de flow. Si l'application change, vous modifiez un seul endroit.

**Tester toujours dans les conditions de production.** La VM de production est souvent plus lente, avec moins de RAM, et des politiques Windows différentes de votre poste de dev
