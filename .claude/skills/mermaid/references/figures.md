# Figures pédagogiques en HTML

Styles dans `assets/nav.css`, sans JavaScript. La lecture audio les ignore : le texte voisin doit donc porter le message.

Règles communes :
- `markdown="0"` sur le bloc, pour que Jekyll n'interprète pas son contenu ;
- une phrase après la figure dit ce qu'il faut y lire ;
- `role="img"` et `aria-label` décrivent la figure ;
- valeurs inventées annoncées comme illustratives ;
- une figure réservée à une notion fondamentale que Mermaid explique mal.

## Correspondance alignée : `fig-layers`

Exemple réel : Réseaux 02, OSI et TCP/IP. Couleurs : `c-app`, `c-tra`, `c-net`, `c-acc`. `fig-span2` et `fig-span3` étirent un bloc sur plusieurs lignes.

```html
<div class="fig fig-layers" markdown="0" role="img" aria-label="Description">
<div class="fig-head">Colonne A</div><div class="fig-head">Colonne B</div>
<div class="fig-cell c-app">Ligne 1</div><div class="fig-cell c-app fig-span2"><strong>Regroupe 2 lignes</strong></div>
<div class="fig-cell c-app">Ligne 2</div>
</div>
```

## Empilement : `fig-packet`

Exemple réel : Réseaux 02, encapsulation. `b-new` pour ce qui vient d'être ajouté, `b-old` pour le reste, `b-data` pour les données et `b-bits` pour le binaire.

```html
<div class="fig fig-packet" markdown="0" role="img" aria-label="Description">
<div class="fig-row"><span class="fig-label">Étape</span><span class="fig-bar"><span class="b-new">Ajout</span><span class="b-data">Données</span></span></div>
</div>
```

## Avant/après : tableau avec `<mark>`

Exemple réel : Réseaux 08, NAT.

```markdown
| Étape | Source | Destination |
|---|---|---|
| Avant | `10.0.0.1:5000` | `198.51.100.20:443` |
| Après | <mark><code>203.0.113.10:40001</code></mark> | `198.51.100.20:443` |
{: .fig-change}
```

## Maquette d'interface : `fig-dash`

Exemple réel : Grafana 08, à reprendre depuis ce module. La géométrie montre l'inclusion : dossier, dashboard, rows, panels, puis requête.
