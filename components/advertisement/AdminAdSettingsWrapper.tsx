"use client";

import { useState } from "react";
import { Settings } from "lucide-react";
import AdminAdSettingsModal from "./AdminAdSettingsModal";

export default function AdminAdSettingsWrapper({ initialSettings }: { initialSettings: { rate: number; maxImages: number } }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button 
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 rounded-lg bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-600 border border-indigo-200 hover:bg-indigo-100 transition shadow-sm"
            >
                <Settings className="h-4 w-4" /> Settings
            </button>
            <AdminAdSettingsModal 
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                initialSettings={initialSettings}
            />
        </>
    );
}
