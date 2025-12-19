import { INITIAL_RESULT_COUNT, REVERSE_MAP } from './dp_config.js';

export function renderQuestion(index, questions, answers, onAnswer, onNav, direction = 'forward') {
  const container = document.getElementById('quiz-container');
  const q = questions[index];
  container.innerHTML = "";

  document.getElementById("quiz-title").textContent = q.title;
  document.getElementById("quiz-subtitle").textContent = `${index + 1} / ${questions.length}`;

  const part = document.createElement('div');
  part.classList.add('part');

  const frage = document.createElement('div');
  frage.classList.add('frage');
  frage.innerHTML = `<img src="/ui/question/${q.icon}" alt="" class="question-icon"><p>${q.question}</p>`;

  const progress = document.createElement('div');
  progress.className = "progress";
  const bar = document.createElement('div');
  bar.className = "progressinner";

  const prevIndex = direction === 'forward' ? Math.max(0, index - 1) : index + 1;
  const startWidth = (prevIndex / questions.length) * 100;
  const targetWidth = (index / questions.length) * 100;

  bar.style.width = `${startWidth}%`;
  
  progress.appendChild(bar);
  frage.appendChild(progress);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      bar.style.width = `${targetWidth}%`;
    });
  });

  if (index > 0) {
    const btn = createNavBtn("/ui/arrow.svg", "back-btn", () => onNav(index - 1, 'back'));
    frage.appendChild(btn);
  }

  if (index < questions.length - 1) {
    const btn = createNavBtn("/ui/arrow.svg", "forward-btn", () => onNav(index + 1, 'forward'));
    frage.appendChild(btn);
  }

  part.appendChild(frage);

  const choice = document.createElement('div');
  choice.classList.add('choice');
  choice.classList.add(direction === 'back' ? 'slide-left' : 'slide-right');

  q.options.forEach((opt, i) => {
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = q.id;
    input.id = `${q.id}_${i}`;
    input.value = opt.value;
    input.checked = answers[q.id] === opt.value;

    const label = document.createElement('label');
    label.htmlFor = input.id;
    label.innerHTML = opt.text;
    if (input.checked) label.classList.add('active');

    label.addEventListener('mousedown', (e) => {
      e.preventDefault();
      input.checked = true;
      choice.querySelectorAll('label').forEach(l => l.classList.remove('active'));
      label.classList.add('active');
      onAnswer(q.id, parseInt(input.value));
    });

    choice.appendChild(input);
    choice.appendChild(label);
  });

  part.appendChild(choice);
  container.appendChild(part);
}

function createNavBtn(src, cls, onClick) {
  const btn = document.createElement('button');
  const img = document.createElement('img');
  img.src = src;
  btn.appendChild(img);
  btn.classList.add('nav-btn', cls);
  btn.onclick = onClick;
  return btn;
}

export function renderResults(results, questions, nameMapping, desktopModifiers, answers) {
  const container = document.getElementById("quiz-container");
  container.innerHTML = "";

  document.getElementById("quiz-title").style.display = "none";
  document.getElementById("quiz-subtitle").style.display = "none";
  const p = document.getElementById("quiz-progress");
  if (p) {
    p.style.display = "none";
    if (p.parentElement) p.parentElement.style.display = "none";
  }

  const header = document.createElement("div");
  header.className = "resultheader";
  header.innerHTML = `<h2>Results</h2><p class="resultsub">Click on an entry for a detailed breakdown.</p>`;
  container.appendChild(header);

  const list = document.createElement("div");
  list.id = "results-list";
  container.appendChild(list);

  const moreBtn = document.createElement("button");
  moreBtn.textContent = "More";
  moreBtn.className = "more-btn";
  container.appendChild(moreBtn);

  let shown = INITIAL_RESULT_COUNT;
  const maxTotal = Math.max(...results.map(r => r.total));

  const showRange = (start, end) => {
    results.slice(start, end).forEach((res, idx) => {
      const card = createResultCard(res, maxTotal, questions, nameMapping, desktopModifiers, answers);
      list.appendChild(card);
      
      const bar = card.querySelector(".main-bar");
      setTimeout(() => {
        bar.style.width = `${Math.pow(res.total / maxTotal, 8) * 100}%`;
      }, 50 * (idx + 1));
    });
  };

  showRange(0, shown);

  moreBtn.onclick = () => {
    showRange(shown, Math.min(shown + 10, results.length));
    shown += 10;
    if (shown >= results.length) moreBtn.remove();
  };
  if (results.length <= shown) moreBtn.remove();
}

