# 📘 PARCOURS : Microsoft Power Platform — De Zéro à Professionnel Opérationnel

👤 **Public cible :** Pro Developer en montée en compétence (profil PL-400), Functional Consultant, Architecte junior  
📋 **Prérequis :** Familiarité M365, notions de bases de données relationnelles, notions de formules type Excel  
⏱️ **Durée estimée :** 150 à 200 heures de modules structurés — extension vers PL-400 / Architecte junior / CoE : prévoir 250 à 350h avec projets fil rouge, labs ALM et scénarios d'architecture. Répartition indicative des modules : Pilier 0 (15h) · P1 (35h) · P2 (30h) · P3 (30h) · P4 (15h) · P5 (15h) · P6 (20h)  
🎯 **Objectif final :** Concevoir, développer et industrialiser des solutions Power Platform complètes (apps, flows, rapports, portails, agents) en respectant les standards de sécurité, gouvernance et ALM d'une entreprise. À l'issue du parcours : profil junior solide / intermédiaire opérationnel, capable de contribuer sur un projet entreprise.

---

## ═══════════════════════════════════════════════════
## 🧱 PILIER 0 — Fondations communes
## ═══════════════════════════════════════════════════

> Ce pilier est transversal — pas de niveaux. Il conditionne tous les autres piliers.

### P0-T1 — Vue d'ensemble de l'écosystème Power Platform 🔵 Concept
- Comprendre les 5 outils principaux : Power Apps, Power Automate, Power BI, Power Pages, Copilot Studio
- Comprendre Dataverse comme socle commun de données
- Comprendre le rôle des connecteurs et du Microsoft 365 dans l'écosystème
- Comprendre la relation avec Azure (Entra ID, Azure Functions, API Management)
- Distinguer Low-Code, Pro-Code et les zones hybrides
- ⭐ Schéma d'ensemble : Source → Connecteur → Dataverse → App / Flow / Rapport / Portail / Agent
- ⚠️ Power Platform n'est pas un simple "outil no-code" : les projets réels nécessitent une vraie ingénierie

### P0-T2 — Licences, plans et limites réelles 🔵 Concept
- Comprendre licences Microsoft 365 E3/E5 vs Power Platform Premium
- Comprendre licences Per App, Per User, Pay-as-you-go
- Comprendre ce qui est inclus vs ce qui est Premium (connecteurs, Dataverse, Power Pages, Copilot Studio)
- Comprendre les limites de capacité (API calls/day, storage, run history)
- Comprendre licences Power BI Pro vs Premium Per User vs Premium Capacity vs Fabric
- ⭐ Dataverse complet, les connecteurs premium (SQL, HTTP, custom connectors) et certains usages Power Automate nécessitent des licences Power Platform adaptées — Dataverse for Teams et les droits inclus M365 existent mais restent limités
- ⚠️ Le "default environment" a des limites strictes — ne pas construire en production dessus

### P0-T3 — Environnements Power Platform 🟢 Commande / Action
- Créer et configurer un environnement (Default, Developer, Trial, Sandbox, Production)
- Comprendre Managed Environments comme une couche de gouvernance premium activable sur un environnement existant — ce n'est pas un type d'environnement
- Gérer régions et conformité de données
- Configurer stratégie multi-environnements Dev/Test/Prod
- Comprendre Dataverse for Teams vs Dataverse complet
- ⭐ Toujours travailler dans un environnement dédié, jamais en Default pour du prod
- ⚠️ Dataverse for Teams ≠ Dataverse complet : fonctionnalités et licences différentes

### P0-T4 — Dataverse : modèle de données 🔵 Concept
- Comprendre tables standard vs custom
- Créer colonnes (types : texte, choix, lookup, formule, fichier…)
- Créer relations (1-N, N-N, hiérarchique)
- Comprendre vues, formulaires, et colonnes calculées Dataverse
- Comprendre les métadonnées et le schéma logique
- Comprendre les limites de stockage et de requêtage (OData, FetchXML)
- ⭐ Dataverse est le pivot de toute architecture Power Platform sérieuse
- ⚠️ Un mauvais modèle de données Dataverse est très coûteux à corriger une fois en prod

### P0-T5 — Sécurité Dataverse : security roles et column-level security 🔴 Piège
> **Thème séparé de P0-T4** — la sécurité Dataverse est une discipline à part entière

- Comprendre Business Units et leur hiérarchie
- Créer et configurer des security roles (create/read/write/delete/append/assign/share par table)
- Comprendre les niveaux d'accès : User, Business Unit, Parent BU, Organization
- Configurer Column Security Profiles (column-level security)
- Comprendre Row-Level Security Dataverse vs RLS Power BI (différents !)
- Comprendre sharing et record ownership
- ⭐ Security roles Dataverse ≠ permissions Power Apps : les deux opèrent indépendamment
- ⚠️ Un utilisateur peut accéder à Dataverse via API même sans passer par une app — security roles toujours requis

### P0-T6 — Connecteurs, connexions et gateway 🟢 Commande / Action
- Distinguer connecteurs standard vs premium vs custom
- Créer une connexion et gérer les credentials
- Comprendre connection references (indispensable pour le déploiement en solution)
- Installer et configurer une on-premises data gateway
- Comprendre gateway cluster et haute disponibilité
- ⭐ Connection references = la bonne façon de gérer les connexions dans une solution déployable
- ⚠️ Connexions créées hors solution = bloquantes au déploiement

### P0-T7 — DLP Policies et gouvernance des connecteurs 🔴 Piège
- Comprendre Data Loss Prevention (DLP) policies
- Créer une policy tenant vs environnement
- Classifier connecteurs : Business, Non-Business, Blocked
- Comprendre l'impact d'une DLP sur les flows et apps existants
- Gérer exceptions et politiques d'escalade
- ⭐ DLP mal configurée = flows cassés en production sans avertissement préalable
- ⚠️ La DLP s'applique aussi à Copilot Studio et Power Pages — souvent oublié

### P0-T8 — Solutions managed/unmanaged 🟢 Commande / Action
- Comprendre solution vs solution managed vs solution unmanaged
- Créer une solution, y ajouter des composants
- Comprendre publisher et prefix
- Exporter / importer une solution
- Comprendre les layers et la surcharge de composants
- Gérer environment variables et connection references dans une solution
- ⭐ Tout composant hors solution = non déployable proprement
- ⚠️ Modifier une solution managed directement = dette technique immédiate

### P0-T9 — PAC CLI et outillage développeur 🟢 Commande / Action
- Installer PAC CLI
- Authentifier un environnement (`pac auth create`)
- Exporter / importer une solution (`pac solution export/import`)
- Créer un projet PCF (`pac pcf init`)
- Utiliser `pac canvas pack/unpack` pour versionner les apps
- Comprendre intégration avec VS Code et Power Platform Tools extension
- ⭐ PAC CLI est l'outil de base pour tout workflow ALM sérieux
- ⚠️ `pac solution import --force-overwrite` en prod sans sauvegarde = risque de perte de données

### P0-T10 — ALM, pipelines et stratégie Dev/Test/Prod 🟡 Pattern
- Comprendre le cycle ALM Power Platform (développement → export → déploiement)
- Configurer Power Platform Pipelines (natif, sans Azure DevOps)
- Configurer un pipeline Azure DevOps ou GitHub Actions avec PAC CLI
- Gérer variables d'environnement par cible de déploiement
- Stratégie de versioning des solutions
- ⭐ Environment variables + connection references = les deux clés d'un déploiement propre
- ⚠️ Déployer une solution unmanaged en prod = impossibilité de rollback propre

### P0-T11 — Sécurité, identité et conformité 🟡 Pattern
- Comprendre Entra ID dans le contexte Power Platform (SSO, groupes, licences)
- Comprendre Conditional Access et son impact sur les apps/flows
- Configurer audit logs et activity monitoring (Admin Center)
- Comprendre sensitivity labels sur les composants Power Platform
- Comprendre conformité RGPD : données Dataverse, logs, résidence
- ⭐ La sécurité se configure à 3 niveaux : Entra ID → DLP → Security roles Dataverse
- ⚠️ Le Default environment est partagé par tous les utilisateurs du tenant — jamais de données sensibles

---

## ═══════════════════════════════════════════════════
## 🧱 PILIER 1 — Power Apps
## ═══════════════════════════════════════════════════

### 🟢 NIVEAU 1 — Fondations

