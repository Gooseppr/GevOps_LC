---
layout: page
title: "Pipeline CI avec GitHub Actions et Docker"

course: docker
theme: "CI/CD"
type: lesson

chapter: 7
section: 2

tags: docker,cicd,github-actions,pipeline,ci
difficulty: advanced
duration: 60
mermaid: true

status: "published"
prev_module: "/courses/docker/docker_ch7_1.html"
prev_module_title: "Introduction au CI/CD avec Docker"
next_module: "/courses/docker/docker_ch7_3.html"
next_module_title: "Push vers un Docker Registry"
---

# Pipeline CI avec GitHub Actions et Docker

## Objectifs pédagogiques

- Comprendre le fonctionnement de GitHub Actions  
- Créer un pipeline CI simple  
- Builder une image Docker automatiquement  
- Automatiser les tests  

---

## Contexte et problématique

Tu sais maintenant ce qu’est le CI/CD.

👉 Mais concrètement :

- comment automatiser ?  
- avec quels outils ?  

👉 GitHub Actions permet de créer des pipelines directement dans ton repo.

---

## Définition

### GitHub Actions*

GitHub Actions est un outil CI/CD intégré à GitHub.

👉 Il permet d’exécuter des workflows automatiquement.

---

## Architecture

```mermaid
flowchart LR
    A[Git Push] --> B[GitHub Actions]
    B --> C[Build Docker]
    C --> D[Test]
    D --> E[Result]
```

---

## Structure d’un workflow

Créer un fichier :

```
.github/workflows/ci.yml
```

---

## Exemple de pipeline

```yaml
name: CI Pipeline

on:
  push:
    branches: [ "main" ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Build Docker image
        run: docker build -t mon-app .

      - name: Run container
        run: docker run mon-app
```

---

## Commandes essentielles

### Déclenchement automatique

👉 Le pipeline se lance à chaque push

---

### Étapes clés

- checkout du code  
- build Docker  
- exécution  

---

## Fonctionnement interne

💡 Astuce  
Chaque étape s’exécute dans un environnement isolé.

⚠️ Erreur fréquente  
Oublier de tester l’image après build.

💣 Piège classique  
Ne pas gérer les erreurs dans le pipeline.  
👉 Si une étape échoue mais n’est pas vérifiée correctement, le pipeline peut continuer.  
👉 Toujours vérifier que chaque étape est critique.

🧠 Concept clé  
Pipeline = suite d’étapes automatisées

---

## Cas réel

Un développeur push du code :

👉 GitHub Actions :

- build l’image  
- lance le conteneur  
- valide le fonctionnement  

---

## Bonnes pratiques

- découper les étapes clairement  
- tester après build  
- utiliser des logs  
- versionner les workflows  

---

## Résumé

GitHub Actions permet de :

- automatiser le build  
- tester les applications  
- standardiser les pipelines  

👉 C’est un outil clé pour le CI/CD moderne  

---

## Notes

*GitHub Actions : outil CI/CD intégré à GitHub
