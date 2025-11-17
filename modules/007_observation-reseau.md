---
titre: Mise en place & observation réseau
type: module
jour: 07
ordre: 2
tags: network, security, linux
---

# Cours applicatif : Mise en place & observation réseau (OpenWrt, Debian, Nmap, FTP, cURL, tcpdump)

## 0) Contexte & prérequis

**Objectif global :** déployer un petit réseau fonctionnel (routeur OpenWrt + Debian), distribuer des adresses via DHCP, valider l’accès réseau/Internet, puis **observer et auditer** (Nmap, cURL, tcpdump).

**Topologie type (GNS3) :**

```
[ Debian-Client ] --(LAN)--> [ OpenWrt ] --(WAN/Cloud)--> [ Internet ]

```

- LAN (ex.) : 192.168.1.0/24
- Passerelle LAN : 192.168.1.1 (IP de l’OpenWrt côté LAN)
- DHCP fourni par OpenWrt (dnsmasq)

**Rappels pratiques :**

- Identifier les interfaces sur OpenWrt : `ip a` (souvent `eth0`=WAN, `br-lan`=LAN).
- Après chaque série de `uci set`, faire `uci commit <module>` puis **redémarrer** le service concerné.

---

## 1) Serveur/Routeur (OpenWrt) : IP LAN + DHCP + politique firewall de base

### 1.1 Configurer l’IP LAN (point d’ancrage pour les clients)

> But : donner au routeur une IP fixe sur le LAN (passerelle des clients).
> 

```bash
uci set network.lan.ipaddr='192.168.1.1'          # IP de la passerelle LAN
uci set network.lan.netmask='255.255.255.0'       # /24
uci commit network
/etc/init.d/network restart

```

**À savoir :**

- Si votre LAN est bridge (`br-lan`), l’IP s’applique au bridge (OK).
- Si vous utilisez une interface « physique » dédiée (ex. `eth1`), définissez-la dans `network.lan.ifname`.

---

### 1.2 Activer/paramétrer le DHCP (dnsmasq)

> But : attribuer automatiquement IP/masque/passerelle/DNS aux clients.
> 

```bash
uci set dhcp.lan.start='100'     # pool : .100 → .249 (si limit=150)
uci set dhcp.lan.limit='150'
uci set dhcp.lan.leasetime='12h'
uci commit dhcp
/etc/init.d/dnsmasq restart

```

**Bon réflexe diagnostic :**

```bash
uci show dhcp.lan            # vérifier la section
logread -e dnsmasq           # voir si des baux sont délivrés

```

---

### 1.3 Firewall : laisser passer les retours (Established/Related)

> But : firewall « stateful » — on autorise implicitement les retours de connexions permises.
> 

```bash
uci add firewall rule
uci set firewall.@rule[-1]=rule
uci set firewall.@rule[-1].name='Allow-Established-Related'
uci set firewall.@rule[-1].src='wan'
uci set firewall.@rule[-1].proto='all'
uci set firewall.@rule[-1].target='ACCEPT'
uci set firewall.@rule[-1].family='any'
uci set firewall.@rule[-1].enabled='1'
uci commit firewall
service firewall restart

```

**Remarque :**

- fw4/nftables gère déjà l’état ; cette règle rend la politique explicite et lisible.
- Politique par défaut recommandée : **deny-by-default** entre zones et exceptions ciblées.

---

### 1.4 IPv6 WAN : requête de préfixe + DNS externes

> But : activer la delegation IPv6 (PD) et forcer des DNS IPv6 publics si besoin.
> 

```bash
uci set network.wan6.reqprefix='auto'                 # demander un préfixe (PD) à l’amont
uci set network.wan6.reqaddress='try'                 # tenter une GUA (IPv6 globale) sur wan6
uci set network.wan6.peerdns='0'                      # ne pas utiliser les DNS du FAI
uci add_list network.wan6.dns='2001:4860:4860::8888'  # Google DNS v6
uci add_list network.wan6.dns='2001:4860:4860::8844'
uci commit network
service network restart

```

**Astuce :**

