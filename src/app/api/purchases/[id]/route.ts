import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { session } from "@/lib/auth";
import { audit } from "@/lib/audit";
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const s = await session();
  if (!s || s.role === "STAFF") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { action } = await req.json().catch(() => ({}));
  if (action !== "receive" && action !== "cancel") return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  let no = 0;
  try {
    await db.$transaction(async (tx) => {
      const po = await tx.purchaseOrder.findUnique({ where: { id: params.id }, include: { items: true } });
      if (!po) throw new Error("Purchase order not found");
      no = po.no;
      const r = await tx.purchaseOrder.updateMany({
        where: { id: po.id, status: "ORDERED" },
        data: { status: action === "receive" ? "RECEIVED" : "CANCELLED", receivedAt: action === "receive" ? new Date() : null },
      });
      if (r.count === 0) throw new Error("Order is no longer in ORDERED state");
      if (action === "receive") {
        for (const i of po.items) {
          if (!i.productId) continue;
          await tx.product.update({ where: { id: i.productId }, data: { qty: { increment: i.qty } } });
          await tx.stockMove.create({ data: { type: "IN", qty: i.qty, note: "PO #" + po.no + " received", productId: i.productId, userId: s.id } });
        }
      }
    });
    await audit(s, "STATUS", "PurchaseOrder", "PO #" + no + " -> " + (action === "receive" ? "RECEIVED" : "CANCELLED"));
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed" }, { status: 400 });
  }
}