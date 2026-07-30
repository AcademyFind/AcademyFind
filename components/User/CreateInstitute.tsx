"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";
import { UploadCloud, MapPin, Landmark, CheckCircle, Globe, User, Plus, X, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import LocationAutocomplete from "../search/LocationAutoComplete";
import { addInstitute } from "@/lib/User/user/create-institute";


export default function CreateInstituteForm({
    userId,
    allCities,
    allCategories,
    defaultName,
    defaultPhone
}: {
    userId: string;
    allCities: any[];
    allCategories: any[];
    defaultName?: string | null;
    defaultPhone?: string | null;
}) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [providerType, setProviderType] = useState<"INSTITUTE" | "INDIVIDUAL">("INSTITUTE");

    // Image State
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");

    // Location State
    const [location, setLocation] = useState({ lat: 0, lng: 0, address: "" });

    // Category Search State (for better UX)
    const [categorySearch, setCategorySearch] = useState("");

    const handleLocationSelect = (lat: number, lng: number, address: string) => {
        setLocation({ lat, lng, address });
        toast.success("Location locked successfully!", { icon: '📍' });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image too large. Max 5MB allowed.");
            return;
        }

        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleCategoryToggle = (categoryId: string) => {
        if (selectedCategories.includes(categoryId)) {
            setSelectedCategories(prev => prev.filter(id => id !== categoryId));
        } else {
            if (selectedCategories.length >= 5) {
                toast.error("You can select up to 5 categories max.");
                return;
            }
            setSelectedCategories(prev => [...prev, categoryId]);
        }
    };

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (selectedCategories.length === 0) {
            toast.error("Please select at least one core category.");
            return;
        }

        setIsLoading(true);
        const formData = new FormData(e.currentTarget);

        if (imageFile) {
            formData.append("imageFile", imageFile);
        }

        try {
            const result = await addInstitute(userId, formData, selectedCategories);

            if (result.success) {
                toast.success("Institute profile submitted for review!", { icon: '🎉' });
                router.push(`/user/create-institute`);
                router.refresh();
            } else {
                toast.error(result.error || "Submission failed.");
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Filter categories based on search
    const filteredCategories = allCategories.filter(cat =>
        cat.name.toLowerCase().includes(categorySearch.toLowerCase())
    );

    return (
        <form onSubmit={handleFormSubmit} className="max-w-4xl mx-auto pb-20 pt-8 animate-in fade-in duration-500">

            {/* Instruction / Trust Banner */}
            <div className="mb-10 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center shadow-xs">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-amber-100">
                    <CheckCircle className="w-7 h-7 text-amber-500" />
                </div>
                <div>
                    <h2 className="text-xl font-extrabold text-slate-900">Partner with AcademyFind</h2>
                    <p className="text-sm text-slate-600 mt-1.5 leading-relaxed max-w-2xl">
                        {providerType === "INDIVIDUAL" 
                            ? "Add your educator details below. Once submitted, your profile will be securely stored and locked. Our team will review the details to ensure authenticity before making it live to thousands of students."
                            : "Add your academy details below. Once submitted, your profile will be securely stored and locked. Our team will review the details to ensure authenticity before making it live to thousands of students."
                        }
                    </p>
                </div>
            </div>

            <input type="hidden" name="providerType" value={providerType} />

            <div className="space-y-12">

                {/* --- Section 0: Provider Type --- */}
                <div className="relative bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <User className="w-6 h-6 text-slate-400" />
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">What are you listing?</h3>
                            <p className="text-xs text-slate-500 mt-1">Select the type of profile you want to create.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div 
                            onClick={() => setProviderType("INSTITUTE")}
                            className={`cursor-pointer rounded-2xl border-2 p-5 transition-all ${providerType === "INSTITUTE" ? "border-amber-500 bg-amber-50/50 shadow-sm" : "border-slate-200 hover:border-amber-300"}`}
                        >
                            <h4 className="font-bold text-slate-900">Institute / Coaching</h4>
                            <p className="text-xs text-slate-500 mt-1">For organizations, coaching centers, and academies.</p>
                        </div>
                        <div 
                            onClick={() => setProviderType("INDIVIDUAL")}
                            className={`cursor-pointer rounded-2xl border-2 p-5 transition-all ${providerType === "INDIVIDUAL" ? "border-amber-500 bg-amber-50/50 shadow-sm" : "border-slate-200 hover:border-amber-300"}`}
                        >
                            <h4 className="font-bold text-slate-900">Individual Educator</h4>
                            <p className="text-xs text-slate-500 mt-1">For 1:1 Mentors, Tutors, and Independent Teachers.</p>
                        </div>
                    </div>
                </div>

                {/* --- Section 1: Owner Details --- */}
                <div className="relative bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                    <div className="absolute -top-4 left-8 bg-amber-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-full tracking-widest uppercase shadow-sm">
                        Step 1
                    </div>
                    <div className="flex items-center gap-3 mb-8">
                        <User className="w-6 h-6 text-slate-400" />
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">
                                {providerType === "INDIVIDUAL" ? "Personal Details" : "Owner Information"}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">These details are kept private for verification purposes.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2.5">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Full Name <span className="text-red-500">*</span></label>
                            <Input maxLength={60} name="ownerName" required placeholder="e.g. Rahul Sharma" defaultValue={defaultName || ""} className="bg-slate-50/50 border-slate-200 focus-visible:ring-amber-400 rounded-xl" />
                        </div>
                        <div className="space-y-2.5">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Phone Number <span className="text-red-500">*</span></label>
                            <div className="relative flex items-center">
                                <span className="absolute left-3.5 text-slate-500 font-medium text-sm pointer-events-none">+91</span>
                                <Input maxLength={10} name="ownerPhone" type="tel" required placeholder="9876543210" defaultValue={defaultPhone || ""} className="pl-11 bg-slate-50/50 border-slate-200 focus-visible:ring-amber-400 rounded-xl" onInput={(e) => {
                                    e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '');
                                }} />
                            </div>
                        </div>
                        <div className="space-y-2.5">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                                {providerType === "INDIVIDUAL" ? "Title / Qualifications *" : "Designation *"}
                            </label>
                            <Input maxLength={60} name="ownerDesignation" required placeholder={providerType === "INDIVIDUAL" ? "e.g. M.Sc Mathematics" : "e.g. Founder / Director"} className="bg-slate-50/50 border-slate-200 focus-visible:ring-amber-400 rounded-xl" />
                        </div>
                    </div>
                </div>

                {/* --- Section 2: Banner Image --- */}
                <div className="relative bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                    <div className="absolute -top-4 left-8 bg-amber-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-full tracking-widest uppercase shadow-sm">
                        Step 2
                    </div>
                    <div className="flex items-center gap-3 mb-8">
                        <UploadCloud className="w-6 h-6 text-slate-400" />
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">
                                {providerType === "INDIVIDUAL" ? "Profile Photo / Cover" : "Cover Presentation"}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                                {providerType === "INDIVIDUAL" ? "Upload a high-quality professional photo." : "Upload a high-quality image of your campus or logo."}
                            </p>
                        </div>
                    </div>

                    <div className="w-full relative group">
                        <label className={`block w-full h-[250px] sm:h-[300px] border-2 border-dashed rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-4 ${imagePreview ? 'border-amber-200 bg-amber-50/30' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-amber-400'}`}>
                            {imagePreview ? (
                                <>
                                    <img src={imagePreview} className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" alt="Cover preview" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="bg-white text-slate-900 text-sm font-bold px-6 py-2.5 rounded-full flex items-center gap-2 shadow-lg">
                                            <UploadCloud className="w-4 h-4" /> Replace Image
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-slate-400 group-hover:scale-110 group-hover:text-amber-500 transition-all">
                                        <UploadCloud className="w-8 h-8" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-slate-700">Click to upload cover image</p>
                                        <p className="text-xs text-slate-500 mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
                                    </div>
                                </>
                            )}
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                    </div>
                </div>

                {/* --- Section 3: Core Details --- */}
                <div className="relative bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                    <div className="absolute -top-4 left-8 bg-amber-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-full tracking-widest uppercase shadow-sm">
                        Step 3
                    </div>
                    <div className="flex items-center gap-3 mb-8">
                        <Landmark className="w-6 h-6 text-slate-400" />
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">
                                {providerType === "INDIVIDUAL" ? "Educator Profile" : "Institute Profile"}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">What do students see when they visit your page?</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2.5">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                                {providerType === "INDIVIDUAL" ? "Your Name / Brand Name *" : "Registered Institute Name *"}
                            </label>
                            <Input name="name" required placeholder={providerType === "INDIVIDUAL" ? "e.g. Rahul Sharma Maths" : "e.g. Allen Career Institute"} className="bg-slate-50/50 border-slate-200 focus-visible:ring-amber-400 rounded-xl text-lg py-6" />
                        </div>

                        <div className="space-y-2.5">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                                {providerType === "INDIVIDUAL" ? "About You *" : "About the Academy *"}
                            </label>
                            <Textarea
                                name="description"
                                required
                                placeholder="Describe your teaching methodology, faculty experience, past results, and why students should join you..."
                                className="bg-slate-50/50 border-slate-200 focus-visible:ring-amber-400 rounded-xl min-h-[160px] resize-none leading-relaxed"
                            />
                        </div>
                    </div>
                </div>

                {/* --- Section 4: Contact & Links --- */}
                <div className="relative bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                    <div className="absolute -top-4 left-8 bg-amber-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-full tracking-widest uppercase shadow-sm">
                        Step 4
                    </div>
                    <div className="flex items-center gap-3 mb-8">
                        <Globe className="w-6 h-6 text-slate-400" />
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Digital Presence</h3>
                            <p className="text-xs text-slate-500 mt-1">How students can reach out or learn more.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2.5">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                                {providerType === "INDIVIDUAL" ? "Contact Number *" : "Official Phone *"}
                            </label>
                            <div className="relative flex items-center">
                                <span className="absolute left-3.5 text-slate-500 font-medium text-sm pointer-events-none">+91</span>
                                <Input name="phone" type="tel" required placeholder="9876543210" maxLength={10} className="pl-11 bg-slate-50/50 border-slate-200 focus-visible:ring-amber-400 rounded-xl" onInput={(e) => {
                                    e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '');
                                }} />
                            </div>
                        </div>
                        <div className="space-y-2.5">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                                {providerType === "INDIVIDUAL" ? "Public Email *" : "Support Email *"}
                            </label>
                            <Input name="email" type="email" required placeholder="contact@institute.com" className="bg-slate-50/50 border-slate-200 focus-visible:ring-amber-400 rounded-xl" />
                        </div>
                        <div className="space-y-2.5">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center justify-between">Website <span className="text-[10px] text-slate-400 font-normal normal-case">(Optional)</span></label>
                            <Input name="website" type="url" placeholder="https://www.yoursite.com" className="bg-slate-50/50 border-slate-200 focus-visible:ring-amber-400 rounded-xl" />
                        </div>
                        <div className="space-y-2.5">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center justify-between">Google Maps URL <span className="text-[10px] text-slate-400 font-normal normal-case">(Optional)</span></label>
                            <Input name="googleMapsUrl" type="url" placeholder="Paste map share link" className="bg-slate-50/50 border-slate-200 focus-visible:ring-amber-400 rounded-xl" />
                        </div>
                    </div>
                </div>

                {/* --- Section 5: Location & Categories --- */}
                <div className="relative bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                    <div className="absolute -top-4 left-8 bg-amber-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-full tracking-widest uppercase shadow-sm">
                        Step 5
                    </div>
                    <div className="flex items-center gap-3 mb-8">
                        <MapPin className="w-6 h-6 text-slate-400" />
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Location & Categories</h3>
                            <p className="text-xs text-slate-500 mt-1">Define your exact location and the courses you offer.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="space-y-2.5">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                                {providerType === "INDIVIDUAL" ? "Your City *" : "Base City *"}
                            </label>
                            <select name="cityId" required className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 outline-none focus:ring-2 focus:ring-amber-400 appearance-none">
                                <option value="">Select your city...</option>
                                {allCities.map((c: { id: string; name: string }) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2.5">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                                {providerType === "INDIVIDUAL" ? "Typical Fees *" : "Base Fees *"}
                            </label>
                            <Input name="feeInfo" required placeholder="e.g. ₹5,000 to ₹10,000 / month" className="bg-slate-50/50 border-slate-200 focus-visible:ring-amber-400 rounded-xl" />
                        </div>
                    </div>

                    {/* Address Box */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-10">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3 block">Complete Address *</label>
                        <div className="space-y-4">
                            <LocationAutocomplete onLocationSelect={handleLocationSelect} />
                            <Input name="address" value={location.address} onChange={(e) => setLocation({ ...location, address: e.target.value })} required placeholder="Floor, Building, Street, Landmark..." className="bg-white border-slate-200 focus-visible:ring-amber-400" />
                            <div className="grid grid-cols-2 gap-4 hidden">
                                <Input name="latitude" type="number" step="any" value={location.lat} onChange={(e) => setLocation({ ...location, lat: parseFloat(e.target.value) })} />
                                <Input name="longitude" type="number" step="any" value={location.lng} onChange={(e) => setLocation({ ...location, lng: parseFloat(e.target.value) })} />
                            </div>
                        </div>
                    </div>

                    {/* Category Selection */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Core Categories * <span className="normal-case text-[10px] text-slate-400 font-medium ml-2">(Max 5)</span></label>

                            {/* Search Categories */}
                            <div className="relative w-48">
                                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={categorySearch}
                                    onChange={(e) => setCategorySearch(e.target.value)}
                                    className="w-full text-xs py-2 pl-8 pr-3 rounded-lg border border-slate-200 bg-white outline-none focus:border-amber-400"
                                />
                            </div>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-h-55 overflow-y-auto custom-scrollbar">
                            {filteredCategories.length === 0 ? (
                                <p className="text-sm text-slate-400 text-center py-4">No categories found matching your search.</p>
                            ) : (
                                <div className="flex flex-wrap gap-2.5">
                                    {filteredCategories.map((cat: { id: string; name: string }) => {
                                        const isSelected = selectedCategories.includes(cat.id);
                                        return (
                                            <button
                                                type="button"
                                                key={cat.id}
                                                onClick={() => handleCategoryToggle(cat.id)}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${isSelected
                                                    ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-xs'
                                                    : 'bg-white border-slate-200 text-slate-600 hover:border-amber-400'
                                                    }`}
                                            >
                                                {isSelected ? <CheckCircle className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 text-slate-400" />}
                                                {cat.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>

            {/* --- Sticky Bottom CTA --- */}
            <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 flex justify-center">
                <div className="w-full max-w-4xl flex items-center justify-between">
                    <p className="hidden sm:block text-sm text-slate-500 font-medium">Review your details before submitting.</p>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full sm:w-auto py-6 px-10 text-base font-bold rounded-2xl shadow-lg transition-all ${isLoading ? 'bg-slate-400' : 'bg-linear-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white hover:shadow-amber-500/25'
                            }`}
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Processing Request...
                            </span>
                        ) : "Submit for Approval"}
                    </Button>
                </div>
            </div>

        </form>
    );
}