---
titre: Configuration réseaux
type: module
jour: 06
ordre: 2
tags: network, linux, devops
---

# Configuration réseau (GNS3)

## I. Contexte de travail (GNS3)

Avant d’écrire la moindre commande, il faut **situer les rôles** de chaque nœud dans la topologie :

- **OpenWrt (routeur)** : il relie les segments (LAN, DMZ, WAN/Cloud), fournit éventuellement **DHCP/DNS**, applique le **pare-feu** et le **NAT**.
- **Switch** : il relie des hôtes d’un même segment (pas de routage).
- **Debian** : clients/serveurs sur lesquels on vérifiera l’adressage, la connectivité et les résolutions DNS.

Repérage des interfaces d’OpenWrt (pour savoir “qui est LAN/WAN/DMZ”) :

```bash
ip addr show
# Objectif : identifier par observation
#  - eth0  → souvent le WAN (vers Cloud/NAT)
#  - eth1  → souvent le LAN (vers Switch/PC)
#  - eth2  → DMZ (si présente)

```

**Pourquoi c’est important ?** Parce que toutes les commandes UCI suivantes référenceront **les bons ifname** (eth0/eth1/eth2) et **les bonnes zones** (wan/lan/dmz). Une erreur d’interface = un segment mal configuré.

---

## II. Debian (client/serveur) — IP, DHCP, tests

### 1) Obtenir une IP via DHCP (méthode simple et standard)

L’objectif est de laisser **le routeur attribuer** IP/masque/passerelle/DNS.

```bash
sudo nano /etc/network/interfaces
# ───────────────────────────────────────────────────────────────
# Nous forçons l’interface (ex. ens4) à utiliser DHCP IPv4 :
auto ens4
iface ens4 inet dhcp
# ───────────────────────────────────────────────────────────────

# Nous validons sans redémarrer la machine :
sudo systemctl restart networking

# Vérification : l’interface doit afficher une IPv4 (pas seulement une IPv6 fe80::)
ip a
ip route   # doit contenir une "default via <passerelle>"

```

**Signaux d’alerte à connaître**

- Si `ip a` ne montre **aucune IPv4** (seulement `inet6 fe80::…`), c’est que **le DHCP ne répond pas** ou que l’interface **n’est pas en mode DHCP** (côté Debian).
- Le DHCP côté OpenWrt doit être **démarré** (dnsmasq) **avant** les clients, sinon la requête initiale peut être manquée (les clients retenteront, mais la latence peut induire en erreur pendant les tests).

### 2) Définir une IP statique (utile pour des serveurs/DMZ)

```bash
sudo nano /etc/network/interfaces
# ───────────────────────────────────────────────────────────────
# IP statique : utile pour une machine qui doit être jointe de façon déterministe
auto ens4
iface ens4 inet static
    address 192.168.1.50          # IP fixe sur le LAN
    netmask 255.255.255.0         # /24
    gateway 192.168.1.1           # passerelle = routeur LAN
    dns-nameservers 1.1.1.1 8.8.8.8
# ───────────────────────────────────────────────────────────────

sudo systemctl restart networking
ip a
ip route

```

**Bon réflexe** : après toute modification d’IP, **ping** la passerelle et une IP Internet, puis un **nom** (pour valider aussi le DNS).

### 3) Tests de base côté Debian (diagnostic par étapes)

```bash
ping -c 4 192.168.1.1   # Valide le lien local + switch + IP LAN du routeur
ping -c 4 8.8.8.8       # Valide le routage + NAT (si sortie Internet voulue)
ping -c 4 google.com    # Valide le DNS (si IP OK mais nom KO → DNS à corriger)

```

---

## III. OpenWrt — Configuration réseau (UCI)

**Principe :** UCI modifie des fichiers persistants dans `/etc/config/…`.

Après une série de `uci set`, on finit par `uci commit` puis on **redémarre le service** concerné (réseau, firewall, dnsmasq).

### 1) Définir le LAN en IP statique (point d’ancrage local)

On donne une **identité IP** claire au routeur sur le segment LAN.

