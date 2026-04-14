```
📘 PARCOURS : Testeur QA — de débutant à ingénieur qualité logiciel
👤 Public cible : reconversion IT / support applicatif / junior dev souhaitant évoluer vers QA
📋 Prérequis : bases informatiques, logique algorithmique simple, notions web (HTTP, navigateur)
⏱️  Durée estimée : 120 à 180 heures
🎯 Objectif final : être capable de concevoir, exécuter et automatiser des tests logiciels dans un environnement professionnel
```

---

# 🟢 NIVEAU 1 — Fondations (Débutant)

## 1. 🔵 Concept — Rôle du QA & cycle de vie logiciel

* Différence QA vs testeur vs développeur ⭐
* Cycle de vie logiciel (SDLC, STLC)
* Types de tests (fonctionnel, non-fonctionnel, manuel, auto)
* Qualité produit vs qualité process
* ⭐ Comprendre *pourquoi* on teste (risque, coût, impact métier)

## 2. 🔵 Concept — Types de tests & stratégies

* Tests unitaires / intégration / système / acceptation
* Smoke test vs regression test ⭐
* Test exploratoire vs test scripté
* Tests manuels vs automatisés
* ⚠️ Automatiser trop tôt = perte de temps

## 3. 🟡 Pattern — Méthodologie de test

* Rédaction de cas de test (test cases)
* Structure GIVEN / WHEN / THEN ⭐
* Critères d’acceptation (User Story)
* Priorisation des tests (risque / valeur métier)
* ⚠️ Tester sans stratégie = tests inutiles

## 4. 🟢 Commande — Outils QA de base

* Outils de gestion de tickets : Jira, TestRail
* Navigateur + DevTools (Network, Console) ⭐
* Postman pour API testing
* Notions de logs applicatifs
* ⭐ Savoir reproduire un bug précisément

## 5. 🔵 Concept — HTTP & Web fundamentals

* Méthodes HTTP (GET, POST, PUT, DELETE) ⭐
* Codes de statut (200, 404, 500)
* Headers, cookies, sessions
* JSON vs XML
* ⚠️ Confondre erreur client vs serveur

## 6. 🔴 Piège — Bugs & reporting

* Rédiger un bug report clair et actionnable ⭐
* Steps to reproduce
* Expected vs actual result
* Priorité vs sévérité ⚠️ confusion fréquente
* ⚠️ Bug vague = bug ignoré

## 7. 🟡 Pattern — Gestion des données de test

* Jeux de données (test data)
* Données réalistes vs mock
* Isolation des tests
* Nettoyage des données
* ⭐ Comprendre les environnements (dev/staging/prod)

## 8. 🟢 Commande — Git & collaboration

* Bases Git (clone, commit, push)
* Lire un diff
* Workflow simple (branch → test → validation)
* ⭐ QA intégré au workflow dev

---

# 🟡 NIVEAU 2 — Intermédiaire (Projets réels)

## 9. 🟢 Commande — API Testing avancé

* Tests API avec Postman / Insomnia
* Authentification (token, OAuth)
* Tests de payload JSON ⭐
* Assertions sur réponses API
* ⚠️ Tester uniquement le front = incomplet

## 10. 🟡 Pattern — Automatisation des tests (UI)

* Introduction à Cypress ⭐
* Sélecteurs CSS / DOM
* Tests end-to-end
* Mocking des requêtes
* ⚠️ Tests fragiles (selectors instables)

## 11. 🟢 Commande — Tests backend & unitaires

* Tests avec Jest / Pytest
* Assertions
* Coverage de code ⭐
* Mock / stub
* ⚠️ Confondre test unitaire et intégration

## 12. 🟡 Pattern — CI/CD & tests

* Intégration des tests dans pipeline CI ⭐
* GitHub Actions / GitLab CI
* Tests automatiques à chaque commit
* Feedback rapide
* ⚠️ Tests lents = pipeline inutilisable

## 13. 🔵 Concept — Performance testing

* Tests de charge avec Locust
* Latence, throughput
* Bottlenecks
* ⭐ Différence charge vs stress test

## 14. 🔵 Concept — Sécurité applicative (QA)

* Tests d’injection (SQL, XSS)
* Validation des entrées
* Authentification / autorisation
* ⭐ OWASP Top 10
* ⚠️ Tester sans penser sécurité

## 15. 🟡 Pattern — Stratégie de test en équipe

* Test pyramid ⭐
* Shift-left testing
* QA dans Agile / Scrum
* Collaboration dev / QA
* ⚠️ QA isolé = inefficace

## 16. 🔴 Piège — Flaky tests

* Tests instables ⚠️
* Synchronisation (wait, retry)
* Tests dépendants
* ⭐ Stabiliser avant d’ajouter

---

# 🔵 NIVEAU 3 — Avancé / Expert (Production / Scale)

## 17. 🟡 Pattern — Architecture de framework de test

* Organisation des tests
* Page Object Model ⭐
* Réutilisabilité
* Séparation logique test / data
* ⚠️ Code de test non maintenable

## 18. 🟢 Commande — Tests distribués & parallélisation

* Exécution parallèle (Cypress, Selenium Grid)
* Optimisation du temps de test ⭐
* Scaling des tests
* ⚠️ Tests dépendants = impossible à paralléliser

## 19. 🔵 Concept — Observabilité pour QA

* Logs / metrics / traces ⭐
* Debug en prod
* Monitoring des erreurs
* Corrélation logs/tests
* ⚠️ Tester sans visibilité runtime

## 20. 🟡 Pattern — Tests en production (safe)

* Canary testing
* Feature flags ⭐
* Tests synthétiques
* Monitoring utilisateur réel (RUM)
* ⚠️ Tester directement en prod sans contrôle

