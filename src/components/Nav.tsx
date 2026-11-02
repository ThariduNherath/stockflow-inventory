"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, Users2, Truck, ClipboardList, ScanLine, ClipboardCheck, History, BarChart3, ShieldCheck, Users, LogOut, Boxes, KeyRound } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import Bell from "./Bell";
import { useLang, setLang } from "@/lib/i18n";
const all: any[] = [
  { h: "/", k: "home", I: LayoutDashboard },
  { h: "/products", k: "products", I: Package },
  { h: "/orders", k: "orders", I: ShoppingCart },
  { h: "/customers", k: "customers", I: Users2 },
  { h: "/suppliers", k: "suppliers", I: Truck },
  { h: "/purchases", k: "purchases", I: ClipboardList, mgr: true },
  { h: "/scan", k: "scan", I: ScanLine },
  { h: "/stocktake", k: "stocktake", I: ClipboardCheck, mgr: true },
  { h: "/history", k: "history", I: History },
  { h: "/reports", k: "reports", I: BarChart3, mgr: true },
  { h: "/audit", k: "audit", I: ShieldCheck, admin: true },
  { h: "/users", k: "users", I: Users, admin: true },
];
export default function Nav({ name, role }: { name: string; role: string }) {
  const p = usePathname(), r = useRouter();
  const { l, t } = useLang();
  const items = all.filter((i) => (!i.admin || role === "ADMIN") && (!i.mgr || role !== "STAFF"));
  const out = async () => { await fetch("/api/auth/logout", { method: "POST" }); r.push("/login"); r.refresh(); };
  const lang = <button onClick={() => setLang(l === "en" ? "si" : "en")} title="Language" className="text-xs font-semibold text-slate-400 hover:text-white border border-white/10 rounded-md px-1.5 py-0.5">{l === "en" ? "SI" : "EN"}</button>;
  const active = (h: string) => (h === "/" ? p === "/" : p === h || p.startsWith(h + "/"));
  return (
    <>
      <aside className="hidden md:flex fixed inset-y-0 w-60 glass !rounded-none flex-col p-5 z-30 overflow-y-auto">
        <div className="flex items-center gap-2 mb-3">
          <span className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500"><Boxes size={20} /></span>
          <h1 className="text-2xl font-bold grad-text">StockFlow</h1>
        </div>
        <div className="flex items-center gap-4 mb-5 px-1">
          <Bell className="text-slate-400 hover:text-white" />
          <ThemeToggle className="text-slate-400 hover:text-white" />
          {lang}
        </div>
        {items.map(({ h, k, I }) => (
          <Link key={h} href={h} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all hover:translate-x-1 ${active(h) ? "bg-gradient-to-r from-indigo-500/30 to-fuchsia-500/20 border border-white/10" : "hover:bg-white/5 text-slate-400"}`}>
            <I size={18} />{t(k)}
          </Link>
        ))}
        <div className="mt-auto pt-4">
          <div className="glass p-3 flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 grid place-items-center font-bold">{name[0]}</span>
            <div className="flex-1 min-w-0 text-sm"><p className="truncate">{name}</p><p className="text-xs text-slate-400">{role}</p></div>
            <Link href="/account" title="Change password" className="text-slate-400 hover:text-white"><KeyRound size={18} /></Link>
            <button onClick={out} title="Logout" className="text-slate-400 hover:text-rose-400"><LogOut size={18} /></button>
          </div>
        </div>
      </aside>
      <header className="md:hidden fixed top-0 inset-x-0 glass !rounded-none flex items-center justify-between px-4 py-3 z-40">
        <div className="flex items-center gap-2"><Boxes size={20} className="text-indigo-400" /><span className="font-bold grad-text text-lg">StockFlow</span></div>
        <div className="flex items-center gap-3">
          <Bell className="text-slate-400" />
          <ThemeToggle className="text-slate-400" />
          {lang}
          <Link href="/account" className="text-slate-400"><KeyRound size={16} /></Link>
        </div>
      </header>
      <nav className="md:hidden fixed bottom-0 inset-x-0 glass !rounded-none flex overflow-x-auto py-2 z-40">
        {items.map(({ h, k, I }) => (
          <Link key={h} href={h} className={`flex-1 shrink-0 min-w-[64px] flex flex-col items-center text-[10px] py-1 rounded-xl transition ${active(h) ? "text-indigo-300 bg-white/10" : "text-slate-400"}`}>
            <I size={20} /><span className="max-w-[60px] truncate">{t(k)}</span>
          </Link>
        ))}
        <button onClick={out} className="flex-1 shrink-0 min-w-[64px] flex flex-col items-center text-[10px] py-1 text-slate-400"><LogOut size={20} />Exit</button>
      </nav>
    </>
  );
}