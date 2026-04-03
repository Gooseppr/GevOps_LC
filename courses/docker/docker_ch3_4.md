---
layout: page
title: "Volumes avancés"

course: docker
chapter_title: "Réseau et volumes"

chapter: 3
section: 4

tags: docker,volume,bind-mount,stockage,data
difficulty: intermediate
duration: 45
mermaid: true

status: published
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

---

<!-- snippet
id: docker_volume_concept
tech: docker
level: intermediate
importance: high
format: knowledge
tags: volume,stockage,persistance,docker
title: Volume Docker — stockage géré en interne par Docker
content: Un volume Docker est un espace de stockage géré par Docker, stocké dans un répertoire interne. Les données persistent même si le conteneur est supprimé. Recommandé en production.
-->

<!-- snippet
id: docker_bind_mount_concept
tech: docker
level: intermediate
importance: medium
format: knowledge
tags: volume,bind-mount,dev,fichiers
title: Bind mount — lien direct entre le PC et le conteneur
content: Un bind mount crée un lien direct entre un dossier de la machine hôte et un répertoire dans le conteneur. Très utile en développement pour modifier les fichiers en temps réel.
-->

<!-- snippet
id: docker_run_volume_named
tech: docker
level: intermediate
importance: high
format: knowledge
tags: volume,run,stockage,persistance
title: Monter un volume nommé dans un conteneur
command: docker run -v mon-volume:/data <IMAGE>
description: Monte le volume nommé sur le répertoire /data du conteneur. Docker crée le volume automatiquement s'il n'existe pas encore. Les données survivent à la suppression du conteneur.
-->

<!-- snippet
id: docker_run_bind_mount
tech: docker
level: intermediate
importance: medium
format: knowledge
tags: volume,bind-mount,dev,run
title: Monter un bind mount (répertoire courant)
command: docker run -v $(pwd):/app <IMAGE>
description: Monte le répertoire courant sur /app dans le conteneur. Toute modification de fichier est immédiatement visible dans le conteneur sans le redémarrer.
-->

<!-- snippet
id: docker_volume_prod_postgres
tech: docker
level: intermediate
importance: high
format: knowledge
tags: volume,postgres,production,persistance
title: Volume pour base de données Postgres en production
command: docker run -v db-data:/var/lib/postgresql/data postgres
description: Monte le volume "db-data" sur le répertoire de données interne de Postgres. Les données survivent à la suppression du conteneur grâce au volume nommé géré par Docker.
-->

<!-- snippet
id: docker_bind_mount_ecrasement_piege
tech: docker
level: intermediate
importance: medium
format: knowledge
tags: volume,bind-mount,ecrasement,piege
title: Le bind mount peut écraser les fichiers du conteneur
content: Si tu montes un dossier vide avec un bind mount sur un répertoire existant dans le conteneur, les fichiers internes sont masqués. Cela peut casser l'application ou produire un comportement inattendu.
-->

<!-- snippet
id: docker_volume_vs_bindmount_choix
tech: docker
level: intermediate
importance: medium
format: knowledge
tags: volume,bind-mount,dev,production,choix
title: Volume en production, bind mount en développement
content: La règle générale est simple : utilise des volumes pour la production (données stables et sécurisées) et des bind mounts en développement (modifications en temps réel depuis ton éditeur).
-->
