---
titre: Audit de serveur
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
