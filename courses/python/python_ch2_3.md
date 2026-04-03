---
layout: page
title: "Gestion des exceptions & fichiers"

course: python
theme: "Intermédiaire"
type: lesson

chapter: 2
section: 3

tags: python,exceptions,try,except,fichiers,pathlib,json,with
difficulty: intermediate
duration: 35
mermaid: false

status: "published"
next_module: "/courses/python/python_ch2_4.html"
next_module_title: "Modules & packages"
---

# Gestion des exceptions & fichiers

## Objectifs pédagogiques

- Utiliser `try/except/else/finally` pour gérer les erreurs
- Connaître les exceptions built-in les plus courantes
- Lever ses propres exceptions avec `raise`
- Lire et écrire des fichiers avec `with open()`
- Manipuler les chemins avec `pathlib.Path`
- Sérialiser et désérialiser du JSON

---

## Contexte

Les erreurs font partie de tout programme. Python favorise une approche EAFP (Easier to Ask Forgiveness than Permission) : on essaie l'opération et on gère l'erreur si elle survient, plutôt que de vérifier préalablement toutes les conditions. Les gestionnaires de contexte (`with`) garantissent la libération des ressources même en cas d'erreur.

---

## try / except / else / finally

```python
try:
    resultat = 10 / 0
except ZeroDivisionError:
    print("Division par zéro !")
```

### Capturer plusieurs exceptions

```python
def convertir(chaine):
    try:
        valeur = int(chaine)
        return 100 / valeur
    except ValueError:
        print(f"'{chaine}' n'est pas un entier valide")
    except ZeroDivisionError:
        print("La valeur ne peut pas être zéro")
    except (TypeError, AttributeError) as e:
        print(f"Erreur de type : {e}")
```

### else et finally

```python
def lire_nombre():
    try:
        n = int(input("Entrez un nombre : "))
    except ValueError:
        print("Ce n'est pas un nombre")
    else:
        # s'exécute UNIQUEMENT si aucune exception n'a eu lieu
        print(f"Vous avez entré : {n}")
    finally:
        # s'exécute TOUJOURS, même en cas d'exception
        print("Fin de la saisie")
```

`else` est souvent sous-utilisé mais précieux : il signifie explicitement "ce code ne s'exécute que si tout s'est bien passé".

---

## Exceptions built-in courantes

| Exception | Déclenchée par |
|---|---|
| `ValueError` | Valeur incorrecte pour un type (`int("abc")`) |
| `TypeError` | Mauvais type d'opérande (`"a" + 1`) |
| `KeyError` | Clé absente dans un dict (`d["x"]` si "x" absent) |
| `IndexError` | Indice hors limites (`lst[100]` si len < 101) |
| `AttributeError` | Attribut inexistant (`None.split()`) |
| `FileNotFoundError` | Fichier introuvable |
| `PermissionError` | Droits insuffisants |
| `ZeroDivisionError` | Division par zéro |
| `StopIteration` | Fin d'un itérateur |
| `ImportError` | Module introuvable |

---

## Lever ses propres exceptions

```python
def calculer_racine(n):
    if n < 0:
        raise ValueError(f"La racine carrée n'est pas définie pour {n}")
    return n ** 0.5

# Créer ses propres exceptions
class AgeInvalideError(ValueError):
    """Levée quand un âge est hors limites."""
    pass

def valider_age(age):
    if not isinstance(age, int):
        raise TypeError(f"L'âge doit être un entier, pas {type(age).__name__}")
    if age < 0 or age > 150:
        raise AgeInvalideError(f"Âge {age} hors de la plage acceptable [0, 150]")
    return age
```

---

## Lire et écrire des fichiers

### Syntaxe with open()

```python
# Lecture complète
with open("fichier.txt", "r", encoding="utf-8") as f:
    contenu = f.read()

# Lecture ligne par ligne (efficace pour les gros fichiers)
with open("fichier.txt", "r", encoding="utf-8") as f:
    for ligne in f:
        print(ligne.strip())

# Lecture de toutes les lignes dans une liste
with open("fichier.txt", "r", encoding="utf-8") as f:
    lignes = f.readlines()

# Écriture (écrase le fichier)
with open("sortie.txt", "w", encoding="utf-8") as f:
    f.write("Première ligne\n")
    f.writelines(["ligne 2\n", "ligne 3\n"])

# Ajout en fin de fichier
with open("log.txt", "a", encoding="utf-8") as f:
    f.write("Nouvelle entrée de log\n")
```

### Modes d'ouverture

| Mode | Description |
|---|---|
| `"r"` | Lecture (défaut) |
| `"w"` | Écriture (crée ou écrase) |
| `"a"` | Ajout en fin |
| `"x"` | Création exclusive (erreur si existe) |
| `"rb"` | Lecture binaire |
| `"wb"` | Écriture binaire |

Toujours spécifier `encoding="utf-8"` pour les fichiers texte.

---

## pathlib.Path

`pathlib` est le module moderne pour manipuler les chemins. Il remplace `os.path`.

