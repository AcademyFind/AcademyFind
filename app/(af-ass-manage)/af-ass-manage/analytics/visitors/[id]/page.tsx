import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, MapPin, Monitor, Smartphone, Globe, Clock, MousePointer2, Search, Link as LinkIcon, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const revalidate = 0;

export default async function VisitorJourneyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await prisma.visitorSession.findUnique({
    where: { id },
    include: {
      user: {
        select: { name: true, email: true, image: true },
      },
      events: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!session) {
    notFound();
  }

  const firstEvent = session.events[0];
  const lastEvent = session.events[session.events.length - 1];

  let timeSpent = "0m";
  if (firstEvent && lastEvent) {
    const diffMs = lastEvent.createdAt.getTime() - firstEvent.createdAt.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);
    timeSpent = `${diffMins}m ${diffSecs}s`;
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case "SEARCH": return <Search className="w-5 h-5 text-indigo-500" />;
      case "CLICK": return <MousePointer2 className="w-5 h-5 text-emerald-500" />;
      default: return <LinkIcon className="w-5 h-5 text-blue-500" />; // PAGE_VIEW
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "SEARCH": return "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400";
      case "CLICK": return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400";
      default: return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400";
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-4xl mx-auto">
      <Link
        href="/af-ass-manage/analytics/visitors"
        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Live Visitors
      </Link>

      {/* User Profile Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Globe className="w-64 h-64" />
        </div>
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center relative z-10">
            <div className="flex-shrink-0">
              {session.user?.image ? (
                <img src={session.user.image} alt="" className="w-24 h-24 rounded-full shadow-md object-cover ring-4 ring-white dark:ring-slate-800" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-4xl shadow-md ring-4 ring-white dark:ring-slate-800">
                  {session.user?.name?.charAt(0) || "A"}
                </div>
              )}
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {session.user?.name || "Anonymous Visitor"}
                </h1>
                {session.user?.email && (
                  <p className="text-slate-500 mt-1">{session.user.email}</p>
                )}
                {!session.userId && (
                  <p className="text-slate-500 mt-1 font-mono text-xs bg-slate-200/50 dark:bg-slate-800 p-1.5 rounded inline-block">
                    ID: {session.cookieId}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                  <MapPin className="w-4 h-4 mr-2 text-rose-500" />
                  {session.city}, {session.country}
                </div>
                <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                  {session.device === "Mobile" ? (
                    <Smartphone className="w-4 h-4 mr-2 text-sky-500" />
                  ) : (
                    <Monitor className="w-4 h-4 mr-2 text-sky-500" />
                  )}
                  {session.browser} on {session.os}
                </div>
                <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                  <Clock className="w-4 h-4 mr-2 text-amber-500" />
                  {timeSpent} duration
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Section */}
      <div className="mt-12">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-8 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-indigo-500" />
          Journey Timeline
        </h3>

        <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 md:ml-6 space-y-8 pb-8">
          {session.events.map((event: any, index: any) => (
            <div key={event.id} className="relative pl-8 md:pl-10 group">
              {/* Timeline Dot */}
              <div className={`absolute -left-[17px] top-1 p-1.5 rounded-full border-4 border-white dark:border-slate-950 ${getEventColor(event.eventType)}`}>
                {getEventIcon(event.eventType)}
              </div>

              {/* Event Content */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow group-hover:border-indigo-200 dark:group-hover:border-indigo-900">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getEventColor(event.eventType)} uppercase tracking-wider`}>
                      {event.eventType}
                    </span>

                    <span className="text-sm font-medium text-slate-900 dark:text-white break-all">
                      <a href={event.pageUrl || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline decoration-indigo-300 dark:decoration-indigo-700 underline-offset-2 transition-colors">
                        {(() => {
                          const url = event.pageUrl;
                          if (!url) return 'Unknown';
                          if (url === '/') return 'Home Page';
                          if (url.startsWith('/institute/')) {
                            const slug = url.split('/institute/')[1];
                            if (slug) return `Visited Institute: ${slug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`;
                          }
                          if (url.startsWith('/categories/')) {
                            const slug = url.split('/categories/')[1];
                            if (slug) return `Visited Category: ${slug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`;
                          }
                          if (url.startsWith('/search')) {
                            const query = new URLSearchParams(url.split('?')[1]).get('q');
                            if (query) return `Searched for: "${query}"`;
                            return 'Search Page';
                          }
                          if (url === '/login') return 'Login Page';
                          if (url === '/register') return 'Registration Page';
                          if (url === '/about') return 'About Us';
                          if (url === '/contact') return 'Contact Page';
                          return url;
                        })()}
                      </a>
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400 whitespace-nowrap bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded">
                    {format(new Date(event.createdAt), "hh:mm:ss a")}
                  </span>
                </div>

                {event.details && (
                  <div className="mt-3 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50 text-sm text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-slate-700 dark:text-slate-200 mr-2">Details:</span>
                    {event.details}
                  </div>
                )}
              </div>
            </div>
          ))}

          {session.events.length === 0 && (
            <div className="pl-8 text-slate-500">No events logged for this session yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