```bash
# Définir l’interface LAN (adapter ifname au câblage réel)
uci set network.lan=interface
uci set network.lan.ifname='eth1'
uci set network.lan.proto='static'
uci set network.lan.ipaddr='192.168.1.1'
uci set network.lan.netmask='255.255.255.0'

uci commit network
/etc/init.d/network restart

# Pourquoi ?
# - Le LAN doit offrir une IP de passerelle stable aux clients (gateway).
# - Les clients sauront "qui joindre" pour sortir de leur sous-réseau.

```

### 2) Configurer le WAN (en DHCP si le Cloud/NAT amont fournit l’IP)

```bash
# WAN via DHCP : simple et robuste en lab GNS3
uci set network.wan=interface
uci set network.wan.ifname='eth0'
uci set network.wan.proto='dhcp'

uci commit network
/etc/init.d/network restart

# Variante : WAN statique (ex. réseau de transit)
# uci set network.wan.proto='static'
# uci set network.wan.ipaddr='172.16.0.1'
# uci set network.wan.netmask='255.255.255.0'
# uci set network.wan.gateway='172.16.0.254'
# uci set network.wan.dns='1.1.1.1 8.8.8.8'
# uci commit network && /etc/init.d/network restart

```

**Note** : en DHCP WAN, OpenWrt héritera **aussi des DNS** du Cloud/NAT si `peerdns=1` (par défaut). Sinon, on peut forcer des DNS.

### 3) Ajouter un segment DMZ (optionnel, mais utile pour isoler des services)

```bash
# Une troisième patte réseau isolée : DMZ
uci set network.dmz=interface
uci set network.dmz.ifname='eth2'
uci set network.dmz.proto='static'
uci set network.dmz.ipaddr='192.168.20.1'
uci set network.dmz.netmask='255.255.255.0'

uci commit network
/etc/init.d/network restart

# Intention :
# - Séparer les serveurs exposés (Web, reverse proxy, etc.) des postes internes.
# - Appliquer des règles firewall différentes entre LAN/DMZ/WAN.

```

---

## IV. OpenWrt — Serveur DHCP (dnsmasq)

**But :** faire en sorte que les hôtes du LAN (et éventuellement de la DMZ) reçoivent automatiquement leur configuration IP.

```bash
# DHCP sur LAN : pool .100 → .249 (si limit=150)
uci set dhcp.lan=dhcp
uci set dhcp.lan.interface='lan'
uci set dhcp.lan.start='100'
uci set dhcp.lan.limit='150'
uci set dhcp.lan.leasetime='12h'

uci commit dhcp
/etc/init.d/dnsmasq restart

# Pourquoi ces paramètres ?
# - start : premier numéro d’hôte attribué (ici .100)
# - limit : nombre de baux (100 → 100+150-1 = 249)
# - leasetime : durée de validité avant renouvellement

```

**Diagnostic rapide si un client ne reçoit pas d’IP :**

```bash
uci show dhcp.lan       # Vérifier la section existe et les valeurs
logread -e dnsmasq      # Voir si le serveur répond aux requêtes DHCP

```

---

## V. NAT / Masquerading (sortie Internet)

**Idée :** les IP privées ne sont pas routées sur Internet ; on les **NATe** (PAT/Masquerading) vers l’IP WAN. Sous fw4, c’est activé **par zone**.

```bash
# Zone WAN : NAT activé + politique restrictive côté entrée/forward
uci set firewall.wan=zone
uci set firewall.wan.name='wan'
uci set firewall.wan.network='wan'
uci set firewall.wan.input='REJECT'     # pas d'accès au routeur depuis Internet
uci set firewall.wan.output='ACCEPT'    # le routeur peut sortir
uci set firewall.wan.forward='REJECT'   # pas de forward par défaut
uci set firewall.wan.masq='1'           # NAT/PAT activé
uci set firewall.wan.mtu_fix='1'

uci commit firewall
/etc/init.d/firewall restart

# Effet concret :
# - Les flux autorisés vers la zone 'wan' seront réécrits avec l'IP WAN (PAT).
# - Le retour de trafic fonctionnera grâce au suivi d’état (stateful).

```

---

## VI. Politique firewall et forwards

**Deux approches** :

1. **Permissif** : on crée un forwarding `lan→wan` et tout le LAN sort.
2. **Restrictif (recommandé)** : on **supprime** le forwarding global et on autorise **cas par cas** via des “rules”.

