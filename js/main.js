// ─── STARS ────────────────────────────────────────────────────
function buildStars() {
  const svg = document.getElementById('stars');
  let html = '';
  const colors = ['white', '#00d4ff', '#ffd700', '#ff6bd6', '#a855f7'];
  for (let i = 0; i < 160; i++) {
    const x = Math.random() * 100, y = Math.random() * 100;
    const r = Math.random() * 1.8 + 0.2;
    const op = Math.random() * 0.7 + 0.1;
    const dur = Math.random() * 4 + 1.5;
    const col = colors[Math.floor(Math.random() * colors.length)];
    html += `<circle cx="${x}%" cy="${y}%" r="${r}" fill="${col}" opacity="${op}">
      <animate attributeName="opacity" values="${op};${op*0.2};${op}" dur="${dur}s" repeatCount="indefinite"/>
    </circle>`;
  }
  svg.innerHTML = html;
}

// ─── ANIMATION UPDATES ───────────────────────────────────────
function updateAnimations() {
  // Screen shake
  if (screenShake > 0.1) {
    screenShake *= 0.85;
    const dx = (Math.random() - 0.5) * screenShake;
    const dy = (Math.random() - 0.5) * screenShake;
    document.getElementById('canvas-container').style.transform = `translate(${dx}px, ${dy}px)`;
  } else if (screenShake > 0) {
    screenShake = 0;
    document.getElementById('canvas-container').style.transform = 'translate(0, 0)';
  }

  // Smooth grid drop offset (lerp toward 0)
  if (gridAnimOffsetY !== 0) {
    gridAnimOffsetY *= 0.86;
    if (Math.abs(gridAnimOffsetY) < 0.3) gridAnimOffsetY = 0;
  }

  // New bubble scale-in
  if (newBubbleAnim < 1) {
    newBubbleAnim = Math.min(1, newBubbleAnim + 0.065);
  }

  // Bounce animations on placed bubbles
  for (const key in bounceAnims) {
    bounceAnims[key].progress += 0.055;
    if (bounceAnims[key].progress >= 1) delete bounceAnims[key];
  }

  // Pop shrink animations & blast rings
  popAnims = popAnims.filter(p => p.alpha > 0.05);
  popAnims.forEach(p => {
    if (p.isBlastRing) {
      p.scale += 0.8;
      p.alpha *= 0.85;
    } else {
      p.scale *= 0.82;
      p.alpha *= 0.82;
    }
  });
}

// ─── GAME LOOP ────────────────────────────────────────────────
function gameLoop(ts) {
  const dt = ts - lastTime;
  lastTime = ts;
  idleAimOsc = (idleAimOsc + 1.5) % 100;

  // Update logic
  updateBubble();
  updateParticles();
  updateFallingBubbles();
  updateFloatTexts();
  updateAnimations();

  // Draw
  ctx.clearRect(0, 0, W, H);
  drawBackground();
  drawGrid();
  drawPopAnims();
  drawShooter();
  drawTrail();
  drawInFlight();
  drawFalling();
  drawParticles();
  drawFloatTexts();
  drawAimLine();

  if (gameRunning) animId = requestAnimationFrame(gameLoop);
}

// ─── RESET ANIMATION STATE ───────────────────────────────────
function resetAnimState() {
  gridAnimOffsetY = 0;
  popAnims = [];
  bounceAnims = {};
  newBubbleAnim = 1;
  trailPositions = [];
  screenShake = 0;
  document.getElementById('canvas-container').style.transform = 'translate(0, 0)';
}

// ─── START / NEXT LEVEL ───────────────────────────────────────
function nextLevel() {
  document.getElementById('levelclear-screen')?.classList.add('hidden');
  level++;
  shots = 0;
  bubbleInFlight = false;
  bombMode = false;
  resetAnimState();
  initGrid(level);
  newCurrentBubble();
  aimAngle = -Math.PI / 2;
  updateHUD();
  saveProgress(); // <-- FIX: Save new level here
  gameRunning = true;
  animId = requestAnimationFrame(gameLoop);
}

function startGame() {
  document.getElementById('gameover-screen')?.classList.add('hidden');
  document.getElementById('levelclear-screen')?.classList.add('hidden');
  document.getElementById('ad-prompt-screen')?.classList.add('hidden');

  const prog = loadProgress();
  score = 0; level = prog.lastLevel; shots = 0; gridParity = 0;
  bombs = prog.savedBombs; bombMode = false;
  bubbleInFlight = false;
  fallingBubbles = []; particles = []; floatingTexts = [];
  resetAnimState();
  initGrid(level);
  newCurrentBubble();
  aimAngle = -Math.PI / 2;
  updateHUD();

  if (animId) cancelAnimationFrame(animId);
  gameRunning = true;
  animId = requestAnimationFrame(gameLoop);
}

// ─── INIT ────────────────────────────────────────────────────
window.addEventListener('load', () => {
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');
  aimCanvas = document.getElementById('aim-line');
  aimCtx = aimCanvas.getContext('2d');
  nextCanvas = document.getElementById('next-canvas');
  nextCtx = nextCanvas.getContext('2d');

  setupSize();
  buildStars();

  addAimEvents(canvas);
  addAimEvents(aimCanvas);

  // Directly start game (no start screen)
  startGame();
});

// ─── SPLAY UNITY CALLBACK ────────────────────────────────────
window.sendMessageToUnity = function(methodName, arg) {
  if (methodName === 'OnRewardedStateChanged' && arg === 'rewarded') {
    // Reward player with 5 bombs
    addBombs(5);
    // Show float text in middle of screen
    spawnFloatText(W/2, H/2, "+5 BOMBS");
  }
  if (methodName === 'OnVisibilityStateChanged') {
    // Optional: Pause game loops if arg === 'hidden'
  }
};

window.addEventListener('resize', () => {
  setupSize();
  if (!gameRunning) {
    ctx.clearRect(0, 0, W, H);
    drawBackground();
    drawGrid();
  }
});
