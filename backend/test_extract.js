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
  const textContent = await page.evaluate(() => document.body.textContent);
  console.log("textContent length:", textContent.length);
  
  const emails = textContent.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi);
  console.log("Emails found in textContent:", emails ? emails.length : 0);
  
  const html = await page.evaluate(() => document.documentElement.outerHTML);
  const emailsHtml = html.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi);
  console.log("Emails found in outerHTML:", emailsHtml ? emailsHtml.length : 0);
  
  await browser.close();
})();
