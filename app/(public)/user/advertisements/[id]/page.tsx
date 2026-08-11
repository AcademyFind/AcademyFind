import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdvertisementEditForm from "@/components/advertisement/AdvertisementEditForm";
import AdvertisementAnalyticsTable from "@/components/advertisement/AdvertisementAnalyticsTable";
import { getAdSettings } from "@/lib/advertisement/admin-settings-actions";
import Link from "next/link";
import { ArrowLeft, Megaphone, Eye, MousePointerClick, Calendar, CreditCard } from "lucide-react";
import { format } from "date-fns";

export default async function UserAdvertisementDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        redirect("/login");
    }

    const ad = await prisma.advertisement.findFirst({
        where: { id: params.id, userId: session.user.id }
    });

    if (!ad) {
        redirect("/user/advertisements");
    }

    const settings = await getAdSettings();

    const statusColors: Record<string, string> = {
        PENDING: "bg-blue-100 text-blue-700 border-blue-200",
        APPROVED: "bg-green-100 text-green-700 border-green-200",
        REJECTED: "bg-red-100 text-red-700 border-red-200",
        EXPIRED: "bg-slate-100 text-slate-700 border-slate-200",
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/user/advertisements" className="p-2 bg-white rounded-full border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm">
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                        <Megaphone className="w-6 h-6 text-amber-500" />
                        Advertisement Dashboard
                    </h1>
                    <p className="text-sm text-slate-500 font-medium">Manage and view analytics for your advertisement</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content: Edit Form / Details */}
                <div className="lg:col-span-2 space-y-6">
                    <AdvertisementEditForm ad={ad} settings={settings} />
                    <AdvertisementAnalyticsTable adId={ad.id} />
                </div>

                {/* Sidebar: Stats & Info */}
                <div className="space-y-6">
                    {/* Status Card */}
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Current Status</h4>
                        <div className={`inline-flex items-center px-4 py-2 rounded-xl font-bold border ${statusColors[ad.status]}`}>
                            {ad.status}
                        </div>
                        {ad.status === 'APPROVED' && ad.expiryDate && (
                            <p className="text-xs text-slate-500 mt-3 font-medium flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                Expires on {format(new Date(ad.expiryDate), "MMM dd, yyyy")}
                            </p>
                        )}
                    </div>

                    {/* Analytics Card */}
                    {ad.status === 'APPROVED' && (
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Performance</h4>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                                        <Eye className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <p className="text-3xl font-black text-slate-800">{ad.views.toLocaleString()}</p>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Total Views</p>
                                </div>
                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mb-3">
                                        <MousePointerClick className="w-4 h-4 text-green-600" />
                                    </div>
                                    <p className="text-3xl font-black text-slate-800">{ad.clicks.toLocaleString()}</p>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Total Clicks</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Payment Info */}
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            Payment Information
                        </h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                                <span className="text-sm text-slate-500">Amount Paid</span>
                                <span className="text-sm font-bold text-slate-800">₹{ad.pricePaid}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                                <span className="text-sm text-slate-500">UTR Number</span>
                                <span className="text-sm font-bold text-slate-800 tracking-wider">{ad.utrNumber || 'N/A'}</span>
                            </div>
                            {ad.paymentScreenshot && (
                                <div className="pt-2">
                                    <span className="text-xs text-slate-500 block mb-2 font-medium">Screenshot Uploaded</span>
                                    <div className="w-full h-24 rounded-xl overflow-hidden border border-slate-200 relative group">
                                        <img src={ad.paymentScreenshot} alt="Payment Receipt" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
