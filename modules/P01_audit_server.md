---
layout: page
title: Audit de serveur
type: pipeline
tags: linux, ssh, docker, devops, network, security, mariadb, postgresql, nginx
---


# 🧩 Pipeline — Audit standard d’un serveur

```bash
#!/bin/bash
# =========================================================
#  PIPELINE D’AUDIT STANDARD - VERSION INTERMÉDIAIRE
#  Objectif : vérifier identité, services, réseau, docker, BDD, sécurité
# =========================================================

echo "=== IDENTITÉ & CONTEXTE ==="
whoami
hostname -f
uname -sr
cat /etc/os-release | grep PRETTY_NAME
echo "Date/Heure : $(date)"
uptime -p

echo
echo "=== SYSTÈME & RESSOURCES ==="
df -hT | grep -E "Filesystem|/dev/"
free -h | head -n 2
top -b -n1 | head -n 5

echo
echo "=== SERVICES ACTIFS ==="
systemctl list-units --type=service --state=running | head -n 15
ps aux --sort=-%mem | head -n 5

echo
echo "=== RÉSEAU ==="
ip -brief address
ip route | grep default
ss -tulpen | grep -E '22|80|443|3306|5432|6379|27017' || echo "Aucun port critique détecté"

echo
echo "=== DOCKER ==="
docker info 2>/dev/null | grep -E "Server Version|Containers|Images"
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo "Docker non présent"
[ -f docker-compose.yml ] && docker compose ps || true

echo
echo "=== BASES DE DONNÉES ==="
systemctl is-active mariadb postgresql redis-server 2>/dev/null
ss -tulpen | grep -E '3306|5432|6379' || echo "Aucune base de données détectée"

echo
echo "=== SERVEUR WEB ==="
systemctl is-active nginx 2>/dev/null
curl -s -I http://localhost | head -n 3 || echo "Pas de réponse HTTP locale"

echo
echo "=== SÉCURITÉ ==="
grep -iE 'PermitRootLogin|PasswordAuthentication' /etc/ssh/sshd_config* 2>/dev/null
last -n 3

```

---

## 🧠 Explications clés (juste l’essentiel)

### 1️⃣ Identité & Contexte

- Vérifie **qui tu es**, sur **quelle machine**, et **depuis combien de temps** elle tourne.
    
    → `whoami`, `hostname`, `uname`, `uptime -p`
    

### 2️⃣ Système & Ressources

- Contrôle **espace disque**, **RAM** et **charge CPU**.
    
    → `df -hT`, `free -h`, `top -b -n1 | head -n 5`
    

### 3️⃣ Services actifs

- Repère les services critiques (`systemctl`), et les process gourmands.
    
    → parfait pour repérer un `postgres`, `nginx`, `docker`, etc.
    

### 4️⃣ Réseau

- Vérifie ton **IP locale**, la **route par défaut**, et les **ports ouverts**.
    
    → `ss -tulpen` est la commande clé ici.
    

### 5️⃣ Docker

- Vérifie si **Docker tourne**, combien de conteneurs et d’images.
    
    → s’il renvoie rien → Docker n’est pas installé ou ton user n’est pas dans le groupe.
    

### 6️⃣ Bases de données

- Vérifie l’état de **MariaDB, PostgreSQL, Redis** (up/down).
    
    → utile sur un serveur applicatif ou un environnement de dev.
    

### 7️⃣ Serveur web

- Vérifie si **Nginx** tourne et si **le port 80** répond.
    
    → `curl -I http://localhost` = test instantané du service web.
    

### 8️⃣ Sécurité

- Vérifie les **paramètres SSH** (root autorisé, mot de passe activé).
- Regarde les **3 dernières connexions** pour déceler des IP étranges.

---

## 💾 Utilisation pratique

```bash
chmod +x audit_standard.sh
./audit_standard.sh | tee audit_$(hostname)_$(date +%F_%H-%M).log

```

---

## 🧩 Pourquoi cette version est équilibrée

| Aspect | Résumé |
| --- | --- |
| **Lisible** | 7 sections claires, chacune fait sens |
| **Compacte** | ~40 lignes exécutable sans scroll infini |
| **Pédagogique** | quelques commentaires + commandes simples |
| **Assez complète** | couvre : système / réseau / docker / bdd / sécurité |
| **Non-destructive** | tout en lecture seule, rien ne modifie la machine |

---

<!-- snippet
id: infra_audit_identity_context
type: command
tech: ansible
level: intermediate
importance: high
format: knowledge
tags: linux,audit,identité,hostname,uptime
title: Commandes d'identification rapide d'un serveur inconnu
context: Premier contact avec un serveur : déterminer qui on est, sur quelle machine et son état général
command: whoami && hostname -f && uname -sr && uptime -p
description: Utilisateur courant, FQDN, OS/kernel et uptime. Minimum vital avant toute intervention sur un serveur inconnu.
-->

<!-- snippet
id: infra_audit_open_ports
type: command
tech: ansible
level: intermediate
importance: high
format: knowledge
tags: linux,audit,réseau,ports,ss
title: Identifier les ports critiques ouverts sur un serveur
context: Vérifier quels services réseau sont actifs et accessibles sur un serveur
command: ss -tulpen | grep -E '22|80|443|3306|5432|6379|27017'
description: ss remplace netstat et est disponible nativement sur Linux moderne. Flags : -t TCP, -u UDP, -l listening, -p process, -e extended, -n numeric. Les ports clés à surveiller : 22 (SSH), 80/443 (web), 3306 (MariaDB), 5432 (PostgreSQL), 6379 (Redis), 27017 (MongoDB). Si aucun résultat, ajouter || echo "Aucun port critique détecté".
-->

<!-- snippet
id: infra_audit_docker_state
type: command
tech: ansible
level: intermediate
importance: medium
format: knowledge
tags: linux,audit,docker,conteneurs,images
title: Vérifier rapidement l'état Docker sur un serveur
context: Contrôler si Docker tourne et lister les conteneurs actifs lors d'un audit
command: docker info 2>/dev/null | grep -E "Server Version|Containers|Images" && docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"
description: `docker info` donne version et compteurs globaux. `docker ps --format table` affiche les conteneurs actifs lisiblement.
-->

<!-- snippet
id: infra_audit_ssh_security
type: command
tech: ansible
level: intermediate
importance: high
format: knowledge
tags: linux,audit,ssh,sécurité,connexions
title: Vérifier les paramètres SSH critiques d'un serveur
context: Contrôler la configuration SSH et les dernières connexions lors d'un audit sécurité
command: grep -iE 'PermitRootLogin|PasswordAuthentication' /etc/ssh/sshd_config* 2>/dev/null && last -n 3
description: Vérifie `PermitRootLogin` (doit être `no`) et `PasswordAuthentication` (doit être `no` avec clés). `last -n 3` détecte les IP inattendues.
-->

<!-- snippet
id: infra_audit_save_log
type: command
tech: ansible
level: intermediate
importance: medium
format: knowledge
tags: linux,audit,log,tee,horodatage
title: Sauvegarder le résultat d'un audit dans un fichier horodaté
context: Conserver une trace de l'état d'un serveur après un audit pour référence future
command: ./audit_standard.sh | tee audit_$(hostname)_$(date +%F_%H-%M).log
description: tee affiche la sortie en temps réel ET l'écrit dans le fichier. Le nom du fichier intègre le hostname et la date/heure au format YYYY-MM-DD_HH-MM pour retrouver facilement l'audit. Ajouter chmod +x avant la première exécution. Le fichier peut être copié via scp pour archivage ou comparaison entre serveurs.
-->
