---
layout: page
title: "Sécurité applicative en Python"

course: python
chapter_title: "APIs, Sécurité & Configuration"

chapter: 2
section: 9

tags: python,securite,auth,hashing,jwt,owasp
difficulty: intermediate
duration: 110
mermaid: true

status: draft
prev_module: "/courses/python/module_16_api_fastapi.html"
prev_module_title: "APIs & backend Python avec FastAPI"
next_module: "/courses/python/module_18_configuration.html"
next_module_title: "Multi-environnement & configuration en Python"
---

# Sécurité applicative en Python

## Objectifs pédagogiques
- Comprendre les vulnérabilités courantes (OWASP)
- Sécuriser une API Python (auth, validation, secrets)
- Implémenter un hashing sécurisé des mots de passe
- Éviter les failles critiques (injection, exposition données)

## Contexte
La majorité des applications exposées sur internet sont vulnérables à cause de mauvaises pratiques. La sécurité n’est pas un bonus, c’est une exigence.

## Principe de fonctionnement

🧠 Concept clé — Surface d’attaque  
Tout point d’entrée de ton application (API, formulaire, fichier)

🧠 Concept clé — Défense en profondeur  
Multiplier les couches de sécurité

💡 Astuce — Ne jamais faire confiance aux entrées utilisateur

⚠️ Erreur fréquente — sécurité ajoutée après coup  
→ souvent trop tard

---

## Architecture

| Composant | Rôle | Exemple |
|-----------|------|---------|
| Client | envoie données | navigateur |
| API | validation + auth | FastAPI |
| DB | stockage | PostgreSQL |
| Auth | contrôle accès | JWT |

```mermaid
flowchart LR
  A[Client] --> B[API]
  B --> C[Validation]
  B --> D[Auth]
  B --> E[DB]
```

---

## Syntaxe ou utilisation

### Hash mot de passe ⭐

```python
import bcrypt

password = b"secret"
hashed = bcrypt.hashpw(password, bcrypt.gensalt())

bcrypt.checkpw(password, hashed)
```

Résultat : stockage sécurisé (non réversible)

---

### JWT (authentification)

```python
import jwt

token = jwt.encode({"user_id": 1}, "SECRET", algorithm="HS256")
```

---

### Variables d’environnement ⭐

```bash
export SECRET_KEY=mysecret
```

---

## Workflow du système

1. Client envoie données
2. API valide input
3. Authentification
4. Traitement
5. Réponse sécurisée

```mermaid
sequenceDiagram
  participant Client
  participant API
  participant DB

  Client->>API: Request
  API->>API: Validate
  API->>API: Auth
  API->>DB: Query
  DB-->>API: Data
  API-->>Client: Response
```

En cas d’erreur :
- rejet immédiat
- log de sécurité

---

## Cas d'utilisation

### Cas simple
Login utilisateur sécurisé

### Cas réel
Backend SaaS :
- auth JWT
- hashing mots de passe
- protection API
- gestion rôles

---

## Erreurs fréquentes

⚠️ Stocker mot de passe en clair  
→ fail critique

⚠️ Utiliser SHA256 seul  
→ trop rapide → vulnérable

⚠️ Exposer secrets dans code  
→ fuite données

💡 Astuce : toujours utiliser bcrypt + env vars

---

## Bonnes pratiques

🔧 Toujours hasher les mots de passe  
🔧 Valider toutes les entrées  
🔧 Utiliser variables d’environnement  
🔧 Mettre en place authentification  
🔧 Logger les accès sensibles  
🔧 Limiter les permissions  
🔧 Mettre à jour dépendances  

---

## Résumé

| Concept | Définition courte | À retenir |
|--------|------------------|----------|
| hashing | protéger mdp | obligatoire |
| JWT | auth stateless | standard |
| validation | filtrer input | critique |

Étapes clés :
- valider
- authentifier
- sécuriser
- contrôler

Phrase clé : **Une application non sécurisée est une application déjà compromise.**

---

## SNIPPETS DE RÉVISION

<!-- snippet
id: python_bcrypt_hash
type: concept
tech: python
level: intermediate
importance: high
format: knowledge
tags: python,security
title: Hash mot de passe
content: bcrypt intègre un sel aléatoire dans chaque hash (donc deux fois le même mot de passe → deux hashs différents) et un facteur de coût configurable qui ralentit intentionnellement le calcul. Un attaquant qui vole la BDD ne peut pas faire de crack en masse rapidement.
description: MD5 et SHA-256 sont conçus pour être rapides — c'est un défaut pour le stockage de mots de passe. bcrypt, argon2 et scrypt sont conçus pour être lents exprès.
-->

<!-- snippet
id: python_jwt_usage
type: concept
tech: python
level: intermediate
importance: high
format: knowledge
tags: python,jwt
title: JWT authentification
content: Un JWT contient les données d'identité encodées en Base64 et signées (HMAC ou RSA). Le serveur vérifie la signature sans consulter de BDD — scalable et sans état. Mais un token valide reste valide jusqu'à expiration même si l'utilisateur est banni.
description: Toujours définir un `exp` (expiration) court. Pour la révocation immédiate, tenir une liste noire en cache Redis — le JWT seul ne suffit pas.
-->

<!-- snippet
id: python_password_warning
type: warning
tech: python
level: intermediate
importance: high
format: knowledge
tags: python,security,error
title: Mot de passe en clair
content: stocker mdp en clair → fail critique → utiliser bcrypt
description: fail majeur
-->

<!-- snippet
id: python_env_secret
type: concept
tech: python
level: intermediate
importance: high
format: knowledge
tags: python,env
title: Secrets en env
content: les secrets doivent être stockés en variables d'environnement
description: sécurité configuration
-->
