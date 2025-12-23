document.addEventListener("DOMContentLoaded", () => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const video = entry.target.querySelector("video");
          if (video && !video.dataset.autoPlayed) {
            video.dataset.autoPlayed = "true";
            video.currentTime = 0;
            video.play().catch(() => {});
          }
        }
      });
    },
    { threshold: 0.5 },
  );

  const tiles = document.querySelectorAll(
    ".bentotile.compare, .bentotile.carousel",
  );

  tiles.forEach((tile) => {
    observer.observe(tile);

    tile.addEventListener("mouseenter", () => {
      const video = tile.querySelector("video");
      if (video) {
        video.currentTime = 0;
        video.play().catch(() => {});
      }
    });
  });
});
