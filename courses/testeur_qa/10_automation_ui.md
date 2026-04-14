---
layout: page
title: "Automatisation des tests UI avec Playwright"

course: testeur_qa
chapter_title: "Automatisation des tests (UI)"

chapter: 5
section: 1

tags: playwright, test-ui, automatisation, selenium, end-to-end, locators, assertions
difficulty: intermediate
duration: 120
mermaid: false

status: "published"
prev_module: "/courses/testeur_qa/17_framework_test.html"
prev_module_title: "Architecture de framework de test"
next_module: "/courses/testeur_qa/07_test_data.html"
next_module_title: "Gestion des données de test"
---

# Automatisation des tests UI avec Playwright

## Objectifs pédagogiques

À la fin de ce module, tu seras capable de :

1. **Distinguer** les cas où l'automatisation UI apporte une vraie valeur de ceux où elle génère de la dette technique
2. **Configurer** Playwright dans un projet Node.js et lancer une première suite de tests
3. **Identifier** des éléments de page de façon robuste avec les locators recommandés
4. **Écrire** des tests end-to-end maintenables avec des assertions claires et des structures adaptées
5. **Organiser** tes tests avec le pattern Page Object Model pour un projet qui dure

---

## Mise en situation

Tu rejoins une équipe qui livre une application web de gestion de tâches. Chaque sprint, les développeurs cassent accidentellement le formulaire de connexion ou le drag-and-drop de la Kanban board — sans s'en rendre compte avant la recette manuelle. La cheffe de projet perd deux jours par sprint à re-tester les mêmes flux critiques.

Ta mission : automatiser les parcours utilisateur les plus risqués — connexion, création de tâche, changement de statut — pour que la CI détecte ces régressions en 3 minutes, pas en 2 jours.

C'est exactement le terrain de jeu de Playwright.

---

## Pourquoi automatiser les tests UI — et pourquoi pas

Les tests manuels ne disparaissent pas avec l'automatisation. Ils deviennent plus ciblés. L'idée, c'est de confier à la machine ce qu'elle fait mieux que toi : répéter exactement les mêmes actions, cent fois, sans fatigue, à chaque commit.

Mais l'automatisation UI a une réputation sulfureuse — souvent méritée. Des suites de tests fragiles, qui tombent pour un pixel déplacé ou un timeout arbitraire, finissent systématiquement ignorées. La règle d'or : **n'automatise que ce qui vaut le coût de maintenance**.

Ce qui justifie l'investissement :

- Les parcours critiques répétés à chaque release (connexion, paiement, inscription)
- Les régressions récurrentes sur des fonctionnalités stables
- Les flux trop longs pour être re-testés manuellement à chaque PR

Ce qui ne le justifie pas :

- Les fonctionnalités encore en cours de design — l'UI change trop vite
- Les cas déjà couverts efficacement par des tests API ou unitaires
- Les "nice to have" qui ne couvrent aucun risque réel

**Selenium, Cypress ou Playwright ?** Le marché a bougé. Selenium reste présent dans les projets legacy. Cypress est apprécié des équipes JS pour son ergonomie. Playwright s'impose aujourd'hui comme la référence pour trois raisons concrètes : fiabilité, support multi-navigateurs natif (Chromium, Firefox, WebKit) et auto-waiting intelligent — il attend automatiquement qu'un élément soit prêt avant d'agir dessus, ce qui élimine la principale cause de flakiness. C'est ce qu'on utilise dans ce module.

---

## Installation et configuration

Playwright s'installe en une commande et télécharge lui-même les navigateurs dont il a besoin.

```bash
npm init -y
npm init playwright@latest
```

L'assistant interactif te pose quelques questions : TypeScript ou JavaScript, dossier des tests, GitHub Actions. Prends les valeurs par défaut pour commencer. Il génère cette structure :

```
playwright.config.ts       ← configuration centrale
tests/
  example.spec.ts          ← exemple à supprimer
tests-examples/            ← référence utile à garder
```

Vérifie que tout fonctionne :

```bash
npx playwright test                   # lance tous les tests
npx playwright test --ui              # interface graphique — recommandé pour déboguer
npx playwright show-report            # rapport HTML après exécution
```

