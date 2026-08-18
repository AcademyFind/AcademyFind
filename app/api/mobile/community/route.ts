import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/getSession';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const q = searchParams.get('q') || '';

    const whereClause: any = {};
    if (q) {
      whereClause.question = { contains: q, mode: 'insensitive' };
    }

    const questions = await prisma.communityQuestion.findMany({
      where: whereClause,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, image: true, username: true } },
        _count: { select: { answers: true } },
      },
    });

    return NextResponse.json({ success: true, data: questions });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { question, instituteId } = await request.json();
    if (!question || !instituteId) return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });

    const newQuestion = await prisma.communityQuestion.create({
      data: {
        question,
        instituteId,
        userId: session.user.id,
      },
      include: {
        user: { select: { name: true, image: true } },
        _count: { select: { answers: true } },
      }
    });

    return NextResponse.json({ success: true, data: newQuestion });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
