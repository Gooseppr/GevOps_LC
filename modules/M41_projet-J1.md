---
title: Projet J1
sujet: Projet
type: module
jour: 41
ordre: 1
tags: projet, docker, docker swarm, stack
---

# 🚀 Déployer et Tester une Stack Docker Swarm (Processus Complet)

Ce guide explique **pas à pas** comment :

- préparer les VMs,
- initialiser un cluster Docker Swarm,
- ajouter des nœuds avec des rôles (labels),
- déployer une stack avec `docker stack deploy`,
- tester la répartition des services.

Il correspond exactement à l’architecture NocoDB (VM applicative ↔ VM database ↔ VM monitoring).

---

# 1) (Optionnel mais recommandé) Donner un hostname clair à chaque VM

Sur chaque VM Linux :

### VM applicative :

```bash
sudo hostnamectl set-hostname app-vm

```

### VM base de données :

```bash
sudo hostnamectl set-hostname db-vm

```

### VM monitoring :

```bash
sudo hostnamectl set-hostname monitoring-vm

```

Vérification :

```bash
hostname

```

> Cela permet d’identifier les nœuds dans docker node ls très facilement.
> 

---

# 2) Installer Docker sur chaque VM

```bash
sudo apt update
sudo apt install -y docker.io
sudo systemctl enable --now docker

```

👉 `docker-compose` n’est pas obligatoire pour du Swarm (c’est `docker stack` qui prend le relais).

---

# 3) Initialiser le Swarm sur la VM “leader”

Sur **app-vm** (ou la VM que tu choisis comme Manager) :

```bash
docker swarm init --advertise-addr <IP_PRIVEE_APP_VM>

```

Docker retourne une commande `docker swarm join ...` comme :

```bash
docker swarm join --token SWMTKN-1-xxxxx <IP_MANAGER>:2377

```

Cette commande sera utilisée sur les autres VMs pour les ajouter au cluster.

---

# 4) Ajouter les autres VMs au Swarm

Sur **db-vm** :

```bash
docker swarm join --token <TOKEN> <IP_MANAGER>:2377

```

Sur **monitoring-vm** :

```bash
docker swarm join --token <TOKEN> <IP_MANAGER>:2377

```

---

# 5) Vérifier l'état des nœuds

Retour sur le Manager (`app-vm`) :

```bash
docker node ls

```

Résultat attendu :

```
ID                            HOSTNAME        STATUS  AVAILABILITY  MANAGER STATUS
abcd1234efgh                  app-vm          Ready   Active        Leader
ijkl5678mnop                  db-vm           Ready   Active
qrst9012uvwx                  monitoring-vm   Ready   Active

```

> Maintenant, tu sais quel nœud correspond à quelle VM.
> 

---

# 6) Assigner des rôles aux nœuds (labels)

Toujours depuis le Manager (`app-vm`) :

### VM applicative

```bash
docker node update --label-add role=app app-vm

```

### VM base de données

```bash
docker node update --label-add role=db db-vm

```

### VM monitoring

```bash
docker node update --label-add role=monitoring monitoring-vm

```

Vérification d’un nœud :

```bash
docker node inspect app-vm --pretty

```

Les labels apparaissent dans la section *Labels*.

---

# 7) Préparer le fichier `compose.yml` pour Swarm

Voici un fichier compatible Docker Swarm, propre et corrigé :

```yaml
version: "3.9"

services:
  nocodb:
    image: nocodb/nocodb:latest
    env_file:
      - .env
    environment:
      NC_DB: "pg://${DB_HOST}:5432?u=${DB_USER}&p=${DB_PASSWORD}&d=${DB_NAME}"
    ports:
      - "8080:8080"
    volumes:
      - nc_data:/usr/app/data
    deploy:
      replicas: 2
      restart_policy:
        condition: on-failure
      placement:
        constraints:
          - node.labels.role == app

  root_db:
    image: postgres:16
    environment:
      POSTGRES_DB: root_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \"$POSTGRES_USER\" -d \"$POSTGRES_DB\""]
      interval: 10s
      timeout: 2s
      retries: 10
    volumes:
      - db_data:/var/lib/postgresql/data
    deploy:
      placement:
        constraints:
          - node.labels.role == db

volumes:
  db_data: {}
  nc_data: {}

```

Remarques importantes :

- Pas de `container_name` en mode Swarm (ignoré).
- Pas de `restart: always` → remplacé par `deploy.restart_policy`.
- Le `placement.constraints` permet de cibler les VMs.
- `DB_HOST=root_db` dans ton `.env`.

---

# 8) Déployer la stack

Toujours sur la VM Manager (`app-vm`) :

```bash
docker stack deploy -c compose.yml mystack

```

Vérifier :

```bash
docker stack ls
docker stack services mystack
docker stack ps mystack

```

---

# 9) Tester la répartition et les replicas

### Services dans la stack :

```bash
docker stack services mystack

```

### Où sont les conteneurs ?

```bash
docker service ps mystack_nocodb
docker service ps mystack_root_db

```

Résultats attendus :

- `nocodb` déployé uniquement sur les nœuds `role=app`,
- `root_db` uniquement sur `role=db`.

---

# 10) Tester le scaling du service

```bash
docker service scale mystack_nocodb=4

```

Regarder où les tasks sont réparties :

```bash
docker service ps mystack_nocodb

```

---

# 11) Tester l’accès à NocoDB

Depuis ton navigateur :

```
http://<IP_PUBLIQUE_APP_VM>:8080

```

Tu dois voir l’interface NocoDB.

---

# ✔️ Résultat final

Avec ce process, tu es capable de :

- créer un cluster Swarm complet,
- ajouter des nœuds,
- leur donner un rôle (labels),
- déployer une stack en ciblant les VMs,
- vérifier la répartition,
- scaler les services,
- valider le fonctionnement complet de NocoDB + PostgreSQL.