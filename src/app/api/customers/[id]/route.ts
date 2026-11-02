import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { session } from "@/lib/auth";
import { audit } from "@/lib/audit";
export const dynamic = "force-dynamic";
const schema = z.object({
  name: z.string().trim().min(1),
  phone: z.string().trim().optional().nullable(),
  email: z.string().trim().email().optional().nullable().or(z.literal("")),
  address: z.string().trim().optional().nullable(),
});
type Ctx = { params: { id: string } };
export async function GET(_: Request, { params }: Ctx) {
  const s = await session();
  if (!s) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const orders = await db.order.findMany({ where: { customerId: params.id }, orderBy: { createdAt: "desc" }, take: 20, select: { id: true, no: true, total: true, status: true, createdAt: true } });
  return NextResponse.json({ orders });
}
export async function PUT(req: Request, { params }: Ctx) {
  const s = await session();
  if (!s || s.role === "STAFF") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const d = schema.parse(await req.json());
    const c = await db.customer.update({ where: { id: params.id }, data: { name: d.name, phone: d.phone || null, email: d.email || null, address: d.address || null } });
    await db.order.updateMany({ where: { customerId: c.id }, data: { customer: c.name } });
    await audit(s, "UPDATE", "Customer", c.name);
    return NextResponse.json(c);
  } catch {
    return NextResponse.json({ error: "Invalid data (name required, valid email)" }, { status: 400 });
  }
}
export async function DELETE(_: Request, { params }: Ctx) {
  const s = await session();
  if (!s || s.role !== "ADMIN") return NextResponse.json({ error: "Admin only" }, { status: 403 });
  try {
    const c = await db.customer.delete({ where: { id: params.id } });
    await audit(s, "DELETE", "Customer", c.name);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }
}