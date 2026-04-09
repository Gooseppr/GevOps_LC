---
layout: page
title: "Multi-environnement AWS — dev, staging, prod & multi-account"
course: cloud-aws
chapter_title: "Services & Architecture"
chapter: 2
section: 8
tags:
  - aws
  - environment
  - dev
  - staging
  - prod
  - multiaccount
difficulty: intermediate
duration: 90
mermaid: true
status: published
---

# Multi-environnement AWS — dev, staging, prod & multi-account

## Objectifs pédagogiques

À l'issue de ce module, vous serez capable de :

- Expliquer pourquoi la séparation en comptes AWS distincts réduit le blast radius en cas d'incident
- Concevoir une structure organisationnelle avec AWS Organizations (OUs, comptes, SCPs)
- Configurer des profils AWS CLI distincts pour cibler chaque environnement sans ambiguïté
- Appliquer des Service Control Policies pour verrouiller les actions critiques en production
- Identifier et corriger les anti-patterns courants liés au mélange d'environnements

---

## Pourquoi les environnements existent

Imaginez un développeur qui teste une nouvelle requête SQL directement en production. La requête prend un verrou sur une table critique. Le site tombe. Il est 14h un vendredi.

Ce scénario arrive encore régulièrement dans des équipes sans séparation claire entre environnements. La cause n'est pas l'incompétence — c'est l'architecture.

L'idée de fond est simple : **chaque changement doit traverser plusieurs filtres avant d'atteindre les utilisateurs réels**. Un bug qui explose en dev ne coûte rien. Le même bug en prod peut coûter des heures de downtime, des données corrompues, et une confiance client durablement dégradée.

AWS pousse cette logique plus loin qu'une convention de nommage. L'approche recommandée est de placer chaque environnement dans un **compte AWS distinct** — pas juste un VPC différent, pas juste un préfixe de ressource, mais un compte avec ses propres limites IAM, sa propre facturation et son propre **blast radius**.

> 💡 **Blast radius** : le périmètre maximal des dégâts en cas d'incident. Dans un compte unique, un `terraform destroy` mal ciblé peut effacer prod et dev en même temps. Dans un modèle multi-compte, l'incident reste physiquement confiné.

---

## Architecture multi-compte avec AWS Organizations

### Les trois environnements et leurs rôles

| Environnement | Rôle principal | Niveau de risque | Fréquence de déploiement |
|---|---|---|---|
| **Dev** | Expérimentation, développement actif | Faible — les erreurs sont attendues | Plusieurs fois par jour |
| **Staging** | Validation pré-production, tests d'intégration | Moyen — doit refléter prod fidèlement | Plusieurs fois par semaine |
| **Prod** | Utilisateurs réels, données réelles | Critique | Contrôlé, traçable, approuvé |

Le staging mérite une attention particulière. Un staging qui diverge de prod — instances plus petites, variables d'environnement différentes, version de base de données décalée — ne valide pas grand-chose. Les bugs de production apparaissent précisément là où staging diverge. La règle : même Terraform, mêmes AMIs, seules les variables d'environnement changent.

### Structure organisationnelle

```mermaid
graph TD
    Master["🏢 Compte Master\nAWS Organizations\nFacturation consolidée\nSCPs globales"]

    Master --> Dev["💻 Compte Dev\nLiberté de test\nCoûts limités\nAccès développeurs"]
    Master --> Staging["🔧 Compte Staging\nMiroir de prod\nTests d'intégration\nAccès CI/CD"]
    Master --> Prod["🚀 Compte Prod\nAccès restreint\nAudit activé\nMFA obligatoire"]

    Dev --> DevResources["EC2, RDS, S3\nEnvironnement dev"]
    Staging --> StagingResources["EC2, RDS, S3\nConfiguration prod-like"]
    Prod --> ProdResources["EC2, RDS, S3\nInfra de production"]
```

AWS Organizations orchestre tout cela depuis un compte master. Il permet de centraliser la facturation (une seule facture consolidée), d'appliquer des **Service Control Policies** qui s'imposent même aux administrateurs locaux, et d'organiser les comptes en **Organizational Units** pour refléter votre structure d'équipe ou de produit.

<!-- snippet
id: aws_multi_account_concept
type: concept
tech: aws
level: intermediate
importance: high
format: knowledge
tags: aws,multiaccount,security,organizations
title: Isolation physique via comptes AWS séparés
content: Dans un compte unique, une mauvaise policy IAM ou un `terraform destroy` mal ciblé peut affecter prod et dev simultanément. Des comptes séparés (dev/staging/prod) imposent une limite de blast radius physique : un incident dans dev ne peut pas toucher prod, même avec les droits admin. AWS Organizations centralise la facturation et les politiques de contrôle (SCP) sur tous les comptes depuis un compte master.
description: Les comptes AWS séparés créent une isolation physique irréversible — le meilleur garde-fou contre les incidents inter-environnements
-->

