const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const filePath = path.resolve(__dirname, '..', 'dist', 'index.html');
  const url = 'file:///' + filePath.replace(/\\/g, '/');
  console.log('URL:', url);

  page.on('console', msg => console.log('CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', e => console.log('PAGE ERROR:', e.message));

  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(1000);

  const checks = await page.evaluate(() => {
    return {
      title: document.title,
      gameType: typeof Game,
      cryptoType: typeof Crypto,
      dialogueType: typeof Dialogue,
      combatType: typeof Combat,
      endingsType: typeof Endings,
      audioType: typeof Audio,
      bodyLen: document.body.innerHTML.length,
      screenVisible: document.getElementById('screen-charselect')?.classList.contains('hidden'),
      versionTag: document.querySelector('.version-tag')?.textContent,
    };
  });

  console.log('Checks:', JSON.stringify(checks, null, 2));
  await browser.close();
})();
