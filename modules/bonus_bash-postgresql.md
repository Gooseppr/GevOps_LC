---
module: Le scripting Bash pour PostgreSQL
jour: 01|10
type: bonus
---

# PostgreSQL

## 1. Les outils PostgreSQL en ligne de commande

Dans un script Bash tu ne “parles pas directement” à PostgreSQL. Tu appelles des binaires (programmes) fournis par PostgreSQL. Les plus importants :

### 1.1 `psql`

Client SQL.

C’est le couteau suisse. Il se connecte à une base PostgreSQL et exécute du SQL.

Exemple :

```bash
psql -h 127.0.0.1 -p 5432 -U developer -d fakeusers -c "SELECT COUNT(*) FROM users;"

```

Décompose :

- `h` : adresse du serveur (hôte)
- `p` : port (par défaut 5432)
- `U` : utilisateur PostgreSQL
- `d` : base cible
- `c "..."` : commande SQL à exécuter

Tu peux aussi lui donner un fichier SQL :

```bash
psql -h 127.0.0.1 -U developer -d fakeusers -f ./script.sql

```

Ça veut dire : “exécute tout le contenu du fichier script.sql dans la base fakeusers”.

Tu utiliseras `psql` tout le temps : vérifier, importer, modifier, créer des rôles, etc.

---

### 1.2 `pg_dump`

Sauvegarde logique (= export).

Lit une base ou une table et génère un fichier qui permet de la recréer plus tard.

Exemple dump complet :

```bash
pg_dump -h 127.0.0.1 -U developer fakeusers > fakeusers_backup.sql

```

Exemple dump d’une seule table :

```bash
pg_dump -h 127.0.0.1 -U developer -t public.users fakeusers > users_backup.sql

```

Tu utilises ça :

- avant de faire une opération risquée (DELETE massif, changement de structure)
- pour cloner des données dans un autre environnement
- pour archiver périodiquement des tables

---

### 1.3 `pg_restore`

Restaure un dump créé en “format custom” (option `-Fc` de pg_dump).

Exemple création du dump au format custom :

```bash
pg_dump -h 127.0.0.1 -U developer -Fc fakeusers > fakeusers.dump

```

Restauration :

```bash
pg_restore -h 127.0.0.1 -U developer -d nouvelle_base fakeusers.dump

```

Intérêt :

- Tu peux restaurer sélectivement des tables.
- Tu peux inspecter le contenu du dump sans le rejouer :
    
    ```bash
    pg_restore --list fakeusers.dump
    
    ```
    

---

### 1.4 `createdb` / `dropdb`

Raccourcis pour créer / supprimer une base.

```bash
createdb -h 127.0.0.1 -U postgres testdb
dropdb   -h 127.0.0.1 -U postgres testdb

```

C’est l’équivalent de :

```sql
CREATE DATABASE testdb;
DROP DATABASE testdb;

```

Utilité : automatiser la création d’environnements de test jetables.

---

### 1.5 `createuser` / `dropuser`

Raccourcis pour créer / supprimer un rôle (utilisateur PostgreSQL).

```bash
createuser -h 127.0.0.1 -U postgres --pwprompt --login app_reader
dropuser   -h 127.0.0.1 -U postgres app_reader

```

Équivalent SQL :

```sql
CREATE ROLE app_reader WITH LOGIN PASSWORD 'xxx';
DROP ROLE app_reader;

```

Utilité : onboarding/offboarding simple.

---

### 1.6 `pg_isready`

Vérifie si PostgreSQL répond.

```bash
pg_isready -h 127.0.0.1 -p 5432

```

Te dit : “accepting connections” ou pas.

Tu t’en sers pour :

- monitoring de santé
- vérifier que la DB est prête avant d’exécuter d’autres scripts

---

### 1.7 `pg_ctl` (administration serveur locale)

Démarre / arrête / redémarre une instance PostgreSQL quand tu gères directement le serveur (VM perso, labo).

```bash
pg_ctl -D /var/lib/postgresql/data status
pg_ctl -D /var/lib/postgresql/data stop
pg_ctl -D /var/lib/postgresql/data start

```

En production standard sur Linux, on passe plutôt par `systemctl`, mais `pg_ctl` est utile en environnement labo / custom.

---

### 1.8 `pg_basebackup` (niveau DBA avancé)

Clone physique du cluster PostgreSQL (toutes les bases d’un coup), utilisé pour réplication ou sauvegardes complètes “bas niveau”.

Tu n’en as pas besoin pour manipuler les données au quotidien, mais c’est bon de savoir que ça existe.

---

## 2. Structure d’un script Bash propre pour PostgreSQL

Un script propre doit être lisible, sûr, réutilisable.

Voici les briques que tu dois toujours avoir.

### 2.1 En-tête de sécurité

```bash
#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

```