#### P1-T1 — Types d'applications Power Apps 🔵 Concept
- Distinguer Canvas App vs Model-Driven App vs Pages (Power Pages)
- Comprendre quand utiliser chaque type (critères : UX libre vs formulaire structuré)
- Comprendre les licences associées à chaque type
- Comprendre les limites de chaque type (delegation, offline, personnalisation)
- ⭐ Canvas = liberté UX totale ; Model-Driven = formulaire Dataverse piloté par métadonnées
- ⚠️ Mélanger Canvas et Model-Driven dans un même projet sans stratégie claire = complexité inutile

#### P1-T2 — Première Canvas App 🟢 Commande / Action
- Créer une app depuis un blank ou un template
- Naviguer dans Power Apps Studio (tree view, formula bar, properties)
- Ajouter écrans, galeries, formulaires
- Connecter une source de données (SharePoint, Dataverse)
- Publier et partager une app
- ⭐ Comprendre la relation Screen → Control → Property → Formula dès le début
- ⚠️ "Save" ≠ "Publish" — une app sauvegardée n'est pas visible par les autres

#### P1-T3 — Power Fx fondamental 🟢 Commande / Action
- Comprendre la syntaxe Power Fx (expression-based, non-impératif)
- Utiliser `If`, `Switch`, `IsBlank`, `IsEmpty`
- Utiliser `Filter`, `Search`, `LookUp`, `Sort`
- Utiliser `Patch`, `Collect`, `Remove`, `ClearCollect`
- Utiliser `Navigate`, `Back`, `Notify`
- Comprendre named formulas (App.Formulas) — évite les répétitions et améliore la lisibilité
- Utiliser `With()` pour des calculs locaux lisibles
- ⭐ `Patch` et `Filter` sont les deux fonctions les plus utilisées en production
- ⚠️ Un `Filter` non délégable ou basé sur un opérateur non délégable retourne un résultat tronqué sur les 500/2000 premiers enregistrements seulement — sans erreur visible. Une colonne non indexée pose surtout un problème de performance côté source, pas de troncature.
- ⚠️ Power Fx n'est pas JavaScript : pas d'effets de bord, pas de boucles impératives

#### P1-T4 — Delegation et limites Canvas 🔴 Piège
- Comprendre le concept de delegation (exécution côté serveur vs côté client)
- Identifier les fonctions non-delegables (warning jaune)
- Comprendre la limite de 500/2000 enregistrements par défaut
- Stratégies pour contourner : vues Dataverse filtrées, pagination, colonnes indexées
- ⭐ Delegation est la première source de bugs silencieux en Canvas App
- ⚠️ Un `Filter` sur une colonne non-indexée Dataverse = résultat tronqué sans erreur visible

#### P1-T5 — Premières Model-Driven Apps 🟢 Commande / Action
- Créer une Model-Driven App depuis Power Apps
- Ajouter tables, vues, formulaires, dashboards
- Configurer navigation et sitemap
- Comprendre business rules (côté serveur, sans code)
- Comprendre colonnes calculées et rollup dans Dataverse
- ⭐ Model-Driven Apps héritent automatiquement du modèle de sécurité Dataverse
- ⚠️ Personnaliser le formulaire principal sans tester le comportement mobile = mauvaise expérience terrain

#### P1-T6 — Sécurité Power Apps niveau débutant 🔴 Piège
- Comprendre que partager une app ≠ donner accès aux données
- Configurer accès à la source de données séparément de l'app
- Gérer co-owners vs users
- Comprendre impact des connexions partagées vs connexions utilisateur
- ⭐ L'app est une interface : la sécurité réelle est dans Dataverse ou SharePoint
- ⚠️ Partager une app avec connexion embedded = l'utilisateur agit avec les droits du propriétaire de connexion

---

### 🟡 NIVEAU 2 — Intermédiaire

#### P1-T7 — Canvas Apps connectées à Dataverse, SharePoint, SQL et API 🟢 Commande / Action
- Utiliser le connecteur Dataverse (tables, vues, relations)
- Utiliser le connecteur SharePoint (listes, limites de delegation)
- Utiliser le connecteur SQL Server
- Appeler une API REST via HTTP ou custom connector
- Gérer multi-source dans une même app
- ⭐ Dataverse est la source recommandée pour les apps complexes (delegation totale, sécurité intégrée)
- ⚠️ SharePoint a des limites de delegation plus sévères que Dataverse — vérifier avant de choisir

#### P1-T8 — Collections, variables et état applicatif 🟢 Commande / Action
- Distinguer variable globale, variable contextuelle, collection
- Utiliser `Set`, `UpdateContext`, `ClearCollect`, `Collect`
- Gérer l'état de navigation entre écrans
- Stocker état temporaire (filtres, sélections) dans des variables
- Éviter les collections inutiles (préférer sources directes si delegation possible)
- ⚠️ Trop de collections en mémoire = app lente sur appareils modestes

#### P1-T9 — Responsive design et accessibilité 🟡 Pattern
- Comprendre layout auto vs coordonnées fixes
- Utiliser containers et flexible height
- Gérer breakpoints pour tablet/phone
- Configurer `TabIndex`, `AccessibleLabel`, couleurs contrastées
- Tester avec le vérificateur d'accessibilité intégré
- ⚠️ Une app conçue uniquement pour desktop est souvent inutilisable sur terrain mobile

#### P1-T10 — Composants et bibliothèques de composants 🟡 Pattern
- Créer un composant (header, nav, formulaire réutilisable)
- Définir propriétés d'entrée/sortie d'un composant
- Créer une bibliothèque de composants partagée
- Importer des composants dans plusieurs apps
- ⭐ Les composants évitent la duplication et facilitent la maintenance
- ⚠️ Modifier un composant partagé impacte toutes les apps qui l'utilisent — versionner

#### P1-T11 — Tests, qualité et App Checker 🟡 Pattern
- Utiliser App Checker (erreurs, avertissements, accessibilité)
- Stratégie de test manuel (scénarios métier, devices)
- Comprendre Power Apps Test Studio (test automatisé basique)
- Documenter les écrans et la logique
- ⚠️ App Checker ne détecte pas les bugs de logique métier — les tests manuels restent indispensables

#### P1-T12 — ALM spécifique Power Apps 🟢 Commande / Action
- Ajouter une Canvas App dans une solution
- Utiliser `pac canvas pack/unpack` pour versionner en Git
- Gérer les dépendances (connexions, flows, tables) dans la solution
- Configurer déploiement via pipeline
- ⭐ Canvas App dans une solution = seule façon de déployer proprement entre environnements

---

### 🔵 NIVEAU 3 — Avancé / Expert

#### P1-T13 — PCF Controls (PowerApps Component Framework) 🟢 Commande / Action
- Comprendre PCF : composant React/TypeScript dans Power Apps
- Créer un PCF avec `pac pcf init`
- Implémenter `init`, `updateView`, `destroy`
- Tester avec le harness local
- Packager et déployer dans une solution
- ⭐ PCF permet d'aller là où Power Fx ne suffit plus (visualisations custom, interactions complexes)
- ⚠️ PCF ajoute une dépendance de code à maintenir — justifier par un besoin réel

#### P1-T14 — Performance avancée Canvas 🟡 Pattern
- Utiliser `Concurrent` pour charger plusieurs sources en parallèle
- Optimiser formules OnStart (éviter surcharge au démarrage)
- Déléguer au maximum vers la source de données
- Réduire nombre de contrôles par écran
- Utiliser Performance Monitor (Power Apps Studio)
- ⭐ `Concurrent` peut diviser le temps de chargement par 3-4 sur apps multi-sources
- ⚠️ Un `OnStart` chargé avec 10 `ClearCollect` séquentiels = app lente systématiquement

#### P1-T15 — Sécurité avancée et anti-patterns 🔴 Piège
- Comprendre les risques d'injection via formules non validées
- Ne jamais stocker de secrets dans une app (utiliser Azure Key Vault via connecteur)
- Comprendre risques des connexions partagées (embedded credentials)
- Auditer une app existante (App Checker + revue manuelle)
- ⭐ Les secrets ne doivent jamais être hard-codés dans une Canvas App — ils sont visibles

#### P1-T16 — Architecture Power Apps production 🟡 Pattern
- Choisir Canvas vs Model-Driven vs hybride selon le contexte
- Structurer une app complexe (modules, navigation, state management)
- Gérer versioning et rollback
- Stratégie de migration (SharePoint → Dataverse)
- Documenter une architecture Power Apps pour une équipe
- ⭐ Une app de prod non documentée devient vite un "black box" ingérable

