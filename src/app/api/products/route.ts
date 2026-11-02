import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { session } from "@/lib/auth";
import { parse } from "@/lib/product";
import { audit } from "@/lib/audit";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const s = await session();
  if (!s) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const sp = new URL(req.url).searchParams;
  const q = sp.get("q") || "", cat = sp.get("cat") || "", low = sp.get("low") === "1";
  const sort = sp.get("sort") || "new", dir = sp.get("dir") === "asc" ? 1 : -1;
  const paged = sp.has("page");
  const size = Math.min(100, Math.max(1, Number(sp.get("size")) || 12));
  const page = Math.max(1, Number(sp.get("page")) || 1);
  let items = await db.product.findMany({
    where: q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { sku: { contains: q, mode: "insensitive" } }] } : {},
    include: { category: true, supplier: { select: { id: true, name: true } } },
  });
  const cats = (await db.category.findMany({ orderBy: { name: "asc" } })).map((c) => c.name);
  if (cat) items = items.filter((p) => p.category?.name === cat);
  if (low) items = items.filter((p) => p.qty <= p.minQty);
  const val = (p: any) => sort === "name" ? p.name.toLowerCase() : sort === "price" ? Number(p.price) : sort === "qty" ? p.qty : p.createdAt.getTime();
  items.sort((a, b) => { const x = val(a), y = val(b); return (x > y ? 1 : x < y ? -1 : 0) * dir; });
  const total = items.length;
  if (paged) items = items.slice((page - 1) * size, page * size);
  return NextResponse.json({ items, total, pages: Math.max(1, Math.ceil(total / size)), cats, role: s.role });
}
export async function POST(req: Request) {
  const s = await session();
  if (!s || s.role === "STAFF") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const p = await db.product.create({ data: await parse(await req.json()) });
    await audit(s, "CREATE", "Product", p.sku + " " + p.name);
    return NextResponse.json(p);
  } catch (e: any) {
    return NextResponse.json({ error: e.code === "P2002" ? "SKU already exists" : "Invalid data" }, { status: 400 });
  }
}