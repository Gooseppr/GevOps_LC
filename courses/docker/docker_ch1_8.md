---
layout: page
title: "Logs et debug"

course: docker
chapter_title: "Prise en main"

chapter: 1
section: 8

tags: docker,logs,debug,monitoring,commandes
difficulty: beginner
duration: 30
mermaid: false

status: published
prev_module: "/courses/docker/docker_ch1_7.html"
prev_module_title: "Interagir avec un conteneur"
next_module: "/courses/docker/docker_ch2_1.html"
next_module_title: "Introduction au Dockerfile"
---

# Logs et debug

## Objectifs pédagogiques

- Comprendre ce que sont les logs  
- Utiliser `docker logs`  
- Suivre l’activité d’un conteneur  
- Diagnostiquer un problème simple  

---

## Contexte et problématique

Quand un conteneur ne fonctionne pas correctement :

- il peut s’arrêter  
- il peut planter  
- il peut ne rien afficher  

👉 Sans information, impossible de comprendre pourquoi.

C’est là qu’interviennent les **logs**.

---

## Définition

### Logs*

Les logs sont des messages générés par une application :

- informations  
- erreurs  
- avertissements  

👉 Ils permettent de comprendre ce qu’il se passe

---

## Commandes essentielles

### Voir les logs d’un conteneur

```bash
docker logs mon-nginx
```

👉 Affiche tout ce que le conteneur a produit

---

### Suivre les logs en temps réel

```bash
docker logs -f mon-nginx
```

👉 `-f` = follow (suivre en direct)

---

### Afficher les dernières lignes

```bash
docker logs --tail 10 mon-nginx
```

👉 Affiche les 10 dernières lignes

---

### Ajouter les timestamps

```bash
docker logs -t mon-nginx
```

👉 Ajoute la date et l’heure

---

## Fonctionnement interne

💡 Astuce  
Les logs sont souvent la première chose à regarder en cas de problème.

⚠️ Erreur fréquente  
Ne pas consulter les logs et chercher au hasard.

💣 Piège classique  
Penser qu’un conteneur ne fait rien alors qu’il génère des erreurs.

🧠 Concept clé  
Les logs = principale source d’information pour le debug

---

## Cas réel

Ton conteneur s’arrête immédiatement :

```bash
docker ps -a
```

Puis :

```bash
docker logs mon-app
```

👉 Tu vois une erreur :

- port déjà utilisé  
- configuration incorrecte  
- dépendance manquante  

---

## Bonnes pratiques

- Toujours vérifier les logs en premier  
- Utiliser `-f` pour suivre en temps réel  
- Ne pas ignorer les erreurs  

---

## Résumé

Les logs permettent de :

- comprendre ce qu’il se passe  
- détecter les erreurs  
- analyser un problème  

👉 C’est l’outil principal de debug dans Docker  

---

## Notes

*Logs : messages générés par une application pour indiquer son état et ses erreurs

---

<!-- snippet
id: docker_logs_definition
type: concept
tech: docker
level: beginner
importance: high
format: knowledge
tags: docker,logs,debug,monitoring
title: Définition des logs Docker
content: Les logs sont les messages générés par une application dans le conteneur : informations, erreurs, avertissements. Ils sont la principale source d'information pour diagnostiquer un problème.
-->

<!-- snippet
id: docker_logs_consulter
type: command
tech: docker
level: beginner
importance: high
format: knowledge
tags: docker,logs,conteneur
title: Voir les logs d'un conteneur
command: docker logs <NOM>
example: docker logs webserver
description: Affiche tout ce que le conteneur a produit depuis son démarrage.
-->

<!-- snippet
id: docker_logs_follow
type: command
tech: docker
level: beginner
importance: high
format: knowledge
tags: docker,logs,follow,temps-reel
title: Suivre les logs en temps réel
command: docker logs -f <NOM>
example: docker logs -f api
description: L'option -f (follow) affiche les logs en direct, comme tail -f. Utile pour surveiller une application qui démarre.
-->

<!-- snippet
id: docker_logs_tail
type: command
tech: docker
level: beginner
importance: medium
format: knowledge
tags: docker,logs,tail,dernieres-lignes
title: Afficher les dernières lignes de logs
command: docker logs --tail 10 <NOM>
example: docker logs --tail 10 api
description: Affiche uniquement les N dernières lignes. Pratique pour les conteneurs avec beaucoup de logs.
-->

<!-- snippet
id: docker_logs_timestamps
type: command
tech: docker
level: beginner
importance: medium
format: knowledge
tags: docker,logs,timestamp,date
title: Afficher les logs avec timestamps
command: docker logs -t <NOM>
example: docker logs -t postgres
description: Ajoute la date et l'heure devant chaque ligne de log pour faciliter le diagnostic temporel.
-->

<!-- snippet
id: docker_logs_premier_reflexe
type: concept
tech: docker
level: beginner
importance: high
format: knowledge
tags: docker,logs,debug,diagnostic
title: Consulter les logs en premier dès qu'un conteneur pose problème
content: En cas de problème avec un conteneur, les logs sont toujours la première chose à regarder. Ils indiquent souvent la cause exacte : port déjà utilisé, configuration incorrecte, dépendance manquante.
-->

<!-- snippet
id: docker_logs_ignorer_warning
type: warning
tech: docker
level: beginner
importance: high
format: knowledge
tags: docker,logs,erreur,diagnostic
title: Erreur : ignorer les logs et chercher au hasard
content: Ne pas consulter les logs avant de déboguer fait perdre du temps. Un conteneur qui s'arrête immédiatement génère presque toujours une erreur lisible dans ses logs.
-->

<!-- snippet
id: docker_logs_conteneur_plante
type: concept
tech: docker
level: beginner
importance: medium
format: knowledge
tags: docker,logs,ps,debug,workflow
title: Workflow debug : ps -a puis logs pour un conteneur planté
content: Si un conteneur disparaît après le lancement, utiliser docker ps -a pour le retrouver, puis docker logs <NOM> pour lire l'erreur. Cette séquence résout la majorité des pannes courantes.
-->