---

## ═══════════════════════════════════════════════════
## 🧱 PILIER 2 — Power Automate
## ═══════════════════════════════════════════════════

### 🟢 NIVEAU 1 — Fondations

#### P2-T1 — Types de flows 🔵 Concept
- Distinguer Cloud Flow (automatisé, instantané, planifié) vs Desktop Flow (RPA) vs Business Process Flow
- Comprendre déclencheurs : automatisé (événement), instantané (manuel/app), planifié (schedule)
- Comprendre les limites par type (API calls, fréquence, timeout)
- ⭐ Choisir le bon type de déclencheur conditionne toute l'architecture du flow
- ⚠️ Un flow "automatisé" mal déclenché peut tourner en boucle infinie — toujours prévoir condition d'arrêt

#### P2-T2 — Premier Cloud Flow 🟢 Commande / Action
- Créer un flow depuis un template et depuis zéro
- Ajouter déclencheur, actions, conditions
- Utiliser "dynamic content" et expressions simples
- Tester et inspecter les runs
- Partager un flow
- ⭐ Lire le run history dès le début — c'est le seul outil de debug natif

#### P2-T3 — Expressions Power Automate 🟢 Commande / Action
- Comprendre le langage d'expressions (basé sur Azure Logic Apps)
- Utiliser `formatDateTime`, `utcNow`, `addDays`
- Utiliser `concat`, `substring`, `replace`, `trim`
- Utiliser `json`, `string`, `int`, `float` (conversions)
- Utiliser `if`, `equals`, `greater`, `empty`, `coalesce`
- ⭐ `coalesce` et `empty` sont indispensables pour gérer les valeurs nulles
- ⚠️ Les expressions ne sont pas Power Fx — syntaxe différente, ne pas confondre

#### P2-T4 — Conditions, boucles et variables 🟢 Commande / Action
- Utiliser Condition, Switch
- Utiliser Apply to each, Do until
- Créer et modifier des variables (Initialize variable, Set variable, Append)
- Comprendre la concurrence des Apply to each (parallélisme)
- ⚠️ `Apply to each` séquentiel sur 1000 items = lenteur importante — activer concurrence si applicable

#### P2-T5 — Sécurité et propriété des flows 🔴 Piège
- Comprendre co-owner vs run-only user
- Comprendre connexions utilisées dans un flow (propriétaire vs utilisateur)
- Risques des flows avec connexions embedded non contrôlées
- Gérer flows d'équipe et transitions de propriété
- ⭐ Quand le propriétaire d'un flow quitte l'entreprise, le flow s'arrête — prévoir co-owner ou compte service

---

### 🟡 NIVEAU 2 — Intermédiaire

#### P2-T6 — Dataverse et flows de solution 🟢 Commande / Action
- Créer un flow dans une solution (indispensable pour ALM)
- Utiliser le connecteur Dataverse (list rows, create row, update row, delete)
- Utiliser déclencheurs Dataverse (row added, modified, deleted)
- Comprendre environment variables dans les flows
- Comprendre connection references dans les flows de solution
- ⭐ Un flow hors solution est non-déployable proprement — toujours travailler en solution
- ⚠️ Connecteur Dataverse (current environment) vs connecteur Dataverse (autre env) : deux connecteurs différents

#### P2-T7 — HTTP, API REST et custom connector 🟢 Commande / Action
- Utiliser l'action HTTP pour appeler une API externe
- Gérer authentification : API key, OAuth, Basic
- Parser une réponse JSON (`json()`, `body()`)
- Créer un custom connector depuis OpenAPI (Swagger)
- Tester le custom connector
- ⭐ Le custom connector transforme une API externe en connecteur réutilisable dans toute la plateforme
- ⚠️ L'action HTTP brute est Premium — vérifier licence avant conception

#### P2-T8 — Gestion d'erreur, retry et scopes 🔴 Piège
- Utiliser Scope pour grouper des actions
- Configurer "Configure run after" (a échoué, expiré, été ignoré)
- Gérer erreurs avec `outputs()` et `result()`
- Implémenter pattern Try/Catch/Finally avec scopes
- Configurer retry policy sur les actions HTTP
- ⭐ Pattern Try/Catch avec scopes = standard de production pour tout flow critique
- ⚠️ Sans gestion d'erreur, un flow qui échoue silencieusement peut corrompre des données

#### P2-T9 — Approbations et workflows humains 🟢 Commande / Action
- Utiliser le connecteur Approvals
- Créer approbation simple et approbation séquentielle/parallèle
- Gérer timeout et relances
- Intégrer approbation dans Teams
- Journaliser les décisions dans Dataverse
- ⚠️ Une approbation sans timeout peut bloquer un flow indéfiniment

#### P2-T10 — Desktop Flows et RPA 🟢 Commande / Action
- Installer Power Automate Desktop
- Créer un flow desktop (recorder, actions manuelles)
- Gérer sélecteurs UI (robustesse des sélecteurs)
- Passer paramètres depuis un cloud flow
- Gérer erreurs dans les flows desktop
- Comprendre modes Attended vs Unattended
- ⭐ RPA = dernier recours quand aucune API n'existe — toujours préférer une API si disponible
- ⚠️ Les sélecteurs UI cassent souvent lors des mises à jour de l'application cible

---

### 🔵 NIVEAU 3 — Avancé / Expert

#### P2-T11 — Monitoring et observabilité des flows 🟢 Commande / Action
- Lire et interpréter le run history
- Configurer alertes sur échec (via flow de monitoring)
- Utiliser Dataverse, Power BI ou logs custom pour centraliser les événements des flows critiques
- Intégrer Application Insights via appels HTTP/API pour les scénarios avancés de traçabilité (pas une intégration native clé en main)
- Créer un dashboard Power BI de supervision des flows
- Auditer les flows d'un environnement (Admin Center)
- ⭐ Un flow de monitoring qui surveille les flows critiques = pratique standard en prod

#### P2-T12 — Process Mining / Process Advisor 🔵 Concept
- Comprendre le process mining (analyse de logs pour cartographier un processus)
- Utiliser Process Advisor pour analyser des données de processus
- Comprendre la convergence avec Microsoft Fabric (évolution du produit)
- Identifier les goulots d'étranglement et opportunités d'automatisation
- ⚠️ "Process Advisor" devient "Process Mining" dans Fabric — terminologie en transition

#### P2-T13 — Architecture Power Automate production 🟡 Pattern
- Patterns de flows réutilisables (child flows)
- Stratégie de flows enfants pour modulariser la logique
- Gestion des volumes élevés (batching, pagination Dataverse)
- Stratégie de retry et idempotence
- Documenter et nommer les flows pour une équipe
- ⭐ Child flows = seul moyen de réutiliser de la logique entre plusieurs flows sans duplication

---

## ═══════════════════════════════════════════════════
## 🧱 PILIER 3 — Power BI
## ═══════════════════════════════════════════════════

### 🟢 NIVEAU 1 — Fondations

#### P3-T1 — Architecture Power BI 🔵 Concept
- Comprendre Power BI Desktop vs Power BI Service
- Comprendre report, semantic model (ex-dataset), dashboard, app, workspace
- Comprendre modes de connexion : Import, DirectQuery, Live Connection
- Comprendre gateway et son rôle
- ⭐ Schéma : Source → Power Query → Model → DAX → Report → Service
- ⚠️ "Dataset" est progressivement remplacé par "semantic model" dans la terminologie Microsoft

#### P3-T2 — Power Query fondamental 🟢 Commande / Action
- Importer depuis Excel, CSV, SharePoint, SQL
- Nettoyer colonnes, types, valeurs nulles
- Fusionner et ajouter des requêtes
- Comprendre étapes appliquées
- Lire les bases du langage M
- ⭐ La qualité du Power Query conditionne la fiabilité de tout le modèle
- ⚠️ Mauvais typage = DAX et visuels instables

#### P3-T3 — Modélisation en étoile 🔵 Concept
- Distinguer table de faits et dimensions
- Créer relations 1-N
- Gérer cardinalité et direction de filtre
- Créer une table calendrier
- Comprendre pourquoi éviter les modèles "tout dans une table"
- ⭐ `Date = CALENDAR(DATE(2024,1,1), DATE(2026,12,31))`
- ⚠️ Un modèle "tout dans une table" devient vite limité et non-performant

