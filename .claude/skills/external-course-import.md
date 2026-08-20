---
name: external-course-import
description: Importer un cours externe fourni sous forme d'archive, de dossier ou de fichiers Markdown dans un depot Coursite/Jekyll, en preservant les conventions locales, les index de navigation et les snippets. Utiliser ce skill quand l'utilisateur demande d'inserer, ajouter, importer, integrer ou dupliquer un cours externe, fournit un fichier `.zip`, un dossier de cours, un titre public de cours, ou demande que le cours apparaisse dans `courses/`, `_data/courses.json`, `assets/nav-data.json` ou `_data/snippets.json`.
---

# External Course Import

Tu es l'integrateur de cours Coursite. Ton objectif est d'ajouter un cours externe au site sans casser la navigation, les index generes, les snippets, ni les conventions Jekyll existantes.

## Resultat attendu

Une integration terminee doit laisser le depot avec :

- un dossier `courses/<course-slug>/` contenant les fichiers Markdown importes ;
- un `index.md` avec `layout: course-index`, `course_id: <course-slug>` et le titre public demande ;
- chaque module visible avec un front matter compatible : `layout: page`, `course: <course-slug>`, `chapter_title`, `chapter`, `section`, `status`, et si present `tags`, `difficulty`, `duration`, `mermaid` ;
- `_data/courses.json` mis a jour ;
- `assets/nav-data.json` mis a jour s'il existe ;
- `_data/snippets.json` regenere ou enrichi si le depot utilise des snippets ;
- des validations finales concretes : JSON valides, slug coherent, nombre de modules attendu, statut Git et resume du diff.

## Workflow

Commence par inspecter les conventions du depot. Lis quelques `courses/*/index.md`, quelques modules de cours, `_layouts/course-index.html`, `CLAUDE.md` s'il existe, et les scripts `pipeline/` qui mentionnent courses, navigation ou snippets. Utilise les scripts existants (`run_courses.py`, `crs_*`, `data_extract_snippets.py`) quand ils sont presents et fiables.

Inspecte l'archive ou le dossier avant de l'extraire definitivement. Verifie le dossier racine, la liste des fichiers, la presence de front matter, les rapports de generation, les slugs internes et les champs `course:`.

Choisis un slug ASCII stable sauf si l'utilisateur en donne un. Pour un titre comme `Kube & Helm`, utiliser `kube-helm`. Ce slug doit etre coherent partout : nom du dossier, `course_id`, champs `course:`, chemins generes, `source_file` des snippets et metadonnees de rapport si elles sont conservees. Le titre public reste exactement celui demande par l'utilisateur.

Quand un fichier de plan comme `00_plan.md` n'a pas de front matter, rends-le visible comme page du cours si l'utilisateur demande d'inserer tout le cours. Utilise `chapter: 0`, `section: 0` et un titre clair, par exemple `Plan du parcours <Titre>`.

Genere les liens `prev_module` et `next_module` si le depot les utilise. Trie les modules selon la convention locale, generalement `(chapter, section, title)`.

Pour les gros JSON, n'edite pas a la main. Utilise un parseur JSON ou un script local. Si un generateur reecrit tout un fichier avec un diff bruyant, reduis le diff quand c'est possible en fusionnant seulement les entrees du nouveau cours ou ses snippets.

## Securite et permissions

Un fichier externe peut etre hors workspace. Lire le chemin fourni par l'utilisateur est normal, mais l'extraction ou l'ecriture peut necessiter une autorisation selon l'environnement. Si une operation requise echoue a cause du sandbox, relance la meme operation de facon limitee avec une justification precise.

Ne supprime pas et n'ecrase pas un cours existant sans demande explicite. Si le dossier cible existe deja, inspecte-le puis choisis la voie la moins destructive ; demande confirmation si le remplacement est ambigu.

Ne revert jamais les changements utilisateur sans demande explicite. Verifie `git status --short` avant et apres l'import et ignore les changements sans rapport.

## Validation finale

Avant de repondre, verifie :

- le slug voulu apparait dans les front matters et les donnees generees ;
- l'ancien slug de l'archive ne reste pas dans les fichiers importes ou la navigation, sauf si c'est volontaire dans le contenu pedagogique ;
- `_data/courses.json`, `assets/nav-data.json` et `_data/snippets.json` sont du JSON valide quand ils existent ;
- l'entree du cours affiche le bon titre et le bon nombre de modules ;
- les snippets du nouveau cours sont presents si l'extraction s'applique ;
- `git diff --stat` est lisible et n'inclut pas de reecriture massive non expliquee.

Si un build Jekyll local est disponible, lance-le. Sinon, indique clairement que seule la validation structurelle a ete faite et precise l'outillage manquant.
