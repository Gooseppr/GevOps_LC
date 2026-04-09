---
layout: page
title: Git — manipulation avancée de l’historique
sujet: Versionning
type: module
jour: 03
ordre: 2
tags: git, historique
---

# 🧠 GIT — MANIPULATION AVANCÉE DE L’HISTORIQUE

---

## 1. Introduction — Pourquoi manipuler l’historique ?

Git garde **toutes les versions** de ton projet.  
Mais parfois, l’historique devient encombré : commits “WIP”, corrections rapides, erreurs de branche...  
Manipuler l’historique permet de **le rendre plus propre, lisible et cohérent**.

> 🎯 Objectif : raconter une **histoire claire et réversible** du projet, sans perdre de travail.

---

### Les bénéfices d’un historique propre :
| Bénéfice | Description |
|-----------|--------------|
| **Lisibilité** | Facilite la relecture et les revues de code |
| **Qualité** | Permet de fusionner ou corriger sans bruit |
| **Sécurité** | Possibilité de revenir en arrière à tout moment |

---

## 2. Rebase — “Rejouer les commits sur une base plus récente”

`git rebase` repositionne les commits de ta branche **au-dessus** d’une autre branche.  
C’est comme rejouer ton travail par-dessus une version plus récente du projet.

```bash
# Mettre à jour ta branche avec main
git switch feature/login
git fetch origin
git rebase origin/main

# En cas de conflit :
# 1. corrige les fichiers concernés
# 2. git add <fichiers>
# 3. git rebase --continue
# Pour annuler : git rebase --abort
```

### Rebase vs Merge

| Commande | Effet | Quand l’utiliser |
|-----------|-------|------------------|
| `merge` | Conserve toute l’histoire | Pour branches partagées |
| `rebase` | Réécrit une histoire linéaire | Avant publication (branches privées) |

> ⚠️ Ne rebase jamais une branche déjà poussée publiquement (sauf coordination d’équipe).

---

### Rebase interactif — Nettoyer avant publication

Fusionne, renomme ou supprime des commits avant d’envoyer ton travail :

```bash
git rebase -i HEAD~5
# Remplace "pick" par :
#  squash (s)   -> fusionner avec commit précédent
#  fixup (f)    -> fusionner sans garder le message
#  reword (r)   -> modifier le message
#  drop (d)     -> supprimer le commit
```

Ensuite, pousse proprement :

```bash
git push --force-with-lease
```

> `--force-with-lease` protège le travail des autres en vérifiant la version distante.

---

## 3. Cherry-pick — “Prendre un commit précis d’ailleurs”

`git cherry-pick` applique **un ou plusieurs commits spécifiques** d’une autre branche.

```bash
# Appliquer un commit sur ta branche actuelle
git cherry-pick 4f3a9c2

# Plusieurs commits
git cherry-pick a1b2c3d..d4e5f6g

# Ou une liste
git cherry-pick abc123 def456 ghi789
```

En cas de conflit :
```bash
git add <fichiers>
git cherry-pick --continue
# Ou annuler :
git cherry-pick --abort
```

> 💡 Très utile pour copier un correctif (`hotfix`) depuis main vers une autre version.

---

## 4. Reset — “Reculer HEAD” (localement)

`git reset` repositionne le pointeur `HEAD` et ajuste ton index selon le mode choisi.

| Option | Effet | Usage |
|---------|-------|-------|
| `--soft` | Reculer HEAD, garder tout en staging | Pour fusionner plusieurs commits |
| `--mixed` *(défaut)* | Reculer HEAD, déstager les fichiers | Corriger un commit avant publication |
| `--hard` | Reculer HEAD et supprimer les modifs | ⚠️ Destructif — à éviter sur du travail partagé |

```bash
git reset --soft HEAD~1
git reset --mixed HEAD~1
git reset --hard HEAD~1
```

> 🧩 Astuce : fais toujours un `git reflog` avant un `--hard` pour pouvoir revenir.

