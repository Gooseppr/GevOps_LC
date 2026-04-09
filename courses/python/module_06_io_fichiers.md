---
layout: page
title: "I/O & manipulation de fichiers en Python"

course: python
chapter_title: "Erreurs, Fichiers & Scripting"

chapter: 1
section: 6

tags: python,fichiers,json,csv,io
difficulty: beginner
duration: 75
mermaid: false

status: draft
---

# I/O & manipulation de fichiers en Python

## Objectifs pédagogiques
- Lire et écrire des fichiers en Python
- Manipuler des formats standards (JSON, CSV)
- Gérer correctement les ressources fichiers
- Comprendre les erreurs liées aux entrées/sorties

## Contexte
La majorité des applications manipulent des données externes : fichiers, logs, exports. Une mauvaise gestion des fichiers peut entraîner des pertes de données ou des fuites de ressources.

## Principe de fonctionnement

🧠 Concept clé — I/O (Input / Output)  
Permet de lire ou écrire des données depuis/vers un support externe.

💡 Astuce — Toujours utiliser with  
Garantit la fermeture automatique du fichier.

⚠️ Erreur fréquente — oublier de fermer un fichier  
→ fuite mémoire / verrouillage système

---

## Syntaxe ou utilisation

### Lecture fichier

```python
with open("file.txt", "r") as f:
    content = f.read()
```

Résultat : contenu du fichier chargé en mémoire.

---

### Écriture fichier

```python
with open("file.txt", "w") as f:
    f.write("Hello")
```

---

### JSON

```python
import json

data = {"name": "Goose"}

with open("data.json", "w") as f:
    json.dump(data, f)
```

---

### Lecture JSON

```python
with open("data.json", "r") as f:
    data = json.load(f)
```

---

### CSV

```python
import csv

with open("data.csv") as f:
    reader = csv.reader(f)
    for row in reader:
        print(row)
```

---

## Cas d'utilisation

### Cas simple
Lire un fichier config

### Cas réel
Pipeline data :

- lecture CSV
- transformation
- export JSON

---

## Erreurs fréquentes

⚠️ Erreur classique : FileNotFoundError  
Cause : mauvais chemin  
Correction : vérifier path

⚠️ Mauvais mode (r/w/a)  
→ perte de données

💡 Astuce : utiliser os.path.exists()

---

## Bonnes pratiques

🔧 Toujours utiliser with  
🔧 Valider les chemins  
🔧 Gérer les exceptions  
🔧 Ne pas charger gros fichiers en mémoire  
🔧 Utiliser streaming si nécessaire  
🔧 Standardiser formats (JSON)

---

## Résumé

| Concept | Ce qu'il fait | À retenir |
|--------|-------------|----------|
| open | accès fichier | base |
| with | sécurité | obligatoire |
| json | structuré | standard |
| csv | tabulaire | simple |

---

## SNIPPETS DE RÉVISION

<!-- snippet
id: python_open_file
type: command
tech: python
level: beginner
importance: high
format: knowledge
tags: python,file
title: Ouvrir un fichier
command: open("file.txt", "r")
description: Ouvre un fichier en lecture
-->

<!-- snippet
id: python_with_usage
type: concept
tech: python
level: beginner
importance: high
format: knowledge
tags: python,file
title: Utiliser with
content: `with open()` utilise le protocole de context manager : `__enter__` ouvre le fichier, `__exit__` le ferme garantie même si une exception se produit. Sans `with`, un crash avant `file.close()` laisse le fichier ouvert et peut corrompre les données.
description: Le même pattern s'applique aux connexions BDD, locks, sessions réseau — tout objet qui doit être nettoyé après utilisation devrait s'utiliser avec `with`.
-->

<!-- snippet
id: python_json_dump
type: concept
tech: python
level: beginner
importance: medium
format: knowledge
tags: python,json
title: json.dump
content: json.dump écrit un dictionnaire Python dans un fichier JSON
description: Standard data exchange
-->

<!-- snippet
id: python_file_error
type: warning
tech: python
level: beginner
importance: high
format: knowledge
tags: python,file,error
title: FileNotFoundError
content: fichier introuvable → mauvais chemin → vérifier le path
description: Erreur fréquente
-->

