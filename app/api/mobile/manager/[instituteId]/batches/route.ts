import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/getSession';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ instituteId: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { instituteId } = await params;

    const batches = await prisma.instituteBatch.findMany({
      where: { instituteId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: batches });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ instituteId: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { instituteId } = await params;
    const body = await request.json();

    const batch = await prisma.instituteBatch.create({
      data: { instituteId, ...body },
    });

    return NextResponse.json({ success: true, data: batch });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, ...data } = body;

    const batch = await prisma.instituteBatch.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: batch });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });

    await prisma.instituteBatch.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
