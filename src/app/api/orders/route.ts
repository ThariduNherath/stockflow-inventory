import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { session } from "@/lib/auth";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const s = await session();
  if (!s) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const st = new URL(req.url).searchParams.get("status");
  const where: any = {};
  if (st === "PENDING" || st === "PAID" || st === "CANCELLED") where.status = st;
  const items = await db.order.findMany({
    where, orderBy: { createdAt: "desc" }, take: 200,
    include: { items: true, user: { select: { name: true } } },
  });
  return NextResponse.json({ items, role: s.role });
}
export async function POST(req: Request) {
  const s = await session();
  if (!s) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  const customer = String(body.customer || "").trim() || "Walk-in";
  const map = new Map<string, number>();
  for (const i of Array.isArray(body.items) ? body.items : []) {
    const q = Math.floor(Number(i.qty));
    if (!i.productId || !(q > 0)) return NextResponse.json({ error: "Invalid items" }, { status: 400 });
    map.set(i.productId, (map.get(i.productId) || 0) + q);
  }
  if (map.size === 0) return NextResponse.json({ error: "Add at least one product" }, { status: 400 });
  try {
    const order = await db.$transaction(async (tx) => {
      const o = await tx.order.create({ data: { customer, status: body.paid ? "PAID" : "PENDING", total: 0, userId: s.id } });
      let total = 0;
      for (const [pid, q] of Array.from(map.entries())) {
        const p = await tx.product.findUnique({ where: { id: pid } });
        if (!p) throw new Error("Product not found");
        const r = await tx.product.updateMany({ where: { id: pid, qty: { gte: q } }, data: { qty: { decrement: q } } });
        if (r.count === 0) throw new Error("Insufficient stock: " + p.name);
        await tx.stockMove.create({ data: { type: "OUT", qty: q, note: "Order #" + o.no, productId: pid, userId: s.id } });
        const price = Number(p.price);
        await tx.orderItem.create({ data: { orderId: o.id, productId: pid, name: p.name, price, qty: q } });
        total += price * q;
      }
      return tx.order.update({ where: { id: o.id }, data: { total: Math.round(total * 100) / 100 } });
    });
    return NextResponse.json(order);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed" }, { status: 400 });
  }
}