// ─── DRAWING ──────────────────────────────────────────────────
function lighten(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = Math.min(255, (n >> 16) + amt);
  let g = Math.min(255, ((n >> 8) & 0xff) + amt);
  let b = Math.min(255, (n & 0xff) + amt);
  return `rgb(${r},${g},${b})`;
}

function darken(hex, amt) { return lighten(hex, -amt); }

// ─── EASING FUNCTIONS ─────────────────────────────────────────
function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function easeOutElastic(t) {
  if (t === 0 || t === 1) return t;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI / 3)) + 1;
}

function drawBubble(context, x, y, color, r, alpha = 1) {
  context.save();
  context.globalAlpha = alpha;

  // Shadow glow
  context.shadowColor = color;
  context.shadowBlur = 10;

  // Main circle
  const grad = context.createRadialGradient(x - r*0.3, y - r*0.35, r*0.05, x, y, r);
  grad.addColorStop(0, lighten(color, 60));
  grad.addColorStop(0.5, color);
  grad.addColorStop(1, darken(color, 40));
  context.beginPath();
  context.arc(x, y, r * 0.92, 0, Math.PI * 2);
  context.fillStyle = grad;
  context.fill();

  // Highlight
  context.shadowBlur = 0;
  context.beginPath();
  context.arc(x - r*0.28, y - r*0.32, r * 0.22, 0, Math.PI * 2);
  context.fillStyle = 'rgba(255,255,255,0.55)';
  context.fill();

  context.restore();
}

function drawBomb(context, x, y, r, alpha = 1) {
  context.save();
  context.globalAlpha = alpha;
  
  // Outer glow
  context.shadowColor = '#ff6b6b';
  context.shadowBlur = 15;

  // Dark bomb body
  const grad = context.createRadialGradient(x - r*0.2, y - r*0.2, 0, x, y, r);
  grad.addColorStop(0, '#555');
  grad.addColorStop(0.5, '#222');
  grad.addColorStop(1, '#000');
  
  context.beginPath();
  context.arc(x, y, r * 0.9, 0, Math.PI * 2);
  context.fillStyle = grad;
  context.fill();

  // Fuse spark
  const t = Date.now() / 150 > 1 ? (Date.now() % 150)/150 : 0;
  context.shadowColor = '#ffd700';
  context.shadowBlur = 10;
  context.beginPath();
  context.arc(x + r*0.5, y - r*0.6, 3 + Math.random()*2, 0, Math.PI*2);
  context.fillStyle = Math.random() > 0.5 ? '#fff' : '#ffd700';
  context.fill();

  // Fuse line
  context.shadowBlur = 0;
  context.strokeStyle = '#666';
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(x, y - r*0.8);
  context.quadraticCurveTo(x + r*0.3, y - r*1.2, x + r*0.5, y - r*0.6);
  context.stroke();

  // Highlight
  context.beginPath();
  context.arc(x - r*0.3, y - r*0.3, r * 0.2, 0, Math.PI * 2);
  context.fillStyle = 'rgba(255,255,255,0.2)';
  context.fill();

  context.restore();
}

function drawGrid() {
  grid.forEach((row, r) => {
    row && row.forEach((color, c) => {
      if (!color) return;
      const { x, y } = bubbleXY(c, r);
      const animY = y + gridAnimOffsetY;

      // Apply bounce animation if present
      const key = `${r},${c}`;
      const bounce = bounceAnims[key];
      let bScale = 1;
      if (bounce) {
        const t = Math.min(1, bounce.progress);
        bScale = 1 + (bounce.scale - 1) * (1 - easeOutElastic(t));
      }

      drawBubble(ctx, x, animY, color, R * bScale);
    });
  });
}

// Draw pop shrink animations (bubbles fading out after match)
function drawPopAnims() {
  popAnims.forEach(p => {
    const animY = p.y + gridAnimOffsetY;
    if (p.isBlastRing) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 10 * p.alpha;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(p.x, animY, R * p.scale, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    } else {
      drawBubble(ctx, p.x, animY, p.color, R * p.scale, p.alpha);
    }
  });
}

function drawShooter() {
  const cx = shooterX, cy = shooterY;
  ctx.save();
  ctx.shadowColor = 'rgba(0,212,255,0.5)';
  ctx.shadowBlur = 15;
  ctx.fillStyle = 'rgba(0,212,255,0.12)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + R, R * 1.2, R * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  if (currentBubble && !bubbleInFlight) {
    // Smooth scale-in with bounce when new bubble appears
    const s = easeOutBack(Math.min(1, newBubbleAnim));
    if (bombMode) {
      drawBomb(ctx, cx, cy, R * s);
    } else {
      drawBubble(ctx, cx, cy, currentBubble.color, R * s);
    }
  }
}

