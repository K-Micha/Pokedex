const MIN_LOAD_TIME = 2000;
let firstLoad = true;
let isLoading = false;
let currentIndex = 0;


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
  setLoading(true);

  const start = startLoadingUi();
  await loadMore();
  await waitMinLoadTime(start);

  finishLoadingUi();
  showGridOnFirstLoad();

  setLoading(false);
}

function setLoading(state) {
  isLoading = state;
}

function startLoadingUi() {
  showLoader();
  return Date.now();
}

async function waitMinLoadTime(start) {
  const elapsed = Date.now() - start;
  const wait = Math.max(0, MIN_LOAD_TIME - elapsed);
  if (wait) await sleep(wait);
}

function finishLoadingUi() {
  hideLoader();
  renderList(pokemons);
}

function showGridOnFirstLoad() {
  if (!firstLoad) return;

  const grid = document.getElementById("pokemon_container");
  if (grid) grid.classList.remove("hidden");

  firstLoad = false;
}

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
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

function updateStats(p) {
  const s = p.stats;
  if (!s || s.length < 6) return;

  const kp = document.getElementById("pokemon_kp");
  const dmg = document.getElementById("pokemon_dmg");
  const def = document.getElementById("pokemon_def");
  const sDmg = document.getElementById("pokemon_s_dmg");
  const sDef = document.getElementById("pokemon_s_def");
  const init = document.getElementById("pokemon_Initiative");

  if (kp) kp.textContent = " " + s[0].base_stat;
  if (dmg) dmg.textContent = " " + s[1].base_stat;
  if (def) def.textContent = " " + s[2].base_stat;
  if (sDmg) sDmg.textContent = " " + s[3].base_stat;
  if (sDef) sDef.textContent = " " + s[4].base_stat;
  if (init) init.textContent = " " + s[5].base_stat;
}

// Evolution Tab
async function loadSpecies(id) {
  try {
    const res = await fetch(`${API_BASE}/pokemon-species/${id}`);
    if (!res.ok) throw new Error("Species fetch failed");

    return await res.json();
  } catch (err) {
    console.error("loadSpecies:", err);
    return null;
  }
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
  try {
    const res = await fetch(`${API_BASE}/pokemon/${id}`);
    if (!res.ok) throw new Error("Sprite fetch failed");

    const data = await res.json();

    return (
      data.sprites?.other?.["official-artwork"]?.front_default ||
      data.sprites?.front_default ||
      ""
    );
  } catch (err) {
    console.error("getSprite:", err);
    return "";
  }
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

function hideEmptyEvolutionSteps(stages) {
  for (let i = 1; i <= 3; i++) {
    const boxEl = document.getElementById("step_" + i);
    const arrowEl = document.getElementById("arrow_" + i);

    if (!boxEl) continue;

    if (!stages[i - 1]) {

      boxEl.style.display = "none";
    } else {

      boxEl.style.display = "";
    }


    if (arrowEl) {
      if (!stages[i]) {
        arrowEl.style.display = "none";
      } else {
        arrowEl.style.display = "";
      }
    }
  }
}

async function updateEvolution(p) {
  const species = await loadSpecies(p.id);
  const chain = await loadChain(species.evolution_chain.url);
  const stages = parseChain(chain);

  await updateEvoStage(stages, 1);
  await updateEvoStage(stages, 2);
  await updateEvoStage(stages, 3);
  hideEmptyEvolutionSteps(stages);
}

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