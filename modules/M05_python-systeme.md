---
title: Python — le cours Python
sujet: Python
type: module
jour: 05
ordre: 1
tags: python, bash, linux, devops
---

# Tâches système avec Python — version structurée et pratico-pratique

## Préambule (environnement)

```bash
sudo apt update && sudo apt install -y python3 python3-venv python3-pip
python3 -m venv .venv && source .venv/bin/activate
pip install --upgrade pip

pip install psutil             # ex. module tiers
pip freeze > requirements.txt # figer les versions

```

---

# 1) `os` — parler “système”
- Permet d’interagir avec le système d’exploitation. On peut manipuler les chemins de fichiers, créer/supprimer des dossiers, accéder/modifier des variables d’environnement, et gérer les permissions des fichiers.

### 1.1 Chemins & CWD (répertoire courant)

```python
import os
print(os.getcwd())                 # afficher le cwd
os.chdir("/tmp")                   # changer de dossier

```

### 1.2 Lister / filtrer / tester

```python
import os
for name in os.listdir("."):       # contenu du dossier courant
    full = os.path.join(".", name)
    if os.path.isfile(full):
        print("FICHIER :", full)
    elif os.path.isdir(full):
        print("DOSSIER :", full)

```

### 1.3 Créer / renommer / supprimer

```python
import os, shutil

os.makedirs("data/raw", exist_ok=True)                 # mkdir -p
open("data/raw/sample.txt", "w").write("hello\n")      # créer un fichier
os.rename("data/raw/sample.txt", "data/raw/renamed.txt")
os.remove("data/raw/renamed.txt")                      # supprimer un fichier
shutil.rmtree("data", ignore_errors=True)              # supprimer récursif

```

### 1.4 Parcourir récursivement (équivalent `find`)

```python
import os
for root, dirs, files in os.walk("/etc"):
    for f in files:
        if f.endswith(".conf"):
            print(os.path.join(root, f))

```

### 1.5 Variables d’environnement (PATH, secrets)

```python
import os
print(os.environ.get("HOME"))               # lire
os.environ["PATH"] = os.environ.get("PATH","") + os.pathsep + "/opt/bin"   # étendre PATH

```

> Astuce : pour rendre ça permanent, modifie ~/.bashrc ; ici c’est valable seulement dans le process.
> 

### 1.6 UID/GID & permissions (Linux)

```python
import os, stat
print(os.getuid(), os.getgid())           # UID / GID
os.chmod("script.sh", 0o755)              # rwxr-xr-x
# Ajouter le bit exécutable user :
m = os.stat("script.sh").st_mode
os.chmod("script.sh", m | stat.S_IXUSR)

```

### 1.7 Un “mini-outil” concret : **renommer avec préfixe/suffixe**

```python
import os

directory = "/tmp/demo"
prefix, suffix = "pre_", "_su"
os.makedirs(directory, exist_ok=True)
open(os.path.join(directory,"a.txt"),"w").write("x")

for filename in os.listdir(directory):
    src = os.path.join(directory, filename)
    if not os.path.isfile(src):
        continue
    name, ext = os.path.splitext(filename)
    new_name = f"{prefix}{name}{suffix}{ext}"
    os.rename(src, os.path.join(directory, new_name))
    print(f"{filename} -> {new_name}")

```

---

# 2) `sys` — arguments, I/O standard, codes de sortie
- Donne accès à des variables et fonctions liées à l’interpréteur Python. On peut lire les arguments passés au script (argv), gérer les flux d’entrée/sortie (stdin, stdout, stderr), définir le code de sortie du programme, et obtenir des infos sur l’environnement Python.

```python
#!/usr/bin/env python3
import sys
if len(sys.argv) < 2:
    print("Usage: script.py <fichier>", file=sys.stderr)
    sys.exit(64)  # EX_USAGE

path = sys.argv[1]
try:
    with open(path, "r", encoding="utf-8") as f:
        print("# lignes:", sum(1 for _ in f))
except FileNotFoundError:
    print("Fichier non trouvé", file=sys.stderr)
    sys.exit(66)  # EX_NOINPUT

```

Rediriger (démo) :

```python
import sys
sys.stdout = open("out.txt","w",encoding="utf-8")
sys.stderr = open("err.txt","w",encoding="utf-8")
print("message normal")
raise ValueError("erreur contrôlée")

```

> En prod, préfère le module logging.
> 

---

# 3) `subprocess` — exécuter des commandes externes
- Sert à lancer des commandes externes (comme si on était dans le terminal). Par défaut, l’exécution est synchrone (le script attend la fin de la commande). On peut aussi capturer la sortie de ces commandes pour la traiter dans Python.

### 3.1 Exécution **synchrone** (par défaut)

```python
import subprocess, pathlib

src = pathlib.Path("fichier_source.txt")
src.write_text("z\nb\na\n", encoding="utf-8")

res = subprocess.run(
    ["sort", str(src)],
    capture_output=True, text=True, check=True
)
pathlib.Path("sorted_output.txt").write_text(res.stdout, encoding="utf-8")

```

- `check=True` → exception si retour ≠ 0.
- `capture_output=True, text=True` → `res.stdout` en `str`.

### 3.2 Gestion d’erreur & délai

```python
import subprocess
try:
    subprocess.run(["ping","-c","1","8.8.8.8"], check=True, timeout=3)
except subprocess.TimeoutExpired:
    print("Timeout")
except subprocess.CalledProcessError as e:
    print("Échec, code:", e.returncode)

```

### 3.3 Streaming (lecture continue)

