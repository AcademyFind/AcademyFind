import { prisma } from "@/lib/prisma";
import { getCachedSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatIST } from "@/lib/utils";
import { MessageCircle, Clock, CheckCircle, ArrowLeft } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default async function SupportTicketsPage() {
  const session = await getCachedSession();
  if (!session?.user) redirect("/login");

  // Fetch tickets that belong to the user (either by ID or email)
  const tickets = await prisma.contactMessage.findMany({
    where: {
      OR: [
        { userId: session.user.id },
        { email: session.user.email },
      ],
    },
    include: {
      replies: {
        select: { id: true }
      }
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 p-4 md:p-8">
      <div className="mb-2">
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
        </Link>
      </div>
      <div>
        <h1 className="text-3xl font-black text-slate-800">Support Tickets</h1>
        <p className="text-slate-500 mt-1">View and manage your support requests and inquiries.</p>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-100">
          <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700">No tickets found</h3>
          <p className="text-slate-500">You haven't contacted support yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {tickets.map((ticket: any) => (
            <Link key={ticket.id} href={`/support/${ticket.id}`}>
              <Card className="hover:border-amber-400 hover:shadow-md transition-all cursor-pointer bg-white group">
                <CardHeader className="p-5 pb-3">
                  <div className="flex justify-between items-start">
                    <div className="font-bold text-lg text-slate-800 group-hover:text-amber-700 transition-colors line-clamp-1">
                      {ticket.subject || "No Subject"}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                      {ticket.replies.length > 0 ? (
                        <><CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Replied</>
                      ) : (
                        <><Clock className="w-3.5 h-3.5 text-amber-600" /> Pending</>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                    {ticket.message}
                  </p>
                  <div className="flex justify-between items-center text-xs text-slate-400 font-medium">
                    <span>Ticket ID: {ticket.id}</span>
                    <span>Last updated: {formatIST(ticket.updatedAt, "dd MMM yyyy")}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
