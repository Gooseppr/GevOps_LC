---
titre: Git — le guide “manipulation sans stress”
type: module
jour: 03
ordre: 1
tags: git, devops
---

# Git — le guide “manipulation sans stress”

## 1) Ce que fait Git (en 2 idées)

- **Versionner** : chaque *commit* est un point dans l’histoire du projet (qui, quand, quoi, pourquoi via le message).
- **Collaborer** : tu travailles en local puis synchronises avec un dépôt distant (GitHub/GitLab), via *fetch/pull/push*.
    
    Un mémo officiel des commandes de base est ici, très pratique à garder sous la main. [git-scm.com](https://git-scm.com/cheat-sheet?utm_source=chatgpt.com)
    

---

---

## 2) Configuration initiale d’une machine (une fois par machine)

La configuration globale déclare l’identité de l’auteur, la branche par défaut et l’éditeur, afin d’assurer des métadonnées cohérentes pour tous les commits.

```bash
git config --global user.name  "Prénom Nom"
git config --global user.email "toi@example.com"
git config --global init.defaultBranch main
git config --global core.editor "nano"      # ou "code --wait", "vim", ...

```

---

## 3) Démarrage d’un dépôt (local) ou récupération d’un dépôt (distant)

La création d’un dépôt local initialise le suivi de versions dans le répertoire courant. La récupération d’un dépôt distant crée une copie de travail complète avec l’historique.

```bash
# Nouveau projet local
mkdir mon-projet && cd mon-projet
git init
echo "# Mon projet" > README.md
git add README.md
git commit -m "init: premier commit"

# Projet existant depuis un distant
git clone https://github.com/org/projet.git
cd projet
git status

```

---

## 4) Modèle de fonctionnement : trois zones et la référence HEAD

Le **working tree** contient les fichiers du projet en cours d’édition.

L’**index** (staging area) liste les modifications destinées au prochain commit.

**HEAD** référence le dernier commit de la branche active.

```bash
git status                 # état des fichiers et de l’index
git diff                   # différences non indexées (working tree → index)
git add -p                 # ajout sélectif par blocs (hunks)
git diff --staged          # différences prêtes à être commitées (index → HEAD)

```

---

## 5) Cycle de travail : préparer et enregistrer un commit

Un commit regroupe un ensemble cohérent de changements accompagné d’un message explicite décrivant l’intention et l’impact.

```bash
git add fichier.txt              # ajout d’un fichier à l’index
git add .                        # ajout de toutes les modifications détectées
git commit -m "feat: ajouter X pour Y (raison)"

```

La correction du dernier commit local s’effectue par réécriture contrôlée avant publication.

```bash
git commit --amend               # correction du message et/ou du contenu indexé

```

La dé-sélection d’un fichier et la restauration locale permettent de revenir à l’état enregistré.

```bash
git restore --staged fichier.txt # retrait du fichier de l’index
git restore fichier.txt          # restauration du fichier depuis HEAD

```

L’inspection de l’historique fournit une vue synthétique et détaillée des changements passés.

```bash
git log --oneline --graph --decorate --all
git show <hash>

```

---

## 6) Branches : isolation des travaux et intégration maîtrisée

La création d’une branche isole un flux de travail sans affecter la branche principale. Le retour à la branche de base restaure l’environnement d’intégration.

```bash
git switch -c feat/login   # création et bascule sur une branche de fonctionnalité
git branch                 # liste des branches locales
git switch main            # retour sur la branche principale

```

L’intégration par **merge** assemble les historiques sans réécriture. La mise à jour par **rebase** rejoue les commits au-dessus d’une base plus récente pour produire un historique linéaire.

```bash
# Intégration de feat/login dans main (trace complète conservée)
git switch main
git merge --no-ff feat/login
git branch -d feat/login

# Mise à niveau d’une branche avant publication (historique linéaire)
git switch feat/login
git fetch origin
git rebase origin/main
# en cas de conflit : éditer → git add ... → git rebase --continue

```

> Par convention d’équipe, la réécriture par rebase est réservée aux branches privées avant publication.
> 

---

## 7) Dépôt distant : déclaration, synchronisation et publication

La déclaration d’un **remote** associe le dépôt local au serveur distant. La première publication établit la relation de suivi entre les branches locales et distantes.

```bash
git remote add origin https://gitlab.com/org/projet.git
git push -u origin main
git remote -v           # visualisation des depots distants
git ls-remote           # affiche les réf d'un dépôt distant
```

La synchronisation régulière permet d’obtenir les références distantes, d’intégrer les nouveautés, puis de publier ses propres commits.

```bash
git fetch        # récupération des références distantes
git pull         # fetch + intégration (merge ou rebase selon la configuration)
git push         # publication des commits locaux

```

La préférence pour un historique linéaire s’exprime via la configuration du pull par rebase.

```bash
git config --global pull.rebase true

```

La création d’une branche locale à partir d’une branche distante positionne instantanément l’environnement de travail.

```bash
git switch -c feature-x origin/feature-x

```

---

## 8) Conflits : résolution structurée lors d’une fusion ou d’un rebase

La détection d’un conflit signale des modifications concurrentes sur les mêmes lignes. La résolution consiste à produire une version consolidée, à valider la résolution et à reprendre le processus interrompu.

```bash
# Étapes de résolution
# 1) ouvrir et éditer les fichiers marqués <<<<<<< ======= >>>>>>> ;
# 2) conserver/combiner la bonne version et supprimer les marqueurs ;
git add chemin/fichier

# Validation selon le contexte
git commit               # si l’opération était un merge
git rebase --continue    # si l’opération était un rebase

```

L’annulation de l’opération en cours restaure l’état antérieur.

```bash
git merge --abort
git rebase --abort

```

---

## 9) Suspension temporaire du travail en cours (stash)

La mise en réserve du travail non commité permet de changer de contexte, puis de réappliquer ultérieurement les modifications.

```bash
git stash push -m "WIP: page settings"
git stash list
git stash pop         # réapplication et retrait de la réserve
git stash apply       # réapplication sans retrait
git stash push -u     # inclusion des fichiers non suivis

```

---

## 10) Retour arrière et annulation maîtrisée

L’annulation **publique** d’un commit crée un commit inverse préservant l’historique partagé.

```bash
git revert <commit>

```

Le repositionnement **local** de HEAD ajuste l’historique avant publication selon trois niveaux d’impact.

```bash
git reset --soft  HEAD~1   # recul avec conservation de l’index
git reset --mixed HEAD~1   # recul avec retrait du staging (par défaut)
git reset --hard  HEAD~1   # recul avec restauration des fichiers (destructif)

```

Le **reflog** offre un filet de sécurité en listant les déplacements récents de HEAD, permettant la restauration d’états antérieurs.

```bash
git reflog
git reset --hard <hash>    # retour à un état référencé par le reflog

```

---

## 11) Marquage des versions (tags) et publication des releases

Le marquage d’une version facilite l’identification d’un jalon de livraison. Le tag annoté enregistre message, auteur et date pour une traçabilité complète.

```bash
git tag v1.0.0
git tag -a v1.0.0 -m "release 1.0.0"
git push origin --tags

```

---

## 12) Identification du commit fautif (bisect)

La recherche binaire isole le premier commit introduisant un défaut entre un état déclaré “bon” et un état “mauvais”.

```bash
git bisect start
git bisect bad                 # état actuel défectueux
git bisect good <hash_bon>     # état de référence valide
# tests successifs → marquage good/bad jusqu’à identification
git bisect reset
# automatisation possible si un test retourne 0/1 :
git bisect run ./test.sh

```

---

## 13) Hygiène du dépôt : exclusions, nettoyage et normalisation

Le fichier `.gitignore` exclut du suivi les artefacts de build, secrets et fichiers locaux. Le retrait du cache supprime du suivi des fichiers déjà indexés.

```bash
# .gitignore (exemple)
node_modules/
.env
.DS_Store
dist/

git rm -r --cached node_modules

```

Le nettoyage des fichiers non suivis s’effectue de façon prudente (simulation puis exécution).

```bash
git clean -fdxn   # simulation
git clean -fdx    # exécution (irréversible)

```

La normalisation des fins de lignes se déclare via `.gitattributes` pour homogénéiser les plateformes.

```
* text=auto

```

---

## 14) Commandes modernes pour une intention explicite

L’usage de `switch` et `restore` clarifie la gestion des branches et la restauration des fichiers par rapport à un usage générique de `checkout`.

```bash
git switch -c fix/typo            # création et bascule de branche
git restore --staged src/app.js   # retrait du staging
git restore src/app.js            # restauration depuis HEAD

```

---

## 15) Incidents fréquents et actions correctives

Le rejet de push dû à des commits distants manquants se résout par intégration préalable et résolution éventuelle de conflits.

```bash
git pull --rebase
git push

```

L’absence d’ancêtre commun lors d’une intégration de deux historiques indépendants se traite par autorisation explicite.

```bash
git pull --allow-unrelated-histories

```

La situation de **HEAD détaché** se corrige par la création d’une branche à partir de l’état courant.

```bash
git switch -c fix/issue-123

```

Le reset destructif accidentel se rattrape en consultant le reflog puis en rétablissant l’état souhaité.

```bash
git reflog
git reset --hard <hash_trouvé>

```

---

## 16) Flux de travail quotidien recommandé (synthèse)

Ce flux favorise des commits courts, une mise à jour régulière depuis `main` et une publication propre via branche de fonctionnalité.

```bash
# Mise à jour locale
git fetch origin
git rebase origin/main

# Travail propre
git add -p
git commit -m "feat: ..."
git log --oneline --graph --decorate

# Publication et revue
git push -u origin feat/xxx
# Ouverture de PR/MR → revue → merge (souvent squash) → suppression de la branche

```

---

## 17) Kit de survie (référence rapide)

```bash
# État et historique
git status
git log --oneline --graph --decorate --all

# Ajout / retrait / restauration
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

# Conflits (valider la résolution)
git add <files>
git commit                # merge
git rebase --continue     # rebase

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

---

### Points clés à retenir (avant la manipulation avancée)

- Des **commits courts et clairs** simplifient la lecture, l’intégration et le retour arrière.
- Le **merge** intègre sans réécrire ; le **rebase** linéarise une branche **avant** publication.
- **Revert** annule proprement un commit public ; **reflog** récupère les états perdus.
- La consultation régulière de `git status` et `git log --oneline --graph` maintient une vision claire de la situation.


---
[Module suivant →](003_git-historique-avance.md)
---

---
[Module suivant →](M03_Git_Manipulation_sans_stress.md)
---

---
[Module suivant →](M03_Git_Manipulation_sans_stress.md)
---

---
[Module suivant →](M03_Git_Manipulation_sans_stress.md)
---

---
[Module suivant →](M03_Git_Manipulation_sans_stress.md)
---

---
[Module suivant →](M03_Git_Manipulation_sans_stress.md)
---
