import { fetchData } from './dp_api.js';
import { calculateResults } from './dp_engine.js';
import { renderQuestion, renderResults } from './dp_uishitter.js';

let state = {
  questions: [],
  distros: [],
  desktops: [],
  nameMapping: {},
  currentIndex: 0,
  answers: {}
};

async function init() {
  const data = await fetchData();
  state = { ...state, ...data };
  showCurrent();
}

function showCurrent() {
  renderQuestion(
    state.currentIndex, 
    state.questions, 
    state.answers, 
    handleAnswer, 
    (idx) => { state.currentIndex = idx; showCurrent(); }
  );
}

function handleAnswer(qId, value) {
  state.answers[qId] = value;
  setTimeout(() => {
    if (state.currentIndex + 1 < state.questions.length) {
      state.currentIndex++;
      showCurrent();
    } else {
      const results = calculateResults(state.distros, state.desktops, state.answers);
      renderResults(results, state.questions, state.nameMapping, state.desktops, state.answers);
    }
  }, 250);
}

document.addEventListener("DOMContentLoaded", init);