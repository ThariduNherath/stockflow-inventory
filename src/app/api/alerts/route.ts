import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { session } from "@/lib/auth";
export const dynamic = "force-dynamic";
export async function GET() {
  const s = await session();
  if (!s) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const ps = await db.product.findMany();
  const low = ps.filter((p) => p.qty <= p.minQty).sort((a, b) => a.qty - b.qty);
  return NextResponse.json({ count: low.length, items: low.slice(0, 10).map((p) => ({ id: p.id, name: p.name, qty: p.qty, minQty: p.minQty })) });
}