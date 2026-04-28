(async () => {
  try {
    const res = await fetch('https://lite.duckduckgo.com/lite/', {
      method: 'POST',
      body: 'q=' + encodeURIComponent('site:instagram.com "Makeup Artist" "Miami"'),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    const html = await res.text();
    const links = [...html.matchAll(/href="([^"]+)"/g)].map(m => m[1]);
    console.log("Miami DDG Lite:", links.filter(h => h.includes('instagram.com')).length, "links");
  } catch (e) {
    console.log("Failed", e.message);
  }
})();