#### P3-T4 — DAX fondamental 🟢 Commande / Action
- Distinguer mesure et colonne calculée
- Créer `SUM`, `COUNTROWS`, `DISTINCTCOUNT`
- Utiliser `CALCULATE`
- Comprendre contexte de ligne et contexte de filtre
- Utiliser variables (`VAR`)
- ⭐ `CA Total = SUM(Sales[Amount])`
- ⚠️ `CALCULATE` est central mais souvent mal compris — comprendre le contexte de filtre avant tout

#### P3-T5 — Visualisations et storytelling 🟢 Commande / Action
- Choisir le visuel selon la question métier
- Utiliser slicers, cards, matrices, line charts
- Créer drill-through et drill-down
- Structurer une page avec hiérarchie visuelle
- Prévoir accessibilité et lisibilité
- ⚠️ Un beau dashboard sans question métier claire ne sert à rien

---

### 🟡 NIVEAU 2 — Intermédiaire

#### P3-T6 — DAX intermédiaire et Time Intelligence 🟢 Commande / Action
- Utiliser `TOTALYTD`, `DATEADD`, `SAMEPERIODLASTYEAR`
- Créer mesures avec `VAR`
- Utiliser `DIVIDE` (éviter division par zéro)
- Gérer filtres avec `ALL`, `REMOVEFILTERS`, `KEEPFILTERS`
- Créer mesures dynamiques
- ⭐ `CA N-1 = CALCULATE([CA Total], SAMEPERIODLASTYEAR('Date'[Date]))`
- ⚠️ Time Intelligence exige une vraie table calendrier marquée comme telle

#### P3-T7 — DirectQuery et composite models 🔵 Concept
> **Thème ajouté** — absent du plan original, critique pour les choix d'architecture

- Comprendre DirectQuery : avantages (fraîcheur) vs inconvénients (performance, limites DAX)
- Comprendre Import : avantages (vitesse) vs inconvénients (fraîcheur, volume)
- Comprendre les composite models (Mix Import + DirectQuery)
- Choisir le bon mode selon le contexte (volume, fraîcheur, performance attendue)
- Comprendre les limites DAX en mode DirectQuery
- ⭐ Le choix Import/DirectQuery est une décision d'architecture irréversible à court terme
- ⚠️ DirectQuery sur source lente = rapport inutilisable — toujours tester les performances de la source

#### P3-T8 — Power BI Service, workspaces et apps 🟡 Pattern
- Publier depuis Desktop
- Gérer workspace Dev/Test/Prod
- Créer une Power BI App
- Gérer permissions viewer/contributor/member/admin
- Organiser le contenu par domaine métier
- ⚠️ Partager des rapports individuellement devient ingérable à grande échelle — utiliser les apps

#### P3-T9 — Refresh, gateways et dataflows 🟢 Commande / Action
- Configurer scheduled refresh
- Installer et configurer gateway
- Comprendre credentials et privacy levels
- Créer un dataflow réutilisable
- Diagnostiquer "refresh failed"
- ⚠️ Gateway offline = refresh impossible — monitorer l'état de la gateway

#### P3-T10 — RLS, sécurité et partage 🔴 Piège
- Créer un rôle RLS
- Tester "View as role"
- Utiliser `USERPRINCIPALNAME()`
- Comprendre partage workspace vs app vs audience
- Utiliser sensitivity labels si contexte entreprise
- ⭐ `[Email] = USERPRINCIPALNAME()`
- ⚠️ RLS ne corrige pas un mauvais modèle de données — modéliser d'abord, sécuriser ensuite

---

### 🔵 NIVEAU 3 — Avancé / Expert

#### P3-T11 — Performance Power BI 🟡 Pattern
- Réduire la cardinalité des colonnes
- Optimiser le modèle en étoile
- Éviter les colonnes calculées inutiles (préférer mesures)
- Utiliser Performance Analyzer
- Optimiser DAX avec variables et mesures dédiées
- ⭐ La plupart des lenteurs viennent du modèle, pas des visuels
- ⚠️ Remplacer une colonne calculée par une mesure quand le calcul dépend du contexte de filtre

#### P3-T12 — Power BI Embedded et REST API 🟢 Commande / Action
- Comprendre Embedded pour applications internes/externes
- Comprendre workspace, capacity, embed token
- Utiliser REST API pour refresh, export, gestion de contenu
- Intégrer un rapport dans Power Apps ou portail
- Sécuriser l'accès avec Entra ID
- ⭐ `POST /groups/{groupId}/datasets/{datasetId}/refreshes`
- ⚠️ Embedded ajoute un vrai sujet licence/capacité — prévoir en amont

#### P3-T13 — Fabric, Dataflows Gen2 et architecture analytique moderne 🔵 Concept
- Comprendre la place de Power BI dans Microsoft Fabric
- Comprendre Lakehouse, Warehouse, Dataflow Gen2
- Distinguer self-service BI et analytics engineering
- Préparer un semantic model réutilisable (certified/promoted)
- Comprendre la certification et l'endorsement de semantic models
- ⭐ Architecture : Dataflow Gen2 → Lakehouse → Semantic model → Report
- ⚠️ Fabric n'annule pas les fondamentaux Power BI : modèle et gouvernance restent clés

#### P3-T14 — Gouvernance Power BI 🟡 Pattern
- Nommer workspaces et rapports de façon cohérente
- Gérer ownership et succession
- Certifier/promouvoir les semantic models
- Auditer les usages (Admin portal, Activity log)
- Documenter les KPIs (dictionnaire : Nom → Formule DAX → Source → Owner)
- ⚠️ Sans gouvernance, chaque équipe recrée ses propres chiffres — contradiction garantie

---

## ═══════════════════════════════════════════════════
## 🧱 PILIER 4 — Power Pages
## ═══════════════════════════════════════════════════

### 🟢 NIVEAU 1 — Fondations

#### P4-T1 — Rôle de Power Pages 🔵 Concept
- Comprendre le portail externe connecté à Dataverse
- Distinguer site public, espace client, portail partenaire
- Comprendre pages, navigation, thèmes
- Comprendre templates et formulaires
- Distinguer Power Pages vs Canvas App (usage interne vs externe)
- ⭐ Mapping : visiteur anonyme/authentifié → page → table Dataverse
- ⚠️ Power Pages expose potentiellement des données à l'extérieur — sécurité prioritaire dès le départ

#### P4-T2 — Premier site Power Pages 🟢 Commande / Action
- Créer un site depuis un template
- Modifier pages et navigation
- Appliquer un thème
- Ajouter sections texte, image, formulaire
- Prévisualiser desktop/mobile
- ⚠️ Le design rapide ne doit pas faire oublier les permissions Dataverse

#### P4-T3 — Formulaires et listes Dataverse 🟢 Commande / Action
- Ajouter un formulaire basique
- Ajouter un formulaire multistep
- Ajouter une liste Dataverse
- Contrôler les colonnes affichées
- Gérer création, lecture, modification
- ⭐ Formulaire Contact request → Dataverse table Lead
- ⚠️ Afficher un formulaire ne suffit pas : table permissions obligatoires

---

### 🟡 NIVEAU 2 — Intermédiaire

#### P4-T4 — Sécurité Power Pages : web roles et table permissions 🔴 Piège
- Créer des web roles
- Configurer table permissions (global/contact/account/self)
- Contrôler l'accès aux pages
- Tester avec un utilisateur externe réel
- ⭐ Règle : Contact peut lire uniquement ses propres demandes
- ⚠️ Mauvaises table permissions = fuite de données vers des utilisateurs non autorisés

#### P4-T5 — Authentification et identité externe 🟢 Commande / Action
- Configurer login local
- Configurer Entra ID / Entra External ID selon le contexte
- Gérer fournisseurs externes (Google, LinkedIn…)
- Mapper contact Dataverse à l'identité externe
- Gérer inscription, invitation et profil utilisateur
- ⭐ Matrice : public / client / partenaire → provider auth approprié
- ⚠️ Le modèle d'identité doit être clarifié avant ouverture publique

#### P4-T6 — Liquid templates : syntaxe et objets 🟢 Commande / Action
> **Thème élargi et précisé** — séparé en deux sous-parties dans le contenu

- Comprendre la syntaxe Liquid (balises, filtres, objets)
- Accéder aux variables et objets Power Pages (`user`, `page`, `request`…)
- Accéder aux attributs Dataverse par nom logique
- Créer des boucles et conditions : `{% for item in entities %}`, `{% if %}`
- ⭐ `{{ user.fullname }}` et `{% for item in entities %}`

