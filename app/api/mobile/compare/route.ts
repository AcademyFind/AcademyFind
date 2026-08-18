import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug') || '';

    if (!slug) {
      return NextResponse.json({ success: false, error: 'Comparison slug required' }, { status: 400 });
    }

    const comparison = await prisma.instituteComparisonCache.findUnique({
      where: { slug },
      include: {
        institute1: {
          select: {
            id: true, name: true, slug: true, imageUrl: true, gallery: true, logo: true,
            averageRating: true, reviewCount: true, description: true, phone: true,
            city: { select: { name: true } },
            categories: { select: { category: { select: { name: true } } }, take: 3 },
            facilities: { take: 10 },
            highlightStats: { take: 5 },
          },
        },
        institute2: {
          select: {
            id: true, name: true, slug: true, imageUrl: true, gallery: true, logo: true,
            averageRating: true, reviewCount: true, description: true, phone: true,
            city: { select: { name: true } },
            categories: { select: { category: { select: { name: true } } }, take: 3 },
            facilities: { take: 10 },
            highlightStats: { take: 5 },
          },
        },
      },
    });

    if (!comparison) {
      return NextResponse.json({ success: false, error: 'Comparison not found' }, { status: 404 });
    }

    // Increment view count
    await prisma.instituteComparisonCache.update({
      where: { id: comparison.id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({ success: true, data: comparison });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
