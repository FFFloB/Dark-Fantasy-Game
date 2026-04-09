const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newContext().then(c => c.newPage());
  const url = 'file:///' + path.resolve(__dirname, '..', 'dist', 'index.html').replace(/\\/g, '/');

  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(500);

  // Start real game as knight in Act 1
  await page.evaluate(() => {
    selectCharacter('knight');
    const session = Persist.loadSession();
    session.sharedSeed = Crypto.combineSeeds('TEST01', 'TEST02');
    session.currentArea = 'act1_athenaeum';
    Persist.saveSession(session);
    enterGame();
  });
  await page.waitForTimeout(800);

  // Find enemies
  const objects = await page.evaluate(() =>
    GameMap.getObjects().filter(o => o.type === 'enemy').map(o => ({id: o.id, enemyId: o.enemyId, x: o.x, y: o.y, label: o.label}))
  );
  console.log('Enemies:', JSON.stringify(objects, null, 2));

  const timeline = await page.evaluate(() => Game.getState()?.timeline);
  console.log('Timeline:', timeline);

  // Find an enemy that has a label for this timeline
  const visibleEnemy = objects.find(o => o.label && o.label[timeline === 'past' ? 'past' : 'present']);
  console.log('Visible enemy:', visibleEnemy?.id);

  if (visibleEnemy) {
    // Teleport and interact
    await page.evaluate(({ex, ey}) => {
      const s = Game.getState();
      s.player.x = ex; s.player.y = ey + 1; s.lastDir = {x:0,y:-1};
    }, {ex: visibleEnemy.x, ey: visibleEnemy.y});

    const result = await page.evaluate(() => Game.interact());
    console.log('Interact:', result?.type, result?.message?.substring(0, 50));
    await page.waitForTimeout(200);

    // Dismiss dialogue
    for (let i = 0; i < 15; i++) {
      const active = await page.evaluate(() => Dialogue.isActive());
      if (!active) break;
      await page.evaluate(() => Dialogue.advance());
      await page.waitForTimeout(150);
    }

    const cActive = await page.evaluate(() => Combat.isActive());
    console.log('Combat active:', cActive);

    if (cActive) {
      for (let i = 0; i < 10; i++) {
        const t = await page.evaluate(() => Combat.getState()?.turn);
        console.log('Turn:', t);
        if (t === 'player') break;
        await page.waitForTimeout(300);
      }

      const hpBefore = await page.evaluate(() => Combat.getState()?.enemy?.currentHp);
      console.log('HP before:', hpBefore);
      await page.evaluate(() => Combat.doAttack());
      await page.waitForTimeout(1500);
      const hpAfter = await page.evaluate(() => Combat.getState()?.enemy?.currentHp);
      const turnAfter = await page.evaluate(() => Combat.getState()?.turn);
      console.log('HP after:', hpAfter, 'Turn:', turnAfter);
    }
  }

  await browser.close();
})();
