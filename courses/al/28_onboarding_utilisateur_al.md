---
layout: page
title: "Onboarding utilisateur AL"

course: al
chapter_title: "Mise en production et expérience utilisateur"

chapter: 8
section: 1

tags: al, business-central, onboarding, rolecenters, profiles, setup, configuration
difficulty: intermediate
duration: 90
mermaid: false

status: "published"
prev_module: "/courses/al/23_job_queue_async.html"
prev_module_title: "Job Queue & traitements asynchrones"
next_module: "/courses/al/24_performance_sql_al.html"
next_module_title: "Performance AL et SQL Backend"
---

# Onboarding utilisateur AL

## Objectifs pédagogiques

À l'issue de ce module, vous serez capable de :

1. **Concevoir** un profil utilisateur et un Role Center cohérents avec un métier cible
2. **Implémenter** des wizards d'Assisted Setup pour guider la configuration initiale
3. **Utiliser** les mécanismes natifs BC (Checklist, Teaching Tips, notifications) pour accompagner le premier démarrage
4. **Contrôler** la visibilité des fonctionnalités selon le profil actif en choisissant le bon outil entre `ApplicationArea` et `pagecustomization`
5. **Gérer** les états d'onboarding partiels, les reprises et les montées de version dans un contexte multi-tenant

---

## Mise en situation

Votre équipe livre une extension de gestion de flottes de véhicules pour une PME de transport. L'extension est fonctionnelle — les tables, les pages et la logique métier sont en place. Mais au premier démarrage, l'utilisateur arrive sur un Role Center vide, ne sait pas quoi paramétrer en premier, et appelle le support dans les 20 minutes.

Ce module ne parle pas de confort. Il parle de taux d'abandon, de tickets de premier niveau, et de notes AppSource. Un onboarding mal construit en AL, c'est deux étoiles au lieu de quatre sur la marketplace — et des coûts de support qui annulent la marge d'un projet.

L'objectif : construire l'expérience de premier démarrage, du Role Center métier jusqu'au wizard de configuration initiale, de façon à ce que l'utilisateur comprenne où il est et ce qu'il doit faire — sans appel support.

---

## Contexte — Pourquoi l'onboarding est un sujet AL à part entière

Beaucoup de développeurs traitent l'onboarding comme une question fonctionnelle : "les consultants formeront les utilisateurs". En SaaS multi-tenant, cette logique s'effondre. Quand une extension est installée depuis AppSource par un client en autonomie, il n'y a aucun consultant en salle.

Business Central embarque depuis la version 2020 un ensemble de mécanismes d'onboarding directement codables en AL : les **Assisted Setup**, la **Checklist** d'onboarding, les **Teaching Tips**, et les **Role Centers** personnalisables. Ces outils ne sont pas cosmétiques — ils réduisent concrètement le taux d'abandon à l'installation et les tickets de premier niveau.

La logique est la suivante : l'extension livrée doit être capable de se "présenter" elle-même à l'utilisateur, de le guider vers la configuration minimale, et de l'orienter vers les bons flux métier dès la page d'accueil.

---

## Réflexion architecturale — Choisir le bon outil

Avant d'écrire une ligne de code, trois questions se posent systématiquement. Y répondre au départ évite des refactorisations coûteuses.

### Assisted Setup ou page de configuration custom ?

Un développeur qui découvre le sujet est souvent tenté de créer une page `Card` de paramétrage et de la lier depuis le Role Center. C'est fonctionnel — mais invisible. L'utilisateur ne saura jamais qu'il doit l'ouvrir, ni dans quel ordre par rapport aux autres configurations.

L'Assisted Setup résout ce problème d'une autre façon : il s'agit d'un registre centralisé dans BC où **toutes** les extensions publient leurs wizards. L'utilisateur a un seul endroit pour voir ce qui reste à configurer. Si votre extension passe par ce mécanisme, elle bénéficie de cette centralité sans rien construire de plus. Si elle ne l'utilise pas, elle reste invisible dans un menu que personne n'ira chercher.