- `set -e` : arrête le script si une commande échoue (évite de continuer dans un état cassé).
- `set -u` : arrête si tu utilises une variable non définie (protège contre les typos).
- `set -o pipefail` : si tu fais `cmd1 | cmd2`, une erreur dans `cmd1` ne sera pas ignorée.
- `IFS=$'\n\t'` : protège contre les problèmes liés aux espaces dans les noms de fichiers (pas obligatoire, mais sain).

Sans ça, tes scripts ont tendance à “continuer en silence” quand un truc se passe mal. C’est le genre de comportement qui détruit des données.

---

### 2.2 Variables de connexion, toujours en haut

Exemple type :

```bash
DB_HOST="127.0.0.1"        # où se trouve la base
DB_PORT="5432"             # port d'écoute PostgreSQL
DB_NAME="fakeusers"        # base ciblée
DB_USER="developer"        # utilisateur utilisé pour se connecter
DB_PASSWORD="azerty"       # mot de passe (idéalement pas en dur en prod)
TABLE_NAME="users"         # table cible dans ce script
BACKUP_DIR="./backups"     # là où tu stockes tes exports
INPUT_FILE="userdata.csv"  # fichier CSV à importer
OUTPUT_FILE="users_dump.sql" # nom du fichier de sortie
TIMESTAMP=$(date '+%Y%m%d_%H%M%S') # pratique pour horodater
LOGFILE="./db_admin.log"   # fichier log pour tracer ce qu'on fait

```

Pourquoi ces noms importants ?

- `DB_*` → tout ce qui touche à la connexion PostgreSQL.
- `TABLE_NAME` → tu sais sur quelle table tu travailles sans lire tout le script.
- `INPUT_FILE` / `OUTPUT_FILE` → sens clair (entrée vs sortie).
- `TIMESTAMP` → évite d’écraser les sauvegardes.
- `BACKUP_DIR` → tu centralises les dumps.
- `LOGFILE` → tu peux garder l’historique de ce qui s’est passé (utile quand tu fais des batchs de nettoyage).

Note sur `DB_PASSWORD` :

- tu peux éviter de l’écrire en clair en utilisant `PGPASSWORD` ou un fichier `~/.pgpass`, mais le principe reste le même : on veut une source unique de vérité pour les infos de connexion.

---

### 2.3 Wrapper pratique pour `psql`

Pour éviter d’écrire 5 options `-h -p -U -d` à chaque fois :

```bash
PSQL="PGPASSWORD=\"$DB_PASSWORD\" psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -q -t -A"

```

Explication :

- On crée une “commande prête”.
- `PGPASSWORD="$DB_PASSWORD"` permet à `psql` d’utiliser le mot de passe sans te le demander.
- `q` = quiet (moins de bruit visuel)
- `t` = pas d'en-tête et pas d'extra
- `A` = format aligné brut (plus simple à parser dans une variable Bash)

Ensuite tu peux faire :

```bash
COUNT=$($PSQL -c "SELECT COUNT(*) FROM $TABLE_NAME;")
echo "La table $TABLE_NAME contient $COUNT lignes."

```

Ça, c’est de l’or dans un script.

---

### 2.4 Fonction de log

Tu veux tracer ce que tu fais :

```bash
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOGFILE"
}

```

Utilisation :

```bash
log "Début d'import CSV dans $TABLE_NAME"

```

---

## 3. Agir sur les données : lire, importer, nettoyer

### 3.1 Lire des données

Lister quelques lignes :

```bash
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" \
     -c "SELECT id, email FROM $TABLE_NAME LIMIT 10;"

```

Compter des lignes, et utiliser le résultat dans le script :

```bash
USER_COUNT=$($PSQL -c "SELECT COUNT(*) FROM $TABLE_NAME;")
log "Il y a $USER_COUNT lignes dans $TABLE_NAME"

```

👀 Utilité :

- Vérifier que l’import a fonctionné
- Détecter si une purge a vidé la table
- Monitorer la croissance

---

### 3.2 Importer un CSV dans une table

La commande magique pour charger un CSV side client :

```bash
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "\
\COPY $TABLE_NAME(name, email, username, address, phone, website, company)
FROM '$(pwd)/$INPUT_FILE'
DELIMITER ','
CSV HEADER;"

```

Important à comprendre :

- `\COPY` = commande interne de psql (pas du SQL normal)
- `CSV HEADER` = ignore la 1re ligne du fichier CSV
- Les colonnes listées dans `(...)` doivent matcher celles du CSV

Cas d’utilisation :

- alimenter une table de test
- charger des données fournies par un service externe
- enrichir une base “jouet” de démo

Avant d’importer, bon réflexe :

- vérifier que le fichier existe :

```bash
[ -f "$INPUT_FILE" ] || { echo "Fichier $INPUT_FILE introuvable"; exit 1; }

```

- vider la table si tu veux repartir propre :

```bash
$PSQL -c "TRUNCATE TABLE $TABLE_NAME;"
log "Table $TABLE_NAME vidée avant import CSV."

```

---

