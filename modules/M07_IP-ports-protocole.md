---
title: Adresse IP, port & protocole.
type: module
jour: 07
ordre: 1
tags: network
---

## 1) Modèle OSI (7 couches) — la carte mentale du réseau

| Couche | Rôle | Exemples d’objets/protos | Outils de diag |
| --- | --- | --- | --- |
| **7. Application** | Ce que voient les applis | HTTP(S), SMTP, DNS, FTP, SSH, RDP | `curl`, navigateur, client mail |
| **6. Présentation** | Format/encodage/chiffrement | TLS/SSL, JSON, JPEG, gzip, base64 | openssl, wireshark (TLS handshake) |
| **5. Session** | Ouvre/maintient la session | Sessions TLS, RPC, WebSocket | traces app, timeout |
| **4. Transport** | Fiabilité/ports/flux | **TCP**, **UDP**, QUIC | `netstat`/`ss`, `iperf`, `nc` |
| **3. Réseau** | Routage/adressage logique | **IP**, ICMP, OSPF/BGP | `ping`, `traceroute`, `ip route` |
| **2. Liaison de données** | Trames locales + MAC | **Ethernet**, Wi-Fi (802.11), VLAN, ARP | `arp -a`, switch, capture frame |
| **1. Physique** | Bits, signaux, support | Câble RJ45/FO, Wi-Fi radio, modules SFP | testeur câble, LEDs, link up |

**À retenir**

- **Physique/Liaison/Réseau (L1–L3)** : “plomberie” du réseau (câbles/trames/paquets).
- **Transport (L4)** : fiabilité + **ports**.
- **Application (L5–L7)** : où vivent tes protocoles “métier” (HTTP, SMTP, DNS…).

**Mapping pratique TCP/IP**

- OSI 5–7 ≈ **Application** (HTTP, TLS, DNS…)
- OSI 4 ≈ **Transport** (TCP/UDP)
- OSI 3 ≈ **Internet** (IP, ICMP)
- OSI 1–2 ≈ **Accès réseau** (Ethernet/Wi-Fi)

**Cloud**

En IaaS/PaaS, le provider te “masque” surtout **L1–L2 (et partiellement L3)**. Toi tu gères surtout **L3–L7** (IP, firewall, ports, DNS, TLS, applis).

---

## 2) Adresses IP : IPv4 & IPv6

### IPv4 (32 bits)

- Forme : `a.b.c.d` (0–255). Ex : `192.168.1.10`.
- **Privées (RFC1918)** : `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`.
- **Spéciales** :
    - Loopback `127.0.0.1`,
    - Lien local **APIPA** `169.254.0.0/16` (DHCP HS),
    - Réseau `x.x.x.0`, Broadcast `x.x.x.255` (selon masque).
- **NAT/PAT** : traduit tes IP privées en IP publique à la sortie Internet.

### IPv6 (128 bits)

- Forme : 8 blocs hexadécimaux : `2001:db8:85a3:0000:0000:8a2e:0370:7334`.
    
    Raccourcis : `::` (suite de 0), `0012` → `12`. Ex : `2001:db8::8a2e:370:7334`.
    
- Types courants :
    - **Global unicast** `2000::/3` (publique),
    - **Unique local** `fc00::/7` (privé interne),
    - **Link-local** `fe80::/10` (obligatoire sur interface).
- **Pas de NAT** en principe ; routage de bout en bout, **SLAAC**/DHCPv6.

**Maison vs Entreprise**

- **Maison** : `192.168.0.0/24`, box fait **DHCP + NAT + Wi-Fi**.
- **Entreprise** : plages privées plus larges (ex `10.0.0.0/8`), **VLAN**, **routes**, **pare-feu**, **DMZ**, **IPv6 dual-stack** de plus en plus.

---

## 3) Masque de sous-réseau & CIDR (vital)

Le **masque** sépare **réseau** / **hôtes**. Notation **CIDR** : `/n` = nb de bits réseau.