La règle est simple : tout ce qui doit être fait **une seule fois au démarrage** passe par Assisted Setup. Tout ce qui est **reconfigurable à volonté** passe par une page de setup dédiée, accessible depuis le Role Center à tout moment.

### Checklist ou Teaching Tips ?

Ce ne sont pas deux façons de faire la même chose.

La **Checklist** s'adresse à un utilisateur qui n'a encore rien fait. Elle s'active une fois, au premier démarrage, et guide vers des tâches concrètes : "configurer le dépôt", "ajouter un véhicule". Elle est orientée **actions** et disparaît quand tout est coché.

Les **Teaching Tips** (`AboutTitle`/`AboutText`) s'adressent à un utilisateur déjà dans l'interface, face à un champ spécifique qu'il ne comprend pas. Ils sont orientés **compréhension**. Ils apparaissent au contexte, pas au démarrage.

En pratique, ces deux mécanismes se complètent : la Checklist emmène l'utilisateur vers le bon endroit, les Teaching Tips lui expliquent ce qu'il voit une fois arrivé.

### `ApplicationArea` ou `pagecustomization` pour contrôler la visibilité ?

`ApplicationArea` est un filtre **global** : un champ ou une page marqué `ApplicationArea = Suite` n'apparaît pas si le tenant n'a pas activé cette fonctionnalité. C'est un mécanisme de licensing et de périmètre fonctionnel, pas de personnalisation par profil.

`pagecustomization` est un filtre **par profil** : il masque ou réorganise des éléments d'une page pour un profil donné, sans changer le comportement global. C'est ce qu'on utilise pour cacher la colonne "Limite de crédit" à un Fleet Manager qui n'en a rien à faire.

La règle : utilisez `ApplicationArea` pour contrôler ce qui existe selon le périmètre fonctionnel activé. Utilisez `pagecustomization` pour contrôler ce qui est visible selon le rôle métier de l'utilisateur.

---

## Les Role Centers — La porte d'entrée métier

### Ce qu'est vraiment un Role Center

Un Role Center n'est pas une simple page d'accueil. C'est une page de type `RoleCenter` qui agrège des **Parts** (cue groups, listes, graphiques, notifications) et qui est associée à un **Profile**. Quand un utilisateur se connecte, BC charge le profil actif et affiche le Role Center correspondant.

La relation est la suivante :
- un **Profile** porte un identifiant, un nom d'affichage, et un pointeur vers une page `RoleCenter`
- le **Role Center** est la page elle-même, construite avec des Parts
- un utilisateur peut changer de profil via les paramètres BC, ou l'administrateur peut l'affecter

🧠 Le Role Center conditionne aussi la **navigation** (les menus dans la barre supérieure) et les **actions rapides** accessibles. Ce n'est pas qu'une vue — c'est un contexte de travail complet.

### Déclarer un profil en AL

```al
profile "FLEET_MANAGER"
{
    Caption = 'Fleet Manager';
    ProfileDescription = 'Gestion de la flotte de véhicules';
    RoleCenter = FleetManagerRoleCenter;
    Customizations = FleetManagerCustomization;  // personnalisations de pages liées au profil
    Enabled = true;
    Promoted = true;                             // apparaît en tête de la sélection de profil
}
```

La page associée doit avoir `PageType = RoleCenter`. Elle ne contient pas de champs métier directs — elle agrège des `Part` :

```al
page 50100 FleetManagerRoleCenter
{
    PageType = RoleCenter;
    Caption = 'Fleet Manager';
    ApplicationArea = All;

    layout
    {
        area(RoleCenter)
        {
            part(FleetCuesPart; FleetCues)
            {
                ApplicationArea = All;
            }
            part(VehiclesInRevision; FleetVehicleList)
            {
                ApplicationArea = All;
                Caption = 'Véhicules en révision';
            }
        }
    }

    actions
    {
        area(Sections)
        {
            group(Vehicles)
            {
                Caption = 'Véhicules';
                action(VehicleListNav)
                {
                    RunObject = page FleetVehicleList;
                    Caption = 'Tous les véhicules';
                    ApplicationArea = All;
                }
            }
        }
    }
}
```

