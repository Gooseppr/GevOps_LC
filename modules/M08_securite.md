---
layout: page
title: Sécurité & Attaques
sujet: Administration, Sécurité
type: module
jour: 08
ordre: 2
tags: security, network, ssh
---

# Introduction aux attaques informatiques

## 1) Pourquoi comprendre les attaques ?

La **cybersécurité** ne consiste pas seulement à se protéger, mais aussi à **comprendre comment on peut être attaqué**.

En observant un système sous l’angle d’un **attaquant**, on apprend à détecter les vulnérabilités avant qu’elles ne soient exploitées.

Un DevOps doit adopter une posture **DevSecOps**, c’est-à-dire intégrer la sécurité **dans chaque étape du cycle de vie** :
- développement du code,
- configuration des serveurs,
- supervision des systèmes,
- et gestion des incidents.

> Comprendre les techniques d’attaque, c’est renforcer la capacité de défense.
> 

---

## 2) Les périmètres concernés

La cybersécurité touche l’ensemble de l’écosystème informatique :

| Périmètre | Exemples d’éléments concernés |
| --- | --- |
| Réseaux | Routeurs, pare-feux, ports, protocoles |
| Systèmes | Linux, Windows, configurations SSH |
| Logiciels & services | Serveurs web, bases de données, API |
| Humains | Erreurs, phishing, mots de passe faibles |

Un DevOps doit donc être **polyvalent**, comprendre le fonctionnement global d’un système et être capable d’identifier les failles à tous les niveaux.

---

## 3) La phase de reconnaissance

Avant d’attaquer, un pirate commence par **collecter des informations**.

Cette phase de reconnaissance permet d’identifier les points faibles d’un système.

### Objectifs

- Identifier les **adresses IP** et les **ports ouverts**
- Découvrir les **services exposés** (HTTP, SSH, FTP…)
- Connaître la **version** des logiciels utilisés
- Déterminer le **système d’exploitation** cible

### Outils utilisés

- `ping` : vérifier si la machine répond
- `nmap` : détecter les ports ouverts et versions de service
- `traceroute` : identifier le chemin réseau
- `curl -I` : afficher les en-têtes HTTP d’un serveur
- `whois` : obtenir des informations sur un domaine
- `Wireshark` : analyser le trafic réseau

Ces outils sont légitimes pour un administrateur, mais deviennent dangereux dans de mauvaises mains.

Un simple en-tête HTTP peut révéler :

```
Server: nginx/1.18.0 (Ubuntu)

```

➡️ L’attaquant sait quelle version viser.

---

## 4) Les principales attaques à connaître

| Type d’attaque | Description | Exemple concret | Mesure préventive |
| --- | --- | --- | --- |
| Ingénierie sociale | Manipulation humaine pour obtenir des infos | Mail de phishing, faux support technique | Sensibilisation, MFA |
| Force brute | Tentatives multiples de connexion | Essais répétés de mots de passe SSH | Limiter les tentatives, Fail2ban |
| DoS / DDoS | Saturation d’un service | Bombardement de requêtes HTTP | Pare-feu, rate limiting |
| Man-in-the-Middle | Interception des échanges réseau | Faux point Wi-Fi public | HTTPS, certificats valides |
| Injection de code | Exploitation d’une faille applicative | SQL Injection, XSS | Validation des entrées, pare-feu applicatif |
| IP Spoofing | Fausse adresse IP source | Détournement de paquets | Filtrage réseau, RPF activé |

Les attaques exploitent souvent des faiblesses simples :

versions non mises à jour, mauvaises permissions, ou erreur humaine.

---

## 5) Les vulnérabilités et le rôle des CVE

Les **CVE** (*Common Vulnerabilities and Exposures*) répertorient les failles connues des logiciels et systèmes.

Chaque CVE correspond à une faille documentée avec son niveau de gravité (score CVSS).

Exemples :

- **CVE-2022-0847 (Dirty Pipe)** : faille critique du noyau Linux.
- **CVE-2021-41773 (Apache)** : traversée de répertoire via requêtes HTTP.

Un DevSecOps doit surveiller régulièrement ces vulnérabilités à l’aide de :

- https://nvd.nist.gov
- bulletins de sécurité Debian, Ubuntu, RedHat
- scans automatisés comme **OpenVAS**, **Nessus**, ou **Trivy**

---

## 6) Les réflexes essentiels pour se protéger

### 1. Réduire la surface d’attaque

