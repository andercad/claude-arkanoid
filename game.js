// Constantes
const CANVAS_W = 480;
const CANVAS_H = 640;
const MAX_DT = 1 / 30; // límite de delta time por frame (s)
const BRICK_COLS = 10;
const BRICK_ROWS = 6;
const BRICK_W = 48; // 480 / 10 (sprite 32x16 escalado x1.5)
const BRICK_H = 24;
const BRICK_TOP = 80; // margen superior para el HUD
const BRICK_COLORS = ['red', 'yellow', 'cyan', 'magenta', 'hotpink', 'green']; // de arriba a abajo
const BRICK_POINTS = 10;
const PADDLE_W = 96;
const PADDLE_H = 14;
const PADDLE_SPEED = 420; // px/s (teclado)
const BALL_SIZE = 14;
const BALL_SPEED = 360; // px/s, constante
const MAX_BOUNCE_ANGLE = Math.PI / 3; // 60° respecto a la vertical

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Estado del juego (se irá ampliando en pasos posteriores)
const game = {
  state: 'start', // 'start' | 'playing' (el resto llega en pasos posteriores)
  score: 0,
  paddle: { x: (CANVAS_W - PADDLE_W) / 2, y: 600, w: PADDLE_W, h: PADDLE_H },
  ball: { x: 0, y: 0, vx: 0, vy: 0, size: BALL_SIZE, stuck: true },
  bricks: [], // { x, y, w, h, color, alive }
};

// Genera la rejilla de bloques (10x6, un color por fila)
function createBricks() {
  const bricks = [];
  for (let row = 0; row < BRICK_ROWS; row++) {
    for (let col = 0; col < BRICK_COLS; col++) {
      bricks.push({
        x: col * BRICK_W,
        y: BRICK_TOP + row * BRICK_H,
        w: BRICK_W,
        h: BRICK_H,
        color: BRICK_COLORS[row],
        alive: true,
      });
    }
  }
  return bricks;
}

game.bricks = createBricks();

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
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    // Rebote en paredes laterales
    if (ball.x < 0) {
      ball.x = 0;
      ball.vx = Math.abs(ball.vx);
    } else if (ball.x + ball.size > CANVAS_W) {
      ball.x = CANVAS_W - ball.size;
      ball.vx = -Math.abs(ball.vx);
    }

    // Rebote en el techo
    if (ball.y < 0) {
      ball.y = 0;
      ball.vy = Math.abs(ball.vy);
    }
    // Rebote en la pala: ángulo según el punto de impacto
    if (
      ball.vy > 0 &&
      ball.x + ball.size > paddle.x &&
      ball.x < paddle.x + paddle.w &&
      ball.y + ball.size > paddle.y &&
      ball.y < paddle.y + paddle.h
    ) {
      const ballCenter = ball.x + ball.size / 2;
      const paddleCenter = paddle.x + paddle.w / 2;
      // -1 (borde izquierdo) .. 0 (centro) .. 1 (borde derecho)
      const offset = Math.max(-1, Math.min(1, (ballCenter - paddleCenter) / (paddle.w / 2)));
      const angle = offset * MAX_BOUNCE_ANGLE; // respecto a la vertical
      ball.vx = BALL_SPEED * Math.sin(angle);
      ball.vy = -BALL_SPEED * Math.cos(angle);
      ball.y = paddle.y - ball.size;
    }
    // Colisión con bloques: rompe uno por frame e invierte solo el eje de menor solape
    for (const b of game.bricks) {
      if (!b.alive) continue;
      if (
        ball.x + ball.size <= b.x ||
        ball.x >= b.x + b.w ||
        ball.y + ball.size <= b.y ||
        ball.y >= b.y + b.h
      ) continue;

      const overlapX = Math.min(ball.x + ball.size - b.x, b.x + b.w - ball.x);
      const overlapY = Math.min(ball.y + ball.size - b.y, b.y + b.h - ball.y);
      const ballCX = ball.x + ball.size / 2;
      const ballCY = ball.y + ball.size / 2;
      if (overlapX < overlapY) {
        const fromLeft = ballCX < b.x + b.w / 2;
        ball.vx = fromLeft ? -Math.abs(ball.vx) : Math.abs(ball.vx);
        ball.x += fromLeft ? -overlapX : overlapX;
      } else {
        const fromTop = ballCY < b.y + b.h / 2;
        ball.vy = fromTop ? -Math.abs(ball.vy) : Math.abs(ball.vy);
        ball.y += fromTop ? -overlapY : overlapY;
      }
      b.alive = false;
      game.score += BRICK_POINTS;
      break;
    }
    // Por abajo no rebota: perder la bola llega en el Paso 9
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
  for (const b of game.bricks) {
    if (b.alive) drawSprite(ctx, 'block_' + b.color, b.x, b.y, b.w, b.h);
  }
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
