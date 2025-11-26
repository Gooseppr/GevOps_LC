---
title: Les noms de domaine
sujet: Cloud publique, Hosting & Cloud
type: module
jour: 33
ordre: 1
tags: dns, certificat, devops, domaine, letsencrypt, http, https
---

## 1. Objectifs du cours

À la fin, tu dois être à l’aise pour :

- Expliquer clairement **ce qu’est un nom de domaine** et pourquoi on en a besoin.
- Comprendre **comment fonctionne le DNS** (résolution, cache, propagation).
- Savoir **ce qu’est un registrar** et ce qui se passe quand tu “achètes” un domaine.
- Lire et configurer une **zone DNS** (A, AAAA, CNAME, MX, TXT, NS, etc.).
- Utiliser `dig` pour **diagnostiquer** les problèmes DNS.
- Comprendre et installer un **certificat SSL/TLS** (Let’s Encrypt, Certbot).
- Appliquer tout ça à un projet web (par ex. ton NocoDB/QuickData, front + backend avec domaine perso et HTTPS).

---

## 2. Contexte : IP vs noms de domaine

### 2.1 Limite des adresses IP

Une **adresse IP** (ex. `203.0.113.45`) identifie une machine sur le réseau. Problème :

- **Difficile à retenir** : impossible de mémoriser des dizaines d’IP.
- **Pas parlant** : `203.0.113.45` ne dit pas si c’est un site web, un serveur mail, une API, etc.
- **Changeant** : l’adresse d’un serveur peut changer (migration, scaling…).

D’où l’idée d’un système qui permette aux humains de retenir un **nom**, et aux machines de manipuler des **IP** : c’est le rôle des **noms de domaine** et du **DNS**.

---

## 3. Un peu d’historique (très rapide)

- Au début d’ARPANET : un simple fichier `hosts.txt` partagé listait “nom → IP”.
- Quand le réseau a grossi, ce modèle ne tenait plus.
- 1983 : création du **DNS** (Domain Name System), base de données **hiérarchique et distribuée**.
- Les premières extensions : `.com` (commercial), `.org`, `.net`, puis les **extensions pays** (`.fr`, `.de`, `.uk`, etc.).
- Aujourd’hui, on a des centaines de TLD : `.io`, `.academy`, `.dev`, `.cloud`…

---

## 4. Qu’est-ce qu’un nom de domaine ?

Un **nom de domaine** est une **adresse lisible** qui sert d’alias à une adresse IP.

👉 Au lieu de retenir `172.217.20.46`, tu tapes `www.google.com`.

Analogie de tes notes :

Tu ne retiens pas l’**adresse complète** de ton ami, tu retiens **son nom**. Le “DNS” joue le rôle de l’annuaire qui, à partir du nom, retrouve l’adresse.

Un bon nom de domaine :

- est **facile à lire** et à prononcer,
- reflète ta **marque** ou ton projet,
- aide ton **SEO** (référencement) s’il contient des mots-clés cohérents.

---

## 5. Anatomie d’un nom de domaine

Prenons : `www.app.quickdata.fr`

| Partie | Nom | Rôle |
| --- | --- | --- |
| `.fr` | **TLD** (Top-Level Domain) | extension (pays ou générique) |
| `quickdata` | **Domaine** (Second-Level Domain) | nom principal du site |
| `app` | **Sous-domaine** | section/service du site |
| `www` | (souvent) sous-domaine | histo : “site web” |

### 5.1 TLD (Top-Level Domain)

- **gTLD** : `.com`, `.org`, `.net`, `.io`, `.academy`, etc.
- **ccTLD** : `.fr`, `.de`, `.es`… (country code Top-Level Domain).
- Gérés globalement par l’**ICANN** et des **registries** (organismes qui gèrent un TLD donné).

### 5.2 Domaine

- C’est *le* nom que tu achètes chez un **registrar** : `quickdata.fr`, `monprojet.dev`.
- Il est **unique** sous un TLD : s’il y a déjà un `quickdata.fr`, tu ne peux pas l’enregistrer.

### 5.3 Sous-domaine

- C’est un “sous-espace” sous ton domaine principal :
    - `www.quickdata.fr` → site principal,
    - `api.quickdata.fr` → API backend,
    - `noco.quickdata.fr` → interface NocoDB,
    - `mail.quickdata.fr` → services mail.
- Tu peux créer autant de sous-domaines que tu veux via ta **zone DNS**.

---

## 6. C’est quoi le DNS ?

**DNS (Domain Name System)** = annuaire géant d’Internet.

Il traduit les **noms de domaine** en **adresses IP** (et d’autres infos : mail, TXT, etc.).

