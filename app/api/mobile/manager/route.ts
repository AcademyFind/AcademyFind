import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/getSession';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get all institutes this user manages
    const managedInstitutes = await prisma.instituteManager.findMany({
      where: { userId: session.user.id },
      include: {
        institute: {
          select: {
            id: true, name: true, slug: true, logo: true, imageUrl: true, gallery: true,
            averageRating: true, reviewCount: true, isVerified: true, isActive: true,
            city: { select: { name: true } },
            _count: {
              select: {
                enquiries: { where: { status: 'NEW' } },
                memberships: { where: { status: 'PENDING' } },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: managedInstitutes.map((m: any) => ({
        ...m.institute,
        newLeads: m.institute._count.enquiries,
        pendingMembers: m.institute._count.memberships,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
