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
const REFERENCE_WIDTH = 480;
const REFERENCE_HEIGHT = 768;

function setupSize() {
  const container = document.getElementById('canvas-container');
  const cw = container.clientWidth;
  const ch = container.clientHeight;

  // Sabit referans boyutlarına göre R hesapla
  R = Math.floor(REFERENCE_WIDTH / (COLS * 2 + 1));
  if (R < 10) R = 10;

  // Canvas boyutlarını sabit tut
  W = REFERENCE_WIDTH;
  H = REFERENCE_HEIGHT;

  ROWS_VISIBLE = Math.floor((H - R * 4) / (R * 1.73));

  canvas.width = W; canvas.height = H;
  aimCanvas.width = W; aimCanvas.height = H;

  shooterX = W / 2;
  shooterY = H - R * 2.5;

  bgInited = false;
}
