---
layout: page
title: Arrêt controlé
type: pipeline
tags: linux, docker, mariadb, postgresql, redis, nginx, kubernetes, devops
---

# 🧩 Pipeline — Arrêt contrôlé des services d’un serveur

## 🎯 Objectif

Mettre à l’arrêt **proprement** toutes les couches d’un environnement sans rebooter ni couper la connexion SSH.

Utilisation typique :
- avant maintenance / snapshot disque,
- avant déploiement d’une nouvelle version,
- ou pour “geler” complètement un environnement local (VM / serveur distant).

---

## ⚙️ Script d’arrêt

```bash
#!/bin/bash
# =========================================================
#  SHUTDOWN SERVICES (P099)
# =========================================================

echo "=== DOCKER / CONTAINERS ==="
if command -v docker >/dev/null 2>&1; then
    # docker compose down si stack présente
    if [ -f docker-compose.yml ] || [ -f docker-compose.yaml ]; then
        echo "[docker compose down]"
        sudo docker compose down 2>/dev/null || sudo docker-compose down 2>/dev/null
    fi
    # stop et rm conteneurs
    RUNNING=$(sudo docker ps -q)
    [ -n "$RUNNING" ] && echo "[docker stop]" && sudo docker stop $RUNNING
    ALL=$(sudo docker ps -aq)
    [ -n "$ALL" ] && echo "[docker rm]" && sudo docker rm $ALL
else
    echo "Docker non installé."
fi

echo
echo "=== SERVICES APPLICATIFS ==="
for svc in nginx mariadb postgresql redis-server mongod; do
    if systemctl list-unit-files | grep -q "^$svc"; then
        echo "[stop $svc]"
        sudo systemctl stop "$svc"
    fi
done

echo
echo "=== ORCHESTRATEURS / K8S ==="
for svc in k3s k3s-agent kubelet containerd; do
    if systemctl list-unit-files | grep -q "^$svc"; then
        echo "[stop $svc]"
        sudo systemctl stop "$svc"
    fi
done

echo
echo "=== VÉRIFICATION ==="
echo "-- Services encore actifs --"
systemctl list-units --type=service --state=running | head -n 15
echo
echo "-- Conteneurs encore actifs --"
if command -v docker >/dev/null 2>&1; then
    sudo docker ps
else
    echo "Docker indisponible."
fi

echo
echo "✅ Arrêt complet terminé. Aucun service applicatif ne devrait rester actif."

```

---

## 💡 Points clés

- **Sécurité SSH** :
    
    👉 Le script **ne touche jamais `sshd`** pour ne pas te déconnecter.
    
- **Services ciblés** :
    - Web : `nginx`
    - Bases : `mariadb`, `postgresql`, `redis-server`, `mongod`
    - Conteneurs : `docker`, `docker-compose`
    - Orchestrateurs : `k3s`, `k3s-agent`, `kubelet`, `containerd`
- **Remontée** (pour repartir après arrêt) :
    
    ```bash
    sudo systemctl start mariadb postgresql redis-server nginx
    sudo systemctl start k3s k3s-agent kubelet containerd 2>/dev/null
    sudo docker compose up -d 2>/dev/null || sudo docker-compose up -d 2>/dev/null
    
    ```
    

---

## 🚀 Utilisation

```bash
chmod +x shutdown_services.sh
./shutdown_services.sh | tee shutdown_$(hostname)_$(date +%F_%H-%M).log

```

Tu obtiens ainsi :

- un arrêt propre,
- un journal horodaté,
- et un environnement prêt à être snapshoté ou éteint.

---

<!-- snippet
id: infra_shutdown_docker_containers
type: command
tech: ansible
level: intermediate
importance: high
format: knowledge
tags: linux,docker,arrêt,conteneurs,compose
title: Arrêt propre de tous les conteneurs Docker sur un serveur
context: Stopper Docker Compose et tous les conteneurs avant maintenance ou snapshot
command: docker compose down 2>/dev/null; docker stop $(docker ps -q) 2>/dev/null; docker rm $(docker ps -aq) 2>/dev/null
description: Ordre d'arrêt : docker compose down d'abord (arrêt propre avec teardown réseau), puis docker stop sur tous les conteneurs actifs, puis docker rm pour nettoyer. Utiliser command -v docker pour vérifier la présence de Docker avant d'exécuter. Tester l'existence de docker-compose.yml ou docker-compose.yaml avant le compose down.
-->

<!-- snippet
id: infra_shutdown_systemd_services
type: command
tech: ansible
level: intermediate
importance: high
format: knowledge
tags: linux,systemd,arrêt,services,boucle
title: Arrêter conditionnellement des services systemd sans erreur
context: Stopper une liste de services (nginx, mariadb, postgresql, redis) uniquement s'ils sont installés
command: for svc in nginx mariadb postgresql redis-server mongod; do systemctl list-unit-files | grep -q "^$svc" && systemctl stop "$svc"; done
description: Vérifie l'existence du service avant de le stopper pour éviter les erreurs "Unit not found". Ne pas inclure `sshd` pour garder l'accès distant.
-->

<!-- snippet
id: infra_shutdown_verify_state
type: command
tech: ansible
level: intermediate
importance: medium
format: knowledge
tags: linux,audit,vérification,services,conteneurs
title: Vérifier l'état résiduel après arrêt des services
context: Confirmer qu'aucun service applicatif ne tourne encore après le script d'arrêt
command: systemctl list-units --type=service --state=running | head -n 15 && docker ps
description: `systemctl` montre les services encore actifs (SSH doit rester). `docker ps` doit retourner vide si tous les conteneurs sont stoppés.
-->

<!-- snippet
id: infra_restart_after_shutdown
type: command
tech: ansible
level: intermediate
importance: medium
format: knowledge
tags: linux,redémarrage,services,docker,compose
title: Redémarrer les services après une maintenance ou un snapshot
context: Relancer tous les services applicatifs dans le bon ordre après un arrêt contrôlé
command: sudo systemctl start mariadb postgresql redis-server nginx && sudo docker compose up -d 2>/dev/null || sudo docker-compose up -d 2>/dev/null
description: Démarre les bases et services web avant les conteneurs pour respecter les dépendances. Fallback `docker-compose` pour les anciennes versions.
-->