Le fichier de config mérite qu'on s'y attarde, parce qu'il conditionne le comportement de toute la suite :

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,                        // timeout par test
  retries: process.env.CI ? 2 : 0,        // retry automatique en CI uniquement
  use: {
    baseURL: 'http://localhost:3000',      // base pour tous les goto('/chemin')
    screenshot: 'only-on-failure',         // capture auto en cas d'échec
    trace: 'on-first-retry',              // trace complète sur le premier retry
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
  ],
});
```

💡 Le champ `baseURL` est particulièrement précieux : il te permet d'écrire `await page.goto('/login')` au lieu de répéter l'URL complète dans chaque test. Tu changes l'environnement (local, staging, prod) en modifiant une seule ligne — ou via une variable d'environnement en CI.

---

## Anatomie d'un test Playwright

Voici un test complet, commenté ligne par ligne, pour que la syntaxe soit claire avant d'aller plus loin :

```typescript
// tests/login.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Connexion utilisateur', () => {   // groupe logique de tests

  test('connexion avec des identifiants valides', async ({ page }) => {
    // `page` est injecté automatiquement — c'est le contrôleur du navigateur

    await page.goto('/login');
    // navigue vers baseURL + '/login'. Le `await` est obligatoire partout.

    await page.getByLabel('Email').fill('alice@example.com');
    // locator recommandé : cible le label visible, résistant aux changements CSS

    await page.getByLabel('Mot de passe').fill('secret123');

    await page.getByRole('button', { name: 'Se connecter' }).click();
    // cible un bouton par son rôle ARIA et son texte visible

    await expect(page).toHaveURL('/dashboard');
    // Playwright attend automatiquement que l'URL corresponde

    await expect(page.getByText('Bienvenue, Alice')).toBeVisible();
  });

  test('affiche une erreur avec un mauvais mot de passe', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('alice@example.com');
    await page.getByLabel('Mot de passe').fill('mauvais');
    await page.getByRole('button', { name: 'Se connecter' }).click();

    await expect(page.getByRole('alert')).toContainText('Identifiants invalides');
  });

});
```

🧠 Le mot-clé `async/await` est partout parce que chaque interaction avec le navigateur est asynchrone. Oublier un `await` ne génère pas forcément d'erreur immédiate — le test peut sembler passer alors qu'il n'a rien vérifié. C'est l'un des pièges les plus sournois, et on y revient dans la section sur les erreurs fréquentes.

---

## Choisir les bons locators — la décision qui fait tout

C'est ici que la plupart des suites deviennent fragiles. Un locator qui cible une classe CSS générée automatiquement (`div.sc-1a2b3c`) cassera au prochain build. Un locator qui cible le texte ou le rôle visible par l'utilisateur résiste aux refactorisations.

Playwright propose une hiérarchie claire :

```typescript
// ✅ PRIORITÉ 1 — Locators sémantiques
page.getByRole('button', { name: 'Valider' })      // rôle ARIA + texte visible
page.getByLabel('Email')                             // champ de formulaire via son label
page.getByPlaceholder('Rechercher...')               // via le placeholder
page.getByText('Bienvenue')                          // par contenu textuel
page.getByAltText('Logo de l\'entreprise')           // image par son attribut alt

// ✅ PRIORITÉ 2 — Attribut dédié au test
page.getByTestId('submit-button')
// nécessite data-testid="submit-button" dans le HTML
// très stable, mais demande un accord avec les développeurs

