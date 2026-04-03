---
layout: page
title: Framework de test Jest
sujet: Intégration continue (CI)
type: module
jour: 19
ordre: 2
tags: ci, test, jest, nodejs, devops
---

# 🎓 Tests unitaires & d’intégration avec **Jest** (Jour 1)

> Cours clair, progressif et opérationnel. On distingue **les types de tests**, on installe **Jest**, on écrit **des tests unitaires et d’intégration**, on les exécute et on lit les résultats (PASS/FAIL).

---

## ✅ Ce que tu sauras faire
- Comprendre la différence **tests unitaires** vs **tests d’intégration** et leurs objectifs.
- Utiliser **Jest** pour écrire, lancer et diagnostiquer des tests JavaScript.
- Mettre en place un **workflow TDD** simple (test → code → test).
- Lire les rapports (PASS/FAIL), corriger une régression, **couvrir les cas limites**.
- Écrire un **test d’intégration** (plusieurs modules qui coopèrent).

---

## 🧱 Types de tests (focus Jest)
### 1) Tests unitaires
- **Portée :** une unité de code **isolée** (fonction, méthode, classe).
- **But :** valider la **logique pure** (inputs → output) rapidement.
- **Caractéristiques :** rapides, nombreux, faciles à diagnostiquer.

### 2) Tests d’intégration
- **Portée :** **plusieurs modules** qui collaborent (ex. `Cart` ↔ `Shipping`).
- **But :** détecter les **problèmes d’assemblage** (dépendances, contrats).
- **Caractéristiques :** un peu plus lents, moins nombreux, plus réalistes.

> 🧠 Par opposition aux **tests E2E** (Cypress) qui valident **un scénario utilisateur complet** via navigateur, Jest se concentre sur **le code JS côté logique** (unitaire) et **les interactions entre modules** (intégration).

---

## 👥 Rôles & risques autour d’une fonctionnalité
- **Lead dev :** définit les **objectifs**, les critères d’acceptation et **rédige/valide** les tests de référence.
- **Développeur :** **implémente** la fonctionnalité pour **faire passer** les tests.
- **Risques courants :**
  - implémentation incomplète (ex. oublie des **frais de port**),
  - régression (une modif **casse** un calcul existant),
  - contrat entre modules non respecté (**intégration** qui échoue).
