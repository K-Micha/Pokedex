let pokemons = [];
let offset = 0;
const limit = 20;

async function loadPokemons() {
  const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
  const res = await fetch(url);
  const data = await res.json();

  for (const entry of data.results) {
    const detailRes = await fetch(entry.url);
    const detailData = await detailRes.json();
    pokemons.push(detailData);
  }
}


let currentPokemonIndex = 0;
let isLoading = false;

async function init() {
  setLoading(true);
  await loadPokemons();
  renderPokemons();
  setLoading(false);
}

function setLoading(loading) {
  isLoading = loading;

  const loader = document.getElementById("loader");
  const loadMoreBtn = document.getElementById("loadMoreBtn");

  if (loader) {
    loader.classList.toggle("hidden", !loading);
  }

  if (loadMoreBtn) {
    loadMoreBtn.disabled = loading;
  }
}

function renderPokemons(list) {
  const container = document.getElementById("pokemonContainer");
  const source = list || pokemons;
  container.innerHTML = source.map((p) => pokemonCardTemplate(p)).join("");
}

function showDetail(id) {
  const index = pokemons.findIndex((p) => p.id === id);
  if (index === -1) return;

  currentPokemonIndex = index;
  const pokemon = pokemons[index];
  const detailView = document.getElementById("detailView");
  const detailCard = document.getElementById("detailCard");
  const mainType = pokemon.types[0].type.name;

  detailCard.className = `detail-card type-${mainType}`;
  detailCard.innerHTML = detailCardTemplate(pokemon);

  detailView.classList.remove("hidden");
  document.body.classList.add("no-scroll");
}

function closeDetail() {
  const detailView = document.getElementById("detailView");
  detailView.classList.add("hidden");
  document.body.classList.remove("no-scroll");
}

function handleSearchInput() {
  const input = document.getElementById("searchInput");
  const btn = document.getElementById("searchBtn");
  const message = document.getElementById("searchMessage");

  if (!input || !btn) return;

  const value = input.value.trim().toLowerCase();

  if (value.length < 3) {
    btn.disabled = true;
    if (message) message.textContent = "";
    if (value.length === 0) {
      renderPokemons();
    }
    return;
  }

  btn.disabled = false;
  filterPokemons();
}

function filterPokemons() {
  const input = document.getElementById("searchInput");
  const message = document.getElementById("searchMessage");
  if (!input) return;

  const value = input.value.trim().toLowerCase();

  if (value.length < 3) {
    renderPokemons();
    if (message) message.textContent = "";
    return;
  }

  const filtered = pokemons.filter((p) =>
    p.name.toLowerCase().includes(value)
  );

  if (filtered.length === 0) {
    renderPokemons([]);
    if (message) message.textContent = "Kein Pokémon gefunden.";
  } else {
    renderPokemons(filtered);
    if (message) message.textContent = "";
  }
}

async function loadMore() {
  offset += limit;
  setLoading(true);
  await loadPokemons();
  setLoading(false);
  renderPokemons();
}

async function showTab(tab, id) {
  const pokemon = pokemons.find((p) => p.id === id);
  if (!pokemon) return;

  setActiveTabButton(tab);
  await renderTabContent(tab, pokemon);
}

function setActiveTabButton(activeTab) {
  ["main", "stats", "evo"].forEach((name) => {
    const btn = document.getElementById(`tab-${name}`);
    if (btn) {
      btn.classList.toggle("active", name === activeTab);
    }
  });
}

async function renderTabContent(tab, pokemon) {
  const tabContent = document.getElementById("tabContent");
  if (!tabContent) return;

  if (tab === "main") {
    tabContent.innerHTML = mainTabTemplate(pokemon);
    return;
  }

  if (tab === "stats") {
    tabContent.innerHTML = statsTabTemplate(pokemon);
    return;
  }

  if (tab === "evo") {
    tabContent.innerHTML =
      '<p class="evo-chain">Lade Evolutionskette...</p>';
    await ensureEvolutionChainLoaded(pokemon);
    tabContent.innerHTML = evoTabTemplate(pokemon);
  }
}

