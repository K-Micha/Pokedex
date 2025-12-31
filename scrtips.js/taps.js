
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