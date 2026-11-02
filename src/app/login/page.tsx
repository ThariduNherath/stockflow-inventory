"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Boxes, Eye, EyeOff, Loader2 } from "lucide-react";
export default function Login() {
  const r = useRouter();
  const [f, setF] = useState({ email: "admin@demo.com", password: "admin123" });
  const [err, setErr] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true); setErr("");
    const res = await fetch("/api/auth/login", { method: "POST", body: JSON.stringify(f) });
    if (res.ok) { r.push("/"); r.refresh(); } else { setErr((await res.json()).error); setBusy(false); }
  };
  return (
    <div className="min-h-screen grid place-items-center p-4">
      <div className="glass p-8 w-full max-w-sm space-y-5 up shadow-2xl">
        <div className="text-center space-y-2">
          <span className="inline-block p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-lg animate-bounce"><Boxes size={32} /></span>
          <h1 className="text-3xl font-bold grad-text">StockFlow</h1>
          <p className="text-slate-400 text-sm">Sign in to manage your inventory</p>
        </div>
        <input className="inp" placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} onKeyDown={(e) => e.key === "Enter" && submit()} />
        <div className="relative">
          <input className="inp pr-11" type={show ? "text" : "password"} placeholder="Password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} onKeyDown={(e) => e.key === "Enter" && submit()} />
          <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-3 text-slate-400">{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
        </div>
        {err && <p className="text-rose-400 text-sm">{err}</p>}
        <button className="btn w-full flex justify-center items-center gap-2" disabled={busy} onClick={submit}>
          {busy && <Loader2 size={18} className="animate-spin" />}Sign in
        </button>
      </div>
    </div>
  );
}