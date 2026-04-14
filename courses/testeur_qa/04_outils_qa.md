---
layout: page
title: "Outils QA de base"

course: testeur_qa
chapter_title: "Outils QA de base"

chapter: 4
section: 1

tags: qa, jira, postman, devtools, bug-report, api-testing, logs
difficulty: beginner
duration: 90
mermaid: true

status: "published"
prev_module: "/courses/testeur_qa/05_http_fundamentals.html"
prev_module_title: "HTTP & Web fundamentals"
next_module: "/courses/testeur_qa/17_framework_test.html"
next_module_title: "Architecture de framework de test"
---

# Outils QA de base

## Objectifs pédagogiques

À l'issue de ce module, tu seras capable de :

- Créer un ticket de bug Jira avec les informations suffisantes pour qu'un développeur reproduise le problème en moins de 5 minutes
- Utiliser les DevTools d'un navigateur pour capturer une requête réseau, lire une réponse JSON et identifier une erreur console
- Envoyer une requête HTTP via Postman et interpréter la réponse du serveur
- Lire un extrait de log applicatif pour identifier la cause probable d'une anomalie
- Reproduire un bug de façon fiable en documentant le compte, les données, l'environnement et la fréquence

---

## Mise en situation

Tu viens d'intégrer une équipe produit de 12 personnes — 3 devs, 1 PM, 1 UX, et toi en QA. L'application est un SaaS B2B qui gère des factures. Ça marche "à peu près" en production, mais des clients remontent régulièrement des anomalies floues : "le bouton ne fait rien", "le PDF ne se génère pas", "ça tourne longtemps puis ça bloque".

Personne ne sait exactement où chercher. Les développeurs reçoivent des tickets du genre : "ça marche pas sur ma machine, voir screenshot". Le screenshot montre juste la page blanche. Résultat : le dev passe 45 minutes à essayer de reproduire, abandonne, ferme le ticket "can't reproduce".

C'est exactement là qu'un bon QA fait la différence. Pas en testant plus, mais en testant **mieux** — et surtout, en documentant ce qu'il observe avec les bons outils.

---

## Les outils, dans quel ordre ?

Avant de plonger dans chaque outil, voici comment ils s'articulent dans une journée type :

```mermaid
flowchart LR
    A[🌐 Navigation & test manuel] --> B[🔍 DevTools\nCapturer l'erreur]
    B --> C{Type de problème ?}
    C -->|Erreur API| D[📬 Postman\nReproduire l'appel]
    C -->|Erreur serveur| E[📄 Logs\nTracer la cause]
    C -->|Bug confirmé| F[🎫 Jira\nDocumenter le ticket]
    D --> F
    E --> F
```

La logique est toujours la même : **observer → comprendre → documenter**. Les outils servent cette progression, pas l'inverse.

---

## Jira — gérer les bugs sans perdre d'information

Jira est l'outil de ticketing le plus répandu dans les équipes produit. C'est là que les bugs vivent, de leur découverte à leur correction. Mais un Jira mal utilisé, c'est un cimetière de tickets incompréhensibles.

### Ce qu'un bon ticket contient

Un ticket de bug doit permettre à quelqu'un qui n'a jamais vu le problème de le reproduire en moins de 5 minutes. C'est le critère. Si ce n'est pas le cas, le ticket reviendra chez toi.

| Champ | Ce qu'il doit contenir | Exemple concret |
|---|---|---|
| **Titre** | Action + comportement observé | "Génération PDF bloquée après clic sur 'Télécharger'" |
| **Environnement** | OS, navigateur, version app | Chrome 124, Windows 11, app v2.4.1 |
| **Étapes de reproduction** | Numérotées, précises | 1. Se connecter en tant qu'admin. 2. Aller sur Facture #1042. 3. Cliquer "Télécharger PDF". |
| **Comportement attendu** | Ce qui devrait se passer | Le PDF s'ouvre dans un nouvel onglet |
| **Comportement observé** | Ce qui se passe vraiment | Le bouton devient gris, rien ne s'ouvre, pas d'erreur visible |
| **Preuves** | Screenshot, vidéo, log, HAR | Screenshot + capture DevTools Network |
| **Sévérité** | Impact métier | Majeur — les clients ne peuvent pas récupérer leurs factures |

⚠️ **Erreur fréquente** — remplir "comportement observé" avec une hypothèse ("le serveur est sûrement en timeout") plutôt qu'un fait ("la requête renvoie un statut 504 après 30 secondes"). Le QA observe, le dev diagnostique.

