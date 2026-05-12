---
layout: page
title: "PCF Controls — Créer des composants personnalisés pour Power Apps et Model-Driven"

course: microsoft_power_platform
chapter_title: "Développement avancé Power Apps"

chapter: 1
section: 8

tags: [pcf, power apps component framework, typescript, react, model-driven, canvas, dataverse]
difficulty: advanced
duration: 180
mermaid: false

status: "published"
prev_module: "/courses/microsoft_power_platform/21_P1_10_composants_bibliotheques.html"
prev_module_title: "Composants et bibliothèques de composants"
next_module: "/courses/microsoft_power_platform/25_P1_14_performance_canvas_avancee.html"
next_module_title: "Performance avancée Canvas Apps"
---

# PCF Controls — Créer des composants personnalisés pour Power Apps et Model-Driven

## Objectifs pédagogiques

À l'issue de ce module, vous serez capable de :

1. **Expliquer** le cycle de vie d'un PCF control et le rôle de chaque méthode obligatoire
2. **Scaffolder et configurer** un projet PCF avec le Power Platform CLI
3. **Implémenter** un composant field et un composant dataset avec TypeScript et React
4. **Déboguer** localement un PCF dans le test harness avant déploiement
5. **Empaqueter et déployer** un PCF dans une solution Dataverse en respectant les contraintes ALM
6. **Tester** un composant React en isolation avec un contexte PCF mocké

---

## Mise en situation

Vous travaillez sur une application Model-Driven pour une équipe commerciale. Les commerciaux doivent visualiser en un coup d'œil le niveau d'avancement d'une opportunité — pas un texte, pas un champ pourcentage classique : une barre de progression colorée directement dans le formulaire, avec un code couleur contextuel (rouge / orange / vert selon le seuil). Rien dans le catalogue natif ne couvre ça correctement.

Deuxième besoin : une grille de vue enrichie sur l'entité `Account`, qui remplace la liste tabulaire par des cartes avec avatars, indicateurs KPI et navigation rapide.

Ces deux cas — un champ enrichi et une grille personnalisée — représentent exactement les deux patterns PCF que vous allez construire dans ce module.

---

## Contexte — Pourquoi le PCF existe

Power Apps impose par défaut des contrôles génériques : champs texte, listes déroulantes, grilles standards. Ils couvrent 80 % des besoins. Pour les 20 % restants — visualisations métier, interactions avancées, rendus spécifiques — la seule option avant le PCF était d'intégrer des iframes ou de tordre le bras aux formulaires avec du JavaScript non supporté.

Le **Power Apps Component Framework** (PCF), introduit en GA en 2019, répond à ce problème proprement : il expose une API standard pour créer des composants web encapsulés, qui s'intègrent nativement dans le cycle de rendu de Power Apps, ont accès au contexte Dataverse (métadonnées, valeurs, formatage), et sont déployés via des solutions comme n'importe quel autre artefact.

Un PCF n'est pas un plugin. Ce n'est pas non plus un web resource classique. C'est un composant UI — il vit dans le navigateur, reçoit des données du runtime Power Apps, et renvoie des valeurs via des callbacks. Le serveur n'est pas impliqué dans son cycle d'exécution.

---

## Principe de fonctionnement

### Les deux types de composants

🧠 **Field control** : s'associe à un champ unique d'un enregistrement. Il reçoit la valeur du champ, peut la modifier, et notifie Power Apps du changement. C'est le cas de la barre de progression ci-dessus.

🧠 **Dataset control** : s'associe à une vue ou une collection d'enregistrements. Il reçoit un dataset paginé avec des colonnes configurables. C'est le cas de la grille de cartes.

Ces deux types partagent la même interface TypeScript, mais leur contrat de données diffère fondamentalement.

### Le cycle de vie

Un PCF implémente une interface `IInputs` / `IOutputs` générée automatiquement, et quatre méthodes que le runtime appelle dans l'ordre suivant :

```
init()        → appelé une fois, au montage. Créer le DOM, initialiser React/libs.
updateView()  → appelé à chaque changement de données ou de contexte.
getOutputs()  → appelé par Power Apps pour lire la valeur à écrire en base.
destroy()     → nettoyage (event listeners, timers, instances React).
```

Ce pattern ressemble à un composant React (mount → render → unmount), mais ce n'est pas React par défaut — c'est vous qui choisissez si vous utilisez React, une lib tierce, ou du DOM natif.

