"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, Truck, History, BarChart3, Users, LogOut, Boxes, KeyRound } from "lucide-react";
const all: any[] = [
  { h: "/", t: "Home", I: LayoutDashboard },
  { h: "/products", t: "Products", I: Package },
  { h: "/orders", t: "Orders", I: ShoppingCart },
  { h: "/suppliers", t: "Suppliers", I: Truck },
  { h: "/history", t: "History", I: History },
  { h: "/reports", t: "Reports", I: BarChart3, mgr: true },
  { h: "/users", t: "Users", I: Users, admin: true },
];
export default function Nav({ name, role }: { name: string; role: string }) {
  const p = usePathname(), r = useRouter();
  const items = all.filter((i) => (!i.admin || role === "ADMIN") && (!i.mgr || role !== "STAFF"));
  const out = async () => { await fetch("/api/auth/logout", { method: "POST" }); r.push("/login"); r.refresh(); };
  return (
    <>
      <aside className="hidden md:flex fixed inset-y-0 w-60 glass !rounded-none flex-col p-5 z-30">
        <div className="flex items-center gap-2 mb-8">
          <span className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500"><Boxes size={20} /></span>
          <h1 className="text-2xl font-bold grad-text">StockFlow</h1>
        </div>
        {items.map(({ h, t, I }) => (
          <Link key={h} href={h} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all hover:translate-x-1 ${p === h ? "bg-gradient-to-r from-indigo-500/30 to-fuchsia-500/20 border border-white/10" : "hover:bg-white/5 text-slate-400"}`}>
            <I size={18} />{h === "/" ? "Dashboard" : t}
          </Link>
        ))}
        <div className="mt-auto glass p-3 flex items-center gap-3">
          <span className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 grid place-items-center font-bold">{name[0]}</span>
          <div className="flex-1 min-w-0 text-sm"><p className="truncate">{name}</p><p className="text-xs text-slate-400">{role}</p></div>
          <Link href="/account" title="Change password" className="text-slate-400 hover:text-white"><KeyRound size={18} /></Link>
          <button onClick={out} title="Logout" className="text-slate-400 hover:text-rose-400"><LogOut size={18} /></button>
        </div>
      </aside>
      <header className="md:hidden fixed top-0 inset-x-0 glass !rounded-none flex items-center justify-between px-4 py-3 z-40">
        <div className="flex items-center gap-2"><Boxes size={20} className="text-indigo-400" /><span className="font-bold grad-text text-lg">StockFlow</span></div>
        <Link href="/account" className="text-xs text-slate-400 flex items-center gap-1"><KeyRound size={14} />{name} &middot; {role}</Link>
      </header>
      <nav className="md:hidden fixed bottom-0 inset-x-0 glass !rounded-none flex overflow-x-auto py-2 z-40">
        {items.map(({ h, t, I }) => (
          <Link key={h} href={h} className={`flex-1 shrink-0 min-w-[60px] flex flex-col items-center text-[10px] py-1 rounded-xl transition ${p === h ? "text-indigo-300 bg-white/10" : "text-slate-400"}`}>
            <I size={20} />{t}
          </Link>
        ))}
        <button onClick={out} className="flex-1 shrink-0 min-w-[60px] flex flex-col items-center text-[10px] py-1 text-slate-400"><LogOut size={20} />Exit</button>
      </nav>
    </>
  );
}