import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/getSession';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (session?.user?.role !== 'ADMIN') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const managers = await prisma.user.findMany({
      where: { role: 'SALES_MANAGER' },
      select: {
        id: true, name: true, email: true, phone: true, isActive: true,
        _count: {
          select: { salesAssignments: true }
        }
      },
    });

    return NextResponse.json({ success: true, data: managers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
