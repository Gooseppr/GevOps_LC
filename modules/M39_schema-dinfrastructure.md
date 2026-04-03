---
title: Schémas d’infrastructure
sujet: Gestion de projet
type: module
jour: 39
ordre: 1
tags: schema, architecture, mermaid, draw.io, devops
---

# 🧭 Schémas d’infrastructure — Du macro au micro

## 1. 🎯 Objectifs du module

À la fin de ce module, tu seras capable de :

- Comprendre **ce qu’est un schéma d’infrastructure** et pourquoi il est indispensable dans un projet technique.
- Distinguer les **3 niveaux de schéma** : macro, méso, micro, et savoir à quel public ils s’adressent.
- Identifier les **composants clés** d’une architecture moderne : utilisateurs, applications, bases de données, réseau, sécurité, outils tiers.
- Construire des schémas **clairs et lisibles** à chaque niveau, avec le bon niveau de détail.
- Utiliser **Mermaid** (dans tes fichiers Markdown) et [**draw.io**](http://draw.io/) pour produire des schémas professionnels.
- Adapter tes schémas à ton **audience** (non-technique, développeurs, DevOps, jury) et anticiper les questions.

---

## 2. Pourquoi faire un schéma d’infrastructure ?

Un schéma d’infrastructure, c’est la **carte** de ton système :

- Au lieu de routes et de villes, tu montres :
    - des **utilisateurs**,
    - des **applications**,
    - des **serveurs**,
    - des **bases de données**,
    - des **services externes**,
    - et les **flux** entre eux.

### 2.1 Les bénéfices concrets

Un bon schéma :

- ✅ **Clarifie** les idées : tu vois d’un coup d’œil ce qui existe.
- ✅ **Aligne** tout le monde (dev, ops, chef de projet, client, jury).
- ✅ **Évite les oublis** : en dessinant, tu te rends compte de ce qui manque (logs, sécurité, sauvegardes…).
- ✅ **Aide à décider** : on voit où sont les faiblesses, les goulots d’étranglement.
- ✅ **Prépare la prod** : c’est une base pour planifier le déploiement et les responsabilités.

### 2.2 Pour qui ?

- Développeurs : comprendre où se branche leur code.
- DevOps / Ops : préparer le déploiement, la supervision, la sécurité.
- Chefs de projet / Product : suivre les flux fonctionnels.
- Clients / jury : comprendre le **fonctionnement global** sans lire du code.

> 💡 Retenir : un schéma n’est pas décoratif. C’est un outil de pilotage du projet.
> 

---

## 3. Les 3 niveaux de schéma : Macro, Méso, Micro

On va découper ta vision en **3 niveaux complémentaires**.

### 3.1 Vue d’ensemble des 3 niveaux

```mermaid
flowchart TD
  subgraph Macro["Schéma Macro 🟠"]
    M1[Vue d'ensemble<br/>Blocs fonctionnels]
  end

  subgraph Meso["Schéma Méso 🔵"]
    S1[Modules techniques<br/>API, services, BDD]
  end

  subgraph Micro["Schéma Micro 🟣"]
    U1[Déploiement réel<br/>VM, conteneurs, ports]
  end

  Macro --> Meso --> Micro
```
- **Macro** : raconte l’histoire de ton système pour un public large.
- **Méso** : zoom sur les **modules techniques**.
- **Micro** : détail du **déploiement réel**, adressé aux **DevOps / infra**.

### 3.2 À qui s’adresse chaque niveau ?

- 🟠 **Macro**
    
    Public : client, jury non-technique, management.
    
    Message : *« Voilà comment mon projet fonctionne, en gros. »*
    
- 🔵 **Méso**
    
    Public : développeurs, leads techniques.
    
    Message : *« Voilà comment on a découpé l’application et les services. »*
    
- 🟣 **Micro**
    
    Public : DevOps, SRE, cloud engineers.
    
    Message : *« Voilà ce qui tourne vraiment, où et comment. »*
    

---

## 4. Identifier les composants clés

Avant de dessiner, tu dois **faire l’inventaire** de ce qui existe.

### 4.1 Les acteurs humains

- Utilisateurs finaux (client, visiteur, étudiant…)
- Administrateurs (support, équipe interne)
- Systèmes clients (autres applis qui consomment ton API)

```mermaid
flowchart LR
  U[👤 Utilisateur] -->|Utilise| APP[Application]
  A[🛠️ Admin] -->|Supervise| BO[Back Office]
  S[🏢 Système externe] -->|API| API[(API publique)]

```

Ce petit graphe te sert de **point de départ** pour placer clairement qui utilise quoi.

---

### 4.2 Applications, services et APIs

- **Applications** : front web, appli mobile, dashboard interne…
- **Services** : authentification, facturation, notifications…
- **APIs** : points d’entrée standardisés (REST, gRPC…) pour communiquer.

```mermaid
flowchart LR
  U[Utilisateur] --> WEB[Frontend Web]
  MOB[Application mobile] --> API[API Gateway]
  WEB --> API
  API --> AUTH[Service Auth]
  API --> CORE[Service métier]
  CORE --> DB[(Base de données)]

```

Ce type de schéma sera souvent ton **schéma macro** initial.

---

### 4.3 Bases de données et stockage

- Bases de données relationnelles (PostgreSQL, MySQL…)
- Bases NoSQL (MongoDB, Redis…)
- Stockage de fichiers (S3, NAS, bucket objet…)

```mermaid
flowchart LR
  SVC[Service métier] -->|Lecture/Écriture| DB[(PostgreSQL)]
  SVC -->|Fichiers| S3[(Stockage objet)]

```

Le but est de rendre **visible** où vont les données, pour penser **sécurité** et **sauvegardes**.

---

### 4.4 Réseau, sécurité, VPN, DNS

- Zones réseau (Internet, DMZ, réseau privé…)
- DNS, certificats TLS, firewalls, VPN, bastion SSH…

```mermaid
flowchart LR
  Internet((🌐 Internet))
  subgraph DMZ["DMZ / Zone exposée"]
    LB[Load Balancer / Reverse Proxy]
  end
  subgraph Private["Réseau privé"]
    APP[Backend / API]
    DB[(Base de données)]
  end

  Internet -->|HTTPS + DNS| LB --> APP --> DB

```

Ici tu montres **les zones** et **les chemins** plutôt que tous les détails.

---

### 4.5 Outils tiers, SaaS, intégrations

```mermaid
flowchart LR
  APP[Backend] --> STRIPE[Stripe 💳]
  APP --> MAIL[Mail Provider ✉️]
  APP --> CRM[CRM client]

```

Important : bien montrer que ces services sont **externes** (limites de responsabilité, flux de données sortants).

---

## 5. Construire un schéma **Macro**

Le schéma macro = **vue d’ensemble** + **flux principaux**.

### 5.1 Vue d’ensemble

```mermaid
flowchart LR
  Client[Client] --> WEB[Site / App web]
  Admin[Admin] --> BO[Back Office]
  WEB --> API[Backend / API]
  BO --> API
  API --> DB[(Base de données)]
  API --> PAY[Service de paiement]

```

Ce schéma doit être :

- simple,
- lisible en **30 secondes**,
- montrable à quelqu’un de non technique.

### 5.2 Ajouter les flux principaux

Tu peux annoter les flèches pour raconter l’histoire :

```mermaid
flowchart LR
  Client[Client] -->|Commande produit| WEB[Frontend]
  WEB -->|Appel REST /api/orders| API[Backend]
  API -->|INSERT/SELECT| DB[(Base de données)]
  API -->|Création paiement| PAY[Stripe]

```

Chaque flèche = **une action lisible** : “commande produit”, “appel REST”, “lecture/écriture BDD”, etc.

### 5.3 Contextualiser le projet

Au-dessus ou en dessous du schéma, ajoute toujours 1 phrase :

> « Schéma macro d’un site e-commerce permettant à des clients de passer commande et à des admins de gérer le catalogue. »
> 

Ça ancre ton schéma dans **un cas réel**, ce que les jurys apprécient beaucoup.

---

## 6. Construire un schéma **Méso**

Le schéma méso = **zoom technique** : on passe de “Backend” à *comment il est organisé*.

### 6.1 Modules techniques internes

```mermaid
flowchart LR
  subgraph Frontend
    REACT[React App]
  end

  subgraph Backend
    API_GW[API Gateway]
    AUTH[Service Auth]
    ORDERS[Service Commandes]
    USERS[Service Utilisateurs]
  end

  subgraph Data
    DB_MAIN[(PostgreSQL)]
    CACHE[(Redis)]
  end

  REACT --> API_GW
  API_GW --> AUTH
  API_GW --> ORDERS --> DB_MAIN
  API_GW --> USERS --> DB_MAIN
  ORDERS --> CACHE

```

Ici tu montres :

- le **découpage par service**,
- comment ils s’appuient sur la BDD et le cache,
- le rôle de l’API Gateway.

### 6.2 Représenter les interactions et protocoles

```mermaid
flowchart LR
  CL[Client] -->|HTTPS| API_GW["API Gateway"]
  API_GW -->|HTTP REST| AUTH["Auth Service"]
  API_GW -->|HTTP REST| ORDERS["Orders Service"]
  ORDERS -->|SQL TCP 5432| DB["PostgreSQL"]
  API_GW -->|gRPC| INVENTORY["Service Stock"]
```

Tu peux indiquer :

- protocoles (`HTTPS`, `HTTP`, `gRPC`),
- ports (`TCP 5432`), si c’est utile,
- nature des flux (synchrone / asynchrone).

### 6.3 Choix d’infrastructure (cloud, on-prem, hybride)

```mermaid
flowchart LR
  subgraph Cloud["Cloud (AWS/Azure/GCP)"]
    LB[Load Balancer]
    subgraph Cluster["Cluster de services"]
      API_GW
      AUTH
      ORDERS
      USERS
    end
    DB[(Base managée)]
  end

  Local[Local Admin / VPN] -->|SSH / VPN| Cluster
  Internet((Utilisateurs)) -->|HTTPS| LB --> API_GW
  Cluster --> DB

```

Ce genre de schéma méso te permet d’expliquer **où tourne quoi** sans encore descendre au niveau conteneur/VM.

---

## 7. Construire un schéma **Micro**

Le schéma micro = **ce qui tourne vraiment** : VM, conteneurs, ports, volumes, etc.

### 7.1 Composants déployés (VM, conteneurs)

```mermaid
flowchart TB
  subgraph Node1["VM 1 - Frontend"]
    C1[Docker<br/>container: nginx+react]
  end

  subgraph Node2["VM 2 - Backend"]
    C2[Docker<br/>container: api-gateway]
    C3[Docker<br/>container: orders-service]
    C4[Docker<br/>container: users-service]
  end

  subgraph Node3["VM 3 - Data"]
    DB[(PostgreSQL)]
    CACHE[(Redis)]
  end

  C1 -->|HTTP 80 interne| C2
  C2 --> C3 --> DB
  C2 --> C4 --> DB
  C3 --> CACHE

```

Tu montres ici :

- le découpage par **VM / nœud**,
- les conteneurs qui tournent sur chaque VM,
- les liens entre eux.

### 7.2 Réseau interne et ports

```mermaid
flowchart LR
  subgraph "Subnet public"
    LB[Load Balancer<br/>:443] --> API_NODE[Node Backend<br/>:3000]
  end

  subgraph "Subnet privé"
    DB_NODE[Node DB<br/>:5432]
  end

  API_NODE -->|TCP 5432| DB_NODE

```

Tu peux expliciter :

- les **subnets** (public / privé),
- les **ports exposés**,
- les chemins d’accès (seul le backend peut parler à la DB).

### 7.3 Détails de configuration (optionnel visuellement)

Pour ne pas surcharger le schéma, tu peux :

- mettre les détails (env vars, volumes, IAM, etc.) dans une **légende** à côté,
- ou dans un **tableau texte**.

Exemple de tableau d’appoint :

| Composant | Variables d’environnement importantes | Volumes |
| --- | --- | --- |
| `orders-service` | `DB_URL`, `REDIS_URL`, `JWT_SECRET` | `/var/log/orders` (logs) |
| `api-gateway` | `RATE_LIMIT`, `AUTH_URL`, `ORDERS_URL`, `USERS_URL` | `/etc/nginx/conf.d` |
| `postgres` | `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | `/var/lib/postgresql/data` |

---

## 8. Utiliser Mermaid efficacement dans tes cours

### 8.1 Types de schémas Mermaid utiles pour l’infra

- `flowchart` → pour 90 % des schémas d’infrastructure (macro, méso, micro).
- `sequenceDiagram` → pour expliquer le **parcours d’une requête**.
- `stateDiagram` → pour montrer les **états d’un déploiement** (Draft → Staging → Prod).

### Exemple : parcours d’une requête (sequenceDiagram)

```mermaid
sequenceDiagram
  participant User
  participant Front as Frontend
  participant API as API Gateway
  participant Svc as Service Orders
  participant DB as Database

  User->>Front: Clique sur "Payer"
  Front->>API: POST /orders
  API->>Svc: Vérification commande
  Svc->>DB: INSERT commande
  DB-->>Svc: OK
  Svc-->>API: 201 Created
  API-->>Front: Réponse HTTP 201
  Front-->>User: Affiche "Commande validée"

```

Tu peux utiliser ce diagramme **en complément** du schéma macro/méso pour bien expliquer un cas d’usage.

---

## 9. Utiliser draw.io pour les schémas “jolis”

Mermaid est parfait pour :

- la **doc technique** versionnée dans Git,
- les cours en Markdown.

Draw.io (diagrams.net) est idéal pour :

- les slides,
- les documents graphiques “stylés”.

### 9.1 Formes et couleurs (rappel)

- **Couleurs par type** :
    - UI / Frontend : bleu
    - Backend / services : orange
    - Bases de données : vert
    - Réseau / sécurité : rouge ou gris foncé
    - Outils tiers : violet
- **Formes** :
    - Rectangles → services / applications.
    - Cylindres → bases de données.
    - Icônes ou pictos → utilisateurs, SaaS, cloud.

> 🧠 Règle d’or : peu de formes, peu de couleurs, toujours les mêmes conventions d’un schéma à l’autre.
> 

### 9.2 Organisation visuelle

- Lecture **gauche → droite**, **haut → bas**.
- Utilise l’alignement automatique et les grilles.
- Regroupe les éléments dans des **zones** : “Frontend”, “Backend”, “Data”, “Cloud Provider”.

Tu peux te servir de Draw.io comme **brouillon visuel**, puis traduire certains schémas importants en **Mermaid** dans ta doc.

---

## 10. Vérifier la cohérence des 3 niveaux

Tes trois schémas doivent **raconter la même histoire**, avec des niveaux de zoom différents.

- Macro : “Frontend → Backend → BDD → services externes”
- Méso : “Backend = API Gateway + services X/Y/Z”
- Micro : “Service X tourne dans tel conteneur sur telle VM, avec telle BDD”

Checklist rapide :

- [ ]  Les noms des blocs restent cohérents d’un niveau à l’autre.
- [ ]  Chaque bloc du macro a son “équivalent” dans le méso.
- [ ]  Le micro ne contredit pas le méso (même services, mêmes rôles).
- [ ]  La palette de couleurs / symboles reste la même.

---

## 11. Adapter ton discours à la cible

- **Client / jury non technique** → reste surtout au **macro**, éventuellement un méso simple.
- **Développeurs** → méso détaillé, éventuellement micro simplifié.
- **DevOps / jury très technique** → méso + micro, avec focus sur :
    - sécurité,
    - déploiement,
    - monitoring,
    - scalabilité.

Tu peux préparer **les 3 schémas à l’avance** et choisir en live ceux que tu montres, selon les questions.

---

## 12. Anticiper les questions du jury

Pour chaque schéma, prépare mentalement (ou sur une fiche) des réponses à :

1. **Pourquoi cette architecture ?**
    
    → simplicité, coûts, évolutivité, contraintes de la formation / du client.
    
2. **Que se passe-t-il si ce composant tombe ?**
    
    → redondance, backup, plan de reprise.
    
3. **Comment est gérée la sécurité ?**
    
    → HTTPS, bastion, firewall, auth, droits.
    
4. **Est-ce que ça scale ?**
    
    → conteneurs, autoscaling, load balancer, DB gérée…
    
5. **Pourquoi ce service externe ?**
    
    → stabilité, time-to-market, standard du marché.
    

---

## 13. Modèles Mermaid prêts à adapter

Tu peux copier/coller ces snippets et les adapter à ton projet.

### 13.1 Template Macro générique

```mermaid
flowchart LR
  User["Utilisateur"] --> WEB["Frontend Web ou Mobile"]
  Admin["Admin"] --> BO["Back Office"]
  WEB --> API["Backend / API"]
  BO --> API
  API --> DB["Base de donnees principale"]
  API --> EXT["Service externe (paiement ou email)"]

```

### 13.2 Template Méso générique

```mermaid
flowchart LR
  subgraph Frontend
    APP[App React / Vue / Angular]
  end

  subgraph Backend
    GATEWAY[API Gateway]
    SVC_AUTH[Auth Service]
    SVC_CORE[Service métier]
    SVC_LOG[Service logs]
  end

  subgraph Data
    DB_MAIN[(DB principale)]
    DB_LOGS[(DB logs)]
  end

  APP --> GATEWAY
  GATEWAY --> SVC_AUTH
  GATEWAY --> SVC_CORE
  SVC_CORE --> DB_MAIN
  SVC_LOG --> DB_LOGS

```

### 13.3 Template Micro générique

```mermaid
flowchart TB
  subgraph "Node 1 - Front"
    C_FRONT[container: frontend]
  end

  subgraph "Node 2 - Backend"
    C_API[container: api-gateway]
    C_CORE[container: core-service]
  end

  subgraph "Node 3 - Data"
    C_DB[(postgres)]
  end

  C_FRONT -->|HTTP 80| C_API
  C_API -->|HTTP 3000| C_CORE
  C_CORE -->|TCP 5432| C_DB

```

---

## 14. À retenir

- Un schéma d’infrastructure est **une carte**, pas une œuvre d’art.
- Les **3 niveaux** (macro, méso, micro) sont complémentaires et s’adressent à des publics différents.
- Tu dois toujours :
    - identifier les **composants clés**,
    - choisir le **bon niveau de détail**,
    - garder un **style visuel cohérent**,
    - adapter ton discours à l’audience.

Avec ça, tu as une base solide pour **tous tes projets** (formation, jury, clients) et tu peux exploiter à fond **Mermaid + draw.io** pour documenter ton architecture. 💪

---

<!-- snippet
id: dns_schema_macro_concept
type: concept
tech: linux
level: beginner
importance: high
format: knowledge
tags: schema,macro,architecture,mermaid,présentation
title: Schéma Macro : vue d'ensemble pour un public non technique
context: choisir le bon niveau de détail selon l'audience (client, développeur, DevOps)
content: Le schéma Macro présente les blocs fonctionnels (utilisateurs, applications, BDD, services externes) pour un client ou un jury. Il doit être lisible en 30 secondes.
-->

<!-- snippet
id: dns_schema_macro_concept_b
type: concept
tech: linux
level: beginner
importance: high
format: knowledge
tags: schema,macro,architecture,mermaid,présentation
title: Schéma Méso et Micro : zoom technique et déploiement réel
context: choisir le bon niveau de détail selon l'audience (client, développeur, DevOps)
content: Le schéma Méso zoome sur les modules techniques (services, API Gateway, protocoles) pour les développeurs. Le schéma Micro détaille le déploiement réel (VM, conteneurs, ports) pour les DevOps.
-->

<!-- snippet
id: dns_schema_macro_concept_c
type: concept
tech: linux
level: beginner
importance: medium
format: knowledge
tags: schema,macro,architecture,mermaid,présentation
title: Cohérence des noms entre les 3 niveaux de schéma
context: choisir le bon niveau de détail selon l'audience (client, développeur, DevOps)
content: Les trois niveaux doivent utiliser les mêmes noms de composants. "Backend" en macro correspond à "API Gateway + Services" en méso, et aux conteneurs sur VM en micro.
-->

<!-- snippet
id: dns_mermaid_flowchart_macro
type: concept
tech: linux
level: beginner
importance: high
format: knowledge
tags: mermaid,flowchart,schema,macro,template
title: Template Mermaid pour un schéma Macro : structure de base
context: créer rapidement un schéma macro lisible pour une présentation ou un rapport
content: Utilisez flowchart LR avec 6-8 blocs max : User --> WEB --> API --> DB, API --> EXT. Annotez les flèches avec l'action (ex : -->|Appel REST /api/orders|).
-->

<!-- snippet
id: dns_mermaid_flowchart_macro_b
type: tip
tech: linux
level: beginner
importance: medium
format: knowledge
tags: mermaid,flowchart,schema,macro,template
title: Ancrer le schéma Macro dans un contexte réel
context: créer rapidement un schéma macro lisible pour une présentation ou un rapport
content: Ajoutez toujours une phrase de contexte sous le schéma macro pour ancrer la présentation dans un cas réel. Les jurys apprécient ce repère narratif.
-->

<!-- snippet
id: dns_mermaid_sequence_request
type: concept
tech: linux
level: intermediate
importance: medium
format: knowledge
tags: mermaid,sequenceDiagram,requête,flux,parcours
title: sequenceDiagram Mermaid : montrer l'ordre temporel des interactions
context: expliquer le déroulement d'une action utilisateur (login, paiement) de bout en bout
content: Utilisez sequenceDiagram avec des participants (User, Frontend, API, Database). Les flèches ->> sont des requêtes, -->> des réponses. Idéal pour un flux d'authentification ou un paiement.
-->

<!-- snippet
id: dns_mermaid_sequence_request_b
type: tip
tech: linux
level: intermediate
importance: medium
format: knowledge
tags: mermaid,sequenceDiagram,requête,flux,parcours
title: Combiner flowchart et sequenceDiagram pour deux angles complémentaires
context: expliquer le déroulement d'une action utilisateur (login, paiement) de bout en bout
content: Le flowchart montre la structure, le sequenceDiagram montre la dynamique. Combiner les deux avec le schéma méso donne une vision complète de l'architecture.
-->

<!-- snippet
id: dns_schema_micro_subnet
type: concept
tech: linux
level: intermediate
importance: medium
format: knowledge
tags: schema,micro,subnet,conteneurs,ports,déploiement
title: Schéma Micro : subgraphs par VM et ports sur les flèches
context: montrer précisément comment les VM et conteneurs sont organisés en réseau pour un jury DevOps
content: Regroupez les composants par VM ou subnet avec des subgraph Mermaid. Indiquez les ports sur les flèches (ex : -->|TCP 5432|) et séparez subnet public (LB) du subnet privé (BDD).
-->

<!-- snippet
id: dns_schema_micro_subnet_b
type: tip
tech: linux
level: intermediate
importance: medium
format: knowledge
tags: schema,micro,subnet,conteneurs,ports,déploiement
title: Tableau d'appoint pour les détails de configuration en Micro
context: montrer précisément comment les VM et conteneurs sont organisés en réseau pour un jury DevOps
content: Pour ne pas surcharger le schéma Micro, ajoutez un tableau texte à côté listant les variables d'environnement et volumes de chaque conteneur.
-->

<!-- snippet
id: dns_schema_securite_zones
type: concept
tech: linux
level: intermediate
importance: high
format: knowledge
tags: schema,sécurité,dmz,internet,réseau-privé,bastion
title: Trois zones réseau dans un schéma : Internet, DMZ, réseau privé
context: montrer la séparation entre zone exposée et réseau privé pour justifier les choix de sécurité
content: Représentez trois zones : Internet (cercle), DMZ (LB, Bastion, API Gateway) et Réseau privé (Backend, BDD). Les connexions indiquent le protocole (HTTPS, SSH port 4242).
-->

<!-- snippet
id: dns_schema_securite_zones_b
type: tip
tech: linux
level: intermediate
importance: high
format: knowledge
tags: schema,sécurité,dmz,internet,réseau-privé,bastion
title: Argument de sécurité clé : les BDD ne sont jamais exposées à Internet
context: montrer la séparation entre zone exposée et réseau privé pour justifier les choix de sécurité
content: La visualisation des zones montre que les BDD ne sont jamais accessibles directement depuis Internet. C'est l'argument de sécurité principal à préparer pour les questions du jury.
-->

<!-- snippet
id: dns_schema_coherence_niveaux
type: tip
tech: linux
level: beginner
importance: medium
format: knowledge
tags: schema,cohérence,macro,méso,micro,bonnes-pratiques
title: Noms identiques et équivalences entre les 3 niveaux de schéma
context: préparer un dossier technique complet avec des schémas qui racontent la même histoire
content: Vérifiez que les noms de blocs sont identiques d'un niveau à l'autre : "Backend" en macro = "API Gateway + Services" en méso = conteneurs sur VM en micro. Le micro ne doit pas contredire le méso.
-->

<!-- snippet
id: dns_schema_coherence_niveaux_b
type: tip
tech: linux
level: beginner
importance: medium
format: knowledge
tags: schema,cohérence,macro,méso,micro,bonnes-pratiques
title: Palette de couleurs cohérente entre schémas draw.io et Mermaid
context: préparer un dossier technique complet avec des schémas qui racontent la même histoire
content: Utilisez toujours la même palette : bleu = frontend, orange = backend, vert = base de données, rouge = sécurité/réseau. La cohérence visuelle renforce la lisibilité des trois niveaux.
-->