---
layout: page
title: "Déploiement automatique (CD)"

course: docker
chapter_title: "CI/CD"

chapter: 7
section: 4

tags: docker,cd,deploiement,swarm,pipeline
difficulty: advanced
duration: 60
mermaid: true

status: published
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

---

<!-- snippet
id: docker_cd_concept_definition
type: concept
tech: docker
level: advanced
importance: high
format: knowledge
tags: cd,deploiement-continu,pipeline,production
title: CD (Continuous Deployment) — Définition
content: Le CD déploie automatiquement une application après validation du pipeline CI. C'est l'étape finale : build et push effectués, le service est mis à jour sans intervention manuelle.
description: Le CD est le niveau ultime d'automatisation DevOps.
-->

<!-- snippet
id: docker_cd_service_update
type: command
tech: docker
level: advanced
importance: high
format: knowledge
tags: cd,swarm,service,update,deploiement
title: Mettre à jour un service Docker Swarm via CD
command: docker service update --image <IMAGE>:v2 <SERVICE>
example: docker service update --image monuser/mon-api:v2 api
description: Met à jour l'image d'un service Swarm en production depuis un pipeline CD, après le push dans le registry.
-->

<!-- snippet
id: docker_cd_pipeline_complet_concept
type: concept
tech: docker
level: advanced
importance: high
format: knowledge
tags: cd,ci,pipeline,swarm,automatisation
title: Pipeline CI/CD complet — de Git Push au déploiement
content: Pipeline complet : git push → build Docker → push registry → SSH serveur → docker pull + service update. Tout s'exécute automatiquement à chaque push sur main.
-->

<!-- snippet
id: docker_cd_tip_automatisation_rapide
type: tip
tech: docker
level: advanced
importance: medium
format: knowledge
tags: cd,deploiement,automatisation,bonne-pratique
title: CD fiable : environnements distincts et images versionnées
content: Un CD fiable repose sur des environnements distincts (dev / staging / prod) et des images versionnées. Monitorer après chaque déploiement est indispensable.
-->

<!-- snippet
id: docker_cd_warning_sans_validation
type: warning
tech: docker
level: advanced
importance: high
format: knowledge
tags: cd,deploiement,erreur-frequente,validation
title: Déployer sans validation préalable
content: Déclencher un déploiement sans étape de validation permet aux régressions d'atteindre directement les utilisateurs. Toujours valider l'image avant de déployer.
-->

<!-- snippet
id: docker_cd_warning_staging_manquant
type: warning
tech: docker
level: advanced
importance: high
format: knowledge
tags: cd,staging,production,piege,test
title: Déployer directement en production sans staging
content: Déployer directement en production sans staging expose tous les utilisateurs à une éventuelle régression. Toujours valider en staging avant de promouvoir en prod.
-->
