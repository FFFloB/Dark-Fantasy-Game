// ============================================================
//  UI — Screen management and glyph exchange interface
// ============================================================

function showScreen(id) {
  document.querySelectorAll('#app > .screen').forEach(el => el.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

// --- CHARACTER SELECT ---

function selectCharacter(character) {
  const session = Persist.loadSession() || {};
  session.character = character;
  Persist.saveSession(session);

  document.querySelectorAll('.char-option').forEach(el => el.classList.remove('selected'));
  document.getElementById('char-' + character).classList.add('selected');
  document.getElementById('btn-confirm-char').classList.remove('hidden');
}

function confirmCharacter() {
  const session = Persist.loadSession();
  if (!session || !session.character) return;

  if (session.sharedSeed) {
    enterGame();
  } else {
    showSeedExchange();
  }
}

// --- DEMO MODE ---

function enterDemoMode() {
  const selected = document.querySelector('.char-option.selected');
  const character = selected ? selected.id.replace('char-', '') : 'knight';

  const session = {
    character,
    demo: true,
    mySeed: 'DEMO01',
    partnerSeed: 'DEMO02',
    sharedSeed: Crypto.combineSeeds('DEMO01', 'DEMO02'),
  };
  Persist.saveSession(session);
  enterGame();
}

function toggleTimeline() {
  const state = Game.getState();
  if (!state) return;

  const newTimeline = state.timeline === 'past' ? 'present' : 'past';
  Game.setTimeline(newTimeline);

  document.body.setAttribute('data-timeline', newTimeline);
  const label = newTimeline === 'past' ? 'The Hollow Knight — Past' : 'The Pale Whisper — Present';
  document.getElementById('game-role-label').textContent = label;

  Input.updateCamera();
  Renderer.draw(Game.getState(), newTimeline);
}

// --- SEED EXCHANGE ---

function showSeedExchange() {
  showScreen('screen-seed');
  const session = Persist.loadSession();

  if (!session.mySeed) {
    session.mySeed = Crypto.generateSeed();
    Persist.saveSession(session);
  }

  document.getElementById('my-seed').textContent = session.mySeed;
  document.getElementById('partner-seed-input').value = '';
  document.getElementById('seed-status').textContent = '';
}

function confirmSeedExchange() {
  const partnerSeed = document.getElementById('partner-seed-input').value.trim().toUpperCase();
  if (partnerSeed.length < 4) {
    document.getElementById('seed-status').textContent = 'Code too short';
    return;
  }

  const session = Persist.loadSession();
  session.partnerSeed = partnerSeed;
  session.sharedSeed = Crypto.combineSeeds(session.mySeed, partnerSeed);
  Persist.saveSession(session);

  // Real game starts in Act 1
  session.currentArea = 'act1_athenaeum';
  Persist.saveSession(session);

  document.getElementById('seed-status').textContent = 'Bond established.';
  setTimeout(() => enterGame(), 800);
}

// --- GAME SCREEN ---

function enterGame() {
  const session = Persist.loadSession();
  if (!session) return;

  showScreen('screen-game');

  // Init game state
  Game.init(session);
  const state = Game.getState();

  // Apply timeline theme
  document.body.setAttribute('data-timeline', state.timeline);
  const label = state.timeline === 'past' ? 'The Hollow Knight — Past' : 'The Pale Whisper — Present';
  document.getElementById('game-role-label').textContent = label;

  // Show timeline toggle in demo mode
  const toggleBtn = document.getElementById('btn-toggle-timeline');
  if (toggleBtn) toggleBtn.classList.toggle('hidden', !state.demo);

  // Init input and render
  const canvas = document.getElementById('game-canvas');
  Input.init(canvas);
  WakeLock.request();
  updateBondLabel();
  Renderer.draw(state, state.timeline);
}

// --- INVENTORY ---

function toggleInventory() {
  const drawer = document.getElementById('inventory-drawer');
  drawer.classList.toggle('hidden');
  if (!drawer.classList.contains('hidden')) renderInventory();
}

function renderInventory() {
  const state = Game.getState();
  if (!state || !state.stats) return;
  const grid = document.getElementById('inventory-grid');
  grid.innerHTML = '';
  for (let i = 0; i < 8; i++) {
    const slot = document.createElement('div');
    slot.className = 'inventory-slot';
    const item = state.stats.items[i];
    if (item) {
      slot.className += ' filled';
      slot.textContent = item.name || item.id;
      slot.onclick = () => useItemFromInventory(item.id);
    } else {
      slot.textContent = '—';
    }
    grid.appendChild(slot);
  }
}

function useItemFromInventory(itemId) {
  const state = Game.getState();
  if (!state || !state.stats) return;
  const item = Stats.useItem(state.stats, itemId);
  if (item) {
    addGlyphLogEntry('Used: ' + (item.name || item.id), 'system');
    document.getElementById('glyph-panel').classList.remove('hidden');
    Game.save();
    renderInventory();
    Renderer.draw(state, state.timeline);
  }
}

// --- BOND ---

function updateBondLabel() {
  const state = Game.getState();
  const el = document.getElementById('bond-label');
  if (el && state && state.bond) {
    el.textContent = Bond.getLabel(state.bond);
  }
}

// --- GLYPH EXCHANGE ---

function openGlyphPanel() {
  document.getElementById('glyph-panel').classList.toggle('hidden');
}

function enterGlyph() {
  const input = document.getElementById('glyph-input');
  const code = input.value.trim().toUpperCase();
  if (!code) return;

  input.value = '';

  // Try sync ritual first
  if (tryCompleteSyncRitual(code)) return;

  const result = Game.tryApplyGlyph(code);
  if (result) {
    addGlyphLogEntry(result.description, 'system');
    updateBondLabel();
    const state = Game.getState();
    Renderer.draw(state, state.timeline);
  } else {
    addGlyphLogEntry('The glyph fades to nothing...', 'error');
  }
}

function addGlyphLogEntry(text, type) {
  const log = document.getElementById('glyph-log');
  const entry = document.createElement('div');
  entry.className = 'log-entry ' + (type || '');
  entry.textContent = text;
  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;
}

function showGeneratedGlyph(code, description) {
  document.getElementById('glyph-panel').classList.remove('hidden');
  addGlyphLogEntry(description, 'system');
  addGlyphLogEntry('A glyph appears: ' + code, 'generated');
  addGlyphLogEntry('Share this with your partner.', 'system');
}

// --- SYNC RITUAL ---

function showSyncRitual(ritualId, description) {
  const state = Game.getState();
  if (!state) return;

  const code = Crypto.generateSyncCode(state.sharedSeed, ritualId);

  Dialogue.show([
    description,
    'A resonance builds in the stone beneath your feet.',
    'When you are both ready, speak the word together.',
    'Your ritual code: ' + code,
    'Enter your partner\'s code when ready.',
  ], () => {
    // After reading, open glyph panel for partner code entry
    document.getElementById('glyph-panel').classList.remove('hidden');
    addGlyphLogEntry('Ritual active: ' + ritualId, 'system');
    addGlyphLogEntry('Your code: ' + code + ' — Share this.', 'generated');
    addGlyphLogEntry('Enter your partner\'s ritual code below.', 'system');

    // Set a flag so enterGlyph knows to validate as sync
    state._pendingSyncRitual = ritualId;
  });
}

function tryCompleteSyncRitual(code) {
  const state = Game.getState();
  if (!state || !state._pendingSyncRitual) return false;

  const ritualId = state._pendingSyncRitual;
  const valid = Crypto.validateSyncCode(state.sharedSeed, code, ritualId);

  if (valid) {
    delete state._pendingSyncRitual;
    state.interactedObjects.push('ritual_' + ritualId);

    // Bond increase for sync ritual
    if (state.bond) {
      const vision = Bond.increase(state.bond, 10, state.character);
      if (vision) {
        setTimeout(() => Dialogue.show(vision.lines), 500);
      }
    }

    Game.save();
    updateBondLabel();
    addGlyphLogEntry('The ritual resonates! The bond deepens.', 'success');
    Renderer.draw(state, state.timeline);
    return true;
  }
  return false;
}

// --- RESET ---

function resetGame() {
  if (confirm('This will erase all progress. Are you sure?')) {
    Persist.clearSession();
    location.reload();
  }
}
