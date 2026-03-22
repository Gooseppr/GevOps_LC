---
layout: page
title: "Volumes avancés"

course: docker
theme: "Réseau et volumes"
type: lesson

chapter: 3
section: 4

tags: docker,volume,bind-mount,stockage,data
difficulty: intermediate
duration: 45
mermaid: true

status: "published"
prev_module: "/courses/docker/docker_ch3_3.html"
prev_module_title: "Types de réseaux Docker"
next_module: "/courses/docker/docker_ch3_5.html"
next_module_title: "Partage de données entre conteneurs"
---

# Volumes avancés

## Objectifs pédagogiques

- Comprendre la différence entre volume et bind mount  
- Savoir où sont stockées les données  
- Partager des données entre conteneurs  
- Choisir la bonne stratégie de stockage  

---

## Contexte et problématique

Tu sais déjà utiliser des volumes.

👉 Mais en pratique :

- où sont stockées les données ?  
- comment les partager ?  
- quand utiliser autre chose qu’un volume ?  

---

## Définition

### Volume Docker*

Espace de stockage géré par Docker.

👉 Stocké dans un répertoire interne à Docker

---

### Bind mount*

Lien direct entre un dossier de ton PC et le conteneur.

👉 Exemple :

```bash
-v /mon/dossier:/app
```

---

## Architecture

```mermaid
flowchart LR
    A[Conteneur] --> B[Volume Docker]
    A --> C[Bind Mount (PC)]
```

---

## Comparaison

| Type | Gestion | Emplacement | Usage |
|------|--------|------------|------|
| Volume | Docker | interne | production |
| Bind mount | utilisateur | local | dev |

---

## Commandes essentielles

### Volume

```bash
docker run -v mon-volume:/data nginx
```

---

### Bind mount

```bash
docker run -v $(pwd):/app nginx
```

---

## Fonctionnement interne

💡 Astuce  
Les bind mounts sont très utiles en développement.

⚠️ Erreur fréquente  
Utiliser des bind mounts en production sans contrôle.

💣 Piège classique  
Ne pas comprendre que le bind mount écrase les fichiers du conteneur.  
👉 Si tu montes un dossier vide, tu peux masquer les fichiers internes.  
👉 Résultat : application cassée ou comportement étrange.

🧠 Concept clé  
Volume = stockage stable  
Bind mount = lien direct avec ton système  

---

## Cas réel

Développement :

```bash
docker run -v $(pwd):/app node
```

👉 Modifications en direct

Production :

```bash
docker run -v db-data:/var/lib/postgresql/data postgres
```

👉 Données persistantes

---

## Bonnes pratiques

- utiliser volumes en production  
- utiliser bind mounts en dev  
- nommer clairement les volumes  
- éviter les mélanges  

---

## Résumé

Docker propose deux types de stockage :

- volume → stable et sécurisé  
- bind mount → flexible et dynamique  

👉 Le choix dépend du contexte  

---

## Notes

*Volume : stockage géré par Docker  
*Bind mount : lien direct avec un dossier local