💡 `updateView` est la méthode la plus sollicitée. Toute logique coûteuse (parsing, calculs, instanciations) doit être conditionnée à un changement réel de valeur — sinon vous re-rendez inutilement à chaque interaction sur le formulaire.

### Ce que le runtime fournit

À travers l'objet `context` disponible dans `init` et `updateView`, vous accédez à :

- `context.parameters` — les valeurs des champs liés (field) ou du dataset
- `context.formatting` — formateurs de dates, devises, nombres selon la locale de l'utilisateur
- `context.navigation` — navigation vers des enregistrements, ouverture de formulaires
- `context.utils` — lookupObjects, getEntityMetadata, etc.
- `context.device` — accès caméra/micro sur mobile
- `context.userSettings` — langue, timezone, rôles
- `context.mode` — état du contrôle : `isControlDisabled`, `isVisible`, `isCreateMode`

⚠️ Le contexte est en lecture seule. Vous ne modifiez jamais directement une valeur Dataverse depuis un PCF — vous notifiez le runtime via `notifyOutputChanged()` et il lira `getOutputs()` pour récupérer la nouvelle valeur.

---

## Installation et outillage

### Prérequis

```bash
# Node.js LTS (18.x ou 20.x recommandé)
node --version

# Power Platform CLI
npm install -g @microsoft/powerplatform-cli

# pac CLI — vérification
pac --version
# Attendu : pac for Power Platform version <VERSION>
```

Si vous travaillez en équipe, alignez la version du CLI dans votre `package.json` dev dependencies ou via un fichier `.nvmrc`. Rien de pire que des divergences de génération de code entre devs.

### Scaffolding d'un projet PCF

```bash
# Créer le dossier du composant
mkdir ProgressBarControl && cd ProgressBarControl

# Générer le squelette — type field
pac pcf init \
  --namespace Contoso \
  --name ProgressBarControl \
  --template field \
  --run-npm-install
```

Le CLI génère la structure suivante et installe les dépendances npm en une seule commande. Pour un dataset control, remplacer `field` par `dataset`.

```
ProgressBarControl/
├── ProgressBarControl/         ← code du composant
│   ├── index.ts                ← point d'entrée (les 4 méthodes)
│   ├── ControlManifest.Input.xml
│   └── css/ (optionnel)
├── package.json
└── pcfconfig.json
```

---

## Le manifest — le contrat du composant

Le `ControlManifest.Input.xml` est le fichier le plus important après `index.ts`. Il déclare tout ce que Power Apps doit savoir sur votre composant : ses propriétés d'entrée, ses sorties, ses ressources.

```xml
<?xml version="1.0" encoding="utf-8" ?>
<manifest>
  <control namespace="Contoso"
           constructor="ProgressBarControl"
           version="1.0.0"
           display-name-key="ProgressBarControl_DisplayName"
           description-key="ProgressBarControl_Desc"
           control-type="standard">

    <!-- Propriété liée au champ numérique (0-100) -->
    <property name="progressValue"
              display-name-key="progressValue_DisplayName"
              description-key="progressValue_Desc"
              of-type="Whole.None"
              usage="bound"
              required="true" />

    <!-- Seuil configurable par le maker (pas lié à un champ) -->
    <property name="warningThreshold"
              display-name-key="warningThreshold_DisplayName"
              description-key="warningThreshold_Desc"
              of-type="Whole.None"
              usage="input"
              required="false" />

    <resources>
      <code path="index.ts" order="1" />
      <css path="css/ProgressBarControl.css" order="1" />
    </resources>
  </control>
</manifest>
```

🧠 La distinction `usage="bound"` vs `usage="input"` est fondamentale :
- **bound** : lié à un champ Dataverse — la valeur est bidirectionnelle (lecture ET écriture possible).
- **input** : paramètre de configuration — le maker le fixe dans les propriétés du contrôle, sans lien avec un champ. Utile pour les seuils, couleurs, labels.

⚠️ Le type `of-type` doit correspondre exactement au type du champ Dataverse auquel vous liez la propriété. Un `Whole.None` sur une propriété `bound` n'acceptera que des champs de type Entier. Consultez la [documentation Microsoft sur les types PCF](https://learn.microsoft.com/en-us/power-apps/developer/component-framework/manifest-schema-reference/property) si vous manipulez des devises, lookups ou options sets.

