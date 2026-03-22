---
layout: page
title: "Introduction à Docker Swarm"

course: docker
theme: "Docker Swarm"
type: lesson

chapter: 6
section: 1

tags: docker,swarm,orchestration,cluster
difficulty: advanced
duration: 45
mermaid: true

status: "published"
---

# Introduction à Docker Swarm

## Objectifs pédagogiques

- Comprendre ce qu’est Docker Swarm  
- Comprendre le concept d’orchestration  
- Comprendre la notion de cluster  
- Identifier les différences avec Docker Compose  

---

## Contexte et problématique

Avec Docker Compose, tu peux gérer plusieurs conteneurs…

👉 mais uniquement sur **une seule machine**

👉 Problème en production :

- besoin de haute disponibilité  
- besoin de scalabilité  
- besoin de gérer plusieurs serveurs  

👉 C’est là qu’intervient Docker Swarm

---

## Définition

### Docker Swarm*

Docker Swarm est un orchestrateur de conteneurs.

👉 Il permet de :

- gérer plusieurs machines (cluster)  
- déployer des services  
- répartir la charge automatiquement  

---

### Orchestrateur*

Un orchestrateur est un outil qui :

👉 gère automatiquement des conteneurs à grande échelle

---

## Architecture

```mermaid
flowchart TD
    A[Manager Node] --> B[Worker Node 1]
    A --> C[Worker Node 2]
    A --> D[Worker Node 3]
```

👉 Le manager contrôle le cluster  
👉 Les workers exécutent les conteneurs  

---

## Compose vs Swarm

| Fonction | Compose | Swarm |
|----------|--------|------|
| Multi-machine | ❌ | ✔️ |
| Scalabilité | limitée | ✔️ |
| Orchestration | ❌ | ✔️ |
| Production | limité | ✔️ |

---

## Fonctionnement interne

💡 Astuce  
Swarm est intégré directement dans Docker.

⚠️ Erreur fréquente  
Penser que Swarm remplace complètement Compose.

💣 Piège classique  
Utiliser Swarm sans comprendre les concepts de base Docker.  
👉 Swarm ajoute une couche de complexité.  
👉 Sans maîtrise des bases (réseau, volumes, images), les erreurs deviennent difficiles à diagnostiquer.

🧠 Concept clé  
Swarm = Docker + orchestration

---

## Cas réel

Une application doit :

- tourner sur plusieurs serveurs  
- rester disponible même en cas de panne  
- gérer plusieurs instances  

👉 Swarm permet de répondre à ces besoins

---

## Bonnes pratiques

- maîtriser Docker avant Swarm  
- commencer avec un petit cluster  
- tester en local avant production  
- comprendre les rôles manager / worker  

---

## Résumé

Docker Swarm permet de :

- gérer plusieurs machines  
- orchestrer des conteneurs  
- améliorer la disponibilité  

👉 C’est une introduction à l’orchestration  

---

## Notes

*Docker Swarm : orchestrateur natif de Docker  
*Orchestrateur : outil de gestion automatisée de conteneurs

---
[← Module précédent](docker_ch5_4.md) | [Module suivant →](docker_ch6_2.md)
---
