"use client";
import { useEffect, useState } from "react";
import { Plus, ClipboardList, Trash2, ChevronDown, PackageCheck, Ban, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "@/components/Toast";
import Modal from "@/components/Modal";
const money = (n: any) => "$" + Number(n).toFixed(2);
const badge: any = { ORDERED: "bg-amber-500/20 text-amber-300", RECEIVED: "bg-emerald-500/20 text-emerald-300", CANCELLED: "bg-rose-500/20 text-rose-300" };
const filters = [["", "All"], ["ORDERED", "Ordered"], ["RECEIVED", "Received"], ["CANCELLED", "Cancelled"]];
export default function Purchases() {
  const [pos, setPos] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [filter, setFilter] = useState("");
  const [open, setOpen] = useState("");
  const [form, setForm] = useState<any>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const load = () => fetch("/api/purchases?status=" + filter).then(async (r) => {
    if (r.status === 403) return setDenied(true);
    const d = await r.json(); setPos(d.items || []); setLoading(false);
  });
  useEffect(() => { load(); }, [filter]);
  const openForm = async () => {
    const [s, p] = await Promise.all([fetch("/api/suppliers").then((r) => r.json()), fetch("/api/products").then((r) => r.json())]);
    setSuppliers(s.items || []); setProducts(p.items || []);
    setErr(""); setForm({ supplierId: "", note: "", lines: [] });
  };
  const total = form ? form.lines.reduce((a: number, l: any) => a + (Number(l.cost) || 0) * l.qty, 0) : 0;
  const patch = (id: string, v: any) => setForm({ ...form, lines: form.lines.map((l: any) => (l.p.id === id ? { ...l, ...v } : l)) });
  const create = async () => {
    if (!form.supplierId) return setErr("Select a supplier");
    if (form.lines.length === 0) return setErr("Add at least one product");
    setBusy(true); setErr("");
    const r = await fetch("/api/purchases", { method: "POST", body: JSON.stringify({ supplierId: form.supplierId, note: form.note, items: form.lines.map((l: any) => ({ productId: l.p.id, qty: l.qty, cost: Number(l.cost) || 0 })) }) });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) { setErr(j.error || "Error"); return toast(j.error || "Error", "err"); }
    setForm(null); load(); toast("Purchase order created");
  };
  const act = async (id: string, action: string, msg: string) => {
    if (!confirm(action === "receive" ? "Mark as received? Stock will increase." : "Cancel this purchase order?")) return;
    const r = await fetch("/api/purchases/" + id, { method: "PUT", body: JSON.stringify({ action }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return toast(j.error || "Error", "err");
    load(); toast(msg);
  };
  if (denied) return <div className="glass p-8 text-center text-slate-400"><ShieldAlert size={40} className="mx-auto mb-3" />Managers and Admins only.</div>;
  const shownProducts = form ? products.filter((p) => !form.supplierId || !p.supplierId || p.supplierId === form.supplierId) : [];
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold">Purchase orders <span className="text-slate-500 text-lg">({pos.length})</span></h2>
        <button className="btn hidden sm:flex items-center gap-1" onClick={openForm}><Plus size={18} />New PO</button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map(([v, l]) => <button key={v} className={`chip ${filter === v ? "chip-on" : ""}`} onClick={() => { setFilter(v); setLoading(true); }}>{l}</button>)}
      </div>
      {loading ? <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="sk h-20" />)}</div> : pos.length === 0 ? (
        <div className="glass p-10 text-center text-slate-400"><ClipboardList size={48} className="mx-auto mb-3" />No purchase orders</div>
      ) : (
        <div className="space-y-3">
          {pos.map((o, i) => (
            <div key={o.id} className="card p-4 up" style={{ animationDelay: Math.min(i, 8) * 40 + "ms" }}>
              <button className="w-full flex items-center gap-3 text-left" onClick={() => setOpen(open === o.id ? "" : o.id)}>
                <span className="w-12 h-11 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 grid place-items-center font-bold shrink-0 text-sm">PO{o.no}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{o.supplier.name}</p>
                  <p className="text-xs text-slate-400 truncate">{new Date(o.createdAt).toLocaleString()} &middot; {o.user.name}</p>
                </div>
                <div className="text-right"><p className="font-bold">{money(o.total)}</p><span className={`text-[11px] px-2 py-0.5 rounded-full ${badge[o.status]}`}>{o.status}</span></div>
                <ChevronDown size={18} className={`text-slate-400 transition ${open === o.id ? "rotate-180" : ""}`} />
              </button>
              {open === o.id && (
                <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                  {o.note && <p className="text-xs text-slate-400">Note: {o.note}</p>}
                  {o.items.map((it: any) => (
                    <div key={it.id} className="flex justify-between text-sm">
                      <span className="text-slate-300">{it.name} <span className="text-slate-500">x {it.qty} @ {money(it.cost)}</span></span>
                      <span>{money(Number(it.cost) * it.qty)}</span>
                    </div>
                  ))}
                  {o.receivedAt && <p className="text-xs text-emerald-300">Received {new Date(o.receivedAt).toLocaleString()}</p>}
                  {o.status === "ORDERED" && (
                    <div className="flex gap-2 pt-2">
                      <button className="chip flex items-center gap-1 !text-emerald-300" onClick={() => act(o.id, "receive", "Stock received")}><PackageCheck size={14} />Receive stock</button>
                      <button className="chip flex items-center gap-1 !text-rose-300" onClick={() => act(o.id, "cancel", "PO cancelled")}><Ban size={14} />Cancel</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <button onClick={openForm} className="sm:hidden fixed right-5 bottom-24 z-40 w-14 h-14 rounded-full btn !p-0 grid place-items-center shadow-2xl"><Plus size={26} /></button>
      {form && (
        <Modal title="New purchase order" close={() => setForm(null)}>
          <div><label className="text-xs text-slate-400">Supplier</label>
            <select className="inp bg-slate-900" value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value, lines: [] })}>
              <option value="">- Select supplier -</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select></div>
          <div><label className="text-xs text-slate-400">Add product</label>
            <select className="inp bg-slate-900" value="" onChange={(e) => {
              const p = products.find((x) => x.id === e.target.value);
              if (p && !form.lines.some((l: any) => l.p.id === p.id)) setForm({ ...form, lines: [...form.lines, { p, qty: 10, cost: String(p.price) }] });
            }}>
              <option value="">- Select product -</option>
              {shownProducts.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.qty} in stock)</option>)}
            </select></div>
          {form.lines.map((l: any) => (
            <div key={l.p.id} className="bg-white/5 rounded-xl p-2 space-y-2">
              <div className="flex justify-between items-center"><p className="text-sm truncate">{l.p.name}</p>
                <button className="text-rose-400 p-1" onClick={() => setForm({ ...form, lines: form.lines.filter((x: any) => x.p.id !== l.p.id) })}><Trash2 size={16} /></button></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-[11px] text-slate-400">Qty</label><input className="inp !py-1.5" type="number" min={1} value={l.qty} onChange={(e) => patch(l.p.id, { qty: Math.max(1, Math.floor(Number(e.target.value)) || 1) })} /></div>
                <div><label className="text-[11px] text-slate-400">Unit cost</label><input className="inp !py-1.5" type="number" step="0.01" min={0} value={l.cost} onChange={(e) => patch(l.p.id, { cost: e.target.value })} /></div>
              </div>
            </div>
          ))}
          <input className="inp" placeholder="Note (optional)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          <div className="flex justify-between items-center text-lg font-bold"><span>Total</span><span className="grad-text">{money(total)}</span></div>
          {err && <p className="text-rose-400 text-sm">{err}</p>}
          <button className="btn w-full flex justify-center items-center gap-2" disabled={busy} onClick={create}>{busy && <Loader2 size={18} className="animate-spin" />}Create purchase order</button>
        </Modal>
      )}
    </div>
  );
}