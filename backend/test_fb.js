const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('https://www.facebook.com/zuck', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 2000));
  const data = await page.evaluate(() => {
    return {
      h1: Array.from(document.querySelectorAll('h1')).map(h => h.innerText),
      title: document.title,
      metaOgTitle: document.querySelector('meta[property="og:title"]')?.content
    };
  });
  console.log(data);
  await browser.close();
})();
