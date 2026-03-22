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
[← Module précédent](docker_ch2_4.md) | [Module suivant →](docker_ch2_6.md)
---