- Fermer les ports inutiles :
    
    ```bash
    sudo ss -ltnp
    
    ```
    
- Désactiver les services non utilisés :
    
    ```bash
    sudo systemctl disable nom_du_service
    
    ```
    
- Masquer les versions dans Nginx, Apache, SSH

### 2. Tenir les systèmes à jour

- Planifier les mises à jour :
    
    ```bash
    sudo apt update && sudo apt upgrade -y
    
    ```
    
- Tester avant déploiement en production

### 3. Surveiller et alerter

- Consulter les logs système :
    
    ```bash
    sudo tail -f /var/log/auth.log
    
    ```
    
- Installer **Fail2ban** ou un IDS (ex : **Wazuh**, **Suricata**)
- Mettre en place un tableau de bord (ELK, Grafana)

### 4. Automatiser la sécurité

- Intégrer les scans de vulnérabilités dans la CI/CD
- Ajouter des tests de sécurité dans les pipelines
- Auditer régulièrement les configurations SSH, Nginx, Docker…

---

## 7) Le hacking éthique et le rôle du DevSecOps

Le **hacking éthique** consiste à identifier les failles **dans un cadre légal** et contrôlé, afin d’améliorer la sécurité.

Un **DevSecOps** combine les compétences :

- du développeur (code propre, dépendances sécurisées),
- de l’administrateur système (durcissement, configuration fine),
- et du pentester (test de vulnérabilités internes).

Ses missions :

1. Prévoir les menaces (veille et analyse CVE)
2. Tester les systèmes avant mise en production
3. Surveiller les comportements anormaux
4. Réagir rapidement en cas d’incident

> Penser sécurité dès le départ coûte moins cher que réparer après une attaque.
> 

---

## 8) Conclusion

La sécurité informatique repose sur trois piliers :

1. **La connaissance** des menaces et des outils utilisés par les attaquants,
2. **La vigilance continue** (mises à jour, monitoring, audits),
3. **La responsabilité collective** : la sécurité ne dépend pas que de la technique, mais aussi des comportements humains.

> Un bon DevOps anticipe.
> 
> Un excellent DevSecOps détecte, corrige et automatise la défense.



<!-- snippet
id: secu_reconnaissance_nmap
type: concept
tech: linux
level: beginner
importance: high
format: knowledge
tags: securite,reconnaissance,nmap,pentest
title: Phase de reconnaissance — outils et objectifs
context: comprendre ce qu'un attaquant collecte avant d'exploiter un système
content: La reconnaissance cartographie la cible : IP, ports ouverts, versions de services, OS. Outils : `ping`, `nmap`, `traceroute`, `curl -I`, `whois`. Un en-tête `Server: nginx/1.18.0` suffit à cibler des CVE.
-->

<!-- snippet
id: secu_reduire_surface_attaque
type: command
tech: linux
level: beginner
importance: high
format: knowledge
tags: securite,surface-attaque,ports,services
title: Lister les ports ouverts pour réduire la surface d'attaque
context: identifier les services exposés inutilement sur un serveur
command: sudo ss -ltnp
description: Affiche tous les ports TCP en écoute avec le processus associé. Chaque port ouvert est un point d'entrée potentiel. Désactiver les services inutiles avec `sudo systemctl disable nom_service`.
-->

<!-- snippet
id: secu_auth_log
type: command
tech: linux
level: beginner
importance: high
format: knowledge
tags: securite,logs,auth,surveillance,bruteforce
title: Surveiller les tentatives de connexion SSH
context: détecter des attaques par force brute ou des connexions anormales
command: sudo tail -f /var/log/auth.log
description: Affiche en temps réel les tentatives de connexion SSH, les succès et les échecs. Permet de détecter des attaques par force brute ou des accès suspects. Sur Ubuntu/Debian récents, utiliser aussi `sudo journalctl -u ssh -e`.
-->

<!-- snippet
id: secu_maj_systeme
type: command
tech: linux
level: beginner
importance: high
format: knowledge
tags: securite,mises-a-jour,cve,patches
title: Mettre à jour le système pour corriger les CVE
context: appliquer les correctifs de sécurité sur un serveur Debian/Ubuntu
command: sudo apt update && sudo apt upgrade -y
description: Met à jour la liste des paquets puis installe les correctifs disponibles. À planifier régulièrement via cron ou unattended-upgrades pour fermer les CVE connues.
-->

