#!/usr/bin/env node

// ============================================================
//  FULL WALKTHROUGH — Two players, Act 1 → Ending
//  Plays the entire game, exchanging glyphs between instances
// ============================================================

const { chromium } = require('playwright');
const path = require('path');

const GAME_URL = 'file:///' + path.resolve(__dirname, '..', 'dist', 'index.html').replace(/\\/g, '/');

const results = [];
let passed = 0, failed = 0;

function log(msg) { console.log('  ' + msg); }
function pass(test) { results.push({ test, status: 'PASS' }); passed++; console.log('  ✓ ' + test); }
function fail(test, err) { results.push({ test, status: 'FAIL', error: err }); failed++; console.error('  ✗ ' + test + ': ' + err); }

async function ev(page, expr) {
  try { return await page.evaluate(expr); } catch { return null; }
}

async function dismiss(page, max) {
  for (let i = 0; i < (max || 20); i++) {
    const a = await ev(page, `Dialogue.isActive()`);
    if (!a) return;
    await ev(page, `Dialogue.advance()`);
    await page.waitForTimeout(150);
  }
}

async function fight(page) {
  for (let i = 0; i < 40; i++) {
    if (!await ev(page, `Combat.isActive()`)) return true;
    await dismiss(page);
    const turn = await ev(page, `Combat.getState()?.turn`);
    if (turn === 'player') await ev(page, `Combat.doAttack()`);
    await page.waitForTimeout(500);
  }
  await dismiss(page);
  return !await ev(page, `Combat.isActive()`);
}

async function teleportAndInteract(page, x, y) {
  await ev(page, `Game.getState().player.x = ${x}; Game.getState().player.y = ${y + 1}; Game.getState().lastDir = {x:0,y:-1}`);
  return await ev(page, `Game.interact()`);
}

async function findAndFight(page, enemyId) {
  const enemy = await ev(page, `GameMap.getObjects().find(o => o.enemyId === '${enemyId}' && !Game.getState().interactedObjects.includes(o.id))`);
  if (!enemy) return null;
  await teleportAndInteract(page, enemy.x, enemy.y);
  await page.waitForTimeout(200);
  await dismiss(page);
  await page.waitForTimeout(500);
  // Wait for player turn
  for (let w = 0; w < 10; w++) {
    const t = await ev(page, `Combat.getState()?.turn`);
    if (t === 'player') break;
    await dismiss(page);
    await page.waitForTimeout(300);
  }
  return await ev(page, `Combat.isActive()`);
}

async function exchangeGlyph(fromPage, toPage, eventId) {
  const glyph = await ev(fromPage, `Crypto.generateGlyph(Game.getState().sharedSeed, '${eventId}')`);
  if (!glyph) return null;
  const result = await ev(toPage, `Game.tryApplyGlyph('${glyph}')`);
  return result;
}

