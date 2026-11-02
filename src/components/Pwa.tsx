"use client";
import { useEffect, useState } from "react";
import { Download } from "lucide-react";
export default function Pwa() {
  const [ev, setEv] = useState<any>(null);
  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
    const h = (e: any) => { e.preventDefault(); setEv(e); };
    const done = () => setEv(null);
    window.addEventListener("beforeinstallprompt", h);
    window.addEventListener("appinstalled", done);
    return () => { window.removeEventListener("beforeinstallprompt", h); window.removeEventListener("appinstalled", done); };
  }, []);
  if (!ev) return null;
  return (
    <button className="btn fixed bottom-20 left-4 md:bottom-6 md:left-auto md:right-6 z-50 flex items-center gap-2 text-sm shadow-2xl"
      onClick={async () => { ev.prompt(); await ev.userChoice; setEv(null); }}>
      <Download size={16} />Install app
    </button>
  );
}