### 6.1 Acteurs principaux

- **Résolveur DNS récursif** : souvent celui de ton FAI ou de ton OS (`8.8.8.8`, `1.1.1.1`…).
    
    C’est lui que ton PC interroge en premier.
    
- **Serveurs racine** : connaissent où trouver les serveurs des TLD.
- **Serveurs de TLD** : savent où sont les serveurs autoritatifs pour `.fr`, `.com`, etc.
- **Serveurs DNS autoritatifs** : contiennent la **zone DNS** d’un domaine (`quickdata.fr`).

### 6.2 Processus de résolution (simplifié)

Tu tapes `www.wikipedia.org` :

1. Ton navigateur demande à ton système : “c’est quoi l’IP de `www.wikipedia.org` ?”.
2. Ton PC demande au **résolveur DNS récursif** configuré (box/FAI/DNS public).
3. Le résolveur :
    - regarde s’il a la réponse en **cache** ; si oui → il renvoie l’IP,
    - sinon, il remonte l’arbre : **racine → TLD `.org` → DNS autoritatif de `wikipedia.org`**.
4. Le DNS autoritatif renvoie un enregistrement (souvent de type **A** ou **AAAA**).
5. Le résolveur met en **cache** la réponse pour `TTL` secondes, puis la transmet à ton navigateur.
6. Le navigateur se connecte à cette IP et affiche le site.

### 6.3 Propagation DNS & cache

- Chaque réponse DNS est **cachée** (mise en cache) pendant un certain temps : le **TTL** (Time To Live).
- Quand tu modifies un record DNS, il faut attendre que tous les caches dans le monde expirent → c’est ce qu’on appelle la **propagation DNS** (quelques minutes à 48h).

---

## 7. Registrar & Registry : qui fait quoi ?

### 7.1 Registrar

Un **registrar** est l’entreprise chez qui tu **achètes** ton nom de domaine :

- Exemples : OVH, Gandi, Hostinger, Namecheap, Squarespace (qui a racheté Google Domains), etc.
- Il est accrédité par l’**ICANN** (ou l’organisme local pour `.fr`, `.de`, etc.).
- Il te fournit une interface pour :
    - **rechercher** un domaine disponible,
    - **enregistrer** (paiement 1 an, 2 ans, etc.),
    - **renouveler** ou **transférer** le domaine,
    - gérer ta **zone DNS** (ou déléguer à un autre fournisseur DNS).

Analogie de tes notes :

Le registrar = le **guichet** où tu vas réserver **ton nom** pour être inscrit dans l’annuaire global.

### 7.2 Registry

- C’est l’organisme qui **gère un TLD** donné (ex. `.fr`, `.com`).
- Il tient la **liste officielle** de tous les domaines existants dans ce TLD.

Le registrar parle au registry pour inscrire : “ce domaine appartient à tel contact, et pointe vers tels serveurs DNS”.

---

## 8. Zone DNS : ton carnet d’adresses

Une **zone DNS** est **la configuration DNS d’un domaine**.

C’est là que tu déclares :

> “Pour tel nom (www.monsite.com), voici l’IP / le serveur mail / l’alias / etc.”
> 

### 8.1 Où est gérée la zone ?

- Chez ton **registrar** (interface DNS par défaut),
- ou chez un **DNS provider** séparé (Route 53, Cloudflare, etc.), vers lequel tu délègues via les records **NS**.

### 8.2 Principaux types d’enregistrements (records)

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

### 8.3 Focus MX : comment fonctionnent les serveurs mail ?

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

## 9. Exemple de zone DNS complète (projet type QuickData / NocoDB)

Imaginons le domaine `quickdata.dev` :

| Type | Nom | Valeur | Commentaire |
| --- | --- | --- | --- |
| A | `@` | `203.0.113.10` | IP du reverse proxy / frontend |
| A | `api` | `203.0.113.11` | Backend API (NocoDB ou autre) |
| A | `noco` | `203.0.113.12` | Interface NocoDB dédiée |
| CNAME | `www` | `quickdata.dev.` | `www.quickdata.dev` → `quickdata.dev` |
| MX | `@` | `10 mail.protonmail.com` | Serveur mail |
| TXT | `@` | `v=spf1 include:_spf.protonmail.ch ~all` | SPF |
| TXT | `_dmarc` | `v=DMARC1; p=quarantine;` | Politique DMARC |
| CAA | `@` | `0 issue "letsencrypt.org"` | Autorise Let’s Encrypt |

Tu peux ainsi :