### 3.3 Nettoyer des données indésirables

Exemple réel : supprimer les emails venant de domaines blacklistés.

1. Construire une condition du type
    
    `email ILIKE '%@spam.com' OR email ILIKE '%@fraud.xyz' ...`
    
2. Lancer un DELETE basé dessus.

Ça se fait en deux phases dans un bon script :

- audit (montrer ce qui VA être supprimé)
- action (supprimer pour de vrai)

Audit :

```bash
$PSQL -c "SELECT id, email
          FROM $TABLE_NAME
          WHERE email ILIKE '%@spam.com'
             OR email ILIKE '%@fraud.xyz';"

```

Action :

```bash
$PSQL -c "DELETE FROM $TABLE_NAME
          WHERE email ILIKE '%@spam.com'
             OR email ILIKE '%@fraud.xyz'
          RETURNING id;"

```

`RETURNING id` te donne les lignes supprimées, ce qui est très utile pour le log.

Ce genre de script = hygiène de base, très classique dans le nettoyage de données brutes.

---

## 4. Sauvegarder et restaurer

### 4.1 Sauvegarder une seule table

```bash
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
pg_dump -h "$DB_HOST" -U "$DB_USER" -t public.$TABLE_NAME "$DB_NAME" \
    > "${BACKUP_DIR}/${TABLE_NAME}_${TIMESTAMP}.sql"
log "Table $TABLE_NAME sauvegardée."

```

Utilité :

- Avant une suppression massive
- Archivage mensuel d’une table métier (ex : logs)

### 4.2 Sauvegarder toute la base

```bash
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
pg_dump -h "$DB_HOST" -U "$DB_USER" "$DB_NAME" \
    > "${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql"
log "Base $DB_NAME sauvegardée."

```

### 4.3 Restaurer un dump SQL

```bash
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f "./backup.sql"

```

Utilité :

- reconstruire un environnement de dev
- rollback rapide après une erreur

💡 Astuce :

Tu peux recréer une nouvelle base propre avec `createdb`, puis restaurer dedans pour tester sans casser la base d’origine.

---

## 5. Gérer les utilisateurs et les droits

Objectif : ne pas donner tout à tout le monde.

C’est fondamental quand tu commences à avoir plusieurs scripts, plusieurs personnes, ou plusieurs apps sur la même base.

### 5.1 Créer un utilisateur lecture seule

```bash
psql -h "$DB_HOST" -U postgres -d postgres \
     -c "CREATE ROLE audit_readonly WITH LOGIN PASSWORD 'ReadOnly123';"

```

Ici :

- `postgres` (user) = superuser qui a le droit de créer des rôles
- `postgres` (db) = base d’admin par défaut

### 5.2 Autoriser la connexion à la base

```bash
psql -h "$DB_HOST" -U postgres -d postgres \
     -c "GRANT CONNECT ON DATABASE $DB_NAME TO audit_readonly;"

```

### 5.3 Donner des droits lecture seule sur une table

```bash
psql -h "$DB_HOST" -U postgres -d "$DB_NAME" \
     -c "GRANT SELECT ON TABLE public.users TO audit_readonly;"

```

Résultat :

- la personne peut se connecter
- elle peut lire `users`
- elle NE PEUT PAS insérer, modifier ou supprimer

Tu peux faire la même chose avec `INSERT`, `UPDATE`, `DELETE`, etc., selon les besoins.

### 5.4 Retirer l’accès

```bash
psql -h "$DB_HOST" -U postgres -d "$DB_NAME" \
     -c "REVOKE SELECT ON TABLE public.users FROM audit_readonly;"

```

### 5.5 Supprimer le rôle

```bash
psql -h "$DB_HOST" -U postgres -d postgres \
     -c "DROP ROLE audit_readonly;"

```

C’est ce que tu utilises pour offboarding, ou pour retirer l’accès à des scripts externes.

---

## 6. Surveiller et diagnostiquer

C’est la partie “est-ce que la base va bien ? qui l’utilise ? est-ce qu’elle souffre ?”

### 6.1 Vérifier que PostgreSQL répond

```bash
pg_isready -h "$DB_HOST" -p "$DB_PORT"

```

Très utile dans un script de supervision ou un cron.

Tu peux logger “OK” / “DOWN”.

### 6.2 Voir les requêtes en cours

```sql
SELECT pid,
       usename,
       client_addr,
       state,
       now() - query_start AS runtime,
       query
FROM pg_stat_activity
ORDER BY runtime DESC
LIMIT 10;

```

Pour le lancer rapidement :

```bash
psql -h "$DB_HOST" -U postgres -d "$DB_NAME" \
     -c "SELECT pid, usename, client_addr, state,
                now() - query_start AS runtime, query
         FROM pg_stat_activity
         ORDER BY runtime DESC
         LIMIT 10;"

```

Pourquoi c’est crucial :

- tu vois les requêtes lentes
- tu vois si quelqu’un bloque la base avec une requête énorme
- tu peux cibler les problèmes de perf

