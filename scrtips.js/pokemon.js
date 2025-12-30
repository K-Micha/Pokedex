// Pokemon Card rendern 
let pokemons = [];
let offset = 0;

const API_BASE = "https://pokeapi.co/api/v2";
const LIMIT = 20;

const TYPE_COLORS = {
  normal: "#A8A878",
  fire: "#F08030",
  water: "#6890F0",
  electric: "#F8D030",
  grass: "#78C850",
  ice: "#98D8D8",
  fighting: "#C03028",
  poison: "#A040A0",
  ground: "#E0C068",
  flying: "#A890F0",
  psychic: "#F85888",
  bug: "#A8B820",
  rock: "#B8A038",
  ghost: "#705898",
  dragon: "#7038F8",
  dark: "#705848",
  steel: "#B8B8D0",
  fairy: "#EE99AC",
};

function getTypeColor(pokemon) {
  const mainType = pokemon.types[0].type.name;
  return TYPE_COLORS[mainType] || "#888";
}

// Pokemon laden
async function loadMore() {
  const res = await fetch(`${API_BASE}/pokemon?limit=${LIMIT}&offset=${offset}`);
  const data = await res.json();

  const details = await Promise.all(
    data.results.map((entry) => fetch(entry.url).then((r) => r.json()))
  );

  pokemons.push(...details);
  offset += LIMIT;
}

// Liste rendern 
function renderList(list) {
  const loader = document.getElementById("loader");
  if (loader && !loader.classList.contains("hidden")) {
    return;
  }

  const container = document.getElementById("pokemon_container");
  if (!container) return;

  container.innerHTML = "";

  list.forEach((p) => {
    const card = document.createElement("section");
    card.className = "pokemon_card";
    card.style.background = `linear-gradient(135deg, ${getTypeColor(p)}, #222)`;
    card.setAttribute("onclick", "show_detail(" + p.id + ")");

    const typesHtml = p.types
      .map(
        (t) => `
        <div class="type_box">
          <span class="type_badge">${capitalize(t.type.name)}</span>
        </div>
      `
      )
      .join("");

    const imgSrc = getPokemonImage(p);

    card.innerHTML = `
      <div class="card_header">
        <h3>#${p.id} ${capitalize(p.name)}</h3>
      </div>

      <div class="card_body">
        <div class="card_left">
          <div class="type_badges">
            ${typesHtml}
          </div>
        </div>

        <div class="card_right">
          <img class="pokemon_img" src="${imgSrc}" alt="${p.name}">
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}


function getPokemonImage(pokemon) {
  return (
    (pokemon.sprites &&
      pokemon.sprites.other &&
      pokemon.sprites.other["official-artwork"] &&
      pokemon.sprites.other["official-artwork"].front_default) ||
    (pokemon.sprites && pokemon.sprites.front_default) ||
    ""
  );
}

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}


function getSearchValue() {
  const input = document.getElementById("search_input");
  if (!input) return "";
  return input.value.trim().toLowerCase();
}

function setSearchHint(visible) {
  const hint = document.getElementById("search_hint");
  if (!hint) return;

  if (visible) {
    hint.classList.add("active");
  } else {
    hint.classList.remove("active");
  }
}

async function searchById(value) {
  const id = Number(value);
  let found = pokemons.find(p => p.id === id);

  if (!found) {
    const res = await fetch(`${API_BASE}/pokemon/${id}`);
    if (res.ok) {
      found = await res.json();
      if (!pokemons.some(p => p.id === found.id)) {
        pokemons.push(found);
      }
    }
  }

  renderList(found ? [found] : []);
}

async function searchByName(value) {
  let filtered = pokemons.filter(p => p.name.includes(value));
  if (filtered.length) {
    renderList(filtered);
    return;
  }

  const MAX_PAGES = 30;
  for (let i = 0; i < MAX_PAGES; i++) {
    await loadMore();
    filtered = pokemons.filter(p => p.name.includes(value));
    if (filtered.length) {
      renderList(filtered);
      return;
    }
  }

  renderList([]);
}
function getTypeQuery(value) {
  const type = value.trim().toLowerCase();
  return TYPE_COLORS[type] ? type : null;
}

function filterByType(type) {
  return pokemons.filter(p =>
    p.types.some(t => t.type.name === type)
  );
}

async function filterPokemons() {
  const value = getSearchValue();

if (value === "") {
  setSearchHint(false);
  setLoadMoreVisible(true);
  renderList(pokemons);
  return;
}

 if (!isNaN(value)) {
  setSearchHint(false);
    setLoadMoreVisible(false);

  const id = Number(value);

  if (id < 1) {
    setSearchHint(true);
    renderList([]);
    return;
  }

  await searchById(value);
  return;
}


  if (value.length < 3) {
    setSearchHint(true);
      setLoadMoreVisible(false);
    renderList([]);
    return;
  }

  setSearchHint(false);
  setLoadMoreVisible(false);
  await searchByName(value);
}

function setLoadMoreVisible(visible) {
  const btn = document.getElementById("loadMoreBtn");
  if (!btn) return;
  btn.style.display = visible ? "block" : "none";
}
