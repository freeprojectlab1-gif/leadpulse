const axios = require('axios');
const cheerio = require('cheerio'); // Do we have cheerio? No.
(async () => {
  try {
    const res = await axios.post('https://lite.duckduckgo.com/lite/', 'q=site:instagram.com "Freelance Makeup Artist" "Los Angeles"', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    const html = res.data;
    const links = [...html.matchAll(/href="([^"]+)"/g)].map(m => m[1]);
    console.log("DDG Lite Axios Links:", links.filter(h => h.includes('instagram.com')).length);
  } catch (e) {
    console.log("Failed", e.message);
  }
})();
