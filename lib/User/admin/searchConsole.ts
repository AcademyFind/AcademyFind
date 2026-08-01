import { google } from 'googleapis';

export async function getSearchConsoleData() {
  const siteUrl = process.env.GSC_SITE_URL;
  if (!siteUrl) {
    return { error: 'GSC_SITE_URL is not configured in .env' };
  }

  try {
    // Automatically picks up GOOGLE_APPLICATION_CREDENTIALS
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    });

    const webmasters = google.webmasters({ version: 'v3', auth });

    // 1. Get Traffic Stats (Clicks/Impressions)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Last 30 days

    const response = await webmasters.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        dimensions: ['date'],
      },
    });

    const rows = response.data.rows || [];
    const totalClicks = rows.reduce((acc, row) => acc + (row.clicks || 0), 0);
    const totalImpressions = rows.reduce((acc, row) => acc + (row.impressions || 0), 0);
    
    // Calculate Average Position
    const avgPosition = rows.length > 0 
      ? rows.reduce((acc, row) => acc + (row.position || 0), 0) / rows.length 
      : 0;

    // 2. Get Sitemap Data to find Submitted Pages
    const sitemaps = await webmasters.sitemaps.list({ siteUrl });
    let totalSubmitted = 0;
    
    if (sitemaps.data.sitemap) {
      for (const sitemap of sitemaps.data.sitemap) {
        if (sitemap.contents) {
          for (const content of sitemap.contents) {
            totalSubmitted += (parseInt(content.submitted as string) || 0);
          }
        }
      }
    }

    return {
      success: true,
      overview: {
        totalClicks,
        totalImpressions,
        avgPosition: parseFloat(avgPosition.toFixed(1)),
        totalSubmitted,
      },
      chartData: rows.map(row => ({
        date: row.keys?.[0] || '',
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
      })),
    };
  } catch (error: any) {
    console.error('GSC API Error:', error);
    return { error: error.message || 'Failed to fetch search console data' };
  }
}
