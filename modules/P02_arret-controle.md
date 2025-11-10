---
titre: Arrêt controlé
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
