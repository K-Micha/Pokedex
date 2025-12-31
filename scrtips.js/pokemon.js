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

function renderList(list) {
  if (isLoaderVisible()) return;

  const container = getPokemonContainer();
  if (!container) return;

  container.innerHTML = "";

  list.forEach((p) => {
    container.appendChild(createPokemonCard(p));
  });
}

// --- helpers ---

function isLoaderVisible() {
  const loader = document.getElementById("loader");
  return loader && !loader.classList.contains("hidden");
}

function getPokemonContainer() {
  return document.getElementById("pokemon_container");
}

function createPokemonCard(p) {
  const card = document.createElement("section");
  card.className = "pokemon_card";
  card.style.background = getCardBackground(p);
  card.onclick = () => show_detail(p.id); // besser als setAttribute("onclick", ...)

  card.innerHTML = cardTemplate(p);
  return card;
}

function getCardBackground(p) {
  return `linear-gradient(135deg, ${getTypeColor(p)}, #222)`;
}

function cardTemplate(p) {
  const typesHtml = typesTemplate(p.types);
  const imgSrc = getPokemonImage(p);

  return `
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
}

function typesTemplate(types) {
  return types
    .map(
      (t) => `
        <div class="type_box">
          <span class="type_badge">${capitalize(t.type.name)}</span>
        </div>
      `
    )
    .join("");
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