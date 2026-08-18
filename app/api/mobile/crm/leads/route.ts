import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/getSession';

export async function GET() {
  try {
    const session = await getSession();

    // In a real app, verify if the user has MANAGER/ADMIN role
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch Recent CRM Leads (Institute Enquiries)
    const recentLeads = await prisma.instituteEnquiry.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        institute: {
          select: { name: true }
        }
      }
    });

    // Basic stats for the dashboard
    const totalLeads = await prisma.instituteEnquiry.count();
    const newLeads = await prisma.instituteEnquiry.count({ where: { status: 'NEW' } });

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalLeads,
          newLeads,
          revenue: '₹45k', // Placeholder for demo
          conversionRate: '+14%'
        },
        recentLeads: recentLeads.map((lead: any) => ({
          id: lead.id,
          name: lead.name,
          course: lead.institute?.name || 'General Inquiry',
          status: lead.status,
          date: lead.createdAt
        }))
      }
    });
  } catch (error: any) {
    console.error('Mobile CRM API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
