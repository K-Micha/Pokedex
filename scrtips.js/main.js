const MIN_LOAD_TIME = 2000;
let firstLoad = true;
let isLoading = false;
let currentIndex = 0;

// Loader
function showLoader() {
  const loader = document.getElementById("loader");
  if (loader) {
    loader.classList.remove("hidden");
  }
}

function hideLoader() {
  const loader = document.getElementById("loader");
  if (loader) {
    loader.classList.add("hidden");
  }
}

async function loadWithLoader() {
  if (isLoading) return;
  isLoading = true;

  const start = Date.now();
  showLoader();

  await loadMore();

  const elapsed = Date.now() - start;
  const wait = Math.max(0, MIN_LOAD_TIME - elapsed);

  if (wait > 0) {
    await new Promise((res) => setTimeout(res, wait));
  }

  hideLoader();
  renderList(pokemons);

  if (firstLoad) {
    const grid = document.getElementById("pokemon_container");
    if (grid) {
      grid.classList.remove("hidden");
    }
    firstLoad = false;
  }

  isLoading = false;
}

async function onloadFunc() {
  const grid = document.getElementById("pokemon_container");
  if (grid) {
    grid.classList.add("hidden");
  }

  await loadWithLoader();
  initDialogOverlay();
}

async function more() {
  await loadWithLoader();
}

// Dialog-Header
function updateDialogHeader(p) {
  const idEl = document.getElementById("pokemon_id");
  const nameEl = document.getElementById("pokemon_name");
  const typeEl = document.getElementById("pokemon_typ");
  const header = document.getElementById("dialog_header"); 

  if (!idEl || !nameEl || !typeEl || !header) return;

  idEl.textContent = "#" + p.id;
  nameEl.textContent = capitalize(p.name);

  const types = p.types.map((t) => t.type.name).join(", ");
  typeEl.textContent = types;

  header.style.background = getTypeColor(p);
}

function updateDialogImage(p) {
  const img = document.getElementById("dialog_pokemon_img");
  if (!img) return;

  img.classList.add("dialog_pokemon_img");

  const sprites = p.sprites;
  const art =
    sprites &&
    sprites.other &&
    sprites.other["official-artwork"] &&
    sprites.other["official-artwork"].front_default;
  const normal = sprites && sprites.front_default;

  img.src = art || normal || "";
  img.alt = p.name;
}

// Overview
function updateOverview(p) {
  const h = document.getElementById("pokemon_height");
  const w = document.getElementById("pokemon_weight");
  const ep = document.getElementById("basic_ep");

  if (h) {
    h.textContent = " " + p.height / 10 + " m";
  }
  if (w) {
    w.textContent = " " + p.weight / 10 + " kg";
  }
  if (ep) {
    ep.textContent = "" + p.base_experience;
  }

  updateOverviewMoves(p);
}

function updateOverviewMoves(p) {
  const moves = (p.moves && p.moves.slice(0, 4)) || [];

  for (let i = 0; i < 4; i++) {
    const el = document.getElementById("pokemon_move_" + (i + 1));
    if (!el) continue;

    const move = moves[i];
    if (!move) {
      el.textContent = "";
      continue;
    }

    el.textContent = "Attacke " + (i + 1) + ": " + capitalize(move.move.name);
  }
}

// Stats
function updateStats(p) {
  const s = p.stats;
  if (!s || s.length < 6) return;

  const kp = document.getElementById("pokemon_kp");
  const dmg = document.getElementById("pokemon_dmg");
  const def = document.getElementById("pokemon_def");
  const sDmg = document.getElementById("pokemon_s_dmg");
  const sDef = document.getElementById("pokemon_s_def");
  const init = document.getElementById("pokemon_Initiative");

  if (kp) kp.textContent = "KP: " + s[0].base_stat;
  if (dmg) dmg.textContent = "Dmg: " + s[1].base_stat;
  if (def) def.textContent = "Def: " + s[2].base_stat;
  if (sDmg) sDmg.textContent = "Spez. Dmg: " + s[3].base_stat;
  if (sDef) sDef.textContent = "Spez. Def: " + s[4].base_stat;
  if (init) init.textContent = "Initiative: " + s[5].base_stat;
}

// Evolution Tab
async function loadSpecies(id) {
  const res = await fetch("https://pokeapi.co/api/v2/pokemon-species/" + id);
  return await res.json();
  
}

async function loadChain(url) {
  const res = await fetch(url);
  return await res.json();
}

function parseChain(chain) {
  const result = [];
  let node = chain.chain;

  while (node) {
    result.push(node.species);
    node = node.evolves_to[0];
  }
  return result;
}

function getIdFromSpecies(species) {
  const match = species.url.match(/\/(\d+)\/$/);
  return match ? match[1] : null;
}