---

## Mise en place pas à pas

### 1. Créer les comptes dans AWS Organizations

La création de comptes membres se fait depuis le compte master. Chaque compte reçoit une adresse email unique et un nom qui reflète son rôle.

```bash
aws organizations create-account \
  --email <EMAIL_COMPTE> \
  --account-name <NOM_COMPTE>
```

Exemple pour l'environnement dev :

```bash
aws organizations create-account \
  --email dev-aws@monentreprise.com \
  --account-name "myapp-dev"
```

<!-- snippet
id: aws_organizations_create_account
type: command
tech: aws
level: intermediate
importance: high
format: knowledge
tags: aws,organizations,multiaccount
title: Créer un compte membre dans AWS Organizations
context: Depuis le compte master de l'organisation
command: aws organizations create-account --email <EMAIL_COMPTE> --account-name <NOM_COMPTE>
example: aws organizations create-account --email dev@company.com --account-name myapp-dev
description: Crée un compte AWS enfant rattaché à l'organisation, avec facturation consolidée automatique
-->

### 2. Configurer les profils AWS CLI

Une fois les comptes créés, la règle d'or est de ne jamais avoir à modifier votre configuration pour passer d'un environnement à l'autre. Les profils nommés règlent ça proprement.

```bash
# Profil dev
aws configure --profile dev

# Profil staging
aws configure --profile staging

# Profil prod — MFA recommandé
aws configure --profile prod
```

Chaque commande CLI peut ensuite cibler un compte précis sans risque de confusion :

```bash
aws --profile <PROFILE> ec2 describe-instances
```

```bash
# Exemple : lister les instances du compte staging
aws --profile staging ec2 describe-instances
```

<!-- snippet
id: aws_profile_switch
type: command
tech: aws
level: intermediate
importance: high
format: knowledge
tags: aws,cli,profile,environment
title: Cibler un compte avec un profil AWS CLI nommé
context: Après avoir configuré les profils via `aws configure --profile`
command: aws --profile <PROFILE> ec2 describe-instances
example: aws --profile staging ec2 describe-instances
description: Exécute une commande AWS dans le compte associé au profil nommé, sans toucher à la configuration par défaut
-->

<!-- snippet
id: aws_env_error_prod
type: warning
tech: aws
level: intermediate
importance: high
format: knowledge
tags: aws,incident,prod,cli
title: Exécuter une commande destructrice sans vérifier le profil actif
content: La cause la plus fréquente d'incident CLI : lancer une commande sans `--profile` explicite, qui utilise alors le profil `default` — potentiellement prod. Toujours spécifier `--profile` explicitement ou positionner AWS_DEFAULT_PROFILE dans votre shell de travail. En prod, forcer MFA via une politique IAM ajoute une étape de confirmation qui bloque les exécutions accidentelles.
description: Ne jamais laisser le profil "default" pointer vers prod — une commande sans --profile peut être catastrophique
-->

### 3. Verrouiller la production avec des SCPs

Les SCPs sont les garde-fous que même un administrateur local ne peut pas contourner. Elles s'appliquent à tous les comptes d'un Organizational Unit, quelle que soit la politique IAM en place localement — c'est leur principal intérêt.

Exemple de SCP qui interdit la suppression ou l'arrêt de CloudTrail en production :

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyCloudTrailDelete",
      "Effect": "Deny",
      "Action": [
        "cloudtrail:DeleteTrail",
        "cloudtrail:StopLogging"
      ],
      "Resource": "*"
    }
  ]
}
```

Une fois la SCP créée dans Organizations, on l'attache à l'OU prod :

```bash
aws organizations attach-policy \
  --policy-id <SCP_POLICY_ID> \
  --target-id <OU_ID>
```

```bash
# Exemple
aws organizations attach-policy \
  --policy-id p-abc123 \
  --target-id ou-root-xyz789