#### P4-T7 — Liquid templates : web templates et content snippets 🟡 Pattern
> **Thème ajouté** — séparé de T6 car usage distinct

- Créer un web template réutilisable
- Utiliser content snippets pour les textes gérables sans code
- Réutiliser des layouts via templates imbriqués
- Organiser les templates pour faciliter la maintenance
- ⚠️ Liquid sans conventions de nommage devient vite ingérable à plusieurs développeurs

---

### 🔵 NIVEAU 3 — Avancé / Expert

#### P4-T8 — Portals Web API 🟢 Commande / Action
- Comprendre les opérations CRUD côté client via Web API
- Appeler Dataverse depuis JavaScript
- Respecter les table permissions dans les appels API
- Gérer CSRF/token selon le modèle d'authentification
- Construire des expériences plus dynamiques sans rechargement de page
- ⭐ `/_api/accounts?$select=name`
- ⚠️ La Web API ne contourne pas la sécurité Power Pages — les permissions s'appliquent aussi

#### P4-T9 — Intégration Power Automate et Copilot Studio 🟡 Pattern
- Déclencher un flow depuis un formulaire Power Pages
- Envoyer des notifications (email, Teams)
- Créer une validation back-office via flow
- Ajouter un agent Copilot Studio sur le site
- Journaliser les interactions dans Dataverse
- ⭐ Scénario type : Form submitted → Flow → Teams notification → Dataverse update
- ⚠️ Ne jamais mettre la logique critique uniquement côté JavaScript — toujours valider côté serveur/flow
- ⚠️ Cross-référence Scénario C : ajouter `P1-T9 (responsive)` quand le rapport Power BI est intégré dans un portail

#### P4-T10 — Performance, SEO et exploitation 🟡 Pattern
- Optimiser pages et assets (images, scripts)
- Gérer le cache portail
- Prévoir SEO pour le contenu public (balises, sitemap)
- Monitorer erreurs et soumissions de formulaires
- Prévoir l'accessibilité (WCAG)
- ⚠️ Un portail lent ou mal sécurisé entraîne un rejet immédiat des utilisateurs externes

---

## ═══════════════════════════════════════════════════
## 🧱 PILIER 5 — Copilot Studio
## ═══════════════════════════════════════════════════

### 🟢 NIVEAU 1 — Fondations

#### P5-T1 — Concepts Copilot Studio 🔵 Concept
- Comprendre agent, topic, trigger phrase, node
- Comprendre entities et variables
- Comprendre actions
- Comprendre les canaux : Teams, web, autres
- Distinguer agent scripté (topic-based) vs agent génératif (orchestration générative)
- ⭐ Diagramme : User → Topic → Question → Variable → Action → Response
- ⚠️ Un agent n'est pas juste un chatbot FAQ — il peut agir sur des systèmes via connecteurs et flows

#### P5-T2 — Premier agent 🟢 Commande / Action
- Créer un agent
- Créer un topic
- Ajouter des phrases de déclenchement
- Ajouter questions et branches
- Tester dans le panneau de test intégré
- ⚠️ Trop de topics qui se chevauchent dégradent l'expérience utilisateur — travailler les phrases de déclenchement

#### P5-T3 — Variables, branches et entities 🟢 Commande / Action
- Stocker la réponse utilisateur dans une variable
- Créer des branches conditionnelles
- Utiliser une entity prédéfinie (âge, email, date…)
- Créer une entity personnalisée
- Réutiliser une variable dans un message
- ⭐ `if varPriority = "Urgent" then escalate`
- ⚠️ Variables mal nommées = agent impossible à maintenir et débugger

---

### 🟡 NIVEAU 2 — Intermédiaire

#### P5-T4 — Actions Power Automate depuis un agent 🟢 Commande / Action
- Créer une action appelant un flow Power Automate
- Passer des paramètres utilisateur au flow
- Récupérer la réponse du flow dans l'agent
- Gérer les erreurs du flow (timeout, échec)
- Confirmer une action avant exécution (pour les actions modifiant des données)
- ⭐ Agent → Flow GetOrderStatus → Response
- ⚠️ Une action qui modifie des données doit confirmer intention et identité avant exécution

#### P5-T5 — Sources de connaissances et réponses génératives 🟢 Commande / Action
- Ajouter un site web ou documentation comme source
- Ajouter des sources SharePoint (contexte M365)
- Utiliser les generative answers (réponses générées depuis les sources)
- Limiter les sources selon le besoin (éviter les réponses hors scope)
- Tester hallucinations et réponses hors contexte
- ⚠️ Plus de sources ne signifie pas de meilleures réponses — qualifier et limiter

#### P5-T6 — Authentification et sécurité des agents 🟡 Pattern
- Distinguer agent public vs agent authentifié
- Gérer l'accès dans Teams (tous les membres vs groupe restreint)
- Protéger les actions sensibles (vérifier identité avant action)
- Filtrer les données renvoyées selon l'utilisateur connecté
- Auditer les conversations selon les règles internes
- ⭐ Matrice : action → données → niveau d'authentification requis
- ⚠️ Un agent connecté à des données internes doit respecter les droits utilisateur — ne pas bypasser la sécurité

---

### 🔵 NIVEAU 3 — Avancé / Expert

#### P5-T7 — RAG et orchestration générative 🟡 Pattern
- Comprendre Retrieval Augmented Generation (RAG)
- Structurer les sources documentaires pour une bonne récupération
- Définir les limites de réponse (scope, disclaimer)
- Tester qualité, hallucination et citations
- Distinguer orchestration classique (topic-based) vs générative (le modèle choisit dynamiquement topics et actions)
- ⭐ Grille d'évaluation : question → source attendue → réponse → conformité
- ⚠️ RAG mal gouverné = réponses crédibles mais factuellement fausses

#### P5-T8 — Canaux, publication et monitoring 🟢 Commande / Action
- Publier un agent
- Déployer dans Teams
- Déployer sur un site web (widget)
- Déployer dans Microsoft 365 Copilot (Copilot extensions)
- Lire les analytics (sessions, résolution, escalades, fallbacks)
- Identifier les topics non résolus et améliorer
- ⭐ KPIs : sessions, escalation rate, resolution rate, fallback rate
- ⚠️ Publier sans monitoring empêche toute amélioration continue

#### P5-T9 — Gouvernance Copilot Studio 🟡 Pattern
- Définir les owners et le cycle de revue des agents
- Valider et restreindre les sources autorisées
- Contrôler les actions disponibles (whitelist)
- Intégrer les DLP policies (impact sur les connecteurs utilisés)
- Prévoir un cycle de revue des réponses (qualité, conformité)
- ⭐ Checklist : owner + sources + actions + auth + monitoring + review cycle
- ⚠️ Les agents IA doivent être gouvernés comme des applications métier — pas comme des chatbots jetables

---

## ═══════════════════════════════════════════════════
## 🧱 PILIER 6 — Interopérabilité & Architecture
## ═══════════════════════════════════════════════════

> Ce pilier liste des scénarios concrets multi-outils. Chaque scénario référence les thèmes des piliers précédents.

---

**Scénario A — Canvas App avec flows déclenchés depuis Power Apps**  
Outils impliqués : Power Apps + Power Automate + Dataverse  
Description : Application de demande interne qui crée un enregistrement Dataverse puis déclenche notification, approbation et mise à jour de statut.  
Thèmes couverts : P1-T2, P1-T7, P1-T8, P2-T2, P2-T8, P0-T8, P0-T10.

---

**Scénario B — Portail Power Pages alimenté par Dataverse + notifications Automate**  
Outils impliqués : Power Pages + Dataverse + Power Automate + Outlook/Teams  
Description : Portail client permettant de soumettre et suivre des demandes, avec notifications internes automatiques.  
Thèmes couverts : P4-T1, P4-T3, P4-T4, P4-T9, P2-T6, P0-T11.

---

**Scénario C — Dashboard Power BI embarqué dans une Canvas App**  
Outils impliqués : Power Apps + Power BI + Dataverse  
Description : Application métier avec écran opérationnel et rapport Power BI intégré pour suivi KPI.  
Thèmes couverts : P1-T7, P1-T9, P3-T1, P3-T5, P3-T10, P3-T12, P0-T2.  
> ⚠️ P1-T9 (responsive design) est critique ici — un rapport embarqué dans une Canvas App mal dimensionnée est inutilisable.

---

