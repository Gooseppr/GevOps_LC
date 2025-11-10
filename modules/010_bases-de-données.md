---
titre: Les bases de données
type: module
jour: 10
ordre: 1
tags: mariadb, postgresql, mongodb, redis, devops
---

# Les bases de données

## 1. Rôle d’une base de données dans une architecture applicative

Une base de données (BDD) est un stockage persistant.

Ça veut dire :

- Les données restent même si l’application redémarre.
- On peut les relire plus tard de manière fiable.
- On peut les structurer pour les retrouver vite.

Dans une application web classique :

- Le frontend affiche l’interface pour l’utilisateur (HTML/CSS/JS).
- Le backend applique la logique métier (authentification, règles métier, calculs).
- La base de données garde les informations critiques (utilisateurs, commandes, logs, etc.).

Le backend parle à la base de données pour :

- Lire des infos (ex : “donne-moi tous les produits du panier de l’utilisateur 42”)
- Écrire des infos (ex : “crée une nouvelle commande”)
- Mettre à jour des infos (ex : “cet utilisateur est maintenant admin”)

Le DevOps a trois responsabilités majeures autour des BDD :

1. Disponibilité → la base doit tourner, être accessible, sans panne.
2. Sécurité → seuls les bons utilisateurs/services peuvent y accéder.
3. Performance → les requêtes doivent répondre vite, même si la charge augmente.

---

## 2. Deux grandes familles de bases de données

Il n’existe pas "une" façon unique de stocker des données. On choisit un moteur en fonction du besoin.

Les deux grandes familles que tu as vues :

### 2.1 Bases relationnelles (SQL)

Exemples :

- PostgreSQL
- MySQL
- MariaDB (fork communautaire de MySQL)

Caractéristiques :

- Les données sont organisées en tables.
    - Exemple : `clients`, `adresses`, `commandes`.
- Chaque table contient des lignes (lignes = enregistrements).
- Les tables sont liées entre elles par des clés.
    - Exemple classique :
        - `commandes` contient une colonne `client_id`
        - `clients` a une colonne `id`
        - la ligne de commande “appartient” à un client.

On appelle ça modèle relationnel, parce que les tables “savent” se relier entre elles.

Pourquoi c’est bien :

- Idéal si les données sont régulières, structurées, prévisibles.
- Tu veux de la cohérence forte (ex : pas de commande sans client valide).
- Tu veux du SQL standardisé (SELECT, UPDATE, etc.).

Différences rapides entre les moteurs :

- **MySQL / MariaDB**
    - Historiquement très utilisé pour des sites web type LAMP.
    - Facile à déployer, léger.
    - MariaDB est souvent plus libre/communautaire que MySQL d’un point de vue licence. MariaDB est souvent un peu plus simple à trimballer sur Linux dans certains contextes.
    - MySQL sur Linux tourne très bien. Sur Windows, on peut l’installer mais c’est moins courant en prod pour des raisons d’écosystème. MariaDB est parfois préférée quand on veut du MySQL-compatible mais portable.
- **PostgreSQL**
    - Très complet, très robuste, très respectueux des standards SQL.
    - Offre des fonctionnalités avancées (types personnalisés, fonctions côté base, JSON natif performant).
    - Parfois perçu comme un peu plus “lourd” à administrer, mais il est considéré comme très pro pour des systèmes critiques.
    - Très populaire côté applications modernes (SaaS, startups sérieuses).

Résumé mental :

- Données métier propres, structurées, avec des relations : PostgreSQL, MariaDB/MySQL.
- Tu veux faire des jointures complexes, des requêtes SQL avec des conditions, des agrégats : relationnel.

---

### 2.2 Bases non relationnelles (NoSQL)

NoSQL = “Not Only SQL”.

On ne pense pas en tables + jointures, mais autrement.

Exemples vus :

- **MongoDB**
    - Stocke des “documents”.
    - Un document ressemble à un objet JSON.
    - Les documents sont rangés dans des “collections”.
    - Chaque document peut avoir sa propre forme (ce champ existe pour l’un et pas pour l’autre).
    - Très flexible, très pratique pour des données qui évoluent souvent dans leur structure.
