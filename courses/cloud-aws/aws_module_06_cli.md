---
layout: page
title: "AWS CLI — Outils et automatisation"
course: cloud-aws
chapter_title: "Fondations AWS"
chapter: 1
section: 6
tags: aws,cli,automation,devops,tools
difficulty: beginner
duration: 70
mermaid: true
status: published
prev_module: "/courses/cloud-aws/aws_module_05_vpc.html"
prev_module_title: "Réseau AWS — VPC, Subnets, Routing"
next_module: "/courses/cloud-aws/aws_module_07_cloudwatch.html"
next_module_title: "Monitoring AWS — CloudWatch (metrics, logs, alerting)"
---

# AWS CLI — Outils et automatisation

## Objectifs pédagogiques

À l'issue de ce module, tu seras capable de :

1. Installer et configurer AWS CLI v2 sur ta machine locale
2. Gérer plusieurs profils pour travailler en multi-compte sans risque
3. Exécuter les commandes essentielles sur EC2, S3 et IAM avec filtrage JMESPath
4. Écrire un script bash d'automatisation intégrant AWS CLI de façon sécurisée
5. Diagnostiquer et corriger les erreurs d'authentification les plus fréquentes

---

## Pourquoi le CLI plutôt que la console ?

La console AWS est utile pour découvrir un service. Mais dès que tu dois répéter une action, la rendre reproductible ou l'intégrer dans un pipeline, elle devient un obstacle : lente, non scriptable, et chaque clic manuel introduit un risque d'erreur humaine.

AWS CLI résout exactement ce problème. C'est un programme en ligne de commande qui appelle les mêmes API que la console — mais depuis un terminal, un script bash ou un pipeline CI/CD. Une commande qui fonctionne sur ta machine fonctionnera à l'identique en production, dans six mois, lancée par quelqu'un d'autre.

Concrètement :

- Tu peux versionner tes opérations dans un script, les rejouer et les partager avec ton équipe
- Tu peux déclencher des actions AWS depuis GitHub Actions, Jenkins ou n'importe quel outil CI
- Lister 200 instances EC2 prend une ligne de commande contre dix minutes de navigation console

> La console est un tableau de bord. Le CLI est un outil de travail.

---

## Comment ça fonctionne

> **SAA-C03** — Si la question mentionne…
> - "programmatic access / accès programmatique" + "EC2 instance" → **IAM Role** attaché à l'instance (jamais stocker des access keys)
> - "programmatic access" + "human user / utilisateur humain" + "CLI / SDK" → **IAM User** avec access key + **MFA** activé
> - "multiple AWS accounts / plusieurs comptes AWS" + "switch between / basculer entre" → **CLI profiles** (`aws configure --profile`) ou **IAM Identity Center** (`aws sso login`)
> - "verify identity / vérifier l'identité" + "troubleshoot permissions / débugger les permissions" → `aws sts get-caller-identity`
> - "filter output / filtrer la sortie" + "query" → **JMESPath** (`--query` parameter)
> - ⛔ **Jamais** de credentials hardcodés dans le code ou les variables d'environnement en production → utiliser IAM Roles (EC2) ou Secrets Manager

Quand tu tapes une commande `aws`, voici le chemin parcouru :

```mermaid
sequenceDiagram
    participant Dev as Terminal (toi)
    participant CLI as AWS CLI
    participant Creds as ~/.aws/credentials
    participant API as AWS API (HTTPS)
    participant Svc as Service AWS (EC2, S3…)

    Dev->>CLI: aws ec2 describe-instances --profile prod
    CLI->>Creds: Lecture access_key + secret_key du profil "prod"
    CLI->>API: Requête HTTPS signée (SigV4)
    API->>Svc: Transmission de la requête
    Svc-->>API: Réponse JSON
    API-->>CLI: Réponse JSON
    CLI-->>Dev: Affichage formaté
```

Le point clé : AWS CLI ne fait rien de plus qu'appeler une API REST (Representational State Transfer) sécurisée. Tout ce que tu peux faire en CLI, tu pourrais le faire avec `curl` — CLI simplifie la signature des requêtes (protocole SigV4 (Signature Version 4)) et le parsing des réponses.

| Composant | Rôle |
|---|---|
| AWS CLI | Transforme ta commande en requête API signée |
| `~/.aws/credentials` | Stocke les clés d'accès par profil |
| `~/.aws/config` | Stocke la région et le format de sortie par profil |
| AWS API | Reçoit la requête et l'achemine vers le bon service |

