---
title: Projet J1 - Docker Swarm
sujet: Projet NocoDb
type: module
jour: 41
ordre: 1
tags: projet, docker, docker swarm, stack
---

# 🚀 Déployer et Tester une Stack Docker Swarm (Processus Complet)

Ce guide explique **pas à pas** comment j'ai fais pour :

- préparer les VMs,
- initialiser un cluster Docker Swarm,
- ajouter des nœuds avec des rôles (labels),
- déployer une stack avec `docker stack deploy`,
- tester la répartition des services.

Il correspond exactement à l’architecture NocoDB (VM applicative ↔ VM database ↔ VM monitoring).

---

# 1. (Optionnel mais recommandé) Donner un hostname clair à chaque VM

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

# 2. Installer Docker sur chaque VM

```bash
sudo apt update
sudo apt install -y docker.io
sudo systemctl enable --now docker

```

👉 `docker-compose` n’est pas obligatoire pour du Swarm (c’est `docker stack` qui prend le relais).

---

# 3. Initialiser le Swarm sur la VM “leader”

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

# 4. Ajouter les autres VMs au Swarm

Sur **db-vm** :

```bash
docker swarm join --token <TOKEN> <IP_MANAGER>:2377

```

Sur **monitoring-vm** :

```bash
docker swarm join --token <TOKEN> <IP_MANAGER>:2377

```

---

# 5. Vérifier l'état des nœuds

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

# 6. Assigner des rôles aux nœuds (labels)

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

# 7. Préparer le fichier `compose.yml` pour Swarm

Voici un fichier compatible Docker Swarm, propre et corrigé :

```yaml
version: "3.9"

services:
  nocodb:
    image: nocodb/nocodb:latest
    env_file:
      - .env
    environment:
      NC_DB: "pg://${DB_HOST}:5432?u=${DB_USER}&p=${DB_PASSWORD}&d=${DB_NAME}" # variables du .env
      # variables JWT, SSH et autres peuvent être ajoutées ici
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
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \"$POSTGRES_USER\" -d \"$POSTGRES_DB\""]
      interval: 10s
      timeout: 2s
      retries: 10
    volumes: 
      - "db_data:/var/lib/postgresql/data"
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

# 8. Définir les variables sur la machine

Toujours sur la VM Manager (`app-vm`) :

```bash
export DB_NAME=nocodb_db
export DB_USER=admin
export DB_PASSWORD='le mot de passe'
export DB_HOST=root_db

```

---

# 9. Déployer la stack

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

##  le Bon réflexe pour la prochaine fois : init en 1 replica, puis scale

Pour éviter ces erreurs de migration concurrentes (et faire bien “pro”), tu peux adopter ce pattern :

1. **Pour le premier déploiement NocoDB** :
    
    Dans `compose.yml` :
    
    ```yaml
    nocodb:
      deploy:
        replicas: 1
    
    ```
    
2. Tu déploies :
    
    ```bash
    docker stack deploy -c compose.yml mystack
    docker stack ps mystack
    docker service logs mystack_nocodb
    
    ```
    
    → Tu attends de voir les logs de migrations se terminer + `Nest application successfully started`.
    
3. Ensuite tu montes à 2 replicas :
    
    ```bash
    docker service scale mystack_nocodb=2
    
    ```
    
4. Et tu vérifies :
    
    ```bash
    docker stack ps mystack
    
    ```
    

> Grâce à ça on limite la concurrence lors de l’initialisation du schéma NocoDB en démarrant d’abord avec un seul replica pour que les migrations soient idempotentes, puis on scale ensuite à 2 services une fois la base prête.”


---

# 10. Tester la répartition et les replicas

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

# 11. Tester le scaling du service

```bash
docker service scale mystack_nocodb=4

```

Regarder où les tasks sont réparties :

```bash
docker service ps mystack_nocodb

```

---

# 12. Tester l’accès à NocoDB

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

---
[← Module précédent](M41_projet-board-J01.md) | [Module suivant →](M41_projet-J1-swarm-ansible.md)

---

<!-- snippet
id: ansible_pro_swarm_init_command
type: command
tech: ansible
level: intermediate
importance: high
format: knowledge
tags: swarm,init,manager,advertise-addr
title: Initialiser un cluster Docker Swarm sur le manager
context: Démarrer un cluster Swarm et récupérer le token de join pour les workers
command: docker swarm init --advertise-addr <IP_PRIVEE_APP_VM>
example: docker swarm init --advertise-addr 10.0.1.10
description: Utiliser l'IP privée de la VM manager (pas l'IP publique). La commande retourne un token docker swarm join à utiliser sur les workers. Vérifier l'état du cluster avec docker node ls depuis le manager.
-->

<!-- snippet
id: ansible_pro_swarm_node_label
type: command
tech: ansible
level: intermediate
importance: high
format: knowledge
tags: swarm,labels,placement,node
title: Assigner des labels de rôle aux nœuds Swarm
context: Cibler des VMs spécifiques pour le placement des services avec des contraintes Swarm
command: docker node update --label-add role=app app-vm
description: Exécuter depuis le manager uniquement. Remplacer role=app par role=db ou role=monitoring selon le nœud cible. Les labels sont ensuite utilisés dans compose.yml via placement.constraints (node.labels.role == app). Vérifier avec docker node inspect <node> --pretty.
-->

<!-- snippet
id: ansible_pro_swarm_stack_deploy
type: command
tech: ansible
level: intermediate
importance: high
format: knowledge
tags: swarm,stack,deploy,compose
title: Déployer une stack Docker Swarm depuis un compose.yml
context: Déployer et gérer une stack multi-services sur un cluster Swarm
command: docker stack deploy -c compose.yml mystack
description: Exécuter depuis le manager. Vérifier avec docker stack ls, docker stack services mystack, docker stack ps mystack. Pour les migrations, démarrer avec replicas:1 puis scaler avec docker service scale mystack_nocodb=2 une fois les migrations terminées.
-->

<!-- snippet
id: ansible_pro_swarm_scale
type: command
tech: ansible
level: intermediate
importance: medium
format: knowledge
tags: swarm,scale,replicas,services
title: Scaler un service Docker Swarm
context: Augmenter ou diminuer le nombre de replicas d'un service après déploiement
command: docker service scale mystack_nocodb=4
description: Vérifier la répartition des tâches avec docker service ps mystack_nocodb. En production, démarrer avec 1 replica pour les migrations de BDD, puis scaler. Les contraintes placement garantissent que les replicas restent sur les nœuds au bon label de rôle.
-->

<!-- snippet
id: ansible_pro_swarm_no_container_name
type: warning
tech: ansible
level: intermediate
importance: medium
format: knowledge
tags: swarm,compose,container_name,restart
title: Incompatibilités compose.yml en mode Docker Swarm
context: Adapter un fichier compose.yml classique pour Docker Swarm
content: En mode Swarm, container_name est ignoré et restart:always est remplacé par deploy.restart_policy. Le réseau overlay doit être déclaré explicitement avec driver:overlay.
-->

---
[← Module précédent](M41_projet-board-J01.md) | [Module suivant →](M41_projet-J1-swarm-ansible.md)
---
