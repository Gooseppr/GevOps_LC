---
titre: Pratique Docker Compose
type: module
jour: 12
ordre: 2
tags: docker
---

## 1. Docker / Docker Compose : kit de survie

### Lancer / arrêter une stack

```bash
docker compose up         # lance les services et affiche les logs
docker compose up -d      # lance en arrière-plan
docker compose down       # arrête et supprime les conteneurs + le réseau
docker compose down -v    # arrête ET supprime aussi les volumes nommés (⚠ destructif)
docker compose ps         # état des services de CETTE stack
docker ps                 # état de TOUS les conteneurs Docker sur la machine

```

➡ `docker compose ps` = ce projet uniquement

➡ `docker ps` = la machine entière

### Aller dans un conteneur

Tu l’as fait sur nginx, postgres, etc.

```bash
docker compose exec <service> bash
# ex:
docker compose exec nginx bash
docker compose exec database bash

```

Important :

- `<service>` = le nom du service dans le `docker-compose.yml`, pas `varenv-database-1` ou un ID.
- Si `bash` n’existe pas (images très minimalistes), essaie `sh`.

### Voir les logs

```bash
docker compose logs <service>
docker compose logs -f <service>   # -f = suivre en live

```

### Inspecter un conteneur (toutes ses infos runtime)

```bash
docker inspect <nom_conteneur>

```

Et pour ne récupérer QUE l’IP interne Docker du conteneur :

```bash
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' postgresql_db-database-1

```

Tip : si cette commande renvoie rien, souvent le conteneur est en échec / restart loop → donc pas d’IP attribuée.

### Images / build

```bash
docker build -t mymails .
docker images

```

---

## 2. Réseau / ports / accès

### Exposer un service web

Exemple nginx :

```yaml
services:
  nginx:
    image: monnginx
    ports:
      - "8080:81"

```

Traduction :

- `8080` = port sur l’hôte (ta VM)
- `81` = port dans le conteneur
- Donc `curl http://localhost:8080` arrive dans le nginx du conteneur, sur son port 81

Formulation à connaître :

> “ports mappe un port de l’hôte vers un port du conteneur.”
> 

### Conflit de port

Tu as eu l’erreur `address already in use` quand tu as essayé de publier Postgres sur `5432:5432` alors que le port 5432 était déjà occupé sur la VM.

Fix propre :

```yaml
ports:
  - "5433:5432"

```

→ Maintenant tu interroges Postgres sur `localhost:5433`, mais dans le conteneur il écoute toujours sur 5432.

Formulation claire :

> “Si le port est déjà pris sur la machine, je peux binder un autre port hôte vers le port interne du conteneur.”
> 

### Réseau interne entre services

Tu as vu qu’on peut déclarer plusieurs services qui parlent entre eux dans le même `docker-compose.yml`, par exemple nginx + mariadb, ou app + database.

Version simplifiée :

```yaml
services:
  web:
    image: monnginx
    depends_on:
      - database
    networks:
      - app-network

  database:
    image: mariadb
    environment:
      MARIADB_ROOT_PASSWORD: azerty
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

```

Points importants :

- Tous les services dans le même réseau Docker (`app-network`) peuvent se parler.
- Le nom du service devient un hostname. Exemple : `web` peut contacter `database` juste avec `database` comme host.
- `depends_on` dit simplement : “démarre `database` avant `web`”.

Formule à sortir :

> “Dans Docker Compose, le nom du service devient un hostname DNS interne.”
> 

---

## 3. Volumes et persistance

C’est un point que tu as très bien pratiqué avec nginx.

### Cas 1 : sans volume

1. Tu lances nginx avec Compose.
2. Tu vas dedans :
    
    ```bash
    docker compose exec nginx bash
    
    ```
    
3. Tu modifies le HTML directement dans le conteneur :
    
    ```bash
    echo "<p>This is a test</p>" > /usr/share/nginx/html/index-lacapsule.html
    
    ```
    
4. Tu vérifies :
    
    ```bash
    curl http://localhost:8080
    
    ```
    
    → Tu vois bien “This is a test”.
    
