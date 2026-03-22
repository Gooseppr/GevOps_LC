---
layout: page
title: "Déploiement automatique (CD)"

course: docker
theme: "CI/CD"
type: lesson

chapter: 7
section: 4

tags: docker,cd,deploiement,swarm,pipeline
difficulty: advanced
duration: 60
mermaid: true

status: "published"
prev_module: "/courses/docker/docker_ch7_3.html"
prev_module_title: "Push vers un Docker Registry"
---

# Déploiement automatique (CD)

## Objectifs pédagogiques

- Comprendre le déploiement continu  
- Automatiser le déploiement d’une application  
- Mettre à jour un service automatiquement  
- Construire un pipeline complet CI → CD  

---

## Contexte et problématique

Tu sais maintenant :

- build une image  
- la push dans un registry  

👉 Mais il reste une étape :

👉 **déployer automatiquement**

---

## Définition

### CD (Continuous Deployment)*

Le CD permet de :

👉 déployer automatiquement une application après validation

---

## Architecture

```mermaid
flowchart LR
    A[Git Push] --> B[CI Build]
    B --> C[Push Registry]
    C --> D[CD Deploy]
    D --> E[Production]
```

---

## Déploiement avec Swarm

### Mettre à jour un service

```bash
docker service update --image username/mon-app:v2 api
```

---

## Exemple pipeline complet

```yaml
name: CI/CD

on:
  push:
    branches: [ "main" ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: SSH to server and deploy
        run: |
          ssh user@server "
          docker pull username/mon-app:latest &&
          docker service update --image username/mon-app:latest api
          "
```

---

## Fonctionnement interne

💡 Astuce  
Le déploiement doit être rapide et automatisé.

⚠️ Erreur fréquente  
Déployer sans validation.

💣 Piège classique  
Déployer directement en production sans test.  
👉 Une erreur peut impacter tous les utilisateurs.  
👉 Toujours valider en staging avant production.

🧠 Concept clé  
CD = livraison automatique maîtrisée

---

## Cas réel

Un développeur push :

👉 automatiquement :

- build  
- push  
- déploiement  

👉 sans intervention manuelle

---

## Bonnes pratiques

- tester avant déploiement  
- utiliser des environnements (dev / staging / prod)  
- versionner les images  
- monitorer après déploiement  

---

## Résumé

Le CD permet de :

- automatiser le déploiement  
- réduire les erreurs humaines  
- accélérer la mise en production  

👉 C’est l’étape finale du pipeline  

---

## Notes

*CD : déploiement continu
