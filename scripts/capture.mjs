// Capture d'écran de la page GitHub Pages (ou du site « Website ») de chaque dépôt.
// Usage : node scripts/capture.mjs <dossier-du-site>
// Lit <dossier>/repos.json, écrit les images dans <dossier>/vignettes/
// et remplace le champ `image` des dépôts capturés. En cas d'échec,
// l'image générée par GitHub est conservée.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const dir = process.argv[2] || "_site";
const config = JSON.parse(await readFile(new URL("../config.json", import.meta.url), "utf8"));
const opts = {
  largeur: 1024,
  hauteur: 640,
  attente: 2500, // ms laissés aux scripts de la page après chargement
  delai: 25000, // ms max pour charger une page
  ...(config.captures || {}),
};

const data = JSON.parse(await readFile(`${dir}/repos.json`, "utf8"));
const org = data.organisation.toLowerCase();
await mkdir(`${dir}/vignettes`, { recursive: true });

const adresse = (r) =>
  (config.adresses && config.adresses[r.name]) ||
  r.homepage ||
  (r.has_pages ? `https://${org}.github.io/${r.name}/` : "");

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: opts.largeur, height: opts.hauteur },
  deviceScaleFactor: 640 / opts.largeur, // image finale : 640 px de large
  locale: "fr-FR",
  colorScheme: "light",
  reducedMotion: "reduce",
});

let ok = 0;
for (const r of data.repos) {
  const url = adresse(r);
  if (!url) continue;
  const page = await context.newPage();
  try {
    const rep = await page.goto(url, { waitUntil: "load", timeout: opts.delai });
    if (!rep || rep.status() >= 400) throw new Error(`HTTP ${rep?.status()}`);
    await page.waitForTimeout(opts.attente);
    const fichier = `vignettes/${r.name}.jpg`;
    await page.screenshot({ path: `${dir}/${fichier}`, type: "jpeg", quality: 75 });
    r.image = fichier;
    r.capture = true;
    ok++;
    console.log(`✓ ${r.name}`);
  } catch (e) {
    console.warn(`✗ ${r.name} (${url}) : ${e.message.split("\n")[0]}`);
  } finally {
    await page.close();
  }
}
await browser.close();

await writeFile(`${dir}/repos.json`, JSON.stringify(data, null, 2));
console.log(`${ok} captures réalisées`);
