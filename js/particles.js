// ─── PARTICLES ────────────────────────────────────────────────
function spawnParticles(x, y, color) {
  for (let i = 0; i < 16; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 5 + 1.5;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color,
      size: Math.random() * 5 + 2,
      alpha: 1,
      life: Math.random() * 30 + 18,
      type: 'circle'
    });
  }
  for (let i = 0; i < 6; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 2 + 0.5;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1,
      color: '#fff',
      size: Math.random() * 3 + 1,
      alpha: 1,
      life: Math.random() * 15 + 10,
      type: 'sparkle'
    });
  }
}

function spawnBombParticles(x, y) {
  const fireColors = ['#ffeb3b', '#ff9800', '#f44336', '#ff5722', '#fff176', '#ffcc02'];
  for (let i = 0; i < 40; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 8 + 2;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color: fireColors[Math.floor(Math.random() * fireColors.length)],
      size: Math.random() * 7 + 3,
      alpha: 1,
      life: Math.random() * 35 + 20,
      type: 'circle'
    });
  }
  for (let i = 0; i < 20; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 6 + 3;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color: '#fff',
      size: Math.random() * 4 + 1,
      alpha: 1,
      life: Math.random() * 20 + 10,
      type: 'sparkle'
    });
  }
  for (let i = 0; i < 8; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 3 + 1;
    particles.push({
      x: x + Math.cos(angle) * R * 2,
      y: y + Math.sin(angle) * R * 2,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      color: '#555',
      size: Math.random() * 6 + 4,
      alpha: 0.7,
      life: Math.random() * 40 + 25,
      type: 'smoke'
    });
  }
}

function updateParticles() {
  particles = particles.filter(p => p.alpha > 0.01);
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    if (p.type === 'smoke') {
      p.vy -= 0.05;
      p.vx *= 0.98;
      p.size *= 1.01;
    } else {
      p.vy += 0.15;
    }
    p.alpha -= 1 / p.life;
    if (p.type !== 'smoke') p.size *= 0.97;
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
    if (!b.rot) b.rot = 0;
    b.rot += b.vx * 0.05;
  });
}
