import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/generated/prisma";
import { getAuthUser } from "@/lib/User/Auth/Auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: reviewId } = params;
    const body = await req.json();
    const { content } = body;

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "Reply content is required" }, { status: 400 });
    }

    // Ensure review exists
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Create the reply (Pending by default)
    const reply = await prisma.reviewReply.create({
      data: {
        reviewId,
        userId: user.id,
        content: content.trim(),
        status: "PENDING",
      },
    });

    return NextResponse.json({ 
        success: true, 
        message: "Reply submitted and is pending admin approval.",
        reply 
    }, { status: 201 });

  } catch (error) {
    console.error("[REVIEW_REPLY_POST]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
