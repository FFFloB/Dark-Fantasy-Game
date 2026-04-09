// ============================================================
//  COMBAT — Full-screen turn-based combat system
// ============================================================

const Combat = (() => {
  let state = null;

  // Action button layout (on 480x480 canvas)
  const BUTTONS = [
    { id: 'attack', label: 'Attack',  x: 24,  y: 346, w: 210, h: 52 },
    { id: 'defend', label: 'Defend',  x: 246, y: 346, w: 210, h: 52 },
    { id: 'item',   label: 'Item',    x: 24,  y: 410, w: 210, h: 52 },
    { id: 'mercy',  label: 'Mercy',   x: 246, y: 410, w: 210, h: 52 },
  ];

  function start(enemyDef, mapObjId) {
    const gs = Game.getState();

    // Clone enemy for combat instance
    const enemy = {
      ...enemyDef,
      currentHp: enemyDef.hp,
      maxHp: enemyDef.hp,
      currentDef: enemyDef.defense,
      phaseIdx: 0,
      turnCount: 0,
    };

    // Cross-timeline glyph weakening (e.g., past mercy weakens present boss)
    if (enemyDef.glyphEvent && gs.appliedGlyphs.includes(enemyDef.glyphEvent)) {
      const weaken = enemyDef.boss ? 10 : 4;
      enemy.currentHp = Math.max(1, enemy.currentHp - weaken);
      enemy.maxHp = enemy.currentHp;
    }

    state = {
      active: true,
      enemy,
      enemyObjId: mapObjId,
      turn: 'intro',
      log: [],
      defendActive: false,
      damageNumbers: [],
      shakeTimer: 0,
      flashTarget: null,
      flashTimer: 0,
      result: null,
      animFrame: null,
    };

    // Show encounter dialogue, then start player turn
    Dialogue.show(enemyDef.dialogue.encounter, () => {
      state.turn = 'player';
      startAnimLoop();
    });
  }

  // --- ANIMATION LOOP (for combat screen) ---

  function startAnimLoop() {
    if (state.animFrame) return;
    state.animFrame = requestAnimationFrame(combatAnimLoop);
  }

  function combatAnimLoop(now) {
    if (!state || !state.active) return;

    // Update timers
    if (state.shakeTimer > 0) state.shakeTimer = Math.max(0, state.shakeTimer - 16);
    if (state.flashTimer > 0) state.flashTimer = Math.max(0, state.flashTimer - 16);

    // Update damage numbers
    state.damageNumbers = state.damageNumbers.filter(d => {
      d.y -= 0.8;
      d.opacity -= 0.02;
      return d.opacity > 0;
    });

    // Render
    const gs = Game.getState();
    if (gs) Renderer.draw(gs, gs.timeline);

    // Continue if there are active animations
    if (state.shakeTimer > 0 || state.flashTimer > 0 || state.damageNumbers.length > 0) {
      state.animFrame = requestAnimationFrame(combatAnimLoop);
    } else {
      state.animFrame = null;
    }
  }

  function addDamageNumber(value, target) {
    state.damageNumbers.push({
      value, x: target === 'enemy' ? 240 : 120, y: target === 'enemy' ? 130 : 300,
      opacity: 1, color: target === 'enemy' ? '#cc4444' : '#ff6666',
    });
    startAnimLoop();
  }

  function triggerShake() { state.shakeTimer = 200; startAnimLoop(); }
  function triggerFlash(target) { state.flashTarget = target; state.flashTimer = 150; startAnimLoop(); }

  // --- PLAYER ACTIONS ---

  function doAttack() {
    if (!state || state.turn !== 'player') return;
    state.turn = 'animating';
    state.defendActive = false;

    const gs = Game.getState();
    const level = gs.stats ? gs.stats.level : 1;
    const raw = level * 2 + 4 + Math.floor(Math.random() * 3);
    const dmg = Math.max(1, raw - state.enemy.currentDef);

    state.enemy.currentHp = Math.max(0, state.enemy.currentHp - dmg);
    addDamageNumber(dmg, 'enemy');
    triggerFlash('enemy');
    if (typeof Audio !== 'undefined') Audio.hit();
    state.log.push('You strike for ' + dmg + ' damage.');

    checkPhaseTransition();

    if (state.enemy.currentHp <= 0) {
      setTimeout(() => endCombat('victory'), 600);
    } else {
      setTimeout(() => enemyTurn(), 500);
    }
  }

  function doDefend() {
    if (!state || state.turn !== 'player') return;
    state.turn = 'animating';
    state.defendActive = true;
    state.log.push('You brace yourself.');
    setTimeout(() => enemyTurn(), 400);
  }

  function doItem() {
    if (!state || state.turn !== 'player') return;
    const gs = Game.getState();
    if (!gs || !gs.stats) return;

    const consumables = gs.stats.items.filter(i => i.type === 'consumable');
    if (consumables.length === 0) {
      state.log.push('No items to use.');
      Renderer.draw(gs, gs.timeline);
      return;
    }

    state.turn = 'animating';
    Dialogue.showChoice('Use which item?', consumables.map(i => i.name), (idx) => {
      const item = Stats.useItem(gs.stats, consumables[idx].id);
      if (item) {
        state.log.push('Used ' + item.name + '.');
        Game.save();
      }
      state.defendActive = false;
      setTimeout(() => enemyTurn(), 400);
    });
  }

  function doMercy() {
    if (!state || state.turn !== 'player') return;
    const gs = Game.getState();

    // Mercy works: normal enemies always, bosses only below 25% HP
    if (state.enemy.boss && state.enemy.currentHp > state.enemy.maxHp * 0.25) {
      state.log.push('The enemy is too strong to reach. Weaken them first.');
      Renderer.draw(gs, gs.timeline);
      return;
    }

    state.turn = 'animating';
    endCombat('mercy');
  }

  // --- ENEMY TURN ---

  function enemyTurn() {
    if (!state) return;
    state.turn = 'enemy';
    state.enemy.turnCount++;

    const gs = Game.getState();
    const enemy = state.enemy;
    let action = 'attack';

    // Boss pattern
    if (enemy.phases) {
      const phase = enemy.phases[enemy.phaseIdx];
      if (phase && phase.pattern) {
        action = phase.pattern[(enemy.turnCount - 1) % phase.pattern.length];
      }
    }

    if (action === 'attack') {
      const raw = enemy.attack + Math.floor(Math.random() * 3);
      let dmg = Math.max(1, state.defendActive ? Math.floor(raw / 2) : raw);
      if (gs.stats) {
        Stats.takeDamage(gs.stats, dmg);
        Game.save();
      }
      addDamageNumber(dmg, 'player');
      triggerShake();
      triggerFlash('player');
      if (typeof Audio !== 'undefined') Audio.hit();
      const verb = state.defendActive ? ' (blocked)' : '';
      state.log.push(enemy.name + ' attacks for ' + dmg + verb + '.');
    } else if (enemy.abilities && enemy.abilities[action]) {
      const ability = enemy.abilities[action];
      state.log.push(ability.desc);
      if (ability.damage > 0 && gs.stats) {
        let dmg = state.defendActive ? Math.floor(ability.damage / 2) : ability.damage;
        Stats.takeDamage(gs.stats, dmg);
        addDamageNumber(dmg, 'player');
        triggerFlash('player');
      }
      if (ability.effect === 'defense_up') enemy.currentDef += 2;
      if (ability.mpDrain && gs.stats) gs.stats.mp = Math.max(0, gs.stats.mp - ability.mpDrain);
      Game.save();
    }

    state.defendActive = false;

    // Check player death
    if (gs.stats && gs.stats.hp <= 0) {
      setTimeout(() => endCombat('defeat'), 600);
      return;
    }

    setTimeout(() => { state.turn = 'player'; Renderer.draw(gs, gs.timeline); }, 500);
  }

  function checkPhaseTransition() {
    const enemy = state.enemy;
    if (!enemy.phases || enemy.phaseIdx >= enemy.phases.length - 1) return;

    const nextPhase = enemy.phases[enemy.phaseIdx + 1];
    if (enemy.currentHp / enemy.maxHp <= nextPhase.hpThreshold) {
      enemy.phaseIdx++;
      enemy.attack = nextPhase.attack || enemy.attack;
      if (enemy.dialogue && enemy.dialogue.phase2) {
        const gs = Game.getState();
        state.turn = 'animating';
        Dialogue.show(enemy.dialogue.phase2, () => {
          state.turn = 'player';
          Renderer.draw(gs, gs.timeline);
        });
      }
    }
  }

  // --- COMBAT END ---

  function endCombat(result) {
    if (!state) return;
    const gs = Game.getState();
    const enemy = state.enemy;
    state.result = result;

    const lines = enemy.dialogue[result === 'mercy' ? 'mercy' : 'defeat'] || ['The fight is over.'];

    if (result === 'victory') {
      // XP
      if (gs.stats) {
        const leveled = Stats.gainXp(gs.stats, enemy.xp, gs.character);
        lines.push('Gained ' + enemy.xp + ' experience.' + (leveled ? ' Level up!' : ''));
      }
      // Drops
      for (const drop of (enemy.drops || [])) {
        if (Math.random() < drop.chance && gs.stats) {
          if (Stats.addItem(gs.stats, drop.item)) {
            lines.push('Found: ' + drop.item.name);
          }
        }
      }
      // Story flag
      if (enemy.mercyFlag) Game.setStoryFlag(enemy.mercyFlag, 'kill');
    }

    if (result === 'mercy') {
      if (enemy.mercyFlag) Game.setStoryFlag(enemy.mercyFlag, 'mercy');
      // Bond increase
      if (gs.bond) {
        const vision = Bond.increase(gs.bond, enemy.boss ? 10 : 5, gs.character);
        if (vision) {
          lines.push('');
          lines.push(...vision.lines);
        }
      }
    }

    if (result === 'defeat') {
      // Restore to 1 HP, don't remove enemy
      if (gs.stats) { gs.stats.hp = 1; }
      lines.push('You stagger back, barely conscious.');
      Game.save();
      Dialogue.show(lines, () => { state.active = false; state = null; });
      return;
    }

    // Victory/mercy: generate glyph, remove enemy from map
    if (enemy.glyphEvent) {
      const glyph = Crypto.generateGlyph(gs.sharedSeed, enemy.glyphEvent);
      lines.push('A glyph emerges: ' + glyph);
      lines.push('Share this with your partner.');
      // Also add to glyph log
      setTimeout(() => {
        if (typeof showGeneratedGlyph === 'function') {
          showGeneratedGlyph(glyph, result === 'mercy' ? 'Your mercy echoes across time...' : 'The battle resonates across timelines...');
        }
      }, 500);
    }

    // Remove enemy from map
    gs.interactedObjects.push(state.enemyObjId);
    Game.save();

    Dialogue.show(lines, () => {
      state.active = false;
      state = null;
      // Re-render map
      Renderer.draw(gs, gs.timeline);
    });
  }

  // --- COMBAT RENDERER ---

  function draw(ctx, W, H, pal, gs) {
    // Shake offset
    const sx = state.shakeTimer > 0 ? (Math.random() - 0.5) * 4 : 0;
    const sy = state.shakeTimer > 0 ? (Math.random() - 0.5) * 4 : 0;
    ctx.save();
    ctx.translate(sx, sy);

    // Background
    ctx.fillStyle = pal.bg;
    ctx.fillRect(0, 0, W, H);

    // Divider lines
    ctx.strokeStyle = pal.wallStroke;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, 200); ctx.lineTo(W, 200); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, 330); ctx.lineTo(W, 330); ctx.stroke();

    // --- ENEMY AREA (top) ---
    const ex = W / 2, ey = 120;

    // Flash
    if (state.flashTimer > 0 && state.flashTarget === 'enemy') {
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.fillRect(W / 2 - 40, 60, 80, 120);
    }

    // Enemy sprite (simple but distinct)
    drawEnemySprite(ctx, ex, ey, state.enemy, pal);

    // Enemy name + HP
    ctx.fillStyle = pal.textColor;
    ctx.font = '13px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(state.enemy.name, ex, 40);
    ctx.textAlign = 'start';

    // Enemy HP bar
    const ehpW = 160, ehpH = 6;
    const ehpX = ex - ehpW / 2, ehpY = 48;
    ctx.fillStyle = 'rgba(10,10,15,0.6)';
    ctx.fillRect(ehpX - 1, ehpY - 1, ehpW + 2, ehpH + 2);
    ctx.fillStyle = '#8a2a2a';
    ctx.fillRect(ehpX, ehpY, ehpW * Math.max(0, state.enemy.currentHp / state.enemy.maxHp), ehpH);
    ctx.fillStyle = '#cc4444';
    ctx.fillRect(ehpX, ehpY, ehpW * Math.max(0, state.enemy.currentHp / state.enemy.maxHp), 2);

    // --- PLAYER HUD (below enemy) ---
    if (state.flashTimer > 0 && state.flashTarget === 'player') {
      ctx.fillStyle = 'rgba(255,100,100,0.15)';
      ctx.fillRect(0, 205, W, 120);
    }

    if (gs.stats) {
      const phx = 24, phy = 210;
      ctx.fillStyle = pal.textDim;
      ctx.font = '11px "Courier New", monospace';
      ctx.fillText('HP', phx, phy + 10);
      ctx.fillStyle = 'rgba(10,10,15,0.6)';
      ctx.fillRect(phx + 24, phy, 140, 8);
      ctx.fillStyle = '#8a2a2a';
      ctx.fillRect(phx + 24, phy, 140 * (gs.stats.hp / gs.stats.maxHp), 8);
      ctx.fillStyle = '#cc4444';
      ctx.fillRect(phx + 24, phy, 140 * (gs.stats.hp / gs.stats.maxHp), 2);
      ctx.fillStyle = pal.textDim;
      ctx.fillText(gs.stats.hp + '/' + gs.stats.maxHp, phx + 170, phy + 8);

      ctx.fillText('MP', phx, phy + 26);
      ctx.fillStyle = 'rgba(10,10,15,0.6)';
      ctx.fillRect(phx + 24, phy + 16, 140, 8);
      ctx.fillStyle = '#2a3a8a';
      ctx.fillRect(phx + 24, phy + 16, 140 * (gs.stats.mp / gs.stats.maxMp), 8);
      ctx.fillStyle = '#4466cc';
      ctx.fillRect(phx + 24, phy + 16, 140 * (gs.stats.mp / gs.stats.maxMp), 2);
      ctx.fillStyle = pal.textDim;
      ctx.fillText(gs.stats.mp + '/' + gs.stats.maxMp, phx + 170, phy + 24);
    }

    // --- COMBAT LOG ---
    ctx.fillStyle = pal.textDim;
    ctx.font = '10px "Courier New", monospace';
    const logLines = state.log.slice(-3);
    for (let i = 0; i < logLines.length; i++) {
      ctx.fillText(logLines[i], 24, 260 + i * 18);
    }

    // Turn indicator
    if (state.turn === 'player') {
      ctx.fillStyle = pal.textColor;
      ctx.font = '11px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('— Your Turn —', W / 2, 310);
      ctx.textAlign = 'start';
    } else if (state.turn === 'enemy') {
      ctx.fillStyle = '#8a2a2a';
      ctx.font = '11px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('— Enemy Turn —', W / 2, 310);
      ctx.textAlign = 'start';
    }

    // --- ACTION BUTTONS ---
    if (state.turn === 'player') {
      const bondLevel = gs.bond ? gs.bond.level : 0;
      for (const btn of BUTTONS) {
        const isMercy = btn.id === 'mercy';
        const mercyAvailable = bondLevel >= 60;
        const disabled = isMercy && !mercyAvailable;

        ctx.fillStyle = disabled ? pal.bg : pal.wall;
        ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
        ctx.strokeStyle = disabled ? pal.wallStroke : pal.textColor;
        ctx.strokeRect(btn.x + 0.5, btn.y + 0.5, btn.w - 1, btn.h - 1);

        ctx.fillStyle = disabled ? pal.wallStroke : pal.textColor;
        ctx.font = '14px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(isMercy && !mercyAvailable ? '???' : btn.label, btn.x + btn.w / 2, btn.y + btn.h / 2 + 5);
        ctx.textAlign = 'start';
      }
    }

    // --- DAMAGE NUMBERS ---
    for (const d of state.damageNumbers) {
      ctx.globalAlpha = d.opacity;
      ctx.fillStyle = d.color;
      ctx.font = 'bold 18px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('-' + d.value, d.x, d.y);
      ctx.textAlign = 'start';
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  function drawEnemySprite(ctx, x, y, enemy, pal) {
    const isBoss = enemy.boss;
    const sz = isBoss ? 36 : 24;

    // Glow
    const grad = ctx.createRadialGradient(x, y, sz * 0.3, x, y, sz * 1.5);
    grad.addColorStop(0, (enemy.timeline === 'past' ? '#8a2a2a' : '#6a2a6a') + '40');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(x - sz * 2, y - sz * 2, sz * 4, sz * 4);

    // Body
    ctx.fillStyle = enemy.timeline === 'past' ? '#8a2a2a' : '#6a2a6a';
    ctx.beginPath();
    ctx.arc(x, y - sz * 0.3, sz * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x - sz * 0.3, y, sz * 0.6, sz * 0.5);

    // Eyes
    ctx.fillStyle = enemy.timeline === 'past' ? '#cc6644' : '#aa44cc';
    ctx.fillRect(x - 4, y - sz * 0.4, 3, 3);
    ctx.fillRect(x + 2, y - sz * 0.4, 3, 3);

    // Boss crown/marker
    if (isBoss) {
      ctx.fillStyle = pal.textColor;
      ctx.beginPath();
      ctx.moveTo(x - 8, y - sz * 0.7);
      ctx.lineTo(x, y - sz * 0.9);
      ctx.lineTo(x + 8, y - sz * 0.7);
      ctx.stroke();
    }
  }

  // --- TAP HANDLING ---

  function handleTap(e, canvas) {
    if (!state || state.turn !== 'player') return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const cx = (e.clientX - rect.left) * scaleX;
    const cy = (e.clientY - rect.top) * scaleY;

    for (const btn of BUTTONS) {
      if (cx >= btn.x && cx <= btn.x + btn.w && cy >= btn.y && cy <= btn.y + btn.h) {
        switch (btn.id) {
          case 'attack': doAttack(); break;
          case 'defend': doDefend(); break;
          case 'item':   doItem(); break;
          case 'mercy':  doMercy(); break;
        }
        return;
      }
    }
  }

  function isActive() { return state && state.active; }
  function getState() { return state; }

  return { start, isActive, getState, draw, handleTap, doAttack, doDefend, doItem, doMercy };
})();
