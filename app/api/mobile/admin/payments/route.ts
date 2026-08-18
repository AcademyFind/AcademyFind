import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/getSession';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};
    if (status) where.status = status;

    const [payments, total] = await Promise.all([
      prisma.subscriptionPayment.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          institute: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.subscriptionPayment.count({ where }),
    ]);

    return NextResponse.json({ success: true, data: { payments, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, status } = body;

    const payment = await prisma.subscriptionPayment.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, data: payment });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
