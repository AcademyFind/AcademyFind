import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/getSession';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ instituteId: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { instituteId } = await params;

    const members = await prisma.instituteMembership.findMany({
      where: { instituteId },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: members });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { membershipId, action } = body; // action: 'approve' | 'reject'

    const membership = await prisma.instituteMembership.update({
      where: { id: membershipId },
      data: {
        status: action === 'approve' ? 'ACTIVE' : 'REJECTED',
        isActive: action === 'approve',
        ...(action === 'approve' && { joinedAt: new Date() }),
      },
    });

    return NextResponse.json({ success: true, data: membership });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
