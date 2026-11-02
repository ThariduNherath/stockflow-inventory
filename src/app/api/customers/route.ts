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
export async function GET() {
  const s = await session();
  if (!s) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const cs = await db.customer.findMany({ orderBy: { name: "asc" }, include: { orders: { select: { total: true, status: true } } } });
  const items = cs.map((c) => {
    const ok = c.orders.filter((o) => o.status !== "CANCELLED");
    return { id: c.id, name: c.name, phone: c.phone, email: c.email, address: c.address, orders: ok.length, spent: Math.round(ok.reduce((a, o) => a + Number(o.total), 0) * 100) / 100 };
  });
  return NextResponse.json({ items, role: s.role });
}
export async function POST(req: Request) {
  const s = await session();
  if (!s) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const d = schema.parse(await req.json());
    const c = await db.customer.create({ data: { name: d.name, phone: d.phone || null, email: d.email || null, address: d.address || null } });
    await audit(s, "CREATE", "Customer", c.name);
    return NextResponse.json(c);
  } catch {
    return NextResponse.json({ error: "Invalid data (name required, valid email)" }, { status: 400 });
  }
}