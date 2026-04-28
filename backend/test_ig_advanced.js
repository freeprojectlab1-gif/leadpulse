const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
  await page.goto('https://www.instagram.com/p/Cp0xJ9XyZkS/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 3000));
  
  const emails = await page.evaluate(() => {
    const text = document.documentElement.outerHTML;
    // Deobfuscate
    const clean = text
      .replace(/\[at\]/gi, '@')
      .replace(/\(at\)/gi, '@')
      .replace(/\[dot\]/gi, '.')
      .replace(/\(dot\)/gi, '.')
      .replace(/ at /gi, '@')
      .replace(/ dot /gi, '.');
    const regex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
    return clean.match(regex);
  });
  
  console.log("Emails found:", [...new Set(emails)]);
  await browser.close();
})();
