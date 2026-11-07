import { defineConfig } from "tinacms";

// Identifiants Tina Cloud : fournis par les secrets GitHub (déploiement)
// ou par un fichier .env en local. Sans eux, `npm run dev` fonctionne en mode local.
const branch =
  process.env.GITHUB_BRANCH ||
  process.env.GITHUB_REF_NAME ||
  process.env.HEAD ||
  "main";

export default defineConfig({
  branch,
  clientId: process.env.TINA_PUBLIC_CLIENT_ID,
  token: process.env.TINA_TOKEN,

  build: {
    publicFolder: "_site", // dossier généré par Eleventy
    outputFolder: "admin", // → https://bibliogironde.github.io/site-PCN/admin/
    basePath: process.env.TINA_BASE_PATH || "", // "site-PCN" sur GitHub Pages
  },

  media: {
    tina: {
      publicFolder: "src",
      mediaRoot: "media", // images enregistrées dans src/media
    },
  },

  schema: {
    collections: [
      {
        name: "actualites",
        label: "Actualités",
        path: "src/actualites",
        format: "md",
        defaultItem: () => ({ date: new Date().toISOString() }),
        ui: {
          filename: {
            readonly: false,
            slugify: (values) =>
              (values?.title || "")
                .toLowerCase()
                .normalize("NFD")
                .replace(/[̀-ͯ]/g, "")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, ""),
          },
        },
        fields: [
          { type: "string", name: "title", label: "Titre", isTitle: true, required: true },
          {
            type: "datetime",
            name: "date",
            label: "Date",
            required: true,
            ui: { dateFormat: "DD/MM/YYYY" },
          },
          {
            type: "string",
            name: "resume",
            label: "Résumé (liste d'accueil)",
            ui: { component: "textarea" },
          },
          { type: "image", name: "image", label: "Image de couverture" },
          { type: "rich-text", name: "body", label: "Contenu", isBody: true },
        ],
      },
      {
        name: "pages",
        label: "Pages",
        path: "src/pages",
        format: "md",
        fields: [
          { type: "string", name: "title", label: "Titre", isTitle: true, required: true },
          { type: "rich-text", name: "body", label: "Contenu", isBody: true },
        ],
      },
      {
        name: "reglages",
        label: "Réglages du site",
        path: "src/_data",
        format: "json",
        match: { include: "site" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          { type: "string", name: "title", label: "Nom du site", isTitle: true, required: true },
          {
            type: "string",
            name: "description",
            label: "Description",
            ui: { component: "textarea" },
          },
          { type: "string", name: "footer", label: "Pied de page" },
        ],
      },
    ],
  },
});
