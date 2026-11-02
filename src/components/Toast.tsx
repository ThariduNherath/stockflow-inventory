"use client";
import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
export const toast = (m: string, t: "ok" | "err" = "ok") =>
  window.dispatchEvent(new CustomEvent("toast", { detail: { m, t } }));
export default function Toaster() {
  const [l, setL] = useState<any[]>([]);
  useEffect(() => {
    const h = (e: any) => {
      const id = Math.random();
      setL((x) => [...x, { id, ...e.detail }]);
      setTimeout(() => setL((x) => x.filter((i) => i.id !== id)), 3000);
    };
    window.addEventListener("toast", h);
    return () => window.removeEventListener("toast", h);
  }, []);
  return (
    <div className="fixed top-4 right-4 z-[60] space-y-2">
      {l.map((i) => (
        <div key={i.id} style={{ animation: "toastin .3s" }} className={`glass !bg-slate-900/90 px-4 py-3 flex items-center gap-2 text-sm ${i.t === "ok" ? "border-emerald-400/40" : "border-rose-400/40"}`}>
          {i.t === "ok" ? <CheckCircle2 size={18} className="text-emerald-400" /> : <XCircle size={18} className="text-rose-400" />}{i.m}
        </div>
      ))}
    </div>
  );
}