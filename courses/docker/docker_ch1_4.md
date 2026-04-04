---
layout: page
title: "Exécuter et gérer des conteneurs"

course: docker
chapter_title: "Prise en main"

chapter: 1
section: 4

tags: docker,conteneur,gestion,lifecycle,commandes
difficulty: beginner
duration: 35
mermaid: true

status: published
prev_module: "/courses/docker/docker_ch1_3.html"
prev_module_title: "Comprendre images et conteneurs"
next_module: "/courses/docker/docker_ch1_5.html"
next_module_title: "Exposer des ports"
---

# Exécuter et gérer des conteneurs

## Objectifs pédagogiques

- Comprendre le cycle de vie d’un conteneur  
- Savoir démarrer, arrêter et redémarrer un conteneur  
- Comprendre les états d’un conteneur  
- Gérer correctement ses conteneurs  

---

## Contexte et problématique

Lancer un conteneur c’est bien.

Mais en pratique, une application :

- démarre  
- s’arrête  
- redémarre  
- peut planter  

👉 Il faut donc savoir **gérer son cycle de vie**

---

## Définition

Le cycle de vie (lifecycle*) d’un conteneur correspond aux différents états qu’il peut avoir :

- créé  
- en cours d’exécution  
- arrêté  
- supprimé  

---

## Fonctionnement

Voici le cycle de vie d’un conteneur :

```mermaid
flowchart LR
    A[Création] --> B[Démarré]
    B --> C[Arrêté]
    C --> B
    C --> D[Supprimé]
```

---

## Commandes essentielles

### Lancer un conteneur

```bash
docker run -d --name mon-nginx nginx
```

---

### Voir les conteneurs actifs

```bash
docker ps
```

---

### Voir tous les conteneurs

```bash
docker ps -a
```

---

### Arrêter un conteneur

```bash
docker stop mon-nginx
```

👉 Arrêt propre (graceful stop*)

---

### Démarrer un conteneur existant

```bash
docker start mon-nginx
```

---

### Redémarrer un conteneur

```bash
docker restart mon-nginx
```

---

### Supprimer un conteneur

```bash
docker rm mon-nginx
```

---

### Forcer la suppression

```bash
docker rm -f mon-nginx
```

---

## Fonctionnement interne

💡 Astuce  
Un conteneur arrêté existe toujours (il consomme peu de ressources mais reste stocké).

⚠️ Erreur fréquente  
Relancer `docker run` au lieu de `docker start`.

💣 Piège classique  
Accumuler des dizaines de conteneurs arrêtés.

🧠 Concept clé  
`run` = créer + démarrer  
`start` = démarrer un conteneur existant  

---

## Cas réel

Tu déploies un serveur web :

```bash
docker run -d --name web nginx
```

👉 Le serveur tourne

Tu dois le redémarrer après modification :

```bash
docker restart web
```

👉 Pas besoin de recréer le conteneur

---

## Bonnes pratiques

- Toujours nommer ses conteneurs  
- Nettoyer régulièrement (`docker rm`)  
- Utiliser `restart` plutôt que recréer  

---

## Résumé

Un conteneur a un cycle de vie simple :

- créer  
- démarrer  
- arrêter  
- supprimer  

👉 Bien gérer ce cycle évite beaucoup d’erreurs  

---

## Notes

*lifecycle : cycle de vie d’un conteneur
*graceful stop : arrêt propre sans couper brutalement

---

<!-- snippet
id: docker_lifecycle_concept
type: concept
tech: docker
level: beginner
importance: high
format: knowledge
tags: docker,lifecycle,etats,conteneur
title: Cycle de vie d’un conteneur
content: Un conteneur passe par plusieurs états : créé, en cours d’exécution, arrêté, supprimé. Comprendre ce cycle évite de recréer des conteneurs inutilement.
-->

<!-- snippet
id: docker_start_conteneur
type: command
tech: docker
level: beginner
importance: high
format: knowledge
tags: docker,start,demarrage,conteneur
title: Démarrer un conteneur existant
command: docker start <NOM>
example: docker start webserver
description: Démarre un conteneur déjà existant (arrêté). Différent de docker run qui crée ET démarre un nouveau conteneur.
-->

<!-- snippet
id: docker_restart_conteneur
type: command
tech: docker
level: beginner
importance: medium
format: knowledge
tags: docker,restart,redemarrage,conteneur
title: Redémarrer un conteneur
command: docker restart <NOM>
example: docker restart api-gateway
description: Redémarre un conteneur sans le recréer. Utile après une modification de configuration.
-->

<!-- snippet
id: docker_rm_force
type: command
tech: docker
level: beginner
importance: medium
format: knowledge
tags: docker,rm,force,suppression
title: Forcer la suppression d’un conteneur actif
command: docker rm -f <NOM>
example: docker rm -f webserver
description: Supprime un conteneur même s’il est en cours d’exécution. À utiliser avec précaution.
-->

<!-- snippet
id: docker_run_vs_start
type: warning
tech: docker
level: beginner
importance: high
format: knowledge
tags: docker,run,start,confusion
title: Erreur : utiliser docker run au lieu de docker start
content: docker run crée un nouveau conteneur à chaque appel. Si le conteneur existe déjà, il faut utiliser docker start pour le relancer sans en créer un nouveau.
-->

<!-- snippet
id: docker_accumulation_conteneurs
type: concept
tech: docker
level: beginner
importance: medium
format: knowledge
tags: docker,conteneurs,nettoyage,accumulation
title: Piège : accumuler des conteneurs arrêtés
content: Les conteneurs arrêtés restent stockés sur la machine et consomment de l’espace disque. Il faut nettoyer régulièrement avec docker rm.
-->

<!-- snippet
id: docker_conteneur_arrete_existe
type: concept
tech: docker
level: beginner
importance: medium
format: knowledge
tags: docker,conteneur,arret,ressources
title: Un conteneur arrêté existe toujours et peut être relancé
content: Un conteneur arrêté (docker stop) n’est pas supprimé. Il existe toujours mais consomme peu de ressources. On peut le relancer avec docker start ou le supprimer avec docker rm.
-->
