---
chapter: 2
course: SQL
difficulty: intermediate
duration: 75
layout: page
chapter_title: "Conception et structure"
section: 3
status: published
title: "Les contraintes"
prev_module: "/courses/SQL/sql_chapitre_10_types_donnees.html"
prev_module_title: "Les types de données"
next_module: "/courses/SQL/sql_chapitre_12_relations_normalisation.html"
next_module_title: "Relations entre tables et normalisation"
---

# Chapitre 11 — Les contraintes

---

## Objectifs pédagogiques

À la fin de ce chapitre vous serez capable de :

- comprendre ce qu’est une **contrainte**
- garantir l’intégrité des données dans une table
- utiliser les principales contraintes SQL
- empêcher les erreurs et les incohérences dans la base de données

Les contraintes sont un mécanisme essentiel pour **protéger la qualité des données**.

---

## 1 — Qu’est-ce qu’une contrainte

Une **contrainte** est une règle appliquée à une colonne ou à une table.

Elle permet d’empêcher l’insertion de données incorrectes.

Exemple :

- empêcher les valeurs NULL
- empêcher les doublons
- garantir l’unicité d’un identifiant
- vérifier qu’une valeur respecte une condition

Les contraintes sont définies **lors de la création d’une table** ou **ajoutées plus tard**.

---

## 2 — NOT NULL

La contrainte **NOT NULL** empêche une colonne de contenir une valeur NULL.

Exemple :

```sql
CREATE TABLE customers (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT
);
```

Ici :

- `name` doit obligatoirement contenir une valeur
- `email` peut être NULL

---

## 3 — UNIQUE

La contrainte **UNIQUE** empêche les doublons.

Exemple :

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email TEXT UNIQUE
);
```

Dans cette table :

- deux utilisateurs ne peuvent pas avoir le même email

---

## 4 — PRIMARY KEY

La **clé primaire** est une contrainte spéciale.

Elle garantit :

- unicité
- absence de NULL
- identification unique d’une ligne

Exemple :

```sql
CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    name TEXT,
    price NUMERIC
);
```

Chaque produit possède un identifiant unique.

---

## 5 — FOREIGN KEY

Une **clé étrangère** permet de créer une relation entre deux tables.

Exemple :

```sql
CREATE TABLE orders (
    id INTEGER PRIMARY KEY,
    customer_id INTEGER,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);
```

Cela signifie :

- `customer_id` doit correspondre à un client existant

---

## 6 — CHECK

La contrainte **CHECK** permet d’imposer une condition.

Exemple :

```sql
CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    price NUMERIC CHECK (price > 0)
);
```

Ici :

- le prix doit être **supérieur à 0**

---

## 7 — DEFAULT

La contrainte **DEFAULT** définit une valeur par défaut.

Exemple :

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    active BOOLEAN DEFAULT TRUE
);
```

Si aucune valeur n’est fournie :

- `active` sera automatiquement **TRUE**

---

## 8 — Exemple complet

```sql
CREATE TABLE customers (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Contraintes appliquées :

| Colonne | Contraintes |
|---|---|
| id | PRIMARY KEY |
| name | NOT NULL |
| email | UNIQUE |
| created_at | DEFAULT |

---

## 9 — Bonnes pratiques

Toujours :

- définir une **clé primaire**
- utiliser **NOT NULL** pour les colonnes importantes
- utiliser **UNIQUE** pour les identifiants métiers
- utiliser **CHECK** pour valider les valeurs

Les contraintes doivent être **gérées par la base de données**, pas uniquement par l’application.

---

## 10 — Pièges fréquents

Erreurs classiques :

- ne pas utiliser de contraintes
- vérifier les règles uniquement dans l’application
- oublier les clés étrangères
- permettre trop de valeurs NULL

---

## Conclusion

Les contraintes permettent de garantir **l’intégrité des données**.

Les principales contraintes sont :

- PRIMARY KEY
- FOREIGN KEY
- NOT NULL
- UNIQUE
- CHECK
- DEFAULT

Dans le prochain chapitre nous verrons **les relations entre tables et la normalisation**, qui permettent de structurer correctement une base de données.

<!-- snippet
id: sql_contraintes_principales
type: concept
tech: sql
level: intermediate
importance: high
format: knowledge
tags: sql,contraintes,primary_key,unique,foreign_key
title: Contraintes SQL : clés et unicité
content: |
  - `PRIMARY KEY` : unicité + non NULL sur l'identifiant
  - `UNIQUE` : pas de doublon sur la colonne
  - `FOREIGN KEY` : intégrité référentielle entre tables
description: Les contraintes sont garanties par la base, pas seulement par l'application.
-->

<!-- snippet
id: sql_contraintes_valeurs
type: concept
tech: sql
level: intermediate
importance: high
format: knowledge
tags: sql,contraintes,not_null,check,default
title: Contraintes SQL : valeurs et défauts
content: |
  - `NOT NULL` : valeur obligatoire
  - `CHECK` : condition à respecter (`price > 0`)
  - `DEFAULT` : valeur automatique si absente
description: Ces contraintes contrôlent le contenu des colonnes, garanties par le moteur SQL.
-->

<!-- snippet
id: sql_contraintes_bdd_vs_app
type: concept
tech: sql
level: intermediate
importance: high
format: knowledge
tags: sql,contraintes,integrite,bonne_pratique
title: Mettre les règles métier dans la base, pas seulement l'app
content: Une application peut être contournée (API, import CSV, psql direct). Les contraintes SQL s'appliquent à toutes les sources d'écriture sans exception.
description: Seule la base garantit l'intégrité des données quelle que soit l'origine de la modification.
-->
