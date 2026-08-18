import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where = { isActive: true };

    const [jobs, total] = await Promise.all([
      prisma.jobPosting.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          department: true,
          location: true,
          type: true,
          Salary: true,
          experience: true,
          description: true,
          requirements: true,
          benefits: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.jobPosting.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: { jobs, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } },
    });
  } catch (error: any) {
    console.error('Mobile Careers API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
