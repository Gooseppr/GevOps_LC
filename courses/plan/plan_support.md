---
published: false
---

### 1. En-tête du parcours

```
📘 PARCOURS : Technicien Support Applicatif — de Junior à Expert
👤 Public cible : Technicien support, QA, futur DevOps / Sysadmin orienté applicatif
📋 Prérequis : Bases informatiques (OS, fichiers, réseau simple), logique technique, notions Excel ou SQL utiles mais non obligatoires
⏱️  Durée estimée : 120 à 180 heures
🎯 Objectif final : Diagnostiquer, corriger et améliorer des applications métiers en production, avec autonomie et rigueur professionnelle
```

---

# 🟢 NIVEAU 1 — Fondations (Débutant)

### 1. 🔵 Comprendre le rôle du support applicatif

* Différence support niveau 1 / 2 / 3 ⭐
* Application métier vs application technique
* Incident vs problème vs demande (ITIL)
* Cycle de vie d’un ticket (création → résolution → clôture)
* SLA, priorisation, impact métier ⭐

---

### 2. 🟢 Environnement de travail & outils support

* Outils de ticketing (GLPI, ServiceNow, Jira)
* Prise en main des environnements (prod / preprod / dev) ⭐
* Accès distant (RDP, SSH, VPN)
* Outils de monitoring basiques (logs simples, dashboards)
* Gestion des droits et accès utilisateurs ⚠️

---

### 3. 🔵 Bases systèmes (Windows / Linux)

* Système de fichiers (chemins, droits, arborescence)
* Processus et services ⭐
* Logs système (Event Viewer, syslog)
* Variables d’environnement
* Installation / désinstallation d’applications ⚠️ conflits fréquents

---

### 4. 🔵 Bases réseau essentielles

* Modèle TCP/IP simplifié ⭐
* IP, DNS, ports, protocoles (HTTP, HTTPS, FTP)
* Résolution DNS (nslookup, dig)
* Tests réseau (ping, traceroute, curl)
* ⚠️ Confusion fréquente entre problème réseau vs applicatif

---

### 5. 🟢 SQL pour support applicatif

* SELECT, WHERE, JOIN ⭐
* Lire et comprendre une base de données
* Vérifier la cohérence des données
* Requêtes simples pour diagnostic
* ⚠️ Ne jamais modifier en prod sans validation

---

### 6. 🔵 Comprendre une application métier

* Architecture simple (frontend / backend / DB)
* API vs UI
* Flux de données ⭐
* Dépendances (services externes, APIs)
* ⚠️ Ne pas confondre bug applicatif et problème de data

---

### 7. 🔴 Gestion des erreurs & diagnostic initial

* Lire un message d’erreur efficacement ⭐
* Identifier symptôme vs cause
* Reproduire un bug
* Isoler un problème
* ⚠️ Corriger sans comprendre = erreur critique

---

### 8. 🟡 Communication & gestion utilisateur

* Reformulation du problème ⭐
* Poser les bonnes questions
* Gérer un utilisateur frustré
* Rédiger une réponse claire
* Documentation de résolution

---

### 9. 🟡 Travail en équipe & outils collaboratifs

* Git (lecture basique, pas besoin de dev) ⭐
* Documentation interne (Confluence, Notion)
* Transmission de tickets
* Escalade vers équipe technique

---

# 🟡 NIVEAU 2 — Intermédiaire (Projets réels)

### 10. 🟢 Analyse avancée des logs

* Logs applicatifs (stack traces, erreurs métiers)
* Logs web (HTTP codes, requêtes)
* Corrélation logs / incident ⭐
* grep, filtres, recherches
* ⚠️ Lire sans contexte = mauvaise interprétation

---

### 11. 🔵 Architecture applicative réelle

* Monolithe vs microservices ⭐
* API REST (GET, POST, erreurs)
* Authentification (tokens, sessions)
* Dépendances inter-services
* ⚠️ Un service down peut en impacter plusieurs

---

### 12. 🟢 Debugging technique

* Reproduire en environnement de test ⭐
* Analyse des inputs / outputs
* Tests manuels API (Postman, curl)
* Comparaison entre environnements
* ⚠️ Différences config prod/preprod fréquentes

---

