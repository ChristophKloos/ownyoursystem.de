import { fetchData } from "./dp_api.js";
import { calculateResults } from "./dp_engine.js";
import { renderQuestion, renderResults } from "./dp_uishitter.js";
import { initParticles } from "./dp_particles.js";

let state = {
  questions: [],
  distros: [],
  desktops: [],
  nameMapping: {},
  currentIndex: 0,
  answers: {},
};

async function Startquiz() {
  const data = await fetchData();
  state = { ...state, ...data };
  console.log(
    "Starte Partikel mit",
    state.distros ? state.distros.length : 0,
    "Distros",
  );

  initParticles(state.distros);
  showCurrent();
}

function showCurrent(direction = "forward") {
  renderQuestion(
    state.currentIndex,
    state.questions,
    state.answers,
    handleAnswer,
    (idx, dir) => {
      state.currentIndex = idx;
      showCurrent(dir);
    },
    direction,
  );
}

function handleAnswer(qId, value) {
  state.answers[qId] = value;
  setTimeout(() => {
    if (state.currentIndex + 1 < state.questions.length) {
      state.currentIndex++;
      showCurrent("forward");
    } else {
      const results = calculateResults(
        state.distros,
        state.desktops,
        state.answers,
        state.questions,
      );
      renderResults(
        results,
        state.questions,
        state.nameMapping,
        state.desktops,
        state.answers,
      );
    }
  }, 250);
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("start-btn");
  if (btn) {
    btn.addEventListener("click", Startquiz);
  }
});
