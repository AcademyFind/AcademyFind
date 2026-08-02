"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Clock3, Eye } from "lucide-react";

import type {
  BlogAuthorProfile,
  BlogBrand,
  BlogCategory,
  BlogPost,
} from "@/app/generated/prisma/client";

interface PostHeroProps {
  post: Pick<
    BlogPost,
    | "title"
    | "slug"
    | "excerpt"
    | "coverImage"
    | "coverImageAlt"
    | "coverImageWidth"
    | "coverImageHeight"
    | "publishedAt"
    | "updatedAt"
    | "readingTime"
    | "viewCount"
  > & {
    authorProfile: Pick<
      BlogAuthorProfile,
      | "displayName"
      | "username"
      | "avatarUrl"
      | "designation"
      | "isVerified"
    > | null;
    category: Pick<BlogCategory, "name" | "slug" | "color"> | null;
    brand: Pick<BlogBrand, "name" | "slug" | "avatarUrl"> | null;
  };
}

export default function PostHero({ post }: PostHeroProps) {
  return (
    // Note: Removed the border-b from header since we have a divider inside now
    <header className="relative overflow-hidden bg-white" aria-labelledby="post-title">
      {/* ❌ 9. Changed max-w-7xl to max-w-6xl */}
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">

        {/* ❌ 1. Category First */}
        {post.category && (
          <div className="mb-5">
            <Link
              href={`/blog/category/${post.category.slug}`}
              className="group inline-flex items-center"
            >
              <span
                className="rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200 group-hover:scale-[1.03]"
                style={{
                  backgroundColor: `${post.category.color ?? "#f59e0b"}20`,
                  color: post.category.color ?? "#d97706",
                }}
              >
                {post.category.name}
              </span>
            </Link>
          </div>
        )}

        {/* ❌ 1 & 3. Title Second (Fixed wrap class to break-words) */}
        <h1
          className="max-w-5xl break-words text-balance text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl lg:leading-[1.08]"
          id="post-title"
        >
          {post.title}
        </h1>

        {/* ❌ 1 & 10. Excerpt Third (Reduced to max-w-2xl) */}
        {post.excerpt && (
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
            {post.excerpt}
          </p>
        )}

        {/* ❌ 1 & 2. Cover Image Fourth (Removed duplicate category badge inside) */}
        <div className="relative mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-sm">
          {post.coverImage ? (
            <div className="relative aspect-[16/9] w-full">
              <Image
                src={post.coverImage}
                alt={post.coverImageAlt ?? post.title}
                fill
                priority
                fetchPriority="high"
                placeholder="empty"
                quality={90}
                sizes="(max-width:768px) 100vw, (max-width:1280px) 90vw, 1200px"
                className="object-cover transition-transform duration-700 hover:scale-[1.02]"
              />
              {/* Gradient Overlay */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
            </div>
          ) : (
            <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-amber-50 via-white to-amber-100">
              <div className="max-w-xl px-8 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100">
                  <Eye className="h-8 w-8 text-amber-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">{post.title}</h2>
                {post.excerpt && (
                  <p className="mt-4 text-slate-600 line-clamp-3">
                    {post.excerpt}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ❌ 1. Meta Section Fifth */}
        <div className="mt-10 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">

          {/* Meta Left: Author & Brand */}
          {post.authorProfile ? (
            <div className="flex flex-1 items-start gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                {post.authorProfile.avatarUrl ? (
                  // ❌ 5. Fixed Avatar Image configuration
                  <Image
                    src={post.authorProfile.avatarUrl}
                    alt={post.authorProfile.displayName}
                    fill
                    quality={90}
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-amber-100 text-xl font-bold text-amber-700">
                    {post.authorProfile.displayName.charAt(0)}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <Link
                  href={`/blog/author/${post.authorProfile.username}`}
                  className="inline-flex items-center gap-2"
                >
                  <h3 className="text-lg font-semibold text-slate-900 transition-colors hover:text-amber-600">
                    {post.authorProfile.displayName}
                  </h3>
                  {post.authorProfile.isVerified && (
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-xs font-bold text-white">
                      ✓
                    </span>
                  )}
                </Link>

                {post.authorProfile.designation && (
                  <p className="mt-1 text-sm text-slate-500">
                    {post.authorProfile.designation}
                  </p>
                )}

                {!post.authorProfile && post.brand && (
                  <Link
                    href={`/blog/brand/${post.brand.slug}`}
                    className="mt-2 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 transition hover:bg-amber-100"
                  >
                    {post.brand.name}
                  </Link>
                )}
              </div>
            </div>
          ) : post.brand ? (
            <div className="flex flex-1 items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-slate-200 bg-amber-100">
                {post.brand.avatarUrl ? (
                  <Image
                    src={post.brand.avatarUrl}
                    alt={post.brand.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xl font-bold text-amber-700">
                    {post.brand.name.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                  Published by
                </p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">
                  {post.brand.name}
                </h3>
              </div>
            </div>
          ) : null}

          {/* Meta Right: Stats & Dates */}
          <div className="grid grid-cols-2 gap-6 sm:flex sm:flex-wrap sm:items-center">
            {post.publishedAt && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CalendarDays className="h-4 w-4 text-slate-400" />
                <time dateTime={post.publishedAt.toISOString()}>
                  {new Intl.DateTimeFormat("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }).format(post.publishedAt)}
                </time>
              </div>
            )}

            {post.readingTime && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Clock3 className="h-4 w-4 text-slate-400" />
                <span>{post.readingTime} min read</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Eye className="h-4 w-4 text-slate-400" />
              <span>{Intl.NumberFormat("en-IN").format(post.viewCount)}</span>
            </div>

            {/* ❌ 6. Upgraded pill for "Updated" state */}
            {post.updatedAt &&
              post.publishedAt &&
              post.updatedAt.getTime() !== post.publishedAt.getTime() && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  Updated{" "}
                  {new Intl.DateTimeFormat("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }).format(post.updatedAt)}
                </span>
              )}
          </div>
        </div>

        <div className="mt-10 border-b border-slate-200" />
      </div>
    </header>
  );
}
