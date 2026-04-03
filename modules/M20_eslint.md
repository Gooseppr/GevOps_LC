---
layout: page
title: ESLint
sujet: Déploiement Continu (CD)
type: module
jour: 20
ordre: 2
tags: cd, eslint, javascript, typescript, test, devops
---

# 🟣 **Cours ESLint – Le guide complet du développeur moderne**

## 🎯 Objectifs du module

À la fin de ce cours, tu sauras :

- Comprendre ce qu’est ESLint et pourquoi il est indispensable.
- Installer ESLint dans un projet Node, React, TypeScript…
- Utiliser ESLint en version locale, globale, ou ponctuelle via **npx**.
- Configurer un fichier `.eslintrc` de A à Z.
- Utiliser les règles, plugins, overrides, ignore patterns.
- Utiliser ESLint dans un pipeline CI/CD.
- Corriger automatiquement ton code grâce à `-fix`.
- Déclencher ESLint dans Git (husky, lint-staged).

---

# 🟣 1. Qu’est-ce que ESLint ?

ESLint est un **linter JavaScript / TypeScript** servant à :

- détecter les erreurs
- imposer un style de code
- prévenir les bugs
- homogénéiser les pratiques dans une équipe
- automatiser le contrôle qualité du code

Il est comparable à :

| Langage | Linter |
| --- | --- |
| Python | flake8 / pylint |
| PHP | phpcs |
| Java | Checkstyle |
| C# | analyzers |

---

# 🟣 2. Installation et premières commandes

## 🔵 Installation locale (RECOMMANDÉE)

```
npm install eslint --save-dev

```

## 🔵 Initialisation interactive (le plus pratique)

```
npx eslint --init

```

Le CLI t’interroge :

- type de modules (ESM, CommonJS)
- frameworks (React, Vue, None…)
- TypeScript ?
- style de code (Airbnb, Standard, Google…)
- format de config (json, yaml, js)

Il crée un fichier :

```
.eslintrc.json

```

---

# 🟣 3. Utiliser ESLint via NPX (mode “one-shot”)

Très important pour comprendre la différence.

### ✔️ Commande NPX ESLint

```
npx eslint .

```

NPX exécute **la version locale si elle existe**, sinon **télécharge une version temporaire**.

👉 C’est parfait pour :

- tester ESLint sans l’installer
- ajouter ESLint dans un pipeline
- vérifier un fichier ponctuellement
- audit rapide sur une base de code

### Limitations du mode npx :

- ne garde pas de configuration locale
- ne fonctionne pas “offline”
- pas de plugins installés
- pas de règles personnalisées
- moins adapté aux gros projets

**npx est utile en complément, mais pas pour une équipe.**

---

# 🟣 4. Le fichier `.eslintrc.*`

Formats possibles :

- `.eslintrc.json`
- `.eslintrc.js`
- `.eslintrc.yml`
- `eslint.config.js` (nouveau format flat-config)

## Exemple de base :

```json
{
  "env": {
    "browser": true,
    "node": true,
    "es2021": true},
  "extends": [
    "eslint:recommended"
  ],
  "rules": {
    "no-unused-vars": "warn",
    "eqeqeq": "error"
  }
}

```

### 🔵 `env`

Définit l’environnement (quelles globales existent).

| env | Description |
| --- | --- |
| browser | window, document… |
| node | require, process… |
| es2021 | syntaxe moderne |

### 🔵 `extends`

Héritage d’une configuration existante.

Exemples très courants :

- `"eslint:recommended"`
- `"plugin:react/recommended"`
- `"airbnb"`
- `"google"`
- `"standard"`
- `"next/core-web-vitals"`

### 🔵 `rules`

Chaque règle peut prendre :

- `"off"`
- `"warn"`
- `"error"`
    
    ou un tableau pour des options supplémentaires.
    

---

# 🟣 5. Les règles (rules)

## 🔵 5.1. Règles simples

```json
"semi": "error"

```

Oblige les `;`.

```json
"quotes": ["error", "single"]

```

Force `' '`.

```json
"indent": ["error", 2]

```

Indentation 2 espaces.

---

## 🔵 5.2. Règles avancées (avec options)

### Exemple : `no-unused-vars`

