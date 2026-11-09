// Constantes
const CANVAS_W = 480;
const CANVAS_H = 640;
const MAX_DT = 1 / 30; // límite de delta time por frame (s)

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let lastTime = 0;

function update(dt) {
  // Se rellenará en pasos posteriores
}

function render() {
  ctx.fillStyle = '#14142b';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
}

function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, MAX_DT);
  lastTime = now;
  update(dt);
  render();
  requestAnimationFrame(loop);
}

requestAnimationFrame((now) => {
  lastTime = now;
  requestAnimationFrame(loop);
});