// ⚠️ À éviter — locators fragiles
page.locator('.btn-primary')              // classe CSS → change avec les refactos
page.locator('#submit')                   // ID → rarement stable dans une SPA
page.locator('div > span:nth-child(2)')   // sélecteur complexe → cauchemar à maintenir
```

💡 Le mode `--ui` intègre un **Locator Picker** : clique sur n'importe quel élément dans le navigateur, et Playwright te suggère le locator le plus robuste. Utilise-le systématiquement quand tu débutes.

⚠️ `getByText()` est sensible à la casse et cherche une correspondance exacte par défaut. Sur un texte partiel, ajoute `{ exact: false }` : `page.getByText('Bienvenu', { exact: false })`.

---

## Du script brut au test maintenable — trois niveaux

### Niveau 1 — Le test qui fonctionne, mais ne scale pas

```typescript
test('créer une tâche', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('alice@example.com');
  await page.getByLabel('Mot de passe').fill('secret123');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await page.goto('/tasks/new');
  await page.getByLabel('Titre').fill('Corriger le bug #42');
  await page.getByRole('button', { name: 'Créer' }).click();
  await expect(page.getByText('Tâche créée')).toBeVisible();
});
```

Ça marche. Mais si tu as 15 tests qui commencent par la même séquence de connexion, un changement de l'UI du login nécessite 15 modifications. C'est le signe qu'il faut passer au niveau suivant.

---

### Niveau 2 — Factoriser avec beforeEach

Playwright permet de mutualiser la logique de setup :

```typescript
import { test, expect } from '@playwright/test';

test.describe('Gestion des tâches', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('alice@example.com');
    await page.getByLabel('Mot de passe').fill('secret123');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page).toHaveURL('/dashboard');  // vérifie que le login a réussi
  });

  test('créer une tâche', async ({ page }) => {
    await page.goto('/tasks/new');
    await page.getByLabel('Titre').fill('Corriger le bug #42');
    await page.getByRole('button', { name: 'Créer' }).click();
    await expect(page.getByText('Tâche créée')).toBeVisible();
  });

  test('supprimer une tâche', async ({ page }) => {
    // l'utilisateur est déjà connecté
    await page.goto('/tasks');
    // ...
  });
});
```

Mieux — mais la logique de connexion reste dupliquée si d'autres fichiers en ont besoin. C'est là qu'intervient le pattern suivant.

---

### Niveau 3 — Page Object Model

Le **Page Object Model (POM)** est le standard pour les tests UI en production. Chaque page (ou composant majeur) de l'application est représentée par une classe qui encapsule ses interactions. Les tests savent ce qu'ils veulent accomplir, pas comment c'est fait.

```typescript
// pages/LoginPage.ts
import { Page, expect } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async loginAs(email: string, password: string) {
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Mot de passe').fill(password);
    await this.page.getByRole('button', { name: 'Se connecter' }).click();
  }

  async expectErrorMessage(text: string) {
    await expect(this.page.getByRole('alert')).toContainText(text);
  }
}
```

```typescript
// pages/TaskPage.ts
import { Page, expect } from '@playwright/test';

export class TaskPage {
  constructor(private page: Page) {}

  async createTask(title: string) {
    await this.page.goto('/tasks/new');
    await this.page.getByLabel('Titre').fill(title);
    await this.page.getByRole('button', { name: 'Créer' }).click();
  }

