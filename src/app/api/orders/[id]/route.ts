import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { session } from "@/lib/auth";
import { audit } from "@/lib/audit";
export const dynamic = "force-dynamic";
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const s = await session();
  if (!s) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const o = await db.order.findUnique({ where: { id: params.id }, include: { items: true, user: { select: { name: true } }, customerRef: true } });
  if (!o) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json(o);
}
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const s = await session();
  if (!s) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { status } = await req.json();
  if (!["PENDING", "PAID", "CANCELLED"].includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  if (status === "CANCELLED" && s.role === "STAFF") return NextResponse.json({ error: "Only Admin/Manager can cancel" }, { status: 403 });
  let no = 0;
  try {
    await db.$transaction(async (tx) => {
      const o = await tx.order.findUnique({ where: { id: params.id }, include: { items: true } });
      if (!o) throw new Error("Order not found");
      if (o.status === "CANCELLED") throw new Error("Order already cancelled");
      no = o.no;
      if (status === "CANCELLED") {
        for (const i of o.items) {
          if (!i.productId) continue;
          await tx.product.update({ where: { id: i.productId }, data: { qty: { increment: i.qty } } });
          await tx.stockMove.create({ data: { type: "IN", qty: i.qty, note: "Order #" + o.no + " cancelled", productId: i.productId, userId: s.id } });
        }
      }
      await tx.order.update({ where: { id: o.id }, data: { status } });
    });
    await audit(s, "STATUS", "Order", "#" + no + " -> " + status);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed" }, { status: 400 });
  }
}