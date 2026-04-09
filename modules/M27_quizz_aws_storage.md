---
layout: page
title: Quizz AWS Storage
sujet: Hosting & Cloud
type: module
jour: 27
ordre: 3
tags: infrastructure, bdd, stockage, cloud, devops
---

# 📘 **Cours : Comprendre les mécanismes de stockage AWS à travers un quiz**

Dans ce cours, on va utiliser les questions du quiz comme **fil conducteur** pour expliquer réellement **pourquoi** chaque réponse est correcte — et quelles notions essentielles il faut être capable de mobiliser en tant que DevOps / Architecte Cloud.

Le but n’est pas seulement de connaître la réponse, mais de comprendre **l’architecture et la logique AWS derrière**.

---

# 🔥 **Fil rouge : Les 3 familles de stockage AWS**

Avant d’entrer dans les questions, garde en tête les **trois grands modèles de stockage** sur AWS :

| Type | Exemple AWS | Usage | Important |
| --- | --- | --- | --- |
| **Object Storage** | **S3** | fichiers, médias, backups, data lakes | scalable, pas attaché à une machine |
| **Block Storage** | **EBS**, **Instance Store** | bases de données, OS, volumes persistants | attaché à une instance EC2 |
| **File Storage** | **EFS**, **FSx** | partage NFS/SMB entre serveurs | multi-AZ, multi-mount |

Chaque question du quiz revient en fait à identifier **le bon type de stockage pour le bon besoin**.

---

# 🧩 **Analyse détaillée du quiz**

---

## 1️⃣ **Quel service est adapté pour héberger un site web statique ?**

➡️ **Bonne réponse : Amazon S3**

### Pourquoi ?

Un site web statique, c’est :

- HTML
- CSS
- JavaScript
- images statiques

❗ Tu n’as **pas** besoin de serveur, ni d'EC2, ni de scaling manuel.

🔍 **Pourquoi S3 est parfait :**

- Stockage object → parfait pour des fichiers statiques.
- SLA très élevé, réplication multi-AZ.
- Public access possible pour hébergement.
- Couplable avec CloudFront (CDN).
- Très faible coût ("pay as you go").

💡 Beaucoup d’entreprises hébergent leurs sites statiques 100% sur S3 + CloudFront.

---

## 2️⃣ **Quel service fournit un stockage au niveau objet ?**

➡️ **Bonne réponse : S3**

### Pourquoi ?

AWS offre trois grands modes de stockage, mais **seul S3 est de l’object storage**.

Object storage = idéal pour :

- fichiers volumineux
- data lakes
- backups
- médias
- logs

EBS = block

EFS = file

Instance store = block temporaire

---

## 3️⃣ **Où pouvez-vous stocker des fichiers ?**

➡️ **Bonne réponse : EBS**

### Pourquoi ?

Un **fichier** peut être stocké :

- en object storage (S3)
- en file storage (EFS)
- en block storage (EBS)

Mais dans la question, on te propose :

| Option | Type | Stocke des fichiers ? |
| --- | --- | --- |
| SNS | messaging | ❌ |
| ECS | containers | ❌ |
| EMR | Hadoop | ❌ |
| **EBS** | block | ✔️ |

Le seul système de stockage présent dans les réponses est : **EBS**.

---

## 4️⃣ **Données archivées pendant 5 ans, récupérables en < 5 heures**

➡️ **Bonne réponse : Amazon S3 Glacier**

### Pourquoi ?

Glacier est conçu pour :

- archivage long terme
- coût ultra bas
- faible fréquence d'accès
- récupération entre 1 minute et 12 heures selon la classe

👉 Les 5 heures demandées = **Glacier Flexible Retrieval**.

---

## 5️⃣ **Stocker des objets téléchargeables publiquement**

➡️ **Bonne réponse : Amazon S3**

### Pourquoi ?

S3 permet :

- d’héberger des fichiers
- de les rendre publics (bucket policy ou ACL)
- de bénéficier d’une URL HTTPS

EBS, Instance Store, EFS ne sont pas faits pour exposer des fichiers directement au public.

---

## 6️⃣ **Stockage partagé simple et scalable pour serveurs Linux**

➡️ **Bonne réponse : Amazon EFS**

### Pourquoi ?

EFS = file system NFS managé, utilisable :

- par plusieurs EC2 simultanément
- en multi-AZ
- idéal pour microservices, conteneurs, serveurs applicatifs

S3 n’est pas un file system

EBS n’est pas partagé

