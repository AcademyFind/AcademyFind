"use server"

import { prisma } from "@/lib/prisma";
// @ts-ignore
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";

export async function trackAdAnalytics(advertisementId: string, actionType: "VIEW" | "CLICK", pageUrl?: string) {
    try {
        console.log(`[ANALYTICS] Tracking ${actionType} for ad ${advertisementId} by user on page ${pageUrl}`);
        
        let session = null;
        try {
            session = await auth.api.getSession({
                headers: await headers()
            });
        } catch (err) {
            console.log("[ANALYTICS] getSession failed, assuming anonymous", err);
        }

        if (session?.user?.role === "ADMIN") return { success: true };
        if (pageUrl?.includes('/af-ass-manage/')) return { success: true };

        const userId = session?.user?.id || null;

        if (userId) {
            // Check if this user already performed this action on this ad
            const existing = await prisma.advertisementAnalytic.findFirst({
                where: { advertisementId, actionType, userId }
            });

            if (existing) {
                await prisma.advertisementAnalytic.update({
                    where: { id: existing.id },
                    data: { count: { increment: 1 }, updatedAt: new Date() }
                });
            } else {
                await prisma.advertisementAnalytic.create({
                    data: { advertisementId, actionType, pageUrl, userId }
                });
            }
        }

        // Increment the denormalized counter on the Advertisement model
        if (actionType === "VIEW") {
            await prisma.advertisement.update({
                where: { id: advertisementId },
                data: { views: { increment: 1 } }
            });
        } else if (actionType === "CLICK") {
            await prisma.advertisement.update({
                where: { id: advertisementId },
                data: { clicks: { increment: 1 } }
            });
        }

        return { success: true };
    } catch (error: any) {
        console.error("[ANALYTICS ERROR] Failed to track ad analytics:", error?.message || error);
        return { success: false };
    }
}

export async function fetchAdAnalytics(advertisementId: string) {
    try {
        const analytics = await prisma.advertisementAnalytic.findMany({
            where: { 
                advertisementId,
                userId: { not: null }
            },
            orderBy: { updatedAt: "desc" },
            // Only fetch first 100 to avoid massive lists, or we can paginate later.
            take: 100,
        });
        
        // Since userId is not a relation in schema, we fetch the users manually for those who have a userId.
        const userIds = [...new Set(analytics.map(a => a.userId).filter(Boolean))] as string[];
        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true, username: true, email: true, image: true }
        });
        const userMap = new Map(users.map(u => [u.id, u]));
        
        return analytics.map(a => ({
            ...a,
            user: a.userId ? userMap.get(a.userId) : null
        }));
    } catch (error) {
        console.error("Failed to fetch ad analytics:", error);
        return [];
    }
}
