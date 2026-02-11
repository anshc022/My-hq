const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: 'preview.png', fullPage: true });
    await browser.close();
    console.log('Screenshot taken successfully');
  } catch (e) {
    console.error('Screenshot failed:', e);
    process.exit(1);
  }
})();