<!-- snippet
id: aws_cli_definition
type: concept
tech: aws
level: beginner
importance: high
format: knowledge
tags: aws,cli,devops
title: AWS CLI — principe de fonctionnement
content: AWS CLI traduit chaque commande en requête HTTPS signée (SigV4) vers les API AWS. C'est un wrapper qui gère l'authentification, la sérialisation des paramètres et le parsing de la réponse JSON. Tout ce qui est faisable en console est faisable en CLI.
description: Comprendre ce mécanisme explique pourquoi CLI et console font exactement la même chose — l'un en clics, l'autre en texte
-->

---

## Installation et première configuration

### Installer AWS CLI v2

```bash
# Linux (x86_64)
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Vérifier l'installation
aws --version
```

AWS CLI v2 est la version actuelle. La v1 existe encore mais n'est plus recommandée pour de nouveaux projets — la syntaxe de certaines commandes diffère, ce qui peut casser des scripts écrits pour l'une ou l'autre.

### Configurer tes credentials

```bash
aws configure
```

La commande te pose quatre questions :

```
AWS Access Key ID [None]: AKIAIOSFODNN7EXAMPLE
AWS Secret Access Key [None]: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
Default region name [None]: eu-west-1
Default output format [None]: json
```

Ces informations sont écrites dans deux fichiers locaux :

- `~/.aws/credentials` — les clés (ce fichier ne doit jamais entrer dans un dépôt Git)
- `~/.aws/config` — la région et le format de sortie

<!-- snippet
id: aws_cli_configure_command
type: command
tech: aws
level: beginner
importance: high
format: knowledge
tags: aws,cli,setup
title: Configurer AWS CLI (profil par défaut)
command: aws configure
description: Lance l'assistant interactif pour saisir access key, secret key, région et format de sortie — écrit dans ~/.aws/credentials et ~/.aws/config
-->

### Vérifier que tout est en place

```bash
aws configure list
```

```
      Name                    Value             Type    Location
      ----                    -----             ----    --------
   profile                <not set>             None    None
access_key     ****************MPLE shared-credentials-file
secret_key     ****************EKEY shared-credentials-file
    region                eu-west-1      config-file    ~/.aws/config
```

Si `access_key` et `secret_key` s'affichent masquées avec des étoiles, la configuration est correcte. Si tu vois `<not set>`, relance `aws configure`.

---

## Travailler avec plusieurs profils

En entreprise, tu vas rarement travailler sur un seul compte AWS. Tu as souvent au minimum un compte de dev, un de staging et un de prod. Les profils permettent de gérer ça proprement, sans jamais écraser tes credentials par défaut ni mélanger les environnements.

### Créer un profil nommé

```bash
aws configure --profile <PROFILE_NAME>
```

Par exemple pour un profil `prod` :

```bash
aws configure --profile prod
```

La commande ajoute une entrée dans `~/.aws/credentials` :

```ini
[default]
aws_access_key_id = AKIAIOSFODNN7EXAMPLE
aws_secret_access_key = wJalrXUtnFEMI/K7MDENG/...

[prod]
aws_access_key_id = AKIAI44QH8DHBEXAMPLE
aws_secret_access_key = je7MtGbClwBF/2Zp9Utk/...
```

<!-- snippet
id: aws_cli_profile_create
type: command
tech: aws
level: beginner
importance: high
format: knowledge
tags: aws,cli,profile,multi-account
title: Créer un profil AWS CLI nommé
command: aws configure --profile <PROFILE_NAME>
example: aws configure --profile prod
description: Ajoute une entrée dans ~/.aws/credentials — chaque profil stocke ses propres credentials indépendamment du profil default
-->

### Utiliser un profil dans une commande

```bash
aws --profile <PROFILE_NAME> s3 ls
```

Si tu travailles pendant une session entière sur le même compte, utilise la variable d'environnement plutôt que de répéter `--profile` à chaque commande :

```bash
export AWS_PROFILE=prod
aws s3 ls                   # utilise automatiquement le profil prod
aws ec2 describe-instances  # idem
```

Pour revenir au profil par défaut : `unset AWS_PROFILE`

<!-- snippet
id: aws_cli_profile_env
type: tip
tech: aws
level: beginner
importance: medium
format: knowledge
tags: aws,cli,profile,session
title: Basculer de profil avec AWS_PROFILE pour toute une session
content: Exporter AWS_PROFILE évite de répéter --profile sur chaque commande lors d'une session de travail prolongée sur un même compte. Penser à faire `unset AWS_PROFILE` pour revenir au profil par défaut.
description: Plus pratique que --profile quand toutes les commandes d'une session ciblent le même compte
-->

