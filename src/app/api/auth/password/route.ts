import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { session } from "@/lib/auth";
import { audit } from "@/lib/audit";
export const dynamic = "force-dynamic";
export async function GET() {
  const s = await session();
  if (!s) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ mustChange: !!s.mustChange });
}
export async function POST(req: Request) {
  const s = await session();
  if (!s) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { current, next } = await req.json();
  if (typeof current !== "string" || typeof next !== "string")
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  if (next.length < 8) return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
  if (next === current) return NextResponse.json({ error: "New password must be different" }, { status: 400 });
  const u = await db.user.findUnique({ where: { id: s.id } });
  if (!u || !(await bcrypt.compare(current, u.password)))
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
  await db.user.update({ where: { id: u.id }, data: { password: await bcrypt.hash(next, 10), mustChange: false } });
  await audit(s, "PASSWORD", "User", "Changed own password");
  return NextResponse.json({ ok: true });
}