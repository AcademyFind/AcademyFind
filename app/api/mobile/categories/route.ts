import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            children: {
              include: {
                _count: {
                  select: {
                    institutes: {
                      where: { institute: { isActive: true } },
                    },
                  },
                },
              },
            },
            _count: {
              select: {
                institutes: {
                  where: { institute: { isActive: true } },
                },
              },
            },
          },
        },
        _count: {
          select: {
            institutes: {
              where: { institute: { isActive: true } },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ success: true, data: categories });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
