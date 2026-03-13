---
chapter: 2
course: SQL
difficulty: intermediate
duration: 75
layout: page
section: 2
status: published
title: "Les types de données"
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

---
[← Module précédent](sql_chapitre_09_create_table.md) | [Module suivant →](sql_chapitre_11_contraintes.md)
---