```python
from pathlib import Path

# Créer un chemin
dossier = Path("/home/alice/projets")
fichier = dossier / "config.json"   # opérateur / pour joindre

# Informations
print(fichier.name)       # config.json
print(fichier.stem)       # config
print(fichier.suffix)     # .json
print(fichier.parent)     # /home/alice/projets

# Vérifications
print(fichier.exists())
print(fichier.is_file())
print(fichier.is_dir())

# Créer des dossiers
(dossier / "sous_dossier").mkdir(parents=True, exist_ok=True)

# Lire / écrire directement
contenu = fichier.read_text(encoding="utf-8")
fichier.write_text("nouveau contenu", encoding="utf-8")

# Lister des fichiers
for f in dossier.glob("*.py"):
    print(f)

# Chemin relatif et absolu
p = Path(".")
print(p.resolve())   # chemin absolu
```

---

## JSON

```python
import json

# Sérialiser (Python → JSON string)
donnees = {"nom": "Alice", "age": 30, "actif": True, "scores": [85, 92, 78]}
json_str = json.dumps(donnees, indent=2, ensure_ascii=False)
print(json_str)

# Désérialiser (JSON string → Python)
obj = json.loads(json_str)
print(obj["nom"])   # Alice

# Lire un fichier JSON
with open("config.json", "r", encoding="utf-8") as f:
    config = json.load(f)

# Écrire un fichier JSON
with open("sortie.json", "w", encoding="utf-8") as f:
    json.dump(donnees, f, indent=2, ensure_ascii=False)
```

---

## Bonnes pratiques

- Utiliser `with open()` : garantit la fermeture du fichier même si une exception survient
- Toujours spécifier `encoding="utf-8"` pour éviter les surprises cross-platform
- Ne jamais capturer `Exception` sans logger l'erreur (erreurs silencieuses)
- Créer des exceptions métier en héritant de `ValueError` ou `Exception`
- Préférer `pathlib.Path` à `os.path` pour les chemins

---

## Résumé

```python
# Schéma complet de gestion d'exception
try:
    # code risqué
except SpecifiqueError as e:
    # gérer l'erreur précise
except (AutreError, EnoreUneError) as e:
    # gérer plusieurs types
else:
    # exécuté si pas d'exception
finally:
    # toujours exécuté
```

---

<!-- snippet
id: python_exc_try_except_else
type: concept
tech: python
level: intermediate
importance: high
format: knowledge
tags: exceptions,try,except,else,finally
title: Structure complète try/except/else/finally
content: try : code risqué. except : gère l'erreur. else : exécuté seulement si pas d'exception. finally : toujours exécuté (libération de ressources).
description: La clause else signifie explicitement "code de succès". finally sert à libérer des ressources (fermer une connexion) même si une exception survient.
-->

<!-- snippet
id: python_exc_with_open
type: command
tech: python
level: intermediate
importance: high
format: knowledge
tags: fichier,open,with,contextmanager
title: Ouvrir un fichier avec with open()
command: with open("fichier.txt", "r", encoding="utf-8") as f:
description: Le gestionnaire de contexte with garantit la fermeture du fichier même si une exception est levée dans le bloc. Toujours spécifier encoding="utf-8".
-->

<!-- snippet
id: python_exc_pathlib
type: command
tech: python
level: intermediate
importance: high
format: knowledge
tags: pathlib,chemin,fichier
title: Joindre des chemins avec pathlib
command: fichier = Path("/home/user") / "projets" / "config.json"
description: L'opérateur / de pathlib.Path joint les segments de chemin. Cross-platform (utilise / ou \ selon l'OS). Remplace os.path.join().
-->

<!-- snippet
id: python_exc_json_load
type: command
tech: python
level: intermediate
importance: high
format: knowledge
tags: json,deserialisation,fichier
title: Lire un fichier JSON
command: with open("config.json", encoding="utf-8") as f:\n    data = json.load(f)
description: json.load() désérialise depuis un fichier, json.loads() depuis une chaîne. json.dump() écrit dans un fichier, json.dumps() retourne une chaîne.
-->

<!-- snippet
id: python_exc_bare_except
type: warning
tech: python
level: intermediate
importance: high
format: knowledge
tags: exceptions,bare,except,silence
title: Ne jamais utiliser except Exception sans loguer
content: except Exception: pass avale silencieusement toutes les erreurs, rendant le débogage impossible. Toujours au minimum logger l'erreur avec logging.exception(e).
description: Une exception silencieuse est pire qu'un crash. Capturer Exception est acceptable si on relance (raise) ou si on log l'erreur complète avec le traceback.
-->

<!-- snippet
id: python_exc_raise_custom
type: tip
tech: python
level: intermediate
importance: medium
format: knowledge
tags: raise,exception,personnalisee
title: Créer et lever une exception personnalisée
content: Hériter de ValueError ou Exception pour créer une exception métier. raise MonErreur("message") la lève. L'appelant peut la capturer spécifiquement.
description: Les exceptions personnalisées documentent les cas d'erreur du domaine métier. Hériter de ValueError, TypeError ou IOError selon la nature de l'erreur.
-->
