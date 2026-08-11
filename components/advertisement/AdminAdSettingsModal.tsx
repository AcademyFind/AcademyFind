"use client";

import { useState } from "react";
import { X, Settings, Loader2 } from "lucide-react";
import { updateAdSettings } from "@/lib/advertisement/admin-settings-actions";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function AdminAdSettingsModal({
    isOpen,
    onClose,
    initialSettings
}: {
    isOpen: boolean;
    onClose: () => void;
    initialSettings: { rate: number; maxImages: number };
}) {
    const [rate, setRate] = useState(initialSettings.rate.toString());
    const [maxImages, setMaxImages] = useState(initialSettings.maxImages.toString());
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    if (!isOpen) return null;

    const handleSave = async () => {
        const numRate = parseInt(rate, 10);
        const numMaxImages = parseInt(maxImages, 10);

        if (isNaN(numRate) || numRate < 0) return toast.error("Invalid rate");
        if (isNaN(numMaxImages) || numMaxImages < 1 || numMaxImages > 10) return toast.error("Max images must be between 1 and 10");

        setIsSaving(true);
        try {
            const res = await updateAdSettings(numRate, numMaxImages);
            if (res.success) {
                toast.success("Settings updated successfully!");
                router.refresh();
                onClose();
            } else {
                toast.error(res.error || "Failed to update settings");
            }
        } catch (error) {
            toast.error("Error saving settings");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
                    <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
                        <Settings className="h-5 w-5 text-indigo-500" /> Advertisement Settings
                    </h3>
                    <button onClick={onClose} className="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Ad Rate (₹ per month)</label>
                        <input 
                            type="number" 
                            value={rate}
                            onChange={(e) => setRate(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                            min="0"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Max Images Allowed</label>
                        <input 
                            type="number" 
                            value={maxImages}
                            onChange={(e) => setMaxImages(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                            min="1"
                            max="10"
                        />
                        <p className="text-xs text-slate-500 mt-1">Minimum 1, Maximum 10</p>
                    </div>
                </div>
                <div className="flex justify-end gap-3 border-t border-slate-100 p-4 bg-slate-50">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition">Cancel</button>
                    <button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-50 transition"
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
