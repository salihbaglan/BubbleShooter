// ─── GAME CONFIG & STATE ──────────────────────────────────────
const COLS = 10;
const BUBBLE_COLORS = ['#ff6b6b','#00d4ff','#ffd700','#6bff9e','#ff6bd6','#ff9f43','#a855f7'];
const DROP_EVERY = 8; // shots before dropping a row

let W, H, R, ROWS_VISIBLE;
let canvas, ctx, aimCanvas, aimCtx, nextCanvas, nextCtx;

// Game state
let grid = [];
let currentBubble = null;
let nextBubble = null;
let shooterX = 0, shooterY = 0;
let aimAngle = -Math.PI / 2;
let score = 0, level = 1, shots = 0;
let gridParity = 0;  // tracks offset parity across dropRow shifts
let gameRunning = false;
let animId = null;
let fallingBubbles = [];
let particles = [];
let floatingTexts = [];
let idleAimOsc = 0;
let bubbleInFlight = false;
let lastTime = 0;
let bombs = 5;        // bomb power-ups available
let bombMode = false; // true = next shot is a bomb

// ─── SAVE / LOAD ─────────────────────────────────────────────
function saveProgress() {
  try {
    localStorage.setItem('bs_highScore', Math.max(score, parseInt(localStorage.getItem('bs_highScore') || '0')));
    localStorage.setItem('bs_lastLevel', level);
    localStorage.setItem('bs_lastScore', score);
    localStorage.setItem('bs_bombs', bombs);
  } catch(e) {}
}

function loadProgress() {
  try {
    return {
      highScore: parseInt(localStorage.getItem('bs_highScore') || '0'),
      lastLevel: parseInt(localStorage.getItem('bs_lastLevel') || '1'),
      lastScore: parseInt(localStorage.getItem('bs_lastScore') || '0'),
      savedBombs: parseInt(localStorage.getItem('bs_bombs') !== null ? localStorage.getItem('bs_bombs') : '5'),
    };
  } catch(e) { return { highScore: 0, lastLevel: 1, lastScore: 0, savedBombs: 5 }; }
}

function addBombs(amount) {
  bombs += amount;
  saveProgress();
  updateHUD();
}

// ─── ANIMATION STATE ──────────────────────────────────────────
let gridAnimOffsetY = 0;       // smooth grid drop offset
let popAnims = [];             // {x, y, color, scale, alpha} shrinking pop circles
let bounceAnims = {};          // key "r,c" -> {scale, progress} placement bounce
let newBubbleAnim = 1;         // 0→1 scale-in for new current bubble
let trailPositions = [];       // trail behind in-flight bubble
let screenShake = 0;           // camera shake intensity

// ─── SIZING ───────────────────────────────────────────────────
function setupSize() {
  const maxW = Math.min(window.innerWidth, 420);
  // Dynamic available height: account for HUD (~55px), bottom area (~80px), padding
  const availH = window.innerHeight - 150;

  // R must fit within canvas width that includes odd-row offset: W = R * (2*COLS + 1)
  R = Math.floor(maxW / (COLS * 2 + 1));
  if (R < 12) R = 12;
  if (R > 24) R = 24;

  // Canvas width includes space for odd-row offset (+R)
  W = R * (2 * COLS + 1);

  ROWS_VISIBLE = Math.floor((availH - R * 2) / (R * 1.73)) - 1;
  if (ROWS_VISIBLE < 6) ROWS_VISIBLE = 6;
  if (ROWS_VISIBLE > 14) ROWS_VISIBLE = 14;
  H = Math.floor(ROWS_VISIBLE * R * 1.73 + R * 4);

  canvas.width = W; canvas.height = H;
  aimCanvas.width = W; aimCanvas.height = H;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  aimCanvas.style.width = W + 'px';
  aimCanvas.style.height = H + 'px';

  const container = document.getElementById('canvas-container');
  container.style.width = W + 'px';
  container.style.height = H + 'px';

  shooterX = W / 2;
  shooterY = H - R * 2.5;
}
