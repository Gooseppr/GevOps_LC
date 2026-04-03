---
layout: page
title: Les noms de domaine
sujet: Hosting & Cloud
type: module
jour: 33
ordre: 1
tags: dns, certificat, devops, domaine, letsencrypt, http, https
---

## 1. Objectifs du cours 🎯

À la fin, tu dois être à l’aise pour :

- Expliquer clairement **ce qu’est un nom de domaine** et pourquoi on en a besoin.
- Comprendre **comment fonctionne le DNS** (résolution, cache, propagation, hiérarchie).
- Savoir **ce qu’est un registrar** et ce qui se passe quand tu “achètes” un domaine.
- Lire et configurer une **zone DNS** (A, AAAA, CNAME, MX, TXT, NS, etc.).
- Comprendre les rôles de **serveur DNS autoritatif** et **secondaire**.
- Utiliser `dig` et `nslookup` pour **diagnostiquer** les problèmes DNS.
- Comprendre et installer un **certificat SSL/TLS** (Let’s Encrypt, Certbot).

---

## 2. Contexte : IP vs noms de domaine 🌐

### 2.1 Limite des adresses IP

Une **adresse IP** (ex. `203.0.113.45`) identifie une machine sur le réseau.

Problèmes :

- **Difficile à retenir** : impossible de mémoriser des dizaines d’IP.
- **Pas parlant** : `203.0.113.45` ne dit pas si c’est un site web, un serveur mail, une API, etc.
- **Changeant** : l’adresse d’un serveur peut changer (migration, scaling…).

D’où l’idée d’un système qui permette aux humains de retenir un **nom**, et aux machines de manipuler des **IP** : c’est le rôle des **noms de domaine** et du **DNS**.

### 2.2 Qu’est-ce qu’une adresse IP ? Et comment sont-elles attribuées ?

Une **adresse IP** (Internet Protocol) est un identifiant numérique unique sur un réseau :

- **IPv4** : 32 bits, ex. `93.184.216.34`
- **IPv6** : 128 bits, ex. `2001:db8::1`

Attribution (hiérarchique) :

| Niveau | Rôle |
| --- | --- |
| **IANA** | Gère l’espace global d’adresses IP |
| **RIR** (ex. RIPE, ARIN) | Reçoivent de gros blocs d’IP par région |
| **FAI / Hébergeurs / Entreprises** | Reçoivent des sous-blocs, les attribuent aux clients/serveurs |
| **Clients / serveurs** | Reçoivent des IP fixes ou dynamiques |

👉 Une IP n’est donc **pas choisie au hasard** : elle vient d’un bloc d’adresses attribué par cette chaîne d’autorités.

---

## 3. Un peu d’historique (très rapide) 📜

- Au début d’ARPANET : un simple fichier `hosts.txt` partagé listait “nom → IP”.
- Quand le réseau a grossi, ce modèle ne tenait plus.
- 1983 : création du **DNS** (Domain Name System), base de données **hiérarchique et distribuée**.
- Les premières extensions : `.com` (commercial), `.org`, `.net`, puis les **extensions pays** (`.fr`, `.de`, `.uk`, etc.).
- Aujourd’hui, on a des centaines de TLD : `.io`, `.academy`, `.dev`, `.cloud`…

---

## 4. Qu’est-ce qu’un nom de domaine ? 🏷️

Un **nom de domaine** est une **adresse lisible** qui sert d’alias à une adresse IP.

👉 Au lieu de retenir `172.217.20.46`, tu tapes `www.google.com`.

Analogie :

Tu ne retiens pas l’**adresse complète** de ton ami, tu retiens **son nom**.

Le **DNS** joue le rôle de l’annuaire qui, à partir du nom, retrouve l’adresse.

Un bon nom de domaine :

- est **facile à lire** et à prononcer,
- reflète ta **marque** ou ton projet,
- aide ton **SEO** (référencement) s’il contient des mots-clés cohérents.

---

## 5. Anatomie d’un nom de domaine 🧩

Prenons : `www.app.monsite.fr`

