import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/getSession';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const history = await prisma.userHistory.findMany({
      where: { userId: session.user.id },
      include: {
        institute: {
          select: {
            id: true, name: true, slug: true, logo: true, imageUrl: true, gallery: true,
            averageRating: true, reviewCount: true,
            city: { select: { name: true } },
          },
        },
      },
      orderBy: { viewedAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ success: true, data: history });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
