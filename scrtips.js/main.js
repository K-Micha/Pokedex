const MIN_LOAD_TIME = 2000; 
let firstLoad = true;
let isLoading = false;

// loader
function showLoader() {
  const loader = document.getElementById("loader");
  if (loader) loader.classList.remove("hidden");
}

function hideLoader() {
  const loader = document.getElementById("loader");
  if (loader) loader.classList.add("hidden");
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

  // first loader
  if (firstLoad) {
    const grid = document.getElementById("pokemon_container");
    if (grid) grid.classList.remove("hidden");
    firstLoad = false;
  }

  isLoading = false;
}


async function onloadFunc() {

  const grid = document.getElementById("pokemon_container");
  if (grid) grid.classList.add("hidden");

  await loadWithLoader();
}


async function more() {
  await loadWithLoader();
}
