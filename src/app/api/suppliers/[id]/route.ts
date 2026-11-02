import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { session } from "@/lib/auth";
const schema = z.object({
  name: z.string().trim().min(1),
  phone: z.string().trim().optional().nullable(),
  email: z.string().trim().email().optional().nullable().or(z.literal("")),
  address: z.string().trim().optional().nullable(),
});
type Ctx = { params: { id: string } };
export async function PUT(req: Request, { params }: Ctx) {
  const s = await session();
  if (!s || s.role === "STAFF") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const d = schema.parse(await req.json());
    return NextResponse.json(await db.supplier.update({ where: { id: params.id }, data: { name: d.name, phone: d.phone || null, email: d.email || null, address: d.address || null } }));
  } catch {
    return NextResponse.json({ error: "Invalid data (name required, valid email)" }, { status: 400 });
  }
}
export async function DELETE(_: Request, { params }: Ctx) {
  const s = await session();
  if (!s || s.role !== "ADMIN") return NextResponse.json({ error: "Admin only" }, { status: 403 });
  try {
    await db.supplier.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
  }
}