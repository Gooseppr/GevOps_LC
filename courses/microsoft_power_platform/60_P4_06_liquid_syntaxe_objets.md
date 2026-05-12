---
layout: page
title: "Liquid templates : syntaxe et objets"

course: microsoft_power_platform
chapter_title: "Power Pages — Portails et expériences web"

chapter: 4
section: 2

tags: liquid, power pages, templates, syntaxe, objets, portail
difficulty: intermediate
duration: 90
mermaid: false

status: "published"
prev_module: "/courses/microsoft_power_platform/57_P4_03_formulaires_listes_dataverse.html"
prev_module_title: "Formulaires et listes Dataverse dans Power Pages"
next_module: "/courses/microsoft_power_platform/56_P4_02_premier_site_power_pages.html"
next_module_title: "Premier site Power Pages"
render_with_liquid: false
---

# Liquid templates : syntaxe et objets

## Objectifs pédagogiques

À la fin de ce module, vous serez capable de :

1. **Distinguer** les trois types de balises Liquid et savoir quand utiliser chacun
2. **Écrire** des expressions Liquid pour afficher, filtrer et transformer des données Dataverse
3. **Utiliser** les objets globaux Liquid disponibles dans Power Pages (`page`, `user`, `request`, `entities`)
4. **Construire** des structures conditionnelles et itératives pour générer du contenu dynamique
5. **Identifier et corriger** les erreurs les plus fréquentes dans un template Liquid

---

## Mise en situation

Vous rejoignez un projet de portail Power Pages pour un client du secteur immobilier. Le portail doit afficher une liste des biens disponibles à la location — chacun est une ligne dans la table Dataverse `cr_bien_immobilier`. La page doit aussi personnaliser l'accueil avec le prénom de l'utilisateur connecté, et masquer certains éléments si l'utilisateur n'est pas authentifié.

Pas de JavaScript côté serveur ici, pas de C#. Tout ce rendu dynamique repose sur Liquid — le moteur de templates embarqué dans Power Pages. Ce module vous donne les outils pour l'écrire correctement.

---

## Contexte : pourquoi Liquid dans Power Pages ?

Power Pages génère des pages web à partir de contenu stocké dans Dataverse. Mais une page statique ne suffit pas : vous voulez afficher le nom de l'utilisateur connecté, itérer sur une liste de résultats, afficher un message conditionnel. Pour ça, il faut un langage côté serveur.

Power Pages a choisi **Liquid**, un langage de templates open source créé par Shopify. C'est un bon choix pour un portail : Liquid est pensé pour les personnes qui écrivent du HTML mais ont besoin d'un peu de logique — sans ouvrir une session de développement back-end.

🧠 **Liquid est évalué côté serveur**, avant que le HTML arrive au navigateur. Ce que vous écrivez en Liquid disparaît du code source final — le visiteur ne voit jamais `{{ user.fullname }}`, il voit "Marie Dupont". C'est fondamentalement différent de JavaScript.

La version de Liquid dans Power Pages est une **extension de DotLiquid**, adaptée par Microsoft avec des objets spécifiques à la plateforme. La syntaxe de base reste standard, mais les objets disponibles sont propres à Power Pages — vous ne les trouverez pas dans la documentation Shopify.

---

## Les trois types de balises Liquid

Tout en Liquid repose sur trois constructions syntaxiques. Apprenez-les bien : elles couvrent 100 % des cas.

### `{{ ... }}` — Affichage

Affiche la valeur d'une variable ou d'une expression. C'est la balise la plus utilisée.

```liquid
{{ page.title }}
{{ user.fullname }}
{{ "bonjour" | upcase }}
```

Rien de plus. Ce qui est entre les doubles accolades est évalué, et le résultat remplace la balise dans le HTML.

### `{% ... %}` — Logique

Contient des instructions qui ne produisent rien directement : conditions, boucles, affectations, inclusions.

```liquid
{% if user %}
  Bonjour {{ user.fullname }} !
{% else %}
  Vous n'êtes pas connecté.
{% endif %}
```

Ces balises structurent le template mais n'émettent pas de texte elles-mêmes.

### `{# ... #}` — Commentaire

Tout ce qui est entre ces balises est ignoré à l'exécution. Utile pour documenter un template ou désactiver temporairement un bloc.

```liquid
{# Ce bloc s'affiche uniquement pour les propriétaires de bien #}
```