---

## Construction progressive — Field Control

### v1 — Le squelette minimal

L'objectif ici : comprendre le flux avant d'ajouter de la complexité.

```typescript
// index.ts
import { IInputs, IOutputs } from "./generated/ManifestTypes";

export class ProgressBarControl
  implements ComponentFramework.StandardControl<IInputs, IOutputs> {

  private _container: HTMLDivElement;
  private _notifyOutputChanged: () => void;
  private _currentValue: number = 0;

  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    state: ComponentFramework.Dictionary,
    container: HTMLDivElement
  ): void {
    this._container = container;
    this._notifyOutputChanged = notifyOutputChanged;

    const bar = document.createElement("div");
    bar.id = "pcf-progress-bar";
    this._container.appendChild(bar);
  }

  public updateView(context: ComponentFramework.Context<IInputs>): void {
    const raw = context.parameters.progressValue.raw;
    this._currentValue = raw !== null ? raw : 0;

    const bar = this._container.querySelector("#pcf-progress-bar") as HTMLDivElement;
    if (bar) {
      bar.style.width = `${this._currentValue}%`;
      bar.style.height = "12px";
      bar.style.backgroundColor = this._getColor(this._currentValue);
      bar.style.borderRadius = "6px";
      bar.style.transition = "width 0.3s ease";
    }
  }

  private _getColor(value: number): string {
    if (value >= 70) return "#107C10";
    if (value >= 40) return "#FF8C00";
    return "#D13438";
  }

  public getOutputs(): IOutputs {
    return { progressValue: this._currentValue };
  }

  public destroy(): void {
    // Pas d'event listeners ici, rien à nettoyer
  }
}
```

Ce code fonctionne. La barre change de couleur selon la valeur du champ. Mais il a plusieurs faiblesses : pas de gestion du seuil configurable, pas de React, et le DOM est recréé à chaque `updateView`.

### v2 — Intégration du seuil configurable et React

Le passage à React simplifie la gestion du rendu. Plutôt que de manipuler le DOM manuellement, on rend un composant React dans `init` et on le met à jour avec `ReactDOM.render` dans `updateView`.

```bash
# Ajouter React au projet
npm install react react-dom
npm install --save-dev @types/react @types/react-dom
```

```typescript
// ProgressBar.tsx — composant React pur
import * as React from "react";

interface ProgressBarProps {
  value: number;
  warningThreshold: number;
  disabled?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, warningThreshold, disabled }) => {
  const getColor = (v: number, threshold: number): string => {
    if (v >= threshold) return "#107C10";
    if (v >= threshold * 0.6) return "#FF8C00";
    return "#D13438";
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", opacity: disabled ? 0.5 : 1 }}>
      <div style={{
        flex: 1,
        height: "12px",
        borderRadius: "6px",
        backgroundColor: "#f0f0f0",
        overflow: "hidden"
      }}>
        <div style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          height: "100%",
          backgroundColor: getColor(value, warningThreshold),
          transition: "width 0.3s ease"
        }} />
      </div>
      <span style={{ fontSize: "12px", color: "#666", minWidth: "32px" }}>
        {value}%
      </span>
    </div>
  );
};
```

```typescript
// index.ts — version React
import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { ProgressBar } from "./ProgressBar";

export class ProgressBarControl
  implements ComponentFramework.StandardControl<IInputs, IOutputs> {

  private _container: HTMLDivElement;

  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    state: ComponentFramework.Dictionary,
    container: HTMLDivElement
  ): void {
    this._container = container;
    this._renderComponent(context);
  }

  public updateView(context: ComponentFramework.Context<IInputs>): void {
    this._renderComponent(context);
  }

  private _renderComponent(context: ComponentFramework.Context<IInputs>): void {
    const value = context.parameters.progressValue.raw ?? 0;
    const threshold = context.parameters.warningThreshold.raw ?? 70;
    const isDisabled = context.mode.isControlDisabled;

    ReactDOM.render(
      React.createElement(ProgressBar, {
        value,
        warningThreshold: threshold,
        disabled: isDisabled
      }),
      this._container
    );
  }

  public getOutputs(): IOutputs {
    return {};
  }

  public destroy(): void {
    ReactDOM.unmountComponentAtNode(this._container);
  }
}
```

