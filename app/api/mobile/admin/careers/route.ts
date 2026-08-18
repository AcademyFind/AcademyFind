import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/getSession';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (session?.user?.role !== 'ADMIN') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const careers = await prisma.jobPosting.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ success: true, data: careers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (session?.user?.role !== 'ADMIN') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { id, isActive } = await request.json();
    
    const updated = await prisma.jobPosting.update({
      where: { id },
      data: { isActive },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (session?.user?.role !== 'ADMIN') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });

    await prisma.jobPosting.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
