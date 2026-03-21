// ─── SCREENS & HUD ────────────────────────────────────────────
function updateHUD() {
  document.getElementById('score-val').textContent = score;
  document.getElementById('level-val').textContent = level;

  // Bomb count
  const bombEl = document.getElementById('bomb-count');
  if (bombEl) bombEl.textContent = bombs;

  // Bomb button active state
  const bombBtn = document.getElementById('bomb-btn');
  if (bombBtn) {
    bombBtn.classList.toggle('active', bombMode);
  }
}

function showGameOver() {
  gameRunning = false;
  sfxGameOver();
  saveProgress();
  const prog = loadProgress();
  document.getElementById('final-score').textContent = `Score: ${score}`;
  const hsEl = document.getElementById('high-score');
  if (hsEl) hsEl.textContent = `Best: ${prog.highScore}`;
  document.getElementById('gameover-screen').classList.remove('hidden');
}

function showLevelClear() {
  gameRunning = false;
  sfxLevelClear();
  saveProgress();
  document.getElementById('level-score').textContent = `Score: ${score}`;
  document.getElementById('level-msg').textContent = level < 5 ? 'Excellent! Keep popping!' : 'You\'re on fire!';
  document.getElementById('levelclear-screen').classList.remove('hidden');
}

function showAdPrompt() {
  sfxNoMatch(); // subtle error sound
  document.getElementById('ad-prompt-screen').classList.remove('hidden');
}

function closeAdPrompt() {
  sfxBounce();
  document.getElementById('ad-prompt-screen').classList.add('hidden');
}

function watchAdForBombs() {
  sfxBounce();
  document.getElementById('ad-prompt-screen').classList.add('hidden');
  if (typeof window.showRewarded === 'function') {
    window.showRewarded();
  }
}
