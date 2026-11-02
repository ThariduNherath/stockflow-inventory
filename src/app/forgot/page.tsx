"use client";
import { useState } from "react";
import Link from "next/link";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
export default function Forgot() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!email.trim()) return;
    setBusy(true);
    await fetch("/api/auth/forgot", { method: "POST", body: JSON.stringify({ email }) }).catch(() => {});
    setBusy(false); setSent(true);
  };
  return (
    <div className="min-h-screen grid place-items-center p-4">
      <div className="glass p-8 w-full max-w-sm space-y-4 up shadow-2xl">
        <Link href="/login" className="text-sm text-slate-400 flex items-center gap-1 hover:text-white"><ArrowLeft size={16} />Back to login</Link>
        <div className="text-center space-y-2">
          <span className="inline-block p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500"><Mail size={28} /></span>
          <h1 className="text-2xl font-bold grad-text">Forgot password</h1>
        </div>
        {sent ? (
          <p className="text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-400/30 rounded-xl p-3">If that email exists, a reset link has been sent (valid 30 minutes). In development, the link is printed in the server terminal.</p>
        ) : (
          <>
            <input className="inp" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} />
            <button className="btn w-full flex justify-center items-center gap-2" disabled={busy} onClick={submit}>{busy && <Loader2 size={18} className="animate-spin" />}Send reset link</button>
          </>
        )}
      </div>
    </div>
  );
}