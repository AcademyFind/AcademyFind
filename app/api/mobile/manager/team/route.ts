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
      include: { 
        managers: { 
          include: { user: { select: { name: true, email: true, image: true, createdAt: true } } } 
        } 
      }
    });

    if (!institute) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    const plan = institute.subscriptionPlan || "BASIC"; 
    let maxMembers = 1;
    if (plan === "PREMIUM") maxMembers = 3;
    if (plan === "ULTRA") maxMembers = 5;

    return NextResponse.json({ 
      success: true, 
      data: { 
        team: institute.managers,
        plan,
        maxMembers,
        currentMembers: institute.managers.length
      } 
    });
  } catch (error: any) {
    console.error("Manager Team API Error:", error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
