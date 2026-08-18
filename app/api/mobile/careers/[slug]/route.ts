import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const job = await prisma.jobPosting.findFirst({
      where: { OR: [{ slug }, { id: slug }], isActive: true },
      include: {
        applications: {
          select: { id: true },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { ...job, applicationCount: job.applications.length } });
  } catch (error: any) {
    console.error('Mobile Career Detail API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
