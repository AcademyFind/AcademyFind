import { fetchAdAnalytics } from "@/lib/advertisement/analytics-actions";
import { formatDistanceToNow } from "date-fns";
import { Eye, MousePointerClick, User as UserIcon, HelpCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function AdvertisementAnalyticsTable({ adId, isAdmin = false }: { adId: string, isAdmin?: boolean }) {
    const analytics = await fetchAdAnalytics(adId);

    // Group them for quick stats
    const totalViews = analytics.filter((a: any) => a.actionType === "VIEW").reduce((acc: number, curr: any) => acc + curr.count, 0);
    const totalClicks = analytics.filter((a: any) => a.actionType === "CLICK").reduce((acc: number, curr: any) => acc + curr.count, 0);

    return (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
            <div>
                <h3 className="text-xl font-black text-slate-800">Analytics Log (Recent)</h3>
                <p className="text-sm text-slate-500 mt-1">Showing up to the last 100 interactions with your advertisement.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center">
                        <Eye className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-amber-600 uppercase tracking-widest">Recent Views</p>
                        <p className="text-2xl font-black text-amber-900">{totalViews}</p>
                    </div>
                </div>
                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center">
                        <MousePointerClick className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">Recent Clicks</p>
                        <p className="text-2xl font-black text-blue-900">{totalClicks}</p>
                    </div>
                </div>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden mt-6">
                <div className="max-h-[400px] overflow-y-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500 sticky top-0 border-b border-slate-200 z-10">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-bold">Action</th>
                                <th scope="col" className="px-6 py-4 font-bold">Count</th>
                                <th scope="col" className="px-6 py-4 font-bold">User</th>
                                <th scope="col" className="px-6 py-4 font-bold">Last Activity</th>
                                <th scope="col" className="px-6 py-4 font-bold">Page</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {analytics.map((log: any) => (
                                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium">
                                        {log.actionType === "VIEW" ? (
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-700">
                                                <Eye className="h-3 w-3" /> View
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-bold text-blue-700">
                                                <MousePointerClick className="h-3 w-3" /> Click
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center justify-center min-w-[24px] h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                                            {log.count}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {log.user ? (
                                            <Link href={`/u/${log.user.username}`} target="_blank" className="flex items-center gap-3 hover:bg-slate-100 p-1 -ml-1 rounded-lg transition-colors w-max pr-3">
                                                <div className="relative h-8 w-8 overflow-hidden rounded-full bg-slate-200 border border-slate-300">
                                                    {log.user.image ? (
                                                        <Image src={log.user.image} alt={log.user.name || "User"} fill className="object-cover" />
                                                    ) : (
                                                        <UserIcon className="h-4 w-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-400" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-800 text-sm leading-tight">{log.user.name || log.user.username}</span>
                                                    <span className="text-[10px] text-slate-400 font-medium leading-tight">@{log.user.username}</span>
                                                </div>
                                            </Link>
                                        ) : (
                                            <div className="flex items-center gap-3 w-max p-1 -ml-1">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-slate-400">
                                                    <HelpCircle className="h-4 w-4" />
                                                </div>
                                                <span className="font-semibold text-slate-500 italic text-sm">Anonymous User</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-xs font-medium text-slate-500">
                                        {formatDistanceToNow(new Date(log.updatedAt || log.createdAt), { addSuffix: true })}
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-500 max-w-[150px] truncate" title={log.pageUrl || "Unknown"}>
                                        {log.pageUrl || "Unknown Page"}
                                    </td>
                                </tr>
                            ))}

                            {analytics.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                                        No interactions logged yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
