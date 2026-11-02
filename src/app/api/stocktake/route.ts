import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { session } from "@/lib/auth";
import { audit } from "@/lib/audit";
export async function POST(req: Request) {
  const s = await session();
  if (!s || s.role === "STAFF") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  const note = String(body.note || "").trim();
  const lines = Array.isArray(body.lines) ? body.lines : [];
  if (lines.length === 0) return NextResponse.json({ error: "Nothing to adjust" }, { status: 400 });
  let adjusted = 0;
  try {
    await db.$transaction(async (tx) => {
      for (const l of lines) {
        const counted = Math.floor(Number(l.counted));
        if (!l.productId || !(counted >= 0)) throw new Error("Invalid count");
        const p = await tx.product.findUnique({ where: { id: String(l.productId) } });
        if (!p) throw new Error("Product not found");
        const diff = counted - p.qty;
        if (diff === 0) continue;
        await tx.product.update({ where: { id: p.id }, data: { qty: counted } });
        await tx.stockMove.create({ data: { type: diff > 0 ? "IN" : "OUT", qty: Math.abs(diff), note: "Stock take" + (note ? ": " + note : ""), productId: p.id, userId: s.id } });
        adjusted++;
      }
    });
    await audit(s, "UPDATE", "StockTake", adjusted + " product(s) adjusted" + (note ? " - " + note : ""));
    return NextResponse.json({ adjusted });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed" }, { status: 400 });
  }
}