## 21. 🔵 Concept — Test de systèmes distribués

* Microservices testing
* Contract testing ⭐
* Tests de résilience
* Chaos engineering (intro)
* ⚠️ Tester service isolé uniquement

## 22. 🔵 Concept — Data quality & validation

* Validation des pipelines data
* Cohérence des données ⭐
* Tests ETL
* ⚠️ Bug invisible = bug data

## 23. 🟡 Pattern — Stratégie QA entreprise

* Définir une stratégie globale
* KPIs qualité ⭐
* ROI des tests
* Automatisation vs manuel (arbitrage)
* ⚠️ Tout automatiser = erreur

## 24. 🔴 Piège — Dette de test

* Tests obsolètes ⚠️
* Tests inutiles
* Maintenance
* ⭐ Nettoyage régulier

---

# 🚨 BLOCS SOUVENT OUBLIÉS

→ Observabilité appliquée au QA (logs + debugging réel)
→ Qualité des données (très critique en entreprise)
→ Tests de performance réalistes
→ Stratégie globale QA (pas juste écrire des tests)
→ Maintenance des tests (flaky, dette technique)

---

# 👔 PROFIL RECRUTABLE

### Ce que le marché attend réellement

→ Savoir **trouver des bugs efficacement** (pas juste exécuter des tests)
→ Comprendre le **fonctionnement technique (API, logs, DB)**
→ Être capable d’**automatiser intelligemment (Cypress, API tests)**
→ Être intégré dans un **workflow Agile / CI/CD**

### Différence niveaux

* Junior :
  → exécute des tests, écrit des cas simples
  → comprend HTTP, UI testing
* Intermédiaire :
  → automatise (Cypress/API)
  → comprend architecture et pipeline
* Senior :
  → définit stratégie QA
  → optimise performance + coût
  → intervient sur architecture et qualité globale

---

# 🎯 PRIORITÉ RÉELLE (si le temps est limité)

1. HTTP + API testing ⭐
2. Rédaction de test cases + bug reporting ⭐
3. Cypress (tests UI) ⭐
4. Postman (tests API) ⭐
5. CI/CD avec tests ⭐
6. Compréhension logs + debug ⭐
7. Test pyramid + stratégie QA
8. Git + workflow équipe

---

```yaml
# MODULES_TABLE
- id: "01_role_qa_cycle"
  title: "Rôle du QA & cycle de vie logiciel"
  level: 1
  template: concept
  subject_type: exploratoire
  priority: high

- id: "02_types_tests"
  title: "Types de tests & stratégies"
  level: 1
  template: concept
  subject_type: comparatif
  priority: high

- id: "03_methodologie_test"
  title: "Méthodologie de test"
  level: 1
  template: concept
  subject_type: exploratoire
  priority: high

- id: "04_outils_qa"
  title: "Outils QA de base"
  level: 1
  template: devops
  subject_type: operationnel
  priority: high

- id: "05_http_fundamentals"
  title: "HTTP & Web fundamentals"
  level: 1
  template: networking
  subject_type: exploratoire
  priority: high

- id: "06_bug_reporting"
  title: "Bugs & reporting"
  level: 1
  template: concept
  subject_type: operationnel
  priority: high

- id: "07_test_data"
  title: "Gestion des données de test"
  level: 1
  template: data
  subject_type: exploratoire
  priority: medium

- id: "08_git_collaboration"
  title: "Git & collaboration"
  level: 1
  template: devops
  subject_type: operationnel
  priority: high

- id: "09_api_testing"
  title: "API Testing avancé"
  level: 2
  template: devops
  subject_type: operationnel
  priority: high

- id: "10_automation_ui"
  title: "Automatisation des tests (UI)"
  level: 2
  template: programming
  subject_type: operationnel
  priority: high

- id: "11_tests_backend"
  title: "Tests backend & unitaires"
  level: 2
  template: programming
  subject_type: operationnel
  priority: high

- id: "12_ci_cd_tests"
  title: "CI/CD & tests"
  level: 2
  template: devops
  subject_type: architecture
  priority: high

- id: "13_performance_testing"
  title: "Performance testing"
  level: 2
  template: devops
  subject_type: diagnostic
  priority: medium

- id: "14_security_testing"
  title: "Sécurité applicative (QA)"
  level: 2
  template: security
  subject_type: exploratoire
  priority: medium

- id: "15_strategie_equipe"
  title: "Stratégie de test en équipe"
  level: 2
  template: concept
  subject_type: architecture
  priority: high

- id: "16_flaky_tests"
  title: "Flaky tests"
  level: 2
  template: concept
  subject_type: diagnostic
  priority: high

- id: "17_framework_test"
  title: "Architecture de framework de test"
  level: 3
  template: programming
  subject_type: architecture
  priority: high

- id: "18_parallelisation"
  title: "Tests distribués & parallélisation"
  level: 3
  template: devops
  subject_type: operationnel
  priority: medium

- id: "19_observabilite"
  title: "Observabilité pour QA"
  level: 3
  template: devops
  subject_type: diagnostic
  priority: high

- id: "20_tests_production"
  title: "Tests en production (safe)"
  level: 3
  template: devops
  subject_type: architecture
  priority: medium

- id: "21_distributed_testing"
  title: "Test de systèmes distribués"
  level: 3
  template: concept
  subject_type: architecture
  priority: medium

- id: "22_data_quality"
  title: "Data quality & validation"
  level: 3
  template: data
  subject_type: diagnostic
  priority: medium

- id: "23_strategie_qa"
  title: "Stratégie QA entreprise"
  level: 3
  template: concept
  subject_type: architecture
  priority: high

- id: "24_dette_test"
  title: "Dette de test"
  level: 3
  template: concept
  subject_type: diagnostic
  priority: high
```
