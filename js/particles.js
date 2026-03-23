// ─── PARTICLES ────────────────────────────────────────────────
function spawnParticles(x, y, color) {
  for (let i = 0; i < 8; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 3 + 0.5;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color,
      size: Math.random() * R * 0.5 + R * 0.3,
      alpha: 0.7,
      life: Math.random() * 20 + 15,
      type: 'glow'
    });
  }
  particles.push({
    x, y, vx: 0, vy: 0,
    color,
    size: R * 1.5,
    alpha: 0.6,
    life: 12,
    type: 'ring'
  });
}

function spawnBombParticles(x, y) {
  const fireColors = ['#ffeb3b', '#ff9800', '#f44336', '#ff5722', '#fff'];
  for (let i = 0; i < 24; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 6 + 2;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color: fireColors[Math.floor(Math.random() * fireColors.length)],
      size: Math.random() * R * 0.8 + R * 0.4,
      alpha: 0.8,
      life: Math.random() * 25 + 15,
      type: 'glow'
    });
  }
  for (let i = 0; i < 3; i++) {
    const delay = i * 3;
    particles.push({
      x, y, vx: 0, vy: 0,
      color: fireColors[i],
      size: R * (1 + i * 0.8),
      alpha: 0.7 - i * 0.15,
      life: 15 + delay,
      type: 'ring'
    });
  }
}

function updateParticles() {
  particles = particles.filter(p => p.alpha > 0.01);
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.96;
    p.vy *= 0.96;
    p.alpha -= 1 / p.life;
    if (p.type === 'ring') {
      p.size += 1.5;
    } else {
      p.size *= 0.96;
    }
  });
}

function spawnFloatText(x, y, text) {
  floatingTexts.push({ x, y, text, alpha: 1, vy: -1.5, life: 50, scale: 0 });
}

function updateFloatTexts() {
  floatingTexts = floatingTexts.filter(t => t.alpha > 0.01);
  floatingTexts.forEach(t => {
    t.y += t.vy;
    t.alpha -= 1 / t.life;
    if (t.scale < 1) t.scale = Math.min(1, t.scale + 0.08);
  });
}

function updateFallingBubbles() {
  fallingBubbles = fallingBubbles.filter(b => b.alpha > 0.05 && b.y < H + 50);
  fallingBubbles.forEach(b => {
    b.x += b.vx;
    b.y += b.vy;
    b.vy += 0.4;
    b.alpha -= 0.018;
  });
}