```json
"no-unused-vars": [
  "warn",
  {
    "vars": "all",
    "args": "after-used",
    "ignoreRestSiblings": true}
]

```

### Exemple : `no-console`

```json
"no-console": [
  "error",
  {
    "allow": ["warn", "error"]
  }
]

```

---

## 🔵 5.3. Options complexes – `curly`

```json
"curly": ["error", "multi-line"]

```

Impose `{ }` pour toute instruction multilignes.

---

# 🟣 6. Plugins ESLint

ESLint accepte des plugins sous forme :

```
npm install eslint-plugin-react --save-dev

```

Puis dans `.eslintrc` :

```json
"plugins": ["react"],
"extends": ["plugin:react/recommended"]

```

Plugins populaires :

| Plugin | Utilité |
| --- | --- |
| eslint-plugin-react | React |
| eslint-plugin-react-hooks | Hooks rules |
| @typescript-eslint | TS linter |
| eslint-plugin-import | gestion des imports |
| eslint-plugin-jsx-a11y | accessibilité HTML |
| eslint-plugin-security | anti-vulnérabilités |
| eslint-plugin-node | règles Node.js |

### Exemple TypeScript :

```
npm install @typescript-eslint/parser @typescript-eslint/eslint-plugin --save-dev

```

```json
{
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "extends": ["plugin:@typescript-eslint/recommended"]
}

```

---

# 🟣 7. Overrides : règles différentes selon les fichiers

Exemple : activer des règles spéciales pour les fichiers tests :

```json
"overrides": [
  {
    "files": ["*.test.js"],
    "env": { "jest": true },
    "rules": { "no-unused-expressions": "off" }
  }
]

```

---

# 🟣 8. Ignore : fichiers à exclure

Créer un fichier :

```
.eslintignore

```

Exemples :

```
node_modules/
dist/
coverage/
**/*.min.js

```

---

# 🟣 9. Options en CLI (très important !)

## 🔵 Linter tout le dossier

```
npx eslint .

```

## 🔵 Corriger automatiquement

```
npx eslint . --fix

```

## 🔵 Fix spécifique

```
npx eslint src/components --ext .js,.jsx --fix

```

## 🔵 Formateur d’affichage

```
npx eslint . -f table

```

Autres formats :

- stylish (par défaut)
- json
- html
- junit

## 🔵 Lister toutes les règles

```
npx eslint --print-config .

```

---

# 🟣 10. Intégration dans VS Code

Installer l’extension :

```
ESLint (dbaeumer.vscode-eslint)

```

Ensuite ajouter dans `.vscode/settings.json` :

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true}
}

```

→ corrections automatiques **à chaque sauvegarde**.

---

# 🟣 11. Intégration dans un pipeline CI/CD

### Exemple GitLab

```yaml
eslint:
  image: node:18
  script:
    - npm ci
    - npx eslint .

```

### Exemple Azure DevOps

```yaml
steps:
  - script: |
      npm ci
      npx eslint .

```

### Exemple GitHub Actions

```yaml
- name: Lint code
  run: npx eslint .

```

---

# 🟣 12. Utilisation avec Husky + lint-staged

Empêche un commit si le code ne passe pas ESLint.

```
npm install husky lint-staged --save-dev
npx husky init

```

Dans `.husky/pre-commit` :

```
npx lint-staged

```

Créer dans `package.json` :

```json
"lint-staged": {
  "*.js": "eslint --fix"
}

```

Résultat :

👉 impossible de commiter si le code ne respecte pas les règles.

---

# 🟣 13. Configurations courantes (exemples complets)

## 🔵 Projet Node.js

```json
{
  "env": {
    "node": true,
    "es2021": true},
  "extends": ["eslint:recommended"],
  "rules": {
    "no-var": "error",
    "prefer-const": "error"
  }
}

```

---

## 🔵 Projet React (moderne)

```json
{
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
    "ecmaFeatures": { "jsx": true }
  },
  "plugins": ["react", "react-hooks"],
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "react/prop-types": "off",
    "react/jsx-uses-react": "off"
  }
}

```

---

## 🔵 Projet TypeScript

```json
{
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "extends": ["plugin:@typescript-eslint/recommended"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/ban-types": "error"
  }
}