Glacier est pour archivage

---

## 7️⃣ **Stockage éphémère qui disparaît quand l’EC2 s’arrête**

➡️ **Bonne réponse : Instance Store**

### Pourquoi ?

Instance store = stockage local **directement sur le hardware** du serveur EC2.

🎯 Caractéristiques :

- très rapide
- gratuit (inclus dans l’instance)
- **mais non persistant**

Si l’instance **stop/terminate**, les données disparaissent.

---

## 8️⃣ **Stockage de vidéos utilisées uniquement en cas de litige (rarement consultées)**

➡️ **Bonne réponse : S3 Glacier Deep Archive**

### Pourquoi ?

Deep Archive = **le stockage le moins cher d’AWS**, adapté pour :

- données rarement accédées
- retention légale (juridique, conformité)
- archivage > 1 an
- récupération en ~12h

---

## 9️⃣ **Application stockant des photos / vidéos**

➡️ **Bonne réponse : Amazon S3**

### Pourquoi ?

S3 est :

- scalable
- accessible globalement
- idéal pour médias / images / vidéos
- couplable avec CloudFront, Lambda, Transcoder

EBS = pour bases de données, OS

Instance store = temporaire

SQS = file de messages

---

## 🔟 **Comment réduire les coûts S3 ?**

➡️ **Bonne réponse : Utiliser les bonnes classes de stockage**

### Pourquoi ?

S3 propose plusieurs classes :

| Classe | Usage |
| --- | --- |
| Standard | accès fréquent |
| Standard-IA | accès peu fréquent |
| One Zone IA | accès peu fréquent, 1 AZ |
| Glacier | archivage |
| Glacier Deep Archive | très long terme |
| Intelligent-Tiering | accès imprévisible |

Tu économises **beaucoup** en déplaçant automatiquement (Lifecycle) tes objets vers la classe appropriée.

---

## 11️⃣ **Base de données avec forte activité R/W**

➡️ **Bonne réponse : Amazon EBS**

### Pourquoi ?

Les bases de données nécessitent :

- faible latence
- IOPS élevé
- persistance
- logique block storage

EBS = stockage attaché type "disque dur" → parfait pour MySQL, PostgreSQL, MongoDB…

---

## 12️⃣ **Un IAM user n’arrive pas à créer des snapshots EBS**

➡️ **Bonne réponse : Il y a une politique de refus implicite**

### Pourquoi ?

IAM fonctionne avec le principe :

➡️ **Deny implicite par défaut**

Un utilisateur IAM ne peut **rien faire** tant qu’on ne lui donne pas explicitement des permissions.

C’est pour cela qu’il doit avoir :

- `ec2:CreateSnapshot`
- `s3:CreateBucket`
- `s3:PutObject`
- etc.

---

## 13️⃣ **Avantage de la réplication EBS dans une AZ**

➡️ **Bonne réponse : Durabilité**

### Pourquoi ?

EBS réplique automatiquement chaque volume sur plusieurs disques physiques de la même AZ → protection contre la panne d’un disque.

---

## 14️⃣ **Quel service stocke des objets, gère versioning et lifecycle ?**

➡️ **Bonne réponse : Amazon S3**

S3 supporte :

- objet + metadata
- versioning
- lifecycles transitions + expiration
- événements

---

## 15️⃣ **Service avec stockage objet illimité**

➡️ **Bonne réponse : Amazon S3**

S3 = évolutivité quasiment infinie (scaling horizontal natif).

---

## 16️⃣ **Stockage durable le moins coûteux pour backups instantanément accessibles**

➡️ **Bonne réponse : Amazon S3 Standard**

Explication :

- Glacier → non instantané
- EBS → cher
- Instance store → éphémère

Pour sauvegardes **accessibles immédiatement** = S3 standard ou IA (selon fréquence).

---

## 17️⃣ **Classe S3 adaptée aux accès imprévisibles**

➡️ **Bonne réponse : Intelligent-Tiering**

Pourquoi ?

- Déplace automatiquement tes objets entre :
    - Frequent Access
    - Infrequent Access
    - Archive tiers
- Sans surcharge d’admin

---

## 19️⃣ **Backups : récupération immédiate + coût réduit**

➡️ **Bonne réponse : S3 Standard-IA**

IA = accès "rare mais rapide".

---

## 20️⃣ **Quantité maximale stockable dans S3 ?**

➡️ **Bonne réponse : Pratiquement illimitée**

