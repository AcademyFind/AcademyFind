import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const blog = await prisma.blogPost.findFirst({
      where: { OR: [{ slug }, { id: slug }], status: 'PUBLISHED' },
      include: {
        authorProfile: true,
        category: true,
        tags: {
          include: { tag: true },
        },
      },
    });

    if (!blog) {
      return NextResponse.json({ success: false, error: 'Blog not found' }, { status: 404 });
    }


    // Related blogs
    const related = await prisma.blogPost.findMany({
      where: {
        status: 'PUBLISHED',
        id: { not: blog.id },
        ...(blog.categoryId ? { categoryId: blog.categoryId } : {}),
      },
      select: {
        id: true, title: true, slug: true, excerpt: true, coverImage: true, createdAt: true, readingTime: true,
      },
      take: 4,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: { blog, related } });
  } catch (error: any) {
    console.error('Mobile Blog Detail API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