<!-- snippet
id: secu_fail2ban_install
type: tip
tech: linux
level: intermediate
importance: high
format: knowledge
tags: securite,fail2ban,bruteforce,ssh,ids
title: Installer Fail2ban pour bloquer les attaques par force brute
context: protéger un serveur SSH contre les tentatives de connexion répétées
content: Fail2ban surveille `/var/log/auth.log` et bloque les IP après un nombre configurable d'échecs. Installer avec `sudo apt install -y fail2ban`.
-->

<!-- snippet
id: secu_fail2ban_install_b
type: tip
tech: linux
level: intermediate
importance: high
format: knowledge
tags: securite,fail2ban,bruteforce,ssh,ids
title: Configurer la jail SSH dans Fail2ban
context: activer et régler la protection SSH dans jail.local
content: Dans `/etc/fail2ban/jail.local` : activer `[sshd]`, définir `maxretry = 5` et `bantime = 3600`. Vérifier les bans avec `sudo fail2ban-client status sshd`.
-->

<!-- snippet
id: secu_cve_concept
type: concept
tech: linux
level: beginner
importance: medium
format: knowledge
tags: securite,cve,vulnerabilite,cvss,veille
title: CVE — répertoire des vulnérabilités connues
context: comprendre comment les failles sont référencées et priorisées
content: Les CVE identifient chaque faille connue avec un score CVSS de gravité (0–10). Sources de veille : nvd.nist.gov, bulletins Debian/Ubuntu, outils de scan (OpenVAS, Nessus, Trivy).
-->

<!-- snippet
id: secu_cve_concept_b
type: concept
tech: linux
level: beginner
importance: medium
format: knowledge
tags: securite,cve,vulnerabilite,cvss,veille
title: Surveiller les CVE pour patcher rapidement
context: comprendre le rôle de la veille CVE en DevSecOps
content: Un DevSecOps surveille les CVE affectant ses composants (noyau, services, dépendances) pour appliquer les correctifs avant qu'une exploitation ne soit possible.
-->

<!-- snippet
id: secu_devsecops_concept
type: concept
tech: linux
level: beginner
importance: medium
format: knowledge
tags: securite,devsecops,posture,defense
title: Posture DevSecOps — sécurité intégrée au cycle de vie
context: comprendre le rôle de la sécurité dans une équipe DevOps
content: Le DevSecOps intègre la sécurité à chaque étape : code (dépendances vérifiées), configuration (durcissement SSH/Nginx/Docker), supervision (logs, IDS), gestion des incidents.
-->

<!-- snippet
id: secu_devsecops_concept_b
type: concept
tech: linux
level: beginner
importance: medium
format: knowledge
tags: securite,devsecops,posture,defense
title: DevSecOps — missions clés
context: connaître les actions concrètes d'un profil DevSecOps
content: Missions DevSecOps : veille CVE, tests de pénétration internes, surveillance des comportements anormaux, automatisation des scans dans la CI/CD. Prévenir coûte moins cher que réparer.
-->

<!-- snippet
id: secu_egress_filtering
type: command
tech: linux
level: intermediate
importance: medium
format: knowledge
tags: securite,egress,ufw,exfiltration,defense
title: Bloquer les connexions sortantes suspectes (egress)
context: empêcher l'exfiltration de données depuis un serveur compromis
command: sudo ufw deny out to IP_ATTAQUANT port 1234 proto tcp
description: Bloque les connexions TCP sortantes vers une IP/port suspecte. Limiter l'exfiltration même après compromission. Détecter les connexions anormales avec `ss -tunp | grep ESTAB`.
-->

<!-- snippet
id: secu_masquer_version_nginx
type: tip
tech: nginx
level: intermediate
importance: medium
format: knowledge
tags: securite,nginx,banniere,version,hardening
title: Masquer la version de Nginx pour réduire la reconnaissance
context: limiter les informations exposées dans les en-têtes HTTP
content: Par défaut, Nginx expose sa version dans les en-têtes (`Server: nginx/1.18.0`) et les pages d'erreur. Ajouter `server_tokens off;` dans le bloc `http {}` de /etc/nginx/nginx.conf pour masquer la version. Recharger avec `sudo nginx -t && sudo systemctl reload nginx`. Cela ne supprime pas les vulnérabilités mais ralentit la reconnaissance ciblée.
-->

---
[← Module précédent](M08_serveur-SSH.md) | [Module suivant →](M08_pratique-SSH-NGINX.md)
---
