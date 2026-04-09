---
layout: page
title: "Communication entre conteneurs (approfondie)"

course: docker
chapter_title: "Réseau et volumes"

chapter: 3
section: 2

tags: docker,reseau,dns,ports,communication
difficulty: intermediate
duration: 50
mermaid: true

status: published
prev_module: "/courses/docker/docker_ch3_1.html"
prev_module_title: "Réseau Docker — communication entre conteneurs"
next_module: "/courses/docker/docker_ch3_3.html"
next_module_title: "Types de réseaux Docker"
---

# Communication entre conteneurs (approfondie)

## Objectifs pédagogiques

- Comprendre comment Docker gère la communication interne  
- Comprendre le DNS Docker*  
- Comprendre la différence entre ports internes et externes  
- Mettre en place une communication réelle API ↔ base de données  

---

## Contexte et problématique

Dans le chapitre précédent, tu as connecté des conteneurs via un réseau.

👉 Mais en pratique, il reste plusieurs zones de confusion :

- Comment un conteneur “trouve” un autre ?  
- Faut-il exposer les ports ?  
- Pourquoi localhost ne fonctionne pas ?  

---

## Définition

### DNS Docker*

Docker possède un système DNS interne.

👉 Il permet de résoudre automatiquement :

- le nom d’un conteneur  
- en adresse réseau  

---

## Architecture

```mermaid
flowchart LR
    A[API Container] -->|db:5432| B[Docker DNS]
    B --> C[Database Container]
```

👉 Le conteneur API appelle “db”  
👉 Docker traduit automatiquement en adresse IP  

---

## Ports internes vs externes

| Type | Utilisation | Exemple |
|------|------------|--------|
| Port interne | communication entre conteneurs | 5432 |
| Port externe | accès depuis ton PC | 8080 |

---

👉 Exemple :

```bash
docker run -d --name db --network mon-reseau postgres
```

👉 Ici :
- port 5432 est accessible **dans le réseau Docker**
- pas besoin de `-p`

---

## Commandes essentielles

### Exemple complet

Créer un réseau :

```bash
docker network create app-net
```

Lancer la base :

```bash
docker run -d --name db --network app-net postgres
```

Lancer une app :

```bash
docker run -d --name api --network app-net mon-api
```

---

## Fonctionnement interne

💡 Astuce  
Le nom du conteneur devient automatiquement un hostname.

⚠️ Erreur fréquente  
Utiliser `localhost` dans la config.

💣 Piège classique  
Exposer un port inutilement pour communication interne.  
👉 Entre conteneurs, il ne faut PAS utiliser `-p`.  
👉 Le réseau Docker suffit.  
👉 Exposer un port sert uniquement à accéder depuis l’extérieur (navigateur, PC).

🧠 Concept clé  
Communication interne ≠ communication externe  

---

## Cas réel

Configuration API :

```env
DB_HOST=db
DB_PORT=5432
```

👉 L’API se connecte directement au conteneur “db”

---

## Bonnes pratiques

- Utiliser des réseaux dédiés par application  
- Utiliser les noms de conteneurs  
- Ne pas exposer inutilement les ports  
- Séparer trafic interne / externe  

---

## Résumé

Docker permet une communication simple entre conteneurs :

- via un réseau  
- via un DNS interne  
- sans configuration complexe  

👉 C’est la base des architectures modernes  

---

## Notes

*DNS Docker : système interne de résolution de noms entre conteneurs

---

<!-- snippet
id: docker_dns_concept
type: concept
tech: docker
level: intermediate
importance: high
format: knowledge
tags: reseau,dns,resolution,hostname
title: Le DNS Docker résout les noms de conteneurs automatiquement
content: Docker possède un système DNS interne qui traduit automatiquement le nom d'un conteneur en son adresse réseau. Aucune configuration manuelle n'est nécessaire.
-->

<!-- snippet
id: docker_ports_internes_vs_externes
type: concept
tech: docker
level: intermediate
importance: high
format: knowledge
tags: reseau,ports,interne,externe,exposition
title: Ports internes vs ports externes dans Docker
content: Un port interne sert à la communication entre conteneurs dans le réseau Docker (ex : 5432 pour Postgres). Un port externe (-p) sert à accéder au service depuis la machine hôte ou le navigateur.
description: Entre conteneurs, le port interne suffit. L'option -p n'est nécessaire que pour accéder depuis l'extérieur.
-->

<!-- snippet
id: docker_network_app_net_create
type: command
tech: docker
level: intermediate
importance: medium
format: knowledge
tags: reseau,network,creation
title: Créer un réseau applicatif dédié
command: docker network create app-net
description: Crée un réseau bridge nommé app-net permettant aux conteneurs qui le rejoignent de communiquer par nom sans exposer de ports.
-->

<!-- snippet
id: docker_run_db_reseau
type: command
tech: docker
level: intermediate
importance: high
format: knowledge
tags: reseau,postgres,conteneur,run
title: Lancer Postgres sur un réseau Docker
command: docker run -d --name db --network app-net postgres
description: Lance Postgres en arrière-plan et le connecte au réseau app-net. Le conteneur est joignable par son nom "db" depuis tous les autres conteneurs du même réseau.
-->

<!-- snippet
id: docker_hostname_automatique
type: concept
tech: docker
level: intermediate
importance: high
format: knowledge
tags: reseau,dns,hostname,conteneur
title: Le nom du conteneur devient automatiquement son hostname
content: Quand un conteneur est connecté à un réseau Docker personnalisé, son nom devient immédiatement résolvable comme hostname par les autres conteneurs du même réseau.
-->

<!-- snippet
id: docker_port_exposition_inutile
type: concept
tech: docker
level: intermediate
importance: high
format: knowledge
tags: reseau,ports,exposition,piege
title: Ne pas exposer un port inutilement pour la communication interne
content: Entre conteneurs, il ne faut pas utiliser -p. Le réseau Docker suffit pour la communication interne. L'exposition de port sert uniquement à accéder depuis l'extérieur (navigateur, PC).
-->
