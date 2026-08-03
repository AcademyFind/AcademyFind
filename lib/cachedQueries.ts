// lib/institutes/institutes_cached.ts
import { unstable_cache } from "next/cache";
import { getInstituteById } from "@/lib/institutes/institutes_id";
import { getInstitutesByCategoryAndCity } from "@/lib/institutes/institutes_cat_city";
import { getInstitutesByCategory } from "@/lib/category/category_inst";

// ────────────────────────────────────────────────
// 1. INSTITUTE DETAIL PAGE — fully cacheable, no per-user data
// ────────────────────────────────────────────────
export const getCachedInstituteById = unstable_cache(
  async (id: string) => getInstituteById(id),
  ["institute-by-id-v2"],
  { revalidate: 3600, tags: ["institutes"] } // tag generic rakha — neeche revalidateTag se bust hoga
);

// ────────────────────────────────────────────────
// 2. CATEGORY + CITY LISTING
//    Geo (lat/lng) aur free-text search (q) ko cache MAT karo —
//    per-user/per-query unique hote hain, cache pollute karenge
// ────────────────────────────────────────────────
export const getCachedInstitutesByCategoryAndCity = unstable_cache(
  async (
    categorySlug: string,
    citySlug: string,
    sort?: string,
    page: number = 1,
    minRating?: number,
    mode?: string,
    providerType?: string,
  ) => {
    const safePage = Math.max(1, Math.floor(page) || 1); // defense-in-depth guard
    return getInstitutesByCategoryAndCity(
      categorySlug,
      citySlug,
      sort,
      safePage,
      undefined,   // q — always undefined for cached path
      undefined,   // lat
      undefined,   // lng
      undefined,   // radius
      minRating,
      mode,
      providerType,
    );
  },
  ["institutes-by-cat-city"],
  { revalidate: 3600, tags: ["institutes", "listings"] }
);

// q / lat-lng wale requests yahan se uncached jayenge — page.tsx me condition lagana hai
export async function getUncachedInstitutesByCategoryAndCity(
  categorySlug: string,
  citySlug: string,
  sort?: string,
  page: number = 1,
  q?: string,
  lat?: number,
  lng?: number,
  radius?: number,
  minRating?: number,
  mode?: string,
  providerType?: string,
) {
  const safePage = Math.max(1, Math.floor(page) || 1);
  return getInstitutesByCategoryAndCity(
    categorySlug, citySlug, sort, safePage, q, lat, lng, radius, minRating, mode, providerType
  );
}

// ────────────────────────────────────────────────
// 3. CATEGORY-ONLY LISTING — same split (q+lat/lng uncached)
// ────────────────────────────────────────────────
export const getCachedInstitutesByCategory = unstable_cache(
  async (
    categorySlug: string,
    page: number = 1,
    sort?: string,
    rating?: string,
    mode?: string,
    providerType?: string,
  ) => {
    const safePage = Math.max(1, Math.floor(page) || 1);
    return getInstitutesByCategory(
      categorySlug, safePage, undefined, sort, rating, mode, undefined, undefined, providerType
    );
  },
  ["institutes-by-category"],
  { revalidate: 3600, tags: ["institutes", "listings"] }
);

export async function getUncachedInstitutesByCategory(
  categorySlug: string,
  page: number = 1,
  q?: string,
  sort?: string,
  rating?: string,
  mode?: string,
  lat?: number,
  lng?: number,
  providerType?: string,
) {
  const safePage = Math.max(1, Math.floor(page) || 1);
  return getInstitutesByCategory(categorySlug, safePage, q, sort, rating, mode, lat, lng, providerType);
}
