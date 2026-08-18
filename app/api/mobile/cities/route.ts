import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cities = await prisma.city.findMany({
      include: {
        _count: {
          select: {
            institutes: { where: { isActive: true } },
          },
        },
      },
      orderBy: { state: 'asc' },
    });

    const activeCities = cities.filter((city: any) => city._count.institutes > 0);

    // Group by state
    const grouped: Record<string, typeof activeCities> = {};
    activeCities.forEach((city: any) => {
      const state = city.state || 'Other';
      if (!grouped[state]) grouped[state] = [];
      grouped[state].push(city);
    });

    return NextResponse.json({ success: true, data: { cities: activeCities, grouped } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
