import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Sparkles,
} from "lucide-react";

interface FeaturedPostsProps {
  posts: any[];
}

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80";

export default function FeaturedPosts({ posts }: FeaturedPostsProps) {
  // Requirement #2: Hide section if there are no featured posts
  if (!posts || posts.length === 0) {
    return null;
  }

  const [mainPost, ...sidePosts] = posts;

  const formatDate = (dateVal: any) => {
    if (!dateVal) return "Recently";
    return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(dateVal));
  };

  return (
    <section
      id="featured-posts"
      className="bg-white py-24"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 flex items-end justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
              <Sparkles className="h-4 w-4" />
              Featured Articles
            </div>

            <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
              Hand-picked guides for students
            </h2>

            <p className="mt-3 max-w-2xl text-lg leading-7 text-slate-600">
              Carefully selected articles to help you discover the best coaching
              institutes, preparation strategies and admission guidance.
            </p>
          </div>

          <Link
            href="/blog/search"
            className="hidden items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 lg:inline-flex"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Layout */}
        <div className="grid gap-8 lg:grid-cols-[1.7fr_0.9fr]">
          {/* Main Featured Card */}
          {mainPost && (
            <Link
              href={`/blog/${mainPost.slug}`}
              className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                <Image
                  src={mainPost.coverImage || DEFAULT_IMAGE}
                  alt={mainPost.title}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                />

                <div className="absolute left-6 top-6 rounded-full bg-amber-400 px-4 py-2 text-sm font-bold text-slate-900">
                  {mainPost.category?.name || "Education"}
                </div>
              </div>

              <div className="p-8">
                <div className="flex flex-wrap items-center gap-5 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-amber-500" />
                    {mainPost.readingTime || 5} min read
                  </div>

                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-amber-500" />
                    {formatDate(mainPost.publishedAt)}
                  </div>
                </div>

                <h3 className="mt-5 text-3xl font-bold leading-tight text-slate-900 transition group-hover:text-amber-600">
                  {mainPost.title}
                </h3>

                <p className="mt-5 text-lg leading-8 text-slate-600 line-clamp-3">
                  {mainPost.excerpt}
                </p>

                <div className="mt-8 flex items-center justify-between">
                  <span className="font-medium text-slate-700">
                    By {mainPost.authorProfile?.displayName || "AcademyFind Editorial"}
                  </span>

                  <span className="inline-flex items-center gap-2 font-semibold text-amber-600">
                    Read Article
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>
          )}

          {/* Side Cards */}
          <div className="space-y-8">
            {sidePosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex gap-5 overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-36 w-36 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                  <Image
                    src={post.coverImage || DEFAULT_IMAGE}
                    alt={post.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                      {post.category?.name || "Education"}
                    </span>

                    <h4 className="mt-3 line-clamp-2 text-xl font-bold leading-snug text-slate-900 transition group-hover:text-amber-600">
                      {post.title}
                    </h4>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                    <span>{post.readingTime || 5} min read</span>
                    <span>•</span>
                    <span>{formatDate(post.publishedAt)}</span>
                  </div>

                  <span className="mt-3 text-sm font-medium text-slate-700">
                    By {post.authorProfile?.displayName || "AcademyFind Editorial"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}