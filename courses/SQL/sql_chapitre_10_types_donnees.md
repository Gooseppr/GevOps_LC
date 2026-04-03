---
chapter: 2
course: SQL
difficulty: intermediate
duration: 75
layout: page
theme: "Conception et structure"
section: 2
status: published
title: "Les types de données"
prev_module: "/courses/SQL/sql_chapitre_09_create_table.html"
prev_module_title: "Création de tables : CREATE TABLE"
next_module: "/courses/SQL/sql_chapitre_11_contraintes.html"
next_module_title: "Les contraintes"
---

# Chapitre 10 — Les types de données

---

## Objectifs pédagogiques

À la fin de ce chapitre vous serez capable de :

- comprendre ce qu’est un **type de données**
- choisir un type de données adapté à l’information stockée
- connaître les principaux types SQL
- comprendre l’impact des types sur les performances et la cohérence des données

Le choix du bon type de données est **essentiel pour concevoir une base fiable et performante**.

---

## 1 — Qu’est‑ce qu’un type de données

Un **type de données** indique à la base de données :

- quel type d’information une colonne peut contenir
- comment stocker cette information
- comment effectuer des opérations dessus

Exemple :

| Colonne | Type | Exemple |
|---|---|---|
| id | INTEGER | 1 |
| name | TEXT | Alice |
| total | NUMERIC | 120.50 |
| created_at | DATE | 2024‑01‑10 |

---

## 2 — Pourquoi les types sont importants

Les types permettent :

- d’éviter les erreurs
- d’améliorer les performances
- d’optimiser le stockage
- de faciliter les calculs

Exemple :

Un prix doit être stocké dans un type **numérique** et non dans un texte.

Mauvais :

```
price = "100"
```

Correct :

```
price = 100
```

---

## 3 — Les types numériques

Les types numériques permettent de stocker des **nombres**.

| Type | Description |
|---|---|
| INTEGER | nombres entiers |
| SMALLINT | petits entiers |
| BIGINT | grands entiers |
| NUMERIC | nombres précis |
| REAL / FLOAT | nombres à virgule flottante |

Exemple :

```sql
CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    price NUMERIC
);
```

---

## 4 — Types texte

Les types texte permettent de stocker du **texte**.

| Type | Description |
|---|---|
| TEXT | texte libre |
| VARCHAR(n) | texte avec longueur maximale |
| CHAR(n) | texte de longueur fixe |

Exemple :

```sql
CREATE TABLE customers (
    name TEXT,
    email VARCHAR(255)
);
```

---

## 5 — Types booléens

Un **booléen** représente une valeur logique.

| Valeur | Signification |
|---|---|
| TRUE | vrai |
| FALSE | faux |

Exemple :

```sql
CREATE TABLE users (
    id INTEGER,
    active BOOLEAN
);
```

---

## 6 — Types date et temps

Les bases de données proposent plusieurs types pour gérer le temps.

| Type | Description |
|---|---|
| DATE | date |
| TIME | heure |
| TIMESTAMP | date + heure |
| INTERVAL | durée |

Exemple :

```sql
CREATE TABLE orders (
    created_at TIMESTAMP
);
```

---

## 7 — Types JSON

Les bases modernes comme PostgreSQL permettent de stocker du **JSON**.

Exemple :

```sql
CREATE TABLE events (
    id INTEGER,
    payload JSON
);
```

Cela permet de stocker des structures de données flexibles.

---

## 8 — Choisir le bon type

Principes simples :

| Situation | Type recommandé |
|---|---|
| identifiant | INTEGER |
| texte libre | TEXT |
| email | VARCHAR |
| prix | NUMERIC |
| date | DATE |
| date + heure | TIMESTAMP |

---

## 9 — Bonnes pratiques

Toujours :

- choisir le type le plus précis possible
- éviter d’utiliser TEXT pour tout
- utiliser NUMERIC pour les valeurs financières
- utiliser TIMESTAMP pour les événements

---

## 10 — Pièges fréquents

Erreurs classiques :

- stocker des nombres en texte
- stocker des dates en texte
- utiliser FLOAT pour de l’argent
- ne pas limiter la taille des VARCHAR

---

## Conclusion

Les types de données permettent de définir **la nature des informations stockées**.

Les principaux types sont :

- numériques
- texte
- booléens
- dates et heures
- JSON

Dans le prochain chapitre nous verrons **les contraintes**, qui permettent de garantir l’intégrité des données.

<!-- snippet
id: sql_float_argent_interdit
type: warning
tech: sql
level: intermediate
importance: high
format: knowledge
tags: sql,types,numeric,float,argent
title: Ne jamais stocker de l’argent en FLOAT
content: |
  FLOAT introduit des erreurs d’arrondi dues à la représentation binaire.
  `0.1 + 0.2 = 0.30000000000000004` en virgule flottante.
  Utiliser `NUMERIC` (ou `DECIMAL`) pour tous les montants financiers.
description: Cause de bugs comptables impossibles à déboguer en production.
-->

<!-- snippet
id: sql_types_recommandes
type: concept
tech: sql
level: intermediate
importance: medium
format: knowledge
tags: sql,types,integer,text,varchar
title: Choisir le bon type SQL : texte et identifiants
content: |
  - identifiant → `INTEGER`
  - texte libre → `TEXT`
  - email/code → `VARCHAR(n)`
description: Stocker un nombre en TEXT empêche les calculs et trie par ordre alphabétique, pas numérique.
-->

<!-- snippet
id: sql_types_recommandes_nombres_dates
type: concept
tech: sql
level: intermediate
importance: medium
format: knowledge
tags: sql,types,numeric,date,timestamp
title: Choisir le bon type SQL : nombres et dates
content: |
  - montant → `NUMERIC`
  - date seule → `DATE`
  - date + heure → `TIMESTAMP`
description: Utiliser NUMERIC pour les calculs financiers exacts, TIMESTAMP pour les événements horodatés.
-->