⚠️ **Avant toute commande destructive** (`terminate-instances`, `s3 rb`, `delete-*`…), vérifie toujours sur quel compte tu es :

```bash
aws sts get-caller-identity
```

```json
{
    "UserId": "AIDACKCEVSQ6C2EXAMPLE",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/alice"
}
```

Cette commande affiche le compte AWS actif, l'ARN de l'identité et l'ID utilisateur. Une seconde qui peut éviter de terminer des instances de prod en pensant être sur dev.

<!-- snippet
id: aws_cli_whoami
type: command
tech: aws
level: beginner
importance: high
format: knowledge
tags: aws,cli,iam,security
title: Vérifier son identité AWS active
command: aws sts get-caller-identity
description: Affiche le compte AWS, l'ARN et l'ID de l'identité active — à exécuter systématiquement avant toute opération destructive
-->

---

## Commandes essentielles par service

### S3

```bash
# Lister les buckets
aws s3 ls

# Lister le contenu d'un bucket
aws s3 ls s3://<BUCKET_NAME>

# Copier un fichier vers S3
aws s3 cp <LOCAL_FILE> s3://<BUCKET_NAME>/<PREFIX>

# Synchroniser un dossier local avec S3
aws s3 sync <LOCAL_DIR> s3://<BUCKET_NAME>/<PREFIX>
```

`sync` ne copie que les fichiers modifiés ou absents — c'est différent de `cp` qui copie tout à chaque fois. En pratique, `sync` est ce qu'on utilise pour déployer ou sauvegarder.

<!-- snippet
id: aws_cli_s3_sync
type: command
tech: aws
level: beginner
importance: high
format: knowledge
tags: aws,cli,s3,backup,deploy
title: Synchroniser un dossier local vers S3
command: aws s3 sync <LOCAL_DIR> s3://<BUCKET_NAME>/<PREFIX>
example: aws s3 sync ./dist s3://mon-bucket-prod/frontend
description: Copie uniquement les fichiers modifiés ou absents — idéal pour déployer un site statique ou sauvegarder des logs sans tout retransférer
-->

### EC2

```bash
# Lister les instances avec filtre sur l'état
aws ec2 describe-instances \
  --filters "Name=instance-state-name,Values=running" \
  --query "Reservations[*].Instances[*].[InstanceId,Tags[?Key=='Name'].Value|[0],State.Name]" \
  --output table

# Démarrer une instance
aws ec2 start-instances --instance-ids <INSTANCE_ID>

# Arrêter une instance
aws ec2 stop-instances --instance-ids <INSTANCE_ID>
```

Le paramètre `--query` utilise la syntaxe JMESPath pour filtrer la réponse JSON directement côté CLI. Sans lui, `describe-instances` renvoie plusieurs centaines de lignes JSON par instance — difficile à lire et inutilisable dans un script.

<!-- snippet
id: aws_cli_ec2_describe_filtered
type: command
tech: aws
level: beginner
importance: high
format: knowledge
tags: aws,cli,ec2,jmespath,query
title: Lister les instances EC2 running avec filtrage JMESPath
command: aws ec2 describe-instances --filters "Name=instance-state-name,Values=<STATE>" --query "Reservations[*].Instances[*].[InstanceId,Tags[?Key=='Name'].Value|[0]]" --output table
example: aws ec2 describe-instances --filters "Name=instance-state-name,Values=running" --query "Reservations[*].Instances[*].[InstanceId,Tags[?Key=='Name'].Value|[0]]" --output table
description: Combine --filters pour cibler un état et --query JMESPath pour n'afficher que l'ID et le nom — évite des centaines de lignes JSON brut
-->

### IAM

```bash
# Lister les utilisateurs IAM
aws iam list-users --output table

# Voir les policies attachées à un utilisateur
aws iam list-attached-user-policies --user-name <USERNAME>
```

---

## Maîtriser le format de sortie

Par défaut, AWS CLI répond en JSON. Trois autres formats sont disponibles selon l'usage :

| Format | Quand l'utiliser | Exemple |
|---|---|---|
| `json` | Traitement avec `jq` ou dans du code | `--output json` |
| `table` | Lecture rapide dans un terminal | `--output table` |
| `text` | Récupérer une valeur dans une variable bash | `--output text` |
| `yaml` | Lisibilité, fichiers de config | `--output yaml` |

Exemple concret — extraire les IDs d'instances actives dans une variable bash :