| Partie | Nom | Rôle |
| --- | --- | --- |
| `.fr` | **TLD** (Top-Level Domain) | extension (pays ou générique) |
| `monsite` | **Domaine** (Second-Level Domain) | nom principal du site |
| `app` | **Sous-domaine** | section/service du site |
| `www` | (souvent) sous-domaine | histo : “site web” |

### 5.1 TLD (Top-Level Domain)

- **gTLD** : `.com`, `.org`, `.net`, `.io`, `.academy`, etc.
- **ccTLD** : `.fr`, `.de`, `.es`… (country code Top-Level Domain).
- Gérés globalement par l’**ICANN** et des **registries** (organismes qui gèrent un TLD donné).

### 5.2 Domaine

- C’est *le* nom que tu achètes chez un **registrar** : `monsite.fr`, `monprojet.dev`.
- Il est **unique** sous un TLD : s’il y a déjà un `monsite.fr`, tu ne peux pas l’enregistrer.

### 5.3 Sous-domaine

- C’est un “sous-espace” sous ton domaine principal :
    - `www.monsite.fr` → site principal,
    - `api.monsite.fr` → API backend,
    - `blog.monsite.fr` → blog,
    - `mail.monsite.fr` → services mail.
- Tu peux créer autant de sous-domaines que tu veux via ta **zone DNS**.

---

## 6. C’est quoi le DNS ? 💡

**DNS (Domain Name System)** = annuaire géant d’Internet.

Il traduit les **noms de domaine** en **adresses IP** (et d’autres infos : mail, TXT, etc.).

### 6.1 Qu’est-ce qu’un serveur DNS ?

Un **serveur DNS** est un serveur qui parle le protocole DNS et qui :

- reçoit des requêtes du type “quelle est l’IP de `www.monsite.fr` ?”,
- répond avec des informations issues de sa base (ou qu’il va chercher ailleurs).

On distingue plusieurs rôles :

- **Résolveur DNS récursif** (DNS de ton FAI, 8.8.8.8, 1.1.1.1…)
    
    → C’est lui que ton PC interroge en premier.
    
- **Serveurs racine**
    
    → Connaissent où trouver les serveurs des TLD.
    
- **Serveurs de TLD**
    
    → Savent où sont les serveurs autoritatifs pour `.fr`, `.com`, etc.
    
- **Serveurs DNS autoritatifs**
    
    → Contiennent la **zone DNS** d’un domaine (ex. `monsite.fr`).
    

### 6.2 Serveur DNS racine (Root Server)

Les **serveurs DNS racine** sont le point de départ de la hiérarchie.

Ils ne connaissent pas les IP des sites, mais ils savent :

> “Pour .fr, va voir tels serveurs ; pour .com, va voir tels serveurs…”
> 

---

## 7. Comment fonctionne la résolution DNS ? 🔄

Tu tapes `www.wikipedia.org` :

1. Ton navigateur demande à ton système :
    
    👉 “C’est quoi l’IP de `www.wikipedia.org` ?”
    
2. Ton PC demande au **résolveur DNS récursif** configuré (box/FAI/DNS public).
3. Le résolveur :
    - regarde s’il a la réponse en **cache** ; si oui → il renvoie l’IP,
    - sinon, il remonte la hiérarchie :
        - interroge un **serveur racine** → obtient les serveurs du TLD `.org`,
        - interroge les serveurs `.org` → obtient le serveur autoritatif de `wikipedia.org`.
4. Le DNS autoritatif de `wikipedia.org` renvoie un enregistrement (souvent de type **A** ou **AAAA**).
5. Le résolveur met en **cache** la réponse pour `TTL` secondes, puis la transmet à ton navigateur.
6. Le navigateur se connecte à cette IP et affiche le site.

### 7.1 Propagation DNS & cache

- Chaque réponse DNS est **cachée** (mise en cache) pendant un certain temps : le **TTL** (Time To Live).
- Quand tu modifies un record DNS, il faut attendre que tous les caches dans le monde expirent → c’est ce qu’on appelle la **propagation DNS** (quelques minutes à 48h).

---

## 8. Le protocole DNS (UDP / TCP) 📡

Les échanges DNS utilisent principalement :

- **UDP port 53** :
    - Requêtes rapides, réponses courtes.
    - C’est le mode par défaut pour la résolution classique.