💡 `ReactDOM.render` dans `updateView` ne recrée pas le DOM entier — React fait son diff habituel. C'est précisément pourquoi l'utiliser est plus propre que manipuler le DOM manuellement dans `updateView`.

### v3 — Gestion complète des états disabled, readOnly et création

En production, votre composant sera appelé dans des formulaires en lecture seule, en mode création (valeur null), ou avec des champs désactivés. Ignorer ces états produit des bugs visuels et fonctionnels.

```typescript
// ProgressBar.tsx — version complète avec tous les états
import * as React from "react";

interface ProgressBarProps {
  value: number;
  warningThreshold: number;
  disabled: boolean;
  readOnly: boolean;
  isVisible: boolean;
  isCreateMode: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  warningThreshold,
  disabled,
  readOnly,
  isVisible,
  isCreateMode
}) => {
  // En mode création, la valeur peut être null → afficher un état vide neutre
  if (isCreateMode && value === 0) {
    return (
      <div style={{ height: "12px", borderRadius: "6px", backgroundColor: "#f0f0f0" }} />
    );
  }

  if (!isVisible) return null;

  const getColor = (v: number, threshold: number): string => {
    if (v >= threshold) return "#107C10";
    if (v >= threshold * 0.6) return "#FF8C00";
    return "#D13438";
  };

  const isInteractive = !disabled && !readOnly;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        opacity: disabled ? 0.5 : 1,
        cursor: isInteractive ? "default" : "not-allowed"
      }}
      aria-label={`Progression : ${value}%`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div style={{
        flex: 1,
        height: "12px",
        borderRadius: "6px",
        backgroundColor: "#f0f0f0",
        overflow: "hidden"
      }}>
        <div style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          height: "100%",
          backgroundColor: getColor(value, warningThreshold),
          transition: "width 0.3s ease"
        }} />
      </div>
      <span style={{ fontSize: "12px", color: "#666", minWidth: "32px" }}>
        {value}%
      </span>
    </div>
  );
};
```

```typescript
// index.ts — intégration complète des états dans _renderComponent
private _renderComponent(context: ComponentFramework.Context<IInputs>): void {
  const raw = context.parameters.progressValue.raw;

  // En mode création (isCreateMode), la valeur est souvent null au premier rendu
  const isCreateMode = context.mode.isCreateMode ?? false;
  const value = raw !== null ? raw : 0;
  const threshold = context.parameters.warningThreshold.raw ?? 70;

  ReactDOM.render(
    React.createElement(ProgressBar, {
      value,
      warningThreshold: threshold,
      disabled: context.mode.isControlDisabled,
      readOnly: context.parameters.progressValue.security?.readable === false,
      isVisible: context.mode.isVisible,
      isCreateMode
    }),
    this._container
  );
}
```

🧠 `context.mode.isCreateMode` est la clé pour éviter un champ qui affiche "0%" dès l'ouverture d'un formulaire vierge. Sur un formulaire de création, la valeur n'a pas encore été saisie — afficher un état neutre est plus correct qu'afficher la valeur par défaut.

---

## Construction progressive — Dataset Control

Le dataset control suit le même pattern de cycle de vie, mais `context.parameters` expose un objet `DataSet` à la place d'un champ simple.

### Anatomie d'un dataset

```typescript
public updateView(context: ComponentFramework.Context<IInputs>): void {
  const dataset = context.parameters.sampleDataSet;

  if (dataset.loading) return;

  const recordIds = dataset.sortedRecordIds;

  recordIds.forEach(id => {
    const record = dataset.records[id];
    const name = record.getFormattedValue("name");
    const revenue = record.getFormattedValue("revenue");

    // Navigation vers l'enregistrement depuis la grille de cartes
    // dataset.openDatasetItem(record.getNamedReference());
  });

  if (dataset.paging.hasNextPage) {
    dataset.paging.loadNextPage();
  }
}
```

🧠 Le dataset ne charge pas tous les enregistrements d'un coup — il pagine. La propriété `paging.pageSize` est configurable. Si vous construisez une grille de cartes avec scroll infini, vous devez gérer la pagination explicitement et accumuler les enregistrements dans un state local.

