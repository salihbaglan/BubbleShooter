// ─── SOUND ENGINE ─────────────────────────────────────────────
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new AudioCtx();
  return audioCtx;
}

function playTone(freq, type, duration, vol = 0.3, attack = 0.01, decay = 0.1) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, ctx.currentTime + duration);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + attack);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch(e) {}
}

function sfxShoot() { playTone(320, 'sine', 0.12, 0.25); }
function sfxBounce() { playTone(500, 'sine', 0.08, 0.15); }

function sfxPop(count) {
  const notes = [523, 659, 784, 1047, 1319];
  for (let i = 0; i < Math.min(count, 5); i++) {
    setTimeout(() => {
      playTone(notes[i % notes.length], 'sine', 0.15, 0.3);
    }, i * 40);
  }
}

function sfxBigPop() {
  playTone(200, 'sawtooth', 0.3, 0.4);
  setTimeout(() => playTone(400, 'sine', 0.25, 0.3), 60);
  setTimeout(() => playTone(800, 'triangle', 0.2, 0.2), 120);
}

function sfxGameOver() {
  [440, 392, 349, 294, 261].forEach((f, i) => {
    setTimeout(() => playTone(f, 'sawtooth', 0.3, 0.3), i * 150);
  });
}

function sfxLevelClear() {
  [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => {
    setTimeout(() => playTone(f, 'triangle', 0.25, 0.35), i * 100);
  });
}

function sfxNoMatch() { playTone(180, 'square', 0.2, 0.2); }
