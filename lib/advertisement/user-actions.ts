"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function renewAdvertisementRequest(id: string) {
    try {
        const ad = await prisma.advertisement.update({
            where: { id },
            data: { isRenewalRequest: true }
        });
        
        // Generate admin notification
        await prisma.adminNotification.create({
            data: {
                type: "ADVERTISEMENT_RENEW_REQUEST",
                title: "Advertisement Renewal Request",
                message: `User requested to renew advertisement: ${ad.title}`,
                referenceId: ad.id,
                actionUrl: `/af-ass-manage/advertisements/${ad.id}`,
                userId: ad.userId
            }
        });
        
        revalidatePath("/user/advertisements");
        revalidatePath("/af-ass-manage/advertisements");
        
        return { success: true };
    } catch (error) {
        console.error("Failed to renew ad:", error);
        return { success: false, error: "Internal Server Error" };
    }
}
