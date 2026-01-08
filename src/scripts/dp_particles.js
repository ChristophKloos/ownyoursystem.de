let canvas;
let ctx;
let width;
let height;
let particles = [];
let icons = [];
let animationFrame;

class Particle {
  constructor() {
    this.reset();
    this.y = Math.random() * height;
  }

  reset() {
    this.x = Math.random() * width;
    this.y = height + 100;
    this.speed = 0.05 + Math.random() * 0.3;
    this.size = 30 + Math.random() * 40;
    this.opacity = 0.0;
    this.targetOpacity = 0.1 + Math.random() * 0.3;
    this.image =
      icons.length > 0 ? icons[Math.floor(Math.random() * icons.length)] : null;
    this.wobble = Math.random() * Math.PI * 2;
    this.wobbleSpeed = 0.005 + Math.random() * 0.01;
    this.state = "in";
  }

  update() {
    this.y -= this.speed;
    this.wobble += this.wobbleSpeed;
    this.x += Math.sin(this.wobble) * 0.1;

    if (this.y > height - 100) {
      this.opacity += 0.01;
      if (this.opacity > this.targetOpacity) this.opacity = this.targetOpacity;
    }

    if (this.y < -100) {
      this.reset();
    }
  }

  draw() {
    if (!this.image) return;

    if (!this.image.complete) {
      return;
    }

    ctx.globalAlpha = this.opacity;
    ctx.drawImage(this.image, this.x, this.y, this.size, this.size);
    ctx.globalAlpha = 1.0;
  }
}

export function initParticles(distroList) {
  if (!distroList || distroList.length === 0) {
    return;
  }

  const existing = document.getElementById("particle-canvas");
  if (existing) return;

  canvas = document.createElement("canvas");
  canvas.id = "particle-canvas";
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.zIndex = "0";
  canvas.style.pointerEvents = "none";

  document.body.prepend(canvas);

  ctx = canvas.getContext("2d");

  const uniqueIcons = [...new Set(distroList.map((d) => d.icon))];
  icons = uniqueIcons.map((icon) => {
    const img = new Image();
    img.src = `/ui/distro/${icon}`;
    return img;
  });

  window.addEventListener("resize", resize);
  resize();

  for (let i = 0; i < 30; i++) {
    particles.push(new Particle());
  }

  animate();
}

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
}

function animate() {
  ctx.clearRect(0, 0, width, height);
  particles.forEach((p) => {
    p.update();
    p.draw();
  });
  animationFrame = requestAnimationFrame(animate);
}