async function getSprite(id) {
  const res = await fetch("https://pokeapi.co/api/v2/pokemon/" + id);
  const data = await res.json();

  const art =
    data.sprites &&
    data.sprites.other &&
    data.sprites.other["official-artwork"] &&
    data.sprites.other["official-artwork"].front_default;
  const normal = data.sprites && data.sprites.front_default;

  return art || normal || "";
}

async function updateEvoStage(stages, stage) {
  const species = stages[stage - 1];
  const nameEl = document.getElementById("evo_name_" + stage);
  const imgEl = document.getElementById("evo_img_" + stage);

  if (!nameEl || !imgEl) return;

  if (!species) {
    nameEl.textContent = "";
    imgEl.src = "";
    return;
  }

  const id = getIdFromSpecies(species);
  nameEl.textContent = capitalize(species.name);
  imgEl.src = id ? await getSprite(id) : "";
}

async function updateEvolution(p) {
  const species = await loadSpecies(p.id);
  const chain = await loadChain(species.evolution_chain.url);
  const stages = parseChain(chain);

  await updateEvoStage(stages, 1);
  await updateEvoStage(stages, 2);
  await updateEvoStage(stages, 3);
}

// Section Button Reset
function resetSections() {
  const basicList = document.getElementsByClassName("basic_stats");
  const statsList = document.getElementsByClassName("stats_tamplete");
  const evoList = document.getElementsByClassName("evo_box");

  if (basicList.length > 0) {
    basicList[0].classList.remove("active");
  }
  if (statsList.length > 0) {
    statsList[0].classList.remove("active");
  }
  if (evoList.length > 0) {
    evoList[0].classList.remove("active");
  }
}

function resetButtons() {
  const info = document.getElementById("information");
  const statsBtn = document.getElementById("stats");
  const evoBtn = document.getElementById("evo");

  if (info) info.classList.remove("btn_active");
  if (statsBtn) statsBtn.classList.remove("btn_active");
  if (evoBtn) evoBtn.classList.remove("btn_active");
}

// Tabs
function information() {
  resetSections();
  resetButtons();

  const basicList = document.getElementsByClassName("basic_stats");
  const btn = document.getElementById("information");

  if (basicList.length > 0) {
    basicList[0].classList.add("active");
  }
  if (btn) {
    btn.classList.add("btn_active");
  }
}

function stats() {
  resetSections();
  resetButtons();

  const statsList = document.getElementsByClassName("stats_tamplete");
  const btn = document.getElementById("stats");

  if (statsList.length > 0) {
    statsList[0].classList.add("active");
  }
  if (btn) {
    btn.classList.add("btn_active");
  }
}

async function evo() {
  resetSections();
  resetButtons();

  const evoList = document.getElementsByClassName("evo_box");
  const btn = document.getElementById("evo");

  if (evoList.length > 0) {
    evoList[0].classList.add("active");
  }
  if (btn) {
    btn.classList.add("btn_active");
  }

  const p = pokemons[currentIndex];
  if (p) {
    await updateEvolution(p);
  }
}

//Pokemon in Dialog
function showCurrentPokemon() {
  if (!pokemons.length) return;

  const pokemon = pokemons[currentIndex];
  if (!pokemon) return;

  updateDialogHeader(pokemon);
  updateDialogImage(pokemon);
  updateOverview(pokemon);
  updateStats(pokemon);

    if (isEvoTabActive()) {
    updateEvolution(pokemon);
  }
  
}
function isEvoTabActive() {
  const evoList = document.getElementsByClassName("evo_box");
  if (evoList.length === 0) return false;

  const evoBox = evoList[0];
  return evoBox.classList.contains("active");
}


// Dialog open/close
function show_detail(id) {
  const index = pokemons.findIndex((pokemon) => pokemon.id === id);
  if (index === -1) return;

  currentIndex = index;
  showCurrentPokemon();
  information();

  setDialogState(true);
}

function setDialogState(isOpen) {
  const dialog = document.getElementById("pokemon_dialog");
  if (!dialog) return;

  if (isOpen) {
    dialog.classList.add("show");
    document.body.classList.add("body_lock");
  } else {
    dialog.classList.remove("show");
    document.body.classList.remove("body_lock");
  }
}

function dialog_btn_close() {
  setDialogState(false);
}

// Dialog Overlay 
function initDialogOverlay() {
  const dialog = document.getElementById("pokemon_dialog");
  if (!dialog) return;

  const contentList = document.getElementsByClassName("content");
  const content = contentList.length > 0 ? contentList[0] : null;

  dialog.addEventListener("click", function (event) {
    if (!content) return;

    if (!content.contains(event.target)) {
      dialog_btn_close();
    }
  });
}

// Buttons
function next_btn() {
  if (!pokemons.length) return;

  currentIndex = (currentIndex + 1) % pokemons.length;
  showCurrentPokemon();
}

function back_btn() {
  if (!pokemons.length) return;

  if (currentIndex === 0) {
    currentIndex = pokemons.length - 1;
  } else {
    currentIndex = currentIndex - 1;
  }

  showCurrentPokemon();
}
