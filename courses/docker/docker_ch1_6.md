---
layout: page
title: "Persister les données (volumes)"

course: docker
theme: "Prise en main"
type: lesson

chapter: 1
section: 6

tags: docker,volume,stockage,persistance,data
difficulty: beginner
duration: 35
mermaid: true

status: "published"
---

# Persister les données (volumes)

## Objectifs pédagogiques

- Comprendre pourquoi les données disparaissent dans Docker  
- Comprendre ce qu’est un volume  
- Utiliser les volumes pour conserver des données  
- Faire la différence entre conteneur et stockage  

---

## Contexte et problématique

Quand tu utilises Docker, tu peux lancer une application qui stocke des données.

Exemple :

- base de données  
- fichiers  
- logs  

👉 Problème :

Si tu supprimes le conteneur…

👉 **toutes les données disparaissent**

---

## Définition

### Persistance*

La persistance signifie :

👉 conserver des données même après arrêt ou suppression

---

### Volume*

Un volume est un espace de stockage externe au conteneur.

👉 Il permet de conserver les données indépendamment du conteneur

---

## Fonctionnement

Voici comment fonctionne un volume :

```mermaid
flowchart LR
    A[Conteneur] --> B[Volume]
    B --> C[Données persistantes]
```

👉 Le conteneur utilise le volume  
👉 Les données restent même si le conteneur disparaît  

---

## Commandes essentielles

### Lancer un conteneur avec volume

```bash
docker run -d -v mon-volume:/data nginx
```

👉 Explication :

- `-v` = volume  
- `mon-volume` = nom du volume  
- `/data` = chemin dans le conteneur  

---

### Voir les volumes

```bash
docker volume ls
```

---

### Inspecter un volume

```bash
docker volume inspect mon-volume
```

---

### Supprimer un volume

```bash
docker volume rm mon-volume
```

---

## Fonctionnement interne

💡 Astuce  
Les volumes sont stockés par Docker sur ta machine.

⚠️ Erreur fréquente  
Penser que les données sont dans le conteneur.

💣 Piège classique  
Supprimer un conteneur et perdre ses données sans volume.

🧠 Concept clé  
Le conteneur est temporaire, le volume est durable.

---

## Cas réel

Tu lances une base de données :

```bash
docker run -d -v db-data:/var/lib/postgresql/data postgres
```

👉 Même si tu supprimes le conteneur :

- les données restent  
- tu peux recréer un conteneur et les retrouver  

---

## Bonnes pratiques

- Toujours utiliser des volumes pour les données importantes  
- Nommer ses volumes clairement  
- Nettoyer les volumes inutilisés  

---

## Résumé

Les volumes permettent de :

- conserver les données  
- séparer stockage et application  

👉 Sans volume = perte de données  

---

## Notes

*Persistance : capacité à conserver des données dans le temps  
*Volume : espace de stockage indépendant du conteneur

---
[← Module précédent](docker_ch1_5.md) | [Module suivant →](docker_ch1_7.md)
---
