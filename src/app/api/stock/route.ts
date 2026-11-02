import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { session } from "@/lib/auth";
export async function POST(req: Request) {
  const s = await session();
  if (!s) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { productId, type, qty, note } = await req.json();
  const q = Math.floor(Number(qty));
  if (!(q > 0) || !["IN", "OUT"].includes(type)) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  try {
    await db.$transaction(async (tx) => {
      const p = await tx.product.findUnique({ where: { id: productId } });
      if (!p) throw new Error("Product not found");
      if (type === "OUT" && p.qty < q) throw new Error("Insufficient stock");
      await tx.product.update({ where: { id: productId }, data: { qty: type === "IN" ? { increment: q } : { decrement: q } } });
      await tx.stockMove.create({ data: { type, qty: q, note, productId, userId: s.id } });
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}