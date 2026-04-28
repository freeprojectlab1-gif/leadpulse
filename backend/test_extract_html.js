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

  await page.goto('https://www.instagram.com/patrickta/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 1200));
  
  const text = await page.evaluate(() => document.documentElement.outerHTML);
  const emails = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi);
  
  if (emails) {
    const unique = [...new Set(emails.map(e => e.toLowerCase()))];
    console.log("Emails found:", unique);
  } else {
    console.log("No emails found.");
  }
  
  await browser.close();
})();
