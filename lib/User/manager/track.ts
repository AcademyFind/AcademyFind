"use server"
import { headers } from 'next/headers';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth/auth';

export async function trackInstituteView(instituteId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  const today = new Date().toISOString().split('T')[0]; // "2026-06-20"

  if (session?.user) {
    // ===== LOGGED IN: per-user history upsert + counter increment =====
    await prisma.$transaction([
      prisma.userHistory.upsert({
        where: { userId_instituteId: { userId: session.user.id, instituteId } },
        update: { viewedAt: new Date() },
        create: { userId: session.user.id, instituteId },
      }),
      prisma.institute.update({
        where: { id: instituteId },
        data: { viewCount: { increment: 1 } },
      }),
      prisma.instituteDailyView.upsert({
        where: { instituteId_date: { instituteId, date: new Date(today) } },
        update: { viewCount: { increment: 1 } },
        create: { instituteId, date: new Date(today), viewCount: 1 },
      }),
    ]);
    return;
  }

  // ===== LOGGED OUT: cookie-based dedup, fir counter increment =====
  const cookieStore = await cookies();
  const cookieKey = `viewed_${instituteId}`;

  if (cookieStore.get(cookieKey)) return; // isi visitor ne already aaj count kara hai, skip

  await prisma.$transaction([
    prisma.institute.update({
      where: { id: instituteId },
      data: { viewCount: { increment: 1 } },
    }),
    prisma.instituteDailyView.upsert({
      where: { instituteId_date: { instituteId, date: new Date(today) } },
      update: { viewCount: { increment: 1 } },
      create: { instituteId, date: new Date(today), viewCount: 1 },
    }),
  ]);

  cookieStore.set(cookieKey, '1', { maxAge: 60 * 60 * 12 }); // 12hr ke liye dedup
}

export async function startVisitTracker(instituteId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const headersList = await headers();
    
    // IP based location from Vercel headers
    const city = headersList.get('x-vercel-ip-city') || null;
    const country = headersList.get('x-vercel-ip-country') || null;
    const region = headersList.get('x-vercel-ip-country-region') || null;
    
    // Parse User-Agent
    const userAgentStr = headersList.get('user-agent') || '';
    let deviceType = "Desktop";
    let os = "Unknown";
    let browser = "Unknown";
    
    if (/mobile/i.test(userAgentStr)) deviceType = "Mobile";
    else if (/tablet/i.test(userAgentStr) || /ipad/i.test(userAgentStr)) deviceType = "Tablet";

    if (/windows/i.test(userAgentStr)) os = "Windows";
    else if (/mac/i.test(userAgentStr)) os = "Mac OS";
    else if (/linux/i.test(userAgentStr)) os = "Linux";
    else if (/android/i.test(userAgentStr)) os = "Android";
    else if (/ios|iphone|ipad/i.test(userAgentStr)) os = "iOS";

    if (/chrome|crios/i.test(userAgentStr)) browser = "Chrome";
    else if (/safari/i.test(userAgentStr) && !/chrome|crios/i.test(userAgentStr)) browser = "Safari";
    else if (/firefox|fxios/i.test(userAgentStr)) browser = "Firefox";
    else if (/edg/i.test(userAgentStr)) browser = "Edge";

    // Track Session ID via cookies for anonymous users
    const cookieStore = await cookies();
    let sessionId = cookieStore.get('af_session_id')?.value;
    if (!sessionId && !session?.user) {
      sessionId = crypto.randomUUID();
      cookieStore.set('af_session_id', sessionId, { maxAge: 60 * 60 * 24 * 30 }); // 30 days
    }

    const visit = await prisma.instituteVisit.create({
      data: {
        instituteId,
        userId: session?.user?.id || null,
        sessionId: sessionId || null,
        city: city ? decodeURIComponent(city) : null,
        country,
        region,
        os,
        browser,
        deviceType
      }
    });

    return visit.id;
  } catch (error) {
    console.error("Error starting visit tracker:", error);
    return null;
  }
}

export async function updateVisitDuration(visitId: string, additionalSeconds: number) {
  try {
    if (!visitId) return;
    await prisma.instituteVisit.update({
      where: { id: visitId },
      data: {
        duration: { increment: additionalSeconds }
      }
    });
  } catch (error) {
    console.error("Error updating visit duration:", error);
  }
}