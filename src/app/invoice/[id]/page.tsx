"use client";
import { useEffect, useState } from "react";
import { Printer, ArrowLeft } from "lucide-react";
const money = (n: any) => "$" + Number(n).toFixed(2);
export default function Invoice({ params }: { params: { id: string } }) {
  const [o, setO] = useState<any>(null);
  useEffect(() => { fetch("/api/orders/" + params.id).then((r) => r.json()).then(setO).catch(() => setO({ error: "Failed to load" })); }, [params.id]);
  const shell = "fixed inset-0 overflow-auto bg-white text-black z-50 print:static print:overflow-visible";
  if (!o) return <div className={shell + " p-8"}>Loading...</div>;
  if (o.error) return <div className={shell + " p-8"}>{o.error}</div>;
  const c = o.customerRef;
  return (
    <div className={shell}>
      <div className="max-w-3xl mx-auto p-6 md:p-10">
        <div className="flex gap-2 mb-6 print:hidden">
          <a href="/orders" className="px-4 py-2 rounded-lg border border-slate-300 flex items-center gap-1 text-sm"><ArrowLeft size={16} />Orders</a>
          <button onClick={() => window.print()} className="px-4 py-2 rounded-lg bg-indigo-600 text-white flex items-center gap-1 text-sm"><Printer size={16} />Print / Save PDF</button>
        </div>
        <div className="flex justify-between items-start border-b pb-6">
          <div><h1 className="text-3xl font-bold text-indigo-600">StockFlow</h1><p className="text-sm text-slate-500">Inventory &amp; Sales</p></div>
          <div className="text-right">
            <p className="text-2xl font-semibold">INVOICE</p>
            <p className="text-sm text-slate-600">INV-{String(o.no).padStart(5, "0")}</p>
            <p className="text-sm text-slate-600">{new Date(o.createdAt).toLocaleDateString()}</p>
            <p className={`text-xs mt-1 font-semibold ${o.status === "PAID" ? "text-emerald-600" : o.status === "CANCELLED" ? "text-rose-600" : "text-amber-600"}`}>{o.status}</p>
          </div>
        </div>
        <div className="py-6">
          <p className="text-xs uppercase text-slate-500">Bill to</p>
          <p className="font-semibold">{o.customer}</p>
          {c?.phone && <p className="text-sm text-slate-600">{c.phone}</p>}
          {c?.email && <p className="text-sm text-slate-600">{c.email}</p>}
          {c?.address && <p className="text-sm text-slate-600">{c.address}</p>}
        </div>
        <table className="w-full text-sm">
          <thead><tr className="border-b-2 border-slate-300 text-left"><th className="py-2">Item</th><th className="py-2 text-right">Price</th><th className="py-2 text-right">Qty</th><th className="py-2 text-right">Amount</th></tr></thead>
          <tbody>
            {o.items.map((i: any) => (
              <tr key={i.id} className="border-b border-slate-200"><td className="py-2">{i.name}</td><td className="py-2 text-right">{money(i.price)}</td><td className="py-2 text-right">{i.qty}</td><td className="py-2 text-right">{money(Number(i.price) * i.qty)}</td></tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-end pt-4"><div className="text-right"><p className="text-sm text-slate-500">Total</p><p className="text-3xl font-bold">{money(o.total)}</p></div></div>
        <p className="text-xs text-slate-500 mt-10 text-center">Served by {o.user.name}. Thank you for your business.</p>
      </div>
    </div>
  );
}