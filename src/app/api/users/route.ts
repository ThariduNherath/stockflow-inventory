import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { session } from "@/lib/auth";
export const dynamic = "force-dynamic";
const schema = z.object({
  email: z.string().email(), name: z.string().min(1),
  password: z.string().min(6), role: z.enum(["ADMIN", "MANAGER", "STAFF"]),
});
export async function GET() {
  const s = await session();
  if (!s || s.role !== "ADMIN") return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const items = await db.user.findMany({
    select: { id: true, email: true, name: true, role: true, active: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ items, me: s.id });
}
export async function POST(req: Request) {
  const s = await session();
  if (!s || s.role !== "ADMIN") return NextResponse.json({ error: "Admin only" }, { status: 403 });
  try {
    const d = schema.parse(await req.json());
    await db.user.create({ data: { ...d, email: d.email.toLowerCase(), password: await bcrypt.hash(d.password, 10) } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.code === "P2002" ? "Email already exists" : "Invalid data (password min 6)" }, { status: 400 });
  }
}