💡 Les Cue Groups (tuiles avec compteurs) sont particulièrement efficaces pour l'onboarding : ils donnent immédiatement un état de la situation. Un utilisateur qui voit "3 révisions en retard" comprend instantanément qu'il a quelque chose à faire — sans avoir à naviguer.

---

## Assisted Setup — Le wizard de configuration initiale

### Enregistrement dans la liste Assisted Setup

L'enregistrement se fait en souscrivant à l'event `OnRegisterAssistedSetup` de la codeunit système `Guided Experience`. Cet event est déclenché à chaque ouverture de la page Assisted Setup — votre subscriber sera donc appelé plusieurs fois. La méthode `InsertAssistedSetup` est idempotente grâce à la clé unique `ObjectType + ObjectId` : pas de doublon possible, même si le subscriber est appelé dix fois.

```al
codeunit 50101 FleetAssistedSetupRegister
{
    [EventSubscriber(ObjectType::Codeunit, Codeunit::"Guided Experience", 'OnRegisterAssistedSetup', '', true, true)]
    local procedure RegisterFleetSetup()
    var
        GuidedExperience: Codeunit "Guided Experience";
        Info: ModuleInfo;
    begin
        NavApp.GetCurrentModuleInfo(Info);   // récupère l'AppId de l'extension courante

        GuidedExperience.InsertAssistedSetup(
            'Configuration de la flotte',
            'Paramétrage initial Fleet Manager',
            'Configurez vos véhicules, dépôts et alertes de révision.',
            5,
            ObjectType::Page,
            Page::FleetSetupWizard,
            "Assisted Setup Group"::Extensions,
            '',
            '',
            ''
        );
    end;
}
```

⚠️ Utilisez toujours `NavApp.GetCurrentModuleInfo(Info)` pour récupérer l'AppId courant — ne codez jamais un GUID en dur. Si l'AppId ne correspond pas à l'extension qui enregistre, BC ne pourra pas associer l'état de complétion correctement.

### Construire le wizard

Un wizard BC est une page `NavigatePage`. La navigation entre étapes repose sur une variable entière `CurrentStep` qui contrôle la visibilité des groupes. Les saisies sont accumulées dans une table temporaire jusqu'à la confirmation finale — si l'utilisateur ferme le wizard à l'étape 2, rien n'est persisté.

