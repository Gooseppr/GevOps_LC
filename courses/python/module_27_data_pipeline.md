---
layout: page
title: "Data & pipelines en Python (pandas, ETL, Airflow)"

course: python
chapter_title: "Data, Pipelines & Distribution"

chapter: 3
section: 8

tags: python,data,pandas,etl,airflow
difficulty: advanced
duration: 110
mermaid: true

status: draft
---

# Data & pipelines en Python (pandas, ETL, Airflow)

## Objectifs pédagogiques
- Comprendre le principe des pipelines de données
- Manipuler des données avec pandas
- Construire un ETL simple
- Comprendre l’orchestration avec Airflow

## Définition

Un pipeline de données est une suite d’étapes permettant de collecter, transformer et stocker des données.

## Pourquoi ce concept existe

Les entreprises manipulent des volumes importants de données :
- logs
- transactions
- analytics

👉 besoin d’automatiser leur traitement

---

## Fonctionnement

🧠 Concept clé — ETL  
Extract → Transform → Load

💡 Astuce — transformer les données le plus tôt possible

⚠️ Erreur fréquente — charger des données brutes non nettoyées

---

## Architecture

| Élément | Rôle | Exemple |
|---------|------|--------|
| Source | données | CSV/API |
| Transform | nettoyage | pandas |
| Load | stockage | DB |
| Orchestrateur | planification | Airflow |

```mermaid
flowchart LR
  A[Source] --> B[Transform]
  B --> C[Load]
  C --> D[Data Storage]
```

---

## Syntaxe ou utilisation

### pandas ⭐

```python
import pandas as pd

df = pd.read_csv("data.csv")
df["new"] = df["value"] * 2
```

---

### Export

```python
df.to_csv("output.csv")
```

---

### Airflow (concept)

- DAG (workflow)
- tâches planifiées
- orchestration

---

## Cas réel

Entreprise e-commerce :

- extraction ventes
- nettoyage données
- stockage DB
- reporting

Résultat :
- données fiables
- automatisation complète

---

## Bonnes pratiques

🔧 Nettoyer les données tôt  
🔧 Éviter charger trop en mémoire  
🔧 Logger les étapes ETL  
🔧 Tester les pipelines  
🔧 Automatiser avec orchestrateur  
🔧 Surveiller les erreurs  

---

## Résumé

Pipeline = ETL

Phrase clé : **Les données brutes doivent être transformées pour être utiles.**

---

## SNIPPETS DE RÉVISION

<!-- snippet
id: python_etl_definition
type: concept
tech: python
level: advanced
importance: high
format: knowledge
tags: python,data
title: ETL pipeline
content: Extract Transform Load est le processus de transformation des données
description: base data engineering
-->

<!-- snippet
id: python_pandas_usage
type: concept
tech: python
level: advanced
importance: high
format: knowledge
tags: python,pandas
title: pandas manipulation
content: pandas permet de manipuler des données tabulaires efficacement
description: outil clé data
-->

<!-- snippet
id: python_data_warning
type: warning
tech: python
level: advanced
importance: high
format: knowledge
tags: python,data,error
title: Données non nettoyées
content: données brutes → erreurs → nettoyer avant traitement
description: problème fréquent
-->

