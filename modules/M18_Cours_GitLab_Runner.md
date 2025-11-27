---
layout: page
title: Intégration continue - GitLab Runner
sujet: Intégration continue (CI)
type: module
jour: 18
ordre: 2
tags: ci, yaml, gitlab, devops
---

# 🚀 Cours complet : GitLab Runner

## 🌟 Objectifs du cours

À la fin de ce module, tu sauras : - ✅ Expliquer ce qu'est un **GitLab
Runner**, à quoi il sert et comment il fonctionne.\
- ✅ Identifier les différents types de runners disponibles et leurs
modes d'exécution.\
- ✅ Installer et enregistrer un runner sur une machine ou via Docker.\
- ✅ Comprendre comment un runner exécute les jobs CI/CD.\
- ✅ Modifier le fichier `config.toml` du runner.\
- ✅ Utiliser les commandes essentielles pour gérer et surveiller tes
runners.

------------------------------------------------------------------------

## 🧩 Introduction : à quoi sert un GitLab Runner ?

Un **GitLab Runner** est le moteur d'exécution des **pipelines CI/CD**
de GitLab.\
Lorsqu'un pipeline est déclenché (par un `push`, une `merge request`,
etc.), GitLab délègue les tâches à un runner.

👉 C'est lui qui **exécute réellement les jobs** définis dans le fichier
`.gitlab-ci.yml`.

### Exemple de tâches qu'un runner peut exécuter :

-   Compiler ton code (Java, Python, C...)
-   Lancer des tests automatisés
-   Déployer une application
-   Effectuer des vérifications de sécurité ou de style

Sans runner, **aucun pipeline ne peut fonctionner**, même si ton
`.gitlab-ci.yml` est parfait.

------------------------------------------------------------------------

## ⚙️ Fonctionnement global

1.  Tu fais un **push** sur ton dépôt.\
2.  GitLab détecte le fichier `.gitlab-ci.yml` et génère un pipeline.\
3.  GitLab cherche un runner disponible (partagé ou spécifique).\
4.  Le runner récupère le job et exécute les instructions dans
    l'environnement choisi (shell, Docker, Kubernetes...).\
5.  Le runner renvoie les logs et le résultat à GitLab.

``` mermaid
sequenceDiagram
  participant Dev as Développeur
  participant GitLab as GitLab CI
  participant Runner as GitLab Runner
  Dev->>GitLab: push code
  GitLab->>Runner: envoie un job à exécuter
  Runner-->>GitLab: exécution + logs
  GitLab-->>Dev: résultat du pipeline
```

------------------------------------------------------------------------

## 🧱 Les types de runners

### 🧩 Runners partagés (shared)

-   Gérés par l'administrateur GitLab (ex : GitLab.com)\
-   Disponibles pour tous les projets\
-   Idéal pour commencer rapidement\
-   Moins personnalisables

### 🧩 Runners spécifiques (specific)

-   Liés à un seul projet ou groupe\
-   Gérés par toi ou ton équipe\
-   Parfaits pour un contrôle complet (réseau, outils, sécurité)

------------------------------------------------------------------------

## 🧰 Modes d'exécution

  ---------------------------------------------------------------------------
  Mode             Description                     Avantages
  ---------------- ------------------------------- --------------------------
  **Shell**        Exécution directe sur le        Rapide, simple à
                   système hôte                    configurer

  **Docker**       Chaque job tourne dans un       Isolé, reproductible
                   conteneur Docker                

  **Docker         Crée des VM Docker à la demande Évolutif
  Machine**                                        

  **Kubernetes**   Chaque job tourne dans un pod   Idéal pour les
                   Kubernetes                      environnements cloud

  **Custom**       Mode avancé pour exécuter des   Flexible
                   jobs sur mesure                 
  ---------------------------------------------------------------------------------------------------------------------------------------------

## 🛠 Installation d'un GitLab Runner

### 🐧 Sur Linux

``` bash
curl -L https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh | sudo bash
sudo apt-get install -y gitlab-runner
```

Vérifie son installation :

``` bash
gitlab-runner --version
```

------------------------------------------------------------------------

## 🔐 Enregistrement d'un runner

Avant qu'un runner puisse exécuter des jobs, il doit être **enregistré**
auprès de GitLab.

### Étapes :

1.  Va dans ton projet GitLab → **Paramètres \> CI/CD \> Runners**\
2.  Clique sur **"Ajouter un nouveau runner"**
3.  Copie la commande fournie, par exemple :

``` bash
gitlab-runner register --url https://gitlab.com --token TON_TOKEN_PRIVÉ
```

### Exemple de configuration demandée :

    URL de GitLab : https://gitlab.com
    Token : ton token privé
    Description : runner-linux
    Tags : docker, node18
    Exécuteur : docker
    Image Docker par défaut : node:18

Une fois enregistré, ton runner apparaîtra dans l'interface GitLab.

------------------------------------------------------------------------

## 📦 Exemple de job utilisant un runner

``` yaml
job_de_test:
  script:
    - echo "Tests en cours"
  tags:
    - docker
```

👉 Le tag `docker` doit **correspondre** à celui défini lors de
l'enregistrement du runner.

------------------------------------------------------------------------

## ⚙️ Configuration avancée : le fichier `config.toml`

Emplacement : `/etc/gitlab-runner/config.toml`

### Exemple :

``` toml
[runners.docker]
  image = "node:18"
  privileged = true
  disable_cache = false
  tls_verify = false
```

### Explications :

-   `image` : image Docker utilisée par défaut
-   `privileged` : autorise Docker-in-Docker
-   `disable_cache` : désactive ou non le cache
-   `tls_verify` : vérifie les certificats SSL

------------------------------------------------------------------------

## 🖥 Commandes essentielles

  -----------------------------------------------------------------------------------------
  Commande                                          Description
  ------------------------------------------------- ---------------------------------------
  `gitlab-runner status`                            Vérifie si le service est actif

  `gitlab-runner list`                              Liste les runners enregistrés

  `gitlab-runner verify`                            Vérifie la connectivité avec GitLab

  `gitlab-runner unregister --name nom_du_runner`   Supprime un runner localement
  -----------------------------------------------------------------------------------------------------------------------------------------------------------

## 💡 Bonnes pratiques

✅ Donne des **tags clairs** à tes runners (`docker`, `node18`,
`linux`).\
✅ Vérifie régulièrement leur **état** (`gitlab-runner verify`).\
✅ Supprime les runners **inutilisés**.\
✅ Utilise des **runners spécifiques** pour les projets sensibles.\
✅ Garde un **runner partagé** pour les tests rapides.

------------------------------------------------------------------------

## 🧠 En résumé

  -----------------------------------------------------------------------
  Élément                       Description
  ----------------------------- -----------------------------------------
  **Rôle du runner**            Exécuter les jobs CI/CD définis dans
                                `.gitlab-ci.yml`

  **Types**                     Partagés / Spécifiques

  **Modes d'exécution**         Shell, Docker, Docker Machine, Kubernetes

  **Fichier config**            `/etc/gitlab-runner/config.toml`

  **Commandes clés**            `status`, `verify`, `list`, `unregister`

  **Tags**                      Lien entre un job et un runner
  -----------------------------------------------------------------------------------------------------------------------------------------

🎉 **Félicitations !**\
Tu maîtrises maintenant les **GitLab Runners**, leur fonctionnement,
leur installation, leur configuration et leur gestion quotidienne.

---
[← Module précédent](M18_intégration-continue.md) | [Module suivant →](M18_azure_devops.md)
---
