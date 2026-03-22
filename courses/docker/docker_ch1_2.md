---
layout: page
title: "Lancer son premier conteneur"

course: docker
theme: "Prise en main"
type: lesson

chapter: 1
section: 2

tags: docker,commande,conteneur,run,terminal
difficulty: beginner
duration: 30
mermaid: false

status: "published"
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
