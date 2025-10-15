---
layout: page
title: Jour 03 — Premiers exercices
---

## Objectif
1. Utiliser Git 
2. Collaborer sur GitLab

# Git — le guide “manipulation sans stress”

## 1) Ce que fait Git (en 2 idées)

- **Versionner** : chaque *commit* est un point dans l’histoire du projet (qui, quand, quoi, pourquoi via le message).
- **Collaborer** : tu travailles en local puis synchronises avec un dépôt distant (GitHub/GitLab), via *fetch/pull/push*.
    
    Un mémo officiel des commandes de base est ici, très pratique à garder sous la main. [git-scm.com](https://git-scm.com/cheat-sheet?utm_source=chatgpt.com)
    

---

---

## 2) Mettre Git en place (une seule fois par machine)

**Pourquoi ?** Git a besoin de connaître ton identité et quelques réglages confort.

```bash
git config --global user.name  "Prénom Nom"
git config --global user.email "toi@example.com"
git config --global init.defaultBranch main
git config --global core.editor "nano"      # ou "code --wait", "vim", ...

```

Créer un dépôt **local** (nouveau projet) ou récupérer un **distant** (existant) :

```bash
git init                                         # transforme le dossier courant en dépôt Git
git clone https://github.com/org/projet.git      # copie un dépôt distant

```

---

## 3) Le modèle mental (3 zones + HEAD)

**Pourquoi ?** Comprendre “où vont” tes changements.

- **Working tree** : tes fichiers sur disque (là où tu édites).
- **Index (staging)** : le *panier* des changements que tu vas figer.
- **HEAD** : le **dernier commit** de ta branche.

**Réflexes :**

```bash
git status                          # état actuel
git diff                            # diff non stagé (working tree)
git add -p                          # choisir précisément ce qui va au panier
git diff --staged                   # diff de ce qui est prêt à être commité

```

---

## 4) Du changement au commit (le cycle local)

**Pourquoi ?** Un commit doit être petit, cohérent, et avoir un message utile.

```bash
git add fichier.txt                 # mettre un fichier dans le panier
git add .                           # tout mettre (pratique, mais vérifie avec status)
git commit -m "feat: message clair (quoi + pourquoi)"

```

Corriger le **dernier** commit (avant push) :

```bash
git commit --amend                  # modifie le message ET/OU le contenu stagé

```

Annuler un ajout au panier / revenir en arrière **avant** commit :

```bash
git restore --staged fichier.txt    # enlève du panier
git restore fichier.txt             # jette les modifs locales (revient à HEAD)

```

Voir l’historique clairement :

```bash
git log --oneline --graph --decorate --all
git show <hash>                     # détail d’un commit (auteur, date, patch)

```

---

## 5) Branches : isoler ton travail sans casser « main »

**Pourquoi ?** Travailler en parallèle (features, fixes) sans polluer la branche principale.

```bash
git switch -c feat/login            # créer + basculer
git branch                          # lister
git switch main                     # revenir

```

### Fusionner (merge) VS réappliquer (rebase)

- **merge** : colle les histoires telles quelles (sécurisant, non destructif).
- **rebase** : rejoue tes commits au sommet de la cible → **histoire linéaire** (réécrit ta branche).

```bash
# intégrer feat/login dans main (merge)
git switch main
git merge --no-ff feat/login
git branch -d feat/login

# mettre ta branche à jour par-dessus main (rebase)
git switch feat/login
git fetch origin
git rebase origin/main
# s’il y a conflit : éditer → git add <fichiers> → git rebase --continue

```

> Règle simple : ne rebase pas un historique déjà partagé sans accord d’équipe.
> 

---

## 6) Distant : connecter, récupérer, envoyer

**Pourquoi ?** Partager ton travail et récupérer celui des autres.

Connecter un dépôt distant puis pousser ta branche principale :

```bash
git remote add origin https://gitlab.com/org/projet.git
git push -u origin main                 # -u : branche locale suit origin/main

```

Au quotidien :

```bash
git fetch                               # met à jour les références distantes
git pull                                # fetch + merge (ou rebase selon config)
git push                                # publie tes commits

```

Option courante si l’équipe préfère un historique propre :

```bash
git config --global pull.rebase true

```

Créer une branche locale depuis une branche distante :

```bash
git switch -c feature-x origin/feature-x

```

---

## 7) Conflits : les résoudre calmement

**Pourquoi ?** Deux personnes ont modifié les mêmes lignes.

1. Git marque les sections (`<<<<<<<`, `=======`, `>>>>>>>`).
2. Tu édites et gardes la bonne version.
3. Tu marques résolu :

```bash
git add chemin/fichier
git commit                       # si c’était un merge
# ou, pendant un rebase :
git rebase --continue

```

Abandonner si ça part mal :

```bash
git merge --abort
git rebase --abort

```

---

## 8) Mettre de côté du travail en cours (stash)

**Pourquoi ?** Tu dois changer de branche tout de suite mais tu n’as pas fini.

```bash
git stash push -m "WIP: page settings"   # empile le WIP
git stash list
git stash pop                            # réapplique et dépile
git stash apply                          # réapplique et conserve
git stash push -u                        # inclut aussi les fichiers non suivis

```

---

## 9) Annuler / revenir en arrière (sans casse)

**Annuler un commit public** (crée un commit inverse, recommandé) :

```bash
git revert <commit>

```

**Reculer localement l’historique** (attention si déjà poussé) :

```bash
git reset --soft  HEAD~1        # recule HEAD, garde le panier
git reset --mixed HEAD~1        # recule HEAD, garde les fichiers modifiés (par défaut)
git reset --hard  HEAD~1        # recule HEAD et jette les modifs de travail

```

**Filet de sécurité ultime** (retrouver un état perdu) :

```bash
git reflog                      # historique de tous tes HEAD récents
git reset --hard <hash>         # revenir à un HEAD du reflog

```

---

## 10) Tags (versions) et releases

**Pourquoi ?** Marquer une version pour livrer/déployer.

```bash
git tag v1.0.0                         # lightweight
git tag -a v1.0.0 -m "release 1.0.0"   # annotated (recommandé)
git push origin --tags

```

---

## 11) Trouver d’où vient un bug (bisect)

**Pourquoi ?** Identifier le commit qui a introduit le problème (recherche binaire).

```bash
git bisect start
git bisect bad                     # commit actuel est mauvais
git bisect good <hash_bon>
# Git te place au milieu → teste → "good" ou "bad"
git bisect good
git bisect bad
git bisect reset
# bonus si tu as un test automatisable qui renvoie 0/1 :
git bisect run ./test.sh

```

---

## 12) Ignorer, nettoyer, normaliser

**Ignorer** (à la racine du repo) :

```
# .gitignore
node_modules/
.env
.DS_Store
dist/

```

Si déjà suivis :

```bash
git rm -r --cached node_modules

```

**Nettoyer les fichiers non suivis** (dry-run d’abord !) :

```bash
git clean -fdxn        # voir ce qui serait supprimé
git clean -fdx         # supprimer réellement (attention)

```

**Fin de ligne/attributs** (pour éviter CRLF/LF foireux) :

```
# .gitattributes
* text=auto

```

---

## 13) Commandes “modernes” plus lisibles

**Pourquoi ?** `switch` et `restore` sont plus clairs que l’historique `checkout`.

```bash
git switch -c fix/typo
git restore --staged src/app.js
git restore src/app.js

```

---

## 14) Logs lisibles & alias gain-de-temps

**Voir clair :**

```bash
git log --oneline --graph --decorate --all
git log --stat
git log -p

```

**Alias pratiques :**

```bash
git config --global alias.st  "status -sb"
git config --global alias.lg  "log --oneline --graph --decorate --all"
git config --global alias.co  "checkout"
git config --global alias.br  "branch"

```

---

## 15) Pannes fréquentes → gestes rapides

- **“Updates were rejected…”** (le distant a des commits que tu n’as pas) :
    
    ```bash
    git pull --rebase
    # résoudre les conflits s’il y en a
    git push
    
    ```
    
- **“refusing to merge unrelated histories”** (deux histoires sans ancêtre) :
    
    ```bash
    git pull --allow-unrelated-histories
    
    ```
    
- **“detached HEAD”** (tu es sur un commit, pas une branche) :
    
    ```bash
    git switch -c fix/issue-123
    
    ```
    
- **reset --hard malheureux** :
    
    ```bash
    git reflog
    git reset --hard <hash_trouvé>
    
    ```
    

---

## 16) Trois workflows qui tiennent la route

**A) Feature branch simple (recommandé)**

