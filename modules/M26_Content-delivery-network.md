---
titre: Content Delivery Network
type: module
jour: 26
ordre: 2
tags: infrastructure, stockage, cloud, devops
---

# 🧩 **Cours simplifié & structuré : Content Delivery Network (CDN)**

*Version pédagogique – Moins de schémas, plus de contexte, plus de tableaux*

---

# 1️⃣ Contexte : Pourquoi un CDN ?

Un **CDN (Content Delivery Network)** est un réseau mondial de serveurs permettant de diffuser des contenus **au plus proche** des utilisateurs.

Il résout quatre problèmes majeurs d’une architecture centralisée :

| Problème sans CDN | Impact |
| --- | --- |
| Latence élevée | Pages lentes, mauvaise UX |
| Scalabilité limitée | Risque de saturation |
| Coût élevé de bande passante | Explosion du trafic sur le serveur d'origine |
| Vulnérabilité aux attaques | DDoS facile, pas de protection frontale |

---

# 2️⃣ Latence : l’utilisateur est trop loin du serveur central

### Sans CDN

Tout le monde contacte **le même serveur** :

```
Utilisateur (Tokyo) → Serveur (Paris)
=> Long trajet => Latence élevée

```

### Avec CDN

L’utilisateur contacte un **serveur proche (PoP)** :

```
Utilisateur (Tokyo) → PoP Tokyo → Origin Paris (si nécessaire)
=> Charge plus rapide

```

➡️ Résultat :

Le contenu statique (images, vidéos, CSS, HTML…) est servi **beaucoup plus vite**.

---

# 3️⃣ Scalabilité : absorber plus d’utilisateurs, sans exploser les serveurs

Sans CDN, ton backend doit gérer toutes les requêtes :

- utilisation du CPU,
- utilisation du réseau,
- montée en charge,
- infrastructure complexe (load balancer + serveurs multi-région).

Avec CDN :

Les serveurs CDN absorbent **80 à 95% du trafic statique**, parfois plus.

Exemple :

- Ton site reçoit 100 000 visiteurs.
- Sans CDN → ton serveur voit 100 000 requêtes.
- Avec CDN → ton serveur voit peut-être 5 000 requêtes seulement.

➡️ Le CDN **multiplie ta scalabilité** sans que tu ajoutes des serveurs.

---

# 4️⃣ Bande passante : réduire la facture et les goulots d’étranglement

Sans CDN :

- Chaque image, CSS, JS, vidéo est envoyée par ton serveur.
- Cela **consomme énormément de bande passante** sur ton origin.

Avec CDN :

- Les contenus statiques sont **cachés** dans les PoP.
- Ton serveur renvoie le fichier une seule fois par région, puis le PoP le ressert.

Exemple concret :

> Ton site sert un fichier 30 MB (vidéo courte).
> 
> 
> Sans CDN → 1 000 vues = 30 GB sortants depuis ton origin.
> 
> Avec CDN → origin envoie 30 MB, puis les PoP envoient le reste.
> 

➡️ Moins de bande passante sortante → **moins de coûts**.

---

# 5️⃣ Sécurité : protéger ton backend et absorber les attaques

Les CDN modernes intègrent :

| Fonction | Rôle |
| --- | --- |
| Protections DDoS | Absorbent les attaques via tout le réseau CDN |
| WAF (Web Application Firewall) | Bloque injections, bots, scans |
| TLS/SSL front-end | Chiffrement terminé dès le PoP, plus rapide et centralisé |

Exemple d’attaque DDoS sans CDN :

```
Bots → ton serveur → crash

```

Avec CDN :

```
Bots → réseau CDN → filtrage / absorption → origin protégé

```

➡️ Le CDN est un **bouclier devant ton origin**.

---

# 6️⃣ Fonctionnement d’un CDN (explication simple)

## 🔹 6.1 Chemin d’une requête : logique du cache

### Première visite (cache froid)

```
1. Utilisateur → PoP local
2. PoP n’a pas le fichier → va le chercher à l’origine
3. Origin renvoie le fichier
4. PoP le stocke en cache
5. PoP le renvoie à l’utilisateur

```

