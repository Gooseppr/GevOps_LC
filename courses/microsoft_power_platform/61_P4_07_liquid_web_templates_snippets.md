---
layout: page
title: "Liquid templates : web templates et content snippets"

course: microsoft_power_platform
chapter_title: "Power Pages"

chapter: 4
section: 5

tags: power pages, liquid, web templates, content snippets, portals
difficulty: intermediate
duration: 90
mermaid: false

status: "published"
prev_module: "/courses/microsoft_power_platform/59_P4_05_authentification_identite_externe.html"
prev_module_title: "Authentification et identité externe dans Power Pages"
next_module: "/courses/microsoft_power_platform/64_P4_10_performance_seo_exploitation.html"
next_module_title: "Performance, SEO et exploitation — Diagnostiquer et optimiser vos solutions Power Pages"
---

{% raw %}
# Liquid templates : web templates et content snippets

## Objectifs pédagogiques

À l'issue de ce module, vous serez capable de :

1. **Créer** un web template réutilisable et l'inclure dans une mise en page Power Pages
2. **Organiser** une hiérarchie de templates avec `{% include %}` et comprendre la résolution des variables
3. **Lire et modifier** un content snippet depuis l'interface Studio et depuis un template Liquid
4. **Choisir** entre web template, content snippet et page template grâce à une matrice de décision claire
5. **Diagnostiquer** les erreurs de rendu et appliquer une stratégie de debugging systématique

---

## Mise en situation

Vous travaillez sur un portail client Power Pages pour une société de services. La structure de base existe déjà — pages, thème, navigation. Le client revient avec deux demandes en apparence simples :

> "On aimerait que le bloc 'Nos coordonnées' apparaisse sur plusieurs pages, mais que le marketing puisse mettre à jour l'adresse sans passer par vous."
> "Et le footer avec les liens légaux, on veut qu'il soit identique partout, généré une seule fois."

Ces deux demandes pointent vers deux mécanismes distincts : les **content snippets** pour le contenu éditable par des non-développeurs, et les **web templates** pour les fragments de mise en page réutilisables.

Mais avant d'aller plus loin, une troisième question émerge naturellement : *et si l'adresse affichée devait dépendre de la région ou du compte de l'utilisateur connecté ?* Ce cas, plus subtil, force un choix d'architecture différent — on y reviendra.

---

## Pourquoi deux systèmes différents ?

La distinction n'est pas arbitraire. Elle reflète deux responsabilités qui ne doivent pas se mélanger.

Un **web template**, c'est de la structure — du Liquid, du HTML, de la logique. C'est du code que vous écrivez une fois et que vous réutilisez. Si vous voulez que quelqu'un du marketing le modifie, il faut qu'il ouvre Studio, navigue dans les templates, et sache ce qu'il fait. Ce n'est pas conçu pour l'édition en libre-service.

Un **content snippet**, c'est un fragment de contenu — texte, HTML minimal — stocké comme un enregistrement Dataverse dans `adx_contentsnippet`. Il est conçu pour être modifiable directement depuis Studio, sans toucher au code. Un rédacteur peut changer le contenu d'un snippet sans jamais voir une ligne de Liquid.

🧠 **La règle d'or :** si c'est de la **structure et de la logique**, utilisez un web template. Si c'est du **contenu éditorial** que quelqu'un d'autre que vous devra maintenir, utilisez un content snippet.

---

## Web templates : construire des composants réutilisables

### Ce qu'est vraiment un web template

Dans Power Pages, un web template est un enregistrement dans `adx_webtemplate`. Il contient un champ `source` qui accepte du Liquid pur — pas une page complète, juste le fragment à rendre. Ce template peut ensuite être :

