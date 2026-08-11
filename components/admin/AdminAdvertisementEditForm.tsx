"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, UploadCloud, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { adminForceEditAdvertisement } from "@/lib/advertisement/admin-actions";

export default function AdminAdvertisementEditForm({ ad }: { ad: any }) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    
    // Form Data
    const [title, setTitle] = useState(ad.title);
    const [description, setDescription] = useState(ad.description || "");
    const [linkUrl, setLinkUrl] = useState(ad.linkUrl || "");
    const [existingImages, setExistingImages] = useState<string[]>(ad.images || []);
    const [newImages, setNewImages] = useState<File[]>([]);
    
    const totalImages = existingImages.length + newImages.length;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const addedFiles = Array.from(e.target.files);
            if (totalImages + addedFiles.length > 4) {
                toast.error("You can upload a maximum of 4 images.");
                return;
            }
            setNewImages(prev => [...prev, ...addedFiles]);
        }
    };
    
    const removeExistingImage = (index: number) => {
        setExistingImages(existingImages.filter((_, i) => i !== index));
    };

    const removeNewImage = (index: number) => {
        setNewImages(newImages.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!title.trim()) return toast.error("Title is required");
        if (totalImages === 0) return toast.error("At least 1 image is required");
        
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            formData.append("linkUrl", linkUrl);
            formData.append("existingImages", JSON.stringify(existingImages));
            
            newImages.forEach((img, idx) => {
                formData.append(`newImage_${idx}`, img);
            });
            
            const result = await adminForceEditAdvertisement(ad.id, formData);
            
            if (result.success) {
                toast.success("Advertisement updated successfully!");
                setIsEditing(false);
                setNewImages([]);
                router.refresh();
            } else {
                toast.error(result.error || "Failed to update advertisement.");
            }
        } catch (error) {
            toast.error("An error occurred during submission.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isEditing) {
        return (
            <button 
                onClick={() => setIsEditing(true)}
                className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl font-bold transition-colors w-full sm:w-auto"
            >
                Edit Advertisement Details
            </button>
        );
    }

    return (
        <div className="bg-white p-6 rounded-[2rem] border-2 border-amber-200 shadow-lg animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <h3 className="text-xl font-black text-slate-800">Admin Direct Edit</h3>
                <button 
                    onClick={() => setIsEditing(false)}
                    className="text-slate-400 hover:text-slate-600 font-bold text-sm"
                >
                    Cancel
                </button>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Advertisement Title *</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 text-slate-900 outline-none transition-all focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 text-slate-900 outline-none transition-all focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 resize-none"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Link URL</label>
                    <input
                        type="url"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 text-slate-900 outline-none transition-all focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
                    />
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                    <label className="block text-sm font-bold text-slate-700">Images ({totalImages}/4)</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Existing Images */}
                        {existingImages.map((img, idx) => (
                            <div key={`old-${idx}`} className="group relative aspect-video rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                                <Image src={img} alt={`Preview ${idx}`} fill className="object-cover" />
                                <button 
                                    onClick={(e) => { e.preventDefault(); removeExistingImage(idx); }}
                                    className="absolute top-2 right-2 bg-white/90 text-red-500 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white shadow-sm"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                </button>
                            </div>
                        ))}
                        
                        {/* New Images */}
                        {newImages.map((img, idx) => (
                            <div key={`new-${idx}`} className="group relative aspect-video rounded-xl overflow-hidden border border-amber-200 shadow-sm">
                                <img src={URL.createObjectURL(img)} alt={`New Preview ${idx}`} className="w-full h-full object-cover" />
                                <button 
                                    onClick={(e) => { e.preventDefault(); removeNewImage(idx); }}
                                    className="absolute top-2 right-2 bg-white/90 text-red-500 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white shadow-sm"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                </button>
                                <div className="absolute bottom-1 left-1 bg-amber-500 px-2 py-0.5 rounded text-[10px] text-white font-bold">New</div>
                            </div>
                        ))}

                        {totalImages < 4 && (
                            <label className="group flex aspect-video cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white hover:border-amber-400 hover:bg-amber-50 transition-all">
                                <UploadCloud className="h-6 w-6 text-slate-400 group-hover:text-amber-500 mb-2 transition-colors" />
                                <span className="text-xs font-bold text-slate-600 group-hover:text-amber-600">Add Image</span>
                                <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                            </label>
                        )}
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <button 
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3 font-bold text-white shadow-lg transition-all hover:bg-amber-600 disabled:opacity-70"
                    >
                        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                        {isSubmitting ? "Saving..." : "Force Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}
