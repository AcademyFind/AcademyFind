"use client";

import { useState } from "react";
import { formatIST } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";
import { Send, User as UserIcon, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";

type ContactReply = {
  id: string;
  sender: "ADMIN" | "USER";
  message: string;
  createdAt: Date | string;
};

export default function ContactChat({
  messageId,
  replies,
  currentUserType
}: {
  messageId: string;
  replies: ContactReply[];
  currentUserType: "ADMIN" | "USER";
}) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleReplySubmit = async () => {
    if (!content.trim()) {
      toast.error("Reply cannot be empty");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/contact/${messageId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, sender: currentUserType }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit reply");

      toast.success("Reply sent successfully");
      setContent("");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 mt-8">
      {/* Replies List */}
      {replies.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
            Conversation History
          </h3>
          <div className="flex flex-col gap-4">
            {replies.map((reply: ContactReply) => {
              const isMine = reply.sender === currentUserType;
              return (
                <div
                  key={reply.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-sm ${reply.sender === "ADMIN"
                        ? 'bg-amber-100/50 border border-amber-200 text-amber-900'
                        : 'bg-stone-50 border border-stone-200 text-stone-800'
                      }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {reply.sender === "ADMIN" ? (
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                      ) : (
                        <UserIcon className="w-3.5 h-3.5 text-stone-500" />
                      )}
                      <span className="text-xs font-bold uppercase tracking-wider opacity-70">
                        {reply.sender === "ADMIN" ? "Support Team" : "User"}
                      </span>
                      <span className="text-[10px] opacity-50 ml-2">
                        {formatIST(new Date(reply.createdAt), "dd MMM yyyy, hh:mm a")}
                      </span>
                    </div>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {reply.message}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reply Input Form */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-300 transition-all">
        <Textarea
          placeholder="Type your reply here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="border-0 focus-visible:ring-0 resize-none min-h-[120px] p-4 text-stone-700 placeholder:text-stone-400 bg-transparent"
        />
        <div className="bg-stone-50 px-4 py-3 border-t border-stone-100 flex justify-between items-center">
          <p className="text-xs text-stone-500 hidden sm:block">
            {currentUserType === "ADMIN" ? "This will send an email notification to the user." : "We will be notified of your reply."}
          </p>
          <Button
            onClick={handleReplySubmit}
            disabled={loading || !content.trim()}
            className="bg-stone-800 hover:bg-stone-900 text-white rounded-xl px-6"
          >
            {loading ? "Sending..." : (
              <>
                Send Reply <Send className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