- **TCP port 53** :
    - Utilisé quand la réponse est trop grosse pour UDP,
    - Utilisé pour les **transferts de zone** entre serveurs autoritatifs et secondaires,
    - Utilisé pour certaines fonctions avancées (DNSSEC…).

Le **protocole DNS** lui-même (format des messages, codes, sections) est normalisé par la RFC 1035.

---

## 9. Registrar & Registry : qui fait quoi ? 🏛️

### 9.1 Registrar

Un **registrar** est l’entreprise chez qui tu **achètes** ton nom de domaine :

- Exemples : OVH, Gandi, Hostinger, Namecheap, Squarespace, etc.
- Il est accrédité par l’**ICANN** (ou l’organisme local pour `.fr`, `.de`, etc.).
- Il te fournit une interface pour :
    - **rechercher** un domaine disponible,
    - **enregistrer** (paiement 1 an, 2 ans, etc.),
    - **renouveler** ou **transférer** le domaine,
    - gérer ta **zone DNS** (ou déléguer à un autre fournisseur DNS).

Analogie :

Le registrar = le **guichet** où tu vas réserver **ton nom** pour être inscrit dans l’annuaire global.

### 9.2 Registry

- C’est l’organisme qui **gère un TLD** donné (ex. `.fr`, `.com`).
- Il tient la **liste officielle** de tous les domaines existants dans ce TLD.

Le registrar parle au registry pour inscrire :

> “Ce domaine appartient à tel contact, et pointe vers tels serveurs DNS (NS).”
> 

---

## 10. Zone DNS : ton carnet d’adresses 📒

Une **zone DNS** est **la configuration DNS d’un domaine**.

C’est là que tu déclares :

> “Pour tel nom (www.monsite.com), voici l’IP / le serveur mail / l’alias / etc.”
> 

### 10.1 Où est gérée la zone ?

- Chez ton **registrar** (interface DNS par défaut),
- ou chez un **DNS provider** séparé (Route 53, Cloudflare, etc.), vers lequel tu délègues via les records **NS**.

### 10.2 Principaux types d’enregistrements (records)

| Type | Rôle | Exemple |
| --- | --- | --- |
| **A** | Nom de domaine → IP **v4** | `www → 203.0.113.10` |
| **AAAA** | Nom de domaine → IP **v6** | `www → 2001:db8::1` |
| **CNAME** | Alias (nom → autre nom) | `blog → www.monsite.com` |
| **MX** | Serveurs de mail pour le domaine | `monsite.com → mail.provider.com` |
| **TXT** | Infos texte (SPF, DKIM, vérif de domaine, etc.) | `v=spf1 include:_spf.google.com ~all` |
| **NS** | Serveurs DNS autoritatifs pour la zone | `ns1.provider.net`, `ns2.provider.net` |
| **SOA** | Infos administratives (zone) | TTL par défaut, email admin… |
| **SRV** | Services (port + protocole) | `_sip._tcp.example.com` |
| **CAA** | Autorise certaines autorités de certification à émettre des certificats | `0 issue "letsencrypt.org"` |

### 10.3 Serveur DNS autoritatif & secondaire

- **Serveur autoritatif** : héberge la version **officielle** de la zone DNS.
- **Serveur secondaire** : copie de la zone, mise à jour par **transfert de zone** (TCP 53).

Rôle des secondaires :

- Redondance (si le primaire tombe),
- Répartition de la charge,
- Disponibilité globale.

---

## 11. Focus MX : comment fonctionnent les serveurs mail 📧

Les **enregistrements MX** indiquent **où envoyer les e-mails** pour ton domaine.

Exemple de zone pour `monsite.com` :

| Type | Nom | Valeur | Priorité |
| --- | --- | --- | --- |
| MX | @ | `10 mail1.protonmail.com` | 10 |
| MX | @ | `20 mail2.protonmail.com` | 20 |
- Le “@” désigne le **domaine racine** (`monsite.com`).
- Plus la **priorité est faible**, plus le serveur est préféré (10 avant 20).
- Si `mail1` ne répond plus → les mails sont envoyés vers `mail2`.

---

## 12. Exemple de zone DNS complète

