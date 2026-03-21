// ─── PARTICLES ────────────────────────────────────────────────
function spawnParticles(x, y, color) {
  for (let i = 0; i < 10; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 4 + 1;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color,
      size: Math.random() * 5 + 2,
      alpha: 1,
      life: Math.random() * 25 + 15
    });
  }
}

function updateParticles() {
  particles = particles.filter(p => p.alpha > 0.01);
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.15;
    p.alpha -= 1 / p.life;
    p.size *= 0.97;
  });
}

function spawnFloatText(x, y, text) {
  floatingTexts.push({ x, y, text, alpha: 1, vy: -1.5, life: 50 });
}

function updateFloatTexts() {
  floatingTexts = floatingTexts.filter(t => t.alpha > 0.01);
  floatingTexts.forEach(t => {
    t.y += t.vy;
    t.alpha -= 1 / t.life;
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
