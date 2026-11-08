// Récupère les dépôts publics de l'organisation et écrit repos.json.
// Usage : GITHUB_TOKEN=... node scripts/fetch-repos.mjs <dossier-de-sortie>
// Lancé par la GitHub Action à chaque déploiement (et une fois par jour).

import { readFile, writeFile, mkdir } from "node:fs/promises";

const config = JSON.parse(await readFile(new URL("../config.json", import.meta.url), "utf8"));
const ORG = config.organisation;
const outDir = process.argv[2] || ".";
const token = process.env.GITHUB_TOKEN;
const headers = {
  Accept: "application/vnd.github+json",
  "User-Agent": "catalogue-depots",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

// 1. GraphQL (avec jeton) : récupère l'image de partage de chaque dépôt,
//    y compris l'image personnalisée si elle a été définie dans Settings.
async function imagesGraphQL() {
  const images = {};
  let after = null;
  do {
    const query = `query($org:String!,$after:String){
      repositoryOwner(login:$org){
        repositories(first:100, after:$after, privacy:PUBLIC){
          pageInfo{ hasNextPage endCursor }
          nodes{ name openGraphImageUrl }
        }
      }
    }`;
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables: { org: ORG, after } }),
    });
    const json = await res.json();
    if (!res.ok || json.errors) throw new Error(JSON.stringify(json.errors || json));
    const page = json.data.repositoryOwner.repositories;
    for (const r of page.nodes) images[r.name] = r.openGraphImageUrl;
    after = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null;
  } while (after);
  return images;
}

// 2. API REST : liste des dépôts (image générée automatiquement par GitHub)
async function viaREST() {
  const repos = [];
  for (let page = 1; ; page++) {
    const res = await fetch(
      `https://api.github.com/users/${ORG}/repos?type=owner&per_page=100&page=${page}`,
      { headers }
    );
    if (!res.ok) throw new Error(`REST ${res.status}: ${await res.text()}`);
    const batch = await res.json();
    for (const r of batch) {
      repos.push({
        name: r.name,
        description: r.description || "",
        url: r.html_url,
        homepage: r.homepage || "",
        image: `https://opengraph.githubassets.com/1/${ORG}/${r.name}`,
        archived: r.archived,
        fork: r.fork,
        pushed_at: r.pushed_at,
        created_at: r.created_at,
        stars: r.stargazers_count,
        language: r.language || "",
        topics: r.topics || [],
        has_pages: r.has_pages,
      });
    }
    if (batch.length < 100) break;
  }
  return repos;
}

let repos = await viaREST();
if (token) {
  try {
    const images = await imagesGraphQL();
    for (const r of repos) if (images[r.name]) r.image = images[r.name];
  } catch (e) {
    console.warn("Images personnalisées indisponibles :", e.message);
  }
}

const exclude = new Set((config.exclure || []).map((n) => n.toLowerCase()));
repos = repos
  .filter((r) => !exclude.has(r.name.toLowerCase()))
  .filter((r) => config.afficherArchives || !r.archived)
  .filter((r) => !r.fork)
  .sort((a, b) => b.pushed_at.localeCompare(a.pushed_at));

await mkdir(outDir, { recursive: true });
await writeFile(
  `${outDir}/repos.json`,
  JSON.stringify({ organisation: ORG, generated_at: new Date().toISOString(), repos }, null, 2)
);
console.log(`${repos.length} dépôts écrits dans ${outDir}/repos.json`);
