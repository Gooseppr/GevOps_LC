---
layout: page
title: "Réseau Docker — communication entre conteneurs"

course: docker
theme: "Réseau et volumes"
type: lesson

chapter: 3
section: 1

tags: docker,reseau,conteneurs,communication,network
difficulty: intermediate
duration: 45
mermaid: true

status: "published"
---

# Réseau Docker — communication entre conteneurs

## Objectifs pédagogiques

- Comprendre comment les conteneurs communiquent  
- Comprendre le rôle des réseaux Docker  
- Créer un réseau personnalisé  
- Connecter plusieurs conteneurs ensemble  

---

## Contexte et problématique

Jusqu’ici, tu as lancé des conteneurs isolés.

👉 Mais en réalité, une application est rarement seule.

Exemple classique :

- une API  
- une base de données  

👉 Ces deux éléments doivent communiquer.

---

## Définition

### Réseau Docker*

Un réseau Docker permet de :

👉 **connecter plusieurs conteneurs entre eux**

---

## Architecture

```mermaid
flowchart LR
    A[API Container] --> B[Docker Network]
    B --> C[Database Container]
```

👉 Les conteneurs peuvent communiquer via ce réseau

---

## Commandes essentielles

### Créer un réseau

```bash
docker network create mon-reseau
```

---

### Lancer un conteneur sur un réseau

```bash
docker run -d --name db --network mon-reseau postgres
```

```bash
docker run -d --name api --network mon-reseau mon-api
```

---

### Vérifier les réseaux

```bash
docker network ls
```

---

### Inspecter un réseau

```bash
docker network inspect mon-reseau
```

---

## Fonctionnement interne

💡 Astuce  
Les conteneurs sur le même réseau peuvent se parler avec leur nom.

⚠️ Erreur fréquente  
Utiliser localhost entre conteneurs.

💣 Piège classique  
Essayer de connecter deux conteneurs sans réseau commun.  
👉 Par défaut, les conteneurs sont isolés.  
👉 Sans réseau partagé, ils ne peuvent pas communiquer.  
👉 Résultat : erreurs de connexion (ex : base de données inaccessible).

🧠 Concept clé  
Le réseau Docker agit comme un “pont” entre conteneurs

---

## Cas réel

Une API doit se connecter à une base de données.

Dans la configuration :

```
DB_HOST=db
```

👉 `db` = nom du conteneur

👉 Docker résout automatiquement ce nom

---

## Bonnes pratiques

- Toujours utiliser des réseaux personnalisés  
- Ne pas utiliser localhost entre conteneurs  
- Nommer clairement les conteneurs  

---

## Résumé

Les réseaux Docker permettent de :

- connecter des conteneurs  
- structurer une application  
- faciliter la communication  

👉 C’est indispensable pour les architectures réelles  

---

## Notes

*Réseau Docker : mécanisme permettant la communication entre conteneurs

---
[← Module précédent](docker_ch2_7.md) | [Module suivant →](docker_ch3_2.md)
---