### 6.3 Vérifier la taille de la base et des tables

```sql
SELECT pg_size_pretty(pg_database_size('fakeusers'));
SELECT pg_size_pretty(pg_total_relation_size('public.users'));

```

Utilité :

- détecter des tables qui explosent
- surveiller la croissance disque
- déclencher des archives

### 6.4 Vérifier les locks

```sql
SELECT * FROM pg_locks;

```

Plus avancé :

- sert à comprendre les blocages (transactions qui ne se valident pas, deadlocks potentiels)
- utile en environnement multi-utilisateurs ou quand tu fais des grosses migrations

---

## 7. Maintenance

L’idée : garder la base saine et performante.

### 7.1 VACUUM

```sql
VACUUM ANALYZE public.users;

```

Pourquoi ?

- PostgreSQL ne supprime pas physiquement les lignes supprimées. Elles restent dans le fichier, marquées comme “mortes”.
- VACUUM nettoie les lignes mortes.
- ANALYZE met à jour les stats d’optimisation des requêtes.

Tu exécutes ça :

- après avoir fait beaucoup de `DELETE`
- après un gros import/remplacement
- régulièrement sur les tables qui bougent beaucoup

### 7.2 REINDEX

```sql
REINDEX TABLE public.users;

```

Pourquoi ?

- Les index se fragmentent.
- Un index fragmenté = requêtes plus lentes.
- REINDEX le reconstruit proprement.

### 7.3 Autovacuum

PostgreSQL le fait déjà tout seul en tâche de fond.

Mais tu dois quand même surveiller qu’il suit :

```sql
SELECT relname,
       n_dead_tup,
       last_vacuum,
       last_autovacuum
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC
LIMIT 10;

```

Signes de souci :

- `n_dead_tup` énorme
- `last_autovacuum` trop vieux
    
    → Ça veut dire que la table gonfle sans être nettoyée → vacuum manuel conseillé.
    

---

## 8. Bonnes pratiques Bash pour travailler proprement

### 8.1 Toujours sécuriser le script

```bash
#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

```

- stop immédiat en cas d’erreur
- pas de variable manquante utilisée par accident
- pas d’erreur “cachée” dans un pipe

### 8.2 Séparer CONFIG / ACTION

En haut du script : toutes les variables (DB_NAME, TABLE_NAME, BACKUP_DIR, etc.).

En bas : les actions.

Tu veux pouvoir modifier juste les variables sans réécrire toute la logique.

### 8.3 Vérifier avant d’agir

Avant un import :

```bash
[ -f "$INPUT_FILE" ] || { echo "ERREUR: $INPUT_FILE introuvable"; exit 1; }

```

Avant de supprimer en masse :

1. SELECT pour montrer ce qui sera supprimé.
2. Confirmation utilisateur.
3. DELETE.

### 8.4 Logger

Toujours tracer ce que tu fais :

```bash
log "Export de la table $TABLE_NAME vers ${BACKUP_DIR}/${TABLE_NAME}_${TIMESTAMP}.sql"

```

Tu dois être capable de répondre demain :

“Qu’est-ce que le script a fait hier à 03h12 ?”

### 8.5 Rôles limités

Pour un script qui fait juste des SELECT ou des backups :

→ utilise un rôle lecture seule

→ pas le superuser `postgres`.

Tu limites les dégâts possibles en cas d’erreur.

---

# MariaDB / MySQL

## 1. Les outils en ligne de commande

C’est ce que tu appelles dans tes scripts Bash.

Pour Postgres tu avais `psql`, ici tu as l’écosystème MySQL/MariaDB.

### 1.1 Client SQL interactif : `mysql` / `mariadb`

- Rôle : exécuter des requêtes SQL, lancer des scripts `.sql`, administrer.
- Très utilisé dans l’automatisation.

Version MySQL :

```bash
mysql -h 127.0.0.1 -P 3306 -u root -p -D mydb -e "SELECT COUNT(*) FROM users;"

```

Version MariaDB :

```bash
mariadb -h 127.0.0.1 -P 3306 -u root -p -D mydb -e "SELECT COUNT(*) FROM users;"

```

💡 Sur beaucoup de machines MariaDB, la commande `mysql` existe encore et pointe vers le client MariaDB.

Donc dans la pratique :

- Sur MySQL pur → tu utilises `mysql`
- Sur MariaDB récent → tu peux utiliser `mariadb` (officiel) ou `mysql` (alias historique). Les deux marchent.

Explication des options :

- `h` : host (adresse du serveur)
- `P` : port (3306 par défaut)
- `u` : utilisateur
- `p` : demande le mot de passe (si tu écris `pMonMotDePasse`, il ne demande pas)
- `D` : base/database
- `e "SQL..."` : exécute du SQL vite fait et quitte

Exécution d’un fichier SQL :

