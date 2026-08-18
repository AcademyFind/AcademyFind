import { NextResponse } from 'next/server';
import { getTrafficData } from '@/lib/User/admin/analytics';
import { getSearchConsoleData } from '@/lib/User/admin/searchConsole';
import { getSession } from '@/lib/auth/getSession';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (user?.role !== 'ADMIN') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const [gaData, gscData] = await Promise.all([
      getTrafficData(),
      getSearchConsoleData(),
    ]);

    if (gaData.error || gscData.error) {
       return NextResponse.json({ 
         success: false, 
         error: 'Failed to fetch analytics', 
         details: { gaError: gaData.error, gscError: gscData.error } 
       }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        traffic: gaData,
        searchConsole: gscData
      }
    });
  } catch (error: any) {
    console.error("Analytics API Error:", error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