```bash
INSTANCE_IDS=$(aws ec2 describe-instances \
  --filters "Name=instance-state-name,Values=running" \
  --query "Reservations[*].Instances[*].InstanceId" \
  --output text)

echo "Instances actives : $INSTANCE_IDS"
```

Avec `--output text`, la liste s'affiche sur une ligne séparée par des tabulations — directement utilisable dans un `for` bash sans parser du JSON.

<!-- snippet
id: aws_cli_output_formats
type: tip
tech: aws
level: beginner
importance: medium
format: knowledge
tags: aws,cli,output,scripting,bash
title: Choisir le bon format de sortie selon l'usage
content: --output table pour lire rapidement dans un terminal. --output json + jq pour filtrer des champs précis. --output text pour récupérer une valeur dans une variable bash sans parser du JSON. Mélanger les formats entre exploration et scripting est la cause principale de scripts AWS CLI fragiles.
description: Le bon format de sortie dépend de l'usage — un script bash et une lecture humaine n'ont pas les mêmes besoins
-->

---

## Erreurs fréquentes et diagnostic

### AccessDenied

```
An error occurred (AccessDenied) when calling the ListBuckets operation: Access Denied
```

Causes à vérifier dans l'ordre :

1. Mauvais profil actif — `aws sts get-caller-identity` pour confirmer l'identité
2. L'utilisateur IAM n'a pas la permission — vérifier les policies attachées dans la console IAM
3. Pour S3 : la bucket policy bloque l'accès même si les droits IAM sont corrects (deux couches de contrôle indépendantes)

<!-- snippet
id: aws_cli_access_denied_error
type: warning
tech: aws
level: beginner
importance: high
format: knowledge
tags: aws,cli,error,iam,troubleshooting
title: Erreur AccessDenied — causes et diagnostic
content: 1) Vérifier le profil actif avec `aws sts get-caller-identity`. 2) Vérifier les policies IAM attachées à l'utilisateur. 3) Pour S3, vérifier aussi la bucket policy — elle peut bloquer même un utilisateur avec les droits IAM corrects. S3 applique deux couches de contrôle indépendantes.
description: Erreur la plus fréquente en AWS CLI — rarement due au CLI lui-même, presque toujours à IAM ou aux profils
-->

### Unable to locate credentials

```
Unable to locate credentials. You can configure credentials by running "aws configure".
```

Le CLI cherche des credentials dans cet ordre : variables d'environnement `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`, puis `~/.aws/credentials`, puis le rôle IAM de l'instance (si tu es sur EC2). Si aucune source n'est disponible, il échoue avec ce message. Lancer `aws configure` ou exporter les variables d'environnement résout le problème.

### ExpiredToken

```
An error occurred (ExpiredTokenException): The security token included in the request is expired
```

Tu utilises des credentials temporaires (STS, SSO, rôle assumé) qui ont expiré. Relancer l'authentification ou régénérer le token via ta méthode d'authentification habituelle.

---

## Sécuriser ses credentials

🧠 `~/.aws/credentials` est un fichier texte en clair sur ton disque. N'importe quel processus qui tourne sous ton utilisateur peut le lire. Un `git add .` distrait, une image Docker mal construite ou un script malveillant peuvent exposer tes clés — et les fuites de credentials AWS sont la cause principale des factures à plusieurs milliers d'euros chez les développeurs.

<!-- snippet
id: aws_cli_credentials_leak_warning
type: warning
tech: aws
level: beginner
importance: high
format: knowledge
tags: aws,security,cli,credentials,git
title: Ne jamais embarquer ~/.aws/credentials dans un dépôt ou une image
content: ~/.aws/credentials est lisible par tout process local. Ajouter .aws/ dans .gitignore global. Ne jamais utiliser COPY ~/.aws dans un Dockerfile. En CI/CD, injecter AWS_ACCESS_KEY_ID et AWS_SECRET_ACCESS_KEY comme secrets d'environnement, jamais dans les fichiers versionnés.
description: Les leaks de credentials AWS sont la cause n°1 de factures astronomiques — ce fichier ne doit jamais sortir de la machine locale
-->

<!-- snippet
id: aws_cli_iam_role_over_static_keys
type: tip
tech: aws
level: beginner
importance: medium
format: knowledge
tags: aws,security,iam,ec2,credentials
title: Préférer les rôles IAM aux clés statiques en production
content: Sur une instance EC2 ou un conteneur ECS, attacher un rôle IAM à la ressource plutôt que d'injecter des clés. Le CLI récupère automatiquement des credentials temporaires via le metadata service (169.254.169.254). Durée de vie limitée, rotation automatique, aucune clé à stocker ni à faire pivoter manuellement.
description: Les credentials via rôle IAM expirent automatiquement et ne nécessitent aucune gestion manuelle — plus sécurisé que les clés statiques
-->

