"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Bell as BellIcon } from "lucide-react";
export default function Bell({ className = "" }: { className?: string }) {
  const [d, setD] = useState<any>({ count: 0, items: [] });
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const f = () => fetch("/api/alerts").then((r) => (r.ok ? r.json() : null)).then((j) => j && setD(j)).catch(() => {});
    f();
    const t = setInterval(f, 60000);
    return () => clearInterval(t);
  }, []);
  return (
    <>
      <button onClick={() => setOpen(!open)} title="Low stock alerts" className={"relative " + className}>
        <BellIcon size={18} />
        {d.count > 0 && <span className="absolute -top-2 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] grid place-items-center">{d.count}</span>}
      </button>
      {open && createPortal(
        <>
          <div className="fixed inset-0 z-[55]" onClick={() => setOpen(false)} />
          <div className="fixed z-[56] top-16 right-4 md:right-auto md:left-64 w-72 glass !bg-slate-900/95 p-3 shadow-2xl sheet">
            <p className="font-medium mb-2 text-sm">Low stock ({d.count})</p>
            {d.items.length === 0 && <p className="text-slate-400 text-sm">All good</p>}
            {d.items.map((p: any) => (
              <Link key={p.id} href={"/products/" + p.id} onClick={() => setOpen(false)} className="flex justify-between items-center py-2 border-b border-white/5 text-sm hover:text-indigo-300">
                <span className="truncate">{p.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">{p.qty} / {p.minQty}</span>
              </Link>
            ))}
          </div>
        </>, document.body)}
    </>
  );
}