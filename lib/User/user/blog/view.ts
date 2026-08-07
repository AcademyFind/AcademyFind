"use server";

import { prisma } from "@/lib/prisma";
import { cookies, headers } from "next/headers";
import { getCachedSession } from "@/lib/auth/session";

export async function incrementBlogViewCount(postId: string) {
    try {
        if (!postId) {
            return;
        }

        const cookieStore = await cookies();
        const headerList = await headers();
        
        const cookieName = `viewed_post_${postId}`;
        const hasViewed = cookieStore.get(cookieName);

        if (hasViewed) {
            return; // Prevent duplicate counts from rapid refreshes
        }

        const session = await getCachedSession();
        const userId = session?.user?.id;
        
        const userAgent = headerList.get("user-agent") || "";
        const ip = headerList.get("x-forwarded-for") || headerList.get("x-real-ip") || "unknown";
        
        const isMobile = /mobile/i.test(userAgent);
        const deviceType = isMobile ? "Mobile" : "Desktop";

        // 🚀 PROPER FIX: Use updateMany because 'status' is not unique
        await prisma.blogPost.updateMany({
            where: { id: postId, status: "PUBLISHED" },
            data: {
                viewCount: {
                    increment: 1
                }
            }
        });
        
        // Create the actual BlogView record for analytics
        await prisma.blogView.create({
            data: {
                postId,
                userId,
                deviceType,
                ipHash: ip !== "unknown" ? ip : undefined,
            }
        });

        // Set viewed cookie with 24 hours expiry
        cookieStore.set(cookieName, "true", {
            maxAge: 60 * 60 * 24, // 24 hours
            httpOnly: true,
            path: "/",
            sameSite: "lax",
        });
    } catch (error) {
        console.error("Error incrementing blog view count:", error);
    }
};