### TestRail — quand les cas de test s'accumulent

Jira gère les bugs. TestRail gère les **cas de test**. Si ton équipe a des centaines de scénarios à exécuter à chaque sprint, TestRail permet de les organiser en suites de tests, de tracer les résultats d'exécution (passé / échoué / bloqué) et de générer des rapports de couverture.

Pour débuter, tu n'en as pas forcément besoin immédiatement — un Google Sheet structuré peut suffire. Mais savoir que cet outil existe et à quoi il sert est important pour t'intégrer dans une équipe qui l'utilise déjà.

---

## DevTools — ton meilleur allié pour comprendre ce qui se passe

Tous les navigateurs modernes embarquent les DevTools (F12 ou clic droit → "Inspecter"). C'est l'outil que tu utiliseras le plus souvent, parce qu'il te montre **ce que le navigateur voit réellement** — pas ce que l'interface affiche.

Deux onglets sont critiques pour un QA.

### Onglet Console

La console affiche les erreurs JavaScript qui se produisent dans la page. Quand un bouton "ne fait rien", la première chose à faire c'est d'ouvrir la console et de regarder si une erreur apparaît au moment du clic.

```
Uncaught TypeError: Cannot read properties of undefined (reading 'id')
    at generatePDF (app.js:342)
```

Ça ne te dit pas comment corriger le problème — c'est le travail du dev — mais ça te dit **exactement où** il se produit. Ton ticket devient 10x plus utile.

💡 Avant de cliquer sur le bouton buggé, ouvre la console et coche **"Preserve log"**. Sans ça, si la page se recharge, les erreurs disparaissent avant que tu aies pu les lire.

### Onglet Network

L'onglet Network enregistre toutes les requêtes HTTP que le navigateur envoie et reçoit. C'est ici que tu vois si une API est appelée, ce qu'elle reçoit, et ce qu'elle répond.

Quand la génération de PDF échoue, tu peux observer :
- La requête a-t-elle bien été envoyée ?
- Quel code HTTP a été retourné ? (200, 400, 500…)
- Quelle est la réponse exacte du serveur ?

Pour ne pas te noyer, utilise le filtre **"Fetch/XHR"** en haut de l'onglet — il isole les appels API et élimine les 80 ressources statiques (images, CSS, fonts) qui n'ont rien à voir avec ton bug. Clique sur une requête pour voir ses headers, son payload et sa réponse.

⚠️ **Piège classique** — beaucoup de débutants ouvrent l'onglet Network, voient 80 lignes et ferment. Le filtre XHR/Fetch rend l'outil utilisable en 2 secondes.

---

## Postman — tester une API sans toucher à l'interface

Postman permet d'envoyer des requêtes HTTP directement vers une API, sans passer par le navigateur. C'est utile dans deux situations : vérifier qu'une API répond correctement indépendamment du frontend, et reproduire un problème observé dans les DevTools en mode contrôlé.

### Anatomie d'une requête Postman

Une requête se compose de :

- **Méthode** : GET, POST, PUT, DELETE
- **URL** : l'endpoint complet, ex. `https://api.monapp.com/v1/factures/1042/pdf`
- **Headers** : métadonnées — souvent `Content-Type: application/json` et `Authorization: Bearer <TOKEN>`
- **Body** : les données envoyées (pour POST/PUT), en général en JSON

Exemple de requête de génération PDF :

```http
POST https://api.monapp.com/v1/factures/1042/pdf
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "format": "A4",
  "include_vat": true
}
```

Si l'API répond `500 Internal Server Error` avec le body `{"error": "template_not_found"}`, tu sais que le problème est côté serveur, sur un template manquant — pas dans le JavaScript du frontend. Ton ticket devient chirurgical.

### Collections et environnements

Au lieu de retaper l'URL et le token à chaque fois, Postman permet de créer des **collections** (groupes de requêtes) et des **environnements** (variables réutilisables comme `{{base_url}}` ou `{{token}}`). Prends l'habitude de les utiliser dès le départ — ça te sauvera du temps quand tu testeras des dizaines d'endpoints.

💡 Dans l'onglet Network de Chrome, tu peux faire clic droit sur une requête → **"Copy as cURL"**, puis coller dans Postman (File → Import → Raw text). La requête est importée automatiquement avec tous ses headers et son body. Parfait pour reproduire exactement ce que le navigateur a envoyé, sans tout retaper.

---

## Logs applicatifs — lire ce que le serveur a vécu

