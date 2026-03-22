---
layout: page
title: "Exécuter et gérer des conteneurs"

course: docker
theme: "Prise en main"
type: lesson

chapter: 1
section: 4

tags: docker,conteneur,gestion,lifecycle,commandes
difficulty: beginner
duration: 35
mermaid: true

status: "published"
prev_module: "/courses/docker/docker_ch1_3.html"
prev_module_title: "Comprendre images et conteneurs"
next_module: "/courses/docker/docker_ch1_5.html"
next_module_title: "Exposer des ports"
---

# Exécuter et gérer des conteneurs

## Objectifs pédagogiques

- Comprendre le cycle de vie d’un conteneur  
- Savoir démarrer, arrêter et redémarrer un conteneur  
- Comprendre les états d’un conteneur  
- Gérer correctement ses conteneurs  

---

## Contexte et problématique

Lancer un conteneur c’est bien.

Mais en pratique, une application :

- démarre  
- s’arrête  
- redémarre  
- peut planter  

👉 Il faut donc savoir **gérer son cycle de vie**

---

## Définition

Le cycle de vie (lifecycle*) d’un conteneur correspond aux différents états qu’il peut avoir :

- créé  
- en cours d’exécution  
- arrêté  
- supprimé  

---

## Fonctionnement

Voici le cycle de vie d’un conteneur :

```mermaid
flowchart LR
    A[Création] --> B[Démarré]
    B --> C[Arrêté]
    C --> B
    C --> D[Supprimé]
```

---

## Commandes essentielles

### Lancer un conteneur

```bash
docker run -d --name mon-nginx nginx
```

---

### Voir les conteneurs actifs

```bash
docker ps
```

---

### Voir tous les conteneurs

```bash
docker ps -a
```

---

### Arrêter un conteneur

```bash
docker stop mon-nginx
```

👉 Arrêt propre (graceful stop*)

---

### Démarrer un conteneur existant

```bash
docker start mon-nginx
```

---

### Redémarrer un conteneur

```bash
docker restart mon-nginx
```

---

### Supprimer un conteneur

```bash
docker rm mon-nginx
```

---

### Forcer la suppression

```bash
docker rm -f mon-nginx
```

---

## Fonctionnement interne

💡 Astuce  
Un conteneur arrêté existe toujours (il consomme peu de ressources mais reste stocké).

⚠️ Erreur fréquente  
Relancer `docker run` au lieu de `docker start`.

💣 Piège classique  
Accumuler des dizaines de conteneurs arrêtés.

🧠 Concept clé  
`run` = créer + démarrer  
`start` = démarrer un conteneur existant  

---

## Cas réel

Tu déploies un serveur web :

```bash
docker run -d --name web nginx
```

👉 Le serveur tourne

Tu dois le redémarrer après modification :

```bash
docker restart web
```

👉 Pas besoin de recréer le conteneur

---

## Bonnes pratiques

- Toujours nommer ses conteneurs  
- Nettoyer régulièrement (`docker rm`)  
- Utiliser `restart` plutôt que recréer  

---

## Résumé

Un conteneur a un cycle de vie simple :

- créer  
- démarrer  
- arrêter  
- supprimer  

👉 Bien gérer ce cycle évite beaucoup d’erreurs  

---

## Notes

*lifecycle : cycle de vie d’un conteneur  
*graceful stop : arrêt propre sans couper brutalement
