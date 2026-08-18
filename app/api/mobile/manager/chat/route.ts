import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/getSession';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const instituteId = searchParams.get('instituteId');
    if (!instituteId) return NextResponse.json({ success: false, error: 'Institute ID missing' }, { status: 400 });

    const isManager = await prisma.instituteManager.findFirst({
      where: { userId: session.user.id, instituteId }
    });
    if (!isManager && session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const institute = await prisma.institute.findUnique({
      where: { id: instituteId },
      select: { subscriptionPlan: true }
    });

    const isLocked = institute?.subscriptionPlan === 'BASIC' || institute?.subscriptionPlan === 'VERIFIED';
    if (isLocked) {
      return NextResponse.json({ success: true, data: { isLocked: true } });
    }

    const [channels, reports] = await Promise.all([
      prisma.conversation.findMany({
        where: { instituteId, type: "INSTITUTE" },
        orderBy: { channelType: "asc" },
        select: {
          id: true,
          title: true,
          channelType: true,
          isReadOnly: true,
          memberCount: true,
          lastMessage: {
            select: { content: true, sender: { select: { name: true } } },
          },
        },
      }),
      prisma.messageReport.findMany({
        where: {
          message: { conversation: { instituteId } },
          status: "PENDING",
        },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          reason: true,
          status: true,
          createdAt: true,
          message: {
            select: {
              id: true,
              content: true,
              sender: { select: { name: true, username: true } },
              conversation: { select: { title: true, channelType: true } },
            },
          },
          reporter: { select: { name: true, username: true } },
        },
      })
    ]);

    return NextResponse.json({ success: true, data: { isLocked: false, channels, reports } });
  } catch (error: any) {
    console.error("Manager Chat API Error:", error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
