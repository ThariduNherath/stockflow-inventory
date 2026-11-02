"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowLeft, ArrowDownCircle, ArrowUpCircle, Truck, Tag } from "lucide-react";
export default function ProductDetail({ params }: { params: { id: string } }) {
  const [d, setD] = useState<any>(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    fetch("/api/products/" + params.id).then(async (r) => { const j = await r.json(); if (!r.ok) setErr(j.error || "Error"); else setD(j); });
  }, [params.id]);
  if (err) return <div className="glass p-8 text-center text-slate-400">{err}<br /><Link href="/products" className="text-indigo-300">Back to products</Link></div>;
  if (!d) return <div className="space-y-4"><div className="sk h-10 w-64" /><div className="sk h-24" /><div className="sk h-72" /></div>;
  const p = d.product, low = p.qty <= p.minQty;
  const stats = [
    ["Price", "$" + Number(p.price).toFixed(2)],
    ["In stock", p.qty + (low ? " (low)" : "")],
    ["Stock value", "$" + (Number(p.price) * p.qty).toFixed(2)],
    ["In (30d)", "+" + d.in30],
    ["Out (30d)", "-" + d.out30],
  ];
  return (
    <div className="space-y-6">
      <Link href="/products" className="text-sm text-slate-400 flex items-center gap-1 hover:text-white"><ArrowLeft size={16} />Products</Link>
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-fuchsia-500/30 overflow-hidden grid place-items-center text-3xl font-bold shrink-0">
          {p.image ? <img src={p.image} alt="" className="w-full h-full object-cover" /> : p.name[0]}
        </div>
        <div className="min-w-0">
          <h2 className="text-2xl md:text-3xl font-bold truncate">{p.name}</h2>
          <p className="text-sm text-slate-400 flex flex-wrap items-center gap-x-3">
            <span>{p.sku}</span>
            <span className="flex items-center gap-1"><Tag size={13} />{p.category?.name || "-"}</span>
            {p.supplier && <span className="flex items-center gap-1"><Truck size={13} />{p.supplier.name}</span>}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {stats.map(([k, v]) => (
          <div key={k} className="card p-4"><p className="text-xs text-slate-400">{k}</p><p className={`text-lg font-bold ${k === "In stock" && low ? "text-rose-400" : ""}`}>{v}</p></div>
        ))}
      </div>
      <div className="glass p-5 h-80">
        <p className="mb-3 font-medium">Stock level (30 days)</p>
        <ResponsiveContainer width="100%" height="88%">
          <AreaChart data={d.chart}>
            <defs><linearGradient id="gq" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#818cf8" stopOpacity={0.6} /><stop offset="95%" stopColor="#818cf8" stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid stroke="#ffffff10" vertical={false} />
            <XAxis dataKey="day" stroke="#94a3b8" tickLine={false} axisLine={false} minTickGap={20} />
            <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} width={34} />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 12 }} />
            <Area type="stepAfter" dataKey="qty" stroke="#818cf8" strokeWidth={2} fill="url(#gq)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="glass divide-y divide-white/5">
        <p className="p-4 font-medium">Recent movements</p>
        {d.moves.length === 0 && <p className="p-4 text-slate-400 text-sm">No movements yet</p>}
        {d.moves.map((m: any) => (
          <div key={m.id} className="p-4 flex items-center gap-3">
            {m.type === "IN" ? <ArrowDownCircle className="text-emerald-400 shrink-0" /> : <ArrowUpCircle className="text-rose-400 shrink-0" />}
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{m.note || (m.type === "IN" ? "Stock in" : "Stock out")}</p>
              <p className="text-xs text-slate-400">{m.user.name} &middot; {new Date(m.createdAt).toLocaleString()}</p>
            </div>
            <span className={`font-bold ${m.type === "IN" ? "text-emerald-400" : "text-rose-400"}`}>{m.type === "IN" ? "+" : "-"}{m.qty}</span>
          </div>
        ))}
      </div>
    </div>
  );
}