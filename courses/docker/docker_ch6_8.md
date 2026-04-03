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

---

<!-- snippet
id: docker_swarm_multi_managers
type: tip
tech: docker
level: advanced
importance: medium
format: knowledge
tags: swarm,manager,haute-disponibilite,production,quorum
title: Utiliser plusieurs managers en production
content: Minimum 3 managers en production pour garantir le quorum (majorité nécessaire aux décisions). Avec 3 managers, le cluster reste fonctionnel même si l'un tombe.
-->

<!-- snippet
id: docker_swarm_versionner_images
type: tip
tech: docker
level: advanced
importance: low
format: knowledge
tags: swarm,images,tags,deploiement,rollback
title: Versionner les images Docker
content: Utiliser des tags versionnés (mon-app:v1, mon-app:v2) plutôt que latest. Cela permet des rollbacks fiables et garantit la reproductibilité des déploiements.
-->

<!-- snippet
id: docker_swarm_limites_vs_kubernetes
type: concept
tech: docker
level: advanced
importance: low
format: knowledge
tags: swarm,kubernetes,limites,comparaison
title: Limites de Docker Swarm face à Kubernetes
content: Swarm est simple mais limité : pas d'auto-scaling natif, écosystème restreint. Pour des architectures complexes ou de grandes infrastructures cloud, Kubernetes est plus adapté.
-->

<!-- snippet
id: docker_swarm_usage_classique
type: concept
tech: docker
level: advanced
importance: low
format: knowledge
tags: swarm,cas-usage,architecture
title: Cas d'usage de Docker Swarm
content: Swarm convient aux projets simples, à l'auto-hébergement et aux petites équipes. Il est moins adapté aux grandes infrastructures, aux microservices complexes et au cloud à grande échelle.
-->

<!-- snippet
id: docker_swarm_utilise_comme_docker_classique
type: warning
tech: docker
level: advanced
importance: low
format: knowledge
tags: swarm,erreur,architecture,services
title: Utiliser Swarm comme Docker classique
content: Swarm ne s'utilise pas avec `docker run`. Les conteneurs doivent passer par des services et des stacks. Gérer manuellement des conteneurs contourne l'orchestration et crée des comportements imprévisibles.
-->