  async expectSuccessMessage() {
    await expect(this.page.getByText('Tâche créée')).toBeVisible();
  }
}
```

```typescript
// tests/task-creation.spec.ts
import { test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { TaskPage } from '../pages/TaskPage';

test('un utilisateur connecté peut créer une tâche', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const taskPage = new TaskPage(page);

  await loginPage.goto();
  await loginPage.loginAs('alice@example.com', 'secret123');
  await taskPage.createTask('Corriger le bug #42');
  await taskPage.expectSuccessMessage();
});
```

🧠 Remarque ce que gagne le test : il décrit ce qui se passe d'un point de vue métier, sans aucun détail technique. Si le label "Email" devient "Adresse email" dans le HTML demain, tu corriges uniquement `LoginPage.ts` — tous les tests qui appellent `loginAs()` restent intacts.

---

## Cas d'usage avancés

### Formulaire multi-étapes

L'auto-waiting de Playwright gère naturellement les formulaires paginés :

```typescript
test('inscription en 3 étapes', async ({ page }) => {
  await page.goto('/register');

  // Étape 1
  await page.getByLabel('Prénom').fill('Alice');
  await page.getByLabel('Email').fill('alice@example.com');
  await page.getByRole('button', { name: 'Suivant' }).click();

  // Playwright attend automatiquement que l'étape 2 soit visible
  await page.getByLabel('Mot de passe').fill('Str0ng!Pass');
  await page.getByLabel('Confirmer').fill('Str0ng!Pass');
  await page.getByRole('button', { name: 'Suivant' }).click();

  // Étape 3
  await expect(page.getByText('Vérifiez vos informations')).toBeVisible();
  await page.getByRole('button', { name: 'Confirmer l\'inscription' }).click();
  await expect(page).toHaveURL('/welcome');
});
```

### Intercepter une requête réseau

Parfois tu veux tester le comportement de l'UI quand l'API répond lentement ou retourne une erreur — sans modifier le backend :

```typescript
test('affiche un message d\'erreur si l\'API plante', async ({ page }) => {
  await page.route('**/api/tasks', route => {
    route.fulfill({ status: 500, body: 'Internal Server Error' });
  });

  await page.goto('/tasks');
  await expect(page.getByRole('alert')).toContainText('Erreur de chargement');
});
```

💡 `page.route()` est l'une des fonctionnalités les plus puissantes de Playwright. Elle permet de simuler des cas d'erreur réseau (timeout, 500, 404) sans infrastructure de mock dédiée.

### Valider un téléchargement de fichier

```typescript
test('l\'export CSV déclenche un téléchargement', async ({ page }) => {
  await page.goto('/reports');

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exporter en CSV' }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(/rapport-\d{4}\.csv/);
});
```

---

## Erreurs fréquentes — symptômes et corrections

**Le test passe en local mais échoue aléatoirement en CI.**
Cause classique : un `waitForTimeout(2000)` qui suffit sur ta machine ne tient pas en CI sous charge. Playwright intègre déjà un auto-waiting sur toutes ses interactions — il attend que l'élément soit prêt. Remplace les attentes arbitraires par des assertions précises : `await expect(locator).toBeVisible()` ou `await page.waitForURL('/dashboard')`.

---

**`Error: strict mode violation — locator resolved to X elements`**
Ton locator est trop vague et matche plusieurs éléments dans la page — deux boutons "Supprimer" dans une liste, par exemple. Affine avec un scope parent :

```typescript
page.getByRole('listitem')
  .filter({ hasText: 'Tâche #42' })
  .getByRole('button', { name: 'Supprimer' })
```

---

**Le test passe même quand la fonctionnalité est cassée.**
Deux suspects : une assertion manquante, ou un `await` oublié devant `expect()`. Un `expect()` sans `await` ne vérifie rien — le test passe toujours, même si l'élément est absent. Active `eslint-plugin-playwright` pour détecter ce cas automatiquement.

---

⚠️ Un test qui ne peut pas échouer ne sert à rien. Après avoir écrit un test, casse volontairement la fonctionnalité — retire un texte, change une URL — et relance. Si le test passe encore, ton assertion ne couvre pas le bon comportement. Cette vérification prend 30 secondes et peut t'éviter des heures de débogage en production.

---

## Cas réel — équipe SaaS B2B, 4 développeurs

**Contexte :** Une startup développe une plateforme de gestion RH. L'équipe QA est une seule personne. Avant chaque release (toutes les deux semaines), elle passe une journée entière à tester manuellement les 8 parcours critiques : connexion, création d'employé, validation de congé, export de fiche de paie, etc.

**Problème :** Deux releases de suite ont livré en production avec le formulaire d'export cassé. Le problème avait été introduit lors d'une migration de composant UI. Aucun test automatisé ne couvrait ce chemin.

**Mise en place :** En 3 jours, la QA automatise les 8 parcours critiques avec Playwright + POM. Les tests sont intégrés dans la CI GitHub Actions et tournent à chaque PR.

**Résultats mesurés :**
- Temps de régression avant release : de 8h à 12 minutes
- 3 régressions détectées en CI dans le mois suivant (dont une sur le formulaire d'export, exactement comme avant)
- 0 bug critique livré en production sur les 4 releases suivantes

La QA n'a pas cessé les tests manuels — elle les a recentrés sur les nouvelles fonctionnalités et les cas limites, là où son jugement apporte une vraie valeur.

---

## Bonnes pratiques

**Un test = un comportement utilisateur.** Si ton test vérifie dix choses à la fois et échoue, tu ne sais pas quoi est cassé. Garde chaque test centré sur un scénario précis.

**Isole tes données de test.** Un test qui dépend d'un compte existant en base est fragile. Crée les données dont tu as besoin via l'API en début de test (Playwright expose un objet `request` pour ça) et nettoie-les après. Tes tests deviennent idempotents — ils peuvent tourner dans n'importe quel ordre, autant de fois qu'on veut.

**Nomme tes tests comme des phrases.** `test('un admin peut désactiver un compte utilisateur')` est infiniment plus utile que `test('test désactivation')` quand tu lis un rapport CI à 23h après un incident. Le nom du test, c'est son rapport d'erreur.

**Intègre dans la CI dès le départ.** Un test qui ne tourne qu'en local n'existe pas vraiment :

```yaml
# .github/workflows/playwright.yml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

