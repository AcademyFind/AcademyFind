import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/getSession';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};
    if (q) where.OR = [{ name: { contains: q, mode: 'insensitive' } }, { slug: { contains: q, mode: 'insensitive' } }];
    if (status === 'active') where.isActive = true;
    if (status === 'inactive') where.isActive = false;

    const [institutes, total] = await Promise.all([
      prisma.institute.findMany({
        where,
        select: {
          id: true, name: true, slug: true, logo: true, isActive: true, isVerified: true, isPublished: true,
          averageRating: true, reviewCount: true, createdAt: true,
          city: { select: { name: true } },
          _count: { select: { enquiries: true, reviews: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.institute.count({ where }),
    ]);

    return NextResponse.json({ success: true, data: { institutes, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
