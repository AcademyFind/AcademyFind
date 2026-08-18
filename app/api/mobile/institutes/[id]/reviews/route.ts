import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/getSession';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { instituteId: id, status: 'APPROVED' },
        include: {
          user: { select: { id: true, name: true, image: true } },
          replies: {
            include: {
              user: { select: { id: true, name: true, image: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where: { instituteId: id, status: 'APPROVED' } }),
    ]);

    return NextResponse.json({
      success: true,
      data: { reviews, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { rating, comment } = body;

    // Check if user already reviewed this institute
    const existing = await prisma.review.findUnique({
      where: { userId_instituteId: { userId: session.user.id, instituteId: id } },
    });

    if (existing) {
      return NextResponse.json({ success: false, error: 'You have already reviewed this institute' }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        instituteId: id,
        userId: session.user.id,
        rating: parseInt(rating),
        comment: comment || '',
        status: 'PENDING',
      },
    });

    return NextResponse.json({ success: true, data: review });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