async function ensureEvolutionChainLoaded(pokemon) {
  if (pokemon.evolutionChain !== undefined) {
    return;
  }

  try {
    const speciesRes = await fetch(pokemon.species.url);
    const speciesData = await speciesRes.json();

    if (speciesData.evolution_chain && speciesData.evolution_chain.url) {
      const evoRes = await fetch(speciesData.evolution_chain.url);
      pokemon.evolutionChain = await evoRes.json();
    } else {
      pokemon.evolutionChain = null;
    }
  } catch (error) {
    console.error("Fehler beim Laden der Evolutionskette:", error);
    pokemon.evolutionChain = null;
  }
}

function nextPokemon() {
  if (pokemons.length === 0) return;
  const nextIndex = (currentPokemonIndex + 1) % pokemons.length;
  showDetail(pokemons[nextIndex].id);
}

function prevPokemon() {
  if (pokemons.length === 0) return;
  const prevIndex =
    (currentPokemonIndex - 1 + pokemons.length) % pokemons.length;
  showDetail(pokemons[prevIndex].id);
}


function getPokemonImage(pokemon) {
  return (
    pokemon.sprites?.other?.["official-artwork"]?.front_default ||
    pokemon.sprites?.front_default ||
    ""
  );
}

const typeTranslations = {
  normal: "Normal",
  fire: "Feuer",
  water: "Wasser",
  grass: "Pflanze",
  electric: "Elektro",
  ice: "Eis",
  fighting: "Kampf",
  poison: "Gift",
  ground: "Boden",
  flying: "Flug",
  psychic: "Psycho",
  bug: "Käfer",
  rock: "Gestein",
  ghost: "Geist",
  dragon: "Drache",
  dark: "Unlicht",
  steel: "Stahl",
  fairy: "Fee",
};

function translateTypeName(name) {
  return typeTranslations[name] || capitalize(name);
}

const statTranslations = {
  hp: "KP",
  attack: "Angriff",
  defense: "Verteidigung",
  "special-attack": "Spezial-Angriff",
  "special-defense": "Spezial-Verteidigung",
  speed: "Initiative",
};

function translateStatName(eng) {
  return statTranslations[eng] || capitalize(eng);
}

function parseEvolutionChain(evoData) {
  const result = [];

  function walk(node, stage) {
    if (!node || !node.species) return;

    result.push({
      name: node.species.name,
      url: node.species.url,
      stage,
    });

    if (node.evolves_to && node.evolves_to.length > 0) {
      node.evolves_to.forEach((child) => walk(child, stage + 1));
    }
  }

  walk(evoData.chain, 1);
  return result;
}

function getIdFromSpeciesUrl(url) {
  if (!url) return null;
  const parts = url.split("/").filter(Boolean);
  const last = parts[parts.length - 1];
  const id = parseInt(last, 10);
  return isNaN(id) ? null : id;
}


function pokemonCardTemplate(p) {
  const mainType = p.types[0].type.name;
  const imgSrc = getPokemonImage(p);

  const typesHtml = p.types
    .map(
      (t) =>
        `<span class="type-badge">${translateTypeName(t.type.name)}</span>`
    )
    .join("");

  return `
    <div class="pokemon-card type-${mainType}" onclick="showDetail(${p.id})">
      <h3>#${p.id} ${capitalize(p.name)}</h3>
      <img src="${imgSrc}" alt="${p.name}">
      <div class="type-badges">${typesHtml}</div>
    </div>
  `;
}


