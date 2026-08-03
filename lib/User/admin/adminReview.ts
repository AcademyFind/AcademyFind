"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { creditWallet } from "@/lib/wallet/credit";

// 1. Approve Review & Update Rating
export async function approveReview(reviewId: string, instituteId: string) {
  try {
    // 1. Review ko APPROVED mark karein
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: { status: "APPROVED" },
    });

    // Award +3 coins to the reviewer
    await creditWallet(updatedReview.userId, 3, "REVIEW", "Review approved", reviewId);

    // 2. Sirf "APPROVED" reviews ka average nikalenge
    const stats = await prisma.review.aggregate({
      where: { 
        instituteId: instituteId,
        status: "APPROVED" 
      },
      _avg: { rating: true },
      _count: { rating: true },
    });

    // 3. Institute ka final averageRating aur reviewCount update karein
    await prisma.institute.update({
      where: { id: instituteId },
      data: {
        averageRating: stats._avg.rating ?? 0,
        reviewCount: stats._count.rating,
      },
    });

    // 4. UI ko turant refresh karne ke liye
    revalidatePath("/af-ass-manage/reviews");
    revalidatePath("/", "layout"); // Clears the public institute pages cache
    return { success: true };

  } catch (error) {
    console.error("Approval Error:", error);
    return { success: false, error: "Failed to approve review" };
  }
}

// 2. Reject Review (Rating par koi asar nahi padega)
export async function rejectReview(reviewId: string) {
  try {
    await prisma.review.update({
      where: { id: reviewId },
      data: { status: "REJECTED" },
    });

    revalidatePath("/af-ass-manage/reviews");
    return { success: true };

  } catch (error) {
    console.error("Rejection Error:", error);
    return { success: false, error: "Failed to reject review" };
  }
}

// 3. Approve Reply
export async function approveReply(replyId: string) {
  try {
    await prisma.reviewReply.update({
      where: { id: replyId },
      data: { status: "APPROVED" },
    });

    revalidatePath("/af-ass-manage/reviews");
    revalidatePath("/", "layout"); // Clears the public institute pages cache
    return { success: true };
  } catch (error) {
    console.error("Reply Approval Error:", error);
    return { success: false, error: "Failed to approve reply" };
  }
}

// 4. Reject Reply
export async function rejectReply(replyId: string) {
  try {
    await prisma.reviewReply.update({
      where: { id: replyId },
      data: { status: "REJECTED" },
    });

    revalidatePath("/af-ass-manage/reviews");
    return { success: true };
  } catch (error) {
    console.error("Reply Rejection Error:", error);
    return { success: false, error: "Failed to reject reply" };
  }
}