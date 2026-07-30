import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncBlogPostToMeili } from "@/lib/User/user/blog/meilisync";
import { creditWallet } from "@/lib/wallet/credit";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    const now = new Date();

    const postsToPublish = await prisma.blogPost.findMany({
      where: {
        status: "SCHEDULED",
        scheduledAt: {
          lte: now,
        },
      },
      select: {
        id: true,
        authorProfile: { select: { userId: true } },
      },
    });

    if (postsToPublish.length === 0) {
      return NextResponse.json({ success: true, message: "No posts to publish." });
    }

    for (const post of postsToPublish) {
      await prisma.blogPost.update({
        where: { id: post.id },
        data: {
          status: "PUBLISHED",
          publishedAt: now,
        },
      });

      // Sync to Meilisearch
      await syncBlogPostToMeili(post.id);

      // Reward the author if applicable
      if (post.authorProfile?.userId) {
        await creditWallet(
          post.authorProfile.userId,
          5,
          "BLOG_POST",
          "Scheduled blog post published",
          post.id
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully published ${postsToPublish.length} scheduled posts.`,
    });
  } catch (error) {
    console.error("Error in publish-scheduled-blogs cron:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
