"use server"

import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import { revalidatePath } from "next/cache";
import { getAdSettings } from "./admin-settings-actions";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadImageToCloudinary(file: File, folderName: string, idPrefix: string) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const dataUri = `data:${file.type};base64,${buffer.toString('base64')}`;

    const uploadResult = await cloudinary.uploader.upload(dataUri, {
        folder: `academyfind/advertisements/${folderName}`,
        public_id: `${idPrefix}-${Date.now()}`,
        overwrite: true,
        format: "webp",
    });

    return uploadResult.secure_url;
}

export async function submitAdvertisement(formData: FormData) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return { success: false, error: "Unauthorized. Please log in." };
        }

        const title = formData.get("title") as string;
        const description = formData.get("description") as string | null;
        const linkUrl = formData.get("linkUrl") as string | null;
        const utrNumber = formData.get("utrNumber") as string;
        const paymentScreenshotFile = formData.get("paymentScreenshot") as File;

        if (!title || !utrNumber || !paymentScreenshotFile) {
            return { success: false, error: "Missing required fields." };
        }

        // Upload payment screenshot
        const paymentScreenshotUrl = await uploadImageToCloudinary(
            paymentScreenshotFile,
            "payments",
            `user-${session.user.id}-payment`
        );

        // Fetch dynamic settings
        const settings = await getAdSettings();
        const MAX_IMAGES = settings.maxImages;

        // Process up to MAX_IMAGES advertisement images
        const imageUrls: string[] = [];
        for (let i = 0; i < MAX_IMAGES; i++) {
            const imgFile = formData.get(`image_${i}`) as File | null;
            if (imgFile && imgFile.size > 0) {
                const url = await uploadImageToCloudinary(
                    imgFile,
                    "creatives",
                    `user-${session.user.id}-ad-${i}`
                );
                imageUrls.push(url);
            }
        }

        if (imageUrls.length === 0) {
            return { success: false, error: "At least one advertisement image is required." };
        }

        // Save to DB
        const newAd = await prisma.advertisement.create({
            data: {
                userId: session.user.id,
                title,
                description: description || null,
                linkUrl: linkUrl || null,
                images: imageUrls,
                paymentScreenshot: paymentScreenshotUrl,
                utrNumber,
                status: "PENDING",
                visibility: "VISIBLE",
                pricePaid: settings.rate,
            }
        });

        // Generate Admin Notification
        await prisma.adminNotification.create({
            data: {
                type: "ADVERTISEMENT_SUBMITTED",
                title: "New Advertisement Submitted",
                message: `${session.user.name || 'A user'} has submitted a new advertisement: ${title}.`,
                referenceId: newAd.id,
                actionUrl: "/af-ass-manage/advertisements",
                userId: session.user.id,
            }
        });

        // Add revalidatePath if you want to update the user dashboard instantly
        revalidatePath("/user/dashboard");

        return { success: true };
    } catch (error: any) {
        console.error("Advertisement submission error:", error);
        return { success: false, error: error.message || "Internal Server Error" };
    }
}

export async function requestAdvertisementEdit(adId: string, formData: FormData) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return { success: false, error: "Unauthorized. Please log in." };
        }

        const ad = await prisma.advertisement.findUnique({
            where: { id: adId, userId: session.user.id }
        });

        if (!ad) {
            return { success: false, error: "Advertisement not found or unauthorized." };
        }

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

        // Upload new images
        const newImageUrls: string[] = [];
        for (let i = 0; i < 4; i++) {
            const imgFile = formData.get(`newImage_${i}`) as File | null;
            if (imgFile && imgFile.size > 0) {
                const url = await uploadImageToCloudinary(
                    imgFile,
                    "creatives",
                    `user-${session.user.id}-ad-edit-${i}`
                );
                newImageUrls.push(url);
            }
        }

        const finalImages = [...existingImages, ...newImageUrls].slice(0, 4);

        if (finalImages.length === 0) {
            return { success: false, error: "At least one advertisement image is required." };
        }

        const editRequestData = {
            title,
            description: description || null,
            linkUrl: linkUrl || null,
            images: finalImages,
            requestedAt: new Date().toISOString()
        };

        await prisma.advertisement.update({
            where: { id: adId },
            data: {
                editRequestData: JSON.stringify(editRequestData)
            }
        });

        // Generate Admin Notification for Edit Request
        await prisma.adminNotification.create({
            data: {
                type: "ADVERTISEMENT_EDIT_REQUEST",
                title: "Advertisement Edit Requested",
                message: `${session.user.name || 'A user'} requested an edit for advertisement: ${title}.`,
                referenceId: ad.id,
                actionUrl: "/af-ass-manage/advertisements?filter=PENDING_EDIT",
                userId: session.user.id
            }
        });

        revalidatePath(`/user/advertisements/${adId}`);
        revalidatePath(`/af-ass-manage/advertisements/${adId}`);
        
        return { success: true };
    } catch (error: any) {
        console.error("Advertisement edit request error:", error);
        return { success: false, error: error.message || "Internal Server Error" };
    }
}