```

---

# 🟣 14. Nouveau format “Flat Config” (eslint.config.js)

Version moderne d’ESLint (ESLint v9+).

Exemple :

```jsx
import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    rules: {
      semi: "error",
      quotes: ["error", "single"]
    }
  }
];

```

✔️ plus flexible

✔️ compatible ESM

✔️ fusion automatique des configs

---

# 🟣 15. Conclusion

ESLint est un **outil essentiel** pour :

- prévenir les bugs
- uniformiser le code
- travailler proprement en équipe
- automatiser le contrôle qualité
- sécuriser les pipelines CI/CD

Tu connais maintenant :

- toutes les options importantes
- les plugins indispensables
- les commandes cli (fix, print-config, formatter…)
- le mode **npx** (audit rapide ponctuel)
- les configs pour Node, React, TS
- l'intégration VS Code / CI / Husky



<!-- snippet
id: cicd_eslint_install
type: command
tech: cicd
level: beginner
importance: high
format: knowledge
tags: eslint,installation,javascript
title: Installer ESLint en dépendance de développement
context: mettre en place ESLint sur un projet JavaScript ou TypeScript
command: npm install eslint --save-dev
description: Installe ESLint comme dépendance de dev dans le projet. Après l'installation, lancer npx eslint --init pour générer la configuration.
-->

<!-- snippet
id: cicd_eslint_init
type: command
tech: cicd
level: beginner
importance: high
format: knowledge
tags: eslint,init,configuration,javascript
title: Initialiser la configuration ESLint avec l'assistant
context: générer un fichier .eslintrc.* adapté au projet après installation
command: npx eslint --init
description: Lance l'assistant interactif qui génère un fichier .eslintrc.* selon le type de projet (Node, React, TypeScript) et le style choisi (Airbnb, Standard, Google).
-->

<!-- snippet
id: cicd_eslint_fix
type: command
tech: cicd
level: beginner
importance: high
format: knowledge
tags: eslint,fix,correction,automatique
title: Corriger automatiquement les erreurs ESLint
context: appliquer les corrections auto-fixables sur tout un projet JavaScript
command: npx eslint . --fix
description: Analyse tous les fichiers JS/TS et applique automatiquement les corrections possibles (formatage, quotes, semi-colons, etc.). Les erreurs non auto-fixables restent signalées dans la sortie standard.
-->

<!-- snippet
id: cicd_eslint_ci_job
type: concept
tech: cicd
level: intermediate
importance: high
format: knowledge
tags: eslint,gitlab,ci,lint,pipeline
title: Intégrer ESLint dans un pipeline CI (GitLab, GitHub, Azure)
context: bloquer automatiquement les commits non conformes aux règles de style
content: Dans GitLab CI : job avec image node:18, script npm ci && npx eslint . Le job échoue si ESLint trouve des erreurs (exit code 1), bloquant ainsi la MR. Même pattern pour GitHub Actions (run: npx eslint .) et Azure DevOps (script: npx eslint .).
-->

<!-- snippet
id: cicd_eslint_husky_lint_staged
type: concept
tech: cicd
level: intermediate
importance: medium
format: knowledge
tags: eslint,husky,lint-staged,pre-commit,git
title: Bloquer les commits avec Husky + lint-staged
context: empêcher de commiter du code JavaScript non conforme aux règles ESLint
content: Installer husky et lint-staged (npm install husky lint-staged --save-dev && npx husky init). Dans .husky/pre-commit, ajouter npx lint-staged. Dans package.json, configurer "lint-staged": {"*.js": "eslint --fix"}. Résultat : ESLint s'exécute et corrige automatiquement à chaque commit.
-->

<!-- snippet
id: cicd_eslint_typescript_config
type: concept
tech: cicd
level: intermediate
importance: medium
format: knowledge
tags: eslint,typescript,parser,plugin,configuration
title: Configurer ESLint pour un projet TypeScript
context: adapter ESLint à la syntaxe TypeScript pour bénéficier du typage dans le linting
content: Installer @typescript-eslint/parser et @typescript-eslint/eslint-plugin. Dans .eslintrc : "parser": "@typescript-eslint/parser", "plugins": ["@typescript-eslint"], "extends": ["plugin:@typescript-eslint/recommended"]. Règles clés : no-explicit-any (warn) et ban-types (error).
-->

---
[← Module précédent](M20_Cours-CD-Approfondi.md)
---