- associé à un **page template** (qui devient la mise en page d'une ou plusieurs pages web),
- ou inclus dans un autre template via `{% include %}`.

Le page template fait le lien entre le web template et les pages du portail. Il dit en substance : "pour les pages de ce type, utilise ce web template comme rendu."

### Créer un web template dans le Studio

Dans Power Pages Studio, allez dans **… > Web templates** (accessible via le panneau avancé). Cliquez sur **Nouveau**, donnez un nom parlant — `footer-legal` par exemple — et rédigez votre Liquid dans le champ source.

Un web template minimaliste pour un footer :

```liquid
<!-- web template : footer-legal -->
<footer class="portal-footer">
  <ul class="legal-links">
    {% for link in weblinks %}
      <li><a href="{{ link.url }}">{{ link.name }}</a></li>
    {% endfor %}
  </ul>
  <p class="footer-copy">
    © {{ 'now' | date: '%Y' }} — Tous droits réservés
  </p>
</footer>
```

Le template ne contient pas de `<html>`, `<head>` ou `<body>` — c'est un fragment. La page complète est assemblée par le moteur de rendu du portail.

### Inclure un web template dans un autre

Liquid dans Power Pages expose une balise `{% include %}` étendue qui référence un autre web template par son nom :

```liquid
{% include 'footer-legal' %}
```

🧠 La résolution se fait par le **nom exact** du web template (champ `adx_name`), sensible à la casse et aux espaces. Si le template n'est pas trouvé, Power Pages ne lève pas d'erreur visible — il rend silencieusement du vide. C'est un piège classique, détaillé dans la section Debugging plus bas.

Vous pouvez aussi passer des paramètres à l'include :

```liquid
{% include 'card-contact'
   title: entity.name
   email: entity.emailaddress1
   phone: entity.telephone1 %}
```

Dans le template `card-contact`, ces paramètres sont accessibles directement dans le scope :

```liquid
{% comment %}
  Paramètres attendus :
  - title  : string — nom du contact (obligatoire)
  - email  : string — adresse email (optionnel)
  - phone  : string — numéro de téléphone (optionnel)
{% endcomment %}
<div class="contact-card">
  <h3>{{ title }}</h3>
  <p>📧 {{ email }}</p>
  <p>📞 {{ phone }}</p>
</div>
```

💡 Les variables passées via `include` ne polluent pas le scope parent. Une fois sorti du template inclus, elles n'existent plus — chaque include est autonome.

### Créer un page template et le lier

Pour qu'un web template serve de mise en page à des pages du portail, il faut créer un **page template** qui le référence :

1. Dans Studio ou la configuration avancée, allez dans **Page templates > Nouveau**
2. Donnez un nom (`Layout deux colonnes`, `Layout article`, etc.)
3. Dans le champ **Web template**, sélectionnez votre web template
4. Choisissez **Type = Web template** (pas Rewrite)

Toutes les pages assignées à ce page template rendront le même Liquid.

---

## Content snippets : le contenu éditable sans code

### Principe et stockage

Un content snippet est stocké dans `adx_contentsnippet` avec trois champs essentiels :

| Champ | Rôle |
|---|---|
| `adx_name` | Identifiant unique utilisé dans Liquid |
| `adx_value` | Le contenu (texte ou HTML) |
| `adx_type` | `Text` ou `Html` — détermine l'échappement à l'affichage |

Quand un snippet est de type `Html`, Power Pages le rend tel quel sans échapper les balises. Quand il est de type `Text`, le contenu est traité comme du texte brut — les `<b>` s'affichent comme du texte, pas en gras. Ce détail a son importance dès que vous mettez du HTML dans vos snippets.

### Lire un snippet depuis Liquid

```liquid
{{ snippets['adresse-siege'] }}
```

La notation bracket est nécessaire parce que les noms de snippets contiennent souvent des tirets ou des slashs, qui ne sont pas des caractères valides dans la notation pointée de Liquid.

Power Pages gère l'échappement automatiquement selon le type du snippet. Vous n'avez pas à appliquer le filtre `raw` manuellement — si vous le faites sur un snippet `Html`, vous obtiendrez le HTML brut affiché en tant que texte.

⚠️ Si le snippet n'existe pas, `snippets['nom']` retourne `nil` sans erreur. Protégez toujours l'affichage avec une condition :

```liquid
{% if snippets['bandeau-promo'] %}
  <div class="promo-banner">
    {{ snippets['bandeau-promo'] }}
  </div>
{% endif %}
```

### Créer et modifier un snippet depuis Studio

Dans Power Pages Studio, accédez à **Content snippets** (via Paramètres avancés ou le panneau de configuration). Cliquez sur **Nouveau snippet**, saisissez le nom exact — c'est ce nom qui sera utilisé dans le Liquid — choisissez le type, et rédigez le contenu.

💡 Une bonne convention de nommage évite beaucoup de confusion. Préfixez vos snippets par zone fonctionnelle : `footer/mentions-legales`, `home/tagline`, `contact/adresse-principale`. Les slashs sont une convention recommandée pour organiser la liste — ils ne sont pas imposés par le système, mais ils rendent la recherche dans Studio nettement plus lisible.

Les snippets peuvent aussi être multilingues : chaque snippet peut avoir une valeur par langue activée sur le portail. Le bon snippet est automatiquement servi selon la langue active de l'utilisateur — rien à gérer côté Liquid, la résolution est transparente.

---

## Matrice de décision : web template, content snippet ou logique Liquid native ?

C'est souvent là que les décisions deviennent moins évidentes. Voici un tableau de référence pour trancher rapidement :

| Situation | Recommandation |
|---|---|
| Fragment HTML structurel réutilisé sur plusieurs pages (card, sidebar, footer) | **Web template** inclus via `{% include %}` |
| Contenu texte ou HTML simple modifiable par un non-développeur (adresse, slogan, bandeau) | **Content snippet** |
| Logique conditionnelle simple dans une page (if/else selon variable) | **Liquid natif** dans le web template courant |
| Contenu qui varie selon la langue | **Content snippet** — la résolution multilingue est automatique |
| Contenu qui varie selon le rôle ou les données Dataverse de l'utilisateur | **Web template** avec logique Liquid (fetchxml ou `user`, `entity`) |
| Layout complet assigné à un type de page | **Page template → Web template** |
| Valeur dynamique issue d'une requête Dataverse (compte, région, préférence) | **Web template** avec `{% fetchxml %}` ou accès à `entitylist` / `entity` |

### Le cas non évident : une adresse qui dépend du compte utilisateur

Reprenons la demande initiale : "le marketing veut modifier l'adresse facilement." Un content snippet fonctionne parfaitement — jusqu'au jour où le client précise : "En fait, l'adresse doit dépendre de la région du compte de l'utilisateur connecté."

Ce cas change tout. Un content snippet est une valeur statique stockée en Dataverse — il ne peut pas être conditionnel par utilisateur sans logique Liquid. La bonne approche devient un web template qui interroge Dataverse :

```liquid
{% comment %}
  Affiche l'adresse du bureau selon la région du compte utilisateur connecté.
  Fallback sur le snippet 'contact/adresse-siege' si aucun compte associé.
{% endcomment %}
{% if user and user.parentcustomerid %}
  {% assign compte = user.parentcustomerid %}
  <address>
    Bureau {{ compte.address1_city }}<br>
    {{ compte.address1_line1 }}<br>
    {{ compte.address1_postalcode }} {{ compte.address1_city }}
  </address>
{% elsif snippets['contact/adresse-siege'] %}
  {{ snippets['contact/adresse-siege'] }}
{% else %}
  <p>Coordonnées non disponibles.</p>
{% endif %}
```

Ici, le content snippet joue le rôle de fallback — il reste utile, mais la logique principale est dans le web template. Les deux mécanismes se complètent plutôt qu'ils ne s'excluent.

---

## Combiner les deux : exemple complet

On veut un bloc "Coordonnées" dans la sidebar de plusieurs pages, avec une adresse que le marketing peut modifier dans le cas standard.

**Step 1 — Le content snippet `contact/adresse`**

Dans Studio, créez un snippet de type `Html` :
```html
<address>
  42 rue de la Paix<br>
  75001 Paris<br>
  <a href="tel:+33100000000">01 00 00 00 00</a>
</address>
```

**Step 2 — Le web template `sidebar-contact`**

```liquid
{% comment %}
  Paramètres attendus : aucun
  Affiche le snippet contact/adresse avec fallback.
  Si utilisateur connecté, ajoute un message personnalisé.
{% endcomment %}
<aside class="sidebar-contact">
  <h2>Nous contacter</h2>

  {% if snippets['contact/adresse'] %}
    {{ snippets['contact/adresse'] }}
  {% else %}
    <p>Coordonnées non disponibles.</p>
  {% endif %}

  {% if user %}
    <p>Bonjour {{ user.fullname }}, votre chargé de compte vous répondra sous 24h.</p>
  {% endif %}
</aside>
```

**Step 3 — Inclusion dans le layout principal**

```liquid
<!-- web template : layout-deux-colonnes -->
<div class="container">
  <main class="content-area">
    {{ content }}
  </main>
  {% include 'sidebar-contact' %}
</div>
```

Le marketing modifie l'adresse en touchant uniquement le snippet. Vous gérez la structure dans le web template. Personne ne marche sur les plates-bandes de l'autre.

---

## Caching, performance et déploiement

Ces aspects sont rarement documentés dans les formations, mais ils influencent directement vos décisions d'architecture.

### Quand Power Pages évalue-t-il le Liquid ?

Power Pages évalue le Liquid **côté serveur, à chaque requête** — il n'y a pas de pré-compilation statique des templates. Cela signifie que :

- Un web template complexe avec plusieurs `{% include %}` imbriqués et des requêtes Dataverse ajoute de la latence à chaque chargement de page.
- Un content snippet simple est résolu en lecture directe depuis le cache Dataverse — généralement plus rapide qu'un include avec logique.

### Caching des snippets et des templates

Power Pages applique un **cache côté portail** pour les données Dataverse fréquemment lues, dont les content snippets. La durée de cache varie selon la configuration du portail, mais une modification de snippet dans Studio peut prendre quelques minutes avant d'être visible en production.

Pour les web templates, le source Liquid est rechargé à la modification, mais l'effet est immédiat — il n'y a pas de compilation mise en cache entre les requêtes.

**Implication pratique :** si vous avez des données très dynamiques (statut en temps réel, stock), un content snippet n'est pas le bon outil — utilisez un web template avec une requête Dataverse directe, ou une solution JavaScript côté client.

### Versioning et déploiement multi-environnement

⚠️ Power Pages **n'a pas de versioning natif** sur les web templates et les content snippets. Une modification en production est immédiate et irréversible depuis l'interface Studio.

La bonne pratique est de gérer les templates via la **solution Dataverse** associée au portail :

1. Travaillez dans un environnement de développement
2. Les web templates, page templates et content snippets sont des composants de solution — exportez la solution non managée vers staging, puis managée vers production
3. Ne modifiez jamais un web template directement en production sans passer par ce cycle

Pour les snippets éditoriaux (adresses, slogans) qui doivent être modifiables en production par des non-développeurs, documentez explicitement qu'ils sont hors cycle ALM — et assurez-vous qu'ils existent dans tous les environnements avec une valeur de fallback cohérente.

---

## Debugging : méthode systématique

Quand un template ne rend pas ce que vous attendez, la difficulté est que **Liquid dans Power Pages échoue souvent silencieusement** — pas d'erreur visible, juste du vide ou du contenu manquant. Voici une méthode en trois étapes.

### Étape 1 — Vérifier que le template existe et est bien nommé

La cause la plus fréquente d'un `{% include %}` vide est un nom qui ne correspond pas exactement au champ `adx_name` du web template.

**Méthode :** dans Studio, ouvrez la liste des web templates et copiez-collez le nom exact dans votre `{% include %}`. Ne retapez pas à la main. Vérifiez les espaces en début et fin de nom.

### Étape 2 — Isoler le template problématique

Si vous avez plusieurs includes imbriqués et que la zone est vide, isolez le problème en remplaçant temporairement l'include par un texte statique :

```liquid
{% comment %} TEST : remplace l'include pour isoler le problème {% endcomment %}
<p>DEBUG — ici devrait s'afficher sidebar-contact</p>
```

Si le texte statique s'affiche, le problème est dans le template inclus. Si même le texte statique n'apparaît pas, le problème est en amont (page template mal assigné, page qui n'utilise pas ce web template).

### Étape 3 — Inspecter les variables

Si une variable est inattendue ou vide, ajoutez temporairement un bloc d'inspection :

```liquid
{% comment %} DEBUG — à supprimer avant déploiement {% endcomment %}
<pre>
  user : {{ user | json }}
  snippets['contact/adresse'] : {{ snippets['contact/adresse'] }}
  title (paramètre include) : {{ title }}
</pre>
```

Le filtre `json` permet d'afficher la structure complète d'un objet Liquid — utile pour déboguer les objets `user`, `entity`, ou les résultats d'une requête `fetchxml`.

**Rappel :** retirez systématiquement ces blocs debug avant de pousser vers staging ou production.

---

## Limites de Liquid dans Power Pages

Liquid est un langage de templating, pas un langage de programmation. Connaître ses limites évite de mauvaises surprises.

**Pas de fonctions définissables.** Vous ne pouvez pas créer une fonction réutilisable en Liquid. Un web template est le plus proche équivalent — c'est un fragment réutilisable, mais sans signature formelle, sans type, sans validation des paramètres.

**Pas de surcharge ni de typage.** Les paramètres passés à un `{% include %}` sont tous des variables Liquid non typées. Si vous passez un nombre là où le template attend une chaîne, il n'y a pas d'erreur — juste un résultat potentiellement inattendu.

**Pas de gestion d'exception.** Si un `{% include %}` référence un template inexistant, Power Pages ne lève pas d'exception — il rend du vide. Si une variable est `nil`, l'accès à ses attributs retourne `nil` en cascade, sans erreur visible.

**Erreur dans un include → vide, pas d'erreur remontée.** Si le Liquid dans un template inclus contient une syntaxe invalide, le rendu peut échouer silencieusement sur la zone concernée. La stratégie de debugging décrite ci-dessus reste votre meilleur outil.

**Liquid ne peut pas appeler Power Automate directement.** Pour déclencher une action depuis une page, vous passez soit par un formulaire Dataverse, soit par la Web API Power Pages côté JavaScript (couverte dans le module suivant).

---

## Erreurs fréquentes

**Template inclus qui ne rend rien**

*Cause :* Le nom dans l'include ne correspond pas exactement au champ `adx_name` (espace, casse, faute de frappe).
*Correction :* Copiez-collez le nom depuis la liste Studio. Vérifiez via la méthode d'isolation décrite dans la section Debugging.

---

**Snippet qui affiche du HTML brut (`<b>Texte</b>` visible)**

*Cause :* Le snippet est configuré en type `Text` alors qu'il contient du HTML.
*Correction :* Éditez le snippet dans Studio et changez le type de `Text` à `Html`. Pas besoin de modifier le Liquid.

---

**Variable passée à `include` non reconnue**

*Cause :* Nom de variable avec tiret (`contact-email`) — les tirets ne sont pas valides dans les identifiants Liquid.
*Correction :* Utilisez des underscores : `contact_email`.

---

**Modification de snippet non visible en production**

*Cause :* Cache portail — les snippets sont mis en cache côté Power Pages.
*Correction :* Attendez quelques minutes ou forcez un rechargement via l'outil d'administration du portail. Pour les données temps réel, n'utilisez pas de snippets.

---

## Bonnes pratiques

**Nommez vos templates comme des composants, pas comme des pages.** Un nom comme `page-accueil` est fragile — si le template est ensuite réutilisé ailleurs, le nom devient trompeur. Préférez des noms fonctionnels : `card-produit`, `sidebar-filtres`, `hero-bandeau`.

**Un web template = une responsabilité.** Si votre template dépasse 80-100 lignes, c'est souvent le signe qu'il devrait être découpé en plusieurs includes. Ça facilite les tests, la réutilisation, et la lisibilité.

**Documentez les paramètres attendus en tête de chaque include.** Liquid n'a pas de signature de fonction. Un bloc `{% comment %}` avec la liste des variables attendues (nom, type, obligatoire/optionnel) compense cette absence.

**Pour les snippets, prévoyez toujours un fallback.** Un snippet peut être supprimé par accident ou ne pas encore exister dans un environnement de dev. Trois lignes d'if/else évitent un trou visible en production.

**Préférez les snippets aux valeurs codées en dur dans les templates.** Toute chaîne susceptible de changer — numéro de téléphone, email de contact, accroche marketing — mérite d'être un snippet. Ça évite de toucher au code pour des changements éditoriaux.

**Gérez les web templates dans une solution Dataverse.** Sans ça, vous n'avez pas de versioning, pas d'historique, et les déploiements vers staging/production sont risqués.

---

## Résumé

| Concept | Ce qu'il fait | À retenir |
|---|---|---|
| **Web template** | Fragment Liquid/HTML réutilisable, associé à un page template ou inclus via `{% include %}` | Stocké dans `adx_webtemplate`, résolu par nom exact — sensible à la casse |
| **`{% include 'nom' %}`** | Rend un autre web template au sein du template courant | Accepte des paramètres nommés, scope isolé, échec silencieux si nom inexact |
| **Content snippet** | Fragment de contenu éditorial stocké en Dataverse, modifiable sans code | Accessible via `snippets['nom']`, type `Text` ou `Html`, mis en cache |
| **Page template** | Fait le lien entre un web template et les pages du portail | Un page template = un web template de référence |
| **Multilingue** | Les snippets sont automatiquement servis dans la langue active | Pas de logique Liquid à écrire, résolution transparente |
| **Caching** | Les snippets sont mis en cache côté portail | Modification visible avec un délai — ne pas utiliser pour données temps réel |
| **Versioning** | Pas de versioning natif dans Studio | Gérer via solution Dataverse + cycle Dev/Staging/Prod |

Pour structurer un portail maintenable, la règle reste simple : mettez la logique et la structure dans les web templates, mettez le contenu éditorial dans les snippets. Quand le contenu dépend de données utilisateur ou de conditions métier, c'est un web template avec logique Liquid — le snippet peut rester comme fallback. Les deux mécanismes sont conçus pour se compléter, pas pour se remplacer.

Le module suivant couvre la Web API Power Pages pour les opérations CRUD côté JavaScript — une couche supplémentaire pour les expériences plus dynamiques que Liquid seul ne peut pas offrir.

---

<!-- snippet
id: powerpages_webtemplate_include
type: command
tech: Power Pages
level: intermediate
importance: high
format: knowledge
tags: liquid, web templates, include, power pages, portails
title: Inclure un web template dans un autre
context: Dans le champ source d'un web template Power Pages
command: {% include '<NOM_TEMPLATE>' param1: <VALEUR1> param2: <VALEUR2> %}
example: {% include 'card-contact' title: entity.name email: entity.emailaddress1 %}
description: Résolution par nom exact (adx_name) — sensible à la casse. Si le template n'existe pas, rendu silencieux (vide, sans erreur). Paramètres séparés par espace, pas de virgule avant le dernier.
-->

<!-- snippet
id: powerpages_snippet_afficher
type: command
tech: Power Pages
level: intermediate
importance: high
format: knowledge
tags: liquid, content snippets, power pages, portails
title: Afficher un content snippet en Liquid
context: Dans le champ source d'un web template Power Pages
command: {{ snippets['<NOM_SNIPPET>'] }}
example: {{ snippets['contact/adresse-siege'] }}
description: Notation bracket obligatoire si le nom contient des tirets ou slashs. Les slashs dans le nom sont une convention recommandée pour organiser les snippets, pas une obligation système. Power Pages gère l'échappement selon le type (Text/Html).
-->

<!-- snippet
id: powerpages_snippet_fallback
type: tip
tech: Power Pages
level: intermediate
importance: high
format: knowledge
tags: liquid, content snippets, robustesse, power pages
title: Toujours prévoir un fallback pour les snippets
content: Un snippet absent retourne nil sans erreur — la zone s'affiche vide. Protégez chaque snippet avec {% if snippets['nom'] %}...{% else %}<p>Contenu par défaut</p>{% endif %}. Coûte 3 lignes, évite un trou visible en production ou dans un environnement de dev où le snippet n'a pas encore été créé.
description: snippets['nom'] retourne nil si l'enregistrement est absent ou supprimé — une condition if/else évite l'affichage d'une zone vide sans explication.
-->

<!-- snippet
id: powerpages_snippet_type_html
type: warning
tech: Power Pages
level: intermediate
importance: high
format: knowledge
tags: liquid, content snippets, html, type, power pages
title: Snippet qui affiche du HTML brut visible
content: Piège : si un snippet contient des balises HTML mais est configuré en type Text, les balises s'affichent en clair (<b>texte</b> visible). Correction : changer le type du snippet de Text à Html dans Studio — pas de modification Liquid nécessaire. Ne pas appliquer le filtre raw manuellement sur un snippet Html, ce qui produirait l'effet inverse.
description: Le type Text échappe le contenu HTML. Un snippet contenant du markup doit être de type Html pour que les balises soient interprétées par le navigateur.
-->

<!-- snippet
id: powerpages_include_scope_isole
type: concept
tech: Power Pages
level: intermediate
importance: medium
format: knowledge
tags: liquid, web templates, include, scope, variables
title: Les paramètres passés à include ont un scope isolé
content: Les variables passées via {% include 'template' var: valeur %} existent uniquement dans le template inclus. Une fois le rendu terminé, elles disparaissent du scope appelant. Aucun effet de bord possible entre composants — chaque include est autonome. Corollaire : vous ne pouvez pas modifier une variable du template parent depuis un include.
description: Le scope des paramètres include est strictement local au template inclus. Aucune variable ne fuit vers le template parent après le rendu.
-->

<!-- snippet
id: powerpages_webtemplate_nommage
type: tip
tech: Power Pages
level: intermediate
importance: medium
format: knowledge
tags: liquid, web templates, conventions, nommage, maintenabilité
title: Nommer les web templates comme des composants, pas des pages
content: Évitez les noms comme page-accueil ou template-services — si le composant est réutilisé ailleurs, le nom devient trompeur. Préférez des noms fonctionnels : card-produit, sidebar-filtres, hero-bandeau. Pour les snippets, utilisez un préfixe de zone : footer/mentions-legales, home/tagline. Les slashs dans les noms de snippets sont une convention organisationnelle, pas une contrainte système.
description: Un nommage fonctionnel (card-produit, sidebar-filtres) reste pertinent quelle que soit la page qui utilise le composant, contrairement à un nom de page.
-->

<!-- snippet
id: powerpages_webtemplate_documentation_params
type: tip
tech: Power Pages
level: intermediate
importance: medium
format: knowledge
tags: liquid, web templates, documentation, paramètres, maintenabilité
title: Documenter les paramètres attendus en tête de web template
content: Liquid n'a pas de signature de fonction — pas de types, pas de validation, pas d'erreur si un paramètre attendu est absent. Ajoutez un bloc {% comment %} en haut de chaque template inclus listant les variables attendues (nom, type, obligatoire/optionnel). Exemple : {% comment %} Paramètres : title (string, obligatoire), email (string, optionnel) {% endcomment %}
description: Sans documentation explicite, les paramètres d'un include sont invisibles à un autre développeur — un commentaire en tête de template compense l'absence de signature formelle.
-->

<!-- snippet
id: powerpages_decision
{% endraw %}
