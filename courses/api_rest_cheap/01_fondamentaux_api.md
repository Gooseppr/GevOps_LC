```yaml
---
layout: page
title: "Fondamentaux des API"

course: "API REST"
chapter_title: "Fondamentaux des API"

chapter: 1
section: 1

tags: api,rest,http,architecture,fondamentaux
difficulty: beginner
duration: 45
mermaid: true

icon: "🔌"
domain: "Backend & Intégration"
domain_icon: "⚙️"
status: "published"
---
```

## Objectifs pédagogiques

À la fin de cette section, tu devras être capable de :

1. **Définir précisément ce qu'est une API** et différencier une API d'une application ou d'un service complet
2. **Identifier les trois composantes du contrat API** : entrées attendues, sorties fournies, comportement défini
3. **Reconnaître les types d'API courants** et savoir quand chacun est pertinent (REST, RPC, GraphQL)
4. **Comprendre pourquoi une API n'est pas un backend entier** et les implications pour la conception
5. **Expliciter le lien entre API et HTTP** pour éviter les confusions courantes en production

---

## Mise en situation

Imagine que tu construis un système de gestion de commandes pour une boutique en ligne. Tu as besoin que :
- d'autres équipes puissent créer une commande sans accéder à ta base de données directement
- des applications tierces (mobile, partenaires) utilisent tes données de prix et de stock
- les données circulent de manière fiable et prévisible entre les systèmes

Sans API, tu exposerais ta base de données brute (catastrophe de sécurité), ou tu créerais des connexions propriétaires différentes pour chaque client (maintenance impossible).

**Avec une API**, tu définis un contrat clair : "Voici exactement comment me demander une commande, voici ce que tu recevras en retour, voici comment j'indique une erreur". Tout le monde joue selon les mêmes règles. C'est ça, une API.

---

## Résumé

Une **API (Application Programming Interface)** est un contrat technique entre deux systèmes : elle définit les entrées acceptées, les sorties fournies, et le comportement attendu lors de chaque interaction. C'est l'inverse d'une interface utiliselle (qui parle aux humains) — elle parle aux machines. L'API **n'est pas le backend entier** : c'est la façade exposée, le point de contrôle qui protège et structure l'accès à tes services internes. Ce concept émerge de la nécessité d'intégrer des systèmes sans exposer leur complexité interne, et c'est pourquoi elle existe dans presque toute architecture moderne distribuée ou multi-équipes.

---

## Qu'est-ce qu'une API, concrètement ?

Une API est un **accord d'échange entre deux programmes**. Elle dit : "Si tu m'envoies X, je te garantis que je répondrai Y, dans ce délai, avec ce format, et voici comment interpréter les erreurs."

C'est exactement comme un **menu de restaurant** : tu ne demandes pas au chef de t'expliquer tous ses ingrédients ou ses techniques culinaires. Tu regarde le menu, tu dis "je veux un risotto", et le restaurant s'engage à te livrer un risotto de qualité. Le menu est le contrat. L'API fonctionne pareil : tu envoies une demande structurée, tu reçois une réponse structurée. Les détails de ce qui se passe à l'intérieur ne te concernent pas.

💡 **Astuce** : Beaucoup de gens pensent que "API" veut dire "serveur web". Ce n'est pas vrai. Une API peut être un serveur web (REST), une fonction Python que tu appelles, une librairie JavaScript, même un fichier de configuration. L'important, c'est qu'elle expose un **contrat clair**.

### Les trois composantes d'une API

Chaque API possède trois éléments indissociables :

| Composante | Ce que c'est | Exemple |
|-----------|------------|---------|
| **Entrée (request)** | Les données que tu dois fournir, leur format, leurs limitations | "Pour créer une commande, envoie-moi un JSON avec : `customer_id` (entier), `items` (liste), `total` (nombre)" |
| **Sortie (response)** | Les données qu'elle garantit de te retourner, structurées comment | "Je te retourne un JSON avec : `order_id`, `status`, `created_at`, ou une erreur avec un code et un message" |
| **Comportement** | Ce qui se passe exactement, les conditions, les effets de bord | "POST /orders crée une nouvelle commande et réserve le stock. GET /orders?status=pending retourne uniquement les commandes en attente" |

