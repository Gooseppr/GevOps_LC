---
layout: page
title: "Debug et logs avec Docker Compose"

course: docker
chapter_title: "Docker Compose"

chapter: 4
section: 7

tags: docker,compose,logs,debug,monitoring
difficulty: intermediate
duration: 45
mermaid: true

status: published
prev_module: "/courses/docker/docker_ch4_6.html"
prev_module_title: "Variables d'environnement dans Docker Compose"
next_module: "/courses/docker/docker_ch5_1.html"
next_module_title: "Multi-stage build"
---

# Debug et logs avec Docker Compose

## Objectifs pédagogiques

- Lire les logs de plusieurs services
- Comprendre les erreurs dans une stack complète
- Utiliser les commandes de debug Compose
- Diagnostiquer une architecture multi-conteneurs

---

## Contexte et problématique

Avec Docker Compose, tu ne gères plus un conteneur…

👉 mais plusieurs services en même temps

👉 Donc le debug devient plus complexe :

- quel service plante ?
- où regarder ?
- dans quel ordre analyser ?

---

## Architecture

```mermaid
flowchart LR
    A[API Logs] --> D[Analyse]
    B[DB Logs] --> D
    C[Worker Logs] --> D
```

👉 Tous les services produisent des logs

---

## Commandes essentielles

### Voir tous les logs

```bash
docker compose logs
```

---

### Suivre les logs en direct

```bash
docker compose logs -f
```

---

### Logs d'un service spécifique

```bash
docker compose logs api
```

---

### Voir l'état des services

```bash
docker compose ps
```

---

### Relancer un service

```bash
docker compose restart api
```

---

## Fonctionnement interne

💡 Astuce
Commence toujours par lire les logs avant de modifier quoi que ce soit.

⚠️ Erreur fréquente
Chercher l'erreur dans le mauvais service.

💣 Piège classique
Regarder uniquement les logs de l'API.
👉 Souvent, le problème vient d'un autre service (ex : base de données).
👉 Une erreur de connexion DB apparaît côté API mais la cause est côté DB.
👉 Toujours analyser l'ensemble de la stack.

🧠 Concept clé
Une stack = plusieurs sources de logs interconnectées

---

## Cas réel

Erreur API :

```text
Connection refused
```

👉 Vérification :

```bash
docker compose logs db
```

👉 Problème identifié : DB non prête

---

## Bonnes pratiques

- analyser tous les services
- utiliser `logs -f` pour suivre en temps réel
- identifier le service source du problème
- redémarrer uniquement le service concerné

---

## Résumé

Docker Compose permet de :

- centraliser les logs
- analyser plusieurs services
- diagnostiquer rapidement

👉 C'est essentiel pour maintenir une application

---

## Notes

*Logs : messages générés par les services pour indiquer leur état

---

<!-- snippet
id: docker_compose_logs_all
type: command
tech: docker
level: intermediate
importance: medium
format: knowledge
tags: compose,logs,debug
title: Afficher les logs de toute la stack
command: docker compose logs
description: Affiche les logs de tous les services en une seule commande
-->

<!-- snippet
id: docker_compose_logs_service
type: command
tech: docker
level: intermediate
importance: high
format: knowledge
tags: compose,logs,service
title: Afficher les logs d'un service spécifique
context: Remplacer `api` par le nom du service ciblé dans le docker-compose.yml
command: docker compose logs <SERVICE>
example: docker compose logs api
description: Isole les logs d'un service précis dans une stack multi-conteneurs
-->

<!-- snippet
id: docker_compose_restart_service
type: command
tech: docker
level: intermediate
importance: medium
format: knowledge
tags: compose,restart,debug
title: Redémarrer un service spécifique
command: docker compose restart <SERVICE>
example: docker compose restart worker
description: Redémarre uniquement le service ciblé sans toucher au reste de la stack
-->

<!-- snippet
id: docker_compose_logs_db_debug
type: command
tech: docker
level: intermediate
importance: medium
format: knowledge
tags: compose,logs,db,debug
title: Vérifier les logs de la base de données
command: docker compose logs db
description: Utile lorsqu'une erreur de connexion apparaît côté API — la cause réelle est souvent côté DB
-->

<!-- snippet
id: docker_compose_wrong_service_debug
type: warning
tech: docker
level: intermediate
importance: high
format: knowledge
tags: compose,debug,logs,erreur
title: Chercher l'erreur dans le mauvais service
content: Une erreur visible dans les logs de l'API (ex : "Connection refused") peut avoir sa source dans un autre service (ex : DB non prête). Toujours analyser l'ensemble de la stack avant de modifier quoi que ce soit.
-->

<!-- snippet
id: docker_compose_multi_log_sources
type: concept
tech: docker
level: intermediate
importance: medium
format: knowledge
tags: compose,logs,architecture,debug
title: Une stack = plusieurs sources de logs interconnectées
content: Chaque service produit ses propres logs. Une panne DB se manifeste souvent côté API — analyser toute la stack, pas un seul service.
description: Commencer par `docker compose logs -f` pour voir tout en temps réel
-->
