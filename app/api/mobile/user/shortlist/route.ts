import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/getSession';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const shortlist = await prisma.userShortlist.findMany({
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
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: shortlist });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { instituteId } = await request.json();

    const existing = await prisma.userShortlist.findFirst({
      where: { userId: session.user.id, instituteId },
    });

    if (existing) {
      await prisma.userShortlist.delete({
        where: {
          userId_instituteId: {
            userId: session.user.id,
            instituteId: instituteId
          }
        }
      });
      return NextResponse.json({ success: true, data: { action: 'removed' } });
    }

    const item = await prisma.userShortlist.create({
      data: { userId: session.user.id, instituteId },
    });

    return NextResponse.json({ success: true, data: { action: 'added', item } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
