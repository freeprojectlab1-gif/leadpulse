const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  const query = 'site:instagram.com "Freelance Makeup Artist" "Los Angeles"';
  
  try {
    await page.goto(`https://www.ecosia.org/search?q=${encodeURIComponent(query)}`);
    const ecosiaHrefs = await page.evaluate(() => Array.from(document.querySelectorAll('a[href]')).map(a => a.href));
    console.log("Ecosia:", ecosiaHrefs.filter(h => h.includes('instagram.com')).length);
  } catch(e) { console.log("Ecosia failed"); }

  try {
    await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
    const googleHrefs = await page.evaluate(() => Array.from(document.querySelectorAll('a[href]')).map(a => a.href));
    console.log("Google:", googleHrefs.filter(h => h.includes('instagram.com')).length);
  } catch(e) { console.log("Google failed"); }

  await browser.close();
})();
