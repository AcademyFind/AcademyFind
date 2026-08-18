import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/getSession';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    const existing = await prisma.instituteMembership.findFirst({
      where: { userId: session.user.id, instituteId: id, role: "STUDENT" },
    });

    if (existing) {
      return NextResponse.json({ success: false, error: 'You have already requested to join this institute.' }, { status: 400 });
    }

    const institute = await prisma.institute.findUnique({
      where: { id },
      select: { name: true },
    });

    if (!institute) return NextResponse.json({ success: false, error: 'Institute not found.' }, { status: 404 });

    await prisma.$transaction(async (tx) => {
      // Upsert global student profile
      const studentProfile = await tx.studentProfile.upsert({
        where: { userId: session.user.id },
        create: { userId: session.user.id },
        update: {},
      });

      // Create membership
      const membership = await tx.instituteMembership.create({
        data: {
          userId: session.user.id,
          instituteId: id,
          role: "STUDENT",
          status: "PENDING",
        },
      });

      // Create student institute record
      await tx.studentInstituteRecord.create({
        data: {
          membershipId: membership.id,
          studentProfileId: studentProfile.id,
          instituteId: id,
        },
      });
    });

    return NextResponse.json({ success: true, message: 'Request sent successfully' });
  } catch (error: any) {
    console.error("Mobile Join Error:", error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
