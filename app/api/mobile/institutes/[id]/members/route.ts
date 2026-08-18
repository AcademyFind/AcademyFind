import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const members = await prisma.instituteMembership.findMany({
      where: {
        instituteId: id,
        status: 'ACTIVE',
        isActive: true,
      },
      include: {
        user: {
          select: { id: true, name: true, image: true }
        }
      },
      take: 20,
    });

    return NextResponse.json({ success: true, data: members });
  } catch (error: any) {
    console.error("Mobile Members Error:", error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
