import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const blogs = await prisma.blogPost.findMany({
      where: { relatedInstituteId: id, status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 10,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        coverImageAlt: true,
        readingTime: true,
        publishedAt: true,
        authorProfile: {
          select: {
            displayName: true,
            avatarUrl: true,
            user: { select: { name: true } }
          }
        },
        category: {
          select: { name: true, slug: true }
        }
      }
    });

    return NextResponse.json({ success: true, data: blogs });
  } catch (error: any) {
    console.error("Mobile Blogs Error:", error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