```bash
git switch -c feat/inscription
# ... commits petits et propres ...
git fetch origin
git rebase origin/main            # mettre à jour avant PR, si politique de l’équipe
git push -u origin feat/inscription
# Ouvre la PR/MR → review → merge (souvent squash) → delete branch

```

**B) Hotfix en prod**

```bash
git switch -c hotfix/urgent origin/main
# ... correctif ...
git push -u origin hotfix/urgent
# merge + tag v1.0.1

```

**C) Intégration régulière**

```bash
git switch main
git pull --rebase
git switch ta-branche
git rebase main                   # éviter les divergences longues

```

---

## 17) Entraînement rapide (tu peux le faire maintenant)

1. **Init → premier push**
    
    `git init` → crée `README.md` → `git add .` → `git commit -m "init"` → `git remote add origin …` → `git push -u origin main`.
    
2. **Branche → merge (sans conflit)**
    
    `git switch -c feat/hello` → change un fichier → commit → `git switch main` → `git merge --no-ff feat/hello` → `git branch -d feat/hello`.
    
3. **Créer un conflit & le résoudre**
    
    Modifie la **même ligne** sur deux branches, merge → Git marque les zones → édite, `git add`, `git commit`.
    
4. **Réécrire propre avant PR**
    
    `git rebase -i HEAD~4` → `squash` des micro-commits → `git push --force-with-lease`.
    
5. **Bisect**
    
    Marque un commit bon/mauvais → `git bisect` → trouve l’introducteur.
    

---

## 18) Kit de survie (copier-coller)

```bash
# Où j’en suis
git status
git log --oneline --graph --decorate --all

# Ajouter / retirer / restaurer
git add -p
git restore --staged <file>
git restore <file>

# Commit
git commit -m "feat: ..."
git commit --amend --no-edit

# Branches
git switch -c feat/x
git switch main
git merge --no-ff feat/x
git branch -d feat/x

# Distant
git fetch
git pull --rebase
git push
git push -u origin feat/x

# Conflits
# (éditer) -> git add <files> -> git commit | git rebase --continue

# Stash
git stash push -m "WIP"
git stash pop

# Annuler / récupérer
git revert <commit>
git reset --mixed HEAD~1
git reflog

# Tags
git tag -a v1.0.0 -m "release"
git push origin --tags

```