5. Ensuite tu détruis le conteneur :
    
    ```bash
    docker compose down
    docker compose up -d
    curl http://localhost:8080
    
    ```
    

➡ Le changement est PERDU.

Pourquoi ?

- Parce que ce que tu avais modifié vivait uniquement DANS ce conteneur-là.
- Quand tu détruis le conteneur, tu perds ces modifs.

Phrase clé :

> “Modifier un fichier à l’intérieur du conteneur, c’est temporaire. À la recréation, tu repars de l’image d’origine.”
> 

---

### Cas 2 : avec volume bind mount (HTML nginx)

Tu as ensuite monté un dossier local dans le conteneur :

```yaml
services:
  nginx:
    image: nginx-lacapsule:latest
    ports:
      - "8080:81"
    volumes:
      - ./html:/usr/share/nginx/html

```

Conséquences immédiates :

- Docker crée `./html` à côté de ton `docker-compose.yml` (si ça n’existait pas).
- Tout ce qu’il y a dans `./html` devient le contenu servi par nginx.

Étapes que tu as faites :

1. Vérifier que `./html` existe :
    
    ```bash
    ls -l ./html
    
    ```
    
2. Créer/modifier `index-lacapsule.html` **depuis ta machine** (pas dans le conteneur) :
    
    ```bash
    echo "<h1>Hello bind mount</h1>" > ./html/index-lacapsule.html
    
    ```
    
3. Tester :
    
    ```bash
    curl http://localhost:8080
    
    ```
    
    → Tu vois “Hello bind mount”.
    
4. Redéploiement :
    
    ```bash
    docker compose down
    docker compose up -d
    curl http://localhost:8080
    
    ```
    

➡ La modification RESTE.

Conclusion :

- Maintenant le contenu vient du dossier `./html` de l’hôte, pas du filesystem interne du conteneur.
- Donc tant que ce dossier existe chez toi, tu ne perds pas le contenu.

Phrase clé :

> “Avec ./html:/usr/share/nginx/html, c’est mon host qui fournit le contenu du site. Donc mes changements survivent, même si je détruis le conteneur.”
> 

### Cas 3 : deuxième volume pour les logs

Tu as aussi monté les logs nginx :

```yaml
services:
  nginx:
    image: nginx-lacapsule:latest
    ports:
      - "8080:81"
    volumes:
      - ./html:/usr/share/nginx/html
      - ./logs:/var/log/nginx

```

Maintenant :

- Docker crée aussi `./logs`
- Les accès et erreurs nginx sont écrits directement dans `./logs` sur ta machine

Tu peux faire :

```bash
ls ./logs
cat ./logs/access.log
cat ./logs/error.log

```

Utilité :

- Tu n’as pas besoin d’entrer dans le conteneur pour voir les logs.
- Tu gardes l’historique entre redéploiements.

Phrase clé :

> “Je peux monter un répertoire local dans /var/log/nginx pour récupérer les logs Nginx sur ma machine hôte, en direct.”
> 

---

## 4. Base de données PostgreSQL avec Docker

Ici tu as appris ce qu’on attend d’un vrai déploiement de base dans Docker.

### Déclarer le service Postgres

Version “propre” qu’on converge vers :

```yaml
services:
  database:
    image: postgres:latest
    environment:
      POSTGRES_DB: lacapsule_pg_db
      POSTGRES_USER: developer
      POSTGRES_PASSWORD: acknowledge_me
    ports:
      - "5433:5432"
    volumes:
      - db_data:/var/lib/postgresql

volumes:
  db_data:

```

Ce qu’il faut retenir :

- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` = initialisation de la base au premier lancement
- `ports "5433:5432"` = tu peux te connecter depuis l’hôte avec `psql -h localhost -p 5433`
- `db_data` est un volume Docker nommé qui persiste les fichiers de la DB

### Vérifier que ça tourne

```bash
docker compose up -d
docker compose ps
docker volume ls

```

Tu dois voir :

- ton conteneur `database` en `Up`
- ton volume `db_data`

### Te connecter avec psql

Depuis ta VM :

```bash
psql -h localhost -p 5433 -U developer -d lacapsule_pg_db