⚠️ Les colonnes disponibles dans `dataset.records[id].getFormattedValue()` sont uniquement celles déclarées dans la vue associée à votre composant. Si une colonne n'est pas dans la vue, elle n'existe pas dans le dataset — même si elle existe sur l'entité Dataverse.

---

## Débogage local avec le test harness

Avant de déployer, vous pouvez tester votre composant dans le navigateur sans solution Dataverse.

```bash
# Depuis le dossier du composant
npm start

# Le CLI compile et ouvre automatiquement :
# http://localhost:8181
```

Le test harness affiche votre composant avec des contrôles pour simuler les valeurs des propriétés. Vous pouvez modifier la valeur de `progressValue` en temps réel et observer le rendu.

💡 Le test harness ne simule pas parfaitement toutes les APIs du contexte. `context.navigation`, `context.utils.lookupObjects` et certaines APIs `device` retournent des stubs vides. Si votre composant dépend de ces APIs, testez directement dans un environnement de dev après packaging.

---

## Testing unitaire du composant React

C'est la partie souvent ignorée en développement PCF — et pourtant critique pour la maintenabilité en production. La bonne nouvelle : votre composant React (`ProgressBar.tsx`) est un composant React standard, testable avec Jest et React Testing Library sans toucher au contexte PCF.

### Setup

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
npm install --save-dev ts-jest @types/jest
```

```json
// jest.config.js (dans package.json ou fichier séparé)
{
  "preset": "ts-jest",
  "testEnvironment": "jsdom",
  "setupFilesAfterFramework": ["@testing-library/jest-dom"]
}
```

### Test du composant React en isolation

```typescript
// ProgressBar.test.tsx
import * as React from "react";
import { render, screen } from "@testing-library/react";
import { ProgressBar } from "./ProgressBar";