S3 = architecture sans limites théoriques.

---

## 21️⃣ **Permettre l’accès à certains utilisateurs S3**

➡️ **Bonne réponse : IAM Policies**

Les permissions S3 se gèrent via :

- IAM policies
- Bucket policies
- ACL (anciens, rarement utilisés)

IAM = fondation de toute sécurité sur AWS.

---

# 🎯 Conclusion : Ce que tu dois retenir

## 🧠 Résumé des idées clés

| Besoin | Service |
| --- | --- |
| Site statique | **S3** |
| Stockage fichier partagé | **EFS** |
| Base de données / faible latence | **EBS** |
| Archivage long terme | **Glacier / Deep Archive** |
| Stockage éphémère | **Instance Store** |
| Accès imprévisible | **S3 Intelligent-Tiering** |
| Fichiers publics / médias | **S3** |

## 🔥 Vision architecturale

La compétence DevOps/Cloud, c'est être capable de lire un besoin et d'y associer :

- le **bon modèle de stockage**,
- le **bon SLA**,
- le **bon coût**,
- la **bonne durabilité**,
- et le **bon niveau d’accessibilité**.

Ce quiz couvre exactement ces 5 dimensions.



<!-- snippet
id: aws_s3_public_objects
type: concept
tech: aws
level: beginner
importance: high
format: knowledge
tags: s3,bucket,public,hébergement
title: S3 – Rendre des objets publiquement accessibles
context: exposer des fichiers S3 à des utilisateurs publics via une URL HTTPS
content: S3 rend des objets publics via bucket policy explicite. Chaque objet reçoit une URL HTTPS. EBS, Instance Store et EFS ne sont pas conçus pour l'exposition publique sur Internet.
-->

<!-- snippet
id: aws_glacier_flexible_retrieval
type: concept
tech: aws
level: intermediate
importance: medium
format: knowledge
tags: s3,glacier,archive,récupération
title: Glacier Flexible Retrieval – Archivage avec récupération en < 5 heures
context: choisir la bonne classe Glacier selon le délai de récupération accepté
content: Glacier Instant Retrieval : accès en ms. Flexible Retrieval : accès 1 min à 12h (archivage 5 ans, récupérable en < 5h). Deep Archive : ~12h, le moins cher, pour rétention > 7 ans.
-->

<!-- snippet
id: aws_efs_shared_linux
type: concept
tech: aws
level: beginner
importance: high
format: knowledge
tags: efs,nfs,partage,linux,ec2
title: EFS – Stockage partagé NFS pour serveurs Linux
context: partager un système de fichiers entre plusieurs instances EC2 Linux
content: EFS est le seul service AWS permettant un accès NFS partagé entre plusieurs EC2 Linux simultanément. S3 n'est pas montable comme file system. EBS n'est pas partageable.
-->

<!-- snippet
id: aws_s3_ebs_comparison
type: tip
tech: aws
level: beginner
importance: high
format: knowledge
tags: s3,ebs,efs,instance-store,comparaison
title: Choisir entre S3, EBS, EFS et Instance Store
context: identifier rapidement le bon service de stockage AWS selon le besoin
content: Instance Store : ultra rapide mais éphémère. EBS : disque persistant pour BDD/OS. EFS : NFS partagé entre plusieurs EC2. S3 : object storage scalable pour médias et backups. Aucun n'est interchangeable.
-->

<!-- snippet
id: aws_s3_storage_cost_reduction
type: tip
tech: aws
level: intermediate
importance: high
format: knowledge
tags: s3,coûts,lifecycle,intelligent-tiering
title: Réduire les coûts S3 avec les classes et le Lifecycle
context: optimiser la facture S3 selon la fréquence d'accès aux données
content: Réduire les coûts S3 en appliquant la classe adaptée à la fréquence d'accès. Automatiser avec les règles Lifecycle (Standard → IA → Glacier) ou utiliser Intelligent-Tiering.
-->

<!-- snippet
id: aws_ebs_durability
type: concept
tech: aws
level: beginner
importance: medium
format: knowledge
tags: ebs,durabilité,réplication,az
title: EBS – Durabilité par réplication intra-AZ
context: comprendre comment EBS protège les données contre les pannes matérielles
content: EBS réplique chaque volume sur plusieurs disques physiques dans la même AZ — protection contre la défaillance d'un disque. Pour survivre à une panne d'AZ, utiliser des snapshots.
-->

---
[← Module précédent](M27_flashcard_aws_storage.md)
---