Les logs, c'est le journal de bord de l'application côté serveur. Quand quelque chose échoue silencieusement — pas d'erreur visible dans le navigateur, mais ça ne fonctionne pas — les logs sont souvent la seule source de vérité.

### Comment les lire

Un log typique ressemble à ça :

```
2024-05-14 10:23:41 [ERROR] InvoiceService - PDF generation failed for invoice_id=1042
  Caused by: TemplateNotFoundException: template 'invoice_a4_fr' not found in /templates/
  Stack trace:
    at TemplateEngine.render(TemplateEngine.java:87)
    at InvoiceService.generatePDF(InvoiceService.java:204)
```

Décomposons ce que ça nous dit :

- **Timestamp** : 10:23:41 — utile pour corréler avec les actions utilisateur
- **Niveau** : `ERROR` — ce n'est pas un avertissement, quelque chose a vraiment planté
- **Service** : `InvoiceService` — le composant concerné
- **Message** : le problème exact, avec l'ID de la ressource concernée
- **Cause** : `TemplateNotFoundException` — la raison précise
- **Stack trace** : la chaîne d'appels qui a mené à l'erreur

🧠 **Concept clé** — les niveaux de log ont une hiérarchie : `DEBUG` < `INFO` < `WARN` < `ERROR` < `FATAL`. En production, les logs `DEBUG` sont souvent désactivés pour ne pas noyer les logs importants. En tant que QA, concentre-toi sur `WARN` et `ERROR`.

En pratique, tu n'auras pas toujours accès aux logs de production directement. Selon l'équipe, ils peuvent être dans un outil centralisé comme **Datadog**, **Grafana Loki** ou **Kibana**, dans des fichiers accessibles via SSH, ou dans la console d'un hébergement cloud (AWS CloudWatch, GCP Logging…). L'essentiel, c'est de savoir **demander** les logs au bon moment — et de savoir **quoi y chercher** quand tu les as.

---

## Reproduire un bug — la compétence qui fait tout

Tous les outils précédents servent un seul objectif : **reproduire le bug de façon fiable**. Un bug qu'on ne peut pas reproduire est un bug qu'on ne peut pas corriger.

La reproductibilité se construit en répondant à cinq questions :

1. **Sur quel compte ?** — l'utilisateur a-t-il un rôle spécifique, des données particulières ?
2. **Dans quel état ?** — qu'est-ce qui s'est passé juste avant ?
3. **Avec quelles données ?** — quel ID, quelle valeur, quel format ?
4. **Sur quel environnement ?** — prod, staging, dev ? Quel navigateur, quelle version ?
5. **À quelle fréquence ?** — toujours, parfois, une seule fois ?

Si tu peux répondre à ces cinq questions dans ton ticket, tu as fait ton travail. Un développeur peut reproduire le bug en moins de 5 minutes, sans t'envoyer 10 messages de clarification.

⚠️ **Erreur fréquente** — tester uniquement avec son propre compte et ses propres données. Beaucoup de bugs sont liés à des cas limites : utilisateur sans abonnement actif, facture avec un montant décimal, nom contenant des caractères spéciaux. Varier les données de test, c'est une des compétences les plus précieuses d'un QA.

---

## Cas réel en entreprise

**Contexte** : une équipe de 8 personnes développe une application de gestion RH. Depuis 2 semaines, des utilisateurs remontent que "le bulletin de paie ne se génère pas". Les développeurs ont fermé 3 tickets "can't reproduce".

**Ce qui a changé** : une QA fraîchement arrivée reprend le sujet avec les bons outils.

1. Elle ouvre DevTools → Network avant de cliquer sur "Générer bulletin". Elle observe une requête `POST /api/payslips/generate` qui retourne `422 Unprocessable Entity`.
2. Elle copie la requête en cURL et l'importe dans Postman. Elle reproduit l'erreur avec le body exact.
3. Elle demande les logs du serveur au moment de l'erreur. Les logs montrent : `ValidationError: field 'contract_start_date' is required, got null`.
4. Elle découvre que le bug ne touche que les employés créés **après** la migration de base de données du 2 mai — leur `contract_start_date` est null.
5. Le ticket final contient : requête Postman exportée, extrait de log, liste des IDs d'employés affectés, étapes de reproduction en 3 clics.

**Résultat** : le dev corrige en 2 heures. Ce qui bloquait depuis 2 semaines est résolu en une matinée.

---

## Bonnes pratiques

**Documente pendant que tu testes, pas après.** La mémoire est mauvaise et les détails s'effacent vite. Prends tes captures au moment où tu observes, pas 30 minutes plus tard.