### 1) Ouvrir tout LAN → WAN (mode permissif, à éviter si besoin de contrôle fin)

```bash
uci add firewall forwarding
uci set firewall.@forwarding[-1].src='lan'
uci set firewall.@forwarding[-1].dest='wan'

uci commit firewall
/etc/init.d/firewall restart

# Attention :
# - Cette ligne ouvre un "couloir" général LAN→WAN.
# - Toutes les machines du LAN auront Internet (si NAT actif).

```

### 2) Mode “deny-by-default” (fermer le couloir par défaut)

```bash
# On supprime le forwarding global LAN→WAN (adapter l’index si différent)
uci delete firewall.@forwarding[0]
uci commit firewall
/etc/init.d/firewall restart

# Résultat :
# - Sans forwarding, plus de transit inter-zones par défaut.
# - On doit ensuite "whitelister" explicitement les flux souhaités.

```

---

## VII. Whitelist : autoriser **une seule IP** à sortir sur Internet

**Objectif** : seule `192.168.1.119` a Internet ; les autres IP LAN sont bloquées.

**Pré-requis** :

- `wan.masq=1` (NAT actif)
- Aucun forwarding `lan→wan` résiduel

```bash
# Règle d’exception : accepter UNIQUEMENT cette IP en sortie vers la zone WAN
uci add firewall rule
uci set firewall.@rule[-1].name='Allow-192.168.1.119-to-wan'
uci set firewall.@rule[-1].src='lan'                  # trafic venant du LAN
uci set firewall.@rule[-1].src_ip='192.168.1.119/32'  # IP unique autorisée
uci set firewall.@rule[-1].dest='wan'                 # destination = zone WAN
uci set firewall.@rule[-1].proto='all'                # tous protocoles
uci set firewall.@rule[-1].family='ipv4'
uci set firewall.@rule[-1].target='ACCEPT'            # on autorise

uci commit firewall
/etc/init.d/firewall restart

# Lecture pédagogique :
# - L’absence de forwarding LAN→WAN bloque tout par défaut.
# - Cette rule crée une "porte ciblée" pour UNE IP précise.
# - Le NAT s’applique ensuite côté 'wan' (masq=1), rendant Internet accessible.

```

**Variante (web uniquement)** : limiter aux ports 80/443 pour cette IP.

```bash
uci add firewall rule
uci set firewall.@rule[-1].name='Allow-119-web-only'
uci set firewall.@rule[-1].src='lan'
uci set firewall.@rule[-1].src_ip='192.168.1.119/32'
uci set firewall.@rule[-1].dest='wan'
uci set firewall.@rule[-1].proto='tcp'
uci set firewall.@rule[-1].dest_port='80 443'
uci set firewall.@rule[-1].target='ACCEPT'

uci commit firewall
/etc/init.d/firewall restart

# Intention :
# - Autoriser la navigation web, mais rien d’autre (SSH sortant, jeux, etc. bloqués).

```

---

## VIII. “Established/Related” : pourquoi on en parle souvent ?

Le **pare-feu stateful** suit l’état des connexions. Une fois un flux **autorisé** à sortir, les paquets de **réponse** (état *ESTABLISHED/RELATED*) sont acceptés même si aucune règle explicite de retour n’est écrite.

Certains conservent une règle visible pour la pédagogie/traçabilité :

```bash
uci add firewall rule
uci set firewall.@rule[-1].name='Allow-Established-Related'
uci set firewall.@rule[-1].src='wan'
uci set firewall.@rule[-1].proto='all'
uci set firewall.@rule[-1].family='any'
uci set firewall.@rule[-1].target='ACCEPT'

uci commit firewall
/etc/init.d/firewall restart

# Remarque :
# - fw4/nftables gère déjà l’état ; cette règle explicite ne nuit pas
#   et rend la politique plus lisible lors d’un audit/formation.

```

---

## IX. Deux routeurs OpenWrt et deux DMZ — communication contrôlée

**Contexte** : on a deux sites/segments DMZ qui doivent communiquer **via deux routeurs** interconnectés (réseau de transit ou WAN simulé).

**Idée générale** :

- Chaque routeur connaît **la route** vers l’autre DMZ.
- On **n’ouvre** au firewall **que** les flux nécessaires (DMZ↔DMZ), pas de `lan↔wan` global.

