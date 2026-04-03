---
title: Projet J1 - Utilisation d'une Image privée
sujet: Projet NocoDb
type: module
jour: 42
ordre: 2
tags: projet, docker, docker swarm, stack, gitlab
---

# 🐳 Intégration d’une Image Privée GitLab dans Docker Swarm via Ansible

## Version finale — Conforme au *swarm-pro.yml* et au système Vault réel

Ce document récapitule **exactement** ce que nous avons mis en place aujourd’hui :

➡️ faire en sorte que le cluster Docker Swarm utilise **une image privée GitLab**,

➡️ via Ansible,

➡️ en sécurisant totalement l’accès via **Ansible Vault**,

➡️ sans exposer aucune information sensible.

---

# 1. 🎯 Objectif

On voulait remplacer l’image NocoDB publique :

```
nocodb/nocodb:latest

```

par **l’image privée** construite par notre collaborateur :

```
registry.gitlab.com/quickdata-batch22-group/nocodb/quickdata/nocodb:0.1.0

```

Et automatiser :

- l’authentification auprès du GitLab Container Registry,
- sur tous les nœuds du cluster (manager + workers),
- via Ansible,
- en gardant le tout **sécurisé** avec Vault.

---

# 2. 🔐 Configuration d’Ansible Vault (100 % des secrets dedans)

On met *toutes* les variables sensibles dans le fichier Vault :

```
group_vars/all/vault.yml

```

Contenu réel :

```yaml
vault_registry_url: "registry.gitlab.com"
vault_registry_user: "gregoire.elmacin"
vault_pat: "MON_PERSONAL_ACCESS_TOKEN"

vault_postgres_password: "..."
vault_nc_db_url: "pg://root_db:5432?u=admin&p=xxx&d=nocodb_db"

```

## ✔️ Commandes Vault utilisées

### Chiffrer

```bash
ansible-vault encrypt group_vars/all/vault.yml

```

### Déchiffrer

```bash
ansible-vault decrypt group_vars/all/vault.yml

```

### Modifier

```bash
ansible-vault edit group_vars/all/vault.yml

```

---

# 3. 🔧 Modification du playbook `swarm-pro.yml`

On n’utilise **pas** `community.docker`.

On reste sur une version “pure shell + Ansible”.

Nous avons ajouté **cet unique bloc**, exécuté sur tous les nœuds :

```yaml
- name: Se connecter au registry GitLab (Container Registry)
  shell: |
    echo "{{ vault_pat }}" | docker login {{ vault_registry_url }} \
      --username "{{ vault_registry_user }}" \
      --password-stdin
  register: registry_login
  changed_when: "'Login Succeeded' in registry_login.stdout"
  tags: [registry]

```

## Où ça se place dans *ton* `swarm-pro.yml` ?

Tu as en gros cette structure :

```yaml
- name: 0) Configurer les hostnames Linux
  ...

- name: 1. Installer Docker sur toutes les VMs
  ...   # <= c’est ici qu’on ajoute la tâche docker login

- name: 2. Initialiser le Swarm sur le manager
  ...

- name: 3. Joindre les workers au Swarm
  ...

- name: 4) Ajouter les labels sur les nœuds (depuis le manager)
  ...

- name: 5. Déployer la stack NocoDB + Postgres
  ...

```

👉 On **rajoute juste** la tâche de login dans le **play 1**, comme montré dans le bloc précédent.

✔️ Le token GitLab (`vault_pat`) est récupéré directement dans Vault.

✔️ L’URL (`vault_registry_url`) aussi.

✔️ L’utilisateur (`vault_registry_user`) aussi.

✔️ Pas de credentials ailleurs → propre et sécurisé.

---

# 4. 📝 Modification du `compose.yml`

Nous avons corrigé l’image NocoDB :

### ❌ Avant

```yaml
image: nocodb/nocodb:latest

```

### ✔️ Maintenant

```yaml
image: registry.gitlab.com/quickdata-batch22-group/nocodb/quickdata/nocodb:0.1.0

```

Pourquoi `0.1.0` ?

- parce que dans le registry GitLab **`latest` n’existait pas**,
- ce qui provoquait l’erreur :
    
    `"No such image: registry.gitlab..."`.
    

Le tag versionné a réglé le problème.

---

# 5. 🧪 Déploiement du Swarm avec Vault

On doit maintenant toujours lancer :

### Avec mot de passe Vault interactif

```bash
ansible-playbook -i inventory-pro.ini swarm-pro.yml --ask-vault-pass

```

