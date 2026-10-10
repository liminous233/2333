const { chromium } = require('playwright');
// 网站目录：本文件在 docs/tools/，网站在仓库根目录的 site/
const SITE = require('url').pathToFileURL(require('path').resolve(__dirname, '../../site')).href;
(async () => {
  const b = await chromium.launch({ proxy: { server: process.env.HTTPS_PROXY }, args: ['--ignore-certificate-errors'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, ignoreHTTPSErrors: true });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  for (const r of ['gate', 'home', 'map', 'journal/3', 'evidence', 'personnel', 'rules', 'report']) {
    await p.goto(SITE + '/index.html?assim=20#/' + r, { waitUntil: 'networkidle' });
    await p.waitForTimeout(500);
    const w = await p.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
    console.log(r, w.join('/'));
    if (r === 'home' || r === 'personnel') await p.screenshot({ path: process.argv[2] + '/m-' + r + '.png' });
  }
  console.log(errs.join('\n') || 'no errors');
  await b.close();
})();
