---
chapter: 2
course: SQL
difficulty: intermediate
duration: 75
layout: page
section: 5
status: published
title: "Les index"
---

# Chapitre 13 — Les index

---

## Objectifs pédagogiques

À la fin de ce chapitre vous serez capable de :

- comprendre pourquoi les **index** existent
- comprendre comment ils améliorent les performances des requêtes
- créer un index avec **CREATE INDEX**
- comprendre les index simples et composites
- connaître les bonnes pratiques d’indexation

Les index sont un élément clé pour **optimiser les performances d’une base de données**.

---

## 1 — Pourquoi les index existent

Lorsqu’une table contient peu de données, une base de données peut facilement trouver les informations.

Mais lorsque la table contient **des millions de lignes**, rechercher une information peut devenir très lent.

Sans index, la base de données doit lire **toutes les lignes**.

Cela s’appelle un **full table scan**.

---

## 2 — Analogie avec un livre

Un index fonctionne comme **l’index d’un livre**.

Sans index :

- on doit lire toutes les pages pour trouver une information.

Avec index :

- on peut directement aller à la bonne page.

---

## 3 — Fonctionnement d’un index

Un index est une **structure de données supplémentaire** qui permet de retrouver rapidement des lignes.

```mermaid
flowchart LR
Table --> Index
Index --> Result
```

La base consulte d’abord l’index, puis récupère les lignes correspondantes.

---

## 4 — Créer un index

La commande pour créer un index est :

```sql
CREATE INDEX index_name
ON table_name (column);
```

---

### Exemple

Créer un index sur l’email des utilisateurs :

```sql
CREATE INDEX idx_users_email
ON users (email);
```

Cela permet d’accélérer les requêtes comme :

```sql
SELECT *
FROM users
WHERE email = 'alice@email.com';
```

---

## 5 — Index unique

Un **index unique** garantit également l’unicité des valeurs.

```sql
CREATE UNIQUE INDEX idx_users_email
ON users (email);
```

Deux lignes ne peuvent pas avoir la même valeur.

---

## 6 — Index composite

Un index peut contenir **plusieurs colonnes**.

```sql
CREATE INDEX idx_orders_customer_date
ON orders (customer_id, created_at);
```

Cet index est utile pour les requêtes comme :

```sql
SELECT *
FROM orders
WHERE customer_id = 5
ORDER BY created_at;
```

---

## 7 — Quand utiliser un index

Les index sont utiles pour :

- les colonnes utilisées dans **WHERE**
- les colonnes utilisées dans **JOIN**
- les colonnes utilisées dans **ORDER BY**
- les colonnes utilisées dans **GROUP BY**

---

## 8 — Inconvénients des index

Les index améliorent la lecture, mais ils ont aussi un coût.

| Avantage | Inconvénient |
|---|---|
| requêtes plus rapides | stockage supplémentaire |
| recherche rapide | insertion plus lente |
| tri plus rapide | maintenance des index |

Chaque modification de données doit aussi mettre à jour l’index.

---

## 9 — Bonnes pratiques

Toujours :

- indexer les colonnes utilisées dans WHERE
- indexer les clés étrangères
- éviter trop d’index
- analyser les requêtes lentes

---

## 10 — Pièges fréquents

Erreurs classiques :

- créer trop d’index
- indexer des colonnes peu utilisées
- indexer des colonnes avec peu de valeurs distinctes
- oublier les index sur les clés étrangères

---

## Conclusion

Les index permettent **d’accélérer les requêtes**.

Concepts importants :

- CREATE INDEX
- index unique
- index composite

Dans le prochain chapitre nous verrons **les vues**, qui permettent de simplifier les requêtes complexes.

---
[← Module précédent](sql_chapitre_12_relations_normalisation.md) | [Module suivant →](sql_chapitre_14_vues.md)
---
