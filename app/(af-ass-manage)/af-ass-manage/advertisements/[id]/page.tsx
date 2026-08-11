import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Megaphone, CheckCircle2, User as UserIcon } from "lucide-react";
import AdminAdApprovalActions from "@/components/admin/AdminAdApprovalActions";
import { AdvertisementCarousel } from "@/components/advertisement/AdvertisementCarousel";
import AdminAdvertisementEditForm from "@/components/admin/AdminAdvertisementEditForm";
import AdvertisementAnalyticsTable from "@/components/advertisement/AdvertisementAnalyticsTable";

export default async function AdminAdvertisementDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;

    const ad = await prisma.advertisement.findUnique({
        where: { id: params.id },
        include: { user: true }
    });

    if (!ad) {
        redirect("/af-ass-manage/advertisements");
    }

    const pendingEdit: any = ad.editRequestData;

    return (
        <div className="max-w-6xl mx-auto space-y-8 p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/af-ass-manage/advertisements" className="p-2 bg-white rounded-full border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm">
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                            <Megaphone className="w-6 h-6 text-amber-500" />
                            Advertisement Review
                        </h1>
                        <p className="text-sm text-slate-500 font-medium">Review advertisement details and edits.</p>
                    </div>
                </div>
                {pendingEdit && (
                    <AdminAdApprovalActions adId={ad.id} />
                )}
            </div>

            {pendingEdit ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* OLD VERSION */}
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm opacity-70">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                            <h3 className="text-lg font-bold text-slate-600">Current Version (Old)</h3>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Title</p>
                                <p className="text-slate-700 font-medium line-through">{ad.title}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Description</p>
                                <p className="text-slate-600 line-through whitespace-pre-wrap">{ad.description || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Link</p>
                                <p className="text-slate-600 line-through break-all">{ad.linkUrl || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Images</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {ad.images.map((img: string, idx: number) => (
                                        <div key={idx} className="aspect-video rounded-xl overflow-hidden border border-slate-200 relative grayscale opacity-70">
                                            <Image src={img} alt={`Old ${idx}`} fill className="object-cover" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* NEW VERSION */}
                    <div className="bg-amber-50/50 p-6 rounded-[2rem] border-2 border-amber-200 shadow-sm relative">
                        <div className="absolute top-0 right-8 -translate-y-1/2 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md shadow-amber-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Pending Edit
                        </div>
                        <div className="flex items-center justify-between border-b border-amber-100 pb-4 mb-4">
                            <h3 className="text-lg font-black text-amber-900">Requested Changes (New)</h3>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Title</p>
                                <p className="text-slate-900 font-bold bg-white p-2 rounded-lg border border-amber-100 shadow-sm">{pendingEdit.title}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Description</p>
                                <p className="text-slate-800 bg-white p-2 rounded-lg border border-amber-100 shadow-sm whitespace-pre-wrap">{pendingEdit.description || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Link</p>
                                <p className="text-slate-800 bg-white p-2 rounded-lg border border-amber-100 shadow-sm break-all">{pendingEdit.linkUrl || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-3">Images ({pendingEdit.images.length})</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {pendingEdit.images.map((img: string, idx: number) => (
                                        <div key={idx} className="aspect-video rounded-xl overflow-hidden border-2 border-amber-300 shadow-md relative group">
                                            <img src={img} alt={`New ${idx}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <AdminAdvertisementEditForm ad={ad} />
                        
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                            <div className="mb-6">
                                <h3 className="text-xl font-black text-slate-800">{ad.title}</h3>
                                {ad.linkUrl && <a href={ad.linkUrl} target="_blank" className="text-sm text-blue-600 hover:underline">{ad.linkUrl}</a>}
                            </div>
                            
                            <AdvertisementCarousel ads={[ad]} />
                            
                            <div className="mt-6 pt-6 border-t border-slate-100">
                                <p className="text-slate-700 whitespace-pre-wrap">{ad.description || "No description provided."}</p>
                            </div>
                        </div>

                        <AdvertisementAnalyticsTable adId={ad.id} isAdmin={true} />
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <UserIcon className="w-4 h-4" />
                                Advertiser Details
                            </h4>
                            <div className="space-y-2">
                                <Link href={`/u/${ad.user.username}`} target="_blank" className="font-bold text-slate-800 hover:text-amber-600 hover:underline transition-colors block">
                                    {ad.user.name}
                                </Link>
                                <p className="text-sm text-slate-500">{ad.user.email}</p>
                                {ad.user.phone && <p className="text-sm text-slate-500">{ad.user.phone}</p>}
                            </div>
                        </div>
                        
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Payment</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-slate-500">Amount</span>
                                    <span className="text-sm font-bold text-slate-800">₹{ad.pricePaid}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-slate-500">UTR</span>
                                    <span className="text-sm font-bold text-slate-800">{ad.utrNumber || 'N/A'}</span>
                                </div>
                                {ad.paymentScreenshot && (
                                    <div className="pt-2">
                                        <a href={ad.paymentScreenshot} target="_blank" rel="noreferrer" className="block aspect-square rounded-xl overflow-hidden border border-slate-200">
                                            <img src={ad.paymentScreenshot} alt="Payment" className="w-full h-full object-cover" />
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