```bash
mysql  -h 127.0.0.1 -u root -p mydb   < script.sql    # MySQL
mariadb -h 127.0.0.1 -u root -p mydb  < script.sql    # MariaDB

```

---

### 1.2 Sauvegarde logique (dump) : `mysqldump` / `mariadb-dump`

- Rôle : exporter les données et la structure d’une base ou d’une table dans un fichier `.sql` rejouable plus tard.
- Équivalent de `pg_dump` côté PostgreSQL.

MySQL :

```bash
mysqldump -h 127.0.0.1 -u root -p mydb > mydb_backup.sql

```

MariaDB :

```bash
mariadb-dump -h 127.0.0.1 -u root -p mydb > mydb_backup.sql

```

Sur plein de systèmes MariaDB, `mysqldump` existe encore, donc tu peux voir l’un ou l’autre. Fonctionnellement, même usage.

Tu peux aussi dumper une seule table :

```bash
mysqldump -h 127.0.0.1 -u root -p mydb users > users_backup.sql

```

---

### 1.3 Admin rapide du serveur : `mysqladmin` / `mariadb-admin`

Utilité :

- Vérifier si le serveur est vivant
- Checker l’état global
- (éventuellement arrêter/redémarrer quand tu es en local)

MySQL :

```bash
mysqladmin -h 127.0.0.1 -u root -p ping
mysqladmin -h 127.0.0.1 -u root -p status

```

MariaDB :

```bash
mariadb-admin -h 127.0.0.1 -u root -p ping
mariadb-admin -h 127.0.0.1 -u root -p status

```

`ping` → renvoie `mysqld is alive` si le serveur répond

`status` → renvoie uptime, nombre de requêtes traitées, threads actifs, etc.

Très utile pour des scripts de monitoring.

---

### 1.4 Inspection du contenu : `mysqlshow` / `mariadb-show`

Lister les bases et les tables :

```bash
mysqlshow      -h 127.0.0.1 -u root -p
mysqlshow      -h 127.0.0.1 -u root -p mydb
# ou
mariadb-show   -h 127.0.0.1 -u root -p mydb

```

Tu peux l’utiliser dans un script pour vérifier qu’une base ou une table existe avant d’essayer d’agir dessus.

---

### 1.5 Démarrer / arrêter le serveur

- En production Linux classique :

```bash
sudo systemctl status mariadb
sudo systemctl restart mariadb

sudo systemctl status mysql
sudo systemctl restart mysql

```

- Dans un labo ou un conteneur custom tu peux croiser :

```bash
mysqld_safe ...

```

Mais ça c’est plus “admin serveur SGBD”, moins pour le scripting de données.

---

Résumé outils :

- `mysql` / `mariadb` → exécuter du SQL
- `mysqldump` / `mariadb-dump` → sauvegarder
- `mysqladmin` / `mariadb-admin` → ping, status, monitoring rapide
- `mysqlshow` / `mariadb-show` → introspection (quelles tables existent ?)

Ceux-là suffisent pour 90 % de ce que tu feras en script Bash.

---

## 2. Structure d’un script Bash propre (MySQL / MariaDB)

C’est la même discipline que pour PostgreSQL.

Tu veux de la sécurité, de la lisibilité, et de la réutilisabilité.

### 2.1 Sécurité en tête de script

```bash
#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

```

- `set -e` : arrête le script si une commande échoue
- `set -u` : arrête si tu utilises une variable pas définie (typo = crash immédiat plutôt que comportement bizarre)
- `set -o pipefail` : si tu fais `cmd1 | cmd2`, une erreur dans cmd1 ne passe pas inaperçue
- `IFS=$'\n\t'` : évite certains pièges avec les espaces dans les noms de fichiers (optionnel mais bonne hygiène)

Tu peux aussi ajouter un mini logger :

```bash
LOGFILE="./db_admin.log"
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOGFILE"
}

```

---

### 2.2 Variables de connexion

Toujours définir toutes les infos de connexion au même endroit en haut du script.

Comme ça tu ne répètes pas partout, et tu peux réutiliser le script pour une autre base juste en changeant ces lignes.

```bash
DB_HOST="127.0.0.1"
DB_PORT="3306"
DB_NAME="mydb"
DB_USER="adminuser"
DB_PASSWORD="monSuperMdp"

TABLE_NAME="users"

INPUT_FILE="userdata.csv"   # CSV à importer
BACKUP_DIR="./backups"      # où tu poses les dump .sql
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
OUTPUT_FILE="${TABLE_NAME}_${TIMESTAMP}.sql"
LOGFILE="./db_admin.log"

```

Pourquoi ces noms sont bons :

- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` → tout ce qui concerne la connexion à la base
- `TABLE_NAME` → la table cible principale du script
- `INPUT_FILE` / `OUTPUT_FILE` → pour les imports / exports
- `BACKUP_DIR`, `TIMESTAMP` → très utile dès que tu automatises des backups
- `LOGFILE` → traçabilité

Note mot de passe :

- Tu peux passer le mot de passe à la commande avec `p$DB_PASSWORD`
- Mais ça peut être visible dans `ps aux` sur certaines machines
- En prod on stocke souvent ces infos dans un fichier de conf lisible uniquement par root ou un compte de service
- Pour un exercice / environnement perso : ok

---

### 2.3 Wrapper réutilisable pour exécuter du SQL

Au lieu d’écrire toute la commande `mysql` à chaque fois, tu fais un raccourci :

Version générique MySQL :

```bash
MYSQL="mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD -D $DB_NAME --batch --skip-column-names"

```

Version générique MariaDB :

```bash
MARIADB="mariadb -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD $DB_NAME --batch --skip-column-names"

```

Remarques :

- `-batch` et `-skip-column-names` évitent les formats jolis et les en-têtes, c’est mieux pour récupérer les résultats dans une variable Bash.
- Selon ton environnement tu vas soit utiliser `$MYSQL ...`, soit `$MARIADB ...`.
- Si tu veux faire un cours qui fonctionne pour les deux, tu peux tester lequel est dispo :

```bash
if command -v mariadb >/dev/null 2>&1; then
    DBCLIENT="mariadb -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD $DB_NAME --batch --skip-column-names"
else
    DBCLIENT="mysql   -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD -D $DB_NAME --batch --skip-column-names"
fi

```

Et ensuite tu utilises :

```bash
ROW_COUNT=$($DBCLIENT -e "SELECT COUNT(*) FROM $TABLE_NAME;")
log "Il y a $ROW_COUNT lignes dans $TABLE_NAME"

```

Très propre.

---

## 3. Exploiter les données

### 3.1 Lire des données (SELECT depuis Bash)

Lister quelques lignes d’une table :

```bash
$DBCLIENT -e "SELECT id, email FROM $TABLE_NAME LIMIT 10;"

```

Compter des lignes et réutiliser le résultat dans le script :

```bash
USER_COUNT=$($DBCLIENT -e "SELECT COUNT(*) FROM $TABLE_NAME;")
log "Utilisateurs existants : $USER_COUNT"

```

Ce pattern (faire une requête SQL → stocker le résultat dans une variable Bash) est la base pour :

- du monitoring
- des vérifications avant import
- des alertes (“si plus de 1 000 000 lignes, fais une archive”)

---

### 3.2 Importer un CSV massivement dans une table

Le plus classique côté MySQL/MariaDB est `LOAD DATA INFILE`.

Deux variantes importantes :

### Variante 1 : `LOAD DATA INFILE` (fichier lu côté serveur)

Disponible MySQL et MariaDB, mais :

- le fichier doit être accessible par le serveur lui-même
- ça dépend d’options de sécurité (`secure_file_priv`)

```sql
LOAD DATA INFILE '/chemin/absolu/userdata.csv'
INTO TABLE users
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(name, email, username, address, phone, website, company);

```

Pour l’exécuter depuis Bash :

```bash
$DBCLIENT -e "
LOAD DATA INFILE '/chemin/absolu/$INPUT_FILE'
INTO TABLE $TABLE_NAME
FIELDS TERMINATED BY ','
ENCLOSED BY '\"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(name, email, username, address, phone, website, company);
"

```

### Variante 2 : `LOAD DATA LOCAL INFILE` (fichier lu côté client)

Très utile quand ton script tourne sur ta machine ou dans un conteneur client, pas sur le serveur BDD.

Tu dois activer `--local-infile=1`.

**MySQL :**

```bash
mysql --local-infile=1 -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
  -e "
LOAD DATA LOCAL INFILE '$INPUT_FILE'
INTO TABLE $TABLE_NAME
FIELDS TERMINATED BY ','
ENCLOSED BY '\"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(name, email, username, address, phone, website, company);
"

```

**MariaDB :**

```bash
mariadb --local-infile=1 -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
  -e "
LOAD DATA LOCAL INFILE '$INPUT_FILE'
INTO TABLE $TABLE_NAME
FIELDS TERMINATED BY ','
ENCLOSED BY '\"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(name, email, username, address, phone, website, company);
"

```

C’est l’équivalent conceptuel du `\COPY` côté PostgreSQL : tu pousses un CSV dans la table de façon massive.

---

### 3.3 Nettoyage des données (suppression conditionnelle)

Exemple : supprimer tous les emails de domaines blacklistés.

Phase 1 : audit (montre ce que tu vas supprimer)

```bash
$DBCLIENT -e "
SELECT id, email
FROM $TABLE_NAME
WHERE email LIKE '%@spam.com'
   OR email LIKE '%@fraud.xyz';
"

```

Phase 2 : confirmation utilisateur en Bash

```bash
read -p "Supprimer ces entrées ? (oui/non) " ANSWER

```

Phase 3 : exécution

```bash
if [ "$ANSWER" = "oui" ]; then
    $DBCLIENT -e "
    DELETE FROM $TABLE_NAME
    WHERE email LIKE '%@spam.com'
       OR email LIKE '%@fraud.xyz';
    "
    log "Purge effectuée."
