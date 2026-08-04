"use server"

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export async function submitContactForm(formData: FormData) {
    try {
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        let phone = formData.get("phone") as string;
        const subject = formData.get("subject") as string;
        const message = formData.get("message") as string;

        // Basic Validation
        if (!name || !email || !message || !phone) {
            return { success: false, error: "Please fill in all required fields." };
        }

        phone = phone.replace(/[-+()\s]/g, ''); // Extra spaces ya symbols hata do
        const phoneRegex = /^[6-9]\d{9}$/; 
        if (!phoneRegex.test(phone)) {
            return { success: false, error: "Please enter a valid 10-digit mobile number." };
        }
        // Link to user if logged in
        const headersList = await headers();
        const session = await auth.api.getSession({ headers: headersList });
        const userId = session?.user?.id || null;

        // Save to Database
        await prisma.contactMessage.create({
            data: { name, email, phone, subject, message, userId }
        });

        return { 
            success: true, 
            message: "Message sent successfully! Our team will contact you soon." 
        };
    } catch (error) {
        console.error("Contact Form Error:", error);
        return { success: false, error: "Failed to send message. Please try again." };
    }
}