### 13. 🟡 Gestion des incidents complexes

* Priorisation (impact business)
* Coordination multi-équipes ⭐
* Communication en incident critique
* Post-mortem
* Suivi long terme

---

### 14. 🔵 Gestion des données & intégrité

* Data incohérente vs bug applicatif ⭐
* Scripts de correction (SQL)
* Historisation des données
* Import/export
* ⚠️ Mauvaise correction = corruption

---

### 15. 🟢 Automatisation des tâches support

* Scripts simples (PowerShell, Bash, Python)
* Extraction logs automatisée
* Vérifications périodiques ⭐
* Gain de temps opérationnel
* ⚠️ Scripts non contrôlés = risque prod

---

### 16. 🟡 Environnements & déploiements

* Différence dev / staging / prod ⭐
* Comprendre un pipeline CI/CD (lecture)
* Versions applicatives
* Rollback
* ⚠️ Mauvaise version = bug inexpliqué

---

### 17. 🔵 Observabilité (logs / metrics / traces)

* Différence logs vs metrics ⭐
* Monitoring applicatif (Grafana, Prometheus)
* Alerting
* Traces distribuées (bases)
* ⚠️ Trop d’alertes = bruit inutile

---

### 18. 🔴 Sécurité applicative (niveau support)

* Gestion des accès utilisateurs ⭐
* Authentification / autorisation
* Fuites de données (logs, exports)
* RGPD (bases)
* ⚠️ Accès prod mal géré = risque critique

---

# 🔵 NIVEAU 3 — Avancé / Expert (Production / Scale)

### 19. 🟡 Architecture & compréhension globale SI

* Cartographie applicative ⭐
* Flux inter-systèmes
* Dépendances critiques
* Points de défaillance (SPOF)
* Vision globale système

---

### 20. 🟢 Debugging avancé & troubleshooting

* Analyse multi-couches (réseau + app + data) ⭐
* Debug en production (safe)
* Analyse de performance
* Profiling simple
* ⚠️ Corriger sans logs = guess

---

### 21. 🟡 Gestion de crise & incidents majeurs

* Incident critique (P1)
* Cellule de crise ⭐
* Communication business / technique
* Plan de reprise
* Post-mortem structuré

---

### 22. 🔵 Performance & optimisation

* Latence applicative ⭐
* Requêtes lentes SQL
* Bottlenecks
* Mise en cache (bases)
* ⚠️ Optimiser sans mesurer = inutile

---

### 23. 🟢 Industrialisation & support avancé

* Runbooks ⭐
* Automatisation avancée
* Outils internes support
* Standardisation des diagnostics
* Capitalisation des connaissances

---

### 24. 🔴 Pièges avancés du support applicatif

* Faux positifs monitoring ⚠️
* Effets de bord en prod ⚠️
* Mauvaise analyse de logs ⚠️
* Dépendances invisibles ⚠️
* “Ça marchait hier” syndrome

---

### 25. 🟡 Passage vers DevOps / SRE

* Comprendre CI/CD en profondeur
* Infra de base (Docker, cloud)
* Observabilité avancée ⭐
* Collaboration dev / ops
* Évolution de carrière

---

# 🚨 BLOCS SOUVENT OUBLIÉS

→ Différence DATA vs BUG (énorme en support réel)
→ Lecture efficace des logs (pas juste les ouvrir)
→ Compréhension des environnements (prod ≠ test)
→ Communication utilisateur (souvent négligée mais critique)
→ Automatisation (support moderne = scripté)
→ Vision globale SI (au-delà de “mon appli”)

---

# 👔 PROFIL RECRUTABLE

→ Ce que le marché attend réellement :

* Capacité à diagnostiquer rapidement ⭐
* Compréhension fonctionnelle + technique
* Bonne communication
* Autonomie sur incidents
* Maîtrise SQL + logs

→ Différence :

* Junior :

  * Exécute des procédures
  * Dépend des seniors
  * Diagnostic limité

* Intermédiaire :

  * Résout 70% des incidents seul ⭐
  * Comprend architecture
  * Automatise certaines tâches

* Senior :

  * Gère incidents critiques
  * Comprend tout le SI ⭐
  * Améliore les systèmes, pas juste corriger

