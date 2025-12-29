const JSON_URL = "/js/json/carousel.json";

window.openModal = (src, label) => {
  const modal = document.getElementById("image-modal");
  if (!modal) return;

  document.getElementById("modal-image").src = src;
  document.getElementById("modal-caption").innerText = label;

  modal.classList.remove("hidden");
  modal.classList.add("flex");
};

window.closeModal = () => {
  const modal = document.getElementById("image-modal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
};

window.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("gallery-container");
  if (!container) return;

  try {
    const response = await fetch(JSON_URL);
    const groups = await response.json();

    container.innerHTML = groups
      .map((group) => {
        return group.files
          .map((filename) => {
            const url = group.path + filename;
            const name = filename.replace(/\.[^/.]+$/, "");
            const label = `${name}`;

            return `
            <div class="gallery-item-container" onclick="openModal('${url}', '${label}')">
                <img src="${url}" class="gallery-item-image" alt="${name}">
                <p>${label}</p>
            </div>
        `;
          })
          .join("");
      })
      .join("");
  } catch (e) {
    console.error(e);
  }
});
