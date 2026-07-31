import AuthorCard from "@/components/blog/article/AuthorCard";
import Breadcrumb from "@/components/blog/article/BreadCrumb";
import Comments from "@/components/blog/article/Comments";
import FAQSection from "@/components/blog/article/FAQSection";
import NewsletterCTA from "@/components/blog/article/NewsLetterCTA";
import ArticleActions from "@/components/blog/article/PostActions";
import PostContent from "@/components/blog/article/PostContent";
import PostHero from "@/components/blog/article/PostHero";
import ReadingProgress from "@/components/blog/article/ReadinProgress";
import RelatedInstitute from "@/components/blog/article/RelatedInstitutes";
import RelatedPosts from "@/components/blog/article/RelatedPosts";
import ShareButtons from "@/components/blog/article/ShareButtons";
import StickyCTA from "@/components/blog/article/StickyCTA";
import TableOfContents from "@/components/blog/article/TableOfContents";
import ViewTracker from "@/components/blog/article/ViewTracker";
import { getCachedSession } from "@/lib/auth/session";
import { getBlogPostBySlug, getisBookmarked, getRelatedInstitute, getUserReaction, getRelatedPosts } from "@/lib/User/user/blog/blogpost";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Script from "next/script";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

type TOCItem = {
  id: string;
  text: string;
  level: number;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return { title: "Blog Not Found | AcademyFind" };
  }

  const title = post.metaTitle || `${post.title} | AcademyFind Blog`;
  const description = post.metaDescription || post.excerpt || `Read ${post.title} on AcademyFind.`;
  const url = `https://academyfind.com/blog/${post.slug}`;

  const keywords: string[] = [];
  if (post.focusKeyword) keywords.push(post.focusKeyword);
  if (post.tags) {
    keywords.push(...post.tags.map((t: any) => t.tag.name));
  }

  return {
    title,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      publishedTime: post.createdAt?.toISOString(),
      modifiedTime: post.updatedAt?.toISOString(),
      images: post.coverImage ? [post.coverImage] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

export default async function BlogDetailPage({
  params,
}: Props) {
  const { slug } = await params;
  const [post, session] = await Promise.all([
    getBlogPostBySlug(slug),
    getCachedSession(),
  ]);
  
  if (!post) {
    return notFound();
  }

  const userId = session?.user?.id;

  const [userReaction, hasBookmarked, relatedInstitute, relatedPosts] = await Promise.all([
    userId ? getUserReaction(post.id || "", userId) : null,
    userId ? getisBookmarked(post.id || "", userId) : null,
    getRelatedInstitute(post.relatedInstituteId || ""),
    getRelatedPosts(post.id || "", post.categoryId || ""),
  ]);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt || "",
    "image": post.coverImage ? [post.coverImage] : [],
    "datePublished": post.createdAt,
    "dateModified": post.updatedAt,
    "author": [{
      "@type": "Person",
      "name": post.authorProfile?.displayName || post.authorProfile?.username || "AcademyFind Team",
      "url": post.authorProfile?.username ? `https://academyfind.com/u/${post.authorProfile.username}` : "https://academyfind.com"
    }]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://academyfind.com" },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://academyfind.com/blog" },
      { "@type": "ListItem", "position": 3, "name": post.category?.name || "Uncategorized", "item": `https://academyfind.com/blog/category/${post.category?.slug || ""}` },
      { "@type": "ListItem", "position": 4, "name": post.title, "item": `https://academyfind.com/blog/${post.slug}` }
    ]
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 overflow-x-hidden">
      <Script id="schema-article" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <Script id="schema-breadcrumb-blog" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <ViewTracker postId={post.id} />
      <ReadingProgress />

      <PostHero post={post} />

      <Breadcrumb
        items={[
          { label: "Blog", href: "/blog" },
          { label: post.category?.name || "Uncategorized", href: `/blog/category/${post.category?.slug}` },
          { label: post.title },
        ]}
      />

      <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_320px]">
        <main className="min-w-0">
          <PostContent html={post.contentHtml} className="prose-lg" />

          <FAQSection faqs={post.faqs} />

          {post.authorProfile ? (
            <AuthorCard author={post.authorProfile} />
          ) : null}

          <RelatedPosts posts={relatedPosts} />

          <RelatedInstitute institute={post.relatedInstitute} />

          <NewsletterCTA />

          <Comments postId={post.id} comments={post.comments} canComment={!!userId} />
        </main>

        <aside>
          <TableOfContents items={(post.tableOfContents as TOCItem[]) ?? []} />

          <StickyCTA instituteSlug={relatedInstitute?.slug} />

          <ShareButtons title={post.title} slug={post.slug} url={`${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`} />

          <ArticleActions 
            postId={post.id}
            slug={post.slug}
            initialLikes={post.likeCount}
            initialBookmarks={post.bookmarkCount}
            initialComments={post.commentCount}
            hasLikedInitially={userReaction === "LIKE"}
            hasHelpfullyInitially={userReaction === "HELPFUL"}
            hasLovedInitially={userReaction === "LOVE"}
            hasBookmarkedInitially={hasBookmarked === true}
            isLoggedIn={!!userId} 
          />
        </aside>
      </div>
    </div>
  );
}
