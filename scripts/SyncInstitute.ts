import { prisma } from "@/lib/prisma";
import { meili } from "@/lib/meilisearch";
import { revalidatePath } from "next/cache";

export async function syncSingleInstituteToMeili(instituteId: string) {
  try {
    console.log(`Fetching institute data for ID: ${instituteId}...`);

    const inst = await prisma.institute.findUnique({
      where: { id: instituteId, isActive: true },
      include: {
        city: true,
        categories: { include: { category: true } },
      },
    });

    const index = meili.index("global_search");
    const documentId = `inst-${instituteId}`;

    if (!inst) {
      console.log(`Institute not found or inactive. Removing ${documentId} from Meilisearch...`);
      await index.deleteDocument(documentId);
      return { success: true, action: "deleted" };
    }

    const documentToSync = {
      id: documentId,
      prismaId: inst.id,
      type: "institute",
      name: inst.name,
      slug: inst.slug,
      city: inst.city?.name ?? "",
      cityId: inst.city?.id ?? "",
      citySlug: inst.city?.slug ?? "",
      state: inst.city?.state ?? "",
      description: inst.description ?? "",
      address: inst.address,
      categoryNames: inst.categories.map((c) => c.category.name),
      categorySlugs: inst.categories.map((c) => c.category.slug),
      categoryIds: inst.categories.map((c) => c.categoryId),
      subscriptionPlan: inst.subscriptionPlan,
      planWeight: inst.planWeight ?? 1,
      isPublished: inst.isPublished,
      providerType: inst.providerType,
      averageRating: inst.averageRating ?? 0,
      reviewCount: inst.reviewCount ?? 0,
      googleRating: inst.googleRating,
      googleReviewCount: inst.googleReviewCount,
      isActive: inst.isActive,
      imageUrl: inst.imageUrl ?? "",
      _geo: inst.latitude && inst.longitude ? {
        lat: parseFloat(inst.latitude.toString()),
        lng: parseFloat(inst.longitude.toString())
      } : undefined,
      url: `/institute/${inst.id}-${inst.slug}`,
      mode: inst.mode ? inst.mode.toLowerCase() : "offline",
      viewCount: inst.viewCount,
      compareCount: inst.compareCount,
      feeMin: inst.feeMin,
      feeMax: inst.feeMax,
      hasOnlineClasses: inst.hasOnlineClasses,
      hasHostelFacility: inst.hasHostelFacility,
      hasDemoClasses: inst.hasDemoClasses,
    };

    console.log(`Syncing ${documentId} to Meilisearch...`);

    // Server action me synchronous delay avoid karne ke liye inline response send kiya
    await index.addDocuments([documentToSync]);
    console.log(`✅ Push request triggered successfully for ${documentId}!`);

    // Next.js paths Safe Runtime Check fallback wrapper
    const isNextRuntime = !!process.env.NEXT_RUNTIME || (typeof window === "undefined" && !process.env.INIT_CWD);

    if (isNextRuntime) {
      try {
        revalidatePath(`/institute/${inst.id}-${inst.slug}`);
        revalidatePath('/af-ass-manage/institutes');
        console.log("⚡ Next.js paths revalidated successfully.");
      } catch (revalidateError) {
        console.warn("Skipping revalidatePath outside Web server environment.");
      }
    }

    return { success: true, action: "synced" };
  } catch (error) {
    console.error("Critical error in syncSingleInstituteToMeili:", error);
    return { success: false, error: String(error) };
  }
}

async function main() {
  const instituteId = "cms7y08dm000004i5s51n9inj";
  try {
    console.log(`Starting sync for institute ID: ${instituteId}...`);
    await syncSingleInstituteToMeili(instituteId);
  } catch (err) {
    console.error("Error syncing institute:", err);
  } finally {
    await prisma.$disconnect(); // Prevents the terminal process from hanging
  }
}

main();