Imaginons le domaine `monsite.com` :

| Type | Nom | Valeur | Commentaire |
| --- | --- | --- | --- |
| A | `@` | `203.0.113.10` | IP principale du site |
| A | `api` | `203.0.113.11` | Backend / API |
| A | `blog` | `203.0.113.12` | Serveur blog |
| CNAME | `www` | `monsite.com.` | `www.monsite.com` → `monsite.com` |
| MX | `@` | `10 mail.protonmail.com` | Serveur mail |
| TXT | `@` | `v=spf1 include:_spf.protonmail.ch ~all` | SPF |
| TXT | `_dmarc` | `v=DMARC1; p=quarantine;` | Politique DMARC |
| CAA | `@` | `0 issue "letsencrypt.org"` | Autorise Let’s Encrypt |

---

## 13. Outils de diagnostic : `dig` & `nslookup` 🛠️

### 13.1 `dig` (Domain Information Groper)

`dig` interroge les DNS et affiche ce qu’ils répondent. Très utilisé pour debug.

### Commandes de base

```bash
# Enregistrement A par défaut
dig google.com

# Enregistrement A explicite
dig google.com A

# Enregistrement MX
dig google.com MX

# Serveurs DNS autoritatifs
dig google.com NS

# Avec réponse courte (pratique)
dig +short google.com
dig +short google.com MX

# Voir toute la chaîne de résolution
dig +trace google.com

```

Avec `dig example.com` tu vois :

- la **section ANSWER** : les records trouvés (IP, MX…),
- le **serveur interrogé**,
- le **temps de réponse**,
- le **TTL** restant.

Utilisations typiques :

- Vérifier qu’un **nouveau record** est bien propagé.
- Vérifier que les **MX** sont corrects (problèmes de mail).
- Comparer la réponse de ton **DNS provider** et celle de ton **résolveur FAI**.
- Visualiser la hiérarchie (avec `+trace`).

### 13.2 `nslookup`

Outil plus ancien, très courant surtout sous Windows.

```bash
# Requête simple
nslookup example.com

# Spécifier le type d’enregistrement
nslookup -type=MX example.com

# Interroger un DNS précis (ici Google DNS)
nslookup example.com 8.8.8.8

```

---

## 14. Certificats SSL/TLS & HTTPS 🔒

### 14.1 Pourquoi TLS ?

Un certificat SSL/TLS :

- **Authentifie** le site (tu parles bien au bon domaine, pas à un imposteur).
- **Chiffre** les communications entre le client et le serveur.
- Donne le fameux cadenas 🔒 et le `https://`.

Analogie :

- Sans SSL : ton message circule comme une **carte postale** (lisible par tous).
- Avec SSL : c’est une **enveloppe fermée** que seul le destinataire peut ouvrir.

### 14.2 Comment ça marche, en gros ?

1. Le navigateur se connecte à `https://monsite.com`.
2. Le serveur envoie son **certificat** (clé publique + nom de domaine).
3. Le navigateur vérifie que le certificat est :
    - signé par une **Autorité de Certification (CA)** de confiance (Let’s Encrypt, etc.),
    - valide dans le temps,
    - bien émis pour ce **nom de domaine**.
4. Si tout est OK, client et serveur établissent un **canal chiffré** (clé de session) et échangent des données.

### 14.3 Let’s Encrypt & Certbot

**Let’s Encrypt** : Autorité de Certification (CA) gratuite et automatisée.

- Tu prouves que tu es **propriétaire** du domaine,
- Let’s Encrypt te délivre un certificat **gratuit** valable 90 jours,
- Tu automatises le **renouvellement** (cron, systemd timer…).

**Certbot** est l’outil le plus courant pour gérer ça.

### Principe HTTP-01 (le plus courant)

1. Tu as un serveur web accessible sur `http://monsite.com`.
2. Certbot demande à Let’s Encrypt un certificat pour `monsite.com`.
3. Let’s Encrypt te donne un **challenge** : créer un fichier spécial sur `http://monsite.com/.well-known/acme-challenge/...`.
4. Let’s Encrypt vérifie qu’il peut accéder à ce fichier → preuve que tu contrôles le domaine.
5. Le certificat est généré et stocké sur ton serveur.
6. Certbot configure ton serveur (Nginx/Apache) pour utiliser **HTTPS**.

