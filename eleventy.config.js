import { HtmlBasePlugin } from "@11ty/eleventy";

export default function (eleventyConfig) {
  // Réécrit automatiquement les liens absolus (/css/..., /media/...) avec le
  // préfixe du dépôt GitHub Pages (ex. /site-PCN/). Le préfixe est passé
  // au build par le workflow GitHub Actions (--pathprefix).
  eleventyConfig.addPlugin(HtmlBasePlugin);

  // Fichiers copiés tels quels
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/media");
  eleventyConfig.addPassthroughCopy("src/admin"); // interface Sveltia CMS
  eleventyConfig.ignores.add("src/admin/**");

  // Date au format français : « 7 novembre 2026 »
  eleventyConfig.addFilter("dateFr", (date) =>
    new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(date))
  );

  // Date ISO pour l'attribut datetime : « 2026-11-07 »
  eleventyConfig.addFilter("dateIso", (date) =>
    new Date(date).toISOString().slice(0, 10)
  );

  // Actualités triées de la plus récente à la plus ancienne
  eleventyConfig.addCollection("actualitesRecentes", (api) =>
    api.getFilteredByTag("actualites").sort((a, b) => b.date - a.date)
  );

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
