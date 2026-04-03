---
layout: page
title: "Interagir avec un conteneur"

course: docker
theme: "Prise en main"
type: lesson

chapter: 1
section: 7

tags: docker,exec,interaction,terminal,debug
difficulty: beginner
duration: 30
mermaid: false

status: "published"
prev_module: "/courses/docker/docker_ch1_6.html"
prev_module_title: "Persister les données (volumes)"
next_module: "/courses/docker/docker_ch1_8.html"
next_module_title: "Logs et debug"
---

# Interagir avec un conteneur

## Objectifs pédagogiques

- Comprendre comment accéder à un conteneur  
- Utiliser la commande `docker exec`  
- Exécuter des commandes dans un conteneur  
- Comprendre les bases du debug  

---

## Contexte et problématique

Lancer un conteneur c’est bien.

Mais en pratique, tu vas souvent vouloir :

- vérifier ce qu’il contient  
- lancer des commandes dedans  
- corriger un problème  

👉 Il faut donc pouvoir **interagir avec un conteneur**

---

## Définition

### Interaction avec un conteneur

Interagir signifie :

👉 exécuter des commandes à l’intérieur d’un conteneur déjà en cours d’exécution

---

## Commandes essentielles

### Accéder à un conteneur

```bash
docker exec -it mon-nginx bash
```

👉 Explication :

- `exec` = exécuter une commande  
- `-i` = interactif  
- `-t` = terminal  
- `mon-nginx` = nom du conteneur  
- `bash` = shell (interface de commande)  

---

### Alternative avec sh

```bash
docker exec -it mon-nginx sh
```

👉 Utile si `bash` n’est pas disponible

---

### Exécuter une commande sans entrer

```bash
docker exec mon-nginx ls /
```

👉 Liste les fichiers à la racine du conteneur

---

## Fonctionnement interne

💡 Astuce  
Tu peux exécuter n’importe quelle commande disponible dans le conteneur.

⚠️ Erreur fréquente  
Essayer d’accéder à un conteneur arrêté.

💣 Piège classique  
Modifier un conteneur en pensant que les changements seront permanents.

🧠 Concept clé  
`exec` permet d’agir dans un conteneur, sans le recréer

---

## Cas réel

Ton application ne fonctionne pas.

Tu veux vérifier les fichiers :

```bash
docker exec -it mon-app bash
```

Puis :

```bash
ls
cat config.json
```

👉 Tu peux analyser directement le problème

---

## Bonnes pratiques

- Utiliser `exec` pour debug uniquement  
- Ne pas modifier directement un conteneur en production  
- Préférer modifier l’image plutôt que le conteneur  

---

## Résumé

`docker exec` permet de :

- entrer dans un conteneur  
- lancer des commandes  
- analyser un problème  

👉 C’est un outil essentiel pour comprendre et debug Docker

---

<!-- snippet
id: docker_exec_bash
type: command
tech: docker
level: beginner
importance: high
format: knowledge
tags: docker,exec,bash,terminal,interaction
title: Entrer dans un conteneur avec bash
command: docker exec -it <NOM> bash
description: Ouvre un terminal interactif dans le conteneur. -i = interactif, -t = terminal, bash = shell à lancer.
-->

<!-- snippet
id: docker_exec_sh
type: command
tech: docker
level: beginner
importance: medium
format: knowledge
tags: docker,exec,sh,terminal,alpine
title: Entrer dans un conteneur avec sh (alternative à bash)
command: docker exec -it <NOM> sh
description: Utile quand bash n’est pas disponible dans l’image (ex : images Alpine légères).
-->

<!-- snippet
id: docker_exec_commande_directe
type: command
tech: docker
level: beginner
importance: medium
format: knowledge
tags: docker,exec,commande,liste-fichiers
title: Exécuter une commande dans un conteneur sans entrer dedans
command: docker exec <NOM> ls /
description: Exécute la commande directement dans le conteneur et affiche le résultat dans le terminal hôte, sans ouvrir de session interactive.
-->

<!-- snippet
id: docker_exec_conteneur_arrete_warning
type: warning
tech: docker
level: beginner
importance: high
format: knowledge
tags: docker,exec,conteneur,arrete,erreur
title: Erreur : tenter d’accéder à un conteneur arrêté
content: La commande docker exec ne fonctionne que sur un conteneur en cours d’exécution. Si le conteneur est arrêté, il faut d’abord le démarrer avec docker start.
-->

<!-- snippet
id: docker_exec_modifications_temporaires
type: warning
tech: docker
level: beginner
importance: high
format: knowledge
tags: docker,exec,modifications,temporaire
title: Modifications via exec : temporaires et perdues à la suppression
content: Toute modification faite via docker exec (fichiers, paquets) est temporaire et disparaît à la suppression du conteneur. Pour persister des changements, il faut modifier le Dockerfile et reconstruire l’image.
-->

<!-- snippet
id: docker_exec_usage_debug
type: tip
tech: docker
level: beginner
importance: medium
format: knowledge
tags: docker,exec,debug,bonne-pratique
title: Utiliser exec uniquement pour le debug, jamais en production
content: docker exec est un outil de diagnostic. En production, on ne modifie pas un conteneur directement. On préfère modifier l’image (Dockerfile) et redéployer.
-->
