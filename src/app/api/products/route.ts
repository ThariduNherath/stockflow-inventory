import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { session } from "@/lib/auth";
import { parse } from "@/lib/product";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const s = await session();
  if (!s) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const q = new URL(req.url).searchParams.get("q") || "";
  const items = await db.product.findMany({
    where: q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { sku: { contains: q, mode: "insensitive" } }] } : {},
    include: { category: true, supplier: { select: { id: true, name: true } } }, orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ items, role: s.role });
}
export async function POST(req: Request) {
  const s = await session();
  if (!s || s.role === "STAFF") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    return NextResponse.json(await db.product.create({ data: await parse(await req.json()) }));
  } catch (e: any) {
    return NextResponse.json({ error: e.code === "P2002" ? "SKU already exists" : "Invalid data" }, { status: 400 });
  }
}