```

<!-- snippet
id: aws_scp_attach
type: command
tech: aws
level: intermediate
importance: high
format: knowledge
tags: aws,organizations,scp,security
title: Attacher une SCP à un Organizational Unit
context: Depuis le compte master — la SCP s'applique à tous les comptes de l'OU, admins compris
command: aws organizations attach-policy --policy-id <SCP_POLICY_ID> --target-id <OU_ID>
example: aws organizations attach-policy --policy-id p-abc123 --target-id ou-root-xyz789
description: Applique une Service Control Policy sur un OU entier — les actions bloquées sont refusées même avec les droits admin locaux
-->

<!-- snippet
id: aws_scp_concept
type: concept
tech: aws
level: intermediate
importance: high
format: knowledge
tags: aws,scp,organizations,security
title: Les SCPs court-circuitent les politiques IAM locales
content: Une SCP (Service Control Policy) définit le périmètre maximum d'actions autorisées dans un compte. Même un utilisateur avec la policy AdministratorAccess ne peut pas effectuer une action bloquée par une SCP. C'est l'outil idéal pour des contraintes non négociables en prod : interdire la suppression de trails CloudTrail, bloquer les déploiements hors pipeline, ou limiter les régions utilisables.
description: Les SCPs s'appliquent avant les policies IAM locales — elles définissent ce qui est physiquement possible dans un compte
-->

### 4. Stocker la configuration par environnement dans SSM

La configuration qui change d'un environnement à l'autre — URLs de bases de données, endpoints, feature flags — doit vivre dans des variables, jamais dans le code. AWS Systems Manager Parameter Store est l'outil naturel pour ça. La convention de nommage `/app/<env>/parametre` facilite la lecture et les droits IAM par préfixe.

```bash
# Écrire un paramètre chiffré pour un environnement
aws ssm put-parameter \
  --name "/myapp/<ENV>/<PARAMETRE>" \
  --value "<VALEUR>" \
  --type SecureString \
  --profile <PROFILE>
```

```bash
# Exemple : stocker l'URL de base de données prod
aws ssm put-parameter \
  --name "/myapp/prod/database_url" \
  --value "postgres://user:pass@host:5432/db" \
  --type SecureString \
  --profile prod
```

```bash
# Lire le paramètre au démarrage de l'application
aws ssm get-parameter \
  --name "/myapp/prod/database_url" \
  --with-decryption \
  --profile prod
