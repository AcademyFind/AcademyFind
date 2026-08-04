import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { formatIST } from "@/lib/utils";
import { ArrowLeft, Mail, Phone, Calendar, MessageSquareQuote } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ContactChat from "@/components/contact/ContactChat";

export default async function ContactMessageDetail({ params }: { params: Promise<{ messageId: string }> }) {
    const {messageId} = await params;

    const message = await prisma.contactMessage.findUnique({
        where: { id: messageId },
        include: {
            replies: {
                orderBy: { createdAt: 'asc' }
            }
        }
    });

    if (!message) notFound();

    if (!message.isRead) {
        await prisma.contactMessage.update({
            where: { id: messageId },
            data: { isRead: true }
        });
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12 font-sans w-full p-4 md:p-8">
            
            {/* Back Button */}
            <Link href="/af-ass-manage/contactmessages" className="inline-flex items-center text-sm font-semibold text-stone-500 hover:text-stone-800 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Inbox
            </Link>

            <Card className="border-stone-200 shadow-sm overflow-hidden bg-white">
                
                {/* Email Header Style */}
                <CardHeader className="bg-stone-50 p-6 md:p-8 border-b border-stone-100">
                    <h1 className="text-3xl font-black text-stone-800 tracking-tight mb-6">
                        {message.subject || "(No Subject Provided)"}
                    </h1>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-stone-200 text-stone-600 rounded-full flex items-center justify-center font-bold text-xl shrink-0 shadow-inner border border-stone-300">
                                {message.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div className="font-bold text-stone-800 text-lg leading-tight">{message.name}</div>
                                <div className="text-sm text-stone-500 flex items-center gap-1.5 mt-1 font-medium">
                                    <Mail className="w-3.5 h-3.5" /> 
                                    <a href={`mailto:${message.email}`} className="hover:text-stone-800 hover:underline">{message.email}</a>
                                </div>
                            </div>
                        </div>

                        <div className="text-left sm:text-right text-sm text-stone-500 bg-white p-3 rounded-xl border border-stone-200 shadow-sm">
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

                {/* Optional Phone Number Strip */}
                {message.phone && (
                    <div className="bg-stone-100/50 px-6 py-3 border-b border-stone-100 flex items-center gap-2 text-sm text-stone-700 font-medium">
                        <Phone className="w-4 h-4 text-stone-500" />
                        <strong className="text-stone-800">Phone Number Provided:</strong> 
                        <a href={`tel:${message.phone}`} className="text-emerald-700 hover:underline font-mono font-bold bg-white px-2 py-0.5 rounded border border-stone-200 shadow-sm">{message.phone}</a>
                    </div>
                )}

                {/* Message Body */}
                <CardContent className="p-6 md:p-8">
                    <div className="flex items-center gap-2 text-sm font-bold text-stone-400 uppercase tracking-wider mb-4">
                        <MessageSquareQuote className="w-4 h-4" /> User Message
                    </div>
                    <div className="text-stone-700 leading-relaxed whitespace-pre-wrap text-base bg-stone-50 p-6 rounded-2xl border border-stone-100 shadow-inner font-medium">
                        {message.message}
                    </div>
                </CardContent>
                <Separator className="bg-stone-100" />

            </Card>

            {/* Interactive Chat Section */}
            <ContactChat 
                messageId={message.id} 
                replies={message.replies} 
                currentUserType="ADMIN" 
            />

        </div>
    );
}