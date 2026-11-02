import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { session } from "@/lib/auth";
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const s = await session();
  if (!s || s.role !== "ADMIN") return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const { role, active, password } = await req.json();
  const data: any = {};
  if (["ADMIN", "MANAGER", "STAFF"].includes(role)) data.role = role;
  if (typeof active === "boolean") data.active = active;
  if (password) {
    if (String(password).length < 6) return NextResponse.json({ error: "Password min 6 chars" }, { status: 400 });
    data.password = await bcrypt.hash(String(password), 10);
  }
  if (params.id === s.id && (data.active === false || (data.role && data.role !== "ADMIN")))
    return NextResponse.json({ error: "You cannot change your own role/status" }, { status: 400 });
  try {
    await db.user.update({ where: { id: params.id }, data });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
}