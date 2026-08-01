import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Monitor, Smartphone, Globe, Clock, ChevronRight, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const metadata = {
  title: "Live Visitors | Analytics",
};

export const revalidate = 0; // Don't cache this page - keep it real-time

export default async function VisitorsPage() {
  // Fetch recent 50 visitors
  const recentSessions = await prisma.visitorSession.findMany({
    take: 50,
    orderBy: { updatedAt: "desc" },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          image: true,
        },
      },
      _count: {
        select: { events: true },
      },
    },
  });

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 bg-slate-50 min-h-screen dark:bg-slate-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Live Visitors
          </h2>
          <p className="text-slate-500 mt-1 text-sm">
            Real-time tracking of users currently browsing the platform.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-100 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300">
          <span className="relative flex h-2.5 w-2.5 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
          </span>
          Live Tracking Active
        </div>
      </div>

      <Card className="border-0 shadow-xl shadow-slate-200/50 dark:shadow-none dark:border dark:border-slate-800 overflow-hidden bg-white/60 backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-100/50 dark:bg-slate-800/50 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Location</th>
                <th className="px-6 py-4 font-semibold">Device / OS</th>
                <th className="px-6 py-4 font-semibold">Activity</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {recentSessions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <Activity className="h-8 w-8 mx-auto mb-3 text-slate-300 animate-pulse" />
                    Waiting for visitors...
                  </td>
                </tr>
              ) : (
                recentSessions.map((session: any) => {
                  const isOnline = new Date().getTime() - new Date(session.updatedAt).getTime() < 5 * 60 * 1000; // < 5 mins

                  return (
                    <tr
                      key={session.id}
                      className="group hover:bg-white dark:hover:bg-slate-800/50 transition-colors duration-200"
                    >
                      {/* User Cell */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {session.user?.image ? (
                              <img src={session.user.image} alt="" className="w-10 h-10 rounded-full object-cover shadow-sm" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                                {session.user?.name?.charAt(0) || "A"}
                              </div>
                            )}
                            {isOnline && (
                              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100">
                              {session.user?.name || "Anonymous Visitor"}
                            </p>
                            <p className="text-xs text-slate-500 truncate max-w-[150px]">
                              {session.userId ? "Logged In" : session.cookieId.split('-')[0]}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Location Cell */}
                      <td className="px-6 py-4">
                        <div className="flex items-center text-slate-700 dark:text-slate-300">
                          <Globe className="w-4 h-4 mr-2 text-slate-400" />
                          {session.city && session.city !== "Unknown City" ? (
                            <span>{session.city}, {session.country === "Unknown Country" ? "IN" : session.country}</span>
                          ) : (
                            <span className="italic opacity-60">Unknown Location</span>
                          )}
                        </div>
                      </td>

                      {/* Device Cell */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {session.device === "Mobile" ? (
                            <Smartphone className="w-4 h-4 text-slate-500" />
                          ) : (
                            <Monitor className="w-4 h-4 text-slate-500" />
                          )}
                          <span className="text-slate-700 dark:text-slate-300">
                            {session.browser} <span className="text-slate-400">on</span> {session.os}
                          </span>
                        </div>
                      </td>

                      {/* Activity Cell */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 w-fit">
                            <Activity className="w-3.5 h-3.5 text-indigo-500" />
                            {session._count.events} events
                          </span>
                          <span className="flex items-center text-xs text-slate-500">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })}
                          </span>
                        </div>
                      </td>

                      {/* Action Cell */}
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/af-ass-manage/analytics/visitors/${session.id}`}
                          className="inline-flex items-center justify-center p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm group-hover:border-indigo-200 group-hover:shadow-md dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-indigo-400"
                        >
                          <span className="sr-only">View Journey</span>
                          <ChevronRight className="w-5 h-5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
