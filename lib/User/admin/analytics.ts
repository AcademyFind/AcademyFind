import { BetaAnalyticsDataClient } from '@google-analytics/data';

const analyticsDataClient = new BetaAnalyticsDataClient(
  process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY
    ? {
        credentials: {
          client_email: process.env.GOOGLE_CLIENT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        },
      }
    : undefined
);

export async function getTrafficData() {
  const propertyId = process.env.GA_PROPERTY_ID;
  if (!propertyId) {
    return { error: 'GA_PROPERTY_ID is not configured in .env' };
  }

  try {
    // Top-level stats (Total for last 30 days)
    const [overviewResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'screenPageViews' },
        { name: 'sessions' },
      ],
    });

    // Trend data (Daily for last 30 days) for the chart
    const [trendResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'activeUsers' }],
      orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }],
    });

    // Top Pages
    const [topPagesResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
      metrics: [{ name: 'screenPageViews' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 10,
    });
    
    // Top Channels
    const [channelsResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'sessionDefaultChannelGroup' }],
      metrics: [{ name: 'sessions' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    });

    // Format the response
    const overview = overviewResponse.rows?.[0]?.metricValues || [];
    
    const chartData = trendResponse.rows?.map(row => {
      const dateStr = row.dimensionValues?.[0]?.value || '';
      // GA returns date as YYYYMMDD, we format it for the chart
      const formattedDate = dateStr.length === 8 
        ? `${dateStr.substring(0,4)}-${dateStr.substring(4,6)}-${dateStr.substring(6,8)}`
        : dateStr;
        
      return {
        date: formattedDate,
        visitors: parseInt(row.metricValues?.[0]?.value || '0', 10)
      };
    }) || [];

    const topPages = topPagesResponse.rows?.map(row => ({
      path: row.dimensionValues?.[0]?.value || '',
      title: row.dimensionValues?.[1]?.value || '',
      views: parseInt(row.metricValues?.[0]?.value || '0', 10)
    })) || [];
    
    const channels = channelsResponse.rows?.map(row => ({
      name: row.dimensionValues?.[0]?.value || 'Unknown',
      value: parseInt(row.metricValues?.[0]?.value || '0', 10)
    })) || [];

    return {
      success: true,
      overview: {
        activeUsers: overview[0]?.value || '0',
        pageViews: overview[1]?.value || '0',
        sessions: overview[2]?.value || '0',
      },
      chartData,
      topPages,
      channels
    };
  } catch (error: any) {
    console.error('GA4 API Error:', error);
    return { error: error.message || 'Failed to fetch analytics data' };
  }
}
