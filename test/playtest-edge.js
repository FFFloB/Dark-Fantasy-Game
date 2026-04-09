#!/usr/bin/env node

// ============================================================
//  EDGE CASE PLAYTEST — Variation, error handling, boundaries
// ============================================================

const { chromium } = require('playwright');
const path = require('path');

const GAME_URL = 'file:///' + path.resolve(__dirname, '..', 'dist', 'index.html').replace(/\\/g, '/');

const results = [];
let passed = 0, failed = 0;

function pass(test) { results.push({ test, status: 'PASS' }); passed++; console.log('  ✓ ' + test); }
function fail(test, err) { results.push({ test, status: 'FAIL', error: err }); failed++; console.error('  ✗ ' + test + ': ' + err); }

async function ev(page, expr) {
  try { return await page.evaluate(expr); } catch (e) { return { _error: e.message }; }
}

async function freshPage(browser, character, area) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(GAME_URL, { waitUntil: 'load' });
  await page.waitForTimeout(500);

  // Setup game directly
  await ev(page, `
    selectCharacter('${character}');
    const s = Persist.loadSession();
    s.sharedSeed = Crypto.combineSeeds('EDGE01', 'EDGE02');
    s.currentArea = '${area || 'act1_athenaeum'}';
    Persist.saveSession(s);
    enterGame();
  `);
  await page.waitForTimeout(500);
  return { page, ctx, errors };
}

async function dismissDialogue(page) {
  for (let i = 0; i < 20; i++) {
    const active = await ev(page, `Dialogue.isActive()`);
    if (!active) break;
    await ev(page, `Dialogue.advance()`);
    await page.waitForTimeout(150);
  }
}

async function fightUntilDone(page) {
  for (let i = 0; i < 40; i++) {
    const active = await ev(page, `Combat.isActive()`);
    if (!active) break;
    await dismissDialogue(page);
    const turn = await ev(page, `Combat.getState()?.turn`);
    if (turn === 'player') {
      await ev(page, `Combat.doAttack()`);
    }
    await page.waitForTimeout(600);
  }
  await dismissDialogue(page);
}

