import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/auth/getSession';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventType, pageUrl, details } = body;

    const authSession = await getSession();
    const userId = authSession?.user?.id || null;

    // 1. Get or Generate a Tracking Cookie
    const cookieStore = await cookies();
    let visitorId = cookieStore.get('af-visitor-id')?.value;

    let isNewVisitor = false;
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      isNewVisitor = true;
    }

    // 2. Extract Demographics from Vercel Headers
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'Unknown';
    const city = req.headers.get('x-vercel-ip-city') || 'Unknown City';
    const country = req.headers.get('x-vercel-ip-country') || 'Unknown Country';
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    // Ignore bot traffic
    const isBot = /bot|crawler|spider|crawling|googlebot|bingbot|yandexbot|duckduckbot|slurp|baiduspider|headless/i.test(userAgent);
    if (isBot) {
      return NextResponse.json({ success: true, message: 'Bot traffic ignored' });
    }

    // Simple UA Parsing (can use 'ua-parser-js' if needed, but keeping it light)
    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    let os = 'Unknown';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'Mac OS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';

    let device = 'Desktop';
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(userAgent)) {
      device = 'Mobile';
    }

    // 3. Find or Create the Visitor Session
    let session = await prisma.visitorSession.findUnique({
      where: { cookieId: visitorId },
    });

    if (!session) {
      session = await prisma.visitorSession.create({
        data: {
          cookieId: visitorId,
          userId: userId || null,
          ipAddress,
          city,
          country,
          device,
          browser,
          os,
        },
      });
    } else {
      // Update session if they logged in or their location changed
      await prisma.visitorSession.update({
        where: { id: session.id },
        data: {
          userId: userId || session.userId, // keep old if not provided, set if provided
          updatedAt: new Date(),
        },
      });
    }

    // 4. Log the Event
    await prisma.visitorEvent.create({
      data: {
        sessionId: session.id,
        eventType: eventType || 'PAGE_VIEW',
        pageUrl: pageUrl || 'Unknown',
        details: details || null,
      },
    });

    // 5. Delete events older than 30 days to save DB space
    // We only run this 1 out of 100 requests to avoid overhead
    if (Math.random() < 0.01) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      await prisma.visitorEvent.deleteMany({
        where: { createdAt: { lt: thirtyDaysAgo } },
      });
    }

    // 6. Return response with cookie if new
    const response = NextResponse.json({ success: true });
    
    if (isNewVisitor) {
      // Set cookie for 1 year
      response.cookies.set('af-visitor-id', visitorId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
    }

    return response;
  } catch (error) {
    console.error('Tracking API Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to track event' }, { status: 500 });
  }
}
