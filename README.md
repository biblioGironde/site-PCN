# Catalogue des outils numériques de biblio.gironde

Page qui recense automatiquement tous les dépôts publics de l'organisation
GitHub **biblioGironde** : grille de vignettes, titre, description, filtres par
catégorie, recherche et tri.

Adresse : https://bibliogironde.github.io/site-PCN/

## Comment ça marche

Une GitHub Action (`.github/workflows/deploy.yml`) récupère la liste des dépôts
via l'API GitHub, écrit `repos.json` et publie la page. Elle tourne :
- à chaque modification de ce dépôt ;
- chaque jour vers 6 h ;
- à la demande : **Actions → Déploiement GitHub Pages → Run workflow**
  (pratique juste après avoir créé un nouveau dépôt).

## Ce que chaque carte affiche

| Élément | Où le modifier |
|---|---|
| Vignette | Capture d'écran automatique de la page GitHub Pages du dépôt (ou de son *Website*). Sans page en ligne : image générée par GitHub, ou *Settings → Social preview* |
| Description | Dépôt → roue dentée **About** → *Description* |
| Bouton « Ouvrir » | *About* → *Website* ; à défaut, l'adresse GitHub Pages si elle est activée |
| Titre et catégorie | `config.json` (voir ci-dessous) |

## Personnaliser (`config.json`)

- `titre`, `sousTitre` : en-tête de la page.
- `exclure` : dépôts à ne pas afficher.
- `afficherArchives` : afficher ou non les dépôts archivés.
- `categories` : filtres, dans l'ordre d'affichage. Chaque dépôt prend la
  **première** catégorie dont un motif correspond à son nom (expressions
  régulières, sans distinction de casse). La dernière (`.*`) sert de « reste ».
- `captures` : taille de la fenêtre capturée et temps d'attente (ms) avant la
  capture, à augmenter pour les applis lentes à s'afficher.
- `adresses` : page à capturer pour un dépôt, si ce n'est pas son adresse
  GitHub Pages (ex. `"Kit-Podcast": "https://bibliogironde.github.io/Kit-Podcast/demo.html"`).
- `titres` : titres lisibles pour certains dépôts. Sans entrée, le titre est
  déduit du nom (`kit-effets-speciaux` → « Kit effets speciaux »).

## Fichiers

```
index.html, style.css, app.js   la page
config.json                     réglages
scripts/fetch-repos.mjs         récupération des dépôts (lancé par l'Action)
scripts/capture.mjs             captures d'écran des pages (lancé par l'Action)
```

## Licences

- **Code** : © Département de la Gironde — biblio.gironde, sous licence [GNU Affero General Public License v3.0](LICENSE) ou ultérieure (AGPL-3.0-or-later). Vous pouvez le réutiliser et le modifier ; toute version modifiée, redistribuée ou mise en ligne, doit être publiée sous la même licence, avec son code source.
