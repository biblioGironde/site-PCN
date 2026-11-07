# Site de test Eleventy — Pages CMS / Sveltia CMS

Petit site Eleventy (accueil + actualités + page « À propos ») publié sur GitHub Pages,
éditable avec **deux CMS au choix**, branchés sur les mêmes fichiers :

| | Pages CMS | Sveltia CMS |
|---|---|---|
| Configuration | `.pages.yml` (racine) | `src/admin/config.yml` |
| Adresse d'édition | https://app.pagescms.org | `https://<compte>.github.io/<dépôt>/admin/` |
| Connexion | Compte GitHub (app GitHub à installer) | Jeton GitHub, ou proxy OAuth Cloudflare |

## 1. Mettre en ligne

1. Créer un dépôt sur GitHub (ex. `site-PCN`) et y pousser ce dossier :
   ```bash
   git init && git add . && git commit -m "Site de test Eleventy"
   git branch -M main
   git remote add origin https://github.com/<compte>/site-PCN.git
   git push -u origin main
   ```
2. Dans le dépôt : **Settings → Pages → Source : GitHub Actions**.
3. Relancer le workflow (onglet **Actions → Déploiement GitHub Pages → Run workflow**)
   si le premier push a eu lieu avant l'étape 2.
4. Le site est disponible sur `https://bibliogironde.github.io/site-PCN/`.

## 2. Tester Pages CMS

1. Aller sur https://app.pagescms.org et se connecter avec GitHub.
2. Installer l'application GitHub « Pages CMS » sur le compte ou l'organisation
   et lui donner accès au dépôt.
3. Ouvrir le dépôt : le fichier `.pages.yml` est déjà là, l'interface s'affiche.

## 3. Tester Sveltia CMS

1. `src/admin/config.yml` pointe déjà vers `biblioGironde/site-PCN`.
2. Créer un jeton GitHub *fine-grained* : **Settings → Developer settings →
   Personal access tokens → Fine-grained tokens**, limité au dépôt, permission
   **Contents : Read and write**.
3. Ouvrir `https://bibliogironde.github.io/site-PCN/admin/` et se connecter
   avec le jeton.

Pour des éditeurs non techniques, déployer plutôt le petit proxy
[sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth) sur Cloudflare Workers
et renseigner `base_url` dans `config.yml` : bouton « Se connecter avec GitHub » classique.

## Travailler en local

```bash
npm install
npm start          # http://localhost:8080
```

## Structure

```
.pages.yml                 config Pages CMS
.github/workflows/         build + déploiement GitHub Pages
src/_data/site.json        nom, description, pied de page
src/_includes/             gabarits (base, actualité)
src/actualites/*.md        articles (layout et tag dans actualites.json)
src/a-propos.md            page fixe
src/media/                 images envoyées depuis les CMS
src/admin/                 interface Sveltia CMS
```

Chaque enregistrement dans un CMS crée un commit sur `main`, ce qui relance le
déploiement : comptez 1 à 2 minutes avant de voir la modification en ligne.
