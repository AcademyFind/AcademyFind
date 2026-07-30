"use client";

import { useMemo } from "react";
import sanitizeHtml from "sanitize-html";
import clsx from "clsx";

interface PostContentProps {
  html: string;
  className?: string;
}

export default function PostContent({ html, className }: PostContentProps) {
  const sanitizedHtml = useMemo(() => {
    return sanitizeHtml(html, {
      // 1. Aapke saare require elements ko allow karna
      allowedTags: [
        ...sanitizeHtml.defaults.allowedTags,
        "h1", "h2", "h3", "h4", "h5", "h6",
        "iframe", "figure", "figcaption", "video", "source",
        "table", "thead", "tbody", "tr", "th", "td", "hr", "br"
      ],

      // 2. Class, id aur link/image metrics ko handle karna
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        a: ["href", "name", "target", "rel", "xlink:show", "xlink:href"],
        img: ["src", "alt", "title", "width", "height", "loading", "decoding", "fetchpriority", "referrerpolicy"],
        iframe: ["src", "allowfullscreen", "referrerpolicy", "width", "height", "frameborder"],
        video: ["src", "controls", "autoplay", "loop", "muted", "poster", "width", "height"],
        source: ["src", "type", "srcset"],
        // Tailwind styling and schema hooks support dynamically
        "*": ["class", "id", "itemscope", "itemtype", "itemprop"]
      },

      // 3. Educational ya professional videos embed allow karna
      allowedIframeHostnames: ["://youtube.com", "://vimeo.com"],

      // 4. Link Transformation (Jo aap pehle addHook se kar rahe the)
      transformTags: {
        a: (tagName, attribs) => {
          // target aur security tab-napping settings dynamically inject karna
          const updatedAttribs = { ...attribs };
          
          if (updatedAttribs.href) {
            updatedAttribs.target = "_blank";
            updatedAttribs.rel = "noopener noreferrer";
          }
          
          // Non-HTML namespaces compatibility fix (xlink handling)
          if (!updatedAttribs.target && (updatedAttribs["xlink:href"] || updatedAttribs.href)) {
            updatedAttribs["xlink:show"] = "new";
          }

          return {
            tagName: "a",
            attribs: updatedAttribs
          };
        }
      },

      // 5. Allow data scheme for images (base64 image support)
      allowedSchemes: [...sanitizeHtml.defaults.allowedSchemes, "data"],
      allowedSchemesByTag: {
        ...sanitizeHtml.defaults.allowedSchemesByTag,
        img: ["http", "https", "data"]
      }
    });
  }, [html]);

  return (
    <article
      id="article-content"
      itemScope
      itemType="https://schema.org/Article"
      className={clsx(
        "prose prose-slate max-w-none lg:text-lg",

        // ---------------------------
        // Headings
        // ---------------------------
        "prose-headings:scroll-mt-28",
        "prose-headings:font-bold",
        "prose-headings:tracking-tight",
        "prose-headings:text-slate-900",

        "prose-h1:text-4xl",
        "prose-h2:mt-16 prose-h2:mb-6 prose-h2:text-3xl",
        "prose-h3:mt-12 prose-h3:mb-5 prose-h3:text-2xl",
        "prose-h4:mt-8 prose-h4:text-xl",
        "prose-headings:first:mt-0",

        // ---------------------------
        // Paragraphs
        // ---------------------------
        "prose-p:leading-8",
        "prose-p:text-slate-700",
        "prose-p:text-[17px]",

        // ---------------------------
        // Links
        // ---------------------------
        "prose-a:font-medium",
        "prose-a:text-amber-600",
        "prose-a:no-underline",
        "hover:prose-a:text-amber-700",
        "prose-a:break-words",

        // ---------------------------
        // Lists
        // ---------------------------
        "prose-ul:my-6",
        "prose-ol:my-6",
        "prose-li:marker:text-amber-500",
        "prose-li:my-2",
        "prose-li:pl-1",

        // ---------------------------
        // Images
        // ---------------------------
        "prose-img:rounded-2xl",
        "prose-img:shadow-lg",
        "prose-img:border",
        "prose-img:border-slate-200",
        "prose-img:my-10",
        "prose-img:w-full",

        // ---------------------------
        // Blockquotes
        // ---------------------------
        "prose-blockquote:border-l-4",
        "prose-blockquote:border-amber-500",
        "prose-blockquote:bg-amber-50",
        "prose-blockquote:py-3",
        "prose-blockquote:px-5",
        "prose-blockquote:rounded-r-xl",
        "prose-blockquote:not-italic",
        "prose-blockquote:shadow-sm",

        // ---------------------------
        // Tables
        // ---------------------------
        "prose-table:block",
        "prose-table:w-full",
        "prose-table:overflow-x-auto",
        "prose-table:border-collapse",

        "prose-th:bg-slate-100",
        "prose-th:border",
        "prose-th:border-slate-200",
        "prose-th:px-4",
        "prose-th:py-3",

        "prose-td:border",
        "prose-td:border-slate-200",
        "prose-td:px-4",
        "prose-td:py-3",
        "prose-table:rounded-xl",
        "prose-table:shadow-sm",

        // ---------------------------
        // Horizontal Rule
        // ---------------------------
        "prose-hr:my-12",
        "prose-hr:border-slate-200",

        // ---------------------------
        // Code Blocks
        // ---------------------------
        "prose-pre:overflow-x-auto",
        "prose-pre:rounded-2xl",
        "prose-pre:border",
        "prose-pre:border-slate-700",
        "prose-pre:bg-slate-900",
        "prose-pre:px-5",
        "prose-pre:py-4",
        "prose-pre:text-sm",
        "prose-pre:ring-1",
        "prose-pre:ring-slate-800",

        // ---------------------------
        // Inline Code
        // ---------------------------
        "prose-code:rounded-md",
        "prose-code:bg-slate-100",
        "prose-code:px-1.5",
        "prose-code:py-0.5",
        "prose-code:text-[0.9em]",
        "prose-code:font-medium",
        "prose-code:text-amber-700",

        // Remove Typography's default backticks
        "prose-code:before:hidden",
        "prose-code:after:hidden",
        "antialiased",

        // Don't style code inside pre
        "prose-pre:prose-code:bg-transparent",
        "prose-pre:prose-code:p-0",
        "prose-pre:prose-code:text-inherit",

        // ---------------------------
        // Figures
        // ---------------------------
        "prose-figure:my-10",

        "prose-figcaption:mt-3",
        "prose-figcaption:text-center",
        "prose-figcaption:text-sm",
        "prose-figcaption:text-slate-500",

        // ---------------------------
        // Iframes
        // ---------------------------
        "prose-iframe:w-full",
        "prose-iframe:aspect-video",
        "prose-iframe:rounded-2xl",
        "prose-iframe:shadow-lg",

        // ---------------------------
        // Videos
        // ---------------------------
        "prose-video:w-full",
        "prose-video:rounded-2xl",

        // ---------------------------
        // Keyboard shortcuts
        // ---------------------------
        "prose-kbd:rounded",
        "prose-kbd:border",
        "prose-kbd:border-slate-300",
        "prose-kbd:bg-slate-100",
        "prose-kbd:px-2",
        "prose-kbd:py-1",
        "prose-kbd:text-xs",
        "prose-kbd:font-semibold",

        // ---------------------------
        // Strong
        // ---------------------------
        "prose-strong:text-slate-900",

        // ---------------------------
        // Selection
        // ---------------------------
        "selection:bg-amber-200",
        "selection:text-slate-900",

        className
      )}
      dangerouslySetInnerHTML={{
        __html: sanitizedHtml,
      }}
    />
  );
}
