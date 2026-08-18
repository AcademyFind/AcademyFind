import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/getSession';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (session?.user?.role !== 'ADMIN') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const requests = await prisma.instituteRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        institute: { select: { id: true, name: true, city: { select: { name: true } } } },
        user: { select: { id: true, name: true, email: true } }
      },
      take: 50,
    });

    return NextResponse.json({ success: true, data: requests });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (session?.user?.role !== 'ADMIN') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { id, status } = await request.json();
    
    const updated = await prisma.instituteRequest.update({
      where: { id },
      data: { status },
    });

    // If approved, create InstituteManager record
    if (status === 'APPROVED') {
      const req = await prisma.instituteRequest.findUnique({ where: { id } });
      if (req) {
        // Prevent duplicate manager mapping
        const existing = await prisma.instituteManager.findFirst({
            where: { userId: req.userId, instituteId: req.instituteId }
        });
        if (!existing) {
            await prisma.instituteManager.create({
                data: {
                    userId: req.userId,
                    instituteId: req.instituteId,
                }
            });
            // Update user role to manager if they are just a user
            const user = await prisma.user.findUnique({ where: { id: req.userId } });
            if (user?.role === 'USER') {
                await prisma.user.update({
                    where: { id: req.userId },
                    data: { role: 'INSTITUTE_MANAGER' }
                });
            }
        }
      }
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
