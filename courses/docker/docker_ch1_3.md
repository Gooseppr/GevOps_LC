---
layout: page
title: "Comprendre images et conteneurs"

course: docker
chapter_title: "Prise en main"

chapter: 1
section: 3

tags: docker,image,conteneur,concepts,run
difficulty: beginner
duration: 30
mermaid: true

status: published
prev_module: "/courses/docker/docker_ch1_2.html"
prev_module_title: "Lancer son premier conteneur"
next_module: "/courses/docker/docker_ch1_4.html"
next_module_title: "Exécuter et gérer des conteneurs"
---

# Comprendre images et conteneurs

## Objectifs pédagogiques

- Comprendre la différence entre une image et un conteneur  
- Comprendre leur relation  
- Savoir les manipuler avec des commandes simples  
- Éviter les confusions classiques  

---

## Contexte et problématique

Quand on commence Docker, une confusion revient très souvent :

👉 Quelle est la différence entre une image et un conteneur ?

Si cette différence n’est pas claire, tu risques :

- de mal utiliser Docker  
- de ne pas comprendre les erreurs  
- de perdre du temps  

---

## Définition

### **Image**

Une image est un modèle, une base.

👉 Elle contient :
- une application  
- des dépendances  
- une configuration  

👉 Elle est **immuable*** (elle ne change pas)

---

### **Conteneur**

Un conteneur est une instance d’une image.

👉 C’est l’image en cours d’exécution

---

## Fonctionnement

Voici la relation entre image et conteneur :

```mermaid
flowchart LR
    A[Image] --> B[Création]
    B --> C[Conteneur]
    C --> D[Application en cours]
```

👉 Une image sert à créer un ou plusieurs conteneurs

---

## Comparaison

| Élément | Image | Conteneur |
|--------|------|----------|
| Nature | Modèle | Instance |
| État | Statique | Dynamique |
| Modifiable | Non | Oui (temporairement) |
| Rôle | Créer | Exécuter |

---

## Commandes essentielles

### Voir les images

```bash
docker images
```

---

### Voir les conteneurs

```bash
docker ps
```

---

### Créer un conteneur depuis une image

```bash
docker run nginx
```

---

### Exemple concret

Tu peux lancer plusieurs conteneurs à partir d’une même image :

```bash
docker run -d nginx
docker run -d nginx
docker run -d nginx
```

👉 1 image → plusieurs conteneurs

---

## Fonctionnement interne

💡 Astuce  
Une image est stockée localement et réutilisée pour créer plusieurs conteneurs.

⚠️ Erreur fréquente  
Penser qu’un conteneur modifie l’image.

💣 Piège classique  
Modifier un conteneur et croire que les changements sont permanents.

🧠 Concept clé  
Un conteneur est temporaire. L’image est la source.

---

## Cas réel

Un développeur crée une image de son application.

Ensuite :

- il lance 1 conteneur → test  
- il lance 5 conteneurs → production  
- il relance → même résultat  

👉 Tout repose sur l’image

---

## Bonnes pratiques

- Toujours distinguer image et conteneur  
- Supprimer les conteneurs inutiles  
- Ne pas travailler directement dans un conteneur  

---

## Résumé

- Une image = modèle  
- Un conteneur = application en cours  

👉 Une image peut créer plusieurs conteneurs  
👉 Un conteneur dépend toujours d’une image  

---

## Notes

*Image : modèle immuable servant à créer des conteneurs
*Conteneur : instance en cours d’exécution d’une image
*Immuable : qui ne change pas

---

<!-- snippet
id: docker_image_immuable
type: concept
tech: docker
level: beginner
importance: high
format: knowledge
tags: docker,image,immuable,modele
title: L’image Docker est immuable
content: Une image est un modèle statique et immuable : elle ne change jamais. Elle contient une application, ses dépendances et sa configuration. On s’en sert pour créer des conteneurs.
-->

<!-- snippet
id: docker_conteneur_instance
type: concept
tech: docker
level: beginner
importance: high
format: knowledge
tags: docker,conteneur,instance,image
title: Un conteneur est une instance d’image
content: Un conteneur est l’image en cours d’exécution. C’est une instance dynamique et temporaire créée à partir d’une image immuable.
-->

<!-- snippet
id: docker_images_liste
type: command
tech: docker
level: beginner
importance: medium
format: knowledge
tags: docker,images,liste
title: Voir les images disponibles localement
command: docker images
description: Affiche toutes les images téléchargées ou construites sur la machine locale.
-->

<!-- snippet
id: docker_une_image_plusieurs_conteneurs
type: concept
tech: docker
level: beginner
importance: medium
format: knowledge
tags: docker,image,scalabilite,multi-conteneurs
title: Une image peut générer plusieurs conteneurs
content: On peut lancer autant de conteneurs que nécessaire à partir d’une seule image. Chaque instance est indépendante. C’est la base de la scalabilité avec Docker.
-->

<!-- snippet
id: docker_conteneur_modifie_pas_image
type: warning
tech: docker
level: beginner
importance: high
format: knowledge
tags: docker,image,conteneur,modifications
title: Erreur : penser qu’un conteneur modifie l’image
content: Modifier des fichiers dans un conteneur ne modifie pas l’image source. Ces changements sont temporaires et disparaissent à la suppression du conteneur.
-->

<!-- snippet
id: docker_conteneur_temporaire
type: concept
tech: docker
level: beginner
importance: high
format: knowledge
tags: docker,conteneur,temporaire,donnees
title: Piège : croire que les modifications dans un conteneur sont permanentes
content: Un conteneur est temporaire. Toute modification faite à l’intérieur (fichiers, données) disparaît à sa suppression. Pour persister des données, il faut utiliser des volumes.
-->
