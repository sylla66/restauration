import { ChevronLeft, ChevronRight, Search } from "lucide-react";

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <button onClick={() => onChange(page - 1)} disabled={page <= 1} className="p-2 rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--muted)] disabled:opacity-30 disabled:pointer-events-none transition-colors">
        <ChevronLeft className="w-4 h-4" />
      </button>
      {pages[0] > 1 && <span className="px-2 text-[var(--muted-foreground)]">...</span>}
      {pages.map((p) => (
        <button key={p} onClick={() => onChange(p)} className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${p === page ? "bg-[#e67e22] text-white" : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]"}`}>
          {p}
        </button>
      ))}
      {pages[pages.length - 1] < totalPages && <span className="px-2 text-[var(--muted-foreground)]">...</span>}
      <button onClick={() => onChange(page + 1)} disabled={page >= totalPages} className="p-2 rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--muted)] disabled:opacity-30 disabled:pointer-events-none transition-colors">
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder, className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Rechercher..."}
        className="w-full pl-10 pr-3 py-2 border border-[var(--border)] rounded-lg text-sm bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[#e67e22] focus:border-transparent"
      />
    </div>
  );
}
