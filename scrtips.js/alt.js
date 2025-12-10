const API_BASE = "https://pokeapi.co/api/v2";
const LIMIT = 20;

let pokemons = [];         // alle geladenen Pokémon
let activeList = [];       // aktuelle Liste (z.B. nach Suche)
let offset = 0;            // für Pagination
let currentIndex = 0;      // Index in activeList

// DOM-Refs
let container;
let dialog;
let searchInput;

// ===== INIT =====

async function initPokedex() {
  container = document.getElementById("pokemon_container");
  dialog = document.querySelector(".pokemon_dialog");
  searchInput = document.getElementById("search_input");

  if (!container || !dialog) {
    console.error("Container oder Dialog im HTML nicht gefunden.");
    return;
  }

  // Klick auf Karten abfangen (Event Delegation)
  container.addEventListener("click", onCardClick);

  // Falls du keinen Inline-Handler auf dem Button hättest:
  // const searchBtn = document.querySelector(".header_right button");
  // if (searchBtn) searchBtn.addEventListener("click", applySearch);

  // Erste Ladung Pokémon holen
  await loadMore();
}

// Wird im <body onload="onloadFunc()"> aufgerufen
function onloadFunc() {
  initPokedex();
}

// ===== API & DATA =====

async function loadMore() {
  try {
    const url = `${API_BASE}/pokemon?limit=${LIMIT}&offset=${offset}`;
    const res = await fetch(url);
    const data = await res.json();

    const details = await Promise.all(
      data.results.map((entry) =>
        fetch(entry.url).then((r) => r.json())
      )
    );

    pokemons.push(...details);
    offset += LIMIT;

    // Wenn keine aktive Suche → komplette Liste anzeigen
    if (!searchInput || !searchInput.value.trim()) {
      activeList = [...pokemons];
    }

    renderList(activeList.length ? activeList : pokemons);
  } catch (err) {
    console.error("Fehler beim Laden der Pokémon:", err);
  }
}

// ===== RENDERING =====

function renderList(list) {
  if (!container) return;
  container.innerHTML = "";

  list.forEach((p) => {
    const card = document.createElement("section");
    card.className = "pokemon_card";
    card.dataset.id = p.id;

    card.innerHTML = `
      <div class="name_container">
        <h3>#${p.id} ${capitalize(p.name)}</h3>
      </div>
      <img class="pokemon_img" src="${getPokemonImage(p)}" alt="${p.name}">
      <div class="type_badges">
        ${p.types
          .map(
            (t) =>
              `<span class="type_badge">${capitalize(t.type.name)}</span>`
          )
          .join(" ")}
      </div>
    `;

    container.appendChild(card);
  });
}

// ===== CARD CLICK & DIALOG =====

function onCardClick(event) {
  const card = event.target.closest(".pokemon_card");
  if (!card) return;

  const id = Number(card.dataset.id);
  const list = activeList && activeList.length ? activeList : pokemons;
  const index = list.findIndex((p) => p.id === id);
  if (index === -1) return;

  openDialogAt(index);
}

// Fallback, falls dein HTML irgendwo noch onclick="show_detail()" hat
function show_detail() {
  const list = activeList && activeList.length ? activeList : pokemons;
  if (!list.length) return;
  openDialogAt(0);
}

function openDialogAt(index) {
  const list = activeList && activeList.length ? activeList : pokemons;
  if (index < 0 || index >= list.length) return;

  currentIndex = index;
  const pokemon = list[index];

  fillDialog(pokemon);
  openDialog();
}

function fillDialog(pokemon) {
  if (!dialog) return;

  setText("#pokemon_id", `#${pokemon.id}`);
  setText("#pokemon_name", capitalize(pokemon.name));
  setText(
    "#pokemon_typ",
    pokemon.types
      .map((t) => capitalize(t.type.name))
      .join(" / ")
  );

  // Basiswerte
  const heightM = (pokemon.height / 10).toFixed(1);
  const weightKg = (pokemon.weight / 10).toFixed(1);

  setText("#pokemon_height", `Größe: ${heightM} m`);
  setText("#pokemon_weight", `Gewicht: ${weightKg} kg`);
  setText(
    "#basic_ep",
    `Basis-EP: ${pokemon.base_experience ?? "-"}`
  );

  // Kampfstaten
  const get = (name) =>
    pokemon.stats.find((s) => s.stat.name === name)?.base_stat ?? "-";

  setText("#pokemon_kp", `KP: ${get("hp")}`);
  setText("#pokemon_dmg", `Angriff: ${get("attack")}`);
  setText("#pokemon_def", `Verteidigung: ${get("defense")}`);
  setText("#pokemon_s_dmg", `Spezial-Angriff: ${get("special-attack")}`);
  setText("#pokemon_s_def", `Spezial-Verteidigung: ${get("special-defense")}`);
  setText("#pokemon_Initiative", `Initiative: ${get("speed")}`);
}

function openDialog() {
  if (!dialog) return;

  // Variante: CSS macht .pokemon_dialog { display:none } und .pokemon_dialog.open { display:flex; }
  dialog.classList.add("open");
}

function dialog_btn_close() {
  if (!dialog) return;
  dialog.classList.remove("open");
}

// ===== NEXT / BACK BUTTONS =====

function next_btn() {
  const list = activeList && activeList.length ? activeList : pokemons;
  if (!list.length) return;

  let nextIndex = currentIndex + 1;
  if (nextIndex >= list.length) {
    nextIndex = 0; // Loop
  }

  openDialogAt(nextIndex);
}

function back_btn() {
  const list = activeList && activeList.length ? activeList : pokemons;
  if (!list.length) return;

  let prevIndex = currentIndex - 1;
  if (prevIndex < 0) {
    prevIndex = list.length - 1; // Loop
  }

  openDialogAt(prevIndex);
}



// ===== TABS (Überblick / Werte / Entwicklung) =====

// aktuell nur optische Aktivierung der Buttons
function information() {
  setActiveTab("information");
}

function stats() {
  setActiveTab("stats");
}

function evo() {
  setActiveTab("evo");
  // Wenn du später eigenen Evo-Content im Dialog hast,
  // kannst du den hier befüllen.
}

function setActiveTab(activeId) {
  const buttons = document.querySelectorAll(".tabs .btn");
  buttons.forEach((btn) => {
    if (btn.id === activeId) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Falls du später verschiedene Content-Bereiche hast,
  // kannst du die hier entsprechend ein-/ausblenden.
}

// ===== HELPER =====

function setText(selector, text) {
  const el = dialog.querySelector(selector);
  if (el) el.textContent = text;
}

function getPokemonImage(pokemon) {
  return (
    pokemon.sprites.other?.["official-artwork"]?.front_default ||
    pokemon.sprites.other?.dream_world?.front_default ||
    pokemon.sprites.front_default ||
    ""
  );
}

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

