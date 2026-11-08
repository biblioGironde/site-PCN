// Catalogue des dépôts GitHub d'une organisation.
// Données : repos.json (généré par la GitHub Action), sinon API GitHub en direct.

(async function () {
  const $ = (sel) => document.querySelector(sel);
  const grille = $("#grille");
  const modele = $("#modele-carte");
  const etat = { categorie: "Tous", recherche: "", tri: "recent" };

  const config = await fetch("config.json").then((r) => r.json());
  const ORG = config.organisation;

  $("#titre").textContent = config.titre;
  $("#sous-titre").textContent = config.sousTitre;
  document.title = config.titre;
  $("#lien-org").href = `https://github.com/${ORG}`;
  $("#lien-org").textContent = `github.com/${ORG}`;

  // --- Chargement des données ---------------------------------------------
  let donnees;
  try {
    donnees = await fetch("repos.json", { cache: "no-cache" }).then((r) => {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    });
  } catch {
    donnees = await chargerEnDirect().catch(() => null);
  }
  if (!donnees) {
    grille.insertAdjacentHTML(
      "afterend",
      '<p class="erreur">Impossible de charger la liste des dépôts pour le moment.</p>'
    );
    return;
  }

  async function chargerEnDirect() {
    const exclure = new Set((config.exclure || []).map((n) => n.toLowerCase()));
    const brut = await fetch(
      `https://api.github.com/orgs/${ORG}/repos?type=public&per_page=100&sort=pushed`
    ).then((r) => {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    });
    return {
      generated_at: null,
      repos: brut
        .filter((r) => !r.fork && (config.afficherArchives || !r.archived))
        .filter((r) => !exclure.has(r.name.toLowerCase()))
        .map((r) => ({
          name: r.name,
          description: r.description || "",
          url: r.html_url,
          homepage: r.homepage || "",
          image: `https://opengraph.githubassets.com/1/${ORG}/${r.name}`,
          pushed_at: r.pushed_at,
          created_at: r.created_at,
          language: r.language || "",
          topics: r.topics || [],
          has_pages: r.has_pages,
        })),
    };
  }

  // --- Préparation ----------------------------------------------------------
  const regles = config.categories.map((c) => ({
    nom: c.nom,
    motifs: c.motifs.map((m) => new RegExp(m, "i")),
  }));

  const titreLisible = (nom) =>
    (config.titres && config.titres[nom]) ||
    nom
      .replace(/([a-zà-ÿ])([A-Z])/g, "$1 $2")
      .replace(/[-_]+/g, " ")
      .replace(/^./, (c) => c.toUpperCase());

  const sansAccents = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

  const depots = donnees.repos.map((r) => {
    const categorie = (regles.find((c) => c.motifs.some((m) => m.test(r.name))) || { nom: "Outils" }).nom;
    const appli = r.homepage || (r.has_pages ? `https://${ORG.toLowerCase()}.github.io/${r.name}/` : "");
    const titre = titreLisible(r.name);
    return {
      ...r,
      titre,
      categorie,
      appli,
      index: sansAccents([titre, r.name, r.description, ...(r.topics || [])].join(" ")),
    };
  });

  // --- Filtres --------------------------------------------------------------
  const categories = ["Tous", ...regles.map((c) => c.nom).filter((n) => depots.some((d) => d.categorie === n))];
  const filtres = $("#filtres");
  for (const nom of categories) {
    const nb = nom === "Tous" ? depots.length : depots.filter((d) => d.categorie === nom).length;
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("role", "tab");
    b.dataset.categorie = nom;
    b.innerHTML = `${nom}<span class="nb">${nb}</span>`;
    b.addEventListener("click", () => choisir(nom, true));
    filtres.append(b);
  }

  const slug = (s) => sansAccents(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  function choisir(nom, majUrl) {
    etat.categorie = nom;
    for (const b of filtres.children) b.setAttribute("aria-selected", String(b.dataset.categorie === nom));
    filtres.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest", inline: "center" });
    if (majUrl) history.replaceState(null, "", nom === "Tous" ? location.pathname : `#${slug(nom)}`);
    afficher();
  }

  $("#recherche").addEventListener("input", (e) => {
    etat.recherche = sansAccents(e.target.value.trim());
    afficher();
  });
  $("#tri").addEventListener("change", (e) => {
    etat.tri = e.target.value;
    afficher();
  });

  // --- Affichage ------------------------------------------------------------
  const dateFr = (iso) =>
    new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));

  const tris = {
    recent: (a, b) => b.pushed_at.localeCompare(a.pushed_at),
    nouveau: (a, b) => b.created_at.localeCompare(a.created_at),
    alpha: (a, b) => a.titre.localeCompare(b.titre, "fr"),
  };

  function carte(d, i) {
    const li = modele.content.firstElementChild.cloneNode(true);
    li.style.animationDelay = `${Math.min(i, 12) * 30}ms`;
    const lien = li.querySelector(".carte-lien");
    lien.href = d.appli || d.url;
    if (!d.appli) lien.setAttribute("aria-label", `${d.titre} — code source sur GitHub`);
    const img = li.querySelector("img");
    img.src = d.image;
    img.onerror = () => { img.closest(".vignette").remove(); };
    li.querySelector(".categorie").textContent = d.categorie;
    li.querySelector("h2").textContent = d.titre;
    const desc = li.querySelector(".description");
    if (d.description) desc.textContent = d.description;
    else { desc.textContent = "Pas encore de description."; desc.classList.add("manquante"); }
    li.querySelector(".meta").textContent =
      [d.language, `mis à jour le ${dateFr(d.pushed_at)}`].filter(Boolean).join(" · ");
    const actions = li.querySelector(".actions");
    if (d.appli) actions.insertAdjacentHTML("beforeend", `<a class="principal" href="${d.appli}">Ouvrir</a>`);
    actions.insertAdjacentHTML("beforeend", `<a href="${d.url}">Code source</a>`);
    return li;
  }

  let largeur = 0;
  new ResizeObserver(() => {
    if (grille.clientWidth !== largeur) { largeur = grille.clientWidth; afficher(); }
  }).observe(grille);

  function afficher() {
    const liste = depots
      .filter((d) => etat.categorie === "Tous" || d.categorie === etat.categorie)
      .filter((d) => !etat.recherche || etat.recherche.split(/\s+/).every((m) => d.index.includes(m)))
      .sort(tris[etat.tri]);
    // Mosaïque : chaque carte va dans la colonne la plus courte,
    // pour que l'ordre de tri se lise de gauche à droite.
    const nbCol = Math.max(1, Math.min(4, Math.floor((grille.clientWidth + 20) / 260)));
    const colonnes = Array.from({ length: nbCol }, () => {
      const c = document.createElement("div");
      c.className = "colonne";
      return c;
    });
    grille.replaceChildren(...colonnes);
    liste.forEach((d, i) => {
      const plusCourte = colonnes.reduce((a, b) => (b.offsetHeight < a.offsetHeight ? b : a));
      plusCourte.append(carte(d, i));
    });
    $("#vide").hidden = liste.length > 0;
    $("#compteur").textContent = `${liste.length} dépôt${liste.length > 1 ? "s" : ""}`;
  }

  if (donnees.generated_at) $("#maj").textContent = `— mise à jour le ${dateFr(donnees.generated_at)}.`;

  const depuisUrl = categories.find((n) => slug(n) === decodeURIComponent(location.hash.slice(1)));
  choisir(depuisUrl || "Tous", false);
})();
