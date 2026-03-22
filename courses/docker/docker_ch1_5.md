---
layout: page
title: "Exposer des ports"

course: docker
theme: "Prise en main"
type: lesson

chapter: 1
section: 5

tags: docker,ports,reseau,run,nginx
difficulty: beginner
duration: 30
mermaid: true

status: "published"
prev_module: "/courses/docker/docker_ch1_4.html"
prev_module_title: "Exécuter et gérer des conteneurs"
next_module: "/courses/docker/docker_ch1_6.html"
next_module_title: "Persister les données (volumes)"
---

# Exposer des ports

## Objectifs pédagogiques

- Comprendre pourquoi exposer un port est nécessaire  
- Comprendre la différence entre port interne et externe  
- Utiliser correctement l’option `-p`  
- Accéder à une application Docker depuis un navigateur  

---

## Contexte et problématique

Quand tu lances un conteneur comme :

```bash
docker run nginx
```

👉 Le serveur fonctionne… mais tu ne peux pas y accéder depuis ton navigateur.

Pourquoi ?

👉 Parce que le conteneur est isolé du reste de ta machine.

---

## Définition

### Port*

Un port est un point d’entrée réseau.

👉 Il permet à une application de communiquer avec l’extérieur.

---

### Exposition de port

Exposer un port consiste à :

👉 relier un port de ton ordinateur à un port du conteneur

---

## Fonctionnement

Voici comment fonctionne l’exposition de port :

```mermaid
flowchart LR
    A[Ordinateur<br>localhost:8080] --> B[Docker]
    B --> C[Conteneur<br>port 80]
```

👉 Exemple :
- 8080 = port de ton PC  
- 80 = port du conteneur  

---

## Commandes essentielles

### Exposer un port

```bash
docker run -p 8080:80 nginx
```

👉 Explication :

- `-p` = publication de port  
- `8080` = port externe (ton PC)  
- `80` = port interne (conteneur)  

---

### Accéder à l’application

Dans ton navigateur :

```
http://localhost:8080
```

👉 Tu vois la page nginx

---

### Mode détaché

```bash
docker run -d -p 8080:80 nginx
```

👉 Le conteneur tourne en arrière-plan

---

## Fonctionnement interne

💡 Astuce  
Tu peux choisir n’importe quel port externe disponible.

⚠️ Erreur fréquente  
Inverser les ports (`80:8080` au lieu de `8080:80`)

💣 Piège classique  
Penser que Docker expose automatiquement les ports

🧠 Concept clé  
Le conteneur est isolé → rien n’est accessible sans `-p`

---

## Cas réel

Tu développes une API :

```bash
docker run -d -p 3000:3000 mon-api
```

👉 Ton application est accessible sur :

```
http://localhost:3000
```

---

## Bonnes pratiques

- Toujours vérifier les ports utilisés  
- Ne pas exposer inutilement des ports  
- Documenter les ports dans tes projets  

---

## Résumé

Exposer un port permet de :

- rendre une application accessible  
- connecter ton PC au conteneur  

👉 Syntaxe clé :

```bash
-p port_externe:port_interne
```

---

## Notes

*Port : point d’accès réseau permettant de communiquer avec une application
