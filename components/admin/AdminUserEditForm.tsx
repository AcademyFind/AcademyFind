"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { Save, UserCog, ShieldAlert, CheckCircle2, XCircle } from "lucide-react";
import { updateAdminUser } from "@/lib/User/admin/adminUserUpdate"; // Path check kar lena

export default function AdminUserEditForm({ user }: { user: any }) {
    const [isLoading, setIsLoading] = useState(false);
    const [isActive, setIsActive] = useState(user.isActive);
    const [canAddInstitute, setCanAddInstitute] = useState(user.canAddInstitute);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        formData.append("isActive", String(isActive));
        formData.append("canAddInstitute", String(canAddInstitute));

        const result = await updateAdminUser(user.id, formData);

        if (result.success) {
            toast.success(result.message || "User data updated");
        } else {
            toast.error(result.error || "Can't update user");
        }
        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 border-b pb-3">
                <UserCog className="w-5 h-5 text-blue-600" /> Edit Profile & Permissions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                    <Input name="name" defaultValue={user.name || ""} placeholder="Unknown" />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                    <Input name="phone" defaultValue={user.phone || ""} placeholder="N/A" />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Platform Role</label>
                    <select name="role" defaultValue={user.role} className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="USER">Standard User</option>
                        <option value="SALES_MANAGER">Sales Manager</option>
                        <option value="INSTITUTE_MANAGER">Institute Manager</option>
                        <option value="ADMIN">Administrator</option>
                    </select>
                </div>
            </div>

            {/* Powerful Toggles */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
                {/* Active Status */}
                <div
                    onClick={() => setIsActive(!isActive)}
                    className={`flex-1 flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${isActive ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}
                >
                    <div>
                        <div className={`font-bold text-sm ${isActive ? 'text-emerald-800' : 'text-red-800'}`}>Account Status</div>
                        <div className={`text-xs ${isActive ? 'text-emerald-600' : 'text-red-600'}`}>{isActive ? 'User can log in normally' : 'Account is banned/suspended'}</div>
                    </div>
                    {isActive ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <XCircle className="w-6 h-6 text-red-500" />}
                </div>

                {/* Add Institute Permission */}
                <div
                    onClick={() => setCanAddInstitute(!canAddInstitute)}
                    className={`flex-1 flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${canAddInstitute ? 'bg-purple-50 border-purple-200' : 'bg-slate-50 border-slate-200'}`}
                >
                    <div>
                        <div className={`font-bold text-sm ${canAddInstitute ? 'text-purple-800' : 'text-slate-700'}`}>Create Listing Pass</div>
                        <div className={`text-xs ${canAddInstitute ? 'text-purple-600' : 'text-slate-500'}`}>{canAddInstitute ? 'Can submit new institutes' : 'Standard limits applied'}</div>
                    </div>
                    {canAddInstitute ? <CheckCircle2 className="w-6 h-6 text-purple-500" /> : <ShieldAlert className="w-6 h-6 text-slate-400" />}
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 font-bold gap-2">
                    {isLoading ? "Saving..." : <><Save className="w-4 h-4" /> Save Changes</>}
                </Button>
            </div>
        </form>
    );
}