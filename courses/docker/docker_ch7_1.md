---
layout: page
title: "Introduction au CI/CD avec Docker"

course: docker
theme: "CI/CD"
type: lesson

chapter: 7
section: 1

tags: docker,cicd,ci,cd,pipeline,devops
difficulty: advanced
duration: 45
mermaid: true

status: "published"
prev_module: "/courses/docker/docker_ch6_8.html"
prev_module_title: "Bonnes pratiques Docker Swarm"
next_module: "/courses/docker/docker_ch7_2.html"
next_module_title: "Pipeline CI avec GitHub Actions et Docker"
---

# Introduction au CI/CD avec Docker

## Objectifs pédagogiques

- Comprendre ce qu’est le CI/CD  
- Comprendre le rôle de Docker dans un pipeline  
- Comprendre le fonctionnement d’un pipeline automatisé  
- Identifier les étapes clés  

---

## Contexte et problématique

Dans un projet classique :

- tu codes  
- tu testes  
- tu déploies  

👉 Souvent de manière manuelle.

👉 Problèmes :

- erreurs humaines  
- déploiements incohérents  
- perte de temps  

👉 Solution : automatiser avec CI/CD

---

## Définition

### CI (Continuous Integration)*

👉 Intégration continue :

- tester automatiquement le code  
- vérifier qu’il fonctionne  

---

### CD (Continuous Delivery / Deployment)*

👉 Déploiement continu :

- livrer automatiquement  
- déployer en production  

---

## Architecture

```mermaid
flowchart LR
    A[Code] --> B[CI Pipeline]
    B --> C[Build Docker Image]
    C --> D[Test]
    D --> E[Registry]
    E --> F[Deployment]
```

---

## Rôle de Docker

Docker permet de :

- standardiser l’environnement  
- construire une image  
- déployer facilement  

👉 même environnement partout

---

## Étapes d’un pipeline

1. Code push (Git)
2. Build Docker image
3. Tests
4. Push image (registry*)
5. Déploiement

---

## Fonctionnement interne

💡 Astuce  
Docker simplifie énormément le CI/CD.

⚠️ Erreur fréquente  
Tester localement mais pas en CI.

💣 Piège classique  
Ne pas utiliser Docker dans le pipeline.  
👉 Résultat : environnement différent entre dev et prod.  
👉 Bugs difficiles à reproduire.  
👉 Docker permet d’unifier les environnements.

🧠 Concept clé  
CI/CD = automatisation du cycle de vie applicatif

---

## Cas réel

Un développeur push du code :

👉 automatiquement :

- build image Docker  
- tests  
- push sur registry  
- déploiement  

---

## Bonnes pratiques

- automatiser au maximum  
- utiliser Docker pour standardiser  
- tester avant déploiement  
- versionner les images  

---

## Résumé

CI/CD permet de :

- automatiser le développement  
- sécuriser les déploiements  
- accélérer la mise en production  

👉 Docker est un élément clé du pipeline  

---

## Notes

*CI : intégration continue  
*CD : déploiement continu  
*Registry : stockage d’images Docker
