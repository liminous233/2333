// 八日日志 / 证物柜 / 守则 / 失踪档案的截图测试
// 网站目录：本文件在 docs/tools/，网站在仓库根目录的 site/
const SITE = require('url').pathToFileURL(require('path').resolve(__dirname, '../../site')).href;
// 用法：NODE_PATH=$(npm root -g) node docs/tools/test_journal.js <输出目录> sky,hover,nope,case,candle,hymn,rules,missing,mobile [同化值]
const { chromium } = require('playwright');
const out = process.argv[2]; const steps = process.argv[3] || 'sky'; const assim = process.argv[4] || '0';
(async () => {
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: 'localhost,127.0.0.1' } : undefined;
  const browser = await chromium.launch({ proxy, args: ['--ignore-certificate-errors'] });
  const mobile = steps.includes('mobile');
  const page = await browser.newPage({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 }, ignoreHTTPSErrors: true });
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGEERR ' + e.message));
  const go = async (hash) => {
    await page.goto('about:blank');
    await page.goto(`${SITE}/index.html?assim=${assim}#/${hash}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
  };
  // 拿起来的物件一直在晃，Playwright 的 hover/click 等不到"静止"，直接移鼠标
  const hoverAt = async (sel) => { const b = await page.locator(sel).boundingBox(); await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); };
  const clickAt = async (sel) => { const b = await page.locator(sel).boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); };
  const shot = (name, clip) => page.screenshot({ path: `${out}/${name}.png`, clip });

  if (steps.includes('sky')) { await go('journal'); await shot('sky'); }
  if (steps.includes('hover')) {
    await go('journal');
    await page.hover('.sky__moon[data-n="1"]'); await page.waitForTimeout(500); await shot('sky-arming', { x: 900, y: 300, width: 540, height: 400 });
    await page.waitForTimeout(900); await shot('sky-pop', { x: 900, y: 300, width: 540, height: 400 });
  }
  if (steps.includes('nope')) {
    await go('journal');
    await page.hover('.sky__moon[data-n="6"]'); await page.waitForTimeout(1500); await shot('sky-nope', { x: 120, y: 300, width: 600, height: 400 });
  }
  if (steps.includes('case')) { await go('evidence'); await shot('case'); }
  const lift = async (kind, name) => {
    await go('evidence');
    await page.$eval(`.bc-item--${kind}`, el => el.click()); await page.waitForTimeout(900);
    await shot(name || 'lift-' + kind);
  };
  if (steps.includes('candle')) {
    await lift('candle');
    await page.click('[data-choice=light]'); await page.waitForTimeout(900); await shot('lift-candle-lit');
  }
  if (steps.includes('hymn')) {
    await lift('hymn');
    await hoverAt('.lift .hymn'); await page.waitForTimeout(2600); await shot('lift-hymn-zh');
  }
  if (steps.includes('gun')) { await lift('gun'); await lift('card'); await lift('pen'); await lift('clue'); await lift('kraft'); await lift('anemone'); }
  if (steps.includes('rules')) {
    await go('rules'); await shot('rules');
    await hoverAt('.nb'); await page.waitForTimeout(1800); await shot('rules-zh');
  }
  if (steps.includes('missing')) {
    await go('missing'); await shot('missing');
    await clickAt('.mf'); await page.waitForTimeout(1500); await shot('missing-out');
  }
  if (mobile) {
    await go('journal'); await shot('m-sky');
    await go('evidence'); await shot('m-case');
    await page.click('.bc-item--missing'); await page.waitForTimeout(900); await clickAt('.lift .mf'); await page.waitForTimeout(1500); await shot('m-missing');
    const w = await page.evaluate(() => document.documentElement.scrollWidth); console.log('scrollWidth', w);
  }
  console.log(errs.join('\n') || 'no console errors');
  await browser.close();
})();