💡 Les commentaires Liquid ne s'affichent **pas** dans le code source HTML rendu — contrairement aux commentaires HTML `<!-- -->`.

---

## Syntaxe fondamentale : variables, filtres, opérateurs

### Déclarer et affecter une variable

```liquid
{% assign titre_page = "Nos biens disponibles" %}
{{ titre_page }}
```

`assign` crée une variable locale, utilisable dans tout le reste du template. La portée est celle du template courant — pas globale entre templates.

Pour construire une chaîne à partir de plusieurs parties :

```liquid
{% capture message_accueil %}
  Bonjour {{ user.firstname }}, bienvenue sur votre espace.
{% endcapture %}

{{ message_accueil }}
```

`capture` est plus puissant qu'`assign` quand le contenu est multilignes ou mixe texte et variables.

### Les filtres — transformer à la volée

Les filtres s'appliquent avec le pipe `|` et transforment une valeur avant affichage. Plusieurs filtres peuvent se chaîner.

```liquid
{{ page.title | upcase }}
{# → "NOS BIENS DISPONIBLES" #}

{{ "  bonjour monde  " | strip | capitalize }}
{# → "Bonjour monde" #}

{{ 1500.5 | round: 0 | prepend: "€ " }}
{# → "€ 1501" #}
```

Filtres courants à connaître :

| Filtre | Effet | Exemple |
|--------|-------|---------|
| `upcase` / `downcase` | Majuscules / minuscules | `{{ "test" | upcase }}` → `TEST` |
| `capitalize` | Première lettre en maj | `{{ "marie" | capitalize }}` → `Marie` |
| `strip` | Supprime les espaces en début/fin | `{{ "  abc  " | strip }}` → `abc` |
| `truncate: N` | Tronque à N caractères | `{{ texte | truncate: 50 }}` |
| `replace: "a", "b"` | Remplace toutes les occurrences | `{{ "bonjour" | replace: "o", "0" }}` |
| `size` | Longueur d'une chaîne ou d'un tableau | `{{ liste | size }}` |
| `date: "FORMAT"` | Formate une date | `{{ now | date: "%d/%m/%Y" }}` |
| `escape` | Échappe les caractères HTML | `{{ valeur | escape }}` |
| `default: "val"` | Valeur de repli si null/vide | `{{ user.phone | default: "Non renseigné" }}` |

⚠️ `date` attend un objet date Liquid ou la chaîne `"now"`. Si vous passez une chaîne arbitraire, le filtre ne fonctionnera pas — vérifiez que la valeur vient bien d'un champ de type Date dans Dataverse.

### Conditions

```liquid
{% if user and user.roles contains "Propriétaire" %}
  <a href="/gestion">Gérer mes biens</a>
{% elsif user %}
  <p>Votre compte n'a pas accès à cette section.</p>
{% else %}
  <p><a href="/signin">Connectez-vous</a> pour accéder à votre espace.</p>
{% endif %}
```

Opérateurs disponibles : `==`, `!=`, `>`, `<`, `>=`, `<=`, `contains`, `and`, `or`, `not`.

💡 `contains` fonctionne sur les chaînes **et** les tableaux — c'est le même opérateur. `user.roles contains "Admin"` teste si la collection de rôles contient "Admin".

### Boucles

```liquid
{% for bien in biens_disponibles %}
  <div class="card">
    <h3>{{ bien.cr_nom }}</h3>
    <p>{{ bien.cr_ville }} — {{ bien.cr_loyer | prepend: "€ " }}</p>
  </div>
{% else %}
  <p>Aucun bien disponible pour le moment.</p>
{% endfor %}
```

Le bloc `{% else %}` dans un `for` s'exécute si la collection est vide — pratique pour éviter une page blanche.

Dans une boucle, Liquid expose automatiquement `forloop` :

```liquid
{% for item in collection %}
  {# forloop.index → position 1-based #}
  {# forloop.index0 → position 0-based #}
  {# forloop.first → true pour le premier élément #}
  {# forloop.last → true pour le dernier #}
  {# forloop.length → taille totale de la collection #}
  <li class="{% if forloop.first %}premier{% endif %}">{{ item.nom }}</li>
{% endfor %}
```

Pour limiter ou paginer :

```liquid
{% for bien in biens_disponibles limit: 6 offset: 0 %}
  ...
{% endfor %}
```

