import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/getSession';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { ownerName, ownerPhone, ownerDesignation } = body;

    if (!ownerName || !ownerPhone || !ownerDesignation) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Check if institute exists
    const institute = await prisma.institute.findUnique({ where: { id } });
    if (!institute) return NextResponse.json({ success: false, error: 'Institute not found' }, { status: 404 });

    // Create claim request
    const claim = await prisma.instituteRequest.create({
      data: {
        instituteId: id,
        userId: session.user.id,
        ownerName,
        ownerPhone,
        ownerDesignation,
        status: 'PENDING',
      },
    });

    return NextResponse.json({ success: true, data: claim });
  } catch (error: any) {
    console.error('Mobile Claim API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
