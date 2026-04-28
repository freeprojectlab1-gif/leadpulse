const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const t = req.resourceType();
    if (t === 'image' || t === 'media' || t === 'font' || t === 'stylesheet') req.abort();
    else req.continue();
  });

  await page.goto('https://www.instagram.com/patrickta/', { waitUntil: 'networkidle2', timeout: 15000 });
  const html = await page.evaluate(() => document.documentElement.outerHTML);
  console.log("HTML length:", html.length);
  if (html.includes('patrickta')) console.log("Contains username");
  if (html.includes('login')) console.log("Contains login");
  
  await browser.close();
})();