function drawAimLine() {
  aimCtx.clearRect(0, 0, W, H);
  if (bubbleInFlight || !gameRunning) return;

  aimCtx.save();
  aimCtx.strokeStyle = 'rgba(255,255,255,0.22)';
  aimCtx.lineWidth = 2;
  aimCtx.setLineDash([8, 10]);
  aimCtx.lineDashOffset = -idleAimOsc;

  let x = shooterX, y = shooterY;
  let vx = Math.cos(aimAngle) * 12;
  let vy = Math.sin(aimAngle) * 12;
  aimCtx.beginPath();
  aimCtx.moveTo(x, y);

  // If bomb, show wider radius glow instead of simple line
  if (bombMode) {
    aimCtx.strokeStyle = 'rgba(255,107,107,0.4)';
    aimCtx.lineWidth = 4;
  }

  for (let i = 0; i < 25; i++) {
    x += vx; y += vy;
    if (x < R) { x = R; vx *= -1; }
    if (x > W - R) { x = W - R; vx *= -1; }
    if (y < R) break;
    aimCtx.lineTo(x, y);
    let nearGrid = false;
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!grid[r]?.[c]) continue;
        const pos = bubbleXY(c, r);
        const visualY = pos.y + gridAnimOffsetY;
        if (Math.hypot(x - pos.x, y - visualY) < R * 2.2) { nearGrid = true; break; }
      }
      if (nearGrid) break;
    }
    if (nearGrid) break;
  }
  aimCtx.stroke();
  aimCtx.restore();
}

// Draw glowing trail behind in-flight bubble
function drawTrail() {
  if (!bubbleInFlight || trailPositions.length < 2) return;
  const len = trailPositions.length;
  for (let i = 0; i < len; i++) {
    const t = i / len; // 0 = oldest, 1 = newest
    const pos = trailPositions[i];
    const alpha = t * 0.45;
    const size = R * (0.15 + t * 0.55);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = pos.color;
    ctx.shadowColor = pos.color;
    ctx.shadowBlur = 12 * t;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawInFlight() {
  if (!currentBubble || !bubbleInFlight) return;
  if (bombMode) {
    drawBomb(ctx, currentBubble.x, currentBubble.y, R);
  } else {
    drawBubble(ctx, currentBubble.x, currentBubble.y, currentBubble.color, R);
  }
}

function drawFalling() {
  fallingBubbles.forEach(b => drawBubble(ctx, b.x, b.y, b.color, R * 0.85, b.alpha));
}

function drawParticles() {
  particles.forEach(p => {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function drawFloatTexts() {
  floatingTexts.forEach(t => {
    ctx.save();
    ctx.globalAlpha = t.alpha;
    ctx.fillStyle = '#ffd700';
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 10;
    ctx.font = `bold 18px 'Fredoka One', cursive`;
    ctx.textAlign = 'center';
    ctx.fillText(t.text, t.x, t.y);
    ctx.restore();
  });
}

function drawBackground() {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#0d0d35');
  grad.addColorStop(1, '#12124a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Danger zone line
  ctx.save();
  ctx.strokeStyle = 'rgba(255,107,107,0.2)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 6]);
  ctx.beginPath();
  ctx.moveTo(0, shooterY - R * 2);
  ctx.lineTo(W, shooterY - R * 2);
  ctx.stroke();
  ctx.restore();
}

function drawNextBubble() {
  if (!nextBubble) return;
  const nc = nextCanvas.getContext('2d');
  nc.clearRect(0, 0, 44, 44);
  const grad = nc.createRadialGradient(16, 14, 2, 22, 22, 20);
  grad.addColorStop(0, lighten(nextBubble.color, 60));
  grad.addColorStop(0.5, nextBubble.color);
  grad.addColorStop(1, darken(nextBubble.color, 40));
  nc.beginPath();
  nc.arc(22, 22, 18, 0, Math.PI * 2);
  nc.fillStyle = grad;
  nc.shadowColor = nextBubble.color;
  nc.shadowBlur = 10;
  nc.fill();
  nc.beginPath();
  nc.arc(15, 15, 5, 0, Math.PI * 2);
  nc.fillStyle = 'rgba(255,255,255,0.5)';
  nc.fill();
}