---

## 5. Revert — “Annuler sans réécrire”

`git revert` crée un **nouveau commit inverse** pour annuler un commit existant.  
Idéal pour un historique partagé.

```bash
git revert <hash>
# Plusieurs commits
git revert --no-commit A..B
git commit -m "Rollback de la fonctionnalité X"
```

> 💡 Contrairement à `reset`, `revert` n’efface rien : il ajoute un commit correctif.

---

## 6. Reflog — “La machine à remonter le temps”

Git garde un log **local** de tous les mouvements de `HEAD`.  
Tu peux récupérer un travail perdu après un reset ou un rebase raté.

```bash
git reflog
# Exemple de sortie :
# 9a8b7c4 (HEAD -> main) HEAD@{0}: commit: fix typo
# 7b6a5c3 HEAD@{1}: rebase: moving from feature/login to main

# Revenir à un état précédent :
git checkout HEAD@{3}
# Ou le restaurer définitivement :
git reset --hard HEAD@{3}
git switch -c rescue HEAD@{3}
```

> 🕐 Les entrées expirent (≈ 90 jours). Sauvegarde rapidement ce que tu veux récupérer.

---

## 7. Résolution de conflits — sans paniquer

Lors d’un rebase, merge ou cherry-pick, Git s’arrête si un même fichier a été modifié des deux côtés.

```text
<<<<<<< HEAD
ta version
=======
leur version
>>>>>>> autre-branche
```

### Étapes de résolution :
```bash
# 1. Corrige les fichiers marqués
git add <fichiers>
# 2. Continue ou termine
git rebase --continue     # pour rebase
git cherry-pick --continue # pour cherry-pick
git commit                 # pour merge
# 3. Abandonner si besoin
git rebase --abort
git merge --abort
```

> 🧠 Petit commit = petit conflit → solution rapide.

---

## 8. Nettoyer une branche avant publication

Avant une PR ou merge request, fais un ménage propre :

```bash
# 1. Mets-toi à jour
git fetch origin
git rebase origin/main

# 2. Regroupe / renomme les commits
git rebase -i origin/main

# 3. Vérifie ton historique
git log --oneline --graph --decorate

# 4. Publie
git push --force-with-lease
```

> 🧩 Une PR courte et claire = revue rapide et sans erreur.

---

## 9. Cas d’erreurs fréquents et récupération

### J’ai commité sur la mauvaise branche :
```bash
git switch -c feature/login     # crée une nouvelle branche à partir de l’erreur
git switch main
git reset --hard origin/main
git push -u origin feature/login
```

### J’ai tout perdu après un reset :
```bash
git reflog
git reset --hard HEAD@{n}
```

### J’ai raté un merge :
```bash
git merge --abort
git revert -m 1 <hash_du_merge>
```

> `-m 1` garde la version de la branche de destination.

---

## 10. Bonnes pratiques “incassables”

| Situation | Bonne pratique |
|------------|----------------|
| Avant de publier | `rebase -i` pour nettoyer |
| Travail en équipe | Jamais de `push --force`, sauf `--force-with-lease` |
| Historique partagé | Préférer `revert` à `reset` |
| Sauvegarde de secours | `reflog` avant toute manipulation risquée |
| Revue de code | `git log --oneline --graph --decorate --all` pour vérifier la clarté |

---

## 11. Mémo express — Les commandes clés

```bash
# Rebase (linéariser / mettre à jour / nettoyer)
git fetch origin
git rebase origin/main
git rebase -i HEAD~N
git rebase --continue | --abort

# Cherry-pick (prendre un ou plusieurs commits)
git cherry-pick <hash> [<hash2> ...]
git cherry-pick a..b
git cherry-pick --continue | --abort

# Reset (local)
git reset --soft  HEAD~1
git reset --mixed HEAD~1
git reset --hard  HEAD~1

# Revert (public)
git revert <hash>
git revert --no-commit A..B && git commit -m "Rollback ..."

# Reflog (sauvetage)
git reflog
git checkout HEAD@{3}
git reset --hard HEAD@{3}
git switch -c rescue HEAD@{3}

# Conflits : résoudre puis continuer
git add <files>
git commit                    # merge
git rebase --continue         # rebase/cherry-pick
```

