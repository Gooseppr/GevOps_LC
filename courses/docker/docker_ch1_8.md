---
layout: page
title: "Logs et debug"

course: docker
theme: "Prise en main"
type: lesson

chapter: 1
section: 8

tags: docker,logs,debug,monitoring,commandes
difficulty: beginner
duration: 30
mermaid: false

status: "published"
---

# Logs et debug

## Objectifs pédagogiques

- Comprendre ce que sont les logs  
- Utiliser `docker logs`  
- Suivre l’activité d’un conteneur  
- Diagnostiquer un problème simple  

---

## Contexte et problématique

Quand un conteneur ne fonctionne pas correctement :

- il peut s’arrêter  
- il peut planter  
- il peut ne rien afficher  

👉 Sans information, impossible de comprendre pourquoi.

C’est là qu’interviennent les **logs**.

---

## Définition

### Logs*

Les logs sont des messages générés par une application :

- informations  
- erreurs  
- avertissements  

👉 Ils permettent de comprendre ce qu’il se passe

---

## Commandes essentielles

### Voir les logs d’un conteneur

```bash
docker logs mon-nginx
```

👉 Affiche tout ce que le conteneur a produit

---

### Suivre les logs en temps réel

```bash
docker logs -f mon-nginx
```

👉 `-f` = follow (suivre en direct)

---

### Afficher les dernières lignes

```bash
docker logs --tail 10 mon-nginx
```

👉 Affiche les 10 dernières lignes

---

### Ajouter les timestamps

```bash
docker logs -t mon-nginx
```

👉 Ajoute la date et l’heure

---

## Fonctionnement interne

💡 Astuce  
Les logs sont souvent la première chose à regarder en cas de problème.

⚠️ Erreur fréquente  
Ne pas consulter les logs et chercher au hasard.

💣 Piège classique  
Penser qu’un conteneur ne fait rien alors qu’il génère des erreurs.

🧠 Concept clé  
Les logs = principale source d’information pour le debug

---

## Cas réel

Ton conteneur s’arrête immédiatement :

```bash
docker ps -a
```

Puis :

```bash
docker logs mon-app
```

👉 Tu vois une erreur :

- port déjà utilisé  
- configuration incorrecte  
- dépendance manquante  

---

## Bonnes pratiques

- Toujours vérifier les logs en premier  
- Utiliser `-f` pour suivre en temps réel  
- Ne pas ignorer les erreurs  

---

## Résumé

Les logs permettent de :

- comprendre ce qu’il se passe  
- détecter les erreurs  
- analyser un problème  

👉 C’est l’outil principal de debug dans Docker  

---

## Notes

*Logs : messages générés par une application pour indiquer son état et ses erreurs

---
[← Module précédent](docker_ch1_7.md) | [Module suivant →](docker_ch2_1.md)
---
