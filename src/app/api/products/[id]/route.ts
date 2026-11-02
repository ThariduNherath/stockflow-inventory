import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { session } from "@/lib/auth";
import { parse } from "@/lib/product";
import { audit } from "@/lib/audit";
type Ctx = { params: { id: string } };
export const dynamic = "force-dynamic";
export async function GET(_: Request, { params }: Ctx) {
  const s = await session();
  if (!s) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const p = await db.product.findUnique({ where: { id: params.id }, include: { category: true, supplier: { select: { id: true, name: true } } } });
  if (!p) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  const start = new Date(); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - 29);
  const [recent, mv] = await Promise.all([
    db.stockMove.findMany({ where: { productId: p.id }, orderBy: { createdAt: "desc" }, take: 25, include: { user: { select: { name: true } } } }),
    db.stockMove.findMany({ where: { productId: p.id, createdAt: { gte: start } } }),
  ]);
  let in30 = 0, out30 = 0;
  for (const m of mv) { if (m.type === "IN") in30 += m.qty; else out30 += m.qty; }
  let level = p.qty;
  const chart: { day: string; qty: number }[] = [];
  for (let i = 0; i < 30; i++) {
    const day = new Date(); day.setHours(0, 0, 0, 0); day.setDate(day.getDate() - i);
    const next = new Date(day); next.setDate(next.getDate() + 1);
    chart.unshift({ day: (day.getMonth() + 1) + "/" + day.getDate(), qty: level });
    for (const m of mv) if (m.createdAt >= day && m.createdAt < next) level += m.type === "IN" ? -m.qty : m.qty;
  }
  return NextResponse.json({ product: p, chart, moves: recent, in30, out30 });
}
export async function PUT(req: Request, { params }: Ctx) {
  const s = await session();
  if (!s || s.role === "STAFF") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const { qty, ...data } = await parse(await req.json());
    const p = await db.product.update({ where: { id: params.id }, data });
    await audit(s, "UPDATE", "Product", p.sku + " " + p.name);
    return NextResponse.json(p);
  } catch (e: any) {
    return NextResponse.json({ error: e.code === "P2002" ? "SKU already exists" : "Invalid data" }, { status: 400 });
  }
}
export async function DELETE(_: Request, { params }: Ctx) {
  const s = await session();
  if (!s || s.role !== "ADMIN") return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const p = await db.product.findUnique({ where: { id: params.id } });
  if (!p) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  await db.$transaction([
    db.stockMove.deleteMany({ where: { productId: params.id } }),
    db.product.delete({ where: { id: params.id } }),
  ]);
  await audit(s, "DELETE", "Product", p.sku + " " + p.name);
  return NextResponse.json({ ok: true });
}