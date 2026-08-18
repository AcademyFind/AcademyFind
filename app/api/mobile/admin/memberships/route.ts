import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/getSession';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (user?.role !== 'ADMIN') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const [pending, recent] = await Promise.all([
      prisma.instituteMembership.findMany({
        where: { status: "PENDING" },
        orderBy: { createdAt: "asc" },
        take: 50,
        select: {
          id: true,
          role: true,
          status: true,
          createdAt: true,
          user: { select: { id: true, name: true, username: true, image: true, email: true } },
          institute: { select: { id: true, name: true, slug: true } },
          studentRecord: { select: { courseName: true, batchYear: true } },
          teacherRecord: { select: { designation: true, teachingSubjects: true } },
        },
      }),
      prisma.instituteMembership.findMany({
        where: { status: { in: ["ACTIVE", "ALUMNI", "REMOVED", "REJECTED"] } },
        orderBy: { updatedAt: "desc" },
        take: 30,
        select: {
          id: true,
          role: true,
          status: true,
          updatedAt: true,
          user: { select: { name: true, username: true, image: true } },
          institute: { select: { name: true, slug: true, id: true } },
        },
      }),
    ]);

    return NextResponse.json({ 
      success: true, 
      data: { pending, recent }
    });
  } catch (error: any) {
    console.error("Memberships API Error:", error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
