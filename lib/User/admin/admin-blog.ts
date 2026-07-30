"use server";

import { revalidatePath } from "next/cache";
import slugify from "slugify";
import { z } from "zod";
import { creditWallet } from "@/lib/wallet/credit";

import type { BlogEditorSaveInput } from "@/components/blog/editor/types";
import { getCachedSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { syncBlogPostToMeili, deleteBlogPostFromMeili } from "@/lib/User/user/blog/meilisync";

const adminBlogSchema = z.object({
  id: z.string().min(1).optional(),
  title: z.string().trim().min(3).max(180),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  excerpt: z.string().trim().max(500),
  contentHtml: z.string().trim().min(1),
  coverImage: z.union([z.literal(""), z.url()]),
  categoryId: z.string(),
  brandId: z.string().min(1, "Select a brand."),
  tagNames: z.array(z.string().trim().min(1).max(50)).max(20),
  metaTitle: z.string().trim().max(70),
  metaDescription: z.string().trim().max(180),
  focusKeyword: z.string().trim().max(200),
  faqs: z
    .array(
      z.object({
        question: z.string().trim().min(1).max(300),
        answer: z.string().trim().min(1).max(2000),
      }),
    )
    .max(20),
  intent: z.enum(["draft", "publish"]),
  admin: z.object({
    status: z.enum([
      "DRAFT",
      "PENDING_REVIEW",
      "SCHEDULED",
      "PUBLISHED",
      "REJECTED",
      "ARCHIVED",
    ]),
    visibility: z.enum(["PUBLIC", "UNLISTED", "PRIVATE"]),
    canonicalUrl: z.union([z.literal(""), z.url()]),
    robotsIndex: z.boolean(),
    robotsFollow: z.boolean(),
    isFeatured: z.boolean(),
    featuredOrder: z.number().int().min(0).max(9999),
    isPinned: z.boolean(),
    allowComments: z.boolean(),
    scheduledAt: z.string(),
    rejectionReason: z.string().trim().max(1000),
  }),
});

export type AdminBlogResult =
  | { success: true; id: string; slug: string }
  | { success: false; error: string };

async function requireAdmin() {
  const session = await getCachedSession();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("ADMIN_REQUIRED");
  }
  return session.user;
}

export async function saveAdminBlogPost(
  input: BlogEditorSaveInput,
): Promise<AdminBlogResult> {
  try {
    const adminUser = await requireAdmin();
    const parsed = adminBlogSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Check the post details.",
      };
    }

    const value = parsed.data;
    const duplicateSlug = await prisma.blogPost.findFirst({
      where: {
        slug: value.slug,
        ...(value.id ? { id: { not: value.id } } : {}),
      },
      select: { id: true },
    });

    if (duplicateSlug) {
      return { success: false, error: "This slug is already in use." };
    }

    const brand = await prisma.blogBrand.findFirst({
      where: { id: value.brandId, isActive: true },
      select: { id: true },
    });
    if (!brand) {
      return { success: false, error: "Select an active blog brand." };
    }

    const requestedStatus =
      value.intent === "publish" ? "PUBLISHED" : value.admin.status;
    if (requestedStatus === "SCHEDULED" && !value.admin.scheduledAt) {
      return { success: false, error: "Choose a publishing date and time." };
    }

    const uniqueTagNames = [
      ...new Map(
        value.tagNames.map((name: string) => [name.toLocaleLowerCase(), name.trim()]),
      ).values(),
    ];

    const existing = value.id
      ? await prisma.blogPost.findUnique({
          where: { id: value.id },
          select: { 
            id: true, 
            authorProfileId: true, 
            publishedAt: true, 
            status: true,
            authorProfile: { select: { userId: true } }
          },
        })
      : null;

    if (value.id && !existing) {
      return { success: false, error: "The post no longer exists." };
    }

    const publishedAt =
      requestedStatus === "PUBLISHED"
        ? (existing?.publishedAt ?? new Date())
        : null;
    const scheduledAt =
      requestedStatus === "SCHEDULED"
        ? new Date(value.admin.scheduledAt)
        : null;

    const sharedData = {
      title: value.title,
      slug: value.slug,
      excerpt: value.excerpt || null,
      contentHtml: value.contentHtml,
      contentMarkdown: value.contentHtml,
      coverImage: value.coverImage || null,
      coverImageAlt: value.title,
      categoryId: value.categoryId || null,
      brandId: brand.id,
      metaTitle: value.metaTitle || null,
      metaDescription: value.metaDescription || null,
      focusKeyword: value.focusKeyword || null,
      canonicalUrl: value.admin.canonicalUrl || null,
      robotsIndex: value.admin.robotsIndex,
      robotsFollow: value.admin.robotsFollow,
      status: requestedStatus,
      visibility: value.admin.visibility,
      isFeatured: value.admin.isFeatured,
      featuredOrder: value.admin.featuredOrder,
      isPinned: value.admin.isPinned,
      allowComments: value.admin.allowComments,
      scheduledAt,
      rejectionReason:
        requestedStatus === "REJECTED"
          ? value.admin.rejectionReason || null
          : null,
      publishedAt,
      lastEditedById: adminUser.id,
      ...(requestedStatus === "PUBLISHED"
        ? { publishedById: adminUser.id }
        : {}),
      ...(requestedStatus === "PUBLISHED" ||
      requestedStatus === "REJECTED"
        ? { reviewedById: adminUser.id, reviewedAt: new Date() }
        : {}),
    } as const;

    const post = await prisma.$transaction(async (tx) => {
      const tags = await Promise.all(
        uniqueTagNames.map((name: string) => {
          const slug = slugify(name, { lower: true, strict: true, trim: true });
          if (!slug) throw new Error(`Invalid tag: ${name}`);

          return tx.blogTag.upsert({
            where: { slug },
            create: { name, slug },
            update: {},
            select: { id: true },
          });
        }),
      );

      if (existing) {
        return tx.blogPost.update({
          where: { id: existing.id },
          data: {
            ...sharedData,
            tags: {
              deleteMany: {},
              create: tags.map((tag: { id: string }) => ({ tagId: tag.id })),
            },
            faqs: {
              deleteMany: {},
              create: value.faqs.map((faq: { question: string; answer: string }, order: number) => ({ ...faq, order })),
            },
          },
          select: { id: true, slug: true },
        });
      }

      return tx.blogPost.create({
        data: {
          ...sharedData,
          authorProfileId: null,
          tags: {
            create: tags.map((tag: { id: string }) => ({ tagId: tag.id })),
          },
          faqs: {
            create: value.faqs.map((faq: { question: string; answer: string }, order: number) => ({ ...faq, order })),
          },
        },
        select: { id: true, slug: true },
      });
    });

    // Sync post to Meilisearch
    await syncBlogPostToMeili(post.id);

    // 🚀 Reward 5 AFC if post is newly published
    if (requestedStatus === "PUBLISHED" && existing?.status !== "PUBLISHED" && existing?.authorProfile?.userId) {
      await creditWallet(existing.authorProfile.userId, 5, "BLOG_POST", "Blog post published", post.id);
    }

    revalidatePath("/blog");
    revalidatePath(`/blog/${post.slug}`);
    revalidatePath("/af-ass-manage/blog");
    revalidatePath("/blog/search");
    return { success: true, ...post };
  } catch (error) {
    console.error("Unable to save admin blog post:", error);
    return {
      success: false,
      error:
        error instanceof Error && error.message === "ADMIN_REQUIRED"
          ? "Administrator access is required."
          : "The post could not be saved. Please try again.",
    };
  }
}