**Ne ferme jamais une session DevTools Network sans sauvegarder si tu as trouvé quelque chose.** Exporte le fichier HAR (clic droit → "Save all as HAR with content") — il contient l'intégralité des requêtes et peut être rejoué ou partagé directement en pièce jointe Jira.

**Dans Postman, crée un environnement dès le premier jour.** Mets `base_url`, `token` et `user_id` de test en variables. Tu t'épargneras des heures de copier-coller et tu pourras switcher entre staging et production en un clic.

**Teste avec des comptes aux permissions différentes.** Admin, utilisateur standard, utilisateur sans abonnement actif — les bugs d'autorisation sont parmi les plus fréquents et les plus graves. Un bug visible uniquement sur un rôle spécifique est souvent le plus long à diagnostiquer sans cette information.

**Sépare l'observation de l'hypothèse.** Dans un ticket, écris ce que tu vois, pas ce que tu penses. "La requête retourne 500" est un fait. "Le serveur est surchargé" est une hypothèse — ce n'est pas ton rôle de la formuler.

**Un log sans timestamp, c'est presque inutile.** Quand tu demandes des logs à un dev ou un ops, précise toujours la plage horaire ET le fuseau horaire. Les serveurs tournent souvent en UTC alors que les utilisateurs sont sur un autre fuseau.

**La sévérité d'un bug, c'est son impact métier, pas sa visibilité.** Un bouton mal aligné en production n'est pas "critique" parce qu'il saute aux yeux. Une facture impossible à télécharger est critique parce qu'elle bloque un workflow client. Calibre ta sévérité en pensant à ce que l'utilisateur ne peut plus faire.

---

## Résumé

Un bon QA ne se contente pas de "tester" — il observe, comprend et documente avec précision. Les quatre outils de ce module forment un écosystème cohérent : Jira structure l'information pour qu'elle soit exploitable par l'équipe, les DevTools permettent de voir ce qui se passe réellement dans le navigateur, Postman isole les problèmes API du reste de l'interface, et les logs donnent accès à ce que le serveur a vécu. Le fil conducteur entre tout ça, c'est la capacité à reproduire un bug fiablement — avec le bon compte, les bonnes données, dans le bon contexte. C'est cette reproductibilité qui transforme un ticket frustrant en quelque chose d'actionnable. La prochaine étape logique sera d'apprendre à structurer des cas de test formels — pour ne plus seulement réagir aux bugs, mais anticiper les scénarios qui pourraient en créer.

---

<!-- snippet
id: qa_jira_ticket_structure
type: concept
tech: jira
level: beginner
importance: high
format: knowledge
tags: jira,bug-report,ticket,documentation,qa
title: Structure d'un ticket de bug Jira efficace
content: Un ticket de bug doit permettre la reproduction en moins de 5 min sans échange supplémentaire. Champs obligatoires : titre (action + comportement observé), environnement précis (OS, navigateur, version), étapes numérotées, comportement attendu vs observé, preuves (screenshot, log, HAR), sévérité basée sur l'impact métier. Un ticket sans ces éléments reviendra systématiquement chez le QA.
description: Un ticket sans steps de reproduction précis ne peut pas être traité — le dev ferme "can't reproduce" et le bug reste ouvert.
-->

<!-- snippet
id: qa_devtools_preserve_log
type: tip
tech: devtools
level: beginner
importance: high
format: knowledge
tags: devtools,console,debug,navigateur,logs
title: Activer "Preserve log" avant de tester
content: Dans DevTools → Console et Network, cocher "Preserve log" avant de déclencher l'action testée. Sans ça, si la page se recharge (redirect, form submit), toutes les erreurs et requêtes sont effacées. S'active en un clic en haut à gauche de chaque onglet.
description: Sans "Preserve log", une erreur JS ou une requête réseau peut disparaître au rechargement — le bug devient invisible dans les outils.
-->

<!-- snippet
id: qa_devtools_filter_xhr
type: tip
tech: devtools
level: beginner
importance: medium
format: knowledge
tags: devtools,network,api,xhr,filtrage
title: Filtrer par XHR/Fetch dans l'onglet Network
content: L'onglet Network affiche toutes les ressources (images, CSS, fonts, API). Pour isoler les appels API, cliquer sur le filtre "Fetch/XHR" — seules les requêtes dynamiques apparaissent. Cliquer sur une requête → onglet "Response" pour lire la réponse JSON exacte du serveur.
description: Sans filtre XHR, l'onglet Network noie les appels API dans 80+ ressources statiques — le problème devient introuvable.
-->

