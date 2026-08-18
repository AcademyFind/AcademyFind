import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/getSession';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (user?.role !== 'ADMIN') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const reports = await prisma.messageReport.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        reason: true,
        description: true,
        status: true,
        createdAt: true,
        message: {
          select: {
            id: true,
            content: true,
            type: true,
            sender: { select: { name: true, username: true } },
            conversation: {
              select: {
                title: true,
                channelType: true,
                type: true,
                institute: { select: { name: true, id: true, slug: true } },
              },
            },
          },
        },
        reporter: { select: { name: true, username: true } },
      },
    });

    return NextResponse.json({ 
      success: true, 
      data: { reports }
    });
  } catch (error: any) {
    console.error("Chat Reports API Error:", error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
