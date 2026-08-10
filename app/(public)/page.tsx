import { Metadata } from "next";
import Script from "next/script";

import { ExploreByGoal } from "@/components/home/Categories";
import { PopularComparisons } from "@/components/home/Comparsion";
import { FAQSection } from "@/components/home/FAQ";
import { FeaturedInstitutes } from "@/components/home/FeaturedInstitutes";
import HeroCards from "@/components/home/HeroCards";
import { HeroSection } from "@/components/home/HeroSection";
import { LifeCoachCTA } from "@/components/home/LifeCoachCTA";
import { PopularCities } from "@/components/home/PopularCities";
import { OwnerCTA } from "@/components/home/OwnerCTA";
import { StartJourney } from "@/components/home/StartJourney";
import { TrendingDestinations } from "@/components/home/Trending";
import { getSession } from "@/lib/auth/getSession";
import { prisma } from "@/lib/prisma";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

// Removed static revalidate to allow personalized dynamic rendering for logged in users
// export const revalidate = 86400; // Cache for 24 hours

// ─── 1. METADATA (Brand Authority & Broad Keywords) ──────────
export const metadata: Metadata = {
  title: "AcademyFind | India's Most Trusted Education & Coaching Directory",
  description: "Discover top-rated coaching centers, schools, and hostels across India. Compare fees, read verified student reviews, and book free strategy calls on AcademyFind.",
  alternates: {
    canonical: "https://academyfind.com",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "AcademyFind | Find the Best Coaching & Institutes Near You",
    description: "Compare the best coaching institutes, schools, and hostels in India. Make informed educational choices with AcademyFind.",
    url: "https://academyfind.com",
    siteName: "AcademyFind",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://academyfind.com/final-logo.png", // Replace with a nice Home Banner if you have one
        width: 1200,
        height: 630,
        alt: "AcademyFind Homepage",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AcademyFind | India's Top Education Directory",
    description: "Discover, compare, and connect with the best educational institutes near you.",
    site: "@academyfind",
    images: ["https://academyfind.com/final-logo.png"],
  },
  keywords: [
    "education directory India",
    "find coaching institutes",
    "best coaching centers near me",
    "compare coaching fees",
    "school directory India",
    "hostel finder",
    "student mentorship",
    "JEE NEET coaching",
    "UPSC coaching centers",
    "AcademyFind",
  ],
};

// ─── 2. JSON-LD COMPONENT (Sitelinks Search & Organization) ──
function JsonLdSchemas() {
  const baseUrl = "https://academyfind.com";

  // a) WebSite Schema with SearchAction (Triggers Sitelink Search Box in Google)
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AcademyFind",
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/search?q={search_term_string}` // Make sure this matches your actual search route
      },
      "query-input": "required name=search_term_string"
    }
  };

  // b) Organization Schema (For Google Knowledge Panel)
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AcademyFind",
    url: baseUrl,
    logo: `${baseUrl}/final-logo.png`,
    description: "India's premier programmatic education directory helping students discover, compare, and connect with top coaching institutes, schools, and hostels.",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      url: `${baseUrl}/contact`,
      availableLanguage: ["English", "Hindi"]
    },
    sameAs: [
      "https://wa.me/919045699938",
      "https://www.instagram.com/academyfind",
      "https://www.facebook.com/profile.php?id=61561180379260",
      "https://www.linkedin.com/company/academyfind",
      "https://www.youtube.com/channel/UCYiRb6vo_Rr_w3PO746hsKg",
      "https://t.me/academyfind"
    ]
  };

  // c) Homepage FAQ Schema (Because you have an FAQSection component)
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is AcademyFind?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "AcademyFind is India's most comprehensive education directory. We help students and parents find, compare, and review coaching institutes, schools, and hostels across the country."
        }
      },
      {
        "@type": "Question",
        name: "Is AcademyFind free for students?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! Searching for institutes, reading reviews, and booking strategy calls with life coaches on AcademyFind is completely free for students and parents."
        }
      },
      {
        "@type": "Question",
        name: "How do I know if an institute is verified?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Look for the blue 'Verified' tick mark on an institute's profile. This indicates that the institute's owner has claimed the profile and officially verified their details with AcademyFind."
        }
      }
    ]
  };

  return (
    <>
      <Script
        id="schema-website"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <Script
        id="schema-organization"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <Script
        id="schema-home-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}

// ─── 3. PAGE COMPONENT ───────────────────────────────────────
export default async function Home() {
  const session = await getSession();
  const userId = session?.user?.id;

  let preferredCityIds: string[] = [];
  let preferredCategoryIds: string[] = [];

  if (userId) {
    const prefs = await prisma.userPreference.findUnique({
      where: { userId },
      include: {
        preferredCities: true,
        preferredCategories: true,
      }
    });
    if (prefs) {
      preferredCityIds = prefs.preferredCities.map((c: { cityId: string }) => c.cityId);
      preferredCategoryIds = prefs.preferredCategories.map((c: { categoryId: string }) => c.categoryId);
    }
  }

  return (
    <>
      <JsonLdSchemas />
      <HeroSection />
      
      <ScrollReveal direction="up">
        <HeroCards />
      </ScrollReveal>
      
      <ScrollReveal direction="up" delay={0.1}>
        <TrendingDestinations />
      </ScrollReveal>
      
      <ScrollReveal direction="up">
        <ExploreByGoal />
      </ScrollReveal>
      
      <ScrollReveal direction="up">
        <LifeCoachCTA />
      </ScrollReveal>
      
      <ScrollReveal direction="up">
        <PopularComparisons />
      </ScrollReveal>
      
      <ScrollReveal direction="up">
        <FeaturedInstitutes preferredCityIds={preferredCityIds} preferredCategoryIds={preferredCategoryIds} />
      </ScrollReveal>
      
      <ScrollReveal direction="up">
        <PopularCities />
      </ScrollReveal>
      
      <ScrollReveal direction="up">
        <OwnerCTA />
      </ScrollReveal>

      <ScrollReveal direction="up">
        <StartJourney />
      </ScrollReveal>
      
      <ScrollReveal direction="up">
        <FAQSection />
      </ScrollReveal>
    </>
  );
}