- Pour IPv4, vous pouvez aussi forcer des DNS sur `network.wan.dns='1.1.1.1 8.8.8.8'`.

---

## 2) Client (Debian) : obtenir l’IP en DHCP et valider

### 2.1 Configurer l’interface en DHCP (ifupdown)

> But : dire au client « demande ton IP au serveur DHCP ».
> 

```bash
sudo nano /etc/network/interfaces

# --- activer DHCP IPv4 sur l’interface (ex. ens4)
auto ens4
iface ens4 inet dhcp

sudo systemctl restart networking

```

### 2.2 Vérifier l’adressage et la route par défaut

```bash
ip a              # doit montrer "inet 192.168.1.X/24" (pas seulement fe80::)
ip route          # doit montrer "default via 192.168.1.1 dev ens4"

```

### 2.3 Tests de base (connectivité, puis DNS)

```bash
ping -c 4 192.168.1.1      # routeur
ping -c 4 8.8.8.8          # Internet IP si sortie autorisée
ping -c 4 google.com       # DNS

```

**Si vous ne voyez qu’une IPv6 (fe80::/link-local) :**

- Le client **n’a pas reçu** d’IPv4 → vérifier `dnsmasq`, câblage, VLAN, etc.

---

## 3) Nmap : découverte et audit des services

### 3.1 Installation

```bash
sudo apt update && sudo apt install nmap -y

```

### 3.2 Scans utiles (avec intentions claires)

- **Ports ouverts (par défaut, TCP connus) :**
    
    ```bash
    nmap <IP_cible>
    
    ```
    
- **Versions des services (bannières) :**
    
    ```bash
    nmap -sV <IP_cible>
    
    ```
    
- **Scan agressif (OS, scripts par défaut, traceroute) :**
    
    ```bash
    nmap -A <IP_cible>
    
    ```
    
- **Plage de ports précise :**
    
    ```bash
    nmap -p 20-100 <IP_cible>
    
    ```
    
- **Mode plus lent/discret (timer T2) :**
    
    ```bash
    nmap -T2 <IP_cible>
    
    ```
    

**Exemples d’entraînement (attention au périmètre légal !) :**

- DNS Google : `nmap 8.8.8.8`
- SMTP Microsoft : `nmap -sV smtp.office365.com`

**Compléments utiles :**

- **Ping sweep** d’un LAN : `nmap -sn 192.168.1.0/24`
- **UDP** (plus lent) : `nmap -sU <IP>`
- **Sortie en format** : `nmap -oN result.txt -oX result.xml <IP>`

**Bonnes pratiques :**

- Scanner **uniquement** ce que vous êtes autorisé à scanner.
- Conserver des **rapports** (date, cible, options) pour comparer dans le temps.

---

## 4) FTP (client) : manipulation simple et rappels sécurité

### 4.1 Installer le client FTP

```bash
sudo apt update && sudo apt install ftp -y

```

### 4.2 Session type

```
ftp -A 192.168.1.X         # -A = anonymous login si le serveur le permet
Name: <votre_user>         # ou "anonymous" selon la config serveur
Password: <motdepasse>

ftp> ls                     # lister le contenu
ftp> get test.txt           # rapatrier un fichier
ftp> !ls                    # exécuter une commande locale (shell)
ftp> put hello.txt          # envoyer un fichier
ftp> bye

```

**Côté serveur Debian :** droits d’écriture sur le répertoire cible

```bash
cd /home
sudo chmod u+w lacapsule

```

**Sécurité :**

- FTP **en clair** (mots de passe inclus) → préférez **SFTP** (via SSH) ou **FTPS**.
- Limiter les droits, cloisonner les users, éviter l’anonymous si non nécessaire.

**Alternatives modernes :**

- SFTP : `sftp user@192.168.1.X`
- SCP : `scp fichier user@192.168.1.X:/chemin/`

---

## 5) cURL : test HTTP/HTTPS (côté client)

### 5.1 Requêtes de base

```bash
curl http://192.168.1.X:80     # tester un serveur web sur un port explicite
curl http://192.168.1.X        # :80 implicite
curl -v http://192.168.1.X     # verbosité (entêtes, handshake)
curl -I http://192.168.1.X     # HEAD seulement (entêtes de réponse)

```

