---
chapter: 1
course: SQL
difficulty: beginner
duration: 60
layout: page
chapter_title: "Requêtes et manipulation"
section: 6
status: published
title: "Fonctions d'agrégation et GROUP BY"
prev_module: "/courses/SQL/sql_chapitre_05_order_by_limit.html"
prev_module_title: "Trier et limiter les résultats"
next_module: "/courses/SQL/sql_chapitre_07_join.html"
next_module_title: "Les JOIN"
---

# Chapitre 6 — Fonctions d’agrégation et GROUP BY

---

## Objectifs pédagogiques

À la fin de ce chapitre vous serez capable de :

- utiliser les **fonctions d’agrégation**
- comprendre comment résumer des données
- utiliser **GROUP BY**
- comprendre la différence entre **WHERE** et **HAVING**
- construire des requêtes d’analyse simples

Les fonctions d’agrégation sont essentielles pour **analyser des données**.

---

## 1 — Pourquoi utiliser des agrégations

Dans de nombreux cas on ne veut pas récupérer toutes les lignes mais **résumer les données**.

Exemples :

- nombre de commandes
- chiffre d'affaires total
- moyenne des ventes
- produit le plus vendu

SQL propose des **fonctions d’agrégation** pour cela.

---

## 2 — Les fonctions d’agrégation principales

| Fonction | Description |
|---|---|
| COUNT | compte le nombre de lignes |
| SUM | additionne les valeurs |
| AVG | calcule la moyenne |
| MIN | valeur minimale |
| MAX | valeur maximale |

---

## 3 — COUNT

Permet de compter des lignes.

```sql
SELECT COUNT(*)
FROM orders;
```

Résultat : nombre total de commandes.

---

### COUNT avec colonne

```sql
SELECT COUNT(customer_id)
FROM orders;
```

Compte uniquement les lignes où **customer_id n'est pas NULL**.

---

## 4 — SUM

Additionne des valeurs.

```sql
SELECT SUM(total)
FROM orders;
```

Résultat : chiffre d'affaires total.

---

## 5 — AVG

Calcule la moyenne.

```sql
SELECT AVG(total)
FROM orders;
```

Résultat : montant moyen d'une commande.

---

## 6 — MIN et MAX

Permettent de trouver les valeurs extrêmes.

```sql
SELECT MIN(total), MAX(total)
FROM orders;
```

Résultat :

- plus petite commande
- plus grande commande

---

## 7 — GROUP BY

GROUP BY permet de **regrouper les lignes par catégorie**.

Exemple : nombre de commandes par client.

```sql
SELECT customer_id, COUNT(*)
FROM orders
GROUP BY customer_id;
```

Résultat :

| customer_id | count |
|---|---|
| 1 | 2 |
| 2 | 1 |

SQL regroupe toutes les lignes ayant le même **customer_id**.

---

## 8 — Exemple concret

Chiffre d'affaires par client.

```sql
SELECT customer_id, SUM(total)
FROM orders
GROUP BY customer_id;
```

Résultat :

| customer_id | sum |
|---|---|
| 1 | 130 |
| 2 | 120 |

---

## 9 — GROUP BY avec ORDER BY

On peut combiner plusieurs clauses.

```sql
SELECT customer_id, SUM(total) AS revenue
FROM orders
GROUP BY customer_id
ORDER BY revenue DESC;
```

Très utilisé pour :

- les classements
- les dashboards
- les analyses

---

## 10 — HAVING

HAVING permet de **filtrer les groupes**.

Contrairement à WHERE, il agit **après GROUP BY**.

Exemple : clients ayant dépensé plus de 100.

```sql
SELECT customer_id, SUM(total) AS revenue
FROM orders
GROUP BY customer_id
HAVING SUM(total) > 100;
```

---

## 11 — WHERE vs HAVING

| Clause | Moment d'exécution |
|---|---|
| WHERE | avant l'agrégation |
| HAVING | après l'agrégation |

Exemple :

```sql
SELECT customer_id, SUM(total)
FROM orders
WHERE total > 20
GROUP BY customer_id
HAVING SUM(total) > 100;
```

---

## 12 — Ordre logique d'exécution

```mermaid
flowchart LR
FROM --> WHERE
WHERE --> GROUP_BY
GROUP_BY --> HAVING
HAVING --> SELECT
SELECT --> ORDER_BY
ORDER_BY --> RESULT
```

---

## 13 — Pattern courant : top clients

```sql
SELECT customer_id, SUM(total) AS revenue
FROM orders
GROUP BY customer_id
ORDER BY revenue DESC
LIMIT 10;
```

Très utilisé en **analyse de données**.

---

## 14 — Bonnes pratiques

- toujours comprendre les regroupements
- utiliser des alias pour les agrégations
- vérifier les résultats avec de petits jeux de données

---

## 15 — Pièges fréquents

Erreurs classiques :

- oublier GROUP BY
- mélanger colonnes agrégées et non agrégées
- utiliser HAVING à la place de WHERE

---

## Conclusion

Les agrégations permettent de **résumer les données**.

Concepts clés :

- COUNT
- SUM
- AVG
- MIN
- MAX
- GROUP BY
- HAVING

Dans le prochain chapitre nous verrons **les JOIN**, qui permettent de combiner plusieurs tables.

<!-- snippet
id: sql_where_vs_having
tech: sql
level: beginner
importance: high
format: knowledge
tags: sql,where,having,group_by,aggregation
title: WHERE filtre les lignes, HAVING filtre les groupes
content: |
  - `WHERE` s'applique **avant** GROUP BY → filtre les lignes brutes
  - `HAVING` s'applique **après** GROUP BY → filtre les résultats agrégés
description: Utiliser HAVING à la place de WHERE sur une colonne non agrégée est une erreur fréquente.
-->

<!-- snippet
id: sql_group_by_colonne_non_agregee
tech: sql
level: beginner
importance: high
format: knowledge
tags: sql,group_by,select,aggregation,erreur
title: Toute colonne SELECT non agrégée doit être dans GROUP BY
content: |
  Erreur : `SELECT customer_id, name, COUNT(*) FROM orders GROUP BY customer_id`
  `name` n'est ni agrégé ni dans GROUP BY → erreur SQL.
  Correct : inclure `name` dans GROUP BY ou supprimer la colonne.
description: La base ne sait pas quelle valeur de `name` retourner par groupe sans instruction explicite.
-->