---

## Les objets globaux Power Pages

C'est là que Power Pages enrichit Liquid. Ces objets sont injectés automatiquement dans chaque template — vous n'avez pas à les déclarer.

### `page` — la page courante

```liquid
{{ page.title }}          {# Titre de la page web #}
{{ page.adx_copy }}       {# Contenu HTML principal #}
{{ page.url }}            {# URL relative de la page #}
{{ page.id }}             {# GUID de l'enregistrement Page #}
{{ page.parent.title }}   {# Titre de la page parente (navigation) #}
```

🧠 `page` est un objet Dataverse qui représente l'enregistrement `adx_webpage` courant. Ses propriétés sont les colonnes de cet enregistrement — vous pouvez donc accéder à n'importe quel champ personnalisé que vous y avez ajouté.

### `user` — l'utilisateur connecté

```liquid
{% if user %}
  {{ user.fullname }}      {# Prénom + Nom #}
  {{ user.firstname }}     {# Prénom seul #}
  {{ user.email }}         {# Email #}
  {{ user.id }}            {# GUID du contact Dataverse #}
{% endif %}
```

⚠️ `user` est `null` si personne n'est connecté. Testez **toujours** avec `{% if user %}` avant d'accéder à ses propriétés — sinon le template lève une erreur silencieuse et n'affiche rien.

Pour tester les rôles :

```liquid
{% if user.roles contains "Administrateur" %}
  <a href="/admin">Panneau d'administration</a>
{% endif %}
```

### `request` — la requête HTTP courante

```liquid
{{ request.url }}               {# URL complète de la requête #}
{{ request.params["search"] }}  {# Paramètre querystring ?search=... #}
{{ request.path }}              {# Chemin sans domaine ni querystring #}
```

Cas d'usage typique : lire un paramètre d'URL pour filtrer un affichage.

```liquid
{% assign terme_recherche = request.params["q"] %}
{% if terme_recherche %}
  <p>Résultats pour : <strong>{{ terme_recherche | escape }}</strong></p>
{% endif %}
```

💡 Utilisez toujours `| escape` sur des valeurs venant de `request.params` — ce sont des données utilisateur non validées.

### `entities` — accès direct à Dataverse

C'est l'objet le plus puissant, et le plus délicat à utiliser correctement.

```liquid
{% assign bien = entities["cr_bien_immobilier"][<GUID>] %}
{{ bien.cr_nom }}
{{ bien.cr_loyer }}
```

`entities["<NOM_TABLE>"][<GUID>]` récupère un enregistrement unique par son identifiant. Utile quand vous connaissez le GUID à l'avance (passé en paramètre, ou stocké dans la page).

Pour une liste d'enregistrements avec filtre, on passe par les **Entity Lists** (vues Dataverse configurées dans le portail) ou par `entitylist` — mais c'est un sujet du module suivant. Ce qu'`entities` fait directement, c'est l'accès unitaire par GUID.

### `sitemap` et `sitemarkers`

```liquid
{% assign accueil = sitemarkers["Accueil"] %}
<a href="{{ accueil.url }}">Retour à l'accueil</a>
```

`sitemarkers` est un dictionnaire de raccourcis vers des pages du portail — vous les configurez dans l'interface Power Pages Studio. C'est la bonne façon de créer des liens internes sans coder les URLs en dur.

### `now`

```liquid
{{ now | date: "%d/%m/%Y à %H:%M" }}
{# → "14/06/2025 à 09:32" #}
```

Heure et date du serveur au moment du rendu. Utile pour afficher la date de mise à jour ou pour des conditions temporelles.

---

## Construction progressive : du template simple au template réel

Voici comment on passe d'un template basique à quelque chose de production.

**Version 1 — Affichage statique avec variable**

```liquid
{% assign titre = "Nos biens à louer" %}
<h1>{{ titre }}</h1>
<p>Consultez notre catalogue de biens disponibles.</p>
```

Rien de dynamique encore. On pose juste la structure.

**Version 2 — Personnalisation et condition**

```liquid
<h1>Nos biens à louer</h1>

{% if user %}
  <p>Bonjour {{ user.firstname }}, voici les biens disponibles près de chez vous.</p>
{% else %}
  <p>Connectez-vous pour accéder aux offres personnalisées.</p>
{% endif %}
```

On introduit la logique utilisateur. La page change selon l'état de connexion.