---

# 🎯 PRIORITÉ RÉELLE (si le temps est limité)

1. SQL (lecture + diagnostic)
2. Logs & debugging ⭐
3. Bases réseau
4. Compréhension architecture applicative
5. Gestion des incidents
6. Environnements (prod / staging)
7. Communication utilisateur
8. Automatisation basique

---

# MODULES_TABLE

```yaml
# MODULES_TABLE
- id: "01_role_support"
  title: "Comprendre le rôle du support applicatif"
  level: 1
  template: concept
  subject_type: exploratoire
  priority: high

- id: "02_outils_support"
  title: "Environnement de travail & outils support"
  level: 1
  template: devops
  subject_type: operationnel
  priority: high

- id: "03_bases_systemes"
  title: "Bases systèmes (Windows / Linux)"
  level: 1
  template: devops
  subject_type: exploratoire
  priority: high

- id: "04_bases_reseau"
  title: "Bases réseau essentielles"
  level: 1
  template: networking
  subject_type: exploratoire
  priority: high

- id: "05_sql_support"
  title: "SQL pour support applicatif"
  level: 1
  template: data
  subject_type: operationnel
  priority: high

- id: "06_comprendre_application"
  title: "Comprendre une application métier"
  level: 1
  template: concept
  subject_type: exploratoire
  priority: high

- id: "07_gestion_erreurs"
  title: "Gestion des erreurs & diagnostic initial"
  level: 1
  template: concept
  subject_type: diagnostic
  priority: high

- id: "08_communication"
  title: "Communication & gestion utilisateur"
  level: 1
  template: concept
  subject_type: exploratoire
  priority: medium

- id: "09_collaboration"
  title: "Travail en équipe & outils collaboratifs"
  level: 1
  template: devops
  subject_type: operationnel
  priority: medium

- id: "10_logs_avances"
  title: "Analyse avancée des logs"
  level: 2
  template: devops
  subject_type: diagnostic
  priority: high

- id: "11_architecture_app"
  title: "Architecture applicative réelle"
  level: 2
  template: concept
  subject_type: architecture
  priority: high

- id: "12_debugging"
  title: "Debugging technique"
  level: 2
  template: devops
  subject_type: diagnostic
  priority: high

- id: "13_incidents_complexes"
  title: "Gestion des incidents complexes"
  level: 2
  template: concept
  subject_type: diagnostic
  priority: high

- id: "14_data_integrite"
  title: "Gestion des données & intégrité"
  level: 2
  template: data
  subject_type: diagnostic
  priority: high

- id: "15_automatisation"
  title: "Automatisation des tâches support"
  level: 2
  template: programming
  subject_type: operationnel
  priority: medium

- id: "16_environnements"
  title: "Environnements & déploiements"
  level: 2
  template: devops
  subject_type: architecture
  priority: high

- id: "17_observabilite"
  title: "Observabilité (logs / metrics / traces)"
  level: 2
  template: devops
  subject_type: exploratoire
  priority: high

- id: "18_securite"
  title: "Sécurité applicative (niveau support)"
  level: 2
  template: security
  subject_type: exploratoire
  priority: high

- id: "19_architecture_si"
  title: "Architecture & compréhension globale SI"
  level: 3
  template: concept
  subject_type: architecture
  priority: high

- id: "20_troubleshooting"
  title: "Debugging avancé & troubleshooting"
  level: 3
  template: devops
  subject_type: diagnostic
  priority: high

- id: "21_crise"
  title: "Gestion de crise & incidents majeurs"
  level: 3
  template: concept
  subject_type: diagnostic
  priority: high

- id: "22_performance"
  title: "Performance & optimisation"
  level: 3
  template: devops
  subject_type: diagnostic
  priority: medium

- id: "23_industrialisation"
  title: "Industrialisation & support avancé"
  level: 3
  template: devops
  subject_type: operationnel
  priority: medium

- id: "24_pieges"
  title: "Pièges avancés du support applicatif"
  level: 3
  template: concept
  subject_type: diagnostic
  priority: medium

- id: "25_devops_transition"
  title: "Passage vers DevOps / SRE"
  level: 3
  template: devops
  subject_type: comparatif
  priority: medium
```