```

<!-- snippet
id: aws_ssm_env_config
type: command
tech: aws
level: intermediate
importance: medium
format: knowledge
tags: aws,ssm,configuration,environment
title: Stocker la config par environnement dans SSM Parameter Store
context: Convention de nommage recommandée : /app/<env>/parametre — facilite les IAM policies par préfixe
command: aws ssm put-parameter --name "/myapp/<ENV>/<PARAMETRE>" --value "<VALEUR>" --type SecureString --profile <PROFILE>
example: aws ssm put-parameter --name "/myapp/prod/database_url" --value "postgres://..." --type SecureString --profile prod
description: Stocke une variable de configuration chiffrée dans SSM, isolée par environnement via le chemin hiérarchique
-->

---

## Ce qui se passe sous le capot

💡 **Le flux de promotion est à sens unique.** Le code ne va jamais en arrière. Il part de dev, monte vers staging après validation, puis vers prod après approbation explicite. Un bug trouvé en prod ne se corrige pas directement en prod — il repart de dev, retraverse staging, puis revient. Ce principe garantit que staging a toujours vu le changement avant prod, sans exception.

⚠️ **Staging doit être une copie conforme de prod.** Un staging avec des instances deux fois plus petites, une version de base de données décalée ou des variables d'environnement différentes ne valide pas grand-chose. Les bugs de production apparaissent précisément là où staging diverge. Le pattern correct : les mêmes modules Terraform pour les deux environnements, seuls les fichiers `tfvars` changent.

🧠 **L'erreur du vendredi après-midi.** Les déploiements prod en fin de semaine concentrent statistiquement les incidents — non par superstition, mais parce que l'équipe est moins disponible pour réagir sur le week-end. Une SCP peut littéralement bloquer les déploiements prod le vendredi soir et le week-end. C'est une décision d'ingénierie, pas une contrainte managériale.

<!-- snippet
id: aws_env_staging_parity
type: tip
tech: aws
level: intermediate
importance: medium
format: knowledge
tags: aws,staging,bestpractice,terraform
title: Staging doit être une copie conforme de prod
content: Un staging qui diffère de prod (taille d'instance, variables d'env, version de BDD) ne valide pas grand-chose. Les bugs de prod apparaissent exactement là où staging diverge. Le pattern correct : mêmes modules Terraform pour staging et prod, seuls les fichiers tfvars changent. Même AMI, même version de moteur RDS, trafic synthétique représentatif du trafic réel.
description: Partager les mêmes modules Terraform entre staging et prod — seuls les fichiers tfvars diffèrent par environnement
-->

<!-- snippet
id: aws_env_mixing_warning
type: warning
tech: aws
level: intermediate
importance: high
format: knowledge
tags: aws,incident,environment,blast-radius
title: Ne jamais partager des ressources entre environnements
content: Partager une base de données, un bucket S3 ou un rôle IAM entre dev et prod est l'une des causes les plus fréquentes d'incidents. Un développeur qui teste en dev peut écraser des données prod, vider un bucket partagé ou déclencher des alertes de sécurité. L'isolation doit être totale : pas de ressource partagée, pas de cross-account access non contrôlé. Même un bucket "en lecture seule" peut servir de vecteur si les permissions dérivent.
description: Tout partage de ressource entre environnements crée un vecteur d'incident — même un bucket S3 en lecture seule
-->

---

## Cas réel — migration multi-compte chez une SaaS B2B

**Contexte** : une startup SaaS de 12 développeurs héberge tout dans un compte AWS unique. Dev, staging et prod partagent le même VPC. Un développeur senior exécute `aws ec2 terminate-instances` sans le flag `--profile` — il visait dev, il a terminé trois instances de prod. Downtime de 23 minutes, incident client majeur, post-mortem douloureux.

**Solution déployée en deux semaines** :

1. Migration vers 3 comptes AWS séparés via AWS Organizations (2 jours de travail effectif)
2. Refactoring Terraform : modules communs partagés, un répertoire `tfvars` par environnement, states S3 isolés
3. SCP sur le compte prod : `terminate-instances` et toutes les actions `delete-*` bloquées sans MFA
4. Profils AWS CLI distincts, prompt shell configuré pour afficher `[PROD]` en rouge quand le profil prod est actif
5. Pipeline CI/CD : merge sur `main` → déploiement automatique en staging, promotion manuelle vers prod avec approbation dans Slack

**Résultats mesurés après 6 mois** :

- Zéro incident de cross-contamination entre environnements
- Temps de déploiement réduit de 40 % grâce à l'automatisation du pipeline
- Audit de sécurité passé sans observation majeure sur la séparation des accès
- Coûts dev réduits de 30 % — les instances dev peuvent être dimensionnées librement sans risquer de confusion avec prod

---

## Bonnes pratiques

**1 compte AWS par environnement, sans exception.** Les VPCs séparés dans le même compte ne suffisent pas — une IAM policy trop large peut traverser les VPCs. L'isolation de compte est la seule vraie barrière physique.

**Nommez toutes vos ressources avec l'environnement.** `myapp-prod-db` vs `myapp-dev-db` — ça semble trivial jusqu'au moment où vous lisez un log d'incident à 3h du matin.

**Configurez votre terminal pour afficher l'environnement actif.** Un prompt shell qui affiche `[PROD]` en rouge quand le profil prod est actif a évité des incidents réels dans de nombreuses équipes. C'est trivial à configurer, le retour sur investissement est immédiat.

**SCPs pour les contraintes non négociables, IAM pour le reste.** Une SCP qui interdit `s3:DeleteBucket` en prod s'applique même si quelqu'un crée un rôle admin dans ce compte. C'est la garantie qu'une erreur de configuration IAM locale ne peut pas contourner vos garde-fous.

**Partagez les modules Terraform, pas les états.** Même base de code pour tous les environnements, mais chaque environnement a son propre state S3 + table DynamoDB pour le locking. Les `tfvars` contiennent les seules différences.

**Automatisez le déploiement vers staging, manualisez l'approbation vers prod.** Le merge déclenche staging automatiquement. La promotion vers prod demande une approbation humaine — mais une fois accordée, l'exécution doit être aussi automatisée que staging. L'humain décide, la machine exécute.

**Limitez les accès prod au strict nécessaire.** Dans une équipe de moins de 50 personnes, 3 à 5 personnes avec accès prod suffisent. Chaque accès supplémentaire est une surface d'attaque potentielle. Utilisez des rôles assumés via `sts:AssumeRole` plutôt que des clés permanentes.

<!-- snippet
id: aws_env_definition
type: concept
tech: aws
level: intermediate
importance: high
format: knowledge
tags: aws,environment,devops,organizations
title: Trois environnements, trois niveaux de confiance
content: Dev, staging et prod ne sont pas juste des noms — ils représentent des niveaux de confiance différents. Dev tolère les erreurs et les expérimentations. Staging doit être une copie fidèle de prod pour être utile. Prod exige des accès restreints, de l'audit et des déploiements contrôlés. Placer chaque environnement dans un compte AWS séparé garantit une isolation physique complète et un blast radius maîtrisé.
description: Trois niveaux de confiance, trois comptes AWS, trois politiques d'accès — la base d'une architecture robuste
-->

---

## Résumé

La séparation des environnements n'est pas une question de confort — c'est une question de risque maîtrisé. Mettre dev et prod dans le même compte, c'est laisser une porte ouverte entre votre bac à sable et votre production. La seule vraie barrière est un compte AWS distinct, pas un VPC, pas un préfixe de ressource.

AWS Organizations apporte la structure : isolation physique du blast radius, SCPs incontournables même pour les admins, facturation centralisée. Le staging conforme à prod garantit que vos validations ont une valeur réelle. Et le pattern Terraform partagé avec des `tfvars` par environnement est ce qui rend cette architecture maintenable sur la durée.

Le module suivant aborde les architectures hautement disponibles — concevoir pour la résilience suppose d'abord de savoir précisément dans quel compte et quel environnement vous déployez.