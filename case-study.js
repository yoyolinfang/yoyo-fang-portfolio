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

const coefficientNotes = {
  Camera: "A one-step increase in camera sentiment was associated with the largest increase in rating, holding the other modeled factors constant.",
  "Smart / AI": "More positive sentiment toward Smart and AI functions was associated with higher ratings after controlling for product generation.",
  Audio: "Audio sentiment had a smaller but statistically significant positive association with ratings.",
  Battery: "Battery sentiment was not statistically distinguishable from zero in this model.",
  "Camera · Gen 1": "Camera sentiment had a particularly strong association with ratings among Gen 1 reviews.",
  "Camera · Gen 2": "The estimated camera association remained positive for Gen 2, but was smaller than for Gen 1.",
  "Smart · Gen 1": "Smart-feature sentiment was positively associated with Gen 1 ratings.",
  "Smart · Gen 2": "The derived Gen 2 effect remained positive; the cross-generation difference was not individually significant.",
  "Camera · whole review": "Using whole-review sentiment instead of sentence-level matching preserved camera as the strongest result.",
  "Smart · whole review": "The whole-review robustness model retained a positive Smart/AI association.",
  "Audio · whole review": "Audio remained positive and significant under the alternative sentiment specification.",
  "Battery · whole review": "Battery remained non-significant in the whole-review robustness model."
};

function renderModel(name) {
  const view = modelViews[name];
  const max = Math.max(...view.rows.map((row) => Math.abs(row[1])));
  document.getElementById("model-chart").innerHTML = view.rows.map(([label, value, p], index) => `
    <button class="coef-row ${index === 0 ? "active " : ""}${p !== ".921" && p !== ".814" && p !== ".561" && p !== "derived" ? "significant" : ""}" data-label="${label}" data-value="${value}">
      <span>${label}</span>
      <div class="bar ${value < 0 ? "negative" : ""}"><i style="--value:${Math.max(3, Math.abs(value) / max * 100)}%"></i></div>
      <strong>${value >= 0 ? "+" : "−"}${Math.abs(value).toFixed(3)}</strong>
      <small>${p === "derived" ? p : `p=${p}`}</small>
    </button>`).join("");
  document.getElementById("model-note-title").textContent = view.title;
  document.getElementById("model-note-copy").textContent = view.copy;
  document.querySelectorAll("[data-model]").forEach((button) => {
    button.setAttribute("aria-selected", button.dataset.model === name);
  });
  document.querySelectorAll(".coef-row").forEach((row) => row.addEventListener("click", () => inspectCoefficient(row)));
  inspectCoefficient(document.querySelector(".coef-row"));
}

function inspectCoefficient(row) {
  if (!row) return;
  document.querySelectorAll(".coef-row").forEach((item) => item.classList.toggle("active", item === row));
  const value = Number(row.dataset.value);
  document.getElementById("inspector-title").textContent = row.dataset.label;
  document.getElementById("inspector-copy").textContent = coefficientNotes[row.dataset.label];
  document.getElementById("inspector-value").textContent = `β ${value >= 0 ? "+" : "−"}${Math.abs(value).toFixed(3)}`;
}

const featureEvidence = {
  camera: ["CAMERA", "337 of 645 reviews mentioned camera", "Camera was both widely discussed and strongly associated with ratings.", "Its Model 2 coefficient was +0.636 (p<.001), the largest among the four feature-sentiment measures."],
  audio: ["AUDIO", "235 of 645 reviews mentioned audio", "Audio mattered, but its estimated relationship was more moderate.", "Audio sentiment was positively associated with ratings in Model 2 (β=+0.254, p=.016)."],
  battery: ["BATTERY", "170 of 645 reviews mentioned battery", "Battery appeared often, but sentiment did not explain rating differences.", "Its Model 2 coefficient was near zero (β=+0.011, p=.921), so the analysis found no reliable association."],
  smart: ["SMART / AI", "156 of 645 reviews mentioned Smart or AI functions", "Smart-feature sentiment was less common but meaningfully related to ratings.", "The Model 2 association was positive and significant (β=+0.408, p=.001)."]
};

document.querySelectorAll("[data-feature]").forEach((button) => {
  button.addEventListener("click", () => {
    const [core, count, title, copy] = featureEvidence[button.dataset.feature];
    document.querySelectorAll("[data-feature]").forEach((item) => item.classList.toggle("active", item === button));
    document.getElementById("orbit-core").textContent = core;
    document.getElementById("evidence-count").textContent = count;
    document.getElementById("evidence-title").textContent = title;
    document.getElementById("evidence-text").textContent = copy;
  });
});

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
document.querySelector('[data-feature="camera"]').classList.add("active");

const progressBar = document.querySelector(".reading-progress span");
const chapters = [...document.querySelectorAll("[data-chapter]")];
const sections = chapters.map((link) => document.getElementById(link.dataset.chapter)).filter(Boolean);

function updateReadingState() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = `${scrollable ? window.scrollY / scrollable * 100 : 0}%`;
  let active = sections[0]?.id;
  sections.forEach((section) => {
    if (section.getBoundingClientRect().top <= window.innerHeight * .42) active = section.id;
  });
  chapters.forEach((link) => link.classList.toggle("active", link.dataset.chapter === active));
}

window.addEventListener("scroll", updateReadingState, { passive: true });
updateReadingState();