```al
page 50102 FleetSetupWizard
{
    PageType = NavigatePage;
    Caption = 'Configuration Fleet Manager';
    SourceTable = FleetSetupBuffer;
    SourceTableTemporary = true;
    ApplicationArea = All;

    layout
    {
        area(Content)
        {
            group(Step1Welcome)
            {
                Visible = CurrentStep = 1;
                Caption = 'Bienvenue';
                field(WelcomeText; WelcomeLbl) { ShowCaption = false; }
            }
            group(Step2Depot)
            {
                Visible = CurrentStep = 2;
                Caption = 'Dépôt principal';
                field(DepotName; Rec.DepotName) { Caption = 'Nom du dépôt'; }
                field(DepotCity; Rec.DepotCity) { Caption = 'Ville'; }
            }
            group(Step3Done)
            {
                Visible = CurrentStep = 3;
                Caption = 'Configuration terminée';
                field(DoneText; DoneLbl) { ShowCaption = false; }
            }
        }
    }

    actions
    {
        area(Processing)
        {
            action(Back)
            {
                Caption = '< Précédent';
                Enabled = CurrentStep > 1;
                InFooterBar = true;
                trigger OnAction()
                begin
                    CurrentStep -= 1;
                    CurrPage.Update(false);
                end;
            }
            action(Next)
            {
                Caption = 'Suivant >';
                Enabled = CurrentStep < MaxStep;
                InFooterBar = true;
                trigger OnAction()
                begin
                    ValidateCurrentStep();
                    CurrentStep += 1;
                    CurrPage.Update(false);
                end;
            }
            action(Finish)
            {
                Caption = 'Terminer';
                Visible = CurrentStep = MaxStep;
                InFooterBar = true;
                trigger OnAction()
                begin
                    ApplySetup();
                    MarkAsCompleted();
                    CurrPage.Close();
                end;
            }
        }
    }

    var
        CurrentStep: Integer;
        MaxStep: Integer;
        WelcomeLbl: Label 'Ce wizard vous guidera à travers la configuration initiale de votre flotte.';
        DoneLbl: Label 'Votre flotte est prête. Vous pouvez maintenant ajouter vos véhicules.';

    trigger OnOpenPage()
    begin
        CurrentStep := 1;
        MaxStep := 3;
        Rec.Init();
        Rec.Insert();
    end;

    local procedure ApplySetup()
    var
        FleetSetup: Record "Fleet Setup";
    begin
        if not FleetSetup.Get() then begin
            FleetSetup.Init();
            FleetSetup.Insert(true);
        end;
        FleetSetup.DepotName := Rec.DepotName;
        FleetSetup.DepotCity := Rec.DepotCity;
        FleetSetup.Modify(true);
    end;

    local procedure MarkAsCompleted()
    var
        GuidedExperience: Codeunit "Guided Experience";
    begin
        GuidedExperience.CompleteAssistedSetup(ObjectType::Page, Page::FleetSetupWizard);
    end;

    local procedure ValidateCurrentStep()
    begin
        case CurrentStep of
            2:
                if Rec.DepotName = '' then
                    Error('Le nom du dépôt est obligatoire.');
        end;
    end;
}
```

💡 Ne bloquez jamais la fermeture du wizard via `Error()` sur l'action "Fermer". L'utilisateur doit toujours pouvoir abandonner et revenir plus tard. Validez uniquement à l'action "Terminer".

---

## Gestion des états d'onboarding — Détection, reprise et montée de version

C'est la partie la plus souvent absente des implémentations juniors, et pourtant la plus critique en production multi-tenant.

### Détecter si un wizard a déjà été complété

Avant de proposer ou de rejouer un wizard, vérifiez son état de complétion via `GuidedExperience.IsAssistedSetupComplete` :

```al
local procedure ShouldProposeSetup(): Boolean
var
    GuidedExperience: Codeunit "Guided Experience";
begin
    exit(not GuidedExperience.IsAssistedSetupComplete(ObjectType::Page, Page::FleetSetupWizard));
end;
```

Utilisez cette vérification dans votre Role Center ou dans une notification contextuelle pour proposer le wizard uniquement aux utilisateurs qui ne l'ont pas encore complété. Sur un tenant avec 50 utilisateurs, seuls ceux qui n'ont pas fait la configuration initiale doivent le voir.

### Comportement en contexte multi-tenant

L'état de complétion d'un Assisted Setup est stocké **par tenant et par entreprise** dans BC. Conséquences pratiques :

- Tenant A complète le wizard → Tenant B installe l'extension → Tenant B voit le wizard non complété. C'est le comportement attendu.
- Dans un groupe multi-entités avec un seul tenant et plusieurs entreprises BC, un utilisateur qui complète le wizard dans l'entreprise A ne le voit pas automatiquement complété dans l'entreprise B.

🧠 Cette isolation est une caractéristique du modèle SaaS BC, pas un bug. Votre extension doit le prévoir : ne partez jamais de l'hypothèse qu'un autre utilisateur ou une autre entité a déjà configuré quelque chose.

### Gestion des dépendances entre wizards

Dans une extension avec plusieurs modules, certains wizards dépendent d'autres. Par exemple, le wizard de géolocalisation n'a de sens que si le wizard principal est complété. Le pattern est direct :