Exemples rapides :

- `/24` → 255.255.255.0 → **256 adresses** (254 utilisables).
    
    Réseau `192.168.1.0`, broadcast `192.168.1.255`.
    
- `/26` → 255.255.255.192 → **64 adresses** par sous-réseau (62 utilisables).
    
    Plages : `192.168.1.0–63`, `64–127`, `128–191`, `192–255`.
    

**Méthode pas à pas (ex `/26`)**

1. **Taille bloc** = `2^(32−26) = 64`.
2. **Incréments** par 64 : 0, 64, 128, 192.
3. Si ton IP = `192.168.1.77`, elle tombe dans `192.168.1.64/26`.
    - Réseau = `.64`
    - Broadcast = `.127`
    - Hôtes = `.65` à `.126`.

**Gateway/routeur** : souvent `.1` ou `.254`, **mais ce n’est pas une règle** — c’est un **choix** d’admin.

**Rappels**

- IP **réseau** et **broadcast** ne sont pas attribuables aux hôtes (en IPv4 traditionnel).
- On “retire” aussi les IP réservées à des équipements (passerelle, etc.) **par convention**, pas par obligation du protocole.

---

## 4) Ports & Transport (TCP/UDP)

- **Port** = “porte logique” sur une machine.
- **TCP** (fiable, orienté connexion) vs **UDP** (léger, pas d’acquittement).
- **Plages** :
    - 0–1023 = **Well-known** (root/admin),
    - 1024–49151 = **Registered**,
    - 49152–65535 = **Éphémères** (clients).

**Ports/protocoles classiques (à connaître)**

- **Web** : 80 (HTTP), **443 (HTTPS)**, 8080 (alt)
- **SSH** : 22
- **FTP** : 21 (control) + 20 (data, actif)
- **DNS** : 53 (UDP/TCP)
- **Mail** : 25 (SMTP), 587 (Submission), 110 (POP3), 143 (IMAP), 993/995 (TLS)
- **RDP** : 3389, **VNC** : 5900
- **NTP** : 123 (UDP)
- **SMB/CIFS** : 445 (Windows share), 139
- **DHCP** : 67 (srv), 68 (client)
- **LDAP/LDAPS** : 389/636

**Entreprise** : on filtre ces ports au pare-feu, on **n’expose** que le nécessaire, on utilise du **TLS** partout (443/STARTTLS), **VPN** pour l’interne.

---

## 5) Protocoles applicatifs essentiels

### DNS — “l’annuaire” d’Internet

- Convertit **nom** ⇄ **IP**.
- **Types d’enregistrements** : A/AAAA, **CNAME**, **MX**, **TXT**, **NS**, SRV.
- **Résolveur** (cache) → **Racine** → **TLD** → **Autoritaire**.
- Outils : `nslookup`, `dig`, TTL et propagation.

### DHCP — “donne l’adresse automatiquement”

- Cycle **DORA** : Discover → Offer → Request → Acknowledge.
- Fournit : IP, masque, **gateway**, DNS, durée du bail.
- Maison : box = serveur DHCP, Entreprise : serveurs dédiés + réservations MAC.

### HTTP/TLS

- HTTP/1.1, HTTP/2, HTTP/3 (QUIC/UDP).
- TLS chiffre (certificats, chaîne de confiance).
- Outils : `curl -I`, `openssl s_client -connect host:443`.

### SMTP/IMAP/POP

- **MX** oriente l’e-mail vers le serveur de réception.
- Auth/crypto : 587 + STARTTLS, 993/995 pour IMAPS/POP3S.

---

## 6) NAT, PAT, Firewall, VLAN — l’hygiène réseau

