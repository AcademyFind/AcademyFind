import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  Clock3,
  Eye,
  Heart,
  MessageCircle,
} from "lucide-react";
import { BlogCardPost } from "@/types/BlogCard";

type BlogCardProps = {
  post: BlogCardPost;
};

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/blog/${post.slug}`}>
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image
            src={post.coverImage || "/images/blog-placeholder.jpg"}
            alt={post.coverImageAlt || post.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
          />

          {post.category && (
            <span className="absolute left-4 top-4 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white">
              {post.category.name}
            </span>
          )}
        </div>
      </Link>

      <div className="p-6">
        <Link href={`/blog/${post.slug}`}>
          <h2 className="line-clamp-2 text-xl font-bold text-slate-900 transition group-hover:text-amber-600">
            {post.title}
          </h2>
        </Link>

        {post.excerpt && (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
            {post.excerpt}
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-slate-500">
          {post.publishedAt && (
            <span className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              {post.publishedAt.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          )}

          {post.readingTime && (
            <span className="flex items-center gap-1">
              <Clock3 className="h-4 w-4" />
              {post.readingTime} min
            </span>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between border-t pt-4 text-sm text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {post.viewCount.toLocaleString()}
            </span>

            <span className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              {post.likeCount}
            </span>

            <span className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              {post.commentCount}
            </span>
          </div>

          <span className="font-semibold text-amber-600 group-hover:translate-x-1 transition">
            Read →
          </span>
        </div>
      </div>
    </article>
  );
}