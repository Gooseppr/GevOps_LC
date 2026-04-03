---
layout: page
title: "Accès données & bases en Python (SQL, ORM, transactions)"

course: python
chapter_title: "Concurrence, Logging & Données"

chapter: 2
section: 7

tags: python,sql,orm,postgresql,transactions
difficulty: intermediate
duration: 100
mermaid: true

status: draft
---

# Accès données & bases en Python (SQL, ORM, transactions)

## Objectifs pédagogiques
- Comprendre comment Python interagit avec une base de données
- Écrire des requêtes SQL basiques et efficaces
- Utiliser un ORM (SQLAlchemy)
- Gérer correctement les transactions ⭐

## Contexte
Toutes les applications backend reposent sur une base de données. Une mauvaise gestion des accès DB peut entraîner pertes de données, incohérences ou problèmes de performance.

## Principe de fonctionnement

🧠 Concept clé — Base de données  
Système permettant de stocker et manipuler des données structurées.

🧠 Concept clé — Transaction ⭐  
Un ensemble d’opérations exécutées de manière atomique (tout ou rien).

💡 Astuce — Toujours penser ACID  
Atomicité, Cohérence, Isolation, Durabilité

⚠️ Erreur fréquente — oublier commit  
→ données non sauvegardées

---

## Architecture

| Composant | Rôle | Exemple |
|-----------|------|---------|
| Client Python | exécute requêtes | psycopg2 |
| DB Engine | moteur SQL | PostgreSQL |
| ORM | abstraction SQL | SQLAlchemy |

```mermaid
flowchart LR
  A[Python App] --> B[ORM / Driver]
  B --> C[Base de données]
  C --> B
  B --> A
```

---

## Syntaxe ou utilisation

### Connexion PostgreSQL

```python
import psycopg2

conn = psycopg2.connect(
    dbname="test",
    user="user",
    password="password",
    host="localhost"
)

cursor = conn.cursor()
```

---

### Requête SQL

```python
cursor.execute("SELECT * FROM users")
rows = cursor.fetchall()
```

Résultat : liste de lignes récupérées.

---

### Transaction ⭐

```python
conn.commit()
```

Sans commit → rien n’est persisté.

---

### ORM avec SQLAlchemy ⭐

```python
from sqlalchemy import create_engine

engine = create_engine("postgresql://user:password@localhost/db")
```

---

## Workflow du système

1. L’application ouvre une connexion
2. Exécute une requête
3. Traite les résultats
4. Commit ou rollback

```mermaid
sequenceDiagram
  participant App
  participant DB

  App->>DB: Query
  DB-->>App: Result
  App->>DB: Commit
```

En cas d’erreur :
- rollback nécessaire
- sinon incohérence des données

---

## Cas d'utilisation

### Cas simple
Lire des utilisateurs

### Cas réel
Backend API :

- création utilisateur
- validation
- transaction
- commit

---

## Erreurs fréquentes

⚠️ Oublier commit  
→ données perdues

⚠️ SQL injection  
Cause : concaténation string  
Correction :
```python
cursor.execute("SELECT * FROM users WHERE id=%s", (id,))
```

💡 Astuce : toujours utiliser paramètres SQL

---

## Bonnes pratiques

🔧 Toujours utiliser transactions  
🔧 Paramétrer les requêtes (anti-injection)  
🔧 Fermer connexions proprement  
🔧 Utiliser ORM pour projets complexes  
🔧 Indexer les colonnes critiques  
🔧 Logger les requêtes lentes  

---

## Résumé

| Concept | Définition courte | À retenir |
|--------|------------------|----------|
| SQL | langage DB | fondamental |
| ORM | abstraction | productivité |
| transaction | atomicité | critique |

Étapes clés :
- connexion
- requête
- traitement
- commit

Phrase clé : **Une mauvaise gestion DB = corruption de données.**

---

## SNIPPETS DE RÉVISION

<!-- snippet
id: python_sql_connection
type: concept
tech: python
level: intermediate
importance: high
format: knowledge
tags: python,sql
title: Connexion base Python
content: Python utilise des drivers comme psycopg2 pour interagir avec une base SQL
description: Base interaction DB
-->

<!-- snippet
id: python_transaction_commit
type: concept
tech: python
level: intermediate
importance: high
format: knowledge
tags: python,transaction
title: Commit transaction
content: Sans commit, les modifications en base ne sont pas enregistrées
description: Piège critique
-->

<!-- snippet
id: python_sql_injection_warning
type: warning
tech: python
level: intermediate
importance: high
format: knowledge
tags: python,sql,security
title: SQL injection
content: concaténer des strings SQL → vulnérable → utiliser paramètres
description: faille critique
-->

<!-- snippet
id: python_orm_usage
type: concept
tech: python
level: intermediate
importance: medium
format: knowledge
tags: python,orm
title: ORM Python
content: Un ORM permet de manipuler la base via des objets Python
description: abstraction SQL
-->

