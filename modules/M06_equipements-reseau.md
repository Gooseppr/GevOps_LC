---
title: Les équipements réseaux
type: module
jour: 06
ordre: 1
tags: network, linux
---

# Les équipements réseaux

## **1. Introduction aux réseaux informatiques**

Un réseau informatique est un ensemble de machines connectées (ordinateurs, serveurs, imprimantes, etc.) qui peuvent échanger des données entre elles. L’objectif principal d’un réseau est de permettre la communication, le partage de ressources et l’accès à des services (Internet, stockage, authentification, etc.).

On distingue principalement deux types de réseaux :

- **LAN (Local Area Network)** : réseau local, limité à une zone géographique restreinte (bureaux, maison, salle serveur).
- **WAN (Wide Area Network)** : réseau étendu, reliant plusieurs réseaux distants (comme Internet).

Un réseau est composé d’équipements physiques (switch, routeur, câbles), de configurations logicielles (adresses IP, DHCP, firewall) et de protocoles (ICMP, TCP/IP, DNS).

---

## **2. Structure d’une adresse IP**

Une **adresse IP** identifie une machine dans un réseau. Elle doit être **unique** dans son réseau local.

### 2.1. IPv4

Format : `X.X.X.X` (exemple : `192.168.1.10`)

La notation CIDR `/24` équivaut à un masque `255.255.255.0`.

Une adresse IPv4 est composée de :

- **Réseau** → partie commune à toutes les machines du même sous-réseau.
- **Hôte** → identifiant unique de la machine.

Exemple : `192.168.1.10 / 24`

- Réseau : `192.168.1.0`
- Première IP disponible : `192.168.1.1`
- Dernière IP : `192.168.1.254`
- Broadcast : `192.168.1.255`

### 2.2. IPv6

Format : `fe80::1af3:45b1::8c21`

Plus longue, utilisée pour pallier la pénurie IPv4.

OpenWrt assigne souvent une IPv6 locale (`fe80::...`) même si aucun DHCP IPv4 n’est disponible. C’est ce qui cause parfois la confusion (exemple que tu as rencontré).

---

## **3. Les équipements réseaux**

### 3.1. **Switch**

Rôle : distribuer les communications au sein d’un même réseau local.

Il fonctionne en **couche 2 (liaison)** du modèle OSI.

Il utilise les **adresses MAC** pour envoyer un paquet uniquement au destinataire concerné.

Contrairement à un hub, il n’inonde pas tout le réseau.

### 3.2. **Routeur**

Rôle : interconnecter différents réseaux (par exemple LAN ↔ Internet).

Il fonctionne en **couche 3 (réseau)**.

Il décide de la route à emprunter pour acheminer un paquet vers un autre réseau.

Il fait souvent :

- Routage (choix du chemin)
- NAT (traduction d’adresses)
- DHCP (attribution d’IP)
- Firewall (sécurité)

### 3.3. **Serveur DHCP**

Attribue automatiquement une adresse IP à une machine.

Un serveur DHCP fournit :

- Adresse IP
- Masque de sous-réseau
- Passerelle (gateway)
- DNS

Il est généralement intégré dans :

- Le routeur ou box Internet (cas domestique)
- Un serveur dédié (cas professionnel)

### 3.4. **Passerelle (Gateway)**

Adresse du routeur qui permet de sortir du réseau local.

Sans passerelle, une machine peut communiquer uniquement à l’intérieur de son réseau local.

Exemple :

Si la machine a `192.168.1.10`, sa passerelle est souvent `192.168.1.1`.

### 3.5. **Firewall (Pare-feu)**

Filtre le trafic entrant et sortant selon des règles.

Permet de :

- Bloquer des ports (ex: Telnet)
- Autoriser uniquement certains services (ex: HTTP, SSH)
- Restreindre l'accès Internet pour certaines machines

OpenWrt utilise un firewall interne basé sur **nftables** et configuré via **UCI**.

---

## **4. Protocole ICMP et Ping**

### 4.1. Protocole ICMP

Utilisé pour le diagnostic réseau.

### 4.2. Commande Ping

Permet de tester si deux machines peuvent communiquer.

```bash
ping 192.168.1.1      # Test de la connexion au routeur
ping 8.8.8.8          # Test de l'accès Internet

```

Si le ping fonctionne → communication possible

Si le ping échoue → problème de routage, firewall ou DHCP

---

## **5. Box Internet vs Architecture Professionnelle**

### En environnement domestique

Une box Internet regroupe :

| Fonction | Rôle |
| --- | --- |
| Routeur | Sortie vers Internet |
| Switch | Connexions Ethernet |
| DHCP | Attribution IP |
| DNS | Résolution noms → IP |
| Firewall | Protection réseau |

### En réseau professionnel

Chaque rôle est séparé et maîtrisé :

| Équipement | Rôle |
| --- | --- |
| Firewall dédié | Sécurité |
| Routeur | Routage entre réseaux |
| Switch | Réseau interne LAN |
| Serveur DHCP/DNS | Infrastructure IP |

## 6. Segmentation réseau : LAN, DMZ, VLAN

### 6.1. Pourquoi segmenter ?

- **Performance** : limiter le broadcast et les collisions.
- **Sécurité** : isoler les zones à risque (serveurs exposés) des postes internes.
- **Organisation** : séparer par fonctions (utilisateurs, serveurs, IoT, invités).