En pratique, voici l'ordre de priorité :

1. **Sur EC2 / ECS** — rôle IAM attaché à la ressource, zéro clé à gérer
2. **En CI/CD** — secrets d'environnement de l'outil CI (GitHub Actions secrets, GitLab CI variables…)
3. **En local** — profils nommés, jamais le profil `default` avec des droits admin
4. **Partout** — `.aws/` dans le `.gitignore` global de ta machine

---

## Cas réel : déploiement automatisé d'un site statique

**Contexte** : une équipe de 4 développeurs maintient un site de documentation généré avec Hugo. Avant, chaque déploiement demandait de se connecter à la console S3, supprimer les anciens fichiers, uploader le nouveau build via drag-and-drop, puis aller sur CloudFront invalider le cache. Environ 15 minutes par déploiement, avec régulièrement des oublis d'invalidation qui causaient des affichages incohérents en production.

**Solution** : un script bash de 15 lignes déclenché automatiquement par le pipeline CI à chaque merge sur `main` :

```bash
#!/bin/bash
set -e

BUCKET="docs.monentreprise.com"
DISTRIBUTION_ID="E1EXAMPLE123456"
BUILD_DIR="./public"

echo "==> Build Hugo"
hugo --minify

echo "==> Sync vers S3"
aws s3 sync "$BUILD_DIR" "s3://$BUCKET" \
  --delete \
  --cache-control "max-age=86400" \
  --profile prod

echo "==> Invalidation cache CloudFront"
aws cloudfront create-invalidation \
  --distribution-id "$DISTRIBUTION_ID" \
  --paths "/*" \
  --profile prod

echo "==> Déploiement terminé"
```

Le flag `--delete` supprime de S3 les fichiers qui n'existent plus localement — sans lui, les anciennes pages resteraient accessibles indéfiniment.

**Résultats mesurés** :
- Temps de déploiement : 15 minutes → 90 secondes
- Oublis d'invalidation de cache : 2 à 3 par semaine → 0
- Le script est versionné dans le dépôt : n'importe qui dans l'équipe peut reproduire, auditer ou modifier le processus

---

## Bonnes pratiques

**Toujours vérifier son identité avant une opération sensible.** `aws sts get-caller-identity` prend une seconde et évite d'exécuter une commande destructive sur le mauvais compte. En faire un réflexe avant tout `terminate`, `delete` ou `rb`.

**Utiliser `--dry-run` quand c'est disponible.** Sur EC2 notamment, `aws ec2 terminate-instances --dry-run` simule l'appel sans l'exécuter — utile pour vérifier les permissions avant de toucher à des ressources en production.

**Nommer ses profils de façon explicite.** `prod`, `staging`, `dev` plutôt que `default`, `test`, `perso`. Un profil `default` avec des droits admin est un accident en attente de se produire.

**Toujours spécifier `--region` dans les scripts**, même si ta config locale a une région par défaut. Un script qui repose sur une configuration implicite se comportera différemment d'une machine à l'autre ou en CI.

**Versionner les scripts CLI dans le dépôt du projet.** Un script dans `scripts/` à la racine est réutilisable, auditable et documenté. Un script dans `~/bin` est invisible pour le reste de l'équipe.

**Utiliser `--output text` pour les scripts, `--output table` pour l'exploration.** Décider à l'écriture quel format est adapté au traitement souhaité — mélanger les deux rend les scripts fragiles.

**Logger les opérations importantes.** En CI/CD, `set -x` en tête de script affiche chaque commande exécutée. En production, rediriger les sorties vers un fichier de log pour pouvoir auditer après coup.

---

## Résumé

AWS CLI transforme chaque opération AWS en commande reproductible. Là où la console demande des clics et du contexte visuel, le CLI demande une ligne — versionnée, partageable et automatisable.

La gestion des profils est le premier réflexe à acquérir : un profil par compte, des credentials jamais en clair dans le code, et `aws sts get-caller-identity` avant toute opération sensible. Les options `--query` et `--output` rendent les commandes directement exploitables dans des scripts bash sans parsing fragile.

Le module suivant aborde CloudWatch : maintenant que tu peux piloter AWS depuis le terminal, tu vas pouvoir observer ce qui se passe à l'intérieur de tes ressources.
