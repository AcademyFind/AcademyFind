"use server"

import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAdSettings() {
    try {
        const rateSetting = await prisma.systemSetting.findUnique({ where: { key: "ad_price" } });
        const maxImagesSetting = await prisma.systemSetting.findUnique({ where: { key: "ad_max_images" } });

        return {
            rate: rateSetting ? parseInt(rateSetting.value, 10) : 199,
            maxImages: maxImagesSetting ? parseInt(maxImagesSetting.value, 10) : 4,
        };
    } catch (error) {
        console.error("Failed to fetch ad settings:", error);
        return { rate: 199, maxImages: 4 };
    }
}

export async function updateAdSettings(rate: number, maxImages: number) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (session?.user?.role !== "ADMIN") {
            return { success: false, error: "Unauthorized" };
        }

        if (rate < 0 || maxImages < 1 || maxImages > 10) {
            return { success: false, error: "Invalid values" };
        }

        await prisma.$transaction([
            prisma.systemSetting.upsert({
                where: { key: "ad_price" },
                update: { value: rate.toString() },
                create: { key: "ad_price", value: rate.toString() },
            }),
            prisma.systemSetting.upsert({
                where: { key: "ad_max_images" },
                update: { value: maxImages.toString() },
                create: { key: "ad_max_images", value: maxImages.toString() },
            })
        ]);

        revalidatePath("/af-ass-manage/advertisements");
        revalidatePath("/user/advertisements");
        revalidatePath("/advertise");

        return { success: true };
    } catch (error) {
        console.error("Failed to update ad settings:", error);
        return { success: false, error: "Internal server error" };
    }
}