- **Redis**
    - Stocke des paires clé → valeur en mémoire.
    - Très rapide.
    - Sert beaucoup pour mettre en cache, stocker des sessions d’utilisateur, gérer des files de messages, des compteurs de rate-limit, etc.
    - Ce n’est pas fait pour être une base métier riche et relationnelle. C’est un outil de performance / soutien.

Pourquoi utiliser du NoSQL :

- Flexibilité du schéma : on n’a pas toujours besoin d’imposer “voici toutes les colonnes obligatoires”.
- Scalabilité horizontale : certaines bases NoSQL sont faciles à distribuer sur plusieurs machines.
- Cas d’usage très spécifiques :
    - logs massifs,
    - évènements,
    - chat temps réel,
    - cache,
    - profils utilisateur très variables.

Attention :

- Moins de contraintes = plus de liberté, mais aussi plus de risques d’incohérence si les équipes ne suivent pas de règles.
- Il faut penser à la sécurité réseau, car beaucoup de bases NoSQL démarrent par défaut en écoutant en local sans authentification stricte tant qu’on n’a pas activé la sécurité.

Résumé mental :

- MongoDB : stockage de documents JSON.
- Redis : stockage clé-valeur ultra rapide en RAM.
- On ne parle plus de tables ni de jointures, mais de documents ou de clés.

---

## 3. Installer les bases de données sur un système Debian

Tu as manipulé quatre moteurs différents. On va voir pour chacun :

1. Installation.
2. Démarrage du service.
3. Connexion en ligne de commande (CLI).
4. Création d’une base et d’un utilisateur.
5. Ouverture réseau (accès depuis l’extérieur).

Et ensuite on parlera sauvegarde/restauration.

### 3.1 PostgreSQL

#### Installation (Debian)

```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib

```

`postgresql-contrib` apporte des extensions utiles.

#### Service

```bash
sudo systemctl status postgresql
sudo systemctl start postgresql      # si besoin
sudo systemctl enable postgresql     # pour lancer au boot

```

PostgreSQL tourne en général sous un compte système `postgres`.

#### Connexion à la CLI PostgreSQL

Le super-utilisateur interne s’appelle `postgres`.

Depuis Debian, on se connecte en tant que cet utilisateur système :

```bash
sudo -u postgres psql

```

Tu arrives dans le shell `psql`.

#### Création d’une base et d’un utilisateur applicatif

Dans `psql` :

```sql
CREATE DATABASE mydb;
CREATE USER developer WITH ENCRYPTED PASSWORD 'mot_de_passe';
GRANT ALL ON DATABASE mydb TO developer;
ALTER DATABASE mydb OWNER TO developer;

```

Idée importante :

- On ne laisse pas l’application utiliser l’utilisateur superadmin `postgres`.
- On crée un utilisateur “applicatif” avec des droits limités à UNE base.

#### Connexion en tant qu’utilisateur applicatif

En sortant de `psql`, tu peux maintenant te connecter comme ferait une vraie appli :

```bash
psql -U developer -h 127.0.0.1 -d mydb

```

- `U` : quel utilisateur BDD on utilise.
- `h` : vers quelle adresse réseau on se connecte (ici localhost en TCP).
- `d` : quelle base.

C’est exactement ce que ferait un backend Node.js / Python / Java : il se connecte avec un login/mot de passe, pas avec `sudo`.

#### Accès réseau externe

Par défaut PostgreSQL peut être limité à l’accès local.

Le fichier `/etc/postgresql/<version>/main/pg_hba.conf` définit qui a le droit de se connecter et comment (mot de passe, peer auth, etc.).

Pour autoriser une machine distante :

- On ajoute une ligne du genre “host all all <IP autorisée>/32 md5”.
- On configure aussi `postgresql.conf` (souvent dans le même répertoire) pour écouter sur une IP autre que `localhost` (`listen_addresses = '*'` par exemple).
- On ouvre le firewall si nécessaire.

Important :

Donner un accès réseau, c’est ouvrir la base à l’extérieur. Ça implique mot de passe fort, chiffrement, restriction IP. On ne met jamais ça à l’arrache en prod.

#### Installation sur Windows (idée générale)

Sur Windows, PostgreSQL s’installe via un installeur officiel (ou via Chocolatey/winget).

Exemples :

```powershell
winget install PostgreSQL.PostgreSQL

```

Ensuite tu utilises `psql.exe` depuis le dossier d’installation, et le service tourne comme un service Windows.

