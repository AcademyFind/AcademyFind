"use client";

import { useState } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { approveAdvertisementEdit, rejectAdvertisementEdit } from "@/lib/advertisement/admin-actions";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function AdminAdApprovalActions({ adId }: { adId: string }) {
    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const router = useRouter();

    const handleApprove = async () => {
        setIsApproving(true);
        const res = await approveAdvertisementEdit(adId);
        if (res.success) {
            toast.success("Edit approved and applied.");
            router.refresh();
        } else {
            toast.error(res.error || "Failed to approve edit");
        }
        setIsApproving(false);
    };

    const handleReject = async () => {
        setIsRejecting(true);
        const res = await rejectAdvertisementEdit(adId);
        if (res.success) {
            toast.success("Edit rejected and discarded.");
            router.refresh();
        } else {
            toast.error(res.error || "Failed to reject edit");
        }
        setIsRejecting(false);
    };

    return (
        <div className="flex gap-3">
            <button 
                onClick={handleReject}
                disabled={isRejecting || isApproving}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 font-bold transition-colors disabled:opacity-50"
            >
                {isRejecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                Reject Edit
            </button>
            <button 
                onClick={handleApprove}
                disabled={isRejecting || isApproving}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 font-bold shadow-md shadow-green-500/20 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
                {isApproving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Approve Edit
            </button>
        </div>
    );
}