Sans ces trois éléments, ce n'est pas une API — c'est juste un truc qui répond n'importe comment.

---

## API vs Application vs Service : les confusions courantes

Trois termes qui semblent proches mais qui ont des sens très différents.

**Une application**, c'est un logiciel complet. Elle a une UI, une logique métier, une base de données, des jobs de background, du monitoring, des logs. C'est l'usine entière.

**Une API**, c'est une **partie** de l'application — spécifiquement, la façade exposée pour que d'autres systèmes l'utilisent. C'est un sous-ensemble du code métier, encadré par des règles de sécurité, de versioning, de documentation.

**Un service** (ou microservice) est une **application complète de petite taille**, conçue pour faire une chose bien. Elle *inclut* une API, mais elle est plus que juste l'API — elle a aussi sa propre base de données, son propre déploiement, sa propre surveillance.

Illustration :

```
┌─────────────────────────────────────────┐
│      Une application monolithique       │
├─────────────────────────────────────────┤
│  UI web                                 │
│  API REST  ← ici, l'API exposée        │
│  Logique métier                         │
│  Base de données                        │
│  Cache, Jobs, Logs...                   │
└─────────────────────────────────────────┘

vs

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Service 1   │  │  Service 2   │  │  Service 3   │
├──────────────┤  ├──────────────┤  ├──────────────┤
│ API          │  │ API          │  │ API          │
│ Logique      │  │ Logique      │  │ Logique      │
│ BD           │  │ BD           │  │ BD           │
└──────────────┘  └──────────────┘  └──────────────┘
       ↓ appels d'API entre eux
```

⚠️ **Erreur fréquente** : "Je dois créer une API pour ma base de données". Non. Tu dois créer une **application** (ou un service) qui *expose une API* comme point d'entrée contrôlé vers ta BD. L'API seule n'est rien — elle doit être associée à de la logique, de l'authentification, du contrôle d'accès.

---

## Les grands types d'API

Il existe plusieurs paradigmes pour structurer une API. Voici les trois plus courants en 2024 :

### REST — Le standard de facto

Une API REST organise tes données autour de **ressources** (users, products, orders...) et expose des **opérations HTTP standard** (GET pour lire, POST pour créer, PUT/PATCH pour modifier, DELETE pour supprimer).

```
GET    /api/orders/123        → Récupère la commande 123
POST   /api/orders            → Crée une nouvelle commande
PATCH  /api/orders/123        → Modifie partiellement la commande 123
DELETE /api/orders/123        → Supprime la commande 123
```

**Avantage** : simple à comprendre, utilise les verbes HTTP de manière prévisible, facile à mettre en cache.
**Inconvénient** : inefficace si tu dois agréger plusieurs ressources (il faut faire plusieurs requêtes).

### RPC (Remote Procedure Call) — Comme appeler une fonction

Une API RPC te laisse appeler des **fonctions distantes** explicitement nommées. Au lieu de parler de ressources, tu dis "appelle-moi cette fonction avec ces paramètres".

```
POST /api/process_payment  body: {user_id: 42, amount: 99.99}
POST /api/send_email       body: {to: "...", subject: "...", body: "..."}
```

**Avantage** : très flexible, facile d'exprimer des actions complexes, idéal pour les opérations.
**Inconvénient** : moins structuré, plus difficile à mettre en cache, peut devenir du "spaghetti" si mal organisé.

### GraphQL — Demande exactement ce que tu veux

GraphQL te laisse **composer la réponse que tu veux** : tu demandes explicitement les champs qui t'intéressent, et tu peux naviguer entre ressources liées en une seule requête.

```graphql
query {
  order(id: 123) {
    id
    customer { name email }
    items { name price }
  }
}
```

**Avantage** : pas de sur-récupération de données, une seule requête pour des structures complexes, excellent pour les clients mobiles avec peu de bande passante.
**Inconvénient** : plus complexe à mettre en cache, la courbe d'apprentissage est plus raide.

### Quelle choisir ?

