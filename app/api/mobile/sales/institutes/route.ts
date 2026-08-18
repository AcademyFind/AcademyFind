import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/getSession';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    if (session.user.role !== 'SALES_MANAGER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id') || session.user.id;
    const search = searchParams.get('search') || '';

    // Get the sales manager's assigned categories
    const assignedCategories = await prisma.salesCategoryAssignment.findMany({
      where: { salesManagerId: id },
      select: { categoryId: true, category: { select: { name: true } } },
    });

    const assignedCategoryIds = assignedCategories.map((c: any) => c.categoryId);

    const whereCondition: any = {};
    if (assignedCategoryIds.length > 0) {
      whereCondition.categories = {
        some: { categoryId: { in: assignedCategoryIds } }
      };
    }
    if (search) {
      whereCondition.name = { contains: search, mode: "insensitive" };
    }

    const institutes = await prisma.institute.findMany({
      where: whereCondition,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        city: { select: { name: true } },
        categories: {
          include: { category: { select: { id: true, name: true } } },
          take: 2,
        },
        salesAssignments: {
          select: {
            id: true,
            salesManagerId: true,
            contactStatus: true,
            salesManager: { select: { name: true } }
          }
        }
      },
      take: 50,
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ 
      success: true, 
      data: {
        institutes,
        assignedCategories
      } 
    });
  } catch (error: any) {
    console.error("Sales Institutes API Error:", error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
