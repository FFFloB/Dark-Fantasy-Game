// ============================================================
//  GAME — Core game state manager
// ============================================================

const Game = (() => {
  let state = null;

  function init(session) {
    const isKnight = session.character === 'knight';
    const currentArea = session.currentArea || 'demo';

    // Generate and load map
    const areaDef = (typeof Data !== 'undefined' && Data.areas && Data.areas[currentArea])
      ? Data.areas[currentArea] : null;
    const mapData = MapGen.generate(currentArea, session.sharedSeed || 'DEMO', areaDef);
    Map.load(mapData);

    state = {
      character: session.character,
      timeline: isKnight ? 'past' : 'present',
      sharedSeed: session.sharedSeed || 'DEMO',
      demo: session.demo || false,
      currentArea,
      player: session.player || { x: mapData.spawn.x, y: mapData.spawn.y },
      explored: session.explored || createExploredArray(),
      interactedObjects: session.interactedObjects || [],
      appliedGlyphs: session.appliedGlyphs || [],
      discoveredGlyphs: session.discoveredGlyphs || [],
      lastDir: session.lastDir || { x: 0, y: -1 },
      storyFlags: session.storyFlags || {},
      echoChoices: session.echoChoices || [],
      // Stats and bond initialized by their modules if available
      stats: session.stats || null,
      bond: session.bond || null,
    };

    // Init sub-systems if available
    if (typeof Stats !== 'undefined' && !state.stats) {
      state.stats = Stats.init(state.character);
    }
    if (typeof Bond !== 'undefined' && !state.bond) {
      state.bond = Bond.init(0);
    }

    revealAround(state.player.x, state.player.y);
    save();
    return state;
  }

  function initDemo(character) {
    return init({
      character: character || 'knight',
      demo: true,
      sharedSeed: 'DEMO',
      currentArea: 'demo',
    });
  }

  function createExploredArray() {
    const arr = [];
    for (let y = 0; y < Map.H; y++) {
      arr[y] = [];
      for (let x = 0; x < Map.W; x++) arr[y][x] = false;
    }
    return arr;
  }

  function revealAround(px, py) {
    const radius = 5;
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const x = px + dx, y = py + dy;
        if (x >= 0 && x < Map.W && y >= 0 && y < Map.H) {
          if (dx * dx + dy * dy <= radius * radius) {
            state.explored[y][x] = true;
          }
        }
      }
    }
  }

  function movePlayer(dx, dy) {
    if (!state) return false;
    const nx = state.player.x + dx;
    const ny = state.player.y + dy;
    if (!Map.isWalkable(nx, ny, state)) return false;

    state.player.x = nx;
    state.player.y = ny;
    if (dx !== 0 || dy !== 0) state.lastDir = { x: dx, y: dy };
    revealAround(nx, ny);

    // Check for exit tile
    const exit = Map.getExits().find(e => e.x === nx && e.y === ny);
    if (exit && typeof transitionArea === 'function') {
      // Defer transition to next frame to let rendering catch up
      setTimeout(() => transitionArea(exit.targetArea, exit.targetSpawn), 50);
    }

    save();
    return true;
  }

  function getAdjacentObject() {
    if (!state) return null;
    const px = state.player.x, py = state.player.y;

    const onTile = Map.getObjectAt(px, py);
    if (onTile) return onTile;

    const fx = px + state.lastDir.x, fy = py + state.lastDir.y;
    const facing = Map.getObjectAt(fx, fy);
    if (facing) return facing;

    const near = Map.getObjectsNear(px, py);
    return near.length > 0 ? near[0] : null;
  }

  function interact() {
    if (!state) return null;
    const obj = getAdjacentObject();
    if (!obj) return { type: 'none', message: 'Nothing to interact with here.' };

    const label = obj.label ? (obj.label[state.timeline] || obj.label.past || 'Something is here.') : 'Something is here.';

    switch (obj.type) {
      case 'discovery': {
        if (state.interactedObjects.includes(obj.id)) {
          return { type: 'already', message: label + ' (already examined)' };
        }
        const glyph = Crypto.generateGlyph(state.sharedSeed, obj.eventId);
        state.interactedObjects.push(obj.id);
        state.discoveredGlyphs.push(obj.eventId);
        save();
        return { type: 'glyph', message: label, glyph, eventId: obj.eventId };
      }

      case 'chest': {
        if (obj.unlockedBy && !state.appliedGlyphs.includes(obj.unlockedBy)) {
          return { type: 'locked', message: label + ' — It won\'t budge. Perhaps something from the other side could help.' };
        }
        if (state.interactedObjects.includes(obj.id)) {
          return { type: 'already', message: 'The chest is empty.' };
        }
        state.interactedObjects.push(obj.id);
        // Give item if defined
        if (obj.item && state.stats && typeof Stats !== 'undefined') {
          Stats.addItem(state.stats, obj.item);
        }
        save();
        return { type: 'opened', message: obj.item ? 'The chest opens! Found: ' + obj.item.name : 'The chest opens! Inside: a weathered journal.' };
      }

      case 'gate': {
        if (state.appliedGlyphs.includes(obj.unlockedBy)) {
          return { type: 'opened', message: 'The gate stands open.' };
        }
        return { type: 'locked', message: label + ' — Sealed. A glyph from elsewhere might break the ward.' };
      }

      case 'combined': {
        const isFirstHalf = state.timeline === 'past';
        const half = Crypto.generateHalfGlyph(state.sharedSeed, obj.eventId, isFirstHalf);
        if (state.interactedObjects.includes(obj.id)) {
          return { type: 'already', message: label + ` (your half: ${half}-????)` };
        }
        state.interactedObjects.push(obj.id);
        save();
        return { type: 'half-glyph', message: label, glyph: half + '-????', half, eventId: obj.eventId };
      }

      case 'npc': {
        const dialogue = obj.dialogue ? (obj.dialogue[state.timeline] || obj.dialogue.past || []) : [];
        if (dialogue.length > 0 && typeof Dialogue !== 'undefined') {
          Dialogue.show(dialogue);
        }
        return { type: 'npc', message: label };
      }

      case 'echo_choice': {
        if (state.interactedObjects.includes(obj.id)) {
          return { type: 'already', message: label + ' (already chosen)' };
        }
        if (obj.choices && typeof Dialogue !== 'undefined') {
          Dialogue.showChoice(label, obj.choices.map(c => c.label), (idx) => {
            const choice = obj.choices[idx];
            state.interactedObjects.push(obj.id);
            state.echoChoices.push(choice.eventId);
            const glyph = Crypto.generateGlyph(state.sharedSeed, choice.eventId);
            save();
            showGeneratedGlyph(glyph, choice.message || 'Your choice echoes across time...');
          });
          return { type: 'echo_choice', message: label };
        }
        return { type: 'examine', message: label };
      }

      case 'enemy': {
        // Filter by timeline
        if (obj.label && !obj.label[state.timeline]) {
          return { type: 'none', message: '' };
        }
        if (state.interactedObjects.includes(obj.id)) {
          return { type: 'already', message: 'The threat has passed.' };
        }
        const enemyDef = (typeof Data !== 'undefined' && Data.enemies) ? Data.enemies[obj.enemyId] : null;
        if (enemyDef && typeof Combat !== 'undefined') {
          Combat.start(enemyDef, obj.id);
        }
        return { type: 'combat', message: label };
      }

      case 'confession': {
        if (state.interactedObjects.includes(obj.id)) {
          return { type: 'already', message: 'You have already spoken here.' };
        }
        const questions = obj.questions ? (obj.questions[state.character] || obj.questions.knight || []) : [];
        if (questions.length > 0 && typeof Dialogue !== 'undefined') {
          let qIdx = 0;
          function askNext() {
            if (qIdx >= questions.length) {
              state.interactedObjects.push(obj.id);
              save();
              return;
            }
            const q = questions[qIdx];
            Dialogue.showChoice(q.prompt, q.options, (idx) => {
              const answer = q.glyphIds[idx];
              const glyph = Crypto.generateGlyph(state.sharedSeed, answer);
              showGeneratedGlyph(glyph, q.echoText || 'Your words echo across time...');
              qIdx++;
              setTimeout(askNext, 300);
            });
          }
          askNext();
        }
        return { type: 'confession', message: label };
      }

      case 'trial': {
        // Guilt (past) or power (present) trial objects
        const meterKey = state.timeline === 'past' ? 'guilt_meter' : 'power_meter';
        if (!state[meterKey]) state[meterKey] = 0;

        // Mercy history reduces impact
        const mercyData = (typeof Endings !== 'undefined') ? Endings.countMercy(state.storyFlags) : { mercy: 0 };
        const reduction = Math.min(0.5, mercyData.mercy * 0.1); // each mercy reduces by 10%, max 50%
        const impact = Math.round((obj.impact || 15) * (1 - reduction));

        state[meterKey] = Math.min(100, state[meterKey] + impact);
        save();

        if (state[meterKey] >= 100) {
          // Trial failed — reset meter, push player back
          state[meterKey] = 50;
          save();
          return { type: 'trial_fail', message: state.timeline === 'past'
            ? 'The guilt overwhelms you. You stagger back, gasping.'
            : 'The power surges. You lose control for a moment. Pull back.' };
        }

        const meterPct = state[meterKey];
        const desc = obj.trialText ? (obj.trialText[state.timeline] || label) : label;
        return { type: 'trial', message: desc + ` (${meterKey}: ${meterPct}%)` };
      }

      case 'throne_choice': {
        if (state.storyFlags.throne_choice) {
          return { type: 'already', message: 'You have made your choice. The Throne remembers.' };
        }
        if (typeof Dialogue !== 'undefined') {
          Dialogue.showChoice(
            'The Ashen Throne waits. What do you choose?',
            ['Sacrifice — sit the Throne', 'Refuse — walk away'],
            (idx) => {
              const choice = idx === 0 ? 'sacrifice' : 'refuse';
              state.storyFlags.throne_choice = choice;

              // Generate sync ritual code for partner
              const ritualCode = Crypto.generateSyncCode(state.sharedSeed, 'throne_final');
              save();

              const choiceMsg = choice === 'sacrifice'
                ? 'You choose to sit the Throne. The weight of ten thousand lives awaits.'
                : 'You turn away. Some burdens are too great to carry alone.';
              showGeneratedGlyph(ritualCode, choiceMsg + ' Share this final code with your partner.');
            }
          );
        }
        return { type: 'throne_choice', message: label };
      }

      case 'exit': {
        if (obj.targetArea) {
          transitionArea(obj.targetArea, obj.targetSpawn);
        }
        return { type: 'exit', message: 'You move onward...' };
      }

      case 'sync_ritual': {
        if (state.interactedObjects.includes(obj.id)) {
          return { type: 'already', message: 'The circle is quiet now. The resonance has passed.' };
        }
        // Show sync ritual UI
        if (typeof showSyncRitual === 'function') {
          showSyncRitual(obj.eventId, label);
        }
        return { type: 'sync_ritual', message: label };
      }

      case 'examine':
      default:
        return { type: 'examine', message: label };
    }
  }

  function tryApplyGlyph(code) {
    if (!state) return null;

    const possibleIds = Map.getObjects()
      .filter(o => o.eventId && (
        o.forTimeline === state.timeline ||
        o.forTimeline === null ||
        state.demo
      ))
      .map(o => o.eventId);

    // Also check echo choice event IDs
    Map.getObjects().forEach(o => {
      if (o.choices) o.choices.forEach(c => {
        if (c.eventId) possibleIds.push(c.eventId);
      });
    });

    // Check for throne sync ritual (partner's final choice)
    if (state.storyFlags.throne_choice && !state.storyFlags.partner_throne_choice) {
      if (Crypto.validateSyncCode(state.sharedSeed, code, 'throne_final')) {
        state.storyFlags.partner_throne_choice = 'sacrifice'; // if code validates, partner chose sacrifice
        // Determine and show ending
        if (typeof Endings !== 'undefined') {
          const endingId = Endings.calculate(state);
          save();
          setTimeout(() => Endings.show(endingId, state), 500);
          return { eventId: 'throne_final', description: 'The Throne resonates. The ending approaches...' };
        }
      }
      // If sync code doesn't match sacrifice, partner chose refuse
      // (they wouldn't have a sync code — the glyph text itself is the signal)
    }

    const matchedId = Crypto.validateGlyph(state.sharedSeed, code, possibleIds);
    if (!matchedId) return null;

    if (state.appliedGlyphs.includes(matchedId)) {
      return { eventId: matchedId, description: 'This glyph has already been applied.' };
    }

    state.appliedGlyphs.push(matchedId);

    // Increase bond if available
    if (state.bond && typeof Bond !== 'undefined') {
      const vision = Bond.increase(state.bond, 5, state.character);
      if (vision && typeof Dialogue !== 'undefined') {
        setTimeout(() => Dialogue.show(vision.lines), 500);
      }
    }

    save();

    const obj = Map.getObjects().find(o => o.eventId === matchedId);
    if (obj && obj.type === 'gate') {
      return { eventId: matchedId, description: 'A distant gate grinds open...' };
    }
    if (obj && (obj.type === 'chest' || obj.unlockedBy)) {
      return { eventId: matchedId, description: 'Something clicks. A lock yields.' };
    }
    return { eventId: matchedId, description: 'The glyph resonates through the stone.' };
  }

  function transitionArea(areaId, spawnPoint) {
    if (!state) return;

    // Save current area's explored state
    const session = Persist.loadSession() || {};
    session.exploredAreas = session.exploredAreas || {};
    session.exploredAreas[state.currentArea] = state.explored;

    // Load new area
    state.currentArea = areaId;
    const areaDef = (typeof Data !== 'undefined' && Data.areas && Data.areas[areaId])
      ? Data.areas[areaId] : null;
    const mapData = MapGen.generate(areaId, state.sharedSeed, areaDef);
    Map.load(mapData);

    // Restore or create explored array
    state.explored = (session.exploredAreas && session.exploredAreas[areaId])
      ? session.exploredAreas[areaId]
      : createExploredArray();

    state.player = spawnPoint || { x: mapData.spawn.x, y: mapData.spawn.y };
    revealAround(state.player.x, state.player.y);
    save();

    // Update camera and render
    if (typeof Input !== 'undefined') Input.updateCamera();
    if (typeof Renderer !== 'undefined') Renderer.draw(state, state.timeline);
  }

  function setTimeline(tl) {
    if (!state) return;
    state.timeline = tl;
    state.character = tl === 'past' ? 'knight' : 'whisper';
    save();
  }

  function setStoryFlag(flag, value) {
    if (!state) return;
    state.storyFlags[flag] = value;
    save();
  }

  function getStoryFlag(flag) {
    return state ? state.storyFlags[flag] : undefined;
  }

  function isExplored(x, y) {
    if (!state || y < 0 || y >= Map.H || x < 0 || x >= Map.W) return false;
    return state.explored[y][x];
  }

  function isVisible(x, y) {
    if (!state) return false;
    const dx = x - state.player.x, dy = y - state.player.y;
    return dx * dx + dy * dy <= 25;
  }

  function save() {
    if (!state) return;
    const session = Persist.loadSession() || {};
    session.player = state.player;
    session.explored = state.explored;
    session.interactedObjects = state.interactedObjects;
    session.appliedGlyphs = state.appliedGlyphs;
    session.discoveredGlyphs = state.discoveredGlyphs;
    session.lastDir = state.lastDir;
    session.demo = state.demo;
    session.currentArea = state.currentArea;
    session.storyFlags = state.storyFlags;
    session.echoChoices = state.echoChoices;
    session.stats = state.stats;
    session.bond = state.bond;
    Persist.saveSession(session);
  }

  function getState() { return state; }

  return {
    init, initDemo, movePlayer, interact, tryApplyGlyph, getAdjacentObject,
    setTimeline, setStoryFlag, getStoryFlag, transitionArea,
    isExplored, isVisible, getState, save,
  };
})();