```al
local procedure RegisterGeolocationSetup()
var
    GuidedExperience: Codeunit "Guided Experience";
begin
    // Ne propose la géolocalisation que si la configuration principale est faite
    if not GuidedExperience.IsAssistedSetupComplete(ObjectType::Page, Page::FleetSetupWizard) then
        exit;

    GuidedExperience.InsertAssistedSetup(
        'Configuration géolocalisation',
        'Connectez votre fournisseur GPS',
        'Activez le suivi temps réel de votre flotte.',
        10,
        ObjectType::Page,
        Page::FleetGeoSetupWizard,
        "Assisted Setup Group"::Extensions,
        '', '', ''
    );
end;
```

### Montée de version — Ne pas rejouer ce qui est déjà fait

Lors d'une mise à jour de l'extension qui introduit un nouveau wizard, seul ce nouveau wizard doit apparaître pour les clients existants. Les wizards déjà complétés restent marqués comme tels — `InsertAssistedSetup` est idempotent, il ne réinitialise pas l'état de complétion d'une entrée existante.

Pour une v2 qui ajoute le module de géolocalisation :

```al
[EventSubscriber(ObjectType::Codeunit, Codeunit::"Guided Experience", 'OnRegisterAssistedSetup', '', true, true)]
local procedure RegisterAllSetups()
begin
    RegisterFleetSetup();          // wizard v1 — déjà complété pour les clients existants, ignoré
    RegisterGeolocationSetup();    // wizard v2 — nouveau, s'affiche uniquement si pertinent
end;
```

Les clients existants voient uniquement le nouveau wizard. Les nouveaux clients voient les deux dans l'ordre logique.

---

## Checklist d'onboarding — Le guide de démarrage intégré

La Checklist est un panneau latéral qui s'affiche automatiquement pour les nouveaux utilisateurs. Elle liste des tâches à accomplir et coche au fur et à mesure. La différence fondamentale avec l'Assisted Setup : la Checklist s'active une fois, au premier démarrage, et disparaît une fois complétée. L'Assisted Setup reste accessible à tout moment depuis la roue dentée.

### Enregistrement d'une entrée Checklist

```al
codeunit 50103 FleetChecklistRegister
{
    [EventSubscriber(ObjectType::Codeunit, Codeunit::"Checklist", 'OnRegisterAssistedSetupInChecklist', '', true, true)]
    local procedure RegisterInChecklist()
    var
        Checklist: Codeunit "Checklist";
        TempAllProfile: Record "All Profile" temporary;
    begin
        AddProfileToTemp(TempAllProfile, 'FLEET_MANAGER');

        Checklist.InsertAssistedSetupTask(
            Page::FleetSetupWizard,
            1,
            TempAllProfile,
            false
        );
    end;

    local procedure AddProfileToTemp(var TempAllProfile: Record "All Profile" temporary; ProfileID: Code[30])
    var
        AllProfile: Record "All Profile";
    begin
        AllProfile.SetRange("Profile ID", ProfileID);
        if AllProfile.FindFirst() then begin
            TempAllProfile := AllProfile;
            TempAllProfile.Insert();
        end;
    end;
}
```

⚠️ Un `TempAllProfile` vide passé à `InsertAssistedSetupTask` est interprété par BC comme "aucune restriction de profil" — la Checklist s'affiche alors pour tous les utilisateurs de tous les profils, y compris les comptables et les administrateurs. Ce comportement découle du fait que l'absence de filtre est traitée comme "pas de restriction". Remplissez toujours explicitement la table temporaire avec les profils cibles.

Si votre extension sert plusieurs profils métier (Fleet Manager et Fleet Supervisor, par exemple), ajoutez-les tous dans `TempAllProfile` avant d'appeler `InsertAssistedSetupTask`. Un appel par entrée de checklist, un filtre par profil.

---

## Teaching Tips — Les explications contextuelles en ligne

Les Teaching Tips sont des bulles d'aide qui apparaissent la première fois qu'un utilisateur ouvre une page, pointant vers un champ ou une action spécifique. Ils ne remplacent pas la Checklist — ils la complètent en expliquant le "pourquoi" d'un champ une fois que l'utilisateur est dans l'interface.

