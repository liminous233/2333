const { chromium } = require('playwright');
// 网站目录：本文件在 docs/tools/，网站在仓库根目录的 site/
const SITE = require('url').pathToFileURL(require('path').resolve(__dirname, '../../site')).href;
const out = process.argv[2]; const steps = process.argv[3] || 'all';
(async () => {
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: 'localhost,127.0.0.1' } : undefined;
  const browser = await chromium.launch({ proxy, args: ['--ignore-certificate-errors'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true });
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGEERR ' + e.message));
  await page.goto(SITE + '/index.html?assim=0#/map', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  if (steps.includes('page')) await page.screenshot({ path: `${out}/map-page.png` });
  if (steps.includes('gate')) { await page.click('.room--gate'); await page.waitForTimeout(700); await page.screenshot({ path: `${out}/map-gate.png`, clip: {x:0,y:0,width:1440,height:450} }); await page.keyboard.press('Escape'); await page.waitForTimeout(500); }
  if (steps.includes('bell')) {
    await page.click('.room--bell'); await page.waitForTimeout(900);
    await page.click('[data-act=up]'); await page.waitForTimeout(300);
    await page.click('[data-act=gaze]'); await page.waitForTimeout(500);
    await page.screenshot({ path: `${out}/map-bell-mid.png` });
    await page.mouse.move(10,10); await page.waitForTimeout(3500);
    await page.screenshot({ path: `${out}/map-bell.png` });
  }
  if (steps.includes('dining')) {
    await page.click('.room--dining'); await page.waitForTimeout(900);
    await page.screenshot({ path: `${out}/map-dining1.png` });
    await page.click('[data-act=forward]'); await page.waitForTimeout(1600);
    await page.screenshot({ path: `${out}/map-dining2.png` });
    await page.click('[data-act=leave]'); await page.waitForTimeout(600);
  }
  if (steps.includes('gate2')) { await page.click('.room--gate'); await page.waitForTimeout(900); await page.screenshot({ path: `${out}/map-gate2.png` }); await page.keyboard.press('Escape'); await page.waitForTimeout(500); }
  if (steps.includes('cards')) {
    await page.click('.room--parlour'); await page.waitForTimeout(600); await page.screenshot({ path: `${out}/map-parlour.png`, clip: {x:600,y:450,width:840,height:450} });
    await page.click('.room--hall'); await page.waitForTimeout(600); await page.screenshot({ path: `${out}/map-hall.png`, clip: {x:0,y:150,width:700,height:400} });
    await page.keyboard.press('Escape'); await page.waitForTimeout(500);
  }
  if (steps.includes('dorm')) {
    await page.click('.room--dorm'); await page.waitForTimeout(900); await page.screenshot({ path: `${out}/map-dorm1.png` });
    await page.click('[data-act=open]'); await page.waitForTimeout(300);
    await page.click('[data-act=wander]'); await page.waitForTimeout(800); await page.screenshot({ path: `${out}/map-dorm2.png` });
    await page.keyboard.press('Escape'); await page.waitForTimeout(500);
  }
  if (steps.includes('chapel')) {
    await page.click('.room--chapel'); await page.waitForTimeout(900); await page.screenshot({ path: `${out}/map-chapel1.png` });
    await page.click('[data-act=walk]'); await page.waitForTimeout(1200); await page.screenshot({ path: `${out}/map-chapel2.png` });
    await page.click('[data-act=leave]'); await page.waitForTimeout(2800); await page.screenshot({ path: `${out}/map-chapel3.png` });
  }
  if (steps.includes('vals')) console.log(await page.evaluate(() => JSON.stringify({ a: CC.state.assim, c: CC.state.clarity, forever: CC.state.flag('forever') })));
  if (steps.includes('cath')) { await page.click('.room--cathedral'); await page.waitForTimeout(4000); await page.screenshot({ path: `${out}/map-cath.png` }); }
  console.log(errs.join('\n') || 'no console errors');
  await browser.close();
})();
