const container = document.getElementById("quiz-container");
let oldHeight = container.offsetHeight;

function attachObserver() {
  observer.observe(container, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["style", "class"],
  });
}

window.addEventListener("resize", () => {
  container.style.height = "auto";
  container.style.overflow = "hidden";
  container.style.transition = "none";
  oldHeight = container.offsetHeight;
});

const observer = new MutationObserver(() => {
  observer.disconnect();

  const newHeight = container.scrollHeight;

  if (oldHeight !== newHeight) {
    container.style.height = `${oldHeight}px`;
    container.style.overflow = "hidden";
    container.style.transition = "none";

    void container.offsetHeight;

    requestAnimationFrame(() => {
      container.style.transition = "height 0.4s ease";
      container.style.height = `${newHeight}px`;
    });

    const onEnd = () => {
      container.style.height = "auto";
      container.style.overflow = "hidden";
      container.style.transition = "none";
      oldHeight = container.offsetHeight;
      attachObserver();
    };

    container.addEventListener("transitionend", onEnd, { once: true });
    setTimeout(onEnd, 450);
  } else {
    attachObserver();
  }
});

attachObserver();
