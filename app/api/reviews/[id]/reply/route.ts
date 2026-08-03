import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id: reviewId } = resolvedParams;
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
        userId: session.user.id,
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
