"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function toggleInstituteStatus(
    instituteId: string, 
    currentValue: boolean, 
    field: 'isActive' | 'isPublished'
) {
    try {
        // Dynamic update based on which button was clicked
        await prisma.institute.update({
            where: { id: instituteId },
            data: {
                [field]: !currentValue // Agar true tha to false kardo, false tha to true
            }
        });

        revalidatePath('/af-ass-manage/institutes'); // Admin page refresh karne ke liye
        revalidatePath('/', 'layout'); // Clear public cache to reflect status changes
        
        return { 
            success: true, 
            message: `Profile is now ${!currentValue ? (field === 'isActive' ? 'Active' : 'Published') : (field === 'isActive' ? 'Inactive' : 'Hidden')}` 
        }
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to update status" }
    }
}