---
titre: Automatiser avec cron
type: module
jour: 02
ordre: 3
tags: cron, bash, linux
---

# Automatiser avec **cron** — comprendre & manipuler sans galérer

## 1) Ce que tu sauras faire

- Comprendre comment fonctionne **cron** (service d’ordonnancement).
- Automatiser des sauvegardes, nettoyages, rapports récurrents.
- Créer / modifier / lire / supprimer des tâches avec **crontab**.
- Maitriser la **syntaxe** (5 champs + commande, raccourcis @daily, etc.).
- Appliquer les **bonnes pratiques** (scripts, chemins absolus, logs, non-chevauchement).
- **Diagnostiquer** via les logs système et tester proprement.

---

## 2) À quoi sert cron ?

**cron** tourne en arrière-plan et exécute des commandes à des horaires planifiés (comme un agenda automatique). Tu écris tes tâches dans une **crontab** (to-do list horodatée) ; cron lit cette liste et déclenche au bon moment.

Exemples d’usages :

- Sauvegarde quotidienne à minuit,
- Nettoyage hebdo d’un dossier temporaire,
- Envoi d’un rapport chaque lundi matin.

---

## 3) Comment ça marche (architecture minimale)

- **Service** : `crond` (souvent géré par systemd).
- **Crontabs utilisateur** : éditées via `crontab -e` (une par utilisateur).
- **Crontab système** : `/etc/crontab` et fichiers dans `/etc/cron.d/`.
- **Jobs prédéfinis** : `/etc/cron.daily`, `/etc/cron.hourly`, etc. (lancés par `run-parts`).

> Note : Sur Ubuntu/Debian récents, les logs liés à cron passent dans syslog et/ou journalctl. Sur macOS, cron existe mais Apple pousse plutôt launchd (hors périmètre ici).
> 

---

## 4) La syntaxe cron (5 champs + commande)

```
*  *  *  *  *  commande
|  |  |  |  |
|  |  |  |  └── Jour de semaine (0-7, dim = 0 ou 7)
|  |  |  └───── Mois (1-12 ou jan,feb,…)
|  |  └──────── Jour du mois (1-31)
|  └─────────── Heure (0-23)
└────────────── Minute (0-59)

```

- = “n’importe quelle valeur”.
- Plages : `8-18` ; listes : `1,15,30` ; pas : `/10` (toutes les 10 minutes).

**Exemples courants :**

```
* * * * *   /path/to/script.sh                   # chaque minute
0 * * * *   /path/to/script.sh                   # à chaque heure pile
0 0 * * *   /path/to/script.sh                   # tous les jours à minuit
0 4 * * 1   /home/user/backup.sh                 # chaque lundi à 04:00
*/10 * * * * /usr/local/bin/collect-metrics.sh   # toutes les 10 minutes
30 8-18 * * 1-5 /usr/local/bin/report.sh         # 08:30 à 18:30, lundi→vendredi

```

**Raccourcis utiles** (spécial-cron) :

```
@reboot   /path/to/script.sh               # au démarrage
@hourly   /path/to/script.sh               # toutes les heures
@daily    /path/to/script.sh               # chaque jour (≈ 00:00)
@weekly   /path/to/script.sh
@monthly  /path/to/script.sh
@yearly   /path/to/script.sh

```

