---
chapter: 2
course: SQL
difficulty: intermediate
duration: 75
layout: page
chapter_title: "Conception et structure"
section: 6
status: published
title: "Les vues"
prev_module: "/courses/SQL/sql_chapitre_13_index.html"
prev_module_title: "Les index"
next_module: "/courses/SQL/sql_chapitre_15_sous_requetes.html"
next_module_title: "Les sous-requêtes"
---

# Chapitre 14 — Les vues

---

## Objectifs pédagogiques

À la fin de ce chapitre vous serez capable de :

- comprendre ce qu’est une **vue**
- utiliser `CREATE VIEW`
- simplifier des requêtes complexes
- réutiliser des requêtes SQL comme des tables
- comprendre les **vues matérialisées**

Les vues permettent de **simplifier l'accès aux données** et de structurer les requêtes.

---

## 1 — Qu’est-ce qu’une vue

Une **vue (VIEW)** est une requête SQL enregistrée dans la base de données.

Elle se comporte comme une **table virtuelle**.

Une vue **ne stocke pas les données**.
Elle stocke seulement **la requête**.

---

## 2 — Pourquoi utiliser une vue

Les vues servent à :

- simplifier des requêtes complexes
- masquer la complexité des JOIN
- réutiliser une requête souvent utilisée
- limiter l’accès à certaines colonnes

---

## 3 — Exemple simple

Supposons deux tables :

- `customers`
- `orders`

On veut voir les commandes avec le nom du client.

Requête classique :

```sql
SELECT
    orders.id,
    customers.name,
    orders.total
FROM orders
JOIN customers
ON orders.customer_id = customers.id;
```

Cette requête peut être transformée en vue.

---

## 4 — Créer une vue

```sql
CREATE VIEW orders_with_customer AS
SELECT
    orders.id,
    customers.name,
    orders.total
FROM orders
JOIN customers
ON orders.customer_id = customers.id;
```

---

## 5 — Utiliser une vue

Une vue s’utilise comme une table.

```sql
SELECT *
FROM orders_with_customer;
```

On peut également filtrer :

```sql
SELECT *
FROM orders_with_customer
WHERE total > 100;
```

---

## 6 — Architecture simplifiée

```mermaid
flowchart LR
Application --> View
View --> Tables
Tables --> Database
```

La vue agit comme une **couche intermédiaire**.

---

## 7 — Modifier une vue

Pour modifier une vue :

```sql
CREATE OR REPLACE VIEW orders_with_customer AS
SELECT
    orders.id,
    customers.name,
    orders.total,
    orders.created_at
FROM orders
JOIN customers
ON orders.customer_id = customers.id;
```

---

## 8 — Supprimer une vue

```sql
DROP VIEW orders_with_customer;
```

---

## 9 — Vues matérialisées (PostgreSQL)

PostgreSQL propose un type spécial de vue :

**Materialized View**.

Contrairement aux vues classiques :

- les données sont **stockées**
- les requêtes sont **plus rapides**

Création :

```sql
CREATE MATERIALIZED VIEW sales_summary AS
SELECT
    customer_id,
    SUM(total) AS total_sales
FROM orders
GROUP BY customer_id;
```

Actualisation :

```sql
REFRESH MATERIALIZED VIEW sales_summary;
```

---

## 10 — Bonnes pratiques

Utiliser les vues pour :

- simplifier les requêtes complexes
- centraliser la logique métier
- sécuriser certaines données
- préparer des datasets pour l’analyse

---

## 11 — Pièges fréquents

Erreurs courantes :

- créer trop de vues inutiles
- empiler plusieurs vues complexes
- oublier que les vues exécutent une requête à chaque appel
- ne pas rafraîchir les vues matérialisées

---

## Conclusion

Les vues permettent de :

- simplifier l’accès aux données
- réutiliser des requêtes
- structurer les couches d’accès aux données

Dans le prochain chapitre nous verrons **les sous‑requêtes**, qui permettent d’imbriquer des requêtes SQL.

<!-- snippet
id: sql_create_view
type: command
tech: sql
level: intermediate
importance: high
format: knowledge
tags: sql,view,create_view,requete
title: Créer une vue SQL réutilisable
command: CREATE OR REPLACE VIEW <nom_vue> AS SELECT ... FROM ... JOIN ...;
example: CREATE OR REPLACE VIEW ventes_mensuelles AS SELECT mois, SUM(montant) AS total FROM commandes GROUP BY mois;
description: Enregistre une requête comme table virtuelle. Utiliser CREATE OR REPLACE pour mettre à jour sans supprimer au préalable.
-->

<!-- snippet
id: sql_vue_vs_vue_materialisee
type: concept
tech: sql
level: intermediate
importance: medium
format: knowledge
tags: sql,view,materialized_view,performance,postgresql
title: Vue classique vs vue matérialisée (PostgreSQL)
content: |
  - **Vue classique** : exécute la requête à chaque appel, données toujours fraîches
  - **Vue matérialisée** : stocke les résultats, plus rapide mais nécessite `REFRESH MATERIALIZED VIEW`
description: Utiliser les vues matérialisées pour les agrégations coûteuses qui n’ont pas besoin d’être temps réel.
-->