- **NAT (IPv4)** : traduit IP privées ↔ IP publique.
- **PAT** : multiplexe **plusieurs clients** sur 1 IP publique avec **différents ports source**.
- **Firewall stateful** : suit l’état des connexions, applique des **ACL** (allow/deny).
- **Port-forwarding** (maison) : expose un service interne vers Internet (à éviter si possible → préférer VPN).
- **VLAN (802.1Q)** : segmentation L2 (ex : `VLAN10=Users`, `VLAN20=Servers`, `VLAN30=Guest`).

---

## 7) Scénarios concrets

### Chez un particulier

- **Topo** : Box FAI (NAT/DHCP/Wi-Fi) → PC/Smartphone/TV.
- **Adressage** : `192.168.1.0/24`, DHCP en `.100–.199`.
- **DNS** : résolveur de la box (ou Cloudflare 1.1.1.1).
- **Cas** : Jeu en ligne → **ouverture de port**/UPnP ; Caméra IP → préférer **accès cloud**/VPN, pas d’ouverture 80/554 au monde.

### En entreprise (petit site)

- **VLAN** : 10=Users `10.10.10.0/24`, 20=Servers `10.10.20.0/24`, 30=Guest `10.10.30.0/24`.
- **Pare-feu** : Internet ↔ **DMZ** (reverse proxy 443) ↔ LAN (bases de données port 5432 autorisé depuis DMZ uniquement).
- **DNS** interne + externe, **DHCP** central, **Wi-Fi invité** isolé, **SIEM**/logs.
- **Cloud** : front web en PaaS, DB managée (port fermé à Internet, **Private Link/VPN**).

---

## 8) Méthode de **dépannage par couches** (très utile)

1. **L1 Physique** : lien up ? câble/SSID/puissance Wi-Fi ok ? LED ?
2. **L2 Liaison** : MAC/ARP ? `arp -a`, switch voit la MAC ? VLAN correct ?
3. **L3 Réseau** : IP/masque/gateway ? `ipconfig`/`ip a`. `ping` gateway → ok ?
4. **L3/L4** : `traceroute` vers Internet ; **firewall** bloque ?
5. **L4** : port ouvert ? `nc -vz host 443` / `Test-NetConnection`.
6. **L7** : DNS résout ? `nslookup`; HTTP répond ? `curl -I https://site`.

---

## 9) Exemples **CIDR** (entraînement)

- **/24** : 256 adresses → 254 hôtes (`.1–.254`)
- **/25** : 128 adresses → 126 hôtes (deux sous-réseaux `/25` dans un `/24`)
- **/26** : 64 adresses → 62 hôtes (quatre `/26` dans un `/24`)
- **/30** : 4 adresses → 2 hôtes (liaisons point-à-point)
- **/32** : 1 adresse (route d’hôte)

**Mini-exos**

1. Dans `192.168.10.0/26`, donne **réseau**, **broadcast**, **plage hôtes**.
2. Quelle taille pour 50 hôtes ? (**/26** convient : 62 hôtes).
3. Où tombe `10.1.3.77` dans un **/20** ? (taille bloc 4096 IP → début `10.1.0.0`, fin `10.1.15.255`).

---

## 10) Check-list sécurité rapide

- Expose **443** seulement, redirige 80→443.
- Mails : **587** (auth), **DMARC/DKIM/SPF**.
- **Pas** d’admin RDP/SSH exposé ; passerelle **VPN**.
- **DNS** : n’expose pas ton DNS récursif interne.
- **Logs** : garde Netflow/connexions rejetées ; surveille.
- **MAJ** régulières (OS, firmwares, TLS).

---

## 11) Outils utiles (Windows/Linux)

- IP : `ipconfig` / `ifconfig` / `ip a`
- Routes : `route print` / `ip route`
- Ping/Trace : `ping`, `tracert` / `traceroute`
- Ports : `netstat -ano` / `ss -lntup`
- Test port : `Test-NetConnection -ComputerName host -Port 443` / `nc -vz host 443`
- DNS : `nslookup`, `dig`
- HTTP : `curl -I https://site`
- Perf : `iperf3 -c host`

---
[Module suivant →](M07_observation-reseau.md)
---
