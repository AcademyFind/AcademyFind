import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BarChart2, Eye, Heart, MessageSquare, Bookmark } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Blog Analytics | AcademyFind Admin",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 10;

type AnalyticsPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    viewsPage?: string;
    reactionsPage?: string;
    bookmarksPage?: string;
    commentsPage?: string;
  }>;
};

export default async function BlogAnalyticsPage({
  params,
  searchParams,
}: AnalyticsPageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;

  const viewsPage = Math.max(1, Number(resolvedSearchParams.viewsPage) || 1);
  const reactionsPage = Math.max(1, Number(resolvedSearchParams.reactionsPage) || 1);
  const bookmarksPage = Math.max(1, Number(resolvedSearchParams.bookmarksPage) || 1);
  const commentsPage = Math.max(1, Number(resolvedSearchParams.commentsPage) || 1);

  const post = await prisma.blogPost.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      viewCount: true,
      commentCount: true,
      _count: {
        select: {
          views: true,
          reactions: true,
          bookmarks: true,
          comments: true,
        },
      },
    },
  });

  if (!post) notFound();

  // Fetch paginated data
  const [views, reactions, bookmarks, comments] = await Promise.all([
    prisma.blogView.findMany({
      where: { postId: id },
      orderBy: { id: "desc" },
      skip: (viewsPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        userId: true,
        ipHash: true,
        deviceType: true,
        country: true,
        user: { select: { name: true, username: true, image: true } },
      },
    }),
    prisma.blogReaction.findMany({
      where: { postId: id },
      orderBy: { createdAt: "desc" },
      skip: (reactionsPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        type: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.blogBookmark.findMany({
      where: { postId: id },
      orderBy: { createdAt: "desc" },
      skip: (bookmarksPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.blogComment.findMany({
      where: { postId: id },
      orderBy: { createdAt: "desc" },
      skip: (commentsPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        content: true,
        createdAt: true,
        status: true,
      },
    }),
  ]);

  const totalViewsPages = Math.max(1, Math.ceil(post._count.views / PAGE_SIZE));
  const totalReactionsPages = Math.max(1, Math.ceil(post._count.reactions / PAGE_SIZE));
  const totalBookmarksPages = Math.max(1, Math.ceil(post._count.bookmarks / PAGE_SIZE));
  const totalCommentsPages = Math.max(1, Math.ceil(post._count.comments / PAGE_SIZE));

  const buildUrl = (updates: Record<string, string>) => {
    const params = new URLSearchParams(resolvedSearchParams as any);
    Object.entries(updates).forEach(([key, value]: [string, string]) => params.set(key, value));
    return `/af-ass-manage/blog/analytics/${id}?${params.toString()}`;
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <Button variant="ghost" asChild className="mb-4 text-slate-500">
          <Link href="/af-ass-manage/blog">
            <ArrowLeft className="mr-2 size-4" />
            Back to blogs
          </Link>
        </Button>
        <h1 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight text-slate-900">
          <BarChart2 className="size-8 text-purple-600" />
          Analytics: {post.title}
        </h1>
        <p className="mt-1 text-slate-500">
          Detailed breakdown of engagement for this blog post.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 flex flex-col justify-center items-center">
          <Eye className="size-6 text-blue-500 mb-2" />
          <p className="text-sm font-semibold uppercase text-slate-500">Views</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{Math.max(post.viewCount || 0, post._count.views)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 flex flex-col justify-center items-center">
          <Heart className="size-6 text-pink-500 mb-2" />
          <p className="text-sm font-semibold uppercase text-slate-500">Reactions</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{post._count.reactions}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 flex flex-col justify-center items-center">
          <Bookmark className="size-6 text-amber-500 mb-2" />
          <p className="text-sm font-semibold uppercase text-slate-500">Bookmarks</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{post._count.bookmarks}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 flex flex-col justify-center items-center">
          <MessageSquare className="size-6 text-emerald-500 mb-2" />
          <p className="text-sm font-semibold uppercase text-slate-500">Comments</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{Math.max(post.commentCount || 0, post._count.comments)}</p>
        </div>
      </div>

      <div className="space-y-12">
        {/* Views Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 border-b pb-2">Views</h2>
          <div className="rounded-xl border bg-white overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-3 font-semibold text-slate-700">Viewer</th>
                  <th className="px-6 py-3 font-semibold text-slate-700">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {views.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-6 py-4 text-center text-slate-500">No views found.</td>
                  </tr>
                ) : (
                  views.map((v: any) => (
                    <tr key={v.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        {v.user ? (
                          <Link href={`/u/${v.user.username}`} target="_blank" className="flex items-center gap-2 hover:underline text-blue-600">
                            {v.user.image ? (
                              <img src={v.user.image} alt={v.user.name || v.user.username} className="w-6 h-6 rounded-full object-cover" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-600 font-medium">
                                {(v.user.name || v.user.username || "?")[0].toUpperCase()}
                              </div>
                            )}
                            <span className="font-medium">{v.user.name || v.user.username}</span>
                          </Link>
                        ) : (
                          <span className="text-slate-500 italic">Anonymous</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {v.deviceType ? `${v.deviceType}` : "Unknown Device"}
                        {v.country ? ` • ${v.country}` : ""}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {totalViewsPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-t">
                <Button variant="outline" size="sm" asChild disabled={viewsPage === 1}>
                  <Link href={viewsPage > 1 ? buildUrl({ viewsPage: String(viewsPage - 1) }) : "#"}>Previous</Link>
                </Button>
                <span className="text-sm text-slate-600">Page {viewsPage} of {totalViewsPages}</span>
                <Button variant="outline" size="sm" asChild disabled={viewsPage === totalViewsPages}>
                  <Link href={viewsPage < totalViewsPages ? buildUrl({ viewsPage: String(viewsPage + 1) }) : "#"}>Next</Link>
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Reactions Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 border-b pb-2">Reactions</h2>
          <div className="rounded-xl border bg-white overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-3 font-semibold text-slate-700">User</th>
                  <th className="px-6 py-3 font-semibold text-slate-700">Reaction</th>
                  <th className="px-6 py-3 font-semibold text-slate-700">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {reactions.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-slate-500">No reactions found.</td>
                  </tr>
                ) : (
                  reactions.map((r: any) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {r.user?.name || r.user?.email || "Unknown User"}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{r.type}</td>
                      <td className="px-6 py-4 text-slate-500">{r.createdAt.toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {totalReactionsPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-t">
                <Button variant="outline" size="sm" asChild disabled={reactionsPage === 1}>
                  <Link href={reactionsPage > 1 ? buildUrl({ reactionsPage: String(reactionsPage - 1) }) : "#"}>Previous</Link>
                </Button>
                <span className="text-sm text-slate-600">Page {reactionsPage} of {totalReactionsPages}</span>
                <Button variant="outline" size="sm" asChild disabled={reactionsPage === totalReactionsPages}>
                  <Link href={reactionsPage < totalReactionsPages ? buildUrl({ reactionsPage: String(reactionsPage + 1) }) : "#"}>Next</Link>
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Bookmarks Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 border-b pb-2">Bookmarks</h2>
          <div className="rounded-xl border bg-white overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-3 font-semibold text-slate-700">User</th>
                  <th className="px-6 py-3 font-semibold text-slate-700">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {bookmarks.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-6 py-4 text-center text-slate-500">No bookmarks found.</td>
                  </tr>
                ) : (
                  bookmarks.map((b: any) => (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {b.user?.name || b.user?.email || "Unknown User"}
                      </td>
                      <td className="px-6 py-4 text-slate-500">{b.createdAt.toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {totalBookmarksPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-t">
                <Button variant="outline" size="sm" asChild disabled={bookmarksPage === 1}>
                  <Link href={bookmarksPage > 1 ? buildUrl({ bookmarksPage: String(bookmarksPage - 1) }) : "#"}>Previous</Link>
                </Button>
                <span className="text-sm text-slate-600">Page {bookmarksPage} of {totalBookmarksPages}</span>
                <Button variant="outline" size="sm" asChild disabled={bookmarksPage === totalBookmarksPages}>
                  <Link href={bookmarksPage < totalBookmarksPages ? buildUrl({ bookmarksPage: String(bookmarksPage + 1) }) : "#"}>Next</Link>
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Comments Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 border-b pb-2">Comments</h2>
          <div className="rounded-xl border bg-white overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-3 font-semibold text-slate-700">Content</th>
                  <th className="px-6 py-3 font-semibold text-slate-700">Status</th>
                  <th className="px-6 py-3 font-semibold text-slate-700">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {comments.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-slate-500">No comments found.</td>
                  </tr>
                ) : (
                  comments.map((c: any) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-slate-900 max-w-md truncate" title={c.content}>
                        {c.content}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{c.status}</td>
                      <td className="px-6 py-4 text-slate-500">{c.createdAt.toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {totalCommentsPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-t">
                <Button variant="outline" size="sm" asChild disabled={commentsPage === 1}>
                  <Link href={commentsPage > 1 ? buildUrl({ commentsPage: String(commentsPage - 1) }) : "#"}>Previous</Link>
                </Button>
                <span className="text-sm text-slate-600">Page {commentsPage} of {totalCommentsPages}</span>
                <Button variant="outline" size="sm" asChild disabled={commentsPage === totalCommentsPages}>
                  <Link href={commentsPage < totalCommentsPages ? buildUrl({ commentsPage: String(commentsPage + 1) }) : "#"}>Next</Link>
                </Button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
