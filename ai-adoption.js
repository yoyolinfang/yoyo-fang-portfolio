const lensData = {
  growth: {
    number: "01 / GROWTH",
    title: "Smart eyewear appeared alongside stronger consumer-channel momentum.",
    text: "Direct-to-Consumer revenue grew faster than Professional Solutions, while Ray-Ban Meta quarterly shipments accelerated sharply through 2024.",
    value: "7.1%",
    label: "DTC growth at constant exchange rates",
    source: "Paper tables 3–4 · FY2023–FY2024",
    rows: [["Professional Solutions", 4.7], ["Direct to Consumer", 7.1], ["Total revenue", 6.0]]
  },
  cost: {
    number: "02 / COST PRESSURE",
    title: "The new category expanded the short-term expense base.",
    text: "Selling expenses rose faster than total revenue. The paper links part of this increase to product roll-out, promotion, positioning, and consumer education.",
    value: "7.4%",
    label: "selling-cost growth at constant exchange rates",
    source: "Paper table 5 · adjusted figures",
    rows: [["Revenue", 6.0], ["Selling", 7.4], ["Total operating expenses", 5.4]]
  },
  innovation: {
    number: "03 / INNOVATION",
    title: "R&D grew almost twice as fast as Group revenue.",
    text: "Moving from traditional eyewear toward cameras, sensors, chips, voice interaction, connectivity, and AI assistance required a different innovation-cost profile.",
    value: "11.6%",
    label: "R&D growth at constant exchange rates",
    source: "Paper table 5 · adjusted figures",
    rows: [["Revenue", 6.0], ["Research & development", 11.6], ["Operating profit", 9.4]]
  }
};

function renderLens(name) {
  const view = lensData[name];
  const max = Math.max(...view.rows.map((row) => row[1]));
  document.getElementById("lens-number").textContent = view.number;
  document.getElementById("lens-title").textContent = view.title;
  document.getElementById("lens-text").textContent = view.text;
  document.getElementById("lens-value").textContent = view.value;
  document.getElementById("lens-label").textContent = view.label;
  document.getElementById("lens-viz").innerHTML = view.rows.map(([label, value]) => `
    <div class="viz-row ${value === max ? "highlight" : ""}">
      <span>${label}</span>
      <div class="viz-bar"><i style="--width:${value / max * 100}%"></i></div>
      <b>+${value.toFixed(1)}%</b>
    </div>`).join("") + `<small class="viz-source">${view.source}</small>`;
  document.querySelectorAll("[data-lens]").forEach((button) => {
    button.setAttribute("aria-selected", button.dataset.lens === name);
  });
}

document.querySelectorAll("[data-lens]").forEach((button) => {
  button.addEventListener("click", () => renderLens(button.dataset.lens));
});

const sales = [
  { quarter: "2024 Q1", value: 170, angle: 90 },
  { quarter: "2024 Q2", value: 250, angle: 132 },
  { quarter: "2024 Q3", value: 320, angle: 169 },
  { quarter: "2024 Q4", value: 680, angle: 360 }
];
const quarterSlider = document.getElementById("quarter-slider");
quarterSlider.addEventListener("input", () => {
  const current = sales[Number(quarterSlider.value)];
  document.getElementById("quarter-value").textContent = `${current.value}K`;
  document.getElementById("quarter-name").textContent = current.quarter;
  document.getElementById("sales-fill").style.setProperty("--angle", `${current.angle}deg`);
});

const strategies = {
  scale: ["SPREAD FIXED COSTS", "Scale economies", "As volume expands, fixed launch and consumer-education costs can be distributed across a larger product base. Wider distribution in high-growth regions could accelerate that effect.", "MORE VOLUME → LOWER AVERAGE COST → STRONGER UNIT ECONOMICS"],
  marketing: ["IMPROVE SPEND EFFICIENCY", "Targeted marketing", "More precise digital promotion—especially through Meta’s platforms—could improve targeting efficiency and reduce reliance on broad, expensive awareness campaigns.", "BETTER TARGETING → LOWER ACQUISITION WASTE → HIGHER RETURN ON SPEND"],
  partnership: ["SHARE THE BURDEN", "Shared technology", "Co-developing AI assistants, cloud services, and hardware integration with Meta can distribute financial risk while accelerating knowledge transfer.", "CO-DEVELOPMENT → SHARED COST & RISK → SUSTAINABLE INNOVATION"],
  pricing: ["RECOVER INVESTMENT", "Premium pricing", "Limited editions and luxury collaborations can capture consumers’ willingness to pay for innovation, helping recover part of the development and launch investment.", "DIFFERENTIATION → PRICE PREMIUM → MARGIN SUPPORT"]
};

document.querySelectorAll("[data-strategy]").forEach((button) => {
  button.addEventListener("click", () => {
    const [kicker, title, copy, path] = strategies[button.dataset.strategy];
    document.querySelectorAll("[data-strategy]").forEach((item) => item.setAttribute("aria-selected", item === button));
    document.getElementById("strategy-kicker").textContent = kicker;
    document.getElementById("strategy-title").textContent = title;
    document.getElementById("strategy-copy").textContent = copy;
    document.getElementById("strategy-path").textContent = path;
  });
});

const pageDialog = document.getElementById("page-dialog");
document.querySelectorAll("[data-page]").forEach((button) => {
  button.addEventListener("click", () => {
    const image = document.getElementById("dialog-image");
    image.src = button.dataset.page;
    image.alt = button.dataset.caption;
    document.getElementById("dialog-caption").textContent = button.dataset.caption;
    pageDialog.showModal();
  });
});
document.querySelector(".dialog-close").addEventListener("click", () => pageDialog.close());
pageDialog.addEventListener("click", (event) => {
  if (event.target === pageDialog) pageDialog.close();
});

const progress = document.querySelector(".read-progress span");
function updateProgress() {
  const distance = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = `${distance ? scrollY / distance * 100 : 0}%`;
}
addEventListener("scroll", updateProgress, { passive: true });
updateProgress();
renderLens("growth");
document.getElementById("sales-fill").style.setProperty("--angle", "90deg");