### Exemple minimal (Nginx)

```bash
# Installation (ex Ubuntu)
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obtention d’un cert pour monsite.com + www.monsite.com
sudo certbot --nginx -d monsite.com -d www.monsite.com

```

Certbot :

- Modifie Nginx pour activer **HTTPS**,
- Met en place un **renouvellement automatique** via `cron` ou `systemd`.

---

<!-- snippet
id: nginx_dig_record_a
type: command
tech: nginx
level: beginner
importance: high
format: knowledge
tags: dns,dig,record-a,diagnostic
title: Interroger l'enregistrement A d'un domaine avec dig
context: vérifier qu'un domaine résout bien vers la bonne adresse IP
command: dig +short google.com A
description: Affiche uniquement l'adresse IPv4 associée au domaine. Utilisez dig +trace pour voir toute la chaîne de résolution depuis les serveurs racine.
-->

<!-- snippet
id: nginx_dig_mx
type: command
tech: nginx
level: beginner
importance: medium
format: knowledge
tags: dns,dig,mx,mail
title: Vérifier les enregistrements MX d'un domaine
context: diagnostiquer des problèmes de réception d'email ou confirmer la configuration mail
command: dig +short google.com MX
description: Affiche les serveurs de messagerie et leur priorité. Plus la valeur de priorité est faible, plus le serveur est préféré (ex : 10 avant 20).
-->

<!-- snippet
id: nginx_certbot_nginx
type: command
tech: nginx
level: intermediate
importance: high
format: knowledge
tags: certbot,letsencrypt,https,nginx,certificat
title: Obtenir un certificat Let's Encrypt pour Nginx avec Certbot
context: activer HTTPS automatiquement sur un domaine avec Nginx
command: sudo certbot --nginx -d monsite.com -d www.monsite.com
description: Demande un certificat Let's Encrypt et modifie automatiquement la configuration Nginx. Installer Certbot au préalable : `sudo apt install certbot python3-certbot-nginx`.
-->

<!-- snippet
id: nginx_dns_zone_records_concept
type: concept
tech: nginx
level: beginner
importance: high
format: knowledge
tags: dns,zone,enregistrements,A,CNAME,MX,TXT
title: Types d'enregistrements DNS essentiels dans une zone
context: configurer une zone DNS pour un nouveau domaine ou un sous-domaine
content: Les principaux enregistrements DNS sont : A (nom → IPv4), AAAA (nom → IPv6), CNAME (alias → autre nom, ne pas utiliser sur le domaine racine @), MX (serveurs mail avec priorité), TXT (SPF, DKIM, vérifications de domaine), NS (serveurs DNS autoritatifs), CAA (autorités de certification autorisées, ex : letsencrypt.org). Le TTL détermine la durée de mise en cache et donc la vitesse de propagation lors d'un changement.
-->

<!-- snippet
id: nginx_dns_propagation_tip
type: tip
tech: nginx
level: beginner
importance: medium
format: knowledge
tags: dns,ttl,propagation,conseil
title: Réduire le TTL avant un changement DNS critique
context: préparer une migration de domaine ou un changement d'IP sans interruption prolongée
content: Avant de changer l'IP d'un enregistrement A, réduisez le TTL à 300 secondes (5 min) 24 à 48h à l'avance. Ainsi, lors du changement réel, les résolveurs DNS du monde entier adopteront la nouvelle valeur rapidement. Après la migration, remontez le TTL à sa valeur habituelle (3600 ou plus).
-->

<!-- snippet
id: nginx_nslookup_debug
type: command
tech: nginx
level: beginner
importance: low
format: knowledge
tags: nslookup,dns,diagnostic,windows
title: Diagnostiquer un enregistrement DNS avec nslookup
context: vérifier la résolution DNS depuis Windows ou comparer deux résolveurs
command: nslookup -type=MX example.com 8.8.8.8
description: Interroge le DNS de Google (8.8.8.8) pour les enregistrements MX du domaine. Pratique pour comparer la réponse de son FAI avec un DNS public et détecter des problèmes de propagation.
-->