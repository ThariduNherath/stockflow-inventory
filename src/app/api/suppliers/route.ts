import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { session } from "@/lib/auth";
export const dynamic = "force-dynamic";
const supplierSchema = z.object({
  name: z.string().trim().min(1),
  phone: z.string().trim().optional().nullable(),
  email: z.string().trim().email().optional().nullable().or(z.literal("")),
  address: z.string().trim().optional().nullable(),
});
export async function GET() {
  const s = await session();
  if (!s) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const items = await db.supplier.findMany({
    orderBy: { name: "asc" }, include: { _count: { select: { products: true } } },
  });
  return NextResponse.json({ items, role: s.role });
}
export async function POST(req: Request) {
  const s = await session();
  if (!s || s.role === "STAFF") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const d = supplierSchema.parse(await req.json());
    return NextResponse.json(await db.supplier.create({ data: { name: d.name, phone: d.phone || null, email: d.email || null, address: d.address || null } }));
  } catch {
    return NextResponse.json({ error: "Invalid data (name required, valid email)" }, { status: 400 });
  }
}