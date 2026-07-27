"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
    CheckCircle2,
    Phone,
    Sparkles,
    ArrowRight,
    Star,
    BookOpen,
    Heart,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface CallBackSuccessPopUpProps {
    isOpen: boolean;
    onClose: () => void;
    isLoggedIn: boolean;
    instituteName?: string;
}

export default function CallBackSuccessPopUp({
    isOpen,
    onClose,
    isLoggedIn,
    instituteName,
}: CallBackSuccessPopUpProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-sm rounded-3xl border-0 p-0 overflow-hidden shadow-2xl">
                {/* Accessibility: sr-only title/description */}
                <DialogHeader className="sr-only">
                    <DialogTitle>
                        {isLoggedIn ? "Enquiry Submitted Successfully" : "Enquiry Sent – Join AcademyFind"}
                    </DialogTitle>
                    <DialogDescription>
                        {isLoggedIn
                            ? "Your enquiry has been submitted. The institute will contact you shortly."
                            : "Sign up for free to save institutes, write reviews, and get personalized recommendations."}
                    </DialogDescription>
                </DialogHeader>
                {isLoggedIn ? (
                    /* ── LOGGED IN: Success Message ── */
                    <div className="relative bg-white">
                        {/* Top gradient banner */}
                        <div className="bg-gradient-to-br from-emerald-400 to-teal-500 px-6 pt-8 pb-10 text-center text-white relative overflow-hidden">
                            {/* Decorative circles */}
                            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
                            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/10 rounded-full" />

                            <div className="relative z-10">
                                {/* Animated check icon */}
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm ring-4 ring-white/30">
                                    <CheckCircle2 className="h-9 w-9 text-white" />
                                </div>
                                <h2 className="text-2xl font-extrabold tracking-tight">
                                    Enquiry Submitted!
                                </h2>
                                <p className="mt-2 text-emerald-100 text-sm leading-relaxed">
                                    {instituteName
                                        ? `${instituteName} will contact you shortly.`
                                        : "The institute will contact you shortly."}
                                </p>
                            </div>
                        </div>

                        {/* Bottom content */}
                        <div className="px-6 py-6 space-y-4 -mt-4 bg-white rounded-t-3xl relative z-10">
                            {/* Info card */}
                            <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                                <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <Phone className="w-4 h-4 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-emerald-900">
                                        What happens next?
                                    </p>
                                    <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">
                                        A counselor from the institute will call you within{" "}
                                        <span className="font-bold">24 hours</span> to discuss
                                        admission, fees &amp; batches.
                                    </p>
                                </div>
                            </div>

                            {/* Tips */}
                            <div className="space-y-2">
                                {[
                                    "Keep your phone reachable",
                                    "Prepare your queries in advance",
                                    "Check reviews from other students",
                                ].map((tip: any, i: any) => (
                                    <div key={i} className="flex items-center gap-2 text-xs text-slate-500">
                                        <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                            <span className="text-[9px] font-bold text-emerald-600">✓</span>
                                        </div>
                                        {tip}
                                    </div>
                                ))}
                            </div>

                            <Button
                                onClick={onClose}
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl py-3"
                            >
                                Got it, Thanks! 🙌
                            </Button>
                        </div>
                    </div>
                ) : (
                    /* ── NOT LOGGED IN: Sign Up Prompt ── */
                    <div className="relative bg-white">
                        {/* Top banner */}
                        <div className="bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 px-6 pt-8 pb-10 text-center text-white relative overflow-hidden">
                            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
                            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/10 rounded-full" />

                            <div className="relative z-10">
                                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm ring-4 ring-white/30">
                                    <CheckCircle2 className="h-8 w-8 text-white" />
                                </div>
                                <h2 className="text-xl font-extrabold tracking-tight">
                                    Enquiry Sent! ✅
                                </h2>
                                <p className="mt-1 text-amber-100 text-sm">
                                    Institute will call you back soon.
                                </p>
                            </div>
                        </div>

                        {/* Bottom CTA */}
                        <div className="px-6 py-6 -mt-4 bg-white rounded-t-3xl relative z-10 space-y-5">
                            {/* Divider with label */}
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-px bg-slate-100" />
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-full border border-amber-100">
                                    <Sparkles className="w-3 h-3 text-amber-500" />
                                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                                        Create Free Account
                                    </span>
                                </div>
                                <div className="flex-1 h-px bg-slate-100" />
                            </div>

                            {/* Benefits */}
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { icon: Heart, label: "Save\nInstitutes", color: "text-rose-500 bg-rose-50" },
                                    { icon: Star, label: "Write\nReviews", color: "text-amber-500 bg-amber-50" },
                                    { icon: BookOpen, label: "Track\nAdmissions", color: "text-blue-500 bg-blue-50" },
                                ].map(({ icon: Icon, label, color }) => (
                                    <div
                                        key={label}
                                        className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-100"
                                    >
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color.split(" ")[1]}`}>
                                            <Icon className={`w-4 h-4 ${color.split(" ")[0]}`} />
                                        </div>
                                        <span className="text-[10px] text-center text-slate-600 font-semibold leading-tight whitespace-pre-line">
                                            {label}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <p className="text-center text-xs text-slate-500 leading-relaxed">
                                Join <span className="font-bold text-slate-700">50,000+</span> students discovering
                                the best coaching institutes on AcademyFind — it&apos;s{" "}
                                <span className="font-bold text-amber-600">completely free!</span>
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-col gap-2">
                                <Link href="/register" onClick={onClose}>
                                    <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl py-3 gap-2">
                                        <Sparkles className="w-4 h-4" />
                                        Sign Up for Free
                                        <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </Link>
                                <Link href="/login" onClick={onClose}>
                                    <Button
                                        variant="outline"
                                        className="w-full font-semibold rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
                                    >
                                        Already have an account? Login
                                    </Button>
                                </Link>
                            </div>

                            <button
                                onClick={onClose}
                                className="w-full text-center text-xs text-slate-400 hover:text-slate-600 transition-colors py-1"
                            >
                                Continue without signing up
                            </button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}