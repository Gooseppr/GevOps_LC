---
layout: page
title: "Réseau Docker — communication entre conteneurs"

course: docker
chapter_title: "Réseau et volumes"

chapter: 3
section: 1

tags: docker,reseau,conteneurs,communication,network
difficulty: intermediate
duration: 45
mermaid: true

status: published
prev_module: "/courses/docker/docker_ch2_7.html"
prev_module_title: "Bonnes pratiques Dockerfile"
next_module: "/courses/docker/docker_ch3_2.html"
next_module_title: "Communication entre conteneurs (approfondie)"
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

<!-- snippet
id: docker_network_create
type: command
tech: docker
level: intermediate
importance: high
format: knowledge
tags: reseau,network,creation
title: Créer un réseau Docker personnalisé
command: docker network create mon-reseau
description: Crée un réseau Docker personnalisé utilisable pour connecter plusieurs conteneurs entre eux.
-->

<!-- snippet
id: docker_network_run_conteneur
type: command
tech: docker
level: intermediate
importance: high
format: knowledge
tags: reseau,network,run,conteneur
title: Lancer un conteneur sur un réseau spécifique
command: docker run -d --name db --network mon-reseau postgres
description: Lance un conteneur en l'attachant directement à un réseau Docker, permettant la communication avec les autres conteneurs du même réseau.
-->

<!-- snippet
id: docker_network_ls
type: command
tech: docker
level: intermediate
importance: medium
format: knowledge
tags: reseau,network,liste
title: Lister les réseaux Docker existants
command: docker network ls
description: Affiche la liste de tous les réseaux Docker existants avec leur nom, driver et portée.
-->

<!-- snippet
id: docker_network_inspect
type: command
tech: docker
level: intermediate
importance: medium
format: knowledge
tags: reseau,network,inspection
title: Inspecter un réseau Docker
command: docker network inspect mon-reseau
description: Affiche les détails complets d'un réseau Docker : configuration, conteneurs connectés et adresses IP attribuées.
-->

<!-- snippet
id: docker_network_dns_nom_conteneur
type: concept
tech: docker
level: intermediate
importance: high
format: knowledge
tags: reseau,dns,communication,hostname
title: Les conteneurs se parlent via leur nom
content: Les conteneurs sur le même réseau Docker peuvent se contacter directement en utilisant leur nom comme hostname. Pas besoin d'adresse IP.
-->

<!-- snippet
id: docker_network_localhost_erreur
type: concept
tech: docker
level: intermediate
importance: high
format: knowledge
tags: reseau,localhost,erreur,communication
title: Ne pas utiliser localhost entre conteneurs
content: Utiliser localhost entre deux conteneurs est une erreur fréquente. localhost fait référence au conteneur lui-même, pas aux autres conteneurs du réseau.
-->

<!-- snippet
id: docker_network_isolation_piege
type: concept
tech: docker
level: intermediate
importance: high
format: knowledge
tags: reseau,isolation,bridge,piege
title: Conteneurs sans réseau commun ne communiquent pas
content: Par défaut, les conteneurs sont isolés. Sans réseau partagé, ils ne peuvent pas communiquer. Cela provoque des erreurs de connexion (ex : base de données inaccessible).
-->

<!-- snippet
id: docker_network_concept_pont
type: concept
tech: docker
level: intermediate
importance: high
format: knowledge
tags: reseau,bridge,concept,architecture
title: Le réseau Docker agit comme un pont entre conteneurs
content: Un réseau Docker permet de connecter plusieurs conteneurs entre eux. Il agit comme un pont virtuel, permettant la communication sans exposer les services à l'extérieur.
description: Sur le réseau bridge par défaut, les conteneurs communiquent par IP. Sur un réseau nommé (`docker network create`), ils peuvent se joindre par nom de service — ce que fait Docker Compose automatiquement.
-->
