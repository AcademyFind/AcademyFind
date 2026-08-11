"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export async function updateAdvertisementStatus(
    id: string, 
    action: "APPROVED" | "REJECTED" | "VISIBLE" | "HIDDEN" | "DELETED"
) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (session?.user?.role !== "ADMIN") {
            return { success: false, error: "Unauthorized" };
        }

        const ad = await prisma.advertisement.findUnique({ where: { id } });
        if (!ad) return { success: false, error: "Not found" };

        let updateData: any = {};

        if (action === "APPROVED") {
            const startDate = new Date();
            const expiryDate = new Date();
            expiryDate.setDate(startDate.getDate() + 30); // 30 days validity

            updateData = {
                status: "APPROVED",
                visibility: "VISIBLE",
                startDate,
                expiryDate
            };
        } else if (action === "REJECTED") {
            updateData = { status: "REJECTED" };
        } else if (action === "VISIBLE" || action === "HIDDEN" || action === "DELETED") {
            updateData = { visibility: action };
            if (action === "DELETED") {
                updateData.status = "EXPIRED"; // logically mark as expired/deleted
            }
        }

        await prisma.advertisement.update({
            where: { id },
            data: updateData
        });

        revalidatePath("/af-ass-manage/advertisements");
        revalidatePath("/user/dashboard");
        revalidatePath("/"); // revalidate homepage where ads might be shown

        return { success: true };
    } catch (error) {
        console.error("Failed to update advertisement status:", error);
        return { success: false, error: "Internal Server Error" };
    }
}

export async function approveAdvertisementEdit(id: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (session?.user?.role !== "ADMIN") {
            return { success: false, error: "Unauthorized" };
        }

        const ad = await prisma.advertisement.findUnique({ where: { id } });
        if (!ad || !ad.editRequestData) return { success: false, error: "Not found or no pending edit" };

        const pendingEdit: any = ad.editRequestData;
        
        await prisma.advertisement.update({
            where: { id },
            data: {
                title: pendingEdit.title,
                description: pendingEdit.description,
                linkUrl: pendingEdit.linkUrl,
                images: pendingEdit.images,
                editRequestData: null as any
            }
        });

        revalidatePath(`/af-ass-manage/advertisements/${id}`);
        revalidatePath(`/user/advertisements/${id}`);
        revalidatePath("/");

        return { success: true };
    } catch (error) {
        console.error("Failed to approve advertisement edit:", error);
        return { success: false, error: "Internal Server Error" };
    }
}

export async function rejectAdvertisementEdit(id: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (session?.user?.role !== "ADMIN") {
            return { success: false, error: "Unauthorized" };
        }

        await prisma.advertisement.update({
            where: { id },
            data: {
                editRequestData: null as any
            }
        });

        revalidatePath(`/af-ass-manage/advertisements/${id}`);
        revalidatePath(`/user/advertisements/${id}`);

        return { success: true };
    } catch (error) {
        console.error("Failed to reject advertisement edit:", error);
        return { success: false, error: "Internal Server Error" };
    }
}

export async function adminForceEditAdvertisement(adId: string, formData: FormData) {
    try {
        const ad = await prisma.advertisement.findUnique({ where: { id: adId } });
        if (!ad) return { success: false, error: "Advertisement not found." };

        const title = formData.get("title") as string;
        const description = formData.get("description") as string | null;
        const linkUrl = formData.get("linkUrl") as string | null;
        
        // Parse existing images
        const existingImagesJson = formData.get("existingImages") as string;
        let existingImages: string[] = [];
        if (existingImagesJson) {
            try {
                existingImages = JSON.parse(existingImagesJson);
            } catch (e) {
                existingImages = [];
            }
        }

        // We need to upload new images if any.
        // However, we don't have access to the uploadImageToCloudinary helper directly here as it's in actions.ts.
        // We can just rely on the existing images or copy the helper here.
        // It's cleaner to reuse the helper, but since it's not exported from actions.ts, I will duplicate it here for the admin action.
        
        const newImageUrls: string[] = [];
        for (let i = 0; i < 4; i++) {
            const imgFile = formData.get(`newImage_${i}`) as File | null;
            if (imgFile && imgFile.size > 0) {
                const bytes = await imgFile.arrayBuffer();
                const buffer = Buffer.from(bytes);
                const dataUri = `data:${imgFile.type};base64,${buffer.toString('base64')}`;
                
                const { v2: cloudinary } = await import("cloudinary");
                cloudinary.config({
                  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
                  api_key: process.env.CLOUDINARY_API_KEY,
                  api_secret: process.env.CLOUDINARY_API_SECRET,
                });
                
                const uploadResult = await cloudinary.uploader.upload(dataUri, {
                    folder: `academyfind/advertisements/creatives`,
                    public_id: `admin-edit-${ad.id}-${Date.now()}-${i}`,
                    overwrite: true,
                    format: "webp",
                });
                newImageUrls.push(uploadResult.secure_url);
            }
        }

        const finalImages = [...existingImages, ...newImageUrls].slice(0, 4);

        if (finalImages.length === 0) {
            return { success: false, error: "At least one advertisement image is required." };
        }

        await prisma.advertisement.update({
            where: { id: adId },
            data: {
                title,
                description: description || null,
                linkUrl: linkUrl || null,
                images: finalImages
            }
        });

        // Notify user about the admin edit
        await prisma.userNotification.create({
            data: {
                userId: ad.userId,
                type: "SYSTEM",
                title: "Advertisement Updated by Admin",
                body: `Your advertisement "${title}" has been updated by an administrator.`,
                entityId: ad.id
            }
        });

        revalidatePath(`/af-ass-manage/advertisements/${adId}`);
        revalidatePath(`/user/advertisements/${adId}`);
        revalidatePath("/");
        
        return { success: true };
    } catch (error: any) {
        console.error("Admin force edit error:", error);
        return { success: false, error: error.message || "Internal Server Error" };
    }
}