```al
page 50104 FleetVehicleCard
{
    PageType = Card;
    SourceTable = FleetVehicle;

    layout
    {
        area(Content)
        {
            group(General)
            {
                field(LicensePlate; Rec.LicensePlate)
                {
                    Caption = 'Immatriculation';
                    ApplicationArea = All;
                    AboutTitle = 'L''immatriculation du véhicule';
                    AboutText = 'Saisissez la plaque d''immatriculation complète. Elle sera utilisée comme identifiant unique dans tous les flux de maintenance.';
                }
                field(NextRevisionDate; Rec.NextRevisionDate)
                {
                    Caption = 'Prochaine révision';
                    ApplicationArea = All;
                    AboutTitle = 'Date de révision';
                    AboutText = 'BC enverra automatiquement une alerte 30 jours avant cette date si les notifications sont activées dans la configuration.';
                }
            }
        }
    }
}
```

🧠 BC stocke l'état d'affichage des Teaching Tips dans les préférences utilisateur : chaque bulle est marquée "vue" après sa première apparition, et ne se réaffiche plus. Vous n'avez pas à gérer cet état — BC le fait pour vous. Si vous modifiez `AboutText` en v2, la bulle ne se réaffichera pas pour les utilisateurs qui l'ont vue en v1, sauf si vous changez la clé de la page (comportement BC standard, à anticiper si l'information mise à jour est critique).

---

## Contrôle de visibilité par profil

Un utilisateur "Fleet Manager" qui voit des champs de comptabilité dans son interface sera perdu — et ça, c'est un problème d'onboarding autant que d'UX. La visibilité pilotée par profil fait partie de l'expérience de démarrage.

Comme expliqué en réflexion architecturale : utilisez `pagecustomization` pour filtrer par profil, pas `ApplicationArea`.

```al
pagecustomization FleetManagerCustomization customizes "Customer List"
{
    layout
    {
        modify("Credit Limit (LCY)")
        {
            Visible = false;
        }
    }
}
```

Associez la personnalisation au profil via la propriété `Customizations` dans le bloc `profile` (voir déclaration du profil plus haut). Les personnalisations AL livrées avec l'extension s'appliquent à tous les utilisateurs du profil — elles ne sont pas modifiables par l'utilisateur final, contrairement aux personnalisations faites via l'interface BC.

---

## Erreurs fréquentes

**Le wizard ne s'affiche pas dans la liste Assisted Setup**

Symptôme : après déploiement, la page Assisted Setup ne contient pas l'entrée de l'extension.
Cause probable : l'event `OnRegisterAssistedSetup` n'a pas encore été déclenché (la page Assisted Setup n'a pas été ouverte depuis l'installation), ou l'AppId utilisé dans `InsertAssistedSetup` ne correspond pas à l'extension courante.
Correction : utilisez systématiquement `NavApp.GetCurrentModuleInfo(Info)` pour récupérer l'AppId — jamais un GUID codé en dur. Ouvrez manuellement la page Assisted Setup pour forcer le déclenchement de l'event.

---

**La checklist s'affiche pour tous les utilisateurs**

Symptôme : les comptables, administrateurs et tous les profils voient la checklist Fleet Manager.
Cause : `TempAllProfile` est vide ou non filtré dans `InsertAssistedSetupTask`. BC interprète l'absence de restriction comme "s'applique à tous" — pas comme "ne s'applique à personne".
Correction : remplissez explicitement la table temporaire via `AllProfile.SetRange("Profile ID", ...)` avant de la transmettre.

---

**Le wizard ne se marque pas comme complété**

Symptôme : l'utilisateur termine le wizard, l'entrée reste "non complétée" dans Assisted Setup.
Cause : `CompleteAssistedSetup` est appelé avec un `ObjectType` ou un `ObjectId` qui ne correspond pas exactement à ceux utilisés dans `InsertAssistedSetup`. BC fait une comparaison exacte sur la clé `ObjectType + ObjectId` pour mettre à jour l'état.
Correction : utilisez les mêmes constantes `ObjectType::Page` et `Page::FleetSetupWizard` dans les deux appels.

---

**Un utilisateur revoit le wizard déjà complété**

Symptôme : un utilisateur qui a terminé le wizard le retrouve non complété après une mise à jour de l'extension.
Cause : une montée de version a changé le numéro de page ou l'AppId de l'objet `FleetSetupWizard`. BC ne retrouve plus la clé et crée une nouvelle entrée non complétée.
Correction : ne changez jamais l'ID de la page wizard après la première publication. Si vous devez refactoriser, conservez l'ancien ID comme alias ou gérez la migration via un Upgrade Codeunit.

---

## Cas d'utilisation concrets

### Cas 1 — Extension AppSource sans accompagnement consultant

Un éditeur ISV publie son extension sur AppSource. L'installation déclenche automatiquement la Checklist d'onboarding, qui guide vers le wizard Assisted Setup. Le wizard demande le paramétrage minimal (dépôt, alertes). Une fois terminé, le Role Center métier est proposé comme profil par défaut. Un client qui installe en autonomie peut être opérationnel sans ticket support.

### Cas 2 — Déploiement interne multi-sites

Un intégrateur déploie une extension dans 8 entités d'un groupe. Chaque entité a son propre tenant. Grâce à `GuidedExperience.IsAssistedSetupComplete`, le wizard ne se repropose pas sur les tenants où la configuration a déjà été faite. L'isolation par tenant garantit que les données de configuration sont indépendantes entre entités.

### Cas 3 — Montée de version avec nouvelles fonctionnalités

Une v2 de l'extension ajoute un module de géolocalisation. Un nouvel Assisted Setup est enregistré pour ce module, avec une dépendance sur le wizard principal (`IsAssistedSetupComplete` vérifié avant l'enregistrement). Les clients existants voient apparaître ce nouveau wizard dans leur liste sans que l'onboarding initial soit rejoué.