### 6.2. LAN (Local Area Network)

- Réseau interne « de confiance » (postes, imprimantes, NAS).
- Exemple : `192.168.10.0/24`.

### 6.3. DMZ (Demilitarized Zone)

- Zone tampon pour les services **accessibles depuis Internet** (web, reverse proxy).
- Accès contrôlé depuis Internet **et** depuis le LAN.
- Exemple : `192.168.20.0/24`.

### 6.4. VLAN (IEEE 802.1Q)

- **Réseaux logiques** indépendants sur le **même switch physique**.
- Chaque VLAN a son **ID** (ex. VLAN 10 = Users, VLAN 20 = DMZ).
- **Trunk** : lien transportant plusieurs VLAN entre équipements (switch ↔ routeur).
- **Access** : port affecté à **un seul** VLAN (PC d’utilisateur).

```
        [Rout./Firewall]
              ||
           (Trunk)
       ┌─────┴─────┐
   VLAN10        VLAN20
 (Access)        (Access)
 PC Users        Serveur Web

```

**À retenir** : la segmentation **réduit la surface d’attaque** et **organise les flux**.

---

## 7. Routage, passerelles et tables de routage

### 7.1. Passerelle (Gateway)

- Adresse du routeur permettant de joindre **d’autres réseaux**.
- Sans passerelle, on ne sort **pas** de son sous-réseau.

### 7.2. Table de routage

- Règles locales indiquant « pour tel réseau → tel **next-hop** ».
- Sur une machine :
    - **Route connectée** : son propre sous-réseau (ex. `192.168.1.0/24` via `ens4`).
    - **Route par défaut** (default / `0.0.0.0/0`) : passerelle vers « tout le reste ».

### 7.3. Principe de décision

- La route la **plus spécifique** (plus grand préfixe) gagne.
- Sinon, on utilise la **route par défaut**.

### 7.4. Exemple simple

- PC : `192.168.1.50/24`, GW = `192.168.1.1`.
- Pour joindre `8.8.8.8`, le PC **envoie au GW** qui relaie vers Internet.

---

## 8. NAT (PAT) : partager Internet

### 8.1. Pourquoi du NAT ?

- Les adresses privées (RFC 1918 : `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`) ne sont pas routées sur Internet.
- Le **NAT** (souvent **PAT / Masquerading**) traduit plusieurs IP internes en **une IP publique**.

### 8.2. Fonctionnement (PAT)

- Le routeur **réécrit** l’adresse source et **les ports**.
- Il maintient une **table de correspondance** (sessions) pour le retour du trafic.

### 8.3. NAT ≠ Sécurité

- Le NAT **n’est pas un firewall**, mais il **cache** les IP internes.
- La **sécurité** est assurée par le **pare-feu** (politiques et règles).

---

## 9. Pare-feu (Firewall) : logiques et politiques

### 9.1. Modèles de politique

- **Allow by default** : tout passe, on bloque au cas par cas (rare en production).
- **Deny by default** : **rien ne passe**, on **autorise** explicitement (recommandé).

### 9.2. Sens des flux

- **INPUT** : trafic **vers** l’équipement lui-même (ex. SSH sur le routeur).
- **OUTPUT** : trafic **émis** par l’équipement.
- **FORWARD** : trafic **traversant** l’équipement (LAN ↔ WAN, LAN ↔ DMZ).

### 9.3. Règles typiques

- Autoriser **Established/Related** (retours de connexions déjà permises).
- Autoriser **LAN → WAN** (si souhaité).
- Interdire **WAN → LAN** par défaut.
- Ouvrir **WAN → DMZ** sur **ports précis** (HTTP/HTTPS…).

### 9.4. Whitelist / Blacklist

- **Whitelist** (liste blanche) : on **autorise explicitement** (plus sûr).
- **Blacklist** (liste noire) : on autorise tout sauf ce qu’on **bloque** (risqué).

---

## 10. DNS : résolution de noms

- Transforme un **nom** (`www.exemple.com`) en **adresse IP**.
- En interne, souvent fourni par la box/routeur (ex. `dnsmasq` sur OpenWrt).
- Symptôme classique :
    - **Ping IP** OK (`8.8.8.8`), mais **ping nom** KO → **problème DNS**.

---

## 11. IPv6 (aperçu utile)

- Adresses **beaucoup plus nombreuses**, format hexadécimal (`2001:db8::1`).
- **Link-local** (`fe80::/10`) toujours présent même sans DHCPv6.
- Concepts : **SLAAC** (auto-config), **Prefix Delegation**.
- Dual-stack : cohabitation IPv4/IPv6.

---

## 12. Méthode de diagnostic (ordre recommandé)

1. **Lien physique** : câbles, LED, interface `UP`.
2. **Adresse IP** : `ip a` → vérifier IPv4 (pas seulement `fe80::`).
3. **Passerelle** : `ip route` → présence de `default via …`.
4. **Ping local** : passerelle (ex. `ping 192.168.1.1`).
5. **Ping Internet par IP** : `ping 8.8.8.8`.
6. **Ping par nom** : `ping google.com` (vérifie DNS).
7. **Firewall/NAT** : règles, tables, journaux.

---
[Module suivant →](M06_configuration-reseau.md)
---