### Visites suivantes (cache chaud)

```
Utilisateur → PoP
PoP a déjà le fichier → réponse immédiate

```

➡️ Gros gain de performance à partir de la 2e requête.

---

## 🔹 6.2 Points de Présence (PoPs)

Voici un mini tableau pour visualiser :

| Région | PoP possible |
| --- | --- |
| Europe | Paris, Francfort, Londres, Madrid |
| Amérique | Virginie, New York, Toronto, São Paulo |
| Asie | Tokyo, Mumbai, Singapour, Séoul |

Chaque PoP contient :

- un petit cluster de serveurs,
- un cache local,
- un système de routage intelligent.

---

## 🔹 6.3 Routage intelligent (Anycast)

Un CDN utilise souvent des **IP Anycast**, ce qui signifie :

- une seule IP mondiale,
- mais le trafic est envoyé au **PoP le plus proche géographiquement** ou en fonction de la charge réseau.

Exemple simple :

```
Client en France  → PoP Paris
Client en Espagne → PoP Madrid
Client au Brésil  → PoP São Paulo

```

---

# 7️⃣ Caching et optimisation

Les CDN ne se limitent pas à stocker les fichiers :

ils **optimisent la transmission**.

## 🔹 7.1 Compression & minification

| Type d’optimisation | Effet |
| --- | --- |
| gzip / Brotli | Fichiers plus légers |
| Minification | Nettoyage CSS/JS/HTML |
| Header Cache-Control | Gestion fine du TTL |

Exemple :

> Un fichier JS de 300 kB peut descendre à 80 kB grâce à la compression Brotli.
> 

---

## 🔹 7.2 Optimisation d’images

Les CDN peuvent :

- redimensionner à la volée,
- convertir en formats plus légers (WebP, AVIF),
- adapter la qualité selon l’écran.

Scénario :

> Utilisateur mobile → image servie automatiquement en 720px plutôt qu’en 4K.
> 

---

## 🔹 7.3 Streaming adaptatif (HLS / DASH)

Pour la vidéo, le CDN choisit une qualité adaptée à la bande passante :

| Bande passante | Qualité vidéo |
| --- | --- |
| Faible | 480p |
| Moyenne | 720p |
| Bonne | 1080p |
| Très bonne | 4K |

Ce mécanisme empêche les vidéos de saccader.

---

# 8️⃣ Tableaux de synthèse

## 📌 Avantages d’un CDN

| Avantage | Explication |
| --- | --- |
| 🔥 Performance | Latence réduite grâce aux PoP |
| 📦 Décharge de l’origin | Beaucoup moins de requêtes sur ton backend |
| 💸 Réduction des coûts | Moins de bande passante sortante origin |
| 🔐 Sécurité | WAF, DDoS, certificats SSL |
| 🌍 Scalabilité mondiale | Réponse rapide dans tous les pays |
| 🚀 Optimisations | Compression, resizing, minification |

---

## 📌 Quand utiliser un CDN ?

| Type d’application | CDN recommandé ? | Pourquoi |
| --- | --- | --- |
| Site statique / SPA | ✅ Oui | Parfait pour cache et accélération |
| Site e-commerce | ✅ Oui | Scalabilité + sécurité |
| API dynamique | ⚠️ Partiellement | CDN gère sécurité + TLS, pas le cache |
| Streaming vidéo | ✅ Oui | Adaptation dynamique |
| Intranet en LAN | ❌ Non | Aucun gain géographique |

---

# 🎯 Conclusion

Un CDN est une **brique essentielle** dans une architecture moderne :

- il accélère ton site pour tous les utilisateurs du monde,
- il réduit les coûts d’exploitation,
- il protège ton backend,
- il optimise le contenu automatiquement,
- il rend ton application scalable même en cas de pics massifs.

C’est pourquoi tous les grands acteurs (Netflix, Amazon, YouTube, Twitch, Shopify…) reposent sur des CDN mondiaux.

---
[← Module précédent](M26_aws-storage.md) | [Module suivant →](M26_quizz_aws_storage copy.md)
---