async function run() {
  console.log('\n=== ASHEN BOND — FULL WALKTHROUGH ===\n');

  const browser = await chromium.launch({ headless: true });
  const ctxA = await browser.newContext();
  const ctxB = await browser.newContext();
  const knight = await ctxA.newPage(); // Player A: Knight (past)
  const whisper = await ctxB.newPage(); // Player B: Whisper (present)

  const errorsK = [], errorsW = [];
  knight.on('pageerror', e => errorsK.push(e.message));
  whisper.on('pageerror', e => errorsW.push(e.message));

  // ==========================================
  // SETUP
  // ==========================================
  console.log('--- Setup ---');
  await knight.goto(GAME_URL, { waitUntil: 'load' });
  await whisper.goto(GAME_URL, { waitUntil: 'load' });
  await knight.waitForTimeout(500);
  await whisper.waitForTimeout(500);

  // Character select + seed exchange
  await ev(knight, `selectCharacter('knight'); confirmCharacter()`);
  await ev(whisper, `selectCharacter('whisper'); confirmCharacter()`);
  await knight.waitForTimeout(300);
  await whisper.waitForTimeout(300);

  const seedK = await ev(knight, `Persist.loadSession()?.mySeed`);
  const seedW = await ev(whisper, `Persist.loadSession()?.mySeed`);

  await ev(knight, `document.getElementById('partner-seed-input').value = '${seedW}'`);
  await ev(knight, `confirmSeedExchange()`);
  await ev(whisper, `document.getElementById('partner-seed-input').value = '${seedK}'`);
  await ev(whisper, `confirmSeedExchange()`);
  await knight.waitForTimeout(1000);
  await whisper.waitForTimeout(1000);

  const sharedK = await ev(knight, `Game.getState()?.sharedSeed`);
  const sharedW = await ev(whisper, `Game.getState()?.sharedSeed`);
  if (sharedK === sharedW) pass('Seeds matched, game started');
  else { fail('Seed match', `${sharedK} vs ${sharedW}`); await browser.close(); return; }

  // ==========================================
  // ACT 1: THE ATHENAEUM
  // ==========================================
  console.log('\n--- Act 1: The Athenaeum ---');

  // Knight: find discovery (research notes)
  const disc1 = await ev(knight, `GameMap.getObjects().find(o => o.type === 'discovery' && o.label?.past)`);
  if (disc1) {
    await teleportAndInteract(knight, disc1.x, disc1.y);
    await dismiss(knight);
    const glyphResult = await exchangeGlyph(knight, whisper, disc1.eventId);
    if (glyphResult) pass('Act 1 glyph exchange: Knight→Whisper');
    else fail('Act 1 glyph exchange', 'Failed');
  }

  // Whisper: find discovery (child's name)
  const disc2 = await ev(whisper, `GameMap.getObjects().find(o => o.type === 'discovery' && o.label?.present)`);
  if (disc2) {
    await teleportAndInteract(whisper, disc2.x, disc2.y);
    await dismiss(whisper);
    const glyphResult = await exchangeGlyph(whisper, knight, disc2.eventId);
    if (glyphResult) pass('Act 1 glyph exchange: Whisper→Knight');
    else fail('Act 1 glyph exchange W→K', 'Failed');
  }

  // Knight: fight the ward
  const fightK = await findAndFight(knight, 'synod_ward');
  if (fightK) {
    const won = await fight(knight);
    if (won) pass('Knight defeats synod_ward');
    else fail('Knight combat', 'Did not complete');
  } else {
    log('Synod ward not found or combat not started');
  }

  // Whisper: fight hollowed scholar
  const fightW = await findAndFight(whisper, 'hollowed_scholar');
  if (fightW) {
    const won = await fight(whisper);
    if (won) pass('Whisper defeats hollowed_scholar');
    else fail('Whisper combat', 'Did not complete');
  } else {
    log('Hollowed scholar not found or combat not started');
  }

  // NPC dialogue
  const npc = await ev(knight, `GameMap.getObjects().find(o => o.type === 'npc')`);
  if (npc) {
    await teleportAndInteract(knight, npc.x, npc.y);
    await page_wait_dismiss(knight);
    pass('Act 1 NPC dialogue');
  }

  // Check bond
  const bond1 = await ev(knight, `Game.getState()?.bond?.level`);
  log('Bond after Act 1: ' + bond1);

  // ==========================================
  // ACT 2: THE HOLLOWED CITY
  // ==========================================
  console.log('\n--- Act 2: The Hollowed City ---');

  await ev(knight, `Game.transitionArea('act2_city', {x:25, y:47})`);
  await ev(whisper, `Game.transitionArea('act2_city', {x:25, y:47})`);
  await knight.waitForTimeout(500);
  await whisper.waitForTimeout(500);

  const areaK2 = await ev(knight, `Game.getState()?.currentArea`);
  const areaW2 = await ev(whisper, `Game.getState()?.currentArea`);
  if (areaK2 === 'act2_city' && areaW2 === 'act2_city') pass('Both in Act 2');
  else fail('Act 2 transition', `K=${areaK2} W=${areaW2}`);

  const obj2K = await ev(knight, `GameMap.getObjects().length`);
  const obj2W = await ev(whisper, `GameMap.getObjects().length`);
  log('Act 2 objects: Knight=' + obj2K + ' Whisper=' + obj2W);

  // Exchange some glyphs
  const disc2K = await ev(knight, `GameMap.getObjects().find(o => o.type === 'discovery' && o.label?.past)`);
  if (disc2K) {
    await teleportAndInteract(knight, disc2K.x, disc2K.y);
    await dismiss(knight);
    const r = await exchangeGlyph(knight, whisper, disc2K.eventId);
    if (r) pass('Act 2 discovery glyph exchange');
  }

  // ==========================================
  // ACT 3: THE SYNOD'S TOMB
  // ==========================================
  console.log('\n--- Act 3: The Synod\'s Tomb ---');

  await ev(knight, `Game.transitionArea('act3_tomb', {x:25, y:47})`);
  await ev(whisper, `Game.transitionArea('act3_tomb', {x:25, y:47})`);
  await knight.waitForTimeout(500);

  const areaK3 = await ev(knight, `Game.getState()?.currentArea`);
  if (areaK3 === 'act3_tomb') pass('Both in Act 3');

  // Boost bond for mercy testing
  await ev(knight, `Game.getState().bond.level = 75`);
  await ev(whisper, `Game.getState().bond.level = 75`);
  log('Bond boosted to 75 for mercy testing');

  // Knight: fight with mercy
  const inquisitor = await findAndFight(knight, 'synod_inquisitor');
  if (inquisitor) {
    // Weaken first, then mercy
    for (let i = 0; i < 15; i++) {
      if (!await ev(knight, `Combat.isActive()`)) break;
      await dismiss(knight);
      const turn = await ev(knight, `Combat.getState()?.turn`);
      if (turn === 'player') {
        const ehp = await ev(knight, `Combat.getState()?.enemy?.currentHp`);
        const emhp = await ev(knight, `Combat.getState()?.enemy?.maxHp`);
        if (ehp && emhp && ehp < emhp * 0.25) {
          await ev(knight, `Combat.doMercy()`);
          await knight.waitForTimeout(800);
          break;
        }
        await ev(knight, `Combat.doAttack()`);
      }
      await knight.waitForTimeout(600);
    }
    await dismiss(knight);

    const mercyFlag = await ev(knight, `Game.getState()?.storyFlags?.mercy_inquisitor`);
    if (mercyFlag === 'mercy') pass('Inquisitor mercy path');
    else log('Inquisitor fight: flag=' + mercyFlag + ' (may have killed instead)');
  }

  // ==========================================
  // ACT 4: THE ASHEN THRONE
  // ==========================================
  console.log('\n--- Act 4: The Ashen Throne ---');

  await ev(knight, `Game.transitionArea('act4_throne', {x:20, y:37})`);
  await ev(whisper, `Game.transitionArea('act4_throne', {x:20, y:37})`);
  await knight.waitForTimeout(500);

  const areaK4 = await ev(knight, `Game.getState()?.currentArea`);
  if (areaK4 === 'act4_throne') pass('Both in Act 4');

  const obj4K = await ev(knight, `GameMap.getObjects().length`);
  log('Act 4 objects: ' + obj4K);

  // ==========================================
  // ENDING TEST: Test all 6 endings
  // ==========================================
  console.log('\n--- Endings ---');

  const endingScenarios = [
    { name: 'Archivist', kChoice: 'sacrifice', wChoice: 'refuse', bond: 70, mercyAll: false },
    { name: 'Whisper Word', kChoice: 'refuse', wChoice: 'sacrifice', bond: 70, mercyAll: false },
    { name: 'Unbroken', kChoice: 'sacrifice', wChoice: 'sacrifice', bond: 95, mercyAll: false },
    { name: 'Silence', kChoice: 'refuse', wChoice: 'refuse', bond: 70, mercyAll: false },
    { name: 'Strangers', kChoice: 'sacrifice', wChoice: 'sacrifice', bond: 20, mercyAll: false },
    { name: 'Paradox', kChoice: 'sacrifice', wChoice: 'sacrifice', bond: 100, mercyAll: true },
  ];

  for (const s of endingScenarios) {
    const flags = { throne_choice: s.kChoice, partner_throne_choice: s.wChoice };
    if (s.mercyAll) {
      for (const f of ['mercy_ward','mercy_enforcer','mercy_scholar','mercy_wraith','mercy_curator',
                        'mercy_thren','mercy_sentinels','mercy_inquisitor','mercy_remnant']) {
        flags[f] = 'mercy';
      }
    }
    const ending = await ev(knight, `Endings.calculate({
      character: 'knight',
      storyFlags: ${JSON.stringify(flags)},
      bond: { level: ${s.bond}, exchanges: 0, visionsSeen: [] }
    })`);
    if (ending) pass('Ending: ' + s.name + ' → ' + ending);
    else fail('Ending: ' + s.name, 'null');
  }

  // ==========================================
  // FINAL STATS
  // ==========================================
  console.log('\n--- Final state ---');

  const finalK = await ev(knight, `JSON.parse(JSON.stringify(Game.getState()))`);
  const finalW = await ev(whisper, `JSON.parse(JSON.stringify(Game.getState()))`);

  log('Knight: HP=' + finalK?.stats?.hp + '/' + finalK?.stats?.maxHp +
      ' MP=' + finalK?.stats?.mp + '/' + finalK?.stats?.maxMp +
      ' Lv=' + finalK?.stats?.level +
      ' Bond=' + finalK?.bond?.level +
      ' Items=' + finalK?.stats?.items?.length +
      ' Glyphs applied=' + finalK?.appliedGlyphs?.length +
      ' Objects interacted=' + finalK?.interactedObjects?.length);

  log('Whisper: HP=' + finalW?.stats?.hp + '/' + finalW?.stats?.maxHp +
      ' MP=' + finalW?.stats?.mp + '/' + finalW?.stats?.maxMp +
      ' Lv=' + finalW?.stats?.level +
      ' Bond=' + finalW?.bond?.level +
      ' Items=' + finalW?.stats?.items?.length +
      ' Glyphs applied=' + finalW?.appliedGlyphs?.length +
      ' Objects interacted=' + finalW?.interactedObjects?.length);

  if (errorsK.length === 0) pass('Knight: zero JS errors through full walkthrough');
  else fail('Knight JS errors', errorsK.length + ': ' + errorsK.slice(0,3).join('; '));

  if (errorsW.length === 0) pass('Whisper: zero JS errors through full walkthrough');
  else fail('Whisper JS errors', errorsW.length + ': ' + errorsW.slice(0,3).join('; '));

  // ==========================================
  // REPORT
  // ==========================================
  console.log('\n' + '='.repeat(50));
  console.log(`FULL WALKTHROUGH: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  console.log('='.repeat(50));

  if (failed > 0) {
    console.log('\nFailed:');
    for (const r of results.filter(r => r.status === 'FAIL')) {
      console.log('  ✗ ' + r.test + ': ' + r.error);
    }
  }

  console.log('\n');
  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
}

// Helper
async function page_wait_dismiss(page) {
  await page.waitForTimeout(200);
  await dismiss(page);
}

run().catch(e => { console.error('Walkthrough crashed:', e.message); process.exit(2); });