**Version 3 — Itération sur des données Dataverse + gestion de l'absence**

```liquid
<h1>{{ page.title }}</h1>

{% if user %}
  <p>Bonjour {{ user.firstname }} !</p>
{% endif %}

{% assign ville_filtre = request.params["ville"] | default: "" %}

{% if ville_filtre != "" %}
  <p>Affichage des biens à <strong>{{ ville_filtre | capitalize | escape }}</strong>.</p>
{% endif %}

<div class="biens-grid">
  {% for bien in entityview.records %}
    {% unless bien.cr_archivé %}
      <div class="card">
        <h3>{{ bien.cr_nom }}</h3>
        <p class="ville">{{ bien.cr_ville }}</p>
        <p class="loyer">{{ bien.cr_loyer | round: 0 }} € / mois</p>
        <a href="/bien?id={{ bien.id }}">Voir le détail</a>
      </div>
    {% endunless %}
  {% else %}
    <p>Aucun bien ne correspond à votre recherche.</p>
  {% endfor %}
</div>

<p class="footer-info">Page mise à jour le {{ now | date: "%d/%m/%Y" }}</p>
```

`{% unless condition %}` est l'inverse de `{% if %}` — plus lisible qu'un `{% if not ... %}` quand on veut exclure quelque chose.

---

## Erreurs fréquentes

**Symptôme :** La page s'affiche mais un bloc entier est vide, sans message d'erreur.
**Cause probable :** Accès à une propriété d'un objet null. Exemple : `{{ user.fullname }}` alors que personne n'est connecté.
**Correction :** Toujours entourer d'un `{% if user %}` avant d'accéder à ses propriétés.

---

**Symptôme :** Le filtre `date` affiche la chaîne brute au lieu de la formater.
**Cause :** La valeur passée est une chaîne de caractères, pas un objet date Liquid.
**Correction :** Vérifiez que le champ Dataverse est bien de type Date/Heure, ou utilisez `"now"` pour la date courante. Les chaînes ISO brutes ne sont pas automatiquement parsées.

---

**Symptôme :** `{{ request.params["id"] }}` affiche bien la valeur, mais `entities["cr_bien"][request.params["id"]]` retourne nil.
**Cause :** Le GUID passé en paramètre contient des accolades `{...}` ou des tirets mal formatés selon le contexte.
**Correction :** Normalisez le GUID avec `| downcase | strip` avant de l'utiliser comme clé dans `entities`.

---

**Symptôme :** Une variable `assign` n'est pas accessible dans un bloc `for`.
**Cause :** Vous avez fait le `assign` à l'intérieur d'un bloc `if` ou `for` imbriqué — la portée est plus restreinte que vous ne le pensiez.
**Correction :** Déclarez la variable avant le bloc qui en a besoin.

---

⚠️ Une erreur de syntaxe Liquid (balise non fermée, filtre inexistant) ne plante pas la page proprement — le rendu s'arrête silencieusement à l'endroit de l'erreur. Si votre page est coupée à mi-chemin, cherchez une balise `{% ... %}` non fermée juste avant.

---

## Bonnes pratiques

**Échappez les données utilisateur.** Toute valeur venant de `request.params` doit passer par `| escape` avant d'être injectée dans le HTML. C'est la seule protection contre les injections XSS côté template.

**Nommez vos variables de façon explicite.** `{% assign b = ... %}` est lisible en 5 lignes, opaque en 50. Préférez `{% assign bien_courant = ... %}`.

**Limitez la logique dans les templates.** Liquid est un langage de présentation, pas de traitement. Si vous vous retrouvez à écrire plus de 3 niveaux d'imbrication ou à simuler une jointure à la main, c'est le signe qu'une Entity View configurée en amont, ou un Web Template dédié, ferait mieux le travail.

**Utilisez `default` pour les valeurs optionnelles.** `{{ bien.cr_description | default: "Description non disponible" }}` évite les trous dans l'interface et se lit clairement.

**Commentez les blocs complexes.** Un `{# Affiché uniquement pour les contacts avec rôle Bailleur #}` au-dessus d'un `{% if %}` complexe fait gagner 10 minutes à la prochaine personne qui lit le template — y compris vous dans 6 mois.

---

## Résumé

