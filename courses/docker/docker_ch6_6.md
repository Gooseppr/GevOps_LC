---
layout: page
title: "Réseau Swarm (overlay network)"

course: docker
theme: "Docker Swarm"
type: lesson

chapter: 6
section: 6

tags: docker,swarm,network,overlay,cluster
difficulty: advanced
duration: 50
mermaid: true

status: "published"
prev_module: "/courses/docker/docker_ch6_5.html"
prev_module_title: "Déployer une stack avec Docker Swarm"
next_module: "/courses/docker/docker_ch6_7.html"
next_module_title: "Gestion des nodes et services"
---

# Réseau Swarm (overlay network)

## Objectifs pédagogiques

- Comprendre le réseau overlay dans Swarm  
- Comprendre la communication entre machines  
- Différencier bridge vs overlay  
- Déployer des services multi-nodes  

---

## Contexte et problématique

Avec Docker classique :

- les conteneurs communiquent sur une seule machine  

👉 Mais en Swarm :

- les conteneurs sont répartis sur plusieurs machines  

👉 Il faut donc un réseau adapté.

---

## Définition

### Overlay network*

Un overlay network permet :

👉 de connecter des conteneurs sur plusieurs machines  

👉 comme s’ils étaient sur le même réseau  

---

## Architecture

```mermaid
flowchart LR
    A[Node 1] --> B[Overlay Network]
    C[Node 2] --> B
    D[Node 3] --> B
```

👉 Tous les conteneurs peuvent communiquer  

---

## Bridge vs Overlay

| Type | Scope | Usage |
|------|------|------|
| Bridge | 1 machine | Docker classique |
| Overlay | multi-machines | Docker Swarm |

---

## Commandes essentielles

### Créer un réseau overlay

```bash
docker network create --driver overlay mon-reseau
```

---

### Déployer un service avec réseau

```bash
docker service create   --name web   --network mon-reseau   nginx
```

---

## Fonctionnement interne

💡 Astuce  
L’overlay utilise le réseau interne du cluster.

⚠️ Erreur fréquente  
Penser que le réseau bridge fonctionne entre nodes.

💣 Piège classique  
Ne pas ouvrir les ports nécessaires entre machines.  
👉 Swarm utilise des ports spécifiques pour le cluster.  
👉 Si le réseau est mal configuré (firewall), la communication échoue.  
👉 Toujours vérifier la connectivité entre nodes.

🧠 Concept clé  
Overlay = réseau distribué transparent  

---

## Cas réel

Application distribuée :

- API sur Node 1  
- DB sur Node 2  

👉 communication via overlay :

```
DB_HOST=db
```

👉 fonctionne comme en local

---

## Bonnes pratiques

- utiliser overlay pour les services Swarm  
- vérifier la connectivité réseau  
- sécuriser les communications  
- isoler les réseaux par application  

---

## Résumé

Le réseau overlay permet de :

- connecter plusieurs machines  
- simplifier la communication  
- créer une architecture distribuée  

👉 C’est un élément clé de Swarm  

---

## Notes

*Overlay network : réseau permettant la communication entre conteneurs sur plusieurs machines
