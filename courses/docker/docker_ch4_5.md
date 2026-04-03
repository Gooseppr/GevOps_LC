---
layout: page
title: "Lancer et gérer une stack Docker Compose"

course: docker
chapter_title: "Docker Compose"

chapter: 4
section: 5

tags: docker,compose,up,down,logs,build,lifecycle
difficulty: intermediate
duration: 50
mermaid: true

status: published
prev_module: "/courses/docker/docker_ch4_4.html"
prev_module_title: "Volumes et networks dans Compose"
next_module: "/courses/docker/docker_ch4_6.html"
next_module_title: "Variables d'environnement dans Docker Compose"
---

# Lancer et gérer une stack Docker Compose

## Objectifs pédagogiques

- Comprendre le cycle de vie d'une stack Compose
- Utiliser `docker compose up`, `down`, `logs`, `build`
- Gérer les mises à jour d'une application
- Diagnostiquer des problèmes dans une stack

---

## Contexte et problématique

Tu sais maintenant définir une stack complète avec Docker Compose.

👉 Mais en pratique :

- comment la lancer ?
- comment la mettre à jour ?
- comment voir ce qu'il se passe ?

👉 Il faut savoir **piloter la stack**

---

## Architecture

```mermaid
flowchart LR
    A[docker-compose.yml] --> B[docker compose up]
    B --> C[Containers running]
    C --> D[Logs / Monitoring]
    C --> E[docker compose down]
```

---

## Commandes essentielles

### Lancer une stack

```bash
docker compose up
```

👉 Lance tous les services

---

### Mode détaché

```bash
docker compose up -d
```

👉 Lance en arrière-plan

---

### Reconstruire les images

```bash
docker compose up --build
```

👉 Rebuild + restart

---

### Arrêter une stack

```bash
docker compose down
```

👉 Supprime les conteneurs + réseau

---

### Voir les logs

```bash
docker compose logs
```

---

### Suivre les logs

```bash
docker compose logs -f
```

---

### Voir les services actifs

```bash
docker compose ps
```

---

## Fonctionnement interne

💡 Astuce
`up` recrée automatiquement les conteneurs si nécessaire.

⚠️ Erreur fréquente
Modifier le code sans rebuild (`--build`).

💣 Piège classique
Oublier que `docker compose down` supprime les conteneurs.
👉 Les données non persistées (sans volume) sont perdues.
👉 Cela peut entraîner une perte de travail ou de données si mal anticipé.

🧠 Concept clé
Compose gère le cycle de vie complet de ton application

---

## Cas réel

Tu modifies ton application :

```bash
docker compose up --build -d
```

👉 Les services sont reconstruits et redémarrés

---

## Bonnes pratiques

- utiliser `-d` en usage normal
- utiliser `--build` après modification
- vérifier les logs régulièrement
- éviter `down` si données non persistées

---

## Résumé

Docker Compose permet de :

- lancer une stack
- gérer les services
- monitorer l'application

👉 C'est l'outil principal pour piloter ton architecture

---

## Notes

*Stack : ensemble de services définis dans docker-compose.yml

---

<!-- snippet
id: docker_compose_up_foreground
tech: docker
level: intermediate
importance: medium
format: knowledge
tags: compose,up,lancement
title: Lancer une stack Docker Compose
command: docker compose up
description: Lance tous les services définis dans le docker-compose.yml en mode foreground (logs visibles)
-->

<!-- snippet
id: docker_compose_up_build_flag
tech: docker
level: intermediate
importance: high
format: knowledge
tags: compose,build,mise-a-jour
title: Reconstruire les images et relancer la stack
command: docker compose up --build
description: Reconstruit les images avant de lancer les services — à utiliser après modification du code ou du Dockerfile
-->

<!-- snippet
id: docker_compose_up_detached_build
tech: docker
level: intermediate
importance: high
format: knowledge
tags: compose,up,deploiement
title: Reconstruire et lancer en arrière-plan
command: docker compose up --build -d
description: Combinaison recommandée lors d'un déploiement : rebuild + mode détaché
-->

<!-- snippet
id: docker_compose_logs_follow
tech: docker
level: intermediate
importance: medium
format: knowledge
tags: compose,logs,monitoring
title: Suivre les logs en temps réel
command: docker compose logs -f
description: Affiche les logs de tous les services et reste attaché pour afficher les nouveaux messages
-->

<!-- snippet
id: docker_compose_ps_status
tech: docker
level: intermediate
importance: medium
format: knowledge
tags: compose,status,services
title: Voir l'état des services de la stack
command: docker compose ps
description: Affiche la liste des services avec leur état (running, exited…)
-->

<!-- snippet
id: docker_compose_down_data_loss
tech: docker
level: intermediate
importance: high
format: knowledge
tags: compose,down,donnees
title: `docker compose down` supprime les conteneurs et le réseau
content: `docker compose down` supprime les conteneurs et le réseau créé. Les données non persistées dans un volume sont définitivement perdues. À utiliser avec précaution si aucun volume n'est configuré.
-->

<!-- snippet
id: docker_compose_lifecycle
tech: docker
level: intermediate
importance: medium
format: knowledge
tags: compose,cycle-de-vie,architecture
title: Compose gère le cycle de vie complet de l'application
content: Docker Compose orchestre le démarrage, la mise à jour, le monitoring et l'arrêt d'une stack multi-services via des commandes simples. C'est l'outil central pour piloter une architecture Compose.
-->
