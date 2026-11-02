"use client";
import { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2, Phone, Mail, MapPin, X, Truck } from "lucide-react";
import { toast } from "@/components/Toast";
import Modal from "@/components/Modal";
const empty = { name: "", phone: "", email: "", address: "" };
export default function Suppliers() {
  const [items, setItems] = useState<any[]>([]);
  const [role, setRole] = useState("STAFF");
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [form, setForm] = useState<any>(null);
  const [err, setErr] = useState("");
  const load = () => fetch("/api/suppliers").then((r) => r.json()).then((d) => { setItems(d.items || []); setRole(d.role); setLoading(false); });
  useEffect(() => { load(); }, []);
  const can = role !== "STAFF";
  const shown = items.filter((s) => (s.name + (s.email || "") + (s.phone || "")).toLowerCase().includes(q.toLowerCase()));
  const call = async (url: string, method: string, body: any, done: () => void, msg: string) => {
    const r = await fetch(url, { method, body: body && JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { setErr(j.error || "Error"); return toast(j.error || "Error", "err"); }
    setErr(""); done(); load(); toast(msg);
  };
  const field = (k: string, label: string, type = "text") => (
    <div><label className="text-xs text-slate-400">{label}</label>
      <input className="inp" type={type} value={form[k] || ""} onChange={(e) => setForm({ ...form, [k]: e.target.value })} /></div>
  );
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold">Suppliers <span className="text-slate-500 text-lg">({shown.length})</span></h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1"><Search size={16} className="absolute left-3 top-3.5 text-slate-400" />
            <input className="inp pl-9" placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} /></div>
          {can && <button className="btn hidden sm:flex items-center gap-1" onClick={() => { setErr(""); setForm(empty); }}><Plus size={18} />Add</button>}
        </div>
      </div>
      {loading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">{[1, 2, 3].map((i) => <div key={i} className="sk h-36" />)}</div>
      ) : shown.length === 0 ? (
        <div className="glass p-10 text-center text-slate-400"><Truck size={48} className="mx-auto mb-3" />No suppliers yet</div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {shown.map((s, i) => (
            <div key={s.id} className="card p-4 up space-y-2" style={{ animationDelay: Math.min(i, 8) * 50 + "ms" }}>
              <div className="flex items-center gap-3">
                <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 grid place-items-center font-bold text-lg shrink-0">{s.name[0]}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">{s.name}</p>
                  <p className="text-xs text-indigo-300">{s._count.products} products</p>
                </div>
              </div>
              <div className="text-sm text-slate-400 space-y-1">
                {s.phone && <p className="flex items-center gap-2"><Phone size={14} />{s.phone}</p>}
                {s.email && <p className="flex items-center gap-2 truncate"><Mail size={14} />{s.email}</p>}
                {s.address && <p className="flex items-center gap-2"><MapPin size={14} />{s.address}</p>}
              </div>
              {can && (
                <div className="flex gap-3 pt-1">
                  <button className="p-2 -m-1 rounded-lg hover:bg-white/10" onClick={() => { setErr(""); setForm({ ...s }); }}><Pencil size={18} /></button>
                  {role === "ADMIN" && <button className="p-2 -m-1 rounded-lg hover:bg-rose-500/20 text-rose-400" onClick={() => confirm("Delete " + s.name + "?") && call("/api/suppliers/" + s.id, "DELETE", null, () => {}, "Supplier deleted")}><Trash2 size={18} /></button>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {can && <button onClick={() => { setErr(""); setForm(empty); }} className="sm:hidden fixed right-5 bottom-24 z-40 w-14 h-14 rounded-full btn !p-0 grid place-items-center shadow-2xl"><Plus size={26} /></button>}
      {form && (
        <Modal title={form.id ? "Edit supplier" : "New supplier"} close={() => setForm(null)}>
          {field("name", "Name")}{field("phone", "Phone")}{field("email", "Email", "email")}{field("address", "Address")}
          {err && <p className="text-rose-400 text-sm">{err}</p>}
          <button className="btn w-full" onClick={() => call(form.id ? "/api/suppliers/" + form.id : "/api/suppliers", form.id ? "PUT" : "POST", { name: form.name, phone: form.phone, email: form.email, address: form.address }, () => setForm(null), "Supplier saved")}>Save</button>
        </Modal>
      )}
    </div>
  );
}