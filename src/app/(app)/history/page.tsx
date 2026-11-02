"use client";
import { useEffect, useState } from "react";
import { ArrowDownCircle, ArrowUpCircle, Search, Inbox } from "lucide-react";
import Pager from "@/components/Pager";
const dayLabel = (s: string) => {
  const d = new Date(s), t = new Date();
  const diff = Math.round((new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime() - new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()) / 864e5);
  return diff === 0 ? "Today" : diff === 1 ? "Yesterday" : d.toDateString();
};
export default function HistoryPage() {
  const [d, setD] = useState<any>(null);
  const [type, setType] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let off = false;
    setBusy(true);
    fetch(`/api/history?type=${type}&q=${encodeURIComponent(q)}&page=${page}`).then((r) => r.json()).then((j) => { if (!off) { setD(j); setBusy(false); } });
    return () => { off = true; };
  }, [type, q, page]);
  let last = "";
  return (
    <div className="space-y-5">
      <h2 className="text-2xl md:text-3xl font-bold">Stock History {d && <span className="text-slate-500 text-lg">({d.total})</span>}</h2>
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-3.5 text-slate-400" />
          <input className="inp pl-9" placeholder="Product / SKU..." value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        </div>
        <div className="flex gap-2">
          {[["", "All"], ["IN", "In"], ["OUT", "Out"]].map(([v, l]) => (
            <button key={v} onClick={() => { setType(v); setPage(1); }} className={`chip ${type === v ? "chip-on" : ""}`}>{l}</button>
          ))}
        </div>
      </div>
      {!d ? <div className="space-y-2">{[1, 2, 3, 4, 5].map((i) => <div key={i} className="sk h-16" />)}</div> : d.items.length === 0 ? (
        <div className="glass p-10 text-center text-slate-400"><Inbox size={48} className="mx-auto mb-3" />No records</div>
      ) : (
        <div className={`transition-opacity ${busy ? "opacity-50" : ""}`}>
          {d.items.map((m: any, i: number) => {
            const l = dayLabel(m.createdAt), head = l !== last;
            last = l;
            const inn = m.type === "IN";
            return (
              <div key={m.id}>
                {head && <p className="text-xs uppercase tracking-wider text-slate-500 mt-4 mb-2 px-1">{l}</p>}
                <div className="card p-3 md:p-4 flex items-center gap-3 mb-2 up" style={{ animationDelay: Math.min(i, 10) * 30 + "ms" }}>
                  <span className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 ${inn ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                    {inn ? <ArrowDownCircle size={20} /> : <ArrowUpCircle size={20} />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{m.product.name} <span className="text-xs text-slate-500">{m.product.sku}</span></p>
                    <p className="text-xs text-slate-400 truncate">{m.user.name} &middot; {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}{m.note ? " · " + m.note : ""}</p>
                  </div>
                  <span className={`text-lg font-bold ${inn ? "text-emerald-400" : "text-rose-400"}`}>{inn ? "+" : "-"}{m.qty}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {d && <Pager page={page} pages={d.pages} set={(n) => { setPage(n); window.scrollTo({ top: 0, behavior: "smooth" }); }} />}
    </div>
  );
}