Simplifié :
- **REST** : si tes données s'organisent bien autour de ressources et que tu veux la simplicité
- **RPC** : si tu as beaucoup d'actions métier complexes, ou un usage interne (microservices)
- **GraphQL** : si tu as des clients divers (mobile, web, partenaires) avec des besoins d'agrégation variés

💡 **Astuce** : dans ce cours, on se concentre sur **REST** parce que c'est le standard le plus courant en production et qu'il t'apprend les concepts fondamentaux. Les principes (versioning, authentification, gestion d'erreurs) s'appliquent à tous les types.

---

## Pourquoi l'API est (presque) tout ce que tes utilisateurs voient

Voici un point critique pour la conception : **l'API est ta promesse**.

Quand quelqu'un intègre ton API, il se moque de comment tu la construis. Il regarde :

1. **La documentation** : est-ce clair ? sont les exemples corrects ?
2. **La stabilité** : si je déploie sur elle aujourd'hui, elle marche encore demain ?
3. **La performance** : elle répond en combien de temps ?
4. **Les erreurs** : quand ça casse, est-ce que je comprends pourquoi ?

L'API **est l'interface contractuelle** de tout ton système. Si elle est mal pensée, c'est tout l'écosystème de clients (internes ou externes) qui souffre.

C'est pourquoi, en production, tu changes **beaucoup plus facilement** l'intérieur de ton application que son API. Refactoriser ta base de données ? Libre de le faire, du moment que l'API répond toujours la même chose. Mais changer la structure de ta réponse API ? C'est un changement **breaking** — tous tes clients cassent.

---

## Le lien indissoluble entre API et HTTP

Dans ce cours, on parle d'**API REST**, qui utilise toujours **HTTP** pour communiquer. Mais attention : HTTP n'est pas l'API.

**HTTP** est le **protocole de transport** : c'est comment les messages circulent sur le réseau (quels headers, quels codes de statut, comment les connexions se ferment...).

**L'API** est le **contrat applicatif** : c'est quoi tu acceptes, quoi tu retournes, comment tu gères les erreurs au niveau métier.

Exemple :
- HTTP dit : "Envoie une requête avec la méthode POST et un body JSON, tu recevras une réponse avec le code 200 ou 400"
- L'API dit : "POST /api/orders accepte {customer_id, items}, crée une commande en BD, retourne {order_id, status='pending'}, ou retourne une erreur 400 si customer_id n'existe pas"

Tu **dois** connaître HTTP (on le voit dans la prochaine section), mais ne les confonds pas. Beaucoup de bugs en production viennent d'un malentendu sur ce lien.

---

## Cas réel : l'API Stripe

Stripe, c'est un service de paiements. Des millions d'applications l'utilisent. Pourquoi ? Parce que son API est **exceptionnelle**.

Stripe expose ses ressources simplement :

```
GET  /v1/customers              → liste de clients
POST /v1/customers              → crée un client
GET  /v1/customers/{id}         → détails d'un client
POST /v1/charges                → crée un paiement
GET  /v1/charges/{id}           → détails d'un paiement
```

