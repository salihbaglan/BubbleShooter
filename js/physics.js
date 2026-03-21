// ─── BUBBLE CREATION ──────────────────────────────────────────
function newCurrentBubble() {
  currentBubble = nextBubble || { color: randomColor(), x: shooterX, y: shooterY, vx: 0, vy: 0 };
  currentBubble.x = shooterX;
  currentBubble.y = shooterY;
  nextBubble = { color: randomColor(), x: 0, y: 0, vx: 0, vy: 0 };
  newBubbleAnim = 0; // trigger scale-in animation
  drawNextBubble();
}

function swapBubbles() {
  if (!gameRunning || bubbleInFlight || !currentBubble || !nextBubble) return;
  const tempColor = currentBubble.color;
  currentBubble.color = nextBubble.color;
  nextBubble.color = tempColor;
  newBubbleAnim = 0;
  sfxBounce();
  drawNextBubble();
}

function useBomb() {
  if (!gameRunning || bubbleInFlight) return;
  if (bombs <= 0) {
    showAdPrompt();
    return;
  }
  bombMode = !bombMode; // toggle bomb mode
  sfxBounce();
  updateHUD();
}

// ─── REMOVE FLOATING BUBBLES ──────────────────────────────────
function removeFloating(withReward) {
  const floating = getFloating();
  if (floating.length === 0) return;

  if (withReward) sfxBigPop();

  floating.forEach(([fr, fc]) => {
    const pos = bubbleXY(fc, fr);
    fallingBubbles.push({
      x: pos.x, y: pos.y,
      vx: (Math.random() - 0.5) * 3,
      vy: -2 + Math.random() * 1,
      color: grid[fr][fc],
      alpha: 1
    });
    grid[fr][fc] = null;
  });

  if (withReward) {
    score += floating.length * 20 * level;
    updateHUD();
  }
}

// ─── PLACE BUBBLE ─────────────────────────────────────────────
function placeBubble(x, y, color) {
  const cell = nearestCell(x, y);
  if (!cell) return;
  let { r, c } = cell;

  while (grid.length <= r) grid.push(new Array(COLS).fill(null));

  if (grid[r][c]) {
    const neighbors = getNeighbors(r, c);
    const empty = neighbors.find(([nr, nc]) => !grid[nr]?.[nc] && nr >= 0);
    if (empty) { r = empty[0]; c = empty[1]; }
  }

  while (grid.length <= r) grid.push(new Array(COLS).fill(null));
  grid[r][c] = color;

  // Trigger bounce animation for placed bubble
  bounceAnims[`${r},${c}`] = { scale: 1.35, progress: 0 };

  // ─── BOMB MODE ──────────────────────────────────────────────
  if (bombMode) {
    bombMode = false;
    bombs--;
    sfxBigPop();
    
    // Screen shake! 
    screenShake = 15;

    const bombPos = bubbleXY(c, r);
    const blastRadius = R * 5;
    let destroyed = 0;

    // Add multiple expanding shockwaves
    popAnims.push({ x: bombPos.x, y: bombPos.y, color: '#ffeb3b', scale: 0.5, alpha: 1, isBlastRing: true });
    setTimeout(() => {
      popAnims.push({ x: bombPos.x, y: bombPos.y, color: '#ff5722', scale: 1.5, alpha: 0.8, isBlastRing: true });
    }, 50);

    for (let gr = 0; gr < grid.length; gr++) {
      for (let gc = 0; gc < COLS; gc++) {
        if (!grid[gr]?.[gc]) continue;
        const pos = bubbleXY(gc, gr);
        if (Math.hypot(pos.x - bombPos.x, pos.y - bombPos.y) < blastRadius) {
          popAnims.push({ x: pos.x, y: pos.y, color: grid[gr][gc], scale: 1.4, alpha: 1 });
          // Explosive particles (yellow/orange/red mix instead of just bubble color)
          const pColors = ['#ffeb3b', '#ff9800', '#f44336', grid[gr][gc]];
          spawnParticles(pos.x, pos.y, pColors[Math.floor(Math.random()*pColors.length)]);
          grid[gr][gc] = null;
          destroyed++;
        }
      }
    }

    score += destroyed * 15 * level;
    spawnFloatText(bombPos.x, bombPos.y, `BOMB +${destroyed * 15 * level}`);
    removeFloating(true);
    updateHUD();

    if (isGridEmpty()) {
      setTimeout(() => showLevelClear(), 300);
      return;
    }
    newCurrentBubble();
    return;
  }

  // ─── NORMAL MATCH ───────────────────────────────────────────
  const matches = getMatches(r, c);
  if (matches.length >= 3) {
    sfxPop(matches.length);
    matches.forEach(([mr, mc]) => {
      const pos = bubbleXY(mc, mr);
      popAnims.push({ x: pos.x, y: pos.y, color: grid[mr][mc], scale: 1.2, alpha: 1 });
      spawnParticles(pos.x, pos.y, grid[mr][mc]);
      grid[mr][mc] = null;
      delete bounceAnims[`${mr},${mc}`];
    });
    score += matches.length * 10 * level;

    // Check floating with reward (only after actual match)
    removeFloating(true);

    spawnFloatText(x, y, `+${matches.length * 10 * level}`);
    updateHUD();
  } else {
    sfxNoMatch();
    shots++;
    if (shots % DROP_EVERY === 0) {
      dropRow();
      // Silent floating cleanup after row drop (no score/sound)
      removeFloating(false);
    }
  }

  if (isGridEmpty()) {
    setTimeout(() => showLevelClear(), 300);
    return;
  }

  if (gridBottomY() >= shooterY - R * 2) {
    setTimeout(() => showGameOver(), 400);
    return;
  }

  newCurrentBubble();
}

// ─── SHOOTING ─────────────────────────────────────────────────
function shootBubble() {
  if (!gameRunning || bubbleInFlight || !currentBubble) return;
  if (aimAngle > -0.1 || aimAngle < -Math.PI + 0.1) return;
  sfxShoot();
  bubbleInFlight = true;
  trailPositions = [];
  const speed = 14;
  currentBubble.vx = Math.cos(aimAngle) * speed;
  currentBubble.vy = Math.sin(aimAngle) * speed;
}

function updateBubble() {
  if (!currentBubble || !bubbleInFlight) return;

  // Record trail position
  trailPositions.push({ x: currentBubble.x, y: currentBubble.y, color: currentBubble.color });
  if (trailPositions.length > 14) trailPositions.shift();

  currentBubble.x += currentBubble.vx;
  currentBubble.y += currentBubble.vy;

  // Wall bounce
  if (currentBubble.x - R < 0) {
    currentBubble.x = R;
    currentBubble.vx *= -1;
    sfxBounce();
  }
  if (currentBubble.x + R > W) {
    currentBubble.x = W - R;
    currentBubble.vx *= -1;
    sfxBounce();
  }

  // Top wall
  if (currentBubble.y - R < 0) {
    currentBubble.y = R;
    currentBubble.vy *= -1;
    sfxBounce();
  }

  // Collision with grid
  let hit = false;
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!grid[r]?.[c]) continue;
      const pos = bubbleXY(c, r);
      const d = Math.hypot(currentBubble.x - pos.x, currentBubble.y - pos.y);
      if (d < R * 1.9) {
        hit = true; break;
      }
    }
    if (hit) break;
  }

  if (currentBubble.y < R * 2.5) hit = true;

  if (hit) {
    bubbleInFlight = false;
    trailPositions = [];
    placeBubble(currentBubble.x, currentBubble.y, currentBubble.color);
  }
}
