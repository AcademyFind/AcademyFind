import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/getSession';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const instituteId = searchParams.get('instituteId');
    if (!instituteId) return NextResponse.json({ success: false, error: 'Institute ID missing' }, { status: 400 });

    const isManager = await prisma.instituteManager.findFirst({
      where: { userId: session.user.id, instituteId }
    });
    if (!isManager && session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const institute = await prisma.institute.findUnique({
      where: { id: instituteId },
      select: { subscriptionPlan: true }
    });

    const isPremium = institute?.subscriptionPlan === 'PREMIUM' || institute?.subscriptionPlan === 'ULTRA';
    if (!isPremium) {
      return NextResponse.json({ success: true, data: { isLocked: true } });
    }

    const blogs = await prisma.blogPost.findMany({
      where: { relatedInstituteId: instituteId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        createdAt: true,
        coverImage: true,
        rejectionReason: true,
        viewCount: true,
      },
    });

    return NextResponse.json({ success: true, data: { isLocked: false, blogs } });
  } catch (error: any) {
    console.error("Manager Blogs API Error:", error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
