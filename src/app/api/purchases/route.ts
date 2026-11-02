import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { session } from "@/lib/auth";
import { audit } from "@/lib/audit";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const s = await session();
  if (!s) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (s.role === "STAFF") return NextResponse.json({ error: "Managers and Admins only" }, { status: 403 });
  const st = new URL(req.url).searchParams.get("status");
  const where: any = {};
  if (st === "ORDERED" || st === "RECEIVED" || st === "CANCELLED") where.status = st;
  const items = await db.purchaseOrder.findMany({
    where, orderBy: { createdAt: "desc" }, take: 200,
    include: { items: true, supplier: { select: { name: true } }, user: { select: { name: true } } },
  });
  return NextResponse.json({ items });
}
export async function POST(req: Request) {
  const s = await session();
  if (!s || s.role === "STAFF") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  const sup = await db.supplier.findUnique({ where: { id: String(body.supplierId || "") } });
  if (!sup) return NextResponse.json({ error: "Select a supplier" }, { status: 400 });
  const map = new Map<string, { qty: number; cost: number }>();
  for (const i of Array.isArray(body.items) ? body.items : []) {
    const qty = Math.floor(Number(i.qty)), cost = Number(i.cost);
    if (!i.productId || !(qty > 0) || !(cost >= 0)) return NextResponse.json({ error: "Invalid items" }, { status: 400 });
    map.set(i.productId, { qty, cost });
  }
  if (map.size === 0) return NextResponse.json({ error: "Add at least one product" }, { status: 400 });
  const ids = Array.from(map.keys());
  const ps = await db.product.findMany({ where: { id: { in: ids } } });
  if (ps.length !== ids.length) return NextResponse.json({ error: "Product not found" }, { status: 400 });
  let total = 0;
  const lines = ps.map((p) => { const l = map.get(p.id)!; total += l.cost * l.qty; return { productId: p.id, name: p.name, cost: l.cost, qty: l.qty }; });
  const po = await db.purchaseOrder.create({
    data: { supplierId: sup.id, note: String(body.note || "").trim() || null, total: Math.round(total * 100) / 100, userId: s.id, items: { create: lines } },
  });
  await audit(s, "CREATE", "PurchaseOrder", "PO #" + po.no + " " + sup.name + " $" + Number(po.total).toFixed(2));
  return NextResponse.json(po);
}