// DAY4 日志页截图测试
// 网站目录：本文件在 docs/tools/，网站在仓库根目录的 site/
const SITE = require('url').pathToFileURL(require('path').resolve(__dirname, '../../site')).href;
// 用法：NODE_PATH=$(npm root -g) node docs/tools/test_d4.js <输出目录> report|bloom|mobile
const { chromium } = require('playwright');
const out = process.argv[2]; const mode = process.argv[3] || 'report';
(async () => {
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: 'localhost,127.0.0.1' } : undefined;
  const browser = await chromium.launch({ proxy, args: ['--ignore-certificate-errors'] });
  const mobile = mode === 'mobile';
  const page = await browser.newPage({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 }, ignoreHTTPSErrors: true });
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERR ' + e.message));
  const assim = mode === 'bloom' ? 60 : 0;
  await page.goto(`${SITE}/index.html?assim=${assim}#/d4`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  const p = (n) => page.screenshot({ path: `${out}/d4-${mode}-${n}.png` });
  await page.mouse.move(1100, 450); await page.waitForTimeout(1200);
  await p('1-moon');
  await page.click('.d4-core');
  await page.waitForTimeout(900); await p('2-stab');
  await page.waitForTimeout(800); await p('3-swap');
  await page.waitForTimeout(1600);
  if (mode === 'bloom') {
    await page.waitForTimeout(3600); await p('4-bloom');
    await page.click('.d4-over'); await page.waitForTimeout(250); await p('5-glitch');
    await page.waitForTimeout(900); await p('6-church');
  } else {
    await p('4-log');
    const b = await page.locator('.d4-sheet').boundingBox();
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.waitForTimeout(1900); await p('5-zh');
    await page.waitForTimeout(2800); await p('6-done');
    await page.click('.d4-done'); await page.waitForTimeout(800);
    for (let i = 0; i < 3; i++) { await page.click('.bub:last-child'); await page.waitForTimeout(700); }
    await page.waitForTimeout(3400); await p('7-chat');
  }
  if (mobile) console.log('scrollWidth', await page.evaluate(() => document.documentElement.scrollWidth));
  console.log(errs.join('\n') || 'no page errors');
  await browser.close();
})();
