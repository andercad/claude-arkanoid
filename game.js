// Constantes
const CANVAS_W = 480;
const CANVAS_H = 640;
const MAX_DT = 1 / 30; // límite de delta time por frame (s)
const PADDLE_W = 96;
const PADDLE_H = 14;
const PADDLE_SPEED = 420; // px/s (teclado)
const BALL_SIZE = 14;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Estado del juego (se irá ampliando en pasos posteriores)
const game = {
  paddle: { x: (CANVAS_W - PADDLE_W) / 2, y: 600, w: PADDLE_W, h: PADDLE_H },
  ball: { x: 0, y: 0, size: BALL_SIZE },
};

// Posición fija de la bola sobre el centro de la pala
game.ball.x = game.paddle.x + (game.paddle.w - game.ball.size) / 2;
game.ball.y = game.paddle.y - game.ball.size;

let lastTime = 0;

// Entrada
const keys = { left: false, right: false };

function setKey(e, pressed) {
  switch (e.code) {
    case 'ArrowLeft':
    case 'KeyA':
      keys.left = pressed;
      e.preventDefault();
      break;
    case 'ArrowRight':
    case 'KeyD':
      keys.right = pressed;
      e.preventDefault();
      break;
  }
}

window.addEventListener('keydown', (e) => setKey(e, true));
window.addEventListener('keyup', (e) => setKey(e, false));

// La pala sigue al cursor en X (centrada en el cursor)
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left - canvas.clientLeft;
  game.paddle.x = clampPaddle(mouseX - game.paddle.w / 2);
});

function clampPaddle(x) {
  return Math.max(0, Math.min(CANVAS_W - game.paddle.w, x));
}

function update(dt) {
  const dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
  if (dir !== 0) {
    game.paddle.x = clampPaddle(game.paddle.x + dir * PADDLE_SPEED * dt);
  }
}

function render() {
  ctx.fillStyle = '#14142b';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  const { paddle, ball } = game;
  drawSprite(ctx, 'paddle', paddle.x, paddle.y, paddle.w, paddle.h);
  drawSprite(ctx, 'ball', ball.x, ball.y, ball.size, ball.size);
}

function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, MAX_DT);
  lastTime = now;
  update(dt);
  render();
  requestAnimationFrame(loop);
}

loadSpritesheet(() => {
  requestAnimationFrame((now) => {
    lastTime = now;
    requestAnimationFrame(loop);
  });
});