### 1) Exemple d’adressage (à adapter)

- R1-LAN : `192.168.10.1/24`
- R1-DMZ : `192.168.20.1/24`
- R2-LAN : `192.168.30.1/24`
- R2-DMZ : `192.168.40.1/24`
- Transit R1↔R2 : `172.16.0.1/24` (R1) ↔ `172.16.0.2/24` (R2)

### 2) Routes statiques (chaque routeur apprend l’autre DMZ)

Sur **R1** (vers DMZ2 via l’IP de R2 sur le transit) :

```bash
uci add network.route
uci set network.@route[-1].target='192.168.40.0'
uci set network.@route[-1].netmask='255.255.255.0'
uci set network.@route[-1].gateway='172.16.0.2'

uci commit network
/etc/init.d/network restart

# Lecture :
# - "Pour joindre 192.168.40.0/24, passe par 172.16.0.2 (R2)".

```

Sur **R2** (vers DMZ1 via l’IP de R1 sur le transit) :

```bash
uci add network.route
uci set network.@route[-1].target='192.168.20.0'
uci set network.@route[-1].netmask='255.255.255.0'
uci set network.@route[-1].gateway='172.16.0.1'

uci commit network
/etc/init.d/network restart

```

### 3) Firewall — ouvrir strictement DMZ↔DMZ

Sur **R1** :

```bash
# DMZ1 → DMZ2 (en "traversant" la zone WAN/transit)
uci add firewall rule
uci set firewall.@rule[-1].name='DMZ1_to_DMZ2'
uci set firewall.@rule[-1].src='dmz'                  # flux originaires de DMZ1
uci set firewall.@rule[-1].dest='wan'                 # passent par la zone WAN/transit
uci set firewall.@rule[-1].dest_ip='192.168.40.0/24'  # uniquement vers DMZ2
uci set firewall.@rule[-1].proto='all'
uci set firewall.@rule[-1].target='ACCEPT'

# Retour (et éventuels flux init depuis DMZ2) : WAN → DMZ1 si source=DMZ2
uci add firewall rule
uci set firewall.@rule[-1].name='WAN_to_DMZ1_from_DMZ2'
uci set firewall.@rule[-1].src='wan'
uci set firewall.@rule[-1].dest='dmz'
uci set firewall.@rule[-1].src_ip='192.168.40.0/24'   # seulement si l'origine est DMZ2
uci set firewall.@rule[-1].dest_ip='192.168.20.0/24'  # et la destination DMZ1
uci set firewall.@rule[-1].proto='all'
uci set firewall.@rule[-1].target='ACCEPT'

uci commit firewall
/etc/init.d/firewall restart

# Intention :
# - N'autoriser QUE les flux DMZ↔DMZ explicitement.
# - Ne rien ouvrir pour LAN↔DMZ ni LAN↔WAN, sauf besoin spécifique.

```

Sur **R2**, on applique la **même logique**, en inversant DMZ1/DMZ2.

**Pourquoi deux règles ?**

- La première autorise **DMZ1→DMZ2** (trafic sortant de R1 vers le transit).
- La seconde autorise le **retour et/ou l’init** depuis DMZ2 vers DMZ1 à l’arrivée (contrôle fin sur la destination).

---

## X. Vérifications et introspection (après chaque étape clé)

Ces vérifications permettent d’isoler rapidement le palier fautif.

```bash
# Côté OpenWrt (adressage / routage)
ip addr show                      # Les interfaces ont-elles les bonnes IP ?
ip route                          # Default route présente ? Routes statiques OK ?

# Côté pare-feu (nftables générées par fw4)
fw4 print                         # Lire les chaînes/règles effectivement actives

# Côté services IP
logread -e dnsmasq                # Attributions DHCP ? Erreurs de config ?
logread -e firewall               # Règles qui matchent / rejets visibles

# Côté Debian (client)
ip a                              # IPv4 obtenue ? Pas seulement fe80:: ?
ip route                          # default via 192.168.1.1 ?
ping -c 2 192.168.1.1             # Lien LAN ok
ping -c 2 8.8.8.8                 # NAT/Sortie ok (si autorisée)
ping -c 2 google.com              # DNS ok

```

---
[← Module précédent](M06_equipements-reseau.md)
---
