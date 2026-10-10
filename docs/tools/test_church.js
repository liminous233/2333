// 教堂 / 谢幕 / 结局后首页 截图测试
// 网站目录：本文件在 docs/tools/，网站在仓库根目录的 site/
const SITE = require('url').pathToFileURL(require('path').resolve(__dirname, '../../site')).href;
// 用法：NODE_PATH=$(npm root -g) node docs/tools/test_church.js <输出目录> holy|red|ending|bliss
const { chromium } = require('playwright');
const out = process.argv[2]; const mode = process.argv[3] || 'red';
(async () => {
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: 'localhost,127.0.0.1' } : undefined;
  const browser = await chromium.launch({ proxy, args: ['--ignore-certificate-errors'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true });
  const errs = []; page.on('pageerror', e => errs.push('PAGEERR ' + e.message));
  const p = (n) => page.screenshot({ path: `${out}/ch-${mode}-${n}.png` });
  await page.goto(SITE + '/index.html?assim=40#/gate', { waitUntil: 'networkidle' });
  await page.evaluate((m) => { CC.state.setFlag('d4Diamond', m === 'holy'); CC.state.setFlag('bliss', m === 'bliss'); }, mode);
  if (mode === 'holy' || mode === 'red') {
    await page.goto(SITE + '/index.html#/church', { waitUntil: 'networkidle' }); await page.waitForTimeout(1500);
    await p('1-welcome');
    await page.click('#chJoin');
    if (mode === 'holy') {
      await page.waitForTimeout(4500); await p('2-idol');
      await page.waitForTimeout(9000); await p('3-melt');
    } else {
      await page.waitForTimeout(500); await p('2-sky');
      await page.waitForTimeout(1800); await p('3-line1');
      await page.mouse.click(700, 400); await page.waitForTimeout(900);
      await page.mouse.click(700, 400); await page.waitForTimeout(2800); await p('4-recolor');
      await page.mouse.click(700, 400); await page.waitForTimeout(500);
      await page.mouse.click(700, 400); await page.waitForTimeout(500);
      await page.mouse.click(700, 400); await page.waitForTimeout(900); await p('5-last');
      await page.click('.ch__last'); await page.waitForTimeout(2500); await p('6-home');
    }
  }
  if (mode === 'ending') {
    await page.evaluate(() => CC.state.once('test:clarity', { clarity: 40 }));
    await page.goto(SITE + '/index.html#/ending', { waitUntil: 'networkidle' }); await page.waitForTimeout(6000); await p('1-roll');
    await page.mouse.click(700, 400); await page.waitForTimeout(16000); await p('2-end');
  }
  if (mode === 'bliss') {
    await page.goto(SITE + '/index.html#/home', { waitUntil: 'networkidle' }); await page.waitForTimeout(2000); await p('1-home');
    await page.waitForTimeout(24000); await p('2-melt');
  }
  console.log(errs.join('\n') || 'no page errors');
  await browser.close();
})();
