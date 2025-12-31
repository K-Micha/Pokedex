
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
    const value = getSearchValue().trim();

    if (handleEmptySearch(value)) return;
    if (await handleNumericSearch(value)) return;
    if (handleTooShortName(value)) return;

    await handleNameSearch(value);
}

// --- cases ---

function handleEmptySearch(value) {
    if (value !== "") return false;

    setSearchHint(false);
    setLoadMoreVisible(true);
    renderList(pokemons);
    return true;
}

async function handleNumericSearch(value) {
    if (isNaN(value)) return false;

    setSearchHint(false);
    setLoadMoreVisible(false);

    const id = Number(value);
    if (id < 1) {
        setSearchHint(true);
        renderList([]);
        return true;
    }

    await searchById(value);
    return true;
}

function handleTooShortName(value) {
    if (value.length >= 3) return false;

    setSearchHint(true);
    setLoadMoreVisible(false);
    renderList([]);
    return true;
}

async function handleNameSearch(value) {
    setSearchHint(false);
    setLoadMoreVisible(false);
    await searchByName(value);
}


function setLoadMoreVisible(visible) {
    const btn = document.getElementById("loadMoreBtn");
    if (!btn) return;
    btn.style.display = visible ? "block" : "none";
}

document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("search_input");
    if (!input) return;

    input.addEventListener("input", () => {
        filterPokemons();
    });
});