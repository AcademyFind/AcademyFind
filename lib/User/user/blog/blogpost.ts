"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function getBlogPostBySlug(slug: string) {
    try {
        const response = await prisma.blogPost.findUnique({
            where: {
                slug
            },
            include: {
                authorProfile: true,
                category: true,
                brand: true,
                tags: {
                    include: {
                        tag: true
                    }
                },
                faqs: {
                    orderBy: {
                        order: "asc"
                    }
                },
                relatedInstitute: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        logo: true,
                        city: {
                            select: {
                                name: true,
                                slug: true
                            }
                        },
                        coverImage: true,
                        address: true,
                        googleRating: true,
                        reviewCount: true
                    }
                },
                comments: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                image: true,
                            }
                        }
                    },
                    orderBy: {
                        createdAt: "desc"
                    }
                },
            }
        });
        return response;
    } catch (error) {
        console.error("Error fetching blog post:", error);
        return null;
    }
}

export async function getUserReaction(postId: string, userId: string) {
    try {
        if (!postId) {
            return false;
        }

        const response = await prisma.blogReaction.findUnique({
            where: {
                postId_userId: {
                    postId: postId,
                    userId: userId,
                }
            },
            select: {
                type: true
            }
        });
        return response?.type || null;
    } catch (error) {
        console.error("Error fetching user reaction:", error);
        return null;
    }
}

export async function getisBookmarked(postId: string, userId: string) {
    try {
        if (!postId) {
            return false;
        }
        const response = await prisma.blogBookmark.findUnique({
            where: {
                userId_postId: {
                    userId: userId,
                    postId: postId,
                }
            }
        });
        return !!response;
    } catch (error) {
        console.error("Error fetching bookmark status:", error);
        return false;
    }
}

export async function getRelatedInstitute(relatedInstituteId: string | null) {
    try {
        if (!relatedInstituteId) {
            return null;
        }
        const response = await prisma.institute.findUnique({
            where: {
                id: relatedInstituteId
            },
            select: {
                id: true,
                name: true,
                slug: true,
                logo: true,
                city: {
                    select: {
                        name: true,
                        slug: true
                    }
                },
                coverImage: true,
                address: true,
                googleRating: true,
                reviewCount: true,
            }
        });
        return response;
    } catch (error) {
        console.error("Error fetching related institutes:", error);
        return null;
    }
}

export async function getRelatedPosts(postId: string, categoryId: string) {
    try {
        if (!postId || !categoryId) {
            return [];
        }
        const response = await prisma.blogPost.findMany({
            where: {
                status: "PUBLISHED",
                id: {
                    not: postId
                },
                categoryId: categoryId
            },
            include: {
                authorProfile: true,
                category: true,
                brand: true,
            },
            orderBy: {
                createdAt: "desc"
            },
            take: 3
        });
        return response;
    } catch (error) {
        console.error("Error fetching related posts:", error);
        return [];
    }
}

export async function incrementBlogViewCount(postId: string) {
    try {
        if (!postId) {
            return;
        }

        const cookieStore = await cookies();
        const cookieName = `viewed_post_${postId}`;
        const hasViewed = cookieStore.get(cookieName);

        if (hasViewed) {
            return; // Prevent duplicate counts from rapid refreshes
        }

        // 🚀 PROPER FIX: Use updateMany because 'status' is not unique
        await prisma.blogPost.updateMany({
            where: { id: postId, status: "PUBLISHED" },
            data: {
                viewCount: {
                    increment: 1
                }
            }
        });

        // Set viewed cookie with 24 hours expiry
        cookieStore.set(cookieName, "true", {
            maxAge: 60 * 60 * 24, // 24 hours
            httpOnly: true,
            path: "/",
            sameSite: "lax",
        });
    } catch (error) {
        console.error("Error incrementing blog view count:", error);
    }
};