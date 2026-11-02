import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { session } from "@/lib/auth";
import { range, dayKey } from "@/lib/range";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const s = await session();
  if (!s) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (s.role === "STAFF") return NextResponse.json({ error: "Managers and Admins only" }, { status: 403 });
  const { from, to } = range(new URL(req.url).searchParams);
  const where: any = { createdAt: { gte: from, lte: to }, status: { not: "CANCELLED" } };
  const [orders, cancelled, products] = await Promise.all([
    db.order.findMany({ where, include: { items: true } }),
    db.order.count({ where: { createdAt: { gte: from, lte: to }, status: "CANCELLED" } }),
    db.product.findMany(),
  ]);
  const days: Record<string, number> = {};
  let n = 0;
  for (const d = new Date(from); d <= to && n < 366; d.setDate(d.getDate() + 1), n++) days[dayKey(d)] = 0;
  let revenue = 0, paid = 0, pending = 0;
  const top: Record<string, { name: string; qty: number; revenue: number }> = {};
  for (const o of orders) {
    const t = Number(o.total);
    revenue += t;
    if (o.status === "PAID") paid += t; else pending += t;
    const k = dayKey(o.createdAt);
    if (k in days) days[k] += t;
    for (const i of o.items) {
      const e = top[i.name] || (top[i.name] = { name: i.name, qty: 0, revenue: 0 });
      e.qty += i.qty;
      e.revenue += Number(i.price) * i.qty;
    }
  }
  const r2 = (x: number) => Math.round(x * 100) / 100;
  return NextResponse.json({
    revenue: r2(revenue), paid: r2(paid), pending: r2(pending),
    orders: orders.length, cancelled,
    avg: orders.length ? r2(revenue / orders.length) : 0,
    daily: Object.keys(days).map((k) => ({ day: k, total: r2(days[k]) })),
    top: Object.values(top).sort((a, b) => b.revenue - a.revenue).slice(0, 5).map((e) => ({ ...e, revenue: r2(e.revenue) })),
    stockValue: r2(products.reduce((a, p) => a + Number(p.price) * p.qty, 0)),
    stockUnits: products.reduce((a, p) => a + p.qty, 0),
    lowCount: products.filter((p) => p.qty <= p.minQty).length,
  });
}