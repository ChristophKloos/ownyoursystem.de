const label = document.querySelector(".carousellabel");
const attrib = document.querySelector(".carouselattrib");
const img = document.querySelector(".carouselimg");

let images = [];
let index = 0;

const duration = 3000;
const fadeTime = 300;

async function loadImages() {
  const res = await fetch("/js/json/carousel.json");
  images = await res.json();
  
  if (images.length > 0) {
      index = Math.floor(Math.random() * images.length);
  }
  
  const filename = images[index];
  updateDisplay(filename);
  fadeIn(img);
  
  loopCarousel();
}

function updateDisplay(filename) {
  const source = filename.replace(".webp", "");
  attrib.textContent = "Source: " + source;
  img.src = "/img/carousel/" + filename;
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
  await new Promise(r => setTimeout(r, duration));

  let newIndex;
  do {
    newIndex = Math.floor(Math.random() * images.length);
  } while (newIndex === index && images.length > 1);

  const filename = images[newIndex];
  const nextUrl = "/img/carousel/" + filename;

  await preloadImage(nextUrl);

  fadeOut(img);
  
  // Wait slightly longer than CSS transition to be safe
  await new Promise(r => setTimeout(r, fadeTime + 50));

  index = newIndex;
  updateDisplay(filename);
  
  // Force browser repaint to ensure new src is ready before showing
  await new Promise(resolve => {
      requestAnimationFrame(() => {
          requestAnimationFrame(resolve);
      });
  });
  
  fadeIn(img);
  
  loopCarousel();
}

loadImages();