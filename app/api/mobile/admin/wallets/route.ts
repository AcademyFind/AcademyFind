import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/getSession';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (session?.user?.role !== 'ADMIN') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const wallets = await prisma.userWallet.findMany({
      orderBy: { balance: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
      },
      take: 50,
    });

    return NextResponse.json({ success: true, data: wallets });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