Les réponses sont **cohérentes** (toujours du JSON avec les mêmes champs), les **erreurs sont explicites** (code d'erreur + message clair), la **documentation est détaillée avec des exemples** en dix langages différents, et la **stabilité est garantie** (Stripe versione son API pour ne pas casser le code existant).

Résultat : des développeurs du monde entier intègrent Stripe en quelques heures. L'API a changé la manière dont on paie en ligne.

C'est ton modèle : **une API claire, stable, bien documentée, c'est un produit**. Pas juste du code interne.

---

## Bonnes pratiques d'entrée de jeu

Avant de plonger dans la technique (HTTP, codes d'erreur, etc.), quelques principes qui guident les décisions API :

**1. Pense à l'utilisateur de ton API, pas à ta BD**

Tes tables de base de données ont une structure logique pour **toi** (normalisée, sans redondance). Ton API doit exposer une structure logique pour **celui qui l'utilise** (souvent dénormalisée, avec les données agrégées).

Si un client demande une commande, il ne veut pas faire 5 requêtes pour avoir le client, les items, les prix, les taxes. Il veut une requête qui retourne tout ça structuré.

**2. Documente le contrat, pas l'implémentation**

Ne dis pas : "La fonction `get_order_from_db()` cherche dans la table `orders` join avec `items`". Dis : "GET /api/orders/{id} retourne un objet avec les champs suivants, valeurs possibles de `status`, délai de réponse typique, erreurs possibles."

**3. Prévoir l'évolution dès le jour 1**

Tu vas changer d'avis. Un jour tu voudras ajouter un champ à la réponse. Comment feras-tu sans casser les clients existants ? (Réponse : en utilisant du **versioning d'API**. On le verra plus tard.)

**4. L'erreur doit être claire et actionnable**

"Erreur 500" ou "Erreur serveur" n'aide personne. "400 Bad Request: Le champ `email` est requis et n'a pas été fourni" — voilà qui l'est.

---

## Récapitulatif conceptuel

| Concept | Définition | Exemple |
|---------|-----------|---------|
| **API** | Contrat de communication entre systèmes : entrées, sorties, comportement | GET /api/users/{id} → retourne un user JSON, ou 404 si absent |
| **Ressource** | Objet central d'une API REST : users, products, orders, ... | /api/orders/123 — la ressource est la commande 123 |
| **Contrat** | La promesse que tu fais : si tu respectes l'entrée, tu auras cette sortie | "Si tu envoies un JSON valide en POST, je crée la ressource et retourne 201" |
| **Versioning** | Manière de changer l'API sans casser les clients existants | /api/v1/users vs /api/v2/users |
| **Documentation** | Le mode d'emploi : format des requêtes, des réponses, codes d'erreur | "POST /api/orders accepte {customer_id (int), items (list), ...}" |

---

<!-- snippet
id: api_definition_core
type: concept
tech: api
level: beginner
importance: high
format: knowledge
tags: api,fondamentaux,contrat,interface
title: Une API définit un contrat : entrées, sorties, comportement
context: À mémoriser comme fondation avant tout le reste
content: Une API spécifie trois choses : (1) Quoi envoyer (format, types, obligatoire/optionnel), (2) Quoi recevoir en retour (structure JSON, codes HTTP, délai garanti), (3) Qu'est-ce que ça provoque (créer une ressource, modifier un état, lire une donnée). Chaque requête est une transaction : tu respectes le format d'entrée, tu reçois le format de sortie et le comportement promis. Pas de négociation, pas de "ça dépend" — c'est un contrat.
description: Une API est un accord : si le client envoie exactement ceci, le serveur répond exactement cela. Les trois piliers sont l'entrée (request), la sortie (response) et le comportement garanti.
-->

<!-- snippet
id: api_vs_application_backend
type: concept
tech: api
level: beginner
importance: high
format: knowledge
tags: api,architecture,distinction,backend
title: L'API n'est pas le backend entier, c'est la façade exposée
context: Confusion très courante lors du design initial
content: Une application backend complète inclut : UI (même interne), logique métier, BD, jobs asynchrones, cache, monitoring, logs. L'API est seulement la part qu'on expose au monde extérieur — c'est la porte contrôlée. Imagine une banque : l'application c'est tout (guichets, coffres, serveurs, RH, IT). L'API c'est juste le guichet. Quand tu dis "je vais construire une API", tu dois aussi construire la logique et les données derrière, sinon il n'y a rien à exposer.
description: L'API est la façade d'une application, pas l'application elle-même. Une app complète inclut logique métier, BD, opérations. L'API n'est que le point d'entrée contrôlé.
-->

<!-- snippet
id: rest_vs_rpc_vs_graphql_choice
type: concept
tech: api
level: beginner
importance: medium
format: knowledge
tags: rest,rpc,graphql,paradigmes,choix
title: REST, RPC, GraphQL : trois paradigmes, trois usages différents
context: Au moment de designer une nouvelle API
content: REST organise autour de ressources (users, products) + verbes HTTP (GET/POST/PUT/DELETE). Simple, facile à mettre en cache, standard de facto. RPC appelle des fonctions nommées (process_payment, send_email) — plus flexible, meilleur pour les actions complexes, mais moins structuré. GraphQL laisse le client demander exactement les champs qu'il veut — pas de sur-récupération, une requête pour agréger plusieurs ressources, mais plus complexe à cacher et apprendre. Choix : REST si données = ressources simples, RPC si opérations complexes/métier-heavy, GraphQL si clients divers avec besoins d'agrégation variables.
description: REST=ressources+verbes, RPC=fonctions nommées, GraphQL=requête flexible. Choisir selon la structure des données et les cas d'usage clients.
-->

<!-- snippet
id: api_http_difference
type: concept
tech: http,api
level: beginner
importance: high
format: knowledge
tags: http,api,distinction,protocole
title: HTTP est le transport, l'API est le contrat applicatif
context: À clarifier très tôt pour éviter la confusion
content: HTTP définit comment les messages circulent (GET, POST, Content-Type, codes 200/400/500, headers...). L'API définit quoi accepter et quoi retourner au niveau métier. HTTP dit "je vais envoyer du JSON". L'API dit "j'accepte un JSON avec {customer_id, items}, je retourne {order_id, status}". Tu peux avoir une API mauvaise avec du HTTP parfait (codes de statut corrects mais réponses incohérentes). Maîtriser HTTP est nécessaire, mais ce n'est pas l'API — c'est le fondement sur lequel l'API repose.
description: HTTP = protocole de transport (requête/réponse, codes, headers). API = contrat applicatif (quoi accepter, quoi retourner, comportement métier). Ils sont liés mais distincts.
-->

<!-- snippet
id: api_documentation_first_principle
type: tip
tech: api
level: beginner
importance: high
format: knowledge
tags: documentation,contrat,api,design
title: Pense à qui utilise ton API, pas à comment tu la construis
context: Lors du design ou de la révision de l'API
content: Documente le contrat : format des requêtes, réponses, codes d'erreur, délais, limites. Ne documente pas l'implémentation interne (comment tu jointures les tables, quel ORM tu utilises). Ton utilisateur ne s'en fiche. Il veut savoir : "Si je fais POST /api/orders avec ce JSON, que reçois-je ?" et "Que se passe-t-il si customer_id n'existe pas ?" Les détails d'implémentation changent (tu switches de BD, tu refactorise le code) — le contrat doit rester stable.
description: Documente le contrat (requête/réponse/erreurs), pas l'implémentation (BD, ORM). Le client n'a besoin que du premier.
-->

<!-- snippet
id: api_stability_is_product
type: tip
tech: api
level: beginner
importance: high
format: knowledge
tags: api,stabilité,versioning,production
title: Une API stable est un produit, une API instable est un cauchemar client
context: Avant de publier ou à chaque changement majeur
content: Si tu changes la structure de ta réponse (supprime un champ, renomme une clé, change le type de `created_at` de string à timestamp), tu casses tous les clients qui en dépendent. En production, c'est une catastrophe : équipes paralysées, bugs mystérieux, mauvaise réputation. La solution : versioning (v1, v2) ou champs optionnels rétro-compatibles. Dès le jour 1, anticipe que tu vas vouloir changer. Prévois un chemin de migration clair (exemple : garder l'ancien endpoint 2 ans, annoncer la déprécation 6 mois avant la suppression).
description: Un changement non-rétro-compatible dans l'API cassera tous les clients. Prévoir la versioning ou la compatibilité dès le design initial.
-->

<!-- snippet
id: api_error_clarity_actionable
type: warning
type: warning
tech: api
level: beginner
importance: high
format: knowledge
tags: erreurs,api,debug,contrat
title: Une erreur API doit être claire et actionnable, jamais générique
context: Lors du design des réponses d'erreur
content: Mauvais : code 500 + "Erreur serveur" — le client ne sait pas quoi faire. Meilleur : code 400 + "Le champ `email` est requis et vide" — le client sait corriger. Excellent : code 400 + {"error": "validation_failed", "field": "email", "reason": "must be non-empty valid email", "example": "john@example.com"} — le client sait quoi faire et pourquoi. Chaque réponse d'erreur doit dire : le code technique, le code métier, le problème exactement, comment corriger.
description: Les erreurs génériques ("Erreur serveur") rendent le debug impossible. Inclure : code d'erreur technique, raison, suggestion de correction.
-->