Le principe reste le même :

- un “superuser” (souvent `postgres`),
- des bases,
- des utilisateurs applicatifs.

---

### 3.2 MariaDB (équivalent MySQL)

MariaDB et MySQL se manipulent quasiment de la même façon côté commandes de base.

#### Installation (Debian)

```bash
sudo apt update
sudo apt install -y mariadb-server

```

#### Service

```bash
sudo systemctl status mariadb
sudo systemctl start mariadb
sudo systemctl enable mariadb

```

#### Connexion à la CLI MariaDB

Sous Debian, en root système, tu peux ouvrir la CLI sans mot de passe :

```bash
sudo mariadb -u root

```

Tu arrives dans `MariaDB [(none)]>`.

#### Création d’une base et d’un utilisateur applicatif

Dans la CLI :

```sql
CREATE DATABASE mydb;
CREATE USER 'developer'@'localhost' IDENTIFIED BY 'qwerty';
GRANT ALL PRIVILEGES ON mydb.* TO 'developer'@'localhost';

```

Ici on donne tous les droits sur `mydb` à l’utilisateur `developer`, mais pas sur les autres bases.

Notion importante :

- `'developer'@'localhost'` veut dire : cet utilisateur est autorisé uniquement s’il se connecte depuis localhost.
- En prod, tu peux aussi créer `'appuser'@'10.0.12.%'` pour n’autoriser qu’un sous-réseau interne spécifique.

#### Connexion en tant qu’utilisateur applicatif

Ce sera l’équivalent de ce que ferait ton backend :

```bash
mariadb -h 127.0.0.1 -u developer -p mydb
# (-p va demander le mot de passe)

```

Là tu peux faire :

```sql
SHOW TABLES;

```

Si la base est vide, c’est normal : pas encore de tables.

#### Exposition réseau

MariaDB écoute généralement sur le port 3306.

Configuration dans `/etc/mysql/mariadb.conf.d/` (par exemple `50-server.cnf`), directive `bind-address`.

Si `bind-address = 127.0.0.1`, la base n’est accessible que localement.

Pour autoriser une autre machine, on peut mettre l’adresse IP du serveur ou `0.0.0.0` (toutes interfaces), mais il FAUT derrière :

- pare-feu,
- comptes limités par IP (`'user'@'IP'`),
- mots de passe solides.

#### Installation sur Windows (idée générale)

Sous Windows, MariaDB s’installe via MSI ou via Chocolatey :

```powershell
choco install mariadb

```

Ensuite tu as `mysql.exe` / `mariadb.exe` pour te connecter, et le service tourne comme un service Windows.

Même logique : créer une base, créer un utilisateur, lui donner les droits, ne jamais donner l’accès root brut à l’appli.

---

### 3.3 MongoDB

MongoDB est une base orientée documents.

#### Modèle de données

- Une “database”.
- À l’intérieur : des “collections”.
- Dans une collection : des documents JSON (BSON techniquement).
- Pas de schéma strict obligatoire.
- Tu peux insérer des objets `{ name: "Alice", age: 19 }` sans avoir défini une table au préalable.

#### Installation (Debian, version serveur officielle)

Tu ajoutes la clé et le repo officiels, puis tu installes le paquet :

```bash
sudo apt install -y gnupg curl
curl -fsSL https://www.mongodb.org/static/pgp/server-8.x.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-8.x.gpg --dearmor
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-8.x.gpg ] http://repo.mongodb.org/apt/debian bookworm/mongodb-org/8.0 main" | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list
sudo apt update
sudo apt install -y mongodb-org

```

(la version exacte change avec le temps, mais l’idée est la même : ajouter la clé, ajouter le dépôt, installer `mongodb-org` qui contient le serveur `mongod` et les outils `mongosh`, etc.)

#### Service

```bash
sudo systemctl status mongod
sudo systemctl start mongod
sudo systemctl enable mongod

```

Le service `mongod` doit être `active (running)` pour accepter les connexions.

#### Connexion au shell MongoDB

```bash
mongosh

```

Tu arrives dans un shell JavaScript-like. Là tu n’es plus dans Bash, tu es dans MongoDB.

#### Création d’une base et d’un utilisateur applicatif

Dans MongoDB :