> Dans /etc/crontab et /etc/cron.d/*, il y a 6 champs : les 5 temps + l’utilisateur.
> 
> 
> Exemple :
> 
> `0 2 * * *  root  /usr/local/bin/backup.sh`
> 

---

## 5) Manipuler sa crontab (utilisateur)

### Créer / modifier

```bash
crontab -e
# Choisis nano si tu débutes (Ctrl+X, Y, Entrée pour sauvegarder)

```

### Lister

```bash
crontab -l

```

### Supprimer **toutes** les entrées (irréversible)

```bash
crontab -r

```

### Éditer la crontab d’un autre utilisateur (administrateur)

```bash
sudo crontab -u alice -e
sudo crontab -u alice -l

```

---

## 6) Écrire des jobs **fiables** (bonnes pratiques)

### 6.1 Mets la logique dans un script, pas dans la crontab

- Crée `backup.sh` avec un **shebang** et rends-le exécutable :

```bash
cat > /home/user/bin/backup.sh <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
# Variables explicites
SRC="/srv/data"
DST="/backup/$(date +%F)"
mkdir -p "$DST"
rsync -a --delete "$SRC/" "$DST/"
echo "[OK] backup $(date -Is)" >> /var/log/backup.log
EOF

chmod +x /home/user/bin/backup.sh

```

- Appelle-le dans ta crontab avec des **chemins absolus** :

```
0 2 * * *  /home/user/bin/backup.sh >> /var/log/backup.cron.log 2>&1

```

### 6.2 Utilise **des chemins absolus**

- L’environnement cron est **minimal** (`PATH` restreint, pas tes alias).
- Évite `python` ou `rsync` tout court, préfère `/usr/bin/python3`, `/usr/bin/rsync`.

### 6.3 Redirige les sorties pour **déboguer**

```
* * * * * /path/to/script.sh >> /var/log/monjob.log 2>&1

```

- `>>` append ; `2>&1` redirige l’erreur standard vers la sortie standard.

### 6.4 Fixe l’environnement si nécessaire

Dans la crontab **(utilisateur)**, tu peux définir :

```
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/bin
MAILTO=""                       # vide = pas d’email
TZ=Europe/Paris                 # fuseau si besoin

```

### 6.5 Empêche les **chevauchements**

Si ton job peut prendre plus longtemps que son intervalle :

- **`flock`** (simple et robuste) :

```
*/5 * * * * /usr/bin/flock -n /tmp/rapport.lock /usr/local/bin/rapport.sh

```

- Ou **`systemd-run --scope`** + timers (voir §11) si tu préfères systemd.

### 6.6 Attention aux **`%`** dans crontab

Le caractère `%` est spécial (sépare l’input de la commande). Échappe-le `\%` ou mets ta commande dans un script.

### 6.7 Pense à **l’exécutable** et aux droits

- `chmod +x script.sh` ; lis/écris où il faut ; loggable par root si besoin.
- Teste manuellement : `/path/to/script.sh` **avant** de le mettre au cron.

---

## 7) Tester et diagnostiquer

### 7.1 Forcer un “dry run”

Planifie toutes les minutes pendant 2–3 minutes :

```
* * * * * /path/to/script.sh >> /tmp/test.log 2>&1

```

Surveille :

```bash
tail -f /tmp/test.log

```

### 7.2 Lire les logs

- Debian/Ubuntu :

```bash
grep CRON /var/log/syslog
# ou (systemd)
journalctl -u cron -f

```

- CentOS/RHEL :

```bash
grep CRON /var/log/cron
journalctl -u crond -f

```

### 7.3 Problèmes courants

- **Commande introuvable** → utilise des chemins absolus ou exporte `PATH=...`.
- **Permissions** → droits du fichier/dossier/log, user correct (root vs utilisateur).
- **Script marche en manuel mais pas en cron** → variables d’environnement manquantes, `cd` implicite. Solution : `cd` explicite dans le script ou utiliser des chemins absolus partout.
- **DST / changement d’heure** → évite les horaires *pile* et préfère `systemd timer` si c’est critique (voir après).

---

## 8) Crontab **système** (admin)

### `/etc/crontab` (6 champs)

Exemple :

```
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/bin

# m h dom mon dow user  command
0 3 * * *  root /usr/local/sbin/rotate-logs.sh

```

### `/etc/cron.d/monapp`

Un fichier dédié par application :

```
*/15 * * * *  www-data  /usr/local/bin/collect-stats.sh >> /var/log/monapp.stats.log 2>&1

```

### `cron.daily` / `cron.weekly` …

Déposer un script exécutable dans `/etc/cron.daily/` (attention aux noms compatibles avec `run-parts` : lettres, chiffres, tirets).

```bash
sudo install -m 755 monjob.sh /etc/cron.daily/monjob

```

---

## 9) Expressions utiles prêtes à coller

**Rapport chaque vendredi à 17:45 :**

```
45 17 * * 5 /usr/local/bin/rapport.sh >> /var/log/rapport.log 2>&1

```

**Sauvegarde toutes les 6 heures :**

```
0 */6 * * * /usr/local/bin/backup.sh

```

**Nettoyer les fichiers de +30 jours chaque nuit :**

```
0 1 * * * /usr/bin/find /var/tmp -type f -mtime +30 -delete

```

**Échelonner (stagger) pour éviter les pics :**

```
0 2 * * * sleep $((RANDOM%600)); /usr/local/bin/task.sh

