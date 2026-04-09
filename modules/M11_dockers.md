---
layout: page
title: Docker & la conteneurisation
sujet: Conteneurisation
type: module
jour: 11
ordre: 2
tags: docker, linux, devops
---

# 🐳 Cours complet : Docker et la conteneurisation

---

## 1. Introduction

### Objectifs du cours

À la fin de ce module, tu seras capable de :

- **Expliquer l’importance de la conteneurisation** et les bénéfices qu’elle apporte en matière de déploiement et de fiabilité.
- **Installer et configurer Docker** sur ton système, y compris la gestion des clés et des dépôts.
- **Créer et construire tes propres images Docker** à partir d’un `Dockerfile`.
- **Lancer, gérer et superviser des conteneurs** via la ligne de commande ou Docker Desktop.
- **Déployer une application en production** dans un environnement isolé et reproductible.

---

## 2. Contexte et problématique

### 2.1 Différences entre environnements

Une application doit pouvoir tourner **de manière stable et constante** sur tous ses environnements : développement, test, production.

Or, d’un système à un autre :

- La **version du système d’exploitation** peut varier.
- La **version de Python, Node.js ou Java** peut différer.
- Les **dépendances installées** peuvent ne pas correspondre.

👉 Ces différences entraînent des bugs ou des échecs au déploiement.

### 2.2 La réponse : la conteneurisation

Docker apporte une solution simple et fiable :

**tout enfermer dans un conteneur**.

Un conteneur embarque :

- l’application,
- ses dépendances,
- ses variables d’environnement,
- ses fichiers de configuration,
- et le système de fichiers nécessaire à son exécution.

Grâce à ça, **le comportement de l’application devient identique sur toutes les machines**.

---

## 3. Pourquoi utiliser Docker ?

### 3.1 Stabilité et portabilité

Les conteneurs fournissent un **environnement d’exécution identique** sur tous les systèmes.

Peu importe que tu sois sur Windows, macOS ou Linux :

le conteneur tourne toujours de la même manière.

### 3.2 Cloisonnement et sécurité

Chaque application tourne dans **son propre espace isolé**.

Cela évite :

- les conflits de versions de bibliothèques,
- les interférences entre applications,
- les risques de plantage global.

Un conteneur qui plante ne perturbe pas les autres.

### 3.3 Réduction des coûts

Traditionnellement, héberger plusieurs applications nécessitait plusieurs serveurs.

Avec Docker :

- tu **héberges plusieurs conteneurs** sur une même machine,
- tu **mutualises les ressources**,
- tu **réduis les coûts matériels et d’administration**.

---

## 4. Fonctionnement de Docker

### 4.1 Architecture globale

| Élément | Rôle | Exemple |
| --- | --- | --- |
| **Image Docker** | Modèle préfabriqué d’une application (avec ses dépendances) | `python:3.12`, `nginx`, `postgres` |
| **Conteneur** | Instance exécutable d’une image | Application en fonctionnement |
| **Dockerfile** | Script décrivant comment construire une image | Liste des instructions |
| **Docker Engine** | Moteur qui gère la création et l’exécution des conteneurs | Service principal |
| **Registry** | Entrepôt où sont stockées les images | Docker Hub, GitLab Registry |

---

## 5. Les images Docker

Une **image** est un modèle figé d’un environnement applicatif.

Elle contient :

- le système de base (souvent `debian` ou `alpine`),
- les dépendances nécessaires,
- le code de ton application,
- et la commande à exécuter au lancement.

Les images sont construites à partir d’un **Dockerfile**, un simple fichier texte décrivant les étapes de création.

### Exemple de Dockerfile :

```docker
# Étape 1 : définir l'image de base
FROM python:3.12-slim

# Étape 2 : copier le code source
WORKDIR /app
COPY . /app

# Étape 3 : installer les dépendances
RUN pip install -r requirements.txt

# Étape 4 : définir la commande de lancement
CMD ["python", "app.py"]

```

### Commandes associées :

```bash
docker build -t mon_app:1.0 .
docker images

```

