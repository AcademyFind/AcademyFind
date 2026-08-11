"use client";
import Link from "next/link";
import { Megaphone } from "lucide-react";

export function AdvertiseButton() {
  return (
    <div className="absolute right-0 top-1/2 z-[50] hidden -translate-y-1/2 flex-col gap-2 rounded-l-xl bg-white/90 p-2 shadow-lg backdrop-blur-md border border-r-0 border-slate-200 transition-all hover:pl-4 md:flex">
      <Link
        href="/advertise"
        title="Advertise with us"
        className="flex flex-col items-center justify-center gap-1 text-slate-500 transition-all duration-300 hover:text-orange-500"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600 transition-all duration-300 hover:bg-orange-500 hover:text-white">
          <Megaphone className="h-5 w-5" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
          Advertise
        </span>
      </Link>
    </div>
  );
}