1. Tu “bascules” sur une base juste en disant `use <nom>` :
    
    ```jsx
    use mydb
    
    ```
    
    Si elle n’existe pas encore, elle sera créée à la première écriture.
    
2. Tu crées un utilisateur lié à cette base :
    
    ```jsx
    db.createUser({
      user: "developer",
      pwd: "qwerty",
      roles: [{ role: "readWrite", db: "mydb" }]
    })
    
    ```
    

Idée importante :

- MongoDB n’a pas “root Linux = accès illimité par défaut” comme PostgreSQL.
- Tu définis des utilisateurs internes à Mongo avec des rôles (`readWrite`, `read`, `dbAdmin`, etc.).

#### Connexion en tant qu’utilisateur applicatif

Le backend (ou toi) se connecte ainsi :

```bash
mongosh "mongodb://127.0.0.1:27017" --username developer --authenticationDatabase mydb

```

Tu peux ensuite lister les collections :

```jsx
show collections

```

Pour créer une collection et insérer des documents :

```jsx
db.createCollection("students")
db.students.insertMany([
  { name: "Alice", age: 19 },
  { name: "Bruno", age: 22 }
])

```

Note bien : tu n’as pas défini un schéma à l’avance. Tu as directement inséré des objets.

#### Exposition réseau

Dans `/etc/mongod.conf`, tu as :

- `net.bindIp`: souvent `127.0.0.1` par défaut → MongoDB écoute uniquement en local.
- Pour autoriser des accès externes (autre machine du réseau), il faudrait mettre l’adresse IP du serveur ou `0.0.0.0`.
- Mais tu DOIS activer l’authentification et utiliser des utilisateurs/mots de passe forts, sinon n’importe qui peut lire ta base.

C’est très important en prod : MongoDB exposé publiquement sans auth = fuite de données garantie.

#### Installation sur Windows (idée générale)

Sur Windows, MongoDB s’installe via un MSI officiel. Ensuite :

- `mongod.exe` tourne en service.
- `mongosh.exe` est le shell.
- La logique reste la même : créer une base, créer un user avec un rôle, se connecter via une URI `mongodb://user:pass@host:27017/db`.

---

### 3.4 Redis

Redis est une base clé-valeur en mémoire.

C’est souvent utilisé comme cache, file d’attente légère, compteur de rate-limit, stockage de sessions, etc.

#### Modèle de données

- Tu stockes des paires clé → valeur.
- Exemple :
    - clé = `user:1`
    - valeur = `"Alice"`
- Les valeurs peuvent être des chaînes, des listes, des sets, des hashes, etc.
- L’accès est ultra rapide car c’est en RAM.

Redis n’est pas là pour stocker toutes les données métier structurées.

Il est là pour accélérer.

#### Installation (Debian)

Tu ajoutes le dépôt officiel Redis, tu installes le serveur Redis.

Ensuite :

```bash
sudo systemctl status redis
sudo systemctl start redis
sudo systemctl enable redis

```

Le service doit être actif.

#### Connexion à la CLI Redis

```bash
redis-cli

```

Tu vas te retrouver avec un prompt du type `127.0.0.1:6379>`.

#### Manipulation de clés

Exemples :

```
SET user:1 "Alice"
SET user:2 "Bob"
GET user:1        -> renvoie "Alice"
KEYS *            -> liste toutes les clés

```

Tu le vois : pas de schéma, pas de table. Juste des clés et des valeurs.

#### Sauvegarde Redis

Redis garde les données en mémoire.

Pour ne pas tout perdre, il écrit des snapshots sur disque dans un fichier `dump.rdb`.

Classique :

- Le fichier `dump.rdb` est dans `/var/lib/redis/`.
- L’option `save` force un snapshot manuel.
- En pratique DevOps, tu peux copier ce `dump.rdb` ailleurs comme sauvegarde.

Exemple :

1. Demander un snapshot :
    
    ```bash
    redis-cli save
    
    ```
    
2. Copier le fichier snapshot :
    
    ```bash
    sudo cp /var/lib/redis/dump.rdb ~/redis_backup.rdb
    
    ```
    

Pour restaurer :

- Tu arrêtes Redis,
- tu remplaces le `dump.rdb` par une version de sauvegarde,
- tu redémarres Redis.
    
    Redis recharge ce snapshot en mémoire au démarrage.
    

#### Windows

