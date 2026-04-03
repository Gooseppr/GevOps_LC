---
chapter: 1
course: SQL
difficulty: beginner
duration: 60
layout: page
chapter_title: "Requêtes et manipulation"
section: 8
status: published
title: "INSERT, UPDATE et DELETE"
prev_module: "/courses/SQL/sql_chapitre_07_join.html"
prev_module_title: "Les JOIN"
next_module: "/courses/SQL/sql_chapitre_09_create_table.html"
next_module_title: "Création de tables : CREATE TABLE"
---

# Chapitre 8 — Manipulation des données : INSERT, UPDATE et DELETE

---

## Objectifs pédagogiques

À la fin de ce chapitre vous serez capable de :

- ajouter des données dans une table avec **INSERT**
- modifier des données existantes avec **UPDATE**
- supprimer des données avec **DELETE**
- comprendre les risques liés aux modifications de données
- appliquer de bonnes pratiques pour éviter les erreurs

Contrairement aux chapitres précédents, ces commandes **modifient réellement les données de la base**.

---

## 1 — Les types de commandes SQL

Jusqu'à présent nous avons utilisé des commandes qui **lisent les données**.

| Type | Exemple |
|---|---|
| Lecture | SELECT |
| Manipulation | INSERT, UPDATE, DELETE |

Les commandes de manipulation sont appelées **DML** (Data Manipulation Language).

Elles permettent de :

- ajouter des données
- modifier des données
- supprimer des données

---

## 2 — INSERT : ajouter des données

La commande **INSERT** permet d'ajouter une ligne dans une table.

Structure :

```sql
INSERT INTO table (colonnes)
VALUES (valeurs);
```

---

### Exemple

Table `customers` :

| id | name | email |
|---|---|---|
| 1 | Alice | alice@email.com |

Ajout d'un client :

```sql
INSERT INTO customers (id, name, email)
VALUES (2, 'Bob', 'bob@email.com');
```

Nouvelle table :

| id | name | email |
|---|---|---|
| 1 | Alice | alice@email.com |
| 2 | Bob | bob@email.com |

---

## 3 — INSERT avec plusieurs lignes

On peut insérer plusieurs lignes.

```sql
INSERT INTO customers (id, name, email)
VALUES
(3, 'Clara', 'clara@email.com'),
(4, 'David', 'david@email.com');
```

---

## 4 — UPDATE : modifier des données

La commande **UPDATE** permet de modifier des lignes existantes.

Structure :

```sql
UPDATE table
SET colonne = valeur
WHERE condition;
```

---

### Exemple

Modifier l'email d'un client :

```sql
UPDATE customers
SET email = 'alice_new@email.com'
WHERE id = 1;
```

---

### Attention

Sans **WHERE**, toutes les lignes seront modifiées.

Exemple dangereux :

```sql
UPDATE customers
SET email = 'test@email.com';
```

Cela modifie **tous les clients**.

---

## 5 — DELETE : supprimer des données

La commande **DELETE** permet de supprimer des lignes.

Structure :

```sql
DELETE FROM table
WHERE condition;
```

---

### Exemple

Supprimer un client :

```sql
DELETE FROM customers
WHERE id = 2;
```

---

### Danger

Sans **WHERE**, toutes les lignes sont supprimées.

```sql
DELETE FROM customers;
```

La table devient vide.

---

## 6 — Vérifier avant de modifier

Bonne pratique importante :

Avant un UPDATE ou DELETE, tester avec SELECT.

Exemple :

```sql
SELECT *
FROM customers
WHERE id = 2;
```

Puis :

```sql
DELETE FROM customers
WHERE id = 2;
```

---

## 7 — Ordre logique d'exécution

Lors d'un UPDATE ou DELETE :

```mermaid
flowchart LR
TABLE --> WHERE
WHERE --> MODIFICATION
MODIFICATION --> RESULT
```

La base :

1. sélectionne les lignes avec WHERE
2. applique la modification

---

## 8 — Compatibilité SQL

Les commandes suivantes sont standard dans tous les moteurs SQL.

| Commande | PostgreSQL | MySQL | SQLite |
|---|---|---|---|
| INSERT | oui | oui | oui |
| UPDATE | oui | oui | oui |
| DELETE | oui | oui | oui |

---

## 9 — Bonnes pratiques

Toujours :

- utiliser **WHERE**
- tester avec **SELECT**
- sauvegarder les données importantes
- modifier un petit nombre de lignes à la fois

---

## 10 — Pièges fréquents

Erreurs classiques :

- oublier WHERE
- modifier trop de lignes
- supprimer des données importantes
- ne pas vérifier les résultats

---

## Conclusion

Les commandes de manipulation permettent de modifier les données :

- **INSERT** ajoute des lignes
- **UPDATE** modifie des lignes
- **DELETE** supprime des lignes

Ces commandes doivent être utilisées **avec prudence**.

Dans la suite de la formation nous passerons au **niveau intermédiaire**, où nous verrons comment **concevoir et structurer une base de données**.

<!-- snippet
id: sql_update_delete_sans_where
tech: sql
level: beginner
importance: high
format: knowledge
tags: sql,update,delete,where,danger
title: UPDATE ou DELETE sans WHERE modifie toutes les lignes
content: |
  `UPDATE customers SET email = 'test@test.com';` → modifie TOUS les clients
  `DELETE FROM customers;` → vide TOUTE la table
  Toujours ajouter une clause WHERE ciblée avant d'exécuter.
description: Erreur irréversible si aucune transaction n'est ouverte. Tester d'abord avec un SELECT.
-->

<!-- snippet
id: sql_tester_select_avant_update
tech: sql
level: beginner
importance: high
format: knowledge
tags: sql,update,delete,select,bonne_pratique
title: Tester avec SELECT avant un UPDATE ou DELETE
content: |
  1. Écrire et exécuter le SELECT avec le même WHERE
  2. Vérifier les lignes retournées
  3. Remplacer SELECT par UPDATE ou DELETE
description: Réflexe indispensable pour éviter de modifier les mauvaises lignes.
-->