| Concept | Ce qu'il fait | À retenir |
|---------|---------------|-----------|
| `{{ ... }}` | Affiche une valeur | Rendu pur, pas de logique |
| `{% ... %}` | Exécute une instruction | `if`, `for`, `assign`, `capture` |
| `{# ... #}` | Commentaire | Invisible dans le HTML rendu |
| Filtres (`\|`) | Transforment une valeur | Chaînables, appliqués avant l'affichage |
| `user` | Utilisateur connecté | `null` si non connecté — toujours tester |
| `page` | Page Dataverse courante | Accès à toutes les colonnes de `adx_webpage` |
| `request` | Requête HTTP | `request.params["clé"]` pour les querystrings |
| `entities` | Accès Dataverse par GUID | Lecture unitaire — listes via Entity Views |
| `sitemarkers` | Liens internes configurés | Alternative aux URLs en dur |
| `now` | Date/heure serveur | Combiné avec `\| date: "FORMAT"` |

Liquid dans Power Pages, c'est finalement un contrat simple : vous écrivez du HTML avec des trous, et Liquid remplit ces trous avec des données Dataverse au moment du rendu côté serveur. Maîtriser les objets globaux et la syntaxe de base vous donne 80 % de ce dont vous aurez besoin pour construire des pages dynamiques réelles.

---

