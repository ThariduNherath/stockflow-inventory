"use client";
import { useEffect, useState } from "react";
import { Plus, ShoppingCart, Trash2, ChevronDown, Check, Ban, Clock, Loader2, FileText } from "lucide-react";
import { toast } from "@/components/Toast";
import Modal from "@/components/Modal";
const money = (n: any) => "$" + Number(n).toFixed(2);
const badge: any = { PENDING: "bg-amber-500/20 text-amber-300", PAID: "bg-emerald-500/20 text-emerald-300", CANCELLED: "bg-rose-500/20 text-rose-300" };
const filters = [["", "All"], ["PENDING", "Pending"], ["PAID", "Paid"], ["CANCELLED", "Cancelled"]];
export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [role, setRole] = useState("STAFF");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [open, setOpen] = useState("");
  const [form, setForm] = useState<any>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const load = () =>
    fetch("/api/orders?status=" + filter).then((r) => r.json()).then((d) => { setOrders(d.items || []); setRole(d.role); setLoading(false); });
  useEffect(() => { load(); }, [filter]);
  const openForm = async () => {
    const [p, c] = await Promise.all([fetch("/api/products").then((r) => r.json()), fetch("/api/customers").then((r) => r.json())]);
    setProducts((p.items || []).filter((x: any) => x.qty > 0));
    setCustomers(c.items || []);
    setErr(""); setForm({ customerId: "", customer: "", paid: false, lines: [] });
  };
  const total = form ? form.lines.reduce((a: number, l: any) => a + Number(l.p.price) * l.qty, 0) : 0;
  const setQty = (id: string, q: number) =>
    setForm({ ...form, lines: form.lines.map((l: any) => (l.p.id === id ? { ...l, qty: Math.max(1, Math.min(l.p.qty, q || 1)) } : l)) });
  const create = async () => {
    if (form.lines.length === 0) return setErr("Add at least one product");
    setBusy(true); setErr("");
    const r = await fetch("/api/orders", {
      method: "POST",
      body: JSON.stringify({ customerId: form.customerId, customer: form.customer, paid: form.paid, items: form.lines.map((l: any) => ({ productId: l.p.id, qty: l.qty })) }),
    });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) { setErr(j.error || "Error"); return toast(j.error || "Error", "err"); }
    setForm(null); load(); toast("Order created");
  };
  const setStatus = async (id: string, status: string) => {
    const r = await fetch("/api/orders/" + id, { method: "PUT", body: JSON.stringify({ status }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return toast(j.error || "Error", "err");
    load(); toast("Order updated");
  };
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold">Orders <span className="text-slate-500 text-lg">({orders.length})</span></h2>
        <button className="btn hidden sm:flex items-center gap-1" onClick={openForm}><Plus size={18} />New order</button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map(([v, l]) => (
          <button key={v} className={`chip ${filter === v ? "chip-on" : ""}`} onClick={() => { setFilter(v); setLoading(true); }}>{l}</button>
        ))}
      </div>
      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="sk h-20" />)}</div>
      ) : orders.length === 0 ? (
        <div className="glass p-10 text-center text-slate-400"><ShoppingCart size={48} className="mx-auto mb-3" />No orders yet</div>
      ) : (
        <div className="space-y-3">
          {orders.map((o, i) => (
            <div key={o.id} className="card p-4 up" style={{ animationDelay: Math.min(i, 8) * 40 + "ms" }}>
              <button className="w-full flex items-center gap-3 text-left" onClick={() => setOpen(open === o.id ? "" : o.id)}>
                <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 grid place-items-center font-bold shrink-0 text-sm">#{o.no}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{o.customer}</p>
                  <p className="text-xs text-slate-400 truncate">{new Date(o.createdAt).toLocaleString()} &middot; {o.user.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{money(o.total)}</p>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full ${badge[o.status]}`}>{o.status}</span>
                </div>
                <ChevronDown size={18} className={`text-slate-400 transition ${open === o.id ? "rotate-180" : ""}`} />
              </button>
              {open === o.id && (
                <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                  {o.items.map((it: any) => (
                    <div key={it.id} className="flex justify-between text-sm">
                      <span className="text-slate-300">{it.name} <span className="text-slate-500">x {it.qty}</span></span>
                      <span>{money(Number(it.price) * it.qty)}</span>
                    </div>
                  ))}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <a className="chip flex items-center gap-1" href={"/invoice/" + o.id} target="_blank" rel="noreferrer"><FileText size={14} />Invoice</a>
                    {o.status !== "CANCELLED" && (o.status === "PENDING" ? (
                      <button className="chip flex items-center gap-1 !text-emerald-300" onClick={() => setStatus(o.id, "PAID")}><Check size={14} />Mark paid</button>
                    ) : (
                      <button className="chip flex items-center gap-1 !text-amber-300" onClick={() => setStatus(o.id, "PENDING")}><Clock size={14} />Mark pending</button>
                    ))}
                    {o.status !== "CANCELLED" && role !== "STAFF" && (
                      <button className="chip flex items-center gap-1 !text-rose-300" onClick={() => confirm("Cancel order #" + o.no + "? Stock will be restored.") && setStatus(o.id, "CANCELLED")}><Ban size={14} />Cancel</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <button onClick={openForm} className="sm:hidden fixed right-5 bottom-24 z-40 w-14 h-14 rounded-full btn !p-0 grid place-items-center shadow-2xl"><Plus size={26} /></button>
      {form && (
        <Modal title="New order" close={() => setForm(null)}>
          <div><label className="text-xs text-slate-400">Customer</label>
            <select className="inp bg-slate-900" value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })}>
              <option value="">- Walk-in / type name -</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {!form.customerId && <input className="inp mt-2" placeholder="Customer name (optional)" value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} />}
          </div>
          <div><label className="text-xs text-slate-400">Add product</label>
            <select className="inp bg-slate-900" value="" onChange={(e) => {
              const p = products.find((x) => x.id === e.target.value);
              if (p && !form.lines.some((l: any) => l.p.id === p.id)) setForm({ ...form, lines: [...form.lines, { p, qty: 1 }] });
            }}>
              <option value="">- Select product -</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.qty} in stock) - {money(p.price)}</option>)}
            </select></div>
          {form.lines.length > 0 && (
            <div className="space-y-2">
              {form.lines.map((l: any) => (
                <div key={l.p.id} className="flex items-center gap-2 bg-white/5 rounded-xl p-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{l.p.name}</p>
                    <p className="text-xs text-slate-400">{money(l.p.price)} &middot; max {l.p.qty}</p>
                  </div>
                  <button className="chip !px-3" onClick={() => setQty(l.p.id, l.qty - 1)}>-</button>
                  <input className="inp !w-14 !px-1 text-center" type="number" value={l.qty} onChange={(e) => setQty(l.p.id, Number(e.target.value))} />
                  <button className="chip !px-3" onClick={() => setQty(l.p.id, l.qty + 1)}>+</button>
                  <button className="text-rose-400 p-1" onClick={() => setForm({ ...form, lines: form.lines.filter((x: any) => x.p.id !== l.p.id) })}><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          )}
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.paid} onChange={(e) => setForm({ ...form, paid: e.target.checked })} />Already paid</label>
          <div className="flex justify-between items-center text-lg font-bold pt-1"><span>Total</span><span className="grad-text">{money(total)}</span></div>
          {err && <p className="text-rose-400 text-sm">{err}</p>}
          <button className="btn w-full flex justify-center items-center gap-2" disabled={busy} onClick={create}>{busy && <Loader2 size={18} className="animate-spin" />}Create order</button>
        </Modal>
      )}
    </div>
  );
}