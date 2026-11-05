---
layout: page
title: "Installation et premier démarrage"

course: grafana
chapter_title: "Fondations"

chapter: 1
section: 3

tags: grafana,docker,docker-compose,installation,configuration,observabilite
difficulty: beginner
duration: 75
mermaid: true

status: "published"
prev_module: "/courses/grafana/02_architecture_ecosysteme.html"
prev_module_title: "Architecture et écosystème Grafana"
next_module: "/courses/grafana/04_interface_navigation.html"
next_module_title: "Interface et navigation Grafana"
---

# Installation et premier démarrage

## Objectifs pédagogiques

- Déployer Grafana avec Docker Compose, avec un volume persistant et une version d'image figée
- Distinguer les trois voies d'installation (conteneur, paquet Linux, Grafana Cloud) et choisir selon le contexte
- Configurer une instance avec `grafana.ini` et les variables `GF_*`, et prédire laquelle l'emporte
- Vérifier la santé du service avec `/api/health` et lire les logs de démarrage pour identifier une erreur
- Éviter les deux pièges de départ : les identifiants par défaut et les données stockées dans un volume éphémère

## Mise en situation

Vous rejoignez une équipe de quatre personnes qui exploite une quarantaine de VM et quelques services web. La supervision actuelle se limite à des scripts qui envoient un e-mail quand un disque dépasse 90 %. Quelqu'un a lancé un jour un Grafana de test sur son poste avec un simple `docker run`. Le tableau de bord a plu, et on vous demande de le « mettre sur un serveur pour que tout le monde y accède ».

Le piège est là. Le `docker run` du poste de dev a tourné dix jours sans problème. Au premier `docker rm` suivi d'une mise à jour de l'image, les dashboards, les utilisateurs et les connexions aux sources ont disparu, et le compte `admin` avait toujours son mot de passe `admin`. Une instance qui démarre n'est pas encore une instance exploitable. L'écart entre les deux fait l'objet de ce module : où Grafana range ses données, comment on le configure sans bricolage, et comment on sait qu'il va bien.

Ici, on installe Grafana seul. Il n'a encore aucune donnée à afficher, et le branchement des sources vient au module 5.

## Choisir sa voie d'installation

Il existe trois façons raisonnables de démarrer. Le choix dépend surtout de qui gère le serveur derrière.

| Critère | Docker Compose | Paquet Linux (APT/RPM) | Grafana Cloud |
|---|---|---|---|
| Temps jusqu'au premier écran | 2 à 3 minutes | 5 à 10 minutes | quelques minutes (inscription) |
| Qui maintient l'hôte | vous | vous | Grafana Labs |
| Accès à `grafana.ini` | oui (fichier monté ou variables) | oui (`/etc/grafana/`) | non, réglages via le portail |
| Mise à jour | changer le tag d'image | `apt upgrade` / `dnf upgrade` | automatique |
| Reproductibilité | excellente (un fichier versionné) | moyenne (état de la machine) | sans objet |
| Cas typique | lab, petite équipe, base d'une plateforme | VM dédiée, politique « pas de conteneurs » | démarrer vite sans infra |

Ce module développe Docker Compose, qui sert de fil rouge pour le reste du parcours, puis présente brièvement les deux autres voies.

## Docker Compose : de zéro à une instance qui tient

### Ce que Grafana écrit sur le disque

Avant de choisir où poser les volumes, il faut savoir ce qui doit survivre. Dans l'image officielle, Grafana utilise quelques chemins :

