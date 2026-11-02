import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { session } from "@/lib/auth";
import { parse } from "@/lib/product";
type Ctx = { params: { id: string } };
export async function PUT(req: Request, { params }: Ctx) {
  const s = await session();
  if (!s || s.role === "STAFF") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const { qty, ...data } = await parse(await req.json()); // qty වෙනස් කරන්නේ stock moves වලින්
    return NextResponse.json(await db.product.update({ where: { id: params.id }, data }));
  } catch (e: any) {
    return NextResponse.json({ error: e.code === "P2002" ? "SKU already exists" : "Invalid data" }, { status: 400 });
  }
}
export async function DELETE(_: Request, { params }: Ctx) {
  const s = await session();
  if (!s || s.role !== "ADMIN") return NextResponse.json({ error: "Admin only" }, { status: 403 });
  await db.$transaction([
    db.stockMove.deleteMany({ where: { productId: params.id } }),
    db.product.delete({ where: { id: params.id } }),
  ]);
  return NextResponse.json({ ok: true });
}