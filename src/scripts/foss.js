const DATA_URL = '/js/json/foss.json';
const IMG_BASE = '/img/screenshots/';

async function initComparison() {
    const container = document.getElementById('comparison-list');
    if (!container) return;

    try {
        const res = await fetch(DATA_URL);
        const data = await res.json();

        container.innerHTML = data.map(item => `
            <div class="comparison-block">
                <div class="comparison-row">
                    
                    <div class="comp-card proprietary">
                        <div class="img-wrapper">
                            <img src="${IMG_BASE + item.proprietary.image}" alt="${item.proprietary.name}" onerror="this.src='https://placehold.co/600x400?text=No+Image'">
                            <span class="badge prop">Proprietary</span>
                        </div>
                        <h3>${item.proprietary.name}</h3>
                    </div>

                    <div class="comp-card foss">
                        <div class="img-wrapper">
                            <img src="${IMG_BASE + item.foss.image}" alt="${item.foss.name}" onerror="this.src='https://placehold.co/600x400?text=No+Image'">
                            <span class="badge opensource">Open Source</span>
                        </div>
                        <h3>${item.foss.name}</h3>
                    </div>

                </div>
                <p class="comp-description">${item.description}</p>
            </div>
        `).join('');

    } catch (e) {
        console.error(e);
    }
}

window.addEventListener('DOMContentLoaded', initComparison);