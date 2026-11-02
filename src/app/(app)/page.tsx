"use client";
import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Package, Wallet, AlertTriangle, Layers, ShoppingCart, TrendingUp } from "lucide-react";
function Num({ to, pre = "" }: { to: number; pre?: string }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let s = 0;
    const t = setInterval(() => { s++; setV(Math.round(to * Math.min(1, s / 25))); if (s >= 25) clearInterval(t); }, 24);
    return () => clearInterval(t);
  }, [to]);
  return <>{pre}{v.toLocaleString()}</>;
}
export default function Dashboard() {
  const [d, setD] = useState<any>(null);
  useEffect(() => { fetch("/api/dashboard").then((r) => r.json()).then(setD); }, []);
  const h = new Date().getHours();
  const hi = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  if (!d) return (
    <div className="space-y-6">
      <div className="sk h-10 w-64" />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">{[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="sk h-28" />)}</div>
      <div className="sk h-72" />
    </div>
  );
  const cards = [
    { k: "Today sales", v: d.today, pre: "$", I: ShoppingCart, c: "from-sky-500 to-indigo-500", sub: d.todayCount + " orders" },
    { k: "Month revenue", v: d.month, pre: "$", I: TrendingUp, c: "from-emerald-500 to-teal-500", sub: "Paid orders" },
    { k: "Products", v: d.count, pre: "", I: Package, c: "from-indigo-500 to-blue-500" },
    { k: "Stock Value", v: d.value, pre: "$", I: Wallet, c: "from-amber-500 to-orange-500" },
    { k: "Low Stock", v: d.low.length, pre: "", I: AlertTriangle, c: "from-rose-500 to-orange-500" },
    { k: "Total Units", v: d.units, pre: "", I: Layers, c: "from-fuchsia-500 to-purple-500" },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold">{hi}</h2>
        <p className="text-slate-400 text-sm">{new Date().toDateString()}</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(({ k, v, pre, I, c, sub }: any, i) => (
          <div key={k} className="card p-4 md:p-5 up" style={{ animationDelay: i * 80 + "ms" }}>
            <span className={`inline-block p-2 rounded-xl bg-gradient-to-br ${c}`}><I size={18} /></span>
            <p className="text-slate-400 text-sm mt-3">{k}</p>
            <p className="text-2xl md:text-3xl font-bold"><Num to={v} pre={pre} /></p>
            {sub && <p className="text-xs text-slate-500">{sub}</p>}
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="glass p-5 lg:col-span-2 h-80">
          <p className="mb-3 font-medium">Stock movement (7 days)</p>
          <ResponsiveContainer width="100%" height="88%">
            <AreaChart data={d.chart}>
              <defs>
                <linearGradient id="gi" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#818cf8" stopOpacity={0.6} /><stop offset="95%" stopColor="#818cf8" stopOpacity={0} /></linearGradient>
                <linearGradient id="go" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f472b6" stopOpacity={0.6} /><stop offset="95%" stopColor="#f472b6" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="day" stroke="#94a3b8" tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} width={30} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 12 }} />
              <Area type="monotone" dataKey="in" stroke="#818cf8" strokeWidth={2} fill="url(#gi)" />
              <Area type="monotone" dataKey="out" stroke="#f472b6" strokeWidth={2} fill="url(#go)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="glass p-5 max-h-80 overflow-auto">
          <p className="mb-3 font-medium flex items-center gap-2"><AlertTriangle size={16} className="text-rose-400" />Low stock</p>
          {d.low.length === 0 && <p className="text-slate-400 text-sm">All good</p>}
          {d.low.map((p: any) => (
            <div key={p.id} className="flex justify-between items-center py-2.5 border-b border-white/5">
              <span className="truncate">{p.name}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 animate-pulse">{p.qty} left</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}