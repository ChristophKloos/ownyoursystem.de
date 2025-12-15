const INITIAL_RESULT_COUNT = 4;

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
  distros = await dResp.json();
  desktops = await deResp.json();

  desktopModifiers = desktops.desktops || desktops;
  
  showQuestion(currentIndex);
}

function showQuestion(index){
  const container = document.getElementById('quiz-container');
  container.innerHTML = "";

  const q = questions[index];
 
  const headerTitle = document.getElementById("quiz-title");
  const headerSubtitle = document.getElementById("quiz-subtitle");
  const headerProgress = document.getElementById("quiz-progress");

  if(headerTitle) {
    headerTitle.textContent = q.title;
    headerTitle.style.display = "";
  }
  if(headerSubtitle) {
    headerSubtitle.textContent = `${index + 1} / ${questions.length}`;
    headerSubtitle.style.display = "";
  }

  const progressValue = ((index) / questions.length) * 100;
  if(headerProgress) {
    headerProgress.style.width = progressValue + "%";
    headerProgress.style.display = "";
    if(headerProgress.parentElement) headerProgress.parentElement.style.display = "";
  }

  const part = document.createElement('div');
  part.classList.add('part');

  const frage = document.createElement('div');
  frage.classList.add('frage');
  
  frage.innerHTML = `<img src="/ui/question/${q.icon}" alt="" class="question-icon"><p>${q.question}</p>`;

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
      
      let extraPoints = raw.Extra_Score || 0;
      delete raw.Extra_Score;

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

      const matchSum = Object.values(match).reduce((a, b) => a + b, 0);
      const total = matchSum + extraPoints;

      results.push({ 
        distro: distro.name, 
        description: distro.description,
        desktop, 
        rawScore: raw, 
        matchScore: match,
        total 
      });

    });
  });

  results.sort((a, b) => b.total - a.total);
  displayResults(results);
}

async function displayResults(results) {
  const headerTitle = document.getElementById("quiz-title");
  const headerSubtitle = document.getElementById("quiz-subtitle");
  const headerProgress = document.getElementById("quiz-progress");

  if(headerTitle) headerTitle.style.display = "none";
  if(headerSubtitle) headerSubtitle.style.display = "none";
  if(headerProgress) {
    headerProgress.style.display = "none";
    if(headerProgress.parentElement && headerProgress.parentElement.classList.contains('progress')) {
      headerProgress.parentElement.style.display = "none";
    }
  }

  const resp = await fetch('/js/json/nameMapping.json');
  const nameMapping = await resp.json();
  
  const map = {
    "Experience": "q1", "Gaming": "q2", "Modern": "q3", "Options": "q4",
    "Keyboard": "q5", "Pretty": "q6", "Ins_Complex": "q7", "PM_Terminal": "q8",
    "Privacy": "q9", "Hard_Freedom": "q10", "Adventure": "q11",
    "Upd_Regular": "q12", "Nvidia": "q13"
  };
  const orderedKeys = Object.keys(map);

  const container = document.getElementById("quiz-container");
  container.innerHTML = "";

  const title = document.createElement("h1");
  title.textContent = "Results";
  container.appendChild(title);

  const list = document.createElement("div");
  list.id = "results-list";
  container.appendChild(list);

  const btn = document.createElement("button");
  btn.textContent = "More";
  btn.className = "more-btn";
  container.appendChild(btn);

  let shown = INITIAL_RESULT_COUNT;
  const maxTotal = Math.max(...results.map(r => r.total));

  function renderRange(start, end) {
    results.slice(start, end).forEach((res, idx) => {
      const card = document.createElement("div");
      card.classList.add("result-card");

      const key = `${res.distro}+${res.desktop}`;

      const header = document.createElement("div");
      header.className = "result-header";

      const nameTitle = document.createElement("p");
      nameTitle.className = "result-name";
      
      if (nameMapping[key]) {
        nameTitle.innerHTML = nameMapping[key];
      } else {
        nameTitle.innerHTML = `<strong>${res.distro}</strong> ${res.desktop}`;
      }

      header.appendChild(nameTitle);

      const arrowImg = document.createElement("img");
      arrowImg.src = "/ui/arrow.svg";
      arrowImg.className = "arrow-icon";
      arrowImg.alt = "toggle";
      header.appendChild(arrowImg);

      card.appendChild(header);

      const mainProgressWrap = document.createElement("div");
      mainProgressWrap.className = "progress white";
      const mainBar = document.createElement("div");
      mainBar.className = "progressinner main-bar";
      mainBar.style.width = "0%";
      mainProgressWrap.appendChild(mainBar);
      card.appendChild(mainProgressWrap);

      const normalized = res.total / maxTotal;
      const exaggeration = Math.pow(normalized, 16);
      setTimeout(() => {
        mainBar.style.width = `${Math.min(100, exaggeration * 100)}%`;
      }, 50 * (idx + 1));

      const detailsContainer = document.createElement("div");
      detailsContainer.className = "stats-container";
      detailsContainer.style.display = "none";

      if (res.description) {
        const descP = document.createElement("p");
        descP.className = "result-desc";

        descP.style.margin = "0";
        descP.textContent = res.description;
        detailsContainer.appendChild(descP);
      }

      orderedKeys.forEach(k => {
        const val = res.rawScore[k] !== undefined ? res.rawScore[k] : 0;
        const qId = map[k];
        const qObj = questions.find(i => i.id === qId);
        
        const userVal = answers[qId] !== undefined ? answers[qId] : 0;

        const row = document.createElement("div");
        row.className = "stat-row";

        const label = document.createElement("span");
        label.className = "stat-label";
        label.textContent = qObj ? qObj.title : k;

        const valLabel = document.createElement("span");
        valLabel.className = "stat-value";
        valLabel.textContent = "";

        const pWrap = document.createElement("div");
        pWrap.className = "progress small";
        
        const pFill = document.createElement("div");
        pFill.classList.add("progressinner", "distro-value");
        pFill.style.width = `${20 + (Math.max(0, (val - 1) / 2) * 60)}%`;

        const pUser = document.createElement("div");
        pUser.classList.add("progressinner", "user-value");
        pUser.style.width = `${20 + (Math.max(0, (userVal - 1) / 2) * 60)}%`;
        
        pWrap.appendChild(pFill);
        pWrap.appendChild(pUser);

        row.appendChild(label);
        row.appendChild(valLabel);
        row.appendChild(pWrap);
        detailsContainer.appendChild(row);
      });

      card.appendChild(detailsContainer);

      card.addEventListener("click", () => {
        const isHidden = detailsContainer.style.display === "none";
        detailsContainer.style.display = isHidden ? "block" : "none";
        if (isHidden) {
          arrowImg.classList.add("rotated");
        } else {
          arrowImg.classList.remove("rotated");
        }
      });

      list.appendChild(card);
    });
  }

  renderRange(0, Math.min(shown, results.length));

  btn.addEventListener("click", () => {
    const start = shown;
    const end = Math.min(shown + 10, results.length);
    renderRange(start, end);
    shown = end;
    if (shown >= results.length) btn.remove();
  });
  
  if (results.length <= shown) btn.remove();
}