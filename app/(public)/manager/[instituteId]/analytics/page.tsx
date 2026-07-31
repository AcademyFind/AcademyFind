import { prisma } from "@/lib/prisma";
import { Lock, BarChart3, Users, Bookmark, Clock } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { formatIST } from "@/lib/utils"; // Date format karne ke liye
import { DemographicsCharts } from "@/components/manager/AnalyticsCharts";

export default async function AnalyticsPage({ params }: { params: Promise<{ instituteId: string }> }) {
    const { instituteId } = await params;

    // 🚀 UPDATE: Database se count ke sath-saath actual users ki list bhi fetch kar rahe hain
    const institute = await prisma.institute.findUnique({
        where: { id: instituteId },
        include: {
            _count: { select: { viewHistory: true, shortlistedBy: true } },
            // Latest students jinhone save/shortlist kiya (ALL)
            shortlistedBy: {
                include: { user: { select: { name: true, email: true, image: true, username: true } } },
                orderBy: { createdAt: 'desc' }
            },
            // Latest 50 students jinhone profile view ki
            viewHistory: {
                include: { user: { select: { name: true, email: true, image: true, username: true } } },
                orderBy: { viewedAt: 'desc' },
                take: 50
            }
        }
    });

    if (!institute) return <div>Institute not found</div>;

    // 🔒 LOCK SCREEN FOR BASIC & PREMIUM
    if (institute.subscriptionPlan === "BASIC" || institute.subscriptionPlan === "VERIFIED") {
        return (
            <div className="min-h-[500px] flex flex-col items-center justify-center text-center p-8 bg-stone-50/50 rounded-3xl border border-dashed border-stone-200">
                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-6">
                    <Lock className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-stone-800 mb-2">Audience Analytics Locked</h2>
                <p className="text-stone-500 max-w-md mb-6">
                    Want to see exactly how many students view and save your academy profile? Upgrade to the <b>Ultra Plan</b> for deep insights.
                </p>
                <Link href={`/manager/${instituteId}/subscription`} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium transition">
                    Get Ultra Plan
                </Link>
            </div>
        );
    }

    // 🔓 UNLOCKED VIEW FOR ULTRA

    // Fetch Detailed Analytics Data (New Feature)
    const visits = await prisma.instituteVisit.findMany({
        where: { instituteId },
        select: { city: true, deviceType: true, duration: true }
    });

    // Calculate average duration
    const avgDuration = visits.length > 0
        ? Math.round(visits.reduce((acc: number, curr: { duration: number; }) => acc + curr.duration, 0) / visits.length)
        : 0;

    // Aggregate Device data
    const deviceMap: Record<string, number> = {};
    visits.forEach((v: any) => {
        const dev = v.deviceType || "Unknown";
        deviceMap[dev] = (deviceMap[dev] || 0) + 1;
    });
    const deviceData = Object.keys(deviceMap).map(k => ({ name: k, value: deviceMap[k] }));

    // Aggregate City data
    const cityMap: Record<string, number> = {};
    visits.forEach((v: any) => {
        const city = v.city || "Unknown";
        cityMap[city] = (cityMap[city] || 0) + 1;
    });
    const cityData = Object.keys(cityMap)
        .map((k: any) => ({ name: k, value: cityMap[k] }))
        .sort((a: { value: number; }, b: { value: number; }) => b.value - a.value); // Sort descending

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-extrabold text-stone-900 flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-indigo-600" /> Performance Analytics
                </h2>
                <p className="text-sm text-stone-500 mt-1">Track your academy's visibility and see which students are interested.</p>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Views Card */}
                <div className="p-6 border border-stone-100 bg-white shadow-sm rounded-2xl flex items-center gap-4">
                    <div className="p-4 bg-[#ebdbb7]/20 text-stone-800 rounded-2xl"><Users className="w-8 h-8" /></div>
                    <div>
                        <p className="text-sm font-semibold text-stone-500 uppercase tracking-wide">Total Profile Views</p>
                        <h3 className="text-3xl font-extrabold text-stone-800 mt-1">{institute._count.viewHistory}</h3>
                    </div>
                </div>

                {/* Shortlists Card */}
                <div className="p-6 border border-stone-100 bg-white shadow-sm rounded-2xl flex items-center gap-4">
                    <div className="p-4 bg-red-50 text-red-500 rounded-2xl"><Bookmark className="w-8 h-8" /></div>
                    <div>
                        <p className="text-sm font-semibold text-stone-500 uppercase tracking-wide">Students Shortlisted</p>
                        <h3 className="text-3xl font-extrabold text-stone-800 mt-1">{institute._count.shortlistedBy}</h3>
                    </div>
                </div>
            </div>

            {/* 🚀 NEW: Demographics & Engagement Charts */}
            <DemographicsCharts
                cityData={cityData}
                deviceData={deviceData}
                avgDuration={avgDuration}
            />

            {/* 🚀 Detailed Lists of Users */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">

                {/* Shortlisted Users List */}
                <div className="border border-stone-100 bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col h-[500px]">
                    <div className="p-5 border-b bg-stone-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Bookmark className="w-5 h-5 text-red-500" />
                            <h3 className="font-bold text-stone-800">Shortlisted By</h3>
                        </div>
                        <span className="text-xs font-bold text-stone-400 bg-stone-200/50 px-2 py-1 rounded-md">All Time ({institute.shortlistedBy.length})</span>
                    </div>
                    <div className="p-4 overflow-y-auto flex-1 space-y-2">
                        {institute.shortlistedBy.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-stone-400 text-sm">
                                No students have saved your profile yet.
                            </div>
                        ) : (
                            institute.shortlistedBy.map((item) => (
                                <UserListItem
                                    key={item.userId}
                                    user={item.user}
                                    date={item.createdAt}
                                    actionType="Saved"
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Profile Viewers List */}
                <div className="border border-stone-100 bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col h-[500px]">
                    <div className="p-5 border-b bg-stone-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-500" />
                            <h3 className="font-bold text-stone-800">Recent Profile Viewers</h3>
                        </div>
                        <span className="text-xs font-bold text-stone-400 bg-stone-200/50 px-2 py-1 rounded-md">Latest 50</span>
                    </div>
                    <div className="p-4 overflow-y-auto flex-1 space-y-2">
                        {institute.viewHistory.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-stone-400 text-sm">
                                No recent views found.
                            </div>
                        ) : (
                            institute.viewHistory.map((item) => (
                                <UserListItem
                                    key={item.id}
                                    user={item.user}
                                    date={item.viewedAt}
                                    actionType="Viewed"
                                />
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

// 🚀 HELPER COMPONENT: User ki details dikhane ke liye (Isi file me sabse niche rakhein)
function UserListItem({ user, date, actionType }: { user: any, date: Date, actionType: string }) {
    if (!user) return null;
    const content = (
        <div className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-stone-50 border border-transparent hover:border-stone-100 transition-all">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center font-bold text-stone-600 overflow-hidden shrink-0 border shadow-sm">
                    {user?.image ? (
                        <img src={user.image} alt={user.name || "User"} className="w-full h-full object-cover" />
                    ) : (
                        user?.name?.charAt(0).toUpperCase() || "U"
                    )}
                </div>
                <div>
                    <p className="text-sm font-bold text-stone-800">{user?.name || "Anonymous Student"}</p>
                    <p className="text-xs text-stone-500">{user?.email || "Email hidden"}</p>
                </div>
            </div>
            <div className="text-right shrink-0">
                <p className="text-[10px] text-stone-400 uppercase font-semibold flex items-center justify-end gap-1">
                    <Clock className="w-3 h-3" /> {actionType}
                </p>
                <p className="text-xs text-stone-600 mt-0.5">
                    {formatIST(date, "MMM d, h:mm a")}
                </p>
            </div>
        </div>
    );

    if (user.username) {
        return (
            <Link href={`/u/${user.username}`} target="_blank" className="block">
                {content}
            </Link>
        );
    }

    return content;
}