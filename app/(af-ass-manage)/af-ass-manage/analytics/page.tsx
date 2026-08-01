import { getTrafficData } from '@/lib/User/admin/analytics';
import { getSearchConsoleData } from '@/lib/User/admin/searchConsole';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, MousePointerClick, Users, Activity, ListFilter } from 'lucide-react';
import AnalyticsCharts from './analytics-charts';

export const metadata = {
  title: 'Analytics Dashboard',
};

export const revalidate = 3600; // Cache for 1 hour

export default async function AnalyticsPage() {
  // Fetch data in parallel
  const [gaData, gscData] = await Promise.all([
    getTrafficData(),
    getSearchConsoleData()
  ]);

  if (gaData.error || gscData.error) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">
          <p>Failed to load analytics data.</p>
          {gaData.error && <p>GA4 Error: {gaData.error}</p>}
          {gscData.error && <p>GSC Error: {gscData.error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Analytics Overview</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-slate-500">Last 30 Days</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gaData.overview?.activeUsers}</div>
            <p className="text-xs text-slate-500">Active users in last 30 days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            <BarChart3 className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gaData.overview?.pageViews}</div>
            <p className="text-xs text-slate-500">Total screens/pages viewed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organic Clicks</CardTitle>
            <MousePointerClick className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gscData.overview?.totalClicks}</div>
            <p className="text-xs text-slate-500">From Google Search</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Position</CardTitle>
            <Activity className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gscData.overview?.avgPosition}</div>
            <p className="text-xs text-slate-500">Average ranking position</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submitted Pages</CardTitle>
            <ListFilter className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gscData.overview?.totalSubmitted}</div>
            <p className="text-xs text-slate-500">Submitted via Sitemaps</p>
          </CardContent>
        </Card>
      </div>

      {/* Render the interactive charts in a client component */}
      <AnalyticsCharts 
        chartData={gaData.chartData || []} 
        topPages={gaData.topPages || []} 
        channels={gaData.channels || []} 
      />
    </div>
  );
}