---

## Bonnes pratiques

**Séparez configuration minimale et configuration avancée.** Un wizard d'onboarding ne configure que le strict minimum pour que l'extension soit fonctionnelle. Les paramètres avancés (seuils d'alerte, règles de gestion, intégrations) vont dans une page de setup dédiée accessible depuis le Role Center — pas dans le wizard.

**Testez votre onboarding comme un utilisateur, pas comme un développeur.** La bonne question n'est pas "est-ce que ça compile", c'est "si je n'ai jamais vu cette extension de ma vie, est-ce que je comprends ce que je dois faire dans les 3 premières minutes". Faites-le tester par quelqu'un qui n'a pas participé au développement.

**Gérez les déploiements multi-tenant proprement.** Dans un contexte SaaS, chaque tenant est indépendant. Vos Assisted Setup, Checklists et configurations initiales doivent fonctionner correctement sur un tenant vierge. N'assumez jamais que des données de base existent déjà.

**Ne bloquez pas la fermeture du wizard.** Résistez à la tentation de rendre certaines étapes obligatoires via `Error()` sur l'action "Fermer". L'utilisateur doit toujours pouvoir fermer et revenir plus tard. Validez uniquement à l'action "Terminer".

**Limitez les Teaching Tips aux champs réellement non évidents.** Un champ nommé "Nom du dépôt" n'a pas besoin d'une bulle. Une bulle sur chaque champ génère du bruit visuel et se retrouve ignorée. Réservez `AboutText` aux champs dont le comportement métier ou l'impact technique n'est pas immédiatement compréhensible.

---

## Résumé

| Concept | Ce qu'il fait | Quand l'utiliser |
|--------|---------------|-----------------|
| `profile` | Associe un identifiant métier à un Role Center et des personnalisations | Un profil par rôle métier distinct |
| `RoleCenter` (PageType) | Page d'accueil composée de Parts et d'actions de navigation | Toujours — c'est la porte d'entrée du rôle |
| Assisted Setup | Liste centrale des wizards de configuration | Configuration initiale, une seule fois |
| `NavigatePage` + table temporaire | Wizard multi-étapes