Redis officiel n’est plus maintenu nativement pour Windows depuis un moment. On utilise soit WSL (Windows Subsystem for Linux), soit des builds non officiels. En production Windows pure, ce n’est pas le scénario normal. La pratique moderne : Redis tourne sur une machine Linux (physique, VM, container, Kubernetes pod).

---

## 4. Sécurité et accès réseau : logique commune

Quel que soit le moteur, il y a toujours le même schéma d’administration sain :

1. **Ne jamais laisser l’application se connecter avec le super-utilisateur interne.**
    - PostgreSQL → ne pas utiliser `postgres` pour l’app.
    - MariaDB → ne pas utiliser `root`.
    - MongoDB → ne pas utiliser un compte admin global.
    - Redis → attention, Redis n’a pas d’utilisateur par défaut sur toutes les versions, donc on le protège au niveau réseau (bind sur localhost, firewall, mots de passe si activés).
2. **Limiter l’accès réseau.**
    - Par défaut, écouter uniquement sur `127.0.0.1` tant que tu es en dev local.
    - Si tu dois ouvrir au réseau, autoriser seulement certaines IP sources, pas tout le monde.
3. **Séparer les rôles.**
    - Un utilisateur lecture/écriture pour l’application.
    - Un accès plus large uniquement pour l’administrateur / DevOps pour la maintenance.
4. **Journaliser / tracer.**
    - Savoir qui a modifié quoi.
    - Pour PostgreSQL, tu peux activer le logging des requêtes.
    - Pour MongoDB, tu peux auditer les connexions.
    - Pour Redis, tu surveilles l’accès au port (souvent 6379).

---

## 5. Sauvegarde et restauration

Sauvegarder une base = capturer son état à un instant T.

Restaurer = rejouer cette sauvegarde pour revenir à cet état.

Il y a deux familles d’outils :

- Les dumps logiques (export lisible ou script SQL).
- Les snapshots binaires complets.

### 5.1 PostgreSQL

#### Sauvegarde (`pg_dump`)

`pg_dump` génère un fichier texte SQL ou un format compressé contenant :

- La structure des tables.
- Les données.

Exemple type :

```bash
pg_dump -U developer -h 127.0.0.1 --format=p --file=newdump.sql mydb

```

Ici `--format=p` veut dire “plain” : un script SQL lisible.

Tu obtiens `newdump.sql`.

#### Restauration

Deux options :

1. Si tu as un `dump.sql` en texte :
    - Créer une base vide.
    - Importer dans cette base :
        
        ```bash
        psql -U developer -h 127.0.0.1 -d basecible -f dump.sql
        
        ```
        
2. Si tu as utilisé un format spécial (custom format, tar, etc.), tu utilises `pg_restore`.

Bonnes pratiques :

- Faire des dumps réguliers (cron).
- Conserver plusieurs versions dans le temps pour la rétention (par exemple : tous les jours pendant 7 jours, puis un par semaine pendant 3 mois).
- Tester une restauration régulièrement. Une sauvegarde qui n’a jamais été testée n’est pas une sauvegarde, c’est juste un fichier inconnu.

### 5.2 MariaDB / MySQL

#### Sauvegarde (`mysqldump`)

`mysqldump` génère aussi un script SQL contenant structure + données.

Exemple :

```bash
mysqldump -u developer -p mydb --no-tablespaces > mydb_dump.sql

```

Option `--no-tablespaces` est parfois nécessaire selon la version/packaging Debian.

#### Restauration

Pour restaurer :

1. Créer la base (si besoin).
2. Importer le dump :
    
    ```bash
    mysql -u developer -p mydb < mydb_dump.sql
    
    ```
    

ou

```bash
mariadb -u developer -p mydb < mydb_dump.sql

```

Encore une fois : c’est un script SQL, donc lisible et rejouable.

### 5.3 MongoDB

Mongo utilise des outils dédiés.

#### Sauvegarde avec `mongodump`

`mongodump` crée une sauvegarde binaire BSON de la base (ou d’une collection) dans un répertoire :

```bash
mongodump --db mydb --out /chemin/vers/backups

```

Tu obtiens quelque chose comme `/chemin/vers/backups/mydb/...` avec les collections.

#### Restauration avec `mongorestore`

Pour restaurer :

```bash
mongorestore /chemin/vers/backups/mydb

```