| Chemin dans le conteneur | Contenu | À persister ? |
|---|---|---|
| `/var/lib/grafana` | base SQLite `grafana.db` (dashboards, utilisateurs, organisations, sources de données, alertes), plugins, sessions | **Oui, impérativement** |
| `/etc/grafana/grafana.ini` | configuration (optionnelle, les valeurs par défaut sont embarquées) | Oui si vous la personnalisez |
| `/etc/grafana/provisioning` | définitions de sources/dashboards chargées au démarrage | Oui, abordé au module 25 |
| `/var/log/grafana` | fichiers de logs (dans l'image, Grafana écrit sur la sortie standard) | Non, utilisez `docker logs` |

🧠 **Concept clé** : par défaut, Grafana stocke tout son état dans une base SQLite, un seul fichier `grafana.db` dans `/var/lib/grafana`. Un conteneur est jetable, ce fichier ne l'est pas. Si le dossier vit dans la couche inscriptible du conteneur, la recréation du conteneur l'efface. Le volume ne sert donc pas à « sauvegarder » : il sépare ce qui est jetable (le programme) de ce qui est précieux (l'état).

### Version 1 : le `docker run` qui marche... jusqu'au premier incident

```bash
docker run -d --name grafana -p 3000:3000 grafana/grafana
```

Au bout d'une dizaine de secondes, `http://localhost:3000` répond. C'est parfait pour regarder à quoi ça ressemble, et dangereux pour tout le reste. Il y a trois défauts :

- Aucun volume : `docker rm grafana` détruit tout.
- Aucun tag : `latest` change avec le temps, donc la version que vous aurez dans six mois n'est pas celle d'aujourd'hui.
- Identifiants `admin` / `admin`.

### Version 2 : Compose, volume nommé, version figée

On passe à un fichier versionnable. Créez un dossier de travail avec `compose.yaml` et un fichier `.env` à côté :

```yaml
services:
  grafana:
    image: grafana/grafana:13.3.0   # exemple : choisissez une version stable actuelle
    container_name: grafana
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      GF_SECURITY_ADMIN_USER: ${GRAFANA_ADMIN_USER:-ops-admin}
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_ADMIN_PASSWORD:?définir GRAFANA_ADMIN_PASSWORD dans .env}
    volumes:
      - grafana-data:/var/lib/grafana

volumes:
  grafana-data:
```

```bash
# .env : à ne jamais committer
GRAFANA_ADMIN_USER=ops-admin
GRAFANA_ADMIN_PASSWORD=<MOT_DE_PASSE_LONG_ET_UNIQUE>
```

Pensez aussi à `echo ".env" >> .gitignore` dès maintenant.

Chaque ligne règle un problème de la v1. Le tag fixe rend le déploiement reproductible, et vous décidez du moment où vous montez de version. Le volume nommé `grafana-data` survit aux `docker compose down` et aux recréations de conteneur. Il est géré par Docker, avec les bons droits d'office. `restart: unless-stopped` relance Grafana après un redémarrage du serveur. La syntaxe `${VAR:?message}` fait échouer `docker compose up` avec un message clair si le mot de passe n'est pas défini, au lieu de démarrer avec une valeur vide ou par défaut.

Démarrage et contrôle :

```bash
docker compose up -d
docker compose ps
```

⚠️ **Erreur fréquente** : croire que `GF_SECURITY_ADMIN_PASSWORD` change le mot de passe à chaque démarrage. Il n'est lu qu'à l'initialisation de la base, quand `grafana.db` n'existe pas encore. Si vous modifiez la variable après le premier lancement, rien ne change et `docker compose up` ne dit rien. Pour un compte existant, passez par l'interface ou par :

```bash
docker compose exec grafana grafana cli admin reset-admin-password <NOUVEAU_MOT_DE_PASSE>
```

### Version 3 : configuration fichier, exposition limitée, healthcheck

Dès que l'instance sert à plus d'une personne, trois besoins apparaissent : un `grafana.ini` versionné pour les réglages stables, un port qui n'écoute pas sur toutes les interfaces, et un contrôle de santé automatique.

```yaml
services:
  grafana:
    image: grafana/grafana:13.3.0
    container_name: grafana
    restart: unless-stopped
    ports:
      - "127.0.0.1:3000:3000"          # accessible seulement depuis l'hôte (ou un reverse proxy local)
    environment:
      GF_SECURITY_ADMIN_USER: ${GRAFANA_ADMIN_USER:-ops-admin}
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_ADMIN_PASSWORD:?définir GRAFANA_ADMIN_PASSWORD dans .env}
    volumes:
      - grafana-data:/var/lib/grafana
      - ./grafana.ini:/etc/grafana/grafana.ini:ro
    healthcheck:
      test: ["CMD-SHELL", "wget -q --spider http://localhost:3000/api/health || exit 1"]
      interval: 30s
      timeout: 5s
      retries: 3

volumes:
  grafana-data:
```

Créez `grafana.ini` (exemple plus bas) avant le `docker compose up` : si le fichier est absent, Docker crée un répertoire à sa place et le montage échoue. Le préfixe `127.0.0.1:` sur le port publié évite d'exposer Grafana sur le réseau tant que vous n'avez pas posé de reverse proxy avec HTTPS (sujet des modules sécurité). Le `healthcheck` utilise `wget`, présent dans les variantes Alpine ; selon l'image ou la version, un autre outil peut être nécessaire. Si le contrôle échoue alors que Grafana répond bien depuis l'hôte, vérifiez d'abord que la commande existe dans l'image.

💡 **Astuce** : `docker compose config` affiche le fichier après interpolation des variables. C'est le moyen le plus rapide de vérifier que `.env` est bien pris en compte, sans démarrer quoi que ce soit.

## Les deux autres voies, en bref

### Paquet Linux

Sur Debian ou Ubuntu, on passe par le dépôt officiel de Grafana (les étapes exactes évoluent, vérifiez la documentation d'installation de votre version) :

```bash
sudo apt-get install -y apt-transport-https wget gpg
sudo mkdir -p /etc/apt/keyrings
wget -q -O - https://apt.grafana.com/gpg.key | gpg --dearmor | sudo tee /etc/apt/keyrings/grafana.gpg > /dev/null
echo "deb [signed-by=/etc/apt/keyrings/grafana.gpg] https://apt.grafana.com stable main" | sudo tee /etc/apt/sources.list.d/grafana.list
sudo apt-get update
sudo apt-get install -y grafana

sudo systemctl daemon-reload
sudo systemctl enable --now grafana-server
sudo systemctl status grafana-server
```

Les chemins diffèrent de l'image Docker, mais la logique est la même :

| Élément | Emplacement |
|---|---|
| Configuration | `/etc/grafana/grafana.ini` |
| Données (SQLite, plugins) | `/var/lib/grafana` |
| Logs | `/var/log/grafana/` et journal systemd |
| Variables d'environnement du service | `/etc/default/grafana-server` (Debian) ou `/etc/sysconfig/grafana-server` (RHEL) |
| Service | `grafana-server` |

Ici, la persistance est naturelle, puisque le disque de la VM sert de volume. Votre responsabilité devient la sauvegarde de `/var/lib/grafana` et de `/etc/grafana`, car personne ne recrée la machine à votre place.

### Grafana Cloud

Aucun serveur, aucun Compose. Vous créez un compte, une « stack » vous est attribuée, et l'instance est joignable à une adresse du type `https://<NOM_STACK>.grafana.net`. L'authentification passe par le portail Grafana Cloud. C'est idéal pour apprendre ou démarrer sans infrastructure. En contrepartie, vous n'avez pas accès à `grafana.ini` : les réglages se font via le portail, et les volumes ou quotas dépendent de l'offre souscrite (qui évolue, voir la page tarifaire). Pour un lab de formation, c'est un bon plan B si votre poste ne permet pas d'installer Docker.

## Premier écran et authentification initiale

Ouvrez `http://localhost:3000` (ou l'adresse de votre serveur). La page de connexion apparaît. Avec la configuration v2/v3, saisissez le compte défini dans `.env`.

Avec une installation « nue » (`docker run` ou paquet sans réglage), le couple par défaut est `admin` / `admin`, et Grafana propose de changer le mot de passe à la première connexion. Dans certaines versions, cette étape peut être ignorée avec un bouton « Skip ». Ne la sautez jamais : ces identifiants sont connus de tout le monde, et un Grafana exposé avec `admin/admin` se fait repérer très vite.

⚠️ **Erreur fréquente** : conserver `admin/admin` « parce que c'est un lab interne ». Les labs finissent par recevoir de vrais accès (sources de données avec des identifiants, dashboards de production), et personne ne repasse changer le mot de passe. Prenez l'habitude de le faire dès le jour 1, avec un compte nommé autrement que `admin`.

Une fois connecté, vous arrivez sur la page d'accueil, vide pour l'instant. L'exploration de l'interface fait l'objet du module suivant.

## Configurer : `grafana.ini` et variables `GF_*`

Grafana lit sa configuration depuis plusieurs endroits, et c'est la superposition qui déroute les débutants. Les valeurs par défaut sont embarquées dans le programme. Votre `grafana.ini` ne contient que ce que vous voulez changer. Les variables d'environnement `GF_*` passent par-dessus tout.

```mermaid
flowchart LR
    A[Valeurs par défaut<br/>embarquées] --> B[grafana.ini<br/>votre fichier]
    B --> C[Variables GF_*<br/>environnement]
    C --> D[Configuration<br/>effective]
```

Un exemple minimal de `grafana.ini` :

```ini
[server]
root_url = https://grafana.exemple.local/

[users]
allow_sign_up = false

[analytics]
reporting_enabled = false

[log]
level = info
```

La règle de nommage des variables est mécanique : `GF_` + nom de la section + `_` + nom de la clé, le tout en majuscules.

| Dans `grafana.ini` | Variable équivalente |
|---|---|
| `[server]` `root_url` | `GF_SERVER_ROOT_URL` |
| `[security]` `admin_user` | `GF_SECURITY_ADMIN_USER` |
| `[users]` `allow_sign_up` | `GF_USERS_ALLOW_SIGN_UP` |
| `[log]` `level` | `GF_LOG_LEVEL` |

🧠 **Concept clé** : en cas de conflit, la variable d'environnement gagne sur le fichier. Quand une valeur « ne change pas » alors que vous avez édité `grafana.ini`, cherchez d'abord une variable `GF_*` qui la masque.

Quelques règles pour éviter les mauvaises surprises :

- Un fichier `grafana.ini` monté dans le conteneur remplace le fichier d'exemple de l'image, mais pas les valeurs par défaut internes. Inutile de recopier tout le fichier de référence.
- Dans les exemples fournis avec Grafana, de nombreuses lignes commencent par `;`, ce qui les désactive. Une ligne laissée avec son `;` est ignorée, sans erreur.
- Une valeur contenant `#` ou `;` (un mot de passe, par exemple) doit être entourée de triples guillemets `"""`, sinon la fin est lue comme un commentaire. Pour les secrets, préférez le suffixe `__FILE` (`GF_SECURITY_ADMIN_PASSWORD__FILE=/run/secrets/grafana_admin`), qui lit la valeur depuis un fichier.
- Un nom de variable mal orthographié n'est pas signalé : il est simplement sans effet.

💡 **Astuce** : pour voir la configuration réellement appliquée, connectez-vous en administrateur et ouvrez la page des réglages du serveur (dans les versions récentes : *Administration → General → Settings*, le chemin peut varier). Vous y verrez la valeur finale de chaque clé, ce qui tranche toute discussion entre fichier et environnement.

## Vérifier la santé et lire les logs

### `/api/health`

Grafana expose un point de contrôle sans authentification :

```bash
curl -s http://localhost:3000/api/health
```

Une instance saine répond en JSON avec, en substance, `"database": "ok"` et la version du logiciel (les champs exacts peuvent varier selon la version). La réponse confirme deux choses : le serveur HTTP répond et la base est joignable. Elle ne dit rien sur la qualité des dashboards ni sur la disponibilité des sources de données. Ces contrôles viendront avec le meta-monitoring.

C'est l'endpoint à brancher sur un load balancer, un healthcheck Docker ou une sonde de supervision externe. Pour un script, ajoutez `-f` pour que `curl` retourne un code d'erreur si le statut HTTP n'est pas 2xx.

### Les logs de démarrage

```bash
docker compose logs -f --tail=100 grafana     # conteneur
sudo journalctl -u grafana-server -f          # paquet Linux
```

Les lignes suivent le format `logger=... level=info msg="..."`. Pour un premier diagnostic, le plus utile est de repérer trois moments :

1. le démarrage et la version (`Starting Grafana`) ;
2. l'initialisation de la base : à la toute première exécution, vous verrez défiler les migrations de schéma, c'est normal, et le démarrage est plus long ;
3. l'ouverture du port (`HTTP Server Listen`, avec l'adresse et le port d'écoute).

Si ce troisième message n'apparaît jamais, Grafana ne sert rien, et l'erreur se trouve juste au-dessus dans les logs. Cherchez `level=error` ou `level=fatal`.

💡 **Astuce** : pour obtenir plus de détails en cas de souci, passez temporairement `GF_LOG_LEVEL=debug`, puis revenez à `info`. Le niveau `debug` est très bavard et inutile en fonctionnement normal.

## Diagnostic : erreurs fréquentes au premier démarrage

**La page ne répond pas, `docker compose up` signale un port déjà utilisé.**
Cause : un autre service occupe déjà le 3000 sur l'hôte (autre Grafana, application Node, etc.). Correction : publiez sur un autre port, par exemple `"3001:3000"`. Le port interne du conteneur ne change pas, seul celui de l'hôte est modifié.

**Le conteneur redémarre en boucle, les logs parlent de `permission denied` sur `/var/lib/grafana`.**
Cause : vous avez monté un dossier de l'hôte (bind mount) dont le propriétaire n'est pas celui du processus Grafana. Dans l'image officielle, il tourne sous un UID (User Identifier) non-root, 472. Correction : soit passer à un volume nommé comme dans nos exemples, soit ajuster les droits du dossier (`sudo chown -R 472:0 ./data` pour l'image officielle) ou le `user:` du service. Cette erreur est fréquente quand on veut « voir les fichiers » dans le répertoire du projet.

**Le mot de passe défini dans `GF_SECURITY_ADMIN_PASSWORD` est refusé.**
Cause : la base existait déjà (volume réutilisé d'un essai précédent), donc la variable n'a pas été relue. Correction : `grafana cli admin reset-admin-password` comme vu plus haut, ou, sur une instance de test sans valeur, supprimer le volume pour repartir à zéro.

**Dashboards, utilisateurs et sources ont disparu après une mise à jour.**
Cause : aucun volume sur `/var/lib/grafana`, ou volume supprimé par `docker compose down -v` (l'option `-v` détruit les volumes nommés). Correction : ajoutez le volume, et gardez `down -v` pour les cas où vous voulez vraiment tout effacer. Si la base est perdue, seule une sauvegarde permet de récupérer l'état.

**Les liens et redirections pointent vers `localhost` alors que l'accès se fait par un nom de domaine.**
Cause : `root_url` n'a pas été renseignée. Grafana construit alors ses URLs à partir de ses valeurs par défaut. Correction : `GF_SERVER_ROOT_URL` (ou `root_url` dans `[server]`) avec l'URL publique réelle.

**Une option de `grafana.ini` semble ignorée.**
Cause probable : ligne encore précédée de `;`, mauvaise section, ou variable `GF_*` qui la surcharge. Vérifiez dans la page des réglages du serveur la valeur effective.

**`/api/health` répond mais la connexion échoue ou la page reste blanche.**
Cause possible : problème de proxy ou de `root_url`, voire cookie bloqué en HTTP/HTTPS mixte. Le serveur est vivant, c'est le chemin d'accès qui est en cause. Testez directement `http://localhost:3000` depuis l'hôte pour isoler le proxy.

## Cas réel en entreprise : un scénario

Prenons un scénario illustratif (les chiffres sont indicatifs). Une équipe support Cloud de cinq personnes déploie Grafana sur une VM de 2 vCPU et 4 Go de RAM pour préparer l'arrivée d'une supervision de 40 serveurs.

Le premier déploiement est un `docker run` lancé à la main. Trois semaines plus tard, la VM redémarre après un correctif de sécurité. Le conteneur n'a pas de politique de redémarrage et reste arrêté pendant une matinée. En le relançant, on recrée aussi le conteneur : tout l'état, qui contenait une dizaine de dashboards, a disparu. Le compte `admin` n'avait jamais changé de mot de passe.

L'équipe reprend alors le déploiement sous Compose, en suivant la v3 de ce module : image à tag fixe, volume nommé, `.env` hors Git, `grafana.ini` versionné dans le dépôt de l'équipe, port limité à `127.0.0.1` derrière un proxy, sonde externe sur `/api/health`. Résultat attendu dans ce scénario : un redémarrage de la VM ramène Grafana en moins d'une minute sans perte, la reconstruction complète d'une instance de test prend le temps d'un `docker compose up -d`, et une montée de version consiste à modifier une ligne et à relire les logs de démarrage. Il reste à ajouter une sauvegarde régulière de `grafana-data`, traitée dans un module ultérieur.

## Bonnes pratiques

- **Figer la version de l'image** (`grafana/grafana:13.3.0`, par exemple), jamais `latest` en dehors d'un essai jetable. Une montée de version doit être une décision, pas un effet de bord d'un `pull`.
- **Changer l'identifiant et le mot de passe admin dès le départ**, via `.env` ou secret, avec un mot de passe long, unique, hors dépôt Git. Créez ensuite des comptes nominatifs pour les personnes, et gardez l'admin pour l'administration.
- **Persister `/var/lib/grafana`**, et savoir où il se trouve. Sans sauvegarde testée, un volume reste un point unique de défaillance, mais c'est déjà la condition minimale pour survivre à une recréation de conteneur.
- **Ne publier le port que là où c'est utile** : `127.0.0.1:3000:3000` derrière un reverse proxy, plutôt que `0.0.0.0` sur un serveur joignable depuis Internet. La mise en place du HTTPS arrive avec les modules sécurité.
- **Versionner la configuration** (`compose.yaml`, `grafana.ini`) dans Git, et garder les secrets à part (`.env`, fichiers `__FILE`, gestionnaire de secrets). On doit pouvoir reconstruire l'instance à l'identique depuis le dépôt.
- **Brancher `/api/health` sur une sonde extérieure à Grafana** dès le premier jour. Un monitoring qui surveille son propre état depuis l'intérieur ne vous alertera pas quand il tombera.
- **Garder l'habitude des logs** : après chaque changement de configuration ou de version, lisez les cent premières lignes. Une erreur au démarrage est beaucoup plus facile à interpréter à chaud.

## Résumé

Installer Grafana consiste à poser un service qui répond sur le port 3000, avec un état à protéger dans `/var/lib/grafana`. Docker Compose, avec un volume nommé, une version figée et des secrets dans `.env`, est la voie la plus reproductible. Le paquet Linux ou Grafana Cloud conviennent quand les contraintes d'hébergement l'imposent. La configuration se superpose : valeurs par défaut, puis `grafana.ini`, puis variables `GF_*` qui l'emportent. Le point `/api/health` et les logs de démarrage donnent l'état du service et la piste de l'erreur. Avec une instance saine, persistante et sécurisée au minimum, vous pouvez maintenant explorer l'interface pour comprendre comment elle s'organise.

<!-- snippet
id: grafana_compose_start
type: command
tech: grafana
level: beginner
importance: high
format: knowledge
tags: grafana,docker-compose,installation,demarrage
title: Démarrer Grafana avec Docker Compose
context: à exécuter dans le dossier contenant compose.yaml et .env
command: docker compose up -d
description: Crée et démarre le conteneur Grafana en arrière-plan. Le volume nommé est créé au premier lancement et réutilisé aux suivants.
-->

<!-- snippet
id: grafana_health_check
type: command
tech: grafana
level: beginner
importance: high
format: knowledge
tags: grafana,api,sante,supervision
title: Vérifier la santé de Grafana via /api/health
command: curl -sf http://<HOTE>:<PORT>/api/health
example: curl -sf http://localhost:3000/api/health
description: Renvoie un JSON avec l'état de la base (database ok) et la version, sans authentification. Avec -f, curl échoue si le code HTTP n'est pas 2xx.
-->

<!-- snippet
id: grafana_compose_logs
type: command
tech: grafana
level: beginner
importance: medium
format: knowledge
tags: grafana,logs,docker-compose,diagnostic
title: Suivre les logs de démarrage de Grafana
command: docker compose logs -f --tail=100 <SERVICE>
example: docker compose logs -f --tail=100 grafana
description: Affiche les 100 dernières lignes puis suit le flux. Cherchez HTTP Server Listen (service prêt) ou une ligne level=error juste avant l'arrêt.
-->

<!-- snippet
id: grafana_reset_admin_password
type: command
tech: grafana
level: beginner
importance: high
format: knowledge
tags: grafana,securite,mot-de-passe,administration
title: Réinitialiser le mot de passe admin Grafana
context: nécessaire quand GF_SECURITY_ADMIN_PASSWORD a été modifié après la création de la base
command: docker compose exec grafana grafana cli admin reset-admin-password <NOUVEAU_MOT_DE_PASSE>
example: docker compose exec grafana grafana cli admin reset-admin-password 'Xk9-vT2!qLm4pR7w'
description: Modifie directement le mot de passe dans la base existante, là où la variable d'environnement n'a plus d'effet. Sur paquet Linux, ajouter --homepath /usr/share/grafana.
-->

<!-- snippet
id: grafana_package_service_status
type: command
tech: grafana
level: beginner
importance: medium
format: knowledge
tags: grafana,systemd,linux,logs
title: Démarrer et surveiller Grafana sur Linux (paquet)
context: installation par paquet APT ou RPM, service grafana-server
command: sudo systemctl enable --now grafana-server && sudo journalctl -u grafana-server -f
description: Active le service au démarrage de la machine, le lance immédiatement, puis suit ses logs dans le journal systemd pour repérer les erreurs de démarrage.
-->

<!-- snippet
id: grafana_gf_env_naming
type: concept
tech: grafana
level: beginner
importance: high
format: knowledge
tags: grafana,configuration,variables-environnement,grafana-ini
title: Convention de nommage des variables GF_* de Grafana
content: Chaque clé de grafana.ini se traduit en variable GF_<SECTION>_<CLE> en majuscules ([server] root_url devient GF_SERVER_ROOT_URL). Ordre de priorité : valeurs par défaut internes, puis grafana.ini, puis variables GF_*, qui l'emportent toujours. Une variable mal orthographiée est ignorée sans message d'erreur.
description: Explique comment convertir une clé du fichier en variable, et pourquoi la variable d'environnement masque le fichier en cas de conflit.
-->

<!-- snippet
id: grafana_data_dir_sqlite
type: concept
tech: grafana
level: beginner
importance: high
format: knowledge
tags: grafana,persistance,sqlite,volume
title: Où Grafana stocke son état par défaut
content: Par défaut, Grafana écrit dashboards, utilisateurs, organisations, sources de données et règles d'alerte dans une base SQLite (grafana.db) sous /var/lib/grafana. Ce dossier doit être un volume (nommé ou bind mount), sinon la recréation du conteneur efface tout. Le volume sépare l'état durable du programme jetable.
description: Le dossier /var/lib/grafana contient grafana.db et les plugins ; c'est lui qu'il faut persister et sauvegarder.
-->

<!-- snippet
id: grafana_default_credentials_warning
type: warning
tech: grafana
level: beginner
importance: high
format: knowledge
tags: grafana,securite,identifiants,authentification
title: Ne jamais laisser admin/admin sur une instance Grafana
content: Piège : une installation nue crée le compte admin avec le mot de passe admin, connu de tous. Conséquence : une instance accessible sur le réseau, même un lab, peut être prise en main et expose les identifiants des sources de données. Correction : définir GF_SECURITY_ADMIN_USER et GF_SECURITY_ADMIN_PASSWORD (via .env non versionné ou __FILE) avant le premier démarrage, avec un nom d'admin différent de admin.
description: Les identifiants par défaut sont publics ; les remplacer avant le premier démarrage évite une compromission rapide d'une instance exposée.
-->

<!-- snippet
id: grafana_ephemeral_volume_warning
type: warning
tech: grafana
level: beginner
importance: high
format: knowledge
tags: grafana,docker,persistance,sauvegarde
title: Volume absent ou docker compose down -v : perte totale
content: Piège : lancer Grafana sans volume sur /var/lib/grafana, ou exécuter docker compose down -v. Conséquence : grafana.db est détruit avec le conteneur ou le volume, donc dashboards, utilisateurs et sources disparaissent. Correction : déclarer un volume nommé (grafana-data:/var/lib/grafana), réserver -v aux remises à zéro volontaires, et planifier une sauvegarde de ce volume.
description: Sans volume persistant, toute recréation de conteneur efface l'état. L'option -v de compose down supprime aussi les volumes nommés.
-->

<!-- snippet
id: grafana_admin_password_env_ignored
type: error
tech: grafana
level: beginner
importance: medium
format: knowledge
tags: grafana,authentification,configuration,docker
title: Mot de passe GF_SECURITY_ADMIN_PASSWORD sans effet
content: Symptôme : le mot de passe défini en variable est refusé à la connexion. Cause : la variable n'est lue qu'à l'initialisation de la base ; si grafana.db existe déjà dans le volume, elle est ignorée. Correction : exécuter grafana cli admin reset-admin-password, ou supprimer le volume si l'instance est un simple test.
description: La variable d'admin ne s'applique qu'à la création de la base. Sur un volume existant, il faut réinitialiser le mot de passe via la CLI.
-->

<!-- snippet
id: grafana_bind_mount_permission_error
type: error
tech: grafana
level: beginner
importance: medium
format: knowledge
tags: grafana,docker,permissions,volume
title: Conteneur Grafana en boucle : permission denied sur les données
content: Symptôme : le conteneur redémarre sans cesse, les logs signalent permission denied sur /var/lib/grafana. Cause : un dossier de l'hôte monté en bind mount n'appartient pas à l'utilisateur du processus (UID 472 dans l'image officielle). Correction : utiliser un volume nommé, ou lancer sudo chown -R 472:0 <DOSSIER_HOTE>, ou définir user: sur le service.
description: Un bind mount garde les droits de l'hôte ; l'utilisateur non-root de Grafana ne peut pas y écrire sans ajustement du propriétaire.
-->

<!-- snippet
id: grafana_bind_localhost_tip
type: tip
tech: grafana
level: beginner
importance: medium
format: knowledge
tags: grafana,docker,reseau,securite
title: Limiter Grafana à l'hôte local avec 127.0.0.1:3000:3000
content: Dans compose.yaml, écrire ports: - "127.0.0.1:3000:3000" au lieu de "3000:3000". Docker n'ouvre alors le port que sur l'interface locale, et Grafana reste invisible du réseau tant qu'aucun reverse proxy HTTPS n'est en place. Testez avec curl depuis un autre poste : la connexion doit être refusée.
description: Préfixer le port publié par 127.0.0.1 évite d'exposer Grafana sur toutes les interfaces avant la mise en place d'un proxy sécurisé.
-->

<!-- snippet
id: grafana_pin_image_tag_tip
type: tip
tech: grafana
level: beginner
importance: medium
format: knowledge
tags: grafana,docker,version,reproductibilite
title: Figer la version de l'image Grafana plutôt que latest
content: Écrire image: grafana/grafana:13.3.0 (ou la version stable de votre choix) dans compose.yaml. Pour monter de version : changer le tag, lancer docker compose pull puis docker compose up -d, et lire les 100 premières lignes de logs pour valider les migrations de base. Avec latest, un simple pull change la version sans vous prévenir.
description: Un tag fixe rend le déploiement reproductible et fait de chaque montée de version une action volontaire, vérifiable dans les logs.
-->
