import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { auth } from "@/lib/auth/auth";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { message, sender } = body;

    if (!message || !sender) {
      return NextResponse.json({ error: "Message and sender are required." }, { status: 400 });
    }

    if (sender !== "ADMIN" && sender !== "USER") {
      return NextResponse.json({ error: "Invalid sender type." }, { status: 400 });
    }

    // Verify contact message exists
    const contactMessage = await prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!contactMessage) {
      return NextResponse.json({ error: "Contact message not found." }, { status: 404 });
    }

    // Auth check for ADMIN
    const session = await auth.api.getSession({ headers: req.headers });
    if (sender === "ADMIN" && session?.user?.role !== "SUPER_ADMIN" && session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // Create reply
    const reply = await prisma.contactReply.create({
      data: {
        contactMessageId: id,
        sender,
        message,
      },
    });

    // Update ContactMessage updatedAt and isRead status
    await prisma.contactMessage.update({
      where: { id },
      data: {
        updatedAt: new Date(),
        isRead: sender === "USER" ? false : true, // Mark unread for admin if user replied
      }
    });

    // If Admin replied, send email to user
    if (sender === "ADMIN" && contactMessage.email) {
      try {
        await resend.emails.send({
          from: "AcademyFind <no-reply@academyfind.com>",
          to: contactMessage.email,
          subject: `Reply to your inquiry: ${contactMessage.subject || 'Support Ticket'}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <h2 style="color: #f59e0b;">Hello ${contactMessage.name},</h2>
                <p>Our team has replied to your message:</p>
                <div style="margin: 20px 0; padding: 20px; background-color: #fcf9f2; border-left: 4px solid #f59e0b; border-radius: 4px; white-space: pre-wrap;">${message}</div>
                <p>You can view the full conversation and reply back using the secure link below:</p>
                <a href="https://academyfind.com/support/${id}" style="display: inline-block; background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">View Ticket & Reply</a>
                <br/><br/>
                <p>Best Regards,<br/><strong>The AcademyFind Support Team</strong></p>
            </div>
          `
        });
      } catch (err) {
        console.error("Failed to send reply email:", err);
      }
    }

    // If User replied, create Admin Notification
    if (sender === "USER") {
      // Create admin notification directly
      try {
        await prisma.adminNotification.create({
          data: {
            title: `New reply from ${contactMessage.name}`,
            message: `User replied to support ticket: ${contactMessage.subject || 'No Subject'}.`,
            type: "INSTITUTE_REQUEST", // Using existing type for now
            actionUrl: `/af-ass-manage/contactmessages/${id}`,
            referenceId: contactMessage.userId || (session?.user?.id ?? "system"), 
          }
        });
      } catch (err) {
        console.error("Failed to create admin notification:", err);
      }
    }

    return NextResponse.json({ success: true, reply });
  } catch (error: any) {
    console.error("Error creating contact reply:", error);
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
