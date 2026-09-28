# Portfolio — Benjamin Hanquart

Site : <https://benjaminhanquart.dev>

Portfolio statique (HTML / CSS / JavaScript + Bootstrap 5) hébergé sur GitHub Pages.

## Pages

| Fichier | Rôle |
| --- | --- |
| `index.html` | Portfolio principal (à propos, projets, contact) |
| `resume.html` | CV en ligne |
| `linux.html` | « PortfolioOS » : version interactive façon bureau Linux |
| `404.html` | Page d'erreur |

## Fonctionnalités

- **Thème clair / sombre** : suit le thème du système par défaut, choix mémorisé, appliqué avant le premier affichage (pas de flash). Raccourci clavier <kbd>T</kbd>.
- **Français / English** : bouton dans la barre de navigation, choix mémorisé. Raccourci <kbd>L</kbd>.
- Filtres de projets, modales détaillées avec lien direct (ex. `/#projet-eco`) et navigation précédent / suivant.
- Formulaire de contact via EmailJS (limité à 2 messages par semaine et par navigateur).
- PWA hors-ligne (service worker *network-first*).

## Traductions

Le français est écrit directement dans le HTML. Pour traduire un élément :

```html
<p data-i18n="ma.cle">Texte en français</p>
<img alt="Texte FR" data-i18n-attr="alt:ma.cle.alt">
```

puis ajouter `'ma.cle': "English text"` dans la section `en` de `i18n.js`.

## Lancer en local

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```
