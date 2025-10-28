---
module: Git — manipulation avancée de l’historique
jour: 03
ordre: 2
tags: git, devops
---

# Git — manipulation avancée de l’historique (sans paniquer)

## Ce que tu sauras faire

- Choisir entre **rebase / merge / cherry-pick / reset / revert / reflog**.
- Résoudre proprement des **conflits** (merge ou rebase).
- **Annuler** ou **déplacer** des commits en sécurité.
- **Nettoyer** un historique avant publication (squash, reword, rebase interactif).
- **Retrouver** du travail “perdu” avec **reflog**.

---

## Pourquoi manipuler l’historique ?

Pense chaque commit comme une photo du chantier. Manipuler l’historique, c’est **réordonner** les photos (squash, déplacer, retirer) pour raconter une histoire claire et **réversible**. Tu gagnes en :

- **Lisibilité** (histoire linéaire, commits propres),
- **Qualité** (on corrige sans bruit),
- **Sécurité** (on sait revenir en arrière).

---

## Défis courants (et comment les aborder)

- **Conflits de merge** : deux personnes modifient les mêmes lignes.
- **Commits sur la mauvaise branche** : tu as commité sur `main` au lieu de `feature/login`.
- **Historique illisible** : WIP, fix, update… à nettoyer avant PR.

On attaque ces cas avec les briques ci-dessous.

---

## 1) `git rebase` — “rebaser/rejouer” tes commits

**Idée** : prendre les commits de ta branche et **les rejouer au-dessus** d’une autre branche, comme si tu avais commencé plus tard.

```bash
# Mettre ta branche au niveau de main (histoire linéaire)
git switch feature/login
git fetch origin
git rebase origin/main
# Conflit ? Édite → git add <fichiers> → git rebase --continue
# Trop galère ? git rebase --abort

```

### Rebase vs Merge (quand choisir ?)

- **Rebase** = histoire **linéaire**, idéal **avant publication** (branches privées).
- **Merge** = **ne réécrit pas** l’histoire, idéal **après publication** (traçabilité).

> Règle d’or : ne rebase pas une branche déjà partagée (sauf accord), car tu changes l’historique des autres.
> 

### Rebase interactif : nettoyer avant PR

Regrouper/squasher/renommer des commits :

```bash
git rebase -i HEAD~5      # ouvre l’éditeur
# Remplace "pick" par :
#   squash (ou s)   -> fusionner avec commit précédent
#   fixup (ou f)    -> fusionner sans garder le message
#   reword (ou r)   -> éditer le message
#   drop (ou d)     -> supprimer le commit

```

Ensuite :

```bash
git push --force-with-lease   # si la branche était déjà poussée

```

> --force-with-lease protège contre l’écrasement involontaire du travail d’un collègue.
> 

---

## 2) `git cherry-pick` — “prendre cette cerise, pas le gâteau”

**Idée** : **appliquer un commit précis** (ou une série) d’une branche vers une autre, **sans** tout fusionner.

```bash
# Appliquer un seul commit sur release
git switch release
git cherry-pick 4f3a9c2

# Appliquer une plage continue (bornes incluses)
git cherry-pick a1b2c3d..d4e5f6g

# Appliquer plusieurs commits indépendants
git cherry-pick abc123 def456 ghi789

```

- Conflit ? Même procédure : édite → `git add` → `git cherry-pick --continue`.
- Annuler la tentative : `git cherry-pick --abort`.

**Usages typiques** : propager un **hotfix** de `main` vers `release/x`, réutiliser un petit patch ailleurs.

---

## 3) `git reset` — “reculer HEAD” (local, discret)

**Idée** : **repositionner HEAD** (et éventuellement l’index/working tree). Très puissant, donc on choisit le **bon mode** :

- `-soft` : recule HEAD, **garde** tout **stagé** → parfait pour **re-squasher**.
- `-mixed` (défaut) : recule HEAD, **unstage** les changements, mais **conserve** les fichiers modifiés.
- `-hard` : recule HEAD et **écrase** l’index et le working tree (⚠️ destructif).

```bash
git reset --soft  HEAD~1   # regrouper le dernier commit avec le précédent
git reset --mixed HEAD~1   # retirer le dernier commit mais garder le code pour corriger
git reset --hard  HEAD~1   # tout annuler (seulement si sûr)

```

> Utilise reset surtout avant de pousser (ou sur un clone/branche de travail).
> 

---

## 4) `git revert` — “annuler proprement” (public, traçable)

**Idée** : créer un **nouveau commit** qui **invalide** les changements d’un commit passé, **sans** réécrire l’historique. Idéal sur branches **partagées**.

```bash
git revert 1a2b3c4
# Plusieurs commits :
git revert --no-commit 9f8e7d6..4c3b2a1
git commit -m "Rollback de la fonctionnalité X"

```

> Revert n’efface rien : il ajoute un commit “inverse”. Parfait en prod.
> 

---

## 5) `git reflog` — ton **fil d’Ariane** local