---

## 12. En résumé — maîtriser l’historique, c’est maîtriser le projet

> Git n’est pas seulement un outil de sauvegarde : c’est une **machine à remonter le temps**.  
> Comprendre et manipuler l’historique te donne un **contrôle total** sur ton code.

Tu sais maintenant :
- corriger une erreur sans tout casser,  
- nettoyer ton historique avant publication,  
- retrouver un travail “perdu” avec `reflog`,  
- et garder un historique propre, clair et professionnel.

---

🎉 Félicitations !
Tu maîtrises désormais les **outils avancés de Git** pour garder ton historique sous contrôle et collaborer efficacement dans un contexte DevOps.



<!-- snippet
id: git_rebase_update_branch
type: command
tech: git
level: intermediate
tags: rebase,historique,linéaire
title: Rebase — mettre à jour sa branche sur main
command: git fetch origin && git rebase origin/main
description: Rejoue les commits de la branche courante au-dessus de origin/main pour obtenir un historique linéaire
-->

<!-- snippet
id: git_rebase_interactive_cleanup
type: command
tech: git
level: intermediate
tags: rebase,squash,historique,cleanup
title: Rebase interactif — nettoyer les N derniers commits
command: git rebase -i HEAD~5
description: Ouvre l'éditeur pour fusionner, renommer ou supprimer les 5 derniers commits avant publication
-->

<!-- snippet
id: git_push_force_with_lease
type: command
tech: git
level: intermediate
tags: push,force,sécurité
title: Push forcé sécurisé après réécriture d'historique
command: git push --force-with-lease
description: Pousse en forçant tout en vérifiant que personne d'autre n'a poussé entre-temps
-->

<!-- snippet
id: git_cherry_pick_single
type: command
tech: git
level: intermediate
tags: cherry-pick,hotfix,commit
title: Cherry-pick — appliquer un commit précis
command: git cherry-pick 4f3a9c2
description: Applique le commit spécifié sur la branche courante, utile pour propager un hotfix
-->

<!-- snippet
id: git_reset_modes
type: concept
tech: git
level: intermediate
tags: reset,HEAD,staging
title: Les trois modes de git reset
content: --soft : recule HEAD et garde tout en staging. --mixed (défaut) : recule HEAD et déstage les fichiers. --hard : recule HEAD et supprime les modifications locales (destructif).
description: Choisir le bon mode selon si on veut re-squasher, corriger avant push, ou tout effacer
-->

<!-- snippet
id: git_revert_public
type: command
tech: git
level: intermediate
tags: revert,annuler,historique-partagé
title: Revert — annuler un commit sans réécrire l'historique
command: git revert <hash>
example: git revert a3f2c1d
description: Crée un nouveau commit inverse, idéal pour annuler proprement sur une branche partagée
-->

<!-- snippet
id: git_reflog_rescue
type: command
tech: git
level: advanced
tags: reflog,récupération,HEAD
title: Reflog — retrouver et restaurer un état perdu
command: git reflog
description: Liste tous les mouvements de HEAD localement. Utiliser git reset --hard HEAD@{n} ou git switch -c rescue HEAD@{n} pour récupérer le travail perdu
-->

<!-- snippet
id: git_rebase_no_public_branch
type: warning
tech: git
level: intermediate
tags: rebase,branche-partagée,règle
title: Ne jamais rebaser une branche déjà publiée
content: Rebaser une branche déjà poussée publiquement réécrit l'historique des autres développeurs et crée des divergences. Utiliser rebase uniquement sur les branches privées, avant publication.
-->

---
[← Module précédent](M03_git-manipulation.md) | [Module suivant →](M03_git-historique-avance.md)
---
