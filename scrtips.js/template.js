function cardTemplate(p, imgSrc, typesHtml) {
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