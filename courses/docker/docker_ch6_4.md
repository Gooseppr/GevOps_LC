---
layout: page
title: "Scaling et haute disponibilité"

course: docker
theme: "Docker Swarm"
type: lesson

chapter: 6
section: 4

tags: docker,swarm,scaling,haute-disponibilite,load-balancing
difficulty: advanced
duration: 50
mermaid: true

status: "published"
prev_module: "/courses/docker/docker_ch6_3.html"
prev_module_title: "Déployer un service avec Docker Swarm"
next_module: "/courses/docker/docker_ch6_5.html"
next_module_title: "Déployer une stack avec Docker Swarm"
---

# Scaling et haute disponibilité

## Objectifs pédagogiques

- Comprendre le scaling dans Docker Swarm  
- Comprendre la haute disponibilité  
- Comprendre le load balancing  
- Observer le comportement en cas de panne  

---

## Contexte et problématique

Une application en production doit :

- supporter du trafic  
- rester disponible  
- résister aux pannes  

👉 Un seul conteneur ne suffit pas.

---

## Définition

### Scaling*

Le scaling consiste à :

👉 augmenter ou diminuer le nombre d’instances d’un service

---

### Haute disponibilité*

La haute disponibilité permet :

👉 de maintenir le service actif même en cas de panne

---

## Architecture

```mermaid
flowchart TD
    A[Service] --> B[Replica 1]
    A --> C[Replica 2]
    A --> D[Replica 3]
    B --> E[Load Balancer]
    C --> E
    D --> E
```

👉 Le trafic est réparti automatiquement

---

## Commandes essentielles

### Créer un service scalable

```bash
docker service create --name web --replicas 3 nginx
```

---

### Modifier le scaling

```bash
docker service scale web=5
```

---

### Voir la répartition

```bash
docker service ps web
```

---

## Fonctionnement interne

💡 Astuce  
Swarm répartit automatiquement les conteneurs sur les nodes disponibles.

⚠️ Erreur fréquente  
Penser que plusieurs replicas = toujours meilleure performance.

💣 Piège classique  
Ne pas tester le comportement en cas de panne.  
👉 Si un conteneur tombe, Swarm le recrée automatiquement.  
👉 Mais si l’application elle-même n’est pas stateless*, cela peut poser problème.  
👉 Il faut concevoir des services adaptés au scaling.

🧠 Concept clé  
Scaling efficace = application adaptée

---

## Cas réel

Tu déploies un service web :

```bash
docker service create --name web --replicas 3 nginx
```

👉 Si un conteneur tombe :

- Swarm le recrée  
- le service reste disponible  

---

## Load balancing

👉 Swarm intègre un load balancer interne :

- répartit les requêtes  
- équilibre la charge  
- transparent pour l’utilisateur  

---

## Bonnes pratiques

- utiliser des applications stateless  
- tester les pannes  
- adapter le nombre de replicas  
- surveiller les performances  

---

## Résumé

Le scaling permet :

- d’augmenter la capacité  
- d’améliorer la disponibilité  

👉 La haute disponibilité est un pilier de l’infrastructure moderne  

---

## Notes

*Scaling : ajustement du nombre d’instances  
*Haute disponibilité : capacité à rester fonctionnel malgré les pannes  
*Stateless : application sans état stocké localement
