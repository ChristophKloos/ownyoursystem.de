const container = document.getElementById('quiz-container');
let previousHeight = container.offsetHeight;

const observer = new MutationObserver(() => {
  const newHeight = container.scrollHeight;

  if (newHeight > 0 && newHeight !== previousHeight) {
    container.style.transition = 'none';
    container.style.height = `${previousHeight}px`;

    requestAnimationFrame(() => {
      container.style.transition = 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
      container.style.height = `${newHeight}px`;
      previousHeight = newHeight;
    });
  }
});

observer.observe(container, {
  childList: true,
  subtree: true
});

container.addEventListener('transitionend', (e) => {
  if (e.propertyName === 'height') {
    container.style.height = 'auto';
  }
});