```

---

## 10) Sécurité & contrôle d’accès

- **Limiter qui peut utiliser cron** :
    - `/etc/cron.allow` (liste blanche), `/etc/cron.deny` (liste noire).
- **Secrets** : ne mets pas de secrets en clair dans la crontab ; utilise un fichier `.env` root-owned (`chmod 600`) sourcé par le script.
- **Permissions** : logs dans un répertoire accessible, rotation via `logrotate`.

---

## 11) Alternative moderne : **systemd timers** (quand c’est dispo)

Pour des besoins avancés (précision, timezone, non-overlap natif, dépendances), préfère parfois **systemd timers**.

Exemple “toutes les 10 minutes, sans chevauchement” :

`/etc/systemd/system/backup.service`

```
[Unit]
Description=Backup job

[Service]
Type=oneshot
ExecStart=/usr/local/bin/backup.sh

```

`/etc/systemd/system/backup.timer`

```
[Unit]
Description=Run backup every 10 minutes

[Timer]
OnBootSec=2m
OnUnitActiveSec=10m
Persistent=true

[Install]
WantedBy=timers.target

```

Activation :

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now backup.timer
systemctl list-timers | grep backup
journalctl -u backup.service -f

```

---

## 12) Mini-TP (rapides)

### TP1 — “Hello cron”

1. Script :

```bash
echo '#!/usr/bin/env bash
date "+%F %T" >> /tmp/hello-cron.log' | sudo tee /usr/local/bin/hello-cron.sh >/dev/null
sudo chmod +x /usr/local/bin/hello-cron.sh

```

1. Crontab :

```bash
(crontab -l; echo '* * * * * /usr/local/bin/hello-cron.sh') | crontab -
tail -f /tmp/hello-cron.log

```

### TP2 — “Job robuste”

- Script avec `set -euo pipefail`, chemins absolus, logs, `flock` :

```bash
sudo tee /usr/local/bin/robust-job.sh >/dev/null <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
exec 9>/var/lock/robust-job.lock
flock -n 9 || exit 0
/usr/bin/env echo "[$(date -Is)] run" >> /var/log/robust-job.log
# ... traitement ...
EOF
sudo chmod +x /usr/local/bin/robust-job.sh

```

- Crontab :

```bash
(crontab -l; echo '*/5 * * * * /usr/local/bin/robust-job.sh') | crontab -

```

---

## 13) Mémo express (copier-coller)

```bash
# Éditer / lister / supprimer crontab utilisateur
crontab -e
crontab -l
crontab -r

# Logs d’exécution (selon distro)
grep CRON /var/log/syslog || true
journalctl -u cron -f || journalctl -u crond -f

# Exemple de crontab (utilisateur)
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/bin
MAILTO=""
TZ=Europe/Paris
# m h dom mon dow  command
0 2 * * * /home/user/bin/backup.sh >> /var/log/backup.cron.log 2>&1
*/15 * * * * /usr/bin/flock -n /tmp/collect.lock /usr/local/bin/collect.sh

# Exemple dans /etc/crontab (6 champs : + user)
# m h dom mon dow user  command
0 3 * * * root /usr/local/sbin/rotate-logs.sh

```

---

### À retenir

- **Écris un script robuste** (shebang, `set -euo pipefail`, chemins absolus, logs).
- **Planifie** via `crontab -e` (ou `/etc/crontab` / `/etc/cron.d` pour le système).
- **Teste et observe** (`tail -f` des logs, `journalctl`, `grep CRON`).
- **Évite les chevauchements** (verrou `flock`) et les surprises d’environnement (`PATH`, `SHELL`, `TZ`).
- En cas de besoins avancés (précision, dépendances, DST), regarde les **timers systemd**.

Avec ça, tu as tout pour automatiser proprement tes tâches récurrentes sur Linux.

---
[← Module précédent](002_droits-linux.md)
---

---
[← Module précédent](002_droits-linux.md)
---

---
[← Module précédent](002_droits-linux.md)
---

---
[← Module précédent](002_droits-linux.md)
---

---
[← Module précédent](002_droits-linux.md)
---

---
[← Module précédent](002_droits-linux.md)
---

---
[← Module précédent](002_droits-linux.md)
---

---
[← Module précédent](002_droits-linux.md)
---

---
[← Module précédent](002_droits-linux.md)
---

---
[← Module précédent](002_droits-linux.md)
---
