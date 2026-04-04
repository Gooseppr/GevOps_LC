---
layout: page
title: "Lancer son premier conteneur"

course: docker
chapter_title: "Prise en main"

chapter: 1
section: 2

tags: docker,commande,conteneur,run,terminal
difficulty: beginner
duration: 30
mermaid: false

status: published
prev_module: "/courses/docker/docker_ch1_1.html"
prev_module_title: "Introduction à Docker"
next_module: "/courses/docker/docker_ch1_3.html"
next_module_title: "Comprendre images et conteneurs"
---

# Lancer son premier conteneur

## Objectifs pédagogiques

- Comprendre la commande `docker run`  
- Lancer différents types de conteneurs  
- Comprendre les options principales  
- Savoir interagir avec un conteneur  

---

## Contexte et problématique

Dans le chapitre précédent, tu as lancé un conteneur simple avec :

```bash
docker run hello-world
```

👉 Maintenant, on va comprendre **ce que fait réellement cette commande**  
et apprendre à lancer des conteneurs plus utiles.

---

## Architecture

Composant | Rôle | Exemple
---------|------|--------
Image | Modèle de l’application | nginx, ubuntu
Conteneur | Instance en cours d’exécution | serveur web actif
Docker Engine | Moteur qui exécute les conteneurs | service Docker

---

## Commandes essentielles

### Lancer un conteneur simple

```bash
docker run nginx
```

👉 Lance un serveur web nginx

---

### Lancer un conteneur en mode interactif

```bash
docker run -it ubuntu bash
```

👉 Explication :

- `-i` = mode interactif (tu peux taper des commandes)  
- `-t` = terminal  
- `ubuntu` = image  
- `bash` = commande exécutée dans le conteneur  

---

### Lancer un conteneur en arrière-plan

```bash
docker run -d nginx
```

👉 `-d` = mode détaché (le conteneur tourne en fond)

---

### Donner un nom au conteneur

```bash
docker run -d --name mon-nginx nginx
```

👉 Permet de retrouver facilement ton conteneur

---

### Voir les conteneurs actifs

```bash
docker ps
```

---

### Arrêter un conteneur

```bash
docker stop mon-nginx
```

---

### Supprimer un conteneur

```bash
docker rm mon-nginx
```

---

## Fonctionnement interne

💡 Astuce  
Si l’image n’existe pas en local, Docker la télécharge automatiquement.

⚠️ Erreur fréquente  
Lancer plusieurs fois le même conteneur sans le supprimer.

🧠 Concept clé  
`docker run` = télécharger + créer + démarrer

---

## Cas réel en entreprise

Tu veux tester rapidement une base de données :

```bash
docker run -d postgres
```

👉 Pas besoin d’installation complexe  
👉 Tout est prêt immédiatement

---

## Bonnes pratiques

- Toujours nommer ses conteneurs  
- Nettoyer les conteneurs inutilisés  
- Comprendre chaque option utilisée  

---

## Résumé

La commande `docker run` est la base de Docker.

Elle permet de :

- lancer une application  
- créer un conteneur  
- tester rapidement un service  

👉 C’est le point d’entrée principal dans Docker

---

<!-- snippet
id: docker_run_interactif
type: command
tech: docker
level: beginner
importance: high
format: knowledge
tags: docker,run,interactif,terminal,ubuntu
title: Lancer un conteneur en mode interactif
command: docker run -it ubuntu bash
description: -i = mode interactif, -t = terminal, ubuntu = image, bash = commande exécutée dans le conteneur.
-->

<!-- snippet
id: docker_run_detache
type: command
tech: docker
level: beginner
importance: high
format: knowledge
tags: docker,run,detache,background
title: Lancer un conteneur en arrière-plan
command: docker run -d nginx
description: L’option -d (detached) fait tourner le conteneur en fond sans bloquer le terminal.
-->

<!-- snippet
id: docker_run_nom_conteneur
type: command
tech: docker
level: beginner
importance: medium
format: knowledge
tags: docker,run,nom,nommage
title: Donner un nom à un conteneur
command: docker run -d --name <NOM> nginx
example: docker run -d --name webserver nginx
description: Nommer un conteneur permet de le retrouver et de le manipuler plus facilement avec stop, start, rm.
-->

<!-- snippet
id: docker_stop_conteneur
type: command
tech: docker
level: beginner
importance: high
format: knowledge
tags: docker,stop,arret,conteneur
title: Arrêter un conteneur
command: docker stop <NOM>
example: docker stop webserver
description: Envoie un signal d’arrêt propre au conteneur. Le conteneur s’arrête mais n’est pas supprimé.
-->

<!-- snippet
id: docker_rm_conteneur
type: command
tech: docker
level: beginner
importance: high
format: knowledge
tags: docker,rm,suppression,conteneur
title: Supprimer un conteneur
command: docker rm <NOM>
example: docker rm webserver
description: Supprime un conteneur arrêté. Le conteneur doit être stoppé avant d’être supprimé, sauf avec l’option -f.
-->

<!-- snippet
id: docker_run_telecharge_auto
type: concept
tech: docker
level: beginner
importance: medium
format: knowledge
tags: docker,run,image,telechargement
title: Docker télécharge l’image automatiquement si absente
content: Si l’image n’existe pas en local, Docker la télécharge automatiquement depuis Docker Hub lors du docker run. Pas besoin de docker pull au préalable.
-->

<!-- snippet
id: docker_run_multiple_conteneurs_warning
type: warning
tech: docker
level: beginner
importance: medium
format: knowledge
tags: docker,run,conteneurs,accumulation
title: Erreur : lancer plusieurs fois le même conteneur sans nettoyer
content: Relancer docker run crée un nouveau conteneur à chaque fois. Les anciens conteneurs s’accumulent. Il faut utiliser docker rm pour les supprimer ou docker start pour relancer un conteneur existant.
-->
