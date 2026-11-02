"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { KeyRound, Loader2 } from "lucide-react";
export default function Reset() {
  const [token, setToken] = useState("");
  const [p, setP] = useState(""), [c, setC] = useState("");
  const [err, setErr] = useState(""), [done, setDone] = useState(false), [busy, setBusy] = useState(false);
  useEffect(() => { setToken(new URLSearchParams(window.location.search).get("token") || ""); }, []);
  const submit = async () => {
    if (p !== c) return setErr("Passwords do not match");
    setBusy(true); setErr("");
    const r = await fetch("/api/auth/reset", { method: "POST", body: JSON.stringify({ token, password: p }) });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) return setErr(j.error || "Error");
    setDone(true);
  };
  return (
    <div className="min-h-screen grid place-items-center p-4">
      <div className="glass p-8 w-full max-w-sm space-y-4 up shadow-2xl">
        <div className="text-center space-y-2">
          <span className="inline-block p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500"><KeyRound size={28} /></span>
          <h1 className="text-2xl font-bold grad-text">Set new password</h1>
        </div>
        {done ? (
          <>
            <p className="text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-400/30 rounded-xl p-3">Password updated. You can sign in now.</p>
            <Link href="/login" className="btn block text-center">Go to login</Link>
          </>
        ) : !token ? (
          <p className="text-rose-400 text-sm">Missing reset token. Use the link from your email.</p>
        ) : (
          <>
            <input className="inp" type="password" placeholder="New password (min 8)" value={p} onChange={(e) => setP(e.target.value)} />
            <input className="inp" type="password" placeholder="Confirm password" value={c} onChange={(e) => setC(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} />
            {err && <p className="text-rose-400 text-sm">{err}</p>}
            <button className="btn w-full flex justify-center items-center gap-2" disabled={busy} onClick={submit}>{busy && <Loader2 size={18} className="animate-spin" />}Update password</button>
          </>
        )}
      </div>
    </div>
  );
}