L’image ainsi créée peut être utilisée pour lancer un ou plusieurs conteneurs.

---

## 6. Le cycle de vie d’un conteneur

Un **conteneur** est une instance vivante d’une image Docker.

Il suit plusieurs étapes dans son cycle de vie :

| Étape | Commande principale | Description |
| --- | --- | --- |
| **Création** | `docker create` | Prépare le conteneur à partir d’une image |
| **Démarrage** | `docker start` ou `docker run` | Lance le conteneur |
| **Exécution** | — | Le conteneur tourne, l’application fonctionne |
| **Arrêt** | `docker stop` | Met fin à l’exécution |
| **Suppression** | `docker rm` | Supprime le conteneur |

### Exemple :

```bash
docker run -d --name mon_app -p 8080:80 mon_app:1.0
docker ps
docker logs mon_app
docker stop mon_app
docker rm mon_app

```

Chaque conteneur est indépendant : il peut être démarré, arrêté, supprimé ou dupliqué à volonté.

---

## 7. Le fichier Dockerfile en détail

Le **Dockerfile** est le cœur de la conteneurisation.

C’est un fichier texte qui décrit étape par étape comment construire une image.

### Les instructions principales

| Instruction | Rôle |
| --- | --- |
| `FROM` | Définit l’image de base (ex. `ubuntu:22.04`) |
| `WORKDIR` | Définit le répertoire de travail à l’intérieur du conteneur |
| `COPY` | Copie des fichiers depuis la machine hôte vers le conteneur |
| `RUN` | Exécute une commande lors de la construction de l’image |
| `EXPOSE` | Indique le port utilisé par l’application |
| `CMD` | Spécifie la commande à exécuter au lancement du conteneur |

L’ordre des instructions est important : Docker utilise un système de **cache par couches**.

Si une étape n’a pas changé, elle n’est pas reconstruite.

---

## 8. Supervision et gestion des conteneurs

Docker fournit des outils intégrés pour surveiller et administrer les conteneurs :

### Commandes utiles

```bash
docker ps -a          # Liste tous les conteneurs
docker stats          # Affiche l’utilisation CPU/RAM en direct
docker logs <nom>     # Consulte les journaux d’un conteneur
docker exec -it <nom> /bin/bash  # Ouvre un terminal dans un conteneur
docker inspect <nom>  # Donne les détails techniques (réseau, volumes, etc.)

```

### Interface graphique

L’application **Docker Desktop** (Windows / macOS) permet :

- de visualiser les conteneurs actifs,
- de superviser les ressources,
- de gérer les volumes et les images.

---

## 9. Installation de Docker (Debian / Ubuntu)

### Étape 1 : Préparer le système

```bash
sudo apt-get update && sudo apt-get install ca-certificates curl gnupg

```

### Étape 2 : Ajouter la clé officielle Docker

```bash
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

```

### Étape 3 : Ajouter le dépôt Docker

```bash
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

```

### Étape 4 : Installer Docker et ses composants

```bash
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

```

### Étape 5 : Accorder les droits à l’utilisateur

```bash
sudo groupadd docker
sudo usermod -aG docker $USER
newgrp docker

```

### Étape 6 : Tester l’installation

```bash
docker run hello-world

```

---

## 10. Avantages et limites de Docker

### Avantages

- Déploiement rapide et reproductible
- Isolement des applications
- Économie de ressources
- Compatibilité entre environnements
- Facilité d’intégration CI/CD

### Limites

- Partage du noyau de l’hôte (moins isolé qu’une VM)
- Gestion du stockage parfois complexe
- Administration réseau à bien maîtriser
- Nécessite une bonne compréhension du cycle de vie des conteneurs

---

## 11. Bonnes pratiques

- Toujours versionner ses Dockerfile dans le dépôt Git.
- Utiliser des images **légères** (`alpine`) pour réduire la taille.
- Nettoyer régulièrement les conteneurs et images inutilisés :
    
    ```bash
    docker system prune -a
    
    ```
    
- Éviter d’exécuter des conteneurs en root.
- Gérer les variables sensibles via des fichiers `.env` ou `secrets`.