### 5.2 Quelques options utiles

```bash
curl -k https://192.168.1.X         # ignorer certif invalide (lab)
curl -L http://site/test            # suivre redirections
curl -H "Host: exemple.local" http://IP # tester un vhost
curl --resolve exemple.local:443:IP https://exemple.local  # forcer IP/DNS

```

**Astuce rapide serveur HTTP (test) :**

```bash
# sur Debian, dans un dossier contenant index.html
python3 -m http.server 8080
# puis : curl http://<ip>:8080

```

---

## 6) tcpdump (sur le routeur OpenWrt) : observer le trafic

### 6.1 Installation

```bash
opkg update
opkg install tcpdump
tcpdump --version

```

### 6.2 Choisir la bonne interface

```bash
ip a
# Typiquement : eth0/eth1/pppoe-wan côté WAN, br-lan côté LAN

```

### 6.3 Captures typiques

```bash
# HTTPS sortant sur le WAN (trafic chiffré, observation des flux)
tcpdump -i eth1 -n port 443

# DNS
tcpdump -i br-lan -n port 53

# ICMP (ping)
tcpdump -i br-lan -n icmp

# Filtrer une IP source/dest
tcpdump -i eth1 -n host 8.8.8.8

# Écrire en pcap (analyse ultérieure Wireshark)
tcpdump -i eth1 -n -w capture_internet.pcap

```

- `Ctrl + C` pour arrêter
- Analyser ensuite avec Wireshark

**Lecture :**

- HTTP (80) en clair → contenu visible
- HTTPS (443) chiffré → on voit les **entêtes réseau** (SNI, tailles), pas le contenu

---

## 7) Ajouts utiles & commandes de terrain

### 7.1 Vérifications rapides (Linux)

```bash
ip a                   # adresses des interfaces
ip route               # table de routage
ss -tulpen             # sockets ouverts (remplace netstat)
dig A google.com +short  # résolution DNS (paquet: dnsutils)
arp -n                 # cache ARP
ip neigh               # voisins L2
traceroute 8.8.8.8     # chemin réseau (paquet: traceroute)

```

### 7.2 OpenWrt (fw4/nftables)

```bash
fw4 print              # règles nftables générées depuis UCI
logread -e firewall    # logs firewall
logread -e dnsmasq     # logs DHCP/DNS
opkg list-installed    # paquets présents
opkg search <fichier>  # trouver le paquet qui fournit un binaire

```

### 7.3 Pare-feu minimal nftables (Linux « nu »)

> Utile si vous jouez un rôle de routeur Linux hors OpenWrt.
> 

```bash
# Table & chaînes avec politiques strictes
sudo nft add table inet filter
sudo nft add chain inet filter INPUT  { type filter hook input priority 0; policy drop; }
sudo nft add chain inet filter FORWARD{ type filter hook forward priority 0; policy drop; }
sudo nft add chain inet filter OUTPUT { type filter hook output priority 0; policy accept; }

# Autorisations de base
sudo nft add rule inet filter INPUT iif "lo" accept
sudo nft add rule inet filter INPUT ct state established,related accept
sudo nft add rule inet filter FORWARD ct state established,related accept

# Exemple : autoriser UNE IP LAN à sortir via eth0 (WAN)
sudo nft add rule inet filter FORWARD ip saddr 192.168.1.119 oifname "eth0" accept

```

### 7.4 Services & journaux (Debian)

```bash
systemctl status networking
journalctl -u networking -e
journalctl -u dnsmasq -e
journalctl -u ssh -e

```

---
[← Module précédent](007_IP-ports-protocole.md)
---

---
[← Module précédent](007_IP-ports-protocole.md)
---

---
[← Module précédent](007_IP-ports-protocole.md)
---

---
[← Module précédent](007_IP-ports-protocole.md)
---

---
[← Module précédent](007_IP-ports-protocole.md)
---

---
[← Module précédent](007_IP-ports-protocole.md)
---

---
[← Module précédent](007_IP-ports-protocole.md)
---