**Scénario D — Agent Copilot Studio dans Teams avec actions Automate**  
Outils impliqués : Copilot Studio + Teams + Power Automate + Dataverse  
Description : Agent interne qui répond aux questions et exécute des actions comme créer un ticket ou consulter un statut.  
Thèmes couverts : P5-T1, P5-T4, P5-T6, P2-T7, P2-T8, P0-T7.

---

**Scénario E — Pipeline CI/CD PAC CLI pour solution multi-composants**  
Outils impliqués : PAC CLI + Solutions + Power Apps + Power Automate + Dataverse  
Description : Industrialiser une solution contenant app, flows, tables, rôles et variables d'environnement.  
Thèmes couverts : P0-T8, P0-T9, P0-T10, P1-T12, P2-T6.

---

**Scénario F — Architecture CoE : inventaire, DLP et gouvernance**  
Outils impliqués : Power Platform Admin Center + CoE Starter Kit + DLP + Power BI  
Description : Mettre en place gouvernance tenant, inventaire des apps/flows, politiques de connecteurs et monitoring d'adoption.  
Thèmes couverts : P0-T3, P0-T7, P0-T11, P3-T14, P2-T11.

---

**Scénario G — Application métier complète Dataverse-first**  
Outils impliqués : Dataverse + Model-Driven App + Canvas App + Power BI  
Description : Back-office Model-Driven, interface terrain Canvas et reporting Power BI sur un modèle Dataverse commun.  
Thèmes couverts : P0-T4, P0-T5, P1-T5, P1-T7, P3-T3, P3-T4, P3-T10.

---

**Scénario H — Intégration API externe via custom connector**  
Outils impliqués : Custom Connector + Power Automate + Power Apps + Dataverse  
Description : Connecter une API métier externe pour synchroniser commandes, clients ou tickets dans Dataverse.  
Thèmes couverts : P0-T6, P2-T7, P1-T7, P2-T13, P0-T2.

---

**Scénario I — RPA legacy + supervision Power BI**  
Outils impliqués : Power Automate Desktop + Cloud Flow + Dataverse + Power BI  
Description : Automatiser une application legacy sans API, journaliser les runs et visualiser erreurs/durées.  
Thèmes couverts : P2-T10, P2-T11, P3-T5, P3-T9, P3-T14.

---

**Scénario J — Agent IA sur portail client**  
Outils impliqués : Power Pages + Copilot Studio + Dataverse + Power Automate  
Description : Portail client avec agent IA authentifié capable de répondre, créer une demande et suivre son statut.  
Thèmes couverts : P4-T4, P4-T5, P4-T9, P5-T5, P5-T6, P5-T7.

---

## 🚨 BLOCS SOUVENT OUBLIÉS — Spécifique Power Platform

- **Licences** : connecteurs premium, HTTP, SQL, Dataverse, Power Pages, Copilot Studio, Power BI Pro/Premium/Fabric
- **DLP Policies** : critique en entreprise, souvent absente des formations débutantes
- **Environnements** : Default vs Dev/Test/Prod — jamais construire en prod dans le Default
- **Solutions managed/unmanaged** : cœur de l'ALM, ignoré par les formations citizen developer
- **PAC CLI** : indispensable pour développeur PL-400, quasi absent des formations standard
- **Connection references et environment variables** : indispensables pour un déploiement propre entre environnements
- **Security roles Dataverse** : souvent mal compris, confondu avec les permissions Power Apps
- **Column-level security Dataverse** : pratiquement jamais couverte dans les formations
- **Delegation Power Apps** : source majeure de bugs silencieux, souvent découverte en prod
- **RLS Power BI** : souvent confondu avec le partage de rapport
- **DirectQuery vs Import** : décision d'architecture critique souvent ignorée dans les formations débutantes
- **Gateway** : critique pour données on-premises, souvent traitée comme un détail
- **Custom connectors** : passerelle vers le SI réel, sous-estimés
- **Monitoring** : run history, audit, logs, adoption, erreurs, coûts
- **CoE Starter Kit** : gouvernance à l'échelle tenant
- **Power Pages permissions** : risques de fuite de données si mal configurées
- **Copilot Studio governance** : sources, actions, auth, monitoring, hallucination
- **Named formulas et `With()`** : Power Fx avancé, quasi absent des formations standard

---

## 👔 PROFIL RECRUTABLE

### Citizen Developer
**Attendu :**
- Créer Canvas Apps simples connectées à SharePoint ou Teams
- Créer flows simples (notification, approbation)
- Connecter SharePoint, Outlook, Teams
- Comprendre les limites de licences et de partage
- Utiliser Power BI basique

**Junior :** Crée des apps internes simples, a besoin d'encadrement sur sécurité, performance, ALM  
**Senior :** Standardise des composants, respecte la gouvernance, documente et transmet aux métiers

---

