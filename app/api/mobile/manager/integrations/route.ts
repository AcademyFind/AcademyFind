import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/getSession';

async function checkAccess(instituteId: string) {
  const session = await getSession();
  if (!session?.user) return { error: 'Unauthorized', status: 401 };

  const isManager = await prisma.instituteManager.findFirst({
    where: { userId: session.user.id, instituteId }
  });

  if (!isManager && session.user.role !== 'ADMIN') {
    return { error: 'Forbidden', status: 403 };
  }

  const institute = await prisma.institute.findUnique({
    where: { id: instituteId },
    select: { subscriptionPlan: true }
  });

  return { success: true, isPremium: institute?.subscriptionPlan === 'PREMIUM' || institute?.subscriptionPlan === 'ULTRA' };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const instituteId = searchParams.get('instituteId');
    if (!instituteId) return NextResponse.json({ success: false, error: 'Institute ID missing' }, { status: 400 });

    const access = await checkAccess(instituteId);
    if (access.error) return NextResponse.json({ success: false, error: access.error }, { status: access.status });
    
    if (!access.isPremium) {
      return NextResponse.json({ success: true, data: { isLocked: true } });
    }

    const integrations = await prisma.cRMIntegration.findMany({
      where: { instituteId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: { isLocked: false, integrations } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { instituteId, provider, webhookUrl, sendEnquiries, sendUserSaves, sendUserVisits } = data;
    
    const access = await checkAccess(instituteId);
    if (access.error || !access.isPremium) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });

    const integration = await prisma.cRMIntegration.create({
      data: {
        instituteId,
        provider,
        webhookUrl,
        sendEnquiries,
        sendUserSaves,
        sendUserVisits,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, data: integration });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, instituteId, provider, webhookUrl, sendEnquiries, sendUserSaves, sendUserVisits, isActive } = data;
    
    const access = await checkAccess(instituteId);
    if (access.error || !access.isPremium) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });

    const updateData: any = {};
    if (provider !== undefined) updateData.provider = provider;
    if (webhookUrl !== undefined) updateData.webhookUrl = webhookUrl;
    if (sendEnquiries !== undefined) updateData.sendEnquiries = sendEnquiries;
    if (sendUserSaves !== undefined) updateData.sendUserSaves = sendUserSaves;
    if (sendUserVisits !== undefined) updateData.sendUserVisits = sendUserVisits;
    if (isActive !== undefined) updateData.isActive = isActive;

    const integration = await prisma.cRMIntegration.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: integration });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const instituteId = searchParams.get('instituteId');
    if (!id || !instituteId) return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });

    const access = await checkAccess(instituteId);
    if (access.error || !access.isPremium) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });

    await prisma.cRMIntegration.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
