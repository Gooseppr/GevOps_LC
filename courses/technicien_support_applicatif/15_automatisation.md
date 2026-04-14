---
layout: page
title: "Automatisation des tâches support"

course: technicien_support_applicatif
chapter_title: "Automatisation des tâches support"

chapter: 7
section: 1

tags: automatisation, scripting, bash, powershell, python, support, productivite
difficulty: intermediate
duration: 210
mermaid: false

status: "published"
prev_module: "/courses/technicien_support_applicatif/13_incidents_complexes.html"
prev_module_title: "Gestion des incidents complexes"
next_module: "/courses/technicien_support_applicatif/14_data_integrite.html"
next_module_title: "Gestion des données & intégrité"
---

# Automatisation des tâches support

## Objectifs pédagogiques

À l'issue de ce module, vous serez capable de :

- **Identifier** les tâches répétitives du quotidien support qui sont candidates à l'automatisation
- **Écrire** des scripts Bash et PowerShell pour automatiser des opérations courantes (rotation de logs, relance de service, collecte d'informations système)
- **Planifier** l'exécution automatique de scripts via cron (Linux) et le Planificateur de tâches (Windows)
- **Construire** un script de diagnostic réutilisable, paramétrable et lisible par un collègue
- **Éviter** les pièges classiques qui transforment un script "utile" en bombe à retardement en production

---

## Mise en situation

Vous êtes technicien support N2 sur une application métier de gestion RH. Chaque matin, votre première heure ressemble à ceci :

1. Se connecter sur le serveur applicatif, vérifier si le service est démarré
2. Regarder le fichier de log pour détecter des erreurs de la nuit
3. Vérifier que l'espace disque n'est pas saturé (ça s'est déjà produit, et ça a bloqué 300 utilisateurs)
4. Envoyer un récapitulatif par email à votre responsable

C'est répétitif, chronophage, et surtout : **vous pouvez l'oublier**. Un lundi de reprise après RTT, une urgence au téléphone dès 8h30 — et la vérification n'est pas faite.

Ce module vous apprend à confier cette routine à un script, et à récupérer cette heure pour des tâches à vraie valeur ajoutée.

---

## Contexte — Pourquoi automatiser en support ?

Le support applicatif génère une quantité importante de tâches structurées : même déclencheur, mêmes étapes, même résultat attendu. Ce sont exactement les tâches que les machines exécutent mieux que les humains — sans fatigue, sans oubli, à 3h du matin si besoin.

L'automatisation en support ne signifie pas "remplacer le technicien". Elle signifie **déplacer votre attention** des tâches mécaniques vers les situations qui demandent du jugement : analyser une erreur inconnue, interagir avec un utilisateur bloqué, prioriser des incidents simultanés.

Il y a aussi un argument de fiabilité : un script fait toujours la même chose. Un humain fatigué en fin de journée peut rater une ligne dans un log ou oublier une étape. Pour les vérifications critiques en production, la régularité mécanique du script est une qualité, pas une limitation.

**Deux langages couvrent la quasi-totalité des besoins support :**
- **Bash** sur Linux/macOS — natif, universel, rapide à écrire
- **PowerShell** sur Windows — puissant, intégré à l'écosystème Microsoft
- **Python** vient compléter les deux quand la logique devient complexe (parsing, appels API, traitement de données)

---

## Ce qu'est un script de support

🧠 Un script n'est pas un programme. C'est une séquence d'instructions système que vous auriez tapées manuellement dans un terminal, enregistrée dans un fichier et rendue exécutable. Pas de compilation, exécution ligne par ligne, accès direct aux commandes système.

Ce qui rend un script support efficace, c'est sa **structure** :

```
1. Initialisation (variables, paramètres)
2. Collecte d'informations
3. Analyse / conditions
4. Action (relance, nettoyage, notification)
5. Log de ce qui a été fait
```

Cette structure se retrouve dans 90 % des scripts que vous allez écrire ou lire. Gardez-la en tête — elle rend vos scripts lisibles par un collègue qui n'était pas là quand vous les avez écrits.

💡 Le piège du "script jetable" : on écrit vite, ça marche, on oublie de le documenter. Six mois plus tard, même vous ne savez plus ce qu'il fait. Les bonnes pratiques en fin de module sont là pour éviter exactement ça.

---

## Identifier ce qui mérite d'être automatisé

Avant d'écrire une seule ligne, posez-vous cette question simple : **est-ce que je ferais ça exactement pareil la prochaine fois ?**

Si oui, c'est automatisable. Si la réponse dépend du contexte, c'est peut-être mieux de garder la main.

Les catégories classiques en support applicatif se répartissent naturellement en quatre familles :

**Surveillance et détection** — vérifier qu'un service est actif, détecter des mots-clés dans les logs (`ERROR`, `OOM`, `Connection refused`), contrôler l'espace disque ou l'utilisation CPU.

**Maintenance préventive** — archiver ou supprimer les vieux fichiers de log, vider un répertoire temporaire avant qu'il sature, redémarrer un service selon un planning.

**Collecte d'informations** — générer un rapport d'état système, extraire les erreurs des dernières 24h et les envoyer par mail, créer un snapshot des processus actifs au moment d'un incident.

**Actions correctives simples** — relancer automatiquement un service tombé, restaurer un fichier de configuration depuis une sauvegarde connue.

⚠️ Ne pas automatiser les actions irréversibles sans filet de sécurité. Supprimer des fichiers, modifier une base de données, déployer en production — ces actions doivent avoir un mécanisme de confirmation ou un mode "simulation" (dry run) avant d'agir réellement.

---

## Bash — Scripts Linux pour le support

### Structure minimale d'un script Bash

```bash
#!/usr/bin/env bash
# ============================================================
# nom        : check_service.sh
# description: Vérifie qu'un service est actif, le relance sinon
# usage      : ./check_service.sh <NOM_DU_SERVICE>
# auteur     : <VOTRE_NOM>
# date       : <DATE>
# ============================================================

set -euo pipefail  # Arrêt sur erreur, variables non définies, pipes échoués

SERVICE="${1:?Usage: $0 <nom_du_service>}"  # Paramètre obligatoire avec message d'erreur
LOG_FILE="/var/log/support/check_service.log"

# Fonction de logging — horodatage automatique
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

# Vérification de l'état du service
if systemctl is-active --quiet "$SERVICE"; then
  log "OK — $SERVICE est actif"
else
  log "ALERTE — $SERVICE inactif, tentative de relance..."
  systemctl start "$SERVICE"

  # Confirmation que la relance a fonctionné
  if systemctl is-active --quiet "$SERVICE"; then
    log "OK — $SERVICE redémarré avec succès"
  else
    log "ECHEC — Impossible de redémarrer $SERVICE — intervention manuelle requise"
    exit 1  # Code de sortie non-zéro = échec (important pour les orchestrateurs)
  fi
fi
```

🧠 `set -euo pipefail` en ligne 8 est une ligne de sécurité fondamentale. Sans elle, un script Bash continue d'exécuter les lignes suivantes même si une commande échoue. Avec `set -e` : arrêt immédiat sur erreur. Avec `set -u` : erreur si une variable n'est pas définie. Avec `pipefail` : une commande en échec dans un pipe (`cmd1 | cmd2`) fait échouer le tout. Ces trois options ensemble éliminent les erreurs silencieuses les plus dangereuses.

### Script de diagnostic — collecte d'informations système

Ce genre de script est précieux au moment d'un incident : au lieu de courir chercher les informations une par une, vous lancez le script et vous avez un rapport complet en 10 secondes.

```bash
#!/usr/bin/env bash
# diagnostic_serveur.sh — Rapport d'état rapide pour support N2

RAPPORT="/tmp/diag_$(hostname)_$(date '+%Y%m%d_%H%M%S').txt"

{
  echo "===== DIAGNOSTIC SERVEUR : $(hostname) ====="
  echo "Date : $(date)"
  echo ""

  echo "--- ESPACE DISQUE ---"
  df -h | grep -v tmpfs  # Affiche les systèmes de fichiers, ignore les tmpfs

  echo ""
  echo "--- MÉMOIRE ---"
  free -h  # Mémoire RAM et swap en format lisible

  echo ""
  echo "--- CHARGE CPU (dernières minutes) ---"
  uptime  # Load average sur 1, 5, 15 minutes

  echo ""
  echo "--- SERVICES CRITIQUES ---"
  for SERVICE in nginx postgresql <NOM_APP_METIER>; do
    STATUS=$(systemctl is-active "$SERVICE" 2>/dev/null || echo "introuvable")
    echo "  $SERVICE : $STATUS"
  done

  echo ""
  echo "--- 20 DERNIÈRES ERREURS APPLICATIVES ---"
  grep -i "error\|exception\|critical" /var/log/<APP>/<LOGFILE>.log 2>/dev/null \
    | tail -20 \
    || echo "  Aucune erreur trouvée ou log inaccessible"

} | tee "$RAPPORT"  # Affiche ET écrit dans le fichier

echo ""
echo "Rapport sauvegardé : $RAPPORT"
```

💡 Le bloc `{ ... } | tee "$RAPPORT"` est une astuce simple mais puissante : tout ce qui s'exécute dans les accolades est capturé et redirigé vers `tee`, qui affiche dans le terminal ET écrit dans le fichier simultanément. Pas besoin de rediriger chaque ligne individuellement.

### Rotation de logs — éviter la saturation disque

Un des classiques du support : le disque sature parce qu'un fichier de log grossit sans jamais être nettoyé.

```bash
#!/usr/bin/env bash
# rotation_logs.sh — Archivage et nettoyage des logs applicatifs

LOG_DIR="/var/log/<NOM_APPLICATION>"  # Répertoire des logs à gérer
ARCHIVE_DIR="/data/archives/logs"     # Destination des archives
RETENTION_JOURS=30                    # Supprimer les archives plus vieilles que N jours

mkdir -p "$ARCHIVE_DIR"

# Compresser les logs de plus de 7 jours
find "$LOG_DIR" -name "*.log" -mtime +7 -not -name "*.gz" | while read -r fichier; do
  gzip "$fichier"  # Compression gzip — réduit souvent la taille de 80-90%
  mv "${fichier}.gz" "$ARCHIVE_DIR/"
  echo "Archivé : $fichier"
done

# Supprimer les archives trop anciennes
find "$ARCHIVE_DIR" -name "*.gz" -mtime +"$RETENTION_JOURS" -delete
echo "Nettoyage terminé — archives de plus de $RETENTION_JOURS jours supprimées"
```

⚠️ `find ... -delete` est irréversible. Avant de déployer ce script en production, testez-le en remplaçant `-delete` par `-print` pour voir ce qui serait supprimé, sans rien effacer.

---

## PowerShell — L'équivalent Windows pour le support

PowerShell n'est pas juste "Bash pour Windows". C'est un langage orienté objet qui manipule des objets .NET, pas du texte. C'est à la fois sa force (données structurées, intégration Windows native) et son piège pour ceux qui viennent de Bash — le parsing de texte fonctionne très différemment.

### Vérification et relance de service Windows

```powershell
# check_service_windows.ps1
# Usage : .\check_service_windows.ps1 -ServiceName "NomDuService"

param(
  [Parameter(Mandatory=$true)]
  [string]$ServiceName  # Paramètre obligatoire déclaré proprement
)

$LogFile = "C:\Logs\Support\check_service.log"

# Fonction de log avec horodatage
function Write-Log {
  param([string]$Message)
  $entry = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') — $Message"
  Add-Content -Path $LogFile -Value $entry  # Append dans le fichier
  Write-Host $entry                          # Affichage console simultané
}

# Récupération de l'objet service
$service = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue

if ($null -eq $service) {
  Write-Log "ERREUR — Service '$ServiceName' introuvable sur ce serveur"
  exit 1
}

if ($service.Status -eq 'Running') {
  Write-Log "OK — $ServiceName est en cours d'exécution"
} else {
  Write-Log "ALERTE — $ServiceName est '$($service.Status)', tentative de démarrage..."

  try {
    Start-Service -Name $ServiceName -ErrorAction Stop  # -ErrorAction Stop → déclenche catch
    Write-Log "OK — $ServiceName démarré avec succès"
  } catch {
    Write-Log "ECHEC — Impossible de démarrer $ServiceName : $($_.Exception.Message)"
    exit 1
  }
}
```

🧠 En PowerShell, `Get-Service` renvoie un **objet** avec des propriétés (`.Status`, `.Name`, `.DisplayName`), pas une ligne de texte. C'est pourquoi on écrit `$service.Status -eq 'Running'` et non un grep sur du texte. Cette logique objet permet de chaîner des opérations sans parser du texte — c'est plus fiable et moins fragile que la manipulation de chaînes.

### Rapport d'espace disque avec alerte par seuil

```powershell
# check_disk_space.ps1 — Alerte si espace libre sous un seuil

param(
  [int]$SeuilPourcentage = 15  # Alerte si espace libre < 15% (valeur par défaut)
)

Get-PSDrive -PSProvider FileSystem | Where-Object { $_.Used -gt 0 } | ForEach-Object {

  $total    = $_.Used + $_.Free
  $librePct = [math]::Round(($_.Free / $total) * 100, 1)  # Arrondi à 1 décimale
  $libreGo  = [math]::Round($_.Free / 1GB, 2)

  $statut = if ($librePct -lt $SeuilPourcentage) { "⚠️  ALERTE" } else { "✅ OK" }

  Write-Host "$statut — Lecteur $($_.Name): : $libreGo Go libres ($librePct%)"
}
```

💡 `Where-Object { $_.Used -gt 0 }` filtre les lecteurs sans données (CD-ROM vide, réseau non monté) pour éviter une division par zéro sur le calcul de pourcentage. Toujours se méfier des cas limites dans les scripts de surveillance — c'est souvent là que les scripts explosent en production.

---

## Construction progressive — Du prototype à la version production

Voici l'évolution d'un script Bash de détection d'erreurs dans les logs. Voir la progression de V1 à V3 est plus instructif que de présenter directement la version finale.

### V1 — Ça fait le job, mais c'est fragile

```bash
grep "ERROR" /var/log/app/app.log | tail -50
```

Ça marche. Mais : chemin codé en dur, pas de date, pas de contexte, pas d'archivage du résultat.

### V2 — Paramétrable et lisible

```bash
#!/usr/bin/env bash
LOG_FILE="${1:-/var/log/app/app.log}"   # Paramètre optionnel avec valeur par défaut
PATTERN="${2:-ERROR}"                    # Mot-clé recherché, "ERROR" par défaut
LIGNES="${3:-50}"                        # Nombre de lignes à afficher

echo "=== Recherche de '$PATTERN' dans $LOG_FILE (dernières $LIGNES occurrences) ==="
echo "Date d'analyse : $(date)"
echo ""

if [[ ! -f "$LOG_FILE" ]]; then
  echo "Fichier introuvable : $LOG_FILE"
  exit 1
fi

grep -i "$PATTERN" "$LOG_FILE" | tail -"$LIGNES"
```

### V3 — Production-ready

```bash
#!/usr/bin/env bash
# analyse_logs.sh — Détection d'erreurs avec rapport horodaté et envoi mail optionnel
# Usage : ./analyse_logs.sh [fichier_log] [pattern] [nb_lignes] [email_destinataire]

set -euo pipefail

LOG_FILE="${1:-/var/log/<APP>/<APPNAME>.log}"
PATTERN="${2:-ERROR}"
LIGNES="${3:-50}"
EMAIL="${4:-}"  # Optionnel — si vide, pas d'envoi mail

RAPPORT="/tmp/rapport_logs_$(date '+%Y%m%d_%H%M%S').txt"

# Vérifications préalables
[[ -f "$LOG_FILE" ]] || { echo "Fichier introuvable : $LOG_FILE"; exit 1; }
command -v mail >/dev/null 2>&1 || { [[ -z "$EMAIL" ]] || echo "WARN : mail non disponible, envoi ignoré"; }

{
  echo "=== RAPPORT D'ANALYSE DE LOGS ==="
  echo "Fichier  : $LOG_FILE"
  echo "Filtre   : $PATTERN"
  echo "Généré   : $(date)"
  echo "Serveur  : $(hostname)"
  echo ""

  NB_OCCURRENCES=$(grep -ci "$PATTERN" "$LOG_FILE" || echo 0)
  echo "Occurrences totales de '$PATTERN' : $NB_OCCURRENCES"
  echo ""

  echo "--- Dernières $LIGNES occurrences ---"
  grep -i "$PATTERN" "$LOG_FILE" | tail -"$LIGNES" || echo "Aucune occurrence trouvée"

} | tee "$RAPPORT"

# Envoi mail si destinataire fourni et commande mail disponible
if [[ -n "$EMAIL" ]] && command -v mail >/dev/null 2>&1; then
  mail -s "[Support] Rapport logs $(hostname) — $(date '+%d/%m/%Y')" "$EMAIL" < "$RAPPORT"
  echo "Rapport envoyé à : $EMAIL"
fi

echo "Rapport local : $RAPPORT"
```

Ce que la V3 apporte que la V1 n'avait pas : paramétrage flexible, vérifications défensives, rapport persistant, intégration mail, lisibilité pour un collègue qui prend le relais.

---

## Planification — Faire tourner les scripts automatiquement

Un script qu'on lance à la main reste une tâche manuelle. Pour que l'automatisation soit réelle, les scripts doivent s'exécuter seuls.

### Cron — Linux

`cron` est le planificateur natif Linux. Chaque utilisateur a sa propre table de planification (`crontab`).

```bash
crontab -e  # Ouvre l'éditeur de crontab pour l'utilisateur courant
```

Syntaxe d'une ligne cron :

```
┌──────── minute (0-59)
│  ┌───── heure (0-23)
│  │  ┌── jour du mois (1-31)
│  │  │  ┌─ mois (1-12)
│  │  │  │  ┌ jour de la semaine (0=dimanche, 7=dimanche aussi)
│  │  │  │  │
*  *  *  *  *  commande à exécuter
```

```bash
# Vérification du service toutes les 5 minutes
*/5 * * * * /opt/scripts/check_service.sh nginx >> /var/log/support/cron.log 2>&1

# Diagnostic quotidien à 7h00 du lundi au vendredi
0 7 * * 1-5 /opt/scripts/diagnostic_serveur.sh

# Rotation des logs chaque dimanche à 2h du matin
0 2 * * 0 /opt/scripts/rotation_logs.sh

# Analyse des erreurs et envoi mail à 8h chaque jour
0 8 * * * /opt/scripts/analyse_logs.sh /var/log/<APP>/<APP>.log ERROR 100 <EMAIL>
```

💡 Ajoutez toujours `>> /chemin/cron.log 2>&1` à la fin de vos lignes cron. Sans ça, les erreurs partent dans le néant — ou dans la boîte mail root que personne ne lit. Avec ça, vous pouvez déboguer ce qui se passe vraiment.

⚠️ Cron n'hérite pas de votre environnement shell. Les variables `$PATH`, `$HOME` et autres ne sont pas chargées. Utilisez toujours des chemins absolus dans vos scripts cron (`/usr/bin/python3` et non `python3`).

### Planificateur de tâches Windows

En PowerShell, on peut créer une tâche planifiée sans ouvrir l'interface graphique :

```powershell
# Planifier check_service_windows.ps1 toutes les 10 minutes

$action = New-ScheduledTaskAction `
  -Execute "powershell.exe" `
  -Argument "-NonInteractive -File C:\Scripts\check_service_windows.ps1 -ServiceName W3SVC"

$trigger = New-ScheduledTaskTrigger `
  -RepetitionInterval (New-TimeSpan -Minutes 10) `
  -Once `
  -At (Get-Date)

$settings = New-ScheduledTaskSettingsSet `
  -ExecutionTimeLimit (New-TimeSpan -Minutes 5) `
  -RunOnlyIfNetworkAvailable

Register-ScheduledTask `
  -TaskName "SupportCheck_W3SVC" `
  -Action $action `
  -Trigger $trigger `
  -Settings $settings `
  -RunLevel Highest `
  -Force
```

---

## Cas réel en entreprise

**Contexte** : équipe support N2 de 4 personnes, application de gestion de paie hébergée sur 3 serveurs Linux. Chaque matin, deux techniciens passaient 45 minutes à vérifier manuellement l'état des services, l'espace disque et les erreurs de la nuit. En cas de weekend ou de pont, les vérifications étaient parfois omises.

**Problème déclencheur** : un vendredi soir, un job de génération de bulletins de paie a rempli le disque `/var/log` à 100%. L'application a planté à 6h du matin le lundi suivant, bloquant 800 utilisateurs pendant 2h30, le temps de diagnostiquer et libérer de l'espace.

**Solution mise en place** : un script de diagnostic (`diagnostic_serveur.sh`) planifié toutes les heures en cron, avec envoi d'alerte mail si l'espace disque passe sous 20%. Une rotation de logs automatique programmée chaque nuit à 2h. Un script de relance de service déclenché toutes les 5 minutes, avec log horodaté de chaque vérification.

**Résultats après 3 mois** :
- Temps de vérification matinale réduit de 45 minutes à 5 minutes (lecture des rapports)
- Zéro incident lié à la saturation disque depuis le déploiement
- Deux relances de service automatiques détectées et exécutées hors heures ouvrées, sans intervention humaine
- L'équipe a pu consacrer le temps récupéré à documenter les procédures d'escalade

---

## Erreurs fréquentes

**Le script fonctionne en manuel mais échoue en cron**

Symptôme : vous lancez le script à la main, tout va bien. La tâche cron ne fait rien ou produit une erreur silencieuse. Cause : cron utilise un environnement minimal — commandes introuvables (`python3`, `jq`, scripts personnalisés) car `$PATH` ne contient pas `/usr/local/bin` ou vos répertoires customisés. Correction : en début de script, définir explicitement le PATH : `export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin`. Et rediriger les erreurs cron vers un fichier log.

---

**Oublier de rendre le script exécutable**

Symptôme : `bash: ./monscript.sh: Permission denied`. Cause : le fichier existe mais n'a pas le bit d'exécution. Correction : `chmod +x ./monscript.sh` — à faire une fois après création. Sur Linux, un fichier créé n'est jamais exécutable par défaut.

---

**Script qui tourne en boucle ou qui ne s'arrête jamais**

Symptôme : charge CPU qui monte, processus `sh` ou `bash` qui s'accumulent dans `ps aux`. Cause : script planifié toutes les X minutes, mais dont l'exécution dure plus de X minutes (log volumineux, réseau lent, attente infinie). Correction : ajouter un timeout sur les commandes potentiellement longues (`timeout 30 commande`), et vérifier qu'une instance précédente ne tourne pas déjà (`flock` sur Linux).

---

**`set -e` qui tue le script sur une commande "normale"**

Symptôme : le script s'arrête sans raison apparente sur un `grep` ou un `find`. Cause : `grep` retourne un code de sortie 1 quand il ne trouve rien — ce qui avec `set -e` provoque l'arrêt du script. Ce n'est pas une erreur, c'est juste "aucun résultat". Correction : pour les commandes dont le code de sortie non-zéro est attendu, ajouter `|| true` : `grep "PATTERN" fichier.log || true`.

---

**Permissions insuffisantes pour relancer un service**

Symptôme : `Failed to start nginx.service: Interactive authentication required` ou `Access is denied` sous Windows. Cause : le script s'exécute sous un compte utilisateur sans droits d'administration des services. Correction : sur Linux, utiliser `sudo` avec une règle `sudoers` limitée au service concerné (`NOPASSWD: /bin/systemctl start nginx`). Sur Windows, configurer la tâche planifiée avec un compte de service dédié — jamais avec un compte utilisateur nominatif.

---

## Bonnes pratiques

**Toujours loguer ce que le script fait.** Pas pour vous aujourd'hui — pour vous dans 3 mois, ou pour votre collègue la nuit quand quelque chose cloche. Un log avec horodatage, nom de script et action effectuée permet de reconstruire ce qui s'est passé. Sans log, le script est une boîte noire.

**Tester avec un mode "dry run" avant de déployer.** Avant toute action destructive (suppression, modification de config, relance), ajoutez un paramètre `--dry-run` qui affiche ce que le script ferait, sans le faire. Remplacez `rm "$fichier"` par `echo "[DRY RUN] Suppression : $fichier"` en mode simulation.

**Un script = une responsabilité.** Ne combinez pas la vérification de service, la rotation de logs ET l'envoi de rapport dans un seul script tentaculaire. Écrivez des scripts spécialisés que vous pouvez combiner, tester et déboguer séparément.

**Versionnez vos scripts.** Même dans un simple dépôt Git. Quand un script en production casse quelque chose, avoir l'historique des modifications est souvent ce qui permet de comprendre pourquoi — et de revenir en arrière en moins de deux minutes.

**Documentez l'en-tête, pas le corps.** L'en-tête doit expliquer ce que fait le script, comment l'appeler et ses prérequis. Dans le corps, commentez le "pourquoi" (décisions non évidentes) plutôt que le "quoi" — on voit déjà la commande.

**Ne stockez jamais de mot de passe en clair dans un script.** Si votre script doit s'authentifier (base de données, API, mail SMTP), utilisez des variables d'environnement chargées depuis un fichier `.env` hors dépôt Git, ou un gestionnaire de secrets. Un script avec un mot de passe committé dans Git est un incident de sécurité qui attend de se produire.

**Testez vos scripts en dehors de la production.** Lancez-les une première fois à la main sur un environnement de recette ou sur des données de test. Un script de rotation de logs qui supprime le mauvais répertoire en production n'est pas théorique — ça arrive.

---

## Résumé

L'automatisation support, c'est transformer une heure de routine quotidienne en 10 secondes d'exécution — et récupérer cette heure pour les situations qui demandent votre jugement. Bash et PowerShell couvrent l'essentiel des besoins : vérification de services, analyse de logs, rotation de fichiers, alertes. `set -euo pipefail` et la gestion explicite des erreurs sont ce qui sépare un script fragile d'un script fiable. La planification via cron ou le Planificateur de tâches Windows transforme un script utile en automatisation réelle. Commencez petit : un script de vérification, une ligne cron. Vous verrez rapidement ce que ça change dans votre quotidien.

| Concept | Ce qu'il
