---
titre: Framework de test Cypress
type: module
jour: 19
ordre: 1
tags: ci, test, cypress, nodejs, devops
---

# 🎓 Frameworks de test & Cypress (DevOps – Jour 1)

## 🌍 Introduction

Dans une démarche **DevOps**, les tests jouent un rôle **central** dans la qualité logicielle.  
Ils permettent de s’assurer que :
- le code reste **fonctionnel** après chaque modification,
- le système reste **stable** lors des déploiements continus,
- et les bugs sont **détectés automatiquement** le plus tôt possible.

Chaque correction ou nouvelle fonctionnalité peut introduire de nouveaux défauts :  
👉 **les tests servent à prévenir la régression.**

---

## 🧱 Les trois grands types de tests

### 🔹 1. Tests unitaires
- **But** : vérifier le comportement **d’une fonction ou d’un module** isolé.
- **Exécutés par** : les développeurs (souvent via Jest, Mocha, Pytest, JUnit, etc.).
- **Avantages** :
  - rapides à exécuter,
  - faciles à automatiser,
  - isolent les erreurs très localement.
- **Exemple :**
  ```js
  // sum.test.js
  import { sum } from './sum'
  test('addition', () => {
    expect(sum(2, 3)).toBe(5)
  })
  ```

---

### 🔹 2. Tests d’intégration
- **But** : vérifier que **plusieurs modules fonctionnent ensemble**.
- **Exemples** :
  - API ↔ Base de données,
  - Backend ↔ Service externe (paiement, mail, etc.).
- **Avantage** :
  - détecte les problèmes de “connexion” entre parties du code.
- **Outils courants** :
  - Jest, Mocha, Supertest, Postman, Newman…

---

### 🔹 3. Tests End-to-End (E2E)
- **But** : simuler **un scénario utilisateur complet**, du front à la base de données.
- **Exemples** :
  - Connexion → ajout au panier → paiement,
  - Navigation complète sur le site.
- **Objectif** : vérifier le comportement global du système tel qu’un vrai utilisateur le vivrait.
- **Outil phare** : **Cypress**

---

## 🚀 Framework E2E : Cypress

### 🎯 Objectif

Cypress est un **framework de test End-to-End** qui :
- exécute les tests directement dans un navigateur,
- interagit avec l’UI comme un utilisateur réel,
- fournit des captures, vidéos et logs détaillés,
- est facile à **intégrer dans une CI (GitLab, GitHub Actions, etc.)**.

Les tests sont écrits en **JavaScript** (ou TypeScript) et organisés dans des fichiers dédiés.

---

## ⚙️ Préparation de l’environnement Node.js

Cypress repose sur **Node.js** et **npm (Node Package Manager)**.  
Avant d’installer Cypress, il faut s’assurer que Node est bien présent et fonctionnel.

### 🔍 Vérifier Node.js et npm

```bash
# Vérifie si Node.js est installé
node -v

# Vérifie si npm est installé
npm -v

# Affiche les chemins d'installation
which node
which npm
```

💡 Si les commandes ci-dessus retournent “command not found” :
- installe Node.js (version LTS recommandée) :
  ```bash
  sudo apt update
  sudo apt install -y nodejs npm
  ```
- ou utilise **nvm (Node Version Manager)** pour gérer plusieurs versions :
  ```bash
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  source ~/.bashrc
  nvm install --lts
  ```

### 🧰 Initialiser un projet Node

```bash
mkdir projet-tests
cd projet-tests
npm init -y
```

Ce qui crée un fichier `package.json` :
```json
{
  "name": "projet-tests",
  "version": "1.0.0",
  "description": "",
  "scripts": {},
  "devDependencies": {}
}
```

---

## 🧩 Installation de Cypress

### 1️⃣ Installer Cypress en dépendance de développement

```bash
npm install --save-dev cypress
# ou plus court
npm i -D cypress
```

### 2️⃣ Vérifier la présence de Cypress dans `package.json`
```json
"devDependencies": {
  "cypress": "^13.x"
}
```

### 3️⃣ Ajouter des scripts npm pour simplifier le lancement
```json
"scripts": {
  "cypress:open": "cypress open",
  "cypress:run": "cypress run"
}
```

### 4️⃣ Lancer Cypress
```bash
# Interface graphique (mode développement)
npm run cypress:open
# ou
npx cypress open

# Exécution headless (pour CI/CD)
npm run cypress:run
# ou
npx cypress run
```

💡 Si “Cypress absent”, `npx` téléchargera automatiquement la bonne version.

---

## 🧱 Structure d’un projet Cypress

```
project/
├─ cypress/
│  ├─ e2e/                   # fichiers de test E2E (ex: login.cy.js)
│  ├─ fixtures/              # données de test (JSON)
│  ├─ support/
│  │   ├─ commands.js        # fonctions custom (ex: cy.login())
│  │   └─ e2e.js             # hooks globaux (beforeEach, etc.)
├─ cypress.config.js         # configuration globale
├─ package.json
└─ node_modules/
```

