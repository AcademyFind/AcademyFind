import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AdminInstituteDashboardClient } from "./AdminInstituteDashboardClient";

export default async function AdminInstituteDashboard({ params }: { params: Promise<{ instituteId: string }> }) {
    const { instituteId } = await params;

    const institute = await prisma.institute.findUnique({
        where: { id: instituteId },
        include: {
            city: true,
            categories: { include: { category: true } },
            managers: { include: { user: true } },
            _count: {
                select: {
                    managers: true,
                    reviews: true,
                    batches: true,
                    studentRecords: true,
                    teacherRecords: true,
                    enquiries: true,
                    claims: true,
                    viewHistory: true,
                    shortlistedBy: true,
                    dailyViews: true,
                    achievements: true,
                    faqs: true,
                    crmIntegrations: true
                }
            },
            viewHistory: { take: 5, orderBy: { viewedAt: 'desc' }, include: { user: true } },
            shortlistedBy: { take: 5, orderBy: { createdAt: 'desc' }, include: { user: true } },
            dailyViews: { take: 30, orderBy: { date: 'asc' } },
            crmIntegrations: true,
            teacherRecords: {
                include: {
                    membership: { include: { user: true } }
                }
            },
            batches: true,
            faqs: true,
            achievements: true,
            notablepersons: true,
        }
    });

    if (!institute) return notFound();

    return (
        <AdminInstituteDashboardClient institute={institute} />
    );
}
