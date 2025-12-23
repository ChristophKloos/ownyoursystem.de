const JSON_URL = "/js/json/carousel.json";
const IMG_PATH = "/img/carousel/";

// Modal öffnen (muss global sein für onclick)
window.openModal = (src, label) => {
  const modal = document.getElementById("image-modal");
  if (!modal) return;

  document.getElementById("modal-image").src = src;
  document.getElementById("modal-caption").innerText = label;

  modal.classList.remove("hidden");
  modal.classList.add("flex");
};

// Modal schließen
window.closeModal = () => {
  const modal = document.getElementById("image-modal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
};

// Galerie starten
window.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("gallery-container");
  if (!container) return;

  try {
    const response = await fetch(JSON_URL);
    const files = await response.json();

    container.innerHTML = files
      .map((filename) => {
        const url = IMG_PATH + filename;
        // Endung entfernen (z.B. "bild.webp" -> "bild")
        const name = filename.replace(/\.[^/.]+$/, "");
        const label = `Source: ${name}`;

        return `
                <div class="gallery-item-container" onclick="openModal('${url}', '${label}')">
                    <img src="${url}" class="gallery-item-image" alt="${name}">
                    <p>${label}</p>
                </div>
            `;
      })
      .join("");
  } catch (e) {
    console.error("Fehler:", e);
  }
});