describe("ProgressBar", () => {
  const defaultProps = {
    value: 75,
    warningThreshold: 70,
    disabled: false,
    readOnly: false,
    isVisible: true,
    isCreateMode: false
  };

  it("affiche le pourcentage correct", () => {
    render(<ProgressBar {...defaultProps} />);
    expect(screen.getByText("75%")).toBeInTheDocument();
  });

  it("affiche un état neutre en mode création", () => {
    render(<ProgressBar {...defaultProps} value={0} isCreateMode={true} />);
    // Pas de label de pourcentage en mode création
    expect(screen.queryByText("0%")).not.toBeInTheDocument();
  });

  it("est invisible si isVisible est false", () => {
    const { container } = render(<ProgressBar {...defaultProps} isVisible={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("a l'attribut aria-valuenow correct", () => {
    render(<ProgressBar {...defaultProps} value={42} />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuenow", "42");
  });
});
```

### Tester la logique d'updateView avec un contexte mocké

Pour tester la logique de l'`index.ts` elle-même, mocker le contexte PCF est plus verbeux mais utile pour les cas critiques :

```typescript
// index.test.ts
import { ProgressBarControl } from "./index";

// Mock minimal du contexte PCF
const createMockContext = (value: number, threshold = 70) => ({
  parameters: {
    progressValue: { raw: value, security: { readable: true } },
    warningThreshold: { raw: threshold }
  },
  mode: {
    isControlDisabled: false,
    isVisible: true,
    isCreateMode: false
  }
});

describe("ProgressBarControl", () => {
  let control: ProgressBarControl;
  let container: HTMLDivElement;

  beforeEach(() => {
    control = new ProgressBarControl();
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    control.destroy();
    document.body.removeChild(container);
  });

  it("monte sans erreur et rend le composant", () => {
    control.init(
      createMockContext(50) as any,
      jest.fn(),
      {},
      container
    );
    expect(container.querySelector("[role='progressbar']")).toBeTruthy();
  });

  it("met à jour le rendu sur updateView", () => {
    control.init(createMockContext(50) as any, jest.fn(), {}, container);
    control.updateView(createMockContext(90) as any);
    expect(screen.getByText("90%")).toBeTruthy();
  });
});
```

🧠 Isoler la logique React dans un fichier `.tsx` séparé de l'`index.ts` n'est pas qu'une question de style — c'est ce qui rend les tests possibles sans simuler l'intégralité du contexte PCF. L'`index.ts` devient une fine couche d'orchestration, et toute la logique UI testable reste dans les composants React.

---

## Packaging et déploiement

### Créer le projet solution

Un PCF se déploie via une solution. Si vous n'avez pas encore de solution de déploiement, le CLI peut en créer une :

```bash
mkdir <NOM_SOLUTION>_Deployment && cd <NOM_SOLUTION>_Deployment

pac solution init \
  --publisher-name <PUBLISHER_NAME> \
  --publisher-prefix <PREFIX>

pac solution add-reference \
  --path ../ProgressBarControl
```

### Compiler et empaqueter

```bash
# Depuis le dossier de la solution
dotnet build
# Génère : bin/Debug/<NOM_SOLUTION>.zip
```

### Déployer vers l'environnement

```bash
# Authentification (si pas déjà fait)
pac auth create --url https://<ORG>.crm.dynamics.com

# Import de la solution
pac solution import \
  --path bin/Debug/<NOM_SOLUTION>.zip \
  --activate-plugins true
```

Après import, le composant apparaît dans le catalogue des contrôles personnalisés de votre environnement. Vous pouvez l'associer à un champ via le designer de formulaire (Model-Driven) ou le sélecteur de composants (Canvas).

💡 Pour un déploiement automatisé en pipeline, remplacez l'import manuel par un step `pac solution import` dans votre pipeline Azure DevOps ou GitHub Actions. Le module ALM précédent couvre ce pattern — la mécanique est identique pour les PCF.

---

## Cas d'utilisation concrets

### Cas 1 — Rating interactif (5 étoiles) sur un champ entier

Un champ `nps_score` (entier, 1-5) affiché comme 5 étoiles cliquables. L'utilisateur clique sur la 3e étoile → `notifyOutputChanged()` est appelé → `getOutputs()` retourne `{ nps_score: 3 }` → Power Apps écrit 3 dans Dataverse.

Points clés :
- `usage="bound"` sur la propriété `nps_score`
- `notifyOutputChanged` stocké dans `init`, appelé dans le handler de click React
- `getOutputs()` retourne la dernière valeur sélectionnée (stockée dans un state local `useRef` ou variable de classe)
- Gérer `context.mode.isCreateMode` : en création, `nps_score` est null → initialiser le state à 0, pas à null, pour éviter un rendu vide

### Cas 2 — Grille de cartes Account avec avatar

Dataset control sur l'entité `Account`. Chaque enregistrement est rendu comme une carte Material/Fluent avec le nom, le secteur, le chiffre d'affaires formaté (`context.formatting.formatCurrency`) et un clic qui ouvre le formulaire via `dataset.openDatasetItem`.

Points clés :
- Gestion du loading state (`dataset.loading`)
- Formatage via `context.formatting` pour respecter la locale
- Pagination avec scroll infini via `IntersectionObserver` : à chaque fois que le sentinel (dernier élément) entre dans le viewport, appeler `dataset.paging.loadNextPage()` et accumuler les enregistrements dans un `useRef` pour ne pas perdre les pages précédentes
- `dataset.openDatasetItem(record.getNamedReference())` déclenche la navigation vers le formulaire de l'entité

### Cas 3 — Signature numérique sur mobile

Un composant `canvas` (zone de dessin) qui capture une signature, la convertit en base64, et l'enregistre dans un champ texte ou une note via `notifyOutputChanged`. Sur mobile, utilise les événements touch ; sur desktop, les événements souris. Conditionnement via `context.device.isMobile`.

---

## Erreurs fréquentes

**Symptôme** : Le composant ne s'affiche pas dans la liste des contrôles disponibles après import.  
**Cause** : Le manifest déclare un type de propriété incompatible avec le champ cible (ex. `Decimal` sur un champ `Whole.None`).  
**Correction** : Vérifier l'alignement entre `of-type` dans le manifest et le type exact du champ Dataverse. Les types PCF sont plus granulaires que les types Dataverse affichés dans l'interface.

---

**Symptôme** : `updateView` est appelé en boucle infinie.  
**Cause** : `notifyOutputChanged()` est appelé dans `updateView` sans condition — ce qui déclenche un nouvel `updateView`, qui rappelle `notifyOutputChanged`, etc.  
**Correction** : N'appeler `notifyOutputChanged` que depuis des handlers d'événements utilisateur (click, input), jamais depuis `updateView`.

---

**Symptôme** : Memory leak — performances dégradées après navigation entre enregistrements.  
**Cause** : `destroy()` n'appelle pas `ReactDOM.unmount
