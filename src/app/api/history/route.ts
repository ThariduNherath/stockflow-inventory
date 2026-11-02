import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { session } from "@/lib/auth";
export const dynamic = "force-dynamic";
const SIZE = 15;
export async function GET(req: Request) {
  if (!(await session())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const sp = new URL(req.url).searchParams;
  const type = sp.get("type"), q = sp.get("q") || "";
  const page = Math.max(1, Number(sp.get("page")) || 1);
  const where: any = {};
  if (type === "IN" || type === "OUT") where.type = type;
  if (q) where.product = { OR: [{ name: { contains: q, mode: "insensitive" } }, { sku: { contains: q, mode: "insensitive" } }] };
  const [total, items] = await Promise.all([
    db.stockMove.count({ where }),
    db.stockMove.findMany({
      where, orderBy: { createdAt: "desc" }, skip: (page - 1) * SIZE, take: SIZE,
      include: { product: { select: { name: true, sku: true } }, user: { select: { name: true } } },
    }),
  ]);
  return NextResponse.json({ items, pages: Math.max(1, Math.ceil(total / SIZE)), total });
}