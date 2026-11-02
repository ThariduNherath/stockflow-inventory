import { NextResponse } from "next/server";
import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() {
  const ps = await db.product.findMany();
  const since = new Date(Date.now() - 6 * 864e5);
  since.setHours(0, 0, 0, 0);
  const mv = await db.stockMove.findMany({ where: { createdAt: { gte: since } } });
  const chart = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(since.getTime() + i * 864e5);
    const m = mv.filter((x) => x.createdAt.toDateString() === d.toDateString());
    const sum = (t: string) => m.filter((x) => x.type === t).reduce((a, x) => a + x.qty, 0);
    return { day: d.toLocaleDateString("en", { weekday: "short" }), in: sum("IN"), out: sum("OUT") };
  });
  const dayStart = new Date(); dayStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(dayStart.getFullYear(), dayStart.getMonth(), 1);
  const [t, m] = await Promise.all([
    db.order.aggregate({ _sum: { total: true }, _count: true, where: { status: { not: "CANCELLED" }, createdAt: { gte: dayStart } } }),
    db.order.aggregate({ _sum: { total: true }, where: { status: "PAID", createdAt: { gte: monthStart } } }),
  ]);
  return NextResponse.json({
    count: ps.length,
    units: ps.reduce((a, p) => a + p.qty, 0),
    value: Math.round(ps.reduce((a, p) => a + Number(p.price) * p.qty, 0)),
    low: ps.filter((p) => p.qty <= p.minQty).map(({ id, name, qty }) => ({ id, name, qty })),
    today: Math.round(Number(t._sum.total || 0)),
    todayCount: t._count,
    month: Math.round(Number(m._sum.total || 0)),
    chart,
  });
}