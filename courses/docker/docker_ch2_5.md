---
layout: page
title: "Variables d’environnement"

course: docker
theme: "Dockerfile et images"
type: lesson

chapter: 2
section: 5

tags: docker,env,configuration,variables
difficulty: intermediate
duration: 35
mermaid: false

status: "published"
prev_module: "/courses/docker/docker_ch2_4.html"
prev_module_title: "Optimiser les images (layers et cache)"
next_module: "/courses/docker/docker_ch2_6.html"
next_module_title: "Gestion des dépendances"
---

# Variables d’environnement

## Objectifs pédagogiques

- Comprendre l’utilité des variables d’environnement  
- Utiliser `ENV` dans un Dockerfile  
- Passer des variables au lancement d’un conteneur  
- Comprendre la configuration dynamique  

---

## Contexte et problématique

Dans une application réelle, tu dois souvent gérer :

- des ports  
- des mots de passe  
- des URLs  
- des configurations différentes (dev / prod)

👉 Tu ne peux pas hardcoder (écrire en dur) ces valeurs.

---

## Définition

### Variable d’environnement*

Une variable d’environnement est une valeur externe à ton application.

👉 Elle permet de configurer ton application sans modifier le code.

---

## Commandes essentielles

### Définir une variable dans un Dockerfile

```Dockerfile
ENV PORT=3000
```

---

### Passer une variable au runtime

```bash
docker run -e PORT=3000 mon-app
```

---

### Utiliser un fichier .env

```bash
docker run --env-file .env mon-app
```

👉 `.env` contient :

```bash
PORT=3000
DB_HOST=localhost
```

---

## Fonctionnement interne

💡 Astuce  
Les variables permettent d’adapter ton application sans rebuild.

⚠️ Erreur fréquente  
Mettre des informations sensibles directement dans le Dockerfile.

💣 Piège classique  
Confondre variable build et variable runtime.  
👉 Une variable définie dans le Dockerfile est figée dans l’image.  
👉 Une variable passée avec `docker run` est dynamique.  
👉 Cela peut créer des comportements différents selon les environnements.

🧠 Concept clé  
Les variables permettent de séparer configuration et code.

---

## Cas réel

Tu déploies une API :

```bash
docker run -e NODE_ENV=production -e PORT=3000 mon-api
```

👉 Même image, configuration différente selon l’environnement.

---

## Bonnes pratiques

- Ne jamais stocker de secrets dans le Dockerfile  
- Utiliser des fichiers `.env`  
- Documenter les variables utilisées  

---

## Résumé

Les variables d’environnement permettent de :

- configurer une application  
- adapter les environnements  
- éviter de modifier le code  

👉 Elles sont essentielles pour un usage réel de Docker  

---

## Notes

*Variable d’environnement : valeur utilisée pour configurer une application

---

<!-- snippet
id: docker_run_env_variable
type: command
tech: docker
level: beginner
importance: high
format: knowledge
tags: env,runtime,configuration
title: Passer une variable d’environnement au lancement
command: docker run -e PORT=3000 mon-app
description: La variable est disponible dans le conteneur mais ne modifie pas l’image
-->

<!-- snippet
id: docker_run_env_file
type: command
tech: docker
level: intermediate
importance: medium
format: knowledge
tags: env,env-file,configuration,secrets
title: Charger les variables depuis un fichier .env
command: docker run --env-file .env mon-app
description: Utile pour passer plusieurs variables sans les exposer dans la commande
-->

<!-- snippet
id: docker_run_env_production
type: command
tech: docker
level: intermediate
importance: medium
format: knowledge
tags: env,production,runtime
title: Lancer avec variables d’environnement de production
command: docker run -e NODE_ENV=production -e PORT=3000 mon-api
description: Permet de réutiliser la même image avec une configuration différente selon l’environnement
-->

<!-- snippet
id: docker_env_variable_definition
type: concept
tech: docker
level: beginner
importance: high
format: knowledge
tags: env,configuration,concept
title: Définition d’une variable d’environnement
content: Une variable d’environnement est une valeur externe à l’application qui permet de la configurer sans modifier le code source.
-->

<!-- snippet
id: docker_piege_secrets_dockerfile
type: warning
tech: docker
level: intermediate
importance: high
format: knowledge
tags: env,secrets,securite,dockerfile
title: Ne jamais stocker des secrets dans le Dockerfile
content: Les valeurs définies avec ENV dans le Dockerfile sont figées dans l’image et visibles par quiconque y accède.
-->

<!-- snippet
id: docker_piege_secrets_dockerfile_b
type: warning
tech: docker
level: intermediate
importance: high
format: knowledge
tags: env,secrets,securite,dockerfile
title: Passer les secrets au runtime, pas dans l’image
content: Les secrets (mots de passe, clés API) doivent être passés au runtime avec -e ou --env-file, jamais codés dans le Dockerfile.
-->

<!-- snippet
id: docker_tip_env_sans_rebuild
type: tip
tech: docker
level: beginner
importance: low
format: knowledge
tags: env,configuration,flexibilite
title: Les variables permettent d’adapter sans rebuild
content: Passer des variables avec docker run permet de réutiliser la même image en dev, staging et prod sans reconstruire.
-->
