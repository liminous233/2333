const { chromium } = require('playwright');
// 网站目录：本文件在 docs/tools/，网站在仓库根目录的 site/
const SITE = require('url').pathToFileURL(require('path').resolve(__dirname, '../../site')).href;
const out = process.argv[2]; const steps = process.argv[3] || 'all';
(async () => {
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: 'localhost,127.0.0.1' } : undefined;
  const browser = await chromium.launch({ proxy, args: ['--ignore-certificate-errors', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true });
  const errs = [];
  page.on('console', m => { if (m.type() === 'error' || m.type()==='warning') errs.push(m.type()+': '+m.text()); });
  page.on('pageerror', e => errs.push('PAGEERR ' + e.message));
  await page.goto(SITE + '/index.html#/gate', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const clip = async (sel) => { const b = await page.locator(sel).boundingBox(); return b; };
  const stage = await clip('.desk__stage');
  const shot = (n, c) => page.screenshot({ path: `${out}/${n}.png`, clip: c });
  const S = { x: stage.x, y: stage.y, width: stage.width, height: stage.height };
  if (steps.includes('desk')) await shot('desk', S);
  if (steps.includes('card')) {
    await page.click('.obj--card'); await page.waitForTimeout(900);
    await page.screenshot({ path: `${out}/card-front.png` });
    await page.click('.lift__card'); await page.waitForTimeout(1500);
    await page.screenshot({ path: `${out}/card-back.png` });
    await page.click('.lift__put'); await page.waitForTimeout(900);
  }
  for (const k of ['gun','clue','pen','kraft']) if (steps.includes(k)) {
    await page.click('.obj--'+k, { force: true }); await page.waitForTimeout(900);
    await page.screenshot({ path: `${out}/lift-${k}.png` });
    await page.keyboard.press('Escape'); await page.waitForTimeout(900);
  }
  const L = await clip('.letter');
  if (steps.includes('melt')) {
    await page.mouse.move(L.x + L.width/2, L.y + L.height/2);
    await page.waitForTimeout(1700); await shot('flash', L);
    await page.waitForTimeout(4500); await shot('melt', L);
    await page.mouse.move(5, 5); await page.waitForTimeout(500);
  }
  if (steps.includes('crumple')) {
    await page.mouse.move(L.x + L.width*0.5, L.y + L.height*0.4);
    await page.mouse.down(); await page.waitForTimeout(500);
    await page.mouse.move(L.x + L.width*0.6, L.y + L.height*0.45, { steps: 8 });
    await page.waitForTimeout(1200); await shot('crumple-hold', S);
    await page.mouse.up(); await page.waitForTimeout(800); await shot('crumple-ball', S);
    const st = await page.getAttribute('.desk__stage', 'data-crumple'); errs.push('state after release: '+st);
    const hb = await clip('.crumple__hit');
    await page.mouse.click(hb.x + hb.width/2, hb.y + hb.height/2); await page.waitForTimeout(1600);
    await shot('crumple-open', S);
    errs.push('state after click: '+await page.getAttribute('.desk__stage', 'data-crumple'));
  }
  console.log(errs.join('\n') || 'no console errors');
  await browser.close();
})();
