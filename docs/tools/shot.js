const { chromium } = require('playwright');
const [,, base, out, ...specs] = process.argv;
(async () => {
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: 'localhost,127.0.0.1' } : undefined;
  const browser = await chromium.launch({ proxy, args: ['--ignore-certificate-errors'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true });
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGEERR ' + e.message));
  for (const spec of specs) {
    // spec: name|url|js|full
    const [name, url, js, full, wait] = spec.split('|');
    await page.goto(base + url, { waitUntil: 'networkidle' }).catch(e => errs.push('goto ' + e.message));
    if (js) { await page.evaluate(js).catch(e => errs.push('eval ' + e.message)); }
    await page.waitForTimeout(+(wait||1800));
    await page.screenshot({ path: `${out}/${name}.png`, fullPage: full === 'full' });
  }
  console.log(errs.length ? errs.join('\n') : 'no console errors');
  await browser.close();
})();
