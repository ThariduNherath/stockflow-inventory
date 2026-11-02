"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Plus, Search, Pencil, Trash2, ArrowDownUp, ArrowUpDown, PackageOpen, AlertTriangle, Truck } from "lucide-react";
import { toast } from "@/components/Toast";
import Modal from "@/components/Modal";
import Pager from "@/components/Pager";
type P = { id: string; sku: string; name: string; price: string; qty: number; minQty: number; image: string | null; supplierId: string | null; category: { name: string } | null; supplier: { id: string; name: string } | null };
const empty = { sku: "", name: "", price: "", qty: "0", minQty: "5", category: "", image: "", supplierId: "" };
const sorts = [["new", "Newest"], ["name", "Name"], ["price", "Price"], ["qty", "Stock"]];
export default function Products() {
  const [items, setItems] = useState<P[]>([]);
  const [cats, setCats] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("STAFF");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [low, setLow] = useState(false);
  const [sort, setSort] = useState("new");
  const [dir, setDir] = useState("desc");
  const [form, setForm] = useState<any>(null);
  const [stock, setStock] = useState<any>(null);
  const [err, setErr] = useState("");
  const rid = useRef(0);
  const load = () => {
    const id = ++rid.current;
    const u = `/api/products?page=${page}&size=12&q=${encodeURIComponent(q)}&cat=${encodeURIComponent(cat)}&low=${low ? 1 : 0}&sort=${sort}&dir=${dir}`;
    return fetch(u).then((r) => r.json()).then((d) => {
      if (id !== rid.current) return;
      if ((d.items || []).length === 0 && page > 1) return setPage(page - 1);
      setItems(d.items || []); setTotal(d.total || 0); setPages(d.pages || 1); setCats(d.cats || []); setRole(d.role); setLoading(false);
    });
  };
  useEffect(() => { load(); }, [q, cat, low, sort, dir, page]);
  useEffect(() => { fetch("/api/suppliers").then((r) => r.json()).then((d) => setSuppliers(d.items || [])); }, []);
  const can = role !== "STAFF";
  const chSort = (v: string) => { setSort(v); setDir(v === "name" ? "asc" : "desc"); setPage(1); };
  const call = async (url: string, method: string, body: any, done: () => void, msg: string) => {
    const r = await fetch(url, { method, body: body && JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { setErr(j.error || "Error"); return toast(j.error || "Error", "err"); }
    setErr(""); done(); load(); toast(msg);
  };
  const upload = async (f: File) => {
    const r = await fetch("/api/upload", { method: "POST", body: JSON.stringify({ name: f.name, type: f.type }) });
    if (!r.ok) return toast("Upload failed (S3?)", "err");
    const { url, publicUrl } = await r.json();
    await fetch(url, { method: "PUT", headers: { "Content-Type": f.type }, body: f });
    setForm((x: any) => ({ ...x, image: publicUrl }));
    toast("Image uploaded");
  };
  const field = (k: string, label: string, type = "text") => (
    <div><label className="text-xs text-slate-400">{label}</label>
      <input className="inp" type={type} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} /></div>
  );
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold">Products <span className="text-slate-500 text-lg">({total})</span></h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1"><Search size={16} className="absolute left-3 top-3.5 text-slate-400" />
            <input className="inp pl-9" placeholder="Search name or SKU..." value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} /></div>
          {can && <button className="btn hidden sm:flex items-center gap-1" onClick={() => { setErr(""); setForm(empty); }}><Plus size={18} />Add</button>}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-2 overflow-x-auto pb-1 flex-1 min-w-0">
          <button className={`chip ${!cat && !low ? "chip-on" : ""}`} onClick={() => { setCat(""); setLow(false); setPage(1); }}>All</button>
          <button className={`chip flex items-center gap-1 ${low ? "chip-on" : ""}`} onClick={() => { setLow(!low); setPage(1); }}><AlertTriangle size={14} />Low stock</button>
          {cats.map((c) => <button key={c} className={`chip ${cat === c ? "chip-on" : ""}`} onClick={() => { setCat(cat === c ? "" : c); setPage(1); }}>{c}</button>)}
        </div>
        <select className="inp !w-auto bg-slate-900 !py-1.5 text-sm" value={sort} onChange={(e) => chSort(e.target.value)}>
          {sorts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <button className="chip flex items-center gap-1" onClick={() => { setDir(dir === "asc" ? "desc" : "asc"); setPage(1); }}><ArrowUpDown size={14} />{dir === "asc" ? "Asc" : "Desc"}</button>
      </div>
      {loading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">{[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="sk h-36" />)}</div>
      ) : items.length === 0 ? (
        <div className="glass p-10 text-center text-slate-400"><PackageOpen size={48} className="mx-auto mb-3" />No products found</div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((p, i) => {
            const isLow = p.qty <= p.minQty;
            const pct = Math.min(100, (p.qty / Math.max(p.minQty * 3, 1)) * 100);
            return (
              <div key={p.id} className="card p-4 flex gap-4 up" style={{ animationDelay: Math.min(i, 8) * 50 + "ms" }}>
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 overflow-hidden shrink-0 grid place-items-center text-2xl font-bold text-white/40">
                  {p.image ? <img src={p.image} alt="" className="w-full h-full object-cover" /> : p.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2">
                    <Link href={"/products/" + p.id} className="font-semibold truncate hover:text-indigo-300">{p.name}</Link>
                    <p className="font-semibold text-indigo-300">${Number(p.price).toFixed(2)}</p>
                  </div>
                  <p className="text-xs text-slate-400">{p.sku} &middot; {p.category?.name || "-"}</p>
                  {p.supplier && <p className="text-xs text-slate-400 flex items-center gap-1 truncate"><Truck size={12} />{p.supplier.name}</p>}
                  <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden"><div className={`h-full rounded-full transition-all duration-700 ${isLow ? "bg-rose-400" : "bg-emerald-400"}`} style={{ width: pct + "%" }} /></div>
                  <p className={`text-xs mt-1 ${isLow ? "text-rose-300" : "text-emerald-300"}`}>{p.qty} in stock{isLow && " - low!"}</p>
                  <div className="flex gap-3 mt-2">
                    <button className="p-2 -m-1 rounded-lg hover:bg-white/10" title="Stock" onClick={() => { setErr(""); setStock({ p, type: "IN", qty: "1", note: "" }); }}><ArrowDownUp size={18} /></button>
                    {can && <button className="p-2 -m-1 rounded-lg hover:bg-white/10" title="Edit" onClick={() => { setErr(""); setForm({ id: p.id, sku: p.sku, name: p.name, price: p.price, qty: p.qty, minQty: p.minQty, image: p.image || "", category: p.category?.name || "", supplierId: p.supplierId || "" }); }}><Pencil size={18} /></button>}
                    {role === "ADMIN" && <button className="p-2 -m-1 rounded-lg hover:bg-rose-500/20 text-rose-400" title="Delete" onClick={() => confirm("Delete " + p.name + "?") && call("/api/products/" + p.id, "DELETE", null, () => {}, "Product deleted")}><Trash2 size={18} /></button>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Pager page={page} pages={pages} set={(n) => { setPage(n); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
      {can && <button onClick={() => { setErr(""); setForm(empty); }} className="sm:hidden fixed right-5 bottom-24 z-40 w-14 h-14 rounded-full btn !p-0 grid place-items-center shadow-2xl"><Plus size={26} /></button>}
      {form && (
        <Modal title={form.id ? "Edit product" : "New product"} close={() => setForm(null)}>
          {field("name", "Name")}{field("sku", "SKU")}{field("price", "Price", "number")}
          {!form.id && field("qty", "Opening qty", "number")}{field("minQty", "Low-stock level", "number")}{field("category", "Category")}
          <div><label className="text-xs text-slate-400">Supplier</label>
            <select className="inp bg-slate-900" value={form.supplierId || ""} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}>
              <option value="">- None -</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select></div>
          <div><label className="text-xs text-slate-400">Image (S3)</label>
            <input type="file" accept="image/*" className="inp" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            {form.image && <img src={form.image} alt="" className="h-16 mt-2 rounded-lg" />}</div>
          {err && <p className="text-rose-400 text-sm">{err}</p>}
          <button className="btn w-full" onClick={() => call(form.id ? "/api/products/" + form.id : "/api/products", form.id ? "PUT" : "POST", form, () => setForm(null), "Product saved")}>Save</button>
        </Modal>
      )}
      {stock && (
        <Modal title={"Stock: " + stock.p.name} close={() => setStock(null)}>
          <div className="grid grid-cols-2 gap-2">
            {["IN", "OUT"].map((t) => (
              <button key={t} onClick={() => setStock({ ...stock, type: t })} className={`py-2.5 rounded-xl border transition ${stock.type === t ? (t === "IN" ? "bg-emerald-500/30 border-emerald-400" : "bg-rose-500/30 border-rose-400") : "border-white/10"}`}>{t === "IN" ? "+ Stock In" : "- Stock Out"}</button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button className="chip !px-4 !py-2" onClick={() => setStock({ ...stock, qty: String(Math.max(1, Number(stock.qty) - 1)) })}>-</button>
            <input className="inp text-center" type="number" min={1} value={stock.qty} onChange={(e) => setStock({ ...stock, qty: e.target.value })} />
            <button className="chip !px-4 !py-2" onClick={() => setStock({ ...stock, qty: String(Number(stock.qty) + 1) })}>+</button>
          </div>
          <input className="inp" placeholder="Note (optional)" value={stock.note} onChange={(e) => setStock({ ...stock, note: e.target.value })} />
          {err && <p className="text-rose-400 text-sm">{err}</p>}
          <button className="btn w-full" onClick={() => call("/api/stock", "POST", { productId: stock.p.id, type: stock.type, qty: stock.qty, note: stock.note }, () => setStock(null), "Stock updated")}>Confirm</button>
        </Modal>
      )}
    </div>
  );
}