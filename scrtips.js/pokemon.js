// ===== GLOBALS =====
let pokemons = [];
let activeList = [];
let offset = 0;
let currentIndex = 0;

const API_BASE = "https://pokeapi.co/api/v2";
const LIMIT = 20;

let container; 

// loader start
document.addEventListener("DOMContentLoaded", () => {
  initPokedex();
});


function initPokedex() {
  container = document.getElementById("pokemon_container");
  if (!container) {
    console.error("pokemon_container not found");
    return;
  }

  showLoader();
  loadMore();
}

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


async function loadMore() {
  try {
    const res = await fetch(`${API_BASE}/pokemon?limit=${LIMIT}&offset=${offset}`);
    if (!res.ok) {
      throw new Error("HTTP error " + res.status);
    }

    const data = await res.json();

    const details = await Promise.all(
      data.results.map((entry) => fetch(entry.url).then((r) => r.json()))
    );

    pokemons.push(...details);
    offset += LIMIT;

    activeList = [...pokemons];
    renderList(activeList);
  } catch (e) {
    console.error("Error in loadMore:", e);
  } finally {
    hideLoader();
  }
}
