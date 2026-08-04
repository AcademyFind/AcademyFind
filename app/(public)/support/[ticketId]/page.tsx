import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatIST } from "@/lib/utils";
import { Mail, Calendar, MessageSquareQuote } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ContactChat from "@/components/contact/ContactChat";

export default async function SupportTicketPage({ params }: { params: Promise<{ ticketId: string }> }) {
    const { ticketId } = await params;

    const message = await prisma.contactMessage.findUnique({
        where: { id: ticketId },
        include: {
            replies: {
                orderBy: { createdAt: 'asc' }
            }
        }
    });

    if (!message) notFound();

    return (
        <>
            <main className="min-h-screen bg-stone-50 py-12 px-4 md:px-8">
                <div className="max-w-4xl mx-auto space-y-6 pb-12 font-sans w-full">
                    
                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-stone-800 tracking-tight">Support Ticket</h1>
                        <p className="text-stone-500 mt-2">Ticket ID: <span className="font-mono bg-stone-200 px-2 py-0.5 rounded text-sm text-stone-700">{message.id}</span></p>
                    </div>

                    <Card className="border-stone-200 shadow-sm overflow-hidden bg-white">
                        
                        <CardHeader className="bg-white p-6 md:p-8 border-b border-stone-100">
                            <h2 className="text-2xl font-bold text-stone-800 tracking-tight mb-6">
                                {message.subject || "(No Subject Provided)"}
                            </h2>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-bold text-xl shrink-0 shadow-inner border border-amber-200">
                                        {message.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-bold text-stone-800 text-lg leading-tight">{message.name}</div>
                                        <div className="text-sm text-stone-500 flex items-center gap-1.5 mt-1 font-medium">
                                            <Mail className="w-3.5 h-3.5" /> 
                                            {message.email}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-left sm:text-right text-sm text-stone-500 bg-stone-50 p-3 rounded-xl border border-stone-100 shadow-sm">
                                    <div className="flex items-center sm:justify-end gap-1.5 font-bold text-stone-700">
                                        <Calendar className="w-4 h-4 text-stone-400" />
                                        {formatIST(message.createdAt, "MMMM dd, yyyy")}
                                    </div>
                                    <div className="mt-1 text-xs font-medium text-stone-400">
                                        {formatIST(message.createdAt, "hh:mm a")}
                                    </div>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-6 md:p-8 bg-stone-50/50">
                            <div className="flex items-center gap-2 text-sm font-bold text-stone-400 uppercase tracking-wider mb-4">
                                <MessageSquareQuote className="w-4 h-4" /> Original Message
                            </div>
                            <div className="text-stone-700 leading-relaxed whitespace-pre-wrap text-base bg-white p-6 rounded-2xl border border-stone-100 shadow-sm font-medium">
                                {message.message}
                            </div>
                        </CardContent>
                    </Card>

                    <Separator className="my-8" />

                    {/* Interactive Chat Section */}
                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-stone-200">
                        <ContactChat 
                            messageId={message.id} 
                            replies={message.replies} 
                            currentUserType="USER" 
                        />
                    </div>

                </div>
            </main>
        </>
    );
}