- **Antidote :** écrire des **tests automatisés** (dès que possible) et les exécuter **en CI** à chaque *push*/*merge request*.

---

## ⚙️ Préparer l’environnement (Node, npm/yarn)
### Vérifier Node.js & npm
```bash
node -v
npm -v
which node && which npm     # (Linux/macOS/WSL)
```

> Si Node/npm manquent : installer Node LTS (ou `nvm` pour gérer les versions).

### Initialiser le projet
```bash
mkdir myapp && cd myapp
npm init -y                       # ou : yarn init -y
```

### Installer **Jest**
```bash
npm i -D jest                     # ou : yarn add -D jest
```

### Scripts `package.json`
```json
{
  "name": "myapp",
  "version": "1.0.0",
  "type": "commonjs",
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage"
  },
  "devDependencies": {
    "jest": "^29.0.0"
  }
}
```
> Utilisation : `npm test`, `npm run test:watch`, `npm run test:cov` (ou `yarn jest`, `yarn test:watch`…)

> 🧩 **ESM/TypeScript** : selon ton stack, tu peux ajouter Babel/ts-jest (hors périmètre de ce Jour 1).

---

## 🧩 Arborescence minimale
```
myapp/
├─ script.js           # fonctionnalité
├─ basket.test.js      # tests (Jest détecte *.test.js ou *.spec.js)
└─ package.json
```

---

## 🧪 TDD unitaire — exemple « panier »

### 1) Le test (écrit d’abord)
```js
// basket.test.js
const { basket } = require('./script')

test('Total cart with shipping costs', () => {
  const items = [
    { name: 'shoes',   price: 15 },
    { name: 't-shirt', price: 15 }
  ]
  const shippingFees = 3

  expect(basket(items, shippingFees)).toBe(33) // 15 + 15 + 3
})
```
> 💡 On exprime **l’intention métier** : total = somme des prix + frais de port.

### 2) Implémentation (première version – volontairement incomplète)
```js
// script.js
function basket(items, shippingFees) {
  let sum = 0
  for (let i = 0; i < items.length; i++) {
    sum += items[i].price
  }
  // Oubli: on n'ajoute PAS shippingFees ici…
  return sum
}
module.exports = { basket }
```
**Résultat attendu :** échec (FAIL) → le test protège contre l’oubli.

### 3) Lancer les tests
```bash
npm test
# ou
yarn jest
```

**Sortie typique (FAIL) :**
```
FAIL ./basket.test.js
  ✕ Total cart with shipping costs (10 ms)

  Expected: 33
  Received: 30
```

### 4) Corriger la fonction (faire VERDIR le test)
```js
// script.js (fix)
function basket(items, shippingFees) {
  let sum = 0
  for (let i = 0; i < items.length; i++) {
    sum += items[i].price
  }
  sum += shippingFees
  return sum
}
module.exports = { basket }
```
**Relance :**
```
PASS ./basket.test.js
  ✓ Total cart with shipping costs (12 ms)
```

> 🧠 **Cycle TDD** : *Red* (FAIL) → *Green* (PASS) → *Refactor* (nettoyage en confiance).

---

## 🔬 Assertions & outils utiles (unitaires)
```js
expect(value).toBe(42)                       // égalité stricte
expect(value).toEqual({a:1})                 // égalité de structure
expect(array).toContain('x')                 // appartenance
expect(str).toMatch(/hello/i)                // regex
expect(fn).toThrow('message')                // erreurs
```

**Exécution & options CLI**
```bash
jest                           # ou: npx jest / yarn jest
jest --watch                   # relance à chaque modif
jest path/to/file.test.js
jest -t "shipping"             # filtre par nom de test
jest --coverage                # rapport de couverture
jest --runInBand               # en série (CI lente/flaky)
jest --maxWorkers=50%          # limite la parallélisation
jest --updateSnapshot          # met à jour les snapshots
```

---

## 🧩 Test d’intégration — petit scénario multi-modules

### Contexte
On veut calculer un **total** dépendant du **mode de livraison** fourni par un module `shipping`.

### Code (modules réels)
```js
// shipping.js
function computeFees(method) {
  if (method === 'standard') return 3
  if (method === 'express')  return 8
  return 0
}
module.exports = { computeFees }

// cart.js
const { computeFees } = require('./shipping')

function totalWithShipping(items, method) {
  const itemsSum = items.reduce((acc, it) => acc + it.price, 0)
  const fees = computeFees(method)
  return itemsSum + fees
}
module.exports = { totalWithShipping }
```

### Test d’intégration (sans mock — on **branche vraiment** les modules)
```js
// cart.int.test.js
const { totalWithShipping } = require('./cart')

test('calculates total cart amount with shipping (integration)', () => {
  const items = [{ name: 'shoes', price: 15 }, { name: 't-shirt', price: 15 }]
  const total = totalWithShipping(items, 'standard')
  expect(total).toBe(33) // 30 + 3
})
```
> ✅ Ici, on valide **l’intégration** `cart ↔ shipping`.

### Variante : test d’intégration **avec stub** (contrôle fin)
```js
// cart.int.mocked.test.js
jest.mock('./shipping', () => ({
  computeFees: jest.fn().mockReturnValue(5) // forcer 5€ pour ce test
}))
const { totalWithShipping } = require('./cart')
const { computeFees } = require('./shipping')

test('integration with controlled shipping fees (mocked)', () => {
  const items = [{ price: 10 }, { price: 10 }]
  const total = totalWithShipping(items, 'express')
  expect(computeFees).toHaveBeenCalledWith('express')
  expect(total).toBe(25)   // 20 + 5
})
```
> 🧠 Utile quand le module externe est **lent**, **non déterministe** ou lié à un service distant.

---

## 🔧 Bonnes pratiques (Jest)
- **Nomme** tes tests de façon **métier** (“total with shipping costs”).  
- Un test = **un scénario** clair ; évite les tests “fourre-tout”.
- **Cas limites** : listes vides, valeurs nulles, nombres négatifs, erreurs attendues.
- **Données stables** : fabrique des helpers (`makeItem(price)`), évite le bruit.
- **Intégration** : garde les mocks **pour contrôler** le comportement, mais pense à garder **au moins un test avec vrais modules** (contrat réel).
- **Couverture** : vise un seuil raisonnable (`--coverage`), mais garde le **sens** métier au-dessus des pourcentages.

---

## 🧭 Workflow simple (à réutiliser)
1. **Lead** écrit/valide les objectifs → crée **le test** de référence.
2. **Dev** code **juste ce qu’il faut** pour faire passer le test.
3. Lance `npm test` (ou `yarn jest`) → **FAIL/ PASS**.
4. **Corrige / refactorise** avec confiance.
5. Ajoute des **tests d’intégration** pour sécuriser les interactions clés.
6. Branche en **CI** : chaque *push* exécute les tests → bloque la MR en cas d’échec.

---

## 🧰 Annexe – Exemple complet minimal

**`basket.test.js`**
```js
const { basket } = require('./script')

it('Total cart with shipping costs', () => {
  const items = [{ price: 15 }, { price: 15 }]
  const shippingFees = 3
  expect(basket(items, shippingFees)).toBe(33)
})
```

**`script.js`**
```js
function basket(items, shippingFees) {
  let sum = 0
  for (const it of items) sum += it.price
  sum += shippingFees
  return sum
}
module.exports = { basket }
```

**Exécuter :**
```bash
npm test            # ou : yarn jest
```

---

## 🧠 À retenir
- **Unitaire** = logique locale **isolée** (rapide, précis).
- **Intégration** = **collaboration** entre modules (réaliste).
- **Jest** fournit tout pour tester vite : assertions, mocks, couverture.
- **TDD** aide à coder la **bonne chose**, pas juste “du code”.

> « Décris l’intention, teste-la, puis rends le code vrai. »



<!-- snippet
id: jest_install
type: command
tech: jest
level: beginner
importance: high
format: knowledge
tags: jest,installation,npm,test-unitaire
title: Installer Jest dans un projet Node
context: mettre en place Jest pour les tests unitaires JavaScript
command: npm install --save-dev jest
description: Installe Jest en dépendance de développement. Ajouter "test": "jest", "test:watch": "jest --watch" et "test:cov": "jest --coverage" dans les scripts package.json pour faciliter l'utilisation.
-->

<!-- snippet
id: jest_run_commands
type: command
tech: jest
level: beginner
importance: high
format: knowledge
tags: jest,cli,coverage,watch
title: Commandes Jest essentielles
context: lancer, filtrer et mesurer la couverture des tests Jest
command: jest --coverage
description: Exécute tous les tests et génère un rapport de couverture de code. Options utiles : --watch (relance à chaque modification), --runInBand (série, utile en CI), -t "nom" (filtre par nom de test), --updateSnapshot (met à jour les snapshots).
-->

<!-- snippet
id: jest_tdd_cycle
type: concept
tech: jest
level: beginner
importance: high
format: knowledge
tags: jest,tdd,red-green-refactor,cycle
title: Cycle TDD avec Jest (Red → Green → Refactor)
context: adopter la méthode TDD pour écrire du code fiable et testé
content: Cycle TDD : Red (écrire le test → FAIL), Green (implémenter juste assez → PASS), Refactor (nettoyer en confiance). Chaque ligne de code répond à un besoin exprimé.
-->

<!-- snippet
id: jest_mock_module
type: concept
tech: jest
level: intermediate
importance: medium
format: knowledge
tags: jest,mock,jest.mock,integration,stub
title: Mocker un module avec jest.mock()
context: isoler un module externe pour contrôler son comportement dans un test d'intégration
content: jest.mock('./module', () => ({ fn: jest.fn().mockReturnValue(val) })) remplace le module réel par un stub. Utile pour les dépendances lentes, non déterministes ou externes.
-->

<!-- snippet
id: jest_mock_real_contract
type: tip
tech: jest
level: intermediate
importance: medium
format: knowledge
tags: jest,mock,contrat,integration,modules
title: Conserver au moins un test sans mock pour valider le contrat réel
context: ne pas se fier uniquement aux tests mockés pour valider l'intégration entre modules
content: Les mocks contrôlent le comportement mais ne valident pas le contrat réel. Conserver au moins un test d'intégration sans mock pour s'assurer que les vrais modules coopèrent correctement.
-->

<!-- snippet
id: jest_assertions_common
type: concept
tech: jest
level: beginner
importance: medium
format: knowledge
tags: jest,assertions,expect,matchers
title: Assertions Jest courantes
context: écrire des vérifications précises dans les tests unitaires
content: toBe(42) = égalité stricte. toEqual({a:1}) = structure (deep). toContain('x') = appartenance. toThrow('msg') = erreur attendue. toMatch(/regex/) = correspondance regex.
-->

<!-- snippet
id: jest_assertions_mock_verify
type: concept
tech: jest
level: intermediate
importance: medium
format: knowledge
tags: jest,mock,assertions,calls,args
title: Vérifier les appels d'un mock avec Jest
context: s'assurer qu'une fonction mockée a bien été appelée avec les bons arguments
content: expect(mockFn).toHaveBeenCalledWith('arg') vérifie les arguments. toHaveBeenCalledTimes(n) vérifie le nombre d'appels. toHaveBeenCalled() vérifie qu'il a été appelé au moins une fois.
-->

---
[← Module précédent](M19_test-cypress.md)
---
