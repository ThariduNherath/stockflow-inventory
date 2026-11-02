"use client";
import { useEffect, useState } from "react";
import { Search, ShieldAlert, ShieldCheck } from "lucide-react";
import Pager from "@/components/Pager";
const ents = ["", "Product", "Supplier", "Order", "User", "Auth"];
const color: any = {
  CREATE: "bg-emerald-500/20 text-emerald-300", UPDATE: "bg-sky-500/20 text-sky-300",
  DELETE: "bg-rose-500/20 text-rose-300", STATUS: "bg-amber-500/20 text-amber-300",
  LOGIN: "bg-indigo-500/20 text-indigo-300", LOGIN_FAIL: "bg-rose-500/20 text-rose-300",
  PASSWORD: "bg-fuchsia-500/20 text-fuchsia-300",
};
export default function Audit() {
  const [d, setD] = useState<any>(null);
  const [entity, setEntity] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [denied, setDenied] = useState(false);
  useEffect(() => {
    let off = false;
    fetch(`/api/audit?entity=${entity}&q=${encodeURIComponent(q)}&page=${page}`).then(async (r) => {
      if (r.status === 403) return setDenied(true);
      const j = await r.json();
      if (!off) setD(j);
    });
    return () => { off = true; };
  }, [entity, q, page]);
  if (denied) return <div className="glass p-8 text-center text-slate-400"><ShieldAlert size={40} className="mx-auto mb-3" />Admin only.</div>;
  return (
    <div className="space-y-5">
      <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2"><ShieldCheck className="text-indigo-400" />Audit log {d && <span className="text-slate-500 text-lg">({d.total})</span>}</h2>
      <div className="relative">
        <Search size={16} className="absolute left-3 top-3.5 text-slate-400" />
        <input className="inp pl-9" placeholder="Search user, action, detail..." value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {ents.map((e) => <button key={e} className={`chip ${entity === e ? "chip-on" : ""}`} onClick={() => { setEntity(e); setPage(1); }}>{e || "All"}</button>)}
      </div>
      {!d ? <div className="space-y-2">{[1, 2, 3, 4].map((i) => <div key={i} className="sk h-16" />)}</div> : (
        <div className="glass divide-y divide-white/5">
          {d.items.length === 0 && <p className="p-6 text-slate-400">No records</p>}
          {d.items.map((a: any) => (
            <div key={a.id} className="p-4 flex flex-wrap items-center gap-3">
              <span className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 ${color[a.action] || "bg-slate-500/20 text-slate-300"}`}>{a.action}</span>
              <div className="flex-1 min-w-[180px]">
                <p className="text-sm"><span className="font-medium">{a.entity}</span> <span className="text-slate-400">{a.detail}</span></p>
                <p className="text-xs text-slate-500">{a.userName} &middot; {new Date(a.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {d && <Pager page={page} pages={d.pages} set={setPage} />}
    </div>
  );
}