else
    log "Purge annulée."
fi

```

Astuce :

- MySQL / MariaDB n’ont pas `DELETE ... RETURNING id` comme PostgreSQL.
- Donc si tu veux garder trace de ce que tu supprimes, tu dois SELECT avant DELETE et logguer ce SELECT.

---

## 4. Sauvegarde et restauration

### 4.1 Sauvegarder toute une base (dump complet)

MySQL :

```bash
mysqldump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
    > "${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql"
log "Dump de la base $DB_NAME sauvegardé."

```

MariaDB :

```bash
mariadb-dump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
    > "${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql"
log "Dump de la base $DB_NAME sauvegardé."

```

Ce fichier `.sql` contient :

- les commandes `CREATE TABLE ...`
- les `INSERT INTO ...`
- et les index

Tu peux rejouer ce fichier pour recréer la base.

---

### 4.2 Sauvegarder uniquement une table

MySQL :

```bash
mysqldump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" "$TABLE_NAME" \
    > "${BACKUP_DIR}/${TABLE_NAME}_${TIMESTAMP}.sql"

```

MariaDB :

```bash
mariadb-dump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" "$TABLE_NAME" \
    > "${BACKUP_DIR}/${TABLE_NAME}_${TIMESTAMP}.sql"

```

Cas d’usage :

- snapshot avant une purge
- archivage mensuel d’une table “logs”

---

### 4.3 Restaurer un dump (`.sql`) dans une base

MySQL :

```bash
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
    < "./backup.sql"

```

MariaDB :

```bash
mariadb -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
    < "./backup.sql"

```

Logique :

1. Tu prépares une base vide (ex: `mydb_test`)
2. Tu réinjectes le dump
3. Tu testes dedans

Tu peux créer une base vide avant de restaurer :

```bash
mysql   -h "$DB_HOST" -u root -p -e "CREATE DATABASE mydb_test;"
mariadb -h "$DB_HOST" -u root -p -e "CREATE DATABASE mydb_test;"

```

---

## 5. Gestion des utilisateurs et des droits

MySQL et MariaDB utilisent `CREATE USER`, `GRANT`, `REVOKE`, `DROP USER`, avec la même logique générale.

### 5.1 Créer un utilisateur dédié

MySQL :

```bash
mysql -h "$DB_HOST" -u root -p -e "
CREATE USER 'app_reader'@'%' IDENTIFIED BY 'LectureSeulement123';
"

```

MariaDB :

```bash
mariadb -h "$DB_HOST" -u root -p -e "
CREATE USER 'app_reader'@'%' IDENTIFIED BY 'LectureSeulement123';
"

```

Notes :

- `'user'@'%'` = cet utilisateur peut se connecter depuis n’importe quelle IP.
- Tu peux restreindre : `'user'@'127.0.0.1'` (= uniquement en local)

---

### 5.2 Donner des droits lecture seule

MySQL :

```bash
mysql -h "$DB_HOST" -u root -p -e "
GRANT SELECT ON $DB_NAME.* TO 'app_reader'@'%';
FLUSH PRIVILEGES;
"

```

MariaDB :

```bash
mariadb -h "$DB_HOST" -u root -p -e "
GRANT SELECT ON $DB_NAME.* TO 'app_reader'@'%';
FLUSH PRIVILEGES;
"

```

Explication :

- `GRANT SELECT ON base.*` = cet utilisateur peut lire toutes les tables de la base
- `FLUSH PRIVILEGES;` = recharge les droits immédiatement

Tu peux aussi donner des droits spécifiques :

```sql
GRANT INSERT, UPDATE, DELETE ON mydb.users TO 'batch_user'@'localhost';

```

---

### 5.3 Retirer les droits

MySQL :

```bash
mysql -h "$DB_HOST" -u root -p -e "
REVOKE SELECT ON $DB_NAME.* FROM 'app_reader'@'%';
FLUSH PRIVILEGES;
"

```

MariaDB :

```bash
mariadb -h "$DB_HOST" -u root -p -e "
REVOKE SELECT ON $DB_NAME.* FROM 'app_reader'@'%';
FLUSH PRIVILEGES;
"

```

---

### 5.4 Supprimer l’utilisateur

MySQL :

```bash
mysql -h "$DB_HOST" -u root -p -e "
DROP USER 'app_reader'@'%';
"

```

MariaDB :

```bash
mariadb -h "$DB_HOST" -u root -p -e "
DROP USER 'app_reader'@'%';
"

```

Ceci est ton offboarding “propre”.

---

## 6. Monitoring et diagnostic

Ici tu veux savoir si la base est vivante, qui est connecté, si ça rame, si ça gonfle.

### 6.1 Vérifier que la DB répond

MySQL :

```bash
mysqladmin -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" ping

```

MariaDB :

```bash
mariadb-admin -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" ping

