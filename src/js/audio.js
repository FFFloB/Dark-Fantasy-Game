// ============================================================
//  AUDIO — Procedural sound effects via Web Audio API
// ============================================================

const Audio = (() => {
  let ctx = null;
  let muted = false;

  function getCtx() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch { return null; }
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, duration, type, volume, delay) {
    if (muted) return;
    const c = getCtx();
    if (!c) return;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume || 0.15, c.currentTime + (delay || 0));
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + (delay || 0) + duration);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(c.currentTime + (delay || 0));
    osc.stop(c.currentTime + (delay || 0) + duration);
  }

  function noise(duration, volume) {
    if (muted) return;
    const c = getCtx();
    if (!c) return;
    const bufferSize = c.sampleRate * duration;
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
    const src = c.createBufferSource();
    const gain = c.createGain();
    src.buffer = buffer;
    gain.gain.setValueAtTime(volume || 0.08, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    src.connect(gain);
    gain.connect(c.destination);
    src.start();
  }

  // --- SOUND EFFECTS ---

  function hit() {
    tone(200, 0.08, 'square', 0.12);
    noise(0.06, 0.1);
    tone(120, 0.1, 'sine', 0.08, 0.03);
  }

  function miss() {
    noise(0.12, 0.04);
  }

  function heal() {
    tone(440, 0.15, 'sine', 0.1);
    tone(660, 0.15, 'sine', 0.08, 0.1);
    tone(880, 0.2, 'sine', 0.06, 0.2);
  }

  function glyph() {
    tone(330, 0.3, 'sine', 0.1);
    tone(440, 0.3, 'sine', 0.07, 0.15);
    tone(550, 0.4, 'sine', 0.05, 0.3);
  }

  function mercy() {
    tone(523, 0.4, 'sine', 0.08);
    tone(659, 0.3, 'sine', 0.06, 0.2);
    tone(784, 0.5, 'sine', 0.05, 0.35);
  }

  function step() {
    noise(0.04, 0.03);
  }

  function boss() {
    tone(55, 0.6, 'sawtooth', 0.1);
    tone(65, 0.5, 'sawtooth', 0.08, 0.2);
    tone(45, 0.8, 'sine', 0.06, 0.1);
  }

  function victory() {
    tone(392, 0.2, 'square', 0.08);
    tone(494, 0.2, 'square', 0.07, 0.15);
    tone(588, 0.2, 'square', 0.06, 0.3);
    tone(784, 0.4, 'sine', 0.08, 0.45);
  }

  function defeat() {
    tone(300, 0.3, 'sine', 0.1);
    tone(250, 0.3, 'sine', 0.08, 0.2);
    tone(180, 0.5, 'sine', 0.06, 0.4);
  }

  function interact() {
    tone(600, 0.06, 'square', 0.06);
    tone(800, 0.08, 'square', 0.04, 0.05);
  }

  function vision() {
    tone(220, 0.8, 'sine', 0.06);
    tone(330, 0.6, 'sine', 0.05, 0.3);
    tone(440, 0.5, 'sine', 0.04, 0.6);
    tone(550, 0.4, 'sine', 0.03, 0.9);
  }

  function toggleMute() { muted = !muted; return muted; }
  function isMuted() { return muted; }

  return { hit, miss, heal, glyph, mercy, step, boss, victory, defeat, interact, vision, toggleMute, isMuted };
})();
