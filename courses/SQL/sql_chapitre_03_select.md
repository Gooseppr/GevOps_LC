---
chapter: 1
course: SQL
difficulty: beginner
duration: 60
layout: page
chapter_title: "Requêtes et manipulation"
section: 3
status: published
title: "SELECT : lire les données"
prev_module: "/courses/SQL/sql_chapitre_02_modele_relationnel.html"
prev_module_title: "Le modèle relationnel"
next_module: "/courses/SQL/sql_chapitre_04_where.html"
next_module_title: "Filtrer les données avec WHERE"
---

# Chapitre 3 — SELECT : lire les données

---

## Objectifs pédagogiques

À la fin de ce chapitre vous serez capable de :

- comprendre la structure d'une requête SQL
- utiliser la commande **SELECT**
- lire des données dans une table
- sélectionner certaines colonnes
- comprendre comment SQL exécute une requête simple

Ce chapitre introduit la **première commande SQL réellement utilisée dans la pratique**.

---

## 1 — Le rôle de SELECT

La commande **SELECT** permet de **lire des données dans une base de données**.

Contrairement à d'autres commandes SQL, SELECT **ne modifie rien** dans la base.  
Elle sert uniquement à **récupérer des informations**.

Dans la pratique, c'est la commande la plus utilisée en SQL.

---

## 2 — Structure d'une requête SQL

Une requête SQL possède généralement cette structure :

```sql
SELECT colonnes
FROM table;
```

Explication :

| Partie | Rôle |
|------|------|
| SELECT | indique quelles colonnes récupérer |
| FROM | indique dans quelle table chercher |
| ; | fin de la requête (optionnel selon les outils) |

---

## 3 — Exemple simple

Table `customers` :

| id | name | email |
|---|---|---|
| 1 | Alice | alice@email.com |
| 2 | Bob | bob@email.com |

Requête SQL :

```sql
SELECT name
FROM customers;
```

Résultat :

| name |
|---|
| Alice |
| Bob |

SQL lit la colonne **name** dans la table **customers**.

---

## 4 — Sélectionner plusieurs colonnes

On peut récupérer plusieurs colonnes.

```sql
SELECT id, name, email
FROM customers;
```

Résultat :

| id | name | email |
|---|---|---|
| 1 | Alice | alice@email.com |
| 2 | Bob | bob@email.com |

Les colonnes sont séparées par une **virgule**.

---

## 5 — Lire toutes les colonnes

On peut utiliser `*` pour récupérer **toutes les colonnes**.

```sql
SELECT *
FROM customers;
```

Résultat : toutes les colonnes de la table.

---

### Bonne pratique

Dans les projets professionnels on évite souvent `SELECT *`.

Pourquoi :

- moins performant
- rend les requêtes moins lisibles
- peut casser des applications si la structure change

On préfère écrire :

```sql
SELECT id, name, email
FROM customers;
```

---

## 6 — Comment SQL exécute une requête

Quand SQL exécute une requête simple, il suit cet ordre logique :

```mermaid
flowchart LR
FROM --> SELECT
SELECT --> RESULT
```

Étapes :

1. SQL lit la table indiquée dans **FROM**
2. SQL récupère les colonnes indiquées dans **SELECT**
3. SQL retourne le résultat

---

## 7 — Alias de colonnes

Il est possible de **renommer une colonne dans le résultat**.

```sql
SELECT name AS customer_name
FROM customers;
```

Résultat :

| customer_name |
|---|
| Alice |
| Bob |

Les alias permettent :

- rendre les résultats plus lisibles
- préparer des exports
- simplifier les rapports

---

## 8 — Alias de tables

On peut aussi renommer une table temporairement.

```sql
SELECT c.name
FROM customers AS c;
```

Ici :

- `customers` est la table
- `c` est l'alias

Les alias deviennent **très utiles dans les JOIN**.

---

## 9 — Pattern courant : lire une table

Dans la pratique, on commence souvent par inspecter une table.

```sql
SELECT *
FROM customers;
```

Cela permet de :

- comprendre la structure
- voir les données
- préparer les prochaines requêtes

---

## 10 — Dans la pratique (métiers)

| Métier | Utilisation |
|---|---|
| Data analyst | explorer les données |
| Backend developer | récupérer les données pour une API |
| DevOps | analyser les logs |
| Data engineer | vérifier les pipelines |
| DBA | diagnostiquer les problèmes |

---

## 11 — Bonnes pratiques

Toujours :

- écrire les mots-clés SQL en **MAJUSCULES**
- utiliser des noms de colonnes explicites
- limiter l'utilisation de `SELECT *`
- formater les requêtes pour les rendre lisibles

Exemple lisible :

```sql
SELECT id,
       name,
       email
FROM customers;
```

---

## 12 — Pièges fréquents

Erreurs courantes :

- oublier le `FROM`
- oublier une virgule entre les colonnes
- utiliser `SELECT *` dans du code applicatif
- écrire des requêtes illisibles

---

## Conclusion

La commande **SELECT** permet de lire les données.

Les éléments fondamentaux sont :

- SELECT
- FROM
- les colonnes
- les alias

Dans le prochain chapitre nous verrrons **le filtrage des données avec WHERE**, qui permet de récupérer seulement certaines lignes.

<!-- snippet
id: sql_select_colonnes
type: command
tech: sql
level: beginner
importance: high
format: knowledge
tags: sql,select,from,requete
title: Lire des colonnes spécifiques d'une table
command: SELECT <col1>, <col2> FROM <table>;
example: SELECT nom, email FROM utilisateurs;
description: Récupère uniquement les colonnes listées. Préférer cette forme à SELECT * pour plus de clarté et de performance.
-->

<!-- snippet
id: sql_select_star_warning
type: warning
tech: sql
level: beginner
importance: medium
format: knowledge
tags: sql,select,performance,bonne_pratique
title: Éviter SELECT * dans le code applicatif
content: |
  `SELECT *` ramène toutes les colonnes, même inutiles.
  - ralentit les requêtes sur grandes tables
  - peut casser l'application si la structure change
  Préférer : `SELECT id, name, email FROM customers;`
description: Réservé à l'exploration rapide, jamais dans du code de production.
-->

<!-- snippet
id: sql_alias_colonne
type: concept
tech: sql
level: beginner
importance: medium
format: knowledge
tags: sql,alias,select,lisibilite
title: Renommer une colonne dans le résultat avec AS
content: `SELECT name AS customer_name FROM customers;` — le mot-clé AS renomme la colonne uniquement dans le résultat, sans modifier la table.
description: Utile pour les exports, rapports ou pour clarifier des noms de colonnes calculées.
-->