```

Si c’est UP → `mysqld is alive`.

Tu peux t’en servir dans un script santé/cron.

---

### 6.2 Statut global rapide

MySQL :

```bash
mysqladmin -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" status

```

MariaDB :

```bash
mariadb-admin -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" status

```

Tu récupères :

- uptime
- threads running
- requêtes traitées
- slow queries

Tu peux logger ça régulièrement pour avoir un historique de santé.

---

### 6.3 Voir les requêtes en cours (qui fait quoi ?)

SQL commun MySQL/MariaDB :

```sql
SHOW PROCESSLIST;

```

En Bash :

```bash
$DBCLIENT -e "SHOW PROCESSLIST;"

```

Tu y vois pour chaque connexion :

- l’utilisateur (`User`)
- l’IP source (`Host`)
- la commande courante (`Command`)
- le temps (`Time`)
- la requête en cours (`Info`)

Très utile pour :

- voir les requêtes lentes encore en cours
- savoir qui bloque une table

---

### 6.4 Taille des tables (savoir qui prend de la place)

Tu interroges `information_schema.TABLES` :

```bash
$DBCLIENT -e "
SELECT table_name,
       ROUND((data_length + index_length)/1024/1024,2) AS size_mb
FROM information_schema.TABLES
WHERE table_schema = '$DB_NAME'
ORDER BY size_mb DESC;
"

```

Ce que ça t’apporte :

- tu repères les tables qui explosent
- tu décides quoi archiver ou purger
- tu détectes si un log applicatif n’est jamais vidé

---

### 6.5 Alerte basique si ça part mal

Exemple : alerter si une table dépasse 1 Go.

```bash
SIZE_MB=$($DBCLIENT -e "
SELECT ROUND((data_length + index_length)/1024/1024,0)
FROM information_schema.TABLES
WHERE table_schema = '$DB_NAME' AND table_name = '$TABLE_NAME';
")

if [ "$SIZE_MB" -gt 1000 ]; then
    log "ALERTE: $TABLE_NAME fait ${SIZE_MB}MB"
fi

```

---

## 7. Maintenance

En MySQL/MariaDB, tu vas voir souvent :

### 7.1 OPTIMIZE TABLE

```bash
$DBCLIENT -e "OPTIMIZE TABLE $TABLE_NAME;"

```

- Réorganise physiquement la table
- Récupère de l’espace après beaucoup de DELETE
- Peut améliorer les performances

Disponible MySQL et MariaDB, comportement interne légèrement différent selon le moteur de stockage (InnoDB / Aria) mais même usage pour toi.

---

### 7.2 ANALYZE TABLE

```bash
$DBCLIENT -e "ANALYZE TABLE $TABLE_NAME;"

```

- Met à jour les statistiques d’index
- Aide l’optimiseur de requêtes à choisir le bon plan
- À faire après un gros import

Disponible MySQL et MariaDB.

---

### 7.3 CHECK TABLE

```bash
$DBCLIENT -e "CHECK TABLE $TABLE_NAME;"

```

- Vérifie l’intégrité de la table
- Utile si tu soupçonnes une corruption après un crash
- Plus pertinent sur certains moteurs que d’autres, mais c’est un réflexe d’admin MySQL/MariaDB

---

## 8. Bonnes pratiques Bash quand tu pilotes MySQL / MariaDB

C’est là que tu prends les bons réflexes d’admin sérieux 👇

### 8.1 Toujours sécuriser ton script

```bash
#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

```

→ évite les “j’ai détruit la prod parce que mon script a continué après une erreur”.

### 8.2 Toujours regrouper la config DB_* en haut

Tu dois pouvoir relire le haut du script et comprendre :

“ok, je me connecte à quelle base, en tant que qui, et je vais toucher quoi”.

### 8.3 Toujours logger les actions

Utilise une fonction `log` pour tracer :

- ce que tu importes
- quand tu fais un dump
- ce que tu supprimes

Tu dois pouvoir dire demain : “qu’est-ce qui a tourné cette nuit ?”.

### 8.4 Toujours faire un audit avant un DELETE massif

Pattern obligatoire :

1. `SELECT ... WHERE ...` → prévisualisation
2. Confirmation manuelle
3. `DELETE ... WHERE ...`

Tu ne supprimes jamais sans avoir vu ce que tu vas supprimer.

### 8.5 Toujours faire un dump avant une opération destructive

Avant une purge de table → `mysqldump` / `mariadb-dump` de la table.

Comme ça tu peux restaurer juste cette table si tu as fait une bêtise.

### 8.6 N’utilise pas toujours `root`

Crée des comptes dédiés :

- un compte lecture seule (GRANT SELECT)
- un compte batch (INSERT/UPDATE autorisé uniquement sur certaines tables)
- réserve `root` / `mysql.sys` / `mariadb root` pour l’admin pur

C’est ta sécurité.

Si un script se trompe, il casse moins de choses.

