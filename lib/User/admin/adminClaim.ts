"use server"

import { prisma } from "../../prisma"
import { revalidatePath } from "next/cache"
import {
    CLAIM_APPROVED_STATUS,
    CLAIM_REJECTED_STATUS,
    validateClaimTransition,
} from "@/lib/institutes/institute-workflow"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function getInstituteClaims () {
    try{
        const claims = await prisma.instituteClaim.findMany({
            include:{
                user:{select:{name:true,email:true,phone:true}},
                institute:{select:{name:true,address:true,phone:true}}
            },
            orderBy:{createdAt:"desc"}
        })
        return {success: true, data: claims}
    }catch(err){
        console.error("Error fetching claims:", err)
        return {success:false,error: "Failed to fetch claims"}
    }
}

export async function updateClaimStatus(claimId: string, status: "APPROVED" | "REJECTED"){
    try {
        const claim = await prisma.instituteClaim.findUnique({
            where:{id: claimId},
            include: { user: true, institute: true }
        })

        if(!claim){
            return { success: false, error: "Claim not found", statusCode: 404 }
        }

        const transition = validateClaimTransition(claim.status, status)
        if(!transition.success){
            return transition
        }

        if(status === "REJECTED"){
            await prisma.instituteClaim.update({
                where:{id:claimId},
                data:{status: CLAIM_REJECTED_STATUS}
            })
        }

        if(status === "APPROVED"){
            await prisma.$transaction([
                prisma.instituteClaim.update({
                    where: {id: claimId},
                    data:{status: CLAIM_APPROVED_STATUS}
                }),

                prisma.user.update({
                    where:{id:claim.userId},
                    data: {role: "INSTITUTE_MANAGER"}
                }),

                prisma.instituteManager.upsert({
                    where:{
                        userId_instituteId:{
                            userId:claim.userId,
                            instituteId:claim.instituteId
                        }
                    },
                    update:{},
                    create:{
                        userId:claim.userId,
                        instituteId:claim.instituteId
                    }
                }),

                prisma.instituteMembership.upsert({
                    where: {
                        userId_instituteId_role: {
                            userId: claim.userId,
                            instituteId: claim.instituteId,
                            role: 'MANAGER'
                        }
                    },
                    create: {
                        userId: claim.userId,
                        instituteId: claim.instituteId,
                        role: 'MANAGER',
                        status: 'ACTIVE',
                        joinedAt: new Date(),
                        isActive: true
                    },
                    update: {
                        status: 'ACTIVE',
                        joinedAt: new Date(),
                        isActive: true
                    }
                })
            ])

            // Also ensure institute channels exist and add manager
            const { ensureInstituteChannels } = await import("@/lib/chat/ensureInstituteChannels");
            await ensureInstituteChannels(claim.instituteId);
            
            const channels = await prisma.conversation.findMany({
                where: { instituteId: claim.instituteId, type: 'INSTITUTE' }
            });
            
            if (channels.length > 0) {
                await prisma.conversationParticipant.createMany({
                    data: channels.map((ch: any) => ({
                        conversationId: ch.id,
                        userId: claim.userId,
                        role: 'MANAGER' // manager is admin in channels
                    })),
                    skipDuplicates: true
                });
            }

            // Send Email to the new Manager
            if (claim.user?.email) {
                try {
                    const publicUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/institute/${claim.institute.id}-${claim.institute.slug || claim.institute.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
                    const managerUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/manager`;
                    
                    await resend.emails.send({
                        from: "AcademyFind <no-reply@academyfind.com>",
                        to: claim.user.email,
                        subject: "Your Institute Claim has been Approved! 🎉",
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
                                <div style="text-align: center; padding: 20px 0;">
                                    <h1 style="color: #f59e0b; margin: 0;">AcademyFind</h1>
                                </div>
                                <h2 style="color: #1e293b;">Congratulations, ${claim.user.name || 'Manager'}!</h2>
                                <p>Your claim request for <strong>${claim.institute.name}</strong> has been successfully approved by our admin team.</p>
                                <p>You now have full manager access to your institute's profile. You can update details, respond to reviews, and view traffic analytics.</p>
                                
                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="${managerUrl}" style="display: inline-block; background-color: #f59e0b; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Go to Manager Dashboard</a>
                                </div>

                                <p style="text-align: center;">
                                    <a href="${publicUrl}" style="color: #3b82f6; text-decoration: underline;">View your public profile page</a>
                                </p>
                                
                                <div style="margin: 40px 0; padding: 25px; background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border: 1px solid #fde68a; border-radius: 12px; text-align: center;">
                                    <h3 style="margin-top: 0; color: #b45309; font-size: 20px;">Unlock Your Institute's Full Potential 🚀</h3>
                                    <p style="color: #78350f; font-size: 15px; margin-bottom: 20px;">Want to get more students and stand out from the competition? Upgrade to our Premium plan to get exclusive benefits!</p>
                                    
                                    <ul style="text-align: left; color: #78350f; font-size: 14px; margin-bottom: 25px; list-style-type: none; padding-left: 0;">
                                        <li style="margin-bottom: 10px;">✅ <strong>Verified Badge:</strong> Build instant trust with parents and students</li>
                                        <li style="margin-bottom: 10px;">✅ <strong>Direct Leads:</strong> Students can message you directly</li>
                                        <li style="margin-bottom: 10px;">✅ <strong>Higher Ranking:</strong> Appear at the top of search results</li>
                                        <li style="margin-bottom: 10px;">✅ <strong>Student & Faculty Networking:</strong> Connect directly with potential students</li>
                                    </ul>

                                    <a href="${managerUrl}/billing" style="display: inline-block; background-color: #1e293b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">Upgrade to Premium Today</a>
                                </div>
                                
                                <p style="color: #64748b; font-size: 14px; margin-top: 30px;">If you have any questions or need assistance, feel free to reach out to our support team.</p>
                                <p style="color: #64748b; font-size: 14px;">Best Regards,<br/><strong>The AcademyFind Team</strong></p>
                            </div>
                        `
                    });
                    console.log(`Claim approval email sent to ${claim.user.email}`);
                } catch (emailError) {
                    console.error("Failed to send claim approval email:", emailError);
                }
            }
        }
        revalidatePath("/af-ass-manage/claims")
        revalidatePath("/af-ass-manage")
        revalidatePath("/profile")
        revalidatePath("/institute/[idSlug]")
        return { success: true, message: `Claim ${status.toLowerCase()} successfully!` }
    }catch(err){
        console.error("Error fetching claims:", err)
        return { success: false, error: "Something went wrong" }    }
}