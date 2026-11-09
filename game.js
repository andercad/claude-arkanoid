// Constantes
const CANVAS_W = 480;
const CANVAS_H = 640;
const MAX_DT = 1 / 30; // límite de delta time por frame (s)
const PADDLE_W = 96;
const PADDLE_H = 14;
const PADDLE_SPEED = 420; // px/s (teclado)
const BALL_SIZE = 14;
const BALL_SPEED = 360; // px/s, constante

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Estado del juego (se irá ampliando en pasos posteriores)
const game = {
  state: 'start', // 'start' | 'playing' (el resto llega en pasos posteriores)
  paddle: { x: (CANVAS_W - PADDLE_W) / 2, y: 600, w: PADDLE_W, h: PADDLE_H },
  ball: { x: 0, y: 0, vx: 0, vy: 0, size: BALL_SIZE, stuck: true },
};

// Pega la bola al centro de la pala
function stickBall() {
  const { paddle, ball } = game;
  ball.stuck = true;
  ball.vx = 0;
  ball.vy = 0;
  ball.x = paddle.x + (paddle.w - ball.size) / 2;
  ball.y = paddle.y - ball.size;
}

stickBall();

// Lanza la bola hacia arriba
function launchBall() {
  game.ball.stuck = false;
  game.ball.vx = 0;
  game.ball.vy = -BALL_SPEED;
}

// Acción de Espacio / clic según el estado
function handleAction() {
  if (game.state === 'start') {
    game.state = 'playing';
    stickBall();
  } else if (game.state === 'playing' && game.ball.stuck) {
    launchBall();
  }
}

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

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    if (!e.repeat) handleAction();
    return;
  }
  setKey(e, true);
});
canvas.addEventListener('mousedown', handleAction);
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

  const { paddle, ball } = game;
  if (ball.stuck) {
    // Antes del lanzamiento la bola sigue a la pala
    ball.x = paddle.x + (paddle.w - ball.size) / 2;
    ball.y = paddle.y - ball.size;
  } else if (game.state === 'playing') {
    // Movimiento básico; rebotes llegan en el Paso 5
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;
  }
}

function drawCenteredText(text, y, font, color) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.fillText(text, CANVAS_W / 2, y);
}

function render() {
  ctx.fillStyle = '#14142b';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  const { paddle, ball } = game;
  drawSprite(ctx, 'paddle', paddle.x, paddle.y, paddle.w, paddle.h);
  drawSprite(ctx, 'ball', ball.x, ball.y, ball.size, ball.size);

  if (game.state === 'start') {
    ctx.fillStyle = 'rgba(11, 11, 20, 0.6)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    drawCenteredText('ARKANOID', 260, 'bold 48px monospace', '#ffffff');
    drawCenteredText('Pulsa Espacio o haz clic para empezar', 320, '16px monospace', '#cccccc');
  } else if (game.state === 'playing' && ball.stuck) {
    drawCenteredText('Espacio o clic para lanzar', 400, '14px monospace', '#cccccc');
  }
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
