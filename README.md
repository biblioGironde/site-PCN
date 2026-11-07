# site-PCN — Eleventy + TinaCMS

Petit site Eleventy (accueil, actualités, page « À propos ») publié sur GitHub Pages,
éditable avec **TinaCMS** (offre gratuite Tina Cloud : 2 utilisateurs).

- Site : https://bibliogironde.github.io/site-PCN/
- Administration : https://bibliogironde.github.io/site-PCN/admin/index.html

## Mise en service (une seule fois)

1. **Créer le compte Tina Cloud** sur https://app.tina.io (connexion avec GitHub).
2. **Créer un projet** : *Create Project* → *Import your site* → choisir le dépôt
   `biblioGironde/site-PCN` (autoriser l'application Tina sur l'organisation si demandé).
3. Dans le projet Tina Cloud :
   - **Site URLs** : ajouter `https://bibliogironde.github.io` et `http://localhost:8080`
   - **Overview** : copier le **Client ID**
   - **Tokens** : copier le jeton **Content (read-only)**
4. Dans le dépôt GitHub : **Settings → Secrets and variables → Actions → New repository secret**
   - `TINA_PUBLIC_CLIENT_ID` = le Client ID
   - `TINA_TOKEN` = le jeton
5. **Settings → Pages → Source : GitHub Actions**.
6. **Actions → Déploiement GitHub Pages → Run workflow**.
7. Ouvrir l'administration, se connecter avec le compte Tina Cloud.

Pour le 2ᵉ éditeur : Tina Cloud → projet → **Collaborators** → inviter.

## Éditer

Dans l'administration : *Actualités*, *Pages* et *Réglages du site*.
Chaque enregistrement crée un commit sur `main`, ce qui relance le déploiement :
comptez 1 à 2 minutes avant de voir la modification en ligne.

## Travailler en local

```bash
npm install
npm run dev        # site : http://localhost:8080 — admin : http://localhost:8080/admin/index.html
```

En local, Tina écrit directement dans les fichiers, sans compte ni connexion.

## Structure

```
tina/config.ts             modèles de contenu TinaCMS (champs, dossiers)
tina/tina-lock.json        schéma compilé, à committer (lu par Tina Cloud)
.github/workflows/         build Tina + Eleventy, déploiement GitHub Pages
src/_data/site.json        nom, description, pied de page
src/_includes/             gabarits
src/actualites/*.md        articles
src/pages/*.md             pages fixes (URL = nom du fichier)
src/media/                 images envoyées depuis Tina
```

Si vous modifiez `tina/config.ts`, lancez `npm run dev` une fois pour régénérer
`tina/tina-lock.json`, puis committez les deux fichiers.
