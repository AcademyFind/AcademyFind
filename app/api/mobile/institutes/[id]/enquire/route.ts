import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { triggerCRMWebhooks } from '@/lib/crm/webhooks';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, phone, message, email } = body;

    if (!name || !phone) {
      return NextResponse.json({ success: false, error: 'Name and phone are required' }, { status: 400 });
    }

    const enquiry = await prisma.instituteEnquiry.create({
      data: {
        name,
        phone,
        message: message || '',
        instituteId: id,
        email: email || null,
        status: "NEW",
      },
    });

    const institute = await prisma.institute.findUnique({
      where: { id },
      select: { name: true },
    });

    await prisma.adminNotification.create({
      data: {
        type: "NEW_INSTITUTE_ENQUIRY",
        title: "New Mobile App Enquiry",
        message: `${name} (${phone}) sent an enquiry via Mobile App for institute ID: ${id} and name ${institute?.name}`,
      },
    });

    // Fire CRM Webhooks
    triggerCRMWebhooks(id, "ENQUIRY", {
      enquiryId: enquiry.id,
      name,
      phone,
      email,
      message,
      source: "AcademyFind App",
    });

    return NextResponse.json({ success: true, data: enquiry });
  } catch (error: any) {
    console.error("Mobile Enquiry Error:", error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
