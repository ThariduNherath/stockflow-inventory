"use client";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download, TrendingUp, ShoppingCart, Receipt, Wallet, Clock, Boxes, Trophy, ShieldAlert } from "lucide-react";
const fmt = (d: Date) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
const ago = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return fmt(d); };
const money = (n: any) => "$" + Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export default function Reports() {
  const [from, setFrom] = useState(ago(29));
  const [to, setTo] = useState(fmt(new Date()));
  const [d, setD] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const bad = from > to;
  useEffect(() => {
    if (bad) return;
    setLoading(true);
    fetch(`/api/reports?from=${from}&to=${to}`).then(async (r) => {
      if (r.status === 403) return setDenied(true);
      setD(await r.json());
    }).finally(() => setLoading(false));
  }, [from, to, bad]);
  const preset = (n: number) => { setFrom(ago(n)); setTo(fmt(new Date())); };
  const month = () => { const n = new Date(); setFrom(fmt(new Date(n.getFullYear(), n.getMonth(), 1))); setTo(fmt(n)); };
  const q = `from=${from}&to=${to}`;
  if (denied) return <div className="glass p-8 text-center text-slate-400"><ShieldAlert size={40} className="mx-auto mb-3" />Managers and Admins only.</div>;
  const cards = d ? [
    { k: "Revenue", v: money(d.revenue), sub: d.cancelled + " cancelled", I: TrendingUp, c: "from-emerald-500 to-teal-500" },
    { k: "Orders", v: d.orders, sub: "excl. cancelled", I: ShoppingCart, c: "from-sky-500 to-indigo-500" },
    { k: "Avg order", v: money(d.avg), sub: "", I: Receipt, c: "from-fuchsia-500 to-purple-500" },
    { k: "Paid", v: money(d.paid), sub: "", I: Wallet, c: "from-lime-500 to-emerald-500" },
    { k: "Pending", v: money(d.pending), sub: "", I: Clock, c: "from-amber-500 to-orange-500" },
    { k: "Stock value", v: money(d.stockValue), sub: d.stockUnits + " units, " + d.lowCount + " low", I: Boxes, c: "from-indigo-500 to-blue-500" },
  ] : [];
  return (
    <div className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold">Reports</h2>
      <div className="glass p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          <button className="chip" onClick={() => preset(6)}>Last 7 days</button>
          <button className="chip" onClick={() => preset(29)}>Last 30 days</button>
          <button className="chip" onClick={month}>This month</button>
        </div>
        <div className="grid grid-cols-2 gap-3 max-w-md">
          <div><label className="text-xs text-slate-400">From</label><input className="inp" style={{ colorScheme: "dark" }} type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
          <div><label className="text-xs text-slate-400">To</label><input className="inp" style={{ colorScheme: "dark" }} type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
        </div>
        {bad && <p className="text-rose-400 text-sm">"From" date must be before "To" date.</p>}
      </div>
      {!d ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">{[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="sk h-28" />)}</div>
      ) : (
        <div className={`space-y-6 transition-opacity ${loading ? "opacity-50" : ""}`}>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map(({ k, v, sub, I, c }: any, i: number) => (
              <div key={k} className="card p-4 md:p-5 up" style={{ animationDelay: i * 60 + "ms" }}>
                <span className={`inline-block p-2 rounded-xl bg-gradient-to-br ${c}`}><I size={18} /></span>
                <p className="text-slate-400 text-sm mt-3">{k}</p>
                <p className="text-xl md:text-2xl font-bold">{v}</p>
                {sub && <p className="text-xs text-slate-500">{sub}</p>}
              </div>
            ))}
          </div>
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="glass p-5 lg:col-span-2 h-80">
              <p className="mb-3 font-medium">Daily sales</p>
              <ResponsiveContainer width="100%" height="88%">
                <BarChart data={d.daily.map((x: any) => ({ ...x, day: x.day.slice(5) }))}>
                  <CartesianGrid stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="day" stroke="#94a3b8" tickLine={false} axisLine={false} minTickGap={18} />
                  <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} width={40} />
                  <Tooltip formatter={(v: any) => money(v)} contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 12 }} />
                  <Bar dataKey="total" fill="#818cf8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="glass p-5">
              <p className="mb-3 font-medium flex items-center gap-2"><Trophy size={16} className="text-amber-400" />Top products</p>
              {d.top.length === 0 && <p className="text-slate-400 text-sm">No sales in this range</p>}
              {d.top.map((t: any, i: number) => (
                <div key={t.name} className="flex items-center gap-3 py-2.5 border-b border-white/5">
                  <span className="w-6 h-6 rounded-full bg-white/10 grid place-items-center text-xs shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0"><p className="truncate text-sm">{t.name}</p><p className="text-xs text-slate-500">{t.qty} sold</p></div>
                  <span className="text-sm font-semibold">{money(t.revenue)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="glass p-5 space-y-3">
        <p className="font-medium flex items-center gap-2"><Download size={16} />Export CSV</p>
        <div className="flex flex-wrap gap-2">
          <a className="btn flex items-center gap-2" href="/api/export?type=products" download><Download size={16} />Products</a>
          <a className="btn flex items-center gap-2" href={"/api/export?type=orders&" + q} download><Download size={16} />Orders</a>
          <a className="btn flex items-center gap-2" href={"/api/export?type=history&" + q} download><Download size={16} />Stock history</a>
        </div>
        <p className="text-xs text-slate-500">Orders and History use the date range above. Products is always the current stock.</p>
      </div>
    </div>
  );
}