---

## 🔧 Configuration de base (`cypress.config.js`)

```js
const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.{js,ts}',
    supportFile: 'cypress/support/e2e.js',
    video: true,
    screenshotOnRunFailure: true,
  },
  viewportWidth: 1280,
  viewportHeight: 800,
})
```

---

## 💻 Commandes de base Cypress

### ▶️ Lancer Cypress
```bash
npx cypress open                     # Interface graphique
npx cypress run                      # Mode headless
npx cypress run --browser chrome     # Exécuter dans Chrome
npx cypress run --headed             # Mode visible (headed)
```

### 📁 Structure des tests
```js
describe('Ma fonctionnalité', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('devrait afficher la page d’accueil', () => {
    cy.contains('Bienvenue').should('be.visible')
  })
})
```

### 🔍 Sélecteurs et actions
```js
cy.get('[data-cy=email]').type('user@example.com')
cy.get('[data-cy=password]').type('S3cret!')
cy.get('[data-cy=submit]').click()
cy.url().should('include', '/dashboard')
```

### ⚙️ Assertions utiles
```js
cy.contains('Bienvenue').should('be.visible')
cy.get('.alert').should('not.exist')
cy.get('input[name=age]').should('have.value', '18')
```

---

## 🧠 Commandes avancées

### 🌐 Intercepter le réseau
```js
cy.intercept('GET', '/api/profile', { fixture: 'profile.json' }).as('getProfile')
cy.visit('/profile')
cy.wait('@getProfile')
cy.get('[data-cy=username]').should('contain', 'Jane')
```

### 🧾 Fixtures
```js
cy.fixture('user.json').then(user => {
  cy.get('[data-cy=email]').type(user.email)
})
```

### 🔐 Commandes personnalisées
```js
// cypress/support/commands.js
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login')
  cy.get('[data-cy=email]').type(email)
  cy.get('[data-cy=password]').type(password)
  cy.get('[data-cy=btn-login]').click()
})

// utilisation
cy.login('user@example.com', 'S3cret!')
```

### 🕒 Contrôle du temps
```js
cy.clock(new Date('2025-01-01'))
cy.visit('/promo')
cy.contains('Soldes d’hiver')
```

### 📸 Screenshots et vidéos
```js
cy.screenshot('apres-login')
```

---

## 🧪 Exemple de test complet

```js
// cypress/e2e/google.cy.js
describe('Testing Google', () => {
  it('Visit Google website', () => {
    cy.visit('https://www.google.com/')
    cy.get('input[name="q"]').should('be.visible').type('Cypress IO{enter}')
    cy.contains('cypress.io').should('be.visible')
  })
})
```

---

## 🔁 Intégration CI/CD (GitLab CI)

### Exemple `.gitlab-ci.yml`
```yaml
e2e:
  image: cypress/included:13.8.0
  stage: test
  script:
    - npm ci
    - npm run cypress:run
  artifacts:
    when: always
    paths:
      - cypress/videos
      - cypress/screenshots
```

💡 **Principe** : les tests sont exécutés automatiquement à chaque `push` ou `merge request`.  
Si un test échoue, la fusion est bloquée.

---

## 🧩 Bonnes pratiques

| Sujet | Recommandation |
|-------|----------------|
| **Sélecteurs** | Utiliser `data-cy="..."` stables, jamais `.class` dynamiques. |
| **Pas de `cy.wait(2000)`** | Préférer `cy.wait('@alias')` ou `cy.get().should()`. |
| **Découpage** | Un test = un scénario clair. |
| **Retry** | Configurer `retries` pour limiter les faux négatifs. |
| **CI/CD** | Toujours exécuter Cypress en headless + exporter vidéos/screenshots. |

---

## 📘 Mémo rapide

```bash
# Node.js
node -v
npm -v
npm init -y

# Cypress
npm i -D cypress
npx cypress open
npx cypress run
npx cypress run --spec "cypress/e2e/**/*.cy.js"
npx cypress run --browser chrome
```

---

## 🧠 À retenir

- Les **tests unitaires** assurent la solidité du code isolé.  
- Les **tests d’intégration** garantissent la cohérence entre modules.  
- Les **tests E2E (Cypress)** simulent les scénarios réels utilisateur.  
- **Cypress** est rapide à installer, simple à écrire, puissant en CI.  

📜 **DevOps mindset** :
> “Automatise tes tests, exécute-les à chaque commit, et ne déploie que du code validé.”

---
[Module suivant →](M19_test-jest.md)
---

---
[Module suivant →](M19_test-jest.md)
---

---
[Module suivant →](M19_test-jest.md)
---

---
[Module suivant →](M19_test-jest.md)
---

---
[Module suivant →](M19_test-jest.md)
---

---
[Module suivant →](M19_test-jest.md)
---

---
[Module suivant →](M19_test-jest.md)
---

---
[Module suivant →](M19_test-jest.md)
---

---
[Module suivant →](M19_test-jest.md)
---

---
[Module suivant →](M19_test-jest.md)
---
