"use client";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
export default function Modal({ title, close, children }: { title: string; close: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const esc = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", esc);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", esc); };
  }, [close]);
  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto" onClick={close}>
      <div className="min-h-full flex items-center justify-center p-4">
        <div onClick={(e) => e.stopPropagation()} className="sheet glass !bg-slate-900/95 p-6 w-full max-w-md space-y-3 shadow-2xl">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">{title}</h3>
            <button onClick={close} className="p-1 rounded-lg hover:bg-white/10"><X /></button>
          </div>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}