**Idée** : Git garde un log **local** de tous les mouvements de HEAD (checkouts, resets, rebases…). C’est ici qu’on **rattrape** une gaffe.

```bash
git reflog                      # liste chronologique des HEAD
# Revenir temporairement à un état
git checkout HEAD@{3}
# Sauver définitivement :
git reset --hard HEAD@{3}       # ou crée une branche
git switch -c sauvetage HEAD@{3}

```

> Les entrées expirent (≈ 90 jours) : réagis vite quand tu dois récupérer.
> 

---

## 6) Résoudre les **conflits** sans stress

Quand Git s’arrête avec un conflit :

1. Ouvre le fichier, repère les marqueurs :
    
    ```
    <<<<<<< HEAD
    … ta version …
    =======
    … leur version …
    >>>>>>> branche-cible
    
    ```
    
2. Garde/compose la bonne version, **supprime** les marqueurs.
3. Marque résolu + poursuis :

```bash
git add chemins/concernés
# si merge :
git commit
# si rebase/cherry-pick :
git rebase --continue   # ou git cherry-pick --continue

```

**Abandonner** : `git merge --abort` / `git rebase --abort`.

**Astuces** :

- `git status` te rappelle **exactement** quoi faire.
- Outils graphiques de merge autorisés (VS Code, meld, kdiff3…).
- Petits commits → moins de conflits, plus simples à relire.

---

## 7) Nettoyer une branche avant PR (recette complète)

Objectif : une PR **courte et lisible**.

```bash
# 1) Mets-toi à jour
git fetch origin
git rebase origin/main

# 2) Nettoie les commits (squash/reword/drop)
git rebase -i origin/main

# 3) Vérifie l'historique final
git log --oneline --graph --decorate

# 4) Publie proprement
git push --force-with-lease

```

> Si l’équipe préfère éviter le rebase, fais un merge propre et éventuellement squash lors du merge de la PR (option “Squash and merge”).
> 

---

## 8) “Oups, j’ai commité sur la mauvaise branche”

Scénario : tu as commité sur `main` au lieu de `feature/login`.

```bash
# Partir de l'état fautif (sur main)
git switch -c feature/login      # crée une branche avec tes commits

# Revenir corriger main (retirer les commits en trop)
git switch main
git reset --hard origin/main     # si main a été poussée
# ou, si non poussé :
# git reset --hard HEAD~N        # recule de N commits

# Publier normalement :
git push -u origin feature/login

```

> Alternative plus fine : cherry-pick les commits fautifs vers la bonne branche, puis reset main.
> 

---

## 9) Annuler un merge raté (ou un rebase) — gestes sûrs

- Merge en cours et “ça dérape” :
    
    ```bash
    git merge --abort
    
    ```
    
- Rebase en cours :
    
    ```bash
    git rebase --abort
    
    ```
    
- Merge **déjà commité** mais mauvais :
    
    ```bash
    git revert -m 1 <hash_du_merge>
    
    ```
    
    > -m 1 indique le parent à conserver (généralement la branche de destination).
    > 

---

## 10) Décider vite : quelle commande pour quel besoin ?

- **Je veux une histoire propre avant PR** → `rebase -i` (squash/reword/drop), puis `push --force-with-lease`.
- **Je veux prendre 1 commit précis d’ailleurs** → `cherry-pick`.
- **Je veux reculer localement** (avant push) → `reset --soft|--mixed`.
- **Je dois annuler publiquement** (déjà poussé) → `revert`.
- **J’ai “perdu” quelque chose** → `reflog` puis `checkout`/`reset`/`switch -c`.

> En doute ? Fais-le sur une branche de travail ou clone le dépôt et teste.
> 

---

## 11) Bonnes pratiques “incassables”

- Travaille par **petits commits** → facile à lire/annuler.
- Message = **quoi + pourquoi** (ou style Conventional Commits).
- Rebase **avant** de publier, pas **après** (sauf accord).
- Utilise `-force-with-lease` (jamais `-force` “nu”).
- Vérifie toujours `git log --oneline --graph --decorate --all` avant push.
- En cas de conflit récurrent : rebase **souvent** (intégration continue).

---

## 12) Mini-TP (rapide et utile)

### TP1 — Nettoyer une branche

1. Crée 4-5 micro-commits “WIP”.
2. `git rebase -i HEAD~5` → `squash` les WIP, `reword` le message final.
3. `git push --force-with-lease`.

### TP2 — Rattraper une boulette

1. Fais un `reset --hard` par erreur.
2. `git reflog` → retrouve l’ancien HEAD.
3. `git reset --hard HEAD@{n}` → récupère tout.

### TP3 — Hotfix ciblé

1. Sur `main`, corrige un bug → commit.
2. `git switch release/x` → `git cherry-pick <hash>` → publie.

---

## 13) Mémo express (copier-coller)

```bash
# Rebase (linéariser / mettre à jour / nettoyer)
git fetch origin
git rebase origin/main
git rebase -i HEAD~N
git rebase --continue | --abort

# Cherry-pick (prendre 1 ou plusieurs commits)
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
[← Module précédent](003_git-manipulation.md)
---
