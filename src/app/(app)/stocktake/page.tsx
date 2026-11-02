"use client";
import { useEffect, useState } from "react";
import { Search, ClipboardCheck, ShieldAlert, Loader2 } from "lucide-react";
import { toast } from "@/components/Toast";
export default function StockTake() {
  const [items, setItems] = useState<any[]>([]);
  const [cnt, setCnt] = useState<Record<string, string>>({});
  const [q, setQ] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [busy, setBusy] = useState(false);
  const load = () => fetch("/api/products").then((r) => r.json()).then((d) => {
    if (d.role === "STAFF") return setDenied(true);
    setItems((d.items || []).sort((a: any, b: any) => a.name.localeCompare(b.name))); setLoading(false);
  });
  useEffect(() => { load(); }, []);
  const changed = items.filter((p) => cnt[p.id] !== undefined && cnt[p.id] !== "" && Number(cnt[p.id]) !== p.qty);
  const shown = items.filter((p) => (p.name + p.sku).toLowerCase().includes(q.toLowerCase()));
  const submit = async () => {
    if (!changed.length) return;
    if (!confirm("Adjust stock for " + changed.length + " product(s)?")) return;
    setBusy(true);
    const r = await fetch("/api/stocktake", { method: "POST", body: JSON.stringify({ note, lines: changed.map((p) => ({ productId: p.id, counted: Number(cnt[p.id]) })) }) });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) return toast(j.error || "Error", "err");
    toast(j.adjusted + " product(s) adjusted");
    setCnt({}); setNote(""); load();
  };
  if (denied) return <div className="glass p-8 text-center text-slate-400"><ShieldAlert size={40} className="mx-auto mb-3" />Managers and Admins only.</div>;
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2"><ClipboardCheck className="text-indigo-400" />Stock take</h2>
        <div className="relative w-full sm:w-72"><Search size={16} className="absolute left-3 top-3.5 text-slate-400" /><input className="inp pl-9" placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} /></div>
      </div>
      <p className="text-sm text-slate-400">Enter the physically counted quantity. Only rows that differ from the system quantity are adjusted and logged in History.</p>
      {loading ? <div className="space-y-2">{[1, 2, 3, 4].map((i) => <div key={i} className="sk h-14" />)}</div> : (
        <div className="glass divide-y divide-white/5">
          {shown.map((p) => {
            const v = cnt[p.id], has = v !== undefined && v !== "", diff = has ? Number(v) - p.qty : 0;
            return (
              <div key={p.id} className="p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0"><p className="truncate font-medium">{p.name}</p><p className="text-xs text-slate-500">{p.sku} &middot; system: {p.qty}</p></div>
                {has && diff !== 0 && <span className={`text-xs font-semibold ${diff > 0 ? "text-emerald-400" : "text-rose-400"}`}>{diff > 0 ? "+" : ""}{diff}</span>}
                <input className="inp !w-24 text-center" type="number" min={0} placeholder="count" value={v ?? ""} onChange={(e) => setCnt({ ...cnt, [p.id]: e.target.value })} />
              </div>
            );
          })}
        </div>
      )}
      <div className="glass p-4 flex flex-wrap items-center gap-3 sticky bottom-20 md:bottom-4">
        <input className="inp flex-1 min-w-[160px]" placeholder="Note (e.g. Monthly count)" value={note} onChange={(e) => setNote(e.target.value)} />
        <button className="btn flex items-center gap-2" disabled={busy || changed.length === 0} onClick={submit}>{busy && <Loader2 size={18} className="animate-spin" />}Apply {changed.length} change(s)</button>
      </div>
    </div>
  );
}