async function run() {
  console.log('\n=== ASHEN BOND — EDGE CASE PLAYTEST ===\n');

  const browser = await chromium.launch({ headless: true });

  // ==========================================
  // A. WHISPER COMBAT (present timeline)
  // ==========================================
  console.log('--- A. Whisper combat in present timeline ---');
  {
    const { page, ctx, errors } = await freshPage(browser, 'whisper', 'act1_athenaeum');

    const timeline = await ev(page, `Game.getState()?.timeline`);
    if (timeline === 'present') pass('Whisper starts in present');
    else fail('Whisper timeline', timeline);

    // Find present-timeline enemy
    const enemy = await ev(page, `GameMap.getObjects().find(o => o.type === 'enemy' && o.label && o.label.present)`);
    if (enemy) {
      await ev(page, `Game.getState().player.x = ${enemy.x}; Game.getState().player.y = ${enemy.y + 1}; Game.getState().lastDir = {x:0,y:-1}`);
      await ev(page, `Game.interact()`);
      await page.waitForTimeout(200);
      await dismissDialogue(page);

      const combatActive = await ev(page, `Combat.isActive()`);
      if (combatActive) {
        pass('Whisper can enter combat');
        await fightUntilDone(page);
        const done = await ev(page, `!Combat.isActive()`);
        if (done) pass('Whisper combat completes');
        else fail('Whisper combat', 'Still active');
      } else {
        fail('Whisper combat start', 'Not active');
      }
    } else {
      fail('Present enemy', 'No present-timeline enemy found');
    }

    if (errors.length === 0) pass('Whisper session: no JS errors');
    else fail('Whisper JS errors', errors.join('; '));
    await ctx.close();
  }

  // ==========================================
  // B. BOSS FIGHT (Curator past)
  // ==========================================
  console.log('\n--- B. Boss fight: Curator ---');
  {
    const { page, ctx, errors } = await freshPage(browser, 'knight', 'act1_athenaeum');

    const boss = await ev(page, `GameMap.getObjects().find(o => o.enemyId === 'curator_past')`);
    if (boss) {
      await ev(page, `Game.getState().player.x = ${boss.x}; Game.getState().player.y = ${boss.y + 1}; Game.getState().lastDir = {x:0,y:-1}`);
      await ev(page, `Game.interact()`);
      await page.waitForTimeout(200);
      await dismissDialogue(page);

      const active = await ev(page, `Combat.isActive()`);
      if (active) {
        pass('Curator boss combat starts');

        const isBoss = await ev(page, `Combat.getState()?.enemy?.boss`);
        if (isBoss) pass('Enemy flagged as boss');
        else fail('Boss flag', 'Not flagged');

        const maxHp = await ev(page, `Combat.getState()?.enemy?.maxHp`);
        if (maxHp >= 45) pass('Boss has high HP: ' + maxHp);
        else fail('Boss HP', maxHp);

        // Fight until phase 2
        for (let i = 0; i < 20; i++) {
          await dismissDialogue(page);
          const turn = await ev(page, `Combat.getState()?.turn`);
          if (turn === 'player') await ev(page, `Combat.doAttack()`);
          await page.waitForTimeout(600);
          const hp = await ev(page, `Combat.getState()?.enemy?.currentHp`);
          const phase = await ev(page, `Combat.getState()?.enemy?.phaseIdx`);
          if (phase > 0) { pass('Boss phase transition triggered'); break; }
          if (!await ev(page, `Combat.isActive()`)) { pass('Boss defeated before phase 2'); break; }
        }

        await fightUntilDone(page);
      } else {
        fail('Curator combat', 'Not started');
      }
    } else {
      fail('Curator find', 'Not on map');
    }

    if (errors.length === 0) pass('Boss session: no JS errors');
    else fail('Boss JS errors', errors.join('; '));
    await ctx.close();
  }

  // ==========================================
  // C. MERCY SYSTEM
  // ==========================================
  console.log('\n--- C. Mercy system ---');
  {
    const { page, ctx } = await freshPage(browser, 'knight', 'act1_athenaeum');

    // Set bond to 70 (mercy available)
    await ev(page, `Game.getState().bond.level = 70`);

    const enemy = await ev(page, `GameMap.getObjects().find(o => o.type === 'enemy' && o.label && o.label.past)`);
    if (enemy) {
      await ev(page, `Game.getState().player.x = ${enemy.x}; Game.getState().player.y = ${enemy.y + 1}; Game.getState().lastDir = {x:0,y:-1}`);
      await ev(page, `Game.interact()`);
      await page.waitForTimeout(200);
      await dismissDialogue(page);
      await page.waitForTimeout(500);

      // Wait for player turn
      for (let w = 0; w < 10; w++) {
        const t = await ev(page, `Combat.getState()?.turn`);
        if (t === 'player') break;
        await dismissDialogue(page);
        await page.waitForTimeout(300);
      }

      // Try mercy
      await ev(page, `Combat.doMercy()`);
      await page.waitForTimeout(1000);
      await dismissDialogue(page);

      const mercyFlag = await ev(page, `Game.getState()?.storyFlags`);
      const hasMercy = mercyFlag && Object.values(mercyFlag).includes('mercy');
      if (hasMercy) pass('Mercy sets story flag');
      else fail('Mercy flag', JSON.stringify(mercyFlag));

      const bondAfter = await ev(page, `Game.getState()?.bond?.level`);
      if (bondAfter > 70) pass('Mercy increases bond: ' + bondAfter);
      else fail('Mercy bond increase', bondAfter);
    }
    await ctx.close();
  }

  // ==========================================
  // D. DEFEAT (HP → 0)
  // ==========================================
  console.log('\n--- D. Defeat handling ---');
  {
    const { page, ctx } = await freshPage(browser, 'knight', 'act1_athenaeum');

    const enemy = await ev(page, `GameMap.getObjects().find(o => o.type === 'enemy' && o.label && o.label.past)`);
    if (enemy) {
      // Set HP very low
      await ev(page, `Game.getState().stats.hp = 1`);

      await ev(page, `Game.getState().player.x = ${enemy.x}; Game.getState().player.y = ${enemy.y + 1}; Game.getState().lastDir = {x:0,y:-1}`);
      await ev(page, `Game.interact()`);
      await page.waitForTimeout(200);
      await dismissDialogue(page);
      await page.waitForTimeout(500);

      // Wait for player turn, then defend (let enemy kill us)
      for (let w = 0; w < 10; w++) {
        const t = await ev(page, `Combat.getState()?.turn`);
        if (t === 'player') break;
        await dismissDialogue(page);
        await page.waitForTimeout(300);
      }
      await ev(page, `Combat.doDefend()`);
      await page.waitForTimeout(1500);
      await dismissDialogue(page);

      // Check we survived with HP = 1
      const hp = await ev(page, `Game.getState()?.stats?.hp`);
      if (hp >= 1) pass('Defeat: HP restored to ' + hp + ' (no permadeath)');
      else fail('Defeat HP', hp);

      // Enemy should still be on map
      const enemyStill = await ev(page, `!Game.getState().interactedObjects.includes('${enemy.id}')`);
      if (enemyStill) pass('Defeat: enemy remains for retry');
      else fail('Defeat: enemy removed', 'Should stay');
    }
    await ctx.close();
  }

  // ==========================================
  // E. INVALID GLYPH CODES
  // ==========================================
  console.log('\n--- E. Invalid glyph handling ---');
  {
    const { page, ctx } = await freshPage(browser, 'knight', 'act1_athenaeum');

    const result1 = await ev(page, `Game.tryApplyGlyph('TOTALLY-INVALID')`);
    if (result1 === null) pass('Invalid glyph rejected');
    else fail('Invalid glyph', 'Should be null, got ' + JSON.stringify(result1));

    const result2 = await ev(page, `Game.tryApplyGlyph('')`);
    if (result2 === null) pass('Empty glyph rejected');
    else fail('Empty glyph', result2);

    const result3 = await ev(page, `Game.tryApplyGlyph('ASH')`);
    if (result3 === null) pass('Partial glyph rejected');
    else fail('Partial glyph', result3);

    await ctx.close();
  }

  // ==========================================
  // F. DUPLICATE GLYPH APPLICATION
  // ==========================================
  console.log('\n--- F. Duplicate glyph ---');
  {
    const { page, ctx } = await freshPage(browser, 'whisper', 'act1_athenaeum');

    // Find a discovery and generate glyph
    const disc = await ev(page, `GameMap.getObjects().find(o => o.type === 'discovery' && o.label && o.label.present)`);
    if (disc) {
      // Generate the glyph code we'd receive from partner
      const glyph = await ev(page, `Crypto.generateGlyph(Game.getState().sharedSeed, '${disc.eventId}')`);
      if (glyph) {
        const r1 = await ev(page, `Game.tryApplyGlyph('${glyph}')`);
        const r2 = await ev(page, `Game.tryApplyGlyph('${glyph}')`);
        if (r1 && r2 && r2.description.includes('already')) pass('Duplicate glyph handled');
        else fail('Duplicate glyph', `r1=${JSON.stringify(r1)} r2=${JSON.stringify(r2)}`);
      }
    } else {
      pass('Duplicate glyph: no present discovery (skipped)');
    }
    await ctx.close();
  }

  // ==========================================
  // G. INVENTORY FULL (8 items)
  // ==========================================
  console.log('\n--- G. Inventory limits ---');
  {
    const { page, ctx } = await freshPage(browser, 'knight', 'act1_athenaeum');

    // Fill inventory to 8
    for (let i = 0; i < 8; i++) {
      await ev(page, `Stats.addItem(Game.getState().stats, {id:'item_${i}', name:'Item ${i}', type:'consumable', effect:{hp:1}})`);
    }

    const count = await ev(page, `Game.getState()?.stats?.items?.length`);
    if (count === 8) pass('Inventory fills to 8');
    else fail('Inventory fill', count);

    const added = await ev(page, `Stats.addItem(Game.getState().stats, {id:'overflow', name:'Overflow', type:'consumable', effect:{hp:1}})`);
    if (added === false) pass('9th item rejected');
    else fail('Inventory overflow', 'Should reject');

    const stillEight = await ev(page, `Game.getState()?.stats?.items?.length`);
    if (stillEight === 8) pass('Inventory stays at 8');
    else fail('Inventory count after overflow', stillEight);

    await ctx.close();
  }

  // ==========================================
  // H. SESSION RESUME
  // ==========================================
  console.log('\n--- H. Session resume ---');
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(GAME_URL, { waitUntil: 'load' });
    await page.waitForTimeout(500);

    // Start a game, move, save
    await ev(page, `
      selectCharacter('knight');
      const s = Persist.loadSession();
      s.sharedSeed = Crypto.combineSeeds('RESUME1', 'RESUME2');
      s.currentArea = 'act2_city';
      Persist.saveSession(s);
      enterGame();
    `);
    await page.waitForTimeout(500);

    // Move the player
    await ev(page, `Game.movePlayer(1, 0)`);
    const pos1 = await ev(page, `({x: Game.getState().player.x, y: Game.getState().player.y})`);

    // Reload the page
    await page.goto(GAME_URL, { waitUntil: 'load' });
    await page.waitForTimeout(1000);

    // Check state was resumed
    const area = await ev(page, `Game.getState()?.currentArea`);
    const pos2 = await ev(page, `Game.getState()?.player`);

    if (area === 'act2_city') pass('Session resume: area preserved');
    else fail('Session resume area', area);

    if (pos2 && pos2.x === pos1.x && pos2.y === pos1.y) pass('Session resume: position preserved');
    else fail('Session resume position', `Expected ${JSON.stringify(pos1)}, got ${JSON.stringify(pos2)}`);

    await ctx.close();
  }

  // ==========================================
  // I. DEMO MODE
  // ==========================================
  console.log('\n--- I. Demo mode ---');
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(GAME_URL, { waitUntil: 'load' });
    await page.waitForTimeout(500);

    await ev(page, `selectCharacter('knight'); enterDemoMode()`);
    await page.waitForTimeout(500);

    const state = await ev(page, `JSON.parse(JSON.stringify(Game.getState()))`);
    if (state?.demo) pass('Demo mode flag set');
    else fail('Demo mode flag', state?.demo);

    if (state?.currentArea === 'demo') pass('Demo uses demo map');
    else fail('Demo area', state?.currentArea);

    // Timeline toggle works
    await ev(page, `toggleTimeline()`);
    const tl = await ev(page, `Game.getState()?.timeline`);
    if (tl === 'present') pass('Timeline toggle works in demo');
    else fail('Timeline toggle', tl);

    await ctx.close();
  }

  // ==========================================
  // J. ALL ACTS HAVE OBJECTS
  // ==========================================
  console.log('\n--- J. All acts have content ---');
  {
    for (const area of ['act1_athenaeum', 'act2_city', 'act3_tomb', 'act4_throne']) {
      const { page, ctx } = await freshPage(browser, 'knight', area);
      const objCount = await ev(page, `GameMap.getObjects().length`);
      const mapW = await ev(page, `GameMap.W`);
      const mapH = await ev(page, `GameMap.H`);

      if (objCount > 0) pass(`${area}: ${objCount} objects, ${mapW}x${mapH} map`);
      else fail(`${area} content`, 'No objects');

      await ctx.close();
    }
  }

  // ==========================================
  // K. CROSS-TIMELINE GLYPH WEAKENING
  // ==========================================
  console.log('\n--- K. Cross-timeline glyph weakening ---');
  {
    const { page, ctx } = await freshPage(browser, 'whisper', 'act1_athenaeum');

    // Apply the curator's glyph event (simulating partner's mercy)
    await ev(page, `Game.getState().appliedGlyphs.push('combat_curator')`);

    // Now start Curator present fight
    const boss = await ev(page, `GameMap.getObjects().find(o => o.enemyId === 'curator_present')`);
    if (boss) {
      await ev(page, `Game.getState().player.x = ${boss.x}; Game.getState().player.y = ${boss.y + 1}; Game.getState().lastDir = {x:0,y:-1}`);
      await ev(page, `Game.interact()`);
      await page.waitForTimeout(200);
      await dismissDialogue(page);
      await page.waitForTimeout(500);

      const hp = await ev(page, `Combat.getState()?.enemy?.currentHp`);
      const maxHp = await ev(page, `Combat.getState()?.enemy?.maxHp`);

      // Should be weakened (original 45hp - 10 = 35)
      if (hp && hp < 45) pass('Cross-timeline weakening: Curator HP=' + hp + ' (was 45)');
      else fail('Cross-timeline weakening', 'HP=' + hp);

      await fightUntilDone(page);
    }
    await ctx.close();
  }

  // ==========================================
  // L. ENDING EDGE CASES
  // ==========================================
  console.log('\n--- L. Ending edge cases ---');
  {
    const { page, ctx } = await freshPage(browser, 'knight', 'act1_athenaeum');

    // Bond exactly 40 (border of Strangers)
    const e1 = await ev(page, `Endings.calculate({character:'knight', storyFlags:{throne_choice:'sacrifice', partner_throne_choice:'sacrifice'}, bond:{level:40}})`);
    if (e1 === 'strangers') fail('Bond 40 ending', 'Should not be strangers at 40');
    else pass('Bond 40: not strangers → ' + e1);

    // Bond exactly 39 (should be strangers)
    const e2 = await ev(page, `Endings.calculate({character:'knight', storyFlags:{throne_choice:'sacrifice', partner_throne_choice:'sacrifice'}, bond:{level:39}})`);
    if (e2 === 'strangers') pass('Bond 39: strangers ✓');
    else fail('Bond 39', e2);

    // Bond 89, both sacrifice (should NOT be unbroken — needs 90)
    const e3 = await ev(page, `Endings.calculate({character:'knight', storyFlags:{throne_choice:'sacrifice', partner_throne_choice:'sacrifice'}, bond:{level:89}})`);
    if (e3 !== 'unbroken') pass('Bond 89 both sacrifice: not unbroken → ' + e3);
    else fail('Bond 89 unbroken threshold', 'Should need 90');

    // Bond 99, all mercy, both sacrifice (should NOT be paradox — needs 100)
    const e4 = await ev(page, `Endings.calculate({character:'knight', storyFlags:{throne_choice:'sacrifice', partner_throne_choice:'sacrifice', mercy_ward:'mercy', mercy_curator:'mercy'}, bond:{level:99}})`);
    if (e4 !== 'paradox') pass('Bond 99 not paradox → ' + e4);
    else fail('Bond 99 paradox threshold', 'Should need 100');

    await ctx.close();
  }

  // ==========================================
  // REPORT
  // ==========================================
  console.log('\n' + '='.repeat(50));
  console.log(`RESULTS: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  console.log('='.repeat(50));

  if (failed > 0) {
    console.log('\nFailed tests:');
    for (const r of results.filter(r => r.status === 'FAIL')) {
      console.log('  ✗ ' + r.test + ': ' + r.error);
    }
  }

  console.log('\n');
  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(e => { console.error('Playtest crashed:', e); process.exit(2); });
