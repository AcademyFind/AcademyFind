import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { Megaphone, PlusCircle, IndianRupee, RefreshCw, Edit } from "lucide-react";
import Link from "next/link";
import { renewAdvertisementRequest } from "@/lib/advertisement/user-actions";

export const metadata = {
  title: "My Advertisements | AcademyFind",
};

export default async function UserAdvertisementsPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    
    if (!session?.user) {
        redirect('/login?callbackUrl=/user/advertisements');
    }

    const advertisements = await prisma.advertisement.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" }
    });

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container mx-auto max-w-5xl px-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">My Advertisements</h1>
                        <p className="mt-2 text-slate-500">Track and manage your premium promotions across AcademyFind.</p>
                    </div>
                    <Link href="/advertise" className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 font-bold text-white transition hover:bg-amber-600 shadow-sm">
                        <PlusCircle className="h-5 w-5" /> Create New Ad
                    </Link>
                </div>

                <div className="grid gap-6">
                    {advertisements.map((ad) => (
                        <div key={ad.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="relative h-48 w-full md:w-64 shrink-0 rounded-2xl bg-slate-100 overflow-hidden">
                                    {ad.images && ad.images.length > 0 ? (
                                        <img src={ad.images[0]} alt={ad.title} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-slate-400">No Image</div>
                                    )}
                                    <div className="absolute top-3 left-3 flex flex-col gap-1">
                                        <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm inline-block self-start ${
                                            ad.status === 'APPROVED' ? 'bg-green-500' :
                                            ad.status === 'REJECTED' ? 'bg-red-500' :
                                            ad.status === 'EXPIRED' ? 'bg-slate-500' : 'bg-amber-500'
                                        }`}>
                                            {ad.status}
                                        </span>
                                        {ad.editRequestData && (
                                            <span className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-purple-500 text-white shadow-sm inline-block self-start">
                                                Edit Pending
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-xl font-bold text-slate-900">{ad.title}</h3>
                                            <div className="text-right">
                                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Paid</span>
                                                <span className="inline-flex items-center text-lg font-extrabold text-slate-700">
                                                    <IndianRupee className="h-4 w-4 mr-0.5" />{ad.pricePaid}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="mt-2 text-sm text-slate-600 line-clamp-2 max-w-2xl">{ad.description || "No description provided."}</p>
                                        
                                        <div className="mt-6 flex flex-wrap gap-8 text-sm">
                                            <div>
                                                <p className="font-semibold text-slate-400 text-xs uppercase tracking-wider mb-1">Dates</p>
                                                <p className="text-slate-800 font-medium">Submitted: {format(new Date(ad.createdAt), "dd MMM, yyyy")}</p>
                                                {ad.expiryDate && (
                                                    <p className={`mt-1 font-medium ${new Date(ad.expiryDate) < new Date() ? 'text-red-500' : 'text-slate-600'}`}>
                                                        Expires: {format(new Date(ad.expiryDate), "dd MMM, yyyy")}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-400 text-xs uppercase tracking-wider mb-1">Performance</p>
                                                <p className="text-slate-800 font-medium">Views: <span className="text-amber-500">{ad.views}</span></p>
                                                <p className="text-slate-800 font-medium mt-1">Clicks: <span className="text-amber-500">{ad.clicks}</span></p>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-400 text-xs uppercase tracking-wider mb-1">Visibility</p>
                                                <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                                                    ad.visibility === 'VISIBLE' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                                                }`}>
                                                    {ad.visibility}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-6 border-t border-slate-100 pt-5 flex items-center justify-between">
                                        <span className="text-xs text-slate-400 font-medium">
                                            {ad.isRenewalRequest ? "Renewal request is pending." : "Manage this advertisement."}
                                        </span>
                                        
                                        <div className="flex gap-3">
                                            <Link href={`/user/advertisements/${ad.id}`} className="flex items-center gap-1.5 rounded-xl bg-slate-800 px-4 py-2 text-sm font-bold text-white hover:bg-slate-900 transition-colors shadow-sm">
                                                <Edit className="h-4 w-4" /> View / Edit
                                            </Link>
                                            
                                            {ad.status === 'EXPIRED' && !ad.isRenewalRequest && (
                                                <form action={async () => { "use server"; await renewAdvertisementRequest(ad.id); }}>
                                                    <button className="flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700 hover:bg-amber-100 transition-colors">
                                                        <RefreshCw className="h-4 w-4" /> Request Renewal
                                                    </button>
                                                </form>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {advertisements.length === 0 && (
                        <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 shadow-sm">
                            <div className="mb-5 rounded-full bg-amber-50 p-6 border border-amber-100">
                                <Megaphone className="h-10 w-10 text-amber-500" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">You don't have any advertisements yet.</h3>
                            <p className="mt-2 text-slate-500 max-w-md">Promote your institute on AcademyFind to reach thousands of active students searching for coaching.</p>
                            <Link href="/advertise" className="mt-8 rounded-xl bg-amber-500 px-8 py-3.5 text-sm font-bold text-white transition hover:bg-amber-600 shadow-md">
                                Start Advertising Today
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
