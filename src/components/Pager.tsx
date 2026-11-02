"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
export default function Pager({ page, pages, set }: { page: number; pages: number; set: (n: number) => void }) {
  if (pages <= 1) return null;
  const list = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1);
  return (
    <div className="flex items-center justify-center gap-1.5 flex-wrap pt-2">
      <button className="chip !px-2.5 disabled:opacity-40" disabled={page <= 1} onClick={() => set(page - 1)}><ChevronLeft size={16} /></button>
      {list.map((n, i) => (
        <span key={n} className="flex items-center gap-1.5">
          {i > 0 && n - list[i - 1] > 1 && <span className="text-slate-500">...</span>}
          <button className={`chip !px-3 ${n === page ? "chip-on" : ""}`} onClick={() => set(n)}>{n}</button>
        </span>
      ))}
      <button className="chip !px-2.5 disabled:opacity-40" disabled={page >= pages} onClick={() => set(page + 1)}><ChevronRight size={16} /></button>
    </div>
  );
}