### Ou avec fichier vault

```bash
ansible-playbook -i inventory-pro.ini swarm-pro.yml --vault-password-file .vault_pass

```

➡️ Obligatoire sinon Ansible ne peut pas lire `vault.yml`.

---

# 6. ✔️ Résultat obtenu

### 🔐 Sécurité garantie

- Credentials GitLab chiffrés
- Aucun secret dans l’inventaire
- Aucun secret dans les machines

### 🤖 Automatisation totale

Chaque nœud fait automatiquement :

```
docker login registry.gitlab.com

```

puis peut tirer l’image privée.

### 🛠️ Déploiement propre

Le Swarm utilise maintenant :

- une image interne versionnée,
- buildée par l'équipe,
- avec authentification sécurisée,
- gérée entièrement via Ansible.

---

# 7. 📄 Fichiers modifiés dans cette intégration

| Fichier | Ce qui a été ajouté/changé |
| --- | --- |
| `group_vars/all/vault.yml` | Ajout des credentials GitLab |
| `swarm-pro.yml` | Ajout du `docker login` automatisé |
| `compose.yml` | Remplacement de l’image NocoDB par l’image privée |
| `.env.j2` | Utilisation des variables Vault (DB / NC_DB) |

Aucun changement dans :

➡️ `inventory-pro.ini`

➡️ structure du projet

➡️ variables non sensibles

---

# 8. 🎉 Conclusion

On a maintenant :

- un **Swarm complet**,
- multi-nœuds,
- capable de tirer **une image privée GitLab**,
- grâce à Ansible et Vault,
- avec un playbook **propre, sécurisé et professionnel**.

Et tout est maintenant compatible CI/CD, scaling, et gestion multi-versions.

---
[← Module précédent](M42_ansible-pro.md)

---

<!-- snippet
id: ansible_pro_vault_encrypt_file
type: command
tech: ansible
level: intermediate
importance: high
format: knowledge
tags: ansible,vault,secrets,chiffrement
title: Chiffrer un fichier de secrets avec Ansible Vault
context: Protéger les credentials sensibles (tokens, mots de passe) dans un projet Ansible
command: ansible-vault encrypt group_vars/all/vault.yml
description: Chiffre le fichier vault.yml sur place. Pour éditer : ansible-vault edit vault.yml. Pour déchiffrer temporairement : ansible-vault decrypt vault.yml. Toujours stocker les credentials dans vault.yml (registry URL, user, PAT, mots de passe BDD). Ne jamais commiter le fichier déchiffré.
-->

<!-- snippet
id: ansible_pro_docker_login_shell
type: command
tech: ansible
level: intermediate
importance: high
format: knowledge
tags: ansible,docker,registry,gitlab,vault
title: Authentification Docker registry privé GitLab via Ansible
context: permettre à chaque nœud Swarm de puller une image privée
command: echo "{{ vault_pat }}" | docker login {{ vault_registry_url }} --username "{{ vault_registry_user }}" --password-stdin
description: `--password-stdin` évite que le token apparaisse dans les logs. Les variables sont lues depuis Ansible Vault.
-->

<!-- snippet
id: ansible_pro_vault_playbook_run
type: command
tech: ansible
level: intermediate
importance: high
format: knowledge
tags: ansible,vault,playbook,password
title: Lancer un playbook Ansible avec Ansible Vault
context: Exécuter un playbook qui utilise des variables chiffrées via Vault
command: ansible-playbook -i inventory-pro.ini swarm-pro.yml --ask-vault-pass
description: --ask-vault-pass demande le mot de passe interactivement. Alternative non-interactive : --vault-password-file .vault_pass (fichier contenant le mot de passe, à exclure du Git via .gitignore). Sans cette option, Ansible ne peut pas lire vault.yml et les variables sensibles seront indéfinies.
-->

<!-- snippet
id: ansible_pro_private_image_tag
type: warning
tech: ansible
level: intermediate
importance: medium
format: knowledge
tags: docker,registry,image,tag,gitlab
title: Toujours utiliser un tag versionné pour les images privées
context: Éviter l'erreur "No such image" lors du pull d'une image depuis un registry privé
content: Sur GitLab Container Registry, le tag "latest" n'est pas créé automatiquement. Toujours utiliser un tag versionné explicite (:0.1.0) dans compose.yml pour éviter l'erreur "No such image".
-->

---
[← Module précédent](M42_ansible-pro.md)
---
