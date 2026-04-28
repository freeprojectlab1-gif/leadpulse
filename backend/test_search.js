const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  await page.goto('https://duckduckgo.com/html/?q=site:instagram.com+"Freelance+Makeup+Artist"+"Los+Angeles"');
  const ddgHrefs = await page.evaluate(() => Array.from(document.querySelectorAll('a[href]')).map(a => a.href));
  console.log("DDG Hrefs:", ddgHrefs.filter(h => h.includes('instagram')));
  
  await browser.close();
})();