### Power Platform Developer — PL-400
**Attendu :**
- Power Fx solide (delegation, named formulas, `With`)
- Dataverse solide (modèle, security roles, column security)
- Power Automate avancé (child flows, gestion d'erreur, HTTP)
- PAC CLI et ALM (pipelines, solutions managed)
- PCF Controls
- Custom connectors
- API REST, JSON, JavaScript/TypeScript
- Solutions, connection references, environment variables

**Junior :** Développe apps/flows dans une solution, comprend Dataverse et Power Fx, déploie avec assistance  
**Senior :** Conçoit architecture complète, industrialise ALM, crée PCF/custom connectors, gère performance, sécurité et dette technique

---

### Architecte Power Platform / Dataverse
**Attendu :**
- Stratégie tenant/environnements
- Gouvernance DLP
- Modèle Dataverse robuste (sécurité incluse)
- Choix Canvas vs Model-Driven vs Power Pages
- Sécurité, intégration, licences, ALM
- Patterns multi-outils (scénarios Pilier 6)
- DirectQuery vs Import vs composite models

**Junior :** Peut cadrer une petite solution départementale  
**Senior :** Arbitre l'architecture entreprise, coûts, sécurité, intégrations, exploitation

---

### Administrateur / CoE Lead
**Attendu :**
- Admin Center (environnements, DLP, inventory)
- Gestion des makers et des licences
- Monitoring adoption et conformité
- CoE Starter Kit
- Gouvernance des connecteurs et des agents

**Junior :** Administre environnements et permissions  
**Senior :** Met en place gouvernance tenant, CoE, reporting, politiques et processus d'exception

---

## 🎯 PRIORITÉ RÉELLE — Si temps limité à 40–60h

Traiter en premier (ordre recommandé) :

1. P0-T1 — Écosystème Power Platform
2. P0-T2 — Licences et limites
3. P0-T3 — Environnements
4. P0-T4 — Dataverse : modèle de données
5. P0-T5 — Sécurité Dataverse (security roles)
6. P0-T7 — DLP Policies
7. P0-T8 — Solutions managed/unmanaged
8. P1-T2 — Première Canvas App
9. P1-T3 — Power Fx fondamental
10. P1-T4 — Delegation
11. P2-T2 — Premier Cloud Flow
12. P2-T8 — Gestion d'erreur et scopes
13. P3-T3 — Modélisation en étoile
14. P3-T4 — DAX fondamental
15. P3-T10 — RLS et partage
16. P6-ScénarioA — App + Flow + Dataverse

> Si ton objectif est d'être opérationnel en entreprise : Dataverse + Power Apps + Power Automate + ALM + DLP passent avant Copilot Studio et Power Pages.

---

## 🏆 CERTIFICATIONS ASSOCIÉES

| Certification | Statut | Thèmes principaux couverts |
|---|---|---|
| **PL-900** — Fundamentals | ✅ Active | P0-T1, P0-T2, P1-T1, P2-T1, P3-T1, P4-T1, P5-T1 |
| **PL-100** — App Maker | ❌ Retirée (30/06/2024) | Valeur pédagogique : P1-T2/T3/T5, P2-T2, P3-T5 |
| **PL-200** — Functional Consultant | ✅ Active | P0-T4/T5, P1-T2/T5/T6, P2-T2/T6, P0-T3/T8 |
| **PL-300** — Power BI Data Analyst | ✅ Active | P3 complet (T1 à T14), focus T2/T3/T4/T6/T7/T10 |
| **PL-400** — Developer | ✅ Active | P0-T9/T10, P1-T13/T14/T15/T16, P2-T7/T13, P0-T5/T8 |
| **PL-600** — Solution Architect | ⚠️ Retrait annoncé 30/06/2026 | P0 complet, P6 complet, P1-T16, P2-T13, P3-T14 |

---

## MODULES_TABLE

```yaml
# MODULES_TABLE
# Power Platform — Convention ID : P{pilier}_{num}_{slug}
# level : 0 = transversal, 1 = débutant, 2 = intermédiaire, 3 = avancé
# template : programming | devops | concept | ai | data | networking | security | certification
# subject_type : exploratoire | operationnel | architecture | comparatif | diagnostic

# ─── PILIER 0 — Fondations communes ───────────────────────────────────────────

- id: "P0_01_ecosysteme_power_platform"
  pilier: 0
  title: "Vue d'ensemble de l'écosystème Power Platform"
  level: 0
  template: concept
  subject_type: exploratoire
  priority: high

- id: "P0_02_licences_plans_limites"
  pilier: 0
  title: "Licences, plans et limites réelles"
  level: 0
  template: security
  subject_type: comparatif
  priority: high

- id: "P0_03_environnements_power_platform"
  pilier: 0
  title: "Environnements Power Platform"
  level: 0
  template: devops
  subject_type: operationnel
  priority: high

- id: "P0_04_dataverse_modele_donnees"
  pilier: 0
  title: "Dataverse : modèle de données"
  level: 0
  template: data
  subject_type: exploratoire
  priority: high

- id: "P0_05_dataverse_securite_roles"
  pilier: 0
  title: "Sécurité Dataverse : security roles et column-level security"
  level: 0
  template: security
  subject_type: operationnel
  priority: high

- id: "P0_06_connecteurs_connexions_gateway"
  pilier: 0
  title: "Connecteurs, connexions et gateway"
  level: 0
  template: networking
  subject_type: operationnel
  priority: high

- id: "P0_07_dlp_policies_gouvernance"
  pilier: 0
  title: "DLP Policies et gouvernance des connecteurs"
  level: 0
  template: security
  subject_type: diagnostic
  priority: high

- id: "P0_08_solutions_managed_unmanaged"
  pilier: 0
  title: "Solutions managed/unmanaged"
  level: 0
  template: devops
  subject_type: operationnel
  priority: high

- id: "P0_09_pac_cli_outillage_developpeur"
  pilier: 0
  title: "PAC CLI et outillage développeur"
  level: 0
  template: devops
  subject_type: operationnel
  priority: high

- id: "P0_10_alm_pipelines_dev_test_prod"
  pilier: 0
  title: "ALM, pipelines et stratégie Dev/Test/Prod"
  level: 0
  template: devops
  subject_type: architecture
  priority: high

- id: "P0_11_securite_identite_conformite"
  pilier: 0
  title: "Sécurité, identité et conformité"
  level: 0
  template: security
  subject_type: architecture
  priority: high

# ─── PILIER 1 — Power Apps ────────────────────────────────────────────────────

- id: "P1_01_types_applications_power_apps"
  pilier: 1
  title: "Types d'applications Power Apps"
  level: 1
  template: concept
  subject_type: comparatif
  priority: high

- id: "P1_02_premiere_canvas_app"
  pilier: 1
  title: "Première Canvas App"
  level: 1
  template: programming
  subject_type: operationnel
  priority: high

- id: "P1_03_power_fx_fondamental"
  pilier: 1
  title: "Power Fx fondamental"
  level: 1
  template: programming
  subject_type: operationnel
  priority: high

- id: "P1_04_delegation_limites_canvas"
  pilier: 1
  title: "Delegation et limites Canvas"
  level: 1
  template: programming
  subject_type: diagnostic
  priority: high

- id: "P1_05_premieres_model_driven_apps"
  pilier: 1
  title: "Premières Model-Driven Apps"
  level: 1
  template: data
  subject_type: operationnel
  priority: high

- id: "P1_06_securite_power_apps_debutant"
  pilier: 1
  title: "Sécurité Power Apps niveau débutant"
  level: 1
  template: security
  subject_type: operationnel
  priority: high

- id: "P1_07_connexion_donnees_apps"
  pilier: 1
  title: "Canvas Apps connectées à Dataverse, SharePoint, SQL et API"
  level: 2
  template: networking
  subject_type: operationnel
  priority: high

- id: "P1_08_collections_variables_etat"
  pilier: 1
  title: "Collections, variables et état applicatif"
  level: 2
  template: programming
  subject_type: operationnel
  priority: high

- id: "P1_09_responsive_accessibilite"
  pilier: 1
  title: "Responsive design et accessibilité"
  level: 2
  template: concept
  subject_type: operationnel
  priority: medium

- id: "P1_10_composants_bibliotheques"
  pilier: 1
  title: "Composants et bibliothèques de composants"
  level: 2
  template: programming
  subject_type: operationnel
  priority: medium

- id: "P1_11_tests_qualite_app_checker"
  pilier: 1
  title: "Tests, qualité et App Checker"
  level: 2
  template: concept
  subject_type: diagnostic
  priority: medium

- id: "P1_12_alm_power_apps"
  pilier: 1
  title: "ALM spécifique Power Apps"
  level: 2
  template: devops
  subject_type: operationnel
  priority: high

- id: "P1_13_pcf_controls"
  pilier: 1
  title: "PCF Controls"
  level: 3
  template: programming
  subject_type: operationnel
  priority: medium

- id: "P1_14_performance_canvas_avancee"
  pilier: 1
  title: "Performance avancée Canvas"
  level: 3
  template: programming
  subject_type: diagnostic
  priority: high

- id: "P1_15_securite_avancee_antipatterns"
  pilier: 1
  title: "Sécurité avancée et anti-patterns"
  level: 3
  template: security
  subject_type: diagnostic
  priority: high

- id: "P1_16_architecture_power_apps_production"
  pilier: 1
  title: "Architecture Power Apps production"
  level: 3
  template: concept
  subject_type: architecture
  priority: high

# ─── PILIER 2 — Power Automate ────────────────────────────────────────────────

- id: "P2_01_types_de_flows"
  pilier: 2
  title: "Types de flows"
  level: 1
  template: concept
  subject_type: comparatif
  priority: high

- id: "P2_02_premier_cloud_flow"
  pilier: 2
  title: "Premier Cloud Flow"
  level: 1
  template: programming
  subject_type: operationnel
  priority: high

- id: "P2_03_expressions_power_automate"
  pilier: 2
  title: "Expressions Power Automate"
  level: 1
  template: programming
  subject_type: operationnel
  priority: high

- id: "P2_04_conditions_boucles_variables"
  pilier: 2
  title: "Conditions, boucles et variables"
  level: 1
  template: programming
  subject_type: diagnostic
  priority: high

- id: "P2_05_securite_propriete_flows"
  pilier: 2
  title: "Sécurité et propriété des flows"
  level: 1
  template: security
  subject_type: operationnel
  priority: high

- id: "P2_06_dataverse_flows_solution"
  pilier: 2
  title: "Dataverse et flows de solution"
  level: 2
  template: devops
  subject_type: operationnel
  priority: high

- id: "P2_07_http_api_custom_connector"
  pilier: 2
  title: "HTTP, API REST et custom connector"
  level: 2
  template: networking
  subject_type: operationnel
  priority: high

- id: "P2_08_gestion_erreur_retry_scopes"
  pilier: 2
  title: "Gestion d'erreur, retry et scopes"
  level: 2
  template: programming
  subject_type: diagnostic
  priority: high

- id: "P2_09_approbations_workflows_humains"
  pilier: 2
  title: "Approbations et workflows humains"
  level: 2
  template: concept
  subject_type: operationnel
  priority: medium

- id: "P2_10_desktop_flows_rpa"
  pilier: 2
  title: "Desktop Flows et RPA"
  level: 2
  template: programming
  subject_type: operationnel
  priority: medium

- id: "P2_11_monitoring_observabilite_flows"
  pilier: 2
  title: "Monitoring et observabilité des flows"
  level: 3
  template: devops
  subject_type: diagnostic
  priority: high

- id: "P2_12_process_mining_process_advisor"
  pilier: 2
  title: "Process Mining / Process Advisor"
  level: 3
  template: data
  subject_type: exploratoire
  priority: medium

- id: "P2_13_architecture_power_automate_production"
  pilier: 2
  title: "Architecture Power Automate production"
  level: 3
  template: concept
  subject_type: architecture
  priority: high

# ─── PILIER 3 — Power BI ──────────────────────────────────────────────────────

- id: "P3_01_architecture_power_bi"
  pilier: 3
  title: "Architecture Power BI"
  level: 1
  template: concept
  subject_type: exploratoire
  priority: high

- id: "P3_02_power_query_fondamental"
  pilier: 3
  title: "Power Query fondamental"
  level: 1
  template: data
  subject_type: operationnel
  priority: high

- id: "P3_03_modelisation_etoile"
  pilier: 3
  title: "Modélisation en étoile"
  level: 1
  template: data
  subject_type: architecture
  priority: high

- id: "P3_04_dax_fondamental"
  pilier: 3
  title: "DAX fondamental"
  level: 1
  template: programming
  subject_type: operationnel
  priority: high

- id: "P3_05_visualisations_storytelling"
  pilier: 3
  title: "Visualisations et storytelling"
  level: 1
  template: data
  subject_type: operationnel
  priority: high

- id: "P3_06_dax_intermediaire_time_intelligence"
  pilier: 3
  title: "DAX intermédiaire et Time Intelligence"
  level: 2
  template: programming
  subject_type: operationnel
  priority: high

- id: "P3_07_directquery_composite_models"
  pilier: 3
  title: "DirectQuery et composite models"
  level: 2
  template: data
  subject_type: comparatif
  priority: high

- id: "P3_08_power_bi_service_workspaces_apps"
  pilier: 3
  title: "Power BI Service, workspaces et apps"
  level: 2
  template: data
  subject_type: operationnel
  priority: high

- id: "P3_09_refresh_gateways_dataflows"
  pilier: 3
  title: "Refresh, gateways et dataflows"
  level: 2
  template: networking
  subject_type: operationnel
  priority: high

- id: "P3_10_rls_securite_partage"
  pilier: 3
  title: "RLS, sécurité et partage"
  level: 2
  template: security
  subject_type: operationnel
  priority: high

- id: "P3_11_performance_power_bi"
  pilier: 3
  title: "Performance Power BI"
  level: 3
  template: data
  subject_type: diagnostic
  priority: high

- id: "P3_12_power_bi_embedded_rest_api"
  pilier: 3
  title: "Power BI Embedded et REST API"
  level: 3
  template: networking
  subject_type: operationnel
  priority: medium

- id: "P3_13_fabric_dataflows_gen2"
  pilier: 3
  title: "Fabric, Dataflows Gen2 et architecture analytique moderne"
  level: 3
  template: data
  subject_type: architecture
  priority: medium

- id: "P3_14_gouvernance_power_bi"
  pilier: 3
  title: "Gouvernance Power BI"
  level: 3
  template: security
  subject_type: architecture
  priority: high

# ─── PILIER 4 — Power Pages ───────────────────────────────────────────────────

- id: "P4_01_role_power_pages"
  pilier: 4
  title: "Rôle de Power Pages"
  level: 1
  template: concept
  subject_type: exploratoire
  priority: high

- id: "P4_02_premier_site_power_pages"
  pilier: 4
  title: "Premier site Power Pages"
  level: 1
  template: concept
  subject_type: operationnel
  priority: high

- id: "P4_03_formulaires_listes_dataverse"
  pilier: 4
  title: "Formulaires et listes Dataverse"
  level: 1
  template: data
  subject_type: operationnel
  priority: high

- id: "P4_04_web_roles_table_permissions"
  pilier: 4
  title: "Sécurité Power Pages : web roles et table permissions"
  level: 2
  template: security
  subject_type: diagnostic
  priority: high

- id: "P4_05_authentification_identite_externe"
  pilier: 4
  title: "Authentification et identité externe"
  level: 2
  template: security
  subject_type: operationnel
  priority: high

- id: "P4_06_liquid_syntaxe_objets"
  pilier: 4
  title: "Liquid templates : syntaxe et objets"
  level: 2
  template: programming
  subject_type: operationnel
  priority: medium

- id: "P4_07_liquid_web_templates_snippets"
  pilier: 4
  title: "Liquid templates : web templates et content snippets"
  level: 2
  template: programming
  subject_type: operationnel
  priority: medium

- id: "P4_08_portals_web_api"
  pilier: 4
  title: "Portals Web API"
  level: 3
  template: networking
  subject_type: operationnel
  priority: medium

- id: "P4_09_integration_automate_copilot"
  pilier: 4
  title: "Intégration Power Automate et Copilot Studio"
  level: 3
  template: devops
  subject_type: architecture
  priority: medium

- id: "P4_10_performance_seo_exploitation"
  pilier: 4
  title: "Performance, SEO et exploitation"
  level: 3
  template: concept
  subject_type: diagnostic
  priority: medium

# ─── PILIER 5 — Copilot Studio ────────────────────────────────────────────────

- id: "P5_01_concepts_copilot_studio"
  pilier: 5
  title: "Concepts Copilot Studio"
  level: 1
  template: ai
  subject_type: exploratoire
  priority: high

- id: "P5_02_premier_agent"
  pilier: 5
  title: "Premier agent"
  level: 1
  template: ai
  subject_type: operationnel
  priority: high

- id: "P5_03_variables_branches_entities"
  pilier: 5
  title: "Variables, branches et entities"
  level: 1
  template: ai
  subject_type: operationnel
  priority: high

- id: "P5_04_actions_power_automate"
  pilier: 5
  title: "Actions Power Automate depuis agent"
  level: 2
  template: ai
  subject_type: operationnel
  priority: high

- id: "P5_05_sources_connaissances_reponses_generatives"
  pilier: 5
  title: "Sources de connaissances et réponses génératives"
  level: 2
  template: ai
  subject_type: operationnel
  priority: high

- id: "P5_06_authentification_securite_agents"
  pilier: 5
  title: "Authentification et sécurité des agents"
  level: 2
  template: security
  subject_type: operationnel
  priority: high

- id: "P5_07_rag_orchestration_generative"
  pilier: 5
  title: "RAG et orchestration générative"
  level: 3
  template: ai
  subject_type: architecture
  priority: medium

- id: "P5_08_canaux_publication_monitoring"
  pilier: 5
  title: "Canaux, publication et monitoring"
  level: 3
  template: ai
  subject_type: diagnostic
  priority: medium

- id: "P5_09_gouvernance_copilot_studio"
  pilier: 5
  title: "Gouvernance Copilot Studio"
  level: 3
  template: security
  subject_type: architecture
  priority: high

# ─── PILIER 6 — Interopérabilité & Architecture ───────────────────────────────

- id: "P6_01_canvas_flow_dataverse"
  pilier: 6
  title: "Scénario A — Canvas App avec flows déclenchés depuis Power Apps"
  level: 0
  template: devops
  subject_type: architecture
  priority: high

- id: "P6_02_power_pages_dataverse_notifications"
  pilier: 6
  title: "Scénario B — Portail Power Pages alimenté par Dataverse + notifications Automate"
  level: 0
  template: devops
  subject_type: architecture
  priority: high

- id: "P6_03_power_bi_embarque_canvas"
  pilier: 6
  title: "Scénario C — Dashboard Power BI embarqué dans une Canvas App"
  level: 0
  template: devops
  subject_type: architecture
  priority: medium

- id: "P6_04_copilot_teams_automate"
  pilier: 6
  title: "Scénario D — Agent Copilot Studio dans Teams avec actions Automate"
  level: 0
  template: ai
  subject_type: architecture
  priority: medium

- id: "P6_05_cicd_pac_cli_solution"
  pilier: 6
  title: "Scénario E — Pipeline CI/CD PAC CLI pour solution multi-composants"
  level: 0
  template: devops
  subject_type: architecture
  priority: high

- id: "P6_06_architecture_coe_gouvernance"
  pilier: 6
  title: "Scénario F — Architecture CoE : inventaire, DLP et gouvernance"
  level: 0
  template: security
  subject_type: architecture
  priority: high

- id: "P6_07_application_metier_dataverse_first"
  pilier: 6
  title: "Scénario G — Application métier complète Dataverse-first"
  level: 0
  template: devops
  subject_type: architecture
  priority: high

- id: "P6_08_integration_api_custom_connector"
  pilier: 6
  title: "Scénario H — Intégration API externe via custom connector"
  level: 0
  template: networking
  subject_type: architecture
  priority: high

- id: "P6_09_rpa_legacy_supervision_power_bi"
  pilier: 6
  title: "Scénario I — RPA legacy + supervision Power BI"
  level: 0
  template: devops
  subject_type: architecture
  priority: medium

- id: "P6_10_agent_ia_portail_client"
  pilier: 6
  title: "Scénario J — Agent IA sur portail client"
  level: 0
  template: ai
  subject_type: architecture
  priority: medium
```