**Limite le périmètre de l'automatisation UI.** Si un comportement peut être testé par un test API, fais-le là. Les tests UI sont les plus coûteux à maintenir — réserve-les aux parcours qui nécessitent vraiment un navigateur.

**Centralise les credentials et les URLs de test.** Passe-les via des variables d'environnement, jamais en dur dans les fichiers de test. Un fichier `.env.test` ignoré par Git, lu par la config Playwright, suffit dans la plupart des projets.

---

## Résumé

L'automatisation UI n'est pas une question d'outils, c'est une question de discipline : automatiser les bons cas, avec les bons locators, dans une structure maintenable.

Playwright résout la friction technique — auto-waiting, multi-navigateurs, interception réseau — mais c'est le design de tes tests qui détermine si la suite restera utile dans six mois. Un test nommé clairement, isolé dans ses données, structuré avec le POM, intégré à la CI : c'est un test qui protège l'équipe. Un test flaky qui traîne en rouge permanent, c'est pire que pas de test du tout — il érode la confiance dans toute la suite.

| Concept | Rôle | Point clé |
|---|---|---|
| `getByRole()` | Localiser un élément par rôle ARIA | Locator le plus robuste, priorité absolue |
| `getByTestId()` | Cibler via `data-testid` | Très stable, accord avec les devs nécessaire |
| `expect().toBeVisible()` | Vérifier qu'un élément est présent | Playwright auto-attend jusqu'au timeout |
| `page.route()` | Intercepter et mocker les requêtes | Parfait pour tester les cas d'erreur API |
| Page Object Model | Encapsuler les interactions par page | 1 locator à changer = 1 fichier modifié |
| `beforeEach` | Setup commun avant chaque test | Évite la duplication de la logique de login |
| Mode `--ui` | Interface graphique de débogage | Locator Picker intégré, indispensable au départ |

---

<!-- snippet
id: playwright_install_init
type: command
tech: playwright
level: intermediate
importance: high
format: knowledge
tags: playwright, installation, setup, nodejs
title: Initialiser Playwright dans un projet Node.js
command: npm init playwright@latest
example: npm init playwright@latest
description: Lance l'assistant interactif qui configure Playwright, génère playwright.config.ts et télécharge les navigateurs (Chromium, Firefox, WebKit).
-->

<!-- snippet
id: playwright_run_ui_mode
type: command
tech: playwright
level: intermediate
importance: medium
format: knowledge
tags: playwright, debug, ui, locator
title: Lancer Playwright en mode UI interactif
command: npx playwright test --ui
example: npx playwright test --ui
description: Ouvre une interface graphique avec Locator Picker intégré — clique sur un élément pour obtenir le locator recommandé. Indispensable pour déboguer.
-->

<!-- snippet
id: playwright_locator_priority
type: concept
tech: playwright
level: intermediate
importance: high
format: knowledge
tags: playwright, locator, robustesse, aria, selector
title: Hiérarchie des locators Playwright
content: Playwright recommande dans l'ordre : 1) getByRole() (rôle ARIA + nom visible), 2) getByLabel() (champ de formulaire), 3) getByText(), 4) getByTestId() (data-testid). Éviter les sélecteurs CSS (.btn-primary) et XPath — ils cassent à chaque refacto. getByRole('button', { name: 'Valider' }) résiste aux changements de classe, d'ID et de structure DOM.
description: Prioriser getByRole() puis getByLabel() pour un ciblage sémantique stable. Éviter .locator('.classe-css') qui se casse au premier refacto.
-->