```

Mot de passe : `acknowledge_me`

Dans psql :

```sql
SELECT VERSION();

CREATE TABLE test_table (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50)
);

INSERT INTO test_table (name) VALUES ('persist check');
SELECT * FROM test_table;

```

Tu dois voir qu’il crée la table et que tu peux lire la ligne.

### Tester la persistance

```bash
docker compose down
docker compose up -d
psql -h localhost -p 5433 -U developer -d lacapsule_pg_db -c "SELECT * FROM test_table;"

```

→ Si la table et la donnée sont encore là : persistance validée ✅

Phrase clé :

> “Mes données Postgres survivent à docker compose down parce qu’elles vivent dans le volume db_data monté sur /var/lib/postgresql, pas juste dans le conteneur.”
> 

### Bonus Adminer (UI web pour la DB)

Tu peux ajouter un deuxième service :

```yaml
services:
  database:
    image: postgres:latest
    environment:
      POSTGRES_PASSWORD: acknowledge_me
    ports:
      - "5432:5432"
    volumes:
      - db_data:/var/lib/postgresql

  adminer:
    image: adminer
    ports:
      - "8080:8080"

volumes:
  db_data:

```

Utilisation :

- tu vas sur `http://localhost:8080`
- tu utilises `database` comme host (c’est le nom du service)
- tu rentres ton user / password Postgres

Phrase clé :

> “Adminer est un deuxième conteneur, pas une install locale. Il se connecte à la DB via le réseau Docker interne.”
> 

---

## 5. Variables d’environnement

C’est l’autre gros bloc que tu as maîtrisé.

### Cas A : variable définie dans l’image (Dockerfile)

`Dockerfile` :

```docker
FROM debian:latest
ENV EMAIL="admin@test.com"
CMD ["bash", "-c", "echo ${EMAIL}"]

```

Build :

```bash
docker build -t mymails .

```

Test direct :

```bash
docker run mymails
# => admin@test.com

```

Donc `ENV` dans le Dockerfile crée une valeur par défaut.

### Cas B : override dans Docker Compose

`docker-compose.yml` :

```yaml
services:
  mymails:
    image: mymails
    environment:
      EMAIL: admin2@test2.com

```

Lance (en attaché) :

```bash
docker compose up mymails
# ou
docker compose run --rm mymails

```

Sortie attendue :

```
admin2@test2.com

```

Donc `environment:` écrase la valeur `ENV` du Dockerfile.

Phrase clé :

> “Compose peut surcharger les variables d’environnement d’une image sans rebuild.”
> 

### Cas C : env_file (fichier dédié)

`.mymails.env` :

```
EMAIL=custom@example.com

```

Compose :

```yaml
services:
  mymails:
    image: mymails
    env_file:
      - .mymails.env

```

Lance :

```bash
docker compose run --rm mymails

```

Résultat :

```
custom@example.com

```

Et tu peux combiner les deux :

```yaml
services:
  mymails:
    image: mymails
    env_file:
      - .mymails.env
    environment:
      EMAIL: "final@example.org"

```

Résultat final :

```
final@example.org

```

Priorité :

1. `environment:` dans Compose (gagne)
2. `env_file:` (milieu)
3. `ENV` dans le Dockerfile (par défaut)

Phrase à retenir :

> “On met les secrets, mots de passe, mails par environnement dans un fichier .env qu’on ne commit pas. On les injecte avec env_file:.”
>

---
[← Module précédent](012_docker-compose.md)
---

---
[← Module précédent](012_docker-compose.md)
---

---
[← Module précédent](012_docker-compose.md)
---

---
[← Module précédent](012_docker-compose.md)
---

---
[← Module précédent](012_docker-compose.md)
---

---
[← Module précédent](012_docker-compose.md)
---

---
[← Module précédent](012_docker-compose.md)
---

---
[← Module précédent](012_docker-compose.md)
---

---
[← Module précédent](012_docker-compose.md)
---

---
[← Module précédent](012_docker-compose.md)
---
