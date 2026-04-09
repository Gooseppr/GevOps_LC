---
layout: page
title: Flashcard Jira
sujet: Versionning
type: module
jour: 17
ordre: 1
tags: jira, git, devops
---

# Flashcard Jira

### **Quels sont les avantages de la centralisation des tickets dans Jira ?**

Elle permet d’avoir **toutes les demandes au même endroit**, ce qui facilite :

- La vision globale du travail en cours
- La planification et l’utilisation des ressources
- Le suivi de l’avancement et les mises à jour
- Une communication plus claire entre les parties prenantes

---

### **Comment Jira facilite-t-il le suivi des tickets ?**

Jira permet :

- D’attribuer un responsable à chaque ticket
- De fixer des échéances et des priorités
- D’avoir des tableaux de bord et des rapports pour visualiser l’avancement
    
    → Résultat : **suivi clair des délais, de l’état des tickets et des performances.**
    

---

### **Comment Jira s’intègre-t-il avec GitLab pour l’automatisation des tickets ?**

L’intégration permet :

- Le lien automatique entre commits GitLab et tickets Jira
- La traçabilité complète des modifications de code
- L’automatisation d’actions comme la création ou la mise à jour des tickets selon les événements GitLab

---

### **Comment Jira facilite-t-il la collaboration entre les membres de l’équipe agile ?**

Il facilite la collaboration grâce à :

- Des commentaires accessibles directement sur les tickets
- Des notifications automatiques
- Des mises à jour en temps réel
    
    → Résultat : **communication centralisée et meilleure résolution collective des problèmes.**
    

---

### **Comment Jira peut-il être utilisé pour la gestion des projets agiles ?**

Il propose :

- Des méthodes agiles : Kanban, Scrum, sprints, planification itérative
- Le suivi des tâches, des user stories et de la charge de travail

    → Résultat : **visibilité claire + organisation efficace du travail agile.**

---

<!-- snippet
id: cicd_jira_centralisation_tickets
type: concept
tech: cicd
level: beginner
importance: high
format: knowledge
tags: jira,tickets,centralisation,devops
title: Centralisation des tickets dans Jira
context: comprendre pourquoi utiliser Jira pour gérer les demandes d'une équipe DevOps
content: Centraliser les tickets dans Jira offre une vision globale du travail et facilite la planification des ressources. Tous les membres accèdent au même référentiel et au même suivi d'avancement.
description: Sans outil centralisé, le travail se disperse dans des emails, Slack et tablettes. Jira rend le backlog visible par toute l'équipe, éliminant les doublons et les silences.
-->

<!-- snippet
id: cicd_jira_suivi_tickets
type: concept
tech: cicd
level: beginner
importance: high
format: knowledge
tags: jira,suivi,responsable,echeance,priorite
title: Suivi des tickets avec Jira
context: mettre en place un suivi efficace de l'avancement des tâches dans Jira
content: Jira permet d'attribuer un responsable, fixer des échéances et des priorités. Les tableaux de bord offrent un suivi en temps réel des délais, de l'état des tickets et des performances.
description: Le cycle de vie standard d'un ticket : To Do → In Progress → In Review → Done. Chaque transition peut déclencher des notifications ou des hooks CI/CD.
-->

<!-- snippet
id: cicd_jira_gitlab_integration
type: concept
tech: cicd
level: intermediate
importance: high
format: knowledge
tags: jira,gitlab,integration,automatisation,traçabilite
title: Intégration Jira et GitLab pour l'automatisation
context: lier automatiquement les commits GitLab aux tickets Jira pour une traçabilité complète
content: L'intégration Jira-GitLab lie automatiquement les commits aux tickets via les identifiants dans les messages. Elle permet d'automatiser la transition de statut d'un ticket lors d'un push ou d'une MR.
description: Convention : inclure l'ID du ticket dans chaque message de commit (`git commit -m "PROJ-42 fix: timeout connexion"`). GitLab affiche alors le commit directement dans la timeline Jira.
-->

<!-- snippet
id: cicd_jira_collaboration_agile
type: concept
tech: cicd
level: beginner
importance: medium
format: knowledge
tags: jira,collaboration,agile,notifications,commentaires
title: Collaboration en équipe agile avec Jira
context: améliorer la communication entre développeurs, QA et product owner sur un projet agile
content: Jira centralise la collaboration avec des commentaires sur les tickets, des notifications automatiques et des mises à jour en temps réel. Cela réduit les échanges dispersés et accélère la résolution collective.
-->

<!-- snippet
id: cicd_jira_methodes_agiles
type: concept
tech: cicd
level: beginner
importance: medium
format: knowledge
tags: jira,scrum,kanban,sprint,agile
title: Méthodes agiles dans Jira (Scrum, Kanban, Sprints)
context: choisir et configurer une méthode de travail agile dans Jira pour une équipe DevOps
content: Jira supporte Scrum (sprints, burndown, vélocité) et Kanban (flux continu, WIP limits). Les user stories, epics et tâches structurent le backlog et donnent une visibilité claire sur la charge de travail.
-->