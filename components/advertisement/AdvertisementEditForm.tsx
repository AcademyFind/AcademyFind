"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, UploadCloud, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { requestAdvertisementEdit } from "@/lib/advertisement/actions";

export default function AdvertisementEditForm({ 
    ad,
    settings 
}: { 
    ad: any,
    settings?: { maxImages: number }
}) {
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
            const MAX_IMAGES = settings?.maxImages || 4;
            if (totalImages + addedFiles.length > MAX_IMAGES) {
                toast.error(`You can upload a maximum of ${MAX_IMAGES} images.`);
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
            
            const result = await requestAdvertisementEdit(ad.id, formData);
            
            if (result.success) {
                toast.success("Edit request submitted for approval!");
                setIsEditing(false);
                router.refresh();
            } else {
                toast.error(result.error || "Failed to submit edit request.");
            }
        } catch (error) {
            toast.error("An error occurred during submission.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isEditing) {
        return (
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                    <h3 className="text-xl font-black text-slate-800">Advertisement Details</h3>
                    <button 
                        onClick={() => setIsEditing(true)}
                        disabled={!!ad.editRequestData}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {ad.editRequestData ? "Edit Pending Review" : "Edit Details"}
                    </button>
                </div>

                {ad.editRequestData && (
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
                        <Loader2 className="w-5 h-5 text-amber-500 animate-spin shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-amber-800">Edit Request Pending</p>
                            <p className="text-xs text-amber-600 mt-1">Your recent edits are currently being reviewed by an admin. Once approved, the changes will be live.</p>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Title</p>
                        <p className="text-base font-medium text-slate-800">{ad.title}</p>
                    </div>
                    {ad.description && (
                        <div>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Description</p>
                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{ad.description}</p>
                        </div>
                    )}
                    {ad.linkUrl && (
                        <div>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Target Link</p>
                            <a href={ad.linkUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">{ad.linkUrl}</a>
                        </div>
                    )}

                    <div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-3">Images</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {ad.images.map((img: string, idx: number) => (
                                <div key={idx} className="aspect-video rounded-xl overflow-hidden border border-slate-200 shadow-sm relative">
                                    <Image src={img} alt={`Image ${idx+1}`} fill className="object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <h3 className="text-xl font-black text-slate-800">Edit Advertisement</h3>
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
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 text-slate-900 outline-none transition-all hover:bg-slate-100 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Description (Optional)</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 text-slate-900 outline-none transition-all hover:bg-slate-100 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 resize-none"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Target Link URL (Optional)</label>
                    <input
                        type="url"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 text-slate-900 outline-none transition-all hover:bg-slate-100 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
                    />
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-bold text-slate-700">Images ({totalImages}/4)</label>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Existing Images */}
                        {existingImages.map((img, idx) => (
                            <div key={`old-${idx}`} className="group relative aspect-video rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
                                <Image src={img} alt={`Preview ${idx}`} fill className="object-cover" />
                                <button 
                                    onClick={(e) => { e.preventDefault(); removeExistingImage(idx); }}
                                    className="absolute top-2 right-2 bg-white/90 backdrop-blur-md text-red-500 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white shadow-sm"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                </button>
                                <div className="absolute bottom-1 left-1 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white">Current</div>
                            </div>
                        ))}
                        
                        {/* New Images */}
                        {newImages.map((img, idx) => (
                            <div key={`new-${idx}`} className="group relative aspect-video rounded-xl overflow-hidden border border-amber-200 shadow-sm bg-slate-100">
                                <img src={URL.createObjectURL(img)} alt={`New Preview ${idx}`} className="w-full h-full object-cover" />
                                <button 
                                    onClick={(e) => { e.preventDefault(); removeNewImage(idx); }}
                                    className="absolute top-2 right-2 bg-white/90 backdrop-blur-md text-red-500 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white shadow-sm"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                </button>
                                <div className="absolute bottom-1 left-1 bg-amber-500 px-2 py-0.5 rounded text-[10px] text-white font-bold">New</div>
                            </div>
                        ))}

                        {totalImages < 4 && (
                            <label className="group flex aspect-video cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white transition-all hover:border-amber-400 hover:bg-amber-50">
                                <UploadCloud className="h-6 w-6 text-slate-400 group-hover:text-amber-500 transition-colors mb-2" />
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
                        className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3 font-bold text-white shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-600 disabled:opacity-70"
                    >
                        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                        {isSubmitting ? "Submitting Request..." : "Submit Edit Request"}
                    </button>
                </div>
            </div>
        </div>
    );
}
