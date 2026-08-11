"use client";

import { useState } from "react";
import { Search } from "lucide-react";

export function AdminSidebarSearch() {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase();
    setQuery(val);
    
    const links = document.querySelectorAll('.manager-sidebar-link');
    links.forEach(link => {
      const label = link.getAttribute('data-search-label') || '';
      if (label.includes(val)) {
        (link as HTMLElement).style.display = '';
      } else {
        (link as HTMLElement).style.display = 'none';
      }
    });
  };

  return (
    <div className="relative mt-4 mb-2">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input 
        type="text" 
        value={query}
        onChange={handleSearch}
        placeholder="Search tabs..."
        className="w-full pl-9 pr-4 py-2 bg-white/50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-800 outline-none transition-all shadow-sm placeholder:text-slate-400"
      />
    </div>
  );
}