<!-- snippet
id: liquid_balises_trois_types
type: concept
tech: Liquid / Power Pages
level: intermediate
importance: high
format: knowledge
tags: liquid, syntaxe, balises, power-pages, templates
title: Les trois types de balises Liquid
content: Liquid utilise 3 syntaxes : {{ ... }} affiche une valeur (rendu), {% ... %} exécute une instruction sans émettre de texte (if, for, assign), {# ... #} est un commentaire invisible dans le HTML final. Les deux premières sont évaluées côté serveur avant envoi au navigateur.
description: Distinguer affichage, logique et commentaire est la base absolue — une confusion entre {{ }} et {% %} casse le rendu silencieusement.
-->

<!-- snippet
id: liquid_user_null_check
type: warning
tech: Liquid / Power Pages
level: intermediate
importance: high
format: knowledge
tags: liquid, user, null, power-pages, authentification
title: Toujours tester user avant d'accéder à ses propriétés
content: Piège : écrire {{ user.fullname }} directement sans vérification. Si personne n'est connecté, user est null et le bloc entier s'arrête silencieusement — pas d'erreur visible, juste un rendu tronqué. Correction : encapsuler dans {% if user %}...{% endif %} systématiquement.
description: user est null pour les visiteurs anonymes — un accès direct à user.fullname sans test provoque un arrêt silencieux du rendu.
-->

<!-- snippet
id: liquid_escape_request_params
type: warning
tech: Liquid / Power Pages
level: intermediate
importance: high
format: knowledge
tags: liquid, securite, xss, request, escape
title: Échapper les paramètres URL avec | escape
content: Piège : afficher {{ request.params["q"] }} directement dans le HTML. Un attaquant peut injecter du HTML ou du JS via l'URL. Correction : toujours écrire {{ request.params["q"] | escape }}. Le filtre escape convertit <, >, " en entités HTML, neutralisant l'injection.
description: Les valeurs de request.params sont des données utilisateur non validées — | escape est la seule protection XSS côté template Liquid.
-->

<!-- snippet
id: liquid_filtre_default
type: tip
tech: Liquid / Power Pages
level: intermediate
importance: medium
format: knowledge
tags: liquid, filtres, default, robustesse
title: Utiliser | default pour les champs optionnels
content: Pour un champ Dataverse potentiellement vide, écrire {{ bien.cr_description | default: "Description non disponible" }} plutôt que de tester null manuellement. Le filtre default retourne la valeur de repli si la variable est null, false ou une chaîne vide.
description: | default évite les trous visuels dans l'interface sans alourdir le template avec des blocs if/else pour chaque champ optionnel.
-->

<!-- snippet
id: liquid_filtre_date_format
type: tip
tech: Liquid / Power Pages
level: intermediate
importance: medium
format: knowledge
tags: liquid, date, filtres, formatage
title: Formater une date avec | date
command: {{ <VALEUR_DATE> | date: "<FORMAT>" }}
example: {{ now | date: "%d/%m/%Y à %H:%M" }}
description: Fonctionne sur l'objet now ou un champ Dataverse de type Date/Heure. Ne fonctionne pas sur une chaîne ISO brute non parsée.
-->

<!-- snippet
id: liquid_assign_vs_capture
type: concept
tech: Liquid / Power Pages
level: intermediate
importance: medium
format: knowledge
tags: liquid, assign, capture, variables
title: assign vs capture pour déclarer une variable
content: assign crée une variable à partir d'une valeur simple ou d'une expression sur une ligne. capture collecte tout le contenu (texte + variables imbriquées) entre {% capture nom %} et {% endcapture %} — utile pour construire un bloc HTML dynamique réutilisable. Les deux ont une portée locale au template courant.
description: Utiliser capture quand le contenu de la variable mélange texte statique et variables Liquid sur plusieurs lignes.
-->

<!-- snippet
id: liquid_forloop_metadata
type: concept
tech: Liquid / Power Pages
level: intermediate
importance: medium
format: knowledge
tags: liquid, for, boucle, forloop, iteration
title: L'objet forloop expose la position dans la boucle
content: Dans chaque itération, Liquid injecte forloop automatiquement : forloop.index (1-based), forloop.index0 (0-based), forloop.first (bool), forloop.last (bool), forloop.length (taille totale). Exemple : {% if forloop.first %} class="premier" {% endif %} pour styler le premier élément différemment.
description: forloop est disponible sans déclaration dans tout bloc for — il évite d'avoir à maintenir un compteur manuel.
-->

<!-- snippet
id: liquid_unless_syntaxe
type: tip
tech: Liquid / Power Pages
level: intermediate
importance: low
format: knowledge
tags: liquid, unless, condition, lisibilite
title: unless comme alternative lisible à if not
content: {% unless bien.cr_archive %} est équivalent à {% if bien.cr_archive == false %} mais se lit plus naturellement en anglais. À utiliser quand la condition d'exclusion est simple — pour les cas complexes, if reste plus clair.
description: unless améliore la lisibilité des templates d'exclusion simples, sans changer le comportement par rapport à if not.
-->

<!-- snippet
id: liquid_erreur_rendu_coupe
type: error
tech: Liquid / Power Pages
level: intermediate
importance: high
format: knowledge
tags: liquid, debug, erreur, syntaxe, rendu
title: Page coupée à mi-rendu sans message d'erreur
content: Symptôme : le bas de la page disparaît sans explication. Cause : une balise {% %} non fermée (if, for, capture sans endif/endfor/endcapture) ou un filtre inexistant arrête le rendu silencieusement à l'endroit du problème. Correction : remonter depuis l'endroit où le contenu s'arrête et chercher la balise ouvrante orpheline.
description: Liquid ne lève pas d'exception visible — une balise non fermée tronque le HTML rendu sans indiquer la ligne fautive.
-->

<!-- snippet
id: liquid_entities_acces_guid
type: concept
tech: Liquid / Power Pages
level: intermediate
importance: medium
format: knowledge
tags: liquid, entities, dataverse, guid, acces
title: entities["table"][GUID] pour lire un enregistrement unique
command: {% assign <VAR> = entities["<NOM_TABLE>"][<GUID>] %}
example: {% assign bien = entities["cr_bien_immobilier"]["a1b2c3d4-0000-0000-0000-000000000000"] %}
content: entities est l'objet global qui donne accès direct à Dataverse. La syntaxe est entities["nom_logique_table"]["guid"]. Retourne nil si le GUID n'existe pas ou si l'utilisateur n'a pas accès à l'enregistrement. Pour des listes filtrées, les Entity Views sont la bonne approche — entities ne remplace pas une requête multi-enregistrements.
description: Accès unitaire par GUID — pratique pour charger un enregistrement dont l'id est passé en querystring, inutilisable pour itérer sur une liste.
-->

<!-- snippet
id: liquid_sitemarkers_liens_internes
type: tip
tech: Liquid / Power Pages
level: intermediate
importance: medium
format: knowledge
tags: liquid, sitemarkers, navigation, liens, power-pages
title: Utiliser sitemarkers pour les liens internes
command: {% assign <PAGE> = sitemarkers["<NOM_MARQUEUR>"] %} <a href="{{ <PAGE>.url }}">...</a>
example: {% assign accueil = sitemarkers["Accueil"] %} <a href="{{ accueil.url }}">Retour à l'accueil</a>
description: Évite de coder des URLs en dur dans les templates — si l'URL de la page change, le lien reste valide sans modifier le template.
-->