function createResultCard(res, maxTotal, questions, nameMapping, desktopModifiers, answers) {
  const card = document.createElement("div");
  card.className = "result-card";

  const key = `${res.distro}+${res.desktop}`;
  const mapping = nameMapping[key];
  let displayName = `<strong>${res.distro}</strong> ${res.desktop}`;
  let customScreenshot = null;

  if (mapping) {
    displayName = mapping.name || mapping;
    customScreenshot = mapping.screenshot;
  }

  card.innerHTML = `
    <div class="result-header">
      ${res.icon ? `<img src="/ui/distro/${res.icon}" class="distro-icon">` : ''}
      <p class="result-name">${displayName}</p>
      <img src="/ui/arrow.svg" class="arrow-icon">
    </div>
    <div class="progress white"><div class="progressinner main-bar" style="width:0%"></div></div>
  `;

  const details = document.createElement("div");
  details.className = "stats-container";
  details.style.display = "none";

  const mods = desktopModifiers[res.desktop] || desktopModifiers.desktops?.[res.desktop];
  const imgSrc = customScreenshot ? `/img/desktops/${customScreenshot}` : (mods?.Screenshot ? `/img/desktops/${mods.Screenshot}` : null);

  if (res.description) {
    details.innerHTML += `<p class="result-desc">${res.description}</p>`;
  }

  if (imgSrc) {
    const imgCont = document.createElement("div");
    imgCont.className = "gallery-item-container";
    imgCont.innerHTML = `<img src="${imgSrc}" class="gallery-item-image">`;
    imgCont.onclick = (e) => {
      e.stopPropagation();
      if (window.openModal) window.openModal(imgSrc, "Sourced from wikimedia (creative commons)");
    };
    details.appendChild(imgCont);
  }

  Object.entries(REVERSE_MAP).forEach(([field, qId]) => {
    const val = res.rawScore[field] || 0;
    const userVal = answers[qId] || 0;
    const qObj = questions.find(q => q.id === qId);

    const row = document.createElement("div");
    row.className = "stat-row";
    row.innerHTML = `
      <span class="stat-label">${qObj ? qObj.title : field}</span>
      <span class="stat-value"></span>
      <div class="progress small">
        <div class="progressinner distro-value" style="width: 20%"></div>
        <div class="progressinner user-value" style="width: 20%"></div>
      </div>
    `;
    details.appendChild(row);

    card.addEventListener('click', () => {
      const dBar = row.querySelector(".distro-value");
      const uBar = row.querySelector(".user-value");
      setTimeout(() => {
        dBar.style.width = `${20 + (Math.max(0, (val - 1) / 2) * 60)}%`;
        uBar.style.width = `${20 + (Math.max(0, (userVal - 1) / 2) * 60)}%`;
      }, 50);
    }, { once: true });
  });

  if (res.link) {
    const link = document.createElement("a");
    link.href = res.link;
    link.className = "distro-link";
    link.target = "_blank";
    link.textContent = "Official Website";
    details.appendChild(link);
  }

  card.appendChild(details);
  card.onclick = (e) => {
    if (e.target.tagName === 'A') return;
    const isHidden = details.style.display === "none";
    details.style.display = isHidden ? "block" : "none";
    card.querySelector(".arrow-icon").classList.toggle("rotated", isHidden);
  };

  return card;
}