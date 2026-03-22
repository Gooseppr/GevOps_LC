---
layout: page
title: "Construire une image"

course: docker
theme: "Dockerfile et images"
type: lesson

chapter: 2
section: 3

tags: docker,build,image,dockerfile,context
difficulty: intermediate
duration: 40
mermaid: true

status: "published"
---

# Construire une image

## Objectifs pédagogiques

- Comprendre le fonctionnement de `docker build`  
- Comprendre la notion de contexte de build  
- Construire une image correctement  
- Diagnostiquer les erreurs de build  

---

## Contexte et problématique

Tu sais maintenant écrire un Dockerfile.

👉 Mais écrire un Dockerfile ne suffit pas.

Il faut ensuite :

- le transformer en image  
- vérifier que tout fonctionne  
- comprendre ce que Docker fait réellement  

---

## Définition

### Build*

Le build est le processus qui consiste à :

👉 **transformer un Dockerfile en image Docker**

---

## Architecture

Composant | Rôle | Exemple
----------|------|--------
Dockerfile | instructions | build de l’image
Contexte | fichiers envoyés | code source
Image | résultat final | application prête

```mermaid
flowchart LR
    A[Dockerfile + fichiers] --> B[Build Docker]
    B --> C[Image]
    C --> D[Conteneur]
```

---

## Commandes essentielles

### Construire une image

```bash
docker build -t mon-app .
```

👉 Explication :

- `build` = construire une image  
- `-t` = nom de l’image  
- `.` = contexte de build  

---

### Changer le nom du Dockerfile

```bash
docker build -f Dockerfile.dev -t mon-app .
```

---

### Voir les images construites

```bash
docker images
```

---

## Fonctionnement interne

💡 Astuce  
Docker exécute chaque instruction du Dockerfile étape par étape.

⚠️ Erreur fréquente  
Ne pas être dans le bon dossier lors du build.

💣 Piège classique  
Envoyer trop de fichiers dans le contexte de build.  
👉 Par défaut, Docker envoie tout le dossier courant (`.`).  
👉 Si ton projet contient des fichiers lourds (node_modules, logs…), le build devient lent.  
👉 Solution : utiliser un fichier `.dockerignore`.

🧠 Concept clé  
Le contexte de build = tous les fichiers envoyés à Docker

---

## Cas réel

Tu es dans ton projet :

```bash
docker build -t mon-api .
```

👉 Docker :

1. lit le Dockerfile  
2. envoie les fichiers  
3. exécute chaque instruction  
4. construit une image  

---

## Bonnes pratiques

- Toujours vérifier le dossier courant  
- Utiliser `.dockerignore`  
- Nommer correctement ses images  
- Tester immédiatement avec `docker run`  

---

## Résumé

Le build permet de :

- transformer un Dockerfile en image  
- préparer une application  
- automatiser la création d’environnement  

👉 C’est une étape centrale dans Docker  

---

## Notes

*Build : processus de création d’une image Docker

---
[← Module précédent](docker_ch2_2.md) | [Module suivant →](docker_ch2_4.md)
---
