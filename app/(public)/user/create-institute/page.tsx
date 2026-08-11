import CreateInstituteForm from "@/components/User/CreateInstitute";
import { PricingModal } from "@/components/manager/PricingPopUp";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
    title: "List Your Institute | AcademyFind",
    robots: {
        index: false,
        follow: false,
    },
};

export default async function UserCreateInstitutePage() {
    // 1. Session check
    const session = await auth.api.getSession({
        headers: await headers()
    });

    let user = null;
    let latestReq = null;

    if (session?.user) {
        user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                managedInstitutes: true
            }
        });

        if (user) {
            latestReq = await prisma.instituteRequest.findFirst({
                where: { userId: user.id },
                orderBy: { createdAt: "desc" },
                include: {
                    institute: {
                        select: { id: true, name: true }
                    }
                }
            }) as any;
        }
    }

    const latestStatus = latestReq?.status;
    const isPendingRequest = user && latestStatus === "PENDING" && !user.canAddInstitute;


    // ==========================================
    // CASE A: User has NO permission to add (Strict Early Returns)
    // ==========================================
    if (isPendingRequest) {
        return (
            <div className="container mx-auto py-10 px-4 space-y-8 font-sans">
                <div className="flex flex-col items-center justify-center text-center p-8 bg-sky-50 border border-sky-200 rounded-3xl max-w-3xl mx-auto shadow-sm">
                    <h1 className="text-2xl font-bold text-sky-800 mb-2">Your Listing Request Is Under Review</h1>
                    <p className="text-sky-700 max-w-2xl">
                        We have received your institute listing request and owner details. You cannot submit another request until this one is approved or rejected.
                    </p>

                    {latestReq?.institute ? (
                        <div className="mt-6 w-full max-w-xl rounded-2xl border border-sky-100 bg-white p-5 text-left shadow-sm">
                            <div className="text-xs font-bold uppercase tracking-wide text-sky-500 mb-3">Submitted Details</div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <div className="text-slate-400 text-xs uppercase font-semibold">Institute</div>
                                    <div className="font-semibold text-slate-800">{latestReq.institute.name}</div>
                                </div>
                                <div>
                                    <div className="text-slate-400 text-xs uppercase font-semibold">Owner</div>
                                    <div className="font-semibold text-slate-800">{latestReq.ownerName || "N/A"}</div>
                                </div>
                                <div>
                                    <div className="text-slate-400 text-xs uppercase font-semibold">Designation</div>
                                    <div className="font-semibold text-slate-800">{latestReq.ownerDesignation || "N/A"}</div>
                                </div>
                            </div>
                            <div className="mt-4 text-sm text-slate-600">
                                Phone: <span className="font-semibold text-slate-800">{latestReq.ownerPhone || "N/A"}</span>
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Pricing Link - visible even when request is pending */}
                <div className="flex justify-center mt-6">
                    <PricingModal>
                        <button className="inline-flex items-center gap-1 text-sm font-medium text-amber-500 transition-colors hover:text-amber-600 cursor-pointer">
                            View Pricing
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </button>
                    </PricingModal>
                </div>
            </div>
        );
    }

    if (user && !user.canAddInstitute) {
        if (latestStatus === "REJECTED") {
            return (
                <div className="container mx-auto py-10 px-4 font-sans">
                    <div className="flex flex-col items-center justify-center text-center p-8 bg-red-50 border-2 border-red-200 rounded-3xl max-w-2xl mx-auto shadow-sm">
                        <h1 className="text-2xl font-bold text-red-700 mb-2">Institute Request Rejected</h1>
                        <p className="text-red-600 mb-6 font-medium">
                            Unfortunately, your previous submission did not meet our guidelines and was not approved by the admin team.
                        </p>
                        <p className="text-sm text-slate-500">
                            Please contact support for more details or if you believe this was a mistake.
                        </p>
                    </div>
                </div>
            );
        }

        return (
            <div className="container mx-auto py-10 px-4 font-sans">
                <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-50 border rounded-3xl max-w-2xl mx-auto">
                    <h2 className="text-xl font-bold text-slate-800">Action Restricted</h2>
                    <p className="text-slate-500 mt-2">You currently do not have permission to add a new institute.</p>
                </div>
            </div>
        );
    }


    // ==========================================
    // CASE B: User CAN add (Form renders, Banner shows logic)
    // ==========================================
    const allCities = await prisma.city.findMany({ orderBy: { name: 'asc' } });
    const allCategories = await prisma.category.findMany({ orderBy: { name: 'asc' } });

    // Determine conditional banner states
    let bannerComponent = null;

    if (latestStatus === "REJECTED") {
        bannerComponent = (
            <div className="flex flex-col items-center justify-center text-center p-6 bg-amber-50 border border-amber-200 rounded-2xl max-w-4xl mx-auto mb-8 shadow-sm">
                <h2 className="text-lg font-bold text-amber-800 mb-1">Your Last Request Was Rejected</h2>
                <p className="text-sm text-amber-700 font-medium">
                    Your previous submission did not meet our guidelines. However, you can use the form below to submit a clean new institute listing request.
                </p>
            </div>
        );
    }

    else if (latestStatus === "APPROVED") {
        const isAlreadyManager = latestReq
            ? user?.managedInstitutes.some(
                (manager: { instituteId: string }) => manager.instituteId === latestReq.instituteId
            )
            : false;

        bannerComponent = (
            <div className="flex flex-col items-center justify-center text-center p-6 bg-emerald-50 border border-emerald-200 rounded-2xl max-w-4xl mx-auto mb-8 shadow-sm">
                <h2 className="text-lg font-bold text-emerald-800 mb-1">Your Last Request Was Approved!</h2>
                <p className="text-sm text-emerald-700 font-medium mb-3">
                    {isAlreadyManager
                        ? "Your institute listing is live and you are recognized as a manager for it. You can access your management zone now."
                        : "Your request was approved and ownership sync is being completed."}
                </p>
                <Link href="/manager" passHref legacyBehavior>
                    <Button className="bg-emerald-600 text-white hover:bg-emerald-700 transition size-sm">
                        Go to Dashboard
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 px-4">
            {/* Conditional Notification Banner if history rules match */}
            {bannerComponent}

            {/* Always Available Creation Interface for Authorized Users */}
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2 text-slate-800">Create a Listing</h1>
                        <p className="text-slate-500 mb-8">Fill up the form parameters below to propose a new profile listing on AcademyFind.</p>
                    </div>
                    {user && (
                        <PricingModal>
                            <button className="inline-flex items-center gap-1 text-sm font-medium text-amber-500 transition-colors hover:text-amber-600 cursor-pointer">
                                View Pricing
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </button>
                        </PricingModal>
                    )}
                </div>

                {user ? (
                    latestStatus !== "PENDING" && (
                        <CreateInstituteForm
                            userId={user.id}
                            allCities={allCities}
                            allCategories={allCategories}
                            defaultName={user?.name}
                            defaultPhone={user?.phone}
                        />
                    )
                ) : (
                    <div className="mt-12 flex justify-center relative py-8 overflow-hidden">
                        {/* Decorative Background Blurred Blobs */}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-amber-400/20 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
                        <div className="absolute right-0 top-0 w-64 h-64 bg-orange-400/20 rounded-full blur-[80px] pointer-events-none"></div>
                        <div className="absolute left-0 bottom-0 w-72 h-72 bg-yellow-300/20 rounded-full blur-[80px] pointer-events-none"></div>

                        <div className="relative z-10 w-full max-w-md overflow-hidden rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgb(0,0,0,0.1)] border border-white/60 bg-white/40 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-500">
                            <div className="bg-linear-to-br from-amber-50/90 via-white/80 to-orange-50/90 p-8 sm:p-10">
                                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 shadow-sm border border-amber-200/50">
                                    <Sparkles className="h-8 w-8 text-amber-600" />
                                </div>

                                <h2 className="text-center text-2xl font-black text-slate-900 tracking-tight">
                                    Authentication Required
                                </h2>

                                <p className="mt-3 text-center text-sm text-zinc-600 leading-relaxed">
                                    You must be logged in to list your institute on AcademyFind. Create a free account or sign in to continue.
                                </p>

                                <div className="mt-8 flex flex-col gap-3">
                                    <Link href="/register?callbackUrl=/user/create-institute">
                                        <Button className="w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm shadow-md shadow-amber-500/20 hover:scale-[1.02] transition-all">
                                            Create Free Account
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </Link>

                                    <Link href="/login?callbackUrl=/user/create-institute">
                                        <Button variant="outline" className="w-full h-12 rounded-xl font-semibold text-sm border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors">
                                            Login
                                        </Button>
                                    </Link>
                                </div>

                                <p className="mt-6 text-center text-xs text-zinc-500 font-medium">
                                    Join thousands of students discovering the best coaching institutes.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