```python
from subprocess import Popen, PIPE
with Popen(["tail","-n","+1","/etc/hosts"], stdout=PIPE, text=True) as p:
    for line in p.stdout:
        print(line.rstrip())

```

> Évite shell=True (risque d’injection). Si tu dois l’utiliser :
> 
> 
> `subprocess.run("ls -l | grep py", shell=True)`.
> 

---

# 4) `shutil` — opérations de **haut niveau**
- Fournit des fonctions de haut niveau pour copier, déplacer, supprimer des fichiers/dossiers entiers (copy, move, rmtree, copytree). Permet aussi d’obtenir l’utilisation du disque avec disk_usage.

```python
import shutil, pathlib
src = pathlib.Path("demo_src"); src.mkdir(exist_ok=True)
(src/"a.txt").write_text("A\n")

# copie récursive (mkdir -p, copie tout)
shutil.copytree(src, "demo_dst", dirs_exist_ok=True)

# archiver
shutil.make_archive("backup", "zip", root_dir=src)  # crée backup.zip

# déplacer / supprimer récursif
shutil.move("demo_dst/a.txt", "a_moved.txt")
shutil.rmtree("demo_dst", ignore_errors=True)

# espace disque (standard lib)
total, used, free = shutil.disk_usage("/")
print(total, used, free)

```

---

# 5) `psutil` (tiers) — CPU/RAM/Disque/Utilisateurs

Installation :

```bash
pip install psutil

```

### 5.1 Exemple “utilisateurs connectés” (ton capture nano corrigé)
- Module externe très pratique pour surveiller l’état du système (CPU, RAM, disques, processus). Utile pour le monitoring ou l’administration système.

```python
import psutil

def get_users():
    users = psutil.users()
    user_list = []
    for u in users:
        user_list.append({
            "name": u.name,
            "terminal": u.terminal,
            "host": u.host,
            "started": u.started,
        })
    return user_list

print(get_users())

```

### 5.2 Exemple “vitals” simple

```python
import psutil
cpu = psutil.cpu_percent(interval=1)
mem = psutil.virtual_memory()
disk = psutil.disk_usage("/")
print(f"CPU: {cpu:.1f}% | RAM: {mem.percent:.1f}% | DISK: {disk.percent:.1f}%")

```

---

# 6) `datetime` — horodatage propre (logs, fichiers datés)

```python
from datetime import datetime, timedelta

now = datetime.now()
print(now.isoformat(timespec="seconds"))      # 2025-10-17T14:22:03

# format perso
print(now.strftime("%Y-%m-%d %H:%M:%S"))      # 2025-10-17 14:22:03

# fichiers datés
stamp = now.strftime("%Y%m%d-%H%M%S")
open(f"log-{stamp}.txt","w").write("Hello\n")

# calculs
tomorrow = now + timedelta(days=1)

```

> Tu peux combiner datetime avec psutil pour tracer des métriques horodatées dans un fichier (cron-friendly).
> 

---

# 7) `pathlib` — chemins “objet”, portables et propres (bonus recommandé)
- Offre une façon orientée objet de manipuler les chemins de fichiers. C’est plus sûr et portable que de simplement concaténer des chaînes de caractères pour former des chemins.

### 7.1 Bases

```python
from pathlib import Path

p = Path("/tmp/demo") / "file.txt"
p.parent.mkdir(parents=True, exist_ok=True)
p.write_text("hello\n", encoding="utf-8")
print(p.read_text(encoding="utf-8"))
print(p.stem, p.suffix, p.name)   # file .txt file.txt

```

### 7.2 Parcourir et renommer proprement

```python
from pathlib import Path
d = Path("/tmp/demo2"); d.mkdir(exist_ok=True)
(d/"a.log").write_text("x")
for path in d.iterdir():
    if path.is_file():
        new_name = f"pre_{path.stem}_su{path.suffix}"
        path.rename(path.with_name(new_name))
        print(path.name, "->", new_name)

```

### 7.3 Pourquoi `pathlib` est pratique

- API claire (`.iterdir()`, `.is_file()`, `.read_text()`…),
- Portabilité (séparateurs, encodage)
- Moins d’erreurs de concaténation de chaînes.

---

## Recettes prêtes à l’emploi (copier-coller)

### Renommer `.txt` → `_backup.txt` (OS pur)

```python
import os
d = "/tmp/notes"; os.makedirs(d, exist_ok=True)
open(os.path.join(d,"a.txt"),"w").write("x")
for name in os.listdir(d):
    src = os.path.join(d, name)
    if os.path.isfile(src) and name.endswith(".txt"):
        base, ext = os.path.splitext(name)
        os.rename(src, os.path.join(d, f"{base}_backup{ext}"))

```

### Exécuter une commande et loguer (subprocess + datetime)

```python
import subprocess
from datetime import datetime

cmd = ["df","-h"]
res = subprocess.run(cmd, capture_output=True, text=True)
with open("df.log","a",encoding="utf-8") as f:
    f.write(f"[{datetime.now().isoformat()}] return={res.returncode}\n")
    f.write(res.stdout + "\n")

```

### Journal “vitals” (psutil + datetime)

```python
import psutil
from datetime import datetime

cpu = psutil.cpu_percent(1)
mem = psutil.virtual_memory()
disk = psutil.disk_usage("/")

with open("vitals.log","a",encoding="utf-8") as f:
    f.write(f"{datetime.now().isoformat()} ")
    f.write(f"CPU={cpu:.1f}% RAM={mem.percent:.1f}% DISK={disk.percent:.1f}%\n")

```