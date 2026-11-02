"use client";
import { useEffect, useState } from "react";
import { ArrowDownCircle, ArrowUpCircle, Search } from "lucide-react";
export default function HistoryPage() {
  const [d, setD] = useState<any>(null);
  const [type, setType] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  useEffect(() => {
    fetch(`/api/history?type=${type}&q=${encodeURIComponent(q)}&page=${page}`).then((r) => r.json()).then(setD);
  }, [type, q, page]);
  return (
    <div className="space-y-5">
      <h2 className="text-2xl md:text-3xl font-bold">Stock History</h2>
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input className="inp pl-9" placeholder="Product / SKU..." value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        </div>
        {[["", "All"], ["IN", "In"], ["OUT", "Out"]].map(([v, l]) => (
          <button key={v} onClick={() => { setType(v); setPage(1); }}
            className={`px-4 py-2 rounded-xl border ${type === v ? "bg-indigo-500/30 border-indigo-400" : "border-white/10"}`}>{l}</button>
        ))}
      </div>
      {!d ? <p className="animate-pulse text-slate-400">Loading...</p> : (
        <div className="glass divide-y divide-white/5">
          {d.items.length === 0 && <p className="p-5 text-slate-400">No records</p>}
          {d.items.map((m: any) => (
            <div key={m.id} className="flex items-center gap-3 p-4">
              {m.type === "IN" ? <ArrowDownCircle className="text-emerald-400 shrink-0" /> : <ArrowUpCircle className="text-rose-400 shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{m.product.name} <span className="text-xs text-slate-400">{m.product.sku}</span></p>
                <p className="text-xs text-slate-400 truncate">{m.user.name} · {new Date(m.createdAt).toLocaleString()}{m.note ? " · " + m.note : ""}</p>
              </div>
              <span className={`font-bold ${m.type === "IN" ? "text-emerald-400" : "text-rose-400"}`}>{m.type === "IN" ? "+" : "-"}{m.qty}</span>
            </div>
          ))}
        </div>
      )}
      {d && (
        <div className="flex items-center justify-center gap-4 text-sm">
          <button className="px-4 py-2 rounded-xl border border-white/10 disabled:opacity-40" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
          <span>{page} / {d.pages}</span>
          <button className="px-4 py-2 rounded-xl border border-white/10 disabled:opacity-40" disabled={page >= d.pages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}