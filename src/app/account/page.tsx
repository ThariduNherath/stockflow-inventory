"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { KeyRound, Loader2, ShieldAlert, ArrowLeft } from "lucide-react";
import { toast } from "@/components/Toast";
export default function Account() {
  const r = useRouter();
  const [force, setForce] = useState(false);
  const [f, setF] = useState({ current: "", next: "", confirm: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { fetch("/api/auth/password").then((x) => x.json()).then((d) => setForce(!!d.mustChange)); }, []);
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  const submit = async () => {
    if (f.next !== f.confirm) return setErr("Passwords do not match");
    setBusy(true); setErr("");
    const res = await fetch("/api/auth/password", { method: "POST", body: JSON.stringify({ current: f.current, next: f.next }) });
    const j = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setErr(j.error || "Error");
    toast("Password changed");
    r.push("/"); r.refresh();
  };
  const strength = [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((x) => x.test(f.next)).length;
  return (
    <div className="min-h-screen grid place-items-center p-4">
      <div className="glass p-8 w-full max-w-sm space-y-4 up shadow-2xl">
        {!force && <Link href="/" className="text-sm text-slate-400 flex items-center gap-1 hover:text-white"><ArrowLeft size={16} />Back</Link>}
        <div className="text-center space-y-2">
          <span className="inline-block p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500"><KeyRound size={28} /></span>
          <h1 className="text-2xl font-bold grad-text">Change password</h1>
        </div>
        {force && <p className="flex gap-2 text-sm text-amber-300 bg-amber-500/10 border border-amber-400/30 rounded-xl p-3"><ShieldAlert size={18} className="shrink-0" />You must change the default password before using the system.</p>}
        <input className="inp" type="password" placeholder="Current password" value={f.current} onChange={set("current")} />
        <input className="inp" type="password" placeholder="New password (min 8)" value={f.next} onChange={set("next")} />
        <div className="flex gap-1">{[0, 1, 2, 3].map((i) => <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i < strength ? ["bg-rose-400", "bg-amber-400", "bg-lime-400", "bg-emerald-400"][strength - 1] : "bg-white/10"}`} />)}</div>
        <input className="inp" type="password" placeholder="Confirm new password" value={f.confirm} onChange={set("confirm")} onKeyDown={(e) => e.key === "Enter" && submit()} />
        {err && <p className="text-rose-400 text-sm">{err}</p>}
        <button className="btn w-full flex justify-center items-center gap-2" disabled={busy} onClick={submit}>
          {busy && <Loader2 size={18} className="animate-spin" />}Update password
        </button>
        {force && <button className="text-xs text-slate-500 w-full hover:text-slate-300" onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); r.push("/login"); }}>Logout</button>}
      </div>
    </div>
  );
}