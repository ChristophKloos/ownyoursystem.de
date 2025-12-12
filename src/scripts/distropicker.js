const INITIAL_RESULT_COUNT = 3;

let questions = [];
let currentIndex = 0;
let answers = {}; 
let distros = []; 
let desktops = [];
let desktopModifiers = {};

document.addEventListener("DOMContentLoaded", () => {
  loadQuiz();
});

async function loadQuiz() {
  const [qResp, dResp, deResp] = await Promise.all([
    fetch('/js/json/en.json'),
    fetch('/js/json/distros.json'),
    fetch('/js/json/desktops.json')
  ]);

  questions = await qResp.json();
  console.log("Fragen geladen:", questions);

  distros = await dResp.json();
  console.log("Distros geladen:", distros);

  desktops = await deResp.json();
  console.log("Desktops geladen:", desktops);

  desktopModifiers = desktops.desktops || desktops;
  const desktopKeys = Object.keys(desktopModifiers); 
  console.log("Desktops in keys umgewandelt:", desktopKeys);
  
  showQuestion(currentIndex);
}

function showQuestion(index){
  const container = document.getElementById('quiz-container');
  container.innerHTML = "";

  const q = questions[index];
 
  const headerTitle = document.getElementById("quiz-title");
  const headerSubtitle = document.getElementById("quiz-subtitle");
  const headerProgress = document.getElementById("quiz-progress");

  if(headerTitle) headerTitle.textContent = q.title;
  if(headerSubtitle) headerSubtitle.textContent = `${index + 1} / ${questions.length}`;

  const progressValue = ((index) / questions.length) * 100;
  if(headerProgress) headerProgress.style.width = progressValue + "%";

  const part = document.createElement('div');
  part.classList.add('part');

  const frage = document.createElement('div');
  frage.classList.add('frage');
  frage.innerHTML = `<p>${q.question}</p>`;

  part.appendChild(frage);

  const choice = document.createElement('div');
  choice.classList.add('choice');

  q.options.forEach((opt, i) => {
    const inputId = `${q.id}_opt${i}`;
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = q.id;
    input.id = inputId;
    input.value = opt.value;

    const label = document.createElement('label');
    label.htmlFor = inputId;
    label.innerHTML = opt.text;

    if (answers[q.id] !== undefined && answers[q.id] == opt.value) {
      input.checked = true;
      label.classList.add('active');
    }

    input.addEventListener('change', () => {
      const allLabels = choice.querySelectorAll('label');
      allLabels.forEach(l => l.classList.remove('active'));
      label.classList.add('active');

      answers[q.id] = parseInt(input.value);

      setTimeout(() => {
        if (currentIndex + 1 < questions.length) {
          currentIndex++;
          showQuestion(currentIndex);
        } else {
          evaluateQuiz();
        }
      }, 250);
    });

    choice.appendChild(input);
    choice.appendChild(label);
  });

  part.appendChild(choice);

  if (index > 0) {
    const backBtn = document.createElement('button');
    backBtn.textContent = "Back";
    backBtn.classList.add('back-btn');
    backBtn.style.marginTop = "15px"; 
    backBtn.addEventListener('click', () => {
      currentIndex--;
      showQuestion(currentIndex);
    });
    part.appendChild(backBtn);
  }

  container.appendChild(part);
}

function evaluateQuiz() {
  const results = [];

  distros.forEach(distro => {
    distro.desktops.forEach(desktop => {

      let raw = { ...distro.scores };

      if (desktopModifiers[desktop]) {
        Object.entries(desktopModifiers[desktop]).forEach(([key, mod]) => {
          if (raw[key] !== undefined) raw[key] += mod;
        });
      }

      Object.keys(raw).forEach(k => raw[k] = Math.max(0, Math.min(3, raw[k])));

      let match = { ...raw };

      Object.entries(answers).forEach(([qid, ans]) => {
        const map = {
          q1: "Experience", q2: "Gaming", q3: "Modern", q4: "Options",
          q5: "Keyboard", q6: "Pretty", q7: "Ins_Complex", q8: "PM_Terminal",
          q9: "Privacy", q10: "Hard_Freedom", q11: "Adventure",
          q12: "Upd_Regular", q13: "Nvidia"
        };

        const field = map[qid];
        if (field && match[field] !== undefined) {
          const diff = Math.abs(ans - raw[field]);
          match[field] = Math.max(0, Math.min(3, 3 - diff));
        }
      });

      const total = Object.values(match).reduce((a, b) => a + b, 0);

      results.push({ 
        distro: distro.name, 
        desktop, 
        rawScore: raw, 
        matchScore: match,
        total 
      });

    });
  });

  results.sort((a, b) => b.total - a.total);
  console.log("Alle Ergebnisse:", results);
  console.log("Top 5:", results.slice(0, 5));
  displayResults(results);
}

async function displayResults(results) {
  const resp = await fetch('/js/json/nameMapping.json');
  const nameMapping = await resp.json();

  const quizHeader = document.getElementById("quiz-header");
  if(quizHeader) quizHeader.style.display = "none";

  const container = document.getElementById("quiz-container");
  container.innerHTML = "";

  const title = document.createElement("h1");
  title.textContent = "Results";
  container.appendChild(title);

  const legend = document.createElement("p");
  legend.classList.add('result');
  legend.innerHTML = "Here are your Results:<br>Distribution and desktop environment<br><br>";
  container.appendChild(legend);

  const list = document.createElement("div");
  list.id = "results-list";
  container.appendChild(list);

  const btn = document.createElement("button");
  btn.textContent = "More";
  btn.className = "more-btn";
  btn.style.marginTop = "20px";
  container.appendChild(btn);

  let shown = INITIAL_RESULT_COUNT;
  const chunk = 10;
  const maxTotal = Math.max(...results.map(r => r.total));

  function renderRange(start, end) {
    results.slice(start, end).forEach((res, idx) => {
      const card = document.createElement("div");
      card.classList.add("result-card");

      const normalized = res.total / maxTotal;
      const exaggeration = Math.pow(normalized, 16);
      const progress = Math.min(100, exaggeration * 100);

      const key = `${res.distro}+${res.desktop}`;
      const displayName = nameMapping[key] || `${res.distro} ${res.desktop}`;

      card.innerHTML = `
        <p class="result">${displayName}</p>
        <div class="progress white">
          <div class="progressinner" style="width:0"></div>
        </div>
      `;

      list.appendChild(card);
      const bar = card.querySelector(".progressinner");
      setTimeout(() => {
        bar.style.width = `${progress}%`;
      }, 50 * (idx + 1)); 
    });
  }

  renderRange(0, Math.min(shown, results.length));

  function finish() {
    btn.remove();
    title.remove();
    legend.remove();
    
    if(quizHeader) quizHeader.style.display = "none";
    
    const wrapper = document.getElementById("quiz-wrapper");
    if (wrapper) wrapper.style.display = "none";
  }

  function onMore() {
    const start = shown;
    const end = Math.min(shown + chunk, results.length);
    
    if (start < end) {
      renderRange(start, end);
      shown = end;
    }
    
    if (shown >= results.length) btn.remove();
  }

  if (results.length <= shown) btn.remove();
  
  btn.addEventListener("click", onMore);
}