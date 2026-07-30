"use client";

import { useState } from "react";
import { submitLifeCoachRequest } from "@/lib/User/user/life-coach";
import { Sparkles, Brain, Target, ShieldCheck, CheckCircle2, Loader2, MessageCircleQuestion, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export default function LifeCoachLandingPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await submitLifeCoachRequest(formData);

    if (res.success) {
      setSuccess(true);
      toast.success("Details received!");
    } else {
      toast.error(res.error || "Something went wrong.");
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 bg-slate-50/50">
        <div className="max-w-md w-full bg-white border rounded-3xl p-8 text-center shadow-xl shadow-amber-900/5">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Session Requested!</h2>
          <p className="text-slate-500 mt-2 text-sm leading-relaxed">
            Thank you for reaching out. Your mentorship profile is locked in our system. Our admin team or a senior counselor will contact you back shortly.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="mt-6 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors text-sm"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/40 font-sans pb-24">
      
      {/* Hero Header */}
      <header className="bg-linear-to-b from-amber-50 via-background to-transparent dark:from-amber-950/10 py-16 md:py-24 text-center px-4">
        <div className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-1.5 text-xs font-bold text-amber-700 shadow-sm uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" /> 1-on-1 Personalized Mentorship
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mt-6 tracking-tight">
          Find Clarity with a <span className="text-amber-500">Life Coach</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-slate-500 text-base md:text-lg leading-relaxed">
          A life coach isn&apos;t just a teacher; they are career architects. They help you clear confusion, align your internal goals with market realities, and pick the ultimate path.
        </p>
      </header>

      {/* Grid: Pillars & Form */}
      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start mt-4 max-w-6xl">
        
        {/* Left Side: Concept Explainers */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border rounded-3xl p-6 flex gap-5 shadow-sm hover:shadow-md transition-shadow border-slate-200">
            <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl h-fit"><Brain className="w-6 h-6" /></div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Clarity Over Chaos</h3>
              <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">Stuck between multiple stream options? Life coaching drills deep down into your behavioral strengths to clear out doubt layers.</p>
            </div>
          </div>

          <div className="bg-white border rounded-3xl p-6 flex gap-5 shadow-sm hover:shadow-md transition-shadow border-slate-200">
            <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl h-fit"><Target className="w-6 h-6" /></div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Goal Mapping Blueprints</h3>
              <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">Turn ambiguous targets into structured week-by-week educational modules. Track changes using micro-milestones metrics.</p>
            </div>
          </div>

          <div className="bg-white border rounded-3xl p-6 flex gap-5 shadow-sm hover:shadow-md transition-shadow border-slate-200">
            <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl h-fit"><ShieldCheck className="w-6 h-6" /></div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">100% Confidentiality</h3>
              <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">Every data byte shared here is bound inside locked parameters. Peer validation audits remain completely internal.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Request Form */}
        <div className="lg:col-span-7 bg-white border border-amber-200 rounded-3xl p-6 md:p-10 shadow-lg shadow-amber-900/5">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Book Your Free Strategy Call</h2>
            <p className="text-sm text-slate-500 mt-1.5">Fill out your details below. Our senior counselor will connect with you to schedule a personalized session.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Full Name <span className="text-red-500">*</span></label>
                <input type="text" name="fullName" required placeholder="John Doe" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 outline-none text-sm transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Contact Number <span className="text-red-500">*</span></label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-slate-500 font-medium text-sm pointer-events-none">+91</span>
                  <input type="tel" maxLength={10} name="phone" required placeholder="98765 43210" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 outline-none text-sm transition-all" onInput={(e) => {
                      e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '');
                  }} />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Email ID <span className="text-red-500">*</span></label>
              <input type="email" name="email" required placeholder="name@domain.com" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 outline-none text-sm transition-all" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Current Dilemma / Message</label>
              <textarea name="message" rows={4} placeholder="Briefly describe what is confusing you (exams, branches, balancing school and coaching, etc.)..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 outline-none text-sm transition-all resize-none"></textarea>
            </div>

            <button type="submit" disabled={loading} className="w-full py-4 mt-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-base rounded-xl transition-all shadow-md shadow-amber-600/20 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageCircleQuestion className="w-5 h-5" />}
              {loading ? "Locking Profile..." : "Submit Call Request"}
            </button>
            <p className="text-[11px] text-center text-slate-400 mt-3 flex items-center justify-center gap-1">
               <ShieldCheck className="w-3 h-3" /> Your information is securely encrypted and never shared.
            </p>
          </form>
        </div>
      </div>

      {/* SEO Friendly Mini-FAQ Section */}
      <div className="container mx-auto px-4 mt-24 max-w-4xl text-center">
        <h3 className="text-2xl font-bold text-slate-800 mb-8">Frequently Asked Questions</h3>
        <div className="grid md:grid-cols-2 gap-6 text-left">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h4 className="font-bold text-slate-800">Is the first strategy call really free?</h4>
            <p className="text-sm text-slate-500 mt-2">Yes, the initial consultation is completely free. We use this time to understand your academic goals and match you with the right guidance.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h4 className="font-bold text-slate-800">Who are the life coaches?</h4>
            <p className="text-sm text-slate-500 mt-2">Our coaches are experienced educators, career counselors, and industry professionals who have guided thousands of students.</p>
          </div>
        </div>
      </div>

    </div>
  );
}