import * as cheerio from 'cheerio';

export async function getApproxIndexedPages() {
  try {
    const url = 'https://www.google.com/search?q=site:academyfind.com&hl=en';
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      next: {
        revalidate: 43200 // Cache for 12 hours (to avoid Google IP ban)
      }
    });
    
    if (!response.ok) {
      return null;
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Google's result stats div
    const resultStats = $('#result-stats').text();
    if (resultStats) {
      // It typically looks like: "About 10,200 results (0.34 seconds)"
      const match = resultStats.match(/([\d,]+)/);
      if (match && match[1]) {
        return match[1]; // e.g., "10,200"
      }
    }
    
    return null;
  } catch (error) {
    console.error('Google Scraper Error:', error);
    return null;
  }
}
