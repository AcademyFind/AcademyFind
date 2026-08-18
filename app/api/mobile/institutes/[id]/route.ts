import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const institute = await prisma.institute.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        city: true,
        categories: {
          include: { category: true },
        },
        facilities: { orderBy: { order: 'asc' } },
        batches: { orderBy: { createdAt: 'desc' } },
        highlightStats: { orderBy: { order: 'asc' } },
        achievements: { orderBy: { year: 'desc' }, take: 10 },
        faqs: { orderBy: { order: 'asc' } },
        operatingHours: { orderBy: { dayOfWeek: 'asc' } },
        reviews: {
          where: { status: 'APPROVED' },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
        },
        _count: {
          select: {
            reviews: true,
            memberships: { where: { status: 'ACTIVE', isActive: true } },
          },
        },
      },
    });

    if (!institute) {
      return NextResponse.json({ success: false, error: 'Institute not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: institute });
  } catch (error: any) {
    console.error('Mobile Institute Detail API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