Ça réinjecte les données dans une instance MongoDB qui tourne.

#### Export lisible avec `mongoexport`

Quand tu veux juste exporter une collection en JSON, pour l’archiver ou l’analyser ailleurs :

```bash
mongoexport \
  --db mydb \
  --collection students \
  --out mongodump.json \
  --jsonArray \
  --pretty

```

- `-jsonArray` → tu obtiens un tableau JSON complet `[...]`.
- `-pretty` → indentation lisible.

Ce n’est pas la même chose que `mongodump`.

- `mongodump` = sauvegarde pour restauration Mongo.
- `mongoexport` = export lisible / portable pour data science, audit, etc.

### 5.4 Redis

Redis stocke presque tout en RAM.

Le “dump” Redis, c’est un snapshot complet de l’état en mémoire écrit dans un fichier binaire `dump.rdb`.

Stratégie :

1. Forcer l’écriture du snapshot :
    
    ```bash
    redis-cli save
    
    ```
    
2. Récupérer le fichier snapshot :
    
    ```bash
    sudo cp /var/lib/redis/dump.rdb /chemin/vers/sauvegarde.rdb
    
    ```
    

Restauration :

- Arrêter Redis.
- Remplacer le `dump.rdb` actuel par la sauvegarde.
- Relancer Redis : il recharge cet état en mémoire.

Spécificité Redis :

- Ce n’est pas du SQL.
- Ce n’est pas un script de recréation.
- C’est littéralement l’état des clés/valeurs à un instant T.

---

## 6. Échelle : petit vs moyen

Ce que tu as fait aujourd’hui est typique d’une échelle “développement interne / startup” :

- Une seule VM ou un seul serveur.
- Un seul service de base de données (PostgreSQL, MariaDB, MongoDB, Redis) tournant localement.
- Un seul utilisateur applicatif par base.
- Des sauvegardes par dump manuel.

À cette échelle :

- C’est OK de faire des dumps à la main (cron + scp).
- C’est OK de stocker les backups sur le disque de la machine et sur un autre disque/snapshot.
- C’est OK d’autoriser l’accès réseau seulement depuis `127.0.0.1` (backend qui tourne sur la même machine).

À une échelle “moyenne” (plusieurs services, plusieurs machines) on commence à :

- Séparer la base sur une VM dédiée.
- Gérer les accès réseau par IP.
- Centraliser les sauvegardes sur un stockage dédié (NAS, S3, etc.).
- Avoir une rotation/rétention (combien de jours/mois on garde les dumps).
- Gérer des comptes utilisateurs différents pour chaque microservice (pas un compte unique avec tous les droits).
- Mettre en place des alertes sur la santé du service (`systemctl status`, espace disque, réplication, etc.).

---

## 7. Ce que tu dois retenir comme DevOps / backend-ready

1. Une base = un service système (PostgreSQL → `postgresql.service`, MongoDB → `mongod.service`, Redis → `redis.service`).
    - Elle doit tourner.
    - Elle doit redémarrer toute seule si la machine reboot (enable).
    - Elle doit avoir un fichier de config connu.
2. On ne travaille JAMAIS avec le compte superadmin par défaut dans le code de l’application.
    - On crée un utilisateur applicatif dédié, avec des droits limités, ciblés.
3. On ne laisse pas la base ouverte au monde entier.
    - Bind sur `127.0.0.1` par défaut.
    - Si on doit ouvrir : firewall + restriction IP + mot de passe fort.
4. On doit savoir sauvegarder ET restaurer.
    - PostgreSQL : `pg_dump` / `psql`.
    - MariaDB/MySQL : `mysqldump` / `mysql` ou `mariadb`.
    - MongoDB : `mongodump` / `mongorestore` ou `mongoexport` pour du JSON lisible.
    - Redis : snapshot `dump.rdb`.
5. On doit documenter la rétention.
    - Combien de temps on garde les sauvegardes ?
    - Où elles sont stockées ?
    - Qui peut y accéder ?
    - Est-ce chiffré ?

Si tu maîtrises ça, tu es déjà au niveau “Je peux tenir la base de prod d’une petite startup sans paniquer quand ça tombe”.

---
[← Module précédent](010_bases-de-données.md) | [Module suivant →](010_bases-de-données.md)
---
