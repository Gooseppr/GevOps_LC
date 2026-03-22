---
layout: page
title: "Bonnes pratiques Docker Swarm"

course: docker
theme: "Docker Swarm"
type: lesson

chapter: 6
section: 8

tags: docker,swarm,bonnes-pratiques,architecture,limites
difficulty: advanced
duration: 45
mermaid: false

status: "published"
prev_module: "/courses/docker/docker_ch6_7.html"
prev_module_title: "Gestion des nodes et services"
next_module: "/courses/docker/docker_ch7_1.html"
next_module_title: "Introduction au CI/CD avec Docker"
---

# Bonnes pratiques Docker Swarm

## Objectifs pédagogiques

- Appliquer les bonnes pratiques Swarm  
- Comprendre les limites de Swarm  
- Éviter les erreurs critiques  
- Savoir quand utiliser Swarm  

---

## Contexte et problématique

Tu sais maintenant :

- créer un cluster  
- déployer des services  
- gérer une stack  

👉 Mais sans bonnes pratiques :

- instabilité  
- erreurs difficiles  
- mauvaise architecture  

---

## Bonnes pratiques essentielles

### 1 — Utiliser plusieurs managers

👉 Minimum recommandé :

- 3 managers  
- quorum (majorité)

---

### 2 — Utiliser des applications stateless

👉 Les données ne doivent pas être stockées localement

---

### 3 — Versionner les images

```bash
mon-app:v1
mon-app:v2
```

👉 éviter `latest`

---

### 4 — Tester avant production

👉 Toujours valider en environnement de test

---

### 5 — Surveiller le cluster

👉 vérifier :

- nodes  
- services  
- logs  

---

## Fonctionnement interne

💡 Astuce  
Swarm est simple mais nécessite de la rigueur.

⚠️ Erreur fréquente  
Utiliser Swarm comme Docker classique.

💣 Piège classique  
Utiliser Swarm pour des architectures trop complexes.  
👉 Swarm a des limites en termes de fonctionnalités et d’écosystème.  
👉 Pour des besoins avancés (auto-scaling, gestion fine du réseau, etc.), Kubernetes est plus adapté.

🧠 Concept clé  
Choisir le bon outil selon le besoin

---

## Limites de Docker Swarm

- moins utilisé que Kubernetes  
- moins de fonctionnalités avancées  
- écosystème plus limité  

---

## Cas réel

Swarm adapté :

- projets simples  
- auto-hébergement  
- petites équipes  

Swarm moins adapté :

- grandes infrastructures  
- microservices complexes  
- cloud à grande échelle  

---

## Bonnes pratiques avancées

- isoler les réseaux  
- sécuriser les accès  
- automatiser les déploiements  
- monitorer (Prometheus, Grafana)  

---

## Résumé

Docker Swarm permet :

- orchestration simple  
- mise en place rapide  
- gestion distribuée  

👉 mais avec des limites à connaître  

---

## Notes

*Quorum : majorité nécessaire pour valider une décision dans un cluster
