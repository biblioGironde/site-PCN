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
| Vignette | Dépôt → **Settings → General → Social preview** (sinon, image générée par GitHub) |
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
- `titres` : titres lisibles pour certains dépôts. Sans entrée, le titre est
  déduit du nom (`kit-effets-speciaux` → « Kit effets speciaux »).

## Fichiers

```
index.html, style.css, app.js   la page
config.json                     réglages
scripts/fetch-repos.mjs         récupération des dépôts (lancé par l'Action)
```