---

## 12. Conclusion

Docker est devenu un **standard industriel** dans le développement et le déploiement applicatif.

Il garantit :

- la **reproductibilité** des environnements,
- la **stabilité** entre développement et production,
- la **portabilité** sur toutes les infrastructures,
- et une **intégration fluide** avec les outils d’orchestration comme Kubernetes.

> Docker t’évite de dire :
> 
> 
> “Ça marchait sur ma machine…” 🧑‍💻
>



---

<!-- snippet
id: docker_module_install_debian
type: command
tech: docker
level: beginner
importance: high
format: knowledge
tags: docker,installation,debian,ubuntu
title: Installer Docker sur Debian/Ubuntu
context: préparer une VM Linux pour utiliser Docker
command: sudo apt-get update && sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
description: Installe Docker Engine et ses composants depuis le dépôt officiel Docker. Ajouter l'utilisateur au groupe docker : sudo usermod -aG docker $USER.
-->

<!-- snippet
id: docker_module_build_image
type: command
tech: docker
level: beginner
importance: high
format: knowledge
tags: docker,image,build,dockerfile
title: Construire une image Docker depuis un Dockerfile
context: packager une application dans une image Docker
command: docker build -t mon_app:1.0 .
description: Lit le Dockerfile du répertoire courant et construit une image taguée nom:version. Chaque instruction crée une couche mise en cache pour accélérer les rebuilds.
-->

<!-- snippet
id: docker_module_run_container
type: command
tech: docker
level: beginner
importance: high
format: knowledge
tags: docker,conteneur,run,port
title: Lancer un conteneur avec mapping de port
context: démarrer une application Docker et l'exposer sur la machine hôte
command: docker run -d -p 8080:80 --name mon_app mon_app:1.0
description: Lance le conteneur en arrière-plan (-d), mappe le port 80 interne vers le port 8080 de l'hôte (-p hôte:conteneur) et lui donne un nom.
-->

<!-- snippet
id: docker_module_lifecycle_commands
type: command
tech: docker
level: beginner
importance: medium
format: knowledge
tags: docker,conteneur,lifecycle,ps,logs
title: Gérer le cycle de vie d'un conteneur
context: surveiller, arrêter et supprimer un conteneur Docker
command: docker ps -a
description: Affiche tous les conteneurs (actifs et arrêtés). Utiliser docker stop <nom> pour arrêter, docker rm <nom> pour supprimer, docker logs <nom> pour lire les journaux.
-->

<!-- snippet
id: docker_module_dockerfile_instructions
type: concept
tech: docker
level: beginner
importance: high
format: knowledge
tags: docker,dockerfile,from,run,copy,cmd
title: Instructions essentielles d'un Dockerfile
context: écrire un Dockerfile pour construire une image personnalisée
content: FROM = image de base, WORKDIR = répertoire de travail, COPY = transfert de fichiers, RUN = exécution au build, CMD = lancement au démarrage.
-->

<!-- snippet
id: docker_module_dockerfile_cache_tip
type: tip
tech: docker
level: beginner
importance: medium
format: knowledge
tags: docker,dockerfile,cache,couches
title: Optimiser le cache des couches Dockerfile
context: accélérer les rebuilds Docker en ordonnant correctement les instructions
content: Placer COPY des dépendances (requirements.txt, package.json) avant COPY du code source optimise le cache. Docker ne recrée que les couches modifiées.
-->

<!-- snippet
id: docker_module_system_prune
type: command
tech: docker
level: beginner
importance: medium
format: knowledge
tags: docker,nettoyage,images,conteneurs
title: Nettoyer les ressources Docker inutilisées
context: libérer de l'espace disque en supprimant images et conteneurs orphelins
command: docker system prune -a
description: Supprime tous les conteneurs arrêtés, toutes les images non utilisées et les réseaux inutilisés. Attention : irréversible. Ne touche pas aux volumes nommés.
-->

---
[← Module précédent](M11_Virtualisation.md) | [Module suivant →](M11_dockers_pratique.md)
---
