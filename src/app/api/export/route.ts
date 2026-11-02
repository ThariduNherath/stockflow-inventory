import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { session } from "@/lib/auth";
import { csv } from "@/lib/csv";
import { range } from "@/lib/range";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const s = await session();
  if (!s) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (s.role === "STAFF") return NextResponse.json({ error: "Managers and Admins only" }, { status: 403 });
  const sp = new URL(req.url).searchParams;
  const type = sp.get("type");
  const { from, to } = range(sp);
  const when = { gte: from, lte: to };
  let rows: (string | number | null)[][];
  if (type === "products") {
    const ps = await db.product.findMany({ include: { category: true, supplier: true }, orderBy: { name: "asc" } });
    rows = [["SKU", "Name", "Category", "Supplier", "Price", "Qty", "Min Qty", "Stock Value"],
      ...ps.map((p) => [p.sku, p.name, p.category?.name || "", p.supplier?.name || "", Number(p.price), p.qty, p.minQty, Math.round(Number(p.price) * p.qty * 100) / 100])];
  } else if (type === "orders") {
    const os = await db.order.findMany({ where: { createdAt: when }, include: { items: true, user: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 50000 });
    rows = [["Order No", "Date", "Customer", "Status", "Items", "Total", "Created By"],
      ...os.map((o) => [o.no, o.createdAt.toISOString(), o.customer, o.status, o.items.map((i) => i.name + " x" + i.qty).join("; "), Number(o.total), o.user.name])];
  } else if (type === "history") {
    const ms = await db.stockMove.findMany({ where: { createdAt: when }, include: { product: { select: { name: true, sku: true } }, user: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 50000 });
    rows = [["Date", "Type", "Product", "SKU", "Qty", "Note", "User"],
      ...ms.map((m) => [m.createdAt.toISOString(), m.type, m.product.name, m.product.sku, m.qty, m.note || "", m.user.name])];
  } else {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }
  return new Response(csv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="' + type + "-" + new Date().toISOString().slice(0, 10) + '.csv"',
    },
  });
}