function detailCardTemplate(p) {
  const mainType = p.types[0].type.name;
  const imgSrc = getPokemonImage(p);

  const typeBadges = p.types
    .map(
      (t) => `<span class="type-chip">${translateTypeName(t.type.name)}</span>`
    )
    .join("");

  return `
    <button class="detail-close" onclick="closeDetail()">×</button>

    <div class="detail-header">
      <div class="detail-title">
        <span class="detail-id">#${p.id}</span>
        <h2>${capitalize(p.name)}</h2>
        <div class="detail-types">
          ${typeBadges}
        </div>
      </div>
      <div class="detail-image">
        <img src="${imgSrc}" alt="${p.name}">
      </div>
    </div>

    <div class="detail-info-row">
      <div class="info-pill">
        <span class="info-label">Größe</span>
        <span class="info-value">${(p.height / 10).toFixed(1)} m</span>
      </div>
      <div class="info-pill">
        <span class="info-label">Gewicht</span>
        <span class="info-value">${(p.weight / 10).toFixed(1)} kg</span>
      </div>
      <div class="info-pill">
        <span class="info-label">Basis-EP</span>
        <span class="info-value">${p.base_experience}</span>
      </div>
    </div>

    <div class="tabs">
      <button id="tab-main" class="active" onclick="showTab('main', ${p.id})">Überblick</button>
      <button id="tab-stats" onclick="showTab('stats', ${p.id})">Werte</button>
      <button id="tab-evo" onclick="showTab('evo', ${p.id})">Entwicklung</button>
    </div>

    <div id="tabContent">
      ${mainTabTemplate(p)}
    </div>

    <div class="detail-nav">
      <button onclick="prevPokemon()">◀ Zurück</button>
      <button onclick="nextPokemon()">Weiter ▶</button>
    </div>
  `;
}


function mainTabTemplate(p) {
  return `
    <div class="tab-section">
      <h3>Fähigkeiten</h3>
      <div class="abilities-grid">
        ${p.abilities
          .map((a, index) => {
            const name = capitalize(a.ability.name);
            const tag = a.is_hidden
              ? "Versteckte Fähigkeit"
              : "Standard-Fähigkeit";
            const cardClass = a.is_hidden
              ? "ability-card ability-hidden"
              : "ability-card";

            return `
              <div class="${cardClass}">
                <div class="ability-badge">${index + 1}</div>
                <div class="ability-texts">
                  <div class="ability-name">${name}</div>
                  <div class="ability-tag">${tag}</div>
                </div>
              </div>
            `;
          })
          .join("")}
      </div>
    </div>
  `;
}


function statsTabTemplate(p) {
  return `
    <div class="tab-section">
      <h3>Basiswerte</h3>
      ${p.stats
        .map(
          (s) => `
        <div class="stat-row">
          <span class="stat-name">${translateStatName(s.stat.name)}</span>
          <div class="stat-bar">
            <progress value="${s.base_stat}" max="200"></progress>
          </div>
          <span class="stat-value">${s.base_stat}</span>
        </div>
      `
        )
        .join("")}
    </div>
  `;
}


function evoTabTemplate(p) {
  if (!p.evolutionChain) {
    return `<p class="evo-chain">Keine Evolutionsdaten gefunden.</p>`;
  }

  const chainEntries = parseEvolutionChain(p.evolutionChain);
  if (!chainEntries.length) {
    return `<p class="evo-chain">Keine Evolutionsdaten gefunden.</p>`;
  }

  const stepsHtml = chainEntries
    .map((e) => {
      const id = getIdFromSpeciesUrl(e.url);
      const imgUrl = id
        ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
        : "";
      return `
        <div class="evo-step">
          <div class="evo-stage">Stufe ${e.stage}</div>
          <div class="evo-img-wrapper">
            ${
              imgUrl
                ? `<img src="${imgUrl}" alt="${e.name}">`
                : `<div class="evo-placeholder"></div>`
            }
          </div>
          <div class="evo-name">${capitalize(e.name)}</div>
        </div>
      `;
    })
    .join('<div class="evo-arrow">➜</div>');

  return `
    <div class="tab-section">
      <h3>Entwicklungskette</h3>
      <div class="evo-row">
        ${stepsHtml}
      </div>
    </div>
  `;
}


function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
