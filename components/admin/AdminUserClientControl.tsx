"use client"

import { useState } from "react"
import { updateUserRole, toggleUserStatus, createAdminToUserDm } from "@/lib/User/admin/adminUser"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { MessageSquare } from "lucide-react"

export function RoleSelect({ userId, currentRole }: { userId: string, currentRole: string }) {
    const [isLoading, setIsLoading] = useState(false);

    async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
        setIsLoading(true);
        const newRole = e.target.value as any;
        const result = await updateUserRole(userId, newRole);
        
        if (result.success) toast.success(result.message || "User role successfully updated");
        else toast.error(result.error || "cannot update user role");
        
        setIsLoading(false);
    }

    return (
        <select
            disabled={isLoading}
            value={currentRole}
            onChange={handleChange}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2 py-1.5 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
        >
            <option value="USER">USER</option>
            <option value="SALES_MANAGER">SALES_MANAGER</option>
            <option value="INSTITUTE_MANAGER">INSTITUTE_MANAGER</option>
            <option value="ADMIN">ADMIN</option>
            <option value="CONTENT_WRITER">CONTENT_WRITER</option>

        </select>
    )
}

export function UserStatusToggle({ userId, isActive }: { userId: string, isActive: boolean }) {
    const [isLoading, setIsLoading] = useState(false);

    async function handleToggle() {
        setIsLoading(true);
        const result = await toggleUserStatus(userId, isActive);
        
        if (result.success) toast.success(result.message || "user scuccessfully hidden");
        else toast.error(result.error || "user can't be hidden");
        
        setIsLoading(false);
    }

    return (
        <button
            onClick={handleToggle}
            disabled={isLoading}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isActive 
                    ? "bg-red-50 text-red-600 hover:bg-red-100" 
                    : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
            }`}
        >
            {isLoading ? "..." : (isActive ? "Block User" : "Unblock")}
        </button>
    )
}

export function AdminMessageUserButton({ userId, userName }: { userId: string, userName?: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function handleMessage() {
        setIsLoading(true);
        const result = await createAdminToUserDm(userId);
        
        if (result.success && result.conversationId) {
            toast.success("Starting conversation...");
            router.push(`/chat/${result.conversationId}`);
        } else {
            toast.error(result.error || "Cannot message this user");
            setIsLoading(false);
        }
    }

    return (
        <button
            onClick={handleMessage}
            disabled={isLoading}
            title={userName ? `Message ${userName}` : "Message User"}
            className="flex items-center justify-center p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <MessageSquare className="w-4 h-4" />
        </button>
    )
}