"use client";

import { useState } from "react";
import { Search, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!query.trim()) return;

    router.push(`/blog/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-3xl"
    >
      <div className="group relative flex items-center rounded-2xl border-2 border-amber-500/30 bg-white px-5 py-2.5 shadow-[0_8px_30px_rgb(245,158,11,0.15)] ring-4 ring-amber-500/10 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(245,158,11,0.2)] hover:border-amber-500/50 focus-within:border-amber-500 focus-within:ring-4 focus-within:ring-amber-500/20">
        {/* Search Icon */}

        <Search className="h-5 w-5 flex-shrink-0 text-slate-400 transition-colors group-focus-within:text-amber-500" />

        {/* Input */}

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search articles, coaching, exams..."
          className="h-12 flex-1 min-w-0 bg-transparent px-2 sm:px-4 text-base text-slate-700 placeholder:text-slate-400 focus:outline-none"
        />

        {/* Search Button */}

        <button
          type="submit"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-amber-400 px-4 sm:px-5 py-3 text-sm font-semibold text-slate-900 transition-all hover:bg-amber-500 active:scale-[0.98]"
        >
          <span className="hidden sm:inline">Search</span>

          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Search Hint */}

      <div className="mt-3 text-center text-sm text-slate-500">
        Try searching{" "}
        <span className="font-medium text-slate-700">
          JEE, NEET, Kota, Allen
        </span>
      </div>
    </form>
  );
}