const modelViews = {
  model1: {
    rows: [["Camera", .6495, "<.001"], ["Smart / AI", .3802, ".003"], ["Audio", .2467, ".021"], ["Battery", .0266, ".814"]],
    title: "Model 1 context",
    copy: "The pooled sentence-level model used all 645 reviews and explained 13.5% of rating variation. Camera, Smart/AI, and Audio were significant; Battery was not."
  },
  model2: {
    rows: [["Camera", .6358, "<.001"], ["Smart / AI", .4079, ".001"], ["Audio", .2541, ".016"], ["Battery", .0111, ".921"]],
    title: "Model 2 context",
    copy: "Adding product generation raised R² to .156. The Gen 2 dummy was positive and significant (β=.424, p<.001), while maximum VIF was 1.184."
  },
  interaction: {
    rows: [["Camera · Gen 1", .7998, "<.001"], ["Camera · Gen 2", .3536, "derived"], ["Smart · Gen 1", .4252, ".006"], ["Smart · Gen 2", .3440, "derived"]],
    title: "Generation interaction",
    copy: "Feature associations differed jointly across generations (p=.047). Camera was the only individual interaction that was significant: β=−.446, p=.025."
  },
  robustness: {
    rows: [["Camera · whole review", .7176, "<.001"], ["Smart · whole review", .3207, ".010"], ["Audio · whole review", .2495, ".028"], ["Battery · whole review", -.0669, ".561"]],
    title: "Method robustness",
    copy: "The whole-review specification preserved the same overall pattern. Ordered logit also kept Camera, Smart/AI, Audio, and Gen 2 positive and significant."
  }
};

function renderModel(name) {
  const view = modelViews[name];
  const max = Math.max(...view.rows.map((row) => Math.abs(row[1])));
  document.getElementById("model-chart").innerHTML = view.rows.map(([label, value, p]) => `
    <div class="coef-row ${p !== ".921" && p !== ".814" && p !== ".561" && p !== "derived" ? "significant" : ""}">
      <span>${label}</span>
      <div class="bar ${value < 0 ? "negative" : ""}"><i style="--value:${Math.max(3, Math.abs(value) / max * 100)}%"></i></div>
      <strong>${value >= 0 ? "+" : "−"}${Math.abs(value).toFixed(3)}</strong>
      <small>${p === "derived" ? p : `p=${p}`}</small>
    </div>`).join("");
  document.getElementById("model-note-title").textContent = view.title;
  document.getElementById("model-note-copy").textContent = view.copy;
  document.querySelectorAll("[data-model]").forEach((button) => {
    button.setAttribute("aria-selected", button.dataset.model === name);
  });
}

document.querySelectorAll("[data-model]").forEach((button) => {
  button.addEventListener("click", () => renderModel(button.dataset.model));
});

document.querySelectorAll(".pipeline article").forEach((card) => {
  const toggle = () => card.classList.toggle("active");
  card.addEventListener("click", toggle);
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggle();
    }
  });
});

fetch("feature_sentiment.py")
  .then((response) => {
    if (!response.ok) throw new Error("Unable to load code");
    return response.text();
  })
  .then((code) => {
    document.getElementById("vader-code").textContent = code;
  })
  .catch(() => {
    document.getElementById("vader-code").textContent =
      "The code preview could not be loaded. Use “Download .py” above.";
  });

renderModel("model2");
