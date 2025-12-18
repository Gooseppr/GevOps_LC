---
title: Projet J05
sujet: Projet NocoDb
type: module
jour: 45
ordre: 0
tags: projet
---

# Synthèse – Séparation NocoDB / PostgreSQL et mise en place du backup S3

## Contexte et objectif

L’objectif de la journée était de **faire évoluer l’architecture initiale** afin de la rendre plus :

- lisible,
- maintenable,
- proche des bonnes pratiques DevOps / production.

Pour cela, on a travaillé sur deux axes majeurs :

1. **Découpler l’application (NocoDB) de la base de données (PostgreSQL)**.
2. **Mettre en place un mécanisme de sauvegarde automatisée de la base vers un bucket Amazon S3**.

---

## 1️⃣ Séparation de NocoDB et PostgreSQL

### Situation initiale

Au départ, NocoDB et PostgreSQL étaient déployés dans **une seule stack Docker Swarm** :

- un seul `docker stack deploy`
- un seul `docker-compose.yml`
- des services applicatifs et base de données mélangés

Cette approche fonctionne pour un POC, mais elle pose rapidement des limites.

---

### Pourquoi séparer en deux stacks

On a choisi de passer de **1 stack → 2 stacks** pour plusieurs raisons fondamentales :

### 1. Cycles de vie différents

- **NocoDB** : application, évolue souvent (images, configuration, scaling).
- **PostgreSQL** : composant critique, évolue peu, nécessite stabilité, sauvegardes, procédures de restauration.

Les séparer permet :

- de redéployer l’application **sans toucher à la base**,
- de gérer la base comme un composant à part entière.

### 2. Responsabilités distinctes

- La stack **APP** est orientée applicatif.
- La stack **DB** est orientée données, sécurité, sauvegarde.

C’est une séparation logique, mais aussi organisationnelle.

### 3. Préparation à l’industrialisation

Cette séparation facilite ensuite :

- la mise en place de backups,
- la supervision,
- les restores,
- l’évolution de l’architecture (réplication, migration, etc.).

---

### Mise en œuvre côté Docker Swarm

### Deux stacks distinctes

- **`dbstack`**
    
    Contient uniquement PostgreSQL (`root_db`).
    
- **`appstack`**
    
    Contient uniquement NocoDB.
    

Chaque stack est déployée indépendamment :

```bash
docker stack deploy -c compose-db.yml dbstack
docker stack deploy -c compose-app.yml appstack

```

### Réseau overlay partagé

Pour permettre la communication entre les deux stacks, on a créé un **réseau overlay external** :

```bash
docker network create --driver overlay --attachable backend

```

Ce réseau est ensuite référencé dans les deux compose :

```yaml
networks:
  backend:
    external: true

```

Grâce à cela :

- NocoDB peut joindre PostgreSQL via le DNS Swarm,
- sans coupler les stacks entre elles.

### Nom DNS du service PostgreSQL

Avec deux stacks, le service PostgreSQL est désormais accessible via :

```
dbstack_root_db

```

Ce nom est utilisé dans :

- la variable `NC_DB` côté NocoDB,
- le mécanisme de backup.

---

### Adaptations côté Ansible

On a aligné Ansible sur cette nouvelle architecture :

- rôles distincts (DB / APP),
- déploiements séparés,
- gestion des labels Swarm (`role=db`, `role=app`).

Cela permet :

- de cibler précisément les nœuds,
- de faire tourner les bonnes tâches au bon endroit (ex : backup uniquement sur les nœuds DB).

---

## 2️⃣ Mise en place du backup PostgreSQL vers S3

### Objectif du backup

Garantir que les données PostgreSQL sont :

- sauvegardées automatiquement,
- stockées hors du cluster,
- restaurables en cas de problème.

---

### Qu’est-ce que le backup dans notre architecture ?

Le backup **n’est pas** :

- un service Swarm dédié,
- ni un conteneur supplémentaire.

👉 Le backup est :

- un **script shell** (`backup-pg.sh`) installé sur le nœud DB,
- exécuté automatiquement par **cron**,
- qui interagit avec le conteneur PostgreSQL via `docker exec`.

Ce choix a été fait volontairement pour :

- éviter les problèmes de DNS Swarm depuis l’hôte,
- garantir que le dump s’exécute **au plus près des données**.

---

### Fonctionnement du backup (pas à pas)

1. **Localisation du conteneur PostgreSQL**
    - Le script identifie le conteneur du service `dbstack_root_db` sur le nœud DB.
2. **Dump de la base**
    - `pg_dump` est exécuté **dans le conteneur PostgreSQL**.
    - Format utilisé : `custom (-Fc)` → optimal pour les restaurations.
3. **Compression**
    - Le dump est compressé en `.dump.gz`.
4. **Envoi vers Amazon S3**
    - Upload via `awscli` vers un bucket S3.
    - Arborescence claire :
        
        ```
        postgres/<nom_db>/backup_<timestamp>.dump.gz
        
        ```
        
5. **Nettoyage local**
    - Suppression des dumps locaux anciens pour éviter l’accumulation.

---

### Automatisation via cron

Un cron root est installé sur le nœud DB :

- exécution quotidienne,
- logs redirigés vers `/var/log/backup-pg.log`.

Cela garantit :

- un backup régulier,
- une traçabilité simple en cas d’erreur.

---

### Composants clés du backup

### Variables importantes

- **Bucket S3**
    - variable : `s3_bucket_name`
    - ex : `postgres-backup-storage-bucket`
- **Région AWS**
    - variable : `aws_region`
- **Base de données**
    - `pg_db` (ex : `nocodb_db`)
- **Utilisateur PostgreSQL**
    - `pg_user` (ex : `admin`)
- **Mot de passe**
    - stocké dans Ansible Vault (`vault_postgres_password`)
- **Service PostgreSQL**
    - `db_service_name = dbstack_root_db`

### Sécurité

- pas de mot de passe en clair dans les scripts,
- secrets centralisés via Vault,
- accès S3 via credentials AWS configurés sur le nœud.

---

## Résultat final

À la fin de la journée, on a :

- ✅ Une **architecture Swarm plus propre et plus modulaire**
- ✅ Deux stacks indépendantes (APP / DB)
- ✅ Un réseau overlay partagé maîtrisé
- ✅ Un **backup PostgreSQL automatisé vers Amazon S3**
- ✅ Une sauvegarde réellement vérifiée et visible dans le bucket
- ✅ Une base prête pour des améliorations futures (restore, rétention, monitoring)

---

## Conclusion

Cette évolution marque un vrai passage :

- d’un déploiement “fonctionnel”,
- à une **architecture réfléchie, robuste et maintenable**.

La séparation des stacks et la mise en place du backup ne sont pas des optimisations “cosmétiques” :

ce sont des **fondations essentielles** pour tout projet DevOps sérieux.

Quand tu veux, on peut maintenant enchaîner sur :

- la **procédure de restauration**,
- la **politique de rétention S3**,
- ou une version **100 % containerisée du backup**.

---
[Module suivant →](M45_projet-board-J05.md)
---
