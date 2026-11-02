"use client";
import { useEffect, useState } from "react";
import { UserPlus, KeyRound } from "lucide-react";
const empty = { name: "", email: "", password: "", role: "STAFF" };
export default function UsersPage() {
  const [items, setItems] = useState<any[]>([]);
  const [me, setMe] = useState("");
  const [f, setF] = useState(empty);
  const [err, setErr] = useState("");
  const [denied, setDenied] = useState(false);
  const load = async () => {
    const r = await fetch("/api/users");
    if (r.status === 403) return setDenied(true);
    const d = await r.json(); setItems(d.items); setMe(d.me);
  };
  useEffect(() => { load(); }, []);
  const send = async (url: string, method: string, body: any) => {
    const r = await fetch(url, { method, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { setErr(j.error || "Error"); return false; }
    setErr(""); load(); return true;
  };
  const add = async () => { if (await send("/api/users", "POST", f)) setF(empty); };
  const reset = (id: string) => {
    const p = prompt("New password (min 6)");
    if (p) send("/api/users/" + id, "PUT", { password: p });
  };
  if (denied) return <p className="text-rose-400">Admin only.</p>;
  return (
    <div className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold">Users</h2>
      <div className="glass p-5 space-y-3">
        <p className="font-medium flex items-center gap-2"><UserPlus size={18} />New user</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input className="inp" placeholder="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <input className="inp" placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          <input className="inp" type="password" placeholder="Password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
          <select className="inp bg-slate-900" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}>
            <option>STAFF</option><option>MANAGER</option><option>ADMIN</option>
          </select>
        </div>
        {err && <p className="text-rose-400 text-sm">{err}</p>}
        <button className="btn" onClick={add}>Create</button>
      </div>
      <div className="glass divide-y divide-white/5">
        {items.map((u) => (
          <div key={u.id} className="flex flex-wrap items-center gap-3 p-4">
            <div className="flex-1 min-w-[160px]">
              <p className={`font-medium ${u.active ? "" : "line-through text-slate-500"}`}>{u.name}{u.id === me && " (you)"}</p>
              <p className="text-xs text-slate-400">{u.email}</p>
            </div>
            <select className="inp !w-auto bg-slate-900" value={u.role} disabled={u.id === me}
              onChange={(e) => send("/api/users/" + u.id, "PUT", { role: e.target.value })}>
              <option>STAFF</option><option>MANAGER</option><option>ADMIN</option>
            </select>
            <button title="Reset password" onClick={() => reset(u.id)} className="text-slate-300"><KeyRound size={18} /></button>
            <button disabled={u.id === me} onClick={() => send("/api/users/" + u.id, "PUT", { active: !u.active })}
              className={`text-xs px-3 py-1 rounded-full disabled:opacity-40 ${u.active ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`}>
              {u.active ? "Active" : "Disabled"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}