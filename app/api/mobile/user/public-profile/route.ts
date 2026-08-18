import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) return NextResponse.json({ success: false, error: 'Missing username' }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        createdAt: true,
        role: true,
        _count: {
          select: {
            communityQuestions: true,
            communityAnswers: true,
            reviews: true,
          }
        }
      }
    });

    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
