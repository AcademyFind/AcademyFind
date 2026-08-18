import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/getSession';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true, name: true, email: true, image: true, role: true,
        phone: true, username: true,
        createdAt: true, updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, username } = body;

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        phone,
        username,
      },
      select: {
        id: true, name: true, email: true, image: true, role: true,
        phone: true, username: true,
      },
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
