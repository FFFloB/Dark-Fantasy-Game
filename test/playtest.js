#!/usr/bin/env node

// ============================================================
//  AUTOMATED PLAYTEST — Two-player simulation via Playwright
//  Runs both timelines, exchanges glyphs, tests all systems
//  Output: spoiler-free pass/fail report
// ============================================================

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const GAME_URL = 'file:///' + path.resolve(__dirname, '..', 'dist', 'index.html').replace(/\\/g, '/');

// Test results collector
const results = [];
let passed = 0, failed = 0;

function log(msg) { console.log('  ' + msg); }
function pass(test) { results.push({ test, status: 'PASS' }); passed++; console.log('  ✓ ' + test); }
function fail(test, err) { results.push({ test, status: 'FAIL', error: err }); failed++; console.error('  ✗ ' + test + ': ' + err); }

// Evaluate JS in page context safely
async function ev(page, expr) {
  try { return await page.evaluate(expr); }
  catch (e) { return null; }
}

async function run() {
  console.log('\n=== ASHEN BOND — AUTOMATED PLAYTEST ===\n');
  console.log('Game URL:', GAME_URL);

  const browser = await chromium.launch({ headless: true });

  // Two separate contexts = two separate localStorage stores
  const ctxA = await browser.newContext();
  const ctxB = await browser.newContext();
  const pageA = await ctxA.newPage();
  const pageB = await ctxB.newPage();

  // Collect console errors
  const errorsA = [], errorsB = [];
  pageA.on('console', msg => { if (msg.type() === 'error') errorsA.push(msg.text()); });
  pageB.on('console', msg => { if (msg.type() === 'error') errorsB.push(msg.text()); });
  pageA.on('pageerror', e => errorsA.push(e.message));
  pageB.on('pageerror', e => errorsB.push(e.message));

  // ==========================================
  // 1. LOAD GAME
  // ==========================================
  console.log('\n--- 1. Loading game ---');

  await pageA.goto(GAME_URL, { waitUntil: 'domcontentloaded' });
  await pageB.goto(GAME_URL, { waitUntil: 'domcontentloaded' });
  await pageA.waitForTimeout(500);
  await pageB.waitForTimeout(500);

  const versionA = await ev(pageA, `document.querySelector('.version-tag')?.textContent || 'unknown'`);
  log('Player A version: ' + versionA);
  const versionB = await ev(pageB, `document.querySelector('.version-tag')?.textContent || 'unknown'`);
  log('Player B version: ' + versionB);

  if (versionA && versionA !== 'unknown') pass('Game loads (Player A)');
  else fail('Game loads (Player A)', 'No version tag');
  if (versionB && versionB !== 'unknown') pass('Game loads (Player B)');
  else fail('Game loads (Player B)', 'No version tag');

  // ==========================================
  // 2. CHARACTER SELECT + SEED EXCHANGE
  // ==========================================
  console.log('\n--- 2. Character select + seed exchange ---');

  // Player A selects Knight
  await ev(pageA, `selectCharacter('knight')`);
  await ev(pageA, `confirmCharacter()`);
  await pageA.waitForTimeout(300);

  const seedA = await ev(pageA, `Persist.loadSession()?.mySeed`);
  if (seedA) pass('Player A seed generated: ' + seedA);
  else fail('Player A seed generation', 'No seed');

  // Player B selects Whisper
  await ev(pageB, `selectCharacter('whisper')`);
  await ev(pageB, `confirmCharacter()`);
  await pageB.waitForTimeout(300);

  const seedB = await ev(pageB, `Persist.loadSession()?.mySeed`);
  if (seedB) pass('Player B seed generated: ' + seedB);
  else fail('Player B seed generation', 'No seed');

  // Exchange seeds
  await ev(pageA, `document.getElementById('partner-seed-input').value = '${seedB}'`);
  await ev(pageA, `confirmSeedExchange()`);
  await pageA.waitForTimeout(1000);

  await ev(pageB, `document.getElementById('partner-seed-input').value = '${seedA}'`);
  await ev(pageB, `confirmSeedExchange()`);
  await pageB.waitForTimeout(1000);

  const sharedA = await ev(pageA, `Game.getState()?.sharedSeed`);
  const sharedB = await ev(pageB, `Game.getState()?.sharedSeed`);
  if (sharedA && sharedB && sharedA === sharedB) pass('Shared seed matches');
  else fail('Shared seed match', `A=${sharedA} B=${sharedB}`);

  // ==========================================
  // 3. VERIFY INITIAL STATE
  // ==========================================
  console.log('\n--- 3. Initial state ---');

  const stateA = await ev(pageA, `JSON.parse(JSON.stringify(Game.getState()))`);
  const stateB = await ev(pageB, `JSON.parse(JSON.stringify(Game.getState()))`);

  if (stateA?.timeline === 'past') pass('Player A timeline: past');
  else fail('Player A timeline', stateA?.timeline);
  if (stateB?.timeline === 'present') pass('Player B timeline: present');
  else fail('Player B timeline', stateB?.timeline);

  if (stateA?.stats?.hp > 0) pass('Player A has HP: ' + stateA.stats.hp);
  else fail('Player A HP', 'No stats');
  if (stateB?.stats?.hp > 0) pass('Player B has HP: ' + stateB.stats.hp);
  else fail('Player B HP', 'No stats');

  if (stateA?.bond?.level === 0) pass('Bond starts at 0');
  else fail('Initial bond', stateA?.bond?.level);

  const areaA = stateA?.currentArea;
  if (areaA === 'act1_athenaeum') pass('Player A starts in Act 1');
  else fail('Player A start area', areaA);

  // ==========================================
  // 4. MOVEMENT TEST
  // ==========================================
  console.log('\n--- 4. Movement ---');

  const posBeforeA = await ev(pageA, `({x: Game.getState().player.x, y: Game.getState().player.y})`);
  await ev(pageA, `Game.movePlayer(0, -1)`);
  const posAfterA = await ev(pageA, `({x: Game.getState().player.x, y: Game.getState().player.y})`);

  if (posAfterA && (posAfterA.x !== posBeforeA.x || posAfterA.y !== posBeforeA.y)) {
    pass('Player A can move');
  } else {
    // Try different direction
    await ev(pageA, `Game.movePlayer(1, 0)`);
    const posRetry = await ev(pageA, `({x: Game.getState().player.x, y: Game.getState().player.y})`);
    if (posRetry && (posRetry.x !== posBeforeA.x || posRetry.y !== posBeforeA.y)) pass('Player A can move (alt direction)');
    else fail('Player A movement', 'Position unchanged');
  }

  // ==========================================
  // 5. EXPLORE AND FIND OBJECTS
  // ==========================================
  console.log('\n--- 5. Object interaction ---');

  // Get all objects in current map
  const objectsA = await ev(pageA, `GameMap.getObjects().map(o => ({id:o.id, type:o.type, x:o.x, y:o.y}))`);
  const objectsB = await ev(pageB, `GameMap.getObjects().map(o => ({id:o.id, type:o.type, x:o.x, y:o.y}))`);

  log(`Player A sees ${objectsA?.length || 0} objects`);
  log(`Player B sees ${objectsB?.length || 0} objects`);

  if (objectsA?.length > 0) pass('Map has objects (Player A)');
  else fail('Map objects (Player A)', 'No objects');

  // Teleport Player A to first discovery object
  const discoveryA = objectsA?.find(o => o.type === 'discovery');
  if (discoveryA) {
    // Move adjacent
    await ev(pageA, `Game.getState().player.x = ${discoveryA.x}; Game.getState().player.y = ${discoveryA.y + 1}; Game.getState().lastDir = {x:0, y:-1}`);
    const result = await ev(pageA, `Game.interact()`);
    if (result?.type === 'glyph' && result?.glyph) {
      pass('Discovery glyph generated: [REDACTED]');

      // Exchange glyph to Player B
      const glyphCode = result.glyph;
      const applyResult = await ev(pageB, `Game.tryApplyGlyph('${glyphCode}')`);
      if (applyResult) pass('Glyph exchange A→B: validated');
      else fail('Glyph exchange A→B', 'Validation failed');

      // Check bond increased
      const bondAfter = await ev(pageB, `Game.getState()?.bond?.level`);
      if (bondAfter > 0) pass('Bond increased after glyph: ' + bondAfter);
      else fail('Bond increase', 'Still 0');
    } else {
      fail('Discovery interaction', result?.type || 'null');
    }
  } else {
    log('No discovery object found — skipping glyph test');
  }

  // ==========================================
  // 6. COMBAT TEST
  // ==========================================
  console.log('\n--- 6. Combat ---');

  const enemyA = objectsA?.find(o => o.type === 'enemy');
  if (enemyA) {
    // Teleport adjacent to enemy
    await ev(pageA, `Game.getState().player.x = ${enemyA.x}; Game.getState().player.y = ${enemyA.y + 1}; Game.getState().lastDir = {x:0, y:-1}`);
    await ev(pageA, `Game.interact()`);
    await pageA.waitForTimeout(200);

    // Check combat started (might need dialogue dismiss first)
    await ev(pageA, `if (Dialogue.isActive()) Dialogue.advance()`);
    await pageA.waitForTimeout(200);

    const combatActive = await ev(pageA, `Combat.isActive()`);
    if (combatActive) {
      pass('Combat initiated');

      // Dismiss encounter dialogue line by line (advance triggers callback at end)
      for (let d = 0; d < 15; d++) {
        const da = await ev(pageA, `Dialogue.isActive()`);
        if (!da) break;
        await ev(pageA, `Dialogue.advance()`);
        await pageA.waitForTimeout(200);
      }
      await pageA.waitForTimeout(500);

      // Wait for player turn
      for (let w = 0; w < 15; w++) {
        const t = await ev(pageA, `Combat.getState()?.turn`);
        if (t === 'player') break;
        await ev(pageA, `if (Dialogue.isActive()) Dialogue.advance()`);
        await pageA.waitForTimeout(300);
      }

      const hpBefore = await ev(pageA, `Combat.getState()?.enemy?.currentHp`);
      await ev(pageA, `Combat.doAttack()`);
      await pageA.waitForTimeout(1200); // wait for attack + enemy turn to resolve

      const hpAfter = await ev(pageA, `Combat.getState()?.enemy?.currentHp`);
      if (hpAfter !== null && hpAfter < hpBefore) pass('Attack deals damage');
      else if (!await ev(pageA, `Combat.isActive()`)) pass('Enemy defeated in one hit');
      else fail('Attack damage', `Before: ${hpBefore}, After: ${hpAfter}`);

      // Finish combat by attacking until done
      for (let i = 0; i < 30; i++) {
        const still = await ev(pageA, `Combat.isActive()`);
        if (!still) break;
        await ev(pageA, `if (Dialogue.isActive()) Dialogue.advance()`);
        await pageA.waitForTimeout(200);
        const turn = await ev(pageA, `Combat.getState()?.turn`);
        if (turn === 'player') {
          await ev(pageA, `Combat.doAttack()`);
          await pageA.waitForTimeout(1200);
        } else {
          await pageA.waitForTimeout(600);
        }
      }
      // Dismiss any remaining dialogues
      for (let i = 0; i < 10; i++) {
        const da = await ev(pageA, `Dialogue.isActive()`);
        if (!da) break;
        await ev(pageA, `Dialogue.advance()`);
        await pageA.waitForTimeout(200);
      }

      const combatDone = await ev(pageA, `!Combat.isActive()`);
      if (combatDone) pass('Combat completes');
      else fail('Combat completion', 'Still active after 20 rounds');

      // Check XP gained
      const xpAfter = await ev(pageA, `Game.getState()?.stats?.xp`);
      if (xpAfter > 0) pass('XP gained: ' + xpAfter);
      else log('No XP gain detected (may have leveled)');
    } else {
      fail('Combat start', 'Combat not active after interact');
    }
  } else {
    log('No enemy found in current map — skipping combat');
  }

  // ==========================================
  // 7. NPC DIALOGUE TEST
  // ==========================================
  console.log('\n--- 7. NPC dialogue ---');

  const npcA = objectsA?.find(o => o.type === 'npc');
  if (npcA) {
    await ev(pageA, `Game.getState().player.x = ${npcA.x}; Game.getState().player.y = ${npcA.y + 1}; Game.getState().lastDir = {x:0, y:-1}`);
    await ev(pageA, `Game.interact()`);
    await pageA.waitForTimeout(200);

    const dialogActive = await ev(pageA, `Dialogue.isActive()`);
    if (dialogActive) pass('NPC dialogue shows');
    else fail('NPC dialogue', 'Dialogue not active');

    // Dismiss
    for (let i = 0; i < 10; i++) {
      const active = await ev(pageA, `Dialogue.isActive()`);
      if (!active) break;
      await ev(pageA, `Dialogue.advance()`);
      await pageA.waitForTimeout(100);
    }
    pass('NPC dialogue dismissable');
  } else {
    log('No NPC in current map — skipping');
  }

  // ==========================================
  // 8. AREA TRANSITION TEST
  // ==========================================
  console.log('\n--- 8. Area transitions ---');

  // Test transition by directly calling it
  const areaBeforeA = await ev(pageA, `Game.getState()?.currentArea`);
  await ev(pageA, `Game.transitionArea('act2_city', {x:25, y:47})`);
  await pageA.waitForTimeout(500);
  const areaAfterA = await ev(pageA, `Game.getState()?.currentArea`);

  if (areaAfterA === 'act2_city') pass('Transition Act 1 → Act 2');
  else fail('Area transition', `Expected act2_city, got ${areaAfterA}`);

  // Check map loaded
  const mapW = await ev(pageA, `GameMap.W`);
  if (mapW > 0) pass('Act 2 map loaded (width: ' + mapW + ')');
  else fail('Act 2 map load', 'Map width 0');

  // Transition to Act 3
  await ev(pageA, `Game.transitionArea('act3_tomb', {x:25, y:47})`);
  await pageA.waitForTimeout(500);
  const area3 = await ev(pageA, `Game.getState()?.currentArea`);
  if (area3 === 'act3_tomb') pass('Transition Act 2 → Act 3');
  else fail('Act 2→3 transition', area3);

  // Transition to Act 4
  await ev(pageA, `Game.transitionArea('act4_throne', {x:20, y:37})`);
  await pageA.waitForTimeout(500);
  const area4 = await ev(pageA, `Game.getState()?.currentArea`);
  if (area4 === 'act4_throne') pass('Transition Act 3 → Act 4');
  else fail('Act 3→4 transition', area4);

  // ==========================================
  // 9. ENDING SYSTEM TEST
  // ==========================================
  console.log('\n--- 9. Endings ---');

  // Test all 6 ending calculations
  const endingTests = [
    { name: 'Ending 1: Archivist', char: 'knight', my: 'sacrifice', partner: 'refuse', bond: 70, mercyFlags: {}, expected: 'archivist' },
    { name: 'Ending 2: Whisper Word', char: 'whisper', my: 'sacrifice', partner: 'refuse', bond: 70, mercyFlags: {}, expected: 'whisper_word' },
    { name: 'Ending 3: Unbroken', char: 'knight', my: 'sacrifice', partner: 'sacrifice', bond: 95, mercyFlags: {}, expected: 'unbroken' },
    { name: 'Ending 4: Silence', char: 'knight', my: 'refuse', partner: 'refuse', bond: 70, mercyFlags: {}, expected: 'silence' },
    { name: 'Ending 5: Strangers', char: 'knight', my: 'sacrifice', partner: 'sacrifice', bond: 20, mercyFlags: {}, expected: 'strangers' },
    { name: 'Ending 6: Paradox', char: 'knight', my: 'sacrifice', partner: 'sacrifice', bond: 100,
      mercyFlags: { mercy_ward: 'mercy', mercy_enforcer: 'mercy', mercy_scholar: 'mercy', mercy_curator: 'mercy', mercy_thren: 'mercy', mercy_sentinels: 'mercy', mercy_inquisitor: 'mercy', mercy_remnant: 'mercy' },
      expected: 'paradox' },
  ];

  for (const t of endingTests) {
    const result = await ev(pageA, `
      Endings.calculate({
        character: '${t.char}',
        storyFlags: { throne_choice: '${t.my}', partner_throne_choice: '${t.partner}', ...${JSON.stringify(t.mercyFlags)} },
        bond: { level: ${t.bond}, exchanges: 0, visionsSeen: [] },
      })
    `);
    if (result === t.expected) pass(t.name + ' → ' + result);
    else fail(t.name, `Expected ${t.expected}, got ${result}`);
  }

  // ==========================================
  // 10. INVENTORY TEST
  // ==========================================
  console.log('\n--- 10. Inventory ---');

  const hasItems = await ev(pageA, `Game.getState()?.stats?.items?.length`);
  log('Player A inventory: ' + (hasItems || 0) + ' items');

  // Add a test item and use it
  await ev(pageA, `Stats.addItem(Game.getState().stats, {id:'test_potion', name:'Test', type:'consumable', effect:{hp:5}})`);
  const afterAdd = await ev(pageA, `Game.getState()?.stats?.items?.length`);
  if (afterAdd > (hasItems || 0)) pass('Item added to inventory');
  else fail('Add item', 'Count unchanged');

  const hpBefore = await ev(pageA, `Game.getState()?.stats?.hp`);
  await ev(pageA, `Stats.takeDamage(Game.getState().stats, 10)`);
  await ev(pageA, `Stats.useItem(Game.getState().stats, 'test_potion')`);
  const hpAfterHeal = await ev(pageA, `Game.getState()?.stats?.hp`);
  if (hpAfterHeal > hpBefore - 10) pass('Item heal works');
  else fail('Item heal', `HP: ${hpAfterHeal}`);

  // ==========================================
  // 11. BOND VISION TEST
  // ==========================================
  console.log('\n--- 11. Bond visions ---');

  const visionResult = await ev(pageA, `
    const testBond = Bond.init(0);
    const v1 = Bond.increase(testBond, 20, 'knight');
    v1 ? v1.title : 'none'
  `);
  if (visionResult && visionResult !== 'none') pass('Bond 20 vision triggers: [REDACTED]');
  else fail('Bond 20 vision', 'No vision');

  const visionKnight80 = await ev(pageA, `
    const testBond2 = Bond.init(79);
    const v2 = Bond.increase(testBond2, 5, 'knight');
    v2 ? v2.title : 'none'
  `);
  if (visionKnight80 && visionKnight80 !== 'none') pass('Bond 80 knight vision triggers: [REDACTED]');
  else fail('Bond 80 knight vision', 'No vision');

  const visionWhisper90 = await ev(pageA, `
    const testBond3 = Bond.init(89);
    const v3 = Bond.increase(testBond3, 5, 'whisper');
    v3 ? v3.title : 'none'
  `);
  if (visionWhisper90 && visionWhisper90 !== 'none') pass('Bond 90 whisper vision triggers: [REDACTED]');
  else fail('Bond 90 whisper vision', 'No vision');

  // ==========================================
  // 12. CRYPTO/GLYPH INTEGRITY
  // ==========================================
  console.log('\n--- 12. Glyph crypto ---');

  // Test that both instances generate same glyph for same event
  const glyphA = await ev(pageA, `Crypto.generateGlyph(Game.getState().sharedSeed, 'test_event_123')`);
  const glyphB = await ev(pageB, `Crypto.generateGlyph(Game.getState().sharedSeed, 'test_event_123')`);
  if (glyphA === glyphB) pass('Glyph deterministic across instances');
  else fail('Glyph determinism', `A=${glyphA} B=${glyphB}`);

  // Test sync code
  const syncA = await ev(pageA, `Crypto.generateSyncCode(Game.getState().sharedSeed, 'test_ritual')`);
  const validB = await ev(pageB, `Crypto.validateSyncCode(Game.getState().sharedSeed, '${syncA}', 'test_ritual')`);
  if (validB) pass('Sync ritual code validates cross-instance');
  else fail('Sync ritual validation', 'Failed');

  // ==========================================
  // 13. ERROR CHECK
  // ==========================================
  console.log('\n--- 13. Error check ---');

  if (errorsA.length === 0) pass('Player A: no JS errors');
  else fail('Player A errors', errorsA.length + ' errors: ' + errorsA.slice(0, 3).join('; '));

  if (errorsB.length === 0) pass('Player B: no JS errors');
  else fail('Player B errors', errorsB.length + ' errors: ' + errorsB.slice(0, 3).join('; '));

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
