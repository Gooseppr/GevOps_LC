---
chapter: 2
course: SQL
difficulty: intermediate
duration: 75
layout: page
theme: "Conception et structure"
section: 1
status: published
title: "Création de tables : CREATE TABLE"
---

# Chapitre 9 — Création de tables : CREATE TABLE

---

## Objectifs pédagogiques

À la fin de ce chapitre vous serez capable de :

- créer une table dans une base de données
- définir des colonnes
- choisir des types de données adaptés
- définir une clé primaire
- comprendre la structure d’une table SQL

Nous entrons maintenant dans le **niveau intermédiaire**, où l’objectif est de **concevoir la structure d’une base de données**.

---

## 1 — Pourquoi créer des tables

Dans une base de données relationnelle, les données sont organisées dans des **tables**.

Chaque table représente un **type d’information**.

Exemple dans une application e‑commerce :

| Table | Contenu |
|---|---|
| customers | clients |
| products | produits |
| orders | commandes |
| order_items | lignes de commandes |

Avant de stocker les données, il faut **définir la structure des tables**.

---

## 2 — La commande CREATE TABLE

La commande utilisée pour créer une table est :

```sql
CREATE TABLE nom_table (
    colonne type
);
```

Structure :

| Élément | Rôle |
|---|---|
| CREATE TABLE | commande de création |
| nom_table | nom de la table |
| colonne | nom de la colonne |
| type | type de données |

---

## 3 — Exemple simple

Création d’une table `customers`.

```sql
CREATE TABLE customers (
    id INTEGER,
    name TEXT,
    email TEXT
);
```

La table contient :

| Colonne | Type |
|---|---|
| id | INTEGER |
| name | TEXT |
| email | TEXT |

---

## 4 — Ajouter une clé primaire

Une table doit généralement posséder une **clé primaire**.

```sql
CREATE TABLE customers (
    id INTEGER PRIMARY KEY,
    name TEXT,
    email TEXT
);
```

La clé primaire permet :

- d’identifier chaque ligne
- d’éviter les doublons
- de créer des relations entre tables

---

## 5 — Exemple complet

Création de la table `orders`.

```sql
CREATE TABLE orders (
    id INTEGER PRIMARY KEY,
    customer_id INTEGER,
    total NUMERIC,
    created_at DATE
);
```

Structure :

| Colonne | Description |
|---|---|
| id | identifiant de la commande |
| customer_id | client ayant passé la commande |
| total | montant total |
| created_at | date de la commande |

---

## 6 — Compatibilité SQL

La commande `CREATE TABLE` est standard.

| Base de données | Support |
|---|---|
| PostgreSQL | oui |
| MySQL | oui |
| SQLite | oui |
| SQL Server | oui |

Cependant certains **types de données** peuvent varier.

---

## 7 — Bonnes pratiques de nommage

Il est recommandé de :

- utiliser **snake_case**
- utiliser des noms clairs
- utiliser des noms pluriels pour les tables

Exemple :

| Bon | Mauvais |
|---|---|
| customers | customerTable |
| order_items | items |
| created_at | date1 |

---

## 8 — Organisation logique d'une table

Quand on conçoit une table, on définit généralement :

```mermaid
flowchart LR
ID --> Informations
Informations --> Dates
Dates --> Métadonnées
```

Ordre fréquent :

1. identifiant
2. informations principales
3. dates
4. métadonnées

---

## 9 — Vérifier la structure d'une table

Dans PostgreSQL on peut afficher la structure d’une table avec :

```sql
\d customers
```

Dans d'autres moteurs SQL on utilise souvent :

```sql
DESCRIBE customers;
```

---

## 10 — Pièges fréquents

Erreurs courantes :

- oublier la clé primaire
- choisir un mauvais type de données
- utiliser des noms de colonnes peu clairs
- mélanger plusieurs types d’informations dans une colonne

---

## Conclusion

La commande **CREATE TABLE** permet de définir la structure des données.

Les éléments importants sont :

- le nom de la table
- les colonnes
- les types de données
- la clé primaire

Dans le prochain chapitre nous verrons **les types de données SQL**, qui permettent de stocker correctement les informations.

---
[← Module précédent](sql_chapitre_08_insert_update_delete.md) | [Module suivant →](sql_chapitre_10_types_donnees.md)
---
