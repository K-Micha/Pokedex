function updateDialogHeader(p) {
    const idEl = document.getElementById("pokemon_id");
    const nameEl = document.getElementById("pokemon_name");
    const typeEl = document.getElementById("pokemon_typ");
    const header = document.getElementById("dialog_header");

    if (!idEl || !nameEl || !typeEl || !header) return;

    idEl.textContent = "#" + p.id;
    nameEl.textContent = capitalize(p.name);

    typeEl.innerHTML = "";
    p.types.forEach(t => {
        const line = document.createElement("p");
        line.textContent = t.type.name;
        typeEl.appendChild(line);
    });

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

async function getMoveType(moveUrl) {
    const res = await fetch(moveUrl);
    const data = await res.json();
    return data.type.name;
}

async function updateOverviewMoves(p) {
    const moves = (p.moves && p.moves.slice(0, 4)) || [];

    for (let i = 0; i < 4; i++) {
        const el = document.getElementById("pokemon_move_" + (i + 1));
        if (!el) continue;

        const move = moves[i];
        if (!move) {
            el.textContent = "";
            el.style.background = "";
            continue;
        }

        const moveName = capitalize(move.move.name);
        el.textContent = "Attacke: " + moveName;

        // Moves Typ  
        const typeName = await getMoveType(move.move.url);
        el.style.background = TYPE_COLORS[typeName] || "#ccc";
    }
}

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

// open/close
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