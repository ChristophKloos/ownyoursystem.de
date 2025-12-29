const label = document.querySelector(".carousellabel");
const attrib = document.querySelector(".carouselattrib");
const img = document.querySelector(".carouselimg");

let images = [];
let index = 0;

const duration = 3000;
const fadeTime = 300;

async function loadImages() {
  try {
    const res = await fetch("/js/json/carousel.json");
    const groups = await res.json();

    images = groups.flatMap((group) =>
      group.files.map((file) => ({
        url: group.path + file,
        name: file.replace(/\.[^/.]+$/, ""),
      })),
    );

    if (images.length > 0) {
      index = Math.floor(Math.random() * images.length);
      updateDisplay(images[index]);
      fadeIn(img);
      loopCarousel();
    }
  } catch (e) {
    console.error(e);
  }
}

function updateDisplay(item) {
  attrib.textContent = "Source: " + item.name;
  img.src = item.url;
}

function fadeOut(elem) {
  elem.style.transition = `opacity ${fadeTime}ms`;
  elem.style.opacity = 0;
}

function fadeIn(elem) {
  elem.style.transition = `opacity ${fadeTime}ms`;
  elem.style.opacity = 1;
}

function preloadImage(url) {
  return new Promise((resolve) => {
    const tempImg = new Image();
    tempImg.onload = resolve;
    tempImg.onerror = resolve;
    tempImg.src = url;
  });
}

async function loopCarousel() {
  await new Promise((r) => setTimeout(r, duration));

  let newIndex;
  do {
    newIndex = Math.floor(Math.random() * images.length);
  } while (newIndex === index && images.length > 1);

  const nextItem = images[newIndex];

  await preloadImage(nextItem.url);

  fadeOut(img);

  await new Promise((r) => setTimeout(r, fadeTime + 50));

  index = newIndex;
  updateDisplay(nextItem);

  await new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    });
  });

  fadeIn(img);

  loopCarousel();
}

loadImages();