<!-- snippet
id: playwright_await_missing
type: warning
tech: playwright
level: intermediate
importance: high
format: knowledge
tags: playwright, async, await, piege, test-silencieux
title: await manquant devant expect() — le test muet
content: Piège : oublier await devant expect(locator).toBeVisible() ne génère aucune erreur — le test passe toujours, même si l'élément est absent. La suite de tests est verte mais ne détecte rien. Correction : chaque expect() Playwright doit être précédé de await. Installer eslint-plugin-playwright pour détecter les assertions sans await automatiquement.
description: Un expect() sans await passe toujours — le test ne vérifie rien. Toujours écrire await expect(...). Utiliser eslint-plugin-playwright pour automatiser la détection.
-->

<!-- snippet
id: playwright_waittimeout_antipattern
type: warning
tech: playwright
level: intermediate
importance: high
format: knowledge
tags: playwright, flakiness, timeout, ci, attente
title: waitForTimeout — la cause n°1 de flakiness
content: Piège : await page.waitForTimeout(2000) passe en local mais échoue en CI sous charge. Playwright intègre un auto-waiting sur toutes les assertions et interactions — il attend déjà que l'élément soit prêt. Correction : remplacer les attentes arbitraires par await expect(locator).toBeVisible() ou await page.waitForURL('/dashboard'). Ces appels attendent automatiquement jusqu'au timeout global configuré.
description: Remplacer waitForTimeout(N) par await expect(locator).toBeVisible() — Playwright auto-attend. Les délais fixes créent des tests flaky en CI.
-->

<!-- snippet
id: playwright_page_object_model
type: concept
tech: playwright
level: intermediate
importance: high
format: knowledge
tags: playwright, pom, architecture, maintenabilite, page-object
title: Page Object Model — encapsuler les interactions par page
content: Le POM crée une classe par page de l'app (LoginPage, TaskPage). Chaque classe expose des méthodes métier (loginAs(), createTask()) qui cachent les détails des locators. Résultat : si le label 'Email' devient 'Adresse email', tu modifies LoginPage.ts une seule fois — tous les tests qui appellent loginAs() restent intacts. Les tests deviennent lisibles comme des phrases métier, sans détail technique.
description: Une classe par page, des méthodes métier qui cachent les locators. Modifier un locator → 1 fichier à changer au lieu de N tests.
-->

<!-- snippet
id: playwright_route_mock
type: tip
tech: playwright
level: intermediate
importance: medium
format: knowledge
tags: playwright, mock, api, route, erreur-reseau
title: Simuler une erreur API avec page.route()
content: Utiliser page.route('**/api/<RESOURCE>', route => route.fulfill({ status: 500, body: 'Error' })) avant page.goto() pour intercepter les requêtes et simuler des erreurs backend sans modifier le serveur. Permet de tester le comportement de l'UI sur des cas d'erreur (timeout, 500, 404) sans infrastructure de mock dédiée.
description: page.route() intercepte les requêtes réseau et renvoie une réponse simulée — idéal pour tester les cas d'erreur API sans toucher au backend.
-->

<!-- snippet
id: playwright_strict_mode_violation
type: error
tech: playwright
level: intermediate
importance: medium
format: knowledge
tags: playwright, erreur, locator, strict-mode, multiple-elements
title: Strict mode violation — locator ambigu
content: Symptôme : "Error: strict mode violation — locator resolved to X elements". Cause : le locator cible plusieurs éléments (ex : deux boutons 'Supprimer' dans une liste). Correction : affiner avec .filter() pour réduire le scope — page.getByRole('listitem').filter({ hasText: 'Tâche #42' }).getByRole('button', { name: 'Supprimer' }).
description: Quand un locator matche plusieurs éléments, Playwright refuse d'agir. Affiner avec .filter({ hasText: '...' }) pour cibler le bon conteneur parent.
-->

<!-- snippet
id: playwright_baseurl_config
type: tip
tech: playwright
level: intermediate
importance: medium
format: knowledge
tags: playwright, config, baseurl, maintenance
title: Centraliser l'URL de base dans playwright.config.ts
content: Dans playwright.config.ts, définir use: { baseURL: 'http://localhost:3000' }.
