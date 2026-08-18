import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/getSession';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { title, description, linkUrl, pricePaid, images } = body;

    if (!title || !description || !pricePaid) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const ad = await prisma.advertisement.create({
      data: {
        userId: session.user.id,
        title,
        description,
        linkUrl,
        pricePaid: Number(pricePaid),
        images: images || [],
        status: 'PENDING',
        visibility: 'HIDDEN',
      },
    });

    return NextResponse.json({ success: true, data: ad });
  } catch (error: any) {
    console.error('Mobile Advertise API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
