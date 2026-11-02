"use client";
import { useEffect, useRef, useState } from "react";
import { ScanLine, Camera, CameraOff, Loader2, Search } from "lucide-react";
import { toast } from "@/components/Toast";
export default function Scan() {
  const vid = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const timer = useRef<any>(null);
  const [on, setOn] = useState(false);
  const [sku, setSku] = useState("");
  const [p, setP] = useState<any>(null);
  const [type, setType] = useState("OUT");
  const [qty, setQty] = useState("1");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const stop = () => {
    clearInterval(timer.current);
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null; setOn(false);
  };
  useEffect(() => () => { clearInterval(timer.current); stream.current?.getTracks().forEach((t) => t.stop()); }, []);
  const lookup = async (code: string) => {
    const c = code.trim();
    if (!c) return;
    const d = await fetch("/api/products?q=" + encodeURIComponent(c)).then((r) => r.json());
    const list: any[] = d.items || [];
    const m = list.find((x) => x.sku.toLowerCase() === c.toLowerCase()) || (list.length === 1 ? list[0] : null);
    if (m) { setP(m); setMsg(""); setQty("1"); } else { setP(null); setMsg("No product found for: " + c); }
  };
  const start = async () => {
    setMsg("");
    if (!navigator.mediaDevices?.getUserMedia) return setMsg("Camera needs HTTPS (or localhost).");
    if (!("BarcodeDetector" in window)) return setMsg("This browser has no barcode scanner. Use Chrome (Android/desktop) or type the SKU below.");
    try { stream.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }); setOn(true); }
    catch { setMsg("Camera permission denied."); }
  };
  useEffect(() => {
    if (!on || !vid.current) return;
    const v = vid.current;
    v.srcObject = stream.current; v.play().catch(() => {});
    const det = new (window as any).BarcodeDetector();
    let working = false;
    timer.current = setInterval(async () => {
      if (working) return;
      working = true;
      try { const codes = await det.detect(v); if (codes.length) { const val = codes[0].rawValue; stop(); await lookup(val); } } catch {}
      working = false;
    }, 400);
    return () => clearInterval(timer.current);
  }, [on]);
  const confirmMove = async () => {
    setBusy(true);
    const r = await fetch("/api/stock", { method: "POST", body: JSON.stringify({ productId: p.id, type, qty, note: "Scan" }) });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) return toast(j.error || "Error", "err");
    toast((type === "IN" ? "+" : "-") + qty + " " + p.name);
    setP(null); setSku("");
  };
  return (
    <div className="space-y-5 max-w-lg">
      <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2"><ScanLine className="text-indigo-400" />Scan</h2>
      <div className="glass p-4 space-y-3">
        {on && <video ref={vid} playsInline muted className="w-full rounded-xl bg-black aspect-video object-cover" />}
        <button className="btn w-full flex justify-center items-center gap-2" onClick={on ? stop : start}>{on ? <><CameraOff size={18} />Stop camera</> : <><Camera size={18} />Scan with camera</>}</button>
        <div className="flex gap-2">
          <div className="relative flex-1"><Search size={16} className="absolute left-3 top-3.5 text-slate-400" />
            <input className="inp pl-9" placeholder="Or type SKU / name" value={sku} onChange={(e) => setSku(e.target.value)} onKeyDown={(e) => e.key === "Enter" && lookup(sku)} /></div>
          <button className="chip" onClick={() => lookup(sku)}>Find</button>
        </div>
        {msg && <p className="text-amber-300 text-sm">{msg}</p>}
      </div>
      {p && (
        <div className="glass p-4 space-y-3 up">
          <div><p className="font-semibold text-lg">{p.name}</p><p className="text-xs text-slate-400">{p.sku} &middot; in stock: <b>{p.qty}</b></p></div>
          <div className="grid grid-cols-2 gap-2">
            {["IN", "OUT"].map((t) => (
              <button key={t} onClick={() => setType(t)} className={`py-2.5 rounded-xl border transition ${type === t ? (t === "IN" ? "bg-emerald-500/30 border-emerald-400" : "bg-rose-500/30 border-rose-400") : "border-white/10"}`}>{t === "IN" ? "+ Stock In" : "- Stock Out"}</button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button className="chip !px-4 !py-2" onClick={() => setQty(String(Math.max(1, Number(qty) - 1)))}>-</button>
            <input className="inp text-center" type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} />
            <button className="chip !px-4 !py-2" onClick={() => setQty(String(Number(qty) + 1))}>+</button>
          </div>
          <button className="btn w-full flex justify-center items-center gap-2" disabled={busy} onClick={confirmMove}>{busy && <Loader2 size={18} className="animate-spin" />}Confirm</button>
        </div>
      )}
      <p className="text-xs text-slate-500">Barcodes/QR codes should contain the product SKU (e.g. DEMO-001). Camera scanning needs HTTPS or localhost, and a browser with BarcodeDetector support.</p>
    </div>
  );
}