- Servir ton **frontend** sur `quickdata.dev`.
- Servir ton **backend / API** sur `api.quickdata.dev`.
- Servir une **interface NocoDB** sur `noco.quickdata.dev`.
- Gérer tes **emails** via les **MX** et **TXT**.

---

## 10. Outil de diagnostic : `dig`

`dig` (**Domain Information Groper**) interroge les DNS et affiche ce qu’ils répondent. Très utilisé pour debug.

### 10.1 Commandes de base

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

```

Avec `dig example.com` tu vois :

- la **section ANSWER** : le record trouvé (IP, MX…),
- le **serveur interrogé**,
- le **temps de réponse**,
- le **TTL** restant.

Utilisations typiques :

- Vérifier qu’un **nouveau record** est bien propagé.
- Vérifier que les **MX** sont corrects (problèmes de mail).
- Comparer la réponse de ton **DNS provider** et celle de ton **résolveur FAI**.

---

## 11. Certificats SSL/TLS & HTTPS

### 11.1 Pourquoi TLS ?

Un certificat SSL/TLS :

- **Authentifie** le site (tu parles bien à `quickdata.dev`, pas à un imposteur).
- **Chiffre** les communications entre le client et le serveur.
- Donne le fameux cadenas 🔒 et le `https://`.

Analogie de tes notes :

- Sans SSL : ton message circule comme une **carte postale**.
- Avec SSL : ton message est dans une **enveloppe verrouillée** que seul le destinataire peut ouvrir.

### 11.2 Comment ça marche, en gros ?

1. Le navigateur se connecte à `https://quickdata.dev`.
2. Le serveur envoie son **certificat** (qui contient la clé publique + le nom de domaine).
3. Le navigateur vérifie que le certificat est :
    - signé par une **Autorité de Certification (CA)** de confiance (Let’s Encrypt, etc.),
    - valide dans le temps,
    - bien émis pour ce **nom de domaine**.
4. Si tout est OK, ils établissent un **canal chiffré** (clé de session) et commencent à échanger des données.

---

### 11.3 Let’s Encrypt & Certbot

**Let’s Encrypt** : Autorité de Certification (CA) gratuite et automatisée.

- Tu prouves que tu es **propriétaire** du domaine,
- Let’s Encrypt te délivre un certifica **gratuit** valable 90 jours,
- Tu automatises le **renouvellement** (Cron, systemd timer…).

**Certbot** est l’outil le plus courant pour gérer ça.

### 11.3.1 Principe HTTP-01 (le plus courant)

1. Tu as un serveur web accessible sur `http://quickdata.dev`.
2. Certbot demande à Let’s Encrypt un certificat pour `quickdata.dev`.
3. Let’s Encrypt te donne un **challenge** : créer un fichier spécial sur `http://quickdata.dev/.well-known/acme-challenge/...`.
4. Let’s Encrypt vérifie qu’il peut accéder à ce fichier → preuve que tu contrôles le domaine.
5. Le certificat est généré et stocké sur ton serveur.
6. Certbot configure ton serveur (Nginx/Apache) pour utiliser **HTTPS**.

### 11.3.2 Exemple minimal (Nginx)

```bash
# Installation (ex Ubuntu)
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obtention d’un cert pour quickdata.dev + www.quickdata.dev
sudo certbot --nginx -d quickdata.dev -d www.quickdata.dev

```

Certbot :

- Modifie Nginx pour activer **HTTPS**,
- Met en place un **renouvellement automatique** via `cron` ou `systemd`.

---

## 12. Lien avec tes projets DevOps (ex. NocoDB / QuickData)

Dans ton projet QuickData/NocoDB, tu seras évalué sur :

- **Nom de domaine personnalisé** pour :
    - le **frontend** (ex. `app.quickdata.dev`),
    - le **backend/API** (ex. `api.quickdata.dev`).
- Avec ou sans **HTTPS** (objectif : *avec*).

Concrètement, tu devras :

1. **Acheter** un domaine (ex. `quickdata.dev`) chez un registrar.
2. Configurer ta **zone DNS** :
    - `A`/`CNAME` pour `app.quickdata.dev` → ton frontal (Nginx/Traefik, etc.).
    - `A`/`CNAME` pour `api.quickdata.dev` → ton backend/NocoDB.
3. Utiliser `dig` pour vérifier que :
    - les noms résolvent vers la bonne IP,
    - les records sont bien propagés.
4. Installer des **certificats SSL** (Let’s Encrypt + Certbot) pour :
    - `https://app.quickdata.dev`
    - `https://api.quickdata.dev`
5. Forcer les redirections de `http → https`.

C’est exactement ce que vise la partie “Nom de domaine” de ta checklist projet (front/back avec HTTPS).