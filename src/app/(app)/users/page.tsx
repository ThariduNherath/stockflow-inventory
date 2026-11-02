"use client";
import { useEffect, useState } from "react";
import { Plus, KeyRound, ShieldAlert, Search } from "lucide-react";
import { toast } from "@/components/Toast";
import Modal from "@/components/Modal";
const empty = { name: "", email: "", password: "", role: "STAFF" };
const badge: any = { ADMIN: "bg-fuchsia-500/20 text-fuchsia-300", MANAGER: "bg-sky-500/20 text-sky-300", STAFF: "bg-slate-500/20 text-slate-300" };
export default function UsersPage() {
  const [items, setItems] = useState<any[]>([]);
  const [me, setMe] = useState("");
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [q, setQ] = useState("");
  const [form, setForm] = useState<any>(null);
  const [reset, setReset] = useState<any>(null);
  const [err, setErr] = useState("");
  const load = async () => {
    const r = await fetch("/api/users");
    if (r.status === 403) return setDenied(true);
    const d = await r.json();
    setItems(d.items); setMe(d.me); setLoading(false);
  };
  useEffect(() => { load(); }, []);
  const send = async (url: string, method: string, body: any, msg: string) => {
    const r = await fetch(url, { method, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { setErr(j.error || "Error"); toast(j.error || "Error", "err"); return false; }
    setErr(""); load(); toast(msg); return true;
  };
  const shown = items.filter((u) => (u.name + u.email).toLowerCase().includes(q.toLowerCase()));
  if (denied) return <div className="glass p-8 text-center text-slate-400"><ShieldAlert size={40} className="mx-auto mb-3" />Admin only.</div>;
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold">Users <span className="text-slate-500 text-lg">({shown.length})</span></h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1"><Search size={16} className="absolute left-3 top-3.5 text-slate-400" />
            <input className="inp pl-9" placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <button className="btn hidden sm:flex items-center gap-1" onClick={() => { setErr(""); setForm(empty); }}><Plus size={18} />New user</button>
        </div>
      </div>
      {loading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">{[1, 2, 3].map((i) => <div key={i} className="sk h-32" />)}</div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {shown.map((u, i) => (
            <div key={u.id} className={`card p-4 up space-y-3 ${u.active ? "" : "opacity-60"}`} style={{ animationDelay: Math.min(i, 8) * 50 + "ms" }}>
              <div className="flex items-center gap-3">
                <span className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 grid place-items-center font-bold text-lg shrink-0">{u.name[0]}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">{u.name}{u.id === me && <span className="text-xs text-indigo-300"> (you)</span>}</p>
                  <p className="text-xs text-slate-400 truncate">{u.email}</p>
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded-full ${badge[u.role]}`}>{u.role}</span>
              </div>
              <div className="flex items-center gap-2">
                <select className="inp !w-auto bg-slate-900 !py-1.5 text-sm flex-1" value={u.role} disabled={u.id === me}
                  onChange={(e) => send("/api/users/" + u.id, "PUT", { role: e.target.value }, "Role updated")}>
                  <option>STAFF</option><option>MANAGER</option><option>ADMIN</option>
                </select>
                <button title="Reset password" className="p-2 rounded-lg hover:bg-white/10" onClick={() => { setErr(""); setReset({ id: u.id, name: u.name, password: "" }); }}><KeyRound size={18} /></button>
                <button disabled={u.id === me} onClick={() => send("/api/users/" + u.id, "PUT", { active: !u.active }, u.active ? "User disabled" : "User enabled")}
                  className={`text-xs px-3 py-1.5 rounded-full disabled:opacity-40 ${u.active ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`}>
                  {u.active ? "Active" : "Disabled"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <button onClick={() => { setErr(""); setForm(empty); }} className="sm:hidden fixed right-5 bottom-24 z-40 w-14 h-14 rounded-full btn !p-0 grid place-items-center shadow-2xl"><Plus size={26} /></button>
      {form && (
        <Modal title="New user" close={() => setForm(null)}>
          <input className="inp" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="inp" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="inp" type="password" placeholder="Password (min 6)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <select className="inp bg-slate-900" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option>STAFF</option><option>MANAGER</option><option>ADMIN</option>
          </select>
          {err && <p className="text-rose-400 text-sm">{err}</p>}
          <button className="btn w-full" onClick={async () => { if (await send("/api/users", "POST", form, "User created")) setForm(null); }}>Create</button>
        </Modal>
      )}
      {reset && (
        <Modal title={"Reset password: " + reset.name} close={() => setReset(null)}>
          <input className="inp" type="password" placeholder="New password (min 6)" value={reset.password} onChange={(e) => setReset({ ...reset, password: e.target.value })} />
          {err && <p className="text-rose-400 text-sm">{err}</p>}
          <button className="btn w-full" onClick={async () => { if (await send("/api/users/" + reset.id, "PUT", { password: reset.password }, "Password reset")) setReset(null); }}>Reset</button>
        </Modal>
      )}
    </div>
  );
}