export async function archiveAdminBlogPost(postId: string) {
  try {
    const adminUser = await requireAdmin();
    await prisma.blogPost.update({
      where: { id: postId },
      data: {
        status: "ARCHIVED",
        lastEditedById: adminUser.id,
      },
    });
    revalidatePath("/af-ass-manage/blog");
    return { success: true };
  } catch {
    return { success: false, error: "Unable to archive this post." };
  }
}

export async function unarchiveAdminBlogPost(postId: string) {
  try {
    const adminUser = await requireAdmin();
    await prisma.blogPost.update({
      where: { id: postId },
      data: {
        status: "DRAFT",
        lastEditedById: adminUser.id,
      },
    });
    revalidatePath("/af-ass-manage/blog");
    return { success: true };
  } catch {
    return { success: false, error: "Unable to unarchive this post." };
  }
}

export async function deleteAdminBlogPost(postId: string) {
  try {
    await requireAdmin();
    // Fetch slug for path revalidation
    const post = await prisma.blogPost.findUnique({
      where: { id: postId },
      select: { slug: true }
    });

    await prisma.blogPost.delete({ where: { id: postId } });

    // Sync to Meilisearch
    await deleteBlogPostFromMeili(postId);

    revalidatePath("/blog");
    revalidatePath("/blog/search");
    if (post?.slug) {
      revalidatePath(`/blog/${post.slug}`);
    }
    revalidatePath("/af-ass-manage/blog");
    return { success: true };
  } catch (error) {
    console.error("Error deleting admin blog post:", error);
    return { success: false, error: "Unable to delete this post." };
  }
}

export async function updateAdminBlogStatus(postId: string, status: "PUBLISHED" | "REJECTED") {
  try {
    const adminUser = await requireAdmin();
    const existing = await prisma.blogPost.findUnique({
      where: { id: postId },
      select: { authorProfile: { select: { userId: true } }, status: true }
    });

    if (!existing) {
      return { success: false, error: "Post not found." };
    }

    const post = await prisma.blogPost.update({
      where: { id: postId },
      data: {
        status,
        lastEditedById: adminUser.id,
        reviewedById: adminUser.id,
        reviewedAt: new Date(),
        ...(status === "PUBLISHED" ? { publishedById: adminUser.id, publishedAt: new Date() } : {})
      },
      select: { id: true, slug: true }
    });

    if (status === "PUBLISHED") {
      await syncBlogPostToMeili(postId);
      // Reward if it was not already published
      if (existing.status !== "PUBLISHED" && existing.authorProfile?.userId) {
        await creditWallet(existing.authorProfile.userId, 5, "BLOG_POST", "Blog post published", postId);
      }
    } else if (status === "REJECTED") {
      await deleteBlogPostFromMeili(postId);
    }

    revalidatePath("/blog");
    revalidatePath(`/blog/${post.slug}`);
    revalidatePath("/af-ass-manage/blog");
    revalidatePath("/blog/search");
    return { success: true };
  } catch (error) {
    console.error("Error updating admin blog status:", error);
    return { success: false, error: "Unable to update status." };
  }
}
