"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";

export function SidebarLink({
    href,
    icon,
    label,
    count,
    exact,
}: {
    href: string;
    icon: ReactNode;
    label: string;
    count?: number;
    exact?: boolean;
}) {
    const pathname = usePathname();
    
    // Match exact path if exact is true or if it's the root overview
    const isActive = (exact || href === '/af-ass-manage')
        ? pathname === href
        : pathname === href || pathname.startsWith(href + '/');

    return (
        <Link 
            href={href} 
            prefetch={false}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive 
                ? "bg-stone-100 text-stone-900 shadow-sm border border-stone-200/50" 
                : "hover:bg-stone-50 hover:text-stone-800 text-slate-600 border border-transparent"
            }`}
        >
            <div className={`flex items-center gap-3 ${isActive ? "font-bold" : ""}`}>
                <span className={`[&>svg]:w-4 [&>svg]:h-4 ${isActive ? "text-stone-900" : ""}`}>{icon}</span>
                {label}
            </div>
            
            {(count ?? 0) > 0 && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center shadow-sm ${
                    isActive ? "bg-stone-800 text-white" : "bg-stone-500 text-white"
                }`}>
                    {count}
                </span>
            )}
        </Link>
    );
}