<!-- snippet
id: qa_postman_import_curl
type: tip
tech: postman
level: beginner
importance: high
format: knowledge
tags: postman,curl,devtools,api,import
title: Importer une requête Chrome directement dans Postman
content: Dans DevTools → Network, clic droit sur la requête → "Copy as cURL (bash)". Dans Postman : File → Import → coller le cURL. La requête est recréée avec tous ses headers, son body et ses cookies. Permet de reproduire exactement ce que le navigateur a envoyé, sans retaper manuellement.
description: Copier-coller un cURL depuis Chrome vers Postman reproduit l'appel API exact en 10 secondes — indispensable pour isoler un bug frontend vs backend.
-->

<!-- snippet
id: qa_log_levels_hierarchy
type: concept
tech: logs
level: beginner
importance: medium
format: knowledge
tags: logs,debug,error,monitoring,serveur
title: Hiérarchie des niveaux de log applicatif
content: Les niveaux de log sont ordonnés par gravité croissante : DEBUG (tout, y compris interne) → INFO (événements normaux) → WARN (anomalie non bloquante) → ERROR (échec d'une opération) → FATAL (arrêt du service). En production, DEBUG est souvent désactivé. En QA, se concentrer sur WARN et ERROR. Toujours noter le timestamp et le nom du service dans l'extrait de log partagé.
description: Confondre WARN et ERROR dans un ticket fausse la priorité — un ERROR bloque une opération, un WARN est un signal à surveiller.
-->

<!-- snippet
id: qa_bug_reproducibility_questions
type: concept
tech: qa
level: beginner
importance: high
format: knowledge
tags: bug-report,reproduction,qa,investigation,ticket
title: 5 questions pour rendre un bug reproductible
content: Avant de créer un ticket, répondre à ces 5 questions : 1) Quel compte / rôle ? 2) Quel état avant l'action (données, étapes préalables) ? 3) Quelles données exactes (ID, valeur, format) ? 4) Quel environnement (prod/staging, navigateur, version) ? 5) Quelle fréquence (toujours, parfois, une fois) ? Si une réponse manque, le ticket sera retourné.
description: Un bug sans contexte de reproduction force le dev à investiguer seul — en moyenne 45 min perdues par ticket flou selon les équipes produit.
-->

<!-- snippet
id: qa_severity_vs_impact
type: warning
tech: jira
level: beginner
importance: medium
format: knowledge
tags: jira,severite,priorite,impact,qa
title: Sévérité ≠ visibilité — baser la sévérité sur l'impact métier
content: Piège : classer "Critical" un bug visible mais cosmétique, et "Minor" un bug discret mais bloquant. Règle : la sévérité reflète l'impact sur le workflow utilisateur. Un bouton mal aligné = Minor. Une facture impossible à télécharger pour un client = Critical, même si l'interface ne montre aucune erreur. Toujours se demander : "Qu'est-ce que l'utilisateur ne peut plus faire à cause de ce bug ?"
description: Une sévérité mal calibrée fausse la priorisation — des bugs critiques restent ouverts pendant que des bugs cosmétiques sont traités en urgence.
-->

<!-- snippet
id: qa_postman_environments
type: tip
tech: postman
level: beginner
importance: medium
format: knowledge
tags: postman,environnement,variables,organisation,api
title: Créer un environnement Postman dès le premier jour
content: Dans Postman, créer un environnement (icône œil → Manage Environments) avec les variables : base_url = https://api.monapp.com, token = <TOKEN_TEST>, user_id = <ID_UTILISATEUR_TEST>. Utiliser ensuite {{base_url}}/v1/factures dans les requêtes. Permet de switcher entre prod/staging en changeant d'environnement d'un clic.
description: Sans environnement Postman, chaque changement d'URL ou de token force à modifier 20 requêtes manuellement — source d'erreurs et de perte de temps.
-->

<!-- snippet
id: qa_devtools_har_export
type: tip
tech: devtools
level: beginner
importance: medium
format: knowledge
tags: devtools,har,network,export,bug-report
title: Exporter un fichier HAR pour documenter les requêtes réseau
content: Dans DevTools → Network, clic droit dans la liste des requêtes → "Save all as HAR with content". Le fichier .har contient toutes les requêtes, leurs headers, payloads et réponses. À joindre au ticket Jira pour les bugs impliquant des appels API — le dev peut l'importer directement dans ses propres DevTools.
description: Un fichier HAR joint à un ticket évite au dev de demander "tu peux me donner la requête exacte ?" — il a tout sans échange supplémentaire.
-->
